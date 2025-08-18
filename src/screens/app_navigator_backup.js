import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image, Linking, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { MaterialIcons, Feather, FontAwesome5 } from '@expo/vector-icons'; // Import needed icon libraries
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import LottieView from 'lottie-react-native';

// Screens
import HomeScreen from '../screens/HomeScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import RemindersScreen from '../screens/RemindersScreen';
import QuickAddScreen from '../screens/QuickAddScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import EditTransactionScreen from '../screens/EditTransactionScreen';
import EditReminderScreen from '../screens/EditReminderScreen'; // <-- Add this import
import TelegramBotHeaderButton from '../components/TelegramBotHeaderButton';



// TabIcon now uses only 'name' as key
function TabIcon({ name, color, size = 26, opacity = 1 }) {
  const { icons } = useTheme();
  const icon = icons[name];

  // Use emoji if provided
  if (icon?.emoji) {
    return <Text style={{ fontSize: size, color, opacity }}>{icon.emoji}</Text>;
  }

  // Use icon library
  if (icon?.library === 'MaterialIcons') {
    return <MaterialIcons name={icon.name} size={size} color={color} style={{ opacity }} />;
  }
  if (icon?.library === 'Feather') {
    return <Feather name={icon.name} size={size} color={color} style={{ opacity }} />;
  }
  if (icon?.library === 'FontAwesome5') {
    return <FontAwesome5 name={icon.name} size={size} color={color} style={{ opacity }} />;
  }

  // Default fallback
  return null;
}

// Floating Quick Add Button using logo image
function FloatingQuickAdd() {
  const navigation = useNavigation();
  const { colors, spacing, shadows } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <TouchableOpacity
      style={{
        position: 'absolute',
        alignSelf: 'center',
        bottom: (insets.bottom || 0) + 24,
        zIndex: 5,
        backgroundColor: colors.surface,
        borderRadius: 32,
        padding: 8,
        ...shadows.lg,
        elevation: 10,
      }}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('QuickAddScreen')}
    >
      <Image
        source={require('../images/personal_tracker.png')}
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: colors.surface,
        }}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
}

// Main Bottom Tab Navigator
function MainTabNavigator() {
  const { colors, spacing } = useTheme();
  const navState = useNavigationState(state => state);
  const isQuickAddOpen = navState?.routes?.some(
    r => r.name === 'QuickAddScreen'
  );

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom', 'left', 'right']}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            height: 56,
            paddingBottom: spacing.xs,
            paddingTop: spacing.xs,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarLabelStyle: { display: 'none' },
          tabBarShowLabel: false,
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name="home" color={color} opacity={focused ? 1 : 0.4} />
            ),
          }}
        />
        <Tab.Screen
          name="Transactions"
          component={TransactionsScreen}
          options={{
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name="transactions" color={color} opacity={focused ? 1 : 0.4} />
            ),
          }}
        />
        <Tab.Screen
          name="Reminders"
          component={RemindersScreen}
          options={{
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name="reminders" color={color} opacity={focused ? 1 : 0.4} />
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name="settings" color={color} opacity={focused ? 1 : 0.4} />
            ),
          }}
        />
      </Tab.Navigator>
      {/* Hide button when QuickAddScreen is open */}
      {!isQuickAddOpen && <FloatingQuickAdd />}
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
        headerRight: () => <TelegramBotHeaderButton size={32} />,
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditTransactionScreen"
        component={EditTransactionScreen}
        options={{ title: 'Edit Transaction' ,headerShown:false}}
      />
      <Stack.Screen
        name="EditReminderScreen" // <-- Add this screen
        component={EditReminderScreen}
        options={{ title: 'Edit Reminder',headerShown:false }}
      />
      <Stack.Screen
        name="QuickAddScreen"
        component={QuickAddScreen}
        options={{
          title: 'Add',
          presentation: 'modal', // Optional: show as modal
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
      <LottieView
        source={require('../images/loading_okan.json')}
        autoPlay
        loop
        style={{ width: 80, height: 80, marginBottom: spacing.md }}
      />
      
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
  //console.log('[AppNavigator] Rendered. isAuthenticated:', isAuthenticated, 'loading:', loading, 'colors:', colors);

  if (loading) {
    //console.log('[AppNavigator] Loading state');
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

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();