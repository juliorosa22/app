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
  Platform
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import ApiService from '../services/api';

export default function QuickAddScreen({ navigation }) {
  const { colors, spacing, typography, shadows } = useTheme();
  const { user } = useAuth();
  
  // State for form mode
  const [activeTab, setActiveTab] = useState('transaction'); // 'transaction' or 'reminder'
  const [loading, setLoading] = useState(false);

  // Transaction form state
  const [transactionForm, setTransactionForm] = useState({
    description: '',
    amount: '',
    transaction_type: 'expense', // 'expense' or 'income'
    category: '',
    merchant: ''
  });

  // Reminder form state
  const [reminderForm, setReminderForm] = useState({
    title: '',
    description: '',
    due_date: '',
    due_time: '',
    priority: 'medium', // 'urgent', 'high', 'medium', 'low'
    reminder_type: 'general' // 'task', 'event', 'deadline', 'habit', 'general'
  });

  // Form validation
  const validateTransaction = () => {
    if (!transactionForm.description.trim()) {
      Alert.alert('Error', 'Description is required');
      return false;
    }
    if (!transactionForm.amount || parseFloat(transactionForm.amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return false;
    }
    return true;
  };

  const validateReminder = () => {
    if (!reminderForm.title.trim()) {
      Alert.alert('Error', 'Title is required');
      return false;
    }
    return true;
  };

  // Handle transaction creation
  const handleCreateTransaction = async () => {
    if (!validateTransaction()) return;

    setLoading(true);
    try {
      const result = await ApiService.createTransaction({
        description: transactionForm.description.trim(),
        amount: parseFloat(transactionForm.amount),
        transaction_type: transactionForm.transaction_type,
        category: transactionForm.category.trim() || null,
        merchant: transactionForm.merchant.trim() || null,
        date: new Date().toISOString()
      });

      if (result.success) {
        Alert.alert(
          'Success!',
          result.message,
          [
            {
              text: 'Add Another',
              onPress: () => {
                setTransactionForm({
                  description: '',
                  amount: '',
                  transaction_type: 'expense',
                  category: '',
                  merchant: ''
                });
              }
            },
            {
              text: 'View Transactions',
              onPress: () => navigation.navigate('Expenses')
            }
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to create transaction');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create transaction');
    } finally {
      setLoading(false);
    }
  };

  // Handle reminder creation
  const handleCreateReminder = async () => {
    if (!validateReminder()) return;

    setLoading(true);
    try {
      // Combine date and time if provided
      let due_datetime = null;
      if (reminderForm.due_date) {
        const dateStr = reminderForm.due_date;
        const timeStr = reminderForm.due_time || '09:00';
        due_datetime = new Date(`${dateStr}T${timeStr}:00`).toISOString();
      }

      const result = await ApiService.createReminder({
        title: reminderForm.title.trim(),
        description: reminderForm.description.trim() || reminderForm.title.trim(),
        due_datetime,
        priority: reminderForm.priority,
        reminder_type: reminderForm.reminder_type
      });

      if (result.success) {
        Alert.alert(
          'Success!',
          result.message,
          [
            {
              text: 'Add Another',
              onPress: () => {
                setReminderForm({
                  title: '',
                  description: '',
                  due_date: '',
                  due_time: '',
                  priority: 'medium',
                  reminder_type: 'general'
                });
              }
            },
            {
              text: 'View Reminders',
              onPress: () => navigation.navigate('Reminders')
            }
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to create reminder');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create reminder');
    } finally {
      setLoading(false);
    }
  };

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      padding: spacing.lg,
    },
    header: {
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    title: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: colors.primary,
      marginBottom: spacing.sm,
    },
    subtitle: {
      fontSize: typography.fontSize.base,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 12,
      padding: 4,
      marginBottom: spacing.xl,
    },
    tab: {
      flex: 1,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: 8,
      alignItems: 'center',
    },
    activeTab: {
      backgroundColor: colors.primary,
      ...shadows.sm,
    },
    tabText: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      color: colors.textSecondary,
    },
    activeTabText: {
      color: colors.textOnPrimary,
    },
    formContainer: {
      flex: 1,
    },
    inputGroup: {
      marginBottom: spacing.lg,
    },
    label: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },
    input: {
      height: 48,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: spacing.md,
      fontSize: typography.fontSize.base,
      color: colors.textPrimary,
      backgroundColor: colors.surface,
    },
    textArea: {
      height: 80,
      textAlignVertical: 'top',
      paddingTop: spacing.sm,
    },
    toggleContainer: {
      flexDirection: 'row',
      marginBottom: spacing.sm,
    },
    toggleButton: {
      flex: 1,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      marginHorizontal: 2,
    },
    toggleButtonFirst: {
      borderTopLeftRadius: 8,
      borderBottomLeftRadius: 8,
    },
    toggleButtonLast: {
      borderTopRightRadius: 8,
      borderBottomRightRadius: 8,
    },
    toggleButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    toggleText: {
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
    },
    toggleTextActive: {
      color: colors.textOnPrimary,
      fontWeight: typography.fontWeight.medium,
    },
    submitButton: {
      backgroundColor: colors.primary,
      height: 48,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: spacing.xl,
      ...shadows.md,
    },
    submitButtonDisabled: {
      backgroundColor: colors.secondaryLight,
    },
    submitButtonText: {
      color: colors.textOnPrimary,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
    },
    row: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    flex1: {
      flex: 1,
    },
  });

  const renderTransactionForm = () => (
    <View style={styles.formContainer}>
      {/* Transaction Type Toggle */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Type</Text>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              styles.toggleButtonFirst,
              transactionForm.transaction_type === 'expense' && styles.toggleButtonActive
            ]}
            onPress={() => setTransactionForm({...transactionForm, transaction_type: 'expense'})}
          >
            <Text style={[
              styles.toggleText,
              transactionForm.transaction_type === 'expense' && styles.toggleTextActive
            ]}>
              💸 Expense
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              styles.toggleButtonLast,
              transactionForm.transaction_type === 'income' && styles.toggleButtonActive
            ]}
            onPress={() => setTransactionForm({...transactionForm, transaction_type: 'income'})}
          >
            <Text style={[
              styles.toggleText,
              transactionForm.transaction_type === 'income' && styles.toggleTextActive
            ]}>
              💰 Income
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Description */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Coffee at Starbucks"
          placeholderTextColor={colors.textLight}
          value={transactionForm.description}
          onChangeText={(text) => setTransactionForm({...transactionForm, description: text})}
          maxLength={100}
        />
      </View>

      {/* Amount */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Amount * ({user?.currency || 'USD'})</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          placeholderTextColor={colors.textLight}
          value={transactionForm.amount}
          onChangeText={(text) => setTransactionForm({...transactionForm, amount: text})}
          keyboardType="decimal-pad"
          maxLength={10}
        />
      </View>

      {/* Optional Fields */}
      <View style={styles.row}>
        <View style={[styles.inputGroup, styles.flex1]}>
          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            placeholder="Auto-detected"
            placeholderTextColor={colors.textLight}
            value={transactionForm.category}
            onChangeText={(text) => setTransactionForm({...transactionForm, category: text})}
            maxLength={50}
          />
        </View>
        <View style={[styles.inputGroup, styles.flex1]}>
          <Text style={styles.label}>Merchant</Text>
          <TextInput
            style={styles.input}
            placeholder="Optional"
            placeholderTextColor={colors.textLight}
            value={transactionForm.merchant}
            onChangeText={(text) => setTransactionForm({...transactionForm, merchant: text})}
            maxLength={50}
          />
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleCreateTransaction}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.textOnPrimary} />
        ) : (
          <Text style={styles.submitButtonText}>
            Add {transactionForm.transaction_type === 'expense' ? 'Expense' : 'Income'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderReminderForm = () => (
    <View style={styles.formContainer}>
      {/* Title */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Call mom"
          placeholderTextColor={colors.textLight}
          value={reminderForm.title}
          onChangeText={(text) => setReminderForm({...reminderForm, title: text})}
          maxLength={100}
        />
      </View>

      {/* Description */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Additional details..."
          placeholderTextColor={colors.textLight}
          value={reminderForm.description}
          onChangeText={(text) => setReminderForm({...reminderForm, description: text})}
          multiline
          maxLength={500}
        />
      </View>

      {/* Due Date and Time */}
      <View style={styles.row}>
        <View style={[styles.inputGroup, styles.flex1]}>
          <Text style={styles.label}>Due Date</Text>
          <TextInput
            style={styles.input}
            placeholder={getTodayDate()}
            placeholderTextColor={colors.textLight}
            value={reminderForm.due_date}
            onChangeText={(text) => setReminderForm({...reminderForm, due_date: text})}
          />
        </View>
        <View style={[styles.inputGroup, styles.flex1]}>
          <Text style={styles.label}>Time</Text>
          <TextInput
            style={styles.input}
            placeholder="09:00"
            placeholderTextColor={colors.textLight}
            value={reminderForm.due_time}
            onChangeText={(text) => setReminderForm({...reminderForm, due_time: text})}
          />
        </View>
      </View>

      {/* Priority */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Priority</Text>
        <View style={styles.toggleContainer}>
          {['low', 'medium', 'high', 'urgent'].map((priority) => (
            <TouchableOpacity
              key={priority}
              style={[
                styles.toggleButton,
                priority === 'low' && styles.toggleButtonFirst,
                priority === 'urgent' && styles.toggleButtonLast,
                reminderForm.priority === priority && styles.toggleButtonActive
              ]}
              onPress={() => setReminderForm({...reminderForm, priority})}
            >
              <Text style={[
                styles.toggleText,
                reminderForm.priority === priority && styles.toggleTextActive
              ]}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Type */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Type</Text>
        <View style={styles.toggleContainer}>
          {['general', 'task', 'event'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.toggleButton,
                type === 'general' && styles.toggleButtonFirst,
                type === 'event' && styles.toggleButtonLast,
                reminderForm.reminder_type === type && styles.toggleButtonActive
              ]}
              onPress={() => setReminderForm({...reminderForm, reminder_type: type})}
            >
              <Text style={[
                styles.toggleText,
                reminderForm.reminder_type === type && styles.toggleTextActive
              ]}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleCreateReminder}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.textOnPrimary} />
        ) : (
          <Text style={styles.submitButtonText}>Add Reminder</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Quick Add</Text>
          <Text style={styles.subtitle}>Add a transaction or reminder</Text>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'transaction' && styles.activeTab]}
            onPress={() => setActiveTab('transaction')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'transaction' && styles.activeTabText
            ]}>
              💰 Transaction
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'reminder' && styles.activeTab]}
            onPress={() => setActiveTab('reminder')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'reminder' && styles.activeTabText
            ]}>
              🔔 Reminder
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Content */}
        {activeTab === 'transaction' ? renderTransactionForm() : renderReminderForm()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}