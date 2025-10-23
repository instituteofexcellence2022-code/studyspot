# 🌐 Browser Instructions - How to Login

## ⏳ Current Status
- ✅ API Server: Running on port 3001
- ⏳ Frontend: Still compiling (wait 30 more seconds)

---

## 🚨 IMPORTANT: What You Need to Do in Your Browser

### Step 1: Hard Refresh (REQUIRED!)
Your browser has **cached the old code**. You MUST clear it:

**Option A: Hard Refresh (Try this first)**
```
Press: Ctrl + Shift + R
```

**Option B: Incognito/Private Window**
```
Chrome: Ctrl + Shift + N
Edge: Ctrl + Shift + P
Then visit: http://localhost:3000
```

**Option C: Clear All Cache**
```
1. Press F12 (open DevTools)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"
```

---

## 🔐 CORRECT Demo Credentials

### ❌ WRONG (what you tried):
```
Email: admin@studyspot.com  ← This account doesn't exist!
Password: ••••••••
```

### ✅ CORRECT (use these instead):

**Owner Portal Demo:**
```
Email: owner@demo.com
Password: Demo123456
```

**OR just click the "Try Demo Account" button!** (easiest)

---

## 📋 Complete Login Steps

### After frontend finishes compiling:

1. **Wait** for the PowerShell window to show:
   ```
   Compiled successfully!
   You can now view studyspot-web-owner in the browser.
   ```

2. **Open** your browser to: http://localhost:3000

3. **Hard Refresh** first: Press `Ctrl + Shift + R`

4. **Login** using ONE of these methods:

   **Method 1: Demo Button (Easiest)** ⭐
   - Click the green "Try Demo Account" button
   - Done! You'll be logged in automatically

   **Method 2: Manual Login**
   - Email: `owner@demo.com`
   - Password: `Demo123456`
   - Click "Sign In"

   **Method 3: Create New Account**
   - Click "Create Account"
   - Fill in the form
   - Select role: Library Owner
   - Click "Sign Up"

---

## 🔍 How to Check if It's Working

### In Browser Console (Press F12):

**✅ Good Signs** (working correctly):
```
Environment loaded
API URL: http://localhost:3001
Connecting to: http://localhost:3001
```

**❌ Bad Signs** (still using old cache):
```
API URL: https://studyspot-api.render.com  ← OLD URL!
Cannot connect to server
```

If you see bad signs → **Hard refresh again!** (Ctrl + Shift + R)

---

## 📊 Diagnostic Blue Box

At the bottom of the login page, you should see a blue box:

```
API URL: http://localhost:3001  ← Should show THIS
Portal: Owner Portal
Environment: development
Version: 1.0.0
```

**If it shows a different API URL**, the cache hasn't cleared:
1. Close ALL browser tabs for localhost:3000
2. Close the browser completely
3. Reopen and visit http://localhost:3000
4. Hard refresh (Ctrl + Shift + R)

---

## 🆘 Troubleshooting

### Problem: Still seeing "Cannot connect to server"

**Solution 1: Clear Everything**
```
1. Close ALL localhost:3000 tabs
2. Press Ctrl + Shift + Delete
3. Select "All time"
4. Check "Cached images and files"
5. Click "Clear data"
6. Reopen http://localhost:3000
```

**Solution 2: Use Incognito**
```
1. Press Ctrl + Shift + N (Chrome) or Ctrl + Shift + P (Edge)
2. Visit http://localhost:3000
3. Should work immediately in private mode
```

**Solution 3: Check Browser Console**
```
1. Press F12
2. Go to Console tab
3. Look for red errors
4. Copy and send to me
```

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ Login page loads
2. ✅ No "Cannot connect" error
3. ✅ Blue diagnostic box shows: `http://localhost:3001`
4. ✅ Demo button works OR manual login works
5. ✅ You see the dashboard after login

---

## ⏰ Timeline

- **Right now**: Frontend is compiling (30 seconds left)
- **In 30 seconds**: Page will be ready
- **Then**: Hard refresh your browser (Ctrl + Shift + R)
- **Then**: Try demo login button

---

## 📞 What to Tell Me

If it still doesn't work after hard refresh:

1. **Press F12** (open browser console)
2. **Go to Console tab**
3. **Look for the line that says**: "API URL: ..."
4. **Tell me what URL it shows**

Example:
```
✅ Good: "API URL: http://localhost:3001"
❌ Bad: "API URL: https://studyspot-api.render.com"
```

If it shows the bad URL, your browser is STILL using cached code!

---

## 🎯 Quick Action Checklist

Do these in order:

- [ ] Wait for PowerShell to show "Compiled successfully!"
- [ ] Open browser to http://localhost:3000
- [ ] Press Ctrl + Shift + R (hard refresh)
- [ ] Check blue box shows "http://localhost:3001"
- [ ] Click "Try Demo Account" button
- [ ] See dashboard

**If checkbox 4 fails** (wrong URL in blue box):
- [ ] Close all browser tabs
- [ ] Clear browser cache (Ctrl + Shift + Delete)
- [ ] Or use Incognito mode (Ctrl + Shift + N)
- [ ] Try again

---

**Current Time**: Wait 30 more seconds for frontend to compile

**Next Action**: Hard refresh your browser when ready!


