// ============================================
// ENTERPRISE DASHBOARD PAGE
// Complete platform overview with comprehensive metrics
// ============================================

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  People,
  Business,
  AttachMoney,
  TrendingUp,
  TrendingDown,
  Schedule,
  Warning,
  Error as ErrorIcon,
  Notifications,
  Mail,
  Sms,
  WhatsApp,
  ArrowUpward,
  ArrowDownward,
  Refresh,
  CheckCircle,
  Add,
  PersonAdd,
  CreditScore as CreditCardIcon,
  Assessment,
  Download,
  Send,
  Settings,
} from '@mui/icons-material';

const DashboardPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // KPI Stats
  const kpiStats = [
    {
      title: 'Total Tenants',
      value: '161',
      change: '+12.5%',
      changeType: 'increase',
      icon: Business,
      color: '#E91E63',
      bgColor: '#FCE4EC',
      subtitle: 'Active: 156 | Inactive: 5',
    },
    {
      title: 'Platform Users',
      value: '12,847',
      change: '+18.2%',
      changeType: 'increase',
      icon: People,
      color: '#2196F3',
      bgColor: '#E3F2FD',
      subtitle: 'Students across all libraries',
    },
    {
      title: 'Monthly Revenue (MRR)',
      value: '₹10.2L',
      change: '+23.4%',
      changeType: 'increase',
      icon: AttachMoney,
      color: '#4CAF50',
      bgColor: '#E8F5E9',
      subtitle: 'Subscription + Credits + Fees',
    },
    {
      title: 'Annual Revenue (ARR)',
      value: '₹1.22Cr',
      change: '+19.8%',
      changeType: 'increase',
      icon: TrendingUp,
      color: '#9C27B0',
      bgColor: '#F3E5F5',
      subtitle: 'Projected annual recurring',
    },
    {
      title: 'Total Bookings',
      value: '48,523',
      change: '+15.7%',
      changeType: 'increase',
      icon: Schedule,
      color: '#FF9800',
      bgColor: '#FFF3E0',
      subtitle: 'This month',
    },
    {
      title: 'Churn Rate',
      value: '2.1%',
      change: '-0.8%',
      changeType: 'decrease',
      icon: Warning,
      color: '#F44336',
      bgColor: '#FFEBEE',
      subtitle: 'Down from 2.9% last month',
    },
  ];

  // Revenue Data
  const revenueData = [
    { month: 'Jan', subscription: 4.2, credits: 1.8, transaction: 0.65 },
    { month: 'Feb', subscription: 4.45, credits: 1.95, transaction: 0.72 },
    { month: 'Mar', subscription: 5.2, credits: 2.2, transaction: 0.85 },
    { month: 'Apr', subscription: 4.95, credits: 2.35, transaction: 0.78 },
    { month: 'May', subscription: 5.8, credits: 2.65, transaction: 0.92 },
    { month: 'Jun', subscription: 6.25, credits: 2.9, transaction: 1.05 },
  ];

  // Credit Usage
  const creditUsageData = [
    { type: 'SMS', used: 45000, total: 60000, color: '#FF9800', icon: Sms },
    { type: 'WhatsApp', used: 28000, total: 35000, color: '#4CAF50', icon: WhatsApp },
    { type: 'Email', used: 92000, total: 120000, color: '#2196F3', icon: Mail },
  ];

  // Top Performing Tenants
  const topTenants = [
    { name: 'City Central Library', revenue: '₹45,000', bookings: 523, plan: 'Enterprise', growth: '+34%' },
    { name: 'Study Hub Bangalore', revenue: '₹38,500', bookings: 445, plan: 'Professional', growth: '+28%' },
    { name: 'Knowledge Point Delhi', revenue: '₹32,000', bookings: 389, plan: 'Professional', growth: '+22%' },
    { name: 'Metro Study Center', revenue: '₹28,500', bookings: 356, plan: 'Starter', growth: '+19%' },
    { name: 'Learn Space Mumbai', revenue: '₹25,000', bookings: 312, plan: 'Starter', growth: '+15%' },
  ];

  // Recent Activities
  const recentActivities = [
    { id: 1, tenant: 'City Central Library', action: 'Upgraded to Professional', time: '5 mins ago', type: 'upgrade', avatar: 'C' },
    { id: 2, tenant: 'Study Hub Bangalore', action: 'Purchased 5000 SMS credits', time: '12 mins ago', type: 'credit', avatar: 'S' },
    { id: 3, tenant: 'Metro Study Center', action: 'New tenant registered', time: '45 mins ago', type: 'new', avatar: 'M' },
    { id: 4, tenant: 'Knowledge Point', action: 'Payment failed - retry scheduled', time: '1 hour ago', type: 'payment', avatar: 'K' },
    { id: 5, tenant: 'Learn Space Delhi', action: 'Created support ticket #1234', time: '2 hours ago', type: 'ticket', avatar: 'L' },
  ];

  // Alerts
  const alerts = [
    { id: 1, type: 'critical', title: '3 tenants payment failed', message: 'Immediate action required', time: 'Now' },
    { id: 2, type: 'warning', title: '12 subscriptions expiring in 7 days', message: 'Send renewal reminders', time: '5 mins ago' },
    { id: 3, type: 'info', title: 'System maintenance scheduled', message: 'Tomorrow 2:00 AM - 4:00 AM', time: '1 hour ago' },
  ];

  // Plan Distribution
  const planDistribution = [
    { name: 'Free', count: 45, percentage: 28, color: '#9E9E9E' },
    { name: 'Starter', count: 62, percentage: 39, color: '#2196F3' },
    { name: 'Professional', count: 38, percentage: 24, color: '#9C27B0' },
    { name: 'Enterprise', count: 16, percentage: 9, color: '#E91E63' },
  ];

  const handleRefresh = () => {
    setLastRefresh(new Date());
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Platform Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome to StudySpot Admin Portal v2.0 • Last updated: {lastRefresh.toLocaleTimeString()}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} label="Time Range">
              <MenuItem value="7d">Last 7 days</MenuItem>
              <MenuItem value="30d">Last 30 days</MenuItem>
              <MenuItem value="90d">Last 90 days</MenuItem>
              <MenuItem value="1y">Last year</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Refresh data">
            <IconButton onClick={handleRefresh}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Quick Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Quick Actions
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(6, 1fr)',
              },
              gap: 2,
              mt: 2,
            }}
          >
            <Button
              variant="contained"
              startIcon={<Add />}
              fullWidth
              sx={{
                background: 'linear-gradient(135deg, #E91E63 0%, #9C27B0 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #C2185B 0%, #7B1FA2 100%)',
                },
              }}
            >
              Add Tenant
            </Button>
            <Button variant="outlined" startIcon={<PersonAdd />} fullWidth>
              Add User
            </Button>
            <Button variant="outlined" startIcon={<CreditCardIcon />} fullWidth>
              Manage Credits
            </Button>
            <Button variant="outlined" startIcon={<Send />} fullWidth>
              Send Message
            </Button>
            <Button variant="outlined" startIcon={<Assessment />} fullWidth>
              View Reports
            </Button>
            <Button variant="outlined" startIcon={<Settings />} fullWidth>
              Settings
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <Box sx={{ mb: 3 }}>
          {alerts.map((alert) => (
            <Card
              key={alert.id}
              sx={{
                mb: 1,
                border: `1px solid ${
                  alert.type === 'critical' ? '#F44336' : alert.type === 'warning' ? '#FF9800' : '#2196F3'
                }`,
                bgcolor: alert.type === 'critical' ? '#FFEBEE' : alert.type === 'warning' ? '#FFF3E0' : '#E3F2FD',
              }}
            >
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  {alert.type === 'critical' && <ErrorIcon color="error" />}
                  {alert.type === 'warning' && <Warning color="warning" />}
                  {alert.type === 'info' && <Notifications color="info" />}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {alert.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {alert.message} • {alert.time}
                    </Typography>
                  </Box>
                  <Button size="small" variant="outlined">
                    View
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* KPI Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(6, 1fr)',
          },
          gap: 3,
          mb: 3,
        }}
      >
        {kpiStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                  <Avatar sx={{ bgcolor: stat.bgColor, width: 48, height: 48 }}>
                    <Icon sx={{ color: stat.color }} />
                  </Avatar>
                  <Chip
                    label={stat.change}
                    size="small"
                    icon={stat.changeType === 'increase' ? <ArrowUpward /> : <ArrowDownward />}
                    color={stat.changeType === 'increase' ? 'success' : 'error'}
                    sx={{ fontWeight: 'bold' }}
                  />
                </Stack>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {stat.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stat.subtitle}
                </Typography>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Platform Health & Trends */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        <Card sx={{ background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)', color: 'white' }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  System Health
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  Excellent
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  99.9% Uptime
                </Typography>
              </Box>
              <CheckCircle sx={{ fontSize: 48, opacity: 0.9 }} />
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ background: 'linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)', color: 'white' }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Avg Response Time
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  245ms
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  ↓ 12% faster
                </Typography>
              </Box>
              <TrendingDown sx={{ fontSize: 48, opacity: 0.9 }} />
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)', color: 'white' }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Active Sessions
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  1,245
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  ↑ 8% from yesterday
                </Typography>
              </Box>
              <People sx={{ fontSize: 48, opacity: 0.9 }} />
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ background: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)', color: 'white' }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Satisfaction Score
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  4.8/5.0
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  ↑ 0.3 this month
                </Typography>
              </Box>
              <CheckCircle sx={{ fontSize: 48, opacity: 0.9 }} />
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* Row 1: Revenue & Plan Distribution */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
          gap: 3,
          mb: 3,
        }}
      >
        {/* Revenue Breakdown */}
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Revenue Breakdown (Last 6 Months)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Monthly revenue by source (in Lakhs ₹)
                </Typography>
              </Box>
              <Button variant="outlined" size="small" startIcon={<Download />}>
                Export
              </Button>
            </Stack>
            <TableContainer sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Month</strong></TableCell>
                    <TableCell align="right"><strong>Subscription</strong></TableCell>
                    <TableCell align="right"><strong>Credits</strong></TableCell>
                    <TableCell align="right"><strong>Transaction</strong></TableCell>
                    <TableCell align="right"><strong>Total</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {revenueData.map((row) => (
                    <TableRow key={row.month}>
                      <TableCell>{row.month}</TableCell>
                      <TableCell align="right">₹{row.subscription}L</TableCell>
                      <TableCell align="right">₹{row.credits}L</TableCell>
                      <TableCell align="right">₹{row.transaction}L</TableCell>
                      <TableCell align="right">
                        <strong>₹{(row.subscription + row.credits + row.transaction).toFixed(2)}L</strong>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Plan Distribution */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Plan Distribution
            </Typography>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Active tenants by plan
            </Typography>
            <Stack spacing={2} sx={{ mt: 3 }}>
              {planDistribution.map((plan) => (
                <Box key={plan.name}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box sx={{ width: 12, height: 12, bgcolor: plan.color, borderRadius: '50%' }} />
                      <Typography variant="body2" fontWeight="bold">
                        {plan.name}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {plan.count} ({plan.percentage}%)
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={plan.percentage}
                    sx={{
                      height: 8,
                      borderRadius: 1,
                      bgcolor: `${plan.color}20`,
                      '& .MuiLinearProgress-bar': {
                        bgcolor: plan.color,
                      },
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* Row 2: Credit Usage & Top Tenants */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: 3,
          mb: 3,
        }}
      >
        {/* Credit Usage */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Credit Usage
            </Typography>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Current month consumption
            </Typography>
            <Stack spacing={3} sx={{ mt: 3 }}>
              {creditUsageData.map((credit) => {
                const IconComponent = credit.icon;
                return (
                  <Box key={credit.type}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <IconComponent sx={{ color: credit.color }} />
                        <Typography variant="body2" fontWeight="bold">
                          {credit.type}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {credit.used.toLocaleString()} / {credit.total.toLocaleString()}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={(credit.used / credit.total) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 1,
                        bgcolor: `${credit.color}20`,
                        '& .MuiLinearProgress-bar': {
                          bgcolor: credit.color,
                        },
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      {((credit.used / credit.total) * 100).toFixed(1)}% used • {(credit.total - credit.used).toLocaleString()} remaining
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </CardContent>
        </Card>

        {/* Top Performing Tenants */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Top Performing Tenants
            </Typography>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              By revenue this month
            </Typography>
            <TableContainer sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Tenant</strong></TableCell>
                    <TableCell align="right"><strong>Revenue</strong></TableCell>
                    <TableCell align="right"><strong>Growth</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topTenants.map((tenant, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Typography variant="body2" fontWeight="bold">
                            {tenant.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {tenant.bookings} bookings • {tenant.plan}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold">
                          {tenant.revenue}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={tenant.growth}
                          size="small"
                          color="success"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>

      {/* Recent Activity */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Recent Activity
          </Typography>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Latest platform events
          </Typography>
          <List>
            {recentActivities.map((activity) => (
              <ListItem
                key={activity.id}
                secondaryAction={
                  <Typography variant="caption" color="text.secondary">
                    {activity.time}
                  </Typography>
                }
                sx={{ borderBottom: '1px solid #F5F5F5' }}
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor:
                        activity.type === 'upgrade'
                          ? '#9C27B0'
                          : activity.type === 'credit'
                          ? '#FF9800'
                          : activity.type === 'new'
                          ? '#4CAF50'
                          : activity.type === 'payment'
                          ? '#F44336'
                          : '#2196F3',
                    }}
                  >
                    {activity.avatar}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight="bold">
                      {activity.tenant}
                    </Typography>
                  }
                  secondary={activity.action}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DashboardPage;
