import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './config/constants';
import LoadingSpinner from './components/common/LoadingSpinner';
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

// Lazy load pages
const LoginPage = lazy(() => import('./modules/auth/pages/LoginPage'));
const DashboardPage = lazy(() => import('./modules/dashboard/pages/DashboardPage'));
const TenantManagement = lazy(() => import('./modules/tenants/pages/ComprehensiveTenantLibraryManagement'));
const TenantOnboarding = lazy(() => import('./modules/tenants/pages/TenantOnboardingPage'));
const PlatformUsersPage = lazy(() => import('./modules/users/pages/PlatformUsersEnhanced'));
const UserSegmentationPage = lazy(() => import('./modules/users/pages/UserSegmentationPage'));
const AdminUsersPage = lazy(() => import('./modules/users/pages/AdminUsersEnhanced'));
const RevenueDashboard = lazy(() => import('./modules/revenue/pages/RevenueDashboard'));
const RevenueAnalytics = lazy(() => import('./modules/revenue/pages/RevenueAnalytics'));
const CreditManagement = lazy(() => import('./modules/credits/pages/CreditManagement'));
const SubscriptionManagement = lazy(() => import('./modules/subscriptions/pages/SubscriptionManagement'));
const AnalyticsPage = lazy(() => import('./modules/analytics/pages/AnalyticsPage'));
const SettingsPage = lazy(() => import('./modules/settings/pages/SettingsPage'));
const PaymentManagementPage = lazy(() => import('./modules/payments/pages/PaymentManagementComplete'));
const LeadsPage = lazy(() => import('./modules/crm/pages/LeadsPage'));
const SalesTeamDashboard = lazy(() => import('./modules/sales/pages/SalesTeamDashboard'));
const MessagingPage = lazy(() => import('./modules/messaging/pages/MessagingPage'));
const TemplatesPage = lazy(() => import('./modules/messaging/pages/TemplatesPage'));
const TemplateDetailsPage = lazy(() => import('./modules/messaging/pages/TemplateDetailsPage'));
const TemplateEditPage = lazy(() => import('./modules/messaging/pages/TemplateEditPage'));
const SystemHealthPage = lazy(() => import('./modules/system/pages/SystemHealthPage'));
const TicketManagementPage = lazy(() => import('./modules/tickets/pages/TicketManagementPage'));
const TicketDetailsPage = lazy(() => import('./modules/tickets/pages/TicketDetailsPage'));
const AuditLogsPage = lazy(() => import('./modules/audit/pages/AuditLogsPage'));
const RolesPage = lazy(() => import('./modules/roles/pages/RolesPage'));
const NotificationsPage = lazy(() => import('./modules/notifications/pages/NotificationsPage'));

// Student Management
const StudentDashboard = lazy(() => import('./modules/students/pages/StudentDashboard'));
const StudentDetailsPage = lazy(() => import('./modules/students/pages/StudentDetailsPage'));
const StudentAnalyticsPage = lazy(() => import('./modules/students/pages/StudentAnalyticsPage'));
const AttendanceOversightDashboard = lazy(() => import('./modules/attendance/pages/AttendanceOversightDashboard'));
const StaffAttendancePage = lazy(() => import('./modules/staff/pages/StaffAttendancePage'));
const PromotionalMessagingPage = lazy(() => import('./modules/students/pages/PromotionalMessagingPage'));
const FeePlanOversightDashboard = lazy(() => import('./modules/fee-plans/pages/FeePlanOversightDashboard'));
const ReferralLoyaltyDashboard = lazy(() => import('./modules/referrals/pages/ReferralLoyaltyDashboard'));
const CompliancePrivacyDashboard = lazy(() => import('./modules/compliance/pages/CompliancePrivacyDashboard'));

// Library Oversight
const LibraryOversightDashboard = lazy(() => import('./modules/libraries/pages/LibraryOversightDashboard'));
const LibraryDetailsPage = lazy(() => import('./modules/libraries/pages/LibraryDetailsPage'));

const App: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner fullscreen />}>
      <Routes>
        {/* Public routes */}
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        
        {/* Protected routes with layout */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path="/tenants" element={<TenantManagement />} />
          <Route path="/tenants/onboarding" element={<TenantOnboarding />} />
          <Route path="/users/platform" element={<PlatformUsersPage />} />
          <Route path="/users/segmentation" element={<UserSegmentationPage />} />
          <Route path="/users/admin" element={<AdminUsersPage />} />
          <Route path="/students" element={<StudentDashboard />} />
          <Route path="/students/:id" element={<StudentDetailsPage />} />
          <Route path="/students/analytics" element={<StudentAnalyticsPage />} />
          <Route path="/students/messaging" element={<PromotionalMessagingPage />} />
          <Route path="/attendance" element={<AttendanceOversightDashboard />} />
          <Route path="/staff-attendance" element={<StaffAttendancePage />} />
          <Route path="/fee-plans" element={<FeePlanOversightDashboard />} />
          <Route path="/referrals" element={<ReferralLoyaltyDashboard />} />
          <Route path="/compliance" element={<CompliancePrivacyDashboard />} />
          <Route path="/libraries" element={<LibraryOversightDashboard />} />
          <Route path="/libraries/:id" element={<LibraryDetailsPage />} />
          <Route path="/revenue/dashboard" element={<RevenueDashboard />} />
          <Route path="/revenue/analytics" element={<RevenueAnalytics />} />
          <Route path="/payments" element={<PaymentManagementPage />} />
          <Route path="/credits/dashboard" element={<CreditManagement />} />
          <Route path="/subscriptions" element={<SubscriptionManagement />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/crm/leads" element={<LeadsPage />} />
          <Route path="/sales-teams" element={<SalesTeamDashboard />} />
          <Route path="/messaging" element={<MessagingPage />} />
          <Route path="/messaging/templates" element={<TemplatesPage />} />
          <Route path="/messaging/templates/:id" element={<TemplateDetailsPage />} />
          <Route path="/messaging/templates/:id/edit" element={<TemplateEditPage />} />
          <Route path="/system/health" element={<SystemHealthPage />} />
          <Route path="/tickets" element={<TicketManagementPage />} />
          <Route path="/tickets/:id" element={<TicketDetailsPage />} />
          <Route path="/audit-logs" element={<AuditLogsPage />} />
          <Route path="/roles" element={<RolesPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
          <Route path={ROUTES.PROFILE} element={<DashboardPage />} />
        </Route>
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </Suspense>
  );
};

export default App;
