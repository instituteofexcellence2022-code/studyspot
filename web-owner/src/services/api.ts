import { apiClient } from './sdk';

export const apiService = {
  get: async <T = unknown>(url: string, config?: any): Promise<T> => {
    const response = await apiClient.get(url, config);
    return response.data?.data ?? response.data;
  },
  post: async <T = unknown>(url: string, data?: any, config?: any): Promise<T> => {
    const response = await apiClient.post(url, data, config);
    return response.data?.data ?? response.data;
  },
  put: async <T = unknown>(url: string, data?: any, config?: any): Promise<T> => {
    const response = await apiClient.put(url, data, config);
    return response.data?.data ?? response.data;
  },
  patch: async <T = unknown>(url: string, data?: any, config?: any): Promise<T> => {
    const response = await apiClient.patch(url, data, config);
    return response.data?.data ?? response.data;
  },
  delete: async <T = unknown>(url: string, config?: any): Promise<T> => {
    const response = await apiClient.delete(url, config);
    return response.data?.data ?? response.data;
  },
  upload: async <T = unknown>(url: string, formData: FormData, config?: any): Promise<T> => {
    const response = await apiClient.post(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data ?? response.data;
  },
  getRawResponse: async (url: string, config?: any) => apiClient.get(url, config),
};

export default apiService;

