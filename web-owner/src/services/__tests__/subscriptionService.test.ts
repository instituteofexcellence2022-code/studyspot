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

  describe('getCurrentSubscription', () => {
    it('should fetch current subscription successfully', async () => {
      const mockSubscription = {
        id: '1',
        planId: 'pro',
        status: 'active',
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: { data: mockSubscription },
      });

      const result = await subscriptionService.getCurrentSubscription();

      expect(mockedAxios.get).toHaveBeenCalledWith('/subscriptions/current');
      expect(result).toEqual(mockSubscription);
    });
  });

  describe('subscribe', () => {
    it('should create new subscription successfully', async () => {
      const planId = 'pro';
      const mockResponse = {
        id: '1',
        planId,
        status: 'active',
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: { data: mockResponse },
      });

      const result = await subscriptionService.subscribe(planId);

      expect(mockedAxios.post).toHaveBeenCalledWith('/subscriptions/subscribe', {
        planId,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle subscription errors', async () => {
      const planId = 'pro';
      const errorMessage = 'Payment failed';
      
      mockedAxios.post.mockRejectedValueOnce(new Error(errorMessage));

      await expect(subscriptionService.subscribe(planId)).rejects.toThrow(errorMessage);
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel subscription successfully', async () => {
      const reason = 'Too expensive';
      const mockResponse = {
        id: '1',
        status: 'cancelled',
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: { data: mockResponse },
      });

      const result = await subscriptionService.cancelSubscription(reason);

      expect(mockedAxios.post).toHaveBeenCalledWith('/subscriptions/cancel', {
        reason,
      });
      expect(result).toEqual(mockResponse);
    });
  });
});

