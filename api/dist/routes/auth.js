const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
  body,
  validationResult
} = require('express-validator');
const {
  query
} = require('../config/database');
const {
  setSession,
  getSession,
  deleteSession
} = require('../config/redis');
const {
  AppError,
  asyncHandler
} = require('../middleware/errorHandler');
const {
  logger
} = require('../utils/logger');
const router = express.Router();

// Import auth middleware
const {
  verifyToken: auth
} = require('../middleware/auth');

// Generate JWT token
const generateToken = payload => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

// Generate refresh token
const generateRefreshToken = payload => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  });
};

// Register new user
router.post('/register', [body('email').isEmail().normalizeEmail(), body('password').isLength({
  min: 8
}).withMessage('Password must be at least 8 characters long'), body('firstName').trim().isLength({
  min: 1
}).withMessage('First name is required'), body('lastName').trim().isLength({
  min: 1
}).withMessage('Last name is required'), body('phone').optional().isMobilePhone(), body('role').isIn(['student', 'library_staff', 'library_owner', 'branch_manager', 'front_desk_staff', 'facility_manager', 'finance_manager', 'analytics_manager', 'super_admin', 'platform_support']).withMessage('Invalid role'), body('tenantId').optional().isUUID()], asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }
  const {
    email,
    password,
    firstName,
    lastName,
    phone,
    role,
    tenantId
  } = req.body;

  // Check if user already exists
  const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existingUser.rows.length > 0) {
    throw new AppError('User already exists with this email', 409, 'USER_EXISTS');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user
  const newUser = await query(`
    INSERT INTO users (email, password, first_name, last_name, phone, role, tenant_id, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
    RETURNING id, email, first_name, last_name, phone, role, tenant_id, status, created_at
  `, [email, hashedPassword, firstName, lastName, phone, role, tenantId || '00000000-0000-0000-0000-000000000000']);
  const user = newUser.rows[0];

  // Generate tokens
  const tokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    tenantId: user.tenant_id
  };
  const accessToken = generateToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // Store refresh token in Redis
  await setSession(`refresh:${user.id}`, {
    refreshToken
  }, 7 * 24 * 60 * 60); // 7 days

  // Log registration
  logger.logBusinessEvent('user_registered', {
    userId: user.id,
    email: user.email,
    role: user.role
  });
  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        role: user.role,
        status: user.status,
        createdAt: user.created_at
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      }
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Login user
router.post('/login', [body('email').isEmail().normalizeEmail(), body('password').notEmpty().withMessage('Password is required')], asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }
  const {
    email,
    password
  } = req.body;

  // Find user
  const userResult = await query('SELECT * FROM users WHERE email = $1 AND status = $2', [email, 'active']);
  if (userResult.rows.length === 0) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }
  const user = userResult.rows[0];

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    // Log failed login attempt
    logger.logSecurityEvent('login_failed', {
      email,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  // Update last login
  await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

  // Generate tokens
  const tokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    tenantId: user.tenant_id
  };
  const accessToken = generateToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // Store refresh token in Redis
  await setSession(`refresh:${user.id}`, {
    refreshToken
  }, 7 * 24 * 60 * 60); // 7 days

  // Log successful login
  logger.logBusinessEvent('user_logged_in', {
    userId: user.id,
    email: user.email,
    role: user.role
  });
  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        role: user.role,
        status: user.status,
        lastLogin: new Date().toISOString()
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      }
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Refresh token
router.post('/refresh', [body('refreshToken').notEmpty().withMessage('Refresh token is required')], asyncHandler(async (req, res) => {
  const {
    refreshToken
  } = req.body;
  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);

    // Check if refresh token exists in Redis
    const storedToken = await getSession(`refresh:${decoded.id}`);
    if (!storedToken || storedToken.refreshToken !== refreshToken) {
      throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }

    // Generate new access token
    const tokenPayload = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      tenantId: decoded.tenantId
    };
    const newAccessToken = generateToken(tokenPayload);
    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Refresh token expired', 401, 'REFRESH_TOKEN_EXPIRED');
    }
    throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
  }
}));

// Get current user profile
router.get('/me', auth, asyncHandler(async (req, res) => {
  // req.user is set by auth middleware
  const userId = req.user.id;

  // Get user details from database
  const result = await query(`SELECT 
      id, email, first_name, last_name, phone, role, 
      status, tenant_id, avatar_url, preferences, 
      created_at, updated_at, last_login
     FROM users 
     WHERE id = $1`, [userId]);
  if (result.rows.length === 0) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }
  const user = result.rows[0];

  // Format response
  const userProfile = {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    phone: user.phone,
    role: user.role,
    status: user.status,
    tenantId: user.tenant_id,
    avatarUrl: user.avatar_url,
    preferences: user.preferences,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
    lastLogin: user.last_login
  };
  logger.info('User profile retrieved', {
    userId: user.id,
    email: user.email
  });
  res.json({
    success: true,
    data: {
      user: userProfile
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Logout user
router.post('/logout', asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Authorization token required', 401, 'TOKEN_REQUIRED');
  }
  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Delete refresh token from Redis
    await deleteSession(`refresh:${decoded.id}`);

    // Log logout
    logger.logBusinessEvent('user_logged_out', {
      userId: decoded.id,
      email: decoded.email
    });
    res.json({
      success: true,
      data: {
        message: 'Logged out successfully'
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    throw new AppError('Invalid token', 401, 'INVALID_TOKEN');
  }
}));

// Forgot password
router.post('/forgot-password', [body('email').isEmail().normalizeEmail()], asyncHandler(async (req, res) => {
  const {
    email
  } = req.body;

  // Check if user exists
  const userResult = await query('SELECT id, email, first_name FROM users WHERE email = $1 AND status = $2', [email, 'active']);
  if (userResult.rows.length === 0) {
    // Don't reveal if user exists or not
    return res.json({
      success: true,
      data: {
        message: 'If an account with that email exists, a password reset link has been sent'
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  }
  const user = userResult.rows[0];

  // Generate reset token
  const resetToken = jwt.sign({
    id: user.id,
    email: user.email
  }, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });

  // Store reset token in Redis
  await setSession(`reset:${user.id}`, {
    resetToken
  }, 3600); // 1 hour

  // Send password reset email
  try {
    // Check if email service is enabled
    if (process.env.EMAIL_ENABLED === 'true') {
      // Email service integration (requires email service setup)
      // For Brevo/SendGrid integration, see: communication/agent-1-backend/DAY_3_4_INTEGRATIONS_COMPLETE.md
      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

      // Email template
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hello,</p>
          <p>We received a request to reset your password for your StudySpot account.</p>
          <p>Click the button below to reset your password:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">Reset Password</a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all;">${resetLink}</p>
          <p><strong>This link will expire in 1 hour.</strong></p>
          <p>If you didn't request this password reset, you can safely ignore this email.</p>
          <p>Best regards,<br>The StudySpot Team</p>
        </div>
      `;

      // In production, send actual email using configured service
      // Example: await emailService.send(user.email, 'Password Reset', emailHtml);

      logger.info('Password reset email would be sent', {
        userId: user.id,
        email: user.email,
        resetLink
      });
    } else {
      // Demo mode: Log the reset token
      logger.info('Password reset token generated (demo mode)', {
        userId: user.id,
        email: user.email,
        resetToken,
        resetLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`,
        note: 'Enable EMAIL_ENABLED=true and configure email service to send actual emails'
      });
    }
  } catch (emailError) {
    // Don't fail the request if email fails - token is still valid
    logger.error('Failed to send password reset email', {
      error: emailError.message,
      userId: user.id,
      email: user.email
    });
  }
  res.json({
    success: true,
    data: {
      message: 'If an account with that email exists, a password reset link has been sent'
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Reset password
router.post('/reset-password', [body('token').notEmpty().withMessage('Reset token is required'), body('newPassword').isLength({
  min: 8
}).withMessage('Password must be at least 8 characters long')], asyncHandler(async (req, res) => {
  const {
    token,
    newPassword
  } = req.body;
  try {
    // Verify reset token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if reset token exists in Redis
    const storedToken = await getSession(`reset:${decoded.id}`);
    if (!storedToken || storedToken.resetToken !== token) {
      throw new AppError('Invalid or expired reset token', 400, 'INVALID_RESET_TOKEN');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [hashedPassword, decoded.id]);

    // Delete reset token from Redis
    await deleteSession(`reset:${decoded.id}`);

    // Log password reset
    logger.logSecurityEvent('password_reset', {
      userId: decoded.id,
      email: decoded.email
    });
    res.json({
      success: true,
      data: {
        message: 'Password reset successfully'
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Reset token expired', 400, 'RESET_TOKEN_EXPIRED');
    }
    throw new AppError('Invalid reset token', 400, 'INVALID_RESET_TOKEN');
  }
}));
module.exports = router;