/**
 * Logger Utility
 * Safe logging that respects environment settings
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  data?: unknown;
  timestamp: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isDebugEnabled = process.env.REACT_APP_DEBUG === 'true';

  private log(level: LogLevel, message: string, context?: string, data?: unknown): void {
    if (!this.isDevelopment && level === 'debug') {
      return; // Skip debug logs in production
    }

    const entry: LogEntry = {
      level,
      message,
      context,
      data,
      timestamp: new Date().toISOString(),
    };

    if (this.isDevelopment) {
      const logMethod = level === 'error' ? console.error : 
                       level === 'warn' ? console.warn : 
                       level === 'info' ? console.info : console.log;
      
      const prefix = context ? `[${context}]` : '';
      logMethod(`${prefix} ${message}`, data || '');
    }

    // In production, you might want to send to a logging service
    // Example: this.sendToLoggingService(entry);
  }

  debug(message: string, context?: string, data?: unknown): void {
    if (this.isDebugEnabled) {
      this.log('debug', message, context, data);
    }
  }

  info(message: string, context?: string, data?: unknown): void {
    this.log('info', message, context, data);
  }

  warn(message: string, context?: string, data?: unknown): void {
    this.log('warn', message, context, data);
  }

  error(message: string, context?: string, data?: unknown): void {
    this.log('error', message, context, data);
  }

  // Auth-specific logging helpers
  auth = {
    loginAttempt: (email: string) => this.debug('Login attempt', 'AUTH', { email: email.replace(/(.{2}).*(@.*)/, '$1***$2') }),
    loginSuccess: (userId: string) => this.info('Login successful', 'AUTH', { userId }),
    loginFailure: (error: unknown) => this.error('Login failed', 'AUTH', error),
    logout: (userId: string) => this.info('User logged out', 'AUTH', { userId }),
    tokenRefresh: (success: boolean) => this.debug('Token refresh', 'AUTH', { success }),
  };

  // API-specific logging helpers
  api = {
    request: (method: string, url: string) => this.debug('API request', 'API', { method, url }),
    response: (method: string, url: string, status: number) => this.debug('API response', 'API', { method, url, status }),
    error: (method: string, url: string, error: unknown) => this.error('API error', 'API', { method, url, error }),
  };
}

export const logger = new Logger();
export default logger;