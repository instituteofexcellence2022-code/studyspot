/**
 * StudySpot Mobile App - Authentication Service
 * Service for handling authentication API calls
 */

import axios, {AxiosResponse} from 'axios';
import {API_CONFIG} from '@constants/index';
import {ApiResponse, LoginCredentials, RegisterData, User, AuthTokens} from '../types/index';

class AuthService {
  private baseURL = API_CONFIG.BASE_URL;
  private timeout = API_CONFIG.TIMEOUT;

  private async makeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await axios({
        method,
        url: `${this.baseURL}${endpoint}`,
        data,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        timeout: this.timeout,
      });

      return response.data;
    } catch (error: any) {
      if (error.response) {
        // Server responded with error status
        return error.response.data;
      } else if (error.request) {
        // Network error
        throw new Error('Network error. Please check your connection.');
      } else {
        // Other error
        throw new Error(error.message || 'An unexpected error occurred');
      }
    }
  }

  /**
   * Login user (student) - tenantId is REQUIRED for students
   * @param credentials - Login credentials including email, password, and tenantId
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<{user: User; tokens: AuthTokens}>> {
    // Ensure tenantId is included for student login (required for tenant DB query)
    const loginPayload = {
      email: credentials.email,
      password: credentials.password,
      tenantId: credentials.tenantId,      // REQUIRED for students
      userType: 'student',                 // Always 'student' for mobile app
      portalType: 'student',               // Always 'student' for mobile app
    };
    return this.makeRequest('POST', API_CONFIG.ENDPOINTS.AUTH.LOGIN, loginPayload);
  }

  async register(userData: RegisterData): Promise<ApiResponse<{user: User; tokens: AuthTokens}>> {
    return this.makeRequest('POST', API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData);
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<{tokens: AuthTokens}>> {
    return this.makeRequest('POST', API_CONFIG.ENDPOINTS.AUTH.REFRESH, {refreshToken});
  }

  async logout(accessToken: string): Promise<ApiResponse<{message: string}>> {
    return this.makeRequest('POST', API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {}, {
      Authorization: `Bearer ${accessToken}`,
    });
  }

  async forgotPassword(email: string): Promise<ApiResponse<{message: string}>> {
    return this.makeRequest('POST', API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, {email});
  }

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<{message: string}>> {
    return this.makeRequest('POST', API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, {
      token,
      newPassword,
    });
  }

  async verifyOTP(email: string, otp: string, type: 'register' | 'reset'): Promise<ApiResponse<{message: string}>> {
    return this.makeRequest('POST', API_CONFIG.ENDPOINTS.AUTH.VERIFY_OTP, {
      email,
      otp,
      type,
    });
  }
}

export const authService = new AuthService();
export default authService;
