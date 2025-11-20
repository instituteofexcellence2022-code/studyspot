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
// FEE PLANS ENDPOINTS
// ============================================

// Get all fee plans
fastify.get('/api/fee-plans', async (request, reply) => {
  try {
    const tenantId = request.headers['x-tenant-id'] as string;
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

    // Check if fee_plans table exists, if not return empty array
    const tableExists = await tenantDb.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'fee_plans'
      )
    `);

    if (!tableExists.rows[0].exists) {
      return {
        success: true,
        data: { plans: [] },
        message: 'Fee plans table does not exist yet',
      };
    }

    const result = await tenantDb.query(`
      SELECT * FROM fee_plans 
      WHERE tenant_id = $1 
      ORDER BY created_at DESC
    `, [tenantId]);

    return {
      success: true,
      data: { plans: result.rows },
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Get fee plans error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch fee plans',
      },
    });
  }
});

// Create fee plan
fastify.post('/api/fee-plans', async (request, reply) => {
  try {
    const tenantId = request.headers['x-tenant-id'] as string;
    if (!tenantId) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Tenant ID is required',
        },
      });
    }

    const planData = request.body as any;
    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    // Create fee_plans table if it doesn't exist
    await tenantDb.query(`
      CREATE TABLE IF NOT EXISTS fee_plans (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(50) NOT NULL CHECK (type IN ('hourly', 'daily', 'weekly', 'monthly', 'quarterly', 'annual', 'combo')),
        base_price DECIMAL(10,2) NOT NULL,
        shift_pricing JSONB DEFAULT '{}',
        zone_pricing JSONB DEFAULT '{}',
        discount JSONB DEFAULT '{}',
        max_seats INTEGER,
        max_hours INTEGER,
        scholarship_eligible BOOLEAN DEFAULT false,
        waiver_allowed BOOLEAN DEFAULT false,
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
        is_popular BOOLEAN DEFAULT false,
        features JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(tenant_id, name)
      )
    `);

    // Create indexes
    await tenantDb.query(`
      CREATE INDEX IF NOT EXISTS idx_fee_plans_tenant ON fee_plans(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_fee_plans_type ON fee_plans(type);
      CREATE INDEX IF NOT EXISTS idx_fee_plans_status ON fee_plans(status);
    `);

    const result = await tenantDb.query(`
      INSERT INTO fee_plans (
        tenant_id, name, description, type, base_price, shift_pricing, 
        zone_pricing, discount, max_seats, max_hours, scholarship_eligible, 
        waiver_allowed, status, is_popular, features
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `, [
      tenantId,
      planData.name,
      planData.description || '',
      planData.type,
      planData.basePrice || 0,
      JSON.stringify(planData.shiftPricing || {}),
      JSON.stringify(planData.zonePricing || {}),
      JSON.stringify(planData.discount || {}),
      planData.maxSeats,
      planData.maxHours,
      planData.scholarshipEligible || false,
      planData.waiverAllowed || false,
      planData.status || 'active',
      planData.isPopular || false,
      JSON.stringify(planData.features || [])
    ]);

    logger.info(`✅ Fee plan created: ${planData.name}`);

    return reply.status(HTTP_STATUS.CREATED).send({
      success: true,
      data: result.rows[0],
      message: 'Fee plan created successfully',
    });
  } catch (error: any) {
    logger.error('Create fee plan error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to create fee plan',
        details: error.message,
      },
    });
  }
});

// Update fee plan
fastify.put('/api/fee-plans/:id', async (request, reply) => {
  try {
    const { id } = request.params as { id: string };
    const tenantId = request.headers['x-tenant-id'] as string;
    const planData = request.body as any;

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

    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (planData.name !== undefined) {
      updateFields.push(`name = $${paramIndex++}`);
      values.push(planData.name);
    }
    if (planData.description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      values.push(planData.description);
    }
    if (planData.type !== undefined) {
      updateFields.push(`type = $${paramIndex++}`);
      values.push(planData.type);
    }
    if (planData.basePrice !== undefined) {
      updateFields.push(`base_price = $${paramIndex++}`);
      values.push(planData.basePrice);
    }
    if (planData.shiftPricing !== undefined) {
      updateFields.push(`shift_pricing = $${paramIndex++}`);
      values.push(JSON.stringify(planData.shiftPricing));
    }
    if (planData.zonePricing !== undefined) {
      updateFields.push(`zone_pricing = $${paramIndex++}`);
      values.push(JSON.stringify(planData.zonePricing));
    }
    if (planData.discount !== undefined) {
      updateFields.push(`discount = $${paramIndex++}`);
      values.push(JSON.stringify(planData.discount));
    }
    if (planData.status !== undefined) {
      updateFields.push(`status = $${paramIndex++}`);
      values.push(planData.status);
    }
    if (planData.isPopular !== undefined) {
      updateFields.push(`is_popular = $${paramIndex++}`);
      values.push(planData.isPopular);
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

    const result = await tenantDb.query(`
      UPDATE fee_plans 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex}
      RETURNING *
    `, values);

    if (!result.rows.length) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: 'Fee plan not found',
        },
      });
    }

    return {
      success: true,
      data: result.rows[0],
      message: 'Fee plan updated successfully',
    };
  } catch (error: any) {
    logger.error('Update fee plan error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to update fee plan',
      },
    });
  }
});

// Delete fee plan
fastify.delete('/api/fee-plans/:id', async (request, reply) => {
  try {
    const { id } = request.params as { id: string };
    const tenantId = request.headers['x-tenant-id'] as string;

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

    const result = await tenantDb.query(`
      DELETE FROM fee_plans 
      WHERE id = $1 AND tenant_id = $2
      RETURNING id
    `, [id, tenantId]);

    if (!result.rows.length) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: 'Fee plan not found',
        },
      });
    }

    return {
      success: true,
      message: 'Fee plan deleted successfully',
    };
  } catch (error: any) {
    logger.error('Delete fee plan error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to delete fee plan',
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

