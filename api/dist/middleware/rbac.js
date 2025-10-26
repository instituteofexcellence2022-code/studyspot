/**
 * Role-Based Access Control (RBAC) Middleware
 * Protects routes based on user roles and permissions
 */

const {
  hasPermission,
  getRolePermissions,
  canManageRole,
  ROLES
} = require('../constants/roles');
const {
  logger
} = require('../utils/logger');

/**
 * Middleware to check if user has required permission
 * @param {string} permission - Required permission
 */
const requirePermission = permission => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          errors: [{
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }]
        });
      }
      const userRole = req.user.role;

      // Check if user has the required permission
      if (!hasPermission(userRole, permission)) {
        logger.warn(`Access denied: User ${req.user.id} (${userRole}) attempted to access ${permission}`);
        return res.status(403).json({
          success: false,
          errors: [{
            code: 'FORBIDDEN',
            message: 'You do not have permission to perform this action',
            required_permission: permission
          }]
        });
      }

      // User has permission, proceed
      next();
    } catch (error) {
      logger.error('RBAC middleware error:', error);
      res.status(500).json({
        success: false,
        errors: [{
          code: 'INTERNAL_ERROR',
          message: 'Error checking permissions'
        }]
      });
    }
  };
};

/**
 * Middleware to check if user has ANY of the required permissions
 * @param {string[]} permissions - Array of permissions (user needs at least one)
 */
const requireAnyPermission = permissions => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          errors: [{
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }]
        });
      }
      const userRole = req.user.role;
      const hasAnyPermission = permissions.some(permission => hasPermission(userRole, permission));
      if (!hasAnyPermission) {
        logger.warn(`Access denied: User ${req.user.id} (${userRole}) lacks required permissions`);
        return res.status(403).json({
          success: false,
          errors: [{
            code: 'FORBIDDEN',
            message: 'You do not have permission to perform this action',
            required_permissions: permissions
          }]
        });
      }
      next();
    } catch (error) {
      logger.error('RBAC middleware error:', error);
      res.status(500).json({
        success: false,
        errors: [{
          code: 'INTERNAL_ERROR',
          message: 'Error checking permissions'
        }]
      });
    }
  };
};

/**
 * Middleware to check if user has ALL of the required permissions
 * @param {string[]} permissions - Array of permissions (user needs all)
 */
const requireAllPermissions = permissions => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          errors: [{
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }]
        });
      }
      const userRole = req.user.role;
      const hasAllPermissions = permissions.every(permission => hasPermission(userRole, permission));
      if (!hasAllPermissions) {
        logger.warn(`Access denied: User ${req.user.id} (${userRole}) lacks all required permissions`);
        return res.status(403).json({
          success: false,
          errors: [{
            code: 'FORBIDDEN',
            message: 'You do not have permission to perform this action',
            required_permissions: permissions
          }]
        });
      }
      next();
    } catch (error) {
      logger.error('RBAC middleware error:', error);
      res.status(500).json({
        success: false,
        errors: [{
          code: 'INTERNAL_ERROR',
          message: 'Error checking permissions'
        }]
      });
    }
  };
};

/**
 * Middleware to check if user has specific role
 * @param {string|string[]} roles - Required role(s)
 */
const requireRole = roles => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          errors: [{
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }]
        });
      }
      const userRole = req.user.role;
      if (!allowedRoles.includes(userRole)) {
        logger.warn(`Access denied: User ${req.user.id} (${userRole}) does not have required role`);
        return res.status(403).json({
          success: false,
          errors: [{
            code: 'FORBIDDEN',
            message: 'You do not have the required role to access this resource',
            required_roles: allowedRoles
          }]
        });
      }
      next();
    } catch (error) {
      logger.error('RBAC middleware error:', error);
      res.status(500).json({
        success: false,
        errors: [{
          code: 'INTERNAL_ERROR',
          message: 'Error checking role'
        }]
      });
    }
  };
};

/**
 * Middleware to check if user can manage another user's role
 * Used when creating/editing staff with specific roles
 */
const canAssignRole = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        errors: [{
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }]
      });
    }
    const userRole = req.user.role;
    const targetRole = req.body.role;
    if (!targetRole) {
      return next(); // No role to assign, proceed
    }
    if (!canManageRole(userRole, targetRole)) {
      logger.warn(`Access denied: User ${req.user.id} (${userRole}) cannot assign role ${targetRole}`);
      return res.status(403).json({
        success: false,
        errors: [{
          code: 'FORBIDDEN',
          message: 'You cannot assign this role',
          your_role: userRole,
          attempted_role: targetRole
        }]
      });
    }
    next();
  } catch (error) {
    logger.error('RBAC middleware error:', error);
    res.status(500).json({
      success: false,
      errors: [{
        code: 'INTERNAL_ERROR',
        message: 'Error checking role assignment'
      }]
    });
  }
};

/**
 * Middleware to ensure user can only access their own library's data
 * Adds libraryId filter to requests
 */
const restrictToOwnLibrary = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        errors: [{
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }]
      });
    }
    const userRole = req.user.role;

    // Super admins can access all libraries
    if (userRole === ROLES.SUPER_ADMIN) {
      return next();
    }

    // Library owners can access all their branches
    if (userRole === ROLES.LIBRARY_OWNER) {
      // Add tenant_id filter
      req.libraryFilter = {
        tenant_id: req.user.tenant_id
      };
      return next();
    }

    // Other roles can only access their specific library/branch
    if (req.user.library_id) {
      req.libraryFilter = {
        library_id: req.user.library_id
      };
      return next();
    }

    // No library association found
    return res.status(403).json({
      success: false,
      errors: [{
        code: 'FORBIDDEN',
        message: 'No library association found for your account'
      }]
    });
  } catch (error) {
    logger.error('Library restriction middleware error:', error);
    res.status(500).json({
      success: false,
      errors: [{
        code: 'INTERNAL_ERROR',
        message: 'Error applying library restrictions'
      }]
    });
  }
};

/**
 * Get user permissions (for returning in API responses)
 */
const getUserPermissions = (req, res, next) => {
  if (req.user && req.user.role) {
    req.user.permissions = getRolePermissions(req.user.role);
  }
  next();
};
module.exports = {
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireRole,
  canAssignRole,
  restrictToOwnLibrary,
  getUserPermissions
};