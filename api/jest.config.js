/**
 * JEST CONFIGURATION
 * Configuration for running tests with Jest
 */

module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Setup file to run before tests
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Test match patterns
  testMatch: [
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.js'
  ],

  // Coverage directory
  coverageDirectory: 'coverage',

  // Files to collect coverage from
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',  // Exclude entry point
    '!src/**/index.js',
    '!**/node_modules/**',
    '!**/tests/**'
  ],

  // Coverage thresholds (enforce minimum coverage)
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },

  // Verbose output
  verbose: true,

  // Force exit after tests complete
  forceExit: true,

  // Clear mocks between tests
  clearMocks: true,

  // Timeout for tests
  testTimeout: 10000
};




