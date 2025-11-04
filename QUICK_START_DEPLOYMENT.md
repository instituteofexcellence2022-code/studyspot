# 🚀 QUICK START - Deploy StudySpot in 15 Minutes

## **Step-by-Step Deployment Guide**

### **1. Backend (Railway) - 5 minutes**

1. **Sign up:** https://railway.app
2. **New Project** → **Deploy from GitHub**
3. **Select repository:** Your StudySpot repo
4. **Root Directory:** `api`
5. **Add Environment Variables:**
   - Copy from `api/env.production.template`
   - Set `DATABASE_URL` (from Neon.tech)
   - Set `REDIS_URL` (from Railway Redis service)
   - Set `JWT_SECRET` (generate: `openssl rand -base64 32`)
   - Set `CORS_ORIGIN` (your frontend URLs)
6. **Deploy!**

**Railway will:**
- Auto-detect Node.js
- Run `npm install`
- Run `npm start`
- Expose on `studyspot-api.railway.app`

---

### **2. Database (Neon.tech) - 3 minutes**

1. **Sign up:** https://neon.tech
2. **Create Project:** `studyspot-prod`
3. **Copy Connection String:**
   ```
   postgresql://user:password@ep-xxx.region.aws.neon.tech/studyspot?sslmode=require
   ```
4. **Add to Railway env:** `DATABASE_URL`
5. **Run Migrations:**
   ```bash
   cd api
   npm run db:migrate
   ```

---

### **3. Redis (Railway) - 2 minutes**

1. **In Railway project:** Add Service → **Redis**
2. **Copy connection URL**
3. **Add to backend env:** `REDIS_URL`

---

### **4. Frontend (Vercel) - 5 minutes**

#### **Student PWA:**
```bash
cd studyspot-student-pwa
npm i -g vercel
vercel --prod
```
- **Project Name:** `studyspot-student-pwa`
- **Root Directory:** `studyspot-student-pwa`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variables:**
  - `VITE_API_URL=https://studyspot-api.railway.app`

#### **Owner Portal:**
```bash
cd web-owner
vercel --prod
```
- **Project Name:** `studyspot-owner-portal`
- **Root Directory:** `web-owner`
- **Build Command:** `npm run build`
- **Output Directory:** `build`
- **Environment Variables:**
  - `REACT_APP_API_URL=https://studyspot-api.railway.app`

#### **Admin Portal:**
```bash
cd web-admin-new/frontend
vercel --prod
```
- **Project Name:** `studyspot-admin-portal`
- **Root Directory:** `web-admin-new/frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `build`
- **Environment Variables:**
  - `REACT_APP_API_URL=https://studyspot-api.railway.app`

---

### **5. Cloudflare (Optional but Recommended) - 5 minutes**

1. **Add Site:** https://cloudflare.com
2. **Update DNS Records:**
   ```
   Type    Name    Value
   CNAME   api     studyspot-api.railway.app
   CNAME   student studyspot-student.vercel.app
   CNAME   owner   studyspot-owner.vercel.app
   CNAME   admin   studyspot-admin.vercel.app
   ```
3. **SSL/TLS:** Set to **Full (strict)**
4. **Enable:** Auto Minify, Brotli, HTTP/2

---

## **✅ Verification**

### **Test Backend:**
```bash
curl https://studyspot-api.railway.app/api/health
```

### **Test Frontends:**
- Student: https://studyspot-student.vercel.app
- Owner: https://studyspot-owner.vercel.app
- Admin: https://studyspot-admin.vercel.app

---

## **🎯 Next Steps (Optional)**

### **Email Providers:**
1. Sign up for **Resend** (free: 3,000 emails/month)
2. Get API key
3. Add to Railway: `RESEND_API_KEY=re_xxx`
4. Set: `EMAIL_PROVIDER=resend`

### **WhatsApp OTP:**
1. Sign up for **Twilio** (free sandbox)
2. Get Account SID & Auth Token
3. Add to Railway:
   - `TWILIO_ACCOUNT_SID=ACxxx`
   - `TWILIO_AUTH_TOKEN=xxx`

### **Storage:**
1. Sign up for **Cloudinary** (free: 25GB)
2. Get API keys
3. Add to Railway:
   - `CLOUDINARY_CLOUD_NAME=xxx`
   - `CLOUDINARY_API_KEY=xxx`
   - `CLOUDINARY_API_SECRET=xxx`

### **Monitoring:**
1. Sign up for **Sentry** (error tracking)
2. Get DSN
3. Add to Railway: `SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx`

---

## **🚨 Troubleshooting**

**Backend not starting?**
- Check Railway logs
- Verify `DATABASE_URL` is correct
- Check `JWT_SECRET` is set

**CORS errors?**
- Update `CORS_ORIGIN` in Railway env
- Include all frontend URLs (comma-separated)

**Database connection errors?**
- Verify connection string
- Check IP whitelist (Neon.tech)
- Test connection locally

**Frontend build failing?**
- Check Vercel build logs
- Verify environment variables
- Check Node version (18+)

---

## **🎉 You're Live!**

Your StudySpot platform is now deployed and ready to scale to 20K+ users! 🚀

**All on FREE tiers:**
- ✅ Backend: Railway (always on)
- ✅ Database: Neon.tech (3GB)
- ✅ Redis: Railway (256MB)
- ✅ Frontend: Vercel (unlimited)
- ✅ CDN: Cloudflare (unlimited bandwidth)

**Total Cost: $0/month**

