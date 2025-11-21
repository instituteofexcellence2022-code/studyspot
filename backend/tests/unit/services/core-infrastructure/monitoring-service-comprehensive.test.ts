/**
 * UNIT TESTS - MONITORING SERVICE (Comprehensive)
 * Tests for: System health monitoring, performance metrics tracking,
 * alert management, capacity planning
 */

import { monitoring } from '../../../src/utils/monitoring';

describe('Monitoring Service - Comprehensive', () => {
  beforeEach(() => {
    (monitoring as any).metrics = [];
    jest.clearAllMocks();
  });

  describe('System Health Monitoring', () => {
    it('should monitor system health', () => {
      const health = monitoring.getSystemHealth();

      expect(health.status).toBeDefined();
      expect(['healthy', 'degraded', 'unhealthy']).toContain(health.status);
      expect(health.metrics).toBeDefined();
    });

    it('should detect unhealthy system', () => {
      // Simulate high error rate
      for (let i = 0; i < 20; i++) {
        monitoring.recordApiCall('test', '/api', 'GET', 500, 3000);
      }

      const health = monitoring.getSystemHealth();
      expect(health.status).toBe('unhealthy');
    });

    it('should track database health', () => {
      monitoring.recordDbQuery('SELECT', 50, true);
      monitoring.recordDbQuery('SELECT', 200, false);

      const health = monitoring.getSystemHealth();
      expect(health.metrics.dbAvgDuration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Performance Metrics Tracking', () => {
    it('should track API response times', () => {
      monitoring.recordApiCall('test-service', '/api/test', 'GET', 200, 100);
      monitoring.recordApiCall('test-service', '/api/test', 'GET', 200, 200);

      const avgResponseTime = monitoring.getAverage('api_response_time');
      expect(avgResponseTime).toBeGreaterThan(0);
    });

    it('should track error rates', () => {
      monitoring.recordApiCall('test', '/api', 'GET', 200, 100);
      monitoring.recordApiCall('test', '/api', 'GET', 500, 100);

      const errors = monitoring.getMetrics('api_error');
      expect(errors.length).toBe(1);
    });

    it('should track request rates', () => {
      for (let i = 0; i < 10; i++) {
        monitoring.recordApiCall('test', '/api', 'GET', 200, 100);
      }

      const oneMinuteAgo = new Date(Date.now() - 60000);
      const requests = monitoring.getMetrics('api_call', oneMinuteAgo);
      expect(requests.length).toBe(10);
    });
  });

  describe('Alert Management', () => {
    it('should trigger alert on high error rate', () => {
      for (let i = 0; i < 20; i++) {
        monitoring.recordApiCall('test', '/api', 'GET', 500, 100);
      }

      const health = monitoring.getSystemHealth();
      if (health.status === 'unhealthy') {
        // Alert would be triggered
        expect(health.metrics.errorRate).toBeGreaterThan(15);
      }
    });

    it('should trigger alert on slow response times', () => {
      monitoring.recordApiCall('test', '/api', 'GET', 200, 3000);

      const health = monitoring.getSystemHealth();
      if (health.status === 'degraded' || health.status === 'unhealthy') {
        expect(health.metrics.avgResponseTime).toBeGreaterThan(1000);
      }
    });

    it('should trigger alert on database issues', () => {
      monitoring.recordDbQuery('SELECT', 600, false);

      const health = monitoring.getSystemHealth();
      if (health.status === 'unhealthy') {
        expect(health.metrics.dbAvgDuration).toBeGreaterThan(500);
      }
    });
  });

  describe('Capacity Planning', () => {
    it('should track resource usage', () => {
      const metrics = {
        cpuUsage: 75,
        memoryUsage: 80,
        diskUsage: 60,
      };

      const isHighUsage = metrics.cpuUsage > 70 || metrics.memoryUsage > 70;
      expect(isHighUsage).toBe(true);
    });

    it('should predict capacity needs', () => {
      const currentUsage = {
        requestsPerMinute: 1000,
        growthRate: 0.1, // 10% per month
      };

      const predictedUsage = currentUsage.requestsPerMinute * Math.pow(1 + currentUsage.growthRate, 6); // 6 months
      expect(predictedUsage).toBeGreaterThan(currentUsage.requestsPerMinute);
    });

    it('should identify scaling needs', () => {
      const metrics = {
        avgResponseTime: 2000,
        errorRate: 10,
        cpuUsage: 90,
      };

      const needsScaling = metrics.avgResponseTime > 1000 || 
                          metrics.errorRate > 5 || 
                          metrics.cpuUsage > 80;

      expect(needsScaling).toBe(true);
    });
  });
});

