import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { authenticate, AuthenticatedRequest, requireRole } from '../../middleware/auth';
import { validateQuery, validateParams, validateBody } from '../../middleware/validator';
import { registerRateLimit, SERVICE_RATE_LIMITS } from '../../middleware/rateLimiter';
import { requestLogger } from '../../middleware/requestLogger';
import { errorHandler, notFoundHandler } from '../../middleware/errorHandler';
import { logger } from '../../utils/logger';
import { HTTP_STATUS, ERROR_CODES } from '../../config/constants';
import { coreDb, tenantDbManager } from '../../config/database';
import { config } from '../../config/env';
import { z } from 'zod';

const PORT = config.ports.admin;
const fastify: FastifyInstance = Fastify({
  logger: false,
  requestIdLogLabel: 'reqId',
  genReqId: () => crypto.randomUUID(),
});

// ============================================
// PLUGINS
// ============================================

fastify.register(cors, {
  origin: config.cors.origins.length > 0 ? config.cors.origins : '*',
  credentials: true,
});

fastify.register(helmet);

// ============================================
// MIDDLEWARE
// ============================================

fastify.addHook('onRequest', requestLogger);

// Authentication - skip health check
fastify.addHook('onRequest', async (request, reply) => {
  if (request.url === '/health') return;
  await authenticate(request as AuthenticatedRequest, reply);
});

// Rate limiting
(async () => {
  await registerRateLimit(fastify, SERVICE_RATE_LIMITS.default);
})();

// Error handling
fastify.setErrorHandler(errorHandler);
fastify.setNotFoundHandler(notFoundHandler);

// ============================================
// VALIDATION SCHEMAS
// ============================================

const getTenantsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(20).optional(),
  status: z.enum(['active', 'suspended', 'inactive']).optional(),
  search: z.string().max(100).optional(),
});

const tenantParamsSchema = z.object({
  id: z.string().uuid(),
});

const getPlatformAnalyticsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  period: z.enum(['day', 'week', 'month', 'year']).default('month').optional(),
});

const getTenantDataParamsSchema = z.object({
  tenantId: z.string().uuid(),
});

const getTenantDataQuerySchema = z.object({
  type: z.enum(['students', 'bookings', 'payments', 'libraries']).default('students'),
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(20).optional(),
});

const suspendTenantSchema = z.object({
  reason: z.string().max(500).optional(),
});

// ============================================
// HEALTH CHECK
// ============================================

fastify.get('/health', async (request, reply) => {
  try {
    // Check database connectivity
    await coreDb.query('SELECT 1');
    
    return reply.send({
      status: 'healthy',
      service: 'admin-service',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error: any) {
    logger.error('Health check failed:', error);
    return reply.status(HTTP_STATUS.SERVICE_UNAVAILABLE).send({
      status: 'unhealthy',
      service: 'admin-service',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
    });
  }
});

// ============================================
// PLATFORM MANAGEMENT
// ============================================

/**
 * Get all tenants
 * GET /api/v1/admin/tenants
 */
fastify.get('/api/v1/admin/tenants', {
  preHandler: [
    requireRole('super_admin', 'admin'),
    validateQuery(getTenantsQuerySchema),
  ],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { page = 1, limit = 20, status, search } = request.query as any;

    let query = 'SELECT * FROM tenants WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    if (search) {
      query += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Get total count
    const countResult = await coreDb.query(
      query.replace('SELECT *', 'SELECT COUNT(*) as count')
    );
    const total = parseInt(countResult.rows[0].count);

    // Pagination
    const offset = (page - 1) * limit;
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await coreDb.query(query, params);

    return reply.send({
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
    });
  } catch (error: any) {
    logger.error('Error fetching tenants:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch tenants',
      },
    });
  }
});

/**
 * Get tenant by ID
 * GET /api/v1/admin/tenants/:id
 */
fastify.get('/api/v1/admin/tenants/:id', {
  preHandler: [
    requireRole('super_admin', 'admin'),
    validateParams(tenantParamsSchema),
  ],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { id } = request.params as any;

    const result = await coreDb.query(
      'SELECT * FROM tenants WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: 'Tenant not found',
        },
      });
    }

    // Get subscription info
    const subscriptionResult = await coreDb.query(
      `SELECT s.*, sp.name as plan_name 
       FROM subscriptions s
       LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
       WHERE s.tenant_id = $1
       ORDER BY s.created_at DESC
       LIMIT 1`,
      [id]
    );

    return reply.send({
      success: true,
      data: {
        ...result.rows[0],
        subscription: subscriptionResult.rows[0] || null,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Error fetching tenant:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch tenant',
      },
    });
  }
});

/**
 * Suspend tenant
 * POST /api/v1/admin/tenants/:id/suspend
 */
fastify.post('/api/v1/admin/tenants/:id/suspend', {
  preHandler: [
    requireRole('super_admin'),
    validateParams(tenantParamsSchema),
    validateBody(suspendTenantSchema),
  ],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { id } = request.params as any;
    const { reason } = request.body as any;

    const result = await coreDb.query(
      `UPDATE tenants 
       SET status = 'suspended', updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: 'Tenant not found',
        },
      });
    }

    // Log suspension
    await coreDb.query(
      `INSERT INTO audit_logs (user_id, tenant_id, action, resource_type, resource_id, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        (request.user as any)?.id || (request.user as any)?.userId,
        id,
        'tenant:suspend',
        'tenant',
        id,
        JSON.stringify({ reason }),
        request.ip,
        request.headers['user-agent'],
      ]
    );

    return reply.send({
      success: true,
      message: 'Tenant suspended successfully',
      data: result.rows[0],
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Error suspending tenant:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to suspend tenant',
      },
    });
  }
});

/**
 * Reactivate tenant
 * POST /api/v1/admin/tenants/:id/reactivate
 */
fastify.post('/api/v1/admin/tenants/:id/reactivate', {
  preHandler: [
    requireRole('super_admin'),
    validateParams(tenantParamsSchema),
  ],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { id } = request.params as any;

    const result = await coreDb.query(
      `UPDATE tenants 
       SET status = 'active', updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: 'Tenant not found',
        },
      });
    }

    return reply.send({
      success: true,
      message: 'Tenant reactivated successfully',
      data: result.rows[0],
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Error reactivating tenant:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to reactivate tenant',
      },
    });
  }
});

// ============================================
// PLATFORM ANALYTICS
// ============================================

/**
 * Get platform analytics
 * GET /api/v1/admin/analytics
 */
fastify.get('/api/v1/admin/analytics', {
  preHandler: [
    requireRole('super_admin', 'admin'),
    validateQuery(getPlatformAnalyticsQuerySchema),
  ],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { startDate, endDate, period = 'month' } = request.query as any;

    // Get total tenants
    const tenantsResult = await coreDb.query(
      'SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = $1) as active FROM tenants',
      ['active']
    );

    // Get total subscriptions
    const subscriptionsResult = await coreDb.query(
      `SELECT COUNT(*) as total, 
              COUNT(*) FILTER (WHERE subscription_status = $1) as active
       FROM subscriptions`,
      ['active']
    );

    // Get platform revenue (aggregate from all tenant DBs)
    const tenants = await coreDb.query(
      'SELECT id FROM tenants WHERE status = $1',
      ['active']
    );

    let totalRevenue = 0;
    for (const tenant of tenants.rows) {
      try {
        const tenantDb = await tenantDbManager.getTenantConnection(tenant.id);
        const revenueResult = await tenantDb.query(
          `SELECT SUM(amount) as total 
           FROM payments 
           WHERE payment_status = $1 AND tenant_id = $2`,
          ['completed', tenant.id]
        );
        totalRevenue += parseFloat(revenueResult.rows[0]?.total || 0);
      } catch (error) {
        // Skip if tenant DB not accessible
        logger.warn(`Could not access tenant DB for ${tenant.id}`);
      }
    }

    return reply.send({
      success: true,
      data: {
        tenants: {
          total: parseInt(tenantsResult.rows[0].total),
          active: parseInt(tenantsResult.rows[0].active),
        },
        subscriptions: {
          total: parseInt(subscriptionsResult.rows[0].total),
          active: parseInt(subscriptionsResult.rows[0].active),
        },
        revenue: {
          total: totalRevenue,
          currency: 'INR',
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Error fetching platform analytics:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch platform analytics',
      },
    });
  }
});

// ============================================
// TENANT DATA ACCESS (FOR SUPPORT)
// ============================================

/**
 * Get tenant data (students, bookings, payments, libraries)
 * GET /api/v1/admin/tenants/:tenantId/data
 */
fastify.get('/api/v1/admin/tenants/:tenantId/data', {
  preHandler: [
    requireRole('super_admin', 'admin'),
    validateParams(getTenantDataParamsSchema),
    validateQuery(getTenantDataQuerySchema),
  ],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { tenantId } = request.params as any;
    const { type = 'students', page = 1, limit = 20 } = request.query as any;

    // Verify tenant exists
    const tenantResult = await coreDb.query(
      'SELECT id, name FROM tenants WHERE id = $1',
      [tenantId]
    );

    if (tenantResult.rows.length === 0) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: 'Tenant not found',
        },
      });
    }

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);
    const offset = (page - 1) * limit;

    let query = '';
    let countQuery = '';

    switch (type) {
      case 'students':
        query = `SELECT * FROM students WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
        countQuery = `SELECT COUNT(*) FROM students WHERE tenant_id = $1`;
        break;
      case 'bookings':
        query = `SELECT * FROM bookings WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
        countQuery = `SELECT COUNT(*) FROM bookings WHERE tenant_id = $1`;
        break;
      case 'payments':
        query = `SELECT * FROM payments WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
        countQuery = `SELECT COUNT(*) FROM payments WHERE tenant_id = $1`;
        break;
      case 'libraries':
        query = `SELECT * FROM libraries WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
        countQuery = `SELECT COUNT(*) FROM libraries WHERE tenant_id = $1`;
        break;
      default:
        return reply.status(HTTP_STATUS.BAD_REQUEST).send({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Invalid data type',
          },
        });
    }

    const [dataResult, countResult] = await Promise.all([
      tenantDb.query(query, [tenantId, limit, offset]),
      tenantDb.query(countQuery, [tenantId]),
    ]);

    const total = parseInt(countResult.rows[0].count);

    return reply.send({
      success: true,
      data: dataResult.rows,
      tenant: tenantResult.rows[0],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Error fetching tenant data:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch tenant data',
      },
    });
  }
});

// ============================================
// SUBSCRIPTION MANAGEMENT
// ============================================

/**
 * Get all subscriptions
 * GET /api/v1/admin/subscriptions
 */
fastify.get('/api/v1/admin/subscriptions', {
  preHandler: [
    requireRole('super_admin', 'admin'),
    validateQuery(getTenantsQuerySchema),
  ],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { page = 1, limit = 20 } = request.query as any;

    const offset = (page - 1) * limit;

    const result = await coreDb.query(
      `SELECT s.*, t.name as tenant_name, sp.name as plan_name
       FROM subscriptions s
       JOIN tenants t ON s.tenant_id = t.id
       LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
       ORDER BY s.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await coreDb.query('SELECT COUNT(*) FROM subscriptions');
    const total = parseInt(countResult.rows[0].count);

    return reply.send({
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
    });
  } catch (error: any) {
    logger.error('Error fetching subscriptions:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch subscriptions',
      },
    });
  }
});

// ============================================
// START SERVER
// ============================================

export async function startAdminService() {
  try {
    await fastify.listen({ port: PORT as number, host: '0.0.0.0' });
    logger.info(`✅ Admin Service started on port ${PORT}`);
  } catch (err) {
    logger.error('Failed to start Admin Service:', err);
    process.exit(1);
  }
}

// Start if run directly
if (require.main === module) {
  startAdminService();
}

