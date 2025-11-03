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

dotenv.config();

const fastify = Fastify({ logger: false });
const PORT = parseInt(process.env.PAYMENT_SERVICE_PORT || '3006');

// ============================================
// MIDDLEWARE
// ============================================

fastify.register(cors, {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3002'],
  credentials: true,
});

fastify.register(helmet);

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
fastify.post('/api/v1/payments/create', async (request, reply) => {
  try {
    const tenantId = request.headers['x-tenant-id'] as string;
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
fastify.post('/api/v1/payments/verify', async (request, reply) => {
  try {
    const tenantId = request.headers['x-tenant-id'] as string;
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
fastify.post('/api/v1/payments/:id/refund', async (request, reply) => {
  try {
    const { id } = request.params as { id: string };
    const tenantId = request.headers['x-tenant-id'] as string;
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

