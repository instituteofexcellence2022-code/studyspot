/**
 * Authentication Service - Aligned with Student Portal's Clean Implementation
 * Simple, reliable auth with fallback mechanisms
 */

import { User as AppUser, UserRole, UserStatus } from '../types';
import { mockAuthService } from './mockAuthService';
import { authClient, tokenStorage, apiClient } from './sdk';
import { STORAGE_KEYS } from '../constants';

const AUTH_SERVICE_BASE = process.env.REACT_APP_AUTH_URL || 'https://studyspot-auth.onrender.com';
const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true' || false;

export interface User extends AppUser {
  // This extends the main User type from types/index.ts
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

class AuthService {
  private readonly USER_KEY = STORAGE_KEYS.USER_DATA;

  async login(email: string, password: string): Promise<AuthResponse> {
    if (USE_MOCK) {
      return await mockAuthService.login(email, password);
    }

    try {
      // Use SDK's authClient.login() - same as student portal
      const response = await authClient.login({ email, password });
      
      console.log('[AuthService] Login response:', {
        hasResponse: !!response,
        hasTokens: !!response?.tokens,
        hasAccessToken: !!response?.tokens?.accessToken,
        hasUser: !!response?.user,
        userKeys: response?.user ? Object.keys(response.user) : [],
      });
      
      // Validate response structure
      if (!response || !response.tokens || !response.tokens.accessToken) {
        console.error('[AuthService] Invalid login response:', response);
        throw new Error('Invalid login response: tokens not found');
      }
      
      if (!response.user) {
        console.error('[AuthService] Invalid login response: user not found');
        throw new Error('Invalid login response: user not found');
      }
      
      const mappedUser = this.mapToUser(response.user);
      this.setUser(mappedUser);
      
      return {
        success: true,
        message: 'Login successful',
        data: {
          user: mappedUser,
          token: response.tokens.accessToken,
        },
      };
    } catch (error: any) {
      console.error('[AuthService] Login error:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        isNetworkError: !error?.response,
      });
      
      // If SDK login fails, try direct API call as fallback
      if (!error?.response || error.response?.status >= 500) {
        try {
          console.log('[AuthService] Trying fallback direct API login...');
          const fallbackResponse = await fetch(`${AUTH_SERVICE_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          if (!fallbackResponse.ok) {
            const fallbackError = await fallbackResponse.json().catch(() => ({}));
            const errorMsg = fallbackError?.error?.message || 'Login failed';
            const errorDetails = fallbackError?.error?.details ? `: ${fallbackError.error.details}` : '';
            throw new Error(`${errorMsg}${errorDetails}`);
          }

          const payload = await fallbackResponse.json();
          const result = payload.data || payload;

          if (result.tokens && result.user && result.tokens.accessToken) {
            tokenStorage.write({
              accessToken: result.tokens.accessToken,
              refreshToken: result.tokens.refreshToken,
              expiresAt: result.tokens.expiresAt,
              tenantId: result.user.tenantId,
            });
            
            const mappedUser = this.mapToUser(result.user);
            this.setUser(mappedUser);
            
            return {
              success: true,
              message: 'Login successful',
              data: {
                user: mappedUser,
                token: result.tokens.accessToken,
              },
            };
          }

          throw new Error('Invalid response format from login endpoint');
        } catch (fallbackError: any) {
          throw this.handleError(fallbackError);
        }
      }

      throw this.handleError(error);
    }
  }

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName?: string;
    phone?: string;
    role?: string;
  }): Promise<AuthResponse> {
    if (USE_MOCK) {
      return await mockAuthService.registerDetailed({
        ...data,
        lastName: data.lastName || '',
      });
    }

    try {
      // Use apiClient directly - same as student portal
      const response = await apiClient.post('/api/auth/register', {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone,
        role: data.role || 'library_owner',
      });

      // Student portal approach: response.data?.data || response.data
      const payload = response.data?.data || response.data;
      
      // Backend returns tokens + user on successful registration
      if (payload.tokens && payload.user && payload.tokens.accessToken) {
        // Store tokens using SDK
        tokenStorage.write({
          accessToken: payload.tokens.accessToken,
          refreshToken: payload.tokens.refreshToken,
          expiresAt: payload.tokens.expiresAt,
          tenantId: payload.user.tenantId,
        });
        
        const user = this.mapToUser(payload.user);
        this.setUser(user);
        
        return {
          success: true,
          message: 'Registration successful',
          data: {
            user,
            token: payload.tokens.accessToken,
          },
        };
      }
      
      // Fallback: If no tokens returned, auto-login the user
      return await this.login(data.email, data.password);
    } catch (error: any) {
      // If API gateway is unreachable or returns 5xx, try auth service directly
      if (!error?.response || error.response?.status >= 500) {
        try {
          const fallbackResponse = await fetch(`${AUTH_SERVICE_BASE}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
              password: data.password,
              phone: data.phone,
              role: data.role || 'library_owner',
            }),
          });

          if (!fallbackResponse.ok) {
            const fallbackError = await fallbackResponse.json().catch(() => ({}));
            const errorMsg = fallbackError?.error?.message || 'Registration failed';
            const errorDetails = fallbackError?.error?.details ? `: ${fallbackError.error.details}` : '';
            throw new Error(`${errorMsg}${errorDetails}`);
          }

          const payload = await fallbackResponse.json();
          const result = payload.data || payload;

          if (result.tokens && result.user && result.tokens.accessToken) {
            tokenStorage.write({
              accessToken: result.tokens.accessToken,
              refreshToken: result.tokens.refreshToken,
              expiresAt: result.tokens.expiresAt,
              tenantId: result.user.tenantId,
            });
            
            const user = this.mapToUser(result.user);
            this.setUser(user);
            
            return {
              success: true,
              message: 'Registration successful',
              data: {
                user,
                token: result.tokens.accessToken,
              },
            };
          }

          return await this.login(data.email, data.password);
        } catch (fallbackError: any) {
          throw this.handleError(fallbackError);
        }
      }

      throw this.handleError(error);
    }
  }

  async refreshToken(): Promise<string> {
    try {
      const tokens = await authClient.refresh();
      if (!tokens?.accessToken) {
        throw new Error('No access token returned');
      }
      return tokens.accessToken;
    } catch (error: any) {
      this.clearAuth();
      throw this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await authClient.logout();
    } finally {
      this.clearAuth();
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiClient.get('/api/auth/me');
      const data = response.data?.data || response.data;
      const user = data.user || data;
      if (user) {
        const mappedUser = this.mapToUser(user);
        this.setUser(mappedUser);
        return mappedUser;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  getToken(): string | null {
    return tokenStorage.read()?.accessToken ?? null;
  }

  getRefreshToken(): string | null {
    return tokenStorage.read()?.refreshToken ?? null;
  }

  setToken(token: string): void {
    const snapshot = tokenStorage.read() ?? {};
    tokenStorage.write({ ...snapshot, accessToken: token });
  }

  setTokens(accessToken: string, refreshToken?: string): void {
    const snapshot = tokenStorage.read() ?? {};
    tokenStorage.write({
      ...snapshot,
      accessToken,
      refreshToken: refreshToken ?? snapshot.refreshToken,
    });
  }

  getUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  setUser(user: any): void {
    const mappedUser = this.mapToUser(user);
    localStorage.setItem(this.USER_KEY, JSON.stringify(mappedUser));
  }

  updateUser(updates: Partial<User>): void {
    const currentUser = this.getUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      this.setUser(updatedUser);
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    return Boolean(token && user);
  }

  clearAuth(): void {
    tokenStorage.clear();
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Map backend user format to our User type
   */
  private mapToUser(userData: any): User {
    // Handle SDK format (roles array) vs backend format (single role)
    const userRole = userData.role || 
                    (Array.isArray(userData.roles) && userData.roles.length > 0 
                      ? userData.roles[0] 
                      : 'library_owner');
    
    return {
      id: userData.id,
      email: userData.email,
      firstName: userData.firstName || userData.first_name || 'User',
      lastName: userData.lastName || userData.last_name || '',
      role: userRole as UserRole,
      tenantId: userData.tenantId || userData.tenant_id || 'default',
      status: (userData.status || 'active') as UserStatus,
      createdAt: userData.createdAt || userData.created_at || new Date().toISOString(),
      updatedAt: userData.updatedAt || userData.updated_at || new Date().toISOString(),
      phone: userData.phone || userData.phone_number || undefined,
    };
  }

  /**
   * Handle errors consistently - same as student portal
   */
  private handleError(error: any): Error {
    if (error instanceof Error) {
      return error;
    }

    if (!error?.response) {
      return new Error('Network error. Please check your internet connection.');
    }

    // Extract error message from nested error object or direct message
    const errorObj = error.response?.data?.error;
    const message = 
      errorObj?.message ||
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.response?.data?.errors?.[0]?.msg ||
      error.message ||
      'An unexpected error occurred';
    
    // Append details if available
    const details = errorObj?.details;
    const fullMessage = details ? `${message}: ${details}` : message;

    return new Error(fullMessage);
  }
}

export const authService = new AuthService();
