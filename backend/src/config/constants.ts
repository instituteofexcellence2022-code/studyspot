// ============================================
// APPLICATION CONSTANTS
// ============================================

export const APP_CONFIG = {
  NAME: 'StudySpot Backend API',
  VERSION: '1.0.0',
  PORT: process.env.PORT || 3000,
  API_VERSION: process.env.API_VERSION || 'v1',
  NODE_ENV: process.env.NODE_ENV || 'development',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const ERROR_CODES = {
  // Authentication (1xxx)
  UNAUTHORIZED: 1001,
  INVALID_TOKEN: 1002,
  TOKEN_EXPIRED: 1003,
  INSUFFICIENT_PERMISSIONS: 1004,
  INVALID_CREDENTIALS: 1005,
  ACCOUNT_INACTIVE: 1006,
  
  // Validation (2xxx)
  VALIDATION_ERROR: 2001,
  REQUIRED_FIELD_MISSING: 2002,
  INVALID_FORMAT: 2003,
  DUPLICATE_ENTRY: 2004,
  
  // Resource (3xxx)
  RESOURCE_NOT_FOUND: 3001,
  RESOURCE_ALREADY_EXISTS: 3002,
  RESOURCE_DELETED: 3003,
  
  // Business Logic (4xxx)
  INSUFFICIENT_BALANCE: 4001,
  SUBSCRIPTION_EXPIRED: 4002,
  LIMIT_EXCEEDED: 4003,
  TENANT_SUSPENDED: 4004,
  
  // External Services (5xxx)
  PAYMENT_GATEWAY_ERROR: 5001,
  SMS_SERVICE_ERROR: 5002,
  EMAIL_SERVICE_ERROR: 5003,
  
  // System (6xxx)
  DATABASE_ERROR: 6001,
  SERVER_ERROR: 6002,
  SERVICE_UNAVAILABLE: 6003,
} as const;

export const PERMISSIONS = {
  // User management
  'users:read': 'View users',
  'users:create': 'Create users',
  'users:update': 'Update users',
  'users:delete': 'Delete users',
  
  // Tenant management
  'tenants:read': 'View tenants',
  'tenants:create': 'Create tenants',
  'tenants:update': 'Update tenants',
  'tenants:delete': 'Delete tenants',
  'tenants:suspend': 'Suspend tenants',
  
  // Student management
  'students:read': 'View students',
  'students:create': 'Create students',
  'students:update': 'Update students',
  'students:delete': 'Delete students',
  
  // Financial
  'payments:read': 'View payments',
  'payments:create': 'Create payments',
  'payments:refund': 'Process refunds',
  'revenue:read': 'View revenue',
  
  // System
  'system:settings': 'Manage system settings',
  'system:logs': 'View system logs',
  'system:health': 'View system health',
} as const;

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  SUPPORT: 'support',
  ANALYST: 'analyst',
  TENANT_OWNER: 'tenant_owner',
  TENANT_MANAGER: 'tenant_manager',
  TENANT_STAFF: 'tenant_staff',
} as const;

export const RATE_LIMITS = {
  DEFAULT: {
    max: 100,
    timeWindow: '1 minute',
  },
  AUTH: {
    max: 5,
    timeWindow: '15 minutes',
  },
  PAYMENT: {
    max: 10,
    timeWindow: '1 minute',
  },
} as const;

export const CACHE_TTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

