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

// Library Pages (Student View - Browse & Search)
const LibrariesPage = lazy(() => import('./pages/library/LibrariesPage'));
const LibraryDetailsPage = lazy(() => import('./pages/library/LibraryDetailsPage'));

// Booking Pages (Student Bookings)
const BookingsPage = lazy(() => import('./pages/booking/BookingsPage'));
const BookingDetailsPage = lazy(() => import('./pages/booking/BookingDetailsPage'));

// AI Pages (Student AI Features)
const AIAssistantPage = lazy(() => import('./pages/ai/AIAssistantPage'));
const RecommendationsPage = lazy(() => import('./pages/ai/RecommendationsPage'));

// Subscription Pages (Student Plans)
const SubscriptionPlansPage = lazy(() => import('./pages/subscription/SubscriptionPlansPage'));
const SubscriptionCheckoutPage = lazy(() => import('./pages/subscription/SubscriptionCheckoutPage'));
const SubscriptionSuccessPage = lazy(() => import('./pages/subscription/SubscriptionSuccessPage'));
const SubscriptionManagePage = lazy(() => import('./pages/subscription/SubscriptionManagePage'));
const InvoicesPage = lazy(() => import('./pages/subscription/InvoicesPage'));

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

            {/* Library Routes - Student View (Browse & Search Only) */}
            <Route path={ROUTES.LIBRARIES} element={<LibrariesPage />} />
            <Route path={ROUTES.LIBRARY_DETAILS} element={<LibraryDetailsPage />} />

            {/* Booking Routes - Student Bookings */}
            <Route path={ROUTES.BOOKINGS} element={<BookingsPage />} />
            <Route path={ROUTES.BOOKING_DETAILS} element={<BookingDetailsPage />} />

            {/* AI Features - Student AI Assistant & Recommendations */}
            <Route path={ROUTES.AI_ASSISTANT} element={<AIAssistantPage />} />
            <Route path={ROUTES.AI_RECOMMENDATIONS} element={<RecommendationsPage />} />

            {/* Subscription Routes - Student Plans & Billing */}
            <Route path={ROUTES.SUBSCRIPTION_PLANS} element={<SubscriptionPlansPage />} />
            <Route path={ROUTES.SUBSCRIPTION_CHECKOUT} element={<SubscriptionCheckoutPage />} />
            <Route path={ROUTES.SUBSCRIPTION_SUCCESS} element={<SubscriptionSuccessPage />} />
            <Route path={ROUTES.SUBSCRIPTION_MANAGE} element={<SubscriptionManagePage />} />
            <Route path={ROUTES.SUBSCRIPTION_INVOICES} element={<InvoicesPage />} />

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