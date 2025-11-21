// ============================================
// CREDIT MANAGEMENT SERVICE
// Master wallet + Tenant wallets + B2B2C reselling
// Port: 3008
// ============================================

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import dotenv from 'dotenv';
import { coreDb } from '../../config/database';
import { logger } from '../../utils/logger';
import { HTTP_STATUS, ERROR_CODES } from '../../config/constants';
import { authenticate, AuthenticatedRequest, requireRole } from '../../middleware/auth';
import { validateBody, validateQuery, validateParams } from '../../middleware/validator';
import { registerRateLimit, SERVICE_RATE_LIMITS } from '../../middleware/rateLimiter';
import { requestLogger } from '../../middleware/requestLogger';
import { errorHandler, notFoundHandler } from '../../middleware/errorHandler';
import { z } from 'zod';
import { config } from '../../config/env';

dotenv.config();

const fastify = Fastify({ logger: false });
const PORT = config.ports.credit;

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

(async () => {
  await registerRateLimit(fastify, SERVICE_RATE_LIMITS.default);
})();

// ============================================
// REQUEST LOGGING
// ============================================

fastify.addHook('onRequest', requestLogger);

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

fastify.addHook('onRequest', async (request: AuthenticatedRequest, reply) => {
  if (request.url === '/health') {
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
// VALIDATION SCHEMAS
// ============================================

const purchaseCreditsSchema = z.object({
  vendor_id: z.string().uuid().optional(),
  sms_credits: z.coerce.number().int().nonnegative().default(0),
  whatsapp_credits: z.coerce.number().int().nonnegative().default(0),
  email_credits: z.coerce.number().int().nonnegative().default(0),
  total_cost: z.coerce.number().nonnegative(),
  payment_method: z.string().max(50).optional(),
  invoice_number: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

const allocateCreditsSchema = z.object({
  tenant_id: z.string().uuid(),
  sms_credits: z.coerce.number().int().nonnegative().default(0),
  whatsapp_credits: z.coerce.number().int().nonnegative().default(0),
  email_credits: z.coerce.number().int().nonnegative().default(0),
  notes: z.string().max(500).optional(),
});

const creditQuerySchema = z.object({
  status: z.string().optional(),
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(20).optional(),
});

const tenantParamsSchema = z.object({
  tenantId: z.string().uuid(),
});

// ============================================
// ROUTES - MASTER WALLET (Admin)
// ============================================

// Health check
fastify.get('/health', async () => {
  try {
    await coreDb.query('SELECT 1');
    return {
      success: true,
      data: {
        status: 'healthy',
        service: 'credit-service',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
    };
  } catch (error: any) {
    logger.error('Health check failed:', error);
    return {
      success: false,
      data: {
        status: 'unhealthy',
        service: 'credit-service',
        timestamp: new Date().toISOString(),
        error: error.message,
      },
    };
  }
});

// Get master wallet balance
fastify.get('/api/v1/admin/credits/wallet', {
  preHandler: [requireRole('admin', 'super_admin')],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const result = await coreDb.query('SELECT * FROM credit_master_wallet LIMIT 1');

    return {
      success: true,
      data: result.rows[0] || {
        total_sms_credits: 0,
        total_whatsapp_credits: 0,
        total_email_credits: 0,
        available_sms_credits: 0,
        available_whatsapp_credits: 0,
        available_email_credits: 0,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Get master wallet error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch master wallet',
      },
    });
  }
});

// Purchase credits from vendor
fastify.post('/api/v1/admin/credits/purchase', {
  preHandler: [
    requireRole('admin', 'super_admin'),
    validateBody(purchaseCreditsSchema),
  ],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const {
      vendor_id,
      sms_credits = 0,
      whatsapp_credits = 0,
      email_credits = 0,
      total_cost,
      payment_method,
      invoice_number,
      notes,
    } = request.body as any;

    const userId = (request.user as any)?.userId || (request.user as any)?.id;

    // Record purchase
    const purchaseResult = await coreDb.query(
      `INSERT INTO credit_purchases (
        vendor_id, sms_credits, whatsapp_credits, email_credits,
        total_cost, payment_method, payment_status, invoice_number, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        vendor_id,
        sms_credits,
        whatsapp_credits,
        email_credits,
        total_cost,
        payment_method,
        'completed',
        invoice_number,
        notes,
        userId,
      ]
    );

    // Update master wallet
    await coreDb.query(
      `UPDATE credit_master_wallet SET
        total_sms_credits = total_sms_credits + $1,
        total_whatsapp_credits = total_whatsapp_credits + $2,
        total_email_credits = total_email_credits + $3,
        available_sms_credits = available_sms_credits + $1,
        available_whatsapp_credits = available_whatsapp_credits + $2,
        available_email_credits = available_email_credits + $3,
        total_purchased = total_purchased + $4`,
      [sms_credits, whatsapp_credits, email_credits, total_cost]
    );

    logger.info('Credits purchased', { sms_credits, whatsapp_credits, email_credits });

    return {
      success: true,
      data: purchaseResult.rows[0],
      message: 'Credits purchased successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Purchase credits error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to purchase credits',
      },
    });
  }
});

// Get all tenant wallets
fastify.get('/api/v1/admin/credits/tenant-wallets', {
  preHandler: [
    requireRole('admin', 'super_admin'),
    validateQuery(creditQuerySchema),
  ],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { status, page = 1, limit = 20 } = request.query as any;

    let query = `
      SELECT 
        tcw.*,
        t.name as tenant_name,
        t.email as tenant_email,
        t.status as tenant_status
      FROM tenant_credit_wallets tcw
      JOIN tenants t ON tcw.tenant_id = t.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    // Filter by balance status
    if (status === 'low') {
      query += ` AND (tcw.sms_credits + tcw.whatsapp_credits + tcw.email_credits) < tcw.low_balance_threshold`;
    } else if (status === 'critical') {
      query += ` AND (tcw.sms_credits + tcw.whatsapp_credits + tcw.email_credits) < (tcw.low_balance_threshold / 2)`;
    }

    // Get total count
    const countResult = await coreDb.query(`SELECT COUNT(*) FROM (${query}) as count_query`, params);
    const total = parseInt(countResult.rows[0].count);

    // Apply pagination
    const offset = (page - 1) * limit;
    query += ` ORDER BY tcw.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(limit, offset);

    const result = await coreDb.query(query, params);

    return {
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Get tenant wallets error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch tenant wallets',
      },
    });
  }
});

// Allocate credits to tenant
fastify.post('/api/v1/admin/credits/allocate', async (request, reply) => {
  try {
    const {
      tenant_id,
      sms_credits = 0,
      whatsapp_credits = 0,
      email_credits = 0,
    } = request.body as any;

    // Check master wallet balance
    const masterWalletResult = await coreDb.query('SELECT * FROM credit_master_wallet LIMIT 1');
    const masterWallet = masterWalletResult.rows[0];

    if (
      masterWallet.available_sms_credits < sms_credits ||
      masterWallet.available_whatsapp_credits < whatsapp_credits ||
      masterWallet.available_email_credits < email_credits
    ) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.INSUFFICIENT_BALANCE,
          message: 'Insufficient credits in master wallet',
        },
      });
    }

    // Deduct from master wallet
    await coreDb.query(
      `UPDATE credit_master_wallet SET
        available_sms_credits = available_sms_credits - $1,
        available_whatsapp_credits = available_whatsapp_credits - $2,
        available_email_credits = available_email_credits - $3,
        allocated_sms_credits = allocated_sms_credits + $1,
        allocated_whatsapp_credits = allocated_whatsapp_credits + $2,
        allocated_email_credits = allocated_email_credits + $3`,
      [sms_credits, whatsapp_credits, email_credits]
    );

    // Add to tenant wallet
    await coreDb.query(
      `UPDATE tenant_credit_wallets SET
        sms_credits = sms_credits + $1,
        whatsapp_credits = whatsapp_credits + $2,
        email_credits = email_credits + $3
      WHERE tenant_id = $4`,
      [sms_credits, whatsapp_credits, email_credits, tenant_id]
    );

    logger.info('Credits allocated to tenant', { tenant_id, sms_credits, whatsapp_credits, email_credits });

    return {
      success: true,
      message: 'Credits allocated successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Allocate credits error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to allocate credits',
      },
    });
  }
});

// Get tenant wallet (tenant endpoint)
fastify.get('/api/v1/credits/wallet', async (request, reply) => {
  try {
    const tenantId = request.headers['x-tenant-id'] as string;

    const result = await coreDb.query(
      'SELECT * FROM tenant_credit_wallets WHERE tenant_id = $1',
      [tenantId]
    );

    if (!result.rows.length) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.RESOURCE_NOT_FOUND,
          message: 'Wallet not found',
        },
      });
    }

    return {
      success: true,
      data: result.rows[0],
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Get tenant wallet error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch wallet',
      },
    });
  }
});

// Deduct credits (internal use)
const deductCreditsSchema = z.object({
  tenant_id: z.string().uuid().optional(),
  channel: z.enum(['sms', 'whatsapp', 'email']),
  amount: z.coerce.number().int().positive().default(1),
});

fastify.post('/api/v1/credits/deduct', {
  preHandler: [validateBody(deductCreditsSchema)],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { tenant_id, channel, amount = 1 } = request.body as any;
    const tenantId = tenant_id || (request as any).tenantId || (request.user as any)?.tenantId;

    const field = `${channel}_credits`;

    // Check balance
    const walletResult = await coreDb.query(
      `SELECT ${field} FROM tenant_credit_wallets WHERE tenant_id = $1`,
      [tenant_id]
    );

    if (!walletResult.rows.length) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.RESOURCE_NOT_FOUND,
          message: 'Wallet not found',
        },
      });
    }

    const currentBalance = walletResult.rows[0][field];

    if (currentBalance < amount) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.INSUFFICIENT_BALANCE,
          message: `Insufficient ${channel} credits`,
        },
      });
    }

    // Deduct credits
    await coreDb.query(
      `UPDATE tenant_credit_wallets SET ${field} = ${field} - $1 WHERE tenant_id = $2`,
      [amount, tenant_id]
    );

    logger.info('Credits deducted', { tenant_id, channel, amount });

    return {
      success: true,
      message: 'Credits deducted successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Deduct credits error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to deduct credits',
      },
    });
  }
});

// ============================================
// START SERVER
// ============================================

export async function startCreditService() {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    logger.info(`✅ Credit Service started on port ${PORT}`);
  } catch (err) {
    logger.error('Failed to start Credit Service:', err);
    process.exit(1);
  }
}

// Start if run directly
if (require.main === module) {
  startCreditService();
}

export default fastify;

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down Credit Service...');
  await fastify.close();
  process.exit(0);
});

