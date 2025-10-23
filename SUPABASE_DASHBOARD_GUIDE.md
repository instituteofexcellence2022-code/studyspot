# 🎯 Supabase Dashboard - Step-by-Step Guide

**Goal:** Resume your paused database and get it connected to your app

---

## 📍 **Step 1: Open Supabase Dashboard**

1. **Open your browser**
2. **Go to:** https://supabase.com/dashboard
3. **You'll see the login page**

### If Not Logged In:
- Click **"Sign in"**
- Enter your email/password
- Or use GitHub login if you signed up with GitHub

### If Already Logged In:
- You'll see your projects immediately

---

## 📍 **Step 2: Find Your Project**

After logging in, you'll see one of these:

### Scenario A: You See Your Project
- **Look for your project name** (might be "StudySpot" or similar)
- **You'll see a card/tile** with your project name
- **Click on it** to open

### Scenario B: List of Projects
- If you have multiple projects, they'll be listed
- **Find the one** you're using for StudySpot
- **Click to open**

### Scenario C: No Projects
- If you don't see any projects, you might need to create one
- Click **"New Project"**
- Fill in the details

---

## 📍 **Step 3: Check Database Status**

Once you open your project, you'll see the **Project Dashboard**.

### Look at the Top/Header Area:
You'll see one of these statuses:

#### ✅ **Active** (Green indicator)
- Database is running
- Good to go!
- Skip to Step 5

#### ⚠️ **Paused** (Yellow/Orange indicator)  
- Database is paused (THIS IS LIKELY YOUR ISSUE)
- You'll see a **"Resume"** or **"Restore"** button
- Continue to Step 4

#### ❌ **Inactive** (Red indicator)
- Database needs to be reactivated
- Click **"Resume"** or **"Activate"**

---

## 📍 **Step 4: Resume/Unpause Database** ⭐ MOST IMPORTANT

### If You See "Paused" Status:

1. **Look for the "Resume" button**
   - Usually in the top right corner
   - Or a banner saying "This project is paused"
   
2. **Click "Resume Project"** or **"Restore Project"**

3. **Wait for restoration**
   - You'll see a progress indicator
   - Usually takes **30 seconds to 2 minutes**
   - Message will say: "Restoring project..." or "Waking up database..."

4. **Wait for "Active" status**
   - Status indicator turns **green**
   - You'll see: "Project is active" or similar

### ✅ Done! Your database is now active!

---

## 📍 **Step 5: Get Database Connection String** (Optional)

If resuming didn't work, or you want to verify the connection string:

### 5.1: Go to Settings

1. **Look at the left sidebar**
2. **Click the gear icon** (⚙️) labeled **"Settings"**
3. **Click "Database"** under Settings

### 5.2: Find Connection String

You'll see several tabs:
- **Connection Info**
- **Connection string**
- **Connection pooling**

#### Option A: Use Connection Pooling (Recommended)

1. **Click on "Connection Pooling" tab**
2. **Select "Session mode"** (from dropdown)
3. **You'll see a connection string like:**
   ```
   postgresql://postgres.[PROJECT-ID]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres
   ```

4. **The `[YOUR-PASSWORD]` part will be hidden**
   - You need to replace it with your actual database password
   - If you don't remember it, you can reset it (see below)

#### Option B: Direct Connection

1. **Click on "Connection string" tab**
2. **Select "URI" format**
3. **Copy the connection string**
4. **Replace `[YOUR-PASSWORD]` with actual password**

### 5.3: Get/Reset Database Password

**If you don't remember your database password:**

1. **Still in Settings > Database**
2. **Scroll down to "Database Password"**
3. **Click "Reset Database Password"**
4. **Enter a new password**
   - Make it strong but memorable
   - **WRITE IT DOWN!**
5. **Click "Update password"**
6. **Copy the new password**
7. **Go back to Connection string and replace `[YOUR-PASSWORD]`**

---

## 📍 **Step 6: Update Your .env File** (If Needed)

If you got a new connection string:

### 6.1: Open Your Project
- Open VS Code or your editor
- Navigate to your project folder

### 6.2: Edit api/.env
1. **Open file:** `api/.env`
2. **Find the line:** `DATABASE_URL=...`
3. **Replace with your new connection string**
4. **Save the file**

**Example:**
```env
DATABASE_URL=postgresql://postgres.zgrgryufcxgjbmpjiwbh:YOUR_NEW_PASSWORD@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
```

---

## 📍 **Step 7: Verify Database is Active**

### Back in Supabase Dashboard:

1. **Click "Table Editor"** in left sidebar
2. **You should see your tables** (users, libraries, etc.)
3. **If you see tables** = Database is working! ✅

### Test Query (Optional):

1. **Click "SQL Editor"** in left sidebar
2. **Type:** `SELECT NOW();`
3. **Click "Run"**
4. **If you see a timestamp** = Database is working! ✅

---

## 📍 **Step 8: Test Connection from Your App**

### 8.1: Start Your Server

Open terminal and run:
```bash
cd api
npm start
```

### 8.2: Watch for Success Messages

**Look for:**
```
✅ Connected to PostgreSQL successfully!
✅ Connected to Redis successfully!
🚀 Server running on port 3001
```

**NOT:**
```
❌ Database connection failed
❌ SASL: SCRAM-SERVER-FIRST-MESSAGE
```

### 8.3: Test Health Endpoint

In another terminal:
```bash
curl http://localhost:3001/api/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

---

## 🎯 **Quick Reference Card**

### Where to Find Things:

| What You Need | Where to Find It |
|---------------|------------------|
| Resume Database | Top of dashboard, "Resume" button |
| Connection String | Settings → Database → Connection Pooling |
| Database Password | Settings → Database → Reset Password |
| Check Tables | Table Editor (left sidebar) |
| Run SQL | SQL Editor (left sidebar) |
| Project Status | Top right corner (Active/Paused) |

---

## ⚠️ **Common Issues**

### Issue 1: Can't Find "Resume" Button
- **Look for:** Banner at the top saying "Project is paused"
- **Or:** Orange/yellow status indicator
- **Or:** Message saying "Inactive" or "Paused"

### Issue 2: Database Still Won't Connect
- **Wait 2-3 minutes** after resuming (it takes time to wake up)
- **Refresh Supabase dashboard** to check status
- **Try getting fresh connection string** (Step 5)

### Issue 3: Forgot Password
- **Go to:** Settings → Database → Reset Database Password
- **Set new password**
- **Update api/.env** with new connection string

### Issue 4: Project Keeps Pausing
- **Free tier pauses** after 7 days of inactivity
- **Solution:** Keep using it, or upgrade to paid tier
- **Workaround:** Set up a cron job to ping it daily

---

## 📸 **Visual Guide**

### What You'll See:

**1. Dashboard Home:**
```
┌─────────────────────────────────────┐
│  Supabase Dashboard                 │
├─────────────────────────────────────┤
│  Your Projects:                     │
│  ┌───────────────────┐             │
│  │ StudySpot         │ ← Your project
│  │ Status: Paused ⚠️  │             │
│  │ [Resume] button   │             │
│  └───────────────────┘             │
└─────────────────────────────────────┘
```

**2. After Clicking Project:**
```
┌─────────────────────────────────────┐
│ StudySpot Project                   │
│ Status: Paused ⚠️  [Resume] ← Click │
├─────────────────────────────────────┤
│ Left Sidebar:                       │
│  - Table Editor                     │
│  - SQL Editor                       │
│  - Database                         │
│  - ⚙️ Settings ← Click this        │
└─────────────────────────────────────┘
```

**3. Settings → Database:**
```
┌─────────────────────────────────────┐
│ Database Settings                   │
├─────────────────────────────────────┤
│ Tabs:                               │
│ [ Connection Info ]                 │
│ [ Connection string ] ← Click       │
│ [ Connection pooling ] ← Or this    │
│                                     │
│ Connection String:                  │
│ postgresql://postgres...            │
│ [Copy] button                       │
│                                     │
│ Database Password:                  │
│ [ Reset Database Password ] ← If needed
└─────────────────────────────────────┘
```

---

## ✅ **Success Checklist**

After following this guide, you should have:

- [ ] Logged into Supabase dashboard
- [ ] Found your project
- [ ] Checked database status
- [ ] Resumed/unpaused database (if it was paused)
- [ ] Verified status shows "Active" (green)
- [ ] (Optional) Got connection string
- [ ] (Optional) Updated api/.env if needed
- [ ] Tested server starts without database errors
- [ ] Health check shows database: "connected"

---

## 🎊 **You're Done!**

Once the database is active:
1. **Your server will connect** ✅
2. **You can test endpoints** (Step B) ✅
3. **You can run migrations** (Step A) ✅
4. **You can deploy!** 🚀

---

## 📞 **Still Stuck?**

**Tell me:**
1. What do you see when you open Supabase dashboard?
2. What's the status of your project? (Active/Paused/Other)
3. Any error messages?

And I'll help you through it! 🤝

---

**Now go to:** https://supabase.com/dashboard

**And follow steps 1-8!** 🎯








