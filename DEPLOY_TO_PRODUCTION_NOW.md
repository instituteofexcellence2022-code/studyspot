# 🚀 DEPLOY TO PRODUCTION - STEP BY STEP

**Date:** November 4, 2025  
**Goal:** Deploy both portals for real user testing

---

## 📊 **CURRENT STATUS:**

| Service | Local | Production | Status |
|---------|-------|------------|--------|
| Backend API | N/A | ✅ https://studyspot-api.onrender.com | LIVE |
| Owner Portal | ✅ localhost:3000 | ❌ Not deployed | LOCAL ONLY |
| Student PWA | ⚠️ Port conflict | ❌ Not deployed | LOCAL ONLY |

---

## 🎯 **GOAL:**

Get these URLs for real users:
```
✅ Backend: https://studyspot-api.onrender.com (already live!)
⏱️ Owner: https://studyspot-owner.vercel.app (need to deploy)
⏱️ Student: https://studyspot-student.vercel.app (need to deploy)
```

---

## 🚀 **DEPLOYMENT STEPS:**

### **Step 1: Install Vercel CLI** (if not installed)

```bash
npm install -g vercel
```

### **Step 2: Login to Vercel**

```bash
vercel login
```

### **Step 3: Deploy Owner Portal**

```bash
cd web-owner
vercel --prod
```

**Follow prompts:**
```
? Set up and deploy "~/web-owner"? [Y/n] Y
? Which scope? [Your account]
? Link to existing project? [y/N] N
? What's your project's name? studyspot-owner-portal
? In which directory is your code located? ./
? Want to override the settings? [y/N] N
```

**Result:**
```
✅ Production: https://studyspot-owner-portal-xxxxx.vercel.app
```

### **Step 4: Deploy Student PWA**

```bash
cd ../studyspot-student-pwa
vercel --prod
```

**Follow prompts:**
```
? Set up and deploy "~/studyspot-student-pwa"? [Y/n] Y
? Which scope? [Your account]
? Link to existing project? [y/N] N
? What's your project's name? studyspot-student-pwa
? In which directory is your code located? ./
? Want to override the settings? [y/N] N
```

**Result:**
```
✅ Production: https://studyspot-student-pwa-xxxxx.vercel.app
```

---

## 🔧 **AFTER DEPLOYMENT:**

### **Update Backend CORS**

Add Vercel URLs to backend CORS:

**File:** `backend/src/services/auth-service/index.ts`

```typescript
fastify.register(cors, {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:5173',
    'https://studyspot-owner-portal-xxxxx.vercel.app',  // ← ADD THIS
    'https://studyspot-student-pwa-xxxxx.vercel.app',   // ← ADD THIS
    /\.vercel\.app$/,  // Allow all Vercel domains
  ],
  credentials: true,
});
```

**Then push:**
```bash
cd backend
git add src/services/auth-service/index.ts
git commit -m "feat: add Vercel production URLs to CORS"
git push origin main
```

Render will auto-deploy the update!

---

## ✅ **VERIFICATION:**

### **Check Deployments:**

1. **Owner Portal:**
   - Go to your Vercel URL
   - Try registration
   - Should work with real backend!

2. **Student PWA:**
   - Go to your Vercel URL
   - Try registration
   - Should work with real backend!

3. **Backend:**
   ```bash
   Invoke-WebRequest "https://studyspot-api.onrender.com/health"
   # Should return 200 OK
   ```

---

## 🌍 **SHARE WITH REAL USERS:**

Once deployed, share these URLs:

```
📱 Student App: https://studyspot-student-pwa-xxxxx.vercel.app
🏢 Owner Portal: https://studyspot-owner-portal-xxxxx.vercel.app
```

**Anyone, anywhere can access them!** 🌍

---

## ⚡ **QUICK DEPLOY (All at once):**

```bash
# Deploy Owner Portal
cd web-owner
vercel --prod

# Deploy Student PWA
cd ../studyspot-student-pwa
vercel --prod

# Update CORS
cd ../backend
# Edit auth-service/index.ts (add Vercel URLs)
git add .
git commit -m "feat: add production CORS"
git push origin main
```

**Done! All 3 services live! 🎉**

---

## 🎯 **READY FOR REAL USERS WHEN:**

- [ ] Owner Portal deployed to Vercel
- [ ] Student PWA deployed to Vercel
- [ ] Backend CORS updated
- [ ] All 3 URLs working
- [ ] Registration tested on both portals
- [ ] Login tested on both portals

---

**Deploy now? Let me know and I'll guide you through it! 🚀**


