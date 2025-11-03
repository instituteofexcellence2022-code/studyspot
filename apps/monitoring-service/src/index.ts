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
import { register, collectDefaultMetrics, Counter, Histogram, Gauge } from 'prom-client';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { Client as WhatsAppClient } from 'whatsapp-web.js';
import admin from 'firebase-admin';
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
  defaultMeta: { service: 'monitoring-service' },
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
  process.env.DATABASE_URL || 'postgresql://localhost:5432/studyspot_monitoring',
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

// Prometheus metrics
collectDefaultMetrics({ register });

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const activeConnections = new Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

const systemMemoryUsage = new Gauge({
  name: 'system_memory_usage_bytes',
  help: 'System memory usage in bytes'
});

const systemCpuUsage = new Gauge({
  name: 'system_cpu_usage_percent',
  help: 'System CPU usage percentage'
});

const databaseConnections = new Gauge({
  name: 'database_connections_active',
  help: 'Number of active database connections'
});

const serviceHealthStatus = new Gauge({
  name: 'service_health_status',
  help: 'Health status of monitored services',
  labelNames: ['service_name', 'status']
});

// External service configurations
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

// Monitoring Service Models and Interfaces
interface MonitoringMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  labels: Record<string, string>;
  timestamp: Date;
  service: string;
  tenantId: string;
  createdAt: Date;
}

interface MonitoringAlert {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'suppressed' | 'acknowledged';
  condition: {
    metric: string;
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'ne';
    threshold: number;
    duration: number; // in seconds
  };
  notifications: {
    channels: ('email' | 'sms' | 'push' | 'webhook' | 'slack')[];
    recipients: string[];
    template?: string;
  };
  metadata: {
    customFields: Record<string, any>;
  };
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface MonitoringLog {
  id: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  service: string;
  component?: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  traceId?: string;
  spanId?: string;
  tags: string[];
  fields: Record<string, any>;
  timestamp: Date;
  tenantId: string;
  createdAt: Date;
}

interface MonitoringHealthCheck {
  id: string;
  service: string;
  endpoint: string;
  status: 'healthy' | 'unhealthy' | 'degraded' | 'unknown';
  responseTime: number; // in milliseconds
  statusCode?: number;
  error?: string;
  lastChecked: Date;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface MonitoringDashboard {
  id: string;
  name: string;
  description: string;
  widgets: Array<{
    id: string;
    type: 'metric' | 'chart' | 'table' | 'alert' | 'log';
    title: string;
    config: Record<string, any>;
    position: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
  layout: {
    columns: number;
    rows: number;
  };
  isPublic: boolean;
  metadata: {
    customFields: Record<string, any>;
  };
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface MonitoringReport {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  schedule?: string; // cron expression
  recipients: string[];
  format: 'pdf' | 'html' | 'csv' | 'json';
  metrics: string[];
  filters: Record<string, any>;
  isActive: boolean;
  metadata: {
    customFields: Record<string, any>;
  };
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory storage for demo (replace with database in production)
const monitoringMetrics: MonitoringMetric[] = [];
const monitoringAlerts: MonitoringAlert[] = [];
const monitoringLogs: MonitoringLog[] = [];
const monitoringHealthChecks: MonitoringHealthCheck[] = [];
const monitoringDashboards: MonitoringDashboard[] = [];
const monitoringReports: MonitoringReport[] = [];

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
const validateMonitoringMetric = [
  body('name').notEmpty().withMessage('Metric name is required'),
  body('value').isNumeric().withMessage('Value must be a number'),
  body('unit').notEmpty().withMessage('Unit is required'),
  body('type').isIn(['counter', 'gauge', 'histogram', 'summary']).withMessage('Invalid metric type'),
  body('service').notEmpty().withMessage('Service is required')
];

const validateMonitoringAlert = [
  body('name').notEmpty().withMessage('Alert name is required'),
  body('description').notEmpty().withMessage('Alert description is required'),
  body('severity').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity'),
  body('status').isIn(['active', 'resolved', 'suppressed', 'acknowledged']).withMessage('Invalid status'),
  body('condition.metric').notEmpty().withMessage('Condition metric is required'),
  body('condition.operator').isIn(['gt', 'lt', 'eq', 'gte', 'lte', 'ne']).withMessage('Invalid operator'),
  body('condition.threshold').isNumeric().withMessage('Threshold must be a number'),
  body('condition.duration').isNumeric().withMessage('Duration must be a number')
];

const validateMonitoringLog = [
  body('level').isIn(['debug', 'info', 'warn', 'error', 'fatal']).withMessage('Invalid log level'),
  body('message').notEmpty().withMessage('Log message is required'),
  body('service').notEmpty().withMessage('Service is required')
];

const validateMonitoringHealthCheck = [
  body('service').notEmpty().withMessage('Service is required'),
  body('endpoint').notEmpty().withMessage('Endpoint is required'),
  body('status').isIn(['healthy', 'unhealthy', 'degraded', 'unknown']).withMessage('Invalid status'),
  body('responseTime').isNumeric().withMessage('Response time must be a number')
];

const validateMonitoringDashboard = [
  body('name').notEmpty().withMessage('Dashboard name is required'),
  body('description').notEmpty().withMessage('Dashboard description is required'),
  body('widgets').isArray().withMessage('Widgets must be an array'),
  body('layout').isObject().withMessage('Layout must be an object')
];

const validateMonitoringReport = [
  body('name').notEmpty().withMessage('Report name is required'),
  body('description').notEmpty().withMessage('Report description is required'),
  body('type').isIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom']).withMessage('Invalid report type'),
  body('recipients').isArray().withMessage('Recipients must be an array'),
  body('format').isIn(['pdf', 'html', 'csv', 'json']).withMessage('Invalid format'),
  body('metrics').isArray().withMessage('Metrics must be an array')
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

// Prometheus metrics middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    
    httpRequestDuration
      .labels(req.method, route, res.statusCode.toString())
      .observe(duration);
    
    httpRequestTotal
      .labels(req.method, route, res.statusCode.toString())
      .inc();
  });
  
  next();
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  activeConnections.inc();
  
  socket.on('join-tenant', (tenantId) => {
    socket.join(`tenant-${tenantId}`);
    logger.info(`Client ${socket.id} joined tenant ${tenantId}`);
  });
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
    activeConnections.dec();
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Monitoring Service is healthy',
    timestamp: new Date().toISOString(),
    metrics: monitoringMetrics.length,
    alerts: monitoringAlerts.length,
    logs: monitoringLogs.length,
    healthChecks: monitoringHealthChecks.length,
    dashboards: monitoringDashboards.length,
    reports: monitoringReports.length,
    connectedClients: io.engine.clientsCount
  });
});

// Prometheus metrics endpoint
app.get('/metrics', (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(register.metrics());
});

// ============================================
// MONITORING METRICS ROUTES
// ============================================

/**
 * @route   POST /api/monitoring/metrics
 * @desc    Record a monitoring metric
 * @access  Private
 */
app.post('/api/monitoring/metrics', authenticateToken, validateMonitoringMetric, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { name, value, unit, type, labels, service } = req.body;
    
    const metric: MonitoringMetric = {
      id: uuidv4(),
      name,
      value,
      unit,
      type,
      labels: labels || {},
      timestamp: new Date(),
      service,
      tenantId: req.user.tenantId,
      createdAt: new Date()
    };

    monitoringMetrics.push(metric);

    // Update Prometheus metrics
    updatePrometheusMetrics(metric);

    logger.info(`Monitoring metric recorded: ${metric.id}`);
    
    res.status(201).json({
      success: true,
      message: 'Monitoring metric recorded successfully',
      data: { metric }
    });
  } catch (error) {
    logger.error('Error recording monitoring metric:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record monitoring metric'
    });
  }
});

/**
 * @route   GET /api/monitoring/metrics
 * @desc    Get monitoring metrics
 * @access  Private
 */
app.get('/api/monitoring/metrics', authenticateToken, async (req, res) => {
  try {
    const { name, service, type, limit = 100, offset = 0 } = req.query;
    
    let tenantMetrics = monitoringMetrics.filter(metric => metric.tenantId === req.user.tenantId);
    
    // Apply filters
    if (name) {
      tenantMetrics = tenantMetrics.filter(metric => metric.name === name);
    }
    if (service) {
      tenantMetrics = tenantMetrics.filter(metric => metric.service === service);
    }
    if (type) {
      tenantMetrics = tenantMetrics.filter(metric => metric.type === type);
    }
    
    // Sort by timestamp
    tenantMetrics = tenantMetrics
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));
    
    res.json({
      success: true,
      data: { metrics: tenantMetrics },
      count: tenantMetrics.length,
      total: monitoringMetrics.filter(metric => metric.tenantId === req.user.tenantId).length
    });
  } catch (error) {
    logger.error('Error fetching monitoring metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch monitoring metrics'
    });
  }
});

// ============================================
// MONITORING ALERTS ROUTES
// ============================================

/**
 * @route   POST /api/monitoring/alerts
 * @desc    Create a monitoring alert
 * @access  Private
 */
app.post('/api/monitoring/alerts', authenticateToken, validateMonitoringAlert, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { name, description, severity, status, condition, notifications, metadata } = req.body;
    
    const alert: MonitoringAlert = {
      id: uuidv4(),
      name,
      description,
      severity,
      status: status || 'active',
      condition,
      notifications,
      metadata: {
        customFields: metadata?.customFields || {}
      },
      tenantId: req.user.tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    monitoringAlerts.push(alert);

    logger.info(`Monitoring alert created: ${alert.id}`);
    
    res.status(201).json({
      success: true,
      message: 'Monitoring alert created successfully',
      data: { alert }
    });
  } catch (error) {
    logger.error('Error creating monitoring alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create monitoring alert'
    });
  }
});

/**
 * @route   GET /api/monitoring/alerts
 * @desc    Get monitoring alerts
 * @access  Private
 */
app.get('/api/monitoring/alerts', authenticateToken, async (req, res) => {
  try {
    const { severity, status, limit = 50, offset = 0 } = req.query;
    
    let tenantAlerts = monitoringAlerts.filter(alert => alert.tenantId === req.user.tenantId);
    
    // Apply filters
    if (severity) {
      tenantAlerts = tenantAlerts.filter(alert => alert.severity === severity);
    }
    if (status) {
      tenantAlerts = tenantAlerts.filter(alert => alert.status === status);
    }
    
    // Sort by creation date
    tenantAlerts = tenantAlerts
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));
    
    res.json({
      success: true,
      data: { alerts: tenantAlerts },
      count: tenantAlerts.length,
      total: monitoringAlerts.filter(alert => alert.tenantId === req.user.tenantId).length
    });
  } catch (error) {
    logger.error('Error fetching monitoring alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch monitoring alerts'
    });
  }
});

// ============================================
// MONITORING LOGS ROUTES
// ============================================

/**
 * @route   POST /api/monitoring/logs
 * @desc    Record a monitoring log
 * @access  Private
 */
app.post('/api/monitoring/logs', authenticateToken, validateMonitoringLog, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { level, message, service, component, userId, sessionId, requestId, traceId, spanId, tags, fields } = req.body;
    
    const log: MonitoringLog = {
      id: uuidv4(),
      level,
      message,
      service,
      component,
      userId,
      sessionId,
      requestId,
      traceId,
      spanId,
      tags: tags || [],
      fields: fields || {},
      timestamp: new Date(),
      tenantId: req.user.tenantId,
      createdAt: new Date()
    };

    monitoringLogs.push(log);

    // Send real-time log via Socket.IO
    io.to(`tenant-${log.tenantId}`).emit('log', {
      id: log.id,
      level: log.level,
      message: log.message,
      service: log.service,
      component: log.component,
      timestamp: log.timestamp.toISOString()
    });

    logger.info(`Monitoring log recorded: ${log.id}`);
    
    res.status(201).json({
      success: true,
      message: 'Monitoring log recorded successfully',
      data: { log }
    });
  } catch (error) {
    logger.error('Error recording monitoring log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record monitoring log'
    });
  }
});

/**
 * @route   GET /api/monitoring/logs
 * @desc    Get monitoring logs
 * @access  Private
 */
app.get('/api/monitoring/logs', authenticateToken, async (req, res) => {
  try {
    const { level, service, component, limit = 100, offset = 0 } = req.query;
    
    let tenantLogs = monitoringLogs.filter(log => log.tenantId === req.user.tenantId);
    
    // Apply filters
    if (level) {
      tenantLogs = tenantLogs.filter(log => log.level === level);
    }
    if (service) {
      tenantLogs = tenantLogs.filter(log => log.service === service);
    }
    if (component) {
      tenantLogs = tenantLogs.filter(log => log.component === component);
    }
    
    // Sort by timestamp
    tenantLogs = tenantLogs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));
    
    res.json({
      success: true,
      data: { logs: tenantLogs },
      count: tenantLogs.length,
      total: monitoringLogs.filter(log => log.tenantId === req.user.tenantId).length
    });
  } catch (error) {
    logger.error('Error fetching monitoring logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch monitoring logs'
    });
  }
});

// ============================================
// MONITORING HEALTH CHECKS ROUTES
// ============================================

/**
 * @route   POST /api/monitoring/health-checks
 * @desc    Record a health check result
 * @access  Private
 */
app.post('/api/monitoring/health-checks', authenticateToken, validateMonitoringHealthCheck, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { service, endpoint, status, responseTime, statusCode, error } = req.body;
    
    // Check if health check already exists
    const existingHealthCheck = monitoringHealthChecks.find(
      hc => hc.service === service && hc.endpoint === endpoint && hc.tenantId === req.user.tenantId
    );
    
    if (existingHealthCheck) {
      // Update existing health check
      existingHealthCheck.status = status;
      existingHealthCheck.responseTime = responseTime;
      existingHealthCheck.statusCode = statusCode;
      existingHealthCheck.error = error;
      existingHealthCheck.lastChecked = new Date();
      existingHealthCheck.updatedAt = new Date();
      
      logger.info(`Health check updated: ${existingHealthCheck.id}`);
      
      res.json({
        success: true,
        message: 'Health check updated successfully',
        data: { healthCheck: existingHealthCheck }
      });
    } else {
      // Create new health check
      const healthCheck: MonitoringHealthCheck = {
        id: uuidv4(),
        service,
        endpoint,
        status,
        responseTime,
        statusCode,
        error,
        lastChecked: new Date(),
        tenantId: req.user.tenantId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      monitoringHealthChecks.push(healthCheck);

      logger.info(`Health check created: ${healthCheck.id}`);
      
      res.status(201).json({
        success: true,
        message: 'Health check created successfully',
        data: { healthCheck }
      });
    }
  } catch (error) {
    logger.error('Error managing health check:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to manage health check'
    });
  }
});

/**
 * @route   GET /api/monitoring/health-checks
 * @desc    Get health checks
 * @access  Private
 */
app.get('/api/monitoring/health-checks', authenticateToken, async (req, res) => {
  try {
    const { service, status, limit = 50, offset = 0 } = req.query;
    
    let tenantHealthChecks = monitoringHealthChecks.filter(hc => hc.tenantId === req.user.tenantId);
    
    // Apply filters
    if (service) {
      tenantHealthChecks = tenantHealthChecks.filter(hc => hc.service === service);
    }
    if (status) {
      tenantHealthChecks = tenantHealthChecks.filter(hc => hc.status === status);
    }
    
    // Sort by last checked
    tenantHealthChecks = tenantHealthChecks
      .sort((a, b) => b.lastChecked.getTime() - a.lastChecked.getTime())
      .slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));
    
    res.json({
      success: true,
      data: { healthChecks: tenantHealthChecks },
      count: tenantHealthChecks.length,
      total: monitoringHealthChecks.filter(hc => hc.tenantId === req.user.tenantId).length
    });
  } catch (error) {
    logger.error('Error fetching health checks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch health checks'
    });
  }
});

// ============================================
// MONITORING DASHBOARDS ROUTES
// ============================================

/**
 * @route   POST /api/monitoring/dashboards
 * @desc    Create a monitoring dashboard
 * @access  Private
 */
app.post('/api/monitoring/dashboards', authenticateToken, validateMonitoringDashboard, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { name, description, widgets, layout, isPublic, metadata } = req.body;
    
    const dashboard: MonitoringDashboard = {
      id: uuidv4(),
      name,
      description,
      widgets: widgets || [],
      layout: layout || { columns: 12, rows: 8 },
      isPublic: isPublic || false,
      metadata: {
        customFields: metadata?.customFields || {}
      },
      tenantId: req.user.tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    monitoringDashboards.push(dashboard);

    logger.info(`Monitoring dashboard created: ${dashboard.id}`);
    
    res.status(201).json({
      success: true,
      message: 'Monitoring dashboard created successfully',
      data: { dashboard }
    });
  } catch (error) {
    logger.error('Error creating monitoring dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create monitoring dashboard'
    });
  }
});

/**
 * @route   GET /api/monitoring/dashboards
 * @desc    Get monitoring dashboards
 * @access  Private
 */
app.get('/api/monitoring/dashboards', authenticateToken, async (req, res) => {
  try {
    const { isPublic, limit = 50, offset = 0 } = req.query;
    
    let tenantDashboards = monitoringDashboards.filter(dashboard => dashboard.tenantId === req.user.tenantId);
    
    // Apply filters
    if (isPublic !== undefined) {
      tenantDashboards = tenantDashboards.filter(dashboard => dashboard.isPublic === (isPublic === 'true'));
    }
    
    // Sort by creation date
    tenantDashboards = tenantDashboards
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));
    
    res.json({
      success: true,
      data: { dashboards: tenantDashboards },
      count: tenantDashboards.length,
      total: monitoringDashboards.filter(dashboard => dashboard.tenantId === req.user.tenantId).length
    });
  } catch (error) {
    logger.error('Error fetching monitoring dashboards:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch monitoring dashboards'
    });
  }
});

// ============================================
// MONITORING REPORTS ROUTES
// ============================================

/**
 * @route   POST /api/monitoring/reports
 * @desc    Create a monitoring report
 * @access  Private
 */
app.post('/api/monitoring/reports', authenticateToken, validateMonitoringReport, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { name, description, type, schedule, recipients, format, metrics, filters, isActive, metadata } = req.body;
    
    const report: MonitoringReport = {
      id: uuidv4(),
      name,
      description,
      type,
      schedule,
      recipients: recipients || [],
      format,
      metrics: metrics || [],
      filters: filters || {},
      isActive: isActive !== false,
      metadata: {
        customFields: metadata?.customFields || {}
      },
      tenantId: req.user.tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    monitoringReports.push(report);

    logger.info(`Monitoring report created: ${report.id}`);
    
    res.status(201).json({
      success: true,
      message: 'Monitoring report created successfully',
      data: { report }
    });
  } catch (error) {
    logger.error('Error creating monitoring report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create monitoring report'
    });
  }
});

/**
 * @route   GET /api/monitoring/reports
 * @desc    Get monitoring reports
 * @access  Private
 */
app.get('/api/monitoring/reports', authenticateToken, async (req, res) => {
  try {
    const { type, isActive, limit = 50, offset = 0 } = req.query;
    
    let tenantReports = monitoringReports.filter(report => report.tenantId === req.user.tenantId);
    
    // Apply filters
    if (type) {
      tenantReports = tenantReports.filter(report => report.type === type);
    }
    if (isActive !== undefined) {
      tenantReports = tenantReports.filter(report => report.isActive === (isActive === 'true'));
    }
    
    // Sort by creation date
    tenantReports = tenantReports
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));
    
    res.json({
      success: true,
      data: { reports: tenantReports },
      count: tenantReports.length,
      total: monitoringReports.filter(report => report.tenantId === req.user.tenantId).length
    });
  } catch (error) {
    logger.error('Error fetching monitoring reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch monitoring reports'
    });
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

function updatePrometheusMetrics(metric: MonitoringMetric): void {
  try {
    switch (metric.type) {
      case 'counter':
        // Update counter metrics
        break;
      case 'gauge':
        // Update gauge metrics
        break;
      case 'histogram':
        // Update histogram metrics
        break;
      case 'summary':
        // Update summary metrics
        break;
    }
  } catch (error) {
    logger.error('Error updating Prometheus metrics:', error);
  }
}

async function checkServiceHealth(service: string, endpoint: string): Promise<{ status: string; responseTime: number; statusCode?: number; error?: string }> {
  try {
    const start = Date.now();
    const response = await fetch(endpoint);
    const responseTime = Date.now() - start;
    
    if (response.ok) {
      return {
        status: 'healthy',
        responseTime,
        statusCode: response.status
      };
    } else {
      return {
        status: 'unhealthy',
        responseTime,
        statusCode: response.status,
        error: `HTTP ${response.status}`
      };
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: 0,
      error: error.message
    };
  }
}

async function sendAlertNotification(alert: MonitoringAlert, metric: MonitoringMetric): Promise<void> {
  try {
    const { channels, recipients, template } = alert.notifications;
    
    for (const channel of channels) {
      switch (channel) {
        case 'email':
          await sendEmailAlert(alert, metric, recipients);
          break;
        case 'sms':
          await sendSMSAlert(alert, metric, recipients);
          break;
        case 'push':
          await sendPushAlert(alert, metric, recipients);
          break;
        case 'webhook':
          await sendWebhookAlert(alert, metric, recipients);
          break;
        case 'slack':
          await sendSlackAlert(alert, metric, recipients);
          break;
      }
    }
  } catch (error) {
    logger.error('Error sending alert notification:', error);
  }
}

async function sendEmailAlert(alert: MonitoringAlert, metric: MonitoringMetric, recipients: string[]): Promise<void> {
  // Simulate email alert sending
  logger.info(`Sending email alert: ${alert.id} to ${recipients.join(', ')}`);
}

async function sendSMSAlert(alert: MonitoringAlert, metric: MonitoringMetric, recipients: string[]): Promise<void> {
  // Simulate SMS alert sending
  logger.info(`Sending SMS alert: ${alert.id} to ${recipients.join(', ')}`);
}

async function sendPushAlert(alert: MonitoringAlert, metric: MonitoringMetric, recipients: string[]): Promise<void> {
  // Simulate push alert sending
  logger.info(`Sending push alert: ${alert.id} to ${recipients.join(', ')}`);
}

async function sendWebhookAlert(alert: MonitoringAlert, metric: MonitoringMetric, recipients: string[]): Promise<void> {
  // Simulate webhook alert sending
  logger.info(`Sending webhook alert: ${alert.id} to ${recipients.join(', ')}`);
}

async function sendSlackAlert(alert: MonitoringAlert, metric: MonitoringMetric, recipients: string[]): Promise<void> {
  // Simulate Slack alert sending
  logger.info(`Sending Slack alert: ${alert.id} to ${recipients.join(', ')}`);
}

// ============================================
// CRON JOBS
// ============================================

// Health check monitoring
cron.schedule('*/5 * * * *', async () => {
  logger.info('Running health checks...');
  
  const healthChecks = monitoringHealthChecks.filter(hc => hc.tenantId === 'default');
  
  for (const healthCheck of healthChecks) {
    try {
      const result = await checkServiceHealth(healthCheck.service, healthCheck.endpoint);
      
      healthCheck.status = result.status;
      healthCheck.responseTime = result.responseTime;
      healthCheck.statusCode = result.statusCode;
      healthCheck.error = result.error;
      healthCheck.lastChecked = new Date();
      healthCheck.updatedAt = new Date();
      
      // Update Prometheus metrics
      serviceHealthStatus
        .labels(healthCheck.service, result.status)
        .set(result.status === 'healthy' ? 1 : 0);
      
      logger.info(`Health check completed for ${healthCheck.service}: ${result.status}`);
    } catch (error) {
      logger.error(`Error running health check for ${healthCheck.service}:`, error);
    }
  }
});

// Alert evaluation
cron.schedule('*/1 * * * *', async () => {
  logger.info('Evaluating alerts...');
  
  const activeAlerts = monitoringAlerts.filter(alert => alert.status === 'active' && alert.tenantId === 'default');
  
  for (const alert of activeAlerts) {
    try {
      const { metric, operator, threshold, duration } = alert.condition;
      
      // Get recent metrics for the alert condition
      const recentMetrics = monitoringMetrics.filter(m => 
        m.name === metric && 
        m.tenantId === 'default' &&
        m.timestamp >= new Date(Date.now() - duration * 1000)
      );
      
      if (recentMetrics.length === 0) {
        continue;
      }
      
      // Check if condition is met
      let conditionMet = false;
      const latestMetric = recentMetrics[recentMetrics.length - 1];
      
      switch (operator) {
        case 'gt':
          conditionMet = latestMetric.value > threshold;
          break;
        case 'lt':
          conditionMet = latestMetric.value < threshold;
          break;
        case 'eq':
          conditionMet = latestMetric.value === threshold;
          break;
        case 'gte':
          conditionMet = latestMetric.value >= threshold;
          break;
        case 'lte':
          conditionMet = latestMetric.value <= threshold;
          break;
        case 'ne':
          conditionMet = latestMetric.value !== threshold;
          break;
      }
      
      if (conditionMet) {
        // Send alert notification
        await sendAlertNotification(alert, latestMetric);
        
        // Send real-time alert via Socket.IO
        io.to(`tenant-${alert.tenantId}`).emit('alert', {
          id: alert.id,
          name: alert.name,
          description: alert.description,
          severity: alert.severity,
          metric: latestMetric.name,
          value: latestMetric.value,
          threshold: threshold,
          timestamp: new Date().toISOString()
        });
        
        logger.info(`Alert triggered: ${alert.id}`);
      }
    } catch (error) {
      logger.error(`Error evaluating alert ${alert.id}:`, error);
    }
  }
});

// System metrics collection
cron.schedule('*/30 * * * * *', async () => {
  try {
    // Update system metrics
    const memUsage = process.memoryUsage();
    systemMemoryUsage.set(memUsage.heapUsed);
    
    // Update database connections
    databaseConnections.set(sequelize.connectionManager.pool.size);
    
    // Update CPU usage (simplified)
    const cpuUsage = process.cpuUsage();
    systemCpuUsage.set(cpuUsage.user / 1000000); // Convert to percentage
    
    logger.debug('System metrics updated');
  } catch (error) {
    logger.error('Error updating system metrics:', error);
  }
});

// Clean up old data daily
cron.schedule('0 2 * * *', async () => {
  logger.info('Cleaning up old monitoring data...');
  
  const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
  
  // Clean up old metrics
  const initialMetricsCount = monitoringMetrics.length;
  const filteredMetrics = monitoringMetrics.filter(metric => metric.createdAt > cutoffDate);
  monitoringMetrics.length = 0;
  monitoringMetrics.push(...filteredMetrics);
  
  // Clean up old logs
  const initialLogsCount = monitoringLogs.length;
  const filteredLogs = monitoringLogs.filter(log => log.createdAt > cutoffDate);
  monitoringLogs.length = 0;
  monitoringLogs.push(...filteredLogs);
  
  logger.info(`Cleaned up ${initialMetricsCount - monitoringMetrics.length} old monitoring metrics`);
  logger.info(`Cleaned up ${initialLogsCount - monitoringLogs.length} old monitoring logs`);
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
const PORT = process.env.PORT || 3018;

const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    // Start server
    server.listen(PORT, () => {
      logger.info(`🚀 Monitoring Service running on port ${PORT}`);
      logger.info(`📊 Metrics Collection: Active`);
      logger.info(`🚨 Alert Management: Active`);
      logger.info(`📝 Log Management: Active`);
      logger.info(`💚 Health Checks: Active`);
      logger.info(`📈 Dashboards: Active`);
      logger.info(`📋 Reports: Active`);
      logger.info(`⚡ Real-time Socket.IO: Active`);
      logger.info(`⏰ Automated Monitoring: Active`);
      logger.info(`📊 Prometheus Metrics: Active`);
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
