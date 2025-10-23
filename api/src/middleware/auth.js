const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { getSession } = require('../config/redis');
const { AppError } = require('./errorHandler');
const { logger } = require('../utils/logger');

// Verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authorization token required', 401, 'TOKEN_REQUIRED');
    }

    const token = authHeader.substring(7);
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists and is active
    const userResult = await query(
      'SELECT id, email, role, status, tenant_id FROM users WHERE id = $1 AND status = $2',
      [decoded.id, 'active']
    );

    if (userResult.rows.length === 0) {
      throw new AppError('User not found or inactive', 401, 'USER_NOT_FOUND');
    }

    const user = userResult.rows[0];
    
    // Add user info to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenant_id
    };

    // Add tenant ID to headers for multi-tenant queries
    req.headers['x-tenant-id'] = user.tenant_id;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Token expired', 401, 'TOKEN_EXPIRED');
    } else if (error.name === 'JsonWebTokenError') {
      throw new AppError('Invalid token', 401, 'INVALID_TOKEN');
    }
    next(error);
  }
};

// Check user roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
    }

    if (!roles.includes(req.user.role)) {
      logger.logSecurityEvent('unauthorized_access_attempt', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
        endpoint: req.originalUrl,
        method: req.method
      });
      
      throw new AppError('Insufficient permissions', 403, 'INSUFFICIENT_PERMISSIONS');
    }

    next();
  };
};

// Check if user owns the resource or has admin role
const authorizeResource = (resourceUserIdField = 'user_id') => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
    }

    // Super admins can access everything
    if (req.user.role === 'super_admin') {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (resourceUserId && resourceUserId !== req.user.id) {
      logger.logSecurityEvent('unauthorized_resource_access', {
        userId: req.user.id,
        resourceUserId,
        endpoint: req.originalUrl,
        method: req.method
      });
      
      throw new AppError('Access denied to this resource', 403, 'RESOURCE_ACCESS_DENIED');
    }

    next();
  };
};

// Multi-tenant middleware
const setTenantContext = (req, res, next) => {
  if (req.user && req.user.tenantId) {
    req.tenantId = req.user.tenantId;
  } else if (req.headers['x-tenant-id']) {
    req.tenantId = req.headers['x-tenant-id'];
  } else {
    // Default tenant for public endpoints
    req.tenantId = '00000000-0000-0000-0000-000000000000';
  }
  
  next();
};

// Rate limiting per user
const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  return async (req, res, next) => {
    if (!req.user) {
      return next();
    }

    const { checkRateLimit } = require('../config/redis');
    const key = `rate_limit:user:${req.user.id}`;
    
    const isAllowed = await checkRateLimit(key, maxRequests, Math.floor(windowMs / 1000));
    
    if (!isAllowed) {
      logger.logSecurityEvent('rate_limit_exceeded', {
        userId: req.user.id,
        endpoint: req.originalUrl,
        method: req.method
      });
      
      throw new AppError('Too many requests', 429, 'RATE_LIMIT_EXCEEDED');
    }

    next();
  };
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const userResult = await query(
      'SELECT id, email, role, status, tenant_id FROM users WHERE id = $1 AND status = $2',
      [decoded.id, 'active']
    );

    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenant_id
      };
      req.headers['x-tenant-id'] = user.tenant_id;
    }

    next();
  } catch (error) {
    // Ignore token errors for optional auth
    next();
  }
};

// Check if user can access tenant data
const checkTenantAccess = async (req, res, next) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
  }

  // Super admins can access all tenants
  if (req.user.role === 'super_admin') {
    return next();
  }

  // Check if user belongs to the requested tenant
  const requestedTenantId = req.params.tenantId || req.body.tenantId || req.query.tenantId;
  
  if (requestedTenantId && requestedTenantId !== req.user.tenantId) {
    logger.logSecurityEvent('unauthorized_tenant_access', {
      userId: req.user.id,
      userTenantId: req.user.tenantId,
      requestedTenantId,
      endpoint: req.originalUrl
    });
    
    throw new AppError('Access denied to this tenant data', 403, 'TENANT_ACCESS_DENIED');
  }

  next();
};

module.exports = {
  verifyToken,
  authorize,
  authorizeResource,
  setTenantContext,
  userRateLimit,
  optionalAuth,
  checkTenantAccess
};












