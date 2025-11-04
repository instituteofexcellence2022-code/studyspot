import api from './api';
import type { LoginRequest, RegisterRequest, LoginResponse, User } from '../types/auth';

class AuthService {
  private readonly TOKEN_KEY = 'studyspot_token';
  private readonly REFRESH_TOKEN_KEY = 'studyspot_refresh_token';
  private readonly USER_KEY = 'studyspot_user';

  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await api.post('/api/auth/login', credentials);
      
      // Handle different response structures
      const data = response.data?.data || response.data;
      
      // Extract tokens
      const tokens = data.tokens || {
        accessToken: data.accessToken || data.token,
        refreshToken: data.refreshToken,
      };
      
      // Extract user
      const user = data.user;
      
      if (!tokens.accessToken || !user) {
        throw new Error('Invalid response from server');
      }

      // Store tokens and user
      this.setTokens(tokens.accessToken, tokens.refreshToken);
      this.setUser(user);

      return {
        user,
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<User> {
    try {
      const response = await api.post('/api/auth/register', data);
      
      // Handle different response structures
      const responseData = response.data?.data || response.data;
      const user = responseData.user || responseData;
      
      return user;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<string> {
    try {
      const refreshToken = this.getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post('/api/auth/refresh', { refreshToken });
      
      const data = response.data?.data || response.data;
      const newAccessToken = data.accessToken || data.token;
      
      if (!newAccessToken) {
        throw new Error('Invalid response from server');
      }

      // Update access token
      this.setToken(newAccessToken);
      
      return newAccessToken;
    } catch (error: any) {
      // If refresh fails, clear all auth data
      this.clearAuth();
      throw this.handleError(error);
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint (best effort - don't throw if fails)
      await api.post('/api/auth/logout').catch(() => {});
    } finally {
      this.clearAuth();
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get('/api/auth/me');
      const data = response.data?.data || response.data;
      const user = data.user || data;
      
      this.setUser(user);
      return user;
    } catch (error) {
      return null;
    }
  }

  /**
   * Token management
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  setTokens(accessToken: string, refreshToken?: string): void {
    this.setToken(accessToken);
    if (refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  /**
   * User management
   */
  getUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  updateUser(updates: Partial<User>): void {
    const currentUser = this.getUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      this.setUser(updatedUser);
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  /**
   * Clear all auth data
   */
  clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): Error {
    console.error('Auth Service Error:', error);

    // Network error
    if (!error.response) {
      return new Error('Network error. Please check your internet connection.');
    }

    // Extract error message
    const message = 
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.response?.data?.errors?.[0]?.msg ||
      error.message ||
      'An unexpected error occurred';

    return new Error(message);
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;

