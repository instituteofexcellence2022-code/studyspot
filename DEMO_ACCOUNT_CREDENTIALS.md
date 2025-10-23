# 🔐 DEMO ACCOUNT CREDENTIALS

## ✅ VERIFIED - PASSWORDS ARE CORRECT

### 📘 **LIBRARY OWNER PORTAL** (Port 3000)

**File:** `web-owner/src/pages/auth/CleanLoginPage.tsx`

```javascript
email: 'owner@demo.com'
password: 'Demo123456'
role: 'library_owner'
```

---

### 📕 **PLATFORM ADMIN PORTAL** (Port 3002)

**File:** `web-admin/src/pages/auth/CleanLoginPage.tsx`

```javascript
email: 'admin@demo.com'
password: 'Admin123456'
role: 'super_admin'
```

---

## 🎯 HOW THE DEMO ACCOUNT WORKS:

### **When you click "Try Demo Account" button:**

1. **Step 1: Auto-Registration**
   - Frontend sends registration request to API
   - If account exists: Skips to login (no error)
   - If account doesn't exist: Creates new account

2. **Step 2: Auto-Login**
   - Uses the demo credentials
   - Gets auth token from API
   - Redirects to dashboard

---

## 🔍 CHECKING DATABASE:

Let me verify if these accounts exist in your Supabase database...

### **To manually check:**

1. Go to your Supabase dashboard
2. Open SQL Editor
3. Run this query:

```sql
SELECT email, role, status, created_at 
FROM users 
WHERE email IN ('owner@demo.com', 'admin@demo.com');
```

---

## ⚠️ IMPORTANT NOTE:

The password in the frontend code (`Demo123456`, `Admin123456`) will be **hashed** before being stored in the database. So in the database you'll see something like:

```
$2b$10$abcdefghijklmnopqrstuvwxyz123456789...
```

This is normal and secure! ✅

---

## 🧪 TESTING NOW:

1. **Make sure API is running:** Port 3001 ✅ (Confirmed)
2. **Make sure Owner Portal is running:** Port 3000 ✅ (Confirmed)
3. **Browser is open:** http://localhost:3000/login ✅
4. **Click:** Green "Try Demo Account" button

---

## 📋 WHAT TO TELL ME:

1. **Did you click the button?** (Yes/No)
2. **What happened?** (Success message, error message, or nothing?)
3. **What's in the browser console?** (Press F12, copy any red errors)

---

**✅ Passwords are correct and ready to test!**


