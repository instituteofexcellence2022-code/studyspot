import React, { useEffect } from 'react';
import Grid from '@mui/material/Grid';
import {
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Tooltip,
  Box,
  Container,
  Typography
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  EventNote as EventNoteIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon

  } from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer

  } from 'recharts';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { 
  fetchTenant,
  fetchTenantAnalytics
} from '../../store/slices/tenantSlice';

/**
 * Tenant Analytics Dashboard
 * Comprehensive analytics with charts and KPIs
 * 
 * @author Agent 2 - Senior Developer (20+ years)
 */

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AnalyticsDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentTenant, analytics, analyticsLoading, analyticsError } = useAppSelector(
    (state) => state.tenant
  );
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user?.tenantId) {
      dispatch(fetchCurrentTenant(true as any)); // Pass true to fetch current tenant
    }
  }, [dispatch]);

  useEffect(() => {
    if (currentTenant) {
      dispatch(fetchAnalytics({ id: currentTenant.id } as any));
    }
  }, [currentTenant, dispatch]);

  if (analyticsLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  if (analyticsError) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{analyticsError}</Alert>
      </Container>
    );
  }

  const kpiData = analytics
    ? [
        {
          title: 'Total Users',
          value: analytics.users.total,
          growth: analytics.users.growth,
          icon: <PeopleIcon fontSize="large" />,
          color: '#1976d2'},
        {
          title: 'Active Users',
          value: analytics.users.active,
          growth: 0,
          icon: <PeopleIcon fontSize="large" />,
          color: '#2e7d32'},
        {
          title: 'Total Bookings',
          value: analytics.bookings.total,
          growth: 0,
          icon: <EventNoteIcon fontSize="large" />,
          color: '#ed6c02'},
        {
          title: 'Revenue',
          value: `$${analytics.bookings.revenue.toLocaleString()}`,
          growth: 0,
          icon: <MoneyIcon fontSize="large" />,
          color: '#9c27b0'},
      ]
    : [];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Analytics Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Track your library's performance and growth
      </Typography>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpiData.map((kpi, index) => (
          <Grid xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {kpi.title}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {kpi.value}
                    </Typography>
                    {kpi.growth !== 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <TrendingUpIcon fontSize="small" color="success" />
                        <Typography variant="caption" color="success.main" sx={{ ml: 0.5 }}>
                          +{kpi.growth}%
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ color: kpi.color }}>{kpi.icon}</Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      {analytics && (
        <Grid container spacing={3}>
          {/* User Growth Chart */}
          <Grid xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  User Growth
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.trends.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#1976d2" name="Users" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Revenue Trend */}
          <Grid xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Revenue Trend
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.trends.revenueTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#9c27b0" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Performance Metrics */}
          <Grid xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Performance Metrics
                </Typography>
                <Box sx={{ p: 2 }}>
                  <Typography variant="body2" paragraph>
                    Health Score: <strong>{analytics.performance.healthScore}%</strong>
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Uptime: <strong>{analytics.performance.uptime}%</strong>
                  </Typography>
                  <Typography variant="body2">
                    Avg Response Time: <strong>{analytics.performance.responseTime}ms</strong>
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default AnalyticsDashboard;

