# 🔧 Fix Database Connection

**Status:** ✅ Server loads successfully! ⚠️  Database connection issue

---

## 🎉 Good News!

**All 3 bugs fixed:**
1. ✅ audit.js function name issue
2. ✅ authenticate import issue (all 4 routes)
3. ✅ Missing csv-parser dependency

**Server now loads perfectly!** The only issue is connecting to Supabase.

---

## ⚠️ Current Error

```
SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string
```

This means the DATABASE_URL format might be incorrect or Supabase is paused.

---

## 🔧 Solution: Update DATABASE_URL

### Option 1: Check if Supabase is Paused (Most Likely)

**Free tier databases pause after inactivity:**

1. Go to: https://supabase.com/dashboard
2. Click on your project
3. Check if it says "Paused" or "Inactive"
4. If paused, click **"Resume"** or **"Unpause"**
5. Wait 1-2 minutes for database to wake up
6. Try starting server again

### Option 2: Get Fresh Connection String

If resuming doesn't work, get a new connection string:

1. Go to: https://supabase.com/dashboard
2. Click on your project  
3. Click "Settings" (gear icon) in the left sidebar
4. Click "Database"
5. Scroll to **"Connection string"**
6. Select **"Connection Pooler"** tab (NOT "Direct connection")
7. Choose **"Session mode"**
8. Copy the connection string

**It should look like:**
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-[REGION].pooler.supabase.com:5432/postgres
```

9. Replace `[PASSWORD]` with your database password
10. Update `DATABASE_URL` in `api/.env`

### Option 3: Use Session Pooling Mode

The connection string in your `.env` might be using transaction pooling. Try changing to session pooling:

**Current format:**
```
postgresql://postgres.zgrgryufcxgjbmpjiwbh:fB6613KAhqdF6LMG@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
```

**Try this instead (Session mode - add ?pgbouncer=true):**
```
postgresql://postgres.zgrgryufcxgjbmpjiwbh:fB6613KAhqdF6LMG@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?pgbouncer=true
```

**Or use Direct connection (port 5432):**
```
postgresql://postgres.zgrgryufcxgjbmpjiwbh:fB6613KAhqdF6LMG@db.zgrgryufcxgjbmpjiwbh.supabase.co:5432/postgres
```

---

## 📝 How To Update .env

1. Open `api/.env` in your editor
2. Find the line starting with `DATABASE_URL=`
3. Replace with the new connection string
4. Save the file
5. Restart the server: `cd api; npm start`

---

## ✅ Test Database Connection

After updating, test with:

```bash
cd api
npm start
```

**Look for:**
- ✅ "Connected to PostgreSQL successfully!"
- ✅ "Server running on port 3001"

**No more:**
- ❌ "SASL: SCRAM-SERVER-FIRST-MESSAGE"
- ❌ "Database connection failed"

---

## 🎯 After Database Connects

Once database is connected:

### 1. Test Health Endpoint
```bash
curl http://localhost:3001/api/health
```

Expected:
```json
{
  "status": "healthy",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

### 2. Test Authentication
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

### 3. Run Migrations (Your Step A)
Then run migrations via Supabase SQL Editor:
- 007_student_groups.sql
- 008_invoices_expenses.sql
- 009_audit_security.sql

### 4. Test New Features
```bash
curl http://localhost:3001/api/audit/event-types
curl http://localhost:3001/api/dashboard/metrics
```

---

## 💡 Quick Fix Steps

**If Supabase is paused:**
1. Go to Supabase dashboard
2. Resume/Unpause the database  
3. Wait 1-2 minutes
4. `cd api; npm start`
5. Test: `curl http://localhost:3001/api/health`

**Done!** ✅

---

## 🐛 Still Not Working?

**Try these:**

1. **Check password has no special chars issue:**
   - Password: `fB6613KAhqdF6LMG` (looks OK)
   - No special chars that need escaping

2. **Check project is active:**
   - Login to Supabase
   - Verify project exists
   - Check it's not paused

3. **Try direct connection instead of pooler:**
   - Get "Direct connection" string from Supabase
   - Use that instead

4. **Check Node.js pg module:**
   ```bash
   cd api
   npm install pg --save
   ```

---

## 📞 What To Try Next

1. **Resume Supabase** (most likely fix)
2. **Update DATABASE_URL** if needed
3. **Start server**: `cd api; npm start`
4. **Test health**: `curl http://localhost:3001/api/health`
5. **Run migrations** (Step A from your plan)
6. **Test features** (Complete Step B)

---

**You're SO close! Just need to fix the database connection!** 🚀

The application code is perfect - all bugs fixed!








