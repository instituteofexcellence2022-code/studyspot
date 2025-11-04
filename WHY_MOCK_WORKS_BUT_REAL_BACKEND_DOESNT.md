# 🔍 WHY MOCK WORKS BUT REAL BACKEND DOESN'T

**Date:** November 4, 2025  
**Question:** "If mock is working then why real is not working?"

---

## 📊 **THE SIMPLE ANSWER:**

### **Mock Authentication:** ✅
```
Frontend (Browser)
    ↓
localStorage (Your Computer)
    ↓
✅ No network, no server, no database needed!
```

### **Real Backend:** ❌
```
Frontend (Browser)
    ↓
Network Request
    ↓
Backend Server (Render.com)
    ↓
⚠️ FAILS HERE! Why? See below...
```

---

## 🔍 **THE REAL PROBLEM: Backend Issues**

Your backend is deployed on **Render.com** at:
```
https://studyspot-api.onrender.com
```

### **Possible Issues:**

#### **1. Backend Server is Sleeping** 💤
**Problem:**
- Render free tier sleeps after 15 minutes of inactivity
- Takes 30-60 seconds to wake up
- First request times out

**Evidence:**
```
⚠️ Backend unavailable, switching to MOCK authentication
```

**Solution:**
- Wait 60 seconds and try again
- Backend will wake up
- OR: Upgrade Render plan ($7/month for always-on)

---

#### **2. Database Connection Issues** 🗄️
**Problem:**
- Backend connects to PostgreSQL
- Database might be down/full/not responding
- Backend crashes or can't start

**Common Errors:**
```
Connection timeout
Database connection failed
ECONNREFUSED
```

**Check:**
```bash
# Visit backend health endpoint
https://studyspot-api.onrender.com/health
```

---

#### **3. Environment Variables Missing** ⚙️
**Problem:**
- Backend needs `DATABASE_URL`, `JWT_SECRET`, etc.
- If missing → backend can't start

**Check on Render:**
- Go to Render dashboard
- Check Environment Variables
- Make sure all required vars are set

---

#### **4. CORS Configuration** 🚫
**Problem:**
- Backend only allows specific origins
- Your `localhost:3000` might not be allowed

**Current CORS Config:**
```javascript
// Backend only allows:
- localhost:3002 (old Student PWA port)
- *.vercel.app domains
```

**Your Frontend:**
```
localhost:3000 (Owner Portal) ❌ NOT ALLOWED!
localhost:3001 (Student PWA) ❌ NOT ALLOWED!
```

**Solution:**
- Update backend CORS to allow `localhost:3000` and `localhost:3001`

---

#### **5. API Endpoints Don't Exist** 🛤️
**Problem:**
- Frontend calls: `/api/auth/login`
- Backend has: `/api/auth/admin/login` or different path

**Check:**
```bash
# Test if endpoint exists
curl https://studyspot-api.onrender.com/api/auth/login

# vs

curl https://studyspot-api.onrender.com/api/auth/admin/login
```

---

#### **6. Request Timeout** ⏱️
**Problem:**
- Network slow
- Server slow to respond
- Request times out before completion

**Frontend Timeout:**
```typescript
signal: AbortSignal.timeout(10000) // 10 seconds
```

If backend takes longer → timeout → mock mode activated

---

## 🔧 **HOW TO DEBUG:**

### **Step 1: Check Backend Health**
<function_calls>
<invoke name="run_terminal_cmd">
<parameter name="command">curl -v https://studyspot-api.onrender.com/health

