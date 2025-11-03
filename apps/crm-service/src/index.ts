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
import { logger as winstonLogger } from 'winston';

const app = express();
const PORT = process.env.PORT || 3011;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crmdb';
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Configuration
const CRM_CONFIG = {
  MAX_LEADS_PER_TENANT: 50000,
  MAX_CONTACTS_PER_TENANT: 100000,
  MAX_OPPORTUNITIES_PER_TENANT: 25000,
  MAX_CAMPAIGNS_PER_TENANT: 5000,
  MAX_TASKS_PER_TENANT: 100000,
  MAX_INTERACTIONS_PER_TENANT: 500000,
  RETENTION_DAYS: 365,
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: 100,
  MAX_LEAD_SCORE: 100,
  MAX_OPPORTUNITY_VALUE: 10000000,
  MAX_CAMPAIGN_RECIPIENTS: 100000,
  MAX_TASK_DURATION: 24 * 60 * 60 * 1000, // 24 hours
  MAX_INTERACTION_DURATION: 8 * 60 * 60 * 1000 // 8 hours
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
  windowMs: CRM_CONFIG.RATE_LIMIT_WINDOW,
  max: CRM_CONFIG.RATE_LIMIT_MAX,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const leadLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 50, // More restrictive for lead operations
  message: "Too many lead requests, please try again later.",
});

const opportunityLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Very restrictive for opportunity operations
  message: "Too many opportunity requests, please try again later.",
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

const crmQueue = new Queue('crmQueue', { connection });
const leadScoringQueue = new Queue('leadScoringQueue', { connection });
const opportunityTrackingQueue = new Queue('opportunityTrackingQueue', { connection });

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
const LeadSchema = new mongoose.Schema({
  leadId: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v: string) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'Lead ID must be a valid UUID'
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
  firstName: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return v && v.length >= 1 && v.length <= 100;
      },
      message: 'First name must be between 1 and 100 characters'
    }
  },
  lastName: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return v && v.length >= 1 && v.length <= 100;
      },
      message: 'Last name must be between 1 and 100 characters'
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
  phone: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^\+?[1-9]\d{1,14}$/.test(v);
      },
      message: 'Invalid phone format'
    }
  },
  company: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || v.length <= 200;
      },
      message: 'Company must be less than 200 characters'
    }
  },
  title: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || v.length <= 100;
      },
      message: 'Title must be less than 100 characters'
    }
  },
  industry: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || v.length <= 100;
      },
      message: 'Industry must be less than 100 characters'
    }
  },
  source: { 
    type: String, 
    required: true,
    enum: ['website', 'referral', 'social-media', 'email', 'phone', 'event', 'advertisement', 'other'],
    validate: {
      validator: function(v: string) {
        return v && v.length >= 2 && v.length <= 50;
      },
      message: 'Source must be between 2 and 50 characters'
    }
  },
  status: { 
    type: String, 
    enum: ['new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost'], 
    default: 'new' 
  },
  score: { 
    type: Number, 
    min: 0, 
    max: CRM_CONFIG.MAX_LEAD_SCORE, 
    default: 0 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'], 
    default: 'medium' 
  },
  assignedTo: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'Assigned to must be a valid UUID'
    }
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
  customFields: mongoose.Schema.Types.Mixed,
  notes: [{
    noteId: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v: string) {
          return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
        },
        message: 'Note ID must be a valid UUID'
      }
    },
    content: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v: string) {
          return v && v.length >= 1 && v.length <= 5000;
        },
        message: 'Note content must be between 1 and 5000 characters'
      }
    },
    author: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v: string) {
          return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
        },
        message: 'Author must be a valid UUID'
      }
    },
    createdAt: { type: Date, default: Date.now }
  }],
  interactions: [{
    interactionId: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v: string) {
          return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
        },
        message: 'Interaction ID must be a valid UUID'
      }
    },
    type: { 
      type: String, 
      required: true,
      enum: ['call', 'email', 'meeting', 'demo', 'proposal', 'follow-up'],
      validate: {
        validator: function(v: string) {
          return v && v.length >= 2 && v.length <= 50;
        },
        message: 'Interaction type must be between 2 and 50 characters'
      }
    },
    subject: { 
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || v.length <= 200;
        },
        message: 'Subject must be less than 200 characters'
      }
    },
    description: { 
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || v.length <= 5000;
        },
        message: 'Description must be less than 5000 characters'
      }
    },
    outcome: { 
      type: String,
      enum: ['positive', 'neutral', 'negative', 'follow-up-required'],
      validate: {
        validator: function(v: string) {
          return !v || v.length >= 2 && v.length <= 50;
        },
        message: 'Outcome must be between 2 and 50 characters'
      }
    },
    duration: { 
      type: Number, 
      min: 0, 
      max: CRM_CONFIG.MAX_INTERACTION_DURATION 
    },
    scheduledAt: Date,
    completedAt: Date,
    createdBy: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v: string) {
          return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
        },
        message: 'Created by must be a valid UUID'
      }
    }
  }],
  convertedAt: Date,
  convertedTo: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'Converted to must be a valid UUID'
    }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes
LeadSchema.index({ leadId: 1 }, { unique: true });
LeadSchema.index({ tenantId: 1, createdAt: -1 });
LeadSchema.index({ tenantId: 1, status: 1 });
LeadSchema.index({ tenantId: 1, source: 1 });
LeadSchema.index({ tenantId: 1, assignedTo: 1 });
LeadSchema.index({ email: 1 });
LeadSchema.index({ phone: 1 });
LeadSchema.index({ createdAt: 1 }, { expireAfterSeconds: CRM_CONFIG.RETENTION_DAYS * 24 * 60 * 60 });

const Lead = mongoose.model('Lead', LeadSchema);

const ContactSchema = new mongoose.Schema({
  contactId: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v: string) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'Contact ID must be a valid UUID'
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
  firstName: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return v && v.length >= 1 && v.length <= 100;
      },
      message: 'First name must be between 1 and 100 characters'
    }
  },
  lastName: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return v && v.length >= 1 && v.length <= 100;
      },
      message: 'Last name must be between 1 and 100 characters'
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
  phone: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^\+?[1-9]\d{1,14}$/.test(v);
      },
      message: 'Invalid phone format'
    }
  },
  company: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || v.length <= 200;
      },
      message: 'Company must be less than 200 characters'
    }
  },
  title: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || v.length <= 100;
      },
      message: 'Title must be less than 100 characters'
    }
  },
  industry: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || v.length <= 100;
      },
      message: 'Industry must be less than 100 characters'
    }
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'suspended', 'archived'], 
    default: 'active' 
  },
  type: { 
    type: String, 
    enum: ['customer', 'prospect', 'partner', 'vendor', 'other'], 
    default: 'prospect' 
  },
  assignedTo: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'Assigned to must be a valid UUID'
    }
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
  customFields: mongoose.Schema.Types.Mixed,
  notes: [{
    noteId: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v: string) {
          return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
        },
        message: 'Note ID must be a valid UUID'
      }
    },
    content: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v: string) {
          return v && v.length >= 1 && v.length <= 5000;
        },
        message: 'Note content must be between 1 and 5000 characters'
      }
    },
    author: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v: string) {
          return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
        },
        message: 'Author must be a valid UUID'
      }
    },
    createdAt: { type: Date, default: Date.now }
  }],
  interactions: [{
    interactionId: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v: string) {
          return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
        },
        message: 'Interaction ID must be a valid UUID'
      }
    },
    type: { 
      type: String, 
      required: true,
      enum: ['call', 'email', 'meeting', 'demo', 'proposal', 'follow-up'],
      validate: {
        validator: function(v: string) {
          return v && v.length >= 2 && v.length <= 50;
        },
        message: 'Interaction type must be between 2 and 50 characters'
      }
    },
    subject: { 
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || v.length <= 200;
        },
        message: 'Subject must be less than 200 characters'
      }
    },
    description: { 
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || v.length <= 5000;
        },
        message: 'Description must be less than 5000 characters'
      }
    },
    outcome: { 
      type: String,
      enum: ['positive', 'neutral', 'negative', 'follow-up-required'],
      validate: {
        validator: function(v: string) {
          return !v || v.length >= 2 && v.length <= 50;
        },
        message: 'Outcome must be between 2 and 50 characters'
      }
    },
    duration: { 
      type: Number, 
      min: 0, 
      max: CRM_CONFIG.MAX_INTERACTION_DURATION 
    },
    scheduledAt: Date,
    completedAt: Date,
    createdBy: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v: string) {
          return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
        },
        message: 'Created by must be a valid UUID'
      }
    }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes
ContactSchema.index({ contactId: 1 }, { unique: true });
ContactSchema.index({ tenantId: 1, createdAt: -1 });
ContactSchema.index({ tenantId: 1, status: 1 });
ContactSchema.index({ tenantId: 1, type: 1 });
ContactSchema.index({ tenantId: 1, assignedTo: 1 });
ContactSchema.index({ email: 1 });
ContactSchema.index({ phone: 1 });
ContactSchema.index({ createdAt: 1 }, { expireAfterSeconds: CRM_CONFIG.RETENTION_DAYS * 24 * 60 * 60 });

const Contact = mongoose.model('Contact', ContactSchema);

const OpportunitySchema = new mongoose.Schema({
  opportunityId: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v: string) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'Opportunity ID must be a valid UUID'
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
      message: 'Opportunity name must be between 2 and 200 characters'
    }
  },
  description: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || v.length <= 5000;
      },
      message: 'Description must be less than 5000 characters'
    }
  },
  contactId: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'Contact ID must be a valid UUID'
    }
  },
  value: { 
    type: Number, 
    required: true,
    min: 0,
    max: CRM_CONFIG.MAX_OPPORTUNITY_VALUE,
    validate: {
      validator: function(v: number) {
        return typeof v === 'number' && !isNaN(v) && isFinite(v);
      },
      message: 'Value must be a valid number'
    }
  },
  currency: { 
    type: String, 
    default: 'USD',
    validate: {
      validator: function(v: string) {
        return v && v.length >= 3 && v.length <= 3;
      },
      message: 'Currency must be a 3-character code'
    }
  },
  stage: { 
    type: String, 
    required: true,
    enum: ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed-won', 'closed-lost'],
    validate: {
      validator: function(v: string) {
        return v && v.length >= 2 && v.length <= 50;
      },
      message: 'Stage must be between 2 and 50 characters'
    }
  },
  probability: { 
    type: Number, 
    min: 0, 
    max: 100, 
    default: 0 
  },
  expectedCloseDate: { 
    type: Date, 
    required: true 
  },
  actualCloseDate: Date,
  assignedTo: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'Assigned to must be a valid UUID'
    }
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
  customFields: mongoose.Schema.Types.Mixed,
  notes: [{
    noteId: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v: string) {
          return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
        },
        message: 'Note ID must be a valid UUID'
      }
    },
    content: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v: string) {
          return v && v.length >= 1 && v.length <= 5000;
        },
        message: 'Note content must be between 1 and 5000 characters'
      }
    },
    author: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v: string) {
          return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
        },
        message: 'Author must be a valid UUID'
      }
    },
    createdAt: { type: Date, default: Date.now }
  }],
  interactions: [{
    interactionId: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v: string) {
          return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
        },
        message: 'Interaction ID must be a valid UUID'
      }
    },
    type: { 
      type: String, 
      required: true,
      enum: ['call', 'email', 'meeting', 'demo', 'proposal', 'follow-up'],
      validate: {
        validator: function(v: string) {
          return v && v.length >= 2 && v.length <= 50;
        },
        message: 'Interaction type must be between 2 and 50 characters'
      }
    },
    subject: { 
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || v.length <= 200;
        },
        message: 'Subject must be less than 200 characters'
      }
    },
    description: { 
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || v.length <= 5000;
        },
        message: 'Description must be less than 5000 characters'
      }
    },
    outcome: { 
      type: String,
      enum: ['positive', 'neutral', 'negative', 'follow-up-required'],
      validate: {
        validator: function(v: string) {
          return !v || v.length >= 2 && v.length <= 50;
        },
        message: 'Outcome must be between 2 and 50 characters'
      }
    },
    duration: { 
      type: Number, 
      min: 0, 
      max: CRM_CONFIG.MAX_INTERACTION_DURATION 
    },
    scheduledAt: Date,
    completedAt: Date,
    createdBy: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v: string) {
          return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
        },
        message: 'Created by must be a valid UUID'
      }
    }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes
OpportunitySchema.index({ opportunityId: 1 }, { unique: true });
OpportunitySchema.index({ tenantId: 1, createdAt: -1 });
OpportunitySchema.index({ tenantId: 1, stage: 1 });
OpportunitySchema.index({ tenantId: 1, assignedTo: 1 });
OpportunitySchema.index({ contactId: 1 });
OpportunitySchema.index({ expectedCloseDate: 1 });
OpportunitySchema.index({ createdAt: 1 }, { expireAfterSeconds: CRM_CONFIG.RETENTION_DAYS * 24 * 60 * 60 });

const Opportunity = mongoose.model('Opportunity', OpportunitySchema);

// Enhanced validation schemas
const leadSchema = Joi.object({
  firstName: Joi.string().min(1).max(100).required(),
  lastName: Joi.string().min(1).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
  company: Joi.string().max(200).optional(),
  title: Joi.string().max(100).optional(),
  industry: Joi.string().max(100).optional(),
  source: Joi.string().valid('website', 'referral', 'social-media', 'email', 'phone', 'event', 'advertisement', 'other').required(),
  status: Joi.string().valid('new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost').default('new'),
  score: Joi.number().min(0).max(CRM_CONFIG.MAX_LEAD_SCORE).default(0),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  assignedTo: Joi.string().uuid().optional(),
  tags: Joi.array().items(Joi.string().min(2).max(50)).optional(),
  customFields: Joi.object().optional()
});

const contactSchema = Joi.object({
  firstName: Joi.string().min(1).max(100).required(),
  lastName: Joi.string().min(1).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
  company: Joi.string().max(200).optional(),
  title: Joi.string().max(100).optional(),
  industry: Joi.string().max(100).optional(),
  status: Joi.string().valid('active', 'inactive', 'suspended', 'archived').default('active'),
  type: Joi.string().valid('customer', 'prospect', 'partner', 'vendor', 'other').default('prospect'),
  assignedTo: Joi.string().uuid().optional(),
  tags: Joi.array().items(Joi.string().min(2).max(50)).optional(),
  customFields: Joi.object().optional()
});

const opportunitySchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  description: Joi.string().max(5000).optional(),
  contactId: Joi.string().uuid().required(),
  value: Joi.number().min(0).max(CRM_CONFIG.MAX_OPPORTUNITY_VALUE).required(),
  currency: Joi.string().length(3).default('USD'),
  stage: Joi.string().valid('prospecting', 'qualification', 'proposal', 'negotiation', 'closed-won', 'closed-lost').required(),
  probability: Joi.number().min(0).max(100).default(0),
  expectedCloseDate: Joi.date().required(),
  actualCloseDate: Joi.date().optional(),
  assignedTo: Joi.string().uuid().optional(),
  tags: Joi.array().items(Joi.string().min(2).max(50)).optional(),
  customFields: Joi.object().optional()
});

// Enhanced CRM Manager with comprehensive CRM capabilities
class CRMManager {
  private activeOperations: Map<string, any> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.initializeCRM();
  }

  private async initializeCRM(): Promise<void> {
    try {
      // Start workers
      this.startLeadScoringWorker();
      this.startOpportunityTrackingWorker();
      
      logger.info('CRM Manager initialized successfully');
    } catch (error: any) {
      logger.error('Error initializing CRM Manager:', error);
      throw new Error(`CRM initialization failed: ${error.message}`);
    }
  }

  // Enhanced lead management
  async createLead(leadData: any): Promise<any> {
    try {
      if (!leadData || !leadData.email) {
        throw new Error('Valid lead data with email is required');
      }

      const lead = new Lead({
        leadId: uuidv4(),
        tenantId: leadData.tenantId || 'default',
        firstName: leadData.firstName,
        lastName: leadData.lastName,
        email: leadData.email,
        phone: leadData.phone,
        company: leadData.company,
        title: leadData.title,
        industry: leadData.industry,
        source: leadData.source,
        status: leadData.status || 'new',
        score: leadData.score || 0,
        priority: leadData.priority || 'medium',
        assignedTo: leadData.assignedTo,
        tags: leadData.tags || [],
        customFields: leadData.customFields || {},
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await lead.save();

      // Trigger lead scoring
      await leadScoringQueue.add('scoreLead', {
        leadId: lead.leadId,
        tenantId: lead.tenantId
      });

      logger.info(`Lead created: ${lead.leadId}`);
      return lead;

    } catch (error: any) {
      logger.error('Lead creation failed:', error);
      throw new Error(`Lead creation failed: ${error.message}`);
    }
  }

  // Enhanced contact management
  async createContact(contactData: any): Promise<any> {
    try {
      if (!contactData || !contactData.email) {
        throw new Error('Valid contact data with email is required');
      }

      const contact = new Contact({
        contactId: uuidv4(),
        tenantId: contactData.tenantId || 'default',
        firstName: contactData.firstName,
        lastName: contactData.lastName,
        email: contactData.email,
        phone: contactData.phone,
        company: contactData.company,
        title: contactData.title,
        industry: contactData.industry,
        status: contactData.status || 'active',
        type: contactData.type || 'prospect',
        assignedTo: contactData.assignedTo,
        tags: contactData.tags || [],
        customFields: contactData.customFields || {},
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await contact.save();

      logger.info(`Contact created: ${contact.contactId}`);
      return contact;

    } catch (error: any) {
      logger.error('Contact creation failed:', error);
      throw new Error(`Contact creation failed: ${error.message}`);
    }
  }

  // Enhanced opportunity management
  async createOpportunity(opportunityData: any): Promise<any> {
    try {
      if (!opportunityData || !opportunityData.contactId) {
        throw new Error('Valid opportunity data with contactId is required');
      }

      const opportunity = new Opportunity({
        opportunityId: uuidv4(),
        tenantId: opportunityData.tenantId || 'default',
        name: opportunityData.name,
        description: opportunityData.description,
        contactId: opportunityData.contactId,
        value: opportunityData.value,
        currency: opportunityData.currency || 'USD',
        stage: opportunityData.stage,
        probability: opportunityData.probability || 0,
        expectedCloseDate: opportunityData.expectedCloseDate,
        actualCloseDate: opportunityData.actualCloseDate,
        assignedTo: opportunityData.assignedTo,
        tags: opportunityData.tags || [],
        customFields: opportunityData.customFields || {},
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await opportunity.save();

      // Trigger opportunity tracking
      await opportunityTrackingQueue.add('trackOpportunity', {
        opportunityId: opportunity.opportunityId,
        tenantId: opportunity.tenantId
      });

      logger.info(`Opportunity created: ${opportunity.opportunityId}`);
      return opportunity;

    } catch (error: any) {
      logger.error('Opportunity creation failed:', error);
      throw new Error(`Opportunity creation failed: ${error.message}`);
    }
  }

  // Enhanced lead scoring
  async scoreLead(leadId: string): Promise<any> {
    try {
      const lead = await Lead.findOne({ leadId });
      if (!lead) {
        throw new Error('Lead not found');
      }

      let score = 0;

      // Score based on source
      const sourceScores = {
        'referral': 25,
        'website': 20,
        'social-media': 15,
        'email': 10,
        'phone': 5,
        'event': 20,
        'advertisement': 10,
        'other': 5
      };
      score += sourceScores[lead.source] || 0;

      // Score based on company size (if available)
      if (lead.company) {
        score += 10;
      }

      // Score based on title
      if (lead.title) {
        const titleScores = {
          'ceo': 20,
          'cto': 15,
          'vp': 15,
          'director': 10,
          'manager': 5
        };
        const titleLower = lead.title.toLowerCase();
        for (const [key, value] of Object.entries(titleScores)) {
          if (titleLower.includes(key)) {
            score += value;
            break;
          }
        }
      }

      // Score based on industry
      if (lead.industry) {
        score += 5;
      }

      // Score based on interactions
      score += lead.interactions.length * 2;

      // Cap the score
      score = Math.min(score, CRM_CONFIG.MAX_LEAD_SCORE);

      lead.score = score;
      lead.updatedAt = new Date();
      await lead.save();

      logger.info(`Lead scored: ${leadId} - Score: ${score}`);
      return { leadId, score };

    } catch (error: any) {
      logger.error('Lead scoring failed:', error);
      throw new Error(`Lead scoring failed: ${error.message}`);
    }
  }

  // Enhanced opportunity tracking
  async trackOpportunity(opportunityId: string): Promise<any> {
    try {
      const opportunity = await Opportunity.findOne({ opportunityId });
      if (!opportunity) {
        throw new Error('Opportunity not found');
      }

      // Calculate days to close
      const daysToClose = Math.ceil((opportunity.expectedCloseDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      // Update probability based on stage and days to close
      let probability = opportunity.probability;
      
      if (daysToClose < 0) {
        // Overdue
        probability = Math.max(0, probability - 10);
      } else if (daysToClose <= 7) {
        // Closing soon
        probability = Math.min(100, probability + 5);
      }

      // Update probability based on stage
      const stageProbabilities = {
        'prospecting': 10,
        'qualification': 25,
        'proposal': 50,
        'negotiation': 75,
        'closed-won': 100,
        'closed-lost': 0
      };
      
      if (stageProbabilities[opportunity.stage] !== undefined) {
        probability = stageProbabilities[opportunity.stage];
      }

      opportunity.probability = probability;
      opportunity.updatedAt = new Date();
      await opportunity.save();

      logger.info(`Opportunity tracked: ${opportunityId} - Probability: ${probability}%`);
      return { opportunityId, probability, daysToClose };

    } catch (error: any) {
      logger.error('Opportunity tracking failed:', error);
      throw new Error(`Opportunity tracking failed: ${error.message}`);
    }
  }

  // Enhanced interaction management
  async addInteraction(entityType: string, entityId: string, interactionData: any): Promise<any> {
    try {
      if (!entityType || !entityId || !interactionData) {
        throw new Error('Valid entity type, entity ID, and interaction data are required');
      }

      const interaction = {
        interactionId: uuidv4(),
        type: interactionData.type,
        subject: interactionData.subject,
        description: interactionData.description,
        outcome: interactionData.outcome,
        duration: interactionData.duration,
        scheduledAt: interactionData.scheduledAt,
        completedAt: interactionData.completedAt,
        createdBy: interactionData.createdBy
      };

      let entity;
      switch (entityType) {
        case 'lead':
          entity = await Lead.findOne({ leadId: entityId });
          break;
        case 'contact':
          entity = await Contact.findOne({ contactId: entityId });
          break;
        case 'opportunity':
          entity = await Opportunity.findOne({ opportunityId: entityId });
          break;
        default:
          throw new Error(`Unsupported entity type: ${entityType}`);
      }

      if (!entity) {
        throw new Error(`${entityType} not found`);
      }

      entity.interactions.push(interaction);
      entity.updatedAt = new Date();
      await entity.save();

      logger.info(`Interaction added to ${entityType}: ${entityId}`);
      return interaction;

    } catch (error: any) {
      logger.error('Interaction addition failed:', error);
      throw new Error(`Interaction addition failed: ${error.message}`);
    }
  }

  // Enhanced note management
  async addNote(entityType: string, entityId: string, noteData: any): Promise<any> {
    try {
      if (!entityType || !entityId || !noteData) {
        throw new Error('Valid entity type, entity ID, and note data are required');
      }

      const note = {
        noteId: uuidv4(),
        content: noteData.content,
        author: noteData.author,
        createdAt: new Date()
      };

      let entity;
      switch (entityType) {
        case 'lead':
          entity = await Lead.findOne({ leadId: entityId });
          break;
        case 'contact':
          entity = await Contact.findOne({ contactId: entityId });
          break;
        case 'opportunity':
          entity = await Opportunity.findOne({ opportunityId: entityId });
          break;
        default:
          throw new Error(`Unsupported entity type: ${entityType}`);
      }

      if (!entity) {
        throw new Error(`${entityType} not found`);
      }

      entity.notes.push(note);
      entity.updatedAt = new Date();
      await entity.save();

      logger.info(`Note added to ${entityType}: ${entityId}`);
      return note;

    } catch (error: any) {
      logger.error('Note addition failed:', error);
      throw new Error(`Note addition failed: ${error.message}`);
    }
  }

  // Worker methods
  private startLeadScoringWorker(): void {
    const worker = new Worker('leadScoringQueue', async (job: Job) => {
      const { leadId, tenantId } = job.data;
      
      try {
        const result = await this.scoreLead(leadId);
        return result;
      } catch (error: any) {
        logger.error('Lead scoring worker error:', error);
        throw error;
      }
    }, { connection });
    
    worker.on('completed', (job) => {
      logger.info(`Lead scoring job completed: ${job.id}`);
    });
    
    worker.on('failed', (job, err) => {
      logger.error(`Lead scoring job failed: ${job.id}`, err);
    });
  }

  private startOpportunityTrackingWorker(): void {
    const worker = new Worker('opportunityTrackingQueue', async (job: Job) => {
      const { opportunityId, tenantId } = job.data;
      
      try {
        const result = await this.trackOpportunity(opportunityId);
        return result;
      } catch (error: any) {
        logger.error('Opportunity tracking worker error:', error);
        throw error;
      }
    }, { connection });
    
    worker.on('completed', (job) => {
      logger.info(`Opportunity tracking job completed: ${job.id}`);
    });
    
    worker.on('failed', (job, err) => {
      logger.error(`Opportunity tracking job failed: ${job.id}`, err);
    });
  }

  // Get statistics
  getStatistics(): { activeOperations: number } {
    return {
      activeOperations: this.activeOperations.size
    };
  }
}

const crmManager = new CRMManager();

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
    status: 'CRM Service is healthy', 
    uptime: process.uptime(),
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      queue: crmQueue.name,
      leadScoringQueue: leadScoringQueue.name,
      opportunityTrackingQueue: opportunityTrackingQueue.name,
      leads: 'active',
      contacts: 'active',
      opportunities: 'active',
      interactions: 'active',
      notes: 'active'
    },
    statistics: crmManager.getStatistics()
  });
});

// Lead endpoints
app.post('/leads', 
  leadLimiter,
  validateRequest(leadSchema), 
  async (req, res) => {
    try {
      const leadData = req.validatedData;
      leadData.tenantId = req.headers['x-tenant-id'] || 'default';
      
      const lead = await crmManager.createLead(leadData);
      
      res.status(201).json({
        success: true,
        data: lead,
        message: 'Lead created successfully'
      });
    } catch (error: any) {
      logger.error('Error creating lead:', error);
      res.status(400).json({ 
        success: false,
        message: error.message,
        code: 'LEAD_CREATION_ERROR'
      });
    }
  }
);

// Contact endpoints
app.post('/contacts', 
  generalLimiter,
  validateRequest(contactSchema), 
  async (req, res) => {
    try {
      const contactData = req.validatedData;
      contactData.tenantId = req.headers['x-tenant-id'] || 'default';
      
      const contact = await crmManager.createContact(contactData);
      
      res.status(201).json({
        success: true,
        data: contact,
        message: 'Contact created successfully'
      });
    } catch (error: any) {
      logger.error('Error creating contact:', error);
      res.status(400).json({ 
        success: false,
        message: error.message,
        code: 'CONTACT_CREATION_ERROR'
      });
    }
  }
);

// Opportunity endpoints
app.post('/opportunities', 
  opportunityLimiter,
  validateRequest(opportunitySchema), 
  async (req, res) => {
    try {
      const opportunityData = req.validatedData;
      opportunityData.tenantId = req.headers['x-tenant-id'] || 'default';
      
      const opportunity = await crmManager.createOpportunity(opportunityData);
      
      res.status(201).json({
        success: true,
        data: opportunity,
        message: 'Opportunity created successfully'
      });
    } catch (error: any) {
      logger.error('Error creating opportunity:', error);
      res.status(400).json({ 
        success: false,
        message: error.message,
        code: 'OPPORTUNITY_CREATION_ERROR'
      });
    }
  }
);

// Interaction endpoints
app.post('/interactions/:entityType/:entityId', 
  generalLimiter,
  async (req, res) => {
    try {
      const { entityType, entityId } = req.params;
      const interactionData = req.body;
      interactionData.createdBy = req.headers['x-user-id'] || 'anonymous';
      
      const interaction = await crmManager.addInteraction(entityType, entityId, interactionData);
      
      res.status(201).json({
        success: true,
        data: interaction,
        message: 'Interaction added successfully'
      });
    } catch (error: any) {
      logger.error('Error adding interaction:', error);
      res.status(400).json({ 
        success: false,
        message: error.message,
        code: 'INTERACTION_ADDITION_ERROR'
      });
    }
  }
);

// Note endpoints
app.post('/notes/:entityType/:entityId', 
  generalLimiter,
  async (req, res) => {
    try {
      const { entityType, entityId } = req.params;
      const noteData = req.body;
      noteData.author = req.headers['x-user-id'] || 'anonymous';
      
      const note = await crmManager.addNote(entityType, entityId, noteData);
      
      res.status(201).json({
        success: true,
        data: note,
        message: 'Note added successfully'
      });
    } catch (error: any) {
      logger.error('Error adding note:', error);
      res.status(400).json({ 
        success: false,
        message: error.message,
        code: 'NOTE_ADDITION_ERROR'
      });
    }
  }
);

// CRM overview endpoint
app.get('/dashboard/overview', async (req, res) => {
  try {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    
    const leads = await Lead.find({ tenantId });
    const contacts = await Contact.find({ tenantId });
    const opportunities = await Opportunity.find({ tenantId });

    const leadStats = {
      total: leads.length,
      byStatus: _.countBy(leads, 'status'),
      bySource: _.countBy(leads, 'source'),
      byPriority: _.countBy(leads, 'priority'),
      averageScore: leads.reduce((sum, l) => sum + l.score, 0) / leads.length || 0,
      converted: leads.filter(l => l.status === 'converted').length
    };

    const contactStats = {
      total: contacts.length,
      byStatus: _.countBy(contacts, 'status'),
      byType: _.countBy(contacts, 'type'),
      active: contacts.filter(c => c.status === 'active').length
    };

    const opportunityStats = {
      total: opportunities.length,
      byStage: _.countBy(opportunities, 'stage'),
      totalValue: opportunities.reduce((sum, o) => sum + o.value, 0),
      averageValue: opportunities.reduce((sum, o) => sum + o.value, 0) / opportunities.length || 0,
      averageProbability: opportunities.reduce((sum, o) => sum + o.probability, 0) / opportunities.length || 0,
      closedWon: opportunities.filter(o => o.stage === 'closed-won').length,
      closedLost: opportunities.filter(o => o.stage === 'closed-lost').length
    };

    res.status(200).json({
      success: true,
      data: {
        leads: leadStats,
        contacts: contactStats,
        opportunities: opportunityStats,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error: any) {
    logger.error('Error fetching CRM overview:', error);
    res.status(500).json({ 
      success: false,
      message: error.message,
      code: 'CRM_OVERVIEW_ERROR'
    });
  }
});

// Enhanced error handling middleware
app.use(errorHandler);

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  logger.info('Client connected to CRM Service:', socket.id);
  
  socket.on('subscribe-crm', (data) => {
    if (data.tenantId) {
      socket.join(`crm-${data.tenantId}`);
      logger.info(`Client subscribed to CRM updates for tenant ${data.tenantId}`);
    }
  });
  
  socket.on('disconnect', () => {
    logger.info('Client disconnected from CRM Service:', socket.id);
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
  logger.info(`🚀 Enhanced CRM Service running on port ${PORT}`);
  logger.info(`👥 Lead Management: Active`);
  logger.info(`📞 Contact Management: Active`);
  logger.info(`💰 Opportunity Management: Active`);
  logger.info(`📝 Interaction Tracking: Active`);
  logger.info(`📋 Note Management: Active`);
  logger.info(`🔒 Security: Rate limiting, CORS, Helmet enabled`);
  logger.info(`⚡ Performance: Caching, optimization enabled`);
});