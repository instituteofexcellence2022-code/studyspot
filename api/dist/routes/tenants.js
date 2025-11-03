/**
 * Tenant Management Routes
 * Created by: Agent 1 (Backend Developer)
 * Date: October 21, 2025
 * 
 * Handles tenant onboarding, management, settings, and analytics
 */

const express = require('express');
const router = express.Router();
const {
  body,
  param,
  query,
  validationResult
} = require('express-validator');
const {
  query: dbQuery
} = require('../config/database');
const {
  verifyToken: authenticate
} = require('../middleware/auth');
const logger = require('../utils/logger');
const crypto = require('crypto');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

// Authorization middleware - Super Admin only
const requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: Super admin access required'
    });
  }
  next();
};

// Authorization middleware - Tenant Owner or Super Admin
const requireTenantOwnerOrAdmin = (req, res, next) => {
  const tenantId = req.params.id || req.params.tenantId;
  if (req.user.role === 'super_admin' || req.user.tenantId === tenantId) {
    return next();
  }
  return res.status(403).json({
    success: false,
    error: 'Forbidden: Tenant owner or super admin access required'
  });
};

// ============================================
// TENANT ONBOARDING
// ============================================

/**
 * POST /api/tenants/onboard
 * Create new tenant (Super Admin only)
 */
router.post('/onboard', authenticate, requireSuperAdmin, [body('name').trim().isLength({
  min: 2,
  max: 255
}).withMessage('Tenant name must be 2-255 characters'), body('domain').trim().isLength({
  min: 3,
  max: 100
}).withMessage('Domain must be 3-100 characters'), body('ownerEmail').isEmail().withMessage('Valid email required'), body('ownerName').trim().isLength({
  min: 2
}).withMessage('Owner name required'), body('phone').optional().isMobilePhone().withMessage('Valid phone number required'), body('businessType').optional().isString(), body('address').optional().isString(), body('city').optional().isString(), body('state').optional().isString(), body('country').optional().isString()], validate, async (req, res) => {
  try {
    const {
      name,
      domain,
      ownerEmail,
      ownerName,
      phone,
      businessType,
      address,
      city,
      state,
      country
    } = req.body;

    // Check if domain already exists
    const domainCheck = await dbQuery('SELECT id FROM tenants WHERE domain = $1', [domain]);
    if (domainCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Domain already exists'
      });
    }

    // Check if owner email already exists
    const emailCheck = await dbQuery('SELECT id FROM users WHERE email = $1', [ownerEmail]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // Generate temporary password
    const tempPassword = crypto.randomBytes(8).toString('hex');
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // Create tenant
    const tenantResult = await dbQuery(`
        INSERT INTO tenants (
          name, domain, owner_name, owner_email, phone,
          business_type, address, city, state, country,
          onboarding_status, onboarding_step, is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `, [name, domain, ownerName, ownerEmail, phone, businessType, address, city, state, country || 'India', 'pending', 1, true]);
    const tenant = tenantResult.rows[0];

    // Create owner user account
    const userResult = await dbQuery(`
        INSERT INTO users (
          tenant_id, email, password, first_name, last_name,
          phone, role, is_active, email_verified
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, email, first_name, last_name, role
      `, [tenant.id, ownerEmail, hashedPassword, ownerName.split(' ')[0], ownerName.split(' ').slice(1).join(' ') || ownerName.split(' ')[0], phone, 'library_owner', true, false]);
    const owner = userResult.rows[0];

    // Log activity
    await dbQuery(`
        INSERT INTO tenant_activity_log (
          tenant_id, activity_type, description,
          performed_by, ip_address, user_agent
        )
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [tenant.id, 'onboarding', 'Tenant account created', req.user.id, req.ip, req.get('user-agent')]);
    logger.info('Tenant onboarded successfully', {
      tenantId: tenant.id,
      domain,
      ownerEmail
    });

    // Send welcome email with credentials
    try {
      if (process.env.EMAIL_ENABLED === 'true') {
        const loginUrl = `https://${domain}.studyspot.com/login`;

        // Welcome email template
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Welcome to StudySpot!</h2>
              <p>Hello ${ownerFirstName},</p>
              <p>Congratulations! Your StudySpot tenant has been successfully created.</p>
              
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Your Account Details</h3>
                <p><strong>Tenant Name:</strong> ${tenantName}</p>
                <p><strong>Domain:</strong> ${domain}.studyspot.com</p>
                <p><strong>Email:</strong> ${ownerEmail}</p>
                <p><strong>Temporary Password:</strong> ${tempPassword}</p>
              </div>
              
              <p><strong>Important:</strong> Please change your password after your first login.</p>
              
              <a href="${loginUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">Login to Your Account</a>
              
              <h3>Next Steps:</h3>
              <ol>
                <li>Log in with your credentials</li>
                <li>Change your password</li>
                <li>Configure your tenant settings</li>
                <li>Add team members</li>
                <li>Set up your subscription plan</li>
              </ol>
              
              <p>If you have any questions, feel free to reach out to our support team.</p>
              <p>Best regards,<br>The StudySpot Team</p>
            </div>
          `;

        // In production, send actual email using configured service
        // Example: await emailService.send(ownerEmail, 'Welcome to StudySpot!', emailHtml);

        logger.info('Welcome email would be sent', {
          tenantId: tenant.id,
          email: ownerEmail,
          loginUrl
        });
      } else {
        // Demo mode: Log the credentials
        logger.info('Tenant credentials generated (demo mode)', {
          tenantId: tenant.id,
          tenantName,
          domain,
          ownerEmail,
          temporaryPassword: tempPassword,
          loginUrl: `https://${domain}.studyspot.com/login`,
          note: 'Enable EMAIL_ENABLED=true to send actual welcome emails'
        });
      }
    } catch (emailError) {
      // Don't fail the request if email fails
      logger.error('Failed to send welcome email', {
        error: emailError.message,
        tenantId: tenant.id,
        email: ownerEmail
      });
    }
    res.status(201).json({
      success: true,
      data: {
        tenant: {
          id: tenant.id,
          name: tenant.name,
          domain: tenant.domain,
          onboarding_status: tenant.onboarding_status
        },
        owner: {
          id: owner.id,
          email: owner.email,
          name: `${owner.first_name} ${owner.last_name}`,
          role: owner.role
        },
        credentials: {
          email: ownerEmail,
          temporaryPassword: tempPassword,
          loginUrl: `https://${domain}.studyspot.com/login`
        },
        nextSteps: ['Login with provided credentials', 'Change password', 'Complete profile setup', 'Add first library', 'Choose subscription plan']
      }
    });
  } catch (error) {
    logger.error('Failed to onboard tenant', error);
    res.status(500).json({
      success: false,
      error: 'Failed to onboard tenant'
    });
  }
});

/**
 * PUT /api/tenants/:id/onboarding-step
 * Update onboarding progress
 */
router.put('/:id/onboarding-step', authenticate, requireTenantOwnerOrAdmin, [param('id').isUUID().withMessage('Valid tenant ID required'), body('step').isInt({
  min: 1,
  max: 10
}).withMessage('Step must be between 1-10'), body('data').optional().isObject()], validate, async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const {
      step,
      data
    } = req.body;

    // Determine status based on step
    const status = step >= 5 ? 'completed' : 'in_progress';
    const completedAt = step >= 5 ? new Date() : null;
    const result = await dbQuery(`
        UPDATE tenants
        SET 
          onboarding_step = $1,
          onboarding_status = $2,
          onboarding_completed_at = $3,
          updated_at = NOW()
        WHERE id = $4
        RETURNING *
      `, [step, status, completedAt, id]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found'
      });
    }

    // Log activity
    await dbQuery(`
        INSERT INTO tenant_activity_log (
          tenant_id, activity_type, description,
          performed_by, metadata
        )
        VALUES ($1, $2, $3, $4, $5)
      `, [id, 'onboarding', `Onboarding step ${step} completed`, req.user.id, JSON.stringify({
      step,
      data
    })]);
    res.json({
      success: true,
      data: {
        tenant: result.rows[0],
        nextStep: step < 5 ? step + 1 : null,
        isComplete: step >= 5
      }
    });
  } catch (error) {
    logger.error('Failed to update onboarding step', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update onboarding step'
    });
  }
});

/**
 * GET /api/tenants/:id/onboarding-status
 * Get onboarding status
 */
router.get('/:id/onboarding-status', authenticate, requireTenantOwnerOrAdmin, [param('id').isUUID()], validate, async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const result = await dbQuery(`
        SELECT 
          onboarding_status,
          onboarding_step,
          onboarding_completed_at
        FROM tenants
        WHERE id = $1
      `, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found'
      });
    }
    const tenant = result.rows[0];
    const progress = tenant.onboarding_step / 5 * 100;
    res.json({
      success: true,
      data: {
        status: tenant.onboarding_status,
        currentStep: tenant.onboarding_step,
        totalSteps: 5,
        progress: Math.min(progress, 100),
        completedAt: tenant.onboarding_completed_at,
        pendingTasks: tenant.onboarding_step < 5 ? ['Complete profile', 'Add library', 'Configure settings', 'Choose subscription', 'Verify account'].slice(tenant.onboarding_step - 1) : []
      }
    });
  } catch (error) {
    logger.error('Failed to get onboarding status', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get onboarding status'
    });
  }
});

// ============================================
// TENANT MANAGEMENT
// ============================================

/**
 * GET /api/tenants
 * List all tenants (Super Admin only)
 */
router.get('/', authenticate, requireSuperAdmin, [query('page').optional().isInt({
  min: 1
}).withMessage('Page must be positive integer'), query('limit').optional().isInt({
  min: 1,
  max: 100
}).withMessage('Limit must be 1-100'), query('status').optional().isIn(['active', 'suspended', 'all']), query('search').optional().isString()], validate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status || 'all';
    const search = req.query.search || '';
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    // Status filter
    if (status === 'active') {
      whereClause += ` AND is_active = true`;
    } else if (status === 'suspended') {
      whereClause += ` AND is_active = false`;
    }

    // Search filter
    if (search) {
      whereClause += ` AND (name ILIKE $${++paramCount} OR domain ILIKE $${paramCount} OR owner_email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    // Get total count
    const countResult = await dbQuery(`SELECT COUNT(*) FROM tenants ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    // Get tenants
    params.push(limit, offset);
    const result = await dbQuery(`
        SELECT 
          t.*,
          s.status as subscription_status,
          sp.display_name as plan_name
        FROM tenants t
        LEFT JOIN subscriptions s ON t.id = s.tenant_id AND s.status = 'active'
        LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
        ${whereClause}
        ORDER BY t.created_at DESC
        LIMIT $${++paramCount} OFFSET $${++paramCount}
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
    logger.error('Failed to list tenants', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list tenants'
    });
  }
});

/**
 * GET /api/tenants/:id
 * Get tenant details
 */
router.get('/:id', authenticate, requireTenantOwnerOrAdmin, [param('id').isUUID()], validate, async (req, res) => {
  try {
    const {
      id
    } = req.params;

    // Get tenant with subscription info
    const tenantResult = await dbQuery(`
        SELECT 
          t.*,
          s.id as subscription_id,
          s.status as subscription_status,
          s.billing_cycle,
          s.current_period_end,
          sp.display_name as plan_name,
          sp.features,
          sp.limits
        FROM tenants t
        LEFT JOIN subscriptions s ON t.id = s.tenant_id AND s.status = 'active'
        LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
        WHERE t.id = $1
      `, [id]);
    if (tenantResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found'
      });
    }
    const tenant = tenantResult.rows[0];

    // Get usage statistics
    const usageResult = await dbQuery(`
        SELECT 
          COUNT(DISTINCT l.id) as libraries_count,
          COUNT(DISTINCT u.id) as users_count,
          COUNT(DISTINCT b.id) as bookings_count
        FROM tenants t
        LEFT JOIN libraries l ON t.id = l.tenant_id
        LEFT JOIN users u ON t.id = u.tenant_id
        LEFT JOIN bookings b ON t.id = b.tenant_id
        WHERE t.id = $1
      `, [id]);
    const usage = usageResult.rows[0];

    // Get recent analytics
    const analyticsResult = await dbQuery(`
        SELECT *
        FROM tenant_analytics
        WHERE tenant_id = $1
        ORDER BY date DESC
        LIMIT 30
      `, [id]);
    res.json({
      success: true,
      data: {
        ...tenant,
        usage: {
          libraries: parseInt(usage.libraries_count) || 0,
          users: parseInt(usage.users_count) || 0,
          bookings: parseInt(usage.bookings_count) || 0
        },
        analytics: analyticsResult.rows
      }
    });
  } catch (error) {
    logger.error('Failed to get tenant details', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get tenant details'
    });
  }
});

/**
 * PUT /api/tenants/:id/settings
 * Update tenant settings
 */
router.put('/:id/settings', authenticate, requireTenantOwnerOrAdmin, [param('id').isUUID(), body('settings').isObject()], validate, async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const {
      settings
    } = req.body;
    const result = await dbQuery(`
        UPDATE tenants
        SET 
          settings = settings || $1::jsonb,
          updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `, [JSON.stringify(settings), id]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found'
      });
    }

    // Log activity
    await dbQuery(`
        INSERT INTO tenant_activity_log (
          tenant_id, activity_type, description,
          performed_by, metadata
        )
        VALUES ($1, $2, $3, $4, $5)
      `, [id, 'settings_change', 'Tenant settings updated', req.user.id, JSON.stringify(settings)]);
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Failed to update tenant settings', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update tenant settings'
    });
  }
});

/**
 * PUT /api/tenants/:id/branding
 * Update tenant branding
 */
router.put('/:id/branding', authenticate, requireTenantOwnerOrAdmin, [param('id').isUUID(), body('branding').isObject()], validate, async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const {
      branding
    } = req.body;
    const result = await dbQuery(`
        UPDATE tenants
        SET 
          branding = branding || $1::jsonb,
          updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `, [JSON.stringify(branding), id]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found'
      });
    }

    // Log activity
    await dbQuery(`
        INSERT INTO tenant_activity_log (
          tenant_id, activity_type, description,
          performed_by, metadata
        )
        VALUES ($1, $2, $3, $4, $5)
      `, [id, 'branding_update', 'Tenant branding updated', req.user.id, JSON.stringify(branding)]);
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Failed to update tenant branding', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update tenant branding'
    });
  }
});

/**
 * POST /api/tenants/:id/suspend
 * Suspend tenant (Super Admin only)
 */
router.post('/:id/suspend', authenticate, requireSuperAdmin, [param('id').isUUID(), body('reason').notEmpty().withMessage('Suspension reason required')], validate, async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const {
      reason
    } = req.body;

    // Suspend tenant
    const result = await dbQuery(`
        UPDATE tenants
        SET 
          is_active = false,
          suspended_at = NOW(),
          suspension_reason = $1,
          updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `, [reason, id]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found'
      });
    }

    // Disable all tenant users
    await dbQuery(`
        UPDATE users
        SET is_active = false
        WHERE tenant_id = $1
      `, [id]);

    // Log activity
    await dbQuery(`
        INSERT INTO tenant_activity_log (
          tenant_id, activity_type, description,
          performed_by, metadata
        )
        VALUES ($1, $2, $3, $4, $5)
      `, [id, 'suspension', 'Tenant suspended', req.user.id, JSON.stringify({
      reason
    })]);
    logger.info('Tenant suspended', {
      tenantId: id,
      reason
    });
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Tenant suspended successfully'
    });
  } catch (error) {
    logger.error('Failed to suspend tenant', error);
    res.status(500).json({
      success: false,
      error: 'Failed to suspend tenant'
    });
  }
});

/**
 * POST /api/tenants/:id/reactivate
 * Reactivate suspended tenant (Super Admin only)
 */
router.post('/:id/reactivate', authenticate, requireSuperAdmin, [param('id').isUUID()], validate, async (req, res) => {
  try {
    const {
      id
    } = req.params;

    // Reactivate tenant
    const result = await dbQuery(`
        UPDATE tenants
        SET 
          is_active = true,
          suspended_at = NULL,
          suspension_reason = NULL,
          updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found'
      });
    }

    // Enable tenant users
    await dbQuery(`
        UPDATE users
        SET is_active = true
        WHERE tenant_id = $1
      `, [id]);

    // Log activity
    await dbQuery(`
        INSERT INTO tenant_activity_log (
          tenant_id, activity_type, description,
          performed_by
        )
        VALUES ($1, $2, $3, $4)
      `, [id, 'reactivation', 'Tenant reactivated', req.user.id]);
    logger.info('Tenant reactivated', {
      tenantId: id
    });
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Tenant reactivated successfully'
    });
  } catch (error) {
    logger.error('Failed to reactivate tenant', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reactivate tenant'
    });
  }
});

/**
 * GET /api/tenants/:id/analytics
 * Get tenant analytics
 */
router.get('/:id/analytics', authenticate, requireTenantOwnerOrAdmin, [param('id').isUUID(), query('days').optional().isInt({
  min: 1,
  max: 365
})], validate, async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const days = parseInt(req.query.days) || 30;
    const result = await dbQuery(`
        SELECT *
        FROM tenant_analytics
        WHERE tenant_id = $1
        AND date >= CURRENT_DATE - INTERVAL '${days} days'
        ORDER BY date DESC
      `, [id]);

    // Calculate totals
    const totals = result.rows.reduce((acc, row) => ({
      total_users: acc.total_users + row.total_users,
      total_bookings: acc.total_bookings + row.total_bookings,
      total_revenue: acc.total_revenue + parseFloat(row.revenue),
      total_sms: acc.total_sms + row.sms_sent,
      total_emails: acc.total_emails + row.emails_sent
    }), {
      total_users: 0,
      total_bookings: 0,
      total_revenue: 0,
      total_sms: 0,
      total_emails: 0
    });
    res.json({
      success: true,
      data: {
        analytics: result.rows,
        summary: totals,
        period: `Last ${days} days`
      }
    });
  } catch (error) {
    logger.error('Failed to get tenant analytics', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get tenant analytics'
    });
  }
});
module.exports = router;