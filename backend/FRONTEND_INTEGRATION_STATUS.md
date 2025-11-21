# ⚠️ Frontend-Backend Integration Status

**Date:** 2025-01-02  
**Status:** ⚠️ **PARTIALLY INTEGRATED** - Needs Fixes for Students & Library Staff

---

## ✅ **What's Working**

### **1. Library Owner Login** ✅
**Portal:** Owner Portal (web-owner)  
**Status:** ✅ **WORKING**

**Why it works:**
- ✅ Backend queries `library_owners` table in core DB
- ✅ `tenantId` is stored in `library_owners.tenant_id` column
- ✅ Frontend doesn't need to pass `tenantId` (backend infers it)
- ✅ Login works without additional parameters

**Current Frontend:**
```typescript
await authClient.login({ email, password });  // ✅ Works!
```

---

### **2. Platform Admin Login** ✅
**Portal:** Admin Portal (web-admin-new)  
**Status:** ✅ **WORKING** (but using wrong endpoint)

**Why it works:**
- ✅ Backend queries `platform_admins` table in core DB
- ✅ No `tenantId` needed (platform users have no tenant)
- ✅ Login works via universal endpoint

**Current Frontend:**
```typescript
await authClient.login({ email, password });  // ✅ Works!
```

**Note:** Using universal `/api/auth/login` instead of `/api/v1/auth/admin/login`, but it still works because backend checks platform_admins table.

---

### **3. Platform Staff Login** ✅
**Portal:** Admin Portal (web-admin-new)  
**Status:** ✅ **WORKING** (but using wrong endpoint)

**Why it works:**
- ✅ Backend queries `platform_staff` table in core DB
- ✅ No `tenantId` needed (platform users have no tenant)
- ✅ Login works via universal endpoint

---

## ❌ **What's NOT Working**

### **1. Student Login** ❌
**Portal:** Student Portal  
**Status:** ❌ **WILL FAIL** (missing tenantId)

**Why it fails:**
- ❌ Students are in **tenant database** (not core database)
- ❌ Backend needs `tenantId` to connect to tenant database
- ❌ Frontend SDK doesn't accept or pass `tenantId` parameter
- ❌ Login will fail with "Invalid credentials" (user not found in core DB)

**Backend Logic:**
```typescript
// Line 783-798: Student login requires tenantId
if (!user && tenantId) {  // ❌ tenantId is null/undefined from frontend
  const { user: studentUser } = await getUserFromTenantDb(
    'students',
    { email },
    tenantId  // ❌ tenantId is null, so tenant DB is never queried
  );
}
```

**Required Fix:**
```typescript
// Student Portal MUST pass tenantId
await authClient.login({
  email,
  password,
  tenantId: 'tenant-uuid',  // ✅ REQUIRED
  userType: 'student',
  portalType: 'student',
});
```

---

### **2. Library Staff Login** ❌
**Portal:** Owner Portal (web-owner)  
**Status:** ❌ **WILL FAIL** (missing tenantId)

**Why it fails:**
- ❌ Library staff are in **tenant database** (not core database)
- ❌ Backend needs `tenantId` to connect to tenant database
- ❌ Frontend SDK doesn't accept or pass `tenantId` parameter
- ❌ Login will fail for library staff (library owners work fine)

**Backend Logic:**
```typescript
// Line 765-781: Library staff login requires tenantId
if (!user && tenantId) {  // ❌ tenantId is null/undefined from frontend
  const { user: libraryStaffUser } = await getUserFromTenantDb(
    'library_staff',
    { email },
    tenantId  // ❌ tenantId is null, so tenant DB is never queried
  );
}
```

**Required Fix:**
```typescript
// Owner Portal MUST pass tenantId for library staff
await authClient.login({
  email,
  password,
  tenantId: 'tenant-uuid',  // ✅ REQUIRED for library staff
  userType: 'library_staff',
  portalType: 'owner',
});
```

---

## 📊 **Integration Status Matrix**

| User Type | Portal | Works? | Missing | Status |
|-----------|--------|--------|---------|--------|
| **Student** | Student Portal | ❌ | `tenantId` required | **BROKEN** |
| **Library Owner** | Owner Portal | ✅ | None | **WORKING** |
| **Library Staff** | Owner Portal | ❌ | `tenantId` required | **BROKEN** |
| **Platform Admin** | Admin Portal | ✅ | Wrong endpoint (but works) | **WORKING** |
| **Platform Staff** | Admin Portal | ✅ | Wrong endpoint (but works) | **WORKING** |

---

## 🔧 **Required Fixes**

### **Priority 1: Update SDK** 🔴 CRITICAL

**File:** `packages/studyspot-tenant-sdk/src/types.ts`

**Fix:**
```typescript
export interface Credentials {
  email: string;
  password: string;
  tenantId?: string;      // ✅ ADD: Required for students/library_staff
  userType?: string;      // ✅ ADD: Optional but recommended
  portalType?: string;    // ✅ ADD: Optional but recommended
}
```

**File:** `packages/studyspot-tenant-sdk/src/auth.ts:29`

**Fix:**
```typescript
async login(credentials: Credentials): Promise<LoginResponse> {
  // ✅ Already forwards all credentials - no change needed
  // Just update Credentials interface above
  const rawResponse = await this.request<any>(
    provider.loginPath ?? DEFAULT_ENDPOINTS.login,
    credentials  // ✅ Will now include tenantId, userType, portalType
  );
}
```

---

### **Priority 2: Update Owner Portal** 🔴 CRITICAL

**File:** `web-owner/src/services/authService.ts:30`

**Fix:**
```typescript
async login(
  email: string, 
  password: string,
  tenantId?: string,              // ✅ ADD: Required for library staff
  userType?: 'library_owner' | 'library_staff'  // ✅ ADD
): Promise<AuthResponse> {
  try {
    const response = await authClient.login({
      email,
      password,
      tenantId,             // ✅ PASS: tenantId for library staff
      userType,             // ✅ PASS: userType
      portalType: 'owner',  // ✅ PASS: Always 'owner' for owner portal
    });
    // ... rest of code
  }
}
```

**UI Changes Needed:**
- Add user type selector (Library Owner vs Library Staff)
- If Library Staff selected, require/collect `tenantId`
- Pass `tenantId` and `userType` to login function

---

### **Priority 3: Update Admin Portal** 🟡 MEDIUM

**File:** `web-admin-new/frontend/src/services/sdk.ts:16`

**Option 1: Change Endpoint** (Recommended)
```typescript
const authConfig: AuthProviderConfig = {
  baseUrl: baseAuthUrl,
  loginPath: '/api/v1/auth/admin/login',  // ✅ Use admin endpoint
  refreshPath: '/api/auth/refresh',
  logoutPath: '/api/auth/logout',
  enableRefresh: true,
};
```

**Option 2: Pass Parameters** (Alternative)
```typescript
// Update authService.login() to pass portalType
await authClient.login({
  email: credentials.email,
  password: credentials.password,
  portalType: 'admin',  // ✅ Pass portalType
});
```

---

### **Priority 4: Update Student Portal** 🔴 CRITICAL

**File:** Need to find student portal auth service

**Fix:**
```typescript
async login(
  email: string, 
  password: string,
  tenantId: string  // ✅ REQUIRED for students
): Promise<AuthResponse> {
  if (!tenantId) {
    throw new Error('Tenant ID required for student login');
  }
  
  const response = await authClient.login({
    email,
    password,
    tenantId,           // ✅ REQUIRED
    userType: 'student',
    portalType: 'student',
  });
  
  return response;
}
```

**UI Changes Needed:**
- Get `tenantId` from:
  - URL slug/domain (e.g., `library-slug.studyspot.com`)
  - Configuration/environment variable
  - Local storage (if previously stored)
  - User input (if multiple tenants)

---

## 🎯 **Summary**

### **Current Status:** ⚠️ **PARTIALLY INTEGRATED**

**Working:**
- ✅ Library Owner login (no tenantId needed)
- ✅ Platform Admin login (no tenantId needed, but wrong endpoint)
- ✅ Platform Staff login (no tenantId needed, but wrong endpoint)

**Not Working:**
- ❌ Student login (missing tenantId)
- ❌ Library Staff login (missing tenantId)

**Required Fixes:**
1. 🔴 **CRITICAL:** Update SDK to accept `tenantId`, `userType`, `portalType`
2. 🔴 **CRITICAL:** Update Owner Portal to pass `tenantId` for library staff
3. 🔴 **CRITICAL:** Update Student Portal to pass `tenantId`
4. 🟡 **MEDIUM:** Update Admin Portal to use correct endpoint or pass parameters

---

**Next Steps:**
1. Update SDK types and implementation
2. Update all frontend portals to pass required parameters
3. Test login flows for all 5 user types
4. Verify end-to-end integration

