// ============================================
// PAYMENT MANAGEMENT SERVICE
// ============================================

import api from './client';
import type {
  PaymentTransaction,
  Settlement,
  SettlementBatch,
  PendingSettlement,
  PaymentAnalytics,
  PaymentFilters,
  FeeSettings,
  SettlementSettings,
  RefundRequest,
} from '../../modules/payments/types';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ============================================
// TRANSACTIONS
// ============================================

export const getAllTransactions = async (
  filters?: Partial<PaymentFilters>
): Promise<ApiResponse<PaymentTransaction[]>> => {
  try {
    const { data } = await api.get<PaymentTransaction[]>('/payments/transactions', { params: filters });
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error?.message ?? 'Failed to load transactions' };
  }
};

export const getTransactionById = async (
  id: string
): Promise<ApiResponse<PaymentTransaction>> => {
  try {
    const { data } = await api.get<PaymentTransaction>(`/payments/transactions/${id}`);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error?.message ?? 'Failed to load transaction' };
  }
};

export const verifyTransaction = async (
  transactionId: string,
  verifierLevel: 1 | 2,
  notes?: string
): Promise<ApiResponse<PaymentTransaction>> => {
  try {
    const { data } = await api.post<PaymentTransaction>(`/payments/transactions/${transactionId}/verify`, {
      verifierLevel,
      notes,
    });
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error?.message ?? 'Failed to verify transaction' };
  }
};

export const flagTransaction = async (
  transactionId: string,
  reason: string
): Promise<ApiResponse<PaymentTransaction>> => {
  try {
    const { data } = await api.post<PaymentTransaction>(`/payments/transactions/${transactionId}/flag`, {
      reason,
    });
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error?.message ?? 'Failed to flag transaction' };
  }
};

export const getFailedTransactions = async (): Promise<ApiResponse<PaymentTransaction[]>> => {
  try {
    const { data } = await api.get<PaymentTransaction[]>('/payments/transactions/failed');
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error?.message ?? 'Failed to load failed transactions' };
  }
};

// ============================================
// SETTLEMENTS
// ============================================

export const getPendingSettlements = async (): Promise<ApiResponse<PendingSettlement[]>> => {
  try {
    const { data } = await api.get<PendingSettlement[]>('/payments/settlements/pending');
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error?.message ?? 'Failed to load pending settlements' };
  }
};

export const getCompletedSettlements = async (): Promise<ApiResponse<Settlement[]>> => {
  try {
    const { data } = await api.get<Settlement[]>('/payments/settlements/completed');
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error?.message ?? 'Failed to load settlements' };
  }
};

export const initiateSettlement = async (data: {
  libraryId: string;
  transactionIds: string[];
  settlementMethod: string;
  settlementReference?: string;
  notes?: string;
}): Promise<ApiResponse<Settlement>> => {
  try {
    const result = await api.post<Settlement>('/payments/settlements/initiate', data);
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, error: error?.message ?? 'Failed to initiate settlement' };
  }
};

// ============================================
// SETTLEMENT BATCHES (Dual Verification)
// ============================================

export const getSettlementBatches = async (): Promise<ApiResponse<SettlementBatch[]>> => {
  try {
    const { data } = await api.get<SettlementBatch[]>('/payments/settlement-batches');
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error?.message ?? 'Failed to load settlement batches' };
  }
};

export const verifySettlementBatch = async (
  batchId: string,
  verifierLevel: 1 | 2,
  notes?: string
): Promise<ApiResponse<SettlementBatch>> => {
  try {
    const { data } = await api.post<SettlementBatch>(`/payments/settlement-batches/${batchId}/verify`, {
      verifierLevel,
      notes,
    });
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error?.message ?? 'Failed to verify settlement batch' };
  }
};

export const processSettlementBatch = async (
  batchId: string
): Promise<ApiResponse<SettlementBatch>> => {
  try {
    const { data } = await api.post<SettlementBatch>(`/payments/settlement-batches/${batchId}/process`);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error?.message ?? 'Failed to process settlement batch' };
  }
};

// ============================================
// ANALYTICS
// ============================================

export const getAnalytics = async (
  filters?: Partial<PaymentFilters>
): Promise<ApiResponse<PaymentAnalytics>> => {
  try {
    const { data } = await api.get<PaymentAnalytics>('/payments/analytics', { params: filters });
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error?.message ?? 'Failed to load payment analytics' };
  }
};

export const getDashboardStats = async (): Promise<ApiResponse<any>> => {
  try {
    const { data } = await api.get('/payments/dashboard/stats');
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error?.message ?? 'Failed to load dashboard stats' };
  }
};

// ============================================
// SETTINGS
// ============================================

export const getFeeSettings = async (): Promise<ApiResponse<FeeSettings>> => {
  try {
    const { data } = await api.get<FeeSettings>('/payments/settings/fees');
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error?.message ?? 'Failed to load fee settings' };
  }
};

export const updateFeeSettings = async (
  settings: FeeSettings
): Promise<ApiResponse<FeeSettings>> => {
  try {
    const { data } = await api.put<FeeSettings>('/payments/settings/fees', settings);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error?.message ?? 'Failed to update fee settings' };
  }
};

export const getSettlementSettings = async (): Promise<ApiResponse<SettlementSettings>> => {
  try {
    const { data } = await api.get<SettlementSettings>('/payments/settings/settlement');
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error?.message ?? 'Failed to load settlement settings' };
  }
};

export const updateSettlementSettings = async (
  settings: SettlementSettings
): Promise<ApiResponse<SettlementSettings>> => {
  try {
    const { data } = await api.put<SettlementSettings>('/payments/settings/settlement', settings);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error?.message ?? 'Failed to update settlement settings' };
  }
};

// ============================================
// REFUNDS
// ============================================

export const getRefundRequests = async (): Promise<ApiResponse<RefundRequest[]>> => {
  try {
    const { data } = await api.get<RefundRequest[]>('/payments/refunds');
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error?.message ?? 'Failed to load refund requests' };
  }
};

export const initiateRefund = async (data: {
  transactionId: string;
  amount: number;
  reason: string;
  notes?: string;
}): Promise<ApiResponse<RefundRequest>> => {
  try {
    const result = await api.post<RefundRequest>('/payments/refunds/initiate', data);
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, error: error?.message ?? 'Failed to initiate refund' };
  }
};

export const approveRefund = async (
  refundId: string,
  notes?: string
): Promise<ApiResponse<RefundRequest>> => {
  try {
    const { data } = await api.post<RefundRequest>(`/payments/refunds/${refundId}/approve`, { notes });
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error?.message ?? 'Failed to approve refund' };
  }
};

export const rejectRefund = async (
  refundId: string,
  reason: string
): Promise<ApiResponse<RefundRequest>> => {
  try {
    const { data } = await api.post<RefundRequest>(`/payments/refunds/${refundId}/reject`, { reason });
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error?.message ?? 'Failed to reject refund' };
  }
};

// ============================================
// UTILITIES
// ============================================

export const getLibraries = async (): Promise<ApiResponse<any[]>> => {
  try {
    const { data } = await api.get<any[]>('/payments/libraries');
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error?.message ?? 'Failed to load payment libraries' };
  }
};

export const downloadReport = async (
  type: 'transactions' | 'settlements' | 'analytics',
  filters?: Partial<PaymentFilters>
): Promise<ApiResponse<Blob>> => {
  try {
    const { data } = await api.get<Blob>(`/payments/reports/${type}`, {
      params: filters,
      responseType: 'blob',
    });
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error?.message ?? 'Failed to download report' };
  }
};

export const downloadReceipt = async (transactionId: string): Promise<ApiResponse<Blob>> => {
  try {
    const { data } = await api.get<Blob>(`/payments/transactions/${transactionId}/receipt`, {
      responseType: 'blob',
    });
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error?.message ?? 'Failed to download receipt' };
  }
};

const paymentService = {
  getAllTransactions,
  getTransactionById,
  verifyTransaction,
  flagTransaction,
  getFailedTransactions,
  getPendingSettlements,
  getCompletedSettlements,
  initiateSettlement,
  getSettlementBatches,
  verifySettlementBatch,
  processSettlementBatch,
  getAnalytics,
  getDashboardStats,
  getFeeSettings,
  updateFeeSettings,
  getSettlementSettings,
  updateSettlementSettings,
  getRefundRequests,
  initiateRefund,
  approveRefund,
  rejectRefund,
  getLibraries,
  downloadReport,
  downloadReceipt,
};

export default paymentService;

