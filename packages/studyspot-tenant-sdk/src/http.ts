import axios from 'axios';
import type { TokenStorage } from './storage';

export interface ApiClientOptions {
  baseURL: string;
  tokenStorage: TokenStorage;
  getTenantId: () => string | null;
  onUnauthorized?: () => void;
  requestTimeoutMs?: number;
}

export function createApiClient(options: ApiClientOptions) {
  const {
    baseURL,
    tokenStorage,
    getTenantId,
    onUnauthorized,
    requestTimeoutMs = 30_000,
  } = options;

  const instance = axios.create({
    baseURL,
    timeout: requestTimeoutMs,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: false, // Don't send credentials for CORS (unless needed)
    validateStatus: (status) => status < 500, // Don't throw on 4xx errors
  });

  instance.interceptors.request.use((config) => {
    const tokens = tokenStorage.read();
    if (tokens?.accessToken) {
      config.headers = config.headers ?? {};
      (config.headers as Record<string, string>)['Authorization'] = `Bearer ${tokens.accessToken}`;
    }

    const tenantId = getTenantId();
    if (tenantId) {
      config.headers = config.headers ?? {};
      (config.headers as Record<string, string>)['x-tenant-id'] = tenantId;
    }

    return config;
  });

  // Response interceptor with automatic token refresh
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If 401 error and we haven't tried refreshing yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Get current tokens
          const tokens = tokenStorage.read();
          
          if (tokens?.refreshToken) {
            // Try to refresh the access token
            const response = await axios.post(
              `${baseURL}/api/auth/refresh`,
              { refreshToken: tokens.refreshToken },
              { headers: { 'Content-Type': 'application/json' } }
            );

            const newTokens = (response.data as any)?.data?.tokens || (response.data as any)?.tokens;
            
            if (newTokens?.accessToken) {
              // Update stored tokens
              tokenStorage.write({
                accessToken: newTokens.accessToken,
                refreshToken: newTokens.refreshToken || tokens.refreshToken,
                expiresAt: newTokens.expiresAt,
                tenantId: tokens.tenantId,
              });

              // Retry the original request with new token
              originalRequest.headers['Authorization'] = `Bearer ${newTokens.accessToken}`;
              return instance(originalRequest);
            }
          }
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          tokenStorage.clear();
          if (typeof onUnauthorized === 'function') {
            onUnauthorized();
          }
          return Promise.reject(refreshError);
        }
      }

      // If still 401 after retry or no refresh token, check if it's an auth error or service error
      if (error.response?.status === 401) {
        // Only logout if it's an actual auth error, not a service unavailable error
        const errorMessage = error.response?.data?.error?.message || error.response?.data?.message || '';
        const isServiceError = errorMessage.includes('Service') || 
                              errorMessage.includes('service') ||
                              errorMessage.includes('not found') ||
                              errorMessage.includes('unavailable') ||
                              error.code === 'ECONNREFUSED' ||
                              error.code === 'ETIMEDOUT';
        
        // Don't logout on service errors - just reject the promise
        if (!isServiceError && typeof onUnauthorized === 'function') {
          onUnauthorized();
        }
      }
      
      return Promise.reject(error);
    }
  );

  return instance;
}
