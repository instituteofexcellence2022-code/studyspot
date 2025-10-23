/**
 * Metrics and Monitoring Endpoint
 * Provides real-time application metrics
 */

const express = require('express');
const router = express.Router();
const { getPool } = require('../config/database');
const { logger } = require('../utils/logger');

// In-memory metrics storage
let metrics = {
  requests: {
    total: 0,
    success: 0,
    error: 0,
    byStatusCode: {}
  },
  responseTime: {
    total: 0,
    count: 0,
    average: 0,
    min: Infinity,
    max: 0
  },
  startTime: Date.now()
};

/**
 * Metrics collection middleware
 * Tracks request count, success/error rates, and response times
 */
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Update request metrics
    metrics.requests.total++;
    
    if (res.statusCode < 400) {
      metrics.requests.success++;
    } else {
      metrics.requests.error++;
    }
    
    // Track by status code
    const statusCode = res.statusCode.toString();
    metrics.requests.byStatusCode[statusCode] = 
      (metrics.requests.byStatusCode[statusCode] || 0) + 1;
    
    // Update response time metrics
    metrics.responseTime.total += duration;
    metrics.responseTime.count++;
    metrics.responseTime.average = Math.round(
      metrics.responseTime.total / metrics.responseTime.count
    );
    metrics.responseTime.min = Math.min(metrics.responseTime.min, duration);
    metrics.responseTime.max = Math.max(metrics.responseTime.max, duration);
  });
  
  next();
};

/**
 * GET /api/metrics
 * Returns current application metrics
 */
router.get('/', async (req, res) => {
  try {
    const pool = getPool();
    const uptime = Math.floor((Date.now() - metrics.startTime) / 1000);
    
    // Calculate error rate
    const errorRate = metrics.requests.total > 0
      ? ((metrics.requests.error / metrics.requests.total) * 100).toFixed(2)
      : '0.00';
    
    // Get memory usage
    const memUsage = process.memoryUsage();
    
    const metricsData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: uptime,
        formatted: formatUptime(uptime)
      },
      
      // Request metrics
      requests: {
        total: metrics.requests.total,
        success: metrics.requests.success,
        error: metrics.requests.error,
        errorRate: `${errorRate}%`,
        byStatusCode: metrics.requests.byStatusCode
      },
      
      // Performance metrics
      performance: {
        averageResponseTime: `${metrics.responseTime.average}ms`,
        minResponseTime: metrics.responseTime.min === Infinity 
          ? '0ms' 
          : `${metrics.responseTime.min}ms`,
        maxResponseTime: `${metrics.responseTime.max}ms`,
        totalRequests: metrics.responseTime.count
      },
      
      // Database connection pool
      database: pool ? {
        totalConnections: pool.totalCount,
        idleConnections: pool.idleCount,
        waitingRequests: pool.waitingCount
      } : { status: 'not initialized' },
      
      // Memory usage
      memory: {
        rss: `${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
        heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        external: `${(memUsage.external / 1024 / 1024).toFixed(2)} MB`,
        heapUsedPercent: `${((memUsage.heapUsed / memUsage.heapTotal) * 100).toFixed(2)}%`
      },
      
      // System info
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        pid: process.pid
      }
    };
    
    res.json(metricsData);
  } catch (error) {
    logger.error('Metrics endpoint error', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve metrics'
    });
  }
});

/**
 * GET /api/metrics/reset
 * Reset metrics counters (admin only)
 */
router.post('/reset', (req, res) => {
  metrics = {
    requests: {
      total: 0,
      success: 0,
      error: 0,
      byStatusCode: {}
    },
    responseTime: {
      total: 0,
      count: 0,
      average: 0,
      min: Infinity,
      max: 0
    },
    startTime: Date.now()
  };
  
  logger.info('Metrics reset', { requestId: req.id });
  
  res.json({
    success: true,
    message: 'Metrics reset successfully'
  });
});

/**
 * Format uptime in human-readable format
 */
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  
  return parts.join(' ');
}

module.exports = { router, metricsMiddleware };

