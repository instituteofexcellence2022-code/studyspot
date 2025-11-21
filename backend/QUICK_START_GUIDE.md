# 🚀 QUICK START GUIDE
## StudySpot Backend - Get Started in 5 Minutes

---

## ⚡ QUICK START

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
# Copy example file
cp env.example .env

# Edit .env with your settings
# Minimum required:
# - JWT_SECRET (32+ characters)
# - DATABASE_URL
```

### 3. Setup Database
```bash
# Run migrations
npm run migrate
```

### 4. Build & Start
```bash
# Build
npm run build

# Start API Gateway
npm run start:api-gateway

# Or start individual services
npm run start:auth
npm run start:student
# ... etc
```

### 5. Verify
```bash
# Health check
curl http://localhost:3000/health
```

---

## 📋 MINIMUM REQUIREMENTS

### Environment Variables
```bash
NODE_ENV=development
JWT_SECRET=your-32-character-secret-key-minimum
DATABASE_URL=postgresql://user:pass@host:5432/db
```

### Node.js
- Version: 18.0.0 or higher
- npm: 9.0.0 or higher

### Database
- PostgreSQL 14+
- Extensions: uuid-ossp

---

## 🧪 TESTING

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

---

## 📚 NEXT STEPS

1. **Development**: See `SETUP_GUIDE.md`
2. **Production**: See `PRODUCTION_DEPLOYMENT_GUIDE.md`
3. **Security**: See `SECURITY_AUDIT_REPORT.md`
4. **Complete Info**: See `README_COMPLETE_FIRST_PLAN.md`

---

## ✅ VERIFICATION

### Check Build
```bash
npm run build
# Should complete without errors
```

### Check Tests
```bash
npm test
# Should run all tests
```

### Check Services
```bash
# Start a service
npm run start:auth

# In another terminal, test
curl http://localhost:3001/health
```

---

## 🎯 COMMON COMMANDS

```bash
# Development
npm run dev              # Watch mode
npm run build            # Build TypeScript
npm run lint             # Check code style
npm run lint:fix          # Fix code style

# Testing
npm test                 # Run tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report

# Database
npm run migrate          # Run migrations
npm run migrate:tenant   # Tenant migrations

# Services
npm run start:api-gateway
npm run start:auth
npm run start:student
npm run start:library
npm run start:booking
npm run start:payment
```

---

## 🐛 TROUBLESHOOTING

### Build Errors
```bash
# Clear and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### Database Connection
- Check `DATABASE_URL` is correct
- Verify PostgreSQL is running
- Check firewall rules

### Port Already in Use
- Change port in `.env`
- Or stop the service using the port

---

## 📖 DOCUMENTATION

- **Complete Guide**: `README_COMPLETE_FIRST_PLAN.md`
- **Deployment**: `PRODUCTION_DEPLOYMENT_GUIDE.md`
- **Security**: `SECURITY_AUDIT_REPORT.md`
- **Setup**: `SETUP_GUIDE.md`

---

**Ready to go! 🚀**

