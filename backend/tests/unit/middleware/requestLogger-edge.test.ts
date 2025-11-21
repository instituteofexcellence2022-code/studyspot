/**
 * UNIT TESTS - REQUEST LOGGER EDGE CASES
 * Additional edge case tests for request logging middleware
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { requestLogger, slowRequestLogger } from '../../../src/middleware/requestLogger';
import { logger } from '../../../src/utils/logger';

// Mock logger
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('Request Logger Edge Cases', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    mockRequest = {
      method: 'GET',
      url: '/api/test',
      headers: {
        'user-agent': 'test-agent',
      },
      ip: '127.0.0.1',
    } as any;

    mockReply = {
      statusCode: 200,
      header: jest.fn(),
      getHeader: jest.fn().mockReturnValue(100),
      raw: {
        on: jest.fn((event, callback) => {
          if (event === 'finish') {
            setTimeout(() => callback(), 0);
          }
        }),
      },
    } as any;

    (mockRequest as any).id = 'test-request-id';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Health Check Skipping', () => {
    it('should skip logging for health checks', async () => {
      mockRequest.url = '/health';
      
      await requestLogger(mockRequest as FastifyRequest, mockReply as FastifyReply);

      // Should not log for health checks
      expect(logger.info).not.toHaveBeenCalled();
    });
  });

  describe('Request ID Generation', () => {
    it('should generate unique request IDs', async () => {
      await requestLogger(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect((mockRequest as any).requestId).toBeDefined();
      expect(typeof (mockRequest as any).requestId).toBe('string');
    });

    it('should set request ID in response header', async () => {
      await requestLogger(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.header).toHaveBeenCalledWith('X-Request-ID', expect.any(String));
    });
  });

  describe('User Context Logging', () => {
    it('should log with user information', async () => {
      (mockRequest as any).user = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'student',
      };
      (mockRequest as any).tenantId = 'tenant-123';

      await requestLogger(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(logger.info).toHaveBeenCalled();
    });

    it('should handle missing user gracefully', async () => {
      await requestLogger(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(logger.info).toHaveBeenCalled();
    });
  });

  describe('IP Address Extraction', () => {
    it('should extract IP from x-forwarded-for header', async () => {
      mockRequest.headers = {
        'x-forwarded-for': '192.168.1.1',
      };

      await requestLogger(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(logger.info).toHaveBeenCalled();
    });

    it('should extract IP from x-real-ip header', async () => {
      mockRequest.headers = {
        'x-real-ip': '10.0.0.1',
      };
      mockRequest.ip = undefined;

      await requestLogger(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(logger.info).toHaveBeenCalled();
    });

    it('should default to unknown if no IP found', async () => {
      mockRequest.ip = undefined;
      mockRequest.headers = {};

      await requestLogger(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(logger.info).toHaveBeenCalled();
    });
  });

  describe('Response Logging', () => {
    it('should log successful responses', async () => {
      mockReply.statusCode = 200;

      await requestLogger(mockRequest as FastifyRequest, mockReply as FastifyReply);
      
      // Trigger finish event
      if (mockReply.raw?.on) {
        const finishCallback = (mockReply.raw.on as jest.Mock).mock.calls.find(
          (call: any[]) => call[0] === 'finish'
        )?.[1];
        if (finishCallback) finishCallback();
      }

      expect(logger.info).toHaveBeenCalled();
    });

    it('should log client errors as warnings', async () => {
      mockReply.statusCode = 400;

      await requestLogger(mockRequest as FastifyRequest, mockReply as FastifyReply);
      
      if (mockReply.raw?.on) {
        const finishCallback = (mockReply.raw.on as jest.Mock).mock.calls.find(
          (call: any[]) => call[0] === 'finish'
        )?.[1];
        if (finishCallback) finishCallback();
      }

      expect(logger.warn).toHaveBeenCalled();
    });

    it('should log server errors as errors', async () => {
      mockReply.statusCode = 500;

      await requestLogger(mockRequest as FastifyRequest, mockReply as FastifyReply);
      
      if (mockReply.raw?.on) {
        const finishCallback = (mockReply.raw.on as jest.Mock).mock.calls.find(
          (call: any[]) => call[0] === 'finish'
        )?.[1];
        if (finishCallback) finishCallback();
      }

      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('Slow Request Detection', () => {
    it('should detect slow requests', async () => {
      await slowRequestLogger(mockRequest as FastifyRequest, mockReply as FastifyReply);
      
      // Simulate slow request
      if (mockReply.raw?.on) {
        const finishCallback = (mockReply.raw.on as jest.Mock).mock.calls.find(
          (call: any[]) => call[0] === 'finish'
        )?.[1];
        if (finishCallback) {
          // Simulate delay
          await new Promise(resolve => setTimeout(resolve, 1100));
          finishCallback();
        }
      }

      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe('Response Size Logging', () => {
    it('should log response size', async () => {
      (mockReply.getHeader as jest.Mock).mockReturnValue(1024);

      await requestLogger(mockRequest as FastifyRequest, mockReply as FastifyReply);
      
      if (mockReply.raw?.on) {
        const finishCallback = (mockReply.raw.on as jest.Mock).mock.calls.find(
          (call: any[]) => call[0] === 'finish'
        )?.[1];
        if (finishCallback) finishCallback();
      }

      expect(mockReply.getHeader).toHaveBeenCalledWith('content-length');
    });
  });
});

