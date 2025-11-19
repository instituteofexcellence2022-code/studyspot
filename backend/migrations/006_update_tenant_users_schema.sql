-- ============================================
-- UPDATE TENANT USERS TABLE
-- Clarify that this is for library staff only
-- Library owners are in admin_users (core schema)
-- ============================================

-- Update users table role constraint
-- Remove 'owner' role - owners are in admin_users
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('manager', 'staff'));

-- Add staff_type for more granular control
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS staff_type VARCHAR(50) 
CHECK (staff_type IN ('manager', 'receptionist', 'attendance_staff', 'finance_staff', 'general'));

-- Add permissions JSONB (can override role permissions)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}';

-- Add employment details
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS employee_id VARCHAR(50) UNIQUE;
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS hire_date DATE;
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS salary DECIMAL(10,2);
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS employment_status VARCHAR(50) DEFAULT 'active' 
CHECK (employment_status IN ('active', 'on_leave', 'terminated', 'resigned'));

-- Add metadata for additional staff data
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_staff_type ON users(staff_type);
CREATE INDEX IF NOT EXISTS idx_users_employment_status ON users(employment_status);
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE users IS 'Library staff members (managers, receptionists, etc.). Library owners are in admin_users table.';
COMMENT ON COLUMN users.role IS 'manager: Can manage library operations, staff: Limited access';
COMMENT ON COLUMN users.staff_type IS 'Specific staff role for granular permissions';

