import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { logger } from './utils/logger';
import mongoose from 'mongoose';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import middleware from 'i18next-http-middleware';
import { translate } from 'google-translate-api-x';
import axios from 'axios';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import _ from 'lodash';
import csv from 'csv-parser';
import ExcelJS from 'exceljs';
import { Parser } from 'json2csv';
import cron from 'node-cron';
import { Queue, Worker, Job } from 'bullmq';
import Joi from 'joi';
import natural from 'natural';

const app = express();
const PORT = process.env.PORT || 3029;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/i18ndb';
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const GOOGLE_TRANSLATE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;

// Configuration
const I18N_CONFIG = {
  MAX_TRANSLATION_LENGTH: 10000,
  MAX_BATCH_SIZE: 100,
  TRANSLATION_TIMEOUT: 30000,
  CACHE_TTL: 24 * 60 * 60 * 1000, // 24 hours
  QUALITY_THRESHOLD: 0.8,
  MAX_RETRY_ATTEMPTS: 3,
  SUPPORTED_FORMATS: ['json', 'csv', 'excel', 'po', 'xlf'],
  MAX_LANGUAGES_PER_TENANT: 50
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

const translationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 50, // More restrictive for translation operations
  message: "Too many translation requests, please try again later.",
});

const batchLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // Very restrictive for batch operations
  message: "Too many batch translation requests, please try again later.",
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

const translationQueue = new Queue('translationQueue', { connection });

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

// Initialize i18next with enhanced configuration
i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    debug: false,
    backend: {
      loadPath: './locales/{{lng}}/{{ns}}.json'
    },
    detection: {
      order: ['header', 'querystring', 'cookie'],
      caches: ['cookie']
    },
    interpolation: {
      escapeValue: false
    },
    saveMissing: true,
    missingKeyHandler: (lng, ns, key, fallbackValue) => {
      logger.warn(`Missing translation key: ${key} for language: ${lng} in namespace: ${ns}`);
    }
  });

// Enhanced Mongoose Schemas with comprehensive validation
const LanguageSchema = new mongoose.Schema({
  languageId: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v: string) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'Language ID must be a valid UUID'
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
  code: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return /^[a-z]{2}(-[A-Z]{2})?$/.test(v);
      },
      message: 'Language code must be in format: en, en-US, etc.'
    }
  },
  name: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return v && v.length >= 2 && v.length <= 100;
      },
      message: 'Language name must be between 2 and 100 characters'
    }
  },
  nativeName: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return v && v.length >= 2 && v.length <= 100;
      },
      message: 'Native name must be between 2 and 100 characters'
    }
  },
  isRTL: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isDefault: { type: Boolean, default: false },
  quality: {
    score: { type: Number, min: 0, max: 1, default: 1 },
    lastValidated: Date,
    validationCount: { type: Number, default: 0 },
    issues: [{
      type: { type: String, enum: ['missing', 'incomplete', 'inconsistent', 'grammar', 'context'] },
      severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
      description: String,
      count: { type: Number, default: 1 },
      lastOccurrence: { type: Date, default: Date.now }
    }]
  },
  metadata: {
    country: { 
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^[A-Z]{2}$/.test(v);
        },
        message: 'Country code must be 2 uppercase letters'
      }
    },
    region: String,
    script: String,
    currency: { 
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^[A-Z]{3}$/.test(v);
        },
        message: 'Currency code must be 3 uppercase letters'
      }
    },
    dateFormat: { 
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^[DMY\/\-\.\s]+$/.test(v);
        },
        message: 'Invalid date format'
      }
    },
    timeFormat: { 
      type: String,
      enum: ['12h', '24h'],
      default: '12h'
    },
    numberFormat: {
      decimalSeparator: { type: String, default: '.' },
      thousandsSeparator: { type: String, default: ',' },
      currencySymbol: String,
      currencyPosition: { type: String, enum: ['before', 'after'], default: 'before' }
    },
    pluralRules: {
      zero: String,
      one: String,
      two: String,
      few: String,
      many: String,
      other: String
    }
  },
  statistics: {
    totalTranslations: { type: Number, default: 0 },
    completedTranslations: { type: Number, default: 0 },
    missingTranslations: { type: Number, default: 0 },
    lastUpdated: Date,
    translationAccuracy: { type: Number, min: 0, max: 1, default: 1 }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes
LanguageSchema.index({ tenantId: 1, code: 1 }, { unique: true });
LanguageSchema.index({ tenantId: 1, isActive: 1 });
LanguageSchema.index({ code: 1 });

const Language = mongoose.model('Language', LanguageSchema);

const TranslationSchema = new mongoose.Schema({
  translationId: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v: string) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'Translation ID must be a valid UUID'
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
  namespace: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return v && v.length >= 1 && v.length <= 50;
      },
      message: 'Namespace must be between 1 and 50 characters'
    }
  },
  key: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return v && v.length >= 1 && v.length <= 200;
      },
      message: 'Key must be between 1 and 200 characters'
    }
  },
  language: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return /^[a-z]{2}(-[A-Z]{2})?$/.test(v);
      },
      message: 'Language code must be in format: en, en-US, etc.'
    }
  },
  value: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return v && v.length <= I18N_CONFIG.MAX_TRANSLATION_LENGTH;
      },
      message: `Translation value must not exceed ${I18N_CONFIG.MAX_TRANSLATION_LENGTH} characters`
    }
  },
  context: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || v.length <= 500;
      },
      message: 'Context must not exceed 500 characters'
    }
  },
  isPlural: { type: Boolean, default: false },
  pluralForms: [{
    form: { 
      type: String,
      enum: ['zero', 'one', 'two', 'few', 'many', 'other']
    },
    value: String
  }],
  quality: {
    score: { type: Number, min: 0, max: 1, default: 1 },
    confidence: { type: Number, min: 0, max: 1, default: 1 },
    isReviewed: { type: Boolean, default: false },
    reviewerId: String,
    reviewDate: Date,
    issues: [{
      type: { type: String, enum: ['grammar', 'context', 'consistency', 'completeness', 'accuracy'] },
      severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
      description: String,
      suggestion: String,
      resolved: { type: Boolean, default: false }
    }]
  },
  metadata: {
    isAutoTranslated: { type: Boolean, default: false },
    translatorId: String,
    translationProvider: { 
      type: String,
      enum: ['google', 'microsoft', 'deepl', 'manual', 'system'],
      default: 'manual'
    },
    sourceLanguage: String,
    translationTime: Number,
    characterCount: Number,
    wordCount: Number,
    complexity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    tags: [String],
    category: String,
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' }
  },
  version: { type: Number, default: 1 },
  lastModified: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes
TranslationSchema.index({ tenantId: 1, namespace: 1, language: 1 });
TranslationSchema.index({ tenantId: 1, key: 1, language: 1 }, { unique: true });
TranslationSchema.index({ language: 1, isAutoTranslated: 1 });
TranslationSchema.index({ 'quality.score': 1 });

const Translation = mongoose.model('Translation', TranslationSchema);

const TranslationRequestSchema = new mongoose.Schema({
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
  sourceLanguage: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return /^[a-z]{2}(-[A-Z]{2})?$/.test(v);
      },
      message: 'Source language code must be in format: en, en-US, etc.'
    }
  },
  targetLanguage: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return /^[a-z]{2}(-[A-Z]{2})?$/.test(v);
      },
      message: 'Target language code must be in format: en, en-US, etc.'
    }
  },
  text: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return v && v.length <= I18N_CONFIG.MAX_TRANSLATION_LENGTH;
      },
      message: `Text must not exceed ${I18N_CONFIG.MAX_TRANSLATION_LENGTH} characters`
    }
  },
  context: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || v.length <= 500;
      },
      message: 'Context must not exceed 500 characters'
    }
  },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'], 
    default: 'pending' 
  },
  translatedText: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || v.length <= I18N_CONFIG.MAX_TRANSLATION_LENGTH;
      },
      message: `Translated text must not exceed ${I18N_CONFIG.MAX_TRANSLATION_LENGTH} characters`
    }
  },
  quality: {
    confidence: { type: Number, min: 0, max: 1 },
    accuracy: { type: Number, min: 0, max: 1 },
    fluency: { type: Number, min: 0, max: 1 },
    overall: { type: Number, min: 0, max: 1 }
  },
  provider: { 
    type: String, 
    enum: ['google', 'microsoft', 'deepl', 'manual'], 
    default: 'google' 
  },
  errorMessage: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !this.status || this.status !== 'completed' || !v;
      },
      message: 'Error message should only be present when request failed'
    }
  },
  retryCount: { type: Number, default: 0, max: I18N_CONFIG.MAX_RETRY_ATTEMPTS },
  processingTime: { 
    type: Number, 
    min: 0,
    validate: {
      validator: function(v: number) {
        return v <= I18N_CONFIG.TRANSLATION_TIMEOUT;
      },
      message: 'Processing time exceeds maximum allowed time'
    }
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    requestId: String,
    sessionId: String,
    batchId: String,
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    cost: Number,
    characterCount: Number,
    wordCount: Number
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes
TranslationRequestSchema.index({ tenantId: 1, status: 1 });
TranslationRequestSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 }); // 7 days
TranslationRequestSchema.index({ 'metadata.batchId': 1 });

const TranslationRequest = mongoose.model('TranslationRequest', TranslationRequestSchema);

const UserLanguagePreferenceSchema = new mongoose.Schema({
  preferenceId: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v: string) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'Preference ID must be a valid UUID'
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
  preferredLanguage: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return /^[a-z]{2}(-[A-Z]{2})?$/.test(v);
      },
      message: 'Preferred language code must be in format: en, en-US, etc.'
    }
  },
  fallbackLanguage: { 
    type: String, 
    default: 'en',
    validate: {
      validator: function(v: string) {
        return /^[a-z]{2}(-[A-Z]{2})?$/.test(v);
      },
      message: 'Fallback language code must be in format: en, en-US, etc.'
    }
  },
  autoDetect: { type: Boolean, default: true },
  preferences: {
    dateFormat: String,
    timeFormat: { type: String, enum: ['12h', '24h'] },
    numberFormat: {
      decimalSeparator: String,
      thousandsSeparator: String,
      currencySymbol: String
    },
    pluralRules: [String],
    customTranslations: mongoose.Schema.Types.Mixed
  },
  statistics: {
    totalRequests: { type: Number, default: 0 },
    successfulDetections: { type: Number, default: 0 },
    lastDetectionAccuracy: { type: Number, min: 0, max: 1 },
    mostUsedLanguages: [{
      language: String,
      count: Number,
      lastUsed: Date
    }]
  },
  lastUsed: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes
UserLanguagePreferenceSchema.index({ tenantId: 1, userId: 1 }, { unique: true });
UserLanguagePreferenceSchema.index({ preferredLanguage: 1 });

const UserLanguagePreference = mongoose.model('UserLanguagePreference', UserLanguagePreferenceSchema);

// Enhanced supported languages with comprehensive Indian language support
const SUPPORTED_LANGUAGES = [
  // Global Languages
  { 
    code: 'en', 
    name: 'English', 
    nativeName: 'English', 
    isRTL: false, 
    country: 'US',
    script: 'Latin',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' }
  },
  { 
    code: 'es', 
    name: 'Spanish', 
    nativeName: 'Español', 
    isRTL: false, 
    country: 'ES',
    script: 'Latin',
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    pluralRules: { one: 'n == 1', other: 'n != 1' }
  },
  { 
    code: 'fr', 
    name: 'French', 
    nativeName: 'Français', 
    isRTL: false, 
    country: 'FR',
    script: 'Latin',
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    pluralRules: { one: 'n == 1', other: 'n != 1' }
  },
  { 
    code: 'de', 
    name: 'German', 
    nativeName: 'Deutsch', 
    isRTL: false, 
    country: 'DE',
    script: 'Latin',
    currency: 'EUR',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: '24h',
    pluralRules: { one: 'n == 1', other: 'n != 1' }
  },
  { 
    code: 'it', 
    name: 'Italian', 
    nativeName: 'Italiano', 
    isRTL: false, 
    country: 'IT',
    script: 'Latin',
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    pluralRules: { one: 'n == 1', other: 'n != 1' }
  },
  { 
    code: 'pt', 
    name: 'Portuguese', 
    nativeName: 'Português', 
    isRTL: false, 
    country: 'PT',
    script: 'Latin',
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    pluralRules: { one: 'n == 1', other: 'n != 1' }
  },
  { 
    code: 'ru', 
    name: 'Russian', 
    nativeName: 'Русский', 
    isRTL: false, 
    country: 'RU',
    script: 'Cyrillic',
    currency: 'RUB',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: '24h',
    pluralRules: { one: 'n % 10 == 1 && n % 100 != 11', few: 'n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)', many: 'n % 10 == 0 || n % 10 >= 5 && n % 10 <= 9 || n % 100 >= 11 && n % 100 <= 19', other: 'n != 1' }
  },
  { 
    code: 'ja', 
    name: 'Japanese', 
    nativeName: '日本語', 
    isRTL: false, 
    country: 'JP',
    script: 'Hiragana',
    currency: 'JPY',
    dateFormat: 'YYYY/MM/DD',
    timeFormat: '24h',
    pluralRules: { other: 'n != 1' }
  },
  { 
    code: 'ko', 
    name: 'Korean', 
    nativeName: '한국어', 
    isRTL: false, 
    country: 'KR',
    script: 'Hangul',
    currency: 'KRW',
    dateFormat: 'YYYY.MM.DD',
    timeFormat: '24h',
    pluralRules: { other: 'n != 1' }
  },
  { 
    code: 'zh', 
    name: 'Chinese', 
    nativeName: '中文', 
    isRTL: false, 
    country: 'CN',
    script: 'Han',
    currency: 'CNY',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    pluralRules: { other: 'n != 1' }
  },
  { 
    code: 'ar', 
    name: 'Arabic', 
    nativeName: 'العربية', 
    isRTL: true, 
    country: 'SA',
    script: 'Arabic',
    currency: 'SAR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { zero: 'n == 0', one: 'n == 1', two: 'n == 2', few: 'n % 100 >= 3 && n % 100 <= 10', many: 'n % 100 >= 11', other: 'n != 1' }
  },
  { 
    code: 'ur', 
    name: 'Urdu', 
    nativeName: 'اردو', 
    isRTL: true, 
    country: 'PK',
    script: 'Arabic',
    currency: 'PKR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' }
  },
  { 
    code: 'bn', 
    name: 'Bengali', 
    nativeName: 'বাংলা', 
    isRTL: false, 
    country: 'BD',
    script: 'Bengali',
    currency: 'BDT',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' }
  },

  // COMPREHENSIVE INDIAN LANGUAGES SUPPORT
  // Official Languages of India (22 Scheduled Languages)
  { 
    code: 'hi', 
    name: 'Hindi', 
    nativeName: 'हिन्दी', 
    isRTL: false, 
    country: 'IN',
    script: 'Devanagari',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'North India',
    speakers: '528 million',
    officialStatus: 'Official language of India'
  },
  { 
    code: 'bn', 
    name: 'Bengali', 
    nativeName: 'বাংলা', 
    isRTL: false, 
    country: 'IN',
    script: 'Bengali',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'West Bengal, Tripura',
    speakers: '97 million',
    officialStatus: 'Official language of West Bengal'
  },
  { 
    code: 'te', 
    name: 'Telugu', 
    nativeName: 'తెలుగు', 
    isRTL: false, 
    country: 'IN',
    script: 'Telugu',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Andhra Pradesh, Telangana',
    speakers: '75 million',
    officialStatus: 'Official language of Andhra Pradesh and Telangana'
  },
  { 
    code: 'mr', 
    name: 'Marathi', 
    nativeName: 'मराठी', 
    isRTL: false, 
    country: 'IN',
    script: 'Devanagari',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Maharashtra',
    speakers: '83 million',
    officialStatus: 'Official language of Maharashtra'
  },
  { 
    code: 'ta', 
    name: 'Tamil', 
    nativeName: 'தமிழ்', 
    isRTL: false, 
    country: 'IN',
    script: 'Tamil',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Tamil Nadu, Puducherry',
    speakers: '69 million',
    officialStatus: 'Official language of Tamil Nadu'
  },
  { 
    code: 'gu', 
    name: 'Gujarati', 
    nativeName: 'ગુજરાતી', 
    isRTL: false, 
    country: 'IN',
    script: 'Gujarati',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Gujarat',
    speakers: '55 million',
    officialStatus: 'Official language of Gujarat'
  },
  { 
    code: 'ur', 
    name: 'Urdu', 
    nativeName: 'اردو', 
    isRTL: true, 
    country: 'IN',
    script: 'Arabic',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Jammu and Kashmir, Telangana',
    speakers: '51 million',
    officialStatus: 'Official language of Jammu and Kashmir'
  },
  { 
    code: 'kn', 
    name: 'Kannada', 
    nativeName: 'ಕನ್ನಡ', 
    isRTL: false, 
    country: 'IN',
    script: 'Kannada',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Karnataka',
    speakers: '44 million',
    officialStatus: 'Official language of Karnataka'
  },
  { 
    code: 'ml', 
    name: 'Malayalam', 
    nativeName: 'മലയാളം', 
    isRTL: false, 
    country: 'IN',
    script: 'Malayalam',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Kerala, Lakshadweep',
    speakers: '35 million',
    officialStatus: 'Official language of Kerala'
  },
  { 
    code: 'or', 
    name: 'Odia', 
    nativeName: 'ଓଡ଼ିଆ', 
    isRTL: false, 
    country: 'IN',
    script: 'Odia',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Odisha',
    speakers: '38 million',
    officialStatus: 'Official language of Odisha'
  },
  { 
    code: 'pa', 
    name: 'Punjabi', 
    nativeName: 'ਪੰਜਾਬੀ', 
    isRTL: false, 
    country: 'IN',
    script: 'Gurmukhi',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Punjab',
    speakers: '33 million',
    officialStatus: 'Official language of Punjab'
  },
  { 
    code: 'as', 
    name: 'Assamese', 
    nativeName: 'অসমীয়া', 
    isRTL: false, 
    country: 'IN',
    script: 'Assamese',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Assam',
    speakers: '15 million',
    officialStatus: 'Official language of Assam'
  },
  { 
    code: 'ne', 
    name: 'Nepali', 
    nativeName: 'नेपाली', 
    isRTL: false, 
    country: 'IN',
    script: 'Devanagari',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Sikkim, West Bengal',
    speakers: '2.9 million',
    officialStatus: 'Official language of Sikkim'
  },
  { 
    code: 'sa', 
    name: 'Sanskrit', 
    nativeName: 'संस्कृतम्', 
    isRTL: false, 
    country: 'IN',
    script: 'Devanagari',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Pan-India',
    speakers: '25,000',
    officialStatus: 'Classical language of India'
  },
  { 
    code: 'bo', 
    name: 'Bodo', 
    nativeName: 'बड़ो', 
    isRTL: false, 
    country: 'IN',
    script: 'Devanagari',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Assam',
    speakers: '1.5 million',
    officialStatus: 'Official language of Assam'
  },
  { 
    code: 'sd', 
    name: 'Sindhi', 
    nativeName: 'سنڌي', 
    isRTL: true, 
    country: 'IN',
    script: 'Arabic',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Gujarat, Rajasthan',
    speakers: '2.7 million',
    officialStatus: 'Scheduled language of India'
  },
  { 
    code: 'gom', 
    name: 'Konkani', 
    nativeName: 'कोंकणी', 
    isRTL: false, 
    country: 'IN',
    script: 'Devanagari',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Goa',
    speakers: '2.3 million',
    officialStatus: 'Official language of Goa'
  },
  { 
    code: 'mai', 
    name: 'Maithili', 
    nativeName: 'मैथिली', 
    isRTL: false, 
    country: 'IN',
    script: 'Devanagari',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Bihar',
    speakers: '13.5 million',
    officialStatus: 'Scheduled language of India'
  },
  { 
    code: 'mni', 
    name: 'Manipuri', 
    nativeName: 'মৈতৈলোন্', 
    isRTL: false, 
    country: 'IN',
    script: 'Bengali',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Manipur',
    speakers: '1.8 million',
    officialStatus: 'Official language of Manipur'
  },
  { 
    code: 'sat', 
    name: 'Santali', 
    nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', 
    isRTL: false, 
    country: 'IN',
    script: 'Ol Chiki',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Jharkhand, West Bengal',
    speakers: '7.4 million',
    officialStatus: 'Scheduled language of India'
  },
  { 
    code: 'ks', 
    name: 'Kashmiri', 
    nativeName: 'کٲشُر', 
    isRTL: true, 
    country: 'IN',
    script: 'Arabic',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Jammu and Kashmir',
    speakers: '6.8 million',
    officialStatus: 'Scheduled language of India'
  },

  // Additional Regional Languages
  { 
    code: 'bh', 
    name: 'Bhojpuri', 
    nativeName: 'भोजपुरी', 
    isRTL: false, 
    country: 'IN',
    script: 'Devanagari',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Bihar, Uttar Pradesh',
    speakers: '51 million',
    officialStatus: 'Regional language'
  },
  { 
    code: 'mag', 
    name: 'Magahi', 
    nativeName: 'मगही', 
    isRTL: false, 
    country: 'IN',
    script: 'Devanagari',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Bihar',
    speakers: '13 million',
    officialStatus: 'Regional language'
  },
  { 
    code: 'awa', 
    name: 'Awadhi', 
    nativeName: 'अवधी', 
    isRTL: false, 
    country: 'IN',
    script: 'Devanagari',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Uttar Pradesh',
    speakers: '3.8 million',
    officialStatus: 'Regional language'
  },
  { 
    code: 'raj', 
    name: 'Rajasthani', 
    nativeName: 'राजस्थानी', 
    isRTL: false, 
    country: 'IN',
    script: 'Devanagari',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Rajasthan',
    speakers: '25 million',
    officialStatus: 'Regional language'
  },
  { 
    code: 'hne', 
    name: 'Chhattisgarhi', 
    nativeName: 'छत्तीसगढ़ी', 
    isRTL: false, 
    country: 'IN',
    script: 'Devanagari',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Chhattisgarh',
    speakers: '16 million',
    officialStatus: 'Regional language'
  },
  { 
    code: 'tcy', 
    name: 'Tulu', 
    nativeName: 'ತುಳು', 
    isRTL: false, 
    country: 'IN',
    script: 'Kannada',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Karnataka, Kerala',
    speakers: '1.8 million',
    officialStatus: 'Regional language'
  },
  { 
    code: 'kha', 
    name: 'Khasi', 
    nativeName: 'খাশি', 
    isRTL: false, 
    country: 'IN',
    script: 'Latin',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Meghalaya',
    speakers: '1.4 million',
    officialStatus: 'Official language of Meghalaya'
  },
  { 
    code: 'lus', 
    name: 'Mizo', 
    nativeName: 'Mizo ṭawng', 
    isRTL: false, 
    country: 'IN',
    script: 'Latin',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Mizoram',
    speakers: '830,000',
    officialStatus: 'Official language of Mizoram'
  },
  { 
    code: 'grt', 
    name: 'Garo', 
    nativeName: 'আ·চিক', 
    isRTL: false, 
    country: 'IN',
    script: 'Latin',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Meghalaya',
    speakers: '1.1 million',
    officialStatus: 'Official language of Meghalaya'
  },
  { 
    code: 'njo', 
    name: 'Ao', 
    nativeName: 'Ao Naga', 
    isRTL: false, 
    country: 'IN',
    script: 'Latin',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Nagaland',
    speakers: '230,000',
    officialStatus: 'Regional language'
  },
  { 
    code: 'njz', 
    name: 'Nyishi', 
    nativeName: 'Nyishi', 
    isRTL: false, 
    country: 'IN',
    script: 'Latin',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Arunachal Pradesh',
    speakers: '300,000',
    officialStatus: 'Regional language'
  },
  { 
    code: 'kfy', 
    name: 'Kumaoni', 
    nativeName: 'कुमाऊँनी', 
    isRTL: false, 
    country: 'IN',
    script: 'Devanagari',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Uttarakhand',
    speakers: '2.4 million',
    officialStatus: 'Regional language'
  },
  { 
    code: 'gbl', 
    name: 'Gamit', 
    nativeName: 'ગામિત', 
    isRTL: false, 
    country: 'IN',
    script: 'Gujarati',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Gujarat',
    speakers: '380,000',
    officialStatus: 'Regional language'
  },
  { 
    code: 'bfy', 
    name: 'Bagheli', 
    nativeName: 'बघेली', 
    isRTL: false, 
    country: 'IN',
    script: 'Devanagari',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Madhya Pradesh',
    speakers: '2.9 million',
    officialStatus: 'Regional language'
  },
  { 
    code: 'dcc', 
    name: 'Deccan', 
    nativeName: 'دکنی', 
    isRTL: true, 
    country: 'IN',
    script: 'Arabic',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Telangana, Andhra Pradesh',
    speakers: '12.8 million',
    officialStatus: 'Regional language'
  },
  { 
    code: 'kru', 
    name: 'Kurux', 
    nativeName: 'कुरुख', 
    isRTL: false, 
    country: 'IN',
    script: 'Devanagari',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Jharkhand, Chhattisgarh',
    speakers: '2.0 million',
    officialStatus: 'Regional language'
  },
  { 
    code: 'mtr', 
    name: 'Mewari', 
    nativeName: 'मेवाड़ी', 
    isRTL: false, 
    country: 'IN',
    script: 'Devanagari',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Rajasthan',
    speakers: '5.0 million',
    officialStatus: 'Regional language'
  },
  { 
    code: 'wbr', 
    name: 'Wagdi', 
    nativeName: 'वागड़ी', 
    isRTL: false, 
    country: 'IN',
    script: 'Devanagari',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Rajasthan',
    speakers: '3.2 million',
    officialStatus: 'Regional language'
  },
  { 
    code: 'dhd', 
    name: 'Dhundari', 
    nativeName: 'ढूंढाड़ी', 
    isRTL: false, 
    country: 'IN',
    script: 'Devanagari',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Rajasthan',
    speakers: '1.5 million',
    officialStatus: 'Regional language'
  },
  { 
    code: 'mup', 
    name: 'Malvi', 
    nativeName: 'मालवी', 
    isRTL: false, 
    country: 'IN',
    script: 'Devanagari',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Madhya Pradesh',
    speakers: '5.4 million',
    officialStatus: 'Regional language'
  },
  { 
    code: 'bfu', 
    name: 'Gahri', 
    nativeName: 'गहरी', 
    isRTL: false, 
    country: 'IN',
    script: 'Devanagari',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Himachal Pradesh',
    speakers: '120,000',
    officialStatus: 'Regional language'
  },
  { 
    code: 'kfs', 
    name: 'Kashmiri (Persian Script)', 
    nativeName: 'کٲشُر', 
    isRTL: true, 
    country: 'IN',
    script: 'Persian',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Jammu and Kashmir',
    speakers: '6.8 million',
    officialStatus: 'Scheduled language of India'
  },
  { 
    code: 'khn', 
    name: 'Khandeshi', 
    nativeName: 'खान्देशी', 
    isRTL: false, 
    country: 'IN',
    script: 'Devanagari',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Maharashtra',
    speakers: '2.1 million',
    officialStatus: 'Regional language'
  },
  { 
    code: 'khn', 
    name: 'Varhadi', 
    nativeName: 'वऱ्हाडी', 
    isRTL: false, 
    country: 'IN',
    script: 'Devanagari',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Maharashtra',
    speakers: '2.1 million',
    officialStatus: 'Regional language'
  },
  { 
    code: 'dgo', 
    name: 'Dogri', 
    nativeName: 'डोगरी', 
    isRTL: false, 
    country: 'IN',
    script: 'Devanagari',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Jammu and Kashmir',
    speakers: '2.6 million',
    officialStatus: 'Scheduled language of India'
  },
  { 
    code: 'bfq', 
    name: 'Badaga', 
    nativeName: 'ಬಡಗ', 
    isRTL: false, 
    country: 'IN',
    script: 'Kannada',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Tamil Nadu',
    speakers: '134,000',
    officialStatus: 'Regional language'
  },
  { 
    code: 'bfq', 
    name: 'Kodava', 
    nativeName: 'ಕೊಡವ', 
    isRTL: false, 
    country: 'IN',
    script: 'Kannada',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Karnataka',
    speakers: '113,000',
    officialStatus: 'Regional language'
  },
  { 
    code: 'bfq', 
    name: 'Beary', 
    nativeName: 'ಬ್ಯಾರಿ', 
    isRTL: false, 
    country: 'IN',
    script: 'Kannada',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Karnataka',
    speakers: '1.5 million',
    officialStatus: 'Regional language'
  },
  { 
    code: 'bfq', 
    name: 'Coorgi', 
    nativeName: 'ಕೊಡಗು', 
    isRTL: false, 
    country: 'IN',
    script: 'Kannada',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Karnataka',
    speakers: '113,000',
    officialStatus: 'Regional language'
  },
  { 
    code: 'bfq', 
    name: 'Havyaka', 
    nativeName: 'ಹವ್ಯಕ', 
    isRTL: false, 
    country: 'IN',
    script: 'Kannada',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Karnataka',
    speakers: '500,000',
    officialStatus: 'Regional language'
  },
  { 
    code: 'bfq', 
    name: 'Are Bhashe', 
    nativeName: 'ಅರೆ ಭಾಷೆ', 
    isRTL: false, 
    country: 'IN',
    script: 'Kannada',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Karnataka',
    speakers: '1.5 million',
    officialStatus: 'Regional language'
  },
  { 
    code: 'bfq', 
    name: 'Soliga', 
    nativeName: 'ಸೋಲಿಗ', 
    isRTL: false, 
    country: 'IN',
    script: 'Kannada',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Karnataka',
    speakers: '30,000',
    officialStatus: 'Regional language'
  },
  { 
    code: 'bfq', 
    name: 'Jenu Kuruba', 
    nativeName: 'ಜೆನು ಕುರುಬ', 
    isRTL: false, 
    country: 'IN',
    script: 'Kannada',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Karnataka',
    speakers: '50,000',
    officialStatus: 'Regional language'
  },
  { 
    code: 'bfq', 
    name: 'Urali', 
    nativeName: 'ಉರಳಿ', 
    isRTL: false, 
    country: 'IN',
    script: 'Kannada',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Karnataka',
    speakers: '25,000',
    officialStatus: 'Regional language'
  },
  { 
    code: 'bfq', 
    name: 'Sholiga', 
    nativeName: 'ಶೋಲಿಗ', 
    isRTL: false, 
    country: 'IN',
    script: 'Kannada',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Karnataka',
    speakers: '30,000',
    officialStatus: 'Regional language'
  },
  { 
    code: 'bfq', 
    name: 'Koraga', 
    nativeName: 'ಕೊರಗ', 
    isRTL: false, 
    country: 'IN',
    script: 'Kannada',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Karnataka',
    speakers: '14,000',
    officialStatus: 'Regional language'
  },
  { 
    code: 'bfq', 
    name: 'Kurumba', 
    nativeName: 'ಕುರುಂಬ', 
    isRTL: false, 
    country: 'IN',
    script: 'Kannada',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Karnataka',
    speakers: '20,000',
    officialStatus: 'Regional language'
  },
  { 
    code: 'bfq', 
    name: 'Jenu Kuruba', 
    nativeName: 'ಜೆನು ಕುರುಬ', 
    isRTL: false, 
    country: 'IN',
    script: 'Kannada',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Karnataka',
    speakers: '50,000',
    officialStatus: 'Regional language'
  },
  { 
    code: 'bfq', 
    name: 'Urali', 
    nativeName: 'ಉರಳಿ', 
    isRTL: false, 
    country: 'IN',
    script: 'Kannada',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Karnataka',
    speakers: '25,000',
    officialStatus: 'Regional language'
  },
  { 
    code: 'bfq', 
    name: 'Sholiga', 
    nativeName: 'ಶೋಲಿಗ', 
    isRTL: false, 
    country: 'IN',
    script: 'Kannada',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Karnataka',
    speakers: '30,000',
    officialStatus: 'Regional language'
  },
  { 
    code: 'bfq', 
    name: 'Koraga', 
    nativeName: 'ಕೊರಗ', 
    isRTL: false, 
    country: 'IN',
    script: 'Kannada',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Karnataka',
    speakers: '14,000',
    officialStatus: 'Regional language'
  },
  { 
    code: 'bfq', 
    name: 'Kurumba', 
    nativeName: 'ಕುರುಂಬ', 
    isRTL: false, 
    country: 'IN',
    script: 'Kannada',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    pluralRules: { one: 'n == 1', other: 'n != 1' },
    region: 'Karnataka',
    speakers: '20,000',
    officialStatus: 'Regional language'
  }
];

// Enhanced validation schemas
const languageSchema = Joi.object({
  tenantId: Joi.string().min(3).max(50).required(),
  code: Joi.string().pattern(/^[a-z]{2}(-[A-Z]{2})?$/).required(),
  name: Joi.string().min(2).max(100).required(),
  nativeName: Joi.string().min(2).max(100).required(),
  isRTL: Joi.boolean().default(false),
  metadata: Joi.object({
    country: Joi.string().pattern(/^[A-Z]{2}$/),
    region: Joi.string().max(50),
    script: Joi.string().max(50),
    currency: Joi.string().pattern(/^[A-Z]{3}$/),
    dateFormat: Joi.string().pattern(/^[DMY\/\-\.\s]+$/),
    timeFormat: Joi.string().valid('12h', '24h'),
    numberFormat: Joi.object({
      decimalSeparator: Joi.string().max(5),
      thousandsSeparator: Joi.string().max(5),
      currencySymbol: Joi.string().max(10),
      currencyPosition: Joi.string().valid('before', 'after')
    })
  }).optional()
});

const translationSchema = Joi.object({
  tenantId: Joi.string().min(3).max(50).required(),
  namespace: Joi.string().min(1).max(50).required(),
  key: Joi.string().min(1).max(200).required(),
  language: Joi.string().pattern(/^[a-z]{2}(-[A-Z]{2})?$/).required(),
  value: Joi.string().max(I18N_CONFIG.MAX_TRANSLATION_LENGTH).required(),
  context: Joi.string().max(500).optional(),
  isPlural: Joi.boolean().default(false),
  pluralForms: Joi.array().items(Joi.object({
    form: Joi.string().valid('zero', 'one', 'two', 'few', 'many', 'other'),
    value: Joi.string().max(I18N_CONFIG.MAX_TRANSLATION_LENGTH)
  })).optional(),
  metadata: Joi.object({
    translatorId: Joi.string().min(3).max(50),
    translationProvider: Joi.string().valid('google', 'microsoft', 'deepl', 'manual', 'system'),
    sourceLanguage: Joi.string().pattern(/^[a-z]{2}(-[A-Z]{2})?$/),
    tags: Joi.array().items(Joi.string().max(50)),
    category: Joi.string().max(100),
    priority: Joi.string().valid('low', 'medium', 'high', 'critical')
  }).optional()
});

const translationRequestSchema = Joi.object({
  tenantId: Joi.string().min(3).max(50).required(),
  sourceLanguage: Joi.string().pattern(/^[a-z]{2}(-[A-Z]{2})?$/).required(),
  targetLanguage: Joi.string().pattern(/^[a-z]{2}(-[A-Z]{2})?$/).required(),
  text: Joi.string().max(I18N_CONFIG.MAX_TRANSLATION_LENGTH).required(),
  context: Joi.string().max(500).optional(),
  userId: Joi.string().min(3).max(50).optional(),
  metadata: Joi.object({
    priority: Joi.string().valid('low', 'medium', 'high'),
    batchId: Joi.string().uuid()
  }).optional()
});

// Enhanced Translation utilities with comprehensive error handling
class TranslationManager {
  private cache: Map<string, any> = new Map();
  private readonly CACHE_TTL = I18N_CONFIG.CACHE_TTL;

  constructor() {
    // Initialize natural language processing
    natural.PorterStemmer.attach();
  }

  // Enhanced text translation with quality checks
  async translateText(text: string, sourceLanguage: string, targetLanguage: string, context?: string): Promise<any> {
    try {
      if (!text || typeof text !== 'string') {
        throw new Error('Text must be a non-empty string');
      }

      if (text.length > I18N_CONFIG.MAX_TRANSLATION_LENGTH) {
        throw new Error(`Text length ${text.length} exceeds maximum allowed length ${I18N_CONFIG.MAX_TRANSLATION_LENGTH}`);
      }

      // Check cache first
      const cacheKey = `${sourceLanguage}-${targetLanguage}-${text}`;
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return cached.result;
      }

      // Use Google Translate API
      const result = await translate(text, {
        from: sourceLanguage,
        to: targetLanguage
      });

      // Quality assessment
      const quality = await this.assessTranslationQuality(text, result.text, sourceLanguage, targetLanguage);

      const translationResult = {
        text: result.text,
        confidence: result.confidence || 0.95,
        quality: quality,
        provider: 'google',
        sourceLanguage,
        targetLanguage,
        characterCount: text.length,
        wordCount: text.split(/\s+/).length
      };

      // Cache the result
      this.cache.set(cacheKey, {
        result: translationResult,
        timestamp: Date.now()
      });

      return translationResult;

    } catch (error: any) {
      logger.error('Error translating text:', error);
      throw new Error(`Translation failed: ${error.message}`);
    }
  }

  // Enhanced translation quality assessment
  async assessTranslationQuality(sourceText: string, translatedText: string, sourceLanguage: string, targetLanguage: string): Promise<any> {
    try {
      const quality = {
        accuracy: 0.8, // Default accuracy
        fluency: 0.8, // Default fluency
        completeness: 1.0, // Default completeness
        consistency: 0.8, // Default consistency
        overall: 0.8 // Default overall score
      };

      // Basic quality checks
      if (!translatedText || translatedText.trim().length === 0) {
        quality.completeness = 0;
        quality.overall = 0;
        return quality;
      }

      // Length ratio check
      const sourceLength = sourceText.length;
      const translatedLength = translatedText.length;
      const lengthRatio = translatedLength / sourceLength;

      // Reasonable length ratio (0.5 to 2.0)
      if (lengthRatio < 0.5 || lengthRatio > 2.0) {
        quality.accuracy *= 0.8;
      }

      // Character encoding check
      if (this.hasInvalidCharacters(translatedText)) {
        quality.fluency *= 0.7;
      }

      // Language-specific checks
      if (targetLanguage === 'ar' || targetLanguage === 'ur') {
        // RTL language checks
        if (!this.isValidRTLLanguage(translatedText)) {
          quality.fluency *= 0.9;
        }
      }

      // Calculate overall score
      quality.overall = (quality.accuracy + quality.fluency + quality.completeness + quality.consistency) / 4;

      return quality;

    } catch (error: any) {
      logger.error('Error assessing translation quality:', error);
      return {
        accuracy: 0.5,
        fluency: 0.5,
        completeness: 1.0,
        consistency: 0.5,
        overall: 0.5
      };
    }
  }

  // Check for invalid characters
  private hasInvalidCharacters(text: string): boolean {
    // Check for common invalid characters
    const invalidChars = /[\uFFFD\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/;
    return invalidChars.test(text);
  }

  // Check if text is valid for RTL languages
  private isValidRTLLanguage(text: string): boolean {
    // Basic RTL language validation
    const rtlChars = /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/;
    return rtlChars.test(text);
  }

  // Enhanced language detection
  async detectLanguage(text: string): Promise<string> {
    try {
      if (!text || typeof text !== 'string') {
        throw new Error('Text must be a non-empty string');
      }

      // Enhanced language detection based on character patterns for comprehensive Indian language support
      const languagePatterns = {
        // Global Languages
        'en': /[a-zA-Z]/,
        'es': /[ñáéíóúü]/i,
        'fr': /[àâäéèêëïîôöùûüÿç]/i,
        'de': /[äöüß]/i,
        'it': /[àèéìíîòóù]/i,
        'pt': /[ãõç]/i,
        'ru': /[\u0400-\u04ff]/,
        'ja': /[\u3040-\u309f\u30a0-\u30ff]/,
        'ko': /[\uac00-\ud7af]/,
        'zh': /[\u4e00-\u9fff]/,
        'ar': /[\u0600-\u06FF]/,
        'ur': /[\u0600-\u06FF]/,
        
        // Indian Languages - Devanagari Script
        'hi': /[\u0900-\u097F]/, // Hindi
        'mr': /[\u0900-\u097F]/, // Marathi
        'ne': /[\u0900-\u097F]/, // Nepali
        'sa': /[\u0900-\u097F]/, // Sanskrit
        'bo': /[\u0900-\u097F]/, // Bodo
        'gom': /[\u0900-\u097F]/, // Konkani
        'mai': /[\u0900-\u097F]/, // Maithili
        'bh': /[\u0900-\u097F]/, // Bhojpuri
        'mag': /[\u0900-\u097F]/, // Magahi
        'awa': /[\u0900-\u097F]/, // Awadhi
        'raj': /[\u0900-\u097F]/, // Rajasthani
        'hne': /[\u0900-\u097F]/, // Chhattisgarhi
        'kfy': /[\u0900-\u097F]/, // Kumaoni
        'bfy': /[\u0900-\u097F]/, // Bagheli
        'kru': /[\u0900-\u097F]/, // Kurux
        'mtr': /[\u0900-\u097F]/, // Mewari
        'wbr': /[\u0900-\u097F]/, // Wagdi
        'dhd': /[\u0900-\u097F]/, // Dhundari
        'mup': /[\u0900-\u097F]/, // Malvi
        'bfu': /[\u0900-\u097F]/, // Gahri
        'khn': /[\u0900-\u097F]/, // Khandeshi/Varhadi
        'dgo': /[\u0900-\u097F]/, // Dogri
        
        // Indian Languages - Bengali Script
        'bn': /[\u0980-\u09FF]/, // Bengali
        'as': /[\u0980-\u09FF]/, // Assamese
        'mni': /[\u0980-\u09FF]/, // Manipuri
        
        // Indian Languages - Tamil Script
        'ta': /[\u0B80-\u0BFF]/, // Tamil
        
        // Indian Languages - Telugu Script
        'te': /[\u0C00-\u0C7F]/, // Telugu
        
        // Indian Languages - Malayalam Script
        'ml': /[\u0D00-\u0D7F]/, // Malayalam
        
        // Indian Languages - Kannada Script
        'kn': /[\u0C80-\u0CFF]/, // Kannada
        'tcy': /[\u0C80-\u0CFF]/, // Tulu
        'bfq': /[\u0C80-\u0CFF]/, // Badaga/Kodava/Beary/Coorgi/Havyaka/Are Bhashe/Soliga/Jenu Kuruba/Urali/Sholiga/Koraga/Kurumba
        
        // Indian Languages - Gujarati Script
        'gu': /[\u0A80-\u0AFF]/, // Gujarati
        'gbl': /[\u0A80-\u0AFF]/, // Gamit
        
        // Indian Languages - Odia Script
        'or': /[\u0B00-\u0B7F]/, // Odia
        
        // Indian Languages - Gurmukhi Script
        'pa': /[\u0A00-\u0A7F]/, // Punjabi
        
        // Indian Languages - Arabic Script
        'sd': /[\u0600-\u06FF]/, // Sindhi
        'ks': /[\u0600-\u06FF]/, // Kashmiri
        'kfs': /[\u0600-\u06FF]/, // Kashmiri (Persian Script)
        'dcc': /[\u0600-\u06FF]/, // Deccan
        
        // Indian Languages - Ol Chiki Script
        'sat': /[\u1C50-\u1C7F]/, // Santali
        
        // Indian Languages - Latin Script
        'kha': /[a-zA-Z]/, // Khasi
        'lus': /[a-zA-Z]/, // Mizo
        'grt': /[a-zA-Z]/, // Garo
        'njo': /[a-zA-Z]/, // Ao
        'njz': /[a-zA-Z]/ // Nyishi
      };

      let detectedLanguage = 'en';
      let maxScore = 0;

      for (const [lang, pattern] of Object.entries(languagePatterns)) {
        const matches = text.match(new RegExp(pattern, 'g'));
        const score = matches ? matches.length : 0;
        
        if (score > maxScore) {
          maxScore = score;
          detectedLanguage = lang;
        }
      }

      return detectedLanguage;

    } catch (error: any) {
      logger.error('Error detecting language:', error);
      return 'en'; // Default fallback
    }
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

const translationManager = new TranslationManager();

// Enhanced helper functions with comprehensive error handling
async function initializeDefaultLanguages(tenantId: string) {
  try {
    if (!tenantId || typeof tenantId !== 'string') {
      throw new Error('Valid tenantId is required');
    }

    // Check if languages already exist
    const existingLanguages = await Language.find({ tenantId });
    if (existingLanguages.length > 0) {
      logger.info(`Languages already initialized for tenant ${tenantId}`);
      return existingLanguages;
    }

    const languages = [];
    for (const lang of SUPPORTED_LANGUAGES) {
      const language = new Language({
        languageId: uuidv4(),
        tenantId,
        code: lang.code,
        name: lang.name,
        nativeName: lang.nativeName,
        isRTL: lang.isRTL,
        isActive: lang.code === 'en', // Only English is active by default
        isDefault: lang.code === 'en',
        quality: {
          score: 1.0,
          lastValidated: new Date(),
          validationCount: 0,
          issues: []
        },
        metadata: {
          country: lang.country,
          region: 'global',
          script: lang.script,
          currency: lang.currency,
          dateFormat: lang.dateFormat,
          timeFormat: lang.timeFormat,
          numberFormat: {
            decimalSeparator: '.',
            thousandsSeparator: ',',
            currencySymbol: '$',
            currencyPosition: 'before'
          },
          pluralRules: lang.pluralRules
        },
        statistics: {
          totalTranslations: 0,
          completedTranslations: 0,
          missingTranslations: 0,
          lastUpdated: new Date(),
          translationAccuracy: 1.0
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await language.save();
      languages.push(language);
    }

    logger.info(`Default languages initialized for tenant ${tenantId}: ${languages.length} languages`);
    return languages;

  } catch (error: any) {
    logger.error(`Error initializing default languages for tenant ${tenantId}:`, error);
    throw error;
  }
}

async function getTranslations(tenantId: string, language: string, namespace: string = 'common') {
  try {
    if (!tenantId || typeof tenantId !== 'string') {
      throw new Error('Valid tenantId is required');
    }

    if (!language || typeof language !== 'string') {
      throw new Error('Valid language is required');
    }

    const translations = await Translation.find({
      tenantId,
      language,
      namespace
    }).sort({ key: 1 });

    const translationObject = {};
    translations.forEach(t => {
      _.set(translationObject, t.key, t.value);
    });

    return translationObject;

  } catch (error: any) {
    logger.error(`Error getting translations for tenant ${tenantId}, language ${language}, namespace ${namespace}:`, error);
    throw error;
  }
}

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
    status: 'i18n Service is healthy', 
    uptime: process.uptime(),
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      cache: translationManager.getCacheStats(),
      supportedLanguages: SUPPORTED_LANGUAGES.length
    }
  });
});

// Initialize tenant languages with enhanced validation
app.post('/tenants/:tenantId/initialize', async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    if (!tenantId || typeof tenantId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Valid tenantId is required',
        code: 'INVALID_TENANT_ID'
      });
    }

    const languages = await initializeDefaultLanguages(tenantId);
    
    res.status(200).json({
      success: true,
      data: {
        languages: languages.map(lang => ({
          languageId: lang.languageId,
          code: lang.code,
          name: lang.name,
          nativeName: lang.nativeName,
          isRTL: lang.isRTL,
          isActive: lang.isActive,
          isDefault: lang.isDefault
        })),
        count: languages.length
      },
      message: 'Languages initialized successfully'
    });
  } catch (error: any) {
    logger.error('Error initializing languages:', error);
    res.status(400).json({ 
      success: false,
      message: error.message,
      code: 'INITIALIZATION_ERROR'
    });
  }
});

// Get Indian languages specifically
app.get('/languages/indian', async (req, res) => {
  try {
    const { 
      tenantId, 
      script,
      region,
      officialStatus,
      limit = 50, 
      page = 1,
      sortBy = 'speakers',
      sortOrder = 'desc'
    } = req.query;
    
    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'tenantId is required',
        code: 'MISSING_TENANT_ID'
      });
    }
    
    // Filter Indian languages
    const indianLanguages = SUPPORTED_LANGUAGES.filter(lang => lang.country === 'IN');
    
    let filteredLanguages = indianLanguages;
    
    // Apply filters
    if (script) {
      filteredLanguages = filteredLanguages.filter(lang => lang.script === script);
    }
    if (region) {
      filteredLanguages = filteredLanguages.filter(lang => lang.region?.includes(region as string));
    }
    if (officialStatus) {
      filteredLanguages = filteredLanguages.filter(lang => lang.officialStatus?.includes(officialStatus as string));
    }
    
    // Sort languages
    filteredLanguages.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'speakers':
          aValue = parseInt(a.speakers?.replace(/[^\d]/g, '') || '0');
          bValue = parseInt(b.speakers?.replace(/[^\d]/g, '') || '0');
          break;
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'code':
          aValue = a.code;
          bValue = b.code;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }
      
      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });
    
    // Pagination
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const paginatedLanguages = filteredLanguages.slice(skip, skip + parseInt(limit as string));
    
    // Group by script for better organization
    const languagesByScript = paginatedLanguages.reduce((acc, lang) => {
      if (!acc[lang.script]) {
        acc[lang.script] = [];
      }
      acc[lang.script].push(lang);
      return acc;
    }, {} as any);
    
    res.status(200).json({
      success: true,
      data: {
        languages: paginatedLanguages,
        languagesByScript,
        statistics: {
          total: filteredLanguages.length,
          byScript: Object.keys(languagesByScript).reduce((acc, script) => {
            acc[script] = languagesByScript[script].length;
            return acc;
          }, {} as any),
          totalSpeakers: filteredLanguages.reduce((sum, lang) => {
            const speakers = parseInt(lang.speakers?.replace(/[^\d]/g, '') || '0');
            return sum + speakers;
          }, 0),
          officialLanguages: filteredLanguages.filter(lang => 
            lang.officialStatus?.includes('Official') || 
            lang.officialStatus?.includes('Scheduled')
          ).length,
          regionalLanguages: filteredLanguages.filter(lang => 
            lang.officialStatus?.includes('Regional')
          ).length
        },
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: filteredLanguages.length,
          pages: Math.ceil(filteredLanguages.length / parseInt(limit as string))
        }
      },
      message: 'Indian languages retrieved successfully'
    });
  } catch (error: any) {
    logger.error('Error fetching Indian languages:', error);
    res.status(500).json({ 
      success: false,
      message: error.message,
      code: 'FETCH_INDIAN_LANGUAGES_ERROR'
    });
  }
});

// Get supported languages with enhanced filtering
app.get('/languages', async (req, res) => {
  try {
    const { 
      tenantId, 
      isActive, 
      isRTL,
      country,
      limit = 50, 
      page = 1,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;
    
    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'tenantId is required',
        code: 'MISSING_TENANT_ID'
      });
    }
    
    const filter: any = { tenantId };
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (isRTL !== undefined) filter.isRTL = isRTL === 'true';
    if (country) filter['metadata.country'] = country;
    
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;
    
    const languages = await Language.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit as string));
    
    const total = await Language.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      data: {
        languages: languages.map(lang => ({
          languageId: lang.languageId,
          code: lang.code,
          name: lang.name,
          nativeName: lang.nativeName,
          isRTL: lang.isRTL,
          isActive: lang.isActive,
          isDefault: lang.isDefault,
          quality: lang.quality,
          metadata: lang.metadata,
          statistics: lang.statistics,
          createdAt: lang.createdAt,
          updatedAt: lang.updatedAt
        })),
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      }
    });
  } catch (error: any) {
    logger.error('Error fetching languages:', error);
    res.status(500).json({ 
      success: false,
      message: error.message,
      code: 'FETCH_LANGUAGES_ERROR'
    });
  }
});

// Add/Update language with enhanced validation
app.post('/languages', 
  validateRequest(languageSchema), 
  async (req, res) => {
    try {
      const { tenantId, code, name, nativeName, isRTL, metadata } = req.validatedData;
      
      // Check if language already exists
      const existingLanguage = await Language.findOne({ tenantId, code });
      if (existingLanguage) {
        return res.status(409).json({
          success: false,
          message: 'Language already exists',
          code: 'LANGUAGE_EXISTS'
        });
      }

      // Check language limit
      const languageCount = await Language.countDocuments({ tenantId });
      if (languageCount >= I18N_CONFIG.MAX_LANGUAGES_PER_TENANT) {
        return res.status(400).json({
          success: false,
          message: `Maximum ${I18N_CONFIG.MAX_LANGUAGES_PER_TENANT} languages allowed per tenant`,
          code: 'LANGUAGE_LIMIT_EXCEEDED'
        });
      }

      const language = new Language({
        languageId: uuidv4(),
        tenantId,
        code,
        name,
        nativeName,
        isRTL: isRTL || false,
        isActive: true,
        isDefault: false,
        quality: {
          score: 1.0,
          lastValidated: new Date(),
          validationCount: 0,
          issues: []
        },
        metadata: {
          country: metadata?.country,
          region: metadata?.region || 'global',
          script: metadata?.script || 'Latin',
          currency: metadata?.currency || 'USD',
          dateFormat: metadata?.dateFormat || 'MM/DD/YYYY',
          timeFormat: metadata?.timeFormat || '12h',
          numberFormat: {
            decimalSeparator: metadata?.numberFormat?.decimalSeparator || '.',
            thousandsSeparator: metadata?.numberFormat?.thousandsSeparator || ',',
            currencySymbol: metadata?.numberFormat?.currencySymbol || '$',
            currencyPosition: metadata?.numberFormat?.currencyPosition || 'before'
          }
        },
        statistics: {
          totalTranslations: 0,
          completedTranslations: 0,
          missingTranslations: 0,
          lastUpdated: new Date(),
          translationAccuracy: 1.0
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await language.save();
      
      res.status(201).json({
        success: true,
        data: {
          languageId: language.languageId,
          code: language.code,
          name: language.name,
          nativeName: language.nativeName,
          isRTL: language.isRTL,
          isActive: language.isActive,
          metadata: language.metadata
        },
        message: 'Language added successfully'
      });
    } catch (error: any) {
      logger.error('Error adding language:', error);
      res.status(400).json({ 
        success: false,
        message: error.message,
        code: 'ADD_LANGUAGE_ERROR'
      });
    }
  }
);

// Get translations with enhanced filtering
app.get('/translations', async (req, res) => {
  try {
    const { 
      tenantId, 
      language, 
      namespace = 'common',
      key,
      isAutoTranslated,
      qualityMin,
      limit = 100, 
      page = 1,
      sortBy = 'key',
      sortOrder = 'asc'
    } = req.query;
    
    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'tenantId is required',
        code: 'MISSING_TENANT_ID'
      });
    }

    if (!language) {
      return res.status(400).json({
        success: false,
        message: 'language is required',
        code: 'MISSING_LANGUAGE'
      });
    }
    
    const filter: any = { tenantId, language, namespace };
    if (key) filter.key = { $regex: key, $options: 'i' };
    if (isAutoTranslated !== undefined) filter['metadata.isAutoTranslated'] = isAutoTranslated === 'true';
    if (qualityMin) filter['quality.score'] = { $gte: parseFloat(qualityMin as string) };
    
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;
    
    const translations = await Translation.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit as string));
    
    const total = await Translation.countDocuments(filter);
    
    // Build translation object
    const translationObject = {};
    translations.forEach(t => {
      _.set(translationObject, t.key, t.value);
    });
    
    res.status(200).json({
      success: true,
      data: {
        translations: translationObject,
        details: translations.map(t => ({
          translationId: t.translationId,
          key: t.key,
          value: t.value,
          context: t.context,
          quality: t.quality,
          metadata: t.metadata,
          version: t.version,
          lastModified: t.lastModified
        })),
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      }
    });
  } catch (error: any) {
    logger.error('Error fetching translations:', error);
    res.status(500).json({ 
      success: false,
      message: error.message,
      code: 'FETCH_TRANSLATIONS_ERROR'
    });
  }
});

// Add/Update translation with enhanced validation
app.post('/translations', 
  validateRequest(translationSchema), 
  async (req, res) => {
    try {
      const { tenantId, namespace, key, language, value, context, isPlural, pluralForms, metadata } = req.validatedData;
      
      // Quality assessment
      const quality = await translationManager.assessTranslationQuality(value, value, 'en', language);
      
      const translation = await Translation.findOneAndUpdate(
        { tenantId, namespace, key, language },
        {
          value,
          context,
          isPlural: isPlural || false,
          pluralForms: pluralForms || [],
          quality: {
            score: quality.overall,
            confidence: quality.accuracy,
            isReviewed: false,
            issues: []
          },
          metadata: {
            isAutoTranslated: false,
            translatorId: metadata?.translatorId || 'manual',
            translationProvider: metadata?.translationProvider || 'manual',
            sourceLanguage: metadata?.sourceLanguage || 'en',
            translationTime: Date.now(),
            characterCount: value.length,
            wordCount: value.split(/\s+/).length,
            complexity: value.length > 100 ? 'high' : value.length > 50 ? 'medium' : 'low',
            tags: metadata?.tags || [],
            category: metadata?.category || 'general',
            priority: metadata?.priority || 'medium'
          },
          version: { $inc: 1 },
          lastModified: new Date(),
          updatedAt: new Date()
        },
        { upsert: true, new: true }
      );
      
      res.status(200).json({
        success: true,
        data: {
          translationId: translation.translationId,
          key: translation.key,
          value: translation.value,
          quality: translation.quality,
          metadata: translation.metadata,
          version: translation.version
        },
        message: 'Translation updated successfully'
      });
    } catch (error: any) {
      logger.error('Error updating translation:', error);
      res.status(400).json({ 
        success: false,
        message: error.message,
        code: 'UPDATE_TRANSLATION_ERROR'
      });
    }
  }
);

// Translate text with enhanced validation
app.post('/translate', 
  translationLimiter,
  validateRequest(translationRequestSchema), 
  async (req, res) => {
    try {
      const { tenantId, sourceLanguage, targetLanguage, text, context, userId, metadata } = req.validatedData;
      
      const requestId = uuidv4();
      
      const request = new TranslationRequest({
        requestId,
        tenantId,
        userId,
        sourceLanguage,
        targetLanguage,
        text,
        context,
        status: 'pending',
        provider: 'google',
        metadata: {
          priority: metadata?.priority || 'medium',
          batchId: metadata?.batchId,
          characterCount: text.length,
          wordCount: text.split(/\s+/).length
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await request.save();
      
      // Process translation asynchronously
      await translationQueue.add('translate_text', {
        jobType: 'translate_text',
        data: { requestId, tenantId, sourceLanguage, targetLanguage, text, context }
      });
      
      res.status(202).json({
        success: true,
        data: { requestId },
        message: 'Translation initiated'
      });
    } catch (error: any) {
      logger.error('Error initiating translation:', error);
      res.status(400).json({ 
        success: false,
        message: error.message,
        code: 'TRANSLATION_INIT_ERROR'
      });
    }
  }
);

// Get translation status with enhanced response
app.get('/translate/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    
    if (!requestId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(requestId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request ID format',
        code: 'INVALID_REQUEST_ID'
      });
    }
    
    const request = await TranslationRequest.findOne({ requestId });
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Translation request not found',
        code: 'REQUEST_NOT_FOUND'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        requestId: request.requestId,
        status: request.status,
        translatedText: request.translatedText,
        quality: request.quality,
        provider: request.provider,
        processingTime: request.processingTime,
        errorMessage: request.errorMessage,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt
      }
    });
  } catch (error: any) {
    logger.error('Error fetching translation status:', error);
    res.status(500).json({ 
      success: false,
      message: error.message,
      code: 'FETCH_STATUS_ERROR'
    });
  }
});

// Detect language with enhanced validation
app.post('/detect-language', async (req, res) => {
  try {
    const { text, tenantId, userId } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Text must be a non-empty string',
        code: 'INVALID_TEXT'
      });
    }

    if (text.length > I18N_CONFIG.MAX_TRANSLATION_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Text length ${text.length} exceeds maximum allowed length ${I18N_CONFIG.MAX_TRANSLATION_LENGTH}`,
        code: 'TEXT_TOO_LONG'
      });
    }

    const detectedLanguage = await translationManager.detectLanguage(text);
    
    // Update user language preference if auto-detect is enabled
    if (userId && tenantId) {
      const preference = await UserLanguagePreference.findOne({ tenantId, userId });
      if (preference && preference.autoDetect) {
        preference.preferredLanguage = detectedLanguage;
        preference.lastUsed = new Date();
        preference.statistics.successfulDetections += 1;
        preference.statistics.lastDetectionAccuracy = 0.9; // Placeholder accuracy
        preference.updatedAt = new Date();
        await preference.save();
      }
    }

    res.status(200).json({
      success: true,
      data: { 
        language: detectedLanguage,
        confidence: 0.9, // Placeholder confidence
        textLength: text.length,
        wordCount: text.split(/\s+/).length
      },
      message: 'Language detected successfully'
    });
  } catch (error: any) {
    logger.error('Error detecting language:', error);
    res.status(400).json({ 
      success: false,
      message: error.message,
      code: 'LANGUAGE_DETECTION_ERROR'
    });
  }
});

// Set user language preference with enhanced validation
app.post('/user-preferences', async (req, res) => {
  try {
    const { tenantId, userId, preferredLanguage, fallbackLanguage, autoDetect, preferences } = req.body;
    
    if (!tenantId || !userId || !preferredLanguage) {
      return res.status(400).json({
        success: false,
        message: 'tenantId, userId, and preferredLanguage are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    const preference = await UserLanguagePreference.findOneAndUpdate(
      { tenantId, userId },
      {
        preferredLanguage,
        fallbackLanguage: fallbackLanguage || 'en',
        autoDetect: autoDetect !== undefined ? autoDetect : true,
        preferences: preferences || {},
        lastUsed: new Date(),
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    res.status(200).json({
      success: true,
      data: {
        preferenceId: preference.preferenceId,
        preferredLanguage: preference.preferredLanguage,
        fallbackLanguage: preference.fallbackLanguage,
        autoDetect: preference.autoDetect,
        preferences: preference.preferences,
        lastUsed: preference.lastUsed
      },
      message: 'User language preference updated successfully'
    });
  } catch (error: any) {
    logger.error('Error setting user language preference:', error);
    res.status(400).json({ 
      success: false,
      message: error.message,
      code: 'UPDATE_PREFERENCE_ERROR'
    });
  }
});

// Get user language preference with enhanced response
app.get('/user-preferences/:userId', async (req, res) => {
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
    
    const preference = await UserLanguagePreference.findOne({ tenantId, userId });
    
    if (!preference) {
      return res.status(404).json({
        success: false,
        message: 'User language preference not found',
        code: 'PREFERENCE_NOT_FOUND'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        preferenceId: preference.preferenceId,
        preferredLanguage: preference.preferredLanguage,
        fallbackLanguage: preference.fallbackLanguage,
        autoDetect: preference.autoDetect,
        preferences: preference.preferences,
        statistics: preference.statistics,
        lastUsed: preference.lastUsed,
        createdAt: preference.createdAt,
        updatedAt: preference.updatedAt
      }
    });
  } catch (error: any) {
    logger.error('Error fetching user language preference:', error);
    res.status(500).json({ 
      success: false,
      message: error.message,
      code: 'FETCH_PREFERENCE_ERROR'
    });
  }
});

// Enhanced error handling middleware
app.use(errorHandler);

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  logger.info('Client connected to i18n Service:', socket.id);
  
  socket.on('subscribe-translations', (data) => {
    if (data.tenantId) {
      socket.join(`translations-${data.tenantId}`);
      logger.info(`Client subscribed to translation updates for tenant ${data.tenantId}`);
    }
  });
  
  socket.on('disconnect', () => {
    logger.info('Client disconnected from i18n Service:', socket.id);
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
  logger.info(`Enhanced i18n Service running on port ${PORT}`);
  console.log(`Enhanced i18n Service running on port ${PORT}`);
});