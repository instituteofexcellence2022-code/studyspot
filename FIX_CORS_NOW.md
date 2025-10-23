# 🔧 FIX CORS ERROR - Registration Issue

## ⚠️ PROBLEM IDENTIFIED

Your API is blocking requests from your Vercel frontend because CORS is not configured!

**Current CORS Setting:**
```
CORS_ORIGIN = http://localhost:3000  (Only allows localhost)
```

**Your Frontend:**
```
https://studyspot-rose.vercel.app  (BLOCKED!)
```

---

## ✅ SOLUTION: Add CORS_ORIGIN to Render

### Step 1: Go to Render Dashboard
1. Open: https://dashboard.render.com
2. Click on **"studyspot-api"** service

### Step 2: Add Environment Variable
1. Click **"Environment"** tab (left sidebar)
2. Click **"Add Environment Variable"** button

### Step 3: Add This Variable

**NAME (left box):**
```
CORS_ORIGIN
```

**VALUE (right box):**
```
https://studyspot-rose.vercel.app
```

### Step 4: Save and Redeploy
1. Click **"Save Changes"**
2. Render will automatically redeploy (takes ~1 minute)
3. Wait for "Live" status

---

## ⏱️ QUICK FIX (Copy-Paste)

**Variable Name:**
```
CORS_ORIGIN
```

**Variable Value:**
```
https://studyspot-rose.vercel.app
```

---

## 🧪 After Fix - Test Registration

1. Wait 1-2 minutes for Render to redeploy
2. Go to: https://studyspot-rose.vercel.app/register
3. Try registering again
4. Should work! ✅

---

## 📝 EXPECTED RESULT

**Before Fix:**
```
❌ Network Error
❌ CORS policy error
❌ Registration failed
```

**After Fix:**
```
✅ Registration successful
✅ User created
✅ Redirected to dashboard
```

---

## 💡 ALTERNATIVE: Allow All Origins (NOT RECOMMENDED for production)

If you want to allow ANY domain (for testing only):

**Variable Value:**
```
*
```

But use the specific domain for security!

---

## 🚨 TELL ME WHEN:

- ✅ "added" - When you've added the CORS_ORIGIN variable
- ✅ "deployed" - When Render shows "Live" again
- ✅ "works" - When registration succeeds!









