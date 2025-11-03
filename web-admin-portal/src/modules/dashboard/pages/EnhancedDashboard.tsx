// ============================================
// ENHANCED DASHBOARD
// ============================================

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  LinearProgress,
  Button,
} from '@mui/material';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useAppSelector } from '../../../hooks/redux';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const EnhancedDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  // Mock data for charts
  const weeklyData = [
    { day: 'Mon', users: 45, sessions: 180 },
    { day: 'Tue', users: 52, sessions: 210 },
    { day: 'Wed', users: 48, sessions: 195 },
    { day: 'Thu', users: 61, sessions: 245 },
    { day: 'Fri', users: 55, sessions: 220 },
    { day: 'Sat', users: 38, sessions: 150 },
    { day: 'Sun', users: 32, sessions: 130 },
  ];

  // Mock recent activity
  const recentActivity = [
    { type: 'success', message: 'New tenant created: Tech Institute Library', time: '5 minutes ago' },
    { type: 'info', message: 'User john.admin@studyspot.com logged in', time: '12 minutes ago' },
    { type: 'warning', message: 'Storage limit reached 80% for Central Library', time: '1 hour ago' },
    { type: 'success', message: 'Backup completed successfully', time: '2 hours ago' },
    { type: 'info', message: 'New user registered: Rachel Green', time: '3 hours ago' },
  ];

  // Mock system health
  const systemHealth = [
    { name: 'API Response Time', value: 85, status: 'good' },
    { name: 'Database Performance', value: 92, status: 'excellent' },
    { name: 'Storage Usage', value: 68, status: 'good' },
    { name: 'CPU Usage', value: 45, status: 'excellent' },
  ];

  const stats = [
    {
      title: 'Total Users',
      value: '280',
      change: '+12%',
      icon: <PeopleIcon />,
      color: '#2196F3',
    },
    {
      title: 'Active Tenants',
      value: '42',
      change: '+5',
      icon: <BusinessIcon />,
      color: '#4CAF50',
    },
    {
      title: 'Sessions Today',
      value: '1,845',
      change: '+15%',
      icon: <TrendingUpIcon />,
      color: '#FF9800',
    },
    {
      title: 'Revenue (MTD)',
      value: '$45,231',
      change: '+8%',
      icon: <AssessmentIcon />,
      color: '#9C27B0',
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <ScheduleIcon color="info" />;
    }
  };

  const getHealthColor = (value: number) => {
    if (value >= 80) return 'success';
    if (value >= 60) return 'warning';
    return 'error';
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Dashboard Overview
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, {user?.name}! Here's what's happening today.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box
                  sx={{
                    bgcolor: stat.color + '20',
                    color: stat.color,
                    p: 1,
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {stat.icon}
                </Box>
                <Chip
                  label={stat.change}
                  size="small"
                  color={stat.change.startsWith('+') ? 'success' : 'error'}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {stat.title}
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {stat.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Charts Row */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
          gap: 3,
          mb: 3,
        }}
      >
        {/* Weekly Activity Chart */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Weekly Activity
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              User activity over the past week
            </Typography>
            <Box sx={{ height: 250, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="#2196F3"
                    fill="#2196F3"
                    fillOpacity={0.6}
                    name="Active Users"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        {/* Session Trend Chart */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Session Trends
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total sessions this week
            </Typography>
            <Box sx={{ height: 250, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="sessions"
                    stroke="#9C27B0"
                    strokeWidth={2}
                    name="Sessions"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Bottom Row */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
          gap: 3,
        }}
      >
        {/* Recent Activity */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Recent Activity
              </Typography>
              <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/analytics')}>
                View All
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <List>
              {recentActivity.map((activity, index) => (
                <ListItem
                  key={index}
                  sx={{
                    px: 0,
                    ...(index !== recentActivity.length - 1 && {
                      borderBottom: 1,
                      borderColor: 'divider',
                    }),
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getActivityIcon(activity.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={activity.message}
                    secondary={activity.time}
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                System Health
              </Typography>
              <Chip label="All Systems Operational" color="success" size="small" />
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
              {systemHealth.map((item, index) => (
                <Box key={index}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">{item.name}</Typography>
                    <Typography variant="body2" fontWeight="medium" color={`${getHealthColor(item.value)}.main`}>
                      {item.value}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={item.value}
                    color={getHealthColor(item.value)}
                    sx={{ height: 6, borderRadius: 1 }}
                  />
                </Box>
              ))}
            </Stack>
            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                <strong>Last Check:</strong> 2 minutes ago
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Quick Actions */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Quick Actions
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              variant="contained"
              startIcon={<BusinessIcon />}
              onClick={() => navigate('/tenants/create')}
              fullWidth
            >
              Create Tenant
            </Button>
            <Button
              variant="contained"
              startIcon={<PeopleIcon />}
              onClick={() => navigate('/users/create')}
              fullWidth
            >
              Add User
            </Button>
            <Button
              variant="outlined"
              startIcon={<AssessmentIcon />}
              onClick={() => navigate('/analytics')}
              fullWidth
            >
              View Analytics
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/settings')}
              fullWidth
            >
              Settings
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EnhancedDashboard;

