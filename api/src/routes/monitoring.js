const express = require('express');
const { body, validationResult } = require('express-validator');
const { verifyToken, authorize, setTenantContext } = require('../middleware/auth');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');
const monitoringService = require('../services/monitoringService');

const router = express.Router();

// Apply authentication and tenant context to all routes
router.use(verifyToken);
router.use(setTenantContext);

// Get monitoring dashboard (Super Admin only)
router.get('/dashboard', authorize(['super_admin']), asyncHandler(async (req, res) => {
  const dashboardData = monitoringService.getDashboardData();

  res.json({
    success: true,
    data: dashboardData,
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Track custom error (Admin only)
router.post('/track-error', authorize(['super_admin', 'library_staff']), [
  body('message').isString().withMessage('Error message is required'),
  body('type').optional().isString().withMessage('Error type must be a string'),
  body('context').optional().isObject().withMessage('Context must be an object')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }

  const { message, type = 'CustomError', context = {} } = req.body;

  const error = new Error(message);
  error.name = type;

  const errorRecord = await monitoringService.trackError(error, context);

  res.json({
    success: true,
    data: {
      errorId: errorRecord.id,
      message: 'Error tracked successfully'
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Track custom performance metric (Admin only)
router.post('/track-performance', authorize(['super_admin', 'library_staff']), [
  body('operation').isString().withMessage('Operation name is required'),
  body('duration').isFloat({ min: 0 }).withMessage('Duration must be a positive number'),
  body('metadata').optional().isObject().withMessage('Metadata must be an object')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }

  const { operation, duration, metadata = {} } = req.body;

  const perfRecord = await monitoringService.trackPerformance(operation, duration, metadata);

  res.json({
    success: true,
    data: {
      performanceId: perfRecord.id,
      message: 'Performance metric tracked successfully'
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Track system metrics (Admin only)
router.post('/track-system', authorize(['super_admin']), [
  body('memory').optional().isObject().withMessage('Memory data must be an object'),
  body('cpu').optional().isObject().withMessage('CPU data must be an object')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }

  const { memory, cpu } = req.body;

  await monitoringService.trackSystemMetrics({ memory, cpu });

  res.json({
    success: true,
    data: {
      message: 'System metrics tracked successfully'
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Update monitoring thresholds (Super Admin only)
router.put('/thresholds', authorize(['super_admin']), [
  body('thresholds').isObject().withMessage('Thresholds must be an object'),
  body('thresholds.error_rate').optional().isFloat({ min: 0, max: 100 }).withMessage('Error rate must be between 0 and 100'),
  body('thresholds.response_time').optional().isFloat({ min: 0 }).withMessage('Response time must be positive'),
  body('thresholds.memory_usage').optional().isFloat({ min: 0, max: 100 }).withMessage('Memory usage must be between 0 and 100'),
  body('thresholds.cpu_usage').optional().isFloat({ min: 0, max: 100 }).withMessage('CPU usage must be between 0 and 100')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }

  const { thresholds } = req.body;

  monitoringService.updateThresholds(thresholds);

  res.json({
    success: true,
    data: {
      message: 'Monitoring thresholds updated successfully',
      thresholds: thresholds
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Clear monitoring data (Super Admin only)
router.delete('/clear-data', authorize(['super_admin']), asyncHandler(async (req, res) => {
  monitoringService.clearOldData();

  res.json({
    success: true,
    data: {
      message: 'Old monitoring data cleared successfully'
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Get monitoring configuration
router.get('/config', authorize(['super_admin', 'library_staff']), asyncHandler(async (req, res) => {
  const dashboardData = monitoringService.getDashboardData();

  res.json({
    success: true,
    data: {
      thresholds: dashboardData.thresholds,
      status: dashboardData.status,
      isMonitoringEnabled: true
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Health check endpoint for monitoring
router.get('/health', asyncHandler(async (req, res) => {
  const dashboardData = monitoringService.getDashboardData();
  const isHealthy = Object.values(dashboardData.status).every(status => status === 'healthy');

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    data: {
      status: isHealthy ? 'healthy' : 'degraded',
      metrics: dashboardData.metrics,
      timestamp: new Date().toISOString()
    }
  });
}));

module.exports = router;

