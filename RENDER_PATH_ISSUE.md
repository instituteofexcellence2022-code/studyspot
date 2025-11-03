# 🚨 RENDER DEPLOYMENT - PATH CONFIGURATION ISSUE

## ❌ **PROBLEM IDENTIFIED:**

Render error shows:
```
at Object.<anonymous> (/opt/render/project/src/api/src/index-unified.js:235:27)
```

Notice the path: `/opt/render/project/src/api/src/`

**This is WRONG!** It should be:
```
/opt/render/project/src/api/src/index-unified.js
                    ^^^ (only one "src")
```

But it shows:
```
/opt/render/project/src/api/src/index-unified.js
                    ^^^ ^^^ (TWO "src" - wrong!)
```

---

## 🎯 **ROOT CAUSE:**

**Render's Root Directory is likely set to:** `api` or wrong path

**Should be:** Root of your repo (where `api/` folder is)

---

## ✅ **FIX IN RENDER DASHBOARD:**

### **Step 1: Go to Render**
👉 https://dashboard.render.com

### **Step 2: Click Your API Service**

### **Step 3: Go to Settings**
Click **"Settings"** tab (left sidebar)

### **Step 4: Check "Root Directory"**

Look for **"Root Directory"** setting:

**If it says:** `api` or `src/api` or anything else
**Change it to:** Leave it **BLANK** or set to `api`

**Correct Configuration:**
```
Root Directory: api
Build Command: npm install
Start Command: node src/index-unified.js
```

**OR if that doesn't work:**
```
Root Directory: (leave blank)
Build Command: cd api && npm install
Start Command: cd api && node src/index-unified.js
```

### **Step 5: Save & Redeploy**
1. Click **"Save Changes"**
2. Render will auto-redeploy
3. Wait 3-4 minutes

---

## 🔍 **ALTERNATIVE: Check Build & Start Commands**

In Render Settings:

**Build Command should be:**
```
npm install
```
(Render should run this inside the `api/` folder)

**Start Command should be:**
```
node src/index-unified.js
```
(NOT `node api/src/index-unified.js`)

---

## 💡 **WHY THIS HAPPENS:**

Render might be configured to deploy from the monorepo root, then:
1. It sets root to `api/`
2. But then references `src/api/src/` (duplicating the path)

**The fix:** Make sure Root Directory is set correctly to `api`

---

## 🚀 **DO THIS NOW:**

1. Render Dashboard → Your API service
2. Settings tab
3. Find "Root Directory"
4. Set to: `api`
5. Save
6. Wait for redeploy

---

**Check this setting in Render and tell me what it's set to!** 🔧

