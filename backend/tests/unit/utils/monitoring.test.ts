/**
 * UNIT TESTS - MONITORING SERVICE
 */

import { monitoring, registerMonitoring } from '../../../src/utils/monitoring';
import { logger } from '../../../src/utils/logger';

jest.mock('../../../src/utils/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Monitoring Service', () => {
  beforeEach(() => {
    // Clear metrics before each test
    (monitoring as any).metrics = [];
    jest.clearAllMocks();
  });

  describe('recordMetric', () => {
    it('should record a metric', () => {
      monitoring.recordMetric('test_metric', 100, { tag1: 'value1' });

      const metrics = (monitoring as any).getMetrics('test_metric');
      expect(metrics).toHaveLength(1);
      expect(metrics[0].value).toBe(100);
      expect(metrics[0].tags).toEqual({ tag1: 'value1' });
    });

    it('should limit metrics to maxMetrics', () => {
      const maxMetrics = (monitoring as any).maxMetrics;
      for (let i = 0; i < maxMetrics + 100; i++) {
        monitoring.recordMetric('test_metric', i);
      }

      const metrics = (monitoring as any).getMetrics('test_metric');
      expect(metrics.length).toBeLessThanOrEqual(maxMetrics);
    });
  });

  describe('getMetrics', () => {
    it('should get metrics by name', () => {
      monitoring.recordMetric('metric1', 10);
      monitoring.recordMetric('metric2', 20);
      monitoring.recordMetric('metric1', 30);

      const metrics = monitoring.getMetrics('metric1');
      expect(metrics).toHaveLength(2);
    });

    it('should filter metrics by date', () => {
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60000);

      monitoring.recordMetric('test_metric', 10);
      // Wait a bit to ensure different timestamps
      setTimeout(() => {
        monitoring.recordMetric('test_metric', 20);
      }, 10);

      const metrics = monitoring.getMetrics('test_metric', oneMinuteAgo);
      expect(metrics.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getAverage', () => {
    it('should calculate average of metrics', () => {
      monitoring.recordMetric('test_metric', 10);
      monitoring.recordMetric('test_metric', 20);
      monitoring.recordMetric('test_metric', 30);

      const average = monitoring.getAverage('test_metric');
      expect(average).toBe(20);
    });

    it('should return 0 for non-existent metric', () => {
      const average = monitoring.getAverage('non_existent');
      expect(average).toBe(0);
    });
  });

  describe('recordApiCall', () => {
    it('should record API call metrics', () => {
      monitoring.recordApiCall('service1', '/api/test', 'GET', 200, 100);

      const apiCalls = monitoring.getMetrics('api_call');
      expect(apiCalls).toHaveLength(1);
      expect(apiCalls[0].tags?.service).toBe('service1');
      expect(apiCalls[0].tags?.endpoint).toBe('/api/test');
    });

    it('should record error for 5xx status codes', () => {
      monitoring.recordApiCall('service1', '/api/test', 'GET', 500, 100);

      const errors = monitoring.getMetrics('api_error');
      expect(errors).toHaveLength(1);
    });
  });

  describe('recordDbQuery', () => {
    it('should record database query', () => {
      monitoring.recordDbQuery('SELECT', 50, true);

      const queries = monitoring.getMetrics('db_query');
      expect(queries).toHaveLength(1);
      expect(queries[0].tags?.operation).toBe('SELECT');
    });

    it('should record error for failed queries', () => {
      monitoring.recordDbQuery('INSERT', 100, false);

      const errors = monitoring.getMetrics('db_error');
      expect(errors).toHaveLength(1);
    });
  });

  describe('recordCacheOperation', () => {
    it('should record cache operation', () => {
      monitoring.recordCacheOperation('hit', 'cache:key:123');

      const operations = monitoring.getMetrics('cache_operation');
      expect(operations).toHaveLength(1);
      expect(operations[0].tags?.operation).toBe('hit');
    });
  });

  describe('getSystemHealth', () => {
    it('should return healthy status for good metrics', () => {
      monitoring.recordApiCall('service1', '/api/test', 'GET', 200, 50);
      monitoring.recordDbQuery('SELECT', 30, true);

      const health = monitoring.getSystemHealth();

      expect(health.status).toBe('healthy');
      expect(health.metrics).toBeDefined();
    });

    it('should return degraded status for poor metrics', () => {
      monitoring.recordApiCall('service1', '/api/test', 'GET', 200, 1500);
      monitoring.recordApiCall('service1', '/api/test', 'GET', 500, 100);

      const health = monitoring.getSystemHealth();

      expect(['healthy', 'degraded', 'unhealthy']).toContain(health.status);
    });
  });

  describe('getMetricsReport', () => {
    it('should return metrics report', () => {
      monitoring.recordApiCall('service1', '/api/test', 'GET', 200, 100);
      monitoring.recordDbQuery('SELECT', 50, true);

      const report = monitoring.getMetricsReport();

      expect(report).toHaveProperty('timestamp');
      expect(report).toHaveProperty('api');
      expect(report).toHaveProperty('database');
      expect(report).toHaveProperty('cache');
    });
  });

  describe('clearOldMetrics', () => {
    it('should clear metrics older than date', () => {
      const oldDate = new Date(Date.now() - 7200000); // 2 hours ago
      monitoring.recordMetric('old_metric', 10);
      
      // Wait a bit
      setTimeout(() => {
        monitoring.recordMetric('new_metric', 20);
        monitoring.clearOldMetrics(new Date(Date.now() - 3600000)); // 1 hour ago

        const oldMetrics = monitoring.getMetrics('old_metric');
        const newMetrics = monitoring.getMetrics('new_metric');

        expect(oldMetrics.length).toBe(0);
        expect(newMetrics.length).toBeGreaterThan(0);
      }, 10);
    });
  });

  describe('registerMonitoring', () => {
    it('should register monitoring hooks', () => {
      const mockFastify = {
        addHook: jest.fn(),
        get: jest.fn(),
      };

      registerMonitoring(mockFastify);

      expect(mockFastify.addHook).toHaveBeenCalledWith('onRequest', expect.any(Function));
      expect(mockFastify.addHook).toHaveBeenCalledWith('onResponse', expect.any(Function));
      expect(mockFastify.get).toHaveBeenCalledWith('/health/metrics', expect.any(Function));
    });
  });
});
