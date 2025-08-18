import React, { useState, useMemo } from 'react';
import { useDataCache } from '../context/DataCacheContext';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import ReminderCard from '../components/ReminderCard';
import { MaterialIcons } from '@expo/vector-icons';
import TelegramBotHeaderButton from '../components/TelegramBotHeaderButton';
import { useLanguage } from '../context/LanguageContext';

export default function RemindersScreen({ navigation }) {
  const { colors, spacing, typography, shadows } = useTheme();
  const { user } = useAuth();
  const { t } = useLanguage();
  
  let reminders = [];
  let getReminders = () => [];
  
  try {
    const dataCache = useDataCache();
    getReminders = dataCache.getReminders;
    reminders = getReminders() || []; // Ensure it's always an array
  } catch (error) {
    console.error('Error accessing data cache:', error);
    reminders = [];
  }

  const [viewType, setViewType] = useState('due');
  const [search, setSearch] = useState('');

  // Early return if there's a critical error (after all hooks are called)
  if (!colors || !user) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>{t('loading')}</Text>
      </SafeAreaView>
    );
  }

  const getPriorityColor = (priority) => {
    switch ((priority || '').toLowerCase()) {
      case 'high': return '#e53935';
      case 'medium': return '#fb8c00';
      case 'low': return '#43a047';
      default: return colors.primary;
    }
  };

  const formatReminderDate = (dateString) => {
    if (!dateString) return 'No due date';
    try {
      const date = new Date(dateString);
      const now = new Date();
      if (isNaN(date.getTime())) return 'Invalid date';
      if (date < now) return 'Overdue';
      const diffTime = date - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Tomorrow';
      if (diffDays < 7) return `In ${diffDays} days`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const remindersByDue = useMemo(() => {
    try {
      return [...(reminders || [])].sort((a, b) => {
        const aDate = a.due_datetime ? new Date(a.due_datetime) : new Date(8640000000000000);
        const bDate = b.due_datetime ? new Date(b.due_datetime) : new Date(8640000000000000);
        return aDate - bDate;
      });
    } catch (error) {
      console.error('Error sorting reminders by due date:', error);
      return [];
    }
  }, [reminders]);

  const remindersByPriority = useMemo(() => {
    try {
      return [...(reminders || [])].sort((a, b) => {
        const order = { high: 0, medium: 1, low: 2 };
        return (order[a.priority?.toLowerCase()] ?? 3) - (order[b.priority?.toLowerCase()] ?? 3);
      });
    } catch (error) {
      console.error('Error sorting reminders by priority:', error);
      return [];
    }
  }, [reminders]);

  const remindersBySearch = useMemo(() => {
    try {
      return (reminders || []).filter(r =>
        (r.description || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.title || '').toLowerCase().includes(search.toLowerCase())
      );
    } catch (error) {
      console.error('Error filtering reminders:', error);
      return [];
    }
  }, [reminders, search]);

  // Render functions
  const renderReminderItem = ({ item }) => (
    <ReminderCard
      reminder={item}
      onPress={(selectedReminder) =>
        navigation.navigate('EditReminderScreen', { reminder: selectedReminder })
      }
      getPriorityColor={getPriorityColor}
      formatReminderDate={formatReminderDate}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        {t('no_reminders_found')}
      </Text>
    </View>
  );

  // View selector component
  const ViewSelector = () => (
    <View style={{ marginBottom: spacing.md }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 0 }}
      >
        <TouchableOpacity
          key="due"
          style={[
            styles.viewButton,
            { borderColor: colors.primary, backgroundColor: viewType === 'due' ? colors.primary : colors.surface },
            viewType === 'due' && styles.viewButtonActive
          ]}
          onPress={() => setViewType('due')}
        >
          <MaterialIcons name="event" size={20} color={viewType === 'due' ? colors.textOnPrimary : colors.primary} />
          <Text style={[
            styles.viewButtonText,
            { color: viewType === 'due' ? colors.textOnPrimary : colors.primary }
          ]}>{t('by_due_date')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          key="priority"
          style={[
            styles.viewButton,
            { borderColor: colors.primary, backgroundColor: viewType === 'priority' ? colors.primary : colors.surface },
            viewType === 'priority' && styles.viewButtonActive
          ]}
          onPress={() => setViewType('priority')}
        >
          <MaterialIcons name="priority-high" size={20} color={viewType === 'priority' ? colors.textOnPrimary : colors.primary} />
          <Text style={[
            styles.viewButtonText,
            { color: viewType === 'priority' ? colors.textOnPrimary : colors.primary }
          ]}>{t('by_priority')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          key="search"
          style={[
            styles.viewButton,
            { borderColor: colors.primary, backgroundColor: viewType === 'search' ? colors.primary : colors.surface },
            viewType === 'search' && styles.viewButtonActive
          ]}
          onPress={() => setViewType('search')}
        >
          <MaterialIcons name="search" size={20} color={viewType === 'search' ? colors.textOnPrimary : colors.primary} />
          <Text style={[
            styles.viewButtonText,
            { color: viewType === 'search' ? colors.textOnPrimary : colors.primary }
          ]}>{t('search_tab')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  // Pick data to show
  let data = [];
  if (viewType === 'due') data = remindersByDue;
  else if (viewType === 'priority') data = remindersByPriority;
  else if (viewType === 'search') data = remindersBySearch;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Absolute Telegram button */}
      <View style={{
        position: 'absolute',
        top: 40,
        right: 5,
        zIndex: 10,
      }}>
        <TelegramBotHeaderButton />
      </View>

      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.primary }]}>{t('reminders_title')}</Text>
      </View>

      <ViewSelector />

      {viewType === 'search' && (
        <TextInput
          style={[
            styles.searchInput,
            { borderColor: colors.border, backgroundColor: colors.surface, color: colors.textPrimary }
          ]}
          placeholder={t('search_placeholder')}
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={colors.textSecondary}
        />
      )}

      <FlatList
        data={data}
        keyExtractor={(item, index) => item.id?.toString() || `reminder-${index}`}
        renderItem={renderReminderItem}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  viewButtonActive: {
    // Empty for now
  },
  viewButtonText: {
    marginLeft: 6,
    fontWeight: 'bold',
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
});