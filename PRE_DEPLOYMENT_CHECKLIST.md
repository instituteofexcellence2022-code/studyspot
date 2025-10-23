# ✅ PRE-DEPLOYMENT CHECKLIST

**Complete these steps BEFORE deploying to ensure everything is ready!**

---

## 🗄️ **STEP 0: UPDATE DATABASE** ⭐ **DO THIS FIRST!**

**Time**: 2-3 minutes  
**Why**: Ensures your database has all Phase 1 features

### Quick Method (Recommended):

**Just double-click this file:**
```
UPDATE_DATABASE.bat
```

### What It Does:
- ✅ Runs all 9 database migrations
- ✅ Adds enhanced role system (6 roles + 70+ permissions)
- ✅ Adds student groups & KYC verification
- ✅ Adds GST-compliant invoicing
- ✅ Adds expense tracking
- ✅ Adds comprehensive audit trail
- ✅ Adds security event monitoring
- ✅ Adds session management

### Manual Method:

If the batch file doesn't work, run these commands:

```powershell
cd api
node -e "require('dotenv').config(); const { Pool } = require('pg'); const fs = require('fs'); const path = require('path'); async function run() { const pool = new Pool({ host: process.env.DB_HOST, port: process.env.DB_PORT, database: process.env.DB_NAME, user: process.env.DB_USER, password: process.env.DB_PASSWORD, ssl: { rejectUnauthorized: false } }); const files = fs.readdirSync('migrations').filter(f => f.endsWith('.sql')).sort(); for (const f of files) { console.log('Running:', f); try { await pool.query(fs.readFileSync(path.join('migrations', f), 'utf8')); console.log('✅', f); } catch(e) { console.log('⚠️ ', f, e.message.includes('already exists') ? '(already applied)' : e.message); } } await pool.end(); } run();"
cd ..
```

### Verify It Worked:

1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Go to your project → Table Editor
3. Check for these NEW tables:
   - ✅ `student_groups`
   - ✅ `student_group_members`
   - ✅ `invoices`
   - ✅ `expenses`
   - ✅ `audit_logs`
   - ✅ `user_sessions`
   - ✅ `security_events`

✅ **DATABASE UPDATED!**

---

## 🔍 **STEP 1: CHECK YOUR CREDENTIALS**

**Time**: 2 minutes

### Database Credentials (Supabase):

Open `api/.env` and verify these are set:
```
DB_HOST=db.xxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=[your-password]
```

**Test Database Connection:**
```powershell
cd api
npm test
```

Should show: ✅ "Database connected"

### API Credentials:

Check `api/.env` has:
```
JWT_SECRET=[long-random-string]
CORS_ORIGIN=https://studyspot-rose.vercel.app
```

✅ **CREDENTIALS VERIFIED!**

---

## 🧪 **STEP 2: TEST API LOCALLY**

**Time**: 3 minutes

### Start the API:
```powershell
cd api
npm start
```

Wait for:
```
✅ Server running on port 3001
✅ Database connected successfully
```

### Test API Endpoints:

Open browser and test:
- http://localhost:3001/health
  - Should return: `{"status":"ok"}`

- http://localhost:3001/api/auth/test
  - Should return: `{"message":"API is working"}`

✅ **API WORKING!**

---

## 🌐 **STEP 3: VERIFY RENDER DEPLOYMENT**

**Time**: 2 minutes

### Check Backend API:

1. Go to: https://studyspot-api.onrender.com/health
   - Should return: `{"status":"ok"}`

2. If it takes 30 seconds, that's normal (free tier sleeps)

3. Check Render Dashboard:
   - Go to: https://dashboard.render.com/
   - Find: `studyspot-api`
   - Status should be: **"Live"** (green)

### Check Environment Variables:

In Render dashboard, verify these are set:
- ✅ `DB_HOST` (Supabase host)
- ✅ `DB_PASSWORD` (Supabase password)
- ✅ `JWT_SECRET`
- ✅ `CORS_ORIGIN` (we'll update this in deployment)

✅ **RENDER VERIFIED!**

---

## 📦 **STEP 4: CHECK PORTAL CODE**

**Time**: 2 minutes

### Owner Portal:
```powershell
cd web-owner
npm install
```

Check for errors. Should complete successfully.

### Admin Portal:
```powershell
cd web-admin
npm install
```

Check for errors. Should complete successfully.

✅ **PORTALS READY!**

---

## 📋 **FINAL CHECKLIST**

Before proceeding to deployment, confirm:

- [ ] ✅ Database updated (ran UPDATE_DATABASE.bat)
- [ ] ✅ Can see new tables in Supabase
- [ ] ✅ api/.env file exists with correct credentials
- [ ] ✅ Backend API running on Render (studyspot-api)
- [ ] ✅ API health check working (returns status: ok)
- [ ] ✅ web-owner dependencies installed
- [ ] ✅ web-admin dependencies installed
- [ ] ✅ No compilation errors in either portal

---

## 🎯 **YOU'RE READY!**

If all checks above passed, you're ready to deploy! 🚀

**Next Steps:**

1. Open: `DEPLOY_NOW_STEP_BY_STEP.md`
2. Follow STEP 1: Fix CORS
3. Follow STEP 2: Test locally
4. Follow STEP 3: Deploy to Vercel

---

## 🆘 **TROUBLESHOOTING**

### "Database connection failed"
- Check Supabase is active (not paused)
- Verify DB_PASSWORD in api/.env
- Check DB_HOST is correct

### "Migration failed"
- Some tables might already exist (that's OK!)
- Check Supabase dashboard for errors
- Try running migrations one at a time

### "API not starting"
- Make sure port 3001 is not in use
- Check api/.env file exists
- Run `npm install` in api directory

### "npm install errors"
- Delete node_modules folder
- Delete package-lock.json
- Run `npm install` again

---

## 💰 **COST CHECK**

Current monthly cost: **$0**
- Database (Supabase): $0
- Backend (Render): $0
- Deployment will remain: $0

---

**Status**: Pre-deployment checks ready! ✅  
**Time Required**: ~10 minutes  
**Next**: DEPLOY_NOW_STEP_BY_STEP.md


