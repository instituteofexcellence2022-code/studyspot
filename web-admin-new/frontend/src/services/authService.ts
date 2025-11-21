import { authClient, tokenStorage, apiClient } from './sdk';
import { storage } from '../utils/storage';
import type { User, LoginCredentials } from '../types';

interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresAt?: number | null;
}

const mapUser = (payload: any): User => ({
  id: payload.id,
  email: payload.email,
  name: payload.name ?? `${payload.firstName ?? ''} ${payload.lastName ?? ''}`.trim(),
  role: payload.role,
  tenantId: payload.tenantId ?? null,
  status: payload.status ?? 'active',
  createdAt: payload.createdAt ?? new Date().toISOString(),
  updatedAt: payload.updatedAt ?? new Date().toISOString(),
});

const persist = (response: { user: any; tokens: { accessToken: string; refreshToken?: string; expiresAt?: number | null } }): AuthResponse => {
  const user = mapUser(response.user);

  tokenStorage.write({
    accessToken: response.tokens.accessToken,
    refreshToken: response.tokens.refreshToken,
    expiresAt: response.tokens.expiresAt ?? undefined,
    tenantId: user.tenantId ?? undefined,
  });

  storage.set('admin_user', user);
  storage.setAuthToken(response.tokens.accessToken);
  if (response.tokens.refreshToken) {
    storage.setRefreshToken(response.tokens.refreshToken);
  }

  return {
    user,
    token: response.tokens.accessToken,
    refreshToken: response.tokens.refreshToken,
    expiresAt: response.tokens.expiresAt ?? null,
  };
};

export const adminAuthService = {
  /**
   * Login platform admin or platform staff
   * Uses dedicated admin login endpoint: /api/v1/auth/admin/login
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Use Parameters utility type to extract the correct type from authClient.login method
    // This bypasses any TypeScript cache issues with the Credentials interface
    const response = await authClient.login({
      email: credentials.email,
      password: credentials.password,
      // tenantId not needed for platform users (they have no tenant)
      userType: 'platform_admin', // Backend will determine if admin or staff
      portalType: 'admin',        // Always 'admin' for admin portal
    } as Parameters<typeof authClient.login>[0]);
    return persist(response);
  },

  async logout(): Promise<void> {
    try {
      await authClient.logout();
    } finally {
      tokenStorage.clear();
      storage.clearAuthData();
    }
  },

  async getProfile(): Promise<User | null> {
    try {
      const { data } = await apiClient.get('/auth/profile');
      const payload = (data as any)?.user ?? data;
      if (!payload) return null;
      const user = mapUser(payload);
      storage.set('admin_user', user);
      return user;
    } catch {
      return null;
    }
  },
};

export default adminAuthService;

