// src/context/AuthContext.js - Direct Supabase integration
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SupabaseAuthService from '../services/supabaseAuth';
import ApiService from '../services/api'; // Import ApiService

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  //console.log('[AuthContext] useAuth called. Context:', context);
  if (!context) {
    //console.error('[AuthContext] useAuth: context is undefined!');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  //console.log('[AuthContext] AuthProvider rendered');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [session, setSession] = useState(null);

  // --- Handle Supabase OAuth callback on web ---
  useEffect(() => {
    async function handleOAuthCallback() {
      if (
        typeof window !== 'undefined' &&
        window.location.pathname === '/auth/callback'
      ) {
        try {
          await SupabaseAuthService.processOAuthCallback(window.location.href);
          // Redirect to home after processing
          window.location.replace('/');
        } catch (e) {
          // Optionally handle error
          window.location.replace('/'); // Always redirect to home
        }
      }
    }
    handleOAuthCallback();
  }, []);
  // ---------------------------------------------

  useEffect(() => {
    console.log('🔧 AuthContext initializing...');
    
    // Check initial auth state
    checkAuthState();

    // Listen to auth changes with more detailed logging
    const { data: { subscription } } = SupabaseAuthService.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth event received:', event);
        console.log('👤 Session user:', session?.user?.email || 'No user');
        console.log('🔑 Session valid:', !!session?.access_token);
        
        if (event === 'SIGNED_IN' && session) {
          console.log('✅ Processing SIGNED_IN event');
          await handleSignIn(session);
        } else if (event === 'SIGNED_OUT') {
          console.log('✅ Processing SIGNED_OUT event');
          await handleSignOut();
        } else if (event === 'TOKEN_REFRESHED' && session) {
          console.log('✅ Processing TOKEN_REFRESHED event');
          await updateSession(session);
        } else {
          console.log(`ℹ️ Ignoring auth event: ${event}`);
        }
      }
    );

    return () => {
      console.log('🧹 Cleaning up auth listener');
      subscription?.unsubscribe();
    };
  }, []);

  const checkAuthState = async () => {
    try {
      console.log('🔍 Checking auth state...');
      setLoading(true);
      
      // Get current session from Supabase
      const { success, session } = await SupabaseAuthService.getCurrentSession();
      
      if (success && session) {
        console.log('✅ Found existing session');
        await handleSignIn(session);
      } else {
        console.log('ℹ️ No existing session found');
        await handleSignOut();
      }
    } catch (error) {
      console.error('❌ Error checking auth state:', error);
      await handleSignOut();
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (session) => {
    try {
      console.log('🔐 Processing sign in...');
      
      // Fetch user settings from the API
      const settingsResult = await ApiService.getUserSettings();
      const settings = settingsResult.success ? settingsResult.settings : {};

      // Get name from Supabase user metadata (Google/email login)
      const supabaseName =
        session.user?.user_metadata?.full_name ||
        session.user?.user_metadata?.name ||
        session.user?.name ||
        '';

      // Merge name: prefer settings.name, fallback to Supabase name
      const userData = {
        ...session.user,
        name: settings.name || supabaseName,
        currency: settings.currency || 'USD',
        language: settings.language || 'en',
        timezone: settings.timezone || 'UTC',
        // ...other fields...
      };

      // Save to AsyncStorage
      await AsyncStorage.multiSet([
        ['userData', JSON.stringify(userData)],
        ['supabaseSession', JSON.stringify(session)],
      ]);

      setUser(userData);
      setSession(session);
      setIsAuthenticated(true);
      
      console.log('✅ User signed in successfully:', userData.email);
    } catch (error) {
      console.error('❌ Error handling sign in:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      console.log('🚪 Processing sign out...');
      
      await AsyncStorage.multiRemove(['userData', 'supabaseSession']);
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
      
      console.log('✅ User signed out successfully');
    } catch (error) {
      console.error('❌ Error handling sign out:', error);
    }
  };

  const updateSession = async (session) => {
    try {
      console.log('🔄 Updating session...');
      await AsyncStorage.setItem('supabaseSession', JSON.stringify(session));
      setSession(session);
      console.log('✅ Session updated successfully');
    } catch (error) {
      console.error('❌ Error updating session:', error);
    }
  };

  const loginWithGoogle = async () => {
    try {
      console.log('🚀 Starting Google login...');
      setLoading(true);
      
      const result = await SupabaseAuthService.signInWithGoogle();
      
      // On web, result will be undefined because of redirect, so just return
      if (typeof window !== 'undefined' && window.location) {
        return { success: true, message: 'Redirecting to Google...' };
      }

      if (!result?.success) {
        if (result?.cancelled) {
          console.log('ℹ️ Login cancelled by user');
          return { success: false, message: 'Sign-in was cancelled' };
        }
        console.error('❌ Login failed:', result?.error);
        return { success: false, message: result?.error };
      }

      // Session will be handled by the auth state change listener
      console.log('✅ Google authentication successful');
      
      return { 
        success: true, 
        message: `Welcome ${result.user.name}! Google login successful.`
      };

    } catch (error) {
      console.error('❌ Google login error:', error);
      return { 
        success: false, 
        message: error.message || 'Google login failed. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Starting logout...');
      setLoading(true);
      
      const result = await SupabaseAuthService.signOut();
      
      if (!result.success) {
        console.warn('⚠️ Supabase sign out warning:', result.error);
      }

      // Clear local state regardless
      await handleSignOut();
      
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Clear local state even if Supabase call fails
      await handleSignOut();
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const result = await SupabaseAuthService.signUpWithEmail(formData);
      if (!result.success) {
        return { success: false, message: result.error };
      }
      // Session will be handled by auth state listener
      return { success: true, message: 'Account created! Please check your email to verify.' };
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const result = await SupabaseAuthService.signInWithEmail(email, password);
      if (!result.success) {
        return { success: false, message: result.error };
      }
      // Session will be handled by auth state listener
      return { success: true, message: 'Login successful!' };
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    session,
    loginWithGoogle,
    logout,
    register,
    login,
    // For API calls, you can use session.access_token
    getAccessToken: () => session?.access_token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};