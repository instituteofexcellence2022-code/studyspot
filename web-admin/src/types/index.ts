// Core Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
  isActive: boolean;
  permissions?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  contactInfo?: {
    email: string;
    phone: string;
  };
  subscriptionPlan?: {
    id: string;
    name: string;
  };
  status: 'active' | 'inactive' | 'suspended';
  branding?: TenantBranding;
  settings?: TenantSettings;
}

export interface Library {
  id: string;
  name: string;
  address: string;
  capacity: number;
  isActive: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Seat {
  id: string;
  number: string;
  isAvailable: boolean;
  libraryId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  seatId: string;
  libraryId: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
    total: number;
    page?: number;
    limit?: number;
    totalPages: number;
}

// Search Parameters
export interface UserSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
}

export interface TenantSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface LibrarySearchParams {
  page?: number;
  limit?: number;
  search?: string;
  tenantId?: string;
  isActive?: boolean;
}

export interface BookingSearchParams {
  page?: number;
  limit?: number;
  userId?: string;
  libraryId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

// Registration
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}

// Subscription Types
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: BillingCycle;
  features: PlanFeature[];
  limits: {
    users: number;
    libraries: number;
    bookings: number;
  };
  isActive: boolean;
  price_monthly?: number;
  price_yearly?: number;
  display_name: string;
}

export interface Subscription {
  id: string;
  tenantId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'past_due' | 'unpaid';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

// Note: Invoice interface is defined later with extended fields; keep a single definition

export type BillingCycle = 'monthly' | 'yearly';

export interface CreateSubscriptionRequest {
  planId: string;
  billingCycle: BillingCycle;
  paymentMethodId: string;
}

export interface UpgradeSubscriptionRequest {
  planId: string;
  billingCycle: BillingCycle;
}

export interface DowngradeSubscriptionRequest {
  planId: string;
  billingCycle: BillingCycle;
  effectiveDate: string;
}

export interface CancelSubscriptionRequest {
  reason: string;
  feedback?: string;
}

// Credit System
export interface CreditState {
  balance: {
    data: CreditBalance | null;
    loading: boolean;
    error: string | null;
  };
  packages: {
    items: CreditPackage[];
    loading: boolean;
    error: string | null;
  };
  transactions: {
    items: CreditTransaction[];
    loading: boolean;
    error: string | null;
    total: number;
    filters: CreditTransactionFilters;
  };
  autoTopup: {
    sms: any | null;
    whatsapp: any | null;
    loading: boolean;
    error: string | null;
  };
  usage: {
    data: any | null;
    loading: boolean;
    error: string | null;
  };
  analytics: {
    data: any | null;
    loading: boolean;
    error: string | null;
  };
  alerts: {
    items: CreditAlert[];
    loading: boolean;
    error: string | null;
    unreadCount: number;
  };
  reports: {
    data: any | null;
    loading: boolean;
    error: string | null;
  };
}

export interface CreditBalance {
  total: number;
  smsCredits: number;
  smsReserved: number;
  smsAvailable: number;
  whatsappCredits: number;
  whatsappReserved: number;
  whatsappAvailable: number;
  lastUpdated: string;
}


export interface CreditTransaction {
  id: string;
  type: 'purchase' | 'usage' | 'refund' | 'bonus';
  amount: number;
  description: string;
  balanceAfter: number;
  createdAt: string;
}

export interface CreditPurchaseRequest {
  packageId: string;
  paymentMethodId: string;
  quantity?: number;
}

export interface CreditPurchaseResponse {
  transactionId: string;
  credits: number;
  balance: number;
  receiptUrl: string;
}

export interface AutoTopupConfig {
  id: string;
  type: 'sms' | 'whatsapp';
  threshold: number;
  amount: number;
  isEnabled: boolean;
  paymentMethodId: string;
}

export interface AutoTopupCreateRequest {
  type: 'sms' | 'whatsapp';
  threshold: number;
  amount: number;
  paymentMethodId: string;
}

export interface AutoTopupUpdateRequest {
  threshold?: number;
  amount?: number;
  isEnabled?: boolean;
  paymentMethodId?: string;
}

export interface CreditUsageStats {
  totalUsed: number;
  byType: {
    sms: number;
    whatsapp: number;
    email: number;
  };
  period: {
    start: string;
    end: string;
  };
}

export interface CreditAnalytics {
  usage: CreditUsageStats;
  trends: {
    date: string;
    used: number;
    purchased: number;
  }[];
  predictions: {
    nextMonth: number;
    confidence: number;
  };
}

export interface CreditAlert {
  id: string;
  type: 'low_balance' | 'high_usage' | 'unusual_activity';
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface CreditReport {
  period: {
    start: string;
    end: string;
  };
  summary: {
    startingBalance: number;
    endingBalance: number;
    totalPurchased: number;
    totalUsed: number;
    netChange: number;
  };
  transactions: CreditTransaction[];
  usage: CreditUsageStats;
}

export interface CreditTransactionFilters {
  type?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  [key: string]: unknown;
}

// RBAC Types
export interface RBACState {
  roles: Role[];
  permissions: Permission[];
  auditLogs: AuditLog[];
  auditLogFilters?: AuditLogFilters;
  securitySettings: SecuritySettings;
  isLoading: boolean;
  error: string | null;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoleCreateRequest {
  name: string;
  description: string;
  permissionIds: string[];
}

export interface RoleUpdateRequest {
  name?: string;
  description?: string;
  permissionIds?: string[];
  isActive?: boolean;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  group: PermissionGroup;
  isActive: boolean;
}

export interface PermissionGroup {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'VIEW' | 'EXPORT' | 'IMPORT' | 'APPROVE' | 'REJECT';

export interface AuditLog {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  action: AuditAction;
  resource: string;
  resourceId: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  resource?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface SecuritySettings {
  id: string;
  tenantId: string;
  passwordPolicy: {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
    requireSymbols: boolean;
    maxAge: number;
  };
  sessionPolicy: {
    timeout: number;
    maxConcurrent: number;
    requireReauth: boolean;
  };
  mfaPolicy: {
    enabled: boolean;
    required: boolean;
    methods: string[];
  };
  ipWhitelist: string[];
  isActive: boolean;
  updatedAt: string;
}

export interface SecuritySettingsUpdateRequest {
  passwordPolicy?: Partial<SecuritySettings['passwordPolicy']>;
  sessionPolicy?: Partial<SecuritySettings['sessionPolicy']>;
  mfaPolicy?: Partial<SecuritySettings['mfaPolicy']>;
  ipWhitelist?: string[];
}

export interface SecurityAuditSummary {
  totalLogs: number;
  criticalIssues: number;
  securityScore: number;
  lastAudit: string;
  recommendations: string[];
}

// Tenant Management
export interface TenantAnalytics {
  id: string;
  tenantId: string;
  period: string;
  users: {
    total: number;
    active: number;
    new: number;
    growth: number;
  };
  bookings: {
    total: number;
    completed: number;
    revenue: number;
  };
  trends: {
    userGrowth: number;
    bookingGrowth: number;
    revenueTrend: Array<{ date: string; value: number }>;
  };
  performance: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    healthScore: number;
  };
  createdAt: string;
};

export interface TenantOnboardingRequest {
  name: string;
  domain: string;
  businessInfo: {
    industry: string;
    size: string;
    description: string;
    legalName: string;
    businessType: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
      line1: string;
    };
  };
  branding: {
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
    customDomain: string;
  };
  settings: {
    timezone: string;
    language: string;
  };
  acceptedTerms: boolean;
}

export interface TenantSettings {
  id: string;
  tenantId: string;
  timezone: string;
  language: string;
  dateFormat: string;
  timeFormat: string;
  currency: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  features: {
    analytics: boolean;
    reporting: boolean;
    apiAccess: boolean;
  };
  security?: {
    passwordPolicy?: any;
    sessionPolicy?: any;
    mfaPolicy?: any;
  };
  updatedAt: string;
}

export interface TenantBranding {
  id: string;
  tenantId: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  customCss?: string;
  favicon?: string;
  customDomain?: string;
  emailTemplate?: string;
  updatedAt: string;
}

export interface TenantListFilters {
  search?: string;
  isActive?: boolean;
  planId?: string;
  createdAfter?: string;
  createdBefore?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  status?: string;
  plan?: string;
  sortBy?: string;
}

export interface OnboardingProgress {
  id: string;
  tenantId: string;
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  data: {
    businessInfo?: any;
    branding?: any;
    settings?: any;
  };
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  savedAt: string;
}

// User Roles
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  LIBRARY_OWNER: 'library_owner',
  BRANCH_MANAGER: 'branch_manager',
  LIBRARIAN: 'librarian',
  USER: 'user',
  FRONT_DESK_STAFF: 'front_desk_staff',
  FACILITY_MANAGER: 'facility_manager',
  FINANCE_MANAGER: 'finance_manager',
  ANALYTICS_MANAGER: 'analytics_manager',
  STUDENT: 'student'
} as const;

// Additional missing types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface UserRoleAssignment {
  userId: string;
  roleId: string;
  assignedAt: string;
  assignedBy: string;
}

// ReportHandler type for web vitals
export type ReportHandler = (metric: any) => void;

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      REFRESH: '/api/auth/refresh',
      LOGOUT: '/api/auth/logout',
      PROFILE: '/api/auth/profile'
    },
    USERS: {
      LIST: '/api/users',
      CREATE: '/api/users',
      UPDATE: '/api/users/:id',
      DELETE: '/api/users/:id',
      BY_ID: '/api/users/:id'
    },
    LIBRARIES: {
      LIST: '/api/libraries',
      CREATE: '/api/libraries',
      UPDATE: '/api/libraries/:id',
      DELETE: '/api/libraries/:id',
      BY_ID: '/api/libraries/:id',
      SEARCH: '/api/libraries/search'
    },
    BOOKINGS: {
      LIST: '/api/bookings',
      CREATE: '/api/bookings',
      UPDATE: '/api/bookings/:id',
      DELETE: '/api/bookings/:id',
      BY_ID: '/api/bookings/:id',
      BY_USER: '/api/bookings/user/:userId',
      BY_LIBRARY: '/api/bookings/library/:libraryId'
    },
    SEATS: {
      LIST: '/api/seats',
      CREATE: '/api/seats',
      UPDATE: '/api/seats/:id',
      DELETE: '/api/seats/:id',
      BY_LIBRARY: '/api/seats/library/:libraryId'
    },
    DASHBOARD: {
      STATS: '/api/dashboard/stats',
      ANALYTICS: '/api/dashboard/analytics'
    },
    SUBSCRIPTIONS: {
      LIST: '/api/subscriptions',
      CREATE: '/api/subscriptions',
      UPDATE: '/api/subscriptions/:id',
      CANCEL: '/api/subscriptions/:id/cancel',
      BY_ID: '/api/subscriptions/:id',
      CURRENT: '/api/subscriptions/current',
      CHANGE_PLAN: '/api/subscriptions/:id/change-plan'
    },
    PLANS: {
      LIST: '/api/plans',
      BY_ID: '/api/plans/:id'
    },
    INVOICES: {
      LIST: '/api/invoices',
      BY_ID: '/api/invoices/:id',
      DOWNLOAD: '/api/invoices/:id/pdf',
      PAY: '/api/invoices/:id/pay'
    },
    PAYMENT_METHODS: {
      LIST: '/api/payment-methods',
      CREATE: '/api/payment-methods',
      UPDATE: '/api/payment-methods/:id',
      DELETE: '/api/payment-methods/:id',
      SET_DEFAULT: '/api/payment-methods/:id/set-default'
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
      TEST_WEBHOOK: '/api/tenants/:id/test-webhook'
    }
  }
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  LANGUAGE: 'language',
};

// Extended TenantListFilters
export interface ExtendedTenantListFilters extends TenantListFilters {
  status?: string;
  plan?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Extended TenantOnboardingRequest
export interface ExtendedTenantOnboardingRequest extends TenantOnboardingRequest {
  acceptedTerms: boolean;
}

// Additional missing types for subscription pages
export type BillingInterval = BillingCycle;

export interface PlanFeature {
  name: string;
  value?: string | number;
  included: boolean;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: BillingInterval;
  features: PlanFeature[];
  isPopular: boolean;
  displayName: string;
  yearlyPrice?: number;
  tier: 'basic' | 'standard' | 'premium' | 'enterprise' | 'free';
  isRecommended: boolean;
  limits?: Record<string, number>;
  price_monthly?: number;
  price_yearly?: number;
  createdAt?: string;
  created_at?: string;
};

// Toast utility types
export interface ToastOptions {
  position?: string;
  autoClose?: number;
  hideProgressBar?: boolean;
  closeOnClick?: boolean;
  pauseOnHover?: boolean;
  draggable?: boolean;
}

export const showSuccess = (message: string, options?: ToastOptions) => {
  // Implementation will be in toast utility
};

export const showError = (message: string, options?: ToastOptions) => {
  // Implementation will be in toast utility
};

export const showInfo = (message: string, options?: ToastOptions) => {
  // Implementation will be in toast utility
};

export const showWarning = (message: string, options?: ToastOptions) => {
  // Implementation will be in toast utility
};

// Missing functions and types
export const setFilters = (filters: any) => {
  // Implementation will be in store
};

export const suspendTenant = (tenantId: string) => {
  // Implementation will be in store
};

export const reactivateTenant = (tenantId: string) => {
  // Implementation will be in store
};

export type TenantStatus = 'active' | 'inactive' | 'suspended';

// Missing credit functions
export const fetchAutoTopupConfigs = () => {
  // Implementation will be in store
};

export const updateAutoTopupConfig = (id: string, data: any) => {
  // Implementation will be in store
};

export const createAutoTopupConfig = (data: any) => {
  // Implementation will be in store
};

export const testAutoTopupConfig = (id: string) => {
  // Implementation will be in store
};

export const deleteAutoTopupConfig = (id: string) => {
  // Implementation will be in store
};

export const fetchCreditBalance = () => {
  // Implementation will be in store
};

export const fetchCreditUsageStats = () => {
  // Implementation will be in store
};

export const fetchCreditAlerts = () => {
  // Implementation will be in store
};

export const markAlertAsRead = (alertId: string) => {
  // Implementation will be in store
};

// Missing subscription functions
export const fetchInvoices = (tenantId: string, limit?: number) => {
  // Implementation will be in store
};

export const fetchPlans = () => {
  // Implementation will be in store
};

export const fetchSubscription = (tenantId: string) => {
  // Implementation will be in store
};

export const createSubscription = (data: any) => {
  // Implementation will be in store
};

export const upgradeSubscription = (subscriptionId: string, newPlanId: string) => {
  // Implementation will be in store
};

export const downgradeSubscription = (subscriptionId: string, newPlanId: string) => {
  // Implementation will be in store
};

export const cancelSubscription = (subscriptionId: string, immediate?: boolean) => {
  // Implementation will be in store
};

export const createPortalSession = (tenantId: string) => {
  // Implementation will be in store
};

// Missing tenant functions
export const fetchTenant = (tenantId: string) => {
  // Implementation will be in store
};

export const fetchTenantAnalytics = (tenantId: string, params?: any) => {
  // Implementation will be in store
};

export const createTenant = (data: any) => {
  // Implementation will be in store
};

export const updateTenant = (tenantId: string, data: any) => {
  // Implementation will be in store
};

// Missing utility functions
export const reportWebVitals = (onPerfEntry?: any) => {
  // Implementation will be in utils
};

export const checkAccessibility = (element: any) => {
  // Implementation will be in utils
};

// Credit types
export type CreditType = 'sms' | 'whatsapp' | 'email' | 'push';

export interface CreditPackage {
  id: string;
  name: string;
  description: string;
  credits: number;
  price: number;
  currency: string;
  discount?: number;
  bonusCredits?: number;
  validityDays?: number;
  type: CreditType;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
}

// Payment and Invoice types
export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'paypal';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  createdAt: string;
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
    holderName: string;
  };
  bankAccount?: {
    bankName: string;
    last4: string;
    accountType: string;
  };
}

export interface Invoice {
  id: string;
  number: string;
  status: InvoiceStatus;
  amount: number;
  currency: string;
  dueDate: string;
  paidAt?: string;
  createdAt: string;
  downloadUrl?: string;
  items: InvoiceItem[];
  invoice_pdf?: string;
  hosted_invoice_url?: string;
}

export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';

export interface InvoiceItem {
  id: string;
  description: string;
  amount: number;
  quantity: number;
  unitPrice: number;
}