# 📱 DEPLOY STUDENT PWA - QUICK GUIDE

## 🎯 **Deploy the Student Portal (PWA)**

**Location:** `studyspot-pwa/`  
**Technology:** React + Vite + PWA  
**Deploy to:** Vercel  
**Time:** 15 minutes

---

## 🚀 **DEPLOYMENT STEPS**

### **STEP 1: GO TO VERCEL**

1. Open: https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Select: `instituteofexcellence2022-code/studyspot`

---

### **STEP 2: CONFIGURE PROJECT**

```
Project Name:        studyspot-student
Framework Preset:    Vite
Root Directory:      studyspot-pwa
Build Command:       npm run build
Output Directory:    dist
Install Command:     npm install
Node Version:        18.x
```

---

### **STEP 3: ADD ENVIRONMENT VARIABLES**

Add these variables:

```
VITE_API_BASE_URL=https://studyspot-api.onrender.com/api/v1
VITE_APP_NAME=StudySpot
VITE_APP_VERSION=1.0.0
```

---

### **STEP 4: DEPLOY**

1. Click **"Deploy"**
2. Wait 3-5 minutes
3. Get URL: `https://studyspot-student.vercel.app`

---

### **STEP 5: UPDATE BACKEND CORS**

Add the new URL to backend CORS:

```env
CORS_ORIGIN=https://studyspot-admin-2.vercel.app,https://studyspot-rose.vercel.app,https://studyspot-student.vercel.app,http://localhost:3000,http://localhost:3002
```

---

### **STEP 6: TEST**

1. Visit: `https://studyspot-student.vercel.app`
2. Test student login/registration
3. Test library search
4. Test booking creation

---

## ✅ **AFTER THIS, YOU'LL HAVE:**

**3 Live Portals:**
```
✅ Admin:   https://studyspot-admin-2.vercel.app
✅ Owner:   https://studyspot-rose.vercel.app
✅ Student: https://studyspot-student.vercel.app
```

**All connected to:**
```
Backend: https://studyspot-api.onrender.com
```

---

**Ready to deploy?** Follow the steps above! 🚀

