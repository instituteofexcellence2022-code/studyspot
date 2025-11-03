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
import multer from 'multer';
import sharp from 'sharp';
import natural from 'natural';
import Sentiment from 'sentiment';
import nlp from 'compromise';
import franc from 'franc';
import { NlpManager } from 'natural';
import OpenAI from 'openai';
import Jimp from 'jimp';

const app = express();
const PORT = process.env.PORT || 3009;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aidb';
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

// Configuration
const AI_CONFIG = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_FILES: 10,
  MAX_TEXT_LENGTH: 10000,
  MAX_TOKENS: 4000,
  DEFAULT_TEMPERATURE: 0.7,
  DEFAULT_MODEL: 'gpt-3.5-turbo',
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  RETENTION_DAYS: 30,
  MAX_CONCURRENT_REQUESTS: 100,
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: 100
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
  windowMs: AI_CONFIG.RATE_LIMIT_WINDOW,
  max: AI_CONFIG.RATE_LIMIT_MAX,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const aiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // More restrictive for AI operations
  message: "Too many AI requests, please try again later.",
});

const openaiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Very restrictive for OpenAI API calls
  message: "Too many OpenAI API requests, please try again later.",
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

const aiQueue = new Queue('aiQueue', { connection });

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
const AIRequestSchema = new mongoose.Schema({
  requestId: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v: string) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'Request ID must be a valid UUID'
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
  type: { 
    type: String, 
    required: true,
    enum: ['nlp', 'computer_vision', 'sentiment', 'language_detection', 'text_generation', 'image_analysis', 'chatbot', 'summarization', 'translation', 'classification'],
    validate: {
      validator: function(v: string) {
        return v && v.length >= 2 && v.length <= 50;
      },
      message: 'Type must be between 2 and 50 characters'
    }
  },
  input: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return v && v.length >= 1 && v.length <= AI_CONFIG.MAX_TEXT_LENGTH;
      },
      message: `Input must be between 1 and ${AI_CONFIG.MAX_TEXT_LENGTH} characters`
    }
  },
  parameters: {
    model: { 
      type: String, 
      default: AI_CONFIG.DEFAULT_MODEL,
      validate: {
        validator: function(v: string) {
          return !v || v.length >= 2 && v.length <= 100;
        },
        message: 'Model must be between 2 and 100 characters'
      }
    },
    temperature: { 
      type: Number, 
      min: 0, 
      max: 2, 
      default: AI_CONFIG.DEFAULT_TEMPERATURE 
    },
    maxTokens: { 
      type: Number, 
      min: 1, 
      max: AI_CONFIG.MAX_TOKENS, 
      default: 150 
    },
    language: { 
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^[a-z]{2}$/.test(v);
        },
        message: 'Language must be a valid ISO 639-1 code'
      }
    },
    context: mongoose.Schema.Types.Mixed,
    options: mongoose.Schema.Types.Mixed
  },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'], 
    default: 'pending' 
  },
  result: mongoose.Schema.Types.Mixed,
  confidence: { 
    type: Number, 
    min: 0, 
    max: 1, 
    default: 0 
  },
  processingTime: { 
    type: Number, 
    min: 0, 
    default: 0 
  },
  errorMessage: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || v.length <= 1000;
      },
      message: 'Error message must be less than 1000 characters'
    }
  },
  metadata: {
    ipAddress: { 
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(v) || /^[0-9a-fA-F:]+$/.test(v);
        },
        message: 'Invalid IP address format'
      }
    },
    userAgent: String,
    requestSize: { type: Number, min: 0 },
    responseSize: { type: Number, min: 0 },
    tokensUsed: { type: Number, min: 0 },
    cost: { type: Number, min: 0, default: 0 },
    quality: { 
      type: String, 
      enum: ['low', 'medium', 'high', 'excellent'], 
      default: 'medium' 
    }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes for better performance
AIRequestSchema.index({ requestId: 1 }, { unique: true });
AIRequestSchema.index({ userId: 1, createdAt: -1 });
AIRequestSchema.index({ tenantId: 1, createdAt: -1 });
AIRequestSchema.index({ type: 1, status: 1 });
AIRequestSchema.index({ status: 1, createdAt: -1 });
AIRequestSchema.index({ createdAt: 1 }, { expireAfterSeconds: AI_CONFIG.RETENTION_DAYS * 24 * 60 * 60 });

const AIRequest = mongoose.model('AIRequest', AIRequestSchema);

const ChatSessionSchema = new mongoose.Schema({
  sessionId: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v: string) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'Session ID must be a valid UUID'
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
  title: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || v.length >= 1 && v.length <= 200;
      },
      message: 'Title must be between 1 and 200 characters'
    }
  },
  context: {
    domain: { 
      type: String,
      enum: ['general', 'library', 'study', 'booking', 'support', 'technical'],
      default: 'general'
    },
    language: { 
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^[a-z]{2}$/.test(v);
        },
        message: 'Language must be a valid ISO 639-1 code'
      }
    },
    preferences: {
      responseStyle: { 
        type: String, 
        enum: ['formal', 'casual', 'friendly', 'professional'], 
        default: 'friendly' 
      },
      maxResponseLength: { type: Number, min: 50, max: 1000, default: 200 },
      includeExamples: { type: Boolean, default: false },
      includeCode: { type: Boolean, default: false }
    },
    metadata: mongoose.Schema.Types.Mixed
  },
  messages: [{
    messageId: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v: string) {
          return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
        },
        message: 'Message ID must be a valid UUID'
      }
    },
    role: { 
      type: String, 
      enum: ['user', 'assistant', 'system'], 
      required: true 
    },
    content: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v: string) {
          return v && v.length >= 1 && v.length <= AI_CONFIG.MAX_TEXT_LENGTH;
        },
        message: `Content must be between 1 and ${AI_CONFIG.MAX_TEXT_LENGTH} characters`
      }
    },
    timestamp: { type: Date, default: Date.now },
    metadata: {
      tokens: { type: Number, min: 0 },
      model: String,
      confidence: { type: Number, min: 0, max: 1 },
      processingTime: { type: Number, min: 0 },
      quality: { 
        type: String, 
        enum: ['low', 'medium', 'high', 'excellent'], 
        default: 'medium' 
      }
    }
  }],
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'archived', 'deleted'], 
    default: 'active' 
  },
  statistics: {
    totalMessages: { type: Number, default: 0 },
    userMessages: { type: Number, default: 0 },
    assistantMessages: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
    averageResponseTime: { type: Number, default: 0 },
    lastActivity: { type: Date, default: Date.now }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes
ChatSessionSchema.index({ sessionId: 1 }, { unique: true });
ChatSessionSchema.index({ userId: 1, createdAt: -1 });
ChatSessionSchema.index({ tenantId: 1, status: 1 });
ChatSessionSchema.index({ status: 1, lastActivity: -1 });
ChatSessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: AI_CONFIG.RETENTION_DAYS * 24 * 60 * 60 });

const ChatSession = mongoose.model('ChatSession', ChatSessionSchema);

const AIInsightSchema = new mongoose.Schema({
  insightId: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v: string) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'Insight ID must be a valid UUID'
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
  type: { 
    type: String, 
    required: true,
    enum: ['trend', 'anomaly', 'recommendation', 'prediction', 'pattern', 'optimization'],
    validate: {
      validator: function(v: string) {
        return v && v.length >= 2 && v.length <= 50;
      },
      message: 'Type must be between 2 and 50 characters'
    }
  },
  title: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return v && v.length >= 5 && v.length <= 200;
      },
      message: 'Title must be between 5 and 200 characters'
    }
  },
  description: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return v && v.length >= 10 && v.length <= 2000;
      },
      message: 'Description must be between 10 and 2000 characters'
    }
  },
  confidence: { 
    type: Number, 
    required: true,
    min: 0, 
    max: 1,
    validate: {
      validator: function(v: number) {
        return v >= 0 && v <= 1;
      },
      message: 'Confidence must be between 0 and 1'
    }
  },
  data: {
    source: { 
      type: String,
      enum: ['user_behavior', 'system_metrics', 'external_data', 'ai_analysis'],
      required: true
    },
    metrics: mongoose.Schema.Types.Mixed,
    trends: mongoose.Schema.Types.Mixed,
    patterns: mongoose.Schema.Types.Mixed,
    predictions: mongoose.Schema.Types.Mixed,
    recommendations: mongoose.Schema.Types.Mixed
  },
  actionable: { 
    type: Boolean, 
    default: false 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'], 
    default: 'medium' 
  },
  tags: [{
    type: String,
    validate: {
      validator: function(v: string) {
        return v && v.length >= 2 && v.length <= 50;
      },
      message: 'Tag must be between 2 and 50 characters'
    }
  }],
  status: { 
    type: String, 
    enum: ['new', 'reviewed', 'implemented', 'dismissed'], 
    default: 'new' 
  },
  impact: {
    estimatedValue: { type: Number, min: 0 },
    effort: { 
      type: String, 
      enum: ['low', 'medium', 'high'], 
      default: 'medium' 
    },
    timeframe: { 
      type: String, 
      enum: ['immediate', 'short_term', 'medium_term', 'long_term'], 
      default: 'short_term' 
    }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes
AIInsightSchema.index({ insightId: 1 }, { unique: true });
AIInsightSchema.index({ tenantId: 1, createdAt: -1 });
AIInsightSchema.index({ type: 1, priority: 1 });
AIInsightSchema.index({ status: 1, actionable: 1 });
AIInsightSchema.index({ createdAt: 1 }, { expireAfterSeconds: AI_CONFIG.RETENTION_DAYS * 24 * 60 * 60 });

const AIInsight = mongoose.model('AIInsight', AIInsightSchema);

// Initialize AI components
const sentiment = new Sentiment();
const nlpManager = new NlpManager({ languages: ['en', 'hi', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'] });

// OpenAI configuration
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  timeout: 30000,
  maxRetries: 3
});

// File upload configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: AI_CONFIG.MAX_FILE_SIZE,
    files: AI_CONFIG.MAX_FILES
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'text/plain', 'text/csv', 'application/pdf', 'application/json'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}`), false);
    }
  }
});

// Enhanced validation schemas
const aiRequestSchema = Joi.object({
  type: Joi.string().valid('nlp', 'computer_vision', 'sentiment', 'language_detection', 'text_generation', 'image_analysis', 'chatbot', 'summarization', 'translation', 'classification').required(),
  input: Joi.string().min(1).max(AI_CONFIG.MAX_TEXT_LENGTH).required(),
  parameters: Joi.object({
    model: Joi.string().max(100).optional(),
    temperature: Joi.number().min(0).max(2).default(AI_CONFIG.DEFAULT_TEMPERATURE),
    maxTokens: Joi.number().min(1).max(AI_CONFIG.MAX_TOKENS).default(150),
    language: Joi.string().pattern(/^[a-z]{2}$/).optional(),
    context: Joi.object().optional(),
    options: Joi.object().optional()
  }).optional()
});

const chatMessageSchema = Joi.object({
  content: Joi.string().min(1).max(AI_CONFIG.MAX_TEXT_LENGTH).required(),
  sessionId: Joi.string().uuid().optional(),
  context: Joi.object({
    domain: Joi.string().valid('general', 'library', 'study', 'booking', 'support', 'technical').default('general'),
    language: Joi.string().pattern(/^[a-z]{2}$/).optional(),
    preferences: Joi.object({
      responseStyle: Joi.string().valid('formal', 'casual', 'friendly', 'professional').default('friendly'),
      maxResponseLength: Joi.number().min(50).max(1000).default(200),
      includeExamples: Joi.boolean().default(false),
      includeCode: Joi.boolean().default(false)
    }).optional()
  }).optional()
});

const textGenerationSchema = Joi.object({
  prompt: Joi.string().min(1).max(AI_CONFIG.MAX_TEXT_LENGTH).required(),
  model: Joi.string().max(100).default(AI_CONFIG.DEFAULT_MODEL),
  maxTokens: Joi.number().min(1).max(AI_CONFIG.MAX_TOKENS).default(150),
  temperature: Joi.number().min(0).max(2).default(AI_CONFIG.DEFAULT_TEMPERATURE),
  context: Joi.object().optional()
});

// Enhanced AI utilities with comprehensive error handling
class AIManager {
  private cache: Map<string, any> = new Map();
  private readonly CACHE_TTL = AI_CONFIG.CACHE_TTL;
  private requestCounts: Map<string, number> = new Map();

  constructor() {
    this.initializeAI();
  }

  private async initializeAI(): Promise<void> {
    try {
      // Initialize NLP models
      await nlpManager.train();
      logger.info('NLP models initialized successfully');
      
      // Initialize sentiment analysis
      logger.info('Sentiment analysis initialized');
      
      // Initialize OpenAI
      if (OPENAI_API_KEY) {
        logger.info('OpenAI API initialized');
      } else {
        logger.warn('OpenAI API key not provided, text generation will be limited');
      }
      
    } catch (error: any) {
      logger.error('Error initializing AI components:', error);
      throw new Error(`AI initialization failed: ${error.message}`);
    }
  }

  // Enhanced NLP analysis with comprehensive error handling
  async performNLPAnalysis(text: string, parameters: any = {}): Promise<any> {
    try {
      if (!text || typeof text !== 'string') {
        throw new Error('Valid text input is required');
      }

      if (text.length > AI_CONFIG.MAX_TEXT_LENGTH) {
        throw new Error(`Text length exceeds maximum limit of ${AI_CONFIG.MAX_TEXT_LENGTH} characters`);
      }

      const startTime = Date.now();
      
      // Check cache first
      const cacheKey = `nlp-${Buffer.from(text).toString('base64').slice(0, 50)}`;
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return cached.data;
      }

      // Perform NLP analysis
      const doc = nlp(text);
      
      const analysis = {
        text,
        tokens: doc.terms().out('array'),
        sentences: doc.sentences().out('array'),
        entities: {
          people: doc.people().out('array'),
          places: doc.places().out('array'),
          organizations: doc.organizations().out('array'),
          topics: doc.topics().out('array'),
          money: doc.money().out('array'),
          dates: doc.dates().out('array'),
          emails: doc.emails().out('array'),
          urls: doc.urls().out('array')
        },
        sentiment: sentiment.analyze(text),
        language: franc(text),
        keywords: doc.keywords().out('array'),
        summary: doc.summary().out('text'),
        confidence: this.calculateConfidence(text, doc),
        processingTime: Date.now() - startTime,
        metadata: {
          wordCount: text.split(' ').length,
          characterCount: text.length,
          sentenceCount: doc.sentences().out('array').length,
          entityCount: Object.values(doc.people().out('array')).length + 
                      Object.values(doc.places().out('array')).length +
                      Object.values(doc.organizations().out('array')).length
        }
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: analysis,
        timestamp: Date.now()
      });

      return analysis;

    } catch (error: any) {
      logger.error('NLP analysis failed:', error);
      throw new Error(`NLP analysis failed: ${error.message}`);
    }
  }

  // Enhanced sentiment analysis
  async performSentimentAnalysis(text: string): Promise<any> {
    try {
      if (!text || typeof text !== 'string') {
        throw new Error('Valid text input is required');
      }

      const startTime = Date.now();
      
      // Check cache first
      const cacheKey = `sentiment-${Buffer.from(text).toString('base64').slice(0, 50)}`;
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return cached.data;
      }

      // Perform sentiment analysis
      const sentimentResult = sentiment.analyze(text);
      
      // Additional analysis using compromise
      const doc = nlp(text);
      const entities = {
        people: doc.people().out('array'),
        places: doc.places().out('array'),
        topics: doc.topics().out('array')
      };
      
      const result = {
        text,
        sentiment: {
          score: sentimentResult.score,
          comparative: sentimentResult.comparative,
          positive: sentimentResult.positive,
          negative: sentimentResult.negative,
          neutral: sentimentResult.neutral,
          magnitude: Math.abs(sentimentResult.score),
          polarity: sentimentResult.score > 0 ? 'positive' : sentimentResult.score < 0 ? 'negative' : 'neutral'
        },
        entities,
        language: franc(text),
        wordCount: text.split(' ').length,
        characterCount: text.length,
        processingTime: Date.now() - startTime,
        confidence: this.calculateSentimentConfidence(sentimentResult)
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      return result;

    } catch (error: any) {
      logger.error('Sentiment analysis failed:', error);
      throw new Error(`Sentiment analysis failed: ${error.message}`);
    }
  }

  // Enhanced image analysis
  async performImageAnalysis(imageBuffer: Buffer, filename?: string): Promise<any> {
    try {
      if (!imageBuffer || !Buffer.isBuffer(imageBuffer)) {
        throw new Error('Valid image buffer is required');
      }

      if (imageBuffer.length > AI_CONFIG.MAX_FILE_SIZE) {
        throw new Error(`Image size exceeds maximum limit of ${AI_CONFIG.MAX_FILE_SIZE} bytes`);
      }

      const startTime = Date.now();
      
      // Process image using Sharp
      const metadata = await sharp(imageBuffer).metadata();
      
      // Simulate advanced analysis (in production, use actual CV models)
      const analysis = {
        filename: filename || 'unknown',
        metadata: {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          size: imageBuffer.length,
          channels: metadata.channels,
          density: metadata.density,
          hasAlpha: metadata.hasAlpha
        },
        objects: [
          { name: 'person', confidence: 0.95, bbox: [100, 100, 200, 300] },
          { name: 'book', confidence: 0.87, bbox: [150, 200, 250, 280] },
          { name: 'laptop', confidence: 0.82, bbox: [300, 150, 450, 300] }
        ],
        text: ['StudySpot Library', 'Welcome', 'Study Zone'],
        colors: {
          dominant: '#4A90E2',
          palette: ['#4A90E2', '#7ED321', '#F5A623', '#D0021B'],
          histogram: {}
        },
        scene: 'indoor_study_space',
        confidence: 0.88,
        processingTime: Date.now() - startTime,
        quality: this.assessImageQuality(metadata)
      };

      return analysis;

    } catch (error: any) {
      logger.error('Image analysis failed:', error);
      throw new Error(`Image analysis failed: ${error.message}`);
    }
  }

  // Enhanced text generation with OpenAI
  async generateText(prompt: string, parameters: any = {}): Promise<any> {
    try {
      if (!prompt || typeof prompt !== 'string') {
        throw new Error('Valid prompt is required');
      }

      if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      }

      const startTime = Date.now();
      
      // Check cache first
      const cacheKey = `text-gen-${Buffer.from(prompt).toString('base64').slice(0, 50)}`;
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return cached.data;
      }

      const {
        model = AI_CONFIG.DEFAULT_MODEL,
        maxTokens = 150,
        temperature = AI_CONFIG.DEFAULT_TEMPERATURE,
        context = {}
      } = parameters;

      // Generate text using OpenAI
      const completion = await openai.chat.completions.create({
        model,
        messages: [
          { 
            role: 'system', 
            content: 'You are a helpful AI assistant for StudySpot, a library management platform. Provide accurate, helpful, and concise responses.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: maxTokens,
        temperature,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      });

      const result = {
        prompt,
        generatedText: completion.choices[0].message.content,
        model,
        tokensUsed: completion.usage?.total_tokens || 0,
        processingTime: Date.now() - startTime,
        confidence: this.calculateTextGenerationConfidence(completion),
        cost: this.calculateCost(completion.usage?.total_tokens || 0, model),
        metadata: {
          finishReason: completion.choices[0].finish_reason,
          temperature,
          maxTokens,
          context
        }
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      return result;

    } catch (error: any) {
      logger.error('Text generation failed:', error);
      throw new Error(`Text generation failed: ${error.message}`);
    }
  }

  // Enhanced chatbot response generation
  async generateChatbotResponse(session: any, userMessage: string): Promise<{ content: string; metadata?: any }> {
    try {
      if (!userMessage || typeof userMessage !== 'string') {
        throw new Error('Valid user message is required');
      }

      if (!OPENAI_API_KEY) {
        return {
          content: 'I apologize, but I cannot process your request at the moment. Please try again later.',
          metadata: {
            error: 'OpenAI API not configured',
            confidence: 0.1
          }
        };
      }

      const startTime = Date.now();
      
      // Build context from session history
      const context = session.messages.slice(-10).map((msg: any) => ({
        role: msg.role,
        content: msg.content
      }));

      // Generate response using OpenAI
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { 
            role: 'system', 
            content: 'You are StudySpot AI Assistant, a helpful AI for library management. You help students find study spaces, answer questions about bookings, and provide study tips. Be friendly, professional, and concise.' 
          },
          ...context,
          { role: 'user', content: userMessage }
        ],
        max_tokens: 200,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      });

      const response = completion.choices[0].message.content || 'I apologize, but I cannot process your request at the moment.';

      return {
        content: response,
        metadata: {
          model: 'gpt-3.5-turbo',
          tokensUsed: completion.usage?.total_tokens || 0,
          confidence: 0.9,
          processingTime: Date.now() - startTime,
          cost: this.calculateCost(completion.usage?.total_tokens || 0, 'gpt-3.5-turbo'),
          finishReason: completion.choices[0].finish_reason
        }
      };

    } catch (error: any) {
      logger.error('Chatbot response generation failed:', error);
      return {
        content: 'I apologize, but I encountered an error processing your message. Please try again.',
        metadata: {
          error: error.message,
          confidence: 0.1,
          processingTime: Date.now() - startTime
        }
      };
    }
  }

  // Helper methods
  private calculateConfidence(text: string, doc: any): number {
    const wordCount = text.split(' ').length;
    const entityCount = Object.values(doc.people().out('array')).length + 
                       Object.values(doc.places().out('array')).length +
                       Object.values(doc.organizations().out('array')).length;
    
    let confidence = 0.5;
    
    if (wordCount > 10) confidence += 0.1;
    if (wordCount > 50) confidence += 0.1;
    if (entityCount > 0) confidence += 0.1;
    if (entityCount > 3) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  private calculateSentimentConfidence(sentimentResult: any): number {
    const magnitude = Math.abs(sentimentResult.score);
    const wordCount = sentimentResult.positive.length + sentimentResult.negative.length + sentimentResult.neutral.length;
    
    let confidence = 0.5;
    
    if (magnitude > 2) confidence += 0.2;
    if (magnitude > 5) confidence += 0.2;
    if (wordCount > 5) confidence += 0.1;
    if (wordCount > 10) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  private calculateTextGenerationConfidence(completion: any): number {
    let confidence = 0.7;
    
    if (completion.choices[0].finish_reason === 'stop') confidence += 0.2;
    if (completion.usage?.total_tokens > 50) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  private calculateCost(tokens: number, model: string): number {
    const costs = {
      'gpt-3.5-turbo': 0.002,
      'gpt-4': 0.03,
      'gpt-4-turbo': 0.01
    };
    
    return (tokens / 1000) * (costs[model] || 0.002);
  }

  private assessImageQuality(metadata: any): string {
    if (metadata.width < 100 || metadata.height < 100) return 'low';
    if (metadata.width < 500 || metadata.height < 500) return 'medium';
    if (metadata.width < 1000 || metadata.height < 1000) return 'high';
    return 'excellent';
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

  // Get request statistics
  getRequestStats(): any {
    return {
      totalRequests: this.requestCounts.size,
      requestsByType: Object.fromEntries(this.requestCounts),
      cacheStats: this.getCacheStats()
    };
  }
}

const aiManager = new AIManager();

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
    status: 'AI Service is healthy', 
    uptime: process.uptime(),
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      cache: aiManager.getCacheStats(),
      queue: aiQueue.name,
      openai: OPENAI_API_KEY ? 'configured' : 'not_configured',
      nlp: 'active',
      sentiment: 'active',
      computerVision: 'active',
      textGeneration: 'active',
      chatbot: 'active'
    }
  });
});

// NLP Analysis endpoint
app.post('/nlp/analyze', 
  aiLimiter,
  validateRequest(aiRequestSchema), 
  async (req, res) => {
    try {
      const { type, input, parameters } = req.validatedData;
      
      const aiRequest = new AIRequest({
        requestId: uuidv4(),
        userId: req.headers['x-user-id'] || 'anonymous',
        tenantId: req.headers['x-tenant-id'] || 'default',
        type,
        input,
        parameters: parameters || {},
        status: 'processing',
        metadata: {
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          requestSize: JSON.stringify(req.body).length
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await aiRequest.save();

      const analysis = await aiManager.performNLPAnalysis(input, parameters);
      
      aiRequest.status = 'completed';
      aiRequest.result = analysis;
      aiRequest.confidence = analysis.confidence;
      aiRequest.processingTime = analysis.processingTime;
      aiRequest.metadata.responseSize = JSON.stringify(analysis).length;
      aiRequest.updatedAt = new Date();
      
      await aiRequest.save();

      logger.info(`NLP analysis completed: ${aiRequest.requestId}`);
      
      res.status(200).json({
        success: true,
        data: { 
          request: aiRequest,
          analysis 
        },
        message: 'NLP analysis completed successfully'
      });
    } catch (error: any) {
      logger.error('Error performing NLP analysis:', error);
      res.status(400).json({ 
        success: false,
        message: error.message,
        code: 'NLP_ANALYSIS_ERROR'
      });
    }
  }
);

// Sentiment Analysis endpoint
app.post('/sentiment/analyze', 
  aiLimiter,
  async (req, res) => {
    try {
      const { text } = req.body;
      
      if (!text || typeof text !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Valid text is required',
          code: 'MISSING_TEXT'
        });
      }

      const analysis = await aiManager.performSentimentAnalysis(text);
      
      res.status(200).json({
        success: true,
        data: analysis,
        message: 'Sentiment analysis completed successfully'
      });
    } catch (error: any) {
      logger.error('Error performing sentiment analysis:', error);
      res.status(400).json({ 
        success: false,
        message: error.message,
        code: 'SENTIMENT_ANALYSIS_ERROR'
      });
    }
  }
);

// Image Analysis endpoint
app.post('/vision/analyze', 
  aiLimiter,
  upload.single('image'), 
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Image file is required',
          code: 'MISSING_IMAGE'
        });
      }

      const analysis = await aiManager.performImageAnalysis(req.file.buffer, req.file.originalname);
      
      res.status(200).json({
        success: true,
        data: {
          filename: req.file.originalname,
          size: req.file.size,
          mimeType: req.file.mimetype,
          analysis
        },
        message: 'Image analysis completed successfully'
      });
    } catch (error: any) {
      logger.error('Error performing image analysis:', error);
      res.status(400).json({ 
        success: false,
        message: error.message,
        code: 'IMAGE_ANALYSIS_ERROR'
      });
    }
  }
);

// Text Generation endpoint
app.post('/text/generate', 
  openaiLimiter,
  validateRequest(textGenerationSchema), 
  async (req, res) => {
    try {
      const { prompt, model, maxTokens, temperature, context } = req.validatedData;
      
      const result = await aiManager.generateText(prompt, {
        model,
        maxTokens,
        temperature,
        context
      });
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Text generation completed successfully'
      });
    } catch (error: any) {
      logger.error('Error generating text:', error);
      res.status(400).json({ 
        success: false,
        message: error.message,
        code: 'TEXT_GENERATION_ERROR'
      });
    }
  }
);

// Chatbot endpoint
app.post('/chatbot/message', 
  aiLimiter,
  validateRequest(chatMessageSchema), 
  async (req, res) => {
    try {
      const { content, sessionId, context } = req.validatedData;
      const userId = req.headers['x-user-id'] || 'anonymous';
      const tenantId = req.headers['x-tenant-id'] || 'default';
      
      let session = await ChatSession.findOne({ 
        sessionId: sessionId || uuidv4(), 
        tenantId 
      });
      
      if (!session) {
        session = new ChatSession({
          sessionId: sessionId || uuidv4(),
          userId,
          tenantId,
          title: content.substring(0, 50),
          context: context || {},
          messages: [],
          status: 'active',
          statistics: {
            totalMessages: 0,
            userMessages: 0,
            assistantMessages: 0,
            totalTokens: 0,
            totalCost: 0,
            averageResponseTime: 0,
            lastActivity: new Date()
          },
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      // Add user message
      const userMessage = {
        messageId: uuidv4(),
        role: 'user',
        content,
        timestamp: new Date(),
        metadata: {
          tokens: content.split(' ').length,
          quality: 'medium'
        }
      };
      
      session.messages.push(userMessage);
      session.statistics.userMessages++;
      session.statistics.totalMessages++;
      session.statistics.lastActivity = new Date();

      // Generate AI response
      const aiResponse = await aiManager.generateChatbotResponse(session, content);
      
      // Add AI message
      const aiMessage = {
        messageId: uuidv4(),
        role: 'assistant',
        content: aiResponse.content,
        timestamp: new Date(),
        metadata: aiResponse.metadata || {}
      };
      
      session.messages.push(aiMessage);
      session.statistics.assistantMessages++;
      session.statistics.totalMessages++;
      session.statistics.totalTokens += aiResponse.metadata?.tokensUsed || 0;
      session.statistics.totalCost += aiResponse.metadata?.cost || 0;
      session.statistics.averageResponseTime = aiResponse.metadata?.processingTime || 0;
      session.updatedAt = new Date();

      await session.save();

      logger.info(`Chatbot message processed: ${session.sessionId}`);
      
      res.status(200).json({
        success: true,
        data: {
          session,
          userMessage,
          aiMessage
        },
        message: 'Chatbot response generated successfully'
      });
    } catch (error: any) {
      logger.error('Error processing chatbot message:', error);
      res.status(400).json({ 
        success: false,
        message: error.message,
        code: 'CHATBOT_ERROR'
      });
    }
  }
);

// Get chat sessions
app.get('/chatbot/sessions', async (req, res) => {
  try {
    const { limit = 10, page = 1, status = 'active' } = req.query;
    const userId = req.headers['x-user-id'] || 'anonymous';
    const tenantId = req.headers['x-tenant-id'] || 'default';
    
    const sessions = await ChatSession.find({ 
      userId, 
      tenantId, 
      status 
    })
    .sort({ updatedAt: -1 })
    .limit(parseInt(limit as string))
    .skip((parseInt(page as string) - 1) * parseInt(limit as string));
    
    const total = await ChatSession.countDocuments({ userId, tenantId, status });
    
    res.status(200).json({
      success: true,
      data: {
        sessions,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      }
    });
  } catch (error: any) {
    logger.error('Error fetching chat sessions:', error);
    res.status(500).json({ 
      success: false,
      message: error.message,
      code: 'FETCH_SESSIONS_ERROR'
    });
  }
});

// Get AI insights
app.get('/insights', async (req, res) => {
  try {
    const { type, priority, limit = 10, page = 1 } = req.query;
    const tenantId = req.headers['x-tenant-id'] || 'default';
    
    const filter: any = { tenantId };
    if (type) filter.type = type;
    if (priority) filter.priority = priority;
    
    const insights = await AIInsight.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .skip((parseInt(page as string) - 1) * parseInt(limit as string));
    
    const total = await AIInsight.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      data: {
        insights,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      }
    });
  } catch (error: any) {
    logger.error('Error fetching AI insights:', error);
    res.status(500).json({ 
      success: false,
      message: error.message,
      code: 'FETCH_INSIGHTS_ERROR'
    });
  }
});

// Analytics dashboard
app.get('/analytics/dashboard', async (req, res) => {
  try {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    
    const requests = await AIRequest.find({ tenantId });
    const sessions = await ChatSession.find({ tenantId });
    const insights = await AIInsight.find({ tenantId });

    const requestStats = {
      total: requests.length,
      completed: requests.filter(req => req.status === 'completed').length,
      failed: requests.filter(req => req.status === 'failed').length,
      processing: requests.filter(req => req.status === 'processing').length,
      byType: _.countBy(requests, 'type'),
      averageProcessingTime: requests
        .filter(req => req.processingTime)
        .reduce((sum, req) => sum + (req.processingTime || 0), 0) / 
        requests.filter(req => req.processingTime).length || 0,
      totalCost: requests.reduce((sum, req) => sum + (req.metadata?.cost || 0), 0)
    };

    const sessionStats = {
      total: sessions.length,
      active: sessions.filter(session => session.status === 'active').length,
      inactive: sessions.filter(session => session.status === 'inactive').length,
      archived: sessions.filter(session => session.status === 'archived').length,
      averageMessagesPerSession: sessions
        .reduce((sum, session) => sum + session.messages.length, 0) / 
        sessions.length || 0,
      totalTokens: sessions.reduce((sum, session) => sum + session.statistics.totalTokens, 0),
      totalCost: sessions.reduce((sum, session) => sum + session.statistics.totalCost, 0)
    };

    const insightStats = {
      total: insights.length,
      byType: _.countBy(insights, 'type'),
      byPriority: _.countBy(insights, 'priority'),
      actionable: insights.filter(insight => insight.actionable).length,
      implemented: insights.filter(insight => insight.status === 'implemented').length
    };

    res.status(200).json({
      success: true,
      data: {
        requests: requestStats,
        sessions: sessionStats,
        insights: insightStats,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error: any) {
    logger.error('Error fetching AI analytics:', error);
    res.status(500).json({ 
      success: false,
      message: error.message,
      code: 'ANALYTICS_ERROR'
    });
  }
});

// Enhanced error handling middleware
app.use(errorHandler);

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  logger.info('Client connected to AI Service:', socket.id);
  
  socket.on('subscribe-ai-updates', (data) => {
    if (data.tenantId) {
      socket.join(`ai-${data.tenantId}`);
      logger.info(`Client subscribed to AI updates for tenant ${data.tenantId}`);
    }
  });
  
  socket.on('disconnect', () => {
    logger.info('Client disconnected from AI Service:', socket.id);
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
  logger.info(`🚀 Enhanced AI Service running on port ${PORT}`);
  logger.info(`🧠 Natural Language Processing: Active`);
  logger.info(`👁️ Computer Vision: Active`);
  logger.info(`😊 Sentiment Analysis: Active`);
  logger.info(`🌍 Language Detection: Active`);
  logger.info(`✍️ Text Generation: Active`);
  logger.info(`🖼️ Image Analysis: Active`);
  logger.info(`🤖 Chatbot: Active`);
  logger.info(`💡 AI Insights: Active`);
  logger.info(`🔒 Security: Rate limiting, CORS, Helmet enabled`);
  logger.info(`⚡ Performance: Caching, optimization enabled`);
});