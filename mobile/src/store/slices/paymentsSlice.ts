/**
 * StudySpot Mobile App - Payments Slice
 * Redux slice for managing payment state
 */

import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {PaymentRequest, PaymentResponse} from '../../types/index';
import {paymentService} from '@services/PaymentService';

// =============================================================================
// INITIAL STATE
// =============================================================================

interface PaymentsState {
  payments: any[];
  currentPayment: PaymentResponse | null;
  paymentHistory: any[];
  isLoading: boolean;
  error: string | null;
  razorpayConfig: {
    keyId: string;
    keySecret: string;
    currency: string;
  } | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: PaymentsState = {
  payments: [],
  currentPayment: null,
  paymentHistory: [],
  isLoading: false,
  error: null,
  razorpayConfig: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
};

// =============================================================================
// ASYNC THUNKS
// =============================================================================

/**
 * Create payment order
 */
export const createPaymentOrder = createAsyncThunk(
  'payments/createPaymentOrder',
  async (params: {paymentData: PaymentRequest; accessToken: string}, {rejectWithValue}) => {
    try {
      const response = await paymentService.createLibraryFeePayment(
        {
          libraryId: params.paymentData.metadata?.libraryId || '',
          amount: params.paymentData.amount,
          paymentType: params.paymentData.metadata?.recurring ? 'monthly' : 'one_time',
          seatId: params.paymentData.metadata?.seatId,
          description: params.paymentData.description,
        },
        {Authorization: `Bearer ${params.accessToken}`}
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create payment order');
    }
  }
);

/**
 * Verify payment
 */
export const verifyPayment = createAsyncThunk(
  'payments/verifyPayment',
  async (params: {paymentId: string; signature: string; orderId: string; accessToken: string}, {rejectWithValue}) => {
    try {
      const response = await paymentService.verifyPayment(
        params.paymentId,
        params.signature,
        params.orderId,
        {Authorization: `Bearer ${params.accessToken}`}
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Payment verification failed');
    }
  }
);

/**
 * Get payment history
 */
export const getPaymentHistory = createAsyncThunk(
  'payments/getPaymentHistory',
  async (params: {page?: number; limit?: number; accessToken: string}, {rejectWithValue}) => {
    try {
      const response = await paymentService.getPaymentHistory(
        params.page || 1,
        params.limit || 20,
        {Authorization: `Bearer ${params.accessToken}`}
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment history');
    }
  }
);

/**
 * Get payment details
 */
export const getPaymentDetails = createAsyncThunk(
  'payments/getPaymentDetails',
  async (params: {paymentId: string; accessToken: string}, {rejectWithValue}) => {
    try {
      const response = await paymentService.getPaymentDetails(
        params.paymentId,
        {Authorization: `Bearer ${params.accessToken}`}
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment details');
    }
  }
);

/**
 * Request refund
 */
export const requestRefund = createAsyncThunk(
  'payments/requestRefund',
  async (params: {paymentId: string; reason: string; accessToken: string}, {rejectWithValue}) => {
    try {
      const response = await paymentService.requestRefund(
        params.paymentId,
        params.reason,
        {Authorization: `Bearer ${params.accessToken}`}
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Refund request failed');
    }
  }
);

/**
 * Get Razorpay configuration
 */
export const getRazorpayConfig = createAsyncThunk(
  'payments/getRazorpayConfig',
  async (params: {accessToken: string}, {rejectWithValue}) => {
    try {
      const response = await paymentService.getRazorpayConfig(
        {Authorization: `Bearer ${params.accessToken}`}
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch Razorpay config');
    }
  }
);

/**
 * Capture payment
 */
export const capturePayment = createAsyncThunk(
  'payments/capturePayment',
  async (params: {paymentId: string; amount: number; accessToken: string}, {rejectWithValue}) => {
    try {
      const response = await paymentService.capturePayment(
        params.paymentId,
        params.amount,
        {Authorization: `Bearer ${params.accessToken}`}
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Payment capture failed');
    }
  }
);

// =============================================================================
// PAYMENTS SLICE
// =============================================================================

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    // Clear error
    clearError: state => {
      state.error = null;
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Clear current payment
    clearCurrentPayment: state => {
      state.currentPayment = null;
    },

    // Set current payment
    setCurrentPayment: (state, action: PayloadAction<PaymentResponse>) => {
      state.currentPayment = action.payload;
    },

    // Clear payment history
    clearPaymentHistory: state => {
      state.paymentHistory = [];
    },
  },
  extraReducers: builder => {
    builder
      // Create Payment Order
      .addCase(createPaymentOrder.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPaymentOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPayment = action.payload;
        state.error = null;
      })
      .addCase(createPaymentOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Verify Payment
      .addCase(verifyPayment.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentPayment) {
          state.currentPayment = {
            ...state.currentPayment,
            status: action.payload.status,
          };
        }
        state.error = null;
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Get Payment History
      .addCase(getPaymentHistory.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPaymentHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paymentHistory = action.payload.payments;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(getPaymentHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Get Payment Details
      .addCase(getPaymentDetails.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPaymentDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPayment = action.payload;
        state.error = null;
      })
      .addCase(getPaymentDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Request Refund
      .addCase(requestRefund.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(requestRefund.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(requestRefund.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Get Razorpay Config
      .addCase(getRazorpayConfig.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getRazorpayConfig.fulfilled, (state, action) => {
        state.isLoading = false;
        state.razorpayConfig = action.payload;
        state.error = null;
      })
      .addCase(getRazorpayConfig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Capture Payment
      .addCase(capturePayment.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(capturePayment.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentPayment) {
          state.currentPayment = {
            ...state.currentPayment,
            status: action.payload.status,
          };
        }
        state.error = null;
      })
      .addCase(capturePayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// =============================================================================
// ACTIONS
// =============================================================================

export const {
  clearError,
  setLoading,
  clearCurrentPayment,
  setCurrentPayment,
  clearPaymentHistory,
} = paymentsSlice.actions;

// =============================================================================
// SELECTORS
// =============================================================================

export const selectPayments = (state: {payments: PaymentsState}) => state.payments.payments;
export const selectCurrentPayment = (state: {payments: PaymentsState}) => state.payments.currentPayment;
export const selectPaymentHistory = (state: {payments: PaymentsState}) => state.payments.paymentHistory;
export const selectPaymentsLoading = (state: {payments: PaymentsState}) => state.payments.isLoading;
export const selectPaymentsError = (state: {payments: PaymentsState}) => state.payments.error;
export const selectRazorpayConfig = (state: {payments: PaymentsState}) => state.payments.razorpayConfig;
export const selectPaymentsPagination = (state: {payments: PaymentsState}) => state.payments.pagination;

// =============================================================================
// EXPORTS
// =============================================================================

export default paymentsSlice.reducer;
