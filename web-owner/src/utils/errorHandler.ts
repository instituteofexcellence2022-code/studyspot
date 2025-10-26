/**
 * Error Handler Utility
 * 
 * Provides unified error handling for API errors
 */

import { AxiosError } from 'axios';
import Logger from './logger';
import { ErrorResponse } from '../types/api';

// Error transformation mapping
const ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input.',
  401: 'Authentication failed. Please log in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'A conflict occurred. Please try again.',
  422: 'Validation failed. Please check your input.',
  429: 'Too many requests. Please try again later.',
  500: 'An unexpected error occurred. Please try again.',
  503: 'Service temporarily unavailable. Please try again later.',
};

/**
 * Transform error to user-friendly message
 */
export function transformError(error: unknown): string {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    
    // Use status-based message if available
    if (status && ERROR_MESSAGES[status]) {
      return ERROR_MESSAGES[status];
    }
    
    // Use API error message
    if (message && typeof message === 'string') {
      return message;
    }
    
    // Fallback to default
    return 'An error occurred. Please try again.';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred.';
}

/**
 * Handle API error
 */
export function handleApiError(error: unknown): ErrorResponse {
  const transformedMessage = transformError(error);
  const statusCode = error instanceof AxiosError ? error.response?.status : 500;
  
  // Log error
  Logger.error('API Error', error);
  
  // Return structured error
  return {
    success: false,
    error: transformedMessage,
    message: transformedMessage,
    code: error instanceof AxiosError ? error.response?.data?.code : 'UNKNOWN_ERROR',
    details: error instanceof AxiosError ? error.response?.data?.details : undefined,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Get error status code
 */
export function getErrorStatusCode(error: unknown): number {
  if (error instanceof AxiosError && error.response?.status) {
    return error.response.status;
  }
  return 500;
}

/**
 * Check if error is a specific status code
 */
export function isErrorStatus(error: unknown, status: number): boolean {
  return getErrorStatusCode(error) === status;
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  return error instanceof AxiosError && !error.response;
}

/**
 * Handle error with custom handler
 */
export function handleError<T>(
  error: unknown,
  handler?: (error: ErrorResponse) => T
): T | ErrorResponse {
  const errorResponse = handleApiError(error);
  
  if (handler) {
    return handler(errorResponse);
  }
  
  return errorResponse;
}

// Export utilities
export {
  transformError,
  handleApiError,
  getErrorStatusCode,
  isErrorStatus,
  isNetworkError,
  handleError,
};
