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
import sharp from 'sharp';
import natural from 'natural';
import Sentiment from 'sentiment';
import nlp from 'compromise';
import franc from 'franc';
import { NlpManager } from 'node-nlp';
import OpenAI from 'openai';
import { Storage } from '@google-cloud/storage';
import AWS from 'aws-sdk';
import Jimp from 'jimp';

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
  defaultMeta: { service: 'ai-service' },
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
  process.env.DATABASE_URL || 'postgresql://localhost:5432/studyspot_ai',
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

// AI Service configurations
const sentiment = new Sentiment();
const nlpManager = new NlpManager({ languages: ['en', 'hi', 'es', 'fr'] });

// OpenAI configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Google Cloud configuration
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE
});

// AWS configuration
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// File upload configuration
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 10 // Max 10 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'text/plain', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// AI Models and Interfaces
interface AIRequest {
  id: string;
  type: 'nlp' | 'computer_vision' | 'sentiment' | 'language_detection' | 'text_generation' | 'image_analysis' | 'chatbot';
  input: string | Buffer;
  parameters?: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: any;
  confidence?: number;
  processingTime?: number;
  errorMessage?: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  context: Record<string, any>;
  status: 'active' | 'inactive' | 'archived';
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface AIInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'recommendation' | 'prediction';
  title: string;
  description: string;
  confidence: number;
  data: Record<string, any>;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory storage for demo (replace with database in production)
const aiRequests: AIRequest[] = [];
const chatSessions: ChatSession[] = [];
const aiInsights: AIInsight[] = [];

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
const validateAIRequest = [
  body('type').isIn(['nlp', 'computer_vision', 'sentiment', 'language_detection', 'text_generation', 'image_analysis', 'chatbot']).withMessage('Invalid AI request type'),
  body('input').notEmpty().withMessage('Input is required'),
  body('parameters').optional().isObject().withMessage('Parameters must be an object')
];

const validateChatMessage = [
  body('content').notEmpty().withMessage('Message content is required'),
  body('sessionId').optional().isUUID().withMessage('Invalid session ID')
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
    message: 'AI Service is healthy',
    timestamp: new Date().toISOString(),
    nlp: 'active',
    computerVision: 'active',
    sentiment: 'active',
    languageDetection: 'active',
    textGeneration: 'active',
    imageAnalysis: 'active',
    chatbot: 'active'
  });
});

// ============================================
// NATURAL LANGUAGE PROCESSING ROUTES
// ============================================

/**
 * @route   POST /api/ai/nlp/analyze
 * @desc    Analyze text using NLP
 * @access  Private
 */
app.post('/api/ai/nlp/analyze', authenticateToken, validateAIRequest, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const startTime = Date.now();
    const text = req.body.input as string;
    const parameters = req.body.parameters || {};

    const aiRequest: AIRequest = {
      id: uuidv4(),
      type: 'nlp',
      input: text,
      parameters,
      status: 'processing',
      tenantId: req.user.tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    aiRequests.push(aiRequest);

    // Perform NLP analysis
    const analysis = await performNLPAnalysis(text, parameters);
    
    // Update request
    const requestIndex = aiRequests.findIndex(r => r.id === aiRequest.id);
    if (requestIndex !== -1) {
      aiRequests[requestIndex] = {
        ...aiRequests[requestIndex],
        status: 'completed',
        result: analysis,
        confidence: analysis.confidence,
        processingTime: Date.now() - startTime,
        updatedAt: new Date()
      };
    }

    logger.info(`NLP analysis completed: ${aiRequest.id}`);
    
    res.json({
      success: true,
      message: 'NLP analysis completed successfully',
      data: { 
        request: aiRequests[requestIndex],
        analysis 
      }
    });
  } catch (error) {
    logger.error('Error performing NLP analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform NLP analysis',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/ai/sentiment/analyze
 * @desc    Analyze sentiment of text
 * @access  Private
 */
app.post('/api/ai/sentiment/analyze', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Text is required'
      });
    }

    const startTime = Date.now();
    
    // Perform sentiment analysis
    const sentimentResult = sentiment.analyze(text);
    
    // Additional analysis using compromise
    const doc = nlp(text);
    const entities = doc.people().out('array');
    const places = doc.places().out('array');
    const topics = doc.topics().out('array');
    
    const result = {
      text,
      sentiment: {
        score: sentimentResult.score,
        comparative: sentimentResult.comparative,
        positive: sentimentResult.positive,
        negative: sentimentResult.negative,
        neutral: sentimentResult.neutral
      },
      entities: {
        people: entities,
        places: places,
        topics: topics
      },
      language: franc(text),
      wordCount: text.split(' ').length,
      characterCount: text.length,
      processingTime: Date.now() - startTime
    };

    logger.info(`Sentiment analysis completed for text: ${text.substring(0, 50)}...`);
    
    res.json({
      success: true,
      message: 'Sentiment analysis completed successfully',
      data: result
    });
  } catch (error) {
    logger.error('Error performing sentiment analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform sentiment analysis',
      error: error.message
    });
  }
});

// ============================================
// COMPUTER VISION ROUTES
// ============================================

/**
 * @route   POST /api/ai/vision/analyze
 * @desc    Analyze image using computer vision
 * @access  Private
 */
app.post('/api/ai/vision/analyze', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image file is required'
      });
    }

    const startTime = Date.now();
    
    // Process image
    const imageBuffer = await sharp(req.file.path)
      .resize(800, 600, { fit: 'inside' })
      .jpeg({ quality: 90 })
      .toBuffer();

    // Perform image analysis
    const analysis = await performImageAnalysis(imageBuffer);
    
    // Clean up uploaded file
    require('fs').unlinkSync(req.file.path);

    const result = {
      filename: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      analysis,
      processingTime: Date.now() - startTime
    };

    logger.info(`Image analysis completed: ${req.file.originalname}`);
    
    res.json({
      success: true,
      message: 'Image analysis completed successfully',
      data: result
    });
  } catch (error) {
    logger.error('Error performing image analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform image analysis',
      error: error.message
    });
  }
});

// ============================================
// TEXT GENERATION ROUTES
// ============================================

/**
 * @route   POST /api/ai/text/generate
 * @desc    Generate text using AI
 * @access  Private
 */
app.post('/api/ai/text/generate', authenticateToken, async (req, res) => {
  try {
    const { prompt, maxTokens = 150, temperature = 0.7, model = 'gpt-3.5-turbo' } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required'
      });
    }

    const startTime = Date.now();
    
    // Generate text using OpenAI
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: 'You are a helpful AI assistant for StudySpot, a library management platform.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: maxTokens,
      temperature,
    });

    const result = {
      prompt,
      generatedText: completion.choices[0].message.content,
      model,
      tokensUsed: completion.usage?.total_tokens,
      processingTime: Date.now() - startTime
    };

    logger.info(`Text generation completed for prompt: ${prompt.substring(0, 50)}...`);
    
    res.json({
      success: true,
      message: 'Text generation completed successfully',
      data: result
    });
  } catch (error) {
    logger.error('Error generating text:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate text',
      error: error.message
    });
  }
});

// ============================================
// CHATBOT ROUTES
// ============================================

/**
 * @route   POST /api/ai/chatbot/message
 * @desc    Send message to AI chatbot
 * @access  Private
 */
app.post('/api/ai/chatbot/message', authenticateToken, validateChatMessage, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { content, sessionId } = req.body;
    const userId = req.user.id;
    
    let session = chatSessions.find(s => s.id === sessionId && s.tenantId === req.user.tenantId);
    
    // Create new session if not provided
    if (!session) {
      session = {
        id: uuidv4(),
        userId,
        messages: [],
        context: {},
        status: 'active',
        tenantId: req.user.tenantId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      chatSessions.push(session);
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      sessionId: session.id,
      role: 'user',
      content,
      timestamp: new Date()
    };
    
    session.messages.push(userMessage);

    // Generate AI response
    const aiResponse = await generateChatbotResponse(session, content);
    
    // Add AI message
    const aiMessage: ChatMessage = {
      id: uuidv4(),
      sessionId: session.id,
      role: 'assistant',
      content: aiResponse.content,
      timestamp: new Date(),
      metadata: aiResponse.metadata
    };
    
    session.messages.push(aiMessage);
    session.updatedAt = new Date();

    logger.info(`Chatbot message processed: ${session.id}`);
    
    res.json({
      success: true,
      message: 'Chatbot response generated successfully',
      data: {
        session,
        userMessage,
        aiMessage
      }
    });
  } catch (error) {
    logger.error('Error processing chatbot message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process chatbot message',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/ai/chatbot/sessions
 * @desc    Get user's chat sessions
 * @access  Private
 */
app.get('/api/ai/chatbot/sessions', authenticateToken, async (req, res) => {
  try {
    const userSessions = chatSessions.filter(
      session => session.userId === req.user.id && session.tenantId === req.user.tenantId
    );
    
    res.json({
      success: true,
      data: { sessions: userSessions },
      count: userSessions.length
    });
  } catch (error) {
    logger.error('Error fetching chat sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat sessions'
    });
  }
});

// ============================================
// AI INSIGHTS ROUTES
// ============================================

/**
 * @route   GET /api/ai/insights
 * @desc    Get AI-generated insights
 * @access  Private
 */
app.get('/api/ai/insights', authenticateToken, async (req, res) => {
  try {
    const { type, priority, limit = 10 } = req.query;
    
    let insights = aiInsights.filter(insight => insight.tenantId === req.user.tenantId);
    
    if (type) {
      insights = insights.filter(insight => insight.type === type);
    }
    
    if (priority) {
      insights = insights.filter(insight => insight.priority === priority);
    }
    
    insights = insights
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, parseInt(limit as string));
    
    res.json({
      success: true,
      data: { insights },
      count: insights.length
    });
  } catch (error) {
    logger.error('Error fetching AI insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch AI insights'
    });
  }
});

// ============================================
// ANALYTICS ROUTES
// ============================================

/**
 * @route   GET /api/ai/analytics/dashboard
 * @desc    Get AI service analytics dashboard
 * @access  Private
 */
app.get('/api/ai/analytics/dashboard', authenticateToken, async (req, res) => {
  try {
    const tenantRequests = aiRequests.filter(request => request.tenantId === req.user.tenantId);
    const tenantSessions = chatSessions.filter(session => session.tenantId === req.user.tenantId);
    const tenantInsights = aiInsights.filter(insight => insight.tenantId === req.user.tenantId);

    // Request analytics
    const requestStats = {
      total: tenantRequests.length,
      completed: tenantRequests.filter(req => req.status === 'completed').length,
      failed: tenantRequests.filter(req => req.status === 'failed').length,
      processing: tenantRequests.filter(req => req.status === 'processing').length,
      byType: {
        nlp: tenantRequests.filter(req => req.type === 'nlp').length,
        computer_vision: tenantRequests.filter(req => req.type === 'computer_vision').length,
        sentiment: tenantRequests.filter(req => req.type === 'sentiment').length,
        language_detection: tenantRequests.filter(req => req.type === 'language_detection').length,
        text_generation: tenantRequests.filter(req => req.type === 'text_generation').length,
        image_analysis: tenantRequests.filter(req => req.type === 'image_analysis').length,
        chatbot: tenantRequests.filter(req => req.type === 'chatbot').length
      },
      averageProcessingTime: tenantRequests
        .filter(req => req.processingTime)
        .reduce((sum, req) => sum + (req.processingTime || 0), 0) / 
        tenantRequests.filter(req => req.processingTime).length || 0
    };

    // Session analytics
    const sessionStats = {
      total: tenantSessions.length,
      active: tenantSessions.filter(session => session.status === 'active').length,
      inactive: tenantSessions.filter(session => session.status === 'inactive').length,
      archived: tenantSessions.filter(session => session.status === 'archived').length,
      averageMessagesPerSession: tenantSessions
        .reduce((sum, session) => sum + session.messages.length, 0) / 
        tenantSessions.length || 0
    };

    // Insight analytics
    const insightStats = {
      total: tenantInsights.length,
      trend: tenantInsights.filter(insight => insight.type === 'trend').length,
      anomaly: tenantInsights.filter(insight => insight.type === 'anomaly').length,
      recommendation: tenantInsights.filter(insight => insight.type === 'recommendation').length,
      prediction: tenantInsights.filter(insight => insight.type === 'prediction').length,
      actionable: tenantInsights.filter(insight => insight.actionable).length,
      byPriority: {
        low: tenantInsights.filter(insight => insight.priority === 'low').length,
        medium: tenantInsights.filter(insight => insight.priority === 'medium').length,
        high: tenantInsights.filter(insight => insight.priority === 'high').length,
        critical: tenantInsights.filter(insight => insight.priority === 'critical').length
      }
    };

    res.json({
      success: true,
      data: {
        requests: requestStats,
        sessions: sessionStats,
        insights: insightStats,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error fetching AI analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch AI analytics'
    });
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

async function performNLPAnalysis(text: string, parameters: Record<string, any>): Promise<any> {
  try {
    const doc = nlp(text);
    
    const analysis = {
      text,
      tokens: doc.terms().out('array'),
      sentences: doc.sentences().out('array'),
      entities: {
        people: doc.people().out('array'),
        places: doc.places().out('array'),
        organizations: doc.organizations().out('array'),
        topics: doc.topics().out('array')
      },
      sentiment: sentiment.analyze(text),
      language: franc(text),
      keywords: doc.keywords().out('array'),
      summary: doc.summary().out('text'),
      confidence: 0.85
    };

    return analysis;
  } catch (error) {
    logger.error('NLP analysis failed:', error);
    throw error;
  }
}

async function performImageAnalysis(imageBuffer: Buffer): Promise<any> {
  try {
    // Basic image analysis using Sharp
    const metadata = await sharp(imageBuffer).metadata();
    
    // Simulate advanced analysis (in production, use actual CV models)
    const analysis = {
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: imageBuffer.length
      },
      objects: [
        { name: 'person', confidence: 0.95, bbox: [100, 100, 200, 300] },
        { name: 'book', confidence: 0.87, bbox: [150, 200, 250, 280] },
        { name: 'laptop', confidence: 0.82, bbox: [300, 150, 450, 300] }
      ],
      text: ['StudySpot Library', 'Welcome', 'Study Zone'],
      colors: {
        dominant: '#4A90E2',
        palette: ['#4A90E2', '#7ED321', '#F5A623', '#D0021B']
      },
      scene: 'indoor_study_space',
      confidence: 0.88
    };

    return analysis;
  } catch (error) {
    logger.error('Image analysis failed:', error);
    throw error;
  }
}

async function generateChatbotResponse(session: ChatSession, userMessage: string): Promise<{ content: string; metadata?: any }> {
  try {
    // Build context from session history
    const context = session.messages.slice(-5).map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Generate response using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { 
          role: 'system', 
          content: 'You are StudySpot AI Assistant, a helpful AI for library management. You help students find study spaces, answer questions about bookings, and provide study tips. Be friendly, professional, and concise.' 
        },
        ...context,
        { role: 'user', content: userMessage }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content || 'I apologize, but I cannot process your request at the moment.';

    return {
      content: response,
      metadata: {
        model: 'gpt-3.5-turbo',
        tokensUsed: completion.usage?.total_tokens,
        confidence: 0.9
      }
    };
  } catch (error) {
    logger.error('Chatbot response generation failed:', error);
    return {
      content: 'I apologize, but I encountered an error processing your message. Please try again.',
      metadata: {
        error: error.message,
        confidence: 0.1
      }
    };
  }
}

// ============================================
// CRON JOBS
// ============================================

// Generate AI insights daily
cron.schedule('0 6 * * *', async () => {
  logger.info('Generating daily AI insights...');
  
  // Simulate insight generation
  const insights = [
    {
      id: uuidv4(),
      type: 'trend' as const,
      title: 'Peak Study Hours Analysis',
      description: 'Students prefer studying between 2-6 PM on weekdays',
      confidence: 0.87,
      data: { peakHours: [14, 15, 16, 17, 18], dayType: 'weekday' },
      actionable: true,
      priority: 'medium' as const,
      tenantId: 'default',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  aiInsights.push(...insights);
  logger.info(`Generated ${insights.length} AI insights`);
});

// Clean up old requests weekly
cron.schedule('0 2 * * 0', async () => {
  logger.info('Cleaning up old AI requests...');
  
  const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
  const initialCount = aiRequests.length;
  
  const filteredRequests = aiRequests.filter(request => request.createdAt > cutoffDate);
  aiRequests.length = 0;
  aiRequests.push(...filteredRequests);
  
  logger.info(`Cleaned up ${initialCount - aiRequests.length} old AI requests`);
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
const PORT = process.env.PORT || 3009;

const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    // Initialize NLP models
    await nlpManager.train();
    logger.info('NLP models initialized');

    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 AI Service running on port ${PORT}`);
      logger.info(`🧠 Natural Language Processing: Active`);
      logger.info(`👁️ Computer Vision: Active`);
      logger.info(`😊 Sentiment Analysis: Active`);
      logger.info(`🌍 Language Detection: Active`);
      logger.info(`✍️ Text Generation: Active`);
      logger.info(`🖼️ Image Analysis: Active`);
      logger.info(`🤖 Chatbot: Active`);
      logger.info(`💡 AI Insights: Active`);
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
