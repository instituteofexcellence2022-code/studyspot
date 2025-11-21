# 🎯 StudySpot - Five User Types Architecture

## Overview

**3 Portals** serving **5 distinct user types** with clear separation and role-based access control.

---

## 📱 **Portal Architecture**

### **1. Student Portal** (`studyspot-student-pwa/`)
**Target Users:** Students only  
**URL:** PWA/Mobile App  
**Tech Stack:** React PWA, Mobile-first

**User Type:**
- ✅ **Student** (`user_type: 'student'`)

---

### **2. Web Owner Portal** (`web-owner/`)
**Target Users:** Library business owners and their staff  
**URL:** https://owner.studyspot.com  
**Port:** 3001  
**Tech Stack:** React, TypeScript, Material-UI

**User Types:**
- ✅ **Library Owner** (`user_type: 'library_owner'`)
- ✅ **Library Staff** (`user_type: 'library_staff'`)

**Library Staff Roles:**
- `manager` - Branch manager
- `receptionist` - Front desk staff
- `attendance_staff` - Attendance management
- `finance_staff` - Financial operations
- `general` - General staff

---

### **3. Web Admin Portal** (`web-admin-new/frontend/`)
**Target Users:** Platform administrators and platform staff  
**URL:** https://admin.studyspot.com  
**Port:** 3002  
**Tech Stack:** React 18, TypeScript, Material-UI, Redux Toolkit

**User Types:**
- ✅ **Platform Super Admin** (`user_type: 'platform_admin'`, `role: 'super_admin'`)
- ✅ **Platform Staff** (`user_type: 'platform_staff'`)

**Platform Staff Roles:**
- `admin` - Platform administrator
- `support` - Support team
- `analyst` - Data analyst
- `sales` - Sales team
- `finance` - Finance team

---

## 👥 **The 5 User Types**

### **1. Student** 🎓
- **Portal:** Student Portal (PWA/Mobile)
- **Database:** Tenant DB → `students` table
- **User Type:** `user_type: 'student'`
- **Role:** `role: 'student'`
- **Permissions:** 
  - View libraries
  - Book seats
  - Make payments
  - View own bookings
  - Manage own profile

**Database Schema:**
```sql
-- In tenant database
CREATE TABLE students (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    user_type VARCHAR(50) DEFAULT 'student',
    -- ... other fields
);
```

---

### **2. Library Owner** 🏢
- **Portal:** Web Owner Portal
- **Database:** Core DB → `library_owners` table
- **User Type:** `user_type: 'library_owner'`
- **Role:** `role: 'library_owner'`
- **Tenant ID:** Required (one owner per tenant)
- **Permissions:**
  - Full access to their tenant
  - Manage libraries, staff, students
  - View all bookings and payments
  - Manage subscriptions
  - Access analytics for their libraries

**Database Schema:**
```sql
-- In core database
CREATE TABLE library_owners (
    id UUID PRIMARY KEY,
    tenant_id UUID UNIQUE NOT NULL,  -- One-to-one with tenant
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Authentication Flow:**
1. Login via `/api/auth/owner/login`
2. Token contains `userTable: 'library_owners'`, `userType: 'library_owner'`
3. Access restricted to their `tenant_id`

---

### **3. Library Staff** 👨‍💼
- **Portal:** Web Owner Portal
- **Database:** Tenant DB → `library_staff` table
- **User Type:** `user_type: 'library_staff'`
- **Roles:** `manager`, `receptionist`, `attendance_staff`, `finance_staff`, `general`
- **Tenant ID:** Required
- **Library ID:** Optional (may work at specific library)
- **Permissions:** Based on role
  - **Manager:** Full access to assigned library
  - **Receptionist:** Daily operations, bookings, check-ins
  - **Attendance Staff:** Mark attendance, manage check-ins
  - **Finance Staff:** View payments, generate invoices
  - **General:** Limited access

**Database Schema:**
```sql
-- In tenant database
CREATE TABLE library_staff (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    library_id UUID REFERENCES libraries(id),  -- Optional: specific library
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL CHECK (role IN ('manager', 'receptionist', 'attendance_staff', 'finance_staff', 'general')),
    staff_type VARCHAR(50),  -- Same as role
    employee_id VARCHAR(50) UNIQUE,
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, email)
);
```

**Authentication Flow:**
1. Login via `/api/auth/staff/login` or `/api/v1/auth/login`
2. Token contains `userTable: 'library_staff'`, `userType: 'library_staff'`
3. Access filtered by `tenant_id` and optionally `library_id`

---

### **4. Platform Super Admin** ⚙️
- **Portal:** Web Admin Portal
- **Database:** Core DB → `platform_admins` table
- **User Type:** `user_type: 'platform_admin'`
- **Role:** `role: 'super_admin'`
- **Tenant ID:** NULL (no tenant association)
- **Permissions:**
  - Full access to entire platform
  - Manage all tenants
  - View platform-wide analytics
  - Manage platform staff
  - System configuration
  - Access all data across all tenants

**Database Schema:**
```sql
-- In core database
CREATE TABLE platform_admins (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Authentication Flow:**
1. Login via `/api/v1/auth/admin/login`
2. Token contains `userTable: 'platform_admins'`, `userType: 'platform_admin'`, `role: 'super_admin'`
3. No tenant restriction - can access all tenants

---

### **5. Platform Staff** 👨‍💻
- **Portal:** Web Admin Portal
- **Database:** Core DB → `platform_staff` table
- **User Type:** `user_type: 'platform_staff'`
- **Roles:** `admin`, `support`, `analyst`, `sales`, `finance`
- **Tenant ID:** NULL (no tenant association)
- **Permissions:** Based on role
  - **Admin:** Platform administration (limited)
  - **Support:** Support tickets, tenant assistance
  - **Analyst:** Analytics access, reports
  - **Sales:** Tenant management, subscriptions
  - **Finance:** Payments, invoices, revenue

**Database Schema:**
```sql
-- In core database
CREATE TABLE platform_staff (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'support', 'analyst', 'sales', 'finance')),
    department VARCHAR(50) CHECK (department IN ('management', 'sales', 'finance', 'operations', 'hr', 'support')),
    permissions JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Authentication Flow:**
1. Login via `/api/v1/auth/admin/login`
2. Token contains `userTable: 'platform_staff'`, `userType: 'platform_staff'`, `role: 'admin'|'support'|...`
3. Permissions checked against `role` and `permissions` JSONB field

---

## 🔐 **Authentication & Authorization**

### **Login Endpoints**

#### **Student Portal:**
```typescript
POST /api/auth/login
POST /api/auth/student/login
```

#### **Web Owner Portal:**
```typescript
// Library Owner
POST /api/auth/owner/login
POST /api/v1/auth/owner/login

// Library Staff
POST /api/auth/staff/login
POST /api/v1/auth/login  // Detects user type from email/table
```

#### **Web Admin Portal:**
```typescript
// Platform Super Admin & Platform Staff
POST /api/v1/auth/admin/login
```

---

### **JWT Token Structure**

All tokens include:
```json
{
  "userId": "uuid",
  "userTable": "library_owners" | "platform_admins" | "platform_staff" | "library_staff" | "students",
  "userType": "library_owner" | "platform_admin" | "platform_staff" | "library_staff" | "student",
  "role": "super_admin" | "library_owner" | "manager" | "admin" | "support" | ...,
  "tenantId": "uuid" | null,  // null for platform admins/staff
  "libraryId": "uuid" | null,  // optional for library staff
  "permissions": ["permission1", "permission2"],
  "iat": 1234567890,
  "exp": 1234567890
}
```

---

### **Role-Based Access Control (RBAC)**

#### **Permission Matrix:**

| User Type | Portal | Tenant Access | Library Access | Platform Access |
|-----------|--------|---------------|----------------|-----------------|
| **Student** | Student Portal | Own tenant only | All libraries (view only) | None |
| **Library Owner** | Web Owner Portal | Own tenant (full access) | All libraries in tenant | None |
| **Library Staff** | Web Owner Portal | Own tenant (limited) | Assigned library/branches | None |
| **Platform Super Admin** | Web Admin Portal | All tenants | All libraries | Full platform |
| **Platform Staff** | Web Admin Portal | All tenants (read/limited) | All libraries (read/limited) | Based on role |

---

### **Access Control Middleware**

#### **1. Tenant Isolation:**
```typescript
// Library Owner & Staff: Only access their tenant
if (userType === 'library_owner' || userType === 'library_staff') {
  // Filter by tenant_id
  query += ` WHERE tenant_id = $1`;
}

// Platform Admin & Staff: Can access all tenants
if (userType === 'platform_admin' || userType === 'platform_staff') {
  // No tenant filter (or optional tenant_id filter)
}
```

#### **2. Library Restriction:**
```typescript
// Library Staff: May be restricted to specific library
if (userType === 'library_staff' && user.library_id) {
  query += ` AND library_id = $2`;
}
```

#### **3. Permission Checking:**
```typescript
// Check role permissions
const hasPermission = (user, resource, action) => {
  if (user.role === 'super_admin') return true;
  
  if (user.userType === 'library_owner') {
    return true; // Full access to their tenant
  }
  
  // Check role_permissions table
  return checkRolePermission(user.role, user.userType, resource, action);
};
```

---

## 📊 **Database Architecture**

### **Core Database** (`studyspot_core`)
Platform-level data shared across tenants:

- `tenants` - All tenants
- `library_owners` - Library business owners (one per tenant)
- `platform_admins` - Platform super admins
- `platform_staff` - Platform staff
- `subscriptions` - Tenant subscriptions
- `credits` - SMS/Email credits
- `audit_logs` - Platform audit logs
- `refresh_tokens` - JWT refresh tokens

### **Tenant Database** (Per tenant, `studyspot_tenant_{id}`)
Tenant-specific data:

- `students` - Students of this tenant
- `library_staff` - Staff of this tenant
- `libraries` - Libraries of this tenant
- `bookings` - Bookings for this tenant
- `payments` - Payments for this tenant
- `seats` - Seats in libraries
- `attendance` - Attendance records

---

## 🔄 **Authentication Flow**

### **Login Process:**

1. **User submits credentials** (email + password)
2. **Auth Service determines user table:**
   ```typescript
   // Try in order:
   1. library_owners (for Web Owner Portal)
   2. platform_admins (for Web Admin Portal - super admin)
   3. platform_staff (for Web Admin Portal - staff)
   4. library_staff (for Web Owner Portal - staff)
   5. students (for Student Portal)
   ```
3. **Verify password** (bcrypt compare)
4. **Check user is active**
5. **Generate JWT tokens:**
   - Access token (15 min expiry)
   - Refresh token (7 day expiry)
6. **Store refresh token** in database
7. **Create audit log** entry
8. **Return tokens** with user info

### **Token Verification:**

1. **Extract token** from `Authorization: Bearer <token>` header
2. **Verify signature** using JWT_SECRET
3. **Check expiration**
4. **Load user** from appropriate table (`userTable` from token)
5. **Verify user is active**
6. **Attach user to request** (`req.user`)
7. **Set tenant context** (if applicable)

---

## 🛡️ **Security Features**

### **1. Multi-Table Authentication:**
- Different tables for different user types
- Prevents cross-table access
- Clear separation of concerns

### **2. Tenant Isolation:**
- Library owners/staff can only access their tenant
- Platform admins/staff can access all tenants
- Students can only access their tenant data

### **3. Role-Based Permissions:**
- Permissions stored in `role_permissions` table
- Granular resource-action permissions
- Role hierarchy support

### **4. Audit Logging:**
- All authentication events logged
- User actions tracked with `user_type`
- IP address and user agent recorded

---

## 📝 **Code Examples**

### **Login as Library Owner:**
```typescript
// POST /api/auth/owner/login
const login = async (email, password) => {
  // Find in library_owners table
  const user = await db.query(
    'SELECT * FROM library_owners WHERE email = $1',
    [email]
  );
  
  // Verify password
  const isValid = await bcrypt.compare(password, user.password_hash);
  
  // Generate token with userTable: 'library_owners'
  const token = generateToken({
    userId: user.id,
    userTable: 'library_owners',
    userType: 'library_owner',
    role: 'library_owner',
    tenantId: user.tenant_id
  });
  
  return { token, user };
};
```

### **Check Permissions:**
```typescript
// Middleware: requirePermission
const requirePermission = (resource, action) => {
  return async (req, res, next) => {
    const { user } = req;
    
    // Super admin has all permissions
    if (user.role === 'super_admin') return next();
    
    // Library owner has full access to their tenant
    if (user.userType === 'library_owner') {
      if (resource.startsWith('tenant:') && req.params.tenantId === user.tenantId) {
        return next();
      }
    }
    
    // Check role_permissions table
    const hasPermission = await checkPermission(
      user.role,
      user.userType,
      resource,
      action
    );
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    next();
  };
};
```

---

## 🎯 **Summary**

| User Type | Portal | Table | Tenant ID | Library ID | Access Scope |
|-----------|--------|-------|-----------|------------|--------------|
| **Student** | Student Portal | `students` (tenant DB) | ✅ Required | ❌ None | Own tenant, view libraries |
| **Library Owner** | Web Owner Portal | `library_owners` (core DB) | ✅ Required (1:1) | ❌ None | Full access to own tenant |
| **Library Staff** | Web Owner Portal | `library_staff` (tenant DB) | ✅ Required | ✅ Optional | Limited access, tenant/library scoped |
| **Platform Super Admin** | Web Admin Portal | `platform_admins` (core DB) | ❌ NULL | ❌ NULL | Full platform access |
| **Platform Staff** | Web Admin Portal | `platform_staff` (core DB) | ❌ NULL | ❌ NULL | Role-based platform access |

---

**Last Updated:** 2025-01-02  
**Status:** ✅ Production Ready

