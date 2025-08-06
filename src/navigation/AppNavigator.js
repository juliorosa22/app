import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { MaterialIcons, Feather, FontAwesome5 } from '@expo/vector-icons'; // Import needed icon libraries
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

// Screens
import HomeScreen from '../screens/HomeScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import RemindersScreen from '../screens/RemindersScreen';
import QuickAddScreen from '../screens/QuickAddScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import EditTransactionScreen from '../screens/EditTransactionScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// TabIcon now uses only 'name' as key
function TabIcon({ name, color, size = 26 }) {
  const { icons } = useTheme();
  const icon = icons[name];

  // Use emoji if provided
  if (icon?.emoji) {
    return <Text style={{ fontSize: size, color }}>{icon.emoji}</Text>;
  }

  // Use icon library
  if (icon?.library === 'MaterialIcons') {
    return <MaterialIcons name={icon.name} size={size} color={color} />;
  }
  if (icon?.library === 'Feather') {
    return <Feather name={icon.name} size={size} color={color} />;
  }
  if (icon?.library === 'FontAwesome5') {
    return <FontAwesome5 name={icon.name} size={size} color={color} />;
  }

  // Default fallback
  return null;
}

// Floating Quick Add Button using TabIcon
function FloatingQuickAdd() {
  const navigation = useNavigation();
  const { colors, spacing, shadows } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <TouchableOpacity
      style={{
        position: 'absolute',
        alignSelf: 'center',
        bottom: (insets.bottom || 0) + 24, // Add safe area inset to bottom
        zIndex: 10,
        backgroundColor: colors.primary,
        borderRadius: 32,
        padding: 5,
        ...shadows.lg,
        elevation: 10,
      }}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('QuickAddScreen')}
    >
      <TabIcon name="quickAdd" color={colors.textOnPrimary} size={24} />
    </TouchableOpacity>
  );
}

// Main Bottom Tab Navigator
import { useNavigationState } from '@react-navigation/native';

function MainTabNavigator() {
  const { colors, typography, spacing } = useTheme();
  // Get the current route name from navigation state
  const routeNames = global.navigationRef.current?.getCurrentRoute?.();
  const isQuickAddOpen = routeNames?.name === 'QuickAddScreen';

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom', 'left', 'right']}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            height: 56, // Reduce height for Android
            paddingBottom: spacing.xs,
            paddingTop: spacing.xs,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarLabelStyle: {
            display: 'none', // Hide label text
          },
          tabBarShowLabel: false, // Hide label text
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            //title: 'Home',
            //tabBarLabel: 'Home',
            tabBarIcon: () => <TabIcon name="home" color="black" />,
          }}
        />
        <Tab.Screen
          name="Transactions"
          component={TransactionsScreen}
          options={{
            //title: 'Transactions',
            //tabBarLabel: 'Transactions',
            tabBarIcon: () => <TabIcon name="transactions" color="black" />,
          }}
        />
        <Tab.Screen
          name="Reminders"
          component={RemindersScreen}
          options={{
            //title: 'Reminders',
            //tabBarLabel: 'Reminders',
            tabBarIcon: () => <TabIcon name="reminders" color="black" />,
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            //title: 'Settings',
            //tabBarLabel: 'Settings',
            tabBarIcon: ({ color }) => <TabIcon name="settings" color={color} />,
          }}
        />
      </Tab.Navigator>
      {/* Hide button when QuickAddScreen is open */}
      {!isQuickAddOpen && <FloatingQuickAdd navigation={global.navigationRef.current} />}
    </SafeAreaView>
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

// App Stack Navigator
function AppStackNavigator() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: '600', color: colors.textPrimary },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditTransaction"
        component={EditTransactionScreen}
        options={{ title: 'Edit Transaction' }}
      />
      <Stack.Screen
        name="QuickAddScreen"
        component={QuickAddScreen}
        options={{
          title: 'Add',
          //presentation: 'modal', // Optional: show as modal
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

// Navigation ref for floating button navigation
import { createNavigationContainerRef } from '@react-navigation/native';
global.navigationRef = createNavigationContainerRef();

// Root App Navigator
export default function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();
  const { colors } = useTheme();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer
      ref={global.navigationRef}
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
      {isAuthenticated ? <AppStackNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}