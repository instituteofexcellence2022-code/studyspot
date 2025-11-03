// ============================================
// PAYMENT MANAGEMENT - ENHANCED VERSION
// Comprehensive payment processing with automation & dual verification
// ============================================

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
  Chip,
  Stack,
  Alert,
  Divider,
  Avatar,
  LinearProgress,
  Badge,
  IconButton,
  Tooltip,
  Paper,
  Switch,
  FormControlLabel,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Payment,
  AccountBalance,
  TrendingUp,
  CheckCircle,
  HourglassEmpty,
  Error as ErrorIcon,
  Visibility,
  Edit,
  Settings,
  Refresh,
  Download,
  Send,
  VerifiedUser,
  Security,
  PlayArrow,
  Pause,
  Schedule,
  NotificationsActive,
  Receipt,
  SwapHoriz,
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
} from 'recharts';

const PaymentManagementEnhanced: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [automationEnabled, setAutomationEnabled] = useState(true);
  const [dualCheckEnabled, setDualCheckEnabled] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState('today');

  // Mock Payment Data with detailed information
  const payments = [
    {
      id: 1,
      txnId: 'PAY001234',
      date: '2025-10-31 14:30',
      library: 'Central Library',
      student: 'Rahul Sharma',
      studentId: 'STU001',
      amount: 3000,
      gatewayFee: 59.40,
      gst: 10.69,
      platformFee: 150,
      netAmount: 2790.60,
      gateway: 'Razorpay',
      method: 'UPI',
      upiId: 'rahul@paytm',
      status: 'Success',
      verificationStatus: 'Pending',
      autoProcessed: true,
      settlementDate: '2025-11-01',
      bankAccount: 'HDFC ****1234',
    },
    {
      id: 2,
      txnId: 'PAY001235',
      date: '2025-10-31 13:45',
      library: 'Tech Library',
      student: 'Priya Patel',
      studentId: 'STU002',
      amount: 5000,
      gatewayFee: 99,
      gst: 17.82,
      platformFee: 250,
      netAmount: 4651,
      gateway: 'Razorpay',
      method: 'Card',
      cardLast4: '4532',
      status: 'Success',
      verificationStatus: 'Verified',
      autoProcessed: true,
      settlementDate: '2025-11-01',
      bankAccount: 'ICICI ****5678',
      verifiedBy: 'Admin',
      verifiedAt: '2025-10-31 14:00',
    },
    {
      id: 3,
      txnId: 'PAY001236',
      date: '2025-10-31 12:20',
      library: 'Knowledge Hub',
      student: 'Amit Kumar',
      studentId: 'STU003',
      amount: 7500,
      gatewayFee: 148.50,
      gst: 26.73,
      platformFee: 375,
      netAmount: 6976.50,
      gateway: 'Stripe',
      method: 'Net Banking',
      bank: 'SBI',
      status: 'Success',
      verificationStatus: 'Flagged',
      autoProcessed: false,
      requiresManualReview: true,
      flagReason: 'Amount exceeds threshold',
      bankAccount: 'SBI ****9012',
    },
  ];

  // Settlement batches with dual verification
  const settlementBatches = [
    {
      id: 'BTH001',
      date: '2025-10-31',
      libraries: 5,
      transactions: 23,
      totalAmount: 115000,
      platformFees: 5750,
      gatewayFees: 2277,
      netSettlement: 106973,
      status: 'Pending Verification',
      createdBy: 'System',
      createdAt: '2025-10-31 15:00',
      verifier1: null,
      verifier2: null,
      scheduledFor: '2025-11-01 09:00',
    },
    {
      id: 'BTH002',
      date: '2025-10-30',
      libraries: 8,
      transactions: 45,
      totalAmount: 225000,
      platformFees: 11250,
      gatewayFees: 4455,
      netSettlement: 209295,
      status: 'Verified - Ready',
      createdBy: 'System',
      createdAt: '2025-10-30 18:00',
      verifier1: 'Admin 1',
      verifier1At: '2025-10-30 19:30',
      verifier2: 'Admin 2',
      verifier2At: '2025-10-30 20:00',
      scheduledFor: '2025-10-31 09:00',
    },
    {
      id: 'BTH003',
      date: '2025-10-29',
      libraries: 6,
      transactions: 34,
      totalAmount: 170000,
      platformFees: 8500,
      gatewayFees: 3366,
      netSettlement: 158134,
      status: 'Processing',
      createdBy: 'System',
      createdAt: '2025-10-29 18:00',
      verifier1: 'Admin 1',
      verifier1At: '2025-10-29 19:00',
      verifier2: 'Admin 2',
      verifier2At: '2025-10-29 19:30',
      scheduledFor: '2025-10-30 09:00',
      processedAt: '2025-10-30 09:05',
    },
  ];

  // Automation rules
  const automationRules = [
    {
      id: 1,
      name: 'Standard Transactions',
      condition: 'Amount ≤ ₹5,000',
      action: 'Auto-approve with single verification',
      enabled: true,
      priority: 1,
    },
    {
      id: 2,
      name: 'High Value Transactions',
      condition: 'Amount > ₹5,000',
      action: 'Dual verification required',
      enabled: true,
      priority: 2,
    },
    {
      id: 3,
      name: 'Failed Transactions',
      condition: 'Status = Failed',
      action: 'Flag for manual review',
      enabled: true,
      priority: 3,
    },
  ];

  const COLORS = ['#E91E63', '#9C27B0', '#2196F3', '#4CAF50', '#FF9800'];

  // Stats
  const stats = {
    todayTransactions: 23,
    todayAmount: 115000,
    pendingVerification: 8,
    readyForSettlement: 15,
    successRate: 94.5,
    avgSettlementTime: '2.3 hours',
  };

  // Chart data
  const hourlyData = [
    { hour: '9 AM', transactions: 2, amount: 8000 },
    { hour: '10 AM', transactions: 5, amount: 15000 },
    { hour: '11 AM', transactions: 8, amount: 24000 },
    { hour: '12 PM', transactions: 12, amount: 36000 },
    { hour: '1 PM', transactions: 6, amount: 18000 },
    { hour: '2 PM', transactions: 4, amount: 12000 },
    { hour: '3 PM', transactions: 3, amount: 9000 },
  ];

  const statusDistribution = [
    { name: 'Verified', value: 65, count: 15 },
    { name: 'Pending', value: 25, count: 6 },
    { name: 'Flagged', value: 10, count: 2 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success': return 'success';
      case 'Pending': return 'warning';
      case 'Failed': return 'error';
      default: return 'default';
    }
  };

  const getVerificationColor = (status: string) => {
    switch (status) {
      case 'Verified': return 'success';
      case 'Pending': return 'warning';
      case 'Flagged': return 'error';
      default: return 'default';
    }
  };

  // Handlers
  const handleViewDetails = (payment: any) => {
    setSelectedTransaction(payment);
    setDetailsDialogOpen(true);
  };

  const handleVerify = (payment: any) => {
    setSelectedTransaction(payment);
    setVerifyDialogOpen(true);
  };

  const handleVerifyConfirm = () => {
    alert(`Transaction ${selectedTransaction.txnId} verified successfully!`);
    setVerifyDialogOpen(false);
  };

  // Payment Columns
  const paymentColumns: GridColDef[] = [
    {
      field: 'verificationStatus',
      headerName: 'Status',
      width: 140,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Chip
            label={params.value}
            color={getVerificationColor(params.value) as any}
            size="small"
            icon={
              params.value === 'Verified' ? <VerifiedUser /> :
              params.value === 'Flagged' ? <ErrorIcon /> :
              <HourglassEmpty />
            }
          />
        </Stack>
      ),
    },
    { field: 'txnId', headerName: 'Transaction ID', width: 130 },
    {
      field: 'date',
      headerName: 'Date & Time',
      width: 150,
    },
    {
      field: 'library',
      headerName: 'Library',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main', fontSize: 12 }}>
            {params.value.charAt(0)}
          </Avatar>
          <Typography variant="body2">{params.value}</Typography>
        </Stack>
      ),
    },
    { field: 'student', headerName: 'Student', width: 140 },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 110,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight="bold">
          ₹{params.value.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: 'platformFee',
      headerName: 'Platform Fee',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" color="primary">
          ₹{params.value.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: 'netAmount',
      headerName: 'Net to Library',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight="bold" color="success.main">
          ₹{params.value.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: 'method',
      headerName: 'Method',
      width: 100,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View Details">
            <IconButton size="small" onClick={() => handleViewDetails(params.row)}>
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          {params.row.verificationStatus === 'Pending' && (
            <Tooltip title="Verify">
              <IconButton size="small" color="success" onClick={() => handleVerify(params.row)}>
                <CheckCircle fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      ),
    },
  ];

  // Settlement Batch Columns
  const batchColumns: GridColDef[] = [
    { field: 'id', headerName: 'Batch ID', width: 110 },
    { field: 'date', headerName: 'Date', width: 110 },
    {
      field: 'status',
      headerName: 'Status',
      width: 180,
      renderCell: (params: GridRenderCellParams) => {
        const status = params.value as string;
        let color: any = 'default';
        let icon = <HourglassEmpty />;
        
        if (status.includes('Verified')) {
          color = 'success';
          icon = <CheckCircle />;
        } else if (status.includes('Processing')) {
          color = 'info';
          icon = <SwapHoriz />;
        } else if (status.includes('Pending')) {
          color = 'warning';
          icon = <Schedule />;
        }
        
        return <Chip label={status} color={color} size="small" icon={icon} />;
      },
    },
    { field: 'libraries', headerName: 'Libraries', width: 100 },
    { field: 'transactions', headerName: 'Txns', width: 80 },
    {
      field: 'totalAmount',
      headerName: 'Total',
      width: 120,
      renderCell: (params: GridRenderCellParams) => `₹${(params.value / 100000).toFixed(2)}L`,
    },
    {
      field: 'netSettlement',
      headerName: 'Net Settlement',
      width: 140,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight="bold" color="success.main">
          ₹{(params.value / 100000).toFixed(2)}L
        </Typography>
      ),
    },
    {
      field: 'verification',
      headerName: 'Verification',
      width: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={0.5} alignItems="center">
          {params.row.verifier1 && (
            <Tooltip title={`Verified by ${params.row.verifier1}`}>
              <Chip label="V1" size="small" color="success" />
            </Tooltip>
          )}
          {params.row.verifier2 && (
            <Tooltip title={`Verified by ${params.row.verifier2}`}>
              <Chip label="V2" size="small" color="success" />
            </Tooltip>
          )}
          {!params.row.verifier1 && !params.row.verifier2 && (
            <Chip label="Pending" size="small" color="warning" />
          )}
        </Stack>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={0.5}>
          {params.row.status.includes('Pending') && (
            <Button size="small" variant="contained" color="primary">
              Verify
            </Button>
          )}
          {params.row.status.includes('Ready') && (
            <Button size="small" variant="contained" color="success" startIcon={<Send />}>
              Process
            </Button>
          )}
        </Stack>
      ),
    },
  ];

  // Tab 1: Live Transactions
  const renderLiveTab = () => (
    <Box>
      {/* Automation Status Bar */}
      <Card sx={{ mb: 3, bgcolor: automationEnabled ? 'success.light' : 'warning.light' }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: automationEnabled ? 'success.main' : 'warning.main' }}>
                {automationEnabled ? <PlayArrow /> : <Pause />}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Automation Status: {automationEnabled ? 'Active' : 'Paused'}
                </Typography>
                <Typography variant="body2">
                  {automationEnabled 
                    ? `${dualCheckEnabled ? 'Dual verification' : 'Single verification'} enabled • Auto-processing in progress`
                    : 'All transactions require manual approval'}
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={automationEnabled}
                    onChange={(e) => setAutomationEnabled(e.target.checked)}
                  />
                }
                label="Automation"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={dualCheckEnabled}
                    onChange={(e) => setDualCheckEnabled(e.target.checked)}
                    disabled={!automationEnabled}
                  />
                }
                label="Dual Check"
              />
              <Button
                variant="outlined"
                startIcon={<Settings />}
                onClick={() => setSettingsDialogOpen(true)}
              >
                Configure
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="caption" color="text.secondary">Today's Transactions</Typography>
                <Typography variant="h4" fontWeight="bold">{stats.todayTransactions}</Typography>
                <Typography variant="caption" color="success.main">₹{(stats.todayAmount / 1000).toFixed(0)}K</Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <Receipt />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="caption" color="text.secondary">Pending Verification</Typography>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {stats.pendingVerification}
                </Typography>
                <Typography variant="caption" color="text.secondary">Needs attention</Typography>
              </Box>
              <Badge badgeContent={stats.pendingVerification} color="warning">
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <HourglassEmpty />
                </Avatar>
              </Badge>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="caption" color="text.secondary">Ready for Settlement</Typography>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {stats.readyForSettlement}
                </Typography>
                <Typography variant="caption" color="text.secondary">Verified & ready</Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <CheckCircle />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="caption" color="text.secondary">Success Rate</Typography>
                <Typography variant="h4" fontWeight="bold">{stats.successRate}%</Typography>
                <Typography variant="caption" color="success.main">+1.5% vs yesterday</Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'info.main' }}>
                <TrendingUp />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Time Period</InputLabel>
              <Select value={dateFilter} label="Time Period" onChange={(e) => setDateFilter(e.target.value)}>
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="yesterday">Yesterday</MenuItem>
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select defaultValue="all" label="Status">
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="verified">Verified</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="flagged">Flagged</MenuItem>
              </Select>
            </FormControl>
            <Button variant="outlined" startIcon={<Refresh />}>
              Refresh
            </Button>
            <Button variant="outlined" startIcon={<Download />}>
              Export
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Transactions DataGrid */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Live Transactions
          </Typography>
          <Box sx={{ height: 500 }}>
            <DataGrid
              rows={payments}
              columns={paymentColumns}
              pageSizeOptions={[10, 25, 50]}
              disableRowSelectionOnClick
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  // Tab 2: Settlement Batches
  const renderBatchesTab = () => (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Dual Verification:</strong> All settlement batches require two independent verifications before processing.
        Current mode: {dualCheckEnabled ? 'Active' : 'Disabled'}
      </Alert>

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Settlement Batches
          </Typography>
          <Box sx={{ height: 500 }}>
            <DataGrid
              rows={settlementBatches}
              columns={batchColumns}
              pageSizeOptions={[10, 25]}
              disableRowSelectionOnClick
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  // Tab 3: Analytics
  const renderAnalyticsTab = () => (
    <Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3, mb: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Hourly Transaction Flow
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E91E63" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#E91E63" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#E91E63"
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                  name="Amount (₹)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Verification Status
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Payment Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Automated payment processing with dual verification system
        </Typography>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab label="Live Transactions" icon={<Payment />} iconPosition="start" />
          <Tab label="Settlement Batches" icon={<AccountBalance />} iconPosition="start" />
          <Tab label="Analytics" icon={<TrendingUp />} iconPosition="start" />
        </Tabs>

        <CardContent sx={{ p: 3 }}>
          {activeTab === 0 && renderLiveTab()}
          {activeTab === 1 && renderBatchesTab()}
          {activeTab === 2 && renderAnalyticsTab()}
        </CardContent>
      </Card>

      {/* Transaction Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Transaction Details - {selectedTransaction?.txnId}</DialogTitle>
        <DialogContent>
          {selectedTransaction && (
            <Box sx={{ mt: 2 }}>
              <Stepper activeStep={2} orientation="vertical">
                <Step completed>
                  <StepLabel>Payment Initiated</StepLabel>
                  <StepContent>
                    <Typography variant="body2">
                      Student: {selectedTransaction.student} ({selectedTransaction.studentId})
                    </Typography>
                    <Typography variant="body2">Amount: ₹{selectedTransaction.amount.toLocaleString()}</Typography>
                    <Typography variant="body2">Method: {selectedTransaction.method}</Typography>
                  </StepContent>
                </Step>
                <Step completed>
                  <StepLabel>Gateway Processing</StepLabel>
                  <StepContent>
                    <Typography variant="body2">Gateway: {selectedTransaction.gateway}</Typography>
                    <Typography variant="body2">Gateway Fee: ₹{selectedTransaction.gatewayFee}</Typography>
                    <Typography variant="body2">GST: ₹{selectedTransaction.gst}</Typography>
                  </StepContent>
                </Step>
                <Step active>
                  <StepLabel>Verification</StepLabel>
                  <StepContent>
                    <Typography variant="body2">Status: {selectedTransaction.verificationStatus}</Typography>
                    <Typography variant="body2">Platform Fee: ₹{selectedTransaction.platformFee}</Typography>
                    <Typography variant="body2">Net to Library: ₹{selectedTransaction.netAmount.toLocaleString()}</Typography>
                  </StepContent>
                </Step>
                <Step>
                  <StepLabel>Settlement</StepLabel>
                  <StepContent>
                    <Typography variant="body2">Scheduled: {selectedTransaction.settlementDate}</Typography>
                    <Typography variant="body2">Bank: {selectedTransaction.bankAccount}</Typography>
                  </StepContent>
                </Step>
              </Stepper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Verification Dialog */}
      <Dialog open={verifyDialogOpen} onClose={() => setVerifyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Verify Transaction</DialogTitle>
        <DialogContent>
          {selectedTransaction && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="warning" sx={{ mb: 3 }}>
                Please verify all details before approving this transaction
              </Alert>
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Transaction ID</Typography>
                  <Typography variant="body1" fontWeight="bold">{selectedTransaction.txnId}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Student</Typography>
                  <Typography variant="body1">{selectedTransaction.student}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Amount</Typography>
                  <Typography variant="h5" fontWeight="bold">₹{selectedTransaction.amount.toLocaleString()}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Net to Library</Typography>
                  <Typography variant="h6" color="success.main">₹{selectedTransaction.netAmount.toLocaleString()}</Typography>
                </Box>
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerifyDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handleVerifyConfirm} startIcon={<VerifiedUser />}>
            Verify & Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsDialogOpen} onClose={() => setSettingsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Automation Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Automation Rules</Typography>
            {automationRules.map((rule) => (
              <Paper key={rule.id} sx={{ p: 2, mb: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">{rule.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Condition: {rule.condition} → {rule.action}
                    </Typography>
                  </Box>
                  <Switch checked={rule.enabled} />
                </Stack>
              </Paper>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentManagementEnhanced;

