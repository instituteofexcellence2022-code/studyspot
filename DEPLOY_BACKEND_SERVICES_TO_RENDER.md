# 🔧 Deploy Backend Services to Render - Complete Guide

## 🎯 **What You're Deploying**

3 New microservices that enable:
- 💬 Student-Owner messaging
- 👥 Community groups & chat
- 📍 QR-based attendance

---

## 📋 **STEP-BY-STEP DEPLOYMENT**

### **Before You Start:**
Have these ready:
- ✅ Render account (dashboard.render.com)
- ✅ GitHub repo connected to Render
- ✅ Supabase URL and Service Role Key

---

## 🔵 **SERVICE 1: Message Service**

### **Step 1: Create New Web Service**

**Render Dashboard:**
1. Click **"New +"** → **"Web Service"**
2. Connect repository: **studyspot**
3. Click **"Connect"**

### **Step 2: Configure Service**

```
Name: studyspot-message-service

Region: Oregon (US West) or closest to you

Branch: main

Root Directory: backend
(IMPORTANT: Set this!)

Runtime: Node

Build Command: npm install

Start Command: npm run start:message
```

### **Step 3: Add Environment Variables**

Click **"Advanced"** → **"Add Environment Variable"**

**Add these:**
```
SUPABASE_URL
Value: [Your Supabase Project URL]
Example: https://xxxxx.supabase.co

SUPABASE_SERVICE_ROLE_KEY  
Value: [Your Supabase Service Role Key]
Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

MESSAGE_SERVICE_PORT
Value: 3010

NODE_ENV
Value: production
```

### **Step 4: Deploy**

**Plan:** Free

Click: **"Create Web Service"**

**Wait:** 3-5 minutes

**Status:** Should show "Live" when done

**URL:** https://studyspot-message-service.onrender.com

---

## 🟢 **SERVICE 2: Community Service**

### **Repeat Same Steps:**

**Step 1-2: Create Web Service**
- Name: **studyspot-community-service**
- Root Directory: **backend**
- Start Command: **npm run start:community**

**Step 3: Environment Variables**
```
SUPABASE_URL = [Your Supabase URL]
SUPABASE_SERVICE_ROLE_KEY = [Your Supabase Key]
COMMUNITY_SERVICE_PORT = 3011
NODE_ENV = production
```

**Step 4: Deploy**
- Click "Create Web Service"
- Wait 3-5 minutes
- **URL:** https://studyspot-community-service.onrender.com

---

## 🟠 **SERVICE 3: Attendance Service**

### **Repeat Same Steps:**

**Step 1-2: Create Web Service**
- Name: **studyspot-attendance-service**
- Root Directory: **backend**
- Start Command: **npm run start:attendance**

**Step 3: Environment Variables**
```
SUPABASE_URL = [Your Supabase URL]
SUPABASE_SERVICE_ROLE_KEY = [Your Supabase Key]
ATTENDANCE_SERVICE_PORT = 3012
NODE_ENV = production
```

**Step 4: Deploy**
- Click "Create Web Service"
- Wait 3-5 minutes
- **URL:** https://studyspot-attendance-service.onrender.com

---

## 🔗 **UPDATE API GATEWAY (Critical!)**

### **After all 3 services are deployed:**

**Go to your existing API Gateway service on Render**

**Click: "Environment" tab**

**Add these 3 variables:**
```
MESSAGE_SERVICE_URL
Value: https://studyspot-message-service.onrender.com

COMMUNITY_SERVICE_URL
Value: https://studyspot-community-service.onrender.com

ATTENDANCE_SERVICE_URL
Value: https://studyspot-attendance-service.onrender.com
```

**Click: "Save Changes"**

**API Gateway will restart** (1-2 minutes)

---

## ✅ **Verification**

### **Test Each Service:**

**Message Service:**
```bash
curl https://studyspot-message-service.onrender.com/health
# Should return: {"status":"ok","service":"message-service"}
```

**Community Service:**
```bash
curl https://studyspot-community-service.onrender.com/health
# Should return: {"status":"ok","service":"community-service"}
```

**Attendance Service:**
```bash
curl https://studyspot-attendance-service.onrender.com/health
# Should return: {"status":"ok","service":"attendance-service"}
```

**API Gateway (after update):**
```bash
curl https://studyspot-api.onrender.com/api/messages/test
# Should route to message service

curl https://studyspot-api.onrender.com/api/communities/test
# Should route to community service

curl https://studyspot-api.onrender.com/api/attendance/test
# Should route to attendance service
```

---

## 📊 **Your Complete Backend Architecture**

```
┌─────────────────────────────────────────┐
│  API Gateway (Port 3001)                │
│  https://studyspot-api.onrender.com     │
│                                         │
│  Routes requests to:                    │
└─────────────────────────────────────────┘
         │
         ├──→ Auth Service (same service, port 3001)
         │
         ├──→ Message Service (port 3010) ← NEW
         │    https://studyspot-message-service.onrender.com
         │
         ├──→ Community Service (port 3011) ← NEW
         │    https://studyspot-community-service.onrender.com
         │
         └──→ Attendance Service (port 3012) ← NEW
              https://studyspot-attendance-service.onrender.com
```

---

## 🎯 **Deployment Checklist**

**Complete this in order:**

- [ ] Deploy Message Service to Render
- [ ] Deploy Community Service to Render
- [ ] Deploy Attendance Service to Render
- [ ] Update API Gateway environment variables
- [ ] Test all 3 service health endpoints
- [ ] Run Supabase SQL migrations
- [ ] Test Student Portal live site
- [ ] Verify messaging works
- [ ] Verify groups work
- [ ] Verify QR attendance works

---

## ⏱️ **Timeline**

**Total time: ~20 minutes**

```
Deploy Message Service:    5 minutes
Deploy Community Service:  5 minutes  
Deploy Attendance Service: 5 minutes
Update API Gateway:        2 minutes
Run SQL migrations:        2 minutes
Test features:             3 minutes
──────────────────────────────────────
Total:                     22 minutes
```

---

## 🚀 **Quick Start Commands**

**For Supabase SQL:**
- Open: https://app.supabase.com → Your project → SQL Editor
- Paste entire SUPABASE_SQL_MIGRATIONS.sql
- Click "Run"
- Wait ~10 seconds
- ✅ All tables created!

**For Render:**
- Follow steps above for each service
- Copy-paste the configuration
- Should take ~5 min per service

---

## 🎉 **After Completion**

**Your Student Portal will have:**
- ✅ Full messaging system
- ✅ Community & groups with chat
- ✅ File sharing
- ✅ Privacy mode
- ✅ QR attendance scanner
- ✅ Member management
- ✅ Invite links
- ✅ Real-time updates

**All features fully functional!** 🚀

---

**Ready to start? Let's deploy these services!** 💪

