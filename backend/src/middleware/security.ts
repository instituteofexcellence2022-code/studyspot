// ============================================
// SECURITY MIDDLEWARE
// High-security measures for admin portal
// ============================================

import { FastifyRequest, FastifyReply } from 'fastify';
import { HTTP_STATUS, ERROR_CODES } from '../config/constants';
import { logger } from '../utils/logger';
import { coreDb } from '../config/database';

/**
 * Admin-only access control
 */
export const requireAdmin = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  try {
    const user = (request as any).user;
    
    if (!user) {
      await reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: {
          code: ERROR_CODES.UNAUTHORIZED,
          message: 'Authentication required',
        },
      });
      return;
    }

    // Check if user is platform admin (not library owner)
    const userType = user.userType || user.user_type;
    const adminRoles = ['super_admin', 'admin', 'support', 'analyst', 'sales', 'finance'];
    const userRoles = Array.isArray(user.roles) ? user.roles : [user.role];
    const isPlatformAdmin = userType === 'platform_admin';
    const hasAdminRole = userRoles.some(role => adminRoles.includes(role));
    
    // Platform admins must have platform_admin user_type AND admin role
    if (!isPlatformAdmin || !hasAdminRole) {

    if (!hasAdminRole) {
      logger.warn('Unauthorized admin access attempt', {
        userId: user.userId || user.id,
        roles: userRoles,
        path: request.url,
        ip: request.ip,
      });

      await reply.status(HTTP_STATUS.FORBIDDEN).send({
        success: false,
        error: {
          code: ERROR_CODES.FORBIDDEN,
          message: 'Admin access required',
        },
      });
      return;
    }

    // Attach admin context
    (request as any).isAdmin = true;
    (request as any).adminRoles = userRoles;
  } catch (error: any) {
    logger.error('Admin check error:', error);
    await reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Authorization check failed',
      },
    });
  }
};

/**
 * Super admin only access
 */
export const requireSuperAdmin = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  try {
    const user = (request as any).user;
    
    if (!user) {
      await reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: {
          code: ERROR_CODES.UNAUTHORIZED,
          message: 'Authentication required',
        },
      });
      return;
    }

    const userRoles = Array.isArray(user.roles) ? user.roles : [user.role];
    const isSuperAdmin = userRoles.includes('super_admin');

    if (!isSuperAdmin) {
      logger.warn('Unauthorized super admin access attempt', {
        userId: user.userId || user.id,
        roles: userRoles,
        path: request.url,
        ip: request.ip,
      });

      await reply.status(HTTP_STATUS.FORBIDDEN).send({
        success: false,
        error: {
          code: ERROR_CODES.FORBIDDEN,
          message: 'Super admin access required',
        },
      });
      return;
    }

    (request as any).isSuperAdmin = true;
  } catch (error: any) {
    logger.error('Super admin check error:', error);
    await reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Authorization check failed',
      },
    });
  }
};

/**
 * IP whitelist check (optional)
 */
export const checkIpWhitelist = (allowedIps: string[]) => {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (allowedIps.length === 0) {
      return; // No whitelist configured
    }

    const clientIp = request.ip || 
                     (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
                     (request.headers['x-real-ip'] as string) ||
                     'unknown';

    if (!allowedIps.includes(clientIp)) {
      logger.warn('IP not in whitelist', {
        ip: clientIp,
        path: request.url,
        allowedIps,
      });

      await reply.status(HTTP_STATUS.FORBIDDEN).send({
        success: false,
        error: {
          code: ERROR_CODES.FORBIDDEN,
          message: 'IP address not authorized',
        },
      });
      return;
    }
  };
};

/**
 * Audit log middleware
 */
export const auditLog = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  try {
    const user = (request as any).user;
    const tenantId = (request as any).tenantId;
    
    // Log sensitive operations
    const sensitivePaths = ['/api/v1/admin', '/api/users', '/api/tenants'];
    const isSensitive = sensitivePaths.some(path => request.url.includes(path));

    if (isSensitive && user) {
      // Store audit log in database
      try {
        await coreDb.query(
          `INSERT INTO audit_logs (user_id, tenant_id, action, method, path, ip_address, user_agent, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
          [
            user.userId || user.id,
            tenantId || null,
            `${request.method} ${request.url}`,
            request.method,
            request.url,
            request.ip || 'unknown',
            request.headers['user-agent'] || 'unknown',
          ]
        );
      } catch (auditError) {
        // Don't fail request if audit logging fails
        logger.error('Audit log error:', auditError);
      }
    }
  } catch (error) {
    // Don't fail request if audit logging fails
    logger.error('Audit log middleware error:', error);
  }
};

/**
 * Rate limiting per user/tenant
 */
export const rateLimitByUser = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  // This would integrate with Redis or in-memory cache
  // For now, basic implementation
  const user = (request as any).user;
  if (user) {
    // Rate limiting would be handled by @fastify/rate-limit
    // This is a placeholder for custom rate limiting logic
  }
};

/**
 * Validate tenant access
 */
export const validateTenantAccess = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  try {
    const user = (request as any).user;
    const tenantId = (request as any).tenantId;

    if (!tenantId) {
      return; // No tenant context needed
    }

    // Verify user has access to this tenant
    if (user) {
      const userTenantId = user.tenantId || user.tenant_id;
      
      // Super admins can access any tenant
      const userRoles = Array.isArray(user.roles) ? user.roles : [user.role];
      const isSuperAdmin = userRoles.includes('super_admin');

      if (!isSuperAdmin && userTenantId !== tenantId) {
        logger.warn('Tenant access violation', {
          userId: user.userId || user.id,
          userTenantId,
          requestedTenantId: tenantId,
          path: request.url,
        });

        await reply.status(HTTP_STATUS.FORBIDDEN).send({
          success: false,
          error: {
            code: ERROR_CODES.FORBIDDEN,
            message: 'Access denied to this tenant',
          },
        });
        return;
      }
    }
  } catch (error: any) {
    logger.error('Tenant access validation error:', error);
    await reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Tenant access validation failed',
      },
    });
  }
};

