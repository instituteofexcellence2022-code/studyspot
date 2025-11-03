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
} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
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
// MOCK DATA
// =====================================================

const MOCK_STATS: PaymentStats = {
  totalRevenue: 1250000,
  totalPayments: 342,
  completedPayments: 298,
  pendingPayments: 34,
  failedPayments: 10,
  avgPaymentValue: 3655,
  collectionEfficiency: 87.2,
  growthRate: 15.3,
};

const MOCK_METHOD_BREAKDOWN: PaymentMethodBreakdown[] = [
  { method: 'Cash', count: 120, amount: 360000, percentage: 28.8, trend: 'up', trendValue: 5.2 },
  { method: 'Online', count: 98, amount: 490000, percentage: 39.2, trend: 'up', trendValue: 12.5 },
  { method: 'UPI', count: 75, amount: 225000, percentage: 18.0, trend: 'up', trendValue: 8.3 },
  { method: 'Cheque', count: 32, amount: 128000, percentage: 10.2, trend: 'down', trendValue: -2.1 },
  { method: 'Bank Transfer', count: 17, amount: 47000, percentage: 3.8, trend: 'down', trendValue: -1.5 },
];

const MOCK_REVENUE_DATA: RevenueData[] = [
  { date: '2025-10-01', revenue: 185000, forecast: 180000, payments: 48 },
  { date: '2025-10-08', revenue: 195000, forecast: 190000, payments: 52 },
  { date: '2025-10-15', revenue: 210000, forecast: 200000, payments: 58 },
  { date: '2025-10-22', revenue: 225000, forecast: 210000, payments: 61 },
  { date: '2025-10-29', revenue: 0, forecast: 220000, payments: 0 }, // Future forecast
];

const MOCK_PENDING: PendingPayment[] = [
  {
    id: '1',
    studentName: 'Rajesh Kumar',
    studentEmail: 'rajesh.k@example.com',
    studentPhone: '+91 98765 11111',
    amount: 5000,
    dueDate: '2025-10-15',
    daysOverdue: 8,
    description: 'Monthly fee - October 2025',
    paymentMethod: 'cash',
    lastReminderSent: '2025-10-20',
    reminderCount: 2,
  },
  {
    id: '2',
    studentName: 'Priya Sharma',
    studentEmail: 'priya.s@example.com',
    studentPhone: '+91 98765 22222',
    amount: 7500,
    dueDate: '2025-10-18',
    daysOverdue: 5,
    description: 'Quarterly fee - Q4 2025',
    paymentMethod: 'online',
    lastReminderSent: '2025-10-21',
    reminderCount: 1,
  },
  {
    id: '3',
    studentName: 'Amit Patel',
    studentEmail: 'amit.p@example.com',
    studentPhone: '+91 98765 33333',
    amount: 3000,
    dueDate: '2025-10-20',
    daysOverdue: 3,
    description: 'Monthly fee - October 2025',
    paymentMethod: 'upi',
    reminderCount: 0,
  },
];

// =====================================================
// MAIN COMPONENT
// =====================================================

const RevenueAnalyticsPage: React.FC = () => {
  const theme = useTheme();
  const [dateRange, setDateRange] = useState('month');
  const [stats, setStats] = useState<PaymentStats>(MOCK_STATS);
  const [methodBreakdown, setMethodBreakdown] = useState<PaymentMethodBreakdown[]>(MOCK_METHOD_BREAKDOWN);
  const [revenueData, setRevenueData] = useState<RevenueData[]>(MOCK_REVENUE_DATA);
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>(MOCK_PENDING);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch data (simulated)
  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      // In real app, fetch from API
      setLastUpdated(new Date());
      setLoading(false);
    }, 1000);
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

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

