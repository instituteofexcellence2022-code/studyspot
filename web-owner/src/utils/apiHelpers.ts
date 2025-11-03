/**
 * API Helper Utilities
 * 
 * Provides common utilities for API requests
 */

import apiClient from '../services/apiClient';
import { handleApiError } from './errorHandler';
import { ApiResponse, PaginatedResponse } from '../types/api';
import Logger from './logger';

// Use any for axios types to avoid version conflicts
type AxiosRequestConfig = any;
type AxiosResponse<T = any> = any;

/**
 * Generic request wrapper
 */
export async function makeRequest<T = any>(
  requestFn: () => Promise<AxiosResponse<ApiResponse<T>>>,
  options?: {
    showError?: boolean;
    transformResponse?: (data: any) => T;
  }
): Promise<T> {
  try {
    const response = await requestFn();
    const data = response.data.data;
    
    if (options?.transformResponse) {
      return options.transformResponse(data);
    }
    
    return data;
  } catch (error) {
    const errorResponse = handleApiError(error);
    
    if (options?.showError !== false) {
      Logger.error('API Request Error', error);
    }
    
    throw errorResponse;
  }
}

/**
 * Make GET request
 */
export async function makeGetRequest<T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  return makeRequest<T>(() => apiClient.get<ApiResponse<T>>(url, config) as any);
}

/**
 * Make POST request
 */
export async function makePostRequest<T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> {
  return makeRequest<T>(() => apiClient.post<ApiResponse<T>>(url, data, config) as any);
}

/**
 * Make PUT request
 */
export async function makePutRequest<T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> {
  return makeRequest<T>(() => apiClient.put<ApiResponse<T>>(url, data, config) as any);
}

/**
 * Make PATCH request
 */
export async function makePatchRequest<T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> {
  return makeRequest<T>(() => apiClient.patch<ApiResponse<T>>(url, data, config) as any);
}

/**
 * Make DELETE request
 */
export async function makeDeleteRequest<T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  return makeRequest<T>(() => apiClient.delete<ApiResponse<T>>(url, config) as any);
}

/**
 * Make paginated GET request
 */
export async function makePaginatedRequest<T = any>(
  url: string,
  params?: Record<string, any>,
  config?: AxiosRequestConfig
): Promise<PaginatedResponse<T>> {
  try {
    const response = await apiClient.get<PaginatedResponse<T>>(url, {
      ...config,
      params,
    });
    return response.data;
  } catch (error) {
    const errorResponse = handleApiError(error);
    throw errorResponse;
  }
}

/**
 * Build query string from params
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, String(v)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  
  return searchParams.toString();
}

/**
 * Handle response
 */
export function handleResponse<T>(response: AxiosResponse<ApiResponse<T>>): T {
  if (response.data.success) {
    return response.data.data;
  }
  
  throw new Error(response.data.message || 'Request failed');
}

/**
 * Create request config with auth
 */
export function createAuthConfig(config?: AxiosRequestConfig): AxiosRequestConfig {
  return {
    ...config,
    headers: {
      ...config?.headers,
    },
  };
}