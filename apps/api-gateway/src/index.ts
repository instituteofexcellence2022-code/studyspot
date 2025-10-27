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
import winston from 'winston';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'api-gateway' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Initialize Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => {
  logger.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  logger.info('Redis Client Connected');
});

// Service configurations
const SERVICES = {
  'auth': {
    url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    routes: ['/api/auth/*']
  },
  'users': {
    url: process.env.USER_SERVICE_URL || 'http://localhost:3002',
    routes: ['/api/users/*']
  },
  'bookings': {
    url: process.env.BOOKING_SERVICE_URL || 'http://localhost:3003',
    routes: ['/api/bookings/*']
  },
  'payments': {
    url: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3004',
    routes: ['/api/payments/*']
  },
  'crm': {
    url: process.env.CRM_SERVICE_URL || 'http://localhost:3005',
    routes: ['/api/crm/*']
  },
  'communication': {
    url: process.env.COMMUNICATION_SERVICE_URL || 'http://localhost:3006',
    routes: ['/api/communication/*']
  },
  'ml': {
    url: process.env.ML_SERVICE_URL || 'http://localhost:3007',
    routes: ['/api/ml/*']
  },
  'analytics': {
    url: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3008',
    routes: ['/api/analytics/*']
  },
  'ai': {
    url: process.env.AI_SERVICE_URL || 'http://localhost:3009',
    routes: ['/api/ai/*']
  },
  'security': {
    url: process.env.SECURITY_SERVICE_URL || 'http://localhost:3010',
    routes: ['/api/security/*']
  },
  'face-recognition': {
    url: process.env.FACE_RECOGNITION_SERVICE_URL || 'http://localhost:3011',
    routes: ['/api/face-recognition/*']
  },
  'qr': {
    url: process.env.QR_SERVICE_URL || 'http://localhost:3012',
    routes: ['/api/qr/*']
  },
  'automation': {
    url: process.env.AUTOMATION_SERVICE_URL || 'http://localhost:3013',
    routes: ['/api/automation/*']
  },
  'data-mining': {
    url: process.env.DATA_MINING_SERVICE_URL || 'http://localhost:3014',
    routes: ['/api/data-mining/*']
  },
  'notifications': {
    url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3015',
    routes: ['/api/notifications/*']
  },
  'subscriptions': {
    url: process.env.SUBSCRIPTION_SERVICE_URL || 'http://localhost:3016',
    routes: ['/api/subscriptions/*']
  },
  'monitoring': {
    url: process.env.MONITORING_SERVICE_URL || 'http://localhost:3017',
    routes: ['/api/monitoring/*']
  }
};

// Rate limiting configuration
const rateLimitConfig = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.',
      retryAfter: Math.round(rateLimitConfig.windowMs / 1000)
    });
  }
});

// Slow down configuration
const slowDownConfig = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 100, // allow 100 requests per 15 minutes, then...
  delayMs: 500 // begin adding 500ms of delay per request above 100
});

// Authentication middleware
const authenticateToken = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  try {
    // Check if token is blacklisted
    const isBlacklisted = await redisClient.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: 'Token has been revoked'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    // Add user info to request
    req.user = decoded;
    
    // Log request
    logger.info(`Authenticated request from user ${decoded.id} to ${req.path}`);
    
    next();
  } catch (error) {
    logger.error('Token verification failed:', error);
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Service discovery middleware
const serviceDiscovery = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const path = req.path;
  
  // Find matching service
  for (const [serviceName, config] of Object.entries(SERVICES)) {
    for (const route of config.routes) {
      const routePattern = route.replace('*', '.*');
      const regex = new RegExp(`^${routePattern}$`);
      
      if (regex.test(path)) {
        req.serviceName = serviceName;
        req.serviceUrl = config.url;
        logger.info(`Routing ${path} to ${serviceName} service`);
        return next();
      }
    }
  }
  
  // No service found
  logger.warn(`No service found for path: ${path}`);
  return res.status(404).json({
    success: false,
    message: 'Service not found',
    path: path
  });
};

// Create proxy middleware
const createServiceProxy = (serviceUrl: string) => {
  return createProxyMiddleware({
    target: serviceUrl,
    changeOrigin: true,
    pathRewrite: {
      '^/api': '' // Remove /api prefix when forwarding to services
    },
    onError: (err, req, res) => {
      logger.error(`Proxy error for ${req.path}:`, err);
      res.status(502).json({
        success: false,
        message: 'Service temporarily unavailable',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
      });
    },
    onProxyReq: (proxyReq, req, res) => {
      // Add request ID for tracing
      const requestId = uuidv4();
      proxyReq.setHeader('X-Request-ID', requestId);
      proxyReq.setHeader('X-User-ID', req.user?.id || 'anonymous');
      proxyReq.setHeader('X-Tenant-ID', req.user?.tenantId || 'default');
      
      logger.info(`Proxying request ${requestId} to ${serviceUrl}${req.path}`);
    },
    onProxyRes: (proxyRes, req, res) => {
      // Add response headers
      proxyRes.headers['X-Request-ID'] = req.headers['x-request-id'] || uuidv4();
      proxyRes.headers['X-Service'] = req.serviceName || 'unknown';
    }
  });
};

// Health check endpoint
const healthCheck = (req: express.Request, res: express.Response) => {
  res.json({
    success: true,
    message: 'API Gateway is healthy',
    timestamp: new Date().toISOString(),
    services: Object.keys(SERVICES).map(name => ({
      name,
      url: SERVICES[name].url,
      status: 'unknown' // TODO: Implement service health checks
    }))
  });
};

// Create Express app
const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Compression and logging
app.use(compression());
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim())
  }
}));

// Rate limiting and slow down
app.use(rateLimitConfig);
app.use(slowDownConfig);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', healthCheck);

// Service discovery and routing
app.use(serviceDiscovery);

// Authentication for protected routes (skip for auth service)
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.serviceName === 'auth' && req.path.startsWith('/api/auth/login')) {
    return next(); // Skip auth for login
  }
  if (req.serviceName === 'auth' && req.path.startsWith('/api/auth/register')) {
    return next(); // Skip auth for registration
  }
  if (req.serviceName === 'auth' && req.path.startsWith('/api/auth/forgot-password')) {
    return next(); // Skip auth for forgot password
  }
  
  return authenticateToken(req, res, next);
});

// Proxy to services
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.serviceName && req.serviceUrl) {
    const proxy = createServiceProxy(req.serviceUrl);
    return proxy(req, res, next);
  }
  next();
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req: express.Request, res: express.Response) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Start server
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Connect to Redis
    await redisClient.connect();
    
    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 API Gateway running on port ${PORT}`);
      logger.info(`📊 Monitoring ${Object.keys(SERVICES).length} services`);
      logger.info(`🔒 Security: Rate limiting, CORS, Helmet enabled`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await redisClient.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await redisClient.quit();
  process.exit(0);
});

// Start the server
startServer();

export default app;
