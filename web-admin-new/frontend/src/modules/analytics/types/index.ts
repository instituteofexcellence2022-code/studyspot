/**
 * Analytics & Business Intelligence Module Types
 */

export interface AnalyticsSummary {
  totalRevenue: number;
  totalUsers: number;
  activeSubscriptions: number;
  averageRevenue: number;
  revenueGrowth: number;
  userGrowth: number;
  subscriptionGrowth: number;
  period: string;
}

export interface RevenueData {
  date: string;
  revenue: number;
  transactions: number;
  averageValue: number;
}

export interface UserGrowthData {
  date: string;
  total: number;
  new: number;
  active: number;
  churned: number;
}

export interface SubscriptionDistribution {
  plan: string;
  count: number;
  revenue: number;
  percentage: number;
}

export interface RegionalData {
  region: string;
  users: number;
  revenue: number;
  growth: number;
}

export interface TimeSeriesData {
  timestamp: string;
  value: number;
  label?: string;
}

export interface Report {
  id: string;
  name: string;
  type: 'revenue' | 'users' | 'subscriptions' | 'payments' | 'custom';
  format: 'pdf' | 'csv' | 'excel';
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  status: 'generated' | 'generating' | 'failed';
  generatedAt: string;
  downloadUrl?: string;
  size?: number;
}

export type TimeRange = '7d' | '30d' | '90d' | '1y' | 'all' | 'custom';

export interface AnalyticsFilters {
  timeRange: TimeRange;
  startDate?: string;
  endDate?: string;
  region?: string;
  plan?: string;
}

