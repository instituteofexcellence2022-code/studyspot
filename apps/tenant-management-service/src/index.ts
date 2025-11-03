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
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import _ from 'lodash';
import Joi from 'joi';

const app = express();
const PORT = process.env.PORT || 3026;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tenantmanagementdb';
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Configuration
const TENANT_CONFIG = {
  MAX_TENANTS_PER_USER: 10,
  MAX_USERS_PER_TENANT: 10000,
  MAX_STORAGE_PER_TENANT: 100 * 1024 * 1024 * 1024, // 100GB
  MAX_API_CALLS_PER_DAY: 1000000,
  TRIAL_PERIOD_DAYS: 30,
  GRACE_PERIOD_DAYS: 7,
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  RETENTION_DAYS: 365,
  MAX_CUSTOM_DOMAINS: 5,
  MAX_INTEGRATIONS: 20
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

const tenantLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // More restrictive for tenant operations
  message: "Too many tenant requests, please try again later.",
});

const adminLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // Very restrictive for admin operations
  message: "Too many admin requests, please try again later.",
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

const tenantQueue = new Queue('tenantQueue', { connection });

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
const TenantSchema = new mongoose.Schema({
  tenantId: { 
    type: String, 
    required: true, 
    unique: true,
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
        return v && v.length >= 2 && v.length <= 100;
      },
      message: 'Tenant name must be between 2 and 100 characters'
    }
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v: string) {
        return /^[a-z0-9-]+$/.test(v) && v.length >= 3 && v.length <= 50;
      },
      message: 'Tenant slug must be 3-50 characters, lowercase letters, numbers, and hyphens only'
    }
  },
  domain: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.?[a-zA-Z]{2,}$/.test(v);
      },
      message: 'Invalid domain format'
    }
  },
  customDomains: [{
    domain: { 
      type: String,
      validate: {
        validator: function(v: string) {
          return /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.?[a-zA-Z]{2,}$/.test(v);
        },
        message: 'Invalid custom domain format'
      }
    },
    isVerified: { type: Boolean, default: false },
    verificationToken: String,
    verifiedAt: Date,
    sslEnabled: { type: Boolean, default: false },
    sslCertificate: String,
    sslPrivateKey: String
  }],
  owner: {
    userId: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v: string) {
          return v && v.length >= 3 && v.length <= 50;
        },
        message: 'Owner user ID must be between 3 and 50 characters'
      }
    },
    email: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v: string) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Invalid email format'
      }
    },
    name: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v: string) {
          return v && v.length >= 2 && v.length <= 100;
        },
        message: 'Owner name must be between 2 and 100 characters'
      }
    }
  },
  subscription: {
    plan: { 
      type: String, 
      enum: ['free', 'basic', 'professional', 'enterprise', 'custom'], 
      default: 'free' 
    },
    status: { 
      type: String, 
      enum: ['active', 'trial', 'suspended', 'cancelled', 'expired'], 
      default: 'trial' 
    },
    startDate: { type: Date, default: Date.now },
    endDate: Date,
    trialEndDate: { 
      type: Date, 
      default: () => new Date(Date.now() + TENANT_CONFIG.TRIAL_PERIOD_DAYS * 24 * 60 * 60 * 1000)
    },
    billingCycle: { 
      type: String, 
      enum: ['monthly', 'quarterly', 'yearly'], 
      default: 'monthly' 
    },
    price: { type: Number, min: 0, default: 0 },
    currency: { type: String, default: 'USD' },
    paymentMethod: String,
    lastPaymentDate: Date,
    nextPaymentDate: Date,
    autoRenew: { type: Boolean, default: true },
    features: {
      maxUsers: { type: Number, min: 1, default: 10 },
      maxStorage: { type: Number, min: 0, default: 1024 * 1024 * 1024 }, // 1GB
      maxApiCalls: { type: Number, min: 0, default: 10000 },
      customDomains: { type: Number, min: 0, default: 0 },
      integrations: { type: Number, min: 0, default: 5 },
      analytics: { type: Boolean, default: false },
      support: { type: String, enum: ['email', 'priority', 'dedicated'], default: 'email' },
      ssl: { type: Boolean, default: false },
      backup: { type: Boolean, default: false },
      whiteLabel: { type: Boolean, default: false }
    }
  },
  settings: {
    timezone: { type: String, default: 'UTC' },
    language: { type: String, default: 'en' },
    currency: { type: String, default: 'USD' },
    dateFormat: { type: String, default: 'MM/DD/YYYY' },
    timeFormat: { type: String, enum: ['12h', '24h'], default: '12h' },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      webhook: { type: Boolean, default: false }
    },
    security: {
      twoFactorAuth: { type: Boolean, default: false },
      ipWhitelist: [String],
      sessionTimeout: { type: Number, min: 5, max: 1440, default: 30 }, // minutes
      passwordPolicy: {
        minLength: { type: Number, min: 6, max: 50, default: 8 },
        requireUppercase: { type: Boolean, default: true },
        requireLowercase: { type: Boolean, default: true },
        requireNumbers: { type: Boolean, default: true },
        requireSymbols: { type: Boolean, default: false },
        maxAge: { type: Number, min: 0, default: 90 } // days
      }
    },
    branding: {
      logo: String,
      favicon: String,
      primaryColor: { type: String, default: '#1976d2' },
      secondaryColor: { type: String, default: '#dc004e' },
      customCss: String,
      customJs: String
    }
  },
  integrations: [{
    name: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['payment', 'email', 'sms', 'analytics', 'crm', 'storage', 'custom'], 
      required: true 
    },
    config: mongoose.Schema.Types.Mixed,
    isActive: { type: Boolean, default: true },
    lastSync: Date,
    syncStatus: { type: String, enum: ['success', 'error', 'pending'], default: 'pending' },
    errorMessage: String
  }],
  usage: {
    users: { type: Number, default: 0, min: 0 },
    storage: { type: Number, default: 0, min: 0 },
    apiCalls: { type: Number, default: 0, min: 0 },
    lastReset: { type: Date, default: Date.now },
    dailyUsage: [{
      date: Date,
      users: Number,
      storage: Number,
      apiCalls: Number
    }]
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'suspended', 'maintenance'], 
    default: 'active' 
  },
  metadata: {
    industry: String,
    size: { type: String, enum: ['startup', 'small', 'medium', 'large', 'enterprise'] },
    region: String,
    tags: [String],
    notes: String,
    source: { type: String, enum: ['direct', 'referral', 'partner', 'organic'], default: 'direct' }
  },
  quality: {
    healthScore: { type: Number, min: 0, max: 100, default: 100 },
    lastHealthCheck: Date,
    issues: [{
      type: { type: String, enum: ['performance', 'security', 'billing', 'usage', 'integration'] },
      severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
      description: String,
      resolved: { type: Boolean, default: false },
      resolvedAt: Date
    }]
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes for better performance
TenantSchema.index({ tenantId: 1 }, { unique: true });
TenantSchema.index({ slug: 1 }, { unique: true });
TenantSchema.index({ domain: 1 });
TenantSchema.index({ 'owner.userId': 1 });
TenantSchema.index({ 'subscription.status': 1 });
TenantSchema.index({ 'subscription.plan': 1 });
TenantSchema.index({ status: 1 });
TenantSchema.index({ createdAt: 1 });

const Tenant = mongoose.model('Tenant', TenantSchema);

const TenantUserSchema = new mongoose.Schema({
  userTenantId: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v: string) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'User-Tenant ID must be a valid UUID'
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
        return v && v.length >= 3 && v.length <= 50;
      },
      message: 'User ID must be between 3 and 50 characters'
    }
  },
  email: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Invalid email format'
    }
  },
  role: { 
    type: String, 
    enum: ['owner', 'admin', 'manager', 'user', 'viewer'], 
    required: true 
  },
  permissions: [{
    resource: { type: String, required: true },
    actions: [{ type: String, enum: ['create', 'read', 'update', 'delete', 'manage'] }],
    conditions: mongoose.Schema.Types.Mixed
  }],
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'suspended', 'pending'], 
    default: 'pending' 
  },
  invitedBy: String,
  invitedAt: Date,
  acceptedAt: Date,
  lastActive: Date,
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    dashboard: {
      layout: String,
      widgets: [String],
      theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'auto' }
    }
  },
  metadata: {
    department: String,
    position: String,
    phone: String,
    avatar: String,
    timezone: String,
    language: String
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes
TenantUserSchema.index({ tenantId: 1, userId: 1 }, { unique: true });
TenantUserSchema.index({ tenantId: 1, role: 1 });
TenantUserSchema.index({ userId: 1 });
TenantUserSchema.index({ status: 1 });

const TenantUser = mongoose.model('TenantUser', TenantUserSchema);

const TenantActivitySchema = new mongoose.Schema({
  activityId: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v: string) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'Activity ID must be a valid UUID'
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
    validate: {
      validator: function(v: string) {
        return !v || v.length >= 3 && v.length <= 50;
      },
      message: 'User ID must be between 3 and 50 characters'
    }
  },
  action: { 
    type: String, 
    required: true,
    enum: ['create', 'update', 'delete', 'login', 'logout', 'invite', 'remove', 'suspend', 'activate', 'billing', 'integration'],
    validate: {
      validator: function(v: string) {
        return v && v.length >= 2 && v.length <= 50;
      },
      message: 'Action must be between 2 and 50 characters'
    }
  },
  resource: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return v && v.length >= 2 && v.length <= 50;
      },
      message: 'Resource must be between 2 and 50 characters'
    }
  },
  details: {
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    description: String,
    metadata: mongoose.Schema.Types.Mixed
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
  userAgent: String,
  timestamp: { type: Date, default: Date.now }
});

// Add indexes
TenantActivitySchema.index({ tenantId: 1, timestamp: -1 });
TenantActivitySchema.index({ userId: 1, timestamp: -1 });
TenantActivitySchema.index({ action: 1, resource: 1 });
TenantActivitySchema.index({ timestamp: 1 }, { expireAfterSeconds: TENANT_CONFIG.RETENTION_DAYS * 24 * 60 * 60 });

const TenantActivity = mongoose.model('TenantActivity', TenantActivitySchema);

// Enhanced validation schemas
const tenantSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  slug: Joi.string().pattern(/^[a-z0-9-]+$/).min(3).max(50).required(),
  domain: Joi.string().pattern(/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.?[a-zA-Z]{2,}$/).optional(),
  owner: Joi.object({
    userId: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    name: Joi.string().min(2).max(100).required()
  }).required(),
  subscription: Joi.object({
    plan: Joi.string().valid('free', 'basic', 'professional', 'enterprise', 'custom').default('free'),
    billingCycle: Joi.string().valid('monthly', 'quarterly', 'yearly').default('monthly'),
    price: Joi.number().min(0).default(0),
    currency: Joi.string().default('USD')
  }).optional(),
  settings: Joi.object({
    timezone: Joi.string().default('UTC'),
    language: Joi.string().default('en'),
    currency: Joi.string().default('USD'),
    dateFormat: Joi.string().default('MM/DD/YYYY'),
    timeFormat: Joi.string().valid('12h', '24h').default('12h')
  }).optional(),
  metadata: Joi.object({
    industry: Joi.string().max(100),
    size: Joi.string().valid('startup', 'small', 'medium', 'large', 'enterprise'),
    region: Joi.string().max(100),
    tags: Joi.array().items(Joi.string().max(50)),
    notes: Joi.string().max(1000),
    source: Joi.string().valid('direct', 'referral', 'partner', 'organic').default('direct')
  }).optional()
});

const tenantUserSchema = Joi.object({
  tenantId: Joi.string().uuid().required(),
  userId: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  role: Joi.string().valid('owner', 'admin', 'manager', 'user', 'viewer').required(),
  permissions: Joi.array().items(Joi.object({
    resource: Joi.string().required(),
    actions: Joi.array().items(Joi.string().valid('create', 'read', 'update', 'delete', 'manage')),
    conditions: Joi.object()
  })).optional(),
  metadata: Joi.object({
    department: Joi.string().max(100),
    position: Joi.string().max(100),
    phone: Joi.string().max(20),
    avatar: Joi.string().uri(),
    timezone: Joi.string(),
    language: Joi.string()
  }).optional()
});

// Enhanced Tenant utilities with comprehensive error handling
class TenantManager {
  private cache: Map<string, any> = new Map();
  private readonly CACHE_TTL = TENANT_CONFIG.CACHE_TTL;

  constructor() {
    // Initialize tenant management
  }

  // Enhanced tenant creation with validation
  async createTenant(tenantData: any): Promise<any> {
    try {
      if (!tenantData || typeof tenantData !== 'object') {
        throw new Error('Tenant data must be a valid object');
      }

      // Check if slug is available
      const existingTenant = await Tenant.findOne({ slug: tenantData.slug });
      if (existingTenant) {
        throw new Error('Tenant slug already exists');
      }

      // Check if domain is available
      if (tenantData.domain) {
        const existingDomain = await Tenant.findOne({ 
          $or: [
            { domain: tenantData.domain },
            { 'customDomains.domain': tenantData.domain }
          ]
        });
        if (existingDomain) {
          throw new Error('Domain already in use');
        }
      }

      // Check owner limits
      const ownerTenants = await Tenant.countDocuments({ 'owner.userId': tenantData.owner.userId });
      if (ownerTenants >= TENANT_CONFIG.MAX_TENANTS_PER_USER) {
        throw new Error(`Owner has reached maximum tenant limit of ${TENANT_CONFIG.MAX_TENANTS_PER_USER}`);
      }

      const tenant = new Tenant({
        tenantId: uuidv4(),
        name: tenantData.name,
        slug: tenantData.slug,
        domain: tenantData.domain,
        owner: tenantData.owner,
        subscription: {
          plan: tenantData.subscription?.plan || 'free',
          status: 'trial',
          startDate: new Date(),
          trialEndDate: new Date(Date.now() + TENANT_CONFIG.TRIAL_PERIOD_DAYS * 24 * 60 * 60 * 1000),
          billingCycle: tenantData.subscription?.billingCycle || 'monthly',
          price: tenantData.subscription?.price || 0,
          currency: tenantData.subscription?.currency || 'USD',
          features: this.getDefaultFeatures(tenantData.subscription?.plan || 'free')
        },
        settings: {
          timezone: tenantData.settings?.timezone || 'UTC',
          language: tenantData.settings?.language || 'en',
          currency: tenantData.settings?.currency || 'USD',
          dateFormat: tenantData.settings?.dateFormat || 'MM/DD/YYYY',
          timeFormat: tenantData.settings?.timeFormat || '12h',
          notifications: {
            email: true,
            push: true,
            sms: false,
            webhook: false
          },
          security: {
            twoFactorAuth: false,
            ipWhitelist: [],
            sessionTimeout: 30,
            passwordPolicy: {
              minLength: 8,
              requireUppercase: true,
              requireLowercase: true,
              requireNumbers: true,
              requireSymbols: false,
              maxAge: 90
            }
          },
          branding: {
            primaryColor: '#1976d2',
            secondaryColor: '#dc004e'
          }
        },
        usage: {
          users: 0,
          storage: 0,
          apiCalls: 0,
          lastReset: new Date(),
          dailyUsage: []
        },
        metadata: tenantData.metadata || {},
        quality: {
          healthScore: 100,
          lastHealthCheck: new Date(),
          issues: []
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await tenant.save();

      // Create owner user relationship
      const tenantUser = new TenantUser({
        userTenantId: uuidv4(),
        tenantId: tenant.tenantId,
        userId: tenantData.owner.userId,
        email: tenantData.owner.email,
        role: 'owner',
        permissions: this.getDefaultPermissions('owner'),
        status: 'active',
        acceptedAt: new Date(),
        lastActive: new Date(),
        preferences: {
          notifications: {
            email: true,
            push: true,
            sms: false
          },
          dashboard: {
            theme: 'auto'
          }
        },
        metadata: {
          timezone: tenantData.settings?.timezone || 'UTC',
          language: tenantData.settings?.language || 'en'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await tenantUser.save();

      // Log activity
      await this.logActivity(tenant.tenantId, tenantData.owner.userId, 'create', 'tenant', {
        description: 'Tenant created',
        metadata: {
          name: tenant.name,
          slug: tenant.slug,
          plan: tenant.subscription.plan
        }
      });

      logger.info(`Tenant created successfully: ${tenant.tenantId} for owner ${tenantData.owner.userId}`);

      return {
        tenantId: tenant.tenantId,
        name: tenant.name,
        slug: tenant.slug,
        domain: tenant.domain,
        subscription: tenant.subscription,
        settings: tenant.settings,
        status: tenant.status,
        createdAt: tenant.createdAt
      };

    } catch (error: any) {
      logger.error('Error creating tenant:', error);
      throw new Error(`Tenant creation failed: ${error.message}`);
    }
  }

  // Get default features based on plan
  private getDefaultFeatures(plan: string): any {
    const features = {
      free: {
        maxUsers: 10,
        maxStorage: 1024 * 1024 * 1024, // 1GB
        maxApiCalls: 10000,
        customDomains: 0,
        integrations: 5,
        analytics: false,
        support: 'email',
        ssl: false,
        backup: false,
        whiteLabel: false
      },
      basic: {
        maxUsers: 100,
        maxStorage: 10 * 1024 * 1024 * 1024, // 10GB
        maxApiCalls: 100000,
        customDomains: 1,
        integrations: 10,
        analytics: true,
        support: 'email',
        ssl: true,
        backup: false,
        whiteLabel: false
      },
      professional: {
        maxUsers: 1000,
        maxStorage: 100 * 1024 * 1024 * 1024, // 100GB
        maxApiCalls: 1000000,
        customDomains: 3,
        integrations: 20,
        analytics: true,
        support: 'priority',
        ssl: true,
        backup: true,
        whiteLabel: true
      },
      enterprise: {
        maxUsers: 10000,
        maxStorage: TENANT_CONFIG.MAX_STORAGE_PER_TENANT,
        maxApiCalls: TENANT_CONFIG.MAX_API_CALLS_PER_DAY,
        customDomains: TENANT_CONFIG.MAX_CUSTOM_DOMAINS,
        integrations: TENANT_CONFIG.MAX_INTEGRATIONS,
        analytics: true,
        support: 'dedicated',
        ssl: true,
        backup: true,
        whiteLabel: true
      }
    };

    return features[plan] || features.free;
  }

  // Get default permissions based on role
  private getDefaultPermissions(role: string): any[] {
    const permissions = {
      owner: [
        { resource: 'tenant', actions: ['create', 'read', 'update', 'delete', 'manage'] },
        { resource: 'users', actions: ['create', 'read', 'update', 'delete', 'manage'] },
        { resource: 'billing', actions: ['create', 'read', 'update', 'delete', 'manage'] },
        { resource: 'settings', actions: ['create', 'read', 'update', 'delete', 'manage'] },
        { resource: 'integrations', actions: ['create', 'read', 'update', 'delete', 'manage'] }
      ],
      admin: [
        { resource: 'tenant', actions: ['read', 'update'] },
        { resource: 'users', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'billing', actions: ['read', 'update'] },
        { resource: 'settings', actions: ['read', 'update'] },
        { resource: 'integrations', actions: ['create', 'read', 'update', 'delete'] }
      ],
      manager: [
        { resource: 'tenant', actions: ['read'] },
        { resource: 'users', actions: ['create', 'read', 'update'] },
        { resource: 'billing', actions: ['read'] },
        { resource: 'settings', actions: ['read'] },
        { resource: 'integrations', actions: ['read', 'update'] }
      ],
      user: [
        { resource: 'tenant', actions: ['read'] },
        { resource: 'users', actions: ['read'] },
        { resource: 'settings', actions: ['read'] }
      ],
      viewer: [
        { resource: 'tenant', actions: ['read'] },
        { resource: 'users', actions: ['read'] }
      ]
    };

    return permissions[role] || permissions.user;
  }

  // Enhanced tenant validation
  async validateTenant(tenantId: string): Promise<any> {
    try {
      if (!tenantId || typeof tenantId !== 'string') {
        throw new Error('Valid tenantId is required');
      }

      // Check cache first
      const cacheKey = `tenant-${tenantId}`;
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return cached.data;
      }

      const tenant = await Tenant.findOne({ tenantId });
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      // Check subscription status
      const now = new Date();
      if (tenant.subscription.status === 'trial' && tenant.subscription.trialEndDate < now) {
        tenant.subscription.status = 'expired';
        await tenant.save();
      }

      if (tenant.subscription.status === 'expired' && tenant.subscription.endDate < now) {
        tenant.status = 'suspended';
        await tenant.save();
      }

      const tenantData = {
        tenantId: tenant.tenantId,
        name: tenant.name,
        slug: tenant.slug,
        domain: tenant.domain,
        subscription: tenant.subscription,
        settings: tenant.settings,
        status: tenant.status,
        usage: tenant.usage,
        quality: tenant.quality
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: tenantData,
        timestamp: Date.now()
      });

      return tenantData;

    } catch (error: any) {
      logger.error(`Error validating tenant ${tenantId}:`, error);
      throw new Error(`Tenant validation failed: ${error.message}`);
    }
  }

  // Enhanced usage tracking
  async trackUsage(tenantId: string, usageType: string, amount: number): Promise<any> {
    try {
      if (!tenantId || !usageType || typeof amount !== 'number') {
        throw new Error('Valid tenantId, usageType, and amount are required');
      }

      const tenant = await Tenant.findOne({ tenantId });
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      // Check limits
      const limits = tenant.subscription.features;
      let exceeded = false;
      let limitType = '';

      switch (usageType) {
        case 'users':
          if (tenant.usage.users + amount > limits.maxUsers) {
            exceeded = true;
            limitType = 'users';
          }
          break;
        case 'storage':
          if (tenant.usage.storage + amount > limits.maxStorage) {
            exceeded = true;
            limitType = 'storage';
          }
          break;
        case 'apiCalls':
          if (tenant.usage.apiCalls + amount > limits.maxApiCalls) {
            exceeded = true;
            limitType = 'apiCalls';
          }
          break;
      }

      if (exceeded) {
        // Log usage limit exceeded
        await this.logActivity(tenantId, 'system', 'update', 'usage', {
          description: `${limitType} limit exceeded`,
          metadata: {
            usageType,
            amount,
            limit: limits[`max${limitType.charAt(0).toUpperCase() + limitType.slice(1)}`]
          }
        });

        throw new Error(`${limitType} limit exceeded`);
      }

      // Update usage
      const updateQuery: any = { $inc: {} };
      updateQuery.$inc[`usage.${usageType}`] = amount;

      await Tenant.findOneAndUpdate({ tenantId }, updateQuery);

      // Update daily usage
      const today = moment().startOf('day').toDate();
      await Tenant.findOneAndUpdate(
        { 
          tenantId,
          'usage.dailyUsage.date': { $ne: today }
        },
        {
          $push: {
            'usage.dailyUsage': {
              date: today,
              users: usageType === 'users' ? amount : 0,
              storage: usageType === 'storage' ? amount : 0,
              apiCalls: usageType === 'apiCalls' ? amount : 0
            }
          }
        }
      );

      logger.info(`Usage tracked for tenant ${tenantId}: ${usageType} +${amount}`);

      return { success: true, usageType, amount };

    } catch (error: any) {
      logger.error(`Error tracking usage for tenant ${tenantId}:`, error);
      throw new Error(`Usage tracking failed: ${error.message}`);
    }
  }

  // Enhanced activity logging
  async logActivity(tenantId: string, userId: string, action: string, resource: string, details: any): Promise<any> {
    try {
      const activity = new TenantActivity({
        activityId: uuidv4(),
        tenantId,
        userId,
        action,
        resource,
        details,
        timestamp: new Date()
      });

      await activity.save();

    } catch (error: any) {
      logger.error('Error logging tenant activity:', error);
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

const tenantManager = new TenantManager();

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
    status: 'Tenant Management Service is healthy', 
    uptime: process.uptime(),
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      cache: tenantManager.getCacheStats(),
      queue: tenantQueue.name
    }
  });
});

// Create tenant with enhanced validation
app.post('/tenants', 
  tenantLimiter,
  validateRequest(tenantSchema), 
  async (req, res) => {
    try {
      const tenantData = req.validatedData;
      
      const tenant = await tenantManager.createTenant(tenantData);
      
      res.status(201).json({
        success: true,
        data: tenant,
        message: 'Tenant created successfully'
      });
    } catch (error: any) {
      logger.error('Error creating tenant:', error);
      res.status(400).json({ 
        success: false,
        message: error.message,
        code: 'TENANT_CREATION_ERROR'
      });
    }
  }
);

// Get tenant with enhanced validation
app.get('/tenants/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    if (!tenantId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tenantId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tenant ID format',
        code: 'INVALID_TENANT_ID'
      });
    }
    
    const tenant = await tenantManager.validateTenant(tenantId);
    
    res.status(200).json({
      success: true,
      data: tenant,
      message: 'Tenant retrieved successfully'
    });
  } catch (error: any) {
    logger.error('Error fetching tenant:', error);
    res.status(404).json({ 
      success: false,
      message: error.message,
      code: 'TENANT_NOT_FOUND'
    });
  }
});

// Add user to tenant with enhanced validation
app.post('/tenants/:tenantId/users', 
  tenantLimiter,
  validateRequest(tenantUserSchema), 
  async (req, res) => {
    try {
      const { tenantId } = req.params;
      const userData = req.validatedData;
      
      // Check if tenant exists
      const tenant = await Tenant.findOne({ tenantId });
      if (!tenant) {
        return res.status(404).json({
          success: false,
          message: 'Tenant not found',
          code: 'TENANT_NOT_FOUND'
        });
      }

      // Check user limit
      if (tenant.usage.users >= tenant.subscription.features.maxUsers) {
        return res.status(400).json({
          success: false,
          message: 'User limit exceeded for this tenant',
          code: 'USER_LIMIT_EXCEEDED'
        });
      }

      // Check if user already exists in tenant
      const existingUser = await TenantUser.findOne({ tenantId, userId: userData.userId });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User already exists in this tenant',
          code: 'USER_EXISTS'
        });
      }

      const tenantUser = new TenantUser({
        userTenantId: uuidv4(),
        tenantId,
        userId: userData.userId,
        email: userData.email,
        role: userData.role,
        permissions: userData.permissions || tenantManager.getDefaultPermissions(userData.role),
        status: 'pending',
        invitedBy: req.headers['x-user-id'] || 'system',
        invitedAt: new Date(),
        preferences: {
          notifications: {
            email: true,
            push: true,
            sms: false
          },
          dashboard: {
            theme: 'auto'
          }
        },
        metadata: userData.metadata || {},
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await tenantUser.save();

      // Update tenant usage
      await tenantManager.trackUsage(tenantId, 'users', 1);

      // Log activity
      await tenantManager.logActivity(tenantId, req.headers['x-user-id'] || 'system', 'invite', 'user', {
        description: 'User invited to tenant',
        metadata: {
          userId: userData.userId,
          email: userData.email,
          role: userData.role
        }
      });

      res.status(201).json({
        success: true,
        data: {
          userTenantId: tenantUser.userTenantId,
          tenantId: tenantUser.tenantId,
          userId: tenantUser.userId,
          email: tenantUser.email,
          role: tenantUser.role,
          status: tenantUser.status,
          invitedAt: tenantUser.invitedAt
        },
        message: 'User added to tenant successfully'
      });
    } catch (error: any) {
      logger.error('Error adding user to tenant:', error);
      res.status(400).json({ 
        success: false,
        message: error.message,
        code: 'ADD_USER_ERROR'
      });
    }
  }
);

// Track usage with enhanced validation
app.post('/tenants/:tenantId/usage', 
  tenantLimiter,
  async (req, res) => {
    try {
      const { tenantId } = req.params;
      const { usageType, amount } = req.body;
      
      if (!usageType || typeof amount !== 'number') {
        return res.status(400).json({
          success: false,
          message: 'usageType and amount are required',
          code: 'MISSING_USAGE_DATA'
        });
      }

      const validUsageTypes = ['users', 'storage', 'apiCalls'];
      if (!validUsageTypes.includes(usageType)) {
        return res.status(400).json({
          success: false,
          message: `Invalid usage type. Must be one of: ${validUsageTypes.join(', ')}`,
          code: 'INVALID_USAGE_TYPE'
        });
      }

      const result = await tenantManager.trackUsage(tenantId, usageType, amount);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Usage tracked successfully'
      });
    } catch (error: any) {
      logger.error('Error tracking usage:', error);
      res.status(400).json({ 
        success: false,
        message: error.message,
        code: 'USAGE_TRACKING_ERROR'
      });
    }
  }
);

// Get tenant activities with enhanced filtering
app.get('/tenants/:tenantId/activities', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { 
      action, 
      resource, 
      userId,
      startDate,
      endDate,
      limit = 100, 
      page = 1,
      sortBy = 'timestamp',
      sortOrder = 'desc'
    } = req.query;
    
    if (!tenantId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tenantId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tenant ID format',
        code: 'INVALID_TENANT_ID'
      });
    }
    
    const filter: any = { tenantId };
    if (action) filter.action = action;
    if (resource) filter.resource = resource;
    if (userId) filter.userId = userId;
    
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate as string);
      if (endDate) filter.timestamp.$lte = new Date(endDate as string);
    }
    
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;
    
    const activities = await TenantActivity.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit as string));
    
    const total = await TenantActivity.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      data: {
        activities,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      }
    });
  } catch (error: any) {
    logger.error('Error fetching tenant activities:', error);
    res.status(500).json({ 
      success: false,
      message: error.message,
      code: 'FETCH_ACTIVITIES_ERROR'
    });
  }
});

// Enhanced error handling middleware
app.use(errorHandler);

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  logger.info('Client connected to Tenant Management Service:', socket.id);
  
  socket.on('subscribe-tenant', (data) => {
    if (data.tenantId) {
      socket.join(`tenant-${data.tenantId}`);
      logger.info(`Client subscribed to tenant updates for tenant ${data.tenantId}`);
    }
  });
  
  socket.on('disconnect', () => {
    logger.info('Client disconnected from Tenant Management Service:', socket.id);
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
  logger.info(`Enhanced Tenant Management Service running on port ${PORT}`);
  console.log(`Enhanced Tenant Management Service running on port ${PORT}`);
});