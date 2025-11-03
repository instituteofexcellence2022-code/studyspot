/**
 * API Client
 * Centralized axios instance for API calls with proper TypeScript support
 */

import axios from 'axios';
import { API_CONFIG } from '../constants';
import SecureStorage from '../utils/secureStorage';
import Logger from '../utils/logger';

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic API response interface
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

// Create axios instance with proper typing
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config: any) => {
    const token = SecureStorage.getTokenForAPI();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log API requests in development
    if (process.env.NODE_ENV === 'development') {
      Logger.apiCall(config.method?.toUpperCase() || 'UNKNOWN', config.url || '');
    }
    
    return config;
  },
  (error: any) => {
    Logger.error('API Request Error', error);
    return Promise.reject(new ApiError('Request failed', undefined, error));
  }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response: any) => {
    // Log successful API responses in development
    if (process.env.NODE_ENV === 'development') {
      Logger.apiCall(
        response.config.method?.toUpperCase() || 'UNKNOWN',
        response.config.url || '',
        response.status
      );
    }
    return response;
  },
  (error: any) => {
    const status = error.response?.status;
    const url = error.config?.url || 'unknown';
    
    // Log API errors
    Logger.error('API Response Error', error);
    
    if (status === 401) {
      // Token expired or invalid - clear secure storage
      Logger.warn('Authentication failed, clearing secure storage');
      SecureStorage.clearAll();
      window.location.href = '/login';
    }
    
    const apiError = new ApiError(
      error.response?.data?.message || error.message || 'API request failed',
      status,
      error
    );
    
    return Promise.reject(apiError);
  }
);

export default apiClient;

