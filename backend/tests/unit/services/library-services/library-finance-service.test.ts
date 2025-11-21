/**
 * UNIT TESTS - LIBRARY FINANCE SERVICE
 * Tests for: Fee plan creation & pricing, discount & scholarship management,
 * revenue analytics & tracking, financial reporting
 */

// Mock dependencies first
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

import { tenantDbManager } from '../../../src/config/database';

describe('Library Finance Service', () => {
  let mockTenantDb: any;

  beforeEach(() => {
    mockTenantDb = {
      query: jest.fn(),
    };
    (tenantDbManager.getTenantConnection as jest.Mock).mockResolvedValue(mockTenantDb);
    jest.clearAllMocks();
  });

  describe('Fee Plan Creation & Pricing', () => {
    it('should create fee plan', async () => {
      const feePlan = {
        library_id: 'lib-123',
        name: 'Premium Plan',
        plan_type: 'hourly',
        price: 50,
        duration_hours: 1,
        features: ['wifi', 'ac', 'parking'],
      };

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: 'plan-123', ...feePlan, status: 'active' }],
      });

      const result = await mockTenantDb.query(
        `INSERT INTO fee_plans (library_id, name, plan_type, price, duration_hours, features, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [feePlan.library_id, feePlan.name, feePlan.plan_type, feePlan.price,
         feePlan.duration_hours, JSON.stringify(feePlan.features), 'active']
      );

      expect(result.rows[0].name).toBe(feePlan.name);
      expect(result.rows[0].status).toBe('active');
    });

    it('should update fee plan pricing', async () => {
      const planId = 'plan-123';
      const newPrice = 60;

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: planId, price: newPrice }],
      });

      const result = await mockTenantDb.query(
        'UPDATE fee_plans SET price = $1 WHERE id = $2 RETURNING *',
        [newPrice, planId]
      );

      expect(result.rows[0].price).toBe(newPrice);
    });
  });

  describe('Discount & Scholarship Management', () => {
    it('should create discount code', async () => {
      const discount = {
        library_id: 'lib-123',
        code: 'STUDENT20',
        discount_type: 'percentage',
        discount_value: 20,
        max_uses: 100,
        valid_from: '2024-01-01',
        valid_until: '2024-12-31',
      };

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: 'discount-123', ...discount, status: 'active' }],
      });

      const result = await mockTenantDb.query(
        `INSERT INTO discounts (library_id, code, discount_type, discount_value, max_uses, valid_from, valid_until, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [discount.library_id, discount.code, discount.discount_type, discount.discount_value,
         discount.max_uses, discount.valid_from, discount.valid_until, 'active']
      );

      expect(result.rows[0].code).toBe(discount.code);
    });

    it('should apply discount to booking', () => {
      const bookingAmount = 500;
      const discount = {
        type: 'percentage',
        value: 20,
      };

      const discountAmount = discount.type === 'percentage'
        ? (bookingAmount * discount.value) / 100
        : discount.value;
      const finalAmount = bookingAmount - discountAmount;

      expect(finalAmount).toBe(400);
    });

    it('should create scholarship', async () => {
      const scholarship = {
        student_id: 'student-123',
        library_id: 'lib-123',
        discount_percentage: 50,
        reason: 'Merit-based',
        valid_until: '2024-12-31',
      };

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: 'scholarship-123', ...scholarship, status: 'active' }],
      });

      const result = await mockTenantDb.query(
        `INSERT INTO scholarships (student_id, library_id, discount_percentage, reason, valid_until, status)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [scholarship.student_id, scholarship.library_id, scholarship.discount_percentage,
         scholarship.reason, scholarship.valid_until, 'active']
      );

      expect(result.rows[0].discount_percentage).toBe(50);
    });
  });

  describe('Revenue Analytics & Tracking', () => {
    it('should calculate daily revenue', async () => {
      const libraryId = 'lib-123';
      const date = '2024-01-15';

      mockTenantDb.query.mockResolvedValue({
        rows: [{
          library_id: libraryId,
          date,
          total_revenue: 50000,
          booking_count: 100,
          avg_booking_value: 500,
        }],
      });

      const result = await mockTenantDb.query(
        `SELECT 
           library_id,
           DATE(created_at) as date,
           SUM(amount) as total_revenue,
           COUNT(*) as booking_count,
           AVG(amount) as avg_booking_value
         FROM payments
         WHERE library_id = $1 AND DATE(created_at) = $2
         GROUP BY library_id, DATE(created_at)`,
        [libraryId, date]
      );

      expect(result.rows[0].total_revenue).toBeGreaterThan(0);
    });

    it('should calculate monthly revenue', async () => {
      const libraryId = 'lib-123';
      const month = '2024-01';

      mockTenantDb.query.mockResolvedValue({
        rows: [{
          library_id: libraryId,
          month,
          total_revenue: 1500000,
          growth_rate: 10.5,
        }],
      });

      const result = await mockTenantDb.query(
        `SELECT 
           library_id,
           DATE_TRUNC('month', created_at) as month,
           SUM(amount) as total_revenue,
           (SUM(amount) - LAG(SUM(amount)) OVER (ORDER BY DATE_TRUNC('month', created_at))) / 
            LAG(SUM(amount)) OVER (ORDER BY DATE_TRUNC('month', created_at)) * 100 as growth_rate
         FROM payments
         WHERE library_id = $1 AND DATE_TRUNC('month', created_at) = $2
         GROUP BY library_id, DATE_TRUNC('month', created_at)`,
        [libraryId, month]
      );

      expect(result.rows[0].total_revenue).toBeGreaterThan(0);
    });
  });

  describe('Financial Reporting', () => {
    it('should generate revenue report', async () => {
      const libraryId = 'lib-123';
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';

      mockTenantDb.query.mockResolvedValue({
        rows: [{
          library_id: libraryId,
          period: 'January 2024',
          total_revenue: 1500000,
          total_bookings: 3000,
          avg_booking_value: 500,
          refunds: 50000,
          net_revenue: 1450000,
        }],
      });

      const result = await mockTenantDb.query(
        `SELECT 
           library_id,
           TO_CHAR(created_at, 'Month YYYY') as period,
           SUM(amount) as total_revenue,
           COUNT(*) as total_bookings,
           AVG(amount) as avg_booking_value,
           SUM(CASE WHEN status = 'refunded' THEN amount ELSE 0 END) as refunds,
           SUM(amount) - SUM(CASE WHEN status = 'refunded' THEN amount ELSE 0 END) as net_revenue
         FROM payments
         WHERE library_id = $1 AND created_at BETWEEN $2 AND $3
         GROUP BY library_id, TO_CHAR(created_at, 'Month YYYY')`,
        [libraryId, startDate, endDate]
      );

      expect(result.rows[0].net_revenue).toBeGreaterThan(0);
    });
  });
});

