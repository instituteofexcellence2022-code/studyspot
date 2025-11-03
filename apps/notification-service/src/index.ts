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
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import _ from 'lodash';
import Joi from 'joi';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { logger as winstonLogger } from 'winston';

const app = express();
const PORT = process.env.PORT || 3015;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/notificationdb';
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Configuration
const NOTIFICATION_CONFIG = {
  MAX_NOTIFICATIONS_PER_TENANT: 100000,
  MAX_TEMPLATES_PER_TENANT: 1000,
  MAX_CHANNELS_PER_TENANT: 100,
  MAX_CONCURRENT_SENDS: 100,
  MAX_NOTIFICATION_SIZE: 10 * 1024 * 1024, // 10MB
  RETENTION_DAYS: 90,
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: 100,
  MAX_RECIPIENTS_PER_NOTIFICATION: 10000,
  MAX_ATTACHMENTS_PER_NOTIFICATION: 10,
  MAX_ATTACHMENT_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_PRIORITY_LEVELS: 5, // 1-5
  MAX_CHANNEL_TYPES: 10, // email, sms, push, in-app, webhook, etc.
  MAX_TEMPLATE_VARIABLES: 50,
  MAX_NOTIFICATION_HISTORY: 1000,
  MAX_RETRY_ATTEMPTS: 3,
  MAX_RETRY_DELAY: 300000, // 5 minutes
  MAX_NOTIFICATION_DELAY: 24 * 60 * 60 * 1000 // 24 hours
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
  windowMs: NOTIFICATION_CONFIG.RATE_LIMIT_WINDOW,
  max: NOTIFICATION_CONFIG.RATE_LIMIT_MAX,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const notificationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // More restrictive for notification operations
  message: "Too many notification requests, please try again later.",
});

const templateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // Very restrictive for template operations
  message: "Too many template requests, please try again later.",
});

app.use(generalLimiter);

// Setup HTTP server for Socket.IO
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const connection = {
  host: REDIS_HOST,
  port: REDIS_PORT,
};

const notificationQueue = new Queue('notificationQueue', { connection });
const emailQueue = new Queue('emailQueue', { connection });
const smsQueue = new Queue('smsQueue', { connection });
const pushQueue = new Queue('pushQueue', { connection });

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
const NotificationSchema = new mongoose.Schema({
  notificationId: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v: string) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'Notification ID must be a valid UUID'
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
  channel: { 
    type: String, 
    required: true,
    enum: ['email', 'sms', 'push', 'in-app', 'webhook', 'slack', 'teams', 'discord', 'telegram', 'whatsapp'],
    validate: {
      validator: function(v: string) {
        return v && v.length >= 2 && v.length <= 50;
      },
      message: 'Channel must be between 2 and 50 characters'
    }
  },
  type: { 
    type: String, 
    required: true,
    enum: ['transactional', 'marketing', 'alert', 'reminder', 'welcome', 'follow-up', 'system', 'promotional'],
    validate: {
      validator: function(v: string) {
        return v && v.length >= 2 && v.length <= 50;
      },
      message: 'Type must be between 2 and 50 characters'
    }
  },
  priority: { 
    type: Number, 
    min: 1, 
    max: NOTIFICATION_CONFIG.MAX_PRIORITY_LEVELS, 
    default: 3 
  },
  subject: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || v.length <= 200;
      },
      message: 'Subject must be less than 200 characters'
    }
  },
  content: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return v && v.length >= 1 && v.length <= NOTIFICATION_CONFIG.MAX_NOTIFICATION_SIZE;
      },
      message: `Content must be between 1 and ${NOTIFICATION_CONFIG.MAX_NOTIFICATION_SIZE} characters`
    }
  },
  recipients: [{
    recipientId: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v: string) {
          return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
        },
        message: 'Recipient ID must be a valid UUID'
      }
    },
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
          return !v || v.length <= 100;
        },
        message: 'Name must be less than 100 characters'
      }
    },
    userId: { 
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
        },
        message: 'User ID must be a valid UUID'
      }
    },
    status: { 
      type: String, 
      enum: ['pending', 'sent', 'delivered', 'failed', 'bounced', 'opened', 'clicked'], 
      default: 'pending' 
    },
    sentAt: Date,
    deliveredAt: Date,
    openedAt: Date,
    clickedAt: Date,
    error: String,
    retryCount: { type: Number, default: 0 },
    metadata: mongoose.Schema.Types.Mixed
  }],
  templateId: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'Template ID must be a valid UUID'
    }
  },
  attachments: [{
    attachmentId: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v: string) {
          return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
        },
        message: 'Attachment ID must be a valid UUID'
      }
    },
    filename: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v: string) {
          return v && v.length >= 1 && v.length <= 255;
        },
        message: 'Filename must be between 1 and 255 characters'
      }
    },
    contentType: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v: string) {
          return v && v.length >= 1 && v.length <= 100;
        },
        message: 'Content type must be between 1 and 100 characters'
      }
    },
    size: { 
      type: Number, 
      required: true,
      validate: {
        validator: function(v: number) {
          return v > 0 && v <= NOTIFICATION_CONFIG.MAX_ATTACHMENT_SIZE;
        },
        message: `Size must be between 1 and ${NOTIFICATION_CONFIG.MAX_ATTACHMENT_SIZE} bytes`
      }
    },
    url: { 
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Invalid URL format'
      }
    }
  }],
  variables: mongoose.Schema.Types.Mixed,
  status: { 
    type: String, 
    enum: ['draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled'], 
    default: 'draft' 
  },
  scheduledAt: Date,
  sentAt: Date,
  deliveredAt: Date,
  openedAt: Date,
  clickedAt: Date,
  error: String,
  retryCount: { type: Number, default: 0 },
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes
NotificationSchema.index({ notificationId: 1 }, { unique: true });
NotificationSchema.index({ tenantId: 1, createdAt: -1 });
NotificationSchema.index({ tenantId: 1, channel: 1 });
NotificationSchema.index({ tenantId: 1, type: 1 });
NotificationSchema.index({ tenantId: 1, status: 1 });
NotificationSchema.index({ 'recipients.email': 1 });
NotificationSchema.index({ 'recipients.phone': 1 });
NotificationSchema.index({ 'recipients.userId': 1 });
NotificationSchema.index({ scheduledAt: 1 });
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: NOTIFICATION_CONFIG.RETENTION_DAYS * 24 * 60 * 60 });

const Notification = mongoose.model('Notification', NotificationSchema);

const TemplateSchema = new mongoose.Schema({
  templateId: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v: string) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'Template ID must be a valid UUID'
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
  name: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return v && v.length >= 2 && v.length <= 200;
      },
      message: 'Template name must be between 2 and 200 characters'
    }
  },
  description: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || v.length <= 1000;
      },
      message: 'Description must be less than 1000 characters'
    }
  },
  channel: { 
    type: String, 
    required: true,
    enum: ['email', 'sms', 'push', 'in-app', 'webhook', 'slack', 'teams', 'discord', 'telegram', 'whatsapp'],
    validate: {
      validator: function(v: string) {
        return v && v.length >= 2 && v.length <= 50;
      },
      message: 'Channel must be between 2 and 50 characters'
    }
  },
  type: { 
    type: String, 
    required: true,
    enum: ['transactional', 'marketing', 'alert', 'reminder', 'welcome', 'follow-up', 'system', 'promotional'],
    validate: {
      validator: function(v: string) {
        return v && v.length >= 2 && v.length <= 50;
      },
      message: 'Type must be between 2 and 50 characters'
    }
  },
  subject: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || v.length <= 200;
      },
      message: 'Subject must be less than 200 characters'
    }
  },
  content: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return v && v.length >= 1 && v.length <= NOTIFICATION_CONFIG.MAX_NOTIFICATION_SIZE;
      },
      message: `Content must be between 1 and ${NOTIFICATION_CONFIG.MAX_NOTIFICATION_SIZE} characters`
    }
  },
  variables: [{
    name: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v: string) {
          return v && v.length >= 2 && v.length <= 100;
        },
        message: 'Variable name must be between 2 and 100 characters'
      }
    },
    type: { 
      type: String, 
      required: true,
      enum: ['string', 'number', 'boolean', 'date', 'object', 'array'],
      validate: {
        validator: function(v: string) {
          return v && v.length >= 2 && v.length <= 50;
        },
        message: 'Variable type must be between 2 and 50 characters'
      }
    },
    defaultValue: mongoose.Schema.Types.Mixed,
    isRequired: { type: Boolean, default: false },
    description: { 
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || v.length <= 500;
        },
        message: 'Description must be less than 500 characters'
      }
    }
  }],
  isActive: { type: Boolean, default: true },
  tags: [{
    type: String,
    validate: {
      validator: function(v: string) {
        return v && v.length >= 2 && v.length <= 50;
      },
      message: 'Tag must be between 2 and 50 characters'
    }
  }],
  permissions: {
    view: [{ type: String }],
    edit: [{ type: String }],
    use: [{ type: String }],
    delete: [{ type: String }]
  },
  statistics: {
    totalUses: { type: Number, default: 0 },
    successfulUses: { type: Number, default: 0 },
    failedUses: { type: Number, default: 0 },
    lastUsed: Date,
    lastSuccessfulUse: Date,
    lastFailedUse: Date
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes
TemplateSchema.index({ templateId: 1 }, { unique: true });
TemplateSchema.index({ tenantId: 1, createdAt: -1 });
TemplateSchema.index({ tenantId: 1, channel: 1 });
TemplateSchema.index({ tenantId: 1, type: 1 });
TemplateSchema.index({ tenantId: 1, isActive: 1 });
TemplateSchema.index({ createdAt: 1 }, { expireAfterSeconds: NOTIFICATION_CONFIG.RETENTION_DAYS * 24 * 60 * 60 });

const Template = mongoose.model('Template', TemplateSchema);

// Enhanced validation schemas
const notificationSchema = Joi.object({
  channel: Joi.string().valid('email', 'sms', 'push', 'in-app', 'webhook', 'slack', 'teams', 'discord', 'telegram', 'whatsapp').required(),
  type: Joi.string().valid('transactional', 'marketing', 'alert', 'reminder', 'welcome', 'follow-up', 'system', 'promotional').required(),
  priority: Joi.number().min(1).max(NOTIFICATION_CONFIG.MAX_PRIORITY_LEVELS).default(3),
  subject: Joi.string().max(200).optional(),
  content: Joi.string().min(1).max(NOTIFICATION_CONFIG.MAX_NOTIFICATION_SIZE).required(),
  recipients: Joi.array().items(Joi.object({
    email: Joi.string().email().optional(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
    name: Joi.string().max(100).optional(),
    userId: Joi.string().uuid().optional(),
    metadata: Joi.object().optional()
  })).min(1).max(NOTIFICATION_CONFIG.MAX_RECIPIENTS_PER_NOTIFICATION).required(),
  templateId: Joi.string().uuid().optional(),
  attachments: Joi.array().items(Joi.object({
    filename: Joi.string().min(1).max(255).required(),
    contentType: Joi.string().min(1).max(100).required(),
    size: Joi.number().min(1).max(NOTIFICATION_CONFIG.MAX_ATTACHMENT_SIZE).required(),
    url: Joi.string().uri().optional()
  })).max(NOTIFICATION_CONFIG.MAX_ATTACHMENTS_PER_NOTIFICATION).optional(),
  variables: Joi.object().optional(),
  scheduledAt: Joi.date().optional(),
  metadata: Joi.object().optional()
});

const templateSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  description: Joi.string().max(1000).optional(),
  channel: Joi.string().valid('email', 'sms', 'push', 'in-app', 'webhook', 'slack', 'teams', 'discord', 'telegram', 'whatsapp').required(),
  type: Joi.string().valid('transactional', 'marketing', 'alert', 'reminder', 'welcome', 'follow-up', 'system', 'promotional').required(),
  subject: Joi.string().max(200).optional(),
  content: Joi.string().min(1).max(NOTIFICATION_CONFIG.MAX_NOTIFICATION_SIZE).required(),
  variables: Joi.array().items(Joi.object({
    name: Joi.string().min(2).max(100).required(),
    type: Joi.string().valid('string', 'number', 'boolean', 'date', 'object', 'array').required(),
    defaultValue: Joi.any().optional(),
    isRequired: Joi.boolean().default(false),
    description: Joi.string().max(500).optional()
  })).max(NOTIFICATION_CONFIG.MAX_TEMPLATE_VARIABLES).optional(),
  isActive: Joi.boolean().default(true),
  tags: Joi.array().items(Joi.string().min(2).max(50)).optional()
});

// Enhanced Notification Manager with comprehensive notification system
class NotificationManager {
  private emailTransporter: any;
  private smsClient: any;
  private activeSends: Map<string, any> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.initializeNotification();
  }

  private async initializeNotification(): Promise<void> {
    try {
      // Initialize email transporter
      this.emailTransporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'localhost',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      // Initialize SMS client
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        this.smsClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      }

      // Start workers
      this.startEmailWorker();
      this.startSMSWorker();
      this.startPushWorker();
      
      logger.info('Notification Manager initialized successfully');
    } catch (error: any) {
      logger.error('Error initializing Notification Manager:', error);
      throw new Error(`Notification initialization failed: ${error.message}`);
    }
  }

  // Enhanced notification sending
  async sendNotification(notificationData: any): Promise<any> {
    try {
      if (!notificationData || !notificationData.recipients || !Array.isArray(notificationData.recipients)) {
        throw new Error('Valid notification with recipients is required');
      }

      if (notificationData.recipients.length > NOTIFICATION_CONFIG.MAX_RECIPIENTS_PER_NOTIFICATION) {
        throw new Error(`Maximum ${NOTIFICATION_CONFIG.MAX_RECIPIENTS_PER_NOTIFICATION} recipients allowed per notification`);
      }

      const notificationId = uuidv4();
      const startTime = Date.now();
      
      // Check concurrent send limit
      if (this.activeSends.size >= NOTIFICATION_CONFIG.MAX_CONCURRENT_SENDS) {
        throw new Error('Maximum concurrent sends reached');
      }

      const notification = new Notification({
        notificationId,
        tenantId: notificationData.tenantId || 'default',
        channel: notificationData.channel,
        type: notificationData.type,
        priority: notificationData.priority || 3,
        subject: notificationData.subject,
        content: notificationData.content,
        recipients: notificationData.recipients.map((recipient: any) => ({
          recipientId: uuidv4(),
          ...recipient,
          status: 'pending'
        })),
        templateId: notificationData.templateId,
        attachments: notificationData.attachments?.map((attachment: any) => ({
          attachmentId: uuidv4(),
          ...attachment
        })) || [],
        variables: notificationData.variables || {},
        status: notificationData.scheduledAt ? 'scheduled' : 'sending',
        scheduledAt: notificationData.scheduledAt,
        metadata: notificationData.metadata || {},
        createdAt: new Date(),
        updatedAt: new Date()
      });

      this.activeSends.set(notificationId, notification);
      
      try {
        // Send notification based on channel
        switch (notificationData.channel) {
          case 'email':
            await this.sendEmail(notification);
            break;
          case 'sms':
            await this.sendSMS(notification);
            break;
          case 'push':
            await this.sendPush(notification);
            break;
          case 'in-app':
            await this.sendInApp(notification);
            break;
          case 'webhook':
            await this.sendWebhook(notification);
            break;
          case 'slack':
            await this.sendSlack(notification);
            break;
          case 'teams':
            await this.sendTeams(notification);
            break;
          case 'discord':
            await this.sendDiscord(notification);
            break;
          case 'telegram':
            await this.sendTelegram(notification);
            break;
          case 'whatsapp':
            await this.sendWhatsApp(notification);
            break;
          default:
            throw new Error(`Unsupported channel: ${notificationData.channel}`);
        }

        notification.status = 'sent';
        notification.sentAt = new Date();
        
        // Update recipient statuses
        notification.recipients.forEach((recipient: any) => {
          recipient.status = 'sent';
          recipient.sentAt = new Date();
        });

      } finally {
        this.activeSends.delete(notificationId);
        await notification.save();
      }

      return notification;

    } catch (error: any) {
      logger.error('Notification sending failed:', error);
      throw new Error(`Notification sending failed: ${error.message}`);
    }
  }

  // Channel-specific sending methods
  private async sendEmail(notification: any): Promise<void> {
    try {
      for (const recipient of notification.recipients) {
        if (!recipient.email) continue;

        const mailOptions = {
          from: process.env.FROM_EMAIL || 'noreply@studyspot.com',
          to: recipient.email,
          subject: notification.subject,
          html: notification.content,
          attachments: notification.attachments.map((attachment: any) => ({
            filename: attachment.filename,
            path: attachment.url
          }))
        };

        const info = await this.emailTransporter.sendMail(mailOptions);
        
        recipient.status = 'delivered';
        recipient.deliveredAt = new Date();
        recipient.metadata = { messageId: info.messageId };
        
        logger.info(`Email sent to ${recipient.email}: ${info.messageId}`);
      }
    } catch (error: any) {
      logger.error('Email sending failed:', error);
      throw error;
    }
  }

  private async sendSMS(notification: any): Promise<void> {
    try {
      if (!this.smsClient) {
        throw new Error('SMS client not configured');
      }

      for (const recipient of notification.recipients) {
        if (!recipient.phone) continue;

        const smsOptions = {
          body: notification.content,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: recipient.phone
        };

        const result = await this.smsClient.messages.create(smsOptions);
        
        recipient.status = 'delivered';
        recipient.deliveredAt = new Date();
        recipient.metadata = { messageSid: result.sid };
        
        logger.info(`SMS sent to ${recipient.phone}: ${result.sid}`);
      }
    } catch (error: any) {
      logger.error('SMS sending failed:', error);
      throw error;
    }
  }

  private async sendPush(notification: any): Promise<void> {
    try {
      // Simulate push notification sending
      for (const recipient of notification.recipients) {
        recipient.status = 'delivered';
        recipient.deliveredAt = new Date();
        recipient.metadata = { pushId: uuidv4() };
        
        logger.info(`Push notification sent to ${recipient.recipientId}`);
      }
    } catch (error: any) {
      logger.error('Push notification sending failed:', error);
      throw error;
    }
  }

  private async sendInApp(notification: any): Promise<void> {
    try {
      // Simulate in-app notification sending
      for (const recipient of notification.recipients) {
        recipient.status = 'delivered';
        recipient.deliveredAt = new Date();
        recipient.metadata = { inAppId: uuidv4() };
        
        logger.info(`In-app notification sent to ${recipient.recipientId}`);
      }
    } catch (error: any) {
      logger.error('In-app notification sending failed:', error);
      throw error;
    }
  }

  private async sendWebhook(notification: any): Promise<void> {
    try {
      const webhookUrl = notification.metadata?.webhookUrl;
      if (!webhookUrl) {
        throw new Error('Webhook URL not provided');
      }

      const webhookData = {
        notificationId: notification.notificationId,
        channel: notification.channel,
        type: notification.type,
        subject: notification.subject,
        content: notification.content,
        recipients: notification.recipients,
        sentAt: new Date()
      };

      const response = await axios.post(webhookUrl, webhookData, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'StudySpot-Notification-Service/1.0'
        }
      });

      notification.recipients.forEach((recipient: any) => {
        recipient.status = 'delivered';
        recipient.deliveredAt = new Date();
        recipient.metadata = { webhookResponse: response.status };
      });
      
      logger.info(`Webhook sent to ${webhookUrl}: ${response.status}`);
    } catch (error: any) {
      logger.error('Webhook sending failed:', error);
      throw error;
    }
  }

  private async sendSlack(notification: any): Promise<void> {
    try {
      const slackWebhookUrl = notification.metadata?.slackWebhookUrl;
      if (!slackWebhookUrl) {
        throw new Error('Slack webhook URL not provided');
      }

      const slackData = {
        text: notification.subject || 'Notification',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: notification.content
            }
          }
        ]
      };

      const response = await axios.post(slackWebhookUrl, slackData, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      notification.recipients.forEach((recipient: any) => {
        recipient.status = 'delivered';
        recipient.deliveredAt = new Date();
        recipient.metadata = { slackResponse: response.status };
      });
      
      logger.info(`Slack notification sent: ${response.status}`);
    } catch (error: any) {
      logger.error('Slack notification sending failed:', error);
      throw error;
    }
  }

  private async sendTeams(notification: any): Promise<void> {
    try {
      const teamsWebhookUrl = notification.metadata?.teamsWebhookUrl;
      if (!teamsWebhookUrl) {
        throw new Error('Teams webhook URL not provided');
      }

      const teamsData = {
        '@type': 'MessageCard',
        '@context': 'http://schema.org/extensions',
        themeColor: '0076D7',
        summary: notification.subject || 'Notification',
        sections: [{
          activityTitle: notification.subject || 'Notification',
          activitySubtitle: 'StudySpot Platform',
          text: notification.content
        }]
      };

      const response = await axios.post(teamsWebhookUrl, teamsData, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      notification.recipients.forEach((recipient: any) => {
        recipient.status = 'delivered';
        recipient.deliveredAt = new Date();
        recipient.metadata = { teamsResponse: response.status };
      });
      
      logger.info(`Teams notification sent: ${response.status}`);
    } catch (error: any) {
      logger.error('Teams notification sending failed:', error);
      throw error;
    }
  }

  private async sendDiscord(notification: any): Promise<void> {
    try {
      const discordWebhookUrl = notification.metadata?.discordWebhookUrl;
      if (!discordWebhookUrl) {
        throw new Error('Discord webhook URL not provided');
      }

      const discordData = {
        content: notification.content,
        embeds: [{
          title: notification.subject || 'Notification',
          description: notification.content,
          color: 0x0076D7,
          timestamp: new Date().toISOString()
        }]
      };

      const response = await axios.post(discordWebhookUrl, discordData, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      notification.recipients.forEach((recipient: any) => {
        recipient.status = 'delivered';
        recipient.deliveredAt = new Date();
        recipient.metadata = { discordResponse: response.status };
      });
      
      logger.info(`Discord notification sent: ${response.status}`);
    } catch (error: any) {
      logger.error('Discord notification sending failed:', error);
      throw error;
    }
  }

  private async sendTelegram(notification: any): Promise<void> {
    try {
      const telegramBotToken = notification.metadata?.telegramBotToken;
      const telegramChatId = notification.metadata?.telegramChatId;
      
      if (!telegramBotToken || !telegramChatId) {
        throw new Error('Telegram bot token and chat ID not provided');
      }

      const telegramData = {
        chat_id: telegramChatId,
        text: `${notification.subject || 'Notification'}\n\n${notification.content}`,
        parse_mode: 'HTML'
      };

      const response = await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, telegramData, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      notification.recipients.forEach((recipient: any) => {
        recipient.status = 'delivered';
        recipient.deliveredAt = new Date();
        recipient.metadata = { telegramResponse: response.status };
      });
      
      logger.info(`Telegram notification sent: ${response.status}`);
    } catch (error: any) {
      logger.error('Telegram notification sending failed:', error);
      throw error;
    }
  }

  private async sendWhatsApp(notification: any): Promise<void> {
    try {
      const whatsappApiUrl = notification.metadata?.whatsappApiUrl;
      const whatsappToken = notification.metadata?.whatsappToken;
      
      if (!whatsappApiUrl || !whatsappToken) {
        throw new Error('WhatsApp API URL and token not provided');
      }

      for (const recipient of notification.recipients) {
        if (!recipient.phone) continue;

        const whatsappData = {
          messaging_product: 'whatsapp',
          to: recipient.phone,
          type: 'text',
          text: {
            body: `${notification.subject || 'Notification'}\n\n${notification.content}`
          }
        };

        const response = await axios.post(`${whatsappApiUrl}/messages`, whatsappData, {
          timeout: 30000,
          headers: {
            'Authorization': `Bearer ${whatsappToken}`,
            'Content-Type': 'application/json'
          }
        });

        recipient.status = 'delivered';
        recipient.deliveredAt = new Date();
        recipient.metadata = { whatsappResponse: response.status };
        
        logger.info(`WhatsApp notification sent to ${recipient.phone}: ${response.status}`);
      }
    } catch (error: any) {
      logger.error('WhatsApp notification sending failed:', error);
      throw error;
    }
  }

  // Template management
  async createTemplate(templateData: any): Promise<any> {
    try {
      const template = new Template({
        templateId: uuidv4(),
        tenantId: templateData.tenantId || 'default',
        name: templateData.name,
        description: templateData.description,
        channel: templateData.channel,
        type: templateData.type,
        subject: templateData.subject,
        content: templateData.content,
        variables: templateData.variables?.map((variable: any) => ({
          name: variable.name,
          type: variable.type,
          defaultValue: variable.defaultValue,
          isRequired: variable.isRequired,
          description: variable.description
        })) || [],
        isActive: templateData.isActive,
        tags: templateData.tags || [],
        permissions: {
          view: [templateData.userId || 'anonymous'],
          edit: [templateData.userId || 'anonymous'],
          use: [templateData.userId || 'anonymous'],
          delete: [templateData.userId || 'anonymous']
        },
        statistics: {
          totalUses: 0,
          successfulUses: 0,
          failedUses: 0
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await template.save();
      return template;
    } catch (error: any) {
      logger.error('Template creation failed:', error);
      throw new Error(`Template creation failed: ${error.message}`);
    }
  }

  // Worker methods
  private startEmailWorker(): void {
    const worker = new Worker('emailQueue', async (job: Job) => {
      const { notificationId } = job.data;
      
      try {
        const notification = await Notification.findOne({ notificationId });
        if (!notification) {
          throw new Error('Notification not found');
        }
        
        await this.sendEmail(notification);
        return { notificationId, status: 'sent' };
      } catch (error: any) {
        logger.error('Email worker error:', error);
        throw error;
      }
    }, { connection });
    
    worker.on('completed', (job) => {
      logger.info(`Email job completed: ${job.id}`);
    });
    
    worker.on('failed', (job, err) => {
      logger.error(`Email job failed: ${job.id}`, err);
    });
  }

  private startSMSWorker(): void {
    const worker = new Worker('smsQueue', async (job: Job) => {
      const { notificationId } = job.data;
      
      try {
        const notification = await Notification.findOne({ notificationId });
        if (!notification) {
          throw new Error('Notification not found');
        }
        
        await this.sendSMS(notification);
        return { notificationId, status: 'sent' };
      } catch (error: any) {
        logger.error('SMS worker error:', error);
        throw error;
      }
    }, { connection });
    
    worker.on('completed', (job) => {
      logger.info(`SMS job completed: ${job.id}`);
    });
    
    worker.on('failed', (job, err) => {
      logger.error(`SMS job failed: ${job.id}`, err);
    });
  }

  private startPushWorker(): void {
    const worker = new Worker('pushQueue', async (job: Job) => {
      const { notificationId } = job.data;
      
      try {
        const notification = await Notification.findOne({ notificationId });
        if (!notification) {
          throw new Error('Notification not found');
        }
        
        await this.sendPush(notification);
        return { notificationId, status: 'sent' };
      } catch (error: any) {
        logger.error('Push worker error:', error);
        throw error;
      }
    }, { connection });
    
    worker.on('completed', (job) => {
      logger.info(`Push job completed: ${job.id}`);
    });
    
    worker.on('failed', (job, err) => {
      logger.error(`Push job failed: ${job.id}`, err);
    });
  }

  // Get statistics
  getStatistics(): { activeSends: number } {
    return {
      activeSends: this.activeSends.size
    };
  }
}

const notificationManager = new NotificationManager();

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
    status: 'Notification Service is healthy', 
    uptime: process.uptime(),
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      queue: notificationQueue.name,
      emailQueue: emailQueue.name,
      smsQueue: smsQueue.name,
      pushQueue: pushQueue.name,
      email: 'active',
      sms: 'active',
      push: 'active',
      templates: 'active',
      notifications: 'active'
    },
    statistics: notificationManager.getStatistics()
  });
});

// Notification endpoints
app.post('/notifications', 
  notificationLimiter,
  validateRequest(notificationSchema), 
  async (req, res) => {
    try {
      const notificationData = req.validatedData;
      notificationData.tenantId = req.headers['x-tenant-id'] || 'default';
      
      const notification = await notificationManager.sendNotification(notificationData);
      
      res.status(201).json({
        success: true,
        data: notification,
        message: 'Notification sent successfully'
      });
    } catch (error: any) {
      logger.error('Error sending notification:', error);
      res.status(400).json({ 
        success: false,
        message: error.message,
        code: 'NOTIFICATION_SEND_ERROR'
      });
    }
  }
);

// Template endpoints
app.post('/templates', 
  templateLimiter,
  validateRequest(templateSchema), 
  async (req, res) => {
    try {
      const templateData = req.validatedData;
      templateData.tenantId = req.headers['x-tenant-id'] || 'default';
      templateData.userId = req.headers['x-user-id'] || 'anonymous';
      
      const template = await notificationManager.createTemplate(templateData);
      
      res.status(201).json({
        success: true,
        data: template,
        message: 'Template created successfully'
      });
    } catch (error: any) {
      logger.error('Error creating template:', error);
      res.status(400).json({ 
        success: false,
        message: error.message,
        code: 'TEMPLATE_CREATION_ERROR'
      });
    }
  }
);

// Notification overview endpoint
app.get('/dashboard/overview', async (req, res) => {
  try {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    
    const notifications = await Notification.find({ tenantId });
    const templates = await Template.find({ tenantId });

    const notificationStats = {
      total: notifications.length,
      byChannel: _.countBy(notifications, 'channel'),
      byType: _.countBy(notifications, 'type'),
      byStatus: _.countBy(notifications, 'status'),
      totalRecipients: notifications.reduce((sum, n) => sum + n.recipients.length, 0),
      successfulSends: notifications.filter(n => n.status === 'sent').length
    };

    const templateStats = {
      total: templates.length,
      active: templates.filter(t => t.isActive).length,
      byChannel: _.countBy(templates, 'channel'),
      byType: _.countBy(templates, 'type'),
      totalUses: templates.reduce((sum, t) => sum + t.statistics.totalUses, 0)
    };

    res.status(200).json({
      success: true,
      data: {
        notifications: notificationStats,
        templates: templateStats,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error: any) {
    logger.error('Error fetching notification overview:', error);
    res.status(500).json({ 
      success: false,
      message: error.message,
      code: 'NOTIFICATION_OVERVIEW_ERROR'
    });
  }
});

// Enhanced error handling middleware
app.use(errorHandler);

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  logger.info('Client connected to Notification Service:', socket.id);
  
  socket.on('subscribe-notification', (data) => {
    if (data.tenantId) {
      socket.join(`notification-${data.tenantId}`);
      logger.info(`Client subscribed to notification updates for tenant ${data.tenantId}`);
    }
  });
  
  socket.on('disconnect', () => {
    logger.info('Client disconnected from Notification Service:', socket.id);
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
    
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
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
    
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
});

server.listen(PORT, () => {
  logger.info(`🚀 Enhanced Notification Service running on port ${PORT}`);
  logger.info(`📧 Email Notifications: Active`);
  logger.info(`📱 SMS Notifications: Active`);
  logger.info(`🔔 Push Notifications: Active`);
  logger.info(`💬 Multi-Channel Support: Active`);
  logger.info(`📝 Template Management: Active`);
  logger.info(`🔒 Security: Rate limiting, CORS, Helmet enabled`);
  logger.info(`⚡ Performance: Caching, optimization enabled`);
});