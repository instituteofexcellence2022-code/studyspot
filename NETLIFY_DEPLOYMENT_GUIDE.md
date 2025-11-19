# 🚀 Netlify Deployment Guide - Student Portal

## ✅ Configuration Updated

The `netlify.toml` has been updated with:
- ✅ Correct build command for monorepo
- ✅ `VITE_AUTH_URL` environment variable added
- ✅ Proper base directory and publish path

---

## 📋 Deployment Steps

### Option 1: Deploy via Netlify Dashboard (Recommended)

1. **Go to Netlify Dashboard**
   - Visit: https://app.netlify.com
   - Login to your account

2. **Find Your Site**
   - Look for your existing `studyspot-student-pwa` site
   - Or create a new site if needed

3. **Update Site Settings**
   - Go to **Site settings** → **Build & deploy**
   - **Base directory**: Leave empty (or set to `.`)
   - **Build command**: `cd studyspot-student-pwa && npm install --legacy-peer-deps && npm run build`
   - **Publish directory**: `studyspot-student-pwa/dist`

4. **Set Environment Variables**
   - Go to **Site settings** → **Environment variables**
   - Add/Update these:
     ```
     VITE_API_URL=https://studyspot-api.onrender.com
     VITE_AUTH_URL=https://studyspot-auth.onrender.com
     VITE_APP_NAME=StudySpot Student Portal
     VITE_APP_VERSION=4.0.0
     VITE_USE_MOCK=false
     NODE_VERSION=18
     ```

5. **Trigger Deploy**
   - Go to **Deploys** tab
   - Click **"Trigger deploy"** → **"Deploy site"**
   - Or push to GitHub (if auto-deploy is enabled)

---

### Option 2: Deploy via Netlify CLI

1. **Install Netlify CLI** (if not installed)
   ```powershell
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```powershell
   netlify login
   ```

3. **Link to Existing Site** (or create new)
   ```powershell
   cd studyspot-student-pwa
   netlify link
   ```
   - Follow prompts to link to your existing site

4. **Deploy**
   ```powershell
   netlify deploy --prod
   ```

---

## 🔧 Netlify Configuration

The `netlify.toml` file is configured with:

```toml
[build]
  base = "."
  command = "cd studyspot-student-pwa && npm install --legacy-peer-deps && npm run build"
  publish = "studyspot-student-pwa/dist"

[build.environment]
  VITE_API_URL = "https://studyspot-api.onrender.com"
  VITE_AUTH_URL = "https://studyspot-auth.onrender.com"
  VITE_USE_MOCK = "false"
  VITE_APP_NAME = "StudySpot Student Portal"
  VITE_APP_VERSION = "4.0.0"
  NODE_VERSION = "18"
```

---

## ✅ Verify Deployment

After deployment:

1. **Check Build Logs**
   - Netlify Dashboard → Deploys → Latest deploy
   - Look for "Build successful" ✅

2. **Test the Site**
   - Visit your Netlify URL (e.g., `https://studyspot-student.netlify.app`)
   - Try logging in with:
     - Email: `demo@studyspot.com`
     - Password: `Demo@123`

3. **Check Browser Console**
   - Open Developer Tools (F12)
   - Look for any errors
   - Verify `[StudySpot SDK]` logs appear

---

## 🐛 Troubleshooting

### Build Fails with "vite: command not found"
- **Solution**: The build command installs dependencies first, so this shouldn't happen
- If it does, check that `base` directory is set correctly

### Build Fails with Dependency Conflicts
- **Solution**: The `--legacy-peer-deps` flag should handle this
- If issues persist, check Netlify build logs for specific errors

### Site Shows Old Code
- **Solution**: 
  1. Clear Netlify cache: Site settings → Build & deploy → Clear cache and retry deploy
  2. Hard refresh browser: `Ctrl + Shift + R`

---

## 📝 Current Status

- ✅ `netlify.toml` updated with correct configuration
- ✅ `VITE_AUTH_URL` added to environment variables
- ✅ Build command handles monorepo structure
- ✅ All fixes pushed to GitHub

**Ready to deploy!** 🚀


