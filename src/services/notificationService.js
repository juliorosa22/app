import { Alert, Platform, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import ApiService from './api';

// ✅ Configure notifications for Expo
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  constructor() {
    this.isInitialized = false;
    this.reminderNotificationEnabled = false;
    this.appStateSubscription = null;
    this.lastReminderCheck = 0;
  }

  async initialize() {
    if (this.isInitialized) return;

    console.log('🔔 Starting NotificationService initialization...');

    try {
      // ✅ Load settings first
      await this.loadSettings();

      // ✅ Request permissions for Expo notifications
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('⚠️ Notification permissions not granted');
        Alert.alert(
          'Notifications Disabled',
          'Please enable notifications in your device settings to receive reminders.',
          [{ text: 'OK' }]
        );
      }

      // ✅ Setup notification listeners
      this.setupNotificationListeners();

      // ✅ Setup AppState listener
      this.setupAppStateListener();

      this.isInitialized = true;
      console.log('✅ NotificationService initialized successfully');
      
    } catch (error) {
      console.error('❌ Error during NotificationService initialization:', error);
      
      // ✅ Still mark as initialized to prevent retry loops
      this.isInitialized = true;
      
      // ✅ Ensure settings are loaded even if notifications fail
      if (!this.reminderNotificationEnabled) {
        await this.loadSettings();
      }
      
      throw new Error(`NotificationService initialization failed: ${error.message}`);
    }
  }

  // ✅ Setup notification listeners for Expo
  setupNotificationListeners() {
    // ✅ Listen for notification responses (when user taps notification)
    Notifications.addNotificationResponseReceivedListener(response => {
      console.log('🔔 Notification response received:', response);
      // Handle notification tap here if needed
    });

    // ✅ Listen for received notifications
    Notifications.addNotificationReceivedListener(notification => {
      console.log('📱 Notification received:', notification);
      // Handle foreground notifications here if needed
    });
  }

  // ✅ Setup AppState listener
  setupAppStateListener() {
    this.appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      console.log('📱 AppState changed to:', nextAppState);
      
      if (nextAppState === 'active') {
        // ✅ App came to foreground - check reminders
        this.handleAppForeground();
      }
    });
  }

  // ✅ Handle app coming to foreground
  async handleAppForeground() {
    console.log('🌅 App is now in foreground');
    
    // ✅ Check reminders if enabled
    if (this.reminderNotificationEnabled) {
      const now = Date.now();
      // ✅ Only check reminders once per hour to avoid spam
      if (now - this.lastReminderCheck > 3600000) { // 1 hour
        this.lastReminderCheck = now;
        await this.checkUpcomingReminders();
      }
    }
  }

  async loadSettings() {
    try {
      console.log('📖 Loading notification settings...');
      
      const reminderEnabled = await AsyncStorage.getItem('reminderNotificationEnabled');
      
      this.reminderNotificationEnabled = reminderEnabled === 'true';
      
      console.log('✅ Settings loaded:', {
        reminderNotificationEnabled: this.reminderNotificationEnabled
      });
    } catch (error) {
      console.error('❌ Error loading notification settings:', error);
      // Set defaults
      this.reminderNotificationEnabled = false;
    }
  }

  async setReminderNotificationEnabled(enabled) {
    try {
      this.reminderNotificationEnabled = enabled;
      await AsyncStorage.setItem('reminderNotificationEnabled', enabled.toString());
      
      if (enabled) {
        Alert.alert(
          'Reminder Notifications Enabled',
          'You will now receive notifications when reminders are approaching their due date while the app is open.'
        );
        
        // ✅ Check reminders immediately when enabled
        await this.checkUpcomingReminders();
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

  async checkUpcomingReminders() {
    try {
      console.log('🔍 Checking for upcoming reminders...');
      
      const reminders = await ApiService.getReminders();
      if (!reminders.success) {
        console.log('❌ Failed to fetch reminders');
        return;
      }

      const now = new Date();
      const upcoming = reminders.reminders.filter(reminder => {
        if (reminder.is_completed) return false;
        
        const dueDate = new Date(reminder.due_datetime);
        const timeDiff = dueDate - now;
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        
        return hoursDiff > 0 && hoursDiff <= 24;
      });

      console.log(`📋 Found ${upcoming.length} upcoming reminders`);

      upcoming.forEach(reminder => {
        this.sendReminderNotification(reminder);
      });
    } catch (error) {
      console.error('❌ Error checking upcoming reminders:', error);
    }
  }

  async sendReminderNotification(reminder) {
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

      console.log(`🔔 Sending reminder notification for: ${reminder.title}`);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Reminder Due Soon',
          body: `"${reminder.title}" is due ${timeText}`,
          data: { reminderId: reminder.id },
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('❌ Error sending reminder notification:', error);
    }
  }

  async cancelAllReminderNotifications() {
    try {
      console.log('🚫 Cancelling all reminder notifications');
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('❌ Error cancelling notifications:', error);
    }
  }

  // ✅ Cleanup method
  cleanup() {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }
  }

  getReminderNotificationEnabled() {
    return this.reminderNotificationEnabled;
  }

  // ✅ Add method to check availability
  isNotificationServiceAvailable() {
    return true; // Expo notifications are always available in EAS builds
  }

  // ✅ Add method to manually trigger reminder check (for testing)
  async triggerReminderCheck() {
    if (this.reminderNotificationEnabled) {
      await this.checkUpcomingReminders();
    }
  }
}

export default new NotificationService();