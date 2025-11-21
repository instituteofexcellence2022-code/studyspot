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
import { coreDb, tenantDbManager } from '../../config/database';
import { logger } from '../../utils/logger';
import { HTTP_STATUS, ERROR_CODES } from '../../config/constants';
import { authenticate, AuthenticatedRequest, requireRole } from '../../middleware/auth';
import { requestLogger } from '../../middleware/requestLogger';
import { errorHandler, notFoundHandler } from '../../middleware/errorHandler';
import { validateBody, validateQuery, validateParams } from '../../middleware/validator';
import { registerRateLimit, SERVICE_RATE_LIMITS } from '../../middleware/rateLimiter';
import { z } from 'zod';
import type { AdminUser } from '../../types';
import { config } from '../../config/env';

dotenv.config();

const fastify = Fastify({ logger: false });
const PORT = config.ports.user;

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

// Register rate limiting in async function
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
fastify.get('/api/v1/admin/users', async (request: AuthenticatedRequest, reply) => {
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
fastify.get('/api/v1/admin/users/:id', async (request: AuthenticatedRequest, reply) => {
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
fastify.post('/api/v1/admin/users', async (request: AuthenticatedRequest, reply) => {
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
fastify.put('/api/v1/admin/users/:id', async (request: AuthenticatedRequest, reply) => {
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
fastify.delete('/api/v1/admin/users/:id', async (request: AuthenticatedRequest, reply) => {
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
fastify.get('/api/v1/admin/users/:id/activity', async (request: AuthenticatedRequest, reply) => {
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
// PLATFORM ADMIN ENHANCEMENTS
// ============================================

// Get system-wide settings
fastify.get('/api/v1/admin/settings', {
  preHandler: [requireRole('super_admin', 'admin')],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    // Get platform settings from core DB
    const settingsResult = await coreDb.query(`
      SELECT * FROM platform_settings 
      ORDER BY key
    `).catch(() => ({ rows: [] }));

    // Get system health
    const healthResult = await coreDb.query(`
      SELECT 
        (SELECT COUNT(*) FROM tenants WHERE status = 'active') as active_tenants,
        (SELECT COUNT(*) FROM subscriptions WHERE status = 'active') as active_subscriptions,
        (SELECT COUNT(*) FROM admin_users WHERE is_active = true) as active_admins
    `);

    return {
      success: true,
      data: {
        settings: settingsResult.rows.reduce((acc: any, row: any) => {
          acc[row.key] = row.value;
          return acc;
        }, {}),
        systemHealth: healthResult.rows[0],
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Get system settings error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch system settings',
      },
    });
  }
});

// Update system-wide settings
fastify.put('/api/v1/admin/settings', {
  preHandler: [
    requireRole('super_admin'),
    validateBody(z.record(z.any())),
  ],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const settings = request.body as Record<string, any>;

    // Create platform_settings table if it doesn't exist
    await coreDb.query(`
      CREATE TABLE IF NOT EXISTS platform_settings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        key VARCHAR(255) UNIQUE NOT NULL,
        value TEXT,
        description TEXT,
        updated_by UUID,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `).catch(() => {});

    // Update settings
    const updates = await Promise.all(
      Object.entries(settings).map(async ([key, value]) => {
        const result = await coreDb.query(
          `INSERT INTO platform_settings (key, value, updated_by, updated_at)
           VALUES ($1, $2, $3, NOW())
           ON CONFLICT (key) 
           DO UPDATE SET value = $2, updated_by = $3, updated_at = NOW()
           RETURNING *`,
          [key, typeof value === 'object' ? JSON.stringify(value) : value, (request.user as any)?.id]
        );
        return result.rows[0];
      })
    );

    logger.info('System settings updated', { updatedBy: (request.user as any)?.id, keys: Object.keys(settings) });

    return {
      success: true,
      data: updates,
      message: 'System settings updated successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Update system settings error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to update system settings',
      },
    });
  }
});

// Get platform-wide analytics (Admin)
fastify.get('/api/v1/admin/analytics', {
  preHandler: [requireRole('super_admin', 'admin', 'analyst')],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    // Get all tenants for aggregation
    const tenants = await coreDb.query(
      'SELECT id, name, status FROM tenants WHERE deleted_at IS NULL'
    );

    // Aggregate data from all tenants
    const tenantAnalytics = await Promise.all(
      tenants.rows.map(async (tenant) => {
        try {
          const tenantDb = await tenantDbManager.getTenantConnection(tenant.id);
          
          const [students, bookings, revenue] = await Promise.all([
            tenantDb.query('SELECT COUNT(*) as count FROM students WHERE tenant_id = $1 AND deleted_at IS NULL', [tenant.id]).catch(() => ({ rows: [{ count: 0 }] })),
            tenantDb.query('SELECT COUNT(*) as count FROM bookings WHERE tenant_id = $1', [tenant.id]).catch(() => ({ rows: [{ count: 0 }] })),
            tenantDb.query('SELECT SUM(amount) as total FROM payments WHERE tenant_id = $1 AND payment_status = $2', [tenant.id, 'completed']).catch(() => ({ rows: [{ total: 0 }] })),
          ]);

          return {
            tenantId: tenant.id,
            tenantName: tenant.name,
            status: tenant.status,
            students: parseInt(students.rows[0].count),
            bookings: parseInt(bookings.rows[0].count),
            revenue: parseFloat(revenue.rows[0].total || 0),
          };
        } catch (error) {
          logger.warn(`Failed to get analytics for tenant ${tenant.id}`, error);
          return {
            tenantId: tenant.id,
            tenantName: tenant.name,
            status: tenant.status,
            students: 0,
            bookings: 0,
            revenue: 0,
            error: 'Failed to fetch data',
          };
        }
      })
    );

    // Platform totals
    const totals = tenantAnalytics.reduce((acc, tenant) => ({
      totalStudents: acc.totalStudents + tenant.students,
      totalBookings: acc.totalBookings + tenant.bookings,
      totalRevenue: acc.totalRevenue + tenant.revenue,
    }), { totalStudents: 0, totalBookings: 0, totalRevenue: 0 });

    return {
      success: true,
      data: {
        totals,
        tenants: tenantAnalytics,
        summary: {
          totalTenants: tenants.rows.length,
          activeTenants: tenants.rows.filter(t => t.status === 'active').length,
          averageStudentsPerTenant: totals.totalStudents / (tenants.rows.length || 1),
          averageRevenuePerTenant: totals.totalRevenue / (tenants.rows.length || 1),
        },
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Get platform analytics error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch platform analytics',
      },
    });
  }
});

// Get administrative reports
fastify.get('/api/v1/admin/reports', {
  preHandler: [requireRole('super_admin', 'admin', 'analyst')],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { type, startDate, endDate } = request.query as any;

    let reportData: any = {};

    if (type === 'tenants' || !type) {
      // Tenant growth report
      const tenantGrowth = await coreDb.query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as new_tenants,
          COUNT(*) FILTER (WHERE status = 'active') as active_tenants
        FROM tenants
        WHERE created_at >= COALESCE($1, NOW() - INTERVAL '90 days')
          AND created_at <= COALESCE($2, NOW())
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `, [startDate, endDate]);

      reportData.tenantGrowth = tenantGrowth.rows;
    }

    if (type === 'revenue' || !type) {
      // Revenue report
      const revenueReport = await coreDb.query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as transactions,
          SUM(amount) as revenue
        FROM subscriptions
        WHERE created_at >= COALESCE($1, NOW() - INTERVAL '90 days')
          AND created_at <= COALESCE($2, NOW())
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `, [startDate, endDate]);

      reportData.revenue = revenueReport.rows;
    }

    if (type === 'users' || !type) {
      // User activity report
      const userActivity = await coreDb.query(`
        SELECT 
          DATE(last_login_at) as date,
          COUNT(*) as active_users
        FROM admin_users
        WHERE last_login_at >= COALESCE($1, NOW() - INTERVAL '90 days')
          AND last_login_at <= COALESCE($2, NOW())
        GROUP BY DATE(last_login_at)
        ORDER BY date DESC
      `, [startDate, endDate]);

      reportData.userActivity = userActivity.rows;
    }

    return {
      success: true,
      data: reportData,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Get admin reports error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch reports',
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

