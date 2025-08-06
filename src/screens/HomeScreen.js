import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  FlatList, 
  RefreshControl,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import ApiService from '../services/api';
import TransactionCard from '../components/TransactionCard';
import { useDataCache } from '../context/DataCacheContext';

export default function HomeScreen({ navigation }) {
  const { colors, spacing, typography, shadows } = useTheme();
  const { user } = useAuth();
  const { getTransactions, getTransactionSummary, getReminders, invalidateCache } = useDataCache();

  // State management
  const [data, setData] = useState({
    summary: {
      total_expenses: 0,
      total_income: 0,
      net_income: 0,
      expense_count: 0,
      income_count: 0
    },
    transactions: [],
    reminders: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Load data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(!forceRefresh);

      // Fetch data from cache first, then from API if needed
      const [summaryResult, transactionsResult, remindersResult] = await Promise.all([
        getTransactionSummary(30, forceRefresh),
        getTransactions(30, null, forceRefresh),
        getReminders(30, forceRefresh)
      ]);

      if (summaryResult.success) {
        setData(prev => ({
          ...prev,
          summary: summaryResult.summary
        }));
      }

      if (transactionsResult.success) {
        setData(prev => ({
          ...prev,
          transactions: transactionsResult.transactions.slice(0, 5) // Show only recent 5
        }));
      }

      if (remindersResult.success) {
        setData(prev => ({
          ...prev,
          reminders: remindersResult.reminders
        }));
      }

    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getTransactionSummary, getTransactions, getReminders]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Invalidate cache and force refresh
    invalidateCache();
    fetchData(true);
  }, [fetchData, invalidateCache]);

  const formatCurrency = (amount, currency = 'USD') => {
    const symbols = { USD: '$', EUR: '€', BRL: 'R$', GBP: '£', JPY: '¥' };
    const symbol = symbols[currency] || '$';
    return `${symbol}${Math.abs(amount).toFixed(2)}`;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return colors.error;
      case 'high': return colors.warning;
      case 'medium': return colors.info;
      case 'low': return colors.textSecondary;
      default: return colors.textSecondary;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

  // Replace renderTransactionItem with TransactionCard usage
  const renderTransactionItem = ({ item }) => (
    <TransactionCard
      transaction={item}
      onPress={(selectedTx) => navigation.navigate('EditTransactionScreen', { transaction: selectedTx })}
    />
  );

  const renderReminderItem = ({ item }) => {
    const isOverdue = item.due_datetime && new Date(item.due_datetime) < new Date();
    
    return (
      <TouchableOpacity 
        style={[
          styles.itemCard,
          isOverdue && { borderLeftColor: colors.error }
        ]} 
        onPress={() => navigation.navigate('Reminders')}
        activeOpacity={0.7}
      >
        <View style={styles.itemHeader}>
          <Text style={styles.itemTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={[
            styles.priorityDot, 
            { backgroundColor: getPriorityColor(item.priority) }
          ]} />
        </View>
        {item.description && (
          <Text style={styles.itemDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <View style={styles.itemFooter}>
          <Text style={[
            styles.itemPriority, 
            { color: getPriorityColor(item.priority) }
          ]}>
            {item.priority?.toUpperCase()}
          </Text>
          <Text style={[
            styles.itemDate,
            isOverdue && { color: colors.error, fontWeight: 'bold' }
          ]}>
            {formatReminderDate(item.due_datetime)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = (type) => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>
        {type === 'transactions' ? 'No recent transactions' : 'No upcoming reminders'}
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

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.welcomeText, { marginTop: spacing.md }]}>
          Loading your data...
        </Text>
      </View>
    );
  }

  // Error state
  if (error && !data.transactionSummary) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => loadHomeData()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
          <Text style={styles.welcomeText}>Hello,</Text>
          <Text style={styles.nameText}>{user?.name || 'User'}</Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.statCard}>
            <Text style={[
              styles.statAmount,
              { color: data.summary.net_income >= 0 ? colors.success : colors.error }
            ]}>
              {formatCurrency(data.summary.net_income || 0, user?.currency)}
            </Text>
            <Text style={styles.statLabel}>Net This Month</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statAmount}>
              {data.reminderSummary?.pending_count || 0}
            </Text>
            <Text style={styles.statLabel}>Pending Tasks</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statAmount}>
              {(data.summary.expense_count || 0) + (data.summary.income_count || 0)}
            </Text>
            <Text style={styles.statLabel}>Transactions</Text>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>💰 Recent Transactions</Text>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => navigation.navigate('Transactions')}
            >
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {data.transactions.length > 0 ? (
            <FlatList
              data={data.transactions}
              renderItem={renderTransactionItem}
              keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
              scrollEnabled={false}
            />
          ) : (
            renderEmptyState('transactions')
          )}
        </View>

        {/* Upcoming Reminders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔔 Upcoming Reminders</Text>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => navigation.navigate('Reminders')}
            >
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {data.reminders.length > 0 ? (
            <FlatList
              data={data.reminders}
              renderItem={renderReminderItem}
              keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
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