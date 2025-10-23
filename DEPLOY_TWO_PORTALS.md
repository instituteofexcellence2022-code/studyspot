# 🚀 Deploy Two Separate Portals - Step by Step

## 🎯 What You're Deploying:

**Portal 1: Library Portal** (for library owners/staff)
- Manage their own library
- View/manage bookings
- Staff management
- Library-specific analytics

**Portal 2: Admin Portal** (for platform management)
- Manage all tenants
- Platform-wide analytics
- System administration
- Audit logs

**Same Code, Different Configs!**

---

## ✅ PREPARATION COMPLETE

I've already configured your code to support both portals using the `REACT_APP_PORTAL_MODE` environment variable.

---

## 📋 DEPLOYMENT STEPS

### **PORTAL 1: LIBRARY PORTAL** (Deploy First)

#### Step 1: Go to Vercel
- URL: https://vercel.com/dashboard
- Make sure you're logged in

#### Step 2: Import Project AGAIN
1. Click **"Add New..."** → **"Project"**
2. Find **"studyspot"** repository
3. Click **"Import"** (yes, again!)

#### Step 3: Configure Library Portal
**Project Name:**
```
studyspot-library
```

**Framework Preset:** Create React App (auto-detected)

**Root Directory:** 
- Click **"Edit"**
- Type: `web`
- Click **"Continue"**

**Environment Variables:** Click **"Add"**

**Variable 1:**
```
NAME: REACT_APP_API_URL
VALUE: https://studyspot-api.onrender.com
```

**Variable 2:**
```
NAME: REACT_APP_PORTAL_MODE
VALUE: library
```

**Variable 3:**
```
NAME: REACT_APP_NAME
VALUE: StudySpot - Library Portal
```

#### Step 4: Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes
3. You'll get: `https://studyspot-library.vercel.app`

---

### **PORTAL 2: ADMIN PORTAL** (Deploy Second)

#### Step 1: Import Project AGAIN
1. Still on Vercel dashboard
2. Click **"Add New..."** → **"Project"**
3. Find **"studyspot"** repository
4. Click **"Import"** (third time!)

#### Step 2: Configure Admin Portal
**Project Name:**
```
studyspot-admin
```

**Framework Preset:** Create React App (auto-detected)

**Root Directory:**
- Click **"Edit"**
- Type: `web`
- Click **"Continue"**

**Environment Variables:** Click **"Add"**

**Variable 1:**
```
NAME: REACT_APP_API_URL
VALUE: https://studyspot-api.onrender.com
```

**Variable 2:**
```
NAME: REACT_APP_PORTAL_MODE
VALUE: admin
```

**Variable 3:**
```
NAME: REACT_APP_NAME
VALUE: StudySpot - Admin Portal
```

#### Step 3: Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes
3. You'll get: `https://studyspot-admin.vercel.app`

---

## 🎨 WHAT'S DIFFERENT BETWEEN THE TWO?

### Library Portal (`PORTAL_MODE=library`)
**Shows:**
- ✅ Dashboard (library-specific)
- ✅ My Library management
- ✅ Bookings for my library
- ✅ My staff/users
- ✅ My analytics
- ✅ Settings for my library
- ✅ Subscription management
- ✅ Credits/billing

**Hides:**
- ❌ Platform admin pages
- ❌ Tenant management (all tenants)
- ❌ System-wide analytics
- ❌ Audit logs
- ❌ Role management (platform-level)

### Admin Portal (`PORTAL_MODE=admin`)
**Shows:**
- ✅ Platform dashboard
- ✅ All tenants management
- ✅ All libraries view
- ✅ Platform-wide analytics
- ✅ System monitoring
- ✅ Audit logs
- ✅ Role management
- ✅ Security settings

**Hides:**
- ❌ Individual library operations
- ❌ Booking management (for one library)
- ❌ Library-specific features

---

## 🔐 CORS UPDATE NEEDED

After deploying both portals, update CORS in Render to allow both:

1. Go to: https://dashboard.render.com
2. Click: **studyspot-api**
3. Click: **Environment** tab
4. Find: **CORS_ORIGIN**
5. Change value to:
```
https://studyspot-rose.vercel.app,https://studyspot-library.vercel.app,https://studyspot-admin.vercel.app
```
(comma-separated, no spaces!)

6. Click **"Save Changes"**

---

## 🧪 TESTING AFTER DEPLOYMENT

### Test Library Portal:
1. Go to: `https://studyspot-library.vercel.app`
2. Login as library owner
3. Should see: Dashboard, My Library, Bookings
4. Should NOT see: Admin menu, Tenant management

### Test Admin Portal:
1. Go to: `https://studyspot-admin.vercel.app`
2. Login as super admin
3. Should see: Admin dashboard, All tenants, Platform analytics
4. Should NOT see: Individual library booking features

---

## 📊 FINAL ARCHITECTURE

```
┌──────────────────────────────────────────┐
│   Library Owners/Staff                   │
│   https://studyspot-library.vercel.app   │
│   (PORTAL_MODE=library)                  │
└────────────────┬─────────────────────────┘
                 │
                 ▼
         ┌───────────────┐
         │   Backend API │
         │   (Render)    │
         └───────┬───────┘
                 ▲
                 │
┌────────────────┴─────────────────────────┐
│   Platform Admins (You)                  │
│   https://studyspot-admin.vercel.app     │
│   (PORTAL_MODE=admin)                    │
└──────────────────────────────────────────┘
```

---

## 💡 TIPS

1. **Bookmark Both URLs:**
   - Library Portal: For daily library management
   - Admin Portal: For platform administration

2. **Different Logins:**
   - Library Portal: Library owner/staff accounts
   - Admin Portal: Super admin account

3. **Independent Updates:**
   - Both deploy from same GitHub repo
   - Changes to code update both automatically
   - Environment variables control behavior

---

## 🎯 SUCCESS CRITERIA

✅ Library Portal deployed at custom URL  
✅ Admin Portal deployed at custom URL  
✅ Both can access the backend API  
✅ CORS allows both domains  
✅ Library portal shows library features only  
✅ Admin portal shows admin features only  

---

## 💬 READY TO DEPLOY?

Follow the steps above. Tell me:
- ✅ "library deployed" - When Portal 1 is live
- ✅ "admin deployed" - When Portal 2 is live
- ❓ "stuck" - If you need help at any step

Let's get both portals live! 🚀








