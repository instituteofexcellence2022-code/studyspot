export type UserRole =
  | 'student'
  | 'library_owner'
  | 'library_staff'
  | 'super_admin'
  | 'platform_support';

export interface TenantClaims {
  tenantId: string;
  tenantSlug?: string;
  plan?: string;
  issuedAt: number;
  expiresAt: number;
  roles: UserRole[];
  permissions?: string[];
}

export interface TokenSet {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

export interface LoginResponse {
  tokens: TokenSet;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    roles: UserRole[];
    tenantId: string;
  };
}

export interface AuthProviderConfig {
  /**
   * Public base URL of the authentication service or gateway.
   * Examples:
   *  - https://auth.studyspot.com
   *  - https://api.studyspot.com/api/v1
   */
  baseUrl: string;
  /**
   * Path for login endpoint relative to baseUrl.
   * Defaults to `/auth/login`.
   */
  loginPath?: string;
  refreshPath?: string;
  logoutPath?: string;
  /**
   * Optional override to disable refresh token usage.
   */
  enableRefresh?: boolean;
}

export interface RequestContext {
  tenantId: string | null;
  accessToken: string | null;
}

