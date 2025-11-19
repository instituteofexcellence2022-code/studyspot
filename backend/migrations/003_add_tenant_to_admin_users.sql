-- ============================================
-- ADD TENANT SUPPORT TO ADMIN USERS
-- ============================================

-- Add tenant_id column to admin_users
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);

-- Create index for tenant lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_tenant_id ON admin_users(tenant_id);

-- Add metadata column if it doesn't exist (for storing additional user data)
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

