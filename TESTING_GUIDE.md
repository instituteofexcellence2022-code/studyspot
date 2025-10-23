# 🧪 API Testing Guide

**Phase 1 Features Testing**

---

## ⚠️ Important Note

**Before Testing New Features:**
- ✅ Existing endpoints (auth, bookings, payments) - Work NOW
- ⏳ New Phase 1 endpoints - Need migrations first (007, 008, 009)

**New endpoints require:**
1. Run migration 007 (Student enhancements)
2. Run migration 008 (Invoices & expenses)
3. Run migration 009 (Audit & security)

---

## 🔥 Quick Test - Existing Features

### Test 1: Health Check
```bash
curl http://localhost:3001/api/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-10-22T...",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

### Test 2: Mock Authentication
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

### Test 3: Get Libraries
```bash
# Save the token from login
TOKEN="eyJhbGciOiJIUzI1NiIs..."

curl http://localhost:3001/api/libraries \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🆕 Phase 1 Features - Require Migrations First

### ⏳ Dashboard Endpoints (Need migration 007)
```bash
# ❌ Will fail until migration runs
GET /api/dashboard/metrics
GET /api/dashboard/revenue
GET /api/dashboard/activity
```

### ⏳ Enhanced Student Endpoints (Need migration 007)
```bash
# ❌ Will fail until migration runs
POST /api/students/bulk-import
GET /api/students/groups
POST /api/students/:id/kyc-verify
```

### ⏳ Invoice Endpoints (Need migration 008)
```bash
# ❌ Will fail until migration runs
POST /api/invoices
GET /api/invoices/revenue-analytics
POST /api/invoices/expenses
```

### ⏳ Audit Endpoints (Need migration 009)
```bash
# ❌ Will fail until migration runs
GET /api/audit/logs
GET /api/audit/security-events
GET /api/audit/sessions
```

---

## 📋 Testing Checklist

### Before Migrations:
- [ ] Health check works
- [ ] Can login (mock auth)
- [ ] Can access existing endpoints
- [ ] Backend server is running
- [ ] Database is connected

### After Migrations:
- [ ] Dashboard metrics work
- [ ] Student bulk import works
- [ ] Invoice generation works
- [ ] Audit logging works
- [ ] Session management works

---

## 🚀 Next Steps

1. **Test existing features** (what works now)
2. **Run migrations 007, 008, 009**
3. **Test new Phase 1 features**
4. **Deploy to production**

---

## 🛠️ Testing Tools

### Option 1: Postman
- Import API collection
- Set environment variables
- Run automated tests

### Option 2: cURL (Command line)
- Quick and scriptable
- Good for CI/CD
- Examples provided above

### Option 3: Thunder Client (VS Code)
- Built into VS Code
- Easy to use
- Save requests

---

## 📝 Test Results Template

```
✅ Health Check: PASSED
✅ Authentication: PASSED
✅ Get Libraries: PASSED
⏳ Dashboard Metrics: WAITING (needs migration)
⏳ Invoices: WAITING (needs migration)
⏳ Audit Logs: WAITING (needs migration)
```

---

Ready to test? Start the backend and try the health check!








