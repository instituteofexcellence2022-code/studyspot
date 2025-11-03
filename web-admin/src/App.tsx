import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, CircularProgress, Box } from '@mui/material';

import { store } from './store';
import theme from './theme';

// Simple Loading Component
const LoadingFallback = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
    }}
  >
    <CircularProgress />
  </Box>
);

// Minimal App - Just Login and Dashboard
const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <h1>Web Admin Portal - Minimal Version</h1>
                  <p>Portal is running successfully!</p>
                  <p>Status: ✅ Working</p>
                </Box>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </ThemeProvider>
    </Provider>
  );
};

export default App;


import { CssBaseline } from '@mui/material';
import RoutePreloader from './components/common/RoutePreloader';
import MainLayout from './layouts/MainLayout';
import { store, persistor } from './store';
import GlobalSnackbar from './components/common/GlobalSnackbar';
import ErrorBoundary from './components/common/ErrorBoundary';
import theme from './theme';
import RouteFallback from './components/common/RouteFallback';
import PlaceholderPage from './components/common/PlaceholderPage';
import AdminDashboard from './components/admin/AdminDashboard';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import EmailVerificationPage from './pages/auth/EmailVerificationPage';
import AdminTenantsPage from './pages/admin/AdminTenantsPage';
import AdminTenantDetailsPage from './pages/admin/AdminTenantDetailsPage';
import { useAppDispatch } from './hooks/redux';
import { getProfile } from './store/slices/authSlice';
import { STORAGE_KEYS } from './constants';
import ProtectedRoute from './components/common/ProtectedRoute';


// Simple App Component
const App: React.FC = () => {
  const dispatch = useAppDispatch();

  // Bootstrap user profile when token exists
  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      dispatch(getProfile());
    }
  }, [dispatch]);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ErrorBoundary>
            <Router>
              <RoutePreloader>
                <Suspense fallback={<RouteFallback /> }>
                  <Routes>
                    {/* Public Auth Routes */}
                    <Route path='/login' element={<LoginPage />} />
                    <Route path='/register' element={<RegisterPage />} />
                    <Route path='/forgot-password' element={<ForgotPasswordPage />} />
                    <Route path='/verify-email' element={<EmailVerificationPage />} />

                    {/* Protected Admin Routes */}
                    <Route element={
                      <ProtectedRoute requiredRole={[ 'super_admin', 'admin' ]}>
                          <MainLayout />
                        </ProtectedRoute>
                    }>
                      <Route index element={<AdminDashboard />} />
                      <Route path='/admin' element={<AdminDashboard />} />
                      <Route path='/dashboard' element={<AdminDashboard />} />
                      {/* Microservices */}
                      <Route path='/admin/ai-service' element={<PlaceholderPage title='AI Service Management' />} />
                      <Route path='/admin/analytics-service' element={<PlaceholderPage title='Analytics Service' />} />
                      <Route path='/admin/automation-service' element={<PlaceholderPage title='Automation Service' />} />
                      <Route path='/admin/communication-service' element={<PlaceholderPage title='Communication Service' />} />
                      <Route path='/admin/crm-service' element={<PlaceholderPage title='CRM Service' />} />
                      <Route path='/admin/data-pipeline' element={<PlaceholderPage title='Data Pipeline' />} />
                      <Route path='/admin/face-recognition' element={<PlaceholderPage title='Face Recognition' />} />
                      <Route path='/admin/ml-service' element={<PlaceholderPage title='ML Service' />} />
                      <Route path='/admin/notification-service' element={<PlaceholderPage title='Notification Service' />} />
                      <Route path='/admin/payment-service' element={<PlaceholderPage title='Payment Service' />} />
                      <Route path='/admin/i18n-service' element={<PlaceholderPage title='i18n Service' />} />
                      {/* Tenant & Admin */}
                      <Route path='/admin/tenants' element={<AdminTenantsPage />} />
                      <Route path='/admin/tenants/:id' element={<AdminTenantDetailsPage />} />
                      <Route path='/admin/tenants/manage' element={<PlaceholderPage title='Advanced Tenant Management' />} />
                      <Route path='/admin/revenue' element={<PlaceholderPage title='Revenue Management' />} />
                      <Route path='/admin/security' element={<PlaceholderPage title='Security Management' />} />
                      <Route path='/admin/security/mfa' element={<PlaceholderPage title='MFA Management' />} />
                      <Route path='/admin/security/sso' element={<PlaceholderPage title='SSO Integration' />} />
                      <Route path='/admin/security/rbac' element={<PlaceholderPage title='RBAC/ABAC' />} />
                      {/* Features & Messaging */}
                      <Route path='/admin/features/flags' element={<PlaceholderPage title='Feature Flags' />} />
                      <Route path='/admin/features/experiments' element={<PlaceholderPage title='A/B Testing' />} />
                      <Route path='/admin/messaging/email-templates' element={<PlaceholderPage title='Email Templates' />} />
                      <Route path='/admin/messaging/push-notifications' element={<PlaceholderPage title='Push Notifications' />} />
                      <Route path='/admin/messaging/campaigns' element={<PlaceholderPage title='Campaigns' />} />
                      <Route path='/admin/messaging/credit-wallets' element={<PlaceholderPage title='Credit Wallets' />} />
                      {/* Integrations & Ops */}
                      <Route path='/admin/integrations/webhooks' element={<PlaceholderPage title='Webhooks' />} />
                      <Route path='/admin/integrations/registry' element={<PlaceholderPage title='Integration Registry' />} />
                      <Route path='/admin/operations/health' element={<PlaceholderPage title='System Health' />} />
                      <Route path='/admin/operations/incidents' element={<PlaceholderPage title='Incident Management' />} />
                      {/* Compliance */}
                      <Route path='/admin/compliance/consent' element={<PlaceholderPage title='Consent Management' />} />
                      <Route path='/admin/compliance/dsr' element={<PlaceholderPage title='Data Subject Requests' />} />
                      {/* Attendance */}
                      <Route path='/admin/attendance/management' element={<PlaceholderPage title='Attendance Management' />} />
                      <Route path='/admin/attendance/devices' element={<PlaceholderPage title='IoT Device Management' />} />
                      {/* Policy & Workflow */}
                      <Route path='/admin/policy/engine' element={<PlaceholderPage title='Policy Engine' />} />
                      <Route path='/admin/policy/workflows' element={<PlaceholderPage title='Automation Workflows' />} />
                      {/* Analytics & ML */}
                      <Route path='/admin/analytics/bi' element={<PlaceholderPage title='Business Intelligence' />} />
                      <Route path='/admin/analytics/advanced' element={<PlaceholderPage title='Advanced Analytics' />} />
                      <Route path='/admin/ml/platform' element={<PlaceholderPage title='ML Platform' />} />
                      <Route path='/admin/ml/features' element={<PlaceholderPage title='Feature Store' />} />
                      <Route path='/admin/ml/models' element={<PlaceholderPage title='Model Registry' />} />
                      {/* Search & Files */}
                      <Route path='/admin/search/engine' element={<PlaceholderPage title='Search Engine' />} />
                      <Route path='/admin/search/files' element={<PlaceholderPage title='File Management' />} />
                      <Route path='/admin/search/scanning' element={<PlaceholderPage title='Content Scanning' />} />
                      {/* Developer & API */}
                      <Route path='/admin/developer/portal' element={<PlaceholderPage title='Developer Portal' />} />
                      <Route path='/admin/developer/api-keys' element={<PlaceholderPage title='API Key Management' />} />
                      <Route path='/admin/developer/api-versioning' element={<PlaceholderPage title='API Versioning' />} />
                      {/* Quotas & Quality */}
                      <Route path='/admin/quotas/management' element={<PlaceholderPage title='Quota Management' />} />
                      <Route path='/admin/quotas/abuse-monitoring' element={<PlaceholderPage title='Abuse Monitoring' />} />
                      <Route path='/admin/quotas/self-serve-upgrade' element={<PlaceholderPage title='Self-Serve Upgrade' />} />
                      <Route path='/admin/quality/performance' element={<PlaceholderPage title='Performance Monitoring' />} />
                      <Route path='/admin/quality/slos' element={<PlaceholderPage title='SLO Management' />} />
                      <Route path='/admin/quality/security-scanning' element={<PlaceholderPage title='Security Scanning' />} />
                      {/* Admin base routes */}
                      <Route path='/admin/roles' element={<PlaceholderPage title='Role Management' />} />
                      <Route path='/admin/settings' element={<PlaceholderPage title='Admin Settings' />} />
                      <Route path='/admin/audit-logs' element={<PlaceholderPage title='Audit Logs' />} />
                      {/* Profile/Help */}
                      <Route path='/profile' element={<PlaceholderPage title='Profile' />} />
                      <Route path='/help' element={<PlaceholderPage title='Help & Support' />} />
                    </Route>
                    {/* Fallback under layout */}
                    <Route path='*' element={<MainLayout />} />
                  </Routes>
                </Suspense>
              </RoutePreloader>
            </Router>
            <GlobalSnackbar />
          </ErrorBoundary>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
