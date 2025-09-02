import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Switch, Modal, FlatList, Platform, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useDataCache } from '../context/DataCacheContext';
import TelegramBotHeaderButton from '../components/TelegramBotHeaderButton';
import NotificationService from '../services/notificationService';
import ApiService from '../services/api';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getLegalContent, showLegalAlert, getScrollableLegalContent, getLegalTextSnippets } from '../utils/legalContent';

export default function SettingsScreen() {
  const { colors, spacing, typography, shadows, toggleTheme, isDarkMode } = useTheme();
  const { user, logout, updateUser } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { getTransactions, getReminders, invalidateCache } = useDataCache();
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC');
  
  // Notification states
  const [bankNotificationEnabled, setBankNotificationEnabled] = useState(false);
  const [reminderNotificationEnabled, setReminderNotificationEnabled] = useState(false);
  
  // Loading state for settings updates
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  
  // ✅ Add modal states for both language and currency pickers
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // ✅ Define available languages
  const availableLanguages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' }
  ];

  // ✅ Enhanced currencies with flags and countries
  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', country: 'United States' },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', country: 'European Union' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷', country: 'Brazil' },
  ];

  useEffect(() => {
    // ✅ Only load current settings, don't initialize again
    const loadNotificationSettings = async () => {
      // Wait a bit to ensure NotificationService is already initialized from App.js
      setTimeout(() => {
        setBankNotificationEnabled(NotificationService.getBankNotificationEnabled());
        setReminderNotificationEnabled(NotificationService.getReminderNotificationEnabled());
      }, 100);
    };
    
    loadNotificationSettings();
  }, []);

  // ✅ Implement handleUpdateSettings
  const handleUpdateSettings = async (updates) => {
    try {
      setIsUpdatingSettings(true);
      console.log('🔄 Updating user settings:', updates);

      // Call backend API to update user settings
      const result = await ApiService.updateUserSettings(updates);
      
      if (result.success) {
        // ✅ Update local user context with new settings
        const updatedUser = { ...user, ...updates };
        updateUser(updatedUser);
        
        console.log('✅ Settings updated successfully');
        
        // Show success message for important changes
        if (updates.currency || updates.language) {
          Alert.alert(
            t('success'),
            t('settings_updated_successfully'),
            [{ text: 'OK' }]
          );
        }
      } else {
        throw new Error(result.error || 'Failed to update settings');
      }
    } catch (error) {
      console.error('❌ Error updating settings:', error);
      Alert.alert(
        t('error'),
        t('settings_update_failed') + ': ' + error.message,
        [{ text: 'OK' }]
      );
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleCurrencyChange = async (currencyCode) => {
    if (user?.currency === currencyCode) {
      setShowCurrencyModal(false);
      return;
    }
    
    // ✅ Close modal first
    setShowCurrencyModal(false);
    
    // ✅ Show confirmation alert
    Alert.alert(
      t('change_currency') || 'Change Currency',
      `${t('change_currency_to') || 'Change currency to'} ${currencyCode}?`,
      [
        { text: t('cancel') || 'Cancel', style: 'cancel' },
        { 
          text: t('confirm') || 'Confirm', 
          onPress: () => handleUpdateSettings({ currency: currencyCode })
        }
      ]
    );
  };

  const handleLanguageChange = async (lang) => {
    if (language === lang) {
      setShowLanguageModal(false);
      return;
    }
    
    // ✅ Close modal first
    setShowLanguageModal(false);
    
    // ✅ Update language context first for immediate UI change
    setLanguage(lang);
    
    // ✅ Then update backend
    await handleUpdateSettings({ language: lang });
  };

  const handleTimezoneChange = async (tz) => {
    if (timezone === tz) return; // No change needed
    
    setTimezone(tz);
    await handleUpdateSettings({ timezone: tz });
  };

  const handleBankNotificationToggle = async (enabled) => {
    setBankNotificationEnabled(enabled);
    await NotificationService.setBankNotificationEnabled(enabled);
  };

  const handleReminderNotificationToggle = async (enabled) => {
    setReminderNotificationEnabled(enabled);
    await NotificationService.setReminderNotificationEnabled(enabled);
  };


  const handleLogout = () => {
    Alert.alert(
      t('logout'),
      t('logout_confirmation_message') || 'Are you sure you want to logout?',
      [
        { 
          text: t('cancel'), 
          style: 'cancel' 
        },
        { 
          text: t('logout'), 
          style: 'destructive', 
          onPress: async () => {
            try {
              setIsUpdatingSettings(true);
              console.log('🚪 User initiated logout from settings');
              await logout();
              console.log('✅ Logout successful');
            } catch (error) {
              console.error('❌ Logout error:', error);
              Alert.alert(
                t('error'),
                t('logout_failed') || 'Failed to logout. Please try again.',
                [{ text: 'OK' }]
              );
            } finally {
              setIsUpdatingSettings(false);
            }
          }
        },
      ]
    );
  };

  // ✅ Export Data Function
  const handleExportData = async () => {
    Alert.alert(
      t('export_data') || 'Export Data',
      t('export_data_confirmation') || 'This will create a CSV file with all your transactions and reminders. Continue?',
      [
        { text: t('cancel') || 'Cancel', style: 'cancel' },
        { 
          text: t('export') || 'Export', 
          onPress: async () => {
            try {
              setIsExporting(true);
              
              // Get all data
              const transactions = getTransactions();
              const reminders = getReminders();
              
              if (transactions.length === 0 && reminders.length === 0) {
                Alert.alert(
                  t('no_data') || 'No Data',
                  t('no_data_to_export') || 'You have no transactions or reminders to export.',
                  [{ text: 'OK' }]
                );
                return;
              }

              // Create CSV content
              let csvContent = '';
              
              // Transactions CSV
              if (transactions.length > 0) {
                csvContent += 'TRANSACTIONS\n';
                csvContent += 'Date,Description,Category,Type,Amount,Currency,Merchant\n';
                
                transactions.forEach(tx => {
                  const row = [
                    tx.date || '',
                    `"${(tx.description || '').replace(/"/g, '""')}"`,
                    `"${(tx.category || '').replace(/"/g, '""')}"`,
                    tx.transaction_type || '',
                    tx.amount || 0,
                    user?.currency || 'USD',
                    `"${(tx.merchant || '').replace(/"/g, '""')}"`
                  ].join(',');
                  csvContent += row + '\n';
                });
                
                csvContent += '\n';
              }
              
              // Reminders CSV
              if (reminders.length > 0) {
                csvContent += 'REMINDERS\n';
                csvContent += 'Title,Description,Date,Time,Type,Status\n';
                
                reminders.forEach(reminder => {
                  const row = [
                    `"${(reminder.title || '').replace(/"/g, '""')}"`,
                    `"${(reminder.description || '').replace(/"/g, '""')}"`,
                    reminder.reminder_date || '',
                    reminder.reminder_time || '',
                    reminder.reminder_type || '',
                    reminder.status || 'active'
                  ].join(',');
                  csvContent += row + '\n';
                });
              }

              // Create filename with timestamp
              const timestamp = new Date().toISOString().split('T')[0];
              const filename = `okanassist_export_${timestamp}.csv`;
              const fileUri = FileSystem.documentDirectory + filename;

              // Write file
              await FileSystem.writeAsStringAsync(fileUri, csvContent, {
                encoding: FileSystem.EncodingType.UTF8,
              });

              // Share file
              if (Platform.OS === 'ios') {
                await Sharing.shareAsync(fileUri, {
                  mimeType: 'text/csv',
                  dialogTitle: t('export_data') || 'Export Data',
                });
              } else {
                // Android - use Share API
                await Share.share({
                  url: fileUri,
                  title: t('export_data') || 'Export Data',
                  message: t('your_data_export') || 'Your OkanAssist data export',
                });
              }

              Alert.alert(
                t('success') || 'Success',
                t('data_exported_successfully') || `Data exported successfully! File: ${filename}`,
                [{ text: 'OK' }]
              );

            } catch (error) {
              console.error('❌ Export error:', error);
              Alert.alert(
                t('error') || 'Error',
                t('export_failed') || 'Failed to export data: ' + error.message,
                [{ text: 'OK' }]
              );
            } finally {
              setIsExporting(false);
            }
          }
        }
      ]
    );
  };

  // ✅ Delete Account Function
  const handleDeleteAccount = () => {
    Alert.alert(
      t('delete_account') || 'Delete Account',
      t('delete_account_warning') || 'This will permanently delete your account and ALL your data. This action cannot be undone.\n\nType "DELETE" to confirm.',
      [
        { text: t('cancel') || 'Cancel', style: 'cancel' },
        { 
          text: t('continue') || 'Continue', 
          style: 'destructive',
          onPress: () => showDeleteConfirmation()
        }
      ]
    );
  };

  const showDeleteConfirmation = () => {
    // Second confirmation with text input
    Alert.prompt(
      t('confirm_deletion') || 'Confirm Deletion',
      t('type_delete_to_confirm') || 'Type "DELETE" to confirm account deletion:',
      [
        { text: t('cancel') || 'Cancel', style: 'cancel' },
        { 
          text: t('delete_forever') || 'Delete Forever', 
          style: 'destructive',
          onPress: (text) => {
            if (text?.toUpperCase() === 'DELETE') {
              performAccountDeletion();
            } else {
              Alert.alert(
                t('confirmation_failed') || 'Confirmation Failed',
                t('must_type_delete') || 'You must type "DELETE" exactly to confirm.',
                [{ text: 'OK' }]
              );
            }
          }
        }
      ],
      'plain-text'
    );
  };

  const performAccountDeletion = async () => {
    try {
      setIsDeletingAccount(true);
      
      // Show final warning
      Alert.alert(
        t('final_warning') || 'Final Warning',
        t('about_to_delete') || 'You are about to permanently delete your account. This cannot be undone.',
        [
          { text: t('cancel') || 'Cancel', style: 'cancel', onPress: () => setIsDeletingAccount(false) },
          { 
            text: t('delete_now') || 'Delete Now', 
            style: 'destructive',
            onPress: async () => {
              try {
                console.log('🗑️ Starting account deletion for user:', user?.id);
                
                // Call API to delete account
                const result = await ApiService.deleteUserAccount(user?.id);
                
                if (result.success) {
                  console.log('✅ Account deleted successfully');
                  
                  // Clear local data
                  invalidateCache();
                  
                  // Logout user
                  await logout();
                  
                  Alert.alert(
                    t('account_deleted') || 'Account Deleted',
                    t('account_deleted_message') || 'Your account has been permanently deleted. Thank you for using OkanAssist.',
                    [{ text: 'OK' }],
                    { cancelable: false }
                  );
                } else {
                  throw new Error(result.error || 'Failed to delete account');
                }
              } catch (error) {
                console.error('❌ Account deletion error:', error);
                Alert.alert(
                  t('deletion_failed') || 'Deletion Failed',
                  t('deletion_failed_message') || 'Failed to delete account: ' + error.message,
                  [{ text: 'OK' }]
                );
              } finally {
                setIsDeletingAccount(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ Account deletion preparation error:', error);
      setIsDeletingAccount(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      padding: spacing.md,
      paddingBottom: spacing.xl,
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
    settingItemTouchable: {
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
    settingDescription: {
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
      marginTop: spacing.xs,
      flex: 1,
    },
    settingValue: {
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
    },
    settingValueWithArrow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    settingArrow: {
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
      marginLeft: spacing.xs,
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
      borderColor: colors.primary,
      backgroundColor: colors.surface,
      marginRight: 8,
      // ✅ Add opacity when updating
      opacity: isUpdatingSettings ? 0.6 : 1,
    },
    currencyChipActive: {
      backgroundColor: colors.primary,
    },
    currencyText: {
      color: colors.primary,
      fontWeight: '500',
    },
    currencyTextActive: {
      color: colors.textOnPrimary,
      fontWeight: '500',
    },
    languageButton: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      marginRight: spacing.sm,
      borderRadius: 6,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    languageButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    languageButtonText: {
      color: colors.textPrimary,
      fontSize: typography.fontSize.sm,
    },
    languageButtonTextActive: {
      color: colors.textOnPrimary,
      fontSize: typography.fontSize.sm,
    },
    userDetail: {
      fontSize: typography.fontSize.sm,
      color: colors.textLight,
      marginBottom: spacing.xs,
    },
    notificationItem: {
      backgroundColor: colors.surface,
      padding: spacing.md,
      borderRadius: 8,
      marginBottom: spacing.sm,
      ...shadows.sm,
    },
    notificationRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    // ✅ Add new modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      margin: spacing.lg,
      maxHeight: '70%',
      minWidth: '80%',
      ...shadows.lg,
    },
    modalHeader: {
      padding: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: colors.textPrimary,
      textAlign: 'center',
    },
    modalContent: {
      maxHeight: 300,
    },
    modalItem: {
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalItemSelected: {
      backgroundColor: colors.primaryLight || colors.surface,
    },
    modalItemContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    modalItemFlag: {
      fontSize: 24,
      marginRight: spacing.md,
    },
    modalItemText: {
      flex: 1,
    },
    modalItemTitle: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },
    modalItemTitleSelected: {
      color: colors.primary,
    },
    modalItemSubtitle: {
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
    },
    modalItemSubtitleSelected: {
      color: colors.primary,
    },
    checkmark: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.success,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkmarkText: {
      color: colors.textOnPrimary,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
    },
    modalFooter: {
      padding: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    modalCancelButton: {
      backgroundColor: colors.surfaceSecondary,
      padding: spacing.md,
      borderRadius: 8,
      alignItems: 'center',
    },
    modalCancelButtonText: {
      color: colors.textPrimary,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
    },
  });

  // ✅ Get current language display name
  const getCurrentLanguageDisplay = () => {
    const currentLang = availableLanguages.find(lang => lang.code === language);
    return currentLang ? `${currentLang.flag} ${currentLang.nativeName}` : 'English';
  };

  // ✅ Get current currency display name
  const getCurrentCurrencyDisplay = () => {
    const currentCurrency = currencies.find(curr => curr.code === user?.currency);
    return currentCurrency ? `${currentCurrency.flag} ${currentCurrency.symbol} ${currentCurrency.code}` : '$ USD';
  };

  // ✅ Render language modal item
  const renderLanguageItem = ({ item }) => {
    const isSelected = language === item.code;
    
    return (
      <TouchableOpacity
        style={[
          styles.modalItem,
          isSelected && styles.modalItemSelected
        ]}
        onPress={() => handleLanguageChange(item.code)}
        disabled={isUpdatingSettings}
      >
        <View style={styles.modalItemContent}>
          <Text style={styles.modalItemFlag}>{item.flag}</Text>
          <View style={styles.modalItemText}>
            <Text style={[
              styles.modalItemTitle,
              isSelected && styles.modalItemTitleSelected
            ]}>
              {item.nativeName}
            </Text>
            <Text style={[
              styles.modalItemSubtitle,
              isSelected && styles.modalItemSubtitleSelected
            ]}>
              {item.name}
            </Text>
          </View>
          {isSelected && (
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // ✅ Render currency modal item
  const renderCurrencyItem = ({ item }) => {
    const isSelected = user?.currency === item.code;
    
    return (
      <TouchableOpacity
        style={[
          styles.modalItem,
          isSelected && styles.modalItemSelected
        ]}
        onPress={() => handleCurrencyChange(item.code)}
        disabled={isUpdatingSettings}
      >
        <View style={styles.modalItemContent}>
          <Text style={styles.modalItemFlag}>{item.flag}</Text>
          <View style={styles.modalItemText}>
            <Text style={[
              styles.modalItemTitle,
              isSelected && styles.modalItemTitleSelected
            ]}>
              {item.symbol} {item.code}
            </Text>
            <Text style={[
              styles.modalItemSubtitle,
              isSelected && styles.modalItemSubtitleSelected
            ]}>
              {item.name} • {item.country}
            </Text>
          </View>
          {isSelected && (
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // ✅ Updated Privacy Policy Handler - now uses current language
  const handlePrivacyPolicy = () => {
    showLegalAlert('privacy', t, language);
  };

  // ✅ Updated Terms of Service Handler - now uses current language
  const handleTermsOfService = () => {
    showLegalAlert('terms', t, language);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Absolute Telegram button */}
      <View style={{
        position: 'absolute',
        top: 40,
        right: 5,
        zIndex: 10,
      }}>
        <TelegramBotHeaderButton />
      </View>
      
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
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
          {isUpdatingSettings && (
            <Text style={[styles.userDetail, { color: colors.primary }]}>
              {t('updating_settings')}...
            </Text>
          )}
        </View>

        {/* Notification Settings 
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 {t('notification_settings')}</Text>
          
          <View style={styles.notificationItem}>
            <View style={styles.notificationRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingLabel}>{t('transaction_notifications')}</Text>
                <Text style={styles.settingDescription}>
                  {t('transaction_notifications_desc')}
                </Text>
              </View>
              <Switch
                value={bankNotificationEnabled}
                onValueChange={handleBankNotificationToggle}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={bankNotificationEnabled ? colors.surface : colors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.notificationItem}>
            <View style={styles.notificationRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingLabel}>{t('reminder_notifications')}</Text>
                <Text style={styles.settingDescription}>
                  {t('reminder_notifications_desc')}
                </Text>
              </View>
              <Switch
                value={reminderNotificationEnabled}
                onValueChange={handleReminderNotificationToggle}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={reminderNotificationEnabled ? colors.surface : colors.textSecondary}
              />
            </View>
          </View>
        </View>
      Need to improve*/}
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

          {/* ✅ NEW: Currency Selection with Modal */}
          <TouchableOpacity
            style={styles.settingItemTouchable}
            onPress={() => setShowCurrencyModal(true)}
            disabled={isUpdatingSettings}
          >
            <Text style={styles.settingLabel}>{t('currency')}</Text>
            <View style={styles.settingValueWithArrow}>
              <Text style={styles.settingValue}>
                {getCurrentCurrencyDisplay()}
              </Text>
              <Text style={styles.settingArrow}>›</Text>
            </View>
          </TouchableOpacity>

          {/* ✅ Language Selection with Modal */}
          <TouchableOpacity
            style={styles.settingItemTouchable}
            onPress={() => setShowLanguageModal(true)}
            disabled={isUpdatingSettings}
          >
            <Text style={styles.settingLabel}>{t('language')}</Text>
            <View style={styles.settingValueWithArrow}>
              <Text style={styles.settingValue}>
                {getCurrentLanguageDisplay()}
              </Text>
              <Text style={styles.settingArrow}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Data & Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('data_privacy')}</Text>
          
          <TouchableOpacity 
            style={[styles.settingItem, { opacity: isExporting ? 0.6 : 1 }]} 
            onPress={handleExportData}
            disabled={isExporting}
          >
            <Text style={styles.settingLabel}>
              {isExporting ? t('exporting') || 'Exporting...' : t('export_data')}
            </Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.settingItem, { opacity: isDeletingAccount ? 0.6 : 1 }]} 
            onPress={handleDeleteAccount}
            disabled={isDeletingAccount}
          >
            <Text style={[styles.settingLabel, { color: colors.error }]}>
              {isDeletingAccount ? t('deleting') || 'Deleting...' : t('delete_account')}
            </Text>
            <Text style={[styles.settingArrow, { color: colors.error }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('about')}</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>{t('app_version')}</Text>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>

          <TouchableOpacity 
            style={styles.settingItemTouchable} 
            onPress={handlePrivacyPolicy}
          >
            <Text style={styles.settingLabel}>{t('privacy_policy')}</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItemTouchable} 
            onPress={handleTermsOfService}
          >
            <Text style={styles.settingLabel}>{t('terms_of_service')}</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.logoutButton, { opacity: isUpdatingSettings ? 0.6 : 1 }]} 
          onPress={handleLogout}
          disabled={isUpdatingSettings}
        >
          <Text style={styles.logoutButtonText}>{t('logout')}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ✅ Currency Selection Modal */}
      <Modal
        visible={showCurrencyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('select_currency') || 'Select Currency'}</Text>
            </View>
            
            <View style={styles.modalContent}>
              <FlatList
                data={currencies}
                renderItem={renderCurrencyItem}
                keyExtractor={(item) => item.code}
                showsVerticalScrollIndicator={false}
              />
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowCurrencyModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>
                  {t('cancel') || 'Cancel'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ✅ Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('select_language') || 'Select Language'}</Text>
            </View>
            
            <View style={styles.modalContent}>
              <FlatList
                data={availableLanguages}
                renderItem={renderLanguageItem}
                keyExtractor={(item) => item.code}
                showsVerticalScrollIndicator={false}
              />
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowLanguageModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>
                  {t('cancel') || 'Cancel'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}