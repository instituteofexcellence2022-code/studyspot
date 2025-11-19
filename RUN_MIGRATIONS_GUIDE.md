# How to Run Database Migrations

## Option 1: Using Node.js Script (If Database is Running Locally)

```bash
cd backend
npm run migrate:multi-tenant
```

**Note**: This requires:
- PostgreSQL running locally on port 5432
- Or correct `DATABASE_URL` in `.env` file

## Option 2: Manual SQL Execution (Recommended for Remote Databases)

### For Supabase/Remote PostgreSQL:

1. **Connect to your database** (using Supabase SQL Editor, pgAdmin, or psql)

2. **Run migrations in order:**

```sql
-- Migration 1: Core Schema Updates
-- Copy and paste contents of: backend/migrations/005_redesign_multi_tenant_saas.sql

-- Migration 2: Tenant Schema Updates  
-- Copy and paste contents of: backend/migrations/006_update_tenant_users_schema.sql

-- Migration 3: Data Migration
-- Copy and paste contents of: backend/migrations/007_migrate_existing_data.sql
```

### For Local PostgreSQL (psql):

```bash
# Connect to database
psql -U postgres -d studyspot_core

# Or with connection string
psql "postgresql://user:password@localhost:5432/studyspot_core"

# Run migrations
\i backend/migrations/005_redesign_multi_tenant_saas.sql
\i backend/migrations/006_update_tenant_users_schema.sql
\i backend/migrations/007_migrate_existing_data.sql
```

## Option 3: Using Supabase Dashboard

1. Go to your Supabase project
2. Navigate to **SQL Editor**
3. Copy and paste each migration file content
4. Run them one by one in order

## Quick Migration SQL (All in One)

If you want to run all migrations at once, here's a combined version:

```sql
-- ============================================
-- MIGRATION 005: Core Schema Updates
-- ============================================

-- Add user_type to admin_users
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS user_type VARCHAR(50) DEFAULT 'platform_admin' 
CHECK (user_type IN ('platform_admin', 'library_owner'));

-- Update role constraints
ALTER TABLE admin_users 
DROP CONSTRAINT IF EXISTS admin_users_role_check;

ALTER TABLE admin_users 
ADD CONSTRAINT admin_users_role_check 
CHECK (
  (user_type = 'platform_admin' AND role IN ('super_admin', 'admin', 'support', 'analyst', 'sales', 'finance')) OR
  (user_type = 'library_owner' AND role = 'library_owner')
);

-- Make tenant_id nullable (platform admins don't have tenant_id)
ALTER TABLE admin_users 
ALTER COLUMN tenant_id DROP NOT NULL;

-- Add constraint: library_owner must have tenant_id
ALTER TABLE admin_users 
ADD CONSTRAINT admin_users_library_owner_tenant_check 
CHECK (
  (user_type = 'platform_admin' AND tenant_id IS NULL) OR
  (user_type = 'library_owner' AND tenant_id IS NOT NULL)
);

-- Add metadata column
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_user_type ON admin_users(user_type);
CREATE INDEX IF NOT EXISTS idx_admin_users_tenant_role ON admin_users(tenant_id, role) WHERE tenant_id IS NOT NULL;

-- Add owner_id to tenants
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES admin_users(id);

CREATE INDEX IF NOT EXISTS idx_tenants_owner ON tenants(owner_id);

-- Create role_permissions table
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

CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role, user_type);

-- Insert default permissions (see migration file for full list)
-- ... (truncated for brevity, see full file)

-- ============================================
-- MIGRATION 007: Data Migration
-- ============================================

-- Set user_type for existing admin_users
UPDATE admin_users 
SET user_type = 'platform_admin'
WHERE tenant_id IS NULL 
AND user_type IS NULL;

UPDATE admin_users 
SET user_type = 'library_owner'
WHERE tenant_id IS NOT NULL 
AND user_type IS NULL;

-- Update role for library owners
UPDATE admin_users 
SET role = 'library_owner'
WHERE user_type = 'library_owner'
AND role != 'library_owner';

-- Link tenants to their owners
UPDATE tenants t
SET owner_id = (
  SELECT id FROM admin_users 
  WHERE tenant_id = t.id 
  AND user_type = 'library_owner' 
  ORDER BY created_at ASC
  LIMIT 1
)
WHERE owner_id IS NULL;
```

## Verify Migrations

After running migrations, verify with:

```sql
-- Check user_type distribution
SELECT user_type, COUNT(*) as count 
FROM admin_users 
GROUP BY user_type;

-- Check tenants have owner_id
SELECT id, name, email, owner_id 
FROM tenants 
WHERE owner_id IS NULL 
AND status = 'active';

-- Check for any issues
SELECT id, email, role, user_type, tenant_id 
FROM admin_users 
WHERE user_type IS NULL;
```

## Troubleshooting

### Error: "column user_type does not exist"
- Make sure you ran migration 005 first

### Error: "constraint violation"
- Check if there are existing users without proper user_type
- Run migration 007 to fix existing data

### Error: "relation does not exist"
- Make sure you ran the core schema migration (001) first
- Check that you're connected to the correct database

## Next Steps After Migrations

1. ✅ Verify migrations ran successfully
2. ✅ Test registration (should create library_owner)
3. ✅ Test login (token should include userType)
4. ✅ Verify tenant isolation

