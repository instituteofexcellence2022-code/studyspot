# 🔧 Privacy Mode Setup Required

## ⚠️ **Error: "Failed to update privacy setting"**

If you're seeing this error, it means the **database tables need to be updated** with privacy mode columns.

---

## 📋 **Required Database Updates**

Run these SQL commands in your **Supabase SQL Editor**:

### **1. Update `community_members` table:**
```sql
-- Add privacy_enabled column to track each student's privacy choice
ALTER TABLE community_members 
ADD COLUMN IF NOT EXISTS privacy_enabled BOOLEAN DEFAULT FALSE;

-- Add metadata columns
ALTER TABLE community_members 
ADD COLUMN IF NOT EXISTS added_by VARCHAR(255);

ALTER TABLE community_members 
ADD COLUMN IF NOT EXISTS joined_via VARCHAR(50) DEFAULT 'manual';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_community_members_privacy 
ON community_members(community_id, user_id, privacy_enabled);
```

### **2. Update `community_messages` table:**
```sql
-- Add display_name to store anonymous or real name
ALTER TABLE community_messages 
ADD COLUMN IF NOT EXISTS display_name VARCHAR(255);

-- Add privacy_enabled flag to track sender's choice at time of message
ALTER TABLE community_messages 
ADD COLUMN IF NOT EXISTS privacy_enabled BOOLEAN DEFAULT FALSE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_community_messages_privacy 
ON community_messages(community_id, privacy_enabled);
```

### **3. Create `community_invites` table (if not exists):**
```sql
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_invites_code 
ON community_invites(invite_code);

CREATE INDEX IF NOT EXISTS idx_invites_community 
ON community_invites(community_id);

CREATE INDEX IF NOT EXISTS idx_invites_active 
ON community_invites(is_active, expires_at);
```

---

## 🚀 **Start Community Service**

Make sure the **community service** is running:

### **Option 1: Start via npm**
```bash
cd backend
npm run start:community
```

### **Option 2: Start via ts-node**
```bash
cd backend
npx ts-node src/services/community-service/index.ts
```

### **Expected Output:**
```
[INFO] 👥 Community Service is running on port 3011
[INFO] Connected to Supabase
[INFO] Socket.IO integration enabled
```

---

## 🔍 **Verify Setup**

### **1. Check Database:**
Open Supabase → Table Editor → Verify:
- ✅ `community_members` has `privacy_enabled` column
- ✅ `community_messages` has `display_name` and `privacy_enabled` columns
- ✅ `community_invites` table exists

### **2. Check Community Service:**
Visit: `http://localhost:3011/health`

Should return:
```json
{
  "status": "ok",
  "service": "community-service",
  "timestamp": "2025-11-04T..."
}
```

### **3. Test Privacy Endpoint:**
```bash
curl -X GET http://localhost:3011/api/communities/test-id/privacy/student-001
```

Should return:
```json
{
  "success": true,
  "privacyEnabled": false
}
```

---

## 🐛 **Troubleshooting**

### **Error: "Cannot connect to server"**
**Solution:** Start the community service:
```bash
npm run start:community
```

### **Error: "Server error. Database might need to be updated"**
**Solution:** Run the SQL commands above in Supabase

### **Error: "Privacy feature not available yet"**
**Solution:** 
1. Check if community service is running (port 3011)
2. Check API Gateway is routing `/api/communities/*` to port 3011
3. Verify Supabase connection in community service

### **Error: "column 'privacy_enabled' does not exist"**
**Solution:** Run this SQL:
```sql
ALTER TABLE community_members ADD COLUMN privacy_enabled BOOLEAN DEFAULT FALSE;
```

---

## 📊 **Check Console Logs**

Open **Browser Developer Console** (F12) when toggling privacy:

**Expected Logs:**
```
🔄 Toggling privacy to: true
📍 API URL: http://localhost:3001/api/communities/group-1/privacy
✅ Privacy updated: {success: true, message: "Privacy enabled", ...}
```

**Error Logs:**
```
❌ Error toggling privacy: {error: "..."}
Full error: {...}
```

Share these logs for debugging!

---

## ✅ **Verification Checklist**

Before using privacy mode, verify:

- [ ] Database schema updated (3 SQL commands run)
- [ ] Community service running (port 3011)
- [ ] API Gateway routing correctly
- [ ] Supabase connection working
- [ ] No console errors when opening group chat
- [ ] Privacy toggle visible in group chat header
- [ ] Clicking toggle shows specific error (not generic)

---

## 🔗 **Environment Variables**

Make sure your `.env` has:

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Community Service
COMMUNITY_SERVICE_PORT=3011
COMMUNITY_SERVICE_URL=http://localhost:3011

# API Gateway
PORT=3001
```

---

## 📞 **Still Not Working?**

1. **Check browser console** for detailed error logs
2. **Check community service logs** in terminal
3. **Verify API Gateway logs** for routing issues
4. **Test direct endpoint**: `curl http://localhost:3011/health`
5. **Verify Supabase tables** have new columns

---

## 🎯 **Quick Fix Script**

Run this in your terminal:

```bash
# 1. Navigate to backend
cd backend

# 2. Start community service
npm run start:community &

# 3. Test health endpoint
curl http://localhost:3011/health

# 4. If healthy, test privacy endpoint
curl -X GET http://localhost:3011/api/communities/test-group/privacy/test-user

# 5. Check logs
# Look for "Community Service is running on port 3011"
```

---

**Once database is updated and service is running, privacy toggle will work!** ✅

