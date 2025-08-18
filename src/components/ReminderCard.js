import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function ReminderCard({ reminder, onPress, getPriorityColor, formatReminderDate }) {
  const isOverdue = reminder.due_datetime && new Date(reminder.due_datetime) < new Date();

  return (
    <TouchableOpacity style={[
      styles.card,
      isOverdue && { borderLeftColor: 'red' }
    ]} onPress={() => onPress(reminder)}>
      <View style={styles.row}>
        <MaterialIcons
          name="notifications-active"
          size={28}
          color={isOverdue ? 'red' : getPriorityColor(reminder.priority)}
          style={{ marginRight: 12 }}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>{reminder.title}</Text>
          {reminder.description ? (
            <Text style={styles.description} numberOfLines={2}>{reminder.description}</Text>
          ) : null}
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[
            styles.priority,
            { color: getPriorityColor(reminder.priority) }
          ]}>
            {reminder.priority?.toUpperCase()}
          </Text>
          {/* Show due date in the same style as TransactionCard */}
          <Text style={styles.date}>
            {reminder.due_datetime
              ? new Date(reminder.due_datetime).toLocaleDateString()
              : ''}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 6,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  title: { fontWeight: 'bold', fontSize: 16, marginBottom: 2 },
  description: { fontSize: 13, color: 'gray' },
  priority: { fontWeight: 'bold', fontSize: 14 },
  date: { fontSize: 12, color: 'gray', marginTop: 2 },
});