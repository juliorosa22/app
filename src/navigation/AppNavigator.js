import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

// Main App Screens
import HomeScreen from '../screens/HomeScreen';
import RemindersScreen from '../screens/RemindersScreen';
import SettingsScreen from '../screens/SettingsScreen';
import QuickAddScreen from '../screens/QuickAddScreen';
import TransactionsScreen from '../screens/TransactionsScreen';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Custom Drawer Content Component
function CustomDrawerContent(props) {
  const { 
    colors, 
    spacing, 
    typography = { fontSize: { base: 16, sm: 14, lg: 18, xl: 20 }, fontWeight: { medium: '500', semibold: '600', bold: '700' } } 
  } = useTheme();
  console.log('Theme in CustomDrawerContent:', { colors, spacing, typography });
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    props.navigation.closeDrawer();
    logout();
  };

  const drawerStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: insets.top,
    },
    header: {
      backgroundColor: colors.primary,
      padding: spacing.lg,
      marginBottom: spacing.md,
    },
    headerContent: {
      alignItems: 'center',
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    avatarText: {
      fontSize: typography.fontSize.xl,
      color: colors.textOnPrimary,
      fontWeight: typography.fontWeight.bold,
    },
    userName: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: colors.textOnPrimary,
      marginBottom: spacing.xs,
    },
    userEmail: {
      fontSize: typography.fontSize.sm,
      color: colors.textOnPrimary,
      opacity: 0.8,
    },
    menuSection: {
      flex: 1,
      paddingHorizontal: spacing.sm,
    },
    footer: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      padding: spacing.md,
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
    logoutIcon: {
      fontSize: 20,
      marginRight: spacing.sm,
    },
    logoutText: {
      fontSize: typography.fontSize.base,
      color: colors.error,
      fontWeight: typography.fontWeight.medium,
    },
  });

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <View style={drawerStyles.container}>
      {/* Header with User Info */}
      <View style={drawerStyles.header}>
        <View style={drawerStyles.headerContent}>
          <View style={drawerStyles.avatar}>
            <Text style={drawerStyles.avatarText}>
              {getInitials(user?.name)}
            </Text>
          </View>
          <Text style={drawerStyles.userName}>
            {user?.name || 'User'}
          </Text>
          <Text style={drawerStyles.userEmail}>
            {user?.email}
          </Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={drawerStyles.menuSection}>
        <DrawerContentScrollView {...props} showsVerticalScrollIndicator={false}>
          <DrawerItemList {...props} />
        </DrawerContentScrollView>
      </View>

      {/* Footer with Logout */}
      <View style={drawerStyles.footer}>
        <TouchableOpacity 
          style={drawerStyles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Text style={drawerStyles.logoutIcon}>🚪</Text>
          <Text style={drawerStyles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Custom Header Component with Menu Button
function CustomHeader({ navigation, title, showMenu = true }) {
  const { colors, spacing, typography } = useTheme();

  const headerStyles = StyleSheet.create({
    header: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      elevation: 4,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    menuButton: {
      padding: spacing.sm,
      marginRight: spacing.sm,
    },
    menuIcon: {
      fontSize: 24,
      color: colors.textOnPrimary,
    },
    title: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: colors.textOnPrimary,
    },
    rightSection: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  });

  return (
    <View style={headerStyles.header}>
      <View style={headerStyles.leftSection}>
        {showMenu && (
          <TouchableOpacity 
            style={headerStyles.menuButton}
            onPress={() => navigation.openDrawer()}
            activeOpacity={0.7}
          >
            <Text style={headerStyles.menuIcon}>☰</Text>
          </TouchableOpacity>
        )}
        <Text style={headerStyles.title}>{title}</Text>
      </View>
      <View style={headerStyles.rightSection}>
        {/* Add any right-side buttons here if needed */}
      </View>
    </View>
  );
}

// Main Drawer Navigator
function MainDrawerNavigator() {
  const { colors, typography = { fontSize: { base: 16 }, fontWeight: { medium: '500' } }, spacing } = useTheme();
  console.log('Theme in MainDrawerNavigator:', { colors, typography, spacing });

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false, // We'll use custom headers
        drawerStyle: {
          backgroundColor: colors.background,
          width: 280,
        },
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.textSecondary,
        drawerActiveBackgroundColor: colors.primaryLight + '20',
        drawerInactiveBackgroundColor: 'transparent',
        drawerLabelStyle: {
          fontSize: typography.fontSize.base,
          fontWeight: typography.fontWeight.medium,
          marginLeft: -spacing.md,
        },
        drawerItemStyle: {
          borderRadius: 8,
          marginHorizontal: spacing.sm,
          marginVertical: spacing.xs,
          paddingHorizontal: spacing.sm,
        },
        drawerType: 'slide', // Smooth slide animation
        overlayColor: 'rgba(0, 0, 0, 0.5)', // Dark overlay when drawer is open
      }}
    >
      <Drawer.Screen
        name="Home"
        component={HomeWithHeader}
        options={{
          title: 'Home',
          drawerIcon: ({ focused, color, size }) => (
            <Text style={{ fontSize: 20, color }}>🏠</Text>
          ),
        }}
      />
      <Drawer.Screen
        name="Transactions"
        component={TransactionsWithHeader}
        options={{
          title: 'Transactions',
          drawerIcon: ({ focused, color, size }) => (
            <Text style={{ fontSize: 20, color }}>💰</Text>
          ),
        }}
      />
      <Drawer.Screen
        name="Reminders"
        component={RemindersWithHeader}
        options={{
          title: 'Reminders',
          drawerIcon: ({ focused, color, size }) => (
            <Text style={{ fontSize: 20, color }}>🔔</Text>
          ),
        }}
      />
      <Drawer.Screen
        name="QuickAdd"
        component={QuickAddWithHeader}
        options={{
          title: 'Quick Add',
          drawerIcon: ({ focused, color, size }) => (
            <Text style={{ fontSize: 20, color }}>➕</Text>
          ),
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsWithHeader}
        options={{
          title: 'Settings',
          drawerIcon: ({ focused, color, size }) => (
            <Text style={{ fontSize: 20, color }}>⚙️</Text>
          ),
        }}
      />
      <Drawer.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{
          title: 'Transactions',
          tabBarLabel: 'Transactions',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon="💳" focused={focused} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

// Screen Components with Custom Headers
function HomeWithHeader({ navigation }) {
  return (
    <View style={{ flex: 1 }}>
      <CustomHeader navigation={navigation} title="Okan Personal Assist" />
      <HomeScreen navigation={navigation} />
    </View>
  );
}

function TransactionsWithHeader({ navigation }) {
  return (
    <View style={{ flex: 1 }}>
      <CustomHeader navigation={navigation} title="Transactions" />
      <TransactionsScreen navigation={navigation} />
    </View>
  );
}

function RemindersWithHeader({ navigation }) {
  return (
    <View style={{ flex: 1 }}>
      <CustomHeader navigation={navigation} title="Reminders" />
      <RemindersScreen navigation={navigation} />
    </View>
  );
}

function QuickAddWithHeader({ navigation }) {
  return (
    <View style={{ flex: 1 }}>
      <CustomHeader navigation={navigation} title="Quick Add" />
      <QuickAddScreen navigation={navigation} />
    </View>
  );
}

function SettingsWithHeader({ navigation }) {
  return (
    <View style={{ flex: 1 }}>
      <CustomHeader navigation={navigation} title="Settings" />
      <SettingsScreen navigation={navigation} />
    </View>
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
      {isAuthenticated ? <MainDrawerNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}