/**
 * UNIT TESTS - ERROR CLASSES
 * Tests for custom error classes
 */

import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  ExternalServiceError,
  formatErrorResponse,
} from '../../../src/utils/errors';
import { HTTP_STATUS, ERROR_CODES } from '../../../src/config/constants';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create AppError with default values', () => {
      const error = new AppError('Test error');
      
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(error.errorCode).toBe(ERROR_CODES.SERVER_ERROR);
      expect(error.isOperational).toBe(true);
    });

    it('should create AppError with custom values', () => {
      const error = new AppError('Test error', HTTP_STATUS.BAD_REQUEST, 'CUSTOM_ERROR', false);
      
      expect(error.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(error.errorCode).toBe('CUSTOM_ERROR');
      expect(error.isOperational).toBe(false);
    });

    it('should include details', () => {
      const details = { field: 'email', reason: 'invalid format' };
      const error = new AppError('Test error', HTTP_STATUS.BAD_REQUEST, 'ERROR', true, details);
      
      expect(error.details).toEqual(details);
    });
  });

  describe('ValidationError', () => {
    it('should create ValidationError with correct defaults', () => {
      const error = new ValidationError('Validation failed');
      
      expect(error.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(error.errorCode).toBe(ERROR_CODES.VALIDATION_ERROR);
      expect(error.isOperational).toBe(true);
    });

    it('should include validation details', () => {
      const details = { errors: [{ field: 'email', message: 'Invalid email' }] };
      const error = new ValidationError('Validation failed', details);
      
      expect(error.details).toEqual(details);
    });
  });

  describe('AuthenticationError', () => {
    it('should create AuthenticationError with correct defaults', () => {
      const error = new AuthenticationError();
      
      expect(error.statusCode).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(error.errorCode).toBe(ERROR_CODES.UNAUTHORIZED);
      expect(error.message).toBe('Authentication required');
    });

    it('should accept custom message', () => {
      const error = new AuthenticationError('Custom auth error');
      
      expect(error.message).toBe('Custom auth error');
    });
  });

  describe('AuthorizationError', () => {
    it('should create AuthorizationError with correct defaults', () => {
      const error = new AuthorizationError();
      
      expect(error.statusCode).toBe(HTTP_STATUS.FORBIDDEN);
      expect(error.errorCode).toBe(ERROR_CODES.FORBIDDEN);
      expect(error.message).toBe('Access denied');
    });
  });

  describe('NotFoundError', () => {
    it('should create NotFoundError with default message', () => {
      const error = new NotFoundError();
      
      expect(error.statusCode).toBe(HTTP_STATUS.NOT_FOUND);
      expect(error.errorCode).toBe(ERROR_CODES.NOT_FOUND);
      expect(error.message).toBe('Resource not found');
    });

    it('should accept custom resource name', () => {
      const error = new NotFoundError('Student');
      
      expect(error.message).toBe('Student not found');
    });
  });

  describe('ConflictError', () => {
    it('should create ConflictError correctly', () => {
      const error = new ConflictError('Resource already exists');
      
      expect(error.statusCode).toBe(HTTP_STATUS.CONFLICT);
      expect(error.errorCode).toBe(ERROR_CODES.CONFLICT);
    });
  });

  describe('RateLimitError', () => {
    it('should create RateLimitError correctly', () => {
      const error = new RateLimitError();
      
      expect(error.statusCode).toBe(HTTP_STATUS.TOO_MANY_REQUESTS);
      expect(error.errorCode).toBe('RATE_LIMIT_EXCEEDED');
    });
  });

  describe('DatabaseError', () => {
    it('should create DatabaseError correctly', () => {
      const originalError = new Error('DB connection failed');
      const error = new DatabaseError('Database operation failed', originalError);
      
      expect(error.statusCode).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(error.errorCode).toBe(ERROR_CODES.DATABASE_ERROR);
      expect(error.isOperational).toBe(false);
      expect(error.details).toBe(originalError);
    });
  });

  describe('ExternalServiceError', () => {
    it('should create ExternalServiceError correctly', () => {
      const originalError = new Error('Service unavailable');
      const error = new ExternalServiceError('PaymentGateway', 'Payment failed', originalError);
      
      expect(error.statusCode).toBe(HTTP_STATUS.BAD_GATEWAY);
      expect(error.errorCode).toBe(ERROR_CODES.EXTERNAL_SERVICE_ERROR);
      expect(error.message).toContain('PaymentGateway');
    });
  });

  describe('formatErrorResponse', () => {
    it('should format AppError correctly', () => {
      const error = new ValidationError('Validation failed', { field: 'email' });
      const response = formatErrorResponse(error);
      
      expect(response.success).toBe(false);
      expect(response.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
      expect(response.error.message).toBe('Validation failed');
      expect(response.error.details).toEqual({ field: 'email' });
      expect(response.timestamp).toBeDefined();
    });

    it('should format database constraint errors', () => {
      const error = { code: '23505', detail: 'Duplicate key violation' };
      const response = formatErrorResponse(error);
      
      expect(response.success).toBe(false);
      expect(response.error.code).toBe(ERROR_CODES.CONFLICT);
      expect(response.error.message).toBe('Resource already exists');
    });

    it('should format foreign key constraint errors', () => {
      const error = { code: '23503', detail: 'Foreign key violation' };
      const response = formatErrorResponse(error);
      
      expect(response.success).toBe(false);
      expect(response.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
    });

    it('should format generic errors for production', () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('Internal error');
      const response = formatErrorResponse(error);
      
      expect(response.success).toBe(false);
      expect(response.error.message).toBe('An error occurred');
      expect(response.error.details).toBeUndefined();
    });

    it('should format generic errors for development', () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('Internal error');
      error.stack = 'Error stack trace';
      const response = formatErrorResponse(error);
      
      expect(response.success).toBe(false);
      expect(response.error.message).toBe('Internal error');
      expect(response.error.details).toBe('Error stack trace');
    });
  });
});

