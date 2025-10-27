import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import winston from 'winston';
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import { PythonShell } from 'python-shell';
import cron from 'node-cron';
import multer from 'multer';
import csv from 'csv-parser';
import { Parser } from 'json2csv';
import * as XLSX from 'xlsx';
import _ from 'lodash';
import moment from 'moment-timezone';
import kafka from 'kafka-node';
import amqp from 'amqplib';
import { Client as ElasticsearchClient } from 'elasticsearch';
import { MongoClient } from 'mongodb';
import InfluxDB from 'influxdb';
import Stripe from 'stripe';
import paypal from 'paypal-rest-sdk';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import passport from 'passport';
import JwtStrategy from 'passport-jwt';
import LocalStrategy from 'passport-local';
import session from 'express-session';
import RedisStore from 'connect-redis';
import slowDown from 'express-slow-down';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';

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
  defaultMeta: { service: 'subscription-service' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Database connection
const sequelize = new Sequelize(
  process.env.DATABASE_URL || 'postgresql://localhost:5432/studyspot_subscriptions',
  {
    logging: (msg) => logger.debug(msg),
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Payment gateway configurations
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_...', {
  apiVersion: '2023-10-16'
});

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_...',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_...'
});

paypal.configure({
  mode: process.env.PAYPAL_MODE || 'sandbox',
  client_id: process.env.PAYPAL_CLIENT_ID || 'your-paypal-client-id',
  client_secret: process.env.PAYPAL_CLIENT_SECRET || 'your-paypal-client-secret'
});

// Subscription Service Models and Interfaces
interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  type: 'basic' | 'premium' | 'enterprise' | 'custom';
  status: 'active' | 'inactive' | 'archived';
  pricing: {
    amount: number;
    currency: string;
    billingCycle: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    trialPeriod?: number; // in days
    setupFee?: number;
    discount?: {
      type: 'percentage' | 'fixed';
      value: number;
      validUntil?: Date;
    };
  };
  features: {
    maxUsers: number;
    maxStorage: number; // in GB
    maxApiCalls: number;
    maxNotifications: number;
    features: string[];
    limitations: string[];
  };
  metadata: {
    customFields: Record<string, any>;
  };
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Subscription {
  id: string;
  userId: string;
  tenantId: string;
  planId: string;
  status: 'active' | 'inactive' | 'cancelled' | 'paused' | 'expired' | 'trial' | 'past_due';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  billingCycle: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  amount: number;
  currency: string;
  paymentMethod?: string;
  nextBillingDate: Date;
  trialStart?: Date;
  trialEnd?: Date;
  cancellationDate?: Date;
  cancellationReason?: string;
  autoRenew: boolean;
  proration: boolean;
  usage: {
    users: number;
    storage: number; // in GB
    apiCalls: number;
    notifications: number;
  };
  limits: {
    maxUsers: number;
    maxStorage: number; // in GB
    maxApiCalls: number;
    maxNotifications: number;
  };
  metadata: {
    customFields: Record<string, any>;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface SubscriptionUsage {
  id: string;
  subscriptionId: string;
  userId: string;
  tenantId: string;
  metric: 'users' | 'storage' | 'api_calls' | 'notifications';
  value: number;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  date: Date;
  metadata: {
    customFields: Record<string, any>;
  };
  createdAt: Date;
}

interface SubscriptionBilling {
  id: string;
  subscriptionId: string;
  userId: string;
  tenantId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
  billingDate: Date;
  dueDate: Date;
  paidDate?: Date;
  paymentMethod?: string;
  gatewayTransactionId?: string;
  invoiceId?: string;
  proration?: {
    previousAmount: number;
    newAmount: number;
    prorationAmount: number;
  };
  metadata: {
    customFields: Record<string, any>;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface SubscriptionAnalytics {
  id: string;
  metric: string;
  value: number;
  unit: string;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  date: Date;
  tenantId: string;
  createdAt: Date;
}

// In-memory storage for demo (replace with database in production)
const subscriptionPlans: SubscriptionPlan[] = [];
const subscriptions: Subscription[] = [];
const subscriptionUsage: SubscriptionUsage[] = [];
const subscriptionBilling: SubscriptionBilling[] = [];
const subscriptionAnalytics: SubscriptionAnalytics[] = [];

// Authentication middleware
const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Validation middleware
const validateSubscriptionPlan = [
  body('name').notEmpty().withMessage('Plan name is required'),
  body('description').notEmpty().withMessage('Plan description is required'),
  body('type').isIn(['basic', 'premium', 'enterprise', 'custom']).withMessage('Invalid plan type'),
  body('status').isIn(['active', 'inactive', 'archived']).withMessage('Invalid status'),
  body('pricing.amount').isNumeric().withMessage('Amount must be a number'),
  body('pricing.currency').isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
  body('pricing.billingCycle').isIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']).withMessage('Invalid billing cycle')
];

const validateSubscription = [
  body('planId').notEmpty().withMessage('Plan ID is required'),
  body('billingCycle').isIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']).withMessage('Invalid billing cycle'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('currency').isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
  body('currentPeriodStart').isISO8601().withMessage('Current period start must be a valid date'),
  body('currentPeriodEnd').isISO8601().withMessage('Current period end must be a valid date'),
  body('nextBillingDate').isISO8601().withMessage('Next billing date must be a valid date')
];

const validateSubscriptionUsage = [
  body('subscriptionId').notEmpty().withMessage('Subscription ID is required'),
  body('metric').isIn(['users', 'storage', 'api_calls', 'notifications']).withMessage('Invalid metric'),
  body('value').isNumeric().withMessage('Value must be a number'),
  body('period').isIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']).withMessage('Invalid period')
];

const validateSubscriptionBilling = [
  body('subscriptionId').notEmpty().withMessage('Subscription ID is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('currency').isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
  body('billingDate').isISO8601().withMessage('Billing date must be a valid date'),
  body('dueDate').isISO8601().withMessage('Due date must be a valid date'),
  body('status').isIn(['pending', 'paid', 'failed', 'refunded', 'cancelled']).withMessage('Invalid status')
];

// Rate limiting
const rateLimitConfig = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per 15 minutes, then...
  delayMs: 500 // begin adding 500ms of delay per request above 50
});

// Create Express app and HTTP server
const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(rateLimitConfig);
app.use(speedLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  socket.on('join-tenant', (tenantId) => {
    socket.join(`tenant-${tenantId}`);
    logger.info(`Client ${socket.id} joined tenant ${tenantId}`);
  });
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Subscription Service is healthy',
    timestamp: new Date().toISOString(),
    plans: subscriptionPlans.length,
    subscriptions: subscriptions.length,
    usage: subscriptionUsage.length,
    billing: subscriptionBilling.length,
    analytics: subscriptionAnalytics.length,
    connectedClients: io.engine.clientsCount
  });
});

// ============================================
// SUBSCRIPTION PLAN ROUTES
// ============================================

/**
 * @route   POST /api/subscriptions/plans
 * @desc    Create a new subscription plan
 * @access  Private
 */
app.post('/api/subscriptions/plans', authenticateToken, validateSubscriptionPlan, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { name, description, type, status, pricing, features, metadata } = req.body;
    
    const plan: SubscriptionPlan = {
      id: uuidv4(),
      name,
      description,
      type,
      status: status || 'active',
      pricing,
      features,
      metadata: {
        customFields: metadata?.customFields || {}
      },
      tenantId: req.user.tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    subscriptionPlans.push(plan);

    logger.info(`Subscription plan created: ${plan.id}`);
    
    res.status(201).json({
      success: true,
      message: 'Subscription plan created successfully',
      data: { plan }
    });
  } catch (error) {
    logger.error('Error creating subscription plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subscription plan'
    });
  }
});

/**
 * @route   GET /api/subscriptions/plans
 * @desc    Get all subscription plans for a tenant
 * @access  Private
 */
app.get('/api/subscriptions/plans', authenticateToken, async (req, res) => {
  try {
    const { type, status, limit = 50, offset = 0 } = req.query;
    
    let tenantPlans = subscriptionPlans.filter(plan => plan.tenantId === req.user.tenantId);
    
    // Apply filters
    if (type) {
      tenantPlans = tenantPlans.filter(plan => plan.type === type);
    }
    if (status) {
      tenantPlans = tenantPlans.filter(plan => plan.status === status);
    }
    
    // Sort by creation date
    tenantPlans = tenantPlans
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));
    
    res.json({
      success: true,
      data: { plans: tenantPlans },
      count: tenantPlans.length,
      total: subscriptionPlans.filter(plan => plan.tenantId === req.user.tenantId).length
    });
  } catch (error) {
    logger.error('Error fetching subscription plans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription plans'
    });
  }
});

// ============================================
// SUBSCRIPTION ROUTES
// ============================================

/**
 * @route   POST /api/subscriptions
 * @desc    Create a new subscription
 * @access  Private
 */
app.post('/api/subscriptions', authenticateToken, validateSubscription, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { userId, planId, billingCycle, amount, currency, currentPeriodStart, currentPeriodEnd, nextBillingDate, paymentMethod, trialStart, trialEnd, autoRenew, proration, metadata } = req.body;
    
    // Get plan details
    const plan = subscriptionPlans.find(p => p.id === planId && p.tenantId === req.user.tenantId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Subscription plan not found'
      });
    }

    const subscription: Subscription = {
      id: uuidv4(),
      userId: userId || req.user.id,
      tenantId: req.user.tenantId,
      planId,
      status: trialStart ? 'trial' : 'active',
      currentPeriodStart: new Date(currentPeriodStart),
      currentPeriodEnd: new Date(currentPeriodEnd),
      billingCycle,
      amount,
      currency,
      paymentMethod,
      nextBillingDate: new Date(nextBillingDate),
      trialStart: trialStart ? new Date(trialStart) : undefined,
      trialEnd: trialEnd ? new Date(trialEnd) : undefined,
      autoRenew: autoRenew !== false,
      proration: proration || false,
      usage: {
        users: 0,
        storage: 0,
        apiCalls: 0,
        notifications: 0
      },
      limits: {
        maxUsers: plan.features.maxUsers,
        maxStorage: plan.features.maxStorage,
        maxApiCalls: plan.features.maxApiCalls,
        maxNotifications: plan.features.maxNotifications
      },
      metadata: {
        customFields: metadata?.customFields || {}
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    subscriptions.push(subscription);

    logger.info(`Subscription created: ${subscription.id}`);
    
    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: { subscription }
    });
  } catch (error) {
    logger.error('Error creating subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subscription'
    });
  }
});

/**
 * @route   GET /api/subscriptions
 * @desc    Get all subscriptions for a tenant
 * @access  Private
 */
app.get('/api/subscriptions', authenticateToken, async (req, res) => {
  try {
    const { status, planId, limit = 50, offset = 0 } = req.query;
    
    let tenantSubscriptions = subscriptions.filter(subscription => subscription.tenantId === req.user.tenantId);
    
    // Apply filters
    if (status) {
      tenantSubscriptions = tenantSubscriptions.filter(subscription => subscription.status === status);
    }
    if (planId) {
      tenantSubscriptions = tenantSubscriptions.filter(subscription => subscription.planId === planId);
    }
    
    // Sort by creation date
    tenantSubscriptions = tenantSubscriptions
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));
    
    res.json({
      success: true,
      data: { subscriptions: tenantSubscriptions },
      count: tenantSubscriptions.length,
      total: subscriptions.filter(subscription => subscription.tenantId === req.user.tenantId).length
    });
  } catch (error) {
    logger.error('Error fetching subscriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscriptions'
    });
  }
});

/**
 * @route   POST /api/subscriptions/:id/cancel
 * @desc    Cancel a subscription
 * @access  Private
 */
app.post('/api/subscriptions/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const subscription = subscriptions.find(
      s => s.id === req.params.id && s.tenantId === req.user.tenantId
    );
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    if (subscription.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Subscription is already cancelled'
      });
    }

    const { reason } = req.body;
    
    subscription.status = 'cancelled';
    subscription.cancellationDate = new Date();
    subscription.cancellationReason = reason;
    subscription.updatedAt = new Date();

    // Send real-time notification
    io.to(`tenant-${subscription.tenantId}`).emit('subscription_cancelled', {
      id: subscription.id,
      userId: subscription.userId,
      planId: subscription.planId,
      cancellationDate: subscription.cancellationDate,
      reason: subscription.cancellationReason,
      timestamp: new Date().toISOString()
    });

    logger.info(`Subscription cancelled: ${subscription.id}`);
    
    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
      data: { subscription }
    });
  } catch (error) {
    logger.error('Error cancelling subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription'
    });
  }
});

/**
 * @route   POST /api/subscriptions/:id/pause
 * @desc    Pause a subscription
 * @access  Private
 */
app.post('/api/subscriptions/:id/pause', authenticateToken, async (req, res) => {
  try {
    const subscription = subscriptions.find(
      s => s.id === req.params.id && s.tenantId === req.user.tenantId
    );
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    if (subscription.status === 'paused') {
      return res.status(400).json({
        success: false,
        message: 'Subscription is already paused'
      });
    }

    subscription.status = 'paused';
    subscription.updatedAt = new Date();

    // Send real-time notification
    io.to(`tenant-${subscription.tenantId}`).emit('subscription_paused', {
      id: subscription.id,
      userId: subscription.userId,
      planId: subscription.planId,
      timestamp: new Date().toISOString()
    });

    logger.info(`Subscription paused: ${subscription.id}`);
    
    res.json({
      success: true,
      message: 'Subscription paused successfully',
      data: { subscription }
    });
  } catch (error) {
    logger.error('Error pausing subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to pause subscription'
    });
  }
});

/**
 * @route   POST /api/subscriptions/:id/resume
 * @desc    Resume a subscription
 * @access  Private
 */
app.post('/api/subscriptions/:id/resume', authenticateToken, async (req, res) => {
  try {
    const subscription = subscriptions.find(
      s => s.id === req.params.id && s.tenantId === req.user.tenantId
    );
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    if (subscription.status !== 'paused') {
      return res.status(400).json({
        success: false,
        message: 'Subscription is not paused'
      });
    }

    subscription.status = 'active';
    subscription.updatedAt = new Date();

    // Send real-time notification
    io.to(`tenant-${subscription.tenantId}`).emit('subscription_resumed', {
      id: subscription.id,
      userId: subscription.userId,
      planId: subscription.planId,
      timestamp: new Date().toISOString()
    });

    logger.info(`Subscription resumed: ${subscription.id}`);
    
    res.json({
      success: true,
      message: 'Subscription resumed successfully',
      data: { subscription }
    });
  } catch (error) {
    logger.error('Error resuming subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resume subscription'
    });
  }
});

// ============================================
// SUBSCRIPTION USAGE ROUTES
// ============================================

/**
 * @route   POST /api/subscriptions/usage
 * @desc    Record subscription usage
 * @access  Private
 */
app.post('/api/subscriptions/usage', authenticateToken, validateSubscriptionUsage, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { subscriptionId, userId, metric, value, period, metadata } = req.body;
    
    const usage: SubscriptionUsage = {
      id: uuidv4(),
      subscriptionId,
      userId: userId || req.user.id,
      tenantId: req.user.tenantId,
      metric,
      value,
      period,
      date: new Date(),
      metadata: {
        customFields: metadata?.customFields || {}
      },
      createdAt: new Date()
    };

    subscriptionUsage.push(usage);

    // Update subscription usage
    const subscription = subscriptions.find(s => s.id === subscriptionId);
    if (subscription) {
      switch (metric) {
        case 'users':
          subscription.usage.users = value;
          break;
        case 'storage':
          subscription.usage.storage = value;
          break;
        case 'api_calls':
          subscription.usage.apiCalls = value;
          break;
        case 'notifications':
          subscription.usage.notifications = value;
          break;
      }
      subscription.updatedAt = new Date();
    }

    logger.info(`Subscription usage recorded: ${usage.id}`);
    
    res.status(201).json({
      success: true,
      message: 'Subscription usage recorded successfully',
      data: { usage }
    });
  } catch (error) {
    logger.error('Error recording subscription usage:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record subscription usage'
    });
  }
});

/**
 * @route   GET /api/subscriptions/:id/usage
 * @desc    Get subscription usage
 * @access  Private
 */
app.get('/api/subscriptions/:id/usage', authenticateToken, async (req, res) => {
  try {
    const subscription = subscriptions.find(
      s => s.id === req.params.id && s.tenantId === req.user.tenantId
    );
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    const { metric, period, limit = 50, offset = 0 } = req.query;
    
    let subscriptionUsageData = subscriptionUsage.filter(usage => usage.subscriptionId === req.params.id);
    
    // Apply filters
    if (metric) {
      subscriptionUsageData = subscriptionUsageData.filter(usage => usage.metric === metric);
    }
    if (period) {
      subscriptionUsageData = subscriptionUsageData.filter(usage => usage.period === period);
    }
    
    // Sort by date
    subscriptionUsageData = subscriptionUsageData
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));
    
    res.json({
      success: true,
      data: { 
        usage: subscriptionUsageData,
        currentUsage: subscription.usage,
        limits: subscription.limits
      },
      count: subscriptionUsageData.length,
      total: subscriptionUsage.filter(usage => usage.subscriptionId === req.params.id).length
    });
  } catch (error) {
    logger.error('Error fetching subscription usage:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription usage'
    });
  }
});

// ============================================
// SUBSCRIPTION BILLING ROUTES
// ============================================

/**
 * @route   POST /api/subscriptions/billing
 * @desc    Create subscription billing record
 * @access  Private
 */
app.post('/api/subscriptions/billing', authenticateToken, validateSubscriptionBilling, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { subscriptionId, userId, amount, currency, status, billingDate, dueDate, paidDate, paymentMethod, gatewayTransactionId, invoiceId, proration, metadata } = req.body;
    
    const billing: SubscriptionBilling = {
      id: uuidv4(),
      subscriptionId,
      userId: userId || req.user.id,
      tenantId: req.user.tenantId,
      amount,
      currency,
      status: status || 'pending',
      billingDate: new Date(billingDate),
      dueDate: new Date(dueDate),
      paidDate: paidDate ? new Date(paidDate) : undefined,
      paymentMethod,
      gatewayTransactionId,
      invoiceId,
      proration,
      metadata: {
        customFields: metadata?.customFields || {}
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    subscriptionBilling.push(billing);

    logger.info(`Subscription billing created: ${billing.id}`);
    
    res.status(201).json({
      success: true,
      message: 'Subscription billing created successfully',
      data: { billing }
    });
  } catch (error) {
    logger.error('Error creating subscription billing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subscription billing'
    });
  }
});

/**
 * @route   GET /api/subscriptions/:id/billing
 * @desc    Get subscription billing history
 * @access  Private
 */
app.get('/api/subscriptions/:id/billing', authenticateToken, async (req, res) => {
  try {
    const subscription = subscriptions.find(
      s => s.id === req.params.id && s.tenantId === req.user.tenantId
    );
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    const { status, limit = 50, offset = 0 } = req.query;
    
    let subscriptionBillingData = subscriptionBilling.filter(billing => billing.subscriptionId === req.params.id);
    
    // Apply filters
    if (status) {
      subscriptionBillingData = subscriptionBillingData.filter(billing => billing.status === status);
    }
    
    // Sort by billing date
    subscriptionBillingData = subscriptionBillingData
      .sort((a, b) => b.billingDate.getTime() - a.billingDate.getTime())
      .slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));
    
    res.json({
      success: true,
      data: { billing: subscriptionBillingData },
      count: subscriptionBillingData.length,
      total: subscriptionBilling.filter(billing => billing.subscriptionId === req.params.id).length
    });
  } catch (error) {
    logger.error('Error fetching subscription billing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription billing'
    });
  }
});

// ============================================
// SUBSCRIPTION ANALYTICS ROUTES
// ============================================

/**
 * @route   GET /api/subscriptions/analytics/dashboard
 * @desc    Get subscription analytics dashboard
 * @access  Private
 */
app.get('/api/subscriptions/analytics/dashboard', authenticateToken, async (req, res) => {
  try {
    const tenantPlans = subscriptionPlans.filter(plan => plan.tenantId === req.user.tenantId);
    const tenantSubscriptions = subscriptions.filter(subscription => subscription.tenantId === req.user.tenantId);
    const tenantUsage = subscriptionUsage.filter(usage => usage.tenantId === req.user.tenantId);
    const tenantBilling = subscriptionBilling.filter(billing => billing.tenantId === req.user.tenantId);

    // Plan analytics
    const planStats = {
      total: tenantPlans.length,
      active: tenantPlans.filter(p => p.status === 'active').length,
      inactive: tenantPlans.filter(p => p.status === 'inactive').length,
      archived: tenantPlans.filter(p => p.status === 'archived').length,
      byType: {
        basic: tenantPlans.filter(p => p.type === 'basic').length,
        premium: tenantPlans.filter(p => p.type === 'premium').length,
        enterprise: tenantPlans.filter(p => p.type === 'enterprise').length,
        custom: tenantPlans.filter(p => p.type === 'custom').length
      }
    };

    // Subscription analytics
    const subscriptionStats = {
      total: tenantSubscriptions.length,
      byStatus: {
        active: tenantSubscriptions.filter(s => s.status === 'active').length,
        inactive: tenantSubscriptions.filter(s => s.status === 'inactive').length,
        cancelled: tenantSubscriptions.filter(s => s.status === 'cancelled').length,
        paused: tenantSubscriptions.filter(s => s.status === 'paused').length,
        expired: tenantSubscriptions.filter(s => s.status === 'expired').length,
        trial: tenantSubscriptions.filter(s => s.status === 'trial').length,
        past_due: tenantSubscriptions.filter(s => s.status === 'past_due').length
      },
      byBillingCycle: {
        daily: tenantSubscriptions.filter(s => s.billingCycle === 'daily').length,
        weekly: tenantSubscriptions.filter(s => s.billingCycle === 'weekly').length,
        monthly: tenantSubscriptions.filter(s => s.billingCycle === 'monthly').length,
        quarterly: tenantSubscriptions.filter(s => s.billingCycle === 'quarterly').length,
        yearly: tenantSubscriptions.filter(s => s.billingCycle === 'yearly').length
      },
      totalRevenue: tenantSubscriptions
        .filter(s => s.status === 'active')
        .reduce((sum, s) => sum + s.amount, 0),
      averageRevenue: tenantSubscriptions
        .filter(s => s.status === 'active')
        .reduce((sum, s) => sum + s.amount, 0) / tenantSubscriptions.filter(s => s.status === 'active').length || 0
    };

    // Usage analytics
    const usageStats = {
      total: tenantUsage.length,
      byMetric: {
        users: tenantUsage.filter(u => u.metric === 'users').length,
        storage: tenantUsage.filter(u => u.metric === 'storage').length,
        api_calls: tenantUsage.filter(u => u.metric === 'api_calls').length,
        notifications: tenantUsage.filter(u => u.metric === 'notifications').length
      },
      byPeriod: {
        daily: tenantUsage.filter(u => u.period === 'daily').length,
        weekly: tenantUsage.filter(u => u.period === 'weekly').length,
        monthly: tenantUsage.filter(u => u.period === 'monthly').length,
        quarterly: tenantUsage.filter(u => u.period === 'quarterly').length,
        yearly: tenantUsage.filter(u => u.period === 'yearly').length
      }
    };

    // Billing analytics
    const billingStats = {
      total: tenantBilling.length,
      totalAmount: tenantBilling.reduce((sum, b) => sum + b.amount, 0),
      byStatus: {
        pending: tenantBilling.filter(b => b.status === 'pending').length,
        paid: tenantBilling.filter(b => b.status === 'paid').length,
        failed: tenantBilling.filter(b => b.status === 'failed').length,
        refunded: tenantBilling.filter(b => b.status === 'refunded').length,
        cancelled: tenantBilling.filter(b => b.status === 'cancelled').length
      },
      averageAmount: tenantBilling.reduce((sum, b) => sum + b.amount, 0) / tenantBilling.length || 0
    };

    res.json({
      success: true,
      data: {
        plans: planStats,
        subscriptions: subscriptionStats,
        usage: usageStats,
        billing: billingStats,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error fetching subscription analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription analytics'
    });
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

function getBillingCycleMs(billingCycle: string): number {
  switch (billingCycle) {
    case 'daily':
      return 24 * 60 * 60 * 1000;
    case 'weekly':
      return 7 * 24 * 60 * 60 * 1000;
    case 'monthly':
      return 30 * 24 * 60 * 60 * 1000;
    case 'quarterly':
      return 90 * 24 * 60 * 60 * 1000;
    case 'yearly':
      return 365 * 24 * 60 * 60 * 1000;
    default:
      return 30 * 24 * 60 * 60 * 1000; // Default to monthly
  }
}

// ============================================
// CRON JOBS
// ============================================

// Process subscription renewals
cron.schedule('0 0 * * *', async () => {
  logger.info('Processing subscription renewals...');
  
  const today = new Date();
  const dueSubscriptions = subscriptions.filter(subscription => 
    subscription.status === 'active' &&
    subscription.nextBillingDate <= today &&
    subscription.tenantId === 'default' // In production, check all tenants
  );
  
  for (const subscription of dueSubscriptions) {
    try {
      logger.info(`Processing subscription renewal: ${subscription.id}`);
      
      // Create billing record
      const billing: SubscriptionBilling = {
        id: uuidv4(),
        subscriptionId: subscription.id,
        userId: subscription.userId,
        tenantId: subscription.tenantId,
        amount: subscription.amount,
        currency: subscription.currency,
        status: 'pending',
        billingDate: new Date(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        paymentMethod: subscription.paymentMethod,
        metadata: {
          customFields: {}
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      subscriptionBilling.push(billing);
      
      // Update subscription
      subscription.currentPeriodStart = subscription.currentPeriodEnd;
      subscription.currentPeriodEnd = new Date(subscription.currentPeriodEnd.getTime() + getBillingCycleMs(subscription.billingCycle));
      subscription.nextBillingDate = subscription.currentPeriodEnd;
      subscription.updatedAt = new Date();
      
      // Send real-time notification
      io.to(`tenant-${subscription.tenantId}`).emit('subscription_renewed', {
        id: subscription.id,
        userId: subscription.userId,
        planId: subscription.planId,
        nextBillingDate: subscription.nextBillingDate,
        timestamp: new Date().toISOString()
      });
      
      logger.info(`Subscription renewal processed successfully: ${subscription.id}`);
    } catch (error) {
      logger.error(`Error processing subscription renewal ${subscription.id}:`, error);
    }
  }
});

// Process trial expirations
cron.schedule('0 1 * * *', async () => {
  logger.info('Processing trial expirations...');
  
  const today = new Date();
  const expiredTrials = subscriptions.filter(subscription => 
    subscription.status === 'trial' &&
    subscription.trialEnd &&
    subscription.trialEnd <= today &&
    subscription.tenantId === 'default' // In production, check all tenants
  );
  
  for (const subscription of expiredTrials) {
    try {
      logger.info(`Processing trial expiration: ${subscription.id}`);
      
      subscription.status = 'expired';
      subscription.updatedAt = new Date();
      
      // Send real-time notification
      io.to(`tenant-${subscription.tenantId}`).emit('trial_expired', {
        id: subscription.id,
        userId: subscription.userId,
        planId: subscription.planId,
        trialEnd: subscription.trialEnd,
        timestamp: new Date().toISOString()
      });
      
      logger.info(`Trial expiration processed successfully: ${subscription.id}`);
    } catch (error) {
      logger.error(`Error processing trial expiration ${subscription.id}:`, error);
    }
  }
});

// Generate subscription analytics metrics daily
cron.schedule('0 2 * * *', async () => {
  logger.info('Generating subscription analytics metrics...');
  
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const today = new Date();
  
  const tenantSubscriptions = subscriptions.filter(subscription => 
    subscription.tenantId === 'default' && 
    subscription.createdAt >= yesterday && 
    subscription.createdAt < today
  );
  
  const tenantBilling = subscriptionBilling.filter(billing => 
    billing.tenantId === 'default' && 
    billing.createdAt >= yesterday && 
    billing.createdAt < today
  );
  
  const metrics = [
    {
      id: uuidv4(),
      metric: 'subscriptions_created_daily',
      value: tenantSubscriptions.length,
      unit: 'count',
      period: 'daily' as const,
      date: yesterday,
      tenantId: 'default',
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      metric: 'subscriptions_revenue_daily',
      value: tenantSubscriptions.reduce((sum, s) => sum + s.amount, 0),
      unit: 'currency',
      period: 'daily' as const,
      date: yesterday,
      tenantId: 'default',
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      metric: 'billing_created_daily',
      value: tenantBilling.length,
      unit: 'count',
      period: 'daily' as const,
      date: yesterday,
      tenantId: 'default',
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      metric: 'billing_amount_daily',
      value: tenantBilling.reduce((sum, b) => sum + b.amount, 0),
      unit: 'currency',
      period: 'daily' as const,
      date: yesterday,
      tenantId: 'default',
      createdAt: new Date()
    }
  ];
  
  subscriptionAnalytics.push(...metrics);
  logger.info(`Generated ${metrics.length} subscription analytics metrics`);
});

// Clean up old data weekly
cron.schedule('0 3 * * 0', async () => {
  logger.info('Cleaning up old subscription data...');
  
  const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days ago
  
  // Clean up old usage data
  const initialUsageCount = subscriptionUsage.length;
  const filteredUsage = subscriptionUsage.filter(usage => usage.createdAt > cutoffDate);
  subscriptionUsage.length = 0;
  subscriptionUsage.push(...filteredUsage);
  
  // Clean up old analytics
  const initialAnalyticsCount = subscriptionAnalytics.length;
  const filteredAnalytics = subscriptionAnalytics.filter(analytics => analytics.createdAt > cutoffDate);
  subscriptionAnalytics.length = 0;
  subscriptionAnalytics.push(...filteredAnalytics);
  
  logger.info(`Cleaned up ${initialUsageCount - subscriptionUsage.length} old subscription usage records`);
  logger.info(`Cleaned up ${initialAnalyticsCount - subscriptionAnalytics.length} old subscription analytics`);
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
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Start server
const PORT = process.env.PORT || 3017;

const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    // Start server
    server.listen(PORT, () => {
      logger.info(`🚀 Subscription Service running on port ${PORT}`);
      logger.info(`📋 Subscription Plans: Active`);
      logger.info(`🔄 Subscription Management: Active`);
      logger.info(`📊 Usage Tracking: Active`);
      logger.info(`💳 Billing Management: Active`);
      logger.info(`📈 Subscription Analytics: Active`);
      logger.info(`⚡ Real-time Socket.IO: Active`);
      logger.info(`⏰ Automated Renewals: Active`);
      logger.info(`⏰ Trial Management: Active`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await sequelize.close();
  server.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await sequelize.close();
  server.close();
  process.exit(0);
});

// Start the server
startServer();

export default app;
