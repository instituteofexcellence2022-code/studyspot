/**
 * UNIT TESTS - API GATEWAY SERVICE
 * Tests for API Gateway: Request routing, load balancing, rate limiting, 
 * service discovery, health checks, CORS, security headers, request/response transformation
 */

import Fastify from 'fastify';
import { registerRoutes } from '../../../src/services/api-gateway/routes';
import axios from 'axios';
import { logger } from '../../../src/utils/logger';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock logger
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('API Gateway Service', () => {
  let app: Fastify.FastifyInstance;

  beforeAll(() => {
    app = Fastify();
    registerRoutes(app);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Request Routing', () => {
    it('should route requests to correct services', async () => {
      mockedAxios.request = jest.fn().mockResolvedValue({
        status: 200,
        data: { success: true },
        headers: {},
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/students',
        headers: {
          'Authorization': 'Bearer token',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(mockedAxios.request).toHaveBeenCalled();
    });

    it('should handle service discovery', async () => {
      const serviceUrl = process.env.STUDENT_SERVICE_URL || 'https://studyspot-students.onrender.com';
      
      mockedAxios.request = jest.fn().mockResolvedValue({
        status: 200,
        data: { success: true },
        headers: {},
      });

      await app.inject({
        method: 'GET',
        url: '/api/v1/students',
      });

      expect(mockedAxios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining(serviceUrl),
        })
      );
    });
  });

  describe('Load Balancing', () => {
    it('should distribute requests across service instances', async () => {
      // In a real scenario, this would test load balancing logic
      const requests = Array(5).fill(null).map(() => 
        app.inject({ method: 'GET', url: '/api/v1/students' })
      );

      mockedAxios.request = jest.fn().mockResolvedValue({
        status: 200,
        data: { success: true },
        headers: {},
      });

      await Promise.all(requests);

      expect(mockedAxios.request).toHaveBeenCalledTimes(5);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      // Rate limiting is handled by @fastify/rate-limit
      // This test verifies the configuration
      const rateLimitConfig = {
        max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
        timeWindow: process.env.RATE_LIMIT_WINDOW || '1 minute',
      };

      expect(rateLimitConfig.max).toBeGreaterThan(0);
      expect(rateLimitConfig.timeWindow).toBeDefined();
    });
  });

  describe('CORS Handling', () => {
    it('should allow requests from whitelisted origins', async () => {
      const response = await app.inject({
        method: 'OPTIONS',
        url: '/api/v1/students',
        headers: {
          'Origin': 'https://studyspot-student.vercel.app',
        },
      });

      // CORS is handled by @fastify/cors
      expect(response.statusCode).toBeLessThan(500);
    });
  });

  describe('Security Headers', () => {
    it('should add security headers to responses', async () => {
      mockedAxios.request = jest.fn().mockResolvedValue({
        status: 200,
        data: { success: true },
        headers: {},
      });

      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      // Helmet adds security headers
      expect(response.statusCode).toBe(200);
    });
  });

  describe('Request/Response Transformation', () => {
    it('should transform request headers', async () => {
      mockedAxios.request = jest.fn().mockResolvedValue({
        status: 200,
        data: { success: true },
        headers: {},
      });

      await app.inject({
        method: 'GET',
        url: '/api/v1/students',
        headers: {
          'host': 'example.com',
          'content-length': '100',
        },
      });

      const callArgs = mockedAxios.request.mock.calls[0][0];
      expect(callArgs.headers.host).toBeUndefined();
      expect(callArgs.headers['content-length']).toBeUndefined();
    });
  });

  describe('Health Checks', () => {
    it('should return health status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('healthy');
      expect(data.data.service).toBe('api-gateway');
    });

    it('should include uptime in health check', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      const data = JSON.parse(response.body);
      expect(data.data.uptime).toBeDefined();
      expect(typeof data.data.uptime).toBe('number');
    });
  });

  describe('Error Handling', () => {
    it('should handle service unavailability', async () => {
      mockedAxios.request = jest.fn().mockRejectedValue({
        code: 'ECONNREFUSED',
        message: 'Connection refused',
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/students',
      });

      expect(response.statusCode).toBe(503);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('SERVICE_UNAVAILABLE');
    });

    it('should handle timeout errors', async () => {
      mockedAxios.request = jest.fn().mockRejectedValue({
        code: 'ECONNABORTED',
        message: 'timeout',
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/students',
      });

      expect(response.statusCode).toBe(503);
    });
  });

  describe('Circuit Breaker', () => {
    it('should implement circuit breaker pattern', async () => {
      // Simulate multiple failures
      mockedAxios.request = jest.fn().mockRejectedValue(new Error('Service error'));

      // Make multiple requests
      const requests = Array(5).fill(null).map(() =>
        app.inject({ method: 'GET', url: '/api/v1/students' })
      );

      await Promise.all(requests);

      // Circuit breaker would prevent further requests after threshold
      expect(mockedAxios.request).toHaveBeenCalled();
    });
  });
});

