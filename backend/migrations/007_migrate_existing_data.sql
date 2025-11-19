-- ============================================
-- MIGRATE EXISTING DATA
-- Update existing records to match new structure
-- ============================================

-- Step 1: Set user_type for existing admin_users
-- Platform admins (no tenant_id)
UPDATE admin_users 
SET user_type = 'platform_admin'
WHERE tenant_id IS NULL 
AND user_type IS NULL;

-- Library owners (have tenant_id)
UPDATE admin_users 
SET user_type = 'library_owner'
WHERE tenant_id IS NOT NULL 
AND user_type IS NULL;

-- Step 2: Update role for library owners
-- Ensure library owners have correct role
UPDATE admin_users 
SET role = 'library_owner'
WHERE user_type = 'library_owner'
AND role != 'library_owner';

-- Step 3: Link tenants to their owners
UPDATE tenants t
SET owner_id = (
  SELECT id FROM admin_users 
  WHERE tenant_id = t.id 
  AND user_type = 'library_owner' 
  ORDER BY created_at ASC
  LIMIT 1
)
WHERE owner_id IS NULL;

-- Step 4: Update audit_logs user_type if needed
-- This is optional - audit logs may have different format
-- UPDATE audit_logs SET user_type = 'platform_admin' WHERE user_type = 'admin' AND user_id IN (SELECT id FROM admin_users WHERE user_type = 'platform_admin');

-- Step 5: Verify data integrity
-- Check for any admin_users without user_type
SELECT id, email, role, tenant_id, user_type 
FROM admin_users 
WHERE user_type IS NULL;

-- Check for tenants without owner_id
SELECT id, name, email, owner_id 
FROM tenants 
WHERE owner_id IS NULL 
AND status = 'active';

-- Summary
SELECT 
  user_type,
  COUNT(*) as count
FROM admin_users
GROUP BY user_type;

