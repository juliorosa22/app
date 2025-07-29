import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

// Main App Screens
import HomeScreen from '../screens/HomeScreen';
import ExpensesScreen from '../screens/ExpensesScreen';
import RemindersScreen from '../screens/RemindersScreen';
import SettingsScreen from '../screens/SettingsScreen';
import QuickAddScreen from '../screens/QuickAddScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Custom Tab Bar Icon Component
function TabIcon({ icon, focused, color }) {
  return (
    <Text style={{ 
      fontSize: 24, 
      color: focused ? color : '#9CA3AF',
      marginBottom: -3 
    }}>
      {icon}
    </Text>
  );
}

// Bottom Tab Navigator
function MainTabNavigator() {
  const { colors, typography } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: colors.textOnPrimary,
        headerTitleStyle: {
          fontWeight: '600',
          color: colors.textOnPrimary,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 70,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.medium,
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Okan Assist',
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon="🏠" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Expenses"
        component={ExpensesScreen}
        options={{
          title: 'Expenses',
          tabBarLabel: 'Expenses',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon="💰" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="QuickAdd"
        component={QuickAddScreen}
        options={{
          title: 'Quick Add',
          tabBarLabel: 'Add',
          tabBarIcon: ({ focused, color }) => (
            <View style={{
              backgroundColor: focused ? colors.primary : colors.primaryLight,
              width: 40,
              height: 40,
              borderRadius: 20,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 5,
            }}>
              <Text style={{ 
                fontSize: 20, 
                color: colors.textOnPrimary,
              }}>
                +
              </Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Reminders"
        component={RemindersScreen}
        options={{
          title: 'Reminders',
          tabBarLabel: 'Reminders',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon="🔔" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon="⚙️" focused={focused} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Auth Stack Navigator
function AuthNavigator() {
  const { colors } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontWeight: '600',
          color: colors.textPrimary,
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{ 
          title: 'Create Account',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
}

// Loading Screen Component
function LoadingScreen() {
  const { colors, spacing, typography } = useTheme();
  
  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    }}>
      <Text style={{
        fontSize: typography.fontSize['2xl'],
        marginBottom: spacing.md,
      }}>💰</Text>
      <Text style={{
        fontSize: typography.fontSize.lg,
        color: colors.primary,
        fontWeight: typography.fontWeight.medium,
      }}>Loading...</Text>
    </View>
  );
}

// Root App Navigator
export default function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();
  const { colors } = useTheme();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return (
    <NavigationContainer
      theme={{
        colors: {
          primary: colors.primary,
          background: colors.background,
          card: colors.surface,
          text: colors.textPrimary,
          border: colors.border,
          notification: colors.error,
        },
      }}
    >
      {isAuthenticated ? <MainTabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}