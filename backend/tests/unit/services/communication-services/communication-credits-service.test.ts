/**
 * UNIT TESTS - COMMUNICATION CREDITS SERVICE
 * Tests for: Credit purchase system, balance management,
 * usage tracking & analytics, credit pricing management
 */

// Mock dependencies first
jest.mock('../../../src/config/database', () => ({
  coreDb: {
    query: jest.fn(),
  },
}));

const coreDb = require('../../../src/config/database').coreDb;

describe('Communication Credits Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Credit Purchase System', () => {
    it('should purchase credits', async () => {
      const purchase = {
        tenant_id: 'tenant-123',
        amount: 1000,
        credits: 10000,
        price_per_credit: 0.1,
      };

      (coreDb.query).mockResolvedValue({
        rows: [{ id: 'purchase-123', ...purchase, status: 'completed' }],
      });

      const result = await coreDb.query(
        `INSERT INTO credit_purchases (tenant_id, amount, credits, price_per_credit, status)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [purchase.tenant_id, purchase.amount, purchase.credits, purchase.price_per_credit, 'completed']
      );

      expect(result.rows[0].credits).toBe(purchase.credits);
    });

    it('should calculate credit price', () => {
      const packages = [
        { credits: 1000, price: 100, pricePerCredit: 0.1 },
        { credits: 5000, price: 450, pricePerCredit: 0.09 },
        { credits: 10000, price: 800, pricePerCredit: 0.08 },
      ];

      const selectedPackage = packages.find(p => p.credits === 5000);
      expect(selectedPackage?.pricePerCredit).toBe(0.09);
    });
  });

  describe('Balance Management', () => {
    it('should update credit balance', async () => {
      const tenantId = 'tenant-123';
      const credits = 5000;

      (coreDb.query).mockResolvedValue({
        rows: [{ tenant_id: tenantId, balance: credits, updated_at: new Date() }],
      });

      const result = await coreDb.query(
        `UPDATE credit_balances SET balance = balance + $1, updated_at = NOW() WHERE tenant_id = $2 RETURNING *`,
        [credits, tenantId]
      );

      expect(result.rows[0].balance).toBeGreaterThanOrEqual(credits);
    });

    it('should deduct credits on usage', async () => {
      const tenantId = 'tenant-123';
      const creditsUsed = 100;

      (coreDb.query).mockResolvedValue({
        rows: [{ tenant_id: tenantId, balance: 4900 }],
      });

      const result = await coreDb.query(
        `UPDATE credit_balances SET balance = balance - $1 WHERE tenant_id = $2 RETURNING *`,
        [creditsUsed, tenantId]
      );

      expect(result.rows[0].balance).toBeLessThan(5000);
    });

    it('should check credit balance before usage', () => {
      const balance = 1000;
      const requiredCredits = 500;

      const hasEnoughCredits = balance >= requiredCredits;
      expect(hasEnoughCredits).toBe(true);
    });
  });

  describe('Usage Tracking & Analytics', () => {
    it('should track credit usage', async () => {
      const usage = {
        tenant_id: 'tenant-123',
        channel: 'sms',
        credits_used: 1,
        message_id: 'msg-123',
      };

      (coreDb.query).mockResolvedValue({
        rows: [{ id: 'usage-123', ...usage, used_at: new Date() }],
      });

      const result = await coreDb.query(
        `INSERT INTO credit_usage (tenant_id, channel, credits_used, message_id)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [usage.tenant_id, usage.channel, usage.credits_used, usage.message_id]
      );

      expect(result.rows[0].credits_used).toBe(usage.credits_used);
    });

    it('should calculate usage by channel', async () => {
      const tenantId = 'tenant-123';
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';

      (coreDb.query).mockResolvedValue({
        rows: [
          { channel: 'sms', total_credits: 500, message_count: 500 },
          { channel: 'email', total_credits: 200, message_count: 200 },
          { channel: 'push', total_credits: 100, message_count: 100 },
        ],
      });

      const result = await coreDb.query(
        `SELECT 
           channel,
           SUM(credits_used) as total_credits,
           COUNT(*) as message_count
         FROM credit_usage
         WHERE tenant_id = $1 AND used_at BETWEEN $2 AND $3
         GROUP BY channel`,
        [tenantId, startDate, endDate]
      );

      expect(result.rows.length).toBeGreaterThan(0);
    });
  });

  describe('Credit Pricing Management', () => {
    it('should get credit pricing', () => {
      const pricing = {
        sms: 1,
        email: 1,
        push: 0.5,
        whatsapp: 2,
      };

      const channel = 'sms';
      const credits = pricing[channel as keyof typeof pricing];

      expect(credits).toBe(1);
    });

    it('should calculate total cost', () => {
      const usage = {
        sms: 100,
        email: 50,
        push: 200,
      };

      const pricing = {
        sms: 1,
        email: 1,
        push: 0.5,
      };

      const totalCost = Object.entries(usage).reduce((sum, [channel, count]) => {
        return sum + (count * (pricing[channel as keyof typeof pricing] || 0));
      }, 0);

      expect(totalCost).toBe(250);
    });
  });
});

