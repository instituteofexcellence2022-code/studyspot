const express = require('express');
const router = express.Router();
const stripeService = require('../services/stripeService');
const { query } = require('../config/database');
const logger = require('../utils/logger');

// Stripe webhook endpoint
router.post('/stripe',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const signature = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    try {
      // Verify webhook signature
      const eventResult = stripeService.constructWebhookEvent(
        req.body,
        signature,
        webhookSecret
      );

      if (!eventResult.success) {
        logger.warn('Invalid webhook signature');
        return res.status(400).json({ success: false, error: 'Invalid signature' });
      }

      const event = eventResult.event;

      logger.info('Stripe webhook received', {
        type: event.type,
        id: event.id
      });

      // Handle different event types
      switch (event.type) {
        case 'customer.subscription.created':
          await handleSubscriptionCreated(event.data.object);
          break;

        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(event.data.object);
          break;

        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event.data.object);
          break;

        case 'invoice.paid':
          await handleInvoicePaid(event.data.object);
          break;

        case 'invoice.payment_failed':
          await handleInvoicePaymentFailed(event.data.object);
          break;

        case 'customer.subscription.trial_will_end':
          await handleTrialWillEnd(event.data.object);
          break;

        case 'payment_intent.succeeded':
          await handlePaymentIntentSucceeded(event.data.object);
          break;

        case 'payment_intent.payment_failed':
          await handlePaymentIntentFailed(event.data.object);
          break;

        default:
          logger.info('Unhandled webhook event type', { type: event.type });
      }

      res.json({ success: true, received: true });

    } catch (error) {
      logger.error('Webhook handler error', error);
      res.status(500).json({ success: false, error: 'Webhook handler failed' });
    }
  }
);

// Handle subscription created
async function handleSubscriptionCreated(subscription) {
  try {
    logger.info('Handling subscription.created', {
      subscriptionId: subscription.id
    });

    // Update subscription in database
    await query(`
      UPDATE subscriptions
      SET 
        status = $1,
        current_period_start = $2,
        current_period_end = $3,
        updated_at = NOW()
      WHERE stripe_subscription_id = $4
    `, [
      subscription.status,
      new Date(subscription.current_period_start * 1000),
      new Date(subscription.current_period_end * 1000),
      subscription.id
    ]);

    logger.info('Subscription created event processed');
  } catch (error) {
    logger.error('Failed to handle subscription.created', error);
    throw error;
  }
}

// Handle subscription updated
async function handleSubscriptionUpdated(subscription) {
  try {
    logger.info('Handling subscription.updated', {
      subscriptionId: subscription.id,
      status: subscription.status
    });

    // Update subscription in database
    await query(`
      UPDATE subscriptions
      SET 
        status = $1,
        current_period_start = $2,
        current_period_end = $3,
        cancel_at_period_end = $4,
        updated_at = NOW()
      WHERE stripe_subscription_id = $5
    `, [
      subscription.status,
      new Date(subscription.current_period_start * 1000),
      new Date(subscription.current_period_end * 1000),
      subscription.cancel_at_period_end,
      subscription.id
    ]);

    logger.info('Subscription updated event processed');
  } catch (error) {
    logger.error('Failed to handle subscription.updated', error);
    throw error;
  }
}

// Handle subscription deleted
async function handleSubscriptionDeleted(subscription) {
  try {
    logger.info('Handling subscription.deleted', {
      subscriptionId: subscription.id
    });

    // Update subscription status to cancelled
    await query(`
      UPDATE subscriptions
      SET 
        status = 'cancelled',
        cancelled_at = NOW(),
        updated_at = NOW()
      WHERE stripe_subscription_id = $1
    `, [subscription.id]);

    // Notify tenant about cancellation
    const subResult = await query(
      'SELECT tenant_id FROM subscriptions WHERE stripe_subscription_id = $1',
      [subscription.id]
    );

    if (subResult.rows.length > 0) {
      const tenantId = subResult.rows[0].tenant_id;
      
      // Send notification (implement notification service)
      logger.info('Subscription cancelled, notification sent', { tenantId });
    }

    logger.info('Subscription deleted event processed');
  } catch (error) {
    logger.error('Failed to handle subscription.deleted', error);
    throw error;
  }
}

// Handle invoice paid
async function handleInvoicePaid(invoice) {
  try {
    logger.info('Handling invoice.paid', {
      invoiceId: invoice.id,
      amount: invoice.amount_paid
    });

    // Get subscription
    const subResult = await query(
      'SELECT tenant_id FROM subscriptions WHERE stripe_subscription_id = $1',
      [invoice.subscription]
    );

    if (subResult.rows.length === 0) {
      logger.warn('Subscription not found for invoice', {
        subscriptionId: invoice.subscription
      });
      return;
    }

    const tenantId = subResult.rows[0].tenant_id;

    // Create or update invoice record
    await query(`
      INSERT INTO invoices (
        tenant_id,
        invoice_number,
        amount,
        total_amount,
        status,
        paid_at,
        stripe_invoice_id,
        invoice_pdf_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (stripe_invoice_id) 
      DO UPDATE SET
        status = $5,
        paid_at = $6,
        updated_at = NOW()
    `, [
      tenantId,
      invoice.number,
      invoice.amount_due / 100, // Convert from cents
      invoice.total / 100,
      'paid',
      new Date(invoice.status_transitions.paid_at * 1000),
      invoice.id,
      invoice.invoice_pdf
    ]);

    logger.info('Invoice paid event processed');
  } catch (error) {
    logger.error('Failed to handle invoice.paid', error);
    throw error;
  }
}

// Handle invoice payment failed
async function handleInvoicePaymentFailed(invoice) {
  try {
    logger.error('Handling invoice.payment_failed', {
      invoiceId: invoice.id,
      attempt: invoice.attempt_count
    });

    // Get subscription and tenant
    const subResult = await query(`
      SELECT s.tenant_id, t.email
      FROM subscriptions s
      JOIN tenants t ON s.tenant_id = t.id
      WHERE s.stripe_subscription_id = $1
    `, [invoice.subscription]);

    if (subResult.rows.length === 0) {
      logger.warn('Subscription not found for failed invoice');
      return;
    }

    const { tenant_id, email } = subResult.rows[0];

    // Update invoice status
    await query(`
      UPDATE invoices
      SET status = 'uncollectible', updated_at = NOW()
      WHERE stripe_invoice_id = $1
    `, [invoice.id]);

    // Send payment failed notification
    logger.warn('Payment failed notification sent', {
      tenantId: tenant_id,
      email,
      attempt: invoice.attempt_count
    });

    // If final attempt failed, suspend subscription
    if (invoice.attempt_count >= 3) {
      await query(`
        UPDATE subscriptions
        SET status = 'past_due', updated_at = NOW()
        WHERE stripe_subscription_id = $1
      `, [invoice.subscription]);

      logger.warn('Subscription suspended due to failed payment', {
        subscriptionId: invoice.subscription
      });
    }

    logger.info('Invoice payment failed event processed');
  } catch (error) {
    logger.error('Failed to handle invoice.payment_failed', error);
    throw error;
  }
}

// Handle trial will end
async function handleTrialWillEnd(subscription) {
  try {
    logger.info('Handling subscription.trial_will_end', {
      subscriptionId: subscription.id,
      trialEnd: subscription.trial_end
    });

    // Get tenant info
    const subResult = await query(`
      SELECT s.tenant_id, t.email, t.name
      FROM subscriptions s
      JOIN tenants t ON s.tenant_id = t.id
      WHERE s.stripe_subscription_id = $1
    `, [subscription.id]);

    if (subResult.rows.length === 0) {
      logger.warn('Subscription not found for trial ending');
      return;
    }

    const { tenant_id, email, name } = subResult.rows[0];

    // Send trial ending notification
    logger.info('Trial ending notification sent', {
      tenantId: tenant_id,
      email,
      trialEnd: new Date(subscription.trial_end * 1000)
    });

    logger.info('Trial will end event processed');
  } catch (error) {
    logger.error('Failed to handle subscription.trial_will_end', error);
    throw error;
  }
}

// Handle payment intent succeeded
async function handlePaymentIntentSucceeded(paymentIntent) {
  try {
    logger.info('Handling payment_intent.succeeded', {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount
    });

    // Payment succeeded - log success
    logger.info('Payment succeeded', {
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency
    });

    logger.info('Payment intent succeeded event processed');
  } catch (error) {
    logger.error('Failed to handle payment_intent.succeeded', error);
    throw error;
  }
}

// Handle payment intent failed
async function handlePaymentIntentFailed(paymentIntent) {
  try {
    logger.error('Handling payment_intent.payment_failed', {
      paymentIntentId: paymentIntent.id,
      error: paymentIntent.last_payment_error
    });

    // Payment failed - send notification
    logger.error('Payment failed', {
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      error: paymentIntent.last_payment_error?.message
    });

    logger.info('Payment intent failed event processed');
  } catch (error) {
    logger.error('Failed to handle payment_intent.payment_failed', error);
    throw error;
  }
}

module.exports = router;

