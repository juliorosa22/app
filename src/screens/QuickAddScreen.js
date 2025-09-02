import React, { useState, useEffect } from 'react';
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
  Keyboard
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useDataCache } from '../context/DataCacheContext';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import MaterialIcons from '@expo/vector-icons/MaterialIcons'; // or 'react-native-vector-icons/MaterialIcons'
import CurrencyInput from '../components/CurrencyInput';
import { useLanguage } from '../context/LanguageContext';
import { getLocalDateString } from '../utils/dateHelper';

export default function QuickAddScreen({ navigation }) {
  const { colors, spacing, typography, shadows } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { addTransaction, addReminder, categories } = useDataCache();
  const { t, language } = useLanguage();

  // State for form mode
  const [activeTab, setActiveTab] = useState('transaction'); // 'transaction' or 'reminder'
  const [loading, setLoading] = useState(false);
  const [isTransactionDatePickerVisible, setTransactionDatePickerVisibility] = useState(false);
  const [isReminderDatePickerVisible, setReminderDatePickerVisibility] = useState(false);

  // Transaction form state
  const [transactionForm, setTransactionForm] = useState({
    description: '',
    amount: '',
    transaction_type: 'expense',
    category: '',
    merchant: '',
    date: getLocalDateString(), // ✅ Default to today's date
  });

  // Reminder form state
  const [reminderForm, setReminderForm] = useState({
    title: '',
    description: '',
    due_datetime: '', // <-- rename from due_date
    priority: 'medium',
    reminder_type: 'general'
  });

  // Categories state
  const currentCategories = categories[transactionForm.transaction_type] || [];

  // Fetch categories on transaction type change
  useEffect(() => {
    // You may want to cache categories as well, or keep this as is
    // ApiService.getCategories().then(res => {
    //   if (res.success) setCategories(res.categories[transactionForm.transaction_type]);
    // });
  }, [transactionForm.transaction_type]);

 
  // For category translation (display only)
  const getCategoryLabel = (cat) => {
    // Add translation keys for your categories in the locale files if needed
    // Example: "category_food": "Food", "category_transport": "Transport", etc.
    return t(`category_${cat}`) !== `category_${cat}` ? t(`category_${cat}`) : cat;
  };

  // TransactionTypeSelector
  const TransactionTypeSelector = () => (
    <View style={{ marginBottom: spacing.md }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[
            styles.viewButton,
            { borderColor: colors.primary, backgroundColor: transactionForm.transaction_type === 'expense' ? colors.primary : colors.surface },
            transactionForm.transaction_type === 'expense' && styles.viewButtonActive
          ]}
          onPress={() => setTransactionForm({ ...transactionForm, transaction_type: 'expense' })}
        >
          <MaterialIcons name="money-off" size={20} color={transactionForm.transaction_type === 'expense' ? colors.textOnPrimary : colors.primary} />
          <Text style={[
            styles.viewButtonText,
            { color: transactionForm.transaction_type === 'expense' ? colors.textOnPrimary : colors.primary }
          ]}>{t('expense')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.viewButton,
            { borderColor: colors.primary, backgroundColor: transactionForm.transaction_type === 'income' ? colors.primary : colors.surface },
            transactionForm.transaction_type === 'income' && styles.viewButtonActive
          ]}
          onPress={() => setTransactionForm({ ...transactionForm, transaction_type: 'income' })}
        >
          <MaterialIcons name="attach-money" size={20} color={transactionForm.transaction_type === 'income' ? colors.textOnPrimary : colors.primary} />
          <Text style={[
            styles.viewButtonText,
            { color: transactionForm.transaction_type === 'income' ? colors.textOnPrimary : colors.primary }
          ]}>{t('income')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  // Transaction Form
  const renderTransactionForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t('description_label')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('description_placeholder')}
          placeholderTextColor={colors.textLight}
          value={transactionForm.description}
          onChangeText={(text) => setTransactionForm({...transactionForm, description: text})}
          maxLength={100}
        />
      </View>
      <TransactionTypeSelector />
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t('amount_label')}</Text>
        <CurrencyInput
          value={transactionForm.amount}
          onValueChange={(value) => setTransactionForm({ ...transactionForm, amount: value })}
          currency={user?.currency || 'USD'}
          style={[styles.input, { color: colors.textPrimary }]}
          placeholderTextColor={colors.textLight}
          placeholder={t('amount_placeholder')}
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t('category_label')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4 }}>
          {currentCategories.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                transactionForm.category === cat && styles.categoryChipActive
              ]}
              onPress={() => setTransactionForm({ ...transactionForm, category: cat })}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.categoryChipText,
                transactionForm.category === cat && styles.categoryChipTextActive
              ]}>
                {getCategoryLabel(cat)}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[
              styles.categoryChip,
              !transactionForm.category && styles.categoryChipActive
            ]}
            onPress={() => setTransactionForm({ ...transactionForm, category: '' })}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.categoryChipText,
              !transactionForm.category && styles.categoryChipTextActive
            ]}>
              {t('category_auto')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t('merchant_label')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('merchant_placeholder')}
          placeholderTextColor={colors.textLight}
          value={transactionForm.merchant}
          onChangeText={(text) => setTransactionForm({ ...transactionForm, merchant: text })}
          maxLength={50}
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t('date_label')}</Text>
        <TouchableOpacity
          onPress={showTransactionDatePicker}
          style={[
            styles.dateTimeRow,
            { borderColor: colors.border, backgroundColor: colors.surface }
          ]}
          activeOpacity={0.8}
        >
          <MaterialIcons name="event" size={22} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={{ color: colors.textPrimary, fontSize: 16 }}>
            {transactionForm.date
              ? new Date(transactionForm.date + 'T00:00:00').toLocaleDateString()
              : t('date_placeholder')}
          </Text>
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={isTransactionDatePickerVisible}
          mode="date"
          onConfirm={handleTransactionDateConfirm}
          onCancel={hideTransactionDatePicker}
          display={Platform.OS === 'android' ? 'spinner' : 'default'}
          maximumDate={new Date()} // ✅ Cannot select future dates
          minimumDate={new Date(2020, 0, 1)} // ✅ Optional: Cannot select dates before 2020
          date={transactionForm.date ? new Date(transactionForm.date + 'T00:00:00') : new Date()} // ✅ Default to selected date or today
        />
      </View>
      <TouchableOpacity
        style={[
          styles.submitButton,
          loading && styles.submitButtonDisabled,
          { marginBottom: insets.bottom }
        ]}
        onPress={handleCreateTransaction}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.textOnPrimary} />
        ) : (
          <Text style={styles.submitButtonText}>
            {transactionForm.transaction_type === 'expense' ? t('add_expense') : t('add_income')}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  // Reminder Form
  const renderReminderForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t('title_label')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('title_placeholder')}
          placeholderTextColor={colors.textLight}
          value={reminderForm.title}
          onChangeText={(text) => setReminderForm({...reminderForm, title: text})}
          maxLength={100}
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t('reminder_description_label')}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={t('reminder_description_placeholder')}
          placeholderTextColor={colors.textLight}
          value={reminderForm.description}
          onChangeText={(text) => setReminderForm({...reminderForm, description: text})}
          multiline
          maxLength={500}
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t('due_label')}</Text>
        <TouchableOpacity
          onPress={showReminderDatePicker}
          style={[
            styles.dateTimeRow,
            { borderColor: colors.border, backgroundColor: colors.surface }
          ]}
          activeOpacity={0.8}
        >
          <MaterialIcons name="event" size={22} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={{ color: colors.textPrimary, fontSize: 16 }}>
            {reminderForm.due_datetime
              ? new Date(reminderForm.due_datetime).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
              : t('due_placeholder')}
          </Text>
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={isReminderDatePickerVisible}
          mode="datetime"
          onConfirm={handleReminderDateConfirm}
          onCancel={hideReminderDatePicker}
          display={Platform.OS === 'android' ? 'spinner' : 'default'}
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t('priority_label')}</Text>
        <View style={styles.prioritySlider}>
          {['low', 'medium', 'high', 'urgent'].map((priority, idx) => (
            <TouchableOpacity
              key={priority}
              style={[
                styles.priorityDot,
                reminderForm.priority === priority && styles.priorityDotActive,
                { backgroundColor: getPriorityColor(priority) }
              ]}
              onPress={() => setReminderForm({ ...reminderForm, priority })}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.priorityLabel,
                reminderForm.priority === priority && styles.priorityLabelActive
              ]}>
                {t(`priority_${priority}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.priorityLabelsRow}>
          <Text style={styles.priorityLabelText}>{t('priority_low')}</Text>
          <Text style={styles.priorityLabelText}>{t('priority_medium')}</Text>
          <Text style={styles.priorityLabelText}>{t('priority_high')}</Text>
          <Text style={styles.priorityLabelText}>{t('priority_urgent')}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={[
          styles.submitButton,
          loading && styles.submitButtonDisabled,
          { marginBottom: insets.bottom }
        ]}
        onPress={handleCreateReminder}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color={colors.textOnPrimary} />
        ) : (
          <Text style={styles.submitButtonText}>{t('add_reminder')}</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  // ViewSelector component
  const ViewSelector = () => (
    <View style={{ marginBottom: spacing.md }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[
            styles.viewButton,
            { borderColor: colors.primary, backgroundColor: activeTab === 'transaction' ? colors.primary : colors.surface },
            activeTab === 'transaction' && styles.viewButtonActive
          ]}
          onPress={() => setActiveTab('transaction')}
        >
          <MaterialIcons name="attach-money" size={20} color={activeTab === 'transaction' ? colors.textOnPrimary : colors.primary} />
          <Text style={[
            styles.viewButtonText,
            { color: activeTab === 'transaction' ? colors.textOnPrimary : colors.primary }
          ]}>{t('transaction_tab')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.viewButton,
            { borderColor: colors.primary, backgroundColor: activeTab === 'reminder' ? colors.primary : colors.surface },
            activeTab === 'reminder' && styles.viewButtonActive
          ]}
          onPress={() => setActiveTab('reminder')}
        >
          <MaterialIcons name="notifications-active" size={20} color={activeTab === 'reminder' ? colors.textOnPrimary : colors.primary} />
          <Text style={[
            styles.viewButtonText,
            { color: activeTab === 'reminder' ? colors.textOnPrimary : colors.primary }
          ]}>{t('reminder_tab')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  // Validation
  const validateTransaction = () => {
    if (!transactionForm.description.trim()) {
      Alert.alert(t('error'), t('description_required'));
      return false;
    }
    if (!transactionForm.amount || parseFloat(transactionForm.amount) <= 0) {
      Alert.alert(t('error'), t('amount_required'));
      return false;
    }
    return true;
  };

  const validateReminder = () => {
    if (!reminderForm.title.trim()) {
      Alert.alert(t('error'), t('title_required'));
      return false;
    }
    return true;
  };

  // Handle transaction creation
  const handleCreateTransaction = async () => {
    if (!validateTransaction()) return;
    setLoading(true);
    try {
      // ✅ Fix: Use selected date or today's date in local timezone
      let transactionDate = transactionForm.date;
      if (!transactionDate) {
        // If no date selected, use today's date at start of day in local timezone
        const today = new Date();
        transactionDate = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString().split('T')[0];
      }

      await addTransaction({
        ...transactionForm,
        amount: parseFloat(transactionForm.amount),
        user_id: user?.id,
        date: transactionDate // ✅ Use date without time component
      });

      Alert.alert(
        t('success'),
        t('transaction_added'),
        [
          {
            text: t('add_another'),
            onPress: () => {
              setTransactionForm({
                description: '',
                amount: '',
                transaction_type: 'expense',
                category: '',
                merchant: '',
                date: '' // ✅ Reset date field
              });
            }
          },
          {
            text: t('view_transactions'),
            onPress: () => navigation.navigate('Transactions')
          }
        ]
      );
    } catch (error) {
      Alert.alert(t('error'), error.message || t('transaction_error'));
    } finally {
      setLoading(false);
    }
  };

  // Handle reminder creation
  const handleCreateReminder = async () => {
    if (!validateReminder()) return;
    setLoading(true);
    try {
      let dueDateTime = reminderForm.due_datetime;
      if (!dueDateTime) {
        const next24h = new Date(Date.now() + 24 * 60 * 60 * 1000);
        dueDateTime = next24h.toISOString();
      }
      await addReminder({
        ...reminderForm,
        user_id: user?.id,
        due_datetime: dueDateTime
      });
      Alert.alert(
        t('success'),
        t('reminder_added'),
        [
          {
            text: t('add_another'),
            onPress: () => {
              setReminderForm({
                title: '',
                description: '',
                due_datetime: '',
                priority: 'medium',
                reminder_type: 'general'
              });
            }
          },
          {
            text: t('view_reminders'),
            onPress: () => navigation.navigate('Reminders')
          }
        ]
      );
    } catch (error) {
      Alert.alert(t('error'), error.message || t('reminder_error'));
    } finally {
      setLoading(false);
    }
  };

  const showTransactionDatePicker = () => setTransactionDatePickerVisibility(true);
  const hideTransactionDatePicker = () => setTransactionDatePickerVisibility(false);

  const showReminderDatePicker = () => setReminderDatePickerVisibility(true);
  const hideReminderDatePicker = () => setReminderDatePickerVisibility(false);

  const handleTransactionDateConfirm = (date) => {
    // ✅ Store as YYYY-MM-DD format (date only, no time)
    const dateString = getLocalDateString(date);
    setTransactionForm({ ...transactionForm, date: dateString });
    hideTransactionDatePicker();
  };

  const handleReminderDateConfirm = (date) => {
    setReminderForm({ ...reminderForm, due_datetime: date.toISOString() }); // full ISO
    hideReminderDatePicker();
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
  safeArea: {
    flex: 1,
    paddingTop: insets.top,
    paddingBottom: insets.bottom,
    paddingLeft: insets.left,
    paddingRight: insets.right,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: 4,
    marginBottom: 4,
  },
  prioritySlider: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.sm,
    marginHorizontal: 4,
  },
  priorityDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.4,
    marginHorizontal: 2,
  },
  priorityDotActive: {
    borderWidth: 2,
    borderColor: colors.primary,
    opacity: 1,
  },
  priorityLabel: {
    color: colors.textOnPrimary,
    fontWeight: 'bold',
    fontSize: 16,
    opacity: 0.7,
  },
  priorityLabelActive: {
    opacity: 1,
  },
  priorityLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 4,
  },
  priorityLabelText: {
    fontSize: 12,
    color: colors.textSecondary,
    width: 32,
    textAlign: 'center',
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
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    marginRight: 8,
    marginBottom: 4,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
  },
  categoryChipText: {
    color: colors.primary,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: colors.textOnPrimary,
  },
});

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'low': return '#43a047';
    case 'medium': return '#fb8c00';
    case 'high': return '#e53935';
    case 'urgent': return '#8e24aa';
    default: return colors.primary;
  }
};



  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header*/} 
          <View style={styles.header}>
            <Text style={styles.title}>{t('quick_add_title')}</Text>
            <Text style={styles.subtitle}>{t('quick_add_subtitle')}</Text>
          </View>

          {/* ViewSelector replaces the old tab selector */}
          <ViewSelector />

          {/* Form Content */}
          {activeTab === 'transaction' ? renderTransactionForm() : renderReminderForm()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );



}

