/**
 * Subscription Redux Slice
 * State management for Phase 6 subscription features
 * 
 * @author Agent 3 - Senior Mobile Developer (20+ Years)
 * Built with Redux Toolkit best practices and optimistic updates
 */

import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import subscriptionService from '../../services/SubscriptionService';
import {
  Plan,
  Subscription,
  Invoice,
  SubscriptionState,
} from '../../types';

// Initial state
const initialState: SubscriptionState = {
  currentSubscription: null,
  plans: [],
  invoices: [],
  loading: false,
  error: null,
  lastFetched: 0,
};

// =============================================================================
// ASYNC THUNKS
// =============================================================================

/**
 * Fetch all available subscription plans
 */
export const fetchPlans = createAsyncThunk(
  'subscription/fetchPlans',
  async (forceRefresh: boolean = false, {rejectWithValue}) => {
    try {
      const plans = await subscriptionService.getPlans(forceRefresh);
      return plans;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

/**
 * Fetch current subscription for tenant
 */
export const fetchCurrentSubscription = createAsyncThunk(
  'subscription/fetchCurrentSubscription',
  async (
    {tenantId, forceRefresh = false}: {tenantId: string; forceRefresh?: boolean},
    {rejectWithValue},
  ) => {
    try {
      const subscription = await subscriptionService.getCurrentSubscription(
        tenantId,
        forceRefresh,
      );
      return subscription;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

/**
 * Create new subscription
 */
export const createSubscription = createAsyncThunk(
  'subscription/createSubscription',
  async (
    data: {planId: string; billingCycle: 'monthly' | 'yearly'},
    {rejectWithValue},
  ) => {
    try {
      const result = await subscriptionService.createSubscription(data);
      return result.subscription;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

/**
 * Upgrade subscription plan
 */
export const upgradePlan = createAsyncThunk(
  'subscription/upgradePlan',
  async (
    {subscriptionId, newPlanId}: {subscriptionId: string; newPlanId: string},
    {rejectWithValue},
  ) => {
    try {
      const subscription = await subscriptionService.upgradePlan(
        subscriptionId,
        newPlanId,
      );
      return subscription;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

/**
 * Downgrade subscription plan
 */
export const downgradePlan = createAsyncThunk(
  'subscription/downgradePlan',
  async (
    {subscriptionId, newPlanId}: {subscriptionId: string; newPlanId: string},
    {rejectWithValue},
  ) => {
    try {
      const subscription = await subscriptionService.downgradePlan(
        subscriptionId,
        newPlanId,
      );
      return subscription;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

/**
 * Cancel subscription
 */
export const cancelSubscription = createAsyncThunk(
  'subscription/cancelSubscription',
  async (
    {subscriptionId, immediate = false}: {subscriptionId: string; immediate?: boolean},
    {rejectWithValue},
  ) => {
    try {
      const subscription = await subscriptionService.cancelSubscription(
        subscriptionId,
        immediate,
      );
      return subscription;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

/**
 * Fetch invoices for tenant
 */
export const fetchInvoices = createAsyncThunk(
  'subscription/fetchInvoices',
  async (
    {tenantId, limit = 10, forceRefresh = false}: {
      tenantId: string;
      limit?: number;
      forceRefresh?: boolean;
    },
    {rejectWithValue},
  ) => {
    try {
      const invoices = await subscriptionService.getInvoices(
        tenantId,
        limit,
        forceRefresh,
      );
      return invoices;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

/**
 * Open Stripe billing portal
 */
export const openBillingPortal = createAsyncThunk(
  'subscription/openBillingPortal',
  async (subscriptionId: string, {rejectWithValue}) => {
    try {
      const url = await subscriptionService.openBillingPortal(subscriptionId);
      return url;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

// =============================================================================
// SLICE
// =============================================================================

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    /**
     * Clear all subscription data
     */
    clearSubscriptionData: state => {
      state.currentSubscription = null;
      state.plans = [];
      state.invoices = [];
      state.error = null;
      state.lastFetched = 0;
    },

    /**
     * Clear error
     */
    clearError: state => {
      state.error = null;
    },

    /**
     * Optimistic update for plan change
     * Used for instant UI feedback before API confirms
     */
    optimisticPlanChange: (state, action: PayloadAction<string>) => {
      if (state.currentSubscription) {
        const newPlan = state.plans.find(p => p.id === action.payload);
        if (newPlan) {
          state.currentSubscription.plan_id = newPlan.id;
          state.currentSubscription.plan_name = newPlan.name;
          state.currentSubscription.plan_display_name = newPlan.display_name;
          state.currentSubscription.features = newPlan.features;
          state.currentSubscription.limits = newPlan.limits;
        }
      }
    },
  },
  extraReducers: builder => {
    // ----- FETCH PLANS -----
    builder.addCase(fetchPlans.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchPlans.fulfilled, (state, action) => {
      state.loading = false;
      state.plans = action.payload;
      state.lastFetched = Date.now();
    });
    builder.addCase(fetchPlans.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // ----- FETCH CURRENT SUBSCRIPTION -----
    builder.addCase(fetchCurrentSubscription.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCurrentSubscription.fulfilled, (state, action) => {
      state.loading = false;
      state.currentSubscription = action.payload;
      state.lastFetched = Date.now();
    });
    builder.addCase(fetchCurrentSubscription.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // ----- CREATE SUBSCRIPTION -----
    builder.addCase(createSubscription.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createSubscription.fulfilled, (state, action) => {
      state.loading = false;
      state.currentSubscription = action.payload;
    });
    builder.addCase(createSubscription.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // ----- UPGRADE PLAN -----
    builder.addCase(upgradePlan.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(upgradePlan.fulfilled, (state, action) => {
      state.loading = false;
      state.currentSubscription = action.payload;
    });
    builder.addCase(upgradePlan.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // ----- DOWNGRADE PLAN -----
    builder.addCase(downgradePlan.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(downgradePlan.fulfilled, (state, action) => {
      state.loading = false;
      state.currentSubscription = action.payload;
    });
    builder.addCase(downgradePlan.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // ----- CANCEL SUBSCRIPTION -----
    builder.addCase(cancelSubscription.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(cancelSubscription.fulfilled, (state, action) => {
      state.loading = false;
      state.currentSubscription = action.payload;
    });
    builder.addCase(cancelSubscription.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // ----- FETCH INVOICES -----
    builder.addCase(fetchInvoices.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchInvoices.fulfilled, (state, action) => {
      state.loading = false;
      state.invoices = action.payload;
    });
    builder.addCase(fetchInvoices.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // ----- OPEN BILLING PORTAL -----
    builder.addCase(openBillingPortal.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(openBillingPortal.fulfilled, state => {
      state.loading = false;
    });
    builder.addCase(openBillingPortal.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

// =============================================================================
// EXPORTS
// =============================================================================

export const {clearSubscriptionData, clearError, optimisticPlanChange} =
  subscriptionSlice.actions;

export default subscriptionSlice.reducer;

// =============================================================================
// SELECTORS
// =============================================================================

export const selectSubscription = (state: any) => state.subscription.currentSubscription;
export const selectPlans = (state: any) => state.subscription.plans;
export const selectInvoices = (state: any) => state.subscription.invoices;
export const selectSubscriptionLoading = (state: any) => state.subscription.loading;
export const selectSubscriptionError = (state: any) => state.subscription.error;
export const selectIsSubscriptionStale = (state: any) => {
  const STALE_TIME = 60 * 1000; // 1 minute
  return Date.now() - state.subscription.lastFetched > STALE_TIME;
};


