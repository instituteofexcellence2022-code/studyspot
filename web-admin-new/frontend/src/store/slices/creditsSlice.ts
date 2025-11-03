// ============================================
// CREDITS & MESSAGING REDUX SLICE
// ============================================

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  MasterWallet,
  TenantWallet,
  CreditPackage,
  CustomPlan,
  CreditTransaction,
} from '../../modules/credits/types';

interface CreditsState {
  masterWallet: MasterWallet;
  tenantWallets: TenantWallet[];
  packages: CreditPackage[];
  customPlans: CustomPlan[];
  transactions: CreditTransaction[];
  loading: boolean;
  error: string | null;
}

// Mock Master Wallet
const MOCK_MASTER_WALLET: MasterWallet = {
  totalCredits: 10000000,
  smsCredits: 5000000,
  whatsappCredits: 3000000,
  emailCredits: 2000000,
  wholesaleValue: 450000, // ₹4.5L
  retailValue: 650000, // ₹6.5L
  potentialProfit: 200000, // ₹2L
  lastUpdated: '2024-10-31T10:00:00Z',
};

// Mock Tenant Wallets
const MOCK_TENANT_WALLETS: TenantWallet[] = [
  {
    id: 'tw-1',
    tenantId: '1',
    tenantName: 'Delhi Central Library',
    smsBalance: 5000,
    whatsappBalance: 3000,
    emailBalance: 2000,
    totalBalance: 10000,
    status: 'active',
    lastTopUp: '2024-10-25T10:00:00Z',
    monthlyUsage: 8500,
    plan: 'Professional',
  },
  {
    id: 'tw-2',
    tenantId: '2',
    tenantName: 'Mumbai Study Center',
    smsBalance: 15000,
    whatsappBalance: 10000,
    emailBalance: 5000,
    totalBalance: 30000,
    status: 'active',
    lastTopUp: '2024-10-28T14:30:00Z',
    monthlyUsage: 25000,
    plan: 'Enterprise',
  },
  {
    id: 'tw-3',
    tenantId: '3',
    tenantName: 'Bangalore Tech Library',
    smsBalance: 500,
    whatsappBalance: 200,
    emailBalance: 100,
    totalBalance: 800,
    status: 'critical',
    lastTopUp: '2024-09-15T09:00:00Z',
    monthlyUsage: 7200,
    plan: 'Standard',
  },
  {
    id: 'tw-4',
    tenantId: '4',
    tenantName: 'Pune Learning Hub',
    smsBalance: 2000,
    whatsappBalance: 1500,
    emailBalance: 1000,
    totalBalance: 4500,
    status: 'low',
    lastTopUp: '2024-10-20T11:00:00Z',
    monthlyUsage: 4200,
    plan: 'Basic',
  },
];

// Mock Credit Packages
const MOCK_PACKAGES: CreditPackage[] = [
  {
    id: 'pkg-1',
    name: 'Starter Pack',
    description: 'Perfect for small libraries',
    type: 'bulk',
    credits: { sms: 1000, whatsapp: 500, email: 500 },
    pricing: {
      wholesaleCost: 900,
      retailPrice: 1499,
      profitMargin: 39.9,
    },
    validityDays: 30,
    isPopular: false,
    savings: '₹100',
  },
  {
    id: 'pkg-2',
    name: 'Basic Pack',
    description: 'Great for growing libraries',
    type: 'bulk',
    credits: { sms: 5000, whatsapp: 3000, email: 2000 },
    pricing: {
      wholesaleCost: 4000,
      retailPrice: 6999,
      profitMargin: 42.8,
    },
    validityDays: 60,
    isPopular: false,
    savings: '₹500',
  },
  {
    id: 'pkg-3',
    name: 'Standard Pack',
    description: 'Most popular choice',
    type: 'bulk',
    credits: { sms: 10000, whatsapp: 6000, email: 4000 },
    pricing: {
      wholesaleCost: 7500,
      retailPrice: 12999,
      profitMargin: 42.3,
    },
    validityDays: 90,
    isPopular: true,
    savings: '₹1,500',
  },
  {
    id: 'pkg-4',
    name: 'Professional Pack',
    description: 'For established libraries',
    type: 'bulk',
    credits: { sms: 25000, whatsapp: 15000, email: 10000 },
    pricing: {
      wholesaleCost: 17500,
      retailPrice: 29999,
      profitMargin: 41.6,
    },
    validityDays: 120,
    isPopular: false,
    savings: '₹5,000',
  },
  {
    id: 'pkg-5',
    name: 'Enterprise Pack',
    description: 'For large library chains',
    type: 'bulk',
    credits: { sms: 50000, whatsapp: 30000, email: 20000 },
    pricing: {
      wholesaleCost: 32000,
      retailPrice: 54999,
      profitMargin: 41.8,
    },
    validityDays: 180,
    isPopular: false,
    savings: '₹15,000',
  },
  {
    id: 'pkg-6',
    name: 'Ultimate Pack',
    description: 'Maximum value',
    type: 'bulk',
    credits: { sms: 100000, whatsapp: 60000, email: 40000 },
    pricing: {
      wholesaleCost: 60000,
      retailPrice: 99999,
      profitMargin: 40.0,
    },
    validityDays: 365,
    isPopular: false,
    savings: '₹40,000',
  },
  {
    id: 'pkg-7',
    name: 'Micro Top-up',
    description: 'Quick small top-up',
    type: 'topup',
    credits: { sms: 100, whatsapp: 50, email: 50 },
    pricing: {
      wholesaleCost: 90,
      retailPrice: 199,
      profitMargin: 54.8,
    },
    validityDays: 7,
    isPopular: false,
  },
  {
    id: 'pkg-8',
    name: 'Mini Top-up',
    description: 'Small emergency top-up',
    type: 'topup',
    credits: { sms: 500, whatsapp: 300, email: 200 },
    pricing: {
      wholesaleCost: 450,
      retailPrice: 899,
      profitMargin: 49.9,
    },
    validityDays: 15,
    isPopular: false,
  },
  {
    id: 'pkg-9',
    name: 'Quick Top-up',
    description: 'Fast top-up',
    type: 'topup',
    credits: { sms: 1000, whatsapp: 600, email: 400 },
    pricing: {
      wholesaleCost: 900,
      retailPrice: 1699,
      profitMargin: 47.0,
    },
    validityDays: 30,
    isPopular: true,
  },
];

// Mock Custom Plans
const MOCK_CUSTOM_PLANS: CustomPlan[] = [
  {
    id: 'cp-1',
    name: 'SMS Heavy Plan',
    description: 'Custom plan for SMS-focused campaigns',
    tenantId: '1',
    tenantName: 'Delhi Central Library',
    planType: 'sms-only',
    credits: { sms: 20000, whatsapp: 0, email: 0 },
    pricing: { cost: 9000, price: 14999, profit: 5999 },
    validityDays: 90,
    createdAt: '2024-09-15T00:00:00Z',
    isActive: true,
  },
  {
    id: 'cp-2',
    name: 'WhatsApp Premium',
    description: 'WhatsApp-only custom package',
    tenantId: '2',
    tenantName: 'Mumbai Study Center',
    planType: 'whatsapp-only',
    credits: { sms: 0, whatsapp: 15000, email: 0 },
    pricing: { cost: 11000, price: 17999, profit: 6999 },
    validityDays: 120,
    createdAt: '2024-09-20T00:00:00Z',
    isActive: true,
  },
];

const initialState: CreditsState = {
  masterWallet: MOCK_MASTER_WALLET,
  tenantWallets: MOCK_TENANT_WALLETS,
  packages: MOCK_PACKAGES,
  customPlans: MOCK_CUSTOM_PLANS,
  transactions: [],
  loading: false,
  error: null,
};

const creditsSlice = createSlice({
  name: 'credits',
  initialState,
  reducers: {
    setMasterWallet: (state, action: PayloadAction<MasterWallet>) => {
      state.masterWallet = action.payload;
    },
    setTenantWallets: (state, action: PayloadAction<TenantWallet[]>) => {
      state.tenantWallets = action.payload;
    },
    updateTenantWallet: (state, action: PayloadAction<TenantWallet>) => {
      const index = state.tenantWallets.findIndex((w) => w.id === action.payload.id);
      if (index !== -1) {
        state.tenantWallets[index] = action.payload;
      }
    },
    setPackages: (state, action: PayloadAction<CreditPackage[]>) => {
      state.packages = action.payload;
    },
    addCustomPlan: (state, action: PayloadAction<CustomPlan>) => {
      state.customPlans.unshift(action.payload);
    },
    updateCustomPlan: (state, action: PayloadAction<CustomPlan>) => {
      const index = state.customPlans.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.customPlans[index] = action.payload;
      }
    },
    removeCustomPlan: (state, action: PayloadAction<string>) => {
      state.customPlans = state.customPlans.filter((p) => p.id !== action.payload);
    },
    addTransaction: (state, action: PayloadAction<CreditTransaction>) => {
      state.transactions.unshift(action.payload);
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
  setMasterWallet,
  setTenantWallets,
  updateTenantWallet,
  setPackages,
  addCustomPlan,
  updateCustomPlan,
  removeCustomPlan,
  addTransaction,
  setLoading,
  setError,
} = creditsSlice.actions;

export default creditsSlice.reducer;

