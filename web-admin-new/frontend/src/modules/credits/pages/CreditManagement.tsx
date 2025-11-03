// ============================================
// CREDIT MANAGEMENT PAGE - 4 TABS
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
  IconButton,
  TextField,
  GridLegacy as Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Stack,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  AccountBalance,
  TrendingUp,
  AttachMoney,
  People,
  Sms,
  WhatsApp,
  Email,
  Add,
  Refresh,
  Download,
  Warning,
  Edit,
  Delete,
  Visibility,
  ShoppingCart,
  LocalOffer,
  CheckCircle,
  Close,
  Info,
  TrendingDown,
  Assessment,
  Receipt,
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

const CreditManagement: React.FC = () => {
  const { masterWallet, tenantWallets, packages, customPlans } = useAppSelector(
    (state) => state.credits
  );

  const [activeTab, setActiveTab] = useState(0);
  const [searchTenant, setSearchTenant] = useState('');
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [vendorDetailsOpen, setVendorDetailsOpen] = useState(false);
  const [createPackageOpen, setCreatePackageOpen] = useState(false);
  const [purchaseStep, setPurchaseStep] = useState(0);
  const [purchaseForm, setPurchaseForm] = useState({
    vendor: '',
    creditType: 'sms',
    credits: '',
    autoCalculate: true,
    totalCost: 0,
  });
  const [newPackage, setNewPackage] = useState({
    name: '',
    description: '',
    includeSMS: false,
    smsCredits: '',
    includeWhatsApp: false,
    whatsappCredits: '',
    includeEmail: false,
    emailCredits: '',
    price: '',
    discountEnabled: false,
    discountType: 'percentage',
    discountValue: '',
    validity: '30',
    isPopular: false,
    features: [] as string[],
  });
  const [adjustPricingOpen, setAdjustPricingOpen] = useState(false);
  const [selectedPricingType, setSelectedPricingType] = useState<any>(null);
  const [newRetailRate, setNewRetailRate] = useState('');
  const [walletFilter, setWalletFilter] = useState('all');
  const [selectedTenantWallet, setSelectedTenantWallet] = useState<any>(null);
  const [walletDetailsOpen, setWalletDetailsOpen] = useState(false);
  const [addCreditsOpen, setAddCreditsOpen] = useState(false);
  const [creditsToAdd, setCreditsToAdd] = useState({ sms: '', whatsapp: '', email: '' });
  const [alertSettingsOpen, setAlertSettingsOpen] = useState(false);
  const [autoAlertEnabled, setAutoAlertEnabled] = useState(true);
  const [alertThreshold, setAlertThreshold] = useState({
    low: '5000',
    critical: '1000',
  });
  const [alertChannels, setAlertChannels] = useState({
    email: true,
    sms: true,
    whatsapp: false,
    inApp: true,
  });
  const [usageReportOpen, setUsageReportOpen] = useState(false);
  const [usageReportDateRange, setUsageReportDateRange] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('30d');
  const [usageReportGrouping, setUsageReportGrouping] = useState<'hour' | 'day' | 'week' | 'month'>('day');

  // Mock data for 3rd party vendors
  const vendors = [
    { 
      id: 'v1', 
      name: 'Twilio', 
      type: 'SMS & WhatsApp', 
      status: 'active',
      smsRate: 0.035, // ₹0.035 per SMS
      whatsappRate: 0.055, // ₹0.055 per WhatsApp
      balance: 250000,
      lastPurchase: '2024-10-28',
      totalPurchased: 5000000,
      reliability: 99.8
    },
    { 
      id: 'v2', 
      name: 'MSG91', 
      type: 'SMS', 
      status: 'active',
      smsRate: 0.032,
      whatsappRate: 0,
      balance: 180000,
      lastPurchase: '2024-10-25',
      totalPurchased: 3200000,
      reliability: 98.5
    },
    { 
      id: 'v3', 
      name: 'SendGrid', 
      type: 'Email', 
      status: 'active',
      smsRate: 0,
      whatsappRate: 0,
      emailRate: 0.008, // ₹0.008 per email
      balance: 500000,
      lastPurchase: '2024-10-30',
      totalPurchased: 8000000,
      reliability: 99.9
    },
    { 
      id: 'v4', 
      name: 'Gupshup', 
      type: 'WhatsApp', 
      status: 'active',
      smsRate: 0,
      whatsappRate: 0.048,
      balance: 120000,
      lastPurchase: '2024-10-27',
      totalPurchased: 1500000,
      reliability: 97.2
    },
  ];

  // Purchase history
  const purchaseHistory = [
    { id: 'p1', vendor: 'Twilio', type: 'SMS', credits: 100000, rate: 0.035, total: 3500, date: '2024-10-28', status: 'completed' },
    { id: 'p2', vendor: 'MSG91', type: 'SMS', credits: 50000, rate: 0.032, total: 1600, date: '2024-10-25', status: 'completed' },
    { id: 'p3', vendor: 'SendGrid', type: 'Email', credits: 200000, rate: 0.008, total: 1600, date: '2024-10-30', status: 'completed' },
    { id: 'p4', vendor: 'Gupshup', type: 'WhatsApp', credits: 30000, rate: 0.048, total: 1440, date: '2024-10-27', status: 'completed' },
    { id: 'p5', vendor: 'Twilio', type: 'WhatsApp', credits: 40000, rate: 0.055, total: 2200, date: '2024-10-20', status: 'completed' },
  ];

  // Pricing matrix (wholesale vs retail)
  const pricingMatrix = [
    { 
      type: 'SMS', 
      wholesaleRate: 0.035, 
      retailRate: 0.065, 
      markup: 85.7, 
      profit: 0.03,
      recommended: 0.060,
      competitors: '₹0.05-0.08'
    },
    { 
      type: 'WhatsApp', 
      wholesaleRate: 0.055, 
      retailRate: 0.095, 
      markup: 72.7, 
      profit: 0.04,
      recommended: 0.085,
      competitors: '₹0.07-0.12'
    },
    { 
      type: 'Email', 
      wholesaleRate: 0.008, 
      retailRate: 0.015, 
      markup: 87.5, 
      profit: 0.007,
      recommended: 0.012,
      competitors: '₹0.01-0.02'
    },
  ];

  // Format currency
  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Format number
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Calculate stats
  const stats = {
    totalSold: tenantWallets.reduce((sum, w) => sum + w.totalBalance, 0),
    activeTenants: tenantWallets.filter((w) => w.status === 'active').length,
    totalRevenue: tenantWallets.reduce((sum, w) => sum + (w.monthlyUsage * 0.065), 0),
    profitMargin: 44.5,
  };

  // Credit distribution data
  const creditDistribution = [
    { name: 'SMS', value: masterWallet.smsCredits, color: '#4FC3F7' },
    { name: 'WhatsApp', value: masterWallet.whatsappCredits, color: '#25D366' },
    { name: 'Email', value: masterWallet.emailCredits, color: '#E91E63' },
  ];

  // Usage trend data (mock)
  const usageTrendData = [
    { month: 'May', sms: 45000, whatsapp: 25000, email: 15000 },
    { month: 'Jun', sms: 52000, whatsapp: 30000, email: 18000 },
    { month: 'Jul', sms: 61000, whatsapp: 35000, email: 22000 },
    { month: 'Aug', sms: 70000, whatsapp: 40000, email: 25000 },
    { month: 'Sep', sms: 78000, whatsapp: 45000, email: 28000 },
    { month: 'Oct', sms: 85000, whatsapp: 50000, email: 30000 },
  ];

  // Top consumers
  const topConsumers = [...tenantWallets]
    .sort((a, b) => b.monthlyUsage - a.monthlyUsage)
    .slice(0, 5);

  // Low balance alerts
  const lowBalanceAlerts = tenantWallets.filter(
    (w) => w.status === 'critical' || w.status === 'low'
  );

  // Filter tenants
  const filteredWallets = tenantWallets.filter((w) =>
    w.tenantName.toLowerCase().includes(searchTenant.toLowerCase())
  );

  // DataGrid columns for Tenant Wallets
  const walletColumns: GridColDef[] = [
    {
      field: 'tenantName',
      headerName: 'Tenant',
      flex: 1,
      minWidth: 180,
    },
    {
      field: 'smsBalance',
      headerName: 'SMS',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Sms fontSize="small" color="primary" />
          <Typography variant="body2">{formatNumber(params.value as number)}</Typography>
        </Box>
      ),
    },
    {
      field: 'whatsappBalance',
      headerName: 'WhatsApp',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <WhatsApp fontSize="small" sx={{ color: '#25D366' }} />
          <Typography variant="body2">{formatNumber(params.value as number)}</Typography>
        </Box>
      ),
    },
    {
      field: 'emailBalance',
      headerName: 'Email',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Email fontSize="small" color="error" />
          <Typography variant="body2">{formatNumber(params.value as number)}</Typography>
        </Box>
      ),
    },
    {
      field: 'totalBalance',
      headerName: 'Total',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight="bold">
          {formatNumber(params.value as number)}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          color={
            params.value === 'active' ? 'success' :
            params.value === 'low' ? 'warning' :
            params.value === 'critical' ? 'error' : 'default'
          }
          size="small"
        />
      ),
    },
    {
      field: 'monthlyUsage',
      headerName: 'Monthly Usage',
      width: 140,
      valueGetter: (value) => formatNumber(value),
    },
  ];

  // Render Overview Tab
  const renderOverviewTab = () => (
    <Box>
      {/* Master Wallet - Enhanced */}
      <Card 
        sx={{ 
          mb: 3, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'absolute', top: -50, right: -50, opacity: 0.1 }}>
          <AccountBalance sx={{ fontSize: 200 }} />
        </Box>
        <CardContent sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h5" color="white" fontWeight="bold">
                💰 Master Wallet Inventory
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Your total credit inventory from all vendors
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              sx={{ bgcolor: 'white', color: '#667eea', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
              startIcon={<Refresh />}
            >
              Refresh
            </Button>
          </Box>
          
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Sms sx={{ color: 'white' }} />
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    SMS Credits
                  </Typography>
                </Box>
                <Typography variant="h4" color="white" fontWeight="bold">
                  {formatNumber(masterWallet.smsCredits)}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                  Worth: ₹{(masterWallet.smsCredits * 0.065).toFixed(0)}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <WhatsApp sx={{ color: 'white' }} />
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    WhatsApp Credits
                  </Typography>
                </Box>
                <Typography variant="h4" color="white" fontWeight="bold">
                  {formatNumber(masterWallet.whatsappCredits)}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                  Worth: ₹{(masterWallet.whatsappCredits * 0.095).toFixed(0)}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Email sx={{ color: 'white' }} />
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Email Credits
                  </Typography>
                </Box>
                <Typography variant="h4" color="white" fontWeight="bold">
                  {formatNumber(masterWallet.emailCredits)}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                  Worth: ₹{(masterWallet.emailCredits * 0.015).toFixed(0)}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: '2px solid rgba(255,255,255,0.3)' }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Total Value (Retail)
                </Typography>
                <Typography variant="h3" color="white" fontWeight="bold">
                  {formatCurrency(masterWallet.retailValue)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                  <TrendingUp fontSize="small" sx={{ color: '#4ade80' }} />
                  <Typography variant="caption" sx={{ color: '#4ade80' }}>
                    Potential Profit: {formatCurrency(masterWallet.potentialProfit)}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Enhanced KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderLeft: '4px solid',
            borderColor: 'primary.main',
            transition: 'all 0.3s',
            '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <AccountBalance fontSize="small" color="primary" />
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      CREDITS SOLD
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight="bold">
                    {formatNumber(stats.totalSold)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <Chip icon={<TrendingUp />} label="+15.2%" color="success" size="small" />
                    <Typography variant="caption" color="text.secondary">vs last month</Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderLeft: '4px solid',
            borderColor: 'info.main',
            transition: 'all 0.3s',
            '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <People fontSize="small" color="info" />
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      ACTIVE TENANTS
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    {stats.activeTenants}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {tenantWallets.length} total • {Math.round((stats.activeTenants/tenantWallets.length)*100)}% active rate
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderLeft: '4px solid',
            borderColor: 'success.main',
            transition: 'all 0.3s',
            '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <AttachMoney fontSize="small" color="success" />
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      TOTAL REVENUE
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {formatCurrency(stats.totalRevenue)}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      This month • Avg: ₹{(stats.totalRevenue / stats.activeTenants).toFixed(0)}/tenant
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderLeft: '4px solid',
            borderColor: 'warning.main',
            transition: 'all 0.3s',
            '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <TrendingUp fontSize="small" color="warning" />
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      PROFIT MARGIN
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {stats.profitMargin}%
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip label="Excellent" color="success" size="small" variant="outlined" />
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      Industry avg: 35%
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Stats Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                📊 Credit Distribution by Type
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mt: 2 }}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
                  <Sms color="primary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h5" fontWeight="bold">{formatNumber(masterWallet.smsCredits)}</Typography>
                  <Typography variant="caption" color="text.secondary">SMS Credits</Typography>
                  <Typography variant="caption" display="block" color="primary" fontWeight="bold">
                    {((masterWallet.smsCredits / masterWallet.totalCredits) * 100).toFixed(1)}%
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.50', borderRadius: 2 }}>
                  <WhatsApp sx={{ fontSize: 40, mb: 1, color: '#25D366' }} />
                  <Typography variant="h5" fontWeight="bold">{formatNumber(masterWallet.whatsappCredits)}</Typography>
                  <Typography variant="caption" color="text.secondary">WhatsApp Credits</Typography>
                  <Typography variant="caption" display="block" sx={{ color: '#25D366' }} fontWeight="bold">
                    {((masterWallet.whatsappCredits / masterWallet.totalCredits) * 100).toFixed(1)}%
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'error.50', borderRadius: 2 }}>
                  <Email color="error" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h5" fontWeight="bold">{formatNumber(masterWallet.emailCredits)}</Typography>
                  <Typography variant="caption" color="text.secondary">Email Credits</Typography>
                  <Typography variant="caption" display="block" color="error" fontWeight="bold">
                    {((masterWallet.emailCredits / masterWallet.totalCredits) * 100).toFixed(1)}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                🚨 Quick Actions
              </Typography>
              <Stack spacing={1} sx={{ mt: 2 }}>
                <Button variant="outlined" fullWidth startIcon={<ShoppingCart />} size="small">
                  Buy More Credits
                </Button>
                <Button variant="outlined" fullWidth startIcon={<Add />} size="small" onClick={() => setCreatePackageOpen(true)}>
                  Create Package
                </Button>
                <Button variant="outlined" fullWidth startIcon={<Assessment />} size="small">
                  View Reports
                </Button>
                <Button variant="outlined" fullWidth startIcon={<Warning />} color="error" size="small">
                  Low Stock Alert (3)
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Credit Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={creditDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.name}: ${formatNumber(entry.value)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {creditDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatNumber(value)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Usage Trend (6 Months)
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={usageTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => formatNumber(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="sms" stroke="#4FC3F7" strokeWidth={2} name="SMS" />
                  <Line type="monotone" dataKey="whatsapp" stroke="#25D366" strokeWidth={2} name="WhatsApp" />
                  <Line type="monotone" dataKey="email" stroke="#E91E63" strokeWidth={2} name="Email" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bottom Row */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Top 5 Credit Consumers
              </Typography>
              <Box sx={{ mt: 2 }}>
                {topConsumers.map((tenant, index) => (
                  <Box
                    key={tenant.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 1.5,
                      borderBottom: index < topConsumers.length - 1 ? '1px solid #eee' : 'none',
                    }}
                  >
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {tenant.tenantName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Balance: {formatNumber(tenant.totalBalance)}
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      {formatNumber(tenant.monthlyUsage)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Low Balance Alerts
                </Typography>
                <Chip label={lowBalanceAlerts.length} color="error" size="small" />
              </Box>
              <Box sx={{ mt: 2 }}>
                {lowBalanceAlerts.map((tenant) => (
                  <Box
                    key={tenant.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      py: 1.5,
                      borderBottom: '1px solid #eee',
                    }}
                  >
                    <Warning color={tenant.status === 'critical' ? 'error' : 'warning'} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" fontWeight="medium">
                        {tenant.tenantName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Balance: {formatNumber(tenant.totalBalance)}
                      </Typography>
                    </Box>
                    <Chip
                      label={tenant.status}
                      color={tenant.status === 'critical' ? 'error' : 'warning'}
                      size="small"
                    />
                  </Box>
                ))}
                {lowBalanceAlerts.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    All tenants have healthy balances
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  // Render Tenant Wallets Tab
  const renderTenantWalletsTab = () => {
    const filteredByStatus = walletFilter === 'all' 
      ? filteredWallets 
      : filteredWallets.filter(w => w.status === walletFilter);

    return (
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              👥 Tenant Credit Wallets
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Monitor and manage credit balances for all your tenant libraries
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant={autoAlertEnabled ? "contained" : "outlined"} 
              startIcon={autoAlertEnabled ? <CheckCircle /> : <Warning />}
              color={autoAlertEnabled ? "success" : "warning"}
              onClick={() => setAlertSettingsOpen(true)}
            >
              Auto-Alert {autoAlertEnabled ? 'ON' : 'OFF'}
            </Button>
            <Button variant="outlined" startIcon={<Download />}>
              Export Report
            </Button>
          </Box>
        </Box>

        {/* Auto-Alert Banner */}
        {autoAlertEnabled && lowBalanceAlerts.length > 0 && (
          <Alert 
            severity="warning" 
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={() => setAlertSettingsOpen(true)}>
                Settings
              </Button>
            }
          >
            <Typography variant="body2" fontWeight="bold">
              🔔 {lowBalanceAlerts.length} Tenant(s) Need Attention
            </Typography>
            <Typography variant="caption">
              Auto-alerts are being sent via: {
                [
                  alertChannels.email && 'Email',
                  alertChannels.sms && 'SMS',
                  alertChannels.whatsapp && 'WhatsApp',
                  alertChannels.inApp && 'In-App'
                ].filter(Boolean).join(', ')
              }
            </Typography>
          </Alert>
        )}

        {/* Stats Overview */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderLeft: '4px solid', borderColor: 'success.main' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CheckCircle fontSize="small" color="success" />
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">ACTIVE WALLETS</Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {tenantWallets.filter(w => w.status === 'active').length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {((tenantWallets.filter(w => w.status === 'active').length / tenantWallets.length) * 100).toFixed(1)}% of total
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderLeft: '4px solid', borderColor: 'warning.main' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Warning fontSize="small" color="warning" />
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">LOW BALANCE</Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {tenantWallets.filter(w => w.status === 'low').length}
                </Typography>
                <Typography variant="caption" color="text.secondary">Need recharge soon</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderLeft: '4px solid', borderColor: 'error.main' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Warning fontSize="small" color="error" />
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">CRITICAL</Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold" color="error.main">
                  {tenantWallets.filter(w => w.status === 'critical').length}
                </Typography>
                <Typography variant="caption" color="text.secondary">Immediate action required</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderLeft: '4px solid', borderColor: 'primary.main' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <AccountBalance fontSize="small" color="primary" />
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">TOTAL CREDITS</Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {formatNumber(tenantWallets.reduce((acc, w) => acc + w.totalBalance, 0))}
                </Typography>
                <Typography variant="caption" color="text.secondary">Across all tenants</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters & Search */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField
                placeholder="Search by tenant name or library..."
                size="small"
                value={searchTenant}
                onChange={(e) => setSearchTenant(e.target.value)}
                sx={{ minWidth: 300 }}
              />
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip 
                  label={`All (${tenantWallets.length})`}
                  onClick={() => setWalletFilter('all')}
                  color={walletFilter === 'all' ? 'primary' : 'default'}
                  variant={walletFilter === 'all' ? 'filled' : 'outlined'}
                />
                <Chip 
                  label={`Active (${tenantWallets.filter(w => w.status === 'active').length})`}
                  onClick={() => setWalletFilter('active')}
                  color={walletFilter === 'active' ? 'success' : 'default'}
                  variant={walletFilter === 'active' ? 'filled' : 'outlined'}
                />
                <Chip 
                  label={`Low (${tenantWallets.filter(w => w.status === 'low').length})`}
                  onClick={() => setWalletFilter('low')}
                  color={walletFilter === 'low' ? 'warning' : 'default'}
                  variant={walletFilter === 'low' ? 'filled' : 'outlined'}
                />
                <Chip 
                  label={`Critical (${tenantWallets.filter(w => w.status === 'critical').length})`}
                  onClick={() => setWalletFilter('critical')}
                  color={walletFilter === 'critical' ? 'error' : 'default'}
                  variant={walletFilter === 'critical' ? 'filled' : 'outlined'}
                />
              </Box>

              <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                <Button variant="outlined" size="small" startIcon={<Refresh />}>
                  Refresh
                </Button>
                <Button variant="outlined" size="small" startIcon={<Download />}>
                  Export
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Enhanced DataGrid */}
        <Card>
          <DataGrid
            rows={filteredByStatus}
            columns={[
              ...walletColumns,
              {
                field: 'actions',
                headerName: 'Actions',
                width: 200,
                renderCell: (params: GridRenderCellParams) => (
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Visibility />}
                      onClick={() => {
                        setSelectedTenantWallet(params.row);
                        setWalletDetailsOpen(true);
                      }}
                    >
                      View
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => {
                        setSelectedTenantWallet(params.row);
                        setAddCreditsOpen(true);
                      }}
                    >
                      Add
                    </Button>
                  </Box>
                ),
              },
            ]}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{
              pagination: { paginationModel: { pageSize: 25 } },
            }}
            disableRowSelectionOnClick
            autoHeight
            sx={{
              '& .MuiDataGrid-row:hover': {
                bgcolor: 'action.hover',
              },
            }}
          />
        </Card>

        {/* Wallet Details Dialog */}
        <Dialog open={walletDetailsOpen} onClose={() => setWalletDetailsOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight="bold">{selectedTenantWallet?.tenantName} - Wallet Details</Typography>
              <Chip 
                label={selectedTenantWallet?.status} 
                color={
                  selectedTenantWallet?.status === 'active' ? 'success' :
                  selectedTenantWallet?.status === 'low' ? 'warning' :
                  selectedTenantWallet?.status === 'critical' ? 'error' : 'default'
                }
                size="small"
              />
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            {selectedTenantWallet && (
              <Box>
                {/* Credit Balances */}
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Credit Balances</Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.50' }}>
                      <Sms color="primary" sx={{ mb: 1 }} />
                      <Typography variant="caption" color="text.secondary" display="block">SMS</Typography>
                      <Typography variant="h5" fontWeight="bold">{formatNumber(selectedTenantWallet.smsBalance)}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50' }}>
                      <WhatsApp sx={{ color: '#25D366', mb: 1 }} />
                      <Typography variant="caption" color="text.secondary" display="block">WhatsApp</Typography>
                      <Typography variant="h5" fontWeight="bold">{formatNumber(selectedTenantWallet.whatsappBalance)}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.50' }}>
                      <Email color="error" sx={{ mb: 1 }} />
                      <Typography variant="caption" color="text.secondary" display="block">Email</Typography>
                      <Typography variant="h5" fontWeight="bold">{formatNumber(selectedTenantWallet.emailBalance)}</Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Usage Stats */}
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Usage Statistics</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 3 }}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="caption" color="text.secondary">Total Balance</Typography>
                    <Typography variant="h6" fontWeight="bold">{formatNumber(selectedTenantWallet.totalBalance)}</Typography>
                  </Paper>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="caption" color="text.secondary">Monthly Usage</Typography>
                    <Typography variant="h6" fontWeight="bold">{formatNumber(selectedTenantWallet.monthlyUsage)}</Typography>
                  </Paper>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="caption" color="text.secondary">Last Top-Up</Typography>
                    <Typography variant="body2" fontWeight="bold">{selectedTenantWallet.lastTopUp}</Typography>
                  </Paper>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="caption" color="text.secondary">Total Spent</Typography>
                    <Typography variant="body2" fontWeight="bold">₹{(selectedTenantWallet.monthlyUsage * 0.065).toFixed(0)}</Typography>
                  </Paper>
                </Box>

                {/* Quick Actions */}
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Quick Actions</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="contained" fullWidth startIcon={<Add />} onClick={() => {
                    setWalletDetailsOpen(false);
                    setAddCreditsOpen(true);
                  }}>
                    Add Credits
                  </Button>
                  <Button variant="outlined" fullWidth startIcon={<Assessment />} onClick={() => {
                    setUsageReportOpen(true);
                  }}>
                    View Usage Report
                  </Button>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setWalletDetailsOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Add Credits Dialog */}
        <Dialog open={addCreditsOpen} onClose={() => setAddCreditsOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Add />
              <Typography variant="h6" fontWeight="bold">Add Credits to {selectedTenantWallet?.tenantName}</Typography>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Alert severity="info">
                <Typography variant="caption" fontWeight="bold">Current Balance</Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  <Typography variant="caption">SMS: {formatNumber(selectedTenantWallet?.smsBalance || 0)}</Typography>
                  <Typography variant="caption">WA: {formatNumber(selectedTenantWallet?.whatsappBalance || 0)}</Typography>
                  <Typography variant="caption">Email: {formatNumber(selectedTenantWallet?.emailBalance || 0)}</Typography>
                </Box>
              </Alert>

              <TextField
                label="SMS Credits to Add"
                type="number"
                value={creditsToAdd.sms}
                onChange={(e) => setCreditsToAdd({ ...creditsToAdd, sms: e.target.value })}
                fullWidth
                InputProps={{
                  startAdornment: <Sms sx={{ mr: 1, color: 'primary.main' }} />
                }}
              />

              <TextField
                label="WhatsApp Credits to Add"
                type="number"
                value={creditsToAdd.whatsapp}
                onChange={(e) => setCreditsToAdd({ ...creditsToAdd, whatsapp: e.target.value })}
                fullWidth
                InputProps={{
                  startAdornment: <WhatsApp sx={{ mr: 1, color: '#25D366' }} />
                }}
              />

              <TextField
                label="Email Credits to Add"
                type="number"
                value={creditsToAdd.email}
                onChange={(e) => setCreditsToAdd({ ...creditsToAdd, email: e.target.value })}
                fullWidth
                InputProps={{
                  startAdornment: <Email sx={{ mr: 1, color: 'error.main' }} />
                }}
              />

              {(creditsToAdd.sms || creditsToAdd.whatsapp || creditsToAdd.email) && (
                <Alert severity="success">
                  <Typography variant="caption" fontWeight="bold" display="block" gutterBottom>
                    Transfer Summary
                  </Typography>
                  {creditsToAdd.sms && (
                    <Typography variant="caption" display="block">
                      SMS: +{Number(creditsToAdd.sms).toLocaleString()} credits
                    </Typography>
                  )}
                  {creditsToAdd.whatsapp && (
                    <Typography variant="caption" display="block">
                      WhatsApp: +{Number(creditsToAdd.whatsapp).toLocaleString()} credits
                    </Typography>
                  )}
                  {creditsToAdd.email && (
                    <Typography variant="caption" display="block">
                      Email: +{Number(creditsToAdd.email).toLocaleString()} credits
                    </Typography>
                  )}
                </Alert>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setAddCreditsOpen(false);
              setCreditsToAdd({ sms: '', whatsapp: '', email: '' });
            }}>Cancel</Button>
            <Button 
              variant="contained"
              disabled={!creditsToAdd.sms && !creditsToAdd.whatsapp && !creditsToAdd.email}
              onClick={() => {
                console.log('Adding credits:', creditsToAdd, 'to', selectedTenantWallet?.tenantName);
                setAddCreditsOpen(false);
                setCreditsToAdd({ sms: '', whatsapp: '', email: '' });
              }}
            >
              Transfer Credits
            </Button>
          </DialogActions>
        </Dialog>

        {/* Auto-Alert Settings Dialog */}
        <Dialog open={alertSettingsOpen} onClose={() => setAlertSettingsOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Warning color="warning" />
              <Typography variant="h6" fontWeight="bold">Auto-Alert Settings</Typography>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Enable/Disable */}
              <Card variant="outlined" sx={{ p: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={autoAlertEnabled}
                      onChange={(e) => setAutoAlertEnabled(e.target.checked)}
                      color="success"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        Enable Auto-Alert System
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Automatically notify tenants when their credit balance is low
                      </Typography>
                    </Box>
                  }
                />
              </Card>

              {autoAlertEnabled && (
                <>
                  {/* Threshold Settings */}
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary">
                      🎯 Alert Thresholds
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      <TextField
                        label="Low Balance Alert"
                        type="number"
                        value={alertThreshold.low}
                        onChange={(e) => setAlertThreshold({ ...alertThreshold, low: e.target.value })}
                        fullWidth
                        size="small"
                        helperText="Credits remaining"
                        InputProps={{
                          startAdornment: <Warning sx={{ mr: 1, color: 'warning.main' }} />
                        }}
                      />
                      <TextField
                        label="Critical Alert"
                        type="number"
                        value={alertThreshold.critical}
                        onChange={(e) => setAlertThreshold({ ...alertThreshold, critical: e.target.value })}
                        fullWidth
                        size="small"
                        helperText="Credits remaining"
                        InputProps={{
                          startAdornment: <Warning sx={{ mr: 1, color: 'error.main' }} />
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Notification Channels */}
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary">
                      📢 Notification Channels
                    </Typography>
                    <Card variant="outlined" sx={{ p: 2 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={alertChannels.email}
                            onChange={(e) => setAlertChannels({ ...alertChannels, email: e.target.checked })}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Email fontSize="small" color="error" />
                            <Typography variant="body2">Email Notification</Typography>
                          </Box>
                        }
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={alertChannels.sms}
                            onChange={(e) => setAlertChannels({ ...alertChannels, sms: e.target.checked })}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Sms fontSize="small" color="primary" />
                            <Typography variant="body2">SMS Alert</Typography>
                          </Box>
                        }
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={alertChannels.whatsapp}
                            onChange={(e) => setAlertChannels({ ...alertChannels, whatsapp: e.target.checked })}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <WhatsApp fontSize="small" sx={{ color: '#25D366' }} />
                            <Typography variant="body2">WhatsApp Message</Typography>
                          </Box>
                        }
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={alertChannels.inApp}
                            onChange={(e) => setAlertChannels({ ...alertChannels, inApp: e.target.checked })}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Warning fontSize="small" color="warning" />
                            <Typography variant="body2">In-App Notification</Typography>
                          </Box>
                        }
                      />
                    </Card>
                  </Box>

                  {/* Alert Preview */}
                  <Alert severity="info">
                    <Typography variant="caption" fontWeight="bold" display="block" gutterBottom>
                      📋 Alert Configuration Summary
                    </Typography>
                    <Typography variant="caption" display="block">
                      • Low balance alert at: {Number(alertThreshold.low).toLocaleString()} credits
                    </Typography>
                    <Typography variant="caption" display="block">
                      • Critical alert at: {Number(alertThreshold.critical).toLocaleString()} credits
                    </Typography>
                    <Typography variant="caption" display="block">
                      • Active channels: {
                        [
                          alertChannels.email && 'Email',
                          alertChannels.sms && 'SMS',
                          alertChannels.whatsapp && 'WhatsApp',
                          alertChannels.inApp && 'In-App'
                        ].filter(Boolean).join(', ') || 'None'
                      }
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      • Currently monitoring: {tenantWallets.length} tenant wallets
                    </Typography>
                    <Typography variant="caption" display="block" color="warning.main">
                      • Tenants needing alerts: {lowBalanceAlerts.length}
                    </Typography>
                  </Alert>

                  {/* Test Alert Button */}
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    startIcon={<Sms />}
                    onClick={() => {
                      console.log('Sending test alerts to low balance tenants:', lowBalanceAlerts.map(t => t.tenantName));
                      alert(`Test alert sent to ${lowBalanceAlerts.length} tenant(s)!`);
                    }}
                  >
                    Send Test Alert Now
                  </Button>
                </>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAlertSettingsOpen(false)}>Cancel</Button>
            <Button 
              variant="contained"
              onClick={() => {
                console.log('Auto-alert settings saved:', { autoAlertEnabled, alertThreshold, alertChannels });
                setAlertSettingsOpen(false);
              }}
            >
              Save Settings
            </Button>
          </DialogActions>
        </Dialog>

        {/* Usage Report Dialog */}
        <Dialog open={usageReportOpen} onClose={() => setUsageReportOpen(false)} maxWidth="lg" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Assessment />
                <Typography variant="h6" fontWeight="bold">
                  {selectedTenantWallet?.tenantName} - Usage Report
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            {selectedTenantWallet && (
              <Box>
                {/* Time Filters */}
                <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                      {/* Date Range Filter */}
                      <Box sx={{ flex: 1, minWidth: 250 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block" gutterBottom>
                          📅 Date Range
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {[
                            { value: '7d', label: 'Last 7 Days' },
                            { value: '30d', label: 'Last 30 Days' },
                            { value: '90d', label: 'Last 90 Days' },
                            { value: '1y', label: 'Last Year' },
                            { value: 'all', label: 'All Time' },
                          ].map((option) => (
                            <Chip
                              key={option.value}
                              label={option.label}
                              size="small"
                              onClick={() => setUsageReportDateRange(option.value as any)}
                              color={usageReportDateRange === option.value ? 'primary' : 'default'}
                              variant={usageReportDateRange === option.value ? 'filled' : 'outlined'}
                            />
                          ))}
                        </Box>
                      </Box>

                      {/* Grouping Filter */}
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block" gutterBottom>
                          📊 Group By
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {[
                            { value: 'hour', label: 'Hour', disabled: usageReportDateRange !== '7d' },
                            { value: 'day', label: 'Day', disabled: false },
                            { value: 'week', label: 'Week', disabled: usageReportDateRange === '7d' },
                            { value: 'month', label: 'Month', disabled: usageReportDateRange === '7d' || usageReportDateRange === '30d' },
                          ].map((option) => (
                            <Chip
                              key={option.value}
                              label={option.label}
                              size="small"
                              onClick={() => !option.disabled && setUsageReportGrouping(option.value as any)}
                              color={usageReportGrouping === option.value ? 'primary' : 'default'}
                              variant={usageReportGrouping === option.value ? 'filled' : 'outlined'}
                              disabled={option.disabled}
                            />
                          ))}
                        </Box>
                      </Box>
                    </Box>

                    {/* Active Filter Info */}
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <Typography variant="caption">
                        <strong>Showing:</strong> {
                          usageReportDateRange === '7d' ? 'Last 7 Days' :
                          usageReportDateRange === '30d' ? 'Last 30 Days' :
                          usageReportDateRange === '90d' ? 'Last 90 Days' :
                          usageReportDateRange === '1y' ? 'Last Year' : 'All Time'
                        } | <strong>Grouped By:</strong> {usageReportGrouping.charAt(0).toUpperCase() + usageReportGrouping.slice(1)}
                      </Typography>
                    </Alert>
                  </CardContent>
                </Card>
                {/* Overview Stats */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.50' }}>
                      <Typography variant="caption" color="text.secondary">Total Usage</Typography>
                      <Typography variant="h5" fontWeight="bold">{formatNumber(selectedTenantWallet.monthlyUsage)}</Typography>
                      <Typography variant="caption" color="primary">credits</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50' }}>
                      <Typography variant="caption" color="text.secondary">Revenue Generated</Typography>
                      <Typography variant="h5" fontWeight="bold">₹{(selectedTenantWallet.monthlyUsage * 0.065).toFixed(0)}</Typography>
                      <Typography variant="caption" color="success.main">from this tenant</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.50' }}>
                      <Typography variant="caption" color="text.secondary">Your Cost</Typography>
                      <Typography variant="h5" fontWeight="bold">₹{(selectedTenantWallet.monthlyUsage * 0.035).toFixed(0)}</Typography>
                      <Typography variant="caption" color="error.main">wholesale</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.50' }}>
                      <Typography variant="caption" color="text.secondary">Your Profit</Typography>
                      <Typography variant="h5" fontWeight="bold" color="warning.main">
                        ₹{(selectedTenantWallet.monthlyUsage * 0.03).toFixed(0)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">46% margin</Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Usage by Channel */}
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      📊 Usage Breakdown by Channel
                    </Typography>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'SMS', value: selectedTenantWallet.smsBalance * 0.4, fill: '#4FC3F7' },
                            { name: 'WhatsApp', value: selectedTenantWallet.whatsappBalance * 0.5, fill: '#25D366' },
                            { name: 'Email', value: selectedTenantWallet.emailBalance * 0.3, fill: '#E91E63' },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry: any) => `${entry.name}: ${((entry.value / selectedTenantWallet.monthlyUsage) * 100).toFixed(1)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="#4FC3F7" />
                          <Cell fill="#25D366" />
                          <Cell fill="#E91E63" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Daily Usage Trend - Dynamic */}
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      📈 Usage Trend - {
                        usageReportDateRange === '7d' ? 'Last 7 Days' :
                        usageReportDateRange === '30d' ? 'Last 30 Days' :
                        usageReportDateRange === '90d' ? 'Last 90 Days' :
                        usageReportDateRange === '1y' ? 'Last Year' : 'All Time'
                      } (Grouped by {usageReportGrouping})
                    </Typography>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={(() => {
                        const dataPoints = 
                          usageReportDateRange === '7d' && usageReportGrouping === 'hour' ? 168 : // 7 days * 24 hours
                          usageReportDateRange === '7d' ? 7 :
                          usageReportDateRange === '30d' && usageReportGrouping === 'day' ? 30 :
                          usageReportDateRange === '30d' && usageReportGrouping === 'week' ? 4 :
                          usageReportDateRange === '90d' && usageReportGrouping === 'day' ? 90 :
                          usageReportDateRange === '90d' && usageReportGrouping === 'week' ? 12 :
                          usageReportDateRange === '90d' && usageReportGrouping === 'month' ? 3 :
                          usageReportDateRange === '1y' && usageReportGrouping === 'week' ? 52 :
                          usageReportDateRange === '1y' && usageReportGrouping === 'month' ? 12 :
                          30;

                        const labelPrefix = 
                          usageReportGrouping === 'hour' ? 'Hour' :
                          usageReportGrouping === 'day' ? 'Day' :
                          usageReportGrouping === 'week' ? 'Week' :
                          'Month';

                        return Array.from({ length: dataPoints }, (_, i) => ({
                          label: `${labelPrefix} ${i + 1}`,
                          usage: Math.floor(Math.random() * 1000) + 200,
                          sms: Math.floor(Math.random() * 400) + 80,
                          whatsapp: Math.floor(Math.random() * 350) + 70,
                          email: Math.floor(Math.random() * 250) + 50,
                        }));
                      })()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="usage" stroke="#7B2CBF" strokeWidth={2} name="Total Usage" />
                        <Line type="monotone" dataKey="sms" stroke="#4FC3F7" strokeWidth={2} name="SMS" />
                        <Line type="monotone" dataKey="whatsapp" stroke="#25D366" strokeWidth={2} name="WhatsApp" />
                        <Line type="monotone" dataKey="email" stroke="#E91E63" strokeWidth={2} name="Email" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Detailed Breakdown */}
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      📋 Detailed Usage Statistics
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">SMS Usage</Typography>
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          {formatNumber(Math.floor(selectedTenantWallet.monthlyUsage * 0.4))}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">40% of total</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">WhatsApp Usage</Typography>
                        <Typography variant="h6" fontWeight="bold" sx={{ color: '#25D366' }}>
                          {formatNumber(Math.floor(selectedTenantWallet.monthlyUsage * 0.35))}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">35% of total</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Email Usage</Typography>
                        <Typography variant="h6" fontWeight="bold" color="error">
                          {formatNumber(Math.floor(selectedTenantWallet.monthlyUsage * 0.25))}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">25% of total</Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Avg Daily Usage</Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {formatNumber(Math.floor(selectedTenantWallet.monthlyUsage / 30))} credits/day
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Projected Monthly</Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {formatNumber(selectedTenantWallet.monthlyUsage * 1.1)} credits
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Peak Day</Typography>
                        <Typography variant="body1" fontWeight="bold">1,450 credits</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Days Until Empty</Typography>
                        <Typography variant="body1" fontWeight="bold" color="warning.main">
                          {Math.floor(selectedTenantWallet.totalBalance / (selectedTenantWallet.monthlyUsage / 30))} days
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUsageReportOpen(false)}>Close</Button>
            <Button variant="outlined" startIcon={<Download />}>
              Download PDF
            </Button>
            <Button variant="contained" startIcon={<Add />} onClick={() => {
              setUsageReportOpen(false);
              setAddCreditsOpen(true);
            }}>
              Add Credits
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  };

  // MERGED TAB: Packages & Pricing
  const renderPackagesPricingTab = () => (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">
            📦 Packages & Pricing Strategy
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your credit packages and pricing margins for maximum profitability
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setCreatePackageOpen(true)}>
          Create Custom Package
        </Button>
      </Box>

      {/* Pricing Matrix Section - Compact Enhanced Design */}
      <Card sx={{ mb: 4, border: '2px solid', borderColor: 'primary.main' }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            💰 Wholesale vs Retail Pricing Matrix
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Your pricing strategy and profit margins for each communication channel
          </Typography>

          {/* Compact Table View */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
            {pricingMatrix.map((item) => {
              const icon = item.type === 'SMS' ? <Sms /> : item.type === 'WhatsApp' ? <WhatsApp /> : <Email />;
              const iconColor = item.type === 'SMS' ? 'primary.main' : item.type === 'WhatsApp' ? '#25D366' : 'error.main';
              
              return (
                <Card 
                  key={item.type} 
                  sx={{ 
                    border: '1px solid', 
                    borderColor: 'divider',
                    transition: 'all 0.2s',
                    '&:hover': { boxShadow: 3, transform: 'translateY(-2px)' }
                  }}
                >
                  <CardContent>
                    {/* Header with Icon */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Box sx={{ color: iconColor }}>{icon}</Box>
                      <Typography variant="subtitle1" fontWeight="bold">{item.type}</Typography>
                    </Box>

                    {/* Pricing Grid - Compact */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
                      {/* Wholesale */}
                      <Box sx={{ p: 1.5, bgcolor: 'error.50', borderRadius: 1, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary" display="block">You Pay</Typography>
                        <Typography variant="h6" fontWeight="bold" color="error.main">
                          ₹{item.wholesaleRate.toFixed(3)}
                        </Typography>
                      </Box>

                      {/* Retail */}
                      <Box sx={{ p: 1.5, bgcolor: 'success.50', borderRadius: 1, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary" display="block">You Charge</Typography>
                        <Typography variant="h6" fontWeight="bold" color="success.main">
                          ₹{item.retailRate.toFixed(3)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Profit Badge */}
                    <Box sx={{ p: 1.5, bgcolor: 'primary.50', borderRadius: 1, textAlign: 'center', mb: 1.5 }}>
                      <Typography variant="caption" color="text.secondary" display="block">Your Profit</Typography>
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        ₹{item.profit.toFixed(3)}
                      </Typography>
                      <Chip label={`${item.markup.toFixed(1)}% markup`} size="small" color="primary" sx={{ mt: 0.5 }} />
                    </Box>

                    {/* Market Info - Compact */}
                    <Box sx={{ p: 1, bgcolor: 'grey.50', borderRadius: 1, mb: 1.5 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        💡 Recommended: <strong>₹{item.recommended.toFixed(3)}</strong>
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        📊 Market: {item.competitors}
                      </Typography>
                    </Box>

                    <Button 
                      variant="outlined" 
                      size="small" 
                      fullWidth
                      onClick={() => {
                        setSelectedPricingType(item);
                        setNewRetailRate(item.retailRate.toString());
                        setAdjustPricingOpen(true);
                      }}
                    >
                      Adjust Pricing
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </Box>

          {/* Profit Calculator - Compact Horizontal */}
          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              💰 Profit Calculator (Quick Reference)
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mt: 2 }}>
              {pricingMatrix.map((item) => (
                <Paper key={item.type} sx={{ p: 2 }}>
                  <Typography variant="caption" fontWeight="bold" display="block" gutterBottom color="primary">
                    {item.type} Profit
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">10K</Typography>
                      <Typography variant="body2" fontWeight="bold">₹{(item.profit * 10000).toFixed(0)}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">50K</Typography>
                      <Typography variant="body2" fontWeight="bold">₹{(item.profit * 50000).toFixed(0)}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">100K</Typography>
                      <Typography variant="body2" fontWeight="bold">₹{(item.profit * 100000).toFixed(0)}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">1M</Typography>
                      <Typography variant="body2" fontWeight="bold" color="success.main">₹{(item.profit * 1000000).toFixed(0)}</Typography>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Bulk Packages Section */}
      <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 4 }}>
        📦 Bulk Packages
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
        Pre-configured credit packages for tenants to purchase
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {packages.filter((p) => p.type === 'bulk').map((pkg) => (
          <Grid item xs={12} sm={6} md={4} key={pkg.id}>
            <Card
              sx={{
                border: pkg.isPopular ? '2px solid #7B2CBF' : '1px solid #eee',
                position: 'relative',
              }}
            >
              {pkg.isPopular && (
                <Chip
                  label="Most Popular"
                  color="primary"
                  size="small"
                  sx={{ position: 'absolute', top: 10, right: 10 }}
                />
              )}
              <CardContent>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  {pkg.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {pkg.description}
                </Typography>

                <Box sx={{ my: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Sms fontSize="small" color="primary" />
                    <Typography variant="body2">
                      {formatNumber(pkg.credits.sms)} SMS
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <WhatsApp fontSize="small" sx={{ color: '#25D366' }} />
                    <Typography variant="body2">
                      {formatNumber(pkg.credits.whatsapp)} WhatsApp
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Email fontSize="small" color="error" />
                    <Typography variant="body2">
                      {formatNumber(pkg.credits.email)} Email
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, my: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Wholesale:
                    </Typography>
                    <Typography variant="body2">
                      {formatCurrency(pkg.pricing.wholesaleCost)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Retail:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {formatCurrency(pkg.pricing.retailPrice)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="success.main">
                      Profit:
                    </Typography>
                    <Chip
                      label={`${pkg.pricing.profitMargin.toFixed(1)}%`}
                      color="success"
                      size="small"
                    />
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Validity: {pkg.validityDays} days
                </Typography>
                {pkg.savings && (
                  <Chip label={`Save ${pkg.savings}`} color="success" size="small" sx={{ mb: 2 }} />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 4 }}>
        Top-up Plans
      </Typography>
      <Grid container spacing={3}>
        {packages.filter((p) => p.type === 'topup').map((pkg) => (
          <Grid item xs={12} sm={6} md={4} key={pkg.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {pkg.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {pkg.description}
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, my: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Sms fontSize="small" color="primary" />
                    <Typography variant="body2">{formatNumber(pkg.credits.sms)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <WhatsApp fontSize="small" sx={{ color: '#25D366' }} />
                    <Typography variant="body2">{formatNumber(pkg.credits.whatsapp)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Email fontSize="small" color="error" />
                    <Typography variant="body2">{formatNumber(pkg.credits.email)}</Typography>
                  </Box>
                </Box>

                <Typography variant="h5" fontWeight="bold" color="primary" sx={{ my: 2 }}>
                  {formatCurrency(pkg.pricing.retailPrice)}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {pkg.validityDays} days validity
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Top-up Plans Section */}
      <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 4 }}>
        ⚡ Top-up Plans
      </Typography>
      <Grid container spacing={3}>
        {packages.filter((p) => p.type === 'topup').map((pkg) => (
          <Grid item xs={12} sm={6} md={4} key={pkg.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {pkg.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {pkg.description}
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, my: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Sms fontSize="small" color="primary" />
                    <Typography variant="body2">{formatNumber(pkg.credits.sms)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <WhatsApp fontSize="small" sx={{ color: '#25D366' }} />
                    <Typography variant="body2">{formatNumber(pkg.credits.whatsapp)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Email fontSize="small" color="error" />
                    <Typography variant="body2">{formatNumber(pkg.credits.email)}</Typography>
                  </Box>
                </Box>

                <Typography variant="h5" fontWeight="bold" color="primary" sx={{ my: 2 }}>
                  {formatCurrency(pkg.pricing.retailPrice)}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {pkg.validityDays} days validity
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  // Render Custom Plans Tab
  const renderCustomPlansTab = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          Custom Plans ({customPlans.length})
        </Typography>
        <Button variant="contained" startIcon={<Add />}>
          Create Custom Plan
        </Button>
      </Box>

      <Grid container spacing={3}>
        {customPlans.map((plan) => (
          <Grid item xs={12} sm={6} md={4} key={plan.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    {plan.name}
                  </Typography>
                  <Chip
                    label={plan.planType}
                    color="primary"
                    size="small"
                    sx={{ textTransform: 'capitalize' }}
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {plan.description}
                </Typography>

                {plan.tenantName && (
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    For: <strong>{plan.tenantName}</strong>
                  </Typography>
                )}

                <Box sx={{ my: 2 }}>
                  {plan.credits.sms > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Sms fontSize="small" color="primary" />
                      <Typography variant="body2">
                        {formatNumber(plan.credits.sms)} SMS
                      </Typography>
                    </Box>
                  )}
                  {plan.credits.whatsapp > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <WhatsApp fontSize="small" sx={{ color: '#25D366' }} />
                      <Typography variant="body2">
                        {formatNumber(plan.credits.whatsapp)} WhatsApp
                      </Typography>
                    </Box>
                  )}
                  {plan.credits.email > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Email fontSize="small" color="error" />
                      <Typography variant="body2">
                        {formatNumber(plan.credits.email)} Email
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, my: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Price:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {formatCurrency(plan.pricing.price)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="success.main">
                      Profit:
                    </Typography>
                    <Typography variant="body2" color="success.main" fontWeight="bold">
                      {formatCurrency(plan.pricing.profit)}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary">
                  Validity: {plan.validityDays} days
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {customPlans.length === 0 && (
        <Card>
          <CardContent>
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No custom plans created yet. Click "Create Custom Plan" to get started.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );

  // NEW TAB: Vendors Management
  // MERGED TAB: Buy Credits (Vendors + Purchase)
  const renderBuyCreditsTab = () => (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">
            🛒 Buy Credits from Vendors
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Purchase SMS, WhatsApp, and Email credits from integrated 3rd party providers
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<Add />} size="small">
          Add New Vendor
        </Button>
      </Box>

      {/* Quick Purchase Cards */}
      <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
        ⚡ Quick Purchase
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {vendors.map((vendor) => (
          <Grid item xs={12} sm={6} md={3} key={vendor.id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: '2px solid transparent',
                '&:hover': { 
                  transform: 'translateY(-4px)', 
                  boxShadow: 4,
                  borderColor: 'primary.main'
                }
              }}
              onClick={() => handleVendorClick(vendor)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                  <Typography variant="subtitle1" fontWeight="bold">{vendor.name}</Typography>
                  <Chip 
                    label={vendor.status} 
                    color={vendor.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
                <Chip label={vendor.type} size="small" sx={{ mb: 1.5 }} />
                <Box sx={{ mb: 1.5 }}>
                  {vendor.smsRate > 0 && (
                    <Typography variant="caption" display="block" color="text.secondary">
                      📱 SMS: ₹{vendor.smsRate.toFixed(3)}
                    </Typography>
                  )}
                  {vendor.whatsappRate > 0 && (
                    <Typography variant="caption" display="block" color="text.secondary">
                      💬 WhatsApp: ₹{vendor.whatsappRate.toFixed(3)}
                    </Typography>
                  )}
                </Box>
                <Button 
                  variant="contained" 
                  size="small" 
                  fullWidth 
                  startIcon={<ShoppingCart />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBuyCredits(vendor);
                  }}
                >
                  Buy Now
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Detailed Vendor Cards */}
      <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ mb: 2, mt: 4 }}>
        📋 All Vendors ({vendors.length})
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {vendors.map((vendor) => (
          <Grid item xs={12} md={6} key={vendor.id}>
            <Card 
              sx={{ 
                transition: 'all 0.2s',
                '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">{vendor.name}</Typography>
                    <Chip label={vendor.type} size="small" sx={{ mt: 0.5 }} />
                  </Box>
                  <Chip 
                    label={vendor.status} 
                    color={vendor.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, my: 2 }}>
                  {vendor.smsRate > 0 && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">SMS Rate</Typography>
                      <Typography variant="body2" fontWeight="bold">₹{vendor.smsRate.toFixed(3)}</Typography>
                    </Box>
                  )}
                  {vendor.whatsappRate > 0 && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">WhatsApp Rate</Typography>
                      <Typography variant="body2" fontWeight="bold">₹{vendor.whatsappRate.toFixed(3)}</Typography>
                    </Box>
                  )}
                  {(vendor as any).emailRate > 0 && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Email Rate</Typography>
                      <Typography variant="body2" fontWeight="bold">₹{(vendor as any).emailRate.toFixed(3)}</Typography>
                    </Box>
                  )}
                  <Box>
                    <Typography variant="caption" color="text.secondary">Reliability</Typography>
                    <Typography variant="body2" fontWeight="bold" color="success.main">{vendor.reliability}%</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Current Balance</Typography>
                    <Typography variant="body2" fontWeight="bold">{formatNumber(vendor.balance)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Total Purchased</Typography>
                    <Typography variant="body2">{formatNumber(vendor.totalPurchased)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Last Purchase</Typography>
                    <Typography variant="body2">{new Date(vendor.lastPurchase).toLocaleDateString()}</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button 
                    variant="contained" 
                    size="small" 
                    fullWidth 
                    startIcon={<ShoppingCart />}
                    onClick={() => handleBuyCredits(vendor)}
                  >
                    Buy Credits
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    fullWidth 
                    startIcon={<Visibility />}
                    onClick={() => handleVendorClick(vendor)}
                  >
                    View Details
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Purchase History */}
      <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ mt: 4 }}>
        📜 Recent Purchase History
      </Typography>
      <Card>
        <CardContent>
          <DataGrid
            rows={purchaseHistory}
            columns={[
              { field: 'vendor', headerName: 'Vendor', width: 130 },
              { field: 'type', headerName: 'Type', width: 120 },
              { 
                field: 'credits', 
                headerName: 'Credits', 
                width: 120,
                renderCell: (params) => <strong>{formatNumber(params.value as number)}</strong>
              },
              { 
                field: 'rate', 
                headerName: 'Rate', 
                width: 100,
                renderCell: (params) => `₹${(params.value as number).toFixed(3)}`
              },
              { 
                field: 'total', 
                headerName: 'Total Cost', 
                width: 120,
                renderCell: (params) => <Typography fontWeight="bold" color="primary">₹{(params.value as number).toLocaleString()}</Typography>
              },
              { field: 'date', headerName: 'Date', width: 120 },
              { 
                field: 'status', 
                headerName: 'Status', 
                width: 120,
                renderCell: (params) => (
                  <Chip label={params.value} color="success" size="small" />
                )
              },
            ]}
            autoHeight
            disableRowSelectionOnClick
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
          />
        </CardContent>
      </Card>
    </Box>
  );

  // NEW TAB: Pricing Matrix
  const renderPricingMatrixTab = () => (
    <Box>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Wholesale vs Retail Pricing
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage your pricing strategy and profit margins for each communication channel
      </Typography>

      <Grid container spacing={3}>
        {pricingMatrix.map((item) => (
          <Grid item xs={12} md={4} key={item.type}>
            <Card sx={{ border: '2px solid', borderColor: 'primary.main' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {item.type}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Wholesale */}
                  <Box sx={{ p: 2, bgcolor: 'error.50', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">Wholesale (You Pay)</Typography>
                    <Typography variant="h5" fontWeight="bold" color="error.main">
                      ₹{item.wholesaleRate.toFixed(3)}
                    </Typography>
                    <Typography variant="caption">per {item.type.toLowerCase()}</Typography>
                  </Box>

                  {/* Retail */}
                  <Box sx={{ p: 2, bgcolor: 'success.50', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">Retail (You Charge)</Typography>
                    <Typography variant="h5" fontWeight="bold" color="success.main">
                      ₹{item.retailRate.toFixed(3)}
                    </Typography>
                    <Typography variant="caption">per {item.type.toLowerCase()}</Typography>
                  </Box>

                  {/* Profit */}
                  <Box sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">Your Profit</Typography>
                    <Typography variant="h5" fontWeight="bold" color="primary">
                      ₹{item.profit.toFixed(3)}
                    </Typography>
                    <Typography variant="caption">({item.markup.toFixed(1)}% markup)</Typography>
                  </Box>

                  {/* Market Info */}
                  <Box>
                    <Typography variant="caption" color="text.secondary">Recommended Price:</Typography>
                    <Typography variant="body2" fontWeight="bold">₹{item.recommended.toFixed(3)}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Market Range: {item.competitors}
                    </Typography>
                  </Box>

                  <Button variant="outlined" size="small" fullWidth>
                    Adjust Pricing
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Profit Calculator */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            💰 Profit Calculator
          </Typography>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block" sx={{ mb: 2 }}>
            Calculate potential earnings based on volume
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
            {pricingMatrix.map((item) => (
              <Box key={item.type} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{item.type}</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="caption">10K: <strong>₹{(item.profit * 10000).toFixed(0)}</strong> profit</Typography>
                  <Typography variant="caption">50K: <strong>₹{(item.profit * 50000).toFixed(0)}</strong> profit</Typography>
                  <Typography variant="caption">100K: <strong>₹{(item.profit * 100000).toFixed(0)}</strong> profit</Typography>
                  <Typography variant="caption">1M: <strong>₹{(item.profit * 1000000).toFixed(0)}</strong> profit</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  // NEW TAB: Profit Analytics
  const renderProfitAnalyticsTab = () => (
    <Box>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Profit & Margin Analytics
      </Typography>

      {/* KPIs */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">Total Revenue</Typography>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                ₹{(stats.totalRevenue * 1000).toLocaleString()}
              </Typography>
              <Chip label="+12.5% vs last month" size="small" color="success" sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">Total Cost</Typography>
              <Typography variant="h4" fontWeight="bold" color="error.main">
                ₹{((stats.totalRevenue * 1000) * 0.55).toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">Wholesale cost</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.50' }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">Net Profit</Typography>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                ₹{((stats.totalRevenue * 1000) * 0.445).toLocaleString()}
              </Typography>
              <Typography variant="caption" fontWeight="bold">44.5% margin</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">Credits Sold</Typography>
              <Typography variant="h4" fontWeight="bold">
                {formatNumber(stats.totalSold)}
              </Typography>
              <Typography variant="caption" color="text.secondary">to {stats.activeTenants} tenants</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Profit by Channel */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Profit Breakdown by Channel
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={usageTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sms" stroke="#4FC3F7" name="SMS Profit" strokeWidth={2} />
              <Line type="monotone" dataKey="whatsapp" stroke="#25D366" name="WhatsApp Profit" strokeWidth={2} />
              <Line type="monotone" dataKey="email" stroke="#E91E63" name="Email Profit" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Revenue Generating Tenants */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Top Revenue Generating Tenants
          </Typography>
          <DataGrid
            rows={topConsumers.map((t, idx) => ({
              id: t.id,
              rank: idx + 1,
              tenant: t.tenantName,
              usage: t.monthlyUsage,
              revenue: t.monthlyUsage * 0.065,
              profit: t.monthlyUsage * 0.03,
              margin: '46.2%'
            }))}
            columns={[
              { field: 'rank', headerName: '#', width: 60 },
              { field: 'tenant', headerName: 'Tenant', flex: 1 },
              { 
                field: 'usage', 
                headerName: 'Credits Used', 
                width: 140,
                renderCell: (params) => formatNumber(params.value as number)
              },
              { 
                field: 'revenue', 
                headerName: 'Revenue', 
                width: 120,
                renderCell: (params) => (
                  <Typography fontWeight="bold" color="success.main">
                    ₹{(params.value as number).toFixed(0)}
                  </Typography>
                )
              },
              { 
                field: 'profit', 
                headerName: 'Your Profit', 
                width: 120,
                renderCell: (params) => (
                  <Typography fontWeight="bold" color="primary">
                    ₹{(params.value as number).toFixed(0)}
                  </Typography>
                )
              },
              { field: 'margin', headerName: 'Margin', width: 100 },
            ]}
            autoHeight
            disableRowSelectionOnClick
            hideFooter
          />
        </CardContent>
      </Card>
    </Box>
  );

  // Handlers
  const handleVendorClick = (vendor: any) => {
    setSelectedVendor(vendor);
    setVendorDetailsOpen(true);
  };

  const handleBuyCredits = (vendor: any) => {
    setPurchaseForm({ ...purchaseForm, vendor: vendor.name });
    setPurchaseDialogOpen(true);
  };

  const handlePurchaseSubmit = () => {
    console.log('Purchasing credits:', purchaseForm);
    setPurchaseDialogOpen(false);
    setPurchaseStep(0);
    setPurchaseForm({
      vendor: '',
      creditType: 'sms',
      credits: '',
      autoCalculate: true,
      totalCost: 0,
    });
  };

  const calculatePurchaseCost = () => {
    const vendor = vendors.find(v => v.name === purchaseForm.vendor);
    if (!vendor || !purchaseForm.credits) return 0;
    
    const credits = Number(purchaseForm.credits);
    if (purchaseForm.creditType === 'sms') return credits * vendor.smsRate;
    if (purchaseForm.creditType === 'whatsapp') return credits * vendor.whatsappRate;
    if (purchaseForm.creditType === 'email') return credits * (vendor as any).emailRate;
    return 0;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Adjust Pricing Dialog */}
      <Dialog open={adjustPricingOpen} onClose={() => setAdjustPricingOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AttachMoney />
            <Typography variant="h6" fontWeight="bold">Adjust {selectedPricingType?.type} Pricing</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedPricingType && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Current Pricing */}
              <Alert severity="info">
                <Typography variant="caption" fontWeight="bold" display="block" gutterBottom>
                  Current Pricing
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption">Wholesale (Cost):</Typography>
                  <Typography variant="caption" fontWeight="bold">₹{selectedPricingType.wholesaleRate.toFixed(3)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption">Current Retail:</Typography>
                  <Typography variant="caption" fontWeight="bold">₹{selectedPricingType.retailRate.toFixed(3)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption">Current Markup:</Typography>
                  <Typography variant="caption" fontWeight="bold" color="success.main">{selectedPricingType.markup.toFixed(1)}%</Typography>
                </Box>
              </Alert>

              {/* New Retail Rate */}
              <TextField
                label="New Retail Rate"
                type="number"
                value={newRetailRate}
                onChange={(e) => setNewRetailRate(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>
                }}
                helperText={`Recommended: ₹${selectedPricingType.recommended.toFixed(3)} | Market: ${selectedPricingType.competitors}`}
              />

              {/* Live Preview */}
              {newRetailRate && (
                <Alert severity="success">
                  <Typography variant="caption" fontWeight="bold" display="block" gutterBottom>
                    💵 New Pricing Preview
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption">New Profit per Credit:</Typography>
                    <Typography variant="caption" fontWeight="bold" color="success.main">
                      ₹{(Number(newRetailRate) - selectedPricingType.wholesaleRate).toFixed(3)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption">New Markup:</Typography>
                    <Typography variant="caption" fontWeight="bold" color="primary">
                      {(((Number(newRetailRate) - selectedPricingType.wholesaleRate) / selectedPricingType.wholesaleRate) * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="caption" fontWeight="bold" display="block">
                    Profit at different volumes:
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mt: 1 }}>
                    <Typography variant="caption">10K: ₹{((Number(newRetailRate) - selectedPricingType.wholesaleRate) * 10000).toFixed(0)}</Typography>
                    <Typography variant="caption">50K: ₹{((Number(newRetailRate) - selectedPricingType.wholesaleRate) * 50000).toFixed(0)}</Typography>
                    <Typography variant="caption">100K: ₹{((Number(newRetailRate) - selectedPricingType.wholesaleRate) * 100000).toFixed(0)}</Typography>
                    <Typography variant="caption" color="success.main" fontWeight="bold">
                      1M: ₹{((Number(newRetailRate) - selectedPricingType.wholesaleRate) * 1000000).toFixed(0)}
                    </Typography>
                  </Box>
                </Alert>
              )}

              {/* Quick Presets */}
              <Box>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  Quick Presets (Markup %)
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {[30, 50, 75, 85, 100].map((markup) => {
                    const presetRate = selectedPricingType.wholesaleRate * (1 + markup / 100);
                    return (
                      <Chip
                        key={markup}
                        label={`${markup}%`}
                        size="small"
                        onClick={() => setNewRetailRate(presetRate.toFixed(3))}
                        sx={{ cursor: 'pointer' }}
                      />
                    );
                  })}
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdjustPricingOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            disabled={!newRetailRate || Number(newRetailRate) <= selectedPricingType?.wholesaleRate}
            onClick={() => {
              console.log('Updating pricing for', selectedPricingType?.type, 'to', newRetailRate);
              setAdjustPricingOpen(false);
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Purchase Credits Dialog */}
      <Dialog open={purchaseDialogOpen} onClose={() => setPurchaseDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShoppingCart />
            <Typography variant="h6" fontWeight="bold">Purchase Credits from {purchaseForm.vendor}</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Stepper activeStep={purchaseStep} sx={{ mb: 3 }}>
            <Step><StepLabel>Select Type & Quantity</StepLabel></Step>
            <Step><StepLabel>Review & Confirm</StepLabel></Step>
            <Step><StepLabel>Payment</StepLabel></Step>
          </Stepper>

          {purchaseStep === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Credit Type</InputLabel>
                <Select
                  value={purchaseForm.creditType}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, creditType: e.target.value })}
                  label="Credit Type"
                >
                  <MenuItem value="sms"><Sms sx={{ mr: 1 }} /> SMS</MenuItem>
                  <MenuItem value="whatsapp"><WhatsApp sx={{ mr: 1 }} /> WhatsApp</MenuItem>
                  <MenuItem value="email"><Email sx={{ mr: 1 }} /> Email</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Number of Credits"
                type="number"
                value={purchaseForm.credits}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, credits: e.target.value })}
                fullWidth
                helperText="Minimum 10,000 credits"
              />

              {purchaseForm.credits && (
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Cost Breakdown:</strong><br />
                    {Number(purchaseForm.credits).toLocaleString()} credits × ₹{
                      vendors.find(v => v.name === purchaseForm.vendor)?.[
                        purchaseForm.creditType === 'sms' ? 'smsRate' : 
                        purchaseForm.creditType === 'whatsapp' ? 'whatsappRate' : 'emailRate'
                      ]?.toFixed(3)
                    } = <strong>₹{calculatePurchaseCost().toLocaleString()}</strong>
                  </Typography>
                </Alert>
              )}
            </Box>
          )}

          {purchaseStep === 1 && (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">Order Summary</Typography>
              </Alert>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Vendor:</Typography>
                    <Typography fontWeight="bold">{purchaseForm.vendor}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Type:</Typography>
                    <Chip label={purchaseForm.creditType.toUpperCase()} size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Credits:</Typography>
                    <Typography fontWeight="bold">{Number(purchaseForm.credits).toLocaleString()}</Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6">Total Cost:</Typography>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      ₹{calculatePurchaseCost().toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>
          )}

          {purchaseStep === 2 && (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Purchase Successful!
              </Typography>
              <Typography color="text.secondary">
                {Number(purchaseForm.credits).toLocaleString()} credits added to your master wallet
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {purchaseStep > 0 && purchaseStep < 2 && (
            <Button onClick={() => setPurchaseStep(purchaseStep - 1)}>Back</Button>
          )}
          <Button onClick={() => setPurchaseDialogOpen(false)}>Cancel</Button>
          {purchaseStep < 2 && (
            <Button 
              variant="contained" 
              onClick={() => {
                if (purchaseStep === 1) {
                  handlePurchaseSubmit();
                  setPurchaseStep(2);
                } else {
                  setPurchaseStep(purchaseStep + 1);
                }
              }}
              disabled={!purchaseForm.credits}
            >
              {purchaseStep === 1 ? 'Confirm Purchase' : 'Next'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Vendor Details Dialog */}
      <Dialog open={vendorDetailsOpen} onClose={() => setVendorDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">{selectedVendor?.name} Details</Typography>
            <Chip label={selectedVendor?.status} color="success" size="small" />
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedVendor && (
            <Box>
              {/* Vendor Stats */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Reliability</Typography>
                    <Typography variant="h5" fontWeight="bold" color="success.main">
                      {selectedVendor.reliability}%
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Balance</Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {formatNumber(selectedVendor.balance)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Total Bought</Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {formatNumber(selectedVendor.totalPurchased)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Last Purchase</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {new Date(selectedVendor.lastPurchase).toLocaleDateString()}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Pricing */}
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Wholesale Rates</Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                {selectedVendor.smsRate > 0 && (
                  <Card sx={{ flex: 1 }}>
                    <CardContent>
                      <Sms color="primary" />
                      <Typography variant="caption" display="block" color="text.secondary">SMS</Typography>
                      <Typography variant="h6" fontWeight="bold">₹{selectedVendor.smsRate.toFixed(3)}</Typography>
                    </CardContent>
                  </Card>
                )}
                {selectedVendor.whatsappRate > 0 && (
                  <Card sx={{ flex: 1 }}>
                    <CardContent>
                      <WhatsApp sx={{ color: '#25D366' }} />
                      <Typography variant="caption" display="block" color="text.secondary">WhatsApp</Typography>
                      <Typography variant="h6" fontWeight="bold">₹{selectedVendor.whatsappRate.toFixed(3)}</Typography>
                    </CardContent>
                  </Card>
                )}
                {selectedVendor.emailRate > 0 && (
                  <Card sx={{ flex: 1 }}>
                    <CardContent>
                      <Email color="error" />
                      <Typography variant="caption" display="block" color="text.secondary">Email</Typography>
                      <Typography variant="h6" fontWeight="bold">₹{selectedVendor.emailRate.toFixed(3)}</Typography>
                    </CardContent>
                  </Card>
                )}
              </Box>

              {/* Purchase History with this vendor */}
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Purchase History</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {purchaseHistory.filter(p => p.vendor === selectedVendor.name).map((purchase) => (
                  <Card key={purchase.id} variant="outlined">
                    <CardContent sx={{ py: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">{formatNumber(purchase.credits)} {purchase.type}</Typography>
                          <Typography variant="caption" color="text.secondary">{purchase.date}</Typography>
                        </Box>
                        <Typography variant="body2" fontWeight="bold" color="primary">
                          ₹{purchase.total.toLocaleString()}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVendorDetailsOpen(false)}>Close</Button>
          <Button variant="contained" startIcon={<ShoppingCart />} onClick={() => {
            setVendorDetailsOpen(false);
            handleBuyCredits(selectedVendor);
          }}>
            Buy Credits
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Custom Package Dialog */}
      <Dialog open={createPackageOpen} onClose={() => setCreatePackageOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalOffer />
            <Typography variant="h6" fontWeight="bold">Create Custom Credit Package</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Quick Templates */}
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary">
                ⚡ Quick Templates (Auto-Fill)
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label="🚀 Starter Pack"
                  clickable
                  onClick={() => setNewPackage({
                    ...newPackage,
                    name: 'Starter Communication Pack',
                    description: 'Perfect for small libraries starting their messaging journey',
                    includeSMS: true,
                    smsCredits: '5000',
                    includeWhatsApp: true,
                    whatsappCredits: '2000',
                    includeEmail: true,
                    emailCredits: '10000',
                    price: '749',
                    validity: '30',
                  })}
                  sx={{ fontSize: '0.75rem' }}
                />
                <Chip
                  label="💼 Business Pack"
                  clickable
                  color="primary"
                  onClick={() => setNewPackage({
                    ...newPackage,
                    name: 'Business Communication Bundle',
                    description: 'Comprehensive package for growing libraries',
                    includeSMS: true,
                    smsCredits: '15000',
                    includeWhatsApp: true,
                    whatsappCredits: '8000',
                    includeEmail: true,
                    emailCredits: '30000',
                    price: '2199',
                    validity: '30',
                    isPopular: true,
                  })}
                  sx={{ fontSize: '0.75rem' }}
                />
                <Chip
                  label="🏢 Enterprise Pack"
                  clickable
                  onClick={() => setNewPackage({
                    ...newPackage,
                    name: 'Enterprise Mega Bundle',
                    description: 'Maximum value for high-volume libraries',
                    includeSMS: true,
                    smsCredits: '50000',
                    includeWhatsApp: true,
                    whatsappCredits: '25000',
                    includeEmail: true,
                    emailCredits: '100000',
                    price: '6999',
                    validity: '60',
                    discountEnabled: true,
                    discountType: 'percentage',
                    discountValue: '15',
                  })}
                  sx={{ fontSize: '0.75rem' }}
                />
                <Chip
                  label="📱 SMS Only"
                  clickable
                  onClick={() => setNewPackage({
                    ...newPackage,
                    name: 'SMS Specialist Pack',
                    description: 'Focus on SMS with maximum credits',
                    includeSMS: true,
                    smsCredits: '25000',
                    includeWhatsApp: false,
                    whatsappCredits: '',
                    includeEmail: false,
                    emailCredits: '',
                    price: '1599',
                    validity: '45',
                  })}
                  sx={{ fontSize: '0.75rem' }}
                />
                <Chip
                  label="💬 WhatsApp Only"
                  clickable
                  onClick={() => setNewPackage({
                    ...newPackage,
                    name: 'WhatsApp Premium Pack',
                    description: 'Premium WhatsApp messaging for personalized communication',
                    includeSMS: false,
                    smsCredits: '',
                    includeWhatsApp: true,
                    whatsappCredits: '15000',
                    includeEmail: false,
                    emailCredits: '',
                    price: '1399',
                    validity: '30',
                  })}
                  sx={{ fontSize: '0.75rem' }}
                />
                <Chip
                  label="🎯 Bulk SMS"
                  clickable
                  color="secondary"
                  onClick={() => setNewPackage({
                    ...newPackage,
                    name: 'Mega SMS Bundle',
                    description: 'Best value for high-volume SMS campaigns',
                    includeSMS: true,
                    smsCredits: '100000',
                    includeWhatsApp: false,
                    whatsappCredits: '',
                    includeEmail: false,
                    emailCredits: '',
                    price: '5999',
                    validity: '90',
                    discountEnabled: true,
                    discountType: 'flat',
                    discountValue: '500',
                  })}
                  sx={{ fontSize: '0.75rem' }}
                />
                <Chip
                  label="🌟 All-in-One"
                  clickable
                  variant="outlined"
                  onClick={() => setNewPackage({
                    ...newPackage,
                    name: 'Complete Communication Suite',
                    description: 'Balanced mix of all communication channels',
                    includeSMS: true,
                    smsCredits: '20000',
                    includeWhatsApp: true,
                    whatsappCredits: '10000',
                    includeEmail: true,
                    emailCredits: '50000',
                    price: '2999',
                    validity: '30',
                    isPopular: true,
                  })}
                  sx={{ fontSize: '0.75rem' }}
                />
              </Box>
            </Box>

            {/* Basic Info */}
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary">
                📋 Package Information
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mt: 2 }}>
                <TextField
                  label="Package Name"
                  placeholder="e.g., Mega SMS Pack"
                  value={newPackage.name}
                  onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                  fullWidth
                  required
                />
                <TextField
                  label="Validity (Days)"
                  type="number"
                  value={newPackage.validity}
                  onChange={(e) => setNewPackage({ ...newPackage, validity: e.target.value })}
                  fullWidth
                  helperText="0 for unlimited"
                />
              </Box>
              <TextField
                label="Description"
                placeholder="What makes this package special?"
                value={newPackage.description}
                onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })}
                fullWidth
                multiline
                rows={2}
                sx={{ mt: 2 }}
              />
            </Box>

            {/* Credits Allocation */}
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary">
                💬 Credits Allocation
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                Toggle to include each type, then set quantities
              </Typography>

              {/* All Credits in Single Row */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                {/* SMS Credits */}
                <Card variant="outlined" sx={{ p: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={newPackage.includeSMS}
                        onChange={(e) => setNewPackage({ ...newPackage, includeSMS: e.target.checked, smsCredits: e.target.checked ? '10000' : '' })}
                        size="small"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Sms fontSize="small" color="primary" />
                        <Typography variant="caption" fontWeight="bold">SMS</Typography>
                      </Box>
                    }
                    sx={{ mb: 1.5, ml: 0 }}
                  />
                  {newPackage.includeSMS && (
                    <Box>
                      <TextField
                        label="Credits"
                        type="number"
                        value={newPackage.smsCredits}
                        onChange={(e) => setNewPackage({ ...newPackage, smsCredits: e.target.value })}
                        fullWidth
                        size="small"
                      />
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="caption" color="error.main" display="block">
                          Cost: ₹{(Number(newPackage.smsCredits) * 0.035).toFixed(2)}
                        </Typography>
                        <Typography variant="caption" color="success.main" display="block">
                          Value: ₹{(Number(newPackage.smsCredits) * 0.065).toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Card>

                {/* WhatsApp Credits */}
                <Card variant="outlined" sx={{ p: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={newPackage.includeWhatsApp}
                        onChange={(e) => setNewPackage({ ...newPackage, includeWhatsApp: e.target.checked, whatsappCredits: e.target.checked ? '5000' : '' })}
                        size="small"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <WhatsApp fontSize="small" sx={{ color: '#25D366' }} />
                        <Typography variant="caption" fontWeight="bold">WhatsApp</Typography>
                      </Box>
                    }
                    sx={{ mb: 1.5, ml: 0 }}
                  />
                  {newPackage.includeWhatsApp && (
                    <Box>
                      <TextField
                        label="Credits"
                        type="number"
                        value={newPackage.whatsappCredits}
                        onChange={(e) => setNewPackage({ ...newPackage, whatsappCredits: e.target.value })}
                        fullWidth
                        size="small"
                      />
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="caption" color="error.main" display="block">
                          Cost: ₹{(Number(newPackage.whatsappCredits) * 0.055).toFixed(2)}
                        </Typography>
                        <Typography variant="caption" color="success.main" display="block">
                          Value: ₹{(Number(newPackage.whatsappCredits) * 0.095).toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Card>

                {/* Email Credits */}
                <Card variant="outlined" sx={{ p: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={newPackage.includeEmail}
                        onChange={(e) => setNewPackage({ ...newPackage, includeEmail: e.target.checked, emailCredits: e.target.checked ? '50000' : '' })}
                        size="small"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Email fontSize="small" color="error" />
                        <Typography variant="caption" fontWeight="bold">Email</Typography>
                      </Box>
                    }
                    sx={{ mb: 1.5, ml: 0 }}
                  />
                  {newPackage.includeEmail && (
                    <Box>
                      <TextField
                        label="Credits"
                        type="number"
                        value={newPackage.emailCredits}
                        onChange={(e) => setNewPackage({ ...newPackage, emailCredits: e.target.value })}
                        fullWidth
                        size="small"
                      />
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="caption" color="error.main" display="block">
                          Cost: ₹{(Number(newPackage.emailCredits) * 0.008).toFixed(2)}
                        </Typography>
                        <Typography variant="caption" color="success.main" display="block">
                          Value: ₹{(Number(newPackage.emailCredits) * 0.015).toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Card>
              </Box>

              {/* Total Cost Summary - Enhanced with Retail Calculation */}
              {(newPackage.includeSMS || newPackage.includeWhatsApp || newPackage.includeEmail) && (
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
                  {/* Wholesale Cost */}
                  <Alert severity="error" sx={{ mb: 0 }}>
                    <Typography variant="caption" fontWeight="bold" display="block" gutterBottom>
                      💸 Your Cost (Wholesale)
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {newPackage.includeSMS && newPackage.smsCredits && (
                        <Typography variant="caption">
                          SMS: {Number(newPackage.smsCredits).toLocaleString()} × ₹0.035 = ₹{(Number(newPackage.smsCredits) * 0.035).toFixed(2)}
                        </Typography>
                      )}
                      {newPackage.includeWhatsApp && newPackage.whatsappCredits && (
                        <Typography variant="caption">
                          WhatsApp: {Number(newPackage.whatsappCredits).toLocaleString()} × ₹0.055 = ₹{(Number(newPackage.whatsappCredits) * 0.055).toFixed(2)}
                        </Typography>
                      )}
                      {newPackage.includeEmail && newPackage.emailCredits && (
                        <Typography variant="caption">
                          Email: {Number(newPackage.emailCredits).toLocaleString()} × ₹0.008 = ₹{(Number(newPackage.emailCredits) * 0.008).toFixed(2)}
                        </Typography>
                      )}
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2" fontWeight="bold" color="error.main">
                        Total Cost: ₹{(
                          (newPackage.includeSMS ? Number(newPackage.smsCredits) || 0 : 0) * 0.035 +
                          (newPackage.includeWhatsApp ? Number(newPackage.whatsappCredits) || 0 : 0) * 0.055 +
                          (newPackage.includeEmail ? Number(newPackage.emailCredits) || 0 : 0) * 0.008
                        ).toFixed(2)}
                      </Typography>
                    </Box>
                  </Alert>

                  {/* Retail Value */}
                  <Alert severity="success" sx={{ mb: 0 }}>
                    <Typography variant="caption" fontWeight="bold" display="block" gutterBottom>
                      💰 Market Value (Retail)
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {newPackage.includeSMS && newPackage.smsCredits && (
                        <Typography variant="caption">
                          SMS: {Number(newPackage.smsCredits).toLocaleString()} × ₹0.065 = ₹{(Number(newPackage.smsCredits) * 0.065).toFixed(2)}
                        </Typography>
                      )}
                      {newPackage.includeWhatsApp && newPackage.whatsappCredits && (
                        <Typography variant="caption">
                          WhatsApp: {Number(newPackage.whatsappCredits).toLocaleString()} × ₹0.095 = ₹{(Number(newPackage.whatsappCredits) * 0.095).toFixed(2)}
                        </Typography>
                      )}
                      {newPackage.includeEmail && newPackage.emailCredits && (
                        <Typography variant="caption">
                          Email: {Number(newPackage.emailCredits).toLocaleString()} × ₹0.015 = ₹{(Number(newPackage.emailCredits) * 0.015).toFixed(2)}
                        </Typography>
                      )}
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        Total Value: ₹{(
                          (newPackage.includeSMS ? Number(newPackage.smsCredits) || 0 : 0) * 0.065 +
                          (newPackage.includeWhatsApp ? Number(newPackage.whatsappCredits) || 0 : 0) * 0.095 +
                          (newPackage.includeEmail ? Number(newPackage.emailCredits) || 0 : 0) * 0.015
                        ).toFixed(2)}
                      </Typography>
                    </Box>
                  </Alert>
                </Box>
              )}

              {/* Suggested Retail Price */}
              {(newPackage.includeSMS || newPackage.includeWhatsApp || newPackage.includeEmail) && (
                <Alert severity="warning" icon={<Info />}>
                  <Typography variant="caption" fontWeight="bold" display="block">
                    💡 Pricing Recommendation
                  </Typography>
                  <Typography variant="body2">
                    Suggested Retail Price: <strong>₹{(
                      (newPackage.includeSMS ? Number(newPackage.smsCredits) || 0 : 0) * 0.065 +
                      (newPackage.includeWhatsApp ? Number(newPackage.whatsappCredits) || 0 : 0) * 0.095 +
                      (newPackage.includeEmail ? Number(newPackage.emailCredits) || 0 : 0) * 0.015
                    ).toFixed(2)}</strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Based on current retail rates (85.7% avg markup)
                  </Typography>
                </Alert>
              )}
            </Box>

            {/* Pricing */}
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary">
                💰 Retail Pricing (What Tenants Pay)
              </Typography>
              
              <TextField
                label="Package Price"
                type="number"
                value={newPackage.price}
                onChange={(e) => setNewPackage({ ...newPackage, price: e.target.value })}
                fullWidth
                required
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>
                }}
                helperText="Set your retail price (before discount)"
                sx={{ mt: 2 }}
              />

              {/* Discount Section */}
              <Card variant="outlined" sx={{ p: 2, mt: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={newPackage.discountEnabled}
                      onChange={(e) => setNewPackage({ ...newPackage, discountEnabled: e.target.checked })}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocalOffer sx={{ color: 'warning.main' }} />
                      <Typography variant="body2" fontWeight="bold">Add Promotional Discount</Typography>
                    </Box>
                  }
                />

                {newPackage.discountEnabled && (
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 2 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Type</InputLabel>
                        <Select
                          value={newPackage.discountType}
                          onChange={(e) => setNewPackage({ ...newPackage, discountType: e.target.value })}
                          label="Type"
                        >
                          <MenuItem value="percentage">Percentage %</MenuItem>
                          <MenuItem value="flat">Flat Amount ₹</MenuItem>
                        </Select>
                      </FormControl>

                      <TextField
                        label={newPackage.discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount'}
                        type="number"
                        value={newPackage.discountValue}
                        onChange={(e) => setNewPackage({ ...newPackage, discountValue: e.target.value })}
                        fullWidth
                        size="small"
                        InputProps={{
                          endAdornment: (
                            <Typography sx={{ ml: 1, color: 'text.secondary' }}>
                              {newPackage.discountType === 'percentage' ? '%' : '₹'}
                            </Typography>
                          )
                        }}
                      />
                    </Box>

                    {newPackage.price && newPackage.discountValue && (
                      <Alert severity="warning" sx={{ mt: 2 }}>
                        <Typography variant="caption" fontWeight="bold" display="block">
                          Discounted Price Preview
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="caption">Original Price:</Typography>
                          <Typography variant="caption" sx={{ textDecoration: 'line-through' }}>
                            ₹{Number(newPackage.price).toLocaleString()}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption">Discount:</Typography>
                          <Typography variant="caption" color="error.main">
                            - ₹{(
                              newPackage.discountType === 'percentage'
                                ? (Number(newPackage.price) * Number(newPackage.discountValue)) / 100
                                : Number(newPackage.discountValue)
                            ).toLocaleString()}
                          </Typography>
                        </Box>
                        <Divider sx={{ my: 0.5 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" fontWeight="bold">Final Price:</Typography>
                          <Typography variant="body2" fontWeight="bold" color="success.main">
                            ₹{(
                              Number(newPackage.price) - (
                                newPackage.discountType === 'percentage'
                                  ? (Number(newPackage.price) * Number(newPackage.discountValue)) / 100
                                  : Number(newPackage.discountValue)
                              )
                            ).toLocaleString()}
                          </Typography>
                        </Box>
                      </Alert>
                    )}
                  </Box>
                )}
              </Card>

              {/* Profit Calculation */}
              {newPackage.price && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  <Typography variant="caption" fontWeight="bold" display="block" gutterBottom>
                    💵 Profit Analysis
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption">Your Cost:</Typography>
                    <Typography variant="caption" fontWeight="bold">
                      ₹{(
                        (newPackage.includeSMS ? Number(newPackage.smsCredits) || 0 : 0) * 0.035 +
                        (newPackage.includeWhatsApp ? Number(newPackage.whatsappCredits) || 0 : 0) * 0.055 +
                        (newPackage.includeEmail ? Number(newPackage.emailCredits) || 0 : 0) * 0.008
                      ).toFixed(2)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption">Selling Price{newPackage.discountEnabled ? ' (After Discount)' : ''}:</Typography>
                    <Typography variant="caption" fontWeight="bold">
                      ₹{(
                        newPackage.discountEnabled && newPackage.discountValue
                          ? Number(newPackage.price) - (
                              newPackage.discountType === 'percentage'
                                ? (Number(newPackage.price) * Number(newPackage.discountValue)) / 100
                                : Number(newPackage.discountValue)
                            )
                          : Number(newPackage.price)
                      ).toLocaleString()}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" fontWeight="bold">Your Profit:</Typography>
                    <Typography variant="body2" fontWeight="bold" color="success.main">
                      ₹{(() => {
                        const cost = (
                          (newPackage.includeSMS ? Number(newPackage.smsCredits) || 0 : 0) * 0.035 +
                          (newPackage.includeWhatsApp ? Number(newPackage.whatsappCredits) || 0 : 0) * 0.055 +
                          (newPackage.includeEmail ? Number(newPackage.emailCredits) || 0 : 0) * 0.008
                        );
                        const finalPrice = newPackage.discountEnabled && newPackage.discountValue
                          ? Number(newPackage.price) - (
                              newPackage.discountType === 'percentage'
                                ? (Number(newPackage.price) * Number(newPackage.discountValue)) / 100
                                : Number(newPackage.discountValue)
                            )
                          : Number(newPackage.price);
                        const profit = finalPrice - cost;
                        const margin = finalPrice > 0 ? (profit / finalPrice) * 100 : 0;
                        return `${profit.toFixed(2)} (${margin.toFixed(1)}% margin)`;
                      })()}
                    </Typography>
                  </Box>
                </Alert>
              )}
            </Box>

            {/* Settings */}
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary">
                ⚙️ Package Settings
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={newPackage.isPopular}
                    onChange={(e) => setNewPackage({ ...newPackage, isPopular: e.target.checked })}
                  />
                }
                label="Mark as 'Most Popular'"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setCreatePackageOpen(false)} variant="outlined">Cancel</Button>
          <Button 
            variant="contained" 
            disabled={!newPackage.name || !newPackage.price || (!newPackage.includeSMS && !newPackage.includeWhatsApp && !newPackage.includeEmail)}
            startIcon={<CheckCircle />}
            onClick={() => {
              console.log('Creating package:', newPackage);
              // TODO: API call to save package
              setCreatePackageOpen(false);
              // Reset form
              setNewPackage({
                name: '',
                description: '',
                includeSMS: false,
                smsCredits: '',
                includeWhatsApp: false,
                whatsappCredits: '',
                includeEmail: false,
                emailCredits: '',
                price: '',
                discountEnabled: false,
                discountType: 'percentage',
                discountValue: '',
                validity: '30',
                isPopular: false,
                features: [],
              });
            }}
          >
            Create Package
          </Button>
        </DialogActions>
      </Dialog>

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              💳 Credit & Messaging Management (Reseller Platform)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Buy credits wholesale from vendors, sell retail to library tenants, track profits
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip 
              label={`${vendors.length} Vendors`} 
              color="primary" 
              icon={<People />}
            />
            <Chip 
              label={`Profit Margin: ${stats.profitMargin}%`} 
              color="success" 
              icon={<TrendingUp />}
            />
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Overview" />
        <Tab label="Buy Credits" icon={<ShoppingCart />} iconPosition="start" />
        <Tab label={`Packages & Pricing (${packages.length})`} icon={<LocalOffer />} iconPosition="start" />
        <Tab label={`Tenant Wallets (${tenantWallets.length})`} />
        <Tab label="Profit Analytics" icon={<TrendingUp />} iconPosition="start" />
      </Tabs>

      {/* Tab Content */}
      {activeTab === 0 && renderOverviewTab()}
      {activeTab === 1 && renderBuyCreditsTab()}
      {activeTab === 2 && renderPackagesPricingTab()}
      {activeTab === 3 && renderTenantWalletsTab()}
      {activeTab === 4 && renderProfitAnalyticsTab()}
    </Box>
  );
};

export default CreditManagement;

