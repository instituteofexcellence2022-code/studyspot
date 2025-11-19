# API Routes Design - Clear Separation by User Type

## User Types Overview

1. **Students** - Use library services
2. **Library Owners** - Own and manage their library business
3. **Library Staff** - Work for library owners (managers, receptionists, etc.)
4. **Platform Super Admin** - Full platform access
5. **Platform Staff** - Platform employees with specific roles (admin, support, analyst, sales, finance)

## API Route Structure

### Base Paths

```
/api/v1/student/*          - Student Portal APIs
/api/v1/owner/*            - Library Owner Portal APIs
/api/v1/staff/*            - Library Staff Portal APIs
/api/v1/platform/admin/*   - Platform Super Admin APIs
/api/v1/platform/staff/*   - Platform Staff APIs
```

## Detailed Route Structure

### 1. Student Portal (`/api/v1/student/*`)

**Authentication:**
- `POST /api/v1/student/auth/register` - Student registration
- `POST /api/v1/student/auth/login` - Student login (phone/email)
- `POST /api/v1/student/auth/verify-otp` - OTP verification
- `GET /api/v1/student/auth/me` - Get current student

**Student Operations:**
- `GET /api/v1/student/profile` - Get profile
- `PUT /api/v1/student/profile` - Update profile
- `GET /api/v1/student/bookings` - My bookings
- `POST /api/v1/student/bookings` - Create booking
- `GET /api/v1/student/attendance` - My attendance
- `GET /api/v1/student/payments` - My payments
- `GET /api/v1/student/libraries` - Browse libraries

### 2. Library Owner Portal (`/api/v1/owner/*`)

**Authentication:**
- `POST /api/v1/owner/auth/register` - Library owner registration
- `POST /api/v1/owner/auth/login` - Library owner login
- `GET /api/v1/owner/auth/me` - Get current owner

**Owner Operations:**
- `GET /api/v1/owner/dashboard` - Owner dashboard
- `GET /api/v1/owner/profile` - Owner profile
- `PUT /api/v1/owner/profile` - Update profile

**Library Management:**
- `GET /api/v1/owner/libraries` - My libraries
- `POST /api/v1/owner/libraries` - Create library
- `PUT /api/v1/owner/libraries/:id` - Update library
- `DELETE /api/v1/owner/libraries/:id` - Delete library

**Staff Management:**
- `GET /api/v1/owner/staff` - List staff
- `POST /api/v1/owner/staff` - Add staff member
- `PUT /api/v1/owner/staff/:id` - Update staff
- `DELETE /api/v1/owner/staff/:id` - Remove staff

**Student Management:**
- `GET /api/v1/owner/students` - List students
- `POST /api/v1/owner/students` - Add student
- `PUT /api/v1/owner/students/:id` - Update student
- `GET /api/v1/owner/students/:id` - Get student details

**Operations:**
- `GET /api/v1/owner/bookings` - All bookings
- `GET /api/v1/owner/attendance` - Attendance records
- `GET /api/v1/owner/payments` - Payment records
- `GET /api/v1/owner/analytics` - Analytics

**Settings:**
- `GET /api/v1/owner/settings` - Get settings
- `PUT /api/v1/owner/settings` - Update settings
- `GET /api/v1/owner/subscription` - Subscription info

### 3. Library Staff Portal (`/api/v1/staff/*`)

**Authentication:**
- `POST /api/v1/staff/auth/login` - Staff login
- `GET /api/v1/staff/auth/me` - Get current staff

**Staff Operations (Role-based):**
- `GET /api/v1/staff/dashboard` - Staff dashboard
- `GET /api/v1/staff/profile` - Staff profile
- `PUT /api/v1/staff/profile` - Update profile

**Student Management (Manager/Receptionist):**
- `GET /api/v1/staff/students` - List students (read-only for general staff)
- `POST /api/v1/staff/students` - Add student (manager only)
- `PUT /api/v1/staff/students/:id` - Update student (manager only)

**Attendance (Attendance Staff):**
- `GET /api/v1/staff/attendance` - View attendance
- `POST /api/v1/staff/attendance/check-in` - Check-in student
- `POST /api/v1/staff/attendance/check-out` - Check-out student

**Bookings (Manager/Receptionist):**
- `GET /api/v1/staff/bookings` - View bookings
- `POST /api/v1/staff/bookings` - Create booking (manager only)
- `PUT /api/v1/staff/bookings/:id` - Update booking (manager only)

**Payments (Finance Staff):**
- `GET /api/v1/staff/payments` - View payments
- `POST /api/v1/staff/payments` - Record payment (finance staff only)

### 4. Platform Super Admin (`/api/v1/platform/admin/*`)

**Authentication:**
- `POST /api/v1/platform/admin/auth/login` - Super admin login
- `GET /api/v1/platform/admin/auth/me` - Get current admin

**Platform Management:**
- `GET /api/v1/platform/admin/dashboard` - Platform dashboard
- `GET /api/v1/platform/admin/tenants` - All tenants
- `GET /api/v1/platform/admin/tenants/:id` - Tenant details
- `PUT /api/v1/platform/admin/tenants/:id` - Update tenant
- `POST /api/v1/platform/admin/tenants/:id/suspend` - Suspend tenant
- `POST /api/v1/platform/admin/tenants/:id/activate` - Activate tenant

**User Management:**
- `GET /api/v1/platform/admin/owners` - All library owners
- `GET /api/v1/platform/admin/staff` - All platform staff
- `POST /api/v1/platform/admin/staff` - Create platform staff
- `PUT /api/v1/platform/admin/staff/:id` - Update platform staff

**Subscriptions:**
- `GET /api/v1/platform/admin/subscriptions` - All subscriptions
- `POST /api/v1/platform/admin/subscriptions` - Create subscription
- `PUT /api/v1/platform/admin/subscriptions/:id` - Update subscription

**Analytics:**
- `GET /api/v1/platform/admin/analytics` - Platform analytics
- `GET /api/v1/platform/admin/reports` - Generate reports

**System:**
- `GET /api/v1/platform/admin/system/health` - System health
- `GET /api/v1/platform/admin/system/logs` - System logs

### 5. Platform Staff (`/api/v1/platform/staff/*`)

**Authentication:**
- `POST /api/v1/platform/staff/auth/login` - Staff login
- `GET /api/v1/platform/staff/auth/me` - Get current staff

**Role-Based Access:**

#### Support Staff (`/api/v1/platform/staff/support/*`)
- `GET /api/v1/platform/staff/support/tenants` - View tenants (read-only)
- `GET /api/v1/platform/staff/support/tickets` - Support tickets
- `POST /api/v1/platform/staff/support/tickets/:id/resolve` - Resolve ticket

#### Analyst Staff (`/api/v1/platform/staff/analyst/*`)
- `GET /api/v1/platform/staff/analyst/analytics` - View analytics
- `GET /api/v1/platform/staff/analyst/reports` - Generate reports

#### Sales Staff (`/api/v1/platform/staff/sales/*`)
- `GET /api/v1/platform/staff/sales/tenants` - View tenants (read-only)
- `GET /api/v1/platform/staff/sales/subscriptions` - View subscriptions
- `POST /api/v1/platform/staff/sales/subscriptions` - Create subscription

#### Finance Staff (`/api/v1/platform/staff/finance/*`)
- `GET /api/v1/platform/staff/finance/payments` - Platform payments
- `GET /api/v1/platform/staff/finance/subscriptions` - View subscriptions
- `GET /api/v1/platform/staff/finance/reports` - Financial reports

## Authentication Endpoints (Legacy Support)

For backward compatibility, these can still work but redirect to new paths:

```
POST /api/auth/register          → POST /api/v1/owner/auth/register (if library owner)
POST /api/auth/login             → POST /api/v1/owner/auth/login (if library owner)
POST /api/auth/login             → POST /api/v1/platform/admin/auth/login (if super admin)
POST /api/auth/login             → POST /api/v1/platform/staff/auth/login (if platform staff)
```

## Route Implementation Example

```typescript
// Library Owner Routes
fastify.post('/api/v1/owner/auth/register', async (request, reply) => {
  // Register library owner
  // Creates library_owners record
  // Creates tenant
});

fastify.post('/api/v1/owner/auth/login', async (request, reply) => {
  // Login library owner
  // Authenticate against library_owners table
  // Return token with userType: 'library_owner'
});

// Platform Admin Routes
fastify.post('/api/v1/platform/admin/auth/login', async (request, reply) => {
  // Login platform super admin
  // Authenticate against platform_admins table
  // Return token with userType: 'platform_admin'
});

// Platform Staff Routes
fastify.post('/api/v1/platform/staff/auth/login', async (request, reply) => {
  // Login platform staff
  // Authenticate against platform_staff table
  // Return token with userType: 'platform_staff', role: 'support'|'analyst'|etc.
});
```

## Benefits of This Structure

1. **Clear Separation** - Each user type has distinct routes
2. **No Confusion** - `/api/v1/owner/*` is clearly for library owners
3. **Role-Based Access** - Platform staff routes are role-specific
4. **Scalable** - Easy to add new routes per user type
5. **Maintainable** - Clear which routes belong to which portal

## Migration Path

1. Create new tables (library_owners, platform_admins, platform_staff, library_staff)
2. Migrate data from admin_users
3. Update API routes to use new paths
4. Update frontend to use new API paths
5. Deprecate old routes (keep for backward compatibility)

