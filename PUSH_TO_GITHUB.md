# 🚀 QUICK GITHUB PUSH & VERCEL DEPLOY

## ⚡ STEP 1: PUSH TO GITHUB (5 minutes)

Open PowerShell in your project folder and run these commands:

```powershell
# Add all files
git add .

# Commit
git commit -m "Ready for Vercel deployment - Owner and Admin portals"

# Push to GitHub
git push origin main
```

**If `git push` asks for credentials, use your GitHub username and password (or token).**

---

## ⚡ STEP 2: DEPLOY OWNER PORTAL TO VERCEL (15 minutes)

### 2a) Go to Vercel
- Open: https://vercel.com/new
- Login with GitHub

### 2b) Import Repository
- Click "Import Git Repository"
- Select your repository: `om` (or whatever it's called)
- Click "Import"

### 2c) Configure Owner Portal
**Root Directory:** `web-owner`
**Framework Preset:** Create React App
**Build Command:** `npm run build`
**Output Directory:** `build`

### 2d) Environment Variables
Click "Environment Variables" and add these:

```
REACT_APP_API_URL=https://studyspot-api.onrender.com
REACT_APP_PORTAL_TYPE=owner
REACT_APP_PORTAL_NAME=Library Owner Portal
REACT_APP_VERSION=1.0.0
NODE_ENV=production
```

### 2e) Deploy!
- Click "Deploy"
- Wait 3-5 minutes
- Copy your live URL (e.g., `https://om-owner.vercel.app`)

---

## ⚡ STEP 3: DEPLOY ADMIN PORTAL TO VERCEL (15 minutes)

### 3a) Create New Project
- Go to https://vercel.com/new
- Import same repository again

### 3b) Configure Admin Portal
**Root Directory:** `web-admin`
**Framework Preset:** Create React App
**Build Command:** `npm run build`
**Output Directory:** `build`

### 3c) Environment Variables
Add these:

```
REACT_APP_API_URL=https://studyspot-api.onrender.com
REACT_APP_PORTAL_TYPE=admin
REACT_APP_PORTAL_NAME=Platform Administrator
REACT_APP_VERSION=1.0.0
NODE_ENV=production
```

### 3d) Deploy!
- Click "Deploy"
- Wait 3-5 minutes
- Copy your live URL (e.g., `https://om-admin.vercel.app`)

---

## ⚡ STEP 4: UPDATE CORS ON RENDER (5 minutes)

### 4a) Go to Render
- Open: https://dashboard.render.com/
- Click on `studyspot-api`

### 4b) Add New URLs to CORS
- Go to "Environment" tab
- Find `CORS_ORIGIN`
- Update to include your new Vercel URLs:

```
https://studyspot-rose.vercel.app,http://localhost:3000,http://localhost:3002,https://om-owner.vercel.app,https://om-admin.vercel.app
```

**Replace `om-owner` and `om-admin` with your actual Vercel URLs!**

- Click "Save Changes"
- Wait 2-3 minutes for restart

---

## ✅ DONE! TEST YOUR LIVE PORTALS!

**Owner Portal:** https://om-owner.vercel.app (your URL)
**Admin Portal:** https://om-admin.vercel.app (your URL)

**Try registering:**
- Email: owner@test.com
- Password: Test123456
- Name: Test Owner

**IT WILL WORK!** 🎉

---

## 💰 TOTAL COST: $0/month

All services are on FREE tiers:
- Render (Backend)
- Vercel (Frontend) 
- Supabase (Database)

---

## 🎯 TOTAL TIME: ~40 minutes

- GitHub push: 5 min
- Owner portal deploy: 15 min
- Admin portal deploy: 15 min
- CORS update: 5 min

**LET'S GO!** 🚀


