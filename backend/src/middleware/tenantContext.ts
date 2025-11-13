// ============================================
// TENANT CONTEXT MIDDLEWARE
// Multi-tenant database isolation
// ============================================

import { FastifyRequest, FastifyReply } from 'fastify';
import { tenantDbManager } from '../config/database';
import { HTTP_STATUS, ERROR_CODES } from '../config/constants';
import { logger } from '../utils/logger';

/**
 * Extract and attach tenant context to request
 */
export const tenantContext = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const user = (request as any).user;
    const headerTenantId = (request.headers['x-tenant-id'] ||
      request.headers['X-Tenant-Id']) as string | undefined;

    if (!user && !headerTenantId) {
      return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: {
          code: ERROR_CODES.UNAUTHORIZED,
          message: 'User not authenticated',
        },
      });
    }

    // Get tenant ID from user token or header
    const tenantId =
      headerTenantId ||
      user?.tenantId ||
      user?.tenant_id ||
      (user?.tenant?.id as string | undefined);

    if (!tenantId) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Tenant ID not found in user context',
        },
      });
    }

    // Get tenant-specific database connection
    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    // Attach to request
    (request as any).tenantId = tenantId;
    (request as any).tenantDb = tenantDb;

    logger.info('Tenant context attached', {
      tenantId,
      userId: user?.userId ?? user?.id ?? null,
    });
  } catch (error: any) {
    logger.error('Tenant context error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to establish tenant context',
      },
    });
  }
};

/**
 * Verify tenant status (not suspended/expired)
 */
export const verifyTenantStatus = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const tenantId = (request as any).tenantId;

    if (!tenantId) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Tenant ID not found',
        },
      });
    }

    // Check tenant status (simplified - would query database in production)
    // const tenant = await getTenantById(tenantId);
    // if (tenant.status === 'suspended') { ... }

  } catch (error: any) {
    logger.error('Tenant status verification error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Tenant verification failed',
      },
    });
  }
};

