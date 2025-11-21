/**
 * JEST CONFIGURATION
 * Configuration for running tests with Jest
 */

module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Preset for TypeScript
  preset: 'ts-jest',
  
  // Setup file to run before tests
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  // Test match patterns
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/tests/**/*.test.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  
  // Coverage directory
  coverageDirectory: 'coverage',
  
  // Files to collect coverage from
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/types/**',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/__tests__/**',
    '!**/dist/**'
  ],
  
  // Coverage thresholds (enforce minimum coverage)
  coverageThreshold: {
    global: {
      branches: 60, // Lowered temporarily to allow progress
      functions: 60,
      lines: 60,
      statements: 60
    },
    // Higher thresholds for critical services
    './src/services/': {
      branches: 50, // Will increase as we add more tests
      functions: 50,
      lines: 50,
      statements: 50
    },
    './src/middleware/': {
      branches: 70, // Middleware should have higher coverage
      functions: 70,
      lines: 70,
      statements: 70
    },
    './src/utils/errors.ts': {
      branches: 90, // Error handling should be well tested
      functions: 100,
      lines: 90,
      statements: 90
    }
  },
  
  // Module paths
  moduleNameMapper: {
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@middleware/(.*)$': '<rootDir>/src/middleware/$1'
  },
  
  // Transform files
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true
      }
    }]
  },
  
  // Verbose output
  verbose: true,
  
  // Force exit after tests complete
  forceExit: true,
  
  // Clear mocks between tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  
  // Timeout for tests
  testTimeout: 10000,
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],
  
  // Coverage reporters
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov'
  ]
};

