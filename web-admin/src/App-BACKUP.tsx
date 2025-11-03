import React, { Suspense, useEffect, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// Eagerly load critical components
import ErrorBoundary from './components/common/ErrorBoundary';
import GlobalSnackbar from './components/common/GlobalSnackbar';
import PlaceholderPage from './components/common/PlaceholderPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import RouteFallback from './components/common/RouteFallback';
import RoutePreloader from './components/common/RoutePreloader';
import { STORAGE_KEYS } from './constants';
import { store, persistor } from './store';
import { getProfile } from './store/slices/authSlice';
import theme from './theme';

// Lazy load heavy components for better performance
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
const MainLayout = lazy(() => import('./layouts/MainLayout'));

// Lazy load auth pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const EmailVerificationPage = lazy(() => import('./pages/auth/EmailVerificationPage'));

// Lazy load admin pages
const AdminTenantsPage = lazy(() => import('./pages/admin/AdminTenantsPage'));
const AdminTenantDetailsPage = lazy(() => import('./pages/admin/AdminTenantDetailsPage'));

const App: React.FC = () => {
  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

    if (token) {
      void store.dispatch(getProfile());
    }
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ErrorBoundary>
            <Router>
              <RoutePreloader>
                <Suspense fallback={<RouteFallback />}>
                  <Routes>
                    <Route path='/login' element={<LoginPage />} />
                    <Route path='/register' element={<RegisterPage />} />
                    <Route
                      path='/forgot-password'
                      element={<ForgotPasswordPage />}
                    />
                    <Route
                      path='/verify-email'
                      element={<EmailVerificationPage />}
                    />

                    <Route
                      element={
                        <ProtectedRoute requiredRole={['super_admin', 'admin']}>
                          <MainLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route index element={<AdminDashboard />} />
                      <Route path='/admin' element={<AdminDashboard />} />
                      <Route path='/dashboard' element={<AdminDashboard />} />
                      <Route
                        path='/admin/tenants'
                        element={<AdminTenantsPage />}
                      />
                      <Route
                        path='/admin/tenants/:id'
                        element={<AdminTenantDetailsPage />}
                      />
                      <Route
                        path='/admin/settings'
                        element={<PlaceholderPage title='Admin Settings' />}
                      />
                      <Route
                        path='/profile'
                        element={<PlaceholderPage title='Profile' />}
                      />
                      <Route
                        path='/help'
                        element={<PlaceholderPage title='Help & Support' />}
                      />
                    </Route>

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
