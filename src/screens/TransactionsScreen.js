import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { MaterialIcons, Feather, FontAwesome5 } from '@expo/vector-icons';

export default function TransactionsScreen({ navigation }) {
  const { colors, spacing, typography, shadows } = useTheme();

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
  });

  return (
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
    </ScrollView>
  );
}