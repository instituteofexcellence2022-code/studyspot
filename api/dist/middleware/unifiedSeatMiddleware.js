/**
 * Unified Seat Middleware
 * 
 * Consolidates seat operations into a single unified system
 * Replaces separate endpoints for library seats, library-specific seats, and seat availability
 */

const {
  query
} = require('../config/database');
const {
  AppError,
  asyncHandler
} = require('./errorHandler');
const {
  logger
} = require('../utils/logger');
const QueryBuilder = require('../utils/queryBuilder');
const {
  validatePagination,
  validateEnum
} = require('../utils/validators');
const {
  formatPaginatedResponse,
  formatSingleResponse
} = require('../utils/responseFormatter');
const ERROR_CODES = require('../constants/errorCodes');

/**
 * Unified getSeats handler
 * Supports filtering by libraryId, zone, status, availability, etc.
 */
const unifiedGetSeats = asyncHandler(async (req, res) => {
  const {
    libraryId,
    zone,
    status,
    available,
    seatType,
    page,
    limit,
    sortBy = 'seat_number',
    sortOrder = 'asc'
  } = req.query;
  const {
    page: validatedPage,
    limit: validatedLimit
  } = validatePagination(page, limit || 50);
  const offset = (validatedPage - 1) * validatedLimit;
  const tenantId = req.user.tenantId;
  const queryBuilder = new QueryBuilder('s', tenantId);
  if (libraryId) queryBuilder.whereEquals('library_id', libraryId);
  if (zone) queryBuilder.whereEquals('zone', zone);
  if (status) {
    validateEnum(status, ['active', 'inactive', 'maintenance'], 'Status');
    queryBuilder.whereEquals('status', status);
  }
  if (seatType) {
    validateEnum(seatType, ['standard', 'premium', 'vip', 'group', 'study'], 'Seat Type');
    queryBuilder.whereEquals('seat_type', seatType);
  }
  if (available !== undefined) {
    const availabilityQuery = available === 'true' ? 'NOT EXISTS (SELECT 1 FROM bookings b WHERE b.seat_id = s.id AND b.status IN (\'confirmed\', \'pending\') AND b.booking_date = CURRENT_DATE)' : 'EXISTS (SELECT 1 FROM bookings b WHERE b.seat_id = s.id AND b.status IN (\'confirmed\', \'pending\') AND b.booking_date = CURRENT_DATE)';
    queryBuilder.whereCustom(availabilityQuery, []);
  }
  const {
    whereClause,
    params
  } = queryBuilder.build();
  const seatsQuery = `
    SELECT s.id, s.library_id, s.seat_number, s.zone, s.seat_type, 
           s.status, s.capacity, s.features, s.price_per_hour, s.created_at, s.updated_at,
           l.name as library_name,
           CASE WHEN EXISTS (
             SELECT 1 FROM bookings b 
             WHERE b.seat_id = s.id AND b.status IN ('confirmed', 'pending')
             AND b.booking_date = CURRENT_DATE
           ) THEN false ELSE true END as is_available
    FROM seats s
    LEFT JOIN libraries l ON s.library_id = l.id
    WHERE ${whereClause}
    ORDER BY ${sortBy} ${sortOrder}
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;
  const seats = await query(seatsQuery, [...params, validatedLimit, offset]);
  const countResult = await query(`SELECT COUNT(*) as total FROM seats s WHERE ${whereClause}`, params);
  const total = parseInt(countResult.rows[0].total);
  const meta = {
    pagination: {
      page: validatedPage,
      limit: validatedLimit,
      total,
      totalPages: Math.ceil(total / validatedLimit)
    },
    filters: {
      libraryId,
      zone,
      status,
      available,
      seatType
    }
  };
  const data = seats.rows.map(seat => ({
    id: seat.id,
    library: {
      id: seat.library_id,
      name: seat.library_name
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
  }));
  res.json(formatPaginatedResponse(data, meta, req));
});
const unifiedCreateSeat = asyncHandler(async (req, res) => {
  const {
    libraryId,
    seatNumber,
    zone,
    seatType = 'standard',
    status = 'active',
    capacity = 1,
    features = {},
    pricePerHour
  } = req.body;
  if (!libraryId || !seatNumber) {
    throw new AppError('Library ID and seat number are required', 400, ERROR_CODES.VALIDATION.MISSING_REQUIRED_FIELD);
  }
  validateEnum(status, ['active', 'inactive', 'maintenance'], 'Status');
  validateEnum(seatType, ['standard', 'premium', 'vip', 'group', 'study'], 'Seat Type');
  const existingSeat = await query('SELECT id FROM seats WHERE library_id = $1 AND seat_number = $2', [libraryId, seatNumber]);
  if (existingSeat.rows.length > 0) {
    throw new AppError('Seat already exists in this library', 409, ERROR_CODES.CONFLICT.SEAT_ALREADY_EXISTS);
  }
  const result = await query(`
    INSERT INTO seats (library_id, seat_number, zone, seat_type, status, capacity, features, price_per_hour, tenant_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
  `, [libraryId, seatNumber, zone || null, seatType, status, capacity, JSON.stringify(features), pricePerHour || null, req.user.tenantId]);
  const seat = result.rows[0];
  logger.logBusinessEvent('seat_created', {
    seatId: seat.id,
    libraryId,
    seatNumber,
    tenantId: req.user.tenantId
  });
  res.status(201).json(formatSingleResponse({
    id: seat.id,
    libraryId: seat.library_id,
    seatNumber: seat.seat_number,
    zone: seat.zone,
    seatType: seat.seat_type,
    status: seat.status,
    capacity: seat.capacity,
    features: JSON.parse(seat.features),
    pricePerHour: seat.price_per_hour,
    createdAt: seat.created_at
  }));
});
const unifiedUpdateSeat = asyncHandler(async (req, res) => {
  const {
    seatId
  } = req.params;
  const {
    status,
    zone,
    seatType,
    capacity,
    features,
    pricePerHour
  } = req.body;
  const updateFields = [],
    updateValues = [];
  let paramCount = 1;
  if (status !== undefined) {
    validateEnum(status, ['active', 'inactive', 'maintenance'], 'Status');
    updateFields.push(`status = $${paramCount++}`);
    updateValues.push(status);
  }
  if (zone !== undefined) {
    updateFields.push(`zone = $${paramCount++}`);
    updateValues.push(zone);
  }
  if (seatType !== undefined) {
    validateEnum(seatType, ['standard', 'premium', 'vip', 'group', 'study'], 'Seat Type');
    updateFields.push(`seat_type = $${paramCount++}`);
    updateValues.push(seatType);
  }
  if (capacity !== undefined) {
    updateFields.push(`capacity = $${paramCount++}`);
    updateValues.push(capacity);
  }
  if (features !== undefined) {
    updateFields.push(`features = $${paramCount++}`);
    updateValues.push(JSON.stringify(features));
  }
  if (pricePerHour !== undefined) {
    updateFields.push(`price_per_hour = $${paramCount++}`);
    updateValues.push(pricePerHour);
  }
  if (updateFields.length === 0) {
    throw new AppError('No fields to update', 400, ERROR_CODES.VALIDATION.INVALID_INPUT);
  }
  updateFields.push('updated_at = NOW()');
  updateValues.push(seatId, req.user.tenantId);
  const result = await query(`UPDATE seats SET ${updateFields.join(', ')} WHERE id = $${paramCount} AND tenant_id = $${paramCount + 1} RETURNING *`, updateValues);
  if (result.rows.length === 0) {
    throw new AppError('Seat not found', 404, ERROR_CODES.NOT_FOUND.SEAT);
  }
  const seat = result.rows[0];
  logger.logBusinessEvent('seat_updated', {
    seatId: seat.id,
    updatedFields: Object.keys(req.body),
    tenantId: req.user.tenantId
  });
  res.json(formatSingleResponse({
    id: seat.id,
    libraryId: seat.library_id,
    seatNumber: seat.seat_number,
    zone: seat.zone,
    seatType: seat.seat_type,
    status: seat.status,
    capacity: seat.capacity,
    features: JSON.parse(seat.features),
    pricePerHour: seat.price_per_hour,
    updatedAt: seat.updated_at
  }));
});
const unifiedDeleteSeat = asyncHandler(async (req, res) => {
  const {
    seatId
  } = req.params;
  const activeBookings = await query('SELECT COUNT(*) as count FROM bookings WHERE seat_id = $1 AND status IN (\'confirmed\', \'pending\')', [seatId]);
  if (parseInt(activeBookings.rows[0].count) > 0) {
    throw new AppError('Cannot delete seat with active bookings', 400, ERROR_CODES.CONFLICT.HAS_ACTIVE_BOOKINGS);
  }
  const result = await query('UPDATE seats SET status = \'inactive\', updated_at = NOW() WHERE id = $1 AND tenant_id = $2 RETURNING id, seat_number', [seatId, req.user.tenantId]);
  if (result.rows.length === 0) {
    throw new AppError('Seat not found', 404, ERROR_CODES.NOT_FOUND.SEAT);
  }
  const seat = result.rows[0];
  logger.logBusinessEvent('seat_deleted', {
    seatId: seat.id,
    seatNumber: seat.seat_number,
    tenantId: req.user.tenantId
  });
  res.json(formatSingleResponse({
    message: 'Seat deleted successfully',
    seatId: seat.id
  }));
});
module.exports = {
  unifiedGetSeats,
  unifiedCreateSeat,
  unifiedUpdateSeat,
  unifiedDeleteSeat
};