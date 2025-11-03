import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  InputAdornment,
  Divider,
  LinearProgress,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Refresh,
  TrendingUp,
  TrendingDown,
  Search,
  Visibility,
  Edit,
  Cancel,
  PlayArrow,
  Pause,
  CheckCircle,
  Error as ErrorIcon,
  Warning,
  Timeline,
  BarChart as BarChartIcon,
  CompareArrows,
  Subscriptions as SubscriptionsIcon,
  Add,
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
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { subscriptionsService } from '../../../services/api/subscriptions';
import {
  Subscription,
  SubscriptionChange,
  SubscriptionAnalytics,
  PlanComparison,
  SubscriptionDashboardData,
} from '../types';
import { useAppDispatch } from '../../../hooks/redux';
import { showError, showSuccess } from '../../../store/slices/uiSlice';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const SubscriptionManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [dashboardData, setDashboardData] = useState<SubscriptionDashboardData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const response = await subscriptionsService.getDashboardData();
      if (response.success && response.data) {
        setDashboardData(response.data);
      } else {
        throw new Error(response.error?.message || 'Failed to load data');
      }
    } catch (err: any) {
      dispatch(showError(err.message || 'Failed to load subscription data'));
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number | string) => {
    if (typeof num === 'string') return num;
    if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getStatusColor = (status: string): 'success' | 'info' | 'error' | 'warning' | 'default' => {
    switch (status) {
      case 'active':
        return 'success';
      case 'trial':
        return 'info';
      case 'expired':
      case 'cancelled':
        return 'error';
      case 'paused':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getChangeTypeColor = (type: string): 'success' | 'error' | 'info' | 'warning' => {
    switch (type) {
      case 'upgrade':
      case 'reactivation':
        return 'success';
      case 'downgrade':
      case 'cancellation':
        return 'error';
      case 'pause':
        return 'warning';
      default:
        return 'info';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading Subscription Management...
        </Typography>
      </Box>
    );
  }

  if (!dashboardData) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        Failed to load subscription data. Please try again.
      </Alert>
    );
  }

  const { analytics, subscriptions = [], recentChanges = [], planComparisons = [] } = dashboardData;

  // Filter subscriptions
  const filteredSubscriptions = subscriptions.filter((sub: Subscription) => {
    const matchesSearch = sub.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.planName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            📊 Subscription Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor subscriptions, track changes, and analyze revenue
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button variant="outlined" startIcon={<Refresh />} onClick={fetchAllData}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<SubscriptionsIcon />}>
            New Subscription
          </Button>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        <Card elevation={3} sx={{ bgcolor: 'primary.main', color: 'white' }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Total Subscriptions
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {analytics.kpis.totalSubscriptions}
                </Typography>
                <Box display="flex" alignItems="center" mt={0.5}>
                  <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
                  <Typography variant="caption">
                    {analytics.kpis.activeSubscriptions} active
                  </Typography>
                </Box>
              </Box>
              <SubscriptionsIcon sx={{ fontSize: 48, opacity: 0.3 }} />
            </Box>
          </CardContent>
        </Card>

        <Card elevation={3} sx={{ bgcolor: 'success.main', color: 'white' }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Monthly Revenue (MRR)
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {formatCurrency(analytics.kpis.totalMRR)}
                </Typography>
                <Box display="flex" alignItems="center" mt={0.5}>
                  <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
                  <Typography variant="caption">
                    +{analytics.kpis.growthRate}% growth
                  </Typography>
                </Box>
              </Box>
              <BarChartIcon sx={{ fontSize: 48, opacity: 0.3 }} />
            </Box>
          </CardContent>
        </Card>

        <Card elevation={3} sx={{ bgcolor: 'warning.main', color: 'white' }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Churn Rate
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {analytics.kpis.churnRate}%
                </Typography>
                <Box display="flex" alignItems="center" mt={0.5}>
                  <Warning sx={{ fontSize: 16, mr: 0.5 }} />
                  <Typography variant="caption">
                    {analytics.kpis.cancelledSubscriptions} cancelled
                  </Typography>
                </Box>
              </Box>
              <ErrorIcon sx={{ fontSize: 48, opacity: 0.3 }} />
            </Box>
          </CardContent>
        </Card>

        <Card elevation={3} sx={{ bgcolor: 'info.main', color: 'white' }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Retention Rate
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {analytics.kpis.retentionRate}%
                </Typography>
                <Box display="flex" alignItems="center" mt={0.5}>
                  <CheckCircle sx={{ fontSize: 16, mr: 0.5 }} />
                  <Typography variant="caption">
                    LTV: {analytics.kpis.ltv ? formatCurrency(analytics.kpis.ltv) : '-'}
                  </Typography>
                </Box>
              </Box>
              <Timeline sx={{ fontSize: 48, opacity: 0.3 }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Paper elevation={2}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': { fontWeight: 600 },
          }}
        >
          <Tab icon={<SubscriptionsIcon />} label="Active Subscriptions" iconPosition="start" />
          <Tab
            icon={
              <Badge badgeContent={recentChanges.filter((c: SubscriptionChange) => c.status === 'pending').length} color="error">
                <CompareArrows />
              </Badge>
            }
            label="Changes"
            iconPosition="start"
          />
          <Tab icon={<BarChartIcon />} label="Analytics" iconPosition="start" />
          <Tab icon={<Timeline />} label="Plan Comparison" iconPosition="start" />
          <Tab icon={<Edit />} label="Plan Configuration" iconPosition="start" />
        </Tabs>

        {/* Tab 1: Active Subscriptions */}
        <TabPanel value={tabValue} index={0}>
          <Box mb={2} display="flex" gap={2} flexWrap="wrap">
            <TextField
              placeholder="Search by tenant or plan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1, minWidth: 250 }}
            />
            <Box display="flex" gap={1}>
              {['all', 'active', 'trial', 'expired', 'cancelled', 'paused'].map((status) => (
                <Chip
                  key={status}
                  label={status.charAt(0).toUpperCase() + status.slice(1)}
                  onClick={() => setStatusFilter(status)}
                  color={statusFilter === status ? 'primary' : 'default'}
                  variant={statusFilter === status ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          </Box>

          <TableContainer component={Paper} elevation={1}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell><strong>Tenant</strong></TableCell>
                  <TableCell><strong>Plan</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Billing</strong></TableCell>
                  <TableCell align="right"><strong>MRR</strong></TableCell>
                  <TableCell align="right"><strong>ARR</strong></TableCell>
                  <TableCell><strong>Next Billing</strong></TableCell>
                  <TableCell align="center"><strong>Auto Renew</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSubscriptions.slice(0, 20).map((sub: Subscription) => (
                  <TableRow key={sub.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {sub.tenantName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {sub.seats || '-'} seats {sub.usedSeats !== undefined && `(${sub.usedSeats} used)`}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={sub.planName} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={sub.status.toUpperCase()}
                        color={getStatusColor(sub.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{sub.billingCycle}</TableCell>
                    <TableCell align="right">
                      <strong>{sub.mrr ? formatCurrency(sub.mrr) : formatCurrency(sub.amount * (sub.billingCycle === 'annual' ? 12 : 1))}</strong>
                    </TableCell>
                    <TableCell align="right">{sub.arr ? formatCurrency(sub.arr) : formatCurrency(sub.amount * (sub.billingCycle === 'annual' ? 1 : 12))}</TableCell>
                    <TableCell>
                      {sub.nextBillingDate
                        ? new Date(sub.nextBillingDate).toLocaleDateString('en-IN')
                        : sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString('en-IN') : '-'}
                      {sub.daysUntilRenewal !== undefined && sub.daysUntilRenewal > 0 && sub.daysUntilRenewal < 15 && (
                        <Chip
                          label={`${sub.daysUntilRenewal}d`}
                          size="small"
                          color="warning"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {sub.autoRenew ? (
                        <CheckCircle color="success" fontSize="small" />
                      ) : (
                        <Cancel color="error" fontSize="small" />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Details">
                        <IconButton size="small" color="primary">
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" color="primary">
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {sub.status === 'paused' ? (
                        <Tooltip title="Resume">
                          <IconButton size="small" color="success">
                            <PlayArrow fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : sub.status === 'active' ? (
                        <Tooltip title="Pause">
                          <IconButton size="small" color="warning">
                            <Pause fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Tab 2: Subscription Changes */}
        <TabPanel value={tabValue} index={1}>
          <Box mb={3}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Recent Subscription Changes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track upgrades, downgrades, cancellations, and reactivations
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 2,
            }}
          >
            {recentChanges.map((change: SubscriptionChange) => (
              <Card key={change.id} elevation={2}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {change.tenantName}
                      </Typography>
                      <Chip
                        label={(change.changeType || change.type).replace('_', ' ').toUpperCase()}
                        color={getChangeTypeColor(change.changeType || change.type)}
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                    <Chip
                      label={change.status.toUpperCase()}
                      size="small"
                      variant="outlined"
                      color={
                        change.status === 'completed'
                          ? 'success'
                          : change.status === 'pending'
                          ? 'warning'
                          : 'default'
                      }
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      From:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {change.oldPlan || change.fromPlan} {change.oldPrice && `(${formatCurrency(change.oldPrice)})`}
                    </Typography>
                  </Box>

                  {(change.newPlan || change.toPlan) && (
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        To:
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {change.newPlan || change.toPlan} {change.newPrice && `(${formatCurrency(change.newPrice)})`}
                      </Typography>
                    </Box>
                  )}

                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Difference:
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      color={(change.priceDifference || 0) > 0 ? 'success.main' : 'error.main'}
                    >
                      {(change.priceDifference || 0) > 0 ? '+' : ''}
                      {formatCurrency(Math.abs(change.priceDifference || 0))}
                    </Typography>
                  </Box>

                  {change.reason && (
                    <Alert severity="info" sx={{ mb: 2, py: 0 }}>
                      <Typography variant="caption">{change.reason}</Typography>
                    </Alert>
                  )}

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      Requested: {new Date(change.requestedDate || change.createdAt).toLocaleDateString('en-IN')}
                    </Typography>
                    {change.status === 'pending' && (
                      <Box display="flex" gap={1}>
                        <Button size="small" variant="contained" color="success">
                          Approve
                        </Button>
                        <Button size="small" variant="outlined" color="error">
                          Reject
                        </Button>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </TabPanel>

        {/* Tab 3: Analytics */}
        <TabPanel value={tabValue} index={2}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 3,
              mb: 3,
            }}
          >
            {/* Revenue Trend */}
            <Paper elevation={1} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Revenue Trend (MRR)
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={analytics.revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip formatter={(value: any) => formatCurrency(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="mrr" stroke="#4caf50" strokeWidth={2} name="MRR" />
                </LineChart>
              </ResponsiveContainer>
            </Paper>

            {/* Plan Distribution */}
            <Paper elevation={1} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Plan Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={analytics.planDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.planName}: ${entry.count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics.planDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>

            {/* New vs Churned */}
            <Paper elevation={1} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                New vs Churned Subscriptions
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analytics.revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="newSubscriptions" fill="#4caf50" name="New" />
                  <Bar dataKey="churnedSubscriptions" fill="#f44336" name="Churned" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>

            {/* Churn Analysis */}
            <Paper elevation={1} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Churn Rate Trend
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={analytics.churnAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip formatter={(value: any, name: string) => 
                    name === 'churnRate' ? `${value}%` : formatCurrency(value)
                  } />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="churnRate"
                    stroke="#ff9800"
                    fill="#ff9800"
                    name="Churn Rate (%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Box>
        </TabPanel>

        {/* Tab 4: Plan Comparison */}
        <TabPanel value={tabValue} index={3}>
          <Box mb={3}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Subscription Plan Comparison
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Compare features, pricing, and subscriber counts across all plans
            </Typography>
          </Box>

          <TableContainer component={Paper} elevation={1}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell><strong>Feature</strong></TableCell>
                  {planComparisons.map((plan, idx) => (
                    <TableCell key={plan.planId || `plan-${idx}`} align="center">
                      <Box>
                        {plan.planName && (
                          <React.Fragment>
                            <Typography variant="h6" fontWeight={700}>
                              {plan.planName}
                            </Typography>
                            <Typography variant="h5" color="primary" fontWeight={700}>
                              {plan.price && formatCurrency(plan.price)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {plan.billingCycle}
                            </Typography>
                            {plan.popular && (
                              <Chip label="POPULAR" color="primary" size="small" sx={{ mt: 1 }} />
                            )}
                            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                              {plan.activeSubscriptions || 0} subscribers
                            </Typography>
                          </React.Fragment>
                        )}
                      </Box>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Core Features */}
                <TableRow>
                  <TableCell colSpan={5} sx={{ bgcolor: 'grey.50', fontWeight: 700 }}>
                    Core Features
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Libraries</TableCell>
                  {planComparisons.map((plan, idx) => (
                    <TableCell key={plan.planId || `plan-${idx}`} align="center">
                      {plan.limits?.libraries || '-'}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell>Students</TableCell>
                  {planComparisons.map((plan, idx) => (
                    <TableCell key={plan.planId || `plan-${idx}`} align="center">
                      {plan.limits?.students || '-'}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell>Staff Members</TableCell>
                  {planComparisons.map((plan, idx) => (
                    <TableCell key={plan.planId || `plan-${idx}`} align="center">
                      {plan.limits?.staff || '-'}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell>Storage</TableCell>
                  {planComparisons.map((plan, idx) => (
                    <TableCell key={plan.planId || `plan-${idx}`} align="center">
                      {plan.limits?.storage || '-'}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Communication Credits */}
                <TableRow>
                  <TableCell colSpan={5} sx={{ bgcolor: 'grey.50', fontWeight: 700 }}>
                    Monthly Communication Credits
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>SMS Credits</TableCell>
                  {planComparisons.map((plan, idx) => (
                    <TableCell key={plan.planId || `plan-${idx}`} align="center">
                      {plan.limits?.smsCredits ? formatNumber(plan.limits.smsCredits) : '-'}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell>WhatsApp Credits</TableCell>
                  {planComparisons.map((plan, idx) => (
                    <TableCell key={plan.planId || `plan-${idx}`} align="center">
                      {plan.limits?.whatsappCredits ? formatNumber(plan.limits.whatsappCredits) : '-'}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell>Email Credits</TableCell>
                  {planComparisons.map((plan, idx) => (
                    <TableCell key={plan.planId || `plan-${idx}`} align="center">
                      {plan.limits?.emailCredits ? (plan.limits.emailCredits === 999999 ? 'Unlimited' : formatNumber(plan.limits.emailCredits)) : '-'}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Revenue */}
                <TableRow>
                  <TableCell colSpan={5} sx={{ bgcolor: 'grey.50', fontWeight: 700 }}>
                    Revenue Metrics
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Monthly Revenue</strong></TableCell>
                  {planComparisons.map((plan, idx) => (
                    <TableCell key={plan.planId || `plan-${idx}`} align="center">
                      <strong>{plan.totalRevenue ? formatCurrency(plan.totalRevenue) : '-'}</strong>
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Tab 5: Plan Configuration */}
        <TabPanel value={tabValue} index={4}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Subscription Plan Configuration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create and manage subscription plans, pricing, and features
              </Typography>
            </Box>
            <Button variant="contained" startIcon={<Add />}>
              Create New Plan
            </Button>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: 2,
              mb: 3,
            }}
          >
            {planComparisons.map((plan, idx) => (
              <Card
                key={plan.planId || `plan-${idx}`}
                elevation={3}
                sx={{
                  border: plan.popular ? 3 : 0,
                  borderColor: 'primary.main',
                  position: 'relative',
                  height: '100%',
                }}
              >
                {plan.popular && (
                  <Chip
                    label="POPULAR"
                    color="primary"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      fontWeight: 700,
                      zIndex: 1,
                    }}
                  />
                )}
                <CardContent>
                  {plan.planName && (
                    <React.Fragment>
                      <Typography variant="h5" fontWeight={700} gutterBottom color="primary">
                        {plan.planName}
                      </Typography>
                      <Typography variant="h3" fontWeight={700} gutterBottom>
                        {plan.price ? formatCurrency(plan.price) : '-'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        per month
                      </Typography>

                      <Divider sx={{ my: 2 }} />

                      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        LIMITS
                      </Typography>
                      <Box mb={2}>
                        <Typography variant="body2">
                          <strong>Libraries:</strong> {plan.limits?.libraries || '-'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Students:</strong> {plan.limits?.students || '-'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Staff:</strong> {plan.limits?.staff || '-'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Storage:</strong> {plan.limits?.storage || '-'}
                        </Typography>
                      </Box>

                      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        COMMUNICATION CREDITS (Monthly)
                      </Typography>
                      <Box mb={2}>
                        <Typography variant="body2">
                          <strong>SMS:</strong> {plan.limits?.smsCredits ? formatNumber(plan.limits.smsCredits) : '-'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>WhatsApp:</strong> {plan.limits?.whatsappCredits ? formatNumber(plan.limits.whatsappCredits) : '-'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Email:</strong>{' '}
                          {plan.limits?.emailCredits ? (plan.limits.emailCredits === 999999
                            ? 'Unlimited'
                            : formatNumber(plan.limits.emailCredits)) : '-'}
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2" color="text.secondary">
                          Active Subs:
                        </Typography>
                        <Chip
                          label={plan.activeSubscriptions || 0}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>

                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="body2" color="text.secondary">
                          Monthly Revenue:
                        </Typography>
                        <Typography variant="body2" fontWeight={600} color="success.main">
                          {plan.totalRevenue ? formatCurrency(plan.totalRevenue) : '-'}
                        </Typography>
                      </Box>

                      <Box display="flex" gap={1}>
                        <Button
                          fullWidth
                          variant="outlined"
                          size="small"
                          startIcon={<Edit />}
                          onClick={() => dispatch(showSuccess('Edit plan feature coming soon!'))}
                        >
                          Edit
                        </Button>
                        <Tooltip title="View Details">
                          <IconButton color="primary" size="small">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </React.Fragment>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Note:</strong> Plan Configuration allows you to create, edit, and manage the subscription
              plans that tenants can choose from. Changes to plans will affect new subscriptions only. Existing
              subscriptions will retain their original plan details unless manually updated.
            </Typography>
          </Alert>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default SubscriptionManagement;
























