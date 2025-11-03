/**
 * Permission Middleware - RBAC Authorization
 * Created by: Agent 1 (Backend Developer)
 * Date: October 21, 2025
 */

const {
  query: dbQuery
} = require('../config/database');
const logger = require('../utils/logger');

/**
 * Check if user has required permission
 * @param {string} permissionName - Permission name (e.g., 'libraries.create')
 * @returns {Function} Express middleware
 */
const requirePermission = permissionName => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }
      const userId = req.user.id;

      // Super admins have all permissions
      if (req.user.role === 'super_admin') {
        return next();
      }

      // Check permission using database function
      const result = await dbQuery('SELECT user_has_permission($1, $2) as has_permission', [userId, permissionName]);
      const hasPermission = result.rows[0]?.has_permission;
      if (!hasPermission) {
        logger.warn('Permission denied', {
          userId,
          permission: permissionName,
          ip: req.ip
        });
        return res.status(403).json({
          success: false,
          error: 'Forbidden: Insufficient permissions',
          required_permission: permissionName
        });
      }
      next();
    } catch (error) {
      logger.error('Permission check failed', error);
      res.status(500).json({
        success: false,
        error: 'Permission check failed'
      });
    }
  };
};

/**
 * Check if user has ANY of the required permissions
 * @param {Array<string>} permissionNames - Array of permission names
 * @returns {Function} Express middleware
 */
const requireAnyPermission = permissionNames => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }
      const userId = req.user.id;

      // Super admins have all permissions
      if (req.user.role === 'super_admin') {
        return next();
      }

      // Check if user has any of the permissions
      for (const permissionName of permissionNames) {
        const result = await dbQuery('SELECT user_has_permission($1, $2) as has_permission', [userId, permissionName]);
        if (result.rows[0]?.has_permission) {
          return next();
        }
      }
      logger.warn('Permission denied (any)', {
        userId,
        permissions: permissionNames,
        ip: req.ip
      });
      res.status(403).json({
        success: false,
        error: 'Forbidden: Insufficient permissions',
        required_permissions: permissionNames
      });
    } catch (error) {
      logger.error('Permission check failed', error);
      res.status(500).json({
        success: false,
        error: 'Permission check failed'
      });
    }
  };
};

/**
 * Check if user has ALL required permissions
 * @param {Array<string>} permissionNames - Array of permission names
 * @returns {Function} Express middleware
 */
const requireAllPermissions = permissionNames => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }
      const userId = req.user.id;

      // Super admins have all permissions
      if (req.user.role === 'super_admin') {
        return next();
      }

      // Check if user has all permissions
      for (const permissionName of permissionNames) {
        const result = await dbQuery('SELECT user_has_permission($1, $2) as has_permission', [userId, permissionName]);
        if (!result.rows[0]?.has_permission) {
          logger.warn('Permission denied (all)', {
            userId,
            permissions: permissionNames,
            failed: permissionName,
            ip: req.ip
          });
          return res.status(403).json({
            success: false,
            error: 'Forbidden: Insufficient permissions',
            required_permissions: permissionNames,
            missing: permissionName
          });
        }
      }
      next();
    } catch (error) {
      logger.error('Permission check failed', error);
      res.status(500).json({
        success: false,
        error: 'Permission check failed'
      });
    }
  };
};

/**
 * Check if user has role
 * @param {string|Array<string>} roleNames - Role name(s)
 * @returns {Function} Express middleware
 */
const requireRole = roleNames => {
  const roles = Array.isArray(roleNames) ? roleNames : [roleNames];
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }
      const userId = req.user.id;

      // Check if user has any of the required roles
      const result = await dbQuery(`
        SELECT EXISTS (
          SELECT 1
          FROM user_roles ur
          JOIN roles r ON ur.role_id = r.id
          WHERE ur.user_id = $1
          AND r.name = ANY($2)
          AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
        ) as has_role
      `, [userId, roles]);
      const hasRole = result.rows[0]?.has_role;
      if (!hasRole) {
        logger.warn('Role check failed', {
          userId,
          requiredRoles: roles,
          ip: req.ip
        });
        return res.status(403).json({
          success: false,
          error: 'Forbidden: Required role not found',
          required_roles: roles
        });
      }
      next();
    } catch (error) {
      logger.error('Role check failed', error);
      res.status(500).json({
        success: false,
        error: 'Role check failed'
      });
    }
  };
};
module.exports = {
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireRole
};