// app/src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../services/api';
import ExpoGoogleAuth from '../services/expoGoogleAuth';
import Constants from 'expo-constants';

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
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const [userData, token] = await Promise.all([
        AsyncStorage.getItem('userData'),
        AsyncStorage.getItem('authToken')
      ]);

      if (userData && token) {
        const parsedUser = JSON.parse(userData);
        
        // Verify token is still valid
        try {
          const profileData = await ApiService.getUserProfile(token);
          setUser(profileData.user);
          setAuthToken(token);
          setIsAuthenticated(true);
        } catch (error) {
          console.log('Token expired, clearing auth state');
          await clearAuthState();
        }
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      await clearAuthState();
    } finally {
      setLoading(false);
    }
  };

  const clearAuthState = async () => {
    await AsyncStorage.multiRemove(['userData', 'authToken', 'refreshToken']);
    setUser(null);
    setAuthToken(null);
    setIsAuthenticated(false);
  };

  const saveAuthState = async (userData, tokens) => {
    await AsyncStorage.multiSet([
      ['userData', JSON.stringify(userData)],
      ['authToken', tokens.access_token],
      ['refreshToken', tokens.refresh_token || '']
    ]);
    
    setUser(userData);
    setAuthToken(tokens.access_token);
    setIsAuthenticated(true);
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      
      const response = await ApiService.login(email, password);
      
      if (response.success) {
        await saveAuthState(response.user, response.tokens);
        return { success: true, message: 'Login successful!' };
      } else {
        return { success: false, message: response.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message || 'Login failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      
      console.log('🚀 Starting Google login...');
      
      // Use Expo AuthSession for Google authentication
      const googleResult = await ExpoGoogleAuth.signIn();
      
      if (!googleResult.success) {
        // Handle cancellation gracefully
        if (googleResult.cancelled) {
          return { success: false, message: 'Sign-in was cancelled' };
        }
        return { success: false, message: googleResult.error };
      }

      console.log('✅ Google authentication successful for:', googleResult.user.email);

      // Send Google ID token to your backend API
      const apiUrl = Constants.expoConfig?.extra?.apiUrl || 'http://192.168.1.100:8000/api';
      
      console.log('📡 Sending token to API:', apiUrl);
      
      const response = await fetch(`${apiUrl}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          google_token: googleResult.idToken,
        }),
      });

      const data = await response.json();
      console.log('🔙 API Response:', data.success ? 'Success' : 'Failed', data.message);

      if (response.ok && data.success) {
        // Save authentication state
        await saveAuthState(data.user, data.tokens);
        
        return { 
          success: true, 
          message: `Welcome ${data.user.name}! Google login successful.`
        };
      } else {
        return { 
          success: false, 
          message: data.message || 'Server authentication failed' 
        };
      }

    } catch (error) {
      console.error('❌ Google login error:', error);
      
      // Network or other errors
      if (error.message.includes('Network')) {
        return { 
          success: false, 
          message: 'Network error. Please check your connection and API server.' 
        };
      }
      
      return { 
        success: false, 
        message: error.message || 'Google login failed. Please try again.' 
      };
    } finally {
      setLoading(false);
    }

  };

  const register = async (userData) => {
    try {
      setLoading(true);
      
      const response = await ApiService.register(userData);
      
      if (response.success) {
        // If registration requires email verification
        if (response.requires_verification) {
          return { 
            success: true, 
            message: 'Registration successful! Please check your email to verify your account.',
            requiresVerification: true,
            verificationToken: response.verification_token
          };
        } else {
          // Auto-login after registration
          await saveAuthState(response.user, response.tokens);
          return { success: true, message: 'Registration successful!' };
        }
      } else {
        return { success: false, message: response.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: error.message || 'Registration failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (verificationToken) => {
    try {
      setLoading(true);
      
      const response = await ApiService.verifyEmail(verificationToken);
      
      if (response.success) {
        await saveAuthState(response.user, response.tokens);
        return { success: true, message: 'Email verified successfully!' };
      } else {
        return { success: false, message: response.message || 'Email verification failed' };
      }
    } catch (error) {
      console.error('Email verification error:', error);
      return { success: false, message: error.message || 'Email verification failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      // Call API logout if we have a token
      if (authToken) {
        try {
          await ApiService.logout(authToken);
        } catch (error) {
          console.log('API logout failed, continuing with local logout');
        }
      }

      // Sign out from Google if signed in
      await GoogleAuthService.signOut();
      
      // Clear local state
      await clearAuthState();
      
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear local state
      await clearAuthState();
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    try {
      if (!authToken) {
        return { success: false, message: 'Not authenticated' };
      }

      const response = await ApiService.updateUserProfile(authToken, updates);
      
      if (response.success) {
        const updatedUser = { ...user, ...response.user };
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return { success: true, message: 'Profile updated successfully!' };
      } else {
        return { success: false, message: response.message || 'Failed to update profile' };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, message: error.message || 'Failed to update profile' };
    }
  };

  const refreshAuthToken = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await ApiService.refreshToken(refreshToken);
      
      if (response.success) {
        await AsyncStorage.setItem('authToken', response.tokens.access_token);
        setAuthToken(response.tokens.access_token);
        return true;
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      await logout(); // Force logout if refresh fails
      return false;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    authToken,
    login,
    loginWithGoogle,
    register,
    verifyEmail,
    logout,
    updateProfile,
    refreshAuthToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};