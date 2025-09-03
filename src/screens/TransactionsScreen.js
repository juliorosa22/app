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
import TelegramBotHeaderButton from '../components/TelegramBotHeaderButton';
import { useLanguage } from '../context/LanguageContext';
// ✅ Import dateHelper functions
import { getDateRange, isDateInRange, getLocalDateString, getTodayEndOfDay } from '../utils/dateHelper';

export default function TransactionsScreen({ navigation }) {
  //console.log('[TransactionsScreen] Rendered');
  const { colors, spacing, typography } = useTheme();
  const { getTransactions, invalidateCache, initializeData } = useDataCache();
  const { user } = useAuth();
  const { t } = useLanguage();
  const allTransactions = getTransactions();
  //console.log('[TransactionsScreen] user:', user, 'transactions:', allTransactions.length);

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

  // ✅ Use dateHelper for consistent date filtering
  const { start: thirtyDaysAgo, end: today } = getDateRange('last30days');

  // ✅ Use isDateInRange for last month transactions
  const lastMonthTx = allTransactions.filter(tx => 
    isDateInRange(tx.date, thirtyDaysAgo, today)
  );

  // ✅ Fix the period transactions filtering to use dateHelper consistently
  const periodTx = allTransactions.filter(tx => {
    if (!periodStartDate || !periodEndDate) return false;
    
    // ✅ Use dateHelper functions for consistent date parsing
    const startDate = new Date(periodStartDate + 'T00:00:00'); // Start of start date
    const endDate = new Date(periodEndDate + 'T23:59:59'); // End of end date
    
    return isDateInRange(tx.date, startDate, endDate);
  });

  // ✅ Determine which transactions to use for dashboard
  const dashboardTx = (periodStartDate && periodEndDate) ? periodTx : lastMonthTx;

  // ✅ Add debugging specifically for period view


  // ✅ Update Dashboard data to use selected period when available
  const sumByCategory = (type) => {
    const sums = {};
    dashboardTx.filter(tx => tx.transaction_type === type).forEach(tx => {
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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 0 }}>
        <TouchableOpacity
          key="month"
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
          ]}>{t('last_month')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          key="dashboard"
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
          ]}>{t('dashboard')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          key="period"
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
          ]}>{t('period')}</Text>
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
      name: cat,
      amount: expenseSums[cat],
      color: pieColors[idx % pieColors.length],
      legendFontColor: colors.textPrimary,
      legendFontSize: 14,
      percentage: totalExpenses ? ((expenseSums[cat] / totalExpenses) * 100).toFixed(1) : 0,
    }));

    // Prepare data for Income vs Expenses ProgressChart
    const totalIncome = Object.values(incomeSums).reduce((a, b) => a + b, 0);
    const maxValue = Math.max(totalIncome, totalExpenses, 1);
    const incomeRatio = totalIncome / maxValue;
    const expenseRatio = totalExpenses / maxValue;

    // Card styles
    const cardStyle = {
      backgroundColor: colors.surface,
      marginHorizontal: 12,
      marginVertical: 6,
      padding: 16,
      borderRadius: 12,
      elevation: 2,
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    };

    // ✅ Determine dashboard title based on selected period
    const dashboardTitle = (periodStartDate && periodEndDate) 
      ? `${t('overview')} ${new Date(periodStartDate + 'T00:00:00').toLocaleDateString()} - ${new Date(periodEndDate + 'T00:00:00').toLocaleDateString()}`
      : t('overview_last_30_days');

    return (
      <View style={{ marginBottom: spacing.lg }}>
        <Text style={{ 
          fontSize: typography.fontSize.lg, 
          fontWeight: 'bold', 
          color: colors.primary, 
          marginBottom: spacing.md,
          marginHorizontal: 12 
        }}>
          {dashboardTitle}
        </Text>
        
        {/* Expenses by Category Card */}
        <View style={cardStyle}>
          <Text style={{ 
            fontWeight: 'bold', 
            marginBottom: spacing.md,
            color: colors.textPrimary,
            fontSize: typography.fontSize.base 
          }}>
            {t('expenses_by_category')}
          </Text>
          
          {expenseCategories.length > 0 ? (
            <View>
              {/* Pie Chart */}
              <View style={{ 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: spacing.md,
                width: '100%' // Ensure full width
              }}>
                <PieChart
                  data={pieData.map(d => ({
                    name: d.name,
                    population: d.amount,
                    color: d.color,
                    legendFontColor: 'transparent', // Hide default legend
                    legendFontSize: 0,
                  }))}
                  width={Dimensions.get('window').width - 96} // Reduced width for better centering (was -64)
                  height={200}
                  chartConfig={{
                    color: () => colors.primary,
                    labelColor: () => colors.textPrimary,
                  }}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute={false} // Show percentages on chart
                  hasLegend={false} // Hide default legend
                  center={[10, 0]} // Additional centering offset
                />
              </View>
              
              {/* Custom Legend Below Chart */}
              <View style={{ marginTop: spacing.sm }}>
                {pieData.map((item, idx) => (
                  <View key={item.name} style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: spacing.xs,
                    paddingHorizontal: spacing.sm
                  }}>
                    <View style={{
                      width: 16,
                      height: 16,
                      backgroundColor: item.color,
                      borderRadius: 8,
                      marginRight: spacing.sm,
                    }} />
                    <Text style={{
                      flex: 1,
                      color: colors.textPrimary,
                      fontSize: typography.fontSize.sm,
                      fontWeight: '500'
                    }}>
                      {item.name}
                    </Text>
                    <Text style={{
                      color: colors.textSecondary,
                      fontSize: typography.fontSize.sm,
                      fontWeight: 'bold'
                    }}>
                      {item.percentage}%
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <Text style={{ 
              color: colors.textSecondary, 
              fontStyle: 'italic',
              textAlign: 'center',
              paddingVertical: spacing.lg 
            }}>
              {t('no_expenses_to_display')}
            </Text>
          )}
        </View>

        {/* Income vs Expenses Balance Card */}
        <View style={cardStyle}>
          <Text style={{ 
            fontWeight: 'bold', 
            marginBottom: spacing.md,
            color: colors.textPrimary,
            fontSize: typography.fontSize.base 
          }}>
            {t('income_vs_expenses_balance')}
          </Text>
          
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            height: 40,
            width: '100%',
            marginBottom: spacing.sm,
          }}>
            <View style={{
              flex: incomeRatio,
              backgroundColor: '#43a047',
              height: 24,
              borderTopLeftRadius: 12,
              borderBottomLeftRadius: 12,
              justifyContent: 'center',
              alignItems: 'flex-end',
              paddingRight: 8,
              minWidth: incomeRatio > 0 ? 60 : 0, // Minimum width when there's income
            }}>
              {incomeRatio > 0 && (
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>
                  {totalIncome.toFixed(2)}
                </Text>
              )}
            </View>
            
            <View style={{
              flex: expenseRatio,
              backgroundColor: '#e53935',
              height: 24,
              borderTopRightRadius: 12,
              borderBottomRightRadius: 12,
              justifyContent: 'center',
              alignItems: 'flex-start',
              paddingLeft: 8,
              minWidth: expenseRatio > 0 ? 60 : 0, // Minimum width when there are expenses
            }}>
              {expenseRatio > 0 && (
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>
                  {totalExpenses.toFixed(2)}
                </Text>
              )}
            </View>
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 4 }}>
            <Text style={{ color: '#43a047', fontWeight: 'bold', fontSize: typography.fontSize.sm }}>
              {t('income')}
            </Text>
            <Text style={{ color: '#e53935', fontWeight: 'bold', fontSize: typography.fontSize.sm }}>
              {t('expenses')}
            </Text>
          </View>
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
        {t('select_period')}
      </Text>
      
      {/* ✅ Start Date Button */}
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
            ? new Date(periodStartDate + 'T00:00:00').toLocaleDateString()
            : t('select_start_date')}
        </Text>
      </TouchableOpacity>

      {/* ✅ End Date Button */}
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
            ? new Date(periodEndDate + 'T00:00:00').toLocaleDateString()
            : t('select_end_date')}
        </Text>
      </TouchableOpacity>

      {/* ✅ Clear Period Button */}
      {(periodStartDate || periodEndDate) && (
        <TouchableOpacity
          onPress={() => {
            setPeriodStartDate(null);
            setPeriodEndDate(null);
          }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderRadius: 8,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            marginBottom: spacing.sm,
            borderColor: colors.error,
            backgroundColor: colors.surface
          }}
          activeOpacity={0.8}
        >
          <MaterialIcons name="clear" size={22} color={colors.error} style={{ marginRight: 8 }} />
          <Text style={{ color: colors.error, fontSize: 16, fontWeight: '500' }}>
            {t('clear_period') || 'Clear Period'}
          </Text>
        </TouchableOpacity>
      )}

      {/* ✅ Start Date Picker Modal */}
      <DateTimePickerModal
        isVisible={isStartPickerVisible}
        mode="date"
        onConfirm={date => {
          setPeriodStartDate(getLocalDateString(date));
          setStartPickerVisible(false);
        }}
        onCancel={() => setStartPickerVisible(false)}
        display={Platform.OS === 'android' ? 'spinner' : 'default'}
        maximumDate={getTodayEndOfDay()}
      />

      {/* ✅ End Date Picker Modal */}
      <DateTimePickerModal
        isVisible={isEndPickerVisible}
        mode="date"
        onConfirm={date => {
          setPeriodEndDate(getLocalDateString(date));
          setEndPickerVisible(false);
        }}
        onCancel={() => setEndPickerVisible(false)}
        display={Platform.OS === 'android' ? 'spinner' : 'default'}
        maximumDate={getTodayEndOfDay()}
        minimumDate={periodStartDate ? new Date(periodStartDate + 'T00:00:00') : undefined}
      />

    </View>
  );


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

  // Update transaction count text
  const transactionCountText = t('showing_transactions').replace('{count}', shownTx.length);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
     {/* Absolute Telegram button */}
           <View style={{
             position: 'absolute',
             top: 40,
             right: 5,
             zIndex: 10,
           }}>
             <TelegramBotHeaderButton />
           </View>
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
              {t('transactions_title')}
            </Text>
          </View>

           <TransactionViewSelector /> 

          {viewMode === 'dashboard' && <DashboardView />}
          {viewMode === 'period' && <PeriodView />}
          {viewMode !== 'dashboard' && (
            <View style={{ marginBottom: spacing.md, alignItems: 'center' }}>
              <Text style={{
                fontSize: typography.fontSize.sm,
                color: colors.textSecondary,
              }}>
                {transactionCountText}
              </Text>
            </View>
          )}
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
                  {t('no_transactions_found')}
                </Text>
              </View>
            )
          )}
          
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}