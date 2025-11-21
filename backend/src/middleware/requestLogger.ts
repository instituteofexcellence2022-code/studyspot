// ============================================
// REQUEST LOGGING MIDDLEWARE
// Professional request/response logging with performance tracking
// ============================================

import { FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../utils/logger';
import { randomBytes } from 'crypto';

// Generate request ID (using crypto instead of uuid)
function generateRequestId(): string {
  return randomBytes(16).toString('hex');
}

/**
 * Enhanced request logging middleware
 */
export async function requestLogger(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const startTime = Date.now();
  const requestId = generateRequestId();
  const user = (request as any).user;
  const tenantId = (request as any).tenantId;

  // Attach request ID to request and reply
  (request as any).requestId = requestId;
  (reply as any).requestId = requestId;

  // Set request ID in response header
  reply.header('X-Request-ID', requestId);

  // Skip logging for health checks
  if (request.url === '/health') {
    return;
  }

  // Log incoming request
  const requestLog = {
    requestId,
    method: request.method,
    url: request.url,
    ip: request.ip || request.headers['x-forwarded-for'] || request.headers['x-real-ip'] || 'unknown',
    userAgent: request.headers['user-agent'],
    userId: user?.id || user?.userId || 'anonymous',
    tenantId: tenantId || 'none',
    userType: user?.userType || user?.user_type || 'none',
    userEmail: user?.email || 'none',
    timestamp: new Date().toISOString(),
  };

  logger.info('Incoming request', requestLog);

  // Log response when finished
  reply.raw.on('finish', () => {
    const duration = Date.now() - startTime;
    const responseSize = reply.getHeader('content-length') || 0;
    
    const responseLog = {
      requestId,
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      duration: `${duration}ms`,
      durationMs: duration,
      responseSize: `${responseSize} bytes`,
      userId: (request as any).user?.id || 'anonymous',
      tenantId: (request as any).tenantId || 'none',
      timestamp: new Date().toISOString(),
    };

    // Log based on status code
    if (reply.statusCode >= 500) {
      logger.error('Request completed with server error', responseLog);
    } else if (reply.statusCode >= 400) {
      logger.warn('Request completed with client error', responseLog);
    } else {
      logger.info('Request completed successfully', responseLog);
    }

    // Log slow requests separately
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        ...responseLog,
        threshold: '1000ms',
      });
    }
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

  reply.raw.on('finish', () => {
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
  });
}

