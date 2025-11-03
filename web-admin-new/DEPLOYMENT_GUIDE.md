# 🚀 Deployment Guide - StudySpot Admin Portal v2.0

## 📋 **Deployment Overview**

**Frontend**: Vercel (Free Tier)  
**Backend**: Render (Free Tier)  
**Database**: Supabase PostgreSQL (Free Tier)  
**Cache**: Upstash Redis (Free Tier)  
**Storage**: Cloudflare R2 (Free Tier)  
**Email**: Resend (Free Tier)  
**Monitoring**: Better Stack (Free Tier)

**Total Cost**: **$0/month** (Free Tier) 🎉

---

## 🏗️ **Pre-Deployment Checklist**

### **✅ Before You Deploy:**
- [ ] Code is tested and working locally
- [ ] All environment variables documented
- [ ] Database schema created (Prisma)
- [ ] API endpoints tested
- [ ] Frontend builds successfully
- [ ] No console errors or warnings
- [ ] All secrets stored securely
- [ ] Domain name purchased (optional)
- [ ] SSL certificates ready (auto via Vercel/Render)

---

## 📦 **STEP 1: Database Setup (Supabase)**

### **1.1 Create Supabase Project:**

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub
4. Click "New Project"
5. Fill details:
   - **Name**: studyspot-admin-db
   - **Database Password**: Generate strong password
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free

### **1.2 Get Database Credentials:**

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres"
```

### **1.3 Run Prisma Migrations:**

```bash
cd backend
npx prisma migrate deploy
npx prisma db seed
```

### **1.4 Enable Row Level Security (RLS):**

```sql
-- Run in Supabase SQL Editor
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
-- ... (all tenant-scoped tables)
```

---

## 🗄️ **STEP 2: Redis Cache Setup (Upstash)**

### **2.1 Create Upstash Redis:**

1. Go to [upstash.com](https://upstash.com)
2. Sign in with GitHub
3. Click "Create Database"
4. Fill details:
   - **Name**: studyspot-cache
   - **Type**: Regional
   - **Region**: Choose closest
   - **TLS**: Enabled

### **2.2 Get Redis Credentials:**

```env
REDIS_URL="rediss://default:[PASSWORD]@[ENDPOINT].upstash.io:6379"
REDIS_TOKEN="[YOUR_TOKEN]"
```

---

## 📁 **STEP 3: File Storage Setup (Cloudflare R2)**

### **3.1 Create Cloudflare R2 Bucket:**

1. Go to [cloudflare.com](https://cloudflare.com)
2. Sign in / Create account
3. Go to R2 → Create Bucket
4. Bucket name: `studyspot-files`
5. Location: Automatic

### **3.2 Create API Token:**

1. Go to R2 → Manage R2 API Tokens
2. Create API Token
3. Permissions: Object Read & Write
4. Copy:
   - Access Key ID
   - Secret Access Key
   - Endpoint URL

```env
R2_ENDPOINT="https://[ACCOUNT-ID].r2.cloudflarestorage.com"
R2_ACCESS_KEY_ID="[ACCESS_KEY]"
R2_SECRET_ACCESS_KEY="[SECRET_KEY]"
R2_BUCKET_NAME="studyspot-files"
```

---

## 📧 **STEP 4: Email Service Setup (Resend)**

### **4.1 Create Resend Account:**

1. Go to [resend.com](https://resend.com)
2. Sign up with email
3. Verify email
4. Go to API Keys → Create API Key

```env
RESEND_API_KEY="re_[YOUR_API_KEY]"
RESEND_FROM_EMAIL="StudySpot <noreply@studyspot.com>"
```

### **4.2 Add Domain (Optional):**

1. Go to Domains → Add Domain
2. Enter your domain: `studyspot.com`
3. Add DNS records (provided by Resend)
4. Verify domain

---

## 🔧 **STEP 5: Backend Deployment (Render)**

### **5.1 Create Render Account:**

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Grant access to your repository

### **5.2 Create Web Service:**

1. Click "New +" → "Web Service"
2. Connect repository: `your-repo/backend`
3. Fill details:
   - **Name**: studyspot-api
   - **Region**: Choose closest
   - **Branch**: main
   - **Root Directory**: backend
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

### **5.3 Add Environment Variables:**

Go to Environment → Add Environment Variables:

```env
# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres

# Redis
REDIS_URL=rediss://default:[PASSWORD]@[ENDPOINT].upstash.io:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRES_IN=7d

# File Storage
R2_ENDPOINT=https://[ACCOUNT-ID].r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=[ACCESS_KEY]
R2_SECRET_ACCESS_KEY=[SECRET_KEY]
R2_BUCKET_NAME=studyspot-files

# Email
RESEND_API_KEY=re_[YOUR_API_KEY]
RESEND_FROM_EMAIL=StudySpot <noreply@studyspot.com>

# Payment Gateways
RAZORPAY_KEY_ID=rzp_test_[KEY]
RAZORPAY_KEY_SECRET=[SECRET]
STRIPE_SECRET_KEY=sk_test_[KEY]
STRIPE_WEBHOOK_SECRET=whsec_[SECRET]

# SMS/WhatsApp
TWILIO_ACCOUNT_SID=AC[SID]
TWILIO_AUTH_TOKEN=[TOKEN]
TWILIO_PHONE_NUMBER=+1234567890

# App Config
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://admin.studyspot.com
```

### **5.4 Deploy:**

1. Click "Create Web Service"
2. Wait for build (5-10 minutes)
3. Check logs for errors
4. Test API: `https://studyspot-api.onrender.com/api/health`

### **5.5 Custom Domain (Optional):**

1. Go to Settings → Custom Domain
2. Add domain: `api.studyspot.com`
3. Add CNAME record to your DNS:
   - **Name**: api
   - **Value**: studyspot-api.onrender.com

---

## 🎨 **STEP 6: Frontend Deployment (Vercel)**

### **6.1 Create Vercel Account:**

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Import project

### **6.2 Import Project:**

1. Click "Add New..." → "Project"
2. Import Git Repository
3. Select your repo: `your-repo/frontend`
4. Fill details:
   - **Framework Preset**: Create React App (or Vite)
   - **Root Directory**: frontend
   - **Build Command**: `npm run build`
   - **Output Directory**: build (CRA) or dist (Vite)

### **6.3 Add Environment Variables:**

```env
REACT_APP_API_URL=https://studyspot-api.onrender.com
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=2.0.0
REACT_APP_SENTRY_DSN=https://[YOUR_SENTRY_DSN]
```

### **6.4 Deploy:**

1. Click "Deploy"
2. Wait for build (3-5 minutes)
3. Test: `https://[project-name].vercel.app`

### **6.5 Custom Domain (Optional):**

1. Go to Settings → Domains
2. Add domain: `admin.studyspot.com`
3. Follow DNS instructions
4. Add A record:
   - **Name**: admin
   - **Value**: 76.76.21.21 (Vercel IP)

---

## 🔍 **STEP 7: Monitoring Setup (Better Stack)**

### **7.1 Create Better Stack Account:**

1. Go to [betterstack.com](https://betterstack.com)
2. Sign up (free tier)
3. Create Source

### **7.2 Add Logging:**

```bash
npm install @logtail/node
```

```typescript
// backend/src/config/logger.ts
import { Logtail } from '@logtail/node';

const logtail = new Logtail(process.env.LOGTAIL_SOURCE_TOKEN);

export const logger = {
  info: (message: string, data?: any) => {
    console.log(message, data);
    logtail.info(message, data);
  },
  error: (message: string, error?: any) => {
    console.error(message, error);
    logtail.error(message, { error: error?.message, stack: error?.stack });
  },
};
```

### **7.3 Add Uptime Monitoring:**

1. Go to Uptime → Create Monitor
2. URL: `https://studyspot-api.onrender.com/api/health`
3. Check interval: 1 minute
4. Email alerts: Enabled

---

## 🔐 **STEP 8: Security Configuration**

### **8.1 Environment Variables Security:**

- ✅ Never commit `.env` files
- ✅ Use different secrets for dev/prod
- ✅ Rotate secrets regularly (every 90 days)
- ✅ Use strong passwords (min 32 chars)

### **8.2 CORS Configuration:**

```typescript
// backend/src/app.ts
app.use(cors({
  origin: [
    'https://admin.studyspot.com',
    'https://[project].vercel.app', // Vercel preview deployments
  ],
  credentials: true,
}));
```

### **8.3 Rate Limiting:**

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use('/api', limiter);
```

### **8.4 Helmet Security Headers:**

```typescript
import helmet from 'helmet';

app.use(helmet());
```

---

## 🧪 **STEP 9: Post-Deployment Testing**

### **9.1 API Health Check:**

```bash
curl https://studyspot-api.onrender.com/api/health
```

Expected Response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-31T12:00:00.000Z",
  "uptime": 3600,
  "database": "connected",
  "redis": "connected"
}
```

### **9.2 Frontend Check:**

1. Open: `https://admin.studyspot.com`
2. Check:
   - ✅ Page loads without errors
   - ✅ Login works
   - ✅ API calls succeed
   - ✅ No console errors

### **9.3 Database Check:**

```bash
# Run from backend directory
npx prisma studio
```

### **9.4 Load Testing:**

```bash
# Using Apache Bench
ab -n 1000 -c 10 https://studyspot-api.onrender.com/api/health
```

---

## 📊 **STEP 10: Monitoring & Maintenance**

### **10.1 Set Up Alerts:**

**Better Stack:**
- ✅ API downtime alert
- ✅ Error rate threshold (>5%)
- ✅ Response time threshold (>2s)

**Supabase:**
- ✅ Database usage (>80%)
- ✅ Connection limit (>90%)

**Render:**
- ✅ Build failures
- ✅ Deployment errors

### **10.2 Regular Maintenance:**

**Daily:**
- Check error logs
- Monitor API response times
- Check uptime status

**Weekly:**
- Review usage metrics
- Check database size
- Review security logs

**Monthly:**
- Update dependencies
- Rotate API keys
- Review cost (ensure free tier)
- Backup database

---

## 🔄 **Continuous Deployment (CD)**

### **Auto Deploy on Git Push:**

**Vercel** (Automatic):
- Push to `main` → Auto deploy production
- Push to `develop` → Auto deploy preview

**Render** (Automatic):
- Push to `main` → Auto deploy
- Build time: ~5-10 minutes

### **GitHub Actions (Optional):**

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## 🚨 **Troubleshooting**

### **Backend Not Starting:**
```bash
# Check logs
render logs studyspot-api

# Common issues:
# 1. Missing environment variables
# 2. Database connection failed
# 3. Port already in use
```

### **Frontend Build Failing:**
```bash
# Check Vercel logs
vercel logs

# Common issues:
# 1. Missing dependencies
# 2. TypeScript errors
# 3. Environment variables not set
```

### **Database Connection Failed:**
```bash
# Test connection
psql $DATABASE_URL

# Check:
# 1. Password correct
# 2. Whitelist IP (Supabase → Settings → Database)
# 3. SSL enabled
```

---

## 📈 **Scaling (When You Outgrow Free Tier)**

### **When to Upgrade:**
- 📊 Frontend: >100GB bandwidth/month → Vercel Pro ($20/mo)
- 🔧 Backend: >750 hours/month → Render Starter ($7/mo)
- 🗄️ Database: >500MB or >2GB bandwidth → Supabase Pro ($25/mo)
- 💾 Redis: >10K commands/day → Upstash Pay-as-you-go
- 📁 Storage: >10GB → Cloudflare R2 ($0.015/GB/mo)

### **Optimization Before Scaling:**
1. Enable caching (Redis)
2. Optimize database queries
3. Compress responses (gzip)
4. Use CDN for static assets
5. Implement pagination
6. Lazy load images

---

## ✅ **Deployment Checklist**

- [ ] Database created (Supabase)
- [ ] Redis cache created (Upstash)
- [ ] File storage created (Cloudflare R2)
- [ ] Email service configured (Resend)
- [ ] Backend deployed (Render)
- [ ] Frontend deployed (Vercel)
- [ ] Custom domains added (optional)
- [ ] SSL certificates active
- [ ] Environment variables set
- [ ] Monitoring configured (Better Stack)
- [ ] Health checks passing
- [ ] API tested
- [ ] Frontend tested
- [ ] Documentation updated
- [ ] Team notified

---

## 🎉 **Success!**

Your StudySpot Admin Portal v2.0 is now **LIVE**! 🚀

**Production URLs:**
- **Frontend**: https://admin.studyspot.com
- **Backend API**: https://api.studyspot.com
- **Database**: Supabase (secure)
- **Status**: https://status.studyspot.com (Better Stack)

**Total Deployment Time**: ~2 hours  
**Total Cost**: **$0/month** (Free Tier)

---

**Last Updated**: October 31, 2025  
**Status**: ✅ **DEPLOYMENT READY**  
**Next**: Monitor and maintain your production app!


