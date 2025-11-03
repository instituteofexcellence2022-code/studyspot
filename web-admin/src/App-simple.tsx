import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Typography, Button, Card, CardContent } from '@mui/material';

// Simple theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Simple Admin Dashboard Component
const AdminDashboard: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🎓 STUDYSPOT Admin Portal
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Platform Administration Dashboard
      </Typography>
      
      <Box sx={{ mt: 3, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Tenant Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage library tenants and their settings
            </Typography>
            <Button variant="contained" sx={{ mt: 2 }}>
              Manage Tenants
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View platform analytics and reports
            </Typography>
            <Button variant="contained" sx={{ mt: 2 }}>
              View Analytics
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              User Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage users and permissions
            </Typography>
            <Button variant="contained" sx={{ mt: 2 }}>
              Manage Users
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              System Health
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Monitor system performance and health
            </Typography>
            <Button variant="contained" sx={{ mt: 2 }}>
              View Health
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

// Simple App Component
const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;

