// ============================================
// USER SERVICE
// ============================================

import { api } from './client';
import { User, ApiResponse } from '../../types';

// MOCK MODE - Set to true to use mock data
const MOCK_MODE = true;

// Mock user data
const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'john.admin@studyspot.com',
    name: 'John Anderson',
    role: 'admin',
    tenantId: '1',
    tenantName: 'Central Library System',
    avatarUrl: '',
    status: 'active',
    lastLogin: '2024-10-30T08:15:00Z',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-10-30T08:15:00Z',
  },
  {
    id: '2',
    email: 'sarah.support@studyspot.com',
    name: 'Sarah Mitchell',
    role: 'support',
    tenantId: '2',
    tenantName: 'University StudyHub',
    avatarUrl: '',
    status: 'active',
    lastLogin: '2024-10-29T16:45:00Z',
    createdAt: '2024-02-10T09:30:00Z',
    updatedAt: '2024-10-29T16:45:00Z',
  },
  {
    id: '3',
    email: 'mike.viewer@studyspot.com',
    name: 'Michael Chen',
    role: 'viewer',
    tenantId: '3',
    tenantName: 'Downtown Learning Center',
    avatarUrl: '',
    status: 'active',
    lastLogin: '2024-10-28T14:20:00Z',
    createdAt: '2024-03-05T11:15:00Z',
    updatedAt: '2024-10-28T14:20:00Z',
  },
  {
    id: '4',
    email: 'emily.admin@studyspot.com',
    name: 'Emily Rodriguez',
    role: 'admin',
    tenantId: '1',
    tenantName: 'Central Library System',
    avatarUrl: '',
    status: 'suspended',
    lastLogin: '2024-10-15T10:30:00Z',
    createdAt: '2024-01-20T14:00:00Z',
    updatedAt: '2024-10-20T12:00:00Z',
  },
  {
    id: '5',
    email: 'david.superadmin@studyspot.com',
    name: 'David Park',
    role: 'super_admin',
    tenantId: null,
    tenantName: undefined,
    avatarUrl: '',
    status: 'active',
    lastLogin: '2024-10-30T09:00:00Z',
    createdAt: '2023-12-01T08:00:00Z',
    updatedAt: '2024-10-30T09:00:00Z',
  },
  {
    id: '6',
    email: 'lisa.support@studyspot.com',
    name: 'Lisa Thompson',
    role: 'support',
    tenantId: '4',
    tenantName: 'City Public Library Network',
    avatarUrl: '',
    status: 'inactive',
    lastLogin: '2024-09-15T13:20:00Z',
    createdAt: '2024-04-10T10:00:00Z',
    updatedAt: '2024-10-01T14:30:00Z',
  },
  {
    id: '7',
    email: 'alex.admin@studyspot.com',
    name: 'Alex Johnson',
    role: 'admin',
    tenantId: '5',
    tenantName: 'Tech Institute Library',
    avatarUrl: '',
    status: 'active',
    lastLogin: '2024-10-30T07:45:00Z',
    createdAt: '2024-03-12T12:00:00Z',
    updatedAt: '2024-10-30T07:45:00Z',
  },
  {
    id: '8',
    email: 'rachel.viewer@studyspot.com',
    name: 'Rachel Green',
    role: 'viewer',
    tenantId: '2',
    tenantName: 'University StudyHub',
    avatarUrl: '',
    status: 'active',
    lastLogin: '2024-10-29T18:10:00Z',
    createdAt: '2024-05-20T09:00:00Z',
    updatedAt: '2024-10-29T18:10:00Z',
  },
];

let mockUsersStore = [...MOCK_USERS];

/**
 * User Service
 */
class UserService {
  /**
   * Get all users with pagination and filters
   */
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
    tenantId?: string;
  }): Promise<ApiResponse<User[]>> {
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        let filtered = [...mockUsersStore];
        
        // Apply filters
        if (params?.search) {
          const search = params.search.toLowerCase();
          filtered = filtered.filter(
            u =>
              u.name.toLowerCase().includes(search) ||
              u.email.toLowerCase().includes(search) ||
              (u.tenantName && u.tenantName.toLowerCase().includes(search))
          );
        }
        
        if (params?.role) {
          filtered = filtered.filter(u => u.role === params.role);
        }
        
        if (params?.status) {
          filtered = filtered.filter(u => u.status === params.status);
        }
        
        if (params?.tenantId) {
          filtered = filtered.filter(u => u.tenantId === params.tenantId);
        }
        
        // Pagination
        const page = params?.page || 1;
        const limit = params?.limit || 10;
        const start = (page - 1) * limit;
        const end = start + limit;
        const paginated = filtered.slice(start, end);
        
        return {
          success: true,
          data: paginated,
          meta: {
            page,
            limit,
            total: filtered.length,
            totalPages: Math.ceil(filtered.length / limit),
          },
        };
      }

      const response = await api.get<User[]>('/api/v1/users', params);
      return response;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<ApiResponse<User>> {
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 200));
        const user = mockUsersStore.find(u => u.id === id);
        
        if (!user) {
          return {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: 'User not found',
            },
          };
        }
        
        return {
          success: true,
          data: user,
        };
      }

      const response = await api.get<User>(`/api/v1/users/${id}`);
      return response;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Create new user
   */
  async createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'lastLogin'>): Promise<ApiResponse<User>> {
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const newUser: User = {
          ...data,
          id: `user-${Date.now()}`,
          lastLogin: undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        mockUsersStore.push(newUser);
        
        return {
          success: true,
          data: newUser,
        };
      }

      const response = await api.post<User>('/api/v1/users', data);
      return response;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Update user
   */
  async updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 400));
        
        const index = mockUsersStore.findIndex(u => u.id === id);
        if (index === -1) {
          return {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: 'User not found',
            },
          };
        }
        
        mockUsersStore[index] = {
          ...mockUsersStore[index],
          ...data,
          updatedAt: new Date().toISOString(),
        };
        
        return {
          success: true,
          data: mockUsersStore[index],
        };
      }

      const response = await api.patch<User>(`/api/v1/users/${id}`, data);
      return response;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<ApiResponse> {
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const index = mockUsersStore.findIndex(u => u.id === id);
        if (index === -1) {
          return {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: 'User not found',
            },
          };
        }
        
        mockUsersStore.splice(index, 1);
        
        return {
          success: true,
        };
      }

      const response = await api.delete(`/api/v1/users/${id}`);
      return response;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<ApiResponse<any>> {
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const total = mockUsersStore.length;
        const active = mockUsersStore.filter(u => u.status === 'active').length;
        const suspended = mockUsersStore.filter(u => u.status === 'suspended').length;
        const inactive = mockUsersStore.filter(u => u.status === 'inactive').length;
        
        const byRole = {
          super_admin: mockUsersStore.filter(u => u.role === 'super_admin').length,
          admin: mockUsersStore.filter(u => u.role === 'admin').length,
          support: mockUsersStore.filter(u => u.role === 'support').length,
          viewer: mockUsersStore.filter(u => u.role === 'viewer').length,
        };
        
        return {
          success: true,
          data: {
            total,
            active,
            suspended,
            inactive,
            byRole,
          },
        };
      }

      const response = await api.get('/api/v1/users/stats');
      return response;
    } catch (error: any) {
      throw error;
    }
  }
}

// Export singleton instance
export const userService = new UserService();

// Export class for testing
export default UserService;

