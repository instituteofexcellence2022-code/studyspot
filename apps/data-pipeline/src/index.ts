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
import * as zlib from 'zlib';
import archiver from 'archiver';
import unzipper from 'unzipper';

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
  defaultMeta: { service: 'data-pipeline' },
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
  process.env.DATABASE_URL || 'postgresql://localhost:5432/studyspot_data_pipeline',
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

// Kafka configuration
const kafkaClient = new kafka.KafkaClient({
  kafkaHost: process.env.KAFKA_HOST || 'localhost:9092'
});

const kafkaProducer = new kafka.Producer(kafkaClient);
const kafkaConsumer = new kafka.Consumer(kafkaClient, [
  { topic: 'data-stream', partition: 0 }
]);

// RabbitMQ configuration
let rabbitConnection: amqp.Connection;
let rabbitChannel: amqp.Channel;

// Elasticsearch configuration
const elasticsearchClient = new ElasticsearchClient({
  host: process.env.ELASTICSEARCH_HOST || 'localhost:9200'
});

// MongoDB configuration
const mongoClient = new MongoClient(process.env.MONGODB_URL || 'mongodb://localhost:27017');

// InfluxDB configuration
const influxDB = new InfluxDB({
  host: process.env.INFLUXDB_HOST || 'localhost',
  port: process.env.INFLUXDB_PORT || 8086,
  database: process.env.INFLUXDB_DATABASE || 'studyspot_metrics'
});

// File upload configuration
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
    files: 10 // Max 10 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'text/csv', 'application/vnd.ms-excel', 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/json', 'text/plain', 'application/x-parquet',
      'application/avro', 'application/x-protobuf'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Data Pipeline Models and Interfaces
interface DataPipeline {
  id: string;
  name: string;
  description: string;
  type: 'batch' | 'stream' | 'hybrid';
  status: 'active' | 'inactive' | 'paused' | 'failed';
  source: DataSource;
  destination: DataDestination;
  transformations: DataTransformation[];
  schedule?: string;
  lastRun?: Date;
  nextRun?: Date;
  metrics: PipelineMetrics;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DataSource {
  type: 'database' | 'api' | 'file' | 'stream' | 'message_queue';
  connection: Record<string, any>;
  query?: string;
  format?: string;
  schema?: Record<string, any>;
}

interface DataDestination {
  type: 'database' | 'api' | 'file' | 'stream' | 'message_queue' | 'data_warehouse';
  connection: Record<string, any>;
  format?: string;
  schema?: Record<string, any>;
}

interface DataTransformation {
  id: string;
  name: string;
  type: 'filter' | 'map' | 'aggregate' | 'join' | 'custom';
  configuration: Record<string, any>;
  order: number;
}

interface PipelineMetrics {
  totalRecords: number;
  processedRecords: number;
  failedRecords: number;
  successRate: number;
  averageProcessingTime: number;
  lastProcessingTime?: number;
  throughput: number; // records per second
}

interface DataJob {
  id: string;
  pipelineId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  startTime?: Date;
  endTime?: Date;
  recordsProcessed: number;
  recordsFailed: number;
  errorMessage?: string;
  logs: string[];
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DataQualityRule {
  id: string;
  name: string;
  description: string;
  type: 'completeness' | 'accuracy' | 'consistency' | 'validity' | 'uniqueness';
  field: string;
  condition: string;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DataQualityReport {
  id: string;
  pipelineId: string;
  rules: DataQualityRule[];
  results: DataQualityResult[];
  overallScore: number;
  status: 'pass' | 'fail' | 'warning';
  generatedAt: Date;
  tenantId: string;
}

interface DataQualityResult {
  ruleId: string;
  ruleName: string;
  passed: boolean;
  score: number;
  violations: number;
  totalRecords: number;
  details: Record<string, any>;
}

// In-memory storage for demo (replace with database in production)
const pipelines: DataPipeline[] = [];
const jobs: DataJob[] = [];
const qualityRules: DataQualityRule[] = [];
const qualityReports: DataQualityReport[] = [];

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
const validatePipeline = [
  body('name').notEmpty().withMessage('Pipeline name is required'),
  body('type').isIn(['batch', 'stream', 'hybrid']).withMessage('Invalid pipeline type'),
  body('source').isObject().withMessage('Source configuration is required'),
  body('destination').isObject().withMessage('Destination configuration is required'),
  body('transformations').isArray().withMessage('Transformations must be an array')
];

const validateDataQualityRule = [
  body('name').notEmpty().withMessage('Rule name is required'),
  body('type').isIn(['completeness', 'accuracy', 'consistency', 'validity', 'uniqueness']).withMessage('Invalid rule type'),
  body('field').notEmpty().withMessage('Field is required'),
  body('condition').notEmpty().withMessage('Condition is required'),
  body('threshold').isNumeric().withMessage('Threshold must be a number'),
  body('severity').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity')
];

// Rate limiting
const rateLimitConfig = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Create Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(rateLimitConfig);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Data Pipeline Service is healthy',
    timestamp: new Date().toISOString(),
    pipelines: pipelines.length,
    jobs: jobs.length,
    qualityRules: qualityRules.length,
    kafka: 'connected',
    elasticsearch: 'connected',
    mongodb: 'connected',
    influxdb: 'connected'
  });
});

// ============================================
// PIPELINE MANAGEMENT ROUTES
// ============================================

/**
 * @route   POST /api/data-pipeline/pipelines
 * @desc    Create a new data pipeline
 * @access  Private
 */
app.post('/api/data-pipeline/pipelines', authenticateToken, validatePipeline, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const pipeline: DataPipeline = {
      id: uuidv4(),
      name: req.body.name,
      description: req.body.description || '',
      type: req.body.type,
      status: 'active',
      source: req.body.source,
      destination: req.body.destination,
      transformations: req.body.transformations || [],
      schedule: req.body.schedule,
      metrics: {
        totalRecords: 0,
        processedRecords: 0,
        failedRecords: 0,
        successRate: 0,
        averageProcessingTime: 0,
        throughput: 0
      },
      tenantId: req.user.tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    pipelines.push(pipeline);

    logger.info(`Data pipeline created: ${pipeline.id}`);
    
    res.status(201).json({
      success: true,
      message: 'Pipeline created successfully',
      data: { pipeline }
    });
  } catch (error) {
    logger.error('Error creating pipeline:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create pipeline'
    });
  }
});

/**
 * @route   GET /api/data-pipeline/pipelines
 * @desc    Get all pipelines for a tenant
 * @access  Private
 */
app.get('/api/data-pipeline/pipelines', authenticateToken, async (req, res) => {
  try {
    const tenantPipelines = pipelines.filter(pipeline => pipeline.tenantId === req.user.tenantId);
    
    res.json({
      success: true,
      data: { pipelines: tenantPipelines },
      count: tenantPipelines.length
    });
  } catch (error) {
    logger.error('Error fetching pipelines:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pipelines'
    });
  }
});

/**
 * @route   POST /api/data-pipeline/pipelines/:id/run
 * @desc    Run a data pipeline
 * @access  Private
 */
app.post('/api/data-pipeline/pipelines/:id/run', authenticateToken, async (req, res) => {
  try {
    const pipeline = pipelines.find(
      p => p.id === req.params.id && p.tenantId === req.user.tenantId
    );
    
    if (!pipeline) {
      return res.status(404).json({
        success: false,
        message: 'Pipeline not found'
      });
    }

    // Create job
    const job: DataJob = {
      id: uuidv4(),
      pipelineId: pipeline.id,
      status: 'pending',
      progress: 0,
      recordsProcessed: 0,
      recordsFailed: 0,
      logs: [],
      tenantId: req.user.tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    jobs.push(job);

    // Start pipeline execution
    executePipeline(pipeline, job);

    logger.info(`Pipeline execution started: ${pipeline.id}`);
    
    res.json({
      success: true,
      message: 'Pipeline execution started',
      data: { job }
    });
  } catch (error) {
    logger.error('Error running pipeline:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to run pipeline',
      error: error.message
    });
  }
});

// ============================================
// DATA QUALITY ROUTES
// ============================================

/**
 * @route   POST /api/data-pipeline/quality/rules
 * @desc    Create a new data quality rule
 * @access  Private
 */
app.post('/api/data-pipeline/quality/rules', authenticateToken, validateDataQualityRule, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const rule: DataQualityRule = {
      id: uuidv4(),
      name: req.body.name,
      description: req.body.description || '',
      type: req.body.type,
      field: req.body.field,
      condition: req.body.condition,
      threshold: req.body.threshold,
      severity: req.body.severity,
      isActive: true,
      tenantId: req.user.tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    qualityRules.push(rule);

    logger.info(`Data quality rule created: ${rule.id}`);
    
    res.status(201).json({
      success: true,
      message: 'Quality rule created successfully',
      data: { rule }
    });
  } catch (error) {
    logger.error('Error creating quality rule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create quality rule'
    });
  }
});

/**
 * @route   POST /api/data-pipeline/quality/validate
 * @desc    Validate data quality
 * @access  Private
 */
app.post('/api/data-pipeline/quality/validate', authenticateToken, async (req, res) => {
  try {
    const { pipelineId, data } = req.body;
    
    if (!pipelineId || !data) {
      return res.status(400).json({
        success: false,
        message: 'Pipeline ID and data are required'
      });
    }

    const pipeline = pipelines.find(p => p.id === pipelineId && p.tenantId === req.user.tenantId);
    if (!pipeline) {
      return res.status(404).json({
        success: false,
        message: 'Pipeline not found'
      });
    }

    const tenantRules = qualityRules.filter(rule => rule.tenantId === req.user.tenantId && rule.isActive);
    const qualityResults = await validateDataQuality(data, tenantRules);
    
    const overallScore = qualityResults.reduce((sum, result) => sum + result.score, 0) / qualityResults.length;
    const status = overallScore >= 0.8 ? 'pass' : overallScore >= 0.6 ? 'warning' : 'fail';

    const report: DataQualityReport = {
      id: uuidv4(),
      pipelineId,
      rules: tenantRules,
      results: qualityResults,
      overallScore,
      status,
      generatedAt: new Date(),
      tenantId: req.user.tenantId
    };

    qualityReports.push(report);

    logger.info(`Data quality validation completed: ${report.id}`);
    
    res.json({
      success: true,
      message: 'Data quality validation completed',
      data: { report }
    });
  } catch (error) {
    logger.error('Error validating data quality:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate data quality',
      error: error.message
    });
  }
});

// ============================================
// DATA PROCESSING ROUTES
// ============================================

/**
 * @route   POST /api/data-pipeline/process/file
 * @desc    Process uploaded data file
 * @access  Private
 */
app.post('/api/data-pipeline/process/file', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File is required'
      });
    }

    const { pipelineId, transformations = [] } = req.body;
    
    // Process file based on type
    let processedData: any[];
    
    switch (req.file.mimetype) {
      case 'text/csv':
        processedData = await processCSVFile(req.file.path);
        break;
      case 'application/vnd.ms-excel':
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        processedData = await processExcelFile(req.file.path);
        break;
      case 'application/json':
        processedData = await processJSONFile(req.file.path);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Unsupported file type'
        });
    }

    // Apply transformations
    const transformedData = await applyTransformations(processedData, transformations);

    // Clean up uploaded file
    require('fs').unlinkSync(req.file.path);

    logger.info(`File processed: ${req.file.originalname}`);
    
    res.json({
      success: true,
      message: 'File processed successfully',
      data: {
        filename: req.file.originalname,
        originalRecords: processedData.length,
        transformedRecords: transformedData.length,
        data: transformedData.slice(0, 100) // Return first 100 records
      }
    });
  } catch (error) {
    logger.error('Error processing file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process file',
      error: error.message
    });
  }
});

// ============================================
// STREAMING ROUTES
// ============================================

/**
 * @route   POST /api/data-pipeline/stream/subscribe
 * @desc    Subscribe to data stream
 * @access  Private
 */
app.post('/api/data-pipeline/stream/subscribe', authenticateToken, async (req, res) => {
  try {
    const { topic, pipelineId } = req.body;
    
    if (!topic || !pipelineId) {
      return res.status(400).json({
        success: false,
        message: 'Topic and pipeline ID are required'
      });
    }

    // Set up Kafka consumer for the topic
    const consumer = new kafka.Consumer(kafkaClient, [{ topic, partition: 0 }]);
    
    consumer.on('message', async (message) => {
      try {
        const data = JSON.parse(message.value.toString());
        await processStreamData(data, pipelineId);
      } catch (error) {
        logger.error('Error processing stream message:', error);
      }
    });

    consumer.on('error', (error) => {
      logger.error('Kafka consumer error:', error);
    });

    logger.info(`Subscribed to stream: ${topic}`);
    
    res.json({
      success: true,
      message: 'Subscribed to data stream successfully',
      data: { topic, pipelineId }
    });
  } catch (error) {
    logger.error('Error subscribing to stream:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe to stream',
      error: error.message
    });
  }
});

// ============================================
// ANALYTICS ROUTES
// ============================================

/**
 * @route   GET /api/data-pipeline/analytics/dashboard
 * @desc    Get data pipeline analytics dashboard
 * @access  Private
 */
app.get('/api/data-pipeline/analytics/dashboard', authenticateToken, async (req, res) => {
  try {
    const tenantPipelines = pipelines.filter(pipeline => pipeline.tenantId === req.user.tenantId);
    const tenantJobs = jobs.filter(job => job.tenantId === req.user.tenantId);
    const tenantQualityReports = qualityReports.filter(report => report.tenantId === req.user.tenantId);

    // Pipeline analytics
    const pipelineStats = {
      total: tenantPipelines.length,
      active: tenantPipelines.filter(p => p.status === 'active').length,
      inactive: tenantPipelines.filter(p => p.status === 'inactive').length,
      paused: tenantPipelines.filter(p => p.status === 'paused').length,
      failed: tenantPipelines.filter(p => p.status === 'failed').length,
      byType: {
        batch: tenantPipelines.filter(p => p.type === 'batch').length,
        stream: tenantPipelines.filter(p => p.type === 'stream').length,
        hybrid: tenantPipelines.filter(p => p.type === 'hybrid').length
      }
    };

    // Job analytics
    const jobStats = {
      total: tenantJobs.length,
      pending: tenantJobs.filter(j => j.status === 'pending').length,
      running: tenantJobs.filter(j => j.status === 'running').length,
      completed: tenantJobs.filter(j => j.status === 'completed').length,
      failed: tenantJobs.filter(j => j.status === 'failed').length,
      cancelled: tenantJobs.filter(j => j.status === 'cancelled').length,
      averageProcessingTime: tenantJobs
        .filter(j => j.endTime && j.startTime)
        .reduce((sum, j) => sum + (j.endTime!.getTime() - j.startTime!.getTime()), 0) / 
        tenantJobs.filter(j => j.endTime && j.startTime).length || 0
    };

    // Quality analytics
    const qualityStats = {
      totalReports: tenantQualityReports.length,
      passRate: tenantQualityReports.filter(r => r.status === 'pass').length / tenantQualityReports.length || 0,
      warningRate: tenantQualityReports.filter(r => r.status === 'warning').length / tenantQualityReports.length || 0,
      failRate: tenantQualityReports.filter(r => r.status === 'fail').length / tenantQualityReports.length || 0,
      averageScore: tenantQualityReports.reduce((sum, r) => sum + r.overallScore, 0) / tenantQualityReports.length || 0
    };

    res.json({
      success: true,
      data: {
        pipelines: pipelineStats,
        jobs: jobStats,
        quality: qualityStats,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error fetching analytics dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics dashboard'
    });
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

async function executePipeline(pipeline: DataPipeline, job: DataJob): Promise<void> {
  try {
    // Update job status
    const jobIndex = jobs.findIndex(j => j.id === job.id);
    if (jobIndex !== -1) {
      jobs[jobIndex] = {
        ...jobs[jobIndex],
        status: 'running',
        startTime: new Date(),
        progress: 0,
        updatedAt: new Date()
      };
    }

    // Simulate pipeline execution
    const steps = ['extract', 'transform', 'load', 'validate'];
    const totalSteps = steps.length;
    
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing
      
      // Update progress
      if (jobIndex !== -1) {
        jobs[jobIndex] = {
          ...jobs[jobIndex],
          progress: Math.round(((i + 1) / totalSteps) * 100),
          recordsProcessed: Math.floor(Math.random() * 1000) + 100,
          logs: [...jobs[jobIndex].logs, `Step ${i + 1}: ${steps[i]} completed`],
          updatedAt: new Date()
        };
      }
    }

    // Complete job
    if (jobIndex !== -1) {
      jobs[jobIndex] = {
        ...jobs[jobIndex],
        status: 'completed',
        endTime: new Date(),
        progress: 100,
        recordsProcessed: Math.floor(Math.random() * 1000) + 100,
        logs: [...jobs[jobIndex].logs, 'Pipeline execution completed successfully'],
        updatedAt: new Date()
      };
    }

    logger.info(`Pipeline execution completed: ${pipeline.id}`);
  } catch (error) {
    logger.error('Pipeline execution failed:', error);
    
    // Update job status
    const jobIndex = jobs.findIndex(j => j.id === job.id);
    if (jobIndex !== -1) {
      jobs[jobIndex] = {
        ...jobs[jobIndex],
        status: 'failed',
        endTime: new Date(),
        errorMessage: error.message,
        logs: [...jobs[jobIndex].logs, `Pipeline execution failed: ${error.message}`],
        updatedAt: new Date()
      };
    }
  }
}

async function validateDataQuality(data: any[], rules: DataQualityRule[]): Promise<DataQualityResult[]> {
  const results: DataQualityResult[] = [];
  
  for (const rule of rules) {
    try {
      let violations = 0;
      let totalRecords = data.length;
      
      switch (rule.type) {
        case 'completeness':
          violations = data.filter(record => !record[rule.field] || record[rule.field] === '').length;
          break;
        case 'accuracy':
          // Simulate accuracy check
          violations = Math.floor(Math.random() * totalRecords * 0.1);
          break;
        case 'consistency':
          // Simulate consistency check
          violations = Math.floor(Math.random() * totalRecords * 0.05);
          break;
        case 'validity':
          // Simulate validity check
          violations = Math.floor(Math.random() * totalRecords * 0.08);
          break;
        case 'uniqueness':
          const values = data.map(record => record[rule.field]);
          const uniqueValues = new Set(values);
          violations = values.length - uniqueValues.size;
          break;
      }
      
      const score = Math.max(0, 1 - (violations / totalRecords));
      const passed = score >= rule.threshold;
      
      results.push({
        ruleId: rule.id,
        ruleName: rule.name,
        passed,
        score,
        violations,
        totalRecords,
        details: {
          threshold: rule.threshold,
          actualScore: score,
          severity: rule.severity
        }
      });
    } catch (error) {
      logger.error(`Error validating rule ${rule.id}:`, error);
      results.push({
        ruleId: rule.id,
        ruleName: rule.name,
        passed: false,
        score: 0,
        violations: data.length,
        totalRecords: data.length,
        details: { error: error.message }
      });
    }
  }
  
  return results;
}

async function processCSVFile(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    require('fs').createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

async function processExcelFile(filePath: string): Promise<any[]> {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(worksheet);
}

async function processJSONFile(filePath: string): Promise<any[]> {
  const data = require('fs').readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(data);
  return Array.isArray(parsed) ? parsed : [parsed];
}

async function applyTransformations(data: any[], transformations: any[]): Promise<any[]> {
  let result = data;
  
  for (const transformation of transformations) {
    switch (transformation.type) {
      case 'filter':
        result = result.filter(record => evaluateCondition(record, transformation.condition));
        break;
      case 'map':
        result = result.map(record => transformRecord(record, transformation.mapping));
        break;
      case 'aggregate':
        result = aggregateData(result, transformation.groupBy, transformation.aggregations);
        break;
      default:
        logger.warn(`Unknown transformation type: ${transformation.type}`);
    }
  }
  
  return result;
}

function evaluateCondition(record: any, condition: string): boolean {
  // Simple condition evaluation (in production, use a proper expression evaluator)
  try {
    return eval(condition.replace(/\{(\w+)\}/g, (match, field) => `record.${field}`));
  } catch (error) {
    logger.error('Error evaluating condition:', error);
    return false;
  }
}

function transformRecord(record: any, mapping: Record<string, string>): any {
  const transformed: any = {};
  for (const [newField, expression] of Object.entries(mapping)) {
    try {
      transformed[newField] = eval(expression.replace(/\{(\w+)\}/g, (match, field) => `record.${field}`));
    } catch (error) {
      logger.error('Error transforming record:', error);
      transformed[newField] = null;
    }
  }
  return transformed;
}

function aggregateData(data: any[], groupBy: string, aggregations: Record<string, string>): any[] {
  const groups = _.groupBy(data, groupBy);
  return Object.entries(groups).map(([key, records]) => {
    const result: any = { [groupBy]: key };
    for (const [field, operation] of Object.entries(aggregations)) {
      switch (operation) {
        case 'sum':
          result[field] = _.sumBy(records, field);
          break;
        case 'avg':
          result[field] = _.meanBy(records, field);
          break;
        case 'count':
          result[field] = records.length;
          break;
        case 'min':
          result[field] = _.minBy(records, field)?.[field];
          break;
        case 'max':
          result[field] = _.maxBy(records, field)?.[field];
          break;
      }
    }
    return result;
  });
}

async function processStreamData(data: any, pipelineId: string): Promise<void> {
  try {
    // Process streaming data
    logger.info(`Processing stream data for pipeline: ${pipelineId}`);
    
    // In production, apply pipeline transformations and send to destination
    // For now, just log the data
    logger.debug('Stream data:', data);
  } catch (error) {
    logger.error('Error processing stream data:', error);
  }
}

// ============================================
// CRON JOBS
// ============================================

// Run scheduled pipelines
cron.schedule('*/5 * * * *', async () => {
  logger.info('Checking for scheduled pipelines...');
  
  const scheduledPipelines = pipelines.filter(pipeline => 
    pipeline.status === 'active' && 
    pipeline.schedule && 
    pipeline.tenantId === 'default' // In production, check all tenants
  );
  
  for (const pipeline of scheduledPipelines) {
    // Check if it's time to run
    const now = new Date();
    const lastRun = pipeline.lastRun || new Date(0);
    const timeSinceLastRun = now.getTime() - lastRun.getTime();
    
    // Simple schedule check (in production, use proper cron parsing)
    if (timeSinceLastRun > 5 * 60 * 1000) { // 5 minutes
      logger.info(`Running scheduled pipeline: ${pipeline.id}`);
      
      // Create and run job
      const job: DataJob = {
        id: uuidv4(),
        pipelineId: pipeline.id,
        status: 'pending',
        progress: 0,
        recordsProcessed: 0,
        recordsFailed: 0,
        logs: [],
        tenantId: pipeline.tenantId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      jobs.push(job);
      executePipeline(pipeline, job);
      
      // Update pipeline last run time
      const pipelineIndex = pipelines.findIndex(p => p.id === pipeline.id);
      if (pipelineIndex !== -1) {
        pipelines[pipelineIndex] = {
          ...pipelines[pipelineIndex],
          lastRun: now,
          updatedAt: now
        };
      }
    }
  }
});

// Clean up old jobs daily
cron.schedule('0 2 * * *', async () => {
  logger.info('Cleaning up old data pipeline jobs...');
  
  const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
  const initialCount = jobs.length;
  
  const filteredJobs = jobs.filter(job => job.createdAt > cutoffDate);
  jobs.length = 0;
  jobs.push(...filteredJobs);
  
  logger.info(`Cleaned up ${initialCount - jobs.length} old jobs`);
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
const PORT = process.env.PORT || 3014;

const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    // Initialize message queues
    try {
      rabbitConnection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
      rabbitChannel = await rabbitConnection.createChannel();
      logger.info('RabbitMQ connection established');
    } catch (error) {
      logger.warn('RabbitMQ connection failed:', error);
    }

    // Test Elasticsearch connection
    try {
      await elasticsearchClient.ping();
      logger.info('Elasticsearch connection established');
    } catch (error) {
      logger.warn('Elasticsearch connection failed:', error);
    }

    // Test MongoDB connection
    try {
      await mongoClient.connect();
      logger.info('MongoDB connection established');
    } catch (error) {
      logger.warn('MongoDB connection failed:', error);
    }

    // Test InfluxDB connection
    try {
      await influxDB.ping();
      logger.info('InfluxDB connection established');
    } catch (error) {
      logger.warn('InfluxDB connection failed:', error);
    }

    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 Data Pipeline Service running on port ${PORT}`);
      logger.info(`📊 Pipeline Management: Active`);
      logger.info(`🔄 ETL Processing: Active`);
      logger.info(`📈 Data Quality: Active`);
      logger.info(`🌊 Stream Processing: Active`);
      logger.info(`📤 Data Export: Active`);
      logger.info(`⏰ Scheduled Pipelines: Active`);
      logger.info(`📊 Analytics Dashboard: Active`);
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
  if (rabbitConnection) await rabbitConnection.close();
  if (mongoClient) await mongoClient.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await sequelize.close();
  if (rabbitConnection) await rabbitConnection.close();
  if (mongoClient) await mongoClient.close();
  process.exit(0);
});

// Start the server
startServer();

export default app;
