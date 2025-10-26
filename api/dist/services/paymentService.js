/**
 * Enhanced Payment Service
 * GST-compliant invoicing, revenue analytics, and expense tracking
 */

const {
  pool
} = require('../config/database');
const {
  logger
} = require('../utils/logger');

// GST rates (can be configured)
const GST_RATES = {
  STANDARD: 18,
  // 18% GST for standard services
  EXEMPT: 0 // Exempt services
};

/**
 * Calculate GST based on amount and states
 * CGST + SGST for intra-state, IGST for inter-state
 */
function calculateGST(amount, libraryState, customerState, gstRate = GST_RATES.STANDARD) {
  const isIntraState = libraryState === customerState;
  const gstAmount = amount * gstRate / 100;
  if (isIntraState) {
    // Intra-state: CGST + SGST (split 50-50)
    return {
      cgst: gstAmount / 2,
      sgst: gstAmount / 2,
      igst: 0,
      total_gst: gstAmount,
      gst_rate: gstRate,
      is_intra_state: true
    };
  } else {
    // Inter-state: IGST
    return {
      cgst: 0,
      sgst: 0,
      igst: gstAmount,
      total_gst: gstAmount,
      gst_rate: gstRate,
      is_intra_state: false
    };
  }
}

/**
 * Generate invoice number
 */
async function generateInvoiceNumber(libraryId, financialYear = null) {
  try {
    // Get current financial year (April to March)
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const fy = financialYear || (currentMonth >= 4 ? `${currentYear}-${(currentYear + 1).toString().substr(2)}` : `${currentYear - 1}-${currentYear.toString().substr(2)}`);

    // Get last invoice number for this library and FY
    const query = `
      SELECT invoice_number 
      FROM invoices 
      WHERE library_id = $1 AND financial_year = $2
      ORDER BY id DESC 
      LIMIT 1
    `;
    const result = await pool.query(query, [libraryId, fy]);
    let sequence = 1;
    if (result.rows.length > 0) {
      const lastInvoice = result.rows[0].invoice_number;
      const match = lastInvoice.match(/\/(\d+)$/);
      if (match) {
        sequence = parseInt(match[1]) + 1;
      }
    }

    // Format: LIB001/FY24-25/0001
    const invoiceNumber = `LIB${String(libraryId).padStart(3, '0')}/${fy}/${String(sequence).padStart(4, '0')}`;
    return invoiceNumber;
  } catch (error) {
    logger.error('Error generating invoice number:', error);
    throw error;
  }
}

/**
 * Create invoice with GST calculation
 */
async function createInvoice(invoiceData) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const {
      user_id,
      library_id,
      payment_id,
      items,
      // Array of { description, amount, quantity, hsn_code }
      library_gstin,
      library_state,
      customer_name,
      customer_address,
      customer_gstin,
      customer_state,
      notes
    } = invoiceData;

    // Calculate totals
    let subtotal = 0;
    const processedItems = items.map(item => {
      const itemTotal = item.amount * (item.quantity || 1);
      subtotal += itemTotal;
      return {
        ...item,
        total: itemTotal
      };
    });

    // Calculate GST
    const gstDetails = calculateGST(subtotal, library_state, customer_state);
    const total = subtotal + gstDetails.total_gst;

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber(library_id);

    // Get financial year
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const fy = currentMonth >= 4 ? `${currentYear}-${(currentYear + 1).toString().substr(2)}` : `${currentYear - 1}-${currentYear.toString().substr(2)}`;

    // Insert invoice
    const insertQuery = `
      INSERT INTO invoices (
        invoice_number,
        user_id,
        library_id,
        payment_id,
        financial_year,
        subtotal,
        cgst,
        sgst,
        igst,
        total_gst,
        total_amount,
        gst_rate,
        is_intra_state,
        library_gstin,
        library_state,
        customer_name,
        customer_address,
        customer_gstin,
        customer_state,
        items,
        notes,
        invoice_date,
        status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21, NOW(), 'generated'
      ) RETURNING *
    `;
    const result = await client.query(insertQuery, [invoiceNumber, user_id, library_id, payment_id, fy, subtotal, gstDetails.cgst, gstDetails.sgst, gstDetails.igst, gstDetails.total_gst, total, gstDetails.gst_rate, gstDetails.is_intra_state, library_gstin, library_state, customer_name, customer_address, customer_gstin, customer_state, JSON.stringify(processedItems), notes]);
    await client.query('COMMIT');
    return {
      success: true,
      data: result.rows[0],
      message: 'Invoice created successfully'
    };
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error creating invoice:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Get revenue analytics
 */
async function getRevenueAnalytics(filters = {}) {
  try {
    const {
      library_id,
      tenant_id,
      start_date,
      end_date,
      group_by = 'day' // day, week, month, year
    } = filters;

    // Build WHERE clause
    const conditions = ["p.status = 'completed'"];
    const params = [];
    let paramIndex = 1;
    if (library_id) {
      conditions.push(`p.library_id = $${paramIndex}`);
      params.push(library_id);
      paramIndex++;
    }
    if (tenant_id) {
      conditions.push(`l.tenant_id = $${paramIndex}`);
      params.push(tenant_id);
      paramIndex++;
    }
    if (start_date) {
      conditions.push(`p.created_at >= $${paramIndex}`);
      params.push(start_date);
      paramIndex++;
    }
    if (end_date) {
      conditions.push(`p.created_at <= $${paramIndex}`);
      params.push(end_date);
      paramIndex++;
    }
    const whereClause = conditions.join(' AND ');

    // Determine date grouping
    let dateGroup;
    switch (group_by) {
      case 'hour':
        dateGroup = "DATE_TRUNC('hour', p.created_at)";
        break;
      case 'day':
        dateGroup = "DATE_TRUNC('day', p.created_at)";
        break;
      case 'week':
        dateGroup = "DATE_TRUNC('week', p.created_at)";
        break;
      case 'month':
        dateGroup = "DATE_TRUNC('month', p.created_at)";
        break;
      case 'year':
        dateGroup = "DATE_TRUNC('year', p.created_at)";
        break;
      default:
        dateGroup = "DATE_TRUNC('day', p.created_at)";
    }

    // Get revenue trend
    const trendQuery = `
      SELECT 
        ${dateGroup} as period,
        COUNT(p.id) as transaction_count,
        SUM(p.amount) as total_revenue,
        AVG(p.amount) as avg_transaction,
        MIN(p.amount) as min_transaction,
        MAX(p.amount) as max_transaction
      FROM payments p
      INNER JOIN libraries l ON p.library_id = l.id
      WHERE ${whereClause}
      GROUP BY ${dateGroup}
      ORDER BY period
    `;
    const trendResult = await pool.query(trendQuery, params);

    // Get summary statistics
    const summaryQuery = `
      SELECT 
        COUNT(p.id) as total_transactions,
        SUM(p.amount) as total_revenue,
        AVG(p.amount) as avg_transaction,
        SUM(CASE WHEN p.payment_method = 'online' THEN p.amount ELSE 0 END) as online_revenue,
        SUM(CASE WHEN p.payment_method = 'cash' THEN p.amount ELSE 0 END) as cash_revenue,
        SUM(CASE WHEN p.payment_method = 'card' THEN p.amount ELSE 0 END) as card_revenue
      FROM payments p
      INNER JOIN libraries l ON p.library_id = l.id
      WHERE ${whereClause}
    `;
    const summaryResult = await pool.query(summaryQuery, params);
    return {
      success: true,
      data: {
        trend: trendResult.rows,
        summary: summaryResult.rows[0]
      }
    };
  } catch (error) {
    logger.error('Error fetching revenue analytics:', error);
    throw error;
  }
}

/**
 * Get expense analytics
 */
async function getExpenseAnalytics(filters = {}) {
  try {
    const {
      library_id,
      tenant_id,
      start_date,
      end_date,
      category
    } = filters;
    const conditions = [];
    const params = [];
    let paramIndex = 1;
    if (library_id) {
      conditions.push(`e.library_id = $${paramIndex}`);
      params.push(library_id);
      paramIndex++;
    }
    if (tenant_id) {
      conditions.push(`l.tenant_id = $${paramIndex}`);
      params.push(tenant_id);
      paramIndex++;
    }
    if (start_date) {
      conditions.push(`e.expense_date >= $${paramIndex}`);
      params.push(start_date);
      paramIndex++;
    }
    if (end_date) {
      conditions.push(`e.expense_date <= $${paramIndex}`);
      params.push(end_date);
      paramIndex++;
    }
    if (category) {
      conditions.push(`e.category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get expense summary by category
    const categoryQuery = `
      SELECT 
        e.category,
        COUNT(e.id) as count,
        SUM(e.amount) as total_amount
      FROM expenses e
      INNER JOIN libraries l ON e.library_id = l.id
      ${whereClause}
      GROUP BY e.category
      ORDER BY total_amount DESC
    `;
    const categoryResult = await pool.query(categoryQuery, params);

    // Get monthly trend
    const trendQuery = `
      SELECT 
        DATE_TRUNC('month', e.expense_date) as month,
        SUM(e.amount) as total_expenses
      FROM expenses e
      INNER JOIN libraries l ON e.library_id = l.id
      ${whereClause}
      GROUP BY DATE_TRUNC('month', e.expense_date)
      ORDER BY month
    `;
    const trendResult = await pool.query(trendQuery, params);

    // Get total summary
    const summaryQuery = `
      SELECT 
        COUNT(e.id) as total_count,
        SUM(e.amount) as total_expenses,
        AVG(e.amount) as avg_expense
      FROM expenses e
      INNER JOIN libraries l ON e.library_id = l.id
      ${whereClause}
    `;
    const summaryResult = await pool.query(summaryQuery, params);
    return {
      success: true,
      data: {
        by_category: categoryResult.rows,
        trend: trendResult.rows,
        summary: summaryResult.rows[0]
      }
    };
  } catch (error) {
    logger.error('Error fetching expense analytics:', error);
    throw error;
  }
}

/**
 * Create expense record
 */
async function createExpense(expenseData) {
  try {
    const {
      library_id,
      category,
      description,
      amount,
      expense_date,
      payment_method,
      vendor_name,
      receipt_url,
      notes,
      created_by
    } = expenseData;
    const query = `
      INSERT INTO expenses (
        library_id,
        category,
        description,
        amount,
        expense_date,
        payment_method,
        vendor_name,
        receipt_url,
        notes,
        created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const result = await pool.query(query, [library_id, category, description, amount, expense_date || new Date(), payment_method, vendor_name, receipt_url, notes, created_by]);
    return {
      success: true,
      data: result.rows[0],
      message: 'Expense recorded successfully'
    };
  } catch (error) {
    logger.error('Error creating expense:', error);
    throw error;
  }
}

/**
 * Get profit/loss report
 */
async function getProfitLossReport(filters = {}) {
  try {
    const {
      library_id,
      tenant_id,
      start_date,
      end_date
    } = filters;
    const revenueAnalytics = await getRevenueAnalytics(filters);
    const expenseAnalytics = await getExpenseAnalytics(filters);
    const revenue = parseFloat(revenueAnalytics.data.summary.total_revenue || 0);
    const expenses = parseFloat(expenseAnalytics.data.summary.total_expenses || 0);
    const profit = revenue - expenses;
    const profitMargin = revenue > 0 ? (profit / revenue * 100).toFixed(2) : 0;
    return {
      success: true,
      data: {
        revenue: {
          total: revenue,
          transactions: parseInt(revenueAnalytics.data.summary.total_transactions || 0),
          average: parseFloat(revenueAnalytics.data.summary.avg_transaction || 0),
          breakdown: {
            online: parseFloat(revenueAnalytics.data.summary.online_revenue || 0),
            cash: parseFloat(revenueAnalytics.data.summary.cash_revenue || 0),
            card: parseFloat(revenueAnalytics.data.summary.card_revenue || 0)
          }
        },
        expenses: {
          total: expenses,
          count: parseInt(expenseAnalytics.data.summary.total_count || 0),
          average: parseFloat(expenseAnalytics.data.summary.avg_expense || 0),
          by_category: expenseAnalytics.data.by_category
        },
        profit: {
          amount: profit,
          margin: profitMargin,
          status: profit >= 0 ? 'profit' : 'loss'
        }
      }
    };
  } catch (error) {
    logger.error('Error generating P&L report:', error);
    throw error;
  }
}
module.exports = {
  calculateGST,
  generateInvoiceNumber,
  createInvoice,
  getRevenueAnalytics,
  getExpenseAnalytics,
  createExpense,
  getProfitLossReport
};