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
import multipart from '@fastify/multipart';
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

// Parse CORS origins from environment or use defaults
// Note: Regex patterns must be tested, so we include explicit localhost ports
const corsOrigins = process.env.CORS_ORIGIN?.split(',').map(o => o.trim()) || [
  'http://localhost:3000',  // Student Portal
  'http://localhost:3001',  // Web Owner Portal (React)
  'http://localhost:3002',  // Web Admin Portal
  'http://localhost:5173',  // Vite dev server
  'http://127.0.0.1:3000',   // Student Portal (alternative)
  'http://127.0.0.1:3001',   // Web Owner Portal (alternative)
  'http://127.0.0.1:3002',   // Web Admin Portal (alternative)
  'http://127.0.0.1:5173',   // Vite dev server (alternative)
  'https://studyspot-librarys.vercel.app',  // Library Owner Portal
  'https://studyspot-admin-2.vercel.app',   // Admin Portal
  'https://studyspot-student.vercel.app',   // Student Portal
  'https://main.studyspot-student.pages.dev',  // Cloudflare Student PWA
  'https://studyspot-student.pages.dev',  // Cloudflare root domain
  'https://studyspot-student.netlify.app',  // Netlify Student Portal
  /^http:\/\/localhost:\d+$/,  // Any localhost port (explicit regex)
  /^http:\/\/127\.0\.0\.1:\d+$/,  // Any 127.0.0.1 port (explicit regex)
  /\.pages\.dev$/,  // All Cloudflare Pages domains
  /\.vercel\.app$/,  // All Vercel domains
  /\.netlify\.app$/,  // All Netlify domains
];

// CORS origin validation function - handles both strings and regex patterns
const originValidator = (origin: string | undefined, callback: (err: Error | null, allow: boolean) => void) => {
  if (!origin) {
    // Allow requests with no origin (e.g., mobile apps, Postman)
    return callback(null, true);
  }

  // Check against explicit origins first
  for (const allowedOrigin of corsOrigins) {
    if (typeof allowedOrigin === 'string') {
      if (origin === allowedOrigin) {
        return callback(null, true);
      }
    } else if (allowedOrigin instanceof RegExp) {
      if (allowedOrigin.test(origin)) {
        return callback(null, true);
      }
    }
  }

  // Origin not allowed
  console.warn('[CORS] Origin not allowed:', origin);
  callback(null, false);
};

fastify.register(cors, {
  origin: originValidator,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id', 'X-Requested-With'],
  exposedHeaders: ['Content-Type', 'Authorization'],
});

fastify.register(helmet);

fastify.register(multipart, {
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

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

  // Determine user_type
  const userType = user?.user_type || 
                   (user?.tenant_id || user?.tenantId ? 'library_owner' : 'platform_admin');

  const payload: Record<string, unknown> = {
    sub: user.id,
    userId: user.id,
    email: user.email,
    roles,
    permissions: user.permissions ?? [],
    userType,
    user_type: userType,
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

const formatUserResponse = (user: any) => {
  // Parse metadata if it's a string
  let metadata = {};
  try {
    if (typeof user.metadata === 'string') {
      metadata = JSON.parse(user.metadata);
    } else if (user.metadata) {
      metadata = user.metadata;
    }
  } catch (e) {
    // Ignore parse errors
  }

  // Determine user_type
  const userType = user?.user_type || 
                   (user?.tenant_id || user?.tenantId ? 'library_owner' : 'platform_admin');

  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name ?? user.firstName ?? null,
    lastName: user.last_name ?? user.lastName ?? null,
    role: user.role ?? null,
    userType,
    user_type: userType,
    tenantId: resolveTenantId(user),
    status: user.is_active === false ? 'inactive' : 'active',
    createdAt: user.created_at ?? null,
    updatedAt: user.updated_at ?? null,
    phone: user.phone ?? user.phone_number ?? null,
    profileImage: (metadata as any)?.profileImage ?? (metadata as any)?.avatar ?? null,
    avatar: (metadata as any)?.avatar ?? (metadata as any)?.profileImage ?? null,
    city: (metadata as any)?.city ?? null,
    addressLine1: (metadata as any)?.addressLine1 ?? null,
    addressLine2: (metadata as any)?.addressLine2 ?? null,
    state: (metadata as any)?.state ?? null,
    district: (metadata as any)?.district ?? null,
    pincode: (metadata as any)?.pincode ?? null,
    country: (metadata as any)?.country ?? null,
  };
};

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

// Note: OPTIONS requests are automatically handled by @fastify/cors plugin
// No need to manually register OPTIONS handler

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

    // Determine user_type for refresh token and audit log
    const userType = user.user_type || (user.tenant_id ? 'library_owner' : 'platform_admin');
    const auditUserType = userType === 'library_owner' ? 'library_owner' : 'platform_admin';

    // Store refresh token
    try {
      await coreDb.query(
        `INSERT INTO refresh_tokens (user_id, user_type, token, expires_at)
         VALUES ($1, $2, $3, NOW() + INTERVAL '7 days')`,
        [user.id, auditUserType, refreshToken]
      );
    } catch (tokenError: any) {
      logger.warn('Refresh token storage failed (non-critical):', tokenError.message);
    }

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
    try {
      await coreDb.query(
        `INSERT INTO audit_logs (user_id, user_type, action, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5)`,
        [user.id, auditUserType, 'login', request.ip, request.headers['user-agent'] || 'unknown']
      );
    } catch (auditError: any) {
      logger.warn('Audit log creation failed (non-critical):', auditError.message);
    }

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
    console.log('[LOGIN] Generating tokens...');
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    console.log('[LOGIN] Tokens generated:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      accessTokenLength: accessToken?.length,
      refreshTokenLength: refreshToken?.length,
    });

    if (!accessToken) {
      throw new Error('Failed to generate access token');
    }
    if (!refreshToken) {
      throw new Error('Failed to generate refresh token');
    }

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

    // Build auth payload
    console.log('[LOGIN] Building auth payload...');
    const authPayload = buildAuthPayload(user, { accessToken, refreshToken });
    console.log('[LOGIN] Auth payload built:', {
      hasUser: !!authPayload.user,
      hasToken: !!authPayload.token,
      hasTokens: !!authPayload.tokens,
      tokensStructure: authPayload.tokens ? {
        hasAccessToken: !!authPayload.tokens.accessToken,
        hasRefreshToken: !!authPayload.tokens.refreshToken,
        hasExpiresAt: !!authPayload.tokens.expiresAt,
      } : 'tokens is undefined',
    });

    // Remove sensitive data
    return {
      success: true,
      data: authPayload,
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

// Test endpoint to verify routing works
fastify.get('/api/auth/test', async (request, reply) => {
  return { success: true, message: 'Auth service is working', timestamp: new Date().toISOString() };
});

// Universal register endpoint (works for both admin and students)
fastify.post('/api/auth/register', async (request, reply) => {
  console.log('[REGISTER] ===== REGISTRATION REQUEST RECEIVED =====');
  console.log('[REGISTER] Request method:', request.method);
  console.log('[REGISTER] Request URL:', request.url);
  console.log('[REGISTER] Request headers:', JSON.stringify(request.headers));
  console.log('[REGISTER] Request body type:', typeof request.body);
  
  try {
    console.log('[REGISTER] Step 0a: About to parse request body...');
    const { firstName, lastName, email, phone, password, role } = request.body as any;
    console.log('[REGISTER] Step 0b: Parsed request body successfully');

    // Validate input
    if (!firstName || !email || !password) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.REQUIRED_FIELD_MISSING,
          message: 'First name, email, and password are required',
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

    // Determine user type and role
    // For web owner portal: library_owner
    // For web admin portal: platform_admin (would need special endpoint)
    const userType = 'library_owner'; // Default for web owner portal registration
    const userRole = 'library_owner'; // Library owners always have this role

    // Create or get tenant for library owner
    console.log('[REGISTER] Step 3: Creating/getting tenant...');
    let tenantId: string | null = null;
    try {
      // Generate tenant slug from email
      const tenantSlug = email.toLowerCase().split('@')[0].replace(/[^a-z0-9]/g, '');
      const tenantName = `${firstName}'s Library`;
      const databaseName = `tenant_${tenantSlug}_${Date.now().toString().slice(-6)}`;

      // Check if tenant already exists for this email
      const existingTenant = await coreDb.query(
        'SELECT id FROM tenants WHERE email = $1',
        [email.toLowerCase()]
      );

      if (existingTenant.rows.length > 0) {
        tenantId = existingTenant.rows[0].id;
        console.log('[REGISTER] Step 3a: Using existing tenant:', tenantId);
      } else {
        // Create new tenant
        const tenantResult = await coreDb.query(
          `INSERT INTO tenants (name, slug, email, phone, status, subscription_plan, subscription_status, 
           database_name, database_host, max_libraries, max_students, max_staff, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
           RETURNING id`,
          [
            tenantName,
            tenantSlug,
            email.toLowerCase(),
            phone || null,
            'active',
            'free',
            'active',
            databaseName,
            process.env.CORE_DB_HOST || 'localhost',
            1, // max_libraries
            100, // max_students
            10, // max_staff
          ]
        );
        tenantId = tenantResult.rows[0].id;
        console.log('[REGISTER] Step 3b: Created new tenant:', tenantId);

        // Note: Tenant database schema should be created separately via migration
        // For now, we'll use the same database with tenant_id filtering
      }
    } catch (tenantError: any) {
      console.error('[REGISTER] Tenant creation failed:', tenantError);
      // Continue without tenant - user can be created but won't have tenant access
      console.warn('[REGISTER] Continuing without tenant - user will need manual tenant assignment');
    }

    // Create user (without transaction for pooler compatibility)
    console.log('[REGISTER] Step 4: Inserting user into database...');
    let result;
    try {
      // Use simple query instead of transaction (pooler doesn't support transactions)
      // lastName is optional, use null if not provided
      // user_type: 'library_owner' for web owner portal registrations
      result = await coreDb.query(
        `INSERT INTO admin_users (email, password_hash, first_name, last_name, role, user_type, tenant_id, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
         RETURNING id, email, first_name, last_name, role, user_type, tenant_id, is_active, created_at, updated_at`,
        [email.toLowerCase(), passwordHash, firstName, lastName || null, userRole, userType, tenantId, true]
      );
      console.log('[REGISTER] Step 5: User inserted successfully');
    } catch (insertError: any) {
      console.error('[REGISTER] User insert failed:', insertError);
      console.error('[REGISTER] Insert error details:', {
        code: insertError.code,
        message: insertError.message,
        name: insertError.name,
        severity: insertError.severity,
        position: insertError.position,
      });
      throw insertError;
    }

    const user = result.rows[0];
    console.log('[REGISTER] Step 6: User object:', { id: user.id, email: user.email, user_type: user.user_type, tenant_id: user.tenant_id });

    // Update tenant with owner_id
    if (tenantId && user.id) {
      try {
        await coreDb.query(
          'UPDATE tenants SET owner_id = $1 WHERE id = $2',
          [user.id, tenantId]
        );
        console.log('[REGISTER] Step 6a: Tenant owner_id updated');
      } catch (updateError) {
        console.warn('[REGISTER] Failed to update tenant owner_id (non-critical):', updateError);
      }
    }

    // Generate tokens for immediate login
    let accessToken, refreshToken;
    try {
      console.log('[REGISTER] Step 7: Generating access token...');
      console.log('[REGISTER] User object for token:', { id: user.id, email: user.email, role: user.role, tenant_id: user.tenant_id });
      console.log('[REGISTER] JWT plugin available:', !!fastify.jwt);
      accessToken = generateAccessToken(user);
      console.log('[REGISTER] Step 8: Access token generated, length:', accessToken?.length);
      
      console.log('[REGISTER] Step 9: Generating refresh token...');
      refreshToken = generateRefreshToken(user);
      console.log('[REGISTER] Step 10: Refresh token generated, length:', refreshToken?.length);
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
      console.log('[REGISTER] Step 11: Storing refresh token...');
      // Temporarily skip refresh token storage to avoid database trigger errors
      // await coreDb.query(
      //   `INSERT INTO refresh_tokens (user_id, user_type, token, expires_at)
      //    VALUES ($1, $2, $3, NOW() + INTERVAL '7 days')`,
      //   [user.id, userRole, refreshToken]
      // );
      console.log('[REGISTER] Step 12: Refresh token storage skipped (temporary)');
    } catch (tokenError: any) {
      console.warn('[REGISTER] Failed to store refresh token (non-critical):', tokenError.message);
      logger.warn('Failed to store refresh token:', tokenError.message);
      // Don't throw - this is optional
    }

    // Build auth payload
    console.log('[REGISTER] Step 13: Building auth payload...');
    let authPayload;
    try {
      authPayload = buildAuthPayload(
        {
          ...user,
          phone,
        },
        { accessToken, refreshToken }
      );
      console.log('[REGISTER] Step 14: Auth payload built successfully');
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

// Update user profile
fastify.put('/api/users/profile', async (request, reply) => {
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
    const updates = request.body as any;

    // Get current user
    const currentUser = await coreDb.query(
      'SELECT * FROM admin_users WHERE id = $1',
      [decoded.userId]
    );

    if (!currentUser.rows.length) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: 'User not found',
        },
      });
    }

    // Build update query
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.firstName !== undefined) {
      updateFields.push(`first_name = $${paramIndex++}`);
      values.push(updates.firstName);
    }
    if (updates.lastName !== undefined) {
      updateFields.push(`last_name = $${paramIndex++}`);
      values.push(updates.lastName);
    }
    if (updates.email !== undefined) {
      updateFields.push(`email = $${paramIndex++}`);
      values.push(updates.email.toLowerCase());
    }
    if (updates.phone !== undefined) {
      updateFields.push(`phone = $${paramIndex++}`);
      values.push(updates.phone);
    }
    if (updates.city !== undefined) {
      // Store city in a JSON field or separate column if exists
      // For now, we'll store it in a metadata JSONB field if available
      updateFields.push(`metadata = COALESCE(metadata, '{}'::jsonb) || $${paramIndex++}::jsonb`);
      values.push(JSON.stringify({ city: updates.city }));
    }
    if (updates.addressLine1 !== undefined || updates.addressLine2 !== undefined || updates.state !== undefined || updates.district !== undefined || updates.pincode !== undefined || updates.country !== undefined) {
      // Store address fields in metadata
      const addressData: any = {};
      if (updates.addressLine1 !== undefined) addressData.addressLine1 = updates.addressLine1;
      if (updates.addressLine2 !== undefined) addressData.addressLine2 = updates.addressLine2;
      if (updates.state !== undefined) addressData.state = updates.state;
      if (updates.district !== undefined) addressData.district = updates.district;
      if (updates.pincode !== undefined) addressData.pincode = updates.pincode;
      if (updates.country !== undefined) addressData.country = updates.country;
      
      updateFields.push(`metadata = COALESCE(metadata, '{}'::jsonb) || $${paramIndex++}::jsonb`);
      values.push(JSON.stringify(addressData));
    }
    if (updates.profileImage !== undefined || updates.avatar !== undefined) {
      const imageUrl = updates.profileImage || updates.avatar;
      updateFields.push(`metadata = COALESCE(metadata, '{}'::jsonb) || $${paramIndex++}::jsonb`);
      values.push(JSON.stringify({ profileImage: imageUrl, avatar: imageUrl }));
    }

    if (updateFields.length === 0) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'No valid fields to update',
        },
      });
    }

    // Add updated_at
    updateFields.push(`updated_at = NOW()`);
    values.push(decoded.userId);

    const updateQuery = `
      UPDATE admin_users 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await coreDb.query(updateQuery, values);

    logger.info(`✅ Profile updated for user: ${decoded.userId}`);

    return {
      success: true,
      data: {
        user: formatUserResponse(result.rows[0]),
      },
      message: 'Profile updated successfully',
    };
  } catch (error: any) {
    logger.error('Update profile error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to update profile',
        details: error.message,
      },
    });
  }
});

// Upload profile picture
fastify.post('/api/users/profile/picture', async (request, reply) => {
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

    // Check if multipart/form-data
    const isMultipart = request.headers['content-type']?.includes('multipart/form-data');
    
    let imageData: string | null = null;

    if (isMultipart) {
      // Handle file upload (FormData)
      const data = await request.file();
      if (data) {
        // Read file buffer and convert to base64
        const buffer = await data.toBuffer();
        const base64 = buffer.toString('base64');
        imageData = `data:${data.mimetype};base64,${base64}`;
      }
    } else {
      // Handle JSON with base64 image
      const body = request.body as any;
      imageData = body.profileImage || body.avatar || body.image;
    }

    if (!imageData) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'No image provided',
        },
      });
    }

    // Update user profile with image
    const result = await coreDb.query(
      `UPDATE admin_users 
       SET metadata = COALESCE(metadata, '{}'::jsonb) || $1::jsonb,
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [
        JSON.stringify({ profileImage: imageData, avatar: imageData }),
        decoded.userId
      ]
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

    logger.info(`✅ Profile picture updated for user: ${decoded.userId}`);

    return {
      success: true,
      data: {
        profileImage: imageData,
        avatar: imageData,
        user: formatUserResponse(result.rows[0]),
      },
      message: 'Profile picture updated successfully',
    };
  } catch (error: any) {
    logger.error('Upload profile picture error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to upload profile picture',
        details: error.message,
      },
    });
  }
});

// Get KYC data
fastify.get('/api/users/kyc', async (request, reply) => {
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

    // Get user KYC data from metadata
    const result = await coreDb.query(
      'SELECT metadata FROM admin_users WHERE id = $1',
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

    const metadata = result.rows[0].metadata || {};
    const kycData = metadata.kyc || null;

    return {
      success: true,
      data: kycData,
      message: 'KYC data retrieved successfully',
    };
  } catch (error: any) {
    logger.error('Get KYC error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to retrieve KYC data',
        details: error.message,
      },
    });
  }
});

// Submit/Update KYC
fastify.post('/api/users/kyc', async (request, reply) => {
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
    const kycData = request.body as any;

    // Validate required fields
    if (!kycData.aadhaarNumber || !kycData.fullName || !kycData.dateOfBirth || !kycData.gender || !kycData.address || !kycData.pincode) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'All KYC fields are required',
        },
      });
    }

    // Validate Aadhaar number (12 digits)
    if (!/^\d{12}$/.test(kycData.aadhaarNumber.replace(/\s/g, ''))) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Invalid Aadhaar number. Must be 12 digits.',
        },
      });
    }

    // Validate PIN code (6 digits)
    if (!/^\d{6}$/.test(kycData.pincode.replace(/\s/g, ''))) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Invalid PIN code. Must be 6 digits.',
        },
      });
    }

    // Get current metadata
    const userResult = await coreDb.query(
      'SELECT metadata FROM admin_users WHERE id = $1',
      [decoded.userId]
    );

    if (!userResult.rows.length) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: 'User not found',
        },
      });
    }

    const currentMetadata = userResult.rows[0].metadata || {};
    const existingKyc = currentMetadata.kyc || {};

    // Prepare KYC data
    const newKycData = {
      aadhaarNumber: kycData.aadhaarNumber.replace(/\s/g, ''),
      fullName: kycData.fullName.trim(),
      dateOfBirth: kycData.dateOfBirth,
      gender: kycData.gender,
      address: kycData.address.trim(),
      pincode: kycData.pincode.replace(/\s/g, ''),
      status: existingKyc.status === 'verified' ? 'verified' : 'pending', // Keep verified status if already verified
      submittedAt: existingKyc.submittedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update metadata with KYC data
    const updatedMetadata = {
      ...currentMetadata,
      kyc: newKycData,
    };

    const result = await coreDb.query(
      `UPDATE admin_users 
       SET metadata = $1::jsonb,
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [JSON.stringify(updatedMetadata), decoded.userId]
    );

    logger.info(`✅ KYC submitted for user: ${decoded.userId}`);

    return {
      success: true,
      data: {
        kyc: newKycData,
      },
      message: 'KYC submitted successfully. Verification will be completed within 24-48 hours.',
    };
  } catch (error: any) {
    logger.error('Submit KYC error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to submit KYC',
        details: error.message,
      },
    });
  }
});

// Update KYC (same as POST but for updates)
fastify.put('/api/users/kyc', async (request, reply) => {
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
    const kycData = request.body as any;

    // Get current user and KYC
    const userResult = await coreDb.query(
      'SELECT metadata FROM admin_users WHERE id = $1',
      [decoded.userId]
    );

    if (!userResult.rows.length) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: 'User not found',
        },
      });
    }

    const currentMetadata = userResult.rows[0].metadata || {};
    const existingKyc = currentMetadata.kyc || {};

    // Don't allow updates if already verified
    if (existingKyc.status === 'verified') {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Cannot update verified KYC. Please contact support.',
        },
      });
    }

    // Validate required fields
    if (!kycData.aadhaarNumber || !kycData.fullName || !kycData.dateOfBirth || !kycData.gender || !kycData.address || !kycData.pincode) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'All KYC fields are required',
        },
      });
    }

    // Validate Aadhaar number (12 digits)
    if (!/^\d{12}$/.test(kycData.aadhaarNumber.replace(/\s/g, ''))) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Invalid Aadhaar number. Must be 12 digits.',
        },
      });
    }

    // Validate PIN code (6 digits)
    if (!/^\d{6}$/.test(kycData.pincode.replace(/\s/g, ''))) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Invalid PIN code. Must be 6 digits.',
        },
      });
    }

    // Prepare updated KYC data
    const updatedKycData = {
      ...existingKyc,
      aadhaarNumber: kycData.aadhaarNumber.replace(/\s/g, ''),
      fullName: kycData.fullName.trim(),
      dateOfBirth: kycData.dateOfBirth,
      gender: kycData.gender,
      address: kycData.address.trim(),
      pincode: kycData.pincode.replace(/\s/g, ''),
      status: 'pending', // Reset to pending when updated
      updatedAt: new Date().toISOString(),
    };

    // Update metadata with KYC data
    const updatedMetadata = {
      ...currentMetadata,
      kyc: updatedKycData,
    };

    const result = await coreDb.query(
      `UPDATE admin_users 
       SET metadata = $1::jsonb,
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [JSON.stringify(updatedMetadata), decoded.userId]
    );

    logger.info(`✅ KYC updated for user: ${decoded.userId}`);

    return {
      success: true,
      data: {
        kyc: updatedKycData,
      },
      message: 'KYC updated successfully. Verification will be completed within 24-48 hours.',
    };
  } catch (error: any) {
    logger.error('Update KYC error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to update KYC',
        details: error.message,
      },
    });
  }
});

// Send OTP for Aadhaar KYC (Cashfree integration)
fastify.post('/api/users/kyc/send-otp', async (request, reply) => {
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
    const { aadhaarNumber } = request.body as { aadhaarNumber: string };

    if (!aadhaarNumber || !/^\d{12}$/.test(aadhaarNumber.replace(/\s/g, ''))) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Invalid Aadhaar number. Must be 12 digits.',
        },
      });
    }

    // Call Cashfree Aadhaar OTP API
    const cashfreeApiKey = process.env.CASHFREE_API_KEY;
    const cashfreeApiSecret = process.env.CASHFREE_API_SECRET;
    const cashfreeEnv = process.env.CASHFREE_ENV || 'sandbox'; // 'sandbox' or 'production'

    if (!cashfreeApiKey || !cashfreeApiSecret) {
      logger.error('Cashfree credentials not configured');
      return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
        success: false,
        error: {
          code: ERROR_CODES.SERVER_ERROR,
          message: 'KYC service not configured',
        },
      });
    }

    const cashfreeBaseUrl = cashfreeEnv === 'production' 
      ? 'https://api.cashfree.com'
      : 'https://sandbox.cashfree.com';

    // Send OTP request to Cashfree
    const otpResponse = await fetch(`${cashfreeBaseUrl}/pg/kyc/aadhaar/otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': cashfreeApiKey,
        'x-client-secret': cashfreeApiSecret,
      },
      body: JSON.stringify({
        aadhaar_number: aadhaarNumber.replace(/\s/g, ''),
      }),
    });

    const otpData = await otpResponse.json() as { status?: string; message?: string; reference_id?: string };

    if (!otpResponse.ok || otpData.status !== 'SUCCESS') {
      logger.error('Cashfree OTP send failed:', otpData);
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: otpData.message || 'Failed to send OTP. Please check your Aadhaar number.',
        },
      });
    }

    // Store reference_id for OTP verification
    const referenceId = otpData.reference_id;
    if (!referenceId) {
      logger.error('Cashfree OTP response missing reference_id:', otpData);
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Failed to get reference ID from OTP service',
        },
      });
    }

    // Store reference_id in user metadata temporarily
    const userResult = await coreDb.query(
      'SELECT metadata FROM admin_users WHERE id = $1',
      [decoded.userId]
    );

    if (!userResult.rows.length) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: 'User not found',
        },
      });
    }

    const currentMetadata = userResult.rows[0].metadata || {};
    const updatedMetadata = {
      ...currentMetadata,
      kyc: {
        ...(currentMetadata.kyc || {}),
        aadhaarNumber: aadhaarNumber.replace(/\s/g, ''),
        referenceId,
        otpSentAt: new Date().toISOString(),
      },
    };

    await coreDb.query(
      `UPDATE admin_users 
       SET metadata = $1::jsonb
       WHERE id = $2`,
      [JSON.stringify(updatedMetadata), decoded.userId]
    );

    logger.info(`✅ OTP sent for Aadhaar KYC: ${decoded.userId}`);

    return {
      success: true,
      data: {
        referenceId,
        message: 'OTP sent successfully',
      },
      message: 'OTP sent to your Aadhaar-linked mobile number',
    };
  } catch (error: any) {
    logger.error('Send OTP error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to send OTP',
        details: error.message,
      },
    });
  }
});

// Verify OTP for Aadhaar KYC (Cashfree integration)
fastify.post('/api/users/kyc/verify-otp', async (request, reply) => {
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
    const { aadhaarNumber, otp } = request.body as { aadhaarNumber: string; otp: string };

    if (!aadhaarNumber || !/^\d{12}$/.test(aadhaarNumber.replace(/\s/g, ''))) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Invalid Aadhaar number',
        },
      });
    }

    if (!otp || !/^\d{6}$/.test(otp.replace(/\s/g, ''))) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Invalid OTP. Must be 6 digits.',
        },
      });
    }

    // Get reference_id from user metadata
    const userResult = await coreDb.query(
      'SELECT metadata FROM admin_users WHERE id = $1',
      [decoded.userId]
    );

    if (!userResult.rows.length) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: 'User not found',
        },
      });
    }

    const currentMetadata = userResult.rows[0].metadata || {};
    const kycData = currentMetadata.kyc || {};
    const referenceId = kycData.referenceId;

    if (!referenceId) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'OTP not sent. Please send OTP first.',
        },
      });
    }

    // Call Cashfree Aadhaar OTP verification API
    const cashfreeApiKey = process.env.CASHFREE_API_KEY;
    const cashfreeApiSecret = process.env.CASHFREE_API_SECRET;
    const cashfreeEnv = process.env.CASHFREE_ENV || 'sandbox';

    if (!cashfreeApiKey || !cashfreeApiSecret) {
      logger.error('Cashfree credentials not configured');
      return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
        success: false,
        error: {
          code: ERROR_CODES.SERVER_ERROR,
          message: 'KYC service not configured',
        },
      });
    }

    const cashfreeBaseUrl = cashfreeEnv === 'production' 
      ? 'https://api.cashfree.com'
      : 'https://sandbox.cashfree.com';

    // Verify OTP with Cashfree
    const verifyResponse = await fetch(`${cashfreeBaseUrl}/pg/kyc/aadhaar/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': cashfreeApiKey,
        'x-client-secret': cashfreeApiSecret,
      },
      body: JSON.stringify({
        reference_id: referenceId,
        otp: otp.replace(/\s/g, ''),
      }),
    });

    const verifyData = await verifyResponse.json() as { status?: string; message?: string; data?: any };

    if (!verifyResponse.ok || verifyData.status !== 'SUCCESS') {
      logger.error('Cashfree OTP verification failed:', verifyData);
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: verifyData.message || 'Invalid OTP. Please try again.',
        },
      });
    }

    // Extract verified data from Cashfree response
    const verifiedInfo = verifyData.data || {};
    
    // Extract all available details from Cashfree response
    const verifiedKycData = {
      aadhaarNumber: aadhaarNumber.replace(/\s/g, ''),
      fullName: verifiedInfo.name || verifiedInfo.full_name || verifiedInfo.fullName || '',
      firstName: verifiedInfo.first_name || verifiedInfo.firstName || '',
      lastName: verifiedInfo.last_name || verifiedInfo.lastName || '',
      dateOfBirth: verifiedInfo.date_of_birth || verifiedInfo.dob || verifiedInfo.dateOfBirth || '',
      gender: verifiedInfo.gender || '',
      address: verifiedInfo.address || verifiedInfo.full_address || verifiedInfo.fullAddress || '',
      pincode: verifiedInfo.pincode || verifiedInfo.pin_code || verifiedInfo.pincode || '',
      state: verifiedInfo.state || '',
      district: verifiedInfo.district || '',
      city: verifiedInfo.city || '',
      country: verifiedInfo.country || 'India',
      photo: verifiedInfo.photo || verifiedInfo.image || verifiedInfo.face_image || verifiedInfo.profile_image || '',
      mobile: verifiedInfo.mobile || verifiedInfo.mobile_number || verifiedInfo.phone || '',
      email: verifiedInfo.email || verifiedInfo.email_id || '',
      fatherName: verifiedInfo.father_name || verifiedInfo.fatherName || '',
      motherName: verifiedInfo.mother_name || verifiedInfo.motherName || '',
      spouseName: verifiedInfo.spouse_name || verifiedInfo.spouseName || '',
      rawData: verifiedInfo, // Store complete raw response for reference
      status: 'verified',
      verifiedAt: new Date().toISOString(),
      referenceId,
    };

    // Update user metadata with verified KYC data
    const updatedMetadata = {
      ...currentMetadata,
      kyc: verifiedKycData,
    };

    await coreDb.query(
      `UPDATE admin_users 
       SET metadata = $1::jsonb,
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [JSON.stringify(updatedMetadata), decoded.userId]
    );

    logger.info(`✅ Aadhaar KYC verified for user: ${decoded.userId}`);

    return {
      success: true,
      data: verifiedKycData,
      message: 'Aadhaar KYC verified successfully',
    };
  } catch (error: any) {
    logger.error('Verify OTP error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to verify OTP',
        details: error.message,
      },
    });
  }
});

// Send OTP for email verification
fastify.post('/api/users/verify/send-email-otp', async (request, reply) => {
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

    // Get user email
    const result = await coreDb.query(
      'SELECT email FROM admin_users WHERE id = $1',
      [decoded.userId]
    );

    if (!result.rows.length || !result.rows[0].email) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Email not found. Please update your email first.',
        },
      });
    }

    const email = result.rows[0].email;

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in metadata (expires in 10 minutes)
    const metadata = result.rows[0].metadata || {};
    const updatedMetadata = {
      ...metadata,
      emailVerification: {
        otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      },
    };

    await coreDb.query(
      `UPDATE admin_users 
       SET metadata = $1::jsonb
       WHERE id = $2`,
      [JSON.stringify(updatedMetadata), decoded.userId]
    );

    // TODO: Send email with OTP using email service (e.g., SendGrid, AWS SES, etc.)
    // For now, we'll log it (in production, use proper email service)
    logger.info(`Email OTP for ${email}: ${otp}`);

    return {
      success: true,
      data: {
        message: 'OTP sent to your email',
      },
      message: 'OTP sent to your email address',
    };
  } catch (error: any) {
    logger.error('Send email OTP error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to send email OTP',
        details: error.message,
      },
    });
  }
});

// Verify email OTP
fastify.post('/api/users/verify/verify-email-otp', async (request, reply) => {
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
    const { otp } = request.body as { otp: string };

    if (!otp || !/^\d{6}$/.test(otp.replace(/\s/g, ''))) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Invalid OTP. Must be 6 digits.',
        },
      });
    }

    // Get user and verification data
    const result = await coreDb.query(
      'SELECT metadata FROM admin_users WHERE id = $1',
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

    const metadata = result.rows[0].metadata || {};
    const emailVerification = metadata.emailVerification || {};

    // Check if OTP exists and is not expired
    if (!emailVerification.otp) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'OTP not sent. Please request a new OTP.',
        },
      });
    }

    if (new Date(emailVerification.expiresAt) < new Date()) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'OTP expired. Please request a new OTP.',
        },
      });
    }

    // Verify OTP
    if (emailVerification.otp !== otp.replace(/\s/g, '')) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Invalid OTP. Please try again.',
        },
      });
    }

    // Mark email as verified
    const updatedMetadata = {
      ...metadata,
      emailVerified: true,
      emailVerifiedAt: new Date().toISOString(),
      emailVerification: undefined, // Remove OTP data
    };

    await coreDb.query(
      `UPDATE admin_users 
       SET metadata = $1::jsonb,
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [JSON.stringify(updatedMetadata), decoded.userId]
    );

    logger.info(`✅ Email verified for user: ${decoded.userId}`);

    return {
      success: true,
      data: {
        verified: true,
      },
      message: 'Email verified successfully',
    };
  } catch (error: any) {
    logger.error('Verify email OTP error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to verify email OTP',
        details: error.message,
      },
    });
  }
});

// Send OTP for phone verification
fastify.post('/api/users/verify/send-phone-otp', async (request, reply) => {
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

    // Get user phone
    const result = await coreDb.query(
      'SELECT phone, metadata FROM admin_users WHERE id = $1',
      [decoded.userId]
    );

    if (!result.rows.length || !result.rows[0].phone) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Phone number not found. Please update your phone number first.',
        },
      });
    }

    const phone = result.rows[0].phone;

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in metadata (expires in 10 minutes)
    const metadata = result.rows[0].metadata || {};
    const updatedMetadata = {
      ...metadata,
      phoneVerification: {
        otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      },
    };

    await coreDb.query(
      `UPDATE admin_users 
       SET metadata = $1::jsonb
       WHERE id = $2`,
      [JSON.stringify(updatedMetadata), decoded.userId]
    );

    // TODO: Send SMS with OTP using SMS service (e.g., Twilio, AWS SNS, etc.)
    // For now, we'll log it (in production, use proper SMS service)
    logger.info(`Phone OTP for ${phone}: ${otp}`);

    return {
      success: true,
      data: {
        message: 'OTP sent to your phone',
      },
      message: 'OTP sent to your phone number',
    };
  } catch (error: any) {
    logger.error('Send phone OTP error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to send phone OTP',
        details: error.message,
      },
    });
  }
});

// Verify phone OTP
fastify.post('/api/users/verify/verify-phone-otp', async (request, reply) => {
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
    const { otp } = request.body as { otp: string };

    if (!otp || !/^\d{6}$/.test(otp.replace(/\s/g, ''))) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Invalid OTP. Must be 6 digits.',
        },
      });
    }

    // Get user and verification data
    const result = await coreDb.query(
      'SELECT metadata FROM admin_users WHERE id = $1',
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

    const metadata = result.rows[0].metadata || {};
    const phoneVerification = metadata.phoneVerification || {};

    // Check if OTP exists and is not expired
    if (!phoneVerification.otp) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'OTP not sent. Please request a new OTP.',
        },
      });
    }

    if (new Date(phoneVerification.expiresAt) < new Date()) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'OTP expired. Please request a new OTP.',
        },
      });
    }

    // Verify OTP
    if (phoneVerification.otp !== otp.replace(/\s/g, '')) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Invalid OTP. Please try again.',
        },
      });
    }

    // Mark phone as verified
    const updatedMetadata = {
      ...metadata,
      phoneVerified: true,
      phoneVerifiedAt: new Date().toISOString(),
      phoneVerification: undefined, // Remove OTP data
    };

    await coreDb.query(
      `UPDATE admin_users 
       SET metadata = $1::jsonb,
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [JSON.stringify(updatedMetadata), decoded.userId]
    );

    logger.info(`✅ Phone verified for user: ${decoded.userId}`);

    return {
      success: true,
      data: {
        verified: true,
      },
      message: 'Phone verified successfully',
    };
  } catch (error: any) {
    logger.error('Verify phone OTP error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to verify phone OTP',
        details: error.message,
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

