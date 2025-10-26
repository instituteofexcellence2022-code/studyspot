/**
 * Dashboard Routes
 * Provides dashboard metrics and analytics endpoints
 */

const express = require('express');
const router = express.Router();
const {
  verifyToken: authenticate
} = require('../middleware/auth');
const {
  requirePermission
} = require('../middleware/rbac');
const dashboardService = require('../services/dashboardService');
const {
  logger
} = require('../utils/logger');

/**
 * GET /api/dashboard/metrics
 * Get real-time dashboard metrics
 */
router.get('/metrics', authenticate, requirePermission('dashboard:view'), async (req, res) => {
  try {
    const {
      id: userId,
      role,
      library_id,
      tenant_id
    } = req.user;
    const result = await dashboardService.getDashboardMetrics(userId, role, library_id, tenant_id);
    res.json(result);
  } catch (error) {
    logger.error('Error fetching dashboard metrics:', error);
    res.status(500).json({
      success: false,
      errors: [{
        code: 'DASHBOARD_ERROR',
        message: 'Failed to fetch dashboard metrics'
      }]
    });
  }
});

/**
 * GET /api/dashboard/revenue-trend
 * Get revenue trend data for charts
 */
router.get('/revenue-trend', authenticate, requirePermission('dashboard:view_revenue'), async (req, res) => {
  try {
    const {
      id: userId,
      role,
      library_id,
      tenant_id
    } = req.user;
    const days = parseInt(req.query.days) || 30;
    if (days < 1 || days > 365) {
      return res.status(400).json({
        success: false,
        errors: [{
          code: 'INVALID_DAYS',
          message: 'Days must be between 1 and 365'
        }]
      });
    }
    const result = await dashboardService.getRevenueTrend(userId, role, library_id, tenant_id, days);
    res.json(result);
  } catch (error) {
    logger.error('Error fetching revenue trend:', error);
    res.status(500).json({
      success: false,
      errors: [{
        code: 'REVENUE_TREND_ERROR',
        message: 'Failed to fetch revenue trend'
      }]
    });
  }
});

/**
 * GET /api/dashboard/activity
 * Get recent activity feed
 */
router.get('/activity', authenticate, requirePermission('dashboard:view'), async (req, res) => {
  try {
    const {
      id: userId,
      role,
      library_id,
      tenant_id
    } = req.user;
    const limit = parseInt(req.query.limit) || 20;
    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        errors: [{
          code: 'INVALID_LIMIT',
          message: 'Limit must be between 1 and 100'
        }]
      });
    }
    const result = await dashboardService.getRecentActivity(userId, role, library_id, tenant_id, limit);
    res.json(result);
  } catch (error) {
    logger.error('Error fetching activity feed:', error);
    res.status(500).json({
      success: false,
      errors: [{
        code: 'ACTIVITY_ERROR',
        message: 'Failed to fetch activity feed'
      }]
    });
  }
});

/**
 * GET /api/dashboard/attendance-trend
 * Get attendance trend (last 7 days)
 */
router.get('/attendance-trend', authenticate, requirePermission('dashboard:view_analytics'), async (req, res) => {
  try {
    const {
      id: userId,
      role,
      library_id,
      tenant_id
    } = req.user;
    const result = await dashboardService.getAttendanceTrend(userId, role, library_id, tenant_id);
    res.json(result);
  } catch (error) {
    logger.error('Error fetching attendance trend:', error);
    res.status(500).json({
      success: false,
      errors: [{
        code: 'ATTENDANCE_TREND_ERROR',
        message: 'Failed to fetch attendance trend'
      }]
    });
  }
});

/**
 * GET /api/dashboard/top-branches
 * Get top performing branches (library owners only)
 */
router.get('/top-branches', authenticate, requirePermission('dashboard:view_all_branches'), async (req, res) => {
  try {
    const {
      tenant_id
    } = req.user;
    const limit = parseInt(req.query.limit) || 5;
    if (!tenant_id) {
      return res.status(400).json({
        success: false,
        errors: [{
          code: 'NO_TENANT',
          message: 'User is not associated with a tenant'
        }]
      });
    }
    const result = await dashboardService.getTopBranches(tenant_id, limit);
    res.json(result);
  } catch (error) {
    logger.error('Error fetching top branches:', error);
    res.status(500).json({
      success: false,
      errors: [{
        code: 'TOP_BRANCHES_ERROR',
        message: 'Failed to fetch top branches'
      }]
    });
  }
});
module.exports = router;