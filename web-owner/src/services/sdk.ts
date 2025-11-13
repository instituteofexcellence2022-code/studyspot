import {
  AuthClient,
  BrowserStorageAdapter,
  TokenStorage,
  createApiClient,
  type AuthProviderConfig,
} from 'studyspot-tenant-sdk';

const authBaseUrl =
  process.env.REACT_APP_AUTH_URL ||
  process.env.REACT_APP_API_URL ||
  'http://localhost:3001';

const authConfig: AuthProviderConfig = {
  baseUrl: authBaseUrl,
  loginPath: '/api/auth/login',
  refreshPath: '/api/auth/refresh',
  logoutPath: '/api/auth/logout',
  enableRefresh: true,
};

const storageAdapter = typeof window !== 'undefined' ? new BrowserStorageAdapter() : undefined;

export const tokenStorage = new TokenStorage(
  storageAdapter ?? {
    getItem: () => null,
    setItem: () => undefined,
    removeItem: () => undefined,
  }
);

export const authClient = new AuthClient({
  provider: authConfig,
  storage: tokenStorage,
});

export const apiClient = createApiClient({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  tokenStorage,
  getTenantId: () => tokenStorage.read()?.tenantId ?? null,
  onUnauthorized: () => {
    tokenStorage.clear();
    window.location.href = '/login';
  },
});


