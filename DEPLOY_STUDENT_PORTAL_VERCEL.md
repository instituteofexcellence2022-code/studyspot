# 🚀 DEPLOY STUDENT PORTAL TO VERCEL - STEP BY STEP

**Date**: November 3, 2025  
**Portal**: `/web` - Student Portal  
**Target**: Vercel Deployment

---

## ✅ **PREPARATION COMPLETE**

I've created:
- ✅ `web/vercel.json` - Vercel configuration
- ✅ `web/.env.local` - Environment variables
- ✅ Backend API configured: `https://studyspot-api.onrender.com`
- ✅ All code pushed to GitHub

---

## 📋 **DEPLOYMENT STEPS - FOLLOW THESE:**

### **Step 1: Go to Vercel**
1. Open browser
2. Go to: https://vercel.com
3. Click **"Log in"** (use GitHub account)

---

### **Step 2: Import Project**
1. Click **"Add New..."** → **"Project"**
2. Select **"Import Git Repository"**
3. Find: `instituteofexcellence2022-code/studyspot`
4. Click **"Import"**

---

### **Step 3: Configure Project**
**Project Settings:**
- **Framework Preset:** Create React App
- **Root Directory:** `web`  ← **IMPORTANT!**
- **Build Command:** `npm run build`
- **Output Directory:** `build`
- **Install Command:** `npm install`

---

### **Step 4: Environment Variables**
Click **"Environment Variables"** and add:

| Name | Value |
|------|-------|
| `REACT_APP_API_URL` | `https://studyspot-api.onrender.com` |
| `REACT_APP_PORTAL_MODE` | `student` |
| `REACT_APP_PORTAL_NAME` | `StudySpot Student Portal` |
| `NODE_ENV` | `production` |

---

### **Step 5: Deploy**
1. Click **"Deploy"**
2. Wait 2-3 minutes for build
3. Done! 🎉

---

## 🌐 **YOUR PORTALS WILL BE:**

| Portal | Current URL | New URL (after deploy) |
|--------|-------------|------------------------|
| **Admin** | https://studyspot-admin-2.vercel.app | ✅ Live |
| **Owner** | https://studyspot-librarys.vercel.app | ✅ Live |
| **Student** | Not deployed yet | 🟡 Will be: `https://studyspot-student.vercel.app` |

---

## ⚙️ **ALTERNATE METHOD - VERCEL CLI**

If you have Vercel CLI installed:

```bash
cd web
vercel --prod
```

Follow prompts and deploy immediately!

---

## 🎯 **PROJECT NAME SUGGESTION**

When Vercel asks for project name, use:
- `studyspot-student`
- or `studyspot-web`
- or `studyspot-students`

---

## ✅ **AFTER DEPLOYMENT**

You'll get a URL like:
```
https://studyspot-student-xxxxx.vercel.app
```

Test these features:
1. Login page loads
2. Register works
3. Dashboard shows
4. Navigation menu has 6 items
5. Libraries page
6. Bookings page
7. AI Assistant
8. Subscriptions

---

## 🔧 **IF BUILD FAILS**

Common issues:
1. **Wrong root directory** → Make sure it's `web` not root
2. **Missing env vars** → Add all 4 environment variables
3. **Framework preset** → Should be "Create React App"

---

## 📱 **ALL 3 PORTALS COMPLETE!**

After this deployment:
- ✅ Admin Portal (web-admin-new)
- ✅ Owner Portal (web-owner)  
- ✅ Student Portal (web) ← Deploying now!

**All three portals will be LIVE!** 🎉

---

## 🚀 **GO TO VERCEL NOW!**

1. Open: https://vercel.com/login
2. Login with GitHub
3. Follow steps above
4. Deploy!

**It takes just 5 minutes!** ⏱️

Let me know when you're at Vercel and I'll guide you through each step! 🚀

