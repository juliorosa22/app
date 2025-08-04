// src/services/api.js - Update existing file
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.timeout = 10000;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  // ============================================================================
  // AUTH ENDPOINTS - Updated for new backend
  // ============================================================================

  async getGoogleAuthUrl(mobileScheme = 'okanassist') {
    /*return this.request(`/auth/google/url?redirect_scheme=${mobileScheme}`, {
      method: 'GET',
    });
    */
   return this.request('/auth/oauth/url', {
    method: 'POST',
    body: JSON.stringify({
      provider: 'google',
      redirect_to: `${mobileScheme}://auth/callback`
    }),
  });
  }

  async loginWithGoogle(googleToken) {
    return this.request('/auth/google/signin', {
      method: 'POST',
      body: JSON.stringify({
        id_token: googleToken
      }),
    });
  }

  async refreshToken(refreshToken) {
    return this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ 
        refresh_token: refreshToken 
      }),
    });
  }

  async logout(token) {
    return this.request('/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async getUserProfile(token) {
    return this.request('/auth/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async updateUserProfile(token, updates) {
    return this.request('/auth/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
  }

  // Keep your existing register/login methods for backward compatibility
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        ...userData,
        platform_type: 'mobile_app',
        device_info: {
          platform: Platform.OS,
          version: Platform.Version,
        }
      }),
    });
  }

  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async verifyEmail(token) {
    return this.request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ verification_token: token }),
    });
  }

  // ============================================================================
  // APP ENDPOINTS - Add new endpoints
  // ============================================================================

  async getTransactions(token, days = 30, transactionType = null) {
    let url = `/api/transactions?days=${days}`;
    if (transactionType) {
      url += `&transaction_type=${transactionType}`;
    }
    
    return this.request(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async createTransaction(token, transactionData) {
    return this.request('/api/transactions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(transactionData),
    });
  }

  async getTransactionSummary(token, days = 30) {
    return this.request(`/api/transactions/summary?days=${days}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async getReminders(token, includeCompleted = false, limit = 50) {
    return this.request(`/api/reminders?include_completed=${includeCompleted}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async createReminder(token, reminderData) {
    return this.request('/api/reminders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(reminderData),
    });
  }

  async getDueReminders(token, hoursAhead = 24) {
    return this.request(`/api/reminders/due?hours_ahead=${hoursAhead}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async completeReminder(token, reminderId) {
    return this.request(`/api/reminders/${reminderId}/complete`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async getReminderSummary(token, days = 30) {
    return this.request(`/api/reminders/summary?days=${days}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async getActivitySummary(token, days = 30) {
    return this.request(`/api/activity/summary?days=${days}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async getCategories() {
    return this.request('/api/categories', {
      method: 'GET',
    });
  }

  async getHealthCheck() {
    return this.request('/api/health', {
      method: 'GET',
    });
  }
}

export default new ApiService();