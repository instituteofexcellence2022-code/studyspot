/**
 * Credits API Service
 * Handles all credit-related API calls with mock data
 */

import {
  CreditWallet,
  CreditPackage,
  CreditTransaction,
  CreditDashboardData,
  Campaign,
  PeakUsageTime,
  PackagePurchase,
  CustomCreditPlan,
} from '../../modules/credits/types';
import { ApiResponse } from '../../types';

// Mock Mode Toggle
const MOCK_MODE = true;

// Credit Pricing (per unit in INR)
export const CREDIT_PRICING = {
  // Wholesale (what we pay to upstream providers)
  wholesale: {
    sms: 0.15, // MSG91
    whatsapp: 0.10, // Gupshup/Twilio
    email: 0.02, // SendGrid/Amazon SES
  },
  // Retail (what we sell to library owners)
  retail: {
    sms: 0.25,
    whatsapp: 0.15,
    email: 0.05,
  },
  // Markup/Profit per credit
  markup: {
    sms: 0.10, // 67% margin
    whatsapp: 0.05, // 50% margin
    email: 0.03, // 150% margin
  },
};

// Mock Credit Wallets (15 libraries)
const MOCK_WALLETS: CreditWallet[] = [
  {
    id: 'wallet-001',
    tenantId: '1',
    tenantName: 'Central Library Mumbai',
    smsCredits: 5420,
    whatsappCredits: 3210,
    emailCredits: 12850,
    totalValue: 2949.75,
    lastPurchase: '2024-10-20T00:00:00Z',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-10-20T00:00:00Z',
  },
  {
    id: 'wallet-002',
    tenantId: '2',
    tenantName: 'Delhi Knowledge Hub',
    smsCredits: 85,
    whatsappCredits: 42,
    emailCredits: 320,
    totalValue: 53.55,
    lastPurchase: '2024-09-15T00:00:00Z',
    status: 'low',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-10-15T00:00:00Z',
  },
  {
    id: 'wallet-003',
    tenantId: '3',
    tenantName: 'Bangalore Study Center',
    smsCredits: 12500,
    whatsappCredits: 6250,
    emailCredits: 25000,
    totalValue: 5312.50,
    lastPurchase: '2024-10-25T00:00:00Z',
    status: 'active',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-10-25T00:00:00Z',
  },
  {
    id: 'wallet-004',
    tenantId: '4',
    tenantName: 'Pune Knowledge Center',
    smsCredits: 0,
    whatsappCredits: 0,
    emailCredits: 15,
    totalValue: 0.75,
    lastPurchase: '2024-08-10T00:00:00Z',
    status: 'depleted',
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-10-10T00:00:00Z',
  },
  {
    id: 'wallet-005',
    tenantId: '5',
    tenantName: 'Hyderabad Study Space',
    smsCredits: 3200,
    whatsappCredits: 1600,
    emailCredits: 6400,
    totalValue: 1360.00,
    lastPurchase: '2024-10-18T00:00:00Z',
    status: 'active',
    createdAt: '2024-02-15T00:00:00Z',
    updatedAt: '2024-10-18T00:00:00Z',
  },
  {
    id: 'wallet-006',
    tenantId: '6',
    tenantName: 'Chennai Library Network',
    smsCredits: 8500,
    whatsappCredits: 4250,
    emailCredits: 17000,
    totalValue: 3612.50,
    lastPurchase: '2024-10-22T00:00:00Z',
    status: 'active',
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-10-22T00:00:00Z',
  },
  {
    id: 'wallet-007',
    tenantId: '7',
    tenantName: 'Kolkata Library Hub',
    smsCredits: 450,
    whatsappCredits: 225,
    emailCredits: 900,
    totalValue: 191.25,
    lastPurchase: '2024-10-05T00:00:00Z',
    status: 'low',
    createdAt: '2024-03-15T00:00:00Z',
    updatedAt: '2024-10-05T00:00:00Z',
  },
  {
    id: 'wallet-008',
    tenantId: '8',
    tenantName: 'Jaipur Reading Room',
    smsCredits: 15000,
    whatsappCredits: 7500,
    emailCredits: 30000,
    totalValue: 6375.00,
    lastPurchase: '2024-10-28T00:00:00Z',
    status: 'active',
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-10-28T00:00:00Z',
  },
  {
    id: 'wallet-009',
    tenantId: '9',
    tenantName: 'Ahmedabad Study Point',
    smsCredits: 2100,
    whatsappCredits: 1050,
    emailCredits: 4200,
    totalValue: 892.50,
    lastPurchase: '2024-10-12T00:00:00Z',
    status: 'active',
    createdAt: '2024-02-20T00:00:00Z',
    updatedAt: '2024-10-12T00:00:00Z',
  },
  {
    id: 'wallet-010',
    tenantId: '10',
    tenantName: 'Lucknow Learning Center',
    smsCredits: 6800,
    whatsappCredits: 3400,
    emailCredits: 13600,
    totalValue: 2890.00,
    lastPurchase: '2024-10-15T00:00:00Z',
    status: 'active',
    createdAt: '2024-01-25T00:00:00Z',
    updatedAt: '2024-10-15T00:00:00Z',
  },
  {
    id: 'wallet-011',
    tenantId: '11',
    tenantName: 'Indore Study Hub',
    smsCredits: 95,
    whatsappCredits: 48,
    emailCredits: 180,
    totalValue: 40.05,
    lastPurchase: '2024-09-20T00:00:00Z',
    status: 'low',
    createdAt: '2024-04-01T00:00:00Z',
    updatedAt: '2024-10-01T00:00:00Z',
  },
  {
    id: 'wallet-012',
    tenantId: '12',
    tenantName: 'Surat Knowledge Base',
    smsCredits: 4500,
    whatsappCredits: 2250,
    emailCredits: 9000,
    totalValue: 1912.50,
    lastPurchase: '2024-10-10T00:00:00Z',
    status: 'active',
    createdAt: '2024-02-10T00:00:00Z',
    updatedAt: '2024-10-10T00:00:00Z',
  },
  {
    id: 'wallet-013',
    tenantId: '13',
    tenantName: 'Nagpur Library Zone',
    smsCredits: 10200,
    whatsappCredits: 5100,
    emailCredits: 20400,
    totalValue: 4335.00,
    lastPurchase: '2024-10-26T00:00:00Z',
    status: 'active',
    createdAt: '2024-01-30T00:00:00Z',
    updatedAt: '2024-10-26T00:00:00Z',
  },
  {
    id: 'wallet-014',
    tenantId: '14',
    tenantName: 'Visakhapatnam Study Spot',
    smsCredits: 1850,
    whatsappCredits: 925,
    emailCredits: 3700,
    totalValue: 786.25,
    lastPurchase: '2024-10-08T00:00:00Z',
    status: 'active',
    createdAt: '2024-03-05T00:00:00Z',
    updatedAt: '2024-10-08T00:00:00Z',
  },
  {
    id: 'wallet-015',
    tenantId: '15',
    tenantName: 'Bhopal Reading Club',
    smsCredits: 7200,
    whatsappCredits: 3600,
    emailCredits: 14400,
    totalValue: 3060.00,
    lastPurchase: '2024-10-19T00:00:00Z',
    status: 'active',
    createdAt: '2024-02-25T00:00:00Z',
    updatedAt: '2024-10-19T00:00:00Z',
  },
];

// Mock Credit Packages (3 Top-Ups + 4 Packages = 7 total)
const MOCK_PACKAGES: CreditPackage[] = [
  // Top-Up Plans (Small, Instant, No Discount)
  {
    id: 'topup-micro',
    name: 'Micro Top-Up',
    description: 'Perfect for testing and emergency needs',
    smsCredits: 100,
    whatsappCredits: 50,
    emailCredits: 200,
    price: 49,
    originalPrice: 49,
    savings: 0,
    popular: false,
    packageType: 'topup',
    customizable: true,
    features: [
      '100 SMS credits',
      '50 WhatsApp credits',
      '200 Email credits',
      'Instant activation',
      'No expiry',
      'Perfect for testing',
    ],
    status: 'active',
    purchaseCount: 142,
    revenue: 6958,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-10-30T00:00:00Z',
  },
  {
    id: 'topup-mini',
    name: 'Mini Top-Up',
    description: 'Great for small libraries with irregular usage',
    smsCredits: 250,
    whatsappCredits: 125,
    emailCredits: 500,
    price: 99,
    originalPrice: 99,
    savings: 0,
    popular: true,
    packageType: 'topup',
    customizable: true,
    features: [
      '250 SMS credits',
      '125 WhatsApp credits',
      '500 Email credits',
      'Instant activation',
      'Valid for 90 days',
      'Most popular top-up',
    ],
    status: 'active',
    purchaseCount: 267,
    revenue: 26433,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-10-30T00:00:00Z',
  },
  {
    id: 'topup-quick',
    name: 'Quick Top-Up',
    description: 'Best for regular monthly top-ups',
    smsCredits: 500,
    whatsappCredits: 250,
    emailCredits: 1000,
    price: 199,
    originalPrice: 199,
    savings: 0,
    popular: false,
    packageType: 'topup',
    customizable: true,
    features: [
      '500 SMS credits',
      '250 WhatsApp credits',
      '1,000 Email credits',
      'Instant activation',
      'Valid for 180 days',
      'Great value for money',
    ],
    status: 'active',
    purchaseCount: 189,
    revenue: 37611,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-10-30T00:00:00Z',
  },
  // Regular Packages (Bulk with Discounts)
  {
    id: 'pkg-starter',
    name: 'Starter Pack',
    packageType: 'bundle',
    customizable: false,
    description: 'Perfect for small libraries getting started',
    smsCredits: 1000,
    whatsappCredits: 500,
    emailCredits: 2000,
    price: 449,
    originalPrice: 499,
    savings: 10,
    popular: false,
    features: [
      '1,000 SMS credits',
      '500 WhatsApp credits',
      '2,000 Email credits',
      'Valid for 90 days',
      'Basic support',
    ],
    status: 'active',
    purchaseCount: 85,
    revenue: 38165,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-10-30T00:00:00Z',
  },
  {
    id: 'pkg-growth',
    name: 'Growth Pack',
    packageType: 'bundle',
    customizable: false,
    description: 'Most popular for growing libraries',
    smsCredits: 5000,
    whatsappCredits: 2500,
    emailCredits: 10000,
    price: 1599,
    originalPrice: 1999,
    savings: 20,
    popular: true,
    features: [
      '5,000 SMS credits',
      '2,500 WhatsApp credits',
      '10,000 Email credits',
      'Valid for 180 days',
      'Priority support',
      '20% savings',
    ],
    status: 'active',
    purchaseCount: 142,
    revenue: 227058,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-10-30T00:00:00Z',
  },
  {
    id: 'pkg-business',
    name: 'Business Pack',
    packageType: 'bundle',
    customizable: false,
    description: 'For established libraries with high volume',
    smsCredits: 15000,
    whatsappCredits: 7500,
    emailCredits: 30000,
    price: 3499,
    originalPrice: 4999,
    savings: 30,
    popular: false,
    features: [
      '15,000 SMS credits',
      '7,500 WhatsApp credits',
      '30,000 Email credits',
      'Valid for 365 days',
      'Dedicated support',
      '30% savings',
      'Custom integrations',
    ],
    status: 'active',
    purchaseCount: 58,
    revenue: 202942,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-10-30T00:00:00Z',
  },
  {
    id: 'custom-plan-7',
    tenantId: 'tenant-7',
    tenantName: 'Study Center Pro',
    name: 'Premium Communication Pack',
    smsCredits: 8000,
    whatsappCredits: 3000,
    emailCredits: 10000,
    price: 15000,
    status: 'active',
    createdAt: '2024-09-01T00:00:00Z',
    updatedAt: '2024-10-25T00:00:00Z',
  },
];

// API Methods
export const creditService = {
  async getDashboardData(): Promise<ApiResponse<CreditDashboardData>> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    return {
      success: true,
      data: MOCK_DASHBOARD_DATA,
    };
  },

  async getPackages(): Promise<ApiResponse<CreditPackage[]>> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    return {
      success: true,
      data: MOCK_PACKAGES,
    };
  },

  async getWallets(): Promise<ApiResponse<CreditWallet[]>> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    return {
      success: true,
      data: MOCK_WALLETS,
    };
  },

  async getCustomPlans(): Promise<ApiResponse<CustomCreditPlan[]>> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    return {
      success: true,
      data: MOCK_CUSTOM_PLANS,
    };
  },

  async getCustomPlansByType(type: 'sms' | 'whatsapp' | 'email'): Promise<ApiResponse<CustomCreditPlan[]>> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    const filtered = MOCK_CUSTOM_PLANS.filter(plan => {
      if (type === 'sms') return plan.smsCredits > 0;
      if (type === 'whatsapp') return plan.whatsappCredits > 0;
      if (type === 'email') return plan.emailCredits > 0;
      return false;
    });
    
    return {
      success: true,
      data: filtered,
    };
  },

  async getCustomPlansForTenant(tenantId: string): Promise<ApiResponse<CustomCreditPlan[]>> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    const filtered = MOCK_CUSTOM_PLANS.filter(plan => plan.tenantId === tenantId);
    
    return {
      success: true,
      data: filtered,
    };
  },

  async calculateCustomPlanPrice(
    smsCredits: number,
    whatsappCredits: number,
    emailCredits: number
  ): Promise<ApiResponse<{ totalPrice: number; breakdown: any }>> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    
    const smsPrice = smsCredits * CREDIT_PRICING.sms.retail;
    const whatsappPrice = whatsappCredits * CREDIT_PRICING.whatsapp.retail;
    const emailPrice = emailCredits * CREDIT_PRICING.email.retail;
    const totalPrice = smsPrice + whatsappPrice + emailPrice;
    
    return {
      success: true,
      data: {
        totalPrice,
        breakdown: {
          sms: { credits: smsCredits, price: smsPrice },
          whatsapp: { credits: whatsappCredits, price: whatsappPrice },
          email: { credits: emailCredits, price: emailPrice },
        },
      },
    };
  },
};

export default creditService;
