-- =====================================================
-- Migration: Create Payments and Verification Queue Tables (SIMPLE VERSION)
-- Version: 004
-- Date: 2025-10-23
-- Description: Payments system with staff confirmation
-- =====================================================

-- Drop tables if they exist
DROP TABLE IF EXISTS payment_verification_queue CASCADE;
DROP TABLE IF EXISTS payments CASCADE;

-- =====================================================
-- PAYMENTS TABLE
-- =====================================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  
  -- Student Information
  student_id UUID,
  student_name VARCHAR(255) NOT NULL,
  student_email VARCHAR(255),
  student_phone VARCHAR(20),
  
  -- Payment Details
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  payment_method VARCHAR(50) NOT NULL,
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  transaction_date TIMESTAMP NOT NULL DEFAULT NOW(),
  description TEXT NOT NULL,
  
  -- Payment Method Specific Fields
  cheque_number VARCHAR(100),
  cheque_date DATE,
  bank_name VARCHAR(255),
  reference_number VARCHAR(255),
  transaction_id VARCHAR(255),
  
  -- Staff Confirmation Fields
  received_by VARCHAR(255) NOT NULL,
  staff_confirmation BOOLEAN DEFAULT false,
  staff_id UUID,
  
  -- Verification Fields
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID,
  verified_at TIMESTAMP,
  verification_notes TEXT,
  
  -- Invoice & Receipt
  invoice_number VARCHAR(50) UNIQUE,
  receipt_number VARCHAR(50) UNIQUE,
  
  -- Additional Information
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- PAYMENT VERIFICATION QUEUE TABLE
-- =====================================================
CREATE TABLE payment_verification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  
  -- Verification Details
  verification_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  priority INTEGER DEFAULT 0,
  
  -- Staff Information
  submitted_by VARCHAR(255) NOT NULL,
  submitted_by_id UUID,
  submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Verifier Information
  assigned_to UUID,
  verified_by UUID,
  verified_at TIMESTAMP,
  
  -- Verification Details
  verification_notes TEXT,
  rejection_reason TEXT,
  
  -- SLA Tracking
  due_date TIMESTAMP,
  is_overdue BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_payments_tenant ON payments(tenant_id);
CREATE INDEX idx_payments_student ON payments(student_id);
CREATE INDEX idx_payments_status ON payments(payment_status);
CREATE INDEX idx_payments_date ON payments(transaction_date DESC);
CREATE INDEX idx_payments_staff ON payments(received_by);

CREATE INDEX idx_verification_payment ON payment_verification_queue(payment_id);
CREATE INDEX idx_verification_status ON payment_verification_queue(verification_status);
CREATE INDEX idx_verification_priority ON payment_verification_queue(priority DESC);

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

-- =====================================================
-- SAMPLE DATA
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
  invoice_number
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
    'INV-20251023-000001'
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
    'INV-20251023-000002'
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
    'INV-20251023-000003'
  );

-- Insert verification queue entries for pending payments
INSERT INTO payment_verification_queue (
  payment_id,
  verification_status,
  priority,
  submitted_by,
  due_date
)
SELECT 
  id,
  'pending',
  1,
  received_by,
  created_at + INTERVAL '24 hours'
FROM payments
WHERE payment_status = 'pending';

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE payments IS 'All payment transactions with staff confirmation';
COMMENT ON TABLE payment_verification_queue IS 'Queue for admin verification of offline payments';
COMMENT ON COLUMN payments.received_by IS 'Name of staff member who received the payment';
COMMENT ON COLUMN payments.staff_confirmation IS 'Staff confirmed they received the payment';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Migration completed successfully!';
  RAISE NOTICE '✅ Created tables: payments, payment_verification_queue';
  RAISE NOTICE '✅ Added 3 sample payments';
  RAISE NOTICE '✅ Added 2 pending verification entries';
END $$;

