# 🔧 Common Issues and Fixes - StudySpot Platform

## 📋 Quick Diagnosis

Run this first: **`DIAGNOSE_AND_FIX.bat`** - It will automatically detect and fix most issues!

---

## 🐛 Common Issues

### 1. **"Cannot find module" errors**

**Symptoms:**
```
Error: Cannot find module 'express'
Error: Cannot find module 'react'
```

**Fix:**
```bash
# Install API dependencies
cd api
npm install

# Install Web dependencies
cd ../web
npm install
```

---

### 2. **"Port 3000/3001 already in use"**

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Fix Option A - Kill processes:**
```powershell
# Kill all Node.js processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```

**Fix Option B - Find and kill specific port:**
```powershell
# For port 3001 (API)
netstat -ano | findstr :3001
taskkill /F /PID <PID_NUMBER>

# For port 3000 (Web)
netstat -ano | findstr :3000
taskkill /F /PID <PID_NUMBER>
```

---

### 3. **".env file missing" errors**

**Symptoms:**
```
Database configuration incomplete
JWT_SECRET not configured
```

**Fix:**

**API .env file** (`api/.env`):
```env
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=dev_jwt_secret_key_change_in_production_123456789
JWT_EXPIRES_IN=7d

# Database - Using SQLite for demo
DATABASE_URL=sqlite:./data/studyspot.db

# Optional services (leave empty for demo)
STRIPE_SECRET_KEY=
SENDGRID_API_KEY=
TWILIO_ACCOUNT_SID=
```

**Web .env file** (`web/.env`):
```env
REACT_APP_API_URL=http://localhost:3001
```

---

### 4. **"Database connection failed"**

**Symptoms:**
```
Database connection failed: SASL: SCRAM-SERVER-FIRST-MESSAGE
❌ CRITICAL: Database connection failed
```

**Fix:**

The demo server uses **SQLite** (no database server needed). Make sure you're running:
```bash
cd api
node src/index-demo-simple.js
```

NOT:
```bash
node src/index-unified.js  # ❌ This requires PostgreSQL
```

---

### 5. **"Compiled with problems" (React/TypeScript errors)**

**Symptoms:**
```
ERROR in src/components/tenant/BrandingStep.tsx
TS2769: No overload matches this call
```

**Fix:**

These were already fixed in the codebase. Try:
```bash
# Clear TypeScript cache
cd web
rd /s /q node_modules\.cache
npm start
```

---

### 6. **"Login failed" or "Registration failed"**

**Symptoms:**
- Login button doesn't work
- Error messages in console

**Fix:**

1. **Make sure API is running** on port 3001:
   ```
   http://localhost:3001/health
   ```
   Should return: `{"status": "healthy"}`

2. **Check CORS settings** in `api/.env`:
   ```env
   CORS_ORIGIN=http://localhost:3000
   ```

3. **Use demo credentials** (if database is seeded):
   - Email: `admin@example.com`
   - Password: `password123`

---

### 7. **"Cannot GET /api-docs" (Swagger not working)**

**Symptoms:**
- API documentation page not loading

**Fix:**

The demo server has limited Swagger documentation. Access it at:
```
http://localhost:3001/api-docs
```

If not working, check:
1. API server is running
2. You're using the correct port (3001)

---

### 8. **"npm ERR! code ENOENT" (Missing package.json)**

**Symptoms:**
```
npm ERR! code ENOENT
npm ERR! syscall open
```

**Fix:**

Make sure you're in the correct directory:
```bash
# For API
cd api
npm install

# For Web
cd web
npm install
```

---

### 9. **Web app shows blank page**

**Symptoms:**
- Browser shows blank white page
- Console errors about API calls

**Fix:**

1. **Check API is running:**
   ```
   http://localhost:3001/health
   ```

2. **Check web .env file** (`web/.env`):
   ```env
   REACT_APP_API_URL=http://localhost:3001
   ```

3. **Clear browser cache and reload:**
   - Press `Ctrl + Shift + R` (hard reload)

4. **Restart web server:**
   ```bash
   cd web
   npm start
   ```

---

### 10. **"PowerShell syntax error" (&&, ||, etc.)**

**Symptoms:**
```
The token '&&' is not a valid statement separator
```

**Fix:**

In PowerShell, use `;` instead of `&&`:
```powershell
# ❌ Wrong:
cd web && npm start

# ✅ Correct:
cd web; npm start
```

Or use `.bat` files instead (they work correctly).

---

## 🚀 Quick Start (If Nothing Works)

1. **Clean slate:**
   ```powershell
   # Kill all Node processes
   Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
   ```

2. **Run automated fix:**
   ```
   DIAGNOSE_AND_FIX.bat
   ```

3. **Or manual start:**
   ```bash
   # Terminal 1 - API
   cd api
   node src/index-demo-simple.js

   # Terminal 2 - Web
   cd web
   npm start
   ```

---

## 🆘 Still Having Issues?

### Check this:

1. ✅ **Node.js installed?** Run: `node --version` (should be v16+)
2. ✅ **In correct directory?** Run: `pwd` or `cd` (should be in `om/`)
3. ✅ **Dependencies installed?** Check if `node_modules/` exists in `api/` and `web/`
4. ✅ **Ports available?** Ports 3000 and 3001 should be free
5. ✅ **Environment files?** Both `api/.env` and `web/.env` should exist

### Get detailed logs:

```bash
# API logs
cd api
node src/index-demo-simple.js > api-log.txt 2>&1

# Web logs
cd web
npm start > web-log.txt 2>&1
```

Then check the log files for specific errors.

---

## 📞 Emergency Recovery

If **absolutely nothing works**, try this complete reset:

```powershell
# 1. Kill all processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Delete dependencies (optional, only if really needed)
Remove-Item -Path "api\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "web\node_modules" -Recurse -Force -ErrorAction SilentlyContinue

# 3. Reinstall
cd api
npm install
cd ..\web
npm install
cd ..

# 4. Start fresh
DIAGNOSE_AND_FIX.bat
```

---

**Good luck! 🚀 Most issues are resolved by running `DIAGNOSE_AND_FIX.bat`**


