# 🔧 "FAILED TO FETCH" ERROR - FIX

## ❌ CURRENT ERROR

**Error in Browser**: `Failed to fetch`  
**Cause**: **CORS (Cross-Origin Resource Sharing) blocking**

---

## 🔍 ROOT CAUSE

Your student portal runs on: **`http://localhost:5173`** (Vite default)  
Your API allows requests from: **`http://localhost:3000`** (CORS_ORIGIN setting)

**Result**: Browser blocks the request for security reasons! ❌

---

## ✅ SOLUTION: UPDATE CORS_ORIGIN ON RENDER

### **Step 1: Go to Render**

1. Go to: https://dashboard.render.com
2. Open service: **`studyspot-api`**
3. Click **"Environment"** tab

### **Step 2: Update CORS_ORIGIN**

Find `CORS_ORIGIN` and update to include ALL your frontend URLs:

```
CORS_ORIGIN=https://studyspot-rose.vercel.app,https://studyspot-librarys.vercel.app,https://studyspot-admin-2.vercel.app,https://studyspot-student.vercel.app,https://main.studyspot-student.pages.dev,https://studyspot-student.netlify.app,http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:5173
```

**Key addition**: `,http://localhost:5173` at the end!

### **Step 3: Save and Redeploy**

1. Click **"Save Changes"**
2. Render auto-deploys (2-3 minutes)
3. Test again

---

## 🎯 COMPLETE CORS_ORIGIN VALUE

Copy this EXACTLY (all on one line, no spaces after commas):

```
https://studyspot-rose.vercel.app,https://studyspot-librarys.vercel.app,https://studyspot-admin-2.vercel.app,https://studyspot-student.vercel.app,https://main.studyspot-student.pages.dev,https://studyspot-student.netlify.app,http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:5173
```

---

## 🧪 TEST AFTER UPDATE

### **1. Wait for Deployment**
- Takes 2-3 minutes
- Watch "Logs" tab for "SERVER STARTED SUCCESSFULLY"

### **2. Start Student Portal**

```bash
cd studyspot-student-pwa
npm run dev
```

Portal should open at: **http://localhost:5173**

### **3. Test Registration**

1. Open http://localhost:5173
2. Click "Register"
3. Fill in details
4. Submit

**Expected**: ✅ No "Failed to fetch" error, registration succeeds

### **4. Check Browser Console**

Press `F12` → Console tab

**Before fix**:
```
❌ Access to fetch at 'https://studyspot-api.onrender.com/api/auth/register' 
   from origin 'http://localhost:5173' has been blocked by CORS policy
```

**After fix**:
```
✅ No CORS errors
✅ Request succeeds
```

---

## 📋 ALL ENVIRONMENT VARIABLES NEEDED

While you're in Render Environment tab, verify these are ALL set:

```env
# Database
DATABASE_URL=postgresql://postgres.zgrgryufcxgjbmpjiwbh:Ial8GDBSqBAsCLMm@aws-1-ap-south-1.pooler.supabase.com:5432/postgres

# CORS - UPDATED
CORS_ORIGIN=https://studyspot-rose.vercel.app,https://studyspot-librarys.vercel.app,https://studyspot-admin-2.vercel.app,https://studyspot-student.vercel.app,https://main.studyspot-student.pages.dev,https://studyspot-student.netlify.app,http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:5173

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d

# Node Environment
NODE_ENV=production

# Port (Render sets this automatically, but good to have)
PORT=3001
```

---

## 🔍 HOW TO VERIFY CORS IS WORKING

### **Option 1: Browser DevTools**

1. Open student portal: http://localhost:5173
2. Press `F12` → Network tab
3. Try to login/register
4. Click on the request (e.g., `register`)
5. Look at **Response Headers**:

```
access-control-allow-origin: http://localhost:5173
access-control-allow-credentials: true
```

If you see these → CORS is working! ✅

### **Option 2: Test with curl**

```powershell
# Test CORS preflight
$headers = @{
    "Origin" = "http://localhost:5173"
    "Access-Control-Request-Method" = "POST"
    "Access-Control-Request-Headers" = "Content-Type"
}

Invoke-WebRequest -Uri "https://studyspot-api.onrender.com/api/auth/login" -Method OPTIONS -Headers $headers
```

**Expected**: Should return 200 OK with CORS headers

---

## 🆘 IF STILL NOT WORKING

### **1. Check Render Logs**

1. Go to Render → `studyspot-api` → "Logs"
2. Look for startup message showing CORS config
3. Verify it includes `http://localhost:5173`

### **2. Hard Refresh Browser**

Sometimes browser caches CORS errors:
- Chrome/Edge: `Ctrl + Shift + R`
- Firefox: `Ctrl + F5`

### **3. Test Direct API Call**

```powershell
# Test that API accepts requests from localhost:5173
Invoke-WebRequest -Uri "https://studyspot-api.onrender.com/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"test@test.com","password":"Test123!"}' `
  -Headers @{ "Origin"="http://localhost:5173" }
```

If this works but browser fails → Clear browser cache

### **4. Check Student Portal URL**

Verify your portal is actually running on port 5173:

```bash
cd studyspot-student-pwa
npm run dev
```

Look for output:
```
VITE v7.x.x  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

If it's on a different port (e.g., 5174), add that port to CORS_ORIGIN too!

---

## 📊 CORS TROUBLESHOOTING CHECKLIST

- [ ] `CORS_ORIGIN` includes `http://localhost:5173`
- [ ] `CORS_ORIGIN` is all on ONE line (no breaks)
- [ ] No spaces after commas in CORS_ORIGIN
- [ ] Saved and redeployed on Render
- [ ] Waited 2-3 minutes for deployment
- [ ] Hard refreshed browser (`Ctrl + Shift + R`)
- [ ] Portal is running on correct port (5173)
- [ ] No browser extensions blocking requests
- [ ] Checked browser console for CORS errors

---

## 🎯 QUICK FIX SUMMARY

**Issue**: CORS blocking requests from `http://localhost:5173`  
**Fix**: Add `,http://localhost:5173` to `CORS_ORIGIN` on Render  
**Time**: 5 minutes (update + redeploy)  
**Status**: ⏳ Waiting for you to update CORS_ORIGIN

---

**GO TO RENDER NOW** and add `http://localhost:5173` to CORS_ORIGIN! 🚀


