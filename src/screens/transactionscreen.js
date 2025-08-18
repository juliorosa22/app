import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useDataCache } from '../context/DataCacheContext';
import { useAuth } from '../context/AuthContext';
import TransactionCard from '../components/TransactionCard';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { PieChart } from 'react-native-chart-kit';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Platform, Dimensions } from 'react-native';

export default function TransactionsScreen({ navigation }) {
  console.log('[TransactionsScreen] Rendered');
  const { colors, spacing, typography } = useTheme();
  const { getTransactions, invalidateCache, initializeData } = useDataCache();
  const { user } = useAuth();
  const allTransactions = getTransactions();
  console.log('[TransactionsScreen] user:', user, 'transactions:', allTransactions.length);

  // MOVE STYLES TO THE TOP - BEFORE ANY CONDITIONAL RETURNS
  const styles = {
    viewButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderWidth: 1,
      borderRadius: 20,
      marginRight: 10,
    },
    viewButtonActive: {
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    viewButtonText: {
      fontSize: 16,
      fontWeight: '500',
      marginLeft: 5,
    },
  };

  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('month');
  const [periodStartDate, setPeriodStartDate] = useState(null);
  const [periodEndDate, setPeriodEndDate] = useState(null);
  const [isStartPickerVisible, setStartPickerVisible] = useState(false);
  const [isEndPickerVisible, setEndPickerVisible] = useState(false);

  // Loading state based on cache
  const loading = allTransactions.length === 0;

  // Last Month
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const lastMonthTx = allTransactions.filter(tx => {
    if (!tx.date) return false;
    const txDateObj = new Date(tx.date);
    if (isNaN(txDateObj)) return false;
    // Compare only the date part
    const txDate = new Date(txDateObj.getFullYear(), txDateObj.getMonth(), txDateObj.getDate());
    return txDate >= thirtyDaysAgo && txDate <= today;
  });

  // Period
  const periodTx = allTransactions.filter(tx => {
    if (!periodStartDate || !periodEndDate) return false;
    const txDate = new Date(tx.date);
    return txDate >= new Date(periodStartDate) && txDate <= new Date(periodEndDate);
  });

  // Dashboard data
  const sumByCategory = (type) => {
    const sums = {};
    lastMonthTx.filter(tx => tx.transaction_type === type).forEach(tx => {
      const cat = tx.category || 'Uncategorized';
      sums[cat] = (sums[cat] || 0) + tx.amount;
    });
    return sums;
  };
  const expenseSums = sumByCategory('expense');
  const incomeSums = sumByCategory('income');

  // View Selector
  const TransactionViewSelector = () => (
    <View style={{ marginBottom: spacing.md }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 0 }}
      >
        <TouchableOpacity
          key="month" // ADD THIS
          style={[
            styles.viewButton,
            { borderColor: colors.primary, backgroundColor: viewMode === 'month' ? colors.primary : colors.surface },
            viewMode === 'month' && styles.viewButtonActive,
            { marginHorizontal: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 }
          ]}
          onPress={() => setViewMode('month')}
        >
          <MaterialIcons name="event" size={20} color={viewMode === 'month' ? colors.textOnPrimary : colors.primary} />
          <Text style={[
            styles.viewButtonText,
            { color: viewMode === 'month' ? colors.textOnPrimary : colors.primary, marginLeft: 6, fontWeight: 'bold' }
          ]}>Last Month</Text>
        </TouchableOpacity>
        <TouchableOpacity
          key="dashboard" // ADD THIS
          style={[
            styles.viewButton,
            { borderColor: colors.primary, backgroundColor: viewMode === 'dashboard' ? colors.primary : colors.surface },
            viewMode === 'dashboard' && styles.viewButtonActive,
            { marginHorizontal: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 }
          ]}
          onPress={() => setViewMode('dashboard')}
        >
          <MaterialIcons name="dashboard" size={20} color={viewMode === 'dashboard' ? colors.textOnPrimary : colors.primary} />
          <Text style={[
            styles.viewButtonText,
            { color: viewMode === 'dashboard' ? colors.textOnPrimary : colors.primary, marginLeft: 6, fontWeight: 'bold' }
          ]}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          key="period" // ADD THIS
          style={[
            styles.viewButton,
            { borderColor: colors.primary, backgroundColor: viewMode === 'period' ? colors.primary : colors.surface },
            viewMode === 'period' && styles.viewButtonActive,
            { marginHorizontal: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 }
          ]}
          onPress={() => setViewMode('period')}
        >
          <MaterialIcons name="date-range" size={20} color={viewMode === 'period' ? colors.textOnPrimary : colors.primary} />
          <Text style={[
            styles.viewButtonText,
            { color: viewMode === 'period' ? colors.textOnPrimary : colors.primary, marginLeft: 6, fontWeight: 'bold' }
          ]}>Period</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  // Dashboard View
  const DashboardView = () => {
    // Prepare data for PieChart (Expenses by Category)
    const expenseCategories = Object.keys(expenseSums);
    const expenseValues = Object.values(expenseSums);
    const totalExpenses = expenseValues.reduce((a, b) => a + b, 0);

    // Generate colors for each category
    const pieColors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#B0E57C', '#F67280', '#355C7D', '#6C5B7B'
    ];
    const pieData = expenseCategories.map((cat, idx) => ({
      name: cat, // Only category name
      amount: expenseSums[cat],
      color: pieColors[idx % pieColors.length],
      legendFontColor: colors.textPrimary,
      legendFontSize: 14,
      // Calculate percentage for label
      percentage: totalExpenses ? ((expenseSums[cat] / totalExpenses) * 100).toFixed(1) : 0,
    }));

    // Prepare data for Income vs Expenses ProgressChart
    const totalIncome = Object.values(incomeSums).reduce((a, b) => a + b, 0);
    const maxValue = Math.max(totalIncome, totalExpenses, 1); // avoid division by zero
    const incomeRatio = totalIncome / maxValue;
    const expenseRatio = totalExpenses / maxValue;

    return (
      <View style={{ marginBottom: spacing.lg }}>
        <Text style={{ fontSize: typography.fontSize.lg, fontWeight: 'bold', color: colors.primary, marginBottom: spacing.md }}>
          Overview (Last 30 Days)
        </Text>
        {/* Expenses Pie Chart */}
        <Text style={{ fontWeight: 'bold', marginBottom: spacing.sm }}>Expenses by Category</Text>
        {expenseCategories.length > 0 ? (
          <PieChart
            data={pieData.map(d => ({
              name: `${d.name} (${d.percentage}%)`, // Only category and percentage
              population: d.amount,
              color: d.color,
              legendFontColor: d.legendFontColor,
              legendFontSize: d.legendFontSize,
            }))}
            width={Dimensions.get('window').width - 32}
            height={220}
            chartConfig={{
              color: () => colors.primary,
              labelColor: () => colors.textPrimary,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        ) : (
          <Text style={{ color: colors.textSecondary, fontStyle: 'italic', marginBottom: spacing.md }}>
            No expenses to display.
          </Text>
        )}

        {/* Income vs Expenses Horizontal Bar */}
        <Text style={{ fontWeight: 'bold', marginTop: spacing.lg, marginBottom: spacing.sm }}>
          Income vs Expenses Balance
        </Text>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: 40,
          width: '100%',
          marginBottom: spacing.md,
        }}>
          {/* Income Bar */}
          <View style={{
            flex: incomeRatio,
            backgroundColor: '#43a047', // green
            height: 24,
            borderTopLeftRadius: 12,
            borderBottomLeftRadius: 12,
            justifyContent: 'center',
            alignItems: 'flex-end',
            paddingRight: 8,
          }}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>
              {totalIncome.toFixed(2)}
            </Text>
          </View>
          {/* Expenses Bar */}
          <View style={{
            flex: expenseRatio,
            backgroundColor: '#e53935', // red
            height: 24,
            borderTopRightRadius: 12,
            borderBottomRightRadius: 12,
            justifyContent: 'center',
            alignItems: 'flex-start',
            paddingLeft: 8,
          }}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>
              {totalExpenses.toFixed(2)}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 4 }}>
          <Text style={{ color: '#43a047', fontWeight: 'bold' }}>Income</Text>
          <Text style={{ color: '#e53935', fontWeight: 'bold' }}>Expenses</Text>
        </View>
      </View>
    );
  };

  // Period View
  const PeriodView = () => (
    <View style={{
      marginBottom: spacing.lg,
      padding: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: 8,
    }}>
      <Text style={{
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.medium,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
      }}>
        Select Period
      </Text>
      {/* Start Date Picker */}
      <TouchableOpacity
        onPress={() => setStartPickerVisible(true)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderRadius: 8,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          marginBottom: spacing.sm,
          borderColor: colors.border,
          backgroundColor: colors.surface
        }}
        activeOpacity={0.8}
      >
        <MaterialIcons name="event" size={22} color={colors.primary} style={{ marginRight: 8 }} />
        <Text style={{ color: colors.textPrimary, fontSize: 16 }}>
          {periodStartDate
            ? new Date(periodStartDate).toLocaleDateString()
            : 'Select start date'}
        </Text>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isStartPickerVisible}
        mode="date"
        onConfirm={date => {
          setPeriodStartDate(date.toISOString().split('T')[0]);
          setStartPickerVisible(false);
        }}
        onCancel={() => setStartPickerVisible(false)}
        display={Platform.OS === 'android' ? 'spinner' : 'default'}
      />

      {/* End Date Picker */}
      <TouchableOpacity
        onPress={() => setEndPickerVisible(true)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderRadius: 8,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          marginBottom: spacing.sm,
          borderColor: colors.border,
          backgroundColor: colors.surface
        }}
        activeOpacity={0.8}
      >
        <MaterialIcons name="event" size={22} color={colors.primary} style={{ marginRight: 8 }} />
        <Text style={{ color: colors.textPrimary, fontSize: 16 }}>
          {periodEndDate
            ? new Date(periodEndDate).toLocaleDateString()
            : 'Select end date'}
        </Text>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isEndPickerVisible}
        mode="date"
        onConfirm={date => {
          setPeriodEndDate(date.toISOString().split('T')[0]);
          setEndPickerVisible(false);
        }}
        onCancel={() => setEndPickerVisible(false)}
        display={Platform.OS === 'android' ? 'spinner' : 'default'}
      />
    </View>
  );

  // Loading state
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{
            marginTop: spacing.md,
            fontSize: typography.fontSize.base,
            color: colors.textSecondary
          }}>
            Loading transactions...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await invalidateCache();
    if (typeof initializeData === 'function') {
      await initializeData();
    }
    setRefreshing(false);
  }, [invalidateCache, initializeData]);

  // Choose which transactions to show
  const shownTx = viewMode === 'month' ? lastMonthTx : periodTx;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <View style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1, padding: spacing.md }}
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
          <View style={{ marginBottom: 12 }}>
            <Text style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.primary,
              marginBottom: 4, // Matches RegisterScreen title marginBottom
            }}>
              💳 Transactions
            </Text>
          </View>

          <TransactionViewSelector />

          {viewMode === 'dashboard' && <DashboardView />}
          {viewMode === 'period' && <PeriodView />}

          {/* Transaction Count */}
          {viewMode !== 'dashboard' && (
            <View style={{ marginBottom: spacing.md, alignItems: 'center' }}>
              <Text style={{
                fontSize: typography.fontSize.sm,
                color: colors.textSecondary,
              }}>
                Showing {shownTx.length} transaction{shownTx.length !== 1 ? 's' : ''}
              </Text>
            </View>
          )}

          {/* Transaction Cards */}
          {viewMode !== 'dashboard' && (
            shownTx.length > 0 ? (
              shownTx.map(tx => (
                <TransactionCard
                  key={`transaction-${tx.id}`} // BETTER KEY
                  transaction={tx}
                  onPress={(selectedTx) => navigation.navigate('EditTransactionScreen', { transaction: selectedTx })}
                  currency={user?.currency || 'USD'}
                />
              ))
            ) : (
              <View style={{
                alignItems: 'center',
                padding: spacing.xl,
                marginTop: spacing.lg
              }}>
                <Text style={{
                  fontSize: typography.fontSize.lg,
                  color: colors.textSecondary,
                  textAlign: 'center',
                  fontStyle: 'italic',
                }}>
                  No transactions found
                </Text>
              </View>
            )
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}