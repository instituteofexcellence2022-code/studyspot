/**
 * Revenue Management Page
 * Comprehensive billing, subscription, and revenue analytics
 * 
 * Features:
 * - MRR/ARR/NRR/GRR calculations
 * - Revenue forecasting and trends
 * - Subscription lifecycle management
 * - Dunning management
 * - Usage-based billing
 * - Payout management
 * - Revenue intelligence
 */

import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Tabs, Tab, Avatar, Tooltip, Alert, LinearProgress, Switch, FormControlLabel, Divider, List, ListItem, ListItemText, ListItemIcon, Badge, Stepper, Step, StepLabel, StepContent } from '@mui/material';
import {
  AccountBalance as BankIcon,
  Analytics as AnalyticsIcon,
  Assessment as AssessmentIcon,
  AttachMoney as MoneyIcon,
  Business as BusinessIcon,
  CheckCircle as CheckIcon,
  CreditCard as CreditCardIcon,
  Download as DownloadIcon,
  Error as ErrorIcon,
  LocalAtm as CashIcon,
  Payment as PaymentIcon,
  People as PeopleIcon,
  Receipt as ReceiptIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon,
  Timeline as TimelineIcon,
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
  Upload as UploadIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
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
  ResponsiveContainer,
  ComposedChart,
  Scatter,
  ScatterChart
} from 'recharts';

interface RevenueMetrics {
  mrr: number;
  arr: number;
  nrr: number;
  grr: number;
  churnRate: number;
  ltv: number;
  cac: number;
  arpu: number;
  growthRate: number;
}

interface Subscription {
  id: string;
  tenantId: string;
  tenantName: string;
  plan?: string;
  status: 'active' | 'trial' | 'past_due' | 'cancelled' | 'incomplete';
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  amount: number;
  currency: string;
  startDate: string;
  nextBilling: string;
  lastPayment: string;
  churnRisk: 'low' | 'medium' | 'high';
  mrr: number;
  arr: number;
}

interface Invoice {
  id: string;
  tenantId: string;
  tenantName: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  paidDate?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}

interface DunningEvent {
  id: string;
  tenantId: string;
  tenantName: string;
  stage: number;
  status: 'active' | 'resolved' | 'failed';
  nextAction: string;
  daysOverdue: number;
  amount: number;
  attempts: number;
}

const RevenueManagementPage: React.FC = () => {
  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetrics>({
    mrr: 125000,
    arr: 1500000,
    nrr: 150000,
    grr: 180000,
    churnRate: 2.5,
    ltv: 12000,
    cac: 1500,
    arpu: 250,
    growthRate: 15.2
  });

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [dunningEvents, setDunningEvents] = useState<DunningEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  // Mock data
  useEffect(() => {
    const mockSubscriptions: Subscription[] = [
      {
        id: '1',
        tenantId: 'tenant-1',
        tenantName: 'University Library System',
        plan: 'enterprise',
        status: 'active',
        billingCycle: 'yearly',
        amount: 999,
        currency: 'USD',
        startDate: '2023-01-15',
        nextBilling: '2024-12-01',
        lastPayment: '2024-10-01',
        churnRisk: 'low',
        mrr: 83.25,
        arr: 999
      },
      {
        id: '2',
        tenantId: 'tenant-2',
        tenantName: 'City Public Library',
        plan: 'professional',
        status: 'trial',
        billingCycle: 'monthly',
        amount: 299,
        currency: 'USD',
        startDate: '2024-10-15',
        nextBilling: '2024-11-15',
        lastPayment: '',
        churnRisk: 'medium',
        mrr: 0,
        arr: 0
      },
      {
        id: '3',
        tenantId: 'tenant-3',
        tenantName: 'Corporate Learning Center',
        plan: 'basic',
        status: 'past_due',
        billingCycle: 'monthly',
        amount: 99,
        currency: 'USD',
        startDate: '2024-08-20',
        nextBilling: '2024-10-01',
        lastPayment: '2024-09-01',
        churnRisk: 'high',
        mrr: 0,
        arr: 0
      }
    ];

    const mockInvoices: Invoice[] = [
      {
        id: 'INV-001',
        tenantId: 'tenant-1',
        tenantName: 'University Library System',
        amount: 999,
        currency: 'USD',
        status: 'paid',
        dueDate: '2024-10-01',
        paidDate: '2024-10-01',
        items: [
          { description: 'Enterprise Plan - Yearly', quantity: 1, unitPrice: 999, total: 999 }
        ]
      },
      {
        id: 'INV-002',
        tenantId: 'tenant-2',
        tenantName: 'City Public Library',
        amount: 299,
        currency: 'USD',
        status: 'sent',
        dueDate: '2024-11-15',
        items: [
          { description: 'Professional Plan - Monthly', quantity: 1, unitPrice: 299, total: 299 }
        ]
      },
      {
        id: 'INV-003',
        tenantId: 'tenant-3',
        tenantName: 'Corporate Learning Center',
        amount: 99,
        currency: 'USD',
        status: 'overdue',
        dueDate: '2024-10-01',
        items: [
          { description: 'Basic Plan - Monthly', quantity: 1, unitPrice: 99, total: 99 }
        ]
      }
    ];

    const mockDunningEvents: DunningEvent[] = [
      {
        id: '1',
        tenantId: 'tenant-3',
        tenantName: 'Corporate Learning Center',
        stage: 2,
        status: 'active',
        nextAction: 'Send final notice',
        daysOverdue: 27,
        amount: 99,
        attempts: 2
      }
    ];

    setTimeout(() => {
      setSubscriptions(mockSubscriptions);
      setInvoices(mockInvoices);
      setDunningEvents(mockDunningEvents);
      setLoading(false);
    }, 1000);
  }, []);

  // Revenue trend data
  const revenueTrendData = [
    { month: 'Jan', mrr: 95000, arr: 1140000, churn: 1.8 },
    { month: 'Feb', mrr: 102000, arr: 1224000, churn: 2.1 },
    { month: 'Mar', mrr: 108000, arr: 1296000, churn: 2.3 },
    { month: 'Apr', mrr: 115000, arr: 1380000, churn: 2.0 },
    { month: 'May', mrr: 120000, arr: 1440000, churn: 2.2 },
    { month: 'Jun', mrr: 125000, arr: 1500000, churn: 2.5 }
  ];

  const planDistribution = [
    { name: 'Enterprise', value: 35, color: '#1976d2' },
    { name: 'Professional', value: 45, color: '#2e7d32' },
    { name: 'Basic', value: 20, color: '#f57c00' }
  ];

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'trial': return 'info';
      case 'past_due': return 'warning';
      case 'cancelled': return 'error';
      case 'incomplete': return 'default';
      default: return 'default';
    }
  };

  const getChurnRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };

  const getInvoiceStatusColor = (status?: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'sent': return 'info';
      case 'overdue': return 'error';
      case 'draft': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Revenue Management</Typography>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>Loading revenue data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Revenue Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Comprehensive billing, subscription, and revenue analytics
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Period</InputLabel>
            <Select
              value={selectedPeriod}
              label="Period"
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <MenuItem value="7d">Last 7 days</MenuItem>
              <MenuItem value="30d">Last 30 days</MenuItem>
              <MenuItem value="90d">Last 90 days</MenuItem>
              <MenuItem value="1y">Last year</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => console.log('Export revenue data')}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={() => console.log('Refresh data')}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Revenue Metrics Cards */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 3,
        mb: 3 
      }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <MoneyIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">MRR</Typography>
                <Typography variant="h4">${revenueMetrics.mrr.toLocaleString()}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUpIcon sx={{ color: 'success.main', mr: 1, fontSize: 16 }} />
                  <Typography variant="body2" color="success.main">
                    +{revenueMetrics.growthRate}%
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                <TrendingUpIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">ARR</Typography>
                <Typography variant="h4">${revenueMetrics.arr.toLocaleString()}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Annual Run Rate
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                <PeopleIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Churn Rate</Typography>
                <Typography variant="h4">{revenueMetrics.churnRate}%</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingDownIcon sx={{ color: 'success.main', mr: 1, fontSize: 16 }} />
                  <Typography variant="body2" color="success.main">
                    -0.3% vs last month
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                <AssessmentIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">LTV</Typography>
                <Typography variant="h4">${revenueMetrics.ltv.toLocaleString()}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Lifetime Value
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Overview" />
          <Tab label="Subscriptions" />
          <Tab label="Invoices" />
          <Tab label="Dunning" />
          <Tab label="Analytics" />
        </Tabs>

        {/* Overview Tab */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
              gap: 3 
            }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Revenue Trends
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={revenueTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <RechartsTooltip />
                      <Legend />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="mrr"
                        fill="#1976d2"
                        fillOpacity={0.6}
                        stroke="#1976d2"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="churn"
                        stroke="#d32f2f"
                        strokeWidth={2}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Plan Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={planDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {planDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Box>
          </Box>
        )}

        {/* Subscriptions Tab */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tenant</TableCell>
                    <TableCell>Plan</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Billing Cycle</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>MRR</TableCell>
                    <TableCell>ARR</TableCell>
                    <TableCell>Churn Risk</TableCell>
                    <TableCell>Next Billing</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subscriptions.map((subscription) => (
                    <TableRow key={subscription.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">{subscription.tenantName}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={subscription.plan} size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={subscription.status}
                          color={getStatusColor(subscription.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{subscription.billingCycle}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          ${subscription.amount}/{subscription.billingCycle}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          ${subscription.mrr.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          ${subscription.arr.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={subscription.churnRisk}
                          color={getChurnRiskColor(subscription.churnRisk) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{subscription.nextBilling}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton size="small">
                              <AnalyticsIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Subscription">
                            <IconButton size="small">
                              <SettingsIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Invoices Tab */}
        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Invoice ID</TableCell>
                    <TableCell>Tenant</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Paid Date</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">{invoice.id}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{invoice.tenantName}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          ${invoice.amount} {invoice.currency}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={invoice.status}
                          color={getInvoiceStatusColor(invoice.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{invoice.dueDate}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {invoice.paidDate || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Invoice">
                            <IconButton size="small">
                              <ReceiptIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download PDF">
                            <IconButton size="small">
                              <DownloadIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Send Reminder">
                            <IconButton size="small">
                              <WarningIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Dunning Tab */}
        {tabValue === 3 && (
          <Box sx={{ p: 3 }}>
            {dunningEvents.length === 0 ? (
              <Alert severity="success">
                No dunning events - all subscriptions are up to date!
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Tenant</TableCell>
                      <TableCell>Stage</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Days Overdue</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Attempts</TableCell>
                      <TableCell>Next Action</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dunningEvents.map((event) => (
                      <TableRow key={event.id} hover>
                        <TableCell>
                          <Typography variant="subtitle2">{event.tenantName}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={`Stage ${event.stage}`} size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={event.status}
                            color={event.status === 'active' ? 'warning' : 'success'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="error.main">
                            {event.daysOverdue} days
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">${event.amount}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{event.attempts}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{event.nextAction}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Send Reminder">
                              <IconButton size="small" color="warning">
                                <WarningIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Suspend Account">
                              <IconButton size="small" color="error">
                                <ErrorIcon />
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
          </Box>
        )}

        {/* Analytics Tab */}
        {tabValue === 4 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 3 
            }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    MRR Bridge
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { name: 'New', value: 15000 },
                      { name: 'Expansion', value: 8000 },
                      { name: 'Contraction', value: -3000 },
                      { name: 'Churn', value: -5000 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="value" fill="#1976d2" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Revenue Forecast
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={[
                      { month: 'Oct', actual: 125000, forecast: 130000 },
                      { month: 'Nov', actual: null, forecast: 135000 },
                      { month: 'Dec', actual: null, forecast: 140000 },
                      { month: 'Jan', actual: null, forecast: 145000 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <RechartsTooltip />
                      <Line type="monotone" dataKey="actual" stroke="#1976d2" strokeWidth={2} />
                      <Line type="monotone" dataKey="forecast" stroke="#d32f2f" strokeWidth={2} strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Box>
          </Box>
        )}
      </Card>
    </Box>
  );
};

export default RevenueManagementPage;
