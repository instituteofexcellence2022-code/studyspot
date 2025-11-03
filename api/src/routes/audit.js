/**
 * Audit & Security Routes
 * Comprehensive audit logging and security monitoring
 */

const express = require('express');
const router = express.Router();
const {
  logAudit,
  getAuditLogs,
  getSecurityEvents,
  getUserSessions,
  endSession,
  cleanupExpiredSessions,
  getAuditStatistics,
  AUDIT_EVENTS,
} = require('../services/auditService');
const { verifyToken: authenticate } = require('../middleware/auth');
const { requireAnyPermission } = require('../middleware/rbac');

/**
 * @swagger
 * /api/audit/logs:
 *   get:
 *     summary: Get audit logs with filtering
 *     tags: [Audit & Security]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: event_type
 *         schema:
 *           type: string
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [info, warning, critical]
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 */
router.get('/logs', authenticate, requireAnyPermission(['admin', 'view_audit_logs']), async (req, res) => {
  try {
    const filters = {
      event_type: req.query.event_type,
      user_id: req.query.user_id,
      target_resource_type: req.query.target_resource_type,
      severity: req.query.severity,
      library_id: req.query.library_id || req.user.library_id,
      tenant_id: req.user.tenant_id,
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      ip_address: req.query.ip_address,
    };

    const pagination = {
      page: req.query.page,
      limit: req.query.limit,
      sort_by: req.query.sort_by,
      sort_order: req.query.sort_order,
    };

    const result = await getAuditLogs(filters, pagination);

    res.json(result);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching audit logs',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/audit/security-events:
 *   get:
 *     summary: Get security events (failed logins, unauthorized access)
 *     tags: [Audit & Security]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Security events retrieved successfully
 */
router.get('/security-events', authenticate, requireAnyPermission(['admin', 'view_audit_logs']), async (req, res) => {
  try {
    const filters = {
      library_id: req.query.library_id || req.user.library_id,
      tenant_id: req.user.tenant_id,
      start_date: req.query.start_date,
      end_date: req.query.end_date,
    };

    const result = await getSecurityEvents(filters);

    res.json(result);
  } catch (error) {
    console.error('Error fetching security events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching security events',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/audit/statistics:
 *   get:
 *     summary: Get audit statistics
 *     tags: [Audit & Security]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Audit statistics retrieved successfully
 */
router.get('/statistics', authenticate, requireAnyPermission(['admin', 'view_analytics']), async (req, res) => {
  try {
    const filters = {
      library_id: req.query.library_id || req.user.library_id,
      tenant_id: req.user.tenant_id,
      start_date: req.query.start_date,
      end_date: req.query.end_date,
    };

    const result = await getAuditStatistics(filters);

    res.json(result);
  } catch (error) {
    console.error('Error fetching audit statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching audit statistics',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/audit/sessions:
 *   get:
 *     summary: Get active sessions for current user
 *     tags: [Audit & Security]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User sessions retrieved successfully
 */
router.get('/sessions', authenticate, async (req, res) => {
  try {
    const result = await getUserSessions(req.user.id);

    res.json(result);
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user sessions',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/audit/sessions/{sessionToken}:
 *   delete:
 *     summary: End a specific session
 *     tags: [Audit & Security]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionToken
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session ended successfully
 */
router.delete('/sessions/:sessionToken', authenticate, async (req, res) => {
  try {
    const { sessionToken } = req.params;

    const result = await endSession(sessionToken);

    // Log the session termination
    await logAudit({
      event_type: 'session_ended',
      user_id: req.user.id,
      action: 'end_session',
      description: `User ended session: ${sessionToken}`,
      ip_address: req.ip,
      user_agent: req.get('user-agent'),
      library_id: req.user.library_id,
      tenant_id: req.user.tenant_id,
    });

    res.json(result);
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({
      success: false,
      message: 'Error ending session',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/audit/sessions/cleanup:
 *   post:
 *     summary: Clean up expired sessions
 *     tags: [Audit & Security]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Expired sessions cleaned up successfully
 */
router.post('/sessions/cleanup', authenticate, requireAnyPermission(['admin']), async (req, res) => {
  try {
    const result = await cleanupExpiredSessions();

    // Log the cleanup
    await logAudit({
      event_type: 'system_maintenance',
      user_id: req.user.id,
      action: 'cleanup_sessions',
      description: `Cleaned up ${result.cleaned} expired sessions`,
      ip_address: req.ip,
      user_agent: req.get('user-agent'),
      severity: 'info',
      library_id: req.user.library_id,
      tenant_id: req.user.tenant_id,
    });

    res.json(result);
  } catch (error) {
    console.error('Error cleaning up sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Error cleaning up sessions',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/audit/event-types:
 *   get:
 *     summary: Get all available audit event types
 *     tags: [Audit & Security]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Event types retrieved successfully
 */
router.get('/event-types', authenticate, requireAnyPermission(['admin', 'view_audit_logs']), async (req, res) => {
  try {
    res.json({
      success: true,
      data: Object.values(AUDIT_EVENTS),
    });
  } catch (error) {
    console.error('Error fetching event types:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event types',
      error: error.message,
    });
  }
});

module.exports = router;

