/**
 * Simple Authentication Service
 * Clean, simple auth without complex JWT handling
 * Auto-switches to mock mode when backend is unavailable
 */

import { User as AppUser, UserRole, UserStatus } from '../types';
import { mockAuthService } from './mockAuthService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Enable mock mode if USE_MOCK is set, or if backend is unavailable
const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true' || false;
const CHECK_BACKEND_ON_STARTUP = true;

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
  private token: string | null = null;
  private user: User | null = null;
  private useMock: boolean = USE_MOCK;
  private backendChecked: boolean = false;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('auth_token');
    this.user = this.getStoredUser();

    // Check backend availability on startup
    if (CHECK_BACKEND_ON_STARTUP && !USE_MOCK) {
      this.checkBackendAvailability();
    } else if (USE_MOCK) {
      console.log('🎭 [AUTH] Using MOCK authentication service');
      this.useMock = true;
    }
  }

  /**
   * Check if backend is available
   */
  private async checkBackendAvailability(): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000), // 3 second timeout
      });
      
      if (response.ok) {
        this.useMock = false;
        console.log('✅ [AUTH] Backend available, using real authentication');
      } else {
        throw new Error('Backend not healthy');
      }
    } catch (error) {
      this.useMock = true;
      console.warn('⚠️ [AUTH] Backend unavailable, switching to MOCK authentication');
      console.warn('   This allows you to test the UI without backend connection');
    } finally {
      this.backendChecked = true;
    }
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    // Use mock service if enabled
    if (this.useMock) {
      return await mockAuthService.login(email, password);
    }

    // Try real backend
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`Backend returned ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        this.token = data.data.token || data.data.tokens?.accessToken;
        // Transform the user data to match the expected interface
        const userData = data.data.user || data.data;
        this.user = {
          id: userData.id || '1',
          email: userData.email,
          firstName: userData.firstName || userData.name?.split(' ')[0] || 'User',
          lastName: userData.lastName || userData.name?.split(' ')[1] || '',
          role: (userData.role || 'library_owner') as UserRole,
          tenantId: userData.tenantId || userData.tenant_id || 'default',
          status: (userData.status || 'active') as UserStatus,
          createdAt: userData.createdAt || new Date().toISOString(),
          updatedAt: userData.updatedAt || new Date().toISOString()
        };
        
        // Store in localStorage
        if (this.token) {
          localStorage.setItem('auth_token', this.token);
        }
        if (this.user) {
          localStorage.setItem('user', JSON.stringify(this.user));
        }
      }

      return data;
    } catch (error: any) {
      // If backend fails and we haven't checked yet, try mock
      if (!this.backendChecked) {
        console.warn('⚠️ [AUTH] Backend request failed, switching to mock mode');
        this.useMock = true;
        return await mockAuthService.login(email, password);
      }
      throw new Error(error.message || 'Login failed');
    }
  }

  /**
   * Register user
   */
  async register(email: string, password: string, name: string, role?: string): Promise<AuthResponse> {
    // Use mock service if enabled
    if (this.useMock) {
      return await mockAuthService.register(email, password, name, role);
    }

    // Try real backend
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, role }),
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`Backend returned ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        this.token = data.data.token || data.data.tokens?.accessToken;
        // Transform the user data to match the expected interface
        const userData = data.data.user || data.data;
        this.user = {
          id: userData.id || '1',
          email: userData.email,
          firstName: userData.firstName || userData.name?.split(' ')[0] || 'User',
          lastName: userData.lastName || userData.name?.split(' ')[1] || '',
          role: (userData.role || role || 'library_owner') as UserRole,
          tenantId: userData.tenantId || userData.tenant_id || 'default',
          status: (userData.status || 'active') as UserStatus,
          createdAt: userData.createdAt || new Date().toISOString(),
          updatedAt: userData.updatedAt || new Date().toISOString()
        };
        
        // Store in localStorage
        if (this.token) {
          localStorage.setItem('auth_token', this.token);
        }
        if (this.user) {
          localStorage.setItem('user', JSON.stringify(this.user));
        }
      }

      return data;
    } catch (error: any) {
      // If backend fails and we haven't checked yet, try mock
      if (!this.backendChecked) {
        console.warn('⚠️ [AUTH] Backend request failed, switching to mock mode');
        this.useMock = true;
        return await mockAuthService.register(email, password, name, role);
      }
      throw new Error(error.message || 'Registration failed');
    }
  }

  /**
   * Register with detailed user data (for RegisterPage)
   */
  async registerDetailed(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: string;
  }): Promise<AuthResponse> {
    // Use mock service if enabled
    if (this.useMock) {
      return await mockAuthService.registerDetailed(userData);
    }

    // Try real backend with full user data
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          role: userData.role,
        }),
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`Backend returned ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        this.token = data.data.token || data.data.tokens?.accessToken;
        const userDataResponse = data.data.user || data.data;
        this.user = {
          id: userDataResponse.id || '1',
          email: userDataResponse.email,
          firstName: userDataResponse.firstName || userData.firstName,
          lastName: userDataResponse.lastName || userData.lastName,
          phone: userDataResponse.phone || userData.phone,
          role: (userDataResponse.role || userData.role || 'library_owner') as UserRole,
          tenantId: userDataResponse.tenantId || userDataResponse.tenant_id || 'default',
          status: (userDataResponse.status || 'active') as UserStatus,
          createdAt: userDataResponse.createdAt || new Date().toISOString(),
          updatedAt: userDataResponse.updatedAt || new Date().toISOString()
        };
        
        if (this.token) {
          localStorage.setItem('auth_token', this.token);
        }
        if (this.user) {
          localStorage.setItem('user', JSON.stringify(this.user));
        }
      }

      return data;
    } catch (error: any) {
      // If backend fails, try mock
      if (!this.backendChecked) {
        console.warn('⚠️ [AUTH] Backend request failed, switching to mock mode');
        this.useMock = true;
        return await mockAuthService.registerDetailed(userData);
      }
      throw new Error(error.message || 'Registration failed');
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });
    } catch (error) {
      // Ignore logout errors
    } finally {
      this.token = null;
      this.user = null;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    if (this.useMock) {
      return mockAuthService.getCurrentUser();
    }
    return this.user;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (this.useMock) {
      return mockAuthService.isAuthenticated();
    }
    return !!this.token;
  }

  /**
   * Get auth token
   */
  getToken(): string | null {
    if (this.useMock) {
      return mockAuthService.getToken();
    }
    return this.token;
  }

  /**
   * Get stored user from localStorage
   */
  private getStoredUser(): User | null {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  /**
   * Get auth headers for API requests
   */
  getAuthHeaders(): Record<string, string> {
    return this.token ? {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    } : {
      'Content-Type': 'application/json',
    };
  }
}

export const authService = new AuthService();