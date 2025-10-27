import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
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
import Chart from 'chart.js';
import natural from 'natural';
import nlp from 'compromise';
import OpenAI from 'openai';
import _ from 'lodash';
import csv from 'csv-parser';
import ExcelJS from 'exceljs';
import { Parser } from 'json2csv';
import Joi from 'joi';

const app = express();
const PORT = process.env.PORT || 3027;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/useranalyticsdb';
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Configuration
const ANALYTICS_CONFIG = {
  MAX_BATCH_SIZE: 1000,
  PROCESSING_TIMEOUT: 60000, // 1 minute
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  RETENTION_DAYS: 365,
  MAX_EVENTS_PER_REQUEST: 100,
  REAL_TIME_THRESHOLD: 1000, // Events per minute
  ANOMALY_THRESHOLD: 2.0, // Standard deviations
  CORRELATION_THRESHOLD: 0.7,
  PREDICTION_HORIZON_DAYS: 30
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
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const analyticsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // More restrictive for analytics operations
  message: "Too many analytics requests, please try again later.",
});

const batchLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // Very restrictive for batch operations
  message: "Too many batch analytics requests, please try again later.",
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

const analyticsQueue = new Queue('analyticsQueue', { connection });

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
const UserEventSchema = new mongoose.Schema({
  eventId: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v: string) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'Event ID must be a valid UUID'
    }
  },
  tenantId: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return v && v.length >= 3 && v.length <= 50;
      },
      message: 'Tenant ID must be between 3 and 50 characters'
    }
  },
  userId: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return v && v.length >= 3 && v.length <= 50;
      },
      message: 'User ID must be between 3 and 50 characters'
    }
  },
  sessionId: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || v.length >= 10 && v.length <= 100;
      },
      message: 'Session ID must be between 10 and 100 characters'
    }
  },
  eventType: { 
    type: String, 
    required: true,
    enum: ['page_view', 'click', 'scroll', 'form_submit', 'login', 'logout', 'search', 'download', 'upload', 'share', 'comment', 'like', 'purchase', 'custom'],
    validate: {
      validator: function(v: string) {
        return v && v.length >= 2 && v.length <= 50;
      },
      message: 'Event type must be between 2 and 50 characters'
    }
  },
  eventName: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return v && v.length >= 2 && v.length <= 100;
      },
      message: 'Event name must be between 2 and 100 characters'
    }
  },
  properties: {
    url: { 
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || v.length <= 2000;
        },
        message: 'URL must not exceed 2000 characters'
      }
    },
    referrer: { 
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || v.length <= 2000;
        },
        message: 'Referrer must not exceed 2000 characters'
      }
    },
    userAgent: { 
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || v.length <= 500;
        },
        message: 'User agent must not exceed 500 characters'
      }
    },
    ipAddress: { 
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(v) || /^[0-9a-fA-F:]+$/.test(v);
        },
        message: 'Invalid IP address format'
      }
    },
    device: {
      type: { type: String, enum: ['desktop', 'mobile', 'tablet', 'unknown'] },
      os: String,
      browser: String,
      version: String
    },
    location: {
      country: { type: String, maxlength: 2 },
      region: String,
      city: String,
      latitude: { type: Number, min: -90, max: 90 },
      longitude: { type: Number, min: -180, max: 180 }
    },
    custom: mongoose.Schema.Types.Mixed
  },
  metrics: {
    duration: { type: Number, min: 0 },
    scrollDepth: { type: Number, min: 0, max: 100 },
    clickCount: { type: Number, min: 0 },
    formFields: Number,
    searchQuery: String,
    searchResults: Number,
    fileSize: Number,
    downloadTime: Number
  },
  context: {
    pageTitle: String,
    pageCategory: String,
    section: String,
    component: String,
    campaign: String,
    source: String,
    medium: String,
    content: String,
    term: String
  },
  quality: {
    isBot: { type: Boolean, default: false },
    isValid: { type: Boolean, default: true },
    confidence: { type: Number, min: 0, max: 1, default: 1 },
    anomalies: [{
      type: { type: String, enum: ['timing', 'frequency', 'pattern', 'location', 'device'] },
      severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
      description: String,
      score: { type: Number, min: 0, max: 1 }
    }]
  },
  timestamp: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

// Add indexes for better performance
UserEventSchema.index({ tenantId: 1, userId: 1, timestamp: -1 });
UserEventSchema.index({ tenantId: 1, eventType: 1, timestamp: -1 });
UserEventSchema.index({ tenantId: 1, sessionId: 1 });
UserEventSchema.index({ timestamp: 1 }, { expireAfterSeconds: ANALYTICS_CONFIG.RETENTION_DAYS * 24 * 60 * 60 });

const UserEvent = mongoose.model('UserEvent', UserEventSchema);

const UserSessionSchema = new mongoose.Schema({
  sessionId: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v: string) {
        return v && v.length >= 10 && v.length <= 100;
      },
      message: 'Session ID must be between 10 and 100 characters'
    }
  },
  tenantId: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return v && v.length >= 3 && v.length <= 50;
      },
      message: 'Tenant ID must be between 3 and 50 characters'
    }
  },
  userId: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return v && v.length >= 3 && v.length <= 50;
      },
      message: 'User ID must be between 3 and 50 characters'
    }
  },
  startTime: { type: Date, required: true },
  endTime: Date,
  duration: { type: Number, min: 0 },
  pageViews: { type: Number, default: 0, min: 0 },
  events: { type: Number, default: 0, min: 0 },
  bounceRate: { type: Number, min: 0, max: 1 },
  exitRate: { type: Number, min: 0, max: 1 },
  conversionRate: { type: Number, min: 0, max: 1 },
  device: {
    type: { type: String, enum: ['desktop', 'mobile', 'tablet', 'unknown'] },
    os: String,
    browser: String,
    version: String
  },
  location: {
    country: { type: String, maxlength: 2 },
    region: String,
    city: String,
    latitude: { type: Number, min: -90, max: 90 },
    longitude: { type: Number, min: -180, max: 180 }
  },
  traffic: {
    source: String,
    medium: String,
    campaign: String,
    referrer: String,
    landingPage: String,
    exitPage: String
  },
  behavior: {
    avgTimeOnPage: { type: Number, min: 0 },
    scrollDepth: { type: Number, min: 0, max: 100 },
    clickThroughRate: { type: Number, min: 0, max: 1 },
    formCompletionRate: { type: Number, min: 0, max: 1 },
    searchQueries: [String],
    downloads: [String],
    shares: [String]
  },
  quality: {
    isBot: { type: Boolean, default: false },
    isValid: { type: Boolean, default: true },
    confidence: { type: Number, min: 0, max: 1, default: 1 },
    anomalies: [{
      type: { type: String, enum: ['duration', 'frequency', 'pattern', 'location', 'device'] },
      severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
      description: String,
      score: { type: Number, min: 0, max: 1 }
    }]
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes
UserSessionSchema.index({ tenantId: 1, userId: 1, startTime: -1 });
UserSessionSchema.index({ tenantId: 1, startTime: -1 });
UserSessionSchema.index({ sessionId: 1 }, { unique: true });

const UserSession = mongoose.model('UserSession', UserSessionSchema);

const UserProfileSchema = new mongoose.Schema({
  profileId: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v: string) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'Profile ID must be a valid UUID'
    }
  },
  tenantId: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return v && v.length >= 3 && v.length <= 50;
      },
      message: 'Tenant ID must be between 3 and 50 characters'
    }
  },
  userId: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return v && v.length >= 3 && v.length <= 50;
      },
      message: 'User ID must be between 3 and 50 characters'
    }
  },
  demographics: {
    age: { type: Number, min: 0, max: 150 },
    gender: { type: String, enum: ['male', 'female', 'other', 'unknown'] },
    education: { type: String, enum: ['high_school', 'bachelor', 'master', 'phd', 'other', 'unknown'] },
    occupation: String,
    income: { type: String, enum: ['low', 'medium', 'high', 'unknown'] },
    location: {
      country: { type: String, maxlength: 2 },
      region: String,
      city: String,
      timezone: String
    }
  },
  preferences: {
    language: { type: String, maxlength: 10 },
    theme: { type: String, enum: ['light', 'dark', 'auto'] },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    interests: [String],
    categories: [String],
    tags: [String]
  },
  behavior: {
    totalSessions: { type: Number, default: 0, min: 0 },
    totalEvents: { type: Number, default: 0, min: 0 },
    avgSessionDuration: { type: Number, min: 0 },
    avgPageViews: { type: Number, min: 0 },
    bounceRate: { type: Number, min: 0, max: 1 },
    conversionRate: { type: Number, min: 0, max: 1 },
    lastActive: Date,
    firstSeen: Date,
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'occasional'] },
    loyalty: { type: String, enum: ['new', 'returning', 'loyal', 'champion'] },
    value: { type: String, enum: ['low', 'medium', 'high', 'vip'] }
  },
  segments: {
    rfm: {
      recency: { type: String, enum: ['high', 'medium', 'low'] },
      frequency: { type: String, enum: ['high', 'medium', 'low'] },
      monetary: { type: String, enum: ['high', 'medium', 'low'] },
      score: { type: Number, min: 0, max: 5 }
    },
    lifecycle: { type: String, enum: ['new', 'active', 'at_risk', 'churned', 'reactivated'] },
    persona: String,
    cohort: String,
    custom: [String]
  },
  predictions: {
    churnProbability: { type: Number, min: 0, max: 1 },
    lifetimeValue: { type: Number, min: 0 },
    nextPurchaseDate: Date,
    recommendedProducts: [String],
    engagementScore: { type: Number, min: 0, max: 100 },
    satisfactionScore: { type: Number, min: 0, max: 10 }
  },
  quality: {
    completeness: { type: Number, min: 0, max: 1, default: 0 },
    accuracy: { type: Number, min: 0, max: 1, default: 1 },
    lastUpdated: Date,
    dataSource: { type: String, enum: ['tracking', 'survey', 'import', 'inference'] },
    confidence: { type: Number, min: 0, max: 1, default: 1 }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes
UserProfileSchema.index({ tenantId: 1, userId: 1 }, { unique: true });
UserProfileSchema.index({ tenantId: 1, 'segments.lifecycle': 1 });
UserProfileSchema.index({ tenantId: 1, 'behavior.loyalty': 1 });

const UserProfile = mongoose.model('UserProfile', UserProfileSchema);

const AnalyticsReportSchema = new mongoose.Schema({
  reportId: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v: string) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'Report ID must be a valid UUID'
    }
  },
  tenantId: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return v && v.length >= 3 && v.length <= 50;
      },
      message: 'Tenant ID must be between 3 and 50 characters'
    }
  },
  userId: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || v.length >= 3 && v.length <= 50;
      },
      message: 'User ID must be between 3 and 50 characters'
    }
  },
  reportType: { 
    type: String, 
    required: true,
    enum: ['dashboard', 'summary', 'detailed', 'custom', 'scheduled', 'real_time'],
    validate: {
      validator: function(v: string) {
        return v && v.length >= 2 && v.length <= 50;
      },
      message: 'Report type must be between 2 and 50 characters'
    }
  },
  title: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return v && v.length >= 2 && v.length <= 200;
      },
      message: 'Title must be between 2 and 200 characters'
    }
  },
  description: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || v.length <= 1000;
      },
      message: 'Description must not exceed 1000 characters'
    }
  },
  parameters: {
    dateRange: {
      start: Date,
      end: Date,
      granularity: { type: String, enum: ['hour', 'day', 'week', 'month', 'quarter', 'year'] }
    },
    filters: {
      userIds: [String],
      eventTypes: [String],
      segments: [String],
      devices: [String],
      locations: [String],
      custom: mongoose.Schema.Types.Mixed
    },
    metrics: [String],
    dimensions: [String],
    aggregations: [String]
  },
  data: {
    summary: mongoose.Schema.Types.Mixed,
    charts: [{
      type: { type: String, enum: ['line', 'bar', 'pie', 'scatter', 'heatmap', 'funnel', 'cohort'] },
      title: String,
      data: mongoose.Schema.Types.Mixed,
      config: mongoose.Schema.Types.Mixed
    }],
    tables: [{
      title: String,
      headers: [String],
      rows: [[mongoose.Schema.Types.Mixed]],
      summary: mongoose.Schema.Types.Mixed
    }],
    insights: [{
      type: { type: String, enum: ['trend', 'anomaly', 'correlation', 'prediction', 'recommendation'] },
      title: String,
      description: String,
      confidence: { type: Number, min: 0, max: 1 },
      impact: { type: String, enum: ['low', 'medium', 'high'] },
      actionable: { type: Boolean, default: false },
      recommendations: [String]
    }]
  },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'], 
    default: 'pending' 
  },
  processingTime: { type: Number, min: 0 },
  errorMessage: String,
  metadata: {
    generatedBy: { type: String, enum: ['user', 'system', 'scheduled', 'api'] },
    format: { type: String, enum: ['json', 'csv', 'excel', 'pdf', 'html'] },
    size: Number,
    compression: { type: String, enum: ['none', 'gzip', 'brotli'] },
    cacheKey: String,
    expiresAt: Date
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes
AnalyticsReportSchema.index({ tenantId: 1, reportType: 1, createdAt: -1 });
AnalyticsReportSchema.index({ tenantId: 1, userId: 1 });
AnalyticsReportSchema.index({ status: 1 });
AnalyticsReportSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 }); // 30 days

const AnalyticsReport = mongoose.model('AnalyticsReport', AnalyticsReportSchema);

// Enhanced validation schemas
const userEventSchema = Joi.object({
  tenantId: Joi.string().min(3).max(50).required(),
  userId: Joi.string().min(3).max(50).required(),
  sessionId: Joi.string().min(10).max(100).optional(),
  eventType: Joi.string().valid('page_view', 'click', 'scroll', 'form_submit', 'login', 'logout', 'search', 'download', 'upload', 'share', 'comment', 'like', 'purchase', 'custom').required(),
  eventName: Joi.string().min(2).max(100).required(),
  properties: Joi.object({
    url: Joi.string().max(2000).uri().optional(),
    referrer: Joi.string().max(2000).uri().optional(),
    userAgent: Joi.string().max(500).optional(),
    ipAddress: Joi.string().ip().optional(),
    device: Joi.object({
      type: Joi.string().valid('desktop', 'mobile', 'tablet', 'unknown'),
      os: Joi.string().max(50),
      browser: Joi.string().max(50),
      version: Joi.string().max(20)
    }).optional(),
    location: Joi.object({
      country: Joi.string().length(2),
      region: Joi.string().max(100),
      city: Joi.string().max(100),
      latitude: Joi.number().min(-90).max(90),
      longitude: Joi.number().min(-180).max(180)
    }).optional(),
    custom: Joi.object().optional()
  }).optional(),
  metrics: Joi.object({
    duration: Joi.number().min(0),
    scrollDepth: Joi.number().min(0).max(100),
    clickCount: Joi.number().min(0),
    formFields: Joi.number().min(0),
    searchQuery: Joi.string().max(500),
    searchResults: Joi.number().min(0),
    fileSize: Joi.number().min(0),
    downloadTime: Joi.number().min(0)
  }).optional(),
  context: Joi.object({
    pageTitle: Joi.string().max(200),
    pageCategory: Joi.string().max(100),
    section: Joi.string().max(100),
    component: Joi.string().max(100),
    campaign: Joi.string().max(100),
    source: Joi.string().max(100),
    medium: Joi.string().max(100),
    content: Joi.string().max(200),
    term: Joi.string().max(200)
  }).optional()
});

const analyticsQuerySchema = Joi.object({
  tenantId: Joi.string().min(3).max(50).required(),
  dateRange: Joi.object({
    start: Joi.date().required(),
    end: Joi.date().required(),
    granularity: Joi.string().valid('hour', 'day', 'week', 'month', 'quarter', 'year').default('day')
  }).required(),
  filters: Joi.object({
    userIds: Joi.array().items(Joi.string().min(3).max(50)),
    eventTypes: Joi.array().items(Joi.string().valid('page_view', 'click', 'scroll', 'form_submit', 'login', 'logout', 'search', 'download', 'upload', 'share', 'comment', 'like', 'purchase', 'custom')),
    segments: Joi.array().items(Joi.string().max(100)),
    devices: Joi.array().items(Joi.string().valid('desktop', 'mobile', 'tablet', 'unknown')),
    locations: Joi.array().items(Joi.string().length(2)),
    custom: Joi.object()
  }).optional(),
  metrics: Joi.array().items(Joi.string().max(50)).min(1).required(),
  dimensions: Joi.array().items(Joi.string().max(50)).optional(),
  aggregations: Joi.array().items(Joi.string().valid('sum', 'avg', 'min', 'max', 'count', 'distinct')).optional()
});

// Enhanced Analytics utilities with comprehensive error handling
class AnalyticsManager {
  private cache: Map<string, any> = new Map();
  private readonly CACHE_TTL = ANALYTICS_CONFIG.CACHE_TTL;
  private openai: OpenAI | null = null;

  constructor() {
    if (OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    }
    
    // Initialize natural language processing
    natural.PorterStemmer.attach();
  }

  // Enhanced event processing with quality checks
  async processEvent(eventData: any): Promise<any> {
    try {
      if (!eventData || typeof eventData !== 'object') {
        throw new Error('Event data must be a valid object');
      }

      // Quality assessment
      const quality = await this.assessEventQuality(eventData);
      
      // Anomaly detection
      const anomalies = await this.detectAnomalies(eventData);
      
      // Bot detection
      const isBot = await this.detectBot(eventData);

      const processedEvent = {
        ...eventData,
        eventId: uuidv4(),
        quality: {
          isBot,
          isValid: quality.isValid,
          confidence: quality.confidence,
          anomalies
        },
        timestamp: new Date(),
        createdAt: new Date()
      };

      return processedEvent;

    } catch (error: any) {
      logger.error('Error processing event:', error);
      throw new Error(`Event processing failed: ${error.message}`);
    }
  }

  // Enhanced event quality assessment
  async assessEventQuality(eventData: any): Promise<any> {
    try {
      const quality = {
        isValid: true,
        confidence: 1.0,
        issues: []
      };

      // Basic validation checks
      if (!eventData.tenantId || !eventData.userId || !eventData.eventType) {
        quality.isValid = false;
        quality.confidence = 0;
        quality.issues.push('Missing required fields');
      }

      // URL validation
      if (eventData.properties?.url && !this.isValidUrl(eventData.properties.url)) {
        quality.confidence *= 0.8;
        quality.issues.push('Invalid URL format');
      }

      // IP address validation
      if (eventData.properties?.ipAddress && !this.isValidIP(eventData.properties.ipAddress)) {
        quality.confidence *= 0.9;
        quality.issues.push('Invalid IP address format');
      }

      // Timestamp validation
      if (eventData.timestamp && !this.isValidTimestamp(eventData.timestamp)) {
        quality.confidence *= 0.7;
        quality.issues.push('Invalid timestamp');
      }

      // Device validation
      if (eventData.properties?.device && !this.isValidDevice(eventData.properties.device)) {
        quality.confidence *= 0.9;
        quality.issues.push('Invalid device information');
      }

      return quality;

    } catch (error: any) {
      logger.error('Error assessing event quality:', error);
      return {
        isValid: false,
        confidence: 0,
        issues: ['Quality assessment failed']
      };
    }
  }

  // Enhanced anomaly detection
  async detectAnomalies(eventData: any): Promise<any[]> {
    try {
      const anomalies = [];

      // Timing anomalies
      if (eventData.timestamp) {
        const now = new Date();
        const eventTime = new Date(eventData.timestamp);
        const timeDiff = Math.abs(now.getTime() - eventTime.getTime());
        
        if (timeDiff > 24 * 60 * 60 * 1000) { // More than 24 hours
          anomalies.push({
            type: 'timing',
            severity: 'high',
            description: 'Event timestamp is more than 24 hours old',
            score: 0.8
          });
        }
      }

      // Frequency anomalies
      if (eventData.userId && eventData.eventType) {
        const recentEvents = await UserEvent.countDocuments({
          tenantId: eventData.tenantId,
          userId: eventData.userId,
          eventType: eventData.eventType,
          timestamp: { $gte: new Date(Date.now() - 60 * 1000) } // Last minute
        });

        if (recentEvents > 100) { // More than 100 events per minute
          anomalies.push({
            type: 'frequency',
            severity: 'high',
            description: 'Unusually high event frequency',
            score: 0.9
          });
        }
      }

      // Pattern anomalies
      if (eventData.properties?.userAgent) {
        if (this.isSuspiciousUserAgent(eventData.properties.userAgent)) {
          anomalies.push({
            type: 'pattern',
            severity: 'medium',
            description: 'Suspicious user agent pattern',
            score: 0.7
          });
        }
      }

      return anomalies;

    } catch (error: any) {
      logger.error('Error detecting anomalies:', error);
      return [];
    }
  }

  // Enhanced bot detection
  async detectBot(eventData: any): Promise<boolean> {
    try {
      let botScore = 0;

      // User agent analysis
      if (eventData.properties?.userAgent) {
        const userAgent = eventData.properties.userAgent.toLowerCase();
        const botPatterns = ['bot', 'crawler', 'spider', 'scraper', 'headless', 'phantom', 'selenium'];
        
        if (botPatterns.some(pattern => userAgent.includes(pattern))) {
          botScore += 0.8;
        }
      }

      // Behavior analysis
      if (eventData.eventType === 'page_view' && eventData.metrics?.duration < 1000) {
        botScore += 0.3; // Very short page views
      }

      // Frequency analysis
      if (eventData.userId) {
        const recentEvents = await UserEvent.countDocuments({
          tenantId: eventData.tenantId,
          userId: eventData.userId,
          timestamp: { $gte: new Date(Date.now() - 60 * 1000) }
        });

        if (recentEvents > 50) {
          botScore += 0.5; // High frequency
        }
      }

      return botScore > 0.5;

    } catch (error: any) {
      logger.error('Error detecting bot:', error);
      return false;
    }
  }

  // Enhanced analytics calculation
  async calculateAnalytics(query: any): Promise<any> {
    try {
      const { tenantId, dateRange, filters, metrics, dimensions, aggregations } = query;

      // Build aggregation pipeline
      const pipeline = this.buildAggregationPipeline(tenantId, dateRange, filters, metrics, dimensions, aggregations);

      // Execute aggregation
      const results = await UserEvent.aggregate(pipeline);

      // Process results
      const processedResults = this.processAggregationResults(results, metrics, dimensions);

      // Generate insights
      const insights = await this.generateInsights(processedResults, query);

      return {
        data: processedResults,
        insights,
        metadata: {
          query,
          generatedAt: new Date(),
          recordCount: results.length
        }
      };

    } catch (error: any) {
      logger.error('Error calculating analytics:', error);
      throw new Error(`Analytics calculation failed: ${error.message}`);
    }
  }

  // Build MongoDB aggregation pipeline
  private buildAggregationPipeline(tenantId: string, dateRange: any, filters: any, metrics: string[], dimensions: string[], aggregations: string[]): any[] {
    const pipeline: any[] = [];

    // Match stage
    const matchStage: any = {
      tenantId,
      timestamp: {
        $gte: new Date(dateRange.start),
        $lte: new Date(dateRange.end)
      }
    };

    // Apply filters
    if (filters) {
      if (filters.userIds) matchStage.userId = { $in: filters.userIds };
      if (filters.eventTypes) matchStage.eventType = { $in: filters.eventTypes };
      if (filters.devices) matchStage['properties.device.type'] = { $in: filters.devices };
      if (filters.locations) matchStage['properties.location.country'] = { $in: filters.locations };
    }

    pipeline.push({ $match: matchStage });

    // Group stage
    const groupStage: any = { _id: {} };

    // Add dimensions to group
    if (dimensions) {
      dimensions.forEach(dim => {
        groupStage._id[dim] = `$${dim}`;
      });
    }

    // Add metrics to group
    metrics.forEach(metric => {
      switch (metric) {
        case 'totalEvents':
          groupStage.totalEvents = { $sum: 1 };
          break;
        case 'uniqueUsers':
          groupStage.uniqueUsers = { $addToSet: '$userId' };
          break;
        case 'avgDuration':
          groupStage.avgDuration = { $avg: '$metrics.duration' };
          break;
        case 'totalPageViews':
          groupStage.totalPageViews = { $sum: { $cond: [{ $eq: ['$eventType', 'page_view'] }, 1, 0] } };
          break;
        case 'bounceRate':
          groupStage.bounceRate = { $avg: { $cond: [{ $eq: ['$eventType', 'page_view'] }, 1, 0] } };
          break;
        default:
          groupStage[metric] = { $sum: `$${metric}` };
      }
    });

    pipeline.push({ $group: groupStage });

    // Sort stage
    pipeline.push({ $sort: { _id: 1 } });

    return pipeline;
  }

  // Process aggregation results
  private processAggregationResults(results: any[], metrics: string[], dimensions: string[]): any {
    const processed = {
      summary: {},
      series: [],
      categories: []
    };

    // Process summary
    if (results.length > 0) {
      const summary = results[0];
      metrics.forEach(metric => {
        if (metric === 'uniqueUsers') {
          processed.summary[metric] = summary[metric]?.length || 0;
        } else {
          processed.summary[metric] = summary[metric] || 0;
        }
      });
    }

    // Process series data
    results.forEach(result => {
      const dataPoint: any = {};
      
      if (dimensions) {
        dimensions.forEach(dim => {
          dataPoint[dim] = result._id[dim];
        });
      }

      metrics.forEach(metric => {
        if (metric === 'uniqueUsers') {
          dataPoint[metric] = result[metric]?.length || 0;
        } else {
          dataPoint[metric] = result[metric] || 0;
        }
      });

      processed.series.push(dataPoint);
    });

    return processed;
  }

  // Generate insights using AI
  async generateInsights(data: any, query: any): Promise<any[]> {
    try {
      if (!this.openai) {
        return this.generateBasicInsights(data, query);
      }

      const prompt = `
        Analyze the following analytics data and provide insights:
        
        Query: ${JSON.stringify(query)}
        Data: ${JSON.stringify(data)}
        
        Provide insights in the following format:
        - Type: trend, anomaly, correlation, prediction, recommendation
        - Title: Brief title
        - Description: Detailed description
        - Confidence: 0-1 score
        - Impact: low, medium, high
        - Actionable: true/false
        - Recommendations: Array of actionable recommendations
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000
      });

      const insights = JSON.parse(response.choices[0].message.content || '[]');
      return insights;

    } catch (error: any) {
      logger.error('Error generating AI insights:', error);
      return this.generateBasicInsights(data, query);
    }
  }

  // Generate basic insights without AI
  private generateBasicInsights(data: any, query: any): any[] {
    const insights = [];

    // Trend analysis
    if (data.series && data.series.length > 2) {
      const firstValue = data.series[0].totalEvents || 0;
      const lastValue = data.series[data.series.length - 1].totalEvents || 0;
      const trend = lastValue > firstValue ? 'increasing' : 'decreasing';
      
      insights.push({
        type: 'trend',
        title: `Event ${trend} trend detected`,
        description: `Events have been ${trend} over the selected period`,
        confidence: 0.8,
        impact: 'medium',
        actionable: true,
        recommendations: [
          `Monitor ${trend} trend closely`,
          'Investigate contributing factors',
          'Adjust strategies accordingly'
        ]
      });
    }

    // Anomaly detection
    if (data.summary.totalEvents > 1000) {
      insights.push({
        type: 'anomaly',
        title: 'High event volume detected',
        description: 'Event volume is significantly higher than normal',
        confidence: 0.9,
        impact: 'high',
        actionable: true,
        recommendations: [
          'Investigate traffic sources',
          'Check for bot activity',
          'Monitor system performance'
        ]
      });
    }

    return insights;
  }

  // Utility methods
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private isValidIP(ip: string): boolean {
    return /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ip) || /^[0-9a-fA-F:]+$/.test(ip);
  }

  private isValidTimestamp(timestamp: any): boolean {
    const date = new Date(timestamp);
    return !isNaN(date.getTime()) && date.getTime() > 0;
  }

  private isValidDevice(device: any): boolean {
    return device && typeof device === 'object' && device.type;
  }

  private isSuspiciousUserAgent(userAgent: string): boolean {
    const suspiciousPatterns = ['bot', 'crawler', 'spider', 'scraper', 'headless'];
    return suspiciousPatterns.some(pattern => userAgent.toLowerCase().includes(pattern));
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

const analyticsManager = new AnalyticsManager();

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
    status: 'User Analytics Service is healthy', 
    uptime: process.uptime(),
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      cache: analyticsManager.getCacheStats(),
      queue: analyticsQueue.name
    }
  });
});

// Track user event with enhanced validation
app.post('/events', 
  analyticsLimiter,
  validateRequest(userEventSchema), 
  async (req, res) => {
    try {
      const eventData = req.validatedData;
      
      // Process event
      const processedEvent = await analyticsManager.processEvent(eventData);
      
      // Save event
      const event = new UserEvent(processedEvent);
      await event.save();
      
      // Update session if provided
      if (eventData.sessionId) {
        await UserSession.findOneAndUpdate(
          { sessionId: eventData.sessionId, tenantId: eventData.tenantId },
          { 
            $inc: { events: 1 },
            $set: { updatedAt: new Date() }
          },
          { upsert: true }
        );
      }
      
      res.status(201).json({
        success: true,
        data: {
          eventId: event.eventId,
          timestamp: event.timestamp,
          quality: event.quality
        },
        message: 'Event tracked successfully'
      });
    } catch (error: any) {
      logger.error('Error tracking event:', error);
      res.status(400).json({ 
        success: false,
        message: error.message,
        code: 'EVENT_TRACKING_ERROR'
      });
    }
  }
);

// Batch track events with enhanced validation
app.post('/events/batch', 
  batchLimiter,
  async (req, res) => {
    try {
      const { events } = req.body;
      
      if (!Array.isArray(events) || events.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Events array is required and must not be empty',
          code: 'INVALID_EVENTS_ARRAY'
        });
      }

      if (events.length > ANALYTICS_CONFIG.MAX_BATCH_SIZE) {
        return res.status(400).json({
          success: false,
          message: `Batch size ${events.length} exceeds maximum allowed size ${ANALYTICS_CONFIG.MAX_BATCH_SIZE}`,
          code: 'BATCH_SIZE_EXCEEDED'
        });
      }

      const processedEvents = [];
      const errors = [];

      for (const eventData of events) {
        try {
          const processedEvent = await analyticsManager.processEvent(eventData);
          processedEvents.push(processedEvent);
        } catch (error: any) {
          errors.push({
            event: eventData,
            error: error.message
          });
        }
      }

      if (processedEvents.length > 0) {
        await UserEvent.insertMany(processedEvents);
      }

      res.status(201).json({
        success: true,
        data: {
          processed: processedEvents.length,
          errors: errors.length,
          total: events.length
        },
        message: `Batch processing completed: ${processedEvents.length} events processed, ${errors.length} errors`
      });
    } catch (error: any) {
      logger.error('Error batch tracking events:', error);
      res.status(400).json({ 
        success: false,
        message: error.message,
        code: 'BATCH_TRACKING_ERROR'
      });
    }
  }
);

// Get analytics with enhanced querying
app.post('/analytics', 
  analyticsLimiter,
  validateRequest(analyticsQuerySchema), 
  async (req, res) => {
    try {
      const query = req.validatedData;
      
      // Check cache first
      const cacheKey = `analytics-${JSON.stringify(query)}`;
      const cached = analyticsManager.getCacheStats();
      
      // Calculate analytics
      const results = await analyticsManager.calculateAnalytics(query);
      
      res.status(200).json({
        success: true,
        data: results,
        message: 'Analytics calculated successfully'
      });
    } catch (error: any) {
      logger.error('Error calculating analytics:', error);
      res.status(400).json({ 
        success: false,
        message: error.message,
        code: 'ANALYTICS_CALCULATION_ERROR'
      });
    }
  }
);

// Get user profile with enhanced data
app.get('/profiles/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { tenantId } = req.query;
    
    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'tenantId is required',
        code: 'MISSING_TENANT_ID'
      });
    }
    
    const profile = await UserProfile.findOne({ tenantId, userId });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
        code: 'PROFILE_NOT_FOUND'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        profileId: profile.profileId,
        userId: profile.userId,
        demographics: profile.demographics,
        preferences: profile.preferences,
        behavior: profile.behavior,
        segments: profile.segments,
        predictions: profile.predictions,
        quality: profile.quality,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt
      }
    });
  } catch (error: any) {
    logger.error('Error fetching user profile:', error);
    res.status(500).json({ 
      success: false,
      message: error.message,
      code: 'FETCH_PROFILE_ERROR'
    });
  }
});

// Get analytics report with enhanced response
app.get('/reports/:reportId', async (req, res) => {
  try {
    const { reportId } = req.params;
    
    if (!reportId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reportId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID format',
        code: 'INVALID_REPORT_ID'
      });
    }
    
    const report = await AnalyticsReport.findOne({ reportId });
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Analytics report not found',
        code: 'REPORT_NOT_FOUND'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        reportId: report.reportId,
        reportType: report.reportType,
        title: report.title,
        description: report.description,
        status: report.status,
        data: report.data,
        processingTime: report.processingTime,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt
      }
    });
  } catch (error: any) {
    logger.error('Error fetching analytics report:', error);
    res.status(500).json({ 
      success: false,
      message: error.message,
      code: 'FETCH_REPORT_ERROR'
    });
  }
});

// Enhanced error handling middleware
app.use(errorHandler);

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  logger.info('Client connected to User Analytics Service:', socket.id);
  
  socket.on('subscribe-analytics', (data) => {
    if (data.tenantId) {
      socket.join(`analytics-${data.tenantId}`);
      logger.info(`Client subscribed to analytics updates for tenant ${data.tenantId}`);
    }
  });
  
  socket.on('disconnect', () => {
    logger.info('Client disconnected from User Analytics Service:', socket.id);
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
  logger.info(`Enhanced User Analytics Service running on port ${PORT}`);
  console.log(`Enhanced User Analytics Service running on port ${PORT}`);
});