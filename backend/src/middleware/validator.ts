// ============================================
// INPUT VALIDATION MIDDLEWARE
// Professional request validation with proper error handling
// ============================================

import { FastifyRequest, FastifyReply } from 'fastify';
import { z, ZodError } from 'zod';
import { ValidationError } from '../utils/errors';
import { HTTP_STATUS, ERROR_CODES } from '../config/constants';

/**
 * Validate request body
 */
export function validateBody<T>(schema: z.ZodSchema<T>) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const validated = schema.parse(request.body);
      (request as any).validatedBody = validated;
      // Replace request.body with validated data
      request.body = validated as any;
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        reply.status(HTTP_STATUS.BAD_REQUEST).send({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Validation failed',
            details: formattedErrors,
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }
      throw error;
    }
  };
}

/**
 * Validate request query parameters
 */
export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const validated = schema.parse(request.query);
      (request as any).validatedQuery = validated;
      // Replace request.query with validated data
      request.query = validated as any;
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        return reply.status(HTTP_STATUS.BAD_REQUEST).send({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Query validation failed',
            details: formattedErrors,
          },
          timestamp: new Date().toISOString(),
        });
      }
      throw error;
    }
  };
}

/**
 * Validate request params
 */
export function validateParams<T>(schema: z.ZodSchema<T>) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const validated = schema.parse(request.params);
      (request as any).validatedParams = validated;
      // Replace request.params with validated data
      request.params = validated as any;
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        return reply.status(HTTP_STATUS.BAD_REQUEST).send({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Parameter validation failed',
            details: formattedErrors,
          },
          timestamp: new Date().toISOString(),
        });
      }
      throw error;
    }
  };
}

