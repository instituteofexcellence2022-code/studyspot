import axios from 'axios';
import { API_CONFIG, STORAGE_KEYS, ERROR_MESSAGES } from '../constants';
import { ApiResponse, LoginRequest, LoginResponse, RegisterRequest, User } from '../types';

class ApiService {
  private api: any;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config: any) => {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: any) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response: any) => {
        return response;
      },
      async (error: any) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              const newToken = response.data.token;
              
              localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newToken);
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            this.logout();
            window.location.href = '/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth Methods
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.api.post(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    const data = response.data.data;
    // Normalize backend response to match frontend expectations
    return {
      user: data.user,
      token: data.tokens.accessToken,
      refreshToken: data.tokens.refreshToken,
      expiresIn: data.tokens.expiresIn
    };
  }

  async register(userData: RegisterRequest): Promise<any> {
    const response = await this.api.post(
      API_CONFIG.ENDPOINTS.AUTH.REGISTER,
      userData
    );
    const data = response.data.data;
    // Normalize backend response to match frontend expectations
    return {
      user: data.user,
      token: data.tokens.accessToken,
      refreshToken: data.tokens.refreshToken,
      expiresIn: data.tokens.expiresIn
    };
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<{ token: string }>> {
    const response = await this.api.post(
      API_CONFIG.ENDPOINTS.AUTH.REFRESH,
      { refreshToken }
    );
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.api.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    } finally {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    }
  }

  async getProfile(): Promise<User> {
    const response = await this.api.get(
      API_CONFIG.ENDPOINTS.AUTH.PROFILE
    );
    // Backend returns { user: {...} }, extract the user
    return response.data.data.user;
  }

  // Generic CRUD Methods
  async get<T>(url: string, config?: any): Promise<T> {
    const response = await this.api.get(url, config);
    return response.data.data;
  }

  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.api.post(url, data, config);
    return response.data.data;
  }

  async put<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.api.put(url, data, config);
    return response.data.data;
  }

  async patch<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.api.patch(url, data, config);
    return response.data.data;
  }

  async delete<T>(url: string, config?: any): Promise<T> {
    const response = await this.api.delete(url, config);
    return response.data.data;
  }

  // Upload method for file uploads
  async upload<T>(url: string, formData: FormData, config?: any): Promise<T> {
    const response = await this.api.post(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }

  // Get raw response for special cases
  async getRawResponse<T>(url: string, config?: any): Promise<any> {
    return await this.api.get(url, config);
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
export default apiService;

