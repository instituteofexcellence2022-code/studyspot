/**
 * Revenue & Billing Module Types
 */

export interface RevenueKPIs {
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  churnRate: number;
  arpu: number; // Average Revenue Per User
  totalRevenue: number;
  growthRate: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    annual: number;
  };
  currency: string;
  features: string[];
  limits: {
    maxLibraries: number;
    maxUsers: number;
    maxSeats: number;
    storageGB: number;
  };
  status: 'active' | 'inactive';
  subscriberCount: number;
  isPopular: boolean;
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  tenantId: string;
  tenantName: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled' | 'draft';
  dueDate: string;
  paidDate?: string;
  items: InvoiceItem[];
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface PaymentGateway {
  id: string;
  name: string;
  type: 'razorpay' | 'upi' | 'paypal' | 'netbanking' | 'stripe';
  enabled: boolean;
  transactionCount: number;
  totalProcessed: number;
  successRate: number;
  feePercentage: number;
  config: {
    apiKey?: string;
    secretKey?: string;
    merchantId?: string;
  };
}

export interface Transaction {
  id: string;
  invoiceId: string;
  tenantName: string;
  amount: number;
  currency: string;
  gateway: string;
  status: 'success' | 'pending' | 'failed';
  timestamp: string;
}

export interface DunningCampaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  targetCount: number;
  recoveredCount: number;
  recoveryRate: number;
  emailTemplates: string[];
  createdAt: string;
}
