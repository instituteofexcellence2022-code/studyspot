// ============================================
// API GATEWAY ROUTES
// Service routing and proxy configuration
// ============================================

import { FastifyInstance } from 'fastify';
import axios from 'axios';
import { logger } from '../../utils/logger';

// Service URLs from environment
const SERVICES = {
  AUTH: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  USER: process.env.USER_SERVICE_URL || 'http://localhost:3002',
  TENANT: process.env.TENANT_SERVICE_URL || 'http://localhost:3003',
  STUDENT: process.env.STUDENT_SERVICE_URL || 'http://localhost:3004',
  LIBRARY: process.env.LIBRARY_SERVICE_URL || 'http://localhost:3005',
  PAYMENT: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3006',
  CREDIT: process.env.CREDIT_SERVICE_URL || 'http://localhost:3008',
  SUBSCRIPTION: process.env.SUBSCRIPTION_SERVICE_URL || 'http://localhost:3009',
  MESSAGING: process.env.MESSAGING_SERVICE_URL || 'http://localhost:3011',
  ANALYTICS: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3013',
};

/**
 * Proxy request to microservice
 */
async function proxyToService(
  serviceName: string,
  serviceUrl: string,
  path: string,
  method: string,
  headers: any,
  body?: any
) {
  try {
    logger.info(`Proxying to ${serviceName}`, { path, method });

    const response = await axios({
      method: method as any,
      url: `${serviceUrl}${path}`,
      headers: {
        ...headers,
        host: undefined, // Remove host header
      },
      data: body,
      timeout: 30000, // 30 seconds
      validateStatus: () => true, // Accept all status codes
    });

    return {
      statusCode: response.status,
      data: response.data,
      headers: response.headers,
    };
  } catch (error: any) {
    logger.error(`Proxy error to ${serviceName}`, {
      error: error.message,
      path,
      method,
    });

    return {
      statusCode: 503,
      data: {
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: `${serviceName} service is unavailable`,
        },
      },
    };
  }
}

/**
 * Register all proxy routes
 */
export function registerRoutes(fastify: FastifyInstance) {
  // ============================================
  // AUTH SERVICE ROUTES
  // ============================================
  fastify.all('/api/v1/auth/*', async (request, reply) => {
    const path = request.url.replace('/api/v1', '');
    const result = await proxyToService(
      'Auth',
      SERVICES.AUTH,
      path,
      request.method,
      request.headers,
      request.body
    );
    return reply.code(result.statusCode).send(result.data);
  });

  // ============================================
  // USER SERVICE ROUTES
  // ============================================
  fastify.all('/api/v1/admin/users*', async (request, reply) => {
    const path = request.url.replace('/api/v1', '');
    const result = await proxyToService(
      'User',
      SERVICES.USER,
      path,
      request.method,
      request.headers,
      request.body
    );
    return reply.code(result.statusCode).send(result.data);
  });

  // ============================================
  // TENANT SERVICE ROUTES
  // ============================================
  fastify.all('/api/v1/tenants*', async (request, reply) => {
    const path = request.url.replace('/api/v1', '');
    const result = await proxyToService(
      'Tenant',
      SERVICES.TENANT,
      path,
      request.method,
      request.headers,
      request.body
    );
    return reply.code(result.statusCode).send(result.data);
  });

  // ============================================
  // STUDENT SERVICE ROUTES
  // ============================================
  fastify.all('/api/v1/students*', async (request, reply) => {
    const path = request.url.replace('/api/v1', '');
    const result = await proxyToService(
      'Student',
      SERVICES.STUDENT,
      path,
      request.method,
      request.headers,
      request.body
    );
    return reply.code(result.statusCode).send(result.data);
  });

  // ============================================
  // LIBRARY SERVICE ROUTES
  // ============================================
  fastify.all('/api/v1/libraries*', async (request, reply) => {
    const path = request.url.replace('/api/v1', '');
    const result = await proxyToService(
      'Library',
      SERVICES.LIBRARY,
      path,
      request.method,
      request.headers,
      request.body
    );
    return reply.code(result.statusCode).send(result.data);
  });

  // ============================================
  // PAYMENT SERVICE ROUTES
  // ============================================
  fastify.all('/api/v1/payments*', async (request, reply) => {
    const path = request.url.replace('/api/v1', '');
    const result = await proxyToService(
      'Payment',
      SERVICES.PAYMENT,
      path,
      request.method,
      request.headers,
      request.body
    );
    return reply.code(result.statusCode).send(result.data);
  });

  // ============================================
  // CREDIT SERVICE ROUTES
  // ============================================
  fastify.all('/api/v1/credits*', async (request, reply) => {
    const path = request.url.replace('/api/v1', '');
    const result = await proxyToService(
      'Credit',
      SERVICES.CREDIT,
      path,
      request.method,
      request.headers,
      request.body
    );
    return reply.code(result.statusCode).send(result.data);
  });

  fastify.all('/api/v1/admin/credits*', async (request, reply) => {
    const path = request.url.replace('/api/v1', '');
    const result = await proxyToService(
      'Credit',
      SERVICES.CREDIT,
      path,
      request.method,
      request.headers,
      request.body
    );
    return reply.code(result.statusCode).send(result.data);
  });

  // ============================================
  // SUBSCRIPTION SERVICE ROUTES
  // ============================================
  fastify.all('/api/v1/subscriptions*', async (request, reply) => {
    const path = request.url.replace('/api/v1', '');
    const result = await proxyToService(
      'Subscription',
      SERVICES.SUBSCRIPTION,
      path,
      request.method,
      request.headers,
      request.body
    );
    return reply.code(result.statusCode).send(result.data);
  });

  fastify.all('/api/v1/admin/subscriptions*', async (request, reply) => {
    const path = request.url.replace('/api/v1', '');
    const result = await proxyToService(
      'Subscription',
      SERVICES.SUBSCRIPTION,
      path,
      request.method,
      request.headers,
      request.body
    );
    return reply.code(result.statusCode).send(result.data);
  });

  // ============================================
  // MESSAGING SERVICE ROUTES
  // ============================================
  fastify.all('/api/v1/messaging*', async (request, reply) => {
    const path = request.url.replace('/api/v1', '');
    const result = await proxyToService(
      'Messaging',
      SERVICES.MESSAGING,
      path,
      request.method,
      request.headers,
      request.body
    );
    return reply.code(result.statusCode).send(result.data);
  });

  // ============================================
  // ANALYTICS SERVICE ROUTES
  // ============================================
  fastify.all('/api/v1/analytics*', async (request, reply) => {
    const path = request.url.replace('/api/v1', '');
    const result = await proxyToService(
      'Analytics',
      SERVICES.ANALYTICS,
      path,
      request.method,
      request.headers,
      request.body
    );
    return reply.code(result.statusCode).send(result.data);
  });

  // ============================================
  // HEALTH CHECK ALL SERVICES
  // ============================================
  fastify.get('/api/v1/health/all', async (request, reply) => {
    const healthChecks = await Promise.all(
      Object.entries(SERVICES).map(async ([name, url]) => {
        try {
          const response = await axios.get(`${url}/health`, { timeout: 5000 });
          return {
            service: name,
            status: 'healthy',
            url,
            data: response.data,
          };
        } catch (error) {
          return {
            service: name,
            status: 'unhealthy',
            url,
            error: (error as Error).message,
          };
        }
      })
    );

    const allHealthy = healthChecks.every((check) => check.status === 'healthy');

    return reply.code(allHealthy ? 200 : 503).send({
      success: allHealthy,
      data: {
        gateway: 'healthy',
        services: healthChecks,
        timestamp: new Date().toISOString(),
      },
    });
  });
}

