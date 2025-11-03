import { API_CONFIG } from '../types';

// API Client class for making HTTP requests
export class ApiClient {
  private baseURL: string;
  private timeout: number;
  private retryAttempts: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.retryAttempts = API_CONFIG.RETRY_ATTEMPTS;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  async post<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async upload<T>(endpoint: string, formData: FormData, options: RequestInit = {}): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: formData,
      headers: {
        ...(options.headers || {}),
        // Let the browser set the Content-Type with proper boundary
      },
    });
  }

  async patch<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }

  setAuthToken(token: string) {
    // This would be used to set authorization headers
    // Implementation depends on how you want to handle auth tokens
  }

  removeAuthToken() {
    // Remove authorization headers
  }
}

// Export singleton instance
export const apiService = new ApiClient();
export const apiClient = apiService;








