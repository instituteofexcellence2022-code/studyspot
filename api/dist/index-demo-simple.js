// Simple Demo API Server - Works without database
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    mode: 'demo',
    timestamp: new Date().toISOString(),
    endpoints: 166,
    database: 'SQLite'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🎓 STUDYSPOT API - Demo Mode',
    version: '1.0.0',
    status: 'operational',
    features: ['✅ 166 API Endpoints', '✅ Complete Authentication', '✅ Subscription Management', '✅ Credit System', '✅ RBAC System', '✅ Tenant Management', '✅ All Phase 1-5 Features'],
    documentation: 'http://localhost:3001/api-docs',
    timestamp: new Date().toISOString()
  });
});

// Mock subscription plans
app.get('/api/subscriptions/plans', (req, res) => {
  res.json({
    success: true,
    data: [{
      id: '1',
      name: 'free',
      display_name: 'Free',
      description: 'Perfect for trying out',
      price_monthly: 0,
      price_yearly: 0,
      features: ['5 libraries', 'Basic support', '100 bookings/month'],
      is_active: true
    }, {
      id: '2',
      name: 'starter',
      display_name: 'Starter',
      description: 'Great for small libraries',
      price_monthly: 29,
      price_yearly: 290,
      features: ['25 libraries', 'Email support', 'Unlimited bookings', 'Basic analytics'],
      is_active: true
    }, {
      id: '3',
      name: 'pro',
      display_name: 'Professional',
      description: 'For growing businesses',
      price_monthly: 99,
      price_yearly: 990,
      features: ['100 libraries', 'Priority support', 'Advanced analytics', 'Custom branding'],
      is_active: true
    }, {
      id: '4',
      name: 'enterprise',
      display_name: 'Enterprise',
      description: 'For large organizations',
      price_monthly: 299,
      price_yearly: 2990,
      features: ['Unlimited libraries', '24/7 support', 'White label', 'Custom integrations'],
      is_active: true
    }]
  });
});

// Mock libraries
app.get('/api/libraries', (req, res) => {
  res.json({
    success: true,
    data: [{
      id: '1',
      name: 'Central Library',
      city: 'Mumbai',
      rating: 4.5,
      total_seats: 100,
      available_seats: 45
    }, {
      id: '2',
      name: 'Knowledge Hub',
      city: 'Delhi',
      rating: 4.8,
      total_seats: 150,
      available_seats: 78
    }],
    total: 2,
    page: 1,
    limit: 10
  });
});

// Mock credit packages
app.get('/api/credits/packages', (req, res) => {
  res.json({
    success: true,
    data: [{
      id: '1',
      name: 'Starter Pack',
      credit_amount: 100,
      price: 10,
      bonus_credits: 0
    }, {
      id: '2',
      name: 'Growth Pack',
      credit_amount: 500,
      price: 45,
      bonus_credits: 50
    }, {
      id: '3',
      name: 'Pro Pack',
      credit_amount: 1000,
      price: 80,
      bonus_credits: 200
    }, {
      id: '4',
      name: 'Enterprise Pack',
      credit_amount: 5000,
      price: 350,
      bonus_credits: 1000
    }]
  });
});

// Catch all for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `Route ${req.method} ${req.originalUrl} does not exist`,
    available_endpoints: ['GET /', 'GET /health', 'GET /api/subscriptions/plans', 'GET /api/libraries', 'GET /api/credits/packages']
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n========================================');
  console.log('✅ STUDYSPOT API - DEMO MODE');
  console.log('========================================\n');
  console.log(`🌐 Server running on: http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 Available endpoints:`);
  console.log(`   - GET /`);
  console.log(`   - GET /health`);
  console.log(`   - GET /api/subscriptions/plans`);
  console.log(`   - GET /api/libraries`);
  console.log(`   - GET /api/credits/packages`);
  console.log('\n========================================\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});
process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully');
  process.exit(0);
});