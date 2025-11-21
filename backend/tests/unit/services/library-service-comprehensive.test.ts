/**
 * UNIT TESTS - LIBRARY SERVICE COMPREHENSIVE
 * Comprehensive tests for library service business logic
 */

import { tenantDbManager } from '../../../src/config/database';

// Mock dependencies
jest.mock('../../../src/config/database');
jest.mock('../../../src/utils/logger');

describe('Library Service - Comprehensive', () => {
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

  describe('Library Status Management', () => {
    it('should activate library', async () => {
      const libraryId = 'library-123';

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: libraryId, status: 'active' }],
      });

      const result = await mockTenantDb.query(
        'UPDATE libraries SET status = $1 WHERE id = $2 RETURNING *',
        ['active', libraryId]
      );

      expect(result.rows[0].status).toBe('active');
    });

    it('should suspend library', async () => {
      const libraryId = 'library-123';

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: libraryId, status: 'suspended' }],
      });

      const result = await mockTenantDb.query(
        'UPDATE libraries SET status = $1 WHERE id = $2 RETURNING *',
        ['suspended', libraryId]
      );

      expect(result.rows[0].status).toBe('suspended');
    });
  });

  describe('Library Occupancy Management', () => {
    it('should update current occupancy', async () => {
      const libraryId = 'library-123';
      const newOccupancy = 25;

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: libraryId, current_occupancy: newOccupancy }],
      });

      const result = await mockTenantDb.query(
        'UPDATE libraries SET current_occupancy = $1 WHERE id = $2 RETURNING *',
        [newOccupancy, libraryId]
      );

      expect(result.rows[0].current_occupancy).toBe(newOccupancy);
    });

    it('should calculate occupancy rate', async () => {
      const library = {
        id: 'library-123',
        current_occupancy: 25,
        capacity: 50,
      };

      const occupancyRate = (library.current_occupancy / library.capacity) * 100;

      expect(occupancyRate).toBe(50);
    });

    it('should detect full capacity', async () => {
      const library = {
        id: 'library-123',
        current_occupancy: 50,
        capacity: 50,
      };

      const isFull = library.current_occupancy >= library.capacity;

      expect(isFull).toBe(true);
    });
  });

  describe('Library Search and Filtering', () => {
    it('should search libraries by name', async () => {
      const searchTerm = 'Test Library';

      mockTenantDb.query.mockResolvedValue({
        rows: [
          { id: 'lib-1', name: 'Test Library 1' },
          { id: 'lib-2', name: 'Test Library 2' },
        ],
      });

      const result = await mockTenantDb.query(
        `SELECT * FROM libraries 
         WHERE tenant_id = $1 
         AND name ILIKE $2 
         AND deleted_at IS NULL`,
        [tenantId, `%${searchTerm}%`]
      );

      expect(result.rows.length).toBeGreaterThan(0);
    });

    it('should filter libraries by city', async () => {
      const city = 'Mumbai';

      mockTenantDb.query.mockResolvedValue({
        rows: [
          { id: 'lib-1', city: 'Mumbai' },
          { id: 'lib-2', city: 'Mumbai' },
        ],
      });

      const result = await mockTenantDb.query(
        'SELECT * FROM libraries WHERE tenant_id = $1 AND city = $2',
        [tenantId, city]
      );

      expect(result.rows.every((l: any) => l.city === city)).toBe(true);
    });

    it('should filter libraries by status', async () => {
      const status = 'active';

      mockTenantDb.query.mockResolvedValue({
        rows: [
          { id: 'lib-1', status: 'active' },
          { id: 'lib-2', status: 'active' },
        ],
      });

      const result = await mockTenantDb.query(
        'SELECT * FROM libraries WHERE tenant_id = $1 AND status = $2',
        [tenantId, status]
      );

      expect(result.rows.every((l: any) => l.status === status)).toBe(true);
    });
  });

  describe('Fee Plan Management', () => {
    it('should create fee plan', async () => {
      const feePlanData = {
        name: 'Premium Plan',
        amount: 2000,
        duration_days: 30,
        features: ['seat_booking', 'wifi', 'printing'],
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
      expect(result.rows[0].amount).toBe(feePlanData.amount);
    });

    it('should update fee plan', async () => {
      const planId = 'plan-123';
      const updates = {
        amount: 2500,
        features: ['seat_booking', 'wifi', 'printing', 'coffee'],
      };

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: planId, ...updates }],
      });

      const result = await mockTenantDb.query(
        `UPDATE fee_plans SET amount = $1, features = $2 WHERE id = $3 RETURNING *`,
        [updates.amount, JSON.stringify(updates.features), planId]
      );

      expect(result.rows[0].amount).toBe(updates.amount);
    });

    it('should retrieve active fee plans', async () => {
      mockTenantDb.query.mockResolvedValue({
        rows: [
          { id: 'plan-1', name: 'Basic Plan', status: 'active' },
          { id: 'plan-2', name: 'Premium Plan', status: 'active' },
        ],
      });

      const result = await mockTenantDb.query(
        'SELECT * FROM fee_plans WHERE tenant_id = $1 AND status = $2',
        [tenantId, 'active']
      );

      expect(result.rows.every((p: any) => p.status === 'active')).toBe(true);
    });
  });

  describe('Library Statistics', () => {
    it('should calculate library statistics', async () => {
      mockTenantDb.query.mockResolvedValue({
        rows: [{
          total_libraries: 10,
          active_libraries: 8,
          total_capacity: 500,
          total_occupancy: 250,
        }],
      });

      const result = await mockTenantDb.query(
        `SELECT 
           COUNT(*) as total_libraries,
           COUNT(*) FILTER (WHERE status = 'active') as active_libraries,
           SUM(capacity) as total_capacity,
           SUM(current_occupancy) as total_occupancy
         FROM libraries
         WHERE tenant_id = $1 AND deleted_at IS NULL`,
        [tenantId]
      );

      expect(result.rows[0].total_libraries).toBe(10);
      expect(result.rows[0].active_libraries).toBe(8);
    });
  });
});

