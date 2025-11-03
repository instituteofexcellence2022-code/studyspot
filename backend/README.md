# 🏗️ StudySpot Backend API
## Multi-Tenant SaaS Platform - Microservices Architecture

---

## 📋 **PROJECT STRUCTURE**

```
backend/
├── src/
│   ├── config/                 # Configuration files
│   │   ├── database.ts        # PostgreSQL + multi-tenant connection
│   │   ├── redis.ts           # Redis cache configuration
│   │   ├── constants.ts       # App constants
│   │   ├── payment.config.ts  # Cashfree + Razorpay config
│   │   └── sms.config.ts      # MSG91 + BSNL DLT config
│   │
│   ├── services/              # Microservices
│   │   ├── api-gateway/       # Port 3000 - Main entry point
│   │   ├── auth-service/      # Port 3001 - Authentication
│   │   ├── tenant-service/    # Port 3003 - Tenant management
│   │   ├── user-service/      # Port 3002 - User management
│   │   ├── student-service/   # Port 3004 - Student CRUD + Analytics
│   │   ├── library-service/   # Port 3005 - Library management
│   │   ├── payment-service/   # Port 3006 - Cashfree + Razorpay
│   │   ├── credit-service/    # Port 3008 - Credit management
│   │   └── ...               # More services
│   │
│   ├── middleware/            # Fastify middleware
│   │   ├── auth.ts           # JWT verification
│   │   ├── tenantContext.ts  # Tenant isolation
│   │   └── errorHandler.ts   # Global error handling
│   │
│   ├── utils/                 # Utility functions
│   │   ├── logger.ts         # Winston logger
│   │   ├── validators.ts     # Input validation
│   │   └── helpers.ts        # Helper functions
│   │
│   └── types/                 # TypeScript type definitions
│       └── index.ts          # Global types
│
├── migrations/                # Database migrations
│   ├── 001_create_core_schema.sql      # Core DB schema
│   └── 002_create_tenant_schema.sql    # Tenant DB schema
│
├── scripts/                   # Utility scripts
│   ├── migrate.js            # Run migrations
│   └── seed.js               # Seed data
│
├── logs/                      # Application logs
├── tests/                     # Test files
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
└── env.example               # Environment variables template
```

---

## 🚀 **QUICK START**

### **1. Prerequisites:**
- Node.js 18+ (LTS)
- PostgreSQL 14+
- Redis 6+
- npm or yarn

### **2. Installation:**

```bash
# Install dependencies
npm install

# Copy environment variables
cp env.example .env

# Edit .env and add your credentials
nano .env
```

### **3. Database Setup:**

```bash
# Create core database
createdb studyspot_core

# Run migrations
psql -d studyspot_core -f migrations/001_create_core_schema.sql

# Verify tables created
psql -d studyspot_core -c "\dt"
```

### **4. Start Services:**

```bash
# Development mode (all services)
npm run dev

# OR start individual services:

# API Gateway (Port 3000)
npm run start:gateway

# Auth Service (Port 3001)
npm run start:auth

# Tenant Service (Port 3003)
npm run start:tenant

# User Service (Port 3002)
npm run start:user
```

---

## 🔐 **YOUR APPROVED SERVICES**

### **Payment Gateways:**
✅ **Cashfree** - 1.5% + ₹3 per transaction  
✅ **Razorpay** - 2% + ₹0 per transaction  
🎯 **Smart Routing** - Automatic cost optimization

### **SMS Communication:**
✅ **BSNL DLT** - Entity registered, templates approved  
✅ **MSG91** - ₹0.15/SMS with DLT integration  
🎯 **100% Compliant** - TRAI approved

---

## 🔑 **REQUIRED CREDENTIALS**

Add these to your `.env` file:

```bash
# Cashfree (from dashboard)
CASHFREE_APP_ID=your_app_id
CASHFREE_SECRET_KEY=your_secret_key

# Razorpay (from dashboard)
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_secret

# MSG91 (from dashboard)
MSG91_AUTH_KEY=your_auth_key
MSG91_SENDER_ID=STDYSP

# BSNL DLT (from portal)
DLT_ENTITY_ID=your_entity_id
DLT_TEMPLATE_OTP_ID=your_template_id
# ... add all template IDs
```

---

## 📡 **API ENDPOINTS**

### **Auth Service (Port 3001):**
```
POST   /api/v1/auth/admin/login      # Admin login
POST   /api/v1/auth/tenant/login     # Tenant login
POST   /api/v1/auth/logout           # Logout
POST   /api/v1/auth/refresh          # Refresh access token
POST   /api/v1/auth/verify           # Verify token
```

### **API Gateway (Port 3000):**
```
GET    /health                       # Health check
GET    /api/v1                       # API info
```

---

## 🧪 **TESTING**

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Test coverage
npm run test:coverage
```

### **Test Authentication:**

```bash
# Login as admin
curl -X POST http://localhost:3001/api/v1/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@studyspot.com",
    "password": "Admin@123"
  }'

# Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

---

## 📊 **DATABASE SCHEMA**

### **Core Database (Platform-level):**
- `tenants` - Tenant registration
- `admin_users` - Platform administrators
- `subscription_plans` - Available plans
- `subscriptions` - Subscription history
- `credit_master_wallet` - Platform credit inventory
- `tenant_credit_wallets` - Tenant credit balances
- `audit_logs` - Platform audit trail
- `system_notifications` - System alerts
- `refresh_tokens` - JWT refresh tokens

### **Tenant Database (Per tenant):**
- `libraries` - Library locations
- `users` - Tenant staff
- `students` - Student records
- `bookings` - Seat allocations
- `attendance` - Attendance tracking
- `payments` - Payment transactions
- `communications` - SMS/Email/WhatsApp logs
- `tickets` - Support tickets
- `referrals` - Referral program

---

## 🔒 **SECURITY FEATURES**

✅ JWT authentication (access + refresh tokens)  
✅ bcrypt password hashing (12 rounds)  
✅ Rate limiting (100 req/min)  
✅ CORS protection  
✅ Helmet security headers  
✅ SQL injection prevention (prepared statements)  
✅ XSS protection  
✅ Tenant isolation (database-per-tenant)  
✅ Audit logging  
✅ Input validation (Zod schemas)  

---

## 📈 **MONITORING**

### **Logs:**
- Location: `logs/error.log`, `logs/combined.log`
- Format: JSON structured logging
- Tool: Winston

### **Health Checks:**
```bash
# API Gateway
curl http://localhost:3000/health

# Auth Service
curl http://localhost:3001/health
```

---

## 🚀 **DEPLOYMENT**

### **Development:**
```bash
npm run dev
```

### **Production:**
```bash
# Build
npm run build

# Start
npm start
```

### **Docker:**
```bash
# Build image
docker build -t studyspot-backend .

# Run container
docker run -p 3000:3000 --env-file .env studyspot-backend
```

---

## 📞 **SUPPORT**

- **Documentation:** See `/docs` folder
- **Issues:** GitHub Issues
- **Email:** tech@studyspot.com

---

## 🎯 **NEXT STEPS**

1. ✅ Add your credentials to `.env`
2. ✅ Run database migrations
3. ✅ Start auth service
4. ✅ Test login endpoint
5. ✅ Implement remaining services
6. ✅ Deploy to production

---

**Version:** 1.0.0  
**Last Updated:** 2025-11-02  
**Status:** ✅ Phase 1 Foundation Complete

