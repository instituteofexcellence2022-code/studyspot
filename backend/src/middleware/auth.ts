// ============================================
// AUTHENTICATION MIDDLEWARE
// JWT token verification (direct, no HTTP calls)
// ============================================

import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { HTTP_STATUS, ERROR_CODES } from '../config/constants';
import { logger } from '../utils/logger';

// JWT secret from environment - validated in config/env.ts
// This is a fallback only for development
const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'dev-secret-key-not-for-production-use-only');

/**
 * Extended request interface with user and tenant
 * Note: FastifyRequest is extended via module augmentation in types/fastify.d.ts
 */
export type AuthenticatedRequest = FastifyRequest;

/**
 * Authenticate request using JWT token (direct verification)
 * This middleware verifies JWT tokens directly without HTTP calls to auth service
 */
export const authenticate = async (
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> => {
  // Validate JWT_SECRET is set
  if (!JWT_SECRET || (process.env.NODE_ENV === 'production' && JWT_SECRET.length < 32)) {
    logger.error('JWT_SECRET is not properly configured');
    await reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Server configuration error',
      },
    });
    return;
  }

  try {
    // Skip authentication for health checks and public endpoints
    const publicPaths = ['/health', '/api/v1/auth/login', '/api/v1/auth/register'];
    if (publicPaths.some(path => request.url.startsWith(path))) {
      return;
    }

    // Extract token from header
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      await reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: {
          code: ERROR_CODES.UNAUTHORIZED,
          message: 'Authentication required. Please provide a valid token.',
        },
      });
      return;
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token directly
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        await reply.status(HTTP_STATUS.UNAUTHORIZED).send({
          success: false,
          error: {
            code: ERROR_CODES.TOKEN_EXPIRED,
            message: 'Token has expired. Please login again.',
          },
        });
        return;
      }

      if (error.name === 'JsonWebTokenError') {
        await reply.status(HTTP_STATUS.UNAUTHORIZED).send({
          success: false,
          error: {
            code: ERROR_CODES.INVALID_TOKEN,
            message: 'Invalid token. Please login again.',
          },
        });
        return;
      }

      throw error;
    }

    // Extract user information from token
    const user = {
      id: decoded.userId || decoded.sub || decoded.id,
      userId: decoded.userId || decoded.sub || decoded.id,
      email: decoded.email,
      role: decoded.role || decoded.roles?.[0],
      roles: decoded.roles || [decoded.role].filter(Boolean),
      userType: decoded.userType || decoded.user_type,
      user_type: decoded.userType || decoded.user_type,
      userTable: decoded.userTable,
      tenantId: decoded.tenantId || decoded.tenant_id,
      tenant_id: decoded.tenantId || decoded.tenant_id,
      permissions: decoded.permissions || [],
      name: decoded.name,
    };

    // Validate required fields
    if (!user.id || !user.email) {
      await reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: {
          code: ERROR_CODES.INVALID_TOKEN,
          message: 'Invalid token payload',
        },
      });
      return;
    }

    // Attach user and tenant to request
    request.user = user;
    request.tenantId = user.tenantId || user.tenant_id;

    // Also set x-tenant-id header for backward compatibility
    if (request.tenantId && !request.headers['x-tenant-id']) {
      request.headers['x-tenant-id'] = request.tenantId;
    }
  } catch (error: any) {
    logger.error('Authentication error:', error);
    await reply.status(HTTP_STATUS.UNAUTHORIZED).send({
      success: false,
      error: {
        code: ERROR_CODES.AUTHENTICATION_ERROR,
        message: 'Authentication failed',
      },
    });
  }
};

/**
 * Check if user has required permission
 */
export const requirePermission = (permission: string) => {
  return async (request: AuthenticatedRequest, reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      await reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: {
          code: ERROR_CODES.UNAUTHORIZED,
          message: 'User not authenticated',
        },
      });
      return;
    }

    const userPermissions = (request.user as any)?.permissions || [];

    // Super admin has all permissions
    if (userPermissions.includes('*') || (request.user as any)?.role === 'super_admin') {
      return;
    }

    if (!userPermissions.includes(permission)) {
      await reply.status(HTTP_STATUS.FORBIDDEN).send({
        success: false,
        error: {
          code: ERROR_CODES.INSUFFICIENT_PERMISSIONS,
          message: `Missing required permission: ${permission}`,
        },
      });
      return;
    }
  };
};

/**
 * Check if user has any of the required roles
 */
export const requireRole = (...roles: string[]) => {
  return async (request: AuthenticatedRequest, reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      await reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: {
          code: ERROR_CODES.UNAUTHORIZED,
          message: 'User not authenticated',
        },
      });
      return;
    }

    const userRole = (request.user as any)?.role;
    const userRoles = (request.user as any)?.roles || [];

    // Check if user has any of the required roles
    const hasRole = userRole && roles.includes(userRole);
    const hasAnyRole = userRoles.some(role => roles.includes(role));

    if (!hasRole && !hasAnyRole) {
      await reply.status(HTTP_STATUS.FORBIDDEN).send({
        success: false,
        error: {
          code: ERROR_CODES.INSUFFICIENT_PERMISSIONS,
          message: `Required role: ${roles.join(' or ')}`,
        },
      });
      return;
    }
  };
};

/**
 * Optional authentication - doesn't fail if no token, but attaches user if token is valid
 */
export const optionalAuthenticate = async (
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without authentication
      return;
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      const user = {
        id: decoded.userId || decoded.sub || decoded.id,
        userId: decoded.userId || decoded.sub || decoded.id,
        email: decoded.email,
        role: decoded.role || decoded.roles?.[0],
        roles: decoded.roles || [decoded.role].filter(Boolean),
        userType: decoded.userType || decoded.user_type,
        user_type: decoded.userType || decoded.user_type,
        userTable: decoded.userTable,
        tenantId: decoded.tenantId || decoded.tenant_id,
        tenant_id: decoded.tenantId || decoded.tenant_id,
        permissions: decoded.permissions || [],
        name: decoded.name,
      };

      if (user.id && user.email) {
        request.user = user;
        request.tenantId = user.tenantId || user.tenant_id;
      }
    } catch (error) {
      // Invalid token, but don't fail - just continue without authentication
      logger.debug('Optional authentication failed:', error);
    }
  } catch (error: any) {
    // Don't fail on optional auth errors
    logger.debug('Optional authentication error:', error);
  }
};

