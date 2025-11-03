-- =====================================================
-- Migration: Create Payments and Verification Queue Tables
-- Version: 004
-- Date: 2025-10-23
-- Description: Payments system with staff confirmation and verification
-- =====================================================

-- Drop tables if they exist (for clean migration)
DROP TABLE IF EXISTS payment_verification_queue CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS verification_status CASCADE;

-- Create ENUM types
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded', 'cancelled');
CREATE TYPE payment_method AS ENUM ('cash', 'cheque', 'bank_transfer', 'online', 'upi', 'card', 'net_banking');
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected', 'on_hold');

-- =====================================================
-- PAYMENTS TABLE
-- =====================================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  
  -- Student Information
  student_id UUID REFERENCES users(id) ON DELETE SET NULL,
  student_name VARCHAR(255) NOT NULL,
  student_email VARCHAR(255),
  student_phone VARCHAR(20),
  
  -- Payment Details
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  payment_method payment_method NOT NULL,
  payment_status payment_status NOT NULL DEFAULT 'pending',
  transaction_date TIMESTAMP NOT NULL DEFAULT NOW(),
  description TEXT NOT NULL,
  
  -- Payment Method Specific Fields
  cheque_number VARCHAR(100),
  cheque_date DATE,
  bank_name VARCHAR(255),
  reference_number VARCHAR(255),
  transaction_id VARCHAR(255),
  
  -- Staff Confirmation Fields (NEW)
  received_by VARCHAR(255) NOT NULL, -- Staff member who received payment
  staff_confirmation BOOLEAN DEFAULT false, -- Staff confirmed receipt
  staff_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Staff user ID
  
  -- Verification Fields
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  verified_at TIMESTAMP,
  verification_notes TEXT,
  
  -- Invoice & Receipt
  invoice_number VARCHAR(50) UNIQUE,
  receipt_number VARCHAR(50) UNIQUE,
  invoice_url TEXT,
  receipt_url TEXT,
  
  -- Additional Information
  notes TEXT,
  attachments JSONB, -- Store file URLs for receipts, cheques, etc.
  metadata JSONB, -- Additional flexible data
  
  -- Fee Plan Association
  fee_plan_id UUID,
  billing_cycle VARCHAR(50),
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP,
  
  -- Indexes for common queries
  CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES users(tenant_id) ON DELETE CASCADE
);

-- =====================================================
-- PAYMENT VERIFICATION QUEUE TABLE
-- =====================================================
CREATE TABLE payment_verification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  
  -- Verification Details
  verification_status verification_status NOT NULL DEFAULT 'pending',
  priority INTEGER DEFAULT 0, -- Higher number = higher priority
  
  -- Staff Information
  submitted_by VARCHAR(255) NOT NULL, -- Staff name who submitted
  submitted_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
  submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Verifier Information
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  verified_at TIMESTAMP,
  
  -- Verification Details
  verification_notes TEXT,
  rejection_reason TEXT,
  flags JSONB, -- Suspicious activity flags, etc.
  
  -- SLA Tracking
  due_date TIMESTAMP,
  is_overdue BOOLEAN GENERATED ALWAYS AS (
    CASE 
      WHEN verification_status = 'pending' AND due_date < NOW() THEN true
      ELSE false
    END
  ) STORED,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Payments Table Indexes
CREATE INDEX idx_payments_tenant ON payments(tenant_id);
CREATE INDEX idx_payments_student ON payments(student_id);
CREATE INDEX idx_payments_status ON payments(payment_status);
CREATE INDEX idx_payments_method ON payments(payment_method);
CREATE INDEX idx_payments_date ON payments(transaction_date DESC);
CREATE INDEX idx_payments_verification ON payments(is_verified);
CREATE INDEX idx_payments_staff ON payments(received_by);
CREATE INDEX idx_payments_invoice ON payments(invoice_number);
CREATE INDEX idx_payments_receipt ON payments(receipt_number);
CREATE INDEX idx_payments_deleted ON payments(deleted_at) WHERE deleted_at IS NULL;

-- Verification Queue Indexes
CREATE INDEX idx_verification_payment ON payment_verification_queue(payment_id);
CREATE INDEX idx_verification_status ON payment_verification_queue(verification_status);
CREATE INDEX idx_verification_priority ON payment_verification_queue(priority DESC);
CREATE INDEX idx_verification_assigned ON payment_verification_queue(assigned_to);
CREATE INDEX idx_verification_overdue ON payment_verification_queue(is_overdue) WHERE is_overdue = true;
CREATE INDEX idx_verification_date ON payment_verification_queue(submitted_at DESC);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_verification_updated_at
  BEFORE UPDATE ON payment_verification_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL THEN
    NEW.invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('invoice_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS invoice_seq START 1;

CREATE TRIGGER set_invoice_number
  BEFORE INSERT ON payments
  FOR EACH ROW
  EXECUTE FUNCTION generate_invoice_number();

-- =====================================================
-- SAMPLE DATA (for testing)
-- =====================================================

-- Insert sample payments
INSERT INTO payments (
  tenant_id,
  student_name,
  student_email,
  student_phone,
  amount,
  payment_method,
  payment_status,
  description,
  received_by,
  staff_confirmation,
  transaction_date,
  notes
) VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    'Rajesh Kumar',
    'rajesh.k@example.com',
    '+91 98765 11111',
    5000.00,
    'cash',
    'pending',
    'Monthly fee payment - October 2025',
    'Priya Sharma',
    true,
    NOW() - INTERVAL '2 hours',
    'Received in cash at front desk'
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'Anita Desai',
    'anita.d@example.com',
    '+91 98765 22222',
    7500.00,
    'cheque',
    'pending',
    'Quarterly fee payment',
    'Amit Patel',
    true,
    NOW() - INTERVAL '1 day',
    'Cheque received, pending clearance'
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'Vikram Singh',
    'vikram.s@example.com',
    '+91 98765 33333',
    3000.00,
    'bank_transfer',
    'completed',
    'Monthly fee payment',
    'Neha Gupta',
    true,
    NOW() - INTERVAL '3 days',
    'Bank transfer verified'
  );

-- Insert sample verification queue entries
INSERT INTO payment_verification_queue (
  payment_id,
  verification_status,
  priority,
  submitted_by,
  submitted_at,
  due_date
)
SELECT 
  id,
  'pending',
  1,
  received_by,
  created_at,
  created_at + INTERVAL '24 hours'
FROM payments
WHERE payment_status = 'pending';

-- =====================================================
-- GRANT PERMISSIONS (adjust as needed)
-- =====================================================

-- Grant access to authenticated users
-- GRANT SELECT, INSERT, UPDATE ON payments TO authenticated;
-- GRANT SELECT, INSERT, UPDATE ON payment_verification_queue TO authenticated;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE payments IS 'All payment transactions with staff confirmation';
COMMENT ON TABLE payment_verification_queue IS 'Queue for admin verification of offline payments';
COMMENT ON COLUMN payments.received_by IS 'Name of staff member who received the payment';
COMMENT ON COLUMN payments.staff_confirmation IS 'Staff confirmed they received the payment';
COMMENT ON COLUMN payment_verification_queue.is_overdue IS 'Auto-calculated: true if past due_date and still pending';

-- =====================================================
-- END OF MIGRATION
-- =====================================================

