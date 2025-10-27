/**
 * Unified Users API Route
 * 
 * Consolidates:
 * - /api/users (general user management)
 * - /api/students (student-specific management)
 * - /api/staff (staff-specific management)
 * 
 * Single endpoint with role-based filtering
 */

const express = require('express');
const {
  body,
  validationResult
} = require('express-validator');
const {
  unifiedGetUsers,
  unifiedCreateUser,
  unifiedUpdateUser,
  unifiedDeleteUser
} = require('../middleware/unifiedUserMiddleware');
const {
  verifyToken,
  authorize,
  setTenantContext
} = require('../middleware/auth');
const {
  AppError,
  asyncHandler
} = require('../middleware/errorHandler');
const router = express.Router();

// Apply authentication and tenant context to all routes
router.use(verifyToken);
router.use(setTenantContext);

/**
 * GET /api/v2/users
 * Unified endpoint for getting users, students, or staff
 * 
 * Query Parameters:
 * - role: Filter by role ('student', 'staff', 'admin', etc.)
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20)
 * - search: Search term for email, name, phone
 * - status: Filter by status ('active', 'inactive', etc.)
 * - sortBy: Sort field (default: 'created_at')
 * - sortOrder: Sort order ('asc' or 'desc', default: 'desc')
 * 
 * Examples:
 * - GET /api/v2/users - Get all users
 * - GET /api/v2/users?role=student - Get all students
 * - GET /api/v2/users?role=staff - Get all staff
 * - GET /api/v2/users?role=student&search=john - Search students
 * - GET /api/v2/users?role=staff&page=2&limit=10 - Paginated staff
 */
router.get('/', authorize('super_admin', 'branch_manager', 'library_owner'), unifiedGetUsers);

/**
 * GET /api/v2/users/:userId
 * Get specific user by ID
 */
router.get('/:userId', authorize('super_admin', 'branch_manager', 'library_owner'), asyncHandler(async (req, res) => {
  const {
    userId
  } = req.params;
  const {
    query
  } = require('../config/database');
  const {
    AppError
  } = require('../middleware/errorHandler');
  const userResult = await query(`
    SELECT 
      id, email, first_name, last_name, phone, role, status,
      profile_image_url, kyc_status, last_login, created_at, updated_at
    FROM users
    WHERE id = $1 AND tenant_id = $2
  `, [userId, req.user.tenantId]);
  if (userResult.rows.length === 0) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }
  const user = userResult.rows[0];
  res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      role: user.role,
      status: user.status,
      profileImageUrl: user.profile_image_url,
      kycStatus: user.kyc_status,
      lastLogin: user.last_login,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

/**
 * POST /api/v2/users
 * Create new user (student, staff, or any role)
 * 
 * Body Parameters:
 * - email: User email (required)
 * - password: User password (optional, for self-service)
 * - firstName: First name (required)
 * - lastName: Last name (required)
 * - phone: Phone number (optional)
 * - role: User role ('student', 'staff', etc.) (optional, default: 'student')
 * - status: User status (optional, default: 'active')
 * 
 * Examples:
 * - POST /api/v2/users { ..., role: 'student' } - Create student
 * - POST /api/v2/users { ..., role: 'staff' } - Create staff
 */
router.post('/', authorize('super_admin', 'branch_manager', 'library_owner'), [body('email').isEmail().normalizeEmail().withMessage('Valid email is required'), body('firstName').trim().isLength({
  min: 1
}).withMessage('First name is required'), body('lastName').trim().isLength({
  min: 1
}).withMessage('Last name is required'), body('password').optional().isLength({
  min: 8
}).withMessage('Password must be at least 8 characters'), body('phone').optional().isMobilePhone().withMessage('Valid phone number required'), body('role').optional().isIn(['student', 'staff', 'library_staff', 'library_owner', 'branch_manager']).withMessage('Invalid role'), body('status').optional().isIn(['active', 'inactive', 'suspended']).withMessage('Invalid status')], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }
  return unifiedCreateUser(req, res);
}));

/**
 * PUT /api/v2/users/:userId
 * Update user information
 * 
 * Body Parameters:
 * - firstName: First name (optional)
 * - lastName: Last name (optional)
 * - phone: Phone number (optional)
 * - role: User role (optional)
 * - status: User status (optional)
 */
router.put('/:userId', authorize('super_admin', 'branch_manager', 'library_owner'), [body('firstName').optional().trim().isLength({
  min: 1
}), body('lastName').optional().trim().isLength({
  min: 1
}), body('phone').optional().isMobilePhone(), body('role').optional().isIn(['student', 'staff', 'library_staff', 'library_owner', 'branch_manager']), body('status').optional().isIn(['active', 'inactive', 'suspended'])], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }
  return unifiedUpdateUser(req, res);
}));

/**
 * DELETE /api/v2/users/:userId
 * Soft delete user (set status to inactive)
 */
router.delete('/:userId', authorize('super_admin', 'branch_manager'), unifiedDeleteUser);

/**
 * Convenience Routes for Backward Compatibility
 * These routes redirect to the unified endpoint with role filters
 */

/**
 * GET /api/v2/users/students
 * Get all students (convenience route)
 */
router.get('/students/list', authorize('super_admin', 'branch_manager', 'library_owner'), (req, res, next) => {
  req.query.role = 'student';
  return unifiedGetUsers(req, res, next);
});

/**
 * GET /api/v2/users/staff
 * Get all staff (convenience route)
 */
router.get('/staff/list', authorize('super_admin', 'branch_manager', 'library_owner'), (req, res, next) => {
  req.query.role = 'staff';
  return unifiedGetUsers(req, res, next);
});
module.exports = router;