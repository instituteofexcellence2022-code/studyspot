/**
 * STUDYSPOT - Platform Administrator Portal
 * 
 * Target Users: Super Administrators, Platform Managers
 * Features: Tenant Management, Platform Analytics, Revenue Management,
 *           Credit System Management, Security, Compliance
 * 
 * Port: 3002
 * Theme: Red (#d32f2f) - Administrative/High Security
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { store, persistor } from './store';
import { ROUTES } from './constants';
import { useAppSelector } from './hooks/redux';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Common Components
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';

// ============================================
// LAZY LOADED PAGES - Code Splitting
// ============================================

// Authentication Pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));

// Platform Dashboard
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));

// Tenant/Library Management
const AdminTenantsPage = lazy(() => import('./pages/admin/AdminTenantsPage'));
const AdminTenantDetailsPage = lazy(() => import('./pages/admin/AdminTenantDetailsPage'));
const TenantManagementPage = lazy(() => import('./pages/admin/TenantManagementPage'));

// Platform Analytics & BI
const AdminAnalyticsPage = lazy(() => import('./pages/admin/AdminAnalyticsPage'));

// RBAC Management
const RoleManagementPage = lazy(() => import('./pages/admin/RoleManagementPage'));

// Security & Compliance
const SecuritySettingsPage = lazy(() => import('./pages/admin/SecuritySettingsPage'));
const AuditLogPage = lazy(() => import('./pages/admin/AuditLogPage'));

// Tenant Onboarding
const OnboardingWizard = lazy(() => import('./pages/tenant/OnboardingWizard'));
const TenantSettings = lazy(() => import('./pages/tenant/SettingsDashboard'));
const TenantAnalytics = lazy(() => import('./pages/tenant/AnalyticsDashboard'));

// Subscription Plan Management (Create/Edit Plans)
const SubscriptionPlansPage = lazy(() => import('./pages/subscription/SubscriptionPlansPage'));

// Credit System Management (Platform-wide)
const CreditDashboardPage = lazy(() => import('./pages/credits/CreditDashboardPage'));
const UsageAnalyticsPage = lazy(() => import('./pages/credits/UsageAnalyticsPage'));

// Profile
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));

// Common Pages
const HelpPage = lazy(() => import('./pages/common/HelpPage'));
const NotFoundPage = lazy(() => import('./pages/common/NotFoundPage'));

// ============================================
// THEME CONFIGURATION - Admin Theme
// ============================================

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#d32f2f', // Red - Administrative/Security theme
      light: '#ef5350',
      dark: '#c62828',
    },
    secondary: {
      main: '#f57c00', // Orange accent
      light: '#ff9800',
      dark: '#e65100',
    },
    error: {
      main: '#d32f2f',
    },
    warning: {
      main: '#f57c00',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(211,47,47,0.08)',
          border: '1px solid rgba(211,47,47,0.12)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(211,47,47,0.12)',
        },
      },
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ef5350',
      light: '#ff6f60',
      dark: '#c62828',
    },
    secondary: {
      main: '#ff9800',
      light: '#ffa726',
      dark: '#f57c00',
    },
    background: {
      default: '#0a0a0a',
      paper: '#1a1a1a',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(239,83,80,0.15)',
          border: '1px solid rgba(239,83,80,0.2)',
        },
      },
    },
  },
});

// ============================================
// MAIN APP COMPONENT
// ============================================

const AppContent: React.FC = () => {
  const theme = useAppSelector((state) => state.ui?.theme || 'light');
  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme === 'dark' ? 'dark' : 'light'}
      />
      <Router>
        <Suspense fallback={
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <LoadingSpinner message="Loading Platform Admin..." />
          </Box>
        }>
          <Routes>
            {/* ============================================ */}
            {/* PUBLIC ROUTES - Authentication */}
            {/* ============================================ */}
            <Route path={ROUTES.LOGIN} element={
              <AuthLayout>
                <LoginPage />
              </AuthLayout>
            } />

            {/* ============================================ */}
            {/* PROTECTED ROUTES - Super Admin Only */}
            {/* Requires super_admin role */}
            {/* ============================================ */}
            <Route path="/" element={
              <ProtectedRoute requiredRole="super_admin">
                <MainLayout />
              </ProtectedRoute>
            }>
              {/* Platform Dashboard */}
              <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />
              <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />

              {/* ============================================ */}
              {/* TENANT/LIBRARY MANAGEMENT */}
              {/* Onboard, manage, monitor all library tenants */}
              {/* ============================================ */}
              <Route path={ROUTES.ADMIN_TENANTS} element={<AdminTenantsPage />} />
              <Route path={ROUTES.ADMIN_TENANT_DETAILS} element={<AdminTenantDetailsPage />} />
              <Route path="/admin/tenants/manage" element={<TenantManagementPage />} />
              <Route path="/tenant/onboard" element={<OnboardingWizard />} />
              <Route path="/tenant/settings/:id" element={<TenantSettings />} />
              <Route path="/tenant/analytics/:id" element={<TenantAnalytics />} />

              {/* ============================================ */}
              {/* PLATFORM ANALYTICS & BUSINESS INTELLIGENCE */}
              {/* MRR, ARR, Platform-wide metrics */}
              {/* ============================================ */}
              <Route path={ROUTES.ADMIN_ANALYTICS} element={<AdminAnalyticsPage />} />

              {/* ============================================ */}
              {/* SUBSCRIPTION PLAN MANAGEMENT */}
              {/* Create/Edit/Manage subscription tiers */}
              {/* Free, Starter, Pro, Enterprise */}
              {/* ============================================ */}
              <Route path={ROUTES.SUBSCRIPTION_PLANS} element={<SubscriptionPlansPage />} />

              {/* ============================================ */}
              {/* CREDIT SYSTEM MANAGEMENT */}
              {/* SMS/WhatsApp credit pricing & packages */}
              {/* Platform-wide usage analytics */}
              {/* ============================================ */}
              <Route path="/credits/management" element={<CreditDashboardPage />} />
              <Route path="/credits/platform-analytics" element={<UsageAnalyticsPage />} />

              {/* ============================================ */}
              {/* RBAC - ROLE & PERMISSION MANAGEMENT */}
              {/* Platform-level roles and permissions */}
              {/* ============================================ */}
              <Route path={ROUTES.ADMIN_ROLES} element={<RoleManagementPage />} />

              {/* ============================================ */}
              {/* SECURITY & COMPLIANCE */}
              {/* Platform security settings, audit logs */}
              {/* ============================================ */}
              <Route path={ROUTES.ADMIN_SECURITY} element={<SecuritySettingsPage />} />
              <Route path={ROUTES.ADMIN_AUDIT_LOGS} element={<AuditLogPage />} />

              {/* ============================================ */}
              {/* PROFILE & SETTINGS */}
              {/* ============================================ */}
              <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
              
              {/* Help & Support */}
              <Route path={ROUTES.HELP} element={<HelpPage />} />
            </Route>

            {/* ============================================ */}
            {/* 404 NOT FOUND */}
            {/* ============================================ */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </Router>
    </ThemeProvider>
  );
};

// ============================================
// ROOT APP COMPONENT WITH PROVIDERS
// ============================================

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={<LoadingSpinner message="Initializing Platform Admin..." />} persistor={persistor}>
          <AppContent />
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
};

export default App;






