# 🗄️ Database Migration Instructions

## ✅ **Run This Migration on Supabase**

---

## 📋 **Step-by-Step Guide**

### **STEP 1: Open Supabase Dashboard**

1. Go to: https://supabase.com/dashboard
2. Login with your account
3. Select your project (StudySpot)

---

### **STEP 2: Open SQL Editor**

1. Click **"SQL Editor"** in the left sidebar
2. Click **"+ New Query"** button (top right)

---

### **STEP 3: Copy Migration SQL**

**Option A: From Notepad (Easiest)**
- I just opened the file in Notepad for you
- Press `Ctrl+A` to select all
- Press `Ctrl+C` to copy

**Option B: From File**
1. Open: `C:\Users\insti\OneDrive\Desktop\om\api\migrations\004_create_payments_table.sql`
2. Select all content (`Ctrl+A`)
3. Copy (`Ctrl+C`)

---

### **STEP 4: Paste & Run in Supabase**

1. **Paste** the SQL into Supabase editor (`Ctrl+V`)
2. **Click "Run"** button (or press `Ctrl+Enter`)
3. **Wait** ~10 seconds for execution

---

### **STEP 5: Verify Success** ✅

#### **A. Check Success Message**
You should see:
```
✅ Success. No rows returned
```

#### **B. Verify Tables Created**
1. Click **"Table Editor"** in left sidebar
2. You should see **2 new tables**:
   - ✅ `payments`
   - ✅ `payment_verification_queue`

#### **C. Check Sample Data**
1. Click on `payments` table
2. You should see **3 sample payments**
3. Click on `payment_verification_queue` table
4. You should see **2 queue entries**

---

## 📊 **What This Migration Creates**

### **Table 1: `payments`**
Stores all payment transactions with staff confirmation.

**Key Fields:**
- `id` - UUID primary key
- `student_name` - Student name
- `amount` - Payment amount
- `payment_method` - Method (cash/cheque/etc)
- `payment_status` - Status (pending/completed/failed)
- **`received_by`** - Staff member name (NEW)
- **`staff_confirmation`** - Confirmation flag (NEW)
- **`staff_id`** - Staff user ID (NEW)
- `invoice_number` - Auto-generated (INV-20251023-000001)
- `is_verified` - Verification status
- `verified_by` - Admin who verified
- Timestamps and more

**Indexes:** 12 optimized indexes for fast queries

**Sample Data:** 3 test payments inserted

---

### **Table 2: `payment_verification_queue`**
Manages admin verification workflow.

**Key Fields:**
- `id` - UUID primary key
- `payment_id` - Links to payments table
- `verification_status` - Status (pending/approved/rejected)
- `priority` - Priority level
- `submitted_by` - Staff name who submitted
- `submitted_at` - Submission timestamp
- `due_date` - SLA due date
- **`is_overdue`** - Auto-calculated flag (COMPUTED)
- `verified_by` - Admin who verified
- `verified_at` - Verification timestamp

**Indexes:** 6 optimized indexes

**Sample Data:** 2 queue entries for pending payments

---

## 🔍 **Verification Queries**

After running the migration, verify with these queries:

### **Check Tables Exist**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('payments', 'payment_verification_queue');
```
**Expected:** 2 rows

---

### **Check Sample Payments**
```sql
SELECT 
  invoice_number,
  student_name,
  amount,
  payment_method,
  received_by,
  staff_confirmation
FROM payments 
ORDER BY created_at DESC;
```
**Expected:** 3 payments with staff names

---

### **Check Verification Queue**
```sql
SELECT 
  verification_status,
  priority,
  submitted_by,
  is_overdue,
  due_date
FROM payment_verification_queue
ORDER BY priority DESC;
```
**Expected:** 2 pending verifications

---

## ⚠️ **Troubleshooting**

### **Error: "relation already exists"**
**Cause:** Tables already created  
**Solution:** 
- Option A: Skip migration (already done)
- Option B: Drop and recreate:
  ```sql
  DROP TABLE IF EXISTS payment_verification_queue CASCADE;
  DROP TABLE IF EXISTS payments CASCADE;
  -- Then run full migration again
  ```

---

### **Error: "permission denied"**
**Cause:** Insufficient database permissions  
**Solution:** 
- Use Supabase dashboard SQL Editor (has full permissions)
- Or contact Supabase support for admin access

---

### **Error: "syntax error"**
**Cause:** Incomplete SQL copied  
**Solution:** 
- Make sure you copied the ENTIRE file
- Check for missing lines at start/end
- Re-copy and paste

---

## ✅ **Success Checklist**

After migration completes:

- [ ] ✅ "Success" message shown
- [ ] ✅ `payments` table exists
- [ ] ✅ `payment_verification_queue` table exists
- [ ] ✅ 3 sample payments in `payments` table
- [ ] ✅ 2 entries in `payment_verification_queue` table
- [ ] ✅ Invoice numbers auto-generated (INV-20251023-000001)
- [ ] ✅ No errors in Supabase console

---

## 📊 **Expected Results**

### **Payments Table Count**
```sql
SELECT COUNT(*) as payment_count, SUM(amount) as total_amount
FROM payments;
```
**Expected:** 3 payments, ₹15,500 total

### **Queue Count**
```sql
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN verification_status = 'pending' THEN 1 ELSE 0 END) as pending
FROM payment_verification_queue;
```
**Expected:** 2 total, 2 pending

---

## ⏱️ **Time Required**

- **Copy SQL:** ~1 minute
- **Paste & Run:** ~30 seconds
- **Verification:** ~1 minute
- **Total:** ~3 minutes

---

## 🎯 **After Migration**

Once migration is complete:

1. ✅ **Backend API will work** - Payment endpoints active
2. ✅ **Frontend will connect** - No database errors
3. ✅ **Features will function** - Staff confirmation, verification queue
4. ✅ **Ready for testing** - Test all payment workflows

---

## 📞 **Need Help?**

If you encounter any issues:

1. Check Supabase error message
2. Verify SQL was copied completely
3. Check database permissions
4. Try in a fresh SQL query window

---

## 🚀 **Next Steps After Migration**

1. ✅ Migration complete
2. Test payment features locally
3. Deploy to production
4. Test in production environment
5. Train staff on new workflow

---

**File Location:**  
`C:\Users\insti\OneDrive\Desktop\om\api\migrations\004_create_payments_table.sql`

**Supabase Dashboard:**  
https://supabase.com/dashboard

---

**Good luck with the migration!** 🎉

