# 🚀 DEPLOY BACKEND TO RENDER - STEP BY STEP

## 📌 **Overview**
Deploy all 11 backend microservices to Render using the `render.yaml` blueprint.

---

## ✅ **WHAT'S READY:**

- [x] `render.yaml` configured (11 microservices)
- [x] Backend code on GitHub
- [x] All services ready to deploy
- [x] Frontend already deployed and working

---

## 🚀 **DEPLOYMENT STEPS**

### **STEP 1: GO TO RENDER DASHBOARD**

1. Open: **https://dashboard.render.com**
2. Sign in (or create account if new)
3. If new account: Connect your GitHub account

---

### **STEP 2: CREATE NEW BLUEPRINT**

1. Click **"New +"** button (top right)
2. Select **"Blueprint"**
3. You'll see "Deploy from a Blueprint Repository"

---

### **STEP 3: CONNECT GITHUB REPOSITORY**

1. Click **"Connect a repository"**
2. You'll see a list of your GitHub repos
3. Find and select: **`instituteofexcellence2022-code/studyspot`**
4. Click **"Connect"**

If you don't see the repository:
- Click **"Configure GitHub App"**
- Grant access to the repository
- Go back and try again

---

### **STEP 4: CONFIGURE BLUEPRINT**

Render will automatically detect the `render.yaml` file!

You'll see:

```
✅ render.yaml detected
✅ Found 11 services
✅ Found 1 Redis database
```

**Blueprint Name:** `studyspot-platform`  
**Branch:** `main`

Click **"Apply"**

---

### **STEP 5: REVIEW SERVICES**

Render will show you all services it's about to create:

```
📦 11 Web Services:
  - studyspot-gateway
  - studyspot-auth
  - studyspot-user
  - studyspot-tenant
  - studyspot-student
  - studyspot-library
  - studyspot-payment
  - studyspot-credit
  - studyspot-subscription
  - studyspot-messaging
  - studyspot-analytics

🗄️ 1 Redis:
  - studyspot-redis
```

Click **"Create Resources"** or **"Deploy"**

---

### **STEP 6: WAIT FOR DEPLOYMENT** (~15-20 minutes)

Render will now:
1. ✅ Create 11 web services
2. ✅ Create Redis instance
3. ✅ Install dependencies for each service
4. ✅ Build each service
5. ✅ Deploy each service
6. ✅ Generate URLs for each service

**You'll see progress bars for each service!**

---

### **STEP 7: GET YOUR SERVICE URLS**

After deployment, you'll get these URLs:

```
✅ API Gateway:       https://studyspot-gateway.onrender.com
✅ Auth Service:      https://studyspot-auth.onrender.com
✅ User Service:      https://studyspot-user.onrender.com
✅ Tenant Service:    https://studyspot-tenant.onrender.com
✅ Student Service:   https://studyspot-student.onrender.com
✅ Library Service:   https://studyspot-library.onrender.com
✅ Payment Service:   https://studyspot-payment.onrender.com
✅ Credit Service:    https://studyspot-credit.onrender.com
✅ Subscription Svc:  https://studyspot-subscription.onrender.com
✅ Messaging Service: https://studyspot-messaging.onrender.com
✅ Analytics Service: https://studyspot-analytics.onrender.com
```

**SAVE THE API GATEWAY URL!** This is what your frontend will use.

---

### **STEP 8: UPDATE FRONTEND API URL**

Once backend is deployed, update your frontend to use the NEW backend:

**In Vercel Dashboard:**
1. Go to your `studyspot-admin-2` project
2. Settings → Environment Variables
3. Update `REACT_APP_API_URL`:
   ```
   OLD: https://studyspot-api.onrender.com/api/v1
   NEW: https://studyspot-gateway.onrender.com/api/v1
   ```
4. Redeploy frontend

---

### **STEP 9: UPDATE CORS IN NEW BACKEND**

In Render, go to `studyspot-gateway` service:
1. Go to **Environment** tab
2. Add `CORS_ORIGIN`:
   ```
   CORS_ORIGIN=https://studyspot-admin-2.vercel.app,http://localhost:3002
   ```
3. Save (service will auto-redeploy)

---

## 🗄️ **DATABASE OPTIONS**

You have 2 choices:

### **Option A: Use Existing Database** (Faster)
- Keep using your current database
- No migration needed
- Works immediately

### **Option B: Setup Supabase** (Better for production)
- Follow `SUPABASE_SETUP_GUIDE.md` (if you created it)
- More reliable
- Better performance
- Takes ~15 minutes extra

**For now, let's use Option A (existing database)** to get things working faster!

---

## ⚠️ **IMPORTANT: ENVIRONMENT VARIABLES**

After Render creates the services, you need to add these manually:

### **For Payment Service:**
```
CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### **For Messaging Service:**
```
MSG91_AUTH_KEY=your_msg91_auth_key
MSG91_SENDER_ID=STDYSP
BSNL_ENTITY_ID=your_bsnl_dlt_entity_id
```

**You can add these later when ready to test payments/SMS!**

---

## 💰 **COST: $0/month** (Free Tier)

All 11 services on Render free tier!

**Limitations:**
- Services sleep after 15min inactivity
- First request takes ~30s to wake up
- 750 hours/month per service

---

## ✅ **DEPLOYMENT CHECKLIST**

- [ ] Opened Render dashboard
- [ ] Created Blueprint deployment
- [ ] Connected studyspot repository
- [ ] Render detected render.yaml
- [ ] Clicked "Apply" or "Deploy"
- [ ] Services are deploying (watch progress)
- [ ] Wait ~15-20 minutes
- [ ] All services deployed
- [ ] API Gateway URL obtained
- [ ] Update frontend API URL
- [ ] Update CORS
- [ ] Test end-to-end

---

## 🎯 **CURRENT TASK:**

**Go to Render now and start the deployment!**

👉 **https://dashboard.render.com**

Follow Steps 1-6 above!

---

**Let me know when you:**
- Start the Blueprint deployment
- Services begin deploying
- Get any errors
- Deployment completes!

I'll guide you through each step! 🚀

