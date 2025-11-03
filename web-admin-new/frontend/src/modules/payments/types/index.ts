// ============================================
// PAYMENT MANAGEMENT - TYPE DEFINITIONS
// Enhanced with dual verification support
// ============================================

export type PaymentStatus = 'success' | 'pending' | 'failed' | 'refunded';
export type SettlementStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'wallet';
export type SettlementMethod = 'bank_transfer' | 'upi' | 'manual';
export type VerificationStatus = 'pending' | 'verified' | 'flagged' | 'rejected';
export type ApprovalLevel = 'admin' | 'manager' | 'both';

export interface PaymentTransaction {
  id: string;
  transactionId: string;
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
  amountPaid: number;
  gatewayCharges: number;
  gatewayChargesPercent: number;
  platformFee: number;
  platformFeePercent: number;
  netToLibrary: number;
  
  // Payment Details
  paymentMethod: PaymentMethod;
  paymentProvider: string;
  cardLast4?: string;
  cardType?: string;
  bankName?: string;
  upiId?: string;
  
  // Status
  status: PaymentStatus;
  settlementStatus: SettlementStatus;
  verificationStatus: VerificationStatus;
  
  // Dual Verification
  requiresDualCheck: boolean;
  verifier1?: string;
  verifier1Name?: string;
  verifier1At?: string;
  verifier2?: string;
  verifier2Name?: string;
  verifier2At?: string;
  flagReason?: string;
  
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
  purpose: string;
  description?: string;
  notes?: string;
  receiptUrl?: string;
  invoiceUrl?: string;
  
  // Automation
  autoProcessed: boolean;
  requiresManualReview: boolean;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface Settlement {
  id: string;
  settlementId: string;
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
  totalAmount: number;
  totalGatewayCharges: number;
  totalPlatformFees: number;
  netPayable: number;
  
  // Settlement Details
  settlementMethod: SettlementMethod;
  settlementReference: string;
  
  // Status
  status: SettlementStatus;
  
  // Dual Verification for Settlements
  verificationStatus: VerificationStatus;
  verifier1?: string;
  verifier1Name?: string;
  verifier1At?: string;
  verifier2?: string;
  verifier2Name?: string;
  verifier2At?: string;
  
  // Proof
  transferProof?: string;
  notes?: string;
  
  // Timestamps
  createdAt: string;
  initiatedAt?: string;
  completedAt?: string;
  processedBy: string;
  processedByName: string;
}

export interface SettlementBatch {
  id: string;
  batchId: string;
  date: string;
  libraries: number;
  transactions: number;
  totalAmount: number;
  platformFees: number;
  gatewayFees: number;
  netSettlement: number;
  status: 'pending_verification' | 'verified_ready' | 'processing' | 'completed' | 'failed';
  createdBy: string;
  createdAt: string;
  verifier1?: string;
  verifier1At?: string;
  verifier2?: string;
  verifier2At?: string;
  scheduledFor: string;
  processedAt?: string;
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
    netProfit: number;
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
  verificationStatus: 'all' | VerificationStatus;
  libraryId: 'all' | string;
  dateRange: 'all' | 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'custom';
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  searchQuery: string;
}

export type FeeType = 'percentage' | 'flat';
export type SettlementMode = 'fully_automated' | 'manual_approval' | 'hybrid';

export interface FeeSettings {
  platformFeeType: FeeType;
  platformFeePercent: number;
  platformFeeFlat: number;
  gatewayChargesType: FeeType;
  gatewayChargesPercent: number;
  gatewayChargesFixed: number;
  minimumTransaction: number;
  maximumTransaction: number;
}

export interface SettlementSettings {
  settlementMode: SettlementMode;
  settlementFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  settlementDay: number;
  settlementTime: string;
  minimumSettlementAmount: number;
  approvalThresholdAmount: number;
  approvalLevel: ApprovalLevel;
  autoRetry: 'enabled' | 'disabled';
  maxRetryAttempts: number;
  retryIntervalHours: number;
  notifyLibrary: boolean;
  notifyAdmin: boolean;
  requireVerification: boolean;
  enableDualCheck: boolean;
  dualCheckThreshold: number;
}

export interface AutomationRule {
  id: number;
  name: string;
  condition: string;
  action: string;
  enabled: boolean;
  priority: number;
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
