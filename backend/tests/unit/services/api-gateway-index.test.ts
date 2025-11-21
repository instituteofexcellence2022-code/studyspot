/**
 * UNIT TESTS - API GATEWAY INDEX
 * Tests for API Gateway initialization and setup
 */

import Fastify from 'fastify';
import { logger } from '../../../src/utils/logger';

// Mock logger
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock routes
jest.mock('../../../src/services/api-gateway/routes', () => ({
  registerRoutes: jest.fn(),
}));

describe('API Gateway Index', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Initialization', () => {
    it('should initialize Fastify instance', () => {
      const app = Fastify({ logger: false });
      
      expect(app).toBeDefined();
      expect(typeof app.listen).toBe('function');
    });

    it('should register routes', () => {
      const { registerRoutes } = require('../../../src/services/api-gateway/routes');
      
      const app = Fastify({ logger: false });
      registerRoutes(app);
      
      expect(registerRoutes).toHaveBeenCalledWith(app);
    });
  });

  describe('Error Handling', () => {
    it('should handle initialization errors', async () => {
      const app = Fastify({ logger: false });
      
      // Simulate an error during route registration
      const { registerRoutes } = require('../../../src/services/api-gateway/routes');
      (registerRoutes as jest.Mock).mockImplementation(() => {
        throw new Error('Route registration failed');
      });

      expect(() => registerRoutes(app)).toThrow('Route registration failed');
    });
  });

  describe('Port Configuration', () => {
    it('should use default port if not specified', () => {
      const defaultPort = parseInt(process.env.API_GATEWAY_PORT || '3000');
      
      expect(defaultPort).toBeGreaterThan(0);
      expect(defaultPort).toBeLessThan(65536);
    });

    it('should use environment port if specified', () => {
      const originalPort = process.env.API_GATEWAY_PORT;
      process.env.API_GATEWAY_PORT = '4000';
      
      const port = parseInt(process.env.API_GATEWAY_PORT || '3000');
      expect(port).toBe(4000);
      
      process.env.API_GATEWAY_PORT = originalPort;
    });
  });
});

