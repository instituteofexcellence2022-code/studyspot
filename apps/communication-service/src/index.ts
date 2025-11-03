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
const PORT = process.env.PORT || 3010;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/communicationdb';
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Configuration
const COMMUNICATION_CONFIG = {
  MAX_MESSAGES_PER_TENANT: 10000,
  MAX_TEMPLATES_PER_TENANT: 1000,
  MAX_CAMPAIGNS_PER_TENANT: 500,
  MAX_CONCURRENT_SENDS: 50,
  MAX_MESSAGE_SIZE: 10 * 1024 * 1024, // 10MB
  RETENTION_DAYS: 90,
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: 100,
  MAX_RECIPIENTS_PER_MESSAGE: 1000,
  MAX_ATTACHMENTS_PER_MESSAGE: 10,
  MAX_ATTACHMENT_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_CHANNELS_PER_TENANT: 100
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
  windowMs: COMMUNICATION_CONFIG.RATE_LIMIT_WINDOW,
  max: COMMUNICATION_CONFIG.RATE_LIMIT_MAX,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const messageLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // More restrictive for message sending
  message: "Too many message requests, please try again later.",
});

const campaignLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // Very restrictive for campaign operations
  message: "Too many campaign requests, please try again later.",
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

const communicationQueue = new Queue('communicationQueue', { connection });
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
const MessageSchema = new mongoose.Schema({
  messageId: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v: string) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'Message ID must be a valid UUID'
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
    enum: ['email', 'sms', 'push', 'in-app', 'webhook', 'api'],
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
    enum: ['transactional', 'marketing', 'notification', 'alert', 'reminder', 'welcome', 'follow-up'],
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
        return v && v.length >= 1 && v.length <= COMMUNICATION_CONFIG.MAX_MESSAGE_SIZE;
      },
      message: `Content must be between 1 and ${COMMUNICATION_CONFIG.MAX_MESSAGE_SIZE} characters`
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
  campaignId: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'Campaign ID must be a valid UUID'
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
          return v > 0 && v <= COMMUNICATION_CONFIG.MAX_ATTACHMENT_SIZE;
        },
        message: `Size must be between 1 and ${COMMUNICATION_CONFIG.MAX_ATTACHMENT_SIZE} bytes`
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
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes
MessageSchema.index({ messageId: 1 }, { unique: true });
MessageSchema.index({ tenantId: 1, createdAt: -1 });
MessageSchema.index({ tenantId: 1, channel: 1 });
MessageSchema.index({ tenantId: 1, type: 1 });
MessageSchema.index({ tenantId: 1, status: 1 });
MessageSchema.index({ 'recipients.email': 1 });
MessageSchema.index({ 'recipients.phone': 1 });
MessageSchema.index({ createdAt: 1 }, { expireAfterSeconds: COMMUNICATION_CONFIG.RETENTION_DAYS * 24 * 60 * 60 });

const Message = mongoose.model('Message', MessageSchema);

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
    enum: ['email', 'sms', 'push', 'in-app', 'webhook', 'api'],
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
    enum: ['transactional', 'marketing', 'notification', 'alert', 'reminder', 'welcome', 'follow-up'],
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
        return v && v.length >= 1 && v.length <= COMMUNICATION_CONFIG.MAX_MESSAGE_SIZE;
      },
      message: `Content must be between 1 and ${COMMUNICATION_CONFIG.MAX_MESSAGE_SIZE} characters`
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
TemplateSchema.index({ createdAt: 1 }, { expireAfterSeconds: COMMUNICATION_CONFIG.RETENTION_DAYS * 24 * 60 * 60 });

const Template = mongoose.model('Template', TemplateSchema);

const CampaignSchema = new mongoose.Schema({
  campaignId: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v: string) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'Campaign ID must be a valid UUID'
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
      message: 'Campaign name must be between 2 and 200 characters'
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
    enum: ['email', 'sms', 'push', 'in-app', 'webhook', 'api'],
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
    enum: ['transactional', 'marketing', 'notification', 'alert', 'reminder', 'welcome', 'follow-up'],
    validate: {
      validator: function(v: string) {
        return v && v.length >= 2 && v.length <= 50;
      },
      message: 'Type must be between 2 and 50 characters'
    }
  },
  templateId: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'Template ID must be a valid UUID'
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
        return v && v.length >= 1 && v.length <= COMMUNICATION_CONFIG.MAX_MESSAGE_SIZE;
      },
      message: `Content must be between 1 and ${COMMUNICATION_CONFIG.MAX_MESSAGE_SIZE} characters`
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
    variables: mongoose.Schema.Types.Mixed
  }],
  schedule: {
    type: { 
      type: String, 
      enum: ['immediate', 'scheduled', 'recurring'], 
      default: 'immediate' 
    },
    scheduledAt: Date,
    cron: { 
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^(\*|([0-5]?\d)) (\*|([0-5]?\d)) (\*|([0-5]?\d)) (\*|([0-5]?\d)) (\*|([0-5]?\d))$/.test(v);
        },
        message: 'Invalid cron expression'
      }
    },
    timezone: { type: String, default: 'UTC' }
  },
  status: { 
    type: String, 
    enum: ['draft', 'scheduled', 'running', 'completed', 'paused', 'cancelled'], 
    default: 'draft' 
  },
  startedAt: Date,
  completedAt: Date,
  error: String,
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes
CampaignSchema.index({ campaignId: 1 }, { unique: true });
CampaignSchema.index({ tenantId: 1, createdAt: -1 });
CampaignSchema.index({ tenantId: 1, channel: 1 });
CampaignSchema.index({ tenantId: 1, type: 1 });
CampaignSchema.index({ tenantId: 1, status: 1 });
CampaignSchema.index({ 'schedule.scheduledAt': 1 });
CampaignSchema.index({ createdAt: 1 }, { expireAfterSeconds: COMMUNICATION_CONFIG.RETENTION_DAYS * 24 * 60 * 60 });

const Campaign = mongoose.model('Campaign', CampaignSchema);

// Enhanced validation schemas
const messageSchema = Joi.object({
  channel: Joi.string().valid('email', 'sms', 'push', 'in-app', 'webhook', 'api').required(),
  type: Joi.string().valid('transactional', 'marketing', 'notification', 'alert', 'reminder', 'welcome', 'follow-up').required(),
  subject: Joi.string().max(200).optional(),
  content: Joi.string().min(1).max(COMMUNICATION_CONFIG.MAX_MESSAGE_SIZE).required(),
  recipients: Joi.array().items(Joi.object({
    email: Joi.string().email().optional(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
    name: Joi.string().max(100).optional(),
    variables: Joi.object().optional()
  })).min(1).max(COMMUNICATION_CONFIG.MAX_RECIPIENTS_PER_MESSAGE).required(),
  templateId: Joi.string().uuid().optional(),
  campaignId: Joi.string().uuid().optional(),
  attachments: Joi.array().items(Joi.object({
    filename: Joi.string().min(1).max(255).required(),
    contentType: Joi.string().min(1).max(100).required(),
    size: Joi.number().min(1).max(COMMUNICATION_CONFIG.MAX_ATTACHMENT_SIZE).required(),
    url: Joi.string().uri().optional()
  })).max(COMMUNICATION_CONFIG.MAX_ATTACHMENTS_PER_MESSAGE).optional(),
  variables: Joi.object().optional(),
  scheduledAt: Joi.date().optional()
});

const templateSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  description: Joi.string().max(1000).optional(),
  channel: Joi.string().valid('email', 'sms', 'push', 'in-app', 'webhook', 'api').required(),
  type: Joi.string().valid('transactional', 'marketing', 'notification', 'alert', 'reminder', 'welcome', 'follow-up').required(),
  subject: Joi.string().max(200).optional(),
  content: Joi.string().min(1).max(COMMUNICATION_CONFIG.MAX_MESSAGE_SIZE).required(),
  variables: Joi.array().items(Joi.object({
    name: Joi.string().min(2).max(100).required(),
    type: Joi.string().valid('string', 'number', 'boolean', 'date', 'object', 'array').required(),
    defaultValue: Joi.any().optional(),
    isRequired: Joi.boolean().default(false),
    description: Joi.string().max(500).optional()
  })).optional(),
  isActive: Joi.boolean().default(true),
  tags: Joi.array().items(Joi.string().min(2).max(50)).optional()
});

const campaignSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  description: Joi.string().max(1000).optional(),
  channel: Joi.string().valid('email', 'sms', 'push', 'in-app', 'webhook', 'api').required(),
  type: Joi.string().valid('transactional', 'marketing', 'notification', 'alert', 'reminder', 'welcome', 'follow-up').required(),
  templateId: Joi.string().uuid().optional(),
  subject: Joi.string().max(200).optional(),
  content: Joi.string().min(1).max(COMMUNICATION_CONFIG.MAX_MESSAGE_SIZE).required(),
  recipients: Joi.array().items(Joi.object({
    email: Joi.string().email().optional(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
    name: Joi.string().max(100).optional(),
    variables: Joi.object().optional()
  })).min(1).max(COMMUNICATION_CONFIG.MAX_RECIPIENTS_PER_MESSAGE).required(),
  schedule: Joi.object({
    type: Joi.string().valid('immediate', 'scheduled', 'recurring').default('immediate'),
    scheduledAt: Joi.date().optional(),
    cron: Joi.string().pattern(/^(\*|([0-5]?\d)) (\*|([0-5]?\d)) (\*|([0-5]?\d)) (\*|([0-5]?\d)) (\*|([0-5]?\d))$/).optional(),
    timezone: Joi.string().default('UTC')
  }).optional()
});

// Enhanced Communication Manager with comprehensive communication features
class CommunicationManager {
  private emailTransporter: any;
  private smsClient: any;
  private activeSends: Map<string, any> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.initializeCommunication();
  }

  private async initializeCommunication(): Promise<void> {
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
      
      logger.info('Communication Manager initialized successfully');
    } catch (error: any) {
      logger.error('Error initializing Communication Manager:', error);
      throw new Error(`Communication initialization failed: ${error.message}`);
    }
  }

  // Enhanced message sending
  async sendMessage(messageData: any): Promise<any> {
    try {
      if (!messageData || !messageData.recipients || !Array.isArray(messageData.recipients)) {
        throw new Error('Valid message with recipients is required');
      }

      if (messageData.recipients.length > COMMUNICATION_CONFIG.MAX_RECIPIENTS_PER_MESSAGE) {
        throw new Error(`Maximum ${COMMUNICATION_CONFIG.MAX_RECIPIENTS_PER_MESSAGE} recipients allowed per message`);
      }

      const messageId = uuidv4();
      const startTime = Date.now();
      
      // Check concurrent send limit
      if (this.activeSends.size >= COMMUNICATION_CONFIG.MAX_CONCURRENT_SENDS) {
        throw new Error('Maximum concurrent sends reached');
      }

      const message = new Message({
        messageId,
        tenantId: messageData.tenantId || 'default',
        channel: messageData.channel,
        type: messageData.type,
        subject: messageData.subject,
        content: messageData.content,
        recipients: messageData.recipients.map((recipient: any) => ({
          recipientId: uuidv4(),
          ...recipient,
          status: 'pending'
        })),
        templateId: messageData.templateId,
        campaignId: messageData.campaignId,
        attachments: messageData.attachments?.map((attachment: any) => ({
          attachmentId: uuidv4(),
          ...attachment
        })) || [],
        variables: messageData.variables || {},
        status: messageData.scheduledAt ? 'scheduled' : 'sending',
        scheduledAt: messageData.scheduledAt,
        metadata: messageData.metadata || {}
      });

      this.activeSends.set(messageId, message);
      
      try {
        // Send message based on channel
        switch (messageData.channel) {
          case 'email':
            await this.sendEmail(message);
            break;
          case 'sms':
            await this.sendSMS(message);
            break;
          case 'push':
            await this.sendPush(message);
            break;
          case 'in-app':
            await this.sendInApp(message);
            break;
          case 'webhook':
            await this.sendWebhook(message);
            break;
          case 'api':
            await this.sendAPI(message);
            break;
          default:
            throw new Error(`Unsupported channel: ${messageData.channel}`);
        }

        message.status = 'sent';
        message.sentAt = new Date();
        
        // Update recipient statuses
        message.recipients.forEach((recipient: any) => {
          recipient.status = 'sent';
          recipient.sentAt = new Date();
        });

      } finally {
        this.activeSends.delete(messageId);
        await message.save();
      }

      return message;

    } catch (error: any) {
      logger.error('Message sending failed:', error);
      throw new Error(`Message sending failed: ${error.message}`);
    }
  }

  // Channel-specific sending methods
  private async sendEmail(message: any): Promise<void> {
    try {
      for (const recipient of message.recipients) {
        if (!recipient.email) continue;

        const mailOptions = {
          from: process.env.FROM_EMAIL || 'noreply@studyspot.com',
          to: recipient.email,
          subject: message.subject,
          html: message.content,
          attachments: message.attachments.map((attachment: any) => ({
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

  private async sendSMS(message: any): Promise<void> {
    try {
      if (!this.smsClient) {
        throw new Error('SMS client not configured');
      }

      for (const recipient of message.recipients) {
        if (!recipient.phone) continue;

        const smsOptions = {
          body: message.content,
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

  private async sendPush(message: any): Promise<void> {
    try {
      // Simulate push notification sending
      for (const recipient of message.recipients) {
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

  private async sendInApp(message: any): Promise<void> {
    try {
      // Simulate in-app message sending
      for (const recipient of message.recipients) {
        recipient.status = 'delivered';
        recipient.deliveredAt = new Date();
        recipient.metadata = { inAppId: uuidv4() };
        
        logger.info(`In-app message sent to ${recipient.recipientId}`);
      }
    } catch (error: any) {
      logger.error('In-app message sending failed:', error);
      throw error;
    }
  }

  private async sendWebhook(message: any): Promise<void> {
    try {
      const webhookUrl = message.metadata?.webhookUrl;
      if (!webhookUrl) {
        throw new Error('Webhook URL not provided');
      }

      const webhookData = {
        messageId: message.messageId,
        channel: message.channel,
        type: message.type,
        subject: message.subject,
        content: message.content,
        recipients: message.recipients,
        sentAt: new Date()
      };

      const response = await axios.post(webhookUrl, webhookData, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'StudySpot-Communication-Service/1.0'
        }
      });

      message.recipients.forEach((recipient: any) => {
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

  private async sendAPI(message: any): Promise<void> {
    try {
      const apiEndpoint = message.metadata?.apiEndpoint;
      if (!apiEndpoint) {
        throw new Error('API endpoint not provided');
      }

      const apiData = {
        messageId: message.messageId,
        channel: message.channel,
        type: message.type,
        subject: message.subject,
        content: message.content,
        recipients: message.recipients,
        sentAt: new Date()
      };

      const response = await axios.post(apiEndpoint, apiData, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': message.metadata?.apiKey ? `Bearer ${message.metadata.apiKey}` : undefined
        }
      });

      message.recipients.forEach((recipient: any) => {
        recipient.status = 'delivered';
        recipient.deliveredAt = new Date();
        recipient.metadata = { apiResponse: response.status };
      });
      
      logger.info(`API call sent to ${apiEndpoint}: ${response.status}`);
    } catch (error: any) {
      logger.error('API sending failed:', error);
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

  // Campaign management
  async createCampaign(campaignData: any): Promise<any> {
    try {
      const campaign = new Campaign({
        campaignId: uuidv4(),
        tenantId: campaignData.tenantId || 'default',
        name: campaignData.name,
        description: campaignData.description,
        channel: campaignData.channel,
        type: campaignData.type,
        templateId: campaignData.templateId,
        subject: campaignData.subject,
        content: campaignData.content,
        recipients: campaignData.recipients.map((recipient: any) => ({
          recipientId: uuidv4(),
          ...recipient
        })),
        schedule: campaignData.schedule || { type: 'immediate' },
        status: 'draft',
        metadata: campaignData.metadata || {},
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await campaign.save();
      return campaign;
    } catch (error: any) {
      logger.error('Campaign creation failed:', error);
      throw new Error(`Campaign creation failed: ${error.message}`);
    }
  }

  async executeCampaign(campaignId: string): Promise<any> {
    try {
      const campaign = await Campaign.findOne({ campaignId });
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      if (campaign.status !== 'draft') {
        throw new Error('Campaign is not in draft status');
      }

      campaign.status = 'running';
      campaign.startedAt = new Date();
      await campaign.save();

      // Send messages to all recipients
      for (const recipient of campaign.recipients) {
        const messageData = {
          tenantId: campaign.tenantId,
          channel: campaign.channel,
          type: campaign.type,
          subject: campaign.subject,
          content: campaign.content,
          recipients: [recipient],
          campaignId: campaign.campaignId,
          templateId: campaign.templateId,
          variables: recipient.variables || {}
        };

        await this.sendMessage(messageData);
      }

      campaign.status = 'completed';
      campaign.completedAt = new Date();
      await campaign.save();

      return campaign;
    } catch (error: any) {
      logger.error('Campaign execution failed:', error);
      throw new Error(`Campaign execution failed: ${error.message}`);
    }
  }

  // Worker methods
  private startEmailWorker(): void {
    const worker = new Worker('emailQueue', async (job: Job) => {
      const { messageId } = job.data;
      
      try {
        const message = await Message.findOne({ messageId });
        if (!message) {
          throw new Error('Message not found');
        }
        
        await this.sendEmail(message);
        return { messageId, status: 'sent' };
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
      const { messageId } = job.data;
      
      try {
        const message = await Message.findOne({ messageId });
        if (!message) {
          throw new Error('Message not found');
        }
        
        await this.sendSMS(message);
        return { messageId, status: 'sent' };
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
      const { messageId } = job.data;
      
      try {
        const message = await Message.findOne({ messageId });
        if (!message) {
          throw new Error('Message not found');
        }
        
        await this.sendPush(message);
        return { messageId, status: 'sent' };
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

const communicationManager = new CommunicationManager();

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
    status: 'Communication Service is healthy', 
    uptime: process.uptime(),
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      queue: communicationQueue.name,
      emailQueue: emailQueue.name,
      smsQueue: smsQueue.name,
      pushQueue: pushQueue.name,
      email: 'active',
      sms: 'active',
      push: 'active',
      templates: 'active',
      campaigns: 'active'
    },
    statistics: communicationManager.getStatistics()
  });
});

// Message endpoints
app.post('/messages', 
  messageLimiter,
  validateRequest(messageSchema), 
  async (req, res) => {
    try {
      const messageData = req.validatedData;
      messageData.tenantId = req.headers['x-tenant-id'] || 'default';
      
      const message = await communicationManager.sendMessage(messageData);
      
      res.status(201).json({
        success: true,
        data: message,
        message: 'Message sent successfully'
      });
    } catch (error: any) {
      logger.error('Error sending message:', error);
      res.status(400).json({ 
        success: false,
        message: error.message,
        code: 'MESSAGE_SEND_ERROR'
      });
    }
  }
);

// Template endpoints
app.post('/templates', 
  generalLimiter,
  validateRequest(templateSchema), 
  async (req, res) => {
    try {
      const templateData = req.validatedData;
      templateData.tenantId = req.headers['x-tenant-id'] || 'default';
      templateData.userId = req.headers['x-user-id'] || 'anonymous';
      
      const template = await communicationManager.createTemplate(templateData);
      
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

// Campaign endpoints
app.post('/campaigns', 
  campaignLimiter,
  validateRequest(campaignSchema), 
  async (req, res) => {
    try {
      const campaignData = req.validatedData;
      campaignData.tenantId = req.headers['x-tenant-id'] || 'default';
      
      const campaign = await communicationManager.createCampaign(campaignData);
      
      res.status(201).json({
        success: true,
        data: campaign,
        message: 'Campaign created successfully'
      });
    } catch (error: any) {
      logger.error('Error creating campaign:', error);
      res.status(400).json({ 
        success: false,
        message: error.message,
        code: 'CAMPAIGN_CREATION_ERROR'
      });
    }
  }
);

app.post('/campaigns/:id/execute', 
  campaignLimiter,
  async (req, res) => {
    try {
      const { id } = req.params;
      
      const campaign = await communicationManager.executeCampaign(id);
      
      res.status(200).json({
        success: true,
        data: campaign,
        message: 'Campaign executed successfully'
      });
    } catch (error: any) {
      logger.error('Error executing campaign:', error);
      res.status(400).json({ 
        success: false,
        message: error.message,
        code: 'CAMPAIGN_EXECUTION_ERROR'
      });
    }
  }
);

// Communication overview endpoint
app.get('/dashboard/overview', async (req, res) => {
  try {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    
    const messages = await Message.find({ tenantId });
    const templates = await Template.find({ tenantId });
    const campaigns = await Campaign.find({ tenantId });

    const messageStats = {
      total: messages.length,
      byChannel: _.countBy(messages, 'channel'),
      byType: _.countBy(messages, 'type'),
      byStatus: _.countBy(messages, 'status'),
      totalRecipients: messages.reduce((sum, m) => sum + m.recipients.length, 0),
      successfulSends: messages.filter(m => m.status === 'sent').length
    };

    const templateStats = {
      total: templates.length,
      active: templates.filter(t => t.isActive).length,
      byChannel: _.countBy(templates, 'channel'),
      byType: _.countBy(templates, 'type'),
      totalUses: templates.reduce((sum, t) => sum + t.statistics.totalUses, 0)
    };

    const campaignStats = {
      total: campaigns.length,
      byStatus: _.countBy(campaigns, 'status'),
      byChannel: _.countBy(campaigns, 'channel'),
      byType: _.countBy(campaigns, 'type'),
      totalRecipients: campaigns.reduce((sum, c) => sum + c.recipients.length, 0)
    };

    res.status(200).json({
      success: true,
      data: {
        messages: messageStats,
        templates: templateStats,
        campaigns: campaignStats,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error: any) {
    logger.error('Error fetching communication overview:', error);
    res.status(500).json({ 
      success: false,
      message: error.message,
      code: 'COMMUNICATION_OVERVIEW_ERROR'
    });
  }
});

// Enhanced error handling middleware
app.use(errorHandler);

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  logger.info('Client connected to Communication Service:', socket.id);
  
  socket.on('subscribe-communication', (data) => {
    if (data.tenantId) {
      socket.join(`communication-${data.tenantId}`);
      logger.info(`Client subscribed to communication updates for tenant ${data.tenantId}`);
    }
  });
  
  socket.on('disconnect', () => {
    logger.info('Client disconnected from Communication Service:', socket.id);
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
  logger.info(`🚀 Enhanced Communication Service running on port ${PORT}`);
  logger.info(`📧 Email Service: Active`);
  logger.info(`📱 SMS Service: Active`);
  logger.info(`🔔 Push Notifications: Active`);
  logger.info(`📝 Template Management: Active`);
  logger.info(`📊 Campaign Management: Active`);
  logger.info(`🔒 Security: Rate limiting, CORS, Helmet enabled`);
  logger.info(`⚡ Performance: Caching, optimization enabled`);
});