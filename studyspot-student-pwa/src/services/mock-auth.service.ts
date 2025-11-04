/**
 * Mock Auth Service for Development/Testing
 * Remove this in production!
 */

import type { LoginRequest, RegisterRequest, LoginResponse, User } from '../types/auth';

class MockAuthService {
  private readonly TOKEN_KEY = 'studyspot_token';
  private readonly USER_KEY = 'studyspot_user';
  private readonly MOCK_USERS_KEY = 'studyspot_mock_users';

  /**
   * Simulate network delay
   */
  private async delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get mock users from localStorage
   */
  private getMockUsers(): Array<User & { password: string }> {
    const users = localStorage.getItem(this.MOCK_USERS_KEY);
    return users ? JSON.parse(users) : [];
  }

  /**
   * Save mock users to localStorage
   */
  private saveMockUsers(users: Array<User & { password: string }>): void {
    localStorage.setItem(this.MOCK_USERS_KEY, JSON.stringify(users));
  }

  /**
   * Mock login
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    await this.delay();

    const mockUsers = this.getMockUsers();
    const user = mockUsers.find(u => u.email === credentials.email);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (user.password !== credentials.password) {
      throw new Error('Invalid email or password');
    }

    // Generate mock tokens
    const tokens = {
      accessToken: `mock-token-${Date.now()}`,
      refreshToken: `mock-refresh-${Date.now()}`,
    };

    // Remove password from user object
    const { password, ...safeUser } = user;

    // Store
    localStorage.setItem(this.TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(safeUser));

    return {
      user: safeUser,
      tokens,
    };
  }

  /**
   * Mock register
   */
  async register(data: RegisterRequest): Promise<User> {
    await this.delay();

    const mockUsers = this.getMockUsers();

    // Check if email exists
    if (mockUsers.find(u => u.email === data.email)) {
      throw new Error('Email already exists');
    }

    // Create new user
    const newUser: User & { password: string } = {
      id: `user-${Date.now()}`,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: 'student',
      password: data.password, // In real app, this would be hashed
      createdAt: new Date().toISOString(),
    };

    mockUsers.push(newUser);
    this.saveMockUsers(mockUsers);

    const { password, ...safeUser } = newUser;
    return safeUser;
  }

  /**
   * Mock logout
   */
  async logout(): Promise<void> {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User | null> {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Get/Set methods to match real auth service
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  updateUser(updates: Partial<User>): void {
    const current = this.getUser();
    if (current) {
      const updated = { ...current, ...updates };
      localStorage.setItem(this.USER_KEY, JSON.stringify(updated));
    }
  }

  clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  getRefreshToken(): string | null {
    return null; // Mock doesn't use refresh tokens
  }

  /**
   * Check if using mock mode
   */
  isMockMode(): boolean {
    return import.meta.env.MODE === 'development';
  }
}

export const mockAuthService = new MockAuthService();

