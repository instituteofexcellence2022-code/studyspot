// ============================================
// BOOKING MANAGEMENT - TYPE DEFINITIONS
// Platform-wide booking oversight and analytics
// ============================================

export type BookingStatus = 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show' | 'completed';
export type BookingType = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'package';
export type PaymentStatus = 'paid' | 'pending' | 'partial' | 'refunded' | 'failed';

// ============================================
// CORE BOOKING INTERFACE
// ============================================

export interface Booking {
  id: string;
  bookingId: string; // Unique booking code
  
  // Student Information
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  
  // Library Information
  libraryId: string;
  libraryName: string;
  libraryCity: string;
  tenantId: string;
  tenantName: string;
  
  // Booking Details
  seatNumber: string;
  zone: string;
  zoneType: 'silent' | 'discussion' | 'premium' | 'general';
  
  // Time Details
  bookingDate: string;
  bookingType: BookingType;
  timeSlot: {
    start: string;
    end: string;
  };
  duration: number; // in hours
  
  // Status
  status: BookingStatus;
  currentStatus: 'upcoming' | 'ongoing' | 'past';
  
  // Attendance
  checkInTime?: string;
  checkOutTime?: string;
  actualDuration?: number;
  checkInMethod?: 'qr_code' | 'face_recognition' | 'biometric' | 'manual';
  checkOutMethod?: 'qr_code' | 'face_recognition' | 'biometric' | 'manual';
  
  // Payment
  amount: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: 'upi' | 'card' | 'netbanking' | 'cash' | 'wallet';
  paymentId?: string;
  transactionFee: number;
  platformFee: number;
  netAmount: number; // Amount after platform fee
  
  // Cancellation
  cancelledAt?: string;
  cancellationReason?: string;
  cancelledBy?: string;
  refundAmount?: number;
  refundStatus?: 'pending' | 'processed' | 'failed';
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  bookedVia: 'mobile_app' | 'web' | 'admin' | 'api';
  deviceInfo?: string;
  ipAddress?: string;
  notes?: string;
}

// ============================================
// BOOKING ANALYTICS
// ============================================

export interface BookingAnalytics {
  summary: {
    totalBookings: number;
    todayBookings: number;
    ongoingBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    noShowBookings: number;
    cancellationRate: number;
    noShowRate: number;
    completionRate: number;
    averageDuration: number;
    totalRevenue: number;
    averageBookingValue: number;
  };
  
  trends: {
    dailyBookings: { date: string; bookings: number; revenue: number }[];
    hourlyPattern: { hour: string; bookings: number }[];
    dayOfWeekPattern: { day: string; bookings: number; avgDuration: number }[];
    monthlyGrowth: { month: string; bookings: number; growth: number }[];
  };
  
  distribution: {
    byLibrary: { libraryId: string; libraryName: string; bookings: number; revenue: number }[];
    byCity: { city: string; bookings: number; revenue: number }[];
    byDuration: { duration: string; count: number; revenue: number }[];
    byPaymentMethod: { method: string; count: number; amount: number }[];
  };
  
  performance: {
    peakHours: { hour: string; bookings: number }[];
    popularLibraries: { libraryId: string; libraryName: string; bookings: number }[];
    highRevenueLibraries: { libraryId: string; libraryName: string; revenue: number }[];
    averageSessionDuration: number;
    repeatBookingRate: number;
  };
}

// ============================================
// REAL-TIME OCCUPANCY MAP
// ============================================

export interface RealTimeBooking {
  libraryId: string;
  libraryName: string;
  city: string;
  totalSeats: number;
  bookedSeats: number;
  occupiedSeats: number;
  availableSeats: number;
  occupancyRate: number;
  ongoingBookings: number;
  upcomingBookings: number;
  revenue: number;
  lastUpdated: string;
}

// ============================================
// BOOKING CONFLICTS
// ============================================

export interface BookingConflict {
  id: string;
  type: 'double_booking' | 'overlapping_time' | 'seat_unavailable' | 'capacity_exceeded';
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  booking1: Booking;
  booking2?: Booking;
  
  conflictDetails: string;
  affectedStudents: string[];
  affectedLibrary: string;
  
  status: 'detected' | 'resolving' | 'resolved' | 'ignored';
  detectedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolution?: string;
  
  autoResolvable: boolean;
  suggestedAction?: string;
}

// ============================================
// FILTERS
// ============================================

export interface BookingFilters {
  search: string;
  status: 'all' | BookingStatus;
  paymentStatus: 'all' | PaymentStatus;
  libraryId: 'all' | string;
  tenantId: 'all' | string;
  city: 'all' | string;
  dateRange: {
    type: 'all' | 'today' | 'week' | 'month' | 'custom';
    startDate?: string;
    endDate?: string;
  };
  bookingType: 'all' | BookingType;
  bookedVia: 'all' | 'mobile_app' | 'web' | 'admin';
  minAmount?: number;
  maxAmount?: number;
}

// ============================================
// DASHBOARD DATA
// ============================================

export interface BookingDashboardData {
  kpis: {
    totalBookings: number;
    todayBookings: number;
    ongoingBookings: number;
    totalRevenue: number;
    todayRevenue: number;
    cancellationRate: number;
    noShowRate: number;
    averageOccupancy: number;
  };
  recentBookings: Booking[];
  conflictAlerts: BookingConflict[];
  revenueByLibrary: { library: string; revenue: number }[];
  peakTimes: { time: string; bookings: number }[];
}

