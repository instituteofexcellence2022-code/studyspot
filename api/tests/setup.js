/**
 * TEST SETUP
 * Issue #13 from Code Review - HIGH PRIORITY
 * 
 * Configures the testing environment for Jest
 * Sets up test database, mocks, and global test utilities
 */

const { connectDatabase, closePool } = require('../src/config/database');
const { connectRedis } = require('../src/config/redis');
const { logger } = require('../src/utils/logger');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-jwt-tokens-12345';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://localhost/studyspot_test';

// Suppress logs during testing
logger.silent = true;

// Global setup before all tests
beforeAll(async () => {
  try {
    // Connect to test database
    await connectDatabase();
    console.log('✓ Test database connected');

    // Connect to Redis (optional for tests)
    try {
      await connectRedis();
      console.log('✓ Test Redis connected');
    } catch (redisError) {
      console.log('⚠ Redis not available for tests (will use mock)');
    }

  } catch (error) {
    console.error('Failed to setup tests:', error);
    throw error;
  }
});

// Global teardown after all tests
afterAll(async () => {
  try {
    await closePool();
    console.log('✓ Test database disconnected');
  } catch (error) {
    console.error('Error during teardown:', error);
  }
});

// Increase timeout for integration tests
jest.setTimeout(10000);

// Global test utilities
global.testUtils = {
  /**
   * Wait for a specified time
   * @param {number} ms - Milliseconds to wait
   */
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * Generate random email for testing
   */
  randomEmail: () => `test${Date.now()}@example.com`,

  /**
   * Generate random string
   * @param {number} length - Length of string
   */
  randomString: (length = 10) => {
    return Math.random().toString(36).substring(2, length + 2);
  }
};




