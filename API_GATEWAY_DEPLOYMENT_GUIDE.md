# API Gateway Deployment Guide

## ✅ Current Status

### Already Configured ✅
- API Gateway code exists: `backend/src/services/api-gateway/index.ts`
- Routes configured: `backend/src/services/api-gateway/routes.ts`
- Start script: `npm run start:api-gateway`
- render.yaml: Service configured

### Not Deployed Yet ⚠️
- Service not live on Render
- Frontend expects: `https://studyspot-api.onrender.com`

## 🚀 How to Deploy

### Method 1: Auto-Deploy from render.yaml (Recommended)

1. **Check Render Dashboard**
   - Go to https://dashboard.render.com
   - Look for service named `studyspot-api`
   - If it exists, it should auto-deploy from `render.yaml`

2. **If Service Doesn't Exist**
   - Render may not have auto-created it yet
   - You can manually trigger by:
     - Pushing a commit (triggers auto-deploy)
     - Or manually create service (see Method 2)

### Method 2: Manual Deployment

1. **Go to Render Dashboard**
   - https://dashboard.render.com

2. **Create New Web Service**
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select the repository

3. **Configure Service**
   - **Name**: `studyspot-api`
   - **Environment**: `Node`
   - **Region**: `Oregon` (or your preferred region)
   - **Branch**: `main`
   - **Root Directory**: Leave empty (or `backend` if needed)
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && node dist/services/api-gateway/index.js`

4. **Environment Variables**
   Add these in Render dashboard:
   ```
   NODE_ENV=production
   AUTH_SERVICE_URL=https://studyspot-auth.onrender.com
   STUDENT_SERVICE_URL=https://studyspot-students.onrender.com
   LIBRARY_SERVICE_URL=https://studyspot-libraries.onrender.com
   BOOKING_SERVICE_URL=https://studyspot-bookings.onrender.com
   PAYMENT_SERVICE_URL=https://studyspot-payments.onrender.com
   CORS_ORIGIN=https://studyspot-rose.vercel.app,https://studyspot-librarys.vercel.app,https://studyspot-admin-2.vercel.app,https://studyspot-student.vercel.app,http://localhost:3000,http://localhost:3001,http://localhost:3002,https://main.studyspot-student.pages.dev,https://studyspot-student.netlify.app
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for build and deployment

## ✅ Verification

### 1. Check Service Health
```bash
curl https://studyspot-api.onrender.com/health
```

Expected response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "service": "api-gateway",
    "timestamp": "..."
  }
}
```

### 2. Test Routing
```bash
# Test auth endpoint (should route to auth service)
curl https://studyspot-api.onrender.com/api/auth/health
```

### 3. Check Frontend
- Frontend should now connect through API Gateway
- No more direct service calls
- All requests go through: `https://studyspot-api.onrender.com`

## 🔍 Troubleshooting

### Service Not Starting
- Check build logs in Render
- Verify TypeScript compilation: `npm run build`
- Check for missing dependencies

### Routes Not Working
- Verify service URLs in environment variables
- Check API Gateway routes configuration
- Verify target services are deployed

### CORS Errors
- Verify `CORS_ORIGIN` includes your frontend URLs
- Check API Gateway CORS configuration
- Test with browser console

### 502 Bad Gateway
- Target service may not be deployed
- Check service URLs are correct
- Verify services are running

## 📊 Service URLs After Deployment

Once all services are deployed:

```
API Gateway:     https://studyspot-api.onrender.com
Auth Service:    https://studyspot-auth.onrender.com ✅ (already deployed)
Student Service: https://studyspot-students.onrender.com
Library Service: https://studyspot-libraries.onrender.com
Booking Service: https://studyspot-bookings.onrender.com
Payment Service: https://studyspot-payments.onrender.com
```

## 🎯 Next Steps After Deployment

1. ✅ Verify API Gateway health
2. ✅ Test routing to auth service
3. ✅ Deploy other services (Student, Library, etc.)
4. ✅ Update API Gateway with all service URLs
5. ✅ Test end-to-end flows

---

**Priority**: P0 (Critical - Must deploy first)


