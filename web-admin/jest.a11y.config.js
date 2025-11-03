/**
 * Jest Accessibility Test Configuration
 */

module.exports = {
  displayName: 'Accessibility Tests',
  testMatch: ['<rootDir>/src/**/*.a11y.test.{ts,tsx}'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  testEnvironment: 'jsdom',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
  ],
  coverageDirectory: 'coverage/a11y',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 5000,
  maxWorkers: 1, // Run accessibility tests sequentially
};
