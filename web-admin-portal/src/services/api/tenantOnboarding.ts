/**
 * Tenant Onboarding API Service
 * Handles all tenant onboarding-related API calls
 * Currently uses mock data for development
 */

import {
  OnboardingData,
  TenantSettings,
  BrandingSettings,
  OnboardingDashboardData,
  BusinessInfo,
  ContactInfo,
  PlanSelection,
  BillingInfo,
  CustomizationPreferences,
} from '../../modules/tenants/types/onboarding';
import { ApiResponse } from '../../types';

// Mock Mode Toggle
const MOCK_MODE = true;

// Mock Onboarding Data
const MOCK_ONBOARDING_DATA: OnboardingData[] = [
  // Completed (5)
  ...Array.from({ length: 5 }, (_, i) => ({
    id: `onboard-complete-${i + 1}`,
    tenantId: `tenant-${i + 1}`,
    tenantName: `${['Central', 'Royal', 'Elite', 'Prime', 'Smart'][i]} Library`,
    status: 'completed' as const,
    currentStep: 5,
    totalSteps: 5,
    completedSteps: [1, 2, 3, 4, 5],
    startedAt: new Date(2024, 10, i + 1).toISOString(),
    completedAt: new Date(2024, 10, i + 5).toISOString(),
    lastUpdated: new Date(2024, 10, i + 5).toISOString(),
    data: {
      step1: {
        libraryName: `${['Central', 'Royal', 'Elite', 'Prime', 'Smart'][i]} Library`,
        businessType: 'library' as const,
        registrationNumber: `REG${1000 + i}`,
        address: `${i + 1}23, Main Street`,
        city: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'][i],
        state: ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal'][i],
        pincode: `40000${i}`,
        country: 'India',
      },
      step2: {
        ownerName: `Owner ${i + 1}`,
        ownerEmail: `owner${i + 1}@example.com`,
        ownerPhone: `+91 98765${43210 + i}`,
        adminName: `Admin ${i + 1}`,
        adminEmail: `admin${i + 1}@example.com`,
        adminPhone: `+91 98765${43220 + i}`,
      },
      step3: {
        selectedPlan: (['starter', 'professional', 'enterprise', 'professional', 'starter'][i]) as any,
        billingCycle: (['monthly', 'quarterly', 'annual', 'monthly', 'quarterly'][i]) as any,
        addons: ['sms_package', 'whatsapp_package'],
        estimatedStudents: [150, 500, 1000, 300, 200][i],
        features: ['attendance', 'fee_management', 'messaging'],
      },
      step4: {
        billingName: `${['Central', 'Royal', 'Elite', 'Prime', 'Smart'][i]} Library`,
        billingEmail: `billing${i + 1}@example.com`,
        billingAddress: `${i + 1}23, Main Street`,
        gstNumber: `29ABCDE${1234 + i}Z1Z5`,
        panNumber: `ABCDE${1234 + i}Z`,
        paymentMethod: (['credit_card', 'upi', 'net_banking'][i % 3]) as any,
        agreementAccepted: true,
      },
      step5: {
        primaryColor: ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#0288d1'][i],
        enableWhiteLabel: i % 2 === 0,
        emailNotifications: true,
        smsNotifications: true,
      },
    },
  })),
  // In Progress (3)
  ...Array.from({ length: 3 }, (_, i) => ({
    id: `onboard-progress-${i + 1}`,
    tenantId: `tenant-progress-${i + 1}`,
    tenantName: `New Library ${i + 1}`,
    status: 'in_progress' as const,
    currentStep: [2, 3, 4][i],
    totalSteps: 5,
    completedSteps: [[1], [1, 2], [1, 2, 3]][i],
    startedAt: new Date(2024, 11, i + 1).toISOString(),
    lastUpdated: new Date(2024, 11, i + 2).toISOString(),
    data: {
      step1: {
        libraryName: `New Library ${i + 1}`,
        businessType: 'study_center' as const,
        address: `${i + 1}45, Park Road`,
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411001',
        country: 'India',
      },
      step2: i >= 1 ? {
        ownerName: `New Owner ${i + 1}`,
        ownerEmail: `newowner${i + 1}@example.com`,
        ownerPhone: `+91 87654${32100 + i}`,
        adminName: `New Admin ${i + 1}`,
        adminEmail: `newadmin${i + 1}@example.com`,
        adminPhone: `+91 87654${32110 + i}`,
      } : undefined,
      step3: i >= 2 ? {
        selectedPlan: 'starter' as const,
        billingCycle: 'monthly' as const,
        addons: [],
        estimatedStudents: 100,
        features: ['attendance'],
      } : undefined,
    },
  })),
  // Not Started (2)
  ...Array.from({ length: 2 }, (_, i) => ({
    id: `onboard-notstarted-${i + 1}`,
    tenantId: `tenant-notstarted-${i + 1}`,
    tenantName: `Pending Library ${i + 1}`,
    status: 'not_started' as const,
    currentStep: 0,
    totalSteps: 5,
    completedSteps: [],
    startedAt: new Date(2024, 11, 10 + i).toISOString(),
    lastUpdated: new Date(2024, 11, 10 + i).toISOString(),
    data: {},
  })),
];

// Mock Tenant Settings
const MOCK_TENANT_SETTINGS: TenantSettings = {
  tenantId: 'tenant-1',
  tenantName: 'Central Library',
  general: {
    timezone: 'Asia/Kolkata',
    language: 'en',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    currency: 'INR',
    currencyPosition: 'before',
  },
  operational: {
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    openingTime: '09:00',
    closingTime: '21:00',
    holidays: ['2024-01-26', '2024-08-15', '2024-10-02'],
    autoCloseBooking: true,
    bookingAdvanceDays: 7,
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: true,
    whatsappNotifications: true,
    pushNotifications: true,
    reminderHours: 2,
    lowBalanceAlert: true,
    lowBalanceThreshold: 100,
  },
  features: {
    attendance: true,
    feeManagement: true,
    messaging: true,
    analytics: true,
    mobileApp: true,
    qrCodeEntry: true,
    faceRecognition: false,
    parentApp: true,
  },
  limits: {
    maxStudents: 200,
    maxStaff: 5,
    storageGB: 5,
    apiCallsPerDay: 1000,
    smsPerMonth: 500,
    whatsappPerMonth: 200,
    emailPerMonth: 1000,
  },
  api: {
    enabled: true,
    apiKey: 'sk_live_abc123xyz789',
    webhookUrl: 'https://example.com/webhook',
    webhookEvents: ['student.created', 'attendance.marked', 'payment.received'],
    rateLimitPerMinute: 60,
  },
  security: {
    twoFactorAuth: true,
    ipWhitelist: ['192.168.1.1', '10.0.0.1'],
    sessionTimeout: 30,
    passwordPolicy: 'strict',
  },
};

// Mock Branding Settings
const MOCK_BRANDING_SETTINGS: BrandingSettings = {
  tenantId: 'tenant-1',
  tenantName: 'Central Library',
  logo: {
    url: 'https://via.placeholder.com/200x80/1976d2/ffffff?text=Logo',
    uploadedAt: new Date(2024, 10, 1).toISOString(),
  },
  colors: {
    primary: '#1976d2',
    secondary: '#dc004e',
    accent: '#ff9800',
    background: '#ffffff',
    text: '#000000',
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
  },
  customDomain: 'centrallibrary.studyspot.com',
  domainVerified: true,
  emailTemplate: {
    headerColor: '#1976d2',
    footerText: 'Central Library - Your Partner in Education',
    logoUrl: 'https://via.placeholder.com/200x80/1976d2/ffffff?text=Logo',
    companyName: 'Central Library',
    address: '123, Main Street, Mumbai, Maharashtra, 400001',
    socialLinks: {
      facebook: 'https://facebook.com/centrallibrary',
      twitter: 'https://twitter.com/centrallibrary',
      instagram: 'https://instagram.com/centrallibrary',
    },
  },
  smsTemplate: {
    senderName: 'CNTLIB',
    signature: '- Central Library',
    templateFormat: '[CNTLIB] {message} - Central Library',
  },
  whiteLabel: {
    enabled: true,
    customName: 'Central Library Portal',
    hidePoweredBy: true,
    customFooter: '© 2024 Central Library. All rights reserved.',
  },
  theme: {
    mode: 'light',
    fontFamily: 'Roboto, sans-serif',
    borderRadius: 4,
  },
};

/**
 * Tenant Onboarding Service
 */
class TenantOnboardingService {
  /**
   * Get dashboard data
   */
  async getDashboardData(): Promise<ApiResponse<OnboardingDashboardData>> {
    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const stats = {
        total: MOCK_ONBOARDING_DATA.length,
        notStarted: MOCK_ONBOARDING_DATA.filter((d) => d.status === 'not_started').length,
        inProgress: MOCK_ONBOARDING_DATA.filter((d) => d.status === 'in_progress').length,
        completed: MOCK_ONBOARDING_DATA.filter((d) => d.status === 'completed').length,
        incomplete: MOCK_ONBOARDING_DATA.filter((d) => d.status === 'incomplete').length,
        averageCompletionTime: 4.5,
        completionRate: 50,
        dropOffByStep: {
          step1: 2,
          step2: 1,
          step3: 2,
          step4: 1,
          step5: 1,
        },
      };

      return {
        success: true,
        data: {
          stats,
          recentOnboardings: MOCK_ONBOARDING_DATA.slice(0, 5),
          pendingApprovals: MOCK_ONBOARDING_DATA.filter((d) => d.status === 'in_progress'),
        },
      };
    }

    throw new Error('Real API not implemented yet');
  }

  /**
   * Get onboarding data for a tenant
   */
  async getOnboardingData(tenantId: string): Promise<ApiResponse<OnboardingData>> {
    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const data = MOCK_ONBOARDING_DATA.find((d) => d.tenantId === tenantId);
      return {
        success: true,
        data: data || MOCK_ONBOARDING_DATA[0],
      };
    }
    throw new Error('Real API not implemented yet');
  }

  /**
   * Save onboarding step data
   */
  async saveOnboardingStep(
    tenantId: string,
    step: number,
    data: any
  ): Promise<ApiResponse<OnboardingData>> {
    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        success: true,
        data: MOCK_ONBOARDING_DATA[0],
      };
    }
    throw new Error('Real API not implemented yet');
  }

  /**
   * Get tenant settings
   */
  async getTenantSettings(tenantId: string): Promise<ApiResponse<TenantSettings>> {
    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        success: true,
        data: MOCK_TENANT_SETTINGS,
      };
    }
    throw new Error('Real API not implemented yet');
  }

  /**
   * Update tenant settings
   */
  async updateTenantSettings(
    tenantId: string,
    settings: Partial<TenantSettings>
  ): Promise<ApiResponse<TenantSettings>> {
    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        success: true,
        data: { ...MOCK_TENANT_SETTINGS, ...settings },
      };
    }
    throw new Error('Real API not implemented yet');
  }

  /**
   * Get branding settings
   */
  async getBrandingSettings(tenantId: string): Promise<ApiResponse<BrandingSettings>> {
    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        success: true,
        data: MOCK_BRANDING_SETTINGS,
      };
    }
    throw new Error('Real API not implemented yet');
  }

  /**
   * Update branding settings
   */
  async updateBrandingSettings(
    tenantId: string,
    settings: Partial<BrandingSettings>
  ): Promise<ApiResponse<BrandingSettings>> {
    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        success: true,
        data: { ...MOCK_BRANDING_SETTINGS, ...settings },
      };
    }
    throw new Error('Real API not implemented yet');
  }

  /**
   * Upload logo
   */
  async uploadLogo(tenantId: string, file: File): Promise<ApiResponse<{ url: string }>> {
    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        success: true,
        data: {
          url: 'https://via.placeholder.com/200x80/1976d2/ffffff?text=NewLogo',
        },
      };
    }
    throw new Error('Real API not implemented yet');
  }
}

export const tenantOnboardingService = new TenantOnboardingService();














