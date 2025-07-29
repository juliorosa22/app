// app/src/services/expoGoogleAuth.js - Fixed version
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import Constants from 'expo-constants';

WebBrowser.maybeCompleteAuthSession();

class ExpoGoogleAuth {
  constructor() {
    // Force the proxy URI
    this.redirectUri = 'https://auth.expo.io/@okanassist22/okanassist'; 
    console.log('🔗 Google Auth Redirect URI:', this.redirectUri);
  }

  async signIn() {
    try {
      const googleClientId = Constants.expoConfig?.extra?.googleWebClientId;
      
      if (!googleClientId) {
        throw new Error('Google Client ID not found');
      }

      console.log('🔍 Starting Google OAuth (Code Flow)...');

      // Use Authorization Code Flow - more reliable with Expo
      const request = new AuthSession.AuthRequest({
        clientId: googleClientId,
        scopes: ['openid', 'profile', 'email'],
        responseType: AuthSession.ResponseType.Code, // Code flow instead of implicit
        redirectUri: this.redirectUri,
        additionalParameters: {},
        extraParams: {
          prompt: 'select_account',
          access_type: 'offline',
        },
      });

      console.log('🚀 Starting OAuth flow...');

      const result = await request.promptAsync({
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        useProxy: true,
        dismissButtonStyle: 'cancel',
        showInRecents: false,
      });

      console.log('📡 OAuth Result Type:', result.type);

      if (result.type === 'success') {
        console.log('✅ Got authorization code, exchanging for tokens...');
        
        const authCode = result.params?.code;
        if (!authCode) {
          throw new Error('No authorization code received');
        }

        console.log('🔄 Exchanging code for ID token...');
        
        // Exchange authorization code for tokens directly with Google
        const tokenResult = await this.exchangeCodeForTokens(
          authCode, 
          googleClientId,
          request.codeVerifier
        );

        return tokenResult;

      } else if (result.type === 'cancel') {
        console.log('🚫 User cancelled');
        return { success: false, error: 'User cancelled', cancelled: true };
        
      } else if (result.type === 'error') {
        console.error('❌ OAuth error:', result.error);
        return { 
          success: false, 
          error: result.error?.description || 'Authentication failed' 
        };
        
      } else {
        console.error('❌ Unknown result type:', result.type);
        return { success: false, error: `Unknown result: ${result.type}` };
      }
      
    } catch (error) {
      console.error('❌ Google Auth error:', error);
      return { success: false, error: error.message };
    }
  }

  async exchangeCodeForTokens(authCode, clientId, codeVerifier) {
    try {
      console.log('🔄 Exchanging authorization code for tokens...');
      
      const tokenEndpoint = 'https://oauth2.googleapis.com/token';
      
      const body = new URLSearchParams({
        client_id: clientId,
        code: authCode,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
        code_verifier: codeVerifier, // PKCE code verifier
      });

      console.log('📡 Making token exchange request...');

      const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      const data = await response.json();
      console.log('📡 Token response status:', response.status);

      if (response.ok && data.id_token) {
        console.log('✅ Tokens received successfully');
        
        // Decode user info from ID token
        const userInfo = this.decodeJWTPayload(data.id_token);
        console.log('👤 User info decoded:', userInfo.email);
        
        return {
          success: true,
          idToken: data.id_token,
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          user: {
            id: userInfo.sub,
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
            givenName: userInfo.given_name,
            familyName: userInfo.family_name,
          },
        };
      } else {
        console.error('❌ Token exchange failed:', data);
        throw new Error(data.error_description || 'Failed to exchange code for tokens');
      }
      
    } catch (error) {
      console.error('❌ Token exchange error:', error);
      return {
        success: false,
        error: error.message || 'Token exchange failed',
      };
    }
  }

  decodeJWTPayload(token) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }
      
      const payload = parts[1];
      const paddedPayload = payload + '==='.slice((payload.length + 3) % 4);
      const decoded = atob(paddedPayload);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('JWT decode error:', error);
      return {};
    }
  }
}

export default new ExpoGoogleAuth();