// ============================================
// TENANT SERVICE
// Tenant CRUD and provisioning
// Port: 3003
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
import type { Tenant } from '../../types';
import { config } from '../../config/env';
import fs from 'fs';
import path from 'path';

dotenv.config();

const fastify = Fastify({ logger: false });
const PORT = config.ports.tenant;

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

const createTenantSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().regex(/^[0-9]{10}$/),
  subscription_plan: z.string().optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  pincode: z.string().regex(/^[0-9]{6}$/).optional(),
});

const updateTenantSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().optional(),
  phone: z.string().regex(/^[0-9]{10}$/).optional(),
  status: z.enum(['active', 'suspended', 'trial', 'inactive']).optional(),
  subscription_plan: z.string().optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  pincode: z.string().regex(/^[0-9]{6}$/).optional(),
});

const getTenantsQuerySchema = z.object({
  status: z.enum(['active', 'suspended', 'trial', 'inactive']).optional(),
  plan: z.string().optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(20).optional(),
});

const tenantParamsSchema = z.object({
  id: z.string().uuid(),
});

const suspendTenantSchema = z.object({
  reason: z.string().max(500).optional(),
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate unique slug from name
 */
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Generate unique database name
 */
const generateDatabaseName = (slug: string): string => {
  const timestamp = Date.now().toString().slice(-6);
  return `studyspot_tenant_${slug}_${timestamp}`;
};

/**
 * Create tenant database and run migrations
 */
const provisionTenantDatabase = async (databaseName: string): Promise<void> => {
  try {
    // Create database
    await coreDb.query(`CREATE DATABASE ${databaseName}`);
    logger.info(`✅ Created database: ${databaseName}`);

    // Connect to new database
    const { Pool } = require('pg');
    const tenantDb = new Pool({
      host: process.env.CORE_DB_HOST,
      port: parseInt(process.env.CORE_DB_PORT || '5432'),
      database: databaseName,
      user: process.env.CORE_DB_USER,
      password: process.env.CORE_DB_PASSWORD,
    });

    // Run tenant schema migration
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '../../../migrations/002_create_tenant_schema.sql'),
      'utf8'
    );

    await tenantDb.query(migrationSQL);
    logger.info(`✅ Ran migrations on: ${databaseName}`);

    await tenantDb.end();
  } catch (error: any) {
    logger.error(`Failed to provision tenant database: ${error.message}`);
    throw error;
  }
};

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
        service: 'tenant-service',
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
        service: 'tenant-service',
        timestamp: new Date().toISOString(),
        error: error.message,
      },
    };
  }
});

// Get all tenants (Admin only)
fastify.get('/api/v1/tenants', {
  preHandler: [
    requireRole('admin', 'super_admin'),
    validateQuery(getTenantsQuerySchema),
  ],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { status, plan, search, page = 1, limit = 20 } = request.query as any;

    let query = 'SELECT * FROM tenants WHERE deleted_at IS NULL';
    const params: any[] = [];
    let paramIndex = 1;

    // Apply filters
    if (status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    if (plan) {
      query += ` AND subscription_plan = $${paramIndex++}`;
      params.push(plan);
    }

    if (search) {
      query += ` AND (name ILIKE $${paramIndex++} OR email ILIKE $${paramIndex})`;
      params.push(`%${search}%`, `%${search}%`);
      paramIndex++;
    }

    // Get total count
    const countResult = await coreDb.query(`SELECT COUNT(*) FROM (${query}) as count_query`, params);
    const total = parseInt(countResult.rows[0].count);

    // Apply pagination
    const offset = (page - 1) * limit;
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
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
    logger.error('Get tenants error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch tenants',
      },
    });
  }
});

// Get tenant by ID
fastify.get('/api/v1/tenants/:id', {
  preHandler: [
    requireRole('admin', 'super_admin'),
    validateParams(tenantParamsSchema),
  ],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { id } = request.params as { id: string };

    const result = await coreDb.query<Tenant>(
      'SELECT * FROM tenants WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (!result.rows.length) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.RESOURCE_NOT_FOUND,
          message: 'Tenant not found',
        },
      });
    }

    return {
      success: true,
      data: result.rows[0],
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Get tenant error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch tenant',
      },
    });
  }
});

// Create tenant (Admin only)
fastify.post('/api/v1/tenants', {
  preHandler: [
    requireRole('admin', 'super_admin'),
    validateBody(createTenantSchema),
  ],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const {
      name,
      email,
      phone,
      subscription_plan = 'free',
      max_libraries = 1,
      max_students = 100,
      max_staff = 10,
    } = request.body as any;

    // Validate required fields
    if (!name || !email) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.REQUIRED_FIELD_MISSING,
          message: 'Name and email are required',
        },
      });
    }

    // Generate slug and database name
    const slug = generateSlug(name);
    const databaseName = generateDatabaseName(slug);

    // Check if tenant already exists
    const existingTenant = await coreDb.query(
      'SELECT id FROM tenants WHERE email = $1 OR slug = $2',
      [email, slug]
    );

    if (existingTenant.rows.length) {
      return reply.status(HTTP_STATUS.CONFLICT).send({
        success: false,
        error: {
          code: ERROR_CODES.DUPLICATE_ENTRY,
          message: 'Tenant with this email or name already exists',
        },
      });
    }

    // Create tenant record
    const result = await coreDb.query<Tenant>(
      `INSERT INTO tenants (
        name, slug, email, phone, subscription_plan, subscription_status,
        max_libraries, max_students, max_staff, database_name, database_host
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        name,
        slug,
        email,
        phone,
        subscription_plan,
        subscription_plan === 'free' ? 'active' : 'trial',
        max_libraries,
        max_students,
        max_staff,
        databaseName,
        process.env.CORE_DB_HOST,
      ]
    );

    const tenant = result.rows[0];

    // Provision tenant database
    await provisionTenantDatabase(databaseName);

    // Create credit wallet for tenant
    await coreDb.query(
      `INSERT INTO tenant_credit_wallets (tenant_id, sms_rate, whatsapp_rate, email_rate)
       VALUES ($1, $2, $3, $4)`,
      [tenant.id, 0.25, 0.35, 0.10] // Retail rates
    );

    logger.info(`✅ Tenant created: ${tenant.name} (${tenant.id})`);

    return reply.status(HTTP_STATUS.CREATED).send({
      success: true,
      data: tenant,
      message: 'Tenant created successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Create tenant error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to create tenant',
      },
    });
  }
});

// Update tenant
fastify.put('/api/v1/tenants/:id', {
  preHandler: [
    requireRole('admin', 'super_admin'),
    validateParams(tenantParamsSchema),
    validateBody(updateTenantSchema),
  ],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { id } = request.params as { id: string };
    const updates = request.body as any;

    // Build update query
    const fields = Object.keys(updates).filter(k => k !== 'id');
    const setClause = fields.map((field, idx) => `${field} = $${idx + 2}`).join(', ');

    if (!setClause) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'No fields to update',
        },
      });
    }

    const values = [id, ...fields.map(f => updates[f])];

    const result = await coreDb.query<Tenant>(
      `UPDATE tenants SET ${setClause} WHERE id = $1 AND deleted_at IS NULL RETURNING *`,
      values
    );

    if (!result.rows.length) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.RESOURCE_NOT_FOUND,
          message: 'Tenant not found',
        },
      });
    }

    return {
      success: true,
      data: result.rows[0],
      message: 'Tenant updated successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Update tenant error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to update tenant',
      },
    });
  }
});

// Delete tenant (soft delete)
fastify.delete('/api/v1/tenants/:id', {
  preHandler: [
    requireRole('super_admin'),
    validateParams(tenantParamsSchema),
  ],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { id } = request.params as { id: string };

    const result = await coreDb.query(
      'UPDATE tenants SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id',
      [id]
    );

    if (!result.rows.length) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.RESOURCE_NOT_FOUND,
          message: 'Tenant not found',
        },
      });
    }

    return {
      success: true,
      message: 'Tenant deleted successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Delete tenant error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to delete tenant',
      },
    });
  }
});

// Suspend tenant
fastify.post('/api/v1/tenants/:id/suspend', {
  preHandler: [
    requireRole('admin', 'super_admin'),
    validateParams(tenantParamsSchema),
    validateBody(suspendTenantSchema),
  ],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { id } = request.params as { id: string };
    const { reason } = request.body as { reason: string };

    const result = await coreDb.query<Tenant>(
      `UPDATE tenants SET status = 'suspended', updated_at = NOW() 
       WHERE id = $1 AND deleted_at IS NULL RETURNING *`,
      [id]
    );

    if (!result.rows.length) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.RESOURCE_NOT_FOUND,
          message: 'Tenant not found',
        },
      });
    }

    logger.info(`Tenant suspended: ${id}, Reason: ${reason}`);

    return {
      success: true,
      data: result.rows[0],
      message: 'Tenant suspended successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Suspend tenant error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to suspend tenant',
      },
    });
  }
});

// Reactivate tenant
fastify.post('/api/v1/tenants/:id/reactivate', {
  preHandler: [
    requireRole('admin', 'super_admin'),
    validateParams(tenantParamsSchema),
  ],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { id } = request.params as { id: string };

    const result = await coreDb.query<Tenant>(
      `UPDATE tenants SET status = 'active', updated_at = NOW() 
       WHERE id = $1 AND deleted_at IS NULL RETURNING *`,
      [id]
    );

    if (!result.rows.length) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.RESOURCE_NOT_FOUND,
          message: 'Tenant not found',
        },
      });
    }

    logger.info(`Tenant reactivated: ${id}`);

    return {
      success: true,
      data: result.rows[0],
      message: 'Tenant reactivated successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Reactivate tenant error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to reactivate tenant',
      },
    });
  }
});

// Get tenant statistics
fastify.get('/api/v1/tenants/:id/stats', {
  preHandler: [
    requireRole('admin', 'super_admin'),
    validateParams(tenantParamsSchema),
  ],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { id } = request.params as { id: string };

    // Get tenant info
    const tenantResult = await coreDb.query<Tenant>(
      'SELECT * FROM tenants WHERE id = $1',
      [id]
    );

    if (!tenantResult.rows.length) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.RESOURCE_NOT_FOUND,
          message: 'Tenant not found',
        },
      });
    }

    const tenant = tenantResult.rows[0];

    // Get statistics (would query tenant database in production)
    const stats = {
      tenant: tenant.name,
      status: tenant.status,
      subscription_plan: tenant.subscription_plan,
      libraries: 0, // TODO: Query from tenant DB
      students: 0,
      staff: 0,
      revenue_this_month: 0,
      active_subscriptions: 0,
    };

    return {
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Get tenant stats error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch tenant statistics',
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

export async function startTenantService() {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    logger.info(`✅ Tenant Service started on port ${PORT}`);
  } catch (err) {
    logger.error('Failed to start Tenant Service:', err);
    process.exit(1);
  }
}

// Start if run directly
if (require.main === module) {
  startTenantService();
}

export default fastify;

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down Tenant Service...');
  await fastify.close();
  process.exit(0);
});

