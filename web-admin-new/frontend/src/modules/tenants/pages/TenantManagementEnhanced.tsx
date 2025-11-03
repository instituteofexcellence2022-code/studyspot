// ============================================
// TENANT MANAGEMENT - ENHANCED
// Comprehensive tenant (library owner) management
// PRIMARY FOCUS: Your paying customers (B2B)
// ============================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  TextField,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Avatar,
  Paper,
  Alert,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip as MuiTooltip,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Add,
  FilterList,
  Edit,
  Visibility,
  Search,
  Business,
  TrendingUp,
  TrendingDown,
  AttachMoney,
  People,
  EventSeat,
  Star,
  Refresh,
  Download,
  Send,
  Block,
  CheckCircle,
  Warning,
  LocationOn,
  Phone,
  Email,
  Assessment,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
import { useAppSelector, useAppDispatch } from '../../../hooks/redux';
import { setFilters } from '../../../store/slices/tenantSlice';

const COLORS = ['#E91E63', '#9C27B0', '#2196F3', '#4CAF50', '#FF9800'];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const TenantManagementEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { tenants, filters, loading } = useAppSelector((state) => state.tenant);

  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState('30d');

  // Platform Tenant KPIs
  const tenantKPIs = {
    totalTenants: 161,
    activeTenants: 156,
    trialTenants: 8,
    suspendedTenants: 3,
    newThisMonth: 9,
    churnedThisMonth: 2,
    totalRevenue: 2345000,
    mrr: 845000,
    arr: 10140000,
    avgRevenuePerTenant: 14565,
    retentionRate: 96.2,
    churnRate: 1.2,
  };

  // Tenant Growth
  const tenantGrowth = [
    { month: 'May', tenants: 137, new: 12, churned: 3, mrr: 712 },
    { month: 'Jun', tenants: 146, new: 15, churned: 6, mrr: 756 },
    { month: 'Jul', tenants: 155, new: 14, churned: 5, mrr: 798 },
    { month: 'Aug', tenants: 164, new: 13, churned: 4, mrr: 823 },
    { month: 'Sep', tenants: 173, new: 11, churned: 2, mrr: 838 },
    { month: 'Oct', tenants: 182, new: 9, churned: 2, mrr: 845 },
  ];

  // Plan Distribution
  const planDistribution = [
    { plan: 'Enterprise', count: 16, mrr: 320000, avgLibraries: 3.5 },
    { plan: 'Professional', count: 38, mrr: 380000, avgLibraries: 2.1 },
    { plan: 'Starter', count: 62, mrr: 124000, avgLibraries: 1.2 },
    { plan: 'Free Trial', count: 45, mrr: 0, avgLibraries: 1.0 },
  ];

  // Top Tenants
  const topTenants = [
    { id: 1, name: 'Central Library Network', libraries: 5, students: 1234, revenue: 125000, plan: 'Enterprise', growth: 34, rating: 4.8 },
    { id: 2, name: 'Tech Study Hub', libraries: 4, students: 987, revenue: 98000, plan: 'Enterprise', growth: 28, rating: 4.7 },
    { id: 3, name: 'Knowledge Point', libraries: 3, students: 756, revenue: 76000, plan: 'Professional', growth: 24, rating: 4.6 },
    { id: 4, name: 'Study Network', libraries: 3, students: 654, revenue: 65000, plan: 'Professional', growth: 21, rating: 4.5 },
    { id: 5, name: 'Learn Space Inc', libraries: 2, students: 523, revenue: 52000, plan: 'Professional', growth: 18, rating: 4.4 },
  ];

  // At-Risk Tenants
  const atRiskTenants = [
    { id: 1, name: 'Study Corner', reason: 'Payment overdue 15 days', riskScore: 85, lastActive: '10 days ago', plan: 'Starter' },
    { id: 2, name: 'Quick Learn', reason: 'Low occupancy (35%)', riskScore: 72, lastActive: '3 days ago', plan: 'Professional' },
    { id: 3, name: 'City Library', reason: 'Support tickets unresolved', riskScore: 68, lastActive: '1 day ago', plan: 'Starter' },
  ];

  const getStatusColor = (status: string) => {
    if (status === 'active') return 'success';
    if (status === 'trial') return 'info';
    if (status === 'suspended') return 'error';
    return 'default';
  };

  const getPlanColor = (plan: string) => {
    if (plan === 'Enterprise') return 'secondary';
    if (plan === 'Professional') return 'primary';
    if (plan === 'Starter') return 'info';
    return 'default';
  };

  // DataGrid Columns
  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Tenant Name',
      width: 220,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
            {params.value.charAt(0)}
          </Avatar>
          <Typography variant="body2" fontWeight="bold">
            {params.value}
          </Typography>
        </Stack>
      ),
    },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'phone', headerName: 'Phone', width: 140 },
    {
      field: 'subscriptionPlan',
      headerName: 'Plan',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          color={getPlanColor(params.value as string) as any}
          size="small"
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 110,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value.toUpperCase()}
          color={getStatusColor(params.value as string) as any}
          size="small"
        />
      ),
    },
    {
      field: 'metadata',
      headerName: 'Libraries',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight="bold">
          {params.value?.librariesCount || 1}
        </Typography>
      ),
    },
    {
      field: 'metadata',
      headerName: 'Students',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {params.value?.usersCount || 0}
        </Typography>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Joined',
      width: 120,
      valueGetter: (value) => new Date(value).toLocaleDateString(),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={0.5}>
          <MuiTooltip title="View Details">
            <IconButton size="small" onClick={() => navigate(`/tenants/${params.row.id}`)}>
              <Visibility fontSize="small" />
            </IconButton>
          </MuiTooltip>
          <MuiTooltip title="Edit">
            <IconButton size="small">
              <Edit fontSize="small" />
            </IconButton>
          </MuiTooltip>
        </Stack>
      ),
    },
  ];

  // Tab 1: Overview
  const OverviewTab = () => (
    <Box>
      {/* KPI Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 3,
          mb: 3,
        }}
      >
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Total Tenants
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {tenantKPIs.totalTenants}
                </Typography>
                <Typography variant="caption" color="success.main">
                  +{tenantKPIs.newThisMonth} this month
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <Business />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Monthly Recurring Revenue
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  ₹{(tenantKPIs.mrr / 100000).toFixed(1)}L
                </Typography>
                <Typography variant="caption" color="success.main">
                  ARR: ₹{(tenantKPIs.arr / 10000000).toFixed(2)}Cr
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <AttachMoney />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Retention Rate
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {tenantKPIs.retentionRate}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Churn: {tenantKPIs.churnRate}%
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'info.main' }}>
                <TrendingUp />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Avg Revenue/Tenant
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  ₹{(tenantKPIs.avgRevenuePerTenant / 1000).toFixed(0)}K
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Per month
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'warning.main' }}>
                <Assessment />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* Charts */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mb: 3 }}>
        {/* Tenant Growth */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Tenant Growth & MRR
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={tenantGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="tenants" stroke="#E91E63" strokeWidth={2} name="Total Tenants" />
                <Line yAxisId="right" type="monotone" dataKey="mrr" stroke="#4CAF50" strokeWidth={2} name="MRR (K)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Plan Distribution */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Plan Distribution & MRR
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={planDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="plan" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#2196F3" name="Tenants" />
                <Bar dataKey="mrr" fill="#4CAF50" name="MRR (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Box>

      {/* Top Performers & At-Risk */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
        {/* Top Performers */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Top Performing Tenants
            </Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              {topTenants.map((tenant, index) => (
                <Paper key={tenant.id} sx={{ p: 2, bgcolor: '#F3E5F5' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip label={`#${index + 1}`} size="small" color="primary" />
                        <Typography variant="body2" fontWeight="bold">
                          {tenant.name}
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {tenant.libraries} libraries • {tenant.students} students • {tenant.plan}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h6" fontWeight="bold" color="success.main">
                        ₹{(tenant.revenue / 1000).toFixed(0)}K
                      </Typography>
                      <Typography variant="caption" color="success.main">
                        +{tenant.growth}% growth
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </CardContent>
        </Card>

        {/* At-Risk Tenants */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              At-Risk Tenants (Churn Alert)
            </Typography>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <strong>Proactive Action Needed:</strong> {atRiskTenants.length} tenants at risk of churning
            </Alert>
            <Stack spacing={2}>
              {atRiskTenants.map((tenant) => (
                <Paper key={tenant.id} sx={{ p: 2, bgcolor: '#FFF3E0', borderLeft: '4px solid #FF9800' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {tenant.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {tenant.plan} • Last active: {tenant.lastActive}
                      </Typography>
                      <Typography variant="caption" display="block" color="error.main">
                        ⚠️ {tenant.reason}
                      </Typography>
                    </Box>
                    <Stack spacing={1} alignItems="flex-end">
                      <Chip label={`${tenant.riskScore}% risk`} color="error" size="small" />
                      <Button size="small" variant="outlined" startIcon={<Send />}>
                        Contact
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );

  // Tab 2: All Tenants
  const AllTenantsTab = () => (
    <Box>
      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
            <TextField
              size="small"
              placeholder="Search tenants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <FormControl size="small">
              <InputLabel>Status</InputLabel>
              <Select defaultValue="all" label="Status">
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active ({tenantKPIs.activeTenants})</MenuItem>
                <MenuItem value="trial">Trial ({tenantKPIs.trialTenants})</MenuItem>
                <MenuItem value="suspended">Suspended ({tenantKPIs.suspendedTenants})</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel>Plan</InputLabel>
              <Select defaultValue="all" label="Plan">
                <MenuItem value="all">All Plans</MenuItem>
                <MenuItem value="enterprise">Enterprise (16)</MenuItem>
                <MenuItem value="professional">Professional (38)</MenuItem>
                <MenuItem value="starter">Starter (62)</MenuItem>
                <MenuItem value="free">Free Trial (45)</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel>Sort By</InputLabel>
              <Select defaultValue="recent" label="Sort By">
                <MenuItem value="recent">Most Recent</MenuItem>
                <MenuItem value="revenue">Highest Revenue</MenuItem>
                <MenuItem value="libraries">Most Libraries</MenuItem>
                <MenuItem value="students">Most Students</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {tenants.length} of {tenantKPIs.totalTenants} tenants
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<Refresh />}>
            Refresh
          </Button>
          <Button variant="outlined" startIcon={<Download />}>
            Export
          </Button>
          <Button variant="contained" startIcon={<Add />}>
            Add Tenant
          </Button>
        </Stack>
      </Box>

      {/* DataGrid */}
      <Card>
        <CardContent>
          <Box sx={{ height: 600 }}>
            <DataGrid
              rows={tenants}
              columns={columns}
              loading={loading}
              pageSizeOptions={[10, 25, 50, 100]}
              checkboxSelection
              disableRowSelectionOnClick
              initialState={{
                pagination: { paginationModel: { pageSize: 25 } },
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  // Tab 3: Analytics
  const AnalyticsTab = () => (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Tenant Analytics:</strong> Deep insights into your library customer base for growth optimization
      </Alert>

      {/* Revenue Analysis */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#E8F5E9' }}>
          <Typography variant="h4" fontWeight="bold" color="success.main">
            ₹{(tenantKPIs.mrr / 100000).toFixed(1)}L
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monthly Recurring Revenue
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ARR: ₹{(tenantKPIs.arr / 10000000).toFixed(2)}Cr
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#E3F2FD' }}>
          <Typography variant="h4" fontWeight="bold" color="primary">
            ₹{(tenantKPIs.avgRevenuePerTenant / 1000).toFixed(0)}K
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Avg Revenue per Tenant
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ARPU (Average Revenue Per User)
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#FFF3E0' }}>
          <Typography variant="h4" fontWeight="bold" color="warning.main">
            {tenantKPIs.retentionRate}%
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Retention Rate
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Churn: {tenantKPIs.churnRate}%
          </Typography>
        </Paper>
      </Box>

      {/* Plan Performance Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Plan Performance Analysis
          </Typography>
          <Box sx={{ mt: 2 }}>
            {planDistribution.map((plan, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip label={plan.plan} color={getPlanColor(plan.plan) as any} size="small" />
                    <Typography variant="body2">
                      {plan.count} tenants • {plan.avgLibraries.toFixed(1)} avg libraries
                    </Typography>
                  </Stack>
                  <Typography variant="body2" fontWeight="bold" color="success.main">
                    ₹{(plan.mrr / 1000).toFixed(0)}K MRR
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={(plan.count / tenantKPIs.totalTenants) * 100}
                  sx={{ height: 8, borderRadius: 1 }}
                />
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            🏢 Tenant Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your library customers (B2B) • {tenantKPIs.totalTenants} tenants generating ₹{(tenantKPIs.mrr / 100000).toFixed(1)}L MRR
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Time Range</InputLabel>
            <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} label="Time Range">
              <MenuItem value="7d">Last 7 days</MenuItem>
              <MenuItem value="30d">Last 30 days</MenuItem>
              <MenuItem value="90d">Last 90 days</MenuItem>
              <MenuItem value="1y">Last year</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/tenants/onboarding')}>
            Add Tenant
          </Button>
        </Stack>
      </Box>

      {/* At-Risk Alert */}
      {atRiskTenants.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2">
              <strong>⚠️ {atRiskTenants.length} tenants</strong> are at high risk of churning. Immediate action recommended!
            </Typography>
            <Button size="small" variant="outlined" color="error">
              View Details
            </Button>
          </Stack>
        </Alert>
      )}

      {/* Tabs */}
      <Card>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab label="Overview" icon={<Assessment />} iconPosition="start" />
          <Tab label="All Tenants" icon={<Business />} iconPosition="start" />
          <Tab label="Analytics" icon={<TrendingUp />} iconPosition="start" />
        </Tabs>

        <CardContent sx={{ p: 3 }}>
          <TabPanel value={activeTab} index={0}>
            <OverviewTab />
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            <AllTenantsTab />
          </TabPanel>
          <TabPanel value={activeTab} index={2}>
            <AnalyticsTab />
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TenantManagementEnhanced;

