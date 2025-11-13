import {
  AuthClient,
  BrowserStorageAdapter,
  TokenStorage,
  createApiClient,
  type AuthProviderConfig,
} from 'studyspot-tenant-sdk';

const DEFAULT_AUTH_BASE = 'https://studyspot-auth.onrender.com';
const DEFAULT_API_BASE = 'https://studyspot-api.onrender.com';

const authBaseUrl =
  import.meta.env.VITE_AUTH_URL || DEFAULT_AUTH_BASE;

const authConfig: AuthProviderConfig = {
  baseUrl: authBaseUrl,
  loginPath: '/api/auth/login',
  refreshPath: '/api/auth/refresh',
  logoutPath: '/api/auth/logout',
  enableRefresh: true,
};

if (!import.meta.env.VITE_AUTH_URL) {
  console.warn('[StudySpot] Missing VITE_AUTH_URL for AuthClient, using default auth service URL');
}

const storageAdapter =
  typeof window !== 'undefined'
    ? new BrowserStorageAdapter(window.localStorage)
    : undefined;

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
  baseURL: import.meta.env.VITE_API_URL || DEFAULT_API_BASE,
  tokenStorage,
  getTenantId: () => tokenStorage.read()?.tenantId ?? null,
  requestTimeoutMs: 10000, // 10 seconds timeout to prevent hanging
  onUnauthorized: () => {
    tokenStorage.clear();
    window.location.href = '/login';
  },
});

