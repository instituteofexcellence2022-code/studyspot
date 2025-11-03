/**
 * StudySpot Mobile App - Enhanced Constants with Theme
 * Complete theme and styling constants
 */

export const COLORS = {
  PRIMARY: '#2563eb',
  PRIMARY_DARK: '#1d4ed8',
  PRIMARY_LIGHT: '#3b82f6',
  
  SECONDARY: '#64748b',
  SECONDARY_DARK: '#475569',
  SECONDARY_LIGHT: '#94a3b8',
  
  SUCCESS: '#10b981',
  SUCCESS_DARK: '#059669',
  SUCCESS_LIGHT: '#34d399',
  
  WARNING: '#f59e0b',
  WARNING_DARK: '#d97706',
  WARNING_LIGHT: '#fbbf24',
  
  ERROR: '#ef4444',
  ERROR_DARK: '#dc2626',
  ERROR_LIGHT: '#f87171',
  
  INFO: '#06b6d4',
  INFO_DARK: '#0891b2',
  INFO_LIGHT: '#22d3ee',
  
  BACKGROUND: {
    PRIMARY: '#ffffff',
    SECONDARY: '#f8fafc',
    TERTIARY: '#f1f5f9',
    DARK: '#0f172a',
  },
  
  TEXT: {
    PRIMARY: '#0f172a',
    SECONDARY: '#64748b',
    TERTIARY: '#94a3b8',
    LINK: '#2563eb',
    WHITE: '#ffffff',
  },
  
  BORDER: {
    PRIMARY: '#e2e8f0',
    SECONDARY: '#cbd5e1',
    FOCUS: '#2563eb',
  },
  
  SHADOW: {
    SMALL: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    MEDIUM: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    LARGE: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  },
};

export const LAYOUT = {
  PADDING: {
    XS: 4,
    SM: 8,
    MD: 12,
    LG: 16,
    XL: 20,
    XXL: 24,
  },
  
  MARGIN: {
    XS: 4,
    SM: 8,
    MD: 12,
    LG: 16,
    XL: 20,
    XXL: 24,
  },
  
  BORDER_RADIUS: {
    SM: 4,
    MD: 8,
    LG: 12,
    XL: 16,
    FULL: 9999,
  },
  
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 12,
    LG: 16,
    XL: 20,
    XXL: 24,
  },
};

export const TYPOGRAPHY = {
  FONT_SIZES: {
    XS: 12,
    SM: 14,
    MD: 16,
    LG: 18,
    XL: 20,
    XXL: 24,
    XXXL: 32,
  },
  
  FONT_WEIGHTS: {
    LIGHT: '300',
    REGULAR: '400',
    MEDIUM: '500',
    SEMIBOLD: '600',
    BOLD: '700',
    EXTRABOLD: '800',
  },
  
  LINE_HEIGHTS: {
    TIGHT: 1.2,
    NORMAL: 1.5,
    RELAXED: 1.75,
  },
};

export const VALIDATION = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  NAME: /^[a-zA-Z\s]{2,50}$/,
};

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
  },
};

export const API = {
  BASE_URL: 'https://api.studyspot.com',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

export const STORAGE = {
  KEYS: {
    USER_TOKEN: 'user_token',
    USER_DATA: 'user_data',
    SETTINGS: 'app_settings',
    CACHE: 'app_cache',
  },
};

export const NAVIGATION = {
  ANIMATION_DURATION: 300,
  HEADER_HEIGHT: 60,
  TAB_BAR_HEIGHT: 60,
};

export const PERFORMANCE = {
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 1000,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
};

export const DEEP_LINKING = {
  SCHEME: 'studyspot',
  HOST: 'app',
  PATHS: {
    LIBRARY: 'library',
    BOOKING: 'booking',
    PROFILE: 'profile',
    PAYMENT: 'payment',
    CHAT: 'chat',
  },
};

export const NOTIFICATIONS = {
  TYPES: {
    BOOKING_CONFIRMATION: 'booking_confirmation',
    BOOKING_REMINDER: 'booking_reminder',
    PAYMENT_SUCCESS: 'payment_success',
    LIBRARY_UPDATE: 'library_update',
    PROMOTION: 'promotion',
  },
  
  CHANNELS: {
    GENERAL: 'general',
    BOOKINGS: 'bookings',
    PAYMENTS: 'payments',
    PROMOTIONS: 'promotions',
  },
};

export const ANALYTICS = {
  EVENTS: {
    SCREEN_VIEW: 'screen_view',
    USER_INTERACTION: 'user_interaction',
    API_REQUEST: 'api_request',
    ERROR: 'error',
    PERFORMANCE: 'performance',
  },
  
  PROPERTIES: {
    SCREEN_NAME: 'screen_name',
    ACTION: 'action',
    SUCCESS: 'success',
    DURATION: 'duration',
    ERROR_MESSAGE: 'error_message',
  },
};

export const THEME = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    success: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
  },
  fonts: {
    heading: 'System',
    body: 'System',
    mono: 'System',
  },
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
    '7xl': 72,
    '8xl': 96,
    '9xl': 128,
  },
  space: {
    px: 1,
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    12: 48,
    16: 64,
    20: 80,
    24: 96,
    32: 128,
    40: 160,
    48: 192,
    56: 224,
    64: 256,
    72: 288,
    80: 320,
    96: 384,
  },
  sizes: {
    '0': 0,
    '1': 4,
    '2': 8,
    '3': 12,
    '4': 16,
    '5': 20,
    '6': 24,
    '7': 28,
    '8': 32,
    '9': 36,
    '10': 40,
    '12': 48,
    '16': 64,
    '20': 80,
    '24': 96,
    '32': 128,
    '40': 160,
    '48': 192,
    '56': 224,
    '64': 256,
    '72': 288,
    '80': 320,
    '96': 384,
    '1/2': '50%',
    '1/3': '33.333%',
    '2/3': '66.666%',
    '1/4': '25%',
    '2/4': '50%',
    '3/4': '75%',
    '1/5': '20%',
    '2/5': '40%',
    '3/5': '60%',
    '4/5': '80%',
    '1/6': '16.666%',
    '5/6': '83.333%',
    full: '100%',
    '3xs': '14rem',
    '2xs': '16rem',
    xs: '20rem',
    sm: '24rem',
    md: '28rem',
    lg: '32rem',
    xl: '36rem',
    '2xl': '42rem',
    '3xl': '48rem',
    '4xl': '56rem',
    '5xl': '64rem',
    '6xl': '72rem',
    '7xl': '80rem',
    '8xl': '88rem',
    '9xl': '96rem',
  },
  borderWidths: {
    '0': 0,
    '1': 1,
    '2': 2,
    '4': 4,
    '8': 8,
  },
  radii: {
    none: 0,
    sm: 2,
    base: 4,
    md: 6,
    lg: 8,
    xl: 12,
    '2xl': 16,
    '3xl': 24,
    full: 9999,
  },
  shadows: {
    '0': 'none',
    '1': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    '2': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    '3': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    '4': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    '5': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '6': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '7': '0 0 0 1px rgb(0 0 0 / 0.05), 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    '8': '0 0 0 1px rgb(0 0 0 / 0.05), 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '9': '0 0 0 1px rgb(0 0 0 / 0.05), 0 25px 50px -12px rgb(0 0 0 / 0.25)',
  },
};

export default {
  COLORS,
  LAYOUT,
  TYPOGRAPHY,
  VALIDATION,
  ANIMATION,
  API,
  STORAGE,
  NAVIGATION,
  PERFORMANCE,
  DEEP_LINKING,
  NOTIFICATIONS,
  ANALYTICS,
  THEME,
};