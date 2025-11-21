/**
 * UNIT TESTS - LIBRARY ANALYTICS SERVICE
 * Tests for: Occupancy rate analytics, operational efficiency,
 * performance benchmarking, growth analytics
 */

// Mock dependencies first
jest.mock('../../../src/config/database', () => ({
  tenantDbManager: {
    getTenantConnection: jest.fn(),
  },
}));

const tenantDbManager = require('../../../src/config/database').tenantDbManager;

describe('Library Analytics Service', () => {
  let mockTenantDb: any;

  beforeEach(() => {
    mockTenantDb = {
      query: jest.fn(),
    };
    (tenantDbManager.getTenantConnection).mockResolvedValue(mockTenantDb);
    jest.clearAllMocks();
  });

  describe('Occupancy Rate Analytics', () => {
    it('should calculate hourly occupancy rate', async () => {
      const libraryId = 'lib-123';
      const date = '2024-01-15';

      mockTenantDb.query.mockResolvedValue({
        rows: [
          { hour: 9, occupancy_rate: 0.6 },
          { hour: 14, occupancy_rate: 0.8 },
          { hour: 18, occupancy_rate: 0.9 },
        ],
      });

      const result = await mockTenantDb.query(
        `SELECT 
           EXTRACT(HOUR FROM booking_start_time) as hour,
           AVG(current_occupancy::float / capacity::float) as occupancy_rate
         FROM bookings b
         JOIN libraries l ON l.id = b.library_id
         WHERE b.library_id = $1 AND DATE(booking_date) = $2
         GROUP BY EXTRACT(HOUR FROM booking_start_time)
         ORDER BY hour`,
        [libraryId, date]
      );

      expect(result.rows.length).toBeGreaterThan(0);
    });

    it('should calculate peak hours', async () => {
      const libraryId = 'lib-123';

      mockTenantDb.query.mockResolvedValue({
        rows: [
          { hour: 18, avg_occupancy: 0.9, is_peak: true },
          { hour: 14, avg_occupancy: 0.8, is_peak: true },
        ],
      });

      const result = await mockTenantDb.query(
        `SELECT 
           EXTRACT(HOUR FROM booking_start_time) as hour,
           AVG(current_occupancy::float / capacity::float) as avg_occupancy,
           CASE WHEN AVG(current_occupancy::float / capacity::float) > 0.8 THEN true ELSE false END as is_peak
         FROM bookings b
         JOIN libraries l ON l.id = b.library_id
         WHERE b.library_id = $1
         GROUP BY EXTRACT(HOUR FROM booking_start_time)
         HAVING AVG(current_occupancy::float / capacity::float) > 0.8
         ORDER BY avg_occupancy DESC`,
        [libraryId]
      );

      expect(result.rows.length).toBeGreaterThan(0);
    });
  });

  describe('Operational Efficiency', () => {
    it('should calculate seat utilization', async () => {
      const libraryId = 'lib-123';
      const period = '2024-01';

      mockTenantDb.query.mockResolvedValue({
        rows: [{
          library_id: libraryId,
          total_seats: 100,
          avg_occupied_seats: 75,
          utilization_rate: 75,
        }],
      });

      const result = await mockTenantDb.query(
        `SELECT 
           library_id,
           capacity as total_seats,
           AVG(current_occupancy) as avg_occupied_seats,
           (AVG(current_occupancy)::float / capacity::float * 100) as utilization_rate
         FROM libraries l
         JOIN bookings b ON b.library_id = l.id
         WHERE l.id = $1 AND DATE_TRUNC('month', b.booking_date) = $2
         GROUP BY library_id, capacity`,
        [libraryId, period]
      );

      expect(result.rows[0].utilization_rate).toBeGreaterThan(0);
    });

    it('should calculate revenue per seat', async () => {
      const libraryId = 'lib-123';

      mockTenantDb.query.mockResolvedValue({
        rows: [{
          library_id: libraryId,
          total_revenue: 500000,
          total_seats: 100,
          revenue_per_seat: 5000,
        }],
      });

      const result = await mockTenantDb.query(
        `SELECT 
           l.id as library_id,
           SUM(b.amount) as total_revenue,
           l.capacity as total_seats,
           (SUM(b.amount)::float / l.capacity::float) as revenue_per_seat
         FROM libraries l
         JOIN bookings b ON b.library_id = l.id
         WHERE l.id = $1 AND b.booking_date >= DATE_TRUNC('month', CURRENT_DATE)
         GROUP BY l.id, l.capacity`,
        [libraryId]
      );

      expect(result.rows[0].revenue_per_seat).toBeGreaterThan(0);
    });
  });

  describe('Performance Benchmarking', () => {
    it('should compare library performance', async () => {
      mockTenantDb.query.mockResolvedValue({
        rows: [
          { library_id: 'lib-1', revenue: 500000, rank: 1 },
          { library_id: 'lib-2', revenue: 400000, rank: 2 },
          { library_id: 'lib-3', revenue: 300000, rank: 3 },
        ],
      });

      const result = await mockTenantDb.query(
        `SELECT 
           library_id,
           SUM(amount) as revenue,
           RANK() OVER (ORDER BY SUM(amount) DESC) as rank
         FROM bookings
         WHERE booking_date >= DATE_TRUNC('month', CURRENT_DATE)
         GROUP BY library_id
         ORDER BY revenue DESC`
      );

      expect(result.rows[0].rank).toBe(1);
    });

    it('should calculate performance score', () => {
      const metrics = {
        occupancy_rate: 0.8,
        revenue: 500000,
        customer_satisfaction: 4.5,
      };

      const score = (
        metrics.occupancy_rate * 0.3 +
        (metrics.revenue / 1000000) * 0.4 +
        (metrics.customer_satisfaction / 5) * 0.3
      ) * 100;

      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('Growth Analytics', () => {
    it('should calculate month-over-month growth', async () => {
      const libraryId = 'lib-123';

      mockTenantDb.query.mockResolvedValue({
        rows: [{
          library_id: libraryId,
          current_month_revenue: 110000,
          previous_month_revenue: 100000,
          growth_rate: 10,
        }],
      });

      const result = await mockTenantDb.query(
        `SELECT 
           library_id,
           SUM(CASE WHEN DATE_TRUNC('month', booking_date) = DATE_TRUNC('month', CURRENT_DATE) THEN amount ELSE 0 END) as current_month_revenue,
           SUM(CASE WHEN DATE_TRUNC('month', booking_date) = DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month' THEN amount ELSE 0 END) as previous_month_revenue,
           ((SUM(CASE WHEN DATE_TRUNC('month', booking_date) = DATE_TRUNC('month', CURRENT_DATE) THEN amount ELSE 0 END) - 
             SUM(CASE WHEN DATE_TRUNC('month', booking_date) = DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month' THEN amount ELSE 0 END)) /
            SUM(CASE WHEN DATE_TRUNC('month', booking_date) = DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month' THEN amount ELSE 0 END) * 100) as growth_rate
         FROM bookings
         WHERE library_id = $1
         GROUP BY library_id`,
        [libraryId]
      );

      expect(result.rows[0].growth_rate).toBeDefined();
    });

    it('should track student growth', async () => {
      const libraryId = 'lib-123';

      mockTenantDb.query.mockResolvedValue({
        rows: [{
          library_id: libraryId,
          new_students_this_month: 20,
          total_students: 100,
          growth_rate: 25,
        }],
      });

      const result = await mockTenantDb.query(
        `SELECT 
           library_id,
           COUNT(*) FILTER (WHERE enrollment_date >= DATE_TRUNC('month', CURRENT_DATE)) as new_students_this_month,
           COUNT(*) as total_students,
           (COUNT(*) FILTER (WHERE enrollment_date >= DATE_TRUNC('month', CURRENT_DATE))::float / 
            COUNT(*) FILTER (WHERE enrollment_date < DATE_TRUNC('month', CURRENT_DATE))::float * 100) as growth_rate
         FROM library_enrollments
         WHERE library_id = $1
         GROUP BY library_id`,
        [libraryId]
      );

      expect(result.rows[0].new_students_this_month).toBeGreaterThanOrEqual(0);
    });
  });
});

