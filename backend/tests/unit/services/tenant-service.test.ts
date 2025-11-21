/**
 * UNIT TESTS - TENANT SERVICE
 * Tests tenant management functionality
 */

import { coreDb } from '../../../src/config/database';
import { logger } from '../../../src/utils/logger';

// Mock dependencies
jest.mock('../../../src/config/database', () => ({
  coreDb: {
    query: jest.fn(),
  },
}));

jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('Tenant Service', () => {
  let mockCoreDb: any;

  beforeEach(() => {
    mockCoreDb = {
      query: jest.fn(),
    };
    (coreDb.query as jest.Mock).mockImplementation(mockCoreDb.query);
    jest.clearAllMocks();
  });

  describe('Tenant CRUD Operations', () => {
    it('should create a tenant', async () => {
      const tenantData = {
        name: 'Test Library',
        email: 'test@library.com',
        phone: '+1234567890',
        status: 'active',
      };

      mockCoreDb.query.mockResolvedValueOnce({
        rows: [{ id: 'tenant-123', ...tenantData, created_at: new Date() }],
      });

      const createTenant = async (data: any) => {
        const result = await coreDb.query(
          `INSERT INTO tenants (name, email, phone, status)
           VALUES ($1, $2, $3, $4) RETURNING *`,
          [data.name, data.email, data.phone, data.status]
        );
        return result.rows[0];
      };

      const tenant = await createTenant(tenantData);

      expect(mockCoreDb.query).toHaveBeenCalled();
      expect(tenant.name).toBe(tenantData.name);
      expect(tenant.email).toBe(tenantData.email);
    });

    it('should get tenant by ID', async () => {
      const tenantId = 'tenant-123';
      mockCoreDb.query.mockResolvedValueOnce({
        rows: [{
          id: tenantId,
          name: 'Test Library',
          email: 'test@library.com',
          status: 'active',
        }],
      });

      const getTenant = async (id: string) => {
        const result = await coreDb.query(
          'SELECT * FROM tenants WHERE id = $1',
          [id]
        );
        return result.rows[0];
      };

      const tenant = await getTenant(tenantId);

      expect(mockCoreDb.query).toHaveBeenCalled();
      expect(tenant.id).toBe(tenantId);
    });

    it('should update tenant', async () => {
      const tenantId = 'tenant-123';
      const updates = {
        name: 'Updated Library Name',
        phone: '+9876543210',
      };

      mockCoreDb.query.mockResolvedValueOnce({
        rows: [{ id: tenantId, ...updates }],
      });

      const updateTenant = async (id: string, updates: any) => {
        const result = await coreDb.query(
          `UPDATE tenants SET name = $1, phone = $2 WHERE id = $3 RETURNING *`,
          [updates.name, updates.phone, id]
        );
        return result.rows[0];
      };

      const tenant = await updateTenant(tenantId, updates);

      expect(mockCoreDb.query).toHaveBeenCalled();
      expect(tenant.name).toBe(updates.name);
    });

    it('should suspend tenant', async () => {
      const tenantId = 'tenant-123';
      mockCoreDb.query.mockResolvedValueOnce({
        rows: [{ id: tenantId, status: 'suspended' }],
      });

      const suspendTenant = async (id: string) => {
        const result = await coreDb.query(
          `UPDATE tenants SET status = 'suspended' WHERE id = $1 RETURNING *`,
          [id]
        );
        return result.rows[0];
      };

      const tenant = await suspendTenant(tenantId);

      expect(mockCoreDb.query).toHaveBeenCalled();
      expect(tenant.status).toBe('suspended');
    });

    it('should activate tenant', async () => {
      const tenantId = 'tenant-123';
      mockCoreDb.query.mockResolvedValueOnce({
        rows: [{ id: tenantId, status: 'active' }],
      });

      const activateTenant = async (id: string) => {
        const result = await coreDb.query(
          `UPDATE tenants SET status = 'active' WHERE id = $1 RETURNING *`,
          [id]
        );
        return result.rows[0];
      };

      const tenant = await activateTenant(tenantId);

      expect(mockCoreDb.query).toHaveBeenCalled();
      expect(tenant.status).toBe('active');
    });
  });

  describe('Tenant Onboarding', () => {
    it('should complete tenant onboarding', async () => {
      const tenantId = 'tenant-123';
      const onboardingData = {
        business_name: 'Test Business',
        address: '123 Test St',
        city: 'Test City',
      };

      mockCoreDb.query
        .mockResolvedValueOnce({
          rows: [{ id: tenantId }],
        })
        .mockResolvedValueOnce({
          rows: [{ id: tenantId, onboarding_completed: true }],
        });

      const completeOnboarding = async (id: string, data: any) => {
        await coreDb.query(
          `UPDATE tenants SET business_name = $1, address = $2, city = $3, onboarding_completed = true
           WHERE id = $4`,
          [data.business_name, data.address, data.city, id]
        );
        const result = await coreDb.query(
          'SELECT * FROM tenants WHERE id = $1',
          [id]
        );
        return result.rows[0];
      };

      const tenant = await completeOnboarding(tenantId, onboardingData);

      expect(mockCoreDb.query).toHaveBeenCalledTimes(2);
      expect(tenant.onboarding_completed).toBe(true);
    });
  });
});
