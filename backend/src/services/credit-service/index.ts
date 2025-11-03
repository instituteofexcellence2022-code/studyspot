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

dotenv.config();

const fastify = Fastify({ logger: false });
const PORT = parseInt(process.env.CREDIT_SERVICE_PORT || '3008');

// ============================================
// MIDDLEWARE
// ============================================

fastify.register(cors, {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3002'],
  credentials: true,
});

fastify.register(helmet);

// ============================================
// ROUTES - MASTER WALLET (Admin)
// ============================================

// Health check
fastify.get('/health', async () => {
  return {
    success: true,
    data: {
      status: 'healthy',
      service: 'credit-service',
      timestamp: new Date().toISOString(),
    },
  };
});

// Get master wallet balance
fastify.get('/api/v1/admin/credits/wallet', async (request, reply) => {
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
fastify.post('/api/v1/admin/credits/purchase', async (request, reply) => {
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

    const userId = (request as any).user?.userId;

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
fastify.get('/api/v1/admin/credits/tenant-wallets', async (request, reply) => {
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
fastify.post('/api/v1/credits/deduct', async (request, reply) => {
  try {
    const { tenant_id, channel, amount = 1 } = request.body as any;

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

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    logger.info(`💳 Credit Service running on port ${PORT}`);
  } catch (err) {
    logger.error('Failed to start Credit Service', err);
    process.exit(1);
  }
};

start();

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down Credit Service...');
  await fastify.close();
  process.exit(0);
});

