/**
 * Invoice and Payment Routes
 * GST-compliant invoicing and financial management
 */

const express = require('express');
const router = express.Router();
const { verifyToken: authenticate } = require('../middleware/auth');
const { requirePermission, restrictToOwnLibrary } = require('../middleware/rbac');
const paymentService = require('../services/paymentService');
const { logger } = require('../utils/logger');

/**
 * POST /api/invoices
 * Create GST-compliant invoice
 */
router.post('/',
  authenticate,
  requirePermission('invoices:generate'),
  async (req, res) => {
    try {
      const {
        user_id,
        payment_id,
        items,
        library_gstin,
        library_state,
        customer_name,
        customer_address,
        customer_gstin,
        customer_state,
        notes,
      } = req.body;

      // Validation
      if (!items || items.length === 0) {
        return res.status(400).json({
          success: false,
          errors: [{
            code: 'VALIDATION_ERROR',
            message: 'Invoice items are required'
          }]
        });
      }

      if (!customer_name) {
        return res.status(400).json({
          success: false,
          errors: [{
            code: 'VALIDATION_ERROR',
            message: 'Customer name is required'
          }]
        });
      }

      const library_id = req.user.library_id;

      const result = await paymentService.createInvoice({
        user_id,
        library_id,
        payment_id,
        items,
        library_gstin,
        library_state,
        customer_name,
        customer_address,
        customer_gstin,
        customer_state,
        notes,
      });

      res.status(201).json(result);
    } catch (error) {
      logger.error('Error creating invoice:', error);
      res.status(500).json({
        success: false,
        errors: [{
          code: 'INVOICE_CREATE_ERROR',
          message: 'Failed to create invoice'
        }]
      });
    }
  }
);

/**
 * GET /api/invoices/revenue-analytics
 * Get revenue analytics and trends
 */
router.get('/revenue-analytics',
  authenticate,
  requirePermission('payments:view_revenue'),
  restrictToOwnLibrary,
  async (req, res) => {
    try {
      const filters = {
        ...req.libraryFilter,
        start_date: req.query.start_date,
        end_date: req.query.end_date,
        group_by: req.query.group_by || 'day',
      };

      const result = await paymentService.getRevenueAnalytics(filters);
      res.json(result);
    } catch (error) {
      logger.error('Error fetching revenue analytics:', error);
      res.status(500).json({
        success: false,
        errors: [{
          code: 'REVENUE_ANALYTICS_ERROR',
          message: 'Failed to fetch revenue analytics'
        }]
      });
    }
  }
);

/**
 * POST /api/invoices/expenses
 * Record an expense
 */
router.post('/expenses',
  authenticate,
  requirePermission('expenses:manage'),
  async (req, res) => {
    try {
      const {
        category,
        description,
        amount,
        expense_date,
        payment_method,
        vendor_name,
        receipt_url,
        notes,
      } = req.body;

      // Validation
      if (!category || !description || !amount) {
        return res.status(400).json({
          success: false,
          errors: [{
            code: 'VALIDATION_ERROR',
            message: 'Category, description, and amount are required'
          }]
        });
      }

      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          errors: [{
            code: 'VALIDATION_ERROR',
            message: 'Amount must be greater than zero'
          }]
        });
      }

      const result = await paymentService.createExpense({
        library_id: req.user.library_id,
        category,
        description,
        amount,
        expense_date,
        payment_method,
        vendor_name,
        receipt_url,
        notes,
        created_by: req.user.id,
      });

      res.status(201).json(result);
    } catch (error) {
      logger.error('Error creating expense:', error);
      res.status(500).json({
        success: false,
        errors: [{
          code: 'EXPENSE_CREATE_ERROR',
          message: 'Failed to record expense'
        }]
      });
    }
  }
);

/**
 * GET /api/invoices/expense-analytics
 * Get expense analytics
 */
router.get('/expense-analytics',
  authenticate,
  requirePermission('expenses:manage'),
  restrictToOwnLibrary,
  async (req, res) => {
    try {
      const filters = {
        ...req.libraryFilter,
        start_date: req.query.start_date,
        end_date: req.query.end_date,
        category: req.query.category,
      };

      const result = await paymentService.getExpenseAnalytics(filters);
      res.json(result);
    } catch (error) {
      logger.error('Error fetching expense analytics:', error);
      res.status(500).json({
        success: false,
        errors: [{
          code: 'EXPENSE_ANALYTICS_ERROR',
          message: 'Failed to fetch expense analytics'
        }]
      });
    }
  }
);

/**
 * GET /api/invoices/profit-loss
 * Get profit and loss report
 */
router.get('/profit-loss',
  authenticate,
  requirePermission('payments:view_revenue'),
  restrictToOwnLibrary,
  async (req, res) => {
    try {
      const filters = {
        ...req.libraryFilter,
        start_date: req.query.start_date,
        end_date: req.query.end_date,
      };

      const result = await paymentService.getProfitLossReport(filters);
      res.json(result);
    } catch (error) {
      logger.error('Error generating P&L report:', error);
      res.status(500).json({
        success: false,
        errors: [{
          code: 'PL_REPORT_ERROR',
          message: 'Failed to generate profit & loss report'
        }]
      });
    }
  }
);

/**
 * GET /api/invoices/calculate-gst
 * Calculate GST for given amount (utility endpoint)
 */
router.get('/calculate-gst',
  authenticate,
  async (req, res) => {
    try {
      const { amount, library_state, customer_state, gst_rate } = req.query;

      if (!amount || !library_state || !customer_state) {
        return res.status(400).json({
          success: false,
          errors: [{
            code: 'VALIDATION_ERROR',
            message: 'Amount, library_state, and customer_state are required'
          }]
        });
      }

      const gstDetails = paymentService.calculateGST(
        parseFloat(amount),
        library_state,
        customer_state,
        gst_rate ? parseFloat(gst_rate) : undefined
      );

      res.json({
        success: true,
        data: {
          amount: parseFloat(amount),
          ...gstDetails,
          total: parseFloat(amount) + gstDetails.total_gst,
        },
      });
    } catch (error) {
      logger.error('Error calculating GST:', error);
      res.status(500).json({
        success: false,
        errors: [{
          code: 'GST_CALCULATION_ERROR',
          message: 'Failed to calculate GST'
        }]
      });
    }
  }
);

module.exports = router;

