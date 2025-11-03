// ============================================
// PAYMENT MANAGEMENT - MAIN COMPONENT
// ============================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  AccountBalance as BankIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as PendingIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Receipt as ReceiptIcon,
  Send as SendIcon,
  AttachMoney as MoneyIcon,
  TrendingUp,
  TrendingDown,
  CreditCard,
  AccountBalanceWallet,
  Phone as PhoneIcon,
  Computer as NetBankingIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
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
} from 'recharts';
import { paymentService } from '../../../services/api/payments';
import {
  PaymentTransaction,
  Settlement,
  PaymentAnalytics,
  PendingSettlement,
  PaymentFilters,
  PaymentStatus,
  PaymentMethod,
} from '../types';

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

const getStatusColor = (status: PaymentStatus): 'success' | 'warning' | 'error' | 'default' => {
  switch (status) {
    case 'success':
      return 'success';
    case 'pending':
      return 'warning';
    case 'failed':
      return 'error';
    case 'refunded':
      return 'default';
    default:
      return 'default';
  }
};

const getStatusIcon = (status: PaymentStatus) => {
  switch (status) {
    case 'success':
      return <SuccessIcon fontSize="small" />;
    case 'pending':
      return <PendingIcon fontSize="small" />;
    case 'failed':
      return <ErrorIcon fontSize="small" />;
    case 'refunded':
      return <RefreshIcon fontSize="small" />;
    default:
      return undefined;
  }
};

const getPaymentMethodIcon = (method: PaymentMethod) => {
  switch (method) {
    case 'upi':
      return <PhoneIcon fontSize="small" />;
    case 'card':
      return <CreditCard fontSize="small" />;
    case 'netbanking':
      return <NetBankingIcon fontSize="small" />;
    case 'wallet':
      return <AccountBalanceWallet fontSize="small" />;
    default:
      return <PaymentIcon fontSize="small" />;
  }
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

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

const PaymentManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Data states
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [pendingSettlements, setPendingSettlements] = useState<PendingSettlement[]>([]);
  const [completedSettlements, setCompletedSettlements] = useState<Settlement[]>([]);
  const [failedTransactions, setFailedTransactions] = useState<PaymentTransaction[]>([]);
  const [analytics, setAnalytics] = useState<PaymentAnalytics | null>(null);
  const [libraries, setLibraries] = useState<any[]>([]);
  
  // Filter states
  const [filters, setFilters] = useState<Partial<PaymentFilters>>({
    status: 'all',
    paymentMethod: 'all',
    settlementStatus: 'all',
    libraryId: 'all',
    dateRange: 'all',
    searchQuery: '',
  });
  
  // Custom date range
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Dialog states
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null);
  const [settlementDialogOpen, setSettlementDialogOpen] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState<PendingSettlement | null>(null);

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
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  // ============================================
  // DATA FETCHING
  // ============================================

  useEffect(() => {
    loadData();
  }, [activeTab, filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 0) {
        // All Transactions
        const response = await paymentService.getAllTransactions(filters);
        if (response.success && response.data) {
          setTransactions(response.data);
        }
      } else if (activeTab === 1) {
        // Pending Settlements
        const response = await paymentService.getPendingSettlements();
        if (response.success && response.data) {
          setPendingSettlements(response.data);
        }
      } else if (activeTab === 2) {
        // Completed Settlements
        const response = await paymentService.getCompletedSettlements();
        if (response.success && response.data) {
          setCompletedSettlements(response.data);
        }
      } else if (activeTab === 3) {
        // Failed Payments
        const response = await paymentService.getFailedTransactions();
        if (response.success && response.data) {
          setFailedTransactions(response.data);
        }
      } else if (activeTab === 4) {
        // Analytics
        const response = await paymentService.getAnalytics();
        if (response.success && response.data) {
          setAnalytics(response.data);
        }
      }
      
      // Load libraries for filters
      const libResponse = await paymentService.getLibraries();
      if (libResponse.success && libResponse.data) {
        setLibraries(libResponse.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setPage(0);
  };

  const handleFilterChange = (key: keyof PaymentFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const handleViewDetails = (transaction: PaymentTransaction) => {
    setSelectedTransaction(transaction);
    setDetailDialogOpen(true);
  };

  const handleInitiateSettlement = (settlement: PendingSettlement) => {
    setSelectedSettlement(settlement);
    setSettlementDialogOpen(true);
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would call the API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
      console.log('Settings saved:', { feeSettings, settlementSettings });
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSettings = () => {
    setFeeSettings({
      platformFeeType: 'percentage',
      platformFeePercent: 3,
      platformFeeFlat: 0,
      gatewayChargesType: 'percentage',
      gatewayChargesPercent: 2,
      gatewayChargesFixed: 2,
      minimumTransaction: 100,
      maximumTransaction: 100000,
    });
    setSettlementSettings({
      settlementMode: 'hybrid',
      settlementFrequency: 'weekly',
      settlementDay: 5,
      settlementTime: '18:00',
      minimumSettlementAmount: 1000,
      approvalThresholdAmount: 50000,
      approvalLevel: 'admin',
      autoRetry: 'enabled',
      maxRetryAttempts: 3,
      retryIntervalHours: 24,
      notifyLibrary: true,
      notifyAdmin: true,
      requireVerification: true,
    });
  };

  // Continue in next part...
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        💳 Payment Management
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Manage student payments, settlements, and platform revenue
      </Typography>

      <Card elevation={2}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab label="All Transactions" />
          <Tab label="Pending Settlements" />
          <Tab label="Completed" />
          <Tab label="Failed Payments" />
          <Tab label="Analytics" />
          <Tab label="Settings" />
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
                      {((transactions.filter(t => t.status === 'success').length / transactions.length) * 100).toFixed(1)}%
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
                    mb: 2,
                  }}
                >
                  <TextField
                    size="small"
                    placeholder="Search..."
                    value={filters.searchQuery}
                    onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                  <FormControl size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filters.status}
                      label="Status"
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="success">Success</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="failed">Failed</MenuItem>
                      <MenuItem value="refunded">Refunded</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small">
                    <InputLabel>Payment Method</InputLabel>
                    <Select
                      value={filters.paymentMethod}
                      label="Payment Method"
                      onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="upi">UPI</MenuItem>
                      <MenuItem value="card">Card</MenuItem>
                      <MenuItem value="netbanking">Net Banking</MenuItem>
                      <MenuItem value="wallet">Wallet</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small">
                    <InputLabel>Library</InputLabel>
                    <Select
                      value={filters.libraryId}
                      label="Library"
                      onChange={(e) => handleFilterChange('libraryId', e.target.value)}
                    >
                      <MenuItem value="all">All Libraries</MenuItem>
                      {libraries.map((lib) => (
                        <MenuItem key={lib.id} value={lib.id}>
                          {lib.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Date Range Filter */}
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom fontWeight={600} mb={2}>
                  📅 Date Range
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                    gap: 2,
                  }}
                >
                  <FormControl size="small">
                    <InputLabel>Quick Select</InputLabel>
                    <Select
                      value={filters.dateRange}
                      label="Quick Select"
                      onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                    >
                      <MenuItem value="all">All Time</MenuItem>
                      <MenuItem value="today">Today</MenuItem>
                      <MenuItem value="yesterday">Yesterday</MenuItem>
                      <MenuItem value="last7days">Last 7 Days</MenuItem>
                      <MenuItem value="last30days">Last 30 Days</MenuItem>
                      <MenuItem value="thisMonth">This Month</MenuItem>
                      <MenuItem value="lastMonth">Last Month</MenuItem>
                      <MenuItem value="thisYear">This Year</MenuItem>
                      <MenuItem value="custom">Custom Range</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    size="small"
                    label="Start Date"
                    type="date"
                    value={customDateRange.startDate}
                    onChange={(e) => setCustomDateRange({ ...customDateRange, startDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    disabled={filters.dateRange !== 'custom'}
                  />
                  <TextField
                    size="small"
                    label="End Date"
                    type="date"
                    value={customDateRange.endDate}
                    onChange={(e) => setCustomDateRange({ ...customDateRange, endDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    disabled={filters.dateRange !== 'custom'}
                  />
                </Box>
              </Paper>

              {/* Transactions Table */}
              <TableContainer component={Paper} elevation={1}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                      <TableCell><strong>Transaction ID</strong></TableCell>
                      <TableCell><strong>Date & Time</strong></TableCell>
                      <TableCell><strong>Student</strong></TableCell>
                      <TableCell><strong>Library</strong></TableCell>
                      <TableCell align="right"><strong>Amount</strong></TableCell>
                      <TableCell align="right"><strong>Platform Fee</strong></TableCell>
                      <TableCell align="right"><strong>Net to Library</strong></TableCell>
                      <TableCell><strong>Method</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((transaction) => (
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
                          <Typography variant="caption" color="text.secondary">
                            {transaction.studentPhone}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {transaction.libraryName}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={600}>
                            {formatCurrency(transaction.amountPaid)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="warning.main">
                            {formatCurrency(transaction.platformFee)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="success.main" fontWeight={600}>
                            {formatCurrency(transaction.netToLibrary)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getPaymentMethodIcon(transaction.paymentMethod)}
                            label={transaction.paymentMethod.toUpperCase()}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(transaction.status)}
                            label={transaction.status.toUpperCase()}
                            color={getStatusColor(transaction.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => handleViewDetails(transaction)}>
                              <ReceiptIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  component="div"
                  count={transactions.length}
                  page={page}
                  onPageChange={(_e, newPage) => setPage(newPage)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                />
              </TableContainer>
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
              {/* Summary */}
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2" fontWeight={600}>
                  {pendingSettlements.length} libraries have pending settlements totaling{' '}
                  {formatCurrency(pendingSettlements.reduce((sum, s) => sum + s.netPayable, 0))}
                </Typography>
              </Alert>

              {/* Pending Settlements List */}
              {pendingSettlements.map((settlement) => (
                <Card key={settlement.libraryId} elevation={2} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box>
                        <Typography variant="h6" fontWeight={700}>
                          {settlement.libraryName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {settlement.transactionCount} transactions • Oldest: {formatDate(settlement.oldestTransactionDate)}
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        startIcon={<SendIcon />}
                        onClick={() => handleInitiateSettlement(settlement)}
                      >
                        Settle Now
                      </Button>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Amount Breakdown */}
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
                          {formatCurrency(settlement.totalAmount)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Gateway Charges
                        </Typography>
                        <Typography variant="h6" color="error.main">
                          -{formatCurrency(settlement.gatewayCharges)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Platform Fees
                        </Typography>
                        <Typography variant="h6" color="warning.main">
                          -{formatCurrency(settlement.platformFees)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Net Payable
                        </Typography>
                        <Typography variant="h6" color="success.main" fontWeight={700}>
                          {formatCurrency(settlement.netPayable)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Bank Details */}
                    <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
                      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        Settlement Details
                      </Typography>
                      <Box display="flex" gap={3} flexWrap="wrap">
                        {settlement.bankAccountNumber && (
                          <Typography variant="body2">
                            <strong>Account:</strong> {settlement.bankAccountNumber}
                          </Typography>
                        )}
                        {settlement.ifscCode && (
                          <Typography variant="body2">
                            <strong>IFSC:</strong> {settlement.ifscCode}
                          </Typography>
                        )}
                        {settlement.upiId && (
                          <Typography variant="body2">
                            <strong>UPI:</strong> {settlement.upiId}
                          </Typography>
                        )}
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
              {/* Date Filter for Completed Settlements */}
              <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom fontWeight={600} mb={2}>
                  📅 Filter by Date
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                    gap: 2,
                  }}
                >
                  <FormControl size="small">
                    <InputLabel>Quick Select</InputLabel>
                    <Select
                      value={filters.dateRange}
                      label="Quick Select"
                      onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                    >
                      <MenuItem value="all">All Time</MenuItem>
                      <MenuItem value="today">Today</MenuItem>
                      <MenuItem value="yesterday">Yesterday</MenuItem>
                      <MenuItem value="last7days">Last 7 Days</MenuItem>
                      <MenuItem value="last30days">Last 30 Days</MenuItem>
                      <MenuItem value="thisMonth">This Month</MenuItem>
                      <MenuItem value="lastMonth">Last Month</MenuItem>
                      <MenuItem value="thisYear">This Year</MenuItem>
                      <MenuItem value="custom">Custom Range</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    size="small"
                    label="Start Date"
                    type="date"
                    value={customDateRange.startDate}
                    onChange={(e) => setCustomDateRange({ ...customDateRange, startDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    disabled={filters.dateRange !== 'custom'}
                  />
                  <TextField
                    size="small"
                    label="End Date"
                    type="date"
                    value={customDateRange.endDate}
                    onChange={(e) => setCustomDateRange({ ...customDateRange, endDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    disabled={filters.dateRange !== 'custom'}
                  />
                </Box>
              </Paper>

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
                            {formatCurrency(settlement.netPayable)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={settlement.settlementMethod.toUpperCase().replace('_', ' ')}
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
                            label={settlement.status.toUpperCase()}
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
                  {failedTransactions.length} failed transactions • Total amount: {formatCurrency(failedTransactions.reduce((sum, t) => sum + t.amountPaid, 0))}
                </Typography>
              </Alert>

              {/* Date Filter for Failed Payments */}
              <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom fontWeight={600} mb={2}>
                  📅 Filter by Date
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                    gap: 2,
                  }}
                >
                  <FormControl size="small">
                    <InputLabel>Quick Select</InputLabel>
                    <Select
                      value={filters.dateRange}
                      label="Quick Select"
                      onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                    >
                      <MenuItem value="all">All Time</MenuItem>
                      <MenuItem value="today">Today</MenuItem>
                      <MenuItem value="yesterday">Yesterday</MenuItem>
                      <MenuItem value="last7days">Last 7 Days</MenuItem>
                      <MenuItem value="last30days">Last 30 Days</MenuItem>
                      <MenuItem value="thisMonth">This Month</MenuItem>
                      <MenuItem value="lastMonth">Last Month</MenuItem>
                      <MenuItem value="thisYear">This Year</MenuItem>
                      <MenuItem value="custom">Custom Range</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    size="small"
                    label="Start Date"
                    type="date"
                    value={customDateRange.startDate}
                    onChange={(e) => setCustomDateRange({ ...customDateRange, startDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    disabled={filters.dateRange !== 'custom'}
                  />
                  <TextField
                    size="small"
                    label="End Date"
                    type="date"
                    value={customDateRange.endDate}
                    onChange={(e) => setCustomDateRange({ ...customDateRange, endDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    disabled={filters.dateRange !== 'custom'}
                  />
                </Box>
              </Paper>

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
                          <Typography variant="caption" color="text.secondary">
                            {transaction.studentPhone}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {transaction.libraryName}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={600}>
                            {formatCurrency(transaction.amountPaid)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getPaymentMethodIcon(transaction.paymentMethod)}
                            label={transaction.paymentMethod.toUpperCase()}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="error.main">
                            {transaction.gatewayResponseMessage}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => handleViewDetails(transaction)}>
                              <ReceiptIcon fontSize="small" />
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
              {/* Date Filter for Analytics */}
              <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom fontWeight={600} mb={2}>
                  📅 Analytics Period
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                    gap: 2,
                  }}
                >
                  <FormControl size="small">
                    <InputLabel>Quick Select</InputLabel>
                    <Select
                      value={filters.dateRange}
                      label="Quick Select"
                      onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                    >
                      <MenuItem value="all">All Time</MenuItem>
                      <MenuItem value="today">Today</MenuItem>
                      <MenuItem value="yesterday">Yesterday</MenuItem>
                      <MenuItem value="last7days">Last 7 Days</MenuItem>
                      <MenuItem value="last30days">Last 30 Days</MenuItem>
                      <MenuItem value="thisMonth">This Month</MenuItem>
                      <MenuItem value="lastMonth">Last Month</MenuItem>
                      <MenuItem value="thisYear">This Year</MenuItem>
                      <MenuItem value="custom">Custom Range</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    size="small"
                    label="Start Date"
                    type="date"
                    value={customDateRange.startDate}
                    onChange={(e) => setCustomDateRange({ ...customDateRange, startDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    disabled={filters.dateRange !== 'custom'}
                  />
                  <TextField
                    size="small"
                    label="End Date"
                    type="date"
                    value={customDateRange.endDate}
                    onChange={(e) => setCustomDateRange({ ...customDateRange, endDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    disabled={filters.dateRange !== 'custom'}
                  />
                </Box>
              </Paper>

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
                    <Box display="flex" alignItems="center" mt={0.5}>
                      {analytics.revenue.growth >= 0 ? (
                        <TrendingUp fontSize="small" color="success" />
                      ) : (
                        <TrendingDown fontSize="small" color="error" />
                      )}
                      <Typography variant="caption" color={analytics.revenue.growth >= 0 ? 'success.main' : 'error.main'} ml={0.5}>
                        {analytics.revenue.growth.toFixed(1)}% vs last month
                      </Typography>
                    </Box>
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
                      <Line type="monotone" dataKey="platformFees" stroke="#8884d8" name="Platform Fees" />
                      <Line type="monotone" dataKey="gatewayCharges" stroke="#ff8042" name="Gateway Charges" />
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
                        label={(entry: any) => `${entry.method}: ${entry.percentage.toFixed(1)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {analytics.paymentMethods.map((_entry, index) => (
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
                    Top 10 Libraries by Revenue
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.topLibraries}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="libraryName" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={100} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <RechartsTooltip />
                      <Bar dataKey="amount" fill="#82ca9d" name="Total Amount" />
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
                      <XAxis dataKey="hour" tick={{ fontSize: 12 }} label={{ value: 'Hour of Day', position: 'insideBottom', offset: -5 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <RechartsTooltip />
                      <Line type="monotone" dataKey="count" stroke="#8884d8" name="Transactions" />
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
                    onChange={(e) => setFeeSettings({...feeSettings, platformFeeType: e.target.value as 'percentage' | 'flat'})}
                  >
                    <MenuItem value="percentage">Percentage (%)</MenuItem>
                    <MenuItem value="flat">Flat Amount (₹)</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Percentage (%)"
                  type="number"
                  value={feeSettings.platformFeePercent}
                  onChange={(e) => setFeeSettings({...feeSettings, platformFeePercent: Number(e.target.value)})}
                  size="small"
                  helperText="Applied when type is Percentage"
                  disabled={feeSettings.platformFeeType !== 'percentage'}
                />
                <TextField
                  label="Flat Amount (₹)"
                  type="number"
                  value={feeSettings.platformFeeFlat}
                  onChange={(e) => setFeeSettings({...feeSettings, platformFeeFlat: Number(e.target.value)})}
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
                    onChange={(e) => setFeeSettings({...feeSettings, gatewayChargesType: e.target.value as 'percentage' | 'flat'})}
                  >
                    <MenuItem value="percentage">Percentage (%)</MenuItem>
                    <MenuItem value="flat">Flat Amount (₹)</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Percentage (%)"
                  type="number"
                  value={feeSettings.gatewayChargesPercent}
                  onChange={(e) => setFeeSettings({...feeSettings, gatewayChargesPercent: Number(e.target.value)})}
                  size="small"
                  helperText="Applied when type is Percentage"
                  disabled={feeSettings.gatewayChargesType !== 'percentage'}
                />
                <TextField
                  label="Fixed Charges (₹)"
                  type="number"
                  value={feeSettings.gatewayChargesFixed}
                  onChange={(e) => setFeeSettings({...feeSettings, gatewayChargesFixed: Number(e.target.value)})}
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
                  onChange={(e) => setFeeSettings({...feeSettings, minimumTransaction: Number(e.target.value)})}
                  size="small"
                />
                <TextField
                  label="Maximum Transaction (₹)"
                  type="number"
                  value={feeSettings.maximumTransaction}
                  onChange={(e) => setFeeSettings({...feeSettings, maximumTransaction: Number(e.target.value)})}
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
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth size="small" sx={{ mt: 2 }}>
                  <InputLabel>Settlement Mode</InputLabel>
                  <Select 
                    value={settlementSettings.settlementMode} 
                    label="Settlement Mode"
                    onChange={(e) => setSettlementSettings({...settlementSettings, settlementMode: e.target.value as 'fully_automated' | 'manual_approval' | 'hybrid'})}
                  >
                    <MenuItem value="fully_automated">
                      <Box>
                        <Typography variant="body2" fontWeight={600}>Fully Automated</Typography>
                        <Typography variant="caption" color="text.secondary">
                          All settlements processed automatically without approval
                        </Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="manual_approval">
                      <Box>
                        <Typography variant="body2" fontWeight={600}>Manual Approval</Typography>
                        <Typography variant="caption" color="text.secondary">
                          All settlements require manual approval before processing
                        </Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="hybrid">
                      <Box>
                        <Typography variant="body2" fontWeight={600}>Hybrid (Recommended)</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Auto-process below threshold, manual approval above
                        </Typography>
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
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
                    onChange={(e) => setSettlementSettings({...settlementSettings, settlementFrequency: e.target.value as 'daily' | 'weekly' | 'biweekly' | 'monthly'})}
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
                  onChange={(e) => setSettlementSettings({...settlementSettings, settlementDay: Number(e.target.value)})}
                  size="small"
                  helperText="Day of week (1-7) or month (1-31)"
                />
                <TextField
                  label="Settlement Time"
                  type="time"
                  value={settlementSettings.settlementTime}
                  onChange={(e) => setSettlementSettings({...settlementSettings, settlementTime: e.target.value})}
                  size="small"
                  helperText="Time when auto-settlement runs"
                />
                <TextField
                  label="Minimum Settlement Amount (₹)"
                  type="number"
                  value={settlementSettings.minimumSettlementAmount}
                  onChange={(e) => setSettlementSettings({...settlementSettings, minimumSettlementAmount: Number(e.target.value)})}
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
                  onChange={(e) => setSettlementSettings({...settlementSettings, approvalThresholdAmount: Number(e.target.value)})}
                  size="small"
                  helperText="Settlements above this require approval"
                />
                <FormControl size="small">
                  <InputLabel>Approval Level</InputLabel>
                  <Select 
                    value={settlementSettings.approvalLevel} 
                    label="Approval Level"
                    onChange={(e) => setSettlementSettings({...settlementSettings, approvalLevel: e.target.value as 'admin' | 'manager' | 'both'})}
                  >
                    <MenuItem value="admin">Admin Approval</MenuItem>
                    <MenuItem value="manager">Manager Approval</MenuItem>
                    <MenuItem value="both">Both Admin & Manager</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Auto-Retry Failed Settlements */}
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                Auto-Retry Failed Settlements
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
                  <InputLabel>Auto-Retry</InputLabel>
                  <Select 
                    value={settlementSettings.autoRetry} 
                    label="Auto-Retry"
                    onChange={(e) => setSettlementSettings({...settlementSettings, autoRetry: e.target.value as 'enabled' | 'disabled'})}
                  >
                    <MenuItem value="enabled">Enabled</MenuItem>
                    <MenuItem value="disabled">Disabled</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Max Retry Attempts"
                  type="number"
                  value={settlementSettings.maxRetryAttempts}
                  onChange={(e) => setSettlementSettings({...settlementSettings, maxRetryAttempts: Number(e.target.value)})}
                  size="small"
                  helperText="Maximum retry attempts"
                />
                <TextField
                  label="Retry Interval (hours)"
                  type="number"
                  value={settlementSettings.retryIntervalHours}
                  onChange={(e) => setSettlementSettings({...settlementSettings, retryIntervalHours: Number(e.target.value)})}
                  size="small"
                  helperText="Hours between retry attempts"
                />
              </Box>

              {/* Notifications */}
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                Notifications
              </Typography>
              <Box sx={{ mt: 2 }}>
                <FormControl component="fieldset">
                  <Box display="flex" flexDirection="column" gap={1}>
                    <Box display="flex" alignItems="center">
                      <input 
                        type="checkbox" 
                        checked={settlementSettings.notifyLibrary} 
                        onChange={(e) => setSettlementSettings({...settlementSettings, notifyLibrary: e.target.checked})}
                        id="notify-library" 
                      />
                      <label htmlFor="notify-library" style={{ marginLeft: 8, cursor: 'pointer' }}>
                        <Typography variant="body2">Notify library on settlement completion</Typography>
                      </label>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <input 
                        type="checkbox" 
                        checked={settlementSettings.notifyAdmin} 
                        onChange={(e) => setSettlementSettings({...settlementSettings, notifyAdmin: e.target.checked})}
                        id="notify-admin" 
                      />
                      <label htmlFor="notify-admin" style={{ marginLeft: 8, cursor: 'pointer' }}>
                        <Typography variant="body2">Notify admin on pending approval</Typography>
                      </label>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <input 
                        type="checkbox" 
                        checked={settlementSettings.requireVerification} 
                        onChange={(e) => setSettlementSettings({...settlementSettings, requireVerification: e.target.checked})}
                        id="require-verification" 
                      />
                      <label htmlFor="require-verification" style={{ marginLeft: 8, cursor: 'pointer' }}>
                        <Typography variant="body2">Require bank account verification</Typography>
                      </label>
                    </Box>
                  </Box>
                </FormControl>
              </Box>
            </Paper>

            {/* Save Button */}
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button variant="outlined" onClick={handleResetSettings} disabled={loading}>
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
                {/* Student Info */}
                <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                  Student Information
                </Typography>
                <Box mb={2} p={2} bgcolor="grey.50" borderRadius={1}>
                  <Typography variant="body2"><strong>Name:</strong> {selectedTransaction.studentName}</Typography>
                  <Typography variant="body2"><strong>Email:</strong> {selectedTransaction.studentEmail}</Typography>
                  <Typography variant="body2"><strong>Phone:</strong> {selectedTransaction.studentPhone}</Typography>
                </Box>

                {/* Library Info */}
                <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                  Library Information
                </Typography>
                <Box mb={2} p={2} bgcolor="grey.50" borderRadius={1}>
                  <Typography variant="body2"><strong>Name:</strong> {selectedTransaction.libraryName}</Typography>
                  {selectedTransaction.libraryAccountNumber && (
                    <Typography variant="body2"><strong>Account:</strong> {selectedTransaction.libraryAccountNumber}</Typography>
                  )}
                  {selectedTransaction.libraryUpiId && (
                    <Typography variant="body2"><strong>UPI:</strong> {selectedTransaction.libraryUpiId}</Typography>
                  )}
                </Box>

                {/* Payment Breakdown */}
                <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                  Payment Breakdown
                </Typography>
                <Box mb={2} p={2} bgcolor="grey.50" borderRadius={1}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Student Paid:</Typography>
                    <Typography variant="body2" fontWeight={600}>{formatCurrency(selectedTransaction.amountPaid)}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="error.main">Gateway Charges ({selectedTransaction.gatewayChargesPercent}%):</Typography>
                    <Typography variant="body2" color="error.main">-{formatCurrency(selectedTransaction.gatewayCharges)}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="warning.main">Platform Fee ({selectedTransaction.platformFeePercent}%):</Typography>
                    <Typography variant="body2" color="warning.main">-{formatCurrency(selectedTransaction.platformFee)}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" fontWeight={700}>Net to Library:</Typography>
                    <Typography variant="body2" fontWeight={700} color="success.main">{formatCurrency(selectedTransaction.netToLibrary)}</Typography>
                  </Box>
                </Box>

                {/* Payment Method */}
                <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                  Payment Method
                </Typography>
                <Box mb={2} p={2} bgcolor="grey.50" borderRadius={1}>
                  <Typography variant="body2"><strong>Method:</strong> {selectedTransaction.paymentMethod.toUpperCase()}</Typography>
                  <Typography variant="body2"><strong>Provider:</strong> {selectedTransaction.paymentProvider}</Typography>
                  {selectedTransaction.cardLast4 && (
                    <Typography variant="body2"><strong>Card:</strong> **** **** **** {selectedTransaction.cardLast4}</Typography>
                  )}
                  {selectedTransaction.upiId && (
                    <Typography variant="body2"><strong>UPI ID:</strong> {selectedTransaction.upiId}</Typography>
                  )}
                </Box>

                {/* Status */}
                <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                  Status
                </Typography>
                <Box mb={2} p={2} bgcolor="grey.50" borderRadius={1}>
                  <Box display="flex" gap={2} mb={1}>
                    <Chip
                      icon={getStatusIcon(selectedTransaction.status)}
                      label={selectedTransaction.status.toUpperCase()}
                      color={getStatusColor(selectedTransaction.status)}
                      size="small"
                    />
                    <Chip
                      label={`Settlement: ${selectedTransaction.settlementStatus.toUpperCase()}`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                  <Typography variant="body2"><strong>Gateway Status:</strong> {selectedTransaction.gatewayStatus}</Typography>
                  <Typography variant="body2"><strong>Gateway Message:</strong> {selectedTransaction.gatewayResponseMessage}</Typography>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
              <Button variant="outlined" startIcon={<DownloadIcon />}>
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
            <DialogTitle>
              Initiate Settlement
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="body2" gutterBottom>
                Settle {selectedSettlement.transactionCount} transactions for <strong>{selectedSettlement.libraryName}</strong>
              </Typography>
              <Box my={2} p={2} bgcolor="success.50" borderRadius={1}>
                <Typography variant="h5" fontWeight={700} color="success.main">
                  {formatCurrency(selectedSettlement.netPayable)}
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
              <TextField
                fullWidth
                label="Settlement Reference (UTR/Transaction ID)"
                placeholder="Enter reference number"
                sx={{ mt: 2 }}
              />
              <TextField
                fullWidth
                label="Notes (Optional)"
                multiline
                rows={2}
                sx={{ mt: 2 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSettlementDialogOpen(false)}>Cancel</Button>
              <Button variant="contained" color="success" startIcon={<SendIcon />}>
                Initiate Settlement
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default PaymentManagement;














