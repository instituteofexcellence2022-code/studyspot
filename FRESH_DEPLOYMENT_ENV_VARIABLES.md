# 🔧 ENVIRONMENT VARIABLES - FRESH DEPLOYMENT

**Date:** November 4, 2025  
**Purpose:** Complete env vars for all portals

---

## 🌐 **BACKEND API (Render)**

**Service:** studyspot-api  
**Platform:** Render.com

### **Required Environment Variables:**

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-anon-key

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d

# CORS Origins
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:5173,https://studyspot-student.vercel.app,https://studyspot-librarys.vercel.app,https://studyspot-admin-2.vercel.app

# Service Ports
AUTH_SERVICE_PORT=3001
STUDENT_SERVICE_PORT=3002
LIBRARY_SERVICE_PORT=3003
PAYMENT_SERVICE_PORT=3004
API_GATEWAY_PORT=3000

# Environment
NODE_ENV=production
PORT=3000

# Optional (if using)
REDIS_URL=redis://your-redis-url:6379
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

## 📱 **STUDENT PWA (Vercel/Cloudflare)**

**Project:** studyspot-student-pwa  
**Platform:** Vercel or Cloudflare Pages

### **Environment Variables:**

```bash
# API Configuration
VITE_API_URL=https://studyspot-api.onrender.com

# App Configuration
VITE_APP_NAME=StudySpot Student Portal
VITE_APP_VERSION=3.0.0

# Feature Flags
VITE_USE_MOCK=false

# Optional (for debugging)
VITE_DEBUG=false
```

### **Build Settings:**
```
Framework: Vite
Build Command: npm run build
Output Directory: dist
Root Directory: studyspot-student-pwa
Node Version: 18.x or 20.x
```

---

## 🏢 **OWNER PORTAL (Vercel/Cloudflare)**

**Project:** web-owner  
**Platform:** Vercel or Cloudflare Pages

### **Environment Variables:**

```bash
# API Configuration
REACT_APP_API_URL=https://studyspot-api.onrender.com
REACT_APP_API_TIMEOUT=30000

# Portal Configuration
REACT_APP_PORTAL_TYPE=owner
REACT_APP_PORTAL_NAME=Library Owner Portal
REACT_APP_VERSION=1.0.0

# Feature Flags
REACT_APP_ENABLE_DEMO=true
REACT_APP_ENABLE_SOCIAL_LOGIN=false
REACT_APP_USE_MOCK=false

# Debug
REACT_APP_DEBUG=false

# Environment
NODE_ENV=production
```

### **Build Settings:**
```
Framework: Create React App
Build Command: npm run build
Output Directory: build
Root Directory: web-owner
Node Version: 18.x or 20.x
```

---

## 👨‍💼 **ADMIN PORTAL (Vercel/Cloudflare)**

**Project:** web-admin-new/frontend  
**Platform:** Vercel or Cloudflare Pages

### **Environment Variables:**

```bash
# API Configuration
REACT_APP_API_URL=https://studyspot-api.onrender.com
REACT_APP_API_TIMEOUT=30000

# Portal Configuration
REACT_APP_PORTAL_TYPE=admin
REACT_APP_PORTAL_NAME=StudySpot Admin Portal
REACT_APP_VERSION=2.0.0

# Feature Flags
REACT_APP_ENABLE_DEMO=false
REACT_APP_USE_MOCK=false

# Environment
NODE_ENV=production
DISABLE_ESLINT_PLUGIN=true
GENERATE_SOURCEMAP=false
```

### **Build Settings:**
```
Framework: Create React App
Build Command: npm run build
Output Directory: build
Root Directory: web-admin-new/frontend
Node Version: 18.x or 20.x
Install Command: npm install
```

---

## 🚀 **QUICK DEPLOYMENT GUIDE:**

### **Option 1: Vercel (Your Current Platform)**

**For Each Portal:**

1. **Go to Vercel Dashboard**
2. **Import GitHub Repository**
3. **Configure Project:**
   ```
   Project Name: studyspot-student
   Root Directory: studyspot-student-pwa  ← CRITICAL!
   Framework: Vite
   Build Command: npm run build
   Output Directory: dist
   ```
4. **Add Environment Variables** (from above)
5. **Deploy** ✅

**Repeat for:**
- Student PWA (Root: `studyspot-student-pwa`)
- Owner Portal (Root: `web-owner`)
- Admin Portal (Root: `web-admin-new/frontend`)

---

### **Option 2: Cloudflare Pages**

**For Each Portal:**

```bash
# 1. Build locally
cd studyspot-student-pwa
npm run build

# 2. Deploy
npx wrangler pages deploy dist --project-name=studyspot-student

# 3. Set environment variables
# Go to Cloudflare Dashboard → Pages → Your Project → Settings
# Add variables from above
```

---

### **Option 3: Netlify**

**For Each Portal:**

```bash
# 1. Install CLI
npm install -g netlify-cli

# 2. Deploy
cd studyspot-student-pwa
netlify deploy --prod

# Follow prompts, it auto-detects everything!
# No Root Directory issues!
```

---

## 📋 **CRITICAL SETTINGS CHECKLIST:**

### **✅ Must Set Correctly:**

**Student PWA:**
```
✅ Root Directory: studyspot-student-pwa
✅ Build Command: npm run build
✅ Output Directory: dist
✅ VITE_API_URL: https://studyspot-api.onrender.com
```

**Owner Portal:**
```
✅ Root Directory: web-owner
✅ Build Command: npm run build
✅ Output Directory: build
✅ REACT_APP_API_URL: https://studyspot-api.onrender.com
```

**Admin Portal:**
```
✅ Root Directory: web-admin-new/frontend
✅ Build Command: npm run build
✅ Output Directory: build
✅ REACT_APP_API_URL: https://studyspot-api.onrender.com
```

---

## 🔐 **SENSITIVE VALUES (Keep Secret):**

**Backend:**
```
JWT_SECRET: Generate new one for fresh deploy
  → Use: openssl rand -base64 32

DATABASE_URL: From Supabase/PostgreSQL dashboard
SUPABASE_KEY: From Supabase dashboard
```

---

## 📊 **COMPLETE ENV FILES:**

### **Create These Locally:**

**`studyspot-student-pwa/.env.production`:**
```bash
VITE_API_URL=https://studyspot-api.onrender.com
VITE_USE_MOCK=false
VITE_APP_NAME=StudySpot Student Portal
VITE_APP_VERSION=3.0.0
```

**`web-owner/.env.production`:**
```bash
REACT_APP_API_URL=https://studyspot-api.onrender.com
REACT_APP_USE_MOCK=false
REACT_APP_PORTAL_TYPE=owner
REACT_APP_DEBUG=false
NODE_ENV=production
```

**`web-admin-new/frontend/.env.production`:**
```bash
REACT_APP_API_URL=https://studyspot-api.onrender.com
REACT_APP_PORTAL_TYPE=admin
NODE_ENV=production
DISABLE_ESLINT_PLUGIN=true
```

---

## 🎯 **COPY-PASTE READY:**

### **For Vercel Dashboard:**

**Student PWA Environment Variables:**
```
VITE_API_URL = https://studyspot-api.onrender.com
VITE_USE_MOCK = false
VITE_APP_NAME = StudySpot Student Portal
VITE_APP_VERSION = 3.0.0
```

**Owner Portal Environment Variables:**
```
REACT_APP_API_URL = https://studyspot-api.onrender.com
REACT_APP_USE_MOCK = false
REACT_APP_PORTAL_TYPE = owner
REACT_APP_PORTAL_NAME = Library Owner Portal
REACT_APP_VERSION = 1.0.0
REACT_APP_DEBUG = false
NODE_ENV = production
```

**Admin Portal Environment Variables:**
```
REACT_APP_API_URL = https://studyspot-api.onrender.com
REACT_APP_PORTAL_TYPE = admin
REACT_APP_PORTAL_NAME = StudySpot Admin Portal
REACT_APP_VERSION = 2.0.0
NODE_ENV = production
DISABLE_ESLINT_PLUGIN = true
```

---

## ✅ **READY FOR FRESH DEPLOYMENT!**

**You now have:**
- ✅ All environment variables
- ✅ Build settings
- ✅ Root directories
- ✅ Framework presets
- ✅ Copy-paste ready!

**Deploy to any platform you choose!** 🚀

Check `FRESH_DEPLOYMENT_ENV_VARIABLES.md` for full guide!


