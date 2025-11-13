// ============================================
// AUTHENTICATION MIDDLEWARE
// JWT token verification
// ============================================

import { FastifyRequest, FastifyReply } from 'fastify';
import axios from 'axios';
import { HTTP_STATUS, ERROR_CODES } from '../config/constants';
import { logger } from '../utils/logger';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

/**
 * Authenticate request using JWT token
 */
export const authenticate = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      await reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: {
          code: ERROR_CODES.UNAUTHORIZED,
          message: 'No authorization token provided',
        },
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Verify token with auth service
    const response = await axios.post(
      `${AUTH_SERVICE_URL}/api/v1/auth/verify`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.data.success) {
      await reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: {
          code: ERROR_CODES.INVALID_TOKEN,
          message: 'Invalid or expired token',
        },
      });
      return;
    }

    // Attach user to request
    (request as any).user = response.data.data;
  } catch (error: any) {
    logger.error('Authentication error:', error);
    await reply.status(HTTP_STATUS.UNAUTHORIZED).send({
      success: false,
      error: {
        code: ERROR_CODES.INVALID_TOKEN,
        message: 'Authentication failed',
      },
    });
  }
};

/**
 * Check if user has required permission
 */
export const requirePermission = (permission: string) => {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const user = (request as any).user;

    if (!user) {
      await reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: {
          code: ERROR_CODES.UNAUTHORIZED,
          message: 'User not authenticated',
        },
      });
      return;
    }

    const userPermissions = user.permissions || [];

    // Super admin has all permissions
    if (userPermissions.includes('*')) {
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
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const user = (request as any).user;

    if (!user) {
      await reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: {
          code: ERROR_CODES.UNAUTHORIZED,
          message: 'User not authenticated',
        },
      });
      return;
    }

    if (!roles.includes(user.role)) {
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

