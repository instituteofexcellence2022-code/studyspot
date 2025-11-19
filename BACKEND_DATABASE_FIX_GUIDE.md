# Backend Database Fix Guide

## Problem
Data is not being saved (students, fee plans, profile updates) because:
1. **No tenant created** - Registration doesn't create a tenant
2. **No tenant_id in user** - Users aren't linked to tenants
3. **Services require tenantId** - All services need `x-tenant-id` header or tenantId in token
4. **Tenant database not set up** - Tenant databases don't exist or don't have schema

## Solution Implemented

### 1. Migration: Add tenant_id to admin_users
**File**: `backend/migrations/003_add_tenant_to_admin_users.sql`
- Adds `tenant_id` column to `admin_users` table
- Adds `metadata` column for additional user data
- Creates index for tenant lookups

**Run this migration on your database:**
```sql
-- Run the migration file
\i backend/migrations/003_add_tenant_to_admin_users.sql
```

Or manually:
```sql
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);

ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_admin_users_tenant_id ON admin_users(tenant_id);
```

### 2. Updated Registration
**File**: `backend/src/services/auth-service/index.ts`
- Creates a tenant for each new library owner during registration
- Links the user to the tenant via `tenant_id`
- Stores `tenant_id` in the JWT token

### 3. What Still Needs to Be Done

#### Option A: Use Same Database with tenant_id Filtering (Simpler)
For development/testing, you can use the same database for all tenants and filter by `tenant_id`:

1. **Update tenant database manager** to use the same database:
   - Modify `backend/src/config/database.ts`
   - Instead of creating separate databases, use the same database
   - Filter queries by `tenant_id`

2. **Ensure tenant schema exists**:
   - Run `backend/migrations/002_create_tenant_schema.sql` on your database
   - This creates tables like `students`, `libraries`, `bookings`, etc.

#### Option B: Separate Database Per Tenant (Production)
For production with proper isolation:

1. **Create tenant databases**:
   - For each tenant, create a separate database
   - Run `002_create_tenant_schema.sql` on each tenant database

2. **Update tenant records**:
   - Set `database_name` and `database_host` in the `tenants` table

## Quick Fix for Existing Users

If you have existing users without tenants:

```sql
-- Create a default tenant
INSERT INTO tenants (name, slug, email, status, subscription_plan, subscription_status, database_name, database_host)
VALUES ('Default Tenant', 'default', 'admin@studyspot.com', 'active', 'free', 'active', 'studyspot_tenant', 'localhost')
RETURNING id;

-- Link existing users to the default tenant
UPDATE admin_users 
SET tenant_id = (SELECT id FROM tenants WHERE slug = 'default' LIMIT 1)
WHERE tenant_id IS NULL;
```

## Testing

1. **Register a new user** - Should create a tenant automatically
2. **Check tenant_id in token** - Should be present in JWT
3. **Try creating a student** - Should work with tenant_id
4. **Check database** - Verify tenant and user are linked

## Environment Variables

Make sure these are set:
```env
DATABASE_URL=postgresql://user:password@host:port/database
# OR
CORE_DB_HOST=localhost
CORE_DB_PORT=5432
CORE_DB_NAME=studyspot_core
CORE_DB_USER=postgres
CORE_DB_PASSWORD=password
CORE_DB_SSL=false
```

## Next Steps

1. ✅ Run migration `003_add_tenant_to_admin_users.sql`
2. ✅ Deploy updated auth service
3. ⏳ Test registration - should create tenant
4. ⏳ Test student creation - should work with tenant_id
5. ⏳ Test fee plan creation - should work with tenant_id
6. ⏳ Test profile updates - should work with tenant_id

## Troubleshooting

### "Tenant ID not found" error
- Check if tenant was created during registration
- Verify `tenant_id` is in the JWT token
- Check `admin_users.tenant_id` column

### "Tenant database connection failed"
- For Option A: Ensure tenant schema is in the same database
- For Option B: Ensure tenant database exists and has schema

### "Network error" or "Fetch failed"
- Check if backend services are running
- Verify API Gateway is routing correctly
- Check CORS configuration
- Verify database connection

