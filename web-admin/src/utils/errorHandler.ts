/**
 * Centralized Error Handling Utility
 * Provides consistent error handling across the application
 */

interface AxiosError {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
    status?: number;
    statusText?: string;
  };
  request?: unknown;
  message?: string;
}

interface NormalizedError {
  code: string;
  message: string;
  retriable: boolean;
  statusCode?: number;
}

/**
 * Normalizes Axios errors into a consistent format
 */
export const handleAxiosError = (error: unknown): NormalizedError => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError;
    const statusCode = axiosError.response?.status;
    const serverMessage = axiosError.response?.data?.message || axiosError.response?.data?.error;
    
    // Map common HTTP status codes to user-friendly messages
    const statusMessages: Record<number, string> = {
      400: 'Invalid request. Please check your input.',
      401: 'Invalid credentials. Please try again.',
      403: 'Access denied. You do not have permission.',
      404: 'Service not found. Please try again later.',
      429: 'Too many attempts. Please wait a moment before trying again.',
      500: 'Server error. Please try again later.',
      502: 'Service temporarily unavailable. Please try again later.',
      503: 'Service temporarily unavailable. Please try again later.',
    };

    const message = serverMessage || statusMessages[statusCode || 0] || 'An unexpected error occurred';
    
    return {
      code: `HTTP_${statusCode || 'UNKNOWN'}`,
      message,
      retriable: statusCode ? statusCode >= 500 : false,
      statusCode,
    };
  } 
  
  if (error && typeof error === 'object' && 'request' in error) {
    return {
      code: 'NETWORK_ERROR',
      message: 'Cannot connect to server. Please check your connection.',
      retriable: true,
    };
  }
  
  if (error instanceof Error) {
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unexpected error occurred',
      retriable: false,
    };
  }
  
  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
    retriable: false,
  };
};

/**
 * Logs errors safely (only in development)
 */
export const logError = (context: string, error: unknown, additionalInfo?: Record<string, unknown>): void => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}]`, error, additionalInfo);
  }
  // In production, you might want to send to a logging service
  // Example: loggerService.error(context, error, additionalInfo);
};

/**
 * Determines if an error should trigger a retry
 */
export const shouldRetry = (error: NormalizedError, attemptCount: number, maxRetries: number = 3): boolean => {
  return error.retriable && attemptCount < maxRetries;
};

/**
 * Gets retry delay with exponential backoff
 */
export const getRetryDelay = (attemptCount: number, baseDelay: number = 1000): number => {
  return Math.min(baseDelay * Math.pow(2, attemptCount), 10000); // Max 10 seconds
};



