import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from './api';

// ✅ Safe import with error handling
let PushNotification;
let isPushNotificationAvailable = false;

try {
  PushNotification = require('react-native-push-notification').default;
  isPushNotificationAvailable = true;
  console.log('✅ PushNotification imported successfully');
} catch (error) {
  console.warn('⚠️ PushNotification not available:', error.message);
  PushNotification = null;
  isPushNotificationAvailable = false;
}

class NotificationService {
  constructor() {
    this.isInitialized = false;
    this.bankNotificationEnabled = false;
    this.reminderNotificationEnabled = false;
    this.isPushNotificationAvailable = isPushNotificationAvailable;
    this.bankPatterns = [
      // Common bank notification patterns
      {
        bankName: 'generic',
        patterns: [
          /compra.*\$?(\d+[.,]\d{2})/i,
          /débito.*\$?(\d+[.,]\d{2})/i,
          /transferência.*\$?(\d+[.,]\d{2})/i,
          /pix.*\$?(\d+[.,]\d{2})/i,
          /purchase.*\$?(\d+[.,]\d{2})/i,
          /debit.*\$?(\d+[.,]\d{2})/i,
          /transaction.*\$?(\d+[.,]\d{2})/i,
        ]
      }
    ];
  }

  async initialize() {
    if (this.isInitialized) return;

    console.log('🔔 Starting NotificationService initialization...');

    try {
      // ✅ Load settings first (this always works)
      await this.loadSettings();

      // ✅ Only configure push notifications if available
      if (this.isPushNotificationAvailable && PushNotification) {
        console.log('📱 Configuring push notifications...');
        
        PushNotification.configure({
          onRegister: (token) => {
            console.log('Notification token:', token);
          },
          onNotification: (notification) => {
            console.log('Received notification:', notification);
            this.handleNotification(notification);
          },
          permissions: {
            alert: true,
            badge: true,
            sound: true,
          },
          popInitialNotification: true,
          requestPermissions: Platform.OS === 'ios',
        });

        console.log('✅ Push notifications configured successfully');
      } else {
        console.log('⚠️ Push notifications not available - using fallback mode');
      }

      this.isInitialized = true;
      console.log('✅ NotificationService initialized successfully');
      
    } catch (error) {
      console.error('❌ Error during NotificationService initialization:', error);
      
      // ✅ Still mark as initialized to prevent retry loops
      this.isInitialized = true;
      
      // ✅ Ensure settings are loaded even if push notifications fail
      if (!this.bankNotificationEnabled && !this.reminderNotificationEnabled) {
        await this.loadSettings();
      }
      
      throw new Error(`NotificationService initialization failed: ${error.message}`);
    }
  }

  async loadSettings() {
    try {
      console.log('📖 Loading notification settings...');
      
      const bankEnabled = await AsyncStorage.getItem('bankNotificationEnabled');
      const reminderEnabled = await AsyncStorage.getItem('reminderNotificationEnabled');
      
      this.bankNotificationEnabled = bankEnabled === 'true';
      this.reminderNotificationEnabled = reminderEnabled === 'true';
      
      console.log('✅ Settings loaded:', {
        bankNotificationEnabled: this.bankNotificationEnabled,
        reminderNotificationEnabled: this.reminderNotificationEnabled
      });
    } catch (error) {
      console.error('❌ Error loading notification settings:', error);
      // Set defaults
      this.bankNotificationEnabled = false;
      this.reminderNotificationEnabled = false;
    }
  }

  async setBankNotificationEnabled(enabled) {
    try {
      this.bankNotificationEnabled = enabled;
      await AsyncStorage.setItem('bankNotificationEnabled', enabled.toString());
      
      if (enabled) {
        if (!this.isPushNotificationAvailable) {
          Alert.alert(
            'Notifications Not Available',
            'Push notifications are not properly configured. The app will work in manual mode. You can manually add transactions instead.',
            [{ text: 'OK' }]
          );
          return;
        }
        
        await this.requestNotificationPermissions();
        Alert.alert(
          'Bank Notifications Enabled',
          'The app will now analyze bank notifications to automatically create transactions. Make sure to grant notification access permissions.'
        );
      } else {
        Alert.alert(
          'Bank Notifications Disabled',
          'The app will no longer analyze bank notifications.'
        );
      }
    } catch (error) {
      console.error('Error setting bank notification:', error);
      Alert.alert('Error', 'Failed to update notification settings');
    }
  }

  async setReminderNotificationEnabled(enabled) {
    try {
      this.reminderNotificationEnabled = enabled;
      await AsyncStorage.setItem('reminderNotificationEnabled', enabled.toString());
      
      if (enabled) {
        if (!this.isPushNotificationAvailable) {
          Alert.alert(
            'Notifications Not Available',
            'Push notifications are not properly configured. Reminder notifications will not work. Please check your app installation.',
            [{ text: 'OK' }]
          );
          return;
        }
        
        await this.requestNotificationPermissions();
        this.scheduleReminderChecks();
        Alert.alert(
          'Reminder Notifications Enabled',
          'You will now receive notifications when reminders are approaching their due date.'
        );
      } else {
        this.cancelAllReminderNotifications();
        Alert.alert(
          'Reminder Notifications Disabled',
          'You will no longer receive reminder notifications.'
        );
      }
    } catch (error) {
      console.error('Error setting reminder notification:', error);
      Alert.alert('Error', 'Failed to update reminder notification settings');
    }
  }

  async requestNotificationPermissions() {
    if (Platform.OS === 'android') {
      Alert.alert(
        'Permissions Required',
        'To analyze bank notifications, please grant notification access in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Settings', onPress: () => {
            console.log('Open notification settings');
          }}
        ]
      );
    }
  }

  async handleNotification(notification) {
    if (!this.bankNotificationEnabled || !this.isPushNotificationAvailable) return;

    try {
      // Check if notification is from a banking app
      if (this.isBankNotification(notification)) {
        const transactionData = this.parseBankNotification(notification);
        if (transactionData) {
          await this.createTransactionFromNotification(transactionData);
        }
      }
    } catch (error) {
      console.error('Error handling notification:', error);
    }
  }

  isBankNotification(notification) {
    const bankAppIdentifiers = [
      'bank', 'banco', 'itau', 'bradesco', 'santander', 'caixa', 
      'nubank', 'inter', 'original', 'c6bank', 'btg', 'safra',
      'chase', 'wellsfargo', 'bankofamerica', 'citibank'
    ];

    const appName = (notification.channelId || notification.tag || '').toLowerCase();
    const title = (notification.title || '').toLowerCase();
    const body = (notification.body || '').toLowerCase();

    return bankAppIdentifiers.some(identifier => 
      appName.includes(identifier) || title.includes(identifier) || body.includes(identifier)
    );
  }

  parseBankNotification(notification) {
    const text = `${notification.title || ''} ${notification.body || ''}`;
    
    for (const bank of this.bankPatterns) {
      for (const pattern of bank.patterns) {
        const match = text.match(pattern);
        if (match) {
          const amount = parseFloat(match[1].replace(',', '.'));
          const isExpense = /compra|débito|debit|purchase|gasto|spend/i.test(text);
          
          return {
            amount: amount,
            description: this.extractDescription(text),
            type: isExpense ? 'expense' : 'income',
            category: this.guessCategory(text),
            date: new Date().toISOString(),
            source: 'bank_notification'
          };
        }
      }
    }
    
    return null;
  }

  extractDescription(text) {
    const cleanText = text
      .replace(/compra|débito|transferência|pix|purchase|debit|transaction/gi, '')
      .replace(/\$?\d+[.,]\d{2}/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    return cleanText.substring(0, 100) || 'Bank transaction';
  }

  guessCategory(text) {
    const categoryKeywords = {
      'Food': ['restaurant', 'food', 'coffee', 'lunch', 'dinner', 'cafe', 'comida', 'restaurante'],
      'Transport': ['uber', 'taxi', 'gas', 'fuel', 'metro', 'bus', 'transporte'],
      'Shopping': ['market', 'store', 'shop', 'amazon', 'mercado', 'loja'],
      'Entertainment': ['cinema', 'movie', 'game', 'netflix', 'spotify', 'entretenimento'],
      'Bills': ['electricity', 'water', 'internet', 'phone', 'conta', 'fatura']
    };

    const lowerText = text.toLowerCase();
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return category;
      }
    }
    
    return 'Other';
  }

  async createTransactionFromNotification(transactionData) {
    try {
      Alert.alert(
        'Bank Transaction Detected',
        `Amount: $${transactionData.amount}\nDescription: ${transactionData.description}\nType: ${transactionData.type}`,
        [
          { text: 'Ignore', style: 'cancel' },
          { text: 'Create Transaction', onPress: async () => {
            const result = await ApiService.addTransaction(transactionData);
            if (result.success) {
              console.log('Transaction created from notification');
              Alert.alert('Success', 'Transaction created successfully');
            } else {
              Alert.alert('Error', 'Failed to create transaction');
            }
          }}
        ]
      );
    } catch (error) {
      console.error('Error creating transaction from notification:', error);
    }
  }

  async scheduleReminderChecks() {
    if (!this.reminderNotificationEnabled || !this.isPushNotificationAvailable) return;

    try {
      // Schedule daily check for upcoming reminders
      PushNotification.cancelAllLocalNotifications();
      
      // Schedule notification to check reminders every day at 9 AM
      PushNotification.localNotificationSchedule({
        id: 'reminder_check',
        title: 'Checking Reminders',
        message: 'Checking for upcoming reminders...',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        repeatType: 'day',
        actions: ['Check'],
      });

      // Check immediately for due reminders
      this.checkUpcomingReminders();
    } catch (error) {
      console.error('Error scheduling reminder checks:', error);
    }
  }

  async checkUpcomingReminders() {
    try {
      const reminders = await ApiService.getReminders();
      if (!reminders.success) return;

      const now = new Date();
      const upcoming = reminders.reminders.filter(reminder => {
        if (reminder.is_completed) return false;
        
        const dueDate = new Date(reminder.due_datetime);
        const timeDiff = dueDate - now;
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        
        return hoursDiff > 0 && hoursDiff <= 24;
      });

      upcoming.forEach(reminder => {
        this.sendReminderNotification(reminder);
      });
    } catch (error) {
      console.error('Error checking upcoming reminders:', error);
    }
  }

  sendReminderNotification(reminder) {
    if (!this.isPushNotificationAvailable) return;
    
    try {
      const dueDate = new Date(reminder.due_datetime);
      const now = new Date();
      const timeDiff = dueDate - now;
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

      let timeText = '';
      if (hours > 0) {
        timeText = `in ${hours} hour${hours > 1 ? 's' : ''}`;
      } else {
        timeText = `in ${minutes} minute${minutes > 1 ? 's' : ''}`;
      }

      PushNotification.localNotification({
        id: `reminder_${reminder.id}`,
        title: 'Reminder Due Soon',
        message: `"${reminder.title}" is due ${timeText}`,
        actions: ['View', 'Complete'],
        userInfo: { reminderId: reminder.id },
      });
    } catch (error) {
      console.error('Error sending reminder notification:', error);
    }
  }

  cancelAllReminderNotifications() {
    if (!this.isPushNotificationAvailable) return;
    
    try {
      PushNotification.cancelAllLocalNotifications();
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  }

  getBankNotificationEnabled() {
    return this.bankNotificationEnabled;
  }

  getReminderNotificationEnabled() {
    return this.reminderNotificationEnabled;
  }

  // ✅ Add method to check availability
  isNotificationServiceAvailable() {
    return this.isPushNotificationAvailable;
  }
}

export default new NotificationService();