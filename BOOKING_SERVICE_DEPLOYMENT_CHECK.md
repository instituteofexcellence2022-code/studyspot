# Booking Service Deployment Check

## Issue
The booking feature is not working. The API Gateway is trying to route to:
- `https://studyspot-bookings.onrender.com`

## Check if Booking Service is Deployed

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Check if `studyspot-bookings` service exists**
3. **If it doesn't exist, you need to deploy it**

## How to Deploy Booking Service on Render

### Step 1: Create New Web Service
1. Go to Render Dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `studyspot-bookings`
   - **Environment**: `Node`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `cd backend && npm run start:booking` (or `node dist/services/booking-service/index.js`)

### Step 2: Set Environment Variables
Add these environment variables in Render:

```
NODE_ENV=production
PORT=3000

# Database (use same Supabase database)
DATABASE_URL=postgresql://postgres.zgrgryufcxgjbmpjiwbh:[YOUR-PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:5432/postgres

# Or use individual DB variables:
CORE_DB_HOST=aws-1-ap-south-1.pooler.supabase.com
CORE_DB_PORT=5432
CORE_DB_NAME=postgres
CORE_DB_USER=postgres.zgrgryufcxgjbmpjiwbh
CORE_DB_PASSWORD=[YOUR-PASSWORD]
CORE_DB_SSL=true

# JWT (same as auth service)
JWT_SECRET=studyspot-jwt-secret-2024-production
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d

# CORS
CORS_ORIGIN=https://studyspot-student.netlify.app,https://studyspot-rose.vercel.app,https://studyspot-librarys.vercel.app,https://studyspot-admin-2.vercel.app,https://studyspot-student.vercel.app,http://localhost:3000,http://localhost:5173
```

### Step 3: Verify Deployment
1. Wait for deployment to complete
2. Check logs for any errors
3. Test the service: `https://studyspot-bookings.onrender.com/api/v1/bookings` (should return bookings list or error)

### Step 4: Update API Gateway
The API Gateway should automatically use the deployed service URL. If not, set:
```
BOOKING_SERVICE_URL=https://studyspot-bookings.onrender.com
```

## Alternative: Use Mock Mode

If the booking service isn't deployed yet, the booking service has mock mode built-in. However, the API Gateway still needs to route to a running service.

## Quick Test

After deployment, test the booking endpoint:
```bash
curl -X POST https://studyspot-bookings.onrender.com/api/v1/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user",
    "library_id": "test-library",
    "start_time": "2024-11-17T10:00:00",
    "end_time": "2024-11-17T16:00:00",
    "total_amount": 300,
    "status": "confirmed"
  }'
```

## Current Status
- ✅ Booking payload format fixed (user_id, library_id, etc.)
- ❓ Booking service deployment status: **UNKNOWN** - Need to check Render dashboard

