import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDataCache } from '../context/DataCacheContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import DateTimePickerModal from "react-native-modal-datetime-picker";

export default function EditReminderScreen({ route, navigation }) {
  const { reminder } = route.params;
  const [reminderState, setReminderState] = useState({ ...reminder });
  const [loading, setLoading] = useState(false);
  const { updateReminder, deleteReminder } = useDataCache();
  const { colors, spacing, typography, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  // Date picker state
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return '#43a047';
      case 'medium': return '#fb8c00';
      case 'high': return '#e53935';
      case 'urgent': return '#8e24aa';
      default: return colors.primary;
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    const updateData = {
      title: reminderState.title,
      description: reminderState.description,
      due_datetime: reminderState.due_datetime,
      priority: reminderState.priority,
      is_completed: reminderState.is_completed,
    };
    await updateReminder(reminderState.id, updateData);
    setLoading(false);
    Alert.alert(t('success'), t('reminder_updated'));
    navigation.goBack();
  };

  const handleDelete = async () => {
    Alert.alert(
      t('delete_confirm_title'),
      t('delete_confirm_message'),
      [
        { text: t('delete_cancel'), style: 'cancel' },
        {
          text: t('delete_confirm'), style: 'destructive', onPress: async () => {
            setLoading(true);
            await deleteReminder(reminderState.id);
            setLoading(false);
            Alert.alert(t('deleted'), t('reminder_deleted'));
            navigation.goBack();
          }
        }
      ]
    );
  };

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleConfirm = (date) => {
    setReminderState({ ...reminderState, due_datetime: date.toISOString() });
    hideDatePicker();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView style={{ flex: 1, padding: spacing.lg }}>
        <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
          <Text style={{
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.primary,
            marginBottom: spacing.sm,
          }}>
            {t('edit_reminder_title')}
          </Text>
        </View>

        {/* Title */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>{t('title_label')}</Text>
          <TextInput
            style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.border }]}
            placeholder={t('title_placeholder')}
            placeholderTextColor={colors.textLight}
            value={reminderState.title}
            onChangeText={v => setReminderState({ ...reminderState, title: v })}
            maxLength={100}
          />
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>{t('description_label')}</Text>
          <TextInput
            style={[styles.input, styles.textArea, { color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.border }]}
            placeholder={t('description_placeholder')}
            placeholderTextColor={colors.textLight}
            value={reminderState.description}
            onChangeText={v => setReminderState({ ...reminderState, description: v })}
            multiline
            maxLength={500}
          />
        </View>

        {/* Completed toggle */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>{t('completed_label')}</Text>
          <TouchableOpacity
            onPress={() => setReminderState({ ...reminderState, is_completed: !reminderState.is_completed })}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 8,
            }}
            activeOpacity={0.8}
          >
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                borderWidth: 2,
                borderColor: reminderState.is_completed ? colors.success : colors.border,
                backgroundColor: reminderState.is_completed ? colors.success : colors.surface,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              {reminderState.is_completed && (
                <MaterialIcons name="check" size={20} color="#fff" />
              )}
            </View>
            <Text style={{ color: colors.textPrimary, fontSize: 16 }}>
              {reminderState.is_completed ? t('completed_label') : t('mark_completed')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Due Date and Time */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>{t('due_label')}</Text>
          <TouchableOpacity
            onPress={showDatePicker}
            style={[
              styles.dateTimeRow,
              { borderColor: colors.border, backgroundColor: colors.surface }
            ]}
            activeOpacity={0.8}
          >
            <MaterialIcons name="event" size={22} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={{ color: colors.textPrimary, fontSize: 16 }}>
              {reminderState.due_datetime
                ? new Date(reminderState.due_datetime).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                : t('due_placeholder')}
            </Text>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="datetime"
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
            display={Platform.OS === 'android' ? 'spinner' : 'default'}
          />
        </View>

        {/* Priority as a slider */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>{t('priority_label')}</Text>
          <View style={styles.prioritySlider}>
            {['low', 'medium', 'high', 'urgent'].map((priority, idx) => (
              <TouchableOpacity
                key={priority}
                style={[
                  styles.priorityDot,
                  reminderState.priority === priority && styles.priorityDotActive,
                  { backgroundColor: getPriorityColor(priority) }
                ]}
                onPress={() => setReminderState({ ...reminderState, priority })}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.priorityLabel,
                  reminderState.priority === priority && styles.priorityLabelActive
                ]}>
                  {t(`priority_${priority}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.priorityLabelsRow}>
            <Text style={styles.priorityLabelText}>{t('priority_low')}</Text>
            <Text style={styles.priorityLabelText}>{t('priority_medium')}</Text>
            <Text style={styles.priorityLabelText}>{t('priority_high')}</Text>
            <Text style={styles.priorityLabelText}>{t('priority_urgent')}</Text>
          </View>
        </View>

        {/* Update Button */}
        <TouchableOpacity
          onPress={handleUpdate}
          disabled={loading}
          style={[
            styles.submitButton,
            loading && styles.submitButtonDisabled,
            { marginBottom: spacing.md }
          ]}
        >
          <Text style={styles.submitButtonText}>{t('update_button')}</Text>
        </TouchableOpacity>
        {/* Delete Button */}
        <TouchableOpacity
          onPress={handleDelete}
          disabled={loading}
          style={[
            styles.submitButton,
            { backgroundColor: colors.error, marginBottom: insets.bottom }
          ]}
        >
          <Text style={styles.submitButtonText}>{t('delete_button')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 2,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 8,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 4,
    marginBottom: 4,
  },
  prioritySlider: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
    marginHorizontal: 4,
  },
  priorityDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.4,
    marginHorizontal: 2,
  },
  priorityDotActive: {
    borderWidth: 2,
    borderColor: '#2196f3',
    opacity: 1,
  },
  priorityLabel: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    opacity: 0.7,
  },
  priorityLabelActive: {
    opacity: 1,
  },
  priorityLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 4,
  },
  priorityLabelText: {
    fontSize: 12,
    color: '#888',
    width: 32,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#2196f3',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    elevation: 2,
  },
  submitButtonDisabled: {
    backgroundColor: '#90caf9',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});