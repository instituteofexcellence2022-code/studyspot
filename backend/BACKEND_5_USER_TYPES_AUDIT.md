# 🔍 Backend Implementation Audit - 5 User Types

## Executive Summary

**Status:** ⚠️ **PARTIALLY IMPLEMENTED** - Needs Professional Enhancement

**Implementation Coverage:**
- ✅ **Library Owner:** Fully implemented
- ✅ **Platform Super Admin:** Fully implemented  
- ✅ **Platform Staff:** Fully implemented
- ⚠️ **Library Staff:** Partially implemented (structure exists, login incomplete)
- ❌ **Student:** Incomplete (legacy endpoint, no tenant DB query)

---

## ✅ **What's Working Well**

### 1. **User Type Mapping Functions** ✅
**Location:** `backend/src/services/auth-service/index.ts:138-161`

```typescript
const getUserTypeFromTable = (userTable: string): string => {
  const mapping: Record<string, string> = {
    'library_owners': 'library_owner',
    'platform_admins': 'platform_admin',
    'platform_staff': 'platform_staff',
    'library_staff': 'library_staff',
    'students': 'student'
  };
  return mapping[userTable] || 'unknown';
};
```

✅ **Status:** All 5 user types properly mapped.

---

### 2. **JWT Token Generation** ✅
**Location:** `backend/src/services/auth-service/index.ts:184-228`

```typescript
const generateAccessToken = (user: any, userTable: string) => {
  const userType = getUserTypeFromTable(userTable);
  const payload = {
    userId: user.id,
    email: user.email,
    roles,
    userType,
    user_type: userType,
    userTable,  // ✅ Includes table name
    tenantId,
    tenant_id: tenantId,
    permissions: user.permissions ?? [],
  };
  // ...
};
```

✅ **Status:** Tokens include all necessary fields for all user types.

---

### 3. **Login Endpoint - Core Users** ✅
**Location:** `backend/src/services/auth-service/index.ts:650-710`

**What Works:**
- ✅ Library Owners: Queries `library_owners` table (core DB)
- ✅ Platform Admins: Queries `platform_admins` table (core DB)
- ✅ Platform Staff: Queries `platform_staff` table (core DB)
- ✅ Fallback to `admin_users` for backward compatibility

**Implementation:**
```typescript
// 1. Try library_owners
const libraryOwnerResult = await coreDb.query(
  'SELECT * FROM library_owners WHERE email = $1',
  [email.toLowerCase()]
);

// 2. Try platform_admins
const platformAdminResult = await coreDb.query(
  'SELECT * FROM platform_admins WHERE email = $1',
  [email.toLowerCase()]
);

// 3. Try platform_staff
const platformStaffResult = await coreDb.query(
  'SELECT * FROM platform_staff WHERE email = $1',
  [email.toLowerCase()]
);
```

✅ **Status:** Core DB users fully implemented.

---

### 4. **Authentication Middleware** ✅
**Location:** `backend/src/middleware/auth.ts`

**Features:**
- ✅ Extracts `userType`, `userTable`, `tenantId` from JWT
- ✅ Supports optional authentication
- ✅ Role-based authorization (`requireRole`)
- ✅ Permission-based authorization (`requirePermission`)

✅ **Status:** Middleware properly handles all user types.

---

### 5. **Security Middleware** ✅
**Location:** `backend/src/middleware/security.ts`

**Features:**
- ✅ `requireAdmin()` - Checks platform admin/staff
- ✅ `requireSuperAdmin()` - Checks super admin only
- ✅ `validateTenantAccess()` - Validates tenant isolation
- ✅ Proper separation of platform vs library users

✅ **Status:** Security checks properly distinguish user types.

---

## ⚠️ **Issues & Missing Implementation**

### 1. **Portal-Specific Login Routing - Missing** 🔴 CRITICAL
**Problem:** All portals use same endpoint `/api/auth/login` but it doesn't handle tenant DB users

**Current Endpoint Usage:**
- **Student Portal:** `/api/auth/login` - Should handle STUDENTS (tenant DB) ❌
- **Owner Portal:** `/api/auth/login` - Should handle LIBRARY OWNERS (core DB) ✅ + LIBRARY STAFF (tenant DB) ❌  
- **Admin Portal:** `/api/v1/auth/admin/login` - Handles PLATFORM ADMINS/STAFF (core DB) ✅

**Missing Logic:**
- `/api/auth/login` doesn't check tenant databases at all
- No differentiation between student vs owner portal requests
- No tenant_id parameter handling for tenant DB users

---

### 2. **Student Login - Incomplete** ❌
**Location:** `backend/src/services/auth-service/index.ts:642-842` (main login) + `2599-2672` (legacy student login)

**Current Implementation:**
```typescript
// Main /api/auth/login endpoint (line 642)
// ❌ ONLY checks core DB tables:
// 1. library_owners ✅
// 2. platform_admins ✅  
// 3. platform_staff ✅
// 4. admin_users (fallback) ✅
// ❌ MISSING: students table check in tenant DB

// Legacy /api/v1/auth/student/login (line 2599)
// ❌ WRONG: Queries admin_users instead of students table
const result = await coreDb.query(
  'SELECT * FROM admin_users WHERE email = $1',
  [email.toLowerCase()]
);
```

**Problems:**
1. ❌ Main login doesn't check `students` table in tenant DB
2. ❌ Legacy student login queries wrong table (`admin_users`)
3. ❌ Students are in **tenant databases**, not core database
4. ❌ No tenant context resolution (how do we know which tenant's student?)
5. ❌ No actual tenant database query for students

**Required:** Student Portal should call `/api/auth/login` with `tenantId` + `userType: 'student'`

**Required Fix:**
```typescript
// ✅ CORRECT: Should query tenant database
fastify.post('/api/auth/student/login', async (request, reply) => {
  const { email, password, tenantId } = request.body;
  
  // Validate tenant_id required
  if (!tenantId) {
    return reply.status(400).send({
      error: 'Tenant ID required for student login'
    });
  }
  
  // Get tenant database connection
  const tenantDb = await tenantDbManager.getTenantConnection(tenantId);
  
  // Query students table in tenant database
  const result = await tenantDb.query(
    'SELECT * FROM students WHERE email = $1 AND tenant_id = $2 AND deleted_at IS NULL',
    [email.toLowerCase(), tenantId]
  );
  
  // Verify password and generate tokens...
});
```

---

### 3. **Library Staff Login - Missing** ❌
**Location:** `backend/src/services/auth-service/index.ts:642-842` (main login)

**Current Implementation:**
```typescript
// Main /api/auth/login endpoint (line 642)
// ❌ ONLY checks core DB tables:
// 1. library_owners ✅ (for Owner Portal - library owners)
// 2. platform_admins ✅
// 3. platform_staff ✅
// ❌ MISSING: library_staff table check in tenant DB

// Owner Portal calls /api/auth/login
// Should handle BOTH library_owners AND library_staff
// Currently only handles library_owners
```

**Problems:**
1. ❌ Login endpoint only checks core DB tables
2. ❌ Library staff are in **tenant databases** (library_staff table), not core database
3. ❌ No tenant context resolution for library staff
4. ❌ Owner Portal cannot login library staff users

**Required:** Owner Portal should call `/api/auth/login` with `tenantId` + `userType: 'library_staff'` (or auto-detect if library_owner not found)

**Required Fix:**
```typescript
// ✅ Add to main login or create separate endpoint
// Option 1: Add tenant_id parameter to main login
fastify.post('/api/auth/login', async (request, reply) => {
  const { email, password, tenantId, userType } = request.body;
  
  // ... existing core DB checks ...
  
  // 4. Try library_staff (if tenantId provided)
  if (tenantId && (userType === 'library_staff' || !userType)) {
    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);
    const libraryStaffResult = await tenantDb.query(
      'SELECT * FROM library_staff WHERE email = $1 AND tenant_id = $2',
      [email.toLowerCase(), tenantId]
    );
    
    if (libraryStaffResult.rows.length > 0) {
      user = libraryStaffResult.rows[0];
      userTable = 'library_staff';
    }
  }
  
  // 5. Try students (if tenantId provided)
  if (tenantId && (userType === 'student' || !userType)) {
    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);
    const studentResult = await tenantDb.query(
      'SELECT * FROM students WHERE email = $1 AND tenant_id = $2 AND deleted_at IS NULL',
      [email.toLowerCase(), tenantId]
    );
    
    if (studentResult.rows.length > 0) {
      user = studentResult.rows[0];
      userTable = 'students';
    }
  }
});
```

---

### 3. **Profile/Me Endpoints - Incomplete** ⚠️
**Location:** `backend/src/services/auth-service/index.ts:1140-1167`

**Current Implementation:**
```typescript
switch (userTable) {
  case 'library_owners':
    result = await coreDb.query('SELECT * FROM library_owners WHERE id = $1', [decoded.userId]);
    break;
  case 'platform_admins':
    result = await coreDb.query('SELECT * FROM platform_admins WHERE id = $1', [decoded.userId]);
    break;
  case 'platform_staff':
    result = await coreDb.query('SELECT * FROM platform_staff WHERE id = $1', [decoded.userId]);
    break;
  default:
    result = await coreDb.query('SELECT * FROM admin_users WHERE id = $1', [decoded.userId]);
}
```

**Missing:**
- ❌ No case for `'library_staff'` - would fall through to default (wrong table)
- ❌ No case for `'students'` - would fall through to default (wrong table)
- ❌ No tenant database connection for tenant-scoped users

**Required Fix:**
```typescript
switch (userTable) {
  case 'library_owners':
    result = await coreDb.query('SELECT * FROM library_owners WHERE id = $1', [decoded.userId]);
    break;
  case 'platform_admins':
    result = await coreDb.query('SELECT * FROM platform_admins WHERE id = $1', [decoded.userId]);
    break;
  case 'platform_staff':
    result = await coreDb.query('SELECT * FROM platform_staff WHERE id = $1', [decoded.userId]);
    break;
  case 'library_staff':
    // ✅ FIX: Query tenant database
    if (!decoded.tenantId) {
      throw new Error('Tenant ID required for library staff');
    }
    const tenantDb = await tenantDbManager.getTenantConnection(decoded.tenantId);
    result = await tenantDb.query(
      'SELECT * FROM library_staff WHERE id = $1 AND tenant_id = $2',
      [decoded.userId, decoded.tenantId]
    );
    break;
  case 'students':
    // ✅ FIX: Query tenant database
    if (!decoded.tenantId) {
      throw new Error('Tenant ID required for students');
    }
    const tenantDb = await tenantDbManager.getTenantConnection(decoded.tenantId);
    result = await tenantDb.query(
      'SELECT * FROM students WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL',
      [decoded.userId, decoded.tenantId]
    );
    break;
  default:
    // Legacy fallback
    result = await coreDb.query('SELECT * FROM admin_users WHERE id = $1', [decoded.userId]);
}
```

---

### 4. **Refresh Token Endpoint - Incomplete** ⚠️
**Location:** `backend/src/services/auth-service/index.ts:2788-2802`

**Current Implementation:**
```typescript
switch (userTable) {
  case 'library_owners':
    userResult = await coreDb.query('SELECT * FROM library_owners WHERE id = $1 AND is_active = true', [decoded.userId]);
    break;
  case 'platform_admins':
    userResult = await coreDb.query('SELECT * FROM platform_admins WHERE id = $1 AND is_active = true', [decoded.userId]);
    break;
  case 'platform_staff':
    userResult = await coreDb.query('SELECT * FROM platform_staff WHERE id = $1 AND is_active = true', [decoded.userId]);
    break;
  default:
    userResult = await coreDb.query('SELECT * FROM admin_users WHERE id = $1 AND is_active = true', [decoded.userId]);
}
```

**Missing:**
- ❌ No cases for `'library_staff'` and `'students'`
- ❌ Would fall through to default (wrong table)

**Required Fix:** Same as Profile endpoint - add cases for tenant database users.

---

### 5. **Update Profile Endpoint - Incomplete** ⚠️
**Location:** `backend/src/services/auth-service/index.ts:1275-1520`

**Current Implementation:**
- Only handles `library_owners`, `platform_admins`, `platform_staff`
- Missing `library_staff` and `students` cases

**Required Fix:** Add tenant database update queries for library staff and students.

---

## 📋 **Implementation Checklist**

### **High Priority** 🔴

- [ ] **Implement Portal-Specific Login Logic**
  - [ ] Update `/api/auth/login` to handle tenant DB users
  - [ ] Accept `tenantId` and `userType` parameters
  - [ ] Add tenant database queries for students and library_staff
  - [ ] Differentiate between student portal vs owner portal requests
  - [ ] Flow: Check core DB first (library_owners, platform_admins, platform_staff), then tenant DB if tenantId provided

- [ ] **Fix Student Login for Student Portal**
  - [ ] Add students table check in tenant DB (in main `/api/auth/login`)
  - [ ] Require `tenantId` parameter for student login
  - [ ] Query tenant database: `SELECT * FROM students WHERE email = $1 AND tenant_id = $2`
  - [ ] Remove or fix legacy `/api/v1/auth/student/login` endpoint
  - [ ] Test Student Portal login flow

- [ ] **Fix Library Staff Login for Owner Portal**
  - [ ] Add library_staff check in tenant DB (in main `/api/auth/login`)
  - [ ] After checking library_owners (core DB), check library_staff (tenant DB) if tenantId provided
  - [ ] Query tenant database: `SELECT * FROM library_staff WHERE email = $1 AND tenant_id = $2`
  - [ ] Auto-detect logic: If library_owner not found but tenantId provided, try library_staff
  - [ ] Test Owner Portal login for both library owners and staff

- [ ] **Fix Profile/Me Endpoint**
  - [ ] Add `library_staff` case (tenant DB query)
  - [ ] Add `students` case (tenant DB query)
  - [ ] Add tenant context validation

- [ ] **Fix Refresh Token Endpoint**
  - [ ] Add `library_staff` case (tenant DB query)
  - [ ] Add `students` case (tenant DB query)
  - [ ] Add tenant context validation

### **Medium Priority** 🟡

- [ ] **Fix Update Profile Endpoint**
  - [ ] Add `library_staff` update case
  - [ ] Add `students` update case
  - [ ] Add tenant context validation

- [ ] **Enhance Error Messages**
  - [ ] Better error for missing tenant_id
  - [ ] Better error for wrong tenant access
  - [ ] Better error for inactive tenant

- [ ] **Add Tenant Context Middleware**
  - [ ] Automatically load tenant DB connection
  - [ ] Validate tenant access before querying

### **Low Priority** 🟢

- [ ] **Add Unit Tests**
  - [ ] Test student login flow
  - [ ] Test library staff login flow
  - [ ] Test tenant isolation

- [ ] **Add Integration Tests**
  - [ ] End-to-end login for all 5 user types
  - [ ] Cross-tenant access prevention tests

---

## 🔧 **Recommended Implementation Pattern**

### **Helper Function for Tenant User Queries**

```typescript
/**
 * Get user from tenant database (for students and library_staff)
 */
async function getUserFromTenantDb(
  userTable: 'students' | 'library_staff',
  identifier: { email?: string; id?: string },
  tenantId: string
): Promise<any | null> {
  if (!tenantId) {
    throw new Error(`Tenant ID required for ${userTable}`);
  }
  
  const tenantDb = await tenantDbManager.getTenantConnection(tenantId);
  
  if (identifier.email) {
    const result = await tenantDb.query(
      `SELECT * FROM ${userTable} 
       WHERE email = $1 AND tenant_id = $2 
       AND deleted_at IS NULL`,
      [identifier.email.toLowerCase(), tenantId]
    );
    return result.rows[0] || null;
  }
  
  if (identifier.id) {
    const result = await tenantDb.query(
      `SELECT * FROM ${userTable} 
       WHERE id = $1 AND tenant_id = $2 
       AND deleted_at IS NULL`,
      [identifier.id, tenantId]
    );
    return result.rows[0] || null;
  }
  
  return null;
}
```

### **Updated Login Flow for All Portals**

```typescript
fastify.post('/api/auth/login', async (request, reply) => {
  const { email, password, tenantId, userType, portalType } = request.body;
  
  let user: any = null;
  let userTable: string = '';
  
  // ============================================
  // STEP 1: Check Core Database (for core DB users)
  // ============================================
  
  // 1. Try library_owners (Owner Portal - library owners)
  if (!userType || userType === 'library_owner' || portalType === 'owner') {
    const libraryOwnerResult = await coreDb.query(
      'SELECT * FROM library_owners WHERE email = $1',
      [email.toLowerCase()]
    );
    if (libraryOwnerResult.rows.length > 0) {
      user = libraryOwnerResult.rows[0];
      userTable = 'library_owners';
    }
  }
  
  // 2. Try platform_admins (Admin Portal)
  if (!user && (!userType || userType === 'platform_admin' || portalType === 'admin')) {
    const platformAdminResult = await coreDb.query(
      'SELECT * FROM platform_admins WHERE email = $1',
      [email.toLowerCase()]
    );
    if (platformAdminResult.rows.length > 0) {
      user = platformAdminResult.rows[0];
      userTable = 'platform_admins';
    }
  }
  
  // 3. Try platform_staff (Admin Portal)
  if (!user && (!userType || userType === 'platform_staff' || portalType === 'admin')) {
    const platformStaffResult = await coreDb.query(
      'SELECT * FROM platform_staff WHERE email = $1',
      [email.toLowerCase()]
    );
    if (platformStaffResult.rows.length > 0) {
      user = platformStaffResult.rows[0];
      userTable = 'platform_staff';
    }
  }
  
  // ============================================
  // STEP 2: Check Tenant Database (for tenant DB users)
  // ============================================
  
  if (!user && tenantId) {
    // Get tenant database connection
    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);
    
    // 4. Try library_staff (Owner Portal - library staff)
    if (!user && (!userType || userType === 'library_staff' || portalType === 'owner')) {
      const libraryStaffResult = await tenantDb.query(
        'SELECT * FROM library_staff WHERE email = $1 AND tenant_id = $2',
        [email.toLowerCase(), tenantId]
      );
      if (libraryStaffResult.rows.length > 0) {
        user = libraryStaffResult.rows[0];
        userTable = 'library_staff';
      }
    }
    
    // 5. Try students (Student Portal)
    if (!user && (!userType || userType === 'student' || portalType === 'student')) {
      const studentResult = await tenantDb.query(
        'SELECT * FROM students WHERE email = $1 AND tenant_id = $2 AND deleted_at IS NULL',
        [email.toLowerCase(), tenantId]
      );
      if (studentResult.rows.length > 0) {
        user = studentResult.rows[0];
        userTable = 'students';
      }
    }
  }
  
  // ============================================
  // STEP 3: Fallback to admin_users (backward compatibility)
  // ============================================
  
  if (!user) {
    const adminUserResult = await coreDb.query(
      'SELECT * FROM admin_users WHERE email = $1',
      [email.toLowerCase()]
    );
    if (adminUserResult.rows.length > 0) {
      user = adminUserResult.rows[0];
      userTable = user.tenant_id ? 'library_owners' : 
                 (user.role === 'super_admin' ? 'platform_admins' : 'platform_staff');
    }
  }
  
  if (!user) {
    return reply.status(401).send({
      error: 'Invalid credentials'
    });
  }
  
  // Verify password and generate tokens...
});
```

### **Portal-Specific Login Requirements**

#### **Student Portal:**
```typescript
// Frontend should send:
POST /api/auth/login
{
  email: "student@example.com",
  password: "password123",
  tenantId: "tenant-uuid",  // Required for students
  userType: "student",       // Optional but recommended
  portalType: "student"      // Optional but recommended
}
```

#### **Owner Portal (Library Owner):**
```typescript
// Frontend should send:
POST /api/auth/login
{
  email: "owner@library.com",
  password: "password123",
  // tenantId not needed (inferred from library_owners.tenant_id)
  userType: "library_owner",  // Optional
  portalType: "owner"         // Optional
}
```

#### **Owner Portal (Library Staff):**
```typescript
// Frontend should send:
POST /api/auth/login
{
  email: "staff@library.com",
  password: "password123",
  tenantId: "tenant-uuid",     // Required for library staff
  userType: "library_staff",   // Optional
  portalType: "owner"          // Required to know it's owner portal
}
```

#### **Admin Portal:**
```typescript
// Frontend should send:
POST /api/v1/auth/admin/login  // Different endpoint
{
  email: "admin@studyspot.com",
  password: "password123",
  // Only checks platform_admins and platform_staff
}
```

---

## 📊 **Current Status Summary**

| User Type | Portal | Login Endpoint | Login Status | Profile | Refresh Token | Update Profile | Status |
|-----------|--------|----------------|--------------|---------|---------------|----------------|--------|
| **Student** | Student Portal | `/api/auth/login` + `tenantId` | ❌ **Missing** | ❌ | ❌ | ❌ | **Incomplete** |
| **Library Owner** | Owner Portal | `/api/auth/login` | ✅ **Working** | ✅ | ✅ | ✅ | **Complete** |
| **Library Staff** | Owner Portal | `/api/auth/login` + `tenantId` | ❌ **Missing** | ❌ | ❌ | ❌ | **Missing** |
| **Platform Super Admin** | Admin Portal | `/api/v1/auth/admin/login` | ✅ **Working** | ✅ | ✅ | ✅ | **Complete** |
| **Platform Staff** | Admin Portal | `/api/v1/auth/admin/login` | ✅ **Working** | ✅ | ✅ | ✅ | **Complete** |

**Key Issues:**
- ❌ **Student Portal** login doesn't query tenant DB `students` table
- ❌ **Owner Portal** login doesn't query tenant DB `library_staff` table  
- ✅ **Admin Portal** login works correctly (only needs core DB)

---

## 🎯 **Priority Actions**

1. **Immediate:** Fix student and library staff login endpoints
2. **High:** Fix profile/refresh token endpoints for tenant users
3. **Medium:** Add comprehensive error handling
4. **Low:** Add tests and documentation

---

**Last Updated:** 2025-01-02  
**Audit Status:** ⚠️ Needs Implementation  
**Next Review:** After fixes implemented

