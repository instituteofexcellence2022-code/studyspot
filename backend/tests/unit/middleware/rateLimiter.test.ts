/**
 * UNIT TESTS - RATE LIMITER MIDDLEWARE
 * Tests for rate limiting middleware
 */

import { FastifyInstance } from 'fastify';
import { registerRateLimit, SERVICE_RATE_LIMITS } from '../../../src/middleware/rateLimiter';

describe('Rate Limiter Middleware', () => {
  let mockFastify: Partial<FastifyInstance>;

  beforeEach(() => {
    mockFastify = {
      register: jest.fn().mockResolvedValue(undefined),
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerRateLimit', () => {
    it('should register rate limit with default config', async () => {
      await registerRateLimit(mockFastify as FastifyInstance);

      expect(mockFastify.register).toHaveBeenCalled();
    });

    it('should register rate limit with custom config', async () => {
      const customConfig = {
        max: 50,
        timeWindow: '5 minutes',
      };

      await registerRateLimit(mockFastify as FastifyInstance, customConfig);

      expect(mockFastify.register).toHaveBeenCalled();
    });

    it('should use service-specific rate limits', async () => {
      await registerRateLimit(mockFastify as FastifyInstance, SERVICE_RATE_LIMITS.student);

      expect(mockFastify.register).toHaveBeenCalled();
    });

    it('should handle payment service strict limits', async () => {
      await registerRateLimit(mockFastify as FastifyInstance, SERVICE_RATE_LIMITS.payment);

      expect(mockFastify.register).toHaveBeenCalled();
    });

    it('should handle booking service limits', async () => {
      await registerRateLimit(mockFastify as FastifyInstance, SERVICE_RATE_LIMITS.booking);

      expect(mockFastify.register).toHaveBeenCalled();
    });
  });

  describe('SERVICE_RATE_LIMITS', () => {
    it('should have student service limits configured', () => {
      expect(SERVICE_RATE_LIMITS.student).toBeDefined();
      expect(SERVICE_RATE_LIMITS.student.max).toBe(100);
      expect(SERVICE_RATE_LIMITS.student.timeWindow).toBe('1 minute');
    });

    it('should have library service limits configured', () => {
      expect(SERVICE_RATE_LIMITS.library).toBeDefined();
      expect(SERVICE_RATE_LIMITS.library.max).toBe(100);
    });

    it('should have booking service limits configured', () => {
      expect(SERVICE_RATE_LIMITS.booking).toBeDefined();
      expect(SERVICE_RATE_LIMITS.booking.max).toBe(50);
      expect(SERVICE_RATE_LIMITS.booking.ban).toBe(5);
    });

    it('should have payment service strict limits configured', () => {
      expect(SERVICE_RATE_LIMITS.payment).toBeDefined();
      expect(SERVICE_RATE_LIMITS.payment.max).toBe(20);
      expect(SERVICE_RATE_LIMITS.payment.ban).toBe(3);
    });

    it('should have default limits configured', () => {
      expect(SERVICE_RATE_LIMITS.default).toBeDefined();
    });
  });
});

