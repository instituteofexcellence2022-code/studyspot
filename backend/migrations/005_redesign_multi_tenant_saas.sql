-- ============================================
-- MULTI-TENANT SaaS DATABASE REDESIGN
-- Proper structure for 3-portal system:
-- 1. Student Portal (students)
-- 2. Web Owner Portal (library owners + staff)
-- 3. Web Admin Portal (platform admins)
-- ============================================

-- ============================================
-- UPDATE ADMIN_USERS TABLE
-- Distinguish between platform admins and library owners
-- ============================================

-- Step 1: Add user_type column (nullable first, no constraint yet)
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS user_type VARCHAR(50);

-- Step 2: Update existing data BEFORE adding constraint
-- Set user_type for existing users based on tenant_id
UPDATE admin_users 
SET user_type = 'platform_admin'
WHERE tenant_id IS NULL 
AND user_type IS NULL;

UPDATE admin_users 
SET user_type = 'library_owner'
WHERE tenant_id IS NOT NULL 
AND user_type IS NULL;

-- Step 3: Update roles for library owners to match constraint
UPDATE admin_users 
SET role = 'library_owner'
WHERE user_type = 'library_owner'
AND role != 'library_owner'
AND role NOT IN ('super_admin', 'admin', 'support', 'analyst', 'sales', 'finance');

-- Step 4: Set default for any remaining NULL values (safety check)
UPDATE admin_users 
SET user_type = 'platform_admin'
WHERE user_type IS NULL;

-- Step 5: Now add the NOT NULL constraint and check constraint
ALTER TABLE admin_users 
ALTER COLUMN user_type SET NOT NULL;

ALTER TABLE admin_users 
ADD CONSTRAINT admin_users_user_type_check 
CHECK (user_type IN ('platform_admin', 'library_owner'));

-- Step 6: Update role constraints (drop old, add new)
ALTER TABLE admin_users 
DROP CONSTRAINT IF EXISTS admin_users_role_check;

ALTER TABLE admin_users 
ADD CONSTRAINT admin_users_role_check 
CHECK (
  (user_type = 'platform_admin' AND role IN ('super_admin', 'admin', 'support', 'analyst', 'sales', 'finance')) OR
  (user_type = 'library_owner' AND role = 'library_owner')
);

-- Platform admins don't need tenant_id (can be NULL)
-- Library owners MUST have tenant_id
ALTER TABLE admin_users 
ALTER COLUMN tenant_id DROP NOT NULL;

-- Add constraint: library_owner must have tenant_id
ALTER TABLE admin_users 
ADD CONSTRAINT admin_users_library_owner_tenant_check 
CHECK (
  (user_type = 'platform_admin' AND tenant_id IS NULL) OR
  (user_type = 'library_owner' AND tenant_id IS NOT NULL)
);

-- Add metadata column for additional user data (profile pic, KYC, etc.)
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_user_type ON admin_users(user_type);
CREATE INDEX IF NOT EXISTS idx_admin_users_tenant_role ON admin_users(tenant_id, role) WHERE tenant_id IS NOT NULL;

-- ============================================
-- UPDATE TENANT USERS TABLE (in tenant schema)
-- This is for library staff (managers, staff members)
-- Library owners are in admin_users with tenant_id
-- ============================================

-- Note: This will be in 002_create_tenant_schema.sql update
-- The users table should have:
-- - role: 'manager', 'staff' (NOT 'owner' - owners are in admin_users)
-- - library_id: which library they work at
-- - tenant_id: which tenant they belong to

-- ============================================
-- CREATE LIBRARY STAFF TABLE (Alternative approach)
-- Separate table for library staff in tenant schema
-- ============================================

-- This will be added to tenant schema migration
-- For now, we'll use the existing users table but clarify roles

-- ============================================
-- UPDATE TENANTS TABLE
-- Add owner_id to link tenant to library owner
-- ============================================

ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES admin_users(id);

CREATE INDEX IF NOT EXISTS idx_tenants_owner ON tenants(owner_id);

-- ============================================
-- CREATE ROLE PERMISSIONS TABLE
-- Define permissions for each role
-- ============================================

CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role VARCHAR(50) NOT NULL,
    user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('platform_admin', 'library_owner', 'library_staff', 'student')),
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    allowed BOOLEAN DEFAULT true,
    conditions JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(role, user_type, resource, action)
);

CREATE INDEX idx_role_permissions_role ON role_permissions(role, user_type);

-- Insert default permissions
INSERT INTO role_permissions (role, user_type, resource, action, allowed) VALUES
-- Platform Admin Permissions
('super_admin', 'platform_admin', '*', '*', true),
('admin', 'platform_admin', 'tenants', '*', true),
('admin', 'platform_admin', 'subscriptions', '*', true),
('admin', 'platform_admin', 'analytics', '*', true),
('support', 'platform_admin', 'tenants', 'read', true),
('support', 'platform_admin', 'tickets', '*', true),
('analyst', 'platform_admin', 'analytics', 'read', true),
('analyst', 'platform_admin', 'reports', 'read', true),
('sales', 'platform_admin', 'tenants', 'read', true),
('sales', 'platform_admin', 'subscriptions', '*', true),
('finance', 'platform_admin', 'payments', '*', true),
('finance', 'platform_admin', 'subscriptions', 'read', true),

-- Library Owner Permissions
('library_owner', 'library_owner', '*', '*', true), -- Full access to their tenant

-- Library Staff Permissions (will be in tenant schema)
('manager', 'library_staff', 'students', '*', true),
('manager', 'library_staff', 'bookings', '*', true),
('manager', 'library_staff', 'attendance', '*', true),
('manager', 'library_staff', 'payments', 'read', true),
('staff', 'library_staff', 'students', 'read', true),
('staff', 'library_staff', 'bookings', 'read', true),
('staff', 'library_staff', 'attendance', 'create', true),
('staff', 'library_staff', 'payments', 'read', true)

ON CONFLICT (role, user_type, resource, action) DO NOTHING;

-- ============================================
-- UPDATE AUDIT LOGS
-- Support all user types
-- ============================================

ALTER TABLE audit_logs 
ALTER COLUMN user_type TYPE VARCHAR(50);

ALTER TABLE audit_logs 
DROP CONSTRAINT IF EXISTS audit_logs_user_type_check;

ALTER TABLE audit_logs 
ADD CONSTRAINT audit_logs_user_type_check 
CHECK (user_type IN ('platform_admin', 'library_owner', 'library_staff', 'student'));

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON COLUMN admin_users.user_type IS 'platform_admin: SaaS platform staff, library_owner: Library business owner';
COMMENT ON COLUMN admin_users.tenant_id IS 'NULL for platform admins, required for library owners';
COMMENT ON COLUMN tenants.owner_id IS 'Reference to admin_users (library_owner) who owns this tenant';
COMMENT ON TABLE role_permissions IS 'Role-based access control permissions matrix';

