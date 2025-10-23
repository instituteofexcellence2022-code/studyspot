-- =====================================================
-- Create PAYMENTS table only
-- =====================================================

-- First, let's check if it exists
DROP TABLE IF EXISTS payments CASCADE;

-- Create PAYMENTS table
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

-- Create indexes
CREATE INDEX idx_payments_tenant ON payments(tenant_id);
CREATE INDEX idx_payments_student ON payments(student_id);
CREATE INDEX idx_payments_status ON payments(payment_status);
CREATE INDEX idx_payments_date ON payments(transaction_date DESC);
CREATE INDEX idx_payments_staff ON payments(received_by);
CREATE INDEX idx_payments_invoice ON payments(invoice_number);

-- Create trigger
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
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

-- Show success message
DO $$
BEGIN
  RAISE NOTICE '✅ Payments table created successfully!';
  RAISE NOTICE '✅ Added 3 sample payments';
END $$;

