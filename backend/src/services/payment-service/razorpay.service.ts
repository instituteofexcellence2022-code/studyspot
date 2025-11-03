// ============================================
// RAZORPAY SERVICE
// Razorpay Payment Gateway Integration
// ============================================

import Razorpay from 'razorpay';
import crypto from 'crypto';
import { RAZORPAY_CONFIG } from '../../config/payment.config';
import { logger } from '../../utils/logger';

interface RazorpayOrderRequest {
  amount: number; // in paise
  currency: 'INR';
  receipt: string;
  notes?: Record<string, string>;
}

class RazorpayService {
  private razorpay: Razorpay;
  private config = RAZORPAY_CONFIG.active;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: this.config.keyId,
      key_secret: this.config.keySecret,
    });
  }

  /**
   * Create payment order
   */
  async createOrder(orderData: RazorpayOrderRequest): Promise<any> {
    try {
      const order = await this.razorpay.orders.create(orderData);
      logger.info('Razorpay order created', { orderId: orderData.receipt });
      return order;
    } catch (error: any) {
      logger.error('Razorpay create order error:', error);
      throw new Error(`Razorpay order creation failed: ${error.message}`);
    }
  }

  /**
   * Verify payment signature
   */
  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
    const text = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.config.keySecret)
      .update(text)
      .digest('hex');

    return expectedSignature === signature;
  }

  /**
   * Fetch payment details
   */
  async fetchPayment(paymentId: string): Promise<any> {
    try {
      const payment = await this.razorpay.payments.fetch(paymentId);
      return payment;
    } catch (error: any) {
      logger.error('Razorpay fetch payment error:', error);
      throw new Error('Payment fetch failed');
    }
  }

  /**
   * Process refund
   */
  async processRefund(paymentId: string, amount?: number): Promise<any> {
    try {
      const refund = await this.razorpay.payments.refund(paymentId, {
        amount: amount,
      });
      logger.info('Razorpay refund processed', { paymentId });
      return refund;
    } catch (error: any) {
      logger.error('Razorpay refund error:', error);
      throw new Error('Refund processing failed');
    }
  }

  /**
   * Create subscription
   */
  async createSubscription(planId: string, totalCount: number): Promise<any> {
    try {
      const subscription = await this.razorpay.subscriptions.create({
        plan_id: planId,
        customer_notify: 1,
        total_count: totalCount,
        quantity: 1,
      });
      return subscription;
    } catch (error: any) {
      logger.error('Razorpay create subscription error:', error);
      throw new Error('Subscription creation failed');
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<any> {
    try {
      const subscription = await this.razorpay.subscriptions.cancel(subscriptionId);
      return subscription;
    } catch (error: any) {
      logger.error('Razorpay cancel subscription error:', error);
      throw new Error('Subscription cancellation failed');
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(body: string, signature: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_CONFIG.webhookSecret)
      .update(body)
      .digest('hex');

    return expectedSignature === signature;
  }
}

export default new RazorpayService();

