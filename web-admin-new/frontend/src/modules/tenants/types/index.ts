/**
 * Tenant Module Types
 */

export interface TenantSettings {
  general: {
    timezone: string;
    language: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
    currency: string;
  };
  operational: {
    openingTime: string;
    closingTime: string;
    weekendHours: boolean;
    holidayMode: boolean;
    workingDays: string[];
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    whatsappNotifications: boolean;
    pushNotifications: boolean;
    reminderHours: number;
    lowBalanceAlert: boolean;
    lowBalanceThreshold: number;
  };
  features: {
    attendance: boolean;
    feeManagement: boolean;
    messaging: boolean;
    analytics: boolean;
    mobileApp: boolean;
    qrCodeEntry: boolean;
    faceRecognition: boolean;
    parentApp: boolean;
  };
  limits: {
    maxStudents: number;
    maxSeats: number;
    maxStaff: number;
    storageLimit: number;
  };
  api: {
    apiEnabled: boolean;
    webhooksEnabled: boolean;
    rateLimitPerHour: number;
  };
  security: {
    twoFactorAuth: boolean;
    ipWhitelist: string[];
    sessionTimeout: number;
    passwordPolicy: 'standard' | 'strict';
  };
}

export interface BrandingSettings {
  logo: {
    url: string;
    uploadedAt: string;
  } | null;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  customDomain: string;
  domainVerified: boolean;
  whiteLabel: {
    enabled: boolean;
    customName: string;
    hidePoweredBy: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
  customCss?: string;
}

export interface OnboardingData {
  businessInfo: {
    libraryName: string;
    ownerName: string;
    contactNumber: string;
    businessEmail: string;
    gstNumber?: string;
  };
  addressInfo: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  plan: {
    selectedPlan: string;
    billingCycle: 'monthly' | 'annual';
    startDate: string;
  };
  billingInfo: {
    billingName: string;
    billingEmail: string;
    billingAddress: string;
    paymentMethod: 'card' | 'upi' | 'netbanking';
  };
  customization: {
    primaryColor: string;
    secondaryColor: string;
    logo?: string;
    features: string[];
  };
}

