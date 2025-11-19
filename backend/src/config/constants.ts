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
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  ACCOUNT_INACTIVE: 'ACCOUNT_INACTIVE',
  
  // Validation (2xxx)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING',
  INVALID_FORMAT: 'INVALID_FORMAT',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  
  // Resource (3xxx)
  NOT_FOUND: 'NOT_FOUND',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_DELETED: 'RESOURCE_DELETED',
  CONFLICT: 'CONFLICT',
  
  // Business Logic (4xxx)
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  SUBSCRIPTION_EXPIRED: 'SUBSCRIPTION_EXPIRED',
  LIMIT_EXCEEDED: 'LIMIT_EXCEEDED',
  TENANT_SUSPENDED: 'TENANT_SUSPENDED',
  
  // External Services (5xxx)
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  PAYMENT_GATEWAY_ERROR: 'PAYMENT_GATEWAY_ERROR',
  SMS_SERVICE_ERROR: 'SMS_SERVICE_ERROR',
  EMAIL_SERVICE_ERROR: 'EMAIL_SERVICE_ERROR',
  
  // System (6xxx)
  DATABASE_ERROR: 'DATABASE_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
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

