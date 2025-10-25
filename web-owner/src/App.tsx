/**
 * STUDYSPOT - Library Owner & Staff Portal
 * 
 * Target Users: Library Owners, Branch Managers, Staff
 * Features: Library Management, Student Management, Bookings, Analytics, 
 *           Subscriptions, Credits, IoT, Face Recognition
 * 
 * Port: 3000
 * Theme: Blue (#1976d2)
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
import GlobalSnackbar from './components/common/GlobalSnackbar';

// ============================================
// LAZY LOADED PAGES - Code Splitting
// ============================================

// Authentication Pages
const LoginPage = lazy(() => import('./pages/auth/CleanLoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const EmailVerificationPage = lazy(() => import('./pages/auth/EmailVerificationPage'));

// Dashboard
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const EnhancedDashboardPage = lazy(() => import('./pages/dashboard/EnhancedDashboardPage'));

// Library Management (22 Feature Categories)
const LibrariesPage = lazy(() => import('./pages/library/LibrariesPage'));
const LibraryDetailsPage = lazy(() => import('./pages/library/LibraryDetailsPage'));
const LibraryCreatePage = lazy(() => import('./pages/library/LibraryCreatePage'));
const LibraryEditPage = lazy(() => import('./pages/library/LibraryEditPage'));
const SeatsPage = lazy(() => import('./pages/library/SeatsPage'));
const FeePlansPage = lazy(() => import('./pages/subscription/FeePlansPageAdvanced'));
const RevenueManagementPage = lazy(() => import('./pages/revenue/RevenueManagementPage'));

const RevenueAnalyticsPage = lazy(() => import('./pages/revenue/RevenueAnalyticsPage'));
const SubscriptionCreditsPage = lazy(() => import('./pages/subscription/SubscriptionCreditsPage'));
const SeatManagementPage = lazy(() => import('./pages/seats/SeatManagementPage'));
const SmartIoTDashboard = lazy(() => import('./pages/iot/SmartIoTDashboard'));
const FaceRecognitionDashboard = lazy(() => import('./pages/attendance/FaceRecognitionDashboard'));
const ExternalCameraDashboard = lazy(() => import('./components/face-recognition/ExternalCameraDashboard'));

// Booking Management
const BookingsPage = lazy(() => import('./pages/booking/BookingsPage'));
const BookingDetailsPage = lazy(() => import('./pages/booking/BookingDetailsPage'));
const AttendancePage = lazy(() => import('./pages/booking/AttendancePage'));
const BarcodeQRPage = lazy(() => import('./pages/operations/BarcodeQRPage'));
const LeadCapturePage = lazy(() => import('./pages/leads/LeadCapturePage'));

// Student Management
const UsersPage = lazy(() => import('./pages/user/UsersPage'));
const StudentsPage = lazy(() => import('./pages/user/StudentsPageAdvanced'));
const StaffPage = lazy(() => import('./pages/user/StaffPage'));
const UserDetailsPage = lazy(() => import('./pages/user/UserDetailsPage'));
const UserCreatePage = lazy(() => import('./pages/user/UserCreatePage'));
const UserEditPage = lazy(() => import('./pages/user/UserEditPage'));

// Subscription Management (Their subscription to platform)
const SubscriptionPlansPage = lazy(() => import('./pages/subscription/SubscriptionPlansPage'));
const SubscriptionManagePage = lazy(() => import('./pages/subscription/SubscriptionManagePage'));
const SubscriptionCheckoutPage = lazy(() => import('./pages/subscription/SubscriptionCheckoutPage'));
const SubscriptionSuccessPage = lazy(() => import('./pages/subscription/SubscriptionSuccessPage'));
const InvoicesPage = lazy(() => import('./pages/subscription/InvoicesPage'));
const BillingPage = lazy(() => import('./pages/subscription/BillingPage'));

// Credit Management (Purchase SMS/WhatsApp credits)
const CreditDashboardPage = lazy(() => import('./pages/credits/CreditDashboardPage'));
const CreditPurchasePage = lazy(() => import('./pages/credits/CreditPurchasePage'));
const AutoTopupPage = lazy(() => import('./pages/credits/AutoTopupPage'));
const UsageAnalyticsPage = lazy(() => import('./pages/credits/UsageAnalyticsPage'));
const TransactionHistoryPage = lazy(() => import('./pages/credits/TransactionHistoryPage'));

// AI Features (Library Operations)
const AIAssistantPage = lazy(() => import('./pages/ai/AIAssistantPage'));
const RecommendationsPage = lazy(() => import('./pages/ai/RecommendationsPage'));
const PredictiveAnalyticsPage = lazy(() => import('./pages/ai/PredictiveAnalyticsPage'));
const SmartSchedulerPage = lazy(() => import('./pages/ai/SmartSchedulerPage'));

// Issue Management
const IssueManagementPage = lazy(() => import('./pages/issues/IssueManagementPage'));

// Referral & Discount Management
const ReferralDiscountManagementPage = lazy(() => import('./pages/referral/ReferralDiscountManagementPage'));
const OfflinePaymentPage = lazy(() => import('./pages/offline-payments/OfflinePaymentPage'));

// Profile
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage'));

// Common Pages
const HelpPage = lazy(() => import('./pages/common/HelpPage'));
const NotFoundPage = lazy(() => import('./pages/common/NotFoundPage'));

// Organization Management
const OrganizationOnboardingDashboard = lazy(() => import('./pages/onboarding/OrganizationOnboardingDashboard'));
const FeatureControlDashboard = lazy(() => import('./pages/features/FeatureControlDashboard'));

// Invoice & Billing Management
const InvoiceManagementPage = lazy(() => import('./pages/invoice/InvoiceManagementPage'));
const BillingTemplatesPage = lazy(() => import('./pages/billing/BillingTemplatesPage'));

// ============================================
// THEME CONFIGURATION - Library Owner Theme
// ============================================

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // Blue - Professional business theme
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e', // Pink accent
      light: '#f50057',
      dark: '#c51162',
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
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
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
      light: '#e3f2fd',
      dark: '#42a5f5',
    },
    secondary: {
      main: '#f48fb1',
      light: '#ffc1e3',
      dark: '#bf5f82',
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
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        },
      },
    },
  },
});

// ============================================
// MAIN APP COMPONENT
// ============================================

const AppContent: React.FC = () => {
  // Get theme mode from Redux store (persisted)
  const themeMode = useAppSelector((state) => state.theme?.mode || 'light');
  const currentTheme = themeMode === 'dark' ? darkTheme : lightTheme;

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
        theme={themeMode === 'dark' ? 'dark' : 'light'}
      />
      <GlobalSnackbar />
      <Router>
        <Suspense fallback={
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <LoadingSpinner message="Loading Library Portal..." />
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

            {/* ============================================ */}
            {/* PROTECTED ROUTES - Library Owner/Staff Only */}
            {/* ============================================ */}
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              {/* Dashboard */}
              <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />
              <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
              <Route path="/dashboard/enhanced" element={<EnhancedDashboardPage />} />

              {/* ============================================ */}
              {/* LIBRARY MANAGEMENT */}
              {/* ============================================ */}
              <Route path={ROUTES.LIBRARIES} element={<LibrariesPage />} />
              <Route path={ROUTES.LIBRARY_CREATE} element={<LibraryCreatePage />} />
              <Route path={ROUTES.LIBRARY_DETAILS} element={<LibraryDetailsPage />} />
              <Route path={ROUTES.LIBRARY_EDIT} element={<LibraryEditPage />} />
              <Route path={ROUTES.SEATS} element={<SeatsPage />} />
              <Route path={ROUTES.FEE_PLANS} element={<FeePlansPage />} />
              <Route path={ROUTES.STUDENTS} element={<StudentsPage />} />
              <Route path={ROUTES.ATTENDANCE} element={<AttendancePage />} />
              <Route path={ROUTES.BARCODE_QR} element={<BarcodeQRPage />} />
              <Route path={ROUTES.LEAD_CAPTURE} element={<LeadCapturePage />} />
              <Route path={ROUTES.REVENUE_MANAGEMENT} element={<RevenueManagementPage />} />

              <Route path={ROUTES.REVENUE_ANALYTICS} element={<RevenueAnalyticsPage />} />
              <Route path={ROUTES.SUBSCRIPTION_CREDITS} element={<SubscriptionCreditsPage />} />
              <Route path={ROUTES.SEAT_MANAGEMENT} element={<SeatManagementPage />} />
              <Route path="/iot-dashboard" element={<SmartIoTDashboard />} />
              <Route path="/face-recognition" element={<FaceRecognitionDashboard />} />
              <Route path="/external-cameras" element={<ExternalCameraDashboard />} />
              <Route path={ROUTES.STAFF} element={<StaffPage />} />

              {/* ============================================ */}
              {/* BOOKING MANAGEMENT */}
              {/* ============================================ */}
              <Route path={ROUTES.BOOKINGS} element={<BookingsPage />} />
              <Route path={ROUTES.BOOKING_DETAILS} element={<BookingDetailsPage />} />

              {/* ============================================ */}
              {/* STUDENT MANAGEMENT */}
              {/* ============================================ */}
              <Route path={ROUTES.USERS} element={<UsersPage />} />
              <Route path={ROUTES.USER_CREATE} element={<UserCreatePage />} />
              <Route path={ROUTES.USER_DETAILS} element={<UserDetailsPage />} />
              <Route path={ROUTES.USER_EDIT} element={<UserEditPage />} />

              {/* ============================================ */}
              {/* SUBSCRIPTION MANAGEMENT (to Platform) */}
              {/* ============================================ */}
              <Route path={ROUTES.SUBSCRIPTION_PLANS} element={<SubscriptionPlansPage />} />
              <Route path={ROUTES.SUBSCRIPTION_CHECKOUT} element={<SubscriptionCheckoutPage />} />
              <Route path={ROUTES.SUBSCRIPTION_SUCCESS} element={<SubscriptionSuccessPage />} />
              <Route path={ROUTES.SUBSCRIPTION_MANAGE} element={<SubscriptionManagePage />} />
              <Route path={ROUTES.SUBSCRIPTION_INVOICES} element={<InvoicesPage />} />
              <Route path={ROUTES.SUBSCRIPTION_BILLING} element={<BillingPage />} />

              {/* ============================================ */}
              {/* CREDIT MANAGEMENT (Purchase from Platform) */}
              {/* ============================================ */}
              <Route path="/credits" element={<CreditDashboardPage />} />
              <Route path="/credits/purchase" element={<CreditPurchasePage />} />
              <Route path="/credits/auto-topup" element={<AutoTopupPage />} />
              <Route path="/credits/analytics" element={<UsageAnalyticsPage />} />
              <Route path="/credits/transactions" element={<TransactionHistoryPage />} />

              {/* ============================================ */}
              {/* AI FEATURES (Library Operations) */}
              {/* ============================================ */}
              <Route path={ROUTES.AI_ASSISTANT} element={<AIAssistantPage />} />
              <Route path={ROUTES.AI_RECOMMENDATIONS} element={<RecommendationsPage />} />
              <Route path={ROUTES.AI_ANALYTICS} element={<PredictiveAnalyticsPage />} />
              <Route path={ROUTES.AI_SCHEDULER} element={<SmartSchedulerPage />} />

              {/* ============================================ */}
              {/* ISSUE MANAGEMENT */}
              {/* ============================================ */}
              <Route path="/issues" element={<IssueManagementPage />} />

              {/* ============================================ */}
              {/* REFERRAL & DISCOUNT MANAGEMENT */}
              {/* ============================================ */}
              <Route path="/referral-discounts" element={<ReferralDiscountManagementPage />} />
              <Route path="/offline-payments" element={<OfflinePaymentPage />} />

              {/* ============================================ */}
              {/* PROFILE & SETTINGS */}
              {/* ============================================ */}
              <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
              <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
              
              {/* Help & Support */}
              <Route path={ROUTES.HELP} element={<HelpPage />} />
              
              {/* ============================================ */}
              {/* INVOICE & BILLING MANAGEMENT */}
              {/* ============================================ */}
            <Route path={ROUTES.INVOICE_MANAGEMENT} element={<InvoiceManagementPage />} />
            <Route path={ROUTES.BILLING_TEMPLATES} element={<BillingTemplatesPage />} />

              {/* ============================================ */}
              {/* ORGANIZATION MANAGEMENT */}
              {/* ============================================ */}
              <Route path="/onboarding" element={<OrganizationOnboardingDashboard />} />
              <Route path={ROUTES.FEATURE_CONTROL} element={<FeatureControlDashboard />} />
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
        <PersistGate loading={<LoadingSpinner message="Initializing..." />} persistor={persistor}>
          <AppContent />
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
};

export default App;






