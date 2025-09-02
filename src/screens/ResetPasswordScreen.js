// Create new file: src/screens/ResetPasswordScreen.js
import React, { useState, useEffect } from 'react';
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
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import LottieView from 'lottie-react-native';

export default function ResetPasswordScreen({ navigation, route }) {
  const { colors, spacing, typography, shadows } = useTheme();
  const { t } = useLanguage();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.password) {
      newErrors.password = t('password_required');
    } else {
      const passwordValidation = apiService.validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0];
      }
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('confirm_password_required');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('passwords_do_not_match');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const result = await apiService.updatePassword(formData.password);
      
      if (result.success) {
        Alert.alert(
          t('success'),
          t('password_updated_successfully'),
          [
            {
              text: t('ok'),
              onPress: () => {
                // Navigate to login or main app
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              }
            }
          ]
        );
      } else {
        Alert.alert(t('error'), result.error || t('password_update_failed'));
      }
    } catch (error) {
      console.error('Password update error:', error);
      Alert.alert(t('error'), t('password_update_error'));
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
    updateButton: {
      backgroundColor: colors.primary,
      height: 48,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      ...shadows.md,
    },
    updateButtonDisabled: {
      backgroundColor: colors.secondaryLight,
    },
    updateButtonText: {
      color: colors.textOnPrimary,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    loadingText: {
      marginLeft: spacing.sm,
    },
    passwordRequirements: {
      marginTop: spacing.sm,
      padding: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    requirementTitle: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },
    requirement: {
      fontSize: typography.fontSize.xs,
      color: colors.textSecondary,
      marginBottom: 2,
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
            <Text style={styles.title}>{t('reset_password')}</Text>
            <Text style={styles.subtitle}>{t('reset_password_instruction')}</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('new_password_label')}</Text>
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                placeholder={t('new_password_placeholder')}
                placeholderTextColor={colors.textLight}
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                secureTextEntry
                editable={!loading}
              />
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              
              <View style={styles.passwordRequirements}>
                <Text style={styles.requirementTitle}>{t('password_requirements')}</Text>
                <Text style={styles.requirement}>• {t('password_min_6_chars')}</Text>
                <Text style={styles.requirement}>• {t('password_must_contain_letter')}</Text>
                <Text style={styles.requirement}>• {t('password_must_contain_number')}</Text>
              </View>
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
                editable={!loading}
              />
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>

            <TouchableOpacity
              style={[styles.updateButton, loading && styles.updateButtonDisabled]}
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
                  <Text style={[styles.updateButtonText, styles.loadingText]}>
                    {t('updating')}
                  </Text>
                </View>
              ) : (
                <Text style={styles.updateButtonText}>{t('update_password')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}