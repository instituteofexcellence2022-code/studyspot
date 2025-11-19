# 🔧 RENDER DATABASE CONNECTION FIX

## ❌ CURRENT ERROR

```
error: Database connection failed: password authentication failed for user "postgres"
error: ❌ CRITICAL: Database connection failed
```

**Root Cause**: Render environment variables are not set or incorrect.

---

## ✅ SOLUTION: SET ENVIRONMENT VARIABLES ON RENDER

### **Your Supabase Credentials**

You mentioned: `new supabase database password "Ial8GDBSqBAsCLMm"`

Based on Supabase's standard format, your credentials should be:

```
Host: <your-project-ref>.supabase.co
Port: 5432
Database: postgres
User: postgres
Password: Ial8GDBSqBAsCLMm
SSL: true
```

---

## 🚀 HOW TO FIX ON RENDER

### **For API Gateway Service** (`studyspot-api`)

1. **Go to**: https://dashboard.render.com
2. **Find service**: `studyspot-api`
3. **Click**: "Environment" tab (left sidebar)
4. **Add these environment variables**:

```env
# Database Configuration
CORE_DB_HOST=aws-0-ap-southeast-1.pooler.supabase.com
CORE_DB_PORT=5432
CORE_DB_NAME=postgres
CORE_DB_USER=postgres.xxxxxxxxxxxxxxxxxx
CORE_DB_PASSWORD=Ial8GDBSqBAsCLMm
CORE_DB_SSL=true
CORE_DB_POOL_MIN=1
CORE_DB_POOL_MAX=5

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d

# Service Configuration
API_GATEWAY_PORT=3000
AUTH_SERVICE_URL=https://studyspot-auth.onrender.com
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=1 minute

# CORS Configuration
CORS_ORIGIN=https://studyspot-rose.vercel.app,https://studyspot-librarys.vercel.app,https://studyspot-admin-2.vercel.app,https://studyspot-student.vercel.app,http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:5173,https://main.studyspot-student.pages.dev,https://studyspot-student.netlify.app
```

---

### **For Auth Service** (`studyspot-auth`)

1. **Go to**: https://dashboard.render.com
2. **Find service**: `studyspot-auth`
3. **Click**: "Environment" tab (left sidebar)
4. **Add these environment variables**:

```env
# Database Configuration
CORE_DB_HOST=aws-0-ap-southeast-1.pooler.supabase.com
CORE_DB_PORT=5432
CORE_DB_NAME=postgres
CORE_DB_USER=postgres.xxxxxxxxxxxxxxxxxx
CORE_DB_PASSWORD=Ial8GDBSqBAsCLMm
CORE_DB_SSL=true
CORE_DB_POOL_MIN=1
CORE_DB_POOL_MAX=5

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d

# Service Configuration
AUTH_SERVICE_PORT=3001

# CORS Configuration
CORS_ORIGIN=https://studyspot-rose.vercel.app,https://studyspot-librarys.vercel.app,https://studyspot-admin-2.vercel.app,https://studyspot-student.vercel.app,http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:5173,https://main.studyspot-student.pages.dev,https://studyspot-student.netlify.app
```

---

## 🔍 HOW TO GET YOUR ACTUAL SUPABASE CREDENTIALS

### **Step 1: Log into Supabase**
Go to: https://supabase.com/dashboard

### **Step 2: Select Your Project**
Click on your StudySpot project

### **Step 3: Get Connection String**
1. Click "Project Settings" (gear icon, bottom left)
2. Click "Database" tab
3. Scroll down to "Connection string"
4. Select "URI" tab
5. You'll see something like:

```
postgresql://postgres.xxxxxxxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

### **Step 4: Extract Values**

From the connection string, extract:

| Variable | Example Value | Where to Find |
|----------|---------------|---------------|
| **CORE_DB_HOST** | `aws-0-ap-southeast-1.pooler.supabase.com` | After `@` and before `:5432` |
| **CORE_DB_PORT** | `5432` | After host |
| **CORE_DB_NAME** | `postgres` | After `:5432/` |
| **CORE_DB_USER** | `postgres.xxxxxxxxxxxxxxxxxx` | After `://` and before `:` |
| **CORE_DB_PASSWORD** | `Ial8GDBSqBAsCLMm` | After username and before `@` |
| **CORE_DB_SSL** | `true` | Always true for Supabase |

---

## 📋 STEP-BY-STEP RENDER CONFIGURATION

### **Step 1: Get to Environment Variables**

1. Go to https://dashboard.render.com
2. Click on `studyspot-api` service
3. Click "Environment" in left sidebar
4. You'll see a list of environment variables

### **Step 2: Add Variables One by One**

For each variable:
1. Click "Add Environment Variable"
2. **Key**: Enter variable name (e.g., `CORE_DB_HOST`)
3. **Value**: Enter the value (e.g., `aws-0-ap-southeast-1.pooler.supabase.com`)
4. Click "Save Changes"

**Repeat for all variables in the list above.**

### **Step 3: Trigger Redeploy**

After adding all variables:
1. Click "Manual Deploy" → "Deploy latest commit"
2. Or it will auto-deploy when you save environment variables

### **Step 4: Watch Logs**

1. Click "Logs" tab
2. Watch for:
   - ✅ `✅ Connected to core database`
   - ✅ `Auth service listening on port 3001`
   - ❌ `Database connection failed` (if still wrong credentials)

---

## 🧪 VERIFY CREDENTIALS LOCALLY FIRST

Before deploying to Render, test locally:

### **Step 1: Create `.env` file**

```bash
cd backend
```

Create `backend/.env`:

```env
# Get these from Supabase Dashboard
CORE_DB_HOST=aws-0-ap-southeast-1.pooler.supabase.com
CORE_DB_PORT=5432
CORE_DB_NAME=postgres
CORE_DB_USER=postgres.xxxxxxxxxxxxxxxxxx
CORE_DB_PASSWORD=Ial8GDBSqBAsCLMm
CORE_DB_SSL=true

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d
```

### **Step 2: Test Connection**

Create a test script `backend/test-db.js`:

```javascript
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.CORE_DB_HOST,
  port: parseInt(process.env.CORE_DB_PORT),
  database: process.env.CORE_DB_NAME,
  user: process.env.CORE_DB_USER,
  password: process.env.CORE_DB_PASSWORD,
  ssl: process.env.CORE_DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 20000,
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('Host:', process.env.CORE_DB_HOST);
    console.log('Port:', process.env.CORE_DB_PORT);
    console.log('Database:', process.env.CORE_DB_NAME);
    console.log('User:', process.env.CORE_DB_USER);
    console.log('SSL:', process.env.CORE_DB_SSL);
    
    const client = await pool.connect();
    console.log('✅ Connected successfully!');
    
    const result = await client.query('SELECT NOW()');
    console.log('✅ Query executed:', result.rows[0]);
    
    client.release();
    await pool.end();
    console.log('✅ Connection test passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
}

testConnection();
```

### **Step 3: Run Test**

```bash
cd backend
node test-db.js
```

**Expected Output**:
```
Testing database connection...
Host: aws-0-ap-southeast-1.pooler.supabase.com
Port: 5432
Database: postgres
User: postgres.xxxxxxxxxxxxxxxxxx
SSL: true
✅ Connected successfully!
✅ Query executed: { now: 2025-11-13T17:10:00.000Z }
✅ Connection test passed!
```

**If it fails**:
- ❌ Check Supabase project is running
- ❌ Check password is correct
- ❌ Check host/user from connection string
- ❌ Check if your IP is allowed (Supabase → Settings → Database → Connection pooling)

---

## 🔐 IMPORTANT: SUPABASE CONNECTION POOLER

Supabase has TWO connection modes:

### **1. Direct Connection** (Session Mode)
```
Host: db.xxxxxxxxxxxxxxxxxx.supabase.co
Port: 5432
```
- For long-lived connections
- Limited connections (~20-60)
- **Not recommended for Render**

### **2. Connection Pooler** (Transaction Mode) ✅ **RECOMMENDED**
```
Host: aws-0-ap-southeast-1.pooler.supabase.com
Port: 5432
```
- For many short-lived connections
- Supports 1000+ connections
- **Perfect for serverless/Render**

**Use the pooler URL** for Render deployments!

---

## 📊 ENVIRONMENT VARIABLES CHECKLIST

### **Required for Both Services** ✅

- [ ] `CORE_DB_HOST` - Supabase pooler host
- [ ] `CORE_DB_PORT` - `5432`
- [ ] `CORE_DB_NAME` - `postgres`
- [ ] `CORE_DB_USER` - `postgres.xxxxxxxxxxxxxxxxxx`
- [ ] `CORE_DB_PASSWORD` - `Ial8GDBSqBAsCLMm`
- [ ] `CORE_DB_SSL` - `true`
- [ ] `JWT_SECRET` - 32+ character secret key
- [ ] `CORS_ORIGIN` - Comma-separated frontend URLs

### **API Gateway Specific** ✅

- [ ] `API_GATEWAY_PORT` - `3000`
- [ ] `AUTH_SERVICE_URL` - `https://studyspot-auth.onrender.com`

### **Auth Service Specific** ✅

- [ ] `AUTH_SERVICE_PORT` - `3001`

---

## 🎯 QUICK FIX SUMMARY

**The issue is NOT a timeout - it's wrong database credentials!**

### **To Fix**:

1. **Get Supabase credentials** from dashboard (Connection String → Pooler)
2. **Add to Render** (Environment tab on both services)
3. **Key variables**:
   - `CORE_DB_HOST` = `aws-0-ap-southeast-1.pooler.supabase.com`
   - `CORE_DB_USER` = `postgres.xxxxxxxxxxxxxxxxxx`
   - `CORE_DB_PASSWORD` = `Ial8GDBSqBAsCLMm`
   - `CORE_DB_SSL` = `true`
4. **Redeploy** both services
5. **Check logs** for `✅ Connected to core database`

---

## 🐛 COMMON MISTAKES

### **Mistake 1: Using Direct Connection Instead of Pooler**
❌ `db.xxxxxxxxxxxxxxxxxx.supabase.co`  
✅ `aws-0-ap-southeast-1.pooler.supabase.com`

### **Mistake 2: Wrong User Format**
❌ `postgres` (plain)  
✅ `postgres.xxxxxxxxxxxxxxxxxx` (with project ref)

### **Mistake 3: SSL Not Enabled**
❌ `CORE_DB_SSL=false`  
✅ `CORE_DB_SSL=true`

### **Mistake 4: Wrong Password**
❌ Using old password  
✅ Using current password from Supabase

---

## 📞 NEED HELP?

If credentials are correct but still failing:

1. **Check Supabase dashboard**: Project → Settings → Database
2. **Check connection limit**: Might be hitting max connections
3. **Check network policy**: Supabase → Settings → Database → Connection pooling → Allow all IPs
4. **Test locally first**: Use `test-db.js` script above

---

**Last Updated**: November 13, 2025  
**Issue**: Database authentication failed  
**Fix**: Set correct Supabase credentials in Render environment variables


