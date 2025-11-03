// ============================================
// SUBSCRIPTION SERVICE
// Subscription lifecycle management
// Port: 3009
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
const PORT = parseInt(process.env.SUBSCRIPTION_SERVICE_PORT || '3009');

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
      service: 'subscription-service',
      timestamp: new Date().toISOString(),
    },
  };
});

// Get all subscription plans (Admin)
fastify.get('/api/v1/admin/subscriptions/plans', async (request, reply) => {
  try {
    const { is_active, type } = request.query as any;

    let query = 'SELECT * FROM subscription_plans WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (is_active !== undefined) {
      query += ` AND is_active = $${paramIndex++}`;
      params.push(is_active === 'true');
    }

    if (type) {
      query += ` AND type = $${paramIndex++}`;
      params.push(type);
    }

    query += ' ORDER BY display_order, price_monthly';

    const result = await coreDb.query(query, params);

    return {
      success: true,
      data: result.rows,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Get subscription plans error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch subscription plans',
      },
    });
  }
});

// Create subscription plan (Admin)
fastify.post('/api/v1/admin/subscriptions/plans', async (request, reply) => {
  try {
    const {
      name,
      slug,
      description,
      type,
      price_monthly,
      price_quarterly,
      price_half_yearly,
      price_annual,
      max_libraries,
      max_students,
      max_staff,
      features = [],
      permissions = {},
      is_popular = false,
    } = request.body as any;

    // Validate
    if (!name || !slug || !type) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.REQUIRED_FIELD_MISSING,
          message: 'Name, slug, and type are required',
        },
      });
    }

    // Check for duplicate slug
    const existing = await coreDb.query(
      'SELECT id FROM subscription_plans WHERE slug = $1',
      [slug]
    );

    if (existing.rows.length) {
      return reply.status(HTTP_STATUS.CONFLICT).send({
        success: false,
        error: {
          code: ERROR_CODES.DUPLICATE_ENTRY,
          message: 'Plan with this slug already exists',
        },
      });
    }

    // Create plan
    const result = await coreDb.query(
      `INSERT INTO subscription_plans (
        name, slug, description, type, price_monthly, price_quarterly, 
        price_half_yearly, price_annual, max_libraries, max_students, max_staff,
        features, permissions, is_popular
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        name, slug, description, type, price_monthly, price_quarterly,
        price_half_yearly, price_annual, max_libraries, max_students, max_staff,
        JSON.stringify(features), JSON.stringify(permissions), is_popular,
      ]
    );

    logger.info(`✅ Subscription plan created: ${name}`);

    return reply.status(HTTP_STATUS.CREATED).send({
      success: true,
      data: result.rows[0],
      message: 'Plan created successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Create subscription plan error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to create plan',
      },
    });
  }
});

// Subscribe to plan (Tenant)
fastify.post('/api/v1/subscriptions/subscribe', async (request, reply) => {
  try {
    const tenantId = request.headers['x-tenant-id'] as string;
    const { plan_id, billing_cycle } = request.body as any;

    // Get plan details
    const planResult = await coreDb.query(
      'SELECT * FROM subscription_plans WHERE id = $1 AND is_active = true',
      [plan_id]
    );

    if (!planResult.rows.length) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.RESOURCE_NOT_FOUND,
          message: 'Plan not found or inactive',
        },
      });
    }

    const plan = planResult.rows[0];

    // Calculate dates and amount
    const start_date = new Date();
    const end_date = new Date();
    let amount = 0;

    switch (billing_cycle) {
      case 'monthly':
        end_date.setMonth(end_date.getMonth() + 1);
        amount = plan.price_monthly;
        break;
      case 'quarterly':
        end_date.setMonth(end_date.getMonth() + 3);
        amount = plan.price_quarterly;
        break;
      case 'half_yearly':
        end_date.setMonth(end_date.getMonth() + 6);
        amount = plan.price_half_yearly;
        break;
      case 'annual':
        end_date.setFullYear(end_date.getFullYear() + 1);
        amount = plan.price_annual;
        break;
    }

    // Create subscription
    const result = await coreDb.query(
      `INSERT INTO subscriptions (
        tenant_id, plan_id, billing_cycle, start_date, end_date, status, amount
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [tenantId, plan_id, billing_cycle, start_date, end_date, 'active', amount]
    );

    // Update tenant
    await coreDb.query(
      `UPDATE tenants SET 
        subscription_plan = $1,
        subscription_status = $2,
        subscription_start_date = $3,
        subscription_end_date = $4,
        max_libraries = $5,
        max_students = $6,
        max_staff = $7
      WHERE id = $8`,
      [
        plan.type,
        'active',
        start_date,
        end_date,
        plan.max_libraries,
        plan.max_students,
        plan.max_staff,
        tenantId,
      ]
    );

    logger.info(`✅ Subscription created for tenant: ${tenantId}`);

    return {
      success: true,
      data: result.rows[0],
      message: 'Subscription activated successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Subscribe error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to create subscription',
      },
    });
  }
});

// Cancel subscription
fastify.post('/api/v1/subscriptions/:id/cancel', async (request, reply) => {
  try {
    const { id } = request.params as { id: string };
    const tenantId = request.headers['x-tenant-id'] as string;
    const { reason } = request.body as { reason: string };

    const result = await coreDb.query(
      `UPDATE subscriptions SET 
        status = 'cancelled',
        cancellation_date = NOW(),
        cancellation_reason = $1
      WHERE id = $2 AND tenant_id = $3
      RETURNING *`,
      [reason, id, tenantId]
    );

    if (!result.rows.length) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.RESOURCE_NOT_FOUND,
          message: 'Subscription not found',
        },
      });
    }

    // Downgrade tenant to free plan
    await coreDb.query(
      `UPDATE tenants SET 
        subscription_plan = 'free',
        subscription_status = 'active'
      WHERE id = $1`,
      [tenantId]
    );

    logger.info(`Subscription cancelled: ${id}`);

    return {
      success: true,
      data: result.rows[0],
      message: 'Subscription cancelled successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Cancel subscription error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to cancel subscription',
      },
    });
  }
});

// Get subscription analytics (Admin)
fastify.get('/api/v1/admin/subscriptions/analytics', async (request, reply) => {
  try {
    const result = await coreDb.query(`
      SELECT 
        sp.name as plan_name,
        sp.type as plan_type,
        COUNT(s.id) as total_subscriptions,
        COUNT(s.id) FILTER (WHERE s.status = 'active') as active_subscriptions,
        SUM(s.amount) FILTER (WHERE s.status = 'active') as monthly_revenue
      FROM subscription_plans sp
      LEFT JOIN subscriptions s ON sp.id = s.plan_id
      GROUP BY sp.id, sp.name, sp.type
      ORDER BY monthly_revenue DESC NULLS LAST
    `);

    return {
      success: true,
      data: result.rows,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Get subscription analytics error:', error);
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
    logger.info(`📋 Subscription Service running on port ${PORT}`);
  } catch (err) {
    logger.error('Failed to start Subscription Service', err);
    process.exit(1);
  }
};

start();

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down Subscription Service...');
  await fastify.close();
  process.exit(0);
});

