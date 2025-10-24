# ⚡ QUICK FILE COPY REFERENCE CARD

**Use this as a checklist while copying files**

---

## 📁 **WEB-OWNER PORTAL**

### **Copy FROM `/web/src/` TO `/web-owner/src/`:**

```
Source: C:\Users\insti\OneDrive\Desktop\om\web\src\
Target: C:\Users\insti\OneDrive\Desktop\om\web-owner\src\

FOLDERS TO COPY:
✅ components\           (entire folder)
✅ pages\                (entire folder)
✅ layouts\              (entire folder)
✅ services\             (entire folder)
✅ store\                (entire folder)
✅ hooks\                (entire folder)
✅ utils\                (entire folder)
✅ types\                (if exists)
✅ constants\            (entire folder)

FILES TO COPY:
✅ App.css
✅ reportWebVitals.ts
✅ setupTests.ts
✅ react-app-env.d.ts
```

### **Then DELETE from `/web-owner/src/`:**

```
FOLDERS TO DELETE:
❌ pages\admin\          (entire folder)
❌ pages\tenant\         (entire folder)
❌ components\admin\     (if exists)
```

---

## 📁 **WEB-ADMIN PORTAL**

### **Copy FROM `/web/src/` TO `/web-admin/src/`:**

```
Source: C:\Users\insti\OneDrive\Desktop\om\web\src\
Target: C:\Users\insti\OneDrive\Desktop\om\web-admin\src\

FOLDERS TO COPY:
✅ components\common\    (only common folder)
✅ components\admin\     (if exists)
✅ pages\auth\           (only auth folder)
✅ pages\admin\          (only admin folder)
✅ pages\tenant\         (only tenant folder)
✅ pages\common\         (only common folder)
✅ pages\dashboard\      (only dashboard folder)
✅ pages\profile\        (only profile folder)
✅ pages\subscription\   (only subscription folder - for plan management)
✅ pages\credits\        (only credits folder - for platform analytics)
✅ layouts\              (entire folder)
✅ services\             (entire folder)
✅ store\                (entire folder)
✅ hooks\                (entire folder)
✅ utils\                (entire folder)
✅ types\                (if exists)
✅ constants\            (entire folder)

FILES TO COPY:
✅ App.css
✅ reportWebVitals.ts
✅ setupTests.ts
✅ react-app-env.d.ts
```

### **Then DELETE from `/web-admin/src/`:**

```
FOLDERS TO DELETE:
❌ pages\library\        (if copied)
❌ pages\booking\        (if copied)
❌ pages\user\           (if copied)
❌ pages\ai\             (if copied - library-specific AI)
```

---

## ⚡ **COPY PASTE COMMANDS (PowerShell)**

### **For web-owner:**

```powershell
cd C:\Users\insti\OneDrive\Desktop\om

# Copy all source folders
Copy-Item web\src\components web-owner\src\ -Recurse -Force
Copy-Item web\src\pages web-owner\src\ -Recurse -Force
Copy-Item web\src\layouts web-owner\src\ -Recurse -Force
Copy-Item web\src\services web-owner\src\ -Recurse -Force
Copy-Item web\src\store web-owner\src\ -Recurse -Force
Copy-Item web\src\hooks web-owner\src\ -Recurse -Force
Copy-Item web\src\utils web-owner\src\ -Recurse -Force
Copy-Item web\src\constants web-owner\src\ -Recurse -Force

# Copy individual files
Copy-Item web\src\App.css web-owner\src\ -Force
Copy-Item web\src\reportWebVitals.ts web-owner\src\ -Force
Copy-Item web\src\setupTests.ts web-owner\src\ -Force
Copy-Item web\src\react-app-env.d.ts web-owner\src\ -Force

# Remove admin pages
Remove-Item web-owner\src\pages\admin -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item web-owner\src\pages\tenant -Recurse -Force -ErrorAction SilentlyContinue
```

### **For web-admin:**

```powershell
cd C:\Users\insti\OneDrive\Desktop\om

# Create src directories if needed
New-Item -ItemType Directory -Path web-admin\src\components -Force
New-Item -ItemType Directory -Path web-admin\src\pages -Force

# Copy selective folders
Copy-Item web\src\components\common web-admin\src\components\ -Recurse -Force
Copy-Item web\src\components\admin web-admin\src\components\ -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item web\src\pages\auth web-admin\src\pages\ -Recurse -Force
Copy-Item web\src\pages\admin web-admin\src\pages\ -Recurse -Force
Copy-Item web\src\pages\tenant web-admin\src\pages\ -Recurse -Force
Copy-Item web\src\pages\common web-admin\src\pages\ -Recurse -Force
Copy-Item web\src\pages\dashboard web-admin\src\pages\ -Recurse -Force
Copy-Item web\src\pages\profile web-admin\src\pages\ -Recurse -Force
Copy-Item web\src\pages\subscription web-admin\src\pages\ -Recurse -Force
Copy-Item web\src\pages\credits web-admin\src\pages\ -Recurse -Force
Copy-Item web\src\layouts web-admin\src\ -Recurse -Force
Copy-Item web\src\services web-admin\src\ -Recurse -Force
Copy-Item web\src\store web-admin\src\ -Recurse -Force
Copy-Item web\src\hooks web-admin\src\ -Recurse -Force
Copy-Item web\src\utils web-admin\src\ -Recurse -Force
Copy-Item web\src\constants web-admin\src\ -Recurse -Force

# Copy individual files
Copy-Item web\src\App.css web-admin\src\ -Force
Copy-Item web\src\reportWebVitals.ts web-admin\src\ -Force
Copy-Item web\src\setupTests.ts web-admin\src\ -Force
Copy-Item web\src\react-app-env.d.ts web-admin\src\ -Force
```

---

## ✅ **VERIFICATION CHECKLIST**

### **web-owner Should Have:**
```
web-owner/src/
├── components/          ✅
├── pages/               ✅
│   ├── auth/            ✅
│   ├── dashboard/       ✅
│   ├── library/         ✅
│   ├── booking/         ✅
│   ├── user/            ✅
│   ├── subscription/    ✅
│   ├── credits/         ✅
│   ├── ai/              ✅
│   ├── profile/         ✅
│   ├── common/          ✅
│   ├── admin/           ❌ (should be deleted)
│   └── tenant/          ❌ (should be deleted)
├── layouts/             ✅
├── services/            ✅
├── store/               ✅
├── hooks/               ✅
├── utils/               ✅
├── constants/           ✅
├── App.tsx              ✅ (already created by me)
├── App.css              ✅
├── index.tsx            ✅ (already created by me)
├── index.css            ✅ (already created by me)
└── reportWebVitals.ts   ✅
```

### **web-admin Should Have:**
```
web-admin/src/
├── components/
│   ├── common/          ✅
│   └── admin/           ✅
├── pages/
│   ├── auth/            ✅
│   ├── admin/           ✅
│   ├── tenant/          ✅
│   ├── dashboard/       ✅
│   ├── common/          ✅
│   ├── profile/         ✅
│   ├── subscription/    ✅
│   ├── credits/         ✅
│   ├── library/         ❌ (should NOT be here)
│   ├── booking/         ❌ (should NOT be here)
│   └── user/            ❌ (should NOT be here)
├── layouts/             ✅
├── services/            ✅
├── store/               ✅
├── hooks/               ✅
├── utils/               ✅
├── constants/           ✅
├── App.tsx              ✅ (already created by me)
├── App.css              ✅
├── index.tsx            ✅ (already created by me)
├── index.css            ✅ (already created by me)
└── reportWebVitals.ts   ✅
```

---

## 🚀 **AFTER COPYING**

```bash
# 1. Install dependencies
npm run install:all

# 2. Test owner portal
cd web-owner
npm start
# Should open on http://localhost:3000

# 3. Test admin portal (in new terminal)
cd web-admin
npm start
# Should open on http://localhost:3002
```

---

## 💡 **PRO TIP**

**Keep the original `/web/` folder intact** until both new portals are working perfectly. You can delete it later after everything is tested and deployed.

---

**This is your quick reference. Open it side-by-side while copying files!**












