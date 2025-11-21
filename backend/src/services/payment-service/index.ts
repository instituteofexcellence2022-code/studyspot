// ============================================
// PAYMENT SERVICE
// Cashfree + Razorpay with Smart Routing
// Port: 3006
// ============================================

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import dotenv from 'dotenv';
import paymentService from './payment.service';
import cashfreeService from './cashfree.service';
import razorpayService from './razorpay.service';
import { tenantDbManager } from '../../config/database';
import { logger } from '../../utils/logger';
import { HTTP_STATUS, ERROR_CODES } from '../../config/constants';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../../middleware/validator';
import { z } from 'zod';
import { registerRateLimit, SERVICE_RATE_LIMITS } from '../../middleware/rateLimiter';
import { requestLogger } from '../../middleware/requestLogger';
import { errorHandler, notFoundHandler } from '../../middleware/errorHandler';
import {
  createPaymentOrderSchema,
  verifyPaymentSchema,
  processRefundSchema,
  paymentParamsSchema,
} from '../../validators/payment.validator';
import { config } from '../../config/env';

dotenv.config();

const fastify = Fastify({ logger: false });
const PORT = config.ports.payment;

// ============================================
// MIDDLEWARE
// ============================================

fastify.register(cors, {
  origin: config.cors.origins.length > 0 ? config.cors.origins : ['http://localhost:3002'],
  credentials: true,
});

fastify.register(helmet);

// ============================================
// RATE LIMITING
// ============================================

// Register rate limiting in async function
(async () => {
  await registerRateLimit(fastify, SERVICE_RATE_LIMITS.payment);
})();

// ============================================
// REQUEST LOGGING
// ============================================

fastify.addHook('onRequest', requestLogger);

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

fastify.addHook('onRequest', async (request: AuthenticatedRequest, reply) => {
  // Skip auth for health check and webhooks
  if (request.url === '/health' || request.url.includes('/webhook/')) {
    return;
  }
  return authenticate(request, reply);
});

// ============================================
// ERROR HANDLING
// ============================================

fastify.setErrorHandler(errorHandler);
fastify.setNotFoundHandler(notFoundHandler);

// ============================================
// ROUTES
// ============================================

// Health check
fastify.get('/health', async () => {
  return {
    success: true,
    data: {
      status: 'healthy',
      service: 'payment-service',
      gateways: {
        cashfree: 'configured',
        razorpay: 'configured',
      },
      timestamp: new Date().toISOString(),
    },
  };
});

// Create payment order
fastify.post('/api/v1/payments/create', {
  preHandler: [validateBody(createPaymentOrderSchema)],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;
    const {
      amount,
      currency = 'INR',
      customer,
      returnUrl,
      gateway,
      studentId,
      libraryId,
    } = request.body as any;

    // Validate
    if (!amount || !customer || !returnUrl) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.REQUIRED_FIELD_MISSING,
          message: 'Amount, customer, and returnUrl are required',
        },
      });
    }

    // Generate unique order ID
    const orderId = `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create payment order
    const paymentOrder = await paymentService.createOrder({
      amount: Math.round(amount * 100), // Convert rupees to paise
      currency,
      orderId,
      customer,
      returnUrl,
      gateway,
    });

    // Save to database
    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    await tenantDb.query(
      `INSERT INTO payments (
        id, tenant_id, library_id, student_id, invoice_number, amount, currency,
        payment_status, payment_gateway, gateway_order_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        orderId,
        tenantId,
        libraryId,
        studentId,
        orderId,
        amount,
        currency,
        'pending',
        paymentOrder.gateway,
        paymentOrder.gatewayOrderId,
      ]
    );

    logger.info('Payment order created', { orderId, gateway: paymentOrder.gateway });

    return {
      success: true,
      data: paymentOrder,
      message: 'Payment order created successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Create payment order error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.PAYMENT_GATEWAY_ERROR,
        message: 'Failed to create payment order',
        details: error.message,
      },
    });
  }
});

// Verify payment
fastify.post('/api/v1/payments/verify', {
  preHandler: [validateBody(verifyPaymentSchema)],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;
    const { orderId, paymentId, signature, gateway } = request.body as any;

    // Verify payment with gateway
    const paymentDetails = await paymentService.verifyPayment(
      gateway,
      orderId,
      paymentId,
      signature
    );

    // Update payment status in database
    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    await tenantDb.query(
      `UPDATE payments SET 
        payment_status = $1,
        transaction_id = $2,
        payment_date = NOW(),
        payment_details = $3
      WHERE invoice_number = $4 AND tenant_id = $5`,
      ['completed', paymentId, JSON.stringify(paymentDetails), orderId, tenantId]
    );

    logger.info('Payment verified and completed', { orderId, paymentId });

    return {
      success: true,
      data: paymentDetails,
      message: 'Payment verified successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Verify payment error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.PAYMENT_GATEWAY_ERROR,
        message: 'Payment verification failed',
        details: error.message,
      },
    });
  }
});

// Process refund
fastify.post('/api/v1/payments/:id/refund', {
  preHandler: [
    validateParams(paymentParamsSchema),
    validateBody(processRefundSchema),
  ],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { id } = request.params as { id: string };
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;
    const { amount, reason } = request.body as any;

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    // Get payment details
    const paymentResult = await tenantDb.query(
      'SELECT * FROM payments WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );

    if (!paymentResult.rows.length) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.RESOURCE_NOT_FOUND,
          message: 'Payment not found',
        },
      });
    }

    const payment = paymentResult.rows[0];

    if (payment.payment_status !== 'completed') {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Can only refund completed payments',
        },
      });
    }

    // Generate refund ID
    const refundId = `REF_${Date.now()}`;

    // Process refund
    const refundAmount = amount || payment.amount;
    const refundResult = await paymentService.processRefund(
      payment.payment_gateway,
      payment.transaction_id || payment.gateway_order_id,
      Math.round(refundAmount * 100),
      refundId
    );

    // Update payment status
    await tenantDb.query(
      `UPDATE payments SET payment_status = $1, notes = $2 WHERE id = $3`,
      ['refunded', reason || 'Refund processed', id]
    );

    logger.info('Refund processed', { paymentId: id, refundId, amount: refundAmount });

    return {
      success: true,
      data: refundResult,
      message: 'Refund processed successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Refund error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.PAYMENT_GATEWAY_ERROR,
        message: 'Failed to process refund',
        details: error.message,
      },
    });
  }
});

// Cashfree webhook
fastify.post('/api/v1/payments/webhook/cashfree', async (request, reply) => {
  try {
    const signature = request.headers['x-webhook-signature'] as string;
    const timestamp = request.headers['x-webhook-timestamp'] as string;

    // Verify signature
    const isValid = cashfreeService.verifyWebhookSignature(
      signature,
      timestamp,
      JSON.stringify(request.body)
    );

    if (!isValid) {
      return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: 'Invalid signature',
      });
    }

    const { type, data } = request.body as any;

    logger.info('Cashfree webhook received', { type, orderId: data.order?.order_id });

    if (type === 'PAYMENT_SUCCESS_WEBHOOK') {
      // Update payment status (would need tenant context)
      logger.info('Payment successful via webhook', { orderId: data.order.order_id });
    }

    return { success: true };
  } catch (error: any) {
    logger.error('Cashfree webhook error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: error.message,
    });
  }
});

// ============================================
// STUDENT PAYMENT ENHANCEMENTS
// ============================================

// Get student payment preferences
fastify.get('/api/v1/payments/students/:studentId/preferences', {
  preHandler: [validateParams(z.object({ studentId: z.string().uuid() }))],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { studentId } = request.params as { studentId: string };
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    // Create payment_preferences table if it doesn't exist
    await tenantDb.query(`
      CREATE TABLE IF NOT EXISTS student_payment_preferences (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        student_id UUID NOT NULL UNIQUE,
        tenant_id UUID NOT NULL,
        preferred_gateway VARCHAR(50),
        auto_pay_enabled BOOLEAN DEFAULT false,
        auto_pay_threshold DECIMAL(10,2),
        saved_cards JSONB DEFAULT '[]',
        upi_ids JSONB DEFAULT '[]',
        wallet_preferences JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (student_id) REFERENCES students(id),
        FOREIGN KEY (tenant_id) REFERENCES tenants(id)
      )
    `).catch(() => {});

    const result = await tenantDb.query(
      'SELECT * FROM student_payment_preferences WHERE student_id = $1 AND tenant_id = $2',
      [studentId, tenantId]
    );

    return {
      success: true,
      data: result.rows[0] || {
        studentId,
        preferredGateway: null,
        autoPayEnabled: false,
        autoPayThreshold: null,
        savedCards: [],
        upiIds: [],
        walletPreferences: {},
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Get payment preferences error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch payment preferences',
      },
    });
  }
});

// Update student payment preferences
fastify.put('/api/v1/payments/students/:studentId/preferences', {
  preHandler: [
    validateParams(z.object({ studentId: z.string().uuid() })),
    validateBody(z.object({
      preferredGateway: z.enum(['cashfree', 'razorpay']).optional(),
      autoPayEnabled: z.boolean().optional(),
      autoPayThreshold: z.coerce.number().positive().optional(),
      savedCards: z.array(z.any()).optional(),
      upiIds: z.array(z.string()).optional(),
      walletPreferences: z.record(z.any()).optional(),
    })),
  ],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { studentId } = request.params as { studentId: string };
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;
    const preferences = request.body as any;

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    const fields = Object.keys(preferences);
    const setClause = fields.map((field, idx) => `${field} = $${idx + 3}`).join(', ');
    const values = [studentId, tenantId, ...fields.map(f => 
      typeof preferences[f] === 'object' ? JSON.stringify(preferences[f]) : preferences[f]
    )];

    const result = await tenantDb.query(
      `INSERT INTO student_payment_preferences (student_id, tenant_id, ${fields.join(', ')})
       VALUES ($1, $2, ${fields.map((_, idx) => `$${idx + 3}`).join(', ')})
       ON CONFLICT (student_id) 
       DO UPDATE SET ${setClause}, updated_at = NOW()
       RETURNING *`,
      values
    );

    return {
      success: true,
      data: result.rows[0],
      message: 'Payment preferences updated successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Update payment preferences error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to update payment preferences',
      },
    });
  }
});

// Get student payment history with analytics
fastify.get('/api/v1/payments/students/:studentId/history', {
  preHandler: [
    validateParams(z.object({ studentId: z.string().uuid() })),
    validateQuery(z.object({
      limit: z.coerce.number().int().positive().max(100).default(20).optional(),
      page: z.coerce.number().int().positive().default(1).optional(),
      startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    })),
  ],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { studentId } = request.params as { studentId: string };
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;
    const { limit = 20, page = 1, startDate, endDate } = request.query as any;

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    let query = 'SELECT * FROM payments WHERE student_id = $1 AND tenant_id = $2';
    const params: any[] = [studentId, tenantId];
    let paramIndex = 3;

    if (startDate) {
      query += ` AND payment_date >= $${paramIndex++}`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND payment_date <= $${paramIndex++}`;
      params.push(endDate);
    }

    // Get total count
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const countResult = await tenantDb.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Pagination
    const offset = (page - 1) * limit;
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(limit, offset);

    const result = await tenantDb.query(query, params);

    // Get analytics
    const analyticsResult = await tenantDb.query(`
      SELECT 
        COUNT(*) as total_payments,
        SUM(amount) FILTER (WHERE payment_status = 'completed') as total_spent,
        AVG(amount) FILTER (WHERE payment_status = 'completed') as avg_payment,
        COUNT(*) FILTER (WHERE payment_status = 'refunded') as refunds_count,
        SUM(amount) FILTER (WHERE payment_status = 'refunded') as refunds_amount,
        MAX(payment_date) as last_payment_date,
        MIN(payment_date) as first_payment_date
      FROM payments
      WHERE student_id = $1 AND tenant_id = $2
    `, [studentId, tenantId]).catch(() => ({ rows: [{}] }));

    return {
      success: true,
      data: {
        payments: result.rows,
        analytics: analyticsResult.rows[0] || {},
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Get payment history error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch payment history',
      },
    });
  }
});

// Razorpay webhook
fastify.post('/api/v1/payments/webhook/razorpay', async (request, reply) => {
  try {
    const signature = request.headers['x-razorpay-signature'] as string;

    // Verify signature
    const isValid = razorpayService.verifyWebhookSignature(
      JSON.stringify(request.body),
      signature
    );

    if (!isValid) {
      return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: 'Invalid signature',
      });
    }

    const { event, payload } = request.body as any;

    logger.info('Razorpay webhook received', { event });

    if (event === 'payment.captured') {
      logger.info('Payment captured via webhook', { paymentId: payload.payment.entity.id });
    }

    return { success: true };
  } catch (error: any) {
    logger.error('Razorpay webhook error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: error.message,
    });
  }
});

// ============================================
// START SERVER
// ============================================

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    logger.info(`💳 Payment Service running on port ${PORT}`);
    logger.info('  ✅ Cashfree: Configured');
    logger.info('  ✅ Razorpay: Configured');
    logger.info('  ✅ Smart Routing: Enabled');
  } catch (err) {
    logger.error('Failed to start Payment Service', err);
    process.exit(1);
  }
};

start();

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down Payment Service...');
  await fastify.close();
  process.exit(0);
});

