/**
 * Unified Seats API Route
 * 
 * Consolidates:
 * - /api/seats (all seats)
 * - /api/libraries/:id/seats (library-specific seats)
 * - /api/seats/available (available seats)
 * 
 * Single endpoint with advanced filtering
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { 
  unifiedGetSeats, 
  unifiedCreateSeat, 
  unifiedUpdateSeat, 
  unifiedDeleteSeat 
} = require('../middleware/unifiedSeatMiddleware');
const { verifyToken, authorize, setTenantContext } = require('../middleware/auth');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Apply authentication and tenant context to all routes
router.use(verifyToken);
router.use(setTenantContext);

/**
 * GET /api/v2/seats
 * Unified endpoint for getting seats
 * 
 * Query Parameters:
 * - libraryId: Filter by library ID
 * - zone: Filter by zone
 * - status: Filter by status (active, inactive, maintenance)
 * - available: Filter by availability (true/false)
 * - seatType: Filter by seat type (standard, premium, vip, etc.)
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 50)
 * - sortBy: Sort field (default: 'seat_number')
 * - sortOrder: Sort order ('asc' or 'desc', default: 'asc')
 * 
 * Examples:
 * - GET /api/v2/seats - Get all seats
 * - GET /api/v2/seats?libraryId=xxx - Get library's seats
 * - GET /api/v2/seats?available=true - Get available seats
 * - GET /api/v2/seats?zone=A - Get seats in zone A
 * - GET /api/v2/seats?status=active - Get active seats
 */
router.get('/', unifiedGetSeats);

/**
 * GET /api/v2/seats/:seatId
 * Get specific seat by ID
 */
router.get('/:seatId', asyncHandler(async (req, res) => {
  const { seatId } = req.params;
  const { query } = require('../config/database');
  const { AppError } = require('../middleware/errorHandler');

  const seatResult = await query(`
    SELECT 
      s.*,
      l.name as library_name, l.address as library_address,
      CASE 
        WHEN EXISTS (
          SELECT 1 FROM bookings b 
          WHERE b.seat_id = s.id 
          AND b.status IN ('confirmed', 'pending')
          AND b.booking_date = CURRENT_DATE
        ) THEN false 
        ELSE true 
      END as is_available
    FROM seats s
    LEFT JOIN libraries l ON s.library_id = l.id
    WHERE s.id = $1 AND s.tenant_id = $2
  `, [seatId, req.user.tenantId]);

  if (seatResult.rows.length === 0) {
    throw new AppError('Seat not found', 404, 'SEAT_NOT_FOUND');
  }

  const seat = seatResult.rows[0];

  res.json({
    success: true,
    data: {
      id: seat.id,
      library: {
        id: seat.library_id,
        name: seat.library_name,
        address: seat.library_address
      },
      seatNumber: seat.seat_number,
      zone: seat.zone,
      seatType: seat.seat_type,
      status: seat.status,
      capacity: seat.capacity,
      features: seat.features,
      pricePerHour: seat.price_per_hour,
      isAvailable: seat.is_available,
      createdAt: seat.created_at,
      updatedAt: seat.updated_at
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

/**
 * POST /api/v2/seats
 * Create new seat
 * 
 * Body Parameters:
 * - libraryId: Library ID (required)
 * - seatNumber: Seat number (required)
 * - zone: Zone name (optional)
 * - seatType: Seat type (optional, default: 'standard')
 * - status: Status (optional, default: 'active')
 * - capacity: Capacity (optional, default: 1)
 * - features: Features object (optional, default: {})
 * - pricePerHour: Price per hour (optional)
 */
router.post('/', 
  authorize('super_admin', 'library_owner', 'branch_manager'),
  [
    body('libraryId').isUUID().withMessage('Valid library ID is required'),
    body('seatNumber').trim().isLength({ min: 1 }).withMessage('Seat number is required'),
    body('seatType').optional().isIn(['standard', 'premium', 'vip', 'group', 'study']),
    body('status').optional().isIn(['active', 'inactive', 'maintenance']),
    body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
    body('pricePerHour').optional().isFloat({ min: 0 }).withMessage('Price must be non-negative')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
        details: errors.array()
      });
    }

    return unifiedCreateSeat(req, res);
  })
);

/**
 * PUT /api/v2/seats/:seatId
 * Update seat information
 * 
 * Body Parameters:
 * - status: Seat status (optional)
 * - zone: Zone name (optional)
 * - seatType: Seat type (optional)
 * - capacity: Capacity (optional)
 * - features: Features object (optional)
 * - pricePerHour: Price per hour (optional)
 */
router.put('/:seatId',
  authorize('super_admin', 'library_owner', 'branch_manager'),
  [
    body('status').optional().isIn(['active', 'inactive', 'maintenance']),
    body('capacity').optional().isInt({ min: 1 }),
    body('pricePerHour').optional().isFloat({ min: 0 })
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
        details: errors.array()
      });
    }

    return unifiedUpdateSeat(req, res);
  })
);

/**
 * DELETE /api/v2/seats/:seatId
 * Delete seat (soft delete - sets status to inactive)
 */
router.delete('/:seatId',
  authorize('super_admin', 'library_owner'),
  unifiedDeleteSeat
);

/**
 * Convenience Routes for Backward Compatibility
 */

/**
 * GET /api/v2/seats/library/:libraryId
 * Get library's seats (convenience route)
 */
router.get('/library/:libraryId', (req, res, next) => {
  req.query.libraryId = req.params.libraryId;
  return unifiedGetSeats(req, res, next);
});

/**
 * GET /api/v2/seats/available
 * Get available seats (convenience route)
 */
router.get('/available', (req, res, next) => {
  req.query.available = 'true';
  return unifiedGetSeats(req, res, next);
});

module.exports = router;
