/**
 * UNIT TESTS - RAZORPAY PAYMENT SERVICE
 */

import { RAZORPAY_CONFIG } from '../../../src/config/payment.config';
import { logger } from '../../../src/utils/logger';

// Mock razorpay before importing the service
const mockRazorpayInstance = {
  orders: {
    create: jest.fn(),
  },
  payments: {
    fetch: jest.fn(),
    refund: jest.fn(),
  },
  subscriptions: {
    create: jest.fn(),
    cancel: jest.fn(),
  },
};

jest.mock('razorpay', () => {
  return jest.fn().mockImplementation(() => mockRazorpayInstance);
});

jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

// Import service after mocks are set up
import razorpayService from '../../../src/services/payment-service/razorpay.service';

describe('Razorpay Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create order successfully', async () => {
      const orderData = {
        amount: 100000, // 1000 INR in paise
        currency: 'INR' as const,
        receipt: 'receipt-123',
      };

      mockRazorpayInstance.orders.create.mockResolvedValueOnce({
        id: 'order-123',
        amount: 100000,
        currency: 'INR',
      });

      const result = await razorpayService.createOrder(orderData);

      expect(mockRazorpayInstance.orders.create).toHaveBeenCalledWith(orderData);
      expect(result.id).toBe('order-123');
      expect(logger.info).toHaveBeenCalled();
    });

    it('should handle order creation error', async () => {
      const orderData = {
        amount: 100000,
        currency: 'INR' as const,
        receipt: 'receipt-123',
      };

      mockRazorpayInstance.orders.create.mockRejectedValueOnce(new Error('Invalid key'));

      await expect(razorpayService.createOrder(orderData)).rejects.toThrow();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('verifyPaymentSignature', () => {
    it('should verify valid payment signature', () => {
      const orderId = 'order-123';
      const paymentId = 'pay-123';
      const text = `${orderId}|${paymentId}`;
      const expectedSignature = require('crypto')
        .createHmac('sha256', RAZORPAY_CONFIG.active.keySecret)
        .update(text)
        .digest('hex');

      const isValid = razorpayService.verifyPaymentSignature(orderId, paymentId, expectedSignature);

      expect(isValid).toBe(true);
    });

    it('should reject invalid payment signature', () => {
      const orderId = 'order-123';
      const paymentId = 'pay-123';
      const invalidSignature = 'invalid-signature';

      const isValid = razorpayService.verifyPaymentSignature(orderId, paymentId, invalidSignature);

      expect(isValid).toBe(false);
    });
  });

  describe('fetchPayment', () => {
    it('should fetch payment successfully', async () => {
      const paymentId = 'pay-123';
      mockRazorpayInstance.payments.fetch.mockResolvedValueOnce({
        id: paymentId,
        status: 'captured',
        amount: 100000,
      });

      const result = await razorpayService.fetchPayment(paymentId);

      expect(mockRazorpayInstance.payments.fetch).toHaveBeenCalledWith(paymentId);
      expect(result.id).toBe(paymentId);
    });

    it('should handle fetch error', async () => {
      const paymentId = 'pay-123';
      mockRazorpayInstance.payments.fetch.mockRejectedValueOnce(new Error('Payment not found'));

      await expect(razorpayService.fetchPayment(paymentId)).rejects.toThrow();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('processRefund', () => {
    it('should process full refund', async () => {
      const paymentId = 'pay-123';
      mockRazorpayInstance.payments.refund.mockResolvedValueOnce({
        id: 'refund-123',
        amount: 100000,
        status: 'processed',
      });

      const result = await razorpayService.processRefund(paymentId);

      expect(mockRazorpayInstance.payments.refund).toHaveBeenCalledWith(paymentId, {});
      expect(result.id).toBe('refund-123');
      expect(logger.info).toHaveBeenCalled();
    });

    it('should process partial refund', async () => {
      const paymentId = 'pay-123';
      const amount = 50000;
      mockRazorpayInstance.payments.refund.mockResolvedValueOnce({
        id: 'refund-123',
        amount: 50000,
        status: 'processed',
      });

      const result = await razorpayService.processRefund(paymentId, amount);

      expect(mockRazorpayInstance.payments.refund).toHaveBeenCalledWith(paymentId, { amount });
      expect(result.amount).toBe(50000);
    });

    it('should handle refund error', async () => {
      const paymentId = 'pay-123';
      mockRazorpayInstance.payments.refund.mockRejectedValueOnce(new Error('Refund failed'));

      await expect(razorpayService.processRefund(paymentId)).rejects.toThrow();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('createSubscription', () => {
    it('should create subscription successfully', async () => {
      const planId = 'plan-123';
      const totalCount = 12;
      mockRazorpayInstance.subscriptions.create.mockResolvedValueOnce({
        id: 'sub-123',
        plan_id: planId,
        status: 'created',
      });

      const result = await razorpayService.createSubscription(planId, totalCount);

      expect(mockRazorpayInstance.subscriptions.create).toHaveBeenCalledWith({
        plan_id: planId,
        customer_notify: 1,
        total_count: totalCount,
        quantity: 1,
      });
      expect(result.id).toBe('sub-123');
    });

    it('should handle subscription creation error', async () => {
      const planId = 'plan-123';
      mockRazorpayInstance.subscriptions.create.mockRejectedValueOnce(new Error('Plan not found'));

      await expect(razorpayService.createSubscription(planId, 12)).rejects.toThrow();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel subscription successfully', async () => {
      const subscriptionId = 'sub-123';
      mockRazorpayInstance.subscriptions.cancel.mockResolvedValueOnce({
        id: subscriptionId,
        status: 'cancelled',
      });

      const result = await razorpayService.cancelSubscription(subscriptionId);

      expect(mockRazorpayInstance.subscriptions.cancel).toHaveBeenCalledWith(subscriptionId);
      expect(result.status).toBe('cancelled');
    });

    it('should handle cancellation error', async () => {
      const subscriptionId = 'sub-123';
      mockRazorpayInstance.subscriptions.cancel.mockRejectedValueOnce(new Error('Cannot cancel'));

      await expect(razorpayService.cancelSubscription(subscriptionId)).rejects.toThrow();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('verifyWebhookSignature', () => {
    it('should verify valid webhook signature', () => {
      const body = 'test body';
      const expectedSignature = require('crypto')
        .createHmac('sha256', RAZORPAY_CONFIG.webhookSecret)
        .update(body)
        .digest('hex');

      const isValid = razorpayService.verifyWebhookSignature(body, expectedSignature);

      expect(isValid).toBe(true);
    });

    it('should reject invalid webhook signature', () => {
      const body = 'test body';
      const invalidSignature = 'invalid-signature';

      const isValid = razorpayService.verifyWebhookSignature(body, invalidSignature);

      expect(isValid).toBe(false);
    });
  });
});

