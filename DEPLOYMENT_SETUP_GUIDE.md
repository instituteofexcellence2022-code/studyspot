# 🚀 STUDYSPOT DEPLOYMENT SETUP GUIDE

## **QUICK START (5 MINUTES)**

### **Step 1: Database Setup (Neon.tech)**
1. Go to https://neon.tech
2. Sign up (free tier: 3GB PostgreSQL)
3. Create project: `studyspot-prod`
4. Copy connection string
5. Run migrations: `cd api && npm run db:migrate`

### **Step 2: Backend Deployment (Railway)**
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select your repo → `api` folder
4. Add environment variables (see `.env.template`)
5. Deploy!

### **Step 3: Frontend Deployments (Vercel)**
```bash
# Student PWA
cd studyspot-student-pwa
vercel --prod

# Owner Portal
cd web-owner
vercel --prod

# Admin Portal
cd web-admin-new/frontend
vercel --prod
```

### **Step 4: Cloudflare CDN Setup**
1. Add site to Cloudflare
2. Update DNS records
3. Enable Auto-Minify, Brotli compression
4. Enable SSL/TLS (Full)

### **Step 5: Redis Setup (Railway)**
1. Railway → Add Service → Redis
2. Copy connection URL
3. Add to backend env: `REDIS_URL`

---

## **DETAILED CONFIGURATION**

### **📦 Backend (Railway)**

**railway.json** (in `api/` folder):
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Environment Variables:**
- `NODE_ENV=production`
- `PORT=3000`
- `DATABASE_URL` (from Neon.tech)
- `REDIS_URL` (from Railway Redis)
- `JWT_SECRET` (generate: `openssl rand -base64 32`)
- `CORS_ORIGIN` (your frontend URLs)

---

### **🎨 Frontend (Vercel)**

**Already configured via `vercel.json` files!**

**Student PWA:**
- Auto-deploy from `studyspot-student-pwa/`
- Build command: `npm run build`
- Output: `dist/`

**Owner Portal:**
- Auto-deploy from `web-owner/`
- Build command: `npm run build`
- Output: `build/`

**Admin Portal:**
- Auto-deploy from `web-admin-new/frontend/`
- Build command: `npm run build`
- Output: `build/`

---

### **🗄️ Database (Neon.tech)**

**Primary Database:**
```bash
# Connection string format
DATABASE_URL=postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/studyspot?sslmode=require
```

**Read Replicas:**
- PlanetScale (MySQL): 5GB free
- Supabase: 500MB free

---

### **⚡ Redis Caching (Railway + Upstash)**

**Railway Redis:**
```bash
REDIS_URL=redis://default:password@containers-us-west-xxx.railway.app:6379
```

**Upstash Redis (Backup):**
```bash
UPSTASH_REDIS_URL=redis://default:password@xxx.upstash.io:6379
```

---

### **📧 Email Services**

**Multi-Provider Setup:**
1. **Resend** (3,000 emails/month)
2. **SendGrid** (100 emails/day)
3. **Mailgun** (5,000 emails/month)
4. **Brevo** (300 emails/day)
5. **Postmark** (100 emails/month)
6. **Amazon SES** (62,000 emails/month)
7. **Mailtrap** (500 emails/month)

**Configure in backend:**
```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxx
SENDGRID_API_KEY=SG.xxx
MAILGUN_API_KEY=xxx
```

---

### **📱 WhatsApp OTP (Twilio)**

1. Sign up: https://twilio.com
2. Get Sandbox number
3. Add to env:
```env
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+14155238886
```

---

### **☁️ Storage (Cloudinary + Backblaze)**

**Cloudinary (Images):**
```env
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

**Backblaze B2 (Documents):**
```env
BACKBLAZE_KEY_ID=xxx
BACKBLAZE_APPLICATION_KEY=xxx
BACKBLAZE_BUCKET=studyspot-docs
```

---

### **🔐 Authentication (Supabase)**

1. Sign up: https://supabase.com
2. Create project
3. Get API keys:
```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_KEY=xxx
```

---

### **📊 Monitoring**

**Sentry (Error Tracking):**
```env
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

**PostHog (Analytics):**
```env
POSTHOG_API_KEY=xxx
POSTHOG_HOST=https://app.posthog.com
```

**UptimeRobot:**
- Sign up: https://uptimerobot.com
- Add monitors for:
  - Backend API
  - Student Portal
  - Owner Portal
  - Admin Portal

---

### **🌐 Cloudflare Setup**

1. **Add Site:**
   - Add domain to Cloudflare
   - Update nameservers

2. **DNS Records:**
   ```
   Type  Name    Value
   CNAME api     studyspot-api.railway.app
   CNAME student studyspot-student.vercel.app
   CNAME owner   studyspot-owner.vercel.app
   CNAME admin   studyspot-admin.vercel.app
   ```

3. **SSL/TLS:**
   - Mode: Full (strict)
   - Auto-renew: ON

4. **Speed:**
   - Auto-Minify: ON
   - Brotli: ON
   - HTTP/2: ON
   - HTTP/3: ON

5. **Security:**
   - DDoS Protection: ON
   - WAF: ON
   - Bot Fight Mode: ON

---

## **✅ VERIFICATION CHECKLIST**

- [ ] Backend deployed on Railway
- [ ] Database migrations run
- [ ] Redis connected
- [ ] All 3 frontends deployed on Vercel
- [ ] Cloudflare CDN configured
- [ ] SSL certificates active
- [ ] Email providers configured
- [ ] WhatsApp OTP working
- [ ] Monitoring tools active
- [ ] All environment variables set

---

## **🚨 TROUBLESHOOTING**

**Backend not starting?**
- Check Railway logs
- Verify `DATABASE_URL` is correct
- Check `JWT_SECRET` is set

**Frontend build failing?**
- Check Vercel build logs
- Verify `VITE_API_URL` or `REACT_APP_API_URL` is set
- Check Node version (18+)

**Database connection errors?**
- Verify connection string
- Check IP whitelist (Neon.tech)
- Test connection locally

**CORS errors?**
- Update `CORS_ORIGIN` in backend
- Include all frontend URLs

---

## **📞 SUPPORT**

If you encounter issues:
1. Check logs on Railway/Vercel
2. Verify environment variables
3. Test API endpoints with Postman
4. Check Cloudflare analytics

**Ready to scale to 20K users! 🎉**

