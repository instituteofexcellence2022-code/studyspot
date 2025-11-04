# 🚀 Messaging & Groups - Quick Start Guide

## ⚡ **Get Everything Working in 20 Minutes**

Follow these steps to enable all messaging and group features!

---

## 📋 **Step 1: Database Setup (5 minutes)**

### **Run in Supabase SQL Editor:**

```sql
-- 1. Add privacy columns to community_members
ALTER TABLE community_members 
ADD COLUMN IF NOT EXISTS privacy_enabled BOOLEAN DEFAULT FALSE;

ALTER TABLE community_members 
ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE;

ALTER TABLE community_members 
ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMP;

ALTER TABLE community_members 
ADD COLUMN IF NOT EXISTS block_reason TEXT;

ALTER TABLE community_members 
ADD COLUMN IF NOT EXISTS added_by VARCHAR(255);

ALTER TABLE community_members 
ADD COLUMN IF NOT EXISTS joined_via VARCHAR(50) DEFAULT 'manual';

-- 2. Add display name to community_messages
ALTER TABLE community_messages 
ADD COLUMN IF NOT EXISTS display_name VARCHAR(255);

ALTER TABLE community_messages 
ADD COLUMN IF NOT EXISTS privacy_enabled BOOLEAN DEFAULT FALSE;

-- 3. Create community_invites table
CREATE TABLE IF NOT EXISTS community_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL,
  invite_code VARCHAR(100) UNIQUE NOT NULL,
  expires_at TIMESTAMP,
  usage_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(255),
  
  FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE
);

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS idx_community_members_privacy 
ON community_members(community_id, user_id, privacy_enabled);

CREATE INDEX IF NOT EXISTS idx_invites_code 
ON community_invites(invite_code);

CREATE INDEX IF NOT EXISTS idx_invites_active 
ON community_invites(is_active, expires_at);
```

**Result:** ✅ Database schema ready

---

## 📦 **Step 2: Supabase Storage (2 minutes)**

### **Create File Storage Bucket:**

1. Go to **Supabase Dashboard** → **Storage**
2. Click **"Create Bucket"**
3. Name: `studyspot-files`
4. Set to **Public** (allow read access)
5. File size limit: **10MB**
6. Click **Create**

**Result:** ✅ File uploads enabled

---

## 🖥️ **Step 3: Start Backend Services (2 minutes)**

### **Terminal 1: Message Service**
```bash
cd backend
npm run start:message
```

**Expected Output:**
```
[INFO] 💬 Message Service is running on port 3010
```

### **Terminal 2: Community Service**
```bash
cd backend
npm run start:community
```

**Expected Output:**
```
[INFO] 👥 Community Service is running on port 3011
```

### **Terminal 3: API Gateway (if not already running)**
```bash
cd backend
npm start
```

**Expected Output:**
```
[INFO] 🚀 API Gateway is running on port 3001
```

**Result:** ✅ All services running

---

## ✅ **Step 4: Verify Setup (3 minutes)**

### **Health Checks:**

```bash
# Message Service
curl http://localhost:3010/health
# Should return: {"status":"ok","service":"message-service"}

# Community Service
curl http://localhost:3011/health
# Should return: {"status":"ok","service":"community-service"}

# API Gateway
curl http://localhost:3001/health
# Should return: {"status":"ok","service":"api-gateway"}
```

### **Test Endpoints:**

```bash
# Test student search (via API Gateway)
curl "http://localhost:3001/api/students/search?libraryId=1&q=test"

# Test communities fetch
curl "http://localhost:3001/api/communities/all?userId=student-001"
```

**Result:** ✅ All endpoints responding

---

## 🧪 **Step 5: Test Key Features (8 minutes)**

### **Test 1: Student Messages Owner (2 min)**
```
1. Open Student Portal → Library Details
2. Click "Message Owner" button
3. Type: "Is the library open today?"
4. Click Send
5. Check Owner Portal → Messages
6. Should see message with student name
7. Click Reply → Type response → Send
8. Check Student Portal → Messages
9. Should see owner's reply
```

### **Test 2: Create Library Group (1 min)**
```
1. Open Owner Portal → Library Groups
2. Click "Create Group"
3. Name: "Test Study Group"
4. Description: "For testing"
5. Don't toggle privacy (info alert shown)
6. Click Create
7. Group appears in list
```

### **Test 3: Add Customer to Group (2 min)**
```
1. Click "Manage Members" on group
2. Click "Add Student"
3. See alert: "Only Your Customers"
4. Search for a student name
5. If customer appears → Click Add
6. If non-customer → Nothing shows
7. Member added successfully
```

### **Test 4: Student Joins Group (1 min)**
```
1. Open Student Portal → Community → Library Groups tab
2. See alert showing booking status
3. If customer: See group → Click Join → Success
4. If not customer: No groups visible
5. Group appears in "My Communities" tab
```

### **Test 5: Privacy Mode (1 min)**
```
1. Student opens group chat
2. See privacy badge: [👤 Public]
3. Click badge
4. See toast (green or yellow depending on backend)
5. Badge changes to: [🔒 Private]
6. Future messages show as "Student X"
```

### **Test 6: File Sharing (1 min)**
```
1. In group chat, click attachment icon
2. Select an image or PDF
3. File uploads (loading indicator)
4. File appears in chat
5. Other members see file (if backend connected)
6. Click download/preview
```

**Result:** ✅ All features working

---

## 🐛 **Troubleshooting**

### **"Cannot connect to server"**
**Fix:** Start the backend services (Step 3)

### **"Privacy feature not available"**
**Fix:** Run database SQL (Step 1)

### **"Failed to upload file"**
**Fix:** Create Supabase storage bucket (Step 2)

### **"No students found"**
**Fix:** Make sure student has booking records in database

### **"404 Not Found" for /api/students/search**
**Fix:** Restart API Gateway after latest changes

---

## 📱 **Access URLs**

### **Local Development:**
```
API Gateway:      http://localhost:3001
Message Service:  http://localhost:3010
Community Service: http://localhost:3011

Student Portal:   http://localhost:5173
Owner Portal:     http://localhost:3000
```

### **Pages to Test:**
```
Student Portal:
- http://localhost:5173/messages
- http://localhost:5173/community

Owner Portal:
- http://localhost:3000/messages
- http://localhost:3000/groups
```

---

## ✅ **Success Indicators**

### **You'll know it's working when:**
1. ✅ No console errors in browser (F12)
2. ✅ Backend services show no errors in terminal
3. ✅ Health checks return 200 OK
4. ✅ Student can send message to owner
5. ✅ Owner can create group
6. ✅ Student can join group (if customer)
7. ✅ Privacy toggle works (green or yellow toast)
8. ✅ Files upload successfully
9. ✅ Real-time updates work (if WebSocket connected)

---

## 🎯 **Complete Feature Test Script**

Copy and run this test sequence:

```
✅ Test 1: Send Message
   Student → Library Details → Message Owner → Send
   Owner → Messages → See inquiry → Reply

✅ Test 2: Create Group  
   Owner → Groups → Create → Fill form → Create

✅ Test 3: Add Member
   Owner → Manage Members → Add Student → Search → Add

✅ Test 4: Join Group
   Student → Community → Library Groups → Join

✅ Test 5: Privacy Mode
   Student → Open chat → Click privacy badge → Toggle

✅ Test 6: Send Chat Message
   Student → Type message → Send → See in chat

✅ Test 7: Upload File
   Student → Click attach → Select file → Upload

✅ Test 8: Block User
   Owner → Manage Members → 3-dot → Block → Enter reason

✅ Test 9: Generate Invite
   Owner → Invite → Set expiry → Generate → Copy

✅ Test 10: Real-Time
   Student A sends → Student B sees instantly
```

---

## 📊 **What You Get**

After completing setup:

### **Students Can:**
- ✅ Message library owners
- ✅ Join exam communities (any)
- ✅ Join library groups (if customer)
- ✅ Chat in real-time
- ✅ Share files
- ✅ Toggle privacy (anonymous mode)
- ✅ See only eligible groups

### **Owners Can:**
- ✅ Receive student inquiries
- ✅ Reply to messages
- ✅ Create library groups
- ✅ Add customers to groups
- ✅ Manage members (remove, block)
- ✅ Promote admins
- ✅ Generate invite links
- ✅ See all member details

---

## 🎉 **YOU'RE DONE!**

**After following these steps:**
- ✅ All 33 API endpoints working
- ✅ All 4 UI pages functional
- ✅ Real-time messaging enabled
- ✅ File sharing active
- ✅ Privacy protection working
- ✅ Customer-only security enforced

**The entire messaging and group system is LIVE!** 🚀

---

## 🆘 **Need Help?**

**Check these files for details:**
- `COMPLETE_MESSAGING_GROUPS_VERIFICATION.md` - Full feature list
- `COMMUNITIES_VS_GROUPS_RULES.md` - Access rules explained
- `CUSTOMER_ONLY_GROUPS_COMPLETE.md` - Security implementation
- `PRIVACY_MODE_SETUP_REQUIRED.md` - Privacy mode setup
- `GROUP_MEMBER_MANAGEMENT_COMPLETE.md` - Member management

**Or check console logs:**
- Browser Console (F12) - Frontend errors
- Terminal - Backend errors
- Network tab - API call failures

---

*Quick Start Guide - November 4, 2025*  
*Get live in 20 minutes!* ⚡

