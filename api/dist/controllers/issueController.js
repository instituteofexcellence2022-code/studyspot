const {
  Pool
} = require('pg');
const {
  v4: uuidv4
} = require('uuid');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middleware/asyncHandler');

// Initialize database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

// ============================================
// ISSUE CATEGORIES
// ============================================

const getAllIssueCategories = asyncHandler(async (req, res) => {
  const query = `
    SELECT id, name, display_name, description, icon, color, is_active, created_at, updated_at
    FROM issue_categories 
    WHERE is_active = true
    ORDER BY display_name ASC
  `;
  const result = await pool.query(query);
  res.status(200).json({
    success: true,
    data: result.rows,
    count: result.rows.length
  });
});
const createIssueCategory = asyncHandler(async (req, res) => {
  const {
    name,
    display_name,
    description,
    icon,
    color,
    is_active = true
  } = req.body;
  const query = `
    INSERT INTO issue_categories (id, name, display_name, description, icon, color, is_active)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  const values = [uuidv4(), name, display_name, description, icon, color, is_active];
  const result = await pool.query(query, values);
  res.status(201).json({
    success: true,
    data: result.rows[0]
  });
});
const updateIssueCategory = asyncHandler(async (req, res) => {
  const {
    id
  } = req.params;
  const updates = req.body;
  const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
  const query = `
    UPDATE issue_categories 
    SET ${setClause}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `;
  const values = [id, ...Object.values(updates)];
  const result = await pool.query(query, values);
  if (result.rows.length === 0) {
    throw new AppError('Category not found', 404);
  }
  res.status(200).json({
    success: true,
    data: result.rows[0]
  });
});
const deleteIssueCategory = asyncHandler(async (req, res) => {
  const {
    id
  } = req.params;
  const query = `
    UPDATE issue_categories 
    SET is_active = false, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `;
  const result = await pool.query(query, [id]);
  if (result.rows.length === 0) {
    throw new AppError('Category not found', 404);
  }
  res.status(200).json({
    success: true,
    message: 'Category deactivated successfully'
  });
});

// ============================================
// ISSUE PRIORITIES
// ============================================

const getAllIssuePriorities = asyncHandler(async (req, res) => {
  const query = `
    SELECT id, name, display_name, level, color, sla_hours, is_active, created_at, updated_at
    FROM issue_priorities 
    WHERE is_active = true
    ORDER BY level ASC
  `;
  const result = await pool.query(query);
  res.status(200).json({
    success: true,
    data: result.rows,
    count: result.rows.length
  });
});
const createIssuePriority = asyncHandler(async (req, res) => {
  const {
    name,
    display_name,
    level,
    color,
    sla_hours,
    is_active = true
  } = req.body;
  const query = `
    INSERT INTO issue_priorities (id, name, display_name, level, color, sla_hours, is_active)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  const values = [uuidv4(), name, display_name, level, color, sla_hours, is_active];
  const result = await pool.query(query, values);
  res.status(201).json({
    success: true,
    data: result.rows[0]
  });
});
const updateIssuePriority = asyncHandler(async (req, res) => {
  const {
    id
  } = req.params;
  const updates = req.body;
  const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
  const query = `
    UPDATE issue_priorities 
    SET ${setClause}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `;
  const values = [id, ...Object.values(updates)];
  const result = await pool.query(query, values);
  if (result.rows.length === 0) {
    throw new AppError('Priority not found', 404);
  }
  res.status(200).json({
    success: true,
    data: result.rows[0]
  });
});
const deleteIssuePriority = asyncHandler(async (req, res) => {
  const {
    id
  } = req.params;
  const query = `
    UPDATE issue_priorities 
    SET is_active = false, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `;
  const result = await pool.query(query, [id]);
  if (result.rows.length === 0) {
    throw new AppError('Priority not found', 404);
  }
  res.status(200).json({
    success: true,
    message: 'Priority deactivated successfully'
  });
});

// ============================================
// ISSUE STATUSES
// ============================================

const getAllIssueStatuses = asyncHandler(async (req, res) => {
  const query = `
    SELECT id, name, display_name, description, color, is_final, is_active, created_at, updated_at
    FROM issue_statuses 
    WHERE is_active = true
    ORDER BY 
      CASE 
        WHEN name = 'open' THEN 1
        WHEN name = 'in_progress' THEN 2
        WHEN name = 'resolved' THEN 3
        WHEN name = 'closed' THEN 4
        WHEN name = 'reopened' THEN 5
        WHEN name = 'duplicate' THEN 6
        ELSE 7
      END
  `;
  const result = await pool.query(query);
  res.status(200).json({
    success: true,
    data: result.rows,
    count: result.rows.length
  });
});
const createIssueStatus = asyncHandler(async (req, res) => {
  const {
    name,
    display_name,
    description,
    color,
    is_final = false,
    is_active = true
  } = req.body;
  const query = `
    INSERT INTO issue_statuses (id, name, display_name, description, color, is_final, is_active)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  const values = [uuidv4(), name, display_name, description, color, is_final, is_active];
  const result = await pool.query(query, values);
  res.status(201).json({
    success: true,
    data: result.rows[0]
  });
});
const updateIssueStatus = asyncHandler(async (req, res) => {
  const {
    id
  } = req.params;
  const updates = req.body;
  const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
  const query = `
    UPDATE issue_statuses 
    SET ${setClause}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `;
  const values = [id, ...Object.values(updates)];
  const result = await pool.query(query, values);
  if (result.rows.length === 0) {
    throw new AppError('Status not found', 404);
  }
  res.status(200).json({
    success: true,
    data: result.rows[0]
  });
});
const deleteIssueStatus = asyncHandler(async (req, res) => {
  const {
    id
  } = req.params;
  const query = `
    UPDATE issue_statuses 
    SET is_active = false, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `;
  const result = await pool.query(query, [id]);
  if (result.rows.length === 0) {
    throw new AppError('Status not found', 404);
  }
  res.status(200).json({
    success: true,
    message: 'Status deactivated successfully'
  });
});

// ============================================
// ISSUES
// ============================================

const getAllIssues = asyncHandler(async (req, res) => {
  const {
    status,
    priority,
    category,
    search,
    assignedTo,
    reportedBy,
    page = 1,
    limit = 10,
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = req.query;
  const offset = (page - 1) * limit;
  let whereConditions = ['i.tenant_id = $1'];
  let queryParams = [req.user.tenant_id];
  let paramCount = 1;
  if (status) {
    paramCount++;
    whereConditions.push(`i.status_id = (SELECT id FROM issue_statuses WHERE name = $${paramCount})`);
    queryParams.push(status);
  }
  if (priority) {
    paramCount++;
    whereConditions.push(`i.priority_id = (SELECT id FROM issue_priorities WHERE name = $${paramCount})`);
    queryParams.push(priority);
  }
  if (category) {
    paramCount++;
    whereConditions.push(`i.category_id = (SELECT id FROM issue_categories WHERE name = $${paramCount})`);
    queryParams.push(category);
  }
  if (search) {
    paramCount++;
    whereConditions.push(`(i.title ILIKE $${paramCount} OR i.description ILIKE $${paramCount})`);
    queryParams.push(`%${search}%`);
  }
  if (assignedTo) {
    paramCount++;
    whereConditions.push(`i.assigned_to = $${paramCount}`);
    queryParams.push(assignedTo);
  }
  if (reportedBy) {
    paramCount++;
    whereConditions.push(`i.reported_by = $${paramCount}`);
    queryParams.push(reportedBy);
  }
  const query = `
    SELECT 
      i.*,
      ic.name as category_name,
      ic.display_name as category_display_name,
      ic.icon as category_icon,
      ic.color as category_color,
      ip.name as priority_name,
      ip.display_name as priority_display_name,
      ip.level as priority_level,
      ip.color as priority_color,
      ip.sla_hours,
      ist.name as status_name,
      ist.display_name as status_display_name,
      ist.color as status_color,
      ist.is_final as status_is_final,
      ua.first_name as assigned_to_first_name,
      ua.last_name as assigned_to_last_name,
      ua.email as assigned_to_email,
      ur.first_name as reported_by_first_name,
      ur.last_name as reported_by_last_name,
      ur.email as reported_by_email,
      l.name as library_name,
      i.created_at as reported_at,
      CASE 
        WHEN i.priority_id IS NOT NULL AND ip.sla_hours IS NOT NULL 
        THEN i.created_at + INTERVAL '${ip.sla_hours} hours'
        ELSE NULL 
      END as sla_deadline,
      CASE 
        WHEN i.priority_id IS NOT NULL AND ip.sla_hours IS NOT NULL 
        AND NOW() > (i.created_at + INTERVAL '${ip.sla_hours} hours')
        THEN true
        ELSE false 
      END as is_overdue
    FROM issues i
    LEFT JOIN issue_categories ic ON i.category_id = ic.id
    LEFT JOIN issue_priorities ip ON i.priority_id = ip.id
    LEFT JOIN issue_statuses ist ON i.status_id = ist.id
    LEFT JOIN users ua ON i.assigned_to = ua.id
    LEFT JOIN users ur ON i.reported_by = ur.id
    LEFT JOIN libraries l ON i.library_id = l.id
    WHERE ${whereConditions.join(' AND ')}
    ORDER BY i.${sortBy} ${sortOrder.toUpperCase()}
    LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
  `;
  queryParams.push(limit, offset);
  const result = await pool.query(query, queryParams);

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM issues i
    WHERE ${whereConditions.join(' AND ')}
  `;
  const countResult = await pool.query(countQuery, queryParams.slice(0, -2));
  const total = parseInt(countResult.rows[0].total);
  res.status(200).json({
    success: true,
    data: result.rows,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});
const getIssueById = asyncHandler(async (req, res) => {
  const {
    id
  } = req.params;
  const query = `
    SELECT 
      i.*,
      ic.name as category_name,
      ic.display_name as category_display_name,
      ic.icon as category_icon,
      ic.color as category_color,
      ip.name as priority_name,
      ip.display_name as priority_display_name,
      ip.level as priority_level,
      ip.color as priority_color,
      ip.sla_hours,
      ist.name as status_name,
      ist.display_name as status_display_name,
      ist.color as status_color,
      ist.is_final as status_is_final,
      ua.first_name as assigned_to_first_name,
      ua.last_name as assigned_to_last_name,
      ua.email as assigned_to_email,
      ur.first_name as reported_by_first_name,
      ur.last_name as reported_by_last_name,
      ur.email as reported_by_email,
      l.name as library_name,
      i.created_at as reported_at,
      CASE 
        WHEN i.priority_id IS NOT NULL AND ip.sla_hours IS NOT NULL 
        THEN i.created_at + INTERVAL '${ip.sla_hours} hours'
        ELSE NULL 
      END as sla_deadline,
      CASE 
        WHEN i.priority_id IS NOT NULL AND ip.sla_hours IS NOT NULL 
        AND NOW() > (i.created_at + INTERVAL '${ip.sla_hours} hours')
        THEN true
        ELSE false 
      END as is_overdue
    FROM issues i
    LEFT JOIN issue_categories ic ON i.category_id = ic.id
    LEFT JOIN issue_priorities ip ON i.priority_id = ip.id
    LEFT JOIN issue_statuses ist ON i.status_id = ist.id
    LEFT JOIN users ua ON i.assigned_to = ua.id
    LEFT JOIN users ur ON i.reported_by = ur.id
    LEFT JOIN libraries l ON i.library_id = l.id
    WHERE i.id = $1 AND i.tenant_id = $2
  `;
  const result = await pool.query(query, [id, req.user.tenant_id]);
  if (result.rows.length === 0) {
    throw new AppError('Issue not found', 404);
  }
  res.status(200).json({
    success: true,
    data: result.rows[0]
  });
});
const createIssue = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    reported_by,
    category_id,
    priority_id,
    library_id,
    assigned_to,
    severity,
    reproducibility,
    expected_outcome,
    actual_outcome,
    due_date,
    tags = [],
    metadata = {}
  } = req.body;
  const issueId = uuidv4();

  // Get default status (open)
  const statusQuery = `SELECT id FROM issue_statuses WHERE name = 'open' AND is_active = true LIMIT 1`;
  const statusResult = await pool.query(statusQuery);
  const defaultStatusId = statusResult.rows[0]?.id;
  const query = `
    INSERT INTO issues (
      id, tenant_id, library_id, reported_by, assigned_to, category_id, 
      priority_id, status_id, title, description, severity, reproducibility,
      expected_outcome, actual_outcome, due_date, tags, metadata
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
    RETURNING *
  `;
  const values = [issueId, req.user.tenant_id, library_id, reported_by, assigned_to, category_id, priority_id, defaultStatusId, title, description, severity, reproducibility, expected_outcome, actual_outcome, due_date, tags, metadata];
  const result = await pool.query(query, values);

  // Trigger workflow automation
  await triggerWorkflowAutomation('issue_created', result.rows[0]);
  res.status(201).json({
    success: true,
    data: result.rows[0]
  });
});
const updateIssue = asyncHandler(async (req, res) => {
  const {
    id
  } = req.params;
  const updates = req.body;

  // Track what changed for workflow automation
  const oldIssueQuery = `SELECT * FROM issues WHERE id = $1 AND tenant_id = $2`;
  const oldIssueResult = await pool.query(oldIssueQuery, [id, req.user.tenant_id]);
  if (oldIssueResult.rows.length === 0) {
    throw new AppError('Issue not found', 404);
  }
  const oldIssue = oldIssueResult.rows[0];
  const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 3}`).join(', ');
  const query = `
    UPDATE issues 
    SET ${setClause}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND tenant_id = $2
    RETURNING *
  `;
  const values = [id, req.user.tenant_id, ...Object.values(updates)];
  const result = await pool.query(query, values);
  const updatedIssue = result.rows[0];

  // Trigger workflow automation for status changes
  if (updates.status_id && updates.status_id !== oldIssue.status_id) {
    await triggerWorkflowAutomation('status_changed', updatedIssue, {
      old_status_id: oldIssue.status_id
    });
  }

  // Trigger workflow automation for assignment changes
  if (updates.assigned_to && updates.assigned_to !== oldIssue.assigned_to) {
    await triggerWorkflowAutomation('assignment_changed', updatedIssue, {
      old_assigned_to: oldIssue.assigned_to
    });
  }
  res.status(200).json({
    success: true,
    data: updatedIssue
  });
});
const deleteIssue = asyncHandler(async (req, res) => {
  const {
    id
  } = req.params;
  const query = `DELETE FROM issues WHERE id = $1 AND tenant_id = $2 RETURNING *`;
  const result = await pool.query(query, [id, req.user.tenant_id]);
  if (result.rows.length === 0) {
    throw new AppError('Issue not found', 404);
  }
  res.status(200).json({
    success: true,
    message: 'Issue deleted successfully'
  });
});

// ============================================
// ISSUE COMMENTS
// ============================================

const getIssueComments = asyncHandler(async (req, res) => {
  const {
    issueId
  } = req.params;
  const query = `
    SELECT 
      ic.*,
      u.first_name,
      u.last_name,
      u.email,
      u.avatar_url
    FROM issue_comments ic
    JOIN users u ON ic.user_id = u.id
    WHERE ic.issue_id = $1
    ORDER BY ic.created_at ASC
  `;
  const result = await pool.query(query, [issueId]);
  res.status(200).json({
    success: true,
    data: result.rows
  });
});
const addIssueComment = asyncHandler(async (req, res) => {
  const {
    issueId
  } = req.params;
  const {
    comment,
    user_id,
    is_internal = false
  } = req.body;
  const query = `
    INSERT INTO issue_comments (id, issue_id, user_id, comment, is_internal)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const values = [uuidv4(), issueId, user_id, comment, is_internal];
  const result = await pool.query(query, values);
  res.status(201).json({
    success: true,
    data: result.rows[0]
  });
});
const updateIssueComment = asyncHandler(async (req, res) => {
  const {
    issueId,
    commentId
  } = req.params;
  const {
    comment,
    is_internal
  } = req.body;
  const query = `
    UPDATE issue_comments 
    SET comment = $1, is_internal = $2, updated_at = CURRENT_TIMESTAMP
    WHERE id = $3 AND issue_id = $4
    RETURNING *
  `;
  const result = await pool.query(query, [comment, is_internal, commentId, issueId]);
  if (result.rows.length === 0) {
    throw new AppError('Comment not found', 404);
  }
  res.status(200).json({
    success: true,
    data: result.rows[0]
  });
});
const deleteIssueComment = asyncHandler(async (req, res) => {
  const {
    issueId,
    commentId
  } = req.params;
  const query = `DELETE FROM issue_comments WHERE id = $1 AND issue_id = $2 RETURNING *`;
  const result = await pool.query(query, [commentId, issueId]);
  if (result.rows.length === 0) {
    throw new AppError('Comment not found', 404);
  }
  res.status(200).json({
    success: true,
    message: 'Comment deleted successfully'
  });
});

// ============================================
// ISSUE ATTACHMENTS
// ============================================

const getIssueAttachments = asyncHandler(async (req, res) => {
  const {
    issueId
  } = req.params;
  const query = `
    SELECT 
      ia.*,
      u.first_name,
      u.last_name,
      u.email
    FROM issue_attachments ia
    JOIN users u ON ia.uploaded_by = u.id
    WHERE ia.issue_id = $1
    ORDER BY ia.created_at DESC
  `;
  const result = await pool.query(query, [issueId]);
  res.status(200).json({
    success: true,
    data: result.rows
  });
});
const addIssueAttachment = asyncHandler(async (req, res) => {
  const {
    issueId
  } = req.params;
  const {
    file_name,
    file_url,
    uploaded_by,
    file_type,
    file_size
  } = req.body;
  const query = `
    INSERT INTO issue_attachments (id, issue_id, uploaded_by, file_name, file_url, file_type, file_size)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  const values = [uuidv4(), issueId, uploaded_by, file_name, file_url, file_type, file_size];
  const result = await pool.query(query, values);
  res.status(201).json({
    success: true,
    data: result.rows[0]
  });
});
const deleteIssueAttachment = asyncHandler(async (req, res) => {
  const {
    issueId,
    attachmentId
  } = req.params;
  const query = `DELETE FROM issue_attachments WHERE id = $1 AND issue_id = $2 RETURNING *`;
  const result = await pool.query(query, [attachmentId, issueId]);
  if (result.rows.length === 0) {
    throw new AppError('Attachment not found', 404);
  }
  res.status(200).json({
    success: true,
    message: 'Attachment deleted successfully'
  });
});

// ============================================
// ISSUE STAFF ASSIGNMENTS
// ============================================

const assignStaffToIssue = asyncHandler(async (req, res) => {
  const {
    issueId
  } = req.params;
  const {
    staff_id
  } = req.body;

  // First, update the main issue assignment
  const updateIssueQuery = `
    UPDATE issues 
    SET assigned_to = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2 AND tenant_id = $3
    RETURNING *
  `;
  const issueResult = await pool.query(updateIssueQuery, [staff_id, issueId, req.user.tenant_id]);
  if (issueResult.rows.length === 0) {
    throw new AppError('Issue not found', 404);
  }

  // Then, create assignment record
  const assignmentQuery = `
    INSERT INTO issue_staff_assignments (id, issue_id, staff_id)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const assignmentResult = await pool.query(assignmentQuery, [uuidv4(), issueId, staff_id]);
  res.status(200).json({
    success: true,
    data: {
      issue: issueResult.rows[0],
      assignment: assignmentResult.rows[0]
    }
  });
});
const unassignStaffFromIssue = asyncHandler(async (req, res) => {
  const {
    issueId,
    staffId
  } = req.params;

  // Update the main issue assignment
  const updateIssueQuery = `
    UPDATE issues 
    SET assigned_to = NULL, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND tenant_id = $2
    RETURNING *
  `;
  const issueResult = await pool.query(updateIssueQuery, [issueId, req.user.tenant_id]);

  // Update assignment record
  const assignmentQuery = `
    UPDATE issue_staff_assignments 
    SET is_active = false, unassigned_at = CURRENT_TIMESTAMP
    WHERE issue_id = $1 AND staff_id = $2 AND is_active = true
    RETURNING *
  `;
  const assignmentResult = await pool.query(assignmentQuery, [issueId, staffId]);
  res.status(200).json({
    success: true,
    data: {
      issue: issueResult.rows[0],
      assignment: assignmentResult.rows[0]
    }
  });
});

// ============================================
// ISSUE RESPONSE TEMPLATES
// ============================================

const getAllResponseTemplates = asyncHandler(async (req, res) => {
  const query = `
    SELECT 
      irt.*,
      ic.name as category_name,
      ic.display_name as category_display_name
    FROM issue_response_templates irt
    LEFT JOIN issue_categories ic ON irt.category_id = ic.id
    WHERE (irt.tenant_id = $1 OR irt.tenant_id IS NULL) AND irt.is_active = true
    ORDER BY irt.name ASC
  `;
  const result = await pool.query(query, [req.user.tenant_id]);
  res.status(200).json({
    success: true,
    data: result.rows
  });
});
const createResponseTemplate = asyncHandler(async (req, res) => {
  const {
    name,
    subject,
    body,
    category_id,
    is_active = true
  } = req.body;
  const query = `
    INSERT INTO issue_response_templates (id, tenant_id, name, subject, body, category_id, is_active)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  const values = [uuidv4(), req.user.tenant_id, name, subject, body, category_id, is_active];
  const result = await pool.query(query, values);
  res.status(201).json({
    success: true,
    data: result.rows[0]
  });
});
const updateResponseTemplate = asyncHandler(async (req, res) => {
  const {
    id
  } = req.params;
  const updates = req.body;
  const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 3}`).join(', ');
  const query = `
    UPDATE issue_response_templates 
    SET ${setClause}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND tenant_id = $2
    RETURNING *
  `;
  const values = [id, req.user.tenant_id, ...Object.values(updates)];
  const result = await pool.query(query, values);
  if (result.rows.length === 0) {
    throw new AppError('Template not found', 404);
  }
  res.status(200).json({
    success: true,
    data: result.rows[0]
  });
});
const deleteResponseTemplate = asyncHandler(async (req, res) => {
  const {
    id
  } = req.params;
  const query = `
    UPDATE issue_response_templates 
    SET is_active = false, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND tenant_id = $2
    RETURNING *
  `;
  const result = await pool.query(query, [id, req.user.tenant_id]);
  if (result.rows.length === 0) {
    throw new AppError('Template not found', 404);
  }
  res.status(200).json({
    success: true,
    message: 'Template deactivated successfully'
  });
});

// ============================================
// ISSUE ANALYTICS & UTILITIES
// ============================================

const getIssueSummaryAnalytics = asyncHandler(async (req, res) => {
  const {
    timeRange = '30d'
  } = req.query;
  let dateFilter = '';
  switch (timeRange) {
    case '7d':
      dateFilter = "AND i.created_at >= NOW() - INTERVAL '7 days'";
      break;
    case '30d':
      dateFilter = "AND i.created_at >= NOW() - INTERVAL '30 days'";
      break;
    case '90d':
      dateFilter = "AND i.created_at >= NOW() - INTERVAL '90 days'";
      break;
    case '1y':
      dateFilter = "AND i.created_at >= NOW() - INTERVAL '1 year'";
      break;
  }
  const query = `
    SELECT 
      COUNT(*) as total_issues,
      COUNT(CASE WHEN ist.name = 'open' THEN 1 END) as open_issues,
      COUNT(CASE WHEN ist.name = 'in_progress' THEN 1 END) as in_progress_issues,
      COUNT(CASE WHEN ist.name = 'resolved' THEN 1 END) as resolved_issues,
      COUNT(CASE WHEN ist.name = 'closed' THEN 1 END) as closed_issues,
      AVG(CASE 
        WHEN ist.name IN ('resolved', 'closed') 
        THEN EXTRACT(EPOCH FROM (i.resolved_at - i.created_at))/3600 
        ELSE NULL 
      END) as avg_resolution_time_hours,
      AVG(i.satisfaction_rating) as avg_satisfaction_rating
    FROM issues i
    LEFT JOIN issue_statuses ist ON i.status_id = ist.id
    WHERE i.tenant_id = $1 ${dateFilter}
  `;
  const result = await pool.query(query, [req.user.tenant_id]);

  // Get category distribution
  const categoryQuery = `
    SELECT 
      ic.name,
      ic.display_name,
      ic.color,
      COUNT(*) as count
    FROM issues i
    JOIN issue_categories ic ON i.category_id = ic.id
    WHERE i.tenant_id = $1 ${dateFilter}
    GROUP BY ic.id, ic.name, ic.display_name, ic.color
    ORDER BY count DESC
  `;
  const categoryResult = await pool.query(categoryQuery, [req.user.tenant_id]);

  // Get priority distribution
  const priorityQuery = `
    SELECT 
      ip.name,
      ip.display_name,
      ip.color,
      COUNT(*) as count
    FROM issues i
    JOIN issue_priorities ip ON i.priority_id = ip.id
    WHERE i.tenant_id = $1 ${dateFilter}
    GROUP BY ip.id, ip.name, ip.display_name, ip.color
    ORDER BY ip.level DESC
  `;
  const priorityResult = await pool.query(priorityQuery, [req.user.tenant_id]);

  // Get status distribution
  const statusQuery = `
    SELECT 
      ist.name,
      ist.display_name,
      ist.color,
      COUNT(*) as count
    FROM issues i
    JOIN issue_statuses ist ON i.status_id = ist.id
    WHERE i.tenant_id = $1 ${dateFilter}
    GROUP BY ist.id, ist.name, ist.display_name, ist.color
    ORDER BY count DESC
  `;
  const statusResult = await pool.query(statusQuery, [req.user.tenant_id]);
  const analytics = {
    ...result.rows[0],
    issues_by_category: categoryResult.rows,
    issues_by_priority: priorityResult.rows,
    issues_by_status: statusResult.rows,
    average_resolution_time: result.rows[0].avg_resolution_time_hours ? `${Math.round(result.rows[0].avg_resolution_time_hours)} hours` : 'N/A',
    satisfaction_score: result.rows[0].avg_satisfaction_rating || 0
  };
  res.status(200).json({
    success: true,
    data: analytics
  });
});
const getMostFrequentIssues = asyncHandler(async (req, res) => {
  const {
    limit = 10
  } = req.query;
  const query = `
    SELECT 
      title,
      COUNT(*) as count,
      MAX(created_at) as last_reported
    FROM issues
    WHERE tenant_id = $1
    GROUP BY title
    HAVING COUNT(*) > 1
    ORDER BY count DESC, last_reported DESC
    LIMIT $2
  `;
  const result = await pool.query(query, [req.user.tenant_id, limit]);
  res.status(200).json({
    success: true,
    data: result.rows
  });
});
const detectDuplicateIssues = asyncHandler(async (req, res) => {
  const {
    title,
    description
  } = req.body;
  if (!title || !description) {
    throw new AppError('Title and description are required', 400);
  }

  // Simple similarity check - in production, you might want to use more sophisticated algorithms
  const query = `
    SELECT 
      i.*,
      ic.display_name as category_display_name,
      ip.display_name as priority_display_name,
      ist.display_name as status_display_name,
      SIMILARITY(i.title, $1) as title_similarity,
      SIMILARITY(i.description, $2) as description_similarity
    FROM issues i
    LEFT JOIN issue_categories ic ON i.category_id = ic.id
    LEFT JOIN issue_priorities ip ON i.priority_id = ip.id
    LEFT JOIN issue_statuses ist ON i.status_id = ist.id
    WHERE i.tenant_id = $3
    AND (
      SIMILARITY(i.title, $1) > 0.3 
      OR SIMILARITY(i.description, $2) > 0.3
    )
    ORDER BY (SIMILARITY(i.title, $1) + SIMILARITY(i.description, $2)) DESC
    LIMIT 5
  `;
  const result = await pool.query(query, [title, description, req.user.tenant_id]);
  res.status(200).json({
    success: true,
    data: result.rows
  });
});

// ============================================
// WORKFLOW AUTOMATION
// ============================================

const triggerWorkflowAutomation = async (event, issue, metadata = {}) => {
  try {
    // Get applicable workflow rules
    const rulesQuery = `
      SELECT * FROM issue_workflow_rules 
      WHERE tenant_id = $1 
      AND trigger_event = $2 
      AND is_active = true
      ORDER BY priority ASC
    `;
    const rulesResult = await pool.query(rulesQuery, [issue.tenant_id, event]);
    for (const rule of rulesResult.rows) {
      try {
        // Check if conditions are met
        const conditionsMet = await checkWorkflowConditions(rule.conditions, issue, metadata);
        if (conditionsMet) {
          // Execute actions
          await executeWorkflowActions(rule.actions, issue, rule.id);

          // Log workflow execution
          await logWorkflowExecution(issue.id, rule.id, event, rule.conditions, rule.actions);
        }
      } catch (error) {
        console.error(`Error executing workflow rule ${rule.id}:`, error);
        // Log failed execution
        await logWorkflowExecution(issue.id, rule.id, event, rule.conditions, rule.actions, 'failed', error.message);
      }
    }
  } catch (error) {
    console.error('Error in workflow automation:', error);
  }
};
const checkWorkflowConditions = async (conditions, issue, metadata) => {
  // Implement condition checking logic
  // This is a simplified version - in production, you'd want more sophisticated condition evaluation

  for (const [key, value] of Object.entries(conditions)) {
    switch (key) {
      case 'priority_level':
        if (value.gte && issue.priority_level < value.gte) return false;
        if (value.lte && issue.priority_level > value.lte) return false;
        break;
      case 'assigned_to':
        if (value === null && issue.assigned_to !== null) return false;
        break;
      case 'status':
        if (issue.status_name !== value) return false;
        break;
      // Add more condition types as needed
    }
  }
  return true;
};
const executeWorkflowActions = async (actions, issue, ruleId) => {
  // Implement action execution logic
  // This is a simplified version - in production, you'd want more sophisticated action execution

  for (const [actionType, actionData] of Object.entries(actions)) {
    switch (actionType) {
      case 'auto_assign':
        if (actionData.assignment_rule === 'round_robin') {
          await autoAssignRoundRobin(issue);
        }
        break;
      case 'escalate':
        await escalateIssue(issue, actionData.escalation_level);
        break;
      case 'change_status':
        await changeIssueStatus(issue.id, actionData.new_status);
        break;
      case 'send_notification':
        await sendNotification(issue, actionData);
        break;
      // Add more action types as needed
    }
  }
};
const logWorkflowExecution = async (issueId, ruleId, event, conditions, actions, status = 'success', errorMessage = null) => {
  const query = `
    INSERT INTO issue_workflow_history (
      id, issue_id, workflow_rule_id, trigger_event, 
      conditions_met, actions_performed, status, error_message
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `;
  const values = [uuidv4(), issueId, ruleId, event, JSON.stringify(conditions), JSON.stringify(actions), status, errorMessage];
  await pool.query(query, values);
};

// Helper functions for workflow actions
const autoAssignRoundRobin = async issue => {
  // Get available staff members
  const staffQuery = `
    SELECT u.id, u.first_name, u.last_name, COUNT(i.id) as current_issues
    FROM users u
    LEFT JOIN issues i ON u.id = i.assigned_to AND i.status_id NOT IN (
      SELECT id FROM issue_statuses WHERE name IN ('resolved', 'closed')
    )
    WHERE u.tenant_id = $1 AND u.role IN ('library_staff', 'library_owner')
    GROUP BY u.id, u.first_name, u.last_name
    ORDER BY current_issues ASC
    LIMIT 1
  `;
  const staffResult = await pool.query(staffQuery, [issue.tenant_id]);
  if (staffResult.rows.length > 0) {
    const staff = staffResult.rows[0];

    // Update issue assignment
    const updateQuery = `
      UPDATE issues 
      SET assigned_to = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `;
    await pool.query(updateQuery, [staff.id, issue.id]);
  }
};
const escalateIssue = async (issue, escalationLevel) => {
  // Implement escalation logic
  console.log(`Escalating issue ${issue.id} to level ${escalationLevel}`);
};
const changeIssueStatus = async (issueId, statusName) => {
  const statusQuery = `SELECT id FROM issue_statuses WHERE name = $1 AND is_active = true LIMIT 1`;
  const statusResult = await pool.query(statusQuery, [statusName]);
  if (statusResult.rows.length > 0) {
    const updateQuery = `
      UPDATE issues 
      SET status_id = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `;
    await pool.query(updateQuery, [statusResult.rows[0].id, issueId]);
  }
};
const sendNotification = async (issue, notificationData) => {
  // Implement notification sending logic
  console.log(`Sending notification for issue ${issue.id}:`, notificationData);
};
module.exports = {
  // Categories
  getAllIssueCategories,
  createIssueCategory,
  updateIssueCategory,
  deleteIssueCategory,
  // Priorities
  getAllIssuePriorities,
  createIssuePriority,
  updateIssuePriority,
  deleteIssuePriority,
  // Statuses
  getAllIssueStatuses,
  createIssueStatus,
  updateIssueStatus,
  deleteIssueStatus,
  // Issues
  getAllIssues,
  getIssueById,
  createIssue,
  updateIssue,
  deleteIssue,
  // Comments
  getIssueComments,
  addIssueComment,
  updateIssueComment,
  deleteIssueComment,
  // Attachments
  getIssueAttachments,
  addIssueAttachment,
  deleteIssueAttachment,
  // Staff Assignments
  assignStaffToIssue,
  unassignStaffFromIssue,
  // Response Templates
  getAllResponseTemplates,
  createResponseTemplate,
  updateResponseTemplate,
  deleteResponseTemplate,
  // Analytics
  getIssueSummaryAnalytics,
  getMostFrequentIssues,
  detectDuplicateIssues
};