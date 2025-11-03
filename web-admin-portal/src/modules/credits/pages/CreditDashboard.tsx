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
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  ShoppingCart,
  Refresh,
  Sms,
  WhatsApp,
  Email,
  TrendingUp,
  Search,
  Add,
  Wallet,
  LocalOffer,
  Analytics,
  Edit,
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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { creditService, CREDIT_PRICING } from '../../../services/api/credits';
import { CreditDashboardData, CreditPackage, CreditWallet, CustomCreditPlan } from '../types';
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const CreditDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [dashboardData, setDashboardData] = useState<CreditDashboardData | null>(null);
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [wallets, setWallets] = useState<CreditWallet[]>([]);
  const [customPlans, setCustomPlans] = useState<CustomCreditPlan[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [dashboardRes, packagesRes, walletsRes, customPlansRes] = await Promise.all([
        creditService.getDashboardData(),
        creditService.getPackages(),
        creditService.getWallets(),
        creditService.getCustomPlans(),
      ]);

      if (dashboardRes.success && dashboardRes.data) {
        setDashboardData(dashboardRes.data);
      }
      if (packagesRes.success && packagesRes.data) setPackages(packagesRes.data);
      if (walletsRes.success && walletsRes.data) setWallets(walletsRes.data);
      if (customPlansRes.success && customPlansRes.data) setCustomPlans(customPlansRes.data);
    } catch (err: any) {
      dispatch(showError(err.message || 'Failed to load data'));
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

  const formatNumber = (num: number) => {
    if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading Credit Management...
        </Typography>
      </Box>
    );
  }

  if (!dashboardData) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        Failed to load credit data. Please try again.
      </Alert>
    );
  }

  const creditTypeData = [
    { name: 'SMS', value: dashboardData.tenantWallets.sms, color: '#1976d2' },
    { name: 'WhatsApp', value: dashboardData.tenantWallets.whatsapp, color: '#2e7d32' },
    { name: 'Email', value: dashboardData.tenantWallets.email, color: '#0288d1' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            💳 Credit Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage credits, packages, pricing, and tenant wallets
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchAllData}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<ShoppingCart />}
            color="primary"
          >
            Purchase Credits
          </Button>
        </Box>
      </Box>

      {/* KPI Cards */}      <Box
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
                  Master Wallet
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {formatNumber(
                    dashboardData.masterWallet.sms +
                    dashboardData.masterWallet.whatsapp +
                    dashboardData.masterWallet.email
                  )}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Total Inventory
                </Typography>
              </Box>
              <Wallet sx={{ fontSize: 48, opacity: 0.3 }} />
            </Box>
          </CardContent>
        </Card>

        <Card elevation={3} sx={{ bgcolor: 'success.main', color: 'white' }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Sold Credits
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {formatNumber(dashboardData.kpis.totalAvailable)}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Tenant Wallets
                </Typography>
              </Box>
              <TrendingUp sx={{ fontSize: 48, opacity: 0.3 }} />
            </Box>
          </CardContent>
        </Card>

        <Card elevation={3} sx={{ bgcolor: 'warning.main', color: 'white' }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Unsold Stock
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {formatNumber(
                    dashboardData.unsoldInventory.sms +
                    dashboardData.unsoldInventory.whatsapp +
                    dashboardData.unsoldInventory.email
                  )}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Available to Sell
                </Typography>
              </Box>
              <LocalOffer sx={{ fontSize: 48, opacity: 0.3 }} />
            </Box>
          </CardContent>
        </Card>

        <Card elevation={3} sx={{ bgcolor: 'info.main', color: 'white' }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Monthly Revenue
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {formatCurrency(dashboardData.revenue.thisMonth)}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Profit: {formatCurrency(dashboardData.revenue.profit)}
                </Typography>
              </Box>
              <Analytics sx={{ fontSize: 48, opacity: 0.3 }} />
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
          <Tab icon={<Analytics />} label="Overview" iconPosition="start" />
          <Tab icon={<Wallet />} label="Tenant Wallets" iconPosition="start" />
          <Tab icon={<LocalOffer />} label="Packages & Pricing" iconPosition="start" />
          <Tab icon={<Add />} label="Custom Plans" iconPosition="start" />
        </Tabs>

        {/* Tab 1: Overview */}
        <TabPanel value={tabValue} index={0}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 3,
              mb: 3,
            }}
          >
            {/* Credit Distribution Pie Chart */}
            <Paper elevation={1} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Credit Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={creditTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.name}: ${formatNumber(entry.value as number)}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {creditTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Box>
        </TabPanel>

        {/* Tab 2: Tenant Wallets */}
        <TabPanel value={tabValue} index={1}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tenant Credit Wallets
            </Typography>
            <DataGrid
              rows={wallets}
              columns={[
                { field: 'tenantName', headerName: 'Tenant', width: 200 },
                { field: 'smsCredits', headerName: 'SMS Credits', width: 150, valueFormatter: (params: any) => formatNumber(params.value as number) },
                { field: 'whatsappCredits', headerName: 'WhatsApp', width: 150, valueFormatter: (params: any) => formatNumber(params.value as number) },
                { field: 'emailCredits', headerName: 'Email', width: 150, valueFormatter: (params: any) => formatNumber(params.value as number) },
                { field: 'totalValue', headerName: 'Total Value', width: 150, valueFormatter: (params: any) => formatCurrency(params.value as number) },
              ]}
              autoHeight
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              pageSizeOptions={[10, 25, 50]}
            />
          </Paper>
        </TabPanel>

        {/* Tab 3: Packages & Pricing */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
            {packages.map((pkg: CreditPackage) => (
              <Card key={pkg.id} elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {pkg.name}
                  </Typography>
                  <Typography variant="h4" color="primary" gutterBottom>
                    {formatCurrency(pkg.price)}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      SMS: {formatNumber(pkg.smsCredits)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      WhatsApp: {formatNumber(pkg.whatsappCredits)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Email: {formatNumber(pkg.emailCredits)}
                    </Typography>
                  </Box>
                  {pkg.savings > 0 && (
                    <Chip 
                      label={`Save ${formatCurrency(pkg.savings)}`} 
                      color="success" 
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  )}
                  <Typography variant="body2" color="text.secondary">
                    {pkg.popular && '⭐ Most Popular'}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </TabPanel>

        {/* Tab 4: Custom Plans */}
        <TabPanel value={tabValue} index={3}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Custom Credit Plans
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {/* Handle create custom plan */}}
              >
                Create Custom Plan
              </Button>
            </Box>
            <DataGrid
              rows={customPlans}
              columns={[
                { field: 'name', headerName: 'Plan Name', width: 200 },
                { field: 'tenantName', headerName: 'Tenant', width: 150 },
                { field: 'smsCredits', headerName: 'SMS', width: 120, valueFormatter: (params: any) => formatNumber(params.value as number) },
                { field: 'whatsappCredits', headerName: 'WhatsApp', width: 120, valueFormatter: (params: any) => formatNumber(params.value as number) },
                { field: 'emailCredits', headerName: 'Email', width: 120, valueFormatter: (params: any) => formatNumber(params.value as number) },
                { field: 'price', headerName: 'Price', width: 130, valueFormatter: (params: any) => formatCurrency(params.value as number) },
                { field: 'status', headerName: 'Status', width: 120, renderCell: (params) => (
                  <Chip 
                    label={params.value} 
                    color={params.value === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                )},
              ]}
              autoHeight
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              pageSizeOptions={[10, 25, 50]}
            />
          </Paper>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default CreditDashboard;


      {/* KPI Cards */}