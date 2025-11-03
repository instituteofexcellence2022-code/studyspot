/**
 * Authentication & Authorization Middleware
 * Handles JWT token verification, user authentication, and basic authorization
 */

const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { AppError, asyncHandler } = require('./errorHandler');
const { logger } = require('../utils/logger');

/**
 * Verify JWT token and authenticate user
 * @requires Authorization header with Bearer token
 * @attaches req.user with authenticated user data
 */
const verifyToken = asyncHandler(async (req, res, next) => {
  // 1. Extract token from Authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Authorization token required', 401, 'TOKEN_REQUIRED');
  }

  const token = authHeader.substring(7);

  // Reject empty tokens
  if (!token || token.trim() === '') {
    throw new AppError('Invalid token format', 401, 'INVALID_TOKEN');
  }

  try {
    // 2. Verify JWT token signature and expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded || !decoded.id) {
      throw new AppError('Invalid token payload', 401, 'INVALID_TOKEN');
    }

    // 3. Get user from database to ensure they exist and are active
    const userResult = await query(
      'SELECT id, email, role, tenant_id, status FROM users WHERE id = $1',
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      logger.warn('Authentication failed: User not found', { userId: decoded.id });
      throw new AppError('User not found', 401, 'USER_NOT_FOUND');
    }

    const user = userResult.rows[0];

    // 4. Check if user account is active
    if (user.status !== 'active') {
      logger.warn('Authentication failed: Account not active', { 
        userId: user.id, 
        email: user.email, 
        status: user.status 
      });
      throw new AppError(
        `Account is ${user.status}. Please contact support.`, 
        401, 
        'ACCOUNT_INACTIVE'
      );
    }

    // 5. Attach authenticated user to request object
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenant_id,
      // Additional fields can be added here if needed
      tokenPayload: decoded
    };

    // Log successful authentication
    logger.debug('User authenticated', { 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    });

    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      logger.warn('Token expired', { 
        ip: req.ip, 
        userAgent: req.get('User-Agent') 
      });
      throw new AppError(
        'Your session has expired. Please log in again.', 
        401, 
        'TOKEN_EXPIRED'
      );
    }
    
    if (error.name === 'JsonWebTokenError') {
      logger.warn('Invalid token', { 
        error: error.message, 
        ip: req.ip 
      });
      throw new AppError(
        'Invalid authentication token. Please log in again.', 
        401, 
        'INVALID_TOKEN'
      );
    }

    // Re-throw other AppError instances
    if (error.isOperational) {
      throw error;
    }

    // Log unexpected errors
    logger.error('Unexpected error in verifyToken middleware', {
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });

    throw new AppError(
      'Authentication failed. Please try again.', 
      401, 
      'AUTHENTICATION_FAILED'
    );
  }
});

/**
 * Set tenant context middleware
 * Extracts and validates tenant context from authenticated user
 * @requires req.user (set by verifyToken middleware)
 * @attaches req.tenantContext with tenant ID
 */
const setTenantContext = (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      // If not authenticated, try to get tenant from header (for public endpoints)
      const tenantHeader = req.headers['x-tenant-id'];
      if (tenantHeader) {
        req.tenantContext = tenantHeader;
      }
      return next();
    }

    // Validate tenant ID exists
    if (!req.user.tenantId) {
      logger.warn('Missing tenant context', { 
        userId: req.user.id, 
        email: req.user.email 
      });
      
      // Use default tenant for system users
      req.tenantContext = '00000000-0000-0000-0000-000000000000';
      return next();
    }

    req.tenantContext = req.user.tenantId;
    
    next();
  } catch (error) {
    logger.error('Error in setTenantContext middleware', {
      error: error.message,
      stack: error.stack
    });
    next();
  }
};

/**
 * Authorize based on roles
 * @param {...string} allowedRoles - Roles that are allowed to access the resource
 * @returns middleware function
 * @requires req.user (set by verifyToken middleware)
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          errors: [{
            code: 'UNAUTHORIZED',
            message: 'Authentication required to access this resource'
          }],
          meta: {
            timestamp: new Date().toISOString()
          }
        });
      }

      const userRole = req.user.role;

      // Check if user has one of the allowed roles
      if (!allowedRoles.includes(userRole)) {
        logger.warn('Authorization failed: Insufficient permissions', {
          userId: req.user.id,
          email: req.user.email,
          userRole,
          requiredRoles: allowedRoles,
          path: req.path,
          method: req.method
        });
        
        return res.status(403).json({
          success: false,
          errors: [{
            code: 'FORBIDDEN',
            message: 'You do not have permission to access this resource',
            yourRole: userRole,
            requiredRoles: allowedRoles
          }],
          meta: {
            timestamp: new Date().toISOString()
          }
        });
      }

      // User has required role, proceed
      next();
    } catch (error) {
      logger.error('Error in authorize middleware', {
        error: error.message,
        stack: error.stack
      });
      
      return res.status(500).json({
        success: false,
        errors: [{
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while checking permissions'
        }],
        meta: {
          timestamp: new Date().toISOString()
        }
      });
    }
  };
};

/**
 * Optional authentication middleware
 * Attempts to authenticate user but doesn't require it
 * Useful for endpoints that can work with or without authentication
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without authentication
      return next();
    }

    const token = authHeader.substring(7);

    if (!token || token.trim() === '') {
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (!decoded || !decoded.id) {
        return next();
      }

      const userResult = await query(
        'SELECT id, email, role, tenant_id, status FROM users WHERE id = $1 AND status = $2',
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
        req.tenantContext = user.tenant_id || '00000000-0000-0000-0000-000000000000';
      }
    } catch (error) {
      // Token invalid but don't fail - just continue without auth
      logger.debug('Optional auth failed (continuing without auth)', {
        error: error.message
      });
    }

    next();
  } catch (error) {
    logger.error('Error in optionalAuth middleware', {
      error: error.message,
      stack: error.stack
    });
    next();
  }
};

/**
 * Authorize resource access
 * Check if user can access a specific resource (e.g., their own bookings)
 * @param {string} resourceTable - Database table name
 * @param {string} resourceIdParam - Request parameter containing resource ID
 * @param {string} userIdColumn - Column name for user ID in resource table
 */
const authorizeResource = (resourceTable, resourceIdParam = 'id', userIdColumn = 'user_id') => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        errors: [{
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }]
      });
    }

    const resourceId = req.params[resourceIdParam];
    
    if (!resourceId) {
      return res.status(400).json({
        success: false,
        errors: [{
          code: 'BAD_REQUEST',
          message: 'Resource ID is required'
        }]
      });
    }

    // Super admins can access all resources
    if (req.user.role === 'super_admin') {
      return next();
    }

    // Check if user owns the resource
    const checkQuery = `
      SELECT ${userIdColumn} 
      FROM ${resourceTable} 
      WHERE id = $1 
      LIMIT 1
    `;

    const result = await query(checkQuery, [resourceId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        errors: [{
          code: 'NOT_FOUND',
          message: 'Resource not found'
        }]
      });
    }

    const resourceUserId = result.rows[0][userIdColumn];

    // Check if user owns the resource or is an admin
    if (resourceUserId !== req.user.id && !['super_admin', 'library_owner'].includes(req.user.role)) {
      logger.warn('Authorization failed: Resource access denied', {
        userId: req.user.id,
        resourceId,
        resourceUserId
      });

      return res.status(403).json({
        success: false,
        errors: [{
          code: 'FORBIDDEN',
          message: 'You do not have permission to access this resource'
        }]
      });
    }

    next();
  });
};

module.exports = {
  verifyToken,
  authorize,
  setTenantContext,
  optionalAuth,
  authorizeResource
};
