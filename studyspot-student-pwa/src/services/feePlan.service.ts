/**
 * 📋 FEE PLAN SERVICE
 * 
 * Fetches fee plans from library
 */

import api from './api';
import { FeePlan } from '../types/feePlan';

export const feePlanService = {
  /**
   * Get all fee plans for a library
   */
  async getLibraryFeePlans(libraryId: string): Promise<FeePlan[]> {
    try {
      const response = await api.get(`/api/libraries/${libraryId}/fee-plans`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching fee plans:', error);
      // Return mock data for development
      return getMockFeePlans();
    }
  },

  /**
   * Get active fee plans for booking
   */
  async getActiveFeePlans(libraryId: string): Promise<FeePlan[]> {
    try {
      const plans = await this.getLibraryFeePlans(libraryId);
      return plans.filter(plan => plan.status === 'active');
    } catch (error) {
      return getMockFeePlans().filter(plan => plan.status === 'active');
    }
  },

  /**
   * Get fee plan by ID
   */
  async getFeePlanById(libraryId: string, planId: string): Promise<FeePlan | null> {
    try {
      const response = await api.get(`/api/libraries/${libraryId}/fee-plans/${planId}`);
      return response.data.data || null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Calculate price for booking
   */
  calculatePrice(plan: FeePlan, seats: number, shift?: string, zone?: string): number {
    let price = plan.basePrice;

    // Apply shift pricing if available
    if (shift && plan.shiftPricing) {
      const shiftPrice = plan.shiftPricing[shift as keyof typeof plan.shiftPricing];
      if (shiftPrice) price = shiftPrice;
    }

    // Apply zone pricing if available
    if (zone && plan.zonePricing) {
      const zonePrice = plan.zonePricing[zone as keyof typeof plan.zonePricing];
      if (zonePrice) price = zonePrice;
    }

    // Apply discount if applicable
    if (plan.discount && isDiscountValid(plan.discount)) {
      if (plan.discount.type === 'percentage') {
        price = price - (price * plan.discount.value / 100);
      } else {
        price = price - plan.discount.value;
      }
    }

    return price * seats;
  },
};

/**
 * Check if discount is currently valid
 */
function isDiscountValid(discount: FeePlan['discount']): boolean {
  if (!discount) return false;
  
  const now = new Date();
  const validFrom = discount.validFrom ? new Date(discount.validFrom) : null;
  const validTo = discount.validTo ? new Date(discount.validTo) : null;
  
  if (validFrom && now < validFrom) return false;
  if (validTo && now > validTo) return false;
  
  return true;
}

/**
 * Mock fee plans for development
 */
function getMockFeePlans(): FeePlan[] {
  return [
    {
      id: '1',
      name: 'Daily Pass',
      description: 'Perfect for full-day study sessions with all amenities',
      type: 'daily',
      basePrice: 300,
      shift: 'morning',
      shiftPricing: {
        morning: 150,
        afternoon: 150,
        evening: 100,
      },
      zone: 'ac',
      zonePricing: {
        ac: 300,
        nonAc: 200,
      },
      features: ['WiFi', 'Power Outlet', 'Locker', 'Printing'],
      maxSeats: undefined,
      maxHours: 24,
      scholarshipEligible: true,
      waiverAllowed: true,
      status: 'active',
      isPopular: true,
      discount: {
        type: 'percentage',
        value: 10,
        validFrom: '2024-11-01',
        validTo: '2024-11-30',
      },
    },
    {
      id: '2',
      name: 'Monthly Elite',
      description: 'Most popular! Complete monthly access with premium features',
      type: 'monthly',
      basePrice: 4000,
      features: ['WiFi', 'Power Outlet', 'Locker', 'Printing', 'Premium Support', 'Priority Booking'],
      maxSeats: undefined,
      maxHours: undefined,
      scholarshipEligible: true,
      waiverAllowed: true,
      status: 'active',
      isPopular: true,
      discount: {
        type: 'percentage',
        value: 15,
        validFrom: '2024-11-01',
        validTo: '2024-12-31',
      },
    },
    {
      id: '3',
      name: 'Weekly Premium',
      description: 'Great for regular study routines with all amenities',
      type: 'weekly',
      basePrice: 1200,
      features: ['WiFi', 'Power Outlet', 'Locker', 'Printing', 'Premium Support'],
      maxSeats: undefined,
      maxHours: undefined,
      scholarshipEligible: true,
      waiverAllowed: true,
      status: 'active',
      isPopular: false,
    },
    {
      id: '4',
      name: 'Hourly Flex',
      description: 'Flexible hourly booking for short study sessions',
      type: 'hourly',
      basePrice: 50,
      features: ['WiFi', 'Power Outlet'],
      maxSeats: undefined,
      maxHours: 8,
      scholarshipEligible: true,
      waiverAllowed: false,
      status: 'active',
      isPopular: false,
    },
  ];
}

export default feePlanService;

