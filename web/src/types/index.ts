// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'student' | 'library_staff' | 'library_admin' | 'super_admin';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

// Library Types
export interface Library {
  id: string;
  tenantId: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  capacity: number;
  amenities: LibraryAmenities;
  pricing: LibraryPricing;
  status: LibraryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LibraryAmenities {
  wifi: boolean;
  ac: boolean;
  parking: boolean;
  cafeteria: boolean;
  printer: boolean;
  studyRooms: boolean;
  quietZone: boolean;
  groupStudyArea: boolean;
  chargingStations: boolean;
  wheelchairAccessible: boolean;
}

export interface LibraryPricing {
  hourlyRate: number;
  dailyRate: number;
  monthlyRate: number;
  currency: string;
  discountRates?: {
    student: number;
    bulk: number;
  };
}

export type LibraryStatus = 'active' | 'inactive' | 'maintenance' | 'closed';

// Booking Types
export interface Booking {
  id: string;
  userId: string;
  seatId: string;
  libraryId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  amount: number;
  createdAt: string;
  updatedAt: string;
  user?: User;
  seat?: Seat;
  library?: Library;
}

export type BookingStatus = 'confirmed' | 'cancelled' | 'completed' | 'no_show' | 'in_progress';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

// Seat Types
export interface Seat {
  id: string;
  libraryId: string;
  seatNumber: string;
  zone: string;
  seatType: SeatType;
  isAvailable: boolean;
  amenities: SeatAmenities;
  createdAt: string;
  updatedAt: string;
}

export type SeatType = 'standard' | 'premium' | 'group' | 'quiet' | 'accessible';
export type SeatAmenities = {
  powerOutlet: boolean;
  desk: boolean;
  chair: boolean;
  lighting: boolean;
  privacy: boolean;
};

// Tenant Types
export interface Tenant {
  id: string;
  name: string;
  domain?: string;
  subscriptionPlan: SubscriptionPlan;
  status: TenantStatus;
  settings: TenantSettings;
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionPlan = 'basic' | 'premium' | 'enterprise';

export interface TenantSettings {
  maxLibraries: number;
  maxUsers: number;
  features: Record<string, boolean>;
  branding: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: UserRole;
}

// Dashboard Types
export interface DashboardStats {
  totalUsers: number;
  totalLibraries: number;
  totalBookings: number;
  totalRevenue: number;
  activeBookings: number;
  todayBookings: number;
  monthlyRevenue: number;
  userGrowth: number;
  bookingGrowth: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'date' | 'time';
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

// Navigation Types
export interface NavItem {
  label: string;
  path: string;
  icon: string;
  roles?: UserRole[];
  children?: NavItem[];
}

// Theme Types
export interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: string;
  surface: string;
  text: string;
}

// Subscription Types (Phase 6)
export interface Subscription {
  id: string;
  tenantId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialStart?: string;
  trialEnd?: string;
  billingInterval: BillingInterval;
  amount: number;
  currency: string;
  paymentMethodId?: string;
  createdAt: string;
  updatedAt: string;
  plan?: Plan;
}

export type SubscriptionStatus = 
  | 'active' 
  | 'trialing' 
  | 'past_due' 
  | 'canceled' 
  | 'unpaid' 
  | 'incomplete' 
  | 'incomplete_expired';

export type BillingInterval = 'monthly' | 'yearly';

export interface Plan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  price: number;
  yearlyPrice?: number;
  currency: string;
  interval: BillingInterval;
  features: PlanFeature[];
  limits: PlanLimits;
  isPopular: boolean;
  isRecommended: boolean;
  tier: PlanTier;
  stripePriceId?: string;
  stripeProductId?: string;
  createdAt: string;
  updatedAt: string;
}

export type PlanTier = 'free' | 'basic' | 'premium' | 'enterprise';

export interface PlanFeature {
  name: string;
  description: string;
  included: boolean;
  value?: string | number;
  icon?: string;
}

export interface PlanLimits {
  maxLibraries: number;
  maxUsers: number;
  maxBookingsPerMonth: number;
  maxStorageGB: number;
  maxAPICallsPerDay: number;
  supportLevel: 'email' | 'priority' | 'dedicated';
  features: string[];
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  tenantId: string;
  invoiceNumber: string;
  amount: number;
  tax: number;
  total: number;
  currency: string;
  status: InvoiceStatus;
  dueDate: string;
  paidAt?: string;
  paymentMethod?: string;
  items: InvoiceItem[];
  pdfUrl?: string;
  hostedUrl?: string;
  stripeInvoiceId?: string;
  createdAt: string;
  updatedAt: string;
}

export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  period?: {
    start: string;
    end: string;
  };
}

export interface PaymentMethod {
  id: string;
  tenantId: string;
  type: PaymentMethodType;
  isDefault: boolean;
  card?: CardDetails;
  bankAccount?: BankAccountDetails;
  stripePaymentMethodId?: string;
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethodType = 'card' | 'bank_account' | 'wallet';

export interface CardDetails {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  holderName: string;
}

export interface BankAccountDetails {
  bankName: string;
  last4: string;
  accountType: 'checking' | 'savings';
  holderName: string;
}

export interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface UsageStats {
  librariesUsed: number;
  librariesLimit: number;
  usersActive: number;
  usersLimit: number;
  bookingsThisMonth: number;
  bookingsLimit: number;
  storageUsedGB: number;
  storageLimitGB: number;
  apiCallsToday: number;
  apiCallsLimit: number;
}

export interface SubscriptionChange {
  fromPlanId: string;
  toPlanId: string;
  effectiveDate: string;
  prorationType: 'immediate' | 'end_of_period';
  amountDue?: number;
  amountCredit?: number;
}

// Tenant Types (Phase 6 - Sprint 2)
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  status: TenantStatus;
  subscriptionPlan: SubscriptionPlan;
  subscriptionId?: string;
  settings: TenantSettings;
  branding: TenantBranding;
  owner: TenantOwner;
  contactInfo: TenantContactInfo;
  businessInfo: TenantBusinessInfo;
  features: TenantFeatures;
  limits: TenantLimits;
  healthScore: number;
  createdAt: string;
  updatedAt: string;
  lastActivityAt?: string;
  suspendedAt?: string;
  suspendedReason?: string;
}

export type TenantStatus = 'active' | 'trial' | 'suspended' | 'inactive' | 'pending_setup';

export interface TenantOwner {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface TenantContactInfo {
  email: string;
  phone: string;
  address: Address;
  website?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface TenantBusinessInfo {
  legalName: string;
  businessType: 'individual' | 'company' | 'partnership' | 'trust' | 'other';
  registrationNumber?: string;
  taxId?: string;
  industry?: string;
  description?: string;
}

export interface TenantBranding {
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  customDomain?: string;
  customCss?: string;
  emailTemplate?: string;
}

export interface TenantSettings {
  timezone: string;
  language: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  currency: string;
  notifications: TenantNotificationSettings;
  security: TenantSecuritySettings;
  api: TenantApiSettings;
  features: Record<string, boolean>;
}

export interface TenantNotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  webhookUrl?: string;
  webhookEvents?: string[];
  emailDigestFrequency?: 'daily' | 'weekly' | 'monthly' | 'never';
}

export interface TenantSecuritySettings {
  mfaEnabled: boolean;
  mfaRequired: boolean;
  sessionTimeout: number;
  ipWhitelist?: string[];
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expiryDays?: number;
  };
}

export interface TenantApiSettings {
  apiKey: string;
  apiSecret: string;
  apiCallsLimit: number;
  apiCallsUsed: number;
  webhookSecret?: string;
  rateLimitPerMinute: number;
}

export interface TenantFeatures {
  multipleLibraries: boolean;
  advancedAnalytics: boolean;
  customBranding: boolean;
  apiAccess: boolean;
  whatsappNotifications: boolean;
  smsNotifications: boolean;
  prioritySupport: boolean;
  customDomain: boolean;
  exportData: boolean;
  webhooks: boolean;
}

export interface TenantLimits {
  maxLibraries: number;
  maxUsers: number;
  maxBookingsPerMonth: number;
  maxStorageGB: number;
  maxAPICallsPerDay: number;
  maxSMSPerMonth: number;
  maxWhatsAppPerMonth: number;
}

export interface TenantAnalytics {
  tenantId: string;
  period: {
    start: string;
    end: string;
  };
  users: {
    total: number;
    active: number;
    new: number;
    growth: number;
  };
  bookings: {
    total: number;
    completed: number;
    cancelled: number;
    revenue: number;
  };
  libraries: {
    total: number;
    active: number;
    averageOccupancy: number;
  };
  credits: {
    smsUsed: number;
    whatsappUsed: number;
    totalCost: number;
  };
  performance: {
    healthScore: number;
    uptime: number;
    responseTime: number;
  };
  trends: {
    userGrowth: TrendData[];
    bookingTrend: TrendData[];
    revenueTrend: TrendData[];
  };
}

export interface TrendData {
  date: string;
  value: number;
  label?: string;
}

export interface OnboardingProgress {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  data: {
    businessInfo?: TenantBusinessInfo;
    contactInfo?: TenantContactInfo;
    planSelection?: {
      planId: string;
      billingInterval: BillingInterval;
    };
    paymentSetup?: {
      paymentMethodId: string;
    };
    branding?: TenantBranding;
  };
  savedAt?: string;
}

export interface TenantOnboardingRequest {
  businessInfo: TenantBusinessInfo;
  contactInfo: TenantContactInfo;
  owner: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  planId: string;
  billingInterval: BillingInterval;
  paymentMethodId?: string;
  branding?: Partial<TenantBranding>;
  acceptedTerms: boolean;
}

export interface TenantListFilters {
  status?: TenantStatus | 'all';
  plan?: SubscriptionPlan | 'all';
  search?: string;
  sortBy?: 'name' | 'createdAt' | 'healthScore' | 'lastActivity';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// ==================== RBAC TYPES ====================

// Role Types
export interface Role {
  id: string;
  name: string;
  description: string;
  type: RoleType;
  permissions: string[];
  isSystem: boolean;
  tenantId?: string;
  usersCount?: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export type RoleType = 'system' | 'custom';

export interface RoleCreateRequest {
  name: string;
  description: string;
  permissions: string[];
  tenantId?: string;
}

export interface RoleUpdateRequest {
  name?: string;
  description?: string;
  permissions?: string[];
}

// Permission Types
export interface Permission {
  id: string;
  resource: string;
  action: PermissionAction;
  scope: PermissionScope;
  description: string;
  category: PermissionCategory;
}

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'manage' | 'execute';
export type PermissionScope = 'own' | 'team' | 'tenant' | 'global';
export type PermissionCategory = 
  | 'user_management' 
  | 'library_management' 
  | 'booking_management' 
  | 'payment_management' 
  | 'analytics' 
  | 'settings'
  | 'rbac'
  | 'tenant_management';

export interface PermissionGroup {
  category: PermissionCategory;
  label: string;
  permissions: Permission[];
}

// Audit Log Types
export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  tenantId: string;
  ipAddress: string;
  userAgent?: string;
  changes?: AuditChanges;
  metadata?: Record<string, any>;
  status: AuditStatus;
  timestamp: string;
}

export type AuditAction = 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'view' 
  | 'login' 
  | 'logout' 
  | 'login_failed'
  | 'permission_granted'
  | 'permission_revoked'
  | 'role_assigned'
  | 'role_removed'
  | 'settings_changed'
  | 'export_data';

export type AuditStatus = 'success' | 'failure' | 'warning';

export interface AuditChanges {
  before?: Record<string, any>;
  after?: Record<string, any>;
}

export interface AuditLogFilters {
  userId?: string;
  action?: AuditAction | 'all';
  resource?: string | 'all';
  status?: AuditStatus | 'all';
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Security Settings Types
export interface SecuritySettings {
  id: string;
  tenantId: string;
  mfaEnabled: boolean;
  mfaEnforced: boolean;
  sessionTimeout: number; // in minutes
  passwordPolicy: PasswordPolicy;
  ipWhitelist: string[];
  ipBlacklist: string[];
  maxLoginAttempts: number;
  lockoutDuration: number; // in minutes
  requireEmailVerification: boolean;
  allowApiAccess: boolean;
  updatedAt: string;
  updatedBy: string;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventReuse: number; // Number of previous passwords to check
  expiryDays: number; // 0 = never expires
}

export interface SecuritySettingsUpdateRequest {
  mfaEnabled?: boolean;
  mfaEnforced?: boolean;
  sessionTimeout?: number;
  passwordPolicy?: Partial<PasswordPolicy>;
  ipWhitelist?: string[];
  ipBlacklist?: string[];
  maxLoginAttempts?: number;
  lockoutDuration?: number;
  requireEmailVerification?: boolean;
  allowApiAccess?: boolean;
}

// Security Audit Summary
export interface SecurityAuditSummary {
  totalUsers: number;
  mfaEnabledUsers: number;
  failedLogins24h: number;
  suspiciousActivities24h: number;
  activeSession: number;
  recentAuditLogs: AuditLog[];
  securityScore: number; // 0-100
  recommendations: string[];
}

// User Role Assignment
export interface UserRoleAssignment {
  userId: string;
  roleIds: string[];
  assignedBy: string;
  assignedAt: string;
}

// RBAC State
export interface RBACState {
  roles: {
    items: Role[];
    loading: boolean;
    error: string | null;
    total: number;
  };
  permissions: {
    items: Permission[];
    groups: PermissionGroup[];
    loading: boolean;
    error: string | null;
  };
  auditLogs: {
    items: AuditLog[];
    loading: boolean;
    error: string | null;
    total: number;
    filters: AuditLogFilters;
  };
  securitySettings: {
    data: SecuritySettings | null;
    loading: boolean;
    error: string | null;
  };
  securityAudit: {
    data: SecurityAuditSummary | null;
    loading: boolean;
    error: string | null;
  };
}

// ==================== CREDIT MANAGEMENT TYPES (Phase 6 - Sprint 4) ====================

// Credit Types
export type CreditType = 'sms' | 'whatsapp';
export type CreditTransactionType = 'purchase' | 'usage' | 'refund' | 'adjustment' | 'auto_topup';
export type CreditTransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded';

// Credit Package
export interface CreditPackage {
  id: string;
  type: CreditType;
  name: string;
  credits: number;
  price: number;
  currency: string;
  discount?: number;
  isPopular?: boolean;
  bonusCredits?: number;
  validityDays?: number;
  description?: string;
  features?: string[];
  createdAt: string;
  updatedAt: string;
}

// Credit Balance
export interface CreditBalance {
  id: string;
  tenantId: string;
  smsCredits: number;
  whatsappCredits: number;
  smsReserved: number;
  whatsappReserved: number;
  smsAvailable: number;
  whatsappAvailable: number;
  lastUpdated: string;
  expiringCredits?: ExpiringCredit[];
}

export interface ExpiringCredit {
  type: CreditType;
  credits: number;
  expiryDate: string;
}

// Credit Transaction
export interface CreditTransaction {
  id: string;
  tenantId: string;
  type: CreditTransactionType;
  creditType: CreditType;
  amount: number;
  credits: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  reference?: string;
  status: CreditTransactionStatus;
  paymentId?: string;
  invoiceId?: string;
  metadata?: Record<string, any>;
  createdBy?: string;
  createdAt: string;
  completedAt?: string;
}

// Auto Top-up Configuration
export interface AutoTopupConfig {
  id: string;
  tenantId: string;
  creditType: CreditType;
  enabled: boolean;
  threshold: number;
  rechargeAmount: number;
  packageId?: string;
  maxAutoRecharges?: number;
  notifyOnTopup: boolean;
  notificationEmail?: string;
  lastTriggeredAt?: string;
  triggeredCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AutoTopupCreateRequest {
  creditType: CreditType;
  enabled: boolean;
  threshold: number;
  rechargeAmount: number;
  packageId?: string;
  maxAutoRecharges?: number;
  notifyOnTopup?: boolean;
  notificationEmail?: string;
}

export interface AutoTopupUpdateRequest {
  enabled?: boolean;
  threshold?: number;
  rechargeAmount?: number;
  packageId?: string;
  maxAutoRecharges?: number;
  notifyOnTopup?: boolean;
  notificationEmail?: string;
}

// Credit Purchase Request
export interface CreditPurchaseRequest {
  packageId: string;
  quantity?: number;
  paymentMethodId: string;
  useWalletBalance?: boolean;
}

export interface CreditPurchaseResponse {
  transactionId: string;
  credits: number;
  amount: number;
  newBalance: number;
  paymentStatus: string;
  invoiceId?: string;
}

// Credit Usage Stats
export interface CreditUsageStats {
  tenantId: string;
  period: {
    start: string;
    end: string;
  };
  sms: {
    used: number;
    cost: number;
    count: number;
    avgCostPerSMS: number;
  };
  whatsapp: {
    used: number;
    cost: number;
    count: number;
    avgCostPerMessage: number;
  };
  total: {
    credits: number;
    cost: number;
    transactions: number;
  };
  trend: UsageTrendData[];
  byPurpose?: UsageByPurpose[];
}

export interface UsageTrendData {
  date: string;
  smsUsed: number;
  whatsappUsed: number;
  totalCost: number;
}

export interface UsageByPurpose {
  purpose: string;
  smsCount: number;
  whatsappCount: number;
  totalCredits: number;
  percentage: number;
}

// Credit Analytics
export interface CreditAnalytics {
  tenantId: string;
  period: string;
  balance: CreditBalance;
  usage: CreditUsageStats;
  purchases: {
    total: number;
    amount: number;
    count: number;
    avgPurchaseSize: number;
  };
  projections: {
    smsRunoutDate?: string;
    whatsappRunoutDate?: string;
    recommendedTopup?: number;
  };
  efficiency: {
    costPerConversion?: number;
    utilizationRate: number;
    wasteRate: number;
  };
}

// Credit Alerts
export interface CreditAlert {
  id: string;
  tenantId: string;
  type: 'low_balance' | 'expiring' | 'auto_topup_triggered' | 'auto_topup_failed';
  creditType?: CreditType;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

// Credit Report
export interface CreditReport {
  tenantId: string;
  reportType: 'daily' | 'weekly' | 'monthly' | 'custom';
  period: {
    start: string;
    end: string;
  };
  summary: {
    totalPurchased: number;
    totalUsed: number;
    totalCost: number;
    balanceStart: number;
    balanceEnd: number;
  };
  breakdown: {
    sms: CreditBreakdown;
    whatsapp: CreditBreakdown;
  };
  topUsageCategories: UsageByPurpose[];
  costAnalysis: {
    averageDailyCost: number;
    peakUsageDay: string;
    peakUsageAmount: number;
  };
  recommendations: string[];
  generatedAt: string;
}

export interface CreditBreakdown {
  purchased: number;
  used: number;
  refunded: number;
  expired: number;
  balance: number;
  cost: number;
}

// Credit Filters
export interface CreditTransactionFilters {
  type?: CreditTransactionType | 'all';
  creditType?: CreditType | 'all';
  status?: CreditTransactionStatus | 'all';
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'amount' | 'credits';
  sortOrder?: 'asc' | 'desc';
}

// Credit State
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
    sms: AutoTopupConfig | null;
    whatsapp: AutoTopupConfig | null;
    loading: boolean;
    error: string | null;
  };
  usage: {
    stats: CreditUsageStats | null;
    loading: boolean;
    error: string | null;
  };
  analytics: {
    data: CreditAnalytics | null;
    loading: boolean;
    error: string | null;
  };
  alerts: {
    items: CreditAlert[];
    unreadCount: number;
    loading: boolean;
    error: string | null;
  };
}

