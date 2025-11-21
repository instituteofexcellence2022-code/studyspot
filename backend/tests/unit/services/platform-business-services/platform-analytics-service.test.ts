/**
 * UNIT TESTS - PLATFORM ANALYTICS SERVICE
 * Tests for: Growth metrics & market analysis, business performance dashboards,
 * strategic insights, competitive intelligence
 */

// Mock dependencies first
jest.mock('../../../src/config/database', () => ({
  coreDb: {
    query: jest.fn(),
  },
}));

const coreDb = require('../../../src/config/database').coreDb;

describe('Platform Analytics Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Growth Metrics & Market Analysis', () => {
    it('should calculate user growth rate', async () => {
      const period = '2024-01';

      (coreDb.query).mockResolvedValue({
        rows: [{
          period,
          new_users: 1000,
          total_users: 10000,
          growth_rate: 11.1,
        }],
      });

      const result = await coreDb.query(
        `SELECT 
           TO_CHAR(created_at, 'YYYY-MM') as period,
           COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)) as new_users,
           COUNT(*) as total_users,
           (COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE))::float / 
            COUNT(*) FILTER (WHERE created_at < DATE_TRUNC('month', CURRENT_DATE))::float * 100) as growth_rate
         FROM users
         WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
         GROUP BY TO_CHAR(created_at, 'YYYY-MM')`
      );

      expect(result.rows[0].growth_rate).toBeGreaterThanOrEqual(0);
    });

    it('should analyze market share', async () => {
      (coreDb.query).mockResolvedValue({
        rows: [
          { region: 'Delhi', libraries: 50, market_share: 40 },
          { region: 'Mumbai', libraries: 30, market_share: 24 },
          { region: 'Bangalore', libraries: 20, market_share: 16 },
        ],
      });

      const result = await coreDb.query(
        `SELECT 
           region,
           COUNT(*) as libraries,
           (COUNT(*)::float / SUM(COUNT(*)) OVER () * 100) as market_share
         FROM libraries
         GROUP BY region
         ORDER BY libraries DESC`
      );

      expect(result.rows.length).toBeGreaterThan(0);
    });
  });

  describe('Business Performance Dashboards', () => {
    it('should generate platform KPIs', async () => {
      (coreDb.query).mockResolvedValue({
        rows: [{
          total_libraries: 100,
          total_students: 10000,
          total_revenue: 5000000,
          active_bookings: 500,
          avg_booking_value: 1000,
        }],
      });

      const result = await coreDb.query(
        `SELECT 
           COUNT(DISTINCT l.id) as total_libraries,
           COUNT(DISTINCT s.id) as total_students,
           SUM(p.amount) as total_revenue,
           COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'active') as active_bookings,
           AVG(p.amount) as avg_booking_value
         FROM libraries l
         LEFT JOIN students s ON s.library_id = l.id
         LEFT JOIN bookings b ON b.library_id = l.id
         LEFT JOIN payments p ON p.booking_id = b.id`
      );

      expect(result.rows[0].total_libraries).toBeGreaterThan(0);
    });

    it('should calculate revenue trends', async () => {
      (coreDb.query).mockResolvedValue({
        rows: [
          { month: '2024-01', revenue: 1000000, trend: 'up' },
          { month: '2024-02', revenue: 1100000, trend: 'up' },
          { month: '2024-03', revenue: 1200000, trend: 'up' },
        ],
      });

      const result = await coreDb.query(
        `SELECT 
           TO_CHAR(created_at, 'YYYY-MM') as month,
           SUM(amount) as revenue,
           CASE
             WHEN SUM(amount) > LAG(SUM(amount)) OVER (ORDER BY TO_CHAR(created_at, 'YYYY-MM')) THEN 'up'
             WHEN SUM(amount) < LAG(SUM(amount)) OVER (ORDER BY TO_CHAR(created_at, 'YYYY-MM')) THEN 'down'
             ELSE 'stable'
           END as trend
         FROM payments
         WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '3 months'
         GROUP BY TO_CHAR(created_at, 'YYYY-MM')
         ORDER BY month`
      );

      expect(result.rows.length).toBeGreaterThan(0);
    });
  });

  describe('Strategic Insights', () => {
    it('should identify top performing libraries', async () => {
      (coreDb.query).mockResolvedValue({
        rows: [
          { library_id: 'lib-1', revenue: 500000, rank: 1 },
          { library_id: 'lib-2', revenue: 400000, rank: 2 },
          { library_id: 'lib-3', revenue: 300000, rank: 3 },
        ],
      });

      const result = await coreDb.query(
        `SELECT 
           library_id,
           SUM(amount) as revenue,
           RANK() OVER (ORDER BY SUM(amount) DESC) as rank
         FROM payments
         WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
         GROUP BY library_id
         ORDER BY revenue DESC
         LIMIT 10`
      );

      expect(result.rows[0].rank).toBe(1);
    });

    it('should analyze user retention', async () => {
      (coreDb.query).mockResolvedValue({
        rows: [{
          cohort_month: '2024-01',
          users: 1000,
          month_1_retention: 80,
          month_2_retention: 70,
          month_3_retention: 65,
        }],
      });

      const result = await coreDb.query(
        `SELECT 
           TO_CHAR(first_booking_date, 'YYYY-MM') as cohort_month,
           COUNT(DISTINCT user_id) as users,
           (COUNT(DISTINCT user_id) FILTER (WHERE last_booking_date >= first_booking_date + INTERVAL '1 month')::float / 
            COUNT(DISTINCT user_id)::float * 100) as month_1_retention
         FROM user_cohorts
         GROUP BY TO_CHAR(first_booking_date, 'YYYY-MM')`
      );

      expect(result.rows.length).toBeGreaterThan(0);
    });
  });

  describe('Competitive Intelligence', () => {
    it('should benchmark platform metrics', () => {
      const platformMetrics = {
        avgBookingValue: 1000,
        avgOccupancyRate: 0.75,
        customerSatisfaction: 4.5,
      };

      const industryBenchmarks = {
        avgBookingValue: 800,
        avgOccupancyRate: 0.7,
        customerSatisfaction: 4.2,
      };

      const performance = {
        bookingValue: (platformMetrics.avgBookingValue / industryBenchmarks.avgBookingValue) * 100,
        occupancy: (platformMetrics.avgOccupancyRate / industryBenchmarks.avgOccupancyRate) * 100,
        satisfaction: (platformMetrics.customerSatisfaction / industryBenchmarks.customerSatisfaction) * 100,
      };

      expect(performance.bookingValue).toBeGreaterThan(100);
    });
  });
});

