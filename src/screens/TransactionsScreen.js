import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Button, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useDataCache } from '../context/DataCacheContext'; // Add this import
import TransactionCard from '../components/TransactionCard';
import { useFocusEffect } from '@react-navigation/native';

export default function TransactionsScreen({ navigation }) {
  const { colors, spacing, typography, shadows } = useTheme();
  const { getTransactions, invalidateCache } = useDataCache(); // Use cache instead of ApiService
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'custom'
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    category: '',
    type: '', // 'expense' or 'income'
  });

  // Load data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [viewMode, filters])
  );

  const fetchTransactions = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(!forceRefresh);
      
      let days = viewMode === 'month' ? 30 : 365; // Get more data for custom filtering
      const result = await getTransactions(days, filters.type, forceRefresh);
      
      if (result.success) {
        let filtered = result.transactions;
        
        // Apply custom date filters if in custom mode
        if (viewMode === 'custom') {
          if (filters.startDate) {
            filtered = filtered.filter(t => new Date(t.date) >= new Date(filters.startDate));
          }
          if (filters.endDate) {
            filtered = filtered.filter(t => new Date(t.date) <= new Date(filters.endDate));
          }
        }
        
        // Apply category filter
        if (filters.category) {
          filtered = filtered.filter(t => t.category === filters.category);
        }
        
        setTransactions(filtered);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [viewMode, filters, getTransactions]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Invalidate cache and force refresh
    invalidateCache([`transactions_${viewMode === 'month' ? 30 : 365}_${filters.type || 'all'}`]);
    fetchTransactions(true);
  }, [fetchTransactions, invalidateCache, viewMode, filters.type]);

  const handleViewModeChange = useCallback((newMode) => {
    setViewMode(newMode);
    setLoading(true);
  }, []);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setLoading(true);
  }, []);

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
          {/* Header */}
          <View style={{ marginBottom: spacing.lg }}>
            <Text style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.primary,
              marginBottom: spacing.sm,
            }}>
              💳 Transactions
            </Text>
            <Text style={{
              fontSize: typography.fontSize.base,
              color: colors.textSecondary,
              marginBottom: spacing.lg,
            }}>
              Manage, analyze, and filter your transactions with ease.
            </Text>
          </View>

          {/* View Mode Toggle */}
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'center', 
            marginBottom: spacing.md,
            gap: spacing.sm 
          }}>
            <Button 
              title="Current Month" 
              onPress={() => handleViewModeChange('month')}
              color={viewMode === 'month' ? colors.primary : colors.textSecondary}
            />
            <Button 
              title="Custom Filter" 
              onPress={() => handleViewModeChange('custom')}
              color={viewMode === 'custom' ? colors.primary : colors.textSecondary}
            />
          </View>

          {/* Custom Filters */}
          {viewMode === 'custom' && (
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
                Filter Options
              </Text>
              
              {/* Transaction Type Filter */}
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-around',
                marginBottom: spacing.sm 
              }}>
                <Button 
                  title="All" 
                  onPress={() => handleFilterChange({ type: '' })}
                  color={filters.type === '' ? colors.primary : colors.textSecondary}
                />
                <Button 
                  title="Expenses" 
                  onPress={() => handleFilterChange({ type: 'expense' })}
                  color={filters.type === 'expense' ? colors.primary : colors.textSecondary}
                />
                <Button 
                  title="Income" 
                  onPress={() => handleFilterChange({ type: 'income' })}
                  color={filters.type === 'income' ? colors.primary : colors.textSecondary}
                />
              </View>
              
              <Text style={{
                fontSize: typography.fontSize.sm,
                color: colors.textSecondary,
                textAlign: 'center',
              }}>
                Date range and category filters coming soon
              </Text>
            </View>
          )}

          {/* Transaction Count */}
          <View style={{ 
            marginBottom: spacing.md,
            alignItems: 'center' 
          }}>
            <Text style={{
              fontSize: typography.fontSize.sm,
              color: colors.textSecondary,
            }}>
              Showing {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            </Text>
          </View>

          {/* Transaction Cards */}
          {transactions.length > 0 ? (
            transactions.map(tx => (
              <TransactionCard
                key={tx.id}
                transaction={tx}
                onPress={(selectedTx) => navigation.navigate('EditTransactionScreen', { transaction: selectedTx })}
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
              <Text style={{
                fontSize: typography.fontSize.sm,
                color: colors.textLight,
                textAlign: 'center',
                marginTop: spacing.xs,
              }}>
                {viewMode === 'custom' && (filters.type || filters.category) 
                  ? 'Try adjusting your filters'
                  : 'Start by adding your first transaction'
                }
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}