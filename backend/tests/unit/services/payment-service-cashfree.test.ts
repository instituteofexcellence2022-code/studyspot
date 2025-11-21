/**
 * UNIT TESTS - CASHFREE SERVICE
 * Tests for Cashfree payment gateway integration
 */

import cashfreeService from '../../../src/services/payment-service/cashfree.service';
import axios from 'axios';
import crypto from 'crypto';
import { CASHFREE_CONFIG } from '../../../src/config/payment.config';
import { logger } from '../../../src/utils/logger';

// Mock dependencies
jest.mock('axios');
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
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
        orderId: 'ORD_123',
        orderAmount: 1000,
        orderCurrency: 'INR' as const,
        customerDetails: {
          customerId: 'customer-1',
          customerName: 'Test Customer',
          customerEmail: 'test@example.com',
          customerPhone: '+1234567890',
        },
        orderMeta: {
          returnUrl: 'https://example.com/return',
        },
      };

      const mockResponse = {
        data: {
          orderId: 'ORD_123',
          orderStatus: 'ACTIVE',
          paymentSessionId: 'session_123',
          cfOrderId: 'cf_order_123',
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await cashfreeService.createOrder(orderData);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${CASHFREE_CONFIG.active.apiUrl}/orders`,
        orderData,
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-api-version': '2023-08-01',
            'x-client-id': CASHFREE_CONFIG.active.appId,
            'x-client-secret': CASHFREE_CONFIG.active.secretKey,
          }),
        })
      );

      expect(result).toEqual(mockResponse.data);
      expect(logger.info).toHaveBeenCalledWith('Cashfree order created', { orderId: 'ORD_123' });
    });

    it('should handle create order errors', async () => {
      const orderData = {
        orderId: 'ORD_123',
        orderAmount: 1000,
        orderCurrency: 'INR' as const,
        customerDetails: {
          customerId: 'customer-1',
          customerName: 'Test Customer',
          customerEmail: 'test@example.com',
          customerPhone: '+1234567890',
        },
      };

      const errorResponse = {
        response: {
          data: {
            message: 'Invalid request',
          },
        },
      };

      mockedAxios.post.mockRejectedValue(errorResponse);

      await expect(cashfreeService.createOrder(orderData)).rejects.toThrow('Cashfree order creation failed');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('verifyPayment', () => {
    it('should verify payment successfully', async () => {
      const orderId = 'ORD_123';
      const mockResponse = {
        data: {
          orderId,
          orderStatus: 'PAID',
          paymentStatus: 'SUCCESS',
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await cashfreeService.verifyPayment(orderId);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${CASHFREE_CONFIG.active.apiUrl}/orders/${orderId}`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-api-version': '2023-08-01',
            'x-client-id': CASHFREE_CONFIG.active.appId,
            'x-client-secret': CASHFREE_CONFIG.active.secretKey,
          }),
        })
      );

      expect(result).toEqual(mockResponse.data);
    });

    it('should handle verification errors', async () => {
      const orderId = 'ORD_123';
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      await expect(cashfreeService.verifyPayment(orderId)).rejects.toThrow('Payment verification failed');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('processRefund', () => {
    it('should process refund successfully', async () => {
      const orderId = 'ORD_123';
      const refundAmount = 500; // ₹500
      const refundId = 'REF_123';

      const mockResponse = {
        data: {
          refundId,
          refundAmount,
          status: 'SUCCESS',
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await cashfreeService.processRefund(orderId, refundAmount, refundId);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${CASHFREE_CONFIG.active.apiUrl}/orders/${orderId}/refunds`,
        expect.objectContaining({
          refund_id: refundId,
          refund_amount: refundAmount,
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-api-version': '2023-08-01',
            'x-client-id': CASHFREE_CONFIG.active.appId,
            'x-client-secret': CASHFREE_CONFIG.active.secretKey,
          }),
        })
      );

      expect(result).toEqual(mockResponse.data);
      expect(logger.info).toHaveBeenCalledWith('Cashfree refund processed', { refundId });
    });

    it('should handle refund errors', async () => {
      const orderId = 'ORD_123';
      const refundAmount = 500;
      const refundId = 'REF_123';

      mockedAxios.post.mockRejectedValue(new Error('Refund failed'));

      await expect(cashfreeService.processRefund(orderId, refundAmount, refundId)).rejects.toThrow('Refund processing failed');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('verifyWebhookSignature', () => {
    it('should verify valid webhook signature', () => {
      const timestamp = '1234567890';
      const rawBody = '{"event":"payment.captured"}';
      const signature = crypto
        .createHmac('sha256', CASHFREE_CONFIG.active.secretKey)
        .update(`${timestamp}${rawBody}`)
        .digest('base64');

      const result = cashfreeService.verifyWebhookSignature(signature, timestamp, rawBody);

      expect(result).toBe(true);
    });

    it('should reject invalid webhook signature', () => {
      const timestamp = '1234567890';
      const rawBody = '{"event":"payment.captured"}';
      const invalidSignature = 'invalid_signature';

      const result = cashfreeService.verifyWebhookSignature(invalidSignature, timestamp, rawBody);

      expect(result).toBe(false);
    });
  });
});

