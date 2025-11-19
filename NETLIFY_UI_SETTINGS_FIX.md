# Fix Netlify Build Settings

Netlify is currently using UI settings that override the `netlify.toml` file. Follow these steps to fix it:

## Step 1: Clear UI Build Settings in Netlify Dashboard

1. **Go to Netlify Dashboard**: https://app.netlify.com
2. **Open your `studyspot-student-pwa` site**
3. **Go to Site settings → Build & deploy → Continuous Deployment → Build settings**
4. **Clear/Delete these UI settings** (leave them empty so Netlify uses `netlify.toml`):
   - **Base directory**: Leave empty (or delete if set)
   - **Build command**: Leave empty (or delete if set) - Netlify will use the command from `netlify.toml`
   - **Publish directory**: Leave empty (or delete if set) - Netlify will use the publish path from `netlify.toml`
5. **Click "Save"**

## Step 2: Verify Environment Variables

Go to **Site settings → Environment variables** and ensure these are set for **Production**, **Preview**, and **Development**:

- `VITE_API_URL=https://studyspot-api.onrender.com`
- `VITE_AUTH_URL=https://studyspot-auth.onrender.com`
- `VITE_APP_NAME=StudySpot Student Portal`
- `VITE_APP_VERSION=4.0.0`
- `VITE_USE_MOCK=false`
- `NODE_VERSION=20` (Important: Vite 7 requires Node 20+)

## Step 3: Trigger New Deployment

1. Go to the **Deploys** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Monitor the build logs

## What the `netlify.toml` Does

The root `netlify.toml` file now contains:

```toml
[build]
  base = "."  # Start from repo root
  command = "npm install --legacy-peer-deps && npm run build --workspace=packages/studyspot-tenant-sdk && npm run build --workspace=studyspot-student-pwa"
  publish = "studyspot-student-pwa/dist"

[build.environment]
  NODE_VERSION = "20"  # Required for Vite 7
  # ... other env vars
```

This will:
1. Install all dependencies from the monorepo root
2. Build the SDK first (`packages/studyspot-tenant-sdk`)
3. Then build the student portal (`studyspot-student-pwa`)
4. Publish from `studyspot-student-pwa/dist`

## Why This Works

- **Root `netlify.toml`**: Netlify looks for `netlify.toml` at the repo root first
- **Workspace builds**: Uses npm workspaces to build dependencies in order
- **Node 20**: Vite 7 requires Node.js 20.19+ or 22.12+
- **No UI override**: Clearing UI settings ensures `netlify.toml` is used


