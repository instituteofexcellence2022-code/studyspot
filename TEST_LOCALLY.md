# 🧪 Local Testing Guide

## 🚀 Quick Start

### Step 1: Start the API Server

**Terminal 1:**
```bash
cd api
npm start
```

**Expected Output:**
```
✅ Connected to PostgreSQL database
✅ Redis client connected
🚀 Server running on port 3001
```

---

### Step 2: Start the Owner Portal

**Terminal 2:**
```bash
cd web-owner
npm start
```

**Expected Output:**
```
Compiled successfully!
You can now view web-owner in the browser.
  Local: http://localhost:3000
```

---

## 🎯 What to Test

### 1. **Light/Dark Mode Toggle** 🌓
**Location:** Sidebar (bottom, above Logout)

**Test:**
1. Open http://localhost:3000
2. Login (or click "Skip Login")
3. Look at the sidebar
4. Click the **"Light Mode"** or **"Dark Mode"** button
5. ✅ Theme should instantly switch
6. ✅ Reload page - theme should persist

**Indicators:**
- Light mode: ☀️ Sun icon
- Dark mode: 🌙 Moon icon

---

### 2. **Student Management** (Advanced)
**Location:** Sidebar → Students

**Test Features:**
✅ **Add Student:**
1. Click "Add Student" button
2. Go through 4-step wizard:
   - Step 1: Personal Info (name, DOB, gender, blood group)
   - Step 2: Contact Details (email, phone, address, guardian)
   - Step 3: Fee & Plan (plan selection, fee status)
   - Step 4: KYC & Extras (groups, tags, notes, documents)
3. Review and create

✅ **Bulk Import:**
1. Click "Bulk Import" button
2. Upload CSV/Excel file (or use demo preview)
3. Preview students
4. Import all

✅ **Advanced Search:**
1. Search by name, email, phone, ID
2. Filter by:
   - Status (active, inactive, suspended, graduated)
   - Fee Status (paid, pending, overdue)
   - KYC (verified, pending)
3. Clear filters

✅ **View Student Details:**
1. Click "View" on any student card
2. See full profile with tabs:
   - Personal info
   - Attendance
   - Payments
   - History

✅ **KYC Verification:**
1. Click 3-dot menu → "Verify KYC"
2. Review documents
3. Check verification items
4. Approve KYC

✅ **Generate ID Cards:**
1. Select students (checkboxes)
2. Click "Generate ID Cards (X)"
3. Choose template (Standard/Premium/Custom)
4. Toggle options (QR Code, Photo, Barcode)
5. Generate

✅ **Export:**
1. Click "Export All" button
2. Download CSV file

---

### 3. **Fee Plan Management** (Advanced)
**Location:** Sidebar → Fee Plans

**Test Features:**
✅ **View Plans:**
1. See 5 demo plans in compact cards
2. Notice 4 cards per row on desktop
3. Smaller, more compact design
4. All info visible

✅ **Stats Dashboard:**
- Total Plans: 5
- Active Plans: 5
- With Discounts: 4
- Pricing Rules: 2 active

✅ **Create New Plan:**
1. Click "Create New Plan"
2. Step 1: Basic Info
   - Name, description, type, base price
   - Toggles (Popular, Scholarship, Waiver)
3. Step 2: Pricing Structure
   - Enable Shift Pricing (Morning, Afternoon, Evening, Night)
   - Enable Zone Pricing (AC, Non-AC, Premium, Quiet, General)
4. Step 3: Discounts & Offers
   - Enable discount (Percentage or Fixed)
   - Set validity dates
   - Add features
5. Step 4: Review
   - See summary
   - Create plan

✅ **View Plan Details:**
1. Click "View" on any plan card
2. See all details

✅ **Edit Plan:**
1. Click "Edit" on any plan card
2. Modify any fields
3. Update

✅ **Pricing Rules:**
1. Click "Pricing Rules" button
2. See 4 demo rules (Seasonal, Bulk, Referral, Early Bird)
3. View accordion interface
4. Toggle active/inactive

✅ **Scholarships & Waivers:**
1. Click "Scholarships" button
2. Configure scholarship percentage
3. Set eligibility criteria
4. Select eligible plans

✅ **Pro-Rata Calculator:**
1. Right-click menu → "Upgrade/Downgrade"
2. Enter old/new prices
3. Enter remaining/total days
4. See adjustment calculation

✅ **Search & Filter:**
- Search by name/description
- Filter by Type (Hourly, Daily, Weekly, etc.)
- Filter by Status (Active, Inactive, Draft)

---

### 4. **Responsive Design** 📱

**Test on Different Sizes:**

✅ **Desktop (1920px):**
- 4 fee plan cards per row
- 4 stats cards
- Full sidebar visible

✅ **Laptop (1280px):**
- 3 fee plan cards per row
- 4 stats cards (2x2)
- Full sidebar

✅ **Tablet (768px):**
- 2 fee plan cards per row
- 2 stats cards per row
- Collapsible sidebar

✅ **Mobile (375px):**
- 1 fee plan card per row
- 2 stats cards per row (smaller)
- Hamburger menu
- All buttons stack vertically

**How to Test:**
- Chrome DevTools → Toggle Device Toolbar (Ctrl+Shift+M)
- Try different devices: iPhone, iPad, Desktop

---

### 5. **Dashboard** (Enhanced)
**Location:** Sidebar → Dashboard

**Test:**
✅ 8 stat cards (Libraries, Seats, Students, etc.)
✅ Quick action buttons (all clickable)
✅ Alerts section
✅ Performance metrics
✅ Recent activity
✅ Auto-refresh toggle
✅ Last updated timestamp

---

### 6. **Profile & Settings**

**Profile Page:**
✅ 3 tabs (Personal, Account, Security)
✅ Edit mode toggle
✅ Avatar upload
✅ Change password dialog
✅ 2FA setup

**Settings Page:**
✅ 4 tabs (Notifications, Appearance, Security, Business)
✅ **Theme toggle (Light/Dark)**
✅ Various configuration options
✅ Save/Reset buttons

---

## 🎨 Theme Testing

### Light Mode
- Background: Light gray (#f5f5f5)
- Cards: White (#ffffff)
- Text: Dark
- Shadows: Subtle

### Dark Mode
- Background: Almost black (#121212)
- Cards: Dark gray (#1e1e1e)
- Text: Light
- Shadows: More prominent

### Check:
✅ All cards have proper background
✅ Text is readable in both modes
✅ Icons have proper opacity
✅ Hover effects work
✅ Borders visible
✅ Chips have proper colors

---

## 📊 Performance Testing

### Page Load
- Initial load should be < 2 seconds
- Theme switch should be instant
- Navigation should be smooth

### Interactions
- Form dialogs open quickly
- Search/filter real-time updates
- Hover effects smooth (0.2s transition)
- No lag when scrolling

---

## 🐛 Common Issues & Fixes

### Issue: "Cannot connect to server"
**Fix:**
```bash
# Make sure API is running
cd api
npm start
```

### Issue: "Port 3000 already in use"
**Fix:**
```bash
# Kill the process on port 3000
npx kill-port 3000
# Then restart
npm start
```

### Issue: "Theme not switching"
**Fix:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+Shift+R)
3. Or use incognito mode

### Issue: "Cards not showing"
**Fix:**
1. Check browser console (F12)
2. Look for errors
3. Refresh the page

---

## ✅ Testing Checklist

### Student Management
- [ ] Add student (4-step form)
- [ ] Bulk import preview
- [ ] Search students
- [ ] Filter by status
- [ ] Filter by fee status
- [ ] View student details
- [ ] Edit student
- [ ] KYC verification
- [ ] Generate ID cards
- [ ] Export to CSV
- [ ] Lifecycle tracking (New, Active, etc.)

### Fee Plan Management
- [ ] View compact cards
- [ ] Create new plan (4 steps)
- [ ] Edit plan
- [ ] View plan details
- [ ] Duplicate plan
- [ ] Delete plan
- [ ] Pricing rules management
- [ ] Scholarships settings
- [ ] Pro-rata calculator
- [ ] Search plans
- [ ] Filter by type
- [ ] Filter by status

### Theme & Responsiveness
- [ ] Light/Dark toggle works
- [ ] Theme persists on reload
- [ ] Desktop view (4 cards)
- [ ] Tablet view (2-3 cards)
- [ ] Mobile view (1 card)
- [ ] All breakpoints smooth
- [ ] Colors correct in both modes
- [ ] Text readable everywhere

### Navigation
- [ ] Sidebar opens/closes
- [ ] All menu items work
- [ ] Dashboard loads
- [ ] Profile page works
- [ ] Settings page works
- [ ] Logout works

---

## 🎉 Expected Results

After testing, you should see:
✅ Fully functional Student Management
✅ Complete Fee Plan system
✅ Smooth Light/Dark mode switching
✅ Perfect responsive design
✅ Professional, production-ready UI
✅ No console errors
✅ Fast, smooth interactions

---

## 📸 Screenshots to Take (Optional)

1. Dashboard - Light Mode
2. Dashboard - Dark Mode
3. Student List - Desktop
4. Student Form - All 4 steps
5. Fee Plans - Compact cards (4 per row)
6. Fee Plan Form - All 4 steps
7. Mobile view - All pages
8. Theme toggle button in sidebar

---

## 🚀 Next Steps After Testing

1. If all tests pass → Push to GitHub
2. If issues found → Report them
3. Deploy to Vercel (after quota reset)
4. Continue with more features

---

**Happy Testing! 🎉**

