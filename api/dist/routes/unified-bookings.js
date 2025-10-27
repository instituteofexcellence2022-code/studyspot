/**
 * Unified Bookings API Route
 * 
 * Consolidates:
 * - /api/bookings (all bookings - admin)
 * - /api/users/bookings (user's bookings)
 * - /api/libraries/:id/bookings (library bookings)
 * 
 * Single endpoint with filter-based filtering
 */

const express = require('express');
const {
  body,
  validationResult
} = require('express-validator');
const {
  unifiedGetBookings,
  unifiedCreateBooking,
  unifiedUpdateBooking,
  unifiedCancelBooking
} = require('../middleware/unifiedBookingMiddleware');
const {
  verifyToken,
  authorize,
  setTenantContext
} = require('../middleware/auth');
const {
  AppError,
  asyncHandler
} = require('../middleware/errorHandler');
const router = express.Router();

// Apply authentication and tenant context to all routes
router.use(verifyToken);
router.use(setTenantContext);

/**
 * GET /api/v2/bookings
 * Unified endpoint for getting bookings
 * 
 * Query Parameters:
 * - userId: Filter by user ID
 * - libraryId: Filter by library ID
 * - date: Filter by specific date
 * - dateFrom: Filter from date
 * - dateTo: Filter to date
 * - status: Filter by status (confirmed, cancelled, completed, etc.)
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20)
 * - sortBy: Sort field (default: 'created_at')
 * - sortOrder: Sort order ('asc' or 'desc', default: 'desc')
 * 
 * Examples:
 * - GET /api/v2/bookings - Get all bookings (admin)
 * - GET /api/v2/bookings?userId=xxx - Get user's bookings
 * - GET /api/v2/bookings?libraryId=xxx - Get library's bookings
 * - GET /api/v2/bookings?date=2024-01-15 - Get bookings for specific date
 * - GET /api/v2/bookings?status=confirmed - Get confirmed bookings
 */
router.get('/', unifiedGetBookings);

/**
 * GET /api/v2/bookings/:bookingId
 * Get specific booking by ID
 */
router.get('/:bookingId', asyncHandler(async (req, res) => {
  const {
    bookingId
  } = req.params;
  const {
    query
  } = require('../config/database');
  const {
    AppError
  } = require('../middleware/errorHandler');
  const bookingResult = await query(`
    SELECT 
      b.*,
      u.email as user_email, u.first_name, u.last_name,
      l.name as library_name, l.address as library_address,
      s.seat_number, s.zone as seat_zone
    FROM bookings b
    LEFT JOIN users u ON b.user_id = u.id
    LEFT JOIN libraries l ON b.library_id = l.id
    LEFT JOIN seats s ON b.seat_id = s.id
    WHERE b.id = $1 AND b.tenant_id = $2
  `, [bookingId, req.user.tenantId]);
  if (bookingResult.rows.length === 0) {
    throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
  }
  const booking = bookingResult.rows[0];
  res.json({
    success: true,
    data: {
      id: booking.id,
      user: {
        id: booking.user_id,
        email: booking.user_email,
        firstName: booking.first_name,
        lastName: booking.last_name
      },
      library: {
        id: booking.library_id,
        name: booking.library_name,
        address: booking.library_address
      },
      seat: {
        id: booking.seat_id,
        seatNumber: booking.seat_number,
        zone: booking.seat_zone
      },
      date: booking.booking_date,
      time: {
        start: booking.start_time,
        end: booking.end_time
      },
      status: booking.status,
      payment: {
        amount: booking.total_amount,
        status: booking.payment_status
      },
      bookingType: booking.booking_type,
      createdAt: booking.created_at,
      updatedAt: booking.updated_at
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

/**
 * POST /api/v2/bookings
 * Create new booking
 * 
 * Body Parameters:
 * - libraryId: Library ID (required)
 * - seatId: Seat ID (required)
 * - bookingDate: Booking date (required, YYYY-MM-DD)
 * - startTime: Start time (required, HH:mm)
 * - endTime: End time (required, HH:mm)
 * - bookingType: Booking type (optional, default: 'hourly')
 * - paymentMethod: Payment method (optional, default: 'online')
 */
router.post('/', [body('libraryId').isUUID().withMessage('Valid library ID is required'), body('seatId').isUUID().withMessage('Valid seat ID is required'), body('bookingDate').isISO8601().withMessage('Valid date is required'), body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time is required'), body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time is required'), body('bookingType').optional().isIn(['hourly', 'daily', 'monthly']).withMessage('Invalid booking type'), body('paymentMethod').optional().isIn(['online', 'offline']).withMessage('Invalid payment method')], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }
  return unifiedCreateBooking(req, res);
}));

/**
 * PUT /api/v2/bookings/:bookingId
 * Update booking information
 * 
 * Body Parameters:
 * - status: Booking status (optional)
 * - startTime: Start time (optional, HH:mm)
 * - endTime: End time (optional, HH:mm)
 */
router.put('/:bookingId', [body('status').optional().isIn(['confirmed', 'cancelled', 'completed', 'pending']), body('startTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), body('endTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }
  return unifiedUpdateBooking(req, res);
}));

/**
 * DELETE /api/v2/bookings/:bookingId
 * Cancel booking (with optional reason)
 */
router.delete('/:bookingId', [body('reason').optional().isString()], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }
  return unifiedCancelBooking(req, res);
}));

/**
 * Convenience Routes for Backward Compatibility
 */

/**
 * GET /api/v2/bookings/user/:userId
 * Get user's bookings (convenience route)
 */
router.get('/user/:userId', (req, res, next) => {
  req.query.userId = req.params.userId;
  return unifiedGetBookings(req, res, next);
});

/**
 * GET /api/v2/bookings/library/:libraryId
 * Get library's bookings (convenience route)
 */
router.get('/library/:libraryId', (req, res, next) => {
  req.query.libraryId = req.params.libraryId;
  return unifiedGetBookings(req, res, next);
});
module.exports = router;