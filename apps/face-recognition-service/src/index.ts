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
  defaultMeta: { service: 'face-recognition-service' },
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
  process.env.DATABASE_URL || 'postgresql://localhost:5432/studyspot_face_recognition',
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

// Face Recognition Models and Interfaces
interface FaceEnrollment {
  id: string;
  userId: string;
  faceId: string;
  faceImage: string;
  faceEncoding: number[];
  faceLandmarks: {
    leftEye: [number, number];
    rightEye: [number, number];
    nose: [number, number];
    leftMouth: [number, number];
    rightMouth: [number, number];
  };
  quality: {
    brightness: number;
    contrast: number;
    sharpness: number;
    blur: number;
    pose: number;
    occlusion: number;
    overall: number;
  };
  metadata: {
    age: number;
    gender: 'male' | 'female' | 'unknown';
    emotion: 'happy' | 'sad' | 'angry' | 'surprised' | 'fearful' | 'disgusted' | 'neutral' | 'unknown';
    glasses: boolean;
    mask: boolean;
    beard: boolean;
    mustache: boolean;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
}

interface FaceRecognition {
  id: string;
  userId?: string;
  faceId?: string;
  confidence: number;
  distance: number;
  threshold: number;
  isMatch: boolean;
  image: string;
  faceBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  landmarks: {
    leftEye: [number, number];
    rightEye: [number, number];
    nose: [number, number];
    leftMouth: [number, number];
    rightMouth: [number, number];
  };
  quality: {
    brightness: number;
    contrast: number;
    sharpness: number;
    blur: number;
    pose: number;
    occlusion: number;
    overall: number;
  };
  metadata: {
    age: number;
    gender: 'male' | 'female' | 'unknown';
    emotion: 'happy' | 'sad' | 'angry' | 'surprised' | 'fearful' | 'disgusted' | 'neutral' | 'unknown';
    glasses: boolean;
    mask: boolean;
    beard: boolean;
    mustache: boolean;
  };
  timestamp: Date;
  tenantId: string;
  createdAt: Date;
}

interface FaceDetection {
  id: string;
  image: string;
  faces: {
    faceId: string;
    faceBox: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    landmarks: {
      leftEye: [number, number];
      rightEye: [number, number];
      nose: [number, number];
      leftMouth: [number, number];
      rightMouth: [number, number];
    };
    quality: {
      brightness: number;
      contrast: number;
      sharpness: number;
      blur: number;
      pose: number;
      occlusion: number;
      overall: number;
    };
    metadata: {
      age: number;
      gender: 'male' | 'female' | 'unknown';
      emotion: 'happy' | 'sad' | 'angry' | 'surprised' | 'fearful' | 'disgusted' | 'neutral' | 'unknown';
      glasses: boolean;
      mask: boolean;
      beard: boolean;
      mustache: boolean;
    };
  }[];
  timestamp: Date;
  tenantId: string;
  createdAt: Date;
}

interface FaceModel {
  id: string;
  name: string;
  version: string;
  type: 'detection' | 'recognition' | 'emotion' | 'age' | 'gender' | 'custom';
  status: 'training' | 'trained' | 'deployed' | 'failed' | 'archived';
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  trainingData: {
    totalImages: number;
    totalFaces: number;
    classes: number;
    augmentation: boolean;
  };
  modelPath: string;
  config: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
}

interface FaceRecognitionSession {
  id: string;
  userId: string;
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  attempts: number;
  successfulAttempts: number;
  failedAttempts: number;
  averageConfidence: number;
  bestConfidence: number;
  worstConfidence: number;
  status: 'active' | 'completed' | 'failed' | 'timeout';
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
  };
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface FaceRecognitionMetrics {
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
const faceEnrollments: FaceEnrollment[] = [];
const faceRecognitions: FaceRecognition[] = [];
const faceDetections: FaceDetection[] = [];
const faceModels: FaceModel[] = [];
const faceRecognitionSessions: FaceRecognitionSession[] = [];
const faceRecognitionMetrics: FaceRecognitionMetrics[] = [];

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
const validateFaceEnrollment = [
  body('userId').isUUID().withMessage('Valid user ID is required'),
  body('faceImage').notEmpty().withMessage('Face image is required'),
  body('faceEncoding').isArray().withMessage('Face encoding must be an array'),
  body('faceLandmarks').isObject().withMessage('Face landmarks are required'),
  body('quality').isObject().withMessage('Quality metrics are required'),
  body('metadata').isObject().withMessage('Metadata is required')
];

const validateFaceRecognition = [
  body('image').notEmpty().withMessage('Image is required'),
  body('threshold').optional().isFloat({ min: 0, max: 1 }).withMessage('Threshold must be between 0 and 1')
];

const validateFaceDetection = [
  body('image').notEmpty().withMessage('Image is required')
];

const validateFaceModel = [
  body('name').notEmpty().withMessage('Model name is required'),
  body('type').isIn(['detection', 'recognition', 'emotion', 'age', 'gender', 'custom']).withMessage('Invalid model type'),
  body('status').isIn(['training', 'trained', 'deployed', 'failed', 'archived']).withMessage('Invalid status')
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
    message: 'Face Recognition Service is healthy',
    timestamp: new Date().toISOString(),
    faceEnrollments: faceEnrollments.length,
    faceRecognitions: faceRecognitions.length,
    faceDetections: faceDetections.length,
    faceModels: faceModels.length,
    faceRecognitionSessions: faceRecognitionSessions.length,
    faceRecognitionMetrics: faceRecognitionMetrics.length
  });
});

// ============================================
// FACE ENROLLMENT ROUTES
// ============================================

/**
 * @route   POST /api/face-recognition/enroll
 * @desc    Enroll a face for recognition
 * @access  Private
 */
app.post('/api/face-recognition/enroll', authenticateToken, upload.single('faceImage'), validateFaceEnrollment, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { userId, faceEncoding, faceLandmarks, quality, metadata } = req.body;
    
    // Process face image
    const faceImage = req.file ? req.file.path : req.body.faceImage;
    
    // Generate face ID
    const faceId = uuidv4();
    
    // Create face enrollment
    const faceEnrollment: FaceEnrollment = {
      id: uuidv4(),
      userId,
      faceId,
      faceImage,
      faceEncoding: faceEncoding || generateRandomFaceEncoding(),
      faceLandmarks: faceLandmarks || generateRandomLandmarks(),
      quality: quality || generateRandomQuality(),
      metadata: metadata || generateRandomMetadata(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      tenantId: req.user.tenantId
    };

    faceEnrollments.push(faceEnrollment);

    logger.info(`Face enrolled: ${faceEnrollment.id} for user ${userId}`);
    
    res.status(201).json({
      success: true,
      message: 'Face enrolled successfully',
      data: { 
        faceEnrollment: {
          id: faceEnrollment.id,
          faceId: faceEnrollment.faceId,
          userId: faceEnrollment.userId,
          quality: faceEnrollment.quality,
          metadata: faceEnrollment.metadata,
          createdAt: faceEnrollment.createdAt
        }
      }
    });
  } catch (error) {
    logger.error('Error enrolling face:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enroll face'
    });
  }
});

/**
 * @route   GET /api/face-recognition/enrollments
 * @desc    Get all face enrollments for a tenant
 * @access  Private
 */
app.get('/api/face-recognition/enrollments', authenticateToken, async (req, res) => {
  try {
    const { userId, isActive, limit = 50, offset = 0 } = req.query;
    
    let tenantEnrollments = faceEnrollments.filter(enrollment => enrollment.tenantId === req.user.tenantId);
    
    // Apply filters
    if (userId) {
      tenantEnrollments = tenantEnrollments.filter(enrollment => enrollment.userId === userId);
    }
    if (isActive !== undefined) {
      tenantEnrollments = tenantEnrollments.filter(enrollment => enrollment.isActive === (isActive === 'true'));
    }
    
    // Sort by creation date
    tenantEnrollments = tenantEnrollments
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));
    
    res.json({
      success: true,
      data: { faceEnrollments: tenantEnrollments },
      count: tenantEnrollments.length,
      total: faceEnrollments.filter(enrollment => enrollment.tenantId === req.user.tenantId).length
    });
  } catch (error) {
    logger.error('Error fetching face enrollments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch face enrollments'
    });
  }
});

// ============================================
// FACE RECOGNITION ROUTES
// ============================================

/**
 * @route   POST /api/face-recognition/recognize
 * @desc    Recognize a face
 * @access  Private
 */
app.post('/api/face-recognition/recognize', authenticateToken, upload.single('image'), validateFaceRecognition, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { threshold = 0.6 } = req.body;
    const image = req.file ? req.file.path : req.body.image;
    
    // Process face recognition
    const recognitionResult = await processFaceRecognition(image, threshold, req.user.tenantId);
    
    res.json({
      success: true,
      message: 'Face recognition completed',
      data: { recognition: recognitionResult }
    });
  } catch (error) {
    logger.error('Error recognizing face:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to recognize face',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/face-recognition/recognitions
 * @desc    Get all face recognitions for a tenant
 * @access  Private
 */
app.get('/api/face-recognition/recognitions', authenticateToken, async (req, res) => {
  try {
    const { userId, isMatch, limit = 50, offset = 0 } = req.query;
    
    let tenantRecognitions = faceRecognitions.filter(recognition => recognition.tenantId === req.user.tenantId);
    
    // Apply filters
    if (userId) {
      tenantRecognitions = tenantRecognitions.filter(recognition => recognition.userId === userId);
    }
    if (isMatch !== undefined) {
      tenantRecognitions = tenantRecognitions.filter(recognition => recognition.isMatch === (isMatch === 'true'));
    }
    
    // Sort by timestamp
    tenantRecognitions = tenantRecognitions
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));
    
    res.json({
      success: true,
      data: { faceRecognitions: tenantRecognitions },
      count: tenantRecognitions.length,
      total: faceRecognitions.filter(recognition => recognition.tenantId === req.user.tenantId).length
    });
  } catch (error) {
    logger.error('Error fetching face recognitions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch face recognitions'
    });
  }
});

// ============================================
// FACE DETECTION ROUTES
// ============================================

/**
 * @route   POST /api/face-recognition/detect
 * @desc    Detect faces in an image
 * @access  Private
 */
app.post('/api/face-recognition/detect', authenticateToken, upload.single('image'), validateFaceDetection, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const image = req.file ? req.file.path : req.body.image;
    
    // Process face detection
    const detectionResult = await processFaceDetection(image, req.user.tenantId);
    
    res.json({
      success: true,
      message: 'Face detection completed',
      data: { detection: detectionResult }
    });
  } catch (error) {
    logger.error('Error detecting faces:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to detect faces',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/face-recognition/detections
 * @desc    Get all face detections for a tenant
 * @access  Private
 */
app.get('/api/face-recognition/detections', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    let tenantDetections = faceDetections.filter(detection => detection.tenantId === req.user.tenantId);
    
    // Sort by timestamp
    tenantDetections = tenantDetections
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));
    
    res.json({
      success: true,
      data: { faceDetections: tenantDetections },
      count: tenantDetections.length,
      total: faceDetections.filter(detection => detection.tenantId === req.user.tenantId).length
    });
  } catch (error) {
    logger.error('Error fetching face detections:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch face detections'
    });
  }
});

// ============================================
// FACE MODEL ROUTES
// ============================================

/**
 * @route   POST /api/face-recognition/models
 * @desc    Create a new face model
 * @access  Private
 */
app.post('/api/face-recognition/models', authenticateToken, validateFaceModel, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { name, type, status, trainingData, config } = req.body;
    
    const faceModel: FaceModel = {
      id: uuidv4(),
      name,
      version: '1.0.0',
      type,
      status: status || 'training',
      accuracy: 0,
      precision: 0,
      recall: 0,
      f1Score: 0,
      trainingData: trainingData || {
        totalImages: 0,
        totalFaces: 0,
        classes: 0,
        augmentation: false
      },
      modelPath: '',
      config: config || {},
      createdAt: new Date(),
      updatedAt: new Date(),
      tenantId: req.user.tenantId
    };

    faceModels.push(faceModel);

    logger.info(`Face model created: ${faceModel.id}`);
    
    res.status(201).json({
      success: true,
      message: 'Face model created successfully',
      data: { faceModel }
    });
  } catch (error) {
    logger.error('Error creating face model:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create face model'
    });
  }
});

/**
 * @route   GET /api/face-recognition/models
 * @desc    Get all face models for a tenant
 * @access  Private
 */
app.get('/api/face-recognition/models', authenticateToken, async (req, res) => {
  try {
    const { type, status, limit = 50, offset = 0 } = req.query;
    
    let tenantModels = faceModels.filter(model => model.tenantId === req.user.tenantId);
    
    // Apply filters
    if (type) {
      tenantModels = tenantModels.filter(model => model.type === type);
    }
    if (status) {
      tenantModels = tenantModels.filter(model => model.status === status);
    }
    
    // Sort by creation date
    tenantModels = tenantModels
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));
    
    res.json({
      success: true,
      data: { faceModels: tenantModels },
      count: tenantModels.length,
      total: faceModels.filter(model => model.tenantId === req.user.tenantId).length
    });
  } catch (error) {
    logger.error('Error fetching face models:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch face models'
    });
  }
});

// ============================================
// FACE RECOGNITION SESSION ROUTES
// ============================================

/**
 * @route   POST /api/face-recognition/sessions
 * @desc    Create a new face recognition session
 * @access  Private
 */
app.post('/api/face-recognition/sessions', authenticateToken, async (req, res) => {
  try {
    const { userId, location, deviceInfo } = req.body;
    
    const session: FaceRecognitionSession = {
      id: uuidv4(),
      userId,
      sessionId: uuidv4(),
      startTime: new Date(),
      attempts: 0,
      successfulAttempts: 0,
      failedAttempts: 0,
      averageConfidence: 0,
      bestConfidence: 0,
      worstConfidence: 1,
      status: 'active',
      location,
      deviceInfo: deviceInfo || {
        userAgent: req.get('User-Agent') || 'unknown',
        platform: 'unknown',
        browser: 'unknown',
        version: 'unknown'
      },
      tenantId: req.user.tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    faceRecognitionSessions.push(session);

    logger.info(`Face recognition session created: ${session.id}`);
    
    res.status(201).json({
      success: true,
      message: 'Face recognition session created successfully',
      data: { session }
    });
  } catch (error) {
    logger.error('Error creating face recognition session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create face recognition session'
    });
  }
});

/**
 * @route   PUT /api/face-recognition/sessions/:id/end
 * @desc    End a face recognition session
 * @access  Private
 */
app.put('/api/face-recognition/sessions/:id/end', authenticateToken, async (req, res) => {
  try {
    const sessionId = req.params.id;
    const session = faceRecognitionSessions.find(s => s.id === sessionId && s.tenantId === req.user.tenantId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Face recognition session not found'
      });
    }

    const endTime = new Date();
    const duration = endTime.getTime() - session.startTime.getTime();
    
    session.endTime = endTime;
    session.duration = duration;
    session.status = 'completed';
    session.updatedAt = new Date();

    logger.info(`Face recognition session ended: ${session.id}`);
    
    res.json({
      success: true,
      message: 'Face recognition session ended successfully',
      data: { session }
    });
  } catch (error) {
    logger.error('Error ending face recognition session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end face recognition session'
    });
  }
});

// ============================================
// FACE RECOGNITION ANALYTICS ROUTES
// ============================================

/**
 * @route   GET /api/face-recognition/analytics/dashboard
 * @desc    Get face recognition analytics dashboard
 * @access  Private
 */
app.get('/api/face-recognition/analytics/dashboard', authenticateToken, async (req, res) => {
  try {
    const tenantEnrollments = faceEnrollments.filter(enrollment => enrollment.tenantId === req.user.tenantId);
    const tenantRecognitions = faceRecognitions.filter(recognition => recognition.tenantId === req.user.tenantId);
    const tenantDetections = faceDetections.filter(detection => detection.tenantId === req.user.tenantId);
    const tenantModels = faceModels.filter(model => model.tenantId === req.user.tenantId);
    const tenantSessions = faceRecognitionSessions.filter(session => session.tenantId === req.user.tenantId);

    // Face enrollment analytics
    const enrollmentStats = {
      total: tenantEnrollments.length,
      active: tenantEnrollments.filter(e => e.isActive).length,
      inactive: tenantEnrollments.filter(e => !e.isActive).length,
      byQuality: {
        excellent: tenantEnrollments.filter(e => e.quality.overall >= 0.9).length,
        good: tenantEnrollments.filter(e => e.quality.overall >= 0.7 && e.quality.overall < 0.9).length,
        fair: tenantEnrollments.filter(e => e.quality.overall >= 0.5 && e.quality.overall < 0.7).length,
        poor: tenantEnrollments.filter(e => e.quality.overall < 0.5).length
      },
      byGender: {
        male: tenantEnrollments.filter(e => e.metadata.gender === 'male').length,
        female: tenantEnrollments.filter(e => e.metadata.gender === 'female').length,
        unknown: tenantEnrollments.filter(e => e.metadata.gender === 'unknown').length
      },
      byAge: {
        '0-18': tenantEnrollments.filter(e => e.metadata.age >= 0 && e.metadata.age <= 18).length,
        '19-30': tenantEnrollments.filter(e => e.metadata.age >= 19 && e.metadata.age <= 30).length,
        '31-50': tenantEnrollments.filter(e => e.metadata.age >= 31 && e.metadata.age <= 50).length,
        '51-70': tenantEnrollments.filter(e => e.metadata.age >= 51 && e.metadata.age <= 70).length,
        '70+': tenantEnrollments.filter(e => e.metadata.age > 70).length
      },
      averageQuality: tenantEnrollments.reduce((sum, e) => sum + e.quality.overall, 0) / tenantEnrollments.length || 0
    };

    // Face recognition analytics
    const recognitionStats = {
      total: tenantRecognitions.length,
      matches: tenantRecognitions.filter(r => r.isMatch).length,
      nonMatches: tenantRecognitions.filter(r => !r.isMatch).length,
      byConfidence: {
        high: tenantRecognitions.filter(r => r.confidence >= 0.8).length,
        medium: tenantRecognitions.filter(r => r.confidence >= 0.6 && r.confidence < 0.8).length,
        low: tenantRecognitions.filter(r => r.confidence < 0.6).length
      },
      averageConfidence: tenantRecognitions.reduce((sum, r) => sum + r.confidence, 0) / tenantRecognitions.length || 0,
      averageDistance: tenantRecognitions.reduce((sum, r) => sum + r.distance, 0) / tenantRecognitions.length || 0,
      successRate: tenantRecognitions.length > 0 ? 
        (tenantRecognitions.filter(r => r.isMatch).length / tenantRecognitions.length) * 100 : 0
    };

    // Face detection analytics
    const detectionStats = {
      total: tenantDetections.length,
      totalFaces: tenantDetections.reduce((sum, d) => sum + d.faces.length, 0),
      averageFacesPerImage: tenantDetections.length > 0 ? 
        tenantDetections.reduce((sum, d) => sum + d.faces.length, 0) / tenantDetections.length : 0,
      byFaceCount: {
        '0': tenantDetections.filter(d => d.faces.length === 0).length,
        '1': tenantDetections.filter(d => d.faces.length === 1).length,
        '2-5': tenantDetections.filter(d => d.faces.length >= 2 && d.faces.length <= 5).length,
        '6+': tenantDetections.filter(d => d.faces.length > 5).length
      },
      byQuality: {
        excellent: tenantDetections.reduce((sum, d) => 
          sum + d.faces.filter(f => f.quality.overall >= 0.9).length, 0),
        good: tenantDetections.reduce((sum, d) => 
          sum + d.faces.filter(f => f.quality.overall >= 0.7 && f.quality.overall < 0.9).length, 0),
        fair: tenantDetections.reduce((sum, d) => 
          sum + d.faces.filter(f => f.quality.overall >= 0.5 && f.quality.overall < 0.7).length, 0),
        poor: tenantDetections.reduce((sum, d) => 
          sum + d.faces.filter(f => f.quality.overall < 0.5).length, 0)
      }
    };

    // Face model analytics
    const modelStats = {
      total: tenantModels.length,
      byType: {
        detection: tenantModels.filter(m => m.type === 'detection').length,
        recognition: tenantModels.filter(m => m.type === 'recognition').length,
        emotion: tenantModels.filter(m => m.type === 'emotion').length,
        age: tenantModels.filter(m => m.type === 'age').length,
        gender: tenantModels.filter(m => m.type === 'gender').length,
        custom: tenantModels.filter(m => m.type === 'custom').length
      },
      byStatus: {
        training: tenantModels.filter(m => m.status === 'training').length,
        trained: tenantModels.filter(m => m.status === 'trained').length,
        deployed: tenantModels.filter(m => m.status === 'deployed').length,
        failed: tenantModels.filter(m => m.status === 'failed').length,
        archived: tenantModels.filter(m => m.status === 'archived').length
      },
      averageAccuracy: tenantModels.reduce((sum, m) => sum + m.accuracy, 0) / tenantModels.length || 0,
      averagePrecision: tenantModels.reduce((sum, m) => sum + m.precision, 0) / tenantModels.length || 0,
      averageRecall: tenantModels.reduce((sum, m) => sum + m.recall, 0) / tenantModels.length || 0,
      averageF1Score: tenantModels.reduce((sum, m) => sum + m.f1Score, 0) / tenantModels.length || 0
    };

    // Face recognition session analytics
    const sessionStats = {
      total: tenantSessions.length,
      active: tenantSessions.filter(s => s.status === 'active').length,
      completed: tenantSessions.filter(s => s.status === 'completed').length,
      failed: tenantSessions.filter(s => s.status === 'failed').length,
      timeout: tenantSessions.filter(s => s.status === 'timeout').length,
      averageDuration: tenantSessions
        .filter(s => s.duration)
        .reduce((sum, s) => sum + (s.duration || 0), 0) / 
        tenantSessions.filter(s => s.duration).length || 0,
      averageAttempts: tenantSessions.reduce((sum, s) => sum + s.attempts, 0) / tenantSessions.length || 0,
      averageConfidence: tenantSessions.reduce((sum, s) => sum + s.averageConfidence, 0) / tenantSessions.length || 0,
      successRate: tenantSessions.length > 0 ? 
        (tenantSessions.reduce((sum, s) => sum + s.successfulAttempts, 0) / 
         tenantSessions.reduce((sum, s) => sum + s.attempts, 0)) * 100 : 0
    };

    res.json({
      success: true,
      data: {
        enrollments: enrollmentStats,
        recognitions: recognitionStats,
        detections: detectionStats,
        models: modelStats,
        sessions: sessionStats,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error fetching face recognition analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch face recognition analytics'
    });
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

async function processFaceRecognition(image: string, threshold: number, tenantId: string): Promise<FaceRecognition> {
  try {
    // Simulate face recognition processing
    const faceId = uuidv4();
    const confidence = Math.random() * 0.4 + 0.6; // 0.6 to 1.0
    const distance = Math.random() * 0.3 + 0.1; // 0.1 to 0.4
    const isMatch = confidence >= threshold;
    
    const recognition: FaceRecognition = {
      id: uuidv4(),
      userId: isMatch ? faceEnrollments[Math.floor(Math.random() * faceEnrollments.length)]?.userId : undefined,
      faceId: isMatch ? faceEnrollments[Math.floor(Math.random() * faceEnrollments.length)]?.faceId : undefined,
      confidence,
      distance,
      threshold,
      isMatch,
      image,
      faceBox: {
        x: Math.floor(Math.random() * 200),
        y: Math.floor(Math.random() * 200),
        width: Math.floor(Math.random() * 100) + 50,
        height: Math.floor(Math.random() * 100) + 50
      },
      landmarks: generateRandomLandmarks(),
      quality: generateRandomQuality(),
      metadata: generateRandomMetadata(),
      timestamp: new Date(),
      tenantId,
      createdAt: new Date()
    };

    faceRecognitions.push(recognition);
    
    logger.info(`Face recognition processed: ${recognition.id}, confidence: ${confidence}, match: ${isMatch}`);
    
    return recognition;
  } catch (error) {
    logger.error('Error processing face recognition:', error);
    throw error;
  }
}

async function processFaceDetection(image: string, tenantId: string): Promise<FaceDetection> {
  try {
    // Simulate face detection processing
    const faceCount = Math.floor(Math.random() * 5) + 1; // 1 to 5 faces
    const faces = [];
    
    for (let i = 0; i < faceCount; i++) {
      faces.push({
        faceId: uuidv4(),
        faceBox: {
          x: Math.floor(Math.random() * 200),
          y: Math.floor(Math.random() * 200),
          width: Math.floor(Math.random() * 100) + 50,
          height: Math.floor(Math.random() * 100) + 50
        },
        landmarks: generateRandomLandmarks(),
        quality: generateRandomQuality(),
        metadata: generateRandomMetadata()
      });
    }
    
    const detection: FaceDetection = {
      id: uuidv4(),
      image,
      faces,
      timestamp: new Date(),
      tenantId,
      createdAt: new Date()
    };

    faceDetections.push(detection);
    
    logger.info(`Face detection processed: ${detection.id}, faces: ${faceCount}`);
    
    return detection;
  } catch (error) {
    logger.error('Error processing face detection:', error);
    throw error;
  }
}

function generateRandomFaceEncoding(): number[] {
  const encoding = [];
  for (let i = 0; i < 128; i++) {
    encoding.push(Math.random() * 2 - 1); // -1 to 1
  }
  return encoding;
}

function generateRandomLandmarks() {
  return {
    leftEye: [Math.random() * 100, Math.random() * 100] as [number, number],
    rightEye: [Math.random() * 100, Math.random() * 100] as [number, number],
    nose: [Math.random() * 100, Math.random() * 100] as [number, number],
    leftMouth: [Math.random() * 100, Math.random() * 100] as [number, number],
    rightMouth: [Math.random() * 100, Math.random() * 100] as [number, number]
  };
}

function generateRandomQuality() {
  return {
    brightness: Math.random(),
    contrast: Math.random(),
    sharpness: Math.random(),
    blur: Math.random(),
    pose: Math.random(),
    occlusion: Math.random(),
    overall: Math.random() * 0.3 + 0.7 // 0.7 to 1.0
  };
}

function generateRandomMetadata() {
  const emotions = ['happy', 'sad', 'angry', 'surprised', 'fearful', 'disgusted', 'neutral', 'unknown'];
  const genders = ['male', 'female', 'unknown'];
  
  return {
    age: Math.floor(Math.random() * 80) + 18, // 18 to 98
    gender: genders[Math.floor(Math.random() * genders.length)] as 'male' | 'female' | 'unknown',
    emotion: emotions[Math.floor(Math.random() * emotions.length)] as 'happy' | 'sad' | 'angry' | 'surprised' | 'fearful' | 'disgusted' | 'neutral' | 'unknown',
    glasses: Math.random() > 0.7,
    mask: Math.random() > 0.9,
    beard: Math.random() > 0.8,
    mustache: Math.random() > 0.9
  };
}

// ============================================
// CRON JOBS
// ============================================

// Generate face recognition metrics daily
cron.schedule('0 1 * * *', async () => {
  logger.info('Generating face recognition metrics...');
  
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const today = new Date();
  
  const tenantEnrollments = faceEnrollments.filter(enrollment => 
    enrollment.tenantId === 'default' && 
    enrollment.createdAt >= yesterday && 
    enrollment.createdAt < today
  );
  
  const tenantRecognitions = faceRecognitions.filter(recognition => 
    recognition.tenantId === 'default' && 
    recognition.timestamp >= yesterday && 
    recognition.timestamp < today
  );
  
  const tenantDetections = faceDetections.filter(detection => 
    detection.tenantId === 'default' && 
    detection.timestamp >= yesterday && 
    detection.timestamp < today
  );
  
  const metrics = [
    {
      id: uuidv4(),
      metric: 'face_enrollments_daily',
      value: tenantEnrollments.length,
      unit: 'count',
      period: 'daily' as const,
      date: yesterday,
      tenantId: 'default',
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      metric: 'face_recognitions_daily',
      value: tenantRecognitions.length,
      unit: 'count',
      period: 'daily' as const,
      date: yesterday,
      tenantId: 'default',
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      metric: 'face_detections_daily',
      value: tenantDetections.length,
      unit: 'count',
      period: 'daily' as const,
      date: yesterday,
      tenantId: 'default',
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      metric: 'face_recognition_success_rate_daily',
      value: tenantRecognitions.length > 0 ? 
        (tenantRecognitions.filter(r => r.isMatch).length / tenantRecognitions.length) * 100 : 0,
      unit: 'percentage',
      period: 'daily' as const,
      date: yesterday,
      tenantId: 'default',
      createdAt: new Date()
    },
    {
      id: uuidv4(),
      metric: 'face_recognition_average_confidence_daily',
      value: tenantRecognitions.reduce((sum, r) => sum + r.confidence, 0) / tenantRecognitions.length || 0,
      unit: 'score',
      period: 'daily' as const,
      date: yesterday,
      tenantId: 'default',
      createdAt: new Date()
    }
  ];
  
  faceRecognitionMetrics.push(...metrics);
  logger.info(`Generated ${metrics.length} face recognition metrics`);
});

// Clean up old data weekly
cron.schedule('0 2 * * 0', async () => {
  logger.info('Cleaning up old face recognition data...');
  
  const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days ago
  
  // Clean up old recognitions
  const initialRecognitionsCount = faceRecognitions.length;
  const filteredRecognitions = faceRecognitions.filter(recognition => recognition.createdAt > cutoffDate);
  faceRecognitions.length = 0;
  faceRecognitions.push(...filteredRecognitions);
  
  // Clean up old detections
  const initialDetectionsCount = faceDetections.length;
  const filteredDetections = faceDetections.filter(detection => detection.createdAt > cutoffDate);
  faceDetections.length = 0;
  faceDetections.push(...filteredDetections);
  
  // Clean up old metrics
  const initialMetricsCount = faceRecognitionMetrics.length;
  const filteredMetrics = faceRecognitionMetrics.filter(metric => metric.createdAt > cutoffDate);
  faceRecognitionMetrics.length = 0;
  faceRecognitionMetrics.push(...filteredMetrics);
  
  logger.info(`Cleaned up ${initialRecognitionsCount - faceRecognitions.length} old face recognitions`);
  logger.info(`Cleaned up ${initialDetectionsCount - faceDetections.length} old face detections`);
  logger.info(`Cleaned up ${initialMetricsCount - faceRecognitionMetrics.length} old face recognition metrics`);
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
const PORT = process.env.PORT || 3011;

const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 Face Recognition Service running on port ${PORT}`);
      logger.info(`👤 Face Enrollment: Active`);
      logger.info(`🔍 Face Recognition: Active`);
      logger.info(`📷 Face Detection: Active`);
      logger.info(`🤖 Face Models: Active`);
      logger.info(`📊 Face Recognition Sessions: Active`);
      logger.info(`📈 Face Recognition Analytics: Active`);
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
