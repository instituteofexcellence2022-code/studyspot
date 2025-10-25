/**
 * Frontend Logger Utility
 * Centralized logging with levels and formatting
 */

import ENV from '../config/environment';

enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

class Logger {
  private static isDevelopment = ENV.NODE_ENV === 'development';
  private static isDebugEnabled = ENV.DEBUG;

  /**
   * Format log message with timestamp and context
   */
  private static formatMessage(level: LogLevel, message: string, context?: string): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` [${context}]` : '';
    return `[${timestamp}] ${level}${contextStr}: ${message}`;
  }

  /**
   * Get color for log level
   */
  private static getColor(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return 'color: gray';
      case LogLevel.INFO:
        return 'color: blue';
      case LogLevel.WARN:
        return 'color: orange';
      case LogLevel.ERROR:
        return 'color: red; font-weight: bold';
      default:
        return '';
    }
  }

  /**
   * Debug log (only in development with DEBUG=true)
   */
  static debug(message: string, data?: unknown, context?: string): void {
    if (!this.isDevelopment || !this.isDebugEnabled) return;

    const formatted = this.formatMessage(LogLevel.DEBUG, message, context);
    console.log(`%c${formatted}`, this.getColor(LogLevel.DEBUG), data || '');
  }

  /**
   * Info log (only in development)
   */
  static info(message: string, data?: unknown, context?: string): void {
    if (!this.isDevelopment) return;

    const formatted = this.formatMessage(LogLevel.INFO, message, context);
    console.log(`%c${formatted}`, this.getColor(LogLevel.INFO), data || '');
  }

  /**
   * Warning log
   */
  static warn(message: string, data?: unknown, context?: string): void {
    const formatted = this.formatMessage(LogLevel.WARN, message, context);
    console.warn(`%c${formatted}`, this.getColor(LogLevel.WARN), data || '');

    // In production, send to logging service
    if (!this.isDevelopment) {
      this.sendToLoggingService('warn', message, data, context);
    }
  }

  /**
   * Error log
   */
  static error(message: string, error?: unknown, context?: string): void {
    const formatted = this.formatMessage(LogLevel.ERROR, message, context);
    console.error(`%c${formatted}`, this.getColor(LogLevel.ERROR));
    
    if (error) {
      console.error('Error details:', error);
      if (error instanceof Error && error.stack) {
        console.error('Stack trace:', error.stack);
      }
    }

    // In production, send to error tracking service (e.g., Sentry)
    if (!this.isDevelopment) {
      this.sendToLoggingService('error', message, error, context);
    }
  }

  /**
   * Log user action
   */
  static userAction(action: string, details?: unknown): void {
    this.info(`User Action: ${action}`, details, 'UserAction');

    // In production, send to analytics
    if (!this.isDevelopment) {
      this.sendToAnalytics('user_action', action, details);
    }
  }

  /**
   * Log API call
   */
  static apiCall(method: string, endpoint: string, status?: number, duration?: number): void {
    const message = `${method} ${endpoint}${status ? ` - ${status}` : ''}${duration ? ` (${duration}ms)` : ''}`;
    this.debug(message, null, 'API');
  }

  /**
   * Log navigation
   */
  static navigation(from: string, to: string): void {
    this.debug(`Navigation: ${from} → ${to}`, null, 'Router');
  }

  /**
   * Log state change
   */
  static stateChange(store: string, action: string, data?: unknown): void {
    this.debug(`${store} - ${action}`, data, 'Redux');
  }

  /**
   * Send to logging service (placeholder for production)
   */
  private static sendToLoggingService(
    level: string,
    message: string,
    data?: unknown,
    context?: string
  ): void {
    // In production: integrate with logging service
    // Example: LogRocket, Sentry, DataDog, etc.
    
    // For now, just prepare the payload
    const payload = {
      level,
      message,
      data,
      context,
      timestamp: new Date().toISOString(),
      portal: ENV.PORTAL_TYPE,
      environment: ENV.NODE_ENV,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // TODO: Send to actual logging service
    // fetch('/api/logs', { method: 'POST', body: JSON.stringify(payload) });
  }

  /**
   * Send to analytics service (placeholder for production)
   */
  private static sendToAnalytics(event: string, action: string, details?: unknown): void {
    // In production: integrate with analytics
    // Example: Google Analytics, Mixpanel, Amplitude, etc.
    
    // For now, just prepare the payload
    const payload = {
      event,
      action,
      details,
      timestamp: new Date().toISOString(),
      portal: ENV.PORTAL_TYPE,
    };

    // TODO: Send to actual analytics service
    // gtag('event', event, { ...payload });
  }

  /**
   * Create group for related logs
   */
  static group(label: string, callback: () => void): void {
    if (!this.isDevelopment) return;

    console.group(`%c${label}`, 'font-weight: bold; font-size: 14px;');
    callback();
    console.groupEnd();
  }

  /**
   * Log performance metrics
   */
  static performance(metric: string, value: number, unit: string = 'ms'): void {
    const color = value < 100 ? 'green' : value < 500 ? 'orange' : 'red';
    console.log(
      `%c⚡ ${metric}: ${value.toFixed(2)}${unit}`,
      `color: ${color}; font-weight: bold;`
    );
  }
}

export default Logger;
