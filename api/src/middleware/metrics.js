const client = require('prom-client');

// Create a Registry to register the metrics
const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'studyspot-api'
});

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

// Create custom metrics
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const activeUsers = new client.Gauge({
  name: 'active_users',
  help: 'Number of active users'
});

const totalBookings = new client.Counter({
  name: 'total_bookings',
  help: 'Total number of bookings created'
});

const totalPayments = new client.Counter({
  name: 'total_payments',
  help: 'Total number of payments processed'
});

const paymentAmount = new client.Counter({
  name: 'payment_amount_total',
  help: 'Total payment amount processed',
  labelNames: ['currency']
});

const databaseConnections = new client.Gauge({
  name: 'database_connections',
  help: 'Number of active database connections'
});

const redisConnections = new client.Gauge({
  name: 'redis_connections',
  help: 'Number of active Redis connections'
});

const errorRate = new client.Counter({
  name: 'error_rate_total',
  help: 'Total number of errors',
  labelNames: ['error_type', 'endpoint']
});

// Register the metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);
register.registerMetric(activeUsers);
register.registerMetric(totalBookings);
register.registerMetric(totalPayments);
register.registerMetric(paymentAmount);
register.registerMetric(databaseConnections);
register.registerMetric(redisConnections);
register.registerMetric(errorRate);

// Middleware to collect HTTP metrics
const collectHttpMetrics = (req, res, next) => {
  const start = Date.now();
  
  // Override res.end to capture response status
  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    
    // Record metrics
    httpRequestDuration
      .labels(req.method, route, res.statusCode)
      .observe(duration);
    
    httpRequestsTotal
      .labels(req.method, route, res.statusCode)
      .inc();
    
    // Record error metrics for 4xx and 5xx responses
    if (res.statusCode >= 400) {
      const errorType = res.statusCode >= 500 ? 'server_error' : 'client_error';
      errorRate
        .labels(errorType, route)
        .inc();
    }
    
    originalEnd.apply(this, args);
  };
  
  next();
};

// Function to update business metrics
const updateBusinessMetrics = {
  incrementBookings: () => {
    totalBookings.inc();
  },
  
  incrementPayments: (amount, currency = 'INR') => {
    totalPayments.inc();
    paymentAmount.labels(currency).inc(amount);
  },
  
  setActiveUsers: (count) => {
    activeUsers.set(count);
  },
  
  setDatabaseConnections: (count) => {
    databaseConnections.set(count);
  },
  
  setRedisConnections: (count) => {
    redisConnections.set(count);
  }
};

// Metrics endpoint
const getMetrics = async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error) {
    res.status(500).end('Error generating metrics');
  }
};

// Health check endpoint with metrics
const getHealthWithMetrics = async (req, res) => {
  try {
    const { checkHealth: checkDatabaseHealth } = require('../config/database');
    const { checkHealth: checkRedisHealth } = require('../config/redis');
    
    const dbHealth = await checkDatabaseHealth();
    const redisHealth = await checkRedisHealth();
    
    const isHealthy = dbHealth.status === 'healthy' && redisHealth.status === 'healthy';
    
    // Update connection metrics
    updateBusinessMetrics.setDatabaseConnections(isHealthy ? 1 : 0);
    updateBusinessMetrics.setRedisConnections(redisHealth.status === 'healthy' ? 1 : 0);
    
    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealth,
        redis: redisHealth
      },
      metrics: {
        activeUsers: activeUsers.hashMap,
        totalBookings: totalBookings.hashMap,
        totalPayments: totalPayments.hashMap
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  register,
  collectHttpMetrics,
  updateBusinessMetrics,
  getMetrics,
  getHealthWithMetrics,
  metrics: {
    httpRequestDuration,
    httpRequestsTotal,
    activeUsers,
    totalBookings,
    totalPayments,
    paymentAmount,
    databaseConnections,
    redisConnections,
    errorRate
  }
};







































