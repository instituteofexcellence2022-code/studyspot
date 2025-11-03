/**
 * Credit Service
 * 
 * Handles all API calls related to credit management (SMS & WhatsApp credits)
 * Phase 6 - Sprint 4: Credit Management
 */

import api from './api';
import {
  CreditBalance,
  CreditPackage,
  CreditTransaction,
  CreditPurchaseRequest,
  CreditPurchaseResponse,
  AutoTopupConfig,
  AutoTopupCreateRequest,
  AutoTopupUpdateRequest,
  CreditUsageStats,
  CreditAnalytics,
  CreditAlert,
  CreditReport,
  CreditTransactionFilters,
  ApiResponse,
  PaginatedResponse
} from '../types';

/**
 * API Endpoints
 */
const ENDPOINTS = {
  // Balance
  BALANCE: '/api/credits/balance',
  
  // Packages
  PACKAGES: '/api/credits/packages',
  PACKAGES_BY_ID: (id: string) => `/api/credits/packages/${id}`,
  PACKAGES_BY_TYPE: (type: string) => `/api/credits/packages/type/${type}`,
  
  // Transactions
  TRANSACTIONS: '/api/credits/transactions',
  TRANSACTION_BY_ID: (id: string) => `/api/credits/transactions/${id}`,
  
  // Purchases
  PURCHASE: '/api/credits/purchase',
  PURCHASE_VALIDATE: '/api/credits/purchase/validate',
  
  // Auto Top-up
  AUTO_TOPUP: '/api/credits/auto-topup',
  AUTO_TOPUP_BY_TYPE: (type: string) => `/api/credits/auto-topup/${type}`,
  AUTO_TOPUP_TEST: (type: string) => `/api/credits/auto-topup/${type}/test`,
  
  // Usage & Analytics
  USAGE_STATS: '/api/credits/usage/stats',
  USAGE_HISTORY: '/api/credits/usage/history',
  ANALYTICS: '/api/credits/analytics',
  
  // Alerts & Reports
  ALERTS: '/api/credits/alerts',
  ALERT_BY_ID: (id: string) => `/api/credits/alerts/${id}`,
  MARK_ALERT_READ: (id: string) => `/api/credits/alerts/${id}/read`,
  REPORTS: '/api/credits/reports',
  REPORT_GENERATE: '/api/credits/reports/generate',
  REPORT_DOWNLOAD: (id: string) => `/api/credits/reports/${id}/download`,
};

/**
 * Credit Balance Methods
 */
export const getCreditBalance = async (): Promise<CreditBalance> => {
  const response: any = await api.get(ENDPOINTS.BALANCE);
  return response.data?.data || response.data;
};

export const refreshCreditBalance = async (): Promise<CreditBalance> => {
  const response: any = await api.post(`${ENDPOINTS.BALANCE}/refresh`);
  return response.data?.data || response.data;
};

/**
 * Credit Package Methods
 */
export const getCreditPackages = async (type?: string): Promise<CreditPackage[]> => {
  const url = type ? ENDPOINTS.PACKAGES_BY_TYPE(type) : ENDPOINTS.PACKAGES;
  const response: any = await api.get(url);
  return response.data?.data || response.data || [];
};

export const getCreditPackageById = async (id: string): Promise<CreditPackage> => {
  const response: any = await api.get(ENDPOINTS.PACKAGES_BY_ID(id));
  return response.data?.data || response.data;
};

/**
 * Credit Purchase Methods
 */
export const purchaseCredits = async (
  data: CreditPurchaseRequest
): Promise<CreditPurchaseResponse> => {
  const response = await api.post<ApiResponse<CreditPurchaseResponse>>(
    ENDPOINTS.PURCHASE,
    data
  );
  return (response as any).data?.data || (response as any).data;
};

export const validateCreditPurchase = async (
  data: CreditPurchaseRequest
): Promise<{ valid: boolean; errors?: string[]; estimatedTotal: number }> => {
  const response = await api.post<ApiResponse<any>>(
    ENDPOINTS.PURCHASE_VALIDATE,
    data
  );
  return response.data.data;
};

/**
 * Credit Transaction Methods
 */
export const getCreditTransactions = async (
  filters?: CreditTransactionFilters
): Promise<PaginatedResponse<CreditTransaction>> => {
  const response: any = await api.get(
    ENDPOINTS.TRANSACTIONS,
    { params: filters }
  );
  return response.data?.data || { 
    success: true, 
    data: response.data || [], 
    pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } 
  };
};

export const getCreditTransactionById = async (id: string): Promise<CreditTransaction> => {
  const response: any = await api.get(
    ENDPOINTS.TRANSACTION_BY_ID(id)
  );
  return response.data?.data || response.data;
};

export const exportCreditTransactions = async (
  filters?: CreditTransactionFilters,
  format: 'csv' | 'excel' | 'pdf' = 'csv'
): Promise<Blob> => {
  const response: any = await api.get(`${ENDPOINTS.TRANSACTIONS}/export`, {
    params: { ...filters, format },
    responseType: 'blob',
  });
  return response.data;
};

/**
 * Auto Top-up Methods
 */
export const getAutoTopupConfigs = async (): Promise<{
  sms: AutoTopupConfig | null;
  whatsapp: AutoTopupConfig | null;
}> => {
  const response = await api.get<ApiResponse<any>>(ENDPOINTS.AUTO_TOPUP);
  return response.data.data;
};

export const getAutoTopupConfig = async (
  type: 'sms' | 'whatsapp'
): Promise<AutoTopupConfig | null> => {
  const response: any = await api.get(
    ENDPOINTS.AUTO_TOPUP_BY_TYPE(type)
  );
  return response.data?.data || response.data || null;
};

export const createAutoTopupConfig = async (
  data: AutoTopupCreateRequest
): Promise<AutoTopupConfig> => {
  const response: any = await api.post(
    ENDPOINTS.AUTO_TOPUP,
    data
  );
  return response.data?.data || response.data;
};

export const updateAutoTopupConfig = async (
  type: 'sms' | 'whatsapp',
  data: AutoTopupUpdateRequest
): Promise<AutoTopupConfig> => {
  const response: any = await api.put(
    ENDPOINTS.AUTO_TOPUP_BY_TYPE(type),
    data
  );
  return response.data?.data || response.data;
};

export const deleteAutoTopupConfig = async (type: 'sms' | 'whatsapp'): Promise<void> => {
  await api.delete(ENDPOINTS.AUTO_TOPUP_BY_TYPE(type));
};

export const testAutoTopupConfig = async (
  type: 'sms' | 'whatsapp'
): Promise<{ success: boolean; message: string }> => {
  const response = await api.post<ApiResponse<any>>(ENDPOINTS.AUTO_TOPUP_TEST(type));
  return response.data.data;
};

/**
 * Usage & Analytics Methods
 */
export const getCreditUsageStats = async (
  startDate?: string,
  endDate?: string
): Promise<CreditUsageStats> => {
  const response: any = await api.get(
    ENDPOINTS.USAGE_STATS,
    { params: { startDate, endDate } }
  );
  return response.data?.data || response.data;
};

export const getCreditUsageHistory = async (
  period: 'day' | 'week' | 'month' | 'year' = 'month',
  type?: 'sms' | 'whatsapp'
): Promise<any[]> => {
  const response: any = await api.get(
    ENDPOINTS.USAGE_HISTORY,
    { params: { period, type } }
  );
  return response.data?.data || response.data || [];
};

export const getCreditAnalytics = async (
  period: string = 'month'
): Promise<CreditAnalytics> => {
  const response: any = await api.get(
    ENDPOINTS.ANALYTICS,
    { params: { period } }
  );
  return response.data?.data || response.data;
};

/**
 * Alert Methods
 */
export const getCreditAlerts = async (
  includeRead: boolean = false
): Promise<CreditAlert[]> => {
  const response: any = await api.get(
    ENDPOINTS.ALERTS,
    { params: { includeRead } }
  );
  return response.data?.data || response.data || [];
};

export const getCreditAlertById = async (id: string): Promise<CreditAlert> => {
  const response: any = await api.get(ENDPOINTS.ALERT_BY_ID(id));
  return response.data?.data || response.data;
};

export const markAlertAsRead = async (id: string): Promise<void> => {
  await api.post(ENDPOINTS.MARK_ALERT_READ(id));
};

export const markAllAlertsAsRead = async (): Promise<void> => {
  await api.post(`${ENDPOINTS.ALERTS}/mark-all-read`);
};

export const deleteAlert = async (id: string): Promise<void> => {
  await api.delete(ENDPOINTS.ALERT_BY_ID(id));
};

/**
 * Report Methods
 */
export const getCreditReports = async (): Promise<CreditReport[]> => {
  const response: any = await api.get(ENDPOINTS.REPORTS);
  return response.data?.data || response.data || [];
};

export const generateCreditReport = async (
  reportType: 'daily' | 'weekly' | 'monthly' | 'custom',
  startDate?: string,
  endDate?: string
): Promise<CreditReport> => {
  const response: any = await api.post(
    ENDPOINTS.REPORT_GENERATE,
    { reportType, startDate, endDate }
  );
  return response.data?.data || response.data;
};

export const downloadCreditReport = async (
  reportId: string,
  format: 'pdf' | 'excel' | 'csv' = 'pdf'
): Promise<Blob> => {
  const response: any = await api.get(ENDPOINTS.REPORT_DOWNLOAD(reportId), {
    params: { format },
    responseType: 'blob',
  });
  return response.data;
};

/**
 * Credit Service Object (for easier imports)
 */
const creditService = {
  // Balance
  getCreditBalance,
  refreshCreditBalance,
  
  // Packages
  getCreditPackages,
  getCreditPackageById,
  
  // Purchases
  purchaseCredits,
  validateCreditPurchase,
  
  // Transactions
  getCreditTransactions,
  getCreditTransactionById,
  exportCreditTransactions,
  
  // Auto Top-up
  getAutoTopupConfigs,
  getAutoTopupConfig,
  createAutoTopupConfig,
  updateAutoTopupConfig,
  deleteAutoTopupConfig,
  testAutoTopupConfig,
  
  // Usage & Analytics
  getCreditUsageStats,
  getCreditUsageHistory,
  getCreditAnalytics,
  
  // Alerts
  getCreditAlerts,
  getCreditAlertById,
  markAlertAsRead,
  markAllAlertsAsRead,
  deleteAlert,
  
  // Reports
  getCreditReports,
  generateCreditReport,
  downloadCreditReport,
};

export default creditService;

