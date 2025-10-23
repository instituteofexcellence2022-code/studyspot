# 🔍 LOGIN ISSUE DEBUG GUIDE

## ✅ SERVERS STATUS (CONFIRMED)

**API Server:** ✅ Running on port 3001
**Frontend:** ✅ Running on port 3000
**API Health:** ✅ Responding correctly

---

## 🐛 DEBUGGING STEPS

### **STEP 1: Check Browser Console**

1. **Open your browser** (http://localhost:3000)
2. **Press F12** to open DevTools
3. **Click "Console" tab**
4. **Look for these messages:**

**Expected on page load:**
```
✅ Environment Configuration Loaded:
  - API URL: http://localhost:3001
  - Portal: Library Owner Portal (owner)
  - Environment: development
```

**If you see different API URL:**
```
⚠️ PROBLEM: API URL is not http://localhost:3001
```
→ **Solution:** Restart the frontend server

---

### **STEP 2: Try Demo Login**

1. **Click "Try Demo Account"** button
2. **Watch the console for:**

**Success logs:**
```
🔄 Attempting demo login...
✅ Registration response: {...}
✅ Login response: {...}
✅ Demo account logged in successfully!
```

**Error logs:**
```
❌ Registration failed: [detailed error message]
❌ Login failed: [detailed error message]
```

3. **Check Network tab:**
   - Press F12 → Network tab
   - Click "Try Demo Account"
   - Look for requests to `http://localhost:3001/api/auth/...`
   - Click on failed requests to see response

---

### **STEP 3: Test API Directly**

**Open a new PowerShell window and run:**

```powershell
# Test registration endpoint
$body = @{
    email = "owner@demo.com"
    password = "Demo123456"
    firstName = "Demo"
    lastName = "Owner"
    phone = "+1234567890"
    role = "library_owner"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3001/api/auth/register `
    -Method POST `
    -ContentType "application/json" `
    -Body $body `
    -UseBasicParsing
```

**Expected response:**
- Status: 200 or 201 (success)
- Status: 409 (user already exists - this is OK!)
- Status: 500 (server error - need to fix)

---

### **STEP 4: Check Frontend .env File**

```powershell
# Check if .env exists
Test-Path web-owner\.env

# View contents
Get-Content web-owner\.env
```

**Expected content:**
```
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

**If missing or incorrect:**
```powershell
.\CREATE_ENV_FILES.bat
```

---

## 🔧 COMMON ISSUES & FIXES

### **Issue 1: "Cannot connect to server"**

**Symptoms:**
- Red error: "Cannot connect to server"
- Console shows: `ERR_CONNECTION_REFUSED`
- Network tab shows failed requests

**Solution:**
```powershell
# Restart API server
cd api
npm start
```

---

### **Issue 2: "Invalid email or password"**

**Symptoms:**
- Login button clicked
- Error: "Invalid email or password"

**Reasons:**
1. Demo account doesn't exist yet (should auto-register)
2. Wrong credentials
3. Database connection issue

**Solution:**
1. Check API terminal for errors
2. Try manual registration first
3. Check database connection in API logs

---

### **Issue 3: Environment variables not loading**

**Symptoms:**
- Console shows: `API URL: undefined` or wrong URL
- Diagnostic box shows incorrect values

**Solution:**
```powershell
# Stop frontend (Ctrl+C)
cd web-owner
# Delete cache
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
# Restart
npm start
```

---

### **Issue 4: CORS Error**

**Symptoms:**
- Console shows: `Access to fetch...has been blocked by CORS policy`

**Solution:**
Check `api/.env` has:
```
CORS_ORIGIN=http://localhost:3000,http://localhost:3002
```

---

### **Issue 5: Database Connection Error**

**Symptoms:**
- API terminal shows: `Database connection failed`
- Login fails silently

**Solution:**
```powershell
# Check API .env has correct database credentials
cd api
notepad .env
```

Expected:
```
DATABASE_URL=postgresql://postgres.zgrgryufcxgjbmpjiwbh:[password]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

---

## 🧪 QUICK TEST SCRIPT

**Run this to test everything:**

```powershell
Write-Host "🔍 SYSTEM CHECK" -ForegroundColor Cyan
Write-Host ""

# 1. Check API
Write-Host "1. Testing API..." -ForegroundColor Yellow
try {
    $health = Invoke-WebRequest -Uri http://localhost:3001/health -UseBasicParsing
    Write-Host "   ✅ API is running" -ForegroundColor Green
} catch {
    Write-Host "   ❌ API is NOT running" -ForegroundColor Red
}

# 2. Check Frontend
Write-Host "2. Testing Frontend..." -ForegroundColor Yellow
try {
    $frontend = Invoke-WebRequest -Uri http://localhost:3000 -UseBasicParsing
    Write-Host "   ✅ Frontend is running" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Frontend is NOT running" -ForegroundColor Red
}

# 3. Check .env
Write-Host "3. Checking .env files..." -ForegroundColor Yellow
if (Test-Path web-owner\.env) {
    Write-Host "   ✅ web-owner/.env exists" -ForegroundColor Green
    $apiUrl = Select-String -Path web-owner\.env -Pattern "REACT_APP_API_URL"
    Write-Host "   $apiUrl"
} else {
    Write-Host "   ❌ web-owner/.env NOT FOUND" -ForegroundColor Red
}

Write-Host ""
Write-Host "📋 Copy the above results and share them!" -ForegroundColor Cyan
```

---

## 📞 WHAT TO SHARE

**Please share these details:**

1. **Browser Console Logs** (F12 → Console tab)
   - Look for red errors
   - Copy any error messages

2. **Network Tab** (F12 → Network tab)
   - Try logging in
   - Look for failed requests (red)
   - Click on them and copy the response

3. **API Terminal Output**
   - Any errors or warnings
   - Database connection messages

4. **Environment Variable Check**
   ```powershell
   Get-Content web-owner\.env
   ```

5. **What happens when you click "Try Demo Account"?**
   - Error message shown?
   - Console logs?
   - Snackbar popup?

---

## 🚀 QUICK FIX ATTEMPTS

### **Try 1: Restart Everything**
```powershell
# Kill all processes
taskkill /F /IM node.exe /T

# Restart API
cd api
npm start

# In new terminal: Restart Frontend
cd web-owner
npm start
```

### **Try 2: Clear Cache & Restart**
```powershell
# Stop frontend
cd web-owner
Remove-Item -Recurse -Force node_modules\.cache
npm start
```

### **Try 3: Recreate .env Files**
```powershell
.\CREATE_ENV_FILES.bat
# Then restart frontend
```

---

## 🎯 MOST LIKELY CAUSES

Based on previous issues, most likely:

1. ✅ **Frontend .env not loaded** (50% chance)
   → Solution: Restart frontend after creating .env

2. ✅ **Browser cache issue** (30% chance)
   → Solution: Hard refresh (Ctrl+Shift+R) or incognito mode

3. ✅ **Database connection issue** (15% chance)
   → Solution: Check api/.env has correct DATABASE_URL

4. ✅ **CORS configuration** (5% chance)
   → Solution: Check api/.env has CORS_ORIGIN=http://localhost:3000

---

## 📱 CONTACT ME WITH:

1. **Screenshot of browser console** (F12 → Console)
2. **Screenshot of diagnostic box** (bottom of login page)
3. **What error message you see** (exact text)
4. **Result of this command:**
   ```powershell
   Get-Content web-owner\.env
   ```

I'll help you fix it! 💪


