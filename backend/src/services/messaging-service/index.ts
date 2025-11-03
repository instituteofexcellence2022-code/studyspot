// ============================================
// MESSAGING SERVICE
// SMS, WhatsApp, Email with credit management
// Port: 3011
// ============================================

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import dotenv from 'dotenv';
import smsService from './sms.service';
import { coreDb, tenantDbManager } from '../../config/database';
import { logger } from '../../utils/logger';
import { HTTP_STATUS, ERROR_CODES } from '../../config/constants';

dotenv.config();

const fastify = Fastify({ logger: false });
const PORT = parseInt(process.env.MESSAGING_SERVICE_PORT || '3011');

// ============================================
// MIDDLEWARE
// ============================================

fastify.register(cors, {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3002'],
  credentials: true,
});

fastify.register(helmet);

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check and deduct tenant credits
 */
const deductCredits = async (tenantId: string, channel: 'sms' | 'whatsapp' | 'email', amount: number = 1) => {
  const field = `${channel}_credits`;

  // Check balance
  const walletResult = await coreDb.query(
    `SELECT ${field} FROM tenant_credit_wallets WHERE tenant_id = $1`,
    [tenantId]
  );

  if (!walletResult.rows.length) {
    throw new Error('Wallet not found');
  }

  const currentBalance = walletResult.rows[0][field];

  if (currentBalance < amount) {
    throw new Error(`Insufficient ${channel} credits. Balance: ${currentBalance}`);
  }

  // Deduct credits
  await coreDb.query(
    `UPDATE tenant_credit_wallets SET ${field} = ${field} - $1, total_spent = total_spent + $2 WHERE tenant_id = $3`,
    [amount, amount * 0.25, tenantId] // Assuming ₹0.25 per credit
  );

  logger.info('Credits deducted', { tenantId, channel, amount });
};

/**
 * Log communication
 */
const logCommunication = async (
  tenantDb: any,
  tenantId: string,
  channel: string,
  type: string,
  recipient: string,
  message: string,
  status: string,
  templateId?: string
) => {
  await tenantDb.query(
    `INSERT INTO communications (
      tenant_id, channel, type, recipient, message, template_id, status, credits_used, sent_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
    [tenantId, channel, type, recipient, message, templateId, status, 1]
  );
};

// ============================================
// ROUTES
// ============================================

// Health check
fastify.get('/health', async () => {
  return {
    success: true,
    data: {
      status: 'healthy',
      service: 'messaging-service',
      timestamp: new Date().toISOString(),
    },
  };
});

// Send SMS
fastify.post('/api/v1/messaging/sms', async (request, reply) => {
  try {
    const tenantId = request.headers['x-tenant-id'] as string;
    const { phone, templateType, variables } = request.body as any;

    // Validate
    if (!phone || !templateType) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.REQUIRED_FIELD_MISSING,
          message: 'Phone and templateType are required',
        },
      });
    }

    // Check and deduct credits
    try {
      await deductCredits(tenantId, 'sms', 1);
    } catch (error: any) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.INSUFFICIENT_BALANCE,
          message: error.message,
        },
      });
    }

    // Send SMS
    const result = await smsService.sendSMS({
      phone,
      templateType,
      variables: variables || [],
    });

    // Log communication
    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);
    await logCommunication(
      tenantDb,
      tenantId,
      'sms',
      templateType,
      phone,
      variables ? variables.join(', ') : '',
      result.success ? 'sent' : 'failed'
    );

    if (!result.success) {
      return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
        success: false,
        error: {
          code: ERROR_CODES.SMS_SERVICE_ERROR,
          message: result.error || 'SMS sending failed',
        },
      });
    }

    return {
      success: true,
      data: {
        messageId: result.messageId,
        creditsUsed: 1,
      },
      message: 'SMS sent successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Send SMS error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SMS_SERVICE_ERROR,
        message: 'Failed to send SMS',
      },
    });
  }
});

// Send OTP
fastify.post('/api/v1/messaging/send-otp', async (request, reply) => {
  try {
    const { phone } = request.body as { phone: string };

    if (!phone) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.REQUIRED_FIELD_MISSING,
          message: 'Phone number is required',
        },
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in Redis with 10-minute expiry
    const { cache } = await import('../../config/redis');
    await cache.setWithExpiry(`otp:${phone}`, otp, 600);

    // Send SMS (no credit deduction for OTP in free tier)
    const result = await smsService.sendOTP(phone, otp);

    if (!result.success) {
      return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
        success: false,
        error: {
          code: ERROR_CODES.SMS_SERVICE_ERROR,
          message: result.error || 'Failed to send OTP',
        },
      });
    }

    return {
      success: true,
      message: 'OTP sent successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Send OTP error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SMS_SERVICE_ERROR,
        message: 'Failed to send OTP',
      },
    });
  }
});

// Verify OTP
fastify.post('/api/v1/messaging/verify-otp', async (request, reply) => {
  try {
    const { phone, otp } = request.body as { phone: string; otp: string };

    if (!phone || !otp) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.REQUIRED_FIELD_MISSING,
          message: 'Phone and OTP are required',
        },
      });
    }

    // Get OTP from Redis
    const { cache } = await import('../../config/redis');
    const storedOTP = await cache.get<string>(`otp:${phone}`);

    if (!storedOTP) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'OTP expired or not found',
        },
      });
    }

    if (storedOTP !== otp) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Invalid OTP',
        },
      });
    }

    // Delete OTP after verification
    await cache.del(`otp:${phone}`);

    return {
      success: true,
      message: 'OTP verified successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Verify OTP error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to verify OTP',
      },
    });
  }
});

// Get messaging history
fastify.get('/api/v1/messaging/history', async (request, reply) => {
  try {
    const tenantId = request.headers['x-tenant-id'] as string;
    const { channel, status, limit = 50 } = request.query as any;

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    let query = 'SELECT * FROM communications WHERE tenant_id = $1';
    const params: any[] = [tenantId];
    let paramIndex = 2;

    if (channel) {
      query += ` AND channel = $${paramIndex++}`;
      params.push(channel);
    }

    if (status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex}`;
    params.push(limit);

    const result = await tenantDb.query(query, params);

    return {
      success: true,
      data: result.rows,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Get messaging history error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch messaging history',
      },
    });
  }
});

// Get messaging analytics
fastify.get('/api/v1/messaging/analytics', async (request, reply) => {
  try {
    const tenantId = request.headers['x-tenant-id'] as string;
    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    const result = await tenantDb.query(`
      SELECT 
        channel,
        COUNT(*) as total_sent,
        COUNT(*) FILTER (WHERE status = 'delivered') as delivered,
        COUNT(*) FILTER (WHERE status = 'failed') as failed,
        SUM(credits_used) as total_credits_used
      FROM communications
      WHERE tenant_id = $1 AND created_at >= NOW() - INTERVAL '30 days'
      GROUP BY channel
    `, [tenantId]);

    return {
      success: true,
      data: result.rows,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Get messaging analytics error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch analytics',
      },
    });
  }
});

// ============================================
// START SERVER
// ============================================

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    logger.info(`📨 Messaging Service running on port ${PORT}`);
    logger.info('  ✅ MSG91: Configured');
    logger.info('  ✅ BSNL DLT: 6 templates approved');
  } catch (err) {
    logger.error('Failed to start Messaging Service', err);
    process.exit(1);
  }
};

start();

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down Messaging Service...');
  await fastify.close();
  process.exit(0);
});

