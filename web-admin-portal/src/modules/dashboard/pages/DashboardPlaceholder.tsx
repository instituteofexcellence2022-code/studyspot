// ============================================
// DASHBOARD PLACEHOLDER
// ============================================

import React from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Assessment as AssessmentIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { logout } from '../../../store/slices/authSlice';
import { showSuccess } from '../../../store/slices/uiSlice';

const DashboardPlaceholder: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logout());
    dispatch(showSuccess('Logged out successfully'));
  };

  const stats = [
    {
      title: 'Total Tenants',
      value: '156',
      icon: <BusinessIcon sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
    },
    {
      title: 'Active Users',
      value: '2,543',
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#2196f3',
    },
    {
      title: 'Total Revenue',
      value: '$45,231',
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
      color: '#4caf50',
    },
    {
      title: 'Active Sessions',
      value: '891',
      icon: <DashboardIcon sx={{ fontSize: 40 }} />,
      color: '#ff9800',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Paper
          elevation={3}
          sx={{
            p: 3,
            mb: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Welcome back, {user?.name || user?.email}!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Role: {user?.role} {user?.role === 'super_admin' && '⭐'}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Paper>

        {/* Stats Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
          {stats.map((stat) => (
            <Card
              key={stat.title}
              elevation={3}
              sx={{
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>
                  <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Main Content */}
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center' }}>
            <DashboardIcon
              sx={{ fontSize: 80, color: 'primary.main', mb: 2 }}
            />
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Dashboard Under Construction
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              The full dashboard with charts, analytics, and detailed metrics is currently being built.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
              ✅ Authentication working perfectly!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ✅ Protected routes functional!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ✅ Redux state management active!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              ✅ Theme and UI components ready!
            </Typography>

            <Box
              sx={{
                mt: 4,
                p: 3,
                backgroundColor: 'success.light',
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" sx={{ color: 'success.dark' }}>
                🎉 Phase 1: Authentication Complete!
              </Typography>
              <Typography variant="body2" sx={{ color: 'success.dark', mt: 1 }}>
                Next: Building main layout (AppBar, Sidebar) and full dashboard
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default DashboardPlaceholder;

