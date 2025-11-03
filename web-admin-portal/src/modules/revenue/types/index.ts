// Revenue Module Types

export interface RevenueMetrics {
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  churnRate: number; // Percentage
  ltv: number; // Customer Lifetime Value
  arpu: number; // Average Revenue Per User
  growthRate: number; // Percentage
  totalRevenue: number;
  newRevenue: number;
  expansionRevenue: number;
  contractionRevenue: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
  mrr: number;
  newMRR: number;
  expansion: number;
  contraction: number;
  churn: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'annual';
  features: string[];
  limits: {
    users: number;
    storage: number; // GB
    apiCalls: number;
    messagesPerMonth: number;
  };
  subscribers: number;
  mrr: number;
  status: 'active' | 'archived';
  trialDays: number;
  popular?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  tenantId: string;
  tenantName: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'overdue' | 'failed' | 'void';
  dueDate: string;
  paidDate?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentGateway {
  id: string;
  name: string;
  type: 'stripe' | 'paypal' | 'bank_transfer' | 'credit_card';
  status: 'active' | 'inactive' | 'testing';
  mode: 'test' | 'production';
  apiKey: string;
  webhookUrl: string;
  currency: string;
  transactionFee: number; // Percentage
  successRate: number; // Percentage
  totalProcessed: number;
  failedTransactions: number;
  transactionCount?: number;
  lastTransaction?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FailedPayment {
  id: string;
  tenantId: string;
  tenantName: string;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  failureReason: string;
  retryAttempts: number;
  maxRetries: number;
  status: 'recovering' | 'resolved' | 'lost';
  nextRetryDate?: string;
  dunningCampaignId?: string;
  lastAttemptDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface DunningEmail {
  day: number;
  subject: string;
  template: string;
}

export interface DunningCampaign {
  id: string;
  name: string;
  description: string;
  trigger: 'payment_failed' | 'subscription_expired' | 'trial_ended';
  emailSequence: DunningEmail[];
  retrySchedule: number[]; // days
  maxRetries: number;
  gracePeriod: number; // days
  suspensionRule: 'immediate' | 'after_grace' | 'manual';
  successRate: number; // Percentage
  activeCount: number;
  resolvedCount: number;
  lostCount: number;
  emailsSent?: number;
  amountRecovered?: number;
  status: 'active' | 'paused' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface TopTenant {
  id: string;
  name: string;
  revenue: number;
  growth: number; // Percentage
  plan: string;
}

export interface Transaction {
  id: string;
  tenantId: string;
  tenantName: string;
  amount: number;
  type: 'subscription' | 'one_time' | 'credit_purchase' | 'refund';
  status: 'completed' | 'pending' | 'failed';
  date: string;
  paymentMethod: string;
}

export interface RevenueByPlan {
  name: string;
  value: number;
  subscribers: number;
  percentage: number;
}

export interface CohortData {
  cohort: string;
  month0: number;
  month1: number;
  month2: number;
  month3: number;
  month4: number;
  month5: number;
  month6: number;
}

export interface RevenueAnalytics {
  metrics: RevenueMetrics;
  revenueData: RevenueData[];
  revenueByPlan: RevenueByPlan[];
  topTenants: TopTenant[];
  recentTransactions: Transaction[];
  cohortData: CohortData[];
}

