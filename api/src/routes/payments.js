const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { verifyToken, setTenantContext } = require('../middleware/auth');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');
const Razorpay = require('razorpay');
const notificationService = require('../services/notificationService');
const analyticsService = require('../services/analyticsService');

const router = express.Router();

// Initialize Razorpay instance (only if credentials are provided)
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
  logger.info('Razorpay payment gateway initialized');
} else {
  logger.warn('Razorpay credentials not configured. Payment features will be limited.');
}

// Apply authentication and tenant context to all routes
router.use(verifyToken);
router.use(setTenantContext);

// Create payment intent (Razorpay)
router.post('/create-intent', [
  body('bookingId').isUUID().withMessage('Valid booking ID is required'),
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be greater than 0'),
  body('currency').optional().isString().default('INR')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }

  const { bookingId, amount, currency = 'INR' } = req.body;

  // Verify booking exists and belongs to user
  const bookingResult = await query(`
    SELECT b.id, b.user_id, b.total_amount, b.payment_status, b.status,
           l.name as library_name
    FROM bookings b
    JOIN libraries l ON b.library_id = l.id
    WHERE b.id = $1 AND b.user_id = $2
  `, [bookingId, req.user.id]);

  if (bookingResult.rows.length === 0) {
    throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
  }

  const booking = bookingResult.rows[0];

  // Check if payment is already completed
  if (booking.payment_status === 'completed') {
    throw new AppError('Payment already completed', 400, 'PAYMENT_ALREADY_COMPLETED');
  }

  // Validate amount
  if (amount !== booking.total_amount) {
    throw new AppError('Amount mismatch', 400, 'AMOUNT_MISMATCH');
  }

  // Create payment record
  const paymentResult = await query(`
    INSERT INTO payments (
      booking_id, user_id, amount, currency, payment_method, payment_gateway, status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, amount, currency, status, created_at
  `, [
    bookingId, req.user.id, amount, currency, 'online', 'razorpay', 'pending'
  ]);

  const payment = paymentResult.rows[0];

  // Create Razorpay order using real SDK
  const orderOptions = {
    amount: Math.round(amount * 100), // Convert to paise
    currency: currency,
    receipt: `booking_${bookingId}_${payment.id}`,
    notes: {
      booking_id: bookingId,
      user_id: req.user.id,
      library_name: booking.library_name
    }
  };

  try {
    if (!razorpay) {
      throw new Error('Razorpay is not configured. Please contact administrator.');
    }
    
    const razorpayOrder = await razorpay.orders.create(orderOptions);
    const razorpayOrderId = razorpayOrder.id;

    // Update payment with order ID
    await query(`
      UPDATE payments 
      SET gateway_order_id = $1, updated_at = NOW()
      WHERE id = $2
    `, [razorpayOrderId, payment.id]);

    logger.info('Razorpay order created successfully', {
      orderId: razorpayOrderId,
      paymentId: payment.id,
      amount: amount
    });
  } catch (error) {
    logger.error('Failed to create Razorpay order', error);
    
    // Update payment as failed
    await query(`
      UPDATE payments 
      SET status = 'failed', gateway_response = $1, updated_at = NOW()
      WHERE id = $2
    `, [JSON.stringify({ error: error.message }), payment.id]);

    throw new AppError('Failed to create payment order', 500, 'PAYMENT_ORDER_FAILED', {
      details: error.message
    });
  }

  // Log payment intent creation
  logger.logBusinessEvent('payment_intent_created', {
    paymentId: payment.id,
    bookingId,
    userId: req.user.id,
    amount,
    currency
  });

  // Get the updated payment with order ID
  const updatedPayment = await query(`
    SELECT gateway_order_id FROM payments WHERE id = $1
  `, [payment.id]);

  const orderId = updatedPayment.rows[0].gateway_order_id;

  res.json({
    success: true,
    data: {
      paymentId: payment.id,
      orderId: orderId,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      booking: {
        id: bookingId,
        libraryName: booking.library_name
      },
      razorpayConfig: {
        key: process.env.RAZORPAY_KEY_ID,
        orderId: orderId,
        amount: Math.round(amount * 100), // Convert to paise
        currency: currency,
        name: 'StudySpot',
        description: `Payment for ${booking.library_name}`,
        prefill: {
          email: req.user.email
        }
      }
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Verify payment (Razorpay webhook)
router.post('/verify', [
  body('razorpay_order_id').isString().withMessage('Razorpay order ID is required'),
  body('razorpay_payment_id').isString().withMessage('Razorpay payment ID is required'),
  body('razorpay_signature').isString().withMessage('Razorpay signature is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  // Find payment record
  const paymentResult = await query(`
    SELECT p.id, p.booking_id, p.user_id, p.amount, p.status,
           b.status as booking_status
    FROM payments p
    JOIN bookings b ON p.booking_id = b.id
    WHERE p.gateway_order_id = $1
  `, [razorpay_order_id]);

  if (paymentResult.rows.length === 0) {
    throw new AppError('Payment not found', 404, 'PAYMENT_NOT_FOUND');
  }

  const payment = paymentResult.rows[0];

  // Verify signature using Razorpay SDK
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    logger.error('Payment signature verification failed', {
      paymentId: payment.id,
      orderId: razorpay_order_id,
      paymentId_gateway: razorpay_payment_id
    });

    // Update payment as failed
    await query(`
      UPDATE payments 
      SET status = 'failed', gateway_response = $1, updated_at = NOW()
      WHERE id = $2
    `, [JSON.stringify({ error: 'Invalid signature' }), payment.id]);

    throw new AppError('Invalid payment signature', 400, 'INVALID_SIGNATURE');
  }

  // Verify payment with Razorpay
  try {
    const razorpayPayment = await razorpay.payments.fetch(razorpay_payment_id);
    
    if (razorpayPayment.status !== 'captured') {
      throw new Error(`Payment not captured. Status: ${razorpayPayment.status}`);
    }

    logger.info('Payment verified successfully with Razorpay', {
      paymentId: payment.id,
      razorpayPaymentId: razorpay_payment_id,
      amount: razorpayPayment.amount / 100 // Convert from paise
    });
  } catch (error) {
    logger.error('Razorpay payment verification failed', error);
    
    // Update payment as failed
    await query(`
      UPDATE payments 
      SET status = 'failed', gateway_response = $1, updated_at = NOW()
      WHERE id = $2
    `, [JSON.stringify({ error: error.message }), payment.id]);

    throw new AppError('Payment verification failed', 400, 'PAYMENT_VERIFICATION_FAILED', {
      details: error.message
    });
  }

  // Update payment as completed
  await query(`
    UPDATE payments 
    SET status = 'completed', gateway_payment_id = $1, 
        gateway_response = $2, updated_at = NOW()
    WHERE id = $3
  `, [
    razorpay_payment_id,
    JSON.stringify({ order_id: razorpay_order_id, payment_id: razorpay_payment_id }),
    payment.id
  ]);

  // Update booking payment status
  await query(`
    UPDATE bookings 
    SET payment_status = 'completed', updated_at = NOW()
    WHERE id = $1
  `, [payment.booking_id]);

  // Send multi-channel notification
  await notificationService.sendTemplateNotification(payment.user_id, 'payment_successful', {
    amount: payment.amount,
    transactionId: razorpay_payment_id,
    bookingId: payment.booking_id
  }, ['in_app', 'email']);

  // Track analytics event
  await analyticsService.trackEvent(payment.user_id, 'payment_completed', {
    paymentId: payment.id,
    bookingId: payment.booking_id,
    amount: payment.amount,
    gatewayPaymentId: razorpay_payment_id
  });

  // Log successful payment
  logger.logBusinessEvent('payment_completed', {
    paymentId: payment.id,
    bookingId: payment.booking_id,
    userId: payment.user_id,
    amount: payment.amount,
    gatewayPaymentId: razorpay_payment_id
  });

  res.json({
    success: true,
    data: {
      paymentId: payment.id,
      bookingId: payment.booking_id,
      status: 'completed',
      message: 'Payment verified successfully'
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Get payment history
router.get('/', asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, dateFrom, dateTo } = req.query;
  const offset = (page - 1) * limit;

  let whereClause = 'WHERE p.user_id = $1';
  const queryParams = [req.user.id];
  let paramCount = 1;

  if (status) {
    whereClause += ` AND p.status = $${++paramCount}`;
    queryParams.push(status);
  }

  if (dateFrom) {
    whereClause += ` AND p.created_at >= $${++paramCount}`;
    queryParams.push(dateFrom);
  }

  if (dateTo) {
    whereClause += ` AND p.created_at <= $${++paramCount}`;
    queryParams.push(dateTo);
  }

  const paymentsQuery = `
    SELECT 
      p.id, p.amount, p.currency, p.payment_method, p.payment_gateway,
      p.status, p.gateway_payment_id, p.gateway_order_id, p.created_at,
      b.booking_date, b.start_time, b.end_time,
      l.name as library_name
    FROM payments p
    JOIN bookings b ON p.booking_id = b.id
    JOIN libraries l ON b.library_id = l.id
    ${whereClause}
    ORDER BY p.created_at DESC
    LIMIT $${++paramCount} OFFSET $${++paramCount}
  `;

  queryParams.push(limit, offset);

  const payments = await query(paymentsQuery, queryParams);

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM payments p
    ${whereClause}
  `;
  const countResult = await query(countQuery, queryParams.slice(0, -2));
  const total = parseInt(countResult.rows[0].total);

  res.json({
    success: true,
    data: payments.rows.map(payment => ({
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: payment.payment_method,
      paymentGateway: payment.payment_gateway,
      status: payment.status,
      gatewayPaymentId: payment.gateway_payment_id,
      gatewayOrderId: payment.gateway_order_id,
      createdAt: payment.created_at,
      booking: {
        date: payment.booking_date,
        timeSlot: {
          startTime: payment.start_time,
          endTime: payment.end_time
        },
        library: {
          name: payment.library_name
        }
      }
    })),
    meta: {
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      },
      timestamp: new Date().toISOString()
    }
  });
}));

// Get specific payment
router.get('/:paymentId', asyncHandler(async (req, res) => {
  const { paymentId } = req.params;

  const paymentResult = await query(`
    SELECT 
      p.id, p.amount, p.currency, p.payment_method, p.payment_gateway,
      p.status, p.gateway_payment_id, p.gateway_order_id, p.gateway_response,
      p.refund_amount, p.refund_reason, p.created_at, p.updated_at,
      b.id as booking_id, b.booking_date, b.start_time, b.end_time,
      l.name as library_name, l.address as library_address
    FROM payments p
    JOIN bookings b ON p.booking_id = b.id
    JOIN libraries l ON b.library_id = l.id
    WHERE p.id = $1 AND p.user_id = $2
  `, [paymentId, req.user.id]);

  if (paymentResult.rows.length === 0) {
    throw new AppError('Payment not found', 404, 'PAYMENT_NOT_FOUND');
  }

  const payment = paymentResult.rows[0];

  res.json({
    success: true,
    data: {
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: payment.payment_method,
      paymentGateway: payment.payment_gateway,
      status: payment.status,
      gatewayPaymentId: payment.gateway_payment_id,
      gatewayOrderId: payment.gateway_order_id,
      gatewayResponse: payment.gateway_response,
      refundAmount: payment.refund_amount,
      refundReason: payment.refund_reason,
      createdAt: payment.created_at,
      updatedAt: payment.updated_at,
      booking: {
        id: payment.booking_id,
        date: payment.booking_date,
        timeSlot: {
          startTime: payment.start_time,
          endTime: payment.end_time
        },
        library: {
          name: payment.library_name,
          address: payment.library_address
        }
      }
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Request refund
router.post('/:paymentId/refund', [
  body('reason').trim().isLength({ min: 1 }).withMessage('Refund reason is required'),
  body('amount').optional().isFloat({ min: 0.01 }).withMessage('Invalid refund amount')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      details: errors.array()
    });
  }

  const { paymentId } = req.params;
  const { reason, amount } = req.body;

  // Check if payment exists and belongs to user
  const paymentResult = await query(`
    SELECT p.id, p.amount, p.status, p.gateway_payment_id,
           b.id as booking_id, b.status as booking_status, b.booking_date
    FROM payments p
    JOIN bookings b ON p.booking_id = b.id
    WHERE p.id = $1 AND p.user_id = $2
  `, [paymentId, req.user.id]);

  if (paymentResult.rows.length === 0) {
    throw new AppError('Payment not found', 404, 'PAYMENT_NOT_FOUND');
  }

  const payment = paymentResult.rows[0];

  // Check if payment is eligible for refund
  if (payment.status !== 'completed') {
    throw new AppError('Payment is not completed', 400, 'PAYMENT_NOT_COMPLETED');
  }

  // Check if booking is in the past
  const bookingDate = new Date(payment.booking_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (bookingDate < today) {
    throw new AppError('Cannot refund payment for past bookings', 400, 'CANNOT_REFUND_PAST_BOOKING');
  }

  // Calculate refund amount
  const refundAmount = amount || payment.amount;

  if (refundAmount > payment.amount) {
    throw new AppError('Refund amount cannot exceed payment amount', 400, 'INVALID_REFUND_AMOUNT');
  }

  // Update payment with refund information
  await query(`
    UPDATE payments 
    SET refund_amount = $1, refund_reason = $2, status = 'refunded', updated_at = NOW()
    WHERE id = $3
  `, [refundAmount, reason, paymentId]);

  // Update booking status if full refund
  if (refundAmount === payment.amount) {
    await query(`
      UPDATE bookings 
      SET status = 'cancelled', payment_status = 'refunded', updated_at = NOW()
      WHERE id = $1
    `, [payment.booking_id]);
  }

  // Send multi-channel notification
  await notificationService.sendMultiChannelNotification(req.user.id, {
    title: 'Refund Processed',
    message: `Your refund request for ₹${refundAmount} has been processed. The amount will be credited to your account within 5-7 business days.`,
    type: 'payment',
    data: { paymentId, refundAmount, reason },
    channels: ['in_app', 'email']
  });

  // Log refund request
  logger.logBusinessEvent('refund_requested', {
    paymentId,
    bookingId: payment.booking_id,
    userId: req.user.id,
    refundAmount,
    reason
  });

  res.json({
    success: true,
    data: {
      paymentId,
      refundAmount,
      reason,
      status: 'refunded',
      message: 'Refund processed successfully'
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Razorpay webhook endpoint
router.post('/webhook/razorpay', asyncHandler(async (req, res) => {
  const { event, contains, payload } = req.body;

  // Verify webhook signature
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];
  
  if (webhookSecret && signature) {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (expectedSignature !== signature) {
      logger.error('Invalid webhook signature', { event, signature });
      return res.status(400).json({ error: 'Invalid signature' });
    }
  }

  logger.info('Razorpay webhook received', { event, contains });

  try {
    switch (event) {
      case 'payment.captured':
        await handlePaymentCaptured(payload.payment.entity);
        break;
      
      case 'payment.failed':
        await handlePaymentFailed(payload.payment.entity);
        break;
      
      case 'refund.created':
        await handleRefundCreated(payload.refund.entity);
        break;
      
      default:
        logger.info('Unhandled webhook event', { event });
    }

    res.json({ success: true, message: 'Webhook processed successfully' });
  } catch (error) {
    logger.error('Webhook processing failed', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}));

// Helper function to handle payment captured event
async function handlePaymentCaptured(paymentEntity) {
  const { id: razorpayPaymentId, order_id: razorpayOrderId, amount, status } = paymentEntity;

  // Find payment record
  const paymentResult = await query(`
    SELECT p.id, p.booking_id, p.user_id, p.status
    FROM payments p
    WHERE p.gateway_order_id = $1
  `, [razorpayOrderId]);

  if (paymentResult.rows.length === 0) {
    logger.error('Payment not found for webhook', { razorpayOrderId, razorpayPaymentId });
    return;
  }

  const payment = paymentResult.rows[0];

  // Update payment status if not already completed
  if (payment.status !== 'completed') {
    await query(`
      UPDATE payments 
      SET status = 'completed', gateway_payment_id = $1, 
          gateway_response = $2, updated_at = NOW()
      WHERE id = $3
    `, [
      razorpayPaymentId,
      JSON.stringify(paymentEntity),
      payment.id
    ]);

    // Update booking payment status
    await query(`
      UPDATE bookings 
      SET payment_status = 'completed', updated_at = NOW()
      WHERE id = $1
    `, [payment.booking_id]);

    logger.info('Payment completed via webhook', {
      paymentId: payment.id,
      bookingId: payment.booking_id,
      razorpayPaymentId
    });
  }
}

// Helper function to handle payment failed event
async function handlePaymentFailed(paymentEntity) {
  const { id: razorpayPaymentId, order_id: razorpayOrderId, error_description } = paymentEntity;

  // Find payment record
  const paymentResult = await query(`
    SELECT p.id, p.booking_id, p.user_id
    FROM payments p
    WHERE p.gateway_order_id = $1
  `, [razorpayOrderId]);

  if (paymentResult.rows.length === 0) {
    logger.error('Payment not found for webhook', { razorpayOrderId, razorpayPaymentId });
    return;
  }

  const payment = paymentResult.rows[0];

  // Update payment as failed
  await query(`
    UPDATE payments 
    SET status = 'failed', gateway_response = $1, updated_at = NOW()
    WHERE id = $2
  `, [JSON.stringify(paymentEntity), payment.id]);

  logger.info('Payment failed via webhook', {
    paymentId: payment.id,
    bookingId: payment.booking_id,
    error: error_description
  });
}

// Helper function to handle refund created event
async function handleRefundCreated(refundEntity) {
  const { id: refundId, payment_id: razorpayPaymentId, amount, status } = refundEntity;

  // Find payment record
  const paymentResult = await query(`
    SELECT p.id, p.booking_id, p.user_id
    FROM payments p
    WHERE p.gateway_payment_id = $1
  `, [razorpayPaymentId]);

  if (paymentResult.rows.length === 0) {
    logger.error('Payment not found for refund webhook', { razorpayPaymentId, refundId });
    return;
  }

  const payment = paymentResult.rows[0];

  // Update payment with refund information
  await query(`
    UPDATE payments 
    SET refund_amount = $1, refund_reason = 'Processed via Razorpay', 
        status = 'refunded', updated_at = NOW()
    WHERE id = $2
  `, [amount / 100, payment.id]); // Convert from paise

  logger.info('Refund processed via webhook', {
    paymentId: payment.id,
    bookingId: payment.booking_id,
    refundAmount: amount / 100,
    refundId
  });
}

module.exports = router;
