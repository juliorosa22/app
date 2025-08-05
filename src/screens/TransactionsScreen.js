import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Button } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import ApiService from '../services/api';
import { MaterialIcons, Feather, FontAwesome5 } from '@expo/vector-icons';

export default function TransactionsScreen({ navigation }) {
  const { colors, spacing, typography, shadows } = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'custom'
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    category: '',
    type: '', // 'expense' or 'income'
  });

  useEffect(() => {
    fetchTransactions();
  }, [viewMode, filters]);

  const fetchTransactions = async () => {
    let days = viewMode === 'month' ? 30 : null;
    let result = await ApiService.getTransactions(days, filters.type);
    if (result.success) {
      let filtered = result.transactions;
      if (viewMode === 'custom') {
        if (filters.startDate) {
          filtered = filtered.filter(t => new Date(t.date) >= new Date(filters.startDate));
        }
        if (filters.endDate) {
          filtered = filtered.filter(t => new Date(t.date) <= new Date(filters.endDate));
        }
      }
      if (filters.category) {
        filtered = filtered.filter(t => t.category === filters.category);
      }
      setTransactions(filtered);
    }
  };

  // Feature cards data
  const features = [
    {
      icon: <MaterialIcons name="list-alt" size={28} color={colors.primary} />,
      label: 'View all Transactions',
      onPress: () => navigation?.navigate('AllTransactions'),
    },
    {
      icon: <Feather name="plus-circle" size={28} color={colors.success} />,
      label: 'Add Manual Transaction',
      onPress: () => navigation?.navigate('AddTransaction'),
    },
    {
      icon: <Feather name="edit" size={26} color={colors.warning} />,
      label: 'Edit & Delete Transaction',
      onPress: () => navigation?.navigate('EditTransaction'),
    },
    {
      icon: <FontAwesome5 name="filter" size={24} color={colors.info} />,
      label: 'Category Filtering',
      onPress: () => navigation?.navigate('CategoryFilter'),
    },
    {
      icon: <MaterialIcons name="analytics" size={28} color={colors.primaryDark} />,
      label: 'Expense Analytics',
      onPress: () => navigation?.navigate('ExpenseAnalytics'),
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: spacing.md,
    },
    header: {
      marginBottom: spacing.lg,
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
      marginBottom: spacing.lg,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: spacing.lg,
      marginBottom: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      ...shadows.md,
    },
    cardIcon: {
      marginRight: spacing.lg,
    },
    cardText: {
      fontSize: typography.fontSize.lg,
      color: colors.textPrimary,
      fontWeight: typography.fontWeight.medium,
    },
    transactionCard: {
      backgroundColor: '#fff',
      margin: 8,
      padding: 16,
      borderRadius: 12,
      elevation: 2,
    },
    amount: { fontWeight: 'bold', fontSize: 18 },
    desc: { fontSize: 16 },
    cat: { fontSize: 14, color: 'gray' },
    date: { fontSize: 12, color: 'gray' },
  });

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>💳 Transactions</Text>
          <Text style={styles.subtitle}>
            Manage, analyze, and filter your transactions with ease.
          </Text>
        </View>
        {features.map((feature, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.card}
            activeOpacity={0.8}
            onPress={feature.onPress}
          >
            <View style={styles.cardIcon}>{feature.icon}</View>
            <Text style={styles.cardText}>{feature.label}</Text>
          </TouchableOpacity>
        ))}
        {/* Switch View */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', margin: 8 }}>
          <Button title="Current Month" onPress={() => setViewMode('month')} />
          <Button title="Custom Filter" onPress={() => setViewMode('custom')} />
        </View>
        {/* Filters for custom view */}
        {viewMode === 'custom' && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', margin: 8 }}>
            {/* Add date pickers, category dropdown, type toggle here */}
            {/* For brevity, use TextInputs or Buttons */}
          </View>
        )}
        {/* Transaction Cards */}
        <ScrollView>
          {transactions.map(tx => (
            <TouchableOpacity
              key={tx.id}
              style={styles.transactionCard}
              onPress={() => navigation.navigate('EditTransactionScreen', { transactionId: tx.id })}
            >
              <Text style={styles.amount}>{tx.amount} {tx.transaction_type === 'expense' ? '-' : '+'}</Text>
              <Text style={styles.desc}>{tx.description}</Text>
              <Text style={styles.cat}>{tx.category}</Text>
              <Text style={styles.date}>{new Date(tx.date).toLocaleDateString()}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>
    </View>
  );
}