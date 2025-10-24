# ⚡ QUICK START - Authentication Fix

**🎯 Goal**: Get login/registration working in 5 minutes

---

## 🚀 STEP 1: Create .env Files (1 minute)

**Double-click this file:**
```
CREATE_ENV_FILES_NOW.bat
```

✅ This creates all required .env files automatically.

---

## 🚀 STEP 2: Start API Server (30 seconds)

**Open PowerShell and run:**
```powershell
cd api
node src/index-unified.js
```

**Wait for:**
```
✅ Database connected successfully
✅ Server running on port: 3001
```

**Keep this window open!**

---

## 🚀 STEP 3: Start Owner Portal (1 minute)

**Open NEW PowerShell and run:**
```powershell
cd web-owner
npm start
```

**Wait for:**
```
Compiled successfully!
Local: http://localhost:3000
```

**Keep this window open too!**

---

## 🚀 STEP 4: Test Registration (2 minutes)

1. **Open browser**: http://localhost:3000
2. **Click**: "Create Account"
3. **Fill form**:
   - Email: `test@example.com`
   - Password: `Test123456`
   - Role: Library Owner
4. **Click**: "Create Account"
5. **Expected**: Success message, redirect to login

---

## 🚀 STEP 5: Test Login (30 seconds)

1. **On login page**, enter:
   - Email: `test@example.com`
   - Password: `Test123456`
2. **Click**: "Sign In"
3. **Expected**: Redirect to dashboard

---

## ✅ SUCCESS!

If you see the dashboard after login, authentication is working! 🎉

---

## ❌ IF IT DOESN'T WORK:

1. **Press F12** in browser
2. **Look for errors** in Console tab
3. **Check API server** console for errors
4. **Read**: `COMPLETE_FIX_GUIDE.md` for detailed troubleshooting

---

## 📋 COMMON ERRORS

| Error | Solution |
|-------|----------|
| "Cannot connect to server" | Check API server is running |
| "Port already in use" | `Stop-Process -Name node -Force` |
| "CORS policy blocked" | Verify .env files created correctly |
| "Invalid credentials" | Register first, then login |
| "Database connection failed" | Check internet connection |

---

## 🔍 VERIFY .env FILES EXIST

Run this to check:
```powershell
dir api\.env
dir web-owner\.env
dir web-admin\.env
```

All three should exist!

---

**Total Time**: 5-10 minutes  
**Difficulty**: Easy  
**Prerequisites**: None (just follow the steps)





