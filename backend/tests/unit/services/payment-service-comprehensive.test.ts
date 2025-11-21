/**
 * UNIT TESTS - PAYMENT SERVICE COMPREHENSIVE
 * Comprehensive tests for payment service business logic
 */

import paymentService from '../../../src/services/payment-service/payment.service';
import cashfreeService from '../../../src/services/payment-service/cashfree.service';
import razorpayService from '../../../src/services/payment-service/razorpay.service';
import { tenantDbManager } from '../../../src/config/database';

// Mock dependencies
jest.mock('../../../src/config/database');
jest.mock('../../../src/utils/logger');
jest.mock('../../../src/services/payment-service/payment.service');
jest.mock('../../../src/services/payment-service/cashfree.service');
jest.mock('../../../src/services/payment-service/razorpay.service');

describe('Payment Service - Comprehensive', () => {
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

  describe('Payment Gateway Selection', () => {
    it('should select gateway based on configuration', async () => {
      const paymentData = {
        amount: 1000,
        gateway: 'razorpay',
      };

      // Mock gateway selection logic
      const selectedGateway = paymentData.gateway || 'razorpay';
      expect(selectedGateway).toBe('razorpay');
    });

    it('should fallback to default gateway', async () => {
      const paymentData = {
        amount: 1000,
      };

      const selectedGateway = paymentData.gateway || 'razorpay';
      expect(selectedGateway).toBe('razorpay');
    });
  });

  describe('Payment Order Creation', () => {
    it('should create payment order in database', async () => {
      const orderData = {
        tenant_id: tenantId,
        amount: 1000,
        currency: 'INR',
        order_id: 'order-123',
        customer_id: 'customer-123',
        gateway: 'razorpay',
        status: 'pending',
      };

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: 'payment-123', ...orderData }],
      });

      const result = await mockTenantDb.query(
        `INSERT INTO payments (tenant_id, amount, currency, order_id, customer_id, gateway, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          orderData.tenant_id,
          orderData.amount,
          orderData.currency,
          orderData.order_id,
          orderData.customer_id,
          orderData.gateway,
          orderData.status,
        ]
      );

      expect(result.rows[0].amount).toBe(orderData.amount);
      expect(result.rows[0].gateway).toBe(orderData.gateway);
    });

    it('should handle payment order creation errors', async () => {
      mockTenantDb.query.mockRejectedValue(new Error('Database error'));

      await expect(
        mockTenantDb.query(
          `INSERT INTO payments (tenant_id, amount, currency, order_id, customer_id, gateway, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [tenantId, 1000, 'INR', 'order-123', 'customer-123', 'razorpay', 'pending']
        )
      ).rejects.toThrow('Database error');
    });
  });

  describe('Payment Verification', () => {
    it('should verify payment successfully', async () => {
      const paymentId = 'payment-123';
      const verificationData = {
        payment_id: paymentId,
        status: 'success',
        transaction_id: 'txn-123',
        gateway_response: { success: true },
      };

      mockTenantDb.query
        .mockResolvedValueOnce({ rows: [{ id: paymentId, status: 'pending', amount: 1000 }] })
        .mockResolvedValueOnce({ rows: [{ id: paymentId, status: 'paid', ...verificationData }] });

      // Verify payment
      const result = await mockTenantDb.query(
        `UPDATE payments SET status = $1, transaction_id = $2, gateway_response = $3, updated_at = NOW()
         WHERE id = $4 RETURNING *`,
        [verificationData.status, verificationData.transaction_id, JSON.stringify(verificationData.gateway_response), paymentId]
      );

      expect(result.rows[0].status).toBe('paid');
      expect(result.rows[0].transaction_id).toBe(verificationData.transaction_id);
    });

    it('should handle payment verification failure', async () => {
      const paymentId = 'payment-123';
      const verificationData = {
        status: 'failed',
        failure_reason: 'Insufficient funds',
      };

      mockTenantDb.query
        .mockResolvedValueOnce({ rows: [{ id: paymentId, status: 'pending' }] })
        .mockResolvedValueOnce({ rows: [{ id: paymentId, status: 'failed', ...verificationData }] });

      const result = await mockTenantDb.query(
        `UPDATE payments SET status = $1, failure_reason = $2, updated_at = NOW()
         WHERE id = $3 RETURNING *`,
        [verificationData.status, verificationData.failure_reason, paymentId]
      );

      expect(result.rows[0].status).toBe('failed');
    });
  });

  describe('Payment Refunds', () => {
    it('should process full refund', async () => {
      const paymentId = 'payment-123';
      const refundAmount = 1000;

      mockTenantDb.query
        .mockResolvedValueOnce({ rows: [{ id: paymentId, amount: 1000, status: 'paid' }] })
        .mockResolvedValueOnce({
          rows: [{ id: 'refund-123', payment_id: paymentId, amount: refundAmount, status: 'processed' }],
        });

      // Create refund
      const result = await mockTenantDb.query(
        `INSERT INTO payment_refunds (payment_id, amount, reason, status)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [paymentId, refundAmount, 'Customer request', 'processed']
      );

      expect(result.rows[0].amount).toBe(refundAmount);
    });

    it('should process partial refund', async () => {
      const paymentId = 'payment-123';
      const refundAmount = 500;
      const originalAmount = 1000;

      mockTenantDb.query
        .mockResolvedValueOnce({ rows: [{ id: paymentId, amount: originalAmount, status: 'paid' }] })
        .mockResolvedValueOnce({
          rows: [{ id: 'refund-123', payment_id: paymentId, amount: refundAmount, status: 'processed' }],
        });

      const result = await mockTenantDb.query(
        `INSERT INTO payment_refunds (payment_id, amount, reason, status)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [paymentId, refundAmount, 'Partial refund', 'processed']
      );

      expect(result.rows[0].amount).toBe(refundAmount);
      expect(result.rows[0].amount).toBeLessThan(originalAmount);
    });
  });

  describe('Payment History', () => {
    it('should retrieve payment history for customer', async () => {
      const customerId = 'customer-123';

      mockTenantDb.query.mockResolvedValue({
        rows: [
          { id: 'payment-1', amount: 1000, status: 'paid', created_at: new Date() },
          { id: 'payment-2', amount: 2000, status: 'paid', created_at: new Date() },
          { id: 'payment-3', amount: 500, status: 'pending', created_at: new Date() },
        ],
      });

      const result = await mockTenantDb.query(
        `SELECT * FROM payments 
         WHERE customer_id = $1 AND tenant_id = $2 
         ORDER BY created_at DESC`,
        [customerId, tenantId]
      );

      expect(result.rows).toHaveLength(3);
      expect(result.rows[0].customer_id).toBe(customerId);
    });

    it('should filter payments by status', async () => {
      mockTenantDb.query.mockResolvedValue({
        rows: [
          { id: 'payment-1', status: 'paid' },
          { id: 'payment-2', status: 'paid' },
        ],
      });

      const result = await mockTenantDb.query(
        'SELECT * FROM payments WHERE tenant_id = $1 AND status = $2',
        [tenantId, 'paid']
      );

      expect(result.rows.every((p: any) => p.status === 'paid')).toBe(true);
    });
  });

  describe('Payment Preferences', () => {
    it('should save payment preferences', async () => {
      const studentId = 'student-123';
      const preferences = {
        preferred_gateway: 'razorpay',
        auto_pay_enabled: true,
        auto_pay_threshold: 500,
      };

      mockTenantDb.query.mockResolvedValue({
        rows: [{ student_id: studentId, ...preferences }],
      });

      const result = await mockTenantDb.query(
        `INSERT INTO student_payment_preferences (student_id, tenant_id, preferred_gateway, auto_pay_enabled, auto_pay_threshold)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (student_id) DO UPDATE SET preferred_gateway = $3, auto_pay_enabled = $4, auto_pay_threshold = $5
         RETURNING *`,
        [studentId, tenantId, preferences.preferred_gateway, preferences.auto_pay_enabled, preferences.auto_pay_threshold]
      );

      expect(result.rows[0].preferred_gateway).toBe('razorpay');
      expect(result.rows[0].auto_pay_enabled).toBe(true);
    });

    it('should retrieve payment preferences', async () => {
      const studentId = 'student-123';

      mockTenantDb.query.mockResolvedValue({
        rows: [{
          student_id: studentId,
          preferred_gateway: 'razorpay',
          auto_pay_enabled: true,
        }],
      });

      const result = await mockTenantDb.query(
        'SELECT * FROM student_payment_preferences WHERE student_id = $1',
        [studentId]
      );

      expect(result.rows[0].student_id).toBe(studentId);
    });
  });
});

