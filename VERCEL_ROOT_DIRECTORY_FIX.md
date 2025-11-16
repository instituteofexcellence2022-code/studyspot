# 🔧 Fix: Vite Command Not Found on Vercel

## Problem
Vercel can't find `vite` command because workspace dependencies aren't resolving when Root Directory is set to `studyspot-student-pwa`.

## Solution

### Option 1: Use Repo Root (Recommended)

**In Vercel Dashboard:**

1. Go to **Settings** → **General**
2. **Root Directory**: Leave **EMPTY** (use repo root)
3. **Build Command**: `cd studyspot-student-pwa && npm run build`
4. **Output Directory**: `studyspot-student-pwa/dist`
5. **Install Command**: `npm install --legacy-peer-deps`

This allows:
- ✅ Workspace dependencies to resolve (`studyspot-tenant-sdk`)
- ✅ All dependencies to install correctly
- ✅ Vite to be available in node_modules

---

### Option 2: If Root Directory Must Be `studyspot-student-pwa`

Update **Build Command** in Vercel to:
```bash
npm install --legacy-peer-deps && npm run build
```

Or use npx:
```bash
npx vite build
```

---

## Current Configuration

The `vercel.json` has been updated to work from repo root:
- Build Command: `cd studyspot-student-pwa && npm run build`
- Output Directory: `studyspot-student-pwa/dist`

**But you must set Root Directory to EMPTY in Vercel dashboard!**

---

## Steps to Fix

1. **Go to Vercel Dashboard** → Your Project → **Settings** → **General**
2. **Root Directory**: Clear it (leave empty) ⚠️ **CRITICAL**
3. **Save**
4. **Redeploy**

The build should now work because:
- npm install runs from repo root (resolves workspaces)
- Build command changes to student portal directory
- Output is correctly specified

---

## Why This Works

- **Repo Root Install**: Resolves `file:../packages/studyspot-tenant-sdk` dependency
- **All Dependencies**: Installs vite and all other packages correctly
- **Build from Subdirectory**: Changes to student portal folder before building
- **Correct Output**: Points to the right dist folder

