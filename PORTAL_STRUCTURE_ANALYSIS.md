# Portal Structure Deep Analysis

## Overview

StudySpot is a multi-tenant SaaS platform with **3 distinct portals**:

1. **Student Portal** (PWA) - For students to book seats
2. **Web Owner Portal** - For library owners and their staff
3. **Web Admin Portal** - For platform administrators

## User Type Analysis

### 1. STUDENTS
- **Portal**: Student Portal (PWA)
- **Database**: Tenant Database (`students` table)
- **Characteristics**:
  - Belongs to a tenant (enrolled in libraries)
  - Can book seats
  - Has profile, bookings, attendance records
  - No access to owner/admin portals

### 2. LIBRARY OWNERS
- **Portal**: Web Owner Portal
- **Database**: Core Database (`library_owners` table)
- **Characteristics**:
  - One owner per tenant (1:1 relationship with `tenants`)
  - Full access to their tenant's data
  - Can create libraries, manage staff, view analytics
  - Registration creates a new tenant automatically
  - Role: `library_owner` (default on registration)

### 3. LIBRARY STAFF
- **Portal**: Web Owner Portal (limited access)
- **Database**: Tenant Database (`library_staff` table)
- **Roles** (from web-owner types):
  - `library_staff` - Basic staff
  - `branch_manager` - Manages a branch/library
  - `front_desk_staff` - Front desk operations
  - `facility_manager` - Facility management
  - `finance_manager` - Financial operations
  - `analytics_manager` - Analytics and reporting
- **Characteristics**:
  - Belongs to a tenant (created by library owner)
  - Limited permissions based on role
  - Can access owner portal with restricted features
  - Created/managed by library owner

### 4. PLATFORM SUPER ADMIN
- **Portal**: Web Admin Portal
- **Database**: Core Database (`platform_admins` table)
- **Characteristics**:
  - No tenant association (`tenant_id` is NULL)
  - Full system access
  - Can manage all tenants, users, platform settings
  - Role: `super_admin`
  - Single or few super admins

### 5. PLATFORM STAFF
- **Portal**: Web Admin Portal
- **Database**: Core Database (`platform_staff` table)
- **Roles** (from web-admin types):
  - `admin` - Platform administrator
  - `support` - Customer support
  - `viewer` - Read-only access
  - Additional roles: `analyst`, `sales`, `finance` (from migration)
- **Characteristics**:
  - No tenant association (`tenant_id` is NULL)
  - Platform-level operations
  - Role-based access control
  - Can access tenant data for support purposes

## Portal-Specific Details

### Web Owner Portal (`web-owner/`)

**User Types:**
- Library Owners (primary users)
- Library Staff (secondary users with limited access)

**Registration Flow:**
```typescript
// Default role: 'library_owner'
role: data.role || 'library_owner'
```

**User Roles (from types/index.ts):**
```typescript
type UserRole = 
  | 'student'           // Not used in owner portal
  | 'library_staff'     // Staff member
  | 'library_owner'      // Owner (default)
  | 'branch_manager'     // Staff role
  | 'front_desk_staff'   // Staff role
  | 'facility_manager'    // Staff role
  | 'finance_manager'    // Staff role
  | 'analytics_manager'  // Staff role
  | 'super_admin'        // Not used in owner portal
  | 'platform_support';  // Not used in owner portal
```

**Key Features:**
- Tenant-scoped (all data belongs to owner's tenant)
- Staff management (create/manage library staff)
- Library management
- Student management
- Booking oversight
- Revenue analytics
- Fee plan management

### Web Admin Portal (`web-admin-new/`)

**User Types:**
- Platform Super Admin
- Platform Staff

**User Roles (from types/index.ts):**
```typescript
type UserRole = 
  | 'super_admin'  // Full access
  | 'admin'         // Platform admin
  | 'support'       // Customer support
  | 'viewer';       // Read-only
```

**Key Features:**
- Platform-level (no tenant association)
- Tenant management (view/manage all tenants)
- User management (platform users)
- Analytics (platform-wide)
- System health monitoring
- Revenue oversight
- Audit logs

## Database Structure Requirements

### Core Database (Platform Level)

**Tables:**
1. `tenants` - Library businesses
   - `owner_id` → references `library_owners(id)`
   - One tenant per library owner

2. `library_owners` - Library business owners
   - `tenant_id` → references `tenants(id)` (UNIQUE, one owner per tenant)
   - `email`, `password_hash`, `first_name`, `last_name`, `phone`
   - `is_active`, `last_login_at`, `last_login_ip`
   - `metadata` (JSONB)

3. `platform_admins` - Platform super administrators
   - NO `tenant_id` (NULL)
   - `email`, `password_hash`, `first_name`, `last_name`, `phone`
   - `is_active`, `last_login_at`, `last_login_ip`
   - `metadata` (JSONB)

4. `platform_staff` - Platform employees
   - NO `tenant_id` (NULL)
   - `email`, `password_hash`, `first_name`, `last_name`, `phone`
   - `role` (admin, support, analyst, sales, finance, viewer)
   - `department` (optional)
   - `permissions` (JSONB array)
   - `is_active`, `last_login_at`, `last_login_ip`
   - `metadata` (JSONB)

5. `subscriptions` - Tenant subscriptions
   - `tenant_id` → references `tenants(id)`
   - Subscription plan details

6. `audit_logs` - Platform audit logs
   - `user_id` + `user_table` (which table the user is in)
   - `user_type` (optional, for backward compatibility)

7. `refresh_tokens` - Authentication tokens
   - `user_id` + `user_table` (which table the user is in)

### Tenant Database (Per Tenant)

**Tables:**
1. `students` - Students enrolled in this tenant
   - `tenant_id` (implicit, from database context)
   - Student details, enrollment info

2. `library_staff` - Staff members for this tenant
   - `tenant_id` (implicit)
   - `role` (library_staff, branch_manager, front_desk_staff, etc.)
   - `library_id` (which library they work at)
   - Employment details

3. `libraries` - Libraries owned by this tenant
   - `tenant_id` (implicit)
   - Library details, settings

4. `bookings` - Seat bookings
   - `tenant_id` (implicit)
   - Booking details

5. `attendance` - Attendance records
   - `tenant_id` (implicit)

6. `payments` - Payment transactions
   - `tenant_id` (implicit)

## API Route Structure

```
/api/v1/student/*          - Student Portal APIs
/api/v1/owner/*            - Library Owner APIs (web-owner portal)
/api/v1/staff/*            - Library Staff APIs (web-owner portal, limited)
/api/v1/platform/admin/*   - Platform Super Admin APIs (web-admin portal)
/api/v1/platform/staff/*   - Platform Staff APIs (web-admin portal)
```

## Authentication Flow

### Library Owner Registration
1. User registers via web-owner portal
2. Backend creates:
   - New `tenant` record
   - New `library_owner` record (linked to tenant)
3. Returns JWT token with:
   - `userType: 'library_owner'`
   - `tenantId: <tenant_id>`
   - `userId: <library_owner_id>`

### Library Owner Login
1. User logs in via web-owner portal
2. Backend authenticates against `library_owners` table
3. Returns JWT token with user context

### Library Staff Creation
1. Library owner creates staff via web-owner portal
2. Backend creates record in tenant database `library_staff` table
3. Staff can login with limited permissions

### Platform Admin/Staff Login
1. User logs in via web-admin portal
2. Backend authenticates against `platform_admins` or `platform_staff` table
3. Returns JWT token with:
   - `userType: 'platform_admin'` or `'platform_staff'`
   - `tenantId: null`
   - `userId: <admin/staff_id>`

## Key Distinctions

| Aspect | Library Owner | Library Staff | Platform Admin | Platform Staff |
|--------|--------------|---------------|----------------|----------------|
| **Portal** | Web Owner | Web Owner | Web Admin | Web Admin |
| **Database** | Core DB | Tenant DB | Core DB | Core DB |
| **Tenant ID** | Required (1:1) | Required (implicit) | NULL | NULL |
| **Can Create Tenants** | No | No | Yes | No |
| **Can Manage Staff** | Yes | No | No | No |
| **Access Scope** | Own tenant only | Own tenant only | All tenants | Platform-wide |

## Migration Strategy

1. **Create new tables** for clear separation:
   - `library_owners` (core DB)
   - `platform_admins` (core DB)
   - `platform_staff` (core DB)
   - `library_staff` (tenant DB, migration 009)

2. **Migrate existing data** from `admin_users`:
   - Users with `tenant_id` → `library_owners`
   - Users with `role = 'super_admin'` and `tenant_id IS NULL` → `platform_admins`
   - Users with `role IN ('admin', 'support', ...)` and `tenant_id IS NULL` → `platform_staff`

3. **Update foreign keys**:
   - `tenants.owner_id` → references `library_owners(id)`

4. **Update audit logs and refresh tokens**:
   - Add `user_table` column to track which table user is in

5. **Drop old `admin_users` table** (after migration verified)

