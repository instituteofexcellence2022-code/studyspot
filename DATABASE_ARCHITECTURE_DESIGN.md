# Database Architecture Design - Multi-Tenant SaaS

## System Overview

StudySpot is a **Software as a Service (SaaS)** platform with three distinct portals:

1. **Student Portal** - For students using library services
2. **Web Owner Portal** - For library owners and their staff
3. **Web Admin Portal** - For platform/SaaS management (internal)

## Database Structure

### Core Database (Platform Level)
**Purpose**: Platform-wide data, tenant management, SaaS operations

**Tables**:
- `tenants` - Each library business is a tenant
- `admin_users` - Platform admins AND library owners
- `subscription_plans` - Available plans
- `subscriptions` - Tenant subscriptions
- `platform_analytics` - Platform-wide metrics
- `credit_master_wallet` - Platform credit inventory
- `tenant_credit_wallets` - Tenant credit balances
- `audit_logs` - Platform-wide audit trail
- `role_permissions` - RBAC permissions matrix

### Tenant Database (Tenant Level)
**Purpose**: Tenant-specific operational data

**Tables**:
- `libraries` - Libraries owned by tenant
- `users` - Library staff (managers, receptionists, etc.)
- `students` - Students enrolled in libraries
- `bookings` - Seat bookings
- `attendance` - Student attendance
- `payments` - Payment transactions
- `communications` - SMS/WhatsApp/Email logs
- `tickets` - Support tickets
- `referrals` - Referral program data

## User Hierarchy & Roles

### 1. Platform Admins (Core Database: `admin_users`)
**User Type**: `platform_admin`  
**Tenant ID**: `NULL` (not tied to any tenant)  
**Roles**:
- `super_admin` - Full platform access
- `admin` - Tenant management
- `support` - Customer support
- `analyst` - Analytics access
- `sales` - Sales operations
- `finance` - Financial operations

**Access**: Web Admin Portal  
**Can Access**: All tenants (for management)

### 2. Library Owners (Core Database: `admin_users`)
**User Type**: `library_owner`  
**Tenant ID**: Required (linked to their tenant)  
**Role**: `library_owner`

**Access**: Web Owner Portal  
**Can Access**: Only their own tenant data  
**Permissions**: Full control over their tenant (libraries, staff, students, etc.)

### 3. Library Staff (Tenant Database: `users`)
**User Type**: `library_staff`  
**Tenant ID**: Required (inherited from library)  
**Roles**:
- `manager` - Can manage library operations
- `staff` - Limited access

**Staff Types**:
- `manager` - Full library management
- `receptionist` - Front desk operations
- `attendance_staff` - Attendance management
- `finance_staff` - Payment processing
- `general` - General staff

**Access**: Web Owner Portal (limited features based on role)  
**Can Access**: Only their assigned library(ies) within their tenant

### 4. Students (Tenant Database: `students`)
**User Type**: `student`  
**Tenant ID**: Required (inherited from library)  
**No login** - Access via Student Portal with phone/email

**Access**: Student Portal  
**Can Access**: Only their own data (bookings, attendance, payments)

## Data Isolation Strategy

### Option A: Shared Database with tenant_id (Recommended for <100 tenants)
- All tenants share the same database
- All tenant tables have `tenant_id` column
- Queries automatically filter by `tenant_id`
- **Pros**: Simple, cost-effective, easy backup
- **Cons**: Less isolation, potential for cross-tenant queries if not careful

### Option B: Separate Database Per Tenant (Recommended for 100+ tenants)
- Each tenant has their own database
- Database name: `tenant_{tenant_slug}_{id}`
- **Pros**: Maximum isolation, better performance at scale
- **Cons**: More complex, higher cost, harder to manage

### Current Implementation
- Uses **Option A** (shared database) by default
- Can switch to **Option B** per tenant via `USE_SHARED_DATABASE=false`
- Tenant database connection manager handles both strategies

## Key Relationships

```
Platform Level (Core DB):
┌─────────────┐
│   tenants   │───┐
└─────────────┘   │
                   │ (owner_id)
┌─────────────┐   │
│ admin_users │◄──┘
└─────────────┘
   │
   ├── platform_admin (tenant_id = NULL)
   └── library_owner (tenant_id = required)

Tenant Level (Tenant DB):
┌─────────────┐
│  libraries  │
└─────────────┘
   │
   ├──┐
   │  │ (library_id)
   │  ▼
   │ ┌─────────────┐
   │ │    users    │ (library staff)
   │ └─────────────┘
   │
   └──┐
      │ (library_id)
      ▼
   ┌─────────────┐
   │  students   │
   └─────────────┘
      │
      ├── bookings
      ├── attendance
      ├── payments
      └── communications
```

## Authentication Flow

### Platform Admin Login
1. Login via Web Admin Portal
2. Authenticate against `admin_users` (user_type = 'platform_admin')
3. No tenant_id in token (can access all tenants)
4. Access: All tenant data (for management)

### Library Owner Login
1. Login via Web Owner Portal
2. Authenticate against `admin_users` (user_type = 'library_owner')
3. Token includes `tenant_id`
4. Access: Only their tenant's data

### Library Staff Login
1. Login via Web Owner Portal
2. Authenticate against `users` table (tenant database)
3. Token includes `tenant_id` and `library_id`
4. Access: Only their assigned library(ies) within tenant

### Student Access
1. Access via Student Portal
2. Authenticate with phone/email (no password for students)
3. Token includes `tenant_id`, `library_id`, `student_id`
4. Access: Only their own data

## Security Considerations

### Tenant Isolation
- All queries MUST include `tenant_id` filter
- Middleware enforces tenant context
- Cross-tenant access is blocked

### Role-Based Access Control (RBAC)
- Permissions defined in `role_permissions` table
- Checked at middleware level
- Granular resource + action permissions

### Data Access Rules
1. **Platform Admins**: Can access all tenants (read/write based on role)
2. **Library Owners**: Can access only their tenant (full control)
3. **Library Staff**: Can access only their assigned library(ies)
4. **Students**: Can access only their own data

## Migration Path

### For Existing Data
1. Run `005_redesign_multi_tenant_saas.sql` to update core schema
2. Run `006_update_tenant_users_schema.sql` to update tenant schema
3. Migrate existing library owners:
   ```sql
   -- Set user_type for existing users
   UPDATE admin_users 
   SET user_type = 'library_owner' 
   WHERE tenant_id IS NOT NULL;
   
   -- Set user_type for platform admins
   UPDATE admin_users 
   SET user_type = 'platform_admin' 
   WHERE tenant_id IS NULL;
   ```
4. Update tenant owner_id:
   ```sql
   UPDATE tenants t
   SET owner_id = (
     SELECT id FROM admin_users 
     WHERE tenant_id = t.id 
     AND user_type = 'library_owner' 
     LIMIT 1
   );
   ```

## Best Practices

1. **Always filter by tenant_id** in tenant-scoped queries
2. **Use middleware** for automatic tenant context
3. **Validate permissions** at API level, not just UI
4. **Audit all sensitive operations** (automatic via middleware)
5. **Use connection pooling** for performance
6. **Monitor tenant isolation** via audit logs

## Scalability Considerations

### Small Scale (< 100 tenants)
- Use shared database (Option A)
- Single server deployment
- In-memory caching

### Medium Scale (100-1000 tenants)
- Shared database with optimized indexes
- Multiple server instances
- Redis caching

### Large Scale (1000+ tenants)
- Database sharding by tenant
- Separate databases for large tenants
- Distributed caching
- Load balancing

## Example Queries

### Get Library Owner's Tenant Data
```sql
-- Library owner can see all their libraries
SELECT * FROM libraries 
WHERE tenant_id = $1; -- From token
```

### Get Library Staff's Assigned Libraries
```sql
-- Staff can only see their assigned library
SELECT l.* FROM libraries l
JOIN users u ON u.library_id = l.id
WHERE u.id = $1 AND l.tenant_id = $2;
```

### Platform Admin View All Tenants
```sql
-- Platform admin can see all tenants
SELECT * FROM tenants 
WHERE status = 'active';
```

### Student View Their Bookings
```sql
-- Student can only see their own bookings
SELECT * FROM bookings 
WHERE student_id = $1 
AND tenant_id = $2; -- From token
```

