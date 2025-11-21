/**
 * UNIT TESTS - ERROR HANDLER EDGE CASES
 * Additional edge case tests for error handling middleware
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { errorHandler, notFoundHandler } from '../../../src/middleware/errorHandler';
import { AppError, DatabaseError, ExternalServiceError } from '../../../src/utils/errors';
import { HTTP_STATUS } from '../../../src/config/constants';

describe('Error Handler Edge Cases', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    mockRequest = {
      method: 'GET',
      url: '/api/test',
      headers: {},
      ip: '127.0.0.1',
    } as any;

    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Database Error Handling', () => {
    it('should handle database connection errors', async () => {
      const error = new DatabaseError('Database connection failed', new Error('ECONNREFUSED'));
      
      await errorHandler(error, mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(mockReply.send).toHaveBeenCalled();
    });

    it('should handle database query errors', async () => {
      const error = new DatabaseError('Query execution failed', { code: '42P01', detail: 'Table does not exist' });
      
      await errorHandler(error, mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    });
  });

  describe('External Service Error Handling', () => {
    it('should handle external service timeout', async () => {
      const error = new ExternalServiceError('PaymentGateway', 'Request timeout', new Error('ETIMEDOUT'));
      
      await errorHandler(error, mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_GATEWAY);
    });

    it('should handle external service unavailable', async () => {
      const error = new ExternalServiceError('SMSGateway', 'Service unavailable', new Error('503'));
      
      await errorHandler(error, mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_GATEWAY);
    });
  });

  describe('Error with Status Code', () => {
    it('should use error statusCode if provided', async () => {
      const error = new Error('Custom error');
      (error as any).statusCode = 418; // I'm a teapot
      
      await errorHandler(error, mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(418);
    });

    it('should default to 500 for errors without statusCode', async () => {
      const error = new Error('Generic error');
      
      await errorHandler(error, mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    });
  });

  describe('Error with Request Context', () => {
    it('should include request ID in error response', async () => {
      (mockRequest as any).requestId = 'req-123';
      const error = new AppError('Test error');
      
      await errorHandler(error, mockRequest as FastifyRequest, mockReply as FastifyReply);

      const response = (mockReply.send as jest.Mock).mock.calls[0][0];
      expect(response.requestId).toBe('req-123');
    });

    it('should log error with user context', async () => {
      (mockRequest as any).user = {
        id: 'user-123',
        email: 'test@example.com',
      };
      (mockRequest as any).tenantId = 'tenant-123';
      const error = new AppError('Test error');
      
      await errorHandler(error, mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalled();
      expect(mockReply.send).toHaveBeenCalled();
    });
  });

  describe('Production Error Sanitization', () => {
    it('should sanitize error details in production', async () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('Sensitive error details');
      error.stack = 'Stack trace with sensitive info';
      
      await errorHandler(error, mockRequest as FastifyRequest, mockReply as FastifyReply);

      const response = (mockReply.send as jest.Mock).mock.calls[0][0];
      expect(response.error.message).toBe('An error occurred');
      expect(response.error.details).toBeUndefined();
    });

    it('should show full error in development', async () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('Development error');
      error.stack = 'Full stack trace';
      
      await errorHandler(error, mockRequest as FastifyRequest, mockReply as FastifyReply);

      const response = (mockReply.send as jest.Mock).mock.calls[0][0];
      expect(response.error.message).toBe('Development error');
    });
  });
});

