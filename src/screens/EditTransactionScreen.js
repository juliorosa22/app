import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useDataCache } from '../context/DataCacheContext';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import CurrencyInput from '../components/CurrencyInput';
import { useAuth } from '../context/AuthContext';
//import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../context/LanguageContext';

export default function EditTransactionScreen({ route, navigation }) {
  const { transaction } = route.params;
  const [editTransaction, setEditTransaction] = useState({ ...transaction });
  const [loading, setLoading] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const { updateTransaction, deleteTransaction, categories } = useDataCache();
  const { colors, spacing, typography, shadows } = useTheme();
  const { user } = useAuth();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  // Define currentCategories based on transaction type
  const currentCategories = categories[editTransaction.transaction_type] || [];

  // Date picker functions
  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleDateConfirm = (date) => {
    setEditTransaction({ ...editTransaction, date: date.toISOString().split('T')[0] });
    hideDatePicker();
  };

  // Transaction Type Selector
  const TransactionTypeSelector = () => (
    <View style={{ marginBottom: spacing.md }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 0 }}
      >
        <TouchableOpacity
          style={[
            styles.viewButton,
            { borderColor: colors.primary, backgroundColor: editTransaction.transaction_type === 'expense' ? colors.primary : colors.surface },
            editTransaction.transaction_type === 'expense' && styles.viewButtonActive
          ]}
          onPress={() => setEditTransaction({ ...editTransaction, transaction_type: 'expense', category: '' })}
        >
          <MaterialIcons name="money-off" size={20} color={editTransaction.transaction_type === 'expense' ? colors.textOnPrimary : colors.primary} />
          <Text style={[
            styles.viewButtonText,
            { color: editTransaction.transaction_type === 'expense' ? colors.textOnPrimary : colors.primary }
          ]}>{t('expense')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.viewButton,
            { borderColor: colors.primary, backgroundColor: editTransaction.transaction_type === 'income' ? colors.primary : colors.surface },
            editTransaction.transaction_type === 'income' && styles.viewButtonActive
          ]}
          onPress={() => setEditTransaction({ ...editTransaction, transaction_type: 'income', category: '' })}
        >
          <MaterialIcons name="attach-money" size={20} color={editTransaction.transaction_type === 'income' ? colors.textOnPrimary : colors.primary} />
          <Text style={[
            styles.viewButtonText,
            { color: editTransaction.transaction_type === 'income' ? colors.textOnPrimary : colors.primary }
          ]}>{t('income')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  // Update
  const handleUpdate = async () => {
    if (!editTransaction.description || !editTransaction.amount) {
      Alert.alert(t('error'), t('fill_required_fields'));
      return;
    }
    try {
      setLoading(true);
      const updateData = {
        amount: parseFloat(editTransaction.amount) || 0,
        description: editTransaction.description.trim(),
        category: editTransaction.category,
        merchant: editTransaction.merchant,
        date: editTransaction.date,
        transaction_type: editTransaction.transaction_type,
      };
      await updateTransaction(editTransaction.id, updateData);
      Alert.alert(t('success'), t('transaction_updated'));
      navigation.goBack();
    } catch (error) {
      Alert.alert(t('error'), t('update_failed'));
    } finally {
      setLoading(false);
    }
  };

  // Delete
  const handleDelete = async () => {
    Alert.alert(
      t('delete_confirm_title'),
      t('delete_confirm_message'),
      [
        { text: t('delete_cancel'), style: 'cancel' },
        {
          text: t('delete_confirm'), style: 'destructive', onPress: async () => {
            setLoading(true);
            await deleteTransaction(editTransaction.id);
            setLoading(false);
            Alert.alert(t('deleted'), t('transaction_deleted'));
            navigation.goBack();
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>{t('edit_transaction_title')}</Text>
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('description_label')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('description_placeholder')}
              placeholderTextColor={colors.textLight}
              value={editTransaction.description}
              onChangeText={text => setEditTransaction({ ...editTransaction, description: text })}
              maxLength={100}
            />
          </View>

          {/* Transaction Type Selector */}
          <TransactionTypeSelector />

          {/* Amount */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('amount_label')}</Text>
            <CurrencyInput
              value={editTransaction.amount}
              onValueChange={(value) => setEditTransaction({ ...editTransaction, amount: value })}
              currency={user?.currency || 'USD'}
              style={[styles.input, { color: colors.textPrimary || '#222' }]}
              placeholderTextColor={colors.textLight || '#999'}
              placeholder={t('amount_placeholder')}
            />
          </View>

          {/* Category Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('category_label')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4 }}>
              {currentCategories.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    editTransaction.category === cat && styles.categoryChipActive
                  ]}
                  onPress={() => setEditTransaction({ ...editTransaction, category: cat })}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.categoryChipText,
                    editTransaction.category === cat && styles.categoryChipTextActive
                  ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Merchant Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('merchant_label')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('merchant_placeholder')}
              placeholderTextColor={colors.textLight}
              value={editTransaction.merchant || ''}
              onChangeText={v => setEditTransaction({ ...editTransaction, merchant: v })}
              maxLength={50}
            />
          </View>

          {/* Date Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('date_label')}</Text>
            <TouchableOpacity
              onPress={showDatePicker}
              style={[
                styles.dateTimeRow,
                { borderColor: '#e0e0e0', backgroundColor: '#fff' }
              ]}
              activeOpacity={0.8}
            >
              <MaterialIcons name="event" size={22} color="#2196f3" style={{ marginRight: 8 }} />
              <Text style={{ color: '#222', fontSize: 16 }}>
                {editTransaction.date
                  ? new Date(editTransaction.date).toLocaleDateString()
                  : t('date_placeholder')}
              </Text>
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={handleDateConfirm}
              onCancel={hideDatePicker}
              display={Platform.OS === 'android' ? 'spinner' : 'default'}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
              { marginBottom: insets.bottom }
            ]}
            onPress={handleUpdate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.textOnPrimary} />
            ) : (
              <Text style={styles.submitButtonText}>{t('update_button')}</Text>
            )}
          </TouchableOpacity>
          {/* Delete Button */}
          <TouchableOpacity
            onPress={handleDelete}
            disabled={loading}
            style={[
              styles.submitButton,
              { backgroundColor: colors.error, marginBottom: insets.bottom }
            ]}
          >
            <Text style={styles.submitButtonText}>{t('delete_button')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196f3',
    marginBottom: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 6,
    color: '#222',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#222',
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: '#2196f3',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    elevation: 2,
  },
  submitButtonDisabled: {
    backgroundColor: '#90caf9',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  viewButtonActive: {
    // Optionally add shadow or elevation here
  },
  viewButtonText: {
    marginLeft: 6,
    fontWeight: 'bold',
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2196f3',
    backgroundColor: '#fff',
    marginRight: 8,
    marginBottom: 4,
  },
  categoryChipActive: {
    backgroundColor: '#2196f3',
  },
  categoryChipText: {
    color: '#2196f3',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 4,
    marginBottom: 4,
  },
});