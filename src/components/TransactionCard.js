import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { formatValue } from 'react-currency-input-field';
import { getCurrencyConfig } from '../utils/currencyHelper';

export default function TransactionCard({ transaction, onPress, currency = 'USD' }) {
  const currencyConfig = getCurrencyConfig(currency);
  
  const formattedAmount = formatValue({
    value: String(transaction.amount || 0), // Convert to string
    ...currencyConfig,
  });

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(transaction)}>
      <View style={styles.row}>
        <MaterialIcons
          name={transaction.transaction_type === 'expense' ? 'money-off' : 'attach-money'}
          size={28}
          color={transaction.transaction_type === 'expense' ? 'red' : 'green'}
          style={{ marginRight: 12 }}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.description} numberOfLines={1}>{transaction.description}</Text>
          <Text style={styles.category}>{transaction.category}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[
            styles.amount,
            { color: transaction.transaction_type === 'expense' ? 'red' : 'green' }
          ]}>
            {transaction.transaction_type === 'expense' ? '-' : '+'}
            {formattedAmount}
          </Text>
          <Text style={styles.date}>
            {new Date(transaction.date).toLocaleDateString()}
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
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  description: { fontWeight: 'bold', fontSize: 16, marginBottom: 2 },
  category: { fontSize: 13, color: 'gray' },
  amount: { fontWeight: 'bold', fontSize: 18 },
  date: { fontSize: 12, color: 'gray', marginTop: 2 },
});