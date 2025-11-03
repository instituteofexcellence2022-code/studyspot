/**
 * Credit Slice
 * 
 * Redux state management for credit management (SMS & WhatsApp credits)
 * Phase 6 - Sprint 4: Credit Management
 */

import { createSlice, createAsyncThunk, PayloadAction
  } from '@reduxjs/toolkit';
import creditService from '../../services/creditService';
import { CreditState,
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
  PaginatedResponse

   } from '../../types';

/**
 * Initial State
 */
const initialState: CreditState = {
  balance: {
    data: null,
    loading: false,
    error: null
  },
  packages: {
    items: [],
    loading: false,
    error: null
  },
  transactions: {
    items: [],
    loading: false,
    error: null,
    total: 0,
    filters: {
      type: undefined,
      startDate: undefined,
      endDate: undefined,
      minAmount: undefined,
      maxAmount: undefined
    }
  },
  autoTopup: {
    sms: null,
    whatsapp: null,
    loading: false,
    error: null
  },
  usage: {
    data: null,
    loading: false,
    error: null
  },
  analytics: {
    data: null,
    loading: false,
    error: null
  },
  alerts: {
    items: [],
    loading: false,
    error: null,
    unreadCount: 0
  },
  reports: {
    data: null,
    loading: false,
    error: null
  }
};

/**
 * Async Thunks - Balance
 */
export const fetchCreditBalance = createAsyncThunk(
  'credit/fetchBalance',
  async (_, { rejectWithValue }) => {
    try {
      return await creditService.getCreditBalance();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch credit balance');
    }
  }
);

export const refreshCreditBalance = createAsyncThunk(
  'credit/refreshBalance',
  async (_, { rejectWithValue }) => {
    try {
      return await creditService.refreshCreditBalance();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to refresh credit balance');
    }
  }
);

/**
 * Async Thunks - Packages
 */
export const fetchCreditPackages = createAsyncThunk(
  'credit/fetchPackages',
  async (type: string | undefined, { rejectWithValue }) => {
    try {
      return await creditService.getCreditPackages(type);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch credit packages');
    }
  }
);

/**
 * Async Thunks - Purchases
 */
export const purchaseCredits = createAsyncThunk(
  'credit/purchase',
  async (data: CreditPurchaseRequest, { rejectWithValue, dispatch }) => {
    try {
      const result = await creditService.purchaseCredits(data);
      // Refresh balance after successful purchase
      dispatch(fetchCreditBalance());
      dispatch(fetchCreditTransactions(undefined));
      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to purchase credits');
    }
  }
);

export const validateCreditPurchase = createAsyncThunk(
  'credit/validatePurchase',
  async (data: CreditPurchaseRequest, { rejectWithValue }) => {
    try {
      return await creditService.validateCreditPurchase(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to validate purchase');
    }
  }
);

/**
 * Async Thunks - Transactions
 */
export const fetchCreditTransactions = createAsyncThunk(
  'credit/fetchTransactions',
  async (filters: CreditTransactionFilters | undefined, { rejectWithValue }) => {
    try {
      return await creditService.getCreditTransactions(filters);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
    }
  }
);

export const fetchCreditTransactionById = createAsyncThunk(
  'credit/fetchTransactionById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await creditService.getCreditTransactionById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transaction');
    }
  }
);

export const exportCreditTransactions = createAsyncThunk(
  'credit/exportTransactions',
  async (
    { filters, format }: { filters?: CreditTransactionFilters; format?: 'csv' | 'excel' | 'pdf' },
    { rejectWithValue }
  ) => {
    try {
      const blob = await creditService.exportCreditTransactions(filters, format);
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `credit-transactions-${new Date().toISOString()}.${format || 'csv'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return { success: true };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to export transactions');
    }
  }
);

/**
 * Async Thunks - Auto Top-up
 */
export const fetchAutoTopupConfigs = createAsyncThunk(
  'credit/fetchAutoTopupConfigs',
  async (_, { rejectWithValue }) => {
    try {
      return await creditService.getAutoTopupConfigs();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch auto top-up configs');
    }
  }
);

export const fetchAutoTopupConfig = createAsyncThunk(
  'credit/fetchAutoTopupConfig',
  async (type: 'sms' | 'whatsapp', { rejectWithValue }) => {
    try {
      return { type, config: await creditService.getAutoTopupConfig(type) };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch auto top-up config');
    }
  }
);

export const createAutoTopupConfig = createAsyncThunk(
  'credit/createAutoTopupConfig',
  async (data: AutoTopupCreateRequest, { rejectWithValue }) => {
    try {
      const config = await creditService.createAutoTopupConfig(data);
      return { type: data.type, config };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create auto top-up config');
    }
  }
);

export const updateAutoTopupConfig = createAsyncThunk(
  'credit/updateAutoTopupConfig',
  async (
    { type, data }: { type: 'sms' | 'whatsapp'; data: AutoTopupUpdateRequest },
    { rejectWithValue }
  ) => {
    try {
      const config = await creditService.updateAutoTopupConfig(type, data);
      return { type, config };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update auto top-up config');
    }
  }
);

export const deleteAutoTopupConfig = createAsyncThunk(
  'credit/deleteAutoTopupConfig',
  async (type: 'sms' | 'whatsapp', { rejectWithValue }) => {
    try {
      await creditService.deleteAutoTopupConfig(type);
      return type;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete auto top-up config');
    }
  }
);

export const testAutoTopupConfig = createAsyncThunk(
  'credit/testAutoTopupConfig',
  async (type: 'sms' | 'whatsapp', { rejectWithValue }) => {
    try {
      return await creditService.testAutoTopupConfig(type);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to test auto top-up config');
    }
  }
);

/**
 * Async Thunks - Usage & Analytics
 */
export const fetchCreditUsageStats = createAsyncThunk(
  'credit/fetchUsageStats',
  async (params: { startDate?: string; endDate?: string } = {}, { rejectWithValue }) => {
    try {
      return await creditService.getCreditUsageStats(params.startDate, params.endDate);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch usage stats');
    }
  }
);

export const fetchCreditUsageHistory = createAsyncThunk(
  'credit/fetchUsageHistory',
  async (
    { period, type }: { period?: 'day' | 'week' | 'month' | 'year'; type?: 'sms' | 'whatsapp' } = {},
    { rejectWithValue }
  ) => {
    try {
      return await creditService.getCreditUsageHistory(period, type);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch usage history');
    }
  }
);

export const fetchCreditAnalytics = createAsyncThunk(
  'credit/fetchAnalytics',
  async (period: string = 'month', { rejectWithValue }) => {
    try {
      return await creditService.getCreditAnalytics(period);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch analytics');
    }
  }
);

/**
 * Async Thunks - Alerts
 */
export const fetchCreditAlerts = createAsyncThunk(
  'credit/fetchAlerts',
  async (includeRead: boolean = false, { rejectWithValue }) => {
    try {
      return await creditService.getCreditAlerts(includeRead);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch alerts');
    }
  }
);

export const markAlertAsRead = createAsyncThunk(
  'credit/markAlertAsRead',
  async (id: string, { rejectWithValue }) => {
    try {
      await creditService.markAlertAsRead(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark alert as read');
    }
  }
);

export const markAllAlertsAsRead = createAsyncThunk(
  'credit/markAllAlertsAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await creditService.markAllAlertsAsRead();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark all alerts as read');
    }
  }
);

export const deleteAlert = createAsyncThunk(
  'credit/deleteAlert',
  async (id: string, { rejectWithValue }) => {
    try {
      await creditService.deleteAlert(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete alert');
    }
  }
);

/**
 * Async Thunks - Reports
 */
export const fetchCreditReports = createAsyncThunk(
  'credit/fetchReports',
  async (_, { rejectWithValue }) => {
    try {
      return await creditService.getCreditReports();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reports');
    }
  }
);

export const generateCreditReport = createAsyncThunk(
  'credit/generateReport',
  async (
    {
      reportType,
      startDate,
      endDate}: {
      reportType: 'daily' | 'weekly' | 'monthly' | 'custom';
      startDate?: string;
      endDate?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      return await creditService.generateCreditReport(reportType, startDate, endDate);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate report');
    }
  }
);

export const downloadCreditReport = createAsyncThunk(
  'credit/downloadReport',
  async (
    { reportId, format }: { reportId: string; format?: 'pdf' | 'excel' | 'csv' },
    { rejectWithValue }
  ) => {
    try {
      const blob = await creditService.downloadCreditReport(reportId, format);
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `credit-report-${reportId}.${format || 'pdf'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return { success: true };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to download report');
    }
  }
);

/**
 * Credit Slice
 */
const creditSlice = createSlice({
  name: 'credit',
  initialState,
  reducers: {
    setTransactionFilters: (state, action: PayloadAction<Partial<CreditTransactionFilters>>) => {
      state.transactions.filters = {
        ...state.transactions.filters,
        ...action.payload};
    },
    clearTransactionFilters: (state: any) => {
      state.transactions.filters = initialState.transactions.filters;
    },
    clearCreditErrors: (state: any) => {
      state.balance.error = null;
      state.packages.error = null;
      state.transactions.error = null;
      state.autoTopup.error = null;
      state.usage.error = null;
      state.analytics.error = null;
      state.alerts.error = null;
      state.reports.error = null;
    }},
  extraReducers: (builder: any) => {
    // Balance
    builder
      .addCase(fetchCreditBalance.pending, (state: any) => {
        state.balance.loading = true;
        state.balance.error = null;
      })
      .addCase(fetchCreditBalance.fulfilled, (state: any, action: any) => {
        state.balance.loading = false;
        state.balance.data = action.payload;
      })
      .addCase(fetchCreditBalance.rejected, (state: any, action: any) => {
        state.balance.loading = false;
        state.balance.error = action.payload as string;
      });

    builder
      .addCase(refreshCreditBalance.pending, (state: any) => {
        state.balance.loading = true;
        state.balance.error = null;
      })
      .addCase(refreshCreditBalance.fulfilled, (state: any, action: any) => {
        state.balance.loading = false;
        state.balance.data = action.payload;
      })
      .addCase(refreshCreditBalance.rejected, (state: any, action: any) => {
        state.balance.loading = false;
        state.balance.error = action.payload as string;
      });

    // Packages
    builder
      .addCase(fetchCreditPackages.pending, (state: any) => {
        state.packages.loading = true;
        state.packages.error = null;
      })
      .addCase(fetchCreditPackages.fulfilled, (state: any, action: any) => {
        state.packages.loading = false;
        state.packages.items = action.payload;
      })
      .addCase(fetchCreditPackages.rejected, (state: any, action: any) => {
        state.packages.loading = false;
        state.packages.error = action.payload as string;
      });

    // Transactions
    builder
      .addCase(fetchCreditTransactions.pending, (state: any) => {
        state.transactions.loading = true;
        state.transactions.error = null;
      })
      .addCase(fetchCreditTransactions.fulfilled, (state: any, action: any) => {
        state.transactions.loading = false;
        state.transactions.items = action.payload.data;
        state.transactions.total = action.payload.pagination.total;
      })
      .addCase(fetchCreditTransactions.rejected, (state: any, action: any) => {
        state.transactions.loading = false;
        state.transactions.error = action.payload as string;
      });

    // Auto Top-up
    builder
      .addCase(fetchAutoTopupConfigs.pending, (state: any) => {
        state.autoTopup.loading = true;
        state.autoTopup.error = null;
      })
      .addCase(fetchAutoTopupConfigs.fulfilled, (state: any, action: any) => {
        state.autoTopup.loading = false;
        state.autoTopup.sms = action.payload.sms;
        state.autoTopup.whatsapp = action.payload.whatsapp;
      })
      .addCase(fetchAutoTopupConfigs.rejected, (state: any, action: any) => {
        state.autoTopup.loading = false;
        state.autoTopup.error = action.payload as string;
      });

    builder.addCase(createAutoTopupConfig.fulfilled, (state: any, action: any) => {
      if (action.payload.type === 'sms') {
        state.autoTopup.sms = action.payload.config;
      } else {
        state.autoTopup.whatsapp = action.payload.config;
      }
    });

    builder.addCase(updateAutoTopupConfig.fulfilled, (state: any, action: any) => {
      if (action.payload.type === 'sms') {
        state.autoTopup.sms = action.payload.config;
      } else {
        state.autoTopup.whatsapp = action.payload.config;
      }
    });

    builder.addCase(deleteAutoTopupConfig.fulfilled, (state: any, action: any) => {
      if (action.payload === 'sms') {
        state.autoTopup.sms = null;
      } else {
        state.autoTopup.whatsapp = null;
      }
    });

    // Usage Stats
    builder
      .addCase(fetchCreditUsageStats.pending, (state: any) => {
        state.usage.loading = true;
        state.usage.error = null;
      })
      .addCase(fetchCreditUsageStats.fulfilled, (state: any, action: any) => {
        state.usage.loading = false;
        state.usage.data = action.payload;
      })
      .addCase(fetchCreditUsageStats.rejected, (state: any, action: any) => {
        state.usage.loading = false;
        state.usage.error = action.payload as string;
      });

    // Analytics
    builder
      .addCase(fetchCreditAnalytics.pending, (state: any) => {
        state.analytics.loading = true;
        state.analytics.error = null;
      })
      .addCase(fetchCreditAnalytics.fulfilled, (state: any, action: any) => {
        state.analytics.loading = false;
        state.analytics.data = action.payload;
      })
      .addCase(fetchCreditAnalytics.rejected, (state: any, action: any) => {
        state.analytics.loading = false;
        state.analytics.error = action.payload as string;
      });

    // Alerts
    builder
      .addCase(fetchCreditAlerts.pending, (state: any) => {
        state.alerts.loading = true;
        state.alerts.error = null;
      })
      .addCase(fetchCreditAlerts.fulfilled, (state: any, action: any) => {
        state.alerts.loading = false;
        state.alerts.items = action.payload;
        state.alerts.unreadCount = action.payload.filter((a: any) => !a.isRead).length;
      })
      .addCase(fetchCreditAlerts.rejected, (state: any, action: any) => {
        state.alerts.loading = false;
        state.alerts.error = action.payload as string;
      });

    builder.addCase(markAlertAsRead.fulfilled, (state: any, action: any) => {
      const alert = state.alerts.items.find((a: any) => a.id === action.payload);
      if (alert) {
        alert.isRead = true;
        state.alerts.unreadCount = Math.max(0, state.alerts.unreadCount - 1);
      }
    });

    builder.addCase(markAllAlertsAsRead.fulfilled, (state: any) => {
      state.alerts.items.forEach((alert: any) => {
        alert.isRead = true;
      });
      state.alerts.unreadCount = 0;
    });

    builder.addCase(deleteAlert.fulfilled, (state: any, action: any) => {
      state.alerts.items = state.alerts.items.filter((a: any) => a.id !== action.payload);
      state.alerts.unreadCount = state.alerts.items.filter((a: any) => !a.isRead).length;
    });
  }});

export const { setTransactionFilters, clearTransactionFilters, clearCreditErrors } =
  creditSlice.actions;

export default creditSlice.reducer;

