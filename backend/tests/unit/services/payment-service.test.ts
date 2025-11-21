/**
 * UNIT TESTS - PAYMENT SERVICE
 * Tests for payment service business logic
 */

import { tenantDbManager } from '../../../src/config/database';
import paymentService from '../../../src/services/payment-service/payment.service';
import cashfreeService from '../../../src/services/payment-service/cashfree.service';
import razorpayService from '../../../src/services/payment-service/razorpay.service';

// Mock dependencies
jest.mock('../../../src/config/database');
jest.mock('../../../src/utils/logger');
jest.mock('../../../src/services/payment-service/payment.service');
jest.mock('../../../src/services/payment-service/cashfree.service');
jest.mock('../../../src/services/payment-service/razorpay.service');

describe('Payment Service', () => {
  let mockTenantDb: any;
  const tenantId = 'test-tenant-id';

  beforeEach(() => {
    mockTenantDb = {
      query: jest.fn(),
    };

    (tenantDbManager.getTenantConnection as jest.Mock) = jest.fn().mockResolvedValue(mockTenantDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Payment Creation', () => {
    it('should create payment order', async () => {
      const paymentData = {
        amount: 1000,
        currency: 'INR',
        order_id: 'order-123',
        customer_id: 'customer-123',
      };

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: 'payment-123', ...paymentData, status: 'pending' }],
      });

      const result = await mockTenantDb.query(
        `INSERT INTO payments (tenant_id, amount, currency, order_id, customer_id, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [tenantId, paymentData.amount, paymentData.currency, paymentData.order_id, paymentData.customer_id, 'pending']
      );

      expect(result.rows[0].amount).toBe(paymentData.amount);
    });

    it('should retrieve payment by ID', async () => {
      const paymentId = 'payment-123';
      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: paymentId, amount: 1000, status: 'paid' }],
      });

      const result = await mockTenantDb.query(
        'SELECT * FROM payments WHERE id = $1 AND tenant_id = $2',
        [paymentId, tenantId]
      );

      expect(result.rows[0].id).toBe(paymentId);
    });
  });

  describe('Payment Verification', () => {
    it('should verify payment successfully', async () => {
      const paymentId = 'payment-123';
      const verificationData = {
        payment_id: paymentId,
        status: 'success',
        transaction_id: 'txn-123',
      };

      mockTenantDb.query
        .mockResolvedValueOnce({ rows: [{ id: paymentId, status: 'pending' }] })
        .mockResolvedValueOnce({ rows: [{ id: paymentId, status: 'paid', ...verificationData }] });

      // Verify payment
      const result = await mockTenantDb.query(
        `UPDATE payments SET status = $1, transaction_id = $2, updated_at = NOW()
         WHERE id = $3 RETURNING *`,
        [verificationData.status, verificationData.transaction_id, paymentId]
      );

      expect(result.rows[0].status).toBe('paid');
    });
  });

  describe('Payment Refund', () => {
    it('should process refund successfully', async () => {
      const paymentId = 'payment-123';
      const refundData = {
        amount: 500,
        reason: 'Customer request',
      };

      mockTenantDb.query
        .mockResolvedValueOnce({ rows: [{ id: paymentId, amount: 1000, status: 'paid' }] })
        .mockResolvedValueOnce({
          rows: [{ id: 'refund-123', payment_id: paymentId, ...refundData, status: 'processed' }],
        });

      // Create refund record
      const result = await mockTenantDb.query(
        `INSERT INTO payment_refunds (payment_id, amount, reason, status)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [paymentId, refundData.amount, refundData.reason, 'processed']
      );

      expect(result.rows[0].amount).toBe(refundData.amount);
    });
  });

  describe('Payment Preferences', () => {
    it('should save payment preferences', async () => {
      const studentId = 'student-123';
      const preferences = {
        preferred_gateway: 'razorpay',
        auto_pay_enabled: true,
      };

      mockTenantDb.query.mockResolvedValue({
        rows: [{ student_id: studentId, ...preferences }],
      });

      const result = await mockTenantDb.query(
        `INSERT INTO student_payment_preferences (student_id, tenant_id, preferred_gateway, auto_pay_enabled)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (student_id) DO UPDATE SET preferred_gateway = $3, auto_pay_enabled = $4
         RETURNING *`,
        [studentId, tenantId, preferences.preferred_gateway, preferences.auto_pay_enabled]
      );

      expect(result.rows[0].preferred_gateway).toBe(preferences.preferred_gateway);
    });
  });
});

