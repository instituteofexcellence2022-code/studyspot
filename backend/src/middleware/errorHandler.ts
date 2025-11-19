// ============================================
// ERROR HANDLING MIDDLEWARE
// Professional error handling for all services
// ============================================

import { FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../utils/logger';
import { formatErrorResponse, AppError } from '../utils/errors';
import { HTTP_STATUS } from '../config/constants';

/**
 * Global error handler
 */
export async function errorHandler(
  error: any,
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Log error
  logger.error('Request error:', {
    method: request.method,
    url: request.url,
    error: {
      message: error.message,
      stack: error.stack,
      code: error.code,
      statusCode: error.statusCode,
    },
    user: (request as any).user?.id || 'anonymous',
    tenantId: (request as any).tenantId || 'none',
    ip: request.ip,
  });

  // Format error response
  const errorResponse = formatErrorResponse(error);

  // Set status code
  const statusCode = error instanceof AppError 
    ? error.statusCode 
    : error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;

  // Send error response
  return reply.status(statusCode).send(errorResponse);
}

/**
 * 404 Not Found handler
 */
export async function notFoundHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  logger.warn('Route not found:', {
    method: request.method,
    url: request.url,
    ip: request.ip,
  });

  return reply.status(HTTP_STATUS.NOT_FOUND).send({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${request.method} ${request.url} not found`,
    },
    timestamp: new Date().toISOString(),
  });
}

/**
 * Async error wrapper
 */
export function asyncHandler(
  fn: (request: FastifyRequest, reply: FastifyReply) => Promise<any>
) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      return await fn(request, reply);
    } catch (error) {
      return errorHandler(error, request, reply);
    }
  };
}
