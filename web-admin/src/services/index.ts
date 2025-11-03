// Service exports
export * from './apiService';
export * from './authService';
export * from './userService';
export * from './tenantService';
export * from './libraryService';
export * from './bookingService';
export * from './creditService';
export * from './rbacService';
export * from './subscriptionService';

// Hook exports
export { useAIService } from '../hooks/useAIService';
export { useServiceManagement } from '../hooks/useServiceManagement';

// Service types
export interface ServiceResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedServiceResponse<T = any> {
  data: T[];
  total: number;
  page?: number;
  limit?: number;
  totalPages: number;
  success: boolean;
  message?: string;
  error?: string;
}

// Base service class
export abstract class BaseService {
  protected baseUrl: string;
  protected headers: Record<string, string>;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ServiceResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          data: null as any,
          success: false,
          error: data.message || 'Request failed',
        };
      }

      return {
        data,
        success: true,
      };
    } catch (error) {
      return {
        data: null as any,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  protected setAuthToken(token: string) {
    this.headers['Authorization'] = `Bearer ${token}`;
  }

  protected removeAuthToken() {
    delete this.headers['Authorization'];
  }
}
