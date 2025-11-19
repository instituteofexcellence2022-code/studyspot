// ============================================
// CUSTOM ERROR CLASSES
// Professional error handling
// ============================================

import { HTTP_STATUS, ERROR_CODES } from '../config/constants';

/**
 * Base application error
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    errorCode: string = ERROR_CODES.SERVER_ERROR,
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(
      message,
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.VALIDATION_ERROR,
      true,
      details
    );
  }
}

/**
 * Authentication error
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(
      message,
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.UNAUTHORIZED,
      true
    );
  }
}

/**
 * Authorization error
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(
      message,
      HTTP_STATUS.FORBIDDEN,
      ERROR_CODES.FORBIDDEN,
      true
    );
  }
}

/**
 * Not found error
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(
      `${resource} not found`,
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODES.NOT_FOUND,
      true
    );
  }
}

/**
 * Conflict error
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(
      message,
      HTTP_STATUS.CONFLICT,
      ERROR_CODES.CONFLICT,
      true
    );
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(
      message,
      HTTP_STATUS.TOO_MANY_REQUESTS,
      'RATE_LIMIT_EXCEEDED',
      true
    );
  }
}

/**
 * Database error
 */
export class DatabaseError extends AppError {
  constructor(message: string, originalError?: any) {
    super(
      message,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_CODES.DATABASE_ERROR,
      false,
      originalError
    );
  }
}

/**
 * External service error
 */
export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, originalError?: any) {
    super(
      `${service} error: ${message}`,
      HTTP_STATUS.BAD_GATEWAY,
      ERROR_CODES.EXTERNAL_SERVICE_ERROR,
      false,
      originalError
    );
  }
}

/**
 * Error response formatter
 */
export function formatErrorResponse(error: any) {
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        code: error.errorCode,
        message: error.message,
        details: error.details,
      },
      timestamp: new Date().toISOString(),
    };
  }

  // Handle known database errors
  if (error.code === '23505') {
    return {
      success: false,
      error: {
        code: ERROR_CODES.CONFLICT,
        message: 'Resource already exists',
        details: error.detail,
      },
      timestamp: new Date().toISOString(),
    };
  }

  if (error.code === '23503') {
    return {
      success: false,
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Foreign key constraint violation',
        details: error.detail,
      },
      timestamp: new Date().toISOString(),
    };
  }

  // Generic error
  return {
    success: false,
    error: {
      code: ERROR_CODES.SERVER_ERROR,
      message: process.env.NODE_ENV === 'production' 
        ? 'An error occurred' 
        : error.message,
      details: process.env.NODE_ENV === 'production' ? undefined : error.stack,
    },
    timestamp: new Date().toISOString(),
  };
}

