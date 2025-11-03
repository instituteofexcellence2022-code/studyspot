/**
 * Error Service
 * Centralized error handling with user-friendly messages
 */

export enum ErrorCode {
  // Network Errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  CONNECTION_REFUSED = 'CONNECTION_REFUSED',
  TIMEOUT = 'TIMEOUT',
  
  // Authentication Errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  ACCOUNT_SUSPENDED = 'ACCOUNT_SUSPENDED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  
  // Validation Errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_EMAIL = 'INVALID_EMAIL',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  PASSWORDS_DONT_MATCH = 'PASSWORDS_DONT_MATCH',
  REQUIRED_FIELD = 'REQUIRED_FIELD',
  
  // Server Errors
  SERVER_ERROR = 'SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  
  // Permission Errors
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // Unknown
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface AppError {
  code: ErrorCode;
  message: string;
  userMessage: string;
  field?: string;
  details?: any;
}

class ErrorService {
  /**
   * Parse axios error and return user-friendly AppError
   */
  parseError(error: any): AppError {
    // Network errors
    if (error.code === 'ERR_NETWORK') {
      return {
        code: ErrorCode.NETWORK_ERROR,
        message: 'Network error',
        userMessage: '❌ Cannot connect to server. Please check your internet connection and ensure the API is running.',
      };
    }

    if (error.code === 'ECONNREFUSED') {
      return {
        code: ErrorCode.CONNECTION_REFUSED,
        message: 'Connection refused',
        userMessage: '❌ Server is not running. Please contact support.',
      };
    }

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return {
        code: ErrorCode.TIMEOUT,
        message: 'Request timeout',
        userMessage: '❌ Request timed out. Please try again.',
      };
    }

    // HTTP Response errors
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      // Use backend error code if available
      if (data?.error?.code) {
        return {
          code: data.error.code as ErrorCode,
          message: data.error.message || data.message,
          userMessage: this.getUserMessage(data.error.code, data.error.message),
          field: data.error.field,
          details: data.error.details,
        };
      }

      // Map HTTP status to error
      switch (status) {
        case 400:
          return {
            code: ErrorCode.VALIDATION_ERROR,
            message: data?.message || 'Validation error',
            userMessage: `❌ ${data?.message || 'Invalid request. Please check your input.'}`,
            details: data?.errors,
          };

        case 401:
          return {
            code: ErrorCode.INVALID_CREDENTIALS,
            message: 'Unauthorized',
            userMessage: '❌ Invalid email or password. Please try again.',
          };

        case 403:
          return {
            code: ErrorCode.FORBIDDEN,
            message: 'Forbidden',
            userMessage: '❌ You do not have permission to perform this action.',
          };

        case 404:
          return {
            code: ErrorCode.NOT_FOUND,
            message: 'Not found',
            userMessage: '❌ The requested resource was not found.',
          };

        case 409:
          return {
            code: ErrorCode.CONFLICT,
            message: data?.message || 'Conflict',
            userMessage: `❌ ${data?.message || 'This resource already exists.'}`,
          };

        case 500:
        case 502:
        case 503:
          return {
            code: ErrorCode.SERVER_ERROR,
            message: 'Server error',
            userMessage: '❌ Server error. Please try again later or contact support.',
          };

        default:
          return {
            code: ErrorCode.UNKNOWN_ERROR,
            message: data?.message || 'Unknown error',
            userMessage: `❌ ${data?.message || 'An unexpected error occurred. Please try again.'}`,
          };
      }
    }

    // Fallback for unknown errors
    return {
      code: ErrorCode.UNKNOWN_ERROR,
      message: error.message || 'Unknown error',
      userMessage: `❌ ${error.message || 'An unexpected error occurred. Please try again.'}`,
    };
  }

  /**
   * Get user-friendly message for error code
   */
  private getUserMessage(code: ErrorCode, defaultMessage?: string): string {
    const messages: Record<ErrorCode, string> = {
      // Network
      [ErrorCode.NETWORK_ERROR]: '❌ Cannot connect to server. Please check your connection.',
      [ErrorCode.CONNECTION_REFUSED]: '❌ Server is not available. Please try again later.',
      [ErrorCode.TIMEOUT]: '❌ Request timed out. Please try again.',
      
      // Authentication
      [ErrorCode.INVALID_CREDENTIALS]: '❌ Invalid email or password.',
      [ErrorCode.USER_NOT_FOUND]: '❌ User not found. Please check your email.',
      [ErrorCode.ACCOUNT_SUSPENDED]: '❌ Your account has been suspended. Contact support.',
      [ErrorCode.TOKEN_EXPIRED]: '❌ Your session has expired. Please login again.',
      [ErrorCode.UNAUTHORIZED]: '❌ You must be logged in to continue.',
      
      // Validation
      [ErrorCode.VALIDATION_ERROR]: '❌ Please check your input and try again.',
      [ErrorCode.INVALID_EMAIL]: '❌ Please enter a valid email address.',
      [ErrorCode.WEAK_PASSWORD]: '❌ Password must be at least 8 characters with uppercase, lowercase, and numbers.',
      [ErrorCode.PASSWORDS_DONT_MATCH]: '❌ Passwords do not match.',
      [ErrorCode.REQUIRED_FIELD]: '❌ This field is required.',
      
      // Server
      [ErrorCode.SERVER_ERROR]: '❌ Server error. Please try again later.',
      [ErrorCode.DATABASE_ERROR]: '❌ Database error. Please contact support.',
      [ErrorCode.NOT_FOUND]: '❌ Resource not found.',
      [ErrorCode.CONFLICT]: '❌ This resource already exists.',
      
      // Permission
      [ErrorCode.FORBIDDEN]: '❌ You do not have permission to perform this action.',
      [ErrorCode.INSUFFICIENT_PERMISSIONS]: '❌ Insufficient permissions.',
      
      // Unknown
      [ErrorCode.UNKNOWN_ERROR]: '❌ An unexpected error occurred.',
    };

    return messages[code] || defaultMessage || messages[ErrorCode.UNKNOWN_ERROR];
  }

  /**
   * Log error to console (in development) and to logging service (in production)
   */
  logError(error: AppError, context?: string) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[ErrorService${context ? ` - ${context}` : ''}]`, {
        code: error.code,
        message: error.message,
        userMessage: error.userMessage,
        field: error.field,
        details: error.details,
      });
    }
    
    // In production, send to error tracking service (e.g., Sentry)
    // if (process.env.NODE_ENV === 'production') {
    //   Sentry.captureException(error);
    // }
  }
}

export const errorService = new ErrorService();
export default errorService;

