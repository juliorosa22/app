import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function ExpensesScreen() {
  const { colors, spacing, typography, shadows } = useTheme();
  const { user } = useAuth();

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
    },
    comingSoon: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    comingSoonText: {
      fontSize: typography.fontSize.lg,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    featureList: {
      backgroundColor: colors.surface,
      padding: spacing.lg,
      borderRadius: 12,
      ...shadows.md,
    },
    featureTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: colors.textPrimary,
      marginBottom: spacing.md,
    },
    featureItem: {
      fontSize: typography.fontSize.base,
      color: colors.textSecondary,
      marginBottom: spacing.sm,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>💰 Expenses</Text>
        <Text style={styles.subtitle}>Manage your expenses</Text>
      </View>

      <View style={styles.comingSoon}>
        <Text style={styles.comingSoonText}>
          Expense Management Coming Soon! 🚧
        </Text>
        
        <View style={styles.featureList}>
          <Text style={styles.featureTitle}>Planned Features:</Text>
          <Text style={styles.featureItem}>• View all expenses</Text>
          <Text style={styles.featureItem}>• Add manual expenses</Text>
          <Text style={styles.featureItem}>• Edit and delete expenses</Text>
          <Text style={styles.featureItem}>• Category filtering</Text>
          <Text style={styles.featureItem}>• Expense analytics</Text>
          <Text style={styles.featureItem}>• Export data</Text>
        </View>
      </View>
    </View>
  );
}