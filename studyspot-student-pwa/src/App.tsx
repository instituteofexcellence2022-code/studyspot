import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { useState, useEffect } from 'react';
import * as React from 'react';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPageEnhanced from './pages/DashboardPageEnhanced';
import LibrariesPageEnhanced from './pages/LibrariesPageEnhanced';
import LibraryDetailsPageEnhanced from './pages/LibraryDetailsPageEnhanced';
import BookingsPage from './pages/BookingsPage';
import ProfilePageEnhanced from './pages/ProfilePageEnhanced';
import QRScannerPage from './pages/QRScannerPage';
import AttendancePage from './pages/AttendancePage';
import StudyTimerPage from './pages/StudyTimerPage';
import RewardsPage from './pages/RewardsPage';

// Dev Bypass Component
function DevBypass({ setIsAuthenticated }: { setIsAuthenticated: (value: boolean) => void }) {
  React.useEffect(() => {
    localStorage.setItem('bypassAuth', 'true');
    const mockUser = {
      id: 'dev-user-123',
      email: 'dev@studyspot.com',
      firstName: 'Dev',
      lastName: 'User',
      role: 'student'
    };
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', 'dev-mock-token-bypass');
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
        <p>Bypassing authentication...</p>
      </div>
    </div>
  );
}

// Theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb',
    },
    secondary: {
      main: '#10b981',
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
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    
    // DEV MODE: Check for bypass flag
    const bypassAuth = localStorage.getItem('bypassAuth');
    if (bypassAuth === 'true') {
      setIsAuthenticated(true);
      // Create mock user if not exists
      if (!localStorage.getItem('user')) {
        const mockUser = {
          id: 'dev-user-123',
          email: 'dev@studyspot.com',
          firstName: 'Dev',
          lastName: 'User',
          role: 'student'
        };
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('token', 'dev-mock-token-bypass');
      }
    }
  }, []);

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
          <Route path="/dashboard" element={isAuthenticated ? <DashboardPageEnhanced setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />} />
          <Route path="/libraries" element={isAuthenticated ? <LibrariesPageEnhanced setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />} />
          <Route path="/libraries/:id" element={isAuthenticated ? <LibraryDetailsPageEnhanced setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />} />
          <Route path="/bookings" element={isAuthenticated ? <BookingsPage setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />} />
          <Route path="/profile" element={isAuthenticated ? <ProfilePageEnhanced setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />} />
          <Route path="/qr-scanner" element={isAuthenticated ? <QRScannerPage setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />} />
          <Route path="/attendance" element={isAuthenticated ? <AttendancePage setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />} />
          <Route path="/study-timer" element={isAuthenticated ? <StudyTimerPage setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />} />
          <Route path="/rewards" element={isAuthenticated ? <RewardsPage setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />} />

          {/* Default Route */}
          <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

