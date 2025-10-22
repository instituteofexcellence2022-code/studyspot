/**
 * StudySpot Mobile App - Constants
 * Centralized constants for the entire application
 */

import {Dimensions, Platform} from 'react-native';

// =============================================================================
// APP CONFIGURATION
// =============================================================================

export const APP_CONFIG = {
  NAME: 'StudySpot',
  VERSION: '1.0.0',
  BUILD_NUMBER: 1,
  MINIMUM_APP_VERSION: '1.0.0',
  SUPPORT_EMAIL: 'support@studyspot.com',
  SUPPORT_PHONE: '+91-8000-123-456',
  WEBSITE: 'https://studyspot.com',
  PRIVACY_POLICY: 'https://studyspot.com/privacy',
  TERMS_OF_SERVICE: 'https://studyspot.com/terms',
} as const;

// =============================================================================
// API CONFIGURATION
// =============================================================================

export const API_CONFIG = {
  BASE_URL: __DEV__ ? 'http://localhost:3001/api' : 'https://api.studyspot.com/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      REFRESH: '/auth/refresh',
      LOGOUT: '/auth/logout',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
      VERIFY_OTP: '/auth/verify-otp',
    },
    USERS: {
      PROFILE: '/users/profile',
      UPDATE_PROFILE: '/users/profile',
      UPLOAD_DOCUMENT: '/users/upload-document',
      KYC_STATUS: '/users/kyc-status',
    },
    LIBRARIES: {
      LIST: '/libraries',
      DETAILS: '/libraries/:id',
      SEATS: '/libraries/:id/seats',
      SEARCH: '/libraries/search',
    },
    BOOKINGS: {
      AVAILABILITY: '/bookings/availability',
      CREATE: '/bookings',
      LIST: '/bookings',
      DETAILS: '/bookings/:id',
      CANCEL: '/bookings/:id',
      CHECKIN: '/bookings/:id/checkin',
      CHECKOUT: '/bookings/:id/checkout',
      WAITLIST: '/bookings/waitlist',
    },
    PAYMENTS: {
      CREATE_ORDER: '/payments/create-order',
      VERIFY: '/payments/verify',
      HISTORY: '/payments',
      DETAILS: '/payments/:id',
      REFUND: '/payments/:id/refund',
      CONFIG: '/payments/config',
      CAPTURE: '/payments/capture',
    },
    NOTIFICATIONS: {
      LIST: '/notifications',
      MARK_READ: '/notifications/:id/read',
      READ_ALL: '/notifications/read-all',
      PREFERENCES: '/notifications/preferences',
    },
    RECOMMENDATIONS: {
      PERSONALIZED: '/recommendations',
      TRENDING: '/libraries/trending',
      SIMILAR: '/libraries/:id/similar',
    },
    GAMIFICATION: {
      ME: '/gamification/me',
      LEADERBOARD: '/gamification/leaderboard',
      REWARDS: '/gamification/rewards',
    },
    CHATBOT: {
      MESSAGE: '/chatbot/message',
    },
    ANALYTICS: {
      PREDICT_OCCUPANCY: '/analytics/predict-occupancy/:libraryId',
      PEAK_HOURS: '/analytics/peak-hours/:libraryId',
      WEEKLY_DEMAND: '/analytics/weekly-demand/:libraryId',
      PRICING_SUGGESTION: '/analytics/pricing-suggestion/:libraryId',
      USER_BEHAVIOR: '/analytics/user-behavior',
    },
    // Phase 6: SaaS Features
    SUBSCRIPTIONS: {
      PLANS: '/subscriptions/plans',
      CREATE: '/subscriptions/create',
      BY_TENANT_ID: '/subscriptions/:tenantId',
      UPGRADE: '/subscriptions/:id/upgrade',
      DOWNGRADE: '/subscriptions/:id/downgrade',
      CANCEL: '/subscriptions/:id/cancel',
      INVOICES: '/subscriptions/:tenantId/invoices',
      CUSTOMER_PORTAL: '/subscriptions/:id/portal',
    },
    CREDITS: {
      BALANCE: '/credits/balance',
      USAGE: '/credits/usage',
      PACKAGES: '/credits/packages',
      PURCHASE: '/credits/purchase',
      AUTO_TOPUP: '/credits/auto-topup',
      UPDATE_AUTO_TOPUP: '/credits/auto-topup/:id',
    },
    OWNER_DASHBOARD: {
      STATS: '/owner/dashboard/stats',
      ANALYTICS: '/owner/dashboard/analytics',
      ACTIVITY: '/owner/dashboard/activity',
      ALERTS: '/owner/dashboard/alerts',
    },
  },
} as const;

// =============================================================================
// SCREEN DIMENSIONS
// =============================================================================

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

export const SCREEN_DIMENSIONS = {
  WIDTH: SCREEN_WIDTH,
  HEIGHT: SCREEN_HEIGHT,
  IS_SMALL_DEVICE: SCREEN_WIDTH < 375,
  IS_TABLET: SCREEN_WIDTH >= 768,
} as const;

// =============================================================================
// LAYOUT CONSTANTS
// =============================================================================

export const LAYOUT = {
  PADDING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
  },
  MARGIN: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
  },
  BORDER_RADIUS: {
    XS: 4,
    SM: 8,
    MD: 12,
    LG: 16,
    XL: 24,
  },
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
  },
} as const;

// =============================================================================
// COLORS
// =============================================================================

export const COLORS = {
  // Primary Colors
  PRIMARY: '#2E7D32',
  PRIMARY_DARK: '#1B5E20',
  PRIMARY_LIGHT: '#4CAF50',
  
  // Secondary Colors
  SECONDARY: '#FF6B35',
  SECONDARY_DARK: '#E55A2B',
  SECONDARY_LIGHT: '#FF8A65',
  
  // Accent Colors
  ACCENT: '#2196F3',
  ACCENT_DARK: '#1976D2',
  ACCENT_LIGHT: '#64B5F6',
  
  // Status Colors
  SUCCESS: '#4CAF50',
  WARNING: '#FF9800',
  ERROR: '#F44336',
  INFO: '#2196F3',
  
  // Neutral Colors
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  GRAY: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  
  // Background Colors
  BACKGROUND: {
    PRIMARY: '#FFFFFF',
    SECONDARY: '#F8F9FA',
    TERTIARY: '#F1F3F4',
    CARD: '#FFFFFF',
    OVERLAY: 'rgba(0, 0, 0, 0.5)',
  },
  
  // Text Colors
  TEXT: {
    PRIMARY: '#212121',
    SECONDARY: '#757575',
    TERTIARY: '#9E9E9E',
    INVERSE: '#FFFFFF',
    PLACEHOLDER: '#BDBDBD',
    LINK: '#2196F3',
  },
  
  // Border Colors
  BORDER: {
    PRIMARY: '#E0E0E0',
    SECONDARY: '#F5F5F5',
    FOCUS: '#2196F3',
    ERROR: '#F44336',
  },
  
  // Shadow Colors
  SHADOW: {
    LIGHT: 'rgba(0, 0, 0, 0.1)',
    MEDIUM: 'rgba(0, 0, 0, 0.2)',
    DARK: 'rgba(0, 0, 0, 0.3)',
  },
} as const;

// =============================================================================
// TYPOGRAPHY
// =============================================================================

export const TYPOGRAPHY = {
  FONT_FAMILY: {
    REGULAR: Platform.OS === 'ios' ? 'System' : 'Roboto',
    MEDIUM: Platform.OS === 'ios' ? 'System' : 'Roboto-Medium',
    BOLD: Platform.OS === 'ios' ? 'System' : 'Roboto-Bold',
    LIGHT: Platform.OS === 'ios' ? 'System' : 'Roboto-Light',
  },
  FONT_SIZE: {
    XS: 12,
    SM: 14,
    MD: 16,
    LG: 18,
    XL: 20,
    XXL: 24,
    XXXL: 32,
  },
  LINE_HEIGHT: {
    XS: 16,
    SM: 20,
    MD: 24,
    LG: 28,
    XL: 32,
    XXL: 36,
    XXXL: 40,
  },
  FONT_WEIGHT: {
    LIGHT: '300',
    REGULAR: '400',
    MEDIUM: '500',
    SEMIBOLD: '600',
    BOLD: '700',
  },
} as const;

// =============================================================================
// ANIMATION CONSTANTS
// =============================================================================

export const ANIMATION = {
  DURATION: {
    FAST: 200,
    NORMAL: 300,
    SLOW: 500,
  },
  EASING: {
    EASE_IN: 'ease-in',
    EASE_OUT: 'ease-out',
    EASE_IN_OUT: 'ease-in-out',
    LINEAR: 'linear',
  },
} as const;

// =============================================================================
// VALIDATION RULES
// =============================================================================

export const VALIDATION = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[+]?[1-9][\d]{0,15}$/,
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z\s]+$/,
  },
  OTP: {
    LENGTH: 6,
    PATTERN: /^\d{6}$/,
  },
} as const;

// =============================================================================
// BOOKING CONSTANTS
// =============================================================================

export const BOOKING = {
  MIN_ADVANCE_BOOKING_HOURS: 1,
  MAX_ADVANCE_BOOKING_DAYS: 30,
  DEFAULT_BOOKING_DURATION: 4, // hours
  MAX_BOOKING_DURATION: 12, // hours
  CANCELLATION_WINDOW_HOURS: 2,
  CHECKIN_GRACE_PERIOD_MINUTES: 15,
  CHECKOUT_GRACE_PERIOD_MINUTES: 30,
  TIME_SLOT_DURATION: 30, // minutes
  WORKING_HOURS: {
    START: '06:00',
    END: '23:00',
  },
} as const;

// =============================================================================
// PAYMENT CONSTANTS
// =============================================================================

export const PAYMENT = {
  CURRENCY: 'INR',
  MIN_AMOUNT: 1,
  MAX_AMOUNT: 100000,
  REFUND_PROCESSING_DAYS: 5,
  PAYMENT_TIMEOUT_MINUTES: 15,
} as const;

// =============================================================================
// NOTIFICATION CONSTANTS
// =============================================================================

export const NOTIFICATION = {
  TYPES: {
    BOOKING: 'booking',
    PAYMENT: 'payment',
    SYSTEM: 'system',
    PROMOTIONAL: 'promotional',
  },
  PRIORITIES: {
    LOW: 'low',
    NORMAL: 'normal',
    HIGH: 'high',
    URGENT: 'urgent',
  },
} as const;

// =============================================================================
// STORAGE KEYS
// =============================================================================

export const STORAGE_KEYS = {
  AUTH_TOKENS: 'auth_tokens',
  USER_PROFILE: 'user_profile',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  THEME_PREFERENCE: 'theme_preference',
  LANGUAGE_PREFERENCE: 'language_preference',
  NOTIFICATION_PREFERENCES: 'notification_preferences',
  SEARCH_HISTORY: 'search_history',
  FAVORITE_LIBRARIES: 'favorite_libraries',
  CACHED_LIBRARIES: 'cached_libraries',
  OFFLINE_DATA: 'offline_data',
} as const;

// =============================================================================
// ERROR MESSAGES
// =============================================================================

export const ERROR_MESSAGES = {
  NETWORK: {
    NO_INTERNET: 'No internet connection. Please check your network.',
    TIMEOUT: 'Request timed out. Please try again.',
    SERVER_ERROR: 'Server error. Please try again later.',
  },
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password.',
    USER_NOT_FOUND: 'User not found.',
    EMAIL_ALREADY_EXISTS: 'Email already exists.',
    WEAK_PASSWORD: 'Password is too weak.',
    INVALID_TOKEN: 'Invalid or expired token.',
  },
  BOOKING: {
    SEAT_NOT_AVAILABLE: 'Selected seat is not available.',
    INVALID_TIME_SLOT: 'Invalid time slot selected.',
    BOOKING_CONFLICT: 'Booking conflicts with existing reservation.',
    CANNOT_CANCEL: 'Cannot cancel this booking.',
    CHECKIN_FAILED: 'Check-in failed. Please try again.',
    CHECKOUT_FAILED: 'Check-out failed. Please try again.',
  },
  PAYMENT: {
    PAYMENT_FAILED: 'Payment failed. Please try again.',
    INVALID_AMOUNT: 'Invalid payment amount.',
    REFUND_FAILED: 'Refund failed. Please contact support.',
  },
  GENERAL: {
    SOMETHING_WENT_WRONG: 'Something went wrong. Please try again.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    PERMISSION_DENIED: 'Permission denied.',
    FEATURE_NOT_AVAILABLE: 'This feature is not available.',
  },
  SUBSCRIPTION: {
    FETCH_PLANS_FAILED: 'Failed to fetch subscription plans.',
    FETCH_SUBSCRIPTION_FAILED: 'Failed to fetch subscription details.',
    CREATE_FAILED: 'Failed to create subscription.',
    UPGRADE_FAILED: 'Failed to upgrade subscription.',
    DOWNGRADE_FAILED: 'Failed to downgrade subscription.',
    CANCEL_FAILED: 'Failed to cancel subscription.',
    FETCH_INVOICES_FAILED: 'Failed to fetch invoices.',
    PORTAL_FAILED: 'Failed to open billing portal.',
  },
  CREDITS: {
    FETCH_BALANCE_FAILED: 'Failed to fetch credit balance.',
    FETCH_USAGE_FAILED: 'Failed to fetch usage history.',
    PURCHASE_FAILED: 'Failed to purchase credits.',
    AUTO_TOPUP_FAILED: 'Failed to configure auto top-up.',
  },
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
} as const;

// =============================================================================
// SUCCESS MESSAGES
// =============================================================================

export const SUCCESS_MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: 'Welcome back!',
    REGISTER_SUCCESS: 'Account created successfully!',
    LOGOUT_SUCCESS: 'Logged out successfully.',
    PASSWORD_RESET: 'Password reset successfully.',
  },
  BOOKING: {
    BOOKING_CREATED: 'Booking created successfully!',
    BOOKING_CANCELLED: 'Booking cancelled successfully.',
    CHECKIN_SUCCESS: 'Check-in successful!',
    CHECKOUT_SUCCESS: 'Check-out successful!',
  },
  PAYMENT: {
    PAYMENT_SUCCESS: 'Payment successful!',
    REFUND_SUCCESS: 'Refund processed successfully.',
  },
  PROFILE: {
    PROFILE_UPDATED: 'Profile updated successfully.',
    DOCUMENT_UPLOADED: 'Document uploaded successfully.',
  },
  SUBSCRIPTION: {
    SUBSCRIPTION_CREATED: 'Subscription created successfully!',
    SUBSCRIPTION_UPGRADED: 'Subscription upgraded successfully!',
    SUBSCRIPTION_DOWNGRADED: 'Plan downgraded successfully.',
    SUBSCRIPTION_CANCELLED: 'Subscription cancelled successfully.',
  },
  CREDITS: {
    CREDITS_PURCHASED: 'Credits purchased successfully!',
    AUTO_TOPUP_ENABLED: 'Auto top-up enabled successfully.',
    AUTO_TOPUP_DISABLED: 'Auto top-up disabled successfully.',
  },
} as const;

// =============================================================================
// FEATURE FLAGS
// =============================================================================

export const FEATURE_FLAGS = {
  ENABLE_OFFLINE_MODE: __DEV__ || true,
  ENABLE_ANALYTICS: !__DEV__,
  ENABLE_CRASH_REPORTING: !__DEV__,
  ENABLE_PUSH_NOTIFICATIONS: true,
  ENABLE_BIOMETRIC_AUTH: true,
  ENABLE_SOCIAL_LOGIN: true,
  ENABLE_DARK_THEME: true,
  ENABLE_MULTI_LANGUAGE: false,
} as const;

// =============================================================================
// PLATFORM CONSTANTS
// =============================================================================

export const PLATFORM = {
  IS_IOS: Platform.OS === 'ios',
  IS_ANDROID: Platform.OS === 'android',
  VERSION: Platform.Version,
} as const;
