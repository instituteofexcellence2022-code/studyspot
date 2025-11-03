import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Paper,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  People,
  AttachMoney,
  ShowChart,
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
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { revenueService } from '../../../services/api/revenue';
import { RevenueAnalytics } from '../types';

const COLORS = ['#9c27b0', '#2196f3', '#4caf50', '#ff9800', '#f44336'];

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

const RevenueDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RevenueAnalytics | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await revenueService.getRevenueAnalytics();

      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.error?.message || 'Failed to load revenue data');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !data) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error || 'No data available'}</Alert>
      </Container>
    );
  }

  const { metrics, revenueData, revenueByPlan, topTenants, recentTransactions } = data;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Revenue & Billing
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor revenue metrics, track subscriptions, and analyze financial performance
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 4 }}>
        {/* MRR Card */}
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Monthly Recurring Revenue
                </Typography>
                <Typography variant="h4" fontWeight={600}>
                  {formatCurrency(metrics.mrr)}
                </Typography>
                <Box display="flex" alignItems="center" mt={1}>
                  <TrendingUp sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                  <Typography variant="body2" color="success.main">
                    {formatPercentage(metrics.growthRate)} vs last month
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText',
                }}
              >
                <AttachMoney />
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* ARR Card */}
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Annual Recurring Revenue
                </Typography>
                <Typography variant="h4" fontWeight={600}>
                  {formatCurrency(metrics.arr)}
                </Typography>
                <Box display="flex" alignItems="center" mt={1}>
                  <ShowChart sx={{ fontSize: 16, color: 'info.main', mr: 0.5 }} />
                  <Typography variant="body2" color="info.main">
                    {formatCurrency(metrics.mrr * 12)} projected
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  backgroundColor: 'info.light',
                  color: 'info.contrastText',
                }}
              >
                <AccountBalance />
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Churn Rate Card */}
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Churn Rate
                </Typography>
                <Typography variant="h4" fontWeight={600}>
                  {metrics.churnRate}%
                </Typography>
                <Box display="flex" alignItems="center" mt={1}>
                  <TrendingDown sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                  <Typography variant="body2" color="success.main">
                    -0.5% vs last month
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  backgroundColor: metrics.churnRate > 5 ? 'error.light' : 'success.light',
                  color: metrics.churnRate > 5 ? 'error.contrastText' : 'success.contrastText',
                }}
              >
                <People />
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* ARPU Card */}
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Average Revenue Per User
                </Typography>
                <Typography variant="h4" fontWeight={600}>
                  {formatCurrency(metrics.arpu)}
                </Typography>
                <Box display="flex" alignItems="center" mt={1}>
                  <TrendingUp sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                  <Typography variant="body2" color="success.main">
                    +5.2% vs last month
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  backgroundColor: 'warning.light',
                  color: 'warning.contrastText',
                }}
              >
                <AttachMoney />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Charts Section */}
      <Paper sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Revenue Trend" />
            <Tab label="Revenue by Plan" />
            <Tab label="MRR Breakdown" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Revenue Trend (Last 12 Months)
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#9c27b0" strokeWidth={2} name="Revenue" />
                <Line type="monotone" dataKey="mrr" stroke="#2196f3" strokeWidth={2} name="MRR" />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Revenue Distribution by Plan
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={revenueByPlan as any}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name}: ${entry.percentage}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {revenueByPlan.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              MRR Components
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={revenueData.slice(-6)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="newMRR" stackId="a" fill="#4caf50" name="New MRR" />
                <Bar dataKey="expansion" stackId="a" fill="#2196f3" name="Expansion" />
                <Bar dataKey="contraction" stackId="a" fill="#ff9800" name="Contraction" />
                <Bar dataKey="churn" stackId="a" fill="#f44336" name="Churn" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </TabPanel>
      </Paper>

      {/* Bottom Section: Top Tenants & Recent Transactions */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {/* Top Revenue Tenants */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Top Revenue Tenants
            </Typography>
            <Box>
              {topTenants.map((tenant) => (
                <Box
                  key={tenant.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 0 },
                  }}
                >
                  <Box>
                    <Typography variant="body1" fontWeight={500}>
                      {tenant.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {tenant.plan}
                    </Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="body1" fontWeight={500}>
                      {formatCurrency(tenant.revenue)}
                    </Typography>
                    <Typography
                      variant="body2"
                      color={tenant.growth >= 0 ? 'success.main' : 'error.main'}
                    >
                      {formatPercentage(tenant.growth)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Transactions
            </Typography>
            <Box>
              {recentTransactions.map((transaction) => (
                <Box
                  key={transaction.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 0 },
                  }}
                >
                  <Box>
                    <Typography variant="body1" fontWeight={500}>
                      {transaction.tenantName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {transaction.type} • {transaction.paymentMethod}
                    </Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="body1" fontWeight={500}>
                      {formatCurrency(transaction.amount)}
                    </Typography>
                    <Typography
                      variant="body2"
                      color={
                        transaction.status === 'completed'
                          ? 'success.main'
                          : transaction.status === 'pending'
                          ? 'warning.main'
                          : 'error.main'
                      }
                    >
                      {transaction.status}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default RevenueDashboard;

