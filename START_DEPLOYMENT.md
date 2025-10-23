# 🚀 Let's Deploy Your API Now!

## Step 1: Deploy to Render (5 minutes)

### A. Go to Render Dashboard
1. Open your browser
2. Go to: **https://dashboard.render.com**
3. Sign in to your account

---

### B. Create New Web Service

1. Click the **"New +"** button (top right)
2. Select **"Web Service"**
3. Click **"Build and deploy from a Git repository"**
4. Click **"Next"**

---

### C. Connect Your Repository

1. If you see your repository `studyspot`:
   - Click **"Connect"** next to it
   
2. If you DON'T see it:
   - Click **"Configure account"**
   - Give Render access to your GitHub
   - Come back and select `studyspot`

---

### D. Configure Your Service

Fill in these settings:

**Basic Settings:**
```
Name: studyspot-api
Region: Singapore (or closest to you)
Branch: main
Root Directory: api
Runtime: Node
```

**Build & Deploy:**
```
Build Command: npm install
Start Command: node src/index-unified.js
```

**Instance Type:**
```
Free
```

Click **"Advanced"** to continue...

---

### E. Add Environment Variables

This is the MOST IMPORTANT step! 🔑

Click **"Add Environment Variable"** and add each one:

#### 1. Basic Settings
```
NODE_ENV = production
PORT = 10000
```

#### 2. Database (Open api/.env and copy your DATABASE_URL)
```
DATABASE_URL = <paste from api/.env>
```

#### 3. Redis (Copy from api/.env)
```
UPSTASH_REDIS_REST_URL = <paste from api/.env>
UPSTASH_REDIS_REST_TOKEN = <paste from api/.env>
```

#### 4. JWT Secrets (Copy from api/.env)
```
JWT_SECRET = <paste from api/.env>
JWT_REFRESH_SECRET = <paste from api/.env>
ENCRYPTION_KEY = <paste from api/.env>
SESSION_SECRET = <paste from api/.env>
```

#### 5. Cloudinary (Copy from api/.env)
```
CLOUDINARY_CLOUD_NAME = <paste from api/.env>
CLOUDINARY_API_KEY = <paste from api/.env>
CLOUDINARY_API_SECRET = <paste from api/.env>
```

#### 6. Brevo Email (Copy from api/.env)
```
BREVO_API_KEY = <paste from api/.env>
BREVO_SENDER_EMAIL = <paste from api/.env>
```

**Total: 12 environment variables** ✅

---

### F. Create Service & Deploy!

1. Scroll down
2. Click **"Create Web Service"**
3. Wait 3-5 minutes while Render:
   - Clones your repository
   - Installs dependencies
   - Starts your API

**Watch the logs!** You'll see:
- `npm install` running
- `Starting server...`
- `Server running on port 10000`

---

### G. Test Your API

Once deployed (status shows "Live"):

1. Copy your API URL (looks like: `https://studyspot-api.onrender.com`)
2. Add `/health` to the end
3. Visit: `https://studyspot-api.onrender.com/health`

**Expected response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-22T..."
}
```

✅ **If you see this, YOUR API IS LIVE!** 🎉

---

## Common Issues & Fixes

### ❌ Build Failed
**Solution:** Check the logs for errors
- Missing environment variable?
- Syntax error in code?
- Check Build Command is correct

### ❌ Deploy Failed
**Solution:** 
- Verify all 12 env vars are set
- Check DATABASE_URL is correct
- Make sure Start Command is: `node src/index-unified.js`

### ❌ Service Crashes After Start
**Solution:**
- Check logs for database connection errors
- Verify Supabase password is correct
- Test your DATABASE_URL locally first

---

## ✅ Success Checklist

- [ ] Render account logged in
- [ ] Repository connected
- [ ] Service configured (name, region, branch, root dir)
- [ ] Build/Start commands set
- [ ] All 12 environment variables added
- [ ] Service created
- [ ] Build successful (green checkmark)
- [ ] Deploy successful (status: Live)
- [ ] Health endpoint responding

---

## 📸 What You Should See

**During Build:**
```
Installing dependencies...
npm install
✅ Build successful
```

**During Deploy:**
```
Starting...
Server running on port 10000
Database connected
Redis connected
✅ Deploy successful
```

**In Browser (health check):**
```json
{"status":"healthy","timestamp":"..."}
```

---

## 🎯 When API is Live...

**Copy your API URL!** You'll need it for frontend deployment.

Example: `https://studyspot-api-xxxxx.onrender.com`

Then we'll deploy the frontend to Vercel! 🌐

---

## 🆘 Need Help?

**Render is slow/stuck?**
- Free tier can take 5-10 minutes
- Be patient, watch the logs

**Can't find environment variables?**
- Open `api/.env` in your code editor
- Copy each value exactly

**Database won't connect?**
- Double-check your Supabase password
- Make sure you're using the pooler connection string
- Test locally first: `node test-database-connection.js`

---

## 👉 Ready to Start?

1. **Open:** https://dashboard.render.com
2. **Click:** "New +" → "Web Service"
3. **Follow:** The steps above

**Take your time! Each step is important.** ⏱️

Good luck! 🚀

---

**After your API is deployed, we'll deploy the frontend to Vercel next!**








