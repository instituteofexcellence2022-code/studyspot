# 🚀 Database Migration - Quick Guide

## ⚡ **Run This Migration on Supabase**

### **Option 1: Supabase Dashboard (Easiest)**

1. **Go to Supabase**:
   - Navigate to: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**:
   - Click "SQL Editor" in the left sidebar
   - Click "+ New Query"

3. **Paste the Migration**:
   - Open file: `api/migrations/004_create_payments_table.sql`
   - Copy ALL contents (entire file)
   - Paste into SQL Editor

4. **Run Migration**:
   - Click "Run" button (or press `Ctrl+Enter`)
   - Wait for completion (~5-10 seconds)

5. **Verify Success**:
   - You should see: "Success. No rows returned"
   - Check "Table Editor" in sidebar
   - You should see new tables:
     - ✅ `payments`
     - ✅ `payment_verification_queue`

---

### **Option 2: Command Line (Advanced)**

```bash
# Connect to Supabase PostgreSQL
psql "postgresql://postgres.zgrgryufcxgjbmpjiwbh:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"

# Run migration file
\i api/migrations/004_create_payments_table.sql

# Verify tables
\dt

# Check sample data
SELECT * FROM payments;
SELECT * FROM payment_verification_queue;

# Exit
\q
```

---

## ✅ **Verification Checklist**

After running the migration, verify:

### **1. Tables Created**
```sql
-- Run this in SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('payments', 'payment_verification_queue');
```

Expected: 2 rows returned

### **2. Sample Data Inserted**
```sql
-- Run this in SQL Editor
SELECT 
  COUNT(*) as payment_count,
  SUM(amount) as total_amount
FROM payments;
```

Expected: 3 payments, total ₹15,500

### **3. Verification Queue Created**
```sql
-- Run this in SQL Editor
SELECT 
  COUNT(*) as queue_count,
  SUM(CASE WHEN verification_status = 'pending' THEN 1 ELSE 0 END) as pending_count
FROM payment_verification_queue;
```

Expected: 2 in queue, 2 pending

### **4. Invoice Numbers Generated**
```sql
-- Run this in SQL Editor
SELECT invoice_number, student_name, amount 
FROM payments 
ORDER BY created_at DESC;
```

Expected: All payments have invoice numbers like `INV-20251023-000001`

---

## 🔧 **Troubleshooting**

### **Error: "relation already exists"**
The tables already exist. Options:
- **Option A**: Skip migration (tables already created)
- **Option B**: Drop and recreate:
  ```sql
  DROP TABLE IF EXISTS payment_verification_queue CASCADE;
  DROP TABLE IF EXISTS payments CASCADE;
  -- Then run full migration again
  ```

### **Error: "permission denied"**
You need database admin access. Contact Supabase support or use the dashboard SQL Editor.

### **Error: "syntax error"**
Make sure you copied the ENTIRE migration file, including all comments and statements.

---

## 📊 **Expected Database Structure**

After successful migration:

```
┌─────────────────────────────────────────┐
│  payments (10+ columns)                 │
│  ✓ id, tenant_id, student_name          │
│  ✓ amount, payment_method, status       │
│  ✓ received_by, staff_confirmation      │ ← NEW
│  ✓ invoice_number (auto-generated)      │
│  ✓ is_verified, verified_by             │
│  ✓ Sample data: 3 payments              │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  payment_verification_queue (12 cols)   │
│  ✓ id, payment_id, status               │
│  ✓ priority, submitted_by, due_date     │
│  ✓ is_overdue (auto-calculated)         │
│  ✓ Sample data: 2 queue entries         │
└─────────────────────────────────────────┘
```

---

## ⏱️ **Time Required**

- **Migration**: ~10 seconds
- **Verification**: ~2 minutes
- **Total**: ~3 minutes

---

## 🎯 **Next Steps After Migration**

1. ✅ Verify tables exist
2. ✅ Check sample data
3. ✅ Test API endpoints (see `BACKEND_IMPLEMENTATION_GUIDE.md`)
4. ✅ Connect frontend
5. 🚀 Test full workflow

---

**Ready to run the migration? Follow Option 1 above!** 🚀

