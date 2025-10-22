const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const stripeService = require('../services/stripeService');
const { query: dbQuery } = require('../config/database');
const { verifyToken: authenticate } = require('../middleware/auth');
const logger = require('../utils/logger');
const { withStripeTransaction, withTransaction } = require('../utils/transaction');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// GET /api/subscriptions/plans - Get all subscription plans
router.get('/plans', async (req, res) => {
  try {
    const result = await dbQuery(`
      SELECT 
        id, name, display_name, description,
        price_monthly, price_yearly,
        features, limits, is_active
      FROM subscription_plans
      WHERE is_active = true
      ORDER BY price_monthly ASC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    logger.error('Failed to fetch subscription plans', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subscription plans'
    });
  }
});

// POST /api/subscriptions/create - Create new subscription
router.post('/create',
  authenticate,
  [
    body('planId').isUUID().withMessage('Valid plan ID is required'),
    body('billingCycle').isIn(['monthly', 'yearly']).withMessage('Billing cycle must be monthly or yearly'),
  ],
  validate,
  async (req, res) => {
    try {
      const { planId, billingCycle } = req.body;
      const tenantId = req.user.tenantId;

      // Get plan details
      const planResult = await dbQuery(
        'SELECT * FROM subscription_plans WHERE id = $1 AND is_active = true',
        [planId]
      );

      if (planResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Plan not found'
        });
      }

      const plan = planResult.rows[0];

      // Check if tenant already has active subscription
      const existingSubResult = await dbQuery(
        'SELECT * FROM subscriptions WHERE tenant_id = $1 AND status = $2',
        [tenantId, 'active']
      );

      if (existingSubResult.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Tenant already has an active subscription'
        });
      }

      // Get or create Stripe customer
      const tenantResult = await dbQuery(
        'SELECT name, email, stripe_customer_id FROM tenants WHERE id = $1',
        [tenantId]
      );

      const tenant = tenantResult.rows[0];
      let stripeCustomerId = tenant.stripe_customer_id;

      if (!stripeCustomerId) {
        const customerResult = await stripeService.createCustomer(
          tenant.email,
          { tenantId, tenantName: tenant.name }
        );

        if (!customerResult.success) {
          return res.status(500).json({
            success: false,
            error: 'Failed to create Stripe customer'
          });
        }

        stripeCustomerId = customerResult.customer.id;

        // Update tenant with Stripe customer ID
        await dbQuery(
          'UPDATE tenants SET stripe_customer_id = $1 WHERE id = $2',
          [stripeCustomerId, tenantId]
        );
      }

      // Get Stripe price ID based on plan and billing cycle
      const amount = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly;
      
      // Create Stripe subscription
      const stripePriceId = plan[`stripe_price_id_${billingCycle}`];
      
      if (!stripePriceId) {
        return res.status(400).json({
          success: false,
          error: 'Stripe price not configured for this plan'
        });
      }

      // ✅ Issue #7 Fixed: Wrap in transaction for data consistency
      const result = await withStripeTransaction(
        // Step 1: Create Stripe subscription
        async () => {
          const subscriptionResult = await stripeService.createSubscription(
            stripeCustomerId,
            stripePriceId,
            { tenantId, planId, billingCycle }
          );

          if (!subscriptionResult.success) {
            throw new Error('Failed to create Stripe subscription');
          }

          return subscriptionResult;
        },
        // Step 2: Save to database in transaction
        async (client, subscriptionResult) => {
          const stripeSubscription = subscriptionResult.subscription;

          const dbSubResult = await client.query(`
            INSERT INTO subscriptions (
              tenant_id, plan_id, status, billing_cycle,
              stripe_subscription_id, stripe_customer_id,
              current_period_start, current_period_end
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
          `, [
            tenantId,
            planId,
            stripeSubscription.status,
            billingCycle,
            stripeSubscription.id,
            stripeCustomerId,
            new Date(stripeSubscription.current_period_start * 1000),
            new Date(stripeSubscription.current_period_end * 1000)
          ]);

          return {
            subscription: dbSubResult.rows[0],
            clientSecret: subscriptionResult.clientSecret,
            stripeSubscriptionId: stripeSubscription.id
          };
        },
        // Step 3: Rollback Stripe if database fails
        async (subscriptionResult) => {
          const stripeSubscription = subscriptionResult.subscription;
          logger.warn('Rolling back Stripe subscription due to database error', {
            stripeSubscriptionId: stripeSubscription.id
          });
          await stripeService.cancelSubscription(stripeSubscription.id, false);
        }
      );

      res.status(201).json({
        success: true,
        data: result.dbResult
      });

    } catch (error) {
      logger.error('Failed to create subscription', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create subscription'
      });
    }
  }
);

// GET /api/subscriptions/:tenantId - Get subscription details
router.get('/:tenantId',
  authenticate,
  [
    param('tenantId').isUUID().withMessage('Valid tenant ID is required'),
  ],
  validate,
  async (req, res) => {
    try {
      const { tenantId } = req.params;

      // Check authorization
      if (req.user.tenantId !== tenantId && req.user.role !== 'super_admin') {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized access'
        });
      }

      const result = await dbQuery(`
        SELECT 
          s.*,
          sp.name as plan_name,
          sp.display_name as plan_display_name,
          sp.features,
          sp.limits
        FROM subscriptions s
        JOIN subscription_plans sp ON s.plan_id = sp.id
        WHERE s.tenant_id = $1
        ORDER BY s.created_at DESC
        LIMIT 1
      `, [tenantId]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'No subscription found'
        });
      }

      // Get usage statistics
      const usageResult = await dbQuery(`
        SELECT metric, value
        FROM subscription_usage
        WHERE subscription_id = $1
        AND period_start <= NOW()
        AND period_end >= NOW()
      `, [result.rows[0].id]);

      const usage = {};
      usageResult.rows.forEach(row => {
        usage[row.metric] = row.value;
      });

      res.json({
        success: true,
        data: {
          ...result.rows[0],
          usage
        }
      });

    } catch (error) {
      logger.error('Failed to fetch subscription', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch subscription'
      });
    }
  }
);

// PUT /api/subscriptions/:id/upgrade - Upgrade subscription
router.put('/:id/upgrade',
  authenticate,
  [
    param('id').isUUID().withMessage('Valid subscription ID is required'),
    body('newPlanId').isUUID().withMessage('Valid new plan ID is required'),
  ],
  validate,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { newPlanId } = req.body;

      // Get current subscription
      const subResult = await dbQuery(
        'SELECT * FROM subscriptions WHERE id = $1',
        [id]
      );

      if (subResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Subscription not found'
        });
      }

      const subscription = subResult.rows[0];

      // Check authorization
      if (req.user.tenantId !== subscription.tenant_id && req.user.role !== 'super_admin') {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized access'
        });
      }

      // Get new plan
      const planResult = await dbQuery(
        'SELECT * FROM subscription_plans WHERE id = $1 AND is_active = true',
        [newPlanId]
      );

      if (planResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'New plan not found'
        });
      }

      const newPlan = planResult.rows[0];
      const newPriceId = newPlan[`stripe_price_id_${subscription.billing_cycle}`];

      // Upgrade in Stripe
      const upgradeResult = await stripeService.upgradeSubscription(
        subscription.stripe_subscription_id,
        newPriceId
      );

      if (!upgradeResult.success) {
        return res.status(500).json({
          success: false,
          error: 'Failed to upgrade subscription'
        });
      }

      // Update database
      const updateResult = await dbQuery(`
        UPDATE subscriptions
        SET plan_id = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `, [newPlanId, id]);

      res.json({
        success: true,
        data: updateResult.rows[0],
        message: 'Subscription upgraded successfully'
      });

    } catch (error) {
      logger.error('Failed to upgrade subscription', error);
      res.status(500).json({
        success: false,
        error: 'Failed to upgrade subscription'
      });
    }
  }
);

// PUT /api/subscriptions/:id/downgrade - Downgrade subscription
router.put('/:id/downgrade',
  authenticate,
  [
    param('id').isUUID().withMessage('Valid subscription ID is required'),
    body('newPlanId').isUUID().withMessage('Valid new plan ID is required'),
  ],
  validate,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { newPlanId } = req.body;

      // Get current subscription
      const subResult = await dbQuery(
        'SELECT * FROM subscriptions WHERE id = $1',
        [id]
      );

      if (subResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Subscription not found'
        });
      }

      const subscription = subResult.rows[0];

      // Check authorization
      if (req.user.tenantId !== subscription.tenant_id && req.user.role !== 'super_admin') {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized access'
        });
      }

      // Get new plan
      const planResult = await dbQuery(
        'SELECT * FROM subscription_plans WHERE id = $1 AND is_active = true',
        [newPlanId]
      );

      if (planResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'New plan not found'
        });
      }

      const newPlan = planResult.rows[0];
      const newPriceId = newPlan[`stripe_price_id_${subscription.billing_cycle}`];

      // Downgrade in Stripe (applies at period end)
      const downgradeResult = await stripeService.downgradeSubscription(
        subscription.stripe_subscription_id,
        newPriceId
      );

      if (!downgradeResult.success) {
        return res.status(500).json({
          success: false,
          error: 'Failed to downgrade subscription'
        });
      }

      // Update database (mark for downgrade at period end)
      const updateResult = await dbQuery(`
        UPDATE subscriptions
        SET plan_id = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `, [newPlanId, id]);

      res.json({
        success: true,
        data: updateResult.rows[0],
        message: 'Subscription will be downgraded at the end of the current period'
      });

    } catch (error) {
      logger.error('Failed to downgrade subscription', error);
      res.status(500).json({
        success: false,
        error: 'Failed to downgrade subscription'
      });
    }
  }
);

// DELETE /api/subscriptions/:id/cancel - Cancel subscription
router.delete('/:id/cancel',
  authenticate,
  [
    param('id').isUUID().withMessage('Valid subscription ID is required'),
    body('immediate').optional().isBoolean().withMessage('Immediate must be boolean'),
  ],
  validate,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { immediate = false } = req.body;

      // Get subscription
      const subResult = await dbQuery(
        'SELECT * FROM subscriptions WHERE id = $1',
        [id]
      );

      if (subResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Subscription not found'
        });
      }

      const subscription = subResult.rows[0];

      // Check authorization
      if (req.user.tenantId !== subscription.tenant_id && req.user.role !== 'super_admin') {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized access'
        });
      }

      // Cancel in Stripe
      const cancelResult = await stripeService.cancelSubscription(
        subscription.stripe_subscription_id,
        !immediate
      );

      if (!cancelResult.success) {
        return res.status(500).json({
          success: false,
          error: 'Failed to cancel subscription'
        });
      }

      // Update database
      const updateResult = await dbQuery(`
        UPDATE subscriptions
        SET 
          status = $1,
          cancel_at_period_end = $2,
          cancelled_at = NOW(),
          updated_at = NOW()
        WHERE id = $3
        RETURNING *
      `, [
        immediate ? 'cancelled' : subscription.status,
        !immediate,
        id
      ]);

      res.json({
        success: true,
        data: updateResult.rows[0],
        message: immediate 
          ? 'Subscription cancelled immediately' 
          : 'Subscription will be cancelled at the end of the current period'
      });

    } catch (error) {
      logger.error('Failed to cancel subscription', error);
      res.status(500).json({
        success: false,
        error: 'Failed to cancel subscription'
      });
    }
  }
);

// GET /api/subscriptions/:tenantId/invoices - Get invoices
router.get('/:tenantId/invoices',
  authenticate,
  [
    param('tenantId').isUUID().withMessage('Valid tenant ID is required'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  ],
  validate,
  async (req, res) => {
    try {
      const { tenantId } = req.params;
      const { limit = 10 } = req.query;

      // Check authorization
      if (req.user.tenantId !== tenantId && req.user.role !== 'super_admin') {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized access'
        });
      }

      const result = await dbQuery(`
        SELECT * FROM invoices
        WHERE tenant_id = $1
        ORDER BY created_at DESC
        LIMIT $2
      `, [tenantId, limit]);

      res.json({
        success: true,
        data: result.rows
      });

    } catch (error) {
      logger.error('Failed to fetch invoices', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch invoices'
      });
    }
  }
);

// POST /api/subscriptions/:id/portal - Create customer portal session
router.post('/:id/portal',
  authenticate,
  [
    param('id').isUUID().withMessage('Valid subscription ID is required'),
  ],
  validate,
  async (req, res) => {
    try {
      const { id } = req.params;

      // Get subscription
      const subResult = await dbQuery(
        'SELECT * FROM subscriptions WHERE id = $1',
        [id]
      );

      if (subResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Subscription not found'
        });
      }

      const subscription = subResult.rows[0];

      // Check authorization
      if (req.user.tenantId !== subscription.tenant_id) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized access'
        });
      }

      // Create portal session
      const returnUrl = `${process.env.FRONTEND_URL}/dashboard/subscription`;
      const portalResult = await stripeService.createPortalSession(
        subscription.stripe_customer_id,
        returnUrl
      );

      if (!portalResult.success) {
        return res.status(500).json({
          success: false,
          error: 'Failed to create portal session'
        });
      }

      res.json({
        success: true,
        data: {
          url: portalResult.session.url
        }
      });

    } catch (error) {
      logger.error('Failed to create portal session', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create portal session'
      });
    }
  }
);

module.exports = router;

