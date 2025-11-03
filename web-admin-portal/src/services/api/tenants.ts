// ============================================
// TENANT SERVICE
// ============================================

import { api } from './client';
import { API_ENDPOINTS } from '../../config/constants';
import { Tenant, ApiResponse } from '../../types';

// MOCK MODE - Set to true to use mock data
const MOCK_MODE = true;

// Mock tenant data
const MOCK_TENANTS: Tenant[] = [
  {
    id: '1',
    name: 'Central Library System',
    slug: 'central-library',
    status: 'active',
    subscriptionPlan: 'enterprise',
    subscriptionStatus: 'active',
    email: 'admin@centrallibrary.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, New York, NY 10001',
    logo: '',
    metadata: {
      librariesCount: 12,
      usersCount: 450,
      seatsCount: 1500,
    },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-10-20T14:22:00Z',
  },
  {
    id: '2',
    name: 'University StudyHub',
    slug: 'university-studyhub',
    status: 'active',
    subscriptionPlan: 'professional',
    subscriptionStatus: 'active',
    email: 'contact@universityhub.edu',
    phone: '+1 (555) 234-5678',
    address: '456 College Ave, Boston, MA 02115',
    logo: '',
    metadata: {
      librariesCount: 8,
      usersCount: 320,
      seatsCount: 800,
    },
    createdAt: '2024-02-10T09:15:00Z',
    updatedAt: '2024-10-18T11:45:00Z',
  },
  {
    id: '3',
    name: 'Downtown Learning Center',
    slug: 'downtown-learning',
    status: 'active',
    subscriptionPlan: 'starter',
    subscriptionStatus: 'trial',
    email: 'info@downtownlearning.com',
    phone: '+1 (555) 345-6789',
    address: '789 Learning Blvd, San Francisco, CA 94102',
    logo: '',
    metadata: {
      librariesCount: 3,
      usersCount: 85,
      seatsCount: 200,
    },
    createdAt: '2024-09-05T14:20:00Z',
    updatedAt: '2024-10-25T16:30:00Z',
  },
  {
    id: '4',
    name: 'City Public Library Network',
    slug: 'city-public-library',
    status: 'suspended',
    subscriptionPlan: 'professional',
    subscriptionStatus: 'expired',
    email: 'admin@citypublic.org',
    phone: '+1 (555) 456-7890',
    address: '321 Park Ave, Chicago, IL 60601',
    logo: '',
    metadata: {
      librariesCount: 15,
      usersCount: 620,
      seatsCount: 2000,
    },
    createdAt: '2023-11-20T08:00:00Z',
    updatedAt: '2024-10-01T12:00:00Z',
  },
  {
    id: '5',
    name: 'Tech Institute Library',
    slug: 'tech-institute',
    status: 'active',
    subscriptionPlan: 'enterprise',
    subscriptionStatus: 'active',
    email: 'library@techinstitute.edu',
    phone: '+1 (555) 567-8901',
    address: '555 Innovation Dr, Austin, TX 78701',
    logo: '',
    metadata: {
      librariesCount: 6,
      usersCount: 280,
      seatsCount: 750,
    },
    createdAt: '2024-03-12T11:30:00Z',
    updatedAt: '2024-10-28T09:15:00Z',
  },
];

let mockTenantsStore = [...MOCK_TENANTS];

/**
 * Tenant Service
 */
class TenantService {
  /**
   * Get all tenants with pagination and filters
   */
  async getTenants(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    subscriptionPlan?: string;
  }): Promise<ApiResponse<Tenant[]>> {
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        let filtered = [...mockTenantsStore];
        
        // Apply filters
        if (params?.search) {
          const search = params.search.toLowerCase();
          filtered = filtered.filter(
            t =>
              t.name.toLowerCase().includes(search) ||
              t.email.toLowerCase().includes(search) ||
              t.slug.toLowerCase().includes(search)
          );
        }
        
        if (params?.status) {
          filtered = filtered.filter(t => t.status === params.status);
        }
        
        if (params?.subscriptionPlan) {
          filtered = filtered.filter(t => t.subscriptionPlan === params.subscriptionPlan);
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

      const response = await api.get<Tenant[]>('/api/v1/tenants', params);
      return response;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Get tenant by ID
   */
  async getTenantById(id: string): Promise<ApiResponse<Tenant>> {
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 200));
        const tenant = mockTenantsStore.find(t => t.id === id);
        
        if (!tenant) {
          return {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: 'Tenant not found',
            },
          };
        }
        
        return {
          success: true,
          data: tenant,
        };
      }

      const response = await api.get<Tenant>(`/api/v1/tenants/${id}`);
      return response;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Create new tenant
   */
  async createTenant(data: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Tenant>> {
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const newTenant: Tenant = {
          ...data,
          id: `tenant-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        mockTenantsStore.push(newTenant);
        
        return {
          success: true,
          data: newTenant,
        };
      }

      const response = await api.post<Tenant>('/api/v1/tenants', data);
      return response;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Update tenant
   */
  async updateTenant(id: string, data: Partial<Tenant>): Promise<ApiResponse<Tenant>> {
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 400));
        
        const index = mockTenantsStore.findIndex(t => t.id === id);
        if (index === -1) {
          return {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: 'Tenant not found',
            },
          };
        }
        
        mockTenantsStore[index] = {
          ...mockTenantsStore[index],
          ...data,
          updatedAt: new Date().toISOString(),
        };
        
        return {
          success: true,
          data: mockTenantsStore[index],
        };
      }

      const response = await api.patch<Tenant>(`/api/v1/tenants/${id}`, data);
      return response;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Delete tenant
   */
  async deleteTenant(id: string): Promise<ApiResponse> {
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const index = mockTenantsStore.findIndex(t => t.id === id);
        if (index === -1) {
          return {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: 'Tenant not found',
            },
          };
        }
        
        mockTenantsStore.splice(index, 1);
        
        return {
          success: true,
        };
      }

      const response = await api.delete(`/api/v1/tenants/${id}`);
      return response;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Get tenant statistics
   */
  async getTenantStats(id: string): Promise<ApiResponse<any>> {
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const tenant = mockTenantsStore.find(t => t.id === id);
        if (!tenant) {
          return {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: 'Tenant not found',
            },
          };
        }
        
        return {
          success: true,
          data: {
            libraries: tenant.metadata.librariesCount || 0,
            users: tenant.metadata.usersCount || 0,
            seats: tenant.metadata.seatsCount || 0,
            activeBookings: Math.floor(Math.random() * 100),
            revenue: Math.floor(Math.random() * 10000),
            growth: Math.floor(Math.random() * 50) - 10,
          },
        };
      }

      const response = await api.get(`/api/v1/tenants/${id}/stats`);
      return response;
    } catch (error: any) {
      throw error;
    }
  }
}

// Export singleton instance
export const tenantService = new TenantService();

// Export class for testing
export default TenantService;

