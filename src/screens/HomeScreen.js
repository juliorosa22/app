import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';


export default function HomeScreen({ navigation }) {
  const { colors, spacing, typography, shadows } = useTheme();
  const { user } = useAuth();

  // Mock data for recent expenses and reminders
  const recentExpenses = [
    { id: '1', description: 'Coffee Shop', amount: 4.50, category: 'Food', date: '2024-01-15', currency: 'USD' },
    { id: '2', description: 'Uber Ride', amount: 12.30, category: 'Transport', date: '2024-01-14', currency: 'USD' },
    { id: '3', description: 'Grocery Store', amount: 45.67, category: 'Food', date: '2024-01-13', currency: 'USD' },
    { id: '4', description: 'Gas Station', amount: 35.00, category: 'Transport', date: '2024-01-12', currency: 'USD' },
  ];

  const recentReminders = [
    { id: '1', title: 'Doctor Appointment', description: 'Annual checkup', date: '2024-01-20', priority: 'high', completed: false },
    { id: '2', title: 'Pay Electricity Bill', description: 'Due tomorrow', date: '2024-01-16', priority: 'urgent', completed: false },
    { id: '3', title: 'Call Mom', description: 'Weekly call', date: '2024-01-18', priority: 'medium', completed: false },
    { id: '4', title: 'Submit Report', description: 'Monthly sales report', date: '2024-01-19', priority: 'high', completed: false },
  ];

  const getCurrencySymbol = (currency) => {
    const symbols = { USD: '$', EUR: '€', BRL: 'R$', GBP: '£', JPY: '¥' };
    return symbols[currency] || '$';
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
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderExpenseItem = ({ item }) => (
    <TouchableOpacity style={styles.itemCard} onPress={() => navigation.navigate('Expenses')}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>{item.description}</Text>
        <Text style={styles.itemAmount}>
          {getCurrencySymbol(item.currency)}{item.amount.toFixed(2)}
        </Text>
      </View>
      <View style={styles.itemFooter}>
        <Text style={styles.itemCategory}>{item.category}</Text>
        <Text style={styles.itemDate}>{formatDate(item.date)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderReminderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemCard} onPress={() => navigation.navigate('Reminders')}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(item.priority) }]} />
      </View>
      <Text style={styles.itemDescription}>{item.description}</Text>
      <View style={styles.itemFooter}>
        <Text style={[styles.itemPriority, { color: getPriorityColor(item.priority) }]}>
          {item.priority.toUpperCase()}
        </Text>
        <Text style={styles.itemDate}>{formatDate(item.date)}</Text>
      </View>
    </TouchableOpacity>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      padding: spacing.md,
      paddingBottom: 100, // Space for bottom navigation
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
    },
    itemAmount: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.bold,
      color: colors.expense,
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
    
    <View style={styles.container}>
      
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.nameText}>{user?.name || 'User'}</Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.statCard}>
            <Text style={styles.statAmount}>$247.50</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statAmount}>4</Text>
            <Text style={styles.statLabel}>Pending Tasks</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statAmount}>12</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
        </View>

        {/* Recent Expenses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>💰 Recent Expenses</Text>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => navigation.navigate('Expenses')}
            >
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {recentExpenses.length > 0 ? (
            <FlatList
              data={recentExpenses.slice(0, 3)}
              renderItem={renderExpenseItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No recent expenses</Text>
            </View>
          )}
        </View>

        {/* Recent Reminders */}
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
          
          {recentReminders.length > 0 ? (
            <FlatList
              data={recentReminders.slice(0, 3)}
              renderItem={renderReminderItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No upcoming reminders</Text>
            </View>
          )}
        </View>
      </ScrollView>
      
    </View>
  );
}