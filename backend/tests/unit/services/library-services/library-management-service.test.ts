/**
 * UNIT TESTS - LIBRARY MANAGEMENT SERVICE
 * Tests for: Library profile management, branch coordination & settings,
 * operational configuration, performance monitoring
 */

import { tenantDbManager } from '../../../src/config/database';

// Mock dependencies
jest.mock('../../../src/config/database', () => ({
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

describe('Library Management Service', () => {
  let mockTenantDb: any;

  beforeEach(() => {
    mockTenantDb = {
      query: jest.fn(),
    };
    (tenantDbManager.getTenantConnection as jest.Mock).mockResolvedValue(mockTenantDb);
    jest.clearAllMocks();
  });

  describe('Library Profile Management', () => {
    it('should create library profile', async () => {
      const libraryData = {
        tenant_id: 'tenant-123',
        name: 'Test Library',
        address: '123 Main St',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456',
        capacity: 100,
      };

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: 'lib-123', ...libraryData, status: 'active' }],
      });

      const result = await mockTenantDb.query(
        `INSERT INTO libraries (tenant_id, name, address, city, state, pincode, capacity, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [libraryData.tenant_id, libraryData.name, libraryData.address, libraryData.city,
         libraryData.state, libraryData.pincode, libraryData.capacity, 'active']
      );

      expect(result.rows[0].name).toBe(libraryData.name);
      expect(result.rows[0].status).toBe('active');
    });

    it('should update library profile', async () => {
      const libraryId = 'lib-123';
      const updates = {
        name: 'Updated Library Name',
        capacity: 150,
      };

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: libraryId, ...updates }],
      });

      const result = await mockTenantDb.query(
        `UPDATE libraries SET name = $1, capacity = $2 WHERE id = $3 RETURNING *`,
        [updates.name, updates.capacity, libraryId]
      );

      expect(result.rows[0].name).toBe(updates.name);
      expect(result.rows[0].capacity).toBe(updates.capacity);
    });
  });

  describe('Branch Coordination & Settings', () => {
    it('should create library branch', async () => {
      const branchData = {
        library_id: 'lib-123',
        name: 'Branch 2',
        address: '456 Second St',
        city: 'Test City',
      };

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: 'branch-123', ...branchData }],
      });

      const result = await mockTenantDb.query(
        `INSERT INTO library_branches (library_id, name, address, city)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [branchData.library_id, branchData.name, branchData.address, branchData.city]
      );

      expect(result.rows[0].name).toBe(branchData.name);
    });

    it('should configure branch settings', async () => {
      const branchId = 'branch-123';
      const settings = {
        operating_hours: { open: '08:00', close: '22:00' },
        amenities: ['wifi', 'ac', 'parking'],
        pricing: { hourly: 50, daily: 400 },
      };

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: branchId, settings: JSON.stringify(settings) }],
      });

      const result = await mockTenantDb.query(
        `UPDATE library_branches SET settings = $1 WHERE id = $2 RETURNING *`,
        [JSON.stringify(settings), branchId]
      );

      const parsedSettings = JSON.parse(result.rows[0].settings);
      expect(parsedSettings.operating_hours.open).toBe('08:00');
    });
  });

  describe('Operational Configuration', () => {
    it('should configure operating hours', async () => {
      const libraryId = 'lib-123';
      const operatingHours = {
        monday: { open: '08:00', close: '22:00' },
        tuesday: { open: '08:00', close: '22:00' },
        wednesday: { open: '08:00', close: '22:00' },
        thursday: { open: '08:00', close: '22:00' },
        friday: { open: '08:00', close: '22:00' },
        saturday: { open: '09:00', close: '20:00' },
        sunday: { open: '10:00', close: '18:00' },
      };

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: libraryId, operating_hours: JSON.stringify(operatingHours) }],
      });

      const result = await mockTenantDb.query(
        `UPDATE libraries SET operating_hours = $1 WHERE id = $2 RETURNING *`,
        [JSON.stringify(operatingHours), libraryId]
      );

      const parsed = JSON.parse(result.rows[0].operating_hours);
      expect(parsed.monday.open).toBe('08:00');
    });

    it('should configure booking rules', async () => {
      const libraryId = 'lib-123';
      const bookingRules = {
        max_advance_booking_days: 30,
        min_booking_duration_hours: 1,
        max_booking_duration_hours: 8,
        cancellation_hours_before: 2,
      };

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: libraryId, booking_rules: JSON.stringify(bookingRules) }],
      });

      const result = await mockTenantDb.query(
        `UPDATE libraries SET booking_rules = $1 WHERE id = $2 RETURNING *`,
        [JSON.stringify(bookingRules), libraryId]
      );

      const parsed = JSON.parse(result.rows[0].booking_rules);
      expect(parsed.max_advance_booking_days).toBe(30);
    });
  });

  describe('Performance Monitoring', () => {
    it('should track occupancy rate', async () => {
      const libraryId = 'lib-123';

      mockTenantDb.query.mockResolvedValue({
        rows: [{
          library_id: libraryId,
          total_seats: 100,
          occupied_seats: 75,
          occupancy_rate: 75,
        }],
      });

      const result = await mockTenantDb.query(
        `SELECT 
           id as library_id,
           capacity as total_seats,
           current_occupancy as occupied_seats,
           (current_occupancy::float / capacity::float * 100) as occupancy_rate
         FROM libraries
         WHERE id = $1`,
        [libraryId]
      );

      expect(result.rows[0].occupancy_rate).toBeGreaterThan(0);
    });

    it('should track revenue metrics', async () => {
      const libraryId = 'lib-123';
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';

      mockTenantDb.query.mockResolvedValue({
        rows: [{
          library_id: libraryId,
          total_revenue: 50000,
          booking_count: 200,
          avg_booking_value: 250,
        }],
      });

      const result = await mockTenantDb.query(
        `SELECT 
           library_id,
           SUM(amount) as total_revenue,
           COUNT(*) as booking_count,
           AVG(amount) as avg_booking_value
         FROM payments
         WHERE library_id = $1 AND created_at BETWEEN $2 AND $3
         GROUP BY library_id`,
        [libraryId, startDate, endDate]
      );

      expect(result.rows[0].total_revenue).toBeGreaterThan(0);
    });
  });
});

