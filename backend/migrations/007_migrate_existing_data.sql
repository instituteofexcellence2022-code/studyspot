-- ============================================
-- MIGRATE EXISTING DATA
-- Update existing records to match new structure
-- Note: Most data migration is now in 005_redesign_multi_tenant_saas.sql
-- This file only handles linking tenants to owners
-- ============================================

-- Step 1: Link tenants to their owners (if not already done in migration 005)
UPDATE tenants t
SET owner_id = (
  SELECT id FROM admin_users 
  WHERE tenant_id = t.id 
  AND user_type = 'library_owner' 
  ORDER BY created_at ASC
  LIMIT 1
)
WHERE owner_id IS NULL;

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

