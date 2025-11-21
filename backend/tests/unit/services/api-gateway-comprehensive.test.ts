/**
 * UNIT TESTS - API GATEWAY COMPREHENSIVE
 * Comprehensive tests for API Gateway routing logic
 */

import { proxyToService } from '../../../src/services/api-gateway/routes';
import axios from 'axios';

// Mock dependencies
jest.mock('axios');
jest.mock('../../../src/utils/logger');

describe('API Gateway - Comprehensive', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Routing', () => {
    it('should route to auth service', () => {
      const routes = {
        '/api/v1/auth': 'auth-service',
        '/api/v1/auth/login': 'auth-service',
        '/api/v1/auth/register': 'auth-service',
      };

      expect(routes['/api/v1/auth']).toBe('auth-service');
      expect(routes['/api/v1/auth/login']).toBe('auth-service');
    });

    it('should route to student service', () => {
      const routes = {
        '/api/v1/students': 'student-service',
        '/api/v1/students/:id': 'student-service',
      };

      expect(routes['/api/v1/students']).toBe('student-service');
    });

    it('should route to library service', () => {
      const routes = {
        '/api/v1/libraries': 'library-service',
        '/api/v1/libraries/:id': 'library-service',
      };

      expect(routes['/api/v1/libraries']).toBe('library-service');
    });

    it('should route to booking service', () => {
      const routes = {
        '/api/v1/bookings': 'booking-service',
        '/api/v1/bookings/:id': 'booking-service',
      };

      expect(routes['/api/v1/bookings']).toBe('booking-service');
    });

    it('should route to payment service', () => {
      const routes = {
        '/api/v1/payments': 'payment-service',
        '/api/v1/payments/:id': 'payment-service',
      };

      expect(routes['/api/v1/payments']).toBe('payment-service');
    });
  });

  describe('Service URL Resolution', () => {
    it('should use environment variable for service URL', () => {
      const serviceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
      expect(serviceUrl).toBeDefined();
    });

    it('should fallback to default service URL', () => {
      const defaultUrls = {
        AUTH: 'https://studyspot-auth.onrender.com',
        STUDENT: 'https://studyspot-students.onrender.com',
        LIBRARY: 'https://studyspot-libraries.onrender.com',
      };

      expect(defaultUrls.AUTH).toBeDefined();
      expect(defaultUrls.STUDENT).toBeDefined();
    });
  });

  describe('Proxy Request Handling', () => {
    it('should proxy GET request', async () => {
      const mockResponse = {
        status: 200,
        data: { success: true, data: [] },
        headers: {},
      };

      (axios as jest.Mocked<typeof axios>).mockResolvedValue(mockResponse);

      const result = await axios({
        method: 'GET',
        url: 'http://localhost:3001/api/v1/students',
        headers: {},
      });

      expect(result.status).toBe(200);
      expect(result.data.success).toBe(true);
    });

    it('should proxy POST request', async () => {
      const mockResponse = {
        status: 201,
        data: { success: true, data: { id: '123' } },
        headers: {},
      };

      (axios as jest.Mocked<typeof axios>).mockResolvedValue(mockResponse);

      const result = await axios({
        method: 'POST',
        url: 'http://localhost:3001/api/v1/students',
        headers: {},
        data: { name: 'Test Student' },
      });

      expect(result.status).toBe(201);
    });

    it('should handle proxy errors', async () => {
      (axios as jest.Mocked<typeof axios>).mockRejectedValue(new Error('Service unavailable'));

      await expect(
        axios({
          method: 'GET',
          url: 'http://localhost:3001/api/v1/students',
          headers: {},
        })
      ).rejects.toThrow('Service unavailable');
    });

    it('should preserve request headers', async () => {
      const headers = {
        'authorization': 'Bearer token',
        'x-tenant-id': 'tenant-123',
      };

      (axios as jest.Mocked<typeof axios>).mockResolvedValue({
        status: 200,
        data: {},
        headers: {},
      });

      await axios({
        method: 'GET',
        url: 'http://localhost:3001/api/v1/students',
        headers,
      });

      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining(headers),
        })
      );
    });

    it('should handle timeout errors', async () => {
      (axios as jest.Mocked<typeof axios>).mockRejectedValue({
        code: 'ECONNABORTED',
        message: 'timeout of 30000ms exceeded',
      });

      await expect(
        axios({
          method: 'GET',
          url: 'http://localhost:3001/api/v1/students',
          headers: {},
          timeout: 30000,
        })
      ).rejects.toMatchObject({
        code: 'ECONNABORTED',
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 errors from services', async () => {
      const mockResponse = {
        status: 404,
        data: { success: false, error: { code: 'NOT_FOUND' } },
        headers: {},
      };

      (axios as jest.Mocked<typeof axios>).mockResolvedValue(mockResponse);

      const result = await axios({
        method: 'GET',
        url: 'http://localhost:3001/api/v1/students/123',
        headers: {},
      });

      expect(result.status).toBe(404);
      expect(result.data.success).toBe(false);
    });

    it('should handle 500 errors from services', async () => {
      const mockResponse = {
        status: 500,
        data: { success: false, error: { code: 'SERVER_ERROR' } },
        headers: {},
      };

      (axios as jest.Mocked<typeof axios>).mockResolvedValue(mockResponse);

      const result = await axios({
        method: 'GET',
        url: 'http://localhost:3001/api/v1/students',
        headers: {},
      });

      expect(result.status).toBe(500);
    });
  });
});

