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

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401 && typeof onUnauthorized === 'function') {
        onUnauthorized();
      }
      return Promise.reject(error);
    }
  );

  return instance;
}
