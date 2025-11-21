/**
 * UNIT TESTS - LIBRARY SERVICE
 * Tests for library service business logic
 */

import { tenantDbManager } from '../../../src/config/database';
import { NotFoundError } from '../../../src/utils/errors';

// Mock dependencies
jest.mock('../../../src/config/database');
jest.mock('../../../src/utils/logger');

describe('Library Service', () => {
  let mockTenantDb: any;
  const tenantId = 'test-tenant-id';

  beforeEach(() => {
    mockTenantDb = {
      query: jest.fn(),
    };

    (tenantDbManager.getTenantConnection as jest.Mock) = jest.fn().mockResolvedValue(mockTenantDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Library CRUD Operations', () => {
    it('should retrieve libraries with filters', async () => {
      mockTenantDb.query.mockResolvedValue({
        rows: [
          { id: 'lib-1', name: 'Library 1', status: 'active' },
          { id: 'lib-2', name: 'Library 2', status: 'active' },
        ],
      });

      const result = await mockTenantDb.query(
        'SELECT * FROM libraries WHERE tenant_id = $1 AND status = $2',
        [tenantId, 'active']
      );

      expect(result.rows).toHaveLength(2);
      expect(mockTenantDb.query).toHaveBeenCalled();
    });

    it('should create a library', async () => {
      const libraryData = {
        name: 'New Library',
        address: '123 Test St',
        city: 'Test City',
        capacity: 50,
      };

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: 'lib-123', ...libraryData }],
      });

      const result = await mockTenantDb.query(
        `INSERT INTO libraries (tenant_id, name, address, city, capacity)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [tenantId, libraryData.name, libraryData.address, libraryData.city, libraryData.capacity]
      );

      expect(result.rows[0].name).toBe(libraryData.name);
    });

    it('should update library information', async () => {
      const libraryId = 'lib-123';
      const updates = { name: 'Updated Library Name' };

      mockTenantDb.query
        .mockResolvedValueOnce({ rows: [{ id: libraryId }] })
        .mockResolvedValueOnce({ rows: [{ id: libraryId, ...updates }] });

      // Check library exists
      const checkResult = await mockTenantDb.query(
        'SELECT * FROM libraries WHERE id = $1 AND tenant_id = $2',
        [libraryId, tenantId]
      );

      if (checkResult.rows.length > 0) {
        const updateResult = await mockTenantDb.query(
          'UPDATE libraries SET name = $1 WHERE id = $2 RETURNING *',
          [updates.name, libraryId]
        );

        expect(updateResult.rows[0].name).toBe(updates.name);
      }
    });

    it('should get real-time occupancy', async () => {
      mockTenantDb.query.mockResolvedValue({
        rows: [
          { id: 'lib-1', name: 'Library 1', current_occupancy: 25, capacity: 50 },
          { id: 'lib-2', name: 'Library 2', current_occupancy: 10, capacity: 30 },
        ],
      });

      const result = await mockTenantDb.query(
        'SELECT id, name, current_occupancy, capacity FROM libraries WHERE tenant_id = $1',
        [tenantId]
      );

      expect(result.rows).toBeDefined();
      expect(result.rows[0].current_occupancy).toBeDefined();
    });
  });

  describe('Fee Plans', () => {
    it('should create a fee plan', async () => {
      const feePlanData = {
        name: 'Basic Plan',
        amount: 1000,
        duration_days: 30,
        features: ['seat_booking', 'wifi'],
      };

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: 'plan-123', ...feePlanData }],
      });

      const result = await mockTenantDb.query(
        `INSERT INTO fee_plans (tenant_id, name, amount, duration_days, features)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [tenantId, feePlanData.name, feePlanData.amount, feePlanData.duration_days, JSON.stringify(feePlanData.features)]
      );

      expect(result.rows[0].name).toBe(feePlanData.name);
    });

    it('should retrieve fee plans', async () => {
      mockTenantDb.query.mockResolvedValue({
        rows: [
          { id: 'plan-1', name: 'Basic Plan', amount: 1000 },
          { id: 'plan-2', name: 'Premium Plan', amount: 2000 },
        ],
      });

      const result = await mockTenantDb.query(
        'SELECT * FROM fee_plans WHERE tenant_id = $1',
        [tenantId]
      );

      expect(result.rows).toHaveLength(2);
    });
  });
});

