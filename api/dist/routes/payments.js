const express = require('express');
const router = express.Router();
const {
  body,
  query,
  param,
  validationResult
} = require('express-validator');
const {
  verifyToken
} = require('../middleware/auth');
const {
  query: dbQuery
} = require('../config/database');
const {
  logger
} = require('../utils/logger');

// =====================================================
// VALIDATION MIDDLEWARE
// =====================================================

const validatePayment = [body('studentName').notEmpty().trim().withMessage('Student name is required'), body('amount').isFloat({
  min: 0.01
}).withMessage('Amount must be greater than 0'), body('paymentMethod').isIn(['cash', 'cheque', 'bank_transfer', 'online', 'upi', 'card', 'net_banking']).withMessage('Invalid payment method'), body('description').notEmpty().trim().withMessage('Description is required'), body('receivedBy').notEmpty().trim().withMessage('Staff name (received by) is required'), body('staffConfirmation').isBoolean().withMessage('Staff confirmation must be boolean'), body('transactionDate').optional().isISO8601().withMessage('Invalid date format')];
const validateVerification = [body('verificationStatus').isIn(['approved', 'rejected', 'on_hold']).withMessage('Invalid verification status'), body('verificationNotes').optional().trim(), body('rejectionReason').optional().trim()];

// =====================================================
// HELPER FUNCTIONS
// =====================================================

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// =====================================================
// ROUTES
// =====================================================

/**
 * @route   GET /api/payments
 * @desc    Get all payments with filters
 * @access  Private
 */
router.get('/', verifyToken, [query('page').optional().isInt({
  min: 1
}).withMessage('Page must be positive integer'), query('limit').optional().isInt({
  min: 1,
  max: 100
}).withMessage('Limit must be 1-100'), query('status').optional().isIn(['pending', 'completed', 'failed', 'refunded', 'cancelled']), query('method').optional().isIn(['cash', 'cheque', 'bank_transfer', 'online', 'upi', 'card', 'net_banking']), query('verified').optional().isBoolean(), query('search').optional().trim(), query('startDate').optional().isISO8601(), query('endDate').optional().isISO8601()], handleValidationErrors, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      method,
      verified,
      search,
      startDate,
      endDate,
      sortBy = 'transaction_date',
      sortOrder = 'DESC'
    } = req.query;
    const offset = (page - 1) * limit;
    const tenantId = req.user.tenantId;

    // Build WHERE clause
    let whereConditions = ['p.tenant_id = $1', 'p.deleted_at IS NULL'];
    let queryParams = [tenantId];
    let paramIndex = 2;
    if (status) {
      whereConditions.push(`p.payment_status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }
    if (method) {
      whereConditions.push(`p.payment_method = $${paramIndex}`);
      queryParams.push(method);
      paramIndex++;
    }
    if (verified !== undefined) {
      whereConditions.push(`p.is_verified = $${paramIndex}`);
      queryParams.push(verified === 'true');
      paramIndex++;
    }
    if (search) {
      whereConditions.push(`(
          p.student_name ILIKE $${paramIndex} OR 
          p.student_email ILIKE $${paramIndex} OR 
          p.invoice_number ILIKE $${paramIndex} OR
          p.received_by ILIKE $${paramIndex} OR
          p.description ILIKE $${paramIndex}
        )`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }
    if (startDate) {
      whereConditions.push(`p.transaction_date >= $${paramIndex}`);
      queryParams.push(startDate);
      paramIndex++;
    }
    if (endDate) {
      whereConditions.push(`p.transaction_date <= $${paramIndex}`);
      queryParams.push(endDate);
      paramIndex++;
    }
    const whereClause = whereConditions.join(' AND ');

    // Validate sort column
    const allowedSortColumns = ['transaction_date', 'amount', 'created_at', 'student_name'];
    const sortColumn = allowedSortColumns.includes(sortBy) ? sortBy : 'transaction_date';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Get total count
    const countQuery = `
        SELECT COUNT(*) as total
        FROM payments p
        WHERE ${whereClause}
      `;
    const countResult = await dbQuery(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Get paginated payments with verification status
    const paymentsQuery = `
        SELECT 
          p.*,
          pvq.verification_status as queue_status,
          pvq.priority as queue_priority,
          pvq.is_overdue,
          pvq.submitted_at as queue_submitted_at,
          pvq.verified_at as queue_verified_at
        FROM payments p
        LEFT JOIN payment_verification_queue pvq ON p.id = pvq.payment_id
        WHERE ${whereClause}
        ORDER BY p.${sortColumn} ${order}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
    queryParams.push(limit, offset);
    const paymentsResult = await dbQuery(paymentsQuery, queryParams);
    logger.info('Payments fetched', {
      userId: req.user.id,
      tenantId,
      total,
      page,
      filters: {
        status,
        method,
        verified,
        search
      }
    });
    res.json({
      success: true,
      data: {
        payments: paymentsResult.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/payments/offline
 * @desc    Create offline payment (cash/cheque/bank transfer) with staff confirmation
 * @access  Private
 */
router.post('/offline', verifyToken, validatePayment, handleValidationErrors, async (req, res) => {
  try {
    const {
      studentName,
      studentId,
      studentEmail,
      studentPhone,
      amount,
      paymentMethod,
      description,
      transactionDate,
      chequeNumber,
      chequeDate,
      bankName,
      referenceNumber,
      notes,
      receivedBy,
      staffConfirmation,
      feePlanId,
      billingCycle
    } = req.body;
    const tenantId = req.user.tenantId;
    const staffId = req.user.id;

    // Validate staff confirmation
    if (!staffConfirmation) {
      return res.status(400).json({
        success: false,
        message: 'Staff must confirm receipt of payment'
      });
    }

    // Validate payment method specific fields
    if (paymentMethod === 'cheque' && !chequeNumber) {
      return res.status(400).json({
        success: false,
        message: 'Cheque number is required for cheque payments'
      });
    }
    if (paymentMethod === 'bank_transfer' && !referenceNumber) {
      return res.status(400).json({
        success: false,
        message: 'Reference number is required for bank transfers'
      });
    }

    // Insert payment
    const insertQuery = `
        INSERT INTO payments (
          tenant_id,
          student_id,
          student_name,
          student_email,
          student_phone,
          amount,
          payment_method,
          payment_status,
          transaction_date,
          description,
          cheque_number,
          cheque_date,
          bank_name,
          reference_number,
          notes,
          received_by,
          staff_confirmation,
          staff_id,
          fee_plan_id,
          billing_cycle,
          is_verified
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
        RETURNING *
      `;
    const values = [tenantId, studentId || null, studentName, studentEmail || null, studentPhone || null, amount, paymentMethod, 'pending',
    // Status starts as pending
    transactionDate || new Date(), description, chequeNumber || null, chequeDate || null, bankName || null, referenceNumber || null, notes || null, receivedBy, staffConfirmation, staffId, feePlanId || null, billingCycle || null, false // Not verified yet
    ];
    const result = await dbQuery(insertQuery, values);
    const payment = result.rows[0];

    // Add to verification queue
    const queueQuery = `
        INSERT INTO payment_verification_queue (
          payment_id,
          verification_status,
          priority,
          submitted_by,
          submitted_by_id,
          due_date
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
    const queueValues = [payment.id, 'pending', paymentMethod === 'cash' ? 1 : 2,
    // Cash gets higher priority
    receivedBy, staffId, new Date(Date.now() + 24 * 60 * 60 * 1000) // Due in 24 hours
    ];
    await dbQuery(queueQuery, queueValues);
    logger.info('Offline payment created', {
      paymentId: payment.id,
      studentName,
      amount,
      method: paymentMethod,
      receivedBy,
      staffId: req.user.id
    });
    res.status(201).json({
      success: true,
      message: 'Payment submitted successfully and added to verification queue',
      data: {
        payment
      }
    });
  } catch (error) {
    logger.error('Error creating offline payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/payments/verification-queue
 * @desc    Get payment verification queue
 * @access  Private (Admin/Manager)
 */
router.get('/verification-queue', verifyToken, async (req, res) => {
  try {
    const {
      status = 'pending',
      priority = 'all'
    } = req.query;
    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;
    if (status !== 'all') {
      whereConditions.push(`pvq.verification_status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }
    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
    const query = `
        SELECT 
          pvq.*,
          p.student_name,
          p.amount,
          p.payment_method,
          p.description,
          p.received_by,
          p.transaction_date,
          p.invoice_number,
          p.notes
        FROM payment_verification_queue pvq
        JOIN payments p ON pvq.payment_id = p.id
        ${whereClause}
        ORDER BY 
          pvq.is_overdue DESC,
          pvq.priority DESC,
          pvq.submitted_at ASC
      `;
    const result = await dbQuery(query, queryParams);

    // Calculate stats
    const stats = {
      pending: result.rows.filter(r => r.verification_status === 'pending').length,
      overdue: result.rows.filter(r => r.is_overdue).length,
      total: result.rows.length
    };
    res.json({
      success: true,
      data: {
        queue: result.rows,
        stats
      }
    });
  } catch (error) {
    logger.error('Error fetching verification queue:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch verification queue',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/payments/:paymentId/verify
 * @desc    Verify/approve a payment
 * @access  Private (Admin/Manager)
 */
router.post('/:paymentId/verify', verifyToken, [param('paymentId').isUUID().withMessage('Invalid payment ID'), ...validateVerification], handleValidationErrors, async (req, res) => {
  try {
    const {
      paymentId
    } = req.params;
    const {
      verificationStatus,
      verificationNotes,
      rejectionReason
    } = req.body;
    const verifierId = req.user.id;

    // Update payment
    const updatePaymentQuery = `
        UPDATE payments
        SET 
          is_verified = $1,
          verified_by = $2,
          verified_at = $3,
          verification_notes = $4,
          payment_status = $5
        WHERE id = $6
        RETURNING *
      `;
    const isApproved = verificationStatus === 'approved';
    const newStatus = isApproved ? 'completed' : 'failed';
    const paymentResult = await dbQuery(updatePaymentQuery, [isApproved, verifierId, new Date(), verificationNotes || rejectionReason || null, newStatus, paymentId]);
    if (paymentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Update verification queue
    const updateQueueQuery = `
        UPDATE payment_verification_queue
        SET 
          verification_status = $1,
          verified_by = $2,
          verified_at = $3,
          verification_notes = $4,
          rejection_reason = $5
        WHERE payment_id = $6
        RETURNING *
      `;
    await dbQuery(updateQueueQuery, [verificationStatus, verifierId, new Date(), verificationNotes || null, rejectionReason || null, paymentId]);
    logger.info('Payment verified', {
      paymentId,
      status: verificationStatus,
      verifiedBy: verifierId
    });
    res.json({
      success: true,
      message: `Payment ${verificationStatus}`,
      data: {
        payment: paymentResult.rows[0]
      }
    });
  } catch (error) {
    logger.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/payments/stats
 * @desc    Get payment statistics
 * @access  Private
 */
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const {
      period = 'month'
    } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }
    const statsQuery = `
        SELECT 
          COUNT(*) as total_payments,
          SUM(amount) as total_amount,
          COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) as completed_count,
          SUM(CASE WHEN payment_status = 'completed' THEN amount ELSE 0 END) as completed_amount,
          COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_count,
          SUM(CASE WHEN payment_status = 'pending' THEN amount ELSE 0 END) as pending_amount,
          COUNT(CASE WHEN payment_method = 'cash' THEN 1 END) as cash_count,
          COUNT(CASE WHEN payment_method = 'online' THEN 1 END) as online_count,
          COUNT(CASE WHEN is_verified = false THEN 1 END) as unverified_count
        FROM payments
        WHERE tenant_id = $1 
          AND deleted_at IS NULL
          AND transaction_date >= $2
      `;
    const result = await dbQuery(statsQuery, [tenantId, startDate]);
    const stats = result.rows[0];
    res.json({
      success: true,
      data: {
        period,
        stats: {
          totalPayments: parseInt(stats.total_payments),
          totalAmount: parseFloat(stats.total_amount || 0),
          completed: {
            count: parseInt(stats.completed_count),
            amount: parseFloat(stats.completed_amount || 0)
          },
          pending: {
            count: parseInt(stats.pending_count),
            amount: parseFloat(stats.pending_amount || 0)
          },
          unverified: parseInt(stats.unverified_count),
          byMethod: {
            cash: parseInt(stats.cash_count),
            online: parseInt(stats.online_count)
          }
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching payment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/payments/:id
 * @desc    Get single payment details
 * @access  Private
 */
router.get('/:id', verifyToken, [param('id').isUUID().withMessage('Invalid payment ID')], handleValidationErrors, async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const tenantId = req.user.tenantId;
    const query = `
        SELECT 
          p.*,
          pvq.verification_status as queue_status,
          pvq.verified_at as queue_verified_at,
          pvq.verification_notes as queue_notes
        FROM payments p
        LEFT JOIN payment_verification_queue pvq ON p.id = pvq.payment_id
        WHERE p.id = $1 AND p.tenant_id = $2 AND p.deleted_at IS NULL
      `;
    const result = await dbQuery(query, [id, tenantId]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    res.json({
      success: true,
      data: {
        payment: result.rows[0]
      }
    });
  } catch (error) {
    logger.error('Error fetching payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment',
      error: error.message
    });
  }
});
module.exports = router;