/**
 * UNIT TESTS - LOGGER UTILITY
 */

import winston from 'winston';
import { logger } from '../../../src/utils/logger';

// Mock winston
jest.mock('winston', () => {
  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };

  return {
    format: {
      combine: jest.fn(),
      timestamp: jest.fn(),
      errors: jest.fn(),
      splat: jest.fn(),
      json: jest.fn(),
      colorize: jest.fn(),
      printf: jest.fn(),
    },
    transports: {
      Console: jest.fn(),
      File: jest.fn(),
    },
    createLogger: jest.fn(() => mockLogger),
  };
});

describe('Logger Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(logger).toBeDefined();
  });

  it('should have logging methods', () => {
    expect(logger.info).toBeDefined();
    expect(logger.error).toBeDefined();
    expect(logger.warn).toBeDefined();
    expect(logger.debug).toBeDefined();
  });

  it('should log info messages', () => {
    logger.info('Test info message');
    expect(logger.info).toHaveBeenCalledWith('Test info message');
  });

  it('should log error messages', () => {
    logger.error('Test error message');
    expect(logger.error).toHaveBeenCalledWith('Test error message');
  });

  it('should log warning messages', () => {
    logger.warn('Test warning message');
    expect(logger.warn).toHaveBeenCalledWith('Test warning message');
  });

  it('should log debug messages', () => {
    logger.debug('Test debug message');
    expect(logger.debug).toHaveBeenCalledWith('Test debug message');
  });

  it('should log with metadata', () => {
    logger.info('Test message', { key: 'value' });
    expect(logger.info).toHaveBeenCalledWith('Test message', { key: 'value' });
  });
});
