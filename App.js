import 'react-native-gesture-handler'; // Must be at the top
import React from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { DataCacheProvider } from './src/context/DataCacheContext'; // Add this
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <DataCacheProvider>
            <AppNavigator />
          </DataCacheProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}