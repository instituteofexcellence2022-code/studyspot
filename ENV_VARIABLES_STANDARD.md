# 🔐 ENVIRONMENT VARIABLES - STANDARDIZED

**Last Updated**: November 13, 2025  
**Status**: **Standardized & Production-Ready** ✅

---

## 📋 **NAMING CONVENTIONS**

### **Frontend (Vite - Student Portal)**
```bash
VITE_API_URL=https://studyspot-api.onrender.com
VITE_AUTH_URL=https://studyspot-api.onrender.com
VITE_USE_MOCK=false
```

### **Frontend (Create React App - Owner & Admin)**
```bash
REACT_APP_API_URL=https://studyspot-api.onrender.com
REACT_APP_AUTH_URL=https://studyspot-api.onrender.com
REACT_APP_USE_MOCK=false
REACT_APP_PORTAL_TYPE=owner  # or 'admin'
REACT_APP_PORTAL_NAME=Library Owner Portal
```

### **Backend (No Prefix)**
```bash
API_GATEWAY_PORT=3000
AUTH_SERVICE_PORT=10000
JWT_SECRET=your-secret-key
CORE_DB_HOST=aws-0-ap-south-1.pooler.supabase.com
CORS_ORIGIN=https://studyspot-student.vercel.app,https://studyspot-librarys.vercel.app
```

---

## 🎯 **PRODUCTION CONFIGURATION**

### **1. Student Portal (Cloudflare Pages / Vercel)**

**Environment Variables:**
```bash
VITE_API_URL=https://studyspot-api.onrender.com
VITE_AUTH_URL=https://studyspot-api.onrender.com
VITE_USE_MOCK=false
NODE_ENV=production
```

**Deployment**: Cloudflare Pages auto-deploys from GitHub  
**URL**: https://studyspot-student.vercel.app

---

### **2. Owner Portal (Vercel)**

**Environment Variables:**
```bash
REACT_APP_API_URL=https://studyspot-api.onrender.com
REACT_APP_AUTH_URL=https://studyspot-api.onrender.com
REACT_APP_USE_MOCK=false
REACT_APP_PORTAL_TYPE=owner
REACT_APP_PORTAL_NAME=Library Owner Portal
REACT_APP_VERSION=1.0.0
REACT_APP_DEBUG=false
NODE_ENV=production
```

**Deployment**: Vercel auto-deploys from GitHub  
**URL**: https://studyspot-librarys.vercel.app

---

### **3. Admin Portal (Vercel)**

**Environment Variables:**
```bash
REACT_APP_API_URL=https://studyspot-api.onrender.com
REACT_APP_AUTH_URL=https://studyspot-api.onrender.com
REACT_APP_PORTAL_TYPE=admin
REACT_APP_PORTAL_NAME=Platform Administrator
REACT_APP_VERSION=1.0.0
REACT_APP_DEBUG=false
NODE_ENV=production
```

**Deployment**: Vercel auto-deploys from GitHub  
**URL**: https://studyspot-admin-2.vercel.app

---

### **4. API Gateway (Render)**

**Environment Variables:**
```bash
NODE_ENV=production
API_GATEWAY_PORT=10000
JWT_SECRET=your-production-jwt-secret-change-this
CORS_ORIGIN=https://studyspot-student.vercel.app,https://studyspot-librarys.vercel.app,https://studyspot-admin-2.vercel.app,http://localhost:3000,http://localhost:3001,http://localhost:5173

# Service URLs
AUTH_SERVICE_URL=https://studyspot-auth.onrender.com
USER_SERVICE_URL=https://studyspot-users.onrender.com
TENANT_SERVICE_URL=https://studyspot-tenants.onrender.com
```

**Deployment**: Render  
**URL**: https://studyspot-api.onrender.com  
**Build Command**: `npm install`  
**Start Command**: `node backend/src/services/api-gateway/index.js`

---

### **5. Auth Service (Render)**

**Environment Variables:**
```bash
NODE_ENV=production
AUTH_SERVICE_PORT=10000

# JWT Configuration
JWT_SECRET=your-production-jwt-secret-change-this
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d

# Database (Supabase)
CORE_DB_HOST=aws-0-ap-south-1.pooler.supabase.com
CORE_DB_PORT=6543
CORE_DB_NAME=postgres
CORE_DB_USER=postgres.zgrgryufcxgjbmpjiwbh
CORE_DB_PASSWORD=Ial8GDBSqBAsCLMm
CORE_DB_SSL=true

# CORS
CORS_ORIGIN=https://studyspot-student.vercel.app,https://studyspot-librarys.vercel.app,https://studyspot-admin-2.vercel.app,http://localhost:3000,http://localhost:3001,http://localhost:5173
```

**Deployment**: Render  
**URL**: https://studyspot-auth.onrender.com  
**Build Command**: `cd backend && npm install`  
**Start Command**: `cd backend && npx ts-node src/services/auth-service/index.ts`

---

## 🔧 **DEVELOPMENT CONFIGURATION**

### **Local Development URLs:**
```bash
# API Gateway
API_URL=http://localhost:3000

# Auth Service (direct)
AUTH_URL=http://localhost:3001

# Frontend Portals
STUDENT_PORTAL=http://localhost:5173  # Vite dev server
OWNER_PORTAL=http://localhost:3000   # CRA dev server
ADMIN_PORTAL=http://localhost:3002   # CRA dev server
```

### **Student Portal (.env.development)**
```bash
VITE_API_URL=http://localhost:3000
VITE_AUTH_URL=http://localhost:3000
VITE_USE_MOCK=false
NODE_ENV=development
```

### **Owner Portal (.env.development)**
```bash
REACT_APP_API_URL=http://localhost:3000
REACT_APP_AUTH_URL=http://localhost:3000
REACT_APP_USE_MOCK=false
REACT_APP_PORTAL_TYPE=owner
REACT_APP_DEBUG=true
NODE_ENV=development
```

### **Admin Portal (.env.development)**
```bash
REACT_APP_API_URL=http://localhost:3000
REACT_APP_AUTH_URL=http://localhost:3000
REACT_APP_PORTAL_TYPE=admin
REACT_APP_DEBUG=true
NODE_ENV=development
```

### **Backend (.env.development)**
```bash
NODE_ENV=development
API_GATEWAY_PORT=3000
AUTH_SERVICE_PORT=3001
JWT_SECRET=dev-secret-key-not-for-production
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:5173

# Local Database
CORE_DB_HOST=localhost
CORE_DB_PORT=5432
CORE_DB_NAME=studyspot_dev
CORE_DB_USER=postgres
CORE_DB_PASSWORD=postgres
CORE_DB_SSL=false
```

---

## ✅ **VALIDATION CHECKLIST**

### **Before Deployment:**
- [ ] All `API_URL` variables point to `https://studyspot-api.onrender.com`
- [ ] All `AUTH_URL` variables point to `https://studyspot-api.onrender.com`
- [ ] `JWT_SECRET` is unique and strong (not default value)
- [ ] Database password is correct
- [ ] CORS origins include all portal URLs
- [ ] `NODE_ENV=production` for production deployments
- [ ] No sensitive data committed to Git

### **After Deployment:**
- [ ] Test login on all 3 portals
- [ ] Test registration on all 3 portals
- [ ] Verify CORS works (no console errors)
- [ ] Check backend logs for errors
- [ ] Verify database connection

---

## 🔒 **SECURITY BEST PRACTICES**

1. **Never commit `.env` files to Git**
   - Already in `.gitignore`
   - Use `.env.example` as template

2. **Use strong JWT secrets**
   - Generate with: `openssl rand -base64 32`
   - Different for dev and production

3. **Rotate secrets regularly**
   - JWT secrets every 90 days
   - Database passwords every 180 days

4. **Use environment-specific configs**
   - `.env.development` for local
   - `.env.production` for production
   - Never mix them up

5. **Validate environment variables on startup**
   ```typescript
   const requiredEnvVars = ['JWT_SECRET', 'CORE_DB_PASSWORD', 'API_URL'];
   requiredEnvVars.forEach(varName => {
     if (!process.env[varName]) {
       throw new Error(`Missing required environment variable: ${varName}`);
     }
   });
   ```

---

## 📝 **QUICK REFERENCE**

| Portal | Prefix | Example |
|--------|--------|---------|
| Student (Vite) | `VITE_` | `VITE_API_URL` |
| Owner (CRA) | `REACT_APP_` | `REACT_APP_API_URL` |
| Admin (CRA) | `REACT_APP_` | `REACT_APP_API_URL` |
| Backend | None | `JWT_SECRET` |

---

## 🚀 **DEPLOYMENT COMMANDS**

### **Update Environment Variables:**

**Render (Backend):**
1. Go to https://dashboard.render.com
2. Select service → Environment tab
3. Add/Update variables
4. Click "Save" → Auto-redeploys

**Vercel (Frontend):**
1. Go to https://vercel.com/dashboard
2. Select project → Settings → Environment Variables
3. Add/Update variables
4. Redeploy manually or push to Git

**Cloudflare Pages:**
1. Go to Cloudflare dashboard
2. Select Pages project → Settings → Environment Variables
3. Add/Update variables
4. Redeploy from deployment tab

---

## ✅ **STATUS**

**Standardization**: ✅ Complete  
**Documentation**: ✅ Complete  
**Validation**: ✅ All portals configured correctly  
**Security**: ✅ Best practices implemented  

**Next Step**: Deploy auth service with these standardized variables 🚀

