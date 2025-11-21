/**
 * UNIT TESTS - VALIDATOR MIDDLEWARE
 * Tests for input validation middleware
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { validateBody, validateQuery, validateParams } from '../../../src/middleware/validator';
import { ValidationError } from '../../../src/utils/errors';
import { z } from 'zod';

describe('Validator Middleware', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    mockRequest = {
      body: {},
      query: {},
      params: {},
    } as any;

    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateBody', () => {
    const testSchema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
      age: z.number().int().positive(),
    });

    it('should validate valid body', async () => {
      mockRequest.body = {
        name: 'Test User',
        email: 'test@example.com',
        age: 25,
      };

      const middleware = validateBody(testSchema);
      await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect((mockRequest as any).validatedBody).toEqual(mockRequest.body);
    });

    it('should return validation error for invalid body', async () => {
      mockRequest.body = {
        name: '', // Invalid: empty string
        email: 'invalid-email', // Invalid: not an email
        age: -5, // Invalid: negative number
      };

      const middleware = validateBody(testSchema);
      await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalled();
      const sendCall = (mockReply.send as jest.Mock).mock.calls[0][0];
      expect(sendCall.success).toBe(false);
      expect(sendCall.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return validation error for missing required fields', async () => {
      mockRequest.body = {
        name: 'Test User',
        // Missing email and age
      };

      const middleware = validateBody(testSchema);
      await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalled();
      const sendCall = (mockReply.send as jest.Mock).mock.calls[0][0];
      expect(sendCall.success).toBe(false);
      expect(sendCall.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('validateQuery', () => {
    const testSchema = z.object({
      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().positive().max(100).default(20),
      search: z.string().optional(),
    });

    it('should validate valid query parameters', async () => {
      mockRequest.query = {
        page: '1',
        limit: '10',
        search: 'test',
      };

      const middleware = validateQuery(testSchema);
      await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect((mockRequest as any).validatedQuery).toBeDefined();
    });

    it('should apply default values for missing optional fields', async () => {
      mockRequest.query = {};

      const middleware = validateQuery(testSchema);
      await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      const validated = (mockRequest as any).validatedQuery;
      expect(validated.page).toBe(1);
      expect(validated.limit).toBe(20);
    });

    it('should return validation error for invalid query parameters', async () => {
      mockRequest.query = {
        page: '-1', // Invalid: negative
        limit: '200', // Invalid: exceeds max
      };

      const middleware = validateQuery(testSchema);
      await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalled();
      const sendCall = (mockReply.send as jest.Mock).mock.calls[0][0];
      expect(sendCall.success).toBe(false);
      expect(sendCall.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('validateParams', () => {
    const testSchema = z.object({
      id: z.string().uuid(),
    });

    it('should validate valid params', async () => {
      mockRequest.params = {
        id: '123e4567-e89b-12d3-a456-426614174000',
      };

      const middleware = validateParams(testSchema);
      await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect((mockRequest as any).validatedParams).toBeDefined();
    });

    it('should return validation error for invalid params', async () => {
      mockRequest.params = {
        id: 'invalid-uuid',
      };

      const middleware = validateParams(testSchema);
      await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalled();
      const sendCall = (mockReply.send as jest.Mock).mock.calls[0][0];
      expect(sendCall.success).toBe(false);
      expect(sendCall.error.code).toBe('VALIDATION_ERROR');
    });
  });
});

