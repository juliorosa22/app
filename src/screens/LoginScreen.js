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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useDataCache } from '../context/DataCacheContext';
import { useLanguage } from '../context/LanguageContext';
import GoogleIcon from '../images/google-icon-logo-svgrepo-com.svg';
import LottieView from 'lottie-react-native';

export default function LoginScreen({ navigation }) {
  const { colors, spacing, typography, shadows } = useTheme();
  const { login, loginWithGoogle, loading } = useAuth();
  const { initializeData } = useDataCache();
  const { t } = useLanguage();
  
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
      newErrors.email = t('email_required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('email_invalid');
    }
    if (!formData.password) {
      newErrors.password = t('password_required');
    } else if (formData.password.length < 6) {
      newErrors.password = t('password_min_length');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    const result = await login(formData.email, formData.password);
    if (!result.success) {
      Alert.alert(t('login_failed'), result.message);
    } else {
      await initializeData();
      Alert.alert(t('success'), t('login_successful'));
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const result = await loginWithGoogle();
      if (result.success) {
        await initializeData();
        console.log('✅ Login successful via AuthContext');
      } else {
        Alert.alert(t('google_login_failed'), result.message);
      }
    } catch (error) {
      console.error('Google login error:', error);
      Alert.alert(t('error'), t('google_login_error'));
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
    logoImage: {
      width: 80,
      height: 80,
      marginBottom: spacing.sm,
      borderRadius: 20, // optional, for rounded corners
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
            <Image
              source={require('../images/personal_tracker.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.title}>{t('welcome_back')}</Text>
            <Text style={styles.subtitle}>{t('login_subtitle')}</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('email_label')}</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder={t('email_placeholder')}
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
              <Text style={styles.label}>{t('password_label')}</Text>
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                placeholder={t('password_placeholder')}
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
                  <LottieView
                    source={require('../images/loading_okan.json')}
                    autoPlay
                    loop
                    style={{ width: 36, height: 36, marginRight: 8 }}
                  />
                  <Text style={[styles.loginButtonText, styles.loadingText]}>
                    {t('signing_in')}
                  </Text>
                </View>
              ) : (
                <Text style={styles.loginButtonText}>{t('sign_in')}</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>{t('dont_have_account')}</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Register')}
              disabled={isLoading}
            >
              <Text style={styles.registerLink}>{t('sign_up')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('or')}</Text>
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
                  {t('connecting')}
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
                  {t('continue_with_google')}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}