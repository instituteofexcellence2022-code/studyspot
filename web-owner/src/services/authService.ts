/**
 * Simple Authentication Service
 * Clean, simple auth without complex JWT handling
 * Auto-switches to mock mode when backend is unavailable
 */

import { User as AppUser, UserRole, UserStatus } from '../types';
import { mockAuthService } from './mockAuthService';
import { authClient, tokenStorage } from './sdk';
import { STORAGE_KEYS } from '../constants';
import { apiService } from './api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true' || false;

export interface User extends AppUser {
  // This extends the main User type from types/index.ts
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

class AuthService {
  private token: string | null = tokenStorage.read()?.accessToken ?? null;
  private user: User | null = this.getStoredUser();
  private readonly useMock = USE_MOCK;

  private persistAuthResponse(response: {
    user: any;
    tokens: { accessToken: string; refreshToken?: string; expiresAt?: number | null };
  }) {
    this.token = response.tokens.accessToken;
    this.user = {
      id: response.user.id,
      email: response.user.email,
      firstName: response.user.firstName || 'User',
      lastName: response.user.lastName || '',
      role: (response.user.role || 'library_owner') as UserRole,
      tenantId: response.user.tenantId || 'default',
      status: (response.user.status || 'active') as UserStatus,
      createdAt: response.user.createdAt || new Date().toISOString(),
      updatedAt: response.user.updatedAt || new Date().toISOString(),
      phone: response.user.phone || undefined,
    };

    tokenStorage.write({
      accessToken: response.tokens.accessToken,
      refreshToken: response.tokens.refreshToken,
      expiresAt: response.tokens.expiresAt ?? undefined,
      tenantId: response.user.tenantId,
    });

    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(this.user));
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    if (this.useMock) {
      return await mockAuthService.login(email, password);
    }

    const response = await authClient.login({ email, password });
    this.persistAuthResponse(response);
    return {
      success: true,
      message: 'Login successful',
      data: {
        user: this.user!,
        token: response.tokens.accessToken,
      },
    };
  }

  async register(email: string, password: string, name: string, role?: string): Promise<AuthResponse> {
    if (this.useMock) {
      return await mockAuthService.register(email, password, name, role);
    }

    const response = await authClient.login({ email, password });
    this.persistAuthResponse(response);
    return {
      success: true,
      message: 'Registration successful',
      data: {
        user: this.user!,
        token: response.tokens.accessToken,
      },
    };
  }

  async registerDetailed(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: string;
  }): Promise<AuthResponse> {
    if (this.useMock) {
      return await mockAuthService.registerDetailed(userData);
    }

    const response = await authClient.login({
      email: userData.email,
      password: userData.password,
    });
    this.persistAuthResponse(response);
    return {
      success: true,
      message: 'Registration successful',
      data: {
        user: this.user!,
        token: response.tokens.accessToken,
      },
    };
  }

  async logout(): Promise<void> {
    try {
      await authClient.logout();
    } finally {
      this.token = null;
      this.user = null;
      tokenStorage.clear();
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    }
  }

  async getProfile(): Promise<User | null> {
    if (this.useMock) {
      return mockAuthService.getCurrentUser();
    }

    try {
      const response = await apiService.get<any>('/api/auth/profile');
      const payload = response?.user ?? response;
      if (!payload) {
        return null;
      }
      this.user = {
        id: payload.id,
        email: payload.email,
        firstName: payload.firstName || payload.first_name,
        lastName: payload.lastName || payload.last_name,
        role: payload.role,
        tenantId: payload.tenantId || payload.tenant_id,
        status: payload.status || 'active',
        createdAt: payload.createdAt,
        updatedAt: payload.updatedAt,
        phone: payload.phone,
      };
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(this.user));
      return this.user;
    } catch (error) {
      return null;
    }
  }

  getCurrentUser(): User | null {
    if (this.useMock) {
      return mockAuthService.getCurrentUser();
    }
    return this.user;
  }

  isAuthenticated(): boolean {
    if (this.useMock) {
      return mockAuthService.isAuthenticated();
    }
    return Boolean(tokenStorage.read()?.accessToken);
  }

  getToken(): string | null {
    if (this.useMock) {
      return mockAuthService.getToken();
    }
    return tokenStorage.read()?.accessToken ?? null;
  }

  /**
   * Get stored user from localStorage
   */
  private getStoredUser(): User | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  }
}

export const authService = new AuthService();