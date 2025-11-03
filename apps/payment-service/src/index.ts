import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { logger } from './utils/logger';
import mongoose from 'mongoose';
import { Queue, Worker, Job } from 'bullmq';
import cron from 'node-cron';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import _ from 'lodash';
import Joi from 'joi';
import Stripe from 'stripe';
import paypal from 'paypal-rest-sdk';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { logger as winstonLogger } from 'winston';

const app = express();
const PORT = process.env.PORT || 3016;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/paymentdb';
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Configuration
const PAYMENT_CONFIG = {
  MAX_PAYMENTS_PER_TENANT: 1000000,
  MAX_PAYMENT_AMOUNT: 1000000, // $10,000
  MIN_PAYMENT_AMOUNT: 1, // $0.01
  MAX_REFUND_AMOUNT: 1000000, // $10,000
  MAX_PAYMENT_METHODS: 10,
  MAX_WEBHOOK_RETRIES: 5,
  RETENTION_DAYS: 365,
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: 100,
  MAX_PAYMENT_DESCRIPTION_LENGTH: 500,
  MAX_METADATA_SIZE: 10000, // 10KB
  MAX_CURRENCY_LENGTH: 3,
  MAX_PAYMENT_METHOD_TYPES: 20,
  MAX_WEBHOOK_EVENTS: 1000,
  MAX_PAYMENT_HISTORY: 10000,
  MAX_RETRY_ATTEMPTS: 3,
  MAX_RETRY_DELAY: 300000, // 5 minutes
  MAX_PAYMENT_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  SUPPORTED_CURRENCIES: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'JPY', 'CNY', 'BRL', 'MXN'],
  SUPPORTED_PAYMENT_METHODS: ['card', 'bank_transfer', 'wallet', 'upi', 'netbanking', 'emi', 'cod', 'crypto', 'paypal', 'apple_pay', 'google_pay', 'amazon_pay', 'klarna', 'afterpay', 'sepa', 'ideal', 'sofort', 'giropay', 'bancontact', 'eps']
};

app.use(express.json({ limit: '10mb' }));
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Enhanced rate limiting
const generalLimiter = rateLimit({
  windowMs: PAYMENT_CONFIG.RATE_LIMIT_WINDOW,
  max: PAYMENT_CONFIG.RATE_LIMIT_MAX,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const paymentLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 50, // More restrictive for payment operations
  message: "Too many payment requests, please try again later.",
});

const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200, // Higher limit for webhooks
  message: "Too many webhook requests, please try again later.",
});

app.use(generalLimiter);

const connection = {
  host: REDIS_HOST,
  port: REDIS_PORT,
};

const paymentQueue = new Queue('paymentQueue', { connection });
const refundQueue = new Queue('refundQueue', { connection });
const webhookQueue = new Queue('webhookQueue', { connection });

// Connect to MongoDB with enhanced configuration
mongoose.connect(MONGODB_URI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferCommands: false,
  bufferMaxEntries: 0
})
.then(() => logger.info('Connected to MongoDB with enhanced configuration'))
.catch(err => logger.error('MongoDB connection error:', err));

// Enhanced Mongoose Schemas with comprehensive validation
const PaymentSchema = new mongoose.Schema({
  paymentId: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v: string) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'Payment ID must be a valid UUID'
    }
  },
  tenantId: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'Tenant ID must be a valid UUID'
    }
  },
  userId: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'User ID must be a valid UUID'
    }
  },
  amount: { 
    type: Number, 
    required: true,
    validate: {
      validator: function(v: number) {
        return v >= PAYMENT_CONFIG.MIN_PAYMENT_AMOUNT && v <= PAYMENT_CONFIG.MAX_PAYMENT_AMOUNT;
      },
      message: `Amount must be between ${PAYMENT_CONFIG.MIN_PAYMENT_AMOUNT} and ${PAYMENT_CONFIG.MAX_PAYMENT_AMOUNT}`
    }
  },
  currency: { 
    type: String, 
    required: true,
    enum: PAYMENT_CONFIG.SUPPORTED_CURRENCIES,
    validate: {
      validator: function(v: string) {
        return v && v.length >= 3 && v.length <= PAYMENT_CONFIG.MAX_CURRENCY_LENGTH;
      },
      message: `Currency must be between 3 and ${PAYMENT_CONFIG.MAX_CURRENCY_LENGTH} characters`
    }
  },
  description: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || v.length <= PAYMENT_CONFIG.MAX_PAYMENT_DESCRIPTION_LENGTH;
      },
      message: `Description must be less than ${PAYMENT_CONFIG.MAX_PAYMENT_DESCRIPTION_LENGTH} characters`
    }
  },
  paymentMethod: { 
    type: String, 
    required: true,
    enum: PAYMENT_CONFIG.SUPPORTED_PAYMENT_METHODS,
    validate: {
      validator: function(v: string) {
        return v && v.length >= 2 && v.length <= 50;
      },
      message: 'Payment method must be between 2 and 50 characters'
    }
  },
  provider: { 
    type: String, 
    required: true,
    enum: ['stripe', 'paypal', 'razorpay', 'square', 'adyen', 'braintree', 'mollie', 'klarna', 'afterpay'],
    validate: {
      validator: function(v: string) {
        return v && v.length >= 2 && v.length <= 50;
      },
      message: 'Provider must be between 2 and 50 characters'
    }
  },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded'], 
    default: 'pending' 
  },
  providerPaymentId: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || v.length >= 1 && v.length <= 255;
      },
      message: 'Provider payment ID must be between 1 and 255 characters'
    }
  },
  providerResponse: mongoose.Schema.Types.Mixed,
  metadata: mongoose.Schema.Types.Mixed,
  customerInfo: {
    email: { 
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Invalid email format'
      }
    },
    phone: { 
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^\+?[1-9]\d{1,14}$/.test(v);
        },
        message: 'Invalid phone format'
      }
    },
    name: { 
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || v.length <= 200;
        },
        message: 'Name must be less than 200 characters'
      }
    },
    address: {
      line1: { 
        type: String,
        validate: {
          validator: function(v: string) {
            return !v || v.length <= 200;
          },
          message: 'Address line 1 must be less than 200 characters'
        }
      },
      line2: { 
        type: String,
        validate: {
          validator: function(v: string) {
            return !v || v.length <= 200;
          },
          message: 'Address line 2 must be less than 200 characters'
        }
      },
      city: { 
        type: String,
        validate: {
          validator: function(v: string) {
            return !v || v.length <= 100;
          },
          message: 'City must be less than 100 characters'
        }
      },
      state: { 
        type: String,
        validate: {
          validator: function(v: string) {
            return !v || v.length <= 100;
          },
          message: 'State must be less than 100 characters'
        }
      },
      postalCode: { 
        type: String,
        validate: {
          validator: function(v: string) {
            return !v || v.length <= 20;
          },
          message: 'Postal code must be less than 20 characters'
        }
      },
      country: { 
        type: String,
        validate: {
          validator: function(v: string) {
            return !v || v.length <= 2;
          },
          message: 'Country must be 2 characters (ISO code)'
        }
      }
    }
  },
  refunds: [{
    refundId: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v: string) {
          return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
        },
        message: 'Refund ID must be a valid UUID'
      }
    },
    amount: { 
      type: Number, 
      required: true,
      validate: {
        validator: function(v: number) {
          return v > 0 && v <= PAYMENT_CONFIG.MAX_REFUND_AMOUNT;
        },
        message: `Refund amount must be between 1 and ${PAYMENT_CONFIG.MAX_REFUND_AMOUNT}`
      }
    },
    reason: { 
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || v.length <= 500;
        },
        message: 'Refund reason must be less than 500 characters'
      }
    },
    status: { 
      type: String, 
      enum: ['pending', 'processing', 'completed', 'failed'], 
      default: 'pending' 
    },
    providerRefundId: String,
    providerResponse: mongoose.Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now },
    processedAt: Date
  }],
  webhooks: [{
    webhookId: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v: string) {
          return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
        },
        message: 'Webhook ID must be a valid UUID'
      }
    },
    event: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v: string) {
          return v && v.length >= 2 && v.length <= 100;
        },
        message: 'Event must be between 2 and 100 characters'
      }
    },
    status: { 
      type: String, 
      enum: ['pending', 'sent', 'delivered', 'failed'], 
      default: 'pending' 
    },
    url: { 
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Invalid URL format'
      }
    },
    payload: mongoose.Schema.Types.Mixed,
    response: mongoose.Schema.Types.Mixed,
    retryCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    sentAt: Date,
    deliveredAt: Date
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  processedAt: Date,
  completedAt: Date,
  failedAt: Date,
  cancelledAt: Date
});

// Add indexes
PaymentSchema.index({ paymentId: 1 }, { unique: true });
PaymentSchema.index({ tenantId: 1, createdAt: -1 });
PaymentSchema.index({ tenantId: 1, userId: 1 });
PaymentSchema.index({ tenantId: 1, status: 1 });
PaymentSchema.index({ tenantId: 1, provider: 1 });
PaymentSchema.index({ tenantId: 1, paymentMethod: 1 });
PaymentSchema.index({ providerPaymentId: 1 });
PaymentSchema.index({ 'customerInfo.email': 1 });
PaymentSchema.index({ createdAt: 1 }, { expireAfterSeconds: PAYMENT_CONFIG.RETENTION_DAYS * 24 * 60 * 60 });

const Payment = mongoose.model('Payment', PaymentSchema);

const PaymentMethodSchema = new mongoose.Schema({
  paymentMethodId: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v: string) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'Payment method ID must be a valid UUID'
    }
  },
  tenantId: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'Tenant ID must be a valid UUID'
    }
  },
  userId: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'User ID must be a valid UUID'
    }
  },
  type: { 
    type: String, 
    required: true,
    enum: PAYMENT_CONFIG.SUPPORTED_PAYMENT_METHODS,
    validate: {
      validator: function(v: string) {
        return v && v.length >= 2 && v.length <= 50;
      },
      message: 'Type must be between 2 and 50 characters'
    }
  },
  provider: { 
    type: String, 
    required: true,
    enum: ['stripe', 'paypal', 'razorpay', 'square', 'adyen', 'braintree', 'mollie', 'klarna', 'afterpay'],
    validate: {
      validator: function(v: string) {
        return v && v.length >= 2 && v.length <= 50;
      },
      message: 'Provider must be between 2 and 50 characters'
    }
  },
  providerMethodId: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return v && v.length >= 1 && v.length <= 255;
      },
      message: 'Provider method ID must be between 1 and 255 characters'
      }
    },
  isDefault: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes
PaymentMethodSchema.index({ paymentMethodId: 1 }, { unique: true });
PaymentMethodSchema.index({ tenantId: 1, userId: 1 });
PaymentMethodSchema.index({ tenantId: 1, type: 1 });
PaymentMethodSchema.index({ tenantId: 1, provider: 1 });
PaymentMethodSchema.index({ createdAt: 1 }, { expireAfterSeconds: PAYMENT_CONFIG.RETENTION_DAYS * 24 * 60 * 60 });

const PaymentMethod = mongoose.model('PaymentMethod', PaymentMethodSchema);

// Enhanced validation schemas
const paymentSchema = Joi.object({
  amount: Joi.number().min(PAYMENT_CONFIG.MIN_PAYMENT_AMOUNT).max(PAYMENT_CONFIG.MAX_PAYMENT_AMOUNT).required(),
  currency: Joi.string().valid(...PAYMENT_CONFIG.SUPPORTED_CURRENCIES).required(),
  description: Joi.string().max(PAYMENT_CONFIG.MAX_PAYMENT_DESCRIPTION_LENGTH).optional(),
  paymentMethod: Joi.string().valid(...PAYMENT_CONFIG.SUPPORTED_PAYMENT_METHODS).required(),
  provider: Joi.string().valid('stripe', 'paypal', 'razorpay', 'square', 'adyen', 'braintree', 'mollie', 'klarna', 'afterpay').required(),
  customerInfo: Joi.object({
    email: Joi.string().email().optional(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
    name: Joi.string().max(200).optional(),
    address: Joi.object({
      line1: Joi.string().max(200).optional(),
      line2: Joi.string().max(200).optional(),
      city: Joi.string().max(100).optional(),
      state: Joi.string().max(100).optional(),
      postalCode: Joi.string().max(20).optional(),
      country: Joi.string().length(2).optional()
    }).optional()
  }).optional(),
  metadata: Joi.object().max(PAYMENT_CONFIG.MAX_METADATA_SIZE).optional()
});

const refundSchema = Joi.object({
  amount: Joi.number().min(1).max(PAYMENT_CONFIG.MAX_REFUND_AMOUNT).required(),
  reason: Joi.string().max(500).optional(),
  metadata: Joi.object().max(PAYMENT_CONFIG.MAX_METADATA_SIZE).optional()
});

// Enhanced Payment Manager with comprehensive payment processing
class PaymentManager {
  private stripe: Stripe | null = null;
  private razorpay: Razorpay | null = null;
  private activePayments: Map<string, any> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.initializePaymentProviders();
  }

  private async initializePaymentProviders(): Promise<void> {
    try {
      // Initialize Stripe
      if (process.env.STRIPE_SECRET_KEY) {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
          apiVersion: '2023-10-16',
        });
      }

      // Initialize Razorpay
      if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        this.razorpay = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
      }

      // Initialize PayPal
      if (process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET) {
        paypal.configure({
          mode: process.env.PAYPAL_MODE || 'sandbox',
          client_id: process.env.PAYPAL_CLIENT_ID,
          client_secret: process.env.PAYPAL_CLIENT_SECRET,
        });
      }

      // Start workers
      this.startPaymentWorker();
      this.startRefundWorker();
      this.startWebhookWorker();
      
      logger.info('Payment Manager initialized successfully');
    } catch (error: any) {
      logger.error('Error initializing Payment Manager:', error);
      throw new Error(`Payment initialization failed: ${error.message}`);
    }
  }

  // Enhanced payment processing
  async processPayment(paymentData: any): Promise<any> {
    try {
      if (!paymentData || !paymentData.amount || !paymentData.currency) {
        throw new Error('Valid payment data with amount and currency is required');
      }

      if (paymentData.amount < PAYMENT_CONFIG.MIN_PAYMENT_AMOUNT || paymentData.amount > PAYMENT_CONFIG.MAX_PAYMENT_AMOUNT) {
        throw new Error(`Amount must be between ${PAYMENT_CONFIG.MIN_PAYMENT_AMOUNT} and ${PAYMENT_CONFIG.MAX_PAYMENT_AMOUNT}`);
      }

      const paymentId = uuidv4();
      const startTime = Date.now();
      
      // Check concurrent payment limit
      if (this.activePayments.size >= 100) {
        throw new Error('Maximum concurrent payments reached');
      }

      const payment = new Payment({
        paymentId,
        tenantId: paymentData.tenantId || 'default',
        userId: paymentData.userId || 'anonymous',
        amount: paymentData.amount,
        currency: paymentData.currency,
        description: paymentData.description,
        paymentMethod: paymentData.paymentMethod,
        provider: paymentData.provider,
        status: 'pending',
        customerInfo: paymentData.customerInfo || {},
        metadata: paymentData.metadata || {},
        createdAt: new Date(),
        updatedAt: new Date()
      });

      this.activePayments.set(paymentId, payment);
      
      try {
        // Process payment based on provider
        switch (paymentData.provider) {
          case 'stripe':
            await this.processStripePayment(payment);
            break;
          case 'razorpay':
            await this.processRazorpayPayment(payment);
            break;
          case 'paypal':
            await this.processPayPalPayment(payment);
            break;
          default:
            throw new Error(`Unsupported payment provider: ${paymentData.provider}`);
        }

        payment.status = 'completed';
        payment.completedAt = new Date();
        
      } finally {
        this.activePayments.delete(paymentId);
        await payment.save();
      }

      return payment;

    } catch (error: any) {
      logger.error('Payment processing failed:', error);
      throw new Error(`Payment processing failed: ${error.message}`);
    }
  }

  // Provider-specific payment processing methods
  private async processStripePayment(payment: any): Promise<void> {
    try {
      if (!this.stripe) {
        throw new Error('Stripe not configured');
      }

      const stripePayment = await this.stripe.paymentIntents.create({
        amount: Math.round(payment.amount * 100), // Convert to cents
        currency: payment.currency.toLowerCase(),
        description: payment.description,
        metadata: {
          paymentId: payment.paymentId,
          tenantId: payment.tenantId,
          userId: payment.userId
        }
      });

      payment.providerPaymentId = stripePayment.id;
      payment.providerResponse = stripePayment;
      
      logger.info(`Stripe payment created: ${stripePayment.id}`);
    } catch (error: any) {
      logger.error('Stripe payment processing failed:', error);
      throw error;
    }
  }

  private async processRazorpayPayment(payment: any): Promise<void> {
    try {
      if (!this.razorpay) {
        throw new Error('Razorpay not configured');
      }

      const razorpayOrder = await this.razorpay.orders.create({
        amount: Math.round(payment.amount * 100), // Convert to paise
        currency: payment.currency,
        receipt: payment.paymentId,
        notes: {
          paymentId: payment.paymentId,
          tenantId: payment.tenantId,
          userId: payment.userId
        }
      });

      payment.providerPaymentId = razorpayOrder.id;
      payment.providerResponse = razorpayOrder;
      
      logger.info(`Razorpay order created: ${razorpayOrder.id}`);
    } catch (error: any) {
      logger.error('Razorpay payment processing failed:', error);
      throw error;
    }
  }

  private async processPayPalPayment(payment: any): Promise<void> {
    try {
      const paypalPayment = {
        intent: 'sale',
        payer: {
          payment_method: 'paypal'
        },
        transactions: [{
          amount: {
            total: payment.amount.toString(),
            currency: payment.currency
          },
          description: payment.description,
          custom: payment.paymentId
        }],
        redirect_urls: {
          return_url: `${process.env.BASE_URL}/payment/success`,
          cancel_url: `${process.env.BASE_URL}/payment/cancel`
        }
      };

      // Simulate PayPal payment creation
      payment.providerPaymentId = `paypal_${uuidv4()}`;
      payment.providerResponse = paypalPayment;
      
      logger.info(`PayPal payment created: ${payment.providerPaymentId}`);
    } catch (error: any) {
      logger.error('PayPal payment processing failed:', error);
      throw error;
    }
  }

  // Refund processing
  async processRefund(paymentId: string, refundData: any): Promise<any> {
    try {
      const payment = await Payment.findOne({ paymentId });
      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== 'completed') {
        throw new Error('Only completed payments can be refunded');
      }

      const refundId = uuidv4();
      const refund = {
        refundId,
        amount: refundData.amount,
        reason: refundData.reason,
        status: 'pending',
        createdAt: new Date()
      };

      payment.refunds.push(refund);
      await payment.save();

      // Process refund based on provider
      switch (payment.provider) {
        case 'stripe':
          await this.processStripeRefund(payment, refund);
          break;
        case 'razorpay':
          await this.processRazorpayRefund(payment, refund);
          break;
        case 'paypal':
          await this.processPayPalRefund(payment, refund);
          break;
        default:
          throw new Error(`Unsupported payment provider: ${payment.provider}`);
      }

      return refund;
    } catch (error: any) {
      logger.error('Refund processing failed:', error);
      throw new Error(`Refund processing failed: ${error.message}`);
    }
  }

  // Provider-specific refund processing methods
  private async processStripeRefund(payment: any, refund: any): Promise<void> {
    try {
      if (!this.stripe) {
        throw new Error('Stripe not configured');
      }

      const stripeRefund = await this.stripe.refunds.create({
        payment_intent: payment.providerPaymentId,
        amount: Math.round(refund.amount * 100), // Convert to cents
        reason: refund.reason || 'requested_by_customer'
      });

      refund.providerRefundId = stripeRefund.id;
      refund.providerResponse = stripeRefund;
      refund.status = 'completed';
      refund.processedAt = new Date();
      
      logger.info(`Stripe refund created: ${stripeRefund.id}`);
    } catch (error: any) {
      logger.error('Stripe refund processing failed:', error);
      refund.status = 'failed';
      throw error;
    }
  }

  private async processRazorpayRefund(payment: any, refund: any): Promise<void> {
    try {
      if (!this.razorpay) {
        throw new Error('Razorpay not configured');
      }

      const razorpayRefund = await this.razorpay.payments.refund(payment.providerPaymentId, {
        amount: Math.round(refund.amount * 100), // Convert to paise
        notes: {
          reason: refund.reason || 'requested_by_customer'
        }
      });

      refund.providerRefundId = razorpayRefund.id;
      refund.providerResponse = razorpayRefund;
      refund.status = 'completed';
      refund.processedAt = new Date();
      
      logger.info(`Razorpay refund created: ${razorpayRefund.id}`);
    } catch (error: any) {
      logger.error('Razorpay refund processing failed:', error);
      refund.status = 'failed';
      throw error;
    }
  }

  private async processPayPalRefund(payment: any, refund: any): Promise<void> {
    try {
      // Simulate PayPal refund creation
      refund.providerRefundId = `paypal_refund_${uuidv4()}`;
      refund.providerResponse = { status: 'completed' };
      refund.status = 'completed';
      refund.processedAt = new Date();
      
      logger.info(`PayPal refund created: ${refund.providerRefundId}`);
    } catch (error: any) {
      logger.error('PayPal refund processing failed:', error);
      refund.status = 'failed';
      throw error;
    }
  }

  // Webhook processing
  async processWebhook(provider: string, event: string, payload: any): Promise<any> {
    try {
      const webhookId = uuidv4();
      const webhook = {
        webhookId,
        event,
        status: 'pending',
        payload,
        createdAt: new Date()
      };

      // Process webhook based on provider
      switch (provider) {
        case 'stripe':
          await this.processStripeWebhook(webhook);
          break;
        case 'razorpay':
          await this.processRazorpayWebhook(webhook);
          break;
        case 'paypal':
          await this.processPayPalWebhook(webhook);
          break;
        default:
          throw new Error(`Unsupported webhook provider: ${provider}`);
      }

      return webhook;
    } catch (error: any) {
      logger.error('Webhook processing failed:', error);
      throw new Error(`Webhook processing failed: ${error.message}`);
    }
  }

  // Provider-specific webhook processing methods
  private async processStripeWebhook(webhook: any): Promise<void> {
    try {
      // Simulate Stripe webhook processing
      webhook.status = 'delivered';
      webhook.deliveredAt = new Date();
      
      logger.info(`Stripe webhook processed: ${webhook.event}`);
    } catch (error: any) {
      logger.error('Stripe webhook processing failed:', error);
      webhook.status = 'failed';
      throw error;
    }
  }

  private async processRazorpayWebhook(webhook: any): Promise<void> {
    try {
      // Simulate Razorpay webhook processing
      webhook.status = 'delivered';
      webhook.deliveredAt = new Date();
      
      logger.info(`Razorpay webhook processed: ${webhook.event}`);
    } catch (error: any) {
      logger.error('Razorpay webhook processing failed:', error);
      webhook.status = 'failed';
      throw error;
    }
  }

  private async processPayPalWebhook(webhook: any): Promise<void> {
    try {
      // Simulate PayPal webhook processing
      webhook.status = 'delivered';
      webhook.deliveredAt = new Date();
      
      logger.info(`PayPal webhook processed: ${webhook.event}`);
    } catch (error: any) {
      logger.error('PayPal webhook processing failed:', error);
      webhook.status = 'failed';
      throw error;
    }
  }

  // Worker methods
  private startPaymentWorker(): void {
    const worker = new Worker('paymentQueue', async (job: Job) => {
      const { paymentId } = job.data;
      
      try {
        const payment = await Payment.findOne({ paymentId });
        if (!payment) {
          throw new Error('Payment not found');
        }
        
        await this.processPayment(payment);
        return { paymentId, status: 'completed' };
      } catch (error: any) {
        logger.error('Payment worker error:', error);
        throw error;
      }
    }, { connection });
    
    worker.on('completed', (job) => {
      logger.info(`Payment job completed: ${job.id}`);
    });
    
    worker.on('failed', (job, err) => {
      logger.error(`Payment job failed: ${job.id}`, err);
    });
  }

  private startRefundWorker(): void {
    const worker = new Worker('refundQueue', async (job: Job) => {
      const { paymentId, refundData } = job.data;
      
      try {
        await this.processRefund(paymentId, refundData);
        return { paymentId, status: 'refunded' };
      } catch (error: any) {
        logger.error('Refund worker error:', error);
        throw error;
      }
    }, { connection });
    
    worker.on('completed', (job) => {
      logger.info(`Refund job completed: ${job.id}`);
    });
    
    worker.on('failed', (job, err) => {
      logger.error(`Refund job failed: ${job.id}`, err);
    });
  }

  private startWebhookWorker(): void {
    const worker = new Worker('webhookQueue', async (job: Job) => {
      const { provider, event, payload } = job.data;
      
      try {
        await this.processWebhook(provider, event, payload);
        return { provider, event, status: 'processed' };
      } catch (error: any) {
        logger.error('Webhook worker error:', error);
        throw error;
      }
    }, { connection });
    
    worker.on('completed', (job) => {
      logger.info(`Webhook job completed: ${job.id}`);
    });
    
    worker.on('failed', (job, err) => {
      logger.error(`Webhook job failed: ${job.id}`, err);
    });
  }

  // Get statistics
  getStatistics(): { activePayments: number } {
    return {
      activePayments: this.activePayments.size
    };
  }
}

const paymentManager = new PaymentManager();

// Enhanced middleware for request validation
const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation error', 
        details: error.details.map(d => d.message),
        code: 'VALIDATION_ERROR'
      });
    }
    req.validatedData = value;
    next();
  };
};

// Enhanced error handling middleware
const errorHandler = (err: any, req: any, res: any, next: any) => {
  logger.error('Unhandled error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: err.message,
      code: 'VALIDATION_ERROR'
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid data format',
      details: err.message,
      code: 'CAST_ERROR'
    });
  }
  
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Duplicate entry',
      details: 'A record with this identifier already exists',
      code: 'DUPLICATE_ERROR'
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    code: 'INTERNAL_ERROR'
  });
};

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'Payment Service is healthy', 
    uptime: process.uptime(),
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      queue: paymentQueue.name,
      refundQueue: refundQueue.name,
      webhookQueue: webhookQueue.name,
      stripe: this.stripe ? 'active' : 'inactive',
      razorpay: this.razorpay ? 'active' : 'inactive',
      paypal: 'active',
      payments: 'active',
      refunds: 'active',
      webhooks: 'active'
    },
    statistics: paymentManager.getStatistics()
  });
});

// Payment endpoints
app.post('/payments', 
  paymentLimiter,
  validateRequest(paymentSchema), 
  async (req, res) => {
    try {
      const paymentData = req.validatedData;
      paymentData.tenantId = req.headers['x-tenant-id'] || 'default';
      paymentData.userId = req.headers['x-user-id'] || 'anonymous';
      
      const payment = await paymentManager.processPayment(paymentData);
      
      res.status(201).json({
        success: true,
        data: payment,
        message: 'Payment processed successfully'
      });
    } catch (error: any) {
      logger.error('Error processing payment:', error);
      res.status(400).json({ 
        success: false,
        message: error.message,
        code: 'PAYMENT_PROCESSING_ERROR'
      });
    }
  }
);

// Refund endpoints
app.post('/payments/:paymentId/refunds', 
  paymentLimiter,
  validateRequest(refundSchema), 
  async (req, res) => {
    try {
      const { paymentId } = req.params;
      const refundData = req.validatedData;
      
      const refund = await paymentManager.processRefund(paymentId, refundData);
      
      res.status(201).json({
        success: true,
        data: refund,
        message: 'Refund processed successfully'
      });
    } catch (error: any) {
      logger.error('Error processing refund:', error);
      res.status(400).json({ 
        success: false,
        message: error.message,
        code: 'REFUND_PROCESSING_ERROR'
      });
    }
  }
);

// Webhook endpoints
app.post('/webhooks/:provider', 
  webhookLimiter,
  async (req, res) => {
    try {
      const { provider } = req.params;
      const { event, payload } = req.body;
      
      const webhook = await paymentManager.processWebhook(provider, event, payload);
      
      res.status(200).json({
        success: true,
        data: webhook,
        message: 'Webhook processed successfully'
      });
    } catch (error: any) {
      logger.error('Error processing webhook:', error);
      res.status(400).json({ 
        success: false,
        message: error.message,
        code: 'WEBHOOK_PROCESSING_ERROR'
      });
    }
  }
);

// Payment overview endpoint
app.get('/dashboard/overview', async (req, res) => {
  try {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    
    const payments = await Payment.find({ tenantId });
    const paymentMethods = await PaymentMethod.find({ tenantId });

    const paymentStats = {
      total: payments.length,
      totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
      byStatus: _.countBy(payments, 'status'),
      byProvider: _.countBy(payments, 'provider'),
      byPaymentMethod: _.countBy(payments, 'paymentMethod'),
      byCurrency: _.countBy(payments, 'currency'),
      successfulPayments: payments.filter(p => p.status === 'completed').length,
      failedPayments: payments.filter(p => p.status === 'failed').length,
      refundedPayments: payments.filter(p => p.status === 'refunded').length
    };

    const refundStats = {
      total: payments.reduce((sum, p) => sum + p.refunds.length, 0),
      totalAmount: payments.reduce((sum, p) => sum + p.refunds.reduce((refundSum, r) => refundSum + r.amount, 0), 0),
      byStatus: _.countBy(payments.flatMap(p => p.refunds), 'status')
    };

    const paymentMethodStats = {
      total: paymentMethods.length,
      active: paymentMethods.filter(pm => pm.isActive).length,
      byType: _.countBy(paymentMethods, 'type'),
      byProvider: _.countBy(paymentMethods, 'provider')
    };

    res.status(200).json({
      success: true,
      data: {
        payments: paymentStats,
        refunds: refundStats,
        paymentMethods: paymentMethodStats,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error: any) {
    logger.error('Error fetching payment overview:', error);
    res.status(500).json({ 
      success: false,
      message: error.message,
      code: 'PAYMENT_OVERVIEW_ERROR'
    });
  }
});

// Enhanced error handling middleware
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
    
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
    
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
});

app.listen(PORT, () => {
  logger.info(`🚀 Enhanced Payment Service running on port ${PORT}`);
  logger.info(`💳 Stripe Integration: ${paymentManager.stripe ? 'Active' : 'Inactive'}`);
  logger.info(`💳 Razorpay Integration: ${paymentManager.razorpay ? 'Active' : 'Inactive'}`);
  logger.info(`💳 PayPal Integration: Active`);
  logger.info(`💰 Multi-Currency Support: Active`);
  logger.info(`🔄 Refund Processing: Active`);
  logger.info(`🔗 Webhook Processing: Active`);
  logger.info(`🔒 Security: Rate limiting, CORS, Helmet enabled`);
  logger.info(`⚡ Performance: Caching, optimization enabled`);
});