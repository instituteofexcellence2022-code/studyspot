import axios from 'axios';
import subscriptionService from '../subscriptionService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Subscription Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPlans', () => {
    it('should fetch subscription plans successfully', async () => {
      const mockPlans = [
        { id: '1', name: 'Free', price: 0 },
        { id: '2', name: 'Pro', price: 9999 },
      ];

      mockedAxios.get.mockResolvedValueOnce({
        data: { data: mockPlans },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { url: '/subscriptions/plans' }
      });

      const result = await subscriptionService.getPlans();

      expect(mockedAxios.get).toHaveBeenCalledWith('/subscriptions/plans');
      expect(result).toEqual(mockPlans);
    });

    it('should handle errors when fetching plans', async () => {
      const errorMessage = 'Network error';
      mockedAxios.get.mockRejectedValueOnce(new Error(errorMessage));

      await expect(subscriptionService.getPlans()).rejects.toThrow(errorMessage);
    });
  });

  describe('getSubscription', () => {
    it('should fetch subscription successfully', async () => {
      const mockSubscription = {
        id: '1',
        planId: 'pro',
        status: 'active'};

      mockedAxios.get.mockResolvedValueOnce({
        data: { data: mockSubscription },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { url: '/subscriptions/plans' }
      });

      const result = await subscriptionService.getSubscription('tenant_123');

      expect(mockedAxios.get).toHaveBeenCalledWith('/subscriptions/tenant_123');
      expect(result).toEqual(mockSubscription);
    });
  });

  describe('createSubscription', () => {
    it('should create new subscription successfully', async () => {
      const subscriptionData = {
        planId: 'pro',
        paymentMethodId: 'pm_123',
        billingCycle: 'monthly' as const
      };
      const mockResponse = {
        id: '1',
        planId: 'pro',
        status: 'active'};

      mockedAxios.post.mockResolvedValueOnce({
        data: { data: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { url: '/subscriptions/plans' }
      });

      const result = await subscriptionService.createSubscription(subscriptionData);

      expect(mockedAxios.post).toHaveBeenCalledWith('/subscriptions', subscriptionData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle subscription errors', async () => {
      const subscriptionData = {
        planId: 'pro',
        paymentMethodId: 'pm_123',
        billingCycle: 'monthly' as const
      };
      const errorMessage = 'Payment failed';
      
      mockedAxios.post.mockRejectedValueOnce(new Error(errorMessage));

      await expect(subscriptionService.createSubscription(subscriptionData)).rejects.toThrow(errorMessage);
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel subscription successfully', async () => {
      const reason = 'Too expensive';
      const mockResponse = {
        id: '1',
        status: 'cancelled'};

      mockedAxios.post.mockResolvedValueOnce({
        data: { data: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { url: '/subscriptions/plans' }
      });

      const result = await subscriptionService.cancelSubscription(reason);

      expect(mockedAxios.post).toHaveBeenCalledWith('/subscriptions/cancel', {
        reason});
      expect(result).toEqual(mockResponse);
    });
  });
});

