/**
 * StudySpot Mobile App - TypeScript Type Definitions
 * Centralized type definitions for the entire application
 */

// =============================================================================
// AUTHENTICATION TYPES
// =============================================================================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  kycStatus: KYCStatus;
  profileImage?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  loginType: 'email' | 'google' | 'facebook' | 'linkedin';
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  tenantId?: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// =============================================================================
// LIBRARY TYPES
// =============================================================================

export interface Library {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  location: {
    latitude: number;
    longitude: number;
  };
  capacity: number;
  amenities: string[];
  pricing: LibraryPricing;
  operatingHours: OperatingHours;
  images: string[];
  contactInfo: ContactInfo;
  rating: number;
  reviewCount: number;
  distance?: number; // in km
  seatStats?: {
    total: number;
    available: number;
  };
  isOpen?: boolean;
  currentOccupancy?: number;
  createdAt: string;
  updatedAt: string;
}

export interface LibraryPricing {
  hourly: number;
  daily: number;
  monthly: number;
}

export interface OperatingHours {
  [key: string]: {
    open: string;
    close: string;
    isOpen: boolean;
  };
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

export interface Seat {
  id: string;
  seatNumber: string;
  zone: SeatZone;
  seatType: SeatType;
  amenities: string[];
  location: SeatLocation;
  isAvailable: boolean;
}

export interface SeatLocation {
  floor: number;
  section: string;
  coordinates: {
    x: number;
    y: number;
  };
}

export interface LibraryFilters {
  search?: string;
  city?: string;
  amenities?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  distance?: number;
  isOpen?: boolean;
}

// =============================================================================
// BOOKING TYPES
// =============================================================================

export interface Booking {
  id: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  bookingType: BookingType;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  checkInTime?: string;
  checkOutTime?: string;
  qrCode: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  library: {
    id: string;
    name: string;
    address: string;
    contactInfo?: ContactInfo;
  };
  seat: {
    id: string;
    number: string;
    zone: SeatZone;
    type?: SeatType;
  };
}

export interface BookingRequest {
  libraryId: string;
  seatId: string;
  date: string;
  startTime: string;
  endTime: string;
  bookingType: BookingType;
  paymentMethod: PaymentMethod;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  availableSeats: number;
  price: number;
}

export interface SeatAvailability {
  library: {
    id: string;
    name: string;
  };
  date: string;
  timeSlot: {
    startTime: string;
    endTime: string;
  };
  availableSeats: Seat[];
  totalAvailable: number;
  pricing: LibraryPricing;
}

// =============================================================================
// PAYMENT TYPES
// =============================================================================

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentGateway: PaymentGateway;
  status: PaymentStatus;
  gatewayPaymentId?: string;
  gatewayOrderId?: string;
  gatewayResponse?: any;
  refundAmount?: number;
  refundReason?: string;
  createdAt: string;
  updatedAt: string;
  booking: {
    id: string;
    date: string;
    timeSlot: {
      startTime: string;
      endTime: string;
    };
    library: {
      name: string;
      address?: string;
    };
  };
}

export interface PaymentIntent {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  booking: {
    id: string;
    libraryName: string;
  };
  razorpayConfig: RazorpayConfig;
}

export interface RazorpayConfig {
  key: string;
  orderId: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill: {
    email: string;
  };
}

export interface RefundRequest {
  paymentId: string;
  amount?: number;
  reason: string;
}

// =============================================================================
// NOTIFICATION TYPES
// =============================================================================

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPreferences {
  email: {
    bookingUpdates: boolean;
    paymentAlerts: boolean;
    promotional: boolean;
  };
  push: {
    bookingUpdates: boolean;
    paymentAlerts: boolean;
    promotional: boolean;
  };
  sms: {
    bookingUpdates: boolean;
    paymentAlerts: boolean;
    promotional: boolean;
  };
}

// =============================================================================
// APP STATE TYPES
// =============================================================================

export interface AppState {
  isLoading: boolean;
  error: string | null;
  networkStatus: NetworkStatus;
  isOffline: boolean;
  lastSyncTime?: string;
  theme: Theme;
  language: string;
  onboardingCompleted: boolean;
}

export interface NetworkStatus {
  isConnected: boolean;
  type: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
  isInternetReachable: boolean;
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    pagination?: PaginationMeta;
    timestamp: string;
  };
  errors?: ApiError[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: string;
}

// =============================================================================
// NAVIGATION TYPES
// =============================================================================

export interface RootStackParamList {
  Auth: undefined;
  Main: undefined;
  LibraryDetails: { libraryId: string };
  BookingConfirmation: { bookingId: string };
  Payment: { bookingId: string; amount: number };
  Profile: undefined;
  Settings: undefined;
  Help: undefined;
  About: undefined;
  QRCode: { type: 'checkin' | 'checkout' | 'library' | 'seat'; libraryId: string; seatId?: string; bookingId?: string };
  Recommendations: undefined;
  Gamification: undefined;
  Chatbot: undefined;
}

export interface AuthStackParamList {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  VerifyOTP: { email: string; type: 'register' | 'reset' };
  Onboarding: undefined;
}

export interface MainTabParamList {
  Home: undefined;
  Search: undefined;
  Bookings: undefined;
  ProfileTab: undefined;
}

// =============================================================================
// ENUM TYPES
// =============================================================================

export type UserRole = 'student' | 'librarian' | 'admin' | 'super_admin';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';
export type KYCStatus = 'pending' | 'verified' | 'rejected';

export type SeatZone = 'quiet' | 'group' | 'general' | 'premium';
export type SeatType = 'desk' | 'chair' | 'couch' | 'standing';

export type BookingType = 'hourly' | 'daily' | 'monthly';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';

export type PaymentMethod = 'online' | 'offline' | 'wallet' | 'subscription';
export type PaymentGateway = 'razorpay' | 'stripe' | 'paytm' | 'upi';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';

export type NotificationType = 'booking' | 'payment' | 'system' | 'promotional';

export type Theme = 'light' | 'dark' | 'auto';

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type LoadingState = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface AsyncState<T> {
  data: T | null;
  loading: LoadingState;
  error: string | null;
}

export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface PaginatedResponse<T> extends ApiResponse<PaginatedData<T>> {}

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  country?: string;
}

export interface ImageData {
  uri: string;
  type: string;
  name: string;
  size: number;
}

export interface DocumentData {
  id: string;
  type: DocumentType;
  fileName: string;
  fileSize: number;
  fileType: string;
  url: string;
  status: DocumentStatus;
  uploadedAt: string;
}

export type DocumentType = 'aadhaar' | 'pan' | 'passport' | 'driving_license' | 'college_id';
export type DocumentStatus = 'pending' | 'verified' | 'rejected';

// =============================================================================
// FORM TYPES
// =============================================================================

export interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  agreeToTerms: boolean;
}

export interface ForgotPasswordForm {
  email: string;
}

export interface ResetPasswordForm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileForm {
  firstName: string;
  lastName: string;
  phone: string;
  profileImage?: ImageData;
}

export interface SearchForm {
  query: string;
  location?: LocationData;
  filters: LibraryFilters;
}

export interface BookingForm {
  libraryId: string;
  seatId: string;
  date: string;
  startTime: string;
  endTime: string;
  bookingType: BookingType;
  paymentMethod: PaymentMethod;
}

// =============================================================================
// ANALYTICS TYPES
// =============================================================================

export interface AnalyticsEvent {
  name: string;
  properties: Record<string, any>;
  timestamp: string;
}

export interface UserAnalytics {
  totalBookings: number;
  totalHours: number;
  favoriteLibrary: {
    id: string;
    name: string;
    bookings: number;
  };
  monthlyStats: MonthlyStats[];
  studyPatterns: {
    preferredTime: string;
    preferredDays: string[];
    averageSession: number;
  };
}

export interface MonthlyStats {
  month: string;
  bookings: number;
  hours: number;
  amount: number;
}

// =============================================================================
// PHASE 6: SUBSCRIPTION MANAGEMENT TYPES (SaaS Features)
// =============================================================================

/**
 * Subscription Plan
 * Represents available subscription tiers with features and limits
 */
export interface Plan {
  id: string;
  name: 'free' | 'starter' | 'pro' | 'enterprise';
  display_name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  limits: PlanLimits;
  is_active: boolean;
}

/**
 * Plan Limits
 * Resource limits for each subscription tier
 */
export interface PlanLimits {
  max_libraries: number;
  max_users: number;
  max_bookings_per_month: number;
  max_seats: number;
  sms_credits: number;
  ai_features: boolean;
  analytics: boolean;
  api_access: boolean;
}

/**
 * Current Subscription
 * User's active subscription with usage tracking
 */
export interface Subscription {
  id: string;
  tenant_id: string;
  plan_id: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled';
  billing_cycle: 'monthly' | 'yearly';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  cancelled_at?: string;
  trial_start?: string;
  trial_end?: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  // Joined data from plan
  plan_name: string;
  plan_display_name: string;
  features: string[];
  limits: PlanLimits;
  usage: SubscriptionUsage;
  created_at: string;
  updated_at: string;
}

/**
 * Subscription Usage
 * Current usage vs plan limits
 */
export interface SubscriptionUsage {
  libraries: number;
  users: number;
  bookings: number;
  sms_sent: number;
}

/**
 * Invoice
 * Billing invoice for subscription payments
 */
export interface Invoice {
  id: string;
  subscription_id: string;
  tenant_id: string;
  stripe_invoice_id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'open' | 'void' | 'uncollectible';
  invoice_pdf: string;
  hosted_invoice_url: string;
  payment_intent?: string;
  period_start: string;
  period_end: string;
  paid_at?: string;
  created_at: string;
}

// =============================================================================
// PHASE 6: CREDIT MANAGEMENT TYPES
// =============================================================================

/**
 * Credit Balance
 * SMS and WhatsApp credit balances
 */
export interface CreditBalance {
  sms: number;
  whatsapp: number;
  last_updated: string;
}

/**
 * Usage Record
 * Individual credit usage transaction
 */
export interface UsageRecord {
  id: string;
  tenant_id: string;
  type: 'sms' | 'whatsapp';
  amount: number;
  cost: number;
  description: string;
  recipient?: string;
  status: 'sent' | 'failed' | 'pending';
  created_at: string;
}

/**
 * Credit Package
 * Purchasable credit packages
 */
export interface CreditPackage {
  id: string;
  type: 'sms' | 'whatsapp';
  credits: number;
  price: number;
  discount_percent: number;
  is_popular: boolean;
  display_name: string;
  description: string;
}

/**
 * Auto Top-Up Configuration
 * Automatic credit purchase settings
 */
export interface AutoTopUpConfig {
  id?: string;
  enabled: boolean;
  threshold: number;
  package_id: string;
  tenant_id: string;
  last_triggered_at?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Purchase Request
 * Credit purchase request data
 */
export interface PurchaseRequest {
  tenant_id: string;
  type: 'sms' | 'whatsapp';
  package_id: string;
  payment_method_id?: string;
}

/**
 * Purchase Result
 * Result of credit purchase
 */
export interface PurchaseResult {
  transaction_id: string;
  credits_added: number;
  new_balance: number;
  amount_paid: number;
  payment_status: 'succeeded' | 'pending' | 'failed';
  payment_url?: string;
}

// =============================================================================
// PHASE 6: OWNER DASHBOARD TYPES
// =============================================================================

/**
 * Dashboard Stats
 * Quick overview stats for library owners
 */
export interface DashboardStats {
  today: {
    bookings: number;
    revenue: number;
    occupancy: number;
    new_users: number;
  };
  thisMonth: {
    bookings: number;
    revenue: number;
    new_users: number;
    growth_percent: number;
  };
  recentActivity: ActivityRecord[];
  alerts: Alert[];
}

/**
 * Activity Record
 * Recent activity item
 */
export interface ActivityRecord {
  id: string;
  type: 'booking' | 'payment' | 'user' | 'review' | 'system';
  title: string;
  description: string;
  timestamp: string;
  icon?: string;
  severity?: 'info' | 'warning' | 'error' | 'success';
}

/**
 * Alert
 * System or business alert
 */
export interface Alert {
  id: string;
  type: 'limit' | 'payment' | 'subscription' | 'credits' | 'system';
  severity: 'info' | 'warning' | 'error';
  title: string;
  message: string;
  action_text?: string;
  action_url?: string;
  created_at: string;
  is_read: boolean;
}

/**
 * Analytics Data
 * Comprehensive business analytics
 */
export interface AnalyticsData {
  period: {
    start: string;
    end: string;
  };
  revenue: {
    daily: DataPoint[];
    weekly: DataPoint[];
    monthly: DataPoint[];
    total: number;
    growth_percent: number;
  };
  bookings: {
    total: number;
    completed: number;
    cancelled: number;
    no_show: number;
    trend: DataPoint[];
  };
  occupancy: {
    average: number;
    peak_hours: PeakHour[];
    heatmap: HeatmapData[][];
    by_zone: ZoneOccupancy[];
  };
  users: {
    total: number;
    active: number;
    new: number;
    returning: number;
    demographics: Demographic[];
  };
}

/**
 * Data Point
 * Generic chart data point
 */
export interface DataPoint {
  date: string;
  value: number;
  label?: string;
}

/**
 * Peak Hour
 * High occupancy time slot
 */
export interface PeakHour {
  hour: number;
  day_of_week: string;
  occupancy_percent: number;
  avg_bookings: number;
}

/**
 * Heatmap Data
 * Occupancy heatmap cell
 */
export interface HeatmapData {
  hour: number;
  day: number;
  value: number;
  label: string;
}

/**
 * Zone Occupancy
 * Occupancy by library zone
 */
export interface ZoneOccupancy {
  zone_id: string;
  zone_name: string;
  occupancy_percent: number;
  total_seats: number;
  occupied_seats: number;
}

/**
 * Demographic
 * User demographic data
 */
export interface Demographic {
  category: string;
  value: string;
  count: number;
  percent: number;
}

// =============================================================================
// REDUX STATE TYPES (Phase 6)
// =============================================================================

/**
 * Subscription Redux State
 */
export interface SubscriptionState {
  currentSubscription: Subscription | null;
  plans: Plan[];
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  lastFetched: number;
}

/**
 * Credits Redux State
 */
export interface CreditsState {
  balance: CreditBalance | null;
  usage: UsageRecord[];
  packages: CreditPackage[];
  autoTopUp: AutoTopUpConfig | null;
  loading: boolean;
  error: string | null;
  lastFetched: number;
}

/**
 * Owner Dashboard Redux State
 */
export interface OwnerState {
  dashboard: DashboardStats | null;
  analytics: AnalyticsData | null;
  loading: boolean;
  error: string | null;
  lastFetched: number;
}
