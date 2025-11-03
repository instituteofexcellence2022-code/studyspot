import winston from 'winston';
import path from 'path';

// Create logs directory if it doesn't exist
const logDir = path.join(__dirname, '..', 'logs');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { 
    service: 'payment-service',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
          return `${timestamp} [${service}] ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
        })
      )
    }),
    
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(logDir, 'payment-service.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: logFormat
    }),
    
    // File transport for error logs
    new winston.transports.File({
      filename: path.join(logDir, 'payment-service-error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: logFormat
    })
  ],
  
  // Handle exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'payment-service-exceptions.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 3
    })
  ],
  
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'payment-service-rejections.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 3
    })
  ]
});

// Add request logging method
export const logRequest = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      tenantId: req.headers['x-tenant-id'],
      userId: req.headers['x-user-id']
    };
    
    if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });
  
  next();
};

// Add payment-specific logging methods
export const logPaymentProcessed = (paymentId: string, amount: number, currency: string, provider: string) => {
  logger.info('Payment processed', {
    paymentId,
    amount,
    currency,
    provider,
    timestamp: new Date().toISOString()
  });
};

export const logPaymentFailed = (paymentId: string, amount: number, currency: string, provider: string, error: string) => {
  logger.error('Payment failed', {
    paymentId,
    amount,
    currency,
    provider,
    error,
    timestamp: new Date().toISOString()
  });
};

export const logRefundProcessed = (refundId: string, paymentId: string, amount: number, provider: string) => {
  logger.info('Refund processed', {
    refundId,
    paymentId,
    amount,
    provider,
    timestamp: new Date().toISOString()
  });
};

export const logRefundFailed = (refundId: string, paymentId: string, amount: number, provider: string, error: string) => {
  logger.error('Refund failed', {
    refundId,
    paymentId,
    amount,
    provider,
    error,
    timestamp: new Date().toISOString()
  });
};

export const logWebhookReceived = (provider: string, event: string, webhookId: string) => {
  logger.info('Webhook received', {
    provider,
    event,
    webhookId,
    timestamp: new Date().toISOString()
  });
};

export const logWebhookProcessed = (provider: string, event: string, webhookId: string) => {
  logger.info('Webhook processed', {
    provider,
    event,
    webhookId,
    timestamp: new Date().toISOString()
  });
};

export const logWebhookFailed = (provider: string, event: string, webhookId: string, error: string) => {
  logger.error('Webhook failed', {
    provider,
    event,
    webhookId,
    error,
    timestamp: new Date().toISOString()
  });
};

// Add performance logging
export const logPerformance = (operation: string, duration: number, metadata?: any) => {
  logger.info('Performance metric', {
    operation,
    duration: `${duration}ms`,
    metadata,
    timestamp: new Date().toISOString()
  });
};

// Add security logging
export const logSecurityEvent = (event: string, details: any) => {
  logger.warn('Security event', {
    event,
    details,
    timestamp: new Date().toISOString()
  });
};

// Add fraud detection logging
export const logFraudDetection = (paymentId: string, riskScore: number, details: any) => {
  logger.warn('Fraud detection', {
    paymentId,
    riskScore,
    details,
    timestamp: new Date().toISOString()
  });
};

// Add compliance logging
export const logComplianceEvent = (event: string, details: any) => {
  logger.info('Compliance event', {
    event,
    details,
    timestamp: new Date().toISOString()
  });
};

// Export default logger
export default logger;














