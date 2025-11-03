import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { useState, useEffect, useMemo } from 'react';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPageEnhanced from './pages/DashboardEnhancedV2';
import LibrariesPageEnhanced from './pages/LibrariesPageEnhanced';
import LibraryDetailsPageEnhanced from './pages/LibraryDetailsPageEnhanced';
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

// Dev Bypass Component
function DevBypass({ setIsAuthenticated }: { setIsAuthenticated: (value: boolean) => void }) {
  useEffect(() => {
    const mockUser = {
      id: 'dev-user-123',
      email: 'dev@studyspot.com',
      firstName: 'Dev',
      lastName: 'User',
      role: 'student',
      phone: '9999999999',
    };
    localStorage.clear(); // Clear all previous auth data
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', 'dev-mock-token-bypass');
    localStorage.setItem('bypassAuth', 'true');
    setIsAuthenticated(true);
    window.location.href = '/dashboard';
  }, [setIsAuthenticated]);
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <h2>🔓 Dev Mode Activated</h2>
        <p>Clearing old auth data and logging in...</p>
      </div>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        try {
          JSON.parse(user); // Validate user data
          setIsAuthenticated(true);
        } catch (e) {
          // Invalid user data, clear everything
          localStorage.clear();
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={!isAuthenticated ? <LoginPage setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" />} />
          <Route path="/dev-bypass" element={<DevBypass setIsAuthenticated={setIsAuthenticated} />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={isAuthenticated ? <DashboardPageEnhanced setIsAuthenticated={setIsAuthenticated} darkMode={darkMode} setDarkMode={setDarkMode} /> : <Navigate to="/login" />} />
          <Route path="/libraries" element={isAuthenticated ? <LibrariesPageEnhanced setIsAuthenticated={setIsAuthenticated} darkMode={darkMode} setDarkMode={setDarkMode} /> : <Navigate to="/login" />} />
          <Route path="/libraries/:id" element={isAuthenticated ? <LibraryDetailsPageEnhanced setIsAuthenticated={setIsAuthenticated} darkMode={darkMode} setDarkMode={setDarkMode} /> : <Navigate to="/login" />} />
          <Route path="/bookings" element={isAuthenticated ? <BookingsPage setIsAuthenticated={setIsAuthenticated} darkMode={darkMode} setDarkMode={setDarkMode} /> : <Navigate to="/login" />} />
          <Route path="/profile" element={isAuthenticated ? <ProfilePageEnhanced setIsAuthenticated={setIsAuthenticated} darkMode={darkMode} setDarkMode={setDarkMode} /> : <Navigate to="/login" />} />
          <Route path="/qr-scanner" element={isAuthenticated ? <QRScannerPage setIsAuthenticated={setIsAuthenticated} darkMode={darkMode} setDarkMode={setDarkMode} /> : <Navigate to="/login" />} />
          <Route path="/attendance" element={isAuthenticated ? <AttendancePage setIsAuthenticated={setIsAuthenticated} darkMode={darkMode} setDarkMode={setDarkMode} /> : <Navigate to="/login" />} />
          <Route path="/study-timer" element={isAuthenticated ? <StudyTimerPage setIsAuthenticated={setIsAuthenticated} darkMode={darkMode} setDarkMode={setDarkMode} /> : <Navigate to="/login" />} />
          <Route path="/rewards" element={isAuthenticated ? <RewardsPage setIsAuthenticated={setIsAuthenticated} darkMode={darkMode} setDarkMode={setDarkMode} /> : <Navigate to="/login" />} />
          <Route path="/payments" element={isAuthenticated ? <PaymentsPage setIsAuthenticated={setIsAuthenticated} darkMode={darkMode} setDarkMode={setDarkMode} /> : <Navigate to="/login" />} />
          <Route path="/resources" element={isAuthenticated ? <ResourcesPage setIsAuthenticated={setIsAuthenticated} darkMode={darkMode} setDarkMode={setDarkMode} /> : <Navigate to="/login" />} />
          <Route path="/issues" element={isAuthenticated ? <IssuesPage setIsAuthenticated={setIsAuthenticated} darkMode={darkMode} setDarkMode={setDarkMode} /> : <Navigate to="/login" />} />
          <Route path="/support" element={isAuthenticated ? <SupportPage setIsAuthenticated={setIsAuthenticated} darkMode={darkMode} setDarkMode={setDarkMode} /> : <Navigate to="/login" />} />
          <Route path="/announcements" element={isAuthenticated ? <AnnouncementsPage setIsAuthenticated={setIsAuthenticated} darkMode={darkMode} setDarkMode={setDarkMode} /> : <Navigate to="/login" />} />
          <Route path="/referral" element={isAuthenticated ? <ReferralPage setIsAuthenticated={setIsAuthenticated} darkMode={darkMode} setDarkMode={setDarkMode} /> : <Navigate to="/login" />} />
          <Route path="/analytics" element={isAuthenticated ? <AnalyticsPage setIsAuthenticated={setIsAuthenticated} darkMode={darkMode} setDarkMode={setDarkMode} /> : <Navigate to="/login" />} />
          <Route path="/tasks-goals" element={isAuthenticated ? <TasksGoalsPage setIsAuthenticated={setIsAuthenticated} darkMode={darkMode} setDarkMode={setDarkMode} /> : <Navigate to="/login" />} />
          <Route path="/community" element={isAuthenticated ? <CommunityPage setIsAuthenticated={setIsAuthenticated} darkMode={darkMode} setDarkMode={setDarkMode} /> : <Navigate to="/login" />} />
          <Route path="/favorites" element={isAuthenticated ? <FavoritesPage setIsAuthenticated={setIsAuthenticated} darkMode={darkMode} setDarkMode={setDarkMode} /> : <Navigate to="/login" />} />
          <Route path="/manage-bookings" element={isAuthenticated ? <ManageBookingsPage setIsAuthenticated={setIsAuthenticated} darkMode={darkMode} setDarkMode={setDarkMode} /> : <Navigate to="/login" />} />
          <Route path="/reviews" element={isAuthenticated ? <ReviewsPage setIsAuthenticated={setIsAuthenticated} darkMode={darkMode} setDarkMode={setDarkMode} /> : <Navigate to="/login" />} />

          {/* Default Route */}
          <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
