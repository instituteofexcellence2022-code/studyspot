const {
  logger
} = require('../utils/logger');
const notificationService = require('./notificationService');
class MonitoringService {
  constructor() {
    this.errorThresholds = {
      error_rate: 5,
      // 5% error rate threshold
      response_time: 2000,
      // 2 seconds response time threshold
      memory_usage: 80,
      // 80% memory usage threshold
      cpu_usage: 70 // 70% CPU usage threshold
    };
    this.alertCooldowns = new Map(); // Prevent spam alerts
    this.metrics = {
      errors: [],
      response_times: [],
      memory_usage: [],
      cpu_usage: []
    };
  }

  // Track error
  async trackError(error, context = {}) {
    const errorRecord = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      type: error.constructor.name,
      context: context,
      severity: this.determineSeverity(error, context)
    };

    // Add to metrics
    this.metrics.errors.push(errorRecord);

    // Keep only last 1000 errors
    if (this.metrics.errors.length > 1000) {
      this.metrics.errors = this.metrics.errors.slice(-1000);
    }

    // Log error
    logger.error('Error tracked by monitoring service', {
      errorId: errorRecord.id,
      message: error.message,
      type: error.type,
      severity: errorRecord.severity,
      context: context
    });

    // Check if we should send alert
    await this.checkErrorThresholds();
    return errorRecord;
  }

  // Track performance metrics
  async trackPerformance(operation, duration, metadata = {}) {
    const perfRecord = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      operation: operation,
      duration: duration,
      metadata: metadata
    };

    // Add to metrics
    this.metrics.response_times.push(perfRecord);

    // Keep only last 1000 records
    if (this.metrics.response_times.length > 1000) {
      this.metrics.response_times = this.metrics.response_times.slice(-1000);
    }

    // Check if we should send alert
    await this.checkPerformanceThresholds();
    return perfRecord;
  }

  // Track system metrics
  async trackSystemMetrics(metrics) {
    const timestamp = new Date().toISOString();

    // Track memory usage
    if (metrics.memory) {
      this.metrics.memory_usage.push({
        timestamp: timestamp,
        usage: metrics.memory.usage,
        free: metrics.memory.free,
        total: metrics.memory.total,
        percentage: metrics.memory.usage / metrics.memory.total * 100
      });
    }

    // Track CPU usage
    if (metrics.cpu) {
      this.metrics.cpu_usage.push({
        timestamp: timestamp,
        usage: metrics.cpu.usage,
        percentage: metrics.cpu.percentage
      });
    }

    // Keep only last 100 records
    Object.keys(this.metrics).forEach(key => {
      if (this.metrics[key].length > 100) {
        this.metrics[key] = this.metrics[key].slice(-100);
      }
    });

    // Check thresholds
    await this.checkSystemThresholds(metrics);
  }

  // Determine error severity
  determineSeverity(error, context) {
    // Critical errors
    if (error.name === 'DatabaseError' || error.name === 'ConnectionError' || error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
      return 'critical';
    }

    // High severity errors
    if (error.name === 'ValidationError' || error.name === 'AuthenticationError' || error.message.includes('JWT') || error.message.includes('unauthorized')) {
      return 'high';
    }

    // Medium severity errors
    if (error.name === 'NotFoundError' || error.message.includes('not found') || error.message.includes('invalid')) {
      return 'medium';
    }

    // Default to low severity
    return 'low';
  }

  // Check error thresholds
  async checkErrorThresholds() {
    const recentErrors = this.metrics.errors.filter(error => new Date(error.timestamp) > new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
    );
    if (recentErrors.length >= 10) {
      // More than 10 errors in 5 minutes
      await this.sendAlert('error_rate_high', {
        message: `High error rate detected: ${recentErrors.length} errors in the last 5 minutes`,
        errorCount: recentErrors.length,
        timeWindow: '5 minutes',
        recentErrors: recentErrors.slice(-5).map(e => ({
          message: e.message,
          type: e.type,
          timestamp: e.timestamp
        }))
      });
    }

    // Check for critical errors
    const criticalErrors = recentErrors.filter(error => error.severity === 'critical');
    if (criticalErrors.length > 0) {
      await this.sendAlert('critical_errors', {
        message: `${criticalErrors.length} critical errors detected`,
        errors: criticalErrors.map(e => ({
          message: e.message,
          type: e.type,
          timestamp: e.timestamp,
          context: e.context
        }))
      });
    }
  }

  // Check performance thresholds
  async checkPerformanceThresholds() {
    const recentPerf = this.metrics.response_times.filter(perf => new Date(perf.timestamp) > new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
    );
    if (recentPerf.length > 0) {
      const avgResponseTime = recentPerf.reduce((sum, perf) => sum + perf.duration, 0) / recentPerf.length;
      if (avgResponseTime > this.errorThresholds.response_time) {
        await this.sendAlert('slow_response', {
          message: `Slow response times detected: ${avgResponseTime}ms average`,
          averageResponseTime: avgResponseTime,
          threshold: this.errorThresholds.response_time,
          sampleCount: recentPerf.length
        });
      }
    }
  }

  // Check system thresholds
  async checkSystemThresholds(metrics) {
    // Check memory usage
    if (metrics.memory) {
      const memoryPercentage = metrics.memory.usage / metrics.memory.total * 100;
      if (memoryPercentage > this.errorThresholds.memory_usage) {
        await this.sendAlert('high_memory_usage', {
          message: `High memory usage detected: ${memoryPercentage.toFixed(2)}%`,
          memoryUsage: memoryPercentage,
          threshold: this.errorThresholds.memory_usage,
          usage: metrics.memory.usage,
          total: metrics.memory.total
        });
      }
    }

    // Check CPU usage
    if (metrics.cpu && metrics.cpu.percentage > this.errorThresholds.cpu_usage) {
      await this.sendAlert('high_cpu_usage', {
        message: `High CPU usage detected: ${metrics.cpu.percentage}%`,
        cpuUsage: metrics.cpu.percentage,
        threshold: this.errorThresholds.cpu_usage
      });
    }
  }

  // Send alert
  async sendAlert(alertType, data) {
    const alertKey = `${alertType}_${new Date().toISOString().split('T')[0]}`;

    // Check cooldown
    if (this.alertCooldowns.has(alertKey)) {
      const lastSent = this.alertCooldowns.get(alertKey);
      if (new Date() - lastSent < 30 * 60 * 1000) {
        // 30 minutes cooldown
        return; // Skip alert due to cooldown
      }
    }

    // Update cooldown
    this.alertCooldowns.set(alertKey, new Date());

    // Prepare alert message
    const alertMessage = this.formatAlertMessage(alertType, data);

    // Send notification to admins
    try {
      // Get admin users
      const {
        query
      } = require('../config/database');
      const adminUsers = await query(`
        SELECT id, email, first_name, last_name
        FROM users
        WHERE role IN ('super_admin', 'library_staff') AND status = 'active'
      `);

      // Send alert to each admin
      for (const admin of adminUsers.rows) {
        await notificationService.sendMultiChannelNotification(admin.id, {
          title: `System Alert: ${alertType.replace(/_/g, ' ').toUpperCase()}`,
          message: alertMessage,
          type: 'system_alert',
          data: {
            alertType: alertType,
            alertData: data,
            timestamp: new Date().toISOString()
          },
          channels: ['in_app', 'email']
        });
      }
      logger.warn('System alert sent', {
        alertType: alertType,
        adminCount: adminUsers.rows.length,
        message: alertMessage
      });
    } catch (error) {
      logger.error('Failed to send system alert', {
        alertType: alertType,
        error: error.message
      });
    }
  }

  // Format alert message
  formatAlertMessage(alertType, data) {
    const baseMessage = `System Alert: ${alertType.replace(/_/g, ' ').toUpperCase()}\n\n`;
    switch (alertType) {
      case 'error_rate_high':
        return baseMessage + `High error rate detected: ${data.errorCount} errors in ${data.timeWindow}\n` + `Recent errors:\n${data.recentErrors.map(e => `- ${e.type}: ${e.message}`).join('\n')}`;
      case 'critical_errors':
        return baseMessage + `${data.errors.length} critical errors detected:\n` + data.errors.map(e => `- ${e.type}: ${e.message}`).join('\n');
      case 'slow_response':
        return baseMessage + `Slow response times: ${data.averageResponseTime}ms average (threshold: ${data.threshold}ms)\n` + `Sample count: ${data.sampleCount}`;
      case 'high_memory_usage':
        return baseMessage + `High memory usage: ${data.memoryUsage.toFixed(2)}% (threshold: ${data.threshold}%)\n` + `Usage: ${this.formatBytes(data.usage)} / ${this.formatBytes(data.total)}`;
      case 'high_cpu_usage':
        return baseMessage + `High CPU usage: ${data.cpuUsage}% (threshold: ${data.threshold}%)`;
      default:
        return baseMessage + JSON.stringify(data, null, 2);
    }
  }

  // Format bytes to human readable format
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Generate unique ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Get monitoring dashboard data
  getDashboardData() {
    const now = new Date();
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Filter recent data
    const recentErrors = this.metrics.errors.filter(error => new Date(error.timestamp) > lastHour);
    const recentPerf = this.metrics.response_times.filter(perf => new Date(perf.timestamp) > lastHour);
    const recentMemory = this.metrics.memory_usage.filter(mem => new Date(mem.timestamp) > last24Hours);
    const recentCpu = this.metrics.cpu_usage.filter(cpu => new Date(cpu.timestamp) > last24Hours);

    // Calculate metrics
    const errorRate = recentErrors.length / Math.max(recentPerf.length, 1) * 100;
    const avgResponseTime = recentPerf.length > 0 ? recentPerf.reduce((sum, perf) => sum + perf.duration, 0) / recentPerf.length : 0;
    const avgMemoryUsage = recentMemory.length > 0 ? recentMemory.reduce((sum, mem) => sum + mem.percentage, 0) / recentMemory.length : 0;
    const avgCpuUsage = recentCpu.length > 0 ? recentCpu.reduce((sum, cpu) => sum + cpu.percentage, 0) / recentCpu.length : 0;
    return {
      timestamp: now.toISOString(),
      metrics: {
        errorRate: parseFloat(errorRate.toFixed(2)),
        avgResponseTime: parseFloat(avgResponseTime.toFixed(2)),
        avgMemoryUsage: parseFloat(avgMemoryUsage.toFixed(2)),
        avgCpuUsage: parseFloat(avgCpuUsage.toFixed(2))
      },
      counts: {
        errorsLastHour: recentErrors.length,
        requestsLastHour: recentPerf.length,
        memorySamplesLast24h: recentMemory.length,
        cpuSamplesLast24h: recentCpu.length
      },
      thresholds: this.errorThresholds,
      status: {
        errorRate: errorRate <= this.errorThresholds.error_rate ? 'healthy' : 'warning',
        responseTime: avgResponseTime <= this.errorThresholds.response_time ? 'healthy' : 'warning',
        memoryUsage: avgMemoryUsage <= this.errorThresholds.memory_usage ? 'healthy' : 'warning',
        cpuUsage: avgCpuUsage <= this.errorThresholds.cpu_usage ? 'healthy' : 'warning'
      }
    };
  }

  // Update thresholds
  updateThresholds(newThresholds) {
    this.errorThresholds = {
      ...this.errorThresholds,
      ...newThresholds
    };
    logger.info('Monitoring thresholds updated', {
      thresholds: this.errorThresholds
    });
  }

  // Clear old data
  clearOldData() {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

    Object.keys(this.metrics).forEach(key => {
      this.metrics[key] = this.metrics[key].filter(item => new Date(item.timestamp) > cutoff);
    });

    // Clear old cooldowns
    const oldCooldowns = [];
    this.alertCooldowns.forEach((value, key) => {
      if (new Date() - value > 24 * 60 * 60 * 1000) {
        // 24 hours
        oldCooldowns.push(key);
      }
    });
    oldCooldowns.forEach(key => {
      this.alertCooldowns.delete(key);
    });
    logger.info('Monitoring data cleared', {
      metricsCleared: Object.keys(this.metrics).reduce((sum, key) => sum + this.metrics[key].length, 0),
      cooldownsCleared: oldCooldowns.length
    });
  }
}
module.exports = new MonitoringService();