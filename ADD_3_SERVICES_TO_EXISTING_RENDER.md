# 🚀 Add 3 New Services to Your Existing Render Project

## ✅ You Already Have This Setup:
- Render account with studyspot project
- GitHub repo connected
- Multiple services already deployed

---

## 🎯 What We're Adding:

3 new **Supabase-based** microservices:
1. **Message Service** (student-owner direct messaging)
2. **Community Service** (groups, communities, chat)
3. **Attendance Service** (QR-based check-in/out)

**Time:** 15 minutes total (5 min each)

---

## 📋 **STEP 1: Deploy Message Service**

### **A. Create Service:**
1. Go to [https://dashboard.render.com](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Select your **studyspot** repository
4. Click **"Connect"**

### **B. Configuration:**
```
Name: studyspot-message-service

Region: Singapore (or your existing region)

Branch: main

Root Directory: backend
⚠️ CRITICAL: Must type "backend"

Runtime: Node

Build Command: npm install

Start Command: npm run start:message

Instance Type: Free
```

### **C. Environment Variables:**

Click **"Advanced"** → Scroll to **"Environment Variables"**

**Add these 4:**
```
1. SUPABASE_URL
   Value: https://[your-project].supabase.co
   (Get from: https://app.supabase.com → Settings → API → Project URL)

2. SUPABASE_SERVICE_ROLE_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   (Get from: https://app.supabase.com → Settings → API → service_role key)

3. MESSAGE_SERVICE_PORT
   Value: 3010

4. NODE_ENV
   Value: production
```

### **D. Deploy:**
- Click **"Create Web Service"** (bottom of page)
- Wait 3-5 minutes
- Status will show **"Live"** 🟢

**📝 SAVE THIS URL:** `https://studyspot-message-service.onrender.com`

---

## 📋 **STEP 2: Deploy Community Service**

**Repeat Same Steps:**

### **Configuration:**
```
Name: studyspot-community-service
Region: Singapore
Branch: main
Root Directory: backend
Build Command: npm install
Start Command: npm run start:community
Instance Type: Free
```

### **Environment Variables:**
```
SUPABASE_URL = [Same as above]
SUPABASE_SERVICE_ROLE_KEY = [Same as above]
COMMUNITY_SERVICE_PORT = 3011
NODE_ENV = production
```

**Deploy** → Wait 3-5 minutes

**📝 SAVE THIS URL:** `https://studyspot-community-service.onrender.com`

---

## 📋 **STEP 3: Deploy Attendance Service**

**Repeat Same Steps:**

### **Configuration:**
```
Name: studyspot-attendance-service
Region: Singapore
Branch: main
Root Directory: backend
Build Command: npm install
Start Command: npm run start:attendance
Instance Type: Free
```

### **Environment Variables:**
```
SUPABASE_URL = [Same as above]
SUPABASE_SERVICE_ROLE_KEY = [Same as above]
ATTENDANCE_SERVICE_PORT = 3012
NODE_ENV = production
```

**Deploy** → Wait 3-5 minutes

**📝 SAVE THIS URL:** `https://studyspot-attendance-service.onrender.com`

---

## 🔗 **STEP 4: Update API Gateway (CRITICAL)**

Now connect these services to your existing API Gateway.

### **A. Find Your API Gateway:**
1. In Render Dashboard, find service named:
   - **"studyspot-gateway"** OR
   - **"studyspot-api"** OR
   - **"api-gateway"**
2. Click on it
3. Click **"Environment"** tab (left sidebar)

### **B. Add 3 New Variables:**

Click **"Add Environment Variable"** → Add these:

```
1. MESSAGE_SERVICE_URL
   Value: https://studyspot-message-service.onrender.com

2. COMMUNITY_SERVICE_URL
   Value: https://studyspot-community-service.onrender.com

3. ATTENDANCE_SERVICE_URL
   Value: https://studyspot-attendance-service.onrender.com
```

### **C. Save & Restart:**
- Click **"Save Changes"**
- API Gateway will auto-restart (1-2 minutes)
- Wait for **"Live"** status

---

## ✅ **STEP 5: Verify Everything Works**

### **Test Health Checks:**

Open these URLs in your browser:

1. **Message Service:**  
   `https://studyspot-message-service.onrender.com/health`  
   Should show: `{"status":"ok","service":"message-service"}`

2. **Community Service:**  
   `https://studyspot-community-service.onrender.com/health`  
   Should show: `{"status":"ok","service":"community-service"}`

3. **Attendance Service:**  
   `https://studyspot-attendance-service.onrender.com/health`  
   Should show: `{"status":"ok","service":"attendance-service"}`

### **Test Student Portal:**

1. Go to your Netlify Student Portal
2. Test these features:
   - ✅ Join a community
   - ✅ Send a message
   - ✅ Toggle privacy mode
   - ✅ Join a library group (if you've booked)
   - ✅ Scan QR code for attendance

---

## 🎯 **Deployment Checklist:**

Track your progress:

- [ ] Message Service deployed and "Live"
- [ ] Community Service deployed and "Live"
- [ ] Attendance Service deployed and "Live"
- [ ] API Gateway updated with 3 service URLs
- [ ] API Gateway restarted successfully
- [ ] All 3 health checks passing
- [ ] Student Portal features tested

---

## ⏱️ **Timeline:**

```
Message Service:       5 minutes
Community Service:     5 minutes
Attendance Service:    5 minutes
Update API Gateway:    2 minutes
Test & Verify:         3 minutes
─────────────────────────────────
Total:                 20 minutes
```

---

## 🐛 **Troubleshooting:**

### **"Build Failed" Error:**
- Check that "Root Directory" is set to: `backend`
- Check that Start Command is correct: `npm run start:message`

### **"Service Unhealthy" Error:**
- Check environment variables are set correctly
- Check SUPABASE_URL format: `https://xxx.supabase.co`
- Check SUPABASE_SERVICE_ROLE_KEY is the **service_role** key (not anon key)

### **"Cannot find module" Error:**
- Build Command should be: `npm install` (not `npm ci`)
- Root Directory must be: `backend`

### **API Gateway Can't Connect:**
- Make sure you added ALL 3 service URLs
- Check URLs don't have trailing slashes
- Wait 2 minutes after saving for gateway to restart

---

## 🎉 **After Completion:**

Your **complete architecture** will be:

```
┌─────────────────────────────────────┐
│  Student Portal (Netlify)           │
│  https://your-site.netlify.app      │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  API Gateway (Render)               │
│  Routes requests to:                │
└─────────────────────────────────────┘
         │
         ├──→ Message Service ← NEW ✅
         ├──→ Community Service ← NEW ✅
         ├──→ Attendance Service ← NEW ✅
         └──→ Your other 11 services
```

**All features now work!** 🚀

---

## 📞 **Need Help?**

Let me know:
- ✅ When all 3 services are deployed
- ⚠️ If you hit any errors
- ❓ If any step is unclear

**Ready? Go to dashboard.render.com and start with Step 1!** 💪

