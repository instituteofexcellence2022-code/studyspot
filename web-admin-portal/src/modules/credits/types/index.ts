/**
 * Credit System Types
 * Defines interfaces for credit management, wallets, packages, and usage tracking
 */

/**
 * Credit Wallet - Represents a library's credit balance
 */
export interface CreditWallet {
  id: string;
  tenantId: string;
  tenantName: string;
  smsCredits: number;
  whatsappCredits: number;
  emailCredits: number;
  totalValue: number; // Total value in INR
  lastPurchase: string; // ISO date string
  status: 'active' | 'low' | 'depleted';
  createdAt: string;
  updatedAt: string;
}

/**
 * Credit Package - Pre-defined credit bundles for purchase
 */
export interface CreditPackage {
  id: string;
  name: string;
  description: string;
  smsCredits: number;
  whatsappCredits: number;
  emailCredits: number;
  price: number; // in INR
  originalPrice: number; // in INR (before discount)
  savings: number; // Discount percentage
  popular: boolean;
  features: string[];
  status: 'active' | 'inactive';
  purchaseCount: number;
  revenue: number; // Total revenue generated
  packageType: 'bundle' | 'topup' | 'custom'; // Package category
  customizable: boolean; // Can be used as template for custom plans
  createdAt: string;
  updatedAt: string;
}

/**
 * Custom Credit Plan - Tenant-specific or admin-created custom plans
 */
export interface CustomCreditPlan {
  id: string;
  name: string;
  description?: string;
  creditType: 'sms' | 'whatsapp' | 'email' | 'mixed'; // Single type or mixed
  smsCredits: number;
  whatsappCredits: number;
  emailCredits: number;
  price: number; // Calculated or custom price
  wholesaleCost: number; // Auto-calculated based on credits
  retailValue: number; // Auto-calculated based on credits
  profitMargin: number; // Percentage
  discount: number; // Optional discount percentage
  tenantId?: string; // If created for specific tenant
  tenantName?: string;
  isTemplate: boolean; // Can be used as template for others
  validityDays: number; // How long credits are valid
  status: 'active' | 'inactive' | 'draft';
  createdBy: string; // Admin ID
  createdAt: string;
  updatedAt: string;
}

/**
 * Credit Plan Builder - For creating custom plans
 */
export interface CreditPlanBuilder {
  smsQuantity: number;
  whatsappQuantity: number;
  emailQuantity: number;
  customPrice?: number; // Override calculated price
  discount: number; // Discount percentage
  validityDays: number;
  calculatedWholesaleCost: number;
  calculatedRetailValue: number;
  suggestedPrice: number;
  profitMargin: number;
}

/**
 * Credit Transaction - Records of credit purchases and usage
 */
export interface CreditTransaction {
  id: string;
  tenantId: string;
  tenantName: string;
  type: 'purchase' | 'usage';
  creditType: 'sms' | 'whatsapp' | 'email';
  amount: number; // Credits added or used
  balance: number; // Balance after transaction
  cost?: number; // Cost in INR (for purchases)
  packageId?: string; // Package used (for purchases)
  campaignName?: string; // Campaign name (for usage)
  timestamp: string;
}

/**
 * Usage Statistics - Aggregated usage data
 */
export interface UsageStats {
  type: 'sms' | 'whatsapp' | 'email';
  used: number;
  cost: number; // Total cost in INR
  campaignCount: number;
  avgPerCampaign: number;
}

/**
 * Credit Dashboard Data - Overview metrics for dashboard
 */
export interface CreditDashboardData {
  // Master Wallet (StudySpot's inventory from upstream providers)
  masterWallet: {
    sms: number;
    whatsapp: number;
    email: number;
    wholesaleValue: number; // Cost we paid to upstream
    retailValue: number; // If we sell all at retail price
    potentialProfit: number; // retailValue - wholesaleValue
  };
  // Tenant Wallets (Credits we've sold to library owners)
  tenantWallets: {
    sms: number;
    whatsapp: number;
    email: number;
    totalValue: number; // Retail value (what tenants paid)
  };
  // Unsold Inventory (Credits we own but haven't sold yet)
  unsoldInventory: {
    sms: number;
    whatsapp: number;
    email: number;
    potentialRevenue: number;
  };
  usage: {
    today: UsageStats[];
    thisWeek: UsageStats[];
    thisMonth: UsageStats[];
  };
  topConsumers: {
    tenantId: string;
    tenantName: string;
    smsUsed: number;
    whatsappUsed: number;
    emailUsed: number;
    totalSpent: number;
  }[];
  recentTransactions: CreditTransaction[];
  usageTrend: {
    date: string;
    sms: number;
    whatsapp: number;
    email: number;
  }[];
  alerts: {
    id: string;
    tenantName: string;
    creditType: 'sms' | 'whatsapp' | 'email';
    balance: number;
    threshold: number;
    severity: 'warning' | 'critical';
  }[];
  // Revenue & Profit
  revenue: {
    thisMonth: number; // Total revenue from credit sales
    profit: number; // Revenue - Wholesale cost
    profitMargin: number; // Percentage
  };
  kpis: {
    totalAvailable: number;
    usedLast30Days: number;
    avgDailyBurn: number;
    daysUntilDepletion: number;
  };
}

/**
 * Campaign - Represents a messaging campaign using credits
 */
export interface Campaign {
  id: string;
  name: string;
  type: 'sms' | 'whatsapp' | 'email';
  tenantId: string;
  tenantName: string;
  creditsUsed: number;
  cost: number; // in INR
  recipients: number;
  status: 'completed' | 'in_progress' | 'scheduled';
  startDate: string;
  endDate?: string;
}

/**
 * Peak Usage Time - Hourly usage pattern
 */
export interface PeakUsageTime {
  hour: number; // 0-23
  sms: number;
  whatsapp: number;
  email: number;
}

/**
 * Credit Pricing - Individual credit prices
 */
export interface CreditPricing {
  sms: number; // ₹0.25
  whatsapp: number; // ₹0.15
  email: number; // ₹0.05
}

/**
 * Low Balance Alert Threshold
 */
export interface AlertThreshold {
  sms: number; // e.g., 100 credits
  whatsapp: number; // e.g., 50 credits
  email: number; // e.g., 200 credits
}

/**
 * Package Purchase History
 */
export interface PackagePurchase {
  id: string;
  packageId: string;
  packageName: string;
  tenantId: string;
  tenantName: string;
  price: number;
  smsCredits: number;
  whatsappCredits: number;
  emailCredits: number;
  purchaseDate: string;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'failed';
}

