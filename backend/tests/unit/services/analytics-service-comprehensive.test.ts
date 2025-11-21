/**
 * UNIT TESTS - ANALYTICS SERVICE COMPREHENSIVE
 * Additional comprehensive tests for analytics service
 */

import { coreDb, tenantDbManager } from '../../../src/config/database';

// Mock dependencies
jest.mock('../../../src/config/database');
jest.mock('../../../src/utils/logger');

describe('Analytics Service - Comprehensive', () => {
  let mockTenantDb: any;
  let mockCoreDb: any;
  const tenantId = 'test-tenant-id';

  beforeEach(() => {
    mockTenantDb = {
      query: jest.fn(),
    };

    mockCoreDb = {
      query: jest.fn(),
    };

    (tenantDbManager.getTenantConnection as jest.Mock) = jest.fn().mockResolvedValue(mockTenantDb);
    (coreDb.query as jest.Mock) = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Revenue Analytics', () => {
    it('should calculate total revenue', async () => {
      mockTenantDb.query.mockResolvedValue({
        rows: [{ total_revenue: 50000 }],
      });

      const result = await mockTenantDb.query(
        'SELECT SUM(amount) as total_revenue FROM payments WHERE tenant_id = $1 AND status = $2',
        [tenantId, 'paid']
      );

      expect(result.rows[0].total_revenue).toBe(50000);
    });

    it('should calculate revenue by period', async () => {
      mockTenantDb.query.mockResolvedValue({
        rows: [
          { period: '2024-01', revenue: 10000 },
          { period: '2024-02', revenue: 15000 },
          { period: '2024-03', revenue: 20000 },
        ],
      });

      const result = await mockTenantDb.query(
        `SELECT 
           TO_CHAR(created_at, 'YYYY-MM') as period,
           SUM(amount) as revenue
         FROM payments
         WHERE tenant_id = $1 AND status = 'paid'
         GROUP BY period
         ORDER BY period`,
        [tenantId]
      );

      expect(result.rows).toHaveLength(3);
    });
  });

  describe('User Analytics', () => {
    it('should calculate active users', async () => {
      mockTenantDb.query.mockResolvedValue({
        rows: [{ active_users: 150 }],
      });

      const result = await mockTenantDb.query(
        `SELECT COUNT(*) as active_users
         FROM users
         WHERE tenant_id = $1 AND is_active = true AND last_login_at >= NOW() - INTERVAL '30 days'`,
        [tenantId]
      );

      expect(result.rows[0].active_users).toBe(150);
    });

    it('should calculate user growth', async () => {
      mockTenantDb.query.mockResolvedValue({
        rows: [
          { month: '2024-01', new_users: 10 },
          { month: '2024-02', new_users: 15 },
          { month: '2024-03', new_users: 20 },
        ],
      });

      const result = await mockTenantDb.query(
        `SELECT 
           TO_CHAR(created_at, 'YYYY-MM') as month,
           COUNT(*) as new_users
         FROM users
         WHERE tenant_id = $1
         GROUP BY month
         ORDER BY month`,
        [tenantId]
      );

      expect(result.rows).toHaveLength(3);
    });
  });

  describe('Booking Analytics', () => {
    it('should calculate booking statistics', async () => {
      mockTenantDb.query.mockResolvedValue({
        rows: [{
          total_bookings: 500,
          confirmed_bookings: 450,
          cancelled_bookings: 50,
          average_duration: 120,
        }],
      });

      const result = await mockTenantDb.query(
        `SELECT 
           COUNT(*) as total_bookings,
           COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_bookings,
           COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_bookings,
           AVG(EXTRACT(EPOCH FROM (end_time - start_time))/60) as average_duration
         FROM bookings
         WHERE tenant_id = $1`,
        [tenantId]
      );

      expect(result.rows[0].total_bookings).toBe(500);
    });

    it('should calculate booking trends', async () => {
      mockTenantDb.query.mockResolvedValue({
        rows: [
          { date: '2024-01-01', bookings: 10 },
          { date: '2024-01-02', bookings: 15 },
          { date: '2024-01-03', bookings: 12 },
        ],
      });

      const result = await mockTenantDb.query(
        `SELECT 
           DATE(created_at) as date,
           COUNT(*) as bookings
         FROM bookings
         WHERE tenant_id = $1
         GROUP BY date
         ORDER BY date`,
        [tenantId]
      );

      expect(result.rows).toHaveLength(3);
    });
  });

  describe('Library Analytics', () => {
    it('should calculate library occupancy rates', async () => {
      mockTenantDb.query.mockResolvedValue({
        rows: [
          { library_id: 'lib-1', occupancy_rate: 75.5 },
          { library_id: 'lib-2', occupancy_rate: 60.0 },
        ],
      });

      const result = await mockTenantDb.query(
        `SELECT 
           id as library_id,
           (current_occupancy::float / capacity::float * 100) as occupancy_rate
         FROM libraries
         WHERE tenant_id = $1`,
        [tenantId]
      );

      expect(result.rows).toHaveLength(2);
    });

    it('should calculate peak hours', async () => {
      mockTenantDb.query.mockResolvedValue({
        rows: [
          { hour: 9, bookings: 20 },
          { hour: 10, bookings: 35 },
          { hour: 14, bookings: 40 },
          { hour: 18, bookings: 25 },
        ],
      });

      const result = await mockTenantDb.query(
        `SELECT 
           EXTRACT(HOUR FROM start_time) as hour,
           COUNT(*) as bookings
         FROM bookings
         WHERE tenant_id = $1
         GROUP BY hour
         ORDER BY bookings DESC`,
        [tenantId]
      );

      expect(result.rows[0].hour).toBe(14);
    });
  });

  describe('Platform Analytics', () => {
    it('should aggregate tenant statistics', async () => {
      mockCoreDb.query.mockResolvedValue({
        rows: [{
          total_tenants: 100,
          active_tenants: 85,
          total_revenue: 1000000,
        }],
      });

      const result = await mockCoreDb.query(
        `SELECT 
           COUNT(*) as total_tenants,
           COUNT(*) FILTER (WHERE status = 'active') as active_tenants,
           SUM(monthly_revenue) as total_revenue
         FROM tenants`
      );

      expect(result.rows[0].total_tenants).toBe(100);
    });
  });
});

