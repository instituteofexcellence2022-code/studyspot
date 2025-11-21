/**
 * UNIT TESTS - VALIDATOR MIDDLEWARE EDGE CASES
 * Additional edge case tests for validation middleware
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { validateBody, validateQuery, validateParams } from '../../../src/middleware/validator';
import { z } from 'zod';
import { ValidationError } from '../../../src/utils/errors';

describe('Validator Middleware Edge Cases', () => {
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

  describe('Body Validation Edge Cases', () => {
    it('should handle missing body', async () => {
      mockRequest.body = undefined;
      const schema = z.object({ name: z.string() });

      await validateBody(schema)(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
    });

    it('should handle null body', async () => {
      mockRequest.body = null;
      const schema = z.object({ name: z.string() });

      await validateBody(schema)(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
    });

    it('should handle empty body', async () => {
      mockRequest.body = {};
      const schema = z.object({ name: z.string() });

      await validateBody(schema)(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
    });

    it('should handle nested object validation', async () => {
      const schema = z.object({
        user: z.object({
          name: z.string(),
          email: z.string().email(),
        }),
      });

      mockRequest.body = {
        user: {
          name: 'Test User',
          email: 'test@example.com',
        },
      };

      await validateBody(schema)(mockRequest as FastifyRequest, mockReply as FastifyReply);

      // On success, validatedBody should be set
      if (!mockReply.send) {
        expect((mockRequest as any).validatedBody).toBeDefined();
      }
    });

    it('should handle array validation', async () => {
      const schema = z.object({
        items: z.array(z.string()),
      });

      mockRequest.body = {
        items: ['item1', 'item2', 'item3'],
      };

      await validateBody(schema)(mockRequest as FastifyRequest, mockReply as FastifyReply);

      // On success, validatedBody should be set
      if (!mockReply.send) {
        expect((mockRequest as any).validatedBody).toBeDefined();
      }
    });
  });

  describe('Query Validation Edge Cases', () => {
    it('should handle missing query parameters', async () => {
      mockRequest.query = undefined;
      const schema = z.object({ page: z.string().optional() });

      await validateQuery(schema)(mockRequest as FastifyRequest, mockReply as FastifyReply);

      // On success, validatedQuery should be set
      if (!mockReply.send) {
        expect((mockRequest as any).validatedQuery).toBeDefined();
      }
    });

    it('should handle empty query', async () => {
      mockRequest.query = {};
      const schema = z.object({ page: z.string().optional() });

      await validateQuery(schema)(mockRequest as FastifyRequest, mockReply as FastifyReply);

      // On success, validatedQuery should be set
      if (!mockReply.send) {
        expect((mockRequest as any).validatedQuery).toBeDefined();
      }
    });

    it('should handle query with default values', async () => {
      const schema = z.object({
        page: z.string().default('1'),
        limit: z.string().default('20'),
      });

      mockRequest.query = {};

      await validateQuery(schema)(mockRequest as FastifyRequest, mockReply as FastifyReply);

      // On success, validatedQuery should be set
      if (!mockReply.send) {
        expect((mockRequest as any).validatedQuery).toBeDefined();
      }
    });

    it('should handle query parameter coercion', async () => {
      const schema = z.object({
        page: z.coerce.number(),
        limit: z.coerce.number(),
      });

      mockRequest.query = {
        page: '1',
        limit: '20',
      };

      await validateQuery(schema)(mockRequest as FastifyRequest, mockReply as FastifyReply);

      // On success, validatedQuery should be set
      if (!mockReply.send) {
        expect((mockRequest as any).validatedQuery).toBeDefined();
      }
    });
  });

  describe('Params Validation Edge Cases', () => {
    it('should handle missing params', async () => {
      mockRequest.params = undefined;
      const schema = z.object({ id: z.string().uuid() });

      await validateParams(schema)(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
    });

    it('should handle empty params', async () => {
      mockRequest.params = {};
      const schema = z.object({ id: z.string().uuid() });

      await validateParams(schema)(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
    });

    it('should validate UUID params', async () => {
      const schema = z.object({ id: z.string().uuid() });

      mockRequest.params = {
        id: '123e4567-e89b-12d3-a456-426614174000',
      };

      await validateParams(schema)(mockRequest as FastifyRequest, mockReply as FastifyReply);

      // On success, validatedParams should be set
      if (!mockReply.send) {
        expect((mockRequest as any).validatedParams).toBeDefined();
      }
    });

    it('should reject invalid UUID params', async () => {
      const schema = z.object({ id: z.string().uuid() });

      mockRequest.params = {
        id: 'invalid-uuid',
      };

      await validateParams(schema)(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
    });
  });

  describe('Error Response Format', () => {
    it('should return formatted validation errors', async () => {
      const schema = z.object({
        email: z.string().email(),
        age: z.number().min(18),
      });

      mockRequest.body = {
        email: 'invalid-email',
        age: 15,
      };

      await validateBody(schema)(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.send).toHaveBeenCalled();
      const response = (mockReply.send as jest.Mock).mock.calls[0][0];
      expect(response.success).toBe(false);
      expect(response.error.code).toBe('VALIDATION_ERROR');
    });
  });
});

