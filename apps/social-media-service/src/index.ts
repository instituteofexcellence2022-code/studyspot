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
import { TwitterApi } from 'twitter-api-v2';
import OpenAI from 'openai';
import natural from 'natural';
import compromise from 'compromise';
import sentiment from 'sentiment';
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
  defaultMeta: { service: 'social-media-service' },
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
  process.env.DATABASE_URL || 'postgresql://localhost:5432/studyspot_social_media',
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

// Social Media API configurations
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY || 'your-twitter-api-key',
  appSecret: process.env.TWITTER_API_SECRET || 'your-twitter-api-secret',
  accessToken: process.env.TWITTER_ACCESS_TOKEN || 'your-twitter-access-token',
  accessSecret: process.env.TWITTER_ACCESS_SECRET || 'your-twitter-access-secret',
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key'
});

// Social Media Service Models and Interfaces
interface SocialMediaAccount {
  id: string;
  tenantId: string;
  platform: 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'youtube' | 'tiktok' | 'pinterest';
  accountName: string;
  accountHandle: string;
  accountId: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiry?: Date;
  isActive: boolean;
  permissions: string[];
  metadata: {
    followers: number;
    following: number;
    posts: number;
    engagementRate: number;
    customFields: Record<string, any>;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface SocialMediaPost {
  id: string;
  tenantId: string;
  accountId: string;
  platform: string;
  content: {
    text: string;
    images?: string[];
    videos?: string[];
    links?: string[];
    hashtags: string[];
    mentions: string[];
  };
  schedule: {
    scheduledAt?: Date;
    timezone: string;
    isRecurring: boolean;
    recurringPattern?: {
      frequency: 'daily' | 'weekly' | 'monthly';
      interval: number;
      endDate?: Date;
    };
  };
  status: 'draft' | 'scheduled' | 'published' | 'failed' | 'cancelled';
  engagement: {
    likes: number;
    shares: number;
    comments: number;
    views?: number;
    clicks?: number;
    saves?: number;
  };
  analytics: {
    reach: number;
    impressions: number;
    engagementRate: number;
    clickThroughRate?: number;
    conversionRate?: number;
  };
  metadata: {
    customFields: Record<string, any>;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface ContentTemplate {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  category: 'promotional' | 'educational' | 'entertainment' | 'news' | 'personal' | 'custom';
  platform: string;
  template: {
    text: string;
    variables: string[];
    hashtags: string[];
    mentions: string[];
    callToAction?: string;
  };
  isActive: boolean;
  usageCount: number;
  metadata: {
    customFields: Record<string, any>;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface EngagementRule {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  platform: string;
  trigger: {
    type: 'keyword' | 'hashtag' | 'mention' | 'sentiment' | 'time' | 'location';
    value: string;
    conditions: Record<string, any>;
  };
  action: {
    type: 'like' | 'comment' | 'share' | 'follow' | 'dm' | 'reply';
    message?: string;
    template?: string;
    delay?: number; // in minutes
  };
  isActive: boolean;
  executionCount: number;
  metadata: {
    customFields: Record<string, any>;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface LeadGeneration {
  id: string;
  tenantId: string;
  platform: string;
  source: 'post' | 'comment' | 'dm' | 'mention' | 'hashtag' | 'profile';
  leadData: {
    name?: string;
    email?: string;
    phone?: string;
    socialHandle: string;
    profileUrl: string;
    bio?: string;
    location?: string;
    interests: string[];
    engagementLevel: 'low' | 'medium' | 'high';
  };
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  assignedTo?: string;
  notes: string[];
  metadata: {
    customFields: Record<string, any>;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface SocialMediaAnalytics {
  id: string;
  tenantId: string;
  accountId: string;
  platform: string;
  metric: string;
  value: number;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  date: Date;
  metadata: {
    customFields: Record<string, any>;
  };
  createdAt: Date;
}

// In-memory storage for demo (replace with database in production)
const socialMediaAccounts: SocialMediaAccount[] = [];
const socialMediaPosts: SocialMediaPost[] = [];
const contentTemplates: ContentTemplate[] = [];
const engagementRules: EngagementRule[] = [];
const leadGeneration: LeadGeneration[] = [];
const socialMediaAnalytics: SocialMediaAnalytics[] = [];

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
const validateSocialMediaAccount = [
  body('platform').isIn(['twitter', 'facebook', 'instagram', 'linkedin', 'youtube', 'tiktok', 'pinterest']).withMessage('Invalid platform'),
  body('accountName').notEmpty().withMessage('Account name is required'),
  body('accountHandle').notEmpty().withMessage('Account handle is required'),
  body('accountId').notEmpty().withMessage('Account ID is required'),
  body('accessToken').notEmpty().withMessage('Access token is required')
];

const validateSocialMediaPost = [
  body('accountId').notEmpty().withMessage('Account ID is required'),
  body('platform').notEmpty().withMessage('Platform is required'),
  body('content.text').notEmpty().withMessage('Post content is required'),
  body('content.hashtags').isArray().withMessage('Hashtags must be an array')
];

const validateContentTemplate = [
  body('name').notEmpty().withMessage('Template name is required'),
  body('description').notEmpty().withMessage('Template description is required'),
  body('category').isIn(['promotional', 'educational', 'entertainment', 'news', 'personal', 'custom']).withMessage('Invalid category'),
  body('platform').notEmpty().withMessage('Platform is required'),
  body('template.text').notEmpty().withMessage('Template text is required')
];

const validateEngagementRule = [
  body('name').notEmpty().withMessage('Rule name is required'),
  body('description').notEmpty().withMessage('Rule description is required'),
  body('platform').notEmpty().withMessage('Platform is required'),
  body('trigger.type').isIn(['keyword', 'hashtag', 'mention', 'sentiment', 'time', 'location']).withMessage('Invalid trigger type'),
  body('trigger.value').notEmpty().withMessage('Trigger value is required'),
  body('action.type').isIn(['like', 'comment', 'share', 'follow', 'dm', 'reply']).withMessage('Invalid action type')
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
    message: 'Social Media Service is healthy',
    timestamp: new Date().toISOString(),
    accounts: socialMediaAccounts.length,
    posts: socialMediaPosts.length,
    templates: contentTemplates.length,
    rules: engagementRules.length,
    leads: leadGeneration.length,
    analytics: socialMediaAnalytics.length,
    connectedClients: io.engine.clientsCount
  });
});

// ============================================
// SOCIAL MEDIA ACCOUNT MANAGEMENT ROUTES
// ============================================

/**
 * @route   POST /api/social-media/accounts
 * @desc    Connect a social media account
 * @access  Private
 */
app.post('/api/social-media/accounts', authenticateToken, validateSocialMediaAccount, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { platform, accountName, accountHandle, accountId, accessToken, refreshToken, tokenExpiry, permissions, metadata } = req.body;
    
    const account: SocialMediaAccount = {
      id: uuidv4(),
      tenantId: req.user.tenantId,
      platform,
      accountName,
      accountHandle,
      accountId,
      accessToken,
      refreshToken,
      tokenExpiry: tokenExpiry ? new Date(tokenExpiry) : undefined,
      isActive: true,
      permissions: permissions || [],
      metadata: {
        followers: 0,
        following: 0,
        posts: 0,
        engagementRate: 0,
        customFields: metadata?.customFields || {}
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    socialMediaAccounts.push(account);

    // Send real-time notification
    io.to(`tenant-${account.tenantId}`).emit('account_connected', {
      id: account.id,
      platform: account.platform,
      accountName: account.accountName,
      accountHandle: account.accountHandle,
      timestamp: new Date().toISOString()
    });

    logger.info(`Social media account connected: ${account.id}`);
    
    res.status(201).json({
      success: true,
      message: 'Social media account connected successfully',
      data: { account }
    });
  } catch (error) {
    logger.error('Error connecting social media account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to connect social media account'
    });
  }
});

/**
 * @route   GET /api/social-media/accounts
 * @desc    Get all connected social media accounts
 * @access  Private
 */
app.get('/api/social-media/accounts', authenticateToken, async (req, res) => {
  try {
    const { platform, isActive, limit = 50, offset = 0 } = req.query;
    
    let tenantAccounts = socialMediaAccounts.filter(account => account.tenantId === req.user.tenantId);
    
    // Apply filters
    if (platform) {
      tenantAccounts = tenantAccounts.filter(account => account.platform === platform);
    }
    if (isActive !== undefined) {
      tenantAccounts = tenantAccounts.filter(account => account.isActive === (isActive === 'true'));
    }
    
    // Sort by creation date
    tenantAccounts = tenantAccounts
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));
    
    res.json({
      success: true,
      data: { accounts: tenantAccounts },
      count: tenantAccounts.length,
      total: socialMediaAccounts.filter(account => account.tenantId === req.user.tenantId).length
    });
  } catch (error) {
    logger.error('Error fetching social media accounts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch social media accounts'
    });
  }
});

// ============================================
// SOCIAL MEDIA POST MANAGEMENT ROUTES
// ============================================

/**
 * @route   POST /api/social-media/posts
 * @desc    Create a social media post
 * @access  Private
 */
app.post('/api/social-media/posts', authenticateToken, validateSocialMediaPost, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { accountId, platform, content, schedule, metadata } = req.body;
    
    const post: SocialMediaPost = {
      id: uuidv4(),
      tenantId: req.user.tenantId,
      accountId,
      platform,
      content,
      schedule: schedule || {
        timezone: 'UTC'
      },
      status: 'draft',
      engagement: {
        likes: 0,
        shares: 0,
        comments: 0,
        views: 0,
        clicks: 0,
        saves: 0
      },
      analytics: {
        reach: 0,
        impressions: 0,
        engagementRate: 0,
        clickThroughRate: 0,
        conversionRate: 0
      },
      metadata: {
        customFields: metadata?.customFields || {}
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    socialMediaPosts.push(post);

    logger.info(`Social media post created: ${post.id}`);
    
    res.status(201).json({
      success: true,
      message: 'Social media post created successfully',
      data: { post }
    });
  } catch (error) {
    logger.error('Error creating social media post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create social media post'
    });
  }
});

/**
 * @route   POST /api/social-media/posts/:id/publish
 * @desc    Publish a social media post
 * @access  Private
 */
app.post('/api/social-media/posts/:id/publish', authenticateToken, async (req, res) => {
  try {
    const post = socialMediaPosts.find(
      p => p.id === req.params.id && p.tenantId === req.user.tenantId
    );
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Social media post not found'
      });
    }

    if (post.status !== 'draft' && post.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'Post has already been published or is in progress'
      });
    }

    // Update post status
    post.status = 'published';
    post.updatedAt = new Date();

    // Publish post to social media platform
    await publishToSocialMedia(post);

    // Send real-time notification
    io.to(`tenant-${post.tenantId}`).emit('post_published', {
      id: post.id,
      platform: post.platform,
      content: post.content.text,
      timestamp: new Date().toISOString()
    });

    logger.info(`Social media post published: ${post.id}`);
    
    res.json({
      success: true,
      message: 'Social media post published successfully',
      data: { post }
    });
  } catch (error) {
    logger.error('Error publishing social media post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish social media post',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/social-media/posts
 * @desc    Get all social media posts
 * @access  Private
 */
app.get('/api/social-media/posts', authenticateToken, async (req, res) => {
  try {
    const { platform, status, accountId, limit = 50, offset = 0 } = req.query;
    
    let tenantPosts = socialMediaPosts.filter(post => post.tenantId === req.user.tenantId);
    
    // Apply filters
    if (platform) {
      tenantPosts = tenantPosts.filter(post => post.platform === platform);
    }
    if (status) {
      tenantPosts = tenantPosts.filter(post => post.status === status);
    }
    if (accountId) {
      tenantPosts = tenantPosts.filter(post => post.accountId === accountId);
    }
    
    // Sort by creation date
    tenantPosts = tenantPosts
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));
    
    res.json({
      success: true,
      data: { posts: tenantPosts },
      count: tenantPosts.length,
      total: socialMediaPosts.filter(post => post.tenantId === req.user.tenantId).length
    });
  } catch (error) {
    logger.error('Error fetching social media posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch social media posts'
    });
  }
});

// ============================================
// CONTENT TEMPLATE MANAGEMENT ROUTES
// ============================================

/**
 * @route   POST /api/social-media/templates
 * @desc    Create a content template
 * @access  Private
 */
app.post('/api/social-media/templates', authenticateToken, validateContentTemplate, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { name, description, category, platform, template, metadata } = req.body;
    
    const contentTemplate: ContentTemplate = {
      id: uuidv4(),
      tenantId: req.user.tenantId,
      name,
      description,
      category,
      platform,
      template,
      isActive: true,
      usageCount: 0,
      metadata: {
        customFields: metadata?.customFields || {}
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    contentTemplates.push(contentTemplate);

    logger.info(`Content template created: ${contentTemplate.id}`);
    
    res.status(201).json({
      success: true,
      message: 'Content template created successfully',
      data: { template: contentTemplate }
    });
  } catch (error) {
    logger.error('Error creating content template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create content template'
    });
  }
});

/**
 * @route   GET /api/social-media/templates
 * @desc    Get all content templates
 * @access  Private
 */
app.get('/api/social-media/templates', authenticateToken, async (req, res) => {
  try {
    const { category, platform, isActive, limit = 50, offset = 0 } = req.query;
    
    let tenantTemplates = contentTemplates.filter(template => template.tenantId === req.user.tenantId);
    
    // Apply filters
    if (category) {
      tenantTemplates = tenantTemplates.filter(template => template.category === category);
    }
    if (platform) {
      tenantTemplates = tenantTemplates.filter(template => template.platform === platform);
    }
    if (isActive !== undefined) {
      tenantTemplates = tenantTemplates.filter(template => template.isActive === (isActive === 'true'));
    }
    
    // Sort by usage count
    tenantTemplates = tenantTemplates
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));
    
    res.json({
      success: true,
      data: { templates: tenantTemplates },
      count: tenantTemplates.length,
      total: contentTemplates.filter(template => template.tenantId === req.user.tenantId).length
    });
  } catch (error) {
    logger.error('Error fetching content templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch content templates'
    });
  }
});

// ============================================
// ENGAGEMENT RULE MANAGEMENT ROUTES
// ============================================

/**
 * @route   POST /api/social-media/engagement-rules
 * @desc    Create an engagement rule
 * @access  Private
 */
app.post('/api/social-media/engagement-rules', authenticateToken, validateEngagementRule, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { name, description, platform, trigger, action, metadata } = req.body;
    
    const engagementRule: EngagementRule = {
      id: uuidv4(),
      tenantId: req.user.tenantId,
      name,
      description,
      platform,
      trigger,
      action,
      isActive: true,
      executionCount: 0,
      metadata: {
        customFields: metadata?.customFields || {}
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    engagementRules.push(engagementRule);

    logger.info(`Engagement rule created: ${engagementRule.id}`);
    
    res.status(201).json({
      success: true,
      message: 'Engagement rule created successfully',
      data: { rule: engagementRule }
    });
  } catch (error) {
    logger.error('Error creating engagement rule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create engagement rule'
    });
  }
});

/**
 * @route   GET /api/social-media/engagement-rules
 * @desc    Get all engagement rules
 * @access  Private
 */
app.get('/api/social-media/engagement-rules', authenticateToken, async (req, res) => {
  try {
    const { platform, isActive, limit = 50, offset = 0 } = req.query;
    
    let tenantRules = engagementRules.filter(rule => rule.tenantId === req.user.tenantId);
    
    // Apply filters
    if (platform) {
      tenantRules = tenantRules.filter(rule => rule.platform === platform);
    }
    if (isActive !== undefined) {
      tenantRules = tenantRules.filter(rule => rule.isActive === (isActive === 'true'));
    }
    
    // Sort by execution count
    tenantRules = tenantRules
      .sort((a, b) => b.executionCount - a.executionCount)
      .slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));
    
    res.json({
      success: true,
      data: { rules: tenantRules },
      count: tenantRules.length,
      total: engagementRules.filter(rule => rule.tenantId === req.user.tenantId).length
    });
  } catch (error) {
    logger.error('Error fetching engagement rules:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch engagement rules'
    });
  }
});

// ============================================
// LEAD GENERATION ROUTES
// ============================================

/**
 * @route   GET /api/social-media/leads
 * @desc    Get all generated leads
 * @access  Private
 */
app.get('/api/social-media/leads', authenticateToken, async (req, res) => {
  try {
    const { platform, status, engagementLevel, limit = 50, offset = 0 } = req.query;
    
    let tenantLeads = leadGeneration.filter(lead => lead.tenantId === req.user.tenantId);
    
    // Apply filters
    if (platform) {
      tenantLeads = tenantLeads.filter(lead => lead.platform === platform);
    }
    if (status) {
      tenantLeads = tenantLeads.filter(lead => lead.status === status);
    }
    if (engagementLevel) {
      tenantLeads = tenantLeads.filter(lead => lead.leadData.engagementLevel === engagementLevel);
    }
    
    // Sort by creation date
    tenantLeads = tenantLeads
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));
    
    res.json({
      success: true,
      data: { leads: tenantLeads },
      count: tenantLeads.length,
      total: leadGeneration.filter(lead => lead.tenantId === req.user.tenantId).length
    });
  } catch (error) {
    logger.error('Error fetching leads:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leads'
    });
  }
});

// ============================================
// AI-POWERED CONTENT GENERATION ROUTES
// ============================================

/**
 * @route   POST /api/social-media/generate-content
 * @desc    Generate AI-powered content
 * @access  Private
 */
app.post('/api/social-media/generate-content', authenticateToken, async (req, res) => {
  try {
    const { platform, topic, tone, length, hashtags, mentions, callToAction } = req.body;
    
    if (!topic) {
      return res.status(400).json({
        success: false,
        message: 'Topic is required for content generation'
      });
    }

    // Generate AI content using OpenAI
    const generatedContent = await generateAIContent({
      platform,
      topic,
      tone: tone || 'professional',
      length: length || 'medium',
      hashtags: hashtags || [],
      mentions: mentions || [],
      callToAction: callToAction || ''
    });

    logger.info(`AI content generated for topic: ${topic}`);
    
    res.json({
      success: true,
      message: 'Content generated successfully',
      data: { content: generatedContent }
    });
  } catch (error) {
    logger.error('Error generating AI content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate content',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/social-media/analyze-sentiment
 * @desc    Analyze sentiment of social media content
 * @access  Private
 */
app.post('/api/social-media/analyze-sentiment', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required for sentiment analysis'
      });
    }

    // Analyze sentiment using natural language processing
    const sentimentAnalysis = analyzeSentiment(content);

    logger.info(`Sentiment analysis completed for content`);
    
    res.json({
      success: true,
      message: 'Sentiment analysis completed successfully',
      data: { sentiment: sentimentAnalysis }
    });
  } catch (error) {
    logger.error('Error analyzing sentiment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze sentiment',
      error: error.message
    });
  }
});

// ============================================
// SOCIAL MEDIA ANALYTICS ROUTES
// ============================================

/**
 * @route   GET /api/social-media/analytics/dashboard
 * @desc    Get social media analytics dashboard
 * @access  Private
 */
app.get('/api/social-media/analytics/dashboard', authenticateToken, async (req, res) => {
  try {
    const tenantAccounts = socialMediaAccounts.filter(account => account.tenantId === req.user.tenantId);
    const tenantPosts = socialMediaPosts.filter(post => post.tenantId === req.user.tenantId);
    const tenantLeads = leadGeneration.filter(lead => lead.tenantId === req.user.tenantId);
    const tenantRules = engagementRules.filter(rule => rule.tenantId === req.user.tenantId);

    // Account analytics
    const accountStats = {
      total: tenantAccounts.length,
      byPlatform: {
        twitter: tenantAccounts.filter(a => a.platform === 'twitter').length,
        facebook: tenantAccounts.filter(a => a.platform === 'facebook').length,
        instagram: tenantAccounts.filter(a => a.platform === 'instagram').length,
        linkedin: tenantAccounts.filter(a => a.platform === 'linkedin').length,
        youtube: tenantAccounts.filter(a => a.platform === 'youtube').length,
        tiktok: tenantAccounts.filter(a => a.platform === 'tiktok').length,
        pinterest: tenantAccounts.filter(a => a.platform === 'pinterest').length
      },
      active: tenantAccounts.filter(a => a.isActive).length,
      inactive: tenantAccounts.filter(a => !a.isActive).length,
      totalFollowers: tenantAccounts.reduce((sum, a) => sum + a.metadata.followers, 0),
      averageEngagementRate: tenantAccounts.reduce((sum, a) => sum + a.metadata.engagementRate, 0) / tenantAccounts.length || 0
    };

    // Post analytics
    const postStats = {
      total: tenantPosts.length,
      byStatus: {
        draft: tenantPosts.filter(p => p.status === 'draft').length,
        scheduled: tenantPosts.filter(p => p.status === 'scheduled').length,
        published: tenantPosts.filter(p => p.status === 'published').length,
        failed: tenantPosts.filter(p => p.status === 'failed').length,
        cancelled: tenantPosts.filter(p => p.status === 'cancelled').length
      },
      byPlatform: {
        twitter: tenantPosts.filter(p => p.platform === 'twitter').length,
        facebook: tenantPosts.filter(p => p.platform === 'facebook').length,
        instagram: tenantPosts.filter(p => p.platform === 'instagram').length,
        linkedin: tenantPosts.filter(p => p.platform === 'linkedin').length,
        youtube: tenantPosts.filter(p => p.platform === 'youtube').length,
        tiktok: tenantPosts.filter(p => p.platform === 'tiktok').length,
        pinterest: tenantPosts.filter(p => p.platform === 'pinterest').length
      },
      totalLikes: tenantPosts.reduce((sum, p) => sum + p.engagement.likes, 0),
      totalShares: tenantPosts.reduce((sum, p) => sum + p.engagement.shares, 0),
      totalComments: tenantPosts.reduce((sum, p) => sum + p.engagement.comments, 0),
      totalViews: tenantPosts.reduce((sum, p) => sum + (p.engagement.views || 0), 0),
      averageEngagementRate: tenantPosts.reduce((sum, p) => sum + p.analytics.engagementRate, 0) / tenantPosts.length || 0
    };

    // Lead analytics
    const leadStats = {
      total: tenantLeads.length,
      byStatus: {
        new: tenantLeads.filter(l => l.status === 'new').length,
        contacted: tenantLeads.filter(l => l.status === 'contacted').length,
        qualified: tenantLeads.filter(l => l.status === 'qualified').length,
        converted: tenantLeads.filter(l => l.status === 'converted').length,
        lost: tenantLeads.filter(l => l.status === 'lost').length
      },
      byPlatform: {
        twitter: tenantLeads.filter(l => l.platform === 'twitter').length,
        facebook: tenantLeads.filter(l => l.platform === 'facebook').length,
        instagram: tenantLeads.filter(l => l.platform === 'instagram').length,
        linkedin: tenantLeads.filter(l => l.platform === 'linkedin').length,
        youtube: tenantLeads.filter(l => l.platform === 'youtube').length,
        tiktok: tenantLeads.filter(l => l.platform === 'tiktok').length,
        pinterest: tenantLeads.filter(l => l.platform === 'pinterest').length
      },
      byEngagementLevel: {
        low: tenantLeads.filter(l => l.leadData.engagementLevel === 'low').length,
        medium: tenantLeads.filter(l => l.leadData.engagementLevel === 'medium').length,
        high: tenantLeads.filter(l => l.leadData.engagementLevel === 'high').length
      },
      conversionRate: tenantLeads.length > 0 ? 
        (tenantLeads.filter(l => l.status === 'converted').length / tenantLeads.length) * 100 : 0
    };

    // Engagement rule analytics
    const ruleStats = {
      total: tenantRules.length,
      active: tenantRules.filter(r => r.isActive).length,
      inactive: tenantRules.filter(r => !r.isActive).length,
      totalExecutions: tenantRules.reduce((sum, r) => sum + r.executionCount, 0),
      averageExecutions: tenantRules.reduce((sum, r) => sum + r.executionCount, 0) / tenantRules.length || 0
    };

    res.json({
      success: true,
      data: {
        accounts: accountStats,
        posts: postStats,
        leads: leadStats,
        rules: ruleStats,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error fetching social media analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch social media analytics'
    });
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

async function publishToSocialMedia(post: SocialMediaPost): Promise<void> {
  try {
    const account = socialMediaAccounts.find(a => a.id === post.accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    switch (post.platform) {
      case 'twitter':
        await publishToTwitter(post, account);
        break;
      case 'facebook':
        await publishToFacebook(post, account);
        break;
      case 'instagram':
        await publishToInstagram(post, account);
        break;
      case 'linkedin':
        await publishToLinkedIn(post, account);
        break;
      case 'youtube':
        await publishToYouTube(post, account);
        break;
      case 'tiktok':
        await publishToTikTok(post, account);
        break;
      case 'pinterest':
        await publishToPinterest(post, account);
        break;
      default:
        throw new Error(`Unsupported platform: ${post.platform}`);
    }

    logger.info(`Post published to ${post.platform}: ${post.id}`);
  } catch (error) {
    logger.error('Error publishing to social media:', error);
    post.status = 'failed';
    post.updatedAt = new Date();
    throw error;
  }
}

async function publishToTwitter(post: SocialMediaPost, account: SocialMediaAccount): Promise<void> {
  try {
    // Simulate Twitter API call
    logger.info(`Publishing to Twitter: ${post.content.text}`);
    
    // In a real implementation, you would use the Twitter API
    // const tweet = await twitterClient.v2.tweet(post.content.text);
    
    // Update post with published data
    post.status = 'published';
    post.updatedAt = new Date();
  } catch (error) {
    throw error;
  }
}

async function publishToFacebook(post: SocialMediaPost, account: SocialMediaAccount): Promise<void> {
  try {
    // Simulate Facebook API call
    logger.info(`Publishing to Facebook: ${post.content.text}`);
    
    // In a real implementation, you would use the Facebook API
    // const post = await facebookClient.api('/me/feed', 'POST', { message: post.content.text });
    
    // Update post with published data
    post.status = 'published';
    post.updatedAt = new Date();
  } catch (error) {
    throw error;
  }
}

async function publishToInstagram(post: SocialMediaPost, account: SocialMediaAccount): Promise<void> {
  try {
    // Simulate Instagram API call
    logger.info(`Publishing to Instagram: ${post.content.text}`);
    
    // In a real implementation, you would use the Instagram API
    // const media = await instagramClient.createMedia(post.content.text, post.content.images);
    
    // Update post with published data
    post.status = 'published';
    post.updatedAt = new Date();
  } catch (error) {
    throw error;
  }
}

async function publishToLinkedIn(post: SocialMediaPost, account: SocialMediaAccount): Promise<void> {
  try {
    // Simulate LinkedIn API call
    logger.info(`Publishing to LinkedIn: ${post.content.text}`);
    
    // In a real implementation, you would use the LinkedIn API
    // const share = await linkedinClient.shares.create(post.content.text);
    
    // Update post with published data
    post.status = 'published';
    post.updatedAt = new Date();
  } catch (error) {
    throw error;
  }
}

async function publishToYouTube(post: SocialMediaPost, account: SocialMediaAccount): Promise<void> {
  try {
    // Simulate YouTube API call
    logger.info(`Publishing to YouTube: ${post.content.text}`);
    
    // In a real implementation, you would use the YouTube API
    // const video = await youtubeClient.videos.insert(post.content.videos[0]);
    
    // Update post with published data
    post.status = 'published';
    post.updatedAt = new Date();
  } catch (error) {
    throw error;
  }
}

async function publishToTikTok(post: SocialMediaPost, account: SocialMediaAccount): Promise<void> {
  try {
    // Simulate TikTok API call
    logger.info(`Publishing to TikTok: ${post.content.text}`);
    
    // In a real implementation, you would use the TikTok API
    // const video = await tiktokClient.videos.upload(post.content.videos[0]);
    
    // Update post with published data
    post.status = 'published';
    post.updatedAt = new Date();
  } catch (error) {
    throw error;
  }
}

async function publishToPinterest(post: SocialMediaPost, account: SocialMediaAccount): Promise<void> {
  try {
    // Simulate Pinterest API call
    logger.info(`Publishing to Pinterest: ${post.content.text}`);
    
    // In a real implementation, you would use the Pinterest API
    // const pin = await pinterestClient.pins.create(post.content.text, post.content.images[0]);
    
    // Update post with published data
    post.status = 'published';
    post.updatedAt = new Date();
  } catch (error) {
    throw error;
  }
}

async function generateAIContent(params: {
  platform: string;
  topic: string;
  tone: string;
  length: string;
  hashtags: string[];
  mentions: string[];
  callToAction: string;
}): Promise<any> {
  try {
    const { platform, topic, tone, length, hashtags, mentions, callToAction } = params;
    
    // Create prompt for AI content generation
    const prompt = `Generate a ${tone} social media post for ${platform} about "${topic}". 
    Length: ${length}. 
    Include relevant hashtags: ${hashtags.join(', ')}. 
    Mention: ${mentions.join(', ')}. 
    Call to action: ${callToAction}.`;
    
    // Generate content using OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.7
    });
    
    const generatedText = response.choices[0].message.content;
    
    // Extract hashtags and mentions from generated content
    const extractedHashtags = generatedText.match(/#\w+/g) || [];
    const extractedMentions = generatedText.match(/@\w+/g) || [];
    
    return {
      text: generatedText,
      hashtags: extractedHashtags,
      mentions: extractedMentions,
      wordCount: generatedText.split(' ').length,
      characterCount: generatedText.length,
      platform: platform,
      tone: tone,
      length: length
    };
  } catch (error) {
    logger.error('Error generating AI content:', error);
    throw error;
  }
}

function analyzeSentiment(content: string): any {
  try {
    const analyzer = new sentiment();
    const result = analyzer.analyze(content);
    
    return {
      score: result.score,
      comparative: result.comparative,
      positive: result.positive,
      negative: result.negative,
      neutral: result.neutral,
      sentiment: result.score > 0 ? 'positive' : result.score < 0 ? 'negative' : 'neutral'
    };
  } catch (error) {
    logger.error('Error analyzing sentiment:', error);
    throw error;
  }
}

// ============================================
// CRON JOBS
// ============================================

// Process scheduled posts
cron.schedule('*/5 * * * *', async () => {
  logger.info('Processing scheduled social media posts...');
  
  const now = new Date();
  const scheduledPosts = socialMediaPosts.filter(post => 
    post.status === 'scheduled' &&
    post.schedule.scheduledAt &&
    post.schedule.scheduledAt <= now &&
    post.tenantId === 'default' // In production, check all tenants
  );
  
  for (const post of scheduledPosts) {
    try {
      logger.info(`Processing scheduled post: ${post.id}`);
      await publishToSocialMedia(post);
    } catch (error) {
      logger.error(`Error processing scheduled post ${post.id}:`, error);
    }
  }
});

// Process engagement rules
cron.schedule('*/10 * * * *', async () => {
  logger.info('Processing engagement rules...');
  
  const activeRules = engagementRules.filter(rule => 
    rule.isActive && 
    rule.tenantId === 'default' // In production, check all tenants
  );
  
  for (const rule of activeRules) {
    try {
      logger.info(`Processing engagement rule: ${rule.id}`);
      
      // Simulate engagement rule processing
      // In a real implementation, you would monitor social media feeds
      // and execute actions based on triggers
      
      rule.executionCount += 1;
      rule.updatedAt = new Date();
      
      logger.info(`Engagement rule executed: ${rule.id}`);
    } catch (error) {
      logger.error(`Error processing engagement rule ${rule.id}:`, error);
    }
  }
});

// Generate social media analytics metrics daily
cron.schedule('0 3 * * *', async () => {
  logger.info('Generating social media analytics metrics...');
  
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const today = new Date();
  
  const tenantPosts = socialMediaPosts.filter(post => 
    post.tenantId === 'default' && 
    post.createdAt >= yesterday && 
    post.createdAt < today
  );
  
  const tenantLeads = leadGeneration.filter(lead => 
    lead.tenantId === 'default' && 
    lead.createdAt >= yesterday && 
    lead.createdAt < today
  );
  
  const metrics = [
    {
      id: uuidv4(),
      tenantId: 'default',
      accountId: 'all',
      platform: 'all',
      metric: 'posts_created_daily',
      value: tenantPosts.length,
      period: 'daily' as const,
      date: yesterday,
      metadata: { customFields: {} },
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      tenantId: 'default',
      accountId: 'all',
      platform: 'all',
      metric: 'leads_generated_daily',
      value: tenantLeads.length,
      period: 'daily' as const,
      date: yesterday,
      metadata: { customFields: {} },
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      tenantId: 'default',
      accountId: 'all',
      platform: 'all',
      metric: 'total_engagement_daily',
      value: tenantPosts.reduce((sum, p) => sum + p.engagement.likes + p.engagement.shares + p.engagement.comments, 0),
      period: 'daily' as const,
      date: yesterday,
      metadata: { customFields: {} },
      createdAt: new Date()
    }
  ];
  
  socialMediaAnalytics.push(...metrics);
  logger.info(`Generated ${metrics.length} social media analytics metrics`);
});

// Clean up old data weekly
cron.schedule('0 4 * * 0', async () => {
  logger.info('Cleaning up old social media data...');
  
  const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days ago
  
  // Clean up old analytics
  const initialAnalyticsCount = socialMediaAnalytics.length;
  const filteredAnalytics = socialMediaAnalytics.filter(analytics => analytics.createdAt > cutoffDate);
  socialMediaAnalytics.length = 0;
  socialMediaAnalytics.push(...filteredAnalytics);
  
  logger.info(`Cleaned up ${initialAnalyticsCount - socialMediaAnalytics.length} old social media analytics`);
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
const PORT = process.env.PORT || 3019;

const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    // Start server
    server.listen(PORT, () => {
      logger.info(`🚀 Social Media Service running on port ${PORT}`);
      logger.info(`📱 Multi-Platform Management: Active`);
      logger.info(`🤖 AI Content Generation: Active`);
      logger.info(`📊 Engagement Automation: Active`);
      logger.info(`🎯 Lead Generation: Active`);
      logger.info(`📈 Social Media Analytics: Active`);
      logger.info(`⚡ Real-time Socket.IO: Active`);
      logger.info(`⏰ Automated Posting: Active`);
      logger.info(`🔄 Engagement Rules: Active`);
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
