# 🚀 BACKEND SETUP GUIDE
## Get Started in 10 Minutes!

---

## ⚡ **QUICK SETUP (3 Commands)**

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp env.example .env
# Edit .env and add your credentials

# 3. Run migrations and start
npm run migrate
npm run start:auth
```

---

## 📋 **DETAILED SETUP**

### **Step 1: Install PostgreSQL**

#### **Option A: Local Installation**
```bash
# Windows (using Chocolatey)
choco install postgresql

# Start PostgreSQL service
net start postgresql-x64-14

# OR download from: https://www.postgresql.org/download/
```

#### **Option B: Use Supabase (FREE 500MB)**
1. Go to https://supabase.com
2. Create new project
3. Get connection string
4. Add to `.env` file

### **Step 2: Install Redis**

#### **Option A: Local Installation**
```bash
# Windows (using Chocolatey)
choco install redis-64

# Start Redis
redis-server
```

#### **Option B: Use Upstash (FREE 10K commands/day)**
1. Go to https://upstash.com
2. Create Redis database
3. Get connection details
4. Add to `.env` file

### **Step 3: Install Dependencies**

```bash
cd backend
npm install
```

This will install:
- ✅ Fastify (web framework)
- ✅ PostgreSQL driver (pg)
- ✅ Redis client
- ✅ JWT authentication
- ✅ bcrypt (password hashing)
- ✅ Razorpay SDK
- ✅ Winston (logging)
- ✅ TypeScript + ts-node

### **Step 4: Configure Environment**

```bash
# Copy example file
cp env.example .env

# Open in editor
notepad .env

# Add your credentials:
# - Database connection
# - Redis connection
# - Cashfree credentials
# - Razorpay credentials
# - MSG91 auth key
# - BSNL DLT template IDs
```

### **Step 5: Create Database**

```bash
# Using psql
psql -U postgres

# Create database
CREATE DATABASE studyspot_core;

# Exit psql
\q
```

### **Step 6: Run Migrations**

```bash
# Run migration script
npm run migrate

# You should see:
# 🔄 Running database migrations...
# 📄 Running migration: 001_create_core_schema.sql
# ✅ 001_create_core_schema.sql completed
# ✅ All migrations completed successfully!
```

### **Step 7: Start Services**

```bash
# Start Auth Service
npm run start:auth

# You should see:
# 🔐 Auth Service running on port 3001
# 📍 http://localhost:3001
```

### **Step 8: Test API**

```bash
# Test health endpoint
curl http://localhost:3001/health

# Test login (default admin)
curl -X POST http://localhost:3001/api/v1/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@studyspot.com",
    "password": "Admin@123"
  }'

# You should get access token!
```

---

## ✅ **VERIFICATION CHECKLIST**

- [ ] PostgreSQL installed and running
- [ ] Redis installed and running
- [ ] Dependencies installed (`node_modules` exists)
- [ ] `.env` file created with credentials
- [ ] Database `studyspot_core` created
- [ ] Migrations completed successfully
- [ ] Auth service starts without errors
- [ ] Health endpoint responds
- [ ] Login endpoint works
- [ ] JWT token received

---

## 🔧 **TROUBLESHOOTING**

### **Problem: Database connection failed**
```bash
# Check if PostgreSQL is running
pg_isready

# Check connection details in .env
CORE_DB_HOST=localhost
CORE_DB_PORT=5432
CORE_DB_NAME=studyspot_core
CORE_DB_USER=postgres
CORE_DB_PASSWORD=your_password
```

### **Problem: Redis connection failed**
```bash
# Check if Redis is running
redis-cli ping
# Should return: PONG

# Check Redis config in .env
REDIS_HOST=localhost
REDIS_PORT=6379
```

### **Problem: Migration failed**
```bash
# Check if database exists
psql -U postgres -l | grep studyspot

# If not, create it
createdb -U postgres studyspot_core

# Run migration again
npm run migrate
```

### **Problem: npm install fails**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

---

## 📚 **NEXT STEPS**

1. ✅ **Implement Tenant Service** (Port 3003)
2. ✅ **Implement User Service** (Port 3002)
3. ✅ **Implement Student Service** (Port 3004)
4. ✅ **Implement Payment Service** (Port 3006)
5. ✅ **Connect to Frontend** (web-admin-new)

---

## 💡 **HELPFUL COMMANDS**

```bash
# Check running services
netstat -ano | findstr :3001

# View logs
cat logs/combined.log

# Connect to database
psql -U postgres -d studyspot_core

# Connect to Redis
redis-cli

# Format code
npm run format

# Lint code
npm run lint

# Build for production
npm run build

# Start production
npm start
```

---

**🎉 Your backend is ready to rock! Let's build something amazing! 🚀**

