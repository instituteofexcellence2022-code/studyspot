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
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { Server } from 'socket.io';
import admin from 'firebase-admin';
import QRCode from 'qrcode';
import Handlebars from 'handlebars';

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
  defaultMeta: { service: 'communication-service' },
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
  process.env.DATABASE_URL || 'postgresql://localhost:5432/studyspot_communication',
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

// Email configuration
const emailTransporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// SMS configuration
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Firebase Admin SDK
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
});

// Communication Models
interface Message {
  id: string;
  type: 'email' | 'sms' | 'whatsapp' | 'push' | 'in-app';
  recipient: string;
  subject?: string;
  content: string;
  templateId?: string;
  variables?: Record<string, any>;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledAt?: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  errorMessage?: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Template {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'whatsapp' | 'push' | 'in-app';
  subject?: string;
  content: string;
  variables: string[];
  isActive: boolean;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'whatsapp' | 'push' | 'in-app';
  templateId: string;
  recipients: string[];
  variables?: Record<string, any>;
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'paused' | 'cancelled';
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory storage for demo (replace with database in production)
const messages: Message[] = [];
const templates: Template[] = [];
const campaigns: Campaign[] = [];

// Email templates
const emailTemplates = {
  welcome: `
    <h2>Welcome to StudySpot, {{name}}!</h2>
    <p>Thank you for joining StudySpot. We're excited to help you find the perfect study space.</p>
    <p>Your account is now active and ready to use.</p>
    <p>Best regards,<br>The StudySpot Team</p>
  `,
  booking_confirmation: `
    <h2>Booking Confirmed!</h2>
    <p>Hello {{name}},</p>
    <p>Your booking at {{libraryName}} has been confirmed.</p>
    <p><strong>Details:</strong></p>
    <ul>
      <li>Date: {{date}}</li>
      <li>Time: {{time}}</li>
      <li>Seat: {{seatNumber}}</li>
      <li>Duration: {{duration}} hours</li>
    </ul>
    <p>Thank you for choosing StudySpot!</p>
  `,
  payment_reminder: `
    <h2>Payment Reminder</h2>
    <p>Hello {{name}},</p>
    <p>This is a friendly reminder that your payment of ₹{{amount}} is due on {{dueDate}}.</p>
    <p>Please make the payment to continue using StudySpot services.</p>
    <p>Thank you!</p>
  `
};

// SMS templates
const smsTemplates = {
  welcome: 'Welcome to StudySpot! Your account is now active. Start booking study spaces today.',
  booking_confirmation: 'Booking confirmed! {{libraryName}} on {{date}} at {{time}}. Seat: {{seatNumber}}. Duration: {{duration}}h',
  payment_reminder: 'Payment reminder: ₹{{amount}} due on {{dueDate}}. Please pay to continue using StudySpot.',
  otp: 'Your StudySpot OTP is {{otp}}. Valid for 5 minutes. Do not share with anyone.'
};

// WhatsApp templates
const whatsappTemplates = {
  welcome: '🎉 Welcome to StudySpot!\n\nHi {{name}}, your account is now active. Start booking study spaces today!\n\nBest regards,\nStudySpot Team',
  booking_confirmation: '✅ Booking Confirmed!\n\nHi {{name}},\n\nYour booking at {{libraryName}} is confirmed:\n📅 Date: {{date}}\n⏰ Time: {{time}}\n🪑 Seat: {{seatNumber}}\n⏱️ Duration: {{duration}} hours\n\nThank you for choosing StudySpot!',
  payment_reminder: '💳 Payment Reminder\n\nHi {{name}},\n\nYour payment of ₹{{amount}} is due on {{dueDate}}.\n\nPlease make the payment to continue using StudySpot services.\n\nThank you!'
};

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
const validateMessage = [
  body('type').isIn(['email', 'sms', 'whatsapp', 'push', 'in-app']).withMessage('Invalid message type'),
  body('recipient').notEmpty().withMessage('Recipient is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('priority').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority')
];

const validateTemplate = [
  body('name').notEmpty().withMessage('Template name is required'),
  body('type').isIn(['email', 'sms', 'whatsapp', 'push', 'in-app']).withMessage('Invalid template type'),
  body('content').notEmpty().withMessage('Template content is required')
];

const validateCampaign = [
  body('name').notEmpty().withMessage('Campaign name is required'),
  body('type').isIn(['email', 'sms', 'whatsapp', 'push', 'in-app']).withMessage('Invalid campaign type'),
  body('templateId').notEmpty().withMessage('Template ID is required'),
  body('recipients').isArray().withMessage('Recipients must be an array')
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
    message: 'Communication Service is healthy',
    timestamp: new Date().toISOString(),
    email: 'configured',
    sms: 'configured',
    whatsapp: 'configured',
    push: 'configured'
  });
});

// ============================================
// MESSAGE SENDING ROUTES
// ============================================

/**
 * @route   POST /api/communication/send
 * @desc    Send a message (email, SMS, WhatsApp, push notification)
 * @access  Private
 */
app.post('/api/communication/send', authenticateToken, validateMessage, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const message: Message = {
      id: uuidv4(),
      type: req.body.type,
      recipient: req.body.recipient,
      subject: req.body.subject,
      content: req.body.content,
      templateId: req.body.templateId,
      variables: req.body.variables,
      status: 'pending',
      priority: req.body.priority || 'medium',
      scheduledAt: req.body.scheduledAt ? new Date(req.body.scheduledAt) : undefined,
      tenantId: req.user.tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    messages.push(message);

    // Send message based on type
    let result;
    switch (message.type) {
      case 'email':
        result = await sendEmail(message);
        break;
      case 'sms':
        result = await sendSMS(message);
        break;
      case 'whatsapp':
        result = await sendWhatsApp(message);
        break;
      case 'push':
        result = await sendPushNotification(message);
        break;
      case 'in-app':
        result = await sendInAppNotification(message);
        break;
      default:
        throw new Error('Invalid message type');
    }

    // Update message status
    const messageIndex = messages.findIndex(m => m.id === message.id);
    if (messageIndex !== -1) {
      messages[messageIndex] = {
        ...messages[messageIndex],
        status: result.success ? 'sent' : 'failed',
        sentAt: result.success ? new Date() : undefined,
        errorMessage: result.success ? undefined : result.error
      };
    }

    logger.info(`Message sent: ${message.id} (${message.type}) to ${message.recipient}`);
    
    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message: messages[messageIndex] }
    });
  } catch (error) {
    logger.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
});

// ============================================
// TEMPLATE MANAGEMENT ROUTES
// ============================================

/**
 * @route   POST /api/communication/templates
 * @desc    Create a new message template
 * @access  Private
 */
app.post('/api/communication/templates', authenticateToken, validateTemplate, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const template: Template = {
      id: uuidv4(),
      name: req.body.name,
      type: req.body.type,
      subject: req.body.subject,
      content: req.body.content,
      variables: req.body.variables || [],
      isActive: true,
      tenantId: req.user.tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    templates.push(template);

    logger.info(`Template created: ${template.id} (${template.type})`);
    
    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      data: { template }
    });
  } catch (error) {
    logger.error('Error creating template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create template'
    });
  }
});

/**
 * @route   GET /api/communication/templates
 * @desc    Get all templates for a tenant
 * @access  Private
 */
app.get('/api/communication/templates', authenticateToken, async (req, res) => {
  try {
    const tenantTemplates = templates.filter(template => template.tenantId === req.user.tenantId);
    
    res.json({
      success: true,
      data: { templates: tenantTemplates },
      count: tenantTemplates.length
    });
  } catch (error) {
    logger.error('Error fetching templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch templates'
    });
  }
});

// ============================================
// CAMPAIGN MANAGEMENT ROUTES
// ============================================

/**
 * @route   POST /api/communication/campaigns
 * @desc    Create a new communication campaign
 * @access  Private
 */
app.post('/api/communication/campaigns', authenticateToken, validateCampaign, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const campaign: Campaign = {
      id: uuidv4(),
      name: req.body.name,
      type: req.body.type,
      templateId: req.body.templateId,
      recipients: req.body.recipients,
      variables: req.body.variables,
      status: 'draft',
      scheduledAt: req.body.scheduledAt ? new Date(req.body.scheduledAt) : undefined,
      totalRecipients: req.body.recipients.length,
      sentCount: 0,
      deliveredCount: 0,
      failedCount: 0,
      tenantId: req.user.tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    campaigns.push(campaign);

    logger.info(`Campaign created: ${campaign.id} (${campaign.type})`);
    
    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      data: { campaign }
    });
  } catch (error) {
    logger.error('Error creating campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create campaign'
    });
  }
});

/**
 * @route   POST /api/communication/campaigns/:id/start
 * @desc    Start a campaign
 * @access  Private
 */
app.post('/api/communication/campaigns/:id/start', authenticateToken, async (req, res) => {
  try {
    const campaignIndex = campaigns.findIndex(
      campaign => campaign.id === req.params.id && campaign.tenantId === req.user.tenantId
    );
    
    if (campaignIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    const campaign = campaigns[campaignIndex];
    
    if (campaign.status !== 'draft' && campaign.status !== 'paused') {
      return res.status(400).json({
        success: false,
        message: 'Campaign cannot be started in current status'
      });
    }

    // Update campaign status
    campaigns[campaignIndex] = {
      ...campaign,
      status: 'running',
      startedAt: new Date(),
      updatedAt: new Date()
    };

    // Start sending messages (in production, this would be queued)
    logger.info(`Campaign started: ${campaign.id}`);
    
    res.json({
      success: true,
      message: 'Campaign started successfully',
      data: { campaign: campaigns[campaignIndex] }
    });
  } catch (error) {
    logger.error('Error starting campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start campaign'
    });
  }
});

// ============================================
// ANALYTICS ROUTES
// ============================================

/**
 * @route   GET /api/communication/analytics/dashboard
 * @desc    Get communication analytics dashboard
 * @access  Private
 */
app.get('/api/communication/analytics/dashboard', authenticateToken, async (req, res) => {
  try {
    const tenantMessages = messages.filter(message => message.tenantId === req.user.tenantId);
    const tenantTemplates = templates.filter(template => template.tenantId === req.user.tenantId);
    const tenantCampaigns = campaigns.filter(campaign => campaign.tenantId === req.user.tenantId);

    // Message analytics
    const messageStats = {
      total: tenantMessages.length,
      sent: tenantMessages.filter(msg => msg.status === 'sent').length,
      delivered: tenantMessages.filter(msg => msg.status === 'delivered').length,
      failed: tenantMessages.filter(msg => msg.status === 'failed').length,
      byType: {
        email: tenantMessages.filter(msg => msg.type === 'email').length,
        sms: tenantMessages.filter(msg => msg.type === 'sms').length,
        whatsapp: tenantMessages.filter(msg => msg.type === 'whatsapp').length,
        push: tenantMessages.filter(msg => msg.type === 'push').length,
        inApp: tenantMessages.filter(msg => msg.type === 'in-app').length
      }
    };

    // Template analytics
    const templateStats = {
      total: tenantTemplates.length,
      active: tenantTemplates.filter(template => template.isActive).length,
      inactive: tenantTemplates.filter(template => !template.isActive).length,
      byType: {
        email: tenantTemplates.filter(template => template.type === 'email').length,
        sms: tenantTemplates.filter(template => template.type === 'sms').length,
        whatsapp: tenantTemplates.filter(template => template.type === 'whatsapp').length,
        push: tenantTemplates.filter(template => template.type === 'push').length,
        inApp: tenantTemplates.filter(template => template.type === 'in-app').length
      }
    };

    // Campaign analytics
    const campaignStats = {
      total: tenantCampaigns.length,
      draft: tenantCampaigns.filter(campaign => campaign.status === 'draft').length,
      running: tenantCampaigns.filter(campaign => campaign.status === 'running').length,
      completed: tenantCampaigns.filter(campaign => campaign.status === 'completed').length,
      paused: tenantCampaigns.filter(campaign => campaign.status === 'paused').length,
      cancelled: tenantCampaigns.filter(campaign => campaign.status === 'cancelled').length
    };

    res.json({
      success: true,
      data: {
        messages: messageStats,
        templates: templateStats,
        campaigns: campaignStats,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

async function sendEmail(message: Message): Promise<{ success: boolean; error?: string }> {
  try {
    const template = emailTemplates[message.templateId as keyof typeof emailTemplates];
    const content = template ? Handlebars.compile(template)(message.variables) : message.content;
    
    await emailTransporter.sendMail({
      from: process.env.SMTP_USER,
      to: message.recipient,
      subject: message.subject || 'StudySpot Notification',
      html: content
    });
    
    return { success: true };
  } catch (error) {
    logger.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
}

async function sendSMS(message: Message): Promise<{ success: boolean; error?: string }> {
  try {
    const template = smsTemplates[message.templateId as keyof typeof smsTemplates];
    const content = template ? Handlebars.compile(template)(message.variables) : message.content;
    
    await twilioClient.messages.create({
      body: content,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: message.recipient
    });
    
    return { success: true };
  } catch (error) {
    logger.error('SMS sending failed:', error);
    return { success: false, error: error.message };
  }
}

async function sendWhatsApp(message: Message): Promise<{ success: boolean; error?: string }> {
  try {
    const template = whatsappTemplates[message.templateId as keyof typeof whatsappTemplates];
    const content = template ? Handlebars.compile(template)(message.variables) : message.content;
    
    // In production, integrate with WhatsApp Business API
    logger.info(`WhatsApp message sent to ${message.recipient}: ${content}`);
    
    return { success: true };
  } catch (error) {
    logger.error('WhatsApp sending failed:', error);
    return { success: false, error: error.message };
  }
}

async function sendPushNotification(message: Message): Promise<{ success: boolean; error?: string }> {
  try {
    // In production, send actual push notification
    logger.info(`Push notification sent to ${message.recipient}: ${message.content}`);
    
    return { success: true };
  } catch (error) {
    logger.error('Push notification sending failed:', error);
    return { success: false, error: error.message };
  }
}

async function sendInAppNotification(message: Message): Promise<{ success: boolean; error?: string }> {
  try {
    // In production, send in-app notification
    logger.info(`In-app notification sent to ${message.recipient}: ${message.content}`);
    
    return { success: true };
  } catch (error) {
    logger.error('In-app notification sending failed:', error);
    return { success: false, error: error.message };
  }
}

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
const PORT = process.env.PORT || 3006;

const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    // Test email configuration
    await emailTransporter.verify();
    logger.info('Email configuration verified');

    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 Communication Service running on port ${PORT}`);
      logger.info(`📧 Email Service: Active`);
      logger.info(`📱 SMS Service: Active`);
      logger.info(`💬 WhatsApp Service: Active`);
      logger.info(`🔔 Push Notifications: Active`);
      logger.info(`📋 Template Management: Active`);
      logger.info(`📊 Campaign Management: Active`);
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
