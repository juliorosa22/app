import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function QuickAddScreen({ navigation }) {
  const { colors, spacing, typography, shadows } = useTheme();
  const [selectedType, setSelectedType] = useState(null);

  const handleAddExpense = () => {
    Alert.alert(
      'Add Expense',
      'Expense creation coming soon!',
      [{ text: 'OK' }]
    );
  };

  const handleAddReminder = () => {
    Alert.alert(
      'Add Reminder',
      'Reminder creation coming soon!',
      [{ text: 'OK' }]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: spacing.lg,
      justifyContent: 'center',
    },
    header: {
      alignItems: 'center',
      marginBottom: spacing.xxxl,
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
    optionsContainer: {
      gap: spacing.lg,
      marginBottom: spacing.xxxl,
    },
    optionCard: {
      backgroundColor: colors.surface,
      padding: spacing.xl,
      borderRadius: 16,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.border,
      ...shadows.md,
    },
    optionCardSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryLight + '10',
    },
    optionIcon: {
      fontSize: 48,
      marginBottom: spacing.md,
    },
    optionTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },
    optionDescription: {
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    comingSoonBadge: {
      backgroundColor: colors.warning,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 12,
      marginTop: spacing.sm,
    },
    comingSoonText: {
      color: colors.textOnPrimary,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.medium,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quick Add</Text>
        <Text style={styles.subtitle}>What would you like to add?</Text>
      </View>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[
            styles.optionCard,
            selectedType === 'expense' && styles.optionCardSelected,
          ]}
          onPress={handleAddExpense}
        >
          <Text style={styles.optionIcon}>💰</Text>
          <Text style={styles.optionTitle}>Add Expense</Text>
          <Text style={styles.optionDescription}>
            Record a new expense transaction
          </Text>
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>Coming Soon</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.optionCard,
            selectedType === 'reminder' && styles.optionCardSelected,
          ]}
          onPress={handleAddReminder}
        >
          <Text style={styles.optionIcon}>🔔</Text>
          <Text style={styles.optionTitle}>Add Reminder</Text>
          <Text style={styles.optionDescription}>
            Create a new reminder or task
          </Text>
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>Coming Soon</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}