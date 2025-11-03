/**
 * Environment Configuration
 * Centralized configuration for different environments
 */

export interface EnvironmentConfig {
  API_BASE_URL: string;
  WS_BASE_URL: string;
  SENTRY_DSN?: string;
  NODE_ENV: 'development' | 'production' | 'test';
  ENABLE_ANALYTICS: boolean;
  ENABLE_PERFORMANCE_MONITORING: boolean;
  PORTAL_TYPE: 'admin' | 'owner';
  PORTAL_NAME: string;
  VERSION: string;
  API_URL: string;
  API_TIMEOUT: number;
}

const getEnvironmentConfig = (): EnvironmentConfig => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 
                  (isDevelopment ? 'http://localhost:3001' : 'https://api.studyspot.com'),
    WS_BASE_URL: process.env.REACT_APP_WS_BASE_URL || 
                 (isDevelopment ? 'ws://localhost:3001' : 'wss://api.studyspot.com'),
    SENTRY_DSN: process.env.REACT_APP_SENTRY_DSN,
    NODE_ENV: process.env.NODE_ENV as EnvironmentConfig['NODE_ENV'],
    ENABLE_ANALYTICS: process.env.REACT_APP_ENABLE_ANALYTICS === 'true' || isProduction,
    ENABLE_PERFORMANCE_MONITORING: process.env.REACT_APP_ENABLE_PERFORMANCE_MONITORING === 'true' || isDevelopment,
    PORTAL_TYPE: 'admin' as const,
    PORTAL_NAME: 'STUDYSPOT Admin Portal',
    VERSION: '1.0.0',
    API_URL: process.env.REACT_APP_API_BASE_URL || 
             (isDevelopment ? 'http://localhost:3001' : 'https://api.studyspot.com'),
    API_TIMEOUT: 10000,
  };
};

export const ENV = getEnvironmentConfig();

// API Configuration
export const API_CONFIG = {
  BASE_URL: ENV.API_BASE_URL,
  WS_BASE_URL: ENV.WS_BASE_URL,
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      REFRESH: '/api/auth/refresh',
      LOGOUT: '/api/auth/logout',
      PROFILE: '/api/auth/profile'
    },
    USERS: {
      LIST: '/api/users',
      CREATE: '/api/users',
      UPDATE: '/api/users/:id',
      DELETE: '/api/users/:id',
      BY_ID: '/api/users/:id'
    },
    LIBRARIES: {
      LIST: '/api/libraries',
      CREATE: '/api/libraries',
      UPDATE: '/api/libraries/:id',
      DELETE: '/api/libraries/:id',
      BY_ID: '/api/libraries/:id',
      SEARCH: '/api/libraries/search'
    },
    BOOKINGS: {
      LIST: '/api/bookings',
      CREATE: '/api/bookings',
      UPDATE: '/api/bookings/:id',
      DELETE: '/api/bookings/:id',
      BY_ID: '/api/bookings/:id',
      BY_USER: '/api/bookings/user/:userId',
      BY_LIBRARY: '/api/bookings/library/:libraryId'
    },
    SEATS: {
      LIST: '/api/seats',
      CREATE: '/api/seats',
      UPDATE: '/api/seats/:id',
      DELETE: '/api/seats/:id',
      BY_LIBRARY: '/api/seats/library/:libraryId'
    },
    DASHBOARD: {
      STATS: '/api/dashboard/stats',
      ANALYTICS: '/api/dashboard/analytics'
    },
    SUBSCRIPTIONS: {
      LIST: '/api/subscriptions',
      CREATE: '/api/subscriptions',
      UPDATE: '/api/subscriptions/:id',
      CANCEL: '/api/subscriptions/:id/cancel',
      BY_ID: '/api/subscriptions/:id',
      CURRENT: '/api/subscriptions/current',
      CHANGE_PLAN: '/api/subscriptions/:id/change-plan'
    },
    PLANS: {
      LIST: '/api/plans',
      BY_ID: '/api/plans/:id'
    },
    INVOICES: {
      LIST: '/api/invoices',
      BY_ID: '/api/invoices/:id',
      DOWNLOAD: '/api/invoices/:id/pdf',
      PAY: '/api/invoices/:id/pay'
    },
    PAYMENT_METHODS: {
      LIST: '/api/payment-methods',
      CREATE: '/api/payment-methods',
      UPDATE: '/api/payment-methods/:id',
      DELETE: '/api/payment-methods/:id',
      SET_DEFAULT: '/api/payment-methods/:id/set-default'
    },
    TENANTS: {
      LIST: '/api/tenants',
      CURRENT: '/api/tenants/current',
      BY_ID: '/api/tenants/:id',
      ONBOARD: '/api/tenants/onboard',
      UPDATE: '/api/tenants/:id',
      SETTINGS: '/api/tenants/:id/settings',
      BRANDING: '/api/tenants/:id/branding',
      LOGO: '/api/tenants/:id/logo',
      SUSPEND: '/api/tenants/:id/suspend',
      REACTIVATE: '/api/tenants/:id/reactivate',
      DELETE: '/api/tenants/:id',
      ANALYTICS: '/api/tenants/:id/analytics',
      EXPORT: '/api/tenants/:id/export',
      HEALTH: '/api/tenants/:id/health',
      REGENERATE_KEYS: '/api/tenants/:id/regenerate-keys',
      TEST_WEBHOOK: '/api/tenants/:id/test-webhook'
    }
  },
};

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_ANALYTICS: ENV.ENABLE_ANALYTICS,
  ENABLE_PERFORMANCE_MONITORING: ENV.ENABLE_PERFORMANCE_MONITORING,
  ENABLE_SERVICE_WORKER: ENV.NODE_ENV === 'production',
  ENABLE_CHUNK_ERROR_RECOVERY: ENV.NODE_ENV === 'production',
};

// Development-only features
export const DEV_CONFIG = {
  ENABLE_REDUX_DEVTOOLS: ENV.NODE_ENV === 'development',
  ENABLE_PERFORMANCE_DASHBOARD: ENV.NODE_ENV === 'development',
  ENABLE_DEBUG_LOGGING: ENV.NODE_ENV === 'development',
  ENABLE_MOCK_DATA: ENV.NODE_ENV === 'development' && process.env.REACT_APP_USE_MOCK_DATA === 'true',
};

// Logging configuration
export const LOG_CONFIG = {
  LEVEL: (ENV.NODE_ENV === 'development') ? 'debug' : 'error',
  ENABLE_CONSOLE: ENV.NODE_ENV === 'development',
  ENABLE_REMOTE: ENV.NODE_ENV === 'production',
  REMOTE_ENDPOINT: `${API_CONFIG.BASE_URL}/api/logs`,
};