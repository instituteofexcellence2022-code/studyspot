/**
 * Audit Service
 * Comprehensive audit trail and security monitoring
 */

const { pool } = require('../config/database');
const { logger } = require('../utils/logger');

// Audit event types
const AUDIT_EVENTS = {
  // Authentication
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILED: 'login_failed',
  LOGOUT: 'logout',
  PASSWORD_CHANGED: 'password_changed',
  PASSWORD_RESET: 'password_reset',
  
  // User Management
  USER_CREATED: 'user_created',
  USER_UPDATED: 'user_updated',
  USER_DELETED: 'user_deleted',
  ROLE_CHANGED: 'role_changed',
  
  // Student Management
  STUDENT_CREATED: 'student_created',
  STUDENT_UPDATED: 'student_updated',
  STUDENT_DELETED: 'student_deleted',
  KYC_VERIFIED: 'kyc_verified',
  BULK_IMPORT: 'bulk_import',
  
  // Financial
  PAYMENT_CREATED: 'payment_created',
  INVOICE_GENERATED: 'invoice_generated',
  EXPENSE_RECORDED: 'expense_recorded',
  
  // Bookings
  BOOKING_CREATED: 'booking_created',
  BOOKING_CANCELLED: 'booking_cancelled',
  
  // Attendance
  CHECK_IN: 'check_in',
  CHECK_OUT: 'check_out',
  
  // Security
  UNAUTHORIZED_ACCESS: 'unauthorized_access',
  PERMISSION_DENIED: 'permission_denied',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  
  // Data Access
  SENSITIVE_DATA_ACCESSED: 'sensitive_data_accessed',
  BULK_EXPORT: 'bulk_export',
  
  // System
  SETTINGS_CHANGED: 'settings_changed',
  INTEGRATION_CONFIGURED: 'integration_configured',
};

/**
 * Log audit event
 */
async function logAudit(auditData) {
  try {
    const {
      event_type,
      user_id,
      target_user_id,
      target_resource_type,
      target_resource_id,
      action,
      description,
      ip_address,
      user_agent,
      metadata,
      severity = 'info', // info, warning, critical
      library_id,
      tenant_id,
    } = auditData;

    const query = `
      INSERT INTO audit_logs (
        event_type,
        user_id,
        target_user_id,
        target_resource_type,
        target_resource_id,
        action,
        description,
        ip_address,
        user_agent,
        metadata,
        severity,
        library_id,
        tenant_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    const result = await pool.query(query, [
      event_type,
      user_id || null,
      target_user_id || null,
      target_resource_type || null,
      target_resource_id || null,
      action,
      description,
      ip_address || null,
      user_agent || null,
      metadata ? JSON.stringify(metadata) : null,
      severity,
      library_id || null,
      tenant_id || null,
    ]);

    // Log to application logger as well
    logger.info('Audit event logged:', {
      event_type,
      user_id,
      action,
      severity,
    });

    return {
      success: true,
      data: result.rows[0],
    };
  } catch (error) {
    logger.error('Error logging audit event:', error);
    // Don't throw - audit logging should not break the main flow
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get audit logs with filtering
 */
async function getAuditLogs(filters = {}, pagination = {}) {
  try {
    const {
      event_type,
      user_id,
      target_resource_type,
      severity,
      library_id,
      tenant_id,
      start_date,
      end_date,
      ip_address,
    } = filters;

    const {
      page = 1,
      limit = 50,
      sort_by = 'created_at',
      sort_order = 'DESC',
    } = pagination;

    const offset = (page - 1) * limit;

    // Build WHERE clause
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (event_type) {
      conditions.push(`event_type = $${paramIndex}`);
      params.push(event_type);
      paramIndex++;
    }

    if (user_id) {
      conditions.push(`user_id = $${paramIndex}`);
      params.push(user_id);
      paramIndex++;
    }

    if (target_resource_type) {
      conditions.push(`target_resource_type = $${paramIndex}`);
      params.push(target_resource_type);
      paramIndex++;
    }

    if (severity) {
      conditions.push(`severity = $${paramIndex}`);
      params.push(severity);
      paramIndex++;
    }

    if (library_id) {
      conditions.push(`library_id = $${paramIndex}`);
      params.push(library_id);
      paramIndex++;
    }

    if (tenant_id) {
      conditions.push(`tenant_id = $${paramIndex}`);
      params.push(tenant_id);
      paramIndex++;
    }

    if (start_date) {
      conditions.push(`created_at >= $${paramIndex}`);
      params.push(start_date);
      paramIndex++;
    }

    if (end_date) {
      conditions.push(`created_at <= $${paramIndex}`);
      params.push(end_date);
      paramIndex++;
    }

    if (ip_address) {
      conditions.push(`ip_address = $${paramIndex}`);
      params.push(ip_address);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM audit_logs ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get paginated results with user details
    const dataQuery = `
      SELECT 
        al.*,
        u.name as user_name,
        u.email as user_email,
        tu.name as target_user_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      LEFT JOIN users tu ON al.target_user_id = tu.id
      ${whereClause}
      ORDER BY al.${sort_by} ${sort_order}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    const dataResult = await pool.query(dataQuery, params);

    return {
      success: true,
      data: dataResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Error fetching audit logs:', error);
    throw error;
  }
}

/**
 * Get security events (failed logins, unauthorized access)
 */
async function getSecurityEvents(filters = {}) {
  try {
    const securityEventTypes = [
      AUDIT_EVENTS.LOGIN_FAILED,
      AUDIT_EVENTS.UNAUTHORIZED_ACCESS,
      AUDIT_EVENTS.PERMISSION_DENIED,
      AUDIT_EVENTS.SUSPICIOUS_ACTIVITY,
    ];

    return await getAuditLogs({
      ...filters,
      event_type: securityEventTypes,
    });
  } catch (error) {
    logger.error('Error fetching security events:', error);
    throw error;
  }
}

/**
 * Track user session
 */
async function createSession(sessionData) {
  try {
    const {
      user_id,
      session_token,
      ip_address,
      user_agent,
      expires_at,
    } = sessionData;

    const query = `
      INSERT INTO user_sessions (
        user_id,
        session_token,
        ip_address,
        user_agent,
        expires_at,
        is_active
      ) VALUES ($1, $2, $3, $4, $5, true)
      RETURNING *
    `;

    const result = await pool.query(query, [
      user_id,
      session_token,
      ip_address,
      user_agent,
      expires_at,
    ]);

    return {
      success: true,
      data: result.rows[0],
    };
  } catch (error) {
    logger.error('Error creating session:', error);
    throw error;
  }
}

/**
 * End user session
 */
async function endSession(sessionToken) {
  try {
    const query = `
      UPDATE user_sessions
      SET is_active = false, ended_at = NOW()
      WHERE session_token = $1
      RETURNING *
    `;

    const result = await pool.query(query, [sessionToken]);

    return {
      success: true,
      data: result.rows[0],
    };
  } catch (error) {
    logger.error('Error ending session:', error);
    throw error;
  }
}

/**
 * Get active sessions for a user
 */
async function getUserSessions(userId) {
  try {
    const query = `
      SELECT 
        id,
        session_token,
        ip_address,
        user_agent,
        created_at,
        last_activity,
        expires_at,
        is_active
      FROM user_sessions
      WHERE user_id = $1 AND is_active = true
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [userId]);

    return {
      success: true,
      data: result.rows,
    };
  } catch (error) {
    logger.error('Error fetching user sessions:', error);
    throw error;
  }
}

/**
 * Clean up expired sessions
 */
async function cleanupExpiredSessions() {
  try {
    const query = `
      UPDATE user_sessions
      SET is_active = false
      WHERE is_active = true AND expires_at < NOW()
      RETURNING id
    `;

    const result = await pool.query(query);

    logger.info(`Cleaned up ${result.rows.length} expired sessions`);

    return {
      success: true,
      cleaned: result.rows.length,
    };
  } catch (error) {
    logger.error('Error cleaning up sessions:', error);
    throw error;
  }
}

/**
 * Get audit statistics
 */
async function getAuditStatistics(filters = {}) {
  try {
    const {
      library_id,
      tenant_id,
      start_date,
      end_date,
    } = filters;

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (library_id) {
      conditions.push(`library_id = $${paramIndex}`);
      params.push(library_id);
      paramIndex++;
    }

    if (tenant_id) {
      conditions.push(`tenant_id = $${paramIndex}`);
      params.push(tenant_id);
      paramIndex++;
    }

    if (start_date) {
      conditions.push(`created_at >= $${paramIndex}`);
      params.push(start_date);
      paramIndex++;
    }

    if (end_date) {
      conditions.push(`created_at <= $${paramIndex}`);
      params.push(end_date);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get statistics by event type
    const eventStatsQuery = `
      SELECT 
        event_type,
        COUNT(*) as count,
        COUNT(DISTINCT user_id) as unique_users
      FROM audit_logs
      ${whereClause}
      GROUP BY event_type
      ORDER BY count DESC
    `;

    const eventStatsResult = await pool.query(eventStatsQuery, params);

    // Get statistics by severity
    const severityStatsQuery = `
      SELECT 
        severity,
        COUNT(*) as count
      FROM audit_logs
      ${whereClause}
      GROUP BY severity
    `;

    const severityStatsResult = await pool.query(severityStatsQuery, params);

    // Get most active users
    const activeUsersQuery = `
      SELECT 
        user_id,
        u.name,
        u.email,
        COUNT(*) as action_count
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ${whereClause}
      GROUP BY user_id, u.name, u.email
      ORDER BY action_count DESC
      LIMIT 10
    `;

    const activeUsersResult = await pool.query(activeUsersQuery, params);

    return {
      success: true,
      data: {
        by_event_type: eventStatsResult.rows,
        by_severity: severityStatsResult.rows,
        most_active_users: activeUsersResult.rows,
      },
    };
  } catch (error) {
    logger.error('Error fetching audit statistics:', error);
    throw error;
  }
}

module.exports = {
  AUDIT_EVENTS,
  logAudit,
  getAuditLogs,
  getSecurityEvents,
  createSession,
  endSession,
  getUserSessions,
  cleanupExpiredSessions,
  getAuditStatistics,
};








