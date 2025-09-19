import React from 'react';
import { TouchableOpacity, Alert, Linking } from 'react-native';
import LottieView from 'lottie-react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function TelegramBotHeaderButton({ size = 32 }) {
  const { user } = useAuth();
  const { colors } = useTheme();

  const handleUpgrade = () => {
    if (!user?.id) {
      Alert.alert('Please log in to upgrade.');
      return;
    }
    const telegramBotUsername = 'okassist_bot';
    // Get user language, timezone, and currency (with fallbacks)
    const language = user.language || 'en';
    const timezone = user.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const currency = user.currency || 'USD';

    // Encode parameters for URL

    const url = `https://t.me/${telegramBotUsername}?start=${user.id}&lang=${language}&tz=${timezone}&curr=${currency}`;
    Alert.alert('Opening Telegram bot with params:', url);
    Linking.openURL(url);
  };

  return (
    <TouchableOpacity
      onPress={handleUpgrade}
      activeOpacity={0.85}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
      }}
    >
      <LottieView
        source={require('../images/telegram_logo.json')}
        autoPlay
        loop
        style={{
          width: size ,
          height: size ,
          backgroundColor: 'transparent',
        }}
      />
    </TouchableOpacity>
  );
}