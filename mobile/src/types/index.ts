/**
 * StudySpot Mobile App - Enhanced Types
 * Complete TypeScript type definitions
 */

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Profile: undefined;
  Settings: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  VerifyOTP: { email: string };
};

export type MainStackParamList = {
  Home: undefined;
  Search: undefined;
  Bookings: undefined;
  LibraryDetails: { id: string };
  BookingConfirmation: { id: string };
  Payment: { bookingId: string };
  Chatbot: undefined;
};

export type TabParamList = {
  HomeTab: undefined;
  SearchTab: undefined;
  BookingsTab: undefined;
  ProfileTab: undefined;
};

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  preferences: UserPreferences;
  subscription: Subscription;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  notifications: boolean;
  emailUpdates: boolean;
  preferredLibrary?: string;
  seatPreference?: 'Study Desk' | 'Quiet Zone' | 'Group Study';
  language: string;
}

export interface Subscription {
  type: 'free' | 'premium' | 'enterprise';
  status: 'active' | 'expired' | 'cancelled';
  expiryDate?: string;
  features: string[];
}

// Library Types
export interface Library {
  id: string;
  name: string;
  description: string;
  location: Location;
  images: string[];
  amenities: Amenity[];
  operatingHours: OperatingHours;
  rating: number;
  reviewCount: number;
  pricing: Pricing;
  availability: Availability;
  contact: Contact;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface Amenity {
  id: string;
  name: string;
  icon: string;
  description: string;
  available: boolean;
}

export interface OperatingHours {
  monday: TimeSlot;
  tuesday: TimeSlot;
  wednesday: TimeSlot;
  thursday: TimeSlot;
  friday: TimeSlot;
  saturday: TimeSlot;
  sunday: TimeSlot;
}

export interface TimeSlot {
  open: string;
  close: string;
  isOpen: boolean;
}

export interface Pricing {
  hourly: number;
  daily: number;
  weekly: number;
  monthly: number;
  currency: string;
}

export interface Availability {
  totalSeats: number;
  availableSeats: number;
  lastUpdated: string;
}

export interface Contact {
  phone: string;
  email: string;
  website?: string;
}

// Booking Types
export interface Booking {
  id: string;
  userId: string;
  libraryId: string;
  library: Library;
  seatType: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: BookingStatus;
  payment: Payment;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'cancelled' 
  | 'completed' 
  | 'expired';

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  createdAt: string;
}

export type PaymentMethod = 'card' | 'upi' | 'netbanking' | 'wallet';
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';

// Form Types
export interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
  loginType?: 'email' | 'social';
  /**
   * Tenant ID - REQUIRED for students (they are in tenant database)
   * Should be obtained from:
   * - URL slug/domain (e.g., library-slug.studyspot.com)
   * - Configuration/environment variable
   * - Local storage (if previously stored)
   * - User input (if multiple tenants)
   */
  tenantId?: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
}

export interface ForgotPasswordForm {
  email: string;
}

export interface VerifyOTPForm {
  otp: string;
}

export interface BookingForm {
  libraryId: string;
  date: string;
  time: string;
  duration: number;
  seatType: string;
  specialRequests?: string;
}

export interface PaymentForm {
  method: PaymentMethod;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  upiId?: string;
  bankAccount?: string;
}

// API Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// Service Types
export interface ServiceMetrics {
  totalRequests: number;
  activeConnections: number;
  responseTime: number;
  errorRate: number;
  lastUpdated: string;
}

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: any;
  read: boolean;
  createdAt: string;
}

export type NotificationType = 
  | 'booking_confirmation'
  | 'booking_reminder'
  | 'payment_success'
  | 'library_update'
  | 'promotion'
  | 'general';

// Deep Linking Types
export interface DeepLinkParams {
  screen: string;
  params?: Record<string, any>;
}

export interface DeepLinkConfig {
  scheme: string;
  host: string;
  paths: string[];
}

// Performance Types
export interface PerformanceMetrics {
  appLaunchTime: number;
  screenLoadTime: number;
  apiResponseTime: number;
  memoryUsage: number;
  batteryLevel: number;
  networkType: string;
  deviceInfo: DeviceInfo;
}

export interface DeviceInfo {
  model: string;
  os: string;
  version: string;
  memory: number;
}

export interface UserInteraction {
  screen: string;
  action: string;
  timestamp: number;
  duration?: number;
  success: boolean;
}

// Animation Types
export interface LottieAnimationProps {
  source: any;
  autoPlay?: boolean;
  loop?: boolean;
  speed?: number;
  style?: any;
  onAnimationFinish?: () => void;
}

// Error Types
export interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
}

export interface AppError {
  code: string;
  message: string;
  stack?: string;
  timestamp: string;
  userId?: string;
  screen?: string;
}

// State Types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LibraryState {
  libraries: Library[];
  selectedLibrary: Library | null;
  isLoading: boolean;
  error: string | null;
  filters: LibraryFilters;
}

export interface BookingState {
  bookings: Booking[];
  currentBooking: Booking | null;
  isLoading: boolean;
  error: string | null;
}

export interface LibraryFilters {
  location?: string;
  amenities?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  availability?: boolean;
}

// Component Props Types
export interface LoadingScreenProps {
  message?: string;
  showAnimation?: boolean;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export interface OfflineIndicatorProps {
  isVisible: boolean;
  onRetry?: () => void;
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Required<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

// Generic Types
export type ID = string;
export type Timestamp = string;
export type Currency = 'INR' | 'USD' | 'EUR';
export type Language = 'en' | 'hi' | 'ta' | 'te' | 'bn' | 'gu' | 'kn' | 'ml' | 'mr' | 'pa' | 'or';

export default {
  // Export all types for easy importing
  RootStackParamList,
  AuthStackParamList,
  MainStackParamList,
  TabParamList,
  User,
  Library,
  Booking,
  LoginForm,
  RegisterForm,
  ApiResponse,
  ServiceMetrics,
  PerformanceMetrics,
  DeepLinkParams,
  LottieAnimationProps,
  ErrorBoundaryProps,
};