/**
 * Role & Permission Management Routes
 * Created by: Agent 1 (Backend Developer)
 * Date: October 21, 2025
 */

const express = require('express');
const router = express.Router();
const {
  body,
  param,
  query,
  validationResult
} = require('express-validator');
const {
  query: dbQuery
} = require('../config/database');
const {
  verifyToken: authenticate
} = require('../middleware/auth');
const {
  requirePermission,
  requireRole
} = require('../middleware/permissions');
const logger = require('../utils/logger');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

// ============================================
// PERMISSIONS
// ============================================

/**
 * GET /api/roles/permissions
 * List all permissions
 */
router.get('/permissions', authenticate, requirePermission('roles.read'), async (req, res) => {
  try {
    const result = await dbQuery(`
        SELECT 
          id, name, display_name, description,
          resource, action, created_at
        FROM permissions
        ORDER BY resource, action
      `);

    // Group by resource
    const grouped = result.rows.reduce((acc, perm) => {
      if (!acc[perm.resource]) {
        acc[perm.resource] = [];
      }
      acc[perm.resource].push(perm);
      return acc;
    }, {});
    res.json({
      success: true,
      data: {
        all: result.rows,
        grouped
      }
    });
  } catch (error) {
    logger.error('Failed to list permissions', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list permissions'
    });
  }
});

// ============================================
// ROLES
// ============================================

/**
 * GET /api/roles
 * List all roles
 */
router.get('/', authenticate, requirePermission('roles.read'), [query('tenantId').optional().isUUID(), query('includeSystem').optional().isBoolean()], validate, async (req, res) => {
  try {
    const {
      tenantId,
      includeSystem
    } = req.query;
    let whereClause = 'WHERE is_active = true';
    const params = [];
    let paramCount = 0;
    if (tenantId) {
      whereClause += ` AND (tenant_id = $${++paramCount} OR is_system = true)`;
      params.push(tenantId);
    } else if (includeSystem !== 'true') {
      whereClause += ` AND tenant_id = $${++paramCount}`;
      params.push(req.user.tenantId);
    }
    const result = await dbQuery(`
        SELECT 
          r.*,
          COUNT(DISTINCT ur.user_id) as user_count,
          COUNT(DISTINCT rp.permission_id) as permission_count
        FROM roles r
        LEFT JOIN user_roles ur ON r.id = ur.role_id
        LEFT JOIN role_permissions rp ON r.id = rp.role_id
        ${whereClause}
        GROUP BY r.id
        ORDER BY r.is_system DESC, r.created_at DESC
      `, params);
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    logger.error('Failed to list roles', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list roles'
    });
  }
});

/**
 * GET /api/roles/:id
 * Get role details with permissions
 */
router.get('/:id', authenticate, requirePermission('roles.read'), [param('id').isUUID()], validate, async (req, res) => {
  try {
    const {
      id
    } = req.params;

    // Get role
    const roleResult = await dbQuery(`
        SELECT * FROM roles WHERE id = $1
      `, [id]);
    if (roleResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }
    const role = roleResult.rows[0];

    // Get permissions
    const permissionsResult = await dbQuery(`
        SELECT p.*
        FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permission_id
        WHERE rp.role_id = $1
        ORDER BY p.resource, p.action
      `, [id]);

    // Get users with this role
    const usersResult = await dbQuery(`
        SELECT 
          u.id, u.email, u.first_name, u.last_name,
          ur.assigned_at, ur.expires_at
        FROM users u
        JOIN user_roles ur ON u.id = ur.user_id
        WHERE ur.role_id = $1
        ORDER BY ur.assigned_at DESC
      `, [id]);
    res.json({
      success: true,
      data: {
        ...role,
        permissions: permissionsResult.rows,
        users: usersResult.rows
      }
    });
  } catch (error) {
    logger.error('Failed to get role details', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get role details'
    });
  }
});

/**
 * POST /api/roles
 * Create custom role
 */
router.post('/', authenticate, requirePermission('roles.create'), [body('name').trim().isLength({
  min: 2,
  max: 100
}).withMessage('Name required (2-100 chars)'), body('displayName').trim().isLength({
  min: 2,
  max: 255
}).withMessage('Display name required'), body('description').optional().isString(), body('permissionIds').isArray().withMessage('Permission IDs array required')], validate, async (req, res) => {
  try {
    const {
      name,
      displayName,
      description,
      permissionIds
    } = req.body;
    const tenantId = req.user.tenantId;

    // Check if role name already exists for tenant
    const existingRole = await dbQuery(`
        SELECT id FROM roles
        WHERE tenant_id = $1 AND name = $2
      `, [tenantId, name]);
    if (existingRole.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Role name already exists for this tenant'
      });
    }

    // Create role
    const roleResult = await dbQuery(`
        INSERT INTO roles (tenant_id, name, display_name, description, is_system)
        VALUES ($1, $2, $3, $4, false)
        RETURNING *
      `, [tenantId, name, displayName, description]);
    const role = roleResult.rows[0];

    // Assign permissions
    if (permissionIds && permissionIds.length > 0) {
      const values = permissionIds.map((permId, idx) => `($1, $${idx + 2})`).join(', ');
      await dbQuery(`
          INSERT INTO role_permissions (role_id, permission_id)
          VALUES ${values}
          ON CONFLICT (role_id, permission_id) DO NOTHING
        `, [role.id, ...permissionIds]);
    }
    logger.info('Custom role created', {
      roleId: role.id,
      name,
      tenantId,
      createdBy: req.user.id
    });
    res.status(201).json({
      success: true,
      data: role
    });
  } catch (error) {
    logger.error('Failed to create role', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create role'
    });
  }
});

/**
 * PUT /api/roles/:id
 * Update role
 */
router.put('/:id', authenticate, requirePermission('roles.update'), [param('id').isUUID(), body('displayName').optional().trim().isLength({
  min: 2,
  max: 255
}), body('description').optional().isString(), body('permissionIds').optional().isArray()], validate, async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const {
      displayName,
      description,
      permissionIds
    } = req.body;

    // Check if role exists and is not system role
    const roleCheck = await dbQuery(`
        SELECT is_system FROM roles WHERE id = $1
      `, [id]);
    if (roleCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }
    if (roleCheck.rows[0].is_system) {
      return res.status(403).json({
        success: false,
        error: 'Cannot modify system roles'
      });
    }

    // Update role
    const updates = [];
    const values = [id];
    let paramCount = 1;
    if (displayName) {
      updates.push(`display_name = $${++paramCount}`);
      values.push(displayName);
    }
    if (description !== undefined) {
      updates.push(`description = $${++paramCount}`);
      values.push(description);
    }
    if (updates.length > 0) {
      updates.push(`updated_at = NOW()`);
      await dbQuery(`
          UPDATE roles
          SET ${updates.join(', ')}
          WHERE id = $1
        `, values);
    }

    // Update permissions if provided
    if (permissionIds) {
      // Remove old permissions
      await dbQuery(`
          DELETE FROM role_permissions WHERE role_id = $1
        `, [id]);

      // Add new permissions
      if (permissionIds.length > 0) {
        const permValues = permissionIds.map((permId, idx) => `($1, $${idx + 2})`).join(', ');
        await dbQuery(`
            INSERT INTO role_permissions (role_id, permission_id)
            VALUES ${permValues}
          `, [id, ...permissionIds]);
      }
    }

    // Get updated role
    const result = await dbQuery(`
        SELECT * FROM roles WHERE id = $1
      `, [id]);
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Failed to update role', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update role'
    });
  }
});

/**
 * DELETE /api/roles/:id
 * Delete role
 */
router.delete('/:id', authenticate, requirePermission('roles.delete'), [param('id').isUUID()], validate, async (req, res) => {
  try {
    const {
      id
    } = req.params;

    // Check if role exists and is not system role
    const roleCheck = await dbQuery(`
        SELECT is_system, name FROM roles WHERE id = $1
      `, [id]);
    if (roleCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }
    if (roleCheck.rows[0].is_system) {
      return res.status(403).json({
        success: false,
        error: 'Cannot delete system roles'
      });
    }

    // Soft delete (deactivate)
    await dbQuery(`
        UPDATE roles
        SET is_active = false, updated_at = NOW()
        WHERE id = $1
      `, [id]);
    logger.info('Role deleted', {
      roleId: id,
      roleName: roleCheck.rows[0].name,
      deletedBy: req.user.id
    });
    res.json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete role', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete role'
    });
  }
});

// ============================================
// USER ROLE ASSIGNMENTS
// ============================================

/**
 * POST /api/roles/:id/assign
 * Assign role to user
 */
router.post('/:id/assign', authenticate, requirePermission('roles.assign'), [param('id').isUUID().withMessage('Valid role ID required'), body('userId').isUUID().withMessage('Valid user ID required'), body('expiresAt').optional().isISO8601()], validate, async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const {
      userId,
      expiresAt
    } = req.body;

    // Check if role exists
    const roleCheck = await dbQuery(`
        SELECT * FROM roles WHERE id = $1 AND is_active = true
      `, [id]);
    if (roleCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }

    // Check if user exists
    const userCheck = await dbQuery(`
        SELECT id FROM users WHERE id = $1
      `, [userId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Assign role
    await dbQuery(`
        INSERT INTO user_roles (user_id, role_id, assigned_by, expires_at)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id, role_id) DO UPDATE
        SET assigned_by = $3, assigned_at = NOW(), expires_at = $4
      `, [userId, id, req.user.id, expiresAt || null]);
    logger.info('Role assigned to user', {
      roleId: id,
      userId,
      assignedBy: req.user.id
    });
    res.json({
      success: true,
      message: 'Role assigned successfully'
    });
  } catch (error) {
    logger.error('Failed to assign role', error);
    res.status(500).json({
      success: false,
      error: 'Failed to assign role'
    });
  }
});

/**
 * DELETE /api/roles/:id/revoke/:userId
 * Revoke role from user
 */
router.delete('/:id/revoke/:userId', authenticate, requirePermission('roles.assign'), [param('id').isUUID(), param('userId').isUUID()], validate, async (req, res) => {
  try {
    const {
      id,
      userId
    } = req.params;
    await dbQuery(`
        DELETE FROM user_roles
        WHERE role_id = $1 AND user_id = $2
      `, [id, userId]);
    logger.info('Role revoked from user', {
      roleId: id,
      userId,
      revokedBy: req.user.id
    });
    res.json({
      success: true,
      message: 'Role revoked successfully'
    });
  } catch (error) {
    logger.error('Failed to revoke role', error);
    res.status(500).json({
      success: false,
      error: 'Failed to revoke role'
    });
  }
});

/**
 * GET /api/roles/user/:userId
 * Get user's roles and permissions
 */
router.get('/user/:userId', authenticate, [param('userId').isUUID()], validate, async (req, res) => {
  try {
    const {
      userId
    } = req.params;

    // Authorization: users can view their own, admins can view anyone's
    if (req.user.id !== userId && req.user.role !== 'super_admin') {
      const hasPermission = await dbQuery('SELECT user_has_permission($1, $2) as has_permission', [req.user.id, 'users.read']);
      if (!hasPermission.rows[0]?.has_permission) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden'
        });
      }
    }

    // Get roles
    const rolesResult = await dbQuery(`
        SELECT r.*, ur.assigned_at, ur.expires_at
        FROM roles r
        JOIN user_roles ur ON r.id = ur.role_id
        WHERE ur.user_id = $1
        AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
        ORDER BY r.is_system DESC, r.created_at DESC
      `, [userId]);

    // Get permissions
    const permissionsResult = await dbQuery(`
        SELECT * FROM get_user_permissions($1)
      `, [userId]);
    res.json({
      success: true,
      data: {
        roles: rolesResult.rows,
        permissions: permissionsResult.rows
      }
    });
  } catch (error) {
    logger.error('Failed to get user roles', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user roles'
    });
  }
});
module.exports = router;