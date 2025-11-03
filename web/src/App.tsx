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

// Layout Components (Keep these as they're needed immediately)
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Common Components (Keep these for immediate use)
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

// LAZY LOADED PAGES - Code Splitting for Performance Optimization
// Auth Pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const EmailVerificationPage = lazy(() => import('./pages/auth/EmailVerificationPage'));

// Dashboard Pages
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

// Admin Pages
const AdminPage = lazy(() => import('./pages/admin/AdminPage'));
const AdminTenantsPage = lazy(() => import('./pages/admin/AdminTenantsPage'));
const AdminTenantDetailsPage = lazy(() => import('./pages/admin/AdminTenantDetailsPage'));
const AdminAnalyticsPage = lazy(() => import('./pages/admin/AdminAnalyticsPage'));

// AI Pages
const AIAssistantPage = lazy(() => import('./pages/ai/AIAssistantPage'));
const RecommendationsPage = lazy(() => import('./pages/ai/RecommendationsPage'));
const PredictiveAnalyticsPage = lazy(() => import('./pages/ai/PredictiveAnalyticsPage'));
const SmartSchedulerPage = lazy(() => import('./pages/ai/SmartSchedulerPage'));

// Subscription Pages
const SubscriptionPlansPage = lazy(() => import('./pages/subscription/SubscriptionPlansPage'));
const SubscriptionManagePage = lazy(() => import('./pages/subscription/SubscriptionManagePage'));
const SubscriptionCheckoutPage = lazy(() => import('./pages/subscription/SubscriptionCheckoutPage'));
const SubscriptionSuccessPage = lazy(() => import('./pages/subscription/SubscriptionSuccessPage'));
const InvoicesPage = lazy(() => import('./pages/subscription/InvoicesPage'));

// Tenant Pages
const OnboardingWizard = lazy(() => import('./pages/tenant/OnboardingWizard'));
const TenantSettings = lazy(() => import('./pages/tenant/SettingsDashboard'));
const TenantAnalytics = lazy(() => import('./pages/tenant/AnalyticsDashboard'));
const TenantManagement = lazy(() => import('./pages/admin/TenantManagementPage'));

// RBAC Pages (Sprint 3)
const RoleManagementPage = lazy(() => import('./pages/admin/RoleManagementPage'));
const AuditLogPage = lazy(() => import('./pages/admin/AuditLogPage'));
const SecuritySettingsPage = lazy(() => import('./pages/admin/SecuritySettingsPage'));

// Credit Management Pages (Sprint 4)
const CreditDashboardPage = lazy(() => import('./pages/credits/CreditDashboardPage'));
const CreditPurchasePage = lazy(() => import('./pages/credits/CreditPurchasePage'));
const AutoTopupPage = lazy(() => import('./pages/credits/AutoTopupPage'));
const UsageAnalyticsPage = lazy(() => import('./pages/credits/UsageAnalyticsPage'));
const TransactionHistoryPage = lazy(() => import('./pages/credits/TransactionHistoryPage'));

// Profile Pages
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));

// Common Pages
const NotFoundPage = lazy(() => import('./pages/common/NotFoundPage'));
const HelpPage = lazy(() => import('./pages/common/HelpPage'));

// Theme configuration
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

// Main App Component
const AppContent: React.FC = () => {
  const theme = useAppSelector((state) => state.ui.theme);
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
      />
      <Router>
        <Suspense fallback={
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <LoadingSpinner message="Loading..." />
          </Box>
        }>
          <Routes>
            {/* Public Routes */}
            <Route path={ROUTES.LOGIN} element={
              <AuthLayout>
                <LoginPage />
              </AuthLayout>
            } />
            <Route path={ROUTES.REGISTER} element={
              <AuthLayout>
                <RegisterPage />
              </AuthLayout>
            } />
            <Route path="/forgot-password" element={
              <AuthLayout>
                <ForgotPasswordPage />
              </AuthLayout>
            } />
            <Route path="/verify-email" element={
              <AuthLayout>
                <EmailVerificationPage />
              </AuthLayout>
            } />

          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            {/* Dashboard Routes */}
            <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />
            <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />

            {/* Library Routes */}
            <Route path={ROUTES.LIBRARIES} element={<LibrariesPage />} />
            <Route path={ROUTES.LIBRARY_CREATE} element={<LibraryCreatePage />} />
            <Route path={ROUTES.LIBRARY_DETAILS} element={<LibraryDetailsPage />} />
            <Route path={ROUTES.LIBRARY_EDIT} element={<LibraryEditPage />} />

            {/* Booking Routes */}
            <Route path={ROUTES.BOOKINGS} element={<BookingsPage />} />
            <Route path={ROUTES.BOOKING_DETAILS} element={<BookingDetailsPage />} />

            {/* User Routes */}
            <Route path={ROUTES.USERS} element={<UsersPage />} />
            <Route path={ROUTES.USER_CREATE} element={<UserCreatePage />} />
            <Route path={ROUTES.USER_DETAILS} element={<UserDetailsPage />} />
            <Route path={ROUTES.USER_EDIT} element={<UserEditPage />} />

            {/* Admin Routes */}
            <Route path={ROUTES.ADMIN} element={<AdminPage />} />
            <Route path={ROUTES.ADMIN_TENANTS} element={<AdminTenantsPage />} />
            <Route path={ROUTES.ADMIN_TENANT_DETAILS} element={<AdminTenantDetailsPage />} />
            <Route path={ROUTES.ADMIN_ANALYTICS} element={<AdminAnalyticsPage />} />
            <Route path={ROUTES.ADMIN_ROLES} element={<RoleManagementPage />} />
            <Route path={ROUTES.ADMIN_AUDIT_LOGS} element={<AuditLogPage />} />
            <Route path={ROUTES.ADMIN_SECURITY} element={<SecuritySettingsPage />} />

            {/* Subscription Routes */}
            <Route path={ROUTES.SUBSCRIPTION_PLANS} element={<SubscriptionPlansPage />} />
            <Route path={ROUTES.SUBSCRIPTION_CHECKOUT} element={<SubscriptionCheckoutPage />} />
            <Route path={ROUTES.SUBSCRIPTION_SUCCESS} element={<SubscriptionSuccessPage />} />
            <Route path={ROUTES.SUBSCRIPTION_MANAGE} element={<SubscriptionManagePage />} />
            <Route path={ROUTES.SUBSCRIPTION_INVOICES} element={<InvoicesPage />} />

            {/* Tenant Routes */}
            <Route path={ROUTES.TENANT_ONBOARDING} element={<OnboardingWizard />} />
            <Route path={ROUTES.TENANT_SETTINGS} element={<TenantSettings />} />
            <Route path={ROUTES.TENANT_ANALYTICS} element={<TenantAnalytics />} />
            <Route path={ROUTES.ADMIN_TENANTS} element={<TenantManagement />} />

            {/* Credit Management Routes (Sprint 4) */}
            <Route path="/credits" element={<CreditDashboardPage />} />
            <Route path="/credits/purchase" element={<CreditPurchasePage />} />
            <Route path="/credits/auto-topup" element={<AutoTopupPage />} />
            <Route path="/credits/analytics" element={<UsageAnalyticsPage />} />
            <Route path="/credits/transactions" element={<TransactionHistoryPage />} />

            {/* Profile Routes */}
            <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
            
            {/* Help & Support */}
            <Route path="/help" element={<HelpPage />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </Suspense>
      </Router>
    </ThemeProvider>
  );
};

// Root App Component
const App: React.FC = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingSpinner />} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
};

export default App;