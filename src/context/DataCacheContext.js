import React, { createContext, useContext, useState, useCallback } from 'react';
import ApiService from '../services/api';

const DataCacheContext = createContext();

export const useDataCache = () => {
  const context = useContext(DataCacheContext);
  if (!context) {
    throw new Error('useDataCache must be used within a DataCacheProvider');
  }
  return context;
};

export const DataCacheProvider = ({ children }) => {
  const [cache, setCache] = useState({
    transactions: { data: [], lastFetched: null, isStale: true },
    summary: { data: null, lastFetched: null, isStale: true },
    reminders_30: { data: [], lastFetched: null, isStale: true }
  });

  // Cache duration in milliseconds (5 minutes)
  const CACHE_DURATION = 5 * 60 * 1000;

  const isCacheStale = (lastFetched) => {
    if (!lastFetched) return true;
    return Date.now() - lastFetched > CACHE_DURATION;
  };

  const getTransactions = useCallback(async (days = 30, transactionType = null, forceRefresh = false) => {
    const cacheKey = `transactions_${days}_${transactionType || 'all'}`;
    const cachedData = cache[cacheKey];

    if (!forceRefresh && cachedData && !isCacheStale(cachedData.lastFetched)) {
      return { success: true, ...cachedData.data, fromCache: true };
    }

    const result = await ApiService.getTransactions(days, transactionType);
    if (result.success) {
      setCache(prev => ({
        ...prev,
        [cacheKey]: {
          data: result,
          lastFetched: Date.now(),
          isStale: false
        }
      }));
    }
    return result;
  }, [cache]);

  const getTransactionSummary = useCallback(async (days = 30, forceRefresh = false) => {
    const cacheKey = `summary_${days}`;
    const cachedData = cache[cacheKey];

    if (!forceRefresh && cachedData && !isCacheStale(cachedData.lastFetched)) {
      return { success: true, ...cachedData.data, fromCache: true };
    }

    const result = await ApiService.getTransactionSummary(days);
    if (result.success) {
      setCache(prev => ({
        ...prev,
        [cacheKey]: {
          data: result,
          lastFetched: Date.now(),
          isStale: false
        }
      }));
    }
    return result;
  }, [cache]);

  const getReminders = useCallback(async (days = 30, forceRefresh = false) => {
    const cacheKey = `reminders_${days}`;
    const cachedData = cache[cacheKey];

    if (!forceRefresh && cachedData && !isCacheStale(cachedData.lastFetched)) {
      return { success: true, reminders: cachedData.data, fromCache: true };
    }

    const result = await ApiService.getReminders(days);
    if (result.success) {
      setCache(prev => ({
        ...prev,
        [cacheKey]: {
          data: result.reminders,
          lastFetched: Date.now(),
          isStale: false
        }
      }));
    }
    return result;
  }, [cache]);

  const invalidateCache = useCallback((keys = null) => {
    if (keys) {
      setCache(prev => {
        const newCache = { ...prev };
        keys.forEach(key => {
          if (newCache[key]) {
            newCache[key].isStale = true;
          }
        });
        return newCache;
      });
    } else {
      // Invalidate all cache
      setCache(prev => {
        const newCache = {};
        Object.keys(prev).forEach(key => {
          newCache[key] = { ...prev[key], isStale: true };
        });
        return newCache;
      });
    }
  }, []);

  const clearCache = useCallback(() => {
    setCache({
      transactions: { data: [], lastFetched: null, isStale: true },
      summary: { data: null, lastFetched: null, isStale: true },
      reminders_30: { data: [], lastFetched: null, isStale: true }
    });
  }, []);

  return (
    <DataCacheContext.Provider value={{
      getTransactions,
      getTransactionSummary,
      getReminders,
      invalidateCache,
      clearCache,
      cache
    }}>
      {children}
    </DataCacheContext.Provider>
  );
};