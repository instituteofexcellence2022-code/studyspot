# 🧪 COMPLETE AUTH FLOW TESTING GUIDE

**Date:** October 23, 2025  
**Status:** Ready for Testing  
**Estimated Time:** 10 minutes  

---

## ✅ PRE-FLIGHT CHECKLIST

### **1. Verify All Services Running**

**API Server (Port 3001):**
```bash
# Check terminal for:
✅ Database connected successfully
✅ SERVER STARTED SUCCESSFULLY
🌐 Server running on port: 3001
```

**Owner Portal (Port 3000):**
```bash
# Check terminal for:
✅ Compiled successfully!
✅ webpack compiled successfully
✅ No issues found.
```

**Database (Supabase):**
- ✅ Project status: ACTIVE
- ✅ Database connection: Established

---

## 🎯 TEST SCENARIOS

### **SCENARIO 1: Demo Account Registration + Login (HAPPY PATH)**

#### **Step 1: Open Login Page**
```
URL: http://localhost:3000/login
```

**Expected:**
- ✅ Blue-themed login page loads
- ✅ "Library Owner Portal" title visible
- ✅ Email/Password fields present
- ✅ "Try Demo Account" button (green)
- ✅ Social login buttons (Google/GitHub)

---

#### **Step 2: Click "Try Demo Account"**

**Expected Behavior:**
1. 🔄 Snackbar appears: "Setting up demo account..."
2. ✅ Snackbar appears: "Demo account created!" (if first time)
3. ✅ Snackbar appears: "Welcome to Demo Account!"
4. 🔄 Page redirects to `/dashboard`
5. ✅ Dashboard loads with user data

**Credentials (auto-filled):**
```
Email: owner@demo.com
Password: Demo123456
Role: library_owner
```

---

#### **Step 3: Verify Dashboard Access**

**Expected:**
- ✅ Dashboard page loads
- ✅ User info in header (Demo Owner)
- ✅ Navigation menu visible
- ✅ No error messages
- ✅ Token stored in localStorage

**Check Browser DevTools (F12 → Application → Local Storage):**
```
auth_token: eyJhbGc...  (JWT token)
refresh_token: eyJhbGc...  (Refresh token)
user_data: { "id": "...", "email": "owner@demo.com", ... }
```

---

### **SCENARIO 2: Manual Login (Existing User)**

#### **Step 1: Logout**
- Click profile icon → Logout
- Verify redirect to `/login`
- Check localStorage cleared

#### **Step 2: Manual Login**
```
Email: owner@demo.com
Password: Demo123456
```

**Expected:**
- ✅ Login successful
- ✅ Redirect to dashboard
- ✅ User session restored

---

### **SCENARIO 3: Invalid Credentials (ERROR PATH)**

#### **Step 1: Wrong Password**
```
Email: owner@demo.com
Password: WrongPassword123
```

**Expected:**
- ❌ Snackbar appears: "Invalid credentials"
- ❌ Stay on login page
- ❌ No tokens in localStorage

---

#### **Step 2: Non-existent User**
```
Email: nonexistent@example.com
Password: AnyPassword123
```

**Expected:**
- ❌ Snackbar appears: "Invalid credentials"
- ❌ Stay on login page

---

### **SCENARIO 4: Token Refresh (AUTOMATIC)**

#### **Step 1: Simulate Token Expiry**
1. Open Browser DevTools (F12)
2. Go to Application → Local Storage
3. Edit `auth_token` value to invalid token
4. Make any API request (navigate to different page)

**Expected:**
- ✅ Automatic token refresh triggered
- ✅ New token fetched using refresh token
- ✅ Page loads successfully
- ✅ No logout/redirect

---

### **SCENARIO 5: Profile Access**

#### **Step 1: View Profile**
- Click profile icon → Profile/Settings
- Navigate to `/profile`

**Expected:**
- ✅ Profile page loads
- ✅ User data displayed correctly:
  - Email: owner@demo.com
  - Name: Demo Owner
  - Role: library_owner
  - Phone: +1234567890

---

### **SCENARIO 6: API Response Validation**

#### **Open Browser DevTools (F12 → Network Tab)**

**During Demo Account Login, check:**

**1. POST /api/auth/register Request:**
```json
{
  "email": "owner@demo.com",
  "password": "Demo123456",
  "firstName": "Demo",
  "lastName": "Owner",
  "phone": "+1234567890",
  "role": "library_owner"
}
```

**2. POST /api/auth/register Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "owner@demo.com",
      "firstName": "Demo",
      "lastName": "Owner",
      "role": "library_owner",
      "status": "active"
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "expiresIn": "24h"
    }
  }
}
```

**3. POST /api/auth/login Request:**
```json
{
  "email": "owner@demo.com",
  "password": "Demo123456"
}
```

**4. POST /api/auth/login Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "owner@demo.com",
      "firstName": "Demo",
      "lastName": "Owner",
      "role": "library_owner",
      "lastLogin": "2025-10-23T..."
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "expiresIn": "24h"
    }
  }
}
```

**5. GET /api/auth/me Request:**
```
Headers:
Authorization: Bearer eyJhbGc...
```

**6. GET /api/auth/me Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "owner@demo.com",
      "firstName": "Demo",
      "lastName": "Owner",
      "role": "library_owner",
      "tenantId": "default-tenant"
    }
  }
}
```

---

## 🐛 TROUBLESHOOTING

### **Issue: "ERR_CONNECTION_REFUSED"**

**Solution:**
1. Check if Owner Portal is running on port 3000
2. Check terminal for compilation errors
3. Try: http://127.0.0.1:3000/login
4. Clear browser cache

---

### **Issue: "Invalid credentials" on Demo Account**

**Solution:**
1. Check browser console for exact error
2. Check API logs for request details
3. Verify database connection
4. Check CORS configuration

---

### **Issue: Dashboard redirects back to login**

**Possible Causes:**
- ❌ Token not stored in localStorage
- ❌ Token format incorrect
- ❌ API response structure mismatch
- ❌ Auth middleware rejecting token

**Solution:**
1. Open DevTools (F12) → Console
2. Check for errors
3. Go to Application → Local Storage
4. Verify `auth_token` exists and looks like: `eyJhbGc...`
5. Check Network tab for 401 errors

---

### **Issue: Snackbar shows "Demo login failed: [error]"**

**Solutions by Error:**

**"User already exists":**
- ✅ This is OK! The account was created before
- ✅ It will auto-login anyway

**"Invalid role":**
- ❌ Backend validation issue
- ✅ Already fixed in commit 8f4dc2e

**"Validation failed":**
- ❌ Missing required fields
- ✅ Already fixed in commit 0adb190

**Network Error:**
- ❌ API server not running
- ❌ CORS configuration issue
- Check API server terminal

---

## ✅ SUCCESS CRITERIA

After completing all scenarios, you should have:

1. ✅ Demo account registered successfully
2. ✅ Login working with correct credentials
3. ✅ Error messages for wrong credentials
4. ✅ Dashboard accessible
5. ✅ Profile data displaying correctly
6. ✅ Logout working properly
7. ✅ Token refresh working automatically
8. ✅ All Snackbar messages appearing correctly

---

## 📊 TESTING CHECKLIST

Use this checklist while testing:

### **Authentication Flow:**
- [ ] Demo account button works
- [ ] Registration successful (first time)
- [ ] Login successful (returning user)
- [ ] Error handling for wrong password
- [ ] Error handling for non-existent user
- [ ] Logout works correctly
- [ ] Session persists on page refresh

### **Token Management:**
- [ ] Access token stored in localStorage
- [ ] Refresh token stored in localStorage
- [ ] Token sent with API requests
- [ ] Token refresh on 401 error
- [ ] Tokens cleared on logout

### **UI/UX:**
- [ ] Snackbar messages appear
- [ ] Loading states visible
- [ ] Form validation working
- [ ] Navigation after login
- [ ] Protected routes working
- [ ] Role-based access control

### **API Integration:**
- [ ] /api/auth/register endpoint
- [ ] /api/auth/login endpoint
- [ ] /api/auth/me endpoint
- [ ] /api/auth/refresh endpoint
- [ ] /api/auth/logout endpoint
- [ ] Error responses formatted correctly

---

## 🚀 NEXT STEPS AFTER TESTING

### **If All Tests Pass:**
1. ✅ Commit any final changes
2. ✅ Update PRODUCTION_READY_REVIEW.md
3. ✅ Deploy to Vercel (Owner Portal)
4. ✅ Deploy to Vercel (Admin Portal)
5. ✅ Test on production URLs

### **If Tests Fail:**
1. ❌ Note the specific scenario that failed
2. ❌ Check browser console for errors
3. ❌ Check API logs for backend errors
4. ❌ Share error details for troubleshooting
5. ❌ Fix issues before deployment

---

## 📝 TEST REPORT TEMPLATE

After testing, fill this out:

```
TEST REPORT
Date: ___________
Tester: ___________

SCENARIO 1 (Demo Account): [ PASS / FAIL ]
Notes: ___________

SCENARIO 2 (Manual Login): [ PASS / FAIL ]
Notes: ___________

SCENARIO 3 (Invalid Creds): [ PASS / FAIL ]
Notes: ___________

SCENARIO 4 (Token Refresh): [ PASS / FAIL ]
Notes: ___________

SCENARIO 5 (Profile Access): [ PASS / FAIL ]
Notes: ___________

SCENARIO 6 (API Validation): [ PASS / FAIL ]
Notes: ___________

OVERALL STATUS: [ READY FOR PRODUCTION / NEEDS FIXES ]

ISSUES FOUND:
1. ___________
2. ___________
3. ___________
```

---

## 🎯 READY TO TEST?

**Start Here:**
1. Open browser to: http://localhost:3000/login
2. Click "Try Demo Account"
3. Watch for Snackbar messages
4. Verify dashboard loads

**Report back:**
- ✅ All tests passed
- ❌ Specific scenario failed (with error details)

**LET'S TEST!** 🚀

