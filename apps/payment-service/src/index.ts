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
  defaultMeta: { service: 'payment-service' },
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
  process.env.DATABASE_URL || 'postgresql://localhost:5432/studyspot_payments',
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

// Payment Service Models and Interfaces
interface Payment {
  id: string;
  userId: string;
  tenantId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded';
  paymentMethod: 'stripe' | 'paypal' | 'razorpay' | 'bank_transfer' | 'cash' | 'wallet' | 'upi' | 'card';
  paymentGateway: 'stripe' | 'paypal' | 'razorpay' | 'manual';
  gatewayTransactionId?: string;
  gatewayResponse?: Record<string, any>;
  description: string;
  metadata: {
    orderId?: string;
    subscriptionId?: string;
    invoiceId?: string;
    customFields: Record<string, any>;
  };
  billing: {
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    billingAddress?: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };
  fees: {
    gatewayFee: number;
    processingFee: number;
    totalFees: number;
  };
  refunds: {
    totalRefunded: number;
    refunds: Array<{
      id: string;
      amount: number;
      reason: string;
      status: 'pending' | 'completed' | 'failed';
      createdAt: Date;
    }>;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface PaymentMethod {
  id: string;
  userId: string;
  tenantId: string;
  type: 'card' | 'bank_account' | 'wallet' | 'upi';
  gateway: 'stripe' | 'paypal' | 'razorpay';
  gatewayPaymentMethodId: string;
  details: {
    last4?: string;
    brand?: string;
    expiryMonth?: number;
    expiryYear?: number;
    bankName?: string;
    accountType?: string;
    upiId?: string;
  };
  isDefault: boolean;
  isActive: boolean;
  metadata: {
    customFields: Record<string, any>;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface Invoice {
  id: string;
  userId: string;
  tenantId: string;
  invoiceNumber: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
  amount: number;
  currency: string;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  dueDate: Date;
  paidDate?: Date;
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    taxRate: number;
  }>;
  billing: {
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    billingAddress?: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };
  payment: {
    paymentId?: string;
    paymentMethod?: string;
    gatewayTransactionId?: string;
  };
  metadata: {
    customFields: Record<string, any>;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface Subscription {
  id: string;
  userId: string;
  tenantId: string;
  planId: string;
  status: 'active' | 'inactive' | 'cancelled' | 'paused' | 'expired';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  billingCycle: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  amount: number;
  currency: string;
  paymentMethod?: string;
  nextBillingDate: Date;
  trialEnd?: Date;
  cancellationDate?: Date;
  metadata: {
    customFields: Record<string, any>;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface PaymentAnalytics {
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
const payments: Payment[] = [];
const paymentMethods: PaymentMethod[] = [];
const invoices: Invoice[] = [];
const subscriptions: Subscription[] = [];
const paymentAnalytics: PaymentAnalytics[] = [];

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
const validatePayment = [
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('currency').isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
  body('paymentMethod').isIn(['stripe', 'paypal', 'razorpay', 'bank_transfer', 'cash', 'wallet', 'upi', 'card']).withMessage('Invalid payment method'),
  body('description').notEmpty().withMessage('Description is required'),
  body('billing.customerName').notEmpty().withMessage('Customer name is required'),
  body('billing.customerEmail').isEmail().withMessage('Valid customer email is required')
];

const validatePaymentMethod = [
  body('type').isIn(['card', 'bank_account', 'wallet', 'upi']).withMessage('Invalid payment method type'),
  body('gateway').isIn(['stripe', 'paypal', 'razorpay']).withMessage('Invalid payment gateway'),
  body('gatewayPaymentMethodId').notEmpty().withMessage('Gateway payment method ID is required')
];

const validateInvoice = [
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('currency').isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
  body('dueDate').isISO8601().withMessage('Due date must be a valid date'),
  body('items').isArray().withMessage('Items must be an array'),
  body('billing.customerName').notEmpty().withMessage('Customer name is required'),
  body('billing.customerEmail').isEmail().withMessage('Valid customer email is required')
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
    message: 'Payment Service is healthy',
    timestamp: new Date().toISOString(),
    payments: payments.length,
    paymentMethods: paymentMethods.length,
    invoices: invoices.length,
    subscriptions: subscriptions.length,
    analytics: paymentAnalytics.length,
    connectedClients: io.engine.clientsCount
  });
});

// ============================================
// PAYMENT MANAGEMENT ROUTES
// ============================================

/**
 * @route   POST /api/payments
 * @desc    Create a new payment
 * @access  Private
 */
app.post('/api/payments', authenticateToken, validatePayment, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { amount, currency, paymentMethod, paymentGateway, description, billing, metadata } = req.body;
    
    const payment: Payment = {
      id: uuidv4(),
      userId: req.user.id,
      tenantId: req.user.tenantId,
      amount,
      currency,
      status: 'pending',
      paymentMethod,
      paymentGateway: paymentGateway || paymentMethod,
      description,
      metadata: {
        customFields: metadata?.customFields || {}
      },
      billing,
      fees: {
        gatewayFee: 0,
        processingFee: 0,
        totalFees: 0
      },
      refunds: {
        totalRefunded: 0,
        refunds: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    payments.push(payment);

    logger.info(`Payment created: ${payment.id}`);
    
    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: { payment }
    });
  } catch (error) {
    logger.error('Error creating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment'
    });
  }
});

/**
 * @route   POST /api/payments/:id/process
 * @desc    Process a payment
 * @access  Private
 */
app.post('/api/payments/:id/process', authenticateToken, async (req, res) => {
  try {
    const payment = payments.find(
      p => p.id === req.params.id && p.tenantId === req.user.tenantId
    );
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Payment has already been processed'
      });
    }

    // Update payment status
    payment.status = 'processing';
    payment.updatedAt = new Date();

    // Process payment based on gateway
    const result = await processPayment(payment);

    if (result.success) {
      payment.status = 'completed';
      payment.gatewayTransactionId = result.transactionId;
      payment.gatewayResponse = result.response;
      payment.fees = result.fees;
      payment.updatedAt = new Date();

      // Send real-time notification
      io.to(`tenant-${payment.tenantId}`).emit('payment_completed', {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        timestamp: new Date().toISOString()
      });

      logger.info(`Payment processed successfully: ${payment.id}`);
      
      res.json({
        success: true,
        message: 'Payment processed successfully',
        data: { payment }
      });
    } else {
      payment.status = 'failed';
      payment.gatewayResponse = result.response;
      payment.updatedAt = new Date();

      logger.error(`Payment processing failed: ${payment.id}`);
      
      res.status(400).json({
        success: false,
        message: 'Payment processing failed',
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Error processing payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/payments
 * @desc    Get all payments for a tenant
 * @access  Private
 */
app.get('/api/payments', authenticateToken, async (req, res) => {
  try {
    const { status, paymentMethod, paymentGateway, limit = 50, offset = 0 } = req.query;
    
    let tenantPayments = payments.filter(payment => payment.tenantId === req.user.tenantId);
    
    // Apply filters
    if (status) {
      tenantPayments = tenantPayments.filter(payment => payment.status === status);
    }
    if (paymentMethod) {
      tenantPayments = tenantPayments.filter(payment => payment.paymentMethod === paymentMethod);
    }
    if (paymentGateway) {
      tenantPayments = tenantPayments.filter(payment => payment.paymentGateway === paymentGateway);
    }
    
    // Sort by creation date
    tenantPayments = tenantPayments
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));
    
    res.json({
      success: true,
      data: { payments: tenantPayments },
      count: tenantPayments.length,
      total: payments.filter(payment => payment.tenantId === req.user.tenantId).length
    });
  } catch (error) {
    logger.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments'
    });
  }
});

// ============================================
// PAYMENT METHOD ROUTES
// ============================================

/**
 * @route   POST /api/payments/methods
 * @desc    Create a new payment method
 * @access  Private
 */
app.post('/api/payments/methods', authenticateToken, validatePaymentMethod, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { type, gateway, gatewayPaymentMethodId, details, isDefault, metadata } = req.body;
    
    // If this is set as default, unset other default payment methods
    if (isDefault) {
      paymentMethods.forEach(method => {
        if (method.userId === req.user.id && method.tenantId === req.user.tenantId) {
          method.isDefault = false;
        }
      });
    }
    
    const paymentMethod: PaymentMethod = {
      id: uuidv4(),
      userId: req.user.id,
      tenantId: req.user.tenantId,
      type,
      gateway,
      gatewayPaymentMethodId,
      details: details || {},
      isDefault: isDefault || false,
      isActive: true,
      metadata: {
        customFields: metadata?.customFields || {}
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    paymentMethods.push(paymentMethod);

    logger.info(`Payment method created: ${paymentMethod.id}`);
    
    res.status(201).json({
      success: true,
      message: 'Payment method created successfully',
      data: { paymentMethod }
    });
  } catch (error) {
    logger.error('Error creating payment method:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment method'
    });
  }
});

/**
 * @route   GET /api/payments/methods
 * @desc    Get all payment methods for a user
 * @access  Private
 */
app.get('/api/payments/methods', authenticateToken, async (req, res) => {
  try {
    const userPaymentMethods = paymentMethods.filter(
      method => method.userId === req.user.id && method.tenantId === req.user.tenantId
    );
    
    res.json({
      success: true,
      data: { paymentMethods: userPaymentMethods }
    });
  } catch (error) {
    logger.error('Error fetching payment methods:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment methods'
    });
  }
});

// ============================================
// INVOICE ROUTES
// ============================================

/**
 * @route   POST /api/payments/invoices
 * @desc    Create a new invoice
 * @access  Private
 */
app.post('/api/payments/invoices', authenticateToken, validateInvoice, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { userId, amount, currency, taxAmount, discountAmount, dueDate, items, billing, metadata } = req.body;
    
    const invoice: Invoice = {
      id: uuidv4(),
      userId: userId || req.user.id,
      tenantId: req.user.tenantId,
      invoiceNumber: `INV-${Date.now()}`,
      status: 'draft',
      amount,
      currency,
      taxAmount: taxAmount || 0,
      discountAmount: discountAmount || 0,
      totalAmount: amount + (taxAmount || 0) - (discountAmount || 0),
      dueDate: new Date(dueDate),
      items: items || [],
      billing,
      payment: {},
      metadata: {
        customFields: metadata?.customFields || {}
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    invoices.push(invoice);

    logger.info(`Invoice created: ${invoice.id}`);
    
    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: { invoice }
    });
  } catch (error) {
    logger.error('Error creating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create invoice'
    });
  }
});

/**
 * @route   GET /api/payments/invoices
 * @desc    Get all invoices for a tenant
 * @access  Private
 */
app.get('/api/payments/invoices', authenticateToken, async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    
    let tenantInvoices = invoices.filter(invoice => invoice.tenantId === req.user.tenantId);
    
    // Apply filters
    if (status) {
      tenantInvoices = tenantInvoices.filter(invoice => invoice.status === status);
    }
    
    // Sort by creation date
    tenantInvoices = tenantInvoices
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));
    
    res.json({
      success: true,
      data: { invoices: tenantInvoices },
      count: tenantInvoices.length,
      total: invoices.filter(invoice => invoice.tenantId === req.user.tenantId).length
    });
  } catch (error) {
    logger.error('Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoices'
    });
  }
});

// ============================================
// SUBSCRIPTION ROUTES
// ============================================

/**
 * @route   POST /api/payments/subscriptions
 * @desc    Create a new subscription
 * @access  Private
 */
app.post('/api/payments/subscriptions', authenticateToken, validateSubscription, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { userId, planId, billingCycle, amount, currency, currentPeriodStart, currentPeriodEnd, nextBillingDate, paymentMethod, trialEnd, metadata } = req.body;
    
    const subscription: Subscription = {
      id: uuidv4(),
      userId: userId || req.user.id,
      tenantId: req.user.tenantId,
      planId,
      status: 'active',
      currentPeriodStart: new Date(currentPeriodStart),
      currentPeriodEnd: new Date(currentPeriodEnd),
      billingCycle,
      amount,
      currency,
      paymentMethod,
      nextBillingDate: new Date(nextBillingDate),
      trialEnd: trialEnd ? new Date(trialEnd) : undefined,
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
 * @route   GET /api/payments/subscriptions
 * @desc    Get all subscriptions for a tenant
 * @access  Private
 */
app.get('/api/payments/subscriptions', authenticateToken, async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    
    let tenantSubscriptions = subscriptions.filter(subscription => subscription.tenantId === req.user.tenantId);
    
    // Apply filters
    if (status) {
      tenantSubscriptions = tenantSubscriptions.filter(subscription => subscription.status === status);
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

// ============================================
// PAYMENT ANALYTICS ROUTES
// ============================================

/**
 * @route   GET /api/payments/analytics/dashboard
 * @desc    Get payment analytics dashboard
 * @access  Private
 */
app.get('/api/payments/analytics/dashboard', authenticateToken, async (req, res) => {
  try {
    const tenantPayments = payments.filter(payment => payment.tenantId === req.user.tenantId);
    const tenantInvoices = invoices.filter(invoice => invoice.tenantId === req.user.tenantId);
    const tenantSubscriptions = subscriptions.filter(subscription => subscription.tenantId === req.user.tenantId);

    // Payment analytics
    const paymentStats = {
      total: tenantPayments.length,
      totalAmount: tenantPayments.reduce((sum, p) => sum + p.amount, 0),
      byStatus: {
        pending: tenantPayments.filter(p => p.status === 'pending').length,
        processing: tenantPayments.filter(p => p.status === 'processing').length,
        completed: tenantPayments.filter(p => p.status === 'completed').length,
        failed: tenantPayments.filter(p => p.status === 'failed').length,
        cancelled: tenantPayments.filter(p => p.status === 'cancelled').length,
        refunded: tenantPayments.filter(p => p.status === 'refunded').length,
        partially_refunded: tenantPayments.filter(p => p.status === 'partially_refunded').length
      },
      byPaymentMethod: {
        stripe: tenantPayments.filter(p => p.paymentMethod === 'stripe').length,
        paypal: tenantPayments.filter(p => p.paymentMethod === 'paypal').length,
        razorpay: tenantPayments.filter(p => p.paymentMethod === 'razorpay').length,
        bank_transfer: tenantPayments.filter(p => p.paymentMethod === 'bank_transfer').length,
        cash: tenantPayments.filter(p => p.paymentMethod === 'cash').length,
        wallet: tenantPayments.filter(p => p.paymentMethod === 'wallet').length,
        upi: tenantPayments.filter(p => p.paymentMethod === 'upi').length,
        card: tenantPayments.filter(p => p.paymentMethod === 'card').length
      },
      byPaymentGateway: {
        stripe: tenantPayments.filter(p => p.paymentGateway === 'stripe').length,
        paypal: tenantPayments.filter(p => p.paymentGateway === 'paypal').length,
        razorpay: tenantPayments.filter(p => p.paymentGateway === 'razorpay').length,
        manual: tenantPayments.filter(p => p.paymentGateway === 'manual').length
      },
      totalFees: tenantPayments.reduce((sum, p) => sum + p.fees.totalFees, 0),
      totalRefunded: tenantPayments.reduce((sum, p) => sum + p.refunds.totalRefunded, 0)
    };

    // Invoice analytics
    const invoiceStats = {
      total: tenantInvoices.length,
      totalAmount: tenantInvoices.reduce((sum, i) => sum + i.totalAmount, 0),
      byStatus: {
        draft: tenantInvoices.filter(i => i.status === 'draft').length,
        sent: tenantInvoices.filter(i => i.status === 'sent').length,
        paid: tenantInvoices.filter(i => i.status === 'paid').length,
        overdue: tenantInvoices.filter(i => i.status === 'overdue').length,
        cancelled: tenantInvoices.filter(i => i.status === 'cancelled').length,
        refunded: tenantInvoices.filter(i => i.status === 'refunded').length
      },
      totalTax: tenantInvoices.reduce((sum, i) => sum + i.taxAmount, 0),
      totalDiscount: tenantInvoices.reduce((sum, i) => sum + i.discountAmount, 0)
    };

    // Subscription analytics
    const subscriptionStats = {
      total: tenantSubscriptions.length,
      totalAmount: tenantSubscriptions.reduce((sum, s) => sum + s.amount, 0),
      byStatus: {
        active: tenantSubscriptions.filter(s => s.status === 'active').length,
        inactive: tenantSubscriptions.filter(s => s.status === 'inactive').length,
        cancelled: tenantSubscriptions.filter(s => s.status === 'cancelled').length,
        paused: tenantSubscriptions.filter(s => s.status === 'paused').length,
        expired: tenantSubscriptions.filter(s => s.status === 'expired').length
      },
      byBillingCycle: {
        daily: tenantSubscriptions.filter(s => s.billingCycle === 'daily').length,
        weekly: tenantSubscriptions.filter(s => s.billingCycle === 'weekly').length,
        monthly: tenantSubscriptions.filter(s => s.billingCycle === 'monthly').length,
        quarterly: tenantSubscriptions.filter(s => s.billingCycle === 'quarterly').length,
        yearly: tenantSubscriptions.filter(s => s.billingCycle === 'yearly').length
      },
      activeRevenue: tenantSubscriptions
        .filter(s => s.status === 'active')
        .reduce((sum, s) => sum + s.amount, 0)
    };

    res.json({
      success: true,
      data: {
        payments: paymentStats,
        invoices: invoiceStats,
        subscriptions: subscriptionStats,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error fetching payment analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment analytics'
    });
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

async function processPayment(payment: Payment): Promise<{ success: boolean; transactionId?: string; response?: any; fees?: any; error?: string }> {
  try {
    switch (payment.paymentGateway) {
      case 'stripe':
        return await processStripePayment(payment);
      case 'paypal':
        return await processPayPalPayment(payment);
      case 'razorpay':
        return await processRazorpayPayment(payment);
      case 'manual':
        return await processManualPayment(payment);
      default:
        throw new Error(`Unsupported payment gateway: ${payment.paymentGateway}`);
    }
  } catch (error) {
    logger.error('Error processing payment:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function processStripePayment(payment: Payment): Promise<{ success: boolean; transactionId?: string; response?: any; fees?: any; error?: string }> {
  try {
    // Simulate Stripe payment processing
    logger.info(`Processing Stripe payment: ${payment.id}`);
    
    // In a real implementation, you would call Stripe API here
    const transactionId = `pi_${Date.now()}`;
    const fees = {
      gatewayFee: payment.amount * 0.029 + 0.30, // 2.9% + $0.30
      processingFee: payment.amount * 0.01, // 1%
      totalFees: (payment.amount * 0.029 + 0.30) + (payment.amount * 0.01)
    };
    
    return {
      success: true,
      transactionId,
      response: { id: transactionId, status: 'succeeded' },
      fees
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function processPayPalPayment(payment: Payment): Promise<{ success: boolean; transactionId?: string; response?: any; fees?: any; error?: string }> {
  try {
    // Simulate PayPal payment processing
    logger.info(`Processing PayPal payment: ${payment.id}`);
    
    // In a real implementation, you would call PayPal API here
    const transactionId = `PAY-${Date.now()}`;
    const fees = {
      gatewayFee: payment.amount * 0.034 + 0.35, // 3.4% + $0.35
      processingFee: payment.amount * 0.01, // 1%
      totalFees: (payment.amount * 0.034 + 0.35) + (payment.amount * 0.01)
    };
    
    return {
      success: true,
      transactionId,
      response: { id: transactionId, state: 'approved' },
      fees
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function processRazorpayPayment(payment: Payment): Promise<{ success: boolean; transactionId?: string; response?: any; fees?: any; error?: string }> {
  try {
    // Simulate Razorpay payment processing
    logger.info(`Processing Razorpay payment: ${payment.id}`);
    
    // In a real implementation, you would call Razorpay API here
    const transactionId = `pay_${Date.now()}`;
    const fees = {
      gatewayFee: payment.amount * 0.02, // 2%
      processingFee: payment.amount * 0.01, // 1%
      totalFees: (payment.amount * 0.02) + (payment.amount * 0.01)
    };
    
    return {
      success: true,
      transactionId,
      response: { id: transactionId, status: 'captured' },
      fees
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function processManualPayment(payment: Payment): Promise<{ success: boolean; transactionId?: string; response?: any; fees?: any; error?: string }> {
  try {
    // Simulate manual payment processing
    logger.info(`Processing manual payment: ${payment.id}`);
    
    const transactionId = `manual_${Date.now()}`;
    const fees = {
      gatewayFee: 0,
      processingFee: 0,
      totalFees: 0
    };
    
    return {
      success: true,
      transactionId,
      response: { id: transactionId, status: 'completed' },
      fees
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================
// CRON JOBS
// ============================================

// Process subscription billing
cron.schedule('0 0 * * *', async () => {
  logger.info('Processing subscription billing...');
  
  const today = new Date();
  const dueSubscriptions = subscriptions.filter(subscription => 
    subscription.status === 'active' &&
    subscription.nextBillingDate <= today &&
    subscription.tenantId === 'default' // In production, check all tenants
  );
  
  for (const subscription of dueSubscriptions) {
    try {
      logger.info(`Processing subscription billing: ${subscription.id}`);
      
      // Create payment for subscription
      const payment: Payment = {
        id: uuidv4(),
        userId: subscription.userId,
        tenantId: subscription.tenantId,
        amount: subscription.amount,
        currency: subscription.currency,
        status: 'pending',
        paymentMethod: subscription.paymentMethod || 'stripe',
        paymentGateway: subscription.paymentMethod || 'stripe',
        description: `Subscription payment for plan ${subscription.planId}`,
        metadata: {
          subscriptionId: subscription.id,
          customFields: {}
        },
        billing: {
          customerName: 'Subscription Customer',
          customerEmail: 'customer@example.com'
        },
        fees: {
          gatewayFee: 0,
          processingFee: 0,
          totalFees: 0
        },
        refunds: {
          totalRefunded: 0,
          refunds: []
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      payments.push(payment);
      
      // Process payment
      const result = await processPayment(payment);
      
      if (result.success) {
        payment.status = 'completed';
        payment.gatewayTransactionId = result.transactionId;
        payment.gatewayResponse = result.response;
        payment.fees = result.fees;
        payment.updatedAt = new Date();
        
        // Update subscription
        subscription.currentPeriodStart = subscription.currentPeriodEnd;
        subscription.currentPeriodEnd = new Date(subscription.currentPeriodEnd.getTime() + getBillingCycleMs(subscription.billingCycle));
        subscription.nextBillingDate = subscription.currentPeriodEnd;
        subscription.updatedAt = new Date();
        
        logger.info(`Subscription billing processed successfully: ${subscription.id}`);
      } else {
        payment.status = 'failed';
        payment.gatewayResponse = result.response;
        payment.updatedAt = new Date();
        
        logger.error(`Subscription billing failed: ${subscription.id}`);
      }
    } catch (error) {
      logger.error(`Error processing subscription billing ${subscription.id}:`, error);
    }
  }
});

// Generate payment analytics metrics daily
cron.schedule('0 1 * * *', async () => {
  logger.info('Generating payment analytics metrics...');
  
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const today = new Date();
  
  const tenantPayments = payments.filter(payment => 
    payment.tenantId === 'default' && 
    payment.createdAt >= yesterday && 
    payment.createdAt < today
  );
  
  const tenantInvoices = invoices.filter(invoice => 
    invoice.tenantId === 'default' && 
    invoice.createdAt >= yesterday && 
    invoice.createdAt < today
  );
  
  const tenantSubscriptions = subscriptions.filter(subscription => 
    subscription.tenantId === 'default' && 
    subscription.createdAt >= yesterday && 
    subscription.createdAt < today
  );
  
  const metrics = [
    {
      id: uuidv4(),
      metric: 'payments_created_daily',
      value: tenantPayments.length,
      unit: 'count',
      period: 'daily' as const,
      date: yesterday,
      tenantId: 'default',
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      metric: 'payments_amount_daily',
      value: tenantPayments.reduce((sum, p) => sum + p.amount, 0),
      unit: 'currency',
      period: 'daily' as const,
      date: yesterday,
      tenantId: 'default',
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      metric: 'invoices_created_daily',
      value: tenantInvoices.length,
      unit: 'count',
      period: 'daily' as const,
      date: yesterday,
      tenantId: 'default',
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      metric: 'invoices_amount_daily',
      value: tenantInvoices.reduce((sum, i) => sum + i.totalAmount, 0),
      unit: 'currency',
      period: 'daily' as const,
      date: yesterday,
      tenantId: 'default',
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      metric: 'subscriptions_created_daily',
      value: tenantSubscriptions.length,
      unit: 'count',
      period: 'daily' as const,
      date: yesterday,
      tenantId: 'default',
      createdAt: new Date()
    }
  ];
  
  paymentAnalytics.push(...metrics);
  logger.info(`Generated ${metrics.length} payment analytics metrics`);
});

// Clean up old data weekly
cron.schedule('0 2 * * 0', async () => {
  logger.info('Cleaning up old payment data...');
  
  const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days ago
  
  // Clean up old analytics
  const initialAnalyticsCount = paymentAnalytics.length;
  const filteredAnalytics = paymentAnalytics.filter(analytics => analytics.createdAt > cutoffDate);
  paymentAnalytics.length = 0;
  paymentAnalytics.push(...filteredAnalytics);
  
  logger.info(`Cleaned up ${initialAnalyticsCount - paymentAnalytics.length} old payment analytics`);
});

// Helper function to get billing cycle in milliseconds
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
const PORT = process.env.PORT || 3016;

const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    // Start server
    server.listen(PORT, () => {
      logger.info(`🚀 Payment Service running on port ${PORT}`);
      logger.info(`💳 Stripe Payments: Active`);
      logger.info(`💳 PayPal Payments: Active`);
      logger.info(`💳 Razorpay Payments: Active`);
      logger.info(`💳 Manual Payments: Active`);
      logger.info(`📄 Invoice Management: Active`);
      logger.info(`🔄 Subscription Billing: Active`);
      logger.info(`📊 Payment Analytics: Active`);
      logger.info(`⚡ Real-time Socket.IO: Active`);
      logger.info(`⏰ Automated Billing: Active`);
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
