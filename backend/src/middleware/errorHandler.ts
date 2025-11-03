// ============================================
// GLOBAL ERROR HANDLER
// Centralized error handling
// ============================================

import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../utils/logger';
import { ERROR_CODES, HTTP_STATUS } from '../config/constants';

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  statusCode: number;
  code: number;
  details?: any;

  constructor(message: string, statusCode: number = 500, code: number = ERROR_CODES.SERVER_ERROR, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

/**
 * Global error handler for Fastify
 */
export const errorHandler = (
  error: FastifyError | ApiError,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  // Log error
  logger.error('Request error', {
    error: error.message,
    stack: error.stack,
    url: request.url,
    method: request.method,
    ip: request.ip,
  });

  // Handle custom API errors
  if (error instanceof ApiError) {
    return reply.status(error.statusCode).send({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Handle Fastify validation errors
  if (error.validation) {
    return reply.status(HTTP_STATUS.BAD_REQUEST).send({
      success: false,
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Validation failed',
        details: error.validation,
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Handle database errors
  if (error.message.includes('duplicate key')) {
    return reply.status(HTTP_STATUS.CONFLICT).send({
      success: false,
      error: {
        code: ERROR_CODES.DUPLICATE_ENTRY,
        message: 'Resource already exists',
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Handle generic errors
  const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;

  return reply.status(statusCode).send({
    success: false,
    error: {
      code: ERROR_CODES.SERVER_ERROR,
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : error.message,
    },
    timestamp: new Date().toISOString(),
  });
};

/**
 * Not found handler
 */
export const notFoundHandler = (request: FastifyRequest, reply: FastifyReply) => {
  return reply.status(HTTP_STATUS.NOT_FOUND).send({
    success: false,
    error: {
      code: ERROR_CODES.RESOURCE_NOT_FOUND,
      message: `Route ${request.method} ${request.url} not found`,
    },
    timestamp: new Date().toISOString(),
  });
};

