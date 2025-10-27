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
  defaultMeta: { service: 'automation-service' },
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
  process.env.DATABASE_URL || 'postgresql://localhost:5432/studyspot_automation',
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

// Automation Models and Interfaces
interface Workflow {
  id: string;
  name: string;
  description: string;
  type: 'lead-nurturing' | 'customer-onboarding' | 'payment-processing' | 'support-ticket' | 'marketing-campaign' | 'data-sync' | 'report-generation' | 'custom';
  status: 'draft' | 'active' | 'paused' | 'archived';
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  conditions: WorkflowCondition[];
  variables: Record<string, any>;
  settings: WorkflowSettings;
  metrics: WorkflowMetrics;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface WorkflowTrigger {
  type: 'webhook' | 'schedule' | 'event' | 'manual' | 'api-call';
  configuration: Record<string, any>;
  conditions?: WorkflowCondition[];
}

interface WorkflowStep {
  id: string;
  name: string;
  type: 'action' | 'condition' | 'delay' | 'loop' | 'parallel' | 'webhook' | 'ai-decision';
  configuration: Record<string, any>;
  nextSteps: string[];
  errorHandling: {
    onError: 'stop' | 'retry' | 'skip' | 'fallback';
    maxRetries: number;
    retryDelay: number;
    fallbackStep?: string;
  };
  timeout: number;
  order: number;
}

interface WorkflowCondition {
  id: string;
  field: string;
  operator: 'equals' | 'not-equals' | 'contains' | 'not-contains' | 'greater-than' | 'less-than' | 'greater-than-or-equals' | 'less-than-or-equals' | 'in' | 'not-in' | 'exists' | 'not-exists';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

interface WorkflowSettings {
  maxConcurrentExecutions: number;
  timeout: number;
  retryPolicy: {
    maxRetries: number;
    retryDelay: number;
    backoffMultiplier: number;
  };
  notifications: {
    onSuccess: boolean;
    onFailure: boolean;
    onTimeout: boolean;
    recipients: string[];
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    includePayload: boolean;
    includeHeaders: boolean;
  };
}

interface WorkflowMetrics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  lastExecution?: Date;
  lastSuccess?: Date;
  lastFailure?: Date;
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'timeout';
  triggerData: Record<string, any>;
  variables: Record<string, any>;
  currentStep?: string;
  completedSteps: string[];
  failedSteps: string[];
  startTime: Date;
  endTime?: Date;
  duration?: number;
  errorMessage?: string;
  logs: WorkflowLog[];
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface WorkflowLog {
  id: string;
  executionId: string;
  stepId: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  data?: Record<string, any>;
  timestamp: Date;
}

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  type: 'lead-scoring' | 'email-sequence' | 'task-creation' | 'notification' | 'data-sync' | 'custom';
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  priority: number;
  isActive: boolean;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AutomationCondition {
  id: string;
  field: string;
  operator: 'equals' | 'not-equals' | 'contains' | 'not-contains' | 'greater-than' | 'less-than' | 'greater-than-or-equals' | 'less-than-or-equals' | 'in' | 'not-in' | 'exists' | 'not-exists';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

interface AutomationAction {
  id: string;
  type: 'send-email' | 'send-sms' | 'send-whatsapp' | 'create-task' | 'update-record' | 'create-record' | 'webhook' | 'ai-action';
  configuration: Record<string, any>;
  order: number;
}

interface AutomationExecution {
  id: string;
  ruleId: string;
  triggerData: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  errorMessage?: string;
  actionsExecuted: string[];
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AIDecision {
  id: string;
  name: string;
  description: string;
  model: 'gpt-3.5-turbo' | 'gpt-4' | 'claude-3' | 'custom';
  prompt: string;
  inputVariables: string[];
  outputFormat: 'text' | 'json' | 'boolean' | 'number';
  confidenceThreshold: number;
  fallbackAction?: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AIDecisionExecution {
  id: string;
  decisionId: string;
  input: Record<string, any>;
  output: any;
  confidence: number;
  model: string;
  tokensUsed: number;
  executionTime: number;
  status: 'success' | 'failure' | 'low-confidence';
  errorMessage?: string;
  tenantId: string;
  createdAt: Date;
}

// In-memory storage for demo (replace with database in production)
const workflows: Workflow[] = [];
const workflowExecutions: WorkflowExecution[] = [];
const automationRules: AutomationRule[] = [];
const automationExecutions: AutomationExecution[] = [];
const aiDecisions: AIDecision[] = [];
const aiDecisionExecutions: AIDecisionExecution[] = [];

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
const validateWorkflow = [
  body('name').notEmpty().withMessage('Workflow name is required'),
  body('type').isIn(['lead-nurturing', 'customer-onboarding', 'payment-processing', 'support-ticket', 'marketing-campaign', 'data-sync', 'report-generation', 'custom']).withMessage('Invalid workflow type'),
  body('trigger').isObject().withMessage('Trigger configuration is required'),
  body('steps').isArray().withMessage('Steps must be an array'),
  body('status').isIn(['draft', 'active', 'paused', 'archived']).withMessage('Invalid status')
];

const validateAutomationRule = [
  body('name').notEmpty().withMessage('Rule name is required'),
  body('type').isIn(['lead-scoring', 'email-sequence', 'task-creation', 'notification', 'data-sync', 'custom']).withMessage('Invalid rule type'),
  body('conditions').isArray().withMessage('Conditions must be an array'),
  body('actions').isArray().withMessage('Actions must be an array'),
  body('priority').isInt({ min: 1, max: 100 }).withMessage('Priority must be between 1 and 100')
];

const validateAIDecision = [
  body('name').notEmpty().withMessage('AI decision name is required'),
  body('model').isIn(['gpt-3.5-turbo', 'gpt-4', 'claude-3', 'custom']).withMessage('Invalid model'),
  body('prompt').notEmpty().withMessage('Prompt is required'),
  body('inputVariables').isArray().withMessage('Input variables must be an array'),
  body('outputFormat').isIn(['text', 'json', 'boolean', 'number']).withMessage('Invalid output format'),
  body('confidenceThreshold').isFloat({ min: 0, max: 1 }).withMessage('Confidence threshold must be between 0 and 1')
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
    message: 'Automation Service is healthy',
    timestamp: new Date().toISOString(),
    workflows: workflows.length,
    workflowExecutions: workflowExecutions.length,
    automationRules: automationRules.length,
    automationExecutions: automationExecutions.length,
    aiDecisions: aiDecisions.length,
    aiDecisionExecutions: aiDecisionExecutions.length
  });
});

// ============================================
// WORKFLOW MANAGEMENT ROUTES
// ============================================

/**
 * @route   POST /api/automation/workflows
 * @desc    Create a new workflow
 * @access  Private
 */
app.post('/api/automation/workflows', authenticateToken, validateWorkflow, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const workflow: Workflow = {
      id: uuidv4(),
      name: req.body.name,
      description: req.body.description || '',
      type: req.body.type,
      status: req.body.status || 'draft',
      trigger: req.body.trigger,
      steps: req.body.steps || [],
      conditions: req.body.conditions || [],
      variables: req.body.variables || {},
      settings: req.body.settings || {
        maxConcurrentExecutions: 10,
        timeout: 300000, // 5 minutes
        retryPolicy: {
          maxRetries: 3,
          retryDelay: 1000,
          backoffMultiplier: 2
        },
        notifications: {
          onSuccess: false,
          onFailure: true,
          onTimeout: true,
          recipients: []
        },
        logging: {
          level: 'info',
          includePayload: true,
          includeHeaders: false
        }
      },
      metrics: {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        averageExecutionTime: 0
      },
      tenantId: req.user.tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    workflows.push(workflow);

    logger.info(`Workflow created: ${workflow.id}`);
    
    res.status(201).json({
      success: true,
      message: 'Workflow created successfully',
      data: { workflow }
    });
  } catch (error) {
    logger.error('Error creating workflow:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create workflow'
    });
  }
});

/**
 * @route   GET /api/automation/workflows
 * @desc    Get all workflows for a tenant
 * @access  Private
 */
app.get('/api/automation/workflows', authenticateToken, async (req, res) => {
  try {
    const { type, status, limit = 50, offset = 0 } = req.query;
    
    let tenantWorkflows = workflows.filter(workflow => workflow.tenantId === req.user.tenantId);
    
    // Apply filters
    if (type) {
      tenantWorkflows = tenantWorkflows.filter(workflow => workflow.type === type);
    }
    if (status) {
      tenantWorkflows = tenantWorkflows.filter(workflow => workflow.status === status);
    }
    
    // Sort by creation date
    tenantWorkflows = tenantWorkflows
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));
    
    res.json({
      success: true,
      data: { workflows: tenantWorkflows },
      count: tenantWorkflows.length,
      total: workflows.filter(workflow => workflow.tenantId === req.user.tenantId).length
    });
  } catch (error) {
    logger.error('Error fetching workflows:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch workflows'
    });
  }
});

/**
 * @route   POST /api/automation/workflows/:id/execute
 * @desc    Execute a workflow
 * @access  Private
 */
app.post('/api/automation/workflows/:id/execute', authenticateToken, async (req, res) => {
  try {
    const workflow = workflows.find(
      w => w.id === req.params.id && w.tenantId === req.user.tenantId
    );
    
    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found'
      });
    }

    if (workflow.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Workflow must be active to execute'
      });
    }

    // Create execution
    const execution: WorkflowExecution = {
      id: uuidv4(),
      workflowId: workflow.id,
      status: 'pending',
      triggerData: req.body.triggerData || {},
      variables: req.body.variables || {},
      completedSteps: [],
      failedSteps: [],
      startTime: new Date(),
      logs: [],
      tenantId: req.user.tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    workflowExecutions.push(execution);

    // Start workflow execution
    executeWorkflow(workflow, execution);

    logger.info(`Workflow execution started: ${execution.id}`);
    
    res.json({
      success: true,
      message: 'Workflow execution started',
      data: { execution }
    });
  } catch (error) {
    logger.error('Error executing workflow:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute workflow',
      error: error.message
    });
  }
});

// ============================================
// AUTOMATION RULES ROUTES
// ============================================

/**
 * @route   POST /api/automation/rules
 * @desc    Create a new automation rule
 * @access  Private
 */
app.post('/api/automation/rules', authenticateToken, validateAutomationRule, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const rule: AutomationRule = {
      id: uuidv4(),
      name: req.body.name,
      description: req.body.description || '',
      type: req.body.type,
      conditions: req.body.conditions || [],
      actions: req.body.actions || [],
      priority: req.body.priority || 50,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      tenantId: req.user.tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    automationRules.push(rule);

    logger.info(`Automation rule created: ${rule.id}`);
    
    res.status(201).json({
      success: true,
      message: 'Automation rule created successfully',
      data: { rule }
    });
  } catch (error) {
    logger.error('Error creating automation rule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create automation rule'
    });
  }
});

/**
 * @route   GET /api/automation/rules
 * @desc    Get all automation rules for a tenant
 * @access  Private
 */
app.get('/api/automation/rules', authenticateToken, async (req, res) => {
  try {
    const { type, isActive, limit = 50, offset = 0 } = req.query;
    
    let tenantRules = automationRules.filter(rule => rule.tenantId === req.user.tenantId);
    
    // Apply filters
    if (type) {
      tenantRules = tenantRules.filter(rule => rule.type === type);
    }
    if (isActive !== undefined) {
      tenantRules = tenantRules.filter(rule => rule.isActive === (isActive === 'true'));
    }
    
    // Sort by priority and creation date
    tenantRules = tenantRules
      .sort((a, b) => {
        if (a.priority !== b.priority) return b.priority - a.priority;
        return b.createdAt.getTime() - a.createdAt.getTime();
      })
      .slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));
    
    res.json({
      success: true,
      data: { rules: tenantRules },
      count: tenantRules.length,
      total: automationRules.filter(rule => rule.tenantId === req.user.tenantId).length
    });
  } catch (error) {
    logger.error('Error fetching automation rules:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch automation rules'
    });
  }
});

/**
 * @route   POST /api/automation/rules/:id/execute
 * @desc    Execute an automation rule
 * @access  Private
 */
app.post('/api/automation/rules/:id/execute', authenticateToken, async (req, res) => {
  try {
    const rule = automationRules.find(
      r => r.id === req.params.id && r.tenantId === req.user.tenantId
    );
    
    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Automation rule not found'
      });
    }

    if (!rule.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Automation rule is not active'
      });
    }

    // Create execution
    const execution: AutomationExecution = {
      id: uuidv4(),
      ruleId: rule.id,
      triggerData: req.body.triggerData || {},
      status: 'pending',
      startTime: new Date(),
      actionsExecuted: [],
      tenantId: req.user.tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    automationExecutions.push(execution);

    // Start rule execution
    executeAutomationRule(rule, execution);

    logger.info(`Automation rule execution started: ${execution.id}`);
    
    res.json({
      success: true,
      message: 'Automation rule execution started',
      data: { execution }
    });
  } catch (error) {
    logger.error('Error executing automation rule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute automation rule',
      error: error.message
    });
  }
});

// ============================================
// AI DECISION ROUTES
// ============================================

/**
 * @route   POST /api/automation/ai-decisions
 * @desc    Create a new AI decision
 * @access  Private
 */
app.post('/api/automation/ai-decisions', authenticateToken, validateAIDecision, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const aiDecision: AIDecision = {
      id: uuidv4(),
      name: req.body.name,
      description: req.body.description || '',
      model: req.body.model,
      prompt: req.body.prompt,
      inputVariables: req.body.inputVariables || [],
      outputFormat: req.body.outputFormat || 'text',
      confidenceThreshold: req.body.confidenceThreshold || 0.8,
      fallbackAction: req.body.fallbackAction,
      tenantId: req.user.tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    aiDecisions.push(aiDecision);

    logger.info(`AI decision created: ${aiDecision.id}`);
    
    res.status(201).json({
      success: true,
      message: 'AI decision created successfully',
      data: { aiDecision }
    });
  } catch (error) {
    logger.error('Error creating AI decision:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create AI decision'
    });
  }
});

/**
 * @route   POST /api/automation/ai-decisions/:id/execute
 * @desc    Execute an AI decision
 * @access  Private
 */
app.post('/api/automation/ai-decisions/:id/execute', authenticateToken, async (req, res) => {
  try {
    const aiDecision = aiDecisions.find(
      d => d.id === req.params.id && d.tenantId === req.user.tenantId
    );
    
    if (!aiDecision) {
      return res.status(404).json({
        success: false,
        message: 'AI decision not found'
      });
    }

    const { input } = req.body;
    
    if (!input) {
      return res.status(400).json({
        success: false,
        message: 'Input data is required'
      });
    }

    // Execute AI decision
    const result = await executeAIDecision(aiDecision, input);
    
    res.json({
      success: true,
      message: 'AI decision executed successfully',
      data: { result }
    });
  } catch (error) {
    logger.error('Error executing AI decision:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute AI decision',
      error: error.message
    });
  }
});

// ============================================
// ANALYTICS ROUTES
// ============================================

/**
 * @route   GET /api/automation/analytics/dashboard
 * @desc    Get automation analytics dashboard
 * @access  Private
 */
app.get('/api/automation/analytics/dashboard', authenticateToken, async (req, res) => {
  try {
    const tenantWorkflows = workflows.filter(workflow => workflow.tenantId === req.user.tenantId);
    const tenantWorkflowExecutions = workflowExecutions.filter(execution => execution.tenantId === req.user.tenantId);
    const tenantAutomationRules = automationRules.filter(rule => rule.tenantId === req.user.tenantId);
    const tenantAutomationExecutions = automationExecutions.filter(execution => execution.tenantId === req.user.tenantId);
    const tenantAIDecisions = aiDecisions.filter(decision => decision.tenantId === req.user.tenantId);
    const tenantAIDecisionExecutions = aiDecisionExecutions.filter(execution => execution.tenantId === req.user.tenantId);

    // Workflow analytics
    const workflowStats = {
      total: tenantWorkflows.length,
      active: tenantWorkflows.filter(w => w.status === 'active').length,
      paused: tenantWorkflows.filter(w => w.status === 'paused').length,
      draft: tenantWorkflows.filter(w => w.status === 'draft').length,
      archived: tenantWorkflows.filter(w => w.status === 'archived').length,
      byType: {
        'lead-nurturing': tenantWorkflows.filter(w => w.type === 'lead-nurturing').length,
        'customer-onboarding': tenantWorkflows.filter(w => w.type === 'customer-onboarding').length,
        'payment-processing': tenantWorkflows.filter(w => w.type === 'payment-processing').length,
        'support-ticket': tenantWorkflows.filter(w => w.type === 'support-ticket').length,
        'marketing-campaign': tenantWorkflows.filter(w => w.type === 'marketing-campaign').length,
        'data-sync': tenantWorkflows.filter(w => w.type === 'data-sync').length,
        'report-generation': tenantWorkflows.filter(w => w.type === 'report-generation').length,
        'custom': tenantWorkflows.filter(w => w.type === 'custom').length
      },
      totalExecutions: tenantWorkflowExecutions.length,
      successfulExecutions: tenantWorkflowExecutions.filter(e => e.status === 'completed').length,
      failedExecutions: tenantWorkflowExecutions.filter(e => e.status === 'failed').length,
      averageExecutionTime: tenantWorkflowExecutions
        .filter(e => e.duration)
        .reduce((sum, e) => sum + (e.duration || 0), 0) / 
        tenantWorkflowExecutions.filter(e => e.duration).length || 0
    };

    // Automation rules analytics
    const automationStats = {
      total: tenantAutomationRules.length,
      active: tenantAutomationRules.filter(r => r.isActive).length,
      inactive: tenantAutomationRules.filter(r => !r.isActive).length,
      byType: {
        'lead-scoring': tenantAutomationRules.filter(r => r.type === 'lead-scoring').length,
        'email-sequence': tenantAutomationRules.filter(r => r.type === 'email-sequence').length,
        'task-creation': tenantAutomationRules.filter(r => r.type === 'task-creation').length,
        'notification': tenantAutomationRules.filter(r => r.type === 'notification').length,
        'data-sync': tenantAutomationRules.filter(r => r.type === 'data-sync').length,
        'custom': tenantAutomationRules.filter(r => r.type === 'custom').length
      },
      totalExecutions: tenantAutomationExecutions.length,
      successfulExecutions: tenantAutomationExecutions.filter(e => e.status === 'completed').length,
      failedExecutions: tenantAutomationExecutions.filter(e => e.status === 'failed').length,
      averageExecutionTime: tenantAutomationExecutions
        .filter(e => e.duration)
        .reduce((sum, e) => sum + (e.duration || 0), 0) / 
        tenantAutomationExecutions.filter(e => e.duration).length || 0
    };

    // AI decision analytics
    const aiStats = {
      total: tenantAIDecisions.length,
      byModel: {
        'gpt-3.5-turbo': tenantAIDecisions.filter(d => d.model === 'gpt-3.5-turbo').length,
        'gpt-4': tenantAIDecisions.filter(d => d.model === 'gpt-4').length,
        'claude-3': tenantAIDecisions.filter(d => d.model === 'claude-3').length,
        'custom': tenantAIDecisions.filter(d => d.model === 'custom').length
      },
      totalExecutions: tenantAIDecisionExecutions.length,
      successfulExecutions: tenantAIDecisionExecutions.filter(e => e.status === 'success').length,
      failedExecutions: tenantAIDecisionExecutions.filter(e => e.status === 'failure').length,
      lowConfidenceExecutions: tenantAIDecisionExecutions.filter(e => e.status === 'low-confidence').length,
      averageConfidence: tenantAIDecisionExecutions
        .reduce((sum, e) => sum + e.confidence, 0) / 
        tenantAIDecisionExecutions.length || 0,
      averageExecutionTime: tenantAIDecisionExecutions
        .reduce((sum, e) => sum + e.executionTime, 0) / 
        tenantAIDecisionExecutions.length || 0,
      totalTokensUsed: tenantAIDecisionExecutions
        .reduce((sum, e) => sum + e.tokensUsed, 0)
    };

    res.json({
      success: true,
      data: {
        workflows: workflowStats,
        automationRules: automationStats,
        aiDecisions: aiStats,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error fetching automation analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch automation analytics'
    });
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

async function executeWorkflow(workflow: Workflow, execution: WorkflowExecution): Promise<void> {
  try {
    // Update execution status
    const executionIndex = workflowExecutions.findIndex(e => e.id === execution.id);
    if (executionIndex !== -1) {
      workflowExecutions[executionIndex] = {
        ...workflowExecutions[executionIndex],
        status: 'running',
        updatedAt: new Date()
      };
    }

    // Execute workflow steps
    const steps = workflow.steps.sort((a, b) => a.order - b.order);
    let currentStepIndex = 0;

    while (currentStepIndex < steps.length) {
      const step = steps[currentStepIndex];
      
      try {
        // Execute step
        const stepResult = await executeWorkflowStep(step, execution);
        
        // Add log
        const log: WorkflowLog = {
          id: uuidv4(),
          executionId: execution.id,
          stepId: step.id,
          level: 'info',
          message: `Step ${step.name} executed successfully`,
          data: stepResult,
          timestamp: new Date()
        };
        
        if (executionIndex !== -1) {
          workflowExecutions[executionIndex].logs.push(log);
          workflowExecutions[executionIndex].completedSteps.push(step.id);
        }

        // Move to next step
        if (step.nextSteps && step.nextSteps.length > 0) {
          const nextStepId = step.nextSteps[0]; // Simplified: take first next step
          const nextStepIndex = steps.findIndex(s => s.id === nextStepId);
          if (nextStepIndex !== -1) {
            currentStepIndex = nextStepIndex;
          } else {
            break;
          }
        } else {
          currentStepIndex++;
        }
      } catch (error) {
        logger.error(`Error executing step ${step.name}:`, error);
        
        // Add error log
        const errorLog: WorkflowLog = {
          id: uuidv4(),
          executionId: execution.id,
          stepId: step.id,
          level: 'error',
          message: `Step ${step.name} failed: ${error.message}`,
          data: { error: error.message },
          timestamp: new Date()
        };
        
        if (executionIndex !== -1) {
          workflowExecutions[executionIndex].logs.push(errorLog);
          workflowExecutions[executionIndex].failedSteps.push(step.id);
        }

        // Handle error based on step configuration
        if (step.errorHandling.onError === 'stop') {
          break;
        } else if (step.errorHandling.onError === 'retry') {
          // Retry logic would go here
          currentStepIndex++;
        } else if (step.errorHandling.onError === 'skip') {
          currentStepIndex++;
        } else if (step.errorHandling.onError === 'fallback' && step.errorHandling.fallbackStep) {
          const fallbackStepIndex = steps.findIndex(s => s.id === step.errorHandling.fallbackStep);
          if (fallbackStepIndex !== -1) {
            currentStepIndex = fallbackStepIndex;
          } else {
            currentStepIndex++;
          }
        }
      }
    }

    // Complete execution
    if (executionIndex !== -1) {
      const endTime = new Date();
      const duration = endTime.getTime() - execution.startTime.getTime();
      
      workflowExecutions[executionIndex] = {
        ...workflowExecutions[executionIndex],
        status: 'completed',
        endTime,
        duration,
        updatedAt: new Date()
      };
    }

    // Update workflow metrics
    const workflowIndex = workflows.findIndex(w => w.id === workflow.id);
    if (workflowIndex !== -1) {
      workflows[workflowIndex].metrics.totalExecutions++;
      workflows[workflowIndex].metrics.successfulExecutions++;
      workflows[workflowIndex].metrics.lastExecution = new Date();
      workflows[workflowIndex].metrics.lastSuccess = new Date();
      
      if (executionIndex !== -1 && workflowExecutions[executionIndex].duration) {
        const currentAvg = workflows[workflowIndex].metrics.averageExecutionTime;
        const newAvg = (currentAvg + workflowExecutions[executionIndex].duration!) / 2;
        workflows[workflowIndex].metrics.averageExecutionTime = newAvg;
      }
    }

    logger.info(`Workflow execution completed: ${execution.id}`);
  } catch (error) {
    logger.error('Workflow execution failed:', error);
    
    // Update execution status
    const executionIndex = workflowExecutions.findIndex(e => e.id === execution.id);
    if (executionIndex !== -1) {
      const endTime = new Date();
      const duration = endTime.getTime() - execution.startTime.getTime();
      
      workflowExecutions[executionIndex] = {
        ...workflowExecutions[executionIndex],
        status: 'failed',
        endTime,
        duration,
        errorMessage: error.message,
        updatedAt: new Date()
      };
    }

    // Update workflow metrics
    const workflowIndex = workflows.findIndex(w => w.id === workflow.id);
    if (workflowIndex !== -1) {
      workflows[workflowIndex].metrics.totalExecutions++;
      workflows[workflowIndex].metrics.failedExecutions++;
      workflows[workflowIndex].metrics.lastExecution = new Date();
      workflows[workflowIndex].metrics.lastFailure = new Date();
    }
  }
}

async function executeWorkflowStep(step: WorkflowStep, execution: WorkflowExecution): Promise<any> {
  try {
    switch (step.type) {
      case 'action':
        return await executeActionStep(step, execution);
      case 'condition':
        return await executeConditionStep(step, execution);
      case 'delay':
        return await executeDelayStep(step, execution);
      case 'loop':
        return await executeLoopStep(step, execution);
      case 'parallel':
        return await executeParallelStep(step, execution);
      case 'webhook':
        return await executeWebhookStep(step, execution);
      case 'ai-decision':
        return await executeAIDecisionStep(step, execution);
      default:
        throw new Error(`Unsupported step type: ${step.type}`);
    }
  } catch (error) {
    logger.error(`Error executing step ${step.name}:`, error);
    throw error;
  }
}

async function executeActionStep(step: WorkflowStep, execution: WorkflowExecution): Promise<any> {
  // Simulate action execution
  const actionType = step.configuration.actionType;
  
  switch (actionType) {
    case 'send-email':
      return { sent: true, messageId: uuidv4() };
    case 'send-sms':
      return { sent: true, messageId: uuidv4() };
    case 'create-task':
      return { created: true, taskId: uuidv4() };
    case 'update-record':
      return { updated: true, recordId: step.configuration.recordId };
    case 'create-record':
      return { created: true, recordId: uuidv4() };
    default:
      return { executed: true, result: 'Action completed' };
  }
}

async function executeConditionStep(step: WorkflowStep, execution: WorkflowExecution): Promise<any> {
  // Simulate condition evaluation
  const conditions = step.configuration.conditions || [];
  let result = true;
  
  for (const condition of conditions) {
    const fieldValue = execution.variables[condition.field];
    let conditionResult = false;
    
    switch (condition.operator) {
      case 'equals':
        conditionResult = fieldValue === condition.value;
        break;
      case 'not-equals':
        conditionResult = fieldValue !== condition.value;
        break;
      case 'contains':
        conditionResult = fieldValue && fieldValue.includes(condition.value);
        break;
      case 'greater-than':
        conditionResult = fieldValue > condition.value;
        break;
      case 'less-than':
        conditionResult = fieldValue < condition.value;
        break;
      default:
        conditionResult = false;
    }
    
    if (condition.logicalOperator === 'AND') {
      result = result && conditionResult;
    } else if (condition.logicalOperator === 'OR') {
      result = result || conditionResult;
    } else {
      result = conditionResult;
    }
  }
  
  return { conditionMet: result };
}

async function executeDelayStep(step: WorkflowStep, execution: WorkflowExecution): Promise<any> {
  const delayMs = step.configuration.delayMs || 1000;
  await new Promise(resolve => setTimeout(resolve, delayMs));
  return { delayed: true, delayMs };
}

async function executeLoopStep(step: WorkflowStep, execution: WorkflowExecution): Promise<any> {
  const maxIterations = step.configuration.maxIterations || 10;
  const iterations = Math.floor(Math.random() * maxIterations) + 1;
  return { looped: true, iterations };
}

async function executeParallelStep(step: WorkflowStep, execution: WorkflowExecution): Promise<any> {
  const parallelSteps = step.configuration.parallelSteps || [];
  const results = await Promise.all(
    parallelSteps.map(async (parallelStep: any) => {
      return await executeWorkflowStep(parallelStep, execution);
    })
  );
  return { parallel: true, results };
}

async function executeWebhookStep(step: WorkflowStep, execution: WorkflowExecution): Promise<any> {
  const url = step.configuration.url;
  const method = step.configuration.method || 'POST';
  const headers = step.configuration.headers || {};
  const body = step.configuration.body || {};
  
  // Simulate webhook call
  return { 
    webhookCalled: true, 
    url, 
    method, 
    status: 200,
    response: { success: true }
  };
}

async function executeAIDecisionStep(step: WorkflowStep, execution: WorkflowExecution): Promise<any> {
  const aiDecisionId = step.configuration.aiDecisionId;
  const aiDecision = aiDecisions.find(d => d.id === aiDecisionId);
  
  if (!aiDecision) {
    throw new Error(`AI decision not found: ${aiDecisionId}`);
  }
  
  const input = step.configuration.input || execution.variables;
  const result = await executeAIDecision(aiDecision, input);
  
  return { aiDecision: true, result };
}

async function executeAutomationRule(rule: AutomationRule, execution: AutomationExecution): Promise<void> {
  try {
    // Update execution status
    const executionIndex = automationExecutions.findIndex(e => e.id === execution.id);
    if (executionIndex !== -1) {
      automationExecutions[executionIndex] = {
        ...automationExecutions[executionIndex],
        status: 'running',
        updatedAt: new Date()
      };
    }

    // Check conditions
    const conditionsMet = await evaluateConditions(rule.conditions, execution.triggerData);
    
    if (!conditionsMet) {
      // Update execution status
      if (executionIndex !== -1) {
        automationExecutions[executionIndex] = {
          ...automationExecutions[executionIndex],
          status: 'completed',
          endTime: new Date(),
          duration: new Date().getTime() - execution.startTime.getTime(),
          updatedAt: new Date()
        };
      }
      return;
    }

    // Execute actions
    const actions = rule.actions.sort((a, b) => a.order - b.order);
    
    for (const action of actions) {
      try {
        const actionResult = await executeAutomationAction(action, execution.triggerData);
        
        if (executionIndex !== -1) {
          automationExecutions[executionIndex].actionsExecuted.push(action.id);
        }
        
        logger.info(`Automation action executed: ${action.id}`);
      } catch (error) {
        logger.error(`Error executing automation action ${action.id}:`, error);
        // Continue with next action
      }
    }

    // Complete execution
    if (executionIndex !== -1) {
      const endTime = new Date();
      const duration = endTime.getTime() - execution.startTime.getTime();
      
      automationExecutions[executionIndex] = {
        ...automationExecutions[executionIndex],
        status: 'completed',
        endTime,
        duration,
        updatedAt: new Date()
      };
    }

    logger.info(`Automation rule execution completed: ${execution.id}`);
  } catch (error) {
    logger.error('Automation rule execution failed:', error);
    
    // Update execution status
    const executionIndex = automationExecutions.findIndex(e => e.id === execution.id);
    if (executionIndex !== -1) {
      const endTime = new Date();
      const duration = endTime.getTime() - execution.startTime.getTime();
      
      automationExecutions[executionIndex] = {
        ...automationExecutions[executionIndex],
        status: 'failed',
        endTime,
        duration,
        errorMessage: error.message,
        updatedAt: new Date()
      };
    }
  }
}

async function evaluateConditions(conditions: AutomationCondition[], data: Record<string, any>): Promise<boolean> {
  let result = true;
  
  for (const condition of conditions) {
    const fieldValue = data[condition.field];
    let conditionResult = false;
    
    switch (condition.operator) {
      case 'equals':
        conditionResult = fieldValue === condition.value;
        break;
      case 'not-equals':
        conditionResult = fieldValue !== condition.value;
        break;
      case 'contains':
        conditionResult = fieldValue && fieldValue.includes(condition.value);
        break;
      case 'greater-than':
        conditionResult = fieldValue > condition.value;
        break;
      case 'less-than':
        conditionResult = fieldValue < condition.value;
        break;
      default:
        conditionResult = false;
    }
    
    if (condition.logicalOperator === 'AND') {
      result = result && conditionResult;
    } else if (condition.logicalOperator === 'OR') {
      result = result || conditionResult;
    } else {
      result = conditionResult;
    }
  }
  
  return result;
}

async function executeAutomationAction(action: AutomationAction, data: Record<string, any>): Promise<any> {
  switch (action.type) {
    case 'send-email':
      return { sent: true, messageId: uuidv4() };
    case 'send-sms':
      return { sent: true, messageId: uuidv4() };
    case 'send-whatsapp':
      return { sent: true, messageId: uuidv4() };
    case 'create-task':
      return { created: true, taskId: uuidv4() };
    case 'update-record':
      return { updated: true, recordId: action.configuration.recordId };
    case 'create-record':
      return { created: true, recordId: uuidv4() };
    case 'webhook':
      return { webhookCalled: true, url: action.configuration.url };
    case 'ai-action':
      return { aiAction: true, result: 'AI action completed' };
    default:
      return { executed: true, result: 'Action completed' };
  }
}

async function executeAIDecision(aiDecision: AIDecision, input: Record<string, any>): Promise<any> {
  try {
    const startTime = Date.now();
    
    // Simulate AI decision execution
    const prompt = aiDecision.prompt;
    const inputText = Object.entries(input)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    
    const fullPrompt = `${prompt}\n\nInput:\n${inputText}`;
    
    // Simulate AI response
    const output = generateSimulatedAIResponse(aiDecision.outputFormat);
    const confidence = Math.random() * 0.3 + 0.7; // 0.7 to 1.0
    const tokensUsed = Math.floor(Math.random() * 1000) + 100;
    const executionTime = Date.now() - startTime;
    
    const status = confidence >= aiDecision.confidenceThreshold ? 'success' : 'low-confidence';
    
    // Store execution
    const execution: AIDecisionExecution = {
      id: uuidv4(),
      decisionId: aiDecision.id,
      input,
      output,
      confidence,
      model: aiDecision.model,
      tokensUsed,
      executionTime,
      status,
      tenantId: aiDecision.tenantId,
      createdAt: new Date()
    };
    
    aiDecisionExecutions.push(execution);
    
    return {
      output,
      confidence,
      status,
      executionId: execution.id
    };
  } catch (error) {
    logger.error('Error executing AI decision:', error);
    
    // Store failed execution
    const execution: AIDecisionExecution = {
      id: uuidv4(),
      decisionId: aiDecision.id,
      input,
      output: null,
      confidence: 0,
      model: aiDecision.model,
      tokensUsed: 0,
      executionTime: 0,
      status: 'failure',
      errorMessage: error.message,
      tenantId: aiDecision.tenantId,
      createdAt: new Date()
    };
    
    aiDecisionExecutions.push(execution);
    
    throw error;
  }
}

function generateSimulatedAIResponse(outputFormat: string): any {
  switch (outputFormat) {
    case 'boolean':
      return Math.random() > 0.5;
    case 'number':
      return Math.floor(Math.random() * 100);
    case 'json':
      return { result: 'success', value: Math.random() };
    case 'text':
    default:
      return 'AI decision completed successfully';
  }
}

// ============================================
// CRON JOBS
// ============================================

// Execute scheduled workflows
cron.schedule('*/5 * * * *', async () => {
  logger.info('Checking for scheduled workflows...');
  
  const scheduledWorkflows = workflows.filter(workflow => 
    workflow.status === 'active' && 
    workflow.trigger.type === 'schedule' &&
    workflow.tenantId === 'default' // In production, check all tenants
  );
  
  for (const workflow of scheduledWorkflows) {
    // Check if it's time to execute
    const now = new Date();
    const lastExecution = workflow.metrics.lastExecution || new Date(0);
    const scheduleInterval = workflow.trigger.configuration.interval || 3600000; // 1 hour default
    const timeSinceLastExecution = now.getTime() - lastExecution.getTime();
    
    if (timeSinceLastExecution >= scheduleInterval) {
      logger.info(`Executing scheduled workflow: ${workflow.id}`);
      
      // Create and execute workflow
      const execution: WorkflowExecution = {
        id: uuidv4(),
        workflowId: workflow.id,
        status: 'pending',
        triggerData: { scheduled: true, timestamp: now.toISOString() },
        variables: {},
        completedSteps: [],
        failedSteps: [],
        startTime: now,
        logs: [],
        tenantId: workflow.tenantId,
        createdAt: now,
        updatedAt: now
      };
      
      workflowExecutions.push(execution);
      executeWorkflow(workflow, execution);
    }
  }
});

// Execute automation rules
cron.schedule('*/2 * * * *', async () => {
  logger.info('Checking for automation rules...');
  
  const activeRules = automationRules.filter(rule => 
    rule.isActive && 
    rule.tenantId === 'default' // In production, check all tenants
  );
  
  for (const rule of activeRules) {
    // Simulate rule evaluation
    const shouldExecute = Math.random() > 0.8; // 20% chance
    
    if (shouldExecute) {
      logger.info(`Executing automation rule: ${rule.id}`);
      
      // Create and execute rule
      const execution: AutomationExecution = {
        id: uuidv4(),
        ruleId: rule.id,
        triggerData: { 
          event: 'scheduled-check',
          timestamp: new Date().toISOString()
        },
        status: 'pending',
        startTime: new Date(),
        actionsExecuted: [],
        tenantId: rule.tenantId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      automationExecutions.push(execution);
      executeAutomationRule(rule, execution);
    }
  }
});

// Clean up old data daily
cron.schedule('0 5 * * *', async () => {
  logger.info('Cleaning up old automation data...');
  
  const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
  
  // Clean up old executions
  const initialExecutionsCount = workflowExecutions.length;
  const filteredExecutions = workflowExecutions.filter(execution => execution.createdAt > cutoffDate);
  workflowExecutions.length = 0;
  workflowExecutions.push(...filteredExecutions);
  
  // Clean up old automation executions
  const initialAutomationExecutionsCount = automationExecutions.length;
  const filteredAutomationExecutions = automationExecutions.filter(execution => execution.createdAt > cutoffDate);
  automationExecutions.length = 0;
  automationExecutions.push(...filteredAutomationExecutions);
  
  // Clean up old AI decision executions
  const initialAIDecisionExecutionsCount = aiDecisionExecutions.length;
  const filteredAIDecisionExecutions = aiDecisionExecutions.filter(execution => execution.createdAt > cutoffDate);
  aiDecisionExecutions.length = 0;
  aiDecisionExecutions.push(...filteredAIDecisionExecutions);
  
  logger.info(`Cleaned up ${initialExecutionsCount - workflowExecutions.length} old workflow executions`);
  logger.info(`Cleaned up ${initialAutomationExecutionsCount - automationExecutions.length} old automation executions`);
  logger.info(`Cleaned up ${initialAIDecisionExecutionsCount - aiDecisionExecutions.length} old AI decision executions`);
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
const PORT = process.env.PORT || 3013;

const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 Automation Service running on port ${PORT}`);
      logger.info(`🔄 Workflow Management: Active`);
      logger.info(`⚡ Automation Rules: Active`);
      logger.info(`🤖 AI Decisions: Active`);
      logger.info(`📊 Analytics Dashboard: Active`);
      logger.info(`⏰ Scheduled Execution: Active`);
      logger.info(`🔧 Error Handling: Active`);
      logger.info(`📝 Logging: Active`);
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
