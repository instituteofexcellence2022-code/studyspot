// ============================================
// ENVIRONMENT CONFIGURATION
// ============================================

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api',
  WS_URL: process.env.REACT_APP_WS_URL || 'ws://localhost:3001',
  APP_NAME: process.env.REACT_APP_NAME || 'StudySpot Admin Portal',
  APP_VERSION: process.env.REACT_APP_VERSION || '1.0.0',
  ENABLE_MOCK_DATA: process.env.REACT_APP_ENABLE_MOCK_DATA === 'true',
} as const;

export const API_BASE_URL = ENV.API_BASE_URL;
export const API_TIMEOUT = 30000; // 30 seconds

export const IS_DEVELOPMENT = ENV.NODE_ENV === 'development';
export const IS_PRODUCTION = ENV.NODE_ENV === 'production';
export const IS_TEST = ENV.NODE_ENV === 'test';

