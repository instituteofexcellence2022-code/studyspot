import { ApiResponse } from '../../types';
import {
  RevenueMetrics,
  RevenueData,
  SubscriptionPlan,
  Invoice,
  PaymentGateway,
  FailedPayment,
  DunningCampaign,
  TopTenant,
  Transaction,
  RevenueByPlan,
  RevenueAnalytics,
} from '../../modules/revenue/types';

// MOCK MODE - Set to true to use mock data
const MOCK_MODE = true;

// ============================================
// MOCK DATA
// ============================================

// Mock Revenue Metrics (in INR - Indian Rupees)
const MOCK_METRICS: RevenueMetrics = {
  mrr: 4850000, // ₹48.5 Lakhs MRR
  arr: 58200000, // ₹5.82 Crores ARR
  churnRate: 3.2,
  ltv: 288000, // ₹2.88 Lakhs average LTV
  arpu: 15000, // ₹15,000 per user per month
  growthRate: 12.5,
  totalRevenue: 58200000,
  newRevenue: 6500000,
  expansionRevenue: 2800000,
  contractionRevenue: 1200000,
};

// Mock Revenue Data (12 months) - in INR
const MOCK_REVENUE_DATA: RevenueData[] = [
  {
    month: 'Jan 2024',
    revenue: 4200000,
    mrr: 4200000,
    newMRR: 800000,
    expansion: 200000,
    contraction: 100000,
    churn: 50000,
  },
  {
    month: 'Feb 2024',
    revenue: 4350000,
    mrr: 4350000,
    newMRR: 650000,
    expansion: 250000,
    contraction: 80000,
    churn: 70000,
  },
  {
    month: 'Mar 2024',
    revenue: 4480000,
    mrr: 4480000,
    newMRR: 700000,
    expansion: 180000,
    contraction: 100000,
    churn: 50000,
  },
  {
    month: 'Apr 2024',
    revenue: 4520000,
    mrr: 4520000,
    newMRR: 550000,
    expansion: 220000,
    contraction: 120000,
    churn: 80000,
  },
  {
    month: 'May 2024',
    revenue: 4600000,
    mrr: 4600000,
    newMRR: 750000,
    expansion: 250000,
    contraction: 90000,
    churn: 60000,
  },
  {
    month: 'Jun 2024',
    revenue: 4680000,
    mrr: 4680000,
    newMRR: 680000,
    expansion: 200000,
    contraction: 100000,
    churn: 70000,
  },
  {
    month: 'Jul 2024',
    revenue: 4720000,
    mrr: 4720000,
    newMRR: 550000,
    expansion: 280000,
    contraction: 110000,
    churn: 50000,
  },
  {
    month: 'Aug 2024',
    revenue: 4760000,
    mrr: 4760000,
    newMRR: 620000,
    expansion: 240000,
    contraction: 100000,
    churn: 60000,
  },
  {
    month: 'Sep 2024',
    revenue: 4800000,
    mrr: 4800000,
    newMRR: 680000,
    expansion: 220000,
    contraction: 80000,
    churn: 40000,
  },
  {
    month: 'Oct 2024',
    revenue: 4850000,
    mrr: 4850000,
    newMRR: 750000,
    expansion: 250000,
    contraction: 100000,
    churn: 50000,
  },
  {
    month: 'Nov 2024',
    revenue: 4920000,
    mrr: 4920000,
    newMRR: 820000,
    expansion: 280000,
    contraction: 90000,
    churn: 40000,
  },
  {
    month: 'Dec 2024',
    revenue: 5000000,
    mrr: 5000000,
    newMRR: 900000,
    expansion: 300000,
    contraction: 100000,
    churn: 50000,
  },
];

// Mock Subscription Plans - StudySpot Library Management Platform (INR)
const MOCK_PLANS: SubscriptionPlan[] = [
  {
    id: '1',
    name: 'Free',
    description: 'Perfect for getting started',
    price: 0,
    currency: '₹',
    billingCycle: 'monthly',
    features: [
      '1 Library Location',
      'Up to 50 Seats',
      'Basic Analytics',
      'Email Support',
      'QR Attendance System',
      'Essential Reports',
    ],
    limits: {
      users: 50,
      storage: 5,
      apiCalls: 1000,
      messagesPerMonth: 100,
    },
    subscribers: 125,
    mrr: 0,
    status: 'active',
    trialDays: 0,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Starter',
    description: 'Perfect for small libraries',
    price: 2999,
    currency: '₹',
    billingCycle: 'monthly',
    features: [
      '2 Library Locations',
      'Up to 200 Seats',
      '5 Staff Members',
      'Advanced Analytics',
      'Priority Support',
      'WhatsApp Integration',
      'Multi-branch Support',
    ],
    limits: {
      users: 200,
      storage: 50,
      apiCalls: 10000,
      messagesPerMonth: 1000,
    },
    subscribers: 85,
    mrr: 254915, // 85 * 2999
    status: 'active',
    trialDays: 14,
    popular: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Professional',
    description: 'Most popular for growing businesses',
    price: 9999,
    currency: '₹',
    billingCycle: 'monthly',
    features: [
      'Unlimited Library Locations',
      'Up to 1000 Seats',
      'Unlimited Staff',
      'AI-powered Analytics',
      'Priority Support',
      'WhatsApp Business API',
      'API Access',
      'Custom Integrations',
      'Advanced Reporting',
    ],
    limits: {
      users: 1000,
      storage: 250,
      apiCalls: 100000,
      messagesPerMonth: 10000,
    },
    subscribers: 45,
    mrr: 449955, // 45 * 9999
    status: 'active',
    trialDays: 30,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'Enterprise',
    description: 'For large organizations',
    price: 24999,
    currency: '₹',
    billingCycle: 'monthly',
    features: [
      'Unlimited Libraries',
      'Unlimited Seats',
      'Unlimited Staff',
      'AI-powered Features',
      '24/7 Dedicated Support',
      'White-label Solution',
      'Full API Access',
      'Custom Development',
      'SLA Guarantee',
      'Custom Domain',
    ],
    limits: {
      users: -1, // unlimited
      storage: -1,
      apiCalls: -1,
      messagesPerMonth: -1,
    },
    subscribers: 12,
    mrr: 299988, // 12 * 24999
    status: 'active',
    trialDays: 30,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// Mock Revenue by Plan (INR)
const MOCK_REVENUE_BY_PLAN: RevenueByPlan[] = [
  {
    name: 'Free',
    value: 0,
    subscribers: 125,
    percentage: 0,
  },
  {
    name: 'Starter',
    value: 254915, // 85 libraries × ₹2,999
    subscribers: 85,
    percentage: 25.2,
  },
  {
    name: 'Professional',
    value: 449955, // 45 libraries × ₹9,999
    subscribers: 45,
    percentage: 44.4,
  },
  {
    name: 'Enterprise',
    value: 299988, // 12 libraries × ₹24,999
    subscribers: 12,
    percentage: 29.6,
  },
  {
    name: 'Credits',
    value: 850000, // Additional revenue from SMS/WhatsApp credits
    subscribers: 267,
    percentage: 0.8, // Credit revenue as % of total
  },
];

// Mock Top Tenants (Libraries) - INR
const MOCK_TOP_TENANTS: TopTenant[] = [
  {
    id: '1',
    name: 'Central Library Mumbai',
    revenue: 32000, // ₹24,999 subscription + ₹7,000 credits
    growth: 15.5,
    plan: 'Enterprise',
  },
  {
    id: '2',
    name: 'Delhi Study Center',
    revenue: 28500, // ₹24,999 + ₹3,500 credits
    growth: 22.3,
    plan: 'Enterprise',
  },
  {
    id: '3',
    name: 'Bangalore Learning Hub',
    revenue: 15000, // ₹9,999 + ₹5,000 credits
    growth: 8.7,
    plan: 'Professional',
  },
  {
    id: '4',
    name: 'Pune Knowledge Center',
    revenue: 13500, // ₹9,999 + ₹3,500 credits
    growth: -3.2,
    plan: 'Professional',
  },
  {
    id: '5',
    name: 'Hyderabad Study Space',
    revenue: 12000, // ₹9,999 + ₹2,000 credits
    growth: 18.9,
    plan: 'Professional',
  },
];

// Mock Invoices (Libraries) - INR
const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv-001',
    invoiceNumber: 'INV-2024-001',
    tenantId: '1',
    tenantName: 'Central Library Mumbai',
    amount: 24999,
    currency: '₹',
    status: 'paid',
    dueDate: '2024-11-15',
    paidDate: '2024-10-28',
    items: [
      {
        id: '1',
        description: 'Enterprise Plan - Monthly Subscription',
        quantity: 1,
        unitPrice: 24999,
        amount: 24999,
      },
    ],
    subtotal: 24999,
    tax: 0,
    discount: 0,
    total: 24999,
    paymentMethod: 'UPI',
    notes: 'Thank you for your business!',
    createdAt: '2024-10-01T00:00:00Z',
    updatedAt: '2024-10-28T10:30:00Z',
  },
  {
    id: 'inv-002',
    invoiceNumber: 'INV-2024-002',
    tenantId: '2',
    tenantName: 'Delhi Study Center',
    amount: 12999,
    currency: '₹',
    status: 'paid',
    dueDate: '2024-11-10',
    paidDate: '2024-10-25',
    items: [
      {
        id: '1',
        description: 'Professional Plan - Monthly Subscription',
        quantity: 1,
        unitPrice: 12999,
        amount: 12999,
      },
    ],
    subtotal: 12999,
    tax: 0,
    discount: 0,
    total: 12999,
    paymentMethod: 'Card',
    notes: 'Payment received',
    createdAt: '2024-10-05T00:00:00Z',
    updatedAt: '2024-10-25T00:00:00Z',
  },
];

// ============================================
// API FUNCTIONS
// ============================================

export const getInvoices = async (): Promise<ApiResponse<Invoice[]>> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  return {
    success: true,
    data: MOCK_INVOICES,
  };
};

export const getRevenueDashboardData = async (): Promise<ApiResponse<any>> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  return {
    success: true,
    data: {
      metrics: MOCK_METRICS,
      trends: MOCK_REVENUE_DATA,
      byPlan: MOCK_REVENUE_BY_PLAN,
      topTenants: MOCK_TOP_TENANTS,
    },
  };
};

export const getInvoice = async (id: string): Promise<ApiResponse<Invoice>> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  const invoice = MOCK_INVOICES.find((inv) => inv.id === id);
  if (!invoice) {
    return {
      success: false,
      error: { code: 'NOT_FOUND', message: 'Invoice not found', statusCode: 404 },
    };
  }
  
  return {
    success: true,
    data: invoice,
  };
};

export const getPaymentGateways = async (): Promise<ApiResponse<PaymentGateway[]>> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  return {
    success: true,
    data: [],
  };
};

export const getPaymentGateway = async (id: string): Promise<ApiResponse<PaymentGateway>> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  return {
    success: false,
    error: { code: 'NOT_FOUND', message: 'Payment gateway not found', statusCode: 404 },
  };
};

// Revenue Analytics
export const getRevenueAnalytics = async (): Promise<ApiResponse<RevenueAnalytics>> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  return {
    success: true,
    data: {
      revenueData: MOCK_REVENUE_DATA,
      revenueByPlan: MOCK_REVENUE_BY_PLAN,
      topTenants: MOCK_TOP_TENANTS,
      metrics: MOCK_METRICS,
      recentTransactions: [],
      cohortData: [],
    },
  };
};

// Subscription Plans
const MOCK_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: '1',
    name: 'Basic',
    description: 'For small libraries',
    price: 2999,
    currency: '₹',
    billingCycle: 'monthly',
    features: ['Basic features', 'Email support'],
    limits: {
      users: 10,
      storage: 10,
      apiCalls: 1000,
      messagesPerMonth: 1000,
    },
    subscribers: 120,
    mrr: 359880,
    status: 'active',
    trialDays: 14,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-10-30T00:00:00Z',
  },
  {
    id: '2',
    name: 'Professional',
    description: 'For medium libraries',
    price: 7999,
    currency: '₹',
    billingCycle: 'monthly',
    features: ['All Basic features', 'Priority support', 'Advanced analytics'],
    limits: {
      users: 50,
      storage: 50,
      apiCalls: 10000,
      messagesPerMonth: 10000,
    },
    subscribers: 85,
    mrr: 679915,
    status: 'active',
    trialDays: 14,
    popular: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-10-30T00:00:00Z',
  },
  {
    id: '3',
    name: 'Enterprise',
    description: 'For large libraries',
    price: 19999,
    currency: '₹',
    billingCycle: 'monthly',
    features: ['All Professional features', 'Dedicated support', 'Custom integrations'],
    limits: {
      users: 200,
      storage: 200,
      apiCalls: 100000,
      messagesPerMonth: 100000,
    },
    subscribers: 42,
    mrr: 839958,
    status: 'active',
    trialDays: 30,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-10-30T00:00:00Z',
  },
  {
    id: '4',
    name: 'Premium',
    description: 'For very large libraries',
    price: 49999,
    currency: '₹',
    billingCycle: 'monthly',
    features: ['All Enterprise features', '24/7 support', 'White-label options'],
    limits: {
      users: 1000,
      storage: 1000,
      apiCalls: 1000000,
      messagesPerMonth: 1000000,
    },
    subscribers: 20,
    mrr: 999980,
    status: 'active',
    trialDays: 30,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-10-30T00:00:00Z',
  },
];

export const getSubscriptionPlans = async (): Promise<ApiResponse<SubscriptionPlan[]>> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  return {
    success: true,
    data: MOCK_SUBSCRIPTION_PLANS,
  };
};

// Revenue Service Object
export const revenueService = {
  getRevenueDashboardData,
  getRevenueAnalytics,
  getSubscriptionPlans,
  getInvoices,
  getInvoice,
  getPaymentGateways,
  getPaymentGateway,
};

export default revenueService;
