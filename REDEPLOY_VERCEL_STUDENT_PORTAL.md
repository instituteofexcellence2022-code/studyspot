# 🔄 How to Redeploy Student Portal on Vercel

## Quick Steps to Redeploy

### Option 1: Manual Redeploy via Vercel Dashboard (Easiest)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Login with your account

2. **Find Your Project**
   - Look for project: `studyspot-student-pwa` or `studyspot-student-portal`
   - Or check: https://studyspot-student.vercel.app

3. **Trigger Redeploy**
   - Click on the project
   - Go to **"Deployments"** tab
   - Find the latest deployment (or any deployment)
   - Click the **"..."** (three dots) menu
   - Select **"Redeploy"**
   - Confirm the redeploy

4. **Wait for Build**
   - The build will start automatically
   - Watch the build logs to ensure it completes successfully
   - Usually takes 2-5 minutes

---

### Option 2: Force New Deployment (If Auto-Deploy is Enabled)

If your Vercel project is connected to GitHub:

1. **Make a Small Change** (to trigger new deployment)
   ```bash
   # Add a comment to trigger rebuild
   echo "// Updated: $(Get-Date)" >> studyspot-student-pwa/src/main.tsx
   git add .
   git commit -m "chore: trigger Vercel redeploy"
   git push
   ```

2. **Vercel will Auto-Deploy**
   - Vercel will detect the new commit
   - Automatically start a new deployment
   - Check the Vercel dashboard for progress

---

### Option 3: Deploy via Vercel CLI

1. **Login to Vercel**
   ```powershell
   cd studyspot-student-pwa
   vercel login
   ```

2. **Deploy to Production**
   ```powershell
   vercel --prod
   ```

---

## ✅ Verify Deployment

After redeploy completes:

1. **Check the URL**
   - Visit: https://studyspot-student.vercel.app
   - Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)

2. **Check Build Logs**
   - Go to Vercel Dashboard → Your Project → Deployments
   - Click on the latest deployment
   - Check "Build Logs" to ensure no errors

3. **Test Login**
   - Try to login with a test account
   - Check browser console (F12) for any errors
   - Look for `[StudySpot SDK]` logs

---

## 🔧 Environment Variables Check

Make sure these are set in Vercel:

1. Go to: **Project Settings → Environment Variables**
2. Verify these exist:
   - `VITE_API_URL` = `https://studyspot-api.onrender.com`
   - `VITE_AUTH_URL` = `https://studyspot-auth.onrender.com`
   - `VITE_APP_NAME` = `StudySpot Student Portal`
   - `VITE_APP_VERSION` = `4.0.0`
   - `VITE_USE_MOCK` = `false`

3. **Apply to all environments** (Production, Preview, Development)

---

## 🐛 If Still Showing Old Code

1. **Clear Browser Cache**
   - Hard refresh: `Ctrl + Shift + R`
   - Or use Incognito/Private window

2. **Check Deployment Status**
   - Vercel Dashboard → Deployments
   - Ensure latest deployment is "Ready" (green checkmark)

3. **Check Root Directory**
   - Vercel Dashboard → Settings → General
   - Root Directory should be: `studyspot-student-pwa`
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Check Git Connection**
   - Vercel Dashboard → Settings → Git
   - Ensure connected to correct repository and branch

---

## 📝 Current Changes That Need Deployment

The following fixes are in the latest commit:
- ✅ Login response validation fixes
- ✅ SDK error handling improvements
- ✅ VITE_AUTH_URL added to vercel.json

**Commit:** `8e57461e` - "config: add VITE_AUTH_URL to Vercel configuration"

---

## 🚀 Quick Command (If CLI is Set Up)

```powershell
cd studyspot-student-pwa
vercel --prod --force
```

---

**Need Help?** Check Vercel deployment logs for specific errors.


