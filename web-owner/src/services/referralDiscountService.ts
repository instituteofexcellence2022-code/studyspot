/**
 * Referral & Discount Service
 * Handles all API communication for referral programs, discount coupons, and promotional campaigns
 */

import { apiService } from './api';

export interface ReferralProgram {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  referral_code: string;
  referrer_bonus_type: 'percentage' | 'fixed' | 'credits';
  referrer_bonus_value: number;
  referee_bonus_type: 'percentage' | 'fixed' | 'credits';
  referee_bonus_value: number;
  min_referral_amount: number;
  max_referral_amount?: number;
  validity_days: number;
  max_referrals_per_user: number;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  terms_and_conditions?: string;
  created_at: string;
  updated_at: string;
  total_referrals?: number;
  successful_referrals?: number;
  total_referral_value?: number;
}

export interface Referral {
  id: string;
  tenant_id: string;
  referral_program_id: string;
  referrer_id: string;
  referee_id?: string;
  referral_code: string;
  referee_email?: string;
  referee_phone?: string;
  status: 'pending' | 'registered' | 'completed' | 'expired' | 'cancelled';
  referrer_bonus_amount: number;
  referee_bonus_amount: number;
  referrer_bonus_paid: boolean;
  referee_bonus_paid: boolean;
  first_booking_id?: string;
  total_referral_value: number;
  completed_at?: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
  program_name?: string;
  referrer_bonus_type?: string;
  referrer_bonus_value?: number;
  referee_bonus_type?: string;
  referee_bonus_value?: number;
  referee_first_name?: string;
  referee_last_name?: string;
}

export interface ReferralStats {
  total_referrals: number;
  successful_referrals: number;
  pending_referrals: number;
  total_referral_value: number;
  total_bonus_earned: number;
  paid_bonus: number;
  pending_bonus: number;
}

export interface DiscountCoupon {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  description?: string;
  discount_type: 'percentage' | 'fixed' | 'free_hours';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount?: number;
  usage_limit?: number;
  usage_count: number;
  usage_limit_per_user: number;
  applicable_to: 'all' | 'new_users' | 'existing_users' | 'specific_libraries';
  applicable_libraries?: string[];
  applicable_services: string[];
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  terms_and_conditions?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  remaining_usage?: number;
}

export interface CouponValidation {
  coupon: DiscountCoupon;
  original_amount: number;
  discount_amount: number;
  final_amount: number;
}

export interface CouponUsage {
  id: string;
  tenant_id: string;
  coupon_id: string;
  user_id: string;
  booking_id?: string;
  payment_id?: string;
  discount_amount: number;
  original_amount: number;
  final_amount: number;
  used_at: string;
}

export interface PromotionalCampaign {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  campaign_type: 'referral' | 'discount' | 'loyalty' | 'seasonal' | 'event';
  target_audience: 'all' | 'new_users' | 'existing_users' | 'premium_users' | 'specific_segment';
  target_segment?: Record<string, any>;
  budget?: number;
  spent_amount: number;
  expected_reach?: number;
  actual_reach: number;
  expected_conversions?: number;
  actual_conversions: number;
  conversion_rate: number;
  roi: number;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  start_date?: string;
  end_date?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  created_by_name?: string;
  created_by_last_name?: string;
}

export interface CampaignPerformance {
  id: string;
  tenant_id: string;
  campaign_id: string;
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  cost: number;
  created_at: string;
  campaign_name?: string;
  budget?: number;
  expected_reach?: number;
  expected_conversions?: number;
}

export interface ReferralAnalytics {
  total_referrals: number;
  successful_referrals: number;
  pending_referrals: number;
  total_referral_value: number;
  total_bonus_paid: number;
  avg_referral_value: number;
  unique_referrers: number;
}

export interface DiscountAnalytics {
  total_redemptions: number;
  unique_coupons_used: number;
  unique_users: number;
  total_discount_given: number;
  total_original_amount: number;
  total_final_amount: number;
  avg_discount_per_redemption: number;
}

class ReferralDiscountService {
  private baseUrl = '/api/referral-discount';

  // ============================================
  // REFERRAL PROGRAMS
  // ============================================

  async getReferralPrograms(): Promise<{ data: ReferralProgram[] }> {
    const response = await apiService.get(`${this.baseUrl}/referral-programs`);
    return (response as any).data;
  }

  async createReferralProgram(programData: Partial<ReferralProgram>): Promise<{ data: ReferralProgram }> {
    const response = await apiService.post(`${this.baseUrl}/referral-programs`, programData);
    return (response as any).data;
  }

  async updateReferralProgram(id: string, programData: Partial<ReferralProgram>): Promise<{ data: ReferralProgram }> {
    const response = await apiService.put(`${this.baseUrl}/referral-programs/${id}`, programData);
    return (response as any).data;
  }

  async deleteReferralProgram(id: string): Promise<void> {
    await apiService.delete(`${this.baseUrl}/referral-programs/${id}`);
  }

  // ============================================
  // REFERRALS
  // ============================================

  async createReferral(referralData: {
    referral_code: string;
    referee_email?: string;
    referee_phone?: string;
  }): Promise<{ data: Referral }> {
    const response = await apiService.post(`${this.baseUrl}/referrals`, referralData);
    return (response as any).data;
  }

  async getUserReferrals(userId: string): Promise<{ data: Referral[] }> {
    const response = await apiService.get(`${this.baseUrl}/referrals/user/${userId}`);
    return (response as any).data;
  }

  async getReferralStats(userId: string): Promise<{ data: ReferralStats }> {
    const response = await apiService.get(`${this.baseUrl}/referrals/stats/${userId}`);
    return (response as any).data;
  }

  // ============================================
  // DISCOUNT COUPONS
  // ============================================

  async getDiscountCoupons(filters?: {
    status?: 'active' | 'inactive' | 'all';
    type?: 'percentage' | 'fixed' | 'free_hours';
  }): Promise<{ data: DiscountCoupon[] }> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);
    
    const response = await apiService.get(`${this.baseUrl}/coupons?${params.toString()}`);
    return (response as any).data;
  }

  async createDiscountCoupon(couponData: Partial<DiscountCoupon>): Promise<{ data: DiscountCoupon }> {
    const response = await apiService.post(`${this.baseUrl}/coupons`, couponData);
    return (response as any).data;
  }

  async validateCoupon(validationData: {
    code: string;
    user_id: string;
    amount: number;
    library_id?: string;
  }): Promise<{ data: CouponValidation }> {
    const response = await apiService.post(`${this.baseUrl}/coupons/validate`, validationData);
    return (response as any).data;
  }

  async applyCoupon(applicationData: {
    coupon_id: string;
    user_id: string;
    booking_id?: string;
    payment_id?: string;
    original_amount: number;
    discount_amount: number;
  }): Promise<{ data: CouponUsage }> {
    const response = await apiService.post(`${this.baseUrl}/coupons/apply`, applicationData);
    return (response as any).data;
  }

  // ============================================
  // PROMOTIONAL CAMPAIGNS
  // ============================================

  async getPromotionalCampaigns(filters?: {
    status?: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
    type?: 'referral' | 'discount' | 'loyalty' | 'seasonal' | 'event';
  }): Promise<{ data: PromotionalCampaign[] }> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);
    
    const response = await apiService.get(`${this.baseUrl}/campaigns?${params.toString()}`);
    return (response as any).data;
  }

  async createPromotionalCampaign(campaignData: Partial<PromotionalCampaign>): Promise<{ data: PromotionalCampaign }> {
    const response = await apiService.post(`${this.baseUrl}/campaigns`, campaignData);
    return (response as any).data;
  }

  async getCampaignPerformance(campaignId: string): Promise<{ data: CampaignPerformance[] }> {
    const response = await apiService.get(`${this.baseUrl}/campaigns/${campaignId}/performance`);
    return (response as any).data;
  }

  async updateCampaignPerformance(campaignId: string, performanceData: {
    date: string;
    impressions?: number;
    clicks?: number;
    conversions?: number;
    revenue?: number;
    cost?: number;
  }): Promise<{ data: CampaignPerformance }> {
    const response = await apiService.post(`${this.baseUrl}/campaigns/${campaignId}/performance`, performanceData);
    return (response as any).data;
  }

  // ============================================
  // ANALYTICS
  // ============================================

  async getReferralAnalytics(timeRange?: '7d' | '30d' | '90d' | '1y'): Promise<{ data: ReferralAnalytics }> {
    const params = new URLSearchParams();
    if (timeRange) params.append('timeRange', timeRange);
    
    const response = await apiService.get(`${this.baseUrl}/analytics/referrals?${params.toString()}`);
    return (response as any).data;
  }

  async getDiscountAnalytics(timeRange?: '7d' | '30d' | '90d' | '1y'): Promise<{ data: DiscountAnalytics }> {
    const params = new URLSearchParams();
    if (timeRange) params.append('timeRange', timeRange);
    
    const response = await apiService.get(`${this.baseUrl}/analytics/discounts?${params.toString()}`);
    return (response as any).data;
  }
}

export const referralDiscountService = new ReferralDiscountService();
