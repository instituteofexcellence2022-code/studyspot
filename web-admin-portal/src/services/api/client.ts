// ============================================
// API CLIENT SERVICE
// ============================================

import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../../config/environment';
import { HTTP_STATUS, ERROR_MESSAGES } from '../../config/constants';
import { storage } from '../../utils/storage';
import { ApiResponse, ApiError } from '../../types';

/**
 * Create axios instance with default configuration
 */
const createAxiosInstance = () => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return instance;
};

// Create instance
const apiClient = createAxiosInstance();

/**
 * Request interceptor - Add auth token to requests
 */
apiClient.interceptors.request.use(
  (config: any) => {
    // Get token from storage
    const token = storage.getAuthToken();
    
    // Add token to headers if it exists
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add tenant ID header if available
    const user = storage.get('admin_user');
    if (user && (user as any).tenantId && config.headers) {
      config.headers['X-Tenant-ID'] = (user as any).tenantId;
    }

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        params: config.params,
        data: config.data,
      });
    }

    return config;
  },
  (error: any) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle responses and errors
 */
apiClient.interceptors.response.use(
  (response: any) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }

    return response;
  },
  async (error: any) => {
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ API Error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
        data: error.response?.data,
      });
    }

    // Handle specific error cases
    if (error.response) {
      const { status, data } = error.response;

      // Handle 401 Unauthorized - Token expired or invalid
      if (status === HTTP_STATUS.UNAUTHORIZED) {
        // Try to refresh token
        const refreshToken = storage.getRefreshToken();
        
        if (refreshToken && !error.config?.url?.includes('/auth/refresh')) {
          try {
            // Attempt token refresh
            const response = await axios.post(
              `${API_BASE_URL}/api/v1/auth/refresh`,
              { refreshToken }
            );

            const { token: newToken } = (response.data as any).data;
            
            // Save new token
            storage.setAuthToken(newToken);

            // Retry original request with new token
            if (error.config && error.config.headers) {
              error.config.headers.Authorization = `Bearer ${newToken}`;
              return apiClient.request(error.config);
            }
          } catch (refreshError) {
            // Refresh failed - clear auth and redirect to login
            storage.clearAuthData();
            window.location.href = '/login';
            return Promise.reject({
              code: 'AUTH_SESSION_EXPIRED',
              message: ERROR_MESSAGES.SESSION_EXPIRED,
              statusCode: HTTP_STATUS.UNAUTHORIZED,
            } as ApiError);
          }
        } else {
          // No refresh token - redirect to login
          storage.clearAuthData();
          window.location.href = '/login';
        }
      }

      // Handle 403 Forbidden
      if (status === HTTP_STATUS.FORBIDDEN) {
        return Promise.reject({
          code: 'AUTH_FORBIDDEN',
          message: ERROR_MESSAGES.UNAUTHORIZED,
          statusCode: HTTP_STATUS.FORBIDDEN,
        } as ApiError);
      }

      // Handle 404 Not Found
      if (status === HTTP_STATUS.NOT_FOUND) {
        return Promise.reject({
          code: 'RESOURCE_NOT_FOUND',
          message: ERROR_MESSAGES.NOT_FOUND,
          statusCode: HTTP_STATUS.NOT_FOUND,
        } as ApiError);
      }

      // Handle 500 Server Error
      if (status >= HTTP_STATUS.INTERNAL_SERVER_ERROR) {
        return Promise.reject({
          code: 'SERVER_ERROR',
          message: ERROR_MESSAGES.SERVER_ERROR,
          statusCode: status,
          details: data,
        } as ApiError);
      }

      // Handle other errors with API response data
      return Promise.reject({
        code: (data as any)?.error?.code || 'API_ERROR',
        message: (data as any)?.error?.message || ERROR_MESSAGES.GENERIC,
        statusCode: status,
        details: (data as any)?.error?.details,
      } as ApiError);
    }

    // Handle network errors
    if (error.request) {
      return Promise.reject({
        code: 'NETWORK_ERROR',
        message: ERROR_MESSAGES.NETWORK,
        statusCode: 0,
      } as ApiError);
    }

    // Handle other errors
    return Promise.reject({
      code: 'UNKNOWN_ERROR',
      message: error.message || ERROR_MESSAGES.GENERIC,
      statusCode: 0,
    } as ApiError);
  }
);

/**
 * API Client class with methods for making requests
 */
class ApiClient {
  /**
   * GET request
   */
  async get<T = any>(
    url: string,
    params?: Record<string, any>,
    config?: any
  ): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.get<ApiResponse<T>>(url, {
        params,
        ...config,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * POST request
   */
  async post<T = any>(
    url: string,
    data?: any,
    config?: any
  ): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.post<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * PUT request
   */
  async put<T = any>(
    url: string,
    data?: any,
    config?: any
  ): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.put<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    url: string,
    data?: any,
    config?: any
  ): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.patch<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * DELETE request
   */
  async delete<T = any>(
    url: string,
    config?: any
  ): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.delete<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Upload file
   */
  async upload<T = any>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post<ApiResponse<T>>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      } as any);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle and format errors
   */
  private handleError(error: any): ApiError {
    if (error.code && error.message) {
      return error as ApiError;
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || ERROR_MESSAGES.GENERIC,
      statusCode: 0,
    };
  }
}

// Export singleton instance
export const api = new ApiClient();

// Export axios instance for advanced usage
export { apiClient };

// Export class for testing
export default ApiClient;














