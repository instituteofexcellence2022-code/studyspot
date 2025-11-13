declare module 'studyspot-tenant-sdk' {
  import type { AxiosInstance } from 'axios';

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
    baseUrl: string;
    loginPath?: string;
    refreshPath?: string;
    logoutPath?: string;
    enableRefresh?: boolean;
  }

  export interface StorageAdapter {
    getItem<T = unknown>(key: string): T | null;
    setItem<T = unknown>(key: string, value: T): void;
    removeItem(key: string): void;
    clear?(): void;
  }

  export class BrowserStorageAdapter implements StorageAdapter {
    private readonly storage: Storage;
    constructor(storage?: Storage);
    getItem<T>(key: string): T | null;
    setItem<T>(key: string, value: T): void;
    removeItem(key: string): void;
    clear(): void;
  }

  export class MemoryStorageAdapter implements StorageAdapter {
    private data: Record<string, unknown>;
    getItem<T>(key: string): T | null;
    setItem<T>(key: string, value: T): void;
    removeItem(key: string): void;
    clear(): void;
  }

  export interface TokenStorageSchema {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    tenantId?: string;
  }

  export class TokenStorage {
    constructor(adapter: StorageAdapter);
    read(): TokenStorageSchema | null;
    write(payload: TokenStorageSchema): void;
    clear(): void;
  }

  export interface ApiClientOptions {
    baseURL: string;
    tokenStorage: TokenStorage;
    getTenantId: () => string | null;
    onUnauthorized?: () => void;
    requestTimeoutMs?: number;
  }

  export function createApiClient(options: ApiClientOptions): AxiosInstance;

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
    constructor(options: AuthClientOptions);
    login(credentials: Credentials): Promise<LoginResponse>;
    refresh(): Promise<TokenSet | null>;
    logout(): Promise<void>;
    readClaims(): TenantClaims | null;
  }

  export function buildTokenSnapshot(tokens: TokenSet, tenantId?: string): TokenStorageSchema;
}

