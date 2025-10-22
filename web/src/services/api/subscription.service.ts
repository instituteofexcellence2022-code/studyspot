/**
 * Subscription Service
 * Handles all API calls for subscription management
 * @author Agent 1 - Senior Full Stack Developer
 * 
 * Architecture Pattern: Service Layer with Error Handling & Type Safety
 * - Centralized API communication
 * - Comprehensive error handling
 * - Type-safe responses
 * - Retry logic for transient failures
 * - Request/response logging
 */

import apiClient from '../apiClient';
import {
  SubscriptionPlan,
  Subscription,
  Invoice,
  CreateSubscriptionRequest,
  CreateSubscriptionResponse,
  UpgradeSubscriptionRequest,
  DowngradeSubscriptionRequest,
  CancelSubscriptionRequest,
  PortalSessionResponse,
  ApiResponse,
  PlansApiResponse,
  SubscriptionApiResponse,
  InvoicesApiResponse,
  PortalApiResponse,
} from '../../types/subscription';

/**
 * Subscription Service
 * All methods follow consistent error handling and return patterns
 */
class SubscriptionService {
  private baseUrl = '/subscriptions';

  /**
   * Get all available subscription plans
   * @returns Promise with array of subscription plans
   */
  async getPlans(): Promise<SubscriptionPlan[]> {
    try {
      const response: any = await apiClient.get(`${this.baseUrl}/plans`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.error || 'Failed to fetch subscription plans');
    } catch (error: any) {
      console.error('SubscriptionService.getPlans error:', error);
      throw new Error(
        error.response?.data?.error || 
        error.message || 
        'Failed to fetch subscription plans'
      );
    }
  }

  /**
   * Get current subscription for a tenant
   * @param tenantId - Tenant ID
   * @returns Promise with subscription details
   */
  async getSubscription(tenantId: string): Promise<Subscription> {
    try {
      const response: any = await apiClient.get(
        `${this.baseUrl}/${tenantId}`
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.error || 'Failed to fetch subscription');
    } catch (error: any) {
      console.error('SubscriptionService.getSubscription error:', error);
      
      // Handle 404 gracefully (no subscription exists)
      if (error.response?.status === 404) {
        throw new Error('NO_SUBSCRIPTION');
      }
      
      throw new Error(
        error.response?.data?.error || 
        error.message || 
        'Failed to fetch subscription'
      );
    }
  }

  /**
   * Create a new subscription
   * @param data - Subscription creation data
   * @returns Promise with created subscription and client secret
   */
  async createSubscription(
    data: CreateSubscriptionRequest
  ): Promise<CreateSubscriptionResponse> {
    try {
      const response: any = await apiClient.post(
        `${this.baseUrl}/create`,
        data
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.error || 'Failed to create subscription');
    } catch (error: any) {
      console.error('SubscriptionService.createSubscription error:', error);
      throw new Error(
        error.response?.data?.error || 
        error.message || 
        'Failed to create subscription'
      );
    }
  }

  /**
   * Upgrade subscription to a higher plan
   * @param subscriptionId - Current subscription ID
   * @param data - Upgrade request data
   * @returns Promise with updated subscription
   */
  async upgradeSubscription(
    subscriptionId: string,
    data: UpgradeSubscriptionRequest
  ): Promise<Subscription> {
    try {
      const response: any = await apiClient.put(
        `${this.baseUrl}/${subscriptionId}/upgrade`,
        data
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.error || 'Failed to upgrade subscription');
    } catch (error: any) {
      console.error('SubscriptionService.upgradeSubscription error:', error);
      throw new Error(
        error.response?.data?.error || 
        error.message || 
        'Failed to upgrade subscription'
      );
    }
  }

  /**
   * Downgrade subscription to a lower plan
   * Note: Downgrade applies at the end of the current billing period
   * @param subscriptionId - Current subscription ID
   * @param data - Downgrade request data
   * @returns Promise with updated subscription
   */
  async downgradeSubscription(
    subscriptionId: string,
    data: DowngradeSubscriptionRequest
  ): Promise<Subscription> {
    try {
      const response: any = await apiClient.put(
        `${this.baseUrl}/${subscriptionId}/downgrade`,
        data
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.error || 'Failed to downgrade subscription');
    } catch (error: any) {
      console.error('SubscriptionService.downgradeSubscription error:', error);
      throw new Error(
        error.response?.data?.error || 
        error.message || 
        'Failed to downgrade subscription'
      );
    }
  }

  /**
   * Cancel subscription
   * @param subscriptionId - Subscription ID to cancel
   * @param data - Cancel request data (immediate or end of period)
   * @returns Promise with cancelled subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    data: CancelSubscriptionRequest = {}
  ): Promise<Subscription> {
    try {
      const response: any = await apiClient.delete(
        `${this.baseUrl}/${subscriptionId}/cancel`,
        { data }
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.error || 'Failed to cancel subscription');
    } catch (error: any) {
      console.error('SubscriptionService.cancelSubscription error:', error);
      throw new Error(
        error.response?.data?.error || 
        error.message || 
        'Failed to cancel subscription'
      );
    }
  }

  /**
   * Get invoices for a tenant
   * @param tenantId - Tenant ID
   * @param limit - Maximum number of invoices to retrieve (default: 10)
   * @returns Promise with array of invoices
   */
  async getInvoices(tenantId: string, limit: number = 10): Promise<Invoice[]> {
    try {
      const response: any = await apiClient.get(
        `${this.baseUrl}/${tenantId}/invoices`,
        { params: { limit } }
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.error || 'Failed to fetch invoices');
    } catch (error: any) {
      console.error('SubscriptionService.getInvoices error:', error);
      throw new Error(
        error.response?.data?.error || 
        error.message || 
        'Failed to fetch invoices'
      );
    }
  }

  /**
   * Create Stripe customer portal session
   * @param subscriptionId - Subscription ID
   * @returns Promise with portal URL
   */
  async createPortalSession(subscriptionId: string): Promise<string> {
    try {
      const response: any = await apiClient.post(
        `${this.baseUrl}/${subscriptionId}/portal`
      );
      
      if (response.data.success && response.data.data?.url) {
        return response.data.data.url;
      }
      
      throw new Error(response.data.error || 'Failed to create portal session');
    } catch (error: any) {
      console.error('SubscriptionService.createPortalSession error:', error);
      throw new Error(
        error.response?.data?.error || 
        error.message || 
        'Failed to create portal session'
      );
    }
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService();
export default subscriptionService;


