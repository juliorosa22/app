
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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [session, setSession] = useState(null);
  // ✅ Add transition loading state
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Add this helper function to check if we should show loading
  const shouldShowLoading = () => {
    return loading || isTransitioning || (user && !isAuthenticated);
  };

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
          setIsTransitioning(true); // ✅ Set transition state
          await handleSignIn(session);
          setIsTransitioning(false); // ✅ Clear transition state
        } else if (event === 'SIGNED_OUT') {
          console.log('✅ Processing SIGNED_OUT event');
          setIsTransitioning(true); // ✅ Set transition state
          await handleSignOut();
          setIsTransitioning(false); // ✅ Clear transition state
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
      
      // ✅ Set authenticated state BEFORE processing user data to prevent flicker
      setSession(session);
      setIsAuthenticated(true);
      
      // ✅ FIX: Better extraction of user name from different sources
      const supabaseName = 
        session.user?.user_metadata?.full_name ||
        session.user?.user_metadata?.name ||
        session.user?.name ||
        session.user?.user_metadata?.display_name ||
        session.user?.email?.split('@')[0] || // Fallback to email username
        '';
      
      console.log('👤 Extracted user name:', supabaseName);
      console.log('📧 User email:', session.user?.email);
      console.log('🔍 User metadata:', JSON.stringify(session.user?.user_metadata, null, 2));
      
      // Fetch user settings from the API
      const settingsResult = await ApiService.getUserSettings();
      let settings = {};

      if (settingsResult.success && settingsResult.settings) {
        // User has existing settings
        settings = settingsResult.settings;
        console.log('✅ Found existing user settings');
      } else {
        // No settings found, create initial settings
        console.log('ℹ️ No user settings found, creating initial settings...');
        
        // ✅ FIX: Better timezone detection and more comprehensive initial settings
        const deviceTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
        
        // ✅ FIX: Use Google profile data if available
        const initialSettings = {
          name: supabaseName || '',
          currency: session.user?.user_metadata?.currency || 'USD',
          language: session.user?.user_metadata?.locale?.substring(0, 2) || 'en', // Extract language from locale
          timezone: deviceTimezone
        };

        console.log('📝 Creating initial settings:', initialSettings);

        // Store initial settings in the database
        const createResult = await ApiService.updateUserSettings(initialSettings);
        
        if (createResult.success) {
          settings = createResult.settings;
          console.log('✅ Initial user settings created successfully');
        } else {
          console.warn('⚠️ Failed to create initial settings:', createResult.error);
          settings = initialSettings; // Use local settings as fallback
        }
      }

      // ✅ FIX: Better user data merging with Google profile information
      const userData = {
        ...session.user,
        ...session.user?.user_metadata, // Merge user_metadata
        name: settings.name || supabaseName,
        currency: settings.currency || 'USD',
        language: settings.language || 'en',
        timezone: settings.timezone || 'UTC',
      };

      console.log('👤 Final user data:', {
        email: userData.email,
        name: userData.name,
      });

      // Save to AsyncStorage
      await AsyncStorage.multiSet([
        ['userData', JSON.stringify(userData)],
        ['supabaseSession', JSON.stringify(session)],
      ]);

      setUser(userData);
      
      console.log('✅ User signed in successfully:', userData.email);
    } catch (error) {
      console.error('❌ Error handling sign in:', error);
      // ✅ Reset auth state on error
      setIsAuthenticated(false);
      setUser(null);
      setSession(null);
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
      setIsTransitioning(true);
      
      const result = await SupabaseAuthService.signInWithGoogle();
      console.log('🔔 Google login result:', result);
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

      // ✅ FIX: Process the Google login result immediately for native apps
      if (result.session && result.user) {
        console.log('✅ Google authentication successful, processing session...');
        await handleSignIn(result.session);
        
        return { 
          success: true, 
          message: `Welcome ${result.user?.name || 'User'}! Google login successful.`
        };
      }

      // Session will be handled by the auth state change listener (fallback)
      console.log('✅ Google authentication successful');
      
      return { 
        success: true, 
        message: `Welcome ${result.user?.name || 'User'}! Google login successful.`
      };

    } catch (error) {
      console.error('❌ Google login error:', error);
      return { 
        success: false, 
        message: error.message || 'Google login failed. Please try again.' 
      };
    } finally {
      // ✅ Don't set loading to false immediately, let the auth state change handle it
      setTimeout(() => {
        setLoading(false);
        setIsTransitioning(false);
      }, 500);
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

  // ✅ Add updateUser function
  const updateUser = (updatedUserData) => {
    try {
      setUser(updatedUserData);
      AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
      console.log('✅ User context updated:', updatedUserData);
    } catch (error) {
      console.error('❌ Error updating user context:', error);
    }
  };

  const value = {
    user,
    loading: shouldShowLoading(), // ✅ Use the helper function
    isAuthenticated,
    session,
    loginWithGoogle,
    logout,
    register,
    login,
    updateUser, // ✅ Add this
    // For API calls, you can use session.access_token
    getAccessToken: () => session?.access_token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};