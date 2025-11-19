// ============================================
// INPUT VALIDATION MIDDLEWARE
// Professional request validation
// ============================================

import { FastifyRequest, FastifyReply } from 'fastify';
import { z, ZodError } from 'zod';
import { ValidationError } from '../utils/errors';

/**
 * Validate request body
 */
export function validateBody<T>(schema: z.ZodSchema<T>) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const validated = schema.parse(request.body);
      (request as any).validatedBody = validated;
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError('Validation failed', {
          errors: error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      throw error;
    }
  };
}

/**
 * Validate request query parameters
 */
export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const validated = schema.parse(request.query);
      (request as any).validatedQuery = validated;
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError('Query validation failed', {
          errors: error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
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
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const validated = schema.parse(request.params);
      (request as any).validatedParams = validated;
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError('Parameter validation failed', {
          errors: error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      throw error;
    }
  };
}

