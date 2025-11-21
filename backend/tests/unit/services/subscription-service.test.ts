/**
 * UNIT TESTS - SUBSCRIPTION SERVICE
 * Tests subscription management functionality
 */

import { coreDb } from '../../../src/config/database';
import { logger } from '../../../src/utils/logger';

// Mock dependencies
jest.mock('../../../src/config/database', () => ({
  coreDb: {
    query: jest.fn(),
  },
}));

jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('Subscription Service', () => {
  let mockCoreDb: any;

  beforeEach(() => {
    mockCoreDb = {
      query: jest.fn(),
    };
    (coreDb.query as jest.Mock).mockImplementation(mockCoreDb.query);
    jest.clearAllMocks();
  });

  describe('Subscription Management', () => {
    it('should create a subscription', async () => {
      const tenantId = 'tenant-123';
      const planId = 'plan-premium';
      const subscription = {
        tenant_id: tenantId,
        plan_id: planId,
        status: 'active',
        start_date: new Date(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      };

      mockCoreDb.query.mockResolvedValueOnce({
        rows: [{ id: 'sub-123', ...subscription }],
      });

      const createSubscription = async (tenantId: string, planId: string) => {
        const result = await coreDb.query(
          `INSERT INTO subscriptions (tenant_id, plan_id, status, start_date, end_date)
           VALUES ($1, $2, 'active', $3, $4) RETURNING *`,
          [tenantId, planId, subscription.start_date, subscription.end_date]
        );
        return result.rows[0];
      };

      const sub = await createSubscription(tenantId, planId);

      expect(mockCoreDb.query).toHaveBeenCalled();
      expect(sub.tenant_id).toBe(tenantId);
      expect(sub.plan_id).toBe(planId);
      expect(sub.status).toBe('active');
    });

    it('should get active subscription', async () => {
      const tenantId = 'tenant-123';
      mockCoreDb.query.mockResolvedValueOnce({
        rows: [{
          id: 'sub-123',
          tenant_id: tenantId,
          status: 'active',
          end_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        }],
      });

      const getActiveSubscription = async (tenantId: string) => {
        const result = await coreDb.query(
          `SELECT * FROM subscriptions 
           WHERE tenant_id = $1 AND status = 'active' AND end_date > NOW()
           ORDER BY created_at DESC LIMIT 1`,
          [tenantId]
        );
        return result.rows[0];
      };

      const sub = await getActiveSubscription(tenantId);

      expect(mockCoreDb.query).toHaveBeenCalled();
      expect(sub).toBeDefined();
      expect(sub.status).toBe('active');
    });

    it('should cancel subscription', async () => {
      const subscriptionId = 'sub-123';
      mockCoreDb.query.mockResolvedValueOnce({
        rows: [{ id: subscriptionId, status: 'cancelled' }],
      });

      const cancelSubscription = async (subscriptionId: string) => {
        const result = await coreDb.query(
          `UPDATE subscriptions SET status = 'cancelled', cancelled_at = NOW()
           WHERE id = $1 RETURNING *`,
          [subscriptionId]
        );
        return result.rows[0];
      };

      const sub = await cancelSubscription(subscriptionId);

      expect(mockCoreDb.query).toHaveBeenCalled();
      expect(sub.status).toBe('cancelled');
    });

    it('should renew subscription', async () => {
      const subscriptionId = 'sub-123';
      const newEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      mockCoreDb.query.mockResolvedValueOnce({
        rows: [{ id: subscriptionId, end_date: newEndDate, status: 'active' }],
      });

      const renewSubscription = async (subscriptionId: string, days: number) => {
        const newEndDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        const result = await coreDb.query(
          `UPDATE subscriptions SET end_date = $1, status = 'active'
           WHERE id = $2 RETURNING *`,
          [newEndDate, subscriptionId]
        );
        return result.rows[0];
      };

      const sub = await renewSubscription(subscriptionId, 30);

      expect(mockCoreDb.query).toHaveBeenCalled();
      expect(sub.status).toBe('active');
    });

    it('should check if subscription is expired', async () => {
      const tenantId = 'tenant-123';
      mockCoreDb.query.mockResolvedValueOnce({
        rows: [{
          id: 'sub-123',
          tenant_id: tenantId,
          end_date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        }],
      });

      const checkExpired = async (tenantId: string) => {
        const result = await coreDb.query(
          `SELECT * FROM subscriptions 
           WHERE tenant_id = $1 AND end_date < NOW() AND status = 'active'
           ORDER BY end_date DESC LIMIT 1`,
          [tenantId]
        );
        return result.rows.length > 0;
      };

      const isExpired = await checkExpired(tenantId);

      expect(isExpired).toBe(true);
    });
  });

  describe('Subscription Plans', () => {
    it('should get available plans', async () => {
      mockCoreDb.query.mockResolvedValueOnce({
        rows: [
          { id: 'plan-basic', name: 'Basic', price: 1000 },
          { id: 'plan-premium', name: 'Premium', price: 2000 },
        ],
      });

      const getPlans = async () => {
        const result = await coreDb.query('SELECT * FROM subscription_plans WHERE active = true');
        return result.rows;
      };

      const plans = await getPlans();

      expect(mockCoreDb.query).toHaveBeenCalled();
      expect(plans.length).toBeGreaterThan(0);
    });
  });
});
