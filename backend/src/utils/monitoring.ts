// ============================================
// MONITORING & METRICS
// Performance monitoring and health checks
// ============================================

import { logger } from './logger';

interface Metric {
  name: string;
  value: number;
  timestamp: Date;
  tags?: Record<string, string>;
}

class MonitoringService {
  private metrics: Metric[] = [];
  private readonly maxMetrics = 10000;

  /**
   * Record a metric
   */
  recordMetric(name: string, value: number, tags?: Record<string, string>) {
    const metric: Metric = {
      name,
      value,
      timestamp: new Date(),
      tags,
    };

    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    logger.debug('Metric recorded', { name, value, tags });
  }

  /**
   * Get metrics by name
   */
  getMetrics(name: string, since?: Date): Metric[] {
    let filtered = this.metrics.filter((m) => m.name === name);

    if (since) {
      filtered = filtered.filter((m) => m.timestamp >= since);
    }

    return filtered;
  }

  /**
   * Get average of metric
   */
  getAverage(name: string, since?: Date): number {
    const metrics = this.getMetrics(name, since);
    if (metrics.length === 0) return 0;

    const sum = metrics.reduce((acc, m) => acc + m.value, 0);
    return sum / metrics.length;
  }

  /**
   * Record API call
   */
  recordApiCall(
    service: string,
    endpoint: string,
    method: string,
    statusCode: number,
    responseTime: number
  ) {
    this.recordMetric('api_call', 1, {
      service,
      endpoint,
      method,
      status: statusCode.toString(),
    });

    this.recordMetric('api_response_time', responseTime, {
      service,
      endpoint,
      method,
    });

    if (statusCode >= 500) {
      this.recordMetric('api_error', 1, {
        service,
        endpoint,
        method,
        status: statusCode.toString(),
      });
    }
  }

  /**
   * Record database query
   */
  recordDbQuery(operation: string, duration: number, success: boolean) {
    this.recordMetric('db_query', 1, {
      operation,
      success: success.toString(),
    });

    this.recordMetric('db_query_duration', duration, { operation });

    if (!success) {
      this.recordMetric('db_error', 1, { operation });
    }
  }

  /**
   * Record cache operation
   */
  recordCacheOperation(operation: 'hit' | 'miss' | 'set', key: string) {
    this.recordMetric('cache_operation', 1, {
      operation,
      key_prefix: key.split(':')[0],
    });
  }

  /**
   * Get system health
   */
  getSystemHealth(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    metrics: {
      avgResponseTime: number;
      errorRate: number;
      requestsPerMinute: number;
      dbAvgDuration: number;
    };
  } {
    const oneMinuteAgo = new Date(Date.now() - 60000);
    const fiveMinutesAgo = new Date(Date.now() - 300000);

    // Calculate average response time (last 5 minutes)
    const avgResponseTime = this.getAverage('api_response_time', fiveMinutesAgo);

    // Calculate error rate (last 5 minutes)
    const totalRequests = this.getMetrics('api_call', fiveMinutesAgo).length;
    const totalErrors = this.getMetrics('api_error', fiveMinutesAgo).length;
    const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;

    // Calculate requests per minute (last minute)
    const requestsPerMinute = this.getMetrics('api_call', oneMinuteAgo).length;

    // Calculate average DB query duration
    const dbAvgDuration = this.getAverage('db_query_duration', fiveMinutesAgo);

    // Determine health status
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (avgResponseTime > 1000 || errorRate > 5 || dbAvgDuration > 100) {
      status = 'degraded';
    }
    if (avgResponseTime > 3000 || errorRate > 15 || dbAvgDuration > 500) {
      status = 'unhealthy';
    }

    return {
      status,
      metrics: {
        avgResponseTime: Math.round(avgResponseTime),
        errorRate: Math.round(errorRate * 100) / 100,
        requestsPerMinute,
        dbAvgDuration: Math.round(dbAvgDuration),
      },
    };
  }

  /**
   * Get detailed metrics report
   */
  getMetricsReport() {
    const fiveMinutesAgo = new Date(Date.now() - 300000);

    return {
      timestamp: new Date().toISOString(),
      period: '5m',
      api: {
        totalCalls: this.getMetrics('api_call', fiveMinutesAgo).length,
        totalErrors: this.getMetrics('api_error', fiveMinutesAgo).length,
        avgResponseTime: Math.round(this.getAverage('api_response_time', fiveMinutesAgo)),
      },
      database: {
        totalQueries: this.getMetrics('db_query', fiveMinutesAgo).length,
        totalErrors: this.getMetrics('db_error', fiveMinutesAgo).length,
        avgDuration: Math.round(this.getAverage('db_query_duration', fiveMinutesAgo)),
      },
      cache: {
        totalOperations: this.getMetrics('cache_operation', fiveMinutesAgo).length,
      },
    };
  }

  /**
   * Clear old metrics (called periodically)
   */
  clearOldMetrics(olderThan: Date) {
    const before = this.metrics.length;
    this.metrics = this.metrics.filter((m) => m.timestamp >= olderThan);
    const removed = before - this.metrics.length;
    logger.info(`Cleared ${removed} old metrics`);
  }
}

// Singleton instance
export const monitoring = new MonitoringService();

// Clear old metrics every hour
setInterval(
  () => {
    const oneHourAgo = new Date(Date.now() - 3600000);
    monitoring.clearOldMetrics(oneHourAgo);
  },
  3600000 // 1 hour
);

/**
 * Fastify plugin for automatic monitoring
 */
export function registerMonitoring(fastify: any) {
  // Monitor all requests
  fastify.addHook('onRequest', async (request: any) => {
    request.startTime = Date.now();
  });

  fastify.addHook('onResponse', async (request: any, reply: any) => {
    const responseTime = Date.now() - request.startTime;
    monitoring.recordApiCall(
      'api',
      request.url,
      request.method,
      reply.statusCode,
      responseTime
    );
  });

  // Health endpoint
  fastify.get('/health/metrics', async () => {
    return {
      success: true,
      data: {
        health: monitoring.getSystemHealth(),
        report: monitoring.getMetricsReport(),
      },
    };
  });
}

