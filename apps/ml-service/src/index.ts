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
  defaultMeta: { service: 'ml-service' },
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
  process.env.DATABASE_URL || 'postgresql://localhost:5432/studyspot_ml',
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

// File upload configuration
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// ML Models
interface MLModel {
  id: string;
  name: string;
  type: 'demand_forecasting' | 'user_behavior' | 'recommendation' | 'fraud_detection' | 'attendance_prediction';
  version: string;
  status: 'training' | 'trained' | 'deployed' | 'failed' | 'retired';
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  trainingDataSize: number;
  lastTrainedAt?: Date;
  deployedAt?: Date;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Prediction {
  id: string;
  modelId: string;
  inputData: Record<string, any>;
  prediction: any;
  confidence: number;
  status: 'pending' | 'completed' | 'failed';
  errorMessage?: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TrainingJob {
  id: string;
  modelId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime?: Date;
  endTime?: Date;
  errorMessage?: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory storage for demo (replace with database in production)
const models: MLModel[] = [];
const predictions: Prediction[] = [];
const trainingJobs: TrainingJob[] = [];

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
const validateModel = [
  body('name').notEmpty().withMessage('Model name is required'),
  body('type').isIn(['demand_forecasting', 'user_behavior', 'recommendation', 'fraud_detection', 'attendance_prediction']).withMessage('Invalid model type')
];

const validatePrediction = [
  body('modelId').notEmpty().withMessage('Model ID is required'),
  body('inputData').isObject().withMessage('Input data must be an object')
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
    message: 'ML Service is healthy',
    timestamp: new Date().toISOString(),
    models: models.length,
    predictions: predictions.length,
    trainingJobs: trainingJobs.length
  });
});

// ============================================
// MODEL MANAGEMENT ROUTES
// ============================================

/**
 * @route   POST /api/ml/models
 * @desc    Create a new ML model
 * @access  Private
 */
app.post('/api/ml/models', authenticateToken, validateModel, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const model: MLModel = {
      id: uuidv4(),
      name: req.body.name,
      type: req.body.type,
      version: '1.0.0',
      status: 'training',
      trainingDataSize: 0,
      tenantId: req.user.tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    models.push(model);

    logger.info(`ML Model created: ${model.id} (${model.type})`);
    
    res.status(201).json({
      success: true,
      message: 'ML Model created successfully',
      data: { model }
    });
  } catch (error) {
    logger.error('Error creating ML model:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create ML model'
    });
  }
});

/**
 * @route   GET /api/ml/models
 * @desc    Get all ML models for a tenant
 * @access  Private
 */
app.get('/api/ml/models', authenticateToken, async (req, res) => {
  try {
    const tenantModels = models.filter(model => model.tenantId === req.user.tenantId);
    
    res.json({
      success: true,
      data: { models: tenantModels },
      count: tenantModels.length
    });
  } catch (error) {
    logger.error('Error fetching ML models:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ML models'
    });
  }
});

/**
 * @route   POST /api/ml/models/:id/train
 * @desc    Start training a model
 * @access  Private
 */
app.post('/api/ml/models/:id/train', authenticateToken, async (req, res) => {
  try {
    const modelIndex = models.findIndex(
      model => model.id === req.params.id && model.tenantId === req.user.tenantId
    );
    
    if (modelIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Model not found'
      });
    }

    const model = models[modelIndex];
    
    if (model.status === 'training') {
      return res.status(400).json({
        success: false,
        message: 'Model is already training'
      });
    }

    // Create training job
    const trainingJob: TrainingJob = {
      id: uuidv4(),
      modelId: model.id,
      status: 'pending',
      progress: 0,
      tenantId: req.user.tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    trainingJobs.push(trainingJob);

    // Update model status
    models[modelIndex] = {
      ...model,
      status: 'training',
      updatedAt: new Date()
    };

    // Start training (in production, this would be queued)
    startModelTraining(trainingJob.id, model.id);

    logger.info(`Model training started: ${model.id}`);
    
    res.json({
      success: true,
      message: 'Model training started',
      data: { 
        model: models[modelIndex],
        trainingJob 
      }
    });
  } catch (error) {
    logger.error('Error starting model training:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start model training'
    });
  }
});

// ============================================
// PREDICTION ROUTES
// ============================================

/**
 * @route   POST /api/ml/predict
 * @desc    Make a prediction using a trained model
 * @access  Private
 */
app.post('/api/ml/predict', authenticateToken, validatePrediction, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const model = models.find(
      m => m.id === req.body.modelId && m.tenantId === req.user.tenantId
    );
    
    if (!model) {
      return res.status(404).json({
        success: false,
        message: 'Model not found'
      });
    }

    if (model.status !== 'deployed') {
      return res.status(400).json({
        success: false,
        message: 'Model is not deployed'
      });
    }

    const prediction: Prediction = {
      id: uuidv4(),
      modelId: req.body.modelId,
      inputData: req.body.inputData,
      prediction: null,
      confidence: 0,
      status: 'pending',
      tenantId: req.user.tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    predictions.push(prediction);

    // Make prediction (in production, this would call the actual ML model)
    const result = await makePrediction(model, req.body.inputData);
    
    // Update prediction
    const predictionIndex = predictions.findIndex(p => p.id === prediction.id);
    if (predictionIndex !== -1) {
      predictions[predictionIndex] = {
        ...predictions[predictionIndex],
        prediction: result.prediction,
        confidence: result.confidence,
        status: 'completed',
        updatedAt: new Date()
      };
    }

    logger.info(`Prediction made: ${prediction.id} using model ${model.id}`);
    
    res.json({
      success: true,
      message: 'Prediction completed successfully',
      data: { prediction: predictions[predictionIndex] }
    });
  } catch (error) {
    logger.error('Error making prediction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to make prediction',
      error: error.message
    });
  }
});

// ============================================
// ANALYTICS ROUTES
// ============================================

/**
 * @route   GET /api/ml/analytics/dashboard
 * @desc    Get ML analytics dashboard
 * @access  Private
 */
app.get('/api/ml/analytics/dashboard', authenticateToken, async (req, res) => {
  try {
    const tenantModels = models.filter(model => model.tenantId === req.user.tenantId);
    const tenantPredictions = predictions.filter(prediction => prediction.tenantId === req.user.tenantId);
    const tenantTrainingJobs = trainingJobs.filter(job => job.tenantId === req.user.tenantId);

    // Model analytics
    const modelStats = {
      total: tenantModels.length,
      training: tenantModels.filter(model => model.status === 'training').length,
      trained: tenantModels.filter(model => model.status === 'trained').length,
      deployed: tenantModels.filter(model => model.status === 'deployed').length,
      failed: tenantModels.filter(model => model.status === 'failed').length,
      retired: tenantModels.filter(model => model.status === 'retired').length,
      byType: {
        demand_forecasting: tenantModels.filter(model => model.type === 'demand_forecasting').length,
        user_behavior: tenantModels.filter(model => model.type === 'user_behavior').length,
        recommendation: tenantModels.filter(model => model.type === 'recommendation').length,
        fraud_detection: tenantModels.filter(model => model.type === 'fraud_detection').length,
        attendance_prediction: tenantModels.filter(model => model.type === 'attendance_prediction').length
      }
    };

    // Prediction analytics
    const predictionStats = {
      total: tenantPredictions.length,
      completed: tenantPredictions.filter(prediction => prediction.status === 'completed').length,
      failed: tenantPredictions.filter(prediction => prediction.status === 'failed').length,
      pending: tenantPredictions.filter(prediction => prediction.status === 'pending').length,
      averageConfidence: tenantPredictions
        .filter(prediction => prediction.status === 'completed')
        .reduce((sum, prediction) => sum + prediction.confidence, 0) / 
        tenantPredictions.filter(prediction => prediction.status === 'completed').length || 0
    };

    // Training job analytics
    const trainingStats = {
      total: tenantTrainingJobs.length,
      pending: tenantTrainingJobs.filter(job => job.status === 'pending').length,
      running: tenantTrainingJobs.filter(job => job.status === 'running').length,
      completed: tenantTrainingJobs.filter(job => job.status === 'completed').length,
      failed: tenantTrainingJobs.filter(job => job.status === 'failed').length
    };

    res.json({
      success: true,
      data: {
        models: modelStats,
        predictions: predictionStats,
        trainingJobs: trainingStats,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error fetching ML analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ML analytics'
    });
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

async function startModelTraining(jobId: string, modelId: string): Promise<void> {
  try {
    // Update training job status
    const jobIndex = trainingJobs.findIndex(job => job.id === jobId);
    if (jobIndex !== -1) {
      trainingJobs[jobIndex] = {
        ...trainingJobs[jobIndex],
        status: 'running',
        startTime: new Date(),
        progress: 0,
        updatedAt: new Date()
      };
    }

    // Simulate training process (in production, this would call Python scripts)
    const trainingSteps = [
      { progress: 20, message: 'Loading data...' },
      { progress: 40, message: 'Preprocessing data...' },
      { progress: 60, message: 'Training model...' },
      { progress: 80, message: 'Validating model...' },
      { progress: 100, message: 'Training completed!' }
    ];

    for (const step of trainingSteps) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time
      
      // Update progress
      if (jobIndex !== -1) {
        trainingJobs[jobIndex] = {
          ...trainingJobs[jobIndex],
          progress: step.progress,
          updatedAt: new Date()
        };
      }
      
      logger.info(`Training progress for ${modelId}: ${step.progress}% - ${step.message}`);
    }

    // Complete training
    if (jobIndex !== -1) {
      trainingJobs[jobIndex] = {
        ...trainingJobs[jobIndex],
        status: 'completed',
        endTime: new Date(),
        progress: 100,
        updatedAt: new Date()
      };
    }

    // Update model status
    const modelIndex = models.findIndex(model => model.id === modelId);
    if (modelIndex !== -1) {
      models[modelIndex] = {
        ...models[modelIndex],
        status: 'trained',
        accuracy: Math.random() * 0.3 + 0.7, // Simulate accuracy between 70-100%
        precision: Math.random() * 0.3 + 0.7,
        recall: Math.random() * 0.3 + 0.7,
        f1Score: Math.random() * 0.3 + 0.7,
        lastTrainedAt: new Date(),
        updatedAt: new Date()
      };
    }

    logger.info(`Model training completed: ${modelId}`);
  } catch (error) {
    logger.error('Model training failed:', error);
    
    // Update training job status
    const jobIndex = trainingJobs.findIndex(job => job.id === jobId);
    if (jobIndex !== -1) {
      trainingJobs[jobIndex] = {
        ...trainingJobs[jobIndex],
        status: 'failed',
        errorMessage: error.message,
        endTime: new Date(),
        updatedAt: new Date()
      };
    }

    // Update model status
    const modelIndex = models.findIndex(model => model.id === modelId);
    if (modelIndex !== -1) {
      models[modelIndex] = {
        ...models[modelIndex],
        status: 'failed',
        updatedAt: new Date()
      };
    }
  }
}

async function makePrediction(model: MLModel, inputData: Record<string, any>): Promise<{ prediction: any; confidence: number }> {
  // Simulate prediction based on model type
  let prediction: any;
  let confidence: number;

  switch (model.type) {
    case 'demand_forecasting':
      prediction = Math.floor(Math.random() * 100) + 50; // Simulate demand between 50-150
      confidence = Math.random() * 0.3 + 0.7; // 70-100% confidence
      break;
    case 'user_behavior':
      prediction = Math.random() > 0.5 ? 'likely_to_book' : 'unlikely_to_book';
      confidence = Math.random() * 0.3 + 0.7;
      break;
    case 'recommendation':
      prediction = ['Library A', 'Library B', 'Library C'][Math.floor(Math.random() * 3)];
      confidence = Math.random() * 0.3 + 0.7;
      break;
    case 'fraud_detection':
      prediction = Math.random() > 0.1 ? 'legitimate' : 'fraudulent'; // 10% fraud rate
      confidence = Math.random() * 0.3 + 0.7;
      break;
    case 'attendance_prediction':
      prediction = Math.random() > 0.3 ? 'will_attend' : 'will_not_attend'; // 70% attendance rate
      confidence = Math.random() * 0.3 + 0.7;
      break;
    default:
      prediction = 'unknown';
      confidence = 0.5;
  }

  return { prediction, confidence };
}

// ============================================
// CRON JOBS
// ============================================

// Schedule model retraining (daily at 2 AM)
cron.schedule('0 2 * * *', async () => {
  logger.info('Starting scheduled model retraining...');
  
  const modelsToRetrain = models.filter(model => 
    model.status === 'deployed' && 
    model.lastTrainedAt && 
    (Date.now() - model.lastTrainedAt.getTime()) > 7 * 24 * 60 * 60 * 1000 // 7 days
  );

  for (const model of modelsToRetrain) {
    logger.info(`Scheduling retraining for model: ${model.id}`);
    // In production, queue retraining jobs
  }
});

// Schedule prediction cleanup (daily at 3 AM)
cron.schedule('0 3 * * *', async () => {
  logger.info('Starting prediction cleanup...');
  
  const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
  const initialCount = predictions.length;
  
  // Remove old predictions
  const filteredPredictions = predictions.filter(prediction => 
    prediction.createdAt > cutoffDate
  );
  
  predictions.length = 0;
  predictions.push(...filteredPredictions);
  
  logger.info(`Cleaned up ${initialCount - predictions.length} old predictions`);
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
const PORT = process.env.PORT || 3007;

const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 ML Service running on port ${PORT}`);
      logger.info(`🤖 Model Management: Active`);
      logger.info(`🔮 Prediction Engine: Active`);
      logger.info(`📊 ML Analytics: Active`);
      logger.info(`⏰ Scheduled Tasks: Active`);
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
