# 🔧 TROUBLESHOOT REGISTRATION ERROR

## ❌ **Error:** "Registration failed. Please try again."

---

## 🔍 **POSSIBLE CAUSES:**

### **1. CORS Not Updated (Most Likely)** ⚠️

**Problem:** Backend is blocking requests from `studyspot-student.vercel.app`

**Check:**
- Did you update `CORS_ORIGIN` on Render?
- Did Render finish redeploying?

**Solution:**
1. Go to Render: https://dashboard.render.com
2. Open your API service
3. Environment → `CORS_ORIGIN`
4. Value should be:
```
https://studyspot-rose.vercel.app,https://studyspot-librarys.vercel.app,https://studyspot-admin-2.vercel.app,https://studyspot-student.vercel.app,http://localhost:3000,http://localhost:3001
```
5. Save and wait for redeploy (2-3 minutes)

---

### **2. API URL Wrong**

**Check:**
Did you add `VITE_API_URL` in Vercel?

**Solution:**
1. Vercel Dashboard → Your project
2. Settings → Environment Variables
3. Should have:
```
VITE_API_URL = https://studyspot-api.onrender.com
```
4. If missing or wrong, update and redeploy

---

### **3. Backend API Down**

**Check:**
Visit: https://studyspot-api.onrender.com/health

**Expected:** Should return JSON with status

**If it's down:**
- Render might be sleeping (free tier)
- Wait 30 seconds and try again

---

### **4. Registration Endpoint Missing**

**Check if backend has `/auth/register` endpoint**

Let me verify this...

---

## 🔍 **DEBUG IN BROWSER:**

### **Open Browser Console (F12):**

1. Visit: https://studyspot-student.vercel.app
2. Press **F12** (open DevTools)
3. Go to **"Console"** tab
4. Click "Register"
5. Fill form and submit
6. **Look for errors in console**

**Common Error Messages:**

**Error 1: CORS Error**
```
Access to XMLHttpRequest at 'https://studyspot-api.onrender.com/auth/register' 
from origin 'https://studyspot-student.vercel.app' has been blocked by CORS policy
```
**Solution:** Update CORS on Render ✅

**Error 2: Network Error**
```
Network Error
```
**Solution:** Check if API is running, visit health endpoint

**Error 3: 404 Not Found**
```
POST https://studyspot-api.onrender.com/auth/register 404
```
**Solution:** Backend missing registration endpoint

**Error 4: 500 Server Error**
```
POST https://studyspot-api.onrender.com/auth/register 500
```
**Solution:** Backend error, check Render logs

---

## 🔧 **QUICK FIX STEPS:**

### **Step 1: Check Browser Console**
Press F12 → Console → Look for red errors

### **Step 2: Check Network Tab**
F12 → Network → Try register → Look for failed requests

### **Step 3: Update CORS on Render**
Add `https://studyspot-student.vercel.app` to CORS_ORIGIN

### **Step 4: Test Backend Directly**
Visit: https://studyspot-api.onrender.com/health

---

## 📝 **WHAT ERROR DO YOU SEE?**

**In browser console (F12), do you see:**

A. **CORS error** → Update CORS on Render
B. **404 error** → Backend missing endpoint
C. **500 error** → Backend server error
D. **Network error** → API might be down

**Tell me what error you see in the console, and I'll fix it!** 🔧

