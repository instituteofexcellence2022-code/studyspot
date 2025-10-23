# 🌐 Web App Deployment Guide - Vercel

## ✅ Pre-requisites Checked
- ✅ Backend API is live: https://studyspot-api.onrender.com
- ✅ Web app is ready in `/web` folder
- ✅ Vercel configuration created

---

## 🚀 DEPLOY TO VERCEL (Recommended - Free & Fast)

### Method 1: Deploy via GitHub (Easiest - Auto Deploy)

#### Step 1: Commit Deployment Files
```bash
git add vercel.json web/vercel.json
git commit -m "Add Vercel deployment configuration"
git push origin main
```

#### Step 2: Sign Up / Login to Vercel
1. Go to: https://vercel.com
2. Click **"Sign Up"** or **"Login"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub

#### Step 3: Import Your Project
1. Click **"Add New..."** → **"Project"**
2. Find and select: **`studyspot`** repository
3. Click **"Import"**

#### Step 4: Configure Project Settings
**Framework Preset:** `Create React App`

**Root Directory:** Click **"Edit"** → Type: `web` → Click **"Continue"**

**Build Settings:**
- Build Command: `npm run build`
- Output Directory: `build`
- Install Command: `npm install`

**Environment Variables:** Click **"Add"**

Add this ONE variable:
```
NAME: REACT_APP_API_URL
VALUE: https://studyspot-api.onrender.com
```

#### Step 5: Deploy!
1. Click **"Deploy"**
2. Wait 2-3 minutes for build
3. Your app will be live at: `https://studyspot-xxx.vercel.app`

---

### Method 2: Deploy via Vercel CLI (Advanced)

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Login
```bash
vercel login
```
(Opens browser - login with GitHub)

#### Step 3: Deploy
```bash
cd web
vercel --prod
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Choose your account
- Link to existing project? **N**
- Project name? **studyspot-web**
- Directory? `./` (current directory)
- Override settings? **Y**
- Build Command? `npm run build`
- Output Directory? `build`
- Development Command? `npm start`

---

## 🎨 ALTERNATIVE: Deploy to Netlify

### Step 1: Sign Up
1. Go to: https://netlify.com
2. Click **"Sign Up"** → **"GitHub"**

### Step 2: New Site from Git
1. Click **"Add new site"** → **"Import an existing project"**
2. Choose **"GitHub"**
3. Select: **`studyspot`** repository

### Step 3: Configure Build
- Base directory: `web`
- Build command: `npm run build`
- Publish directory: `web/build`

### Step 4: Environment Variables
Click **"Show advanced"** → **"New variable"**
```
REACT_APP_API_URL = https://studyspot-api.onrender.com
```

### Step 5: Deploy
Click **"Deploy site"**

---

## 🔧 After Deployment

### 1. Get Your URL
Vercel will give you: `https://studyspot-xxx.vercel.app`  
Or Netlify: `https://studyspot-xxx.netlify.app`

### 2. Test Your App
Open the URL in browser and test:
- ✅ Homepage loads
- ✅ Can register a new account
- ✅ Can login
- ✅ Dashboard loads
- ✅ Libraries page works

### 3. Custom Domain (Optional)
**In Vercel:**
1. Go to Project Settings → Domains
2. Add your domain (e.g., `studyspot.com`)
3. Follow DNS setup instructions

**In Netlify:**
1. Go to Domain Settings
2. Add custom domain
3. Update DNS records

---

## 🐛 Troubleshooting

### Build Fails - "Module not found"
**Fix:** Make sure you're in the `web` directory:
```bash
cd web
npm install
```

### API Calls Return 404
**Fix:** Check environment variable is set:
```
REACT_APP_API_URL=https://studyspot-api.onrender.com
```

### Blank Page After Deployment
**Fix:** Check browser console for errors. Usually means routing issue.
Add this to `package.json`:
```json
"homepage": "."
```

### CORS Errors
**Fix:** Your backend needs to allow your frontend domain.
Add to Render environment variables:
```
CORS_ORIGIN=https://your-vercel-app.vercel.app
```

---

## 📋 Quick Checklist

- [ ] Vercel/Netlify account created
- [ ] Project imported from GitHub
- [ ] Root directory set to `web`
- [ ] Environment variable `REACT_APP_API_URL` added
- [ ] Build command: `npm run build`
- [ ] Output directory: `build`
- [ ] Deployment successful
- [ ] App opens in browser
- [ ] Login/Register works
- [ ] API calls succeed

---

## 🎉 Expected Result

Once deployed, you should see:

**Homepage:**
- Modern landing page
- Login/Register buttons

**After Login:**
- User dashboard
- Library listings
- Booking system
- All features working!

---

## 💬 Need Help?

Tell me:
1. Which platform you chose (Vercel/Netlify)
2. At which step you're stuck
3. Any error messages you see

I'll guide you through it! 🚀








