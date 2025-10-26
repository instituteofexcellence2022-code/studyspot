# 🎯 Database Migration - Step by Step Guide

## Follow Along With This Guide

---

## ✅ **STEP 1: Open Supabase Dashboard**

### What to Do:
1. Open your web browser
2. Go to: **https://supabase.com/dashboard**
3. Login with your credentials
4. You'll see a list of your projects

### What You'll See:
- Dashboard with project cards
- Your StudySpot project should be listed
- Click on your project to enter

### Screenshot Reference:
```
┌─────────────────────────────────────────┐
│  Supabase Dashboard                     │
├─────────────────────────────────────────┤
│  Your Organizations                     │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  StudySpot Project              │   │
│  │  [Click Here]                   │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## ✅ **STEP 2: Open SQL Editor**

### What to Do:
1. Look at the **left sidebar**
2. Find and click **"SQL Editor"** (icon: 📝)
3. At the top right, click **"+ New Query"** button

### What You'll See:
```
┌─────────────────────────────────────────┐
│  Left Sidebar:                          │
│  • Home                                 │
│  • Table Editor                         │
│  • SQL Editor  ← Click This!           │
│  • Database                             │
│  • Authentication                       │
└─────────────────────────────────────────┘
```

### After Clicking SQL Editor:
```
┌─────────────────────────────────────────┐
│  SQL Editor                             │
│  [+ New Query]  ← Click This!          │
│                                         │
│  Empty SQL editor will appear           │
└─────────────────────────────────────────┘
```

---

## ✅ **STEP 3: Copy Migration SQL**

### What to Do:

#### Option A: From Notepad (Already Open)
1. **Switch to Notepad** (I already opened it for you)
2. Press **`Ctrl + A`** (selects all text)
3. Press **`Ctrl + C`** (copies text)
4. You'll see all text highlighted

#### Option B: From File
1. Navigate to: `C:\Users\insti\OneDrive\Desktop\om\api\migrations\`
2. Open: `004_create_payments_table.sql`
3. Press `Ctrl + A` (select all)
4. Press `Ctrl + C` (copy)

### Verification:
- You should have ~600 lines of SQL code copied
- The SQL starts with: `-- =====================`
- The SQL ends with: `-- END OF MIGRATION`

---

## ✅ **STEP 4: Paste SQL in Supabase**

### What to Do:
1. **Click inside** the SQL Editor text area (white box)
2. Press **`Ctrl + V`** (paste)
3. You should see the entire SQL script appear

### What You'll See:
```
┌─────────────────────────────────────────┐
│  SQL Editor                             │
│  [Run]  [Format]  [Clear]              │
├─────────────────────────────────────────┤
│  -- ============================        │
│  -- Migration: Create Payments...      │
│  -- Version: 004                        │
│  -- ============================        │
│                                         │
│  DROP TABLE IF EXISTS ...               │
│  CREATE TABLE payments (                │
│    id UUID PRIMARY KEY ...              │
│  ...                                    │
│  (entire SQL script should be here)     │
└─────────────────────────────────────────┘
```

---

## ✅ **STEP 5: Run the Migration**

### What to Do:
1. Find the **"Run"** button (top left or top right of editor)
2. Click **"Run"** button
   - OR press **`Ctrl + Enter`**
3. **Wait ~10-15 seconds** for execution

### What You'll See:

#### While Running:
```
⏳ Running query...
```

#### On Success:
```
✅ Success. No rows returned
Time: 8.2s
```

#### On Error (if any):
```
❌ Error: [error message here]
Line: XX
```

---

## ✅ **STEP 6: Verify Tables Created**

### What to Do:
1. In the **left sidebar**, click **"Table Editor"**
2. Look at the list of tables
3. You should see **2 NEW tables**:
   - ✅ `payments`
   - ✅ `payment_verification_queue`

### What You'll See:
```
┌─────────────────────────────────────────┐
│  Table Editor                           │
├─────────────────────────────────────────┤
│  Tables:                                │
│  • users                                │
│  • libraries                            │
│  • payments  ← NEW!                    │
│  • payment_verification_queue  ← NEW!  │
│  • students                             │
│  • ...                                  │
└─────────────────────────────────────────┘
```

---

## ✅ **STEP 7: Check Sample Data**

### What to Do:
1. Click on **`payments`** table
2. You should see **3 sample rows**
3. Check the columns include:
   - `invoice_number` (like INV-20251023-000001)
   - `student_name`
   - `amount`
   - `received_by` ← NEW FIELD
   - `staff_confirmation` ← NEW FIELD

### Sample Data:
```
┌─────────────────────────────────────────────────────────────┐
│  payments table (3 rows)                                    │
├─────────────────────────────────────────────────────────────┤
│ invoice_number         student_name    amount  received_by  │
│ INV-20251023-000001   Rajesh Kumar    5000    Priya Sharma │
│ INV-20251023-000002   Anita Desai     7500    Amit Patel   │
│ INV-20251023-000003   Vikram Singh    3000    Neha Gupta   │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ **STEP 8: Verify Queue Table**

### What to Do:
1. Click on **`payment_verification_queue`** table
2. You should see **2 sample rows**
3. Check columns include:
   - `verification_status` (should be 'pending')
   - `submitted_by` (staff names)
   - `is_overdue` (should be false)
   - `due_date`

### Sample Data:
```
┌───────────────────────────────────────────────────────────┐
│  payment_verification_queue table (2 rows)               │
├───────────────────────────────────────────────────────────┤
│ verification_status  submitted_by   is_overdue  priority │
│ pending             Priya Sharma    false       1        │
│ pending             Amit Patel      false       1        │
└───────────────────────────────────────────────────────────┘
```

---

## 🎉 **SUCCESS!**

### You're Done When:
- [x] ✅ "Success" message shown
- [x] ✅ `payments` table exists with 3 rows
- [x] ✅ `payment_verification_queue` table exists with 2 rows
- [x] ✅ Invoice numbers auto-generated
- [x] ✅ No errors in console

---

## ⚠️ **Troubleshooting**

### Issue: "Table already exists"
**Solution:** Tables already created! Skip migration.

### Issue: "Permission denied"
**Solution:** Make sure you're using the SQL Editor in Supabase Dashboard (it has full permissions).

### Issue: "Syntax error at line XX"
**Solution:** 
- Make sure you copied the ENTIRE SQL file
- Check that nothing was cut off at the beginning or end
- Try copying again

### Issue: "No rows returned" but tables don't appear
**Solution:** 
- Refresh the Table Editor (click refresh icon)
- Or click away and back to Table Editor

---

## 📞 **Need Help?**

If stuck at any step:
1. Check the error message in Supabase
2. Make sure SQL was copied completely
3. Try refreshing the page and running again
4. Take a screenshot and let me know which step you're on

---

## ⏱️ **Time per Step**

- Step 1 (Dashboard): ~30 seconds
- Step 2 (SQL Editor): ~15 seconds
- Step 3 (Copy SQL): ~30 seconds
- Step 4 (Paste SQL): ~10 seconds
- Step 5 (Run): ~15 seconds (plus wait time)
- Step 6-8 (Verify): ~1 minute

**Total:** ~3-4 minutes

---

## 🎯 **After Completion**

1. Type **"done"** to let me know
2. We'll test the features locally
3. Then deploy to production

---

**Good luck!** 🚀

