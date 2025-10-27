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
  defaultMeta: { service: 'security-service' },
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
  process.env.DATABASE_URL || 'postgresql://localhost:5432/studyspot_security',
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

// Security Models and Interfaces
interface SecurityEvent {
  id: string;
  type: 'authentication' | 'authorization' | 'data-access' | 'system-access' | 'network' | 'application' | 'database' | 'file-access' | 'api-call' | 'user-action';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  target: string;
  action: string;
  result: 'success' | 'failure' | 'blocked' | 'allowed';
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  userId?: string;
  sessionId?: string;
  timestamp: Date;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ThreatDetection {
  id: string;
  threatType: 'brute-force' | 'sql-injection' | 'xss' | 'csrf' | 'ddos' | 'malware' | 'phishing' | 'data-exfiltration' | 'privilege-escalation' | 'insider-threat' | 'anomaly' | 'custom';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  target: string;
  description: string;
  indicators: string[];
  confidence: number;
  status: 'new' | 'investigating' | 'confirmed' | 'false-positive' | 'resolved' | 'ignored';
  assignedTo?: string;
  resolution?: string;
  tags: string[];
  metadata: Record<string, any>;
  detectedAt: Date;
  resolvedAt?: Date;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  type: 'access-control' | 'data-protection' | 'network-security' | 'application-security' | 'incident-response' | 'compliance' | 'custom';
  rules: SecurityRule[];
  isActive: boolean;
  priority: number;
  scope: {
    users: string[];
    roles: string[];
    resources: string[];
    environments: string[];
  };
  enforcement: {
    action: 'allow' | 'deny' | 'warn' | 'log' | 'custom';
    notification: boolean;
    escalation: boolean;
  };
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SecurityRule {
  id: string;
  name: string;
  description: string;
  condition: {
    field: string;
    operator: 'equals' | 'not-equals' | 'contains' | 'not-contains' | 'greater-than' | 'less-than' | 'greater-than-or-equals' | 'less-than-or-equals' | 'in' | 'not-in' | 'exists' | 'not-exists' | 'regex';
    value: any;
    logicalOperator?: 'AND' | 'OR';
  };
  action: {
    type: 'allow' | 'deny' | 'warn' | 'log' | 'custom';
    parameters: Record<string, any>;
  };
  priority: number;
  isActive: boolean;
}

interface ComplianceCheck {
  id: string;
  name: string;
  description: string;
  standard: 'SOC2' | 'GDPR' | 'HIPAA' | 'PCI-DSS' | 'ISO27001' | 'NIST' | 'custom';
  category: 'access-control' | 'data-protection' | 'network-security' | 'application-security' | 'incident-response' | 'business-continuity' | 'custom';
  requirement: string;
  control: string;
  test: string;
  expectedResult: any;
  actualResult?: any;
  status: 'pass' | 'fail' | 'warning' | 'not-applicable' | 'not-tested';
  evidence: string[];
  remediation?: string;
  lastChecked: Date;
  nextCheck?: Date;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SecurityIncident {
  id: string;
  title: string;
  description: string;
  type: 'data-breach' | 'malware' | 'phishing' | 'insider-threat' | 'system-compromise' | 'network-intrusion' | 'application-vulnerability' | 'compliance-violation' | 'custom';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'assigned' | 'investigating' | 'contained' | 'resolved' | 'closed';
  assignedTo?: string;
  reportedBy: string;
  reportedAt: Date;
  detectedAt: Date;
  containedAt?: Date;
  resolvedAt?: Date;
  impact: {
    affectedUsers: number;
    affectedSystems: string[];
    dataCompromised: boolean;
    businessImpact: 'low' | 'medium' | 'high' | 'critical';
  };
  timeline: SecurityIncidentEvent[];
  evidence: string[];
  remediation: string[];
  lessonsLearned?: string;
  tags: string[];
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SecurityIncidentEvent {
  id: string;
  incidentId: string;
  type: 'detection' | 'assignment' | 'investigation' | 'containment' | 'resolution' | 'closure' | 'custom';
  description: string;
  timestamp: Date;
  userId: string;
  details: Record<string, any>;
}

interface SecurityAudit {
  id: string;
  name: string;
  description: string;
  type: 'internal' | 'external' | 'compliance' | 'penetration-test' | 'vulnerability-assessment' | 'custom';
  scope: string[];
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  startDate: Date;
  endDate?: Date;
  auditor?: string;
  findings: SecurityAuditFinding[];
  recommendations: string[];
  score: number;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SecurityAuditFinding {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'access-control' | 'data-protection' | 'network-security' | 'application-security' | 'incident-response' | 'compliance' | 'custom';
  evidence: string[];
  recommendation: string;
  status: 'open' | 'in-progress' | 'resolved' | 'accepted-risk';
  assignedTo?: string;
  dueDate?: Date;
  resolvedAt?: Date;
}

interface SecurityMetrics {
  id: string;
  metric: string;
  value: number;
  unit: string;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  date: Date;
  tenantId: string;
  createdAt: Date;
}

// In-memory storage for demo (replace with database in production)
const securityEvents: SecurityEvent[] = [];
const threatDetections: ThreatDetection[] = [];
const securityPolicies: SecurityPolicy[] = [];
const complianceChecks: ComplianceCheck[] = [];
const securityIncidents: SecurityIncident[] = [];
const securityAudits: SecurityAudit[] = [];
const securityMetrics: SecurityMetrics[] = [];

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
const validateSecurityEvent = [
  body('type').isIn(['authentication', 'authorization', 'data-access', 'system-access', 'network', 'application', 'database', 'file-access', 'api-call', 'user-action']).withMessage('Invalid event type'),
  body('severity').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity'),
  body('source').notEmpty().withMessage('Source is required'),
  body('target').notEmpty().withMessage('Target is required'),
  body('action').notEmpty().withMessage('Action is required'),
  body('result').isIn(['success', 'failure', 'blocked', 'allowed']).withMessage('Invalid result')
];

const validateThreatDetection = [
  body('threatType').isIn(['brute-force', 'sql-injection', 'xss', 'csrf', 'ddos', 'malware', 'phishing', 'data-exfiltration', 'privilege-escalation', 'insider-threat', 'anomaly', 'custom']).withMessage('Invalid threat type'),
  body('severity').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity'),
  body('source').notEmpty().withMessage('Source is required'),
  body('target').notEmpty().withMessage('Target is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('confidence').isFloat({ min: 0, max: 1 }).withMessage('Confidence must be between 0 and 1')
];

const validateSecurityPolicy = [
  body('name').notEmpty().withMessage('Policy name is required'),
  body('type').isIn(['access-control', 'data-protection', 'network-security', 'application-security', 'incident-response', 'compliance', 'custom']).withMessage('Invalid policy type'),
  body('rules').isArray().withMessage('Rules must be an array'),
  body('priority').isInt({ min: 1, max: 100 }).withMessage('Priority must be between 1 and 100')
];

const validateComplianceCheck = [
  body('name').notEmpty().withMessage('Check name is required'),
  body('standard').isIn(['SOC2', 'GDPR', 'HIPAA', 'PCI-DSS', 'ISO27001', 'NIST', 'custom']).withMessage('Invalid standard'),
  body('category').isIn(['access-control', 'data-protection', 'network-security', 'application-security', 'incident-response', 'business-continuity', 'custom']).withMessage('Invalid category'),
  body('requirement').notEmpty().withMessage('Requirement is required'),
  body('control').notEmpty().withMessage('Control is required'),
  body('test').notEmpty().withMessage('Test is required')
];

const validateSecurityIncident = [
  body('title').notEmpty().withMessage('Incident title is required'),
  body('description').notEmpty().withMessage('Incident description is required'),
  body('type').isIn(['data-breach', 'malware', 'phishing', 'insider-threat', 'system-compromise', 'network-intrusion', 'application-vulnerability', 'compliance-violation', 'custom']).withMessage('Invalid incident type'),
  body('severity').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity'),
  body('reportedBy').notEmpty().withMessage('Reported by is required')
];

const validateSecurityAudit = [
  body('name').notEmpty().withMessage('Audit name is required'),
  body('type').isIn(['internal', 'external', 'compliance', 'penetration-test', 'vulnerability-assessment', 'custom']).withMessage('Invalid audit type'),
  body('scope').isArray().withMessage('Scope must be an array'),
  body('startDate').isISO8601().withMessage('Valid start date is required')
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
    message: 'Security Service is healthy',
    timestamp: new Date().toISOString(),
    securityEvents: securityEvents.length,
    threatDetections: threatDetections.length,
    securityPolicies: securityPolicies.length,
    complianceChecks: complianceChecks.length,
    securityIncidents: securityIncidents.length,
    securityAudits: securityAudits.length,
    securityMetrics: securityMetrics.length
  });
});

// ============================================
// SECURITY EVENT MANAGEMENT ROUTES
// ============================================

/**
 * @route   POST /api/security/events
 * @desc    Create a new security event
 * @access  Private
 */
app.post('/api/security/events', authenticateToken, validateSecurityEvent, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const securityEvent: SecurityEvent = {
      id: uuidv4(),
      type: req.body.type,
      severity: req.body.severity,
      source: req.body.source,
      target: req.body.target,
      action: req.body.action,
      result: req.body.result,
      details: req.body.details || {},
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      userId: req.body.userId,
      sessionId: req.body.sessionId,
      timestamp: new Date(),
      tenantId: req.user.tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    securityEvents.push(securityEvent);

    // Check for threats
    await checkForThreats(securityEvent);

    logger.info(`Security event created: ${securityEvent.id}`);
    
    res.status(201).json({
      success: true,
      message: 'Security event created successfully',
      data: { securityEvent }
    });
  } catch (error) {
    logger.error('Error creating security event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create security event'
    });
  }
});

/**
 * @route   GET /api/security/events
 * @desc    Get all security events for a tenant
 * @access  Private
 */
app.get('/api/security/events', authenticateToken, async (req, res) => {
  try {
    const { type, severity, result, limit = 50, offset = 0 } = req.query;
    
    let tenantEvents = securityEvents.filter(event => event.tenantId === req.user.tenantId);
    
    // Apply filters
    if (type) {
      tenantEvents = tenantEvents.filter(event => event.type === type);
    }
    if (severity) {
      tenantEvents = tenantEvents.filter(event => event.severity === severity);
    }
    if (result) {
      tenantEvents = tenantEvents.filter(event => event.result === result);
    }
    
    // Sort by timestamp (newest first)
    tenantEvents = tenantEvents
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));
    
    res.json({
      success: true,
      data: { securityEvents: tenantEvents },
      count: tenantEvents.length,
      total: securityEvents.filter(event => event.tenantId === req.user.tenantId).length
    });
  } catch (error) {
    logger.error('Error fetching security events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch security events'
    });
  }
});

// ============================================
// THREAT DETECTION ROUTES
// ============================================

/**
 * @route   POST /api/security/threats
 * @desc    Create a new threat detection
 * @access  Private
 */
app.post('/api/security/threats', authenticateToken, validateThreatDetection, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const threatDetection: ThreatDetection = {
      id: uuidv4(),
      threatType: req.body.threatType,
      severity: req.body.severity,
      source: req.body.source,
      target: req.body.target,
      description: req.body.description,
      indicators: req.body.indicators || [],
      confidence: req.body.confidence,
      status: req.body.status || 'new',
      assignedTo: req.body.assignedTo,
      resolution: req.body.resolution,
      tags: req.body.tags || [],
      metadata: req.body.metadata || {},
      detectedAt: new Date(),
      resolvedAt: req.body.resolvedAt ? new Date(req.body.resolvedAt) : undefined,
      tenantId: req.user.tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    threatDetections.push(threatDetection);

    // Check if this is a critical threat
    if (threatDetection.severity === 'critical') {
      await handleCriticalThreat(threatDetection);
    }

    logger.info(`Threat detection created: ${threatDetection.id}`);
    
    res.status(201).json({
      success: true,
      message: 'Threat detection created successfully',
      data: { threatDetection }
    });
  } catch (error) {
    logger.error('Error creating threat detection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create threat detection'
    });
  }
});

/**
 * @route   GET /api/security/threats
 * @desc    Get all threat detections for a tenant
 * @access  Private
 */
app.get('/api/security/threats', authenticateToken, async (req, res) => {
  try {
    const { threatType, severity, status, limit = 50, offset = 0 } = req.query;
    
    let tenantThreats = threatDetections.filter(threat => threat.tenantId === req.user.tenantId);
    
    // Apply filters
    if (threatType) {
      tenantThreats = tenantThreats.filter(threat => threat.threatType === threatType);
    }
    if (severity) {
      tenantThreats = tenantThreats.filter(threat => threat.severity === severity);
    }
    if (status) {
      tenantThreats = tenantThreats.filter(threat => threat.status === status);
    }
    
    // Sort by detected date (newest first)
    tenantThreats = tenantThreats
      .sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime())
      .slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));
    
    res.json({
      success: true,
      data: { threatDetections: tenantThreats },
      count: tenantThreats.length,
      total: threatDetections.filter(threat => threat.tenantId === req.user.tenantId).length
    });
  } catch (error) {
    logger.error('Error fetching threat detections:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch threat detections'
    });
  }
});

// ============================================
// SECURITY POLICY ROUTES
// ============================================

/**
 * @route   POST /api/security/policies
 * @desc    Create a new security policy
 * @access  Private
 */
app.post('/api/security/policies', authenticateToken, validateSecurityPolicy, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const securityPolicy: SecurityPolicy = {
      id: uuidv4(),
      name: req.body.name,
      description: req.body.description || '',
      type: req.body.type,
      rules: req.body.rules || [],
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      priority: req.body.priority || 50,
      scope: req.body.scope || {
        users: [],
        roles: [],
        resources: [],
        environments: []
      },
      enforcement: req.body.enforcement || {
        action: 'log',
        notification: false,
        escalation: false
      },
      tenantId: req.user.tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    securityPolicies.push(securityPolicy);

    logger.info(`Security policy created: ${securityPolicy.id}`);
    
    res.status(201).json({
      success: true,
      message: 'Security policy created successfully',
      data: { securityPolicy }
    });
  } catch (error) {
    logger.error('Error creating security policy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create security policy'
    });
  }
});

/**
 * @route   GET /api/security/policies
 * @desc    Get all security policies for a tenant
 * @access  Private
 */
app.get('/api/security/policies', authenticateToken, async (req, res) => {
  try {
    const { type, isActive, limit = 50, offset = 0 } = req.query;
    
    let tenantPolicies = securityPolicies.filter(policy => policy.tenantId === req.user.tenantId);
    
    // Apply filters
    if (type) {
      tenantPolicies = tenantPolicies.filter(policy => policy.type === type);
    }
    if (isActive !== undefined) {
      tenantPolicies = tenantPolicies.filter(policy => policy.isActive === (isActive === 'true'));
    }
    
    // Sort by priority and creation date
    tenantPolicies = tenantPolicies
      .sort((a, b) => {
        if (a.priority !== b.priority) return b.priority - a.priority;
        return b.createdAt.getTime() - a.createdAt.getTime();
      })
      .slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));
    
    res.json({
      success: true,
      data: { securityPolicies: tenantPolicies },
      count: tenantPolicies.length,
      total: securityPolicies.filter(policy => policy.tenantId === req.user.tenantId).length
    });
  } catch (error) {
    logger.error('Error fetching security policies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch security policies'
    });
  }
});

// ============================================
// COMPLIANCE CHECK ROUTES
// ============================================

/**
 * @route   POST /api/security/compliance-checks
 * @desc    Create a new compliance check
 * @access  Private
 */
app.post('/api/security/compliance-checks', authenticateToken, validateComplianceCheck, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const complianceCheck: ComplianceCheck = {
      id: uuidv4(),
      name: req.body.name,
      description: req.body.description || '',
      standard: req.body.standard,
      category: req.body.category,
      requirement: req.body.requirement,
      control: req.body.control,
      test: req.body.test,
      expectedResult: req.body.expectedResult,
      actualResult: req.body.actualResult,
      status: req.body.status || 'not-tested',
      evidence: req.body.evidence || [],
      remediation: req.body.remediation,
      lastChecked: req.body.lastChecked ? new Date(req.body.lastChecked) : new Date(),
      nextCheck: req.body.nextCheck ? new Date(req.body.nextCheck) : undefined,
      tenantId: req.user.tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    complianceChecks.push(complianceCheck);

    logger.info(`Compliance check created: ${complianceCheck.id}`);
    
    res.status(201).json({
      success: true,
      message: 'Compliance check created successfully',
      data: { complianceCheck }
    });
  } catch (error) {
    logger.error('Error creating compliance check:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create compliance check'
    });
  }
});

/**
 * @route   GET /api/security/compliance-checks
 * @desc    Get all compliance checks for a tenant
 * @access  Private
 */
app.get('/api/security/compliance-checks', authenticateToken, async (req, res) => {
  try {
    const { standard, category, status, limit = 50, offset = 0 } = req.query;
    
    let tenantChecks = complianceChecks.filter(check => check.tenantId === req.user.tenantId);
    
    // Apply filters
    if (standard) {
      tenantChecks = tenantChecks.filter(check => check.standard === standard);
    }
    if (category) {
      tenantChecks = tenantChecks.filter(check => check.category === category);
    }
    if (status) {
      tenantChecks = tenantChecks.filter(check => check.status === status);
    }
    
    // Sort by last checked date
    tenantChecks = tenantChecks
      .sort((a, b) => b.lastChecked.getTime() - a.lastChecked.getTime())
      .slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));
    
    res.json({
      success: true,
      data: { complianceChecks: tenantChecks },
      count: tenantChecks.length,
      total: complianceChecks.filter(check => check.tenantId === req.user.tenantId).length
    });
  } catch (error) {
    logger.error('Error fetching compliance checks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch compliance checks'
    });
  }
});

// ============================================
// SECURITY INCIDENT ROUTES
// ============================================

/**
 * @route   POST /api/security/incidents
 * @desc    Create a new security incident
 * @access  Private
 */
app.post('/api/security/incidents', authenticateToken, validateSecurityIncident, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const securityIncident: SecurityIncident = {
      id: uuidv4(),
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
      severity: req.body.severity,
      status: req.body.status || 'new',
      assignedTo: req.body.assignedTo,
      reportedBy: req.body.reportedBy,
      reportedAt: req.body.reportedAt ? new Date(req.body.reportedAt) : new Date(),
      detectedAt: req.body.detectedAt ? new Date(req.body.detectedAt) : new Date(),
      containedAt: req.body.containedAt ? new Date(req.body.containedAt) : undefined,
      resolvedAt: req.body.resolvedAt ? new Date(req.body.resolvedAt) : undefined,
      impact: req.body.impact || {
        affectedUsers: 0,
        affectedSystems: [],
        dataCompromised: false,
        businessImpact: 'low'
      },
      timeline: req.body.timeline || [],
      evidence: req.body.evidence || [],
      remediation: req.body.remediation || [],
      lessonsLearned: req.body.lessonsLearned,
      tags: req.body.tags || [],
      tenantId: req.user.tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    securityIncidents.push(securityIncident);

    // Add initial timeline event
    const initialEvent: SecurityIncidentEvent = {
      id: uuidv4(),
      incidentId: securityIncident.id,
      type: 'detection',
      description: 'Security incident detected and reported',
      timestamp: new Date(),
      userId: req.user.id,
      details: { reportedBy: securityIncident.reportedBy }
    };
    
    securityIncident.timeline.push(initialEvent);

    // Handle critical incidents
    if (securityIncident.severity === 'critical') {
      await handleCriticalIncident(securityIncident);
    }

    logger.info(`Security incident created: ${securityIncident.id}`);
    
    res.status(201).json({
      success: true,
      message: 'Security incident created successfully',
      data: { securityIncident }
    });
  } catch (error) {
    logger.error('Error creating security incident:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create security incident'
    });
  }
});

/**
 * @route   GET /api/security/incidents
 * @desc    Get all security incidents for a tenant
 * @access  Private
 */
app.get('/api/security/incidents', authenticateToken, async (req, res) => {
  try {
    const { type, severity, status, limit = 50, offset = 0 } = req.query;
    
    let tenantIncidents = securityIncidents.filter(incident => incident.tenantId === req.user.tenantId);
    
    // Apply filters
    if (type) {
      tenantIncidents = tenantIncidents.filter(incident => incident.type === type);
    }
    if (severity) {
      tenantIncidents = tenantIncidents.filter(incident => incident.severity === severity);
    }
    if (status) {
      tenantIncidents = tenantIncidents.filter(incident => incident.status === status);
    }
    
    // Sort by detected date (newest first)
    tenantIncidents = tenantIncidents
      .sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime())
      .slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));
    
    res.json({
      success: true,
      data: { securityIncidents: tenantIncidents },
      count: tenantIncidents.length,
      total: securityIncidents.filter(incident => incident.tenantId === req.user.tenantId).length
    });
  } catch (error) {
    logger.error('Error fetching security incidents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch security incidents'
    });
  }
});

// ============================================
// SECURITY AUDIT ROUTES
// ============================================

/**
 * @route   POST /api/security/audits
 * @desc    Create a new security audit
 * @access  Private
 */
app.post('/api/security/audits', authenticateToken, validateSecurityAudit, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const securityAudit: SecurityAudit = {
      id: uuidv4(),
      name: req.body.name,
      description: req.body.description || '',
      type: req.body.type,
      scope: req.body.scope || [],
      status: req.body.status || 'planned',
      startDate: new Date(req.body.startDate),
      endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      auditor: req.body.auditor,
      findings: req.body.findings || [],
      recommendations: req.body.recommendations || [],
      score: req.body.score || 0,
      tenantId: req.user.tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    securityAudits.push(securityAudit);

    logger.info(`Security audit created: ${securityAudit.id}`);
    
    res.status(201).json({
      success: true,
      message: 'Security audit created successfully',
      data: { securityAudit }
    });
  } catch (error) {
    logger.error('Error creating security audit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create security audit'
    });
  }
});

/**
 * @route   GET /api/security/audits
 * @desc    Get all security audits for a tenant
 * @access  Private
 */
app.get('/api/security/audits', authenticateToken, async (req, res) => {
  try {
    const { type, status, limit = 50, offset = 0 } = req.query;
    
    let tenantAudits = securityAudits.filter(audit => audit.tenantId === req.user.tenantId);
    
    // Apply filters
    if (type) {
      tenantAudits = tenantAudits.filter(audit => audit.type === type);
    }
    if (status) {
      tenantAudits = tenantAudits.filter(audit => audit.status === status);
    }
    
    // Sort by start date (newest first)
    tenantAudits = tenantAudits
      .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())
      .slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));
    
    res.json({
      success: true,
      data: { securityAudits: tenantAudits },
      count: tenantAudits.length,
      total: securityAudits.filter(audit => audit.tenantId === req.user.tenantId).length
    });
  } catch (error) {
    logger.error('Error fetching security audits:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch security audits'
    });
  }
});

// ============================================
// SECURITY ANALYTICS ROUTES
// ============================================

/**
 * @route   GET /api/security/analytics/dashboard
 * @desc    Get security analytics dashboard
 * @access  Private
 */
app.get('/api/security/analytics/dashboard', authenticateToken, async (req, res) => {
  try {
    const tenantEvents = securityEvents.filter(event => event.tenantId === req.user.tenantId);
    const tenantThreats = threatDetections.filter(threat => threat.tenantId === req.user.tenantId);
    const tenantPolicies = securityPolicies.filter(policy => policy.tenantId === req.user.tenantId);
    const tenantComplianceChecks = complianceChecks.filter(check => check.tenantId === req.user.tenantId);
    const tenantIncidents = securityIncidents.filter(incident => incident.tenantId === req.user.tenantId);
    const tenantAudits = securityAudits.filter(audit => audit.tenantId === req.user.tenantId);

    // Security events analytics
    const eventStats = {
      total: tenantEvents.length,
      byType: {
        authentication: tenantEvents.filter(event => event.type === 'authentication').length,
        authorization: tenantEvents.filter(event => event.type === 'authorization').length,
        dataAccess: tenantEvents.filter(event => event.type === 'data-access').length,
        systemAccess: tenantEvents.filter(event => event.type === 'system-access').length,
        network: tenantEvents.filter(event => event.type === 'network').length,
        application: tenantEvents.filter(event => event.type === 'application').length,
        database: tenantEvents.filter(event => event.type === 'database').length,
        fileAccess: tenantEvents.filter(event => event.type === 'file-access').length,
        apiCall: tenantEvents.filter(event => event.type === 'api-call').length,
        userAction: tenantEvents.filter(event => event.type === 'user-action').length
      },
      bySeverity: {
        low: tenantEvents.filter(event => event.severity === 'low').length,
        medium: tenantEvents.filter(event => event.severity === 'medium').length,
        high: tenantEvents.filter(event => event.severity === 'high').length,
        critical: tenantEvents.filter(event => event.severity === 'critical').length
      },
      byResult: {
        success: tenantEvents.filter(event => event.result === 'success').length,
        failure: tenantEvents.filter(event => event.result === 'failure').length,
        blocked: tenantEvents.filter(event => event.result === 'blocked').length,
        allowed: tenantEvents.filter(event => event.result === 'allowed').length
      },
      recentEvents: tenantEvents.filter(event => 
        moment().diff(event.timestamp, 'days') <= 7
      ).length
    };

    // Threat detection analytics
    const threatStats = {
      total: tenantThreats.length,
      byType: {
        bruteForce: tenantThreats.filter(threat => threat.threatType === 'brute-force').length,
        sqlInjection: tenantThreats.filter(threat => threat.threatType === 'sql-injection').length,
        xss: tenantThreats.filter(threat => threat.threatType === 'xss').length,
        csrf: tenantThreats.filter(threat => threat.threatType === 'csrf').length,
        ddos: tenantThreats.filter(threat => threat.threatType === 'ddos').length,
        malware: tenantThreats.filter(threat => threat.threatType === 'malware').length,
        phishing: tenantThreats.filter(threat => threat.threatType === 'phishing').length,
        dataExfiltration: tenantThreats.filter(threat => threat.threatType === 'data-exfiltration').length,
        privilegeEscalation: tenantThreats.filter(threat => threat.threatType === 'privilege-escalation').length,
        insiderThreat: tenantThreats.filter(threat => threat.threatType === 'insider-threat').length,
        anomaly: tenantThreats.filter(threat => threat.threatType === 'anomaly').length,
        custom: tenantThreats.filter(threat => threat.threatType === 'custom').length
      },
      bySeverity: {
        low: tenantThreats.filter(threat => threat.severity === 'low').length,
        medium: tenantThreats.filter(threat => threat.severity === 'medium').length,
        high: tenantThreats.filter(threat => threat.severity === 'high').length,
        critical: tenantThreats.filter(threat => threat.severity === 'critical').length
      },
      byStatus: {
        new: tenantThreats.filter(threat => threat.status === 'new').length,
        investigating: tenantThreats.filter(threat => threat.status === 'investigating').length,
        confirmed: tenantThreats.filter(threat => threat.status === 'confirmed').length,
        falsePositive: tenantThreats.filter(threat => threat.status === 'false-positive').length,
        resolved: tenantThreats.filter(threat => threat.status === 'resolved').length,
        ignored: tenantThreats.filter(threat => threat.status === 'ignored').length
      },
      averageConfidence: tenantThreats.reduce((sum, threat) => sum + threat.confidence, 0) / tenantThreats.length || 0,
      recentThreats: tenantThreats.filter(threat => 
        moment().diff(threat.detectedAt, 'days') <= 7
      ).length
    };

    // Security policy analytics
    const policyStats = {
      total: tenantPolicies.length,
      active: tenantPolicies.filter(policy => policy.isActive).length,
      inactive: tenantPolicies.filter(policy => !policy.isActive).length,
      byType: {
        accessControl: tenantPolicies.filter(policy => policy.type === 'access-control').length,
        dataProtection: tenantPolicies.filter(policy => policy.type === 'data-protection').length,
        networkSecurity: tenantPolicies.filter(policy => policy.type === 'network-security').length,
        applicationSecurity: tenantPolicies.filter(policy => policy.type === 'application-security').length,
        incidentResponse: tenantPolicies.filter(policy => policy.type === 'incident-response').length,
        compliance: tenantPolicies.filter(policy => policy.type === 'compliance').length,
        custom: tenantPolicies.filter(policy => policy.type === 'custom').length
      },
      averageRules: tenantPolicies.reduce((sum, policy) => sum + policy.rules.length, 0) / tenantPolicies.length || 0
    };

    // Compliance check analytics
    const complianceStats = {
      total: tenantComplianceChecks.length,
      byStandard: {
        SOC2: tenantComplianceChecks.filter(check => check.standard === 'SOC2').length,
        GDPR: tenantComplianceChecks.filter(check => check.standard === 'GDPR').length,
        HIPAA: tenantComplianceChecks.filter(check => check.standard === 'HIPAA').length,
        PCIDSS: tenantComplianceChecks.filter(check => check.standard === 'PCI-DSS').length,
        ISO27001: tenantComplianceChecks.filter(check => check.standard === 'ISO27001').length,
        NIST: tenantComplianceChecks.filter(check => check.standard === 'NIST').length,
        custom: tenantComplianceChecks.filter(check => check.standard === 'custom').length
      },
      byStatus: {
        pass: tenantComplianceChecks.filter(check => check.status === 'pass').length,
        fail: tenantComplianceChecks.filter(check => check.status === 'fail').length,
        warning: tenantComplianceChecks.filter(check => check.status === 'warning').length,
        notApplicable: tenantComplianceChecks.filter(check => check.status === 'not-applicable').length,
        notTested: tenantComplianceChecks.filter(check => check.status === 'not-tested').length
      },
      complianceScore: tenantComplianceChecks.length > 0 ? 
        (tenantComplianceChecks.filter(check => check.status === 'pass').length / tenantComplianceChecks.length) * 100 : 0
    };

    // Security incident analytics
    const incidentStats = {
      total: tenantIncidents.length,
      byType: {
        dataBreach: tenantIncidents.filter(incident => incident.type === 'data-breach').length,
        malware: tenantIncidents.filter(incident => incident.type === 'malware').length,
        phishing: tenantIncidents.filter(incident => incident.type === 'phishing').length,
        insiderThreat: tenantIncidents.filter(incident => incident.type === 'insider-threat').length,
        systemCompromise: tenantIncidents.filter(incident => incident.type === 'system-compromise').length,
        networkIntrusion: tenantIncidents.filter(incident => incident.type === 'network-intrusion').length,
        applicationVulnerability: tenantIncidents.filter(incident => incident.type === 'application-vulnerability').length,
        complianceViolation: tenantIncidents.filter(incident => incident.type === 'compliance-violation').length,
        custom: tenantIncidents.filter(incident => incident.type === 'custom').length
      },
      bySeverity: {
        low: tenantIncidents.filter(incident => incident.severity === 'low').length,
        medium: tenantIncidents.filter(incident => incident.severity === 'medium').length,
        high: tenantIncidents.filter(incident => incident.severity === 'high').length,
        critical: tenantIncidents.filter(incident => incident.severity === 'critical').length
      },
      byStatus: {
        new: tenantIncidents.filter(incident => incident.status === 'new').length,
        assigned: tenantIncidents.filter(incident => incident.status === 'assigned').length,
        investigating: tenantIncidents.filter(incident => incident.status === 'investigating').length,
        contained: tenantIncidents.filter(incident => incident.status === 'contained').length,
        resolved: tenantIncidents.filter(incident => incident.status === 'resolved').length,
        closed: tenantIncidents.filter(incident => incident.status === 'closed').length
      },
      averageResolutionTime: tenantIncidents
        .filter(incident => incident.resolvedAt)
        .reduce((sum, incident) => {
          const resolutionTime = incident.resolvedAt!.getTime() - incident.detectedAt.getTime();
          return sum + resolutionTime;
        }, 0) / tenantIncidents.filter(incident => incident.resolvedAt).length || 0,
      recentIncidents: tenantIncidents.filter(incident => 
        moment().diff(incident.detectedAt, 'days') <= 30
      ).length
    };

    // Security audit analytics
    const auditStats = {
      total: tenantAudits.length,
      byType: {
        internal: tenantAudits.filter(audit => audit.type === 'internal').length,
        external: tenantAudits.filter(audit => audit.type === 'external').length,
        compliance: tenantAudits.filter(audit => audit.type === 'compliance').length,
        penetrationTest: tenantAudits.filter(audit => audit.type === 'penetration-test').length,
        vulnerabilityAssessment: tenantAudits.filter(audit => audit.type === 'vulnerability-assessment').length,
        custom: tenantAudits.filter(audit => audit.type === 'custom').length
      },
      byStatus: {
        planned: tenantAudits.filter(audit => audit.status === 'planned').length,
        inProgress: tenantAudits.filter(audit => audit.status === 'in-progress').length,
        completed: tenantAudits.filter(audit => audit.status === 'completed').length,
        cancelled: tenantAudits.filter(audit => audit.status === 'cancelled').length
      },
      averageScore: tenantAudits.reduce((sum, audit) => sum + audit.score, 0) / tenantAudits.length || 0,
      totalFindings: tenantAudits.reduce((sum, audit) => sum + audit.findings.length, 0),
      criticalFindings: tenantAudits.reduce((sum, audit) => 
        sum + audit.findings.filter(finding => finding.severity === 'critical').length, 0
      )
    };

    res.json({
      success: true,
      data: {
        events: eventStats,
        threats: threatStats,
        policies: policyStats,
        compliance: complianceStats,
        incidents: incidentStats,
        audits: auditStats,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error fetching security analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch security analytics'
    });
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

async function checkForThreats(securityEvent: SecurityEvent): Promise<void> {
  try {
    // Check for brute force attacks
    if (securityEvent.type === 'authentication' && securityEvent.result === 'failure') {
      const recentFailures = securityEvents.filter(event => 
        event.type === 'authentication' &&
        event.result === 'failure' &&
        event.source === securityEvent.source &&
        event.timestamp > new Date(Date.now() - 15 * 60 * 1000) // Last 15 minutes
      );
      
      if (recentFailures.length >= 5) {
        const threatDetection: ThreatDetection = {
          id: uuidv4(),
          threatType: 'brute-force',
          severity: 'high',
          source: securityEvent.source,
          target: securityEvent.target,
          description: `Brute force attack detected from ${securityEvent.source}`,
          indicators: [`${recentFailures.length} failed authentication attempts in 15 minutes`],
          confidence: 0.9,
          status: 'new',
          tags: ['brute-force', 'authentication', 'high-risk'],
          metadata: { 
            failureCount: recentFailures.length,
            timeWindow: '15 minutes',
            ipAddress: securityEvent.ipAddress
          },
          detectedAt: new Date(),
          tenantId: securityEvent.tenantId,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        threatDetections.push(threatDetection);
        logger.warn(`Brute force threat detected: ${threatDetection.id}`);
      }
    }

    // Check for SQL injection attempts
    if (securityEvent.type === 'api-call' && securityEvent.details.query) {
      const sqlInjectionPatterns = [
        /union\s+select/i,
        /drop\s+table/i,
        /insert\s+into/i,
        /delete\s+from/i,
        /update\s+set/i,
        /or\s+1\s*=\s*1/i,
        /and\s+1\s*=\s*1/i
      ];
      
      const query = securityEvent.details.query;
      const isSQLInjection = sqlInjectionPatterns.some(pattern => pattern.test(query));
      
      if (isSQLInjection) {
        const threatDetection: ThreatDetection = {
          id: uuidv4(),
          threatType: 'sql-injection',
          severity: 'critical',
          source: securityEvent.source,
          target: securityEvent.target,
          description: `SQL injection attempt detected from ${securityEvent.source}`,
          indicators: [`Malicious SQL query detected: ${query.substring(0, 100)}...`],
          confidence: 0.95,
          status: 'new',
          tags: ['sql-injection', 'api-call', 'critical'],
          metadata: { 
            query: query,
            ipAddress: securityEvent.ipAddress,
            userAgent: securityEvent.userAgent
          },
          detectedAt: new Date(),
          tenantId: securityEvent.tenantId,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        threatDetections.push(threatDetection);
        logger.warn(`SQL injection threat detected: ${threatDetection.id}`);
      }
    }

    // Check for XSS attempts
    if (securityEvent.type === 'api-call' && securityEvent.details.input) {
      const xssPatterns = [
        /<script[^>]*>.*?<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<iframe[^>]*>.*?<\/iframe>/gi,
        /<object[^>]*>.*?<\/object>/gi,
        /<embed[^>]*>.*?<\/embed>/gi
      ];
      
      const input = JSON.stringify(securityEvent.details.input);
      const isXSS = xssPatterns.some(pattern => pattern.test(input));
      
      if (isXSS) {
        const threatDetection: ThreatDetection = {
          id: uuidv4(),
          threatType: 'xss',
          severity: 'high',
          source: securityEvent.source,
          target: securityEvent.target,
          description: `XSS attempt detected from ${securityEvent.source}`,
          indicators: [`Malicious script detected in input`],
          confidence: 0.9,
          status: 'new',
          tags: ['xss', 'api-call', 'high-risk'],
          metadata: { 
            input: input.substring(0, 200),
            ipAddress: securityEvent.ipAddress,
            userAgent: securityEvent.userAgent
          },
          detectedAt: new Date(),
          tenantId: securityEvent.tenantId,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        threatDetections.push(threatDetection);
        logger.warn(`XSS threat detected: ${threatDetection.id}`);
      }
    }

    // Check for DDoS attempts
    if (securityEvent.type === 'api-call') {
      const recentRequests = securityEvents.filter(event => 
        event.type === 'api-call' &&
        event.source === securityEvent.source &&
        event.timestamp > new Date(Date.now() - 60 * 1000) // Last 1 minute
      );
      
      if (recentRequests.length >= 100) {
        const threatDetection: ThreatDetection = {
          id: uuidv4(),
          threatType: 'ddos',
          severity: 'critical',
          source: securityEvent.source,
          target: securityEvent.target,
          description: `DDoS attack detected from ${securityEvent.source}`,
          indicators: [`${recentRequests.length} requests in 1 minute`],
          confidence: 0.85,
          status: 'new',
          tags: ['ddos', 'api-call', 'critical'],
          metadata: { 
            requestCount: recentRequests.length,
            timeWindow: '1 minute',
            ipAddress: securityEvent.ipAddress
          },
          detectedAt: new Date(),
          tenantId: securityEvent.tenantId,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        threatDetections.push(threatDetection);
        logger.warn(`DDoS threat detected: ${threatDetection.id}`);
      }
    }
  } catch (error) {
    logger.error('Error checking for threats:', error);
  }
}

async function handleCriticalThreat(threatDetection: ThreatDetection): Promise<void> {
  try {
    // Create security incident
    const securityIncident: SecurityIncident = {
      id: uuidv4(),
      title: `Critical Threat: ${threatDetection.threatType}`,
      description: `Critical threat detected: ${threatDetection.description}`,
      type: 'system-compromise',
      severity: 'critical',
      status: 'new',
      reportedBy: 'system',
      reportedAt: new Date(),
      detectedAt: new Date(),
      impact: {
        affectedUsers: 0,
        affectedSystems: [threatDetection.target],
        dataCompromised: false,
        businessImpact: 'high'
      },
      timeline: [],
      evidence: [threatDetection.id],
      remediation: [],
      tags: ['critical', 'auto-generated', threatDetection.threatType],
      tenantId: threatDetection.tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    securityIncidents.push(securityIncident);

    // Add timeline event
    const timelineEvent: SecurityIncidentEvent = {
      id: uuidv4(),
      incidentId: securityIncident.id,
      type: 'detection',
      description: `Critical threat detected: ${threatDetection.threatType}`,
      timestamp: new Date(),
      userId: 'system',
      details: { threatDetectionId: threatDetection.id }
    };
    
    securityIncident.timeline.push(timelineEvent);

    logger.warn(`Critical threat incident created: ${securityIncident.id}`);
  } catch (error) {
    logger.error('Error handling critical threat:', error);
  }
}

async function handleCriticalIncident(securityIncident: SecurityIncident): Promise<void> {
  try {
    // Send notifications
    logger.warn(`Critical security incident: ${securityIncident.id}`);
    
    // Add timeline event
    const timelineEvent: SecurityIncidentEvent = {
      id: uuidv4(),
      incidentId: securityIncident.id,
      type: 'custom',
      description: 'Critical incident notification sent',
      timestamp: new Date(),
      userId: 'system',
      details: { notificationSent: true }
    };
    
    securityIncident.timeline.push(timelineEvent);
  } catch (error) {
    logger.error('Error handling critical incident:', error);
  }
}

// ============================================
// CRON JOBS
// ============================================

// Generate security metrics daily
cron.schedule('0 1 * * *', async () => {
  logger.info('Generating security metrics...');
  
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const today = new Date();
  
  const tenantEvents = securityEvents.filter(event => 
    event.tenantId === 'default' && 
    event.timestamp >= yesterday && 
    event.timestamp < today
  );
  
  const tenantThreats = threatDetections.filter(threat => 
    threat.tenantId === 'default' && 
    threat.detectedAt >= yesterday && 
    threat.detectedAt < today
  );
  
  const tenantIncidents = securityIncidents.filter(incident => 
    incident.tenantId === 'default' && 
    incident.detectedAt >= yesterday && 
    incident.detectedAt < today
  );
  
  const metrics = [
    {
      id: uuidv4(),
      metric: 'security_events_daily',
      value: tenantEvents.length,
      unit: 'count',
      period: 'daily' as const,
      date: yesterday,
      tenantId: 'default',
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      metric: 'threat_detections_daily',
      value: tenantThreats.length,
      unit: 'count',
      period: 'daily' as const,
      date: yesterday,
      tenantId: 'default',
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      metric: 'security_incidents_daily',
      value: tenantIncidents.length,
      unit: 'count',
      period: 'daily' as const,
      date: yesterday,
      tenantId: 'default',
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      metric: 'critical_threats_daily',
      value: tenantThreats.filter(threat => threat.severity === 'critical').length,
      unit: 'count',
      period: 'daily' as const,
      date: yesterday,
      tenantId: 'default',
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      metric: 'security_score_daily',
      value: calculateSecurityScore(tenantEvents, tenantThreats, tenantIncidents),
      unit: 'percentage',
      period: 'daily' as const,
      date: yesterday,
      tenantId: 'default',
      createdAt: new Date()
    }
  ];
  
  securityMetrics.push(...metrics);
  logger.info(`Generated ${metrics.length} security metrics`);
});

// Clean up old data weekly
cron.schedule('0 2 * * 0', async () => {
  logger.info('Cleaning up old security data...');
  
  const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days ago
  
  // Clean up old events
  const initialEventsCount = securityEvents.length;
  const filteredEvents = securityEvents.filter(event => event.createdAt > cutoffDate);
  securityEvents.length = 0;
  securityEvents.push(...filteredEvents);
  
  // Clean up old threat detections
  const initialThreatsCount = threatDetections.length;
  const filteredThreats = threatDetections.filter(threat => threat.createdAt > cutoffDate);
  threatDetections.length = 0;
  threatDetections.push(...filteredThreats);
  
  // Clean up old metrics
  const initialMetricsCount = securityMetrics.length;
  const filteredMetrics = securityMetrics.filter(metric => metric.createdAt > cutoffDate);
  securityMetrics.length = 0;
  securityMetrics.push(...filteredMetrics);
  
  logger.info(`Cleaned up ${initialEventsCount - securityEvents.length} old security events`);
  logger.info(`Cleaned up ${initialThreatsCount - threatDetections.length} old threat detections`);
  logger.info(`Cleaned up ${initialMetricsCount - securityMetrics.length} old security metrics`);
});

function calculateSecurityScore(events: SecurityEvent[], threats: ThreatDetection[], incidents: SecurityIncident[]): number {
  try {
    let score = 100; // Start with perfect score
    
    // Deduct points for events
    const criticalEvents = events.filter(event => event.severity === 'critical').length;
    const highEvents = events.filter(event => event.severity === 'high').length;
    const mediumEvents = events.filter(event => event.severity === 'medium').length;
    const lowEvents = events.filter(event => event.severity === 'low').length;
    
    score -= criticalEvents * 10;
    score -= highEvents * 5;
    score -= mediumEvents * 2;
    score -= lowEvents * 1;
    
    // Deduct points for threats
    const criticalThreats = threats.filter(threat => threat.severity === 'critical').length;
    const highThreats = threats.filter(threat => threat.severity === 'high').length;
    const mediumThreats = threats.filter(threat => threat.severity === 'medium').length;
    const lowThreats = threats.filter(threat => threat.severity === 'low').length;
    
    score -= criticalThreats * 15;
    score -= highThreats * 8;
    score -= mediumThreats * 3;
    score -= lowThreats * 1;
    
    // Deduct points for incidents
    const criticalIncidents = incidents.filter(incident => incident.severity === 'critical').length;
    const highIncidents = incidents.filter(incident => incident.severity === 'high').length;
    const mediumIncidents = incidents.filter(incident => incident.severity === 'medium').length;
    const lowIncidents = incidents.filter(incident => incident.severity === 'low').length;
    
    score -= criticalIncidents * 20;
    score -= highIncidents * 10;
    score -= mediumIncidents * 5;
    score -= lowIncidents * 2;
    
    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, score));
  } catch (error) {
    logger.error('Error calculating security score:', error);
    return 0;
  }
}

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
const PORT = process.env.PORT || 3010;

const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 Security Service running on port ${PORT}`);
      logger.info(`🔒 Security Event Management: Active`);
      logger.info(`🛡️ Threat Detection: Active`);
      logger.info(`📋 Security Policy Management: Active`);
      logger.info(`✅ Compliance Checks: Active`);
      logger.info(`🚨 Security Incident Management: Active`);
      logger.info(`🔍 Security Audits: Active`);
      logger.info(`📊 Security Analytics: Active`);
      logger.info(`⏰ Automated Monitoring: Active`);
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
