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
import { authenticate, AuthenticatedRequest, requireRole } from '../../middleware/auth';
import { validateBody, validateQuery, validateParams } from '../../middleware/validator';
import { registerRateLimit, SERVICE_RATE_LIMITS } from '../../middleware/rateLimiter';
import { requestLogger } from '../../middleware/requestLogger';
import { errorHandler, notFoundHandler } from '../../middleware/errorHandler';
import { z } from 'zod';
import { config } from '../../config/env';

dotenv.config();

const fastify = Fastify({ logger: false });
const PORT = config.ports.subscription;

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

const createSubscriptionPlanSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  type: z.enum(['free', 'basic', 'premium', 'enterprise']),
  price_monthly: z.coerce.number().nonnegative(),
  price_quarterly: z.coerce.number().nonnegative().optional(),
  price_half_yearly: z.coerce.number().nonnegative().optional(),
  price_annual: z.coerce.number().nonnegative().optional(),
  max_libraries: z.coerce.number().int().positive().optional(),
  max_students: z.coerce.number().int().positive().optional(),
  max_staff: z.coerce.number().int().positive().optional(),
  features: z.array(z.string()).optional(),
  permissions: z.record(z.any()).optional(),
  is_popular: z.boolean().optional().default(false),
});

const updateSubscriptionPlanSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  price_monthly: z.coerce.number().nonnegative().optional(),
  price_quarterly: z.coerce.number().nonnegative().optional(),
  price_half_yearly: z.coerce.number().nonnegative().optional(),
  price_annual: z.coerce.number().nonnegative().optional(),
  max_libraries: z.coerce.number().int().positive().optional(),
  max_students: z.coerce.number().int().positive().optional(),
  max_staff: z.coerce.number().int().positive().optional(),
  features: z.array(z.string()).optional(),
  permissions: z.record(z.any()).optional(),
  is_popular: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

const subscriptionQuerySchema = z.object({
  is_active: z.string().optional(),
  type: z.string().optional(),
});

const subscriptionParamsSchema = z.object({
  id: z.string().uuid(),
});

// ============================================
// ROUTES
// ============================================

// Health check
fastify.get('/health', async () => {
  try {
    await coreDb.query('SELECT 1');
    return {
      success: true,
      data: {
        status: 'healthy',
        service: 'subscription-service',
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
        service: 'subscription-service',
        timestamp: new Date().toISOString(),
        error: error.message,
      },
    };
  }
});

// Get all subscription plans (Admin)
fastify.get('/api/v1/admin/subscriptions/plans', {
  preHandler: [
    requireRole('admin', 'super_admin'),
    validateQuery(subscriptionQuerySchema),
  ],
}, async (request: AuthenticatedRequest, reply) => {
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
fastify.post('/api/v1/admin/subscriptions/plans', {
  preHandler: [
    requireRole('admin', 'super_admin'),
    validateBody(createSubscriptionPlanSchema),
  ],
}, async (request: AuthenticatedRequest, reply) => {
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
const subscribeSchema = z.object({
  plan_id: z.string().uuid(),
  billing_cycle: z.enum(['monthly', 'quarterly', 'half_yearly', 'annual']),
  payment_method: z.string().optional(),
});

fastify.post('/api/v1/subscriptions/subscribe', {
  preHandler: [validateBody(subscribeSchema)],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;
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
const cancelSubscriptionSchema = z.object({
  reason: z.string().max(500).optional(),
});

fastify.post('/api/v1/subscriptions/:id/cancel', {
  preHandler: [
    validateParams(subscriptionParamsSchema),
    validateBody(cancelSubscriptionSchema),
  ],
}, async (request: AuthenticatedRequest, reply) => {
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
fastify.get('/api/v1/admin/subscriptions/analytics', {
  preHandler: [requireRole('admin', 'super_admin')],
}, async (request: AuthenticatedRequest, reply) => {
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

// ============================================
// START SERVER
// ============================================

export async function startSubscriptionService() {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    logger.info(`✅ Subscription Service started on port ${PORT}`);
  } catch (err) {
    logger.error('Failed to start Subscription Service:', err);
    process.exit(1);
  }
}

// Start if run directly
if (require.main === module) {
  startSubscriptionService();
}

export default fastify;

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down Subscription Service...');
  await fastify.close();
  process.exit(0);
});

