-- Migration: Invoices and Expenses
-- Version: 003
-- Description: GST-compliant invoicing and expense tracking

-- ============================================
-- Invoices Table
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id),
  library_id INTEGER REFERENCES libraries(id) ON DELETE CASCADE,
  payment_id INTEGER REFERENCES payments(id),
  financial_year VARCHAR(10) NOT NULL, -- e.g., "2024-25"
  
  -- Amounts
  subtotal DECIMAL(10, 2) NOT NULL,
  cgst DECIMAL(10, 2) DEFAULT 0,
  sgst DECIMAL(10, 2) DEFAULT 0,
  igst DECIMAL(10, 2) DEFAULT 0,
  total_gst DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  
  -- GST Details
  gst_rate DECIMAL(5, 2) NOT NULL, -- e.g., 18.00
  is_intra_state BOOLEAN DEFAULT TRUE,
  
  -- Library (Seller) Details
  library_gstin VARCHAR(15),
  library_state VARCHAR(100),
  
  -- Customer (Buyer) Details
  customer_name VARCHAR(255) NOT NULL,
  customer_address TEXT,
  customer_gstin VARCHAR(15),
  customer_state VARCHAR(100),
  
  -- Line Items
  items JSONB NOT NULL, -- Array of {description, amount, quantity, hsn_code, total}
  
  -- Metadata
  notes TEXT,
  invoice_date TIMESTAMP NOT NULL,
  due_date TIMESTAMP,
  status VARCHAR(50) DEFAULT 'generated', -- generated, sent, paid, cancelled
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Expenses Table
-- ============================================
CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  library_id INTEGER REFERENCES libraries(id) ON DELETE CASCADE,
  
  -- Expense Details
  category VARCHAR(100) NOT NULL, -- rent, utilities, salaries, maintenance, supplies, etc.
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  expense_date DATE NOT NULL,
  
  -- Payment Details
  payment_method VARCHAR(50), -- cash, card, bank_transfer, upi
  vendor_name VARCHAR(255),
  receipt_url TEXT,
  
  -- Metadata
  notes TEXT,
  created_by INTEGER REFERENCES users(id),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Indexes for Performance
-- ============================================

-- Invoices
CREATE INDEX IF NOT EXISTS idx_invoices_library ON invoices(library_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_payment ON invoices(payment_id);
CREATE INDEX IF NOT EXISTS idx_invoices_financial_year ON invoices(financial_year);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);

-- Expenses
CREATE INDEX IF NOT EXISTS idx_expenses_library ON expenses(library_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_created_by ON expenses(created_by);

-- ============================================
-- Triggers for Updated At
-- ============================================

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Comments
-- ============================================
COMMENT ON TABLE invoices IS 'GST-compliant invoices for payments';
COMMENT ON COLUMN invoices.invoice_number IS 'Unique invoice number (e.g., LIB001/FY24-25/0001)';
COMMENT ON COLUMN invoices.cgst IS 'Central GST (for intra-state transactions)';
COMMENT ON COLUMN invoices.sgst IS 'State GST (for intra-state transactions)';
COMMENT ON COLUMN invoices.igst IS 'Integrated GST (for inter-state transactions)';
COMMENT ON COLUMN invoices.items IS 'JSON array of line items with HSN codes';

COMMENT ON TABLE expenses IS 'Expense tracking for financial management';
COMMENT ON COLUMN expenses.category IS 'Expense category for reporting';
COMMENT ON COLUMN expenses.receipt_url IS 'URL to uploaded receipt/bill';

