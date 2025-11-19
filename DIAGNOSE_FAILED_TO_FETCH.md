# 🔍 DIAGNOSE "FAILED TO FETCH" ERROR

## ✅ WHAT'S WORKING

- ✅ API Gateway is live and responding
- ✅ CORS is configured correctly (includes localhost:5173)
- ✅ CORS preflight (OPTIONS) works
- ✅ Database is connected

## ❓ WHAT COULD BE WRONG

Since CORS is already set correctly, the issue is likely:

1. **Render Cold Start** - Service waking up (30-60 seconds)
2. **Portal not fully loaded** - JavaScript still initializing
3. **Wrong API URL** - Portal calling wrong endpoint
4. **Browser cache** - Old failed requests cached
5. **Network timeout** - Request timing out before Render wakes

---

## 🧪 STEP-BY-STEP DIAGNOSIS

### **STEP 1: Open Browser DevTools**

1. Open your student portal: http://localhost:5173
2. Press **`F12`** to open DevTools
3. Go to **"Console"** tab
4. Go to **"Network"** tab

### **STEP 2: Try to Register/Login**

1. Fill in the registration form
2. Click "Register"
3. **Watch the Console tab** for errors
4. **Watch the Network tab** for failed requests

### **STEP 3: Check What You See**

#### **Option A: CORS Error**
```
❌ Access to fetch at 'https://studyspot-api.onrender.com/api/auth/register' 
   from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution**: CORS still not updated correctly
- Go to Render → Environment
- Verify `CORS_ORIGIN` includes `http://localhost:5173`
- Redeploy
- Hard refresh browser (`Ctrl + Shift + R`)

---

#### **Option B: Network Error / Failed to Fetch (No Details)**
```
❌ POST https://studyspot-api.onrender.com/api/auth/register
   Failed to fetch
```

**Possible Causes**:
1. **Render is asleep** - Takes 30-60 seconds to wake up
2. **Request timeout** - Portal timeout too short
3. **SSL/Certificate issue**
4. **Network connectivity**

**Solution**: Wait and retry
```bash
# Wake up backend first
Invoke-WebRequest -Uri "https://studyspot-api.onrender.com/health"
# Wait 30 seconds, then try portal again
```

---

#### **Option C: 401 Unauthorized**
```
❌ POST https://studyspot-api.onrender.com/api/auth/register
   Status: 401 Unauthorized
```

**Cause**: Wrong credentials or validation error

**Solution**: Check request payload in Network tab → Preview/Response

---

#### **Option D: 500 Internal Server Error**
```
❌ POST https://studyspot-api.onrender.com/api/auth/register
   Status: 500 Internal Server Error
```

**Cause**: Backend crash or database error

**Solution**: Check Render logs
- Go to Render → `studyspot-api` → Logs
- Look for error at the timestamp of your request

---

#### **Option E: Request Pending Forever**
```
⏳ POST https://studyspot-api.onrender.com/api/auth/register
   Status: (pending)
```

**Cause**: 
- Backend is waking up (cold start)
- Request timeout too long
- Backend hung/crashed

**Solution**: 
1. Check if backend is running (Render → Logs)
2. Wake up backend manually first
3. Increase timeout in portal code

---

## 🔧 IMMEDIATE FIXES TO TRY

### **Fix 1: Wake Up Backend First**

Before testing portal, wake up the backend:

```powershell
# Run this first
Invoke-WebRequest -Uri "https://studyspot-api.onrender.com/health"

# Wait for response (may take 30-60 seconds on first call)
# Then test portal
```

---

### **Fix 2: Hard Refresh Browser**

Browser might have cached the failed request:

- **Chrome/Edge**: `Ctrl + Shift + R`
- **Firefox**: `Ctrl + F5`
- **Or**: Clear browser cache completely

---

### **Fix 3: Check Portal is Using Correct URL**

Open browser console and run:

```javascript
console.log('API URL:', import.meta.env.VITE_API_URL);
console.log('Auth URL:', import.meta.env.VITE_AUTH_URL);
```

**Expected**: Should show `https://studyspot-api.onrender.com` or `undefined` (falls back to default)

**If wrong**: The portal has environment variables set incorrectly

---

### **Fix 4: Test API Directly from Browser Console**

With portal open (http://localhost:5173), run in browser console:

```javascript
fetch('https://studyspot-api.onrender.com/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    password: 'TestPass123!',
    role: 'student'
  })
})
.then(res => res.json())
.then(data => console.log('✅ Success:', data))
.catch(err => console.error('❌ Error:', err));
```

**If this works**: Portal code has an issue  
**If this fails**: API or network has an issue

---

## 🐛 COMMON ISSUES & SOLUTIONS

### **Issue 1: Render Cold Start (Most Common)**

**Symptoms**:
- First request fails or times out
- Second request works fine
- Happens after 15+ min of no activity

**Solution**:
1. Accept it (Render free tier limitation)
2. Use the wake-up script before testing
3. Or upgrade to Render paid plan ($7/mo)

**Workaround**:
```bash
# Create: WAKE_AND_TEST.bat
Invoke-WebRequest -Uri "https://studyspot-api.onrender.com/health"
echo "Waiting for backend to wake up..."
Start-Sleep -Seconds 30
echo "Backend should be awake now. Test your portal!"
cd studyspot-student-pwa
npm run dev
```

---

### **Issue 2: Browser Extensions Blocking**

**Symptoms**: Works in incognito mode, fails in normal mode

**Solution**: 
- Disable ad blockers
- Disable privacy extensions
- Test in incognito mode

---

### **Issue 3: Network/Firewall**

**Symptoms**: API works in PowerShell but fails in browser

**Solution**:
- Check Windows Firewall
- Check antivirus software
- Try different browser

---

### **Issue 4: Portal Timeout Too Short**

Your portal has 10-second timeout (set in `tenantSdk.ts`):

```typescript
requestTimeoutMs: 10000, // 10 seconds
```

If Render is waking up (30-60 seconds), request will timeout!

**Solution**: Increase timeout temporarily:

```typescript
// In studyspot-student-pwa/src/services/tenantSdk.ts
requestTimeoutMs: 60000, // 60 seconds for cold starts
```

---

## 🎯 DIAGNOSTIC CHECKLIST

Run through this checklist:

- [ ] Backend is awake (test health endpoint)
- [ ] CORS includes localhost:5173
- [ ] Browser cache cleared (`Ctrl + Shift + R`)
- [ ] No CORS errors in console
- [ ] Network tab shows the request
- [ ] Request doesn't stay pending forever
- [ ] No browser extensions blocking
- [ ] Portal runs on correct port (5173)
- [ ] API URL is correct in portal

---

## 📊 WHAT TO SEND ME

If still failing, check browser DevTools and tell me:

1. **Console tab**: What errors do you see?
2. **Network tab**: 
   - What's the request URL?
   - What's the status code?
   - What's the response body?
3. **Timing**: Does it fail immediately or after waiting?

**Screenshot these and share with me!**

---

## 🚀 QUICK TEST SEQUENCE

Try this exact sequence:

```powershell
# 1. Wake up backend
Invoke-WebRequest -Uri "https://studyspot-api.onrender.com/health"

# 2. Wait
Start-Sleep -Seconds 30

# 3. Test API directly
Invoke-WebRequest -Uri "https://studyspot-api.onrender.com/api/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"firstName":"Test","lastName":"User","email":"test@example.com","password":"TestPass123!","role":"student"}'

# If step 3 works, the API is fine. Issue is in portal.
# If step 3 fails, check Render logs.
```

---

**Now**: Open your browser DevTools (F12) and tell me what you see in Console and Network tabs! 🔍


