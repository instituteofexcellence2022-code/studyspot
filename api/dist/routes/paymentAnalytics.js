const express = require('express');
const router = express.Router();
const {
  query,
  validationResult
} = require('express-validator');
const {
  verifyToken
} = require('../middleware/auth');
const {
  query: dbQuery
} = require('../config/database');
const {
  logger
} = require('../utils/logger');

// =====================================================
// PAYMENT ANALYTICS ROUTES
// =====================================================

/**
 * @route   GET /api/payment-analytics/stats
 * @desc    Get payment statistics
 * @access  Private
 */
router.get('/stats', verifyToken, [query('period').optional().isIn(['today', 'week', 'month', 'quarter', 'year']).withMessage('Invalid period')], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    const {
      period = 'month'
    } = req.query;
    const tenantId = req.user.tenantId;

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'quarter':
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      case 'month':
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    // Get payment stats
    const statsQuery = `
        SELECT 
          COUNT(*) as total_payments,
          SUM(amount) as total_revenue,
          COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) as completed_payments,
          COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_payments,
          COUNT(CASE WHEN payment_status = 'failed' THEN 1 END) as failed_payments,
          AVG(amount) as avg_payment_value,
          COUNT(CASE WHEN is_verified = true THEN 1 END) * 100.0 / COUNT(*) as collection_efficiency
        FROM payments
        WHERE tenant_id = $1 
          AND deleted_at IS NULL
          AND transaction_date >= $2
      `;
    const statsResult = await dbQuery(statsQuery, [tenantId, startDate]);
    const stats = statsResult.rows[0];

    // Get previous period for growth rate
    const prevStartDate = new Date(startDate);
    switch (period) {
      case 'today':
        prevStartDate.setDate(prevStartDate.getDate() - 1);
        break;
      case 'week':
        prevStartDate.setDate(prevStartDate.getDate() - 7);
        break;
      case 'quarter':
        prevStartDate.setMonth(prevStartDate.getMonth() - 3);
        break;
      case 'year':
        prevStartDate.setFullYear(prevStartDate.getFullYear() - 1);
        break;
      case 'month':
      default:
        prevStartDate.setMonth(prevStartDate.getMonth() - 1);
    }
    const prevQuery = `
        SELECT SUM(amount) as prev_revenue
        FROM payments
        WHERE tenant_id = $1 
          AND deleted_at IS NULL
          AND transaction_date >= $2
          AND transaction_date < $3
      `;
    const prevResult = await dbQuery(prevQuery, [tenantId, prevStartDate, startDate]);
    const prevRevenue = parseFloat(prevResult.rows[0].prev_revenue || 0);
    const currentRevenue = parseFloat(stats.total_revenue || 0);
    const growthRate = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue * 100).toFixed(1) : 0;
    res.json({
      success: true,
      data: {
        period,
        stats: {
          totalRevenue: parseFloat(stats.total_revenue || 0),
          totalPayments: parseInt(stats.total_payments),
          completedPayments: parseInt(stats.completed_payments),
          pendingPayments: parseInt(stats.pending_payments),
          failedPayments: parseInt(stats.failed_payments),
          avgPaymentValue: parseFloat(stats.avg_payment_value || 0),
          collectionEfficiency: parseFloat(stats.collection_efficiency || 0),
          growthRate: parseFloat(growthRate)
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching payment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/payment-analytics/method-breakdown
 * @desc    Get payment method breakdown
 * @access  Private
 */
router.get('/method-breakdown', verifyToken, [query('period').optional().isIn(['today', 'week', 'month', 'quarter', 'year'])], async (req, res) => {
  try {
    const {
      period = 'month'
    } = req.query;
    const tenantId = req.user.tenantId;

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'quarter':
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      case 'month':
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }
    const query = `
        WITH current_period AS (
          SELECT 
            payment_method,
            COUNT(*) as count,
            SUM(amount) as amount
          FROM payments
          WHERE tenant_id = $1 
            AND deleted_at IS NULL
            AND transaction_date >= $2
          GROUP BY payment_method
        ),
        total AS (
          SELECT SUM(amount) as total_amount
          FROM payments
          WHERE tenant_id = $1 
            AND deleted_at IS NULL
            AND transaction_date >= $2
        )
        SELECT 
          cp.payment_method as method,
          cp.count,
          cp.amount,
          (cp.amount * 100.0 / NULLIF(t.total_amount, 0)) as percentage
        FROM current_period cp
        CROSS JOIN total t
        ORDER BY cp.amount DESC
      `;
    const result = await dbQuery(query, [tenantId, startDate]);
    res.json({
      success: true,
      data: {
        breakdown: result.rows.map(row => ({
          method: row.method,
          count: parseInt(row.count),
          amount: parseFloat(row.amount),
          percentage: parseFloat(row.percentage || 0),
          trend: 'up',
          // TODO: Calculate actual trend
          trendValue: 0 // TODO: Calculate actual trend value
        }))
      }
    });
  } catch (error) {
    logger.error('Error fetching method breakdown:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch method breakdown',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/payment-analytics/revenue-trends
 * @desc    Get revenue trends and forecast
 * @access  Private
 */
router.get('/revenue-trends', verifyToken, [query('period').optional().isIn(['week', 'month', 'quarter', 'year'])], async (req, res) => {
  try {
    const {
      period = 'month'
    } = req.query;
    const tenantId = req.user.tenantId;

    // Get revenue data grouped by week or day
    const query = `
        SELECT 
          DATE_TRUNC('week', transaction_date) as period_start,
          SUM(amount) as revenue,
          COUNT(*) as payments
        FROM payments
        WHERE tenant_id = $1 
          AND deleted_at IS NULL
          AND transaction_date >= NOW() - INTERVAL '1 ${period}'
        GROUP BY DATE_TRUNC('week', transaction_date)
        ORDER BY period_start ASC
      `;
    const result = await dbQuery(query, [tenantId]);

    // Simple linear forecast for next period
    const trends = result.rows;
    let forecast = null;
    if (trends.length >= 2) {
      const recentRevenues = trends.slice(-3).map(t => parseFloat(t.revenue));
      const avgRevenue = recentRevenues.reduce((a, b) => a + b, 0) / recentRevenues.length;
      forecast = avgRevenue * 1.05; // 5% growth assumption
    }
    res.json({
      success: true,
      data: {
        trends: trends.map(row => ({
          date: row.period_start,
          revenue: parseFloat(row.revenue),
          payments: parseInt(row.payments),
          forecast: null
        })),
        forecast: forecast
      }
    });
  } catch (error) {
    logger.error('Error fetching revenue trends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue trends',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/payment-analytics/pending-payments
 * @desc    Get pending payments tracking
 * @access  Private
 */
router.get('/pending-payments', verifyToken, async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const query = `
        SELECT 
          p.*,
          EXTRACT(DAY FROM (NOW() - p.transaction_date))::INTEGER as days_overdue,
          0 as reminder_count,
          NULL as last_reminder_sent
        FROM payments p
        WHERE p.tenant_id = $1 
          AND p.deleted_at IS NULL
          AND p.payment_status = 'pending'
          AND p.is_verified = false
        ORDER BY p.transaction_date ASC
      `;
    const result = await dbQuery(query, [tenantId]);
    res.json({
      success: true,
      data: {
        pendingPayments: result.rows.map(row => ({
          id: row.id,
          studentName: row.student_name,
          studentEmail: row.student_email || '',
          studentPhone: row.student_phone || '',
          amount: parseFloat(row.amount),
          dueDate: row.transaction_date,
          daysOverdue: row.days_overdue,
          description: row.description,
          paymentMethod: row.payment_method,
          reminderCount: 0,
          lastReminderSent: null
        }))
      }
    });
  } catch (error) {
    logger.error('Error fetching pending payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending payments',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/payment-analytics/send-reminder
 * @desc    Send payment reminder
 * @access  Private
 */
router.post('/send-reminder', verifyToken, async (req, res) => {
  try {
    const {
      paymentId,
      method
    } = req.body;
    if (!paymentId || !method) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID and reminder method required'
      });
    }

    // TODO: Implement actual reminder sending (email/SMS/WhatsApp)
    logger.info('Reminder sent', {
      paymentId,
      method,
      userId: req.user.id
    });
    res.json({
      success: true,
      message: `Reminder sent via ${method}`
    });
  } catch (error) {
    logger.error('Error sending reminder:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send reminder',
      error: error.message
    });
  }
});
module.exports = router;