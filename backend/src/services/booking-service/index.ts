/**
 * 📚 BOOKING SERVICE
 * 
 * Handles all booking-related operations:
 * - Create/Read/Update/Delete bookings
 * - Real-time booking notifications
 * - Booking status management
 * - Library owner and student booking views
 */

import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import dotenv from 'dotenv';
import { tenantDbManager } from '../../config/database';
import { logger } from '../../utils/logger';
import { HTTP_STATUS, ERROR_CODES } from '../../config/constants';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth';
import { validateBody, validateQuery, validateParams } from '../../middleware/validator';
import { registerRateLimit, SERVICE_RATE_LIMITS } from '../../middleware/rateLimiter';
import { requestLogger } from '../../middleware/requestLogger';
import { errorHandler, notFoundHandler } from '../../middleware/errorHandler';
import {
  createBookingSchema,
  updateBookingSchema,
  getBookingsQuerySchema,
  bookingParamsSchema,
  userBookingsParamsSchema,
  libraryBookingsParamsSchema,
} from '../../validators/booking.validator';
import { emitBookingCreated, emitBookingUpdated, emitBookingCancelled } from '../../utils/socketHelpers';
import { config } from '../../config/env';

dotenv.config();

const PORT = config.ports.booking;

interface Booking {
  id?: string;
  user_id: string;
  library_id: string;
  seat_id?: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'completed';
  total_amount: number;
  payment_status?: 'pending' | 'paid' | 'refunded';
  created_at?: string;
  updated_at?: string;
}


/**
 * Create a new booking
 */
async function createBooking(data: Booking, tenantId: string) {
  try {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    // Validate required fields
    if (!data.user_id || !data.library_id || !data.start_time || !data.end_time) {
      throw new Error('Missing required fields: user_id, library_id, start_time, end_time');
    }

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    // Insert booking
    const result = await tenantDb.query(
      `INSERT INTO bookings (
        tenant_id, user_id, library_id, seat_id, start_time, end_time,
        status, total_amount, payment_status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *`,
      [
        tenantId,
        data.user_id,
        data.library_id,
        data.seat_id || null,
        data.start_time,
        data.end_time,
        data.status || 'pending',
        data.total_amount,
        data.payment_status || 'pending',
      ]
    );

    const booking = result.rows[0];

    // Enrich with user and library data
    const [userResult, libraryResult] = await Promise.all([
      tenantDb.query(
        'SELECT id, first_name, last_name, email FROM users WHERE id = $1 AND tenant_id = $2',
        [data.user_id, tenantId]
      ).catch(() => ({ rows: [] })),
      tenantDb.query(
        'SELECT id, name, address FROM libraries WHERE id = $1 AND tenant_id = $2',
        [data.library_id, tenantId]
      ).catch(() => ({ rows: [] })),
    ]);

    const enrichedBooking = {
      ...booking,
      studentName: userResult.rows[0]
        ? `${userResult.rows[0].first_name || ''} ${userResult.rows[0].last_name || ''}`.trim() || 'Unknown'
        : 'Unknown',
      libraryName: libraryResult.rows[0]?.name || 'Unknown',
    };

    // Emit real-time event
    emitBookingCreated(enrichedBooking);

    logger.info(`✅ Booking created: ${booking.id}`);
    return { success: true, data: enrichedBooking };
  } catch (error: any) {
    logger.error('Error creating booking:', error);
    throw error;
  }
}

/**
 * Get all bookings (with filters)
 */
async function getBookings(
  filters: {
    userId?: string;
    libraryId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  },
  tenantId: string
) {
  try {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);
    const { userId, libraryId, status, startDate, endDate, page = 1, limit = 50 } = filters;

    // Build query
    let query = 'SELECT * FROM bookings WHERE tenant_id = $1';
    const params: any[] = [tenantId];
    let paramIndex = 2;

    if (userId) {
      query += ` AND user_id = $${paramIndex++}`;
      params.push(userId);
    }

    if (libraryId) {
      query += ` AND library_id = $${paramIndex++}`;
      params.push(libraryId);
    }

    if (status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    if (startDate) {
      query += ` AND start_time >= $${paramIndex++}`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND end_time <= $${paramIndex++}`;
      params.push(endDate);
    }

    // Get total count
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const countResult = await tenantDb.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Pagination
    const offset = (page - 1) * limit;
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(limit, offset);

    const result = await tenantDb.query(query, params);

    // Enrich bookings with user and library data
    const enrichedBookings = await Promise.all(
      result.rows.map(async (booking) => {
        const [userResult, libraryResult] = await Promise.all([
          tenantDb.query(
            'SELECT id, first_name, last_name, email, phone FROM users WHERE id = $1 AND tenant_id = $2',
            [booking.user_id, tenantId]
          ).catch(() => ({ rows: [] })),
          tenantDb.query(
            'SELECT id, name, address, city FROM libraries WHERE id = $1 AND tenant_id = $2',
            [booking.library_id, tenantId]
          ).catch(() => ({ rows: [] })),
        ]);

        return {
          ...booking,
          studentName: userResult.rows[0]
            ? `${userResult.rows[0].first_name || ''} ${userResult.rows[0].last_name || ''}`.trim() || 'Unknown'
            : 'Unknown',
          libraryName: libraryResult.rows[0]?.name || 'Unknown',
          date: booking.start_time?.split('T')[0],
          time: new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      })
    );

    return {
      success: true,
      data: enrichedBookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  } catch (error: any) {
    logger.error('Error fetching bookings:', error);
    throw error;
  }
}

/**
 * Get booking by ID
 */
async function getBookingById(id: string, tenantId: string) {
  try {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    const result = await tenantDb.query(
      'SELECT * FROM bookings WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );

    if (!result.rows.length) {
      throw new Error('Booking not found');
    }

    const booking = result.rows[0];

    // Enrich with user and library data
    const [userResult, libraryResult] = await Promise.all([
      tenantDb.query(
        'SELECT id, first_name, last_name, email, phone FROM users WHERE id = $1 AND tenant_id = $2',
        [booking.user_id, tenantId]
      ).catch(() => ({ rows: [] })),
      tenantDb.query(
        'SELECT id, name, address, city FROM libraries WHERE id = $1 AND tenant_id = $2',
        [booking.library_id, tenantId]
      ).catch(() => ({ rows: [] })),
    ]);

    return {
      success: true,
      data: {
        ...booking,
        studentName: userResult.rows[0]
          ? `${userResult.rows[0].first_name || ''} ${userResult.rows[0].last_name || ''}`.trim() || 'Unknown'
          : 'Unknown',
        libraryName: libraryResult.rows[0]?.name || 'Unknown',
      },
    };
  } catch (error: any) {
    logger.error('Error fetching booking:', error);
    throw error;
  }
}

/**
 * Update booking
 */
async function updateBooking(id: string, updates: Partial<Booking>, tenantId: string) {
  try {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    // Build update query
    const fields = Object.keys(updates).filter(key => updates[key] !== undefined && key !== 'id' && key !== 'tenant_id');
    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    const setClause = fields.map((field, idx) => `${field} = $${idx + 3}`).join(', ');
    const values = [id, tenantId, ...fields.map(f => updates[f as keyof Booking])];

    const result = await tenantDb.query(
      `UPDATE bookings SET ${setClause}, updated_at = NOW()
       WHERE id = $1 AND tenant_id = $2
       RETURNING *`,
      values
    );

    if (!result.rows.length) {
      throw new Error('Booking not found');
    }

    const booking = result.rows[0];

    // Enrich with user and library data
    const [userResult, libraryResult] = await Promise.all([
      tenantDb.query(
        'SELECT id, first_name, last_name FROM users WHERE id = $1 AND tenant_id = $2',
        [booking.user_id, tenantId]
      ).catch(() => ({ rows: [] })),
      tenantDb.query(
        'SELECT id, name FROM libraries WHERE id = $1 AND tenant_id = $2',
        [booking.library_id, tenantId]
      ).catch(() => ({ rows: [] })),
    ]);

    const enrichedBooking = {
      ...booking,
      studentName: userResult.rows[0]
        ? `${userResult.rows[0].first_name || ''} ${userResult.rows[0].last_name || ''}`.trim() || 'Unknown'
        : 'Unknown',
      libraryName: libraryResult.rows[0]?.name || 'Unknown',
    };

    // Emit real-time event
    emitBookingUpdated(enrichedBooking);

    return { success: true, data: enrichedBooking };
  } catch (error: any) {
    logger.error('Error updating booking:', error);
    throw error;
  }
}

/**
 * Cancel booking
 */
async function cancelBooking(id: string, tenantId: string) {
  try {
    const result = await updateBooking(id, { status: 'cancelled' }, tenantId);
    
    // Emit cancellation event
    if (result.data) {
      emitBookingCancelled(result.data);
    }
    
    return result;
  } catch (error: any) {
    logger.error('Error cancelling booking:', error);
    throw error;
  }
}

/**
 * Initialize Booking Service
 */
export async function startBookingService() {
  const fastify: FastifyInstance = Fastify({
    logger: false,
  });

  // CORS
  await fastify.register(cors, {
    origin: config.cors.origins.length > 0 ? config.cors.origins : ['http://localhost:3002'],
    credentials: true,
  });

  // Security headers
  await fastify.register(helmet);

  // ============================================
  // RATE LIMITING
  // ============================================

  // Register rate limiting in async function
  (async () => {
    await registerRateLimit(fastify, SERVICE_RATE_LIMITS.booking);
  })();

  // ============================================
  // REQUEST LOGGING
  // ============================================

  fastify.addHook('onRequest', requestLogger);

  // ============================================
  // AUTHENTICATION MIDDLEWARE
  // ============================================

  fastify.addHook('onRequest', async (request: AuthenticatedRequest, reply) => {
    // Skip auth for health check
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

  // Health check
  fastify.get('/health', async () => {
    return {
      success: true,
      data: {
        status: 'healthy',
        service: 'booking-service',
        timestamp: new Date().toISOString(),
        database: 'tenant-managed',
      },
    };
  });

  // ============================================
  // BOOKING ROUTES
  // ============================================

  // Get all bookings
  fastify.get('/api/v1/bookings', {
    preHandler: [validateQuery(getBookingsQuerySchema)],
  }, async (request: AuthenticatedRequest, reply) => {
    try {
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

      const { userId, libraryId, status, startDate, endDate, page, limit } = request.query as any;
      const result = await getBookings({ userId, libraryId, status, startDate, endDate, page, limit }, tenantId);
      return reply.send(result);
    } catch (error: any) {
      logger.error('GET /api/v1/bookings error:', error);
      return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
        success: false,
        error: {
          code: ERROR_CODES.SERVER_ERROR,
          message: error.message || 'Failed to fetch bookings',
        },
      });
    }
  });

  // Get booking by ID
  fastify.get('/api/v1/bookings/:id', {
    preHandler: [validateParams(bookingParamsSchema)],
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const { id } = request.params as { id: string };
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

      const result = await getBookingById(id, tenantId);
      return reply.send(result);
    } catch (error: any) {
      logger.error('GET /api/v1/bookings/:id error:', error);
      if (error.message === 'Booking not found') {
        return reply.status(HTTP_STATUS.NOT_FOUND).send({
          success: false,
          error: {
            code: ERROR_CODES.RESOURCE_NOT_FOUND,
            message: error.message,
          },
        });
      }
      return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
        success: false,
        error: {
          code: ERROR_CODES.SERVER_ERROR,
          message: error.message || 'Failed to fetch booking',
        },
      });
    }
  });

  // Create booking
  fastify.post('/api/v1/bookings', {
    preHandler: [validateBody(createBookingSchema)],
  }, async (request: AuthenticatedRequest, reply) => {
    try {
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

      const bookingData = request.body as Booking;
      const result = await createBooking(bookingData, tenantId);
      return reply.status(HTTP_STATUS.CREATED).send(result);
    } catch (error: any) {
      logger.error('POST /api/v1/bookings error:', error);
      return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
        success: false,
        error: {
          code: ERROR_CODES.SERVER_ERROR,
          message: error.message || 'Failed to create booking',
        },
      });
    }
  });

  // Update booking
  fastify.put('/api/v1/bookings/:id', {
    preHandler: [
      validateParams(bookingParamsSchema),
      validateBody(updateBookingSchema),
    ],
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const { id } = request.params as { id: string };
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

      const updates = request.body as Partial<Booking>;
      const result = await updateBooking(id, updates, tenantId);
      return reply.send(result);
    } catch (error: any) {
      logger.error('PUT /api/v1/bookings/:id error:', error);
      if (error.message === 'Booking not found') {
        return reply.status(HTTP_STATUS.NOT_FOUND).send({
          success: false,
          error: {
            code: ERROR_CODES.RESOURCE_NOT_FOUND,
            message: error.message,
          },
        });
      }
      return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
        success: false,
        error: {
          code: ERROR_CODES.SERVER_ERROR,
          message: error.message || 'Failed to update booking',
        },
      });
    }
  });

  // Cancel booking
  fastify.patch('/api/v1/bookings/:id/cancel', async (request: AuthenticatedRequest, reply) => {
    try {
      const { id } = request.params as { id: string };
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

      const result = await cancelBooking(id, tenantId);
      return reply.send(result);
    } catch (error: any) {
      logger.error('PATCH /api/v1/bookings/:id/cancel error:', error);
      return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
        success: false,
        error: {
          code: ERROR_CODES.SERVER_ERROR,
          message: error.message || 'Failed to cancel booking',
        },
      });
    }
  });

  // Delete booking
  fastify.delete('/api/v1/bookings/:id', async (request: AuthenticatedRequest, reply) => {
    try {
      const { id } = request.params as { id: string };
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
        'DELETE FROM bookings WHERE id = $1 AND tenant_id = $2 RETURNING id',
        [id, tenantId]
      );

      if (!result.rows.length) {
        return reply.status(HTTP_STATUS.NOT_FOUND).send({
          success: false,
          error: {
            code: ERROR_CODES.RESOURCE_NOT_FOUND,
            message: 'Booking not found',
          },
        });
      }

      return reply.send({ success: true, message: 'Booking deleted successfully' });
    } catch (error: any) {
      logger.error('DELETE /api/v1/bookings/:id error:', error);
      return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
        success: false,
        error: {
          code: ERROR_CODES.SERVER_ERROR,
          message: error.message || 'Failed to delete booking',
        },
      });
    }
  });

  // Get bookings by user
  fastify.get('/api/v1/bookings/user/:userId', {
    preHandler: [validateParams(userBookingsParamsSchema)],
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const { userId } = request.params as { userId: string };
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

      const result = await getBookings({ userId }, tenantId);
      return reply.send(result);
    } catch (error: any) {
      logger.error('GET /api/v1/bookings/user/:userId error:', error);
      return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
        success: false,
        error: {
          code: ERROR_CODES.SERVER_ERROR,
          message: error.message || 'Failed to fetch bookings',
        },
      });
    }
  });

  // Get bookings by library
  fastify.get('/api/v1/bookings/library/:libraryId', {
    preHandler: [validateParams(libraryBookingsParamsSchema)],
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const { libraryId } = request.params as { libraryId: string };
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

      const result = await getBookings({ libraryId }, tenantId);
      return reply.send(result);
    } catch (error: any) {
      logger.error('GET /api/v1/bookings/library/:libraryId error:', error);
      return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
        success: false,
        error: {
          code: ERROR_CODES.SERVER_ERROR,
          message: error.message || 'Failed to fetch bookings',
        },
      });
    }
  });

  // Start server
  try {
    await fastify.listen({ port: Number(PORT), host: '0.0.0.0' });
    logger.info(`🚀 Booking Service running on port ${PORT}`);
  } catch (err) {
    logger.error('Failed to start Booking Service:', err);
    process.exit(1);
  }
}

// Start service if run directly
if (require.main === module) {
  startBookingService();
}

