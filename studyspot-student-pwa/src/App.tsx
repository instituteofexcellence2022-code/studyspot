import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { useState } from 'react';

// Auth Provider
import { AuthProvider } from './contexts/AuthContext';

// Protected Route
import ProtectedRoute from './components/ProtectedRoute';

// Premium Theme
import { premiumTheme } from './theme/premiumTheme';

// Auth Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Premium Mobile-Optimized Pages
import DashboardPremium from './pages/DashboardPremium';
import LibrariesPremium from './pages/LibrariesPremium';
import BookingsMobile from './pages/BookingsMobile';
import ProfileMobile from './pages/ProfileMobile';
import RewardsMobile from './pages/RewardsMobile';

// Other Pages (will use mobile layout)
import LibraryDetailsPageEnhanced from './pages/CompactLibraryDetailsPage';
import CreateBookingPage from './pages/CreateBookingPage';
import QRAttendanceScanner from './pages/QRAttendanceScanner';
import AttendancePage from './pages/AttendancePage';
import StudyTimerPage from './pages/StudyTimerPage';
import PaymentsPage from './pages/PaymentsPage';
import ResourcesPage from './pages/ResourcesPage';
import IssuesPage from './pages/IssuesPage';
import SupportPage from './pages/SupportPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import ReferralPage from './pages/ReferralPage';
import AnalyticsPage from './pages/AnalyticsPage';
import TasksGoalsPage from './pages/TasksGoalsPage';
import CommunityPage from './pages/EnhancedCommunityPage';
import FavoritesPage from './pages/FavoritesPage';
import ManageBookingsPage from './pages/ManageBookingsPage';
import ReviewsPage from './pages/ReviewsPage';
import MessagesPage from './pages/MessagesPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token');
  });

  // Use premium theme
  const theme = premiumTheme;

  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes - Mobile Optimized */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPremium setIsAuthenticated={setIsAuthenticated} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/libraries"
              element={
                <ProtectedRoute>
                  <LibrariesPremium setIsAuthenticated={setIsAuthenticated} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/libraries/:id"
              element={
                <ProtectedRoute>
                  <LibraryDetailsPageEnhanced />
                </ProtectedRoute>
              }
            />
            <Route
              path="/libraries/:id/book"
              element={
                <ProtectedRoute>
                  <CreateBookingPage setIsAuthenticated={setIsAuthenticated} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookings"
              element={
                <ProtectedRoute>
                  <BookingsMobile setIsAuthenticated={setIsAuthenticated} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfileMobile setIsAuthenticated={setIsAuthenticated} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rewards"
              element={
                <ProtectedRoute>
                  <RewardsMobile setIsAuthenticated={setIsAuthenticated} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/qr-scanner"
              element={
                <ProtectedRoute>
                  <QRAttendanceScanner setIsAuthenticated={setIsAuthenticated} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance"
              element={
                <ProtectedRoute>
                  <AttendancePage setIsAuthenticated={setIsAuthenticated} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/study-timer"
              element={
                <ProtectedRoute>
                  <StudyTimerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payments"
              element={
                <ProtectedRoute>
                  <PaymentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resources"
              element={
                <ProtectedRoute>
                  <ResourcesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/issues"
              element={
                <ProtectedRoute>
                  <IssuesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/support"
              element={
                <ProtectedRoute>
                  <SupportPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/announcements"
              element={
                <ProtectedRoute>
                  <AnnouncementsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/referral"
              element={
                <ProtectedRoute>
                  <ReferralPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks-goals"
              element={
                <ProtectedRoute>
                  <TasksGoalsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/community"
              element={
                <ProtectedRoute>
                  <CommunityPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <FavoritesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-bookings"
              element={
                <ProtectedRoute>
                  <ManageBookingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reviews"
              element={
                <ProtectedRoute>
                  <ReviewsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <MessagesPage setIsAuthenticated={setIsAuthenticated} />
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
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          style={{ top: '70px' }}
        />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
