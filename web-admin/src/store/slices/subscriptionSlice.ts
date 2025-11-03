/**
 * Subscription Redux Slice
 * State management for subscription features
 * @author Agent 1 - Senior Full Stack Developer
 * 
 * Architecture Pattern: Redux Toolkit with Async Thunks
 * - Centralized state management
 * - Async thunks for API calls
 * - Proper loading/error states
 * - Optimistic updates where appropriate
 * - Type-safe actions and reducers
 */

import { createSlice, createAsyncThunk, PayloadAction
  } from '@reduxjs/toolkit';
import subscriptionService from '../../services/api/subscription.service';
import { 
  SubscriptionPlan,
  Subscription,
  Invoice,
  CreateSubscriptionRequest,
  UpgradeSubscriptionRequest,
  DowngradeSubscriptionRequest,
  CancelSubscriptionRequest,
  BillingCycle
} from '../../types';
import { SubscriptionState } from '../../types/subscription';

// Initial State
const initialState: SubscriptionState = {
  // Plans
  plans: [],
  plansLoading: false,
  plansError: null,
  
  // Current subscription
  currentSubscription: null,
  subscriptionLoading: false,
  subscriptionError: null,
  
  // Invoices
  invoices: [],
  invoicesLoading: false,
  invoicesError: null,
  
  // UI State
  selectedPlan: null,
  selectedBillingCycle: 'monthly',
  billingInterval: 'monthly',
  checkoutLoading: false,
  checkoutError: null};

// Async Thunks

/**
 * Fetch all subscription plans
 */
export const fetchPlans = createAsyncThunk(
  'subscription/fetchPlans',
  async (_, { rejectWithValue }) => {
    try {
      const plans = await subscriptionService.getPlans();
      return plans;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch current subscription for tenant
 */
export const fetchSubscription = createAsyncThunk(
  'subscription/fetchSubscription',
  async (tenantId: string, { rejectWithValue }) => {
    try {
      const subscription = await subscriptionService.getSubscription(tenantId);
      return subscription;
    } catch (error: any) {
      // Don't treat "no subscription" as an error
      if (error.message === 'NO_SUBSCRIPTION') {
        return null;
      }
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Create new subscription
 */
export const createSubscription = createAsyncThunk(
  'subscription/createSubscription',
  async (data: CreateSubscriptionRequest, { rejectWithValue }) => {
    try {
      const result = await subscriptionService.createSubscription(data);
      return result.subscription;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Upgrade subscription to higher plan
 */
export const upgradeSubscription = createAsyncThunk(
  'subscription/upgradeSubscription',
  async (
    { subscriptionId, newPlanId }: { subscriptionId: string; newPlanId: string },
    { rejectWithValue }
  ) => {
    try {
      const subscription = await subscriptionService.upgradeSubscription(
        subscriptionId,
        { planId: newPlanId, billingCycle: 'monthly' as BillingCycle }
      );
      return subscription;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Downgrade subscription to lower plan
 */
export const downgradeSubscription = createAsyncThunk(
  'subscription/downgradeSubscription',
  async (
    { subscriptionId, newPlanId }: { subscriptionId: string; newPlanId: string },
    { rejectWithValue }
  ) => {
    try {
      const subscription = await subscriptionService.downgradeSubscription(
        subscriptionId,
        { 
          planId: newPlanId, 
          billingCycle: 'monthly' as BillingCycle,
          effectiveDate: new Date().toISOString()
        }
      );
      return subscription;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Cancel subscription
 */
export const cancelSubscription = createAsyncThunk(
  'subscription/cancelSubscription',
  async (
    { subscriptionId, immediate }: { subscriptionId: string; immediate?: boolean },
    { rejectWithValue }
  ) => {
    try {
      const subscription = await subscriptionService.cancelSubscription(
        subscriptionId,
        { reason: immediate ? 'Immediate cancellation requested' : 'End of period cancellation requested' }
      );
      return subscription;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch invoices for tenant
 */
export const fetchInvoices = createAsyncThunk(
  'subscription/fetchInvoices',
  async ({ tenantId, limit = 10 }: { tenantId: string; limit?: number }, { rejectWithValue }) => {
    try {
      const invoices = await subscriptionService.getInvoices(tenantId, limit);
      return invoices;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Create Stripe customer portal session and redirect
 */
export const openCustomerPortal = createAsyncThunk(
  'subscription/openCustomerPortal',
  async (subscriptionId: string, { rejectWithValue }) => {
    try {
      const url = await subscriptionService.createPortalSession(subscriptionId);
      // Redirect to Stripe customer portal
      window.location.href = url;
      return url;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    // UI Actions
    selectPlan: (state, action: PayloadAction<SubscriptionPlan>) => {
      state.selectedPlan = action.payload as any;
    },
    selectBillingCycle: (state, action: PayloadAction<BillingCycle>) => {
      state.selectedBillingCycle = action.payload;
    },
    setBillingInterval: (state, action: PayloadAction<BillingCycle>) => {
      state.billingInterval = action.payload;
    },
    clearCheckoutError: (state: any) => {
      state.checkoutError = null;
    },
    clearSubscriptionError: (state: any) => {
      state.subscriptionError = null;
    },
    resetSubscriptionState: (state: any) => {
      return initialState;
    },
    },
  extraReducers: (builder: any) => {
    // Fetch Plans
    builder
      .addCase(fetchPlans.pending, (state: any) => {
        state.plansLoading = true;
        state.plansError = null;
      })
      .addCase(fetchPlans.fulfilled, (state: any, action: any) => {
        state.plansLoading = false;
        state.plans = action.payload;
      })
      .addCase(fetchPlans.rejected, (state: any, action: any) => {
        state.plansLoading = false;
        state.plansError = action.payload as string;
      });

    // Fetch Subscription
    builder
      .addCase(fetchSubscription.pending, (state: any) => {
        state.subscriptionLoading = true;
        state.subscriptionError = null;
      })
      .addCase(fetchSubscription.fulfilled, (state: any, action: any) => {
        state.subscriptionLoading = false;
        state.currentSubscription = action.payload;
      })
      .addCase(fetchSubscription.rejected, (state: any, action: any) => {
        state.subscriptionLoading = false;
        state.subscriptionError = action.payload as string;
      });

    // Create Subscription
    builder
      .addCase(createSubscription.pending, (state: any) => {
        state.checkoutLoading = true;
        state.checkoutError = null;
      })
      .addCase(createSubscription.fulfilled, (state: any, action: any) => {
        state.checkoutLoading = false;
        state.currentSubscription = action.payload;
        state.selectedPlan = null; // Clear selection after successful creation
      })
      .addCase(createSubscription.rejected, (state: any, action: any) => {
        state.checkoutLoading = false;
        state.checkoutError = action.payload as string;
      });

    // Upgrade Subscription
    builder
      .addCase(upgradeSubscription.pending, (state: any) => {
        state.subscriptionLoading = true;
        state.subscriptionError = null;
      })
      .addCase(upgradeSubscription.fulfilled, (state: any, action: any) => {
        state.subscriptionLoading = false;
        state.currentSubscription = action.payload;
      })
      .addCase(upgradeSubscription.rejected, (state: any, action: any) => {
        state.subscriptionLoading = false;
        state.subscriptionError = action.payload as string;
      });

    // Downgrade Subscription
    builder
      .addCase(downgradeSubscription.pending, (state: any) => {
        state.subscriptionLoading = true;
        state.subscriptionError = null;
      })
      .addCase(downgradeSubscription.fulfilled, (state: any, action: any) => {
        state.subscriptionLoading = false;
        state.currentSubscription = action.payload;
      })
      .addCase(downgradeSubscription.rejected, (state: any, action: any) => {
        state.subscriptionLoading = false;
        state.subscriptionError = action.payload as string;
      });

    // Cancel Subscription
    builder
      .addCase(cancelSubscription.pending, (state: any) => {
        state.subscriptionLoading = true;
        state.subscriptionError = null;
      })
      .addCase(cancelSubscription.fulfilled, (state: any, action: any) => {
        state.subscriptionLoading = false;
        state.currentSubscription = action.payload;
      })
      .addCase(cancelSubscription.rejected, (state: any, action: any) => {
        state.subscriptionLoading = false;
        state.subscriptionError = action.payload as string;
      });

    // Fetch Invoices
    builder
      .addCase(fetchInvoices.pending, (state: any) => {
        state.invoicesLoading = true;
        state.invoicesError = null;
      })
      .addCase(fetchInvoices.fulfilled, (state: any, action: any) => {
        state.invoicesLoading = false;
        state.invoices = action.payload;
      })
      .addCase(fetchInvoices.rejected, (state: any, action: any) => {
        state.invoicesLoading = false;
        state.invoicesError = action.payload as string;
      });

    // Open Customer Portal
    builder
      .addCase(openCustomerPortal.pending, (state: any) => {
        state.subscriptionLoading = true;
      })
      .addCase(openCustomerPortal.fulfilled, (state: any) => {
        state.subscriptionLoading = false;
      })
      .addCase(openCustomerPortal.rejected, (state: any, action: any) => {
        state.subscriptionLoading = false;
        state.subscriptionError = action.payload as string;
      });
  }});

// Export Actions
export const {
  selectPlan,
  selectBillingCycle,
  setBillingInterval,
  clearCheckoutError,
  clearSubscriptionError,
  resetSubscriptionState} = subscriptionSlice.actions;

// Export Reducer
export default subscriptionSlice.reducer;

