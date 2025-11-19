# 🚀 Fresh Deployment Guide - Student Portal

## ✅ Cleanup Complete

The student portal has been cleaned up and is ready for fresh deployment.

## 📋 Vercel Deployment Settings

### Step 1: Update Vercel Project Settings

1. Go to: https://vercel.com/dashboard
2. Open your `studyspot-student-pwa` project
3. Go to **Settings** → **General**

**Configure these settings:**

- **Root Directory**: `studyspot-student-pwa` ⚠️ **IMPORTANT**
- **Framework Preset**: Vite
- **Build Command**: `npm run build` (or leave empty to use vercel.json)
- **Output Directory**: `dist` (or leave empty to use vercel.json)
- **Install Command**: `npm install --legacy-peer-deps` (or leave empty to use vercel.json)

### Step 2: Environment Variables

Go to **Settings** → **Environment Variables** and ensure these are set:

```
VITE_API_URL=https://studyspot-api.onrender.com
VITE_AUTH_URL=https://studyspot-auth.onrender.com
VITE_APP_NAME=StudySpot Student Portal
VITE_APP_VERSION=4.0.0
VITE_USE_MOCK=false
```

**Apply to**: Production, Preview, Development

### Step 3: Deploy

1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Select **"Redeploy"**
4. Or push to GitHub (if auto-deploy is enabled)

---

## 🔧 Local Development

```bash
cd studyspot-student-pwa
npm install --legacy-peer-deps
npm run dev
```

Visit: http://localhost:3000

---

## 📦 What Was Cleaned

- ✅ Removed unnecessary markdown files
- ✅ Cleaned dist folder
- ✅ Updated vercel.json for proper deployment
- ✅ Ready for fresh build

---

## 🎯 Next Steps

1. Update Vercel settings (Root Directory = `studyspot-student-pwa`)
2. Redeploy
3. Test login/registration
4. Build features incrementally

---

**Note**: The `--legacy-peer-deps` flag is needed because of workspace dependencies with `studyspot-tenant-sdk`.


