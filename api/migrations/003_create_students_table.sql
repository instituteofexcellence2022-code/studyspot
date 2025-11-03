-- Migration: Create Students Table
-- Description: Comprehensive student management with fee tracking
-- Created: 2025-10-23

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Tenant & Library Association
  tenant_id UUID NOT NULL,
  library_id UUID,
  
  -- Personal Information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(20),
  
  -- Address Information
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'India',
  
  -- Enrollment Details
  enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  student_id VARCHAR(50) UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  
  -- Fee Information
  current_plan VARCHAR(100),
  fee_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  last_payment_date DATE,
  next_payment_date DATE,
  total_paid DECIMAL(10, 2) DEFAULT 0.00,
  balance_due DECIMAL(10, 2) DEFAULT 0.00,
  
  -- Documents & KYC
  profile_photo_url TEXT,
  id_proof_type VARCHAR(50),
  id_proof_url TEXT,
  kyc_verified BOOLEAN DEFAULT FALSE,
  kyc_verified_at TIMESTAMP,
  kyc_verified_by UUID,
  
  -- Additional Info
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP,
  
  -- Constraints
  CONSTRAINT chk_student_status CHECK (status IN ('active', 'inactive', 'suspended', 'graduated', 'withdrawn')),
  CONSTRAINT chk_fee_status CHECK (fee_status IN ('paid', 'pending', 'overdue', 'exempt', 'partial')),
  CONSTRAINT chk_gender CHECK (gender IN ('male', 'female', 'other', NULL))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_students_tenant_id ON students(tenant_id);
CREATE INDEX IF NOT EXISTS idx_students_library_id ON students(library_id);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_phone ON students(phone);
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_fee_status ON students(fee_status);
CREATE INDEX IF NOT EXISTS idx_students_created_at ON students(created_at);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_students_tenant_status ON students(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_students_tenant_fee_status ON students(tenant_id, fee_status);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_students_search ON students 
  USING gin(to_tsvector('english', 
    COALESCE(first_name, '') || ' ' || 
    COALESCE(last_name, '') || ' ' || 
    COALESCE(email, '') || ' ' || 
    COALESCE(phone, '') || ' ' || 
    COALESCE(student_id, '')
  ));

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_students_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_students_updated_at();

-- Insert some sample data for testing
INSERT INTO students (
  tenant_id,
  first_name,
  last_name,
  email,
  phone,
  student_id,
  status,
  current_plan,
  fee_status,
  enrollment_date
) VALUES
  ('00000000-0000-0000-0000-000000000000', 'Rajesh', 'Kumar', 'rajesh.kumar@example.com', '+91 98765 43210', 'STU001', 'active', 'Monthly Premium', 'paid', '2024-01-15'),
  ('00000000-0000-0000-0000-000000000000', 'Priya', 'Sharma', 'priya.sharma@example.com', '+91 98765 43211', 'STU002', 'active', 'Weekly Plan', 'pending', '2024-02-20'),
  ('00000000-0000-0000-0000-000000000000', 'Amit', 'Patel', 'amit.patel@example.com', '+91 98765 43212', 'STU003', 'active', 'Monthly Premium', 'paid', '2024-03-10'),
  ('00000000-0000-0000-0000-000000000000', 'Sneha', 'Reddy', 'sneha.reddy@example.com', '+91 98765 43213', 'STU004', 'inactive', 'Daily Plan', 'overdue', '2024-01-05'),
  ('00000000-0000-0000-0000-000000000000', 'Vikram', 'Singh', 'vikram.singh@example.com', '+91 98765 43214', 'STU005', 'active', 'Weekly Plan', 'paid', '2024-04-01'),
  ('00000000-0000-0000-0000-000000000000', 'Anita', 'Desai', 'anita.desai@example.com', '+91 98765 43215', 'STU006', 'active', 'Monthly Premium', 'pending', '2024-05-15'),
  ('00000000-0000-0000-0000-000000000000', 'Ravi', 'Verma', 'ravi.verma@example.com', '+91 98765 43216', 'STU007', 'active', 'Hourly Plan', 'paid', '2024-06-20'),
  ('00000000-0000-0000-0000-000000000000', 'Meera', 'Nair', 'meera.nair@example.com', '+91 98765 43217', 'STU008', 'suspended', 'Weekly Plan', 'overdue', '2024-02-28'),
  ('00000000-0000-0000-0000-000000000000', 'Kiran', 'Rao', 'kiran.rao@example.com', '+91 98765 43218', 'STU009', 'active', 'Monthly Premium', 'paid', '2024-07-10'),
  ('00000000-0000-0000-0000-000000000000', 'Deepak', 'Chopra', 'deepak.chopra@example.com', '+91 98765 43219', 'STU010', 'active', 'Daily Plan', 'pending', '2024-08-01')
ON CONFLICT (email) DO NOTHING;

-- Grant permissions (adjust as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON students TO your_app_user;

COMMENT ON TABLE students IS 'Student management table with enrollment and fee tracking';
COMMENT ON COLUMN students.tenant_id IS 'Multi-tenant isolation';
COMMENT ON COLUMN students.status IS 'Student enrollment status';
COMMENT ON COLUMN students.fee_status IS 'Payment status for current period';
COMMENT ON COLUMN students.student_id IS 'Human-readable student identifier';

