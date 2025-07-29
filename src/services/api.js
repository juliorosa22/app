// app/src/services/api.js
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:8000/api'  // Development
  : 'https://your-production-api.com/api';  // Production

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.timeout = 10000; // 10 seconds
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
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  // Auth endpoints
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

  async loginWithGoogle(googleToken) {
    return this.request('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ 
        google_token: googleToken,
        platform_type: 'mobile_app'
      }),
    });
  }

  async refreshToken(refreshToken) {
    return this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
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

  async verifyEmail(token) {
    return this.request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ verification_token: token }),
    });
  }

  // User profile endpoints
  async getUserProfile(token) {
    return this.request('/user/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async updateUserProfile(token, updates) {
    return this.request('/user/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
  }
}

export default new ApiService();