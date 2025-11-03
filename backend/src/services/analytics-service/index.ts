// ============================================
// ANALYTICS SERVICE
// Platform-wide analytics and reporting
// Port: 3013
// ============================================

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import dotenv from 'dotenv';
import { coreDb, tenantDbManager } from '../../config/database';
import { logger } from '../../utils/logger';
import { HTTP_STATUS, ERROR_CODES } from '../../config/constants';

dotenv.config();

const fastify = Fastify({ logger: false });
const PORT = parseInt(process.env.ANALYTICS_SERVICE_PORT || '3013');

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
      service: 'analytics-service',
      timestamp: new Date().toISOString(),
    },
  };
});

// Executive dashboard analytics (Admin)
fastify.get('/api/v1/analytics/executive', async (request, reply) => {
  try {
    // Platform-wide statistics
    const tenantsResult = await coreDb.query(`
      SELECT 
        COUNT(*) as total_tenants,
        COUNT(*) FILTER (WHERE status = 'active') as active_tenants,
        COUNT(*) FILTER (WHERE status = 'trial') as trial_tenants,
        COUNT(*) FILTER (WHERE status = 'suspended') as suspended_tenants,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_this_month
      FROM tenants
      WHERE deleted_at IS NULL
    `);

    const subscriptionsResult = await coreDb.query(`
      SELECT 
        SUM(amount) FILTER (WHERE status = 'active') as monthly_recurring_revenue,
        COUNT(*) FILTER (WHERE status = 'active') as active_subscriptions,
        COUNT(*) FILTER (WHERE end_date < NOW()) as expired_subscriptions
      FROM subscriptions
    `);

    const creditsResult = await coreDb.query(`
      SELECT 
        SUM(sms_credits) as total_sms_allocated,
        SUM(whatsapp_credits) as total_whatsapp_allocated,
        SUM(email_credits) as total_email_allocated,
        SUM(total_spent) as total_credit_revenue
      FROM tenant_credit_wallets
    `);

    return {
      success: true,
      data: {
        tenants: tenantsResult.rows[0],
        subscriptions: subscriptionsResult.rows[0],
        credits: creditsResult.rows[0],
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Get executive analytics error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch analytics',
      },
    });
  }
});

// Revenue analytics (Admin)
fastify.get('/api/v1/analytics/revenue', async (request, reply) => {
  try {
    const { period = '30d' } = request.query as any;

    let interval = '30 days';
    if (period === '7d') interval = '7 days';
    else if (period === '90d') interval = '90 days';
    else if (period === '1y') interval = '1 year';

    // Revenue by plan
    const revenueByPlan = await coreDb.query(`
      SELECT 
        sp.name as plan_name,
        sp.type as plan_type,
        COUNT(s.id) as subscriptions,
        SUM(s.amount) as total_revenue
      FROM subscription_plans sp
      LEFT JOIN subscriptions s ON sp.id = s.plan_id 
        AND s.status = 'active' 
        AND s.created_at >= NOW() - INTERVAL '${interval}'
      GROUP BY sp.id, sp.name, sp.type
      ORDER BY total_revenue DESC NULLS LAST
    `);

    // Revenue trend
    const revenueTrend = await coreDb.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as transactions,
        SUM(amount) as revenue
      FROM subscriptions
      WHERE created_at >= NOW() - INTERVAL '${interval}'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `);

    // Credit revenue
    const creditRevenue = await coreDb.query(`
      SELECT 
        SUM(total_spent) as total_credit_revenue,
        SUM(sms_credits) as total_sms_used,
        SUM(whatsapp_credits) as total_whatsapp_used,
        SUM(email_credits) as total_email_used
      FROM tenant_credit_wallets
    `);

    return {
      success: true,
      data: {
        revenueByPlan: revenueByPlan.rows,
        revenueTrend: revenueTrend.rows,
        creditRevenue: creditRevenue.rows[0],
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Get revenue analytics error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch revenue analytics',
      },
    });
  }
});

// User analytics (Admin)
fastify.get('/api/v1/analytics/users', async (request, reply) => {
  try {
    const adminUsers = await coreDb.query(`
      SELECT 
        COUNT(*) as total_admin_users,
        COUNT(*) FILTER (WHERE is_active = true) as active_admin_users,
        COUNT(*) FILTER (WHERE last_login_at >= NOW() - INTERVAL '7 days') as active_last_7_days
      FROM admin_users
    `);

    const usersByRole = await coreDb.query(`
      SELECT 
        role,
        department,
        COUNT(*) as count
      FROM admin_users
      WHERE is_active = true
      GROUP BY role, department
      ORDER BY count DESC
    `);

    return {
      success: true,
      data: {
        adminUsers: adminUsers.rows[0],
        usersByRole: usersByRole.rows,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Get user analytics error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch user analytics',
      },
    });
  }
});

// Tenant dashboard analytics
fastify.get('/api/v1/analytics/dashboard', async (request, reply) => {
  try {
    const tenantId = request.headers['x-tenant-id'] as string;
    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    // Student stats
    const studentStats = await tenantDb.query(`
      SELECT 
        COUNT(*) as total_students,
        COUNT(*) FILTER (WHERE status = 'active') as active_students,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_this_month
      FROM students
      WHERE tenant_id = $1 AND deleted_at IS NULL
    `, [tenantId]);

    // Library stats
    const libraryStats = await tenantDb.query(`
      SELECT 
        COUNT(*) as total_libraries,
        SUM(capacity) as total_capacity,
        SUM(current_occupancy) as current_occupancy
      FROM libraries
      WHERE tenant_id = $1 AND deleted_at IS NULL
    `, [tenantId]);

    // Revenue stats
    const revenueStats = await tenantDb.query(`
      SELECT 
        COUNT(*) as total_payments,
        SUM(amount) FILTER (WHERE payment_status = 'completed') as total_revenue,
        COUNT(*) FILTER (WHERE payment_status = 'pending') as pending_payments
      FROM payments
      WHERE tenant_id = $1 AND created_at >= NOW() - INTERVAL '30 days'
    `, [tenantId]);

    return {
      success: true,
      data: {
        students: studentStats.rows[0],
        libraries: libraryStats.rows[0],
        revenue: revenueStats.rows[0],
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Get dashboard analytics error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch dashboard analytics',
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
    logger.info(`📊 Analytics Service running on port ${PORT}`);
  } catch (err) {
    logger.error('Failed to start Analytics Service', err);
    process.exit(1);
  }
};

start();

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down Analytics Service...');
  await fastify.close();
  process.exit(0);
});

