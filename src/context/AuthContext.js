// src/context/AuthContext.js - Direct Supabase integration
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SupabaseAuthService from '../services/supabaseAuth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [session, setSession] = useState(null);

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
      
      const userData = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.user_metadata?.full_name || 
              session.user.user_metadata?.name || 
              session.user.email?.split('@')[0] || 
              'User',
        avatar_url: session.user.user_metadata?.avatar_url,
        provider: session.user.app_metadata?.provider || 'supabase',
        email_verified: session.user.email_confirmed_at !== null,
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
      
      if (!result.success) {
        if (result.cancelled) {
          console.log('ℹ️ Login cancelled by user');
          return { success: false, message: 'Sign-in was cancelled' };
        }
        console.error('❌ Login failed:', result.error);
        return { success: false, message: result.error };
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

  const value = {
    user,
    loading,
    isAuthenticated,
    session,
    loginWithGoogle,
    logout,
    // For API calls, you can use session.access_token
    getAccessToken: () => session?.access_token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};