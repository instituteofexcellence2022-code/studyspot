const express = require('express');
const { query: queryValidator, validationResult } = require('express-validator');
const { verifyToken, authorize, setTenantContext } = require('../middleware/auth');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');
const analyticsService = require('../services/analyticsService');

const router = express.Router();

// Apply authentication and tenant context to all routes
router.use(verifyToken);
router.use(setTenantContext);

// Track analytics event
router.post('/track', [
  queryValidator('eventType').isString().withMessage('Event type is required'),
  queryValidator('eventData').optional().isObject().withMessage('Event data must be an object')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }

  const { eventType, eventData = {}, metadata = {} } = req.body;

  const result = await analyticsService.trackEvent(
    req.user.id,
    eventType,
    eventData,
    metadata
  );

  if (!result.success) {
    throw new AppError('Failed to track event', 500, 'TRACKING_FAILED', {
      details: result.error
    });
  }

  res.json({
    success: true,
    data: {
      message: 'Event tracked successfully'
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Get dashboard summary (Admin only)
router.get('/dashboard', authorize(['super_admin', 'library_staff']), asyncHandler(async (req, res) => {
  const result = await analyticsService.getDashboardSummary();

  if (!result.success) {
    throw new AppError('Failed to get dashboard summary', 500, 'ANALYTICS_FAILED', {
      details: result.error
    });
  }

  res.json({
    success: true,
    data: result.data,
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Get booking analytics (Admin only)
router.get('/bookings', authorize(['super_admin', 'library_staff']), [
  queryValidator('dateFrom').optional().isISO8601().withMessage('Invalid date format'),
  queryValidator('dateTo').optional().isISO8601().withMessage('Invalid date format'),
  queryValidator('groupBy').optional().isIn(['hour', 'day', 'week', 'month']).withMessage('Invalid groupBy value')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }

  const { dateFrom, dateTo, groupBy = 'day' } = req.query;

  const result = await analyticsService.getBookingAnalytics(dateFrom, dateTo, groupBy);

  if (!result.success) {
    throw new AppError('Failed to get booking analytics', 500, 'ANALYTICS_FAILED', {
      details: result.error
    });
  }

  res.json({
    success: true,
    data: result.data,
    meta: {
      dateFrom: dateFrom,
      dateTo: dateTo,
      groupBy: groupBy,
      timestamp: new Date().toISOString()
    }
  });
}));

// Get payment analytics (Admin only)
router.get('/payments', authorize(['super_admin', 'library_staff']), [
  queryValidator('dateFrom').optional().isISO8601().withMessage('Invalid date format'),
  queryValidator('dateTo').optional().isISO8601().withMessage('Invalid date format'),
  queryValidator('groupBy').optional().isIn(['hour', 'day', 'week', 'month']).withMessage('Invalid groupBy value')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }

  const { dateFrom, dateTo, groupBy = 'day' } = req.query;

  const result = await analyticsService.getPaymentAnalytics(dateFrom, dateTo, groupBy);

  if (!result.success) {
    throw new AppError('Failed to get payment analytics', 500, 'ANALYTICS_FAILED', {
      details: result.error
    });
  }

  res.json({
    success: true,
    data: result.data,
    meta: {
      dateFrom: dateFrom,
      dateTo: dateTo,
      groupBy: groupBy,
      timestamp: new Date().toISOString()
    }
  });
}));

// Get user analytics (Super Admin only)
router.get('/users', authorize(['super_admin']), [
  queryValidator('dateFrom').optional().isISO8601().withMessage('Invalid date format'),
  queryValidator('dateTo').optional().isISO8601().withMessage('Invalid date format')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }

  const { dateFrom, dateTo } = req.query;

  const result = await analyticsService.getUserAnalytics(dateFrom, dateTo);

  if (!result.success) {
    throw new AppError('Failed to get user analytics', 500, 'ANALYTICS_FAILED', {
      details: result.error
    });
  }

  res.json({
    success: true,
    data: result.data,
    meta: {
      dateFrom: dateFrom,
      dateTo: dateTo,
      timestamp: new Date().toISOString()
    }
  });
}));

// Get library analytics (Admin only)
router.get('/libraries', authorize(['super_admin', 'library_staff']), [
  queryValidator('dateFrom').optional().isISO8601().withMessage('Invalid date format'),
  queryValidator('dateTo').optional().isISO8601().withMessage('Invalid date format')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }

  const { dateFrom, dateTo } = req.query;

  const result = await analyticsService.getLibraryAnalytics(dateFrom, dateTo);

  if (!result.success) {
    throw new AppError('Failed to get library analytics', 500, 'ANALYTICS_FAILED', {
      details: result.error
    });
  }

  res.json({
    success: true,
    data: result.data,
    meta: {
      dateFrom: dateFrom,
      dateTo: dateTo,
      timestamp: new Date().toISOString()
    }
  });
}));

// Get real-time metrics (Admin only)
router.get('/realtime', authorize(['super_admin', 'library_staff']), asyncHandler(async (req, res) => {
  const result = analyticsService.getRealTimeMetrics();

  res.json({
    success: true,
    data: result.data,
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Get user's personal analytics
router.get('/personal', asyncHandler(async (req, res) => {
  const { query } = require('../config/database');

  try {
    // Get user's booking statistics
    const bookingStats = await query(`
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
        AVG(total_amount) as avg_booking_amount,
        SUM(total_amount) as total_spent
      FROM bookings
      WHERE user_id = $1
    `, [req.user.id]);

    // Get user's payment statistics
    const paymentStats = await query(`
      SELECT 
        COUNT(*) as total_payments,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_payments,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_payments,
        AVG(amount) as avg_payment_amount,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_spent
      FROM payments
      WHERE user_id = $1
    `, [req.user.id]);

    // Get user's favorite libraries
    const favoriteLibraries = await query(`
      SELECT 
        l.id,
        l.name,
        l.address,
        COUNT(b.id) as booking_count,
        AVG(b.total_amount) as avg_amount
      FROM libraries l
      JOIN bookings b ON l.id = b.library_id
      WHERE b.user_id = $1 AND b.status = 'confirmed'
      GROUP BY l.id, l.name, l.address
      ORDER BY booking_count DESC
      LIMIT 5
    `, [req.user.id]);

    // Get user's booking patterns
    const bookingPatterns = await query(`
      SELECT 
        EXTRACT(HOUR FROM start_time) as hour,
        EXTRACT(DOW FROM booking_date) as day_of_week,
        COUNT(*) as booking_count
      FROM bookings
      WHERE user_id = $1 AND status = 'confirmed'
      GROUP BY EXTRACT(HOUR FROM start_time), EXTRACT(DOW FROM booking_date)
      ORDER BY booking_count DESC
      LIMIT 10
    `, [req.user.id]);

    const bookingData = bookingStats.rows[0];
    const paymentData = paymentStats.rows[0];

    res.json({
      success: true,
      data: {
        bookingStats: {
          totalBookings: parseInt(bookingData.total_bookings),
          confirmedBookings: parseInt(bookingData.confirmed_bookings),
          cancelledBookings: parseInt(bookingData.cancelled_bookings),
          completedBookings: parseInt(bookingData.completed_bookings),
          avgBookingAmount: parseFloat(bookingData.avg_booking_amount) || 0,
          totalSpent: parseFloat(bookingData.total_spent) || 0
        },
        paymentStats: {
          totalPayments: parseInt(paymentData.total_payments),
          successfulPayments: parseInt(paymentData.successful_payments),
          failedPayments: parseInt(paymentData.failed_payments),
          avgPaymentAmount: parseFloat(paymentData.avg_payment_amount) || 0,
          totalSpent: parseFloat(paymentData.total_spent) || 0
        },
        favoriteLibraries: favoriteLibraries.rows.map(lib => ({
          id: lib.id,
          name: lib.name,
          address: lib.address,
          bookingCount: parseInt(lib.booking_count),
          avgAmount: parseFloat(lib.avg_amount) || 0
        })),
        bookingPatterns: bookingPatterns.rows.map(pattern => ({
          hour: parseInt(pattern.hour),
          dayOfWeek: parseInt(pattern.day_of_week),
          bookingCount: parseInt(pattern.booking_count)
        }))
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Failed to get personal analytics', error);
    throw new AppError('Failed to get personal analytics', 500, 'ANALYTICS_FAILED', {
      details: error.message
    });
  }
}));

// Get predictive trends (ML-powered)
router.get('/predictive-trends', authorize(['super_admin', 'library_staff']), [
  queryValidator('dateFrom').optional().isISO8601().withMessage('Invalid date format'),
  queryValidator('dateTo').optional().isISO8601().withMessage('Invalid date format')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }

  const { dateFrom, dateTo } = req.query;

  const result = await analyticsService.getPredictiveTrends(dateFrom, dateTo);

  if (!result.success) {
    throw new AppError('Failed to get predictive trends', 500, 'PREDICTION_FAILED', {
      details: result.error
    });
  }

  res.json({
    success: true,
    data: result.data,
    meta: {
      dateFrom: dateFrom,
      dateTo: dateTo,
      mlPowered: true,
      timestamp: new Date().toISOString()
    }
  });
}));

// Detect anomalies (ML-powered)
router.get('/anomaly-detection', authorize(['super_admin', 'library_staff']), [
  queryValidator('dateFrom').optional().isISO8601().withMessage('Invalid date format'),
  queryValidator('dateTo').optional().isISO8601().withMessage('Invalid date format')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }

  const { dateFrom, dateTo } = req.query;

  const result = await analyticsService.detectAnomalies(dateFrom, dateTo);

  if (!result.success) {
    throw new AppError('Failed to detect anomalies', 500, 'ANOMALY_DETECTION_FAILED', {
      details: result.error
    });
  }

  res.json({
    success: true,
    data: result.data,
    meta: {
      dateFrom: dateFrom,
      dateTo: dateTo,
      mlPowered: true,
      timestamp: new Date().toISOString()
    }
  });
}));

// Get cohort analysis
router.get('/cohort-analysis', authorize(['super_admin']), [
  queryValidator('cohortType').optional().isIn(['daily', 'weekly', 'monthly']).withMessage('Invalid cohort type')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }

  const { cohortType = 'monthly' } = req.query;

  const result = await analyticsService.getCohortAnalysis(cohortType);

  if (!result.success) {
    throw new AppError('Failed to get cohort analysis', 500, 'COHORT_ANALYSIS_FAILED', {
      details: result.error
    });
  }

  res.json({
    success: true,
    data: result.data,
    meta: {
      cohortType: cohortType,
      timestamp: new Date().toISOString()
    }
  });
}));

module.exports = router;

