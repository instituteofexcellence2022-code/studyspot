# 🚀 STUDENT PWA - VERCEL DEPLOYMENT SETTINGS

**Use this while redeploying in Vercel Dashboard**

---

## ⚙️ **GENERAL SETTINGS:**

```
Project Name: studyspot-student (or your choice)
Framework Preset: Vite
Root Directory: studyspot-student-pwa  ← CRITICAL!
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Node.js Version: 20.x
```

---

## 🔧 **ENVIRONMENT VARIABLES:**

**Add these in Vercel → Settings → Environment Variables:**

| Name | Value | Production | Preview | Development |
|------|-------|------------|---------|-------------|
| `VITE_API_URL` | `https://studyspot-api.onrender.com` | ✅ | ✅ | ✅ |
| `VITE_USE_MOCK` | `false` | ✅ | ❌ | ❌ |
| `VITE_APP_NAME` | `StudySpot Student Portal` | ✅ | ✅ | ✅ |
| `VITE_APP_VERSION` | `3.0.0` | ✅ | ✅ | ✅ |
| `NODE_ENV` | `production` | ✅ | ❌ | ❌ |

---

## 📋 **COPY-PASTE FOR VERCEL:**

### **Variable 1:**
```
Name: VITE_API_URL
Value: https://studyspot-api.onrender.com
```

### **Variable 2:**
```
Name: VITE_USE_MOCK
Value: false
```

### **Variable 3:**
```
Name: VITE_APP_NAME
Value: StudySpot Student Portal
```

### **Variable 4:**
```
Name: VITE_APP_VERSION
Value: 3.0.0
```

### **Variable 5:**
```
Name: NODE_ENV
Value: production
```

---

## ✅ **CRITICAL: ROOT DIRECTORY**

**In General Settings, set:**

```
Root Directory: studyspot-student-pwa
```

**NOT:**
- ❌ Empty
- ❌ `.` (dot)
- ❌ `web`
- ❌ `studyspot-student-pwa/`  (no trailing slash!)

**EXACTLY:** `studyspot-student-pwa`

---

## 🎯 **BUILD SETTINGS:**

```
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

**Don't override these unless needed!**

---

## 📦 **WHAT YOU'LL GET:**

After deployment with these settings:

**New Features:**
- ✅ Social login icons (Google, Facebook, Apple)
- ✅ Remember me checkbox
- ✅ Real backend connection
- ✅ No mock mode
- ✅ Compact single-view design
- ✅ Production-ready

**URL:**
```
https://studyspot-student.vercel.app
or
https://[your-project-name].vercel.app
```

---

## 🔍 **VERIFICATION CHECKLIST:**

After deployment, check:

- [ ] Root Directory = `studyspot-student-pwa` ✅
- [ ] Framework = `Vite` ✅
- [ ] Output Directory = `dist` ✅
- [ ] VITE_API_URL is set ✅
- [ ] VITE_USE_MOCK = `false` ✅
- [ ] Deployment status = "Ready" (green) ✅

---

## 🧪 **AFTER DEPLOYMENT:**

**Test these:**

1. **Open:** https://studyspot-student.vercel.app
2. **Hard refresh:** Ctrl + Shift + R
3. **Check console (F12):**
   ```
   Should see:
   🔧 [AUTH] Mode: REAL BACKEND (Production)
   ```
4. **Verify UI:**
   - ✅ Social login icons visible
   - ✅ Remember me checkbox visible
   - ✅ Compact design
5. **Test registration:**
   - Should connect to real backend
   - Data saved to database

---

## 🎯 **QUICK REFERENCE:**

**Most Important:**
```
1. Root Directory: studyspot-student-pwa  ← Don't forget!
2. VITE_API_URL: https://studyspot-api.onrender.com
3. VITE_USE_MOCK: false
```

**These 3 settings are critical!**

---

## ✅ **READY TO DEPLOY!**

Use these settings while redeploying in Vercel Dashboard!

Good luck! 🚀


