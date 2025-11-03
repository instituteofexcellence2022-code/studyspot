# Development Authentication Bypass

## Quick Access (No Registration Required)

### Method 1: Direct URL
1. Visit: **https://studyspot-student.vercel.app/dev-bypass**
2. You'll be automatically logged in as a dev user
3. Redirects to dashboard immediately

### Method 2: Browser Console
1. Open https://studyspot-student.vercel.app
2. Press F12 (open DevTools)
3. Go to Console tab
4. Paste and run:
```javascript
localStorage.setItem('bypassAuth', 'true');
localStorage.setItem('user', JSON.stringify({id: 'dev-user-123', email: 'dev@studyspot.com', firstName: 'Dev', lastName: 'User', role: 'student'}));
localStorage.setItem('token', 'dev-mock-token-bypass');
location.reload();
```
5. Page will reload and you'll be logged in

### Method 3: Local Storage (Before Loading)
1. Open https://studyspot-student.vercel.app
2. Press F12 → Application tab → Local Storage
3. Add these keys manually:
   - Key: `bypassAuth` → Value: `true`
   - Key: `token` → Value: `dev-mock-token-bypass`
   - Key: `user` → Value: `{"id":"dev-user-123","email":"dev@studyspot.com","firstName":"Dev","lastName":"User","role":"student"}`
4. Refresh the page

---

## To Disable Bypass (Return to Normal Login)
```javascript
localStorage.removeItem('bypassAuth');
localStorage.removeItem('user');
localStorage.removeItem('token');
location.reload();
```

---

## What This Does
- Skips authentication completely
- Creates a mock dev user
- Allows testing all features without backend registration
- **Note:** API calls may still fail if backend endpoints require real authentication

---

## Backend Issue Debug
The current registration failure is likely due to:
1. ✅ **FIXED:** Missing `/api` prefix on endpoints
2. ✅ **FIXED:** Response structure mismatch
3. ⚠️ **POSSIBLE:** CORS still blocking requests
4. ⚠️ **POSSIBLE:** Backend not fully deployed yet

---

## Test Features Available
After bypass, you can test:
- ✅ Dashboard (with mock data)
- ✅ Library Discovery (real API if CORS works)
- ✅ Seat Booking (UI complete)
- ✅ Profile Management
- ✅ QR Scanner (UI)
- ✅ Attendance Tracking (UI)
- ✅ Study Timer (Pomodoro)
- ✅ Rewards System (UI)

