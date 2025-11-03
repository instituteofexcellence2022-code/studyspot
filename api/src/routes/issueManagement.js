/**
 * Issue Management System API Routes
 * Comprehensive issue tracking and management for library owners
 */

const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { query: dbQuery } = require('../config/database');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { verifyToken: auth } = require('../middleware/auth');
const { logger } = require('../utils/logger');

const router = express.Router();

// ============================================
// HELPER FUNCTIONS
// ============================================

// Calculate SLA deadline based on priority
const calculateSLADeadline = (priorityLevel, reportedAt) => {
  const slaHours = {
    1: 2,   // Critical: 2 hours
    2: 8,   // High: 8 hours
    3: 24,  // Medium: 24 hours
    4: 72   // Low: 72 hours
  };
  
  const hours = slaHours[priorityLevel] || 24;
  const deadline = new Date(reportedAt);
  deadline.setHours(deadline.getHours() + hours);
  return deadline;
};

// Check for duplicate issues
const findDuplicateIssues = async (title, description, tenantId, libraryId) => {
  const similarIssues = await dbQuery(`
    SELECT id, title, description, student_count, status_id, created_at
    FROM issues 
    WHERE tenant_id = $1 
    AND (library_id = $2 OR library_id IS NULL)
    AND status_id NOT IN (
      SELECT id FROM issue_statuses WHERE is_final = true
    )
    AND (
      similarity(title, $3) > 0.6 
      OR similarity(description, $4) > 0.6
    )
    ORDER BY created_at DESC
    LIMIT 5
  `, [tenantId, libraryId, title, description]);
  
  return similarIssues.rows;
};

// ============================================
// ISSUE CATEGORIES
// ============================================

// Get all issue categories
router.get('/categories', auth, asyncHandler(async (req, res) => {
  const result = await dbQuery(`
    SELECT id, name, display_name, description, icon, color, is_active
    FROM issue_categories 
    WHERE is_active = true
    ORDER BY name
  `);
  
  res.json({
    success: true,
    data: result.rows,
    meta: {
      timestamp: new Date().toISOString(),
      count: result.rows.length
    }
  });
}));

// ============================================
// ISSUE PRIORITIES
// ============================================

// Get all issue priorities
router.get('/priorities', auth, asyncHandler(async (req, res) => {
  const result = await dbQuery(`
    SELECT id, name, display_name, level, color, sla_hours, is_active
    FROM issue_priorities 
    WHERE is_active = true
    ORDER BY level ASC
  `);
  
  res.json({
    success: true,
    data: result.rows,
    meta: {
      timestamp: new Date().toISOString(),
      count: result.rows.length
    }
  });
}));

// ============================================
// ISSUE STATUSES
// ============================================

// Get all issue statuses
router.get('/statuses', auth, asyncHandler(async (req, res) => {
  const result = await dbQuery(`
    SELECT id, name, display_name, description, color, is_final, is_active
    FROM issue_statuses 
    WHERE is_active = true
    ORDER BY 
      CASE name
        WHEN 'open' THEN 1
        WHEN 'assigned' THEN 2
        WHEN 'in_progress' THEN 3
        WHEN 'pending_feedback' THEN 4
        WHEN 'resolved' THEN 5
        WHEN 'closed' THEN 6
        WHEN 'cancelled' THEN 7
        ELSE 8
      END
  `);
  
  res.json({
    success: true,
    data: result.rows,
    meta: {
      timestamp: new Date().toISOString(),
      count: result.rows.length
    }
  });
}));

// ============================================
// ISSUES CRUD
// ============================================

// Get all issues with filtering and pagination
router.get('/', auth, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isString(),
  query('priority').optional().isString(),
  query('category').optional().isString(),
  query('assigned_to').optional().isUUID(),
  query('library_id').optional().isUUID(),
  query('search').optional().isString(),
  query('sort_by').optional().isIn(['created_at', 'updated_at', 'priority', 'status']),
  query('sort_order').optional().isIn(['asc', 'desc'])
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }

  const {
    page = 1,
    limit = 20,
    status,
    priority,
    category,
    assigned_to,
    library_id,
    search,
    sort_by = 'created_at',
    sort_order = 'desc'
  } = req.query;

  const offset = (page - 1) * limit;
  const tenantId = req.user.tenantId;

  // Build WHERE clause
  let whereClause = 'WHERE i.tenant_id = $1';
  const queryParams = [tenantId];
  let paramIndex = 2;

  if (status) {
    whereClause += ` AND s.name = $${paramIndex}`;
    queryParams.push(status);
    paramIndex++;
  }

  if (priority) {
    whereClause += ` AND p.name = $${paramIndex}`;
    queryParams.push(priority);
    paramIndex++;
  }

  if (category) {
    whereClause += ` AND c.name = $${paramIndex}`;
    queryParams.push(category);
    paramIndex++;
  }

  if (assigned_to) {
    whereClause += ` AND i.assigned_to_user_id = $${paramIndex}`;
    queryParams.push(assigned_to);
    paramIndex++;
  }

  if (library_id) {
    whereClause += ` AND i.library_id = $${paramIndex}`;
    queryParams.push(library_id);
    paramIndex++;
  }

  if (search) {
    whereClause += ` AND (i.title ILIKE $${paramIndex} OR i.description ILIKE $${paramIndex})`;
    queryParams.push(`%${search}%`);
    paramIndex++;
  }

  // Build ORDER BY clause
  const orderBy = `ORDER BY i.${sort_by} ${sort_order.toUpperCase()}`;

  const result = await dbQuery(`
    SELECT 
      i.*,
      c.name as category_name,
      c.display_name as category_display_name,
      c.icon as category_icon,
      c.color as category_color,
      p.name as priority_name,
      p.display_name as priority_display_name,
      p.level as priority_level,
      p.color as priority_color,
      p.sla_hours,
      s.name as status_name,
      s.display_name as status_display_name,
      s.color as status_color,
      s.is_final as status_is_final,
      u1.first_name as assigned_to_first_name,
      u1.last_name as assigned_to_last_name,
      u1.email as assigned_to_email,
      u2.first_name as reported_by_first_name,
      u2.last_name as reported_by_last_name,
      u2.email as reported_by_email,
      l.name as library_name,
      CASE 
        WHEN i.sla_deadline < NOW() AND s.is_final = false THEN true
        ELSE false
      END as is_overdue
    FROM issues i
    LEFT JOIN issue_categories c ON i.category_id = c.id
    LEFT JOIN issue_priorities p ON i.priority_id = p.id
    LEFT JOIN issue_statuses s ON i.status_id = s.id
    LEFT JOIN users u1 ON i.assigned_to_user_id = u1.id
    LEFT JOIN users u2 ON i.reported_by_user_id = u2.id
    LEFT JOIN libraries l ON i.library_id = l.id
    ${whereClause}
    ${orderBy}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `, [...queryParams, limit, offset]);

  // Get total count
  const countResult = await dbQuery(`
    SELECT COUNT(*) as total
    FROM issues i
    LEFT JOIN issue_categories c ON i.category_id = c.id
    LEFT JOIN issue_priorities p ON i.priority_id = p.id
    LEFT JOIN issue_statuses s ON i.status_id = s.id
    ${whereClause}
  `, queryParams);

  const total = parseInt(countResult.rows[0].total);
  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: result.rows,
    meta: {
      timestamp: new Date().toISOString(),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
  });
}));

// Get single issue by ID
router.get('/:id', auth, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const tenantId = req.user.tenantId;

  const result = await dbQuery(`
    SELECT 
      i.*,
      c.name as category_name,
      c.display_name as category_display_name,
      c.icon as category_icon,
      c.color as category_color,
      p.name as priority_name,
      p.display_name as priority_display_name,
      p.level as priority_level,
      p.color as priority_color,
      p.sla_hours,
      s.name as status_name,
      s.display_name as status_display_name,
      s.color as status_color,
      s.is_final as status_is_final,
      u1.first_name as assigned_to_first_name,
      u1.last_name as assigned_to_last_name,
      u1.email as assigned_to_email,
      u2.first_name as reported_by_first_name,
      u2.last_name as reported_by_last_name,
      u2.email as reported_by_email,
      l.name as library_name,
      CASE 
        WHEN i.sla_deadline < NOW() AND s.is_final = false THEN true
        ELSE false
      END as is_overdue
    FROM issues i
    LEFT JOIN issue_categories c ON i.category_id = c.id
    LEFT JOIN issue_priorities p ON i.priority_id = p.id
    LEFT JOIN issue_statuses s ON i.status_id = s.id
    LEFT JOIN users u1 ON i.assigned_to_user_id = u1.id
    LEFT JOIN users u2 ON i.reported_by_user_id = u2.id
    LEFT JOIN libraries l ON i.library_id = l.id
    WHERE i.id = $1 AND i.tenant_id = $2
  `, [id, tenantId]);

  if (result.rows.length === 0) {
    throw new AppError('Issue not found', 404, 'ISSUE_NOT_FOUND');
  }

  res.json({
    success: true,
    data: result.rows[0],
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Create new issue
router.post('/', auth, [
  body('title').trim().isLength({ min: 1, max: 255 }).withMessage('Title is required'),
  body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
  body('category_id').isUUID().withMessage('Valid category ID is required'),
  body('priority_id').isUUID().withMessage('Valid priority ID is required'),
  body('library_id').optional().isUUID(),
  body('reported_by_name').optional().isString(),
  body('reported_by_email').optional().isEmail(),
  body('reported_by_phone').optional().isString(),
  body('student_count').optional().isInt({ min: 1 }),
  body('tags').optional().isArray(),
  body('attachments').optional().isArray()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }

  const {
    title,
    description,
    category_id,
    priority_id,
    library_id,
    reported_by_name,
    reported_by_email,
    reported_by_phone,
    student_count = 1,
    tags = [],
    attachments = []
  } = req.body;

  const tenantId = req.user.tenantId;
  const reportedAt = new Date();

  // Get priority level for SLA calculation
  const priorityResult = await dbQuery(
    'SELECT level FROM issue_priorities WHERE id = $1',
    [priority_id]
  );

  if (priorityResult.rows.length === 0) {
    throw new AppError('Invalid priority ID', 400, 'INVALID_PRIORITY');
  }

  const priorityLevel = priorityResult.rows[0].level;
  const slaDeadline = calculateSLADeadline(priorityLevel, reportedAt);

  // Get default "open" status
  const statusResult = await dbQuery(
    "SELECT id FROM issue_statuses WHERE name = 'open'"
  );

  if (statusResult.rows.length === 0) {
    throw new AppError('Default status not found', 500, 'STATUS_NOT_FOUND');
  }

  const statusId = statusResult.rows[0].id;

  // Check for duplicate issues
  const duplicates = await findDuplicateIssues(title, description, tenantId, library_id);

  // Create the issue
  const result = await dbQuery(`
    INSERT INTO issues (
      tenant_id, library_id, title, description, category_id, priority_id, status_id,
      reported_by_user_id, reported_by_name, reported_by_email, reported_by_phone,
      student_count, sla_deadline, tags, attachments, reported_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
    ) RETURNING *
  `, [
    tenantId, library_id, title, description, category_id, priority_id, statusId,
    req.user.id, reported_by_name, reported_by_email, reported_by_phone,
    student_count, slaDeadline, tags, JSON.stringify(attachments), reportedAt
  ]);

  const issue = result.rows[0];

  // Log the issue creation
  logger.info('Issue created', {
    issueId: issue.id,
    title: issue.title,
    category: category_id,
    priority: priority_id,
    tenantId,
    userId: req.user.id
  });

  res.status(201).json({
    success: true,
    data: {
      issue: issue,
      duplicates: duplicates,
      message: duplicates.length > 0 ? 
        'Issue created. Similar issues found - consider merging.' : 
        'Issue created successfully'
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Update issue
router.put('/:id', auth, [
  body('title').optional().trim().isLength({ min: 1, max: 255 }),
  body('description').optional().trim().isLength({ min: 1 }),
  body('category_id').optional().isUUID(),
  body('priority_id').optional().isUUID(),
  body('status_id').optional().isUUID(),
  body('assigned_to_user_id').optional().isUUID(),
  body('student_count').optional().isInt({ min: 1 }),
  body('tags').optional().isArray(),
  body('attachments').optional().isArray(),
  body('satisfaction_rating').optional().isInt({ min: 1, max: 5 }),
  body('satisfaction_feedback').optional().isString()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }

  const { id } = req.params;
  const tenantId = req.user.tenantId;
  const updateData = req.body;

  // Check if issue exists
  const existingIssue = await dbQuery(
    'SELECT * FROM issues WHERE id = $1 AND tenant_id = $2',
    [id, tenantId]
  );

  if (existingIssue.rows.length === 0) {
    throw new AppError('Issue not found', 404, 'ISSUE_NOT_FOUND');
  }

  const currentIssue = existingIssue.rows[0];

  // Build update query dynamically
  const updateFields = [];
  const updateValues = [];
  let paramIndex = 1;

  Object.keys(updateData).forEach(key => {
    if (updateData[key] !== undefined) {
      updateFields.push(`${key} = $${paramIndex}`);
      updateValues.push(updateData[key]);
      paramIndex++;
    }
  });

  if (updateFields.length === 0) {
    throw new AppError('No fields to update', 400, 'NO_UPDATE_FIELDS');
  }

  // Add updated_at
  updateFields.push(`updated_at = NOW()`);

  // Handle status changes
  if (updateData.status_id) {
    const statusResult = await dbQuery(
      'SELECT name, is_final FROM issue_statuses WHERE id = $1',
      [updateData.status_id]
    );

    if (statusResult.rows.length > 0) {
      const status = statusResult.rows[0];
      
      if (status.name === 'assigned' && !currentIssue.assigned_at) {
        updateFields.push('assigned_at = NOW()');
      }
      
      if (status.name === 'resolved' && !currentIssue.resolved_at) {
        updateFields.push('resolved_at = NOW()');
      }
      
      if (status.is_final && !currentIssue.closed_at) {
        updateFields.push('closed_at = NOW()');
      }
    }
  }

  // Handle satisfaction rating
  if (updateData.satisfaction_rating) {
    updateFields.push('satisfaction_submitted_at = NOW()');
  }

  updateValues.push(id, tenantId);

  const result = await dbQuery(`
    UPDATE issues 
    SET ${updateFields.join(', ')}
    WHERE id = $${paramIndex} AND tenant_id = $${paramIndex + 1}
    RETURNING *
  `, updateValues);

  const updatedIssue = result.rows[0];

  // Log the update
  logger.info('Issue updated', {
    issueId: id,
    updatedFields: Object.keys(updateData),
    tenantId,
    userId: req.user.id
  });

  res.json({
    success: true,
    data: updatedIssue,
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Delete issue
router.delete('/:id', auth, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const tenantId = req.user.tenantId;

  const result = await dbQuery(
    'DELETE FROM issues WHERE id = $1 AND tenant_id = $2 RETURNING id',
    [id, tenantId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Issue not found', 404, 'ISSUE_NOT_FOUND');
  }

  logger.info('Issue deleted', {
    issueId: id,
    tenantId,
    userId: req.user.id
  });

  res.json({
    success: true,
    message: 'Issue deleted successfully',
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// ============================================
// ISSUE COMMENTS
// ============================================

// Get comments for an issue
router.get('/:id/comments', auth, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const tenantId = req.user.tenantId;

  // Verify issue exists and user has access
  const issueCheck = await dbQuery(
    'SELECT id FROM issues WHERE id = $1 AND tenant_id = $2',
    [id, tenantId]
  );

  if (issueCheck.rows.length === 0) {
    throw new AppError('Issue not found', 404, 'ISSUE_NOT_FOUND');
  }

  const result = await dbQuery(`
    SELECT 
      ic.*,
      u.first_name,
      u.last_name,
      u.email,
      u.role
    FROM issue_comments ic
    JOIN users u ON ic.user_id = u.id
    WHERE ic.issue_id = $1
    ORDER BY ic.created_at ASC
  `, [id]);

  res.json({
    success: true,
    data: result.rows,
    meta: {
      timestamp: new Date().toISOString(),
      count: result.rows.length
    }
  });
}));

// Add comment to issue
router.post('/:id/comments', auth, [
  body('comment').trim().isLength({ min: 1 }).withMessage('Comment is required'),
  body('is_internal').optional().isBoolean(),
  body('attachments').optional().isArray()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }

  const { id } = req.params;
  const { comment, is_internal = false, attachments = [] } = req.body;
  const tenantId = req.user.tenantId;

  // Verify issue exists and user has access
  const issueCheck = await dbQuery(
    'SELECT id FROM issues WHERE id = $1 AND tenant_id = $2',
    [id, tenantId]
  );

  if (issueCheck.rows.length === 0) {
    throw new AppError('Issue not found', 404, 'ISSUE_NOT_FOUND');
  }

  const result = await dbQuery(`
    INSERT INTO issue_comments (issue_id, user_id, comment, is_internal, attachments)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `, [id, req.user.id, comment, is_internal, JSON.stringify(attachments)]);

  // Update issue's updated_at timestamp
  await dbQuery(
    'UPDATE issues SET updated_at = NOW() WHERE id = $1',
    [id]
  );

  res.status(201).json({
    success: true,
    data: result.rows[0],
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// ============================================
// ISSUE ANALYTICS
// ============================================

// Get issue analytics
router.get('/analytics/overview', auth, asyncHandler(async (req, res) => {
  const tenantId = req.user.tenantId;
  const { library_id, period = '30d' } = req.query;

  let dateFilter = '';
  const queryParams = [tenantId];
  let paramIndex = 2;

  if (library_id) {
    dateFilter += ` AND library_id = $${paramIndex}`;
    queryParams.push(library_id);
    paramIndex++;
  }

  // Calculate date range based on period
  const now = new Date();
  let startDate;
  
  switch (period) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  dateFilter += ` AND reported_at >= $${paramIndex}`;
  queryParams.push(startDate);

  // Get overview statistics
  const overviewResult = await dbQuery(`
    SELECT 
      COUNT(*) as total_issues,
      COUNT(CASE WHEN s.is_final = false THEN 1 END) as open_issues,
      COUNT(CASE WHEN s.is_final = true THEN 1 END) as closed_issues,
      COUNT(CASE WHEN i.sla_deadline < NOW() AND s.is_final = false THEN 1 END) as overdue_issues,
      AVG(CASE WHEN i.resolved_at IS NOT NULL THEN 
        EXTRACT(EPOCH FROM (i.resolved_at - i.reported_at)) / 3600 
      END) as avg_resolution_time_hours,
      AVG(i.satisfaction_rating) as avg_satisfaction_rating,
      COUNT(CASE WHEN i.satisfaction_rating IS NOT NULL THEN 1 END) as satisfaction_count
    FROM issues i
    LEFT JOIN issue_statuses s ON i.status_id = s.id
    WHERE tenant_id = $1 ${dateFilter}
  `, queryParams);

  // Get issues by category
  const categoryResult = await dbQuery(`
    SELECT 
      c.name,
      c.display_name,
      c.icon,
      c.color,
      COUNT(*) as count,
      COUNT(CASE WHEN s.is_final = false THEN 1 END) as open_count
    FROM issues i
    JOIN issue_categories c ON i.category_id = c.id
    LEFT JOIN issue_statuses s ON i.status_id = s.id
    WHERE i.tenant_id = $1 ${dateFilter}
    GROUP BY c.id, c.name, c.display_name, c.icon, c.color
    ORDER BY count DESC
  `, queryParams);

  // Get issues by priority
  const priorityResult = await dbQuery(`
    SELECT 
      p.name,
      p.display_name,
      p.level,
      p.color,
      COUNT(*) as count,
      COUNT(CASE WHEN s.is_final = false THEN 1 END) as open_count,
      COUNT(CASE WHEN i.sla_deadline < NOW() AND s.is_final = false THEN 1 END) as overdue_count
    FROM issues i
    JOIN issue_priorities p ON i.priority_id = p.id
    LEFT JOIN issue_statuses s ON i.status_id = s.id
    WHERE i.tenant_id = $1 ${dateFilter}
    GROUP BY p.id, p.name, p.display_name, p.level, p.color
    ORDER BY p.level ASC
  `, queryParams);

  // Get recent issues trend
  const trendResult = await dbQuery(`
    SELECT 
      DATE(reported_at) as date,
      COUNT(*) as total,
      COUNT(CASE WHEN s.is_final = true THEN 1 END) as resolved
    FROM issues i
    LEFT JOIN issue_statuses s ON i.status_id = s.id
    WHERE i.tenant_id = $1 ${dateFilter}
    GROUP BY DATE(reported_at)
    ORDER BY date DESC
    LIMIT 30
  `, queryParams);

  res.json({
    success: true,
    data: {
      overview: overviewResult.rows[0],
      byCategory: categoryResult.rows,
      byPriority: priorityResult.rows,
      trend: trendResult.rows
    },
    meta: {
      timestamp: new Date().toISOString(),
      period,
      startDate,
      endDate: now
    }
  });
}));

// ============================================
// RESPONSE TEMPLATES
// ============================================

// Get response templates
router.get('/templates', auth, asyncHandler(async (req, res) => {
  const tenantId = req.user.tenantId;
  const { category_id, priority_id } = req.query;

  let whereClause = 'WHERE tenant_id = $1 AND is_active = true';
  const queryParams = [tenantId];
  let paramIndex = 2;

  if (category_id) {
    whereClause += ` AND (category_id = $${paramIndex} OR category_id IS NULL)`;
    queryParams.push(category_id);
    paramIndex++;
  }

  if (priority_id) {
    whereClause += ` AND (priority_id = $${paramIndex} OR priority_id IS NULL)`;
    queryParams.push(priority_id);
    paramIndex++;
  }

  const result = await dbQuery(`
    SELECT 
      irt.*,
      c.name as category_name,
      c.display_name as category_display_name,
      p.name as priority_name,
      p.display_name as priority_display_name,
      u.first_name as created_by_first_name,
      u.last_name as created_by_last_name
    FROM issue_response_templates irt
    LEFT JOIN issue_categories c ON irt.category_id = c.id
    LEFT JOIN issue_priorities p ON irt.priority_id = p.id
    LEFT JOIN users u ON irt.created_by_user_id = u.id
    ${whereClause}
    ORDER BY usage_count DESC, name ASC
  `, queryParams);

  res.json({
    success: true,
    data: result.rows,
    meta: {
      timestamp: new Date().toISOString(),
      count: result.rows.length
    }
  });
}));

// Create response template
router.post('/templates', auth, [
  body('name').trim().isLength({ min: 1, max: 255 }).withMessage('Name is required'),
  body('subject').trim().isLength({ min: 1, max: 255 }).withMessage('Subject is required'),
  body('body').trim().isLength({ min: 1 }).withMessage('Body is required'),
  body('category_id').optional().isUUID(),
  body('priority_id').optional().isUUID()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }

  const { name, subject, body, category_id, priority_id } = req.body;
  const tenantId = req.user.tenantId;

  const result = await dbQuery(`
    INSERT INTO issue_response_templates (
      tenant_id, name, subject, body, category_id, priority_id, created_by_user_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `, [tenantId, name, subject, body, category_id, priority_id, req.user.id]);

  res.status(201).json({
    success: true,
    data: result.rows[0],
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// ============================================
// DUPLICATE DETECTION
// ============================================

// Find potential duplicates
router.post('/duplicates', auth, [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
  body('library_id').optional().isUUID()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }

  const { title, description, library_id } = req.body;
  const tenantId = req.user.tenantId;

  const duplicates = await findDuplicateIssues(title, description, tenantId, library_id);

  res.json({
    success: true,
    data: duplicates,
    meta: {
      timestamp: new Date().toISOString(),
      count: duplicates.length
    }
  });
}));

// Merge duplicate issues
router.post('/:id/merge', auth, [
  body('duplicate_issue_id').isUUID().withMessage('Valid duplicate issue ID is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }

  const { id } = req.params;
  const { duplicate_issue_id } = req.body;
  const tenantId = req.user.tenantId;

  // Verify both issues exist and belong to tenant
  const issuesCheck = await dbQuery(`
    SELECT id, student_count FROM issues 
    WHERE id IN ($1, $2) AND tenant_id = $3
  `, [id, duplicate_issue_id, tenantId]);

  if (issuesCheck.rows.length !== 2) {
    throw new AppError('One or both issues not found', 404, 'ISSUE_NOT_FOUND');
  }

  const mainIssue = issuesCheck.rows.find(issue => issue.id === id);
  const duplicateIssue = issuesCheck.rows.find(issue => issue.id === duplicate_issue_id);

  // Update duplicate issue
  await dbQuery(`
    UPDATE issues 
    SET 
      duplicate_of_issue_id = $1,
      is_duplicate = true,
      status_id = (SELECT id FROM issue_statuses WHERE name = 'cancelled'),
      updated_at = NOW()
    WHERE id = $2
  `, [id, duplicate_issue_id]);

  // Update main issue student count
  const newStudentCount = mainIssue.student_count + duplicateIssue.student_count;
  await dbQuery(`
    UPDATE issues 
    SET 
      student_count = $1,
      updated_at = NOW()
    WHERE id = $2
  `, [newStudentCount, id]);

  logger.info('Issues merged', {
    mainIssueId: id,
    duplicateIssueId: duplicate_issue_id,
    newStudentCount,
    tenantId,
    userId: req.user.id
  });

  res.json({
    success: true,
    message: 'Issues merged successfully',
    data: {
      main_issue_id: id,
      duplicate_issue_id,
      new_student_count: newStudentCount
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

module.exports = router;















