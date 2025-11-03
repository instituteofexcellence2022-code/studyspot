// ============================================
// SUBSCRIPTION MANAGEMENT PAGE - 5 TABS
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
  Button,
  TextField,
  GridLegacy as Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Divider,
  Stack,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  People,
  Refresh,
  Download,
  Edit,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAppSelector } from '../../../hooks/redux';

const SubscriptionManagement: React.FC = () => {
  const { subscriptions, changes, plans, analytics } = useAppSelector(
    (state) => state.subscriptions
  );

  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Chart filters - Date Range & Grouping
  const [chartDateRange, setChartDateRange] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('30d');
  const [chartGrouping, setChartGrouping] = useState<'hour' | 'day' | 'week' | 'month'>('month');

  // Format currency
  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'trial': return 'info';
      case 'cancelled': return 'error';
      case 'expired': return 'default';
      case 'past_due': return 'warning';
      default: return 'default';
    }
  };

  // Get change type color
  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case 'upgrade': return 'success';
      case 'downgrade': return 'warning';
      case 'cancel': return 'error';
      case 'renewal': return 'info';
      case 'reactivate': return 'success';
      default: return 'default';
    }
  };

  // Filter subscriptions
  const filteredSubscriptions = subscriptions.filter((sub) =>
    sub.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.planName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Dynamic Subscription growth data
  const getGrowthData = () => {
    if (chartGrouping === 'hour' && (chartDateRange === '7d' || chartDateRange === '30d')) {
      return Array.from({ length: 24 }, (_, i) => ({
        label: `${i}:00`,
        count: Math.floor(Math.random() * 20) + 10
      }));
    } else if (chartGrouping === 'day') {
      const days = chartDateRange === '7d' ? 7 : chartDateRange === '30d' ? 30 : 30;
      return Array.from({ length: days }, (_, i) => ({
        label: `Day ${i + 1}`,
        count: Math.floor(Math.random() * 50) + 200
      }));
    } else if (chartGrouping === 'week') {
      const weeks = chartDateRange === '90d' ? 12 : chartDateRange === '1y' ? 52 : 6;
      return Array.from({ length: weeks }, (_, i) => ({
        label: `Week ${i + 1}`,
        count: Math.floor(Math.random() * 80) + 200
      }));
    } else {
      // Month grouping
      return [
        { label: 'May', count: 210 },
        { label: 'Jun', count: 225 },
        { label: 'Jul', count: 238 },
        { label: 'Aug', count: 245 },
        { label: 'Sep', count: 255 },
        { label: 'Oct', count: 267 },
      ];
    }
  };

  const growthData = getGrowthData();

  // Plan distribution
  const planDistribution = plans.map((plan) => ({
    name: plan.name,
    value: plan.subscriberCount,
    color: plan.name === 'Free' ? '#9E9E9E' :
           plan.name === 'Starter' ? '#4FC3F7' :
           plan.name === 'Pro' ? '#7B2CBF' : '#E91E63',
  }));

  // DataGrid columns for Active Subscriptions
  const subscriptionColumns: GridColDef[] = [
    {
      field: 'tenantName',
      headerName: 'Tenant',
      flex: 1,
      minWidth: 180,
    },
    {
      field: 'planName',
      headerName: 'Plan',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          color="primary"
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value as string) as any}
          size="small"
        />
      ),
    },
    {
      field: 'billingCycle',
      headerName: 'Billing',
      width: 100,
      valueFormatter: (value) => value === 'monthly' ? 'Monthly' : 'Annual',
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 120,
      valueFormatter: (value) => formatCurrency(value),
    },
    {
      field: 'nextBillingDate',
      headerName: 'Next Billing',
      width: 130,
      valueFormatter: (value) => value ? new Date(value).toLocaleDateString() : '-',
    },
    {
      field: 'startDate',
      headerName: 'Start Date',
      width: 130,
      valueFormatter: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  // Render Active Subscriptions Tab
  const renderActiveSubscriptionsTab = () => (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              placeholder="Search subscriptions..."
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ minWidth: 300 }}
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip label="All (4)" color="default" />
              <Chip label="Active (2)" color="success" variant="outlined" />
              <Chip label="Trial (1)" color="info" variant="outlined" />
              <Chip label="Cancelled (0)" color="error" variant="outlined" />
            </Box>
            <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
              <Button variant="outlined" startIcon={<Refresh />}>Refresh</Button>
              <Button variant="contained" startIcon={<Download />}>Export</Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <DataGrid
          rows={filteredSubscriptions}
          columns={subscriptionColumns}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          disableRowSelectionOnClick
          autoHeight
        />
      </Card>
    </Box>
  );

  // Render Changes Tab
  const renderChangesTab = () => (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search changes..."
              size="small"
              sx={{ minWidth: 300 }}
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip label="All" color="default" />
              <Chip label="Upgrades" color="success" variant="outlined" />
              <Chip label="Downgrades" color="warning" variant="outlined" />
              <Chip label="Cancellations" color="error" variant="outlined" />
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Tenant</TableCell>
                <TableCell>Change Type</TableCell>
                <TableCell>Old Plan</TableCell>
                <TableCell>New Plan</TableCell>
                <TableCell>Revenue Impact</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {changes.map((change) => (
                <TableRow key={change.id}>
                  <TableCell>{new Date(change.timestamp).toLocaleDateString()}</TableCell>
                  <TableCell>{change.tenantName}</TableCell>
                  <TableCell>
                    <Chip
                      label={change.changeType}
                      color={getChangeTypeColor(change.changeType) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{change.oldPlanName}</TableCell>
                  <TableCell>{change.newPlanName}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color={change.revenueImpact >= 0 ? 'success.main' : 'error.main'}
                      fontWeight="bold"
                    >
                      {change.revenueImpact >= 0 ? '+' : ''}{formatCurrency(Math.abs(change.revenueImpact))}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );

  // Render Analytics Tab
  const renderAnalyticsTab = () => (
    <Box>
      {/* Chart Filters */}
      <Card sx={{ mb: 3, p: 2, bgcolor: 'grey.50' }}>
        <Typography variant="body2" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <TrendingUp fontSize="small" /> Chart Filters (Date Range & Grouping)
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
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
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
        </Box>
      </Card>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Active Subscriptions
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ my: 1 }}>
                    {analytics.activeSubscriptions}
                  </Typography>
                  <Chip icon={<TrendingUp />} label={`+${analytics.growthRate}%`} color="success" size="small" />
                </Box>
                <IconButton sx={{ bgcolor: 'primary.light', color: 'primary.main' }}>
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
                    Monthly Recurring Revenue
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ my: 1 }}>
                    {formatCurrency(analytics.mrr)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    MRR
                  </Typography>
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
                    Churn Rate
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ my: 1 }}>
                    {analytics.churnRate}%
                  </Typography>
                  <Chip icon={<TrendingDown />} label="Good" color="success" size="small" />
                </Box>
                <IconButton sx={{ bgcolor: 'warning.light', color: 'warning.main' }}>
                  <TrendingDown />
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
                    Lifetime Value
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ my: 1 }}>
                    {formatCurrency(analytics.lifetimeValue)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg {analytics.averageLifetime.toFixed(1)} months
                  </Typography>
                </Box>
                <IconButton sx={{ bgcolor: 'info.light', color: 'info.main' }}>
                  <AttachMoney />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Subscription Growth - By {chartGrouping.charAt(0).toUpperCase() + chartGrouping.slice(1)}
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#7B2CBF" strokeWidth={3} name="Subscriptions" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Plan Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={planDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.name}: ${entry.value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {planDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  // Render Plan Comparison Tab
  const renderPlanComparisonTab = () => (
    <Box>
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Feature Comparison
          </Typography>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Feature</strong></TableCell>
                  {plans.map((plan) => (
                    <TableCell key={plan.id} align="center">
                      <strong>{plan.name}</strong>
                      <Typography variant="body2" color="text.secondary">
                        {formatCurrency(plan.price.monthly)}/mo
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Libraries</TableCell>
                  {plans.map((plan) => (
                    <TableCell key={plan.id} align="center">
                      {plan.limits.maxLibraries === -1 ? 'Unlimited' : plan.limits.maxLibraries}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell>Users</TableCell>
                  {plans.map((plan) => (
                    <TableCell key={plan.id} align="center">
                      {plan.limits.maxUsers === -1 ? 'Unlimited' : plan.limits.maxUsers}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell>Seats</TableCell>
                  {plans.map((plan) => (
                    <TableCell key={plan.id} align="center">
                      {plan.limits.maxSeats === -1 ? 'Unlimited' : plan.limits.maxSeats}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell>Storage</TableCell>
                  {plans.map((plan) => (
                    <TableCell key={plan.id} align="center">
                      {plan.limits.storageGB}GB
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell>API Calls</TableCell>
                  {plans.map((plan) => (
                    <TableCell key={plan.id} align="center">
                      {plan.limits.apiCallsPerMonth === -1 ? 'Unlimited' : `${(plan.limits.apiCallsPerMonth / 1000).toFixed(0)}K/mo`}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell>Support</TableCell>
                  <TableCell align="center">Email</TableCell>
                  <TableCell align="center">Priority Email</TableCell>
                  <TableCell align="center">24/7 Phone & Email</TableCell>
                  <TableCell align="center">Dedicated Manager</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Mobile App</TableCell>
                  {plans.map((plan) => (
                    <TableCell key={plan.id} align="center">
                      <CheckCircle color="success" />
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell>API Access</TableCell>
                  <TableCell align="center"><Cancel color="error" /></TableCell>
                  <TableCell align="center"><Cancel color="error" /></TableCell>
                  <TableCell align="center"><CheckCircle color="success" /></TableCell>
                  <TableCell align="center"><CheckCircle color="success" /></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );

  // Render Plan Configuration Tab
  const renderPlanConfigurationTab = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          Subscription Plans
        </Typography>
        <Button variant="contained">Create New Plan</Button>
      </Box>

      <Grid container spacing={3}>
        {plans.map((plan) => (
          <Grid item xs={12} sm={6} md={3} key={plan.id}>
            <Card
              sx={{
                border: plan.isPopular ? '2px solid #7B2CBF' : '1px solid #eee',
                position: 'relative',
              }}
            >
              {plan.isPopular && (
                <Chip
                  label="Most Popular"
                  color="primary"
                  size="small"
                  sx={{ position: 'absolute', top: 10, right: 10 }}
                />
              )}
              <CardContent>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  {plan.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {plan.description}
                </Typography>

                <Box sx={{ my: 2 }}>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {formatCurrency(plan.price.monthly)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    per month
                  </Typography>
                  {plan.price.annual > 0 && (
                    <Typography variant="body2" color="success.main">
                      {formatCurrency(plan.price.annual)}/year (Save 17%)
                    </Typography>
                  )}
                </Box>

                <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, my: 2 }}>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>{plan.subscriberCount}</strong> subscribers
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>{plan.features.length}</strong> features
                  </Typography>
                  {plan.trialDays > 0 && (
                    <Typography variant="body2">
                      <strong>{plan.trialDays}</strong> days trial
                    </Typography>
                  )}
                </Box>

                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Edit />}
                  sx={{ mt: 2 }}
                >
                  Edit Plan
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Subscription Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage all tenant subscriptions, plans, and billing
        </Typography>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label={`Active Subscriptions (${subscriptions.length})`} />
        <Tab label={`Changes (${changes.length})`} />
        <Tab label="Analytics" />
        <Tab label="Plan Comparison" />
        <Tab label="Plan Configuration" />
      </Tabs>

      {/* Tab Content */}
      {activeTab === 0 && renderActiveSubscriptionsTab()}
      {activeTab === 1 && renderChangesTab()}
      {activeTab === 2 && renderAnalyticsTab()}
      {activeTab === 3 && renderPlanComparisonTab()}
      {activeTab === 4 && renderPlanConfigurationTab()}
    </Box>
  );
};

export default SubscriptionManagement;

