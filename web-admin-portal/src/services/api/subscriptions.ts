import { ApiResponse } from '../../types';
import {
  Subscription,
  SubscriptionChange,
  SubscriptionAnalytics,
  PlanComparison,
  SubscriptionDashboardData,
} from '../../modules/subscriptions/types';

// Mock data
const MOCK_SUBSCRIPTIONS: Subscription[] = [];
const MOCK_CHANGES: SubscriptionChange[] = [];
const MOCK_ANALYTICS: SubscriptionAnalytics = {
  mrr: 4850000,
  churnRate: 3.2,
  growthRate: 12.5,
  activeSubscriptions: 267,
  planDistribution: [
    { name: 'Basic', value: 120, color: '#0088FE', planName: 'Basic', count: 120 },
    { name: 'Professional', value: 85, color: '#00C49F', planName: 'Professional', count: 85 },
    { name: 'Enterprise', value: 42, color: '#FFBB28', planName: 'Enterprise', count: 42 },
    { name: 'Premium', value: 20, color: '#FF8042', planName: 'Premium', count: 20 },
  ],
  kpis: {
    totalSubscriptions: 267,
    activeSubscriptions: 250,
    totalMRR: 4850000,
    growthRate: 12.5,
    churnRate: 3.2,
    cancelledSubscriptions: 17,
    retentionRate: 96.8,
    ltv: 288000,
  },
  revenueTrend: [
    { month: 'Jan 2024', revenue: 4200000, mrr: 4200000 },
    { month: 'Feb 2024', revenue: 4350000, mrr: 4350000 },
    { month: 'Mar 2024', revenue: 4500000, mrr: 4500000 },
    { month: 'Apr 2024', revenue: 4600000, mrr: 4600000 },
    { month: 'May 2024', revenue: 4700000, mrr: 4700000 },
    { month: 'Jun 2024', revenue: 4750000, mrr: 4750000 },
    { month: 'Jul 2024', revenue: 4780000, mrr: 4780000 },
    { month: 'Aug 2024', revenue: 4820000, mrr: 4820000 },
    { month: 'Sep 2024', revenue: 4850000, mrr: 4850000 },
    { month: 'Oct 2024', revenue: 4900000, mrr: 4900000 },
  ],
  churnAnalysis: [
    { month: 'Jan 2024', churn: 5, newSubscriptions: 15 },
    { month: 'Feb 2024', churn: 4, newSubscriptions: 18 },
    { month: 'Mar 2024', churn: 6, newSubscriptions: 22 },
    { month: 'Apr 2024', churn: 3, newSubscriptions: 20 },
    { month: 'May 2024', churn: 5, newSubscriptions: 25 },
    { month: 'Jun 2024', churn: 4, newSubscriptions: 23 },
    { month: 'Jul 2024', churn: 6, newSubscriptions: 28 },
    { month: 'Aug 2024', churn: 3, newSubscriptions: 24 },
    { month: 'Sep 2024', churn: 5, newSubscriptions: 30 },
    { month: 'Oct 2024', churn: 4, newSubscriptions: 32 },
  ],
};
const MOCK_DASHBOARD: SubscriptionDashboardData = {
  subscriptions: MOCK_SUBSCRIPTIONS,
  recentChanges: MOCK_CHANGES,
  analytics: MOCK_ANALYTICS,
};

export const subscriptionsService = {
  async getSubscriptions(): Promise<ApiResponse<Subscription[]>> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      success: true,
      data: MOCK_SUBSCRIPTIONS,
    };
  },

  async getDashboardData(): Promise<ApiResponse<SubscriptionDashboardData>> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      success: true,
      data: MOCK_DASHBOARD,
    };
  },

  async getAnalytics(): Promise<ApiResponse<SubscriptionAnalytics>> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      success: true,
      data: MOCK_ANALYTICS,
    };
  },
};

export default subscriptionsService;

