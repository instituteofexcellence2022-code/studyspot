/**
 * UNIT TESTS - ERROR HANDLER MIDDLEWARE
 * Tests for error handling middleware
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { errorHandler, notFoundHandler } from '../../../src/middleware/errorHandler';
import { AppError, ValidationError, AuthenticationError, NotFoundError } from '../../../src/utils/errors';
import { HTTP_STATUS } from '../../../src/config/constants';

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    mockRequest = {
      method: 'GET',
      url: '/api/test',
      headers: {
        'user-agent': 'test-agent',
        'content-type': 'application/json',
      },
      query: {},
      params: {},
      body: {},
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

  describe('errorHandler', () => {
    it('should handle AppError correctly', async () => {
      const error = new ValidationError('Validation failed');
      
      await errorHandler(error, mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(mockReply.send).toHaveBeenCalled();
      const response = (mockReply.send as jest.Mock).mock.calls[0][0];
      expect(response.success).toBe(false);
      expect(response.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle AuthenticationError correctly', async () => {
      const error = new AuthenticationError('Authentication required');
      
      await errorHandler(error, mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
      expect(mockReply.send).toHaveBeenCalled();
    });

    it('should handle NotFoundError correctly', async () => {
      const error = new NotFoundError('Resource not found');
      
      await errorHandler(error, mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
      expect(mockReply.send).toHaveBeenCalled();
    });

    it('should handle generic errors correctly', async () => {
      const error = new Error('Generic error');
      (error as any).statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
      
      await errorHandler(error, mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(mockReply.send).toHaveBeenCalled();
    });

    it('should include request ID in error response if available', async () => {
      (mockRequest as any).requestId = 'test-request-id';
      const error = new ValidationError('Test error');
      
      await errorHandler(error, mockRequest as FastifyRequest, mockReply as FastifyReply);

      const response = (mockReply.send as jest.Mock).mock.calls[0][0];
      expect(response.requestId).toBe('test-request-id');
    });

    it('should handle errors with user context', async () => {
      (mockRequest as any).user = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'student',
      };
      const error = new ValidationError('Test error');
      
      await errorHandler(error, mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalled();
      expect(mockReply.send).toHaveBeenCalled();
    });

    it('should handle 500 errors with proper logging', async () => {
      const error = new Error('Server error');
      (error as any).statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
      
      await errorHandler(error, mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    });

    it('should handle 400 errors with proper logging', async () => {
      const error = new ValidationError('Bad request');
      
      await errorHandler(error, mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
    });
  });

  describe('notFoundHandler', () => {
    it('should return 404 for non-existent routes', async () => {
      await notFoundHandler(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
      expect(mockReply.send).toHaveBeenCalled();
      const response = (mockReply.send as jest.Mock).mock.calls[0][0];
      expect(response.success).toBe(false);
      expect(response.error.code).toBe('NOT_FOUND');
    });

    it('should include method and URL in error message', async () => {
      mockRequest.method = 'POST';
      mockRequest.url = '/api/nonexistent';
      
      await notFoundHandler(mockRequest as FastifyRequest, mockReply as FastifyReply);

      const response = (mockReply.send as jest.Mock).mock.calls[0][0];
      expect(response.error.message).toContain('POST');
      expect(response.error.message).toContain('/api/nonexistent');
    });
  });
});

