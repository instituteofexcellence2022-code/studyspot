// ============================================
// AUTHENTICATION SERVICE
// ============================================

import { api } from './client';
import { API_ENDPOINTS } from '../../config/constants';
import { LoginCredentials, LoginResponse, User, ApiResponse } from '../../types';
import { storage } from '../../utils/storage';

// MOCK MODE - Set to true to use mock data instead of real API
const MOCK_MODE = true;

// Mock user data
const MOCK_USER: User = {
  id: '1',
  email: 'admin@studyspot.com',
  name: 'Admin User',
  role: 'admin',
  tenantId: null, // Super admin
  avatarUrl: '',
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const MOCK_TOKEN = 'mock-jwt-token-' + Date.now();

/**
 * Authentication Service
 */
class AuthService {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      // MOCK MODE - Skip API call
      if (MOCK_MODE) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock validation
        if (!credentials.email || !credentials.password) {
          return {
            success: false,
            data: undefined as any,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Email and password are required',
            },
          };
        }
        
        // Store mock tokens
        storage.setAuthToken(MOCK_TOKEN);
        storage.setRefreshToken('mock-refresh-token');
        storage.set('admin_user', MOCK_USER);

        return {
          success: true,
          data: {
            user: MOCK_USER,
            token: MOCK_TOKEN,
            refreshToken: 'mock-refresh-token',
          },
        };
      }

      const response = await api.post<{
        user: User;
        token: string;
        refreshToken: string;
      }>(API_ENDPOINTS.LOGIN, credentials);

      if (response.success && response.data) {
        // Store tokens
        storage.setAuthToken(response.data.token);
        storage.setRefreshToken(response.data.refreshToken);
        
        // Store user data
        storage.set('admin_user', response.data.user);

        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        data: undefined as any,
        error: response.error,
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined as any,
        error: {
          code: error.code || 'AUTH_ERROR',
          message: error.message || 'Login failed',
        },
      };
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse> {
    try {
      // Call logout endpoint
      await api.post(API_ENDPOINTS.LOGOUT);
      
      // Clear local storage
      storage.clearAuthData();

      return {
        success: true,
      };
    } catch (error: any) {
      // Clear local storage even if API call fails
      storage.clearAuthData();
      
      return {
        success: true, // Always return success for logout
      };
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    try {
      const refreshToken = storage.getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post<{ token: string }>(
        API_ENDPOINTS.REFRESH_TOKEN,
        { refreshToken }
      );

      if (response.success && response.data) {
        // Store new token
        storage.setAuthToken(response.data.token);
      }

      return response;
    } catch (error: any) {
      // Clear auth data if refresh fails
      storage.clearAuthData();
      
      throw error;
    }
  }

  /**
   * Forgot password - Send reset email
   */
  async forgotPassword(email: string): Promise<ApiResponse> {
    try {
      const response = await api.post(API_ENDPOINTS.FORGOT_PASSWORD, { email });
      return response;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string): Promise<ApiResponse> {
    try {
      const response = await api.post(API_ENDPOINTS.RESET_PASSWORD, {
        token,
        newPassword,
      });
      return response;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<ApiResponse> {
    try {
      const response = await api.post(API_ENDPOINTS.VERIFY_EMAIL, { token });
      return response;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      // MOCK MODE - Return mock user
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 200));
        const storedUser = storage.get<User>('admin_user') || MOCK_USER;
        return {
          success: true,
          data: storedUser,
        };
      }

      const response = await api.get<User>(API_ENDPOINTS.USER_PROFILE);
      
      if (response.success && response.data) {
        // Update stored user data
        storage.set('admin_user', response.data);
      }

      return response;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Update current user profile
   */
  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await api.patch<User>(API_ENDPOINTS.USER_PROFILE, data);
      
      if (response.success && response.data) {
        // Update stored user data
        storage.set('admin_user', response.data);
      }

      return response;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Change password
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse> {
    try {
      const response = await api.post('/api/v1/auth/change-password', {
        currentPassword,
        newPassword,
      });
      return response;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = storage.getAuthToken();
    const user = storage.get('admin_user');
    return !!(token && user);
  }

  /**
   * Get current user from storage
   */
  getCurrentUserFromStorage(): User | null {
    return storage.get<User>('admin_user');
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string | string[]): boolean {
    const user = this.getCurrentUserFromStorage();
    if (!user) return false;

    if (Array.isArray(role)) {
      return role.includes(user.role);
    }

    return user.role === role;
  }

  /**
   * Check if user is super admin
   */
  isSuperAdmin(): boolean {
    return this.hasRole('super_admin');
  }
}

// Export singleton instance
export const authService = new AuthService();

// Export class for testing
export default AuthService;














