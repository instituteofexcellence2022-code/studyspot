export interface Subscription {
  id: string;
  tenantId: string;
  tenantName: string;
  planId: string;
  planName: string;
  status: 'active' | 'trial' | 'expired' | 'cancelled' | 'paused';
  startDate: string;
  endDate?: string;
  trialEndDate?: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'annual';
  autoRenew: boolean;
  seats?: number;
  usedSeats?: number;
  mrr?: number;
  arr?: number;
  nextBillingDate?: string;
  daysUntilRenewal?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionChange {
  id: string;
  subscriptionId: string;
  tenantId: string;
  tenantName: string;
  type: 'upgrade' | 'downgrade' | 'cancellation' | 'pause' | 'reactivation';
  changeType?: string; // Alias for type
  fromPlan: string;
  toPlan: string;
  oldPlan?: string; // Alias for fromPlan
  newPlan?: string; // Alias for toPlan
  oldPrice?: number;
  newPrice?: number;
  priceDifference?: number;
  status: 'pending' | 'completed' | 'failed';
  effectiveDate: string;
  requestedDate?: string;
  reason?: string;
  createdAt: string;
}

export interface SubscriptionAnalytics {
  mrr: number;
  churnRate: number;
  growthRate: number;
  activeSubscriptions: number;
  planDistribution: Array<{
    name: string;
    value: number;
    color: string;
    planName?: string;
    count?: number;
  }>;
  kpis: {
    totalSubscriptions: number;
    activeSubscriptions: number;
    totalMRR: number;
    growthRate: number;
    churnRate: number;
    cancelledSubscriptions: number;
    retentionRate?: number;
    ltv?: number;
  };
  revenueTrend?: Array<{
    month: string;
    revenue: number;
    mrr: number;
  }>;
  churnAnalysis?: Array<{
    month: string;
    churn: number;
    newSubscriptions: number;
  }>;
}

export interface PlanComparison {
  planId?: string;
  planName?: string;
  price?: number;
  billingCycle?: string;
  popular?: boolean;
  activeSubscriptions?: number;
  totalRevenue?: number;
  limits?: {
    libraries?: number | string;
    students?: number | string;
    staff?: number | string;
    storage?: number | string;
    smsCredits?: number;
    whatsappCredits?: number;
    emailCredits?: number;
  };
  feature?: string;
  basic?: boolean | string;
  professional?: boolean | string;
  enterprise?: boolean | string;
  premium?: boolean | string;
}

export interface SubscriptionDashboardData {
  subscriptions: Subscription[];
  recentChanges: SubscriptionChange[];
  analytics: SubscriptionAnalytics;
  planComparisons?: PlanComparison[];
}

