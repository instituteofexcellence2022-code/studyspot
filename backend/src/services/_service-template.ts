/**
 * 📋 PROFESSIONAL SERVICE TEMPLATE
 * 
 * This template shows the standard structure for all microservices
 * Copy this structure when creating new services or enhancing existing ones
 */

import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import dotenv from 'dotenv';
import { coreDb, tenantDbManager } from '../../config/database';
import { logger } from '../../utils/logger';
import { HTTP_STATUS, ERROR_CODES } from '../../config/constants';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth';
import { validateBody, validateQuery, validateParams } from '../../middleware/validator';
import { registerRateLimit, SERVICE_RATE_LIMITS } from '../../middleware/rateLimiter';
import { requestLogger } from '../../middleware/requestLogger';
import { errorHandler, notFoundHandler } from '../../middleware/errorHandler';
import { z } from 'zod';

dotenv.config();

const fastify = Fastify({ 
  logger: false,
  requestIdLogLabel: 'reqId',
  requestIdHeader: 'x-request-id',
});

const PORT = parseInt(process.env.SERVICE_PORT || '3000');
const SERVICE_NAME = 'service-name';

// ============================================
// MIDDLEWARE
// ============================================

// CORS Configuration
fastify.register(cors, {
  origin: process.env.CORS_ORIGIN?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:5173',
    /\.vercel\.app$/,
    /\.pages\.dev$/,
    /\.netlify\.app$/,
    /\.onrender\.com$/,
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id', 'X-Requested-With'],
});

// Security Headers
fastify.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
});

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
  // Skip auth for health check and public endpoints
  const publicPaths = ['/health', '/metrics', '/api/v1/public'];
  if (publicPaths.some(path => request.url.startsWith(path))) {
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

// Example validation schemas
const createResourceSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
});

const updateResourceSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
});

const getResourcesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(20).optional(),
  search: z.string().max(100).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

const resourceParamsSchema = z.object({
  id: z.string().uuid(),
});

// ============================================
// ROUTES
// ============================================

/**
 * Health Check Endpoint
 * GET /health
 */
fastify.get('/health', async () => {
  try {
    // Check database connectivity
    await coreDb.query('SELECT 1');
    
    return {
      success: true,
      data: {
        status: 'healthy',
        service: SERVICE_NAME,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
      },
    };
  } catch (error: any) {
    logger.error('Health check failed:', error);
    return {
      success: false,
      data: {
        status: 'unhealthy',
        service: SERVICE_NAME,
        timestamp: new Date().toISOString(),
        error: error.message,
      },
    };
  }
});

/**
 * Get All Resources
 * GET /api/v1/resources
 */
fastify.get('/api/v1/resources', {
  preHandler: [validateQuery(getResourcesQuerySchema)],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId;
    const { page = 1, limit = 20, search, status } = request.query as any;

    if (!tenantId) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Tenant ID is required',
        },
      });
    }

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    // Build query
    let query = 'SELECT * FROM resources WHERE tenant_id = $1 AND deleted_at IS NULL';
    const params: any[] = [tenantId];
    let paramIndex = 2;

    if (status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    if (search) {
      query += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Get total count
    const countResult = await tenantDb.query(
      `SELECT COUNT(*) FROM (${query}) as count_query`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // Apply pagination
    const offset = (page - 1) * limit;
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(limit, offset);

    const result = await tenantDb.query(query, params);

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
    logger.error('Get resources error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch resources',
      },
    });
  }
});

/**
 * Get Resource by ID
 * GET /api/v1/resources/:id
 */
fastify.get('/api/v1/resources/:id', {
  preHandler: [validateParams(resourceParamsSchema)],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { id } = request.params as any;
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId;

    if (!tenantId) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Tenant ID is required',
        },
      });
    }

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    const result = await tenantDb.query(
      'SELECT * FROM resources WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL',
      [id, tenantId]
    );

    if (result.rows.length === 0) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: 'Resource not found',
        },
      });
    }

    return {
      success: true,
      data: result.rows[0],
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Get resource error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch resource',
      },
    });
  }
});

/**
 * Create Resource
 * POST /api/v1/resources
 */
fastify.post('/api/v1/resources', {
  preHandler: [validateBody(createResourceSchema)],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId;
    const { name, description } = request.body as any;

    if (!tenantId) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Tenant ID is required',
        },
      });
    }

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    const result = await tenantDb.query(
      `INSERT INTO resources (tenant_id, name, description, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING *`,
      [tenantId, name, description || null]
    );

    logger.info(`Resource created: ${result.rows[0].id}`);

    return {
      success: true,
      data: result.rows[0],
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Create resource error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to create resource',
      },
    });
  }
});

/**
 * Update Resource
 * PUT /api/v1/resources/:id
 */
fastify.put('/api/v1/resources/:id', {
  preHandler: [
    validateParams(resourceParamsSchema),
    validateBody(updateResourceSchema),
  ],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { id } = request.params as any;
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId;
    const updates = request.body as any;

    if (!tenantId) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Tenant ID is required',
        },
      });
    }

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    // Build update query dynamically
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.name !== undefined) {
      updateFields.push(`name = $${paramIndex++}`);
      values.push(updates.name);
    }

    if (updates.description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      values.push(updates.description);
    }

    if (updateFields.length === 0) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'No fields to update',
        },
      });
    }

    updateFields.push(`updated_at = NOW()`);
    values.push(id, tenantId);

    const result = await tenantDb.query(
      `UPDATE resources 
       SET ${updateFields.join(', ')}
       WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex} AND deleted_at IS NULL
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: 'Resource not found',
        },
      });
    }

    logger.info(`Resource updated: ${id}`);

    return {
      success: true,
      data: result.rows[0],
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Update resource error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to update resource',
      },
    });
  }
});

/**
 * Delete Resource (Soft Delete)
 * DELETE /api/v1/resources/:id
 */
fastify.delete('/api/v1/resources/:id', {
  preHandler: [validateParams(resourceParamsSchema)],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { id } = request.params as any;
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId;

    if (!tenantId) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Tenant ID is required',
        },
      });
    }

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    const result = await tenantDb.query(
      `UPDATE resources 
       SET deleted_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL
       RETURNING *`,
      [id, tenantId]
    );

    if (result.rows.length === 0) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: 'Resource not found',
        },
      });
    }

    logger.info(`Resource deleted: ${id}`);

    return {
      success: true,
      message: 'Resource deleted successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Delete resource error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to delete resource',
      },
    });
  }
});

// ============================================
// START SERVER
// ============================================

export async function startService() {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    logger.info(`✅ ${SERVICE_NAME} started on port ${PORT}`);
  } catch (error) {
    logger.error(`Failed to start ${SERVICE_NAME}:`, error);
    process.exit(1);
  }
}

// Start if run directly
if (require.main === module) {
  startService();
}

export default fastify;

