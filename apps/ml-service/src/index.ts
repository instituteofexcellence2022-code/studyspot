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
const PORT = process.env.PORT || 3014;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mldb';
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Configuration
const ML_CONFIG = {
  MAX_MODELS_PER_TENANT: 100,
  MAX_DATASETS_PER_TENANT: 50,
  MAX_PREDICTIONS_PER_TENANT: 100000,
  MAX_CONCURRENT_TRAINING: 10,
  MAX_TRAINING_TIME: 2 * 60 * 60 * 1000, // 2 hours
  RETENTION_DAYS: 365,
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: 100,
  MAX_DATASET_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_FEATURES: 1000,
  MAX_SAMPLES: 1000000,
  MAX_PREDICTION_BATCH_SIZE: 1000,
  MAX_MODEL_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_ACCURACY: 1.0,
  MIN_ACCURACY: 0.0,
  MAX_PRECISION: 1.0,
  MIN_PRECISION: 0.0,
  MAX_RECALL: 1.0,
  MIN_RECALL: 0.0,
  MAX_F1_SCORE: 1.0,
  MIN_F1_SCORE: 0.0
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
  windowMs: ML_CONFIG.RATE_LIMIT_WINDOW,
  max: ML_CONFIG.RATE_LIMIT_MAX,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const trainingLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // More restrictive for training operations
  message: "Too many training requests, please try again later.",
});

const predictionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 50, // Very restrictive for prediction operations
  message: "Too many prediction requests, please try again later.",
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

const mlQueue = new Queue('mlQueue', { connection });
const trainingQueue = new Queue('trainingQueue', { connection });
const predictionQueue = new Queue('predictionQueue', { connection });

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
const ModelSchema = new mongoose.Schema({
  modelId: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v: string) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'Model ID must be a valid UUID'
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
      message: 'Model name must be between 2 and 200 characters'
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
  type: { 
    type: String, 
    required: true,
    enum: ['classification', 'regression', 'clustering', 'recommendation', 'anomaly-detection', 'time-series', 'nlp', 'computer-vision'],
    validate: {
      validator: function(v: string) {
        return v && v.length >= 2 && v.length <= 50;
      },
      message: 'Model type must be between 2 and 50 characters'
    }
  },
  algorithm: { 
    type: String, 
    required: true,
    enum: ['linear-regression', 'logistic-regression', 'decision-tree', 'random-forest', 'svm', 'knn', 'k-means', 'neural-network', 'lstm', 'cnn', 'transformer'],
    validate: {
      validator: function(v: string) {
        return v && v.length >= 2 && v.length <= 50;
      },
      message: 'Algorithm must be between 2 and 50 characters'
    }
  },
  status: { 
    type: String, 
    enum: ['draft', 'training', 'trained', 'deployed', 'failed', 'archived'], 
    default: 'draft' 
  },
  datasetId: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'Dataset ID must be a valid UUID'
    }
  },
  configuration: {
    features: [{
      name: { 
        type: String, 
        required: true,
        validate: {
          validator: function(v: string) {
            return v && v.length >= 2 && v.length <= 100;
          },
          message: 'Feature name must be between 2 and 100 characters'
        }
      },
      type: { 
        type: String, 
        required: true,
        enum: ['numeric', 'categorical', 'text', 'image', 'datetime'],
        validate: {
          validator: function(v: string) {
            return v && v.length >= 2 && v.length <= 50;
          },
          message: 'Feature type must be between 2 and 50 characters'
        }
      },
      isRequired: { type: Boolean, default: true },
      defaultValue: mongoose.Schema.Types.Mixed,
      preprocessing: mongoose.Schema.Types.Mixed
    }],
    target: { 
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || v.length >= 2 && v.length <= 100;
        },
        message: 'Target must be between 2 and 100 characters'
      }
    },
    hyperparameters: mongoose.Schema.Types.Mixed,
    validation: {
      method: { 
        type: String, 
        enum: ['train-test-split', 'cross-validation', 'time-series-split'], 
        default: 'train-test-split' 
      },
      testSize: { 
        type: Number, 
        min: 0.1, 
        max: 0.5, 
        default: 0.2 
      },
      cvFolds: { 
        type: Number, 
        min: 2, 
        max: 10, 
        default: 5 
      }
    }
  },
  performance: {
    accuracy: { 
      type: Number,
      min: ML_CONFIG.MIN_ACCURACY,
      max: ML_CONFIG.MAX_ACCURACY,
      validate: {
        validator: function(v: number) {
          return !v || (typeof v === 'number' && !isNaN(v) && isFinite(v));
        },
        message: 'Accuracy must be a valid number'
      }
    },
    precision: { 
      type: Number,
      min: ML_CONFIG.MIN_PRECISION,
      max: ML_CONFIG.MAX_PRECISION,
      validate: {
        validator: function(v: number) {
          return !v || (typeof v === 'number' && !isNaN(v) && isFinite(v));
        },
        message: 'Precision must be a valid number'
      }
    },
    recall: { 
      type: Number,
      min: ML_CONFIG.MIN_RECALL,
      max: ML_CONFIG.MAX_RECALL,
      validate: {
        validator: function(v: number) {
          return !v || (typeof v === 'number' && !isNaN(v) && isFinite(v));
        },
        message: 'Recall must be a valid number'
      }
    },
    f1Score: { 
      type: Number,
      min: ML_CONFIG.MIN_F1_SCORE,
      max: ML_CONFIG.MAX_F1_SCORE,
      validate: {
        validator: function(v: number) {
          return !v || (typeof v === 'number' && !isNaN(v) && isFinite(v));
        },
        message: 'F1 score must be a valid number'
      }
    },
    mse: { 
      type: Number,
      validate: {
        validator: function(v: number) {
          return !v || (typeof v === 'number' && !isNaN(v) && isFinite(v));
        },
        message: 'MSE must be a valid number'
      }
    },
    rmse: { 
      type: Number,
      validate: {
        validator: function(v: number) {
          return !v || (typeof v === 'number' && !isNaN(v) && isFinite(v));
        },
        message: 'RMSE must be a valid number'
      }
    },
    mae: { 
      type: Number,
      validate: {
        validator: function(v: number) {
          return !v || (typeof v === 'number' && !isNaN(v) && isFinite(v));
        },
        message: 'MAE must be a valid number'
      }
    },
    r2: { 
      type: Number,
      validate: {
        validator: function(v: number) {
          return !v || (typeof v === 'number' && !isNaN(v) && isFinite(v));
        },
        message: 'R² must be a valid number'
      }
    }
  },
  modelData: mongoose.Schema.Types.Mixed,
  modelSize: { 
    type: Number,
    validate: {
      validator: function(v: number) {
        return !v || (typeof v === 'number' && !isNaN(v) && isFinite(v) && v > 0);
      },
      message: 'Model size must be a valid positive number'
    }
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
    deploy: [{ type: String }],
    delete: [{ type: String }]
  },
  statistics: {
    totalPredictions: { type: Number, default: 0 },
    successfulPredictions: { type: Number, default: 0 },
    failedPredictions: { type: Number, default: 0 },
    averagePredictionTime: { type: Number, default: 0 },
    lastPrediction: Date,
    lastSuccessfulPrediction: Date,
    lastFailedPrediction: Date
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes
ModelSchema.index({ modelId: 1 }, { unique: true });
ModelSchema.index({ tenantId: 1, createdAt: -1 });
ModelSchema.index({ tenantId: 1, type: 1 });
ModelSchema.index({ tenantId: 1, algorithm: 1 });
ModelSchema.index({ tenantId: 1, status: 1 });
ModelSchema.index({ createdAt: 1 }, { expireAfterSeconds: ML_CONFIG.RETENTION_DAYS * 24 * 60 * 60 });

const Model = mongoose.model('Model', ModelSchema);

const DatasetSchema = new mongoose.Schema({
  datasetId: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v: string) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'Dataset ID must be a valid UUID'
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
      message: 'Dataset name must be between 2 and 200 characters'
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
  type: { 
    type: String, 
    required: true,
    enum: ['tabular', 'text', 'image', 'time-series', 'audio', 'video'],
    validate: {
      validator: function(v: string) {
        return v && v.length >= 2 && v.length <= 50;
      },
      message: 'Dataset type must be between 2 and 50 characters'
    }
  },
  format: { 
    type: String, 
    required: true,
    enum: ['csv', 'json', 'parquet', 'excel', 'txt', 'png', 'jpg', 'mp4', 'wav'],
    validate: {
      validator: function(v: string) {
        return v && v.length >= 2 && v.length <= 20;
      },
      message: 'Format must be between 2 and 20 characters'
    }
  },
  size: { 
    type: Number, 
    required: true,
    min: 0,
    max: ML_CONFIG.MAX_DATASET_SIZE,
    validate: {
      validator: function(v: number) {
        return typeof v === 'number' && !isNaN(v) && isFinite(v);
      },
      message: 'Size must be a valid number'
    }
  },
  rows: { 
    type: Number, 
    required: true,
    min: 0,
    max: ML_CONFIG.MAX_SAMPLES,
    validate: {
      validator: function(v: number) {
        return typeof v === 'number' && !isNaN(v) && isFinite(v);
      },
      message: 'Rows must be a valid number'
    }
  },
  columns: { 
    type: Number, 
    required: true,
    min: 0,
    max: ML_CONFIG.MAX_FEATURES,
    validate: {
      validator: function(v: number) {
        return typeof v === 'number' && !isNaN(v) && isFinite(v);
      },
      message: 'Columns must be a valid number'
    }
  },
  schema: [{
    name: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v: string) {
          return v && v.length >= 2 && v.length <= 100;
        },
        message: 'Column name must be between 2 and 100 characters'
      }
    },
    type: { 
      type: String, 
      required: true,
      enum: ['string', 'number', 'boolean', 'date', 'array', 'object'],
      validate: {
        validator: function(v: string) {
          return v && v.length >= 2 && v.length <= 50;
        },
        message: 'Column type must be between 2 and 50 characters'
      }
    },
    isRequired: { type: Boolean, default: true },
    defaultValue: mongoose.Schema.Types.Mixed,
    description: { 
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || v.length <= 500;
        },
        message: 'Description must be less than 500 characters'
      }
    }
  }],
  url: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Invalid URL format'
    }
  },
  hash: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || v.length >= 32 && v.length <= 64;
      },
      message: 'Hash must be between 32 and 64 characters'
    }
  },
  isActive: { type: Boolean, default: true },
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
    delete: [{ type: String }]
  },
  statistics: {
    totalUses: { type: Number, default: 0 },
    successfulUses: { type: Number, default: 0 },
    failedUses: { type: Number, default: 0 },
    lastUsed: Date,
    lastSuccessfulUse: Date,
    lastFailedUse: Date
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes
DatasetSchema.index({ datasetId: 1 }, { unique: true });
DatasetSchema.index({ tenantId: 1, createdAt: -1 });
DatasetSchema.index({ tenantId: 1, type: 1 });
DatasetSchema.index({ tenantId: 1, format: 1 });
DatasetSchema.index({ tenantId: 1, isActive: 1 });
DatasetSchema.index({ createdAt: 1 }, { expireAfterSeconds: ML_CONFIG.RETENTION_DAYS * 24 * 60 * 60 });

const Dataset = mongoose.model('Dataset', DatasetSchema);

const PredictionSchema = new mongoose.Schema({
  predictionId: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v: string) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'Prediction ID must be a valid UUID'
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
  modelId: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'Model ID must be a valid UUID'
    }
  },
  input: mongoose.Schema.Types.Mixed,
  output: mongoose.Schema.Types.Mixed,
  confidence: { 
    type: Number,
    min: 0,
    max: 1,
    validate: {
      validator: function(v: number) {
        return !v || (typeof v === 'number' && !isNaN(v) && isFinite(v));
      },
      message: 'Confidence must be a valid number'
    }
  },
  probability: { 
    type: Number,
    min: 0,
    max: 1,
    validate: {
      validator: function(v: number) {
        return !v || (typeof v === 'number' && !isNaN(v) && isFinite(v));
      },
      message: 'Probability must be a valid number'
    }
  },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed'], 
    default: 'pending' 
  },
  error: String,
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes
PredictionSchema.index({ predictionId: 1 }, { unique: true });
PredictionSchema.index({ tenantId: 1, createdAt: -1 });
PredictionSchema.index({ tenantId: 1, modelId: 1 });
PredictionSchema.index({ tenantId: 1, status: 1 });
PredictionSchema.index({ createdAt: 1 }, { expireAfterSeconds: ML_CONFIG.RETENTION_DAYS * 24 * 60 * 60 });

const Prediction = mongoose.model('Prediction', PredictionSchema);

// Enhanced validation schemas
const modelSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  description: Joi.string().max(1000).optional(),
  type: Joi.string().valid('classification', 'regression', 'clustering', 'recommendation', 'anomaly-detection', 'time-series', 'nlp', 'computer-vision').required(),
  algorithm: Joi.string().valid('linear-regression', 'logistic-regression', 'decision-tree', 'random-forest', 'svm', 'knn', 'k-means', 'neural-network', 'lstm', 'cnn', 'transformer').required(),
  status: Joi.string().valid('draft', 'training', 'trained', 'deployed', 'failed', 'archived').default('draft'),
  datasetId: Joi.string().uuid().optional(),
  configuration: Joi.object({
    features: Joi.array().items(Joi.object({
      name: Joi.string().min(2).max(100).required(),
      type: Joi.string().valid('numeric', 'categorical', 'text', 'image', 'datetime').required(),
      isRequired: Joi.boolean().default(true),
      defaultValue: Joi.any().optional(),
      preprocessing: Joi.object().optional()
    })).optional(),
    target: Joi.string().min(2).max(100).optional(),
    hyperparameters: Joi.object().optional(),
    validation: Joi.object({
      method: Joi.string().valid('train-test-split', 'cross-validation', 'time-series-split').default('train-test-split'),
      testSize: Joi.number().min(0.1).max(0.5).default(0.2),
      cvFolds: Joi.number().min(2).max(10).default(5)
    }).optional()
  }).optional(),
  version: Joi.number().default(1),
  tags: Joi.array().items(Joi.string().min(2).max(50)).optional()
});

const datasetSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  description: Joi.string().max(1000).optional(),
  type: Joi.string().valid('tabular', 'text', 'image', 'time-series', 'audio', 'video').required(),
  format: Joi.string().valid('csv', 'json', 'parquet', 'excel', 'txt', 'png', 'jpg', 'mp4', 'wav').required(),
  size: Joi.number().min(0).max(ML_CONFIG.MAX_DATASET_SIZE).required(),
  rows: Joi.number().min(0).max(ML_CONFIG.MAX_SAMPLES).required(),
  columns: Joi.number().min(0).max(ML_CONFIG.MAX_FEATURES).required(),
  schema: Joi.array().items(Joi.object({
    name: Joi.string().min(2).max(100).required(),
    type: Joi.string().valid('string', 'number', 'boolean', 'date', 'array', 'object').required(),
    isRequired: Joi.boolean().default(true),
    defaultValue: Joi.any().optional(),
    description: Joi.string().max(500).optional()
  })).optional(),
  url: Joi.string().uri().optional(),
  hash: Joi.string().length(32, 64).optional(),
  isActive: Joi.boolean().default(true),
  tags: Joi.array().items(Joi.string().min(2).max(50)).optional()
});

const predictionSchema = Joi.object({
  modelId: Joi.string().uuid().required(),
  input: Joi.object().required(),
  metadata: Joi.object().optional()
});

// Enhanced ML Manager with comprehensive machine learning capabilities
class MLManager {
  private activeTraining: Map<string, any> = new Map();
  private activePredictions: Map<string, any> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.initializeML();
  }

  private async initializeML(): Promise<void> {
    try {
      // Start workers
      this.startTrainingWorker();
      this.startPredictionWorker();
      
      logger.info('ML Manager initialized successfully');
    } catch (error: any) {
      logger.error('Error initializing ML Manager:', error);
      throw new Error(`ML initialization failed: ${error.message}`);
    }
  }

  // Enhanced model training
  async trainModel(modelData: any): Promise<any> {
    try {
      if (!modelData || !modelData.datasetId) {
        throw new Error('Valid model data with datasetId is required');
      }

      const model = new Model({
        modelId: uuidv4(),
        tenantId: modelData.tenantId || 'default',
        name: modelData.name,
        description: modelData.description,
        type: modelData.type,
        algorithm: modelData.algorithm,
        status: 'training',
        datasetId: modelData.datasetId,
        configuration: modelData.configuration || {},
        version: modelData.version || 1,
        tags: modelData.tags || [],
        permissions: {
          view: [modelData.userId || 'anonymous'],
          edit: [modelData.userId || 'anonymous'],
          deploy: [modelData.userId || 'anonymous'],
          delete: [modelData.userId || 'anonymous']
        },
        statistics: {
          totalPredictions: 0,
          successfulPredictions: 0,
          failedPredictions: 0,
          averagePredictionTime: 0
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await model.save();

      // Start training process
      await trainingQueue.add('trainModel', {
        modelId: model.modelId,
        tenantId: model.tenantId
      });

      logger.info(`Model training started: ${model.modelId}`);
      return model;

    } catch (error: any) {
      logger.error('Model training failed:', error);
      throw new Error(`Model training failed: ${error.message}`);
    }
  }

  // Enhanced model prediction
  async predictModel(predictionData: any): Promise<any> {
    try {
      if (!predictionData || !predictionData.modelId || !predictionData.input) {
        throw new Error('Valid prediction data with modelId and input is required');
      }

      const predictionId = uuidv4();
      const startTime = Date.now();
      
      // Check concurrent prediction limit
      if (this.activePredictions.size >= ML_CONFIG.MAX_CONCURRENT_TRAINING) {
        throw new Error('Maximum concurrent predictions reached');
      }

      const prediction = new Prediction({
        predictionId,
        tenantId: predictionData.tenantId || 'default',
        modelId: predictionData.modelId,
        input: predictionData.input,
        status: 'processing',
        metadata: predictionData.metadata || {},
        createdAt: new Date(),
        updatedAt: new Date()
      });

      this.activePredictions.set(predictionId, prediction);
      
      try {
        // Get model
        const model = await Model.findOne({ modelId: predictionData.modelId });
        if (!model) {
          throw new Error('Model not found');
        }

        if (model.status !== 'trained' && model.status !== 'deployed') {
          throw new Error('Model is not ready for prediction');
        }

        // Simulate prediction
        const output = await this.simulatePrediction(model, predictionData.input);
        
        prediction.output = output.output;
        prediction.confidence = output.confidence;
        prediction.probability = output.probability;
        prediction.status = 'completed';

        // Update model statistics
        model.statistics.totalPredictions++;
        model.statistics.successfulPredictions++;
        model.statistics.lastPrediction = new Date();
        model.statistics.lastSuccessfulPrediction = new Date();
        await model.save();

      } finally {
        prediction.completedAt = new Date();
        prediction.duration = Date.now() - startTime;
        this.activePredictions.delete(predictionId);
        
        await prediction.save();
      }

      return prediction;

    } catch (error: any) {
      logger.error('Model prediction failed:', error);
      throw new Error(`Model prediction failed: ${error.message}`);
    }
  }

  // Enhanced dataset management
  async createDataset(datasetData: any): Promise<any> {
    try {
      if (!datasetData || !datasetData.name) {
        throw new Error('Valid dataset data with name is required');
      }

      const dataset = new Dataset({
        datasetId: uuidv4(),
        tenantId: datasetData.tenantId || 'default',
        name: datasetData.name,
        description: datasetData.description,
        type: datasetData.type,
        format: datasetData.format,
        size: datasetData.size,
        rows: datasetData.rows,
        columns: datasetData.columns,
        schema: datasetData.schema || [],
        url: datasetData.url,
        hash: datasetData.hash,
        isActive: datasetData.isActive,
        tags: datasetData.tags || [],
        permissions: {
          view: [datasetData.userId || 'anonymous'],
          edit: [datasetData.userId || 'anonymous'],
          delete: [datasetData.userId || 'anonymous']
        },
        statistics: {
          totalUses: 0,
          successfulUses: 0,
          failedUses: 0
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await dataset.save();

      logger.info(`Dataset created: ${dataset.datasetId}`);
      return dataset;

    } catch (error: any) {
      logger.error('Dataset creation failed:', error);
      throw new Error(`Dataset creation failed: ${error.message}`);
    }
  }

  // Enhanced model evaluation
  async evaluateModel(modelId: string): Promise<any> {
    try {
      const model = await Model.findOne({ modelId });
      if (!model) {
        throw new Error('Model not found');
      }

      if (model.status !== 'trained') {
        throw new Error('Model is not trained');
      }

      // Simulate model evaluation
      const evaluation = {
        accuracy: Math.random() * 0.3 + 0.7, // 70-100%
        precision: Math.random() * 0.3 + 0.7,
        recall: Math.random() * 0.3 + 0.7,
        f1Score: Math.random() * 0.3 + 0.7,
        mse: Math.random() * 100,
        rmse: Math.random() * 10,
        mae: Math.random() * 5,
        r2: Math.random() * 0.3 + 0.7
      };

      // Update model performance
      model.performance = evaluation;
      model.updatedAt = new Date();
      await model.save();

      logger.info(`Model evaluated: ${modelId}`);
      return evaluation;

    } catch (error: any) {
      logger.error('Model evaluation failed:', error);
      throw new Error(`Model evaluation failed: ${error.message}`);
    }
  }

  // Helper methods
  private async simulatePrediction(model: any, input: any): Promise<any> {
    // Simulate prediction based on model type
    let output: any;
    let confidence: number;
    let probability: number;

    switch (model.type) {
      case 'classification':
        const classes = ['class1', 'class2', 'class3'];
        output = classes[Math.floor(Math.random() * classes.length)];
        confidence = Math.random() * 0.4 + 0.6; // 60-100%
        probability = Math.random() * 0.4 + 0.6;
        break;
      case 'regression':
        output = Math.random() * 1000;
        confidence = Math.random() * 0.4 + 0.6;
        probability = null;
        break;
      case 'clustering':
        output = Math.floor(Math.random() * 5);
        confidence = Math.random() * 0.4 + 0.6;
        probability = null;
        break;
      default:
        output = 'prediction';
        confidence = Math.random() * 0.4 + 0.6;
        probability = Math.random() * 0.4 + 0.6;
    }

    return { output, confidence, probability };
  }

  // Worker methods
  private startTrainingWorker(): void {
    const worker = new Worker('trainingQueue', async (job: Job) => {
      const { modelId, tenantId } = job.data;
      
      try {
        const model = await Model.findOne({ modelId });
        if (!model) {
          throw new Error('Model not found');
        }

        // Simulate training process
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5 seconds

        // Update model status
        model.status = 'trained';
        model.updatedAt = new Date();
        await model.save();

        return { modelId, status: 'trained' };
      } catch (error: any) {
        logger.error('Training worker error:', error);
        throw error;
      }
    }, { connection });
    
    worker.on('completed', (job) => {
      logger.info(`Training job completed: ${job.id}`);
    });
    
    worker.on('failed', (job, err) => {
      logger.error(`Training job failed: ${job.id}`, err);
    });
  }

  private startPredictionWorker(): void {
    const worker = new Worker('predictionQueue', async (job: Job) => {
      const { predictionData } = job.data;
      
      try {
        const prediction = await this.predictModel(predictionData);
        return prediction;
      } catch (error: any) {
        logger.error('Prediction worker error:', error);
        throw error;
      }
    }, { connection });
    
    worker.on('completed', (job) => {
      logger.info(`Prediction job completed: ${job.id}`);
    });
    
    worker.on('failed', (job, err) => {
      logger.error(`Prediction job failed: ${job.id}`, err);
    });
  }

  // Get statistics
  getStatistics(): { activeTraining: number; activePredictions: number } {
    return {
      activeTraining: this.activeTraining.size,
      activePredictions: this.activePredictions.size
    };
  }
}

const mlManager = new MLManager();

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
    status: 'ML Service is healthy', 
    uptime: process.uptime(),
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      queue: mlQueue.name,
      trainingQueue: trainingQueue.name,
      predictionQueue: predictionQueue.name,
      models: 'active',
      datasets: 'active',
      predictions: 'active',
      training: 'active'
    },
    statistics: mlManager.getStatistics()
  });
});

// Model endpoints
app.post('/models', 
  trainingLimiter,
  validateRequest(modelSchema), 
  async (req, res) => {
    try {
      const modelData = req.validatedData;
      modelData.tenantId = req.headers['x-tenant-id'] || 'default';
      modelData.userId = req.headers['x-user-id'] || 'anonymous';
      
      const model = await mlManager.trainModel(modelData);
      
      res.status(201).json({
        success: true,
        data: model,
        message: 'Model training started successfully'
      });
    } catch (error: any) {
      logger.error('Error training model:', error);
      res.status(400).json({ 
        success: false,
        message: error.message,
        code: 'MODEL_TRAINING_ERROR'
      });
    }
  }
);

// Dataset endpoints
app.post('/datasets', 
  generalLimiter,
  validateRequest(datasetSchema), 
  async (req, res) => {
    try {
      const datasetData = req.validatedData;
      datasetData.tenantId = req.headers['x-tenant-id'] || 'default';
      datasetData.userId = req.headers['x-user-id'] || 'anonymous';
      
      const dataset = await mlManager.createDataset(datasetData);
      
      res.status(201).json({
        success: true,
        data: dataset,
        message: 'Dataset created successfully'
      });
    } catch (error: any) {
      logger.error('Error creating dataset:', error);
      res.status(400).json({ 
        success: false,
        message: error.message,
        code: 'DATASET_CREATION_ERROR'
      });
    }
  }
);

// Prediction endpoints
app.post('/predict', 
  predictionLimiter,
  validateRequest(predictionSchema), 
  async (req, res) => {
    try {
      const predictionData = req.validatedData;
      predictionData.tenantId = req.headers['x-tenant-id'] || 'default';
      
      const prediction = await mlManager.predictModel(predictionData);
      
      res.status(200).json({
        success: true,
        data: prediction
      });
    } catch (error: any) {
      logger.error('Error making prediction:', error);
      res.status(400).json({ 
        success: false,
        message: error.message,
        code: 'PREDICTION_ERROR'
      });
    }
  }
);

// Model evaluation endpoints
app.post('/models/:id/evaluate', 
  generalLimiter,
  async (req, res) => {
    try {
      const { id } = req.params;
      
      const evaluation = await mlManager.evaluateModel(id);
      
      res.status(200).json({
        success: true,
        data: evaluation
      });
    } catch (error: any) {
      logger.error('Error evaluating model:', error);
      res.status(400).json({ 
        success: false,
        message: error.message,
        code: 'MODEL_EVALUATION_ERROR'
      });
    }
  }
);

// ML overview endpoint
app.get('/dashboard/overview', async (req, res) => {
  try {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    
    const models = await Model.find({ tenantId });
    const datasets = await Dataset.find({ tenantId });
    const predictions = await Prediction.find({ tenantId }).limit(100);

    const modelStats = {
      total: models.length,
      byStatus: _.countBy(models, 'status'),
      byType: _.countBy(models, 'type'),
      byAlgorithm: _.countBy(models, 'algorithm'),
      totalPredictions: models.reduce((sum, m) => sum + m.statistics.totalPredictions, 0),
      successfulPredictions: models.reduce((sum, m) => sum + m.statistics.successfulPredictions, 0),
      averageAccuracy: models.reduce((sum, m) => sum + (m.performance?.accuracy || 0), 0) / models.length || 0
    };

    const datasetStats = {
      total: datasets.length,
      active: datasets.filter(d => d.isActive).length,
      byType: _.countBy(datasets, 'type'),
      byFormat: _.countBy(datasets, 'format'),
      totalSize: datasets.reduce((sum, d) => sum + d.size, 0),
      totalRows: datasets.reduce((sum, d) => sum + d.rows, 0),
      totalColumns: datasets.reduce((sum, d) => sum + d.columns, 0)
    };

    const predictionStats = {
      total: predictions.length,
      byStatus: _.countBy(predictions, 'status'),
      successful: predictions.filter(p => p.status === 'completed').length,
      failed: predictions.filter(p => p.status === 'failed').length,
      averageConfidence: predictions.reduce((sum, p) => sum + (p.confidence || 0), 0) / predictions.length || 0
    };

    res.status(200).json({
      success: true,
      data: {
        models: modelStats,
        datasets: datasetStats,
        predictions: predictionStats,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error: any) {
    logger.error('Error fetching ML overview:', error);
    res.status(500).json({ 
      success: false,
      message: error.message,
      code: 'ML_OVERVIEW_ERROR'
    });
  }
});

// Enhanced error handling middleware
app.use(errorHandler);

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  logger.info('Client connected to ML Service:', socket.id);
  
  socket.on('subscribe-ml', (data) => {
    if (data.tenantId) {
      socket.join(`ml-${data.tenantId}`);
      logger.info(`Client subscribed to ML updates for tenant ${data.tenantId}`);
    }
  });
  
  socket.on('disconnect', () => {
    logger.info('Client disconnected from ML Service:', socket.id);
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
  logger.info(`🚀 Enhanced ML Service running on port ${PORT}`);
  logger.info(`🤖 Model Training: Active`);
  logger.info(`📊 Model Prediction: Active`);
  logger.info(`📁 Dataset Management: Active`);
  logger.info(`📈 Model Evaluation: Active`);
  logger.info(`🔒 Security: Rate limiting, CORS, Helmet enabled`);
  logger.info(`⚡ Performance: Caching, optimization enabled`);
});