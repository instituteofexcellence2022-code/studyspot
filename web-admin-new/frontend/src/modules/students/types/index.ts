// ============================================
// STUDENT MANAGEMENT - TYPE DEFINITIONS
// Platform-wide student oversight and analytics
// ============================================

export type StudentStatus = 'active' | 'inactive' | 'suspended' | 'graduated' | 'dropped';
export type MembershipType = 'monthly' | 'quarterly' | 'half_yearly' | 'annual' | 'lifetime' | 'trial';
export type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'partial' | 'cancelled';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'on_leave';

// ============================================
// CORE STUDENT INTERFACE
// ============================================

export interface Student {
  id: string;
  studentId: string; // Unique platform-wide student ID
  
  // Personal Information
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  bloodGroup?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  
  // Academic Information
  education: {
    level: 'school' | 'college' | 'university' | 'professional' | 'other';
    institution: string;
    course?: string;
    year?: number;
    board?: string;
  };
  
  // Parent/Guardian Information
  parent?: {
    name: string;
    phone: string;
    email: string;
    relation: 'father' | 'mother' | 'guardian';
  };
  
  // Library Association
  libraries: LibraryAssociation[];
  primaryLibraryId: string;
  primaryLibraryName: string;
  tenantId: string;
  tenantName: string;
  
  // Membership Details
  membershipType: MembershipType;
  membershipStartDate: string;
  membershipEndDate: string;
  membershipStatus: StudentStatus;
  
  // Statistics
  stats: {
    totalBookings: number;
    activeBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    totalPayments: number;
    totalAmountPaid: number;
    outstandingAmount: number;
    attendancePercentage: number;
    lastBookingDate?: string;
    lastPaymentDate?: string;
    lastAttendanceDate?: string;
  };
  
  // Engagement Metrics
  engagement: {
    studyHours: number; // Total hours studied
    averageSessionDuration: number; // In minutes
    favoriteLibrary: string;
    favoriteTimeSlot: string;
    frequencyPerWeek: number;
    lastActiveDate: string;
    activityScore: number; // 0-100
  };
  
  // Payment Information
  paymentStatus: PaymentStatus;
  paymentInfo: {
    preferredMethod: 'upi' | 'card' | 'netbanking' | 'cash' | 'wallet';
    autoPayEnabled: boolean;
    lastPaymentAmount?: number;
    nextDueDate?: string;
    nextDueAmount?: number;
  };
  
  // Profile
  avatar?: string;
  preferences: {
    seatPreference?: string;
    studyPartner?: boolean;
    quietZone?: boolean;
    acPreference?: boolean;
    notifications: {
      email: boolean;
      sms: boolean;
      whatsapp: boolean;
      push: boolean;
    };
  };
  
  // Gamification
  gamification?: {
    points: number;
    level: number;
    badges: string[];
    rank: number;
    streak: number; // Consecutive days
  };
  
  // Referrals
  referral?: {
    referralCode: string;
    referredBy?: string;
    referredCount: number;
    referralEarnings: number;
  };
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy: string;
  notes?: string;
  tags: string[];
}

// ============================================
// LIBRARY ASSOCIATION
// ============================================

export interface LibraryAssociation {
  libraryId: string;
  libraryName: string;
  tenantId: string;
  tenantName: string;
  joinedDate: string;
  status: 'active' | 'inactive';
  membershipType: MembershipType;
  seatNumber?: string;
  zonePreference?: string;
}

// ============================================
// BOOKING HISTORY
// ============================================

export interface StudentBooking {
  id: string;
  bookingId: string;
  studentId: string;
  studentName: string;
  libraryId: string;
  libraryName: string;
  tenantId: string;
  
  // Booking Details
  seatNumber: string;
  zone: string;
  date: string;
  timeSlot: {
    start: string;
    end: string;
  };
  duration: number; // in hours
  
  // Status
  status: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show';
  bookingType: 'hourly' | 'daily' | 'weekly' | 'monthly';
  
  // Timing
  bookedAt: string;
  checkedInAt?: string;
  checkedOutAt?: string;
  actualDuration?: number;
  
  // Payment
  amount: number;
  paymentStatus: 'paid' | 'pending' | 'refunded';
  paymentMethod?: string;
  
  // Metadata
  cancelledAt?: string;
  cancellationReason?: string;
  notes?: string;
}

// ============================================
// PAYMENT HISTORY
// ============================================

export interface StudentPayment {
  id: string;
  transactionId: string;
  studentId: string;
  studentName: string;
  libraryId: string;
  libraryName: string;
  tenantId: string;
  
  // Payment Details
  amount: number;
  purpose: 'booking_fee' | 'membership_fee' | 'late_fee' | 'fine' | 'other';
  description: string;
  
  // Status
  status: 'success' | 'pending' | 'failed' | 'refunded';
  paymentMethod: 'upi' | 'card' | 'netbanking' | 'cash' | 'wallet';
  
  // Gateway Details
  gatewayTransactionId?: string;
  gatewayName?: string;
  gatewayFee?: number;
  
  // Dates
  createdAt: string;
  paidAt?: string;
  dueDate?: string;
  
  // Related
  bookingId?: string;
  invoiceId?: string;
  receiptUrl?: string;
  
  // Metadata
  notes?: string;
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: string;
}

// ============================================
// ATTENDANCE HISTORY
// ============================================

export interface StudentAttendance {
  id: string;
  studentId: string;
  studentName: string;
  libraryId: string;
  libraryName: string;
  tenantId: string;
  
  // Attendance Details
  date: string;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  duration?: number; // in minutes
  
  // Method
  method: 'manual' | 'qr_code' | 'biometric' | 'face_recognition' | 'mobile_app';
  markedBy: string;
  markedByName: string;
  
  // Location
  seatNumber?: string;
  zone?: string;
  
  // Metadata
  notes?: string;
  lateBy?: number; // minutes late
  earlyLeaveBy?: number; // minutes early
}

// ============================================
// COMMUNICATION LOG
// ============================================

export interface StudentCommunication {
  id: string;
  studentId: string;
  studentName: string;
  
  // Communication Details
  channel: 'sms' | 'whatsapp' | 'email' | 'push' | 'in_app';
  type: 'transactional' | 'promotional' | 'reminder' | 'alert' | 'notification';
  subject?: string;
  message: string;
  
  // Status
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'bounced';
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
  
  // Related
  campaignId?: string;
  templateId?: string;
  
  // Metadata
  creditsCost: number;
  sentBy: string;
  sentByName: string;
}

// ============================================
// STUDENT COMPLAINT/ISSUE
// ============================================

export interface StudentComplaint {
  id: string;
  ticketId: string;
  studentId: string;
  studentName: string;
  libraryId: string;
  libraryName: string;
  
  // Complaint Details
  category: 'booking' | 'payment' | 'facility' | 'staff' | 'service' | 'other';
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'escalated';
  
  // Resolution
  assignedTo?: string;
  assignedToName?: string;
  resolvedAt?: string;
  resolution?: string;
  satisfactionRating?: number;
  
  // Dates
  createdAt: string;
  updatedAt: string;
  
  // Metadata
  attachments: string[];
  notes: string[];
}

// ============================================
// STUDENT ANALYTICS
// ============================================

export interface StudentAnalytics {
  summary: {
    totalStudents: number;
    activeStudents: number;
    newStudentsThisMonth: number;
    churnedStudentsThisMonth: number;
    retentionRate: number;
    churnRate: number;
    averageLifetimeValue: number;
    averageBookingsPerStudent: number;
  };
  
  demographics: {
    byGender: { gender: string; count: number; percentage: number }[];
    byEducation: { level: string; count: number; percentage: number }[];
    byAge: { range: string; count: number; percentage: number }[];
    byCity: { city: string; count: number; percentage: number }[];
  };
  
  behavior: {
    bookingFrequency: { frequency: string; count: number }[];
    favoriteTimeSlots: { slot: string; count: number }[];
    averageSessionDuration: number;
    studyPatterns: { day: string; hours: number }[];
  };
  
  financial: {
    totalRevenue: number;
    averageRevenuePerStudent: number;
    paymentMethodDistribution: { method: string; count: number; percentage: number }[];
    outstandingTotal: number;
    paymentOnTimeRate: number;
  };
  
  engagement: {
    activityScoreDistribution: { score: string; count: number }[];
    topActiveStudents: { id: string; name: string; score: number }[];
    churnRiskStudents: { id: string; name: string; riskScore: number }[];
  };
  
  trends: {
    monthlyGrowth: { month: string; newStudents: number; churnedStudents: number; netGrowth: number }[];
    bookingTrends: { month: string; bookings: number }[];
    revenueTrends: { month: string; revenue: number }[];
  };
}

// ============================================
// FILTERS & SEARCH
// ============================================

export interface StudentFilters {
  search: string;
  status: 'all' | StudentStatus;
  membershipType: 'all' | MembershipType;
  paymentStatus: 'all' | PaymentStatus;
  libraryId: 'all' | string;
  tenantId: 'all' | string;
  city: 'all' | string;
  gender: 'all' | 'male' | 'female' | 'other';
  educationLevel: 'all' | string;
  dateRange: {
    type: 'all' | 'today' | 'week' | 'month' | 'custom';
    startDate?: string;
    endDate?: string;
  };
  minAge?: number;
  maxAge?: number;
  churnRisk?: 'all' | 'low' | 'medium' | 'high';
  tags: string[];
}

export interface StudentBulkOperation {
  operation: 'activate' | 'deactivate' | 'suspend' | 'delete' | 'send_message' | 'export' | 'tag';
  studentIds: string[];
  data?: any;
  performedBy: string;
  performedAt: string;
}

// ============================================
// STUDENT DASHBOARD DATA
// ============================================

export interface StudentDashboardData {
  kpis: {
    totalStudents: number;
    activeStudents: number;
    newThisMonth: number;
    churnedThisMonth: number;
    retentionRate: number;
    lifetimeValue: number;
    outstandingPayments: number;
    averageAttendance: number;
  };
  recentStudents: Student[];
  topActiveStudents: Student[];
  churnRiskStudents: Student[];
  paymentIssues: Student[];
  attendanceIssues: Student[];
  recentComplaints: StudentComplaint[];
}

