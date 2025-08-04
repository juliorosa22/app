// src/services/expoGoogleAuth.js - Update existing file
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import Constants from 'expo-constants';
import ApiService from './api';

WebBrowser.maybeCompleteAuthSession();

class ExpoGoogleAuth {
  constructor() {
    this.redirectUri = AuthSession.makeRedirectUri({ 
      scheme: Constants.expoConfig?.scheme || 'okanassist',
      path: 'auth/callback'
    });
    console.log('🔗 Google Auth Redirect URI:', this.redirectUri);
  }

  async signIn() {
    try {
      console.log('🚀 Starting Google OAuth flow...');

      // First, try to get the OAuth URL from your API
      try {
        const urlResponse = await ApiService.getGoogleAuthUrl(
          Constants.expoConfig?.scheme || 'okanassist'
        );

        if (urlResponse.success) {
          console.log('🔗 Using API-provided OAuth URL');
          return await this._handleOAuthUrl(urlResponse.auth_url);
        }
      } catch (apiError) {
        console.log('⚠️ API OAuth URL failed, using direct method:', apiError.message);
      }

      // Fallback to direct OAuth if API method fails
      return await this._directOAuthFlow();

    } catch (error) {
      console.error('❌ Google Auth error:', error);
      return { success: false, error: error.message };
    }
  }

  async _handleOAuthUrl(authUrl) {
    try {
      // Open the OAuth URL provided by your API
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        this.redirectUri,
        {
          dismissButtonStyle: 'cancel',
          showInRecents: false,
        }
      );

      if (result.type === 'success') {
        return await this._processOAuthResult(result.url);
      } else if (result.type === 'cancel') {
        return { success: false, error: 'User cancelled', cancelled: true };
      } else {
        return { success: false, error: 'OAuth failed' };
      }
    } catch (error) {
      throw new Error(`OAuth URL handling failed: ${error.message}`);
    }
  }

  async _directOAuthFlow() {
    try {
      const googleClientId = Constants.expoConfig?.extra?.googleWebClientId;
      
      if (!googleClientId) {
        throw new Error('Google Client ID not found in configuration');
      }

      console.log('🔍 Starting direct Google OAuth flow...');

      const request = new AuthSession.AuthRequest({
        clientId: googleClientId,
        scopes: ['openid', 'profile', 'email'],
        responseType: AuthSession.ResponseType.Code,
        redirectUri: this.redirectUri,
        additionalParameters: {},
        extraParams: {
          prompt: 'select_account',
          access_type: 'offline',
        },
      });

      const result = await request.promptAsync({
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        useProxy: true,
        dismissButtonStyle: 'cancel',
        showInRecents: false,
      });

      if (result.type === 'success') {
        const authCode = result.params?.code;
        if (!authCode) {
          throw new Error('No authorization code received');
        }

        // Exchange code for tokens
        const tokenResult = await this.exchangeCodeForTokens(
          authCode, 
          googleClientId,
          request.codeVerifier
        );

        return tokenResult;
      } else if (result.type === 'cancel') {
        return { success: false, error: 'User cancelled', cancelled: true };
      } else {
        return { success: false, error: 'OAuth failed' };
      }
    } catch (error) {
      throw new Error(`Direct OAuth flow failed: ${error.message}`);
    }
  }

  async _processOAuthResult(resultUrl) {
    try {
      const url = new URL(resultUrl);
      const accessToken = url.searchParams.get('access_token');
      const refreshToken = url.searchParams.get('refresh_token');
      const idToken = url.searchParams.get('id_token');
      const code = url.searchParams.get('code');

      if (idToken) {
        // Use ID token to authenticate with your API
        console.log('🔄 Authenticating with API using ID token...');
        
        const authResponse = await ApiService.loginWithGoogle(idToken);
        
        if (authResponse.success) {
          return {
            success: true,
            user: authResponse.user,
            accessToken: authResponse.access_token,
            refreshToken: authResponse.refresh_token,
            expiresIn: authResponse.expires_in,
          };
        } else {
          throw new Error('API authentication failed');
        }
      } else if (code) {
        // Exchange authorization code
        console.log('🔄 Exchanging authorization code...');
        // You might need to implement code exchange via your API
        throw new Error('Authorization code exchange not implemented');
      } else if (accessToken) {
        // Direct token usage (less secure, but might work)
        console.log('🔄 Using access token directly...');
        return {
          success: true,
          accessToken,
          refreshToken,
          // Note: You'll need to get user info separately
        };
      } else {
        throw new Error('No valid tokens received from OAuth');
      }
    } catch (error) {
      throw new Error(`OAuth result processing failed: ${error.message}`);
    }
  }

  async exchangeCodeForTokens(authCode, clientId, codeVerifier) {
    // Keep your existing implementation, but also try to use your API
    try {
      console.log('🔄 Exchanging authorization code for tokens...');
      
      const tokenEndpoint = 'https://oauth2.googleapis.com/token';
      
      const body = new URLSearchParams({
        client_id: clientId,
        code: authCode,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
        code_verifier: codeVerifier,
      });

      const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      const data = await response.json();

      if (response.ok && data.id_token) {
        console.log('✅ Tokens received, authenticating with API...');
        
        // Use the ID token with your API
        const authResponse = await ApiService.loginWithGoogle(data.id_token);
        
        if (authResponse.success) {
          return {
            success: true,
            user: authResponse.user,
            accessToken: authResponse.access_token,
            refreshToken: authResponse.refresh_token,
            expiresIn: authResponse.expires_in,
          };
        } else {
          throw new Error('API authentication failed');
        }
      } else {
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

  // Keep your existing decodeJWTPayload method
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

  async signOut() {
    try {
      await WebBrowser.dismissBrowser();
      return { success: true };
    } catch (error) {
      console.error('Google Sign-Out Error:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new ExpoGoogleAuth();