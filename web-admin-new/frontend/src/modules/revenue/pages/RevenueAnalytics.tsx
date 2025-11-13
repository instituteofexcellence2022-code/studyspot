// ============================================
// REVENUE ANALYTICS PAGE
// Advanced MRR/ARR forecasting and revenue breakdown
// ============================================

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Chip,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Paper,
  Divider,
  Avatar,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Timeline,
  PieChart as PieChartIcon,
  Assessment,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type PieLabelRenderProps,
} from 'recharts';

const RevenueAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState('12months');
  
  // Chart filters - Date Range & Grouping
  const [chartDateRange, setChartDateRange] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('30d');
  const [chartGrouping, setChartGrouping] = useState<'hour' | 'day' | 'week' | 'month'>('month');

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // MRR & ARR Metrics
  const mrrMetrics = {
    currentMRR: 4850000,
    previousMRR: 4700000,
    mrrGrowth: 3.19,
    arr: 58200000,
    projectedARR: 65000000,
    avgRevenuePerCustomer: 9700,
  };

  // Dynamic MRR Movement Data
  const getMRRMovementData = () => {
    if (chartGrouping === 'hour' && (chartDateRange === '7d' || chartDateRange === '30d')) {
      return Array.from({ length: 24 }, (_, i) => ({
        label: `${i}:00`,
        newMRR: Math.floor(Math.random() * 30000) + 10000,
        expansion: Math.floor(Math.random() * 15000) + 5000,
        contraction: -Math.floor(Math.random() * 5000) - 2000,
        churn: -Math.floor(Math.random() * 8000) - 3000,
        netMRR: Math.floor(Math.random() * 25000) + 10000
      }));
    } else if (chartGrouping === 'day') {
      const days = chartDateRange === '7d' ? 7 : chartDateRange === '30d' ? 30 : 30;
      return Array.from({ length: days }, (_, i) => ({
        label: `Day ${i + 1}`,
        newMRR: Math.floor(Math.random() * 100000) + 50000,
        expansion: Math.floor(Math.random() * 50000) + 20000,
        contraction: -Math.floor(Math.random() * 20000) - 8000,
        churn: -Math.floor(Math.random() * 30000) - 15000,
        netMRR: Math.floor(Math.random() * 80000) + 40000
      }));
    } else if (chartGrouping === 'week') {
      const weeks = chartDateRange === '90d' ? 12 : chartDateRange === '1y' ? 52 : 6;
      return Array.from({ length: weeks }, (_, i) => ({
        label: `Week ${i + 1}`,
        newMRR: Math.floor(Math.random() * 200000) + 400000,
        expansion: Math.floor(Math.random() * 100000) + 150000,
        contraction: -Math.floor(Math.random() * 40000) - 60000,
        churn: -Math.floor(Math.random() * 60000) - 100000,
        netMRR: Math.floor(Math.random() * 150000) + 350000
      }));
    } else {
      // Month grouping
      return [
        { label: 'Jan', newMRR: 450000, expansion: 180000, contraction: -80000, churn: -150000, netMRR: 400000 },
        { label: 'Feb', newMRR: 520000, expansion: 200000, contraction: -90000, churn: -130000, netMRR: 500000 },
        { label: 'Mar', newMRR: 480000, expansion: 220000, contraction: -70000, churn: -140000, netMRR: 490000 },
        { label: 'Apr', newMRR: 550000, expansion: 190000, contraction: -85000, churn: -145000, netMRR: 510000 },
        { label: 'May', newMRR: 600000, expansion: 210000, contraction: -75000, churn: -135000, netMRR: 600000 },
        { label: 'Jun', newMRR: 580000, expansion: 230000, contraction: -80000, churn: -120000, netMRR: 610000 },
      ];
    }
  };

  // Dynamic ARR Forecast Data
  const getARRForecastData = () => {
    if (chartGrouping === 'hour' && (chartDateRange === '7d' || chartDateRange === '30d')) {
      return Array.from({ length: 24 }, (_, i) => ({
        label: `${i}:00`,
        actual: i < 12 ? Math.floor(Math.random() * 2000000) + 50000000 : null,
        forecast: Math.floor(Math.random() * 2500000) + 51000000
      }));
    } else if (chartGrouping === 'day') {
      const days = chartDateRange === '7d' ? 7 : chartDateRange === '30d' ? 30 : 30;
      return Array.from({ length: days }, (_, i) => ({
        label: `Day ${i + 1}`,
        actual: i < days * 0.6 ? Math.floor(Math.random() * 3000000) + 52000000 : null,
        forecast: Math.floor(Math.random() * 3500000) + 53000000
      }));
    } else if (chartGrouping === 'week') {
      const weeks = chartDateRange === '90d' ? 12 : chartDateRange === '1y' ? 52 : 6;
      return Array.from({ length: weeks }, (_, i) => ({
        label: `Week ${i + 1}`,
        actual: i < weeks * 0.5 ? Math.floor(Math.random() * 4000000) + 50000000 : null,
        forecast: Math.floor(Math.random() * 5000000) + 52000000
      }));
    } else {
      // Month grouping
      return [
        { label: 'Nov', actual: 52000000, forecast: 52000000 },
        { label: 'Dec', actual: 54000000, forecast: 54200000 },
        { label: 'Jan', actual: 56000000, forecast: 56500000 },
        { label: 'Feb', actual: 58200000, forecast: 58800000 },
        { label: 'Mar', actual: null, forecast: 61200000 },
        { label: 'Apr', actual: null, forecast: 63500000 },
        { label: 'May', actual: null, forecast: 65000000 },
      ];
    }
  };

  const mrrMovementData = getMRRMovementData();
  const arrForecastData = getARRForecastData();

  // Revenue by Customer Segment
  const segmentRevenueData = [
    { segment: 'Enterprise', revenue: 18500000, customers: 45, avgRevenue: 411111 },
    { segment: 'Professional', revenue: 24300000, customers: 243, avgRevenue: 100000 },
    { segment: 'Starter', revenue: 14200000, customers: 473, avgRevenue: 30021 },
    { segment: 'Free', revenue: 0, customers: 1250, avgRevenue: 0 },
  ];

  // Revenue Distribution
  const revenueDistributionData = [
    { name: 'Subscriptions', value: 42000000, percentage: 72 },
    { name: 'Credits', value: 8500000, percentage: 15 },
    { name: 'Payment Fees', value: 5200000, percentage: 9 },
    { name: 'Add-ons', value: 2500000, percentage: 4 },
  ];

  // Cohort Analysis
  const cohortData = [
    { cohort: 'Jan 24', m0: 100, m1: 92, m2: 88, m3: 85, m4: 82, m5: 80 },
    { cohort: 'Feb 24', m0: 100, m1: 94, m2: 90, m3: 87, m4: 84, m5: null },
    { cohort: 'Mar 24', m0: 100, m1: 95, m2: 91, m3: 88, m4: null, m5: null },
    { cohort: 'Apr 24', m0: 100, m1: 96, m2: 93, m3: null, m4: null, m5: null },
    { cohort: 'May 24', m0: 100, m1: 97, m2: null, m3: null, m4: null, m5: null },
    { cohort: 'Jun 24', m0: 100, m1: null, m2: null, m3: null, m4: null, m5: null },
  ];

  const COLORS = ['#E91E63', '#9C27B0', '#2196F3', '#4CAF50'];

  // Tab 1: MRR & ARR Analysis
  const renderMRRARRTab = () => (
    <Box>
      {/* Chart Filters */}
      <Card sx={{ mb: 3, p: 2, bgcolor: 'grey.50' }}>
        <Typography variant="body2" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Timeline fontSize="small" /> Chart Filters (Date Range & Grouping)
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* Date Range Filter */}
          <Box sx={{ flex: 1, minWidth: 250 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              Date Range
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {['7d', '30d', '90d', '1y', 'all'].map((range) => (
                <Chip
                  key={range}
                  label={range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : range === '1y' ? '1 Year' : 'All Time'}
                  onClick={() => setChartDateRange(range as any)}
                  color={chartDateRange === range ? 'primary' : 'default'}
                  variant={chartDateRange === range ? 'filled' : 'outlined'}
                  size="small"
                />
              ))}
            </Box>
          </Box>

          <Divider orientation="vertical" flexItem />

          {/* Group By Filter */}
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              Group By
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              <Chip
                label="Hour"
                onClick={() => setChartGrouping('hour')}
                color={chartGrouping === 'hour' ? 'secondary' : 'default'}
                variant={chartGrouping === 'hour' ? 'filled' : 'outlined'}
                size="small"
                disabled={!(chartDateRange === '7d' || chartDateRange === '30d')}
              />
              <Chip
                label="Day"
                onClick={() => setChartGrouping('day')}
                color={chartGrouping === 'day' ? 'secondary' : 'default'}
                variant={chartGrouping === 'day' ? 'filled' : 'outlined'}
                size="small"
              />
              <Chip
                label="Week"
                onClick={() => setChartGrouping('week')}
                color={chartGrouping === 'week' ? 'secondary' : 'default'}
                variant={chartGrouping === 'week' ? 'filled' : 'outlined'}
                size="small"
                disabled={chartDateRange === '7d'}
              />
              <Chip
                label="Month"
                onClick={() => setChartGrouping('month')}
                color={chartGrouping === 'month' ? 'secondary' : 'default'}
                variant={chartGrouping === 'month' ? 'filled' : 'outlined'}
                size="small"
              />
            </Box>
          </Box>
        </Box>

        {/* Active Filter Summary */}
        <Stack direction="row" spacing={1} sx={{ mt: 2 }} alignItems="center">
          <Chip
            label={`Range: ${chartDateRange === '7d' ? '7 Days' : chartDateRange === '30d' ? '30 Days' : chartDateRange === '90d' ? '90 Days' : chartDateRange === '1y' ? '1 Year' : 'All Time'}`}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`Grouping: ${chartGrouping.charAt(0).toUpperCase() + chartGrouping.slice(1)}`}
            size="small"
            color="secondary"
            variant="outlined"
          />
        </Stack>
      </Card>

      {/* Key Metrics */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Monthly Recurring Revenue
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {formatCurrency(mrrMetrics.currentMRR)}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                  <Chip
                    label={`+${mrrMetrics.mrrGrowth}%`}
                    size="small"
                    color="success"
                    icon={<TrendingUp />}
                  />
                  <Typography variant="caption" color="text.secondary">
                    vs last month
                  </Typography>
                </Stack>
              </Box>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <Timeline />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Annual Recurring Revenue
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {formatCurrency(mrrMetrics.arr)}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Projected: {formatCurrency(mrrMetrics.projectedARR)}
                  </Typography>
                </Stack>
              </Box>
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <AccountBalance />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Avg Revenue Per Customer
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {formatCurrency(mrrMetrics.avgRevenuePerCustomer)}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                  <Chip label="+8%" size="small" color="success" icon={<TrendingUp />} />
                  <Typography variant="caption" color="text.secondary">
                    vs last quarter
                  </Typography>
                </Stack>
              </Box>
              <Avatar sx={{ bgcolor: 'secondary.main' }}>
                <Assessment />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* MRR Movement Chart */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            MRR Movement Analysis - By {chartGrouping.charAt(0).toUpperCase() + chartGrouping.slice(1)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Track new, expansion, contraction, and churn MRR
          </Typography>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={mrrMovementData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Bar dataKey="newMRR" stackId="a" fill="#4CAF50" name="New MRR" />
              <Bar dataKey="expansion" stackId="a" fill="#2196F3" name="Expansion" />
              <Bar dataKey="contraction" stackId="a" fill="#FF9800" name="Contraction" />
              <Bar dataKey="churn" stackId="a" fill="#F44336" name="Churn" />
              <Line
                type="monotone"
                dataKey="netMRR"
                stroke="#E91E63"
                strokeWidth={3}
                name="Net MRR"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ARR Forecast */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            ARR Forecast - By {chartGrouping.charAt(0).toUpperCase() + chartGrouping.slice(1)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Projected annual recurring revenue based on current trends
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={arrForecastData}>
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E91E63" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#E91E63" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9C27B0" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#9C27B0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="#E91E63"
                fillOpacity={1}
                fill="url(#colorActual)"
                name="Actual ARR"
              />
              <Area
                type="monotone"
                dataKey="forecast"
                stroke="#9C27B0"
                strokeDasharray="5 5"
                fillOpacity={1}
                fill="url(#colorForecast)"
                name="Forecasted ARR"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Box>
  );

  // Tab 2: Revenue Breakdown
  const renderRevenueBreakdownTab = () => (
    <Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3, mb: 3 }}>
        {/* Revenue by Segment */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Revenue by Customer Segment
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={segmentRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="segment" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Bar dataKey="revenue" fill="#E91E63" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Distribution */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Revenue Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ payload, percent }: PieLabelRenderProps) =>
                    `${payload?.name ?? ''}: ${percent != null ? (percent * 100).toFixed(1) : '0'}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {revenueDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Box>

      {/* Segment Details Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Segment Performance Details
          </Typography>
          <Box sx={{ mt: 2 }}>
            {segmentRevenueData.map((segment, index) => (
              <Paper key={index} sx={{ p: 2, mb: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {segment.segment}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {segment.customers} customers
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1, textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      {formatCurrency(segment.revenue)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Revenue
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1, textAlign: 'right' }}>
                    <Typography variant="h6" fontWeight="bold">
                      {formatCurrency(segment.avgRevenue)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Avg per Customer
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  // Tab 3: Cohort Analysis
  const renderCohortTab = () => (
    <Box>
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Revenue Retention Cohort Analysis
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Track customer retention and revenue retention by cohort
          </Typography>

          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>
                    Cohort
                  </th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e0e0e0' }}>
                    M0
                  </th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e0e0e0' }}>
                    M1
                  </th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e0e0e0' }}>
                    M2
                  </th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e0e0e0' }}>
                    M3
                  </th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e0e0e0' }}>
                    M4
                  </th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e0e0e0' }}>
                    M5
                  </th>
                </tr>
              </thead>
              <tbody>
                {cohortData.map((cohort, index) => (
                  <tr key={index}>
                    <td style={{ padding: '12px', fontWeight: 'bold', borderBottom: '1px solid #e0e0e0' }}>
                      {cohort.cohort}
                    </td>
                    {[cohort.m0, cohort.m1, cohort.m2, cohort.m3, cohort.m4, cohort.m5].map(
                      (value, i) => (
                        <td
                          key={i}
                          style={{
                            padding: '12px',
                            textAlign: 'center',
                            borderBottom: '1px solid #e0e0e0',
                            backgroundColor: value
                              ? `rgba(233, 30, 99, ${value / 100})`
                              : 'transparent',
                            color: value && value < 60 ? 'white' : 'inherit',
                          }}
                        >
                          {value ? `${value}%` : '-'}
                        </td>
                      )
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>

          <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Key Insights
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2">
                • Average M1 retention: 94.5% (Excellent)
              </Typography>
              <Typography variant="body2">
                • Average M3 retention: 87.5% (Above industry standard)
              </Typography>
              <Typography variant="body2">
                • Recent cohorts showing improved retention trends
              </Typography>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Revenue Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Advanced MRR/ARR analysis, forecasting, and cohort insights
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="6months">Last 6 Months</MenuItem>
              <MenuItem value="12months">Last 12 Months</MenuItem>
              <MenuItem value="24months">Last 24 Months</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined">Export Report</Button>
        </Stack>
      </Stack>

      {/* Tabs */}
      <Card>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab label="MRR & ARR" icon={<Timeline />} iconPosition="start" />
          <Tab label="Revenue Breakdown" icon={<PieChartIcon />} iconPosition="start" />
          <Tab label="Cohort Analysis" icon={<Assessment />} iconPosition="start" />
        </Tabs>

        <CardContent sx={{ p: 3 }}>
          {activeTab === 0 && renderMRRARRTab()}
          {activeTab === 1 && renderRevenueBreakdownTab()}
          {activeTab === 2 && renderCohortTab()}
        </CardContent>
      </Card>
    </Box>
  );
};

export default RevenueAnalytics;

