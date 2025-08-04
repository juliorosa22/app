// Create debug_supabase_config.js in your project root

import Constants from 'expo-constants';

const config = {
  supabaseUrl: Constants.expoConfig?.extra?.supabaseUrl,
  supabaseKey: Constants.expoConfig?.extra?.supabasePublishableKey,
  scheme: Constants.expoConfig?.scheme,
};

console.log('📱 Supabase Configuration Check:');
console.log('================================');
console.log('Supabase URL:', config.supabaseUrl || '❌ Missing');
console.log('Supabase Key:', config.supabaseKey ? `${config.supabaseKey.substring(0, 20)}...` : '❌ Missing');
console.log('App Scheme:', config.scheme || '❌ Missing');

export default config;