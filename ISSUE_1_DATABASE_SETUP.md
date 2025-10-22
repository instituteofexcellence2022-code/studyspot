# 🗄️ ISSUE #1: Database Setup (PostgreSQL)

**Status:** ⬜ Not Started  
**Priority:** 🔴 CRITICAL  
**Estimated Time:** 1-2 hours  
**Cost:** FREE

---

## 🎯 Goal

Replace SQLite with production PostgreSQL database via Supabase.

---

## 📋 Prerequisites

Before we start, you'll need:
- [ ] Email address (for Supabase account)
- [ ] Web browser
- [ ] 1-2 hours of time

That's it! Everything else is free.

---

## 🚀 Step-by-Step Guide

### **STEP 1: Create Supabase Account**

**Time:** 5 minutes

1. Open browser and go to: **https://supabase.com**

2. Click the **"Start your project"** button

3. Choose sign-up method:
   - **Option A:** Sign up with **GitHub** (recommended - faster)
   - **Option B:** Use email + password

4. Complete the sign-up process

5. Verify your email if required

✅ **Checkpoint:** You should now see the Supabase dashboard

---

### **STEP 2: Create Your Database Project**

**Time:** 5 minutes

1. In the Supabase dashboard, click **"New Project"**

2. Select your organization (or create one):
   - Organization name: `StudySpot` or your name
   - Click **"Create organization"**

3. Fill in project details:
   ```
   Name: studyspot-production
   Database Password: [Click "Generate a password"]
   Region: [Choose closest to your location]
              - US East (N. Virginia) for USA East Coast
              - EU West (Ireland) for Europe
              - AP Southeast (Singapore) for Asia
   Pricing Plan: Free (default)
   ```

4. **IMPORTANT:** Click **"Generate a password"** and then **COPY IT**
   - Paste it somewhere safe (we'll need it)
   - This password is shown ONLY ONCE

5. Click **"Create new project"**

6. Wait 2-3 minutes while Supabase sets up your database

✅ **Checkpoint:** You should see "Project is ready" or similar message

---

### **STEP 3: Get Your Database Connection String**

**Time:** 3 minutes

1. In your project dashboard, click **Settings** (gear icon in left sidebar)

2. Click **"Database"** in the settings menu

3. Scroll down to **"Connection string"** section

4. You'll see several tabs - click **"URI"**

5. Copy the connection string. It looks like this:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxx.supabase.co:5432/postgres
   ```

6. **IMPORTANT:** Replace `[YOUR-PASSWORD]` with the password you saved earlier
   - Example before:
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.abc123.supabase.co:5432/postgres
     ```
   - Example after (with your password):
     ```
     postgresql://postgres:MySecurePass123!@db.abc123.supabase.co:5432/postgres
     ```

7. **Save this complete connection string** - we'll use it in the next step

✅ **Checkpoint:** You have a complete PostgreSQL connection string

---

### **STEP 4: Save Your Credentials Securely**

**Time:** 2 minutes

**I'll create a secure file for you now...**

Once you have your connection string, tell me:
```
I have my connection string ready
```

And I'll:
1. Create a secure credentials file
2. Update the API configuration
3. Test the connection

---

### **STEP 5: Configure API to Use PostgreSQL**

**Time:** 5 minutes

Once you provide the connection string, I will:

1. Update `api/.env` file with your database URL
2. Switch from SQLite to PostgreSQL
3. Install any missing dependencies
4. Verify connection works

---

### **STEP 6: Run Database Migrations**

**Time:** 5-10 minutes

We'll run migrations to create all database tables:

```
✅ Users table
✅ Libraries table
✅ Bookings table
✅ Subscriptions table
✅ Credits table
✅ Roles & Permissions tables
✅ Tenants table
✅ And 20+ more...
```

This will set up the complete database schema for StudySpot.

---

### **STEP 7: Seed Initial Data (Optional)**

**Time:** 2 minutes

Optionally, we can add:
- Sample libraries
- Demo user accounts
- Default roles
- Subscription plans

---

### **STEP 8: Test Everything**

**Time:** 5 minutes

We'll verify:
- ✅ Database connection works
- ✅ All tables created successfully
- ✅ Can create/read/update/delete data
- ✅ Migrations completed without errors

---

## 🎯 What You'll Have After This Step

✅ **Production PostgreSQL database** on Supabase  
✅ **All tables created** and ready  
✅ **API connected** to PostgreSQL  
✅ **Automatic backups** enabled  
✅ **Web dashboard** to view/manage data  

---

## 📝 Information I'll Need From You

When you're ready, provide:

1. ✅ Supabase account created? (yes/no)
2. ✅ Project created? (yes/no)
3. ✅ Database password saved? (yes/no)
4. ✅ Connection string copied? (yes/no)

Then share the connection string with me (or tell me you have it ready).

**Don't worry - I'll guide you through each step!**

---

## ⚠️ Important Security Notes

1. **Never share your database password publicly**
2. **Keep your connection string secret**
3. **Don't commit credentials to Git**
4. **Use environment variables only**

I'll help you handle credentials securely.

---

## 🆘 Common Issues & Solutions

### Issue: "Can't create organization"
**Solution:** Refresh the page, try again, or use a different email

### Issue: "Project creation taking too long"
**Solution:** Normal for first project, can take 3-5 minutes

### Issue: "Lost my database password"
**Solution:** You can reset it in Settings → Database → Reset Database Password

### Issue: "Connection string not working"
**Solution:** Make sure you replaced `[YOUR-PASSWORD]` with your actual password

---

## 🎬 Ready to Start?

**Just tell me when you're ready to begin!**

Options:
- **"Start now"** - I'll walk you through each step
- **"I have questions"** - Ask me anything first
- **"Skip for now"** - We can move to another issue

What would you like to do? 🚀

---

**Progress Tracker:**
```
[ ] Step 1: Create Supabase Account
[ ] Step 2: Create Database Project  
[ ] Step 3: Get Connection String
[ ] Step 4: Save Credentials
[ ] Step 5: Configure API
[ ] Step 6: Run Migrations
[ ] Step 7: Seed Data (Optional)
[ ] Step 8: Test Everything
```

Let me know when you want to start! 🎯

