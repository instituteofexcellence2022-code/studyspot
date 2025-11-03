/**
 * Simple Authentication Service
 * Clean, simple auth without complex JWT handling
 */

import { User as AppUser, UserRole, UserStatus } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

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

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('auth_token');
    this.user = this.getStoredUser();
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        this.token = data.data.token;
        // Transform the user data to match the expected interface
        this.user = {
          id: data.data.user.id || '1',
          email: data.data.user.email,
          firstName: data.data.user.name?.split(' ')[0] || 'User',
          lastName: data.data.user.name?.split(' ')[1] || '',
          role: (data.data.user.role || 'library_owner') as UserRole,
          tenantId: data.data.user.tenant_id || 'default',
          status: 'active' as UserStatus,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
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
    } catch (error) {
      throw new Error('Login failed');
    }
  }

  /**
   * Register user
   */
  async register(email: string, password: string, name: string, role?: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, role }),
      });

      const data = await response.json();

      if (data.success) {
        this.token = data.data.token;
        // Transform the user data to match the expected interface
        this.user = {
          id: data.data.user.id || '1',
          email: data.data.user.email,
          firstName: data.data.user.name?.split(' ')[0] || 'User',
          lastName: data.data.user.name?.split(' ')[1] || '',
          role: (data.data.user.role || 'library_owner') as UserRole,
          tenantId: data.data.user.tenant_id || 'default',
          status: 'active' as UserStatus,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
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
    } catch (error) {
      throw new Error('Registration failed');
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
    return this.user;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.token;
  }

  /**
   * Get auth token
   */
  getToken(): string | null {
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