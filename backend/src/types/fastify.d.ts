/**
 * Fastify type declarations
 * Extend FastifyRequest to include user and tenantId
 */

import { FastifyRequest } from 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      userId: string;
      email: string;
      role?: string;
      roles?: string[];
      userType?: string;
      user_type?: string;
      userTable?: string;
      tenantId?: string;
      tenant_id?: string;
      permissions?: string[];
      name?: string;
    };
    tenantId?: string;
    requestId?: string;
    validatedBody?: any;
    validatedQuery?: any;
    validatedParams?: any;
  }
}

