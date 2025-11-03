# ✅ THREE PORTALS - COMPLETE TESTING CHECKLIST

## 🎯 **GOAL:** All 3 portals fully functional and tested

---

## 📊 **PORTAL OVERVIEW**

| Portal | URL | Status | Users |
|--------|-----|--------|-------|
| **Admin Portal** | https://studyspot-admin-2.vercel.app | ✅ LIVE | Platform admins |
| **Owner Portal** | https://studyspot-rose.vercel.app | ✅ LIVE | Library owners |
| **Student Portal** | TBD | ❌ NOT DEPLOYED | Students |

**Backend API:** https://studyspot-api.onrender.com

---

## 🔧 **PHASE 1: BACKEND CONFIGURATION**

### **Task 1.1: Update Backend CORS**

The backend needs to allow ALL portal URLs:

**Environment Variable Needed:**
```env
CORS_ORIGIN=https://studyspot-admin-2.vercel.app,https://studyspot-rose.vercel.app,http://localhost:3000,http://localhost:3002
```

**How to add:**
1. Go to Render Dashboard
2. Find `studyspot-api` service
3. Go to Environment tab
4. Add/Update `CORS_ORIGIN`
5. Save (will auto-redeploy ~2 min)

---

### **Task 1.2: Verify Backend Routes**

Backend has these routes ready:

**Core Routes:**
- ✅ `/api/auth` - Authentication
- ✅ `/api/users` - User management
- ✅ `/api/libraries` - Libraries
- ✅ `/api/bookings` - Bookings
- ✅ `/api/payments` - Payments

**SaaS Routes:**
- ✅ `/api/tenants` - Tenant management
- ✅ `/api/subscriptions` - Subscriptions
- ✅ `/api/credits` - Credit system
- ✅ `/api/roles` - RBAC

**Enhanced Routes:**
- ✅ `/api/dashboard` - Dashboard metrics
- ✅ `/api/students` - Student management
- ✅ `/api/invoices` - Invoicing
- ✅ `/api/audit` - Audit logs
- ✅ `/api/fee-plans` - Fee plans

**All routes present!** ✅

---

## 🏢 **PHASE 2: ADMIN PORTAL TESTING** (web-admin-new)

### **URL:** https://studyspot-admin-2.vercel.app

### **Login Credentials:**
```
Email: admin@studyspot.com
Password: Admin@123
```

### **Modules to Test:**

#### **✅ Core Management (High Priority)**
- [ ] Dashboard - Real-time metrics load
- [ ] Tenants - Can view/create/edit tenants
- [ ] Students - Student database accessible
- [ ] Libraries - Library oversight works
- [ ] Users - Platform user management
- [ ] Roles - RBAC configuration

#### **✅ Financial (High Priority)**
- [ ] Revenue Dashboard - Charts display
- [ ] Revenue Analytics - Data loads
- [ ] Payments - Payment oversight
- [ ] Credits - Credit management
- [ ] Subscriptions - Subscription management

#### **✅ Communication**
- [ ] Messaging - SMS/Email center
- [ ] Templates - Message templates
- [ ] Notifications - System notifications

#### **✅ Operations**
- [ ] CRM/Leads - Lead management
- [ ] Sales Teams - Sales dashboard
- [ ] Tickets - Support tickets
- [ ] System Health - System monitoring
- [ ] Audit Logs - Activity logs

#### **✅ Advanced**
- [ ] Attendance - Attendance tracking
- [ ] Fee Plans - Pricing oversight
- [ ] Referrals - Referral programs
- [ ] Compliance - Privacy/GDPR
- [ ] Staff - Staff attendance
- [ ] Analytics - Platform analytics
- [ ] Settings - Configuration

---

## 🏢 **PHASE 3: OWNER PORTAL TESTING** (web-owner)

### **URL:** https://studyspot-rose.vercel.app

### **Login Credentials:**
```
Email: owner@test.com
Password: Test@123
```
(Or create via admin portal if doesn't exist)

### **Features to Test:**

#### **✅ Core Features**
- [ ] Dashboard - Metrics display
- [ ] Library Management - Create/edit libraries
- [ ] Booking Management - View/manage bookings
- [ ] User Management - Students & staff
- [ ] Seat Management - Layout designer

#### **✅ Financial**
- [ ] Subscription - View/upgrade plan
- [ ] Credits - Purchase/manage credits
- [ ] Invoices - Generate/download invoices
- [ ] Payments - Payment history
- [ ] Revenue - Revenue analytics

#### **✅ Operations**
- [ ] Attendance - Face recognition
- [ ] IoT - Device management
- [ ] Issues - Issue tracking
- [ ] Leads - Lead capture
- [ ] Referrals - Referral program

---

## 📱 **PHASE 4: STUDENT PORTAL DEPLOYMENT**

### **Options Available:**

| Option | Location | Technology | Status |
|--------|----------|------------|--------|
| **A. React Native** | `/mobile` | React Native | Ready |
| **B. React Native** | `/StudySpotAndroid` | React Native | Ready |
| **C. Web App** | `/web` | React | Has issues |
| **D. Flutter** | `/studyspot_flutter` | Flutter | Ready |
| **E. PWA** | `/studyspot-pwa` | React + Vite | Ready |

**Recommended:** Deploy **PWA** (studyspot-pwa) - Fastest to deploy!

---

### **Deploy Student PWA:**

**Step 1: Update API URL**
```bash
cd studyspot-pwa
```

Create `.env`:
```env
VITE_API_BASE_URL=https://studyspot-api.onrender.com/api/v1
```

**Step 2: Deploy to Vercel**
1. Vercel Dashboard → New Project
2. Import `studyspot` repository
3. Root directory: `studyspot-pwa`
4. Framework: Vite
5. Add environment variable: `VITE_API_BASE_URL`
6. Deploy

**Step 3: Test**
- Visit URL
- Test student login
- Test library search
- Test booking creation

---

## 🔐 **PHASE 5: DATABASE & AUTHENTICATION**

### **Ensure Database Has:**
- [ ] `admin_users` table - For admin portal
- [ ] `tenant_users` table - For owner portal
- [ ] `students` table - For student portal
- [ ] Proper authentication routes for each

### **Test Users Needed:**

**Admin User:**
```sql
-- Should exist in admin_users table
email: admin@studyspot.com
password: Admin@123 (hashed)
role: super_admin
```

**Owner User:**
```sql
-- Should exist in tenant_users table  
email: owner@test.com
password: Test@123 (hashed)
role: owner
```

**Student User:**
```sql
-- Should exist in students table
email: student@test.com
password: Test@123 (hashed)
```

---

## 🌐 **PHASE 6: CORS CONFIGURATION**

Update backend `CORS_ORIGIN` to include ALL portals:

```env
CORS_ORIGIN=https://studyspot-admin-2.vercel.app,https://studyspot-rose.vercel.app,https://studyspot-pwa.vercel.app,http://localhost:3000,http://localhost:3002,http://localhost:3003
```

---

## 🧪 **PHASE 7: END-TO-END TESTING**

### **Complete User Journey:**

**1. Admin Creates Tenant:**
- Login to admin portal
- Go to Tenants
- Create new tenant (library owner)
- Verify owner can login

**2. Owner Creates Library:**
- Login to owner portal
- Create new library
- Set up seats
- Configure pricing

**3. Student Books Slot:**
- Login to student portal
- Search for library
- View available slots
- Create booking
- Make payment

**4. Verify in All Portals:**
- Admin sees the booking in analytics
- Owner sees booking in dashboard
- Student sees confirmed booking

---

## 📝 **TESTING TEMPLATE**

For each portal, test:

### **Authentication:**
- [ ] Login works
- [ ] Logout works
- [ ] Token refresh works
- [ ] Protected routes work

### **Data Display:**
- [ ] Lists load (tables/grids)
- [ ] Details pages load
- [ ] Charts/analytics display
- [ ] No console errors

### **CRUD Operations:**
- [ ] Create works
- [ ] Read/View works
- [ ] Update works
- [ ] Delete works

### **API Connectivity:**
- [ ] No CORS errors
- [ ] API calls successful
- [ ] Error handling works
- [ ] Loading states display

---

## 🎯 **SUCCESS CRITERIA**

All three portals must:
- ✅ Deploy successfully
- ✅ Login working
- ✅ Connect to backend API
- ✅ Display data correctly
- ✅ CRUD operations functional
- ✅ No critical console errors
- ✅ End-to-end flow working

---

## 📞 **CURRENT STATUS**

- [x] Admin Portal deployed & login works
- [ ] Admin Portal fully tested
- [ ] Owner Portal fully tested  
- [ ] Student Portal deployed
- [ ] Student Portal tested
- [ ] End-to-end flow tested
- [ ] All bugs fixed

---

## 🚀 **IMMEDIATE NEXT ACTIONS**

1. **Update backend CORS** - Add all portal URLs
2. **Test admin portal** - Browse all modules
3. **Test owner portal** - Verify all features
4. **Deploy student portal** - Choose PWA and deploy
5. **Complete end-to-end test** - Full user journey

---

**Let's start! I'll guide you through each step systematically.**

**Which would you like to do first?**

**A)** Update backend CORS (so all portals can connect)  
**B)** Test admin portal thoroughly  
**C)** Test owner portal  
**D)** Deploy student portal  

Tell me and I'll execute! 💪

