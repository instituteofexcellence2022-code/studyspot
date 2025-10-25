import ENV from '../config/environment';

// Portal Mode Configuration
export const PORTAL_MODE = ENV.PORTAL_TYPE;

export const PORTAL_CONFIG = {
  isLibraryPortal: PORTAL_MODE === 'owner',
  isAdminPortal: PORTAL_MODE === 'admin',
  portalName: ENV.PORTAL_NAME,
  version: ENV.VERSION,
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: ENV.API_URL,
  TIMEOUT: ENV.API_TIMEOUT,
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      REFRESH: '/api/auth/refresh',
      LOGOUT: '/api/auth/logout',
      PROFILE: '/api/auth/profile',
    },
    USERS: {
      LIST: '/api/users',
      CREATE: '/api/users',
      UPDATE: '/api/users/:id',
      DELETE: '/api/users/:id',
      BY_ID: '/api/users/:id',
    },
    LIBRARIES: {
      LIST: '/api/libraries',
      CREATE: '/api/libraries',
      UPDATE: '/api/libraries/:id',
      DELETE: '/api/libraries/:id',
      BY_ID: '/api/libraries/:id',
      SEARCH: '/api/libraries/search',
    },
    BOOKINGS: {
      LIST: '/api/bookings',
      CREATE: '/api/bookings',
      UPDATE: '/api/bookings/:id',
      DELETE: '/api/bookings/:id',
      BY_ID: '/api/bookings/:id',
      BY_USER: '/api/bookings/user/:userId',
      BY_LIBRARY: '/api/bookings/library/:libraryId',
    },
    SEATS: {
      LIST: '/api/seats',
      CREATE: '/api/seats',
      UPDATE: '/api/seats/:id',
      DELETE: '/api/seats/:id',
      BY_LIBRARY: '/api/seats/library/:libraryId',
    },
    DASHBOARD: {
      STATS: '/api/dashboard/stats',
      ANALYTICS: '/api/dashboard/analytics',
    },
    SUBSCRIPTIONS: {
      LIST: '/api/subscriptions',
      CREATE: '/api/subscriptions',
      UPDATE: '/api/subscriptions/:id',
      CANCEL: '/api/subscriptions/:id/cancel',
      BY_ID: '/api/subscriptions/:id',
      CURRENT: '/api/subscriptions/current',
      CHANGE_PLAN: '/api/subscriptions/:id/change-plan',
    },
    PLANS: {
      LIST: '/api/plans',
      BY_ID: '/api/plans/:id',
    },
    INVOICES: {
      LIST: '/api/invoices',
      BY_ID: '/api/invoices/:id',
      DOWNLOAD: '/api/invoices/:id/pdf',
      PAY: '/api/invoices/:id/pay',
    },
    PAYMENT_METHODS: {
      LIST: '/api/payment-methods',
      CREATE: '/api/payment-methods',
      UPDATE: '/api/payment-methods/:id',
      DELETE: '/api/payment-methods/:id',
      SET_DEFAULT: '/api/payment-methods/:id/set-default',
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
      TEST_WEBHOOK: '/api/tenants/:id/test-webhook',
    },
  },
};

// Application Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  EMAIL_VERIFICATION: '/verify-email',
  DASHBOARD: '/dashboard',
  LIBRARIES: '/libraries',
  LIBRARY_DETAILS: '/libraries/:id',
  LIBRARY_CREATE: '/libraries/create',
  LIBRARY_EDIT: '/libraries/:id/edit',
  SEATS: '/seats',
  SEATS_BY_LIBRARY: '/seats/library/:libraryId',
  FEE_PLANS: '/fee-plans',
  STUDENTS: '/students',
  ATTENDANCE: '/attendance',
  BARCODE_QR: '/barcode-qr',
  LEAD_CAPTURE: '/lead-capture',
  PAYMENTS: '/payments',
  PAYMENT_ANALYTICS: '/payment-analytics',
  SUBSCRIPTION_CREDITS: '/subscription-credits',
  SEAT_MANAGEMENT: '/seat-management',
  STAFF: '/staff',
  BOOKINGS: '/bookings',
  BOOKING_DETAILS: '/bookings/:id',
  USERS: '/users',
  USER_DETAILS: '/users/:id',
  USER_CREATE: '/users/create',
  USER_EDIT: '/users/:id/edit',
  ADMIN: '/admin',
  ADMIN_TENANTS: '/admin/tenants',
  ADMIN_TENANT_DETAILS: '/admin/tenants/:id',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_SETTINGS: '/admin/settings',
  AI_ASSISTANT: '/ai/assistant',
  AI_RECOMMENDATIONS: '/ai/recommendations',
  AI_ANALYTICS: '/ai/analytics',
  AI_SCHEDULER: '/ai/scheduler',
  SUBSCRIPTION: '/subscription',
  SUBSCRIPTION_PLANS: '/subscription/plans',
  SUBSCRIPTION_CHECKOUT: '/subscription/checkout',
  SUBSCRIPTION_MANAGE: '/subscription/manage',
  SUBSCRIPTION_BILLING: '/subscription/billing',
  SUBSCRIPTION_INVOICES: '/subscription/invoices',
  SUBSCRIPTION_UPGRADE: '/subscription/upgrade',
  SUBSCRIPTION_CANCEL: '/subscription/cancel',
  SUBSCRIPTION_SUCCESS: '/subscription/success',
  TENANT: '/tenant',
  TENANT_ONBOARDING: '/tenant/onboarding',
  TENANT_SETTINGS: '/tenant/settings',
  TENANT_ANALYTICS: '/tenant/analytics',
  ADMIN_ROLES: '/admin/roles',
  ADMIN_AUDIT_LOGS: '/admin/audit-logs',
  ADMIN_SECURITY: '/admin/security',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  HELP: '/help',
  NOT_FOUND: '/404',
};

// User Roles and Permissions
export const USER_ROLES = {
  // Platform-level roles
  SUPER_ADMIN: 'super_admin',
  PLATFORM_SUPPORT: 'platform_support',
  
  // Library-level roles (8 granular roles)
  LIBRARY_OWNER: 'library_owner',          // Full access to library
  LIBRARY_STAFF: 'library_staff',          // General staff role
  BRANCH_MANAGER: 'branch_manager',        // Branch-level management
  FRONT_DESK_STAFF: 'front_desk_staff',    // Daily operations
  FACILITY_MANAGER: 'facility_manager',     // Maintenance & facilities
  FINANCE_MANAGER: 'finance_manager',       // Financial operations
  ANALYTICS_MANAGER: 'analytics_manager',   // Data analysis & reporting
  
  // Student role
  STUDENT: 'student',
} as const;

// Permission Constants
export const PERMISSIONS = {
  // Profile permissions
  READ_OWN_PROFILE: 'read:own_profile',
  WRITE_OWN_PROFILE: 'write:own_profile',
  
  // Library permissions
  READ_LIBRARIES: 'read:libraries',
  WRITE_LIBRARIES: 'write:libraries',
  READ_LIBRARY_DATA: 'read:library_data',
  WRITE_LIBRARY_DATA: 'write:library_data',
  
  // Booking permissions
  READ_BOOKINGS: 'read:bookings',
  WRITE_BOOKINGS: 'write:bookings',
  READ_OWN_BOOKINGS: 'read:own_bookings',
  
  // User permissions
  READ_USERS: 'read:users',
  WRITE_USERS: 'write:users',
  
  // Analytics permissions
  READ_ANALYTICS: 'read:analytics',
  WRITE_ANALYTICS: 'write:analytics',
  
  // Admin permissions
  READ_ALL: 'read:all',
  WRITE_ALL: 'write:all',
  ADMIN_SYSTEM: 'admin:system',
  ADMIN_TENANTS: 'admin:tenants',
  ADMIN_ANALYTICS: 'admin:analytics',
} as const;

export const ROLE_PERMISSIONS = {
  [USER_ROLES.STUDENT]: [
    PERMISSIONS.READ_OWN_PROFILE,
    PERMISSIONS.WRITE_OWN_PROFILE,
    PERMISSIONS.READ_LIBRARIES,
    PERMISSIONS.WRITE_BOOKINGS,
    PERMISSIONS.READ_OWN_BOOKINGS,
  ],
  [USER_ROLES.LIBRARY_STAFF]: [
    PERMISSIONS.READ_LIBRARY_DATA,
    PERMISSIONS.WRITE_LIBRARY_DATA,
    PERMISSIONS.READ_BOOKINGS,
    PERMISSIONS.WRITE_BOOKINGS,
    PERMISSIONS.READ_USERS,
    PERMISSIONS.READ_OWN_PROFILE,
    PERMISSIONS.WRITE_OWN_PROFILE,
  ],
  [USER_ROLES.LIBRARY_OWNER]: [
    PERMISSIONS.READ_LIBRARY_DATA,
    PERMISSIONS.WRITE_LIBRARY_DATA,
    PERMISSIONS.READ_BOOKINGS,
    PERMISSIONS.WRITE_BOOKINGS,
    PERMISSIONS.READ_USERS,
    PERMISSIONS.WRITE_USERS,
    PERMISSIONS.READ_ANALYTICS,
    PERMISSIONS.READ_OWN_PROFILE,
    PERMISSIONS.WRITE_OWN_PROFILE,
  ],
  [USER_ROLES.SUPER_ADMIN]: [
    PERMISSIONS.READ_ALL,
    PERMISSIONS.WRITE_ALL,
    PERMISSIONS.ADMIN_SYSTEM,
    PERMISSIONS.ADMIN_TENANTS,
    PERMISSIONS.ADMIN_ANALYTICS,
  ],
};

// Application Settings
export const APP_CONFIG = {
  NAME: PORTAL_CONFIG.isAdminPortal ? '🎓 STUDYSPOT - Admin' : '🎓 STUDYSPOT',
  VERSION: '1.0.0',
  DESCRIPTION: PORTAL_CONFIG.isAdminPortal 
    ? 'Platform management and administration'
    : 'Multi-tenant SaaS platform for library management',
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  REFRESH_TOKEN_TIMEOUT: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

// UI Configuration
export const UI_CONFIG = {
  DRAWER_WIDTH: 240,
  HEADER_HEIGHT: 64,
  FOOTER_HEIGHT: 48,
  BORDER_RADIUS: 8,
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
  },
  BREAKPOINTS: {
    XS: 0,
    SM: 600,
    MD: 960,
    LG: 1280,
    XL: 1920,
  },
};

// Theme Configuration
export const THEME_COLORS = {
  PRIMARY: '#1976d2',
  SECONDARY: '#dc004e',
  SUCCESS: '#2e7d32',
  WARNING: '#ed6c02',
  ERROR: '#d32f2f',
  INFO: '#0288d1',
  BACKGROUND: '#f5f5f5',
  SURFACE: '#ffffff',
  TEXT_PRIMARY: '#212121',
  TEXT_SECONDARY: '#757575',
};

// Form Validation
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
};

// Error Messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  PASSWORD_TOO_SHORT: `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters`,
  NAME_TOO_SHORT: `Name must be at least ${VALIDATION_RULES.NAME_MIN_LENGTH} characters`,
  NAME_TOO_LONG: `Name must be less than ${VALIDATION_RULES.NAME_MAX_LENGTH} characters`,
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  FORBIDDEN: 'Access denied',
  NOT_FOUND: 'Resource not found',
  SERVER_ERROR: 'Internal server error. Please try again later.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  REGISTER_SUCCESS: 'Registration successful',
  PROFILE_UPDATED: 'Profile updated successfully',
  LIBRARY_CREATED: 'Library created successfully',
  LIBRARY_UPDATED: 'Library updated successfully',
  LIBRARY_DELETED: 'Library deleted successfully',
  BOOKING_CREATED: 'Booking created successfully',
  BOOKING_UPDATED: 'Booking updated successfully',
  BOOKING_CANCELLED: 'Booking cancelled successfully',
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  USER_DELETED: 'User deleted successfully',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'studyspot_auth_token',
  REFRESH_TOKEN: 'studyspot_refresh_token',
  USER_DATA: 'studyspot_user_data',
  THEME: 'studyspot_theme',
  LANGUAGE: 'studyspot_language',
  SIDEBAR_STATE: 'studyspot_sidebar_state',
};

// Chart Colors
export const CHART_COLORS = [
  '#1976d2',
  '#dc004e',
  '#2e7d32',
  '#ed6c02',
  '#d32f2f',
  '#0288d1',
  '#7b1fa2',
  '#388e3c',
  '#f57c00',
  '#c2185b',
];

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
  API: 'yyyy-MM-dd',
  API_WITH_TIME: 'yyyy-MM-dd HH:mm:ss',
  TIME_ONLY: 'HH:mm',
  DATE_ONLY: 'yyyy-MM-dd',
};

// File Upload Configuration
export const FILE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    SPREADSHEETS: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  },
};

