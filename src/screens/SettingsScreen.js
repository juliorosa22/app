import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // Add this import
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import TelegramBotHeaderButton from '../components/TelegramBotHeaderButton';

export default function SettingsScreen() {
  const { colors, spacing, typography, shadows, toggleTheme, isDarkMode } = useTheme();
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC');

  useEffect(() => {
    // Optionally fetch and set user settings from backend here
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleUpdateSettings = async (updates) => {
    // Call backend API to update user settings
    // Example: await api.updateUserSettings({ ...user, ...updates });
    // Update local state
    // You may want to update context as well
  };

  const handleCurrencyChange = (currencyCode) => {
    handleUpdateSettings({ currency: currencyCode });
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    handleUpdateSettings({ language: lang });
  };

  const handleTimezoneChange = (tz) => {
    setTimezone(tz);
    handleUpdateSettings({ timezone: tz });
  };

  const updateUserCurrency = (currencyCode) => {
    // Implement currency update logic
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      padding: spacing.md,
    },
    header: {
      marginBottom: spacing.lg,
    },
    title: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: colors.primary,
      marginBottom: spacing.sm,
    },
    subtitle: {
      fontSize: typography.fontSize.base,
      color: colors.textSecondary,
    },
    userCard: {
      backgroundColor: colors.surface,
      padding: spacing.lg,
      borderRadius: 12,
      marginBottom: spacing.lg,
      ...shadows.md,
    },
    userName: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },
    userEmail: {
      fontSize: typography.fontSize.base,
      color: colors.textSecondary,
      marginBottom: spacing.sm,
    },
    userDetail: {
      fontSize: typography.fontSize.sm,
      color: colors.textLight,
      marginBottom: spacing.xs,
    },
    section: {
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: colors.textPrimary,
      marginBottom: spacing.md,
    },
    settingItem: {
      backgroundColor: colors.surface,
      padding: spacing.md,
      borderRadius: 8,
      marginBottom: spacing.sm,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      ...shadows.sm,
    },
    settingLabel: {
      fontSize: typography.fontSize.base,
      color: colors.textPrimary,
      flex: 1,
    },
    settingValue: {
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
    },
    themeButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 6,
    },
    themeButtonText: {
      color: colors.textOnPrimary,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
    },
    logoutButton: {
      backgroundColor: colors.error,
      padding: spacing.md,
      borderRadius: 8,
      marginTop: spacing.xl,
      ...shadows.sm,
    },
    logoutButtonText: {
      color: colors.textOnPrimary,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      textAlign: 'center',
    },
    comingSoonBadge: {
      backgroundColor: colors.warning,
      paddingHorizontal: spacing.xs,
      paddingVertical: 2,
      borderRadius: 4,
    },
    comingSoonText: {
      color: colors.textOnPrimary,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.medium,
    },
    inputGroup: {
      marginBottom: spacing.lg,
    },
    label: {
      fontSize: typography.fontSize.base,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },
    currencyChip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#2196f3',
      backgroundColor: '#fff',
      marginRight: 8,
    },
    currencyChipActive: {
      backgroundColor: '#2196f3',
    },
    currencyText: {
      color: '#2196f3',
      fontWeight: '500',
    },
  });

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      {/* Absolute Telegram button */}
            <View style={{
              position: 'absolute',
              top: 40,
              right: 5,
              zIndex: 10,
            }}>
              <TelegramBotHeaderButton />
            </View>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>⚙️ {t('settings_title')}</Text>
          <Text style={styles.subtitle}>{t('settings_subtitle')}</Text>
        </View>

        {/* User Profile */}
        <View style={styles.userCard}>
          <Text style={styles.userName}>{user?.name || t('user')}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <Text style={styles.userDetail}>Currency: {user?.currency || 'USD'}</Text>
          <Text style={styles.userDetail}>Language: {user?.language || 'English'}</Text>
          {user?.phone && <Text style={styles.userDetail}>{t('phone')}: {user.phone}</Text>}
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('app_settings')}</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>{t('theme')}</Text>
            <TouchableOpacity style={styles.themeButton} onPress={toggleTheme}>
              <Text style={styles.themeButtonText}>
                {isDarkMode ? t('dark') : t('light')}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>{t('notifications')}</Text>
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>{t('soon')}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>{t('currency')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {currencies.map(currency => (
                <TouchableOpacity
                  key={currency.code}
                  style={[
                    styles.currencyChip,
                    user?.currency === currency.code && styles.currencyChipActive
                  ]}
                  onPress={() => handleCurrencyChange(currency.code)}
                >
                  <Text style={styles.currencyText}>
                    {currency.symbol} {currency.code}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>{t('language')}</Text>
            <Text style={styles.settingValue}>{language === 'en' ? 'English' : language === 'pt' ? 'Português' : 'Español'}</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', marginTop: 8 }}>
            <TouchableOpacity onPress={() => handleLanguageChange('en')}>
              <Text>English</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleLanguageChange('pt')}>
              <Text>Português</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleLanguageChange('es')}>
              <Text>Español</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Data & Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('data_privacy')}</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>{t('export_data')}</Text>
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>{t('soon')}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>{t('delete_account')}</Text>
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>{t('soon')}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('about')}</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>{t('app_version')}</Text>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>{t('privacy_policy')}</Text>
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>{t('soon')}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>{t('terms_of_service')}</Text>
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>{t('soon')}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>{t('logout')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}