// ============================================
// AUTH SERVICE
// Authentication and authorization
// Port: 3001
// ============================================

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { coreDb } from '../../config/database';
import { logger } from '../../utils/logger';
import { HTTP_STATUS, ERROR_CODES } from '../../config/constants';
import type { AdminUser } from '../../types';

dotenv.config();

const fastify = Fastify({ logger: false });
const PORT = parseInt(process.env.AUTH_SERVICE_PORT || '3001');

// ============================================
// MIDDLEWARE
// ============================================

fastify.register(cors, {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3002'],
  credentials: true,
});

fastify.register(helmet);

fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
});

// ============================================
// HELPER FUNCTIONS
// ============================================

const generateAccessToken = (user: any) => {
  return fastify.jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenant_id,
      permissions: user.permissions,
      type: 'access',
    },
    { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRY || '15m' }
  );
};

const generateRefreshToken = (user: any) => {
  return fastify.jwt.sign(
    {
      userId: user.id,
      type: 'refresh',
    },
    { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRY || '7d' }
  );
};

// ============================================
// ROUTES
// ============================================

// Health check
fastify.get('/health', async () => {
  return {
    success: true,
    data: {
      status: 'healthy',
      service: 'auth-service',
      timestamp: new Date().toISOString(),
    },
  };
});

// Admin login
fastify.post('/api/v1/auth/admin/login', async (request, reply) => {
  try {
    const { email, password } = request.body as { email: string; password: string };

    // Validate input
    if (!email || !password) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.REQUIRED_FIELD_MISSING,
          message: 'Email and password are required',
        },
      });
    }

    // Find admin user
    const result = await coreDb.query<AdminUser>(
      'SELECT * FROM admin_users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (!result.rows.length) {
      return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: {
          code: ERROR_CODES.INVALID_CREDENTIALS,
          message: 'Invalid email or password',
        },
      });
    }

    const user = result.rows[0];

    // Check if account is active
    if (!user.is_active) {
      return reply.status(HTTP_STATUS.FORBIDDEN).send({
        success: false,
        error: {
          code: ERROR_CODES.ACCOUNT_INACTIVE,
          message: 'Account is inactive. Please contact administrator.',
        },
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: {
          code: ERROR_CODES.INVALID_CREDENTIALS,
          message: 'Invalid email or password',
        },
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token
    await coreDb.query(
      `INSERT INTO refresh_tokens (user_id, user_type, token, expires_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '7 days')`,
      [user.id, 'admin', refreshToken]
    );

    // Update last login
    await coreDb.query(
      'UPDATE admin_users SET last_login_at = NOW(), last_login_ip = $1 WHERE id = $2',
      [request.ip, user.id]
    );

    // Create audit log
    await coreDb.query(
      `INSERT INTO audit_logs (user_id, user_type, action, ip_address)
       VALUES ($1, $2, $3, $4)`,
      [user.id, 'admin', 'login', request.ip]
    );

    // Remove sensitive data
    const { password_hash, ...safeUser } = user;

    return {
      success: true,
      data: {
        user: safeUser,
        accessToken,
        refreshToken,
      },
      message: 'Login successful',
    };
  } catch (error: any) {
    logger.error('Admin login error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Login failed',
      },
    });
  }
});

// Tenant login (placeholder for future)
fastify.post('/api/v1/auth/tenant/login', async (request, reply) => {
  // TODO: Implement tenant login
  return reply.status(HTTP_STATUS.NOT_FOUND).send({
    success: false,
    error: {
      code: ERROR_CODES.RESOURCE_NOT_FOUND,
      message: 'Tenant login not yet implemented',
    },
  });
});

// Logout
fastify.post('/api/v1/auth/logout', async (request, reply) => {
  try {
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: {
          code: ERROR_CODES.INVALID_TOKEN,
          message: 'No token provided',
        },
      });
    }

    // Revoke refresh token
    await coreDb.query(
      'UPDATE refresh_tokens SET revoked_at = NOW() WHERE token = $1',
      [token]
    );

    return {
      success: true,
      message: 'Logged out successfully',
    };
  } catch (error: any) {
    logger.error('Logout error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Logout failed',
      },
    });
  }
});

// Refresh token
fastify.post('/api/v1/auth/refresh', async (request, reply) => {
  try {
    const { refreshToken } = request.body as { refreshToken: string };

    if (!refreshToken) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.REQUIRED_FIELD_MISSING,
          message: 'Refresh token is required',
        },
      });
    }

    // Verify refresh token
    const decoded = fastify.jwt.verify(refreshToken) as any;

    // Check if token is revoked
    const result = await coreDb.query(
      'SELECT * FROM refresh_tokens WHERE token = $1 AND revoked_at IS NULL AND expires_at > NOW()',
      [refreshToken]
    );

    if (!result.rows.length) {
      return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: {
          code: ERROR_CODES.INVALID_TOKEN,
          message: 'Invalid or expired refresh token',
        },
      });
    }

    // Get user
    const userResult = await coreDb.query(
      'SELECT * FROM admin_users WHERE id = $1 AND is_active = true',
      [decoded.userId]
    );

    if (!userResult.rows.length) {
      return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: {
          code: ERROR_CODES.ACCOUNT_INACTIVE,
          message: 'User account not found or inactive',
        },
      });
    }

    const user = userResult.rows[0];

    // Generate new access token
    const newAccessToken = generateAccessToken(user);

    return {
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    };
  } catch (error: any) {
    logger.error('Refresh token error:', error);
    return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
      success: false,
      error: {
        code: ERROR_CODES.INVALID_TOKEN,
        message: 'Invalid refresh token',
      },
    });
  }
});

// Verify token (for other services)
fastify.post('/api/v1/auth/verify', async (request, reply) => {
  try {
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: {
          code: ERROR_CODES.INVALID_TOKEN,
          message: 'No token provided',
        },
      });
    }

    const decoded = fastify.jwt.verify(token);

    return {
      success: true,
      data: decoded,
    };
  } catch (error: any) {
    return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
      success: false,
      error: {
        code: ERROR_CODES.INVALID_TOKEN,
        message: 'Invalid token',
      },
    });
  }
});

// ============================================
// START SERVER
// ============================================

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    logger.info(`🔐 Auth Service running on port ${PORT}`);
  } catch (err) {
    logger.error('Failed to start Auth Service', err);
    process.exit(1);
  }
};

start();

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down Auth Service...');
  await fastify.close();
  process.exit(0);
});

