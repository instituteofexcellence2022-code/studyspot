# Quick Start Guide - Industry-Level Architecture

## 🚀 Immediate Actions Required

### Step 1: Deploy Services on Render
Render will auto-deploy from `render.yaml`. Services will be deployed in this order:

1. **API Gateway** (Port 3000) - Entry point
2. **Auth Service** (Port 10000) - Already deployed ✅
3. **Student Service** (Port 10001) - NEW
4. **Library Service** (Port 10002) - NEW
5. **Booking Service** (Port 10003) - NEW
6. **Payment Service** (Port 10004) - NEW

### Step 2: Verify Service URLs
After deployment, update API Gateway with actual service URLs:

```env
AUTH_SERVICE_URL=https://studyspot-auth.onrender.com
STUDENT_SERVICE_URL=https://studyspot-students.onrender.com
LIBRARY_SERVICE_URL=https://studyspot-libraries.onrender.com
BOOKING_SERVICE_URL=https://studyspot-bookings.onrender.com
PAYMENT_SERVICE_URL=https://studyspot-payments.onrender.com
```

### Step 3: Test Endpoints
Test each service's health endpoint:
- `https://studyspot-api.onrender.com/health` - API Gateway
- `https://studyspot-auth.onrender.com/health` - Auth Service
- `https://studyspot-students.onrender.com/health` - Student Service
- `https://studyspot-libraries.onrender.com/health` - Library Service
- `https://studyspot-bookings.onrender.com/health` - Booking Service
- `https://studyspot-payments.onrender.com/health` - Payment Service

### Step 4: Update Frontend
Update frontend API URLs to use API Gateway:
- Change from: `https://studyspot-auth.onrender.com`
- Change to: `https://studyspot-api.onrender.com`

## 📋 Service Responsibilities

### API Gateway
- Routes all requests to appropriate services
- Handles CORS
- Rate limiting
- Request logging

### Auth Service
- Authentication (login, register)
- User profile management
- JWT token generation

### Student Service
- Student CRUD operations
- Student analytics
- Bulk operations

### Library Service
- Library management
- Fee plan management
- Real-time occupancy

### Booking Service
- Seat bookings
- Booking availability
- Booking confirmation

### Payment Service
- Payment processing
- Razorpay integration
- Cashfree integration
- UPI verification

## 🔍 Troubleshooting

### Service Not Responding
1. Check Render dashboard for service status
2. Check service logs in Render
3. Verify environment variables
4. Check database connections

### Network Errors
1. Verify API Gateway is deployed
2. Check service URLs in API Gateway
3. Verify CORS configuration
4. Check service health endpoints

### Database Errors
1. Verify database connection strings
2. Check tenant database connections
3. Verify migrations have run
4. Check table existence

## 📊 Monitoring

### Health Checks
All services expose `/health` endpoint:
```bash
curl https://studyspot-api.onrender.com/health
```

### Service Status
Check Render dashboard for:
- Service uptime
- Build status
- Logs
- Resource usage

## ✅ Success Criteria

- [ ] All services deployed
- [ ] All health checks passing
- [ ] API Gateway routing correctly
- [ ] No network errors
- [ ] All endpoints working
- [ ] Frontend connected to API Gateway

---

**For detailed information, see:**
- `INDUSTRY_LEVEL_ARCHITECTURE_PLAN.md` - Complete architecture plan
- `DEPLOYMENT_ROADMAP.md` - Deployment phases
- `IMPLEMENTATION_CHECKLIST.md` - Detailed checklist


