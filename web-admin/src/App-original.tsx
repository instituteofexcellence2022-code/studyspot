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

import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { store, persistor } from './store';
import { queryClient } from './config/react-query';
import { ROUTES } from './constants';
import { useAppSelector } from './hooks/redux';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Common Components
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';
import GlobalSnackbar from './components/common/GlobalSnackbar';
import RoutePreloader from './components/common/RoutePreloader';

// ============================================
// LAZY LOADED PAGES - Code Splitting
// ============================================

// Authentication Pages
const LoginPage = lazy(() => import('./pages/auth/CleanLoginPage'));

// Platform Dashboard
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const EnhancedDashboardPage = lazy(() => import('./pages/dashboard/EnhancedDashboardPage'));
const AIServiceManagementPage = lazy(() => import('./pages/admin/AIServiceManagementPage'));
const AnalyticsServiceManagementPage = lazy(() => import('./pages/admin/AnalyticsServiceManagementPage'));
const AutomationServiceManagementPage = lazy(() => import('./pages/admin/AutomationServiceManagementPage'));
const CommunicationServiceManagementPage = lazy(() => import('./pages/admin/CommunicationServiceManagementPage'));
const CRMServiceManagementPage = lazy(() => import('./pages/admin/CRMServiceManagementPage'));
const DataPipelineServiceManagementPage = lazy(() => import('./pages/admin/DataPipelineServiceManagementPage'));
const FaceRecognitionServiceManagementPage = lazy(() => import('./pages/admin/FaceRecognitionServiceManagementPage'));
const MLServiceManagementPage = lazy(() => import('./pages/admin/MLServiceManagementPage'));
const NotificationServiceManagementPage = lazy(() => import('./pages/admin/NotificationServiceManagementPage'));
const PaymentServiceManagementPage = lazy(() => import('./pages/admin/PaymentServiceManagementPage'));
const I18nServiceManagementPage = lazy(() => import('./pages/admin/I18nServiceManagementPage'));

// Tenant/Library Management
const AdminTenantsPage = lazy(() => import('./pages/admin/AdminTenantsPage'));
const AdminTenantDetailsPage = lazy(() => import('./pages/admin/AdminTenantDetailsPage'));
const TenantManagementPage = lazy(() => import('./pages/tenants/TenantManagementPage'));

// Billing & Revenue Management
const RevenueManagementPage = lazy(() => import('./pages/billing/RevenueManagementPage'));

// Security & Compliance Management
const SecurityManagementPage = lazy(() => import('./pages/security/SecurityManagementPage'));
const MFAManagementPage = lazy(() => import('./pages/security/MFAManagementPage'));
const SSOIntegrationPage = lazy(() => import('./pages/security/SSOIntegrationPage'));
const RBACManagementPage = lazy(() => import('./pages/security/RBACManagementPage'));

// Feature Flags & Experiments
const FeatureFlagManagementPage = lazy(() => import('./pages/features/FeatureFlagManagementPage'));
const ABTestingPage = lazy(() => import('./pages/features/ABTestingPage'));

// Messaging & Communication
const EmailTemplateManagementPage = lazy(() => import('./pages/messaging/EmailTemplateManagementPage'));
const PushNotificationManagementPage = lazy(() => import('./pages/messaging/PushNotificationManagementPage'));
const CampaignManagementPage = lazy(() => import('./pages/messaging/CampaignManagementPage'));
const CreditWalletManagementPage = lazy(() => import('./pages/messaging/CreditWalletManagementPage'));

// Webhooks & Integrations
const WebhookManagementPage = lazy(() => import('./pages/integrations/WebhookManagementPage'));
const IntegrationRegistryPage = lazy(() => import('./pages/integrations/IntegrationRegistryPage'));

// Operations & SRE
const SystemHealthPage = lazy(() => import('./pages/operations/SystemHealthPage'));
const IncidentManagementPage = lazy(() => import('./pages/operations/IncidentManagementPage'));

// Compliance & Privacy
const ConsentManagementPage = lazy(() => import('./pages/compliance/ConsentManagementPage'));
const DataSubjectRequestsPage = lazy(() => import('./pages/compliance/DataSubjectRequestsPage'));

// Attendance & IoT
const AttendanceManagementPage = lazy(() => import('./pages/attendance/AttendanceManagementPage'));
const IoTDeviceManagementPage = lazy(() => import('./pages/attendance/IoTDeviceManagementPage'));

// Policy Engine
const PolicyEnginePage = lazy(() => import('./pages/policy/PolicyEnginePage'));
const AutomationWorkflowsPage = lazy(() => import('./pages/policy/AutomationWorkflowsPage'));

// Analytics & BI
const BusinessIntelligencePage = lazy(() => import('./pages/analytics/BusinessIntelligencePage'));
const AdvancedAnalyticsPage = lazy(() => import('./pages/analytics/AdvancedAnalyticsPage'));

// ML Platform
const MLPlatformPage = lazy(() => import('./pages/ml/MLPlatformPage'));
const FeatureStorePage = lazy(() => import('./pages/ml/FeatureStorePage'));
const ModelRegistryPage = lazy(() => import('./pages/ml/ModelRegistryPage'));

// Search, Files & Content
const SearchEnginePage = lazy(() => import('./pages/search/SearchEnginePage'));
const FileManagementPage = lazy(() => import('./pages/search/FileManagementPage'));
const ContentScanningPage = lazy(() => import('./pages/search/ContentScanningPage'));

// Developer Portal & API Management
const DeveloperPortalPage = lazy(() => import('./pages/developer/DeveloperPortalPage'));
const APIKeyManagementPage = lazy(() => import('./pages/developer/APIKeyManagementPage'));
const APIVersioningPage = lazy(() => import('./pages/developer/APIVersioningPage'));

// Free Tier & Quotas
const QuotaManagementPage = lazy(() => import('./pages/quotas/QuotaManagementPage'));
const AbuseMonitoringPage = lazy(() => import('./pages/quotas/AbuseMonitoringPage'));
const SelfServeUpgradePage = lazy(() => import('./pages/quotas/SelfServeUpgradePage'));

// Non-Functional Requirements & Quality
const PerformanceMonitoringPage = lazy(() => import('./pages/quality/PerformanceMonitoringPage'));
const SLOManagementPage = lazy(() => import('./pages/quality/SLOManagementPage'));
const SecurityScanningPage = lazy(() => import('./pages/quality/SecurityScanningPage'));

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
      main: '#1e40af', // Professional navy blue
      light: '#3b82f6',
      dark: '#1e3a8a'},
    secondary: {
      main: '#6b7280', // Professional gray
      light: '#9ca3af',
      dark: '#4b5563'},
    error: {
      main: '#dc2626'},
    warning: {
      main: '#d97706'},
    success: {
      main: '#16a34a'},
    info: {
      main: '#0ea5e9'},
    background: {
      default: '#f8fafc',
      paper: '#ffffff'},
    text: {
      primary: '#1f2937',
      secondary: '#6b7280'}},
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600}},
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(30, 64, 175, 0.2)'}}}},
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          background: '#ffffff'}}},
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: '#1e40af',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'}}},
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: '#ffffff',
          borderRight: '1px solid #e5e7eb'}}}}});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#1e40af'},
    secondary: {
      main: '#9ca3af',
      light: '#d1d5db',
      dark: '#6b7280'},
    error: {
      main: '#f87171'},
    warning: {
      main: '#fbbf24'},
    success: {
      main: '#34d399'},
    info: {
      main: '#22d3ee'},
    background: {
      default: '#111827',
      paper: '#1f2937'},
    text: {
      primary: '#f9fafb',
      secondary: '#d1d5db'}},
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600}},
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'}}}},
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
          border: '1px solid #374151',
          background: '#1f2937'}}},
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: '#1e40af',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'}}},
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: '#1f2937',
          borderRight: '1px solid #374151'}}}}});

// ============================================
// MAIN APP COMPONENT
// ============================================

const AppContent: React.FC = () => {
  const theme = useAppSelector((state) => state?.ui?.theme || 'light');
  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;

  // Register Service Worker for caching
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration);
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error);
        });
    }
  }, []);

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
      <GlobalSnackbar />
      <Router>
        <RoutePreloader>
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
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              {/* Platform Dashboard */}
              <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />
              <Route path={ROUTES.DASHBOARD} element={<EnhancedDashboardPage />} />
              <Route path="/dashboard/basic" element={<DashboardPage />} />

              {/* ============================================ */}
              {/* MICROSERVICES MANAGEMENT */}
              {/* AI, Analytics, Automation, Communication, etc. */}
              {/* ============================================ */}
              <Route path="/admin/ai-service" element={<AIServiceManagementPage />} />
              <Route path="/admin/analytics-service" element={<AnalyticsServiceManagementPage />} />
              <Route path="/admin/automation-service" element={<AutomationServiceManagementPage />} />
              <Route path="/admin/communication-service" element={<CommunicationServiceManagementPage />} />
              <Route path="/admin/crm-service" element={<CRMServiceManagementPage />} />
              <Route path="/admin/data-pipeline" element={<DataPipelineServiceManagementPage />} />
              <Route path="/admin/face-recognition" element={<FaceRecognitionServiceManagementPage />} />
              <Route path="/admin/ml-service" element={<MLServiceManagementPage />} />
              <Route path="/admin/notification-service" element={<NotificationServiceManagementPage />} />
      <Route path="/admin/payment-service" element={<PaymentServiceManagementPage />} />
      <Route path="/admin/i18n-service" element={<I18nServiceManagementPage />} />

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
              {/* BILLING & REVENUE MANAGEMENT */}
              {/* MRR, ARR, subscriptions, dunning, analytics */}
              {/* ============================================ */}
              <Route path="/admin/revenue" element={<RevenueManagementPage />} />

              {/* ============================================ */}
              {/* SECURITY & COMPLIANCE MANAGEMENT */}
              {/* Security events, compliance, audit, privacy */}
              {/* ============================================ */}
              <Route path="/admin/security" element={<SecurityManagementPage />} />
            <Route path="/admin/security/mfa" element={<MFAManagementPage />} />
            <Route path="/admin/security/sso" element={<SSOIntegrationPage />} />
              <Route path="/admin/security/rbac" element={<RBACManagementPage />} />

              {/* ============================================ */}
              {/* FEATURE FLAGS & EXPERIMENTS */}
              {/* Feature flags, A/B testing, gradual rollouts */}
              {/* ============================================ */}
              <Route path="/admin/features/flags" element={<FeatureFlagManagementPage />} />
              <Route path="/admin/features/experiments" element={<ABTestingPage />} />

              {/* ============================================ */}
              {/* MESSAGING & COMMUNICATION */}
              {/* Email templates, push notifications, campaigns, credit wallets */}
              {/* ============================================ */}
              <Route path="/admin/messaging/email-templates" element={<EmailTemplateManagementPage />} />
              <Route path="/admin/messaging/push-notifications" element={<PushNotificationManagementPage />} />
              <Route path="/admin/messaging/campaigns" element={<CampaignManagementPage />} />
              <Route path="/admin/messaging/credit-wallets" element={<CreditWalletManagementPage />} />

              {/* ============================================ */}
              {/* WEBHOOKS & INTEGRATIONS */}
              {/* Webhook management, integration registry, API management */}
              {/* ============================================ */}
              <Route path="/admin/integrations/webhooks" element={<WebhookManagementPage />} />
              <Route path="/admin/integrations/registry" element={<IntegrationRegistryPage />} />

              {/* ============================================ */}
              {/* OPERATIONS & SRE */}
              {/* System health, incidents, releases, DR/backups, FinOps */}
              {/* ============================================ */}
              <Route path="/admin/operations/health" element={<SystemHealthPage />} />
              <Route path="/admin/operations/incidents" element={<IncidentManagementPage />} />

              {/* ============================================ */}
              {/* COMPLIANCE & PRIVACY */}
              {/* Consent management, DSRs, retention, classification, audit packs */}
              {/* ============================================ */}
              <Route path="/admin/compliance/consent" element={<ConsentManagementPage />} />
              <Route path="/admin/compliance/dsr" element={<DataSubjectRequestsPage />} />

              {/* ============================================ */}
              {/* ATTENDANCE & IOT */}
              {/* QR + Face attendance, fraud/liveness, device registry, OTA */}
              {/* ============================================ */}
              <Route path="/admin/attendance/management" element={<AttendanceManagementPage />} />
              <Route path="/admin/attendance/devices" element={<IoTDeviceManagementPage />} />

              {/* ============================================ */}
              {/* POLICY ENGINE */}
              {/* Rules engine and automations for billing, security, ops */}
              {/* ============================================ */}
              <Route path="/admin/policy/engine" element={<PolicyEnginePage />} />
              <Route path="/admin/policy/workflows" element={<AutomationWorkflowsPage />} />

              {/* ============================================ */}
              {/* ANALYTICS & BI */}
              {/* BI dashboards, reports, anomaly detection, exports */}
              {/* ============================================ */}
              <Route path="/admin/analytics/bi" element={<BusinessIntelligencePage />} />
              <Route path="/admin/analytics/advanced" element={<AdvancedAnalyticsPage />} />

              {/* ============================================ */}
              {/* ML PLATFORM */}
              {/* Feature store, model registry, training, monitoring */}
              {/* ============================================ */}
              <Route path="/admin/ml/platform" element={<MLPlatformPage />} />
              <Route path="/admin/ml/features" element={<FeatureStorePage />} />
              <Route path="/admin/ml/models" element={<ModelRegistryPage />} />

              {/* Search, Files & Content */}
              <Route path="/admin/search/engine" element={<SearchEnginePage />} />
              <Route path="/admin/search/files" element={<FileManagementPage />} />
              <Route path="/admin/search/scanning" element={<ContentScanningPage />} />

              {/* Developer Portal & API Management */}
              <Route path="/admin/developer/portal" element={<DeveloperPortalPage />} />
              <Route path="/admin/developer/api-keys" element={<APIKeyManagementPage />} />
              <Route path="/admin/developer/api-versioning" element={<APIVersioningPage />} />

              {/* Free Tier & Quotas */}
              <Route path="/admin/quotas/management" element={<QuotaManagementPage />} />
              <Route path="/admin/quotas/abuse-monitoring" element={<AbuseMonitoringPage />} />
              <Route path="/admin/quotas/self-serve-upgrade" element={<SelfServeUpgradePage />} />

              {/* Non-Functional Requirements & Quality */}
              <Route path="/admin/quality/performance" element={<PerformanceMonitoringPage />} />
              <Route path="/admin/quality/slos" element={<SLOManagementPage />} />
              <Route path="/admin/quality/security-scanning" element={<SecurityScanningPage />} />

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
        </RoutePreloader>
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
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <PersistGate loading={<LoadingSpinner message="Initializing Platform Admin..." />} persistor={persistor}>
            <AppContent />
            {/* React Query Devtools - Only in development */}
            {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
          </PersistGate>
        </Provider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;






