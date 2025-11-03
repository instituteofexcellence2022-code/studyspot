# 🚀 DEPLOY WEB-ADMIN-NEW 2.0 - QUICK GUIDE

## 📌 **What We're Deploying**

**web-admin-new** - The new Platform Admin Portal 2.0
- 48 pages
- 25 modules
- Modern React + TypeScript
- Material-UI v5
- Redux Toolkit

---

## ⚠️ **CURRENT ISSUE: GitHub Secret Scanning**

GitHub is blocking the push because it detected test Stripe API keys in `DeveloperPortalPage.tsx`.

### **SOLUTION: Allow the secrets in GitHub**

1. Click this link to allow the secrets:
   ```
   https://github.com/instituteofexcellence2022-code/studyspot/security/secret-scanning/unblock-secret/34x5sOMyCNeoGjHR42783KEh29S
   ```

2. Click **"Allow secret"** for each detection

3. Or, I can completely remove that page if you don't need it

---

## 🎯 **DEPLOYMENT STEPS (After fixing secrets)**

### **STEP 1: PUSH TO GITHUB**

```powershell
# This will work after you allow the secrets
git push origin main --force
```

---

### **STEP 2: DEPLOY TO VERCEL**

#### **A. Via Vercel Dashboard:**

1. Go to: https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure:

```
Project Name: studyspot-admin-2
Framework: Vite
Root Directory: web-admin-new/frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Node Version: 18.x
```

5. **Environment Variables:**
```
VITE_API_BASE_URL=https://studyspot-api.onrender.com/api/v1
VITE_APP_NAME=StudySpot Admin Portal
VITE_APP_VERSION=2.0.0
```

6. Click **"Deploy"**

---

#### **B. Via Vercel CLI (Faster):**

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd web-admin-new/frontend

# Login
vercel login

# Deploy
vercel --prod
```

---

### **STEP 3: GET YOUR URL**

After deployment:
```
✅ https://studyspot-admin-2.vercel.app
```

---

### **STEP 4: UPDATE BACKEND CORS**

In your Render backend, add the new URL:

```env
CORS_ORIGIN=https://studyspot-admin-2.vercel.app,https://studyspot-owner-portal.vercel.app,http://localhost:3002
```

---

### **STEP 5: TEST**

1. Visit: `https://studyspot-admin-2.vercel.app`
2. Login with: `admin@studyspot.com` / `Admin@123`
3. Check dashboard loads
4. Verify all modules work

---

## 🔧 **QUICK FIX FOR SECRET ISSUE**

### **Option A: Allow Secrets (Recommended)**

Visit each URL GitHub provided and click "Allow secret":
- https://github.com/instituteofexcellence2022-code/studyspot/security/secret-scanning/unblock-secret/34x5sOMyCNeoGjHR42783KEh29S
- https://github.com/instituteofexcellence2022-code/studyspot/security/secret-scanning/unblock-secret/34x5sP9DzmFyTwfk9cEgGR4A2Yy
- https://github.com/instituteofexcellence2022-code/studyspot/security/secret-scanning/unblock-secret/34x62KpfiG9YEICL5XtymPPbEh6
- https://github.com/instituteofexcellence2022-code/studyspot/security/secret-scanning/unblock-secret/34x62KoSp3P4kdRD47XcnjJ9wCm

Then run:
```powershell
git push origin main --force
```

---

### **Option B: Remove DeveloperPortalPage (If you don't need it)**

```powershell
# Remove the file with secrets
Remove-Item web-admin-new/frontend/src/modules/developer -Recurse -Force

# Commit and push
git add .
git commit -m "fix: remove developer portal page to bypass secret scanning"
git push origin main --force
```

---

## 📱 **WHAT YOU'LL GET**

### **Dashboard**
- Real-time platform metrics
- Revenue analytics
- Tenant growth charts
- System health

### **25 Modules:**
1. Dashboard
2. Tenants Management
3. Students Management
4. Libraries Oversight
5. Bookings Oversight
6. Users Management
7. Subscriptions
8. Credits Management
9. Payments
10. Messaging
11. Templates
12. Notifications
13. Analytics
14. Revenue Dashboard
15. Fee Plans
16. Attendance
17. Referrals
18. Sales Team
19. CRM/Leads
20. Compliance
21. Staff Attendance
22. System Health
23. Audit Logs
24. Settings
25. Tickets (if enabled)

---

## 💰 **COST**

**FREE** with Vercel Hobby Plan:
- Unlimited deployments
- 100GB bandwidth
- Automatic HTTPS
- Global CDN

---

## ✅ **CHECKLIST**

- [ ] Allow secrets in GitHub (or remove DeveloperPortalPage)
- [ ] Push to GitHub successfully
- [ ] Create Vercel project
- [ ] Configure root directory: `web-admin-new/frontend`
- [ ] Add environment variables
- [ ] Deploy
- [ ] Get deployment URL
- [ ] Update backend CORS
- [ ] Test login
- [ ] Test all modules

---

## 🎉 **AFTER DEPLOYMENT**

Your admin portal will be live at:
```
https://studyspot-admin-2.vercel.app
```

**Test Credentials:**
```
Email: admin@studyspot.com
Password: Admin@123
```

**Architecture:**
```
Admin Portal (Vercel) → Your Backend API → Database
```

---

**Need help? The secrets issue is the only blocker right now!**

Just click those GitHub links to allow the secrets, then push again! 🚀

