/**
 * 📍 ATTENDANCE SERVICE
 * 
 * QR-based attendance tracking system:
 * - Check-in/Check-out via QR code scanning
 * - Real-time attendance tracking
 * - Study duration calculation
 * - Attendance reports and analytics
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

const PORT = config.ports.attendance;
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

const validateQrSchema = z.object({
  qrData: z.union([z.string(), z.object({
    libraryId: z.string().uuid(),
    action: z.enum(['check_in', 'check_out']),
  })]),
});

const checkInSchema = z.object({
  userId: z.string().uuid(),
  userName: z.string().min(1).max(200).optional(),
  libraryId: z.string().uuid(),
  libraryName: z.string().max(200).optional(),
  qrData: z.any().optional(),
  location: z.string().max(200).optional(),
});

const checkOutSchema = z.object({
  userId: z.string().uuid(),
  libraryId: z.string().uuid(),
  location: z.string().max(200).optional(),
});

const attendanceParamsSchema = z.object({
  userId: z.string().uuid(),
});

const libraryAttendanceParamsSchema = z.object({
  libraryId: z.string().uuid(),
});

const attendanceQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  limit: z.coerce.number().int().positive().max(100).default(10).optional(),
  page: z.coerce.number().int().positive().default(1).optional(),
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
        service: 'attendance-service',
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
        service: 'attendance-service',
        timestamp: new Date().toISOString(),
        error: error.message,
      },
    };
  }
});

// ============================================
// QR CODE VALIDATION
// ============================================

/**
 * Validate QR code data
 * POST /api/attendance/validate-qr
 */
fastify.post('/api/attendance/validate-qr', {
  preHandler: [validateBody(validateQrSchema)],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { qrData } = request.body as any;
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

    // Parse QR code JSON
    let parsed;
    try {
      parsed = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
    } catch (error) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Invalid QR code format',
        },
      });
    }

    // Validate QR code structure
    if (!parsed.libraryId || !parsed.action) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Invalid QR code data',
        },
      });
    }

    // Check if action is valid
    if (!['check_in', 'check_out'].includes(parsed.action)) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Invalid action type',
        },
      });
    }

    logger.info(`✅ QR code validated: ${parsed.action} for library ${parsed.libraryId}`);

    return reply.send({
      success: true,
      data: parsed,
      message: 'QR code is valid',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Error validating QR code:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to validate QR code',
      },
    });
  }
});

// ============================================
// ATTENDANCE OPERATIONS
// ============================================

/**
 * Mark check-in
 * POST /api/attendance/check-in
 */
fastify.post('/api/attendance/check-in', {
  preHandler: [validateBody(checkInSchema)],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { userId, userName, libraryId, libraryName, qrData, location } = request.body as any;
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

    // Check if student already has an active check-in
    const activeSessionResult = await tenantDb.query(
      `SELECT * FROM attendance 
       WHERE user_id = $1 AND library_id = $2 AND tenant_id = $3 AND check_out_time IS NULL
       ORDER BY check_in_time DESC LIMIT 1`,
      [userId, libraryId, tenantId]
    );

    if (activeSessionResult.rows.length > 0) {
      return reply.status(HTTP_STATUS.CONFLICT).send({
        success: false,
        error: {
          code: ERROR_CODES.CONFLICT,
          message: 'Already checked in',
        },
        data: {
          message: 'You already have an active session. Please check-out first.',
          activeSession: activeSessionResult.rows[0],
        },
      });
    }

    // Get user name if not provided
    let finalUserName = userName;
    if (!finalUserName) {
      const userResult = await tenantDb.query(
        'SELECT first_name, last_name FROM students WHERE id = $1 AND tenant_id = $2',
        [userId, tenantId]
      );
      if (userResult.rows.length > 0) {
        finalUserName = `${userResult.rows[0].first_name || ''} ${userResult.rows[0].last_name || ''}`.trim();
      }
    }

    // Get library name if not provided
    let finalLibraryName = libraryName;
    if (!finalLibraryName) {
      const libraryResult = await tenantDb.query(
        'SELECT name FROM libraries WHERE id = $1 AND tenant_id = $2',
        [libraryId, tenantId]
      );
      if (libraryResult.rows.length > 0) {
        finalLibraryName = libraryResult.rows[0].name;
      }
    }

    // Create new check-in record
    const attendanceResult = await tenantDb.query(
      `INSERT INTO attendance (
        tenant_id, user_id, user_name, library_id, library_name,
        check_in_time, check_in_method, check_in_location, qr_data, status, date
      ) VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7, $8, $9, CURRENT_DATE)
      RETURNING *`,
      [
        tenantId,
        userId,
        finalUserName || 'Unknown',
        libraryId,
        finalLibraryName || 'Unknown',
        'qr-code',
        location || 'QR Scanner',
        qrData ? JSON.stringify(qrData) : null,
        'checked-in',
      ]
    );

    const attendance = attendanceResult.rows[0];

    // Emit real-time event
    const io = getSocketIO();
    if (io) {
      io.to(`library:${libraryId}`).emit('attendance:check-in', {
        userId,
        userName: finalUserName,
        libraryId,
        timestamp: new Date().toISOString(),
      });
      io.to(`user:${userId}`).emit('attendance:confirmed', {
        type: 'check-in',
        libraryName: finalLibraryName,
        timestamp: new Date().toISOString(),
      });
    }

    logger.info(`✅ Check-in successful: ${finalUserName} at ${finalLibraryName}`);

    return reply.status(HTTP_STATUS.CREATED).send({
      success: true,
      message: `Checked in successfully at ${finalLibraryName}!`,
      data: attendance,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Error during check-in:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to check-in',
      },
    });
  }
});

/**
 * Mark check-out
 * POST /api/attendance/check-out
 */
fastify.post('/api/attendance/check-out', {
  preHandler: [validateBody(checkOutSchema)],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { userId, libraryId, location } = request.body as any;
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

    // Find active check-in session
    const activeSessionResult = await tenantDb.query(
      `SELECT * FROM attendance 
       WHERE user_id = $1 AND library_id = $2 AND tenant_id = $3 AND check_out_time IS NULL
       ORDER BY check_in_time DESC LIMIT 1`,
      [userId, libraryId, tenantId]
    );

    if (activeSessionResult.rows.length === 0) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'No active session',
        },
        data: {
          message: 'You need to check-in first before checking out.',
        },
      });
    }

    const activeSession = activeSessionResult.rows[0];

    // Calculate duration
    const checkInTime = new Date(activeSession.check_in_time);
    const checkOutTime = new Date();
    const durationMs = checkOutTime.getTime() - checkInTime.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const duration = `${hours}h ${minutes}m`;
    const durationMinutes = Math.floor(durationMs / (1000 * 60));

    // Update check-out
    const updatedResult = await tenantDb.query(
      `UPDATE attendance 
       SET check_out_time = NOW(),
           check_out_method = $1,
           check_out_location = $2,
           duration_minutes = $3,
           duration = $4,
           status = $5,
           updated_at = NOW()
       WHERE id = $6 AND tenant_id = $7
       RETURNING *`,
      [
        'qr-code',
        location || 'QR Scanner',
        durationMinutes,
        duration,
        'checked-out',
        activeSession.id,
        tenantId,
      ]
    );

    const updated = updatedResult.rows[0];

    // Emit real-time event
    const io = getSocketIO();
    if (io) {
      io.to(`library:${libraryId}`).emit('attendance:check-out', {
        userId,
        userName: activeSession.user_name,
        libraryId,
        duration,
        timestamp: checkOutTime.toISOString(),
      });
      io.to(`user:${userId}`).emit('attendance:confirmed', {
        type: 'check-out',
        libraryName: activeSession.library_name,
        duration,
        timestamp: checkOutTime.toISOString(),
      });
    }

    logger.info(`✅ Check-out successful: ${activeSession.user_name} - Duration: ${duration}`);

    return reply.send({
      success: true,
      message: `Checked out successfully! Study duration: ${duration}`,
      data: updated,
      duration,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Error during check-out:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to check-out',
      },
    });
  }
});

/**
 * Get current attendance status for user
 * GET /api/attendance/status/:userId
 */
fastify.get('/api/attendance/status/:userId', {
  preHandler: [validateParams(attendanceParamsSchema)],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { userId } = request.params as any;
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

    // Get active session
    const activeSessionResult = await tenantDb.query(
      `SELECT * FROM attendance 
       WHERE user_id = $1 AND tenant_id = $2 AND check_out_time IS NULL
       ORDER BY check_in_time DESC LIMIT 1`,
      [userId, tenantId]
    );

    if (activeSessionResult.rows.length > 0) {
      const activeSession = activeSessionResult.rows[0];
      // Calculate current duration
      const checkInTime = new Date(activeSession.check_in_time);
      const now = new Date();
      const durationMs = now.getTime() - checkInTime.getTime();
      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      
      return reply.send({
        success: true,
        isCheckedIn: true,
        data: {
          ...activeSession,
          currentDuration: `${hours}h ${minutes}m`,
        },
        timestamp: new Date().toISOString(),
      });
    }

    return reply.send({
      success: true,
      isCheckedIn: false,
      data: null,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Error fetching attendance status:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch attendance status',
      },
    });
  }
});

/**
 * Get attendance history for user
 * GET /api/attendance/history/:userId?limit=10&page=1
 */
fastify.get('/api/attendance/history/:userId', {
  preHandler: [
    validateParams(attendanceParamsSchema),
    validateQuery(attendanceQuerySchema),
  ],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { userId } = request.params as any;
    const { limit = 10, page = 1 } = request.query as any;
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

    // Get total count
    const countResult = await tenantDb.query(
      'SELECT COUNT(*) FROM attendance WHERE user_id = $1 AND tenant_id = $2',
      [userId, tenantId]
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated history
    const offset = (page - 1) * limit;
    const historyResult = await tenantDb.query(
      `SELECT * FROM attendance 
       WHERE user_id = $1 AND tenant_id = $2
       ORDER BY check_in_time DESC 
       LIMIT $3 OFFSET $4`,
      [userId, tenantId, limit, offset]
    );

    return reply.send({
      success: true,
      data: historyResult.rows,
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
    logger.error('Error fetching attendance history:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch attendance history',
      },
    });
  }
});

/**
 * Get attendance for library (owner view)
 * GET /api/attendance/library/:libraryId?date=2025-11-04
 */
fastify.get('/api/attendance/library/:libraryId', {
  preHandler: [
    validateParams(libraryAttendanceParamsSchema),
    validateQuery(attendanceQuerySchema),
  ],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { libraryId } = request.params as any;
    const { date } = request.query as any;
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
    const targetDate = date || new Date().toISOString().split('T')[0];

    // Get attendance for the date
    const attendanceResult = await tenantDb.query(
      `SELECT * FROM attendance 
       WHERE library_id = $1 AND tenant_id = $2 AND date = $3
       ORDER BY check_in_time DESC`,
      [libraryId, tenantId, targetDate]
    );

    const attendance = attendanceResult.rows;

    // Calculate stats
    const stats = {
      total: attendance.length,
      checkedIn: attendance.filter(a => a.status === 'checked-in').length,
      checkedOut: attendance.filter(a => a.status === 'checked-out').length,
    };

    return reply.send({
      success: true,
      data: attendance,
      stats,
      date: targetDate,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Error fetching library attendance:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch library attendance',
      },
    });
  }
});

// ============================================
// START SERVER
// ============================================

export async function startAttendanceService() {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    logger.info(`✅ Attendance Service started on port ${PORT}`);
  } catch (err) {
    logger.error('Failed to start Attendance Service:', err);
    process.exit(1);
  }
}

// Start if run directly
if (require.main === module) {
  startAttendanceService();
}

export default fastify;

