# Manual Deployment Guide - Render.com

## 🎯 Deploy Services One by One

Follow these steps to deploy each service manually on Render.

---

## 📋 Service 1: Student Service (PRIORITY 1)

### Step 1: Go to Render Dashboard
1. Open https://dashboard.render.com
2. Click **"New"** → **"Web Service"**

### Step 2: Connect Repository
1. Select your GitHub repository
2. Click **"Connect"**

### Step 3: Configure Service
Fill in these details:

**Basic Settings:**
- **Name**: `studyspot-students`
- **Environment**: `Node`
- **Region**: `Oregon` (or your preferred)
- **Branch**: `main`
- **Root Directory**: Leave empty (or `backend` if needed)

**Build & Deploy:**
- **Build Command**: `cd backend && npm install && npm run build`
- **Start Command**: `cd backend && npm run start:student`

### Step 4: Environment Variables
Click **"Advanced"** → **"Add Environment Variable"** and add:

```
NODE_ENV=production
STUDENT_SERVICE_PORT=10001
CORS_ORIGIN=https://studyspot-rose.vercel.app,https://studyspot-librarys.vercel.app,https://studyspot-admin-2.vercel.app,https://studyspot-student.vercel.app,http://localhost:3000,http://localhost:3001,http://localhost:3002,https://main.studyspot-student.pages.dev,https://studyspot-student.netlify.app
```

**Database Variables** (use ONE of these options):

**Option 1: Connection String (Recommended)**
```
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
```

**Option 2: Individual Parameters**
```
CORE_DB_HOST=your-db-host
CORE_DB_PORT=5432
CORE_DB_NAME=your-db-name
CORE_DB_USER=your-db-user
CORE_DB_PASSWORD=your-db-password
CORE_DB_SSL=true
```

### Step 5: Deploy
1. Click **"Create Web Service"**
2. Wait for build to complete (5-10 minutes)
3. Service URL will be: `https://studyspot-students.onrender.com`

### Step 6: Verify
```bash
curl https://studyspot-students.onrender.com/health
```

Expected response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "service": "student-service"
  }
}
```

---

## 📋 Service 2: Library Service (PRIORITY 2)

### Step 1: Go to Render Dashboard
1. Open https://dashboard.render.com
2. Click **"New"** → **"Web Service"**

### Step 2: Connect Repository
1. Select your GitHub repository (same one)
2. Click **"Connect"**

### Step 3: Configure Service
Fill in these details:

**Basic Settings:**
- **Name**: `studyspot-libraries`
- **Environment**: `Node`
- **Region**: `Oregon`
- **Branch**: `main`
- **Root Directory**: Leave empty

**Build & Deploy:**
- **Build Command**: `cd backend && npm install && npm run build`
- **Start Command**: `cd backend && npm run start:library`

### Step 4: Environment Variables
Add:

```
NODE_ENV=production
LIBRARY_SERVICE_PORT=10002
CORS_ORIGIN=https://studyspot-rose.vercel.app,https://studyspot-librarys.vercel.app,https://studyspot-admin-2.vercel.app,https://studyspot-student.vercel.app,http://localhost:3000,http://localhost:3001,http://localhost:3002,https://main.studyspot-student.pages.dev,https://studyspot-student.netlify.app
```

**Database Variables** (same as Student Service - use connection string or individual params):
```
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
```

### Step 5: Deploy
1. Click **"Create Web Service"**
2. Wait for build
3. Service URL: `https://studyspot-libraries.onrender.com`

### Step 6: Verify
```bash
curl https://studyspot-libraries.onrender.com/health
```

---

## 📋 Service 3: Booking Service (PRIORITY 3)

### Step 1: Go to Render Dashboard
1. Open https://dashboard.render.com
2. Click **"New"** → **"Web Service"**

### Step 2: Connect Repository
1. Select your GitHub repository
2. Click **"Connect"**

### Step 3: Configure Service
Fill in these details:

**Basic Settings:**
- **Name**: `studyspot-bookings`
- **Environment**: `Node`
- **Region**: `Oregon`
- **Branch**: `main`
- **Root Directory**: Leave empty

**Build & Deploy:**
- **Build Command**: `cd backend && npm install && npm run build`
- **Start Command**: `cd backend && npm run start:booking`

### Step 4: Environment Variables
Add:

```
NODE_ENV=production
BOOKING_SERVICE_PORT=10003
CORS_ORIGIN=https://studyspot-rose.vercel.app,https://studyspot-librarys.vercel.app,https://studyspot-admin-2.vercel.app,https://studyspot-student.vercel.app,http://localhost:3000,http://localhost:3001,http://localhost:3002,https://main.studyspot-student.pages.dev,https://studyspot-student.netlify.app
```

**Database Variables** (same as above):
```
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
```

**Supabase Variables** (if using Supabase):
```
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-key
```

### Step 5: Deploy
1. Click **"Create Web Service"**
2. Wait for build
3. Service URL: `https://studyspot-bookings.onrender.com`

### Step 6: Verify
```bash
curl https://studyspot-bookings.onrender.com/health
```

---

## 📋 Service 4: Payment Service (PRIORITY 4)

### Step 1: Go to Render Dashboard
1. Open https://dashboard.render.com
2. Click **"New"** → **"Web Service"**

### Step 2: Connect Repository
1. Select your GitHub repository
2. Click **"Connect"**

### Step 3: Configure Service
Fill in these details:

**Basic Settings:**
- **Name**: `studyspot-payments`
- **Environment**: `Node`
- **Region**: `Oregon`
- **Branch**: `main`
- **Root Directory**: Leave empty

**Build & Deploy:**
- **Build Command**: `cd backend && npm install && npm run build`
- **Start Command**: `cd backend && npm run start:payment`

### Step 4: Environment Variables
Add:

```
NODE_ENV=production
PAYMENT_SERVICE_PORT=10004
CORS_ORIGIN=https://studyspot-rose.vercel.app,https://studyspot-librarys.vercel.app,https://studyspot-admin-2.vercel.app,https://studyspot-student.vercel.app,http://localhost:3000,http://localhost:3001,http://localhost:3002,https://main.studyspot-student.pages.dev,https://studyspot-student.netlify.app
```

**Database Variables**:
```
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
```

**Payment Gateway Keys** (IMPORTANT):
```
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-secret
CASHFREE_APP_ID=your-cashfree-app-id
CASHFREE_SECRET_KEY=your-cashfree-secret
```

### Step 5: Deploy
1. Click **"Create Web Service"**
2. Wait for build
3. Service URL: `https://studyspot-payments.onrender.com`

### Step 6: Verify
```bash
curl https://studyspot-payments.onrender.com/health
```

---

## 🔧 After All Services Deployed

### Step 1: Update API Gateway Environment Variables

Go to Render Dashboard → `studyspot-api` → Environment → Add:

```
STUDENT_SERVICE_URL=https://studyspot-students.onrender.com
LIBRARY_SERVICE_URL=https://studyspot-libraries.onrender.com
BOOKING_SERVICE_URL=https://studyspot-bookings.onrender.com
PAYMENT_SERVICE_URL=https://studyspot-payments.onrender.com
```

### Step 2: Restart API Gateway
After adding environment variables, restart the API Gateway service:
1. Go to `studyspot-api` service
2. Click **"Manual Deploy"** → **"Deploy latest commit"**

### Step 3: Test All Services

```bash
# Test each service
curl https://studyspot-students.onrender.com/health
curl https://studyspot-libraries.onrender.com/health
curl https://studyspot-bookings.onrender.com/health
curl https://studyspot-payments.onrender.com/health

# Test API Gateway routing
curl https://studyspot-api.onrender.com/api/v1/students
curl https://studyspot-api.onrender.com/api/fee-plans
```

---

## 🐛 Troubleshooting

### Build Fails
- Check build logs in Render
- Verify `npm run build` works locally
- Check for TypeScript errors

### Service Not Starting
- Check start command: `cd backend && npm run start:student`
- Verify port is correct (10001, 10002, etc.)
- Check service logs in Render

### Database Connection Errors
- Verify database environment variables
- Check database is accessible from Render
- Verify connection string format

### CORS Errors
- Verify `CORS_ORIGIN` includes all frontend URLs
- Check service CORS configuration

### 502 Bad Gateway (API Gateway)
- Verify service is running
- Check service URL in API Gateway environment variables
- Verify service health endpoint works

---

## ✅ Deployment Checklist

- [ ] Student Service deployed and healthy
- [ ] Library Service deployed and healthy
- [ ] Booking Service deployed and healthy
- [ ] Payment Service deployed and healthy
- [ ] API Gateway environment variables updated
- [ ] API Gateway restarted
- [ ] All services tested through API Gateway
- [ ] Frontend tested (student management, fee plans, bookings, payments)

---

**Start with Student Service first!** 🚀

