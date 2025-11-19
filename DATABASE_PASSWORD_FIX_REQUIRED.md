# 🔐 DATABASE PASSWORD FIX REQUIRED

## ❌ CURRENT ISSUE

Your Render deployment is failing with:

```
error: Database connection failed: password authentication failed for user "postgres"
```

**This is NOT a timeout issue - it's a credentials issue!**

---

## 🎯 THE PROBLEM

Render environment variables are either:
1. ❌ Not set at all
2. ❌ Set to wrong values
3. ❌ Using old/incorrect password

---

## ✅ THE SOLUTION (3 STEPS)

### **STEP 1: Get Supabase Credentials** 📋

1. Go to: https://supabase.com/dashboard
2. Select your StudySpot project
3. Click **"Project Settings"** (gear icon, bottom left)
4. Click **"Database"** tab
5. Scroll to **"Connection string"**
6. Select **"URI"** tab
7. Look for **"Connection pooling"** or **"Session pooling"**
8. You'll see something like:

```
postgresql://postgres.xxxxxxxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

**Extract these values**:
- **Host**: `aws-0-ap-southeast-1.pooler.supabase.com` (after `@`, before `:5432`)
- **User**: `postgres.xxxxxxxxxxxxxxxxxx` (after `://`, before `:`)
- **Password**: `Ial8GDBSqBAsCLMm` (after username`:`, before `@`)
- **Database**: `postgres` (after `:5432/`)

---

### **STEP 2: Set in Render (API Gateway)** 🚀

1. Go to: https://dashboard.render.com
2. Find service: **`studyspot-api`**
3. Click **"Environment"** (left sidebar)
4. Click **"Add Environment Variable"** for each:

```env
CORE_DB_HOST = aws-0-ap-southeast-1.pooler.supabase.com
CORE_DB_PORT = 5432
CORE_DB_NAME = postgres
CORE_DB_USER = postgres.xxxxxxxxxxxxxxxxxx
CORE_DB_PASSWORD = Ial8GDBSqBAsCLMm
CORE_DB_SSL = true
CORE_DB_POOL_MIN = 1
CORE_DB_POOL_MAX = 5

JWT_SECRET = your-super-secret-jwt-key-min-32-characters-long
JWT_ACCESS_TOKEN_EXPIRY = 15m
JWT_REFRESH_TOKEN_EXPIRY = 7d

CORS_ORIGIN = https://studyspot-rose.vercel.app,https://studyspot-student.vercel.app,http://localhost:3000,http://localhost:5173
```

5. Click **"Save Changes"**

---

### **STEP 3: Set in Render (Auth Service)** 🚀

1. Find service: **`studyspot-auth`**
2. Click **"Environment"** (left sidebar)
3. Add the **SAME variables** as Step 2
4. Click **"Save Changes"**

---

## 🧪 TEST LOCALLY FIRST (RECOMMENDED)

Before deploying to Render, verify credentials work:

### **1. Create `.env` file**

```bash
cd backend
```

Create `backend/.env` with:

```env
CORE_DB_HOST=aws-0-ap-southeast-1.pooler.supabase.com
CORE_DB_PORT=5432
CORE_DB_NAME=postgres
CORE_DB_USER=postgres.xxxxxxxxxxxxxxxxxx
CORE_DB_PASSWORD=Ial8GDBSqBAsCLMm
CORE_DB_SSL=true

JWT_SECRET=your-super-secret-jwt-key-change-this
```

**⚠️ REPLACE**:
- `aws-0-ap-southeast-1.pooler.supabase.com` → Your actual Supabase host
- `postgres.xxxxxxxxxxxxxxxxxx` → Your actual Supabase user
- `Ial8GDBSqBAsCLMm` → Your actual Supabase password

### **2. Test Connection**

```bash
cd backend
node test-db.js
```

**Expected Output**:
```
╔════════════════════════════════════════════════╗
║  SUPABASE DATABASE CONNECTION TEST             ║
╚════════════════════════════════════════════════╝

📋 Configuration:
   Host: aws-0-ap-southeast-1.pooler.supabase.com
   Port: 5432
   Database: postgres
   User: postgres.xxxxxxxxxxxxxxxxxx
   Password: ****BsCLMm
   SSL: true

⏳ Connecting to database...
✅ Connected successfully in 250ms!

⏳ Testing query...
✅ Query executed in 45ms

📊 Database Info:
   Current Time: 2025-11-13T17:15:00.000Z
   Version: PostgreSQL 15.1

✅ admin_users table exists (0 users)

╔════════════════════════════════════════════════╗
║  ✅ CONNECTION TEST PASSED!                    ║
╚════════════════════════════════════════════════╝

Your database credentials are correct.
You can now use these same values in Render.
```

**If it FAILS**:
- Check password is correct
- Check host is the POOLER URL (has "pooler" in it)
- Check user includes project reference (`postgres.xxx`)
- Check Supabase project is active

---

## 📝 IMPORTANT NOTES

### **Use POOLER URL (Not Direct Connection)**

❌ **DON'T USE**:
```
db.xxxxxxxxxxxxxxxxxx.supabase.co
```

✅ **USE THIS**:
```
aws-0-ap-southeast-1.pooler.supabase.com
```

The pooler supports many more connections and is required for Render.

### **User Format**

❌ **WRONG**: `postgres`  
✅ **CORRECT**: `postgres.xxxxxxxxxxxxxxxxxx`

The user MUST include your project reference.

### **SSL Must Be Enabled**

Supabase requires SSL. Always set:
```
CORE_DB_SSL=true
```

---

## 🚀 AFTER SETTING VARIABLES

1. **Render auto-deploys** when you save environment variables
2. **OR** click "Manual Deploy" → "Deploy latest commit"
3. **Watch logs**:
   - Click "Logs" tab
   - Look for: `✅ Connected to core database`
   - If you see errors, credentials are still wrong

---

## 🎯 QUICK CHECKLIST

- [ ] Get Supabase connection string from dashboard
- [ ] Extract host, user, password, database
- [ ] Test locally with `node backend/test-db.js`
- [ ] Add variables to Render `studyspot-api`
- [ ] Add variables to Render `studyspot-auth`
- [ ] Save and wait for auto-deploy
- [ ] Check logs for `✅ Connected to core database`
- [ ] Test student portal login

---

## 🆘 STILL NOT WORKING?

If you've set everything correctly and it still fails:

1. **Check Supabase project status**
   - Is it paused/inactive?
   - Is it in a different region?

2. **Reset Supabase password**
   - Go to Supabase → Settings → Database
   - Click "Reset database password"
   - Use the NEW password everywhere

3. **Check Supabase network policy**
   - Settings → Database → Connection pooling
   - Ensure "Allow all" or add Render IPs

4. **Share the full error**
   - Copy full error from Render logs
   - Check for specific error messages

---

## 📚 MORE HELP

- **Full guide**: See `RENDER_DATABASE_FIX.md`
- **Test script**: Use `backend/test-db.js`
- **Environment template**: See `backend/env.example`

---

**Status**: ⏳ **WAITING FOR YOU TO SET CREDENTIALS**  
**Next Step**: Get Supabase connection string → Set in Render → Deploy  
**ETA**: 5 minutes once you have credentials


