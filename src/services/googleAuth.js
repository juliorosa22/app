// app/src/services/googleAuth.js
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';

class GoogleAuthService {
  constructor() {
    this.isConfigured = false;
  }

  configure() {
    if (this.isConfigured) return;

    GoogleSignin.configure({
      webClientId: 'YOUR_GOOGLE_WEB_CLIENT_ID', // From Google Cloud Console
      iosClientId: 'YOUR_IOS_CLIENT_ID', // From Google Cloud Console
      androidClientId: 'YOUR_ANDROID_CLIENT_ID', // From Google Cloud Console
      scopes: ['profile', 'email'],
      offlineAccess: true,
      hostedDomain: '', // Optional: restrict to specific domain
      forceCodeForRefreshToken: true,
    });

    this.isConfigured = true;
  }

  async signIn() {
    try {
      this.configure();
      
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      return {
        success: true,
        user: userInfo.user,
        tokens: userInfo.serverAuthCode ? {
          accessToken: userInfo.serverAuthCode,
          idToken: userInfo.idToken,
        } : null,
      };
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      
      let message = 'Google Sign-In failed';
      if (error.code === 'SIGN_IN_CANCELLED') {
        message = 'Sign-in was cancelled';
      } else if (error.code === 'IN_PROGRESS') {
        message = 'Sign-in is already in progress';
      } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        message = 'Google Play Services not available';
      }

      return {
        success: false,
        error: message,
      };
    }
  }

  async signOut() {
    try {
      await GoogleSignin.signOut();
      return { success: true };
    } catch (error) {
      console.error('Google Sign-Out Error:', error);
      return { success: false, error: error.message };
    }
  }

  async getCurrentUser() {
    try {
      const userInfo = await GoogleSignin.signInSilently();
      return { success: true, user: userInfo.user };
    } catch (error) {
      return { success: false, error: 'No signed-in user' };
    }
  }

  async isSignedIn() {
    return await GoogleSignin.isSignedIn();
  }
}

export default new GoogleAuthService();