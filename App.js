import 'react-native-gesture-handler'; // Must be at the top
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { DataCacheProvider, useDataCache } from './src/context/DataCacheContext';
import { LanguageProvider } from './src/context/LanguageContext';
import AppNavigator from './src/navigation/AppNavigator';
import NotificationService from './src/services/notificationService';

// Create a wrapper component that has access to both contexts
const AppWithDataInit = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const { initializeData } = useDataCache();
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    // ✅ Only initialize once when user is authenticated, we have user data, not loading, and haven't initialized yet
    if (isAuthenticated && user && !loading && !hasInitialized) {
      console.log('🚀 Initializing data after authentication...');
      
      // ✅ Set flag immediately to prevent multiple initializations
      setHasInitialized(true);
      
      initializeData();
      
      // ✅ Initialize notification service with better error handling
      console.log('🔔 Initializing notification service...');
      
      NotificationService.initialize()
        .then(() => {
          console.log('✅ Notification service initialized successfully');
        })
        .catch(error => {
          console.error('❌ Notification service initialization failed:', error);
          console.log('📱 App will continue without notification features');
        });
    }
    
    // ✅ Reset initialization flag when user logs out
    if (!isAuthenticated && !user) {
      setHasInitialized(false);
    }
  }, [isAuthenticated, user, loading, hasInitialized, initializeData]);

  return <AppNavigator />;
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <DataCacheProvider>
            <LanguageProvider>
              <AppWithDataInit />
            </LanguageProvider>
          </DataCacheProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}