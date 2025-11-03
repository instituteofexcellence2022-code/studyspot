// ============================================
// PAYMENT MANAGEMENT - TYPE DEFINITIONS
// ============================================

export type PaymentStatus = 'success' | 'pending' | 'failed' | 'refunded';
export type SettlementStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'wallet';
export type SettlementMethod = 'bank_transfer' | 'upi' | 'manual';

export interface PaymentTransaction {
  id: string;
  transactionId: string; // e.g., "PAY-2024-001234"
  gatewayTransactionId: string;
  
  // Student Info
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  
  // Library Info
  libraryId: string;
  libraryName: string;
  libraryAccountNumber?: string;
  libraryUpiId?: string;
  libraryIfscCode?: string;
  
  // Amount Breakdown
  amountPaid: number; // Student paid (in rupees)
  gatewayCharges: number; // Gateway fee
  gatewayChargesPercent: number; // Gateway fee %
  platformFee: number; // StudySpot fee
  platformFeePercent: number; // Platform fee %
  netToLibrary: number; // Amount for library
  
  // Payment Details
  paymentMethod: PaymentMethod;
  paymentProvider: string; // Razorpay, PhonePe, GPay, etc.
  cardLast4?: string;
  cardType?: string; // Visa, Mastercard, etc.
  bankName?: string;
  upiId?: string;
  
  // Status
  status: PaymentStatus;
  settlementStatus: SettlementStatus;
  
  // Gateway Response
  gatewayStatus: string;
  gatewayResponseCode: string;
  gatewayResponseMessage: string;
  
  // Settlement Info
  settlementId?: string;
  settlementDate?: string;
  settlementMethod?: SettlementMethod;
  settlementReference?: string;
  
  // Refund Info
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: string;
  
  // Metadata
  purpose: string; // "Library Fee", "Seat Booking", etc.
  description?: string;
  notes?: string;
  receiptUrl?: string;
  invoiceUrl?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface Settlement {
  id: string;
  settlementId: string; // e.g., "SET-2024-001"
  libraryId: string;
  libraryName: string;
  
  // Bank/UPI Details
  accountHolderName: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  upiId?: string;
  
  // Transactions
  transactionIds: string[];
  transactionCount: number;
  
  // Amount Breakdown
  totalAmount: number; // Total paid by students
  totalGatewayCharges: number;
  totalPlatformFees: number;
  netPayable: number; // Amount transferred to library
  
  // Settlement Details
  settlementMethod: SettlementMethod;
  settlementReference: string; // UTR/Transaction ID
  
  // Status
  status: SettlementStatus;
  
  // Proof
  transferProof?: string; // Screenshot/document URL
  notes?: string;
  
  // Timestamps
  createdAt: string;
  initiatedAt?: string;
  completedAt?: string;
  processedBy: string;
  processedByName: string;
}

export interface PaymentAnalytics {
  summary: {
    totalTransactions: number;
    totalAmountProcessed: number;
    totalGatewayCharges: number;
    totalPlatformFees: number;
    totalSettledToLibraries: number;
    pendingSettlements: number;
    pendingSettlementAmount: number;
    successRate: number;
    todayTransactions: number;
    todayAmount: number;
  };
  revenue: {
    thisMonth: number;
    lastMonth: number;
    growth: number;
    netProfit: number; // Platform fee - Gateway charges
    averageTransactionValue: number;
  };
  paymentMethods: {
    method: string;
    count: number;
    amount: number;
    percentage: number;
  }[];
  transactionStatus: {
    status: string;
    count: number;
    amount: number;
    percentage: number;
  }[];
  topLibraries: {
    libraryId: string;
    libraryName: string;
    transactions: number;
    amount: number;
    netPayable: number;
  }[];
  trendData: {
    date: string;
    processed: number;
    gatewayCharges: number;
    platformFees: number;
    netToLibraries: number;
  }[];
  hourlyPattern: {
    hour: number;
    count: number;
  }[];
}

export interface PendingSettlement {
  libraryId: string;
  libraryName: string;
  accountHolderName: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  upiId?: string;
  transactionCount: number;
  totalAmount: number;
  gatewayCharges: number;
  platformFees: number;
  netPayable: number;
  oldestTransactionDate: string;
  transactions: PaymentTransaction[];
}

export interface PaymentFilters {
  status: 'all' | PaymentStatus;
  paymentMethod: 'all' | PaymentMethod;
  settlementStatus: 'all' | SettlementStatus;
  libraryId: 'all' | string;
  dateRange: 'all' | 'today' | 'week' | 'month' | 'custom';
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  searchQuery: string;
}

export interface GatewayConfiguration {
  id: string;
  name: string; // Razorpay, PayU, etc.
  isActive: boolean;
  isTestMode: boolean;
  apiKey: string;
  apiSecret: string;
  webhookUrl: string;
  merchantId?: string;
  gatewayChargesPercent: number;
  gatewayChargesFixed: number;
}

export type FeeType = 'percentage' | 'flat';

export interface FeeStructure {
  id: string;
  // Platform Fee Configuration
  platformFeeType: FeeType;
  platformFeePercent: number;
  platformFeeFlat: number;
  // Gateway Charges Configuration
  gatewayChargesType: FeeType;
  gatewayChargesPercent: number;
  gatewayChargesFixed: number;
  // Transaction Limits
  minimumTransactionAmount: number;
  maximumTransactionAmount: number;
  // Metadata
  updatedAt: string;
  updatedBy: string;
}

export type SettlementMode = 'fully_automated' | 'manual_approval' | 'hybrid';

export interface SettlementConfiguration {
  id: string;
  // Settlement Mode
  settlementMode: SettlementMode;
  autoSettlement: boolean;
  // Automated Settlement Settings
  settlementFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  settlementDay?: number; // Day of week (1-7) or month (1-31)
  settlementTime: string; // HH:MM format
  minimumSettlementAmount: number;
  // Manual Approval Settings
  requireManualApproval: boolean;
  requireManagerApproval: boolean;
  approvalThresholdAmount: number; // Amount above which manual approval is required
  // Verification & Notifications
  requireBankVerification: boolean;
  notifyLibraryOnSettlement: boolean;
  notifyAdminOnPendingApproval: boolean;
  // Auto-retry Failed Settlements
  autoRetryFailedSettlements: boolean;
  maxRetryAttempts: number;
  retryIntervalHours: number;
  // Metadata
  updatedAt: string;
  updatedBy: string;
}

export interface RefundRequest {
  id: string;
  transactionId: string;
  requestedBy: string;
  requestedByName: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  approvedBy?: string;
  approvedByName?: string;
  completedAt?: string;
  refundReference?: string;
  notes?: string;
  createdAt: string;
}

export interface PaymentDashboard {
  analytics: PaymentAnalytics;
  recentTransactions: PaymentTransaction[];
  pendingSettlements: PendingSettlement[];
  failedTransactions: PaymentTransaction[];
  todayStats: {
    transactions: number;
    amount: number;
    successRate: number;
  };
}

export interface InitiateSettlementData {
  libraryId: string;
  transactionIds: string[];
  settlementMethod: SettlementMethod;
  settlementReference?: string;
  notes?: string;
}

export interface ProcessRefundData {
  transactionId: string;
  amount: number;
  reason: string;
  notes?: string;
}














