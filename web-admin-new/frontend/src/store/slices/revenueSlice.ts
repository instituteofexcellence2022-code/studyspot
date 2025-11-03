// ============================================
// REVENUE REDUX SLICE
// ============================================

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  RevenueKPIs,
  SubscriptionPlan,
  Invoice,
  PaymentGateway,
  Transaction,
} from '../../modules/revenue/types';

interface RevenueState {
  kpis: RevenueKPIs;
  plans: SubscriptionPlan[];
  invoices: Invoice[];
  gateways: PaymentGateway[];
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
}

// Mock KPIs
const MOCK_KPIS: RevenueKPIs = {
  mrr: 4850000, // ₹48.5L
  arr: 58200000, // ₹5.82Cr
  churnRate: 2.8,
  arpu: 18145, // ₹18,145
  totalRevenue: 4850000,
  growthRate: 23.5,
};

// Mock Subscription Plans
const MOCK_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan-1',
    name: 'Free',
    description: 'Perfect for testing and small libraries',
    price: { monthly: 0, annual: 0 },
    currency: 'INR',
    features: [
      '1 Library',
      'Up to 20 users',
      'Up to 10 seats',
      '1GB storage',
      'Basic analytics',
      'Email support',
    ],
    limits: {
      maxLibraries: 1,
      maxUsers: 20,
      maxSeats: 10,
      storageGB: 1,
    },
    status: 'active',
    subscriberCount: 45,
    isPopular: false,
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
      'Up to 100 users',
      'Up to 50 seats',
      '10GB storage',
      'Advanced analytics',
      'Priority email support',
      'SMS notifications',
    ],
    limits: {
      maxLibraries: 1,
      maxUsers: 100,
      maxSeats: 50,
      storageGB: 10,
    },
    status: 'active',
    subscriberCount: 38,
    isPopular: false,
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
      'Up to 200 seats',
      '50GB storage',
      'Advanced analytics',
      '24/7 phone & email support',
      'SMS + WhatsApp notifications',
      'Mobile app access',
      'API access',
    ],
    limits: {
      maxLibraries: 3,
      maxUsers: -1,
      maxSeats: 200,
      storageGB: 50,
    },
    status: 'active',
    subscriberCount: 32,
    isPopular: true,
    createdAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'plan-4',
    name: 'Enterprise',
    description: 'For large library chains',
    price: { monthly: 24999, annual: 249990 },
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
    ],
    limits: {
      maxLibraries: -1,
      maxUsers: -1,
      maxSeats: -1,
      storageGB: 200,
    },
    status: 'active',
    subscriberCount: 12,
    isPopular: false,
    createdAt: '2023-01-01T00:00:00Z',
  },
];

// Mock Invoices
const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2024-001',
    tenantId: '1',
    tenantName: 'Delhi Central Library',
    amount: 9999,
    currency: 'INR',
    status: 'paid',
    dueDate: '2024-10-31T00:00:00Z',
    paidDate: '2024-10-25T10:30:00Z',
    items: [
      {
        id: 'item-1',
        description: 'Pro Plan - Monthly Subscription',
        quantity: 1,
        unitPrice: 9999,
        amount: 9999,
      },
    ],
    createdAt: '2024-10-01T00:00:00Z',
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2024-002',
    tenantId: '2',
    tenantName: 'Mumbai Study Center',
    amount: 24999,
    currency: 'INR',
    status: 'paid',
    dueDate: '2024-10-31T00:00:00Z',
    paidDate: '2024-10-28T15:45:00Z',
    items: [
      {
        id: 'item-2',
        description: 'Enterprise Plan - Monthly Subscription',
        quantity: 1,
        unitPrice: 24999,
        amount: 24999,
      },
    ],
    createdAt: '2024-10-01T00:00:00Z',
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2024-003',
    tenantId: '3',
    tenantName: 'Bangalore Tech Library',
    amount: 2999,
    currency: 'INR',
    status: 'pending',
    dueDate: '2024-11-05T00:00:00Z',
    items: [
      {
        id: 'item-3',
        description: 'Starter Plan - Monthly Subscription',
        quantity: 1,
        unitPrice: 2999,
        amount: 2999,
      },
    ],
    createdAt: '2024-10-05T00:00:00Z',
  },
  {
    id: 'inv-4',
    invoiceNumber: 'INV-2024-004',
    tenantId: '4',
    tenantName: 'Pune Learning Hub',
    amount: 9999,
    currency: 'INR',
    status: 'overdue',
    dueDate: '2024-10-25T00:00:00Z',
    items: [
      {
        id: 'item-4',
        description: 'Pro Plan - Monthly Subscription',
        quantity: 1,
        unitPrice: 9999,
        amount: 9999,
      },
    ],
    createdAt: '2024-09-25T00:00:00Z',
  },
];

// Mock Payment Gateways
const MOCK_GATEWAYS: PaymentGateway[] = [
  {
    id: 'gw-1',
    name: 'Razorpay',
    type: 'razorpay',
    enabled: true,
    transactionCount: 245,
    totalProcessed: 2450000,
    successRate: 98.5,
    feePercentage: 2.0,
    config: {
      apiKey: 'rzp_test_***********',
      secretKey: '***********',
    },
  },
  {
    id: 'gw-2',
    name: 'UPI',
    type: 'upi',
    enabled: true,
    transactionCount: 180,
    totalProcessed: 1800000,
    successRate: 99.2,
    feePercentage: 0.0,
    config: {},
  },
  {
    id: 'gw-3',
    name: 'PayPal India',
    type: 'paypal',
    enabled: false,
    transactionCount: 15,
    totalProcessed: 150000,
    successRate: 95.0,
    feePercentage: 3.5,
    config: {
      merchantId: 'paypal_***********',
    },
  },
  {
    id: 'gw-4',
    name: 'Net Banking',
    type: 'netbanking',
    enabled: true,
    transactionCount: 95,
    totalProcessed: 950000,
    successRate: 97.8,
    feePercentage: 1.5,
    config: {},
  },
];

const initialState: RevenueState = {
  kpis: MOCK_KPIS,
  plans: MOCK_PLANS,
  invoices: MOCK_INVOICES,
  gateways: MOCK_GATEWAYS,
  transactions: [],
  loading: false,
  error: null,
};

const revenueSlice = createSlice({
  name: 'revenue',
  initialState,
  reducers: {
    setKPIs: (state, action: PayloadAction<RevenueKPIs>) => {
      state.kpis = action.payload;
    },
    setPlans: (state, action: PayloadAction<SubscriptionPlan[]>) => {
      state.plans = action.payload;
    },
    setInvoices: (state, action: PayloadAction<Invoice[]>) => {
      state.invoices = action.payload;
    },
    setGateways: (state, action: PayloadAction<PaymentGateway[]>) => {
      state.gateways = action.payload;
    },
    addInvoice: (state, action: PayloadAction<Invoice>) => {
      state.invoices.unshift(action.payload);
    },
    updateInvoice: (state, action: PayloadAction<Invoice>) => {
      const index = state.invoices.findIndex((inv) => inv.id === action.payload.id);
      if (index !== -1) {
        state.invoices[index] = action.payload;
      }
    },
    removeInvoice: (state, action: PayloadAction<string>) => {
      state.invoices = state.invoices.filter((inv) => inv.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setKPIs,
  setPlans,
  setInvoices,
  setGateways,
  addInvoice,
  updateInvoice,
  removeInvoice,
  setLoading,
  setError,
  clearError,
} = revenueSlice.actions;

export default revenueSlice.reducer;
