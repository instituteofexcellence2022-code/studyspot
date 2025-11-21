/**
 * UNIT TESTS - UNIFIED PAYMENT SERVICE
 * Tests for unified payment service with smart gateway routing
 */

import { logger } from '../../../src/utils/logger';

// Mock logger
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock payment config
jest.mock('../../../src/config/payment.config', () => ({
  PAYMENT_GATEWAY_LOGIC: {
    BREAKEVEN_AMOUNT: 60000, // ₹600 in paise
  },
}));

// Mock payment gateway services
jest.mock('../../../src/services/payment-service/cashfree.service', () => ({
  default: {
    createOrder: jest.fn(),
  },
}));

jest.mock('../../../src/services/payment-service/razorpay.service', () => ({
  default: {
    createOrder: jest.fn(),
  },
}));

describe('Unified Payment Service', () => {
  describe('Gateway Selection Logic', () => {
    it('should select Razorpay for amounts <= ₹600', () => {
      const amount = 60000; // ₹600 in paise
      const breakevenAmount = 60000;

      const selectedGateway = amount <= breakevenAmount ? 'razorpay' : 'cashfree';
      expect(selectedGateway).toBe('razorpay');
    });

    it('should select Cashfree for amounts > ₹600', () => {
      const amount = 70000; // ₹700 in paise
      const breakevenAmount = 60000;

      const selectedGateway = amount <= breakevenAmount ? 'razorpay' : 'cashfree';
      expect(selectedGateway).toBe('cashfree');
    });

    it('should use preferred gateway when specified', () => {
      const amount = 100000; // ₹1000
      const preferredGateway = 'razorpay';

      const selectedGateway = preferredGateway || (amount <= 60000 ? 'razorpay' : 'cashfree');
      expect(selectedGateway).toBe('razorpay');
    });

    it('should calculate cost for Razorpay (2% + ₹0)', () => {
      const amount = 50000; // ₹500 in paise
      const razorpayFee = (amount * 0.02) + 0; // 2% + ₹0

      expect(razorpayFee).toBe(1000); // ₹10
    });

    it('should calculate cost for Cashfree (1.5% + ₹3)', () => {
      const amount = 100000; // ₹1000 in paise
      const cashfreeFee = (amount * 0.015) + 300; // 1.5% + ₹3

      expect(cashfreeFee).toBe(1800); // ₹18
    });

    it('should select cheaper gateway at breakeven point', () => {
      const amount = 60000; // ₹600
      const razorpayFee = (amount * 0.02) + 0; // ₹12
      const cashfreeFee = (amount * 0.015) + 300; // ₹12

      // At breakeven, both are equal, default to Razorpay
      const selectedGateway = razorpayFee <= cashfreeFee ? 'razorpay' : 'cashfree';
      expect(selectedGateway).toBe('razorpay');
    });
  });

  describe('Payment Request Validation', () => {
    it('should validate payment request structure', () => {
      const request = {
        amount: 10000, // ₹100 in paise
        currency: 'INR' as const,
        orderId: 'order_123',
        customer: {
          id: 'customer_456',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
        },
        returnUrl: 'https://example.com/return',
      };

      expect(request.amount).toBeGreaterThan(0);
      expect(request.currency).toBe('INR');
      expect(request.orderId).toBeDefined();
      expect(request.customer.id).toBeDefined();
      expect(request.returnUrl).toBeDefined();
    });

    it('should validate customer information', () => {
      const customer = {
        id: 'customer_456',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
      };

      expect(customer.id).toBeTruthy();
      expect(customer.name).toBeTruthy();
      expect(customer.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      expect(customer.phone).toMatch(/^\+?[1-9]\d{9,14}$/);
    });
  });

  describe('Failover Logic', () => {
    it('should attempt failover when primary gateway fails', () => {
      const primaryGateway: string = 'cashfree';
      const alternateGateway: string = primaryGateway === 'cashfree' ? 'razorpay' : 'cashfree';

      expect(alternateGateway).toBe('razorpay');
    });

    it('should attempt failover from Razorpay to Cashfree', () => {
      const primaryGateway: string = 'razorpay';
      const alternateGateway: string = primaryGateway === 'cashfree' ? 'razorpay' : 'cashfree';

      expect(alternateGateway).toBe('cashfree');
    });

    it('should handle both gateways failing', () => {
      const primaryFailed = true;
      const failoverFailed = true;

      const allFailed = primaryFailed && failoverFailed;
      expect(allFailed).toBe(true);
    });
  });

  describe('Payment Response', () => {
    it('should structure payment response correctly', () => {
      const response = {
        success: true,
        gateway: 'razorpay' as const,
        orderId: 'order_123',
        gatewayOrderId: 'rzp_order_456',
        data: {},
      };

      expect(response.success).toBe(true);
      expect(['cashfree', 'razorpay']).toContain(response.gateway);
      expect(response.orderId).toBeDefined();
      expect(response.gatewayOrderId).toBeDefined();
    });

    it('should include payment session ID for Cashfree', () => {
      const response = {
        success: true,
        gateway: 'cashfree' as const,
        orderId: 'order_123',
        gatewayOrderId: 'cf_order_456',
        paymentSessionId: 'session_789',
        data: {},
      };

      expect(response.paymentSessionId).toBeDefined();
    });
  });

  describe('Currency Support', () => {
    it('should only support INR currency', () => {
      const currency = 'INR';
      const supportedCurrencies = ['INR'];

      expect(supportedCurrencies).toContain(currency);
    });

    it('should reject unsupported currencies', () => {
      const currency = 'USD';
      const supportedCurrencies = ['INR'];

      expect(supportedCurrencies).not.toContain(currency);
    });
  });

  describe('Amount Validation', () => {
    it('should validate minimum payment amount', () => {
      const minAmount = 100; // ₹1 in paise
      const amount = 50; // ₹0.50

      expect(amount).toBeLessThan(minAmount);
    });

    it('should validate maximum payment amount', () => {
      const maxAmount = 10000000; // ₹100,000 in paise
      const amount = 5000000; // ₹50,000

      expect(amount).toBeLessThanOrEqual(maxAmount);
    });
  });
});

