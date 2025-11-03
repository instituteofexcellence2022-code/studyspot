/**
 * Monitoring and Logging System
 * Real-time monitoring, performance tracking, and error reporting
 */

import { User } from '../types';

// Performance metrics interface
export interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
  memoryUsage?: number;
  bundleSize?: number;
}

// Error tracking interface
export interface ErrorInfo {
  message: string;
  stack?: string;
  componentStack?: string;
  errorBoundary?: string;
  userId?: string;
  tenantId?: string;
  url: string;
  userAgent: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'javascript' | 'network' | 'performance' | 'security' | 'business';
}

// User activity tracking
export interface UserActivity {
  userId: string;
  tenantId: string;
  action: string;
  resource: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

// System health metrics
export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    [serviceName: string]: {
      status: 'up' | 'down' | 'degraded';
      responseTime: number;
      lastCheck: number;
    };
  };
  database: {
    status: 'up' | 'down';
    responseTime: number;
    connections: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
    load: number;
  };
}

class MonitoringService {
  private metrics: PerformanceMetrics[] = [];
  private errors: ErrorInfo[] = [];
  private activities: UserActivity[] = [];
  private isEnabled: boolean;
  private apiEndpoint: string;

  constructor() {
    this.isEnabled = process.env.NODE_ENV === 'production' || 
                    process.env.REACT_APP_ENABLE_MONITORING === 'true';
    this.apiEndpoint = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';
    
    this.initializeMonitoring();
  }

  private initializeMonitoring() {
    if (!this.isEnabled) return;

    // Initialize performance monitoring
    this.initializePerformanceMonitoring();
    
    // Initialize error tracking
    this.initializeErrorTracking();
    
    // Initialize user activity tracking
    this.initializeActivityTracking();
    
    // Initialize system health monitoring
    this.initializeSystemHealthMonitoring();
  }

  private initializePerformanceMonitoring() {
    // Web Vitals monitoring
    if ('web-vitals' in window) {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(this.handlePerformanceMetric.bind(this));
        getFID(this.handlePerformanceMetric.bind(this));
        getFCP(this.handlePerformanceMetric.bind(this));
        getLCP(this.handlePerformanceMetric.bind(this));
        getTTFB(this.handlePerformanceMetric.bind(this));
      });
    }

    // Memory usage monitoring
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.trackPerformanceMetric({
          memoryUsage: memory.usedJSHeapSize,
        });
      }, 30000); // Every 30 seconds
    }

    // Page load time monitoring
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      this.trackPerformanceMetric({
        pageLoadTime: loadTime,
        timeToInteractive: loadTime,
      });
    });
  }

  private initializeErrorTracking() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.trackError({
        message: event.message,
        stack: event.error?.stack,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        severity: 'high',
        category: 'javascript',
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        severity: 'high',
        category: 'javascript',
      });
    });
  }

  private initializeActivityTracking() {
    // Track page views
    this.trackActivity('page_view', window.location.pathname);
    
    // Track user interactions
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.dataset.track) {
        this.trackActivity('click', target.dataset.track);
      }
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      if (form.dataset.track) {
        this.trackActivity('form_submit', form.dataset.track);
      }
    });
  }

  private initializeSystemHealthMonitoring() {
    // Check system health every 5 minutes
    setInterval(() => {
      this.checkSystemHealth();
    }, 300000);
  }

  private handlePerformanceMetric(metric: any) {
    this.trackPerformanceMetric({
      [metric.name]: metric.value,
    });
  }

  public trackPerformanceMetric(metric: Partial<PerformanceMetrics>) {
    if (!this.isEnabled) return;

    const fullMetric: PerformanceMetrics = {
      pageLoadTime: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      firstInputDelay: 0,
      cumulativeLayoutShift: 0,
      timeToInteractive: 0,
      ...metric,
    };

    this.metrics.push(fullMetric);
    this.sendMetricsToServer();
  }

  public trackError(error: Omit<ErrorInfo, 'timestamp' | 'url' | 'userAgent'>) {
    if (!this.isEnabled) return;

    const fullError: ErrorInfo = {
      ...error,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
    };

    this.errors.push(fullError);
    this.sendErrorsToServer();
  }

  public trackActivity(action: string, resource: string, metadata?: Record<string, any>) {
    if (!this.isEnabled) return;

    const activity: UserActivity = {
      userId: this.getCurrentUserId(),
      tenantId: this.getCurrentTenantId(),
      action,
      resource,
      timestamp: Date.now(),
      metadata,
    };

    this.activities.push(activity);
    this.sendActivitiesToServer();
  }

  public trackBusinessEvent(eventName: string, properties: Record<string, any> = {}) {
    this.trackActivity('business_event', eventName, properties);
  }

  public trackSecurityEvent(eventName: string, properties: Record<string, any> = {}) {
    this.trackError({
      message: `Security Event: ${eventName}`,
      severity: 'high',
      category: 'security',
    });
    
    this.trackActivity('security_event', eventName, properties);
  }

  private async sendMetricsToServer() {
    if (this.metrics.length === 0) return;

    try {
      await fetch(`${this.apiEndpoint}/api/monitoring/performance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify({
          metrics: this.metrics,
          userId: this.getCurrentUserId(),
          tenantId: this.getCurrentTenantId(),
        }),
      });

      this.metrics = [];
    } catch (error) {
      console.error('Failed to send performance metrics:', error);
    }
  }

  private async sendErrorsToServer() {
    if (this.errors.length === 0) return;

    try {
      await fetch(`${this.apiEndpoint}/api/monitoring/errors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify({
          errors: this.errors,
          userId: this.getCurrentUserId(),
          tenantId: this.getCurrentTenantId(),
        }),
      });

      this.errors = [];
    } catch (error) {
      console.error('Failed to send error reports:', error);
    }
  }

  private async sendActivitiesToServer() {
    if (this.activities.length === 0) return;

    try {
      await fetch(`${this.apiEndpoint}/api/monitoring/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify({
          activities: this.activities,
        }),
      });

      this.activities = [];
    } catch (error) {
      console.error('Failed to send user activities:', error);
    }
  }

  private async checkSystemHealth(): Promise<SystemHealth> {
    try {
      const response = await fetch(`${this.apiEndpoint}/api/monitoring/health`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      });

      const health: SystemHealth = await response.json();
      
      // Track system health
      this.trackActivity('system_health_check', 'monitoring', {
        status: health.status,
        services: Object.keys(health.services).length,
      });

      return health;
    } catch (error) {
      console.error('Failed to check system health:', error);
      return {
        status: 'unhealthy',
        services: {},
        database: { status: 'down', responseTime: 0, connections: 0 },
        memory: { used: 0, total: 0, percentage: 0 },
        cpu: { usage: 0, load: 0 },
      };
    }
  }

  public async getSystemHealth(): Promise<SystemHealth> {
    return this.checkSystemHealth();
  }

  private getCurrentUserId(): string {
    const userData = localStorage.getItem('studyspot_user_data');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.id || 'anonymous';
      } catch {
        return 'anonymous';
      }
    }
    return 'anonymous';
  }

  private getCurrentTenantId(): string {
    const userData = localStorage.getItem('studyspot_user_data');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.tenantId || 'unknown';
      } catch {
        return 'unknown';
      }
    }
    return 'unknown';
  }

  private getAuthToken(): string {
    return localStorage.getItem('studyspot_auth_token') || '';
  }

  public getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  public getErrors(): ErrorInfo[] {
    return [...this.errors];
  }

  public getActivities(): UserActivity[] {
    return [...this.activities];
  }

  public clearData() {
    this.metrics = [];
    this.errors = [];
    this.activities = [];
  }
}

// Create singleton instance
export const monitoringService = new MonitoringService();

// Export convenience functions
export const trackPerformance = (metric: Partial<PerformanceMetrics>) => {
  monitoringService.trackPerformanceMetric(metric);
};

export const trackError = (error: Omit<ErrorInfo, 'timestamp' | 'url' | 'userAgent'>) => {
  monitoringService.trackError(error);
};

export const trackActivity = (action: string, resource: string, metadata?: Record<string, any>) => {
  monitoringService.trackActivity(action, resource, metadata);
};

export const trackBusinessEvent = (eventName: string, properties: Record<string, any> = {}) => {
  monitoringService.trackBusinessEvent(eventName, properties);
};

export const trackSecurityEvent = (eventName: string, properties: Record<string, any> = {}) => {
  monitoringService.trackSecurityEvent(eventName, properties);
};

export default monitoringService;
