import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function RemindersScreen() {
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
        <Text style={styles.title}>🔔 Reminders</Text>
        <Text style={styles.subtitle}>Manage your reminders</Text>
      </View>

      <View style={styles.comingSoon}>
        <Text style={styles.comingSoonText}>
          Reminder Management Coming Soon! 🚧
        </Text>
        
        <View style={styles.featureList}>
          <Text style={styles.featureTitle}>Planned Features:</Text>
          <Text style={styles.featureItem}>• View all reminders</Text>
          <Text style={styles.featureItem}>• Add manual reminders</Text>
          <Text style={styles.featureItem}>• Edit and delete reminders</Text>
          <Text style={styles.featureItem}>• Priority levels</Text>
          <Text style={styles.featureItem}>• Push notifications</Text>
          <Text style={styles.featureItem}>• Recurring reminders</Text>
        </View>
      </View>
    </View>
  );
}