# 🔍 How to Find Your Supabase Connection String

## Step-by-Step Guide (With Pictures in Mind)

---

## **STEP 1: Go to Supabase Dashboard**

1. Open your browser
2. Go to: **https://supabase.com/dashboard**
3. Log in if not already logged in
4. You should see a list of your projects

---

## **STEP 2: Select Your Project**

1. Click on your project (should be named something like "studyspot-production" or whatever you named it)
2. This opens your project dashboard

---

## **STEP 3: Navigate to Database Settings**

Look at the **LEFT SIDEBAR** - you'll see a menu. Click on the icons in this order:

1. At the bottom of the sidebar, click the **⚙️ Settings** icon (gear icon)
2. A submenu will appear on the left
3. In that submenu, click on **"Database"**

**Full path:** Settings → Database

---

## **STEP 4: Find Connection String Section**

1. On the Database page, **scroll down** (it's not at the top)
2. Look for a section titled **"Connection string"** or **"Connection pooling"**
3. You'll see several **TABS**:
   - URI
   - JDBC
   - .NET
   - Golang
   - etc.

---

## **STEP 5: Get the Connection String**

### **Option A: Connection Pooling (RECOMMENDED)** ✅

1. Look for **"Connection Pooling"** section
2. There's a dropdown that says **"Mode"** - select **"Transaction"**
3. Click the **"URI"** tab
4. You'll see a long string starting with `postgresql://`
5. Click the **copy icon** 📋 next to it

**Example of what you'll copy:**
```
postgresql://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### **Option B: Direct Connection** (Alternative)

1. Look for **"Connection string"** section (different from pooling)
2. Click the **"URI"** tab
3. Copy the string (starts with `postgresql://`)

**Example:**
```
postgresql://postgres:[YOUR-PASSWORD]@db.abcdefghijklmnop.supabase.co:5432/postgres
```

---

## **STEP 6: Replace the Password Placeholder**

The copied string will have `[YOUR-PASSWORD]` in it.

You need to replace it with your **actual database password**.

### **Don't Remember Your Password?**

If you don't know your database password, here's how to get it:

#### **Option 1: Reset Password** (Easiest)

1. Stay on the **Settings → Database** page
2. Scroll down to **"Database password"** section
3. Click **"Reset database password"**
4. A new password will be generated
5. **COPY AND SAVE IT IMMEDIATELY** (you only see it once!)
6. Now use this new password in your connection string

#### **Option 2: Check Your Records**

- Check your email (Supabase sends it when you create the project)
- Check your password manager
- Check any notes you made when creating the project

---

## **STEP 7: Final Connection String**

After replacing the password, your final string should look like:

```
postgresql://postgres.abcdefghijklmnop:MyActualPassword123@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Important:**
- ✅ No brackets `[]` around the password
- ✅ No spaces
- ✅ Just: `username:password@host:port/database`

---

## 🆘 Still Can't Find It?

### **Alternative Method: Use Supabase API Settings**

If you really can't find the connection string:

1. Go to **Settings** → **API** (instead of Database)
2. Look for **"Project URL"** - copy it
3. Look for **"Service role key"** - copy it
4. Tell me, and I'll help you configure it differently

---

## 📸 Visual Guide

Here's where to click (in order):

```
Supabase Dashboard
  └── Your Project (click)
        └── ⚙️ Settings (bottom left sidebar)
              └── Database (in left submenu)
                    └── Scroll down to "Connection string" or "Connection pooling"
                          └── Click "URI" tab
                                └── Click copy icon 📋
```

---

## ✅ Once You Have It

Just tell me:

**"I have the connection string"**

And then either:
- Share it with me (I'll add it to your config)
- Or tell me you want to add it manually (I'll give you instructions)

---

## 🎯 Quick Troubleshooting

### Can't see Settings icon?
- Look at the very bottom of the left sidebar
- It's a gear/cog icon ⚙️

### Can't see Database option?
- Make sure you clicked Settings first
- A new submenu should appear

### Don't see Connection string section?
- Try scrolling down on the page
- It's not at the top

### Page looks different?
- Supabase might have updated their UI
- Try searching for "connection" in the page (Ctrl+F)

---

**Let me know what you see or where you're stuck, and I'll help you further!** 🚀

