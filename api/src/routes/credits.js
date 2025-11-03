/**
 * Credit Management Routes
 * Created by: Agent 1 (Backend Developer)
 * Date: October 21, 2025
 */

const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const { query: dbQuery } = require('../config/database');
const { verifyToken: authenticate } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions');
const logger = require('../utils/logger');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// ============================================
// CREDIT PACKAGES
// ============================================

/**
 * GET /api/credits/packages
 * List available credit packages
 */
router.get('/packages',
  authenticate,
  async (req, res) => {
    try {
      const result = await dbQuery(`
        SELECT *
        FROM credit_packages
        WHERE is_active = true
        ORDER BY credit_amount ASC
      `);

      res.json({
        success: true,
        data: result.rows
      });

    } catch (error) {
      logger.error('Failed to list credit packages', error);
      res.status(500).json({
        success: false,
        error: 'Failed to list credit packages'
      });
    }
  }
);

// ============================================
// TENANT CREDITS
// ============================================

/**
 * GET /api/credits/balance
 * Get credit balance for current tenant
 */
router.get('/balance',
  authenticate,
  async (req, res) => {
    try {
      const tenantId = req.user.tenantId;

      const result = await dbQuery(`
        SELECT *
        FROM tenant_credits
        WHERE tenant_id = $1
        ORDER BY credit_type
      `, [tenantId]);

      res.json({
        success: true,
        data: result.rows
      });

    } catch (error) {
      logger.error('Failed to get credit balance', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get credit balance'
      });
    }
  }
);

/**
 * GET /api/credits/balance/:type
 * Get specific credit type balance
 */
router.get('/balance/:type',
  authenticate,
  [param('type').isIn(['sms', 'whatsapp', 'email'])],
  validate,
  async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const { type } = req.params;

      const result = await dbQuery(`
        SELECT *
        FROM tenant_credits
        WHERE tenant_id = $1 AND credit_type = $2
      `, [tenantId, type]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Credit account not found'
        });
      }

      res.json({
        success: true,
        data: result.rows[0]
      });

    } catch (error) {
      logger.error('Failed to get credit balance', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get credit balance'
      });
    }
  }
);

// ============================================
// CREDIT PURCHASES
// ============================================

/**
 * POST /api/credits/purchase
 * Purchase credit package
 */
router.post('/purchase',
  authenticate,
  [
    body('packageId').isUUID().withMessage('Valid package ID required'),
    body('paymentMethod').isIn(['stripe', 'razorpay', 'manual']).withMessage('Valid payment method required'),
  ],
  validate,
  async (req, res) => {
    try {
      const { packageId, paymentMethod } = req.body;
      const tenantId = req.user.tenantId;
      const userId = req.user.id;

      // Get package details
      const packageResult = await dbQuery(`
        SELECT * FROM credit_packages WHERE id = $1 AND is_active = true
      `, [packageId]);

      if (packageResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Package not found or not available'
        });
      }

      const pkg = packageResult.rows[0];

      // Create purchase record
      const purchaseResult = await dbQuery(`
        INSERT INTO credit_purchases (
          tenant_id, package_id, credit_type, credit_amount,
          bonus_credits, price, currency, payment_status,
          payment_method, purchased_by
        )
        VALUES ($1, $2, 'sms', $3, $4, $5, $6, 'pending', $7, $8)
        RETURNING *
      `, [
        tenantId,
        packageId,
        pkg.credit_amount,
        pkg.bonus_credits,
        pkg.price,
        pkg.currency,
        paymentMethod,
        userId
      ]);

      const purchase = purchaseResult.rows[0];

      // In production, integrate with Stripe/Razorpay here
      // For now, mark as completed (manual testing)
      if (paymentMethod === 'manual') {
        // Add credits immediately
        const totalCredits = pkg.credit_amount + pkg.bonus_credits;

        await dbQuery(`
          SELECT add_credits($1, 'sms', $2, 'purchase', $3, $4)
        `, [tenantId, pkg.credit_amount, packageId, `Purchase of ${pkg.display_name}`]);

        if (pkg.bonus_credits > 0) {
          await dbQuery(`
            SELECT add_credits($1, 'sms', $2, 'bonus', $3, $4)
          `, [tenantId, pkg.bonus_credits, packageId, `Bonus credits from ${pkg.display_name}`]);
        }

        // Mark as completed
        await dbQuery(`
          UPDATE credit_purchases
          SET payment_status = 'completed'
          WHERE id = $1
        `, [purchase.id]);
      }

      logger.info('Credit package purchased', {
        purchaseId: purchase.id,
        tenantId,
        packageId,
        amount: pkg.price
      });

      res.status(201).json({
        success: true,
        data: {
          purchase,
          package: pkg,
          totalCredits: pkg.credit_amount + pkg.bonus_credits
        },
        message: 'Purchase initiated successfully'
      });

    } catch (error) {
      logger.error('Failed to purchase credits', error);
      res.status(500).json({
        success: false,
        error: 'Failed to purchase credits'
      });
    }
  }
);

/**
 * GET /api/credits/purchases
 * Get purchase history
 */
router.get('/purchases',
  authenticate,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      // Get total count
      const countResult = await dbQuery(`
        SELECT COUNT(*) FROM credit_purchases WHERE tenant_id = $1
      `, [tenantId]);

      const total = parseInt(countResult.rows[0].count);

      // Get purchases
      const result = await dbQuery(`
        SELECT 
          cp.*,
          cpk.display_name as package_name
        FROM credit_purchases cp
        LEFT JOIN credit_packages cpk ON cp.package_id = cpk.id
        WHERE cp.tenant_id = $1
        ORDER BY cp.purchased_at DESC
        LIMIT $2 OFFSET $3
      `, [tenantId, limit, offset]);

      res.json({
        success: true,
        data: result.rows,
        meta: {
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      logger.error('Failed to get purchase history', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get purchase history'
      });
    }
  }
);

// ============================================
// CREDIT TRANSACTIONS
// ============================================

/**
 * GET /api/credits/transactions
 * Get credit transaction history
 */
router.get('/transactions',
  authenticate,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('type').optional().isIn(['sms', 'whatsapp', 'email']),
  ],
  validate,
  async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const offset = (page - 1) * limit;
      const creditType = req.query.type;

      let whereClause = 'WHERE tenant_id = $1';
      const params = [tenantId];

      if (creditType) {
        whereClause += ` AND credit_type = $${params.length + 1}`;
        params.push(creditType);
      }

      // Get total count
      const countResult = await dbQuery(
        `SELECT COUNT(*) FROM credit_transactions ${whereClause}`,
        params
      );

      const total = parseInt(countResult.rows[0].count);

      // Get transactions
      params.push(limit, offset);
      const result = await dbQuery(`
        SELECT *
        FROM credit_transactions
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${params.length - 1} OFFSET $${params.length}
      `, params);

      res.json({
        success: true,
        data: result.rows,
        meta: {
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      logger.error('Failed to get transaction history', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get transaction history'
      });
    }
  }
);

// ============================================
// CREDIT USAGE
// ============================================

/**
 * POST /api/credits/use
 * Deduct credits for usage (internal API)
 */
router.post('/use',
  authenticate,
  [
    body('type').isIn(['sms', 'whatsapp', 'email']).withMessage('Valid type required'),
    body('amount').isInt({ min: 1 }).withMessage('Amount must be positive integer'),
    body('referenceId').optional().isUUID(),
    body('description').optional().isString(),
  ],
  validate,
  async (req, res) => {
    try {
      const { type, amount, referenceId, description } = req.body;
      const tenantId = req.user.tenantId;

      // Deduct credits
      const result = await dbQuery(`
        SELECT deduct_credits($1, $2, $3, $4, $5, $6) as success
      `, [tenantId, type, amount, referenceId, 'manual', description]);

      const success = result.rows[0].success;

      if (!success) {
        return res.status(400).json({
          success: false,
          error: 'Insufficient credits'
        });
      }

      logger.info('Credits deducted', {
        tenantId,
        type,
        amount,
        userId: req.user.id
      });

      res.json({
        success: true,
        message: 'Credits deducted successfully'
      });

    } catch (error) {
      logger.error('Failed to deduct credits', error);
      res.status(500).json({
        success: false,
        error: 'Failed to deduct credits'
      });
    }
  }
);

/**
 * GET /api/credits/usage
 * Get credit usage logs
 */
router.get('/usage',
  authenticate,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('type').optional().isIn(['sms', 'whatsapp', 'email']),
  ],
  validate,
  async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const offset = (page - 1) * limit;
      const creditType = req.query.type;

      let whereClause = 'WHERE tenant_id = $1';
      const params = [tenantId];

      if (creditType) {
        whereClause += ` AND credit_type = $${params.length + 1}`;
        params.push(creditType);
      }

      // Get total count
      const countResult = await dbQuery(
        `SELECT COUNT(*) FROM credit_usage_logs ${whereClause}`,
        params
      );

      const total = parseInt(countResult.rows[0].count);

      // Get usage logs
      params.push(limit, offset);
      const result = await dbQuery(`
        SELECT *
        FROM credit_usage_logs
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${params.length - 1} OFFSET $${params.length}
      `, params);

      res.json({
        success: true,
        data: result.rows,
        meta: {
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      logger.error('Failed to get usage logs', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get usage logs'
      });
    }
  }
);

// ============================================
// AUTO-TOPUP
// ============================================

/**
 * GET /api/credits/auto-topup
 * Get auto-topup configuration
 */
router.get('/auto-topup',
  authenticate,
  async (req, res) => {
    try {
      const tenantId = req.user.tenantId;

      const result = await dbQuery(`
        SELECT *
        FROM auto_topup_config
        WHERE tenant_id = $1
      `, [tenantId]);

      res.json({
        success: true,
        data: result.rows
      });

    } catch (error) {
      logger.error('Failed to get auto-topup config', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get auto-topup config'
      });
    }
  }
);

/**
 * POST /api/credits/auto-topup
 * Configure auto-topup
 */
router.post('/auto-topup',
  authenticate,
  [
    body('creditType').isIn(['sms', 'whatsapp', 'email']),
    body('isEnabled').isBoolean(),
    body('thresholdAmount').isInt({ min: 0 }),
    body('topupPackageId').isUUID(),
    body('paymentMethod').isIn(['stripe', 'razorpay']),
  ],
  validate,
  async (req, res) => {
    try {
      const {
        creditType,
        isEnabled,
        thresholdAmount,
        topupPackageId,
        paymentMethod
      } = req.body;
      const tenantId = req.user.tenantId;

      // Get package details
      const packageResult = await dbQuery(`
        SELECT * FROM credit_packages WHERE id = $1
      `, [topupPackageId]);

      if (packageResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Package not found'
        });
      }

      const pkg = packageResult.rows[0];

      // Upsert auto-topup config
      const result = await dbQuery(`
        INSERT INTO auto_topup_config (
          tenant_id, credit_type, is_enabled, threshold_amount,
          topup_package_id, topup_amount, payment_method
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (tenant_id, credit_type) DO UPDATE SET
          is_enabled = $3,
          threshold_amount = $4,
          topup_package_id = $5,
          topup_amount = $6,
          payment_method = $7,
          updated_at = NOW()
        RETURNING *
      `, [
        tenantId,
        creditType,
        isEnabled,
        thresholdAmount,
        topupPackageId,
        pkg.credit_amount,
        paymentMethod
      ]);

      logger.info('Auto-topup configured', {
        tenantId,
        creditType,
        isEnabled
      });

      res.json({
        success: true,
        data: result.rows[0]
      });

    } catch (error) {
      logger.error('Failed to configure auto-topup', error);
      res.status(500).json({
        success: false,
        error: 'Failed to configure auto-topup'
      });
    }
  }
);

/**
 * DELETE /api/credits/auto-topup/:type
 * Disable auto-topup
 */
router.delete('/auto-topup/:type',
  authenticate,
  [param('type').isIn(['sms', 'whatsapp', 'email'])],
  validate,
  async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const { type } = req.params;

      await dbQuery(`
        UPDATE auto_topup_config
        SET is_enabled = false, updated_at = NOW()
        WHERE tenant_id = $1 AND credit_type = $2
      `, [tenantId, type]);

      res.json({
        success: true,
        message: 'Auto-topup disabled successfully'
      });

    } catch (error) {
      logger.error('Failed to disable auto-topup', error);
      res.status(500).json({
        success: false,
        error: 'Failed to disable auto-topup'
      });
    }
  }
);

module.exports = router;



