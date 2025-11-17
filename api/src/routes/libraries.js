const express = require('express');
const { body, query: queryValidator, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { verifyToken, authorize, optionalAuth, setTenantContext } = require('../middleware/auth');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

const router = express.Router();

// Apply tenant context to all routes
router.use(setTenantContext);

// Get all libraries (public endpoint with optional auth)
router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    search,
    city,
    amenities,
    priceRange,
    sortBy = 'created_at',
    sortOrder = 'desc',
    latitude,
    longitude,
    radius = 10
  } = req.query;

  const offset = (page - 1) * limit;

  let whereClause = 'WHERE l.status = $1';
  const queryParams = ['active'];
  let paramCount = 1;

  // Add tenant filter if user is authenticated
  if (req.user) {
    whereClause += ` AND l.tenant_id = $${++paramCount}`;
    queryParams.push(req.user.tenantId);
  }

  if (search) {
    whereClause += ` AND (l.name ILIKE $${++paramCount} OR l.description ILIKE $${++paramCount} OR l.address ILIKE $${++paramCount})`;
    const searchPattern = `%${search}%`;
    queryParams.push(searchPattern, searchPattern, searchPattern);
  }

  if (city) {
    whereClause += ` AND l.city ILIKE $${++paramCount}`;
    queryParams.push(`%${city}%`);
  }

  if (amenities) {
    const amenityList = amenities.split(',').map(a => a.trim());
    whereClause += ` AND l.amenities ?| $${++paramCount}`;
    queryParams.push(amenityList);
  }

  if (priceRange) {
    const [minPrice, maxPrice] = priceRange.split('-').map(p => parseFloat(p.trim()));
    if (minPrice !== undefined) {
      whereClause += ` AND (l.pricing->>'hourly')::numeric >= $${++paramCount}`;
      queryParams.push(minPrice);
    }
    if (maxPrice !== undefined) {
      whereClause += ` AND (l.pricing->>'hourly')::numeric <= $${++paramCount}`;
      queryParams.push(maxPrice);
    }
  }

  // Distance-based filtering
  let distanceClause = '';
  if (latitude && longitude) {
    distanceClause = `, earth_distance(ll_to_earth(l.latitude, l.longitude), ll_to_earth($${++paramCount}, $${++paramCount})) as distance`;
    queryParams.push(parseFloat(latitude), parseFloat(longitude));
    
    if (radius) {
      whereClause += ` AND earth_distance(ll_to_earth(l.latitude, l.longitude), ll_to_earth($${paramCount - 1}, $${paramCount})) <= $${++paramCount}`;
      queryParams.push(radius * 1000); // Convert km to meters
    }
  }

  // Sorting
  const validSortFields = ['name', 'rating', 'created_at', 'price'];
  const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
  const order = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
  
  let orderClause = `ORDER BY l.${sortField} ${order}`;
  if (latitude && longitude && sortBy === 'distance') {
    orderClause = 'ORDER BY distance ASC';
  }

  const librariesQuery = `
    SELECT 
      l.id, l.name, l.description, l.address, l.city, l.state, l.country,
      l.latitude, l.longitude, l.capacity, l.amenities, l.pricing,
      l.operating_hours, l.images, l.contact_info, l.rating, l.review_count,
      l.created_at, l.updated_at
      ${distanceClause}
    FROM libraries l
    ${whereClause}
    ${orderClause}
    LIMIT $${++paramCount} OFFSET $${++paramCount}
  `;

  queryParams.push(limit, offset);

  const libraries = await query(librariesQuery, queryParams);

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM libraries l
    ${whereClause}
  `;
  const countResult = await query(countQuery, queryParams.slice(0, -2));
  const total = parseInt(countResult.rows[0].total);

  res.json({
    success: true,
    data: libraries.rows.map(library => ({
      id: library.id,
      name: library.name,
      description: library.description,
      address: library.address,
      city: library.city,
      state: library.state,
      country: library.country,
      location: {
        latitude: library.latitude,
        longitude: library.longitude
      },
      capacity: library.capacity,
      amenities: library.amenities,
      pricing: library.pricing,
      operatingHours: library.operating_hours,
      images: library.images,
      contactInfo: library.contact_info,
      rating: library.rating,
      reviewCount: library.review_count,
      ...(library.distance && { distance: Math.round(library.distance / 1000 * 100) / 100 }), // Convert to km
      createdAt: library.created_at,
      updatedAt: library.updated_at
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

// Get specific library
router.get('/:libraryId', optionalAuth, asyncHandler(async (req, res) => {
  const { libraryId } = req.params;

  let whereClause = 'WHERE l.id = $1 AND l.status = $2';
  const queryParams = [libraryId, 'active'];

  // Add tenant filter if user is authenticated
  if (req.user) {
    whereClause += ' AND l.tenant_id = $3';
    queryParams.push(req.user.tenantId);
  }

  const libraryResult = await query(`
    SELECT 
      l.id, l.name, l.description, l.address, l.city, l.state, l.country,
      l.latitude, l.longitude, l.capacity, l.amenities, l.pricing,
      l.operating_hours, l.images, l.contact_info, l.rating, l.review_count,
      l.created_at, l.updated_at
    FROM libraries l
    ${whereClause}
  `, queryParams);

  if (libraryResult.rows.length === 0) {
    throw new AppError('Library not found', 404, 'LIBRARY_NOT_FOUND');
  }

  const library = libraryResult.rows[0];

  // Get available seats count for today
  const seatsResult = await query(`
    SELECT 
      COUNT(*) as total_seats,
      COUNT(CASE WHEN is_available = true THEN 1 END) as available_seats
    FROM seats s
    WHERE s.library_id = $1 AND s.is_active = true
  `, [libraryId]);

  const seatStats = seatsResult.rows[0];

  res.json({
    success: true,
    data: {
      id: library.id,
      name: library.name,
      description: library.description,
      address: library.address,
      city: library.city,
      state: library.state,
      country: library.country,
      location: {
        latitude: library.latitude,
        longitude: library.longitude
      },
      capacity: library.capacity,
      amenities: library.amenities,
      pricing: library.pricing,
      operatingHours: library.operating_hours,
      images: library.images,
      contactInfo: library.contact_info,
      rating: library.rating,
      reviewCount: library.review_count,
      seatStats: {
        total: parseInt(seatStats.total_seats),
        available: parseInt(seatStats.available_seats)
      },
      createdAt: library.created_at,
      updatedAt: library.updated_at
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Get library seats
router.get('/:libraryId/seats', optionalAuth, asyncHandler(async (req, res) => {
  const { libraryId } = req.params;
  const { date, zone, isAvailable } = req.query;

  let whereClause = 'WHERE s.library_id = $1 AND s.is_active = true';
  const queryParams = [libraryId];
  let paramCount = 1;

  if (zone) {
    whereClause += ` AND s.zone = $${++paramCount}`;
    queryParams.push(zone);
  }

  if (isAvailable !== undefined) {
    whereClause += ` AND s.is_available = $${++paramCount}`;
    queryParams.push(isAvailable === 'true');
  }

  // Check if seats are booked for specific date
  if (date) {
    whereClause += `
      AND s.id NOT IN (
        SELECT seat_id FROM bookings 
        WHERE library_id = $${++paramCount} 
        AND booking_date = $${++paramCount} 
        AND status IN ('confirmed', 'completed')
      )
    `;
    queryParams.push(libraryId, date);
  }

  const seatsResult = await query(`
    SELECT 
      s.id, s.seat_number, s.zone, s.seat_type, s.amenities, s.location, s.is_available
    FROM seats s
    ${whereClause}
    ORDER BY s.zone, s.seat_number
  `, queryParams);

  res.json({
    success: true,
    data: seatsResult.rows.map(seat => ({
      id: seat.id,
      seatNumber: seat.seat_number,
      zone: seat.zone,
      seatType: seat.seat_type,
      amenities: seat.amenities,
      location: seat.location,
      isAvailable: seat.is_available
    })),
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Create library (admin only)
router.post('/', [
  verifyToken,
  authorize('super_admin', 'branch_manager'),
  body('name').trim().isLength({ min: 1 }).withMessage('Library name is required'),
  body('description').optional().trim(),
  body('address').trim().isLength({ min: 1 }).withMessage('Address is required'),
  body('city').trim().isLength({ min: 1 }).withMessage('City is required'),
  body('state').trim().isLength({ min: 1 }).withMessage('State is required'),
  body('country').optional().trim().default('India'),
  body('postalCode').optional().trim(),
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
  body('amenities').optional().isArray().withMessage('Amenities must be an array'),
  body('pricing').optional().isObject().withMessage('Pricing must be an object'),
  body('operatingHours').optional().isObject().withMessage('Operating hours must be an object'),
  body('contactInfo').optional().isObject().withMessage('Contact info must be an object')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }

  const {
    name, description, address, city, state, country, postalCode,
    latitude, longitude, capacity, amenities, pricing, operatingHours, contactInfo
  } = req.body;

  const libraryResult = await query(`
    INSERT INTO libraries (
      tenant_id, name, description, address, city, state, country, postal_code,
      latitude, longitude, capacity, amenities, pricing, operating_hours, contact_info
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    RETURNING id, name, description, address, city, state, country, capacity, 
              amenities, pricing, operating_hours, contact_info, created_at
  `, [
    req.user.tenantId, name, description, address, city, state, country, postalCode,
    latitude, longitude, capacity, JSON.stringify(amenities || []), 
    JSON.stringify(pricing || {}), JSON.stringify(operatingHours || {}), 
    JSON.stringify(contactInfo || {})
  ]);

  const library = libraryResult.rows[0];

  // Log library creation
  logger.logBusinessEvent('library_created', {
    libraryId: library.id,
    name: library.name,
    createdBy: req.user.id
  });

  res.status(201).json({
    success: true,
    data: {
      id: library.id,
      name: library.name,
      description: library.description,
      address: library.address,
      city: library.city,
      state: library.state,
      country: library.country,
      capacity: library.capacity,
      amenities: library.amenities,
      pricing: library.pricing,
      operatingHours: library.operating_hours,
      contactInfo: library.contact_info,
      createdAt: library.created_at
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Update library (admin only)
router.put('/:libraryId', [
  verifyToken,
  authorize('super_admin', 'branch_manager'),
  body('name').optional().trim().isLength({ min: 1 }).withMessage('Library name cannot be empty'),
  body('description').optional().trim(),
  body('address').optional().trim().isLength({ min: 1 }).withMessage('Address cannot be empty'),
  body('city').optional().trim().isLength({ min: 1 }).withMessage('City cannot be empty'),
  body('state').optional().trim().isLength({ min: 1 }).withMessage('State cannot be empty'),
  body('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
  body('amenities').optional().isArray().withMessage('Amenities must be an array'),
  body('pricing').optional().isObject().withMessage('Pricing must be an object'),
  body('operatingHours').optional().isObject().withMessage('Operating hours must be an object'),
  body('contactInfo').optional().isObject().withMessage('Contact info must be an object')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }

  const { libraryId } = req.params;
  const updateFields = [];
  const updateValues = [];
  let paramCount = 1;

  // Build dynamic update query
  const allowedFields = [
    'name', 'description', 'address', 'city', 'state', 'country', 'postal_code',
    'latitude', 'longitude', 'capacity', 'amenities', 'pricing', 'operating_hours', 'contact_info'
  ];

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updateFields.push(`${field} = $${++paramCount}`);
      if (['amenities', 'pricing', 'operating_hours', 'contact_info'].includes(field)) {
        updateValues.push(JSON.stringify(req.body[field]));
      } else {
        updateValues.push(req.body[field]);
      }
    }
  });

  if (updateFields.length === 0) {
    throw new AppError('No fields to update', 400, 'NO_FIELDS_TO_UPDATE');
  }

  updateFields.push('updated_at = NOW()');
  updateValues.push(libraryId);

  // Add tenant filter for non-super-admin users
  let whereClause = 'WHERE id = $' + (paramCount + 1);
  if (req.user.role !== 'super_admin') {
    whereClause += ' AND tenant_id = $' + (paramCount + 2);
    updateValues.push(req.user.tenantId);
  }

  const updateQuery = `
    UPDATE libraries 
    SET ${updateFields.join(', ')}
    ${whereClause}
    RETURNING id, name, description, address, city, state, country, capacity,
              amenities, pricing, operating_hours, contact_info, updated_at
  `;

  const result = await query(updateQuery, updateValues);

  if (result.rows.length === 0) {
    throw new AppError('Library not found', 404, 'LIBRARY_NOT_FOUND');
  }

  const library = result.rows[0];

  // Log library update
  logger.logBusinessEvent('library_updated', {
    libraryId: library.id,
    name: library.name,
    updatedBy: req.user.id,
    updatedFields: Object.keys(req.body)
  });

  res.json({
    success: true,
    data: {
      id: library.id,
      name: library.name,
      description: library.description,
      address: library.address,
      city: library.city,
      state: library.state,
      country: library.country,
      capacity: library.capacity,
      amenities: library.amenities,
      pricing: library.pricing,
      operatingHours: library.operating_hours,
      contactInfo: library.contact_info,
      updatedAt: library.updated_at
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Delete library (admin only)
router.delete('/:libraryId', [
  verifyToken,
  authorize('super_admin', 'branch_manager')
], asyncHandler(async (req, res) => {
  const { libraryId } = req.params;

  let whereClause = 'WHERE id = $1';
  const queryParams = [libraryId];

  // Add tenant filter for non-super-admin users
  if (req.user.role !== 'super_admin') {
    whereClause += ' AND tenant_id = $2';
    queryParams.push(req.user.tenantId);
  }

  const result = await query(`
    UPDATE libraries 
    SET status = 'inactive', updated_at = NOW()
    ${whereClause}
    RETURNING id, name
  `, queryParams);

  if (result.rows.length === 0) {
    throw new AppError('Library not found', 404, 'LIBRARY_NOT_FOUND');
  }

  const library = result.rows[0];

  // Log library deletion
  logger.logBusinessEvent('library_deleted', {
    libraryId: library.id,
    name: library.name,
    deletedBy: req.user.id
  });

  res.json({
    success: true,
    data: {
      message: 'Library deleted successfully',
      libraryId: library.id
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Get available seats for a library
router.get('/:id/seats/available', verifyToken, setTenantContext, asyncHandler(async (req, res) => {
  const { id: libraryId } = req.params;
  const { date, startTime, endTime, zone } = req.query;

  if (!date || !startTime || !endTime) {
    throw new AppError('Date, startTime, and endTime are required', 400, 'VALIDATION_ERROR');
  }

  // Check if library exists
  const libraryResult = await query(`
    SELECT id, name, status FROM libraries 
    WHERE id = $1 AND status = 'active' AND tenant_id = $2
  `, [libraryId, req.user.tenantId]);

  if (libraryResult.rows.length === 0) {
    throw new AppError('Library not found', 404, 'LIBRARY_NOT_FOUND');
  }

  // Build query to get available seats
  let whereClause = `
    WHERE s.library_id = $1 
    AND s.is_active = true 
    AND s.is_available = true
  `;
  const queryParams = [libraryId];
  let paramCount = 1;

  if (zone) {
    paramCount++;
    whereClause += ` AND s.zone = $${paramCount}`;
    queryParams.push(zone);
  }

  // Exclude seats with conflicting bookings
  paramCount++;
  whereClause += `
    AND NOT EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.seat_id = s.id
      AND b.booking_date = $${paramCount}
      AND b.status IN ('confirmed', 'pending')
      AND (
        (b.start_time <= $${paramCount + 1} AND b.end_time > $${paramCount + 1}) OR
        (b.start_time < $${paramCount + 2} AND b.end_time >= $${paramCount + 2}) OR
        (b.start_time >= $${paramCount + 1} AND b.end_time <= $${paramCount + 2})
      )
    )
  `;
  queryParams.push(date, startTime, endTime);

  const seatsResult = await query(`
    SELECT 
      s.id,
      s.seat_number,
      s.zone,
      s.seat_type,
      s.features
    FROM seats s
    ${whereClause}
    ORDER BY s.zone, s.seat_number
  `, queryParams);

  res.json({
    success: true,
    data: {
      seats: seatsResult.rows.map(seat => ({
        id: seat.id,
        seatNumber: seat.seat_number,
        zone: seat.zone,
        seatType: seat.seat_type,
        features: seat.features,
        isAvailable: true
      })),
      totalAvailable: seatsResult.rows.length
    },
    meta: {
      libraryId,
      date,
      startTime,
      endTime,
      zone: zone || 'all',
      timestamp: new Date().toISOString()
    }
  });
}));

module.exports = router;







































