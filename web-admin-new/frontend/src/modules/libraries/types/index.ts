// ============================================
// LIBRARY OVERSIGHT - TYPE DEFINITIONS
// Platform-wide library monitoring and analytics
// ============================================

export type LibraryStatus = 'active' | 'inactive' | 'suspended' | 'pending_approval';
export type LibraryType = 'study_library' | 'coworking' | 'reading_room' | 'hybrid';
export type OperatingStatus = 'open' | 'closed' | 'temporarily_closed';

// ============================================
// CORE LIBRARY INTERFACE
// ============================================

export interface Library {
  id: string;
  libraryId: string; // Unique library code
  
  // Basic Information
  name: string;
  description: string;
  type: LibraryType;
  status: LibraryStatus;
  
  // Tenant Association
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  tenantPlan: string;
  
  // Location
  address: {
    street: string;
    landmark?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  
  // Capacity & Layout
  capacity: {
    total: number;
    occupied: number;
    available: number;
    reserved: number;
    underMaintenance: number;
  };
  
  zones: {
    id: string;
    name: string;
    seatCount: number;
    available: number;
    type: 'silent' | 'discussion' | 'premium' | 'general';
    priceMultiplier: number;
  }[];
  
  // Amenities & Features
  amenities: string[]; // wifi, ac, parking, locker, etc.
  features: {
    qrCheckIn: boolean;
    faceRecognition: boolean;
    biometric: boolean;
    iotSensors: boolean;
    smartLighting: boolean;
    cctv: boolean;
  };
  
  // Operating Details
  operatingHours: {
    [key: string]: {
      open: string;
      close: string;
      isOpen: boolean;
      is24x7?: boolean;
    };
  };
  currentStatus: OperatingStatus;
  
  // Performance Metrics
  stats: {
    totalStudents: number;
    activeStudents: number;
    totalBookings: number;
    averageOccupancy: number; // %
    peakOccupancy: number; // %
    totalRevenue: number;
    monthlyRevenue: number;
    averageRevenuePerSeat: number;
    averageSessionDuration: number; // minutes
    bookingUtilization: number; // %
  };
  
  // Ratings & Reviews
  ratings: {
    overall: number;
    cleanliness: number;
    facilities: number;
    staff: number;
    value: number;
    reviewCount: number;
    positiveReviews: number;
    negativeReviews: number;
  };
  
  // Financial Details
  pricing: {
    hourly: number;
    daily: number;
    weekly: number;
    monthly: number;
    currency: string;
  };
  
  // Contact
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
    socialMedia?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
    };
  };
  
  // Media
  images: string[];
  logo?: string;
  coverImage?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  lastModifiedBy: string;
  approvedAt?: string;
  approvedBy?: string;
  notes?: string;
  tags: string[];
}

// ============================================
// LIBRARY PERFORMANCE
// ============================================

export interface LibraryPerformance {
  libraryId: string;
  libraryName: string;
  tenantName: string;
  
  // Financial Performance
  revenue: {
    total: number;
    monthly: number;
    growth: number;
    target: number;
    achievement: number; // %
  };
  
  // Operational Performance
  occupancy: {
    average: number;
    peak: number;
    offPeak: number;
    trend: 'increasing' | 'stable' | 'decreasing';
  };
  
  // Student Performance
  students: {
    total: number;
    active: number;
    retention: number;
    growth: number;
    satisfaction: number;
  };
  
  // Booking Performance
  bookings: {
    total: number;
    completed: number;
    cancelled: number;
    noShow: number;
    cancellationRate: number;
    noShowRate: number;
  };
  
  // Financial Health
  health: {
    score: number; // 0-100
    revenueHealth: 'good' | 'average' | 'poor';
    occupancyHealth: 'good' | 'average' | 'poor';
    retentionHealth: 'good' | 'average' | 'poor';
    overallHealth: 'excellent' | 'good' | 'average' | 'poor';
  };
}

// ============================================
// LIBRARY ANALYTICS
// ============================================

export interface LibraryAnalytics {
  summary: {
    totalLibraries: number;
    activeLibraries: number;
    newLibrariesThisMonth: number;
    totalCapacity: number;
    totalOccupancy: number;
    platformOccupancyRate: number;
    totalRevenue: number;
    averageRevenuePerLibrary: number;
    topPerformingLibrary: string;
    lowestPerformingLibrary: string;
  };
  
  performance: {
    byCity: { city: string; libraries: number; revenue: number; occupancy: number }[];
    byTenant: { tenant: string; libraries: number; revenue: number; satisfaction: number }[];
    byType: { type: string; count: number; revenue: number; avgOccupancy: number }[];
  };
  
  trends: {
    revenueGrowth: { month: string; revenue: number; growth: number }[];
    occupancyTrend: { month: string; occupancy: number }[];
    studentGrowth: { month: string; students: number }[];
  };
  
  benchmarks: {
    bestOccupancy: { libraryId: string; libraryName: string; rate: number };
    bestRevenue: { libraryId: string; libraryName: string; amount: number };
    bestSatisfaction: { libraryId: string; libraryName: string; rating: number };
    bestGrowth: { libraryId: string; libraryName: string; growth: number };
  };
}

// ============================================
// LIBRARY COMPARISON
// ============================================

export interface LibraryComparison {
  libraries: Library[];
  comparisonMetrics: {
    revenue: { [libraryId: string]: number };
    occupancy: { [libraryId: string]: number };
    students: { [libraryId: string]: number };
    satisfaction: { [libraryId: string]: number };
    growth: { [libraryId: string]: number };
  };
  rankings: {
    byRevenue: { rank: number; libraryId: string; libraryName: string; value: number }[];
    byOccupancy: { rank: number; libraryId: string; libraryName: string; value: number }[];
    byStudents: { rank: number; libraryId: string; libraryName: string; value: number }[];
    bySatisfaction: { rank: number; libraryId: string; libraryName: string; value: number }[];
  };
}

// ============================================
// FILTERS & SEARCH
// ============================================

export interface LibraryFilters {
  search: string;
  status: 'all' | LibraryStatus;
  type: 'all' | LibraryType;
  tenantId: 'all' | string;
  city: 'all' | string;
  state: 'all' | string;
  hasAmenity: string[];
  minCapacity?: number;
  maxCapacity?: number;
  minOccupancy?: number;
  maxOccupancy?: number;
  minRating?: number;
  dateRange: {
    type: 'all' | 'today' | 'week' | 'month' | 'custom';
    startDate?: string;
    endDate?: string;
  };
}

// ============================================
// LIBRARY DASHBOARD DATA
// ============================================

export interface LibraryDashboardData {
  kpis: {
    totalLibraries: number;
    activeLibraries: number;
    totalCapacity: number;
    currentOccupancy: number;
    occupancyRate: number;
    totalRevenue: number;
    avgRevenuePerLibrary: number;
    avgRating: number;
  };
  topPerforming: Library[];
  lowPerforming: Library[];
  recentlyAdded: Library[];
  pendingApproval: Library[];
  occupancyAlerts: Library[];
}

// ============================================
// REAL-TIME OCCUPANCY
// ============================================

export interface RealTimeOccupancy {
  libraryId: string;
  libraryName: string;
  city: string;
  totalSeats: number;
  occupiedSeats: number;
  availableSeats: number;
  occupancyRate: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  lastUpdated: string;
  zones: {
    zoneId: string;
    zoneName: string;
    total: number;
    occupied: number;
    available: number;
  }[];
}

// ============================================
// LIBRARY APPROVAL WORKFLOW
// ============================================

export interface LibraryApproval {
  id: string;
  libraryId: string;
  libraryName: string;
  tenantId: string;
  tenantName: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}

