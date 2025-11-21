// ============================================
// TYPE HELPERS
// Utility functions for type-safe request handling
// ============================================

import { FastifyRequest } from 'fastify';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * Safely extract typed params from request
 */
export function getParams<T extends Record<string, string | undefined>>(
  request: FastifyRequest
): T {
  return (request.params || {}) as T;
}

/**
 * Safely extract typed query from request with number coercion
 */
export function getQuery<T extends Record<string, unknown>>(
  request: FastifyRequest
): T {
  const query = request.query || {};
  const typed: Record<string, unknown> = typeof query === 'object' && query !== null ? { ...query } : {};
  
  // Coerce common numeric fields
  if ('page' in typed && typeof typed.page === 'string') {
    typed.page = parseInt(typed.page, 10) || 1;
  }
  if ('limit' in typed && typeof typed.limit === 'string') {
    typed.limit = parseInt(typed.limit, 10) || 20;
  }
  if ('offset' in typed && typeof typed.offset === 'string') {
    typed.offset = parseInt(typed.offset, 10) || 0;
  }
  
  return typed as T;
}

/**
 * Safely extract typed body from request
 */
export function getBody<T extends Record<string, unknown>>(
  request: FastifyRequest
): T {
  return (request.body || {}) as T;
}

/**
 * Get authenticated user from request
 */
export function getUser(request: FastifyRequest): AuthenticatedRequest['user'] {
  return (request as AuthenticatedRequest).user;
}

/**
 * Get tenant ID from request
 */
export function getTenantId(request: FastifyRequest): string | undefined {
  const authRequest = request as AuthenticatedRequest;
  const user = authRequest.user;
  return (
    authRequest.tenantId ||
    (user && typeof user === 'object' && 'tenantId' in user ? (user as { tenantId?: string }).tenantId : undefined) ||
    (authRequest.headers['x-tenant-id'] as string | undefined)
  );
}

/**
 * Ensure tenant ID exists, throw error if not
 */
export function requireTenantId(request: FastifyRequest): string {
  const tenantId = getTenantId(request);
  if (!tenantId) {
    throw new Error('Tenant ID is required');
  }
  return tenantId;
}

/**
 * Type-safe error handler
 */
export function handleError(
  error: unknown,
  context?: {
    requestId?: string;
    userId?: string;
    tenantId?: string;
    operation?: string;
  }
): {
  message: string;
  stack?: string;
  code?: string;
  context?: typeof context;
} {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      code: (error as any).code,
      context,
    };
  }
  
  return {
    message: 'Unknown error',
    context,
  };
}

