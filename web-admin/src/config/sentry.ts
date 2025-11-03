/**
 * Sentry Error Tracking Configuration
 * 
 * Environment Variables Required:
 * REACT_APP_SENTRY_DSN - Sentry DSN for error tracking
 * REACT_APP_SENTRY_ENVIRONMENT - Environment name (development, staging, production)
 */

import * as Sentry from '@sentry/react';

const SENTRY_DSN = process.env.REACT_APP_SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.REACT_APP_SENTRY_ENVIRONMENT || process.env.NODE_ENV;

/**
 * Initialize Sentry error tracking
 */
export const initSentry = () => {
  // Only initialize Sentry if DSN is provided
  if (!SENTRY_DSN) {
    console.log('📊 Sentry not initialized - DSN not configured');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,
    
    // Performance monitoring integration
    integrations: [
      Sentry.browserTracingIntegration(),
    ],
    
    // Performance sampling
    tracesSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0, // 10% of transactions in production
    
    // Release tracking
    release: process.env.REACT_APP_VERSION || 'unknown',
    
    // Session replay
    replaysSessionSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 0.5,
    replaysOnErrorSampleRate: 1.0,
    
    // Filter out certain errors
    beforeSend(event, hint) {
      // Filter out network errors in development
      if (SENTRY_ENVIRONMENT === 'development') {
        if (event.exception) {
          const error = hint.originalException;
          if (error instanceof Error && error.message.includes('Network Error')) {
            return null; // Don't send network errors in development
          }
        }
      }
      
      return event;
    },
    
    // Additional options
    beforeBreadcrumb(breadcrumb) {
      // Filter out sensitive data
      if (breadcrumb.category === 'xhr' && breadcrumb.data) {
        // Remove sensitive headers
        if (breadcrumb.data.headers) {
          delete breadcrumb.data.headers['Authorization'];
          delete breadcrumb.data.headers['Cookie'];
        }
      }
      
      return breadcrumb;
    },
  });

  console.log('✅ Sentry initialized for', SENTRY_ENVIRONMENT);
};

/**
 * Report an error to Sentry
 * @param error - Error object
 * @param context - Additional context data
 */
export const captureError = (error: Error, context?: Record<string, any>) => {
  if (context) {
    Sentry.setContext('error-context', context);
  }
  
  Sentry.captureException(error);
};

/**
 * Log a message to Sentry
 * @param message - Message to log
 * @param level - Log level
 */
export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
  Sentry.captureMessage(message, level);
};

/**
 * Set user context for Sentry
 * @param user - User object
 */
export const setUserContext = (user: { id: string; email: string; role?: string }) => {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.email,
    role: user.role,
  });
};

/**
 * Clear user context
 */
export const clearUserContext = () => {
  Sentry.setUser(null);
};

/**
 * Add breadcrumb for debugging
 * @param message - Breadcrumb message
 * @param category - Breadcrumb category
 * @param data - Additional data
 */
export const addBreadcrumb = (message: string, category?: string, data?: Record<string, any>) => {
  Sentry.addBreadcrumb({
    message,
    category: category || 'custom',
    data,
    level: 'info',
  });
};

export default Sentry;

