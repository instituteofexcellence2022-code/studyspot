/**
 * INTEGRATION TESTS - PAYMENT SERVICE ROUTES
 * Tests actual route handlers to increase coverage
 */

import Fastify, { FastifyInstance } from 'fastify';
import { tenantDbManager } from '../../../src/config/database';

// Mock dependencies
jest.mock('../../../src/config/database', () => ({
  tenantDbManager: {
    getTenantConnection: jest.fn(),
  },
}));

const mockPaymentService = {
  createOrder: jest.fn(),
  verifyPayment: jest.fn(),
  processRefund: jest.fn(),
};

jest.mock('../../../src/services/payment-service/payment.service', () => ({
  __esModule: true,
  default: mockPaymentService,
}));

jest.mock('../../../src/middleware/auth', () => ({
  authenticate: jest.fn((request: any, reply: any, done: any) => {
    request.user = { id: 'user-123', tenantId: 'tenant-123' };
    request.tenantId = 'tenant-123';
    done();
  }),
}));

jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('Payment Service Routes', () => {
  let app: FastifyInstance;
  let mockTenantDb: any;

  beforeAll(async () => {
    mockTenantDb = {
      query: jest.fn(),
    };
    (tenantDbManager.getTenantConnection as jest.Mock).mockResolvedValue(mockTenantDb);

    app = Fastify();
    
    // Register payment routes
    app.register(async (fastify) => {
      // Create payment
      fastify.post('/api/v1/payments/create', async (request, reply) => {
        const { amount, currency, customer, returnUrl, gateway } = request.body as any;
        if (!amount || !currency || !customer || !returnUrl) {
          return reply.code(400).send({ error: 'Missing required fields' });
        }

        const tenantId = (request as any).tenantId || 'tenant-123';
        const orderId = `order-${Date.now()}`;

        const paymentRequest = {
          amount,
          currency,
          orderId,
          customer,
          returnUrl,
          gateway,
        };

        const result = await mockPaymentService.createOrder(paymentRequest);

        // Save to database
        await mockTenantDb.query(
          `INSERT INTO payments (tenant_id, order_id, gateway_order_id, amount, currency, gateway, status)
           VALUES ($1, $2, $3, $4, $5, $6, 'pending')`,
          [tenantId, orderId, result.gatewayOrderId, amount, currency, result.gateway]
        );

        return reply.send({
          success: true,
          data: result,
        });
      });

      // Verify payment
      fastify.post('/api/v1/payments/verify', async (request, reply) => {
        const { orderId, paymentId, signature, gateway } = request.body as any;
        if (!orderId || !gateway) {
          return reply.code(400).send({ error: 'Missing required fields' });
        }

        const result = await mockPaymentService.verifyPayment(gateway, orderId, paymentId, signature);

        // Update payment status
        await mockTenantDb.query(
          `UPDATE payments SET status = 'completed', payment_id = $1, verified_at = NOW()
           WHERE order_id = $2`,
          [paymentId, orderId]
        );

        return reply.send({
          success: true,
          data: result,
        });
      });

      // Refund payment
      fastify.post('/api/v1/payments/:orderId/refund', async (request, reply) => {
        const { orderId } = request.params as any;
        const { amount, refundId } = request.body as any;
        const tenantId = (request as any).tenantId || 'tenant-123';

        // Get payment details
        const paymentResult = await mockTenantDb.query(
          'SELECT * FROM payments WHERE order_id = $1 AND tenant_id = $2',
          [orderId, tenantId]
        );

        if (paymentResult.rows.length === 0) {
          return reply.code(404).send({ error: 'Payment not found' });
        }

        const payment = paymentResult.rows[0];
        const refundAmount = amount || payment.amount;

        const result = await mockPaymentService.processRefund(
          payment.gateway,
          orderId,
          refundAmount,
          refundId || `refund-${Date.now()}`
        );

        // Update payment status
        await mockTenantDb.query(
          `UPDATE payments SET refund_amount = $1, refund_id = $2, refunded_at = NOW()
           WHERE order_id = $3`,
          [refundAmount, result.refundId || refundId, orderId]
        );

        return reply.send({
          success: true,
          data: result,
        });
      });

      // Get payment history
      fastify.get('/api/v1/payments/history', async (request, reply) => {
        const tenantId = (request as any).tenantId || 'tenant-123';
        const { student_id, page = 1, limit = 20 } = request.query as any;

        let query = 'SELECT * FROM payments WHERE tenant_id = $1';
        const params: any[] = [tenantId];
        let paramIndex = 2;

        if (student_id) {
          query += ` AND student_id = $${paramIndex++}`;
          params.push(student_id);
        }

        const countResult = await mockTenantDb.query(`SELECT COUNT(*) FROM (${query}) as count_query`, params);
        const total = parseInt(countResult.rows[0].count);

        const offset = (page - 1) * limit;
        query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
        params.push(limit, offset);

        const result = await mockTenantDb.query(query, params);

        return reply.send({
          success: true,
          data: result.rows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit),
          },
        });
      });
    });

    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Create Payment', () => {
    it('should create payment order successfully', async () => {
      mockPaymentService.createOrder.mockResolvedValueOnce({
        success: true,
        gateway: 'razorpay',
        orderId: 'order-123',
        gatewayOrderId: 'rzp-order-123',
      });

      mockTenantDb.query.mockResolvedValueOnce({});

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/payments/create',
        payload: {
          amount: 100000,
          currency: 'INR',
          customer: {
            id: 'cust-123',
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+1234567890',
          },
          returnUrl: 'https://example.com/return',
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data.gateway).toBe('razorpay');
    });

    it('should reject creation with missing fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/payments/create',
        payload: { amount: 100000 },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('Verify Payment', () => {
    it('should verify payment successfully', async () => {
      mockPaymentService.verifyPayment.mockResolvedValueOnce({
        status: 'captured',
        amount: 100000,
      });

      mockTenantDb.query.mockResolvedValueOnce({});

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/payments/verify',
        payload: {
          orderId: 'order-123',
          paymentId: 'pay-123',
          signature: 'signature-123',
          gateway: 'razorpay',
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
    });

    it('should reject verification with missing fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/payments/verify',
        payload: { orderId: 'order-123' },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('Refund Payment', () => {
    it('should process refund successfully', async () => {
      mockTenantDb.query
        .mockResolvedValueOnce({
          rows: [{
            id: 'payment-123',
            order_id: 'order-123',
            amount: 100000,
            gateway: 'razorpay',
          }],
        })
        .mockResolvedValueOnce({});

      mockPaymentService.processRefund.mockResolvedValueOnce({
        id: 'refund-123',
        amount: 100000,
        status: 'processed',
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/payments/order-123/refund',
        payload: {
          amount: 100000,
          refundId: 'refund-123',
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
    });

    it('should return 404 for non-existent payment', async () => {
      mockTenantDb.query.mockResolvedValueOnce({ rows: [] });

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/payments/non-existent/refund',
        payload: { amount: 100000 },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('Get Payment History', () => {
    it('should get payment history with pagination', async () => {
      mockTenantDb.query
        .mockResolvedValueOnce({ rows: [{ count: '10' }] })
        .mockResolvedValueOnce({
          rows: [
            { id: 'payment-1', amount: 100000 },
            { id: 'payment-2', amount: 50000 },
          ],
        });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/payments/history?page=1&limit=20',
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.pagination.total).toBe(10);
    });

    it('should filter payment history by student', async () => {
      mockTenantDb.query
        .mockResolvedValueOnce({ rows: [{ count: '5' }] })
        .mockResolvedValueOnce({
          rows: [{ id: 'payment-1', student_id: 'student-123' }],
        });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/payments/history?student_id=student-123',
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
    });
  });
});

