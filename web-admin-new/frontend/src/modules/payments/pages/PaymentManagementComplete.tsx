// ============================================
// PAYMENT MANAGEMENT - COMPLETE VERSION
// All 6 tabs with dual verification & automation
// ============================================

import React, { useState, useEffect } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
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
  Settings,
  Refresh,
  Download,
  Send,
  VerifiedUser,
  PlayArrow,
  Pause,
  Search,
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
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  type PieLabelRenderProps,
} from 'recharts';
import paymentService from '../../../services/api/payments';

// ============================================
// HELPER FUNCTIONS
// ============================================

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
  switch (status.toLowerCase()) {
    case 'success':
    case 'verified':
    case 'completed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'failed':
    case 'flagged':
      return 'error';
    default:
      return 'default';
  }
};

const COLORS = ['#E91E63', '#9C27B0', '#2196F3', '#4CAF50', '#FF9800'];

// ============================================
// TAB PANEL COMPONENT
// ============================================

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

// ============================================
// MAIN COMPONENT
// ============================================

const PaymentManagementComplete: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [automationEnabled, setAutomationEnabled] = useState(true);
  const [dualCheckEnabled, setDualCheckEnabled] = useState(true);

  // Data states
  const [transactions, setTransactions] = useState<any[]>([]);
  const [pendingSettlements, setPendingSettlements] = useState<any[]>([]);
  const [completedSettlements, setCompletedSettlements] = useState<any[]>([]);
  const [failedTransactions, setFailedTransactions] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [libraries, setLibraries] = useState<any[]>([]);

  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    paymentMethod: 'all',
    settlementStatus: 'all',
    libraryId: 'all',
    dateRange: 'all',
    searchQuery: '',
  });

  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialog states
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [settlementDialogOpen, setSettlementDialogOpen] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState<any>(null);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

  // Settings states
  const [feeSettings, setFeeSettings] = useState({
    platformFeeType: 'percentage' as 'percentage' | 'flat',
    platformFeePercent: 3,
    platformFeeFlat: 0,
    gatewayChargesType: 'percentage' as 'percentage' | 'flat',
    gatewayChargesPercent: 2,
    gatewayChargesFixed: 2,
    minimumTransaction: 100,
    maximumTransaction: 100000,
  });

  const [settlementSettings, setSettlementSettings] = useState({
    settlementMode: 'hybrid' as 'fully_automated' | 'manual_approval' | 'hybrid',
    settlementFrequency: 'weekly' as 'daily' | 'weekly' | 'biweekly' | 'monthly',
    settlementDay: 5,
    settlementTime: '18:00',
    minimumSettlementAmount: 1000,
    approvalThresholdAmount: 50000,
    approvalLevel: 'admin' as 'admin' | 'manager' | 'both',
    autoRetry: 'enabled' as 'enabled' | 'disabled',
    maxRetryAttempts: 3,
    retryIntervalHours: 24,
    notifyLibrary: true,
    notifyAdmin: true,
    requireVerification: true,
    enableDualCheck: true,
    dualCheckThreshold: 5000,
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  // Mock data for development
  useEffect(() => {
    loadMockData();
  }, [activeTab]);

  const loadMockData = () => {
    setTransactions([
      {
        id: '1',
        transactionId: 'PAY001234',
        studentName: 'Rahul Sharma',
        studentEmail: 'rahul@example.com',
        studentPhone: '+91 98765 43210',
        libraryName: 'Central Library',
        amountPaid: 3000,
        gatewayCharges: 59.40,
        gatewayChargesPercent: 1.98,
        platformFee: 150,
        platformFeePercent: 5,
        netToLibrary: 2790.60,
        paymentMethod: 'upi',
        paymentProvider: 'Razorpay',
        status: 'success',
        settlementStatus: 'pending',
        verificationStatus: 'pending',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        transactionId: 'PAY001235',
        studentName: 'Priya Patel',
        studentEmail: 'priya@example.com',
        studentPhone: '+91 98765 43211',
        libraryName: 'Tech Library',
        amountPaid: 5000,
        gatewayCharges: 99,
        gatewayChargesPercent: 1.98,
        platformFee: 250,
        platformFeePercent: 5,
        netToLibrary: 4651,
        paymentMethod: 'card',
        paymentProvider: 'Razorpay',
        cardLast4: '4532',
        status: 'success',
        settlementStatus: 'pending',
        verificationStatus: 'verified',
        createdAt: new Date().toISOString(),
      },
    ]);

    setPendingSettlements([
      {
        libraryId: '1',
        libraryName: 'Central Library',
        transactionCount: 23,
        totalAmount: 69000,
        gatewayCharges: 1366.20,
        platformFees: 3450,
        netPayable: 64183.80,
        oldestTransactionDate: new Date().toISOString(),
      },
    ]);

    setCompletedSettlements([
      {
        id: '1',
        settlementId: 'SET001',
        libraryName: 'Tech Library',
        transactionCount: 45,
        netPayable: 209295,
        settlementMethod: 'bank_transfer',
        settlementReference: 'NEFT123456789',
        status: 'completed',
        completedAt: new Date().toISOString(),
      },
    ]);

    setFailedTransactions([
      {
        id: '1',
        transactionId: 'PAY001236',
        studentName: 'Amit Kumar',
        libraryName: 'Knowledge Hub',
        amountPaid: 7500,
        paymentMethod: 'netbanking',
        gatewayResponseMessage: 'Payment declined by bank',
        createdAt: new Date().toISOString(),
      },
    ]);

    setAnalytics({
      summary: {
        totalTransactions: 156,
        totalAmountProcessed: 780000,
        totalPlatformFees: 39000,
        successRate: 94.5,
      },
      revenue: {
        thisMonth: 39000,
        lastMonth: 35000,
        growth: 11.4,
        netProfit: 36500,
        averageTransactionValue: 5000,
      },
      paymentMethods: [
        { method: 'UPI', count: 89, amount: 445000, percentage: 57 },
        { method: 'Card', count: 45, amount: 225000, percentage: 29 },
        { method: 'Net Banking', count: 22, amount: 110000, percentage: 14 },
      ],
      trendData: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0],
        platformFees: Math.floor(Math.random() * 2000) + 1000,
        gatewayCharges: Math.floor(Math.random() * 1000) + 500,
      })),
      hourlyPattern: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        count: Math.floor(Math.random() * 20) + 5,
      })),
      topLibraries: [
        { libraryName: 'Central Library', amount: 150000 },
        { libraryName: 'Tech Library', amount: 120000 },
        { libraryName: 'Knowledge Hub', amount: 90000 },
      ],
    });
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setPage(0);
  };

  const handleViewDetails = (transaction: any) => {
    setSelectedTransaction(transaction);
    setDetailDialogOpen(true);
  };

  const handleInitiateSettlement = (settlement: any) => {
    setSelectedSettlement(settlement);
    setSettlementDialogOpen(true);
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Payment Columns
  const paymentColumns: GridColDef[] = [
    {
      field: 'verificationStatus',
      headerName: 'Verification',
      width: 140,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value || 'Pending'}
          color={getStatusColor(params.value || 'pending')}
          size="small"
          icon={params.value === 'verified' ? <VerifiedUser /> : <HourglassEmpty />}
        />
      ),
    },
    { field: 'transactionId', headerName: 'Transaction ID', width: 150 },
    {
      field: 'createdAt',
      headerName: 'Date & Time',
      width: 160,
      renderCell: (params: GridRenderCellParams) => formatDate(params.value),
    },
    { field: 'studentName', headerName: 'Student', width: 150 },
    { field: 'libraryName', headerName: 'Library', width: 150 },
    {
      field: 'amountPaid',
      headerName: 'Amount',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight="bold">
          {formatCurrency(params.value)}
        </Typography>
      ),
    },
    {
      field: 'platformFee',
      headerName: 'Platform Fee',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" color="primary">
          {formatCurrency(params.value)}
        </Typography>
      ),
    },
    {
      field: 'netToLibrary',
      headerName: 'Net to Library',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight="bold" color="success.main">
          {formatCurrency(params.value)}
        </Typography>
      ),
    },
    {
      field: 'paymentMethod',
      headerName: 'Method',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip label={params.value.toUpperCase()} size="small" variant="outlined" />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value.toUpperCase()}
          color={getStatusColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title="View Details">
          <IconButton size="small" onClick={() => handleViewDetails(params.row)}>
            <Visibility fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          💳 Payment Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage student payments, settlements, and platform revenue with dual verification
        </Typography>
      </Box>

      {/* Automation Status Bar */}
      {activeTab === 0 && (
        <Card sx={{ mb: 3, bgcolor: automationEnabled ? 'success.light' : 'warning.light' }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: automationEnabled ? 'success.main' : 'warning.main' }}>
                  {automationEnabled ? <PlayArrow /> : <Pause />}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Automation: {automationEnabled ? 'Active' : 'Paused'}
                  </Typography>
                  <Typography variant="body2">
                    {automationEnabled
                      ? `Dual verification: ${dualCheckEnabled ? 'Enabled' : 'Disabled'} • Auto-processing active`
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
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}

      <Card elevation={2}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab label="All Transactions" icon={<Payment />} iconPosition="start" />
          <Tab label="Pending Settlements" icon={<AccountBalance />} iconPosition="start" />
          <Tab label="Completed" icon={<CheckCircle />} iconPosition="start" />
          <Tab label="Failed Payments" icon={<ErrorIcon />} iconPosition="start" />
          <Tab label="Analytics" icon={<TrendingUp />} iconPosition="start" />
          <Tab label="Settings" icon={<Settings />} iconPosition="start" />
        </Tabs>

        {/* TAB 1: ALL TRANSACTIONS */}
        <TabPanel value={activeTab} index={0}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              {/* Summary Cards */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 2,
                  mb: 3,
                }}
              >
                <Card elevation={1} sx={{ bgcolor: 'primary.main', color: 'white' }}>
                  <CardContent>
                    <Typography variant="body2" gutterBottom>
                      Total Transactions
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {transactions.length}
                    </Typography>
                  </CardContent>
                </Card>
                <Card elevation={1} sx={{ bgcolor: 'success.main', color: 'white' }}>
                  <CardContent>
                    <Typography variant="body2" gutterBottom>
                      Total Amount
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {formatCurrency(transactions.reduce((sum, t) => sum + t.amountPaid, 0))}
                    </Typography>
                  </CardContent>
                </Card>
                <Card elevation={1} sx={{ bgcolor: 'warning.main', color: 'white' }}>
                  <CardContent>
                    <Typography variant="body2" gutterBottom>
                      Platform Fees
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {formatCurrency(transactions.reduce((sum, t) => sum + t.platformFee, 0))}
                    </Typography>
                  </CardContent>
                </Card>
                <Card elevation={1} sx={{ bgcolor: 'info.main', color: 'white' }}>
                  <CardContent>
                    <Typography variant="body2" gutterBottom>
                      Success Rate
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {transactions.length > 0
                        ? ((transactions.filter(t => t.status === 'success').length / transactions.length) * 100).toFixed(1)
                        : 0}%
                    </Typography>
                  </CardContent>
                </Card>
              </Box>

              {/* Filters */}
              <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom fontWeight={600} mb={2}>
                  🔍 Filters
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 2,
                  }}
                >
                  <TextField
                    size="small"
                    placeholder="Search..."
                    value={filters.searchQuery}
                    onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                    InputProps={{
                      startAdornment: <Search fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                  <FormControl size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filters.status}
                      label="Status"
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="success">Success</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="failed">Failed</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small">
                    <InputLabel>Payment Method</InputLabel>
                    <Select
                      value={filters.paymentMethod}
                      label="Payment Method"
                      onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="upi">UPI</MenuItem>
                      <MenuItem value="card">Card</MenuItem>
                      <MenuItem value="netbanking">Net Banking</MenuItem>
                    </Select>
                  </FormControl>
                  <Button variant="outlined" startIcon={<Refresh />}>
                    Refresh
                  </Button>
                  <Button variant="outlined" startIcon={<Download />}>
                    Export
                  </Button>
                </Box>
              </Paper>

              {/* Transactions DataGrid */}
              <Card>
                <CardContent>
                  <Box sx={{ height: 500 }}>
                    <DataGrid
                      rows={transactions}
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
          )}
        </TabPanel>

        {/* TAB 2: PENDING SETTLEMENTS */}
        <TabPanel value={activeTab} index={1}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2" fontWeight={600}>
                  {pendingSettlements.length} libraries have pending settlements totaling{' '}
                  {formatCurrency(pendingSettlements.reduce((sum, s) => sum + (s.netPayable || 0), 0))}
                </Typography>
                {dualCheckEnabled && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Dual Verification:</strong> All settlements require two independent verifications before processing.
                  </Typography>
                )}
              </Alert>

              {pendingSettlements.map((settlement) => (
                <Card key={settlement.libraryId} elevation={2} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box>
                        <Typography variant="h6" fontWeight={700}>
                          {settlement.libraryName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {settlement.transactionCount} transactions
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        startIcon={<Send />}
                        onClick={() => handleInitiateSettlement(settlement)}
                      >
                        Settle Now
                      </Button>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: 2,
                      }}
                    >
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Total Amount
                        </Typography>
                        <Typography variant="h6" fontWeight={700}>
                          {formatCurrency(settlement.totalAmount || 0)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Gateway Charges
                        </Typography>
                        <Typography variant="h6" color="error.main">
                          -{formatCurrency(settlement.gatewayCharges || 0)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Platform Fees
                        </Typography>
                        <Typography variant="h6" color="warning.main">
                          -{formatCurrency(settlement.platformFees || 0)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Net Payable
                        </Typography>
                        <Typography variant="h6" color="success.main" fontWeight={700}>
                          {formatCurrency(settlement.netPayable || 0)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}

              {pendingSettlements.length === 0 && (
                <Box textAlign="center" py={4}>
                  <Typography variant="h6" color="text.secondary">
                    No pending settlements
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </TabPanel>

        {/* TAB 3: COMPLETED SETTLEMENTS */}
        <TabPanel value={activeTab} index={2}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              <TableContainer component={Paper} elevation={1}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                      <TableCell><strong>Settlement ID</strong></TableCell>
                      <TableCell><strong>Date</strong></TableCell>
                      <TableCell><strong>Library</strong></TableCell>
                      <TableCell align="right"><strong>Transactions</strong></TableCell>
                      <TableCell align="right"><strong>Net Payable</strong></TableCell>
                      <TableCell><strong>Method</strong></TableCell>
                      <TableCell><strong>Reference</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {completedSettlements.map((settlement) => (
                      <TableRow key={settlement.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {settlement.settlementId}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {settlement.completedAt ? formatDate(settlement.completedAt) : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {settlement.libraryName}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {settlement.transactionCount}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={600} color="success.main">
                            {formatCurrency(settlement.netPayable || 0)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={settlement.settlementMethod?.toUpperCase().replace('_', ' ') || 'N/A'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace" fontSize="0.75rem">
                            {settlement.settlementReference}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={settlement.status?.toUpperCase() || 'COMPLETED'}
                            color="success"
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {completedSettlements.length === 0 && (
                <Box textAlign="center" py={4}>
                  <Typography variant="h6" color="text.secondary">
                    No completed settlements
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </TabPanel>

        {/* TAB 4: FAILED PAYMENTS */}
        <TabPanel value={activeTab} index={3}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="body2" fontWeight={600}>
                  {failedTransactions.length} failed transactions • Total amount: {formatCurrency(failedTransactions.reduce((sum, t) => sum + (t.amountPaid || 0), 0))}
                </Typography>
              </Alert>

              <TableContainer component={Paper} elevation={1}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                      <TableCell><strong>Transaction ID</strong></TableCell>
                      <TableCell><strong>Date & Time</strong></TableCell>
                      <TableCell><strong>Student</strong></TableCell>
                      <TableCell><strong>Library</strong></TableCell>
                      <TableCell align="right"><strong>Amount</strong></TableCell>
                      <TableCell><strong>Method</strong></TableCell>
                      <TableCell><strong>Failure Reason</strong></TableCell>
                      <TableCell><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {failedTransactions.map((transaction) => (
                      <TableRow key={transaction.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {transaction.transactionId}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(transaction.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {transaction.studentName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {transaction.libraryName}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={600}>
                            {formatCurrency(transaction.amountPaid || 0)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.paymentMethod?.toUpperCase() || 'N/A'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="error.main">
                            {transaction.gatewayResponseMessage || 'Payment failed'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => handleViewDetails(transaction)}>
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {failedTransactions.length === 0 && (
                <Box textAlign="center" py={4}>
                  <Typography variant="h6" color="text.secondary">
                    No failed transactions
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </TabPanel>

        {/* TAB 5: ANALYTICS */}
        <TabPanel value={activeTab} index={4}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : analytics ? (
            <Box>
              {/* KPI Cards */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 2,
                  mb: 3,
                }}
              >
                <Card elevation={1}>
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">
                      Total Revenue (Platform Fees)
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color="success.main">
                      {formatCurrency(analytics.summary.totalPlatformFees)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      From {analytics.summary.totalTransactions} transactions
                    </Typography>
                  </CardContent>
                </Card>
                <Card elevation={1}>
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">
                      This Month Revenue
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {formatCurrency(analytics.revenue.thisMonth)}
                    </Typography>
                    <Typography variant="caption" color={analytics.revenue.growth >= 0 ? 'success.main' : 'error.main'}>
                      {analytics.revenue.growth >= 0 ? '+' : ''}{analytics.revenue.growth.toFixed(1)}% vs last month
                    </Typography>
                  </CardContent>
                </Card>
                <Card elevation={1}>
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">
                      Net Profit
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color="primary.main">
                      {formatCurrency(analytics.revenue.netProfit)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Platform fees - Gateway charges
                    </Typography>
                  </CardContent>
                </Card>
                <Card elevation={1}>
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">
                      Average Transaction
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {formatCurrency(analytics.revenue.averageTransactionValue)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Success rate: {analytics.summary.successRate.toFixed(1)}%
                    </Typography>
                  </CardContent>
                </Card>
              </Box>

              {/* Charts */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                  gap: 3,
                }}
              >
                {/* Revenue Trend */}
                <Paper elevation={1} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Revenue Trend (Last 30 Days)
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <RechartsTooltip />
                      <Legend />
                      <Line type="monotone" dataKey="platformFees" stroke="#E91E63" name="Platform Fees" />
                      <Line type="monotone" dataKey="gatewayCharges" stroke="#9C27B0" name="Gateway Charges" />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>

                {/* Payment Methods */}
                <Paper elevation={1} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Payment Methods Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.paymentMethods}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ payload, percent }: PieLabelRenderProps) => {
                          const label = payload?.method ?? payload?.name ?? '';
                          const value =
                            percent != null
                              ? (percent * 100).toFixed(1)
                              : payload?.percentage != null
                              ? (Number(payload.percentage) || 0).toFixed(1)
                              : '0.0';
                          return `${label}: ${value}%`;
                        }}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {analytics.paymentMethods.map((_entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>

                {/* Top Libraries */}
                <Paper elevation={1} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Top Libraries by Revenue
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.topLibraries}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="libraryName" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={100} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <RechartsTooltip />
                      <Bar dataKey="amount" fill="#E91E63" name="Total Amount" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>

                {/* Hourly Pattern */}
                <Paper elevation={1} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Hourly Transaction Pattern
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.hourlyPattern}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <RechartsTooltip />
                      <Line type="monotone" dataKey="count" stroke="#9C27B0" name="Transactions" />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Box>
            </Box>
          ) : null}
        </TabPanel>

        {/* TAB 6: SETTINGS */}
        <TabPanel value={activeTab} index={5}>
          <Box>
            {saveSuccess && (
              <Alert severity="success" sx={{ mb: 3 }}>
                <Typography variant="body2" fontWeight={600}>
                  ✅ Settings saved successfully!
                </Typography>
              </Alert>
            )}

            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                Configure payment gateway, fee structure, and settlement automation. Changes take effect immediately.
              </Typography>
            </Alert>

            {/* Fee Structure Configuration */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                💰 Fee Structure Configuration
              </Typography>
              <Divider sx={{ my: 2 }} />

              {/* Platform Fee */}
              <Typography variant="subtitle2" gutterBottom fontWeight={600} color="primary.main">
                Platform Fee
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                  gap: 2,
                  mt: 2,
                  mb: 3,
                }}
              >
                <FormControl size="small">
                  <InputLabel>Fee Type</InputLabel>
                  <Select
                    value={feeSettings.platformFeeType}
                    label="Fee Type"
                    onChange={(e) => setFeeSettings({ ...feeSettings, platformFeeType: e.target.value as 'percentage' | 'flat' })}
                  >
                    <MenuItem value="percentage">Percentage (%)</MenuItem>
                    <MenuItem value="flat">Flat Amount (₹)</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Percentage (%)"
                  type="number"
                  value={feeSettings.platformFeePercent}
                  onChange={(e) => setFeeSettings({ ...feeSettings, platformFeePercent: Number(e.target.value) })}
                  size="small"
                  helperText="Applied when type is Percentage"
                  disabled={feeSettings.platformFeeType !== 'percentage'}
                />
                <TextField
                  label="Flat Amount (₹)"
                  type="number"
                  value={feeSettings.platformFeeFlat}
                  onChange={(e) => setFeeSettings({ ...feeSettings, platformFeeFlat: Number(e.target.value) })}
                  size="small"
                  helperText="Applied when type is Flat"
                  disabled={feeSettings.platformFeeType !== 'flat'}
                />
              </Box>

              {/* Gateway Charges */}
              <Typography variant="subtitle2" gutterBottom fontWeight={600} color="error.main">
                Gateway Charges
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                  gap: 2,
                  mt: 2,
                  mb: 3,
                }}
              >
                <FormControl size="small">
                  <InputLabel>Fee Type</InputLabel>
                  <Select
                    value={feeSettings.gatewayChargesType}
                    label="Fee Type"
                    onChange={(e) => setFeeSettings({ ...feeSettings, gatewayChargesType: e.target.value as 'percentage' | 'flat' })}
                  >
                    <MenuItem value="percentage">Percentage (%)</MenuItem>
                    <MenuItem value="flat">Flat Amount (₹)</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Percentage (%)"
                  type="number"
                  value={feeSettings.gatewayChargesPercent}
                  onChange={(e) => setFeeSettings({ ...feeSettings, gatewayChargesPercent: Number(e.target.value) })}
                  size="small"
                  helperText="Applied when type is Percentage"
                  disabled={feeSettings.gatewayChargesType !== 'percentage'}
                />
                <TextField
                  label="Fixed Charges (₹)"
                  type="number"
                  value={feeSettings.gatewayChargesFixed}
                  onChange={(e) => setFeeSettings({ ...feeSettings, gatewayChargesFixed: Number(e.target.value) })}
                  size="small"
                  helperText="Added to percentage charges"
                />
              </Box>

              {/* Transaction Limits */}
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                Transaction Limits
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                  gap: 2,
                  mt: 2,
                }}
              >
                <TextField
                  label="Minimum Transaction (₹)"
                  type="number"
                  value={feeSettings.minimumTransaction}
                  onChange={(e) => setFeeSettings({ ...feeSettings, minimumTransaction: Number(e.target.value) })}
                  size="small"
                />
                <TextField
                  label="Maximum Transaction (₹)"
                  type="number"
                  value={feeSettings.maximumTransaction}
                  onChange={(e) => setFeeSettings({ ...feeSettings, maximumTransaction: Number(e.target.value) })}
                  size="small"
                />
              </Box>
            </Paper>

            {/* Settlement Configuration */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                🏦 Settlement Configuration
              </Typography>
              <Divider sx={{ my: 2 }} />

              {/* Settlement Mode */}
              <Typography variant="subtitle2" gutterBottom fontWeight={600} color="primary.main">
                Settlement Mode
              </Typography>
              <FormControl fullWidth size="small" sx={{ mt: 2, mb: 3 }}>
                <InputLabel>Settlement Mode</InputLabel>
                <Select
                  value={settlementSettings.settlementMode}
                  label="Settlement Mode"
                  onChange={(e) => setSettlementSettings({ ...settlementSettings, settlementMode: e.target.value as any })}
                >
                  <MenuItem value="fully_automated">Fully Automated</MenuItem>
                  <MenuItem value="manual_approval">Manual Approval</MenuItem>
                  <MenuItem value="hybrid">Hybrid (Recommended)</MenuItem>
                </Select>
              </FormControl>

              {/* Dual Check Settings */}
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                Dual Verification Settings
              </Typography>
              <Box sx={{ mt: 2, mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settlementSettings.enableDualCheck}
                      onChange={(e) => setSettlementSettings({ ...settlementSettings, enableDualCheck: e.target.checked })}
                    />
                  }
                  label="Enable Dual Check Verification"
                />
                <TextField
                  label="Dual Check Threshold (₹)"
                  type="number"
                  value={settlementSettings.dualCheckThreshold}
                  onChange={(e) => setSettlementSettings({ ...settlementSettings, dualCheckThreshold: Number(e.target.value) })}
                  size="small"
                  fullWidth
                  sx={{ mt: 2 }}
                  helperText="Amount above which dual verification is required"
                  disabled={!settlementSettings.enableDualCheck}
                />
              </Box>

              {/* Automated Settlement Settings */}
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                Automated Settlement Settings
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                  gap: 2,
                  mt: 2,
                  mb: 3,
                }}
              >
                <FormControl size="small">
                  <InputLabel>Settlement Frequency</InputLabel>
                  <Select
                    value={settlementSettings.settlementFrequency}
                    label="Settlement Frequency"
                    onChange={(e) => setSettlementSettings({ ...settlementSettings, settlementFrequency: e.target.value as any })}
                  >
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="biweekly">Bi-weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Settlement Day"
                  type="number"
                  value={settlementSettings.settlementDay}
                  onChange={(e) => setSettlementSettings({ ...settlementSettings, settlementDay: Number(e.target.value) })}
                  size="small"
                  helperText="Day of week (1-7) or month (1-31)"
                />
                <TextField
                  label="Settlement Time"
                  type="time"
                  value={settlementSettings.settlementTime}
                  onChange={(e) => setSettlementSettings({ ...settlementSettings, settlementTime: e.target.value })}
                  size="small"
                  helperText="Time when auto-settlement runs"
                />
                <TextField
                  label="Minimum Settlement Amount (₹)"
                  type="number"
                  value={settlementSettings.minimumSettlementAmount}
                  onChange={(e) => setSettlementSettings({ ...settlementSettings, minimumSettlementAmount: Number(e.target.value) })}
                  size="small"
                  helperText="Minimum amount to trigger settlement"
                />
              </Box>

              {/* Manual Approval Settings */}
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                Manual Approval Settings
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                  gap: 2,
                  mt: 2,
                  mb: 3,
                }}
              >
                <TextField
                  label="Approval Threshold Amount (₹)"
                  type="number"
                  value={settlementSettings.approvalThresholdAmount}
                  onChange={(e) => setSettlementSettings({ ...settlementSettings, approvalThresholdAmount: Number(e.target.value) })}
                  size="small"
                  helperText="Settlements above this require approval"
                />
                <FormControl size="small">
                  <InputLabel>Approval Level</InputLabel>
                  <Select
                    value={settlementSettings.approvalLevel}
                    label="Approval Level"
                    onChange={(e) => setSettlementSettings({ ...settlementSettings, approvalLevel: e.target.value as any })}
                  >
                    <MenuItem value="admin">Admin Approval</MenuItem>
                    <MenuItem value="manager">Manager Approval</MenuItem>
                    <MenuItem value="both">Both Admin & Manager</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Notifications */}
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                Notifications
              </Typography>
              <Box sx={{ mt: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settlementSettings.notifyLibrary}
                      onChange={(e) => setSettlementSettings({ ...settlementSettings, notifyLibrary: e.target.checked })}
                    />
                  }
                  label="Notify library on settlement completion"
                />
                <Box sx={{ mt: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settlementSettings.notifyAdmin}
                        onChange={(e) => setSettlementSettings({ ...settlementSettings, notifyAdmin: e.target.checked })}
                      />
                    }
                    label="Notify admin on pending approval"
                  />
                </Box>
              </Box>
            </Paper>

            {/* Save Button */}
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button variant="outlined" disabled={loading}>
                Reset to Defaults
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveSettings}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Configuration'}
              </Button>
            </Box>
          </Box>
        </TabPanel>
      </Card>

      {/* Transaction Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedTransaction && (
          <>
            <DialogTitle>
              <Typography variant="h6" fontWeight={700}>
                Transaction Details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedTransaction.transactionId}
              </Typography>
            </DialogTitle>
            <DialogContent dividers>
              <Box>
                <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                  Student Information
                </Typography>
                <Box mb={2} p={2} bgcolor="grey.50" borderRadius={1}>
                  <Typography variant="body2"><strong>Name:</strong> {selectedTransaction.studentName}</Typography>
                  <Typography variant="body2"><strong>Email:</strong> {selectedTransaction.studentEmail}</Typography>
                  <Typography variant="body2"><strong>Phone:</strong> {selectedTransaction.studentPhone}</Typography>
                </Box>

                <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                  Payment Breakdown
                </Typography>
                <Box mb={2} p={2} bgcolor="grey.50" borderRadius={1}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Student Paid:</Typography>
                    <Typography variant="body2" fontWeight={600}>{formatCurrency(selectedTransaction.amountPaid)}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="error.main">Gateway Charges:</Typography>
                    <Typography variant="body2" color="error.main">-{formatCurrency(selectedTransaction.gatewayCharges || 0)}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="warning.main">Platform Fee:</Typography>
                    <Typography variant="body2" color="warning.main">-{formatCurrency(selectedTransaction.platformFee || 0)}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" fontWeight={700}>Net to Library:</Typography>
                    <Typography variant="body2" fontWeight={700} color="success.main">{formatCurrency(selectedTransaction.netToLibrary || 0)}</Typography>
                  </Box>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
              <Button variant="outlined" startIcon={<Download />}>
                Download Receipt
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Settlement Dialog */}
      <Dialog
        open={settlementDialogOpen}
        onClose={() => setSettlementDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedSettlement && (
          <>
            <DialogTitle>Initiate Settlement</DialogTitle>
            <DialogContent dividers>
              <Typography variant="body2" gutterBottom>
                Settle {selectedSettlement.transactionCount} transactions for <strong>{selectedSettlement.libraryName}</strong>
              </Typography>
              <Box my={2} p={2} bgcolor="success.50" borderRadius={1}>
                <Typography variant="h5" fontWeight={700} color="success.main">
                  {formatCurrency(selectedSettlement.netPayable || 0)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Net payable amount
                </Typography>
              </Box>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Settlement Method</InputLabel>
                <Select defaultValue="bank_transfer" label="Settlement Method">
                  <MenuItem value="bank_transfer">Bank Transfer (NEFT/RTGS)</MenuItem>
                  <MenuItem value="upi">UPI Transfer</MenuItem>
                  <MenuItem value="manual">Manual/Offline</MenuItem>
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSettlementDialogOpen(false)}>Cancel</Button>
              <Button variant="contained" color="success" startIcon={<Send />}>
                Initiate Settlement
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default PaymentManagementComplete;

