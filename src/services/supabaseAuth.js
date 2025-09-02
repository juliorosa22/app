// src/services/supabaseAuth.js - Direct Supabase authentication
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

WebBrowser.maybeCompleteAuthSession();

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || 'https://nprskndftygvxeldrthw.supabase.co';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabasePublishableKey || 'your-anon-key';
console.log('🔗 Supabase URL:', supabaseUrl);
console.log('🔑 Supabase Anon Key:', supabaseAnonKey);
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

class SupabaseAuthService {
  constructor() {
    if (Platform.OS === 'web') {
      // Use the current web origin for web
      this.redirectUri = window.location.origin + '/auth/callback';
    } else {
      // Use AuthSession for native
      this.redirectUri = AuthSession.makeRedirectUri({
        scheme: Constants.expoConfig?.scheme || 'okanassist',
        path: 'auth/callback'
      });
    }
    console.log('🔗 Supabase Auth Redirect URI:', this.redirectUri);
  }

 async signInWithGoogle() {
  try {
    console.log('🚀 Starting Supabase Google OAuth...');

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: this.redirectUri,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error || !data?.url) {
      throw new Error('Failed to get OAuth URL');
    }

    if (Platform.OS === 'web') {
      // On web, redirect the browser
      window.location.href = data.url;
      return;
    }

    // Native: Use WebBrowser
    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      this.redirectUri
    );

    // Log EVERYTHING about the result
    //console.log('📡 WebBrowser returned!');
    //console.log('📡 Result type:', result.type);
    //console.log('📡 Full result object:');
    //console.log(JSON.stringify(result, null, 2));

    if (result.type === 'success') {
      console.log('✅ WebBrowser success!');
      console.log('🔗 Result URL:', result.url);
      
      // Try to extract tokens immediately
      const url = new URL(result.url);
      //console.log('🔍 URL search:', url.search);
      //console.log('🔍 URL hash:', url.hash);
      
      // Simple token extraction
      const accessToken = url.searchParams.get('access_token') || 
                         (url.hash.match(/access_token=([^&]+)/) || [])[1];
      
      //console.log('🔍 Access token found:', !!accessToken);
      
      if (accessToken) {
        console.log('✅ Token found, setting session...');
        
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: url.searchParams.get('refresh_token') || 
                        (url.hash.match(/refresh_token=([^&]+)/) || [])[1],
        });

        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          throw new Error(`Session error: ${sessionError.message}`);
        }

        console.log('✅ Session set successfully!');
        
        // Get user
        const { data: userData } = await supabase.auth.getUser();
        console.log('✅ User:', userData.user?.email);

        // ✅ Enhanced user data extraction in signInWithGoogle
        return {
          success: true,
          user: {
            id: userData.user?.id,
            email: userData.user?.email,
            name: userData.user?.user_metadata?.full_name || 
                  userData.user?.user_metadata?.name || 
                  userData.user?.user_metadata?.display_name ||
                  'Google User',
            //avatar_url: userData.user?.user_metadata?.avatar_url || 
            //            userData.user?.user_metadata?.picture,
            //provider: 'google',
            //email_verified: userData.user?.email_confirmed_at !== null,
            // ✅ Add additional Google profile fields
            locale: userData.user?.user_metadata?.locale,
            currency: userData.user?.user_metadata?.currency,
          },
          session: sessionData.session,
        };
      } else {
        console.error('❌ No access token in callback URL');
        return { success: false, error: 'No access token found' };
      }
      
    } else if (result.type === 'cancel') {
      console.log('🚫 User cancelled');
      return { success: false, error: 'User cancelled', cancelled: true };
    } else {
      console.error('❌ WebBrowser failed:', result.type);
      return { success: false, error: `OAuth failed: ${result.type}` };
    }
    
  } catch (error) {
    console.error('❌ OAuth error:', error);
    return { success: false, error: error.message };
  }
}
async processOAuthCallback(callbackUrl) {
    try {
      //console.log('🔄 Processing OAuth callback...');
      //console.log('🔗 Processing URL:', callbackUrl);
      
      // Parse the callback URL
      const url = new URL(callbackUrl);
      
      // Log all URL parts for debugging
      //console.log('🔍 URL Protocol:', url.protocol);
      //console.log('🔍 URL Host:', url.host);
      //console.log('🔍 URL Pathname:', url.pathname);
      //console.log('🔍 URL Search:', url.search);
      //console.log('🔍 URL Hash:', url.hash);
      
      // Extract tokens from both search params and hash fragment
      const accessToken = url.searchParams.get('access_token') || 
                         this.extractFromFragment(callbackUrl, 'access_token');
      const refreshToken = url.searchParams.get('refresh_token') || 
                          this.extractFromFragment(callbackUrl, 'refresh_token');
      
      // Also check for error parameters
      const error = url.searchParams.get('error') || 
                   this.extractFromFragment(callbackUrl, 'error');
      const errorDescription = url.searchParams.get('error_description') || 
                              this.extractFromFragment(callbackUrl, 'error_description');

      if (error) {
        throw new Error(`OAuth error: ${error} - ${errorDescription}`);
      }

      if (!accessToken) {
        throw new Error('No access token found in callback URL');
      }

      console.log('🔄 Setting Supabase session with tokens...');
      
      // Set the session in Supabase
      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionError) {
        console.error('❌ Session error:', sessionError);
        throw new Error(`Session error: ${sessionError.message}`);
      }

      console.log('✅ Supabase session established successfully');
      console.log('👤 Session user:', sessionData.session?.user?.email);

      // Get user data to verify
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('❌ User data error:', userError);
        throw new Error(`User data error: ${userError.message}`);
      }

      console.log('✅ User data retrieved successfully:', userData.user?.email);

      const result = {
        success: true,
        user: {
          id: userData.user?.id,
          email: userData.user?.email,
          name: userData.user?.user_metadata?.full_name || 
                userData.user?.user_metadata?.name || 
                'Google User',
          avatar_url: userData.user?.user_metadata?.avatar_url,
          provider: 'google',
          email_verified: userData.user?.email_confirmed_at !== null,
        },
        session: sessionData.session,
        accessToken: sessionData.session?.access_token,
        refreshToken: sessionData.session?.refresh_token,
      };

      console.log('🎉 OAuth callback processing completed successfully');
      return result;

    } catch (error) {
      console.error('❌ Error processing OAuth callback:', error);
      console.error('❌ Error stack:', error.stack);
      throw error;
    }
  }


  // Helper to extract tokens from URL fragment
  extractFromFragment(url, param) {
    try {
      const urlObj = new URL(url);
      const fragment = urlObj.hash.substring(1); // Remove #
      const params = new URLSearchParams(fragment);
      return params.get(param);
    } catch (error) {
      return null;
    }
  }

  async signOut() {
    try {
      console.log('🚪 Signing out from Supabase...');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw new Error(`Sign out error: ${error.message}`);
      }

      await WebBrowser.dismissBrowser();
      
      console.log('✅ Signed out successfully');
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  }

  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw new Error(`Session error: ${error.message}`);
      }

      return { success: true, session };
    } catch (error) {
      console.error('Get session error:', error);
      return { success: false, error: error.message };
    }
  }

  async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        throw new Error(`Refresh error: ${error.message}`);
      }

      return { success: true, session: data.session };
    } catch (error) {
      console.error('Refresh session error:', error);
      return { success: false, error: error.message };
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.email);
      callback(event, session);
    });
  }

  async signUpWithEmail({ email, password, name, phone, currency }) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            phone,
            currency,
          },
        },
      });
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async signInWithEmail(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async resetPassword(email) {
    try {
      console.log('🔄 Starting password reset for:', email);
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: Platform.OS === 'web' 
          ? `${window.location.origin}/reset-password`
          : `${Constants.expoConfig?.scheme || 'okanassist'}://reset-password`
      });

      if (error) {
        throw new Error(`Password reset error: ${error.message}`);
      }

      console.log('✅ Password reset email sent successfully');
      return { 
        success: true, 
        message: 'Password reset email sent. Please check your inbox.' 
      };
    } catch (error) {
      console.error('❌ Password reset error:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  async updatePassword(newPassword) {
    try {
      console.log('🔄 Updating password...');
      
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw new Error(`Password update error: ${error.message}`);
      }

      console.log('✅ Password updated successfully');
      return { 
        success: true, 
        message: 'Password updated successfully' 
      };
    } catch (error) {
      console.error('❌ Password update error:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  async verifyOtp(email, token, type = 'recovery') {
    try {
      console.log('🔄 Verifying OTP token...');
      
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type
      });

      if (error) {
        throw new Error(`OTP verification error: ${error.message}`);
      }

      console.log('✅ OTP verified successfully');
      return { 
        success: true, 
        session: data.session,
        user: data.user
      };
    } catch (error) {
      console.error('❌ OTP verification error:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  // Handle deep link for password reset
  async handlePasswordResetLink(url) {
    try {
      console.log('🔗 Handling password reset link:', url);
      
      const urlObj = new URL(url);
      const accessToken = urlObj.searchParams.get('access_token');
      const refreshToken = urlObj.searchParams.get('refresh_token');
      const type = urlObj.searchParams.get('type');

      if (type !== 'recovery') {
        throw new Error('Invalid reset link type');
      }

      if (!accessToken) {
        throw new Error('No access token in reset link');
      }

      // Set session with the tokens from the reset link
      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionError) {
        throw new Error(`Session error: ${sessionError.message}`);
      }

      console.log('✅ Password reset session established');
      return { 
        success: true, 
        session: sessionData.session,
        canResetPassword: true
      };
    } catch (error) {
      console.error('❌ Password reset link error:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }
}

export default new SupabaseAuthService();