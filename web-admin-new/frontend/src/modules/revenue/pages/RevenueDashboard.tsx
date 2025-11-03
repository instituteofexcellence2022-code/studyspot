// ============================================
// REVENUE DASHBOARD PAGE
// ============================================

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Button,
  GridLegacy as Grid,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  PeopleOutline,
  Download,
  Refresh,
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
import { useAppSelector } from '../../../hooks/redux';

const RevenueDashboard: React.FC = () => {
  const { kpis, plans, invoices } = useAppSelector((state) => state.revenue);

  // Format currency
  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Revenue trend data (last 12 months)
  const revenueTrendData = [
    { month: 'Nov 23', revenue: 2800000 },
    { month: 'Dec 23', revenue: 3100000 },
    { month: 'Jan 24', revenue: 3400000 },
    { month: 'Feb 24', revenue: 3600000 },
    { month: 'Mar 24', revenue: 3900000 },
    { month: 'Apr 24', revenue: 4100000 },
    { month: 'May 24', revenue: 4300000 },
    { month: 'Jun 24', revenue: 4450000 },
    { month: 'Jul 24', revenue: 4600000 },
    { month: 'Aug 24', revenue: 4700000 },
    { month: 'Sep 24', revenue: 4800000 },
    { month: 'Oct 24', revenue: 4850000 },
  ];

  // Revenue by plan
  const revenueByPlanData = plans.map((plan) => ({
    name: plan.name,
    revenue: plan.price.monthly * plan.subscriberCount,
    subscribers: plan.subscriberCount,
  }));

  const COLORS = ['#9E9E9E', '#4FC3F7', '#7B2CBF', '#E91E63'];

  // MRR breakdown
  const mrrBreakdownData = [
    { category: 'New', amount: 450000 },
    { category: 'Expansion', amount: 350000 },
    { category: 'Contraction', amount: -120000 },
    { category: 'Churn', amount: -180000 },
    { category: 'Net', amount: 500000 },
  ];

  // Top revenue tenants
  const topTenants = [
    { name: 'Mumbai Study Center', revenue: 249990, plan: 'Enterprise' },
    { name: 'Delhi Central Library', revenue: 99990, plan: 'Pro' },
    { name: 'Bangalore Tech Library', revenue: 99990, plan: 'Pro' },
    { name: 'Pune Learning Hub', revenue: 99990, plan: 'Pro' },
    { name: 'Chennai Study Space', revenue: 29990, plan: 'Starter' },
  ];

  // Recent transactions
  const recentTransactions = invoices.slice(0, 5).map((inv) => ({
    id: inv.id,
    tenant: inv.tenantName,
    amount: inv.amount,
    status: inv.status,
    date: new Date(inv.createdAt).toLocaleDateString(),
  }));

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Revenue Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track revenue metrics, subscriptions, and financial performance
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<Refresh />}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<Download />}>
            Export Report
          </Button>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Monthly Recurring Revenue
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ my: 1 }}>
                    {formatCurrency(kpis.mrr)}
                  </Typography>
                  <Chip
                    icon={<TrendingUp />}
                    label={`+${kpis.growthRate}%`}
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Annual Recurring Revenue
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ my: 1 }}>
                    {formatCurrency(kpis.arr)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    MRR × 12
                  </Typography>
                </Box>
                <IconButton sx={{ bgcolor: 'primary.light', color: 'primary.main' }}>
                  <TrendingUp />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Churn Rate
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ my: 1 }}>
                    {kpis.churnRate}%
                  </Typography>
                  <Chip
                    icon={<TrendingDown />}
                    label="Good"
                    color="success"
                    size="small"
                  />
                </Box>
                <IconButton sx={{ bgcolor: 'warning.light', color: 'warning.main' }}>
                  <PeopleOutline />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Average Revenue Per User
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ my: 1 }}>
                    {formatCurrency(kpis.arpu)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    per month
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

      {/* Charts Row 1 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Revenue Trend */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Revenue Trend (Last 12 Months)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#7B2CBF"
                    strokeWidth={3}
                    name="Monthly Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Revenue by Plan */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Revenue by Plan
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={revenueByPlanData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.name}: ${formatCurrency(entry.revenue)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {revenueByPlanData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row 2 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* MRR Breakdown */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                MRR Breakdown
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mrrBreakdownData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar
                    dataKey="amount"
                    fill="#7B2CBF"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Revenue Tenants */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Top 5 Revenue Tenants
              </Typography>
              <Box sx={{ mt: 2 }}>
                {topTenants.map((tenant, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 1.5,
                      borderBottom: index < topTenants.length - 1 ? '1px solid #eee' : 'none',
                    }}
                  >
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {tenant.name}
                      </Typography>
                      <Chip label={tenant.plan} size="small" color="primary" variant="outlined" />
                    </Box>
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      {formatCurrency(tenant.revenue)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Transactions */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Recent Transactions
          </Typography>
          <Box sx={{ mt: 2 }}>
            {recentTransactions.map((txn, index) => (
              <Box
                key={txn.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 1.5,
                  borderBottom: index < recentTransactions.length - 1 ? '1px solid #eee' : 'none',
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" fontWeight="medium">
                    {txn.tenant}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {txn.date}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    {formatCurrency(txn.amount)}
                  </Typography>
                  <Chip
                    label={txn.status}
                    color={
                      txn.status === 'paid' ? 'success' :
                      txn.status === 'pending' ? 'warning' :
                      txn.status === 'overdue' ? 'error' : 'default'
                    }
                    size="small"
                    sx={{ minWidth: 80 }}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RevenueDashboard;
