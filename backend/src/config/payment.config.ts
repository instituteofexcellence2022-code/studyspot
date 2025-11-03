// ============================================
// PAYMENT GATEWAY CONFIGURATION
// Cashfree + Razorpay (Both Approved)
// ============================================

import dotenv from 'dotenv';

dotenv.config();

// Cashfree configuration
export const CASHFREE_CONFIG = {
  sandbox: {
    appId: process.env.CASHFREE_SANDBOX_APP_ID || '',
    secretKey: process.env.CASHFREE_SANDBOX_SECRET_KEY || '',
    apiUrl: 'https://sandbox.cashfree.com/pg',
  },
  production: {
    appId: process.env.CASHFREE_APP_ID || '',
    secretKey: process.env.CASHFREE_SECRET_KEY || '',
    apiUrl: 'https://api.cashfree.com/pg',
  },
  get active() {
    return process.env.NODE_ENV === 'production' ? this.production : this.sandbox;
  },
};

// Razorpay configuration
export const RAZORPAY_CONFIG = {
  test: {
    keyId: process.env.RAZORPAY_TEST_KEY_ID || '',
    keySecret: process.env.RAZORPAY_TEST_KEY_SECRET || '',
  },
  live: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
  },
  webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  get active() {
    return process.env.NODE_ENV === 'production' ? this.live : this.test;
  },
};

// Payment gateway selection logic
export const PAYMENT_GATEWAY_LOGIC = {
  // Use Cashfree for amounts > ₹600 (breakeven point)
  // Use Razorpay for amounts <= ₹600
  BREAKEVEN_AMOUNT: 600 * 100, // in paise
};

