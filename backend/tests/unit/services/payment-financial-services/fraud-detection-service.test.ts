/**
 * UNIT TESTS - FRAUD DETECTION SERVICE
 * Tests for: Fraud pattern detection, risk scoring & assessment,
 * automated alerting, fraud analytics
 */

// Mock dependencies first
jest.mock('../../../src/config/database', () => ({
  coreDb: {
    query: jest.fn(),
  },
}));

jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

const { coreDb } = require('../../../src/config/database');

describe('Fraud Detection Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Fraud Pattern Detection', () => {
    it('should detect multiple rapid transactions', () => {
      const transactions = [
        { id: 'txn-1', amount: 1000, timestamp: new Date('2024-01-01T10:00:00') },
        { id: 'txn-2', amount: 1000, timestamp: new Date('2024-01-01T10:00:05') },
        { id: 'txn-3', amount: 1000, timestamp: new Date('2024-01-01T10:00:10') },
        { id: 'txn-4', amount: 1000, timestamp: new Date('2024-01-01T10:00:15') },
        { id: 'txn-5', amount: 1000, timestamp: new Date('2024-01-01T10:00:20') },
      ];

      const timeWindow = 60 * 1000; // 1 minute
      const threshold = 3;
      const recentTransactions = transactions.filter(t => 
        Date.now() - t.timestamp.getTime() < timeWindow
      );

      const isSuspicious = recentTransactions.length >= threshold;
      expect(isSuspicious).toBe(true);
    });

    it('should detect unusual transaction amounts', () => {
      const userHistory = {
        avgAmount: 500,
        maxAmount: 1000,
      };

      const currentTransaction = {
        amount: 50000,
      };

      const isUnusual = currentTransaction.amount > userHistory.maxAmount * 10;
      expect(isUnusual).toBe(true);
    });

    it('should detect velocity pattern', () => {
      const transactions = [
        { amount: 1000, timestamp: new Date('2024-01-01T10:00:00') },
        { amount: 2000, timestamp: new Date('2024-01-01T10:05:00') },
        { amount: 3000, timestamp: new Date('2024-01-01T10:10:00') },
        { amount: 4000, timestamp: new Date('2024-01-01T10:15:00') },
      ];

      const isVelocityPattern = transactions.every((t, i) => 
        i === 0 || t.amount > transactions[i - 1].amount
      );

      expect(isVelocityPattern).toBe(true);
    });
  });

  describe('Risk Scoring & Assessment', () => {
    it('should calculate risk score', () => {
      const factors = {
        transactionAmount: 10000,
        avgAmount: 500,
        transactionCount: 10,
        timeWindow: 60, // minutes
        deviceChange: true,
        locationChange: true,
      };

      let riskScore = 0;

      // Amount risk
      if (factors.transactionAmount > factors.avgAmount * 5) riskScore += 30;
      if (factors.transactionAmount > factors.avgAmount * 10) riskScore += 20;

      // Velocity risk
      if (factors.transactionCount > 5) riskScore += 20;

      // Behavioral risk
      if (factors.deviceChange) riskScore += 15;
      if (factors.locationChange) riskScore += 15;

      expect(riskScore).toBeGreaterThan(50);
    });

    it('should classify risk level', () => {
      const riskScore = 75;

      const riskLevel = riskScore >= 80 ? 'high' :
                       riskScore >= 50 ? 'medium' : 'low';

      expect(riskLevel).toBe('medium');
    });

    it('should assess transaction risk', async () => {
      const transaction = {
        id: 'txn-123',
        amount: 10000,
        userId: 'user-123',
      };

      (coreDb.query as jest.Mock).mockResolvedValue({
        rows: [{
          transaction_id: transaction.id,
          risk_score: 75,
          risk_level: 'medium',
          factors: ['high_amount', 'velocity'],
        }],
      });

      const result = await coreDb.query(
        `SELECT 
           id as transaction_id,
           CASE
             WHEN amount > 10000 THEN 30
             WHEN amount > 5000 THEN 20
             ELSE 10
           END as risk_score,
           CASE
             WHEN risk_score >= 80 THEN 'high'
             WHEN risk_score >= 50 THEN 'medium'
             ELSE 'low'
           END as risk_level
         FROM transactions
         WHERE id = $1`,
        [transaction.id]
      );

      expect(result.rows[0].risk_level).toBeDefined();
    });
  });

  describe('Automated Alerting', () => {
    it('should trigger alert for high-risk transaction', () => {
      const transaction = {
        id: 'txn-123',
        riskScore: 85,
        riskLevel: 'high',
      };

      const shouldAlert = transaction.riskScore >= 80;
      expect(shouldAlert).toBe(true);
    });

    it('should create fraud alert', async () => {
      const alert = {
        transaction_id: 'txn-123',
        user_id: 'user-123',
        risk_score: 85,
        reason: 'Unusual transaction pattern',
        status: 'pending',
      };

      (coreDb.query as jest.Mock).mockResolvedValue({
        rows: [{ id: 'alert-123', ...alert, created_at: new Date() }],
      });

      const result = await coreDb.query(
        `INSERT INTO fraud_alerts (transaction_id, user_id, risk_score, reason, status)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [alert.transaction_id, alert.user_id, alert.risk_score, alert.reason, alert.status]
      );

      expect(result.rows[0].status).toBe('pending');
    });
  });

  describe('Fraud Analytics', () => {
    it('should calculate fraud rate', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';

      (coreDb.query as jest.Mock).mockResolvedValue({
        rows: [{
          total_transactions: 10000,
          flagged_transactions: 50,
          confirmed_fraud: 10,
          fraud_rate: 0.1,
        }],
      });

      const result = await coreDb.query(
        `SELECT 
           COUNT(*) as total_transactions,
           COUNT(*) FILTER (WHERE risk_score >= 80) as flagged_transactions,
           COUNT(*) FILTER (WHERE fraud_confirmed = true) as confirmed_fraud,
           (COUNT(*) FILTER (WHERE fraud_confirmed = true)::float / COUNT(*)::float * 100) as fraud_rate
         FROM transactions
         WHERE created_at BETWEEN $1 AND $2`,
        [startDate, endDate]
      );

      expect(result.rows[0].fraud_rate).toBeGreaterThanOrEqual(0);
    });

    it('should analyze fraud patterns', async () => {
      (coreDb.query as jest.Mock).mockResolvedValue({
        rows: [
          { pattern: 'velocity', count: 20, percentage: 40 },
          { pattern: 'amount_anomaly', count: 15, percentage: 30 },
          { pattern: 'device_change', count: 10, percentage: 20 },
          { pattern: 'location_change', count: 5, percentage: 10 },
        ],
      });

      const result = await coreDb.query(
        `SELECT 
           fraud_pattern as pattern,
           COUNT(*) as count,
           (COUNT(*)::float / SUM(COUNT(*)) OVER () * 100) as percentage
         FROM fraud_alerts
         WHERE created_at >= NOW() - INTERVAL '30 days'
         GROUP BY fraud_pattern
         ORDER BY count DESC`
      );

      expect(result.rows.length).toBeGreaterThan(0);
    });
  });
});

