/**
 * UNIT TESTS - ENVIRONMENT CONFIGURATION
 */

import { config } from '../../../src/config/env';

describe('Environment Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Node Environment', () => {
    it('should have nodeEnv defined', () => {
      expect(config.nodeEnv).toBeDefined();
      expect(['development', 'production', 'test']).toContain(config.nodeEnv);
    });

    it('should detect development environment', () => {
      process.env.NODE_ENV = 'development';
      const { config: devConfig } = require('../../../src/config/env');
      expect(devConfig.isDevelopment).toBe(true);
    });

    it('should detect production environment', () => {
      process.env.NODE_ENV = 'production';
      const { config: prodConfig } = require('../../../src/config/env');
      expect(prodConfig.isProduction).toBe(true);
    });
  });

  describe('Database Configuration', () => {
    it('should have database URL or individual parameters', () => {
      expect(config.database).toBeDefined();
    });
  });

  describe('JWT Configuration', () => {
    it('should have JWT secret defined', () => {
      expect(config.jwt).toBeDefined();
      expect(config.jwt.secret).toBeDefined();
    });
  });

  describe('Logging Configuration', () => {
    it('should have logging level defined', () => {
      expect(config.logging).toBeDefined();
      expect(config.logging.level).toBeDefined();
      expect(['error', 'warn', 'info', 'debug']).toContain(config.logging.level);
    });
  });
});
