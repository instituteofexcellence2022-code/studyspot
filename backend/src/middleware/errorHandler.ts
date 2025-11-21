// ============================================
// ERROR HANDLING MIDDLEWARE
// Professional error handling for all services
// ============================================

import { FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../utils/logger';
import { formatErrorResponse, AppError } from '../utils/errors';
import { HTTP_STATUS, ERROR_CODES } from '../config/constants';

/**
 * Global error handler with enhanced logging
 */
export async function errorHandler(
  error: any,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = (request as any).user;
  const tenantId = (request as any).tenantId;
  
  // Determine error details
  const isAppError = error instanceof AppError;
  const statusCode = isAppError 
    ? error.statusCode 
    : error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  
  const errorCode = isAppError
    ? error.errorCode
    : error.code || ERROR_CODES.SERVER_ERROR;

  // Enhanced error logging
  const errorLog = {
    method: request.method,
    url: request.url,
    statusCode,
    errorCode,
    error: {
      message: error.message,
      name: error.name,
      code: error.code,
      ...(error.stack && { stack: error.stack }),
    },
    request: {
      headers: {
        'user-agent': request.headers['user-agent'],
        'content-type': request.headers['content-type'],
        'authorization': request.headers['authorization'] ? '[REDACTED]' : undefined,
      },
      query: request.query,
      params: request.params,
      body: request.body ? '[REDACTED]' : undefined, // Don't log sensitive data
    },
    user: {
      id: user?.id || user?.userId || 'anonymous',
      email: user?.email || 'none',
      role: user?.role || 'none',
      userType: user?.userType || user?.user_type || 'none',
    },
    tenantId: tenantId || 'none',
    ip: request.ip || request.headers['x-forwarded-for'] || request.headers['x-real-ip'] || 'unknown',
    timestamp: new Date().toISOString(),
  };

  // Log based on severity
  if (statusCode >= 500) {
    logger.error('Server error:', errorLog);
  } else if (statusCode >= 400) {
    logger.warn('Client error:', errorLog);
  } else {
    logger.info('Request error:', errorLog);
  }

  // Format error response
  const errorResponse: any = formatErrorResponse(error);

  // Add request ID if available
  if ((request as any).requestId) {
    errorResponse.requestId = (request as any).requestId;
  }

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
