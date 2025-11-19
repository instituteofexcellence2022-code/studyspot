// ============================================
// SECURITY MIDDLEWARE INTEGRATION EXAMPLE
// How to use security middleware in services
// ============================================

import { FastifyInstance } from 'fastify';
import { requireAdmin, requireSuperAdmin, auditLog, validateTenantAccess } from '../../middleware/security';
import { enhancedTenantContext } from '../../middleware/enhancedTenantContext';

/**
 * Example: Admin-only routes
 */
export function registerAdminRoutes(fastify: FastifyInstance) {
  // All routes in this group require admin access
  fastify.register(async (fastify) => {
    // Apply admin middleware to all routes
    fastify.addHook('preHandler', requireAdmin);
    fastify.addHook('onResponse', auditLog);

    // Admin dashboard
    fastify.get('/api/v1/admin/dashboard', async (request, reply) => {
      // Only admins can access
      return { success: true, data: { message: 'Admin dashboard' } };
    });

    // User management (admin only)
    fastify.get('/api/v1/admin/users', async (request, reply) => {
      // Admin can list all users
      return { success: true, data: [] };
    });
  });
}

/**
 * Example: Super admin-only routes
 */
export function registerSuperAdminRoutes(fastify: FastifyInstance) {
  fastify.register(async (fastify) => {
    // Apply super admin middleware
    fastify.addHook('preHandler', requireSuperAdmin);
    fastify.addHook('onResponse', auditLog);

    // Tenant management (super admin only)
    fastify.post('/api/v1/admin/tenants', async (request, reply) => {
      // Only super admins can create tenants
      return { success: true, data: { message: 'Tenant created' } };
    });
  });
}

/**
 * Example: Tenant-scoped routes with isolation
 */
export function registerTenantRoutes(fastify: FastifyInstance) {
  fastify.register(async (fastify) => {
    // Apply enhanced tenant context
    fastify.addHook('preHandler', enhancedTenantContext);
    fastify.addHook('preHandler', validateTenantAccess);

    // Student management (tenant-scoped)
    fastify.get('/api/v1/students', async (request, reply) => {
      const tenantId = (request as any).tenantId;
      const tenantDb = (request as any).tenantDb;

      // Query automatically scoped to tenant
      const result = await tenantDb.query(
        'SELECT * FROM students WHERE tenant_id = $1',
        [tenantId]
      );

      return { success: true, data: result.rows };
    });
  });
}

/**
 * Example: Mixed routes (public + protected)
 */
export function registerMixedRoutes(fastify: FastifyInstance) {
  // Public health check
  fastify.get('/health', async () => {
    return { status: 'healthy' };
  });

  // Protected admin route
  fastify.get('/api/v1/admin/health', {
    preHandler: [requireAdmin],
  }, async () => {
    return { status: 'healthy', admin: true };
  });
}

