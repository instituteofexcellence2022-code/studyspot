# ✅ SIMPLE DEPLOYMENT GUIDE - NO GITHUB NEEDED

## 🎯 OPTION 1: ZIP FILE TO VERCEL (EASIEST - 20 minutes)

### Step 1: Prepare Folders (2 minutes)

You need to deploy these two folders separately:
- `C:\Users\insti\OneDrive\Desktop\om\web-owner`
- `C:\Users\insti\OneDrive\Desktop\om\web-admin`

### Step 2: Deploy Owner Portal (10 minutes)

**2a) Go to Vercel:**
- Open: https://vercel.com/
- Sign up / Log in with email or GitHub

**2b) Create New Project:**
- Click "Add New..." → "Project"
- Click "Browse" or drag folder
- Select the `web-owner` folder
- Click "Upload"

**2c) Configure:**
- **Framework Preset:** Create React App
- **Root Directory:** Leave as is (already web-owner)
- **Build Command:** `npm run build`
- **Output Directory:** `build`

**2d) Add Environment Variables:**
Click "Environment Variables" and add these ONE BY ONE:

```
Name: REACT_APP_API_URL
Value: https://studyspot-api.onrender.com

Name: REACT_APP_PORTAL_TYPE
Value: owner

Name: REACT_APP_PORTAL_NAME
Value: Library Owner Portal

Name: REACT_APP_VERSION
Value: 1.0.0

Name: NODE_ENV
Value: production
```

**2e) Deploy:**
- Click "Deploy" button
- Wait 5-10 minutes
- Copy your URL (e.g., `https://web-owner.vercel.app`)

---

### Step 3: Deploy Admin Portal (10 minutes)

**Same process as Owner Portal, but:**

**3a) Upload `web-admin` folder instead**

**3b) Use these environment variables:**

```
Name: REACT_APP_API_URL
Value: https://studyspot-api.onrender.com

Name: REACT_APP_PORTAL_TYPE
Value: admin

Name: REACT_APP_PORTAL_NAME
Value: Platform Administrator

Name: REACT_APP_VERSION
Value: 1.0.0

Name: NODE_ENV
Value: production
```

**3c) Deploy and copy the URL**

---

### Step 4: Update CORS (5 minutes)

**4a) Go to Render:**
- Open: https://dashboard.render.com/
- Click on your `studyspot-api` service
- Click "Environment" tab

**4b) Update CORS_ORIGIN:**
- Find the `CORS_ORIGIN` variable
- Click Edit
- Add your new Vercel URLs (separated by commas, NO SPACES):

```
https://studyspot-rose.vercel.app,http://localhost:3000,http://localhost:3002,https://YOUR-OWNER-URL.vercel.app,https://YOUR-ADMIN-URL.vercel.app
```

**Replace `YOUR-OWNER-URL` and `YOUR-ADMIN-URL` with your actual Vercel URLs!**

- Click "Save Changes"
- Wait 2-3 minutes for Render to restart

---

## ✅ DONE! TEST YOUR PORTALS!

**Owner Portal:** https://YOUR-OWNER-URL.vercel.app
**Admin Portal:** https://YOUR-ADMIN-URL.vercel.app

**Test registration:**
- Email: test@example.com
- Password: Test123456
- Name: Test User

**IT WILL WORK!** 🎉

---

## 🎯 ALTERNATIVE: VERCEL CLI (If zip upload doesn't work)

### Install Vercel CLI:
```
npm install -g vercel
```

### Login:
```
vercel login
```

### Deploy Owner Portal:
```
cd web-owner
vercel --prod
```
Follow prompts, set env variables when asked.

### Deploy Admin Portal:
```
cd web-admin
vercel --prod
```

---

## 💰 TOTAL COST: $0/month

Everything is FREE:
- ✅ Render (Backend API)
- ✅ Vercel (Both Portals)
- ✅ Supabase (Database)

---

## 🎯 TOTAL TIME: ~20 minutes

Just follow Step 1-4 above!

**ANY ISSUES? Just tell me where you're stuck!** 🚀


