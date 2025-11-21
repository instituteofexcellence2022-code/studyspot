# 📅 WEEK 1: CRITICAL SERVICES DEPLOYMENT
## Complete 27 APIs - Week 1 Detailed Plan

**Week**: January 15-19, 2024  
**Focus**: Deploy 4 Critical Services  
**Goal**: Get core functionality working

---

## 🎯 WEEK 1 OBJECTIVES

1. ✅ Deploy Student Service
2. ✅ Deploy Library Service
3. ✅ Deploy Booking Service
4. ✅ Deploy Payment Service
5. ✅ Update API Gateway
6. ✅ Test all services
7. ✅ Fix any issues

---

## 📋 DAY-BY-DAY BREAKDOWN

### **MONDAY - Student Service Deployment**

#### Pre-Deployment Checklist
- [ ] Review `backend/src/services/student-service/index.ts`
- [ ] Check all endpoints implemented
- [ ] Verify database migrations
- [ ] Test locally
- [ ] Check environment variables needed

#### Deployment Steps
1. **Prepare Service**
   ```bash
   # Check service code
   cd backend/src/services/student-service
   # Review index.ts
   # Check for any TODOs or incomplete features
   ```

2. **Update render.yaml** (if needed)
   ```yaml
   - type: web
     name: studyspot-students
     env: node
     region: oregon
     plan: free
     buildCommand: cd backend && npm install && npm run build
     startCommand: cd backend && npm run start:student
     envVars:
       - key: NODE_ENV
         value: production
       - key: STUDENT_SERVICE_PORT
         value: 10001
       - key: DATABASE_URL
         sync: false
       - key: REDIS_URL
         sync: false
   ```

3. **Deploy to Render**
   - Go to Render Dashboard
   - Create new Web Service
   - Connect GitHub repository
   - Use render.yaml configuration
   - Set environment variables
   - Deploy

4. **Verify Deployment**
   ```bash
   # Health check
   curl https://studyspot-students.onrender.com/health
   
   # Expected response:
   # {
   #   "status": "healthy",
   #   "service": "student-service",
   #   "timestamp": "..."
   # }
   ```

5. **Test Endpoints**
   ```bash
   # Test student list
   curl https://studyspot-students.onrender.com/api/v1/students
   
   # Test student create (with auth)
   curl -X POST https://studyspot-students.onrender.com/api/v1/students \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"name": "Test Student", "email": "test@example.com"}'
   ```

6. **Update API Gateway**
   - Add to `backend/src/services/api-gateway/routes.ts`:
   ```typescript
   fastify.all('/api/v1/students*', async (request, reply) => {
     const path = request.url.replace('/api/v1', '');
     const result = await proxyToService(
       'Student',
       SERVICES.STUDENT,
       path,
       request.method,
       request.headers,
       request.body
     );
     return reply.code(result.statusCode).send(result.data);
   });
   ```

7. **Update API Gateway Environment**
   - Add to Render environment variables:
   ```
   STUDENT_SERVICE_URL=https://studyspot-students.onrender.com
   ```

8. **Test Through API Gateway**
   ```bash
   curl https://studyspot-api.onrender.com/api/v1/students
   ```

**Monday Deliverable**: Student Service deployed and functional

---

### **TUESDAY - Library Service Deployment**

#### Pre-Deployment Checklist
- [ ] Review `backend/src/services/library-service/index.ts`
- [ ] Check library CRUD endpoints
- [ ] Check fee plans endpoints
- [ ] Verify database migrations
- [ ] Test locally

#### Deployment Steps
1. **Prepare Service**
   ```bash
   cd backend/src/services/library-service
   # Review code
   # Check fee plans implementation
   ```

2. **Update render.yaml**
   ```yaml
   - type: web
     name: studyspot-libraries
     env: node
     region: oregon
     plan: free
     buildCommand: cd backend && npm install && npm run build
     startCommand: cd backend && npm run start:library
     envVars:
       - key: NODE_ENV
         value: production
       - key: LIBRARY_SERVICE_PORT
         value: 10002
       - key: DATABASE_URL
         sync: false
       - key: REDIS_URL
         sync: false
   ```

3. **Deploy to Render**
   - Create new Web Service
   - Configure as above
   - Deploy

4. **Verify Deployment**
   ```bash
   curl https://studyspot-libraries.onrender.com/health
   ```

5. **Test Endpoints**
   ```bash
   # Test library list
   curl https://studyspot-libraries.onrender.com/api/v1/libraries
   
   # Test fee plans
   curl https://studyspot-libraries.onrender.com/api/fee-plans
   ```

6. **Update API Gateway**
   ```typescript
   fastify.all('/api/v1/libraries*', async (request, reply) => {
     const path = request.url.replace('/api/v1', '');
     const result = await proxyToService(
       'Library',
       SERVICES.LIBRARY,
       path,
       request.method,
       request.headers,
       request.body
     );
     return reply.code(result.statusCode).send(result.data);
   });
   
   fastify.all('/api/fee-plans*', async (request, reply) => {
     const result = await proxyToService(
       'Library',
       SERVICES.LIBRARY,
       request.url,
       request.method,
       request.headers,
       request.body
     );
     return reply.code(result.statusCode).send(result.data);
   });
   ```

7. **Update Environment Variables**
   ```
   LIBRARY_SERVICE_URL=https://studyspot-libraries.onrender.com
   ```

8. **Test Through API Gateway**
   ```bash
   curl https://studyspot-api.onrender.com/api/v1/libraries
   curl https://studyspot-api.onrender.com/api/fee-plans
   ```

**Tuesday Deliverable**: Library Service deployed and functional

---

### **WEDNESDAY - Booking Service Deployment**

#### Pre-Deployment Checklist
- [ ] Review `backend/src/services/booking-service/index.ts`
- [ ] Check booking CRUD endpoints
- [ ] Check availability endpoints
- [ ] Verify database migrations
- [ ] Test locally

#### Deployment Steps
1. **Prepare Service**
   ```bash
   cd backend/src/services/booking-service
   # Review code
   # Check availability logic
   ```

2. **Update render.yaml**
   ```yaml
   - type: web
     name: studyspot-bookings
     env: node
     region: oregon
     plan: free
     buildCommand: cd backend && npm install && npm run build
     startCommand: cd backend && npm run start:booking
     envVars:
       - key: NODE_ENV
         value: production
       - key: BOOKING_SERVICE_PORT
         value: 10003
       - key: DATABASE_URL
         sync: false
       - key: REDIS_URL
         sync: false
   ```

3. **Deploy to Render**
   - Create new Web Service
   - Configure as above
   - Deploy

4. **Verify Deployment**
   ```bash
   curl https://studyspot-bookings.onrender.com/health
   ```

5. **Test Endpoints**
   ```bash
   # Test booking list
   curl https://studyspot-bookings.onrender.com/api/v1/bookings
   
   # Test availability
   curl "https://studyspot-bookings.onrender.com/api/bookings/availability?libraryId=xxx&date=2024-01-20"
   ```

6. **Update API Gateway**
   ```typescript
   fastify.all('/api/v1/bookings*', async (request, reply) => {
     const path = request.url.replace('/api/v1', '');
     const result = await proxyToService(
       'Booking',
       SERVICES.BOOKING,
       path,
       request.method,
       request.headers,
       request.body
     );
     return reply.code(result.statusCode).send(result.data);
   });
   
   fastify.all('/api/bookings*', async (request, reply) => {
     const path = `/api/v1${request.url.replace('/api', '')}`;
     const result = await proxyToService(
       'Booking',
       SERVICES.BOOKING,
       path,
       request.method,
       request.headers,
       request.body
     );
     return reply.code(result.statusCode).send(result.data);
   });
   ```

7. **Update Environment Variables**
   ```
   BOOKING_SERVICE_URL=https://studyspot-bookings.onrender.com
   ```

8. **Test Through API Gateway**
   ```bash
   curl https://studyspot-api.onrender.com/api/v1/bookings
   curl https://studyspot-api.onrender.com/api/bookings/availability
   ```

**Wednesday Deliverable**: Booking Service deployed and functional

---

### **THURSDAY - Payment Service Deployment**

#### Pre-Deployment Checklist
- [ ] Review `backend/src/services/payment-service/index.ts`
- [ ] Check payment processing endpoints
- [ ] Verify Razorpay integration
- [ ] Verify Cashfree integration
- [ ] Check environment variables
- [ ] Test locally

#### Deployment Steps
1. **Prepare Service**
   ```bash
   cd backend/src/services/payment-service
   # Review code
   # Check payment gateway integrations
   ```

2. **Update render.yaml**
   ```yaml
   - type: web
     name: studyspot-payments
     env: node
     region: oregon
     plan: free
     buildCommand: cd backend && npm install && npm run build
     startCommand: cd backend && npm run start:payment
     envVars:
       - key: NODE_ENV
         value: production
       - key: PAYMENT_SERVICE_PORT
         value: 10004
       - key: DATABASE_URL
         sync: false
       - key: REDIS_URL
         sync: false
       - key: RAZORPAY_KEY_ID
         sync: false
       - key: RAZORPAY_KEY_SECRET
         sync: false
       - key: CASHFREE_APP_ID
         sync: false
       - key: CASHFREE_SECRET_KEY
         sync: false
   ```

3. **Deploy to Render**
   - Create new Web Service
   - Configure as above
   - Add payment gateway credentials
   - Deploy

4. **Verify Deployment**
   ```bash
   curl https://studyspot-payments.onrender.com/health
   ```

5. **Test Endpoints**
   ```bash
   # Test payment creation
   curl -X POST https://studyspot-payments.onrender.com/api/v1/payments \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"amount": 100, "currency": "INR", "bookingId": "xxx"}'
   ```

6. **Update API Gateway**
   ```typescript
   fastify.all('/api/v1/payments*', async (request, reply) => {
     const path = request.url.replace('/api/v1', '');
     const result = await proxyToService(
       'Payment',
       SERVICES.PAYMENT,
       path,
       request.method,
       request.headers,
       request.body
     );
     return reply.code(result.statusCode).send(result.data);
   });
   ```

7. **Update Environment Variables**
   ```
   PAYMENT_SERVICE_URL=https://studyspot-payments.onrender.com
   ```

8. **Test Through API Gateway**
   ```bash
   curl https://studyspot-api.onrender.com/api/v1/payments
   ```

**Thursday Deliverable**: Payment Service deployed and functional

---

### **FRIDAY - Integration Testing & Fixes**

#### Testing Checklist
- [ ] Test Student Service end-to-end
- [ ] Test Library Service end-to-end
- [ ] Test Booking Service end-to-end
- [ ] Test Payment Service end-to-end
- [ ] Test integrated workflows
- [ ] Performance testing
- [ ] Error handling testing

#### Test Scenarios

**Scenario 1: Student Registration & Booking**
1. Create student
2. Search libraries
3. Check availability
4. Create booking
5. Process payment
6. Verify booking confirmed

**Scenario 2: Library Management**
1. Create library
2. Create fee plan
3. Add students
4. View bookings
5. View payments

**Scenario 3: Payment Processing**
1. Create payment order
2. Process payment (test mode)
3. Verify payment
4. Check settlement

#### Fix Issues
- [ ] Document any issues found
- [ ] Fix critical issues
- [ ] Update documentation
- [ ] Create issue tickets for non-critical

#### Documentation
- [ ] Update API documentation
- [ ] Update deployment guide
- [ ] Create troubleshooting guide
- [ ] Document known issues

**Friday Deliverable**: All services tested and documented

---

## ✅ WEEK 1 SUCCESS CRITERIA

### Must Have
- [ ] All 4 services deployed
- [ ] All health checks passing
- [ ] API Gateway routing correctly
- [ ] Basic functionality working

### Should Have
- [ ] End-to-end workflows tested
- [ ] Documentation updated
- [ ] Known issues documented

### Nice to Have
- [ ] Performance benchmarks
- [ ] Error handling verified

---

## 🐛 TROUBLESHOOTING

### Service Won't Start
- Check build logs
- Verify environment variables
- Check database connection
- Verify port configuration

### Health Check Failing
- Check service logs
- Verify database connection
- Check Redis connection
- Verify environment variables

### API Gateway Not Routing
- Verify service URLs
- Check CORS configuration
- Verify routing rules
- Check service health

### Database Errors
- Verify DATABASE_URL
- Check credentials
- Verify network access
- Check connection pooling

---

## 📊 DAILY PROGRESS TRACKING

### Monday
- [ ] Student Service deployed
- [ ] Health check passing
- [ ] API Gateway updated
- [ ] Basic tests passing

### Tuesday
- [ ] Library Service deployed
- [ ] Health check passing
- [ ] Fee plans working
- [ ] API Gateway updated

### Wednesday
- [ ] Booking Service deployed
- [ ] Health check passing
- [ ] Availability working
- [ ] API Gateway updated

### Thursday
- [ ] Payment Service deployed
- [ ] Health check passing
- [ ] Payment processing working
- [ ] API Gateway updated

### Friday
- [ ] All services tested
- [ ] Integration tests passing
- [ ] Documentation updated
- [ ] Week 1 complete

---

## 🎯 READY TO START?

### Pre-Flight Checklist
- [ ] Plan reviewed
- [ ] Render account ready
- [ ] Git access verified
- [ ] Database access verified
- [ ] Environment variables prepared
- [ ] Team ready

**Let's deploy these 4 critical services! 🚀**

---

**Week 1 Start**: Monday, January 15, 2024  
**Week 1 End**: Friday, January 19, 2024  
**Goal**: 4 Critical Services Deployed & Functional

