// src/services/supabaseAuth.js - Direct Supabase authentication
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

class SupabaseAuthService {
  constructor() {
    //const scheme = Constants.expoConfig?.scheme || 'okanassist';
    this.redirectUri = AuthSession.makeRedirectUri({ 
      scheme: Constants.expoConfig?.scheme || 'okanassist',
      path: 'auth/callback'
    });
    console.log('🔗 Supabase Auth Redirect URI:', this.redirectUri);
  }

 async signInWithGoogle() {
  try {
    console.log('🚀 Starting Supabase Google OAuth...');

    // Get OAuth URL
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

    console.log('🔗 OAuth URL generated:', data.url);
    console.log('🔗 Opening OAuth URL...');

    // Simple WebBrowser call with lots of logging
    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      this.redirectUri
    );

    // Log EVERYTHING about the result
    console.log('📡 WebBrowser returned!');
    console.log('📡 Result type:', result.type);
    console.log('📡 Full result object:');
    console.log(JSON.stringify(result, null, 2));

    if (result.type === 'success') {
      console.log('✅ WebBrowser success!');
      console.log('🔗 Result URL:', result.url);
      
      // Try to extract tokens immediately
      const url = new URL(result.url);
      console.log('🔍 URL search:', url.search);
      console.log('🔍 URL hash:', url.hash);
      
      // Simple token extraction
      const accessToken = url.searchParams.get('access_token') || 
                         (url.hash.match(/access_token=([^&]+)/) || [])[1];
      
      console.log('🔍 Access token found:', !!accessToken);
      
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

        return {
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
      console.log('🔄 Processing OAuth callback...');
      console.log('🔗 Processing URL:', callbackUrl);
      
      // Parse the callback URL
      const url = new URL(callbackUrl);
      
      // Log all URL parts for debugging
      console.log('🔍 URL Protocol:', url.protocol);
      console.log('🔍 URL Host:', url.host);
      console.log('🔍 URL Pathname:', url.pathname);
      console.log('🔍 URL Search:', url.search);
      console.log('🔍 URL Hash:', url.hash);
      
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

      console.log('🔍 Extracted tokens:', {
        accessToken: accessToken ? `${accessToken.substring(0, 20)}...` : 'None',
        refreshToken: refreshToken ? `${refreshToken.substring(0, 20)}...` : 'None',
        error: error || 'None',
        errorDescription: errorDescription || 'None'
      });

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
}

export default new SupabaseAuthService();