import { apiClient } from './sdk';

export const apiService = {
  get: async <T = unknown>(url: string, config?: any): Promise<T> => {
    try {
      const response = await apiClient.get(url, config);
      return response.data?.data ?? response.data;
    } catch (error: any) {
      // Re-throw with enhanced error information
      console.error('[apiService.get] Error:', {
        url,
        message: error?.message,
        code: error?.code,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      throw error;
    }
  },
  post: async <T = unknown>(url: string, data?: any, config?: any): Promise<T> => {
    const baseURL = apiClient.defaults?.baseURL || 'http://localhost:3001';
    const fullUrl = `${baseURL}${url}`;
    
    try {
      console.log('[apiService.post] ===== REQUEST START =====');
      console.log('[apiService.post] URL:', url);
      console.log('[apiService.post] Full URL:', fullUrl);
      console.log('[apiService.post] Base URL:', baseURL);
      console.log('[apiService.post] Request data:', data ? { ...data, password: data.password ? '***' : undefined } : 'none');
      console.log('[apiService.post] Config:', config);
      
      const startTime = Date.now();
      const response = await apiClient.post(url, data, config);
      const duration = Date.now() - startTime;
      
      console.log('[apiService.post] ===== RESPONSE RECEIVED =====');
      console.log('[apiService.post] Status:', response.status);
      console.log('[apiService.post] Status Text:', response.statusText);
      console.log('[apiService.post] Duration:', `${duration}ms`);
      console.log('[apiService.post] Response headers:', response.headers);
      console.log('[apiService.post] Response data type:', typeof response.data);
      console.log('[apiService.post] Response data:', JSON.stringify(response.data, null, 2));
      console.log('[apiService.post] Response data keys:', response.data ? Object.keys(response.data) : []);
      
      // Return full response data (don't unwrap - let the service handle it)
      // Backend returns: { success: true, data: {...}, message: '...' }
      // We need to preserve the success and message fields
      const result = response.data as T;
      console.log('[apiService.post] Returning result:', result);
      console.log('[apiService.post] ===== REQUEST END =====');
      return result;
    } catch (error: any) {
      // Re-throw with enhanced error information
      console.error('[apiService.post] ===== ERROR OCCURRED =====');
      console.error('[apiService.post] Error type:', error?.constructor?.name);
      console.error('[apiService.post] Error message:', error?.message);
      console.error('[apiService.post] Error code:', error?.code);
      console.error('[apiService.post] Full URL attempted:', fullUrl);
      console.error('[apiService.post] Has response:', !!error?.response);
      console.error('[apiService.post] Response status:', error?.response?.status);
      console.error('[apiService.post] Response status text:', error?.response?.statusText);
      console.error('[apiService.post] Response data:', error?.response?.data);
      console.error('[apiService.post] Response headers:', error?.response?.headers);
      console.error('[apiService.post] Is network error:', !error?.response);
      console.error('[apiService.post] Is timeout:', error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT');
      console.error('[apiService.post] Is connection refused:', error?.code === 'ECONNREFUSED');
      console.error('[apiService.post] Request config:', error?.config);
      console.error('[apiService.post] Full error object:', error);
      console.error('[apiService.post] ===== ERROR END =====');
      
      // Enhance error message for better debugging
      if (!error?.response) {
        // Network error - no response from server
        if (error?.code === 'ECONNREFUSED') {
          error.message = `Cannot connect to ${baseURL}. The server may be down or the URL is incorrect.`;
        } else if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
          error.message = `Request to ${baseURL} timed out. The server may be slow or unresponsive.`;
        } else if (error?.message?.includes('Network Error') || error?.message?.includes('Failed to fetch')) {
          error.message = `Network error: Cannot reach ${baseURL}. Check CORS configuration and ensure the server is running.`;
        }
      } else {
        // HTTP error - server responded with error
        const status = error.response.status;
        const errorData = error.response.data;
        const errorMsg = errorData?.error?.message || errorData?.message || error.message;
        
        if (status === 503) {
          error.message = `Service unavailable: ${errorMsg || 'The backend service is temporarily unavailable'}`;
        } else if (status === 404) {
          error.message = `Endpoint not found: ${fullUrl}. Check if the API route exists.`;
        } else if (status === 500) {
          error.message = `Server error: ${errorMsg || 'An internal server error occurred'}`;
        } else {
          error.message = errorMsg || `HTTP ${status}: ${error.response.statusText}`;
        }
      }
      
      throw error;
    }
  },
  put: async <T = unknown>(url: string, data?: any, config?: any): Promise<T> => {
    try {
      const response = await apiClient.put(url, data, config);
      return response.data?.data ?? response.data;
    } catch (error: any) {
      console.error('[apiService.put] Error:', {
        url,
        message: error?.message,
        code: error?.code,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      throw error;
    }
  },
  patch: async <T = unknown>(url: string, data?: any, config?: any): Promise<T> => {
    try {
      const response = await apiClient.patch(url, data, config);
      return response.data?.data ?? response.data;
    } catch (error: any) {
      console.error('[apiService.patch] Error:', {
        url,
        message: error?.message,
        code: error?.code,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      throw error;
    }
  },
  delete: async <T = unknown>(url: string, config?: any): Promise<T> => {
    try {
      const response = await apiClient.delete(url, config);
      return response.data?.data ?? response.data;
    } catch (error: any) {
      console.error('[apiService.delete] Error:', {
        url,
        message: error?.message,
        code: error?.code,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      throw error;
    }
  },
  upload: async <T = unknown>(url: string, formData: FormData, config?: any): Promise<T> => {
    try {
      const response = await apiClient.post(url, formData, {
        ...config,
        headers: {
          ...config?.headers,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data?.data ?? response.data;
    } catch (error: any) {
      console.error('[apiService.upload] Error:', {
        url,
        message: error?.message,
        code: error?.code,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      throw error;
    }
  },
  getRawResponse: async (url: string, config?: any) => {
    try {
      return await apiClient.get(url, config);
    } catch (error: any) {
      console.error('[apiService.getRawResponse] Error:', {
        url,
        message: error?.message,
        code: error?.code,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      throw error;
    }
  },
};

export default apiService;

