# ✅ Final Vercel Configuration Fix

## The Problem
- `vite: command not found` - Dependencies not installing
- `cd studyspot-student-pwa: No such file or directory` - Wrong build context

## The Solution

### Vercel Dashboard Settings

1. **Go to**: https://vercel.com/dashboard → Your Project → **Settings** → **General**

2. **Set these values:**
   - **Root Directory**: `studyspot-student-pwa` ⚠️ **SET THIS**
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build` (or leave empty to use vercel.json)
   - **Output Directory**: `dist` (or leave empty to use vercel.json)
   - **Install Command**: `cd .. && npm install --legacy-peer-deps && cd studyspot-student-pwa`

3. **Save**

### How It Works

1. **Root Directory = `studyspot-student-pwa`**
   - Vercel starts in the student portal directory
   - Build command runs from correct location

2. **Install Command = `cd .. && npm install --legacy-peer-deps && cd studyspot-student-pwa`**
   - Goes to repo root
   - Installs all workspace dependencies (including `studyspot-tenant-sdk`)
   - Returns to student portal directory
   - This ensures workspace dependencies resolve correctly

3. **Build Command = `npm run build`**
   - Runs from `studyspot-student-pwa` directory
   - Vite is available because dependencies were installed from root

4. **Output Directory = `dist`**
   - Build output is in `studyspot-student-pwa/dist`

---

## Environment Variables

Make sure these are set in **Settings** → **Environment Variables**:

```
VITE_API_URL=https://studyspot-api.onrender.com
VITE_AUTH_URL=https://studyspot-auth.onrender.com
VITE_APP_NAME=StudySpot Student Portal
VITE_APP_VERSION=4.0.0
VITE_USE_MOCK=false
```

**Apply to**: Production, Preview, Development

---

## After Configuration

1. **Redeploy** from Deployments tab
2. **Check build logs** - should see:
   - ✅ Installing dependencies from root
   - ✅ Building from student portal
   - ✅ Success!

---

## Why This Works

- **Root Directory**: Ensures build runs from correct location
- **Install from Root**: Resolves workspace dependencies (`file:../packages/studyspot-tenant-sdk`)
- **Build from Subdirectory**: Runs vite build in the right place
- **All Dependencies Available**: Including vite, react, mui, etc.

---

## Alternative: If Install Command Doesn't Work

If the install command fails, try this in Vercel dashboard:

**Install Command**: 
```bash
npm install --legacy-peer-deps --workspace=studyspot-student-pwa
```

But this might not resolve the workspace dependency for `studyspot-tenant-sdk`.


