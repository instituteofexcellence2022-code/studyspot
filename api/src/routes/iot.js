const express = require('express');
const { body, query: queryValidator, validationResult } = require('express-validator');
const { verifyToken, authorize, setTenantContext } = require('../middleware/auth');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');
const iotService = require('../services/iotService');

const router = express.Router();

// Apply authentication and tenant context to all routes
router.use(verifyToken);
router.use(setTenantContext);

// Register new IoT device (Library staff and admins only)
router.post('/devices', authorize(['super_admin', 'library_staff']), [
  body('libraryId').isUUID().withMessage('Valid library ID required'),
  body('deviceName').trim().isLength({ min: 1 }).withMessage('Device name is required'),
  body('deviceType').isIn(['light', 'ac', 'sensor', 'lock', 'camera', 'other']).withMessage('Invalid device type'),
  body('deviceId').trim().isLength({ min: 1 }).withMessage('Device ID is required'),
  body('location').optional().isString().withMessage('Location must be a string'),
  body('configuration').optional().isObject().withMessage('Configuration must be an object')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }

  const { libraryId, ...deviceData } = req.body;

  const result = await iotService.registerDevice(libraryId, deviceData);

  if (!result.success) {
    throw new AppError('Failed to register device', 500, 'DEVICE_REGISTRATION_FAILED', {
      details: result.error
    });
  }

  res.status(201).json({
    success: true,
    data: result.data,
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Get all devices for a library
router.get('/libraries/:libraryId/devices', authorize(['super_admin', 'library_staff']), [
  queryValidator('deviceType').optional().isString().withMessage('Device type must be a string'),
  queryValidator('status').optional().isIn(['active', 'inactive', 'maintenance']).withMessage('Invalid status')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }

  const { libraryId } = req.params;
  const { deviceType, status } = req.query;

  const result = await iotService.getLibraryDevices(libraryId, { deviceType, status });

  if (!result.success) {
    throw new AppError('Failed to get devices', 500, 'DEVICES_FETCH_FAILED', {
      details: result.error
    });
  }

  res.json({
    success: true,
    data: result.data,
    meta: {
      count: result.data.length,
      timestamp: new Date().toISOString()
    }
  });
}));

// Update device status (typically called by device itself)
router.put('/devices/:deviceId/status', [
  body('isOnline').isBoolean().withMessage('isOnline must be a boolean'),
  body('state').optional().isObject().withMessage('State must be an object'),
  body('metadata').optional().isObject().withMessage('Metadata must be an object')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }

  const { deviceId } = req.params;
  const statusData = req.body;

  const result = await iotService.updateDeviceStatus(deviceId, statusData);

  if (!result.success) {
    throw new AppError('Failed to update device status', 500, 'STATUS_UPDATE_FAILED', {
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

// Control device
router.post('/devices/:deviceId/control', authorize(['super_admin', 'library_staff']), [
  body('action').trim().isLength({ min: 1 }).withMessage('Action is required'),
  body('parameters').optional().isObject().withMessage('Parameters must be an object')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }

  const { deviceId } = req.params;
  const command = req.body;

  const result = await iotService.controlDevice(deviceId, command);

  if (!result.success) {
    throw new AppError('Failed to control device', 500, 'DEVICE_CONTROL_FAILED', {
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

// Get device telemetry
router.get('/devices/:deviceId/telemetry', authorize(['super_admin', 'library_staff']), [
  queryValidator('metricType').optional().isString().withMessage('Metric type must be a string'),
  queryValidator('dateFrom').optional().isISO8601().withMessage('Invalid date format'),
  queryValidator('dateTo').optional().isISO8601().withMessage('Invalid date format'),
  queryValidator('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }

  const { deviceId } = req.params;
  const options = req.query;

  const result = await iotService.getDeviceTelemetry(deviceId, options);

  if (!result.success) {
    throw new AppError('Failed to get telemetry', 500, 'TELEMETRY_FETCH_FAILED', {
      details: result.error
    });
  }

  res.json({
    success: true,
    data: result.data,
    meta: {
      count: result.data.length,
      timestamp: new Date().toISOString()
    }
  });
}));

// Create automation rule
router.post('/automation/rules', authorize(['super_admin', 'library_staff']), [
  body('libraryId').isUUID().withMessage('Valid library ID required'),
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('triggerType').isIn(['time', 'sensor', 'event', 'manual']).withMessage('Invalid trigger type'),
  body('triggerConditions').isObject().withMessage('Trigger conditions must be an object'),
  body('actions').isArray().withMessage('Actions must be an array')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }

  const { libraryId, ...ruleData } = req.body;
  ruleData.createdBy = req.user.id;

  const result = await iotService.createAutomationRule(libraryId, ruleData);

  if (!result.success) {
    throw new AppError('Failed to create automation rule', 500, 'RULE_CREATE_FAILED', {
      details: result.error
    });
  }

  res.status(201).json({
    success: true,
    data: result.data,
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Get automation rules for library
router.get('/libraries/:libraryId/automation/rules', authorize(['super_admin', 'library_staff']), asyncHandler(async (req, res) => {
  const { libraryId } = req.params;

  const result = await iotService.getAutomationRules(libraryId);

  if (!result.success) {
    throw new AppError('Failed to get automation rules', 500, 'RULES_FETCH_FAILED', {
      details: result.error
    });
  }

  res.json({
    success: true,
    data: result.data,
    meta: {
      count: result.data.length,
      timestamp: new Date().toISOString()
    }
  });
}));

// Record energy consumption
router.post('/energy/consumption', authorize(['super_admin', 'library_staff']), [
  body('libraryId').isUUID().withMessage('Valid library ID required'),
  body('deviceId').optional().isUUID().withMessage('Valid device ID required'),
  body('consumptionKwh').isFloat({ min: 0 }).withMessage('Consumption must be a positive number'),
  body('costAmount').optional().isFloat({ min: 0 }).withMessage('Cost must be a positive number'),
  body('currency').optional().isString().withMessage('Currency must be a string'),
  body('readingDate').isDate().withMessage('Valid date required'),
  body('readingTime').optional().isString().withMessage('Time must be a string'),
  body('metadata').optional().isObject().withMessage('Metadata must be an object')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }

  const { libraryId, ...consumptionData } = req.body;

  const result = await iotService.recordEnergyConsumption(libraryId, consumptionData);

  if (!result.success) {
    throw new AppError('Failed to record energy consumption', 500, 'ENERGY_RECORD_FAILED', {
      details: result.error
    });
  }

  res.status(201).json({
    success: true,
    data: result.data,
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Get energy statistics
router.get('/libraries/:libraryId/energy/statistics', authorize(['super_admin', 'library_staff']), [
  queryValidator('period').optional().isIn(['7days', '30days', '90days']).withMessage('Invalid period')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }

  const { libraryId } = req.params;
  const { period = '30days' } = req.query;

  const result = await iotService.getEnergyStatistics(libraryId, period);

  if (!result.success) {
    throw new AppError('Failed to get energy statistics', 500, 'ENERGY_STATS_FAILED', {
      details: result.error
    });
  }

  res.json({
    success: true,
    data: result.data,
    meta: {
      period: period,
      timestamp: new Date().toISOString()
    }
  });
}));

// Get library IoT dashboard
router.get('/libraries/:libraryId/dashboard', authorize(['super_admin', 'library_staff']), asyncHandler(async (req, res) => {
  const { libraryId } = req.params;

  const result = await iotService.getLibraryDashboard(libraryId);

  if (!result.success) {
    throw new AppError('Failed to get library dashboard', 500, 'DASHBOARD_FAILED', {
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

// Get supported device types
router.get('/device-types', asyncHandler(async (req, res) => {
  const deviceTypes = [
    {
      type: 'light',
      name: 'Smart Lighting',
      description: 'LED lights with dimming and color control',
      actions: ['turn_on', 'turn_off', 'set_brightness', 'set_color']
    },
    {
      type: 'ac',
      name: 'Air Conditioning',
      description: 'Climate control systems',
      actions: ['turn_on', 'turn_off', 'set_temperature', 'set_mode']
    },
    {
      type: 'sensor',
      name: 'Environmental Sensors',
      description: 'Temperature, humidity, CO2, occupancy sensors',
      actions: ['read_data']
    },
    {
      type: 'lock',
      name: 'Smart Locks',
      description: 'Electronic door locks',
      actions: ['lock', 'unlock']
    },
    {
      type: 'camera',
      name: 'Security Cameras',
      description: 'Surveillance and monitoring cameras',
      actions: ['start_recording', 'stop_recording', 'capture_snapshot']
    }
  ];

  res.json({
    success: true,
    data: deviceTypes,
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

module.exports = router;
