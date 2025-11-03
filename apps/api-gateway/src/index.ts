import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { createClient } from 'redis';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { logger } from './utils/logger';
import dotenv from 'dotenv';
import axios from 'axios';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import moment from 'moment';
import _ from 'lodash';
import Joi from 'joi';

// Load environment variables
dotenv.config();

// Configuration
const GATEWAY_CONFIG = {
  MAX_REQUESTS_PER_MINUTE: 1000,
  MAX_REQUESTS_PER_HOUR: 10000,
  MAX_REQUESTS_PER_DAY: 100000,
  REQUEST_TIMEOUT: 30000, // 30 seconds
  CIRCUIT_BREAKER_THRESHOLD: 5,
  CIRCUIT_BREAKER_TIMEOUT: 60000, // 1 minute
  CACHE_TTL: 300, // 5 minutes
  MAX_REQUEST_SIZE: '10mb',
  MAX_RESPONSE_SIZE: '50mb',
  HEALTH_CHECK_INTERVAL: 30000, // 30 seconds
  METRICS_RETENTION_DAYS: 30
};

// Initialize Redis client with enhanced configuration
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      logger.error('Redis connection refused');
      return new Error('Redis connection refused');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      logger.error('Redis retry time exhausted');
      return new Error('Retry time exhausted');
    }
    if (options.attempt > 10) {
      logger.error('Redis max retry attempts reached');
      return undefined;
    }
    return Math.min(options.attempt * 100, 3000);
  }
});

redisClient.on('error', (err) => {
  logger.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  logger.info('Redis Client Connected');
});

redisClient.on('ready', () => {
  logger.info('Redis Client Ready');
});

// Enhanced service configurations with health monitoring
const SERVICES = {
  'auth': {
    url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    routes: ['/api/auth/*'],
    healthCheck: '/health',
    timeout: 5000,
    retries: 3,
    circuitBreaker: { threshold: 5, timeout: 60000 },
    rateLimit: { windowMs: 60000, max: 100 },
    priority: 'high'
  },
  'users': {
    url: process.env.USER_SERVICE_URL || 'http://localhost:3002',
    routes: ['/api/users/*'],
    healthCheck: '/health',
    timeout: 10000,
    retries: 2,
    circuitBreaker: { threshold: 5, timeout: 60000 },
    rateLimit: { windowMs: 60000, max: 200 },
    priority: 'high'
  },
  'bookings': {
    url: process.env.BOOKING_SERVICE_URL || 'http://localhost:3003',
    routes: ['/api/bookings/*'],
    healthCheck: '/health',
    timeout: 15000,
    retries: 2,
    circuitBreaker: { threshold: 5, timeout: 60000 },
    rateLimit: { windowMs: 60000, max: 300 },
    priority: 'medium'
  },
  'payments': {
    url: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3004',
    routes: ['/api/payments/*'],
    healthCheck: '/health',
    timeout: 20000,
    retries: 3,
    circuitBreaker: { threshold: 3, timeout: 120000 },
    rateLimit: { windowMs: 60000, max: 50 },
    priority: 'critical'
  },
  'crm': {
    url: process.env.CRM_SERVICE_URL || 'http://localhost:3005',
    routes: ['/api/crm/*'],
    healthCheck: '/health',
    timeout: 10000,
    retries: 2,
    circuitBreaker: { threshold: 5, timeout: 60000 },
    rateLimit: { windowMs: 60000, max: 150 },
    priority: 'medium'
  },
  'communication': {
    url: process.env.COMMUNICATION_SERVICE_URL || 'http://localhost:3006',
    routes: ['/api/communication/*'],
    healthCheck: '/health',
    timeout: 10000,
    retries: 2,
    circuitBreaker: { threshold: 5, timeout: 60000 },
    rateLimit: { windowMs: 60000, max: 100 },
    priority: 'medium'
  },
  'ml': {
    url: process.env.ML_SERVICE_URL || 'http://localhost:3007',
    routes: ['/api/ml/*'],
    healthCheck: '/health',
    timeout: 30000,
    retries: 1,
    circuitBreaker: { threshold: 3, timeout: 120000 },
    rateLimit: { windowMs: 60000, max: 20 },
    priority: 'low'
  },
  'analytics': {
    url: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3008',
    routes: ['/api/analytics/*'],
    healthCheck: '/health',
    timeout: 15000,
    retries: 2,
    circuitBreaker: { threshold: 5, timeout: 60000 },
    rateLimit: { windowMs: 60000, max: 100 },
    priority: 'medium'
  },
  'ai': {
    url: process.env.AI_SERVICE_URL || 'http://localhost:3009',
    routes: ['/api/ai/*'],
    healthCheck: '/health',
    timeout: 30000,
    retries: 1,
    circuitBreaker: { threshold: 3, timeout: 120000 },
    rateLimit: { windowMs: 60000, max: 30 },
    priority: 'low'
  },
  'data-pipeline': {
    url: process.env.DATA_PIPELINE_SERVICE_URL || 'http://localhost:3010',
    routes: ['/api/data-pipeline/*'],
    healthCheck: '/health',
    timeout: 20000,
    retries: 2,
    circuitBreaker: { threshold: 5, timeout: 60000 },
    rateLimit: { windowMs: 60000, max: 50 },
    priority: 'medium'
  },
  'automation': {
    url: process.env.AUTOMATION_SERVICE_URL || 'http://localhost:3011',
    routes: ['/api/automation/*'],
    healthCheck: '/health',
    timeout: 15000,
    retries: 2,
    circuitBreaker: { threshold: 5, timeout: 60000 },
    rateLimit: { windowMs: 60000, max: 100 },
    priority: 'medium'
  },
  'security': {
    url: process.env.SECURITY_SERVICE_URL || 'http://localhost:3012',
    routes: ['/api/security/*'],
    healthCheck: '/health',
    timeout: 10000,
    retries: 3,
    circuitBreaker: { threshold: 3, timeout: 120000 },
    rateLimit: { windowMs: 60000, max: 200 },
    priority: 'critical'
  },
  'face-recognition': {
    url: process.env.FACE_RECOGNITION_SERVICE_URL || 'http://localhost:3013',
    routes: ['/api/face-recognition/*'],
    healthCheck: '/health',
    timeout: 30000,
    retries: 1,
    circuitBreaker: { threshold: 3, timeout: 120000 },
    rateLimit: { windowMs: 60000, max: 20 },
    priority: 'low'
  },
  'qr': {
    url: process.env.QR_SERVICE_URL || 'http://localhost:3014',
    routes: ['/api/qr/*'],
    healthCheck: '/health',
    timeout: 10000,
    retries: 2,
    circuitBreaker: { threshold: 5, timeout: 60000 },
    rateLimit: { windowMs: 60000, max: 100 },
    priority: 'medium'
  },
  'notification': {
    url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3015',
    routes: ['/api/notifications/*'],
    healthCheck: '/health',
    timeout: 10000,
    retries: 2,
    circuitBreaker: { threshold: 5, timeout: 60000 },
    rateLimit: { windowMs: 60000, max: 200 },
    priority: 'high'
  },
  'payment': {
    url: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3016',
    routes: ['/api/payment/*'],
    healthCheck: '/health',
    timeout: 20000,
    retries: 3,
    circuitBreaker: { threshold: 3, timeout: 120000 },
    rateLimit: { windowMs: 60000, max: 50 },
    priority: 'critical'
  },
  'subscription': {
    url: process.env.SUBSCRIPTION_SERVICE_URL || 'http://localhost:3017',
    routes: ['/api/subscription/*'],
    healthCheck: '/health',
    timeout: 10000,
    retries: 2,
    circuitBreaker: { threshold: 5, timeout: 60000 },
    rateLimit: { windowMs: 60000, max: 100 },
    priority: 'high'
  },
  'monitoring': {
    url: process.env.MONITORING_SERVICE_URL || 'http://localhost:3018',
    routes: ['/api/monitoring/*'],
    healthCheck: '/health',
    timeout: 5000,
    retries: 3,
    circuitBreaker: { threshold: 5, timeout: 60000 },
    rateLimit: { windowMs: 60000, max: 500 },
    priority: 'high'
  },
  'social-media': {
    url: process.env.SOCIAL_MEDIA_SERVICE_URL || 'http://localhost:3019',
    routes: ['/api/social-media/*'],
    healthCheck: '/health',
    timeout: 15000,
    retries: 2,
    circuitBreaker: { threshold: 5, timeout: 60000 },
    rateLimit: { windowMs: 60000, max: 50 },
    priority: 'low'
  },
  'content-generation': {
    url: process.env.CONTENT_GENERATION_SERVICE_URL || 'http://localhost:3020',
    routes: ['/api/content-generation/*'],
    healthCheck: '/health',
    timeout: 30000,
    retries: 1,
    circuitBreaker: { threshold: 3, timeout: 120000 },
    rateLimit: { windowMs: 60000, max: 20 },
    priority: 'low'
  },
  'engagement': {
    url: process.env.ENGAGEMENT_SERVICE_URL || 'http://localhost:3021',
    routes: ['/api/engagement/*'],
    healthCheck: '/health',
    timeout: 10000,
    retries: 2,
    circuitBreaker: { threshold: 5, timeout: 60000 },
    rateLimit: { windowMs: 60000, max: 100 },
    priority: 'medium'
  },
  'social-analytics': {
    url: process.env.SOCIAL_ANALYTICS_SERVICE_URL || 'http://localhost:3022',
    routes: ['/api/social-analytics/*'],
    healthCheck: '/health',
    timeout: 15000,
    retries: 2,
    circuitBreaker: { threshold: 5, timeout: 60000 },
    rateLimit: { windowMs: 60000, max: 50 },
    priority: 'medium'
  },
  'scheduling': {
    url: process.env.SCHEDULING_SERVICE_URL || 'http://localhost:3023',
    routes: ['/api/scheduling/*'],
    healthCheck: '/health',
    timeout: 10000,
    retries: 2,
    circuitBreaker: { threshold: 5, timeout: 60000 },
    rateLimit: { windowMs: 60000, max: 100 },
    priority: 'medium'
  },
  'ticket-management': {
    url: process.env.TICKET_MANAGEMENT_SERVICE_URL || 'http://localhost:3024',
    routes: ['/api/ticket-management/*'],
    healthCheck: '/health',
    timeout: 10000,
    retries: 2,
    circuitBreaker: { threshold: 5, timeout: 60000 },
    rateLimit: { windowMs: 60000, max: 100 },
    priority: 'medium'
  },
  'lead-conversion': {
    url: process.env.LEAD_CONVERSION_SERVICE_URL || 'http://localhost:3025',
    routes: ['/api/lead-conversion/*'],
    healthCheck: '/health',
    timeout: 15000,
    retries: 2,
    circuitBreaker: { threshold: 5, timeout: 60000 },
    rateLimit: { windowMs: 60000, max: 50 },
    priority: 'medium'
  },
  'tenant-management': {
    url: process.env.TENANT_MANAGEMENT_SERVICE_URL || 'http://localhost:3026',
    routes: ['/api/tenant-management/*'],
    healthCheck: '/health',
    timeout: 10000,
    retries: 2,
    circuitBreaker: { threshold: 5, timeout: 60000 },
    rateLimit: { windowMs: 60000, max: 100 },
    priority: 'high'
  },
  'user-analytics': {
    url: process.env.USER_ANALYTICS_SERVICE_URL || 'http://localhost:3027',
    routes: ['/api/user-analytics/*'],
    healthCheck: '/health',
    timeout: 15000,
    retries: 2,
    circuitBreaker: { threshold: 5, timeout: 60000 },
    rateLimit: { windowMs: 60000, max: 200 },
    priority: 'medium'
  },
  'encryption': {
    url: process.env.ENCRYPTION_SERVICE_URL || 'http://localhost:3028',
    routes: ['/api/encryption/*'],
    healthCheck: '/health',
    timeout: 10000,
    retries: 3,
    circuitBreaker: { threshold: 3, timeout: 120000 },
    rateLimit: { windowMs: 60000, max: 100 },
    priority: 'critical'
  },
  'i18n': {
    url: process.env.I18N_SERVICE_URL || 'http://localhost:3029',
    routes: ['/api/i18n/*'],
    healthCheck: '/health',
    timeout: 10000,
    retries: 2,
    circuitBreaker: { threshold: 5, timeout: 60000 },
    rateLimit: { windowMs: 60000, max: 200 },
    priority: 'medium'
  }
};

// Service health monitoring
class ServiceHealthMonitor {
  private healthStatus: Map<string, any> = new Map();
  private circuitBreakers: Map<string, any> = new Map();

  constructor() {
    this.initializeCircuitBreakers();
    this.startHealthChecks();
  }

  private initializeCircuitBreakers(): void {
    Object.keys(SERVICES).forEach(serviceName => {
      const config = SERVICES[serviceName];
      this.circuitBreakers.set(serviceName, {
        failures: 0,
        lastFailureTime: null,
        state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
        threshold: config.circuitBreaker.threshold,
        timeout: config.circuitBreaker.timeout
      });
    });
  }

  private async startHealthChecks(): Promise<void> {
    setInterval(async () => {
      await this.checkAllServices();
    }, GATEWAY_CONFIG.HEALTH_CHECK_INTERVAL);
  }

  private async checkAllServices(): Promise<void> {
    const healthChecks = Object.keys(SERVICES).map(serviceName => 
      this.checkServiceHealth(serviceName)
    );
    
    await Promise.allSettled(healthChecks);
  }

  private async checkServiceHealth(serviceName: string): Promise<void> {
    try {
      const config = SERVICES[serviceName];
      const circuitBreaker = this.circuitBreakers.get(serviceName);
      
      // Skip health check if circuit breaker is OPEN
      if (circuitBreaker.state === 'OPEN') {
        const timeSinceLastFailure = Date.now() - circuitBreaker.lastFailureTime;
        if (timeSinceLastFailure > circuitBreaker.timeout) {
          circuitBreaker.state = 'HALF_OPEN';
        } else {
          return;
        }
      }

      const response = await axios.get(`${config.url}${config.healthCheck}`, {
        timeout: config.timeout,
        headers: {
          'User-Agent': 'API-Gateway-Health-Check'
        }
      });

      if (response.status === 200) {
        this.healthStatus.set(serviceName, {
          status: 'healthy',
          lastCheck: new Date(),
          responseTime: response.headers['x-response-time'] || 'unknown',
          version: response.data.version || 'unknown'
        });

        // Reset circuit breaker on successful health check
        if (circuitBreaker.state === 'HALF_OPEN') {
          circuitBreaker.state = 'CLOSED';
          circuitBreaker.failures = 0;
        }
      } else {
        throw new Error(`Health check failed with status ${response.status}`);
      }
    } catch (error: any) {
      logger.warn(`Health check failed for ${serviceName}:`, error.message);
      
      const circuitBreaker = this.circuitBreakers.get(serviceName);
      circuitBreaker.failures++;
      circuitBreaker.lastFailureTime = Date.now();

      if (circuitBreaker.failures >= circuitBreaker.threshold) {
        circuitBreaker.state = 'OPEN';
        logger.error(`Circuit breaker OPEN for ${serviceName}`);
      }

      this.healthStatus.set(serviceName, {
        status: 'unhealthy',
        lastCheck: new Date(),
        error: error.message
      });
    }
  }

  getServiceHealth(serviceName: string): any {
    return this.healthStatus.get(serviceName) || { status: 'unknown' };
  }

  isServiceHealthy(serviceName: string): boolean {
    const health = this.healthStatus.get(serviceName);
    return health && health.status === 'healthy';
  }

  getCircuitBreakerState(serviceName: string): string {
    const circuitBreaker = this.circuitBreakers.get(serviceName);
    return circuitBreaker ? circuitBreaker.state : 'UNKNOWN';
  }

  getAllServicesHealth(): any {
    const health = {};
    Object.keys(SERVICES).forEach(serviceName => {
      health[serviceName] = {
        ...this.getServiceHealth(serviceName),
        circuitBreaker: this.getCircuitBreakerState(serviceName),
        config: SERVICES[serviceName]
      };
    });
    return health;
  }
}

const healthMonitor = new ServiceHealthMonitor();

// Enhanced rate limiting with different tiers
const createRateLimit = (windowMs: number, max: number, message: string) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message,
      retryAfter: Math.round(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
      res.status(429).json({
        success: false,
        message,
        retryAfter: Math.round(windowMs / 1000),
        code: 'RATE_LIMIT_EXCEEDED'
      });
    }
  });
};

// Different rate limits for different service priorities
const rateLimits = {
  critical: createRateLimit(60000, 50, 'Critical service rate limit exceeded'),
  high: createRateLimit(60000, 200, 'High priority service rate limit exceeded'),
  medium: createRateLimit(60000, 300, 'Medium priority service rate limit exceeded'),
  low: createRateLimit(60000, 500, 'Low priority service rate limit exceeded')
};

// Enhanced authentication middleware with tenant validation
const authenticateToken = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required',
      code: 'MISSING_TOKEN'
    });
  }

  try {
    // Check if token is blacklisted
    const isBlacklisted = await redisClient.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: 'Token has been revoked',
        code: 'TOKEN_REVOKED'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    // Validate tenant if present
    if (decoded.tenantId) {
      const tenantValid = await redisClient.get(`tenant:${decoded.tenantId}:valid`);
      if (tenantValid === 'false') {
        return res.status(403).json({
          success: false,
          message: 'Tenant access denied',
          code: 'TENANT_ACCESS_DENIED'
        });
      }
    }
    
    // Add user info to request
    req.user = decoded;
    
    // Log request with enhanced metadata
    logger.info(`Authenticated request`, {
      userId: decoded.id,
      tenantId: decoded.tenantId,
      path: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    next();
  } catch (error: any) {
    logger.error('Token verification failed:', error);
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token',
      code: 'INVALID_TOKEN'
    });
  }
};

// Enhanced service discovery with circuit breaker
const serviceDiscovery = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const path = req.path;
  
  // Find matching service
  for (const [serviceName, config] of Object.entries(SERVICES)) {
    for (const route of config.routes) {
      const routePattern = route.replace('*', '.*');
      const regex = new RegExp(`^${routePattern}$`);
      
      if (regex.test(path)) {
        // Check circuit breaker state
        const circuitBreakerState = healthMonitor.getCircuitBreakerState(serviceName);
        if (circuitBreakerState === 'OPEN') {
          logger.warn(`Circuit breaker OPEN for ${serviceName}, rejecting request`);
          return res.status(503).json({
            success: false,
            message: 'Service temporarily unavailable',
            code: 'SERVICE_UNAVAILABLE',
            service: serviceName
          });
        }

        req.serviceName = serviceName;
        req.serviceUrl = config.url;
        req.serviceConfig = config;
        
        logger.info(`Routing ${path} to ${serviceName} service`, {
          service: serviceName,
          path: req.path,
          method: req.method,
          circuitBreaker: circuitBreakerState
        });
        
        return next();
      }
    }
  }
  
  // No service found
  logger.warn(`No service found for path: ${path}`);
  return res.status(404).json({
    success: false,
    message: 'Service not found',
    code: 'SERVICE_NOT_FOUND',
    path: path
  });
};

// Enhanced proxy middleware with retry logic and caching
const createServiceProxy = (serviceUrl: string, serviceConfig: any) => {
  return createProxyMiddleware({
    target: serviceUrl,
    changeOrigin: true,
    timeout: serviceConfig.timeout,
    pathRewrite: {
      '^/api': '' // Remove /api prefix when forwarding to services
    },
    onError: (err, req, res) => {
      logger.error(`Proxy error for ${req.path}:`, err);
      
      // Update circuit breaker on error
      const circuitBreaker = healthMonitor['circuitBreakers'].get(req.serviceName);
      if (circuitBreaker) {
        circuitBreaker.failures++;
        circuitBreaker.lastFailureTime = Date.now();
        
        if (circuitBreaker.failures >= circuitBreaker.threshold) {
          circuitBreaker.state = 'OPEN';
          logger.error(`Circuit breaker OPEN for ${req.serviceName}`);
        }
      }
      
      res.status(502).json({
        success: false,
        message: 'Service temporarily unavailable',
        code: 'SERVICE_ERROR',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
      });
    },
    onProxyReq: (proxyReq, req, res) => {
      // Add request ID for tracing
      const requestId = uuidv4();
      proxyReq.setHeader('X-Request-ID', requestId);
      proxyReq.setHeader('X-User-ID', req.user?.id || 'anonymous');
      proxyReq.setHeader('X-Tenant-ID', req.user?.tenantId || 'default');
      proxyReq.setHeader('X-Service-Name', req.serviceName || 'unknown');
      proxyReq.setHeader('X-Gateway-Version', '1.0.0');
      
      // Add rate limiting headers
      const rateLimit = serviceConfig.rateLimit;
      proxyReq.setHeader('X-Rate-Limit-Limit', rateLimit.max.toString());
      proxyReq.setHeader('X-Rate-Limit-Window', rateLimit.windowMs.toString());
      
      logger.info(`Proxying request ${requestId} to ${serviceUrl}${req.path}`, {
        requestId,
        service: req.serviceName,
        url: `${serviceUrl}${req.path}`,
        method: req.method,
        userId: req.user?.id,
        tenantId: req.user?.tenantId
      });
    },
    onProxyRes: (proxyRes, req, res) => {
      // Add response headers
      proxyRes.headers['X-Request-ID'] = req.headers['x-request-id'] || uuidv4();
      proxyRes.headers['X-Service'] = req.serviceName || 'unknown';
      proxyRes.headers['X-Gateway-Version'] = '1.0.0';
      proxyRes.headers['X-Response-Time'] = Date.now().toString();
      
      // Log successful response
      logger.info(`Proxy response received`, {
        requestId: req.headers['x-request-id'],
        service: req.serviceName,
        status: proxyRes.statusCode,
        responseTime: Date.now()
      });
    }
  });
};

// Enhanced health check endpoint
const healthCheck = async (req: express.Request, res: express.Response) => {
  try {
    const servicesHealth = healthMonitor.getAllServicesHealth();
    const healthyServices = Object.values(servicesHealth).filter((service: any) => service.status === 'healthy').length;
    const totalServices = Object.keys(SERVICES).length;
    
    const healthScore = totalServices > 0 ? (healthyServices / totalServices) * 100 : 0;
    
    res.json({
      success: true,
      message: 'API Gateway is healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: process.uptime(),
      health: {
        score: Math.round(healthScore),
        status: healthScore >= 80 ? 'healthy' : healthScore >= 50 ? 'degraded' : 'unhealthy',
        services: {
          total: totalServices,
          healthy: healthyServices,
          unhealthy: totalServices - healthyServices
        }
      },
      services: servicesHealth,
      metrics: {
        requestsPerMinute: 0, // TODO: Implement request metrics
        averageResponseTime: 0, // TODO: Implement response time metrics
        errorRate: 0 // TODO: Implement error rate metrics
      }
    });
  } catch (error: any) {
    logger.error('Health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message
    });
  }
};

// Enhanced metrics endpoint
const metrics = async (req: express.Request, res: express.Response) => {
  try {
    const servicesHealth = healthMonitor.getAllServicesHealth();
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      metrics: {
        services: servicesHealth,
        circuitBreakers: Object.keys(SERVICES).map(serviceName => ({
          service: serviceName,
          state: healthMonitor.getCircuitBreakerState(serviceName),
          healthy: healthMonitor.isServiceHealthy(serviceName)
        })),
        gateway: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          cpu: process.cpuUsage(),
          version: '1.0.0'
        }
      }
    });
  } catch (error: any) {
    logger.error('Metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Metrics retrieval failed',
      error: error.message
    });
  }
};

// Setup HTTP server for Socket.IO
const server = http.createServer();
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Create Express app
const app = express();

// Security middleware with enhanced configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-User-ID', 'X-Tenant-ID']
}));

// Compression and logging
app.use(compression());
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim())
  }
}));

// Global rate limiting
app.use(createRateLimit(60000, GATEWAY_CONFIG.MAX_REQUESTS_PER_MINUTE, 'Global rate limit exceeded'));

// Body parsing with size limits
app.use(express.json({ limit: GATEWAY_CONFIG.MAX_REQUEST_SIZE }));
app.use(express.urlencoded({ extended: true, limit: GATEWAY_CONFIG.MAX_REQUEST_SIZE }));

// Health check and metrics endpoints
app.get('/health', healthCheck);
app.get('/metrics', metrics);

// Service discovery and routing
app.use(serviceDiscovery);

// Apply service-specific rate limiting
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.serviceConfig) {
    const priority = req.serviceConfig.priority;
    const rateLimit = rateLimits[priority];
    if (rateLimit) {
      return rateLimit(req, res, next);
    }
  }
  next();
});

// Authentication for protected routes (skip for auth service)
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.serviceName === 'auth' && (
    req.path.startsWith('/api/auth/login') ||
    req.path.startsWith('/api/auth/register') ||
    req.path.startsWith('/api/auth/forgot-password') ||
    req.path.startsWith('/api/auth/reset-password')
  )) {
    return next(); // Skip auth for public auth endpoints
  }
  
  return authenticateToken(req, res, next);
});

// Proxy to services
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.serviceName && req.serviceUrl && req.serviceConfig) {
    const proxy = createServiceProxy(req.serviceUrl, req.serviceConfig);
    return proxy(req, res, next);
  }
  next();
});

// Enhanced error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    tenantId: req.user?.tenantId
  });
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    code: 'INTERNAL_ERROR',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    requestId: req.headers['x-request-id']
  });
});

// 404 handler
app.use('*', (req: express.Request, res: express.Response) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: 'Route not found',
    code: 'ROUTE_NOT_FOUND',
    path: req.originalUrl,
    requestId: req.headers['x-request-id']
  });
});

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  logger.info('Client connected to API Gateway:', socket.id);
  
  socket.on('subscribe-service-health', (data) => {
    if (data.serviceName) {
      socket.join(`service-health-${data.serviceName}`);
      logger.info(`Client subscribed to service health updates for ${data.serviceName}`);
    }
  });
  
  socket.on('disconnect', () => {
    logger.info('Client disconnected from API Gateway:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 3004;

const startServer = async () => {
  try {
    // Connect to Redis
    await redisClient.connect();
    
    // Start HTTP server
    server.listen(PORT, () => {
      logger.info(`🚀 Enhanced API Gateway running on port ${PORT}`);
      logger.info(`📊 Monitoring ${Object.keys(SERVICES).length} services`);
      logger.info(`🔒 Security: Rate limiting, CORS, Helmet, Circuit breakers enabled`);
      logger.info(`🏥 Health monitoring: ${GATEWAY_CONFIG.HEALTH_CHECK_INTERVAL}ms interval`);
      logger.info(`⚡ Circuit breakers: Enabled for all services`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  try {
    await redisClient.quit();
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  
  try {
    await redisClient.quit();
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
});

// Start the server
startServer();

export default app;