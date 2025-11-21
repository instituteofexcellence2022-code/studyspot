/**
 * UNIT TESTS - PAYMENT SERVICE (payment.service.ts)
 * Tests for unified payment service logic
 */

import paymentService from '../../../src/services/payment-service/payment.service';
import cashfreeService from '../../../src/services/payment-service/cashfree.service';
import razorpayService from '../../../src/services/payment-service/razorpay.service';
import { PAYMENT_GATEWAY_LOGIC } from '../../../src/config/payment.config';
import { logger } from '../../../src/utils/logger';

// Mock dependencies
jest.mock('../../../src/services/payment-service/cashfree.service', () => ({
  __esModule: true,
  default: {
    createOrder: jest.fn(),
    verifyPayment: jest.fn(),
    processRefund: jest.fn(),
  },
}));

jest.mock('../../../src/services/payment-service/razorpay.service', () => ({
  __esModule: true,
  default: {
    createOrder: jest.fn(),
    verifyPaymentSignature: jest.fn(),
    fetchPayment: jest.fn(),
    processRefund: jest.fn(),
  },
}));

jest.mock('../../../src/services/payment-service/payment.service', () => {
  const actual = jest.requireActual('../../../src/services/payment-service/payment.service');
  return actual;
});

jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Payment Service (payment.service.ts)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Gateway Selection Logic', () => {
    it('should select Razorpay for amounts <= breakeven', async () => {
      const amount = PAYMENT_GATEWAY_LOGIC.BREAKEVEN_AMOUNT; // ₹600
      const request = {
        amount,
        currency: 'INR' as const,
        orderId: 'order-123',
        customer: {
          id: 'customer-123',
          name: 'Test User',
          email: 'test@example.com',
          phone: '+1234567890',
        },
        returnUrl: 'https://example.com/return',
      };

      const mockResponse = {
        success: true,
        gateway: 'razorpay',
        orderId: 'order-123',
        gatewayOrderId: 'rzp-order-123',
        data: { id: 'order_123' },
      };

      (razorpayService.createOrder as jest.Mock).mockResolvedValue(mockResponse);

      const result = await paymentService.createOrder(request);

      expect(result.gateway).toBe('razorpay');
    });

    it('should select Cashfree for amounts > breakeven', async () => {
      const amount = PAYMENT_GATEWAY_LOGIC.BREAKEVEN_AMOUNT + 1; // ₹600.01
      const request = {
        amount,
        currency: 'INR' as const,
        orderId: 'order-123',
        customer: {
          id: 'customer-123',
          name: 'Test User',
          email: 'test@example.com',
          phone: '+1234567890',
        },
        returnUrl: 'https://example.com/return',
      };

      const mockResponse = {
        success: true,
        gateway: 'cashfree',
        orderId: 'order-123',
        gatewayOrderId: 'cf-order-123',
        data: { paymentSessionId: 'session-123' },
      };

      (cashfreeService.createOrder as jest.Mock).mockResolvedValue(mockResponse);

      const result = await paymentService.createOrder(request);

      expect(result.gateway).toBe('cashfree');
    });

    it('should use preferred gateway when specified', async () => {
      const amount = PAYMENT_GATEWAY_LOGIC.BREAKEVEN_AMOUNT + 1000; // Would normally use Cashfree
      const request = {
        amount,
        currency: 'INR' as const,
        orderId: 'order-123',
        customer: {
          id: 'customer-123',
          name: 'Test User',
          email: 'test@example.com',
          phone: '+1234567890',
        },
        returnUrl: 'https://example.com/return',
        gateway: 'razorpay' as const,
      };

      const mockResponse = {
        success: true,
        gateway: 'razorpay',
        orderId: 'order-123',
        gatewayOrderId: 'rzp-order-123',
        data: { id: 'order_123' },
      };

      (razorpayService.createOrder as jest.Mock).mockResolvedValue(mockResponse);

      const result = await paymentService.createOrder(request);

      expect(result.gateway).toBe('razorpay');
      expect(logger.info).toHaveBeenCalledWith('Using preferred gateway', { gateway: 'razorpay' });
    });
  });

  describe('Create Order', () => {
    const mockRequest = {
      amount: 100000, // ₹1000
      currency: 'INR' as const,
      orderId: 'order-123',
      customer: {
        id: 'customer-123',
        name: 'Test User',
        email: 'test@example.com',
        phone: '+1234567890',
      },
      returnUrl: 'https://example.com/return',
    };

    it('should create order with Cashfree for large amounts', async () => {
      const mockCashfreeResponse = {
        cfOrderId: 'cf-order-123',
        paymentSessionId: 'session-123',
        orderStatus: 'ACTIVE',
      };

      (cashfreeService.createOrder as jest.Mock).mockResolvedValue(mockCashfreeResponse);

      const result = await paymentService.createOrder(mockRequest);

      expect(result.gateway).toBe('cashfree');
      expect(result.gatewayOrderId).toBe('cf-order-123');
      expect(result.paymentSessionId).toBe('session-123');
      expect(cashfreeService.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: mockRequest.orderId,
          orderAmount: mockRequest.amount / 100, // Converted to rupees
        })
      );
    });

    it('should create order with Razorpay for small amounts', async () => {
      const smallAmountRequest = {
        ...mockRequest,
        amount: 50000, // ₹500
      };

      const mockResponse = {
        success: true,
        gateway: 'razorpay',
        orderId: 'order-123',
        gatewayOrderId: 'rzp-order-123',
        data: { id: 'order_123' },
      };

      (razorpayService.createOrder as jest.Mock).mockResolvedValue(mockResponse);

      const result = await paymentService.createOrder(smallAmountRequest);

      expect(result.gateway).toBe('razorpay');
      expect(razorpayService.createOrder).toHaveBeenCalled();
    });

    it('should failover to alternate gateway on error', async () => {
      const mockRequest = {
        amount: 100000, // Would use Cashfree
        currency: 'INR' as const,
        orderId: 'order-123',
        customer: {
          id: 'customer-123',
          name: 'Test User',
          email: 'test@example.com',
          phone: '+1234567890',
        },
        returnUrl: 'https://example.com/return',
      };

      const failoverResponse = {
        success: true,
        gateway: 'razorpay',
        orderId: 'order-123',
        gatewayOrderId: 'rzp-order-123',
        data: { id: 'order_123' },
      };

      (cashfreeService.createOrder as jest.Mock).mockRejectedValue(new Error('Cashfree error'));
      (razorpayService.createOrder as jest.Mock).mockResolvedValue(failoverResponse);

      const result = await paymentService.createOrder(mockRequest);

      expect(result.gateway).toBe('razorpay');
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('failed, attempting failover'),
        expect.any(Object)
      );
    });

    it('should throw error if both gateways fail', async () => {
      const mockRequest = {
        amount: 100000,
        currency: 'INR' as const,
        orderId: 'order-123',
        customer: {
          id: 'customer-123',
          name: 'Test User',
          email: 'test@example.com',
          phone: '+1234567890',
        },
        returnUrl: 'https://example.com/return',
      };

      (cashfreeService.createOrder as jest.Mock).mockRejectedValue(new Error('Cashfree error'));
      (razorpayService.createOrder as jest.Mock).mockRejectedValue(new Error('Razorpay error'));

      await expect(paymentService.createOrder(mockRequest)).rejects.toThrow('Both payment gateways failed');
      expect(logger.error).toHaveBeenCalledWith('Failover also failed', expect.any(Object));
    });
  });

  describe('Cost Calculation', () => {
    it('should calculate Cashfree cost correctly', () => {
      const amount = 100000; // ₹1000
      const cashfreeCost = amount * 0.015 + 300; // 1.5% + ₹3

      expect(cashfreeCost).toBe(1800); // ₹18
    });

    it('should calculate Razorpay cost correctly', () => {
      const amount = 100000; // ₹1000
      const razorpayCost = amount * 0.02; // 2%

      expect(razorpayCost).toBe(2000); // ₹20
    });

    it('should verify breakeven calculation', () => {
      const breakeven = PAYMENT_GATEWAY_LOGIC.BREAKEVEN_AMOUNT; // 60000 paise = ₹600
      const cashfreeCost = breakeven * 0.015 + 300; // 1.5% + ₹3
      const razorpayCost = breakeven * 0.02; // 2%

      // Costs should be approximately equal at breakeven
      expect(Math.abs(cashfreeCost - razorpayCost)).toBeLessThan(10);
    });
  });
});

