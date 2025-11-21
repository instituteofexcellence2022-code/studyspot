/**
 * UNIT TESTS - RAZORPAY SERVICE
 * Tests for Razorpay payment gateway integration
 */

import crypto from 'crypto';
import { RAZORPAY_CONFIG } from '../../../src/config/payment.config';
import { logger } from '../../../src/utils/logger';

// Mock dependencies
jest.mock('razorpay', () => {
  return jest.fn().mockImplementation(() => ({
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
  }));
});

jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Import after mocks
import Razorpay from 'razorpay';
import razorpayService from '../../../src/services/payment-service/razorpay.service';

const MockedRazorpay = Razorpay as jest.MockedClass<typeof Razorpay>;

describe('Razorpay Service', () => {
  let mockRazorpayInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Get the mocked instance
    const razorpayInstance = (razorpayService as any).razorpay;
    if (razorpayInstance) {
      mockRazorpayInstance = razorpayInstance;
    } else {
      mockRazorpayInstance = {
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
    }
  });

  describe('createOrder', () => {
    it('should create order successfully', async () => {
      const orderData = {
        amount: 100000, // ₹1000 in paise
        currency: 'INR' as const,
        receipt: 'ORD_123',
        notes: {
          customerId: 'customer-1',
          customerName: 'Test Customer',
        },
      };

      const mockOrder = {
        id: 'order_123',
        amount: orderData.amount,
        currency: orderData.currency,
        receipt: orderData.receipt,
      };

      // Access the razorpay instance from the service
      const serviceInstance = (razorpayService as any).razorpay;
      if (serviceInstance && serviceInstance.orders) {
        serviceInstance.orders.create = jest.fn().mockResolvedValue(mockOrder);
      }

      const result = await razorpayService.createOrder(orderData);

      expect(result).toEqual(mockOrder);
      expect(logger.info).toHaveBeenCalledWith('Razorpay order created', { orderId: 'ORD_123' });
    });

    it('should handle create order errors', async () => {
      const orderData = {
        amount: 100000,
        currency: 'INR' as const,
        receipt: 'ORD_123',
      };

      const serviceInstance = (razorpayService as any).razorpay;
      if (serviceInstance && serviceInstance.orders) {
        serviceInstance.orders.create = jest.fn().mockRejectedValue(new Error('Razorpay error'));
      }

      await expect(razorpayService.createOrder(orderData)).rejects.toThrow('Razorpay order creation failed');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('verifyPaymentSignature', () => {
    it('should verify valid signature', () => {
      const orderId = 'order_123';
      const paymentId = 'pay_123';
      const text = `${orderId}|${paymentId}`;
      const signature = crypto
        .createHmac('sha256', RAZORPAY_CONFIG.active.keySecret)
        .update(text)
        .digest('hex');

      const result = razorpayService.verifyPaymentSignature(orderId, paymentId, signature);

      expect(result).toBe(true);
    });

    it('should reject invalid signature', () => {
      const orderId = 'order_123';
      const paymentId = 'pay_123';
      const invalidSignature = 'invalid_signature';

      const result = razorpayService.verifyPaymentSignature(orderId, paymentId, invalidSignature);

      expect(result).toBe(false);
    });
  });

  describe('fetchPayment', () => {
    it('should fetch payment successfully', async () => {
      const paymentId = 'pay_123';
      const mockPayment = {
        id: paymentId,
        status: 'captured',
        amount: 100000,
      };

      const serviceInstance = (razorpayService as any).razorpay;
      if (serviceInstance && serviceInstance.payments) {
        serviceInstance.payments.fetch = jest.fn().mockResolvedValue(mockPayment);
      }

      const result = await razorpayService.fetchPayment(paymentId);

      expect(result).toEqual(mockPayment);
    });

    it('should handle fetch payment errors', async () => {
      const paymentId = 'pay_123';
      const serviceInstance = (razorpayService as any).razorpay;
      if (serviceInstance && serviceInstance.payments) {
        serviceInstance.payments.fetch = jest.fn().mockRejectedValue(new Error('Payment not found'));
      }

      await expect(razorpayService.fetchPayment(paymentId)).rejects.toThrow('Payment fetch failed');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('processRefund', () => {
    it('should process full refund successfully', async () => {
      const paymentId = 'pay_123';
      const mockRefund = {
        id: 'refund_123',
        amount: 100000,
        status: 'processed',
      };

      const serviceInstance = (razorpayService as any).razorpay;
      if (serviceInstance && serviceInstance.payments) {
        serviceInstance.payments.refund = jest.fn().mockResolvedValue(mockRefund);
      }

      const result = await razorpayService.processRefund(paymentId);

      expect(result).toEqual(mockRefund);
      expect(logger.info).toHaveBeenCalledWith('Razorpay refund processed', { paymentId });
    });

    it('should process partial refund successfully', async () => {
      const paymentId = 'pay_123';
      const refundAmount = 50000; // ₹500
      const mockRefund = {
        id: 'refund_123',
        amount: refundAmount,
        status: 'processed',
      };

      const serviceInstance = (razorpayService as any).razorpay;
      if (serviceInstance && serviceInstance.payments) {
        serviceInstance.payments.refund = jest.fn().mockResolvedValue(mockRefund);
      }

      const result = await razorpayService.processRefund(paymentId, refundAmount);

      expect(result).toEqual(mockRefund);
    });

    it('should handle refund errors', async () => {
      const paymentId = 'pay_123';
      const serviceInstance = (razorpayService as any).razorpay;
      if (serviceInstance && serviceInstance.payments) {
        serviceInstance.payments.refund = jest.fn().mockRejectedValue(new Error('Refund failed'));
      }

      await expect(razorpayService.processRefund(paymentId)).rejects.toThrow('Refund processing failed');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('createSubscription', () => {
    it('should create subscription successfully', async () => {
      const planId = 'plan_123';
      const totalCount = 12;
      const mockSubscription = {
        id: 'sub_123',
        plan_id: planId,
        status: 'created',
      };

      const serviceInstance = (razorpayService as any).razorpay;
      if (serviceInstance && serviceInstance.subscriptions) {
        serviceInstance.subscriptions.create = jest.fn().mockResolvedValue(mockSubscription);
      }

      const result = await razorpayService.createSubscription(planId, totalCount);

      expect(result).toEqual(mockSubscription);
    });

    it('should handle subscription creation errors', async () => {
      const planId = 'plan_123';
      const totalCount = 12;

      const serviceInstance = (razorpayService as any).razorpay;
      if (serviceInstance && serviceInstance.subscriptions) {
        serviceInstance.subscriptions.create = jest.fn().mockRejectedValue(new Error('Subscription failed'));
      }

      await expect(razorpayService.createSubscription(planId, totalCount)).rejects.toThrow('Subscription creation failed');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel subscription successfully', async () => {
      const subscriptionId = 'sub_123';
      const mockSubscription = {
        id: subscriptionId,
        status: 'cancelled',
      };

      const serviceInstance = (razorpayService as any).razorpay;
      if (serviceInstance && serviceInstance.subscriptions) {
        serviceInstance.subscriptions.cancel = jest.fn().mockResolvedValue(mockSubscription);
      }

      const result = await razorpayService.cancelSubscription(subscriptionId);

      expect(result).toEqual(mockSubscription);
    });

    it('should handle subscription cancellation errors', async () => {
      const subscriptionId = 'sub_123';
      const serviceInstance = (razorpayService as any).razorpay;
      if (serviceInstance && serviceInstance.subscriptions) {
        serviceInstance.subscriptions.cancel = jest.fn().mockRejectedValue(new Error('Cancellation failed'));
      }

      await expect(razorpayService.cancelSubscription(subscriptionId)).rejects.toThrow('Subscription cancellation failed');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('verifyWebhookSignature', () => {
    it('should verify valid webhook signature', () => {
      const body = '{"event":"payment.captured"}';
      const signature = crypto
        .createHmac('sha256', RAZORPAY_CONFIG.webhookSecret)
        .update(body)
        .digest('hex');

      const result = razorpayService.verifyWebhookSignature(body, signature);

      expect(result).toBe(true);
    });

    it('should reject invalid webhook signature', () => {
      const body = '{"event":"payment.captured"}';
      const invalidSignature = 'invalid_signature';

      const result = razorpayService.verifyWebhookSignature(body, invalidSignature);

      expect(result).toBe(false);
    });
  });
});

