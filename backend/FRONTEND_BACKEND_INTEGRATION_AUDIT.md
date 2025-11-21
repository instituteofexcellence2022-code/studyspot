# ⚠️ Frontend-Backend Integration Audit

**Date:** 2025-01-02  
**Status:** ⚠️ **NEEDS FIXES** - Missing Required Parameters

---

## 🔍 **Current Frontend Implementation**

### **1. Owner Portal (web-owner)** ⚠️
**Location:** `web-owner/src/services/authService.ts`  
**Status:** ⚠️ **MISSING PARAMETERS**

**Current Implementation:**
```typescript
// Line 37: Only sends email and password
const response = await authClient.login({ email, password });
```

**Issues:**
- ❌ **MISSING:** `tenantId` parameter (required for library staff login)
- ❌ **MISSING:** `userType` parameter (should be 'library_owner' or 'library_staff')
- ❌ **MISSING:** `portalType` parameter (should be 'owner')

**Backend Expects:**
```typescript
// For Library Owner:
POST /api/auth/login
{
  email: "owner@library.com",
  password: "password123"
  // tenantId NOT needed (inferred from library_owners.tenant_id)
  // userType optional but recommended: 'library_owner'
  // portalType optional but recommended: 'owner'
}

// For Library Staff:
POST /api/auth/login
{
  email: "staff@library.com",
  password: "password123",
  tenantId: "tenant-uuid",  // REQUIRED for library staff
  userType: "library_staff", // Recommended
  portalType: "owner"        // Recommended
}
```

---

### **2. Admin Portal (web-admin-new)** ⚠️
**Location:** `web-admin-new/frontend/src/services/authService.ts`  
**Status:** ⚠️ **WRONG ENDPOINT**

**Current Implementation:**
```typescript
// Line 49: Uses universal login endpoint
const response = await authClient.login({
  email: credentials.email,
  password: credentials.password,
});
```

**SDK Configuration:**
```typescript
// web-admin-new/frontend/src/services/sdk.ts:16
loginPath: '/api/auth/login',  // ❌ WRONG - Should use admin endpoint
```

**Issues:**
- ❌ **WRONG ENDPOINT:** Using `/api/auth/login` instead of `/api/v1/auth/admin/login`
- ❌ **MISSING:** `userType` parameter (should be 'platform_admin' or 'platform_staff')
- ❌ **MISSING:** `portalType` parameter (should be 'admin')

**Backend Expects:**
```typescript
// For Platform Admin/Staff:
POST /api/v1/auth/admin/login  // Different endpoint!
{
  email: "admin@studyspot.com",
  password: "password123"
  // No tenantId needed (platform users have no tenant)
  // userType optional: 'platform_admin' or 'platform_staff'
  // portalType optional: 'admin'
}
```

---

### **3. Student Portal** ❓
**Location:** Need to verify  
**Status:** ❓ **UNKNOWN** - Need to check implementation

**Expected Implementation:**
```typescript
// For Students:
POST /api/auth/login
{
  email: "student@example.com",
  password: "password123",
  tenantId: "tenant-uuid",  // REQUIRED for students
  userType: "student",      // Recommended
  portalType: "student"     // Recommended
}
```

---

## ⚠️ **Critical Issues Found**

### **Issue 1: SDK Doesn't Pass tenantId/userType/portalType** 🔴

**Location:** `packages/studyspot-tenant-sdk/src/auth.ts:29-41`

**Current Code:**
```typescript
async login(credentials: Credentials): Promise<LoginResponse> {
  // credentials only has { email, password }
  const rawResponse = await this.request<any>(
    provider.loginPath ?? DEFAULT_ENDPOINTS.login,
    credentials  // ❌ Only sends email and password
  );
}
```

**Problem:**
- SDK only accepts `{ email, password }` in credentials
- Doesn't accept or forward `tenantId`, `userType`, or `portalType`
- Backend won't know which portal or user type is logging in

---

### **Issue 2: Owner Portal Doesn't Pass tenantId for Library Staff** 🔴

**Problem:**
- Library owners can login without `tenantId` (it's in their record)
- Library staff **REQUIRE** `tenantId` (they're in tenant DB)
- Frontend doesn't distinguish between owner and staff login
- Library staff login will fail if `tenantId` not provided

**Solution Needed:**
- Frontend needs to detect if login is for library staff
- Frontend needs to get/send `tenantId` for library staff login
- Could use a dropdown/selector or detect from email domain

---

### **Issue 3: Admin Portal Uses Wrong Endpoint** 🔴

**Problem:**
- Admin portal uses universal `/api/auth/login` endpoint
- Should use dedicated `/api/v1/auth/admin/login` endpoint
- Backend has separate admin login endpoint for platform users

**Solution Needed:**
- Change SDK loginPath to `/api/v1/auth/admin/login` for admin portal
- Or update backend universal endpoint to handle admin portal better

---

### **Issue 4: Student Portal Missing tenantId** ❓

**Problem:**
- Students **REQUIRE** `tenantId` (they're in tenant DB)
- Need to verify if student portal passes `tenantId`
- If not, student login will fail

**Solution Needed:**
- Student portal must pass `tenantId` in login request
- Student portal should get `tenantId` from:
  - URL slug (e.g., `library-slug.studyspot.com`)
  - Local storage
  - Configuration
  - User input (if multiple tenants)

---

## ✅ **Required Frontend Fixes**

### **Fix 1: Update SDK to Accept Additional Parameters** 🔴

**File:** `packages/studyspot-tenant-sdk/src/types.ts`

**Current:**
```typescript
export interface Credentials {
  email: string;
  password: string;
}
```

**Should Be:**
```typescript
export interface Credentials {
  email: string;
  password: string;
  tenantId?: string;      // Optional for tenant DB users
  userType?: string;      // Optional: 'student', 'library_owner', 'library_staff', 'platform_admin', 'platform_staff'
  portalType?: string;    // Optional: 'student', 'owner', 'admin'
}
```

---

### **Fix 2: Update SDK Login Method** 🔴

**File:** `packages/studyspot-tenant-sdk/src/auth.ts:29`

**Current:**
```typescript
async login(credentials: Credentials): Promise<LoginResponse> {
  const rawResponse = await this.request<any>(
    provider.loginPath ?? DEFAULT_ENDPOINTS.login,
    credentials  // Only email and password
  );
}
```

**Should Be:**
```typescript
async login(credentials: Credentials): Promise<LoginResponse> {
  // Send all credentials including tenantId, userType, portalType
  const rawResponse = await this.request<any>(
    provider.loginPath ?? DEFAULT_ENDPOINTS.login,
    credentials  // Now includes tenantId, userType, portalType
  );
}
```

---

### **Fix 3: Update Owner Portal Login** 🔴

**File:** `web-owner/src/services/authService.ts:30`

**Current:**
```typescript
async login(email: string, password: string): Promise<AuthResponse> {
  const response = await authClient.login({ email, password });
}
```

**Should Be:**
```typescript
async login(
  email: string, 
  password: string, 
  tenantId?: string,      // Required for library staff
  userType?: 'library_owner' | 'library_staff'
): Promise<AuthResponse> {
  const response = await authClient.login({
    email,
    password,
    tenantId,             // Pass tenantId for library staff
    userType,             // Pass userType to distinguish owner vs staff
    portalType: 'owner',  // Always 'owner' for owner portal
  });
}
```

---

### **Fix 4: Update Admin Portal SDK Configuration** 🔴

**File:** `web-admin-new/frontend/src/services/sdk.ts:16`

**Current:**
```typescript
const authConfig: AuthProviderConfig = {
  baseUrl: baseAuthUrl,
  loginPath: '/api/auth/login',  // ❌ Wrong endpoint
  // ...
};
```

**Should Be:**
```typescript
const authConfig: AuthProviderConfig = {
  baseUrl: baseAuthUrl,
  loginPath: '/api/v1/auth/admin/login',  // ✅ Correct admin endpoint
  // ...
};
```

**Or update login call:**
```typescript
async login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await authClient.login({
    email: credentials.email,
    password: credentials.password,
    userType: 'platform_admin',  // or 'platform_staff'
    portalType: 'admin',
  });
}
```

---

### **Fix 5: Update Student Portal Login** ❓

**File:** Need to find student portal auth service

**Should Be:**
```typescript
async login(
  email: string, 
  password: string, 
  tenantId: string  // REQUIRED for students
): Promise<AuthResponse> {
  const response = await authClient.login({
    email,
    password,
    tenantId,           // REQUIRED - students are in tenant DB
    userType: 'student',
    portalType: 'student',
  });
}
```

---

## 📋 **Integration Checklist**

### **Owner Portal (web-owner)** ⚠️
- [ ] Update SDK to accept `tenantId`, `userType`, `portalType`
- [ ] Update `authService.login()` to accept and pass `tenantId` (for library staff)
- [ ] Add UI to select user type (library owner vs library staff)
- [ ] Get `tenantId` from user's library association (for library staff)
- [ ] Pass `portalType: 'owner'` in login request

### **Admin Portal (web-admin-new)** ⚠️
- [ ] Change loginPath to `/api/v1/auth/admin/login` OR
- [ ] Pass `portalType: 'admin'` and `userType: 'platform_admin'/'platform_staff'` in login request
- [ ] Verify admin login works correctly

### **Student Portal** ❓
- [ ] Verify student portal exists and location
- [ ] Check if student portal passes `tenantId` in login
- [ ] If not, update student portal to pass `tenantId` (REQUIRED)
- [ ] Pass `userType: 'student'` and `portalType: 'student'` in login request
- [ ] Get `tenantId` from:
  - URL slug/domain
  - Configuration
  - User input

### **SDK Updates** 🔴
- [ ] Update `Credentials` interface to include `tenantId`, `userType`, `portalType`
- [ ] Update `login()` method to forward all credentials
- [ ] Test SDK with all parameter combinations

---

## 🎯 **Recommended Implementation Pattern**

### **Owner Portal Login Flow:**

```typescript
// Owner Portal - Login Page
const handleLogin = async (email: string, password: string, userType: 'library_owner' | 'library_staff') => {
  let tenantId: string | undefined;
  
  // If library staff, get tenantId from user's library or input
  if (userType === 'library_staff') {
    tenantId = getTenantIdFromUserLibrary(email); // Or from form input
    if (!tenantId) {
      throw new Error('Tenant ID required for library staff');
    }
  }
  
  // For library owners, tenantId not needed (inferred from library_owners table)
  const response = await authService.login(email, password, tenantId, userType);
};
```

### **Student Portal Login Flow:**

```typescript
// Student Portal - Login Page
const handleLogin = async (email: string, password: string) => {
  // Get tenantId from:
  // 1. URL slug (e.g., library-slug.studyspot.com)
  // 2. Configuration
  // 3. Local storage
  // 4. User input (if multiple tenants)
  
  const tenantId = getTenantIdFromUrl() || 
                   getTenantIdFromConfig() || 
                   getTenantIdFromStorage() ||
                   promptForTenantId(); // If multiple tenants
  
  if (!tenantId) {
    throw new Error('Tenant ID required for student login');
  }
  
  const response = await authService.login(email, password, tenantId);
};
```

### **Admin Portal Login Flow:**

```typescript
// Admin Portal - Login Page
const handleLogin = async (email: string, password: string) => {
  // Admin portal uses dedicated endpoint or passes portalType
  const response = await authService.login(email, password);
  
  // Backend will automatically check platform_admins and platform_staff tables
  // No tenantId needed
};
```

---

## 🔧 **Backend Compatibility**

### **Current Backend Status:** ✅ **READY**

The backend is already ready to accept:
- ✅ `tenantId` parameter (optional, required for students/library_staff)
- ✅ `userType` parameter (optional, helps with routing)
- ✅ `portalType` parameter (optional, helps with routing)

**Backend Implementation:**
- ✅ Universal endpoint `/api/auth/login` checks all user types
- ✅ Admin endpoint `/api/v1/auth/admin/login` checks platform users only
- ✅ Both endpoints work correctly

**Frontend Needs:**
- ⚠️ Pass `tenantId` for students and library staff
- ⚠️ Pass `userType` for better routing (optional but recommended)
- ⚠️ Pass `portalType` for better routing (optional but recommended)
- ⚠️ Use correct endpoint for admin portal

---

## 📝 **Summary**

### **Current Status:** ⚠️ **PARTIALLY INTEGRATED**

**What's Working:**
- ✅ Backend properly handles all 5 user types
- ✅ Backend endpoints are correctly implemented
- ✅ Frontend SDK is calling backend endpoints
- ✅ Frontend receives and stores tokens correctly

**What's Missing:**
- ❌ Frontend SDK doesn't accept/pass `tenantId`, `userType`, `portalType`
- ❌ Owner Portal doesn't pass `tenantId` for library staff login
- ❌ Admin Portal uses wrong endpoint (should use `/api/v1/auth/admin/login`)
- ❌ Student Portal integration status unknown (needs verification)

**Priority Fixes:**
1. 🔴 **HIGH:** Update SDK to accept and pass `tenantId`, `userType`, `portalType`
2. 🔴 **HIGH:** Update Owner Portal to pass `tenantId` for library staff
3. 🔴 **HIGH:** Update Admin Portal to use correct endpoint or pass parameters
4. 🟡 **MEDIUM:** Verify Student Portal passes `tenantId`

---

**Next Steps:**
1. Update SDK to support additional parameters
2. Update all frontend portals to pass required parameters
3. Test login flows for all 5 user types
4. Verify integration works end-to-end

