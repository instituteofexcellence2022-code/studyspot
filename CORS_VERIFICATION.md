# 🔗 CORS VERIFICATION GUIDE

## ✅ **VERIFY CORS IN RENDER**

### **Check Backend CORS Configuration:**

1. **Go to Render:**
   - https://dashboard.render.com
   - Click **`studyspot-api`**
   - Click **"Environment"** tab

2. **Find CORS_ORIGIN variable**

3. **It MUST include all 3 portal URLs:**

```
CORS_ORIGIN = https://studyspot-student.vercel.app,https://studyspot-librarys.vercel.app,https://studyspot-admin-2.vercel.app
```

**Important:**
- ✅ No spaces between URLs
- ✅ Comma-separated
- ✅ All 3 URLs included
- ✅ Use https:// (not http://)

---

## 🧪 **TEST CORS IS WORKING**

### **Method 1: Browser Console Test**

1. Open any portal (e.g., Student Portal)
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Paste this:
   ```javascript
   fetch('https://studyspot-api.onrender.com/health')
     .then(r => r.json())
     .then(data => console.log('✅ CORS Working:', data))
     .catch(err => console.error('❌ CORS Error:', err))
   ```
5. Press Enter

**✅ Expected:** Shows "✅ CORS Working: {success: true, ...}"
**❌ Bad:** Shows "CORS policy" error

---

### **Method 2: Check Console for Errors**

1. Open each portal
2. Press F12
3. Look for red errors

**❌ CORS Error looks like:**
```
Access to fetch at 'https://studyspot-api.onrender.com/api/...' 
from origin 'https://studyspot-student.vercel.app' 
has been blocked by CORS policy
```

**✅ No CORS errors:** Good to go!

---

## 🔧 **IF CORS IS WRONG, UPDATE IT:**

### **Correct CORS_ORIGIN value:**
```
https://studyspot-student.vercel.app,https://studyspot-librarys.vercel.app,https://studyspot-admin-2.vercel.app
```

**Also add localhost for development (optional):**
```
https://studyspot-student.vercel.app,https://studyspot-librarys.vercel.app,https://studyspot-admin-2.vercel.app,http://localhost:3000,http://localhost:3001,http://localhost:3002
```

---

## 📋 **INTERCONNECTION CHECKLIST**

### **Student Portal → Backend:**
- [ ] vercel.json has `VITE_API_URL`
- [ ] Points to: `https://studyspot-api.onrender.com`
- [ ] CORS allows: `studyspot-student.vercel.app`
- [ ] No CORS errors in console

### **Owner Portal → Backend:**
- [ ] vercel.json has `REACT_APP_API_URL`
- [ ] Points to: `https://studyspot-api.onrender.com`
- [ ] CORS allows: `studyspot-librarys.vercel.app`
- [ ] No CORS errors in console

### **Admin Portal → Backend:**
- [ ] vercel.json has `REACT_APP_API_URL`
- [ ] Points to: `https://studyspot-api.onrender.com`
- [ ] CORS allows: `studyspot-admin-2.vercel.app`
- [ ] No CORS errors in console

---

## 🎯 **QUICK TEST (All Portals)**

Open these in browser and check console (F12):

1. https://studyspot-student.vercel.app
2. https://studyspot-librarys.vercel.app
3. https://studyspot-admin-2.vercel.app

**No red CORS errors = ✅ Working!**

---

## 💬 **REPORT YOUR FINDINGS:**

Tell me:
- **"No CORS errors in any portal ✅"** → All connected!
- **"Student works, others show CORS error"** → Need to fix CORS
- **"All show CORS errors"** → CORS_ORIGIN not set
- **"What's CORS_ORIGIN in Render?"** → Check and paste it

Let me know! 🔗🚀

