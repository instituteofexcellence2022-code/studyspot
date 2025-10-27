import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { logger } from './utils/logger';
import mongoose from 'mongoose';
import { Queue, Worker, Job } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';
import cron from 'node-cron';
import moment from 'moment';
import axios from 'axios';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Joi from 'joi';
import _ from 'lodash';

const app = express();
const PORT = process.env.PORT || 3026;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tenantdb';
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

app.use(express.json());
app.use(cors());
app.use(helmet());

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: "Too many requests from this IP, please try again later."
});
app.use(apiLimiter);

// Setup HTTP server for Socket.IO
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const connection = {
  host: REDIS_HOST,
  port: REDIS_PORT,
};

const tenantQueue = new Queue('tenantQueue', { connection });

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => logger.info('Connected to MongoDB'))
  .catch(err => logger.error('MongoDB connection error:', err));

// Mongoose Schemas
const TenantSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  domain: { type: String, unique: true, sparse: true },
  subdomain: { type: String, unique: true, sparse: true },
  type: { 
    type: String, 
    enum: ['library', 'school', 'university', 'coaching', 'training', 'corporate'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'suspended', 'trial'], 
    default: 'trial' 
  },
  plan: {
    name: { type: String, required: true },
    tier: { type: String, enum: ['free', 'basic', 'premium', 'enterprise'], required: true },
    features: { type: mongoose.Schema.Types.Mixed, default: {} },
    limits: { type: mongoose.Schema.Types.Mixed, default: {} },
    pricing: {
      monthly: { type: Number, default: 0 },
      yearly: { type: Number, default: 0 },
      currency: { type: String, default: 'USD' }
    },
    billingCycle: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
    trialEndsAt: Date,
    subscriptionId: String,
    customerId: String
  },
  settings: {
    timezone: { type: String, default: 'UTC' },
    language: { type: String, default: 'en' },
    dateFormat: { type: String, default: 'MM/DD/YYYY' },
    currency: { type: String, default: 'USD' },
    theme: { type: String, default: 'default' },
    branding: {
      logo: String,
      favicon: String,
      primaryColor: String,
      secondaryColor: String,
      customCSS: String
    },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true }
    },
    privacy: {
      dataRetention: { type: Number, default: 365 }, // days
      gdprCompliant: { type: Boolean, default: true },
      dataEncryption: { type: Boolean, default: true }
    }
  },
  features: {
    // Core Features
    userManagement: { enabled: { type: Boolean, default: true }, permissions: [String] },
    feeManagement: { enabled: { type: Boolean, default: true }, permissions: [String] },
    attendance: { enabled: { type: Boolean, default: true }, permissions: [String] },
    reports: { enabled: { type: Boolean, default: true }, permissions: [String] },
    
    // Advanced Features
    socialMedia: { enabled: { type: Boolean, default: false }, permissions: [String] },
    aiAgents: { enabled: { type: Boolean, default: false }, permissions: [String] },
    leadConversion: { enabled: { type: Boolean, default: false }, permissions: [String] },
    ticketManagement: { enabled: { type: Boolean, default: false }, permissions: [String] },
    faceRecognition: { enabled: { type: Boolean, default: false }, permissions: [String] },
    qrCodes: { enabled: { type: Boolean, default: false }, permissions: [String] },
    analytics: { enabled: { type: Boolean, default: false }, permissions: [String] },
    automation: { enabled: { type: Boolean, default: false }, permissions: [String] },
    crm: { enabled: { type: Boolean, default: false }, permissions: [String] },
    communication: { enabled: { type: Boolean, default: false }, permissions: [String] },
    payment: { enabled: { type: Boolean, default: false }, permissions: [String] },
    subscription: { enabled: { type: Boolean, default: false }, permissions: [String] },
    monitoring: { enabled: { type: Boolean, default: false }, permissions: [String] },
    security: { enabled: { type: Boolean, default: false }, permissions: [String] },
    dataPipeline: { enabled: { type: Boolean, default: false }, permissions: [String] },
    contentGeneration: { enabled: { type: Boolean, default: false }, permissions: [String] },
    engagement: { enabled: { type: Boolean, default: false }, permissions: [String] },
    scheduling: { enabled: { type: Boolean, default: false }, permissions: [String] }
  },
  limits: {
    users: { type: Number, default: 100 },
    students: { type: Number, default: 1000 },
    courses: { type: Number, default: 50 },
    storage: { type: Number, default: 1024 }, // MB
    apiCalls: { type: Number, default: 10000 }, // per month
    emails: { type: Number, default: 1000 }, // per month
    sms: { type: Number, default: 100 }, // per month
    integrations: { type: Number, default: 5 }
  },
  usage: {
    users: { type: Number, default: 0 },
    students: { type: Number, default: 0 },
    courses: { type: Number, default: 0 },
    storage: { type: Number, default: 0 }, // MB
    apiCalls: { type: Number, default: 0 }, // current month
    emails: { type: Number, default: 0 }, // current month
    sms: { type: Number, default: 0 }, // current month
    integrations: { type: Number, default: 0 }
  },
  adminUsers: [{
    userId: String,
    email: String,
    role: { type: String, enum: ['owner', 'admin', 'manager'], default: 'admin' },
    permissions: [String],
    lastLogin: Date,
    isActive: { type: Boolean, default: true }
  }],
  metadata: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const Tenant = mongoose.model('Tenant', TenantSchema);

const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  tenantId: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['owner', 'admin', 'manager', 'teacher', 'student', 'parent'], 
    required: true 
  },
  permissions: [String],
  profile: {
    avatar: String,
    phone: String,
    address: mongoose.Schema.Types.Mixed,
    preferences: mongoose.Schema.Types.Mixed
  },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

const FeaturePermissionSchema = new mongoose.Schema({
  permissionId: { type: String, required: true, unique: true },
  tenantId: { type: String, required: true },
  feature: { type: String, required: true },
  action: { type: String, required: true }, // create, read, update, delete, manage
  role: { type: String, required: true },
  conditions: mongoose.Schema.Types.Mixed, // Additional conditions
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
const FeaturePermission = mongoose.model('FeaturePermission', FeaturePermissionSchema);

const TenantActivitySchema = new mongoose.Schema({
  activityId: { type: String, required: true, unique: true },
  tenantId: { type: String, required: true },
  userId: String,
  action: { type: String, required: true },
  resource: String,
  details: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now }
});
const TenantActivity = mongoose.model('TenantActivity', TenantActivitySchema);

// Validation schemas
const tenantValidationSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  slug: Joi.string().required().min(2).max(50).pattern(/^[a-z0-9-]+$/),
  domain: Joi.string().optional().domain(),
  subdomain: Joi.string().optional().min(2).max(30).pattern(/^[a-z0-9-]+$/),
  type: Joi.string().valid('library', 'school', 'university', 'coaching', 'training', 'corporate').required(),
  plan: Joi.object({
    name: Joi.string().required(),
    tier: Joi.string().valid('free', 'basic', 'premium', 'enterprise').required(),
    features: Joi.object().optional(),
    limits: Joi.object().optional(),
    pricing: Joi.object({
      monthly: Joi.number().min(0),
      yearly: Joi.number().min(0),
      currency: Joi.string().length(3)
    }).optional()
  }).required()
});

// Worker to process tenant jobs
const worker = new Worker('tenantQueue', async (job: Job) => {
  logger.info(`Processing tenant job ${job.id} of type ${job.name}`);
  const { jobType, data } = job.data;

  try {
    switch (jobType) {
      case 'create_tenant':
        await createTenant(data);
        break;
      case 'update_features':
        await updateTenantFeatures(data);
        break;
      case 'check_limits':
        await checkTenantLimits(data);
        break;
      case 'sync_permissions':
        await syncTenantPermissions(data);
        break;
      case 'generate_report':
        await generateTenantReport(data);
        break;
      default:
        logger.warn(`Unknown tenant job type: ${jobType}`);
    }
  } catch (error: any) {
    logger.error(`Error processing tenant job ${job.id}:`, error);
    throw error;
  }
}, { connection });

worker.on('failed', (job, err) => {
  logger.error(`Tenant job ${job?.id} failed with error ${err.message}`);
});

// Helper functions
async function createTenant(data: any) {
  const { tenantData, adminUser } = data;
  
  try {
    // Create tenant
    const tenant = new Tenant({
      tenantId: uuidv4(),
      ...tenantData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await tenant.save();
    
    // Create admin user
    const hashedPassword = await bcrypt.hash(adminUser.password, 12);
    const user = new User({
      userId: uuidv4(),
      tenantId: tenant.tenantId,
      email: adminUser.email,
      password: hashedPassword,
      firstName: adminUser.firstName,
      lastName: adminUser.lastName,
      role: 'owner',
      permissions: ['*'], // Owner has all permissions
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await user.save();
    
    // Add admin user to tenant
    tenant.adminUsers.push({
      userId: user.userId,
      email: user.email,
      role: 'owner',
      permissions: ['*'],
      isActive: true
    });
    
    await tenant.save();
    
    // Initialize default permissions
    await initializeDefaultPermissions(tenant.tenantId);
    
    // Log activity
    await logTenantActivity(tenant.tenantId, user.userId, 'tenant_created', 'tenant', {
      tenantName: tenant.name,
      plan: tenant.plan.tier
    });
    
    logger.info(`Tenant ${tenant.name} created successfully`);
    
    // Emit real-time update
    io.emit('tenant-created', {
      tenantId: tenant.tenantId,
      name: tenant.name,
      plan: tenant.plan.tier
    });
    
  } catch (error: any) {
    logger.error(`Error creating tenant:`, error);
    throw error;
  }
}

async function initializeDefaultPermissions(tenantId: string) {
  const defaultPermissions = [
    // Core features permissions
    { feature: 'userManagement', action: 'manage', role: 'owner' },
    { feature: 'userManagement', action: 'read', role: 'admin' },
    { feature: 'userManagement', action: 'read', role: 'manager' },
    
    { feature: 'feeManagement', action: 'manage', role: 'owner' },
    { feature: 'feeManagement', action: 'manage', role: 'admin' },
    { feature: 'feeManagement', action: 'read', role: 'manager' },
    
    { feature: 'attendance', action: 'manage', role: 'owner' },
    { feature: 'attendance', action: 'manage', role: 'admin' },
    { feature: 'attendance', action: 'read', role: 'manager' },
    { feature: 'attendance', action: 'read', role: 'teacher' },
    
    { feature: 'reports', action: 'manage', role: 'owner' },
    { feature: 'reports', action: 'read', role: 'admin' },
    { feature: 'reports', action: 'read', role: 'manager' }
  ];
  
  for (const perm of defaultPermissions) {
    const permission = new FeaturePermission({
      permissionId: uuidv4(),
      tenantId,
      ...perm,
      isActive: true,
      createdAt: new Date()
    });
    
    await permission.save();
  }
}

async function updateTenantFeatures(data: any) {
  const { tenantId, features, updatedBy } = data;
  
  try {
    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }
    
    // Update features
    tenant.features = { ...tenant.features, ...features };
    tenant.updatedAt = new Date();
    
    await tenant.save();
    
    // Sync permissions based on enabled features
    await syncTenantPermissions({ tenantId });
    
    // Log activity
    await logTenantActivity(tenantId, updatedBy, 'features_updated', 'features', {
      updatedFeatures: Object.keys(features)
    });
    
    logger.info(`Features updated for tenant ${tenantId}`);
    
    // Emit real-time update
    io.emit('tenant-features-updated', {
      tenantId,
      features: tenant.features
    });
    
  } catch (error: any) {
    logger.error(`Error updating tenant features:`, error);
    throw error;
  }
}

async function checkTenantLimits(data: any) {
  const { tenantId } = data;
  
  try {
    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }
    
    const limits = tenant.limits;
    const usage = tenant.usage;
    
    const violations = [];
    
    // Check each limit
    for (const [key, limit] of Object.entries(limits)) {
      const currentUsage = usage[key as keyof typeof usage] || 0;
      if (currentUsage > limit) {
        violations.push({
          resource: key,
          limit,
          usage: currentUsage,
          exceeded: currentUsage - limit
        });
      }
    }
    
    if (violations.length > 0) {
      // Log limit violations
      await logTenantActivity(tenantId, 'system', 'limit_violation', 'limits', {
        violations
      });
      
      // Emit alert
      io.emit('tenant-limit-violation', {
        tenantId,
        violations
      });
      
      logger.warn(`Tenant ${tenantId} has exceeded limits:`, violations);
    }
    
  } catch (error: any) {
    logger.error(`Error checking tenant limits:`, error);
    throw error;
  }
}

async function syncTenantPermissions(data: any) {
  const { tenantId } = data;
  
  try {
    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }
    
    // Remove permissions for disabled features
    const enabledFeatures = Object.keys(tenant.features).filter(
      feature => tenant.features[feature as keyof typeof tenant.features].enabled
    );
    
    await FeaturePermission.updateMany(
      { tenantId },
      { 
        $set: { 
          isActive: { $in: ['$feature', enabledFeatures] }
        }
      }
    );
    
    logger.info(`Permissions synced for tenant ${tenantId}`);
    
  } catch (error: any) {
    logger.error(`Error syncing tenant permissions:`, error);
    throw error;
  }
}

async function generateTenantReport(data: any) {
  const { tenantId, reportType, period } = data;
  
  try {
    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }
    
    const endDate = new Date();
    const startDate = moment().subtract(parseInt(period || '30'), 'days').toDate();
    
    // Generate different types of reports
    let reportData;
    
    switch (reportType) {
      case 'usage':
        reportData = await generateUsageReport(tenantId, startDate, endDate);
        break;
      case 'features':
        reportData = await generateFeatureReport(tenantId);
        break;
      case 'activity':
        reportData = await generateActivityReport(tenantId, startDate, endDate);
        break;
      default:
        reportData = await generateGeneralReport(tenantId, startDate, endDate);
    }
    
    logger.info(`Report generated for tenant ${tenantId}: ${reportType}`);
    
    return reportData;
    
  } catch (error: any) {
    logger.error(`Error generating tenant report:`, error);
    throw error;
  }
}

async function generateUsageReport(tenantId: string, startDate: Date, endDate: Date) {
  const tenant = await Tenant.findOne({ tenantId });
  if (!tenant) return null;
  
  return {
    tenantId,
    reportType: 'usage',
    period: { startDate, endDate },
    limits: tenant.limits,
    usage: tenant.usage,
    utilization: Object.keys(tenant.limits).reduce((acc, key) => {
      const limit = tenant.limits[key as keyof typeof tenant.limits];
      const usage = tenant.usage[key as keyof typeof tenant.usage] || 0;
      acc[key] = {
        limit,
        usage,
        percentage: Math.round((usage / limit) * 100)
      };
      return acc;
    }, {} as any)
  };
}

async function generateFeatureReport(tenantId: string) {
  const tenant = await Tenant.findOne({ tenantId });
  if (!tenant) return null;
  
  return {
    tenantId,
    reportType: 'features',
    enabledFeatures: Object.keys(tenant.features).filter(
      feature => tenant.features[feature as keyof typeof tenant.features].enabled
    ),
    disabledFeatures: Object.keys(tenant.features).filter(
      feature => !tenant.features[feature as keyof typeof tenant.features].enabled
    ),
    featureDetails: tenant.features
  };
}

async function generateActivityReport(tenantId: string, startDate: Date, endDate: Date) {
  const activities = await TenantActivity.find({
    tenantId,
    timestamp: { $gte: startDate, $lte: endDate }
  }).sort({ timestamp: -1 });
  
  return {
    tenantId,
    reportType: 'activity',
    period: { startDate, endDate },
    totalActivities: activities.length,
    activities: activities.map(activity => ({
      action: activity.action,
      resource: activity.resource,
      timestamp: activity.timestamp,
      userId: activity.userId
    }))
  };
}

async function generateGeneralReport(tenantId: string, startDate: Date, endDate: Date) {
  const tenant = await Tenant.findOne({ tenantId });
  if (!tenant) return null;
  
  const usageReport = await generateUsageReport(tenantId, startDate, endDate);
  const featureReport = await generateFeatureReport(tenantId);
  const activityReport = await generateActivityReport(tenantId, startDate, endDate);
  
  return {
    tenantId,
    reportType: 'general',
    period: { startDate, endDate },
    tenant: {
      name: tenant.name,
      type: tenant.type,
      status: tenant.status,
      plan: tenant.plan.tier
    },
    usage: usageReport,
    features: featureReport,
    activity: activityReport
  };
}

async function logTenantActivity(tenantId: string, userId: string, action: string, resource: string, details: any) {
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
  } catch (error) {
    logger.error('Error logging tenant activity:', error);
  }
}

// Middleware for tenant context
const tenantContext = async (req: any, res: any, next: any) => {
  try {
    const tenantId = req.headers['x-tenant-id'] || req.query.tenantId;
    
    if (!tenantId) {
      return res.status(400).json({ message: 'Tenant ID is required' });
    }
    
    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    
    req.tenant = tenant;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error validating tenant' });
  }
};

// Middleware for feature access control
const featureAccess = (feature: string, action: string) => {
  return async (req: any, res: any, next: any) => {
    try {
      const tenant = req.tenant;
      const userRole = req.user?.role || 'guest';
      
      // Check if feature is enabled for tenant
      if (!tenant.features[feature as keyof typeof tenant.features]?.enabled) {
        return res.status(403).json({ 
          message: `Feature ${feature} is not enabled for this tenant` 
        });
      }
      
      // Check permissions
      const permission = await FeaturePermission.findOne({
        tenantId: tenant.tenantId,
        feature,
        action,
        role: userRole,
        isActive: true
      });
      
      if (!permission) {
        return res.status(403).json({ 
          message: `Access denied for ${action} on ${feature}` 
        });
      }
      
      next();
    } catch (error) {
      res.status(500).json({ message: 'Error checking feature access' });
    }
  };
};

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Tenant Management Service is healthy', uptime: process.uptime() });
});

// Create Tenant
app.post('/tenants', async (req, res) => {
  try {
    const { error, value } = tenantValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    
    await tenantQueue.add('create_tenant', {
      jobType: 'create_tenant',
      data: { tenantData: value, adminUser: req.body.adminUser }
    });
    
    res.status(202).json({ message: 'Tenant creation initiated' });
  } catch (error: any) {
    logger.error('Error creating tenant:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get Tenants
app.get('/tenants', async (req, res) => {
  try {
    const { 
      status, 
      plan, 
      type,
      limit = 50,
      page = 1 
    } = req.query;
    
    const filter: any = {};
    if (status) filter.status = status;
    if (plan) filter['plan.tier'] = plan;
    if (type) filter.type = type;
    
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const tenants = await Tenant.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string));
    
    const total = await Tenant.countDocuments(filter);
    
    res.status(200).json({
      tenants,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error: any) {
    logger.error('Error fetching tenants:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get Single Tenant
app.get('/tenants/:tenantId', tenantContext, async (req, res) => {
  try {
    res.status(200).json(req.tenant);
  } catch (error: any) {
    logger.error('Error fetching tenant:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update Tenant Features
app.put('/tenants/:tenantId/features', tenantContext, async (req, res) => {
  try {
    const { features } = req.body;
    const updatedBy = req.user?.userId || 'system';
    
    await tenantQueue.add('update_features', {
      jobType: 'update_features',
      data: { tenantId: req.tenant.tenantId, features, updatedBy }
    });
    
    res.status(202).json({ message: 'Feature update initiated' });
  } catch (error: any) {
    logger.error('Error updating tenant features:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get Tenant Features
app.get('/tenants/:tenantId/features', tenantContext, async (req, res) => {
  try {
    res.status(200).json({
      tenantId: req.tenant.tenantId,
      features: req.tenant.features,
      limits: req.tenant.limits,
      usage: req.tenant.usage
    });
  } catch (error: any) {
    logger.error('Error fetching tenant features:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update Tenant Settings
app.put('/tenants/:tenantId/settings', tenantContext, async (req, res) => {
  try {
    const { settings } = req.body;
    const updatedBy = req.user?.userId || 'system';
    
    await Tenant.findOneAndUpdate(
      { tenantId: req.tenant.tenantId },
      {
        settings: { ...req.tenant.settings, ...settings },
        updatedAt: new Date()
      }
    );
    
    // Log activity
    await logTenantActivity(req.tenant.tenantId, updatedBy, 'settings_updated', 'settings', {
      updatedSettings: Object.keys(settings)
    });
    
    res.status(200).json({ message: 'Settings updated successfully' });
  } catch (error: any) {
    logger.error('Error updating tenant settings:', error);
    res.status(400).json({ message: error.message });
  }
});

// Feature Access Check
app.get('/tenants/:tenantId/features/:feature/access', tenantContext, async (req, res) => {
  try {
    const { feature } = req.params;
    const { action = 'read', role } = req.query;
    
    const hasAccess = await FeaturePermission.findOne({
      tenantId: req.tenant.tenantId,
      feature,
      action: action as string,
      role: role as string,
      isActive: true
    });
    
    res.status(200).json({
      hasAccess: !!hasAccess,
      feature,
      action,
      role,
      enabled: req.tenant.features[feature as keyof typeof req.tenant.features]?.enabled || false
    });
  } catch (error: any) {
    logger.error('Error checking feature access:', error);
    res.status(500).json({ message: error.message });
  }
});

// Generate Tenant Report
app.post('/tenants/:tenantId/reports', tenantContext, async (req, res) => {
  try {
    const { reportType, period } = req.body;
    
    const reportData = await generateTenantReport({
      tenantId: req.tenant.tenantId,
      reportType,
      period
    });
    
    res.status(200).json(reportData);
  } catch (error: any) {
    logger.error('Error generating tenant report:', error);
    res.status(500).json({ message: error.message });
  }
});

// Analytics Dashboard
app.get('/analytics', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    const endDate = new Date();
    const startDate = moment().subtract(parseInt(period as string), 'days').toDate();
    
    // Tenant statistics
    const stats = await Tenant.aggregate([
      {
        $group: {
          _id: null,
          totalTenants: { $sum: 1 },
          activeTenants: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          trialTenants: { $sum: { $cond: [{ $eq: ['$status', 'trial'] }, 1, 0] } },
          avgUsersPerTenant: { $avg: '$usage.users' }
        }
      }
    ]);
    
    // Plan distribution
    const planDistribution = await Tenant.aggregate([
      { $group: { _id: '$plan.tier', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Feature usage
    const featureUsage = await Tenant.aggregate([
      {
        $project: {
          features: {
            $objectToArray: '$features'
          }
        }
      },
      { $unwind: '$features' },
      {
        $group: {
          _id: '$features.k',
          enabled: { $sum: { $cond: ['$features.v.enabled', 1, 0] } },
          total: { $sum: 1 }
        }
      },
      { $sort: { enabled: -1 } }
    ]);
    
    res.status(200).json({
      period: { startDate, endDate },
      summary: stats[0] || {},
      planDistribution,
      featureUsage
    });
  } catch (error: any) {
    logger.error('Error fetching analytics:', error);
    res.status(500).json({ message: error.message });
  }
});

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  logger.info('Client connected to Tenant Management Service:', socket.id);
  
  socket.on('subscribe-tenant', (data) => {
    socket.join(`tenant-${data.tenantId}`);
    logger.info(`Client subscribed to tenant ${data.tenantId} updates`);
  });
  
  socket.on('disconnect', () => {
    logger.info('Client disconnected from Tenant Management Service:', socket.id);
  });
});

// Scheduled tasks
cron.schedule('0 */6 * * *', async () => {
  // Check tenant limits every 6 hours
  const tenants = await Tenant.find({ status: 'active' });
  
  for (const tenant of tenants) {
    await tenantQueue.add('check_limits', {
      jobType: 'check_limits',
      data: { tenantId: tenant.tenantId }
    });
  }
});

cron.schedule('0 0 * * *', async () => {
  // Reset monthly usage counters
  await Tenant.updateMany(
    {},
    {
      $set: {
        'usage.apiCalls': 0,
        'usage.emails': 0,
        'usage.sms': 0
      }
    }
  );
  
  logger.info('Monthly usage counters reset');
});

server.listen(PORT, () => {
  logger.info(`Tenant Management Service running on port ${PORT}`);
  console.log(`Tenant Management Service running on port ${PORT}`);
});
