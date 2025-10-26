const express = require('express');
const {
  body,
  validationResult
} = require('express-validator');
const {
  verifyToken,
  setTenantContext
} = require('../middleware/auth');
const {
  AppError,
  asyncHandler
} = require('../middleware/errorHandler');
const {
  logger
} = require('../utils/logger');
const aiService = require('../services/aiService');
const router = express.Router();

// Apply authentication and tenant context to all routes
router.use(verifyToken);
router.use(setTenantContext);

// Get personalized study recommendations
router.get('/recommendations', asyncHandler(async (req, res) => {
  const result = await aiService.generateStudyRecommendations(req.user.id);
  if (!result.success) {
    throw new AppError('Failed to generate recommendations', 500, 'AI_RECOMMENDATION_FAILED', {
      details: result.error
    });
  }
  res.json({
    success: true,
    data: result.data,
    meta: {
      timestamp: new Date().toISOString(),
      aiPowered: true
    }
  });
}));

// Get AI-powered study insights
router.get('/insights', asyncHandler(async (req, res) => {
  const performance = await aiService.getUserPerformance(req.user.id);
  const patterns = await aiService.analyzeStudyPatterns(req.user.id);
  res.json({
    success: true,
    data: {
      performance: performance,
      patterns: patterns,
      insights: {
        consistencyLevel: patterns.consistencyScore >= 70 ? 'excellent' : patterns.consistencyScore >= 50 ? 'good' : 'needs improvement',
        productivityTrend: performance.completionRate >= 80 ? 'increasing' : performance.completionRate >= 60 ? 'stable' : 'declining',
        recommendations: patterns.consistencyScore < 70 ? ['Try to maintain a regular study schedule', 'Book sessions at consistent times'] : ['Keep up the great work!', 'Consider challenging yourself with longer sessions']
      }
    },
    meta: {
      timestamp: new Date().toISOString(),
      aiPowered: true
    }
  });
}));

// Predict booking success probability
router.post('/predict-success', [body('bookingDetails').isObject().withMessage('Booking details are required'), body('bookingDetails.date').isISO8601().withMessage('Valid date is required'), body('bookingDetails.startTime').isString().withMessage('Start time is required'), body('bookingDetails.endTime').isString().withMessage('End time is required')], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }
  const {
    bookingDetails
  } = req.body;
  const result = await aiService.predictSuccessProbability(req.user.id, bookingDetails);
  if (!result.success) {
    throw new AppError('Failed to predict success', 500, 'AI_PREDICTION_FAILED', {
      details: result.error
    });
  }
  res.json({
    success: true,
    data: result.data,
    meta: {
      timestamp: new Date().toISOString(),
      aiPowered: true
    }
  });
}));

// Get optimal study schedule recommendations
router.get('/optimal-schedule', asyncHandler(async (req, res) => {
  const patterns = await aiService.analyzeStudyPatterns(req.user.id);
  const performance = await aiService.getUserPerformance(req.user.id);
  const schedule = aiService.recommendOptimalStudyTimes(patterns);
  const duration = aiService.recommendStudyDuration(performance);
  const breaks = aiService.recommendBreaks(patterns);
  res.json({
    success: true,
    data: {
      recommendedTimeSlots: schedule,
      recommendedDuration: duration,
      breakSchedule: breaks,
      weeklyGoal: {
        studyHours: Math.max(10, Math.round(performance.totalStudyHours / 30 * 7)),
        sessions: Math.max(3, Math.round(performance.totalSessions / 30 * 7)),
        confidence: 85
      }
    },
    meta: {
      timestamp: new Date().toISOString(),
      aiPowered: true
    }
  });
}));

// Get library recommendations
router.get('/recommended-libraries', asyncHandler(async (req, res) => {
  const userHistory = await aiService.getUserStudyHistory(req.user.id);
  const libraries = await aiService.recommendLibraries(req.user.id, userHistory);
  res.json({
    success: true,
    data: {
      recommendations: libraries,
      totalRecommendations: libraries.length
    },
    meta: {
      timestamp: new Date().toISOString(),
      aiPowered: true
    }
  });
}));

// Get weak areas and improvement suggestions
router.get('/improvement-areas', asyncHandler(async (req, res) => {
  const performance = await aiService.getUserPerformance(req.user.id);
  const weakAreas = aiService.identifyWeakAreas(performance);
  const resources = aiService.recommendResources(performance);
  res.json({
    success: true,
    data: {
      weakAreas: weakAreas,
      recommendedResources: resources,
      overallScore: Math.round((performance.completionRate + performance.uniqueStudyDays / 30 * 100 + Math.min(performance.averageSessionDuration / 3 * 100, 100)) / 3),
      improvementPlan: weakAreas.length > 0 ? {
        focus: weakAreas[0].area,
        goal: 'Improve by 20% in the next 30 days',
        action: weakAreas[0].recommendation
      } : {
        focus: 'Maintain Excellence',
        goal: 'Continue your great study habits',
        action: 'Keep up the consistent study schedule'
      }
    },
    meta: {
      timestamp: new Date().toISOString(),
      aiPowered: true
    }
  });
}));

// Get AI study assistant chat (future enhancement for conversational AI)
router.post('/assistant/chat', [body('message').trim().isLength({
  min: 1
}).withMessage('Message is required')], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }
  const {
    message
  } = req.body;

  // This is a placeholder for future OpenAI integration
  // For now, return context-aware canned responses
  const response = await generateAssistantResponse(message, req.user.id);
  res.json({
    success: true,
    data: {
      message: response.message,
      suggestions: response.suggestions,
      actions: response.actions
    },
    meta: {
      timestamp: new Date().toISOString(),
      aiPowered: true
    }
  });
}));

// Helper function for AI assistant responses (placeholder)
async function generateAssistantResponse(message, userId) {
  const lowerMessage = message.toLowerCase();

  // Simple keyword matching (in production, use NLP/OpenAI)
  if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
    return {
      message: 'I can help you find the perfect study spot! Based on your history, I recommend booking during your most productive hours.',
      suggestions: ['View personalized recommendations', 'See optimal study times'],
      actions: [{
        label: 'Get Recommendations',
        endpoint: '/api/ai/recommendations'
      }, {
        label: 'View Schedule',
        endpoint: '/api/ai/optimal-schedule'
      }]
    };
  }
  if (lowerMessage.includes('improve') || lowerMessage.includes('better')) {
    return {
      message: 'Let me analyze your study patterns to help you improve. I can identify areas that need attention and suggest specific actions.',
      suggestions: ['Check weak areas', 'Get improvement plan'],
      actions: [{
        label: 'View Weak Areas',
        endpoint: '/api/ai/improvement-areas'
      }, {
        label: 'Get Study Plan',
        endpoint: '/api/ai/optimal-schedule'
      }]
    };
  }
  if (lowerMessage.includes('library') || lowerMessage.includes('where')) {
    return {
      message: 'I can recommend the best libraries for you based on your preferences and past bookings.',
      suggestions: ['See recommended libraries', 'View nearby options'],
      actions: [{
        label: 'Recommended Libraries',
        endpoint: '/api/ai/recommended-libraries'
      }, {
        label: 'Nearby Libraries',
        endpoint: '/api/maps/nearby-libraries'
      }]
    };
  }

  // Default response
  return {
    message: 'I\'m your AI study assistant! I can help you with personalized recommendations, optimal study schedules, library suggestions, and performance insights. What would you like to know?',
    suggestions: ['Get study recommendations', 'Find optimal study times', 'See recommended libraries', 'Check my progress'],
    actions: [{
      label: 'Recommendations',
      endpoint: '/api/ai/recommendations'
    }, {
      label: 'Insights',
      endpoint: '/api/ai/insights'
    }]
  };
}
module.exports = router;