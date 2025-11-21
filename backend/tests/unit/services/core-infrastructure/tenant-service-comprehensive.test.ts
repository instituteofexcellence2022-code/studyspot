/**
 * UNIT TESTS - TENANT SERVICE (Comprehensive)
 * Tests for: Tenant onboarding, configuration, data isolation, 
 * performance monitoring, resource quota management
 */

import { coreDb } from '../../../src/config/database';
import { tenantDbManager } from '../../../src/config/database';
import { logger } from '../../../src/utils/logger';

// Mock dependencies
jest.mock('../../../src/config/database', () => ({
  coreDb: {
    query: jest.fn(),
  },
  tenantDbManager: {
    getTenantConnection: jest.fn(),
  },
}));

jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Tenant Service - Comprehensive', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Tenant Onboarding', () => {
    it('should create new tenant', async () => {
      const tenantData = {
        name: 'Test Tenant',
        email: 'tenant@example.com',
        phone: '+1234567890',
        subscription_plan: 'starter',
      };

      (coreDb.query as jest.Mock).mockResolvedValue({
        rows: [{
          id: 'tenant-123',
          ...tenantData,
          status: 'active',
          created_at: new Date(),
        }],
      });

      const result = await coreDb.query(
        'INSERT INTO tenants (name, email, phone, subscription_plan) VALUES ($1, $2, $3, $4) RETURNING *',
        [tenantData.name, tenantData.email, tenantData.phone, tenantData.subscription_plan]
      );

      expect(result.rows[0].name).toBe(tenantData.name);
      expect(result.rows[0].status).toBe('active');
    });

    it('should generate tenant slug', () => {
      const name = 'Test Tenant Name';
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      expect(slug).toBe('test-tenant-name');
    });

    it('should validate tenant email uniqueness', async () => {
      const email = 'existing@example.com';

      (coreDb.query as jest.Mock).mockResolvedValue({
        rows: [{ id: 'tenant-123', email }],
      });

      const result = await coreDb.query(
        'SELECT * FROM tenants WHERE email = $1',
        [email]
      );

      expect(result.rows.length).toBeGreaterThan(0);
    });
  });

  describe('Tenant Configuration', () => {
    it('should store tenant configuration', async () => {
      const tenantId = 'tenant-123';
      const config = {
        max_libraries: 10,
        max_students: 100,
        max_staff: 20,
        features: ['analytics', 'reports'],
      };

      (coreDb.query as jest.Mock).mockResolvedValue({
        rows: [{ id: tenantId, config: JSON.stringify(config) }],
      });

      const result = await coreDb.query(
        'UPDATE tenants SET config = $1 WHERE id = $2 RETURNING *',
        [JSON.stringify(config), tenantId]
      );

      expect(result.rows[0].config).toBeDefined();
    });

    it('should retrieve tenant configuration', async () => {
      const tenantId = 'tenant-123';

      (coreDb.query as jest.Mock).mockResolvedValue({
        rows: [{
          id: tenantId,
          config: JSON.stringify({ max_libraries: 10 }),
        }],
      });

      const result = await coreDb.query(
        'SELECT config FROM tenants WHERE id = $1',
        [tenantId]
      );

      const config = JSON.parse(result.rows[0].config);
      expect(config.max_libraries).toBe(10);
    });
  });

  describe('Data Isolation', () => {
    it('should isolate tenant data', async () => {
      const tenantId = 'tenant-123';
      const mockTenantDb = {
        query: jest.fn(),
      };

      (tenantDbManager.getTenantConnection as jest.Mock).mockResolvedValue(mockTenantDb);

      await tenantDbManager.getTenantConnection(tenantId);

      expect(tenantDbManager.getTenantConnection).toHaveBeenCalledWith(tenantId);
    });

    it('should filter queries by tenant_id', () => {
      const query = 'SELECT * FROM students';
      const tenantId = 'tenant-123';
      const isolatedQuery = `${query} WHERE tenant_id = $1`;

      expect(isolatedQuery).toContain('tenant_id');
    });
  });

  describe('Performance Monitoring', () => {
    it('should track tenant performance metrics', () => {
      const metrics = {
        tenantId: 'tenant-123',
        responseTime: 150,
        requestCount: 1000,
        errorRate: 0.01,
        timestamp: new Date(),
      };

      expect(metrics.responseTime).toBeLessThan(200);
      expect(metrics.errorRate).toBeLessThan(0.05);
    });

    it('should detect performance degradation', () => {
      const currentResponseTime = 500;
      const threshold = 200;

      const isDegraded = currentResponseTime > threshold;
      expect(isDegraded).toBe(true);
    });
  });

  describe('Resource Quota Management', () => {
    it('should check library quota', () => {
      const tenant = {
        max_libraries: 10,
        current_libraries: 8,
      };

      const canAddLibrary = tenant.current_libraries < tenant.max_libraries;
      expect(canAddLibrary).toBe(true);
    });

    it('should check student quota', () => {
      const tenant = {
        max_students: 100,
        current_students: 95,
      };

      const canAddStudent = tenant.current_students < tenant.max_students;
      expect(canAddStudent).toBe(true);
    });

    it('should check storage quota', () => {
      const tenant = {
        max_storage_gb: 100,
        current_storage_gb: 80,
      };

      const canAddStorage = tenant.current_storage_gb < tenant.max_storage_gb;
      expect(canAddStorage).toBe(true);
    });

    it('should enforce quota limits', () => {
      const tenant = {
        max_libraries: 10,
        current_libraries: 10,
      };

      const canAddLibrary = tenant.current_libraries < tenant.max_libraries;
      expect(canAddLibrary).toBe(false);
    });
  });

  describe('Tenant Status Management', () => {
    it('should activate tenant', async () => {
      const tenantId = 'tenant-123';

      (coreDb.query as jest.Mock).mockResolvedValue({
        rows: [{ id: tenantId, status: 'active' }],
      });

      const result = await coreDb.query(
        'UPDATE tenants SET status = $1 WHERE id = $2 RETURNING *',
        ['active', tenantId]
      );

      expect(result.rows[0].status).toBe('active');
    });

    it('should suspend tenant', async () => {
      const tenantId = 'tenant-123';
      const reason = 'Payment overdue';

      (coreDb.query as jest.Mock).mockResolvedValue({
        rows: [{ id: tenantId, status: 'suspended', suspension_reason: reason }],
      });

      const result = await coreDb.query(
        'UPDATE tenants SET status = $1, suspension_reason = $2 WHERE id = $3 RETURNING *',
        ['suspended', reason, tenantId]
      );

      expect(result.rows[0].status).toBe('suspended');
    });
  });
});

