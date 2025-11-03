/**
 * Fee Plan Service
 * Handles all API calls for fee plan management
 */

import apiClient from '../apiClient';
import { FeePlan } from '../../constants/feePlans';
import { DEFAULT_FEE_PLANS } from '../../constants/feePlans';

/**
 * Fee Plan Service
 * All methods follow consistent error handling and return patterns
 */
class FeePlanService {
  private baseUrl = '/fee-plans';

  /**
   * Get all available fee plans
   * @returns Promise with array of fee plans
   */
  async getFeePlans(): Promise<FeePlan[]> {
    try {
      const response: any = await apiClient.get('/api/fee-plans');
      
      if (response.data.success && response.data.data && response.data.data.plans) {
        // Transform the API response to match our FeePlan interface
        return response.data.data.plans.map((plan: any) => ({
          id: plan.id,
          name: plan.name,
          description: plan.description || '',
          type: plan.type,
          basePrice: plan.basePrice || 0,
          status: plan.status || 'active',
          isPopular: plan.isPopular || false,
          features: plan.features || [],
          shiftPricing: plan.shiftPricing,
          zonePricing: plan.zonePricing,
          discount: plan.discount,
          maxSeats: plan.maxSeats,
          maxHours: plan.maxHours,
          scholarshipEligible: plan.scholarshipEligible || false,
          waiverAllowed: plan.waiverAllowed || false
        }));
      }
      
      // If API response doesn't match expected format, return default plans
      return DEFAULT_FEE_PLANS;
    } catch (error) {
      console.warn('Failed to fetch fee plans from API, using defaults:', error);
      return DEFAULT_FEE_PLANS;
    }
  }

  /**
   * Get fee plans by type
   * @param type - The fee plan type to filter by
   * @returns Promise with array of fee plans of specified type
   */
  async getFeePlansByType(type: FeePlan['type']): Promise<FeePlan[]> {
    try {
      const allPlans = await this.getFeePlans();
      return allPlans.filter(plan => plan.type === type);
    } catch (error) {
      console.warn('Failed to fetch fee plans by type, using defaults:', error);
      return DEFAULT_FEE_PLANS.filter(plan => plan.type === type);
    }
  }

  /**
   * Get popular fee plans
   * @returns Promise with array of popular fee plans
   */
  async getPopularFeePlans(): Promise<FeePlan[]> {
    try {
      const allPlans = await this.getFeePlans();
      return allPlans.filter(plan => plan.isPopular);
    } catch (error) {
      console.warn('Failed to fetch popular fee plans, using defaults:', error);
      return DEFAULT_FEE_PLANS.filter(plan => plan.isPopular);
    }
  }

  /**
   * Create a new fee plan
   * @param plan - The fee plan data to create
   * @returns Promise with created fee plan
   */
  async createFeePlan(plan: Omit<FeePlan, 'id'>): Promise<FeePlan> {
    try {
      const response: any = await apiClient.post('/api/fee-plans', plan);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error('Failed to create fee plan');
    } catch (error) {
      console.error('Error creating fee plan:', error);
      throw error;
    }
  }

  /**
   * Update an existing fee plan
   * @param id - The fee plan ID
   * @param plan - The updated fee plan data
   * @returns Promise with updated fee plan
   */
  async updateFeePlan(id: string, plan: Partial<FeePlan>): Promise<FeePlan> {
    try {
      const response: any = await apiClient.put(`/api/fee-plans/${id}`, plan);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error('Failed to update fee plan');
    } catch (error) {
      console.error('Error updating fee plan:', error);
      throw error;
    }
  }

  /**
   * Delete a fee plan
   * @param id - The fee plan ID to delete
   * @returns Promise with deletion result
   */
  async deleteFeePlan(id: string): Promise<boolean> {
    try {
      const response: any = await apiClient.delete(`/api/fee-plans/${id}`);
      
      if (response.data.success) {
        return true;
      }
      
      throw new Error('Failed to delete fee plan');
    } catch (error) {
      console.error('Error deleting fee plan:', error);
      throw error;
    }
  }
}

const feePlanService = new FeePlanService();
export default feePlanService;














