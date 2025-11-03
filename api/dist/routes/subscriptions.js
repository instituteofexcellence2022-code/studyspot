const express = require('express');
const router = express.Router();
const {
  body,
  query,
  param,
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
// SUBSCRIPTION MANAGEMENT ROUTES
// =====================================================

/**
 * @route   GET /api/subscriptions/plans
 * @desc    Get available subscription plans
 * @access  Public
 */
router.get('/plans', async (req, res) => {
  try {
    const plans = [{
      id: 'free',
      name: 'Free Tier',
      description: 'Perfect for getting started',
      price: 0,
      billingCycle: 'monthly',
      features: ['1 Library Location', 'Up to 50 Seats', 'Basic Analytics', 'Email Support', 'QR Attendance System', 'Essential Reports'],
      maxLibraries: 1,
      maxSeats: 50,
      maxStaff: 2
    }, {
      id: 'starter',
      name: 'Starter',
      description: 'Perfect for small libraries',
      price: 99,
      billingCycle: 'monthly',
      features: ['2 Library Locations', 'Up to 200 Seats', '5 Staff Members', 'Advanced Analytics', 'Priority Support', 'WhatsApp Integration', 'Multi-branch Support'],
      maxLibraries: 2,
      maxSeats: 200,
      maxStaff: 5
    }, {
      id: 'professional',
      name: 'Professional',
      description: 'Most popular for growing businesses',
      price: 249,
      billingCycle: 'monthly',
      features: ['Unlimited Library Locations', 'Up to 1000 Seats', 'Unlimited Staff', 'AI-powered Analytics', 'Priority Support', 'WhatsApp Business API', 'API Access', 'Custom Integrations', 'Advanced Reporting'],
      maxLibraries: -1,
      maxSeats: 1000,
      maxStaff: -1,
      isPopular: true
    }, {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For large organizations',
      price: 599,
      billingCycle: 'monthly',
      features: ['Unlimited Libraries', 'Unlimited Seats', 'Unlimited Staff', 'AI-powered Features', '24/7 Dedicated Support', 'White-label Solution', 'Full API Access', 'Custom Development', 'SLA Guarantee', 'Custom Domain'],
      maxLibraries: -1,
      maxSeats: -1,
      maxStaff: -1
    }];
    res.json({
      success: true,
      data: {
        plans
      }
    });
  } catch (error) {
    logger.error('Error fetching plans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch plans',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/subscriptions/current
 * @desc    Get current subscription
 * @access  Private
 */
router.get('/current', verifyToken, async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    // TODO: Fetch from database
    const currentSubscription = {
      planId: '2',
      planName: 'Professional',
      price: 2499,
      billingCycle: 'monthly',
      status: 'active',
      startDate: '2025-10-23',
      nextBillingDate: '2025-11-23',
      autoRenew: true
    };
    res.json({
      success: true,
      data: {
        subscription: currentSubscription
      }
    });
  } catch (error) {
    logger.error('Error fetching subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/subscriptions/upgrade
 * @desc    Upgrade subscription plan
 * @access  Private
 */
router.post('/upgrade', verifyToken, [body('planId').notEmpty().withMessage('Plan ID is required')], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    const {
      planId
    } = req.body;
    const tenantId = req.user.tenantId;

    // TODO: Process upgrade
    logger.info('Subscription upgrade', {
      tenantId,
      planId,
      userId: req.user.id
    });
    res.json({
      success: true,
      message: 'Subscription upgraded successfully',
      data: {
        planId
      }
    });
  } catch (error) {
    logger.error('Error upgrading subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upgrade subscription',
      error: error.message
    });
  }
});

// =====================================================
// CREDITS MANAGEMENT ROUTES
// =====================================================

/**
 * @route   GET /api/subscriptions/credits/balance
 * @desc    Get credit balance
 * @access  Private
 */
router.get('/credits/balance', verifyToken, async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    // TODO: Fetch from database
    const balance = {
      smsCredits: 1245,
      whatsappCredits: 487,
      smsUsedThisMonth: 823,
      whatsappUsedThisMonth: 213,
      lowBalanceThreshold: 500
    };
    res.json({
      success: true,
      data: {
        balance
      }
    });
  } catch (error) {
    logger.error('Error fetching credit balance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch credit balance',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/subscriptions/credits/packages
 * @desc    Get available credit packages
 * @access  Private
 */
router.get('/credits/packages', verifyToken, async (req, res) => {
  try {
    const {
      type
    } = req.query; // sms or whatsapp

    const smsPackages = [{
      id: 's1',
      name: 'Starter Pack',
      type: 'sms',
      credits: 500,
      price: 299,
      validityDays: 30
    }, {
      id: 's2',
      name: 'Growth Pack',
      type: 'sms',
      credits: 1500,
      price: 799,
      bonusCredits: 100,
      validityDays: 60,
      isPopular: true
    }, {
      id: 's3',
      name: 'Business Pack',
      type: 'sms',
      credits: 5000,
      price: 2499,
      bonusCredits: 500,
      validityDays: 90
    }, {
      id: 's4',
      name: 'Enterprise Pack',
      type: 'sms',
      credits: 15000,
      price: 6999,
      bonusCredits: 2000,
      validityDays: 180
    }];
    const whatsappPackages = [{
      id: 'w1',
      name: 'Basic Pack',
      type: 'whatsapp',
      credits: 200,
      price: 399,
      validityDays: 30
    }, {
      id: 'w2',
      name: 'Standard Pack',
      type: 'whatsapp',
      credits: 600,
      price: 999,
      bonusCredits: 50,
      validityDays: 60,
      isPopular: true
    }, {
      id: 'w3',
      name: 'Premium Pack',
      type: 'whatsapp',
      credits: 2000,
      price: 2999,
      bonusCredits: 200,
      validityDays: 90
    }, {
      id: 'w4',
      name: 'Ultra Pack',
      type: 'whatsapp',
      credits: 6000,
      price: 7999,
      bonusCredits: 800,
      validityDays: 180
    }];
    let packages = [];
    if (type === 'sms') {
      packages = smsPackages;
    } else if (type === 'whatsapp') {
      packages = whatsappPackages;
    } else {
      packages = [...smsPackages, ...whatsappPackages];
    }
    res.json({
      success: true,
      data: {
        packages
      }
    });
  } catch (error) {
    logger.error('Error fetching credit packages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch credit packages',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/subscriptions/credits/purchase
 * @desc    Purchase credit package
 * @access  Private
 */
router.post('/credits/purchase', verifyToken, [body('packageId').notEmpty().withMessage('Package ID is required'), body('type').isIn(['sms', 'whatsapp']).withMessage('Invalid credit type')], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    const {
      packageId,
      type
    } = req.body;
    const tenantId = req.user.tenantId;

    // TODO: Process payment and credit addition
    logger.info('Credit package purchased', {
      tenantId,
      packageId,
      type,
      userId: req.user.id
    });
    res.json({
      success: true,
      message: 'Credits purchased successfully',
      data: {
        packageId,
        type
      }
    });
  } catch (error) {
    logger.error('Error purchasing credits:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to purchase credits',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/subscriptions/credits/usage
 * @desc    Get credit usage history
 * @access  Private
 */
router.get('/credits/usage', verifyToken, async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const {
      type,
      limit = 50
    } = req.query;

    // TODO: Fetch from database
    const history = [{
      id: '1',
      date: '2025-10-23 10:30',
      type: 'sms',
      credits: -10,
      description: 'Payment reminder',
      recipient: '+91 98765 11111'
    }, {
      id: '2',
      date: '2025-10-23 09:15',
      type: 'whatsapp',
      credits: -5,
      description: 'Welcome message',
      recipient: '+91 98765 22222'
    }, {
      id: '3',
      date: '2025-10-22 16:45',
      type: 'sms',
      credits: -25,
      description: 'Bulk fee reminder',
      recipient: 'Multiple students'
    }, {
      id: '4',
      date: '2025-10-22 14:20',
      type: 'whatsapp',
      credits: -8,
      description: 'Attendance alert',
      recipient: '+91 98765 33333'
    }, {
      id: '5',
      date: '2025-10-21 11:00',
      type: 'sms',
      credits: 1500,
      description: 'Credit purchase - Growth Pack',
      recipient: 'System'
    }];
    const filteredHistory = type ? history.filter(h => h.type === type) : history;
    res.json({
      success: true,
      data: {
        usage: filteredHistory.slice(0, limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching usage history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch usage history',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/subscriptions/credits/auto-topup
 * @desc    Configure auto-topup settings
 * @access  Private
 */
router.post('/credits/auto-topup', verifyToken, [body('type').isIn(['sms', 'whatsapp']).withMessage('Invalid credit type'), body('enabled').isBoolean().withMessage('Enabled must be boolean'), body('threshold').optional().isInt({
  min: 0
}).withMessage('Invalid threshold'), body('packageId').optional().notEmpty().withMessage('Package ID required when enabled')], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    const {
      type,
      enabled,
      threshold,
      packageId
    } = req.body;
    const tenantId = req.user.tenantId;

    // TODO: Save to database
    logger.info('Auto-topup configured', {
      tenantId,
      type,
      enabled,
      threshold,
      packageId
    });
    res.json({
      success: true,
      message: 'Auto-topup settings updated',
      data: {
        type,
        enabled,
        threshold,
        packageId
      }
    });
  } catch (error) {
    logger.error('Error configuring auto-topup:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to configure auto-topup',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/subscriptions/credits/auto-topup
 * @desc    Get auto-topup settings
 * @access  Private
 */
router.get('/credits/auto-topup', verifyToken, async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const {
      type
    } = req.query;

    // TODO: Fetch from database
    const settings = {
      sms: {
        enabled: false,
        threshold: 500,
        packageId: 's2',
        type: 'sms'
      },
      whatsapp: {
        enabled: false,
        threshold: 200,
        packageId: 'w2',
        type: 'whatsapp'
      }
    };
    const result = type ? settings[type] : settings;
    res.json({
      success: true,
      data: {
        settings: result
      }
    });
  } catch (error) {
    logger.error('Error fetching auto-topup settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch auto-topup settings',
      error: error.message
    });
  }
});
module.exports = router;