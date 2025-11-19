// ============================================
// REQUEST LOGGING MIDDLEWARE
// Professional request/response logging
// ============================================

import { FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../utils/logger';

/**
 * Request logging middleware
 */
export async function requestLogger(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const startTime = Date.now();
  const user = (request as any).user;
  const tenantId = (request as any).tenantId;

  // Log request
  logger.info('Incoming request', {
    method: request.method,
    url: request.url,
    ip: request.ip,
    userAgent: request.headers['user-agent'],
    userId: user?.id || user?.userId || 'anonymous',
    tenantId: tenantId || 'none',
    userType: user?.userType || user?.user_type || 'none',
  });

  // Log response when finished
  reply.addHook('onSend', (request, reply, payload, done) => {
    const duration = Date.now() - startTime;
    
    logger.info('Request completed', {
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      duration: `${duration}ms`,
      userId: (request as any).user?.id || 'anonymous',
      tenantId: (request as any).tenantId || 'none',
    });

    done();
  });
}

/**
 * Log slow requests
 */
export async function slowRequestLogger(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const startTime = Date.now();
  const SLOW_REQUEST_THRESHOLD = 1000; // 1 second

  reply.addHook('onSend', (request, reply, payload, done) => {
    const duration = Date.now() - startTime;
    
    if (duration > SLOW_REQUEST_THRESHOLD) {
      logger.warn('Slow request detected', {
        method: request.method,
        url: request.url,
        duration: `${duration}ms`,
        statusCode: reply.statusCode,
        userId: (request as any).user?.id || 'anonymous',
        tenantId: (request as any).tenantId || 'none',
      });
    }

    done();
  });
}

