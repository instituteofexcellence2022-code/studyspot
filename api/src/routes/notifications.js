const express = require('express');
const { body, validationResult, query: queryValidator } = require('express-validator');
const { query } = require('../config/database');
const { verifyToken, setTenantContext } = require('../middleware/auth');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');
const notificationService = require('../services/notificationService');

const router = express.Router();

// Apply authentication and tenant context to all routes
router.use(verifyToken);
router.use(setTenantContext);

// Get user's notifications
router.get('/', [
  queryValidator('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  queryValidator('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  queryValidator('type').optional().isString().withMessage('Type must be a string'),
  queryValidator('isRead').optional().isBoolean().withMessage('isRead must be a boolean')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }

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
      data: notification.data ? JSON.parse(notification.data) : null,
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
router.put('/:notificationId/read', asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  const result = await query(`
    UPDATE notifications 
    SET is_read = true, updated_at = NOW()
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
router.put('/mark-all-read', asyncHandler(async (req, res) => {
  const result = await query(`
    UPDATE notifications 
    SET is_read = true, updated_at = NOW()
    WHERE user_id = $1 AND is_read = false
    RETURNING COUNT(*) as updated_count
  `, [req.user.id]);

  const updatedCount = parseInt(result.rows[0].updated_count);

  res.json({
    success: true,
    data: {
      message: `${updatedCount} notifications marked as read`,
      updatedCount: updatedCount
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Delete notification
router.delete('/:notificationId', asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  const result = await query(`
    DELETE FROM notifications 
    WHERE id = $1 AND user_id = $2
    RETURNING id
  `, [notificationId, req.user.id]);

  if (result.rows.length === 0) {
    throw new AppError('Notification not found', 404, 'NOTIFICATION_NOT_FOUND');
  }

  res.json({
    success: true,
    data: {
      message: 'Notification deleted successfully'
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Get notification preferences
router.get('/preferences', asyncHandler(async (req, res) => {
  const userResult = await query(`
    SELECT notification_preferences FROM users WHERE id = $1
  `, [req.user.id]);

  if (userResult.rows.length === 0) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  const preferences = userResult.rows[0].notification_preferences || {
    in_app: true,
    email: true,
    sms: false,
    push: true
  };

  res.json({
    success: true,
    data: {
      preferences: preferences
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Update notification preferences
router.put('/preferences', [
  body('preferences').isObject().withMessage('Preferences must be an object'),
  body('preferences.in_app').optional().isBoolean().withMessage('in_app must be a boolean'),
  body('preferences.email').optional().isBoolean().withMessage('email must be a boolean'),
  body('preferences.sms').optional().isBoolean().withMessage('sms must be a boolean'),
  body('preferences.push').optional().isBoolean().withMessage('push must be a boolean')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }

  const { preferences } = req.body;

  await query(`
    UPDATE users 
    SET notification_preferences = $1, updated_at = NOW()
    WHERE id = $2
  `, [JSON.stringify(preferences), req.user.id]);

  logger.info('Notification preferences updated', {
    userId: req.user.id,
    preferences: preferences
  });

  res.json({
    success: true,
    data: {
      message: 'Notification preferences updated successfully',
      preferences: preferences
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Send test notification
router.post('/test', [
  body('channels').isArray().withMessage('Channels must be an array'),
  body('channels.*').isIn(['in_app', 'email', 'sms']).withMessage('Invalid channel'),
  body('type').optional().isString().withMessage('Type must be a string')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }

  const { channels = ['in_app'], type = 'test' } = req.body;

  const result = await notificationService.sendMultiChannelNotification(req.user.id, {
    title: 'Test Notification',
    message: 'This is a test notification to verify your notification settings.',
    type: type,
    channels: channels
  });

  if (!result.success) {
    throw new AppError('Failed to send test notification', 500, 'TEST_NOTIFICATION_FAILED', {
      details: result.error
    });
  }

  res.json({
    success: true,
    data: {
      message: 'Test notification sent successfully',
      results: result.results
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Get notification statistics
router.get('/stats', asyncHandler(async (req, res) => {
  const statsResult = await query(`
    SELECT 
      COUNT(*) as total_notifications,
      COUNT(CASE WHEN is_read = true THEN 1 END) as read_notifications,
      COUNT(CASE WHEN is_read = false THEN 1 END) as unread_notifications,
      COUNT(CASE WHEN type = 'booking' THEN 1 END) as booking_notifications,
      COUNT(CASE WHEN type = 'payment' THEN 1 END) as payment_notifications,
      COUNT(CASE WHEN type = 'reminder' THEN 1 END) as reminder_notifications
    FROM notifications 
    WHERE user_id = $1
  `, [req.user.id]);

  const stats = statsResult.rows[0];

  res.json({
    success: true,
    data: {
      total: parseInt(stats.total_notifications),
      read: parseInt(stats.read_notifications),
      unread: parseInt(stats.unread_notifications),
      byType: {
        booking: parseInt(stats.booking_notifications),
        payment: parseInt(stats.payment_notifications),
        reminder: parseInt(stats.reminder_notifications)
      }
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

module.exports = router;

