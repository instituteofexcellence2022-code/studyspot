/**
 * Credits & Messaging Management Module Types
 */

export interface MasterWallet {
  totalCredits: number;
  smsCredits: number;
  whatsappCredits: number;
  emailCredits: number;
  wholesaleValue: number;
  retailValue: number;
  potentialProfit: number;
  lastUpdated: string;
}

export interface TenantWallet {
  id: string;
  tenantId: string;
  tenantName: string;
  smsBalance: number;
  whatsappBalance: number;
  emailBalance: number;
  totalBalance: number;
  status: 'active' | 'low' | 'critical' | 'inactive';
  lastTopUp: string;
  monthlyUsage: number;
  plan?: string;
}

export interface CreditPackage {
  id: string;
  name: string;
  description: string;
  type: 'bulk' | 'topup';
  credits: {
    sms: number;
    whatsapp: number;
    email: number;
  };
  pricing: {
    wholesaleCost: number;
    retailPrice: number;
    profitMargin: number;
  };
  validityDays: number;
  isPopular: boolean;
  savings?: string;
}

export interface CustomPlan {
  id: string;
  name: string;
  description: string;
  tenantId?: string;
  tenantName?: string;
  planType: 'sms-only' | 'whatsapp-only' | 'email-only' | 'mixed';
  credits: {
    sms: number;
    whatsapp: number;
    email: number;
  };
  pricing: {
    cost: number;
    price: number;
    profit: number;
  };
  validityDays: number;
  createdAt: string;
  isActive: boolean;
}

export interface CreditTransaction {
  id: string;
  tenantId: string;
  tenantName: string;
  type: 'topup' | 'usage' | 'refund' | 'adjustment';
  credits: {
    sms?: number;
    whatsapp?: number;
    email?: number;
  };
  amount?: number;
  balanceBefore: number;
  balanceAfter: number;
  timestamp: string;
  description: string;
  packageName?: string;
}

export interface CreditUsageStats {
  period: string;
  smsUsed: number;
  whatsappUsed: number;
  emailUsed: number;
  totalUsed: number;
  totalSpent: number;
}

