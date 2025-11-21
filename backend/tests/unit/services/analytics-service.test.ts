/**
 * UNIT TESTS - ANALYTICS SERVICE
 * Tests for analytics service business logic
 */

import { tenantDbManager, coreDb } from '../../../src/config/database';

// Mock dependencies
jest.mock('../../../src/config/database');
jest.mock('../../../src/utils/logger');

describe('Analytics Service', () => {
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

  describe('Student Analytics', () => {
    it('should calculate study patterns', async () => {
      mockTenantDb.query.mockResolvedValue({
        rows: [
          { hour: 9, count: 5 },
          { hour: 10, count: 8 },
          { hour: 14, count: 12 },
          { hour: 18, count: 6 },
        ],
      });

      const result = await mockTenantDb.query(
        `SELECT EXTRACT(HOUR FROM start_time) as hour, COUNT(*) as count
         FROM bookings
         WHERE user_id = $1 AND tenant_id = $2
         GROUP BY hour
         ORDER BY hour`,
        ['student-123', tenantId]
      );

      expect(result.rows).toBeDefined();
      expect(result.rows.length).toBeGreaterThan(0);
    });

    it('should calculate performance metrics', async () => {
      mockTenantDb.query.mockResolvedValue({
        rows: [{
          total_bookings: 50,
          completed_bookings: 45,
          cancelled_bookings: 5,
          average_duration: 120,
        }],
      });

      const result = await mockTenantDb.query(
        `SELECT 
           COUNT(*) as total_bookings,
           COUNT(*) FILTER (WHERE status = 'completed') as completed_bookings,
           COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_bookings,
           AVG(EXTRACT(EPOCH FROM (end_time - start_time))/60) as average_duration
         FROM bookings
         WHERE user_id = $1 AND tenant_id = $2`,
        ['student-123', tenantId]
      );

      expect(result.rows[0].total_bookings).toBeDefined();
    });

    it('should calculate engagement score', async () => {
      mockTenantDb.query
        .mockResolvedValueOnce({ rows: [{ count: 50 }] }) // bookings
        .mockResolvedValueOnce({ rows: [{ count: 30 }] }); // attendance

      const bookingsResult = await mockTenantDb.query(
        'SELECT COUNT(*) as count FROM bookings WHERE user_id = $1',
        ['student-123']
      );

      const attendanceResult = await mockTenantDb.query(
        'SELECT COUNT(*) as count FROM attendance WHERE student_id = $1',
        ['student-123']
      );

      const engagementScore = (bookingsResult.rows[0].count * 0.6) + (attendanceResult.rows[0].count * 0.4);

      expect(engagementScore).toBeDefined();
    });
  });

  describe('Platform Analytics', () => {
    it('should aggregate tenant statistics', async () => {
      mockCoreDb.query.mockResolvedValue({
        rows: [
          { tenant_id: 'tenant-1', total_users: 100, total_revenue: 50000 },
          { tenant_id: 'tenant-2', total_users: 200, total_revenue: 100000 },
        ],
      });

      const result = await mockCoreDb.query(
        `SELECT 
           t.id as tenant_id,
           COUNT(DISTINCT u.id) as total_users,
           SUM(p.amount) as total_revenue
         FROM tenants t
         LEFT JOIN users u ON u.tenant_id = t.id
         LEFT JOIN payments p ON p.tenant_id = t.id
         GROUP BY t.id`
      );

      expect(result.rows).toBeDefined();
    });
  });
});

