const express = require('express');
const { checkHealth: checkDatabaseHealth } = require('../config/database');
const { checkHealth: checkRedisHealth } = require('../config/redis');
// Multi-provider support (optional)
let databaseHealthCheck, redisHealthCheck;
try {
  databaseHealthCheck = require('../config/database-multi').databaseHealthCheck;
} catch (e) {
  databaseHealthCheck = null;
}
try {
  redisHealthCheck = require('../config/redis-multi').redisHealthCheck;
} catch (e) {
  redisHealthCheck = null;
}
const { logger } = require('../utils/logger');

const router = express.Router();

// Basic health check
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
});

// Detailed health check
router.get('/detailed', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Check database health (multi-provider if available)
    const dbHealth = databaseHealthCheck ? await databaseHealthCheck() : await checkDatabaseHealth();
    
    // Check Redis health (multi-provider if available)
    const redisHealth = redisHealthCheck ? await redisHealthCheck() : await checkRedisHealth();
    
    // Check memory usage
    const memoryUsage = process.memoryUsage();
    
    // Check CPU usage
    const cpuUsage = process.cpuUsage();
    
    const responseTime = Date.now() - startTime;
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      responseTime: `${responseTime}ms`,
      services: {
        database: dbHealth,
        redis: redisHealth
      },
      system: {
        memory: {
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
          external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`
        },
        cpu: {
          user: `${cpuUsage.user / 1000}ms`,
          system: `${cpuUsage.system / 1000}ms`
        }
      }
    };

    // Determine overall health status
    const isHealthy = dbHealth.status === 'healthy' && redisHealth.status === 'healthy';
    healthData.status = isHealthy ? 'healthy' : 'unhealthy';

    const statusCode = isHealthy ? 200 : 503;
    
    res.status(statusCode).json({
      success: isHealthy,
      data: healthData,
      meta: {
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Health check failed:', error);
    
    res.status(503).json({
      success: false,
      data: {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  }
});

// Readiness check (for Kubernetes)
router.get('/ready', async (req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    const redisHealth = await checkRedisHealth();
    
    const isReady = dbHealth.status === 'healthy' && redisHealth.status === 'healthy';
    
    if (isReady) {
      res.status(200).json({
        success: true,
        data: {
          status: 'ready',
          timestamp: new Date().toISOString()
        }
      });
    } else {
      res.status(503).json({
        success: false,
        data: {
          status: 'not ready',
          timestamp: new Date().toISOString(),
          services: {
            database: dbHealth.status,
            redis: redisHealth.status
          }
        }
      });
    }
  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({
      success: false,
      data: {
        status: 'not ready',
        timestamp: new Date().toISOString(),
        error: error.message
      }
    });
  }
});

// Liveness check (for Kubernetes)
router.get('/live', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }
  });
});

module.exports = router;













