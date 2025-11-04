/**
 * Mock Authentication Service for Owner Portal
 * Provides offline authentication when backend is unavailable
 * Similar to Student PWA's mock auth system
 */

import { User as AppUser, UserRole, UserStatus } from '../types';

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

// Mock users database (stored in localStorage)
const MOCK_USERS_KEY = 'studyspot_mock_users_owner';
const MOCK_TOKENS_KEY = 'studyspot_mock_tokens_owner';

interface MockUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  id: string;
  createdAt: string;
}

class MockAuthService {
  private getMockUsers(): MockUserData[] {
    try {
      const stored = localStorage.getItem(MOCK_USERS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveMockUsers(users: MockUserData[]): void {
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
  }

  private generateToken(email: string): string {
    return `mock_token_${btoa(email)}_${Date.now()}`;
  }

  private createUserFromMockData(mockUser: MockUserData): User {
    return {
      id: mockUser.id,
      email: mockUser.email,
      firstName: mockUser.firstName,
      lastName: mockUser.lastName,
      phone: mockUser.phone || '',
      role: mockUser.role,
      tenantId: '00000000-0000-0000-0000-000000000000',
      status: 'active' as UserStatus,
      createdAt: mockUser.createdAt,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Login user (mock)
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const users = this.getMockUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const token = this.generateToken(email);
    const userObj = this.createUserFromMockData(user);

    // Store token mapping
    const tokens = this.getStoredTokens();
    tokens[email] = token;
    localStorage.setItem(MOCK_TOKENS_KEY, JSON.stringify(tokens));

    console.log('✅ [MOCK] Login successful:', email);

    return {
      success: true,
      message: 'Login successful',
      data: {
        user: userObj,
        token,
      },
    };
  }

  /**
   * Register user (mock)
   */
  async register(
    email: string,
    password: string,
    name: string,
    role?: string
  ): Promise<AuthResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const users = this.getMockUsers();
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
      throw new Error('User with this email already exists');
    }

    // Parse name
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Create new user
    const newUser: MockUserData = {
      id: `mock_user_${Date.now()}`,
      email,
      password, // In real app, this would be hashed
      firstName,
      lastName,
      role: (role as UserRole) || 'library_staff',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.saveMockUsers(users);

    const token = this.generateToken(email);
    const userObj = this.createUserFromMockData(newUser);

    // Store token mapping
    const tokens = this.getStoredTokens();
    tokens[email] = token;
    localStorage.setItem(MOCK_TOKENS_KEY, JSON.stringify(tokens));

    console.log('✅ [MOCK] Registration successful:', email);

    return {
      success: true,
      message: 'Registration successful',
      data: {
        user: userObj,
        token,
      },
    };
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
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const users = this.getMockUsers();
    
    // Check if user already exists
    if (users.find(u => u.email === userData.email)) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const newUser: MockUserData = {
      id: `mock_user_${Date.now()}`,
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      role: (userData.role as UserRole) || 'library_staff',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.saveMockUsers(users);

    const token = this.generateToken(userData.email);
    const userObj = this.createUserFromMockData(newUser);

    // Store token mapping
    const tokens = this.getStoredTokens();
    tokens[userData.email] = token;
    localStorage.setItem(MOCK_TOKENS_KEY, JSON.stringify(tokens));

    console.log('✅ [MOCK] Registration successful:', userData.email);

    return {
      success: true,
      message: 'Registration successful',
      data: {
        user: userObj,
        token,
      },
    };
  }

  /**
   * Get stored tokens mapping
   */
  private getStoredTokens(): Record<string, string> {
    try {
      const stored = localStorage.getItem(MOCK_TOKENS_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  /**
   * Logout user (mock)
   */
  async logout(): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    console.log('✅ [MOCK] Logout successful');
  }

  /**
   * Get current user from token
   */
  getCurrentUser(): User | null {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;

    const tokens = this.getStoredTokens();
    const email = Object.keys(tokens).find(e => tokens[e] === token);
    
    if (!email) return null;

    const users = this.getMockUsers();
    const user = users.find(u => u.email === email);
    
    return user ? this.createUserFromMockData(user) : null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  /**
   * Get auth token
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}

export const mockAuthService = new MockAuthService();


