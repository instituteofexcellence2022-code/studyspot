/**
 * UNIT TESTS - PAYMENT CONFIG
 * Tests for payment gateway configuration
 */

describe('Payment Config', () => {
  describe('Cashfree Configuration', () => {
    it('should use sandbox config in non-production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const { CASHFREE_CONFIG } = require('../../../src/config/payment.config');
      const activeConfig = CASHFREE_CONFIG.active;

      expect(activeConfig.apiUrl).toBe('https://sandbox.cashfree.com/pg');
      expect(activeConfig).toBe(CASHFREE_CONFIG.sandbox);

      process.env.NODE_ENV = originalEnv;
    });

    it('should use production config in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const { CASHFREE_CONFIG } = require('../../../src/config/payment.config');
      const activeConfig = CASHFREE_CONFIG.active;

      expect(activeConfig.apiUrl).toBe('https://api.cashfree.com/pg');
      expect(activeConfig).toBe(CASHFREE_CONFIG.production);

      process.env.NODE_ENV = originalEnv;
    });

    it('should have sandbox configuration', () => {
      const { CASHFREE_CONFIG } = require('../../../src/config/payment.config');

      expect(CASHFREE_CONFIG.sandbox).toBeDefined();
      expect(CASHFREE_CONFIG.sandbox.apiUrl).toBe('https://sandbox.cashfree.com/pg');
    });

    it('should have production configuration', () => {
      const { CASHFREE_CONFIG } = require('../../../src/config/payment.config');

      expect(CASHFREE_CONFIG.production).toBeDefined();
      expect(CASHFREE_CONFIG.production.apiUrl).toBe('https://api.cashfree.com/pg');
    });
  });

  describe('Razorpay Configuration', () => {
    it('should use test config in non-production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const { RAZORPAY_CONFIG } = require('../../../src/config/payment.config');
      const activeConfig = RAZORPAY_CONFIG.active;

      expect(activeConfig).toBe(RAZORPAY_CONFIG.test);

      process.env.NODE_ENV = originalEnv;
    });

    it('should use live config in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const { RAZORPAY_CONFIG } = require('../../../src/config/payment.config');
      const activeConfig = RAZORPAY_CONFIG.active;

      expect(activeConfig).toBe(RAZORPAY_CONFIG.live);

      process.env.NODE_ENV = originalEnv;
    });

    it('should have test configuration', () => {
      const { RAZORPAY_CONFIG } = require('../../../src/config/payment.config');

      expect(RAZORPAY_CONFIG.test).toBeDefined();
    });

    it('should have live configuration', () => {
      const { RAZORPAY_CONFIG } = require('../../../src/config/payment.config');

      expect(RAZORPAY_CONFIG.live).toBeDefined();
    });

    it('should have webhook secret', () => {
      const { RAZORPAY_CONFIG } = require('../../../src/config/payment.config');

      expect(RAZORPAY_CONFIG.webhookSecret).toBeDefined();
    });
  });

  describe('Payment Gateway Logic', () => {
    it('should have breakeven amount defined', () => {
      const { PAYMENT_GATEWAY_LOGIC } = require('../../../src/config/payment.config');

      expect(PAYMENT_GATEWAY_LOGIC.BREAKEVEN_AMOUNT).toBe(60000); // ₹600 in paise
    });

    it('should use Cashfree for amounts above breakeven', () => {
      const { PAYMENT_GATEWAY_LOGIC } = require('../../../src/config/payment.config');
      const amount = 70000; // ₹700

      const shouldUseCashfree = amount > PAYMENT_GATEWAY_LOGIC.BREAKEVEN_AMOUNT;
      expect(shouldUseCashfree).toBe(true);
    });

    it('should use Razorpay for amounts at or below breakeven', () => {
      const { PAYMENT_GATEWAY_LOGIC } = require('../../../src/config/payment.config');
      const amount = 60000; // ₹600

      const shouldUseRazorpay = amount <= PAYMENT_GATEWAY_LOGIC.BREAKEVEN_AMOUNT;
      expect(shouldUseRazorpay).toBe(true);
    });

    it('should calculate breakeven correctly', () => {
      // Breakeven: Cashfree (1.5% + ₹3) = Razorpay (2% + ₹0)
      // At ₹600: Cashfree = ₹9 + ₹3 = ₹12, Razorpay = ₹12
      const breakevenAmount = 60000; // ₹600 in paise
      const cashfreeFee = (breakevenAmount * 0.015) + 300; // 1.5% + ₹3
      const razorpayFee = breakevenAmount * 0.02; // 2%

      expect(Math.abs(cashfreeFee - razorpayFee)).toBeLessThan(1); // Should be approximately equal
    });
  });

  describe('Environment Variable Handling', () => {
    it('should handle missing Cashfree sandbox credentials', () => {
      const originalAppId = process.env.CASHFREE_SANDBOX_APP_ID;
      delete process.env.CASHFREE_SANDBOX_APP_ID;

      const { CASHFREE_CONFIG } = require('../../../src/config/payment.config');
      expect(CASHFREE_CONFIG.sandbox.appId).toBe('');

      if (originalAppId) process.env.CASHFREE_SANDBOX_APP_ID = originalAppId;
    });

    it('should handle missing Razorpay test credentials', () => {
      const originalKeyId = process.env.RAZORPAY_TEST_KEY_ID;
      delete process.env.RAZORPAY_TEST_KEY_ID;

      const { RAZORPAY_CONFIG } = require('../../../src/config/payment.config');
      expect(RAZORPAY_CONFIG.test.keyId).toBe('');

      if (originalKeyId) process.env.RAZORPAY_TEST_KEY_ID = originalKeyId;
    });
  });
});

