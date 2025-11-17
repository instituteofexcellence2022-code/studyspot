const express = require('express');
const { body, query: queryValidator, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { verifyToken, authorize, setTenantContext } = require('../middleware/auth');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');
const notificationService = require('../services/notificationService');
const analyticsService = require('../services/analyticsService');

const router = express.Router();

// Apply authentication and tenant context to all routes
router.use(verifyToken);
router.use(setTenantContext);

// Check seat availability
router.get('/availability', [
  queryValidator('libraryId').isUUID().withMessage('Valid library ID is required'),
  queryValidator('date').isISO8601().withMessage('Valid date is required'),
  queryValidator('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time is required'),
  queryValidator('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time is required'),
  queryValidator('zone').optional().isString()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }

  const { libraryId, date, startTime, endTime, zone } = req.query;

  // Check if library exists and is active
  const libraryResult = await query(`
    SELECT id, name, status FROM libraries 
    WHERE id = $1 AND status = 'active' AND tenant_id = $2
  `, [libraryId, req.user.tenantId]);

  if (libraryResult.rows.length === 0) {
    throw new AppError('Library not found', 404, 'LIBRARY_NOT_FOUND');
  }

  // Build seat availability query
  let whereClause = `
    WHERE s.library_id = $1 
    AND s.is_active = true 
    AND s.is_available = true
  `;
  const queryParams = [libraryId];
  let paramCount = 1;

  if (zone) {
    whereClause += ` AND s.zone = $${++paramCount}`;
    queryParams.push(zone);
  }

  // Exclude seats that are already booked for the requested time slot
  whereClause += `
    AND s.id NOT IN (
      SELECT seat_id FROM bookings 
      WHERE library_id = $${++paramCount} 
      AND booking_date = $${++paramCount}
      AND status IN ('confirmed', 'completed')
      AND (
        (start_time <= $${++paramCount} AND end_time > $${++paramCount}) OR
        (start_time < $${++paramCount} AND end_time >= $${++paramCount}) OR
        (start_time >= $${++paramCount} AND end_time <= $${++paramCount})
      )
    )
  `;
  queryParams.push(libraryId, date, startTime, startTime, endTime, endTime, startTime, endTime);

  const seatsResult = await query(`
    SELECT 
      s.id, s.seat_number, s.zone, s.seat_type, s.amenities, s.location
    FROM seats s
    ${whereClause}
    ORDER BY s.zone, s.seat_number
  `, queryParams);

  // Get pricing information
  const pricingResult = await query(`
    SELECT pricing FROM libraries WHERE id = $1
  `, [libraryId]);

  const pricing = pricingResult.rows[0]?.pricing || {};

  res.json({
    success: true,
    data: {
      library: {
        id: libraryId,
        name: libraryResult.rows[0].name
      },
      date,
      timeSlot: {
        startTime,
        endTime
      },
      availableSeats: seatsResult.rows.map(seat => ({
        id: seat.id,
        seatNumber: seat.seat_number,
        zone: seat.zone,
        seatType: seat.seat_type,
        amenities: seat.amenities,
        location: seat.location
      })),
      totalAvailable: seatsResult.rows.length,
      pricing
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Create booking
router.post('/', [
  body('libraryId').isUUID().withMessage('Valid library ID is required'),
  body('seatId').notEmpty().withMessage('Valid seat ID is required'), // Allow string IDs for mock seats
  body('date').isISO8601().withMessage('Valid date is required'),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time is required'),
  body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time is required'),
  body('bookingType').optional().isIn(['hourly', 'daily', 'monthly']).withMessage('Invalid booking type'),
  body('paymentMethod').optional().isIn(['online', 'offline']).withMessage('Invalid payment method'),
  body('feePlanId').optional().isString().withMessage('Fee plan ID should be a string'),
  body('totalAmount').optional().isFloat({ min: 0 }).withMessage('Total amount must be a positive number')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }

  const { libraryId, seatId, date, startTime, endTime, bookingType = 'hourly', paymentMethod = 'online', feePlanId, totalAmount: providedAmount } = req.body;

  // Validate date is not in the past
  const bookingDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (bookingDate < today) {
    throw new AppError('Cannot book for past dates', 400, 'INVALID_BOOKING_DATE');
  }

  // Check if seat exists and is available (handle both UUID and mock seat IDs)
  let seat;
  const isMockSeat = seatId.startsWith('seat-');
  
  if (isMockSeat) {
    // For mock seats, extract seat number and zone from ID
    // Format: seat-{number} or zone-seat-{number}
    const seatNumber = seatId.replace(/^seat-/, '').replace(/^[^-]+-/, '');
    const zoneMatch = seatId.match(/^([^-]+)-seat-/);
    const zone = zoneMatch ? zoneMatch[1] : 'general';
    
    // Create a mock seat object for booking
    seat = {
      id: seatId,
      seat_number: seatNumber || '1',
      zone: zone,
      library_name: 'Library'
    };
    
    logger.info(`[BOOKING] Using mock seat: ${seatId}, zone: ${zone}`);
  } else {
    // Real seat - check database
    const seatResult = await query(`
      SELECT s.id, s.seat_number, s.zone, l.name as library_name, l.pricing
      FROM seats s
      JOIN libraries l ON s.library_id = l.id
      WHERE s.id = $1 AND s.library_id = $2 AND s.is_active = true AND s.is_available = true
      AND l.tenant_id = $3
    `, [seatId, libraryId, req.user.tenantId]);

    if (seatResult.rows.length === 0) {
      throw new AppError('Seat not available', 400, 'SEAT_NOT_AVAILABLE');
    }

    seat = seatResult.rows[0];
  }

  // Check for conflicting bookings (only for real seats)
  if (!isMockSeat) {
    const conflictResult = await query(`
      SELECT id FROM bookings 
      WHERE seat_id = $1 
      AND booking_date = $2
      AND status IN ('confirmed', 'completed')
      AND (
        (start_time <= $3 AND end_time > $3) OR
        (start_time < $4 AND end_time >= $4) OR
        (start_time >= $3 AND end_time <= $4)
      )
    `, [seatId, date, startTime, endTime]);

    if (conflictResult.rows.length > 0) {
      throw new AppError('Seat is already booked for this time slot', 400, 'SEAT_CONFLICT');
    }
  }

  // Calculate total amount - use provided amount from fee plan if available, otherwise calculate
  let totalAmount = 0;
  
  if (providedAmount && providedAmount > 0) {
    // Use the calculated amount from frontend (based on fee plan pricing)
    totalAmount = parseFloat(providedAmount);
    logger.info(`[BOOKING] Using provided amount from fee plan: ${totalAmount}`);
  } else {
    // Fallback to library pricing calculation
    const pricing = seat.pricing || {};
    
    if (bookingType === 'hourly') {
      const startHour = parseInt(startTime.split(':')[0]);
      const endHour = parseInt(endTime.split(':')[0]);
      let hours = endHour - startHour;
      // Handle night shift (spans midnight)
      if (hours < 0) {
        hours = 24 + hours; // e.g., 23:00 to 06:00 = 7 hours
      }
      totalAmount = (pricing.hourly || 50) * hours;
    } else if (bookingType === 'daily') {
      totalAmount = pricing.daily || 300;
    } else if (bookingType === 'monthly') {
      totalAmount = pricing.monthly || 5000;
    }
    logger.info(`[BOOKING] Calculated amount from library pricing: ${totalAmount}`);
  }

  // Generate QR code
  const qrCode = `QR_${seat.seat_number}_${Date.now()}`;

  // Create booking
  // For mock seats, we'll store the seat identifier as-is
  const bookingSeatId = isMockSeat ? seat.seat_number : seatId;
  
  // Build metadata object
  const metadata = {
    originalSeatId: seatId,
    isMockSeat,
    zone: seat.zone,
    seatNumber: seat.seat_number
  };
  
  // Add metadata from request if provided
  if (req.body.metadata) {
    Object.assign(metadata, req.body.metadata);
  }
  
  // Check if fee_plan_id and metadata columns exist, if not, use alternative approach
  let bookingResult;
  try {
    bookingResult = await query(`
      INSERT INTO bookings (
        user_id, library_id, seat_id, booking_date, start_time, end_time,
        booking_type, status, payment_status, total_amount, payment_method, qr_code,
        fee_plan_id, metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id, booking_date, start_time, end_time, booking_type, status, 
                payment_status, total_amount, qr_code, created_at
    `, [
      req.user.id, libraryId, bookingSeatId, date, startTime, endTime,
      bookingType, 'confirmed', paymentMethod === 'online' ? 'pending' : 'completed',
      totalAmount, paymentMethod, qrCode,
      feePlanId || null,
      JSON.stringify(metadata)
    ]);
  } catch (dbError) {
    // If columns don't exist, try without them
    if (dbError.message.includes('column "fee_plan_id"') || dbError.message.includes('column "metadata"')) {
      logger.warn('[BOOKING] fee_plan_id or metadata column not found, creating booking without them');
      bookingResult = await query(`
        INSERT INTO bookings (
          user_id, library_id, seat_id, booking_date, start_time, end_time,
          booking_type, status, payment_status, total_amount, payment_method, qr_code
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id, booking_date, start_time, end_time, booking_type, status, 
                  payment_status, total_amount, qr_code, created_at
      `, [
        req.user.id, libraryId, bookingSeatId, date, startTime, endTime,
        bookingType, 'confirmed', paymentMethod === 'online' ? 'pending' : 'completed',
        totalAmount, paymentMethod, qrCode
      ]);
    } else {
      throw dbError;
    }
  }

  const booking = bookingResult.rows[0];

  // Create payment record if online payment
  if (paymentMethod === 'online') {
    await query(`
      INSERT INTO payments (
        booking_id, user_id, amount, currency, payment_method, payment_gateway, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      booking.id, req.user.id, totalAmount, 'INR', 'online', 'razorpay', 'pending'
    ]);
  }

  // Send multi-channel notification
  await notificationService.sendTemplateNotification(req.user.id, 'booking_confirmed', {
    libraryName: seat.library_name,
    date: date,
    timeSlot: `${startTime} - ${endTime}`,
    bookingId: booking.id
  }, ['in_app', 'email', 'sms']);

  // Track analytics event
  await analyticsService.trackEvent(req.user.id, 'booking_created', {
    bookingId: booking.id,
    libraryId,
    seatId,
    totalAmount,
    bookingType: booking.booking_type
  });

  // Log booking creation
  logger.logBusinessEvent('booking_created', {
    bookingId: booking.id,
    userId: req.user.id,
    libraryId,
    seatId,
    date,
    startTime,
    endTime,
    totalAmount
  });

  res.status(201).json({
    success: true,
    data: {
      bookingId: booking.id,
      status: booking.status,
      paymentStatus: booking.payment_status,
      totalAmount: booking.total_amount,
      paymentRequired: paymentMethod === 'online',
      qrCode: booking.qr_code,
      seat: {
        id: seatId,
        number: seat.seat_number,
        zone: seat.zone
      },
      library: {
        id: libraryId,
        name: seat.library_name
      },
      bookingDate: booking.booking_date,
      timeSlot: {
        startTime: booking.start_time,
        endTime: booking.end_time
      },
      bookingType: booking.booking_type,
      createdAt: booking.created_at
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Get user's bookings
router.get('/', asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, dateFrom, dateTo } = req.query;
  const offset = (page - 1) * limit;

  let whereClause = 'WHERE b.user_id = $1';
  const queryParams = [req.user.id];
  let paramCount = 1;

  if (status) {
    whereClause += ` AND b.status = $${++paramCount}`;
    queryParams.push(status);
  }

  if (dateFrom) {
    whereClause += ` AND b.booking_date >= $${++paramCount}`;
    queryParams.push(dateFrom);
  }

  if (dateTo) {
    whereClause += ` AND b.booking_date <= $${++paramCount}`;
    queryParams.push(dateTo);
  }

  const bookingsQuery = `
    SELECT 
      b.id, b.booking_date, b.start_time, b.end_time, b.booking_type,
      b.status, b.payment_status, b.total_amount, b.check_in_time, b.check_out_time,
      b.qr_code, b.created_at,
      l.name as library_name, l.address as library_address,
      s.seat_number, s.zone
    FROM bookings b
    JOIN libraries l ON b.library_id = l.id
    JOIN seats s ON b.seat_id = s.id
    ${whereClause}
    ORDER BY b.booking_date DESC, b.start_time DESC
    LIMIT $${++paramCount} OFFSET $${++paramCount}
  `;

  queryParams.push(limit, offset);

  const bookings = await query(bookingsQuery, queryParams);

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM bookings b
    ${whereClause}
  `;
  const countResult = await query(countQuery, queryParams.slice(0, -2));
  const total = parseInt(countResult.rows[0].total);

  res.json({
    success: true,
    data: bookings.rows.map(booking => ({
      id: booking.id,
      bookingDate: booking.booking_date,
      startTime: booking.start_time,
      endTime: booking.end_time,
      bookingType: booking.booking_type,
      status: booking.status,
      paymentStatus: booking.payment_status,
      totalAmount: booking.total_amount,
      checkInTime: booking.check_in_time,
      checkOutTime: booking.check_out_time,
      qrCode: booking.qr_code,
      createdAt: booking.created_at,
      library: {
        name: booking.library_name,
        address: booking.library_address
      },
      seat: {
        number: booking.seat_number,
        zone: booking.zone
      }
    })),
    meta: {
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      },
      timestamp: new Date().toISOString()
    }
  });
}));

// Get specific booking
router.get('/:bookingId', asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  const bookingResult = await query(`
    SELECT 
      b.id, b.booking_date, b.start_time, b.end_time, b.booking_type,
      b.status, b.payment_status, b.total_amount, b.check_in_time, b.check_out_time,
      b.qr_code, b.notes, b.created_at, b.updated_at,
      l.name as library_name, l.address as library_address, l.contact_info,
      s.seat_number, s.zone, s.seat_type
    FROM bookings b
    JOIN libraries l ON b.library_id = l.id
    JOIN seats s ON b.seat_id = s.id
    WHERE b.id = $1 AND b.user_id = $2
  `, [bookingId, req.user.id]);

  if (bookingResult.rows.length === 0) {
    throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
  }

  const booking = bookingResult.rows[0];

  res.json({
    success: true,
    data: {
      id: booking.id,
      bookingDate: booking.booking_date,
      startTime: booking.start_time,
      endTime: booking.end_time,
      bookingType: booking.booking_type,
      status: booking.status,
      paymentStatus: booking.payment_status,
      totalAmount: booking.total_amount,
      checkInTime: booking.check_in_time,
      checkOutTime: booking.check_out_time,
      qrCode: booking.qr_code,
      notes: booking.notes,
      createdAt: booking.created_at,
      updatedAt: booking.updated_at,
      library: {
        name: booking.library_name,
        address: booking.library_address,
        contactInfo: booking.contact_info
      },
      seat: {
        number: booking.seat_number,
        zone: booking.zone,
        type: booking.seat_type
      }
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Cancel booking
router.delete('/:bookingId', asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  // Check if booking exists and belongs to user
  const bookingResult = await query(`
    SELECT b.id, b.booking_date, b.start_time, b.status, b.payment_status,
           l.name as library_name
    FROM bookings b
    JOIN libraries l ON b.library_id = l.id
    WHERE b.id = $1 AND b.user_id = $2
  `, [bookingId, req.user.id]);

  if (bookingResult.rows.length === 0) {
    throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
  }

  const booking = bookingResult.rows[0];

  // Check if booking can be cancelled
  if (booking.status === 'cancelled') {
    throw new AppError('Booking is already cancelled', 400, 'BOOKING_ALREADY_CANCELLED');
  }

  if (booking.status === 'completed') {
    throw new AppError('Cannot cancel completed booking', 400, 'CANNOT_CANCEL_COMPLETED');
  }

  // Check if booking is in the past
  const bookingDateTime = new Date(`${booking.booking_date} ${booking.start_time}`);
  if (bookingDateTime < new Date()) {
    throw new AppError('Cannot cancel past booking', 400, 'CANNOT_CANCEL_PAST_BOOKING');
  }

  // Update booking status
  await query(`
    UPDATE bookings 
    SET status = 'cancelled', updated_at = NOW()
    WHERE id = $1
  `, [bookingId]);

  // Update payment status if needed
  if (booking.payment_status === 'completed') {
    await query(`
      UPDATE payments 
      SET status = 'refunded', updated_at = NOW()
      WHERE booking_id = $1
    `, [bookingId]);
  }

  // Create notification
  await query(`
    INSERT INTO notifications (user_id, title, message, type, data)
    VALUES ($1, $2, $3, $4, $5)
  `, [
    req.user.id,
    'Booking Cancelled',
    `Your booking for ${booking.library_name} has been cancelled.`,
    'booking',
    JSON.stringify({ bookingId, libraryName: booking.library_name })
  ]);

  // Log booking cancellation
  logger.logBusinessEvent('booking_cancelled', {
    bookingId,
    userId: req.user.id,
    libraryName: booking.library_name
  });

  res.json({
    success: true,
    data: {
      message: 'Booking cancelled successfully',
      bookingId
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Check-in to library
router.post('/:bookingId/checkin', [
  body('qrCode').optional().isString(),
  body('location').optional().isObject()
], asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { qrCode, location } = req.body;

  // Check if booking exists and belongs to user
  const bookingResult = await query(`
    SELECT b.id, b.booking_date, b.start_time, b.end_time, b.status, b.qr_code,
           l.name as library_name, s.seat_number
    FROM bookings b
    JOIN libraries l ON b.library_id = l.id
    JOIN seats s ON b.seat_id = s.id
    WHERE b.id = $1 AND b.user_id = $2
  `, [bookingId, req.user.id]);

  if (bookingResult.rows.length === 0) {
    throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
  }

  const booking = bookingResult.rows[0];

  // Validate booking status
  if (booking.status !== 'confirmed') {
    throw new AppError('Booking is not confirmed', 400, 'BOOKING_NOT_CONFIRMED');
  }

  // Validate QR code if provided
  if (qrCode && qrCode !== booking.qr_code) {
    throw new AppError('Invalid QR code', 400, 'INVALID_QR_CODE');
  }

  // Check if booking is for today
  const today = new Date().toISOString().split('T')[0];
  if (booking.booking_date !== today) {
    throw new AppError('Booking is not for today', 400, 'BOOKING_NOT_FOR_TODAY');
  }

  // Check if already checked in
  const checkInResult = await query(`
    SELECT check_in_time FROM bookings WHERE id = $1
  `, [bookingId]);

  if (checkInResult.rows[0].check_in_time) {
    throw new AppError('Already checked in', 400, 'ALREADY_CHECKED_IN');
  }

  // Update check-in time
  await query(`
    UPDATE bookings 
    SET check_in_time = NOW(), updated_at = NOW()
    WHERE id = $1
  `, [bookingId]);

  // Create notification
  await query(`
    INSERT INTO notifications (user_id, title, message, type, data)
    VALUES ($1, $2, $3, $4, $5)
  `, [
    req.user.id,
    'Check-in Successful',
    `You have successfully checked in to ${booking.library_name} for seat ${booking.seat_number}.`,
    'booking',
    JSON.stringify({ bookingId, libraryName: booking.library_name, seatNumber: booking.seat_number })
  ]);

  // Log check-in
  logger.logBusinessEvent('booking_checkin', {
    bookingId,
    userId: req.user.id,
    libraryName: booking.library_name,
    seatNumber: booking.seat_number,
    location
  });

  res.json({
    success: true,
    data: {
      message: 'Check-in successful',
      bookingId,
      checkInTime: new Date().toISOString(),
      library: {
        name: booking.library_name
      },
      seat: {
        number: booking.seat_number
      }
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Check-out from library
router.post('/:bookingId/checkout', asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  // Check if booking exists and belongs to user
  const bookingResult = await query(`
    SELECT b.id, b.booking_date, b.start_time, b.end_time, b.status, b.check_in_time,
           l.name as library_name, s.seat_number
    FROM bookings b
    JOIN libraries l ON b.library_id = l.id
    JOIN seats s ON b.seat_id = s.id
    WHERE b.id = $1 AND b.user_id = $2
  `, [bookingId, req.user.id]);

  if (bookingResult.rows.length === 0) {
    throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
  }

  const booking = bookingResult.rows[0];

  // Check if checked in
  if (!booking.check_in_time) {
    throw new AppError('Not checked in', 400, 'NOT_CHECKED_IN');
  }

  // Check if already checked out
  const checkOutResult = await query(`
    SELECT check_out_time FROM bookings WHERE id = $1
  `, [bookingId]);

  if (checkOutResult.rows[0].check_out_time) {
    throw new AppError('Already checked out', 400, 'ALREADY_CHECKED_OUT');
  }

  // Update check-out time and status
  await query(`
    UPDATE bookings 
    SET check_out_time = NOW(), status = 'completed', updated_at = NOW()
    WHERE id = $1
  `, [bookingId]);

  // Create notification
  await query(`
    INSERT INTO notifications (user_id, title, message, type, data)
    VALUES ($1, $2, $3, $4, $5)
  `, [
    req.user.id,
    'Check-out Successful',
    `You have successfully checked out from ${booking.library_name}. Thank you for using StudySpot!`,
    'booking',
    JSON.stringify({ bookingId, libraryName: booking.library_name, seatNumber: booking.seat_number })
  ]);

  // Log check-out
  logger.logBusinessEvent('booking_checkout', {
    bookingId,
    userId: req.user.id,
    libraryName: booking.library_name,
    seatNumber: booking.seat_number
  });

  res.json({
    success: true,
    data: {
      message: 'Check-out successful',
      bookingId,
      checkOutTime: new Date().toISOString(),
      library: {
        name: booking.library_name
      },
      seat: {
        number: booking.seat_number
      }
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

module.exports = router;
