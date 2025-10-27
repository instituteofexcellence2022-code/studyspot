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
  defaultMeta: { service: 'crm-service' },
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
  process.env.DATABASE_URL || 'postgresql://localhost:5432/studyspot_crm',
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

// File upload configuration
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
    files: 10 // Max 10 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/json', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// CRM Models and Interfaces
interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  jobTitle?: string;
  source: 'website' | 'referral' | 'social' | 'email' | 'phone' | 'event' | 'other';
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  score: number;
  tags: string[];
  notes: string;
  assignedTo?: string;
  expectedValue: number;
  probability: number;
  expectedCloseDate?: Date;
  lastContactDate?: Date;
  nextFollowUpDate?: Date;
  customFields: Record<string, any>;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  jobTitle?: string;
  department?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  socialProfiles: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  preferences: {
    communicationMethod: 'email' | 'phone' | 'sms' | 'whatsapp';
    timezone: string;
    language: string;
  };
  tags: string[];
  notes: string;
  lastContactDate?: Date;
  customFields: Record<string, any>;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Opportunity {
  id: string;
  name: string;
  description: string;
  contactId: string;
  leadId?: string;
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  value: number;
  probability: number;
  expectedCloseDate: Date;
  actualCloseDate?: Date;
  source: string;
  assignedTo: string;
  tags: string[];
  notes: string;
  customFields: Record<string, any>;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Interaction {
  id: string;
  type: 'email' | 'phone' | 'meeting' | 'note' | 'task' | 'social' | 'other';
  subject: string;
  description: string;
  contactId?: string;
  leadId?: string;
  opportunityId?: string;
  userId: string;
  scheduledDate?: Date;
  completedDate?: Date;
  duration?: number; // in minutes
  outcome: 'positive' | 'neutral' | 'negative';
  nextAction?: string;
  attachments: string[];
  customFields: Record<string, any>;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Campaign {
  id: string;
  name: string;
  description: string;
  type: 'email' | 'sms' | 'whatsapp' | 'social' | 'phone' | 'mixed';
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled';
  targetAudience: {
    criteria: Record<string, any>;
    count: number;
  };
  content: {
    subject?: string;
    body: string;
    template?: string;
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
    replied: number;
    bounced: number;
    unsubscribed: number;
  };
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Task {
  id: string;
  title: string;
  description: string;
  type: 'call' | 'email' | 'meeting' | 'follow-up' | 'proposal' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  assignedTo: string;
  dueDate: Date;
  completedDate?: Date;
  contactId?: string;
  leadId?: string;
  opportunityId?: string;
  reminderDate?: Date;
  tags: string[];
  customFields: Record<string, any>;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface LeadScore {
  id: string;
  leadId: string;
  score: number;
  factors: {
    factor: string;
    weight: number;
    value: number;
    score: number;
  }[];
  calculatedAt: Date;
  tenantId: string;
}

interface CRMAnalytics {
  id: string;
  type: 'lead' | 'contact' | 'opportunity' | 'campaign' | 'task' | 'interaction';
  metric: string;
  value: number;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  date: Date;
  tenantId: string;
  createdAt: Date;
}

// In-memory storage for demo (replace with database in production)
const leads: Lead[] = [];
const contacts: Contact[] = [];
const opportunities: Opportunity[] = [];
const interactions: Interaction[] = [];
const campaigns: Campaign[] = [];
const tasks: Task[] = [];
const leadScores: LeadScore[] = [];
const crmAnalytics: CRMAnalytics[] = [];

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
const validateLead = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
  body('source').isIn(['website', 'referral', 'social', 'email', 'phone', 'event', 'other']).withMessage('Invalid source'),
  body('status').isIn(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost']).withMessage('Invalid status'),
  body('priority').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('expectedValue').optional().isNumeric().withMessage('Expected value must be a number'),
  body('probability').optional().isInt({ min: 0, max: 100 }).withMessage('Probability must be between 0 and 100')
];

const validateContact = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
  body('preferences.communicationMethod').optional().isIn(['email', 'phone', 'sms', 'whatsapp']).withMessage('Invalid communication method')
];

const validateOpportunity = [
  body('name').notEmpty().withMessage('Opportunity name is required'),
  body('contactId').isUUID().withMessage('Valid contact ID is required'),
  body('stage').isIn(['prospecting', 'qualification', 'proposal', 'negotiation', 'closed-won', 'closed-lost']).withMessage('Invalid stage'),
  body('value').isNumeric().withMessage('Value must be a number'),
  body('probability').isInt({ min: 0, max: 100 }).withMessage('Probability must be between 0 and 100'),
  body('expectedCloseDate').isISO8601().withMessage('Valid expected close date is required')
];

const validateCampaign = [
  body('name').notEmpty().withMessage('Campaign name is required'),
  body('type').isIn(['email', 'sms', 'whatsapp', 'social', 'phone', 'mixed']).withMessage('Invalid campaign type'),
  body('status').isIn(['draft', 'scheduled', 'running', 'paused', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('content.body').notEmpty().withMessage('Campaign content is required'),
  body('schedule.startDate').isISO8601().withMessage('Valid start date is required')
];

const validateTask = [
  body('title').notEmpty().withMessage('Task title is required'),
  body('type').isIn(['call', 'email', 'meeting', 'follow-up', 'proposal', 'other']).withMessage('Invalid task type'),
  body('priority').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('status').isIn(['pending', 'in-progress', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('assignedTo').notEmpty().withMessage('Assigned to is required'),
  body('dueDate').isISO8601().withMessage('Valid due date is required')
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

// Create Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(rateLimitConfig);
app.use(speedLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'CRM Service is healthy',
    timestamp: new Date().toISOString(),
    leads: leads.length,
    contacts: contacts.length,
    opportunities: opportunities.length,
    campaigns: campaigns.length,
    tasks: tasks.length,
    interactions: interactions.length
  });
});

// ============================================
// LEAD MANAGEMENT ROUTES
// ============================================

/**
 * @route   POST /api/crm/leads
 * @desc    Create a new lead
 * @access  Private
 */
app.post('/api/crm/leads', authenticateToken, validateLead, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const lead: Lead = {
      id: uuidv4(),
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone || '',
      company: req.body.company,
      jobTitle: req.body.jobTitle,
      source: req.body.source,
      status: req.body.status || 'new',
      priority: req.body.priority || 'medium',
      score: 0,
      tags: req.body.tags || [],
      notes: req.body.notes || '',
      assignedTo: req.body.assignedTo,
      expectedValue: req.body.expectedValue || 0,
      probability: req.body.probability || 0,
      expectedCloseDate: req.body.expectedCloseDate ? new Date(req.body.expectedCloseDate) : undefined,
      lastContactDate: req.body.lastContactDate ? new Date(req.body.lastContactDate) : undefined,
      nextFollowUpDate: req.body.nextFollowUpDate ? new Date(req.body.nextFollowUpDate) : undefined,
      customFields: req.body.customFields || {},
      tenantId: req.user.tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    leads.push(lead);

    // Calculate lead score
    await calculateLeadScore(lead);

    logger.info(`Lead created: ${lead.id}`);
    
    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: { lead }
    });
  } catch (error) {
    logger.error('Error creating lead:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create lead'
    });
  }
});

/**
 * @route   GET /api/crm/leads
 * @desc    Get all leads for a tenant
 * @access  Private
 */
app.get('/api/crm/leads', authenticateToken, async (req, res) => {
  try {
    const { status, priority, source, assignedTo, limit = 50, offset = 0 } = req.query;
    
    let tenantLeads = leads.filter(lead => lead.tenantId === req.user.tenantId);
    
    // Apply filters
    if (status) {
      tenantLeads = tenantLeads.filter(lead => lead.status === status);
    }
    if (priority) {
      tenantLeads = tenantLeads.filter(lead => lead.priority === priority);
    }
    if (source) {
      tenantLeads = tenantLeads.filter(lead => lead.source === source);
    }
    if (assignedTo) {
      tenantLeads = tenantLeads.filter(lead => lead.assignedTo === assignedTo);
    }
    
    // Sort by score (highest first) and creation date
    tenantLeads = tenantLeads
      .sort((a, b) => {
        if (a.score !== b.score) return b.score - a.score;
        return b.createdAt.getTime() - a.createdAt.getTime();
      })
      .slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));
    
    res.json({
      success: true,
      data: { leads: tenantLeads },
      count: tenantLeads.length,
      total: leads.filter(lead => lead.tenantId === req.user.tenantId).length
    });
  } catch (error) {
    logger.error('Error fetching leads:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leads'
    });
  }
});

/**
 * @route   PUT /api/crm/leads/:id
 * @desc    Update a lead
 * @access  Private
 */
app.put('/api/crm/leads/:id', authenticateToken, validateLead, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const leadIndex = leads.findIndex(
      lead => lead.id === req.params.id && lead.tenantId === req.user.tenantId
    );
    
    if (leadIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    const updatedLead: Lead = {
      ...leads[leadIndex],
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone || leads[leadIndex].phone,
      company: req.body.company,
      jobTitle: req.body.jobTitle,
      source: req.body.source,
      status: req.body.status,
      priority: req.body.priority,
      tags: req.body.tags || leads[leadIndex].tags,
      notes: req.body.notes || leads[leadIndex].notes,
      assignedTo: req.body.assignedTo,
      expectedValue: req.body.expectedValue || leads[leadIndex].expectedValue,
      probability: req.body.probability || leads[leadIndex].probability,
      expectedCloseDate: req.body.expectedCloseDate ? new Date(req.body.expectedCloseDate) : leads[leadIndex].expectedCloseDate,
      lastContactDate: req.body.lastContactDate ? new Date(req.body.lastContactDate) : leads[leadIndex].lastContactDate,
      nextFollowUpDate: req.body.nextFollowUpDate ? new Date(req.body.nextFollowUpDate) : leads[leadIndex].nextFollowUpDate,
      customFields: req.body.customFields || leads[leadIndex].customFields,
      updatedAt: new Date()
    };

    leads[leadIndex] = updatedLead;

    // Recalculate lead score
    await calculateLeadScore(updatedLead);

    logger.info(`Lead updated: ${updatedLead.id}`);
    
    res.json({
      success: true,
      message: 'Lead updated successfully',
      data: { lead: updatedLead }
    });
  } catch (error) {
    logger.error('Error updating lead:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update lead'
    });
  }
});

/**
 * @route   DELETE /api/crm/leads/:id
 * @desc    Delete a lead
 * @access  Private
 */
app.delete('/api/crm/leads/:id', authenticateToken, async (req, res) => {
  try {
    const leadIndex = leads.findIndex(
      lead => lead.id === req.params.id && lead.tenantId === req.user.tenantId
    );
    
    if (leadIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    const deletedLead = leads.splice(leadIndex, 1)[0];

    logger.info(`Lead deleted: ${deletedLead.id}`);
    
    res.json({
      success: true,
      message: 'Lead deleted successfully',
      data: { id: deletedLead.id }
    });
  } catch (error) {
    logger.error('Error deleting lead:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete lead'
    });
  }
});

// ============================================
// CONTACT MANAGEMENT ROUTES
// ============================================

/**
 * @route   POST /api/crm/contacts
 * @desc    Create a new contact
 * @access  Private
 */
app.post('/api/crm/contacts', authenticateToken, validateContact, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const contact: Contact = {
      id: uuidv4(),
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone || '',
      company: req.body.company,
      jobTitle: req.body.jobTitle,
      department: req.body.department,
      address: req.body.address,
      socialProfiles: req.body.socialProfiles || {},
      preferences: req.body.preferences || {
        communicationMethod: 'email',
        timezone: 'UTC',
        language: 'en'
      },
      tags: req.body.tags || [],
      notes: req.body.notes || '',
      lastContactDate: req.body.lastContactDate ? new Date(req.body.lastContactDate) : undefined,
      customFields: req.body.customFields || {},
      tenantId: req.user.tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    contacts.push(contact);

    logger.info(`Contact created: ${contact.id}`);
    
    res.status(201).json({
      success: true,
      message: 'Contact created successfully',
      data: { contact }
    });
  } catch (error) {
    logger.error('Error creating contact:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create contact'
    });
  }
});

/**
 * @route   GET /api/crm/contacts
 * @desc    Get all contacts for a tenant
 * @access  Private
 */
app.get('/api/crm/contacts', authenticateToken, async (req, res) => {
  try {
    const { company, department, limit = 50, offset = 0 } = req.query;
    
    let tenantContacts = contacts.filter(contact => contact.tenantId === req.user.tenantId);
    
    // Apply filters
    if (company) {
      tenantContacts = tenantContacts.filter(contact => contact.company === company);
    }
    if (department) {
      tenantContacts = tenantContacts.filter(contact => contact.department === department);
    }
    
    // Sort by last contact date and creation date
    tenantContacts = tenantContacts
      .sort((a, b) => {
        if (a.lastContactDate && b.lastContactDate) {
          return b.lastContactDate.getTime() - a.lastContactDate.getTime();
        }
        return b.createdAt.getTime() - a.createdAt.getTime();
      })
      .slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));
    
    res.json({
      success: true,
      data: { contacts: tenantContacts },
      count: tenantContacts.length,
      total: contacts.filter(contact => contact.tenantId === req.user.tenantId).length
    });
  } catch (error) {
    logger.error('Error fetching contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contacts'
    });
  }
});

// ============================================
// OPPORTUNITY MANAGEMENT ROUTES
// ============================================

/**
 * @route   POST /api/crm/opportunities
 * @desc    Create a new opportunity
 * @access  Private
 */
app.post('/api/crm/opportunities', authenticateToken, validateOpportunity, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const opportunity: Opportunity = {
      id: uuidv4(),
      name: req.body.name,
      description: req.body.description || '',
      contactId: req.body.contactId,
      leadId: req.body.leadId,
      stage: req.body.stage,
      value: req.body.value,
      probability: req.body.probability,
      expectedCloseDate: new Date(req.body.expectedCloseDate),
      actualCloseDate: req.body.actualCloseDate ? new Date(req.body.actualCloseDate) : undefined,
      source: req.body.source || '',
      assignedTo: req.body.assignedTo,
      tags: req.body.tags || [],
      notes: req.body.notes || '',
      customFields: req.body.customFields || {},
      tenantId: req.user.tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    opportunities.push(opportunity);

    logger.info(`Opportunity created: ${opportunity.id}`);
    
    res.status(201).json({
      success: true,
      message: 'Opportunity created successfully',
      data: { opportunity }
    });
  } catch (error) {
    logger.error('Error creating opportunity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create opportunity'
    });
  }
});

/**
 * @route   GET /api/crm/opportunities
 * @desc    Get all opportunities for a tenant
 * @access  Private
 */
app.get('/api/crm/opportunities', authenticateToken, async (req, res) => {
  try {
    const { stage, assignedTo, limit = 50, offset = 0 } = req.query;
    
    let tenantOpportunities = opportunities.filter(opportunity => opportunity.tenantId === req.user.tenantId);
    
    // Apply filters
    if (stage) {
      tenantOpportunities = tenantOpportunities.filter(opportunity => opportunity.stage === stage);
    }
    if (assignedTo) {
      tenantOpportunities = tenantOpportunities.filter(opportunity => opportunity.assignedTo === assignedTo);
    }
    
    // Sort by expected close date and value
    tenantOpportunities = tenantOpportunities
      .sort((a, b) => {
        if (a.expectedCloseDate.getTime() !== b.expectedCloseDate.getTime()) {
          return a.expectedCloseDate.getTime() - b.expectedCloseDate.getTime();
        }
        return b.value - a.value;
      })
      .slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));
    
    res.json({
      success: true,
      data: { opportunities: tenantOpportunities },
      count: tenantOpportunities.length,
      total: opportunities.filter(opportunity => opportunity.tenantId === req.user.tenantId).length
    });
  } catch (error) {
    logger.error('Error fetching opportunities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch opportunities'
    });
  }
});

// ============================================
// CAMPAIGN MANAGEMENT ROUTES
// ============================================

/**
 * @route   POST /api/crm/campaigns
 * @desc    Create a new campaign
 * @access  Private
 */
app.post('/api/crm/campaigns', authenticateToken, validateCampaign, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const campaign: Campaign = {
      id: uuidv4(),
      name: req.body.name,
      description: req.body.description || '',
      type: req.body.type,
      status: req.body.status || 'draft',
      targetAudience: req.body.targetAudience || { criteria: {}, count: 0 },
      content: req.body.content,
      schedule: req.body.schedule,
      metrics: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        replied: 0,
        bounced: 0,
        unsubscribed: 0
      },
      tenantId: req.user.tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    campaigns.push(campaign);

    logger.info(`Campaign created: ${campaign.id}`);
    
    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      data: { campaign }
    });
  } catch (error) {
    logger.error('Error creating campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create campaign'
    });
  }
});

/**
 * @route   POST /api/crm/campaigns/:id/execute
 * @desc    Execute a campaign
 * @access  Private
 */
app.post('/api/crm/campaigns/:id/execute', authenticateToken, async (req, res) => {
  try {
    const campaign = campaigns.find(
      c => c.id === req.params.id && c.tenantId === req.user.tenantId
    );
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'Campaign cannot be executed in current status'
      });
    }

    // Execute campaign based on type
    const result = await executeCampaign(campaign);
    
    // Update campaign status
    const campaignIndex = campaigns.findIndex(c => c.id === campaign.id);
    if (campaignIndex !== -1) {
      campaigns[campaignIndex] = {
        ...campaigns[campaignIndex],
        status: 'running',
        updatedAt: new Date()
      };
    }

    logger.info(`Campaign executed: ${campaign.id}`);
    
    res.json({
      success: true,
      message: 'Campaign executed successfully',
      data: { campaign: campaigns[campaignIndex], result }
    });
  } catch (error) {
    logger.error('Error executing campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute campaign',
      error: error.message
    });
  }
});

// ============================================
// TASK MANAGEMENT ROUTES
// ============================================

/**
 * @route   POST /api/crm/tasks
 * @desc    Create a new task
 * @access  Private
 */
app.post('/api/crm/tasks', authenticateToken, validateTask, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const task: Task = {
      id: uuidv4(),
      title: req.body.title,
      description: req.body.description || '',
      type: req.body.type,
      priority: req.body.priority,
      status: req.body.status || 'pending',
      assignedTo: req.body.assignedTo,
      dueDate: new Date(req.body.dueDate),
      completedDate: req.body.completedDate ? new Date(req.body.completedDate) : undefined,
      contactId: req.body.contactId,
      leadId: req.body.leadId,
      opportunityId: req.body.opportunityId,
      reminderDate: req.body.reminderDate ? new Date(req.body.reminderDate) : undefined,
      tags: req.body.tags || [],
      customFields: req.body.customFields || {},
      tenantId: req.user.tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    tasks.push(task);

    logger.info(`Task created: ${task.id}`);
    
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task }
    });
  } catch (error) {
    logger.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create task'
    });
  }
});

/**
 * @route   GET /api/crm/tasks
 * @desc    Get all tasks for a tenant
 * @access  Private
 */
app.get('/api/crm/tasks', authenticateToken, async (req, res) => {
  try {
    const { status, priority, assignedTo, limit = 50, offset = 0 } = req.query;
    
    let tenantTasks = tasks.filter(task => task.tenantId === req.user.tenantId);
    
    // Apply filters
    if (status) {
      tenantTasks = tenantTasks.filter(task => task.status === status);
    }
    if (priority) {
      tenantTasks = tenantTasks.filter(task => task.priority === priority);
    }
    if (assignedTo) {
      tenantTasks = tenantTasks.filter(task => task.assignedTo === assignedTo);
    }
    
    // Sort by due date and priority
    tenantTasks = tenantTasks
      .sort((a, b) => {
        if (a.dueDate.getTime() !== b.dueDate.getTime()) {
          return a.dueDate.getTime() - b.dueDate.getTime();
        }
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));
    
    res.json({
      success: true,
      data: { tasks: tenantTasks },
      count: tenantTasks.length,
      total: tasks.filter(task => task.tenantId === req.user.tenantId).length
    });
  } catch (error) {
    logger.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks'
    });
  }
});

// ============================================
// INTERACTION MANAGEMENT ROUTES
// ============================================

/**
 * @route   POST /api/crm/interactions
 * @desc    Create a new interaction
 * @access  Private
 */
app.post('/api/crm/interactions', authenticateToken, async (req, res) => {
  try {
    const interaction: Interaction = {
      id: uuidv4(),
      type: req.body.type,
      subject: req.body.subject,
      description: req.body.description,
      contactId: req.body.contactId,
      leadId: req.body.leadId,
      opportunityId: req.body.opportunityId,
      userId: req.user.id,
      scheduledDate: req.body.scheduledDate ? new Date(req.body.scheduledDate) : undefined,
      completedDate: req.body.completedDate ? new Date(req.body.completedDate) : undefined,
      duration: req.body.duration,
      outcome: req.body.outcome || 'neutral',
      nextAction: req.body.nextAction,
      attachments: req.body.attachments || [],
      customFields: req.body.customFields || {},
      tenantId: req.user.tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    interactions.push(interaction);

    logger.info(`Interaction created: ${interaction.id}`);
    
    res.status(201).json({
      success: true,
      message: 'Interaction created successfully',
      data: { interaction }
    });
  } catch (error) {
    logger.error('Error creating interaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create interaction'
    });
  }
});

// ============================================
// LEAD SCORING ROUTES
// ============================================

/**
 * @route   GET /api/crm/leads/:id/score
 * @desc    Get lead score
 * @access  Private
 */
app.get('/api/crm/leads/:id/score', authenticateToken, async (req, res) => {
  try {
    const lead = leads.find(
      l => l.id === req.params.id && l.tenantId === req.user.tenantId
    );
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    const leadScore = leadScores.find(
      ls => ls.leadId === lead.id && ls.tenantId === req.user.tenantId
    );
    
    if (!leadScore) {
      // Calculate score if not exists
      await calculateLeadScore(lead);
      const newScore = leadScores.find(
        ls => ls.leadId === lead.id && ls.tenantId === req.user.tenantId
      );
      return res.json({
        success: true,
        data: { leadScore: newScore }
      });
    }
    
    res.json({
      success: true,
      data: { leadScore }
    });
  } catch (error) {
    logger.error('Error fetching lead score:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lead score'
    });
  }
});

// ============================================
// CRM ANALYTICS ROUTES
// ============================================

/**
 * @route   GET /api/crm/analytics/dashboard
 * @desc    Get CRM analytics dashboard
 * @access  Private
 */
app.get('/api/crm/analytics/dashboard', authenticateToken, async (req, res) => {
  try {
    const tenantLeads = leads.filter(lead => lead.tenantId === req.user.tenantId);
    const tenantContacts = contacts.filter(contact => contact.tenantId === req.user.tenantId);
    const tenantOpportunities = opportunities.filter(opportunity => opportunity.tenantId === req.user.tenantId);
    const tenantCampaigns = campaigns.filter(campaign => campaign.tenantId === req.user.tenantId);
    const tenantTasks = tasks.filter(task => task.tenantId === req.user.tenantId);
    const tenantInteractions = interactions.filter(interaction => interaction.tenantId === req.user.tenantId);

    // Lead analytics
    const leadStats = {
      total: tenantLeads.length,
      new: tenantLeads.filter(lead => lead.status === 'new').length,
      contacted: tenantLeads.filter(lead => lead.status === 'contacted').length,
      qualified: tenantLeads.filter(lead => lead.status === 'qualified').length,
      proposal: tenantLeads.filter(lead => lead.status === 'proposal').length,
      negotiation: tenantLeads.filter(lead => lead.status === 'negotiation').length,
      closedWon: tenantLeads.filter(lead => lead.status === 'closed-won').length,
      closedLost: tenantLeads.filter(lead => lead.status === 'closed-lost').length,
      bySource: {
        website: tenantLeads.filter(lead => lead.source === 'website').length,
        referral: tenantLeads.filter(lead => lead.source === 'referral').length,
        social: tenantLeads.filter(lead => lead.source === 'social').length,
        email: tenantLeads.filter(lead => lead.source === 'email').length,
        phone: tenantLeads.filter(lead => lead.source === 'phone').length,
        event: tenantLeads.filter(lead => lead.source === 'event').length,
        other: tenantLeads.filter(lead => lead.source === 'other').length
      },
      byPriority: {
        low: tenantLeads.filter(lead => lead.priority === 'low').length,
        medium: tenantLeads.filter(lead => lead.priority === 'medium').length,
        high: tenantLeads.filter(lead => lead.priority === 'high').length,
        urgent: tenantLeads.filter(lead => lead.priority === 'urgent').length
      },
      averageScore: tenantLeads.reduce((sum, lead) => sum + lead.score, 0) / tenantLeads.length || 0,
      totalValue: tenantLeads.reduce((sum, lead) => sum + lead.expectedValue, 0)
    };

    // Contact analytics
    const contactStats = {
      total: tenantContacts.length,
      byCompany: _.groupBy(tenantContacts, 'company'),
      byDepartment: _.groupBy(tenantContacts, 'department'),
      byCommunicationMethod: _.groupBy(tenantContacts, 'preferences.communicationMethod'),
      recentContacts: tenantContacts.filter(contact => 
        contact.lastContactDate && 
        moment().diff(contact.lastContactDate, 'days') <= 30
      ).length
    };

    // Opportunity analytics
    const opportunityStats = {
      total: tenantOpportunities.length,
      byStage: {
        prospecting: tenantOpportunities.filter(opp => opp.stage === 'prospecting').length,
        qualification: tenantOpportunities.filter(opp => opp.stage === 'qualification').length,
        proposal: tenantOpportunities.filter(opp => opp.stage === 'proposal').length,
        negotiation: tenantOpportunities.filter(opp => opp.stage === 'negotiation').length,
        closedWon: tenantOpportunities.filter(opp => opp.stage === 'closed-won').length,
        closedLost: tenantOpportunities.filter(opp => opp.stage === 'closed-lost').length
      },
      totalValue: tenantOpportunities.reduce((sum, opp) => sum + opp.value, 0),
      weightedValue: tenantOpportunities.reduce((sum, opp) => sum + (opp.value * opp.probability / 100), 0),
      averageValue: tenantOpportunities.reduce((sum, opp) => sum + opp.value, 0) / tenantOpportunities.length || 0,
      averageProbability: tenantOpportunities.reduce((sum, opp) => sum + opp.probability, 0) / tenantOpportunities.length || 0
    };

    // Campaign analytics
    const campaignStats = {
      total: tenantCampaigns.length,
      byStatus: {
        draft: tenantCampaigns.filter(campaign => campaign.status === 'draft').length,
        scheduled: tenantCampaigns.filter(campaign => campaign.status === 'scheduled').length,
        running: tenantCampaigns.filter(campaign => campaign.status === 'running').length,
        paused: tenantCampaigns.filter(campaign => campaign.status === 'paused').length,
        completed: tenantCampaigns.filter(campaign => campaign.status === 'completed').length,
        cancelled: tenantCampaigns.filter(campaign => campaign.status === 'cancelled').length
      },
      byType: {
        email: tenantCampaigns.filter(campaign => campaign.type === 'email').length,
        sms: tenantCampaigns.filter(campaign => campaign.type === 'sms').length,
        whatsapp: tenantCampaigns.filter(campaign => campaign.type === 'whatsapp').length,
        social: tenantCampaigns.filter(campaign => campaign.type === 'social').length,
        phone: tenantCampaigns.filter(campaign => campaign.type === 'phone').length,
        mixed: tenantCampaigns.filter(campaign => campaign.type === 'mixed').length
      },
      totalSent: tenantCampaigns.reduce((sum, campaign) => sum + campaign.metrics.sent, 0),
      totalDelivered: tenantCampaigns.reduce((sum, campaign) => sum + campaign.metrics.delivered, 0),
      totalOpened: tenantCampaigns.reduce((sum, campaign) => sum + campaign.metrics.opened, 0),
      totalClicked: tenantCampaigns.reduce((sum, campaign) => sum + campaign.metrics.clicked, 0),
      totalReplied: tenantCampaigns.reduce((sum, campaign) => sum + campaign.metrics.replied, 0)
    };

    // Task analytics
    const taskStats = {
      total: tenantTasks.length,
      byStatus: {
        pending: tenantTasks.filter(task => task.status === 'pending').length,
        inProgress: tenantTasks.filter(task => task.status === 'in-progress').length,
        completed: tenantTasks.filter(task => task.status === 'completed').length,
        cancelled: tenantTasks.filter(task => task.status === 'cancelled').length
      },
      byPriority: {
        low: tenantTasks.filter(task => task.priority === 'low').length,
        medium: tenantTasks.filter(task => task.priority === 'medium').length,
        high: tenantTasks.filter(task => task.priority === 'high').length,
        urgent: tenantTasks.filter(task => task.priority === 'urgent').length
      },
      overdue: tenantTasks.filter(task => 
        task.status !== 'completed' && 
        task.dueDate < new Date()
      ).length,
      dueToday: tenantTasks.filter(task => 
        task.status !== 'completed' && 
        moment(task.dueDate).isSame(moment(), 'day')
      ).length
    };

    // Interaction analytics
    const interactionStats = {
      total: tenantInteractions.length,
      byType: {
        email: tenantInteractions.filter(interaction => interaction.type === 'email').length,
        phone: tenantInteractions.filter(interaction => interaction.type === 'phone').length,
        meeting: tenantInteractions.filter(interaction => interaction.type === 'meeting').length,
        note: tenantInteractions.filter(interaction => interaction.type === 'note').length,
        task: tenantInteractions.filter(interaction => interaction.type === 'task').length,
        social: tenantInteractions.filter(interaction => interaction.type === 'social').length,
        other: interactionInteractions.filter(interaction => interaction.type === 'other').length
      },
      byOutcome: {
        positive: tenantInteractions.filter(interaction => interaction.outcome === 'positive').length,
        neutral: tenantInteractions.filter(interaction => interaction.outcome === 'neutral').length,
        negative: tenantInteractions.filter(interaction => interaction.outcome === 'negative').length
      },
      recentInteractions: tenantInteractions.filter(interaction => 
        moment().diff(interaction.createdAt, 'days') <= 30
      ).length
    };

    res.json({
      success: true,
      data: {
        leads: leadStats,
        contacts: contactStats,
        opportunities: opportunityStats,
        campaigns: campaignStats,
        tasks: taskStats,
        interactions: interactionStats,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error fetching CRM analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch CRM analytics'
    });
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

async function calculateLeadScore(lead: Lead): Promise<void> {
  try {
    const factors = [
      {
        factor: 'Email Domain',
        weight: 20,
        value: lead.email.includes('@gmail.com') || lead.email.includes('@yahoo.com') ? 0.5 : 1.0,
        score: 0
      },
      {
        factor: 'Company Size',
        weight: 15,
        value: lead.company ? 1.0 : 0.3,
        score: 0
      },
      {
        factor: 'Job Title',
        weight: 15,
        value: lead.jobTitle ? 1.0 : 0.5,
        score: 0
      },
      {
        factor: 'Source Quality',
        weight: 25,
        value: lead.source === 'referral' ? 1.0 : lead.source === 'website' ? 0.8 : 0.6,
        score: 0
      },
      {
        factor: 'Contact Information',
        weight: 15,
        value: lead.phone ? 1.0 : 0.7,
        score: 0
      },
      {
        factor: 'Engagement',
        weight: 10,
        value: lead.lastContactDate ? 1.0 : 0.5,
        score: 0
      }
    ];

    // Calculate scores
    factors.forEach(factor => {
      factor.score = factor.value * factor.weight;
    });

    const totalScore = factors.reduce((sum, factor) => sum + factor.score, 0);

    // Update lead score
    const leadIndex = leads.findIndex(l => l.id === lead.id);
    if (leadIndex !== -1) {
      leads[leadIndex].score = Math.round(totalScore);
    }

    // Store lead score
    const existingScoreIndex = leadScores.findIndex(ls => ls.leadId === lead.id);
    const leadScore: LeadScore = {
      id: uuidv4(),
      leadId: lead.id,
      score: Math.round(totalScore),
      factors,
      calculatedAt: new Date(),
      tenantId: lead.tenantId
    };

    if (existingScoreIndex !== -1) {
      leadScores[existingScoreIndex] = leadScore;
    } else {
      leadScores.push(leadScore);
    }

    logger.info(`Lead score calculated: ${lead.id} - ${Math.round(totalScore)}`);
  } catch (error) {
    logger.error('Error calculating lead score:', error);
  }
}

async function executeCampaign(campaign: Campaign): Promise<any> {
  try {
    let result = {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      replied: 0,
      bounced: 0,
      unsubscribed: 0
    };

    switch (campaign.type) {
      case 'email':
        result = await executeEmailCampaign(campaign);
        break;
      case 'sms':
        result = await executeSMSCampaign(campaign);
        break;
      case 'whatsapp':
        result = await executeWhatsAppCampaign(campaign);
        break;
      case 'phone':
        result = await executePhoneCampaign(campaign);
        break;
      case 'mixed':
        result = await executeMixedCampaign(campaign);
        break;
      default:
        throw new Error(`Unsupported campaign type: ${campaign.type}`);
    }

    // Update campaign metrics
    const campaignIndex = campaigns.findIndex(c => c.id === campaign.id);
    if (campaignIndex !== -1) {
      campaigns[campaignIndex].metrics = {
        ...campaigns[campaignIndex].metrics,
        ...result
      };
    }

    return result;
  } catch (error) {
    logger.error('Error executing campaign:', error);
    throw error;
  }
}

async function executeEmailCampaign(campaign: Campaign): Promise<any> {
  // Simulate email campaign execution
  const targetCount = campaign.targetAudience.count;
  const sent = Math.floor(targetCount * 0.95);
  const delivered = Math.floor(sent * 0.98);
  const opened = Math.floor(delivered * 0.25);
  const clicked = Math.floor(opened * 0.15);
  const replied = Math.floor(clicked * 0.05);
  const bounced = Math.floor(sent * 0.02);
  const unsubscribed = Math.floor(delivered * 0.01);

  return {
    sent,
    delivered,
    opened,
    clicked,
    replied,
    bounced,
    unsubscribed
  };
}

async function executeSMSCampaign(campaign: Campaign): Promise<any> {
  // Simulate SMS campaign execution
  const targetCount = campaign.targetAudience.count;
  const sent = Math.floor(targetCount * 0.98);
  const delivered = Math.floor(sent * 0.99);
  const opened = Math.floor(delivered * 0.90);
  const clicked = Math.floor(opened * 0.20);
  const replied = Math.floor(clicked * 0.10);
  const bounced = Math.floor(sent * 0.01);
  const unsubscribed = Math.floor(delivered * 0.02);

  return {
    sent,
    delivered,
    opened,
    clicked,
    replied,
    bounced,
    unsubscribed
  };
}

async function executeWhatsAppCampaign(campaign: Campaign): Promise<any> {
  // Simulate WhatsApp campaign execution
  const targetCount = campaign.targetAudience.count;
  const sent = Math.floor(targetCount * 0.99);
  const delivered = Math.floor(sent * 0.99);
  const opened = Math.floor(delivered * 0.95);
  const clicked = Math.floor(opened * 0.30);
  const replied = Math.floor(clicked * 0.15);
  const bounced = Math.floor(sent * 0.01);
  const unsubscribed = Math.floor(delivered * 0.01);

  return {
    sent,
    delivered,
    opened,
    clicked,
    replied,
    bounced,
    unsubscribed
  };
}

async function executePhoneCampaign(campaign: Campaign): Promise<any> {
  // Simulate phone campaign execution
  const targetCount = campaign.targetAudience.count;
  const sent = Math.floor(targetCount * 0.80);
  const delivered = Math.floor(sent * 0.70);
  const opened = Math.floor(delivered * 0.60);
  const clicked = Math.floor(opened * 0.40);
  const replied = Math.floor(clicked * 0.20);
  const bounced = Math.floor(sent * 0.30);
  const unsubscribed = Math.floor(delivered * 0.05);

  return {
    sent,
    delivered,
    opened,
    clicked,
    replied,
    bounced,
    unsubscribed
  };
}

async function executeMixedCampaign(campaign: Campaign): Promise<any> {
  // Simulate mixed campaign execution
  const targetCount = campaign.targetAudience.count;
  const sent = Math.floor(targetCount * 0.90);
  const delivered = Math.floor(sent * 0.95);
  const opened = Math.floor(delivered * 0.40);
  const clicked = Math.floor(opened * 0.25);
  const replied = Math.floor(clicked * 0.10);
  const bounced = Math.floor(sent * 0.05);
  const unsubscribed = Math.floor(delivered * 0.02);

  return {
    sent,
    delivered,
    opened,
    clicked,
    replied,
    bounced,
    unsubscribed
  };
}

// ============================================
// CRON JOBS
// ============================================

// Calculate lead scores daily
cron.schedule('0 2 * * *', async () => {
  logger.info('Calculating lead scores...');
  
  const tenantLeads = leads.filter(lead => lead.tenantId === 'default');
  
  for (const lead of tenantLeads) {
    await calculateLeadScore(lead);
  }
  
  logger.info(`Calculated scores for ${tenantLeads.length} leads`);
});

// Generate CRM analytics daily
cron.schedule('0 3 * * *', async () => {
  logger.info('Generating CRM analytics...');
  
  const analytics = [
    {
      id: uuidv4(),
      type: 'lead' as const,
      metric: 'total_leads',
      value: leads.filter(lead => lead.tenantId === 'default').length,
      period: 'daily' as const,
      date: new Date(),
      tenantId: 'default',
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      type: 'contact' as const,
      metric: 'total_contacts',
      value: contacts.filter(contact => contact.tenantId === 'default').length,
      period: 'daily' as const,
      date: new Date(),
      tenantId: 'default',
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      type: 'opportunity' as const,
      metric: 'total_opportunities',
      value: opportunities.filter(opportunity => opportunity.tenantId === 'default').length,
      period: 'daily' as const,
      date: new Date(),
      tenantId: 'default',
      createdAt: new Date()
    }
  ];

  crmAnalytics.push(...analytics);
  logger.info(`Generated ${analytics.length} CRM analytics`);
});

// Clean up old data weekly
cron.schedule('0 4 * * 0', async () => {
  logger.info('Cleaning up old CRM data...');
  
  const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days ago
  
  // Clean up old interactions
  const initialInteractionsCount = interactions.length;
  const filteredInteractions = interactions.filter(interaction => interaction.createdAt > cutoffDate);
  interactions.length = 0;
  interactions.push(...filteredInteractions);
  
  // Clean up old analytics
  const initialAnalyticsCount = crmAnalytics.length;
  const filteredAnalytics = crmAnalytics.filter(analytics => analytics.createdAt > cutoffDate);
  crmAnalytics.length = 0;
  crmAnalytics.push(...filteredAnalytics);
  
  logger.info(`Cleaned up ${initialInteractionsCount - interactions.length} old interactions`);
  logger.info(`Cleaned up ${initialAnalyticsCount - crmAnalytics.length} old analytics`);
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
const PORT = process.env.PORT || 3005;

const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 CRM Service running on port ${PORT}`);
      logger.info(`👥 Lead Management: Active`);
      logger.info(`📞 Contact Management: Active`);
      logger.info(`💼 Opportunity Management: Active`);
      logger.info(`📧 Campaign Management: Active`);
      logger.info(`✅ Task Management: Active`);
      logger.info(`📝 Interaction Tracking: Active`);
      logger.info(`📊 Lead Scoring: Active`);
      logger.info(`📈 CRM Analytics: Active`);
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
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await sequelize.close();
  process.exit(0);
});

// Start the server
startServer();

export default app;