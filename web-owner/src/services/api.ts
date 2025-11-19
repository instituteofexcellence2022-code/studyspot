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
      console.error('[apiService.post] Error:', {
        url,
        message: error?.message,
        code: error?.code,
        response: error?.response?.data,
        status: error?.response?.status,
        isNetworkError: !error?.response,
        isTimeout: error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT',
        isConnectionRefused: error?.code === 'ECONNREFUSED',
      });
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

