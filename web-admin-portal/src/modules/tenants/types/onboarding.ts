/**
 * ============================================
 * TENANT ONBOARDING TYPES - ENHANCED VERSION
 * Comprehensive onboarding flow for library management SaaS
 * ============================================
 */

// ============================================
// ONBOARDING FLOW TYPES
// ============================================

export type OnboardingStep = 
  | 'business_info'
  | 'address_info'
  | 'plan_selection'
  | 'billing_info'
  | 'bank_details'
  | 'customization'
  | 'features_config'
  | 'admin_setup'
  | 'verification'
  | 'review';

export type OnboardingStatus = 
  | 'not_started'
  | 'in_progress'
  | 'pending_verification'
  | 'pending_payment'
  | 'completed'
  | 'rejected'
  | 'abandoned';

export interface OnboardingProgress {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  status: OnboardingStatus;
  progressPercentage: number;
  startedAt: string;
  lastUpdatedAt: string;
  completedAt?: string;
  estimatedCompletionTime: number; // in minutes
}

// ============================================
// BUSINESS INFORMATION
// ============================================

export interface BusinessInfo {
  libraryName: string;
  ownerName: string;
  contactNumber: string;
  alternateNumber?: string;
  businessEmail: string;
  alternateEmail?: string;
  gstNumber?: string;
  panNumber?: string;
  businessType: 'proprietorship' | 'partnership' | 'pvt_ltd' | 'public_ltd' | 'llp' | 'trust' | 'other';
  establishedYear: number;
  website?: string;
  description?: string;
  licenseNumber?: string;
  registrationNumber?: string;
  taxRegistered: boolean;
  industryCategory: 'education' | 'library' | 'coaching' | 'study_center' | 'co_working' | 'other';
}

// ============================================
// ADDRESS INFORMATION
// ============================================

export interface AddressInfo {
  address: string;
  landmark?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  isServiceAddressSame: boolean;
  serviceAddress?: {
    address: string;
    landmark?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

// ============================================
// PLAN SELECTION
// ============================================

export type PlanTier = 'starter' | 'professional' | 'enterprise' | 'custom';
export type BillingCycle = 'monthly' | 'quarterly' | 'semi_annual' | 'annual';
export type PaymentFrequency = 'monthly' | 'quarterly' | 'annually';

export interface PlanFeatures {
  maxStudents: number;
  maxSeats: number;
  maxStaff: number;
  storageGB: number;
  apiAccess: boolean;
  whiteLabel: boolean;
  customDomain: boolean;
  prioritySupport: boolean;
  dedicatedManager: boolean;
  smsCredits: number;
  whatsappCredits: number;
  emailCredits: number;
  advancedAnalytics: boolean;
  customReports: boolean;
  mobileApp: boolean;
  parentApp: boolean;
  faceRecognition: boolean;
  qrCodeEntry: boolean;
  biometricAttendance: boolean;
  onlinePayments: boolean;
  multiLocation: boolean;
  maxLocations: number;
}

export interface PlanPricing {
  basePrice: number;
  setupFee: number;
  discountPercentage: number;
  discountedPrice: number;
  gstAmount: number;
  totalAmount: number;
  perStudentCharge?: number;
  additionalSeatCharge?: number;
  currency: 'INR' | 'USD' | 'EUR' | 'GBP';
}

export interface PlanSelection {
  selectedPlan: PlanTier;
  planName: string;
  billingCycle: BillingCycle;
  paymentFrequency: PaymentFrequency;
  startDate: string;
  contractDuration: number; // in months
  autoRenewal: boolean;
  features: PlanFeatures;
  pricing: PlanPricing;
  trialPeriod?: {
    enabled: boolean;
    durationDays: number;
    requiresCard: boolean;
  };
  addons: PlanAddon[];
}

export interface PlanAddon {
  id: string;
  name: string;
  description: string;
  price: number;
  billingType: 'one_time' | 'recurring';
  selected: boolean;
}

// ============================================
// BILLING INFORMATION
// ============================================

export type PaymentMethod = 'card' | 'upi' | 'netbanking' | 'bank_transfer' | 'cheque' | 'wallet';

export interface BillingInfo {
  billingName: string;
  billingEmail: string;
  billingPhone: string;
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingZipCode: string;
  billingCountry: string;
  gstNumber?: string;
  panNumber?: string;
  paymentMethod: PaymentMethod;
  isSameAsBusinessAddress: boolean;
  invoicePreference: 'email' | 'postal' | 'both';
  invoiceFrequency: 'monthly' | 'quarterly' | 'annually';
  autoPayEnabled: boolean;
  primaryPaymentMethod?: PaymentMethod;
  backupPaymentMethod?: PaymentMethod;
}

// ============================================
// BANK DETAILS (For Settlements)
// ============================================

export interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  accountType: 'savings' | 'current' | 'overdraft';
  bankName: string;
  branchName: string;
  ifscCode: string;
  swiftCode?: string;
  upiId?: string;
  verificationStatus: 'pending' | 'verified' | 'failed';
  verificationMethod: 'penny_drop' | 'manual' | 'document';
  cancelledCheque?: {
    url: string;
    uploadedAt: string;
  };
  bankStatement?: {
    url: string;
    uploadedAt: string;
  };
}

// ============================================
// CUSTOMIZATION & BRANDING
// ============================================

export interface CustomizationPreferences {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logo?: {
    url: string;
    fileName: string;
    fileSize: number;
    uploadedAt: string;
  };
  favicon?: {
    url: string;
    fileName: string;
    uploadedAt: string;
  };
  coverImage?: {
    url: string;
    fileName: string;
    uploadedAt: string;
  };
  theme: 'light' | 'dark' | 'auto';
  fontFamily: string;
  customCss?: string;
  customDomain?: string;
  domainVerificationStatus?: 'pending' | 'verified' | 'failed';
  whiteLabel: boolean;
  hidePoweredBy: boolean;
  customEmailDomain?: string;
}

// ============================================
// FEATURES CONFIGURATION
// ============================================

export interface FeaturesConfig {
  // Core Features
  attendance: {
    enabled: boolean;
    methods: ('manual' | 'qr_code' | 'biometric' | 'face_recognition')[];
    autoMarkAbsent: boolean;
    graceTimeMins: number;
    allowSelfCheckIn: boolean;
  };
  feeManagement: {
    enabled: boolean;
    onlinePayments: boolean;
    installmentSupport: boolean;
    lateFeeEnabled: boolean;
    lateFeePercentage: number;
    dueDateReminders: boolean;
    paymentGateways: ('razorpay' | 'stripe' | 'paytm' | 'phonepe')[];
  };
  messaging: {
    enabled: boolean;
    channels: ('sms' | 'whatsapp' | 'email' | 'push' | 'in_app')[];
    bulkMessaging: boolean;
    templateManagement: boolean;
    scheduledMessaging: boolean;
    autoReminders: boolean;
  };
  analytics: {
    enabled: boolean;
    realtimeDashboard: boolean;
    customReports: boolean;
    exportEnabled: boolean;
    dataRetentionDays: number;
    predictiveAnalytics: boolean;
  };
  mobileApp: {
    enabled: boolean;
    studentApp: boolean;
    parentApp: boolean;
    staffApp: boolean;
    customBranding: boolean;
    pushNotifications: boolean;
  };
  library: {
    bookManagement: boolean;
    issueReturn: boolean;
    reservations: boolean;
    fineManagement: boolean;
    catalogManagement: boolean;
  };
  crm: {
    enabled: boolean;
    leadManagement: boolean;
    followUpReminders: boolean;
    conversionTracking: boolean;
    campaignManagement: boolean;
  };
  reports: {
    enabled: boolean;
    standardReports: string[];
    customReports: boolean;
    scheduledReports: boolean;
    reportSharing: boolean;
  };
  integrations: {
    enabled: boolean;
    apiAccess: boolean;
    webhooks: boolean;
    thirdPartyApps: string[];
    ssoEnabled: boolean;
  };
}

// ============================================
// ADMIN SETUP
// ============================================

export interface AdminSetup {
  primaryAdmin: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    role: 'super_admin' | 'admin' | 'manager';
    department?: string;
    designation?: string;
  };
  additionalAdmins: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: 'admin' | 'manager' | 'staff' | 'accountant';
    permissions: string[];
  }[];
  securitySettings: {
    twoFactorAuth: boolean;
    passwordPolicy: 'standard' | 'strict' | 'custom';
    sessionTimeout: number; // in minutes
    ipWhitelist: string[];
    allowRemoteAccess: boolean;
  };
}

// ============================================
// VERIFICATION & DOCUMENTS
// ============================================

export type DocumentType = 
  | 'pan_card'
  | 'gst_certificate'
  | 'business_license'
  | 'registration_certificate'
  | 'address_proof'
  | 'cancelled_cheque'
  | 'owner_id_proof'
  | 'incorporation_certificate'
  | 'tax_certificate';

export type VerificationStatus = 'pending' | 'in_review' | 'verified' | 'rejected' | 'expired';

export interface DocumentUpload {
  type: DocumentType;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
  verificationStatus: VerificationStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  expiryDate?: string;
  documentNumber?: string;
}

export interface VerificationInfo {
  kycStatus: VerificationStatus;
  kycVerifiedAt?: string;
  businessVerificationStatus: VerificationStatus;
  businessVerifiedAt?: string;
  bankVerificationStatus: VerificationStatus;
  bankVerifiedAt?: string;
  documents: DocumentUpload[];
  remarks?: string;
  verifiedBy?: {
    userId: string;
    userName: string;
    verifiedAt: string;
  };
}

// ============================================
// COMPLETE ONBOARDING DATA
// ============================================

export interface OnboardingData {
  tenantId?: string;
  progress: OnboardingProgress;
  businessInfo?: BusinessInfo;
  addressInfo?: AddressInfo;
  planSelection?: PlanSelection;
  billingInfo?: BillingInfo;
  bankDetails?: BankDetails;
  customization?: CustomizationPreferences;
  featuresConfig?: FeaturesConfig;
  adminSetup?: AdminSetup;
  verification?: VerificationInfo;
  // Agreements & Consents
  agreements: {
    termsAccepted: boolean;
    termsAcceptedAt?: string;
    privacyPolicyAccepted: boolean;
    privacyPolicyAcceptedAt?: string;
    dataProcessingConsent: boolean;
    marketingConsent: boolean;
    slaAccepted: boolean;
    slaAcceptedAt?: string;
    ipAddress?: string;
    userAgent?: string;
  };
  // Additional Metadata
  metadata: {
    source: 'website' | 'referral' | 'sales_team' | 'partner' | 'other';
    referralCode?: string;
    salesRepId?: string;
    partnerCode?: string;
    utmParams?: {
      source?: string;
      medium?: string;
      campaign?: string;
      term?: string;
      content?: string;
    };
    notes?: string;
  };
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  lastModifiedBy?: string;
}

// ============================================
// TENANT SETTINGS (Post Onboarding)
// ============================================

export interface TenantSettings {
  general: {
    timezone: string;
    language: string;
    currency: 'INR' | 'USD' | 'EUR' | 'GBP';
    dateFormat: string;
    timeFormat: '12h' | '24h';
    weekStartDay: 'sunday' | 'monday';
    fiscalYearStart: string; // MM-DD format
  };
  operational: {
    openingTime: string;
    closingTime: string;
    workingDays: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];
    weekendHours: boolean;
    holidayMode: boolean;
    seasonalHours?: {
      startDate: string;
      endDate: string;
      openingTime: string;
      closingTime: string;
    }[];
    maxBookingDays: number;
    slotDuration: number; // in minutes
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    whatsappNotifications: boolean;
    pushNotifications: boolean;
    inAppNotifications: boolean;
    reminderHours: number;
    lowBalanceAlert: boolean;
    lowBalanceThreshold: number;
    dailyDigest: boolean;
    weeklyReport: boolean;
    monthlyReport: boolean;
    notificationChannels: {
      transactional: ('email' | 'sms' | 'whatsapp' | 'push')[];
      marketing: ('email' | 'sms' | 'whatsapp' | 'push')[];
      alerts: ('email' | 'sms' | 'whatsapp' | 'push')[];
    };
  };
  features: FeaturesConfig;
  limits: {
    maxStudents: number;
    maxSeats: number;
    maxStaff: number;
    maxLocations: number;
    storageLimit: number; // in GB
    apiCallsPerHour: number;
    smsCreditsPerMonth: number;
    whatsappCreditsPerMonth: number;
    emailCreditsPerMonth: number;
  };
  api: {
    apiEnabled: boolean;
    webhooksEnabled: boolean;
    rateLimitPerHour: number;
    allowedIPs: string[];
    apiVersion: string;
    documentationAccess: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    enforceStrongPassword: boolean;
    ipWhitelist: string[];
    sessionTimeout: number; // in minutes
    passwordPolicy: 'standard' | 'strict' | 'custom';
    maxLoginAttempts: number;
    lockoutDuration: number; // in minutes
    sslRequired: boolean;
    dataEncryption: boolean;
    auditLogging: boolean;
    gdprCompliant: boolean;
  };
  billing: {
    autoPayEnabled: boolean;
    invoiceGeneration: 'automatic' | 'manual';
    paymentReminders: boolean;
    gracePeriodDays: number;
    lateFeeEnabled: boolean;
    lateFeePercentage: number;
    creditLimitEnabled: boolean;
    creditLimit?: number;
  };
}

// ============================================
// BRANDING SETTINGS (Post Onboarding)
// ============================================

export interface BrandingSettings {
  logo: {
    url: string;
    fileName: string;
    uploadedAt: string;
  } | null;
  favicon: {
    url: string;
    uploadedAt: string;
  } | null;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  typography: {
    fontFamily: string;
    headingFont: string;
    bodyFont: string;
  };
  customDomain: string;
  domainVerified: boolean;
  sslEnabled: boolean;
  whiteLabel: boolean;
  theme: 'light' | 'dark' | 'auto';
  customCss?: string;
  customJs?: string;
  emailTemplate: {
    headerColor: string;
    footerColor: string;
    logo: string;
    signature: string;
  };
  smsTemplate: {
    senderId: string;
    signature: string;
  };
}

// ============================================
// ONBOARDING STATISTICS
// ============================================

export interface OnboardingStats {
  totalOnboarded: number;
  pendingOnboarding: number;
  inProgressOnboarding: number;
  rejectedOnboarding: number;
  abandonedOnboarding: number;
  completionRate: number; // percentage
  avgCompletionTime: number; // in minutes
  avgTimePerStep: {
    [key in OnboardingStep]?: number;
  };
  dropOffRates: {
    [key in OnboardingStep]?: number;
  };
  conversionRate: number; // percentage
  monthlyTrend: {
    month: string;
    completed: number;
    abandoned: number;
    conversionRate: number;
  }[];
  planDistribution: {
    planName: string;
    count: number;
    percentage: number;
  }[];
  sourceDistribution: {
    source: string;
    count: number;
    percentage: number;
  }[];
}

// ============================================
// ONBOARDING VALIDATION
// ============================================

export interface ValidationRule {
  field: string;
  rule: 'required' | 'email' | 'phone' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

export interface StepValidation {
  step: OnboardingStep;
  rules: ValidationRule[];
  isValid: boolean;
  errors: {
    field: string;
    message: string;
  }[];
}

// ============================================
// ONBOARDING ACTIONS
// ============================================

export interface OnboardingAction {
  type: 'start' | 'update' | 'complete_step' | 'skip_step' | 'verify' | 'approve' | 'reject' | 'abandon';
  step?: OnboardingStep;
  data?: any;
  performedBy: string;
  performedAt: string;
  notes?: string;
}

export interface OnboardingAuditLog {
  tenantId: string;
  actions: OnboardingAction[];
}
