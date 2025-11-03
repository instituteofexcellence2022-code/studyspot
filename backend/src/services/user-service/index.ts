// ============================================
// USER SERVICE
// Admin and Tenant user management
// Port: 3002
// ============================================

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { coreDb } from '../../config/database';
import { logger } from '../../utils/logger';
import { HTTP_STATUS, ERROR_CODES } from '../../config/constants';
import type { AdminUser } from '../../types';

dotenv.config();

const fastify = Fastify({ logger: false });
const PORT = parseInt(process.env.USER_SERVICE_PORT || '3002');

// ============================================
// MIDDLEWARE
// ============================================

fastify.register(cors, {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3002'],
  credentials: true,
});

fastify.register(helmet);

// ============================================
// ROUTES - ADMIN USERS
// ============================================

// Health check
fastify.get('/health', async () => {
  return {
    success: true,
    data: {
      status: 'healthy',
      service: 'user-service',
      timestamp: new Date().toISOString(),
    },
  };
});

// Get all admin users
fastify.get('/api/v1/admin/users', async (request, reply) => {
  try {
    const { role, department, status, page = 1, limit = 20 } = request.query as any;

    let query = 'SELECT id, email, first_name, last_name, phone, role, department, permissions, is_active, last_login_at, created_at FROM admin_users WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (role) {
      query += ` AND role = $${paramIndex++}`;
      params.push(role);
    }

    if (department) {
      query += ` AND department = $${paramIndex++}`;
      params.push(department);
    }

    if (status !== undefined) {
      query += ` AND is_active = $${paramIndex++}`;
      params.push(status === 'active');
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
    logger.error('Get admin users error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch admin users',
      },
    });
  }
});

// Get admin user by ID
fastify.get('/api/v1/admin/users/:id', async (request, reply) => {
  try {
    const { id } = request.params as { id: string };

    const result = await coreDb.query(
      'SELECT id, email, first_name, last_name, phone, role, department, permissions, is_active, last_login_at, created_at FROM admin_users WHERE id = $1',
      [id]
    );

    if (!result.rows.length) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.RESOURCE_NOT_FOUND,
          message: 'User not found',
        },
      });
    }

    return {
      success: true,
      data: result.rows[0],
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Get admin user error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch user',
      },
    });
  }
});

// Create admin user
fastify.post('/api/v1/admin/users', async (request, reply) => {
  try {
    const {
      email,
      password,
      first_name,
      last_name,
      phone,
      role,
      department,
      permissions = [],
    } = request.body as any;

    // Validate required fields
    if (!email || !password || !role) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.REQUIRED_FIELD_MISSING,
          message: 'Email, password, and role are required',
        },
      });
    }

    // Check if user already exists
    const existing = await coreDb.query(
      'SELECT id FROM admin_users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existing.rows.length) {
      return reply.status(HTTP_STATUS.CONFLICT).send({
        success: false,
        error: {
          code: ERROR_CODES.DUPLICATE_ENTRY,
          message: 'User with this email already exists',
        },
      });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Create user
    const result = await coreDb.query<AdminUser>(
      `INSERT INTO admin_users (
        email, password_hash, first_name, last_name, phone, role, department, permissions
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, email, first_name, last_name, phone, role, department, permissions, is_active, created_at`,
      [email.toLowerCase(), password_hash, first_name, last_name, phone, role, department, JSON.stringify(permissions)]
    );

    logger.info(`✅ Admin user created: ${email}`);

    return reply.status(HTTP_STATUS.CREATED).send({
      success: true,
      data: result.rows[0],
      message: 'User created successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Create admin user error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to create user',
      },
    });
  }
});

// Update admin user
fastify.put('/api/v1/admin/users/:id', async (request, reply) => {
  try {
    const { id } = request.params as { id: string };
    const updates = request.body as any;

    // Remove sensitive fields
    delete updates.password_hash;
    delete updates.id;

    // If password is being updated, hash it
    if (updates.password) {
      updates.password_hash = await bcrypt.hash(updates.password, 12);
      delete updates.password;
    }

    const fields = Object.keys(updates);
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

    const result = await coreDb.query(
      `UPDATE admin_users SET ${setClause} WHERE id = $1 
       RETURNING id, email, first_name, last_name, phone, role, department, permissions, is_active`,
      values
    );

    if (!result.rows.length) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.RESOURCE_NOT_FOUND,
          message: 'User not found',
        },
      });
    }

    return {
      success: true,
      data: result.rows[0],
      message: 'User updated successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Update admin user error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to update user',
      },
    });
  }
});

// Delete admin user
fastify.delete('/api/v1/admin/users/:id', async (request, reply) => {
  try {
    const { id } = request.params as { id: string };

    const result = await coreDb.query(
      'DELETE FROM admin_users WHERE id = $1 RETURNING id',
      [id]
    );

    if (!result.rows.length) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.RESOURCE_NOT_FOUND,
          message: 'User not found',
        },
      });
    }

    return {
      success: true,
      message: 'User deleted successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Delete admin user error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to delete user',
      },
    });
  }
});

// Get user activity
fastify.get('/api/v1/admin/users/:id/activity', async (request, reply) => {
  try {
    const { id } = request.params as { id: string };
    const { limit = 50 } = request.query as any;

    const result = await coreDb.query(
      `SELECT * FROM audit_logs 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [id, limit]
    );

    return {
      success: true,
      data: result.rows,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Get user activity error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch user activity',
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
    logger.info(`👥 User Service running on port ${PORT}`);
  } catch (err) {
    logger.error('Failed to start User Service', err);
    process.exit(1);
  }
};

start();

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down User Service...');
  await fastify.close();
  process.exit(0);
});

