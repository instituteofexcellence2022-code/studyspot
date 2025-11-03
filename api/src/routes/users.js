const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { verifyToken, authorize, authorizeResource, setTenantContext } = require('../middleware/auth');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

const router = express.Router();

// Apply authentication and tenant context to all routes
router.use(verifyToken);
router.use(setTenantContext);

// Get current user profile
router.get('/profile', asyncHandler(async (req, res) => {
  const userResult = await query(`
    SELECT 
      id, email, first_name, last_name, phone, role, status, 
      profile_image_url, kyc_status, last_login, created_at, updated_at
    FROM users 
    WHERE id = $1
  `, [req.user.id]);

  if (userResult.rows.length === 0) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  const user = userResult.rows[0];

  res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      role: user.role,
      status: user.status,
      profileImageUrl: user.profile_image_url,
      kycStatus: user.kyc_status,
      lastLogin: user.last_login,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Update user profile
router.put('/profile', [
  body('firstName').optional().trim().isLength({ min: 1 }).withMessage('First name cannot be empty'),
  body('lastName').optional().trim().isLength({ min: 1 }).withMessage('Last name cannot be empty'),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }

  const { firstName, lastName, phone } = req.body;
  const updateFields = [];
  const updateValues = [];
  let paramCount = 1;

  if (firstName !== undefined) {
    updateFields.push(`first_name = $${paramCount++}`);
    updateValues.push(firstName);
  }

  if (lastName !== undefined) {
    updateFields.push(`last_name = $${paramCount++}`);
    updateValues.push(lastName);
  }

  if (phone !== undefined) {
    updateFields.push(`phone = $${paramCount++}`);
    updateValues.push(phone);
  }

  if (updateFields.length === 0) {
    throw new AppError('No fields to update', 400, 'NO_FIELDS_TO_UPDATE');
  }

  updateFields.push(`updated_at = NOW()`);
  updateValues.push(req.user.id);

  const updateQuery = `
    UPDATE users 
    SET ${updateFields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING id, email, first_name, last_name, phone, role, status, updated_at
  `;

  const result = await query(updateQuery, updateValues);

  if (result.rows.length === 0) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  const user = result.rows[0];

  // Log profile update
  logger.logBusinessEvent('profile_updated', {
    userId: user.id,
    updatedFields: Object.keys(req.body)
  });

  res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      role: user.role,
      status: user.status,
      updatedAt: user.updated_at
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Get user's bookings
router.get('/bookings', asyncHandler(async (req, res) => {
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

// Get user's notifications
router.get('/notifications', asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, type, isRead } = req.query;
  const offset = (page - 1) * limit;

  let whereClause = 'WHERE user_id = $1';
  const queryParams = [req.user.id];
  let paramCount = 1;

  if (type) {
    whereClause += ` AND type = $${++paramCount}`;
    queryParams.push(type);
  }

  if (isRead !== undefined) {
    whereClause += ` AND is_read = $${++paramCount}`;
    queryParams.push(isRead === 'true');
  }

  const notificationsQuery = `
    SELECT id, title, message, type, is_read, data, created_at
    FROM notifications
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${++paramCount} OFFSET $${++paramCount}
  `;

  queryParams.push(limit, offset);

  const notifications = await query(notificationsQuery, queryParams);

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM notifications
    ${whereClause}
  `;
  const countResult = await query(countQuery, queryParams.slice(0, -2));
  const total = parseInt(countResult.rows[0].total);

  res.json({
    success: true,
    data: notifications.rows.map(notification => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isRead: notification.is_read,
      data: notification.data,
      createdAt: notification.created_at
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

// Mark notification as read
router.put('/notifications/:notificationId/read', asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  const result = await query(`
    UPDATE notifications 
    SET is_read = true 
    WHERE id = $1 AND user_id = $2
    RETURNING id, title, message, type, is_read, created_at
  `, [notificationId, req.user.id]);

  if (result.rows.length === 0) {
    throw new AppError('Notification not found', 404, 'NOTIFICATION_NOT_FOUND');
  }

  const notification = result.rows[0];

  res.json({
    success: true,
    data: {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isRead: notification.is_read,
      createdAt: notification.created_at
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Mark all notifications as read
router.put('/notifications/read-all', asyncHandler(async (req, res) => {
  const result = await query(`
    UPDATE notifications 
    SET is_read = true 
    WHERE user_id = $1 AND is_read = false
    RETURNING COUNT(*) as updated_count
  `, [req.user.id]);

  const updatedCount = parseInt(result.rows[0].updated_count);

  res.json({
    success: true,
    data: {
      message: `Marked ${updatedCount} notifications as read`,
      updatedCount
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Admin routes - Get all users (admin only)
router.get('/', authorize('super_admin', 'branch_manager'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, role, status } = req.query;
  const offset = (page - 1) * limit;

  let whereClause = 'WHERE 1=1';
  const queryParams = [];
  let paramCount = 0;

  // Add tenant filter for non-super-admin users
  if (req.user.role !== 'super_admin') {
    whereClause += ` AND tenant_id = $${++paramCount}`;
    queryParams.push(req.user.tenantId);
  }

  if (search) {
    whereClause += ` AND (email ILIKE $${++paramCount} OR first_name ILIKE $${++paramCount} OR last_name ILIKE $${++paramCount})`;
    const searchPattern = `%${search}%`;
    queryParams.push(searchPattern, searchPattern, searchPattern);
  }

  if (role) {
    whereClause += ` AND role = $${++paramCount}`;
    queryParams.push(role);
  }

  if (status) {
    whereClause += ` AND status = $${++paramCount}`;
    queryParams.push(status);
  }

  const usersQuery = `
    SELECT 
      id, email, first_name, last_name, phone, role, status, 
      kyc_status, last_login, created_at, updated_at
    FROM users
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${++paramCount} OFFSET $${++paramCount}
  `;

  queryParams.push(limit, offset);

  const users = await query(usersQuery, queryParams);

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM users
    ${whereClause}
  `;
  const countResult = await query(countQuery, queryParams.slice(0, -2));
  const total = parseInt(countResult.rows[0].total);

  res.json({
    success: true,
    data: users.rows.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      role: user.role,
      status: user.status,
      kycStatus: user.kyc_status,
      lastLogin: user.last_login,
      createdAt: user.created_at,
      updatedAt: user.updated_at
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

// Admin routes - Get specific user (admin only)
router.get('/:userId', authorize('super_admin', 'branch_manager'), asyncHandler(async (req, res) => {
  const { userId } = req.params;

  let whereClause = 'WHERE id = $1';
  const queryParams = [userId];

  // Add tenant filter for non-super-admin users
  if (req.user.role !== 'super_admin') {
    whereClause += ' AND tenant_id = $2';
    queryParams.push(req.user.tenantId);
  }

  const userResult = await query(`
    SELECT 
      id, email, first_name, last_name, phone, role, status, 
      profile_image_url, kyc_status, last_login, created_at, updated_at
    FROM users
    ${whereClause}
  `, queryParams);

  if (userResult.rows.length === 0) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  const user = userResult.rows[0];

  res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      role: user.role,
      status: user.status,
      profileImageUrl: user.profile_image_url,
      kycStatus: user.kyc_status,
      lastLogin: user.last_login,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

module.exports = router;







































