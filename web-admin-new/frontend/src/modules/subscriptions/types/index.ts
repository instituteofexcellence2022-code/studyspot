/**
 * Subscription Management Module Types
 */

export interface Subscription {
  id: string;
  tenantId: string;
  tenantName: string;
  planId: string;
  planName: string;
  status: 'active' | 'trial' | 'cancelled' | 'expired' | 'past_due';
  billingCycle: 'monthly' | 'annual';
  amount: number;
  currency: string;
  startDate: string;
  endDate: string;
  nextBillingDate?: string;
  cancelledAt?: string;
  trialEndsAt?: string;
  createdAt: string;
}

export interface SubscriptionChange {
  id: string;
  subscriptionId: string;
  tenantId: string;
  tenantName: string;
  changeType: 'upgrade' | 'downgrade' | 'cancel' | 'renewal' | 'reactivate';
  oldPlanName: string;
  newPlanName: string;
  oldAmount: number;
  newAmount: number;
  revenueImpact: number;
  effectiveDate: string;
  timestamp: string;
  reason?: string;
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
    apiCallsPerMonth: number;
  };
  isPopular: boolean;
  status: 'active' | 'archived';
  trialDays: number;
  setupFee: number;
  subscriberCount: number;
  createdAt: string;
}

export interface SubscriptionAnalytics {
  activeSubscriptions: number;
  mrr: number;
  churnRate: number;
  growthRate: number;
  averageLifetime: number;
  lifetimeValue: number;
}

export interface PlanFeature {
  id: string;
  name: string;
  category: string;
  free: boolean;
  starter: boolean;
  pro: boolean;
  enterprise: boolean;
}

