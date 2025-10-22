# 🚀 Deploy StudySpot Platform - Clean & Secure!

## ✅ Prerequisites Complete

- ✅ Git history cleaned
- ✅ Secrets secured
- ✅ Code pushed to GitHub
- ✅ Repository ready!

---

## 🎯 Quick Deployment Options

### Option A: Deploy API to Render (Recommended First!)

**Why start here?**
- Quick setup (5 minutes)
- Free tier available
- Auto-deploy from GitHub
- Your repository is already connected!

**Steps:**

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Sign in with your account

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Select your repository: `studyspot`
   - Branch: `main`

3. **Configure Service**
   ```
   Name: studyspot-api
   Region: Choose closest to you
   Branch: main
   Root Directory: api
   Runtime: Node
   Build Command: npm install
   Start Command: node src/index-unified.js
   ```

4. **Set Environment Variables**
   Click "Add Environment Variable" for each:
   
   ```
   # IMPORTANT: Copy ALL values from your local api/.env file!
   # The values shown here are PLACEHOLDERS - use your actual values!
   
   NODE_ENV=production
   PORT=10000
   
   # Database (Supabase PostgreSQL - from api/.env)
   DATABASE_URL=<your-supabase-connection-string>
   
   # Redis (Upstash - from api/.env)
   UPSTASH_REDIS_REST_URL=<your-upstash-url>
   UPSTASH_REDIS_REST_TOKEN=<your-upstash-token>
   
   # JWT Secrets (from api/.env)
   JWT_SECRET=<your-jwt-secret>
   JWT_REFRESH_SECRET=<your-jwt-refresh-secret>
   ENCRYPTION_KEY=<your-encryption-key>
   SESSION_SECRET=<your-session-secret>
   
   # Cloudinary (from api/.env)
   CLOUDINARY_CLOUD_NAME=<your-cloud-name>
   CLOUDINARY_API_KEY=<your-api-key>
   CLOUDINARY_API_SECRET=<your-api-secret>
   
   # Brevo Email (from api/.env)
   BREVO_API_KEY=<your-brevo-api-key>
   BREVO_SENDER_EMAIL=<your-brevo-sender-email>
   ```
   
   **💡 TIP:** Open your local `api/.env` file and copy each value exactly!

5. **Deploy!**
   - Click "Create Web Service"
   - Render will:
     - Clone your repo
     - Install dependencies
     - Run migrations (if configured)
     - Start your API
   - **Wait 3-5 minutes** for deployment

6. **Get Your API URL**
   - Example: `https://studyspot-api.onrender.com`
   - Test it: Visit `https://studyspot-api.onrender.com/health`

---

### Option B: Deploy Frontend to Vercel

**After API is deployed**, deploy your frontend:

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click "Add New..." → "Project"

2. **Import Repository**
   - Select `studyspot` from GitHub
   - Click "Import"

3. **Configure Project**
   ```
   Framework Preset: Create React App
   Root Directory: web
   Build Command: npm run build
   Output Directory: build
   Install Command: npm install
   ```

4. **Set Environment Variable**
   ```
   REACT_APP_API_URL=https://studyspot-api.onrender.com
   ```
   (Use your actual Render API URL from Step 6 above)

5. **Deploy!**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Get your URL: `https://studyspot-xxx.vercel.app`

---

## 🧪 Test Your Deployment

### 1. Test API
```bash
# Health check
curl https://studyspot-api.onrender.com/health

# Expected response:
# {"status":"healthy","timestamp":"..."}
```

### 2. Test Frontend
- Visit your Vercel URL
- Try to register a new user
- Login and explore features

### 3. Test Database
- Register creates a user in Supabase
- Check in Supabase Dashboard → Table Editor → users

---

## 🎯 Deployment Checklist

### API Deployment
- [ ] Render service created
- [ ] All environment variables set
- [ ] Deployment successful
- [ ] Health endpoint responding
- [ ] Database connected

### Frontend Deployment
- [ ] Vercel project created
- [ ] API URL configured
- [ ] Build successful
- [ ] Site accessible
- [ ] Login/Register working

### Database Setup
- [ ] Migrations run successfully
- [ ] Tables created
- [ ] Sample data seeded (optional)

---

## 🔧 Troubleshooting

### API Won't Start
1. Check Render logs: Dashboard → Logs
2. Verify all env vars are set
3. Check database connection string
4. Ensure PORT=10000

### Frontend Can't Connect to API
1. Check REACT_APP_API_URL is correct
2. Verify API is running (health check)
3. Check browser console for errors
4. Verify CORS is enabled in API

### Database Errors
1. Test connection string locally first
2. Verify Supabase password is correct
3. Check if migrations ran
4. Look at Render logs for SQL errors

---

## 📞 Need Help?

### Check Logs
**Render API Logs:**
- Dashboard → Your Service → Logs tab

**Vercel Build Logs:**
- Dashboard → Your Project → Deployments → View Build

### Common Issues

**Build Failed:**
- Check package.json dependencies
- Verify Node version compatibility
- Look for missing environment variables

**Runtime Errors:**
- Check application logs
- Verify database connection
- Test API endpoints individually

**Connection Issues:**
- Verify CORS settings
- Check API URL in frontend
- Test from Postman/curl first

---

## 🎉 Success Metrics

Your deployment is successful when:

✅ API health endpoint returns 200 OK
✅ Frontend loads without errors
✅ User can register an account
✅ User can login successfully
✅ Database shows new user data
✅ No errors in console logs

---

## 🚀 Ready to Deploy?

**Start with the API (Option A)**, then deploy the frontend (Option B).

**Total time:** ~15 minutes for both!

Good luck! 🎊

