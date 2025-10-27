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
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { Client as WhatsAppClient } from 'whatsapp-web.js';
import admin from 'firebase-admin';
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
  defaultMeta: { service: 'notification-service' },
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
  process.env.DATABASE_URL || 'postgresql://localhost:5432/studyspot_notifications',
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

// External service configurations
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_...');
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_...',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_...'
});

paypal.configure({
  mode: process.env.PAYPAL_MODE || 'sandbox',
  client_id: process.env.PAYPAL_CLIENT_ID || 'your-paypal-client-id',
  client_secret: process.env.PAYPAL_CLIENT_SECRET || 'your-paypal-client-secret'
});

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID || 'your-twilio-account-sid',
  process.env.TWILIO_AUTH_TOKEN || 'your-twilio-auth-token'
);

// Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}

// Notification Service Models and Interfaces
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'promotion' | 'reminder' | 'alert' | 'custom';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'system' | 'user' | 'marketing' | 'transaction' | 'security' | 'event' | 'custom';
  channels: ('email' | 'sms' | 'push' | 'in-app' | 'webhook' | 'whatsapp')[];
  recipients: {
    userIds?: string[];
    emails?: string[];
    phones?: string[];
    tags?: string[];
    segments?: string[];
  };
  content: {
    subject?: string;
    body: string;
    htmlBody?: string;
    attachments?: string[];
    images?: string[];
    links?: {
      text: string;
      url: string;
      action?: string;
    }[];
  };
  schedule: {
    sendAt?: Date;
    timezone: string;
    recurring?: {
      frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
      interval: number;
      endDate?: Date;
    };
  };
  delivery: {
    status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'delivered' | 'failed' | 'cancelled';
    sentAt?: Date;
    deliveredAt?: Date;
    failedAt?: Date;
    retryCount: number;
    maxRetries: number;
  };
  tracking: {
    opened: number;
    clicked: number;
    unsubscribed: number;
    bounced: number;
    complaints: number;
  };
  metadata: {
    campaignId?: string;
    templateId?: string;
    customFields: Record<string, any>;
  };
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface NotificationTemplate {
  id: string;
  name: string;
  description: string;
  type: 'email' | 'sms' | 'push' | 'in-app' | 'webhook' | 'whatsapp';
  category: 'system' | 'user' | 'marketing' | 'transaction' | 'security' | 'event' | 'custom';
  subject?: string;
  body: string;
  htmlBody?: string;
  variables: string[];
  isActive: boolean;
  metadata: {
    createdBy: string;
    customFields: Record<string, any>;
  };
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface NotificationCampaign {
  id: string;
  name: string;
  description: string;
  type: 'broadcast' | 'targeted' | 'automated' | 'transactional' | 'marketing';
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled';
  notifications: string[];
  targetAudience: {
    criteria: Record<string, any>;
    count: number;
  };
  schedule: {
    startDate: Date;
    endDate?: Date;
    frequency: 'once' | 'daily' | 'weekly' | 'monthly';
    timezone: string;
  };
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    unsubscribed: number;
    bounced: number;
    complaints: number;
  };
  metadata: {
    createdBy: string;
    customFields: Record<string, any>;
  };
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface NotificationSubscription {
  id: string;
  userId: string;
  channels: {
    email: boolean;
    sms: boolean;
    push: boolean;
    inApp: boolean;
    whatsapp: boolean;
  };
  categories: {
    system: boolean;
    user: boolean;
    marketing: boolean;
    transaction: boolean;
    security: boolean;
    event: boolean;
    custom: boolean;
  };
  preferences: {
    frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
      timezone: string;
    };
    language: string;
  };
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface NotificationDelivery {
  id: string;
  notificationId: string;
  userId?: string;
  email?: string;
  phone?: string;
  channel: 'email' | 'sms' | 'push' | 'in-app' | 'webhook' | 'whatsapp';
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced' | 'unsubscribed';
  sentAt?: Date;
  deliveredAt?: Date;
  failedAt?: Date;
  errorMessage?: string;
  tracking: {
    opened: boolean;
    openedAt?: Date;
    clicked: boolean;
    clickedAt?: Date;
    clickedLinks: string[];
  };
  metadata: {
    deviceInfo?: Record<string, any>;
    customFields: Record<string, any>;
  };
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface NotificationAnalytics {
  id: string;
  notificationId?: string;
  campaignId?: string;
  metric: string;
  value: number;
  unit: string;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  date: Date;
  tenantId: string;
  createdAt: Date;
}

// In-memory storage for demo (replace with database in production)
const notifications: Notification[] = [];
const notificationTemplates: NotificationTemplate[] = [];
const notificationCampaigns: NotificationCampaign[] = [];
const notificationSubscriptions: NotificationSubscription[] = [];
const notificationDeliveries: NotificationDelivery[] = [];
const notificationAnalytics: NotificationAnalytics[] = [];

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
const validateNotification = [
  body('title').notEmpty().withMessage('Notification title is required'),
  body('message').notEmpty().withMessage('Notification message is required'),
  body('type').isIn(['info', 'success', 'warning', 'error', 'promotion', 'reminder', 'alert', 'custom']).withMessage('Invalid notification type'),
  body('priority').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('category').isIn(['system', 'user', 'marketing', 'transaction', 'security', 'event', 'custom']).withMessage('Invalid category'),
  body('channels').isArray().withMessage('Channels must be an array'),
  body('recipients').isObject().withMessage('Recipients must be an object')
];

const validateNotificationTemplate = [
  body('name').notEmpty().withMessage('Template name is required'),
  body('type').isIn(['email', 'sms', 'push', 'in-app', 'webhook', 'whatsapp']).withMessage('Invalid template type'),
  body('category').isIn(['system', 'user', 'marketing', 'transaction', 'security', 'event', 'custom']).withMessage('Invalid category'),
  body('body').notEmpty().withMessage('Template body is required'),
  body('variables').isArray().withMessage('Variables must be an array')
];

const validateNotificationCampaign = [
  body('name').notEmpty().withMessage('Campaign name is required'),
  body('type').isIn(['broadcast', 'targeted', 'automated', 'transactional', 'marketing']).withMessage('Invalid campaign type'),
  body('status').isIn(['draft', 'scheduled', 'running', 'paused', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('notifications').isArray().withMessage('Notifications must be an array'),
  body('targetAudience').isObject().withMessage('Target audience must be an object'),
  body('schedule').isObject().withMessage('Schedule must be an object')
];

const validateNotificationSubscription = [
  body('userId').isUUID().withMessage('Valid user ID is required'),
  body('channels').isObject().withMessage('Channels must be an object'),
  body('categories').isObject().withMessage('Categories must be an object'),
  body('preferences').isObject().withMessage('Preferences must be an object')
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
    message: 'Notification Service is healthy',
    timestamp: new Date().toISOString(),
    notifications: notifications.length,
    templates: notificationTemplates.length,
    campaigns: notificationCampaigns.length,
    subscriptions: notificationSubscriptions.length,
    deliveries: notificationDeliveries.length,
    analytics: notificationAnalytics.length,
    connectedClients: io.engine.clientsCount
  });
});

// ============================================
// NOTIFICATION MANAGEMENT ROUTES
// ============================================

/**
 * @route   POST /api/notifications
 * @desc    Create a new notification
 * @access  Private
 */
app.post('/api/notifications', authenticateToken, validateNotification, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { title, message, type, priority, category, channels, recipients, content, schedule, metadata } = req.body;
    
    const notification: Notification = {
      id: uuidv4(),
      title,
      message,
      type,
      priority,
      category,
      channels,
      recipients,
      content: content || { body: message },
      schedule: schedule || {
        timezone: 'UTC'
      },
      delivery: {
        status: 'draft',
        retryCount: 0,
        maxRetries: 3
      },
      tracking: {
        opened: 0,
        clicked: 0,
        unsubscribed: 0,
        bounced: 0,
        complaints: 0
      },
      metadata: {
        customFields: metadata?.customFields || {}
      },
      tenantId: req.user.tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    notifications.push(notification);

    logger.info(`Notification created: ${notification.id}`);
    
    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: { notification }
    });
  } catch (error) {
    logger.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification'
    });
  }
});

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications for a tenant
 * @access  Private
 */
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const { type, priority, category, status, limit = 50, offset = 0 } = req.query;
    
    let tenantNotifications = notifications.filter(notification => notification.tenantId === req.user.tenantId);
    
    // Apply filters
    if (type) {
      tenantNotifications = tenantNotifications.filter(notification => notification.type === type);
    }
    if (priority) {
      tenantNotifications = tenantNotifications.filter(notification => notification.priority === priority);
    }
    if (category) {
      tenantNotifications = tenantNotifications.filter(notification => notification.category === category);
    }
    if (status) {
      tenantNotifications = tenantNotifications.filter(notification => notification.delivery.status === status);
    }
    
    // Sort by creation date
    tenantNotifications = tenantNotifications
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));
    
    res.json({
      success: true,
      data: { notifications: tenantNotifications },
      count: tenantNotifications.length,
      total: notifications.filter(notification => notification.tenantId === req.user.tenantId).length
    });
  } catch (error) {
    logger.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

/**
 * @route   POST /api/notifications/:id/send
 * @desc    Send a notification
 * @access  Private
 */
app.post('/api/notifications/:id/send', authenticateToken, async (req, res) => {
  try {
    const notification = notifications.find(
      n => n.id === req.params.id && n.tenantId === req.user.tenantId
    );
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    if (notification.delivery.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Notification has already been sent or is in progress'
      });
    }

    // Update notification status
    notification.delivery.status = 'sending';
    notification.delivery.sentAt = new Date();
    notification.updatedAt = new Date();

    // Send notification
    await sendNotification(notification);

    logger.info(`Notification sent: ${notification.id}`);
    
    res.json({
      success: true,
      message: 'Notification sent successfully',
      data: { notification }
    });
  } catch (error) {
    logger.error('Error sending notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification',
      error: error.message
    });
  }
});

// ============================================
// NOTIFICATION TEMPLATE ROUTES
// ============================================

/**
 * @route   POST /api/notifications/templates
 * @desc    Create a new notification template
 * @access  Private
 */
app.post('/api/notifications/templates', authenticateToken, validateNotificationTemplate, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { name, description, type, category, subject, body, htmlBody, variables, metadata } = req.body;
    
    const template: NotificationTemplate = {
      id: uuidv4(),
      name,
      description: description || '',
      type,
      category,
      subject,
      body,
      htmlBody,
      variables: variables || [],
      isActive: true,
      metadata: {
        createdBy: req.user.id,
        customFields: metadata?.customFields || {}
      },
      tenantId: req.user.tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    notificationTemplates.push(template);

    logger.info(`Notification template created: ${template.id}`);
    
    res.status(201).json({
      success: true,
      message: 'Notification template created successfully',
      data: { template }
    });
  } catch (error) {
    logger.error('Error creating notification template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification template'
    });
  }
});

/**
 * @route   GET /api/notifications/templates
 * @desc    Get all notification templates for a tenant
 * @access  Private
 */
app.get('/api/notifications/templates', authenticateToken, async (req, res) => {
  try {
    const { type, category, isActive, limit = 50, offset = 0 } = req.query;
    
    let tenantTemplates = notificationTemplates.filter(template => template.tenantId === req.user.tenantId);
    
    // Apply filters
    if (type) {
      tenantTemplates = tenantTemplates.filter(template => template.type === type);
    }
    if (category) {
      tenantTemplates = tenantTemplates.filter(template => template.category === category);
    }
    if (isActive !== undefined) {
      tenantTemplates = tenantTemplates.filter(template => template.isActive === (isActive === 'true'));
    }
    
    // Sort by creation date
    tenantTemplates = tenantTemplates
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));
    
    res.json({
      success: true,
      data: { templates: tenantTemplates },
      count: tenantTemplates.length,
      total: notificationTemplates.filter(template => template.tenantId === req.user.tenantId).length
    });
  } catch (error) {
    logger.error('Error fetching notification templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification templates'
    });
  }
});

// ============================================
// NOTIFICATION CAMPAIGN ROUTES
// ============================================

/**
 * @route   POST /api/notifications/campaigns
 * @desc    Create a new notification campaign
 * @access  Private
 */
app.post('/api/notifications/campaigns', authenticateToken, validateNotificationCampaign, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { name, description, type, status, notifications, targetAudience, schedule, metadata } = req.body;
    
    const campaign: NotificationCampaign = {
      id: uuidv4(),
      name,
      description: description || '',
      type,
      status: status || 'draft',
      notifications: notifications || [],
      targetAudience,
      schedule,
      metrics: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        unsubscribed: 0,
        bounced: 0,
        complaints: 0
      },
      metadata: {
        createdBy: req.user.id,
        customFields: metadata?.customFields || {}
      },
      tenantId: req.user.tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    notificationCampaigns.push(campaign);

    logger.info(`Notification campaign created: ${campaign.id}`);
    
    res.status(201).json({
      success: true,
      message: 'Notification campaign created successfully',
      data: { campaign }
    });
  } catch (error) {
    logger.error('Error creating notification campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification campaign'
    });
  }
});

/**
 * @route   GET /api/notifications/campaigns
 * @desc    Get all notification campaigns for a tenant
 * @access  Private
 */
app.get('/api/notifications/campaigns', authenticateToken, async (req, res) => {
  try {
    const { type, status, limit = 50, offset = 0 } = req.query;
    
    let tenantCampaigns = notificationCampaigns.filter(campaign => campaign.tenantId === req.user.tenantId);
    
    // Apply filters
    if (type) {
      tenantCampaigns = tenantCampaigns.filter(campaign => campaign.type === type);
    }
    if (status) {
      tenantCampaigns = tenantCampaigns.filter(campaign => campaign.status === status);
    }
    
    // Sort by creation date
    tenantCampaigns = tenantCampaigns
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));
    
    res.json({
      success: true,
      data: { campaigns: tenantCampaigns },
      count: tenantCampaigns.length,
      total: notificationCampaigns.filter(campaign => campaign.tenantId === req.user.tenantId).length
    });
  } catch (error) {
    logger.error('Error fetching notification campaigns:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification campaigns'
    });
  }
});

// ============================================
// NOTIFICATION SUBSCRIPTION ROUTES
// ============================================

/**
 * @route   POST /api/notifications/subscriptions
 * @desc    Create or update notification subscription
 * @access  Private
 */
app.post('/api/notifications/subscriptions', authenticateToken, validateNotificationSubscription, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { userId, channels, categories, preferences } = req.body;
    
    // Check if subscription already exists
    const existingSubscription = notificationSubscriptions.find(
      sub => sub.userId === userId && sub.tenantId === req.user.tenantId
    );
    
    if (existingSubscription) {
      // Update existing subscription
      existingSubscription.channels = channels;
      existingSubscription.categories = categories;
      existingSubscription.preferences = preferences;
      existingSubscription.updatedAt = new Date();
      
      logger.info(`Notification subscription updated: ${existingSubscription.id}`);
      
      res.json({
        success: true,
        message: 'Notification subscription updated successfully',
        data: { subscription: existingSubscription }
      });
    } else {
      // Create new subscription
      const subscription: NotificationSubscription = {
        id: uuidv4(),
        userId,
        channels,
        categories,
        preferences,
        tenantId: req.user.tenantId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      notificationSubscriptions.push(subscription);

      logger.info(`Notification subscription created: ${subscription.id}`);
      
      res.status(201).json({
        success: true,
        message: 'Notification subscription created successfully',
        data: { subscription }
      });
    }
  } catch (error) {
    logger.error('Error managing notification subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to manage notification subscription'
    });
  }
});

/**
 * @route   GET /api/notifications/subscriptions/:userId
 * @desc    Get notification subscription for a user
 * @access  Private
 */
app.get('/api/notifications/subscriptions/:userId', authenticateToken, async (req, res) => {
  try {
    const subscription = notificationSubscriptions.find(
      sub => sub.userId === req.params.userId && sub.tenantId === req.user.tenantId
    );
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Notification subscription not found'
      });
    }
    
    res.json({
      success: true,
      data: { subscription }
    });
  } catch (error) {
    logger.error('Error fetching notification subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification subscription'
    });
  }
});

// ============================================
// NOTIFICATION ANALYTICS ROUTES
// ============================================

/**
 * @route   GET /api/notifications/analytics/dashboard
 * @desc    Get notification analytics dashboard
 * @access  Private
 */
app.get('/api/notifications/analytics/dashboard', authenticateToken, async (req, res) => {
  try {
    const tenantNotifications = notifications.filter(notification => notification.tenantId === req.user.tenantId);
    const tenantTemplates = notificationTemplates.filter(template => template.tenantId === req.user.tenantId);
    const tenantCampaigns = notificationCampaigns.filter(campaign => campaign.tenantId === req.user.tenantId);
    const tenantSubscriptions = notificationSubscriptions.filter(subscription => subscription.tenantId === req.user.tenantId);
    const tenantDeliveries = notificationDeliveries.filter(delivery => delivery.tenantId === req.user.tenantId);

    // Notification analytics
    const notificationStats = {
      total: tenantNotifications.length,
      byType: {
        info: tenantNotifications.filter(n => n.type === 'info').length,
        success: tenantNotifications.filter(n => n.type === 'success').length,
        warning: tenantNotifications.filter(n => n.type === 'warning').length,
        error: tenantNotifications.filter(n => n.type === 'error').length,
        promotion: tenantNotifications.filter(n => n.type === 'promotion').length,
        reminder: tenantNotifications.filter(n => n.type === 'reminder').length,
        alert: tenantNotifications.filter(n => n.type === 'alert').length,
        custom: tenantNotifications.filter(n => n.type === 'custom').length
      },
      byPriority: {
        low: tenantNotifications.filter(n => n.priority === 'low').length,
        medium: tenantNotifications.filter(n => n.priority === 'medium').length,
        high: tenantNotifications.filter(n => n.priority === 'high').length,
        urgent: tenantNotifications.filter(n => n.priority === 'urgent').length
      },
      byCategory: {
        system: tenantNotifications.filter(n => n.category === 'system').length,
        user: tenantNotifications.filter(n => n.category === 'user').length,
        marketing: tenantNotifications.filter(n => n.category === 'marketing').length,
        transaction: tenantNotifications.filter(n => n.category === 'transaction').length,
        security: tenantNotifications.filter(n => n.category === 'security').length,
        event: tenantNotifications.filter(n => n.category === 'event').length,
        custom: tenantNotifications.filter(n => n.category === 'custom').length
      },
      byStatus: {
        draft: tenantNotifications.filter(n => n.delivery.status === 'draft').length,
        scheduled: tenantNotifications.filter(n => n.delivery.status === 'scheduled').length,
        sending: tenantNotifications.filter(n => n.delivery.status === 'sending').length,
        sent: tenantNotifications.filter(n => n.delivery.status === 'sent').length,
        delivered: tenantNotifications.filter(n => n.delivery.status === 'delivered').length,
        failed: tenantNotifications.filter(n => n.delivery.status === 'failed').length,
        cancelled: tenantNotifications.filter(n => n.delivery.status === 'cancelled').length
      },
      totalOpened: tenantNotifications.reduce((sum, n) => sum + n.tracking.opened, 0),
      totalClicked: tenantNotifications.reduce((sum, n) => sum + n.tracking.clicked, 0),
      totalUnsubscribed: tenantNotifications.reduce((sum, n) => sum + n.tracking.unsubscribed, 0),
      totalBounced: tenantNotifications.reduce((sum, n) => sum + n.tracking.bounced, 0),
      totalComplaints: tenantNotifications.reduce((sum, n) => sum + n.tracking.complaints, 0)
    };

    // Template analytics
    const templateStats = {
      total: tenantTemplates.length,
      active: tenantTemplates.filter(t => t.isActive).length,
      inactive: tenantTemplates.filter(t => !t.isActive).length,
      byType: {
        email: tenantTemplates.filter(t => t.type === 'email').length,
        sms: tenantTemplates.filter(t => t.type === 'sms').length,
        push: tenantTemplates.filter(t => t.type === 'push').length,
        inApp: tenantTemplates.filter(t => t.type === 'in-app').length,
        webhook: tenantTemplates.filter(t => t.type === 'webhook').length,
        whatsapp: tenantTemplates.filter(t => t.type === 'whatsapp').length
      },
      byCategory: {
        system: tenantTemplates.filter(t => t.category === 'system').length,
        user: tenantTemplates.filter(t => t.category === 'user').length,
        marketing: tenantTemplates.filter(t => t.category === 'marketing').length,
        transaction: tenantTemplates.filter(t => t.category === 'transaction').length,
        security: tenantTemplates.filter(t => t.category === 'security').length,
        event: tenantTemplates.filter(t => t.category === 'event').length,
        custom: tenantTemplates.filter(t => t.category === 'custom').length
      }
    };

    // Campaign analytics
    const campaignStats = {
      total: tenantCampaigns.length,
      byType: {
        broadcast: tenantCampaigns.filter(c => c.type === 'broadcast').length,
        targeted: tenantCampaigns.filter(c => c.type === 'targeted').length,
        automated: tenantCampaigns.filter(c => c.type === 'automated').length,
        transactional: tenantCampaigns.filter(c => c.type === 'transactional').length,
        marketing: tenantCampaigns.filter(c => c.type === 'marketing').length
      },
      byStatus: {
        draft: tenantCampaigns.filter(c => c.status === 'draft').length,
        scheduled: tenantCampaigns.filter(c => c.status === 'scheduled').length,
        running: tenantCampaigns.filter(c => c.status === 'running').length,
        paused: tenantCampaigns.filter(c => c.status === 'paused').length,
        completed: tenantCampaigns.filter(c => c.status === 'completed').length,
        cancelled: tenantCampaigns.filter(c => c.status === 'cancelled').length
      },
      totalSent: tenantCampaigns.reduce((sum, c) => sum + c.metrics.sent, 0),
      totalDelivered: tenantCampaigns.reduce((sum, c) => sum + c.metrics.delivered, 0),
      totalOpened: tenantCampaigns.reduce((sum, c) => sum + c.metrics.opened, 0),
      totalClicked: tenantCampaigns.reduce((sum, c) => sum + c.metrics.clicked, 0),
      totalUnsubscribed: tenantCampaigns.reduce((sum, c) => sum + c.metrics.unsubscribed, 0),
      totalBounced: tenantCampaigns.reduce((sum, c) => sum + c.metrics.bounced, 0),
      totalComplaints: tenantCampaigns.reduce((sum, c) => sum + c.metrics.complaints, 0)
    };

    // Subscription analytics
    const subscriptionStats = {
      total: tenantSubscriptions.length,
      byChannel: {
        email: tenantSubscriptions.filter(s => s.channels.email).length,
        sms: tenantSubscriptions.filter(s => s.channels.sms).length,
        push: tenantSubscriptions.filter(s => s.channels.push).length,
        inApp: tenantSubscriptions.filter(s => s.channels.inApp).length,
        whatsapp: tenantSubscriptions.filter(s => s.channels.whatsapp).length
      },
      byCategory: {
        system: tenantSubscriptions.filter(s => s.categories.system).length,
        user: tenantSubscriptions.filter(s => s.categories.user).length,
        marketing: tenantSubscriptions.filter(s => s.categories.marketing).length,
        transaction: tenantSubscriptions.filter(s => s.categories.transaction).length,
        security: tenantSubscriptions.filter(s => s.categories.security).length,
        event: tenantSubscriptions.filter(s => s.categories.event).length,
        custom: tenantSubscriptions.filter(s => s.categories.custom).length
      },
      byFrequency: {
        immediate: tenantSubscriptions.filter(s => s.preferences.frequency === 'immediate').length,
        daily: tenantSubscriptions.filter(s => s.preferences.frequency === 'daily').length,
        weekly: tenantSubscriptions.filter(s => s.preferences.frequency === 'weekly').length,
        monthly: tenantSubscriptions.filter(s => s.preferences.frequency === 'monthly').length
      },
      quietHoursEnabled: tenantSubscriptions.filter(s => s.preferences.quietHours.enabled).length
    };

    // Delivery analytics
    const deliveryStats = {
      total: tenantDeliveries.length,
      byChannel: {
        email: tenantDeliveries.filter(d => d.channel === 'email').length,
        sms: tenantDeliveries.filter(d => d.channel === 'sms').length,
        push: tenantDeliveries.filter(d => d.channel === 'push').length,
        inApp: tenantDeliveries.filter(d => d.channel === 'in-app').length,
        webhook: tenantDeliveries.filter(d => d.channel === 'webhook').length,
        whatsapp: tenantDeliveries.filter(d => d.channel === 'whatsapp').length
      },
      byStatus: {
        pending: tenantDeliveries.filter(d => d.status === 'pending').length,
        sent: tenantDeliveries.filter(d => d.status === 'sent').length,
        delivered: tenantDeliveries.filter(d => d.status === 'delivered').length,
        failed: tenantDeliveries.filter(d => d.status === 'failed').length,
        bounced: tenantDeliveries.filter(d => d.status === 'bounced').length,
        unsubscribed: tenantDeliveries.filter(d => d.status === 'unsubscribed').length
      },
      totalOpened: tenantDeliveries.filter(d => d.tracking.opened).length,
      totalClicked: tenantDeliveries.filter(d => d.tracking.clicked).length,
      deliveryRate: tenantDeliveries.length > 0 ? 
        (tenantDeliveries.filter(d => d.status === 'delivered').length / tenantDeliveries.length) * 100 : 0,
      openRate: tenantDeliveries.filter(d => d.status === 'delivered').length > 0 ? 
        (tenantDeliveries.filter(d => d.tracking.opened).length / tenantDeliveries.filter(d => d.status === 'delivered').length) * 100 : 0,
      clickRate: tenantDeliveries.filter(d => d.tracking.opened).length > 0 ? 
        (tenantDeliveries.filter(d => d.tracking.clicked).length / tenantDeliveries.filter(d => d.tracking.opened).length) * 100 : 0
    };

    res.json({
      success: true,
      data: {
        notifications: notificationStats,
        templates: templateStats,
        campaigns: campaignStats,
        subscriptions: subscriptionStats,
        deliveries: deliveryStats,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error fetching notification analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification analytics'
    });
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

async function sendNotification(notification: Notification): Promise<void> {
  try {
    // Process each channel
    for (const channel of notification.channels) {
      await processNotificationChannel(notification, channel);
    }

    // Update notification status
    notification.delivery.status = 'sent';
    notification.delivery.deliveredAt = new Date();
    notification.updatedAt = new Date();

    // Send real-time notification via Socket.IO
    io.to(`tenant-${notification.tenantId}`).emit('notification', {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      category: notification.category,
      timestamp: new Date().toISOString()
    });

    logger.info(`Notification sent successfully: ${notification.id}`);
  } catch (error) {
    logger.error('Error sending notification:', error);
    
    // Update notification status
    notification.delivery.status = 'failed';
    notification.delivery.failedAt = new Date();
    notification.delivery.errorMessage = error.message;
    notification.updatedAt = new Date();
    
    throw error;
  }
}

async function processNotificationChannel(notification: Notification, channel: string): Promise<void> {
  try {
    switch (channel) {
      case 'email':
        await sendEmailNotification(notification);
        break;
      case 'sms':
        await sendSMSNotification(notification);
        break;
      case 'push':
        await sendPushNotification(notification);
        break;
      case 'in-app':
        await sendInAppNotification(notification);
        break;
      case 'webhook':
        await sendWebhookNotification(notification);
        break;
      case 'whatsapp':
        await sendWhatsAppNotification(notification);
        break;
      default:
        logger.warn(`Unsupported notification channel: ${channel}`);
    }
  } catch (error) {
    logger.error(`Error processing notification channel ${channel}:`, error);
    throw error;
  }
}

async function sendEmailNotification(notification: Notification): Promise<void> {
  // Simulate email sending
  logger.info(`Sending email notification: ${notification.id}`);
  
  // Create delivery record
  const delivery: NotificationDelivery = {
    id: uuidv4(),
    notificationId: notification.id,
    email: notification.recipients.emails?.[0],
    channel: 'email',
    status: 'sent',
    sentAt: new Date(),
    deliveredAt: new Date(),
    tracking: {
      opened: false,
      clicked: false,
      clickedLinks: []
    },
    metadata: {
      customFields: {}
    },
    tenantId: notification.tenantId,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  notificationDeliveries.push(delivery);
}

async function sendSMSNotification(notification: Notification): Promise<void> {
  // Simulate SMS sending
  logger.info(`Sending SMS notification: ${notification.id}`);
  
  // Create delivery record
  const delivery: NotificationDelivery = {
    id: uuidv4(),
    notificationId: notification.id,
    phone: notification.recipients.phones?.[0],
    channel: 'sms',
    status: 'sent',
    sentAt: new Date(),
    deliveredAt: new Date(),
    tracking: {
      opened: false,
      clicked: false,
      clickedLinks: []
    },
    metadata: {
      customFields: {}
    },
    tenantId: notification.tenantId,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  notificationDeliveries.push(delivery);
}

async function sendPushNotification(notification: Notification): Promise<void> {
  // Simulate push notification sending
  logger.info(`Sending push notification: ${notification.id}`);
  
  // Create delivery record
  const delivery: NotificationDelivery = {
    id: uuidv4(),
    notificationId: notification.id,
    userId: notification.recipients.userIds?.[0],
    channel: 'push',
    status: 'sent',
    sentAt: new Date(),
    deliveredAt: new Date(),
    tracking: {
      opened: false,
      clicked: false,
      clickedLinks: []
    },
    metadata: {
      customFields: {}
    },
    tenantId: notification.tenantId,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  notificationDeliveries.push(delivery);
}

async function sendInAppNotification(notification: Notification): Promise<void> {
  // Simulate in-app notification sending
  logger.info(`Sending in-app notification: ${notification.id}`);
  
  // Create delivery record
  const delivery: NotificationDelivery = {
    id: uuidv4(),
    notificationId: notification.id,
    userId: notification.recipients.userIds?.[0],
    channel: 'in-app',
    status: 'sent',
    sentAt: new Date(),
    deliveredAt: new Date(),
    tracking: {
      opened: false,
      clicked: false,
      clickedLinks: []
    },
    metadata: {
      customFields: {}
    },
    tenantId: notification.tenantId,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  notificationDeliveries.push(delivery);
}

async function sendWebhookNotification(notification: Notification): Promise<void> {
  // Simulate webhook notification sending
  logger.info(`Sending webhook notification: ${notification.id}`);
  
  // Create delivery record
  const delivery: NotificationDelivery = {
    id: uuidv4(),
    notificationId: notification.id,
    channel: 'webhook',
    status: 'sent',
    sentAt: new Date(),
    deliveredAt: new Date(),
    tracking: {
      opened: false,
      clicked: false,
      clickedLinks: []
    },
    metadata: {
      customFields: {}
    },
    tenantId: notification.tenantId,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  notificationDeliveries.push(delivery);
}

async function sendWhatsAppNotification(notification: Notification): Promise<void> {
  // Simulate WhatsApp notification sending
  logger.info(`Sending WhatsApp notification: ${notification.id}`);
  
  // Create delivery record
  const delivery: NotificationDelivery = {
    id: uuidv4(),
    notificationId: notification.id,
    phone: notification.recipients.phones?.[0],
    channel: 'whatsapp',
    status: 'sent',
    sentAt: new Date(),
    deliveredAt: new Date(),
    tracking: {
      opened: false,
      clicked: false,
      clickedLinks: []
    },
    metadata: {
      customFields: {}
    },
    tenantId: notification.tenantId,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  notificationDeliveries.push(delivery);
}

// ============================================
// CRON JOBS
// ============================================

// Process scheduled notifications
cron.schedule('*/5 * * * *', async () => {
  logger.info('Processing scheduled notifications...');
  
  const now = new Date();
  const scheduledNotifications = notifications.filter(notification => 
    notification.delivery.status === 'scheduled' &&
    notification.schedule.sendAt &&
    notification.schedule.sendAt <= now &&
    notification.tenantId === 'default' // In production, check all tenants
  );
  
  for (const notification of scheduledNotifications) {
    try {
      logger.info(`Processing scheduled notification: ${notification.id}`);
      await sendNotification(notification);
    } catch (error) {
      logger.error(`Error processing scheduled notification ${notification.id}:`, error);
    }
  }
});

// Generate notification analytics metrics daily
cron.schedule('0 1 * * *', async () => {
  logger.info('Generating notification analytics metrics...');
  
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const today = new Date();
  
  const tenantNotifications = notifications.filter(notification => 
    notification.tenantId === 'default' && 
    notification.createdAt >= yesterday && 
    notification.createdAt < today
  );
  
  const tenantDeliveries = notificationDeliveries.filter(delivery => 
    delivery.tenantId === 'default' && 
    delivery.createdAt >= yesterday && 
    delivery.createdAt < today
  );
  
  const metrics = [
    {
      id: uuidv4(),
      notificationId: 'all',
      metric: 'notifications_created_daily',
      value: tenantNotifications.length,
      unit: 'count',
      period: 'daily' as const,
      date: yesterday,
      tenantId: 'default',
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      notificationId: 'all',
      metric: 'notifications_sent_daily',
      value: tenantDeliveries.length,
      unit: 'count',
      period: 'daily' as const,
      date: yesterday,
      tenantId: 'default',
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      notificationId: 'all',
      metric: 'notifications_delivered_daily',
      value: tenantDeliveries.filter(d => d.status === 'delivered').length,
      unit: 'count',
      period: 'daily' as const,
      date: yesterday,
      tenantId: 'default',
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      notificationId: 'all',
      metric: 'notifications_opened_daily',
      value: tenantDeliveries.filter(d => d.tracking.opened).length,
      unit: 'count',
      period: 'daily' as const,
      date: yesterday,
      tenantId: 'default',
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      notificationId: 'all',
      metric: 'notifications_clicked_daily',
      value: tenantDeliveries.filter(d => d.tracking.clicked).length,
      unit: 'count',
      period: 'daily' as const,
      date: yesterday,
      tenantId: 'default',
      createdAt: new Date()
    }
  ];
  
  notificationAnalytics.push(...metrics);
  logger.info(`Generated ${metrics.length} notification analytics metrics`);
});

// Clean up old data weekly
cron.schedule('0 2 * * 0', async () => {
  logger.info('Cleaning up old notification data...');
  
  const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days ago
  
  // Clean up old deliveries
  const initialDeliveriesCount = notificationDeliveries.length;
  const filteredDeliveries = notificationDeliveries.filter(delivery => delivery.createdAt > cutoffDate);
  notificationDeliveries.length = 0;
  notificationDeliveries.push(...filteredDeliveries);
  
  // Clean up old analytics
  const initialAnalyticsCount = notificationAnalytics.length;
  const filteredAnalytics = notificationAnalytics.filter(analytics => analytics.createdAt > cutoffDate);
  notificationAnalytics.length = 0;
  notificationAnalytics.push(...filteredAnalytics);
  
  logger.info(`Cleaned up ${initialDeliveriesCount - notificationDeliveries.length} old notification deliveries`);
  logger.info(`Cleaned up ${initialAnalyticsCount - notificationAnalytics.length} old notification analytics`);
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
const PORT = process.env.PORT || 3015;

const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    // Start server
    server.listen(PORT, () => {
      logger.info(`🚀 Notification Service running on port ${PORT}`);
      logger.info(`📧 Email Notifications: Active`);
      logger.info(`📱 SMS Notifications: Active`);
      logger.info(`🔔 Push Notifications: Active`);
      logger.info(`💬 In-App Notifications: Active`);
      logger.info(`🔗 Webhook Notifications: Active`);
      logger.info(`📲 WhatsApp Notifications: Active`);
      logger.info(`📊 Notification Analytics: Active`);
      logger.info(`⚡ Real-time Socket.IO: Active`);
      logger.info(`⏰ Scheduled Notifications: Active`);
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
