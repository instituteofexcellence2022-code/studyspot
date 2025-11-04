# 🔧 VERCEL MANUAL REDEPLOY - STEP BY STEP

**Issue:** GitHub updated but Vercel showing old version  
**Cause:** Vercel not auto-detecting GitHub pushes  
**Solution:** Manual redeploy

---

## ⚡ **QUICK FIX (30 seconds):**

### **Step 1: Go to Vercel Dashboard**
```
https://vercel.com/dashboard
```

### **Step 2: Find Your Projects**
Look for:
- `studyspot-librarys` (Owner Portal)
- `studyspot-student` (Student PWA)

### **Step 3: Redeploy Owner Portal**
1. Click on `studyspot-librarys`
2. Click **"Deployments"** tab
3. Find the latest deployment
4. Click **"..." (three dots menu)**
5. Click **"Redeploy"**
6. **Uncheck** "Use existing build cache"
7. Click **"Redeploy"**

### **Step 4: Wait for Build**
```
⏱️ Building... (1-2 minutes)
✅ Ready!
```

### **Step 5: Test**
```
🏢 https://studyspot-librarys.vercel.app
Hard refresh: Ctrl + Shift + R
```

---

## 🔧 **ALTERNATIVE: Connect GitHub to Vercel Properly**

### **Why Auto-Deploy Isn't Working:**
```
❌ No .vercel folder in web-owner
❌ No GitHub webhook configured
❌ Vercel doesn't know about pushes
```

### **Fix This Once:**

1. **Go to Vercel Dashboard**
2. **Click your project**
3. **Go to "Settings" → "Git"**
4. **Make sure:**
   - ✅ Repository connected: `instituteofexcellence2022-code/studyspot`
   - ✅ Production branch: `main`
   - ✅ Root directory: `web-owner` (IMPORTANT!)
   - ✅ Auto-deploy: Enabled

5. **Save changes**

**Now every GitHub push will auto-deploy!** ✅

---

## 🎯 **CURRENT SITUATION:**

### **GitHub:**
```
✅ Latest commit: 15cf5974 (3 minutes ago)
✅ Branch: main
✅ Changes: Mock auth service, fixed auth
```

### **Vercel:**
```
❌ Showing: Old version (30 minutes old)
❌ Reason: Not auto-detecting GitHub pushes
⏱️ Fix: Manual redeploy needed
```

---

## 📊 **WHAT TO CHECK:**

### **1. GitHub Repository:**
```
URL: https://github.com/instituteofexcellence2022-code/studyspot
Check: Latest commit should show "3 minutes ago"
File: web-owner/src/services/mockAuthService.ts should exist
```

### **2. Vercel Project Settings:**
```
Dashboard → Project → Settings → Git

Should show:
- Repository: studyspot ✅
- Branch: main ✅
- Root Directory: web-owner ❌ (might be wrong!)
```

**ROOT DIRECTORY IS KEY!**

---

## 🚨 **MOST COMMON ISSUE:**

### **Wrong Root Directory in Vercel:**

If Vercel is set to:
```
Root Directory: .  (project root)
```

**But your code is in:**
```
Root Directory: web-owner  (subdirectory)
```

**Vercel won't find your changes!**

### **Fix:**
1. Vercel Dashboard → Project → Settings
2. **Root Directory:** Change to `web-owner`
3. **Framework Preset:** `Create React App`
4. **Build Command:** `npm run build`
5. **Output Directory:** `build`
6. Save → Redeploy

---

## ✅ **AFTER MANUAL REDEPLOY:**

**You should see:**
1. ✅ Vercel Dashboard: "Building..." → "Ready"
2. ✅ Website: New version with mock auth
3. ✅ Console (F12): New auth service logs
4. ✅ Registration: Works with real or mock backend

---

## 🔍 **HOW TO VERIFY NEW VERSION:**

### **Open Console (F12) on the site:**

**Old Version:**
```
(no auth service logs)
or
(error: cannot find mockAuthService)
```

**New Version:**
```
✅ [AUTH] Backend available, using real authentication
or
🎭 [AUTH] Backend unavailable, switching to MOCK
```

**If you see these new logs → NEW VERSION! ✅**

---

## 🎯 **ACTION ITEMS:**

- [ ] Go to Vercel Dashboard
- [ ] Find `studyspot-librarys` project
- [ ] Check Root Directory setting (should be `web-owner`)
- [ ] Trigger manual redeploy
- [ ] Wait 2 minutes
- [ ] Hard refresh site (Ctrl+Shift+R)
- [ ] Test registration
- [ ] Verify new version via console logs

---

**Do the manual redeploy from Vercel Dashboard now! Takes 30 seconds to trigger, 2 minutes to build! 🚀**


