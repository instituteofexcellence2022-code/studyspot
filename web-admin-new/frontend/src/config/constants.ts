// ============================================
// CONSTANTS
// ============================================

export const ROUTES = {
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',
  TENANTS: '/tenants',
  USERS: '/users',
  ANALYTICS: '/analytics',
  SETTINGS: '/settings',
  PROFILE: '/profile',
  REPORTS: '/reports',
  AUDIT_LOGS: '/audit-logs',
  RBAC: {
    ROLES: '/rbac/roles',
    PERMISSIONS: '/rbac/permissions',
  },
  CRM: '/crm',
  MESSAGING: '/messaging',
  NOTIFICATIONS: '/notifications',
  SYSTEM_HEALTH: '/system-health',
  API_DOCS: '/api-docs',
  REVENUE: {
    DASHBOARD: '/revenue/dashboard',
    PLANS: '/revenue/plans',
    INVOICES: '/revenue/invoices',
    PAYMENT_METHODS: '/revenue/payment-methods',
    DUNNING: '/revenue/dunning',
    ANALYTICS: '/revenue/analytics',
  },
  CREDITS: '/credits/dashboard',
  SUBSCRIPTIONS: '/subscriptions',
  SECURITY: '/security',
  MICROSERVICES: '/microservices',
  TEMPLATES: '/templates',
  TICKETS: '/tickets',
  PAYMENTS: '/payments',
} as const;

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_EMAIL: '/auth/verify-email',
  USER_PROFILE: '/auth/profile',
  
  // User endpoints
  USERS: '/users',
  USER_BY_ID: (id: string) => `/users/${id}`,
  
  // Tenant endpoints
  TENANTS: '/tenants',
  TENANT_BY_ID: (id: string) => `/tenants/${id}`,
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
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  TIMEOUT: 'Request timed out. Please try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Validation error. Please check your input.',
  UNKNOWN_ERROR: 'An unknown error occurred.',
  GENERIC: 'An error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
} as const;

export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
} as const;

export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

export const APP_NAME = 'StudySpot Admin Portal';

export const APP_VERSION = '2.0.0';

