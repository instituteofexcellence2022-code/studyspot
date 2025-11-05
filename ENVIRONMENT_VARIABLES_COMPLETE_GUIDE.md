# 🔧 Environment Variables - Complete Guide

## 🎯 **Where to Update Environment Variables**

You need to update in **TWO places**: Frontend (Netlify) and Backend (Render)

---

## 📱 **FRONTEND (Student Portal on Netlify)**

### **Already Configured!** ✅

I created `netlify.toml` which includes:
```toml
[build.environment]
  VITE_API_URL = "https://studyspot-api.onrender.com"
  VITE_USE_MOCK = "false"
  VITE_APP_NAME = "StudySpot Student Portal"
  VITE_APP_VERSION = "4.0.0"
```

**You DON'T need to add these manually** - they're in the config file!

**To verify or update:**
1. Netlify Dashboard → Your site → **"Site settings"**
2. **"Build & deploy"** → **"Environment"**
3. Should show the variables from netlify.toml
4. If you want to override, click **"Edit variables"**

---

## 🔧 **BACKEND (Render) - NEEDS UPDATE**

### **Current Backend Services:**
```
API Gateway:  https://studyspot-api.onrender.com (port 3001)
Auth Service: Running (port 3001)
```

### **NEW Services You Need to Add:**

**Go to Render Dashboard:** https://dashboard.render.com

**Add these NEW services:**

#### **1. Message Service**
```
Name: studyspot-message-service
Type: Web Service
Repo: studyspot
Build: npm install
Start: npm run start:message
Port: 3010

Environment Variables:
- SUPABASE_URL = [your Supabase URL]
- SUPABASE_SERVICE_ROLE_KEY = [your Supabase key]
- MESSAGE_SERVICE_PORT = 3010
```

#### **2. Community Service**
```
Name: studyspot-community-service
Type: Web Service
Repo: studyspot
Build: npm install
Start: npm run start:community
Port: 3011

Environment Variables:
- SUPABASE_URL = [your Supabase URL]
- SUPABASE_SERVICE_ROLE_KEY = [your Supabase key]
- COMMUNITY_SERVICE_PORT = 3011
```

#### **3. Attendance Service**
```
Name: studyspot-attendance-service
Type: Web Service
Repo: studyspot
Build: npm install
Start: npm run start:attendance
Port: 3012

Environment Variables:
- SUPABASE_URL = [your Supabase URL]
- SUPABASE_SERVICE_ROLE_KEY = [your Supabase key]
- ATTENDANCE_SERVICE_PORT = 3012
```

---

## 🔗 **UPDATE API Gateway Environment Variables**

**On your existing Render API Gateway service:**

**Go to:** Render Dashboard → studyspot-api (or your API Gateway service)

**Click:** "Environment" tab

**ADD these new variables:**

```
MESSAGE_SERVICE_URL = https://studyspot-message-service.onrender.com
COMMUNITY_SERVICE_URL = https://studyspot-community-service.onrender.com
ATTENDANCE_SERVICE_URL = https://studyspot-attendance-service.onrender.com
```

**Click: "Save Changes"**

**This tells the API Gateway where to route requests!**

---

## 📊 **Complete Environment Variable List**

### **Frontend (Netlify - Student Portal):**
```
✅ VITE_API_URL = https://studyspot-api.onrender.com
✅ VITE_USE_MOCK = false
✅ VITE_APP_VERSION = 4.0.0
✅ VITE_APP_NAME = StudySpot Student Portal
```

### **Frontend (Vercel - Owner Portal):**
```
✅ REACT_APP_API_URL = https://studyspot-api.onrender.com
✅ REACT_APP_USE_MOCK = false
```

### **Frontend (Vercel - Admin Portal):**
```
✅ REACT_APP_API_URL = https://studyspot-api.onrender.com
```

### **Backend (Render - API Gateway):**
```
✅ AUTH_SERVICE_URL = http://localhost:3001 (or same service)
⚠️ MESSAGE_SERVICE_URL = https://studyspot-message-service.onrender.com (ADD THIS)
⚠️ COMMUNITY_SERVICE_URL = https://studyspot-community-service.onrender.com (ADD THIS)
⚠️ ATTENDANCE_SERVICE_URL = https://studyspot-attendance-service.onrender.com (ADD THIS)
✅ SUPABASE_URL = [your Supabase project URL]
✅ SUPABASE_SERVICE_ROLE_KEY = [your Supabase service role key]
```

### **Backend (Render - Message Service) - NEW:**
```
⚠️ SUPABASE_URL = [your Supabase URL]
⚠️ SUPABASE_SERVICE_ROLE_KEY = [your Supabase key]
⚠️ MESSAGE_SERVICE_PORT = 3010
```

### **Backend (Render - Community Service) - NEW:**
```
⚠️ SUPABASE_URL = [your Supabase URL]
⚠️ SUPABASE_SERVICE_ROLE_KEY = [your Supabase key]
⚠️ COMMUNITY_SERVICE_PORT = 3011
```

### **Backend (Render - Attendance Service) - NEW:**
```
⚠️ SUPABASE_URL = [your Supabase URL]
⚠️ SUPABASE_SERVICE_ROLE_KEY = [your Supabase key]
⚠️ ATTENDANCE_SERVICE_PORT = 3012
```

---

## 🎯 **What You Need to Update**

### **✅ Frontend (Netlify) - DONE**
**No action needed** - netlify.toml has everything!

### **⚠️ Backend (Render) - ACTION NEEDED**

**Update existing API Gateway:**
1. Render Dashboard → studyspot-api service
2. Environment tab
3. Add:
   - MESSAGE_SERVICE_URL
   - COMMUNITY_SERVICE_URL
   - ATTENDANCE_SERVICE_URL
4. Save Changes

**Create 3 new services:**
1. Message Service (port 3010)
2. Community Service (port 3011)
3. Attendance Service (port 3012)

Each needs:
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- PORT number

---

## 🗄️ **Database Updates Needed (Supabase)**

**Also run these SQL commands in Supabase:**

```sql
-- For messaging
ALTER TABLE community_members ADD COLUMN IF NOT EXISTS privacy_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE community_messages ADD COLUMN IF NOT EXISTS display_name VARCHAR(255);
ALTER TABLE community_messages ADD COLUMN IF NOT EXISTS privacy_enabled BOOLEAN DEFAULT FALSE;

-- For invites
CREATE TABLE IF NOT EXISTS community_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL,
  invite_code VARCHAR(100) UNIQUE NOT NULL,
  expires_at TIMESTAMP,
  usage_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- For attendance
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) NOT NULL,
  user_name VARCHAR(255),
  library_id VARCHAR(255) NOT NULL,
  library_name VARCHAR(255),
  check_in_time TIMESTAMP NOT NULL,
  check_out_time TIMESTAMP,
  duration_minutes INT,
  duration VARCHAR(50),
  status VARCHAR(50) DEFAULT 'checked-in',
  date DATE NOT NULL,
  qr_data TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## ⚡ **Quick Summary**

### **Frontend Environment Variables:**
✅ **Already set in netlify.toml** - No action needed!

### **Backend Environment Variables:**
⚠️ **Need to add in Render Dashboard:**
- Update API Gateway with service URLs
- Create 3 new services
- Add Supabase credentials to each

### **Database:**
⚠️ **Need to run SQL in Supabase** - Add tables and columns

---

## 🎉 **Current Status**

**Student Portal on Netlify:**
- ✅ Deployed and working
- ✅ All latest features included
- ✅ Environment variables configured
- ✅ Real backend connection set up

**To make ALL features work (messaging, groups, QR attendance):**
- ⚠️ Add backend services to Render
- ⚠️ Update Supabase database schema

**For now:**
- ✅ Basic features work (browse libraries, bookings)
- ⏳ Advanced features need backend setup (messaging, groups, QR)

---

## 🚀 **Your Student Portal is LIVE!**

**What works NOW:**
- ✅ Login/Register
- ✅ Browse libraries
- ✅ View library details
- ✅ Basic booking UI

**What needs backend setup:**
- ⏳ Messaging (needs message-service)
- ⏳ Groups (needs community-service)
- ⏳ QR Attendance (needs attendance-service)
- ⏳ File sharing (needs Supabase Storage)

**The frontend is 100% ready - just needs backend services deployed!** 🎯
