# ✅ IMMEDIATE ACTION CHECKLIST - Production Configuration

**Date:** November 19, 2025  
**Status:** Services Deployed ✅ - Need Configuration ⚠️

---

## 🎯 **WHAT'S ALREADY DEPLOYED** ✅

### **Backend Services:**
- ✅ API Gateway: `https://studyspot-api.onrender.com`
- ✅ Auth Service: `https://studyspot-auth.onrender.com`

### **Frontend Portals:**
- ✅ Student Portal: `https://studyspot-student.netlify.app`
- ✅ Owner Portal: `https://studyspot-librarys.vercel.app`
- ✅ Admin Portal: `https://studyspot-admin-2.vercel.app`

---

## ⚠️ **IMMEDIATE ACTIONS NEEDED** (Today)

### **1. Configure Environment Variables on Render** 🔧

**Go to:** https://dashboard.render.com

#### **A. API Gateway Service (`studyspot-api`)**

**Add/Update these environment variables:**

```env
# Database (REQUIRED)
DATABASE_URL=<Your Supabase PostgreSQL connection string>
# OR use individual parameters:
CORE_DB_HOST=<supabase-host>
CORE_DB_NAME=postgres
CORE_DB_USER=postgres
CORE_DB_PASSWORD=<your-password>
CORE_DB_SSL=true

# Service URLs
AUTH_SERVICE_URL=https://studyspot-auth.onrender.com
STUDENT_SERVICE_URL=https://studyspot-api.onrender.com/api/v1/students
BOOKING_SERVICE_URL=https://studyspot-api.onrender.com/api/v1/bookings
LIBRARY_SERVICE_URL=https://studyspot-api.onrender.com/api/v1/libraries
PAYMENT_SERVICE_URL=https://studyspot-api.onrender.com/api/v1/payments

# CORS (Update with your actual domains)
CORS_ORIGIN=https://studyspot-student.netlify.app,https://studyspot-librarys.vercel.app,https://studyspot-admin-2.vercel.app,http://localhost:3000,http://localhost:3001,http://localhost:3002

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=1 minute
```

#### **B. Auth Service (`studyspot-auth`)**

**Add/Update these environment variables:**

```env
# Database (REQUIRED - Same as API Gateway)
DATABASE_URL=<Your Supabase PostgreSQL connection string>
# OR use individual parameters:
CORE_DB_HOST=<supabase-host>
CORE_DB_NAME=postgres
CORE_DB_USER=postgres
CORE_DB_PASSWORD=<your-password>
CORE_DB_SSL=true

# JWT (CRITICAL - Generate strong secret)
JWT_SECRET=<Generate a strong random string, 32+ characters>
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d

# CORS (Same as API Gateway)
CORS_ORIGIN=https://studyspot-student.netlify.app,https://studyspot-librarys.vercel.app,https://studyspot-admin-2.vercel.app,http://localhost:3000,http://localhost:3001,http://localhost:3002

# Cashfree (For Aadhaar KYC - Optional for now)
CASHFREE_API_KEY=<your-cashfree-key>
CASHFREE_API_SECRET=<your-cashfree-secret>
CASHFREE_ENV=sandbox
```

**How to generate JWT_SECRET:**
```bash
# Option 1: Use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Use online generator
# https://www.grc.com/passwords.htm (use 64 character password)
```

---

### **2. Run Database Migrations** 🗄️

**Go to:** Your Supabase Dashboard → SQL Editor

**Step 1: Run Core Schema**
1. Open `backend/migrations/001_create_core_schema.sql`
2. Copy entire content
3. Paste in Supabase SQL Editor
4. Click "Run"

**Step 2: Verify Tables Created**
```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('tenants', 'admin_users', 'platform_analytics');
```

**Step 3: Create Initial Admin User** (Optional)
```sql
-- Replace <bcrypt-hash> with actual hash from your auth service
-- You can register via the admin portal and then promote to super_admin
INSERT INTO admin_users (email, password_hash, first_name, role, is_active)
VALUES ('admin@studyspot.com', '<bcrypt-hash>', 'Admin', 'super_admin', true);
```

**Note:** Tenant-specific schemas will be created automatically when tenants register.

---

### **3. Verify Frontend Environment Variables** 🌐

#### **A. Student Portal (Netlify)**

**Go to:** Netlify Dashboard → Your Site → Site Settings → Environment Variables

**Verify these are set:**
```env
VITE_API_URL=https://studyspot-api.onrender.com
VITE_USE_MOCK=false
```

#### **B. Owner Portal (Vercel)**

**Go to:** Vercel Dashboard → Your Project → Settings → Environment Variables

**Verify these are set:**
```env
REACT_APP_API_URL=https://studyspot-api.onrender.com
REACT_APP_AUTH_URL=https://studyspot-api.onrender.com
```

#### **C. Admin Portal (Vercel)**

**Go to:** Vercel Dashboard → Your Project → Settings → Environment Variables

**Verify these are set:**
```env
REACT_APP_API_URL=https://studyspot-api.onrender.com
```

---

### **4. Test Critical Flows** ✅

After configuring environment variables:

1. **Test Backend Health:**
   ```
   https://studyspot-api.onrender.com/health
   ```
   Should return: `{"success":true,"data":{"status":"healthy"}}`

2. **Test Student Registration:**
   - Go to: https://studyspot-student.netlify.app
   - Register a new student
   - Check browser console for errors
   - Verify data is saved

3. **Test Owner Registration:**
   - Go to: https://studyspot-librarys.vercel.app
   - Register a new owner
   - Check browser console for errors
   - Verify data is saved

4. **Test Login:**
   - Login with registered credentials
   - Verify JWT tokens are received
   - Check if dashboard loads

---

## 📋 **QUICK CHECKLIST**

### **Today (Immediate):**
- [ ] Add `DATABASE_URL` to API Gateway on Render
- [ ] Add `DATABASE_URL` to Auth Service on Render
- [ ] Add `JWT_SECRET` to Auth Service on Render (generate strong secret)
- [ ] Update `CORS_ORIGIN` on both services
- [ ] Run database migrations in Supabase
- [ ] Verify frontend environment variables
- [ ] Test backend health endpoint
- [ ] Test student registration
- [ ] Test owner registration
- [ ] Test login flow

### **This Week:**
- [ ] Set up error monitoring (Sentry - optional)
- [ ] Set up uptime monitoring (UptimeRobot - free)
- [ ] Test all critical user flows
- [ ] Create initial admin user (if needed)
- [ ] Document any issues found

---

## 🔍 **HOW TO VERIFY CONFIGURATION**

### **1. Check Render Logs:**
```
1. Go to: https://dashboard.render.com
2. Click on your service (studyspot-api or studyspot-auth)
3. Click "Logs" tab
4. Look for:
   ✅ "Connected to core database"
   ✅ "Server listening on port..."
   ❌ Any database connection errors
   ❌ Any missing environment variable errors
```

### **2. Check Database Connection:**
```sql
-- In Supabase SQL Editor
SELECT COUNT(*) FROM tenants;
SELECT COUNT(*) FROM admin_users;
```

### **3. Check Frontend Console:**
```
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for:
   ✅ "API URL: https://studyspot-api.onrender.com"
   ❌ Network errors
   ❌ CORS errors
   ❌ Authentication errors
```

---

## 🚨 **COMMON ISSUES & FIXES**

### **Issue 1: "Database connection failed"**
**Fix:**
- Verify `DATABASE_URL` is correct in Render
- Check Supabase connection string format
- Ensure SSL is enabled (`CORE_DB_SSL=true`)

### **Issue 2: "JWT_SECRET is missing"**
**Fix:**
- Generate a strong secret (32+ characters)
- Add to Auth Service environment variables
- Redeploy service

### **Issue 3: "CORS error"**
**Fix:**
- Add your frontend URL to `CORS_ORIGIN` in both services
- Ensure no trailing slashes
- Redeploy services

### **Issue 4: "Student data not saving"**
**Fix:**
- Verify database migrations are run
- Check Render logs for errors
- Verify API Gateway can connect to database
- Check if tenant_id is being set correctly

---

## 📞 **NEXT STEPS AFTER CONFIGURATION**

1. **Monitor for 24 hours:**
   - Check Render logs daily
   - Monitor Supabase dashboard
   - Watch for errors in frontend

2. **Test with real users:**
   - Start with 5-10 beta users
   - Collect feedback
   - Monitor for issues

3. **Set up monitoring:**
   - UptimeRobot (free) for uptime checks
   - Sentry (optional) for error tracking
   - Supabase dashboard for database monitoring

---

## ✅ **SUCCESS CRITERIA**

You're ready for beta testing when:
- ✅ All environment variables are set
- ✅ Database migrations are run
- ✅ Backend health check returns 200 OK
- ✅ Student registration works
- ✅ Owner registration works
- ✅ Login works
- ✅ Data persists after refresh
- ✅ No CORS errors in console
- ✅ No database connection errors in logs

---

**Last Updated:** November 19, 2025  
**Priority:** 🔴 HIGH - Complete today for beta testing

