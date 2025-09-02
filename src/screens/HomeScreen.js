import React, { useState, useCallback, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import UserDebugInfo from '../components/UserDebugInfo';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import TransactionCard from '../components/TransactionCard';
import ReminderCard from '../components/ReminderCard';
import { useDataCache } from '../context/DataCacheContext';
//import LottieView from 'lottie-react-native';
import { getCurrencyConfig, formatCurrency } from '../utils/currencyHelper';
import TelegramBotHeaderButton from '../components/TelegramBotHeaderButton';
import { useLanguage } from '../context/LanguageContext';
import { getDateRange, isDateInRange } from '../utils/dateHelper';

export default function HomeScreen({ navigation }) {
  //console.log('[HomeScreen] Rendered');
  const { colors, spacing, typography, shadows } = useTheme();
  const { user } = useAuth();
  const { getTransactions, getReminders, invalidateCache, initializeData, getTransactionsByDateRange } = useDataCache();
  const { t } = useLanguage();
  const [refreshing, setRefreshing] = useState(false);
  

  // Get all transactions for summary (keep this as is)
  const allTransactions = getTransactions();
  const allReminders = getReminders();
  // ✅ Use the new helper for recent transactions
  const { start: thirtyDaysAgo, end: today } = getDateRange('last30days');
  
  const recentTransactions = allTransactions
    .filter(tx => isDateInRange(tx.date, thirtyDaysAgo, today))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // ✅ Better debugging
  console.log('[HomeScreen] Date range:', {
    start: thirtyDaysAgo.toISOString().split('T')[0],
    end: today.toISOString().split('T')[0],
    totalTransactions: allTransactions.length,
    filteredTransactions: recentTransactions.length,
    sampleTransaction: allTransactions[0]?.date
  });

  // Filter for upcoming reminders (due date >= today)
  const now = new Date();
  const upcomingReminders = allReminders
    .filter(rem => {
      if (!rem.due_datetime) return false; // Use due_datetime
      const due = new Date(rem.due_datetime);
      return due >= now;
    })
    .sort((a, b) => new Date(a.due_datetime) - new Date(b.due_datetime));

  // Calculate summary (this should use ALL transactions, not filtered)
  const summary = {
    total_expenses: allTransactions
      .filter(tx => tx.transaction_type === 'expense')
      .reduce((sum, tx) => sum + Number(tx.amount), 0),
    total_income: allTransactions
      .filter(tx => tx.transaction_type === 'income')
      .reduce((sum, tx) => sum + Number(tx.amount), 0),
    net_income: allTransactions.filter(tx => tx.transaction_type === 'income').reduce((sum, tx) => sum + Number(tx.amount), 0)
      - allTransactions.filter(tx => tx.transaction_type === 'expense').reduce((sum, tx) => sum + Number(tx.amount), 0),
    expense_count: allTransactions.filter(tx => tx.transaction_type === 'expense').length,
    income_count: allTransactions.filter(tx => tx.transaction_type === 'income').length,
  };

  // Pending reminders
  const pendingRemindersCount = allReminders.filter(rem => !rem.completed).length;

  
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await invalidateCache();
    if (typeof initializeData === 'function') {
      await initializeData();
    }
    setRefreshing(false);
  }, [invalidateCache, initializeData]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return colors.error;
      case 'high': return colors.warning;
      case 'medium': return colors.info;
      case 'low': return colors.textSecondary;
      default: return colors.textSecondary;
    }
  };

  const formatReminderDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    const now = new Date();
    if (date < now) return 'Overdue';
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderTransactionItem = ({ item }) => (
    <TransactionCard
      transaction={item}
      onPress={(selectedTx) => navigation.navigate('EditTransactionScreen', { transaction: selectedTx })}
    />
  );

  const renderReminderItem = ({ item }) => (
    <ReminderCard
      reminder={item}
      onPress={(selectedReminder) =>
        navigation.navigate('EditReminderScreen', { reminder: selectedReminder })
      }
      getPriorityColor={getPriorityColor}
      formatReminderDate={formatReminderDate}
    />
  );

  const renderEmptyState = (type) => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>
        {type === 'transactions' ? t('no_recent_transactions') : t('no_upcoming_reminders')}
      </Text>
    </View>
  );



  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      padding: spacing.md,
      paddingBottom: 100,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    errorText: {
      fontSize: typography.fontSize.base,
      color: colors.error,
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    retryButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: 8,
    },
    retryButtonText: {
      color: colors.textOnPrimary,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
    },
    header: {
      marginBottom: spacing.lg,
    },
    welcomeText: {
      fontSize: typography.fontSize.lg,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    nameText: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: colors.primary,
    },
    quickStats: {
      flexDirection: 'row',
      marginBottom: spacing.lg,
      gap: spacing.md,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      padding: spacing.md,
      borderRadius: 12,
      alignItems: 'center',
      ...shadows.sm,
    },
    statAmount: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: colors.primary,
    },
    statLabel: {
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
      marginTop: spacing.xs,
      textAlign: 'center',
    },
    section: {
      marginBottom: spacing.lg,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    sectionTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: colors.textPrimary,
    },
    seeAllButton: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
    seeAllText: {
      fontSize: typography.fontSize.sm,
      color: colors.primary,
      fontWeight: typography.fontWeight.medium,
    },
    itemCard: {
      backgroundColor: colors.surface,
      padding: spacing.md,
      borderRadius: 8,
      marginBottom: spacing.sm,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
      ...shadows.sm,
    },
    itemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.xs,
    },
    itemTitle: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      color: colors.textPrimary,
      flex: 1,
      marginRight: spacing.sm,
    },
    itemAmount: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.bold,
    },
    itemDescription: {
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    itemFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    itemCategory: {
      fontSize: typography.fontSize.xs,
      color: colors.textSecondary,
      backgroundColor: colors.surfaceSecondary,
      paddingHorizontal: spacing.xs,
      paddingVertical: 2,
      borderRadius: 4,
    },
    itemPriority: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.medium,
    },
    itemDate: {
      fontSize: typography.fontSize.xs,
      color: colors.textLight,
    },
    priorityDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginLeft: spacing.xs,
    },
    emptyState: {
      alignItems: 'center',
      padding: spacing.xl,
    },
    emptyText: {
      fontSize: typography.fontSize.base,
      color: colors.textSecondary,
      textAlign: 'center',
      fontStyle: 'italic',
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Absolute Telegram button */}
      <View style={{
        position: 'absolute',
        top: 40,
        right: 5,
        zIndex: 10,
      }}>
        <TelegramBotHeaderButton />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>{t('hello')}</Text>
          <Text style={styles.nameText}>{user?.name || t('user')}</Text>
        </View>
        {/*<UserDebugInfo />*/}
        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.statCard}>
            <Text style={[
              styles.statAmount,
              { color: summary.net_income >= 0 ? colors.success : colors.error }
            ]}>
              {formatCurrency(summary.net_income || 0, user?.currency || 'USD')}
            </Text>
            <Text style={styles.statLabel}>{t('net_this_month')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statAmount}>
              {pendingRemindersCount}
            </Text>
            <Text style={styles.statLabel}>{t('pending_tasks')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statAmount}>
              {(summary.expense_count || 0) + (summary.income_count || 0)}
            </Text>
            <Text style={styles.statLabel}>{t('transactions')}</Text>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('recent_transactions')}</Text>
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => navigation.navigate('Transactions')}
            >
              <Text style={styles.seeAllText}>{t('see_all')}</Text>
            </TouchableOpacity>
          </View>

          {recentTransactions.length > 0 ? (
            <FlatList
              data={recentTransactions}
              renderItem={renderTransactionItem}
              keyExtractor={(item, index) => item.id?.toString() || `tx-${index}`}
              scrollEnabled={false}
            />
          ) : (
            renderEmptyState('transactions')
          )}
        </View>

        {/* Upcoming Reminders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('upcoming_reminders')}</Text>
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => navigation.navigate('Reminders')}
            >
              <Text style={styles.seeAllText}>{t('see_all')}</Text>
            </TouchableOpacity>
          </View>

          {upcomingReminders.length > 0 ? (
            <FlatList
              data={upcomingReminders}
              renderItem={renderReminderItem}
              keyExtractor={(item, index) => item.id?.toString() || `reminder-${index}`}
              scrollEnabled={false}
            />
          ) : (
            renderEmptyState('reminders')
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Keep styles at the bottom