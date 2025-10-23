# 🌐 Deploy Frontend to Vercel

## ⚠️ Prerequisites

**Before deploying frontend:**
- ✅ API must be deployed to Render first
- ✅ You need your API URL (e.g., `https://studyspot-api.onrender.com`)

---

## Step 1: Go to Vercel Dashboard

1. Open your browser
2. Go to: **https://vercel.com/dashboard**
3. Sign in (use GitHub for easier setup)

---

## Step 2: Import Project

1. Click **"Add New..."** (top right)
2. Select **"Project"**
3. You'll see "Import Git Repository"

---

## Step 3: Connect Repository

### Option A: If you see `studyspot` repository
- Click **"Import"** next to it

### Option B: If you don't see it
1. Click **"Adjust GitHub App Permissions"**
2. Give Vercel access to your repositories
3. Select `studyspot`
4. Click **"Import"**

---

## Step 4: Configure Build Settings

Vercel will auto-detect Create React App, but verify:

### Framework Preset
```
Create React App ✅ (auto-detected)
```

### Root Directory
```
web
```
**Click "Edit"** next to Root Directory and type: `web`

### Build & Development Settings
```
Build Command: npm run build (default, leave as is)
Output Directory: build (default, leave as is)
Install Command: npm install (default, leave as is)
```

---

## Step 5: Add Environment Variable

This is critical! 🔑

1. Click **"Environment Variables"** section
2. Add this variable:

```
Key: REACT_APP_API_URL
Value: <YOUR RENDER API URL>
```

**Example:**
```
REACT_APP_API_URL = https://studyspot-api-xxxxx.onrender.com
```

⚠️ **Important:** 
- Use YOUR actual Render URL (from Step 1)
- Do NOT include `/health` or any path
- Do NOT add a trailing slash `/`
- Just the base URL

---

## Step 6: Deploy!

1. Click **"Deploy"**
2. Vercel will:
   - Clone your repository
   - Install dependencies
   - Build your React app
   - Deploy to CDN

**This takes 2-3 minutes** ⏱️

---

## Step 7: Test Your Deployment

Once deployed:

1. Vercel will show your URL (e.g., `https://studyspot-xxxxx.vercel.app`)
2. Click **"Visit"** to open your site
3. You should see the login page

---

## Step 8: Test Features

### Test 1: Registration
1. Click **"Register"** or **"Sign Up"**
2. Fill in:
   - Name: Test User
   - Email: test@example.com
   - Password: Test123!
3. Click Submit
4. ✅ Should create account

### Test 2: Login
1. Go to login page
2. Use credentials from above
3. Click Login
4. ✅ Should redirect to dashboard

### Test 3: Navigation
1. Check if you can navigate between pages
2. Try accessing features
3. ✅ Should work smoothly

---

## ✅ Success Indicators

Your frontend is working if:

- ✅ Website loads without errors
- ✅ Login page appears
- ✅ You can register a new account
- ✅ You can login successfully
- ✅ Dashboard loads after login
- ✅ Navigation works
- ✅ No console errors (press F12 to check)

---

## 🔧 Troubleshooting

### ❌ Build Failed
**Check:**
- Build logs in Vercel dashboard
- Make sure Root Directory = `web`
- Verify package.json exists in web folder

**Fix:**
- Check error message in logs
- Usually a missing dependency or syntax error
- Fix in your code, push to GitHub, auto-redeploys

---

### ❌ Site Loads but Can't Connect to API

**Symptoms:**
- Login fails
- "Network Error" messages
- Console shows CORS errors

**Fix:**
1. Verify `REACT_APP_API_URL` is set correctly
2. Check API is actually live (visit health endpoint)
3. Make sure API URL has no trailing slash
4. Redeploy frontend after fixing env var

**How to update env var:**
1. Go to Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Edit `REACT_APP_API_URL`
5. Redeploy (Deployments → three dots → Redeploy)

---

### ❌ Page Loads but Shows Errors

**Check browser console (F12):**

**Common errors:**

1. **"Failed to fetch"**
   - API not responding
   - Wrong API URL
   - CORS issue

2. **"Cannot read property 'map' of undefined"**
   - API not returning expected data
   - Check API endpoints are working

3. **"401 Unauthorized"**
   - JWT token issue
   - Try logging out and back in

---

## 📊 Deployment Info

### Auto-Deploy
✅ Vercel automatically redeploys when you push to GitHub!

**To trigger redeployment:**
1. Make changes to code
2. Commit and push to GitHub
3. Vercel auto-detects and redeploys

### Custom Domain (Optional)
You can add your own domain later:
1. Go to Project Settings
2. Domains tab
3. Add your domain
4. Follow DNS instructions

---

## 🎯 Deployment Checklist

**Pre-deployment:**
- [ ] API deployed to Render ✅
- [ ] API health check works ✅
- [ ] API URL copied ✅

**Vercel Setup:**
- [ ] Logged into Vercel
- [ ] Repository imported
- [ ] Root directory set to `web`
- [ ] Build settings verified
- [ ] Environment variable added (`REACT_APP_API_URL`)

**Post-deployment:**
- [ ] Build successful
- [ ] Site is live
- [ ] Can access website
- [ ] Can register account
- [ ] Can login
- [ ] Dashboard works
- [ ] No console errors

---

## 🎉 When Everything Works

**You should have:**

1. **Live API:** `https://studyspot-api-xxxxx.onrender.com`
2. **Live Frontend:** `https://studyspot-xxxxx.vercel.app`
3. **Working Features:**
   - ✅ User registration
   - ✅ User login
   - ✅ Dashboard
   - ✅ All pages loading

---

## 📱 Bonus: Mobile App

After web deployment, you can also:

1. Test mobile app with your live API
2. Update `mobile/.env`:
   ```
   API_URL=https://studyspot-api-xxxxx.onrender.com
   ```
3. Test on emulator/device

---

## 🚀 Next Steps After Deployment

1. **Test thoroughly** - Try all features
2. **Monitor logs** - Check Render and Vercel logs
3. **Set up monitoring** - Consider tools like Better Stack
4. **Add custom domain** (optional)
5. **Share with users!** 🎊

---

## 📞 Need Help?

**Vercel Documentation:**
- https://vercel.com/docs

**Common Issues:**
- Check Vercel deployment logs
- Verify environment variables
- Test API independently
- Check browser console for frontend errors

---

**🎯 Ready?**

1. Make sure your API is deployed ✅
2. Get your API URL ready
3. Go to: https://vercel.com/dashboard
4. Follow the steps above!

**Good luck!** 🌟

---

*Deployment usually takes 2-3 minutes. Be patient and watch the build logs!*








