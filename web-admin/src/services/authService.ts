import { LoginRequest, LoginResponse, RegisterRequest, User
  } from '../types';
import { apiService
  } from './api';
import { API_CONFIG } from '../config/environment';

export class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const result = await apiService.login(credentials);
    // Normalize and assert return type to LoginResponse
    const normalized: LoginResponse = {
      user: result.user as unknown as User,
      token: result.token,
      refreshToken: result.refreshToken,
      expiresIn: (result as any).expiresIn ?? 3600,
    };
    return normalized;
  }

  async register(userData: RegisterRequest): Promise<User> {
    return await apiService.register(userData);
  }

  async refreshToken(refreshToken: string): Promise<any> {
    return await apiService.refreshToken(refreshToken);
  }

  async logout(): Promise<void> {
    return await apiService.logout();
  }

  async getProfile(): Promise<User> {
    return await apiService.getProfile();
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    return await apiService.put<User>(API_CONFIG.ENDPOINTS.AUTH.PROFILE, userData);
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return await apiService.patch<void>(
      `${API_CONFIG.ENDPOINTS.AUTH.PROFILE}/password`,
      { currentPassword, newPassword }
    );
  }

  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    return await apiService.upload<{ avatarUrl: string }>(
      `${API_CONFIG.ENDPOINTS.AUTH.PROFILE}/avatar`,
      formData
    );
  }
}

export const authService = new AuthService();

