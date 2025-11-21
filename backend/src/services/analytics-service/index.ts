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
import { authenticate, AuthenticatedRequest } from '../../middleware/auth';
import { requestLogger } from '../../middleware/requestLogger';
import { errorHandler, notFoundHandler } from '../../middleware/errorHandler';
import { validateParams, validateQuery } from '../../middleware/validator';
import { registerRateLimit, SERVICE_RATE_LIMITS } from '../../middleware/rateLimiter';
import { z } from 'zod';
import { config } from '../../config/env';

dotenv.config();

const fastify = Fastify({ logger: false });
const PORT = config.ports.analytics;

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

const analyticsQuerySchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y', 'all']).default('30d').optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const studentAnalyticsParamsSchema = z.object({
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
        service: 'analytics-service',
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
        service: 'analytics-service',
        timestamp: new Date().toISOString(),
        error: error.message,
      },
    };
  }
});

// Executive dashboard analytics (Admin)
fastify.get('/api/v1/analytics/executive', {
  preHandler: [validateQuery(analyticsQuerySchema)],
}, async (request: AuthenticatedRequest, reply) => {
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
fastify.get('/api/v1/analytics/revenue', {
  preHandler: [validateQuery(analyticsQuerySchema)],
}, async (request: AuthenticatedRequest, reply) => {
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
fastify.get('/api/v1/analytics/users', async (request: AuthenticatedRequest, reply) => {
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
fastify.get('/api/v1/analytics/dashboard', {
  preHandler: [validateQuery(analyticsQuerySchema)],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;
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
// STUDENT ANALYTICS ENDPOINTS
// ============================================

// Get student analytics with learning style
fastify.get('/api/v1/analytics/students/:id', {
  preHandler: [validateParams(studentAnalyticsParamsSchema)],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { id } = request.params as { id: string };
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    // Get study patterns
    const studyPatterns = await tenantDb.query(`
      SELECT 
        DATE_TRUNC('day', start_time) as study_date,
        COUNT(*) as booking_count,
        AVG(EXTRACT(EPOCH FROM (end_time::timestamp - start_time::timestamp))/3600) as avg_hours,
        SUM(total_amount) as daily_spend
      FROM bookings
      WHERE user_id = $1 AND tenant_id = $2 AND status = 'completed'
      GROUP BY DATE_TRUNC('day', start_time)
      ORDER BY study_date DESC
      LIMIT 30
    `, [id, tenantId]).catch(() => ({ rows: [] }));

    // Get attendance patterns
    const attendancePatterns = await tenantDb.query(`
      SELECT 
        EXTRACT(HOUR FROM check_in_time) as hour_of_day,
        COUNT(*) as check_ins,
        EXTRACT(DOW FROM date) as day_of_week
      FROM attendance
      WHERE student_id = $1 AND tenant_id = $2
      GROUP BY EXTRACT(HOUR FROM check_in_time), EXTRACT(DOW FROM date)
      ORDER BY check_ins DESC
    `, [id, tenantId]).catch(() => ({ rows: [] }));

    // Calculate learning style (simplified classification)
    const preferredHours = attendancePatterns.rows.reduce((acc: any, row: any) => {
      const hour = parseInt(row.hour_of_day);
      if (hour >= 6 && hour < 12) acc.morning = (acc.morning || 0) + parseInt(row.check_ins);
      else if (hour >= 12 && hour < 18) acc.afternoon = (acc.afternoon || 0) + parseInt(row.check_ins);
      else acc.evening = (acc.evening || 0) + parseInt(row.check_ins);
      return acc;
    }, {});

    const learningStyle = preferredHours.morning > preferredHours.afternoon && preferredHours.morning > preferredHours.evening
      ? 'morning_learner'
      : preferredHours.evening > preferredHours.afternoon
      ? 'evening_learner'
      : 'flexible_learner';

    // Get performance metrics
    const performance = await tenantDb.query(`
      SELECT 
        COUNT(DISTINCT b.id) as total_bookings,
        SUM(b.total_amount) as total_spent,
        AVG(EXTRACT(EPOCH FROM (b.end_time::timestamp - b.start_time::timestamp))/3600) as avg_study_hours,
        COUNT(DISTINCT DATE(a.date)) as days_attended,
        COUNT(DISTINCT a.library_id) as libraries_visited,
        MAX(a.date) as last_attendance,
        MIN(b.created_at) as first_booking
      FROM students s
      LEFT JOIN bookings b ON s.id = b.user_id AND b.tenant_id = $2 AND b.status = 'completed'
      LEFT JOIN attendance a ON s.id = a.student_id AND a.tenant_id = $2
      WHERE s.id = $1
      GROUP BY s.id
    `, [id, tenantId]).catch(() => ({ rows: [{}] }));

    // Behavioral analytics
    const behavioral = await tenantDb.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancellations,
        COUNT(*) FILTER (WHERE status = 'completed') as completions,
        AVG(EXTRACT(EPOCH FROM (updated_at::timestamp - created_at::timestamp))/60) as avg_booking_duration_minutes
      FROM bookings
      WHERE user_id = $1 AND tenant_id = $2
    `, [id, tenantId]).catch(() => ({ rows: [{}] }));

    // Performance forecasting (simple trend)
    const recentBookings = studyPatterns.rows.slice(0, 7);
    const olderBookings = studyPatterns.rows.slice(7, 14);
    const recentAvg = recentBookings.reduce((sum, b) => sum + (parseFloat(b.avg_hours) || 0), 0) / (recentBookings.length || 1);
    const olderAvg = olderBookings.reduce((sum, b) => sum + (parseFloat(b.avg_hours) || 0), 0) / (olderBookings.length || 1);
    const trend = recentAvg > olderAvg ? 'increasing' : recentAvg < olderAvg ? 'decreasing' : 'stable';

    return {
      success: true,
      data: {
        studentId: id,
        learningStyle,
        preferredHours,
        studyPatterns: studyPatterns.rows,
        attendancePatterns: attendancePatterns.rows,
        performance: performance.rows[0] || {},
        behavioral: behavioral.rows[0] || {},
        forecast: {
          trend,
          predictedAvgHours: recentAvg,
          confidence: studyPatterns.rows.length > 10 ? 'high' : studyPatterns.rows.length > 5 ? 'medium' : 'low',
        },
        insights: {
          isActive: (performance.rows[0]?.days_attended || 0) > 5,
          isRegular: (performance.rows[0]?.total_bookings || 0) > 10,
          preferredTime: learningStyle,
        },
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Get student analytics error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch student analytics',
      },
    });
  }
});

// Get personalized recommendations for student
fastify.get('/api/v1/analytics/students/:id/recommendations', {
  preHandler: [validateParams(studentAnalyticsParamsSchema)],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { id } = request.params as { id: string };
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    // Get student's preferred libraries
    const preferredLibraries = await tenantDb.query(`
      SELECT 
        l.id,
        l.name,
        COUNT(b.id) as booking_count,
        AVG(b.total_amount) as avg_spend
      FROM libraries l
      JOIN bookings b ON l.id = b.library_id
      WHERE b.user_id = $1 AND b.tenant_id = $2
      GROUP BY l.id, l.name
      ORDER BY booking_count DESC
      LIMIT 5
    `, [id, tenantId]).catch(() => ({ rows: [] }));

    // Get recommended time slots based on history
    const recommendedSlots = await tenantDb.query(`
      SELECT 
        EXTRACT(HOUR FROM start_time) as hour,
        COUNT(*) as frequency,
        AVG(EXTRACT(EPOCH FROM (end_time::timestamp - start_time::timestamp))/3600) as avg_duration
      FROM bookings
      WHERE user_id = $1 AND tenant_id = $2 AND status = 'completed'
      GROUP BY EXTRACT(HOUR FROM start_time)
      ORDER BY frequency DESC
      LIMIT 3
    `, [id, tenantId]).catch(() => ({ rows: [] }));

    // Get similar students (based on booking patterns)
    const similarStudents = await tenantDb.query(`
      SELECT DISTINCT
        s2.id,
        s2.first_name,
        s2.last_name,
        COUNT(DISTINCT b2.library_id) as shared_libraries
      FROM students s1
      JOIN bookings b1 ON s1.id = b1.user_id
      JOIN bookings b2 ON b1.library_id = b2.library_id AND b1.tenant_id = b2.tenant_id
      JOIN students s2 ON b2.user_id = s2.id
      WHERE s1.id = $1 AND s1.tenant_id = $2 AND s2.id != $1
      GROUP BY s2.id, s2.first_name, s2.last_name
      HAVING COUNT(DISTINCT b2.library_id) >= 2
      ORDER BY shared_libraries DESC
      LIMIT 5
    `, [id, tenantId]).catch(() => ({ rows: [] }));

    return {
      success: true,
      data: {
        recommendedLibraries: preferredLibraries.rows,
        recommendedTimeSlots: recommendedSlots.rows.map((r: any) => ({
          hour: parseInt(r.hour),
          frequency: parseInt(r.frequency),
          avgDuration: parseFloat(r.avg_duration),
        })),
        similarStudents: similarStudents.rows,
        personalizedTips: [
          preferredLibraries.rows.length > 0 
            ? `You frequently visit ${preferredLibraries.rows[0].name}. Consider booking in advance.`
            : 'Try exploring different libraries to find your perfect study spot.',
          recommendedSlots.rows.length > 0
            ? `Your most productive time is around ${recommendedSlots.rows[0].hour}:00. Book during this time for better focus.`
            : 'Track your study patterns to find your optimal study hours.',
        ],
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Get student recommendations error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch recommendations',
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

export async function startAnalyticsService() {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    logger.info(`✅ Analytics Service started on port ${PORT}`);
  } catch (err) {
    logger.error('Failed to start Analytics Service:', err);
    process.exit(1);
  }
}

// Start if run directly
if (require.main === module) {
  startAnalyticsService();
}

export default fastify;

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down Analytics Service...');
  await fastify.close();
  process.exit(0);
});

