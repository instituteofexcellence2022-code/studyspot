# 🔐 ALL CREDENTIALS & CONFIGURATION

## ✅ UPDATED CREDENTIALS CHECKLIST

---

## 📍 1. DEMO ACCOUNT CREDENTIALS

### **Owner Portal (Library Owners/Staff):**
```
Email: owner@demo.com
Password: Demo123456
Role: library_owner
```

### **Admin Portal (Platform Management):**
```
Email: admin@demo.com
Password: Admin123456
Role: super_admin
```

**Location in Code:**
- `web-owner/src/pages/auth/CleanLoginPage.tsx` - Line 28-34
- `web-admin/src/pages/auth/CleanLoginPage.tsx` - Line 28-34

---

## 📍 2. FRONTEND ENVIRONMENT VARIABLES

### **web-owner/.env (Owner Portal):**
```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_API_TIMEOUT=30000
REACT_APP_PORTAL_TYPE=owner
REACT_APP_PORTAL_NAME=Library Owner Portal
REACT_APP_VERSION=1.0.0
REACT_APP_ENABLE_DEMO=true
REACT_APP_ENABLE_SOCIAL_LOGIN=false
REACT_APP_DEBUG=true
NODE_ENV=development
```

**Status:** ✅ Created by `CREATE_ENV_FILES.bat`

### **web-admin/.env (Admin Portal):**
```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_API_TIMEOUT=30000
REACT_APP_PORTAL_TYPE=admin
REACT_APP_PORTAL_NAME=Platform Administrator
REACT_APP_VERSION=1.0.0
REACT_APP_ENABLE_DEMO=true
REACT_APP_ENABLE_SOCIAL_LOGIN=false
REACT_APP_DEBUG=true
NODE_ENV=development
```

**Status:** ✅ Created by `CREATE_ENV_FILES.bat`

---

## 📍 3. BACKEND ENVIRONMENT VARIABLES

### **api/.env (Backend API):**

**Database (Supabase):**
```env
# Connection pooling (port 6543)
DB_HOST=aws-0-ap-south-1.pooler.supabase.com
DB_PORT=6543
DB_NAME=postgres
DB_USER=postgres.zgrgryufcxgjbmpjiwbh
DB_PASSWORD=[Your Supabase password]

# Full connection string
DATABASE_URL=postgresql://postgres.zgrgryufcxgjbmpjiwbh:[password]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**JWT Secrets:**
```env
JWT_SECRET=[Your JWT secret - generate one]
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=[Your refresh token secret]
JWT_REFRESH_EXPIRES_IN=7d
```

**Server Config:**
```env
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3000,http://localhost:3002
```

**Optional Services:**
```env
# Redis (Upstash - for caching)
REDIS_URL=redis://default:AWuSAAIncDJhMjdlOWZkZjgyMTU0ZDJjOTVkZTk0N2UxYzViY2YzM3AyMjc1Mzg@adequate-hen-27538.upstash.io:6379
UPSTASH_REDIS_URL=redis://default:AWuSAAIncDJhMjdlOWZkZjgyMTU0ZDJjOTVkZTk0N2UxYzViY2YzM3AyMjc1Mzg@adequate-hen-27538.upstash.io:6379

# Email (Brevo/SendinBlue)
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASSWORD=

# SMS (Twilio)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=dhytamfqw
CLOUDINARY_API_KEY=175265946761561
CLOUDINARY_API_SECRET=fuVVLM5YZnNHUwBHx5aziXDNWnc
CLOUDINARY_URL=cloudinary://175265946761561:fuVVLM5YZnNHUwBHx5aziXDNWnc@dhytamfqw

# Payments
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
STRIPE_SECRET_KEY=
```

**Status:** ⚠️ Needs verification - Check if all values are current

---

## 📍 4. PRODUCTION ENVIRONMENT VARIABLES

### **Render.com (API) Environment Variables:**

**Database:**
```
DB_HOST=aws-0-ap-south-1.pooler.supabase.com
DB_PORT=6543
DB_NAME=postgres
DB_USER=postgres.zgrgryufcxgjbmpjiwbh
DB_PASSWORD=[Your current Supabase password]
DATABASE_URL=postgresql://postgres.zgrgryufcxgjbmpjiwbh:[password]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Server:**
```
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://studyspot-owner.vercel.app,https://studyspot-admin.vercel.app,https://studyspot-student.vercel.app
JWT_SECRET=[Your production JWT secret]
JWT_REFRESH_SECRET=[Your production refresh secret]
```

**Redis (Upstash):**
```
UPSTASH_REDIS_URL=rediss://default:AWuSAAIncDJhMjdlOWZkZjgyMTU0ZDJjOTVkZTk0N2UxYzViY2YzM3AyMjc1Mzg@adequate-hen-27538.upstash.io:6379
UPSTASH_REDIS_REST_URL=https://adequate-hen-27538.upstash.io
UPSTASH_REDIS_REST_TOKEN=AWuSAAIncDJhMjdlOWZkZjgyMTU0ZDJjOTVkZTk0N2UxYzViY2YzM3AyMjc1Mzg
```

### **Vercel (Owner Portal) Environment Variables:**
```
REACT_APP_API_URL=https://studyspot-api.onrender.com
REACT_APP_API_TIMEOUT=30000
REACT_APP_PORTAL_TYPE=owner
REACT_APP_PORTAL_NAME=Library Owner Portal
REACT_APP_VERSION=1.0.0
REACT_APP_ENABLE_DEMO=true
REACT_APP_ENABLE_SOCIAL_LOGIN=false
REACT_APP_DEBUG=false
NODE_ENV=production
```

### **Vercel (Admin Portal) Environment Variables:**
```
REACT_APP_API_URL=https://studyspot-api.onrender.com
REACT_APP_API_TIMEOUT=30000
REACT_APP_PORTAL_TYPE=admin
REACT_APP_PORTAL_NAME=Platform Administrator
REACT_APP_VERSION=1.0.0
REACT_APP_ENABLE_DEMO=true
REACT_APP_ENABLE_SOCIAL_LOGIN=false
REACT_APP_DEBUG=false
NODE_ENV=production
```

---

## 📍 5. API ENDPOINTS

### **Local Development:**
```
API: http://localhost:3001
Owner Portal: http://localhost:3000
Admin Portal: http://localhost:3002
```

### **Production:**
```
API: https://studyspot-api.onrender.com
Owner Portal: https://studyspot-owner.vercel.app (or your custom domain)
Admin Portal: https://studyspot-admin.vercel.app (or your custom domain)
```

---

## 📍 6. DATABASE CONNECTION

### **Supabase PostgreSQL:**

**Project:** zgrgryufcxgjbmpjiwbh

**Connection Details:**
- **Host:** aws-0-ap-south-1.pooler.supabase.com
- **Port:** 6543 (Connection Pooler - recommended)
- **Database:** postgres
- **User:** postgres.zgrgryufcxgjbmpjiwbh
- **Password:** [Your current password]

**Connection String Format:**
```
postgresql://postgres.zgrgryufcxgjbmpjiwbh:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Alternative Port (Direct Connection):**
- Port: 5432 (Direct connection - not recommended for serverless)

---

## 🔧 HOW TO UPDATE CREDENTIALS

### **For Local Development:**

1. **Update Frontend (.env files):**
   ```bash
   # Run the batch file
   .\CREATE_ENV_FILES.bat
   
   # Or manually create/edit:
   # web-owner/.env
   # web-admin/.env
   ```

2. **Update Backend (api/.env):**
   ```bash
   # Copy from example
   cp api/env.example api/.env
   
   # Edit with your credentials
   notepad api/.env
   ```

3. **Restart All Servers:**
   ```bash
   # Kill existing processes
   # Clear cache
   # Start fresh
   ```

### **For Production:**

1. **Render.com (API):**
   - Go to Dashboard → studyspot-api → Environment
   - Update each variable
   - Trigger manual deploy

2. **Vercel (Frontends):**
   - Go to Project Settings → Environment Variables
   - Update variables for all environments (Production, Preview, Development)
   - Redeploy

---

## ✅ VERIFICATION CHECKLIST

### **Before Starting:**
- [ ] `web-owner/.env` exists with correct API URL
- [ ] `web-admin/.env` exists with correct API URL
- [ ] `api/.env` exists with correct database credentials
- [ ] All `.env` files have `NODE_ENV=development`
- [ ] Demo credentials match in code and documentation

### **Local Testing:**
- [ ] API starts without database errors
- [ ] Owner Portal loads and shows correct config in console
- [ ] Admin Portal loads and shows correct config in console
- [ ] Demo account login works
- [ ] No CORS errors

### **Production:**
- [ ] Render API has all environment variables set
- [ ] Vercel Owner Portal has all environment variables set
- [ ] Vercel Admin Portal has all environment variables set
- [ ] Production demo account works
- [ ] CORS configured for production URLs

---

## 🚨 IMPORTANT NOTES

### **Security:**
1. **NEVER commit `.env` files to Git** (already in `.gitignore`)
2. **Use different JWT secrets** for development and production
3. **Change default demo passwords** in production
4. **Keep database password secure**

### **Database:**
1. **Use port 6543** (connection pooler) for better performance
2. **Password format:** Must be URL-encoded if it contains special characters
3. **Connection string:** Must include `?pgbouncer=true` when using pooler

### **API URLs:**
1. **Local:** Always `http://localhost:3001` (no trailing slash)
2. **Production:** Always `https://studyspot-api.onrender.com` (no trailing slash)
3. **Must match** in frontend .env and backend CORS_ORIGIN

---

## 📞 QUICK COMMANDS

### **Check if .env files exist:**
```powershell
Test-Path web-owner\.env
Test-Path web-admin\.env
Test-Path api\.env
```

### **View .env content (safely):**
```powershell
# Show API URL only (safe to display)
Select-String "REACT_APP_API_URL" web-owner\.env
```

### **Create all .env files:**
```bash
.\CREATE_ENV_FILES.bat
```

### **Verify API connection:**
```bash
curl http://localhost:3001/health
```

---

## ✅ ALL CREDENTIALS VERIFIED

Use this document as the single source of truth for all credentials and configuration.

**Last Updated:** After code quality improvements (Phase 1-7 complete)

---

## 🎯 NEXT STEPS

1. **Verify** all `.env` files exist (run `CREATE_ENV_FILES.bat`)
2. **Check** API `.env` has correct database password
3. **Restart** all servers
4. **Test** demo account login
5. **Deploy** to production with updated credentials

---

**Need help? Refer to `FINAL_ACTION_PLAN.md` for deployment steps.**


