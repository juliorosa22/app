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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function RegisterScreen({ navigation }) {
  const { colors, spacing, typography, shadows } = useTheme();
  const { register, loading } = useAuth();
  const { t } = useLanguage();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    currency: 'USD',
    language: 'en',
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = t('name_required');
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t('name_min_length');
    }
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
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('confirm_password_required');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('passwords_do_not_match');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getDeviceTimezone = () => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (error) {
      return 'UTC';
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    
    // ✅ Include device timezone in the registration data
    const registrationData = {
      ...formData,
      timezone: getDeviceTimezone(), // Auto-detected from device
    };
    
    const result = await register(registrationData);
    if (result.success) {
      Alert.alert(t('success'), result.message);
    } else {
      Alert.alert(t('registration_failed'), result.message);
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
      marginBottom: spacing.xl,
    },
    logo: {
      fontSize: typography.fontSize['3xl'],
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
      marginBottom: spacing.lg,
    },
    form: {
      marginBottom: spacing.lg,
    },
    inputGroup: {
      marginBottom: spacing.md,
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
    registerButton: {
      backgroundColor: colors.primary,
      height: 48,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: spacing.md,
      ...shadows.md,
    },
    registerButtonDisabled: {
      backgroundColor: colors.secondaryLight,
    },
    registerButtonText: {
      color: colors.textOnPrimary,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
    },
    loginContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: spacing.lg,
    },
    loginText: {
      color: colors.textSecondary,
      fontSize: typography.fontSize.sm,
    },
    loginLink: {
      color: colors.primary,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      marginLeft: spacing.xs,
    },
    currencyContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    currencyOption: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    currencyOptionSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    currencyText: {
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
    },
    currencyTextSelected: {
      color: colors.textOnPrimary,
    },
    
    // ✅ Add language selector styles (matching currency selector)
    languageContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    languageOption: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      flexDirection: 'row',
      alignItems: 'center',
    },
    languageOptionSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    languageFlag: {
      fontSize: typography.fontSize.sm,
      marginRight: spacing.xs,
    },
    languageText: {
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
    },
    languageTextSelected: {
      color: colors.textOnPrimary,
    },
  });

  const currencies = ['USD', 'EUR', 'BRL'];
  
  // ✅ Language options with flags
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top','bottom']}>
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
            <Text style={styles.title}>{t('create_account')}</Text>
            <Text style={styles.subtitle}>{t('register_subtitle')}</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('full_name_label')}</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder={t('full_name_placeholder')}
                placeholderTextColor={colors.textLight}
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                autoCapitalize="words"
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

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
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('phone_label')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('phone_placeholder')}
                placeholderTextColor={colors.textLight}
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('default_currency_label')}</Text>
              <View style={styles.currencyContainer}>
                {currencies.map((currency) => (
                  <TouchableOpacity
                    key={currency}
                    style={[
                      styles.currencyOption,
                      formData.currency === currency && styles.currencyOptionSelected,
                    ]}
                    onPress={() => handleInputChange('currency', currency)}
                  >
                    <Text
                      style={[
                        styles.currencyText,
                        formData.currency === currency && styles.currencyTextSelected,
                      ]}
                    >
                      {currency}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* ✅ Improved Language Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('language_label') || 'Language'}</Text>
              <View style={styles.languageContainer}>
                {languages.map((language) => (
                  <TouchableOpacity
                    key={language.code}
                    style={[
                      styles.languageOption,
                      formData.language === language.code && styles.languageOptionSelected,
                    ]}
                    onPress={() => handleInputChange('language', language.code)}
                  >
                    <Text style={styles.languageFlag}>{language.flag}</Text>
                    <Text
                      style={[
                        styles.languageText,
                        formData.language === language.code && styles.languageTextSelected,
                      ]}
                    >
                      {language.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
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
              />
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('confirm_password_label')}</Text>
              <TextInput
                style={[styles.input, errors.confirmPassword && styles.inputError]}
                placeholder={t('confirm_password_placeholder')}
                placeholderTextColor={colors.textLight}
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                secureTextEntry
              />
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>

            <TouchableOpacity
              style={[styles.registerButton, loading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.registerButtonText}>
                {loading ? t('registering') : t('register_button')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>{t('already_have_account')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>{t('sign_in')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}