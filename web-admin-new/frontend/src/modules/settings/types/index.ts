/**
 * Settings & Configuration Module Types
 */

export interface GeneralSettings {
  companyName: string;
  companyLogo?: string;
  contactEmail: string;
  supportEmail: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  language: string;
  defaultPageSize: number;
}

export interface SecuritySettings {
  enable2FA: boolean;
  sessionTimeout: number; // minutes
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
  ipWhitelist: string[];
  allowedOrigins: string[];
  apiRateLimiting: {
    enabled: boolean;
    requestsPerMinute: number;
  };
  maxFailedLoginAttempts: number;
  lockoutDuration: number; // minutes
}

export interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
  useTLS: boolean;
  templates: EmailTemplate[];
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'welcome' | 'reset_password' | 'invoice' | 'payment' | 'subscription' | 'custom';
  variables: string[];
}

export interface IntegrationSettings {
  razorpay: {
    enabled: boolean;
    keyId: string;
    keySecret: string;
    webhookSecret: string;
  };
  stripe: {
    enabled: boolean;
    publishableKey: string;
    secretKey: string;
    webhookSecret: string;
  };
  twilio: {
    enabled: boolean;
    accountSid: string;
    authToken: string;
    phoneNumber: string;
  };
  aws: {
    enabled: boolean;
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    s3Bucket: string;
  };
}

export interface NotificationSettings {
  email: {
    enabled: boolean;
    events: string[];
  };
  sms: {
    enabled: boolean;
    events: string[];
  };
  whatsapp: {
    enabled: boolean;
    events: string[];
  };
  inApp: {
    enabled: boolean;
    events: string[];
  };
}

export interface AdvancedSettings {
  maintenanceMode: boolean;
  debugMode: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  cacheDuration: number; // minutes
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  dataRetention: number; // days
}

