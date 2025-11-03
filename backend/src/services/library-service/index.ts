// ============================================
// LIBRARY SERVICE
// Library CRUD + Real-time occupancy
// Port: 3005
// ============================================

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import dotenv from 'dotenv';
import { tenantDbManager } from '../../config/database';
import { logger } from '../../utils/logger';
import { HTTP_STATUS, ERROR_CODES } from '../../config/constants';

dotenv.config();

const fastify = Fastify({ logger: false });
const PORT = parseInt(process.env.LIBRARY_SERVICE_PORT || '3005');

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
      service: 'library-service',
      timestamp: new Date().toISOString(),
    },
  };
});

// Get all libraries
fastify.get('/api/v1/libraries', async (request, reply) => {
  try {
    const tenantId = request.headers['x-tenant-id'] as string;
    const { status, city, page = 1, limit = 20 } = request.query as any;

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    let query = 'SELECT * FROM libraries WHERE tenant_id = $1 AND deleted_at IS NULL';
    const params: any[] = [tenantId];
    let paramIndex = 2;

    if (status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    if (city) {
      query += ` AND city = $${paramIndex++}`;
      params.push(city);
    }

    // Get total count
    const countResult = await tenantDb.query(`SELECT COUNT(*) FROM (${query}) as count_query`, params);
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
    logger.error('Get libraries error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch libraries',
      },
    });
  }
});

// Get library by ID
fastify.get('/api/v1/libraries/:id', async (request, reply) => {
  try {
    const { id } = request.params as { id: string };
    const tenantId = request.headers['x-tenant-id'] as string;

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    const result = await tenantDb.query(
      'SELECT * FROM libraries WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL',
      [id, tenantId]
    );

    if (!result.rows.length) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.RESOURCE_NOT_FOUND,
          message: 'Library not found',
        },
      });
    }

    return {
      success: true,
      data: result.rows[0],
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Get library error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch library',
      },
    });
  }
});

// Create library
fastify.post('/api/v1/libraries', async (request, reply) => {
  try {
    const tenantId = request.headers['x-tenant-id'] as string;
    const libraryData = request.body as any;

    if (!libraryData.name) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.REQUIRED_FIELD_MISSING,
          message: 'Library name is required',
        },
      });
    }

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    const result = await tenantDb.query(
      `INSERT INTO libraries (
        tenant_id, name, address, city, state, pincode, phone, email,
        latitude, longitude, capacity, opening_time, closing_time, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        tenantId,
        libraryData.name,
        libraryData.address,
        libraryData.city,
        libraryData.state,
        libraryData.pincode,
        libraryData.phone,
        libraryData.email,
        libraryData.latitude,
        libraryData.longitude,
        libraryData.capacity,
        libraryData.opening_time,
        libraryData.closing_time,
        'active',
      ]
    );

    logger.info(`✅ Library created: ${libraryData.name}`);

    return reply.status(HTTP_STATUS.CREATED).send({
      success: true,
      data: result.rows[0],
      message: 'Library created successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Create library error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to create library',
      },
    });
  }
});

// Get real-time occupancy
fastify.get('/api/v1/libraries/realtime-occupancy', async (request, reply) => {
  try {
    const tenantId = request.headers['x-tenant-id'] as string;
    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    const result = await tenantDb.query(`
      SELECT 
        l.id,
        l.name,
        l.capacity,
        l.current_occupancy,
        ROUND((l.current_occupancy::numeric / NULLIF(l.capacity, 0)) * 100, 2) as occupancy_percentage,
        COUNT(DISTINCT a.student_id) FILTER (WHERE a.date = CURRENT_DATE AND a.check_out_time IS NULL) as checked_in_today
      FROM libraries l
      LEFT JOIN attendance a ON l.id = a.library_id
      WHERE l.tenant_id = $1 AND l.deleted_at IS NULL
      GROUP BY l.id
      ORDER BY l.name
    `, [tenantId]);

    return {
      success: true,
      data: result.rows,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Get occupancy error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch occupancy',
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
    logger.info(`📚 Library Service running on port ${PORT}`);
  } catch (err) {
    logger.error('Failed to start Library Service', err);
    process.exit(1);
  }
};

start();

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down Library Service...');
  await fastify.close();
  process.exit(0);
});

