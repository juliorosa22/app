import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // Add this import
import ApiService from '../services/api';

export default function EditTransactionScreen({ route, navigation }) {
  const { transactionId } = route.params;
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch transaction details
    ApiService.getTransactions(365).then(res => {
      if (res.success) {
        const found = res.transactions.find(t => t.id === transactionId);
        setTransaction(found);
      }
    });
  }, [transactionId]);

  const handleUpdate = async () => {
    setLoading(true);
    const updateData = {
      amount: parseFloat(transaction.amount),
      description: transaction.description,
      category: transaction.category,
      merchant: transaction.merchant,
      date: transaction.date,
      transaction_type: transaction.transaction_type,
    };
    const result = await ApiService.updateTransaction(transactionId, updateData);
    setLoading(false);
    if (result.success) {
      Alert.alert('Success', 'Transaction updated');
      navigation.goBack();
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const handleDelete = async () => {
    Alert.alert('Delete', 'Are you sure you want to delete this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          setLoading(true);
          const result = await ApiService.deleteTransaction(transactionId);
          setLoading(false);
          if (result.success) {
            Alert.alert('Deleted', 'Transaction deleted');
            navigation.goBack();
          } else {
            Alert.alert('Error', result.error);
          }
        }
      }
    ]);
  };

  if (!transaction) return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom', 'left', 'right']}>
      <Text>Loading...</Text>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView style={{ padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold' }}>Edit Transaction</Text>
        <Text>Amount</Text>
        <TextInput value={String(transaction.amount)} keyboardType="numeric"
          onChangeText={v => setTransaction({ ...transaction, amount: v })} />
        <Text>Description</Text>
        <TextInput value={transaction.description}
          onChangeText={v => setTransaction({ ...transaction, description: v })} />
        <Text>Category</Text>
        <TextInput value={transaction.category}
          onChangeText={v => setTransaction({ ...transaction, category: v })} />
        <Text>Merchant</Text>
        <TextInput value={transaction.merchant || ''}
          onChangeText={v => setTransaction({ ...transaction, merchant: v })} />
        <Text>Date</Text>
        <TextInput value={transaction.date}
          onChangeText={v => setTransaction({ ...transaction, date: v })} />
        <Text>Type</Text>
        <TextInput value={transaction.transaction_type}
          onChangeText={v => setTransaction({ ...transaction, transaction_type: v })} />
        {/* Show other details if needed */}
        <TouchableOpacity onPress={handleUpdate} disabled={loading}>
          <Text style={{ color: 'white', backgroundColor: 'blue', padding: 12, marginTop: 16 }}>Update</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} disabled={loading}>
          <Text style={{ color: 'white', backgroundColor: 'red', padding: 12, marginTop: 16 }}>Delete</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}