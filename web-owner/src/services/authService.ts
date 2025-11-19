/**
 * Simple Authentication Service
 * Clean, simple auth without complex JWT handling
 * Auto-switches to mock mode when backend is unavailable
 */

import { User as AppUser, UserRole, UserStatus } from '../types';
import { mockAuthService } from './mockAuthService';
import { authClient, tokenStorage, apiClient } from './sdk';
import { STORAGE_KEYS } from '../constants';
import { apiService } from './api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
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
  private token: string | null = tokenStorage.read()?.accessToken ?? null;
  private user: User | null = this.getStoredUser();
  private readonly useMock = USE_MOCK;

  private persistAuthResponse(response: {
    user: any;
    tokens: { accessToken: string; refreshToken?: string; expiresAt?: number | null };
  }) {
    this.token = response.tokens.accessToken;
    
    // Handle SDK format (roles array) vs backend format (single role)
    const userRole = response.user.role || 
                    (Array.isArray(response.user.roles) && response.user.roles.length > 0 
                      ? response.user.roles[0] 
                      : 'library_owner');
    
    this.user = {
      id: response.user.id,
      email: response.user.email,
      firstName: response.user.firstName || response.user.first_name || 'User',
      lastName: response.user.lastName || response.user.last_name || '',
      role: userRole as UserRole,
      tenantId: response.user.tenantId || response.user.tenant_id || 'default',
      status: (response.user.status || 'active') as UserStatus,
      createdAt: response.user.createdAt || response.user.created_at || new Date().toISOString(),
      updatedAt: response.user.updatedAt || response.user.updated_at || new Date().toISOString(),
      phone: response.user.phone || response.user.phone_number || undefined,
    };

    tokenStorage.write({
      accessToken: response.tokens.accessToken,
      refreshToken: response.tokens.refreshToken,
      expiresAt: response.tokens.expiresAt ?? undefined,
      tenantId: response.user.tenantId,
    });

    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(this.user));
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    if (this.useMock) {
      return await mockAuthService.login(email, password);
    }

    try {
      // SDK's authClient.login() returns { user, tokens } directly
      const response = await authClient.login({ email, password });
      
      // SDK returns LoginResponse with user and tokens at root level
      if (response?.user && response?.tokens) {
        // Convert SDK format to our internal format for persistence
        this.persistAuthResponse({
          user: response.user as any,
          tokens: {
            accessToken: response.tokens.accessToken,
            refreshToken: response.tokens.refreshToken,
            expiresAt: response.tokens.expiresAt,
          },
        });
        
        return {
          success: true,
          message: 'Login successful',
          data: {
            user: this.user!,
            token: response.tokens.accessToken,
          },
        };
      }
      
      throw new Error('Invalid response format from login endpoint');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Extract error message
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error?.message ||
                          error?.message || 
                          error?.error ||
                          'Login failed. Please check your credentials.';
      
      throw new Error(errorMessage);
    }
  }

  async register(email: string, password: string, name: string, role?: string): Promise<AuthResponse> {
    if (this.useMock) {
      return await mockAuthService.register(email, password, name, role);
    }

    // Split name into first and last name
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Call actual registration endpoint
    const response = await apiService.post<any>('/api/auth/register', {
      firstName,
      lastName,
      email,
      password,
      role: role || 'library_owner',
    });

    const authData = response?.data || response;
    this.persistAuthResponse(authData);
    
    return {
      success: true,
      message: 'Registration successful',
      data: {
        user: this.user!,
        token: authData.tokens.accessToken,
      },
    };
  }

  async registerDetailed(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: string;
  }): Promise<AuthResponse> {
    if (this.useMock) {
      return await mockAuthService.registerDetailed(userData);
    }

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const requestPayload = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
        role: userData.role || 'library_owner',
      };

      console.log('[AuthService] ===== REGISTRATION START =====');
      console.log('[AuthService] Request payload:', { ...requestPayload, password: '***' });
      console.log('[AuthService] API URL:', apiUrl);
      console.log('[AuthService] Endpoint:', `${apiUrl}/api/auth/register`);

      // Use direct apiClient call like student portal does (simpler and more reliable)
      let response: any;
      try {
        // Use apiClient directly instead of apiService to match student portal approach
        response = await apiClient.post('/api/auth/register', requestPayload);
        console.log('[AuthService] ✅ API call successful');
        console.log('[AuthService] Response status:', response.status);
        console.log('[AuthService] Response data:', JSON.stringify(response.data, null, 2));
      } catch (apiError: any) {
        console.error('[AuthService] ❌ API call failed:', {
          message: apiError?.message,
          code: apiError?.code,
          status: apiError?.response?.status,
          statusText: apiError?.response?.statusText,
          responseData: apiError?.response?.data,
          isNetworkError: !apiError?.response,
        });
        throw apiError;
      }

      // apiClient.post returns axios response, so response.data is the actual response
      // Backend returns: { success: true, data: { user, token, tokens: { accessToken, refreshToken, expiresAt } }, message }
      const backendResponse = response.data;
      
      console.log('[AuthService] Backend response structure:', {
        hasResponse: !!backendResponse,
        responseKeys: backendResponse ? Object.keys(backendResponse) : [],
        hasSuccess: !!backendResponse?.success,
        successValue: backendResponse?.success,
        hasData: !!backendResponse?.data,
        dataKeys: backendResponse?.data ? Object.keys(backendResponse.data) : [],
        hasUser: !!backendResponse?.data?.user,
        hasToken: !!backendResponse?.data?.token,
        hasTokens: !!backendResponse?.data?.tokens,
      });

      // Check if response has success flag
      if (backendResponse?.success !== true) {
        const errorMsg = backendResponse?.error?.message || 
                        backendResponse?.message || 
                        'Registration failed';
        console.error('[AuthService] ❌ Registration failed:', errorMsg);
        throw new Error(errorMsg);
      }

      // Extract data from response.data (backend wraps in { success: true, data: {...} })
      const payload = backendResponse.data;
      
      if (!payload) {
        console.error('[AuthService] ❌ No data in response');
        throw new Error('Invalid response: Missing data field');
      }

      // Extract user and tokens
      const user = payload.user;
      if (!user) {
        console.error('[AuthService] ❌ User not found in payload');
        throw new Error('Invalid response: Missing user data');
      }

      // Get tokens (prefer tokens object, fallback to token string)
      let accessToken: string;
      let refreshToken: string | undefined;
      let expiresAt: number | undefined;

      if (payload.tokens) {
        accessToken = payload.tokens.accessToken || payload.tokens.token || payload.token;
        refreshToken = payload.tokens.refreshToken;
        expiresAt = payload.tokens.expiresAt;
      } else if (payload.token) {
        accessToken = payload.token;
        refreshToken = payload.refreshToken;
        expiresAt = payload.expiresAt;
      } else {
        console.error('[AuthService] ❌ No token or tokens found in payload');
        throw new Error('Invalid response: Missing token or tokens');
      }

      if (!accessToken) {
        console.error('[AuthService] ❌ Access token is empty');
        throw new Error('Invalid response: Access token is missing or empty');
      }

      console.log('[AuthService] ✅ All required data extracted successfully');

      // Persist auth response
      try {
        this.persistAuthResponse({
          user,
          tokens: {
            accessToken,
            refreshToken,
            expiresAt,
          },
        });
        console.log('[AuthService] ✅ Auth response persisted');
      } catch (persistError: any) {
        console.error('[AuthService] ❌ Failed to persist auth response:', persistError);
        throw new Error('Failed to save authentication data: ' + persistError.message);
      }

      // Return success response (match expected format)
      const result = {
        success: true,
        message: payload?.message || 'Registration successful',
        data: {
          user: this.user!,
          token: accessToken,
        },
      };

      console.log('[AuthService] ✅ Registration completed successfully');
      console.log('[AuthService] ===== REGISTRATION END =====');
      
      return result;
    } catch (error: any) {
      console.error('[AuthService] Registration error:', error);
      console.error('[AuthService] Error details:', {
        message: error?.message,
        code: error?.code,
        response: error?.response?.data,
        status: error?.response?.status,
        isNetworkError: !error?.response,
        isTimeout: error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT',
        isConnectionRefused: error?.code === 'ECONNREFUSED',
      });
      
      // Handle network errors
      if (!error?.response) {
        if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
          throw new Error('Request timeout. The server is taking too long to respond. Please check your connection and try again.');
        }
        if (error?.code === 'ECONNREFUSED') {
          throw new Error('Cannot connect to server. Please ensure the backend is running and the API URL is correct.');
        }
        if (error?.message?.includes('Network Error') || error?.message?.includes('network')) {
          throw new Error('Network error. Unable to reach the server. Please check your internet connection and try again.');
        }
        throw new Error('Unable to connect to the server. Please check your connection and try again.');
      }
      
      // Handle HTTP errors
      const status = error?.response?.status;
      if (status === 400) {
        const errorMessage = error?.response?.data?.error?.message || 
                           error?.response?.data?.message || 
                           'Invalid registration data. Please check your input.';
        throw new Error(errorMessage);
      }
      if (status === 401) {
        throw new Error('Authentication failed. Please try again.');
      }
      if (status === 403) {
        throw new Error('Registration is not allowed. Please contact support.');
      }
      if (status === 409) {
        throw new Error('An account with this email already exists. Please use a different email or try logging in.');
      }
      if (status >= 500) {
        throw new Error('Server error. Please try again later or contact support if the problem persists.');
      }
      
      // Extract error message from response
      const errorMessage = error?.response?.data?.error?.message || 
                          error?.response?.data?.message || 
                          error?.message || 
                          error?.error ||
                          'Registration failed. Please try again.';
      
      throw new Error(errorMessage);
    }
  }

  async logout(): Promise<void> {
    try {
      await authClient.logout();
    } finally {
      this.token = null;
      this.user = null;
      tokenStorage.clear();
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    }
  }

  async getProfile(): Promise<User | null> {
    if (this.useMock) {
      return mockAuthService.getCurrentUser();
    }

    try {
      const response = await apiService.get<any>('/api/auth/profile');
      const payload = response?.user ?? response;
      if (!payload) {
        return null;
      }
      this.user = {
        id: payload.id,
        email: payload.email,
        firstName: payload.firstName || payload.first_name,
        lastName: payload.lastName || payload.last_name,
        role: payload.role,
        tenantId: payload.tenantId || payload.tenant_id,
        status: payload.status || 'active',
        createdAt: payload.createdAt,
        updatedAt: payload.updatedAt,
        phone: payload.phone,
      };
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(this.user));
      return this.user;
    } catch (error) {
      return null;
    }
  }

  getCurrentUser(): User | null {
    if (this.useMock) {
      return mockAuthService.getCurrentUser();
    }
    return this.user;
  }

  isAuthenticated(): boolean {
    if (this.useMock) {
      return mockAuthService.isAuthenticated();
    }
    return Boolean(tokenStorage.read()?.accessToken);
  }

  getToken(): string | null {
    if (this.useMock) {
      return mockAuthService.getToken();
    }
    return tokenStorage.read()?.accessToken ?? null;
  }

  /**
   * Get stored user from localStorage
   */
  private getStoredUser(): User | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  }
}

export const authService = new AuthService();