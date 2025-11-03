const Stripe = require('stripe');
const logger = require('../utils/logger');
const {
  query
} = require('../config/database');
class StripeService {
  constructor() {
    if (!process.env.STRIPE_SECRET_KEY) {
      logger.warn('Stripe secret key not configured');
      this.stripe = null;
    } else {
      this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2023-10-16'
      });
    }
  }

  // Customer Management
  async createCustomer(email, metadata = {}) {
    try {
      const customer = await this.stripe.customers.create({
        email,
        metadata
      });
      logger.info('Stripe customer created', {
        customerId: customer.id,
        email
      });
      return {
        success: true,
        customer
      };
    } catch (error) {
      logger.error('Failed to create Stripe customer', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  async getCustomer(customerId) {
    try {
      const customer = await this.stripe.customers.retrieve(customerId);
      return {
        success: true,
        customer
      };
    } catch (error) {
      logger.error('Failed to retrieve Stripe customer', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  async updateCustomer(customerId, data) {
    try {
      const customer = await this.stripe.customers.update(customerId, data);
      logger.info('Stripe customer updated', {
        customerId
      });
      return {
        success: true,
        customer
      };
    } catch (error) {
      logger.error('Failed to update Stripe customer', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Subscription Management
  async createSubscription(customerId, priceId, metadata = {}) {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{
          price: priceId
        }],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription'
        },
        expand: ['latest_invoice.payment_intent'],
        metadata
      });
      logger.info('Stripe subscription created', {
        subscriptionId: subscription.id,
        customerId
      });
      return {
        success: true,
        subscription,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret
      };
    } catch (error) {
      logger.error('Failed to create Stripe subscription', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  async getSubscription(subscriptionId) {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      return {
        success: true,
        subscription
      };
    } catch (error) {
      logger.error('Failed to retrieve Stripe subscription', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  async updateSubscription(subscriptionId, data) {
    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, data);
      logger.info('Stripe subscription updated', {
        subscriptionId
      });
      return {
        success: true,
        subscription
      };
    } catch (error) {
      logger.error('Failed to update Stripe subscription', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  async cancelSubscription(subscriptionId, cancelAtPeriodEnd = true) {
    try {
      let subscription;
      if (cancelAtPeriodEnd) {
        subscription = await this.stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true
        });
      } else {
        subscription = await this.stripe.subscriptions.cancel(subscriptionId);
      }
      logger.info('Stripe subscription cancelled', {
        subscriptionId,
        immediate: !cancelAtPeriodEnd
      });
      return {
        success: true,
        subscription
      };
    } catch (error) {
      logger.error('Failed to cancel Stripe subscription', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  async upgradeSubscription(subscriptionId, newPriceId) {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      const updatedSubscription = await this.stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: subscription.items.data[0].id,
          price: newPriceId
        }],
        proration_behavior: 'create_prorations'
      });
      logger.info('Stripe subscription upgraded', {
        subscriptionId,
        newPriceId
      });
      return {
        success: true,
        subscription: updatedSubscription
      };
    } catch (error) {
      logger.error('Failed to upgrade Stripe subscription', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  async downgradeSubscription(subscriptionId, newPriceId) {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      const updatedSubscription = await this.stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: subscription.items.data[0].id,
          price: newPriceId
        }],
        proration_behavior: 'none',
        // Apply at period end
        billing_cycle_anchor: 'unchanged'
      });
      logger.info('Stripe subscription downgraded', {
        subscriptionId,
        newPriceId
      });
      return {
        success: true,
        subscription: updatedSubscription
      };
    } catch (error) {
      logger.error('Failed to downgrade Stripe subscription', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Price Management
  async createPrice(productId, amount, currency = 'inr', recurring = 'month') {
    try {
      const price = await this.stripe.prices.create({
        product: productId,
        unit_amount: amount,
        currency,
        recurring: {
          interval: recurring
        }
      });
      logger.info('Stripe price created', {
        priceId: price.id,
        amount
      });
      return {
        success: true,
        price
      };
    } catch (error) {
      logger.error('Failed to create Stripe price', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  async listPrices(productId = null) {
    try {
      const params = {
        active: true
      };
      if (productId) {
        params.product = productId;
      }
      const prices = await this.stripe.prices.list(params);
      return {
        success: true,
        prices: prices.data
      };
    } catch (error) {
      logger.error('Failed to list Stripe prices', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Product Management
  async createProduct(name, description, metadata = {}) {
    try {
      const product = await this.stripe.products.create({
        name,
        description,
        metadata
      });
      logger.info('Stripe product created', {
        productId: product.id,
        name
      });
      return {
        success: true,
        product
      };
    } catch (error) {
      logger.error('Failed to create Stripe product', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Invoice Management
  async getInvoice(invoiceId) {
    try {
      const invoice = await this.stripe.invoices.retrieve(invoiceId);
      return {
        success: true,
        invoice
      };
    } catch (error) {
      logger.error('Failed to retrieve Stripe invoice', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  async listInvoices(customerId, limit = 10) {
    try {
      const invoices = await this.stripe.invoices.list({
        customer: customerId,
        limit
      });
      return {
        success: true,
        invoices: invoices.data
      };
    } catch (error) {
      logger.error('Failed to list Stripe invoices', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  async createInvoice(customerId, items, metadata = {}) {
    try {
      const invoice = await this.stripe.invoices.create({
        customer: customerId,
        auto_advance: true,
        metadata
      });

      // Add invoice items
      for (const item of items) {
        await this.stripe.invoiceItems.create({
          customer: customerId,
          invoice: invoice.id,
          amount: item.amount,
          currency: item.currency || 'inr',
          description: item.description
        });
      }

      // Finalize the invoice
      const finalizedInvoice = await this.stripe.invoices.finalizeInvoice(invoice.id);
      logger.info('Stripe invoice created', {
        invoiceId: invoice.id
      });
      return {
        success: true,
        invoice: finalizedInvoice
      };
    } catch (error) {
      logger.error('Failed to create Stripe invoice', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Payment Intent Management
  async createPaymentIntent(amount, currency = 'inr', metadata = {}) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true
        }
      });
      logger.info('Payment intent created', {
        paymentIntentId: paymentIntent.id
      });
      return {
        success: true,
        paymentIntent,
        clientSecret: paymentIntent.client_secret
      };
    } catch (error) {
      logger.error('Failed to create payment intent', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  async confirmPaymentIntent(paymentIntentId) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId);
      logger.info('Payment intent confirmed', {
        paymentIntentId
      });
      return {
        success: true,
        paymentIntent
      };
    } catch (error) {
      logger.error('Failed to confirm payment intent', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Refund Management
  async createRefund(paymentIntentId, amount = null, reason = null) {
    try {
      const refundData = {
        payment_intent: paymentIntentId
      };
      if (amount) {
        refundData.amount = amount;
      }
      if (reason) {
        refundData.reason = reason;
      }
      const refund = await this.stripe.refunds.create(refundData);
      logger.info('Refund created', {
        refundId: refund.id,
        paymentIntentId
      });
      return {
        success: true,
        refund
      };
    } catch (error) {
      logger.error('Failed to create refund', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Webhook Management
  constructWebhookEvent(payload, signature, webhookSecret) {
    try {
      const event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      return {
        success: true,
        event
      };
    } catch (error) {
      logger.error('Webhook signature verification failed', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Usage Records (for metered billing)
  async createUsageRecord(subscriptionItemId, quantity, timestamp = null) {
    try {
      const usageRecord = await this.stripe.subscriptionItems.createUsageRecord(subscriptionItemId, {
        quantity,
        timestamp: timestamp || Math.floor(Date.now() / 1000),
        action: 'increment'
      });
      logger.info('Usage record created', {
        subscriptionItemId,
        quantity
      });
      return {
        success: true,
        usageRecord
      };
    } catch (error) {
      logger.error('Failed to create usage record', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Setup Intent (for saving payment methods)
  async createSetupIntent(customerId, metadata = {}) {
    try {
      const setupIntent = await this.stripe.setupIntents.create({
        customer: customerId,
        metadata,
        automatic_payment_methods: {
          enabled: true
        }
      });
      logger.info('Setup intent created', {
        setupIntentId: setupIntent.id
      });
      return {
        success: true,
        setupIntent,
        clientSecret: setupIntent.client_secret
      };
    } catch (error) {
      logger.error('Failed to create setup intent', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Payment Method Management
  async listPaymentMethods(customerId, type = 'card') {
    try {
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type
      });
      return {
        success: true,
        paymentMethods: paymentMethods.data
      };
    } catch (error) {
      logger.error('Failed to list payment methods', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  async attachPaymentMethod(paymentMethodId, customerId) {
    try {
      const paymentMethod = await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId
      });
      logger.info('Payment method attached', {
        paymentMethodId,
        customerId
      });
      return {
        success: true,
        paymentMethod
      };
    } catch (error) {
      logger.error('Failed to attach payment method', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  async detachPaymentMethod(paymentMethodId) {
    try {
      const paymentMethod = await this.stripe.paymentMethods.detach(paymentMethodId);
      logger.info('Payment method detached', {
        paymentMethodId
      });
      return {
        success: true,
        paymentMethod
      };
    } catch (error) {
      logger.error('Failed to detach payment method', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Coupon Management
  async createCoupon(percentOff, duration, metadata = {}) {
    try {
      const coupon = await this.stripe.coupons.create({
        percent_off: percentOff,
        duration,
        metadata
      });
      logger.info('Coupon created', {
        couponId: coupon.id
      });
      return {
        success: true,
        coupon
      };
    } catch (error) {
      logger.error('Failed to create coupon', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  async applyCoupon(subscriptionId, couponId) {
    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        coupon: couponId
      });
      logger.info('Coupon applied to subscription', {
        subscriptionId,
        couponId
      });
      return {
        success: true,
        subscription
      };
    } catch (error) {
      logger.error('Failed to apply coupon', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Subscription Schedule (for future changes)
  async createSubscriptionSchedule(customerId, phases, metadata = {}) {
    try {
      const schedule = await this.stripe.subscriptionSchedules.create({
        customer: customerId,
        start_date: 'now',
        end_behavior: 'release',
        phases,
        metadata
      });
      logger.info('Subscription schedule created', {
        scheduleId: schedule.id
      });
      return {
        success: true,
        schedule
      };
    } catch (error) {
      logger.error('Failed to create subscription schedule', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Portal Session (for customer self-service)
  async createPortalSession(customerId, returnUrl) {
    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl
      });
      logger.info('Portal session created', {
        customerId
      });
      return {
        success: true,
        session
      };
    } catch (error) {
      logger.error('Failed to create portal session', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}
module.exports = new StripeService();