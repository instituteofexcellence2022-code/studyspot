// ============================================
// ANALYTICS REDUX SLICE
// ============================================

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  AnalyticsSummary,
  RevenueData,
  UserGrowthData,
  SubscriptionDistribution,
  Report,
  AnalyticsFilters,
} from '../../modules/analytics/types';

interface AnalyticsState {
  summary: AnalyticsSummary;
  revenueData: RevenueData[];
  userGrowthData: UserGrowthData[];
  subscriptionDistribution: SubscriptionDistribution[];
  reports: Report[];
  filters: AnalyticsFilters;
  loading: boolean;
  error: string | null;
}

// Mock Analytics Summary
const MOCK_SUMMARY: AnalyticsSummary = {
  totalRevenue: 58200000, // ₹5.82Cr
  totalUsers: 267,
  activeSubscriptions: 267,
  averageRevenue: 217977, // ₹2.17L per user
  revenueGrowth: 23.5,
  userGrowth: 15.5,
  subscriptionGrowth: 18.2,
  period: '30d',
};

// Mock Revenue Data (12 months)
const MOCK_REVENUE_DATA: RevenueData[] = [
  { date: '2024-01', revenue: 3200000, transactions: 145, averageValue: 22069 },
  { date: '2024-02', revenue: 3450000, transactions: 158, averageValue: 21835 },
  { date: '2024-03', revenue: 3680000, transactions: 167, averageValue: 22036 },
  { date: '2024-04', revenue: 3920000, transactions: 178, averageValue: 22022 },
  { date: '2024-05', revenue: 4100000, transactions: 189, averageValue: 21693 },
  { date: '2024-06', revenue: 4280000, transactions: 195, averageValue: 21949 },
  { date: '2024-07', revenue: 4450000, transactions: 205, averageValue: 21707 },
  { date: '2024-08', revenue: 4620000, transactions: 215, averageValue: 21488 },
  { date: '2024-09', revenue: 4780000, transactions: 225, averageValue: 21244 },
  { date: '2024-10', revenue: 4850000, transactions: 267, averageValue: 18164 },
];

// Mock User Growth Data
const MOCK_USER_GROWTH: UserGrowthData[] = [
  { date: '2024-05', total: 189, new: 15, active: 178, churned: 3 },
  { date: '2024-06', total: 195, new: 12, active: 185, churned: 2 },
  { date: '2024-07', total: 205, new: 18, active: 198, churned: 5 },
  { date: '2024-08', total: 215, new: 14, active: 207, churned: 4 },
  { date: '2024-09', total: 225, new: 16, active: 218, churned: 3 },
  { date: '2024-10', total: 267, new: 48, active: 255, churned: 6 },
];

// Mock Subscription Distribution
const MOCK_SUBSCRIPTION_DIST: SubscriptionDistribution[] = [
  { plan: 'Free', count: 120, revenue: 0, percentage: 44.9 },
  { plan: 'Starter', count: 89, revenue: 266911, percentage: 33.3 },
  { plan: 'Pro', count: 45, revenue: 449955, percentage: 16.9 },
  { plan: 'Enterprise', count: 13, revenue: 389987, percentage: 4.9 },
];

// Mock Reports
const MOCK_REPORTS: Report[] = [
  {
    id: 'rep-1',
    name: 'Monthly Revenue Report - October 2024',
    type: 'revenue',
    format: 'pdf',
    frequency: 'monthly',
    status: 'generated',
    generatedAt: '2024-10-31T10:00:00Z',
    downloadUrl: '/reports/revenue-oct-2024.pdf',
    size: 2.4,
  },
  {
    id: 'rep-2',
    name: 'User Growth Report - Q3 2024',
    type: 'users',
    format: 'excel',
    frequency: 'custom',
    status: 'generated',
    generatedAt: '2024-10-01T09:00:00Z',
    downloadUrl: '/reports/user-growth-q3-2024.xlsx',
    size: 1.8,
  },
  {
    id: 'rep-3',
    name: 'Subscription Analytics - Weekly',
    type: 'subscriptions',
    format: 'csv',
    frequency: 'weekly',
    status: 'generated',
    generatedAt: '2024-10-28T08:00:00Z',
    downloadUrl: '/reports/subscriptions-week-43.csv',
    size: 0.5,
  },
];

const initialState: AnalyticsState = {
  summary: MOCK_SUMMARY,
  revenueData: MOCK_REVENUE_DATA,
  userGrowthData: MOCK_USER_GROWTH,
  subscriptionDistribution: MOCK_SUBSCRIPTION_DIST,
  reports: MOCK_REPORTS,
  filters: {
    timeRange: '30d',
  },
  loading: false,
  error: null,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setSummary: (state, action: PayloadAction<AnalyticsSummary>) => {
      state.summary = action.payload;
    },
    setRevenueData: (state, action: PayloadAction<RevenueData[]>) => {
      state.revenueData = action.payload;
    },
    setUserGrowthData: (state, action: PayloadAction<UserGrowthData[]>) => {
      state.userGrowthData = action.payload;
    },
    setSubscriptionDistribution: (state, action: PayloadAction<SubscriptionDistribution[]>) => {
      state.subscriptionDistribution = action.payload;
    },
    setReports: (state, action: PayloadAction<Report[]>) => {
      state.reports = action.payload;
    },
    addReport: (state, action: PayloadAction<Report>) => {
      state.reports.unshift(action.payload);
    },
    setFilters: (state, action: PayloadAction<Partial<AnalyticsFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setSummary,
  setRevenueData,
  setUserGrowthData,
  setSubscriptionDistribution,
  setReports,
  addReport,
  setFilters,
  setLoading,
  setError,
} = analyticsSlice.actions;

export default analyticsSlice.reducer;

