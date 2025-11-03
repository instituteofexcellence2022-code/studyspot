/**
 * Enhanced Dashboard Page
 * Shows real-time metrics, revenue charts, activity feed, and quick actions
 */

import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Paper,
} from '@mui/material';
import {
  TrendingUp,
  People,
  AttachMoney,
  EventSeat,
  Add,
  Refresh,
  Download,
  CalendarToday,
  CheckCircle,
  Pending,
  PersonAdd,
  Payment as PaymentIcon,
  BookOnline,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';
import { useRole } from '../../hooks/useRole';
import { ROUTES, PERMISSIONS } from '../../constants';
import axios from 'axios';

interface DashboardMetrics {
  totalStudents: number;
  activeStudents: number;
  currentOccupancy: number;
  totalSeats: number;
  occupancyRate: number;
  todayRevenue: number;
  monthRevenue: number;
  pendingPayments: number;
  newStudents: number;
}

interface Activity {
  type: string;
  id: number;
  created_at: string;
  user_name: string;
  library_name: string;
  status?: string;
  amount?: number;
}

export const EnhancedDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const { isLibraryStaff, roleName } = useRole();

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      
      // Fetch metrics
      const metricsRes = await axios.get('/api/dashboard/metrics');
      if (metricsRes.data.success) {
        setMetrics(metricsRes.data.data);
      }

      // Fetch recent activity (if has permission)
      if (hasPermission(PERMISSIONS.DASHBOARD_VIEW)) {
        const activityRes = await axios.get('/api/dashboard/activity?limit=10');
        if (activityRes.data.success) {
          setActivities(activityRes.data.data);
        }
      }

      setError(null);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.errors?.[0]?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color: string;
    trend?: string;
  }> = ({ title, value, subtitle, icon, color, trend }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: color, mr: 2 }}>
            {icon}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h4">
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        {trend && (
          <Chip 
            label={trend} 
            size="small" 
            color="success" 
            icon={<TrendingUp />}
          />
        )}
      </CardContent>
    </Card>
  );

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <BookOnline />;
      case 'payment':
        return <PaymentIcon />;
      case 'student_registered':
        return <PersonAdd />;
      default:
        return <CheckCircle />;
    }
  };

  const getActivityColor = (type: string, status?: string) => {
    if (status === 'completed') return 'success.main';
    if (status === 'pending') return 'warning.main';
    if (status === 'cancelled') return 'error.main';
    return 'primary.main';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && !metrics) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            📊 Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome back! Here's what's happening with your library.
          </Typography>
          <Chip label={roleName} size="small" sx={{ mt: 1 }} />
        </Box>
        <Box>
          <Button
            startIcon={<Refresh />}
            onClick={fetchDashboardData}
            disabled={refreshing}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          {hasPermission(PERMISSIONS.ANALYTICS_EXPORT) && (
            <Button
              startIcon={<Download />}
              variant="outlined"
            >
              Export
            </Button>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {refreshing && <LinearProgress sx={{ mb: 2 }} />}

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Students"
            value={metrics?.totalStudents || 0}
            subtitle={`${metrics?.newStudents || 0} new this month`}
            icon={<People />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Students"
            value={metrics?.activeStudents || 0}
            subtitle="Last 7 days"
            icon={<TrendingUp />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Current Occupancy"
            value={`${metrics?.currentOccupancy || 0}/${metrics?.totalSeats || 0}`}
            subtitle={`${metrics?.occupancyRate || 0}% occupied`}
            icon={<EventSeat />}
            color="warning.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {hasPermission(PERMISSIONS.DASHBOARD_VIEW_REVENUE) ? (
            <MetricCard
              title="Today's Revenue"
              value={formatCurrency(metrics?.todayRevenue || 0)}
              subtitle={`₹${formatCurrency(metrics?.monthRevenue || 0)} this month`}
              icon={<AttachMoney />}
              color="success.main"
            />
          ) : (
            <MetricCard
              title="Pending Payments"
              value={metrics?.pendingPayments || 0}
              subtitle="Awaiting payment"
              icon={<Pending />}
              color="info.main"
            />
          )}
        </Grid>
      </Grid>

      {/* Quick Actions */}
      {isLibraryStaff && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            ⚡ Quick Actions
          </Typography>
          <Grid container spacing={2}>
            {hasPermission(PERMISSIONS.STUDENTS_CREATE) && (
              <Grid item>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate('/students/create')}
                >
                  Add Student
                </Button>
              </Grid>
            )}
            {hasPermission(PERMISSIONS.BOOKINGS_CREATE) && (
              <Grid item>
                <Button
                  variant="contained"
                  startIcon={<CalendarToday />}
                  onClick={() => navigate('/bookings/create')}
                >
                  New Booking
                </Button>
              </Grid>
            )}
            {hasPermission(PERMISSIONS.ATTENDANCE_MARK) && (
              <Grid item>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircle />}
                  onClick={() => navigate('/attendance')}
                >
                  Mark Attendance
                </Button>
              </Grid>
            )}
          </Grid>
        </Paper>
      )}

      {/* Recent Activity */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              🔔 Recent Activity
            </Typography>
            <Button size="small" onClick={() => navigate('/activity')}>
              View All
            </Button>
          </Box>
          
          {activities.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
              No recent activity
            </Typography>
          ) : (
            <List>
              {activities.map((activity, index) => (
                <ListItem
                  key={`${activity.type}-${activity.id}-${index}`}
                  sx={{
                    borderLeft: 3,
                    borderColor: getActivityColor(activity.type, activity.status),
                    mb: 1,
                    bgcolor: 'background.paper',
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: getActivityColor(activity.type, activity.status) }}>
                      {getActivityIcon(activity.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box>
                        <Typography variant="body2">
                          <strong>{activity.user_name}</strong>
                          {activity.type === 'booking' && ' created a booking'}
                          {activity.type === 'payment' && ' made a payment'}
                          {activity.type === 'student_registered' && ' registered as student'}
                        </Typography>
                        {activity.amount && (
                          <Chip
                            label={formatCurrency(activity.amount)}
                            size="small"
                            color="success"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        {activity.library_name} • {formatDateTime(activity.created_at)}
                        {activity.status && (
                          <Chip
                            label={activity.status}
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default EnhancedDashboardPage;








