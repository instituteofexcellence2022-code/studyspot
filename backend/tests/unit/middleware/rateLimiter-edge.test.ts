/**
 * UNIT TESTS - RATE LIMITER EDGE CASES
 * Additional edge case tests for rate limiting middleware
 */

import { FastifyInstance } from 'fastify';
import { registerRateLimit, SERVICE_RATE_LIMITS } from '../../../src/middleware/rateLimiter';

describe('Rate Limiter Edge Cases', () => {
  let mockFastify: Partial<FastifyInstance>;

  beforeEach(() => {
    mockFastify = {
      register: jest.fn().mockResolvedValue(undefined),
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rate Limit Configuration', () => {
    it('should handle very high rate limits', async () => {
      const highLimit = {
        max: 10000,
        timeWindow: '1 hour',
      };

      await registerRateLimit(mockFastify as FastifyInstance, highLimit);

      expect(mockFastify.register).toHaveBeenCalled();
    });

    it('should handle very low rate limits', async () => {
      const lowLimit = {
        max: 1,
        timeWindow: '1 minute',
      };

      await registerRateLimit(mockFastify as FastifyInstance, lowLimit);

      expect(mockFastify.register).toHaveBeenCalled();
    });

    it('should handle custom ban duration', async () => {
      const configWithBan = {
        max: 10,
        timeWindow: '1 minute',
        ban: 10, // 10 minutes ban
      };

      await registerRateLimit(mockFastify as FastifyInstance, configWithBan);

      expect(mockFastify.register).toHaveBeenCalled();
    });
  });

  describe('Service-Specific Limits', () => {
    it('should apply payment service strict limits', async () => {
      await registerRateLimit(mockFastify as FastifyInstance, SERVICE_RATE_LIMITS.payment);

      expect(SERVICE_RATE_LIMITS.payment.max).toBe(20);
      expect(SERVICE_RATE_LIMITS.payment.ban).toBe(3);
    });

    it('should apply booking service limits', async () => {
      await registerRateLimit(mockFastify as FastifyInstance, SERVICE_RATE_LIMITS.booking);

      expect(SERVICE_RATE_LIMITS.booking.max).toBe(50);
      expect(SERVICE_RATE_LIMITS.booking.ban).toBe(5);
    });

    it('should apply student service limits', async () => {
      await registerRateLimit(mockFastify as FastifyInstance, SERVICE_RATE_LIMITS.student);

      expect(SERVICE_RATE_LIMITS.student.max).toBe(100);
    });
  });

  describe('Time Window Formats', () => {
    it('should handle various time window formats', async () => {
      const formats = [
        '1 minute',
        '5 minutes',
        '1 hour',
        '1 day',
        '1000 ms',
      ];

      for (const format of formats) {
        await registerRateLimit(mockFastify as FastifyInstance, {
          max: 10,
          timeWindow: format,
        });
      }

      expect(mockFastify.register).toHaveBeenCalledTimes(formats.length);
    });
  });
});

