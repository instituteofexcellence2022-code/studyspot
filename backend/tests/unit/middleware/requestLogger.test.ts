/**
 * UNIT TESTS - REQUEST LOGGER MIDDLEWARE
 * Tests for request logging middleware
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { requestLogger } from '../../../src/middleware/requestLogger';
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

describe('Request Logger Middleware', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    mockRequest = {
      method: 'GET',
      url: '/api/test',
      headers: {
        'user-agent': 'test-agent',
        'authorization': 'Bearer token',
      },
      ip: '127.0.0.1',
    } as any;

    mockReply = {
      statusCode: 200,
      header: jest.fn(),
    } as any;

    // Mock request ID generation
    (mockRequest as any).id = 'test-request-id';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should log incoming request', async () => {
    await requestLogger(mockRequest as FastifyRequest, mockReply as FastifyReply, jest.fn());

    expect(logger.info).toHaveBeenCalled();
    expect((mockRequest as any).id).toBeDefined();
  });

  it('should set request ID header', async () => {
    await requestLogger(mockRequest as FastifyRequest, mockReply as FastifyReply, jest.fn());

    expect(mockReply.header).toHaveBeenCalledWith('X-Request-ID', expect.any(String));
  });

  it('should log request with user context', async () => {
    (mockRequest as any).user = {
      id: 'user-123',
      email: 'test@example.com',
    };
    (mockRequest as any).tenantId = 'tenant-123';

    await requestLogger(mockRequest as FastifyRequest, mockReply as FastifyReply, jest.fn());

    expect(logger.info).toHaveBeenCalled();
  });

  it('should log slow requests', async () => {
    // Simulate slow request by adding delay
    const slowHandler = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 2000)));
    
    await requestLogger(mockRequest as FastifyRequest, mockReply as FastifyReply, slowHandler);

    // Slow request logger should be called if threshold exceeded
    expect(logger.warn).toHaveBeenCalled();
  });
});

