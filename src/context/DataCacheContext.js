import React, { createContext, useContext, useState, useCallback } from 'react';
import ApiService from '../services/api';

const DataCacheContext = createContext();

export const useDataCache = () => {
  const context = useContext(DataCacheContext);
  if (!context) throw new Error('useDataCache must be used within a DataCacheProvider');
  return context;
};

export const DataCacheProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [categories, setCategories] = useState({ expense: [], income: [] });
  const [loading, setLoading] = useState(false);

  // 1. Fetch all data on login
  const initializeData = useCallback(async () => {
    setLoading(true);
    try {
      const [txResult, remResult, catResult] = await Promise.all([
        ApiService.getTransactions(365),
        ApiService.getReminders(true, 1000),
        ApiService.getCategories?.()
      ]);
      setTransactions(txResult.success ? txResult.transactions || [] : []);
      setReminders(remResult.success ? remResult.reminders || [] : []);
      setCategories(catResult?.success ? catResult.categories || { expense: [], income: [] } : { expense: [], income: [] });
    } catch (e) {
      setTransactions([]);
      setReminders([]);
      setCategories({ expense: [], income: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Local selectors for screens/views
  const getTransactions = useCallback((filterFn = null) => {
    return filterFn ? transactions.filter(filterFn) : transactions;
  }, [transactions]);

  const getReminders = useCallback((filterFn = null) => {
    return filterFn ? reminders.filter(filterFn) : reminders;
  }, [reminders]);

  // 3. Mutations: update local cache, then remote
  const addTransaction = async (tx) => {
    setTransactions(prev => [tx, ...prev]);
    await ApiService.createTransaction(tx);
    // Optionally re-fetch or update with server response
  };

  const updateTransaction = async (id, updateData) => {
    const originalTransactions = transactions;
    try {
      // Optimistic update
      setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, ...updateData } : tx));
      const result = await ApiService.updateTransaction(id, updateData);
      
      if (!result.success) {
        throw new Error(result.message || 'Update failed');
      }
    } catch (error) {
      // Rollback on failure
      setTransactions(originalTransactions);
      throw error;
    }
  };

  const deleteTransaction = async (id) => {
    setTransactions(prev => prev.filter(tx => tx.id !== id));
    await ApiService.deleteTransaction(id);
  };

  const addReminder = async (rem) => {
    setReminders(prev => [rem, ...prev]);
    await ApiService.createReminder(rem);
  };

  const updateReminder = async (id, updateData) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, ...updateData } : r));
    await ApiService.updateReminder(id, updateData);
  };

  const deleteReminder = async (id) => {
    setReminders(prev => prev.filter(r => r.id !== id));
    await ApiService.deleteReminder(id);
  };

  // Optionally: clear cache on logout
  const clearCache = () => {
    setTransactions([]);
    setReminders([]);
  };

  const invalidateCache = () => {
    setTransactions([]);
    setReminders([]);
  };

  return (
    <DataCacheContext.Provider value={{
      loading,
      initializeData,
      getTransactions,
      getReminders,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addReminder,
      updateReminder,
      deleteReminder,
      clearCache,
      invalidateCache,
      transactions,
      reminders,
      categories,
    }}>
      {children}
    </DataCacheContext.Provider>
  );
};

