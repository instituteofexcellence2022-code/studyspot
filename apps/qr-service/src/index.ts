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
  defaultMeta: { service: 'qr-service' },
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
  process.env.DATABASE_URL || 'postgresql://localhost:5432/studyspot_qr',
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
    fileSize: 10 * 1024 * 1024, // 10MB limit for images
    files: 5 // Max 5 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'), false);
    }
  }
});

// QR Service Models and Interfaces
interface QRCode {
  id: string;
  code: string;
  type: 'attendance' | 'access' | 'payment' | 'information' | 'event' | 'custom';
  data: Record<string, any>;
  title: string;
  description?: string;
  status: 'active' | 'inactive' | 'expired' | 'revoked';
  expiresAt?: Date;
  maxUses?: number;
  currentUses: number;
  isSecure: boolean;
  encryptionKey?: string;
  metadata: {
    createdBy: string;
    location?: {
      latitude: number;
      longitude: number;
      accuracy: number;
    };
    deviceInfo?: {
      userAgent: string;
      platform: string;
      browser: string;
      version: string;
    };
    customFields: Record<string, any>;
  };
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface QRScan {
  id: string;
  qrCodeId: string;
  userId?: string;
  scannedAt: Date;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  deviceInfo: {
    userAgent: string;
    platform: string;
    browser: string;
    version: string;
    ipAddress: string;
  };
  result: {
    success: boolean;
    message: string;
    data?: Record<string, any>;
    error?: string;
  };
  metadata: {
    scanDuration: number;
    imageQuality: number;
    confidence: number;
    customFields: Record<string, any>;
  };
  tenantId: string;
  createdAt: Date;
}

interface QRAttendance {
  id: string;
  qrCodeId: string;
  userId: string;
  eventId?: string;
  sessionId?: string;
  checkInTime: Date;
  checkOutTime?: Date;
  duration?: number;
  status: 'checked-in' | 'checked-out' | 'late' | 'absent' | 'excused';
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  notes?: string;
  metadata: {
    deviceInfo: Record<string, any>;
    customFields: Record<string, any>;
  };
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface QRAccess {
  id: string;
  qrCodeId: string;
  userId: string;
  resourceId: string;
  resourceType: 'room' | 'building' | 'area' | 'equipment' | 'vehicle' | 'custom';
  accessTime: Date;
  accessType: 'entry' | 'exit' | 'both';
  granted: boolean;
  reason?: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  metadata: {
    deviceInfo: Record<string, any>;
    customFields: Record<string, any>;
  };
  tenantId: string;
  createdAt: Date;
}

interface QRPayment {
  id: string;
  qrCodeId: string;
  userId: string;
  amount: number;
  currency: string;
  paymentMethod: 'card' | 'upi' | 'wallet' | 'netbanking' | 'cash' | 'custom';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  transactionId?: string;
  paymentGateway?: string;
  paymentTime?: Date;
  description?: string;
  metadata: {
    deviceInfo: Record<string, any>;
    customFields: Record<string, any>;
  };
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface QREvent {
  id: string;
  qrCodeId: string;
  eventId: string;
  eventName: string;
  eventType: 'workshop' | 'seminar' | 'meeting' | 'conference' | 'training' | 'custom';
  startTime: Date;
  endTime: Date;
  location: string;
  description?: string;
  maxAttendees?: number;
  currentAttendees: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  metadata: {
    organizer: string;
    customFields: Record<string, any>;
  };
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface QRAnalytics {
  id: string;
  qrCodeId: string;
  metric: string;
  value: number;
  unit: string;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  date: Date;
  tenantId: string;
  createdAt: Date;
}

// In-memory storage for demo (replace with database in production)
const qrCodes: QRCode[] = [];
const qrScans: QRScan[] = [];
const qrAttendances: QRAttendance[] = [];
const qrAccesses: QRAccess[] = [];
const qrPayments: QRPayment[] = [];
const qrEvents: QREvent[] = [];
const qrAnalytics: QRAnalytics[] = [];

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
const validateQRCode = [
  body('type').isIn(['attendance', 'access', 'payment', 'information', 'event', 'custom']).withMessage('Invalid QR code type'),
  body('data').isObject().withMessage('QR code data must be an object'),
  body('title').notEmpty().withMessage('QR code title is required'),
  body('status').isIn(['active', 'inactive', 'expired', 'revoked']).withMessage('Invalid status')
];

const validateQRScan = [
  body('qrCodeId').isUUID().withMessage('Valid QR code ID is required'),
  body('location').optional().isObject().withMessage('Location must be an object'),
  body('deviceInfo').isObject().withMessage('Device info is required')
];

const validateQRAttendance = [
  body('qrCodeId').isUUID().withMessage('Valid QR code ID is required'),
  body('userId').isUUID().withMessage('Valid user ID is required'),
  body('checkInTime').isISO8601().withMessage('Valid check-in time is required'),
  body('status').isIn(['checked-in', 'checked-out', 'late', 'absent', 'excused']).withMessage('Invalid status')
];

const validateQRAccess = [
  body('qrCodeId').isUUID().withMessage('Valid QR code ID is required'),
  body('userId').isUUID().withMessage('Valid user ID is required'),
  body('resourceId').notEmpty().withMessage('Resource ID is required'),
  body('resourceType').isIn(['room', 'building', 'area', 'equipment', 'vehicle', 'custom']).withMessage('Invalid resource type'),
  body('accessType').isIn(['entry', 'exit', 'both']).withMessage('Invalid access type'),
  body('granted').isBoolean().withMessage('Granted must be a boolean')
];

const validateQRPayment = [
  body('qrCodeId').isUUID().withMessage('Valid QR code ID is required'),
  body('userId').isUUID().withMessage('Valid user ID is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('currency').isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
  body('paymentMethod').isIn(['card', 'upi', 'wallet', 'netbanking', 'cash', 'custom']).withMessage('Invalid payment method'),
  body('paymentStatus').isIn(['pending', 'completed', 'failed', 'cancelled', 'refunded']).withMessage('Invalid payment status')
];

const validateQREvent = [
  body('qrCodeId').isUUID().withMessage('Valid QR code ID is required'),
  body('eventId').notEmpty().withMessage('Event ID is required'),
  body('eventName').notEmpty().withMessage('Event name is required'),
  body('eventType').isIn(['workshop', 'seminar', 'meeting', 'conference', 'training', 'custom']).withMessage('Invalid event type'),
  body('startTime').isISO8601().withMessage('Valid start time is required'),
  body('endTime').isISO8601().withMessage('Valid end time is required'),
  body('status').isIn(['upcoming', 'ongoing', 'completed', 'cancelled']).withMessage('Invalid status')
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
    message: 'QR Service is healthy',
    timestamp: new Date().toISOString(),
    qrCodes: qrCodes.length,
    qrScans: qrScans.length,
    qrAttendances: qrAttendances.length,
    qrAccesses: qrAccesses.length,
    qrPayments: qrPayments.length,
    qrEvents: qrEvents.length,
    qrAnalytics: qrAnalytics.length
  });
});

// ============================================
// QR CODE MANAGEMENT ROUTES
// ============================================

/**
 * @route   POST /api/qr/codes
 * @desc    Create a new QR code
 * @access  Private
 */
app.post('/api/qr/codes', authenticateToken, validateQRCode, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { type, data, title, description, expiresAt, maxUses, isSecure, metadata } = req.body;
    
    // Generate QR code
    const qrCode: QRCode = {
      id: uuidv4(),
      code: generateQRCode(),
      type,
      data,
      title,
      description,
      status: 'active',
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      maxUses,
      currentUses: 0,
      isSecure: isSecure || false,
      encryptionKey: isSecure ? generateEncryptionKey() : undefined,
      metadata: {
        createdBy: req.user.id,
        location: metadata?.location,
        deviceInfo: metadata?.deviceInfo || {
          userAgent: req.get('User-Agent') || 'unknown',
          platform: 'unknown',
          browser: 'unknown',
          version: 'unknown'
        },
        customFields: metadata?.customFields || {}
      },
      tenantId: req.user.tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    qrCodes.push(qrCode);

    logger.info(`QR code created: ${qrCode.id}`);
    
    res.status(201).json({
      success: true,
      message: 'QR code created successfully',
      data: { qrCode }
    });
  } catch (error) {
    logger.error('Error creating QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create QR code'
    });
  }
});

/**
 * @route   GET /api/qr/codes
 * @desc    Get all QR codes for a tenant
 * @access  Private
 */
app.get('/api/qr/codes', authenticateToken, async (req, res) => {
  try {
    const { type, status, limit = 50, offset = 0 } = req.query;
    
    let tenantQRCodes = qrCodes.filter(qrCode => qrCode.tenantId === req.user.tenantId);
    
    // Apply filters
    if (type) {
      tenantQRCodes = tenantQRCodes.filter(qrCode => qrCode.type === type);
    }
    if (status) {
      tenantQRCodes = tenantQRCodes.filter(qrCode => qrCode.status === status);
    }
    
    // Sort by creation date
    tenantQRCodes = tenantQRCodes
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));
    
    res.json({
      success: true,
      data: { qrCodes: tenantQRCodes },
      count: tenantQRCodes.length,
      total: qrCodes.filter(qrCode => qrCode.tenantId === req.user.tenantId).length
    });
  } catch (error) {
    logger.error('Error fetching QR codes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch QR codes'
    });
  }
});

/**
 * @route   GET /api/qr/codes/:id
 * @desc    Get a specific QR code
 * @access  Private
 */
app.get('/api/qr/codes/:id', authenticateToken, async (req, res) => {
  try {
    const qrCode = qrCodes.find(qr => qr.id === req.params.id && qr.tenantId === req.user.tenantId);
    
    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: 'QR code not found'
      });
    }
    
    res.json({
      success: true,
      data: { qrCode }
    });
  } catch (error) {
    logger.error('Error fetching QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch QR code'
    });
  }
});

// ============================================
// QR SCANNING ROUTES
// ============================================

/**
 * @route   POST /api/qr/scan
 * @desc    Scan a QR code
 * @access  Private
 */
app.post('/api/qr/scan', authenticateToken, upload.single('image'), validateQRScan, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { qrCodeId, location, deviceInfo } = req.body;
    const image = req.file ? req.file.path : req.body.image;
    
    // Process QR code scan
    const scanResult = await processQRScan(qrCodeId, image, location, deviceInfo, req.user.tenantId);
    
    res.json({
      success: true,
      message: 'QR code scanned successfully',
      data: { scan: scanResult }
    });
  } catch (error) {
    logger.error('Error scanning QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to scan QR code',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/qr/scans
 * @desc    Get all QR scans for a tenant
 * @access  Private
 */
app.get('/api/qr/scans', authenticateToken, async (req, res) => {
  try {
    const { qrCodeId, userId, success, limit = 50, offset = 0 } = req.query;
    
    let tenantScans = qrScans.filter(scan => scan.tenantId === req.user.tenantId);
    
    // Apply filters
    if (qrCodeId) {
      tenantScans = tenantScans.filter(scan => scan.qrCodeId === qrCodeId);
    }
    if (userId) {
      tenantScans = tenantScans.filter(scan => scan.userId === userId);
    }
    if (success !== undefined) {
      tenantScans = tenantScans.filter(scan => scan.result.success === (success === 'true'));
    }
    
    // Sort by scan time
    tenantScans = tenantScans
      .sort((a, b) => b.scannedAt.getTime() - a.scannedAt.getTime())
      .slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));
    
    res.json({
      success: true,
      data: { qrScans: tenantScans },
      count: tenantScans.length,
      total: qrScans.filter(scan => scan.tenantId === req.user.tenantId).length
    });
  } catch (error) {
    logger.error('Error fetching QR scans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch QR scans'
    });
  }
});

// ============================================
// QR ATTENDANCE ROUTES
// ============================================

/**
 * @route   POST /api/qr/attendance
 * @desc    Record QR attendance
 * @access  Private
 */
app.post('/api/qr/attendance', authenticateToken, validateQRAttendance, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { qrCodeId, userId, eventId, sessionId, checkInTime, location, notes, metadata } = req.body;
    
    const attendance: QRAttendance = {
      id: uuidv4(),
      qrCodeId,
      userId,
      eventId,
      sessionId,
      checkInTime: new Date(checkInTime),
      checkOutTime: req.body.checkOutTime ? new Date(req.body.checkOutTime) : undefined,
      duration: req.body.duration,
      status: req.body.status || 'checked-in',
      location: location || {
        latitude: 0,
        longitude: 0,
        accuracy: 0
      },
      notes,
      metadata: {
        deviceInfo: metadata?.deviceInfo || {
          userAgent: req.get('User-Agent') || 'unknown',
          platform: 'unknown',
          browser: 'unknown',
          version: 'unknown'
        },
        customFields: metadata?.customFields || {}
      },
      tenantId: req.user.tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    qrAttendances.push(attendance);

    // Update QR code usage
    const qrCode = qrCodes.find(qr => qr.id === qrCodeId);
    if (qrCode) {
      qrCode.currentUses++;
      qrCode.updatedAt = new Date();
    }

    logger.info(`QR attendance recorded: ${attendance.id}`);
    
    res.status(201).json({
      success: true,
      message: 'QR attendance recorded successfully',
      data: { attendance }
    });
  } catch (error) {
    logger.error('Error recording QR attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record QR attendance'
    });
  }
});

/**
 * @route   GET /api/qr/attendance
 * @desc    Get all QR attendances for a tenant
 * @access  Private
 */
app.get('/api/qr/attendance', authenticateToken, async (req, res) => {
  try {
    const { qrCodeId, userId, eventId, status, limit = 50, offset = 0 } = req.query;
    
    let tenantAttendances = qrAttendances.filter(attendance => attendance.tenantId === req.user.tenantId);
    
    // Apply filters
    if (qrCodeId) {
      tenantAttendances = tenantAttendances.filter(attendance => attendance.qrCodeId === qrCodeId);
    }
    if (userId) {
      tenantAttendances = tenantAttendances.filter(attendance => attendance.userId === userId);
    }
    if (eventId) {
      tenantAttendances = tenantAttendances.filter(attendance => attendance.eventId === eventId);
    }
    if (status) {
      tenantAttendances = tenantAttendances.filter(attendance => attendance.status === status);
    }
    
    // Sort by check-in time
    tenantAttendances = tenantAttendances
      .sort((a, b) => b.checkInTime.getTime() - a.checkInTime.getTime())
      .slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));
    
    res.json({
      success: true,
      data: { qrAttendances: tenantAttendances },
      count: tenantAttendances.length,
      total: qrAttendances.filter(attendance => attendance.tenantId === req.user.tenantId).length
    });
  } catch (error) {
    logger.error('Error fetching QR attendances:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch QR attendances'
    });
  }
});

// ============================================
// QR ACCESS ROUTES
// ============================================

/**
 * @route   POST /api/qr/access
 * @desc    Record QR access
 * @access  Private
 */
app.post('/api/qr/access', authenticateToken, validateQRAccess, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { qrCodeId, userId, resourceId, resourceType, accessType, granted, reason, location, metadata } = req.body;
    
    const access: QRAccess = {
      id: uuidv4(),
      qrCodeId,
      userId,
      resourceId,
      resourceType,
      accessTime: new Date(),
      accessType,
      granted,
      reason,
      location: location || {
        latitude: 0,
        longitude: 0,
        accuracy: 0
      },
      metadata: {
        deviceInfo: metadata?.deviceInfo || {
          userAgent: req.get('User-Agent') || 'unknown',
          platform: 'unknown',
          browser: 'unknown',
          version: 'unknown'
        },
        customFields: metadata?.customFields || {}
      },
      tenantId: req.user.tenantId,
      createdAt: new Date()
    };

    qrAccesses.push(access);

    // Update QR code usage
    const qrCode = qrCodes.find(qr => qr.id === qrCodeId);
    if (qrCode) {
      qrCode.currentUses++;
      qrCode.updatedAt = new Date();
    }

    logger.info(`QR access recorded: ${access.id}`);
    
    res.status(201).json({
      success: true,
      message: 'QR access recorded successfully',
      data: { access }
    });
  } catch (error) {
    logger.error('Error recording QR access:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record QR access'
    });
  }
});

/**
 * @route   GET /api/qr/access
 * @desc    Get all QR accesses for a tenant
 * @access  Private
 */
app.get('/api/qr/access', authenticateToken, async (req, res) => {
  try {
    const { qrCodeId, userId, resourceId, resourceType, accessType, granted, limit = 50, offset = 0 } = req.query;
    
    let tenantAccesses = qrAccesses.filter(access => access.tenantId === req.user.tenantId);
    
    // Apply filters
    if (qrCodeId) {
      tenantAccesses = tenantAccesses.filter(access => access.qrCodeId === qrCodeId);
    }
    if (userId) {
      tenantAccesses = tenantAccesses.filter(access => access.userId === userId);
    }
    if (resourceId) {
      tenantAccesses = tenantAccesses.filter(access => access.resourceId === resourceId);
    }
    if (resourceType) {
      tenantAccesses = tenantAccesses.filter(access => access.resourceType === resourceType);
    }
    if (accessType) {
      tenantAccesses = tenantAccesses.filter(access => access.accessType === accessType);
    }
    if (granted !== undefined) {
      tenantAccesses = tenantAccesses.filter(access => access.granted === (granted === 'true'));
    }
    
    // Sort by access time
    tenantAccesses = tenantAccesses
      .sort((a, b) => b.accessTime.getTime() - a.accessTime.getTime())
      .slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));
    
    res.json({
      success: true,
      data: { qrAccesses: tenantAccesses },
      count: tenantAccesses.length,
      total: qrAccesses.filter(access => access.tenantId === req.user.tenantId).length
    });
  } catch (error) {
    logger.error('Error fetching QR accesses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch QR accesses'
    });
  }
});

// ============================================
// QR PAYMENT ROUTES
// ============================================

/**
 * @route   POST /api/qr/payment
 * @desc    Process QR payment
 * @access  Private
 */
app.post('/api/qr/payment', authenticateToken, validateQRPayment, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { qrCodeId, userId, amount, currency, paymentMethod, description, metadata } = req.body;
    
    const payment: QRPayment = {
      id: uuidv4(),
      qrCodeId,
      userId,
      amount: parseFloat(amount),
      currency,
      paymentMethod,
      paymentStatus: 'pending',
      transactionId: generateTransactionId(),
      paymentGateway: getPaymentGateway(paymentMethod),
      paymentTime: new Date(),
      description,
      metadata: {
        deviceInfo: metadata?.deviceInfo || {
          userAgent: req.get('User-Agent') || 'unknown',
          platform: 'unknown',
          browser: 'unknown',
          version: 'unknown'
        },
        customFields: metadata?.customFields || {}
      },
      tenantId: req.user.tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    qrPayments.push(payment);

    // Update QR code usage
    const qrCode = qrCodes.find(qr => qr.id === qrCodeId);
    if (qrCode) {
      qrCode.currentUses++;
      qrCode.updatedAt = new Date();
    }

    logger.info(`QR payment processed: ${payment.id}`);
    
    res.status(201).json({
      success: true,
      message: 'QR payment processed successfully',
      data: { payment }
    });
  } catch (error) {
    logger.error('Error processing QR payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process QR payment'
    });
  }
});

/**
 * @route   GET /api/qr/payments
 * @desc    Get all QR payments for a tenant
 * @access  Private
 */
app.get('/api/qr/payments', authenticateToken, async (req, res) => {
  try {
    const { qrCodeId, userId, paymentStatus, paymentMethod, limit = 50, offset = 0 } = req.query;
    
    let tenantPayments = qrPayments.filter(payment => payment.tenantId === req.user.tenantId);
    
    // Apply filters
    if (qrCodeId) {
      tenantPayments = tenantPayments.filter(payment => payment.qrCodeId === qrCodeId);
    }
    if (userId) {
      tenantPayments = tenantPayments.filter(payment => payment.userId === userId);
    }
    if (paymentStatus) {
      tenantPayments = tenantPayments.filter(payment => payment.paymentStatus === paymentStatus);
    }
    if (paymentMethod) {
      tenantPayments = tenantPayments.filter(payment => payment.paymentMethod === paymentMethod);
    }
    
    // Sort by payment time
    tenantPayments = tenantPayments
      .sort((a, b) => b.paymentTime!.getTime() - a.paymentTime!.getTime())
      .slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));
    
    res.json({
      success: true,
      data: { qrPayments: tenantPayments },
      count: tenantPayments.length,
      total: qrPayments.filter(payment => payment.tenantId === req.user.tenantId).length
    });
  } catch (error) {
    logger.error('Error fetching QR payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch QR payments'
    });
  }
});

// ============================================
// QR EVENT ROUTES
// ============================================

/**
 * @route   POST /api/qr/events
 * @desc    Create a QR event
 * @access  Private
 */
app.post('/api/qr/events', authenticateToken, validateQREvent, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { qrCodeId, eventId, eventName, eventType, startTime, endTime, location, description, maxAttendees, metadata } = req.body;
    
    const event: QREvent = {
      id: uuidv4(),
      qrCodeId,
      eventId,
      eventName,
      eventType,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      location,
      description,
      maxAttendees,
      currentAttendees: 0,
      status: req.body.status || 'upcoming',
      metadata: {
        organizer: req.user.id,
        customFields: metadata?.customFields || {}
      },
      tenantId: req.user.tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    qrEvents.push(event);

    logger.info(`QR event created: ${event.id}`);
    
    res.status(201).json({
      success: true,
      message: 'QR event created successfully',
      data: { event }
    });
  } catch (error) {
    logger.error('Error creating QR event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create QR event'
    });
  }
});

/**
 * @route   GET /api/qr/events
 * @desc    Get all QR events for a tenant
 * @access  Private
 */
app.get('/api/qr/events', authenticateToken, async (req, res) => {
  try {
    const { qrCodeId, eventId, eventType, status, limit = 50, offset = 0 } = req.query;
    
    let tenantEvents = qrEvents.filter(event => event.tenantId === req.user.tenantId);
    
    // Apply filters
    if (qrCodeId) {
      tenantEvents = tenantEvents.filter(event => event.qrCodeId === qrCodeId);
    }
    if (eventId) {
      tenantEvents = tenantEvents.filter(event => event.eventId === eventId);
    }
    if (eventType) {
      tenantEvents = tenantEvents.filter(event => event.eventType === eventType);
    }
    if (status) {
      tenantEvents = tenantEvents.filter(event => event.status === status);
    }
    
    // Sort by start time
    tenantEvents = tenantEvents
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
      .slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));
    
    res.json({
      success: true,
      data: { qrEvents: tenantEvents },
      count: tenantEvents.length,
      total: qrEvents.filter(event => event.tenantId === req.user.tenantId).length
    });
  } catch (error) {
    logger.error('Error fetching QR events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch QR events'
    });
  }
});

// ============================================
// QR ANALYTICS ROUTES
// ============================================

/**
 * @route   GET /api/qr/analytics/dashboard
 * @desc    Get QR analytics dashboard
 * @access  Private
 */
app.get('/api/qr/analytics/dashboard', authenticateToken, async (req, res) => {
  try {
    const tenantQRCodes = qrCodes.filter(qrCode => qrCode.tenantId === req.user.tenantId);
    const tenantScans = qrScans.filter(scan => scan.tenantId === req.user.tenantId);
    const tenantAttendances = qrAttendances.filter(attendance => attendance.tenantId === req.user.tenantId);
    const tenantAccesses = qrAccesses.filter(access => access.tenantId === req.user.tenantId);
    const tenantPayments = qrPayments.filter(payment => payment.tenantId === req.user.tenantId);
    const tenantEvents = qrEvents.filter(event => event.tenantId === req.user.tenantId);

    // QR code analytics
    const qrCodeStats = {
      total: tenantQRCodes.length,
      active: tenantQRCodes.filter(qr => qr.status === 'active').length,
      inactive: tenantQRCodes.filter(qr => qr.status === 'inactive').length,
      expired: tenantQRCodes.filter(qr => qr.status === 'expired').length,
      revoked: tenantQRCodes.filter(qr => qr.status === 'revoked').length,
      byType: {
        attendance: tenantQRCodes.filter(qr => qr.type === 'attendance').length,
        access: tenantQRCodes.filter(qr => qr.type === 'access').length,
        payment: tenantQRCodes.filter(qr => qr.type === 'payment').length,
        information: tenantQRCodes.filter(qr => qr.type === 'information').length,
        event: tenantQRCodes.filter(qr => qr.type === 'event').length,
        custom: tenantQRCodes.filter(qr => qr.type === 'custom').length
      },
      totalUses: tenantQRCodes.reduce((sum, qr) => sum + qr.currentUses, 0),
      averageUses: tenantQRCodes.length > 0 ? 
        tenantQRCodes.reduce((sum, qr) => sum + qr.currentUses, 0) / tenantQRCodes.length : 0
    };

    // QR scan analytics
    const scanStats = {
      total: tenantScans.length,
      successful: tenantScans.filter(scan => scan.result.success).length,
      failed: tenantScans.filter(scan => !scan.result.success).length,
      successRate: tenantScans.length > 0 ? 
        (tenantScans.filter(scan => scan.result.success).length / tenantScans.length) * 100 : 0,
      averageConfidence: tenantScans.reduce((sum, scan) => sum + scan.metadata.confidence, 0) / tenantScans.length || 0,
      averageScanDuration: tenantScans.reduce((sum, scan) => sum + scan.metadata.scanDuration, 0) / tenantScans.length || 0,
      recentScans: tenantScans.filter(scan => 
        moment().diff(scan.scannedAt, 'days') <= 7
      ).length
    };

    // QR attendance analytics
    const attendanceStats = {
      total: tenantAttendances.length,
      checkedIn: tenantAttendances.filter(attendance => attendance.status === 'checked-in').length,
      checkedOut: tenantAttendances.filter(attendance => attendance.status === 'checked-out').length,
      late: tenantAttendances.filter(attendance => attendance.status === 'late').length,
      absent: tenantAttendances.filter(attendance => attendance.status === 'absent').length,
      excused: tenantAttendances.filter(attendance => attendance.status === 'excused').length,
      averageDuration: tenantAttendances
        .filter(attendance => attendance.duration)
        .reduce((sum, attendance) => sum + (attendance.duration || 0), 0) / 
        tenantAttendances.filter(attendance => attendance.duration).length || 0,
      recentAttendances: tenantAttendances.filter(attendance => 
        moment().diff(attendance.checkInTime, 'days') <= 7
      ).length
    };

    // QR access analytics
    const accessStats = {
      total: tenantAccesses.length,
      granted: tenantAccesses.filter(access => access.granted).length,
      denied: tenantAccesses.filter(access => !access.granted).length,
      grantRate: tenantAccesses.length > 0 ? 
        (tenantAccesses.filter(access => access.granted).length / tenantAccesses.length) * 100 : 0,
      byResourceType: {
        room: tenantAccesses.filter(access => access.resourceType === 'room').length,
        building: tenantAccesses.filter(access => access.resourceType === 'building').length,
        area: tenantAccesses.filter(access => access.resourceType === 'area').length,
        equipment: tenantAccesses.filter(access => access.resourceType === 'equipment').length,
        vehicle: tenantAccesses.filter(access => access.resourceType === 'vehicle').length,
        custom: tenantAccesses.filter(access => access.resourceType === 'custom').length
      },
      byAccessType: {
        entry: tenantAccesses.filter(access => access.accessType === 'entry').length,
        exit: tenantAccesses.filter(access => access.accessType === 'exit').length,
        both: tenantAccesses.filter(access => access.accessType === 'both').length
      },
      recentAccesses: tenantAccesses.filter(access => 
        moment().diff(access.accessTime, 'days') <= 7
      ).length
    };

    // QR payment analytics
    const paymentStats = {
      total: tenantPayments.length,
      completed: tenantPayments.filter(payment => payment.paymentStatus === 'completed').length,
      pending: tenantPayments.filter(payment => payment.paymentStatus === 'pending').length,
      failed: tenantPayments.filter(payment => payment.paymentStatus === 'failed').length,
      cancelled: tenantPayments.filter(payment => payment.paymentStatus === 'cancelled').length,
      refunded: tenantPayments.filter(payment => payment.paymentStatus === 'refunded').length,
      successRate: tenantPayments.length > 0 ? 
        (tenantPayments.filter(payment => payment.paymentStatus === 'completed').length / tenantPayments.length) * 100 : 0,
      totalAmount: tenantPayments.reduce((sum, payment) => sum + payment.amount, 0),
      averageAmount: tenantPayments.length > 0 ? 
        tenantPayments.reduce((sum, payment) => sum + payment.amount, 0) / tenantPayments.length : 0,
      byPaymentMethod: {
        card: tenantPayments.filter(payment => payment.paymentMethod === 'card').length,
        upi: tenantPayments.filter(payment => payment.paymentMethod === 'upi').length,
        wallet: tenantPayments.filter(payment => payment.paymentMethod === 'wallet').length,
        netbanking: tenantPayments.filter(payment => payment.paymentMethod === 'netbanking').length,
        cash: tenantPayments.filter(payment => payment.paymentMethod === 'cash').length,
        custom: tenantPayments.filter(payment => payment.paymentMethod === 'custom').length
      },
      recentPayments: tenantPayments.filter(payment => 
        moment().diff(payment.paymentTime!, 'days') <= 7
      ).length
    };

    // QR event analytics
    const eventStats = {
      total: tenantEvents.length,
      upcoming: tenantEvents.filter(event => event.status === 'upcoming').length,
      ongoing: tenantEvents.filter(event => event.status === 'ongoing').length,
      completed: tenantEvents.filter(event => event.status === 'completed').length,
      cancelled: tenantEvents.filter(event => event.status === 'cancelled').length,
      byEventType: {
        workshop: tenantEvents.filter(event => event.eventType === 'workshop').length,
        seminar: tenantEvents.filter(event => event.eventType === 'seminar').length,
        meeting: tenantEvents.filter(event => event.eventType === 'meeting').length,
        conference: tenantEvents.filter(event => event.eventType === 'conference').length,
        training: tenantEvents.filter(event => event.eventType === 'training').length,
        custom: tenantEvents.filter(event => event.eventType === 'custom').length
      },
      totalAttendees: tenantEvents.reduce((sum, event) => sum + event.currentAttendees, 0),
      averageAttendees: tenantEvents.length > 0 ? 
        tenantEvents.reduce((sum, event) => sum + event.currentAttendees, 0) / tenantEvents.length : 0,
      recentEvents: tenantEvents.filter(event => 
        moment().diff(event.startTime, 'days') <= 30
      ).length
    };

    res.json({
      success: true,
      data: {
        qrCodes: qrCodeStats,
        scans: scanStats,
        attendances: attendanceStats,
        accesses: accessStats,
        payments: paymentStats,
        events: eventStats,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error fetching QR analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch QR analytics'
    });
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateQRCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

function generateTransactionId(): string {
  return 'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function getPaymentGateway(paymentMethod: string): string {
  const gateways = {
    'card': 'stripe',
    'upi': 'razorpay',
    'wallet': 'razorpay',
    'netbanking': 'razorpay',
    'cash': 'manual',
    'custom': 'custom'
  };
  return gateways[paymentMethod as keyof typeof gateways] || 'unknown';
}

async function processQRScan(qrCodeId: string, image: string, location: any, deviceInfo: any, tenantId: string): Promise<QRScan> {
  try {
    // Find QR code
    const qrCode = qrCodes.find(qr => qr.id === qrCodeId && qr.tenantId === tenantId);
    
    if (!qrCode) {
      throw new Error('QR code not found');
    }
    
    // Check if QR code is active
    if (qrCode.status !== 'active') {
      throw new Error('QR code is not active');
    }
    
    // Check if QR code has expired
    if (qrCode.expiresAt && new Date() > qrCode.expiresAt) {
      throw new Error('QR code has expired');
    }
    
    // Check if QR code has reached max uses
    if (qrCode.maxUses && qrCode.currentUses >= qrCode.maxUses) {
      throw new Error('QR code has reached maximum uses');
    }
    
    // Simulate QR scan processing
    const scanDuration = Math.random() * 1000 + 500; // 500ms to 1.5s
    const imageQuality = Math.random() * 0.3 + 0.7; // 0.7 to 1.0
    const confidence = Math.random() * 0.2 + 0.8; // 0.8 to 1.0
    
    const scan: QRScan = {
      id: uuidv4(),
      qrCodeId,
      userId: req.user?.id,
      scannedAt: new Date(),
      location: location || {
        latitude: 0,
        longitude: 0,
        accuracy: 0
      },
      deviceInfo: deviceInfo || {
        userAgent: req.get('User-Agent') || 'unknown',
        platform: 'unknown',
        browser: 'unknown',
        version: 'unknown',
        ipAddress: req.ip || 'unknown'
      },
      result: {
        success: true,
        message: 'QR code scanned successfully',
        data: qrCode.data
      },
      metadata: {
        scanDuration,
        imageQuality,
        confidence,
        customFields: {}
      },
      tenantId,
      createdAt: new Date()
    };
    
    qrScans.push(scan);
    
    // Update QR code usage
    qrCode.currentUses++;
    qrCode.updatedAt = new Date();
    
    logger.info(`QR code scanned: ${scan.id}, QR code: ${qrCodeId}`);
    
    return scan;
  } catch (error) {
    logger.error('Error processing QR scan:', error);
    
    // Create failed scan record
    const failedScan: QRScan = {
      id: uuidv4(),
      qrCodeId,
      userId: req.user?.id,
      scannedAt: new Date(),
      location: location || {
        latitude: 0,
        longitude: 0,
        accuracy: 0
      },
      deviceInfo: deviceInfo || {
        userAgent: req.get('User-Agent') || 'unknown',
        platform: 'unknown',
        browser: 'unknown',
        version: 'unknown',
        ipAddress: req.ip || 'unknown'
      },
      result: {
        success: false,
        message: error.message,
        error: error.message
      },
      metadata: {
        scanDuration: 0,
        imageQuality: 0,
        confidence: 0,
        customFields: {}
      },
      tenantId,
      createdAt: new Date()
    };
    
    qrScans.push(failedScan);
    
    throw error;
  }
}

// ============================================
// CRON JOBS
// ============================================

// Generate QR analytics metrics daily
cron.schedule('0 1 * * *', async () => {
  logger.info('Generating QR analytics metrics...');
  
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const today = new Date();
  
  const tenantQRCodes = qrCodes.filter(qrCode => 
    qrCode.tenantId === 'default' && 
    qrCode.createdAt >= yesterday && 
    qrCode.createdAt < today
  );
  
  const tenantScans = qrScans.filter(scan => 
    scan.tenantId === 'default' && 
    scan.scannedAt >= yesterday && 
    scan.scannedAt < today
  );
  
  const tenantAttendances = qrAttendances.filter(attendance => 
    attendance.tenantId === 'default' && 
    attendance.checkInTime >= yesterday && 
    attendance.checkInTime < today
  );
  
  const tenantAccesses = qrAccesses.filter(access => 
    access.tenantId === 'default' && 
    access.accessTime >= yesterday && 
    access.accessTime < today
  );
  
  const tenantPayments = qrPayments.filter(payment => 
    payment.tenantId === 'default' && 
    payment.paymentTime! >= yesterday && 
    payment.paymentTime! < today
  );
  
  const metrics = [
    {
      id: uuidv4(),
      qrCodeId: 'all',
      metric: 'qr_codes_created_daily',
      value: tenantQRCodes.length,
      unit: 'count',
      period: 'daily' as const,
      date: yesterday,
      tenantId: 'default',
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      qrCodeId: 'all',
      metric: 'qr_scans_daily',
      value: tenantScans.length,
      unit: 'count',
      period: 'daily' as const,
      date: yesterday,
      tenantId: 'default',
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      qrCodeId: 'all',
      metric: 'qr_attendances_daily',
      value: tenantAttendances.length,
      unit: 'count',
      period: 'daily' as const,
      date: yesterday,
      tenantId: 'default',
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      qrCodeId: 'all',
      metric: 'qr_accesses_daily',
      value: tenantAccesses.length,
      unit: 'count',
      period: 'daily' as const,
      date: yesterday,
      tenantId: 'default',
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      qrCodeId: 'all',
      metric: 'qr_payments_daily',
      value: tenantPayments.length,
      unit: 'count',
      period: 'daily' as const,
      date: yesterday,
      tenantId: 'default',
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      qrCodeId: 'all',
      metric: 'qr_scan_success_rate_daily',
      value: tenantScans.length > 0 ? 
        (tenantScans.filter(scan => scan.result.success).length / tenantScans.length) * 100 : 0,
      unit: 'percentage',
      period: 'daily' as const,
      date: yesterday,
      tenantId: 'default',
      createdAt: new Date()
    }
  ];
  
  qrAnalytics.push(...metrics);
  logger.info(`Generated ${metrics.length} QR analytics metrics`);
});

// Clean up old data weekly
cron.schedule('0 2 * * 0', async () => {
  logger.info('Cleaning up old QR data...');
  
  const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days ago
  
  // Clean up old scans
  const initialScansCount = qrScans.length;
  const filteredScans = qrScans.filter(scan => scan.createdAt > cutoffDate);
  qrScans.length = 0;
  qrScans.push(...filteredScans);
  
  // Clean up old analytics
  const initialAnalyticsCount = qrAnalytics.length;
  const filteredAnalytics = qrAnalytics.filter(analytics => analytics.createdAt > cutoffDate);
  qrAnalytics.length = 0;
  qrAnalytics.push(...filteredAnalytics);
  
  logger.info(`Cleaned up ${initialScansCount - qrScans.length} old QR scans`);
  logger.info(`Cleaned up ${initialAnalyticsCount - qrAnalytics.length} old QR analytics`);
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
const PORT = process.env.PORT || 3012;

const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 QR Service running on port ${PORT}`);
      logger.info(`📱 QR Code Management: Active`);
      logger.info(`📷 QR Scanning: Active`);
      logger.info(`✅ QR Attendance: Active`);
      logger.info(`🔐 QR Access Control: Active`);
      logger.info(`💳 QR Payments: Active`);
      logger.info(`📅 QR Events: Active`);
      logger.info(`📊 QR Analytics: Active`);
      logger.info(`⏰ Automated Metrics: Active`);
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
