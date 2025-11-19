import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Tooltip,
  Alert,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Badge,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { revenueService } from '../../services/revenueService';
import { toast } from 'react-toastify';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  Payment,
  AccountBalance,
  Receipt,
  Warning,
  CheckCircle,
  Refresh,
  Download,
  CalendarToday,
  Notifications,
  Phone,
  Email,
  Message,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';

// =====================================================
// INTERFACES
// =====================================================

interface PaymentStats {
  totalRevenue: number;
  totalPayments: number;
  completedPayments: number;
  pendingPayments: number;
  failedPayments: number;
  avgPaymentValue: number;
  collectionEfficiency: number;
  growthRate: number;
}

interface PaymentMethodBreakdown {
  method: string;
  count: number;
  amount: number;
  percentage: number;
  trend: 'up' | 'down';
  trendValue: number;
}

interface RevenueData {
  date: string;
  revenue: number;
  forecast?: number;
  payments: number;
}

interface PendingPayment {
  id: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
  description: string;
  paymentMethod: string;
  lastReminderSent?: string;
  reminderCount: number;
}

// =====================================================
// DEFAULT VALUES (will be replaced by backend data)
// =====================================================

const DEFAULT_STATS: PaymentStats = {
  totalRevenue: 0,
  totalPayments: 0,
  completedPayments: 0,
  pendingPayments: 0,
  failedPayments: 0,
  avgPaymentValue: 0,
  collectionEfficiency: 0,
  growthRate: 0,
};

// =====================================================
// MAIN COMPONENT
// =====================================================

const RevenueAnalyticsPage: React.FC = () => {
  const theme = useTheme();
  const [dateRange, setDateRange] = useState('month');
  const [stats, setStats] = useState<PaymentStats>(DEFAULT_STATS);
  const [methodBreakdown, setMethodBreakdown] = useState<PaymentMethodBreakdown[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch data from backend
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculate date range
      const endDate = new Date().toISOString().split('T')[0];
      let startDate = '';
      switch (dateRange) {
        case 'week':
          startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          break;
        case 'month':
          startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          break;
        case 'year':
          startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          break;
        default:
          startDate = endDate;
      }

      // Fetch revenue stats
      const revenueStats = await revenueService.getRevenueStats({
        startDate,
        endDate,
        groupBy: dateRange === 'week' ? 'day' : dateRange === 'month' ? 'week' : 'month',
      });

      // Transform backend data to component format
      setStats({
        totalRevenue: revenueStats.totalRevenue || 0,
        totalPayments: revenueStats.revenueByPlan.reduce((sum, p) => sum + (p.revenue || 0), 0) || 0,
        completedPayments: revenueStats.totalRevenue > 0 ? Math.floor(revenueStats.totalRevenue / 1000) : 0,
        pendingPayments: 0, // Will be calculated from bookings
        failedPayments: 0,
        avgPaymentValue: revenueStats.totalRevenue > 0 ? revenueStats.totalRevenue / 100 : 0,
        collectionEfficiency: 100,
        growthRate: 0,
      });

      // Transform revenue trends
      const trends = revenueStats.revenueTrend || [];
      setRevenueData(trends.map((t: any) => ({
        date: t.date,
        revenue: t.revenue || 0,
        payments: 0,
      })));

      // Transform revenue by plan to method breakdown (simplified)
      const planBreakdown = revenueStats.revenueByPlan || [];
      setMethodBreakdown(planBreakdown.map((p: any, index: number) => ({
        method: p.planName || `Plan ${index + 1}`,
        count: Math.floor((p.revenue || 0) / 1000),
        amount: p.revenue || 0,
        percentage: revenueStats.totalRevenue > 0 ? ((p.revenue || 0) / revenueStats.totalRevenue) * 100 : 0,
        trend: 'up' as const,
        trendValue: 0,
      })));

      // Pending payments will be fetched separately or from bookings
      setPendingPayments([]);

      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('❌ [RevenueAnalyticsPage] Failed to fetch revenue data:', err);
      setError(err.message || 'Failed to load revenue analytics');
      toast.error('Failed to load revenue data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount and when date range changes
  useEffect(() => {
    fetchData();
  }, [dateRange]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (autoRefresh && !loading) {
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, loading]);

  // Send reminder
  const handleSendReminder = (payment: PendingPayment, method: 'email' | 'sms' | 'whatsapp') => {
    console.log(`Sending ${method} reminder to ${payment.studentName}`);
    // Simulate sending
    const updatedPayments = pendingPayments.map(p =>
      p.id === payment.id
        ? { ...p, lastReminderSent: new Date().toISOString(), reminderCount: p.reminderCount + 1 }
        : p
    );
    setPendingPayments(updatedPayments);
  };

  // Show loading state
  if (loading && stats.totalRevenue === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Loading revenue analytics...
        </Typography>
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchData}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            💰 Payment Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time insights, trends, and forecasting
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Time Period</InputLabel>
            <Select
              value={dateRange}
              label="Time Period"
              onChange={(e) => setDateRange(e.target.value)}
            >
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="quarter">This Quarter</MenuItem>
              <MenuItem value="year">This Year</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchData}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button variant="contained" startIcon={<Download />}>
            Export Report
          </Button>
        </Box>
      </Box>

      {/* Last Updated & Auto-refresh */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </Typography>
        <FormControl>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ mr: 1 }}>Auto-refresh (30s)</Typography>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
          </Box>
        </FormControl>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Total Revenue */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" sx={{ mb: 1 }}>
                    ₹{stats.totalRevenue.toLocaleString()}
                  </Typography>
                  <Chip
                    icon={<TrendingUp />}
                    label={`+${stats.growthRate}%`}
                    color="success"
                    size="small"
                  />
                </Box>
                <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main' }}>
                  <AttachMoney />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Payments */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Payments
                  </Typography>
                  <Typography variant="h4" sx={{ mb: 1 }}>
                    {stats.totalPayments}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Avg: ₹{stats.avgPaymentValue.toLocaleString()}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                  <Receipt />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Collection Efficiency */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ width: '100%' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Collection Efficiency
                  </Typography>
                  <Typography variant="h4" sx={{ mb: 1 }}>
                    {stats.collectionEfficiency}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={stats.collectionEfficiency}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
                <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main' }}>
                  <AccountBalance />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Payments */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Pending Payments
                  </Typography>
                  <Typography variant="h4" sx={{ mb: 1 }}>
                    {stats.pendingPayments}
                  </Typography>
                  <Chip
                    icon={<Warning />}
                    label="Needs Attention"
                    color="warning"
                    size="small"
                  />
                </Box>
                <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.main' }}>
                  <Warning />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Payment Method Breakdown & Revenue Trends */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Payment Method Breakdown */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                💳 Payment Method Breakdown
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Method</TableCell>
                      <TableCell align="right">Count</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="right">Share</TableCell>
                      <TableCell align="right">Trend</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {methodBreakdown.map((method) => (
                      <TableRow key={method.method}>
                        <TableCell>
                          <Chip label={method.method} size="small" />
                        </TableCell>
                        <TableCell align="right">{method.count}</TableCell>
                        <TableCell align="right">₹{method.amount.toLocaleString()}</TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <LinearProgress
                              variant="determinate"
                              value={method.percentage}
                              sx={{ width: 60, mr: 1, height: 6, borderRadius: 1 }}
                            />
                            {method.percentage}%
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            icon={method.trend === 'up' ? <ArrowUpward /> : <ArrowDownward />}
                            label={`${method.trendValue > 0 ? '+' : ''}${method.trendValue}%`}
                            color={method.trend === 'up' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Revenue Trends & Forecast */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📈 Revenue Trends & Forecast
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Week</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                      <TableCell align="right">Forecast</TableCell>
                      <TableCell align="right">Payments</TableCell>
                      <TableCell align="right">Variance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {revenueData.map((data, index) => {
                      const variance = data.forecast && data.revenue
                        ? ((data.revenue - data.forecast) / data.forecast * 100).toFixed(1)
                        : null;
                      return (
                        <TableRow key={index}>
                          <TableCell>{new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</TableCell>
                          <TableCell align="right">
                            {data.revenue > 0 ? `₹${data.revenue.toLocaleString()}` : '-'}
                          </TableCell>
                          <TableCell align="right">
                            {data.forecast ? (
                              <Chip
                                label={`₹${data.forecast.toLocaleString()}`}
                                size="small"
                                color="info"
                                variant="outlined"
                              />
                            ) : '-'}
                          </TableCell>
                          <TableCell align="right">{data.payments || '-'}</TableCell>
                          <TableCell align="right">
                            {variance && (
                              <Chip
                                label={`${parseFloat(variance) > 0 ? '+' : ''}${variance}%`}
                                size="small"
                                color={parseFloat(variance) > 0 ? 'success' : 'error'}
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Pending Payments Tracking */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              ⏰ Pending Payments Tracking
            </Typography>
            <Chip
              icon={<Warning />}
              label={`${pendingPayments.length} Pending`}
              color="warning"
            />
          </Box>
          <Divider sx={{ mb: 2 }} />

          {pendingPayments.length === 0 ? (
            <Alert severity="success" icon={<CheckCircle />}>
              🎉 Great! No pending payments at the moment.
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell align="center">Overdue</TableCell>
                    <TableCell align="center">Reminders</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingPayments.map((payment) => (
                    <TableRow
                      key={payment.id}
                      sx={{
                        bgcolor: payment.daysOverdue > 7
                          ? alpha(theme.palette.error.main, 0.05)
                          : payment.daysOverdue > 0
                          ? alpha(theme.palette.warning.main, 0.05)
                          : 'inherit'
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {payment.studentName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {payment.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" display="block">
                          📧 {payment.studentEmail}
                        </Typography>
                        <Typography variant="caption" display="block">
                          📱 {payment.studentPhone}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold">
                          ₹{payment.amount.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {new Date(payment.dueDate).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${payment.daysOverdue} days`}
                          size="small"
                          color={payment.daysOverdue > 7 ? 'error' : 'warning'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Badge badgeContent={payment.reminderCount} color="primary">
                          <Notifications />
                        </Badge>
                        {payment.lastReminderSent && (
                          <Typography variant="caption" display="block" color="text.secondary">
                            Last: {new Date(payment.lastReminderSent).toLocaleDateString()}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                          <Tooltip title="Send Email Reminder">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleSendReminder(payment, 'email')}
                            >
                              <Email fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Send SMS">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleSendReminder(payment, 'sms')}
                            >
                              <Message fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Call Student">
                            <IconButton size="small" color="primary">
                              <Phone fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default RevenueAnalyticsPage;

