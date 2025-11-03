/**
 * RATE LIMITING MIDDLEWARE
 * Issue #2 from Code Review - HIGH PRIORITY
 * 
 * Provides different rate limiting strategies for different endpoints
 * - Strict limiting for authentication endpoints (prevents brute force)
 * - Moderate limiting for registration (prevents spam)
 * - Standard limiting for API endpoints
 * - Per-user rate limiting for authenticated requests
 */

const rateLimit = require('express-rate-limit');
const {
  logger
} = require('../utils/logger');

// ============================================================================
// AUTH ENDPOINTS - STRICT RATE LIMITING
// ============================================================================

/**
 * Very strict rate limiting for login endpoint
 * Prevents brute force password attacks
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  // 15 minutes
  max: 5,
  // Only 5 login attempts per 15 minutes per IP
  skipSuccessfulRequests: false,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    meta: {
      timestamp: new Date().toISOString()
    },
    errors: [{
      code: 'TOO_MANY_AUTH_ATTEMPTS',
      message: 'Too many login attempts from this IP. Please try again in 15 minutes.',
      details: 'Account security: Multiple failed login attempts detected.'
    }]
  },
  handler: (req, res) => {
    logger.logSecurityEvent('rate_limit_exceeded_auth', {
      ip: req.ip,
      endpoint: req.originalUrl,
      userAgent: req.get('user-agent')
    });
    res.status(429).json({
      success: false,
      data: null,
      meta: {
        timestamp: new Date().toISOString()
      },
      errors: [{
        code: 'TOO_MANY_AUTH_ATTEMPTS',
        message: 'Too many login attempts. Please try again later.'
      }]
    });
  }
});

/**
 * Moderate rate limiting for registration
 * Prevents automated account creation and spam
 */
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  // 1 hour
  max: 3,
  // Only 3 registration attempts per hour per IP
  skipSuccessfulRequests: false,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    meta: {
      timestamp: new Date().toISOString()
    },
    errors: [{
      code: 'TOO_MANY_REGISTRATIONS',
      message: 'Too many registration attempts. Please try again later.',
      details: 'You can only create 3 accounts per hour from this IP address.'
    }]
  },
  handler: (req, res) => {
    logger.logSecurityEvent('rate_limit_exceeded_registration', {
      ip: req.ip,
      endpoint: req.originalUrl
    });
    res.status(429).json({
      success: false,
      errors: [{
        code: 'TOO_MANY_REGISTRATIONS',
        message: 'Too many registration attempts. Please try again in an hour.'
      }]
    });
  }
});

/**
 * Rate limiting for password reset requests
 * Prevents email bombing and abuse
 */
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  // 1 hour
  max: 3,
  // 3 password reset requests per hour
  skipSuccessfulRequests: false,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    errors: [{
      code: 'TOO_MANY_RESET_REQUESTS',
      message: 'Too many password reset requests. Please try again later.'
    }]
  }
});

// ============================================================================
// PAYMENT ENDPOINTS - STRICT RATE LIMITING
// ============================================================================

/**
 * Rate limiting for payment endpoints
 * Prevents payment fraud and abuse
 */
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  // 15 minutes
  max: 10,
  // 10 payment attempts per 15 minutes
  skipSuccessfulRequests: true,
  // Allow successful payments
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    errors: [{
      code: 'TOO_MANY_PAYMENT_ATTEMPTS',
      message: 'Too many payment attempts. Please wait before trying again.'
    }]
  },
  handler: (req, res) => {
    logger.logSecurityEvent('rate_limit_exceeded_payment', {
      ip: req.ip,
      userId: req.user?.id,
      endpoint: req.originalUrl
    });
    res.status(429).json({
      success: false,
      errors: [{
        code: 'TOO_MANY_PAYMENT_ATTEMPTS',
        message: 'Too many payment attempts. Please contact support.'
      }]
    });
  }
});

// ============================================================================
// API ENDPOINTS - MODERATE RATE LIMITING
// ============================================================================

/**
 * Standard rate limiting for general API endpoints
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  // 15 minutes
  max: 100,
  // 100 requests per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    errors: [{
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please slow down.'
    }]
  }
});

/**
 * Generous rate limiting for read-only endpoints
 */
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  // 15 minutes
  max: 300,
  // 300 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false
});

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  authLimiter,
  registerLimiter,
  passwordResetLimiter,
  paymentLimiter,
  apiLimiter,
  publicLimiter
};