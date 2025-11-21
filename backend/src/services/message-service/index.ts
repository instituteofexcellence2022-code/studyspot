/**
 * 💬 MESSAGE SERVICE
 * 
 * Handles in-app messaging between students and library owners
 * Features:
 * - Send messages
 * - Receive messages
 * - Mark as read
 * - Delete messages
 * - Real-time notifications via WebSocket
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import dotenv from 'dotenv';
import { tenantDbManager, coreDb } from '../../config/database';
import { getSocketIO } from '../../utils/socketHelpers';
import { logger } from '../../utils/logger';
import { HTTP_STATUS, ERROR_CODES } from '../../config/constants';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth';
import { validateBody, validateQuery, validateParams } from '../../middleware/validator';
import { registerRateLimit, SERVICE_RATE_LIMITS } from '../../middleware/rateLimiter';
import { requestLogger } from '../../middleware/requestLogger';
import { errorHandler, notFoundHandler } from '../../middleware/errorHandler';
import { z } from 'zod';
import { config } from '../../config/env';

dotenv.config();

const PORT = config.ports.message;
const fastify = Fastify({ 
  logger: false,
  requestIdLogLabel: 'reqId',
  requestIdHeader: 'x-request-id',
});

// ============================================
// MIDDLEWARE
// ============================================

fastify.register(cors, {
  origin: config.cors.origins.length > 0 ? config.cors.origins : [
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

const sendMessageSchema = z.object({
  libraryId: z.string().uuid(),
  senderId: z.string().uuid(),
  senderName: z.string().max(200).optional(),
  senderRole: z.enum(['student', 'library_owner', 'library_staff']).default('student'),
  message: z.string().min(1).max(5000),
});

const replyMessageSchema = z.object({
  message: z.string().min(1).max(5000),
});

const messageParamsSchema = z.object({
  libraryId: z.string().uuid(),
  userId: z.string().uuid(),
  ownerId: z.string().uuid(),
  messageId: z.string().uuid(),
});

const messageQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(20).optional(),
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
        service: 'message-service',
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
        service: 'message-service',
        timestamp: new Date().toISOString(),
        error: error.message,
      },
    };
  }
});

/**
 * Send a message from student to library owner
 * POST /api/messages/send
 */
fastify.post('/api/messages/send', {
  preHandler: [validateBody(sendMessageSchema)],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { libraryId, senderId, senderName, senderRole, message } = request.body as any;
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

    // Get library owner ID
    const libraryResult = await tenantDb.query(
      'SELECT owner_id FROM libraries WHERE id = $1 AND tenant_id = $2',
      [libraryId, tenantId]
    );

    if (libraryResult.rows.length === 0) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: 'Library not found',
        },
      });
    }

    const ownerId = libraryResult.rows[0].owner_id;

    // Get sender name if not provided
    let finalSenderName = senderName;
    if (!finalSenderName) {
      const senderResult = await tenantDb.query(
        'SELECT first_name, last_name FROM students WHERE id = $1 AND tenant_id = $2',
        [senderId, tenantId]
      );
      if (senderResult.rows.length > 0) {
        finalSenderName = `${senderResult.rows[0].first_name || ''} ${senderResult.rows[0].last_name || ''}`.trim();
      }
    }

    // Insert message into database
    const messageResult = await tenantDb.query(
      `INSERT INTO messages (
        tenant_id, library_id, sender_id, sender_name, sender_role,
        receiver_id, receiver_role, message, is_read, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING *`,
      [
        tenantId,
        libraryId,
        senderId,
        finalSenderName || 'Unknown',
        senderRole || 'student',
        ownerId,
        'library_owner',
        message,
        false,
      ]
    );

    const newMessage = messageResult.rows[0];

    // Send real-time notification via WebSocket
    const io = getSocketIO();
    if (io) {
      io.to(`user:${ownerId}`).emit('message:new', {
        id: newMessage.id,
        libraryId,
        senderId,
        senderName: finalSenderName,
        message,
        timestamp: newMessage.created_at,
      });
      logger.info(`Real-time notification sent to owner: ${ownerId}`);
    }

    return reply.status(HTTP_STATUS.CREATED).send({
      success: true,
      message: 'Message sent successfully',
      data: newMessage,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Error sending message:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to send message',
      },
    });
  }
});

/**
 * Get all messages for a library (owner view)
 * GET /api/messages/library/:libraryId
 */
fastify.get('/api/messages/library/:libraryId', {
  preHandler: [
    validateParams(z.object({ libraryId: z.string().uuid() })),
    validateQuery(messageQuerySchema),
  ],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { libraryId } = request.params as any;
    const { page = 1, limit = 20 } = request.query as any;
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

    // Get total count
    const countResult = await tenantDb.query(
      'SELECT COUNT(*) FROM messages WHERE library_id = $1 AND tenant_id = $2',
      [libraryId, tenantId]
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated messages
    const offset = (page - 1) * limit;
    const messagesResult = await tenantDb.query(
      `SELECT * FROM messages 
       WHERE library_id = $1 AND tenant_id = $2
       ORDER BY created_at DESC 
       LIMIT $3 OFFSET $4`,
      [libraryId, tenantId, limit, offset]
    );

    return reply.send({
      success: true,
      data: messagesResult.rows,
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
    logger.error('Error fetching library messages:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch messages',
      },
    });
  }
});

/**
 * Get all messages for a user (student view - sent messages)
 * GET /api/messages/user/:userId
 */
fastify.get('/api/messages/user/:userId', {
  preHandler: [
    validateParams(z.object({ userId: z.string().uuid() })),
    validateQuery(messageQuerySchema),
  ],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { userId } = request.params as any;
    const { page = 1, limit = 20 } = request.query as any;
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

    // Get total count
    const countResult = await tenantDb.query(
      'SELECT COUNT(*) FROM messages WHERE sender_id = $1 AND tenant_id = $2',
      [userId, tenantId]
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated messages
    const offset = (page - 1) * limit;
    const messagesResult = await tenantDb.query(
      `SELECT * FROM messages 
       WHERE sender_id = $1 AND tenant_id = $2
       ORDER BY created_at DESC 
       LIMIT $3 OFFSET $4`,
      [userId, tenantId, limit, offset]
    );

    return reply.send({
      success: true,
      data: messagesResult.rows,
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
    logger.error('Error fetching user messages:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch messages',
      },
    });
  }
});

/**
 * Get unread message count for owner
 * GET /api/messages/unread/:ownerId
 */
fastify.get('/api/messages/unread/:ownerId', {
  preHandler: [validateParams(z.object({ ownerId: z.string().uuid() }))],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { ownerId } = request.params as any;
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

    const countResult = await tenantDb.query(
      'SELECT COUNT(*) FROM messages WHERE receiver_id = $1 AND tenant_id = $2 AND is_read = false',
      [ownerId, tenantId]
    );

    return reply.send({
      success: true,
      data: {
        unreadCount: parseInt(countResult.rows[0].count),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Error counting unread messages:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to count unread messages',
      },
    });
  }
});

/**
 * Mark message as read
 * PUT /api/messages/:messageId/read
 */
fastify.put('/api/messages/:messageId/read', {
  preHandler: [validateParams(z.object({ messageId: z.string().uuid() }))],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { messageId } = request.params as any;
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

    const result = await tenantDb.query(
      `UPDATE messages 
       SET is_read = true, read_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND tenant_id = $2
       RETURNING *`,
      [messageId, tenantId]
    );

    if (result.rows.length === 0) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: 'Message not found',
        },
      });
    }

    const data = result.rows[0];

    // Notify sender that message was read (optional)
    const io = getSocketIO();
    if (io) {
      io.to(`user:${data.sender_id}`).emit('message:read', {
        messageId,
        readAt: data.read_at,
      });
    }

    return reply.send({
      success: true,
      message: 'Message marked as read',
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Error marking message as read:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to mark message as read',
      },
    });
  }
});

/**
 * Delete a message (soft delete)
 * DELETE /api/messages/:messageId
 */
fastify.delete('/api/messages/:messageId', {
  preHandler: [validateParams(z.object({ messageId: z.string().uuid() }))],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { messageId } = request.params as any;
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

    const result = await tenantDb.query(
      `UPDATE messages 
       SET deleted_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL
       RETURNING *`,
      [messageId, tenantId]
    );

    if (result.rows.length === 0) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: 'Message not found',
        },
      });
    }

    return reply.send({
      success: true,
      message: 'Message deleted successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Error deleting message:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to delete message',
      },
    });
  }
});

/**
 * Reply to a message (owner to student)
 * POST /api/messages/:messageId/reply
 */
fastify.post('/api/messages/:messageId/reply', {
  preHandler: [
    validateParams(z.object({ messageId: z.string().uuid() })),
    validateBody(replyMessageSchema),
  ],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { messageId } = request.params as any;
    const { message } = request.body as any;
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

    // Get original message
    const originalMessageResult = await tenantDb.query(
      'SELECT * FROM messages WHERE id = $1 AND tenant_id = $2',
      [messageId, tenantId]
    );

    if (originalMessageResult.rows.length === 0) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: 'Original message not found',
        },
      });
    }

    const originalMessage = originalMessageResult.rows[0];
    const senderId = (request.user as any)?.userId || (request.user as any)?.id;
    const senderName = (request.user as any)?.name || 'Library Owner';

    // Insert reply
    const replyResult = await tenantDb.query(
      `INSERT INTO messages (
        tenant_id, library_id, sender_id, sender_name, sender_role,
        receiver_id, receiver_role, message, is_read, parent_message_id, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      RETURNING *`,
      [
        tenantId,
        originalMessage.library_id,
        senderId,
        senderName,
        'library_owner',
        originalMessage.sender_id,
        'student',
        message,
        false,
        messageId,
      ]
    );

    const newMessage = replyResult.rows[0];

    // Send real-time notification to student
    const io = getSocketIO();
    if (io) {
      io.to(`user:${originalMessage.sender_id}`).emit('message:new', {
        id: newMessage.id,
        libraryId: originalMessage.library_id,
        senderId,
        senderName,
        message,
        timestamp: newMessage.created_at,
        isReply: true,
      });
      logger.info(`Reply notification sent to student: ${originalMessage.sender_id}`);
    }

    return reply.status(HTTP_STATUS.CREATED).send({
      success: true,
      message: 'Reply sent successfully',
      data: newMessage,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Error sending reply:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to send reply',
      },
    });
  }
});

// ============================================
// START SERVER
// ============================================

export async function startMessageService() {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    logger.info(`✅ Message Service started on port ${PORT}`);
  } catch (err) {
    logger.error('Failed to start Message Service:', err);
    process.exit(1);
  }
}

// Start if run directly
if (require.main === module) {
  startMessageService();
}

export default fastify;

