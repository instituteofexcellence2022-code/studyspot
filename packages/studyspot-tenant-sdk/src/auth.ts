import { jwtDecode } from 'jwt-decode';
import type { AuthProviderConfig, LoginResponse, TenantClaims, TokenSet } from './types';
import { TokenStorage, TokenStorageSchema } from './storage';

const DEFAULT_ENDPOINTS = {
  login: '/auth/login',
  refresh: '/auth/refresh',
  logout: '/auth/logout',
};

export interface Credentials {
  email: string;
  password: string;
}

export interface AuthClientOptions {
  provider: AuthProviderConfig;
  storage: TokenStorage;
  fetcher?: typeof fetch;
}

export class AuthClient {
  private readonly fetcher: typeof fetch;

  constructor(private readonly options: AuthClientOptions) {
    this.fetcher = options.fetcher ?? fetch.bind(globalThis);
  }

  async login(credentials: Credentials): Promise<LoginResponse> {
    const { provider, storage } = this.options;
    const rawResponse = await this.request<any>(
      provider.loginPath ?? DEFAULT_ENDPOINTS.login,
      credentials
    );

    console.log('[StudySpot SDK] Raw login response:', {
      type: typeof rawResponse,
      keys: rawResponse ? Object.keys(rawResponse) : 'null/undefined',
      hasData: !!(rawResponse as any)?.data,
      dataKeys: (rawResponse as any)?.data ? Object.keys((rawResponse as any).data) : 'no data',
      dataTokens: !!(rawResponse as any)?.data?.tokens,
      fullResponse: JSON.stringify(rawResponse, null, 2).substring(0, 500), // First 500 chars
    });

    // Handle backend response wrapping (data.data or data)
    const response = (rawResponse as any).data || rawResponse;
    
    console.log('[StudySpot SDK] Extracted response:', {
      type: typeof response,
      keys: response ? Object.keys(response) : 'null/undefined',
      fullResponse: JSON.stringify(response, null, 2).substring(0, 500), // First 500 chars
    });

    console.log('[StudySpot SDK] Processed response:', {
      type: typeof response,
      keys: response ? Object.keys(response) : 'null/undefined',
      hasTokens: !!response?.tokens,
      tokensType: typeof response?.tokens,
      tokensKeys: response?.tokens ? Object.keys(response.tokens) : 'no tokens',
    });

    // Validate response structure
    if (!response || !response.tokens) {
      console.error('[StudySpot SDK] Login response missing tokens:', {
        rawResponse,
        response,
        hasData: !!(rawResponse as any).data,
        responseType: typeof response,
        responseKeys: response ? Object.keys(response) : 'response is null/undefined',
      });
      throw new Error('Invalid login response: tokens not found');
    }

    if (!response.tokens.accessToken) {
      console.error('[StudySpot SDK] Login response missing accessToken:', {
        tokens: response.tokens,
        tokensType: typeof response.tokens,
        tokensKeys: response.tokens ? Object.keys(response.tokens) : 'tokens is null/undefined',
      });
      throw new Error('Invalid login response: accessToken not found');
    }

    console.log('[StudySpot SDK] About to persist tokens:', {
      hasAccessToken: !!response.tokens.accessToken,
      hasRefreshToken: !!response.tokens.refreshToken,
    });

    try {
      this.persistTokens(response.tokens, storage);
    } catch (persistError: any) {
      console.error('[StudySpot SDK] Failed to persist tokens:', persistError);
      console.error('[StudySpot SDK] Tokens object:', response.tokens);
      throw new Error(`Failed to persist tokens: ${persistError.message}`);
    }

    // Ensure response has the expected structure
    const loginResponse: LoginResponse = {
      user: response.user,
      tokens: response.tokens,
    };

    console.log('[StudySpot SDK] Login successful, returning response:', {
      hasUser: !!loginResponse.user,
      hasTokens: !!loginResponse.tokens,
      hasAccessToken: !!loginResponse.tokens?.accessToken,
    });

    return loginResponse;
  }

  async refresh(): Promise<TokenSet | null> {
    const { provider, storage } = this.options;

    if (provider.enableRefresh === false) {
      return null;
    }

    const tokens = storage.read();
    if (!tokens?.refreshToken) {
      return null;
    }

    const response = await this.request<{ tokens: TokenSet }>(
      provider.refreshPath ?? DEFAULT_ENDPOINTS.refresh,
      { refreshToken: tokens.refreshToken }
    );

    this.persistTokens(response.tokens, storage);
    return response.tokens;
  }

  async logout(): Promise<void> {
    const { provider, storage } = this.options;
    try {
      await this.request(provider.logoutPath ?? DEFAULT_ENDPOINTS.logout, undefined, 'POST', false);
    } finally {
      storage.clear();
    }
  }

  readClaims(): TenantClaims | null {
    const snapshot = this.options.storage.read();
    if (!snapshot?.accessToken) return null;

    try {
      const decoded = jwtDecode<{
        tenant_id?: string;
        tenant?: { id?: string; slug?: string; plan?: string };
        roles?: string[];
        permissions?: string[];
        exp?: number;
        iat?: number;
      }>(snapshot.accessToken);

      const tenantId = decoded.tenant_id ?? decoded.tenant?.id;
      if (!tenantId) return null;

      return {
        tenantId,
        tenantSlug: decoded.tenant?.slug,
        plan: decoded.tenant?.plan,
        roles: (decoded.roles ?? []).map((role: string) => role as TenantClaims['roles'][number]),
        permissions: decoded.permissions,
        issuedAt: (decoded.iat ?? 0) * 1000,
        expiresAt: (decoded.exp ?? 0) * 1000,
      };
    } catch (error) {
      console.warn('[StudySpot SDK] Failed to decode token claims', error);
      return null;
    }
  }

  private persistTokens(tokens: TokenSet, storage: TokenStorage): void {
    if (!tokens) {
      console.error('[StudySpot SDK] persistTokens called with undefined tokens');
      throw new Error('Tokens are required');
    }
    if (!tokens.accessToken) {
      console.error('[StudySpot SDK] persistTokens called with missing accessToken:', tokens);
      throw new Error('Access token is required');
    }
    storage.write({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
      tenantId: this.extractTenantId(tokens.accessToken),
    });
  }

  private extractTenantId(token: string): string | undefined {
    try {
      const decoded = jwtDecode<{ tenant_id?: string; tenant?: { id?: string } }>(token);
      return decoded.tenant_id ?? decoded.tenant?.id ?? undefined;
    } catch {
      return undefined;
    }
  }

  private async request<T = unknown>(
    path: string,
    body?: unknown,
    method: 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE' = 'POST',
    includeCredentials = true
  ): Promise<T> {
    const { provider } = this.options;
    const url = new URL(path, provider.baseUrl).toString();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (includeCredentials) {
      const snapshot = this.options.storage.read();
      if (snapshot?.accessToken) {
        headers.Authorization = `Bearer ${snapshot.accessToken}`;
      }
    }

    const shouldSendCredentials =
      includeCredentials && this.isSameOrigin(url);

    const response = await this.fetcher(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: shouldSendCredentials ? 'include' : 'omit',
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(
        `[StudySpot SDK] Auth request failed (${response.status} ${response.statusText}): ${message}`
      );
    }

    return (await response.json()) as T;
  }

  private isSameOrigin(targetUrl: string): boolean {
    if (typeof window === 'undefined' || !window.location) {
      return true;
    }

    try {
      const target = new URL(targetUrl);
      return target.origin === window.location.origin;
    } catch {
      return false;
    }
  }
}

export function buildTokenSnapshot(tokens: TokenSet, tenantId?: string): TokenStorageSchema {
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt: tokens.expiresAt,
    tenantId,
  };
}

