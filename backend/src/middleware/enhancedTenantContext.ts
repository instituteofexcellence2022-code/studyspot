// ============================================
// ENHANCED TENANT CONTEXT MIDDLEWARE
// High-security tenant isolation
// ============================================

import { FastifyRequest, FastifyReply } from 'fastify';
import { tenantDbManager, coreDb } from '../config/database';
import { HTTP_STATUS, ERROR_CODES } from '../config/constants';
import { logger } from '../utils/logger';

/**
 * Enhanced tenant context with strict isolation
 */
export const enhancedTenantContext = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  try {
    const user = (request as any).user;
    const headerTenantId = (request.headers['x-tenant-id'] ||
      request.headers['X-Tenant-Id']) as string | undefined;

    if (!user && !headerTenantId) {
      await reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: {
          code: ERROR_CODES.UNAUTHORIZED,
          message: 'User not authenticated',
        },
      });
      return;
    }

    // Get tenant ID from user token or header
    let tenantId =
      headerTenantId ||
      user?.tenantId ||
      user?.tenant_id ||
      (user?.tenant?.id as string | undefined);

    // For admin users, get tenant from database if not in token
    if (!tenantId && user) {
      try {
        const userResult = await coreDb.query(
          'SELECT tenant_id FROM admin_users WHERE id = $1',
          [user.userId || user.id]
        );
        
        if (userResult.rows.length > 0 && userResult.rows[0].tenant_id) {
          tenantId = userResult.rows[0].tenant_id;
        }
      } catch (dbError) {
        logger.error('Failed to fetch tenant from database:', dbError);
      }
    }

    if (!tenantId) {
      await reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Tenant ID not found in user context',
        },
      });
      return;
    }

    // Verify tenant exists and is active
    const tenantResult = await coreDb.query(
      'SELECT id, status, subscription_status, subscription_end_date FROM tenants WHERE id = $1',
      [tenantId]
    );

    if (!tenantResult.rows.length) {
      logger.warn('Tenant not found', { tenantId, userId: user?.userId || user?.id });
      await reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: 'Tenant not found',
        },
      });
      return;
    }

    const tenant = tenantResult.rows[0];

    // Check tenant status
    if (tenant.status !== 'active') {
      logger.warn('Inactive tenant access attempt', {
        tenantId,
        status: tenant.status,
        userId: user?.userId || user?.id,
      });

      await reply.status(HTTP_STATUS.FORBIDDEN).send({
        success: false,
        error: {
          code: ERROR_CODES.FORBIDDEN,
          message: `Tenant is ${tenant.status}`,
        },
      });
      return;
    }

    // Check subscription status
    if (tenant.subscription_status === 'expired' || tenant.subscription_status === 'cancelled') {
      logger.warn('Expired/cancelled tenant access attempt', {
        tenantId,
        subscriptionStatus: tenant.subscription_status,
        userId: user?.userId || user?.id,
      });

      await reply.status(HTTP_STATUS.FORBIDDEN).send({
        success: false,
        error: {
          code: ERROR_CODES.FORBIDDEN,
          message: 'Tenant subscription has expired or been cancelled',
        },
      });
      return;
    }

    // Check subscription end date
    if (tenant.subscription_end_date && new Date(tenant.subscription_end_date) < new Date()) {
      logger.warn('Subscription expired tenant access attempt', {
        tenantId,
        endDate: tenant.subscription_end_date,
        userId: user?.userId || user?.id,
      });

      await reply.status(HTTP_STATUS.FORBIDDEN).send({
        success: false,
        error: {
          code: ERROR_CODES.FORBIDDEN,
          message: 'Tenant subscription has expired',
        },
      });
      return;
    }

    // Verify user has access to this tenant
    if (user) {
      const userType = user.userType || user.user_type;
      const userRoles = Array.isArray(user.roles) ? user.roles : [user.role];
      const isSuperAdmin = userRoles.includes('super_admin');
      const isPlatformAdmin = userType === 'platform_admin';

      // Platform admins (super_admin, admin, etc.) can access any tenant
      if (isPlatformAdmin && (isSuperAdmin || userRoles.includes('admin') || userRoles.includes('support'))) {
        logger.info('Platform admin accessing tenant', {
          userId: user.userId || user.id,
          userType,
          roles: userRoles,
          tenantId,
        });
        // Allow access
      } else {
        // Library owners and staff can only access their own tenant
        const userTenantId = user.tenantId || user.tenant_id;
        
        // Check user's tenant_id in database if not in token
        if (!userTenantId) {
          const userResult = await coreDb.query(
            'SELECT tenant_id, user_type FROM admin_users WHERE id = $1',
            [user.userId || user.id]
          );
          
          if (userResult.rows.length > 0) {
            const dbTenantId = userResult.rows[0].tenant_id;
            const dbUserType = userResult.rows[0].user_type;
            
            // Platform admins don't have tenant_id
            if (dbUserType === 'platform_admin') {
              // Allow platform admin access
              logger.info('Platform admin (from DB) accessing tenant', {
                userId: user.userId || user.id,
                tenantId,
              });
            } else if (dbTenantId && dbTenantId !== tenantId) {
              logger.warn('Tenant access violation', {
                userId: user.userId || user.id,
                userTenantId: dbTenantId,
                requestedTenantId: tenantId,
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
        } else if (userTenantId !== tenantId) {
          logger.warn('Tenant access violation', {
            userId: user.userId || user.id,
            userTenantId,
            requestedTenantId: tenantId,
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
    }

    // Get tenant-specific database connection
    let tenantDb;
    try {
      tenantDb = await tenantDbManager.getTenantConnection(tenantId);
    } catch (dbError: any) {
      logger.error('Failed to get tenant database connection:', dbError);
      
      // For development: use same database with tenant_id filtering
      if (dbError.message?.includes('Tenant not found') || dbError.message?.includes('database')) {
        logger.warn('Using core database with tenant_id filtering', { tenantId });
        tenantDb = coreDb; // Fallback to core database
      } else {
        throw dbError;
      }
    }

    // Attach to request
    (request as any).tenantId = tenantId;
    (request as any).tenantDb = tenantDb;
    (request as any).tenant = tenant;

    logger.info('Enhanced tenant context attached', {
      tenantId,
      userId: user?.userId ?? user?.id ?? null,
      tenantStatus: tenant.status,
    });
  } catch (error: any) {
    logger.error('Enhanced tenant context error:', error);
    await reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to establish tenant context',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
    });
  }
};

/**
 * Query helper to ensure tenant isolation
 */
export const ensureTenantIsolation = (query: string, tenantId: string, params: any[] = []): { query: string; params: any[] } => {
  // Ensure tenant_id is in WHERE clause
  if (!query.toLowerCase().includes('tenant_id')) {
    const whereClause = query.toLowerCase().includes('where') ? ' AND' : ' WHERE';
    return {
      query: `${query}${whereClause} tenant_id = $${params.length + 1}`,
      params: [...params, tenantId],
    };
  }
  
  return { query, params };
};

