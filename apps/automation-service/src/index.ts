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
import { evaluate } from 'mathjs';
import { natural } from 'natural';
import { compromise } from 'compromise';
import { logger as winstonLogger } from 'winston';

const app = express();
const PORT = process.env.PORT || 3009;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/automationdb';
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Configuration
const AUTOMATION_CONFIG = {
  MAX_WORKFLOWS_PER_TENANT: 100,
  MAX_STEPS_PER_WORKFLOW: 50,
  MAX_CONCURRENT_EXECUTIONS: 20,
  MAX_EXECUTION_TIME: 30 * 60 * 1000, // 30 minutes
  RETENTION_DAYS: 90,
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: 100,
  MAX_RULE_CONDITIONS: 20,
  MAX_AI_DECISIONS_PER_HOUR: 1000,
  MAX_SCHEDULED_TASKS: 50
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
  windowMs: AUTOMATION_CONFIG.RATE_LIMIT_WINDOW,
  max: AUTOMATION_CONFIG.RATE_LIMIT_MAX,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const workflowLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // More restrictive for workflow operations
  message: "Too many workflow requests, please try again later.",
});

const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Very restrictive for AI decisions
  message: "Too many AI decision requests, please try again later.",
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

const automationQueue = new Queue('automationQueue', { connection });
const aiDecisionQueue = new Queue('aiDecisionQueue', { connection });
const scheduledTaskQueue = new Queue('scheduledTaskQueue', { connection });

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
const WorkflowSchema = new mongoose.Schema({
  workflowId: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v: string) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'Workflow ID must be a valid UUID'
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
      message: 'Workflow name must be between 2 and 200 characters'
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
  category: { 
    type: String, 
    required: true,
    enum: ['business', 'operational', 'marketing', 'customer-service', 'data-processing', 'notification', 'integration'],
    validate: {
      validator: function(v: string) {
        return v && v.length >= 2 && v.length <= 50;
      },
      message: 'Category must be between 2 and 50 characters'
    }
  },
  trigger: {
    type: { 
      type: String, 
      required: true,
      enum: ['event', 'schedule', 'manual', 'webhook', 'api', 'condition'],
      validate: {
        validator: function(v: string) {
          return v && v.length >= 2 && v.length <= 50;
        },
        message: 'Trigger type must be between 2 and 50 characters'
      }
    },
    event: { 
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || v.length <= 100;
        },
        message: 'Event must be less than 100 characters'
      }
    },
    schedule: {
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
    conditions: [{
      field: { 
        type: String, 
        required: true,
        validate: {
          validator: function(v: string) {
            return v && v.length >= 2 && v.length <= 100;
          },
          message: 'Condition field must be between 2 and 100 characters'
        }
      },
      operator: { 
        type: String, 
        required: true,
        enum: ['equals', 'not-equals', 'greater-than', 'less-than', 'contains', 'not-contains', 'exists', 'not-exists'],
        validate: {
          validator: function(v: string) {
            return v && v.length >= 2 && v.length <= 50;
          },
          message: 'Operator must be between 2 and 50 characters'
        }
      },
      value: mongoose.Schema.Types.Mixed,
      logicalOperator: { 
        type: String, 
        enum: ['and', 'or'], 
        default: 'and' 
      }
    }],
    webhook: {
      url: { 
        type: String,
        validate: {
          validator: function(v: string) {
            return !v || /^https?:\/\/.+/.test(v);
          },
          message: 'Invalid webhook URL'
        }
      },
      method: { 
        type: String, 
        enum: ['GET', 'POST', 'PUT', 'DELETE'], 
        default: 'POST' 
      },
      headers: mongoose.Schema.Types.Mixed,
      authentication: mongoose.Schema.Types.Mixed
    }
  },
  steps: [{
    stepId: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v: string) {
          return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
        },
        message: 'Step ID must be a valid UUID'
      }
    },
    name: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v: string) {
          return v && v.length >= 2 && v.length <= 200;
        },
        message: 'Step name must be between 2 and 200 characters'
      }
    },
    type: { 
      type: String, 
      required: true,
      enum: ['action', 'condition', 'loop', 'delay', 'webhook', 'api-call', 'data-transform', 'notification', 'ai-decision'],
      validate: {
        validator: function(v: string) {
          return v && v.length >= 2 && v.length <= 50;
        },
        message: 'Step type must be between 2 and 50 characters'
      }
    },
    configuration: mongoose.Schema.Types.Mixed,
    onSuccess: { 
      type: String, 
      enum: ['next', 'end', 'error', 'retry'], 
      default: 'next' 
    },
    onError: { 
      type: String, 
      enum: ['next', 'end', 'retry', 'skip'], 
      default: 'error' 
    },
    retryCount: { type: Number, min: 0, max: 5, default: 0 },
    retryDelay: { type: Number, min: 1000, max: 300000, default: 5000 }, // milliseconds
    timeout: { type: Number, min: 1000, max: 300000, default: 30000 }, // milliseconds
    isEnabled: { type: Boolean, default: true },
    order: { type: Number, required: true, min: 0 }
  }],
  variables: mongoose.Schema.Types.Mixed,
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'paused', 'draft'], 
    default: 'draft' 
  },
  version: { type: Number, default: 1 },
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
    execute: [{ type: String }],
    delete: [{ type: String }]
  },
  statistics: {
    totalExecutions: { type: Number, default: 0 },
    successfulExecutions: { type: Number, default: 0 },
    failedExecutions: { type: Number, default: 0 },
    averageExecutionTime: { type: Number, default: 0 },
    lastExecution: Date,
    lastSuccessfulExecution: Date,
    lastFailedExecution: Date
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes
WorkflowSchema.index({ workflowId: 1 }, { unique: true });
WorkflowSchema.index({ tenantId: 1, createdAt: -1 });
WorkflowSchema.index({ tenantId: 1, category: 1 });
WorkflowSchema.index({ tenantId: 1, status: 1 });
WorkflowSchema.index({ 'trigger.type': 1 });
WorkflowSchema.index({ createdAt: 1 }, { expireAfterSeconds: AUTOMATION_CONFIG.RETENTION_DAYS * 24 * 60 * 60 });

const Workflow = mongoose.model('Workflow', WorkflowSchema);

const AutomationRuleSchema = new mongoose.Schema({
  ruleId: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v: string) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'Rule ID must be a valid UUID'
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
      message: 'Rule name must be between 2 and 200 characters'
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
  conditions: [{
    conditionId: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v: string) {
          return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
        },
        message: 'Condition ID must be a valid UUID'
      }
    },
    field: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v: string) {
          return v && v.length >= 2 && v.length <= 100;
        },
        message: 'Condition field must be between 2 and 100 characters'
      }
    },
    operator: { 
      type: String, 
      required: true,
      enum: ['equals', 'not-equals', 'greater-than', 'less-than', 'contains', 'not-contains', 'exists', 'not-exists', 'regex', 'in', 'not-in'],
      validate: {
        validator: function(v: string) {
          return v && v.length >= 2 && v.length <= 50;
        },
        message: 'Operator must be between 2 and 50 characters'
      }
    },
    value: mongoose.Schema.Types.Mixed,
    logicalOperator: { 
      type: String, 
      enum: ['and', 'or'], 
      default: 'and' 
    },
    isEnabled: { type: Boolean, default: true }
  }],
  actions: [{
    actionId: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v: string) {
          return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
        },
        message: 'Action ID must be a valid UUID'
      }
    },
    type: { 
      type: String, 
      required: true,
      enum: ['workflow', 'notification', 'webhook', 'api-call', 'data-update', 'email', 'sms', 'ai-decision'],
      validate: {
        validator: function(v: string) {
          return v && v.length >= 2 && v.length <= 50;
        },
        message: 'Action type must be between 2 and 50 characters'
      }
    },
    configuration: mongoose.Schema.Types.Mixed,
    delay: { type: Number, min: 0, max: 3600000, default: 0 }, // milliseconds
    isEnabled: { type: Boolean, default: true }
  }],
  priority: { type: Number, min: 1, max: 10, default: 5 },
  isEnabled: { type: Boolean, default: true },
  tags: [{
    type: String,
    validate: {
      validator: function(v: string) {
        return v && v.length >= 2 && v.length <= 50;
      },
      message: 'Tag must be between 2 and 50 characters'
    }
  }],
  statistics: {
    totalTriggers: { type: Number, default: 0 },
    successfulTriggers: { type: Number, default: 0 },
    failedTriggers: { type: Number, default: 0 },
    lastTrigger: Date,
    lastSuccessfulTrigger: Date,
    lastFailedTrigger: Date
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes
AutomationRuleSchema.index({ ruleId: 1 }, { unique: true });
AutomationRuleSchema.index({ tenantId: 1, createdAt: -1 });
AutomationRuleSchema.index({ tenantId: 1, isEnabled: 1 });
AutomationRuleSchema.index({ priority: 1 });
AutomationRuleSchema.index({ createdAt: 1 }, { expireAfterSeconds: AUTOMATION_CONFIG.RETENTION_DAYS * 24 * 60 * 60 });

const AutomationRule = mongoose.model('AutomationRule', AutomationRuleSchema);

const WorkflowExecutionSchema = new mongoose.Schema({
  executionId: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v: string) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'Execution ID must be a valid UUID'
    }
  },
  workflowId: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'Workflow ID must be a valid UUID'
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
  triggerType: { 
    type: String, 
    required: true,
    enum: ['event', 'schedule', 'manual', 'webhook', 'api', 'condition'],
    validate: {
      validator: function(v: string) {
        return v && v.length >= 2 && v.length <= 50;
      },
      message: 'Trigger type must be between 2 and 50 characters'
    }
  },
  triggerData: mongoose.Schema.Types.Mixed,
  status: { 
    type: String, 
    enum: ['running', 'completed', 'failed', 'cancelled', 'paused'], 
    required: true 
  },
  startedAt: { type: Date, default: Date.now },
  completedAt: Date,
  duration: { type: Number, min: 0 },
  currentStep: { type: Number, default: 0 },
  totalSteps: { type: Number, required: true },
  stepExecutions: [{
    stepId: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v: string) {
          return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
        },
        message: 'Step ID must be a valid UUID'
      }
    },
    stepName: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v: string) {
          return v && v.length >= 2 && v.length <= 200;
        },
        message: 'Step name must be between 2 and 200 characters'
      }
    },
    status: { 
      type: String, 
      enum: ['pending', 'running', 'completed', 'failed', 'skipped'], 
      required: true 
    },
    startedAt: Date,
    completedAt: Date,
    duration: { type: Number, min: 0 },
    input: mongoose.Schema.Types.Mixed,
    output: mongoose.Schema.Types.Mixed,
    error: String,
    retryCount: { type: Number, default: 0 }
  }],
  variables: mongoose.Schema.Types.Mixed,
  error: String,
  retryCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes
WorkflowExecutionSchema.index({ executionId: 1 }, { unique: true });
WorkflowExecutionSchema.index({ workflowId: 1, createdAt: -1 });
WorkflowExecutionSchema.index({ tenantId: 1, createdAt: -1 });
WorkflowExecutionSchema.index({ tenantId: 1, status: 1 });
WorkflowExecutionSchema.index({ createdAt: 1 }, { expireAfterSeconds: AUTOMATION_CONFIG.RETENTION_DAYS * 24 * 60 * 60 });

const WorkflowExecution = mongoose.model('WorkflowExecution', WorkflowExecutionSchema);

// Enhanced validation schemas
const workflowSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  description: Joi.string().max(1000).optional(),
  category: Joi.string().valid('business', 'operational', 'marketing', 'customer-service', 'data-processing', 'notification', 'integration').required(),
  trigger: Joi.object({
    type: Joi.string().valid('event', 'schedule', 'manual', 'webhook', 'api', 'condition').required(),
    event: Joi.string().max(100).optional(),
    schedule: Joi.object({
      cron: Joi.string().pattern(/^(\*|([0-5]?\d)) (\*|([0-5]?\d)) (\*|([0-5]?\d)) (\*|([0-5]?\d)) (\*|([0-5]?\d))$/).optional(),
      timezone: Joi.string().default('UTC')
    }).optional(),
    conditions: Joi.array().items(Joi.object({
      field: Joi.string().min(2).max(100).required(),
      operator: Joi.string().valid('equals', 'not-equals', 'greater-than', 'less-than', 'contains', 'not-contains', 'exists', 'not-exists').required(),
      value: Joi.any().optional(),
      logicalOperator: Joi.string().valid('and', 'or').default('and')
    })).optional(),
    webhook: Joi.object({
      url: Joi.string().uri().optional(),
      method: Joi.string().valid('GET', 'POST', 'PUT', 'DELETE').default('POST'),
      headers: Joi.object().optional(),
      authentication: Joi.object().optional()
    }).optional()
  }).required(),
  steps: Joi.array().items(Joi.object({
    name: Joi.string().min(2).max(200).required(),
    type: Joi.string().valid('action', 'condition', 'loop', 'delay', 'webhook', 'api-call', 'data-transform', 'notification', 'ai-decision').required(),
    configuration: Joi.object().optional(),
    onSuccess: Joi.string().valid('next', 'end', 'error', 'retry').default('next'),
    onError: Joi.string().valid('next', 'end', 'retry', 'skip').default('error'),
    retryCount: Joi.number().min(0).max(5).default(0),
    retryDelay: Joi.number().min(1000).max(300000).default(5000),
    timeout: Joi.number().min(1000).max(300000).default(30000),
    isEnabled: Joi.boolean().default(true),
    order: Joi.number().min(0).required()
  })).optional(),
  variables: Joi.object().optional(),
  tags: Joi.array().items(Joi.string().min(2).max(50)).optional()
});

const automationRuleSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  description: Joi.string().max(1000).optional(),
  conditions: Joi.array().items(Joi.object({
    field: Joi.string().min(2).max(100).required(),
    operator: Joi.string().valid('equals', 'not-equals', 'greater-than', 'less-than', 'contains', 'not-contains', 'exists', 'not-exists', 'regex', 'in', 'not-in').required(),
    value: Joi.any().optional(),
    logicalOperator: Joi.string().valid('and', 'or').default('and'),
    isEnabled: Joi.boolean().default(true)
  })).required(),
  actions: Joi.array().items(Joi.object({
    type: Joi.string().valid('workflow', 'notification', 'webhook', 'api-call', 'data-update', 'email', 'sms', 'ai-decision').required(),
    configuration: Joi.object().optional(),
    delay: Joi.number().min(0).max(3600000).default(0),
    isEnabled: Joi.boolean().default(true)
  })).required(),
  priority: Joi.number().min(1).max(10).default(5),
  isEnabled: Joi.boolean().default(true),
  tags: Joi.array().items(Joi.string().min(2).max(50)).optional()
});

// Enhanced Automation Manager with comprehensive workflow automation
class AutomationManager {
  private activeExecutions: Map<string, any> = new Map();
  private aiDecisionCache: Map<string, any> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.initializeAutomation();
  }

  private async initializeAutomation(): Promise<void> {
    try {
      // Start workers
      this.startWorkflowWorker();
      this.startAIDecisionWorker();
      this.startScheduledTaskWorker();
      
      // Start scheduled task scheduler
      this.startScheduledTaskScheduler();
      
      logger.info('Automation Manager initialized successfully');
    } catch (error: any) {
      logger.error('Error initializing Automation Manager:', error);
      throw new Error(`Automation initialization failed: ${error.message}`);
    }
  }

  // Enhanced workflow execution
  async executeWorkflow(workflow: any, triggerData: any = {}): Promise<any> {
    try {
      if (!workflow || !workflow.steps) {
        throw new Error('Valid workflow with steps is required');
      }

      const executionId = uuidv4();
      const startTime = Date.now();
      
      // Check concurrent execution limit
      if (this.activeExecutions.size >= AUTOMATION_CONFIG.MAX_CONCURRENT_EXECUTIONS) {
        throw new Error('Maximum concurrent executions reached');
      }

      const execution = new WorkflowExecution({
        executionId,
        workflowId: workflow.workflowId,
        tenantId: workflow.tenantId,
        triggerType: workflow.trigger.type,
        triggerData,
        status: 'running',
        startedAt: new Date(),
        totalSteps: workflow.steps.length,
        currentStep: 0,
        variables: { ...workflow.variables, ...triggerData }
      });

      this.activeExecutions.set(executionId, execution);
      
      try {
        // Execute workflow steps
        for (let i = 0; i < workflow.steps.length; i++) {
          const step = workflow.steps[i];
          if (!step.isEnabled) continue;

          execution.currentStep = i;
          execution.stepExecutions.push({
            stepId: step.stepId,
            stepName: step.name,
            status: 'running',
            startedAt: new Date(),
            input: execution.variables,
            retryCount: 0
          });

          try {
            const stepResult = await this.executeStep(step, execution.variables, executionId);
            
            const stepExecution = execution.stepExecutions[execution.stepExecutions.length - 1];
            stepExecution.status = 'completed';
            stepExecution.completedAt = new Date();
            stepExecution.duration = Date.now() - stepExecution.startedAt.getTime();
            stepExecution.output = stepResult;
            
            // Update variables with step output
            execution.variables = { ...execution.variables, ...stepResult };
            
            // Handle step success
            if (step.onSuccess === 'end') {
              execution.status = 'completed';
              break;
            } else if (step.onSuccess === 'error') {
              execution.status = 'failed';
              execution.error = 'Step marked as error on success';
              break;
            }
            
          } catch (stepError: any) {
            const stepExecution = execution.stepExecutions[execution.stepExecutions.length - 1];
            stepExecution.status = 'failed';
            stepExecution.completedAt = new Date();
            stepExecution.duration = Date.now() - stepExecution.startedAt.getTime();
            stepExecution.error = stepError.message;
            
            // Handle step error
            if (step.onError === 'end') {
              execution.status = 'failed';
              execution.error = stepError.message;
              break;
            } else if (step.onError === 'retry' && stepExecution.retryCount < step.retryCount) {
              stepExecution.retryCount++;
              stepExecution.status = 'running';
              stepExecution.startedAt = new Date();
              stepExecution.error = null;
              
              // Wait before retry
              await new Promise(resolve => setTimeout(resolve, step.retryDelay));
              i--; // Retry current step
              continue;
            } else if (step.onError === 'skip') {
              stepExecution.status = 'skipped';
              continue;
            } else {
              execution.status = 'failed';
              execution.error = stepError.message;
              break;
            }
          }
        }

        if (execution.status === 'running') {
          execution.status = 'completed';
        }

      } finally {
        execution.completedAt = new Date();
        execution.duration = Date.now() - startTime;
        this.activeExecutions.delete(executionId);
        
        await execution.save();
        
        // Update workflow statistics
        await this.updateWorkflowStatistics(workflow.workflowId, execution);
      }

      return execution;

    } catch (error: any) {
      logger.error('Workflow execution failed:', error);
      throw new Error(`Workflow execution failed: ${error.message}`);
    }
  }

  // Enhanced step execution
  private async executeStep(step: any, variables: any, executionId: string): Promise<any> {
    try {
      switch (step.type) {
        case 'action':
          return await this.executeActionStep(step, variables);
        case 'condition':
          return await this.executeConditionStep(step, variables);
        case 'loop':
          return await this.executeLoopStep(step, variables);
        case 'delay':
          return await this.executeDelayStep(step, variables);
        case 'webhook':
          return await this.executeWebhookStep(step, variables);
        case 'api-call':
          return await this.executeApiCallStep(step, variables);
        case 'data-transform':
          return await this.executeDataTransformStep(step, variables);
        case 'notification':
          return await this.executeNotificationStep(step, variables);
        case 'ai-decision':
          return await this.executeAIDecisionStep(step, variables);
        default:
          throw new Error(`Unsupported step type: ${step.type}`);
      }
    } catch (error: any) {
      logger.error(`Step execution failed for ${step.name}:`, error);
      throw error;
    }
  }

  // Step execution methods
  private async executeActionStep(step: any, variables: any): Promise<any> {
    const action = step.configuration?.action || 'log';
    const message = this.interpolateVariables(step.configuration?.message || 'Action executed', variables);
    
    logger.info(`Action executed: ${action} - ${message}`);
    
    return { action, message, timestamp: new Date() };
  }

  private async executeConditionStep(step: any, variables: any): Promise<any> {
    const conditions = step.configuration?.conditions || [];
    let result = true;
    
    for (const condition of conditions) {
      const fieldValue = this.getNestedValue(variables, condition.field);
      const conditionResult = this.evaluateCondition(fieldValue, condition.operator, condition.value);
      
      if (condition.logicalOperator === 'and') {
        result = result && conditionResult;
      } else {
        result = result || conditionResult;
      }
    }
    
    return { conditionResult: result, evaluatedAt: new Date() };
  }

  private async executeLoopStep(step: any, variables: any): Promise<any> {
    const items = this.getNestedValue(variables, step.configuration?.itemsField || 'items');
    const results = [];
    
    if (Array.isArray(items)) {
      for (const item of items) {
        const loopVariables = { ...variables, item };
        const loopResult = await this.executeActionStep(step, loopVariables);
        results.push(loopResult);
      }
    }
    
    return { loopResults: results, itemCount: results.length };
  }

  private async executeDelayStep(step: any, variables: any): Promise<any> {
    const delay = step.configuration?.delay || 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return { delay, delayedAt: new Date() };
  }

  private async executeWebhookStep(step: any, variables: any): Promise<any> {
    const url = this.interpolateVariables(step.configuration?.url, variables);
    const method = step.configuration?.method || 'POST';
    const headers = step.configuration?.headers || {};
    const data = this.interpolateVariables(step.configuration?.data, variables);
    
    const response = await axios({
      method,
      url,
      headers,
      data,
      timeout: step.timeout || 30000
    });
    
    return { 
      status: response.status, 
      data: response.data, 
      url, 
      method,
      executedAt: new Date()
    };
  }

  private async executeApiCallStep(step: any, variables: any): Promise<any> {
    const endpoint = this.interpolateVariables(step.configuration?.endpoint, variables);
    const method = step.configuration?.method || 'GET';
    const headers = step.configuration?.headers || {};
    const data = this.interpolateVariables(step.configuration?.data, variables);
    
    const response = await axios({
      method,
      url: endpoint,
      headers,
      data,
      timeout: step.timeout || 30000
    });
    
    return { 
      status: response.status, 
      data: response.data, 
      endpoint, 
      method,
      executedAt: new Date()
    };
  }

  private async executeDataTransformStep(step: any, variables: any): Promise<any> {
    const inputField = step.configuration?.inputField || 'data';
    const outputField = step.configuration?.outputField || 'transformedData';
    const transformation = step.configuration?.transformation || 'identity';
    
    const inputData = this.getNestedValue(variables, inputField);
    let outputData = inputData;
    
    switch (transformation) {
      case 'uppercase':
        outputData = typeof inputData === 'string' ? inputData.toUpperCase() : inputData;
        break;
      case 'lowercase':
        outputData = typeof inputData === 'string' ? inputData.toLowerCase() : inputData;
        break;
      case 'json-parse':
        outputData = typeof inputData === 'string' ? JSON.parse(inputData) : inputData;
        break;
      case 'json-stringify':
        outputData = JSON.stringify(inputData);
        break;
      case 'math-eval':
        outputData = evaluate(inputData);
        break;
      default:
        outputData = inputData;
    }
    
    return { 
      inputField, 
      outputField, 
      transformation, 
      inputData, 
      outputData,
      transformedAt: new Date()
    };
  }

  private async executeNotificationStep(step: any, variables: any): Promise<any> {
    const type = step.configuration?.type || 'email';
    const recipient = this.interpolateVariables(step.configuration?.recipient, variables);
    const subject = this.interpolateVariables(step.configuration?.subject, variables);
    const message = this.interpolateVariables(step.configuration?.message, variables);
    
    // Simulate notification sending
    logger.info(`Notification sent: ${type} to ${recipient} - ${subject}`);
    
    return { 
      type, 
      recipient, 
      subject, 
      message, 
      sentAt: new Date(),
      status: 'sent'
    };
  }

  private async executeAIDecisionStep(step: any, variables: any): Promise<any> {
    const prompt = this.interpolateVariables(step.configuration?.prompt, variables);
    const context = this.interpolateVariables(step.configuration?.context, variables);
    const options = step.configuration?.options || ['yes', 'no'];
    
    // Check cache first
    const cacheKey = `ai-decision-${Buffer.from(prompt + JSON.stringify(context)).toString('base64')}`;
    const cached = this.aiDecisionCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.decision;
    }
    
    // Simulate AI decision (in real implementation, this would call an AI service)
    const decision = options[Math.floor(Math.random() * options.length)];
    const confidence = Math.random() * 0.4 + 0.6; // 60-100% confidence
    
    const result = {
      decision,
      confidence,
      options,
      prompt,
      context,
      decidedAt: new Date()
    };
    
    // Cache the result
    this.aiDecisionCache.set(cacheKey, {
      decision: result,
      timestamp: Date.now()
    });
    
    return result;
  }

  // Helper methods
  private interpolateVariables(text: string, variables: any): string {
    if (!text || typeof text !== 'string') return text;
    
    return text.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
      const value = this.getNestedValue(variables, path);
      return value !== undefined ? String(value) : match;
    });
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private evaluateCondition(value: any, operator: string, expectedValue: any): boolean {
    switch (operator) {
      case 'equals':
        return value === expectedValue;
      case 'not-equals':
        return value !== expectedValue;
      case 'greater-than':
        return Number(value) > Number(expectedValue);
      case 'less-than':
        return Number(value) < Number(expectedValue);
      case 'contains':
        return String(value).includes(String(expectedValue));
      case 'not-contains':
        return !String(value).includes(String(expectedValue));
      case 'exists':
        return value !== undefined && value !== null;
      case 'not-exists':
        return value === undefined || value === null;
      case 'regex':
        return new RegExp(expectedValue).test(String(value));
      case 'in':
        return Array.isArray(expectedValue) && expectedValue.includes(value);
      case 'not-in':
        return Array.isArray(expectedValue) && !expectedValue.includes(value);
      default:
        return false;
    }
  }

  private async updateWorkflowStatistics(workflowId: string, execution: any): Promise<void> {
    try {
      await Workflow.updateOne(
        { workflowId },
        {
          $inc: {
            'statistics.totalExecutions': 1,
            'statistics.successfulExecutions': execution.status === 'completed' ? 1 : 0,
            'statistics.failedExecutions': execution.status === 'failed' ? 1 : 0
          },
          $set: {
            'statistics.lastExecution': execution.completedAt,
            'statistics.lastSuccessfulExecution': execution.status === 'completed' ? execution.completedAt : undefined,
            'statistics.lastFailedExecution': execution.status === 'failed' ? execution.completedAt : undefined
          }
        }
      );
    } catch (error: any) {
      logger.error('Error updating workflow statistics:', error);
    }
  }

  // Worker methods
  private startWorkflowWorker(): void {
    const worker = new Worker('automationQueue', async (job: Job) => {
      const { workflowId, triggerData } = job.data;
      
      try {
        const workflow = await Workflow.findOne({ workflowId });
        if (!workflow) {
          throw new Error('Workflow not found');
        }
        
        const execution = await this.executeWorkflow(workflow, triggerData);
        return execution;
      } catch (error: any) {
        logger.error('Workflow worker error:', error);
        throw error;
      }
    }, { connection });
    
    worker.on('completed', (job) => {
      logger.info(`Workflow job completed: ${job.id}`);
    });
    
    worker.on('failed', (job, err) => {
      logger.error(`Workflow job failed: ${job.id}`, err);
    });
  }

  private startAIDecisionWorker(): void {
    const worker = new Worker('aiDecisionQueue', async (job: Job) => {
      const { prompt, context, options } = job.data;
      
      try {
        // Simulate AI decision processing
        const decision = options[Math.floor(Math.random() * options.length)];
        const confidence = Math.random() * 0.4 + 0.6;
        
        return { decision, confidence, processedAt: new Date() };
      } catch (error: any) {
        logger.error('AI decision worker error:', error);
        throw error;
      }
    }, { connection });
    
    worker.on('completed', (job) => {
      logger.info(`AI decision job completed: ${job.id}`);
    });
    
    worker.on('failed', (job, err) => {
      logger.error(`AI decision job failed: ${job.id}`, err);
    });
  }

  private startScheduledTaskWorker(): void {
    const worker = new Worker('scheduledTaskQueue', async (job: Job) => {
      const { taskId, taskData } = job.data;
      
      try {
        // Process scheduled task
        logger.info(`Processing scheduled task: ${taskId}`);
        return { taskId, processedAt: new Date() };
      } catch (error: any) {
        logger.error('Scheduled task worker error:', error);
        throw error;
      }
    }, { connection });
    
    worker.on('completed', (job) => {
      logger.info(`Scheduled task job completed: ${job.id}`);
    });
    
    worker.on('failed', (job, err) => {
      logger.error(`Scheduled task job failed: ${job.id}`, err);
    });
  }

  private startScheduledTaskScheduler(): void {
    // Check for scheduled workflows every minute
    cron.schedule('* * * * *', async () => {
      try {
        const scheduledWorkflows = await Workflow.find({
          'trigger.type': 'schedule',
          'trigger.schedule.enabled': true,
          status: 'active'
        });
        
        for (const workflow of scheduledWorkflows) {
          const cronExpression = workflow.trigger.schedule.cron;
          const now = new Date();
          
          // Simple cron check (in production, use a proper cron library)
          if (this.shouldExecuteCron(cronExpression, now)) {
            await automationQueue.add('executeWorkflow', {
              workflowId: workflow.workflowId,
              triggerData: { scheduledAt: now }
            });
          }
        }
      } catch (error: any) {
        logger.error('Scheduled task scheduler error:', error);
      }
    });
  }

  private shouldExecuteCron(cronExpression: string, date: Date): boolean {
    // Simplified cron check - in production, use a proper cron library
    const [minute, hour, day, month, weekday] = cronExpression.split(' ');
    const nowMinute = date.getMinutes();
    const nowHour = date.getHours();
    
    return (minute === '*' || parseInt(minute) === nowMinute) &&
           (hour === '*' || parseInt(hour) === nowHour);
  }

  // Clear caches
  clearCaches(): void {
    this.aiDecisionCache.clear();
  }

  // Get statistics
  getStatistics(): { activeExecutions: number; cacheSize: number } {
    return {
      activeExecutions: this.activeExecutions.size,
      cacheSize: this.aiDecisionCache.size
    };
  }
}

const automationManager = new AutomationManager();

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
    status: 'Automation Service is healthy', 
    uptime: process.uptime(),
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      queue: automationQueue.name,
      aiQueue: aiDecisionQueue.name,
      scheduledQueue: scheduledTaskQueue.name,
      workflows: 'active',
      automationRules: 'active',
      executions: 'active',
      aiDecisions: 'active',
      scheduledTasks: 'active'
    },
    statistics: automationManager.getStatistics()
  });
});

// Workflow endpoints
app.post('/workflows', 
  workflowLimiter,
  validateRequest(workflowSchema), 
  async (req, res) => {
    try {
      const workflowData = req.validatedData;
      
      const workflow = new Workflow({
        workflowId: uuidv4(),
        tenantId: req.headers['x-tenant-id'] || 'default',
        name: workflowData.name,
        description: workflowData.description,
        category: workflowData.category,
        trigger: workflowData.trigger,
        steps: workflowData.steps?.map((step: any) => ({
          stepId: uuidv4(),
          ...step
        })) || [],
        variables: workflowData.variables || {},
        status: 'draft',
        tags: workflowData.tags || [],
        permissions: {
          view: [req.headers['x-user-id'] || 'anonymous'],
          edit: [req.headers['x-user-id'] || 'anonymous'],
          execute: [req.headers['x-user-id'] || 'anonymous'],
          delete: [req.headers['x-user-id'] || 'anonymous']
        },
        statistics: {
          totalExecutions: 0,
          successfulExecutions: 0,
          failedExecutions: 0,
          averageExecutionTime: 0
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await workflow.save();

      logger.info(`Workflow created: ${workflow.workflowId}`);
      
      res.status(201).json({
        success: true,
        data: workflow,
        message: 'Workflow created successfully'
      });
    } catch (error: any) {
      logger.error('Error creating workflow:', error);
      res.status(400).json({ 
        success: false,
        message: error.message,
        code: 'WORKFLOW_CREATION_ERROR'
      });
    }
  }
);

app.post('/workflows/:id/execute', 
  workflowLimiter,
  async (req, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.headers['x-tenant-id'] || 'default';
      const triggerData = req.body.triggerData || {};
      
      const workflow = await Workflow.findOne({ workflowId: id, tenantId });
      if (!workflow) {
        return res.status(404).json({
          success: false,
          message: 'Workflow not found',
          code: 'WORKFLOW_NOT_FOUND'
        });
      }

      if (workflow.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: 'Workflow is not active',
          code: 'WORKFLOW_NOT_ACTIVE'
        });
      }

      const execution = await automationManager.executeWorkflow(workflow, triggerData);
      
      res.status(200).json({
        success: true,
        data: { execution }
      });
    } catch (error: any) {
      logger.error('Error executing workflow:', error);
      res.status(400).json({ 
        success: false,
        message: error.message,
        code: 'WORKFLOW_EXECUTION_ERROR'
      });
    }
  }
);

// Automation Rule endpoints
app.post('/rules', 
  workflowLimiter,
  validateRequest(automationRuleSchema), 
  async (req, res) => {
    try {
      const ruleData = req.validatedData;
      
      const rule = new AutomationRule({
        ruleId: uuidv4(),
        tenantId: req.headers['x-tenant-id'] || 'default',
        name: ruleData.name,
        description: ruleData.description,
        conditions: ruleData.conditions.map((condition: any) => ({
          conditionId: uuidv4(),
          ...condition
        })),
        actions: ruleData.actions.map((action: any) => ({
          actionId: uuidv4(),
          ...action
        })),
        priority: ruleData.priority,
        isEnabled: ruleData.isEnabled,
        tags: ruleData.tags || [],
        statistics: {
          totalTriggers: 0,
          successfulTriggers: 0,
          failedTriggers: 0
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await rule.save();

      logger.info(`Automation rule created: ${rule.ruleId}`);
      
      res.status(201).json({
        success: true,
        data: rule,
        message: 'Automation rule created successfully'
      });
    } catch (error: any) {
      logger.error('Error creating automation rule:', error);
      res.status(400).json({ 
        success: false,
        message: error.message,
        code: 'RULE_CREATION_ERROR'
      });
    }
  }
);

// AI Decision endpoint
app.post('/ai-decisions', 
  aiLimiter,
  async (req, res) => {
    try {
      const { prompt, context, options } = req.body;
      
      if (!prompt || !options || !Array.isArray(options)) {
        return res.status(400).json({
          success: false,
          message: 'Prompt and options are required',
          code: 'MISSING_REQUIRED_FIELDS'
        });
      }

      const decision = await aiDecisionQueue.add('makeDecision', {
        prompt,
        context: context || {},
        options
      });
      
      res.status(200).json({
        success: true,
        data: { decisionId: decision.id }
      });
    } catch (error: any) {
      logger.error('Error creating AI decision:', error);
      res.status(400).json({ 
        success: false,
        message: error.message,
        code: 'AI_DECISION_ERROR'
      });
    }
  }
);

// Automation overview endpoint
app.get('/dashboard/overview', async (req, res) => {
  try {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    
    const workflows = await Workflow.find({ tenantId });
    const rules = await AutomationRule.find({ tenantId });
    const executions = await WorkflowExecution.find({ tenantId }).limit(100);

    const workflowStats = {
      total: workflows.length,
      active: workflows.filter(w => w.status === 'active').length,
      draft: workflows.filter(w => w.status === 'draft').length,
      paused: workflows.filter(w => w.status === 'paused').length,
      byCategory: _.countBy(workflows, 'category'),
      totalExecutions: workflows.reduce((sum, w) => sum + w.statistics.totalExecutions, 0),
      successfulExecutions: workflows.reduce((sum, w) => sum + w.statistics.successfulExecutions, 0)
    };

    const ruleStats = {
      total: rules.length,
      enabled: rules.filter(r => r.isEnabled).length,
      disabled: rules.filter(r => !r.isEnabled).length,
      totalTriggers: rules.reduce((sum, r) => sum + r.statistics.totalTriggers, 0),
      successfulTriggers: rules.reduce((sum, r) => sum + r.statistics.successfulTriggers, 0)
    };

    const executionStats = {
      total: executions.length,
      running: executions.filter(e => e.status === 'running').length,
      completed: executions.filter(e => e.status === 'completed').length,
      failed: executions.filter(e => e.status === 'failed').length,
      averageDuration: executions.reduce((sum, e) => sum + (e.duration || 0), 0) / executions.length || 0
    };

    res.status(200).json({
      success: true,
      data: {
        workflows: workflowStats,
        rules: ruleStats,
        executions: executionStats,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error: any) {
    logger.error('Error fetching automation overview:', error);
    res.status(500).json({ 
      success: false,
      message: error.message,
      code: 'AUTOMATION_OVERVIEW_ERROR'
    });
  }
});

// Enhanced error handling middleware
app.use(errorHandler);

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  logger.info('Client connected to Automation Service:', socket.id);
  
  socket.on('subscribe-automation', (data) => {
    if (data.tenantId) {
      socket.join(`automation-${data.tenantId}`);
      logger.info(`Client subscribed to automation updates for tenant ${data.tenantId}`);
    }
  });
  
  socket.on('disconnect', () => {
    logger.info('Client disconnected from Automation Service:', socket.id);
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
  }
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
});

server.listen(PORT, () => {
  logger.info(`🚀 Enhanced Automation Service running on port ${PORT}`);
  logger.info(`⚙️ Workflow Management: Active`);
  logger.info(`🤖 AI Decision Engine: Active`);
  logger.info(`📅 Scheduled Tasks: Active`);
  logger.info(`🔄 Automation Rules: Active`);
  logger.info(`📊 Execution Tracking: Active`);
  logger.info(`🔒 Security: Rate limiting, CORS, Helmet enabled`);
  logger.info(`⚡ Performance: Caching, optimization enabled`);
});