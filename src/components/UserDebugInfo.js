import React from 'react';
import { View, Text } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function UserDebugInfo() {
  const { user } = useAuth();

  if (!user) {
    return (
      <View style={{ padding: 16 }}>
        <Text>No user info available.</Text>
      </View>
    );
  }

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 18 }}>User Info:</Text>
      {Object.entries(user).map(([key, value]) => (
        <Text key={key} style={{ marginVertical: 2 }}>
          {key}: {String(value)}
        </Text>
      ))}
    </View>
  );
}