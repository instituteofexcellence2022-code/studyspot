/**
 * Revenue Service
 * Handles revenue analytics and management API calls
 */

import { apiService } from './api';

export interface RevenueStats {
  totalRevenue: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  dailyRevenue: number;
  revenueByLibrary: Array<{
    libraryId: string;
    libraryName: string;
    revenue: number;
  }>;
  revenueByPlan: Array<{
    planId: string;
    planName: string;
    revenue: number;
  }>;
  revenueTrend: Array<{
    date: string;
    revenue: number;
  }>;
  topCustomers: Array<{
    userId: string;
    userName: string;
    revenue: number;
  }>;
}

export interface RevenueFilters {
  startDate?: string;
  endDate?: string;
  libraryId?: string;
  planId?: string;
  groupBy?: 'day' | 'week' | 'month';
}

export class RevenueService {
  /**
   * Get revenue statistics
   */
  async getRevenueStats(filters?: RevenueFilters): Promise<RevenueStats> {
    try {
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.libraryId) params.append('libraryId', filters.libraryId);
      if (filters?.planId) params.append('planId', filters.planId);
      if (filters?.groupBy) params.append('groupBy', filters.groupBy);

      const response = await apiService.get<RevenueStats>(
        `/api/v1/analytics/revenue?${params.toString()}`
      );

      return response as RevenueStats;
    } catch (error: any) {
      console.error('❌ [RevenueService] Failed to fetch revenue stats:', error);
      // Return default structure on error
      return {
        totalRevenue: 0,
        monthlyRevenue: 0,
        weeklyRevenue: 0,
        dailyRevenue: 0,
        revenueByLibrary: [],
        revenueByPlan: [],
        revenueTrend: [],
        topCustomers: [],
      };
    }
  }

  /**
   * Get revenue by date range
   */
  async getRevenueByDateRange(startDate: string, endDate: string): Promise<any> {
    try {
      const response = await apiService.get<any>(
        `/api/v1/analytics/revenue/range?startDate=${startDate}&endDate=${endDate}`
      );
      return response;
    } catch (error: any) {
      console.error('❌ [RevenueService] Failed to fetch revenue by date range:', error);
      return { revenue: 0, bookings: 0, transactions: [] };
    }
  }

  /**
   * Get revenue breakdown by library
   */
  async getRevenueByLibrary(libraryId?: string): Promise<any> {
    try {
      const url = libraryId
        ? `/api/v1/analytics/revenue/library/${libraryId}`
        : `/api/v1/analytics/revenue/library`;
      const response = await apiService.get<any>(url);
      return response;
    } catch (error: any) {
      console.error('❌ [RevenueService] Failed to fetch revenue by library:', error);
      return [];
    }
  }

  /**
   * Get revenue breakdown by fee plan
   */
  async getRevenueByPlan(planId?: string): Promise<any> {
    try {
      const url = planId
        ? `/api/v1/analytics/revenue/plan/${planId}`
        : `/api/v1/analytics/revenue/plan`;
      const response = await apiService.get<any>(url);
      return response;
    } catch (error: any) {
      console.error('❌ [RevenueService] Failed to fetch revenue by plan:', error);
      return [];
    }
  }

  /**
   * Get revenue trends
   */
  async getRevenueTrends(period: 'day' | 'week' | 'month' = 'month'): Promise<any> {
    try {
      const response = await apiService.get<any>(
        `/api/v1/analytics/revenue/trends?period=${period}`
      );
      return response;
    } catch (error: any) {
      console.error('❌ [RevenueService] Failed to fetch revenue trends:', error);
      return { trends: [], period };
    }
  }

  /**
   * Get top customers by revenue
   */
  async getTopCustomers(limit: number = 10): Promise<any> {
    try {
      const response = await apiService.get<any>(
        `/api/v1/analytics/revenue/top-customers?limit=${limit}`
      );
      return response;
    } catch (error: any) {
      console.error('❌ [RevenueService] Failed to fetch top customers:', error);
      return [];
    }
  }
}

export const revenueService = new RevenueService();

