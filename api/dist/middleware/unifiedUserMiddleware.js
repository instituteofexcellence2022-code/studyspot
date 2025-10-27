/**
 * Unified User Middleware
 * 
 * Consolidates user/student/staff operations into a single unified system
 * Replaces separate endpoints for users, students, and staff
 */

const {
  query
} = require('../config/database');
const {
  AppError,
  asyncHandler
} = require('./errorHandler');
const {
  logger
} = require('../utils/logger');
const QueryBuilder = require('../utils/queryBuilder');
const {
  validatePagination,
  validateEnum,
  validateRequired,
  validateEmail
} = require('../utils/validators');
const {
  formatPaginatedResponse,
  formatSingleResponse
} = require('../utils/responseFormatter');
const ERROR_CODES = require('../constants/errorCodes');

/**
 * Unified getUsers handler
 * Supports filtering by role (student, staff, all)
 */
const unifiedGetUsers = asyncHandler(async (req, res) => {
  const {
    role,
    // Filter by role: 'student', 'staff', 'admin', etc.
    page,
    limit,
    search,
    status,
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = req.query;

  // Validate pagination
  const {
    page: validatedPage,
    limit: validatedLimit
  } = validatePagination(page, limit);
  const offset = (validatedPage - 1) * validatedLimit;
  const tenantId = req.user.tenantId;

  // Build WHERE clause using QueryBuilder
  const queryBuilder = new QueryBuilder('u', tenantId);
  if (role) {
    queryBuilder.whereEquals('role', role);
  }
  if (status) {
    queryBuilder.whereEquals('status', status);
  }

  // Search across multiple fields
  if (search) {
    queryBuilder.whereCustom('(u.email ILIKE ? OR u.first_name ILIKE ? OR u.last_name ILIKE ? OR u.phone ILIKE ?)', [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`]);
  }
  const {
    whereClause,
    params
  } = queryBuilder.build();

  // Get users with pagination
  const usersQuery = `
    SELECT 
      id, email, first_name, last_name, phone, role, status,
      kyc_status, last_login, created_at, updated_at
    FROM users u
    WHERE ${whereClause}
    ORDER BY ${sortBy} ${sortOrder}
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;
  const users = await query(usersQuery, [...params, validatedLimit, offset]);

  // Get total count
  const countQuery = `SELECT COUNT(*) as total FROM users u WHERE ${whereClause}`;
  const countResult = await query(countQuery, params);
  const total = parseInt(countResult.rows[0].total);
  const meta = {
    pagination: {
      page: validatedPage,
      limit: validatedLimit,
      total,
      totalPages: Math.ceil(total / validatedLimit)
    },
    filters: {
      role: role || 'all',
      search: search || null,
      status: status || null
    }
  };
  const data = users.rows.map(user => ({
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    phone: user.phone,
    role: user.role,
    status: user.status,
    kycStatus: user.kyc_status,
    lastLogin: user.last_login,
    createdAt: user.created_at,
    updatedAt: user.updated_at
  }));
  res.json(formatPaginatedResponse(data, meta, req));
});

/**
 * Unified createUser handler
 * Supports role parameter for creating students, staff, etc.
 */
const unifiedCreateUser = asyncHandler(async (req, res) => {
  const {
    email,
    password,
    firstName,
    lastName,
    phone,
    role = 'student',
    // Default role
    status = 'active'
  } = req.body;

  // Validate required fields
  validateRequired({
    email,
    firstName,
    lastName
  }, ['email', 'firstName', 'lastName']);

  // Validate email format
  if (!validateEmail(email)) {
    throw new AppError('Invalid email format', 400, ERROR_CODES.VALIDATION.INVALID_EMAIL);
  }

  // Validate role
  validateEnum(role, ['student', 'staff', 'admin', 'library_owner', 'library_staff', 'super_admin'], 'Role');

  // Check if user already exists
  const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existingUser.rows.length > 0) {
    throw new AppError('User already exists with this email', 409, ERROR_CODES.CONFLICT.EMAIL_ALREADY_EXISTS);
  }

  // Hash password if provided
  const bcrypt = require('bcryptjs');
  const hashedPassword = password ? await bcrypt.hash(password, 12) : null;

  // Create user
  const createQuery = `
    INSERT INTO users (
      email, password, first_name, last_name, phone, role, status, tenant_id
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id, email, first_name, last_name, phone, role, status, created_at
  `;
  const result = await query(createQuery, [email, hashedPassword, firstName, lastName, phone || null, role, status, req.user.tenantId]);
  const user = result.rows[0];

  // Log user creation
  logger.logBusinessEvent('user_created', {
    userId: user.id,
    email: user.email,
    role: user.role,
    tenantId: req.user.tenantId
  });
  const data = {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    phone: user.phone,
    role: user.role,
    status: user.status,
    createdAt: user.created_at
  };
  res.status(201).json(formatSingleResponse(data));
});

/**
 * Unified updateUser handler
 */
const unifiedUpdateUser = asyncHandler(async (req, res) => {
  const {
    userId
  } = req.params;
  const {
    firstName,
    lastName,
    phone,
    role,
    status
  } = req.body;

  // Build update fields
  const updateFields = [];
  const updateValues = [];
  let paramCount = 1;
  if (firstName !== undefined) {
    updateFields.push(`first_name = $${paramCount++}`);
    updateValues.push(firstName);
  }
  if (lastName !== undefined) {
    updateFields.push(`last_name = $${paramCount++}`);
    updateValues.push(lastName);
  }
  if (phone !== undefined) {
    updateFields.push(`phone = $${paramCount++}`);
    updateValues.push(phone);
  }
  if (role !== undefined) {
    validateEnum(role, ['student', 'staff', 'admin', 'library_owner', 'library_staff', 'super_admin'], 'Role');
    updateFields.push(`role = $${paramCount++}`);
    updateValues.push(role);
  }
  if (status !== undefined) {
    validateEnum(status, ['active', 'inactive', 'suspended'], 'Status');
    updateFields.push(`status = $${paramCount++}`);
    updateValues.push(status);
  }
  if (updateFields.length === 0) {
    throw new AppError('No fields to update', 400, ERROR_CODES.VALIDATION.INVALID_INPUT);
  }

  // Always update updated_at
  updateFields.push('updated_at = NOW()');
  updateValues.push(userId, req.user.tenantId);
  const updateQuery = `
    UPDATE users 
    SET ${updateFields.join(', ')}
    WHERE id = $${paramCount} AND tenant_id = $${paramCount + 1}
    RETURNING id, email, first_name, last_name, phone, role, status, updated_at
  `;
  const result = await query(updateQuery, updateValues);
  if (result.rows.length === 0) {
    throw new AppError('User not found', 404, ERROR_CODES.NOT_FOUND.USER);
  }
  const user = result.rows[0];

  // Log update
  logger.logBusinessEvent('user_updated', {
    userId: user.id,
    updatedFields: Object.keys(req.body),
    tenantId: req.user.tenantId
  });
  const data = {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    phone: user.phone,
    role: user.role,
    status: user.status,
    updatedAt: user.updated_at
  };
  res.json(formatSingleResponse(data));
});

/**
 * Unified deleteUser handler (soft delete)
 */
const unifiedDeleteUser = asyncHandler(async (req, res) => {
  const {
    userId
  } = req.params;

  // Soft delete by updating status
  const deleteQuery = `
    UPDATE users 
    SET status = 'inactive', updated_at = NOW()
    WHERE id = $1 AND tenant_id = $2
    RETURNING id, email, role
  `;
  const result = await query(deleteQuery, [userId, req.user.tenantId]);
  if (result.rows.length === 0) {
    throw new AppError('User not found', 404, ERROR_CODES.NOT_FOUND.USER);
  }
  const user = result.rows[0];

  // Log deletion
  logger.logBusinessEvent('user_deleted', {
    userId: user.id,
    email: user.email,
    role: user.role,
    tenantId: req.user.tenantId
  });
  const data = {
    message: 'User deleted successfully',
    userId: user.id
  };
  res.json(formatSingleResponse(data));
});
module.exports = {
  unifiedGetUsers,
  unifiedCreateUser,
  unifiedUpdateUser,
  unifiedDeleteUser
};