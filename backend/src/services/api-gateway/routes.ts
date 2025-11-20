// ============================================
// API GATEWAY ROUTES
// Service routing and proxy configuration
// ============================================

import { FastifyInstance } from 'fastify';
import axios from 'axios';
import { logger } from '../../utils/logger';

const DEFAULT_SERVICE_URLS = {
  AUTH: 'https://studyspot-auth.onrender.com',
  USER: 'https://studyspot-users.onrender.com',
  TENANT: 'https://studyspot-tenants.onrender.com',
  STUDENT: 'https://studyspot-students.onrender.com',
  LIBRARY: 'https://studyspot-libraries.onrender.com',
  PAYMENT: 'https://studyspot-payments.onrender.com',
  BOOKING: 'https://studyspot-bookings.onrender.com',
  CREDIT: 'https://studyspot-credits.onrender.com',
  SUBSCRIPTION: 'https://studyspot-subscriptions.onrender.com',
  MESSAGE: 'https://studyspot-message-service.onrender.com', // Updated to match actual service name
  COMMUNITY: 'https://studyspot-community-service.onrender.com', // Updated to match actual service name
  ATTENDANCE: 'https://studyspot-attendance-service.onrender.com', // Updated to match actual service name
  MESSAGING: 'https://studyspot-messaging.onrender.com',
  ANALYTICS: 'https://studyspot-analytics.onrender.com',
};

// Fallback: If service is not deployed, use auth service as fallback
const getServiceUrl = (serviceName: string, defaultUrl: string): string => {
  const envKey = `${serviceName}_SERVICE_URL`;
  return process.env[envKey] || defaultUrl;
};

// Service URLs from environment (with fallback to auth service if not deployed)
const SERVICES = {
  AUTH: process.env.AUTH_SERVICE_URL || DEFAULT_SERVICE_URLS.AUTH,
  USER: getServiceUrl('USER', DEFAULT_SERVICE_URLS.USER),
  TENANT: getServiceUrl('TENANT', DEFAULT_SERVICE_URLS.TENANT),
  STUDENT: getServiceUrl('STUDENT', DEFAULT_SERVICE_URLS.STUDENT),
  LIBRARY: getServiceUrl('LIBRARY', DEFAULT_SERVICE_URLS.LIBRARY),
  PAYMENT: getServiceUrl('PAYMENT', DEFAULT_SERVICE_URLS.PAYMENT),
  BOOKING: getServiceUrl('BOOKING', DEFAULT_SERVICE_URLS.BOOKING),
  CREDIT: getServiceUrl('CREDIT', DEFAULT_SERVICE_URLS.CREDIT),
  SUBSCRIPTION: getServiceUrl('SUBSCRIPTION', DEFAULT_SERVICE_URLS.SUBSCRIPTION),
  MESSAGE: getServiceUrl('MESSAGE', DEFAULT_SERVICE_URLS.MESSAGE),
  COMMUNITY: getServiceUrl('COMMUNITY', DEFAULT_SERVICE_URLS.COMMUNITY),
  ATTENDANCE: getServiceUrl('ATTENDANCE', DEFAULT_SERVICE_URLS.ATTENDANCE),
  MESSAGING: getServiceUrl('MESSAGING', DEFAULT_SERVICE_URLS.MESSAGING),
  ANALYTICS: getServiceUrl('ANALYTICS', DEFAULT_SERVICE_URLS.ANALYTICS),
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
  const targetUrl = `${serviceUrl}${path}`;
  
  try {
    logger.info(`Proxying to ${serviceName}`, { 
      path, 
      method, 
      targetUrl,
      serviceUrl,
      hasBody: !!body,
    });

    // Remove problematic headers that might cause issues
    const cleanHeaders = { ...headers };
    delete cleanHeaders.host;
    delete cleanHeaders['content-length'];
    
    const response = await axios({
      method: method as any,
      url: targetUrl,
      headers: cleanHeaders,
      data: body,
      timeout: 30000, // 30 seconds
      validateStatus: () => true, // Accept all status codes
      maxRedirects: 5,
    });

    logger.info(`Proxy response from ${serviceName}`, {
      status: response.status,
      path,
    });

    return {
      statusCode: response.status,
      data: response.data,
      headers: response.headers,
    };
  } catch (error: any) {
    logger.error(`Proxy error to ${serviceName}`, {
      error: error.message,
      code: error.code,
      path,
      method,
      targetUrl,
      serviceUrl,
      isTimeout: error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT',
      isConnectionRefused: error.code === 'ECONNREFUSED',
      response: error.response ? {
        status: error.response.status,
        data: error.response.data,
      } : null,
    });

    // Return more detailed error information
    return {
      statusCode: error.response?.status || 503,
      data: {
        success: false,
        error: {
          code: error.response?.status ? 'SERVICE_ERROR' : 'SERVICE_UNAVAILABLE',
          message: error.response?.data?.error?.message || 
                   error.response?.data?.message ||
                   error.message ||
                   `${serviceName} service is unavailable`,
          details: error.code || 'Unknown error',
          serviceUrl: targetUrl,
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
  // Route for /api/auth/* (student portal uses this)
  fastify.all('/api/auth/*', async (request, reply) => {
    const result = await proxyToService(
      'Auth',
      SERVICES.AUTH,
      request.url,
      request.method,
      request.headers,
      request.body
    );
    return reply.code(result.statusCode).send(result.data);
  });

  // Route for /api/v1/auth/* (admin portal uses this)
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

  // Route for /api/users/* (profile endpoints in auth-service)
  fastify.all('/api/users/*', async (request, reply) => {
    const result = await proxyToService(
      'Auth',
      SERVICES.AUTH,
      request.url,
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

  // Fee plans route (proxies to library service)
  fastify.all('/api/fee-plans*', async (request, reply) => {
    const result = await proxyToService(
      'Library',
      SERVICES.LIBRARY,
      request.url,
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
  // BOOKING SERVICE ROUTES
  // ============================================
  fastify.all('/api/v1/bookings*', async (request, reply) => {
    const path = request.url.replace('/api/v1', '');
    const result = await proxyToService(
      'Booking',
      SERVICES.BOOKING,
      path,
      request.method,
      request.headers,
      request.body
    );
    return reply.code(result.statusCode).send(result.data);
  });

  // Also route /api/bookings to the booking service (for frontend compatibility)
  fastify.all('/api/bookings*', async (request, reply) => {
    const path = `/api/v1${request.url.replace('/api', '')}`;
    const result = await proxyToService(
      'Booking',
      SERVICES.BOOKING,
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
  // MESSAGE SERVICE ROUTES
  // ============================================
  fastify.all('/api/messages*', async (request, reply) => {
    const result = await proxyToService(
      'Message',
      SERVICES.MESSAGE,
      request.url,
      request.method,
      request.headers,
      request.body
    );
    return reply.code(result.statusCode).send(result.data);
  });

  fastify.all('/api/v1/messages*', async (request, reply) => {
    const path = request.url.replace('/api/v1', '/api');
    const result = await proxyToService(
      'Message',
      SERVICES.MESSAGE,
      path,
      request.method,
      request.headers,
      request.body
    );
    return reply.code(result.statusCode).send(result.data);
  });

  // ============================================
  // COMMUNITY SERVICE ROUTES
  // ============================================
  fastify.all('/api/communities*', async (request, reply) => {
    const result = await proxyToService(
      'Community',
      SERVICES.COMMUNITY,
      request.url,
      request.method,
      request.headers,
      request.body
    );
    return reply.code(result.statusCode).send(result.data);
  });

  fastify.all('/api/groups*', async (request, reply) => {
    const result = await proxyToService(
      'Community',
      SERVICES.COMMUNITY,
      request.url,
      request.method,
      request.headers,
      request.body
    );
    return reply.code(result.statusCode).send(result.data);
  });

  fastify.all('/api/v1/communities*', async (request, reply) => {
    const path = request.url.replace('/api/v1', '/api');
    const result = await proxyToService(
      'Community',
      SERVICES.COMMUNITY,
      path,
      request.method,
      request.headers,
      request.body
    );
    return reply.code(result.statusCode).send(result.data);
  });

  // Student search (for owner to add to groups)
  fastify.all('/api/students*', async (request, reply) => {
    const result = await proxyToService(
      'Community',
      SERVICES.COMMUNITY,
      request.url,
      request.method,
      request.headers,
      request.body
    );
    return reply.code(result.statusCode).send(result.data);
  });

  // ============================================
  // ATTENDANCE SERVICE ROUTES
  // ============================================
  fastify.all('/api/attendance*', async (request, reply) => {
    const result = await proxyToService(
      'Attendance',
      SERVICES.ATTENDANCE,
      request.url,
      request.method,
      request.headers,
      request.body
    );
    return reply.code(result.statusCode).send(result.data);
  });

  fastify.all('/api/v1/attendance*', async (request, reply) => {
    const path = request.url.replace('/api/v1', '/api');
    const result = await proxyToService(
      'Attendance',
      SERVICES.ATTENDANCE,
      path,
      request.method,
      request.headers,
      request.body
    );
    return reply.code(result.statusCode).send(result.data);
  });

  // ============================================
  // MESSAGING SERVICE ROUTES (Legacy)
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

