// ============================================
// RATE LIMITING MIDDLEWARE
// Configurable rate limiting per service
// ============================================

import rateLimit from '@fastify/rate-limit';
import { FastifyInstance } from 'fastify';
import { RATE_LIMITS } from '../config/constants';
import { logger } from '../utils/logger';

export interface RateLimitConfig {
  max?: number;
  timeWindow?: string;
  cache?: number;
  allowList?: string[];
  skipOnError?: boolean;
  ban?: number;
  onBanReach?: (req: any, key: string) => void;
  keyGenerator?: (req: any) => string;
}

/**
 * Register rate limiting for a service
 */
export async function registerRateLimit(
  fastify: FastifyInstance,
  config: RateLimitConfig = {}
) {
  const defaultConfig = {
    max: config.max || RATE_LIMITS.DEFAULT.max,
    timeWindow: config.timeWindow || RATE_LIMITS.DEFAULT.timeWindow,
    cache: config.cache || 10000,
    allowList: config.allowList || ['127.0.0.1', '::1'],
    skipOnError: config.skipOnError || false,
    ban: config.ban || 3,
    onBanReach: config.onBanReach || ((_req: any, key: string) => {
      logger.warn(`Rate limit ban reached for IP: ${key}`);
    }),
    keyGenerator: config.keyGenerator || ((req: any) => {
      // Use IP address or user ID as rate limit key
      const ip = req.ip || req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
      const userId = (req as any).user?.id;
      return userId ? `user:${userId}` : `ip:${ip}`;
    }),
    errorResponseBuilder: (_req: any, context: any) => {
      return {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please try again later.',
          retryAfter: context.ttl,
        },
        timestamp: new Date().toISOString(),
      };
    },
  };

  await fastify.register(rateLimit, defaultConfig);
}

/**
 * Service-specific rate limit configurations
 */
export const SERVICE_RATE_LIMITS = {
  // Student Service - moderate limits
  student: {
    max: 100,
    timeWindow: '1 minute',
    cache: 10000,
  },
  
  // Library Service - moderate limits
  library: {
    max: 100,
    timeWindow: '1 minute',
    cache: 10000,
  },
  
  // Booking Service - stricter limits (prevent abuse)
  booking: {
    max: 50,
    timeWindow: '1 minute',
    cache: 10000,
    ban: 5, // Ban after 5 violations
  },
  
  // Payment Service - very strict limits (security critical)
  payment: {
    max: 20,
    timeWindow: '1 minute',
    cache: 10000,
    ban: 3, // Ban after 3 violations
  },
  
  // Auth Service - already configured in auth service
  auth: RATE_LIMITS.AUTH,
  
  // Default for other services
  default: RATE_LIMITS.DEFAULT,
};

