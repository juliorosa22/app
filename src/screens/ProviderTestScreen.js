import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function ProviderTestScreen() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: colors.primary, fontSize: 24 }}>
        Theme colors are working!
      </Text>
      <Text style={{ color: colors.textPrimary, marginTop: 12 }}>
        Primary: {colors.primary}
      </Text>
      <Text style={{ color: colors.textSecondary, marginTop: 4 }}>
        Secondary: {colors.textSecondary || 'undefined'}
      </Text>
      <Text style={{ color: colors.error, marginTop: 4 }}>
        Error: {colors.error}
      </Text>
    </View>
  );
}