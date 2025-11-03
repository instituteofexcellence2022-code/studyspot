/**
 * API Client
 * Centralized axios instance for API calls
 */

import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { API_CONFIG } from '../config/environment';

// Create axios instance with proper typing
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * JWT Token Payload Interface
 */
interface JWTPayload {
  exp?: number;
  iat?: number;
  sub?: string;
  [key: string]: any;
}

/**
 * Validate JWT token format and decode it
 * @param token - Token string to validate
 * @returns JWTPayload | null - Decoded payload or null if invalid
 */
const decodeToken = (token: string): JWTPayload | null => {
  try {
    // JWT tokens have 3 parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // Decode using jwt-decode library (handles base64 encoding properly)
    const decoded = jwtDecode<JWTPayload>(token);
    return decoded;
  } catch (error) {
    console.error('Failed to decode JWT token:', error);
    return null;
  }
};

/**
 * Check if token is expired
 * @param token - JWT token
 * @returns boolean - True if token is expired
 */
const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    
    // Add 60 second buffer to account for clock skew
    const expirationTime = decoded.exp * 1000;
    const now = Date.now();
    const bufferTime = 60 * 1000; // 60 seconds
    
    return now >= (expirationTime - bufferTime);
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

/**
 * Validate JWT token format
 * @param token - Token string to validate
 * @returns boolean - True if token format is valid
 */
const isValidJWTFormat = (token: string): boolean => {
  const decoded = decodeToken(token);
  return decoded !== null;
};

// Request interceptor - add auth token and start timing
apiClient.interceptors.request.use(
  (config: any) => {
    // mark request start time
    (config as any).metadata = { startTime: Date.now() };
    // Try multiple storage keys for compatibility
    let token = localStorage.getItem('token') || 
                localStorage.getItem('studyspot_auth_token');
    
    if (token) {
      // Validate token format
      if (!isValidJWTFormat(token)) {
        console.error('❌ Invalid token format detected');
        localStorage.removeItem('token');
        localStorage.removeItem('studyspot_auth_token');
        localStorage.removeItem('studyspot_refresh_token');
        localStorage.removeItem('studyspot_user_data');
        token = null;
      }
      
      // Check if token is expired (basic client-side check)
      if (token && isTokenExpired(token)) {
        console.warn('⚠️ Token appears to be expired');
        // Don't remove token here - let the server decide
        // The 401 handler will deal with it
      }
      
      // Add token to request headers
      if (token && config.headers) {
        (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors and log slow requests
apiClient.interceptors.response.use(
  (response: any) => {
    try {
      const start = (response.config as any).metadata?.startTime;
      if (start) {
        const durationMs = Date.now() - start;
        if (durationMs > 1000) {
          console.warn(`⏱️ Slow API response (${durationMs}ms):`, response.config.method?.toUpperCase(), response.config.url);
        }
      }
    } catch {}
    return response;
  },
  (error: any) => {
    try {
      const start = (error.config as any)?.metadata?.startTime;
      if (start) {
        const durationMs = Date.now() - start;
        if (durationMs > 1000) {
          console.warn(`⏱️ Slow API error (${durationMs}ms):`, error.config?.method?.toUpperCase(), error.config?.url);
        }
      }
    } catch {}
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      // Clear authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('studyspot_auth_token');
      localStorage.removeItem('studyspot_refresh_token');
      localStorage.removeItem('studyspot_user_data');
      
      // Only redirect if we're not already on the login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
    
    // Handle network errors
    if (error.code === 'ECONNREFUSED' || error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      console.error('❌ Network Error: API server is not available');
      
      // Only return mock data in development mode
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Development mode: Returning mock data');
        return Promise.resolve({
          data: {
            success: true,
            message: 'Development mode - API server not available',
            data: {}
          }
        });
      }
      
      // In production, reject the error properly
      return Promise.reject({
        message: 'Network error: Unable to connect to server. Please check your internet connection.',
        code: 'NETWORK_ERROR',
        originalError: error
      });
    }
    
    // Handle timeout errors
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.error('❌ Request Timeout: API took too long to respond');
      return Promise.reject({
        message: 'Request timeout: The server took too long to respond. Please try again.',
        code: 'TIMEOUT',
        originalError: error
      });
    }
    
    // Handle 403 Forbidden
    if (error.response && error.response.status === 403) {
      console.error('❌ Access Forbidden: You do not have permission for this action');
      return Promise.reject({
        message: 'Access forbidden: You do not have permission to perform this action.',
        code: 'FORBIDDEN',
        originalError: error
      });
    }
    
    // Handle 404 Not Found
    if (error.response && error.response.status === 404) {
      console.error('❌ Resource Not Found');
      return Promise.reject({
        message: 'Resource not found: The requested data could not be found.',
        code: 'NOT_FOUND',
        originalError: error
      });
    }
    
    // Handle 500 Internal Server Error
    if (error.response && error.response.status === 500) {
      console.error('❌ Internal Server Error');
      return Promise.reject({
        message: 'Internal server error: Something went wrong on the server. Please try again later.',
        code: 'SERVER_ERROR',
        originalError: error
      });
    }
    
    // Handle other errors
    const errorData = error.response?.data as any;
    return Promise.reject({
      message: errorData?.message || error.message || 'An unexpected error occurred',
      code: error.response?.status || 'UNKNOWN_ERROR',
      originalError: error
    });
  }
);

export default apiClient;

    
    // Handle other errors
    const errorData = error.response?.data as any;
    return Promise.reject({
      message: errorData?.message || error.message || 'An unexpected error occurred',
      code: error.response?.status || 'UNKNOWN_ERROR',
      originalError: error
    });
  }
);

export default apiClient;


