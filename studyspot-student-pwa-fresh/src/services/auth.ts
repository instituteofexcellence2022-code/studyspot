import {
  AuthClient,
  BrowserStorageAdapter,
  TokenStorage,
  type AuthProviderConfig,
} from 'studyspot-tenant-sdk'

const authBaseUrl = import.meta.env.VITE_AUTH_URL || 'https://studyspot-auth.onrender.com'

const authConfig: AuthProviderConfig = {
  baseUrl: authBaseUrl,
  loginPath: '/api/auth/login',
  refreshPath: '/api/auth/refresh',
  logoutPath: '/api/auth/logout',
  enableRefresh: true,
}

const storageAdapter =
  typeof window !== 'undefined'
    ? new BrowserStorageAdapter(window.localStorage)
    : undefined

export const tokenStorage = new TokenStorage(
  storageAdapter ?? {
    getItem: () => null,
    setItem: () => undefined,
    removeItem: () => undefined,
  }
)

export const authClient = new AuthClient({
  provider: authConfig,
  storage: tokenStorage,
})


