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
export const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: {
          code: ERROR_CODES.UNAUTHORIZED,
          message: 'No authorization token provided',
        },
      });
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
      return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: {
          code: ERROR_CODES.INVALID_TOKEN,
          message: 'Invalid or expired token',
        },
      });
    }

    // Attach user to request
    (request as any).user = response.data.data;
  } catch (error: any) {
    logger.error('Authentication error:', error);
    return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
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
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;

    if (!user) {
      return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: {
          code: ERROR_CODES.UNAUTHORIZED,
          message: 'User not authenticated',
        },
      });
    }

    const userPermissions = user.permissions || [];

    // Super admin has all permissions
    if (userPermissions.includes('*')) {
      return;
    }

    if (!userPermissions.includes(permission)) {
      return reply.status(HTTP_STATUS.FORBIDDEN).send({
        success: false,
        error: {
          code: ERROR_CODES.INSUFFICIENT_PERMISSIONS,
          message: `Missing required permission: ${permission}`,
        },
      });
    }
  };
};

/**
 * Check if user has any of the required roles
 */
export const requireRole = (...roles: string[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;

    if (!user) {
      return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: {
          code: ERROR_CODES.UNAUTHORIZED,
          message: 'User not authenticated',
        },
      });
    }

    if (!roles.includes(user.role)) {
      return reply.status(HTTP_STATUS.FORBIDDEN).send({
        success: false,
        error: {
          code: ERROR_CODES.INSUFFICIENT_PERMISSIONS,
          message: `Required role: ${roles.join(' or ')}`,
        },
      });
    }
  };
};

