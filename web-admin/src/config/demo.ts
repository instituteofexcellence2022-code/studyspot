/**
 * Demo Mode Configuration
 * Controls demo features and prevents them from shipping to production
 */

import ENV from './environment';

export const DEMO_CONFIG = {
  ENABLED: ENV.NODE_ENV === 'development' && ENV.ENABLE_DEMO_ACCOUNT,
  ACCOUNT: {
    email: 'admin@demo.com',
    password: 'Admin123456',
    firstName: 'Demo',
    lastName: 'Admin',
    phone: '+1234567891',
    role: 'super_admin',
  },
} as const;

/**
 * Guards demo-related code from executing in production
 */
export const isDemoModeEnabled = (): boolean => {
  return DEMO_CONFIG.ENABLED;
};

/**
 * Gets demo account credentials (only in development)
 */
export const getDemoAccount = () => {
  if (!isDemoModeEnabled()) {
    throw new Error('Demo mode is not enabled in this environment');
  }
  return DEMO_CONFIG.ACCOUNT;
};

/**
 * Logs demo mode usage for security auditing
 */
export const logDemoUsage = (action: string, context?: string) => {
  if (isDemoModeEnabled()) {
    console.warn(`[DEMO] ${action}`, { context, timestamp: new Date().toISOString() });
  }
};



