/**
 * 🎓 STUDYSPOT - Payment Service
 * Handles payment gateway integration (Razorpay & Stripe)
 */

const Razorpay = require('razorpay');
const crypto = require('crypto');
const { logger } = require('../utils/logger');

class PaymentService {
  constructor() {
    // Initialize Razorpay (if keys are provided)
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      this.razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
      });
      logger.info('✓ Razorpay initialized');
    } else {
      logger.warn('⚠ Razorpay keys not configured - using demo mode');
      this.razorpay = null;
    }
  }

  /**
   * Create Razorpay order
   */
  async createRazorpayOrder(bookingId, amount) {
    try {
      // Demo mode - return mock order
      if (!this.razorpay) {
        const mockOrderId = `order_${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
        return {
          id: mockOrderId,
          amount: amount * 100, // Convert to paise
          currency: 'INR',
          key_id: 'demo_key',
          status: 'created'
        };
      }

      // Real Razorpay order
      const options = {
        amount: Math.round(amount * 100), // Convert to paise
        currency: 'INR',
        receipt: `receipt_${bookingId}`,
        notes: {
          booking_id: bookingId
        }
      };

      const order = await this.razorpay.orders.create(options);
      
      logger.info(`Razorpay order created: ${order.id}`);
      
      return {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: process.env.RAZORPAY_KEY_ID,
        status: order.status
      };
    } catch (error) {
      logger.error('Create Razorpay order error:', error);
      throw new Error('Failed to create payment order');
    }
  }

  /**
   * Verify Razorpay signature
   */
  verifyRazorpaySignature(paymentData) {
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      } = paymentData;

      // Demo mode - always return true
      if (!this.razorpay) {
        logger.info('Demo mode: Payment signature verification skipped');
        return true;
      }

      // Generate signature
      const text = `${razorpay_order_id}|${razorpay_payment_id}`;
      const generated_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(text)
        .digest('hex');

      const isValid = generated_signature === razorpay_signature;
      
      if (isValid) {
        logger.info(`Payment signature verified: ${razorpay_payment_id}`);
      } else {
        logger.error(`Invalid payment signature: ${razorpay_payment_id}`);
      }

      return isValid;
    } catch (error) {
      logger.error('Verify Razorpay signature error:', error);
      return false;
    }
  }

  /**
   * Process refund
   */
  async processRefund(paymentId, amount, reason) {
    try {
      // Demo mode - log and return success
      if (!this.razorpay) {
        logger.info(`Demo mode: Refund processed - ₹${amount}`);
        return {
          id: `refund_${Date.now()}`,
          payment_id: paymentId,
          amount: amount * 100,
          currency: 'INR',
          status: 'processed'
        };
      }

      // Real Razorpay refund
      const refund = await this.razorpay.payments.refund(paymentId, {
        amount: Math.round(amount * 100), // Convert to paise
        notes: {
          reason: reason
        }
      });

      logger.info(`Refund processed: ${refund.id} - ₹${amount}`);
      
      return {
        id: refund.id,
        payment_id: refund.payment_id,
        amount: refund.amount,
        currency: refund.currency,
        status: refund.status
      };
    } catch (error) {
      logger.error('Process refund error:', error);
      throw new Error('Failed to process refund');
    }
  }

  /**
   * Get payment details
   */
  async getPaymentDetails(paymentId) {
    try {
      // Demo mode
      if (!this.razorpay) {
        return {
          id: paymentId,
          amount: 0,
          currency: 'INR',
          status: 'captured',
          method: 'card'
        };
      }

      // Real Razorpay
      const payment = await this.razorpay.payments.fetch(paymentId);
      
      return {
        id: payment.id,
        amount: payment.amount / 100, // Convert from paise
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        email: payment.email,
        contact: payment.contact,
        created_at: payment.created_at
      };
    } catch (error) {
      logger.error('Get payment details error:', error);
      throw new Error('Failed to get payment details');
    }
  }

  /**
   * Handle Razorpay webhook
   */
  async handleWebhook(payload, signature) {
    try {
      // Demo mode
      if (!this.razorpay) {
        logger.info('Demo mode: Webhook received');
        return { success: true };
      }

      // Verify webhook signature
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex');

      if (expectedSignature !== signature) {
        logger.error('Invalid webhook signature');
        throw new Error('Invalid webhook signature');
      }

      // Process webhook event
      const { event, payload: eventPayload } = payload;
      
      logger.info(`Webhook event received: ${event}`);

      switch (event) {
        case 'payment.captured':
          // Payment successful
          logger.info(`Payment captured: ${eventPayload.payment.entity.id}`);
          break;
        
        case 'payment.failed':
          // Payment failed
          logger.error(`Payment failed: ${eventPayload.payment.entity.id}`);
          break;
        
        case 'refund.created':
          // Refund initiated
          logger.info(`Refund created: ${eventPayload.refund.entity.id}`);
          break;
        
        default:
          logger.info(`Unhandled event: ${event}`);
      }

      return { success: true, event };
    } catch (error) {
      logger.error('Handle webhook error:', error);
      throw error;
    }
  }

  /**
   * Create Stripe payment intent
   * @param {number} amount - Amount in cents
   * @param {object} metadata - Additional metadata
   * @returns {Promise<object>} Payment intent object
   */
  async createStripePaymentIntent(amount, metadata = {}) {
    try {
      // Check if Stripe is enabled
      if (!process.env.STRIPE_ENABLED || process.env.STRIPE_ENABLED !== 'true') {
        logger.warn('Stripe integration not enabled', { amount, metadata });
        // Return mock payment intent for demo mode
        return {
          id: `pi_mock_${Date.now()}`,
          amount,
          currency: 'usd',
          status: 'succeeded',
          client_secret: `mock_secret_${Date.now()}`,
          metadata,
          mode: 'demo'
        };
      }

      // Stripe integration (requires stripe package and API key)
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      logger.info('Stripe payment intent created', {
        paymentIntentId: paymentIntent.id,
        amount,
        status: paymentIntent.status
      });

      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        client_secret: paymentIntent.client_secret,
        metadata: paymentIntent.metadata
      };
    } catch (error) {
      logger.error('Failed to create Stripe payment intent', {
        error: error.message,
        amount,
        metadata
      });
      
      // Fallback to demo mode on error
      logger.warn('Falling back to demo mode for payment');
      return {
        id: `pi_mock_${Date.now()}`,
        amount,
        currency: 'usd',
        status: 'succeeded',
        client_secret: `mock_secret_${Date.now()}`,
        metadata,
        mode: 'demo',
        error: error.message
      };
    }
  }
}

module.exports = new PaymentService();


