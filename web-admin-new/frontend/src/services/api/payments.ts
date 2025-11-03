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
    const response = await api.get('/payments/transactions', { params: filters });
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getTransactionById = async (
  id: string
): Promise<ApiResponse<PaymentTransaction>> => {
  try {
    const response = await api.get(`/payments/transactions/${id}`);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const verifyTransaction = async (
  transactionId: string,
  verifierLevel: 1 | 2,
  notes?: string
): Promise<ApiResponse<PaymentTransaction>> => {
  try {
    const response = await api.post(`/payments/transactions/${transactionId}/verify`, {
      verifierLevel,
      notes,
    });
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const flagTransaction = async (
  transactionId: string,
  reason: string
): Promise<ApiResponse<PaymentTransaction>> => {
  try {
    const response = await api.post(`/payments/transactions/${transactionId}/flag`, {
      reason,
    });
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getFailedTransactions = async (): Promise<ApiResponse<PaymentTransaction[]>> => {
  try {
    const response = await api.get('/payments/transactions/failed');
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// ============================================
// SETTLEMENTS
// ============================================

export const getPendingSettlements = async (): Promise<ApiResponse<PendingSettlement[]>> => {
  try {
    const response = await api.get('/payments/settlements/pending');
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getCompletedSettlements = async (): Promise<ApiResponse<Settlement[]>> => {
  try {
    const response = await api.get('/payments/settlements/completed');
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
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
    const response = await api.post('/payments/settlements/initiate', data);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// ============================================
// SETTLEMENT BATCHES (Dual Verification)
// ============================================

export const getSettlementBatches = async (): Promise<ApiResponse<SettlementBatch[]>> => {
  try {
    const response = await api.get('/payments/settlement-batches');
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const verifySettlementBatch = async (
  batchId: string,
  verifierLevel: 1 | 2,
  notes?: string
): Promise<ApiResponse<SettlementBatch>> => {
  try {
    const response = await api.post(`/payments/settlement-batches/${batchId}/verify`, {
      verifierLevel,
      notes,
    });
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const processSettlementBatch = async (
  batchId: string
): Promise<ApiResponse<SettlementBatch>> => {
  try {
    const response = await api.post(`/payments/settlement-batches/${batchId}/process`);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// ============================================
// ANALYTICS
// ============================================

export const getAnalytics = async (
  filters?: Partial<PaymentFilters>
): Promise<ApiResponse<PaymentAnalytics>> => {
  try {
    const response = await api.get('/payments/analytics', { params: filters });
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getDashboardStats = async (): Promise<ApiResponse<any>> => {
  try {
    const response = await api.get('/payments/dashboard/stats');
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// ============================================
// SETTINGS
// ============================================

export const getFeeSettings = async (): Promise<ApiResponse<FeeSettings>> => {
  try {
    const response = await api.get('/payments/settings/fees');
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updateFeeSettings = async (
  settings: FeeSettings
): Promise<ApiResponse<FeeSettings>> => {
  try {
    const response = await api.put('/payments/settings/fees', settings);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getSettlementSettings = async (): Promise<ApiResponse<SettlementSettings>> => {
  try {
    const response = await api.get('/payments/settings/settlement');
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updateSettlementSettings = async (
  settings: SettlementSettings
): Promise<ApiResponse<SettlementSettings>> => {
  try {
    const response = await api.put('/payments/settings/settlement', settings);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// ============================================
// REFUNDS
// ============================================

export const getRefundRequests = async (): Promise<ApiResponse<RefundRequest[]>> => {
  try {
    const response = await api.get('/payments/refunds');
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const initiateRefund = async (data: {
  transactionId: string;
  amount: number;
  reason: string;
  notes?: string;
}): Promise<ApiResponse<RefundRequest>> => {
  try {
    const response = await api.post('/payments/refunds/initiate', data);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const approveRefund = async (
  refundId: string,
  notes?: string
): Promise<ApiResponse<RefundRequest>> => {
  try {
    const response = await api.post(`/payments/refunds/${refundId}/approve`, { notes });
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const rejectRefund = async (
  refundId: string,
  reason: string
): Promise<ApiResponse<RefundRequest>> => {
  try {
    const response = await api.post(`/payments/refunds/${refundId}/reject`, { reason });
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// ============================================
// UTILITIES
// ============================================

export const getLibraries = async (): Promise<ApiResponse<any[]>> => {
  try {
    const response = await api.get('/payments/libraries');
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const downloadReport = async (
  type: 'transactions' | 'settlements' | 'analytics',
  filters?: Partial<PaymentFilters>
): Promise<ApiResponse<Blob>> => {
  try {
    const response = await api.get(`/payments/reports/${type}`, {
      params: filters,
      responseType: 'blob',
    });
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const downloadReceipt = async (transactionId: string): Promise<ApiResponse<Blob>> => {
  try {
    const response = await api.get(`/payments/transactions/${transactionId}/receipt`, {
      responseType: 'blob',
    });
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
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

