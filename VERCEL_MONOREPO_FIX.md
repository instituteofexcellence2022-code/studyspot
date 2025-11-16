# 🔧 Fix Vercel Deployment for Student Portal (Monorepo)

## Problem
Vercel is trying to install all workspace dependencies, causing conflicts between `web-owner` and `web-admin-new/frontend`.

## Solution

### Step 1: Configure Root Directory in Vercel Dashboard

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Open your `studyspot-student-pwa` project

2. **Update Settings**
   - Go to **Settings** → **General**
   - Scroll to **Root Directory**
   - Set it to: `studyspot-student-pwa`
   - Click **Save**

3. **Update Build Settings**
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install --legacy-peer-deps`

### Step 2: Environment Variables

Make sure these are set in **Settings** → **Environment Variables**:

```
VITE_API_URL=https://studyspot-api.onrender.com
VITE_AUTH_URL=https://studyspot-auth.onrender.com
VITE_APP_NAME=StudySpot Student Portal
VITE_APP_VERSION=4.0.0
VITE_USE_MOCK=false
```

**Apply to**: Production, Preview, Development

### Step 3: Redeploy

After updating settings:
1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Select **"Redeploy"**
4. Wait for build to complete

---

## Alternative: If Root Directory Can't Be Changed

If you can't change the root directory, use this install command in Vercel:

```bash
cd studyspot-student-pwa && npm install --legacy-peer-deps
```

Update in: **Settings** → **General** → **Install Command**

---

## Why This Works

- **Root Directory**: Tells Vercel to only work with the `studyspot-student-pwa` folder
- **--legacy-peer-deps**: Ignores peer dependency conflicts
- **Isolated Build**: Only installs dependencies for the student portal, not all workspaces

---

## Verify Deployment

After redeploy:
1. Check build logs for success ✅
2. Visit: https://studyspot-student.vercel.app
3. Hard refresh: `Ctrl + Shift + R`
4. Test login functionality

---

## Current Configuration

The `vercel.json` file has been updated with:
- ✅ `installCommand` with `--legacy-peer-deps`
- ✅ `.npmrc` file created with `legacy-peer-deps=true`

But the **most important** fix is setting the **Root Directory** in Vercel dashboard!

