# 🚀 PRODUCTION DEPLOYMENT GUIDE
## StudySpot Backend - Complete Deployment Instructions

**Version**: 1.0.0  
**Last Updated**: Day 7 of 7  
**Status**: ✅ **PRODUCTION READY**

---

## 📋 TABLE OF CONTENTS

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Service Deployment](#service-deployment)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Rollback Procedures](#rollback-procedures)
8. [Troubleshooting](#troubleshooting)

---

## ✅ PRE-DEPLOYMENT CHECKLIST

### Code Quality
- [x] All tests passing (`npm test`)
- [x] Code coverage ≥ 70%
- [x] No linter errors (`npm run lint`)
- [x] TypeScript compilation successful (`npm run build`)
- [x] Security audit completed
- [x] All critical issues fixed

### Documentation
- [x] API documentation complete
- [x] Environment variables documented
- [x] Deployment guide reviewed
- [x] Runbooks created

### Security
- [x] JWT_SECRET configured (32+ characters)
- [x] Database credentials secured
- [x] API keys in environment variables
- [x] HTTPS enabled
- [x] Security headers configured
- [x] Rate limiting enabled

---

## 🔧 ENVIRONMENT SETUP

### Required Environment Variables

Create `.env.production` file with the following:

```bash
# Node Environment
NODE_ENV=production

# Database Configuration
DATABASE_URL=postgresql://user:password@host:5432/studyspot_core
CORE_DB_HOST=your-db-host
CORE_DB_PORT=5432
CORE_DB_NAME=studyspot_core
CORE_DB_USER=your-db-user
CORE_DB_PASSWORD=your-secure-password
CORE_DB_SSL=true
CORE_DB_POOL_MIN=2
CORE_DB_POOL_MAX=20

# JWT Configuration (CRITICAL - Must be 32+ characters)
JWT_SECRET=your-super-secure-jwt-secret-key-minimum-32-characters-long
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d

# Service Ports
API_GATEWAY_PORT=3000
AUTH_SERVICE_PORT=3001
STUDENT_SERVICE_PORT=3004
LIBRARY_SERVICE_PORT=3005
BOOKING_SERVICE_PORT=3006
PAYMENT_SERVICE_PORT=3007
USER_SERVICE_PORT=3002
ANALYTICS_SERVICE_PORT=3013

# CORS Configuration
CORS_ORIGIN=https://your-domain.com,https://admin.your-domain.com

# Redis Configuration (Optional but Recommended)
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0

# Payment Gateways
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-secret
CASHFREE_APP_ID=your-cashfree-app-id
CASHFREE_SECRET_KEY=your-cashfree-secret

# SMS Configuration (Optional)
MSG91_AUTH_KEY=your-msg91-key
MSG91_SENDER_ID=STDYSP

# Logging
LOG_LEVEL=info

# Security
ADMIN_IP_WHITELIST=your-admin-ip-addresses
```

### Environment Validation

The application will validate all required environment variables on startup:

```bash
# If validation fails, the application will exit with error messages
# Example error:
❌ Environment validation failed:
  - JWT_SECRET: JWT_SECRET must be at least 32 characters
```

---

## 🗄️ DATABASE SETUP

### 1. Create Core Database

```sql
-- Connect to PostgreSQL
CREATE DATABASE studyspot_core;

-- Create extensions
\c studyspot_core
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### 2. Run Migrations

```bash
# Navigate to backend directory
cd backend

# Run migrations
npm run migrate

# This will execute all migrations in order:
# - 001_create_core_schema.sql
# - 002_create_tenant_schema.sql
# - 003_add_tenant_to_admin_users.sql
# - 004_create_audit_logs.sql
# - 005_redesign_multi_tenant_saas.sql
# - 006_update_tenant_users_schema.sql
# - 007_migrate_existing_data.sql
# - 008_redesign_clear_user_structure.sql
# - 009_create_library_staff_table.sql
```

### 3. Verify Database Setup

```sql
-- Check core tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Expected tables:
-- - tenants
-- - admin_users
-- - subscriptions
-- - subscription_plans
-- - tenant_credit_wallets
-- - audit_logs
```

### 4. Create Initial Admin User

```sql
-- Create super admin user
INSERT INTO admin_users (
  email, 
  password_hash, 
  first_name, 
  last_name, 
  role, 
  department,
  is_active,
  created_at
) VALUES (
  'admin@studyspot.com',
  '$2b$12$YourHashedPasswordHere', -- Use bcrypt to hash password
  'Super',
  'Admin',
  'super_admin',
  'engineering',
  true,
  NOW()
);
```

**Note**: Generate password hash using:
```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('your-password', 12).then(hash => console.log(hash));"
```

---

## 🚀 SERVICE DEPLOYMENT

### Option 1: Docker Deployment (Recommended)

#### 1. Build Docker Image

```bash
# Build image
docker build -t studyspot-backend:latest .

# Or use docker-compose
docker-compose build
```

#### 2. Run Services

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Option 2: Direct Node.js Deployment

#### 1. Build Application

```bash
# Install dependencies
npm install --production

# Build TypeScript
npm run build

# Verify build
ls -la dist/
```

#### 2. Start Services

```bash
# Start API Gateway
npm run start:api-gateway

# Start Auth Service
npm run start:auth

# Start Student Service
npm run start:student

# Start Library Service
npm run start:library

# Start Booking Service
npm run start:booking

# Start Payment Service
npm run start:payment
```

#### 3. Use Process Manager (PM2)

```bash
# Install PM2
npm install -g pm2

# Start all services
pm2 start ecosystem.config.js

# Or start individually
pm2 start dist/services/api-gateway/index.js --name api-gateway
pm2 start dist/services/auth-service/index.js --name auth-service
pm2 start dist/services/student-service/index.js --name student-service
pm2 start dist/services/library-service/index.js --name library-service
pm2 start dist/services/booking-service/index.js --name booking-service
pm2 start dist/services/payment-service/index.js --name payment-service

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

### Option 3: Platform Deployment (Render/Railway/Vercel)

#### Render Deployment

1. **Create Web Service**
   - Connect GitHub repository
   - Set build command: `npm install && npm run build`
   - Set start command: `npm run start:api-gateway`
   - Add environment variables

2. **Create Background Services**
   - Create separate services for each microservice
   - Use same repository, different start commands
   - Configure environment variables

#### Railway Deployment

1. **Create Project**
   - Connect GitHub repository
   - Railway auto-detects Node.js
   - Configure environment variables
   - Deploy

2. **Multiple Services**
   - Create separate services for each microservice
   - Use Railway's service configuration

---

## ✅ POST-DEPLOYMENT VERIFICATION

### 1. Health Checks

```bash
# API Gateway
curl https://your-domain.com/health

# Auth Service
curl https://auth.your-domain.com/health

# Student Service
curl https://student.your-domain.com/health

# Expected response:
{
  "success": true,
  "data": {
    "status": "healthy",
    "service": "service-name",
    "timestamp": "2024-01-15T10:00:00.000Z"
  }
}
```

### 2. Authentication Test

```bash
# Test login
curl -X POST https://your-domain.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@studyspot.com",
    "password": "your-password"
  }'

# Expected response:
{
  "success": true,
  "data": {
    "token": "jwt-token-here",
    "refreshToken": "refresh-token-here",
    "user": { ... }
  }
}
```

### 3. API Endpoint Tests

```bash
# Test protected endpoint
curl -X GET https://your-domain.com/api/v1/students \
  -H "Authorization: Bearer your-jwt-token"

# Test rate limiting
for i in {1..110}; do
  curl https://your-domain.com/api/v1/students
done
# Should get rate limit error after 100 requests
```

### 4. Database Connection Test

```bash
# Check database connectivity
# All services should connect successfully
# Check logs for connection errors
```

---

## 📊 MONITORING & MAINTENANCE

### 1. Log Monitoring

```bash
# View application logs
pm2 logs

# Or with Docker
docker-compose logs -f

# Filter by service
pm2 logs auth-service
```

### 2. Health Monitoring

Set up monitoring for:
- Service health endpoints
- Database connectivity
- Redis connectivity
- Response times
- Error rates

### 3. Performance Monitoring

Monitor:
- Request latency
- Database query performance
- Memory usage
- CPU usage
- Rate limit hits

### 4. Security Monitoring

Monitor:
- Failed authentication attempts
- Rate limit violations
- Unusual API usage patterns
- Security event logs

---

## 🔄 ROLLBACK PROCEDURES

### 1. Code Rollback

```bash
# Git rollback
git checkout <previous-commit-hash>
npm run build
pm2 restart all

# Or with Docker
docker-compose down
docker-compose up -d
```

### 2. Database Rollback

```bash
# Restore from backup
pg_restore -d studyspot_core backup.dump

# Or rollback migration
# (Manual process - review migration files)
```

### 3. Configuration Rollback

```bash
# Restore previous .env file
cp .env.backup .env.production
pm2 restart all
```

---

## 🐛 TROUBLESHOOTING

### Common Issues

#### 1. Service Won't Start

**Error**: `JWT_SECRET must be at least 32 characters`

**Solution**:
```bash
# Set proper JWT_SECRET in .env
JWT_SECRET=your-32-character-secret-key-here
```

#### 2. Database Connection Failed

**Error**: `Connection refused`

**Solution**:
- Check database credentials
- Verify database is running
- Check firewall rules
- Verify SSL configuration

#### 3. Rate Limiting Too Aggressive

**Error**: `Rate limit exceeded`

**Solution**:
- Adjust rate limits in `backend/src/config/constants.ts`
- Or set via environment variables

#### 4. CORS Errors

**Error**: `CORS policy blocked`

**Solution**:
- Add your domain to `CORS_ORIGIN` environment variable
- Check CORS configuration in service files

---

## 📝 DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] All tests passing
- [ ] Code review completed
- [ ] Security audit passed
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Backup strategy in place

### Deployment
- [ ] Database created and migrated
- [ ] Services deployed
- [ ] Environment variables set
- [ ] Health checks passing
- [ ] Monitoring configured

### Post-Deployment
- [ ] All endpoints tested
- [ ] Authentication working
- [ ] Rate limiting verified
- [ ] Logs monitored
- [ ] Performance verified
- [ ] Documentation updated

---

## 🎉 DEPLOYMENT COMPLETE

Once all checks pass, your backend is **production-ready**!

**Next Steps**:
1. Monitor logs for 24 hours
2. Set up alerts for critical errors
3. Schedule regular backups
4. Plan for scaling as traffic grows

---

**Status**: ✅ **PRODUCTION READY**  
**Last Verified**: Day 7 of 7  
**All Systems**: ✅ **GO**

