import { User, PaginatedResponse, RegisterRequest
  } from '../types';
import { apiService
  } from './api';
import { API_CONFIG } from '../types';

export class UserService {
  async getUsers(page: number = 1, limit: number = 10, search?: string): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search })});

    return await apiService.get<PaginatedResponse<User>>(
      `${API_CONFIG.ENDPOINTS.USERS.LIST}?${params}`
    );
  }

  async getUserById(id: string): Promise<User> {
    return await apiService.get<User>(
      API_CONFIG.ENDPOINTS.USERS.BY_ID.replace(':id', id)
    );
  }

  async createUser(userData: RegisterRequest): Promise<User> {
    return await apiService.post<User>(
      API_CONFIG.ENDPOINTS.USERS.CREATE,
      userData
    );
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    return await apiService.put<User>(
      API_CONFIG.ENDPOINTS.USERS.UPDATE.replace(':id', id),
      userData
    );
  }

  async deleteUser(id: string): Promise<void> {
    return await apiService.delete<void>(
      API_CONFIG.ENDPOINTS.USERS.DELETE.replace(':id', id)
    );
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    return await apiService.patch<User>(
      API_CONFIG.ENDPOINTS.AUTH.PROFILE,
      userData
    );
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

export const userService = new UserService();


