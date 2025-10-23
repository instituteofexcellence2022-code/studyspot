import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Avatar, Paper, Button,
  Chip, Divider, List, ListItem, ListItemText, ListItemAvatar,
  TextField, MenuItem,
} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import {
  LibraryBooks, EventSeat, People, TrendingUp, AttachMoney,
  AccessTime, Group, CalendarToday, Add as AddIcon,
  Notifications as NotificationIcon, CheckCircle, Warning,
} from '@mui/icons-material';
import { useAppSelector } from '../../hooks/redux';
import { ROUTES } from '../../constants';

const DashboardPageEnhanced: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('today');

  // Enhanced stats with trends
  const stats = [
    {
      title: 'Total Libraries',
      value: '12',
      trend: '+2 this month',
      icon: <LibraryBooks />,
      color: '#1976d2',
      subtitle: 'Active branches',
      change: '+16.7%',
      positive: true,
    },
    {
      title: 'Total Seats',
      value: '500',
      trend: '350 available',
      icon: <EventSeat />,
      color: '#2e7d32',
      subtitle: 'Occupancy: 70%',
      change: '+5.3%',
      positive: true,
    },
    {
      title: 'Active Students',
      value: '234',
      trend: '+18 today',
      icon: <People />,
      color: '#d32f2f',
      subtitle: '180 currently active',
      change: '+8.3%',
      positive: true,
    },
    {
      title: "Today's Attendance",
      value: '85',
      trend: 'Check-ins so far',
      icon: <CalendarToday />,
      color: '#9c27b0',
      subtitle: 'Peak: 11:00 AM',
      change: '+12.5%',
      positive: true,
    },
    {
      title: 'Total Revenue',
      value: '₹12,450',
      trend: 'This month',
      icon: <TrendingUp />,
      color: '#009688',
      subtitle: 'Target: ₹15,000',
      change: '+23.1%',
      positive: true,
    },
    {
      title: 'Active Fee Plans',
      value: '4',
      trend: 'Most popular: Monthly',
      icon: <AttachMoney />,
      color: '#ed6c02',
      subtitle: '120 subscriptions',
      change: '0%',
      positive: true,
    },
    {
      title: 'Total Staff',
      value: '15',
      trend: 'All active',
      icon: <Group />,
      color: '#ff9800',
      subtitle: '5 managers',
      change: '+1',
      positive: true,
    },
    {
      title: 'Pending Payments',
      value: '₹2,500',
      trend: 'Follow-up needed',
      icon: <AttachMoney />,
      color: '#f44336',
      subtitle: 'Overdue: ₹1,000',
      change: '-15.2%',
      positive: false,
    },
  ];

  // Quick actions
  const quickActions = [
    { label: 'Add Student', icon: <AddIcon />, color: 'primary', path: ROUTES.STUDENTS },
    { label: 'Record Payment', icon: <AttachMoney />, color: 'success', path: ROUTES.PAYMENTS },
    { label: 'Manual Check-in', icon: <CheckCircle />, color: 'info', path: ROUTES.ATTENDANCE },
    { label: 'Add Seat', icon: <EventSeat />, color: 'warning', path: ROUTES.SEATS },
  ];

  // Recent activity
  const recentActivity = [
    { type: 'payment', message: 'Rajesh Kumar paid ₹5000 for Monthly Premium', time: '5 min ago', icon: <AttachMoney />, color: 'success' },
    { type: 'checkin', message: 'Priya Sharma checked in at Seat B05', time: '12 min ago', icon: <CheckCircle />, color: 'info' },
    { type: 'student', message: 'New student Amit Patel registered', time: '25 min ago', icon: <People />, color: 'primary' },
    { type: 'alert', message: 'Low seat availability in AC Zone', time: '1 hour ago', icon: <Warning />, color: 'warning' },
    { type: 'payment', message: 'Sneha Reddy payment overdue by 3 days', time: '2 hours ago', icon: <AttachMoney />, color: 'error' },
  ];

  // Alerts & Notifications
  const alerts = [
    { message: '5 payments overdue - follow-up required', severity: 'error', action: 'View' },
    { message: 'AC Zone approaching full capacity (85%)', severity: 'warning', action: 'Manage' },
    { message: 'Monthly revenue target: 83% achieved', severity: 'info', action: 'Details' },
  ];

  // Performance metrics
  const performanceMetrics = [
    { label: 'Average Occupancy', value: '72%', target: '80%', progress: 90 },
    { label: 'Collection Efficiency', value: '88%', target: '95%', progress: 93 },
    { label: 'Student Retention', value: '91%', target: '90%', progress: 100 },
    { label: 'Revenue Growth', value: '23%', target: '20%', progress: 115 },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h4" component="h1">
            Welcome back, {user?.firstName}! <Chip label="Enhanced @ 80%" color="primary" size="small" sx={{ ml: 2 }} />
          </Typography>
          <TextField
            select
            size="small"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="today">Today</MenuItem>
            <MenuItem value="week">This Week</MenuItem>
            <MenuItem value="month">This Month</MenuItem>
            <MenuItem value="year">This Year</MenuItem>
          </TextField>
        </Box>
        <Typography variant="subtitle1" color="text.secondary">
          Here's what's happening with your libraries today.
        </Typography>
      </Box>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Box sx={{ mb: 3 }}>
          {alerts.map((alert, index) => (
            <Card key={index} sx={{ mb: 1, borderLeft: 4, borderColor: alert.severity === 'error' ? 'error.main' : alert.severity === 'warning' ? 'warning.main' : 'info.main' }}>
              <CardContent sx={{ py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <NotificationIcon sx={{ mr: 2, color: alert.severity === 'error' ? 'error.main' : alert.severity === 'warning' ? 'warning.main' : 'info.main' }} />
                  <Typography variant="body2">{alert.message}</Typography>
                </Box>
                <Button size="small" variant="outlined">{alert.action}</Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={`dashboard-stat-${index}`}>
            <Card sx={{ height: '100%', '&:hover': { boxShadow: 4, transform: 'translateY(-2px)', transition: 'all 0.3s' } }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ backgroundColor: stat.color, mr: 2, width: 56, height: 56 }}>
                    {stat.icon}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h5" component="div" fontWeight="bold">
                      {stat.value}
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ mb: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    {stat.subtitle}
                  </Typography>
                  <Chip
                    label={stat.change}
                    size="small"
                    color={stat.positive ? 'success' : 'error'}
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <AddIcon sx={{ mr: 1 }} /> Quick Actions
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {quickActions.map((action, index) => (
              <Grid item xs={6} sm={3} key={index}>
                <Button
                  fullWidth
                  variant="outlined"
                  color={action.color as any}
                  startIcon={action.icon}
                  onClick={() => navigate(action.path)}
                  sx={{ py: 1.5 }}
                >
                  {action.label}
                </Button>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Performance Metrics */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUp sx={{ mr: 1 }} /> Performance Metrics
            </Typography>
            <Box sx={{ mt: 2 }}>
              {performanceMetrics.map((metric, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{metric.label}</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {metric.value} <Typography component="span" variant="caption" color="text.secondary">/ {metric.target}</Typography>
                    </Typography>
                  </Box>
                  <Box sx={{ height: 8, bgcolor: 'grey.200', borderRadius: 1, overflow: 'hidden' }}>
                    <Box
                      sx={{
                        height: '100%',
                        width: `${Math.min(metric.progress, 100)}%`,
                        bgcolor: metric.progress >= 100 ? 'success.main' : metric.progress >= 80 ? 'warning.main' : 'error.main',
                        transition: 'width 0.3s',
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTime sx={{ mr: 1 }} /> Recent Activity
            </Typography>
            <List sx={{ mt: 1 }}>
              {recentActivity.map((activity, index) => (
                <ListItem key={index} sx={{ px: 0, py: 1 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: `${activity.color}.main`, width: 40, height: 40 }}>
                      {activity.icon}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={activity.message}
                    secondary={activity.time}
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Charts Placeholder - would integrate real charts in production */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Revenue & Occupancy Trends
            </Typography>
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                📊 Chart Visualization - Revenue, Occupancy, and Attendance Trends (Would integrate Chart.js or Recharts here)
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPageEnhanced;

