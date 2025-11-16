// ============================================
// AUTH SERVICE
// Authentication and authorization
// Port: 3001
// ============================================

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { coreDb } from '../../config/database';
import { logger } from '../../utils/logger';
import { HTTP_STATUS, ERROR_CODES } from '../../config/constants';
import type { AdminUser } from '../../types';
import { Server as SocketIOServer } from 'socket.io';

dotenv.config();

const fastify = Fastify({ logger: false });
const PORT = parseInt(process.env.AUTH_SERVICE_PORT || '3001');

// ============================================
// MIDDLEWARE
// ============================================

fastify.register(cors, {
  origin: process.env.CORS_ORIGIN?.split(',') || [
    'http://localhost:3000',  // Owner Portal
    'http://localhost:3001',  // Student PWA  
    'http://localhost:3002',  // Legacy
    'http://localhost:5173',  // Vite dev server
    'https://main.studyspot-student.pages.dev',  // Cloudflare Student PWA
    'https://studyspot-student.pages.dev',  // Cloudflare root domain
    /\.pages\.dev$/,  // All Cloudflare Pages domains
    /\.vercel\.app$/,  // All Vercel domains
  ],
  credentials: true,
});

fastify.register(helmet);

fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
});

// Rate limiting for auth endpoints
fastify.register(rateLimit, {
  max: 5, // 5 requests
  timeWindow: '15 minutes', // per 15 minutes
  cache: 10000, // Cache up to 10k different IPs
  allowList: ['127.0.0.1'], // Whitelist localhost for testing
  skipOnError: false, // Don't skip on errors
  ban: 3, // Ban after 3 violations (15 requests in 15 min)
  onBanReach: (_req: any, key: string) => {
    logger.warn(`Rate limit ban reached for IP: ${key}`);
  },
  errorResponseBuilder: (_req: any, context: any) => {
    return {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many authentication attempts. Please try again in 15 minutes.',
        retryAfter: context.ttl,
      },
    };
  },
  keyGenerator: (req: any) => {
    // Use IP address as rate limit key
    return req.ip || req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
  },
});

// ============================================
// HELPER FUNCTIONS
// ============================================

const resolveTenantId = (user: any) => user?.tenant_id || user?.tenantId || null;

const generateAccessToken = (user: any) => {
  if (!fastify.jwt) {
    throw new Error('JWT plugin not initialized');
  }

  const tenantId = resolveTenantId(user);
  const roles = Array.isArray(user?.roles)
    ? user.roles
    : user?.role
    ? [user.role]
    : [];

  const payload: Record<string, unknown> = {
    sub: user.id,
    userId: user.id,
    email: user.email,
    roles,
    permissions: user.permissions ?? [],
    tenantId,
    tenant_id: tenantId,
    type: 'access',
  };

  if (tenantId) {
    payload.tenant = {
      id: tenantId,
      slug: user?.tenant_slug ?? null,
      plan: user?.tenant_plan ?? null,
    };
  }

  if (user?.first_name || user?.firstName) {
    payload.name = `${user.first_name ?? user.firstName ?? ''} ${user.last_name ?? user.lastName ?? ''}`.trim();
  }

  return fastify.jwt.sign(payload, {
    expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRY || '15m',
  });
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

const extractExpiryTimestamp = (token: string): number | null => {
  try {
    if (!fastify.jwt) {
      console.warn('[extractExpiryTimestamp] JWT plugin not available');
      return null;
    }
    const decoded = fastify.jwt.decode(token) as { exp?: number } | null;
    if (decoded?.exp) {
      return decoded.exp * 1000;
    }
    return null;
  } catch (error: any) {
    console.error('[extractExpiryTimestamp] Error decoding token:', error.message);
    return null;
  }
};

const formatUserResponse = (user: any) => ({
  id: user.id,
  email: user.email,
  firstName: user.first_name ?? user.firstName ?? null,
  lastName: user.last_name ?? user.lastName ?? null,
  role: user.role ?? null,
  tenantId: resolveTenantId(user),
  status: user.is_active === false ? 'inactive' : 'active',
  createdAt: user.created_at ?? null,
  updatedAt: user.updated_at ?? null,
  phone: user.phone ?? user.phone_number ?? null,
});

const buildAuthPayload = (user: any, tokens: { accessToken: string; refreshToken?: string }) => {
  let expiresAt = extractExpiryTimestamp(tokens.accessToken);
  
  // Fallback: if expiry extraction fails, calculate from current time + 15 minutes
  if (!expiresAt) {
    const expiryMinutes = parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRY?.replace('m', '') || '15');
    expiresAt = Date.now() + (expiryMinutes * 60 * 1000);
    console.warn('[buildAuthPayload] Using fallback expiry calculation');
  }

  return {
    user: formatUserResponse(user),
    token: tokens.accessToken,
    tokens: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt,
    },
  };
};

// ============================================
// ROUTES
// ============================================

// Health check (with optional DB check)
fastify.get('/health', async (request, reply) => {
  const checkDb = (request.query as any)?.checkDb === 'true';
  
  const health: any = {
    success: true,
    data: {
      status: 'healthy',
      service: 'auth-service',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      websocket: 'enabled',
    },
  };

  // Optional database connectivity check (slower)
  if (checkDb) {
    try {
      const startTime = Date.now();
      await coreDb.query('SELECT 1');
      const dbLatency = Date.now() - startTime;
      health.data.database = {
        status: 'connected',
        latency: `${dbLatency}ms`,
      };
    } catch (error: any) {
      health.success = false;
      health.data.status = 'unhealthy';
      health.data.database = {
        status: 'disconnected',
        error: error.message,
      };
      return reply.status(503).send(health);
    }
  }

  return health;
});

// WebSocket test endpoint - Test real-time events
fastify.post('/api/test/socket-event', async (request, reply) => {
  try {
    const { event, data, room } = request.body as any;
    const io = (fastify as any).io;
    
    if (!io) {
      return reply.status(500).send({
        success: false,
        error: { message: 'WebSocket not initialized' },
      });
    }

    // Emit test event
    if (room) {
      io.to(room).emit(event, data);
    } else {
      io.emit(event, data);
    }

    return {
      success: true,
      data: {
        message: 'Event emitted',
        event,
        room: room || 'all',
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error: any) {
    return reply.status(500).send({
      success: false,
      error: { message: error.message },
    });
  }
});

// Get WebSocket connection stats
fastify.get('/api/test/socket-stats', async (_request, reply) => {
  try {
    const io = (fastify as any).io;
    
    if (!io) {
      return reply.status(500).send({
        success: false,
        error: { message: 'WebSocket not initialized' },
      });
    }

    const sockets = await io.fetchSockets();
    const rooms = new Set<string>();
    
    sockets.forEach((socket: any) => {
      socket.rooms.forEach((room: string) => {
        if (room !== socket.id) {
          rooms.add(room);
        }
      });
    });

    return {
      success: true,
      data: {
        totalConnections: sockets.length,
        activeRooms: Array.from(rooms),
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error: any) {
    return reply.status(500).send({
      success: false,
      error: { message: error.message },
    });
  }
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
    try {
      await coreDb.query(
        'UPDATE admin_users SET last_login_at = NOW(), last_login_ip = $1 WHERE id = $2',
        [request.ip, user.id]
      );
    } catch (updateError: any) {
      logger.warn('Last login update failed', {
        userId: user.id,
        error: updateError.message,
      });
    }

    // Create audit log
    await coreDb.query(
      `INSERT INTO audit_logs (user_id, user_type, action, ip_address)
       VALUES ($1, $2, $3, $4)`,
      [user.id, 'admin', 'login', request.ip]
    );

    // Remove sensitive data
    return {
      success: true,
      data: buildAuthPayload(user, { accessToken, refreshToken }),
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

// Student register
fastify.post('/api/v1/auth/student/register', async (request, reply) => {
  try {
    const { firstName, lastName, email, phone, password } = request.body as any;

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.REQUIRED_FIELD_MISSING,
          message: 'All fields are required',
        },
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = await coreDb.query(
      `INSERT INTO admin_users (email, password_hash, first_name, last_name, role, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING id, email, first_name, last_name, role, created_at`,
      [email.toLowerCase(), passwordHash, firstName, lastName, 'student', true]
    );

    const user = result.rows[0];

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          phone: phone || null,
        },
      },
      message: 'Registration successful',
    };
  } catch (error: any) {
    logger.error('Student register error:', error);
    
    if (error.code === '23505') { // Unique violation
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Email already exists',
        },
      });
    }
    
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Registration failed',
      },
    });
  }
});

// Universal login endpoint (works for both admin and students)
fastify.post('/api/auth/login', async (request, reply) => {
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

    // Find user in admin_users table (works for all user types)
    const result = await coreDb.query(
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

    // Check if user is active
    if (!user.is_active) {
      return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: {
          code: ERROR_CODES.UNAUTHORIZED,
          message: 'Account is inactive',
        },
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token (temporarily skipped to avoid database trigger errors)
    try {
      // Temporarily skip refresh token storage
      // await coreDb.query(
      //   `INSERT INTO refresh_tokens (user_id, user_type, token, expires_at)
      //    VALUES ($1, $2, $3, NOW() + INTERVAL '7 days')`,
      //   [user.id, user.role || 'student', refreshToken]
      // );
      logger.info('Refresh token storage skipped (temporary)');
    } catch (tokenError: any) {
      logger.warn('Refresh token insert failed', {
        userId: user.id,
        error: tokenError.message,
      });
    }

    // Update last login (optional - won't fail if column missing)
    try {
      await coreDb.query(
        'UPDATE admin_users SET last_login_at = NOW(), last_login_ip = $1 WHERE id = $2',
        [request.ip, user.id]
      );
    } catch (updateError: any) {
      logger.warn('Failed to update last login (non-critical):', updateError.message);
      // Don't throw - this is optional
    }

    // Create audit log
    try {
      await coreDb.query(
        `INSERT INTO audit_logs (user_id, user_type, action, ip_address)
         VALUES ($1, $2, $3, $4)`,
        [user.id, user.role || 'student', 'login', request.ip]
      );
    } catch (auditError: any) {
      logger.warn('Audit log insert failed', {
        userId: user.id,
        error: auditError.message,
      });
    }

    // Remove sensitive data
    return {
      success: true,
      data: buildAuthPayload(user, { accessToken, refreshToken }),
      message: 'Login successful',
    };
  } catch (error: any) {
    logger.error('Login error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Login failed',
        details: error?.message ?? 'Unknown error',
      },
    });
  }
});

// Universal register endpoint (works for both admin and students)
fastify.post('/api/auth/register', async (request, reply) => {
  try {
    const { firstName, lastName, email, phone, password, role } = request.body as any;

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.REQUIRED_FIELD_MISSING,
          message: 'First name, last name, email, and password are required',
        },
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Invalid email format',
        },
      });
    }

    // Validate password strength (allows common special characters: @$!%*?&#^~_-+=)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^~_\-+=])[A-Za-z\d@$!%*?&#^~_\-+=]{8,}$/;
    if (!passwordRegex.test(password)) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character (@$!%*?&#^~_-+=)',
        },
      });
    }

    // Check if user already exists
    const existingUser = await coreDb.query(
      'SELECT id FROM admin_users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'User with this email already exists',
        },
      });
    }

    // Hash password
    console.log('[REGISTER] Step 1: Hashing password...');
    const passwordHash = await bcrypt.hash(password, 10);
    console.log('[REGISTER] Step 2: Password hashed successfully');

    // Determine user role (default to student if not specified)
    const userRole = role || 'student';

    // Create user
    console.log('[REGISTER] Step 3: Inserting user into database...');
    const result = await coreDb.query(
      `INSERT INTO admin_users (email, password_hash, first_name, last_name, role, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING id, email, first_name, last_name, role, is_active, created_at, updated_at`,
      [email.toLowerCase(), passwordHash, firstName, lastName, userRole, true]
    );
    console.log('[REGISTER] Step 4: User inserted successfully');

    const user = result.rows[0];
    console.log('[REGISTER] Step 5: User object:', { id: user.id, email: user.email });

    // Generate tokens for immediate login
    let accessToken, refreshToken;
    try {
      console.log('[REGISTER] Step 6: Generating access token...');
      console.log('[REGISTER] User object for token:', { id: user.id, email: user.email, role: user.role });
      console.log('[REGISTER] JWT plugin available:', !!fastify.jwt);
      accessToken = generateAccessToken(user);
      console.log('[REGISTER] Step 7: Access token generated, length:', accessToken?.length);
      
      console.log('[REGISTER] Step 8: Generating refresh token...');
      refreshToken = generateRefreshToken(user);
      console.log('[REGISTER] Step 9: Refresh token generated, length:', refreshToken?.length);
    } catch (tokenError: any) {
      console.error('[REGISTER] Token generation failed:', tokenError);
      console.error('[REGISTER] Token error details:', {
        message: tokenError.message,
        name: tokenError.name,
        code: tokenError.code,
        stack: tokenError.stack?.substring(0, 500),
      });
      logger.error('Token generation failed:', tokenError);
      return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
        success: false,
        error: {
          code: ERROR_CODES.SERVER_ERROR,
          message: 'Token generation failed',
          details: tokenError.message || 'Unknown token generation error',
          errorName: tokenError.name,
          errorCode: tokenError.code,
        },
      });
    }

    // Store refresh token (optional - skip if database has triggers that require tenant)
    // TODO: Re-enable once tenant validation is fixed in database
    try {
      console.log('[REGISTER] Step 10: Storing refresh token...');
      // Temporarily skip refresh token storage to avoid database trigger errors
      // await coreDb.query(
      //   `INSERT INTO refresh_tokens (user_id, user_type, token, expires_at)
      //    VALUES ($1, $2, $3, NOW() + INTERVAL '7 days')`,
      //   [user.id, userRole, refreshToken]
      // );
      console.log('[REGISTER] Step 11: Refresh token storage skipped (temporary)');
    } catch (tokenError: any) {
      console.warn('[REGISTER] Failed to store refresh token (non-critical):', tokenError.message);
      logger.warn('Failed to store refresh token:', tokenError.message);
      // Don't throw - this is optional
    }

    // Build auth payload
    console.log('[REGISTER] Step 12: Building auth payload...');
    let authPayload;
    try {
      authPayload = buildAuthPayload(
        {
          ...user,
          phone,
        },
        { accessToken, refreshToken }
      );
      console.log('[REGISTER] Step 13: Auth payload built successfully');
    } catch (payloadError: any) {
      console.error('[REGISTER] Auth payload build failed:', payloadError);
      logger.error('Auth payload build failed:', payloadError);
      return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
        success: false,
        error: {
          code: ERROR_CODES.SERVER_ERROR,
          message: 'Failed to build auth payload',
          details: payloadError.message || 'Unknown error',
        },
      });
    }

    return {
      success: true,
      data: authPayload,
      message: 'Registration successful',
    };
  } catch (error: any) {
    console.error('[REGISTER] Outer catch - Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    logger.error('Register error:', error);
    logger.error('Error details:', { 
      code: error.code, 
      message: error.message, 
      name: error.name,
      stack: error.stack,
      cause: error.cause,
      innerError: error.innerError,
    });
    
    if (error.code === '23505') { // Unique violation
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Email already exists',
        },
      });
    }
    
    // Check if error message contains "Tenant or user not found"
    const errorMessage = error.message || '';
    const errorDetails = error.details || errorMessage;
    
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Registration failed',
        details: errorDetails,
        errorCode: error.code,
        errorName: error.name,
        fullError: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
    });
  }
});

// Get current user (me) endpoint - used by all portals
fastify.get('/api/auth/me', async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: {
          code: ERROR_CODES.UNAUTHORIZED,
          message: 'No token provided',
        },
      });
    }

    const token = authHeader.substring(7);
    const decoded = fastify.jwt.verify(token) as any;

    const result = await coreDb.query(
      'SELECT * FROM admin_users WHERE id = $1',
      [decoded.userId]
    );

    if (!result.rows.length) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: 'User not found',
        },
      });
    }

    const user = result.rows[0];

    // Check if user is active
    if (!user.is_active) {
      return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: {
          code: ERROR_CODES.UNAUTHORIZED,
          message: 'Account is inactive',
        },
      });
    }

    return {
      success: true,
      data: {
        user: formatUserResponse(user),
      },
    };
  } catch (error: any) {
    logger.error('Get current user error:', error);
    return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
      success: false,
      error: {
        code: ERROR_CODES.UNAUTHORIZED,
        message: 'Invalid or expired token',
      },
    });
  }
});

// Profile endpoint (alias for /me)
fastify.get('/api/auth/profile', async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: {
          code: ERROR_CODES.UNAUTHORIZED,
          message: 'No token provided',
        },
      });
    }

    const token = authHeader.substring(7);
    const decoded = fastify.jwt.verify(token) as any;

    const result = await coreDb.query(
      'SELECT * FROM admin_users WHERE id = $1',
      [decoded.userId]
    );

    if (!result.rows.length) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: 'User not found',
        },
      });
    }

    return {
      success: true,
      data: {
        user: formatUserResponse(result.rows[0]),
      },
    };
  } catch (error: any) {
    logger.error('Get profile error:', error);
    return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
      success: false,
      error: {
        code: ERROR_CODES.UNAUTHORIZED,
        message: 'Invalid or expired token',
      },
    });
  }
});

// Student login (legacy - redirects to universal endpoint)
fastify.post('/api/v1/auth/student/login', async (request, reply) => {
  try {
    const { email, password } = request.body as { email: string; password: string };

    if (!email || !password) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.REQUIRED_FIELD_MISSING,
          message: 'Email and password are required',
        },
      });
    }

    // Find user
    const result = await coreDb.query(
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
      [user.id, 'student', refreshToken]
    );

    return {
      success: true,
      data: buildAuthPayload(user, { accessToken, refreshToken }),
      message: 'Login successful',
    };
  } catch (error: any) {
    logger.error('Student login error:', error);
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
fastify.post('/api/v1/auth/tenant/login', async (_request, reply) => {
  // TODO: Implement tenant login
  return reply.status(HTTP_STATUS.NOT_FOUND).send({
    success: false,
    error: {
      code: ERROR_CODES.RESOURCE_NOT_FOUND,
      message: 'Tenant login not yet implemented',
    },
  });
});

const logoutHandler = async (request: any, reply: any) => {
  try {
    const body = (request.body ?? {}) as { refreshToken?: string };
    const refreshTokenFromBody = body.refreshToken;
    const accessToken =
      request.headers.authorization?.startsWith('Bearer ')
        ? request.headers.authorization.split(' ')[1]
        : undefined;

    if (!refreshTokenFromBody && !accessToken) {
      return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: {
          code: ERROR_CODES.INVALID_TOKEN,
          message: 'No token provided',
        },
      });
    }

    if (refreshTokenFromBody) {
      await coreDb.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE token = $1', [
        refreshTokenFromBody,
      ]);
    }

    if (accessToken) {
      try {
        const decoded = fastify.jwt.verify(accessToken) as { userId?: string; tenantId?: string };
        if (decoded?.userId) {
          await coreDb.query(
            'UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL',
            [decoded.userId]
          );
        }
      } catch (error) {
        logger.warn('Failed to decode access token during logout', error);
      }
    }

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
};

fastify.post('/api/v1/auth/logout', logoutHandler);
fastify.post('/api/auth/logout', logoutHandler);

const refreshHandler = async (request: any, reply: any) => {
  try {
    const body = (request.body ?? {}) as { refreshToken?: string; token?: string };
    const refreshToken = body.refreshToken || body.token;

    if (!refreshToken) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.REQUIRED_FIELD_MISSING,
          message: 'Refresh token is required',
        },
      });
    }

    const decoded = fastify.jwt.verify(refreshToken) as { userId?: string; type?: string };
    if (decoded?.type !== 'refresh' || !decoded?.userId) {
      return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: {
          code: ERROR_CODES.INVALID_TOKEN,
          message: 'Invalid refresh token',
        },
      });
    }

    const tokenRow = await coreDb.query(
      'SELECT * FROM refresh_tokens WHERE token = $1 AND revoked_at IS NULL AND expires_at > NOW()',
      [refreshToken]
    );

    if (!tokenRow.rows.length) {
      return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: {
          code: ERROR_CODES.INVALID_TOKEN,
          message: 'Invalid or expired refresh token',
        },
      });
    }

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
    const newAccessToken = generateAccessToken(user);

    return {
      success: true,
      data: buildAuthPayload(user, { accessToken: newAccessToken, refreshToken }),
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
};

fastify.post('/api/v1/auth/refresh', refreshHandler);
fastify.post('/api/auth/refresh', refreshHandler);

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
// START SERVER WITH WEBSOCKET SUPPORT
// ============================================

const start = async () => {
  try {
    // Wait for all plugins to be ready before starting server
    await fastify.ready();
    logger.info('✅ All Fastify plugins loaded');
    
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    logger.info(`🔐 Auth Service running on port ${PORT}`);
    
    // ============================================
    // 🔴 WEBSOCKET SERVER INITIALIZATION
    // ============================================
    const io = new SocketIOServer(fastify.server, {
      cors: {
        origin: [
          'http://localhost:3000',
          'http://localhost:3001',
          'http://localhost:5173',
          'https://studyspot-librarys.vercel.app',
          'https://studyspot-student.vercel.app',
          'https://main.studyspot-student.pages.dev',
          'https://studyspot-student.pages.dev',
          /\.vercel\.app$/,
          /\.pages\.dev$/,
        ],
        credentials: true,
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    // Socket connection handlers
    io.on('connection', (socket) => {
      console.log('🔌 Client connected:', socket.id);
      
      // Join role-based rooms
      socket.on('join:role', (role: string) => {
        socket.join(`role:${role}`);
        console.log(`👤 ${socket.id} joined room: role:${role}`);
      });

      // Join library-specific room
      socket.on('join:library', (libraryId: string) => {
        socket.join(`library:${libraryId}`);
        console.log(`🏢 ${socket.id} joined room: library:${libraryId}`);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('🔌 Client disconnected:', socket.id);
      });

      // Heartbeat
      socket.on('ping', () => {
        socket.emit('pong', { timestamp: new Date().toISOString() });
      });
    });

    // Store io instance globally for use in routes
    (fastify as any).io = io;
    
    // Also make it available via helper functions
    const { setSocketIO } = require('../../utils/socketHelpers');
    setSocketIO(io);
    
    logger.info(`✅ WebSocket Server running on port ${PORT}`);
    logger.info(`🔴 Real-time updates: ENABLED`);
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

