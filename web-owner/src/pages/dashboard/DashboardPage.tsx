import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Avatar, Paper, Button,
  Chip, Divider, List, ListItem, ListItemText, ListItemAvatar,
  TextField, MenuItem, IconButton, Tooltip, LinearProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,
} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import {
  LibraryBooks, EventSeat, People, TrendingUp, AttachMoney,
  AccessTime, Group, CalendarToday, Add as AddIcon,
  Notifications as NotificationIcon, CheckCircle, Warning,
  Refresh, ArrowForward, Close, Info, Wifi, WifiOff,
} from '@mui/icons-material';
import { useAppSelector } from '../../hooks/redux';
import { ROUTES } from '../../constants';
import { useSocket } from '../../hooks/useSocket';
import { toast } from 'react-toastify';
import { dashboardService } from '../../services/dashboardService';

const DashboardPageEnhanced: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('today');
  const [loading, setLoading] = useState(true);
  const [alertDialog, setAlertDialog] = useState({ open: false, alert: null as any });
  const [dashboardStats, setDashboardStats] = useState<any>(null);

  // Auto-refresh simulation
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // 🔴 NEW: Real-time WebSocket connection
  const { socket, connected } = useSocket('library_owner');

  // Fetch dashboard stats
  useEffect(() => {
    fetchDashboardStats();
  }, [dateRange]);

  // Auto-refresh dashboard data
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchDashboardStats();
        setLastRefresh(new Date());
      }, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, dateRange]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const stats = await dashboardService.getDashboardStats(dateRange);
      setDashboardStats(stats);
    } catch (error: any) {
      console.error('Failed to fetch dashboard stats:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // 🔴 NEW: Real-time event listeners for dashboard updates
  useEffect(() => {
    if (!socket || !connected) return;

    console.log('📡 [Owner Dashboard] Setting up real-time listeners');

    // New booking created
    socket.on('booking:created', (booking) => {
      console.log('🔔 [Real-time] New booking on dashboard:', booking);
      toast.success(`🎉 New booking received!`, {
        position: 'top-right',
        autoClose: 3000,
      });
      // Refresh stats would be handled by Redux or state update
      setLastRefresh(new Date());
    });

    // Pricing updated
    socket.on('pricing:updated', (data) => {
      console.log('🔔 [Real-time] Pricing updated:', data);
      toast.info('Library pricing has been updated', {
        position: 'top-right',
        autoClose: 3000,
      });
      setLastRefresh(new Date());
    });

    // Library updated
    socket.on('library:updated', (library) => {
      console.log('🔔 [Real-time] Library updated:', library);
      toast.info('Library information has been updated', {
        position: 'top-right',
        autoClose: 3000,
      });
      setLastRefresh(new Date());
    });

    // Cleanup
    return () => {
      socket.off('booking:created');
      socket.off('pricing:updated');
      socket.off('library:updated');
    };
  }, [socket, connected]);

  // Enhanced stats with trends and navigation - Dynamic from backend
  const stats = dashboardStats ? [
    {
      title: 'Total Libraries',
      value: dashboardStats.totalLibraries.toString(),
      trend: `${dashboardStats.totalLibraries} active`,
      icon: <LibraryBooks />,
      color: '#1976d2',
      subtitle: 'Active branches',
      change: '+0%',
      positive: true,
      route: ROUTES.LIBRARIES,
      action: 'View All Libraries',
    },
    {
      title: 'Total Seats',
      value: dashboardStats.totalSeats.toString(),
      trend: `${dashboardStats.availableSeats} available`,
      icon: <EventSeat />,
      color: '#2e7d32',
      subtitle: `Occupancy: ${dashboardStats.totalSeats > 0 ? Math.round(((dashboardStats.totalSeats - dashboardStats.availableSeats) / dashboardStats.totalSeats) * 100) : 0}%`,
      change: '+0%',
      positive: true,
      route: ROUTES.SEATS,
      action: 'Manage Seats',
    },
    {
      title: 'Active Students',
      value: dashboardStats.activeStudents.toString(),
      trend: `${dashboardStats.activeStudents} enrolled`,
      icon: <People />,
      color: '#d32f2f',
      subtitle: 'Currently active',
      change: '+0%',
      positive: true,
      route: ROUTES.STUDENTS,
      action: 'View Students',
    },
    {
      title: "Today's Attendance",
      value: dashboardStats.todayAttendance.toString(),
      trend: 'Check-ins so far',
      icon: <CalendarToday />,
      color: '#9c27b0',
      subtitle: 'Today',
      change: '+0%',
      positive: true,
      route: ROUTES.ATTENDANCE,
      action: 'View Attendance',
    },
    {
      title: 'Total Revenue',
      value: `₹${dashboardStats.totalRevenue.toLocaleString('en-IN')}`,
      trend: 'This month',
      icon: <TrendingUp />,
      color: '#009688',
      subtitle: 'Total revenue',
      change: '+0%',
      positive: true,
      route: ROUTES.PAYMENTS,
      action: 'View Payments',
    },
    {
      title: 'Active Fee Plans',
      value: dashboardStats.activeFeePlans.toString(),
      trend: 'Active plans',
      icon: <AttachMoney />,
      color: '#ed6c02',
      subtitle: 'Fee plans',
      change: '0%',
      positive: true,
      route: ROUTES.FEE_PLANS,
      action: 'Manage Plans',
    },
    {
      title: 'Total Staff',
      value: dashboardStats.totalStaff.toString(),
      trend: 'All active',
      icon: <Group />,
      color: '#ff9800',
      subtitle: 'Staff members',
      change: '+0',
      positive: true,
      route: ROUTES.STAFF,
      action: 'Manage Staff',
    },
    {
      title: 'Pending Payments',
      value: `₹${dashboardStats.pendingPayments.toLocaleString('en-IN')}`,
      trend: 'Follow-up needed',
      icon: <AttachMoney />,
      color: '#f44336',
      subtitle: 'Pending amount',
      change: '-0%',
      positive: false,
      route: ROUTES.PAYMENTS,
      action: 'Follow Up',
    },
  ] : [];

  // Quick actions
  const quickActions = [
    { 
      label: 'Add Student', 
      icon: <AddIcon />, 
      color: 'primary', 
      path: ROUTES.STUDENTS,
      description: 'Register new student'
    },
    { 
      label: 'Record Payment', 
      icon: <AttachMoney />, 
      color: 'success', 
      path: ROUTES.PAYMENTS,
      description: 'Add payment record'
    },
    { 
      label: 'Manual Check-in', 
      icon: <CheckCircle />, 
      color: 'info', 
      path: ROUTES.ATTENDANCE,
      description: 'Mark attendance manually'
    },
    { 
      label: 'Add Seat', 
      icon: <EventSeat />, 
      color: 'warning', 
      path: ROUTES.SEATS,
      description: 'Create new seat'
    },
  ];

  // Recent activity with actions - Dynamic from backend
  const recentActivity = dashboardStats?.recentActivity || [
    { 
      type: 'payment', 
      message: 'Rajesh Kumar paid ₹5000 for Monthly Premium', 
      time: '5 min ago', 
      icon: <AttachMoney />, 
      color: 'success',
      action: 'View Receipt',
      route: ROUTES.PAYMENTS
    },
    { 
      type: 'checkin', 
      message: 'Priya Sharma checked in at Seat B05', 
      time: '12 min ago', 
      icon: <CheckCircle />, 
      color: 'info',
      action: 'View Details',
      route: ROUTES.ATTENDANCE
    },
    { 
      type: 'student', 
      message: 'New student Amit Patel registered', 
      time: '25 min ago', 
      icon: <People />, 
      color: 'primary',
      action: 'View Profile',
      route: ROUTES.STUDENTS
    },
    { 
      type: 'alert', 
      message: 'Low seat availability in AC Zone', 
      time: '1 hour ago', 
      icon: <Warning />, 
      color: 'warning',
      action: 'Manage Seats',
      route: ROUTES.SEATS
    },
    { 
      type: 'payment', 
      message: 'Sneha Reddy payment overdue by 3 days', 
      time: '2 hours ago', 
      icon: <AttachMoney />, 
      color: 'error',
      action: 'Follow Up',
      route: ROUTES.PAYMENTS
    },
  ];

  // Alerts & Notifications with actions
  const alerts = [
    { 
      message: '5 payments overdue - follow-up required', 
      severity: 'error', 
      action: 'View Payments',
      route: ROUTES.PAYMENTS,
      details: 'Total overdue amount: ₹2,500. Last payment received 3 days ago.'
    },
    { 
      message: 'AC Zone approaching full capacity (85%)', 
      severity: 'warning', 
      action: 'Manage Seats',
      route: ROUTES.SEATS,
      details: '42 out of 50 seats occupied. Consider adding more seats or restricting new bookings.'
    },
    { 
      message: 'Monthly revenue target: 83% achieved', 
      severity: 'info', 
      action: 'View Details',
      route: ROUTES.PAYMENTS,
      details: 'Current: ₹12,450 / Target: ₹15,000. On track to meet target by month end.'
    },
  ];

  // Performance metrics
  const performanceMetrics = [
    { label: 'Average Occupancy', value: '72%', target: '80%', progress: 90, route: ROUTES.SEATS },
    { label: 'Collection Efficiency', value: '88%', target: '95%', progress: 93, route: ROUTES.PAYMENTS },
    { label: 'Student Retention', value: '91%', target: '90%', progress: 100, route: ROUTES.STUDENTS },
    { label: 'Revenue Growth', value: '23%', target: '20%', progress: 115, route: ROUTES.PAYMENTS },
  ];

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLastRefresh(new Date());
      setLoading(false);
    }, 1000);
  };

  const handleAlertClick = (alert: any) => {
    setAlertDialog({ open: true, alert });
  };

  const handleAlertAction = () => {
    if (alertDialog.alert?.route) {
      navigate(alertDialog.alert.route);
    }
    setAlertDialog({ open: false, alert: null });
  };

  return (
    <Box>
      {/* Header with Actions */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box>
            <Typography variant="h4" component="h1">
              Welcome back, {user?.firstName || 'Owner'}! 
              <Chip 
                label="Live Dashboard ✨" 
                color="success" 
                size="small" 
                sx={{ ml: 2 }} 
              />
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              Last updated: {lastRefresh.toLocaleTimeString()}
              {autoRefresh && ' • Auto-refresh ON'}
              {connected && ' • Real-time updates active'}
      </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {connected ? (
              <Tooltip title="Real-time updates are active">
                <Chip
                  icon={<Wifi />}
                  label="Live"
                  color="success"
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </Tooltip>
            ) : (
              <Tooltip title="Connecting to real-time server...">
                <Chip
                  icon={<WifiOff />}
                  label="Offline"
                  color="default"
                  size="small"
                />
              </Tooltip>
            )}
            <Tooltip title={autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}>
              <Chip
                label={autoRefresh ? 'Auto' : 'Manual'}
                color={autoRefresh ? 'success' : 'default'}
                size="small"
                onClick={() => setAutoRefresh(!autoRefresh)}
                sx={{ cursor: 'pointer' }}
              />
            </Tooltip>
            <Tooltip title="Refresh dashboard">
              <IconButton 
                onClick={fetchDashboardStats} 
                disabled={loading}
                size="small"
                color="primary"
              >
                <Refresh sx={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              </IconButton>
            </Tooltip>
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
        </Box>
        <Typography variant="subtitle1" color="text.secondary">
        Here's what's happening with your libraries today.
      </Typography>
      </Box>

      {/* Loading Progress */}
      {loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Loading dashboard data...
          </Typography>
        </Box>
      )}

      {/* Show content only when data is loaded */}
      {!loading && dashboardStats && (
        <>

      {/* Alerts with Actions */}
      {alerts.length > 0 && (
        <Box sx={{ mb: 3 }}>
          {alerts.map((alert, index) => (
            <Card 
              key={index} 
              sx={{ 
                mb: 1, 
                borderLeft: 4, 
                borderColor: alert.severity === 'error' ? 'error.main' : alert.severity === 'warning' ? 'warning.main' : 'info.main',
                cursor: 'pointer',
                '&:hover': { boxShadow: 3 }
              }}
              onClick={() => handleAlertClick(alert)}
            >
              <CardContent sx={{ py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <NotificationIcon 
                    sx={{ 
                      mr: 2, 
                      color: alert.severity === 'error' ? 'error.main' : alert.severity === 'warning' ? 'warning.main' : 'info.main' 
                    }} 
                  />
                  <Typography variant="body2">{alert.message}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="More info">
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleAlertClick(alert); }}>
                      <Info fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Button 
                    size="small" 
                    variant="outlined"
                    endIcon={<ArrowForward />}
                    onClick={(e) => { e.stopPropagation(); navigate(alert.route); }}
                  >
                    {alert.action}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Stats Cards - Clickable */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={`dashboard-stat-${index}`}>
            <Card 
              sx={{ 
                height: '100%', 
                cursor: 'pointer',
                '&:hover': { 
                  boxShadow: 6, 
                  transform: 'translateY(-4px)', 
                  transition: 'all 0.3s' 
                } 
              }}
              onClick={() => navigate(stat.route)}
            >
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
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
                <Button 
                  size="small" 
                  fullWidth 
                  variant="text"
                  endIcon={<ArrowForward />}
                  sx={{ mt: 1 }}
                >
                  {stat.action}
                </Button>
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
                <Tooltip title={action.description}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color={action.color as any}
                    startIcon={action.icon}
                    onClick={() => navigate(action.path)}
                    sx={{ 
                      py: 1.5,
                      '&:hover': {
                        transform: 'scale(1.02)',
                        transition: 'transform 0.2s'
                      }
                    }}
                  >
                    {action.label}
                  </Button>
                </Tooltip>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Performance Metrics - Clickable */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUp sx={{ mr: 1 }} /> Performance Metrics
            </Typography>
            <Box sx={{ mt: 2 }}>
              {performanceMetrics.map((metric, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    mb: 3,
                    cursor: 'pointer',
                    '&:hover': { opacity: 0.8 }
                  }}
                  onClick={() => navigate(metric.route)}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{metric.label}</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {metric.value} 
                      <Typography component="span" variant="caption" color="text.secondary">
                        {' '}/ {metric.target}
                      </Typography>
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(metric.progress, 100)}
                    color={metric.progress >= 100 ? 'success' : metric.progress >= 80 ? 'warning' : 'error'}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity with Actions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTime sx={{ mr: 1 }} /> Recent Activity
            </Typography>
            <List sx={{ mt: 1 }}>
              {recentActivity.map((activity: any, index: number) => (
                <ListItem 
                  key={index} 
                  sx={{ 
                    px: 0, 
                    py: 1,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover', borderRadius: 1 }
                  }}
                  secondaryAction={
                    <Button 
                      size="small" 
                      variant="text"
                      endIcon={<ArrowForward />}
                      onClick={() => navigate(activity.route)}
                    >
                      {activity.action}
                    </Button>
                  }
                >
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

        {/* Charts Placeholder */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Revenue & Occupancy Trends
              </Typography>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => navigate(ROUTES.PAYMENTS)}
              >
                View Full Report
              </Button>
            </Box>
            <Box 
              sx={{ 
                height: 300, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                bgcolor: 'grey.50', 
                borderRadius: 1,
                cursor: 'pointer',
                '&:hover': { bgcolor: 'grey.100' }
              }}
              onClick={() => navigate(ROUTES.PAYMENTS)}
            >
              <Typography variant="body2" color="text.secondary" textAlign="center">
                📊 Chart Visualization Coming Soon
                <br />
                <Typography variant="caption">
                  (Click to view detailed reports)
            </Typography>
            </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Alert Details Dialog */}
      <Dialog 
        open={alertDialog.open} 
        onClose={() => setAlertDialog({ open: false, alert: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <NotificationIcon 
              sx={{ 
                mr: 1,
                color: alertDialog.alert?.severity === 'error' ? 'error.main' : 
                       alertDialog.alert?.severity === 'warning' ? 'warning.main' : 'info.main'
              }} 
            />
            Alert Details
          </Box>
          <IconButton size="small" onClick={() => setAlertDialog({ open: false, alert: null })}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" fontWeight="bold" gutterBottom>
            {alertDialog.alert?.message}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            {alertDialog.alert?.details}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAlertDialog({ open: false, alert: null })}>
            Dismiss
          </Button>
          <Button 
            variant="contained" 
            onClick={handleAlertAction}
            endIcon={<ArrowForward />}
          >
            {alertDialog.alert?.action}
          </Button>
        </DialogActions>
      </Dialog>

      {/* CSS for spin animation */}
      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
        </>
      )}
    </Box>
  );
};

export default DashboardPageEnhanced;
