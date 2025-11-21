# 🔧 Frontend-Backend Integration Fix Plan

**Date:** 2025-01-02  
**Status:** ⚠️ **NEEDS FIXES**

---

## 📋 **Issues Found**

### **Issue 1: SDK Doesn't Pass Required Parameters** 🔴

**File:** `packages/studyspot-tenant-sdk/src/types.ts`  
**Problem:** SDK `Credentials` interface only has `email` and `password`

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
  tenantId?: string;      // Optional: Required for students and library staff
  userType?: string;      // Optional: 'student', 'library_owner', 'library_staff', 'platform_admin', 'platform_staff'
  portalType?: string;    // Optional: 'student', 'owner', 'admin'
}
```

---

### **Issue 2: Owner Portal Missing tenantId for Library Staff** 🔴

**File:** `web-owner/src/services/authService.ts:30`  
**Problem:** Doesn't accept or pass `tenantId` for library staff login

**Should Add:**
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
    userType,             // Pass userType
    portalType: 'owner',  // Always 'owner' for owner portal
  });
}
```

---

### **Issue 3: Admin Portal Wrong Endpoint** ⚠️

**File:** `web-admin-new/frontend/src/services/sdk.ts:16`  
**Problem:** Uses universal endpoint instead of admin endpoint

**Should Change:**
```typescript
const authConfig: AuthProviderConfig = {
  baseUrl: baseAuthUrl,
  loginPath: '/api/v1/auth/admin/login',  // ✅ Use admin endpoint
  refreshPath: '/api/auth/refresh',
  logoutPath: '/api/auth/logout',
  enableRefresh: true,
};
```

---

## ✅ **Recommended Fixes**

### **Priority 1: Update SDK** 🔴

1. Update `Credentials` interface in SDK
2. Update `login()` method to forward all parameters
3. Test SDK with all parameter combinations

### **Priority 2: Update Frontend Portals** 🔴

1. Update Owner Portal to pass `tenantId` for library staff
2. Update Admin Portal to use correct endpoint
3. Verify Student Portal passes `tenantId`

### **Priority 3: Test Integration** 🟡

1. Test all 5 user types login
2. Verify tokens are generated correctly
3. Verify profile endpoints work
4. Verify refresh tokens work

---

**Full details in:** `backend/FRONTEND_BACKEND_INTEGRATION_AUDIT.md`

