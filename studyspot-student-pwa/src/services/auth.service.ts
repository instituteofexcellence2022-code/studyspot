import api from './api';
import { authClient, tokenStorage } from './tenantSdk';
import type { LoginRequest, RegisterRequest, LoginResponse, User } from '../types/auth';

const AUTH_SERVICE_BASE = import.meta.env.VITE_AUTH_URL || 'https://studyspot-auth.onrender.com';

class AuthService {
  private readonly USER_KEY = 'studyspot_user';

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await authClient.login(credentials);
      this.setUser(response.user);
      return response;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async register(data: RegisterRequest): Promise<LoginResponse> {
    try {
      const response = await api.post('/api/auth/register', data);
      const payload = response.data?.data || response.data;
      
      // Backend returns tokens + user on successful registration
      if (payload.tokens && payload.user) {
        // Store tokens using SDK
        tokenStorage.write({
          accessToken: payload.tokens.accessToken,
          refreshToken: payload.tokens.refreshToken,
          expiresAt: payload.tokens.expiresAt,
          tenantId: payload.user.tenantId,
        });
        this.setUser(payload.user);
        
        return {
          user: payload.user,
          tokens: payload.tokens,
        };
      }
      
      // Fallback: If no tokens returned, auto-login the user
      return await this.login({
        email: data.email,
        password: data.password,
      });
    } catch (error: any) {
      // If API gateway is unreachable or returns 5xx, try auth service directly
      if (!error?.response || error.response?.status >= 500) {
        try {
          const fallbackResponse = await fetch(`${AUTH_SERVICE_BASE}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          if (!fallbackResponse.ok) {
            const fallbackError = await fallbackResponse.json().catch(() => ({}));
            const errorMsg = fallbackError?.error?.message || 'Registration failed';
            const errorDetails = fallbackError?.error?.details ? `: ${fallbackError.error.details}` : '';
            throw new Error(`${errorMsg}${errorDetails}`);
          }

          const payload = await fallbackResponse.json();
          const result = payload.data || payload;

          if (result.tokens && result.user) {
            tokenStorage.write({
              accessToken: result.tokens.accessToken,
              refreshToken: result.tokens.refreshToken,
              expiresAt: result.tokens.expiresAt,
              tenantId: result.user.tenantId,
            });
            this.setUser(result.user);
            return {
              user: result.user,
              tokens: result.tokens,
            };
          }

          return await this.login({
            email: data.email,
            password: data.password,
          });
        } catch (fallbackError: any) {
          throw this.handleError(fallbackError);
        }
      }

      throw this.handleError(error);
    }
  }

  async refreshToken(): Promise<string> {
    try {
      const tokens = await authClient.refresh();
      if (!tokens?.accessToken) {
        throw new Error('No access token returned');
      }
      return tokens.accessToken;
    } catch (error: any) {
      this.clearAuth();
      throw this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await authClient.logout();
    } finally {
      this.clearAuth();
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get('/api/auth/me');
      const data = response.data?.data || response.data;
      const user = data.user || data;
      this.setUser(user);
      return user;
    } catch (error) {
      return null;
    }
  }

  getToken(): string | null {
    return tokenStorage.read()?.accessToken ?? null;
  }

  getRefreshToken(): string | null {
    return tokenStorage.read()?.refreshToken ?? null;
  }

  setToken(token: string): void {
    const snapshot = tokenStorage.read() ?? {};
    tokenStorage.write({ ...snapshot, accessToken: token });
  }

  setTokens(accessToken: string, refreshToken?: string): void {
    const snapshot = tokenStorage.read() ?? {};
    tokenStorage.write({
      ...snapshot,
      accessToken,
      refreshToken: refreshToken ?? snapshot.refreshToken,
    });
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

  setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  updateUser(updates: Partial<User>): void {
    const currentUser = this.getUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      this.setUser(updatedUser);
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    return Boolean(token && user);
  }

  clearAuth(): void {
    tokenStorage.clear();
    localStorage.removeItem(this.USER_KEY);
  }

  private handleError(error: any): Error {
    if (error instanceof Error) {
      return error;
    }

    if (!error?.response) {
      return new Error('Network error. Please check your internet connection.');
    }

    // Extract error message from nested error object or direct message
    const errorObj = error.response?.data?.error;
    const message = 
      errorObj?.message ||
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.response?.data?.errors?.[0]?.msg ||
      error.message ||
      'An unexpected error occurred';
    
    // Append details if available
    const details = errorObj?.details;
    const fullMessage = details ? `${message}: ${details}` : message;

    return new Error(fullMessage);
  }
}

export const authService = new AuthService();
export default authService;
