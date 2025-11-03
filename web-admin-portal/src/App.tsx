import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './config/constants';
import LoadingSpinner from './components/common/LoadingSpinner';
import ProtectedRoute from './components/common/ProtectedRoute';
import GlobalSnackbar from './components/common/GlobalSnackbar';

// Layouts
const AuthLayout = lazy(() => import('./layouts/AuthLayout'));
const MainLayout = lazy(() => import('./layouts/MainLayout'));

// Lazy load pages for code splitting
const LoginPage = lazy(() => import('./modules/auth/pages/LoginPage'));
const ForgotPasswordPage = lazy(() => import('./modules/auth/pages/ForgotPasswordPage'));

// Dashboard
const DashboardPlaceholder = lazy(() => import('./modules/dashboard/pages/DashboardPlaceholder'));
const EnhancedDashboard = lazy(() => import('./modules/dashboard/pages/EnhancedDashboard'));

// Tenants
const TenantManagement = lazy(() => import('./modules/tenants/pages/TenantManagement'));
const CreateTenantPage = lazy(() => import('./modules/tenants/pages/CreateTenantPage'));
const TenantDetailsPage = lazy(() => import('./modules/tenants/pages/TenantDetailsPage'));
const EditTenantPage = lazy(() => import('./modules/tenants/pages/EditTenantPage'));

// Users
const UserListPage = lazy(() => import('./modules/users/pages/UserListPage'));
const CreateUserPage = lazy(() => import('./modules/users/pages/CreateUserPage'));
const UserDetailsPage = lazy(() => import('./modules/users/pages/UserDetailsPage'));
const EditUserPage = lazy(() => import('./modules/users/pages/EditUserPage'));

// Analytics
const AnalyticsPage = lazy(() => import('./modules/analytics/pages/AnalyticsPage'));

// Settings
const SettingsPage = lazy(() => import('./modules/settings/pages/SettingsPage'));

// Profile
const ProfilePage = lazy(() => import('./modules/profile/pages/ProfilePage'));

// Reports
const ReportsPage = lazy(() => import('./modules/reports/pages/ReportsPage'));

// Audit Logs
const AuditLogsPage = lazy(() => import('./modules/audit/pages/AuditLogsPage'));

// RBAC
const RolesListPage = lazy(() => import('./modules/rbac/pages/RolesListPage'));
const PermissionsPage = lazy(() => import('./modules/rbac/pages/PermissionsPage'));

// CRM
const CRMDashboard = lazy(() => import('./modules/crm/pages/CRMDashboard'));

// Messaging
const MessagingPage = lazy(() => import('./modules/messaging/pages/MessagingPage'));

// Notifications
const NotificationsPage = lazy(() => import('./modules/notifications/pages/NotificationsPage'));

// Monitoring
const SystemHealthPage = lazy(() => import('./modules/monitoring/pages/SystemHealthPage'));

// Developer Tools
const APIDocumentationPage = lazy(() => import('./modules/developer/pages/APIDocumentationPage'));

// Revenue & Billing
const RevenueDashboard = lazy(() => import('./modules/revenue/pages/RevenueDashboard'));
const SubscriptionPlansPage = lazy(() => import('./modules/revenue/pages/SubscriptionPlansPage'));
const InvoiceManagementPage = lazy(() => import('./modules/revenue/pages/InvoiceManagementPage'));
const PaymentMethodsPage = lazy(() => import('./modules/revenue/pages/PaymentMethodsPage'));
const DunningManagementPage = lazy(() => import('./modules/revenue/pages/DunningManagementPage'));
const RevenueAnalyticsPage = lazy(() => import('./modules/revenue/pages/RevenueAnalyticsPage'));

// Credits & Messaging
const CreditDashboard = lazy(() => import('./modules/credits/pages/CreditDashboard'));

// Subscriptions
const SubscriptionManagement = lazy(() => import('./modules/subscriptions/pages/SubscriptionManagement'));

// Payments
const PaymentManagement = lazy(() => import('./modules/payments/pages/PaymentManagement'));

const App: React.FC = () => {
  return (
    <>
      <Suspense fallback={<LoadingSpinner fullscreen message="Loading..." />}>
        <Routes>
          {/* Public Routes - Auth Layout */}
          <Route path={ROUTES.LOGIN} element={<AuthLayout><LoginPage /></AuthLayout>} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<AuthLayout><ForgotPasswordPage /></AuthLayout>} />

          {/* Protected Routes - Main Layout */}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path={ROUTES.DASHBOARD} element={<EnhancedDashboard />} />
            
            {/* Tenant Routes */}
            <Route path="/tenants" element={<TenantManagement />} />
            <Route path="/tenants/create" element={<CreateTenantPage />} />
            <Route path="/tenants/:id" element={<TenantDetailsPage />} />
            <Route path="/tenants/:id/edit" element={<EditTenantPage />} />
            
            {/* User Routes */}
            <Route path="/users" element={<UserListPage />} />
            <Route path="/users/create" element={<CreateUserPage />} />
            <Route path="/users/:id" element={<UserDetailsPage />} />
            <Route path="/users/:id/edit" element={<EditUserPage />} />
            
            {/* Analytics Routes */}
            <Route path="/analytics" element={<AnalyticsPage />} />
            
            {/* Settings Routes */}
            <Route path="/settings" element={<SettingsPage />} />
            
            {/* Profile Routes */}
            <Route path="/profile" element={<ProfilePage />} />
            
            {/* Reports Routes */}
            <Route path="/reports" element={<ReportsPage />} />
            
            {/* Audit Logs Routes */}
            <Route path="/audit-logs" element={<AuditLogsPage />} />
            
            {/* RBAC Routes */}
            <Route path="/rbac/roles" element={<RolesListPage />} />
            <Route path="/rbac/permissions" element={<PermissionsPage />} />
            
            {/* CRM Routes */}
            <Route path="/crm" element={<CRMDashboard />} />
            
            {/* Messaging Routes */}
            <Route path="/messaging" element={<MessagingPage />} />
            
            {/* Notifications Routes */}
            <Route path="/notifications" element={<NotificationsPage />} />
            
            {/* Monitoring Routes */}
            <Route path="/system-health" element={<SystemHealthPage />} />
            
                {/* Developer Tools Routes */}
                <Route path="/api-docs" element={<APIDocumentationPage />} />
                
                {/* Revenue & Billing Routes */}
                <Route path="/revenue/dashboard" element={<RevenueDashboard />} />
                <Route path="/revenue/plans" element={<SubscriptionPlansPage />} />
                <Route path="/revenue/invoices" element={<InvoiceManagementPage />} />
                <Route path="/revenue/payment-methods" element={<PaymentMethodsPage />} />
                <Route path="/revenue/dunning" element={<DunningManagementPage />} />
                <Route path="/revenue/analytics" element={<RevenueAnalyticsPage />} />
                
                {/* Credits & Messaging Routes */}
                <Route path="/credits/dashboard" element={<CreditDashboard />} />
                
                {/* Subscription Management Routes */}
                <Route path="/subscriptions" element={<SubscriptionManagement />} />
            
            {/* Payment Routes */}
            <Route path="/payments" element={<PaymentManagement />} />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          
          {/* 404 - Redirect to dashboard */}
          <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        </Routes>
      </Suspense>

      {/* Global Snackbar for notifications */}
      <GlobalSnackbar />
    </>
  );
};

export default App;


