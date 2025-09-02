// Create new file: src/screens/ForgotPasswordScreen.js
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
import { useLanguage } from '../context/LanguageContext';
import apiService from '../services/api';
import LottieView from 'lottie-react-native';

export default function ForgotPasswordScreen({ navigation }) {
  const { colors, spacing, typography, shadows } = useTheme();
  const { t } = useLanguage();
  
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleInputChange = (value) => {
    setEmail(value);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = t('email_required');
    } else if (!apiService.validateEmail(email)) {
      newErrors.email = t('email_invalid');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const result = await apiService.resetPassword(email.trim());
      
      if (result.success) {
        setEmailSent(true);
        Alert.alert(
          t('email_sent'),
          t('password_reset_email_sent'),
          [
            {
              text: t('ok'),
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert(t('error'), result.error || t('password_reset_failed'));
      }
    } catch (error) {
      console.error('Password reset error:', error);
      Alert.alert(t('error'), t('password_reset_error'));
    } finally {
      setLoading(false);
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
    header: {
      alignItems: 'center',
      marginBottom: spacing.xxxl,
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
      lineHeight: 24,
      paddingHorizontal: spacing.md,
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
    resetButton: {
      backgroundColor: colors.primary,
      height: 48,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.md,
      ...shadows.md,
    },
    resetButtonDisabled: {
      backgroundColor: colors.secondaryLight,
    },
    resetButtonText: {
      color: colors.textOnPrimary,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
    },
    backButton: {
      backgroundColor: colors.surface,
      height: 48,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    backButtonText: {
      color: colors.textPrimary,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    loadingText: {
      marginLeft: spacing.sm,
    },
    successContainer: {
      alignItems: 'center',
      padding: spacing.xl,
      backgroundColor: colors.success + '10',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.success + '30',
      marginBottom: spacing.lg,
    },
    successIcon: {
      fontSize: 48,
      marginBottom: spacing.md,
    },
    successTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: colors.success,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    successText: {
      fontSize: typography.fontSize.base,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
  });

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
          <View style={styles.header}>
            <Text style={styles.title}>{t('forgot_password')}</Text>
            <Text style={styles.subtitle}>
              {emailSent 
                ? t('check_email_instruction')
                : t('forgot_password_instruction')
              }
            </Text>
          </View>

          {emailSent && (
            <View style={styles.successContainer}>
              <Text style={styles.successIcon}>📧</Text>
              <Text style={styles.successTitle}>{t('email_sent')}</Text>
              <Text style={styles.successText}>
                {t('password_reset_email_sent_to')} {email}
              </Text>
            </View>
          )}

          {!emailSent && (
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('email_label')}</Text>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder={t('email_placeholder')}
                  placeholderTextColor={colors.textLight}
                  value={email}
                  onChangeText={handleInputChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              <TouchableOpacity
                style={[styles.resetButton, loading && styles.resetButtonDisabled]}
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <LottieView
                      source={require('../images/loading_okan.json')}
                      autoPlay
                      loop
                      style={{ width: 36, height: 36, marginRight: 8 }}
                    />
                    <Text style={[styles.resetButtonText, styles.loadingText]}>
                      {t('sending')}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.resetButtonText}>{t('send_reset_email')}</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.backButtonText}>{t('back_to_login')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}