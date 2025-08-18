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
    const url = `https://t.me/${telegramBotUsername}?start=${user.id}`;
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