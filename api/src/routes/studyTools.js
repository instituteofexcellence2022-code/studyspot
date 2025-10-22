const express = require('express');
const { body, query: queryValidator, validationResult } = require('express-validator');
const { verifyToken, setTenantContext } = require('../middleware/auth');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');
const studyToolsService = require('../services/studyToolsService');

const router = express.Router();

// Apply authentication and tenant context to all routes
router.use(verifyToken);
router.use(setTenantContext);

// Create a new study session
router.post('/sessions', [
  body('bookingId').optional().isUUID().withMessage('Valid booking ID required'),
  body('type').optional().isIn(['pomodoro', 'custom', 'flexible']).withMessage('Invalid session type'),
  body('customSettings').optional().isObject().withMessage('Custom settings must be an object')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }

  const result = await studyToolsService.createStudySession(req.user.id, req.body);

  if (!result.success) {
    throw new AppError('Failed to create study session', 500, 'SESSION_CREATE_FAILED', {
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

// Get active study session
router.get('/sessions/active', asyncHandler(async (req, res) => {
  const result = await studyToolsService.getActiveSession(req.user.id);

  if (!result.success) {
    throw new AppError('Failed to get active session', 500, 'SESSION_FETCH_FAILED', {
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

// Get session history
router.get('/sessions', [
  queryValidator('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  queryValidator('offset').optional().isInt({ min: 0 }).withMessage('Offset must be positive'),
  queryValidator('dateFrom').optional().isISO8601().withMessage('Invalid date format'),
  queryValidator('dateTo').optional().isISO8601().withMessage('Invalid date format')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }

  const result = await studyToolsService.getSessionHistory(req.user.id, req.query);

  if (!result.success) {
    throw new AppError('Failed to get session history', 500, 'SESSION_HISTORY_FAILED', {
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

// End study session
router.put('/sessions/:sessionId/end', asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  const result = await studyToolsService.endStudySession(req.user.id, sessionId);

  if (!result.success) {
    throw new AppError('Failed to end study session', 500, 'SESSION_END_FAILED', {
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

// Start a timer (focus or break)
router.post('/timers', [
  body('sessionId').isUUID().withMessage('Valid session ID required'),
  body('type').isIn(['focus', 'break', 'short_break', 'long_break']).withMessage('Invalid timer type'),
  body('duration').isInt({ min: 1, max: 240 }).withMessage('Duration must be between 1 and 240 minutes')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }

  const { sessionId, type, duration } = req.body;

  const result = await studyToolsService.startTimer(req.user.id, sessionId, type, duration);

  if (!result.success) {
    throw new AppError('Failed to start timer', 500, 'TIMER_START_FAILED', {
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

// Complete a timer
router.put('/timers/:timerId/complete', asyncHandler(async (req, res) => {
  const { timerId } = req.params;

  const result = await studyToolsService.completeTimer(req.user.id, timerId);

  if (!result.success) {
    throw new AppError('Failed to complete timer', 500, 'TIMER_COMPLETE_FAILED', {
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

// Pause a timer
router.put('/timers/:timerId/pause', asyncHandler(async (req, res) => {
  const { timerId } = req.params;

  const result = await studyToolsService.pauseTimer(req.user.id, timerId);

  if (!result.success) {
    throw new AppError('Failed to pause timer', 404, 'TIMER_PAUSE_FAILED', {
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

// Resume a timer
router.put('/timers/:timerId/resume', asyncHandler(async (req, res) => {
  const { timerId } = req.params;

  const result = await studyToolsService.resumeTimer(req.user.id, timerId);

  if (!result.success) {
    throw new AppError('Failed to resume timer', 404, 'TIMER_RESUME_FAILED', {
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

// Get study statistics
router.get('/statistics', [
  queryValidator('period').optional().isIn(['7days', '30days', '90days']).withMessage('Invalid period')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }

  const { period = '30days' } = req.query;

  const result = await studyToolsService.getStudyStatistics(req.user.id, period);

  if (!result.success) {
    throw new AppError('Failed to get study statistics', 500, 'STATISTICS_FAILED', {
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

// Get Pomodoro presets
router.get('/pomodoro/presets', asyncHandler(async (req, res) => {
  const presets = [
    {
      name: 'Classic Pomodoro',
      description: 'Traditional 25/5/15 technique',
      settings: {
        focusDuration: 25,
        shortBreak: 5,
        longBreak: 15,
        sessionsBeforeLongBreak: 4
      },
      recommended: true
    },
    {
      name: 'Extended Focus',
      description: 'Longer focus sessions for deep work',
      settings: {
        focusDuration: 50,
        shortBreak: 10,
        longBreak: 30,
        sessionsBeforeLongBreak: 3
      },
      recommended: false
    },
    {
      name: 'Quick Sprints',
      description: 'Short bursts for beginners',
      settings: {
        focusDuration: 15,
        shortBreak: 3,
        longBreak: 10,
        sessionsBeforeLongBreak: 4
      },
      recommended: false
    },
    {
      name: 'Custom',
      description: 'Create your own timing',
      settings: {
        focusDuration: 25,
        shortBreak: 5,
        longBreak: 15,
        sessionsBeforeLongBreak: 4
      },
      recommended: false
    }
  ];

  res.json({
    success: true,
    data: presets,
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

module.exports = router;
