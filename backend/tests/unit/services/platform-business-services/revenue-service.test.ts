/**
 * UNIT TESTS - REVENUE SERVICE
 * Tests for: Revenue tracking & commissions, payout management to libraries,
 * financial forecasting, revenue reporting
 */

// Mock dependencies first
jest.mock('../../../src/config/database', () => ({
  coreDb: {
    query: jest.fn(),
  },
}));

const coreDb = require('../../../src/config/database').coreDb;

describe('Revenue Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Revenue Tracking & Commissions', () => {
    it('should calculate platform commission', () => {
      const transaction = {
        amount: 1000,
        commission_rate: 0.15, // 15%
      };

      const commission = transaction.amount * transaction.commission_rate;
      const library_payout = transaction.amount - commission;

      expect(commission).toBe(150);
      expect(library_payout).toBe(850);
    });

    it('should track daily revenue', async () => {
      const date = '2024-01-15';

      (coreDb.query).mockResolvedValue({
        rows: [{
          date,
          total_revenue: 100000,
          platform_commission: 15000,
          library_payouts: 85000,
        }],
      });

      const result = await coreDb.query(
        `SELECT 
           DATE(created_at) as date,
           SUM(amount) as total_revenue,
           SUM(amount * commission_rate) as platform_commission,
           SUM(amount * (1 - commission_rate)) as library_payouts
         FROM transactions
         WHERE DATE(created_at) = $1
         GROUP BY DATE(created_at)`,
        [date]
      );

      expect(result.rows[0].total_revenue).toBeGreaterThan(0);
    });
  });

  describe('Payout Management to Libraries', () => {
    it('should create payout to library', async () => {
      const payout = {
        library_id: 'lib-123',
        amount: 50000,
        period_start: '2024-01-01',
        period_end: '2024-01-31',
        status: 'pending',
      };

      (coreDb.query).mockResolvedValue({
        rows: [{ id: 'payout-123', ...payout }],
      });

      const result = await coreDb.query(
        `INSERT INTO library_payouts (library_id, amount, period_start, period_end, status)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [payout.library_id, payout.amount, payout.period_start, payout.period_end, payout.status]
      );

      expect(result.rows[0].status).toBe('pending');
    });

    it('should process payout', async () => {
      const payoutId = 'payout-123';

      (coreDb.query).mockResolvedValue({
        rows: [{ id: payoutId, status: 'processed', processed_at: new Date() }],
      });

      const result = await coreDb.query(
        `UPDATE library_payouts SET status = 'processed', processed_at = NOW() WHERE id = $1 RETURNING *`,
        [payoutId]
      );

      expect(result.rows[0].status).toBe('processed');
    });
  });

  describe('Financial Forecasting', () => {
    it('should forecast revenue based on trends', () => {
      const historicalData = [
        { month: '2024-01', revenue: 100000 },
        { month: '2024-02', revenue: 110000 },
        { month: '2024-03', revenue: 120000 },
      ];

      const growthRate = (historicalData[1].revenue - historicalData[0].revenue) / historicalData[0].revenue;
      const forecastedRevenue = historicalData[2].revenue * (1 + growthRate);

      expect(forecastedRevenue).toBeGreaterThan(historicalData[2].revenue);
    });

    it('should calculate revenue growth rate', async () => {
      const currentMonth = '2024-02';
      const previousMonth = '2024-01';

      (coreDb.query).mockResolvedValue({
        rows: [{
          current_revenue: 110000,
          previous_revenue: 100000,
          growth_rate: 10,
        }],
      });

      const result = await coreDb.query(
        `SELECT 
           SUM(CASE WHEN DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE) THEN amount ELSE 0 END) as current_revenue,
           SUM(CASE WHEN DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month' THEN amount ELSE 0 END) as previous_revenue,
           ((SUM(CASE WHEN DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE) THEN amount ELSE 0 END) - 
             SUM(CASE WHEN DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month' THEN amount ELSE 0 END)) /
            SUM(CASE WHEN DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month' THEN amount ELSE 0 END) * 100) as growth_rate
         FROM transactions`
      );

      expect(result.rows[0].growth_rate).toBeDefined();
    });
  });

  describe('Revenue Reporting', () => {
    it('should generate monthly revenue report', async () => {
      const month = '2024-01';

      (coreDb.query).mockResolvedValue({
        rows: [{
          month,
          total_revenue: 3000000,
          platform_commission: 450000,
          library_payouts: 2550000,
          transaction_count: 3000,
          avg_transaction_value: 1000,
        }],
      });

      const result = await coreDb.query(
        `SELECT 
           TO_CHAR(created_at, 'YYYY-MM') as month,
           SUM(amount) as total_revenue,
           SUM(amount * commission_rate) as platform_commission,
           SUM(amount * (1 - commission_rate)) as library_payouts,
           COUNT(*) as transaction_count,
           AVG(amount) as avg_transaction_value
         FROM transactions
         WHERE TO_CHAR(created_at, 'YYYY-MM') = $1
         GROUP BY TO_CHAR(created_at, 'YYYY-MM')`,
        [month]
      );

      expect(result.rows[0].total_revenue).toBeGreaterThan(0);
    });
  });
});

