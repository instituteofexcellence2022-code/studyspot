// ============================================
// API GATEWAY
// Main entry point for all API requests
// Port: 3000
// ============================================

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import compress from '@fastify/compress';
import dotenv from 'dotenv';
import { logger } from '../../utils/logger';

dotenv.config();

const fastify = Fastify({
  logger: false, // Using custom Winston logger
  trustProxy: true,
});

const PORT = parseInt(process.env.API_GATEWAY_PORT || '3000');

// ============================================
// MIDDLEWARE
// ============================================

// CORS
fastify.register(cors, {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3002'],
  credentials: true,
});

// Security headers
fastify.register(helmet, {
  contentSecurityPolicy: false, // Configure as needed
});

// Compression
fastify.register(compress);

// Rate limiting
fastify.register(rateLimit, {
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  timeWindow: process.env.RATE_LIMIT_WINDOW || '1 minute',
});

// ============================================
// REQUEST LOGGING
// ============================================

fastify.addHook('onRequest', async (request, reply) => {
  logger.info('Incoming request', {
    method: request.method,
    url: request.url,
    ip: request.ip,
  });
});

fastify.addHook('onResponse', async (request, reply) => {
  logger.info('Response sent', {
    method: request.method,
    url: request.url,
    statusCode: reply.statusCode,
    responseTime: reply.getResponseTime(),
  });
});

// ============================================
// ROUTES
// ============================================

// Health check
fastify.get('/health', async (request, reply) => {
  return {
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      service: 'api-gateway',
    },
  };
});

// API version
fastify.get('/api/v1', async (request, reply) => {
  return {
    success: true,
    data: {
      name: 'StudySpot Backend API',
      version: '1.0.0',
      endpoints: [
        'GET /health',
        'POST /api/v1/auth/login',
        'POST /api/v1/auth/register',
        'GET /api/v1/tenants',
        'GET /api/v1/students',
        'GET /api/v1/libraries',
        'POST /api/v1/payments',
      ],
    },
  };
});

// ============================================
// SERVICE ROUTING
// ============================================

import { registerRoutes } from './routes';
registerRoutes(fastify);

// ============================================
// ERROR HANDLING
// ============================================

fastify.setErrorHandler((error, request, reply) => {
  logger.error('Request error', {
    error: error.message,
    stack: error.stack,
    url: request.url,
    method: request.method,
  });

  reply.status(error.statusCode || 500).send({
    success: false,
    error: {
      code: error.statusCode || 500,
      message: error.message || 'Internal server error',
    },
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// START SERVER
// ============================================

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    logger.info(`🚀 API Gateway running on port ${PORT}`);
    logger.info(`📍 http://localhost:${PORT}`);
    logger.info(`🔥 Environment: ${process.env.NODE_ENV}`);
  } catch (err) {
    logger.error('Failed to start API Gateway', err);
    process.exit(1);
  }
};

start();

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received, shutting down gracefully...`);
  await fastify.close();
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

