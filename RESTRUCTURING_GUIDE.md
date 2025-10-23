# 🔄 STUDYSPOT PLATFORM - RESTRUCTURING GUIDE

**Goal**: Split single web app into 2 separate portals  
**Status**: ✅ 40% Complete  
**Estimated Time to Complete**: 3-4 hours

---

## ✅ **WHAT'S BEEN COMPLETED**

### 1. Directory Structure ✅
Created two new portal directories:
- `/web-owner/` - Library Owner & Staff Portal
- `/web-admin/` - Platform Administrator Portal

### 2. Configuration Files ✅
Both portals now have:
- ✅ `package.json` (with correct dependencies)
- ✅ `tsconfig.json` (TypeScript configuration)
- ✅ `.gitignore` (Git ignore rules)
- ✅ `public/index.html` (HTML template)
- ✅ `public/manifest.json` (PWA manifest)
- ✅ `public/robots.txt` (SEO rules)

### 3. Source Files ✅
Basic source structure created:
- ✅ `src/index.tsx` (Entry point)
- ✅ `src/index.css` (Global styles)

### 4. Documentation ✅
Comprehensive documentation:
- ✅ `/web-owner/README.md` - Owner portal guide
- ✅ `/web-admin/README.md` - Admin portal guide
- ✅ `/ARCHITECTURE.md` - Complete architecture docs
- ✅ `/RESTRUCTURING_GUIDE.md` - This file

---

## ⏳ **WHAT NEEDS TO BE DONE**

### Phase 1: Copy Files (2 hours)

#### Step 1.1: Copy to web-owner
Copy these files/folders from `/web/src/` to `/web-owner/src/`:

**Essential Files:**
```bash
# From /web/src/
cp -r components/common/ web-owner/src/components/
cp -r components/library/ web-owner/src/components/
cp -r components/dashboard/ web-owner/src/components/
cp -r components/credits/ web-owner/src/components/
cp -r components/subscription/ web-owner/src/components/

cp -r pages/auth/ web-owner/src/pages/
cp -r pages/dashboard/ web-owner/src/pages/
cp -r pages/library/ web-owner/src/pages/
cp -r pages/booking/ web-owner/src/pages/
cp -r pages/user/ web-owner/src/pages/
cp -r pages/subscription/ web-owner/src/pages/
cp -r pages/credits/ web-owner/src/pages/
cp -r pages/profile/ web-owner/src/pages/
cp -r pages/common/ web-owner/src/pages/

cp -r layouts/ web-owner/src/
cp -r services/ web-owner/src/
cp -r store/ web-owner/src/
cp -r hooks/ web-owner/src/
cp -r utils/ web-owner/src/
cp constants/index.ts web-owner/src/constants/
cp App.css web-owner/src/
cp reportWebVitals.ts web-owner/src/
cp setupTests.ts web-owner/src/
cp react-app-env.d.ts web-owner/src/
```

**DO NOT Copy (Admin-only):**
- ❌ `pages/admin/` - Admin pages
- ❌ `components/admin/` - Admin components

#### Step 1.2: Copy to web-admin
Copy these files/folders from `/web/src/` to `/web-admin/src/`:

**Essential Files:**
```bash
# From /web/src/
cp -r components/common/ web-admin/src/components/
cp -r components/admin/ web-admin/src/components/

cp -r pages/auth/ web-admin/src/pages/
cp -r pages/dashboard/DashboardPage.tsx web-admin/src/pages/dashboard/
cp -r pages/admin/ web-admin/src/pages/
cp -r pages/tenant/ web-admin/src/pages/
cp -r pages/profile/ web-admin/src/pages/
cp -r pages/common/ web-admin/src/pages/

cp -r layouts/ web-admin/src/
cp -r services/ web-admin/src/
cp -r store/ web-admin/src/
cp -r hooks/ web-admin/src/
cp -r utils/ web-admin/src/
cp constants/index.ts web-admin/src/constants/
cp App.css web-admin/src/
cp reportWebVitals.ts web-admin/src/
cp setupTests.ts web-admin/src/
cp react-app-env.d.ts web-admin/src/
```

**DO NOT Copy (Owner-only):**
- ❌ `pages/library/` - Library management
- ❌ `pages/booking/` - Booking management
- ❌ `pages/user/` - User management
- ❌ `pages/subscription/` - Subscriptions
- ❌ `pages/credits/` - Credits
- ❌ `components/library/` - Library components
- ❌ `components/credits/` - Credit components

---

### Phase 2: Create App.tsx Files (30 minutes)

#### Step 2.1: Create /web-owner/src/App.tsx

```typescript
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { store, persistor } from './store';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

// Auth Pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));

// Dashboard
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));

// Library Pages
const LibrariesPage = lazy(() => import('./pages/library/LibrariesPage'));
const LibraryDetailsPage = lazy(() => import('./pages/library/LibraryDetailsPage'));
const LibraryCreatePage = lazy(() => import('./pages/library/LibraryCreatePage'));
const LibraryEditPage = lazy(() => import('./pages/library/LibraryEditPage'));

// Booking Pages
const BookingsPage = lazy(() => import('./pages/booking/BookingsPage'));
const BookingDetailsPage = lazy(() => import('./pages/booking/BookingDetailsPage'));

// User Pages
const UsersPage = lazy(() => import('./pages/user/UsersPage'));
const UserDetailsPage = lazy(() => import('./pages/user/UserDetailsPage'));
const UserCreatePage = lazy(() => import('./pages/user/UserCreatePage'));
const UserEditPage = lazy(() => import('./pages/user/UserEditPage'));

// Subscription Pages
const SubscriptionPlansPage = lazy(() => import('./pages/subscription/SubscriptionPlansPage'));
const SubscriptionManagePage = lazy(() => import('./pages/subscription/SubscriptionManagePage'));
const InvoicesPage = lazy(() => import('./pages/subscription/InvoicesPage'));

// Credit Pages
const CreditDashboardPage = lazy(() => import('./pages/credits/CreditDashboardPage'));
const CreditPurchasePage = lazy(() => import('./pages/credits/CreditPurchasePage'));

// Profile
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));

// Common
const NotFoundPage = lazy(() => import('./pages/common/NotFoundPage'));

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingSpinner />} persistor={persistor}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ToastContainer />
          <Router>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
                <Route path="/register" element={<AuthLayout><RegisterPage /></AuthLayout>} />
                
                {/* Protected Routes */}
                <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  
                  {/* Library Routes */}
                  <Route path="libraries" element={<LibrariesPage />} />
                  <Route path="libraries/create" element={<LibraryCreatePage />} />
                  <Route path="libraries/:id" element={<LibraryDetailsPage />} />
                  <Route path="libraries/:id/edit" element={<LibraryEditPage />} />
                  
                  {/* Booking Routes */}
                  <Route path="bookings" element={<BookingsPage />} />
                  <Route path="bookings/:id" element={<BookingDetailsPage />} />
                  
                  {/* User Routes */}
                  <Route path="users" element={<UsersPage />} />
                  <Route path="users/create" element={<UserCreatePage />} />
                  <Route path="users/:id" element={<UserDetailsPage />} />
                  <Route path="users/:id/edit" element={<UserEditPage />} />
                  
                  {/* Subscription Routes */}
                  <Route path="subscription/plans" element={<SubscriptionPlansPage />} />
                  <Route path="subscription/manage" element={<SubscriptionManagePage />} />
                  <Route path="subscription/invoices" element={<InvoicesPage />} />
                  
                  {/* Credit Routes */}
                  <Route path="credits" element={<CreditDashboardPage />} />
                  <Route path="credits/purchase" element={<CreditPurchasePage />} />
                  
                  {/* Profile */}
                  <Route path="profile" element={<ProfilePage />} />
                </Route>
                
                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </Router>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
```

#### Step 2.2: Create /web-admin/src/App.tsx

```typescript
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { store, persistor } from './store';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

// Auth Pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));

// Dashboard
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));

// Admin Pages
const AdminTenantsPage = lazy(() => import('./pages/admin/AdminTenantsPage'));
const AdminTenantDetailsPage = lazy(() => import('./pages/admin/AdminTenantDetailsPage'));
const AdminAnalyticsPage = lazy(() => import('./pages/admin/AdminAnalyticsPage'));
const RoleManagementPage = lazy(() => import('./pages/admin/RoleManagementPage'));
const AuditLogPage = lazy(() => import('./pages/admin/AuditLogPage'));
const SecuritySettingsPage = lazy(() => import('./pages/admin/SecuritySettingsPage'));

// Profile
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));

// Common
const NotFoundPage = lazy(() => import('./pages/common/NotFoundPage'));

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#d32f2f' },
    secondary: { main: '#f57c00' },
  },
});

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingSpinner />} persistor={persistor}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ToastContainer />
          <Router>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
                
                {/* Protected Routes - Super Admin Only */}
                <Route path="/" element={<ProtectedRoute requiredRole="super_admin"><MainLayout /></ProtectedRoute>}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  
                  {/* Tenant Management */}
                  <Route path="tenants" element={<AdminTenantsPage />} />
                  <Route path="tenants/:id" element={<AdminTenantDetailsPage />} />
                  
                  {/* Analytics */}
                  <Route path="analytics" element={<AdminAnalyticsPage />} />
                  
                  {/* RBAC */}
                  <Route path="roles" element={<RoleManagementPage />} />
                  
                  {/* Security */}
                  <Route path="security" element={<SecuritySettingsPage />} />
                  <Route path="audit-logs" element={<AuditLogPage />} />
                  
                  {/* Profile */}
                  <Route path="profile" element={<ProfilePage />} />
                </Route>
                
                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </Router>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
```

---

### Phase 3: Update Root Files (30 minutes)

#### Step 3.1: Update root package.json

Add these scripts:
```json
{
  "scripts": {
    "start:api": "cd api && npm start",
    "start:owner": "cd web-owner && npm start",
    "start:admin": "cd web-admin && npm start",
    "start:mobile": "cd mobile && npm start",
    
    "install:all": "npm install && cd api && npm install && cd ../web-owner && npm install && cd ../web-admin && npm install && cd ../mobile && npm install",
    
    "build:owner": "cd web-owner && npm run build",
    "build:admin": "cd web-admin && npm run build",
    "build:api": "cd api && npm run build",
    
    "test:owner": "cd web-owner && npm test",
    "test:admin": "cd web-admin && npm test",
    "test:api": "cd api && npm test"
  }
}
```

---

### Phase 4: Clean Up Store/Services (30 minutes)

#### web-owner Cleanup
Remove admin-related Redux slices:
- Remove admin-specific actions from store
- Keep only: auth, library, booking, user, subscription, credit slices

#### web-admin Cleanup
Remove library owner-related Redux slices:
- Remove library, booking, user management slices
- Keep only: auth, tenant, role, audit slices

---

### Phase 5: Test & Deploy (1 hour)

#### Local Testing
```bash
# Terminal 1: Backend
cd api
npm start

# Terminal 2: Owner Portal
cd web-owner
npm install
npm start
# Opens on localhost:3000

# Terminal 3: Admin Portal
cd web-admin
npm install
npm start
# Opens on localhost:3002
```

#### Deploy to Vercel
```bash
# Owner Portal
cd web-owner
vercel --prod

# Admin Portal
cd web-admin
vercel --prod
```

---

## 📋 **QUICK CHECKLIST**

### Phase 1: Files
- [ ] Copy components to web-owner
- [ ] Copy pages to web-owner
- [ ] Copy components to web-admin
- [ ] Copy pages to web-admin
- [ ] Copy shared utils/services/hooks to both

### Phase 2: App Files
- [ ] Create web-owner/src/App.tsx
- [ ] Create web-admin/src/App.tsx
- [ ] Create web-owner/src/App.css
- [ ] Create web-admin/src/App.css

### Phase 3: Configuration
- [ ] Update root package.json
- [ ] Create .env.example for both portals
- [ ] Update deployment configs

### Phase 4: Testing
- [ ] Install dependencies: `npm run install:all`
- [ ] Test owner portal: `npm run start:owner`
- [ ] Test admin portal: `npm run start:admin`
- [ ] Test all routes work
- [ ] Test API integration

### Phase 5: Deployment
- [ ] Deploy owner portal to Vercel
- [ ] Deploy admin portal to Vercel
- [ ] Configure custom domains
- [ ] Test production builds
- [ ] Update documentation

---

## 🆘 **NEED HELP?**

### Common Issues

**Issue**: Module not found errors
**Solution**: Copy the missing file/folder from `/web/src/`

**Issue**: Redux store errors
**Solution**: Ensure all slices are copied to both portals

**Issue**: Import path errors
**Solution**: Check that constants/types files are copied

---

## ✅ **SUCCESS CRITERIA**

You'll know it's complete when:
1. ✅ `npm start` works in both web-owner and web-admin
2. ✅ No compilation errors
3. ✅ Login works in both portals
4. ✅ Owner portal shows library features only
5. ✅ Admin portal shows platform features only
6. ✅ Both portals connect to same API
7. ✅ Both portals deploy successfully to Vercel

---

**Estimated Total Time**: 3-4 hours  
**Difficulty**: Moderate (mostly file copying and configuration)  
**Impact**: ⭐⭐⭐⭐⭐ Major architectural improvement

Good luck! 🚀




