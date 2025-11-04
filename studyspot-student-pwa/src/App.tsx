import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { useState, useEffect, useMemo } from 'react';

// Auth Provider
import { AuthProvider } from './contexts/AuthContext';

// Protected Route
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPageEnhanced from './pages/DashboardStudyFocused';
import LibrariesPageEnhanced from './pages/EnhancedLibrariesPage';
import LibraryDetailsPageEnhanced from './pages/LibraryDetailsEnhancedV2';
import BookingsPage from './pages/BookingsPage';
import ProfilePageEnhanced from './pages/ProfilePageEnhanced';
import QRScannerPage from './pages/QRScannerPage';
import AttendancePage from './pages/AttendancePage';
import StudyTimerPage from './pages/StudyTimerPage';
import RewardsPage from './pages/RewardsPage';
import PaymentsPage from './pages/PaymentsPage';
import ResourcesPage from './pages/ResourcesPage';
import IssuesPage from './pages/IssuesPage';
import SupportPage from './pages/SupportPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import ReferralPage from './pages/ReferralPage';
import AnalyticsPage from './pages/AnalyticsPage';
import TasksGoalsPage from './pages/TasksGoalsPage';
import CommunityPage from './pages/CommunityPage';
import FavoritesPage from './pages/FavoritesPage';
import ManageBookingsPage from './pages/ManageBookingsPage';
import ReviewsPage from './pages/ReviewsPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Create theme based on mode
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          primary: {
            main: '#2563eb',
          },
          secondary: {
            main: '#10b981',
          },
          background: {
            default: darkMode ? '#121212' : '#f5f5f5',
            paper: darkMode ? '#1e1e1e' : '#ffffff',
          },
        },
        shape: {
          borderRadius: 8,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 600,
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },
        },
      }),
    [darkMode]
  );

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPageEnhanced darkMode={darkMode} setDarkMode={setDarkMode} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/libraries"
              element={
                <ProtectedRoute>
                  <LibrariesPageEnhanced darkMode={darkMode} setDarkMode={setDarkMode} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/libraries/:id"
              element={
                <ProtectedRoute>
                  <LibraryDetailsPageEnhanced darkMode={darkMode} setDarkMode={setDarkMode} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookings"
              element={
                <ProtectedRoute>
                  <BookingsPage darkMode={darkMode} setDarkMode={setDarkMode} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePageEnhanced darkMode={darkMode} setDarkMode={setDarkMode} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/qr-scanner"
              element={
                <ProtectedRoute>
                  <QRScannerPage darkMode={darkMode} setDarkMode={setDarkMode} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance"
              element={
                <ProtectedRoute>
                  <AttendancePage darkMode={darkMode} setDarkMode={setDarkMode} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/study-timer"
              element={
                <ProtectedRoute>
                  <StudyTimerPage darkMode={darkMode} setDarkMode={setDarkMode} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rewards"
              element={
                <ProtectedRoute>
                  <RewardsPage darkMode={darkMode} setDarkMode={setDarkMode} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payments"
              element={
                <ProtectedRoute>
                  <PaymentsPage darkMode={darkMode} setDarkMode={setDarkMode} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resources"
              element={
                <ProtectedRoute>
                  <ResourcesPage darkMode={darkMode} setDarkMode={setDarkMode} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/issues"
              element={
                <ProtectedRoute>
                  <IssuesPage darkMode={darkMode} setDarkMode={setDarkMode} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/support"
              element={
                <ProtectedRoute>
                  <SupportPage darkMode={darkMode} setDarkMode={setDarkMode} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/announcements"
              element={
                <ProtectedRoute>
                  <AnnouncementsPage darkMode={darkMode} setDarkMode={setDarkMode} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/referral"
              element={
                <ProtectedRoute>
                  <ReferralPage darkMode={darkMode} setDarkMode={setDarkMode} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <AnalyticsPage darkMode={darkMode} setDarkMode={setDarkMode} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks-goals"
              element={
                <ProtectedRoute>
                  <TasksGoalsPage darkMode={darkMode} setDarkMode={setDarkMode} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/community"
              element={
                <ProtectedRoute>
                  <CommunityPage darkMode={darkMode} setDarkMode={setDarkMode} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <FavoritesPage darkMode={darkMode} setDarkMode={setDarkMode} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-bookings"
              element={
                <ProtectedRoute>
                  <ManageBookingsPage darkMode={darkMode} setDarkMode={setDarkMode} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reviews"
              element={
                <ProtectedRoute>
                  <ReviewsPage darkMode={darkMode} setDarkMode={setDarkMode} />
                </ProtectedRoute>
              }
            />

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Catch all - redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
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
          theme={darkMode ? 'dark' : 'light'}
        />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
