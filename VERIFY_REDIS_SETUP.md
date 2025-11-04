# ✅ REDIS SETUP VERIFICATION SCRIPT

## **QUICK CHECK - Is Redis Working?**

### **Method 1: Browser (Easiest)**

Open this URL in your browser:
```
https://YOUR-BACKEND-NAME.onrender.com/api/health/detailed
```

**Replace `YOUR-BACKEND-NAME` with your actual Render service name**

**Look for:**
```json
{
  "services": {
    "redis": {
      "status": "healthy"
    }
  }
}
```

✅ **If you see this, Redis is working!**

---

### **Method 2: Terminal (PowerShell)**

```powershell
# Replace YOUR-BACKEND-NAME with your actual service name
$backendUrl = "https://YOUR-BACKEND-NAME.onrender.com"

# Test health endpoint
Write-Host "Testing Redis connection..." -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "$backendUrl/api/health/detailed" -Method Get

# Check Redis status
if ($response.data.services.redis.status -eq "healthy") {
    Write-Host "✅ Redis is WORKING!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Redis Details:" -ForegroundColor Cyan
    Write-Host "  Status: $($response.data.services.redis.status)"
    Write-Host ""
} else {
    Write-Host "❌ Redis is NOT working" -ForegroundColor Red
    Write-Host "  Status: $($response.data.services.redis.status)"
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Check REDIS_URL is set in Render environment"
    Write-Host "  2. Verify Redis instance is running"
    Write-Host "  3. Check backend logs for errors"
}
```

**Save as `test-redis.ps1` and run:**
```powershell
.\test-redis.ps1
```

---

### **Method 3: Test Cache Speed**

```powershell
# Replace YOUR-BACKEND-NAME
$backendUrl = "https://YOUR-BACKEND-NAME.onrender.com"

Write-Host "Testing cache performance..." -ForegroundColor Yellow
Write-Host ""

# First request (no cache)
Write-Host "First request (database):" -ForegroundColor Cyan
$start1 = Get-Date
Invoke-RestMethod -Uri "$backendUrl/api/libraries" | Out-Null
$time1 = ((Get-Date) - $start1).TotalMilliseconds
Write-Host "  Time: $([math]::Round($time1, 0))ms" -ForegroundColor White

Start-Sleep -Seconds 1

# Second request (with cache)
Write-Host "Second request (Redis cache):" -ForegroundColor Cyan
$start2 = Get-Date
Invoke-RestMethod -Uri "$backendUrl/api/libraries" | Out-Null
$time2 = ((Get-Date) - $start2).TotalMilliseconds
Write-Host "  Time: $([math]::Round($time2, 0))ms" -ForegroundColor White

Write-Host ""
if ($time2 -lt ($time1 / 2)) {
    Write-Host "✅ Cache is working! $(([math]::Round($time1 / $time2, 1)))x faster" -ForegroundColor Green
} else {
    Write-Host "⚠️  Cache may not be working (times are similar)" -ForegroundColor Yellow
}
```

**Save as `test-cache-speed.ps1` and run:**
```powershell
.\test-cache-speed.ps1
```

---

## **WHAT EACH STATUS MEANS**

### ✅ **"status": "healthy"**
- Redis is connected
- Cache is working
- Everything is good!

### ⚠️ **"status": "disabled"**
- REDIS_URL not set
- Backend running without cache
- Still works, just slower

### ❌ **"status": "unhealthy"**
- Redis instance not running
- Connection failed
- Check Redis instance in Render Dashboard

---

## **VISUAL CONFIRMATION**

### **1. Check Render Dashboard**

**Redis Instance:**
```
studyspot-redis
Status: Available ← Should be green
Memory: 12 MB / 256 MB
Keys: 45
```

**Backend Service:**
```
studyspot-api
Status: Live ← Should be green
Last Deploy: 2 minutes ago
Environment: REDIS_URL is set ✓
```

### **2. Check Backend Logs**

**Go to:** Render Dashboard → Backend Service → Logs

**Look for:**
```
✅ Redis connected successfully (caching enabled)
✅ Primary Redis (Railway) connected
or
✅ Backup Redis (Upstash) connected
```

**Should NOT see:**
```
❌ Redis connection failed
⚠️  Redis not configured
```

---

## **COMMON ISSUES & FIXES**

### **Issue 1: Can't access /api/health/detailed**

**Symptoms:**
- 404 Not Found
- 502 Bad Gateway
- Connection refused

**Fix:**
```bash
# Check if backend is running
curl https://YOUR-BACKEND.onrender.com/api/health

# If this works but /detailed doesn't, try:
curl https://YOUR-BACKEND.onrender.com/api/health/detailed
```

---

### **Issue 2: Redis status shows "disabled"**

**Fix:**
1. Check REDIS_URL is set:
   - Render Dashboard → Backend → Environment
   - Should see: `REDIS_URL = redis://red-xxxxx:6379`

2. If missing, add it:
   - Add Environment Variable
   - Key: `REDIS_URL`
   - Value: `redis://red-xxxxx:6379`
   - Save Changes (auto-redeploys)

---

### **Issue 3: Redis status shows "unhealthy"**

**Fix:**
1. Check Redis instance:
   - Render Dashboard → studyspot-redis
   - Status should be "Available"

2. Check region match:
   - Redis region = Backend region (both Ohio, or both Oregon)

3. Check connection URL:
   - Use INTERNAL URL: `redis://red-xxxxx:6379`
   - NOT External URL: `rediss://red-user-xxxxx.render.com:6379`

---

## **MANUAL VERIFICATION STEPS**

### **Step 1: Check Environment Variable**
```
Render Dashboard → Backend → Environment
Look for: REDIS_URL = redis://...
```
✅ Present and correct  
❌ Missing or wrong format

### **Step 2: Check Redis Instance**
```
Render Dashboard → studyspot-redis
Look for: Status = Available
```
✅ Available (green)  
❌ Creating, Failed, or Deleted

### **Step 3: Check Backend Logs**
```
Render Dashboard → Backend → Logs
Search for: "Redis"
```
✅ "Redis connected successfully"  
❌ "Redis connection failed"

### **Step 4: Test API Endpoint**
```
Browser: https://YOUR-BACKEND.onrender.com/api/health/detailed
```
✅ Shows `"redis": {"status": "healthy"}`  
❌ Shows error or missing redis status

---

## **SUCCESS CRITERIA**

You know Redis is working when:

✅ **Health endpoint shows:**
```json
{
  "services": {
    "redis": {
      "status": "healthy"
    }
  }
}
```

✅ **Logs show:**
```
✅ Redis connected successfully
Cache hit: libraries:all
Cache set: bookings:user:123
```

✅ **Performance:**
- First request: 500-1000ms
- Cached request: 50-200ms (10x faster)

✅ **Dashboard shows:**
- Redis Status: Available
- Backend Status: Live
- REDIS_URL: Set

---

## **NEED HELP?**

If Redis is not working after following the guide:

1. **Share your backend URL** (e.g., `https://studyspot-api.onrender.com`)
2. **Share health endpoint response**
3. **Share any error messages from logs**

And I'll help debug! 🔧

---

## **NEXT: After Redis is Verified**

Once Redis is working, optimize further:

1. ✅ **Update CORS** - Add all frontend URLs
2. ✅ **Add Health Check Path** - Prevent spin-down
3. ✅ **Enable Supabase Pooling** - Better DB performance
4. ✅ **Add Email Service** - Resend for notifications
5. ✅ **Add Monitoring** - UptimeRobot for uptime alerts

**Your backend will be production-ready! 🚀**

