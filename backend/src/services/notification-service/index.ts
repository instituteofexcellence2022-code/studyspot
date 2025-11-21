// ============================================
// NOTIFICATION SERVICE
// Push notifications, in-app notifications, notification preferences
// Port: 3017
// ============================================

import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import dotenv from 'dotenv';
import { coreDb, tenantDbManager } from '../../config/database';
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

const PORT = config.ports.notification;
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

const createNotificationSchema = z.object({
  user_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  type: z.enum(['info', 'success', 'warning', 'error', 'booking', 'payment', 'system']),
  channel: z.enum(['push', 'in_app', 'email', 'sms']).default('in_app'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  action_url: z.string().url().optional(),
  metadata: z.record(z.unknown()).optional(),
});

const getNotificationsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(20).optional(),
  type: z.enum(['info', 'success', 'warning', 'error', 'booking', 'payment', 'system']).optional(),
  channel: z.enum(['push', 'in_app', 'email', 'sms']).optional(),
  read: z.coerce.boolean().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
});

const notificationParamsSchema = z.object({
  id: z.string().uuid(),
});

const updatePreferencesSchema = z.object({
  push_enabled: z.boolean().optional(),
  email_enabled: z.boolean().optional(),
  sms_enabled: z.boolean().optional(),
  booking_notifications: z.boolean().optional(),
  payment_notifications: z.boolean().optional(),
  system_notifications: z.boolean().optional(),
  quiet_hours_start: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  quiet_hours_end: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).optional(),
});

const markReadSchema = z.object({
  ids: z.array(z.string().uuid()).optional(),
  all: z.boolean().default(false).optional(),
});

// ============================================
// HEALTH CHECK
// ============================================

fastify.get('/health', async (request, reply) => {
  try {
    await coreDb.query('SELECT 1');
    
    return reply.send({
      status: 'healthy',
      service: 'notification-service',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error: unknown) {
    logger.error('Health check failed:', error);
    return reply.status(HTTP_STATUS.SERVICE_UNAVAILABLE).send({
      status: 'unhealthy',
      service: 'notification-service',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
    });
  }
});

// ============================================
// NOTIFICATION MANAGEMENT
// ============================================

/**
 * Create notification
 * POST /api/v1/notifications
 */
fastify.post('/api/v1/notifications', {
  preHandler: [validateBody(createNotificationSchema)],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const notificationData = request.body as z.infer<typeof createNotificationSchema>;
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;

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

    // Create notification
    const result = await tenantDb.query(
      `INSERT INTO notifications (
        tenant_id, user_id, title, message, type, channel, priority, action_url, metadata, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING *`,
      [
        tenantId,
        notificationData.user_id,
        notificationData.title,
        notificationData.message,
        notificationData.type,
        notificationData.channel,
        notificationData.priority,
        notificationData.action_url || null,
        notificationData.metadata ? JSON.stringify(notificationData.metadata) : null,
      ]
    );

    const notification = result.rows[0];

    // Emit real-time notification via socket
    try {
      const { getSocketIO } = await import('../../utils/socketHelpers');
      const io = getSocketIO();
      if (io) {
        io.to(`user:${notificationData.user_id}`).emit('notification:new', notification);
      }
    } catch (error) {
      // Socket not available, continue without real-time notification
      logger.debug('Socket.io not available for real-time notification');
    }

    return reply.status(HTTP_STATUS.CREATED).send({
      success: true,
      message: 'Notification created successfully',
      data: notification,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    logger.error('Error creating notification:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to create notification',
      },
    });
  }
});

/**
 * Get user notifications
 * GET /api/v1/notifications
 */
fastify.get('/api/v1/notifications', {
  preHandler: [validateQuery(getNotificationsQuerySchema)],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { page = 1, limit = 20, type, channel, read, start_date, end_date } = request.query as z.infer<typeof getNotificationsQuerySchema>;
    const userId = (request.user as any)?.id || (request.user as any)?.userId;
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;

    if (!tenantId || !userId) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Tenant ID and User ID are required',
        },
      });
    }

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    // Build query
    let query = 'SELECT * FROM notifications WHERE tenant_id = $1 AND user_id = $2';
    const params: any[] = [tenantId, userId];
    let paramIndex = 3;

    if (type) {
      query += ` AND type = $${paramIndex++}`;
      params.push(type);
    }

    if (channel) {
      query += ` AND channel = $${paramIndex++}`;
      params.push(channel);
    }

    if (read !== undefined) {
      query += ` AND is_read = $${paramIndex++}`;
      params.push(read);
    }

    if (start_date) {
      query += ` AND created_at >= $${paramIndex++}`;
      params.push(start_date);
    }

    if (end_date) {
      query += ` AND created_at <= $${paramIndex++}`;
      params.push(end_date);
    }

    // Get total count
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
    const countResult = await tenantDb.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Pagination
    const offset = (page - 1) * limit;
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await tenantDb.query(query, params);

    // Parse metadata JSON
    const notifications = result.rows.map((n: any) => ({
      ...n,
      metadata: n.metadata ? JSON.parse(n.metadata) : null,
    }));

    return reply.send({
      success: true,
      data: notifications,
      pagination: {
        page: parseInt(page as any),
        limit: parseInt(limit as any),
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    logger.error('Error fetching notifications:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch notifications',
      },
    });
  }
});

/**
 * Get notification by ID
 * GET /api/v1/notifications/:id
 */
fastify.get('/api/v1/notifications/:id', {
  preHandler: [validateParams(notificationParamsSchema)],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { id } = request.params as z.infer<typeof notificationParamsSchema>;
    const userId = (request.user as any)?.id || (request.user as any)?.userId;
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;

    if (!tenantId || !userId) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Tenant ID and User ID are required',
        },
      });
    }

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    const result = await tenantDb.query(
      'SELECT * FROM notifications WHERE id = $1 AND tenant_id = $2 AND user_id = $3',
      [id, tenantId, userId]
    );

    if (result.rows.length === 0) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: 'Notification not found',
        },
      });
    }

    const notification = result.rows[0];
    if (notification.metadata) {
      notification.metadata = JSON.parse(notification.metadata);
    }

    return reply.send({
      success: true,
      data: notification,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    logger.error('Error fetching notification:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch notification',
      },
    });
  }
});

/**
 * Mark notifications as read
 * PUT /api/v1/notifications/read
 */
fastify.put('/api/v1/notifications/read', {
  preHandler: [validateBody(markReadSchema)],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { ids, all = false } = request.body as z.infer<typeof markReadSchema>;
    const userId = (request.user as any)?.id || (request.user as any)?.userId;
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;

    if (!tenantId || !userId) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Tenant ID and User ID are required',
        },
      });
    }

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    let result;
    if (all) {
      // Mark all as read
      result = await tenantDb.query(
        `UPDATE notifications 
         SET is_read = true, read_at = NOW()
         WHERE tenant_id = $1 AND user_id = $2 AND is_read = false
         RETURNING id`,
        [tenantId, userId]
      );
    } else if (ids && ids.length > 0) {
      // Mark specific notifications as read
      result = await tenantDb.query(
        `UPDATE notifications 
         SET is_read = true, read_at = NOW()
         WHERE tenant_id = $1 AND user_id = $2 AND id = ANY($3)
         RETURNING id`,
        [tenantId, userId, ids]
      );
    } else {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Either ids array or all=true is required',
        },
      });
    }

    return reply.send({
      success: true,
      message: `${result.rows.length} notification(s) marked as read`,
      data: {
        count: result.rows.length,
        ids: result.rows.map((r: any) => r.id),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    logger.error('Error marking notifications as read:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to mark notifications as read',
      },
    });
  }
});

/**
 * Delete notification
 * DELETE /api/v1/notifications/:id
 */
fastify.delete('/api/v1/notifications/:id', {
  preHandler: [validateParams(notificationParamsSchema)],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { id } = request.params as z.infer<typeof notificationParamsSchema>;
    const userId = (request.user as any)?.id || (request.user as any)?.userId;
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;

    if (!tenantId || !userId) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Tenant ID and User ID are required',
        },
      });
    }

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    const result = await tenantDb.query(
      'DELETE FROM notifications WHERE id = $1 AND tenant_id = $2 AND user_id = $3 RETURNING id',
      [id, tenantId, userId]
    );

    if (result.rows.length === 0) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: 'Notification not found',
        },
      });
    }

    return reply.send({
      success: true,
      message: 'Notification deleted successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    logger.error('Error deleting notification:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to delete notification',
      },
    });
  }
});

// ============================================
// NOTIFICATION PREFERENCES
// ============================================

/**
 * Get user notification preferences
 * GET /api/v1/notifications/preferences
 */
fastify.get('/api/v1/notifications/preferences', async (request: AuthenticatedRequest, reply) => {
  try {
    const userId = (request.user as any)?.id || (request.user as any)?.userId;
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;

    if (!tenantId || !userId) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Tenant ID and User ID are required',
        },
      });
    }

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    const result = await tenantDb.query(
      'SELECT * FROM notification_preferences WHERE tenant_id = $1 AND user_id = $2',
      [tenantId, userId]
    );

    if (result.rows.length === 0) {
      // Return default preferences
      return reply.send({
        success: true,
        data: {
          push_enabled: true,
          email_enabled: true,
          sms_enabled: true,
          booking_notifications: true,
          payment_notifications: true,
          system_notifications: true,
          quiet_hours_start: null,
          quiet_hours_end: null,
        },
        timestamp: new Date().toISOString(),
      });
    }

    return reply.send({
      success: true,
      data: result.rows[0],
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    logger.error('Error fetching preferences:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch notification preferences',
      },
    });
  }
});

/**
 * Update notification preferences
 * PUT /api/v1/notifications/preferences
 */
fastify.put('/api/v1/notifications/preferences', {
  preHandler: [validateBody(updatePreferencesSchema)],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const preferences = request.body as z.infer<typeof updatePreferencesSchema>;
    const userId = (request.user as any)?.id || (request.user as any)?.userId;
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;

    if (!tenantId || !userId) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Tenant ID and User ID are required',
        },
      });
    }

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    // Check if preferences exist
    const existing = await tenantDb.query(
      'SELECT * FROM notification_preferences WHERE tenant_id = $1 AND user_id = $2',
      [tenantId, userId]
    );

    let result;
    if (existing.rows.length === 0) {
      // Create preferences
      result = await tenantDb.query(
        `INSERT INTO notification_preferences (
          tenant_id, user_id, push_enabled, email_enabled, sms_enabled,
          booking_notifications, payment_notifications, system_notifications,
          quiet_hours_start, quiet_hours_end, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
        RETURNING *`,
        [
          tenantId,
          userId,
          preferences.push_enabled ?? true,
          preferences.email_enabled ?? true,
          preferences.sms_enabled ?? true,
          preferences.booking_notifications ?? true,
          preferences.payment_notifications ?? true,
          preferences.system_notifications ?? true,
          preferences.quiet_hours_start || null,
          preferences.quiet_hours_end || null,
        ]
      );
    } else {
      // Update preferences
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      let paramIndex = 1;

      if (preferences.push_enabled !== undefined) {
        updateFields.push(`push_enabled = $${paramIndex++}`);
        updateValues.push(preferences.push_enabled);
      }
      if (preferences.email_enabled !== undefined) {
        updateFields.push(`email_enabled = $${paramIndex++}`);
        updateValues.push(preferences.email_enabled);
      }
      if (preferences.sms_enabled !== undefined) {
        updateFields.push(`sms_enabled = $${paramIndex++}`);
        updateValues.push(preferences.sms_enabled);
      }
      if (preferences.booking_notifications !== undefined) {
        updateFields.push(`booking_notifications = $${paramIndex++}`);
        updateValues.push(preferences.booking_notifications);
      }
      if (preferences.payment_notifications !== undefined) {
        updateFields.push(`payment_notifications = $${paramIndex++}`);
        updateValues.push(preferences.payment_notifications);
      }
      if (preferences.system_notifications !== undefined) {
        updateFields.push(`system_notifications = $${paramIndex++}`);
        updateValues.push(preferences.system_notifications);
      }
      if (preferences.quiet_hours_start !== undefined) {
        updateFields.push(`quiet_hours_start = $${paramIndex++}`);
        updateValues.push(preferences.quiet_hours_start || null);
      }
      if (preferences.quiet_hours_end !== undefined) {
        updateFields.push(`quiet_hours_end = $${paramIndex++}`);
        updateValues.push(preferences.quiet_hours_end || null);
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
      updateValues.push(tenantId, userId);

      result = await tenantDb.query(
        `UPDATE notification_preferences 
         SET ${updateFields.join(', ')}
         WHERE tenant_id = $${paramIndex++} AND user_id = $${paramIndex++}
         RETURNING *`,
        updateValues
      );
    }

    return reply.send({
      success: true,
      message: 'Notification preferences updated successfully',
      data: result.rows[0],
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    logger.error('Error updating preferences:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to update notification preferences',
      },
    });
  }
});

/**
 * Get unread notification count
 * GET /api/v1/notifications/unread/count
 */
fastify.get('/api/v1/notifications/unread/count', async (request: AuthenticatedRequest, reply) => {
  try {
    const userId = (request.user as any)?.id || (request.user as any)?.userId;
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;

    if (!tenantId || !userId) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Tenant ID and User ID are required',
        },
      });
    }

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    const result = await tenantDb.query(
      'SELECT COUNT(*) as count FROM notifications WHERE tenant_id = $1 AND user_id = $2 AND is_read = false',
      [tenantId, userId]
    );

    return reply.send({
      success: true,
      data: {
        unread_count: parseInt(result.rows[0].count),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    logger.error('Error fetching unread count:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch unread count',
      },
    });
  }
});

// ============================================
// START SERVER
// ============================================

export async function startNotificationService() {
  try {
    await fastify.listen({ port: PORT as number, host: '0.0.0.0' });
    logger.info(`✅ Notification Service started on port ${PORT}`);
  } catch (err) {
    logger.error('Failed to start Notification Service:', err);
    process.exit(1);
  }
}

// Start if run directly
if (require.main === module) {
  startNotificationService();
}

