/**
 * UNIT TESTS - CASHFREE PAYMENT SERVICE
 */

import axios from 'axios';
import cashfreeService from '../../../src/services/payment-service/cashfree.service';
import { CASHFREE_CONFIG } from '../../../src/config/payment.config';
import { logger } from '../../../src/utils/logger';

jest.mock('axios');
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Cashfree Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create order successfully', async () => {
      const orderData = {
        orderId: 'order-123',
        orderAmount: 1000,
        orderCurrency: 'INR' as const,
        customerDetails: {
          customerId: 'cust-123',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          customerPhone: '+1234567890',
        },
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: {
          orderId: 'order-123',
          orderStatus: 'ACTIVE',
          paymentSessionId: 'session-123',
          cfOrderId: 'cf-order-123',
        },
      });

      const result = await cashfreeService.createOrder(orderData);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/orders'),
        orderData,
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-client-id': CASHFREE_CONFIG.active.appId,
          }),
        })
      );
      expect(result.paymentSessionId).toBe('session-123');
      expect(logger.info).toHaveBeenCalled();
    });

    it('should handle order creation error', async () => {
      const orderData = {
        orderId: 'order-123',
        orderAmount: 1000,
        orderCurrency: 'INR' as const,
        customerDetails: {
          customerId: 'cust-123',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          customerPhone: '+1234567890',
        },
      };

      mockedAxios.post.mockRejectedValueOnce({
        response: { data: { message: 'Invalid credentials' } },
        message: 'Request failed',
      });

      await expect(cashfreeService.createOrder(orderData)).rejects.toThrow();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('verifyPayment', () => {
    it('should verify payment successfully', async () => {
      const orderId = 'order-123';
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          orderId,
          orderStatus: 'PAID',
          paymentStatus: 'SUCCESS',
        },
      });

      const result = await cashfreeService.verifyPayment(orderId);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(`/orders/${orderId}`),
        expect.any(Object)
      );
      expect(result.orderStatus).toBe('PAID');
    });

    it('should handle verification error', async () => {
      const orderId = 'order-123';
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(cashfreeService.verifyPayment(orderId)).rejects.toThrow();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('processRefund', () => {
    it('should process refund successfully', async () => {
      const orderId = 'order-123';
      const refundAmount = 500;
      const refundId = 'refund-123';

      mockedAxios.post.mockResolvedValueOnce({
        data: {
          refundId,
          refundAmount,
          status: 'SUCCESS',
        },
      });

      const result = await cashfreeService.processRefund(orderId, refundAmount, refundId);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining(`/orders/${orderId}/refunds`),
        expect.objectContaining({
          refund_id: refundId,
          refund_amount: refundAmount,
        }),
        expect.any(Object)
      );
      expect(result.refundId).toBe(refundId);
      expect(logger.info).toHaveBeenCalled();
    });

    it('should handle refund error', async () => {
      const orderId = 'order-123';
      mockedAxios.post.mockRejectedValueOnce(new Error('Refund failed'));

      await expect(
        cashfreeService.processRefund(orderId, 500, 'refund-123')
      ).rejects.toThrow();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('verifyWebhookSignature', () => {
    it('should verify valid webhook signature', () => {
      const timestamp = '1234567890';
      const rawBody = 'test body';
      const signature = (cashfreeService as any).generateSignature(timestamp, rawBody);

      const isValid = cashfreeService.verifyWebhookSignature(signature, timestamp, rawBody);

      expect(isValid).toBe(true);
    });

    it('should reject invalid webhook signature', () => {
      const timestamp = '1234567890';
      const rawBody = 'test body';
      const invalidSignature = 'invalid-signature';

      const isValid = cashfreeService.verifyWebhookSignature(invalidSignature, timestamp, rawBody);

      expect(isValid).toBe(false);
    });
  });
});

