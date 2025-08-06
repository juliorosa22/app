// app/src/screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import GoogleIcon from '../images/google-icon-logo-svgrepo-com.svg';

export default function LoginScreen({ navigation }) {
  const { colors, spacing, typography, shadows } = useTheme();
  const { login, loginWithGoogle, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    
    const result = await login(formData.email, formData.password);
    
    if (!result.success) {
      Alert.alert('Login Failed', result.message);
    } else {
      Alert.alert('Success', 'Login successful!');
      // Optionally navigate or reset form here
      // navigation.navigate('Home'); // If you want to navigate manually
    }
    // Success is handled by auth context navigation
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    
    try {
      const result = await loginWithGoogle();
      
      if (result.success) {
        // Success is handled by AuthContext (navigation, etc.)
        console.log('✅ Login successful via AuthContext');
      } else {
        Alert.alert('Google Login Failed', result.message);
      }
    } catch (error) {
      console.error('Google login error:', error);
      Alert.alert('Error', 'Google login failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: spacing.lg,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: spacing.xxxl,
    },
    logo: {
      fontSize: typography.fontSize['4xl'],
      marginBottom: spacing.sm,
    },
    title: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: colors.primary,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    subtitle: {
      fontSize: typography.fontSize.base,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.xl,
    },
    form: {
      marginBottom: spacing.lg,
    },
    inputGroup: {
      marginBottom: spacing.lg,
    },
    label: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },
    input: {
      height: 48,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: spacing.md,
      fontSize: typography.fontSize.base,
      color: colors.textPrimary,
      backgroundColor: colors.surface,
    },
    inputError: {
      borderColor: colors.error,
    },
    errorText: {
      fontSize: typography.fontSize.xs,
      color: colors.error,
      marginTop: spacing.xs,
    },
    loginButton: {
      backgroundColor: colors.primary,
      height: 48,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.md,
      ...shadows.md,
    },
    loginButtonDisabled: {
      backgroundColor: colors.secondaryLight,
    },
    loginButtonText: {
      color: colors.textOnPrimary,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: spacing.lg,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      marginHorizontal: spacing.md,
      color: colors.textSecondary,
      fontSize: typography.fontSize.sm,
    },
    googleButton: {
      backgroundColor: colors.surface,
      height: 48,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      marginBottom: spacing.lg,
      ...shadows.sm,
    },
    googleButtonDisabled: {
      backgroundColor: colors.surfaceSecondary,
    },
    googleIcon: {
      fontSize: 18,
      marginRight: spacing.sm,
    },
    googleButtonText: {
      color: colors.textPrimary,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
    },
    registerContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: spacing.md,
    },
    registerText: {
      color: colors.textSecondary,
      fontSize: typography.fontSize.sm,
    },
    registerLink: {
      color: colors.primary,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      marginLeft: spacing.xs,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    loadingText: {
      marginLeft: spacing.sm,
    },
  });

  const isLoading = loading || googleLoading;

  const testWebBrowser = async () => {
  console.log('🧪 Testing WebBrowser...');
  
  const result = await WebBrowser.openAuthSessionAsync(
    'https://www.google.com',
    'exp://192.168.0.5:8081/--/auth/callback'
  );
  
  console.log('🧪 WebBrowser test result:', result);
};

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>💰</Text>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your Okan Assist account</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="Enter your email"
                placeholderTextColor={colors.textLight}
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                placeholder="Enter your password"
                placeholderTextColor={colors.textLight}
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                secureTextEntry
                editable={!isLoading}
              />
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color={colors.textOnPrimary} size="small" />
                  <Text style={[styles.loginButtonText, styles.loadingText]}>
                    Signing In...
                  </Text>
                </View>
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={[
              styles.googleButton,
              isLoading && styles.googleButtonDisabled,
              {
                backgroundColor: '#fff',
                borderColor: '#ddd',
                borderWidth: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOpacity: 0.04,
                shadowRadius: 2,
                shadowOffset: { width: 0, height: 1 },
              }
            ]}
            onPress={handleGoogleLogin}
            disabled={isLoading}
          >
            {googleLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#4285F4" size="small" />
                <Text style={[styles.googleButtonText, styles.loadingText]}>
                  Connecting...
                </Text>
              </View>
            ) : (
              <>
                <Text style={{
                  fontSize: 22,
                  fontWeight: 'bold',
                  color: '#4285F4',
                  marginRight: 12,
                  marginLeft: -4,
                }}>G</Text>
                <Text style={{
                  color: '#222',
                  fontSize: 16,
                  fontWeight: '500',
                }}>
                  Continue with Google
                </Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account?</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Register')}
              disabled={isLoading}
            >
              <Text style={styles.registerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}