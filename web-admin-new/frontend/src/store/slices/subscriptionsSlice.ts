// ============================================
// SUBSCRIPTIONS REDUX SLICE
// ============================================

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  Subscription,
  SubscriptionChange,
  SubscriptionPlan,
  SubscriptionAnalytics,
} from '../../modules/subscriptions/types';

interface SubscriptionsState {
  subscriptions: Subscription[];
  changes: SubscriptionChange[];
  plans: SubscriptionPlan[];
  analytics: SubscriptionAnalytics;
  loading: boolean;
  error: string | null;
}

// Mock Subscriptions (using existing tenants)
const MOCK_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub-1',
    tenantId: '1',
    tenantName: 'Delhi Central Library',
    planId: 'plan-3',
    planName: 'Pro',
    status: 'active',
    billingCycle: 'monthly',
    amount: 9999,
    currency: 'INR',
    startDate: '2024-01-15T00:00:00Z',
    endDate: '2025-01-15T00:00:00Z',
    nextBillingDate: '2024-11-15T00:00:00Z',
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'sub-2',
    tenantId: '2',
    tenantName: 'Mumbai Study Center',
    planId: 'plan-4',
    planName: 'Enterprise',
    status: 'active',
    billingCycle: 'annual',
    amount: 299990,
    currency: 'INR',
    startDate: '2024-02-01T00:00:00Z',
    endDate: '2025-02-01T00:00:00Z',
    nextBillingDate: '2025-02-01T00:00:00Z',
    createdAt: '2024-02-01T00:00:00Z',
  },
  {
    id: 'sub-3',
    tenantId: '3',
    tenantName: 'Bangalore Tech Library',
    planId: 'plan-2',
    planName: 'Starter',
    status: 'active',
    billingCycle: 'monthly',
    amount: 2999,
    currency: 'INR',
    startDate: '2024-03-10T00:00:00Z',
    endDate: '2025-03-10T00:00:00Z',
    nextBillingDate: '2024-11-10T00:00:00Z',
    createdAt: '2024-03-10T00:00:00Z',
  },
  {
    id: 'sub-4',
    tenantId: '4',
    tenantName: 'Pune Learning Hub',
    planId: 'plan-3',
    planName: 'Pro',
    status: 'trial',
    billingCycle: 'monthly',
    amount: 9999,
    currency: 'INR',
    startDate: '2024-10-25T00:00:00Z',
    endDate: '2024-11-08T00:00:00Z',
    trialEndsAt: '2024-11-08T00:00:00Z',
    nextBillingDate: '2024-11-08T00:00:00Z',
    createdAt: '2024-10-25T00:00:00Z',
  },
];

// Mock Subscription Changes
const MOCK_CHANGES: SubscriptionChange[] = [
  {
    id: 'chg-1',
    subscriptionId: 'sub-1',
    tenantId: '1',
    tenantName: 'Delhi Central Library',
    changeType: 'upgrade',
    oldPlanName: 'Starter',
    newPlanName: 'Pro',
    oldAmount: 2999,
    newAmount: 9999,
    revenueImpact: 7000,
    effectiveDate: '2024-06-01T00:00:00Z',
    timestamp: '2024-05-28T10:30:00Z',
    reason: 'Growing user base',
  },
  {
    id: 'chg-2',
    subscriptionId: 'sub-2',
    tenantId: '2',
    tenantName: 'Mumbai Study Center',
    changeType: 'upgrade',
    oldPlanName: 'Pro',
    newPlanName: 'Enterprise',
    oldAmount: 9999,
    newAmount: 29999,
    revenueImpact: 20000,
    effectiveDate: '2024-07-01T00:00:00Z',
    timestamp: '2024-06-25T14:15:00Z',
    reason: 'Need unlimited features',
  },
  {
    id: 'chg-3',
    subscriptionId: 'sub-3',
    tenantId: '3',
    tenantName: 'Bangalore Tech Library',
    changeType: 'renewal',
    oldPlanName: 'Starter',
    newPlanName: 'Starter',
    oldAmount: 2999,
    newAmount: 2999,
    revenueImpact: 0,
    effectiveDate: '2024-09-10T00:00:00Z',
    timestamp: '2024-09-10T00:00:00Z',
  },
];

// Mock Plans (from Revenue module, but with more details)
const MOCK_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan-1',
    name: 'Free',
    description: 'Perfect for testing and small libraries',
    price: { monthly: 0, annual: 0 },
    currency: 'INR',
    features: [
      '1 Library',
      'Up to 10 users',
      'Up to 5 seats',
      '1GB storage',
      'Basic analytics',
      'Email support',
      'Mobile app access',
      'Basic reports',
    ],
    limits: {
      maxLibraries: 1,
      maxUsers: 10,
      maxSeats: 5,
      storageGB: 1,
      apiCallsPerMonth: 1000,
    },
    isPopular: false,
    status: 'active',
    trialDays: 0,
    setupFee: 0,
    subscriberCount: 120,
    createdAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'plan-2',
    name: 'Starter',
    description: 'Great for growing libraries',
    price: { monthly: 2999, annual: 29990 },
    currency: 'INR',
    features: [
      '1 Library',
      'Up to 50 users',
      'Up to 25 seats',
      '10GB storage',
      'Advanced analytics',
      'Priority email support',
      'SMS notifications',
      'Mobile app access',
      'Custom reports',
      'Attendance tracking',
      'Fee management',
      'Payment gateway',
      'QR code scanning',
      'Seat booking',
      'Member profiles',
    ],
    limits: {
      maxLibraries: 1,
      maxUsers: 50,
      maxSeats: 25,
      storageGB: 10,
      apiCallsPerMonth: 10000,
    },
    isPopular: false,
    status: 'active',
    trialDays: 14,
    setupFee: 0,
    subscriberCount: 89,
    createdAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'plan-3',
    name: 'Pro',
    description: 'Most popular for established libraries',
    price: { monthly: 9999, annual: 99990 },
    currency: 'INR',
    features: [
      'Up to 3 Libraries',
      'Unlimited users',
      'Up to 100 seats',
      '50GB storage',
      'Advanced analytics',
      '24/7 phone & email support',
      'SMS + WhatsApp notifications',
      'Mobile app access',
      'API access',
      'Custom branding',
      'White-label options',
      'Bulk operations',
      'Advanced reports',
      'Multi-library dashboard',
      'Revenue analytics',
      'Automated reminders',
      'CRM features',
      'Lead management',
      'Marketing campaigns',
      'Priority feature requests',
    ],
    limits: {
      maxLibraries: 3,
      maxUsers: -1,
      maxSeats: 100,
      storageGB: 50,
      apiCallsPerMonth: 100000,
    },
    isPopular: true,
    status: 'active',
    trialDays: 14,
    setupFee: 0,
    subscriberCount: 45,
    createdAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'plan-4',
    name: 'Enterprise',
    description: 'For large library chains',
    price: { monthly: 29999, annual: 299990 },
    currency: 'INR',
    features: [
      'Unlimited Libraries',
      'Unlimited users',
      'Unlimited seats',
      '200GB storage',
      'Custom analytics',
      'Dedicated account manager',
      'All communication channels',
      'Mobile + Web app',
      'Full API access',
      'White-label options',
      'Custom integrations',
      'Advanced security',
      'SSO/SAML support',
      'Custom workflows',
      'Priority support',
      'SLA guarantee',
      'Data migration support',
      'Training sessions',
      'Custom features',
      'All features included',
    ],
    limits: {
      maxLibraries: -1,
      maxUsers: -1,
      maxSeats: -1,
      storageGB: 200,
      apiCallsPerMonth: -1,
    },
    isPopular: false,
    status: 'active',
    trialDays: 30,
    setupFee: 0,
    subscriberCount: 13,
    createdAt: '2023-01-01T00:00:00Z',
  },
];

// Mock Analytics
const MOCK_ANALYTICS: SubscriptionAnalytics = {
  activeSubscriptions: 267,
  mrr: 4850000, // ₹48.5L
  churnRate: 2.8,
  growthRate: 15.5,
  averageLifetime: 18.5,
  lifetimeValue: 189500,
};

const initialState: SubscriptionsState = {
  subscriptions: MOCK_SUBSCRIPTIONS,
  changes: MOCK_CHANGES,
  plans: MOCK_PLANS,
  analytics: MOCK_ANALYTICS,
  loading: false,
  error: null,
};

const subscriptionsSlice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {
    setSubscriptions: (state, action: PayloadAction<Subscription[]>) => {
      state.subscriptions = action.payload;
    },
    addSubscription: (state, action: PayloadAction<Subscription>) => {
      state.subscriptions.unshift(action.payload);
    },
    updateSubscription: (state, action: PayloadAction<Subscription>) => {
      const index = state.subscriptions.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) {
        state.subscriptions[index] = action.payload;
      }
    },
    removeSubscription: (state, action: PayloadAction<string>) => {
      state.subscriptions = state.subscriptions.filter((s) => s.id !== action.payload);
    },
    setChanges: (state, action: PayloadAction<SubscriptionChange[]>) => {
      state.changes = action.payload;
    },
    addChange: (state, action: PayloadAction<SubscriptionChange>) => {
      state.changes.unshift(action.payload);
    },
    setPlans: (state, action: PayloadAction<SubscriptionPlan[]>) => {
      state.plans = action.payload;
    },
    updatePlan: (state, action: PayloadAction<SubscriptionPlan>) => {
      const index = state.plans.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.plans[index] = action.payload;
      }
    },
    setAnalytics: (state, action: PayloadAction<SubscriptionAnalytics>) => {
      state.analytics = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setSubscriptions,
  addSubscription,
  updateSubscription,
  removeSubscription,
  setChanges,
  addChange,
  setPlans,
  updatePlan,
  setAnalytics,
  setLoading,
  setError,
} = subscriptionsSlice.actions;

export default subscriptionsSlice.reducer;

