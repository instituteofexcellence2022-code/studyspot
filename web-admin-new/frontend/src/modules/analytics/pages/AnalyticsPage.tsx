// ============================================
// ANALYTICS & BUSINESS INTELLIGENCE PAGE - ENHANCED
// ============================================

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  GridLegacy as Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Avatar,
  Divider,
  Alert,
  LinearProgress,
  Tab,
  Tabs,
  TextField,
  Badge,
  Tooltip as MuiTooltip,
} from '@mui/material';
import {
  Refresh,
  Download,
  Print,
  TrendingUp,
  TrendingDown,
  AttachMoney,
  People,
  Subscriptions as SubscriptionsIcon,
  Timeline,
  Business,
  School,
  Assessment,
  Speed,
  EventSeat,
  LocationOn,
  CalendarToday,
  CompareArrows,
  Psychology,
  Insights as InsightsIcon,
  Warning,
  CheckCircle,
  Cancel,
  FilterList,
  Share,
  Bookmark,
  Visibility,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAppSelector } from '../../../hooks/redux';
import type { TimeRange } from '../types';

// Tab Panel Component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const AnalyticsPage: React.FC = () => {
  const { summary, revenueData, userGrowthData, subscriptionDistribution, reports } = useAppSelector(
    (state) => state.analytics
  );

  // Main state
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');
  const [chartGrouping, setChartGrouping] = useState<'hour' | 'day' | 'week' | 'month'>('month');
  const [comparisonPeriod, setComparisonPeriod] = useState<'previous' | 'lastYear' | 'target'>('previous');

  // Format currency
  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Chart colors
  const COLORS = ['#2196f3', '#9c27b0', '#4caf50', '#ff9800', '#f44336', '#00bcd4', '#ff5722'];

  // Format month
  const formatMonth = (dateStr: string) => {
    const date = new Date(dateStr + '-01');
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  // Enhanced Mock Data
  const enhancedMetrics = {
    totalTenants: 245,
    totalLibraries: 487,
    totalStudents: 12453,
    totalSeats: 24589,
    occupancyRate: 76.5,
    activeUsers: 10234,
    churnRate: 3.2,
    customerSatisfaction: 4.6,
    nps: 72,
  };

  const regionalData = [
    { region: 'Mumbai', tenants: 65, libraries: 142, students: 3456, revenue: 4500000 },
    { region: 'Delhi', tenants: 58, libraries: 125, students: 2987, revenue: 3800000 },
    { region: 'Bangalore', tenants: 52, libraries: 98, students: 2654, revenue: 3200000 },
    { region: 'Pune', tenants: 38, libraries: 72, students: 1876, revenue: 2400000 },
    { region: 'Chennai', tenants: 32, libraries: 50, students: 1480, revenue: 1900000 },
  ];

  const performanceMetrics = [
    { metric: 'API Response Time', value: 145, unit: 'ms', status: 'good', target: 200 },
    { metric: 'System Uptime', value: 99.9, unit: '%', status: 'excellent', target: 99 },
    { metric: 'Database Load', value: 45, unit: '%', status: 'good', target: 70 },
    { metric: 'Active Sessions', value: 2345, unit: 'users', status: 'good', target: 3000 },
  ];

  const topLibraries = [
    { id: 1, name: 'Central Library - Mumbai', occupancy: 92, revenue: 245000, rating: 4.8 },
    { id: 2, name: 'StudyHub - Delhi', occupancy: 88, revenue: 210000, rating: 4.7 },
    { id: 3, name: 'Smart Study - Bangalore', occupancy: 85, revenue: 198000, rating: 4.6 },
    { id: 4, name: 'Elite Library - Pune', occupancy: 82, revenue: 185000, rating: 4.5 },
    { id: 5, name: 'Knowledge Hub - Chennai', occupancy: 78, revenue: 165000, rating: 4.4 },
  ];

  const aiInsights = [
    {
      type: 'opportunity',
      title: 'Revenue Growth Opportunity',
      description: 'Mumbai region showing 28% growth. Consider expanding marketing in this area.',
      impact: 'high',
      action: 'Increase marketing budget by 20%',
    },
    {
      type: 'warning',
      title: 'Churn Risk Detected',
      description: '12 tenants showing reduced activity. Immediate engagement recommended.',
      impact: 'medium',
      action: 'Launch retention campaign',
    },
    {
      type: 'success',
      title: 'Performance Milestone',
      description: 'Customer satisfaction reached all-time high of 4.6/5.0.',
      impact: 'positive',
      action: 'Share success story with team',
    },
  ];

  // Additional analytics data
  const revenueByPlan = [
    { plan: 'Enterprise', revenue: 5400000, count: 45, avgRevenue: 120000 },
    { plan: 'Professional', revenue: 3200000, count: 78, avgRevenue: 41026 },
    { plan: 'Starter', revenue: 1800000, count: 95, avgRevenue: 18947 },
    { plan: 'Free', revenue: 0, count: 27, avgRevenue: 0 },
  ];

  const monthlyTrends = [
    { month: 'Jan', revenue: 1200000, tenants: 220, libraries: 440, students: 11200 },
    { month: 'Feb', revenue: 1350000, tenants: 225, libraries: 450, students: 11500 },
    { month: 'Mar', revenue: 1450000, tenants: 232, libraries: 465, students: 11890 },
    { month: 'Apr', revenue: 1580000, tenants: 238, libraries: 475, students: 12150 },
    { month: 'May', revenue: 1720000, tenants: 245, libraries: 487, students: 12453 },
  ];

  const customerRetentionData = [
    { cohort: 'Jan 2025', month1: 100, month2: 92, month3: 87, month4: 84, month5: 82 },
    { cohort: 'Feb 2025', month1: 100, month2: 94, month3: 89, month4: 86, month5: 84 },
    { cohort: 'Mar 2025', month1: 100, month2: 96, month3: 92, month4: 89, month5: null },
    { cohort: 'Apr 2025', month1: 100, month2: 97, month3: 94, month4: null, month5: null },
    { cohort: 'May 2025', month1: 100, month2: 98, month3: null, month4: null, month5: null },
  ];

  const featureUsage = [
    { feature: 'Student Management', usage: 95, tenants: 233 },
    { feature: 'Attendance Tracking', usage: 88, tenants: 216 },
    { feature: 'Fee Management', usage: 82, tenants: 201 },
    { feature: 'Seat Allocation', usage: 78, tenants: 191 },
    { feature: 'Reports & Analytics', usage: 72, tenants: 176 },
    { feature: 'Communication (SMS/WhatsApp)', usage: 65, tenants: 159 },
    { feature: 'API Access', usage: 42, tenants: 103 },
    { feature: 'White Label', usage: 28, tenants: 69 },
  ];

  const conversionFunnel = [
    { stage: 'Visitors', count: 12500, percentage: 100 },
    { stage: 'Sign Ups', count: 3750, percentage: 30 },
    { stage: 'Trial Started', count: 2250, percentage: 18 },
    { stage: 'Active Users', count: 1125, percentage: 9 },
    { stage: 'Paid Conversion', count: 337, percentage: 2.7 },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            📊 Platform Analytics & Business Intelligence
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Comprehensive insights, trends, and AI-powered recommendations
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            >
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
              <MenuItem value="90d">Last 90 Days</MenuItem>
              <MenuItem value="1y">Last Year</MenuItem>
              <MenuItem value="all">All Time</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Group By</InputLabel>
            <Select
              value={chartGrouping}
              label="Group By"
              onChange={(e) => setChartGrouping(e.target.value as any)}
            >
              <MenuItem value="hour" disabled={!(timeRange === '7d' || timeRange === '30d')}>Hour</MenuItem>
              <MenuItem value="day">Day</MenuItem>
              <MenuItem value="week" disabled={timeRange === '7d'}>Week</MenuItem>
              <MenuItem value="month">Month</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Compare</InputLabel>
            <Select
              value={comparisonPeriod}
              label="Compare"
              onChange={(e) => setComparisonPeriod(e.target.value as any)}
            >
              <MenuItem value="previous">Previous Period</MenuItem>
              <MenuItem value="lastYear">Last Year</MenuItem>
              <MenuItem value="target">Target</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" startIcon={<Refresh />}>
            Refresh
          </Button>
          <Button variant="outlined" startIcon={<Download />}>
            Export
          </Button>
          <Button variant="outlined" startIcon={<Share />}>
            Share
          </Button>
        </Stack>
      </Box>

      {/* AI Insights Banner */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
              <Psychology fontSize="large" />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                🤖 AI-Powered Insights
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {aiInsights.length} insights detected. Revenue growing 28% MoM, 12 tenants need attention.
              </Typography>
            </Box>
            <Button variant="contained" sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}>
              View All Insights
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="Executive Dashboard" icon={<Assessment />} iconPosition="start" />
          <Tab label="Revenue Analytics" icon={<AttachMoney />} iconPosition="start" />
          <Tab label="User Analytics" icon={<People />} iconPosition="start" />
          <Tab label="Operational Metrics" icon={<Speed />} iconPosition="start" />
          <Tab label="Regional Insights" icon={<LocationOn />} iconPosition="start" />
          <Tab label="AI Insights" icon={<Psychology />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Tab 1: Executive Dashboard */}
      <TabPanel value={activeTab} index={0}>
        {/* KPI Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ my: 1 }}>
                    {formatCurrency(summary.totalRevenue)}
                  </Typography>
                  <Chip
                    icon={<TrendingUp />}
                    label={`+${summary.revenueGrowth}%`}
                    color="success"
                    size="small"
                  />
                </Box>
                <IconButton sx={{ bgcolor: 'success.light', color: 'success.main' }}>
                  <AttachMoney />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ my: 1 }}>
                    {summary.totalUsers}
                  </Typography>
                  <Chip
                    icon={<TrendingUp />}
                    label={`+${summary.userGrowth}%`}
                    color="success"
                    size="small"
                  />
                </Box>
                <IconButton sx={{ bgcolor: 'info.light', color: 'info.main' }}>
                  <People />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Active Subscriptions
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ my: 1 }}>
                    {summary.activeSubscriptions}
                  </Typography>
                  <Chip
                    icon={<TrendingUp />}
                    label={`+${summary.subscriptionGrowth}%`}
                    color="success"
                    size="small"
                  />
                </Box>
                <IconButton sx={{ bgcolor: 'primary.light', color: 'primary.main' }}>
                  <SubscriptionsIcon />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Avg Revenue/User
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ my: 1 }}>
                    {formatCurrency(summary.averageRevenue)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    per user
                  </Typography>
                </Box>
                <IconButton sx={{ bgcolor: 'secondary.light', color: 'secondary.main' }}>
                  <Timeline />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Revenue Over Time */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Revenue Over Time - By {chartGrouping.charAt(0).toUpperCase() + chartGrouping.slice(1)}
                </Typography>
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <Select
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value as any)}
                  >
                    <MenuItem value="line">Line</MenuItem>
                    <MenuItem value="bar">Bar</MenuItem>
                    <MenuItem value="area">Area</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <ResponsiveContainer width="100%" height={350}>
                {chartType === 'line' ? (
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={formatMonth} />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#2196f3"
                      strokeWidth={3}
                      name="Revenue"
                    />
                  </LineChart>
                ) : chartType === 'bar' ? (
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={formatMonth} />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#2196f3" name="Revenue" />
                  </BarChart>
                ) : (
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={formatMonth} />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#2196f3"
                      fill="#2196f3"
                      fillOpacity={0.3}
                      name="Revenue"
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Subscription Distribution */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Subscription Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={subscriptionDistribution as any}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.plan}: ${entry.percentage.toFixed(1)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {subscriptionDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* User Growth Chart */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                User Growth Trends - By {chartGrouping.charAt(0).toUpperCase() + chartGrouping.slice(1)}
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatMonth} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="new" fill="#4caf50" name="New Users" />
                  <Bar dataKey="active" fill="#2196f3" name="Active Users" />
                  <Bar dataKey="churned" fill="#f44336" name="Churned" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

        {/* Enhanced Metrics Grid */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Business color="primary" />
                    <Typography variant="body2" color="text.secondary">Total Tenants</Typography>
                  </Stack>
                  <Typography variant="h4" fontWeight="bold">{enhancedMetrics.totalTenants}</Typography>
                  <LinearProgress variant="determinate" value={75} sx={{ height: 6, borderRadius: 3 }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LocationOn color="info" />
                    <Typography variant="body2" color="text.secondary">Total Libraries</Typography>
                  </Stack>
                  <Typography variant="h4" fontWeight="bold">{enhancedMetrics.totalLibraries}</Typography>
                  <LinearProgress variant="determinate" value={82} sx={{ height: 6, borderRadius: 3 }} color="info" />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <School color="success" />
                    <Typography variant="body2" color="text.secondary">Total Students</Typography>
                  </Stack>
                  <Typography variant="h4" fontWeight="bold">{enhancedMetrics.totalStudents.toLocaleString()}</Typography>
                  <LinearProgress variant="determinate" value={88} sx={{ height: 6, borderRadius: 3 }} color="success" />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <EventSeat color="warning" />
                    <Typography variant="body2" color="text.secondary">Occupancy Rate</Typography>
                  </Stack>
                  <Typography variant="h4" fontWeight="bold">{enhancedMetrics.occupancyRate}%</Typography>
                  <LinearProgress variant="determinate" value={enhancedMetrics.occupancyRate} sx={{ height: 6, borderRadius: 3 }} color="warning" />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Performance Metrics */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              ⚡ System Performance
            </Typography>
            <Grid container spacing={2}>
              {performanceMetrics.map((metric, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Paper sx={{ p: 2, bgcolor: metric.status === 'excellent' ? 'success.50' : 'primary.50' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {metric.metric}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {metric.value}{metric.unit}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={(metric.value / metric.target) * 100}
                        sx={{ flex: 1, height: 6, borderRadius: 3 }}
                        color={metric.status === 'excellent' ? 'success' : 'primary'}
                      />
                      <Typography variant="caption">Target: {metric.target}{metric.unit}</Typography>
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                📄 Recent Reports
              </Typography>
              <Button variant="contained" startIcon={<Download />}>
                Generate New Report
              </Button>
            </Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Report Name</strong></TableCell>
                    <TableCell><strong>Type</strong></TableCell>
                    <TableCell><strong>Format</strong></TableCell>
                    <TableCell><strong>Generated</strong></TableCell>
                    <TableCell><strong>Size</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{report.name}</TableCell>
                      <TableCell>
                        <Chip label={report.type} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{report.format.toUpperCase()}</TableCell>
                      <TableCell>
                        {new Date(report.generatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{report.size} MB</TableCell>
                      <TableCell>
                        <Chip
                          label={report.status}
                          color={report.status === 'generated' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button size="small" startIcon={<Download />}>
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Tab 2: Revenue Analytics */}
      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  💰 Revenue Trend Analysis
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={formatMonth} />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" stroke="#2196f3" fill="#2196f3" fillOpacity={0.3} name="Revenue" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Revenue Breakdown
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">Subscriptions</Typography>
                      <Typography variant="body2" fontWeight="bold">65%</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={65} sx={{ mt: 1, height: 8, borderRadius: 4 }} />
                  </Box>
                  <Box>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">Credits</Typography>
                      <Typography variant="body2" fontWeight="bold">25%</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={25} sx={{ mt: 1, height: 8, borderRadius: 4 }} color="success" />
                  </Box>
                  <Box>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">Add-ons</Typography>
                      <Typography variant="body2" fontWeight="bold">10%</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={10} sx={{ mt: 1, height: 8, borderRadius: 4 }} color="warning" />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Growth Rate
                </Typography>
                <Typography variant="h3" fontWeight="bold" color="success.main">
                  +28.5%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Month over month
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Revenue by Plan */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              💳 Revenue by Subscription Plan
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Plan</strong></TableCell>
                    <TableCell><strong>Total Revenue</strong></TableCell>
                    <TableCell><strong>Customers</strong></TableCell>
                    <TableCell><strong>Avg Revenue/Customer</strong></TableCell>
                    <TableCell><strong>Contribution</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {revenueByPlan.map((plan, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Chip 
                          label={plan.plan} 
                          color={plan.plan === 'Enterprise' ? 'primary' : plan.plan === 'Professional' ? 'success' : 'default'}
                          variant={plan.plan === 'Free' ? 'outlined' : 'filled'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1" fontWeight="bold" color="success.main">
                          {formatCurrency(plan.revenue)}
                        </Typography>
                      </TableCell>
                      <TableCell>{plan.count}</TableCell>
                      <TableCell>{formatCurrency(plan.avgRevenue)}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <LinearProgress
                            variant="determinate"
                            value={(plan.revenue / 10400000) * 100}
                            sx={{ flex: 1, height: 8, borderRadius: 4 }}
                            color={plan.plan === 'Enterprise' ? 'primary' : 'success'}
                          />
                          <Typography variant="body2">
                            {((plan.revenue / 10400000) * 100).toFixed(1)}%
                          </Typography>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Monthly Growth Trends */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              📈 Multi-Metric Growth Trends (Last 5 Months)
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" tickFormatter={(value) => formatCurrency(value)} />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip formatter={(value: any, name: string) => {
                  if (name === 'Revenue') return formatCurrency(value);
                  return value;
                }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#4caf50" strokeWidth={3} name="Revenue" />
                <Line yAxisId="right" type="monotone" dataKey="tenants" stroke="#2196f3" strokeWidth={2} name="Tenants" />
                <Line yAxisId="right" type="monotone" dataKey="libraries" stroke="#9c27b0" strokeWidth={2} name="Libraries" />
                <Line yAxisId="right" type="monotone" dataKey="students" stroke="#ff9800" strokeWidth={2} name="Students" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Tab 3: User Analytics */}
      <TabPanel value={activeTab} index={2}>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  👥 User Growth & Engagement
                </Typography>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={formatMonth} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="new" fill="#4caf50" name="New Users" />
                    <Bar dataKey="active" fill="#2196f3" name="Active Users" />
                    <Bar dataKey="churned" fill="#f44336" name="Churned" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  User Metrics
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Active Users</Typography>
                    <Typography variant="h4" fontWeight="bold">{enhancedMetrics.activeUsers.toLocaleString()}</Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Churn Rate</Typography>
                    <Typography variant="h4" fontWeight="bold" color="error.main">{enhancedMetrics.churnRate}%</Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Customer Satisfaction</Typography>
                    <Typography variant="h4" fontWeight="bold" color="success.main">{enhancedMetrics.customerSatisfaction}/5.0</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Subscription Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={subscriptionDistribution as any}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) => `${entry.plan}: ${entry.percentage.toFixed(1)}%`}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {subscriptionDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Conversion Funnel */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              🔄 Conversion Funnel Analysis
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 2 }}>
              {conversionFunnel.map((stage, index) => (
                <Paper
                  key={index}
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    bgcolor: index === 0 ? 'primary.50' : index === 1 ? 'info.50' : index === 2 ? 'success.50' : index === 3 ? 'warning.50' : 'error.50',
                    position: 'relative',
                    '&::after': index < conversionFunnel.length - 1 ? {
                      content: '"→"',
                      position: 'absolute',
                      right: -15,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: 24,
                      fontWeight: 'bold',
                      color: 'text.secondary',
                    } : {},
                  }}
                >
                  <Typography variant="caption" color="text.secondary" display="block">
                    {stage.stage}
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stage.count.toLocaleString()}
                  </Typography>
                  <Chip
                    label={`${stage.percentage}%`}
                    size="small"
                    color={stage.percentage > 50 ? 'success' : stage.percentage > 10 ? 'primary' : 'warning'}
                  />
                </Paper>
              ))}
            </Box>
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Conversion Insight:</strong> Overall conversion rate from visitor to paid customer is 2.7%. 
                Focus on improving trial-to-paid conversion (currently 15%) to boost revenue.
              </Typography>
            </Alert>
          </CardContent>
        </Card>

        {/* Customer Retention Cohort Analysis */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              🔁 Customer Retention Cohort Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Track how well we retain customers month-over-month
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Cohort</strong></TableCell>
                    <TableCell align="center"><strong>Month 1</strong></TableCell>
                    <TableCell align="center"><strong>Month 2</strong></TableCell>
                    <TableCell align="center"><strong>Month 3</strong></TableCell>
                    <TableCell align="center"><strong>Month 4</strong></TableCell>
                    <TableCell align="center"><strong>Month 5</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customerRetentionData.map((cohort, index) => (
                    <TableRow key={index}>
                      <TableCell><strong>{cohort.cohort}</strong></TableCell>
                      <TableCell align="center">
                        <Chip label={`${cohort.month1}%`} size="small" color="success" />
                      </TableCell>
                      <TableCell align="center">
                        {cohort.month2 && (
                          <Chip
                            label={`${cohort.month2}%`}
                            size="small"
                            color={cohort.month2 >= 90 ? 'success' : 'warning'}
                          />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {cohort.month3 && (
                          <Chip
                            label={`${cohort.month3}%`}
                            size="small"
                            color={cohort.month3 >= 85 ? 'success' : 'warning'}
                          />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {cohort.month4 && (
                          <Chip
                            label={`${cohort.month4}%`}
                            size="small"
                            color={cohort.month4 >= 80 ? 'success' : 'warning'}
                          />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {cohort.month5 && (
                          <Chip
                            label={`${cohort.month5}%`}
                            size="small"
                            color={cohort.month5 >= 80 ? 'success' : 'warning'}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Retention Insight:</strong> Average 5-month retention is 84%, which is excellent for SaaS. 
                Recent cohorts showing improving trends (+2% MoM).
              </Typography>
            </Alert>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Tab 4: Operational Metrics */}
      <TabPanel value={activeTab} index={3}>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  💺 Capacity Utilization
                </Typography>
                <Typography variant="h3" fontWeight="bold" color="success.main">
                  {enhancedMetrics.occupancyRate}%
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {Math.round(enhancedMetrics.totalSeats * (enhancedMetrics.occupancyRate / 100)).toLocaleString()} / {enhancedMetrics.totalSeats.toLocaleString()} seats occupied
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={enhancedMetrics.occupancyRate}
                  sx={{ height: 12, borderRadius: 6 }}
                  color="success"
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  📊 Net Promoter Score
                </Typography>
                <Typography variant="h3" fontWeight="bold" color="primary.main">
                  {enhancedMetrics.nps}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Excellent customer satisfaction
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Chip label="Promoters: 72%" color="success" size="small" />
                  <Chip label="Passives: 20%" color="default" size="small" />
                  <Chip label="Detractors: 8%" color="error" size="small" />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              🏆 Top Performing Libraries
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Rank</strong></TableCell>
                    <TableCell><strong>Library Name</strong></TableCell>
                    <TableCell><strong>Occupancy</strong></TableCell>
                    <TableCell><strong>Revenue</strong></TableCell>
                    <TableCell><strong>Rating</strong></TableCell>
                    <TableCell><strong>Performance</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topLibraries.map((library, index) => (
                    <TableRow key={library.id} hover>
                      <TableCell>
                        <Chip 
                          label={`#${index + 1}`} 
                          color={index === 0 ? 'primary' : index === 1 ? 'success' : 'default'} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">{library.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <LinearProgress
                            variant="determinate"
                            value={library.occupancy}
                            sx={{ flex: 1, height: 8, borderRadius: 4, minWidth: 100 }}
                            color={library.occupancy > 85 ? 'success' : 'primary'}
                          />
                          <Typography variant="body2" fontWeight="bold">{library.occupancy}%</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          {formatCurrency(library.revenue)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={`⭐ ${library.rating}`} size="small" color="warning" />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={library.occupancy > 85 ? 'Excellent' : library.occupancy > 75 ? 'Good' : 'Average'} 
                          size="small"
                          color={library.occupancy > 85 ? 'success' : library.occupancy > 75 ? 'primary' : 'warning'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Feature Usage Analysis */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              🎯 Feature Usage & Adoption
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Track which features are being used across all tenants
            </Typography>
            <Stack spacing={2}>
              {featureUsage.map((feature, index) => (
                <Paper key={index} sx={{ p: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" fontWeight="medium">
                        {feature.feature}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Used by {feature.tenants} tenants ({feature.usage}% adoption)
                      </Typography>
                    </Box>
                    <Chip
                      label={`${feature.usage}%`}
                      color={feature.usage > 80 ? 'success' : feature.usage > 60 ? 'primary' : 'warning'}
                      size="small"
                    />
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={feature.usage}
                    sx={{ height: 10, borderRadius: 5 }}
                    color={feature.usage > 80 ? 'success' : feature.usage > 60 ? 'primary' : 'warning'}
                  />
                </Paper>
              ))}
            </Stack>
            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                <strong>Feature Insight:</strong> Core features (Student Management, Attendance) have 90%+ adoption. 
                Consider promoting under-utilized premium features (API Access, White Label) through targeted campaigns.
              </Typography>
            </Alert>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Tab 5: Regional Insights */}
      <TabPanel value={activeTab} index={4}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              🌍 Regional Performance Analysis
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={regionalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <YAxis yAxisId="left" orientation="left" tickFormatter={(value) => formatCurrency(value)} />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip formatter={(value: any, name: string) => name === 'revenue' ? formatCurrency(value) : value} />
                <Legend />
                <Bar yAxisId="right" dataKey="tenants" fill="#2196f3" name="Tenants" />
                <Bar yAxisId="right" dataKey="libraries" fill="#9c27b0" name="Libraries" />
                <Bar yAxisId="left" dataKey="revenue" fill="#4caf50" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          {regionalData.map((region, index) => (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {region.region}
                  </Typography>
                  <Stack spacing={1}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Tenants</Typography>
                      <Typography variant="body1" fontWeight="bold">{region.tenants}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Libraries</Typography>
                      <Typography variant="body1" fontWeight="bold">{region.libraries}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Revenue</Typography>
                      <Typography variant="body1" fontWeight="bold" color="success.main">
                        {formatCurrency(region.revenue)}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Tab 6: AI Insights */}
      <TabPanel value={activeTab} index={5}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          🤖 AI-Powered Insights & Recommendations
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Automated analysis and actionable recommendations based on your data
        </Typography>

        <Grid container spacing={3}>
          {aiInsights.map((insight, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  borderLeft: 6,
                  borderColor:
                    insight.type === 'opportunity'
                      ? 'success.main'
                      : insight.type === 'warning'
                      ? 'warning.main'
                      : 'primary.main',
                }}
              >
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Avatar
                      sx={{
                        bgcolor:
                          insight.type === 'opportunity'
                            ? 'success.light'
                            : insight.type === 'warning'
                            ? 'warning.light'
                            : 'primary.light',
                      }}
                    >
                      {insight.type === 'opportunity' ? (
                        <TrendingUp />
                      ) : insight.type === 'warning' ? (
                        <Warning />
                      ) : (
                        <CheckCircle />
                      )}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {insight.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {insight.description}
                      </Typography>
                      <Chip
                        label={`Impact: ${insight.impact}`}
                        size="small"
                        color={
                          insight.impact === 'high'
                            ? 'error'
                            : insight.impact === 'medium'
                            ? 'warning'
                            : 'success'
                        }
                        sx={{ mb: 2 }}
                      />
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="body2" fontWeight="medium" gutterBottom>
                        Recommended Action:
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {insight.action}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Button variant="contained" size="small" fullWidth>
                          Take Action
                        </Button>
                        <Button variant="outlined" size="small" fullWidth>
                          Learn More
                        </Button>
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>AI Analysis Status:</strong> Last updated 5 minutes ago. Next analysis in 55 minutes. 
            All insights are generated using machine learning algorithms analyzing your historical data.
          </Typography>
        </Alert>
      </TabPanel>
    </Box>
  );
};

export default AnalyticsPage;

