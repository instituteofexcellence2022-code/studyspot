/**
 * UNIT TESTS - PAYMENT VALIDATOR
 * Tests for payment validation schemas
 */

import {
  createPaymentOrderSchema,
  verifyPaymentSchema,
  processRefundSchema,
  paymentParamsSchema,
} from '../../../src/validators/payment.validator';

describe('Payment Validator Schemas', () => {
  describe('createPaymentOrderSchema', () => {
    it('should validate valid payment order', () => {
      const validData = {
        amount: 1000,
        currency: 'INR',
        customer: {
          id: 'customer-123',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '1234567890',
        },
        returnUrl: 'https://example.com/return',
        gateway: 'razorpay',
      };

      const result = createPaymentOrderSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should require amount', () => {
      const invalidData = {
        currency: 'INR',
      };

      const result = createPaymentOrderSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should validate amount is positive', () => {
      const invalidData = {
        amount: -100,
        currency: 'INR',
      };

      const result = createPaymentOrderSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('verifyPaymentSchema', () => {
    it('should validate payment verification data', () => {
      const validData = {
        orderId: 'order-123',
        paymentId: 'payment-123',
        signature: 'signature-123',
        gateway: 'razorpay',
      };

      const result = verifyPaymentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('processRefundSchema', () => {
    it('should validate refund data', () => {
      const validData = {
        amount: 500,
        reason: 'Customer request',
      };

      const result = processRefundSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should allow refund without reason (optional)', () => {
      const validData = {
        amount: 500,
        // reason is optional
      };

      const result = processRefundSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('paymentParamsSchema', () => {
    it('should validate payment ID parameter', () => {
      const validParams = {
        id: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = paymentParamsSchema.safeParse(validParams);
      expect(result.success).toBe(true);
    });
  });
});

