// ============================================
// PAYMENT MANAGEMENT PAGE
// Complete payment processing, settlements & reconciliation
// ============================================

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  TextField,
  Button,
  Chip,
  GridLegacy as Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Payment,
  AccountBalance,
  TrendingUp,
  CheckCircle,
  Error as ErrorIcon,
  HourglassEmpty,
  Refresh,
  GetApp,
  Edit,
  Visibility,
  FilterList,
  Settings,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const PaymentManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [dateFrom, setDateFrom] = useState('2025-10-01');
  const [dateTo, setDateTo] = useState('2025-10-31');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [feeDialogOpen, setFeeDialogOpen] = useState(false);
  const [settlementDialogOpen, setSettlementDialogOpen] = useState(false);
  const [automationDialogOpen, setAutomationDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [selectedSettlement, setSelectedSettlement] = useState<any>(null);
  
  // Custom Fee Configuration State
  const [customFeeConfig, setCustomFeeConfig] = useState({
    tenantId: '',
    tenantName: '',
    feeType: 'percentage', // 'percentage' or 'flat'
    feeValue: 5,
    minFee: 50,
    maxFee: 500,
    effectiveFrom: new Date().toISOString().split('T')[0],
  });
  
  // Automation Settings State
  const [automationSettings, setAutomationSettings] = useState({
    autoSettlement: true,
    settlementFrequency: 'daily', // 'daily', 'weekly', 'monthly'
    settlementDay: 'monday',
    minimumAmount: 1000,
    approvalRequired: false,
    approvalThreshold: 100000,
  });

  // Mock Transactions Data
  const transactions = [
    { id: 1, transactionId: 'TXN001234', date: '2025-10-30', tenantName: 'Central Library', studentName: 'Rahul Sharma', amount: 3000, gatewayFee: 59.40, platformFee: 150, netAmount: 2790.60, method: 'Razorpay', status: 'Success', gateway: 'Razorpay' },
    { id: 2, transactionId: 'TXN001235', date: '2025-10-30', tenantName: 'Tech Library', studentName: 'Priya Patel', amount: 5000, gatewayFee: 99, platformFee: 250, netAmount: 4651, method: 'UPI', status: 'Success', gateway: 'Razorpay' },
    { id: 3, transactionId: 'TXN001236', date: '2025-10-29', tenantName: 'Knowledge Hub', studentName: 'Amit Kumar', amount: 2500, gatewayFee: 49.50, platformFee: 125, netAmount: 2325.50, method: 'Card', status: 'Pending', gateway: 'Stripe' },
    { id: 4, transactionId: 'TXN001237', date: '2025-10-29', tenantName: 'Study Center', studentName: 'Sneha Gupta', amount: 4000, gatewayFee: 79.20, platformFee: 200, netAmount: 3720.80, method: 'Net Banking', status: 'Failed', gateway: 'Razorpay' },
    { id: 5, transactionId: 'TXN001238', date: '2025-10-28', tenantName: 'Wisdom Library', studentName: 'Rohan Singh', amount: 3500, gatewayFee: 69.30, platformFee: 175, netAmount: 3255.70, method: 'UPI', status: 'Success', gateway: 'PayU' },
    { id: 6, transactionId: 'TXN001239', date: '2025-10-28', tenantName: 'Elite Study Space', studentName: 'Neha Reddy', amount: 6000, gatewayFee: 118.80, platformFee: 300, netAmount: 5581.20, method: 'Razorpay', status: 'Success', gateway: 'Razorpay' },
    { id: 7, transactionId: 'TXN001240', date: '2025-10-27', tenantName: 'Central Library', studentName: 'Vikas Mehta', amount: 2000, gatewayFee: 39.60, platformFee: 100, netAmount: 1860.40, method: 'Wallet', status: 'Refunded', gateway: 'Razorpay' },
    { id: 8, transactionId: 'TXN001241', date: '2025-10-27', tenantName: 'Premium Study', studentName: 'Anita Desai', amount: 8000, gatewayFee: 158.40, platformFee: 400, netAmount: 7441.60, method: 'Card', status: 'Success', gateway: 'Stripe' },
  ];

  // Mock Settlements Data
  const settlements = [
    { id: 1, settlementId: 'STL001', tenantName: 'Central Library', date: '2025-10-25', transactions: 45, totalAmount: 135000, gatewayFees: 2673, platformFees: 6750, settlementAmount: 125577, status: 'Completed', scheduledDate: '2025-10-25', actualDate: '2025-10-25', utr: 'UTR2234567890', bankAccount: '****1234', mode: 'Auto' },
    { id: 2, settlementId: 'STL002', tenantName: 'Tech Library', date: '2025-10-28', transactions: 32, totalAmount: 180000, gatewayFees: 3564, platformFees: 9000, settlementAmount: 167436, status: 'Approved', scheduledDate: '2025-10-30', bankAccount: '****5678', mode: 'Auto' },
    { id: 3, settlementId: 'STL003', tenantName: 'Knowledge Hub', date: '2025-10-29', transactions: 28, totalAmount: 95000, gatewayFees: 1881, platformFees: 4750, settlementAmount: 88369, status: 'Processing', scheduledDate: '2025-10-31', bankAccount: '****9012', mode: 'Auto' },
    { id: 4, settlementId: 'STL004', tenantName: 'Elite Study Space', date: '2025-10-30', transactions: 15, totalAmount: 72000, gatewayFees: 1425.60, platformFees: 3600, settlementAmount: 66974.40, status: 'Pending', scheduledDate: '2025-11-01', bankAccount: '****3456', mode: 'Manual' },
  ];

  // Mock Platform Fee Config
  const platformFeeConfigs = [
    { id: 1, tenantName: 'Central Library', feeType: 'Percentage', feeValue: 5, minFee: 50, maxFee: 500, effectiveFrom: '2025-01-01', status: 'Active' },
    { id: 2, tenantName: 'Tech Library', feeType: 'Percentage', feeValue: 5, minFee: 50, maxFee: 500, effectiveFrom: '2025-01-01', status: 'Active' },
    { id: 3, tenantName: 'Knowledge Hub', feeType: 'Flat', feeValue: 100, effectiveFrom: '2025-06-01', status: 'Active' },
    { id: 4, tenantName: 'Study Center', feeType: 'Percentage', feeValue: 4, minFee: 40, maxFee: 400, effectiveFrom: '2025-03-01', status: 'Active' },
    { id: 5, tenantName: 'Wisdom Library', feeType: 'Percentage', feeValue: 5.5, minFee: 55, maxFee: 550, effectiveFrom: '2025-01-01', status: 'Active' },
  ];

  // Mock Gateway Fees
  const gatewayFees = [
    { id: 1, gateway: 'Razorpay', transactionId: 'TXN001234', amount: 3000, percentage: 1.98, fee: 59.40, gst: 10.69, totalFee: 70.09 },
    { id: 2, gateway: 'Razorpay', transactionId: 'TXN001235', amount: 5000, percentage: 1.98, fee: 99, gst: 17.82, totalFee: 116.82 },
    { id: 3, gateway: 'Stripe', transactionId: 'TXN001236', amount: 2500, percentage: 1.98, fee: 49.50, gst: 8.91, totalFee: 58.41 },
    { id: 4, gateway: 'PayU', transactionId: 'TXN001238', amount: 3500, percentage: 1.98, fee: 69.30, gst: 12.47, totalFee: 81.77 },
  ];

  // Mock Reconciliation Data
  const reconciliations = [
    { id: 1, date: '2025-10-25', gateway: 'Razorpay', totalTransactions: 156, totalAmount: 485000, settledAmount: 485000, pendingAmount: 0, discrepancy: 0, status: 'Matched' },
    { id: 2, date: '2025-10-26', gateway: 'Stripe', totalTransactions: 42, totalAmount: 125000, settledAmount: 122000, pendingAmount: 3000, discrepancy: 0, status: 'Pending' },
    { id: 3, date: '2025-10-27', gateway: 'PayU', totalTransactions: 28, totalAmount: 89000, settledAmount: 87500, pendingAmount: 1500, discrepancy: 0, status: 'Pending' },
    { id: 4, date: '2025-10-28', gateway: 'Razorpay', totalTransactions: 189, totalAmount: 625000, settledAmount: 622000, pendingAmount: 3000, discrepancy: 0, status: 'Pending' },
  ];

  // Payment Volume Chart Data
  const volumeData = [
    { date: '25 Oct', volume: 156, amount: 485000 },
    { date: '26 Oct', volume: 142, amount: 425000 },
    { date: '27 Oct', volume: 168, amount: 520000 },
    { date: '28 Oct', volume: 189, amount: 625000 },
    { date: '29 Oct', volume: 152, amount: 475000 },
    { date: '30 Oct', volume: 134, amount: 395000 },
    { date: '31 Oct', volume: 125, amount: 360000 },
  ];

  // Gateway Distribution
  const gatewayDistribution = [
    { name: 'Razorpay', value: 65, amount: 1950000 },
    { name: 'Stripe', value: 20, amount: 600000 },
    { name: 'PayU', value: 10, amount: 300000 },
    { name: 'Others', value: 5, amount: 150000 },
  ];

  const COLORS = ['#2196f3', '#9c27b0', '#4caf50', '#ff9800'];

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success': case 'Completed': case 'Matched': case 'Approved': return 'success';
      case 'Pending': case 'Processing': return 'warning';
      case 'Failed': case 'Mismatch': return 'error';
      case 'Refunded': return 'default';
      default: return 'default';
    }
  };
  
  // Handler Functions
  const handleConfigureFee = (tenant: any) => {
    setSelectedTenant(tenant);
    setCustomFeeConfig({
      tenantId: tenant.id,
      tenantName: tenant.tenantName,
      feeType: tenant.feeType.toLowerCase(),
      feeValue: tenant.feeValue,
      minFee: tenant.minFee || 50,
      maxFee: tenant.maxFee || 500,
      effectiveFrom: tenant.effectiveFrom,
    });
    setFeeDialogOpen(true);
  };
  
  const handleSaveFeeConfig = () => {
    console.log('Saving fee config:', customFeeConfig);
    alert(`Platform fee configured for ${customFeeConfig.tenantName}: ${customFeeConfig.feeType === 'percentage' ? `${customFeeConfig.feeValue}%` : `₹${customFeeConfig.feeValue}`}`);
    setFeeDialogOpen(false);
  };
  
  const handleApproveSettlement = (settlement: any) => {
    setSelectedSettlement(settlement);
    setSettlementDialogOpen(true);
  };
  
  const handleConfirmSettlement = () => {
    console.log('Approving settlement:', selectedSettlement);
    alert(`Settlement ${selectedSettlement.settlementId} approved for ${selectedSettlement.tenantName}. Amount: ₹${selectedSettlement.settlementAmount.toLocaleString()}`);
    setSettlementDialogOpen(false);
    setSelectedSettlement(null);
  };
  
  const handleOpenAutomation = () => {
    setAutomationDialogOpen(true);
  };
  
  const handleSaveAutomation = () => {
    console.log('Saving automation settings:', automationSettings);
    alert(`Settlement automation ${automationSettings.autoSettlement ? 'enabled' : 'disabled'}. Frequency: ${automationSettings.settlementFrequency}`);
    setAutomationDialogOpen(false);
  };

  // Transaction Columns
  const transactionColumns: GridColDef[] = [
    { field: 'transactionId', headerName: 'Transaction ID', width: 130 },
    { field: 'date', headerName: 'Date', width: 110 },
    { field: 'tenantName', headerName: 'Library', width: 150 },
    { field: 'studentName', headerName: 'Student', width: 150 },
    { 
      field: 'amount', 
      headerName: 'Amount', 
      width: 120,
      renderCell: (params) => `₹${params.value.toLocaleString('en-IN')}`
    },
    { 
      field: 'platformFee', 
      headerName: 'Platform Fee', 
      width: 120,
      renderCell: (params) => `₹${params.value.toLocaleString('en-IN')}`
    },
    { 
      field: 'netAmount', 
      headerName: 'Net Amount', 
      width: 130,
      renderCell: (params) => `₹${params.value.toLocaleString('en-IN')}`
    },
    { field: 'method', headerName: 'Method', width: 120 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 110,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={getStatusColor(params.value) as any}
          size="small"
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: () => (
        <Box>
          <Tooltip title="View Details">
            <IconButton size="small" color="primary">
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // Settlement Columns
  const settlementColumns: GridColDef[] = [
    { field: 'settlementId', headerName: 'Settlement ID', width: 130 },
    { field: 'tenantName', headerName: 'Library', width: 150 },
    { field: 'date', headerName: 'Date', width: 110 },
    { field: 'transactions', headerName: 'Txns', width: 80 },
    { 
      field: 'totalAmount', 
      headerName: 'Total', 
      width: 120,
      renderCell: (params) => `₹${(params.value / 100000).toFixed(2)}L`
    },
    { 
      field: 'settlementAmount', 
      headerName: 'Settlement', 
      width: 130,
      renderCell: (params) => `₹${(params.value / 100000).toFixed(2)}L`
    },
    { field: 'mode', headerName: 'Mode', width: 90 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={getStatusColor(params.value) as any}
          size="small"
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <Box>
          {params.row.status === 'Pending' && (
            <Button 
              size="small" 
              variant="contained" 
              color="success"
              onClick={() => handleApproveSettlement(params.row)}
            >
              Approve
            </Button>
          )}
          {params.row.status === 'Approved' && (
            <Button 
              size="small" 
              variant="contained" 
              color="primary"
              onClick={() => handleApproveSettlement(params.row)}
            >
              Process
            </Button>
          )}
          {params.row.status === 'Completed' && (
            <Chip label="Settled" color="success" size="small" />
          )}
        </Box>
      ),
    },
  ];

  // Platform Fee Config Columns
  const feeConfigColumns: GridColDef[] = [
    { field: 'tenantName', headerName: 'Library', width: 180 },
    { 
      field: 'feeType', 
      headerName: 'Fee Type', 
      width: 120,
      renderCell: (params) => (
        <Chip label={params.value} color="primary" size="small" variant="outlined" />
      )
    },
    { 
      field: 'feeValue', 
      headerName: 'Fee Value', 
      width: 120,
      renderCell: (params) => 
        params.row.feeType === 'Percentage' ? `${params.value}%` : `₹${params.value}`
    },
    { 
      field: 'minFee', 
      headerName: 'Min Fee', 
      width: 100,
      renderCell: (params) => params.value ? `₹${params.value}` : '-'
    },
    { 
      field: 'maxFee', 
      headerName: 'Max Fee', 
      width: 100,
      renderCell: (params) => params.value ? `₹${params.value}` : '-'
    },
    { field: 'effectiveFrom', headerName: 'Effective From', width: 130 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 100,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={params.value === 'Active' ? 'success' : 'default'}
          size="small"
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: (params) => (
        <IconButton 
          size="small" 
          color="primary"
          onClick={() => {
            setSelectedTenant(params.row);
            setFeeDialogOpen(true);
          }}
        >
          <Edit fontSize="small" />
        </IconButton>
      ),
    },
  ];

  // Render Transactions Tab
  const renderTransactionsTab = () => (
    <Box>
      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          label="From Date"
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
        />
        <TextField
          label="To Date"
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={selectedStatus}
            label="Status"
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Success">Success</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Failed">Failed</MenuItem>
            <MenuItem value="Refunded">Refunded</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" startIcon={<FilterList />}>
          Apply Filters
        </Button>
        <Button variant="outlined" startIcon={<GetApp />}>
          Export
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Total Transactions</Typography>
              <Typography variant="h4" fontWeight="bold">8</Typography>
              <Typography variant="caption" color="success.main">Today</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Total Amount</Typography>
              <Typography variant="h4" fontWeight="bold">₹34K</Typography>
              <Typography variant="caption" color="text.secondary">Oct 27-31</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Success Rate</Typography>
              <Typography variant="h4" fontWeight="bold" color="success.main">87.5%</Typography>
              <Typography variant="caption" color="success.main">+2.3% vs last week</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Platform Revenue</Typography>
              <Typography variant="h4" fontWeight="bold">₹1,700</Typography>
              <Typography variant="caption" color="text.secondary">Platform fees</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* DataGrid */}
      <Card>
        <CardContent>
          <DataGrid
            rows={transactions}
            columns={transactionColumns}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            pageSizeOptions={[10, 25, 50]}
            checkboxSelection
            disableRowSelectionOnClick
            autoHeight
          />
        </CardContent>
      </Card>
    </Box>
  );

  // Render Settlement Tab
  const renderSettlementTab = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Alert severity="info" sx={{ flex: 1, mr: 2 }}>
          <strong>Auto-Settlement:</strong> {automationSettings.autoSettlement ? 'Enabled' : 'Disabled'}. 
          {automationSettings.autoSettlement && ` Frequency: ${automationSettings.settlementFrequency}.`}
          {automationSettings.approvalRequired && ` Manual approval required above ₹${automationSettings.approvalThreshold.toLocaleString()}.`}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<Settings />}
          onClick={handleOpenAutomation}
        >
          Automation Settings
        </Button>
      </Box>

      {/* Settlement Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Pending Approval</Typography>
              <Typography variant="h4" fontWeight="bold" color="warning.main">1</Typography>
              <Typography variant="caption">₹66,974</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Processing</Typography>
              <Typography variant="h4" fontWeight="bold" color="info.main">1</Typography>
              <Typography variant="caption">₹88,369</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Completed (Today)</Typography>
              <Typography variant="h4" fontWeight="bold" color="success.main">0</Typography>
              <Typography variant="caption">₹0</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Total (This Month)</Typography>
              <Typography variant="h4" fontWeight="bold">₹4.48L</Typography>
              <Typography variant="caption">4 settlements</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Settlement Table */}
      <Card>
        <CardContent>
          <DataGrid
            rows={settlements}
            columns={settlementColumns}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            pageSizeOptions={[10, 25, 50]}
            autoHeight
          />
        </CardContent>
      </Card>
    </Box>
  );

  // Render Gateway Fees Tab
  const renderGatewayFeesTab = () => (
    <Box>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Gateway Fee Breakdown
              </Typography>
              <DataGrid
                rows={gatewayFees}
                columns={[
                  { field: 'gateway', headerName: 'Gateway', width: 120 },
                  { field: 'transactionId', headerName: 'Transaction ID', width: 130 },
                  { 
                    field: 'amount', 
                    headerName: 'Amount', 
                    width: 120,
                    renderCell: (params) => `₹${params.value.toLocaleString('en-IN')}`
                  },
                  { 
                    field: 'percentage', 
                    headerName: 'Rate', 
                    width: 80,
                    renderCell: (params) => `${params.value}%`
                  },
                  { 
                    field: 'fee', 
                    headerName: 'Base Fee', 
                    width: 100,
                    renderCell: (params) => `₹${params.value.toFixed(2)}`
                  },
                  { 
                    field: 'gst', 
                    headerName: 'GST (18%)', 
                    width: 100,
                    renderCell: (params) => `₹${params.value.toFixed(2)}`
                  },
                  { 
                    field: 'totalFee', 
                    headerName: 'Total Fee', 
                    width: 110,
                    renderCell: (params) => (
                      <Typography fontWeight="bold">₹{params.value.toFixed(2)}</Typography>
                    )
                  },
                ]}
                autoHeight
                hideFooter
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Total Gateway Fees</Typography>
              <Typography variant="h4" fontWeight="bold">₹277.31</Typography>
              <Typography variant="caption" color="text.secondary">Last 4 transactions</Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Avg Fee Rate</Typography>
              <Typography variant="h4" fontWeight="bold">1.98%</Typography>
              <Typography variant="caption" color="text.secondary">+ 18% GST</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gateway Comparison */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Gateway Rate Comparison
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold">Razorpay</Typography>
                <Typography variant="h5" color="primary" sx={{ my: 1 }}>1.98%</Typography>
                <Typography variant="caption" color="text.secondary">+ ₹2 per txn</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold">Stripe</Typography>
                <Typography variant="h5" color="primary" sx={{ my: 1 }}>1.98%</Typography>
                <Typography variant="caption" color="text.secondary">International ready</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold">PayU</Typography>
                <Typography variant="h5" color="primary" sx={{ my: 1 }}>1.98%</Typography>
                <Typography variant="caption" color="text.secondary">Multiple options</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold">Cashfree</Typography>
                <Typography variant="h5" color="primary" sx={{ my: 1 }}>1.95%</Typography>
                <Typography variant="caption" color="text.secondary">Lowest fees</Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );

  // Render Platform Fees Tab
  const renderPlatformFeesTab = () => (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        Platform fees are automatically calculated based on configured rules. Set global fees for all libraries or customize per tenant.
      </Alert>

      {/* Global Fee Settings Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Global Platform Fee Settings
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Set default platform fees for all libraries
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              startIcon={<Settings />}
              onClick={() => {
                setCustomFeeConfig({
                  tenantId: 'all',
                  tenantName: 'All Libraries',
                  feeType: 'percentage',
                  feeValue: 5,
                  minFee: 50,
                  maxFee: 500,
                  effectiveFrom: new Date().toISOString().split('T')[0],
                });
                setFeeDialogOpen(true);
              }}
            >
              Set Global Fee
            </Button>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
            <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 2 }}>
              <Typography variant="caption" color="primary.dark">Current Default</Typography>
              <Typography variant="h5" fontWeight="bold" color="primary.dark">5%</Typography>
              <Typography variant="caption" color="primary.dark">Percentage Fee</Typography>
            </Box>
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary">Minimum Fee</Typography>
              <Typography variant="h5" fontWeight="bold">₹50</Typography>
              <Typography variant="caption" color="text.secondary">Per transaction</Typography>
            </Box>
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary">Maximum Fee</Typography>
              <Typography variant="h5" fontWeight="bold">₹500</Typography>
              <Typography variant="caption" color="text.secondary">Per transaction</Typography>
            </Box>
            <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
              <Typography variant="caption" color="success.dark">Active Libraries</Typography>
              <Typography variant="h5" fontWeight="bold" color="success.dark">
                {platformFeeConfigs.length}
              </Typography>
              <Typography variant="caption" color="success.dark">Using platform fees</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Per-Tenant Fee Configuration */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              Per-Tenant Fee Configuration
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Click edit icon to customize fees for specific libraries
            </Typography>
          </Box>
          <DataGrid
            rows={platformFeeConfigs}
            columns={feeConfigColumns}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            pageSizeOptions={[10, 25, 50]}
            autoHeight
          />
        </CardContent>
      </Card>

      {/* Fee Dialog */}
      <Dialog open={feeDialogOpen} onClose={() => setFeeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Platform Fee - {selectedTenant?.tenantName}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Fee Type</InputLabel>
              <Select
                value={selectedTenant?.feeType || 'Percentage'}
                label="Fee Type"
              >
                <MenuItem value="Percentage">Percentage</MenuItem>
                <MenuItem value="Flat">Flat Amount</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Fee Value"
              type="number"
              value={selectedTenant?.feeValue || ''}
              helperText={selectedTenant?.feeType === 'Percentage' ? 'Enter percentage (e.g., 5 for 5%)' : 'Enter flat amount in ₹'}
              sx={{ mb: 2 }}
            />

            {selectedTenant?.feeType === 'Percentage' && (
              <>
                <TextField
                  fullWidth
                  label="Minimum Fee (₹)"
                  type="number"
                  value={selectedTenant?.minFee || ''}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Maximum Fee (₹)"
                  type="number"
                  value={selectedTenant?.maxFee || ''}
                  sx={{ mb: 2 }}
                />
              </>
            )}

            <TextField
              fullWidth
              label="Effective From"
              type="date"
              InputLabelProps={{ shrink: true }}
              defaultValue={selectedTenant?.effectiveFrom || ''}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeeDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setFeeDialogOpen(false)}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  // Render Reconciliation Tab
  const renderReconciliationTab = () => (
    <Box>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Daily Reconciliation
              </Typography>
              <DataGrid
                rows={reconciliations}
                columns={[
                  { field: 'date', headerName: 'Date', width: 120 },
                  { field: 'gateway', headerName: 'Gateway', width: 120 },
                  { field: 'totalTransactions', headerName: 'Txns', width: 90 },
                  { 
                    field: 'totalAmount', 
                    headerName: 'Total', 
                    width: 130,
                    renderCell: (params) => `₹${(params.value / 100000).toFixed(2)}L`
                  },
                  { 
                    field: 'settledAmount', 
                    headerName: 'Settled', 
                    width: 130,
                    renderCell: (params) => `₹${(params.value / 100000).toFixed(2)}L`
                  },
                  { 
                    field: 'pendingAmount', 
                    headerName: 'Pending', 
                    width: 130,
                    renderCell: (params) => `₹${(params.value / 1000).toFixed(1)}K`
                  },
                  { 
                    field: 'status', 
                    headerName: 'Status', 
                    width: 110,
                    renderCell: (params) => (
                      <Chip 
                        label={params.value} 
                        color={getStatusColor(params.value) as any}
                        size="small"
                      />
                    )
                  },
                ]}
                autoHeight
                hideFooter
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Total Matched</Typography>
              <Typography variant="h4" fontWeight="bold" color="success.main">₹4.85L</Typography>
              <Typography variant="caption" color="success.main">100% matched</Typography>
            </CardContent>
          </Card>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Pending Reconciliation</Typography>
              <Typography variant="h4" fontWeight="bold" color="warning.main">₹7.5K</Typography>
              <Typography variant="caption" color="text.secondary">3 transactions</Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Discrepancies</Typography>
              <Typography variant="h4" fontWeight="bold" color="error.main">₹0</Typography>
              <Typography variant="caption" color="success.main">No issues found</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  // Render Analytics Tab
  const renderAnalyticsTab = () => (
    <Box>
      {/* KPIs */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Payment Volume</Typography>
              <Typography variant="h4" fontWeight="bold">1,066</Typography>
              <Typography variant="caption" color="success.main">+12.5% vs last week</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Total Amount</Typography>
              <Typography variant="h4" fontWeight="bold">₹32.5L</Typography>
              <Typography variant="caption" color="success.main">+8.2% growth</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Success Rate</Typography>
              <Typography variant="h4" fontWeight="bold" color="success.main">92.5%</Typography>
              <Typography variant="caption" color="success.main">+1.2% improvement</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Avg Transaction</Typography>
              <Typography variant="h4" fontWeight="bold">₹3,050</Typography>
              <Typography variant="caption" color="text.secondary">Per transaction</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Payment Volume Trend (7 Days)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={volumeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <RechartsTooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="volume" stroke="#2196f3" name="Transactions" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="amount" stroke="#4caf50" name="Amount (₹)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Gateway Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={gatewayDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `${entry.name}: ${entry.value}%`}
                  >
                    {gatewayDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
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
          Complete payment processing, settlements & reconciliation system
        </Typography>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab icon={<Payment />} label="Transactions" iconPosition="start" />
        <Tab icon={<AccountBalance />} label="Settlement" iconPosition="start" />
        <Tab icon={<TrendingUp />} label="Gateway Fees" iconPosition="start" />
        <Tab icon={<Payment />} label="Platform Fees" iconPosition="start" />
        <Tab icon={<CheckCircle />} label="Reconciliation" iconPosition="start" />
        <Tab icon={<TrendingUp />} label="Analytics" iconPosition="start" />
      </Tabs>

      {/* Tab Content */}
      {activeTab === 0 && renderTransactionsTab()}
      {activeTab === 1 && renderSettlementTab()}
      {activeTab === 2 && renderGatewayFeesTab()}
      {activeTab === 3 && renderPlatformFeesTab()}
      {activeTab === 4 && renderReconciliationTab()}
      {activeTab === 5 && renderAnalyticsTab()}
      
      {/* Custom Fee Configuration Dialog */}
      <Dialog open={feeDialogOpen} onClose={() => setFeeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Configure Platform Fee - {customFeeConfig.tenantName}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              Set custom platform fee for this library. Fee will be automatically calculated on each transaction.
            </Alert>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Fee Type</InputLabel>
              <Select
                value={customFeeConfig.feeType}
                label="Fee Type"
                onChange={(e) => setCustomFeeConfig({ ...customFeeConfig, feeType: e.target.value })}
              >
                <MenuItem value="percentage">Percentage (%)</MenuItem>
                <MenuItem value="flat">Flat Amount (₹)</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label={customFeeConfig.feeType === 'percentage' ? 'Fee Percentage' : 'Flat Fee Amount'}
              fullWidth
              type="number"
              value={customFeeConfig.feeValue}
              onChange={(e) => setCustomFeeConfig({ ...customFeeConfig, feeValue: parseFloat(e.target.value) })}
              InputProps={{
                endAdornment: customFeeConfig.feeType === 'percentage' ? '%' : '₹',
              }}
              sx={{ mb: 3 }}
            />
            
            {customFeeConfig.feeType === 'percentage' && (
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                <TextField
                  label="Minimum Fee"
                  type="number"
                  value={customFeeConfig.minFee}
                  onChange={(e) => setCustomFeeConfig({ ...customFeeConfig, minFee: parseFloat(e.target.value) })}
                  InputProps={{ startAdornment: '₹' }}
                />
                <TextField
                  label="Maximum Fee"
                  type="number"
                  value={customFeeConfig.maxFee}
                  onChange={(e) => setCustomFeeConfig({ ...customFeeConfig, maxFee: parseFloat(e.target.value) })}
                  InputProps={{ startAdornment: '₹' }}
                />
              </Box>
            )}
            
            <TextField
              label="Effective From"
              type="date"
              fullWidth
              value={customFeeConfig.effectiveFrom}
              onChange={(e) => setCustomFeeConfig({ ...customFeeConfig, effectiveFrom: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            
            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Example Calculation
              </Typography>
              {customFeeConfig.feeType === 'percentage' ? (
                <Typography variant="body2">
                  On ₹5,000 payment: Platform fee = ₹{Math.min(Math.max((5000 * customFeeConfig.feeValue) / 100, customFeeConfig.minFee), customFeeConfig.maxFee).toFixed(2)}
                </Typography>
              ) : (
                <Typography variant="body2">
                  On any payment: Platform fee = ₹{customFeeConfig.feeValue}
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeeDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveFeeConfig}>Save Configuration</Button>
        </DialogActions>
      </Dialog>
      
      {/* Settlement Approval Dialog */}
      <Dialog open={settlementDialogOpen} onClose={() => setSettlementDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedSettlement?.status === 'Pending' ? 'Approve Settlement' : 'Process Settlement'}
        </DialogTitle>
        <DialogContent>
          {selectedSettlement && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="warning" sx={{ mb: 3 }}>
                {selectedSettlement.status === 'Pending' 
                  ? 'Review and approve this settlement. Once approved, funds will be transferred automatically.'
                  : 'Process this settlement to initiate fund transfer to the library account.'}
              </Alert>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Settlement ID</Typography>
                <Typography variant="body1" fontWeight="bold">{selectedSettlement.settlementId}</Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Library</Typography>
                <Typography variant="body1" fontWeight="bold">{selectedSettlement.tenantName}</Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Bank Account</Typography>
                <Typography variant="body1">{selectedSettlement.bankAccount}</Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Total Amount</Typography>
                  <Typography variant="h6" fontWeight="bold">₹{selectedSettlement.totalAmount.toLocaleString()}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Transactions</Typography>
                  <Typography variant="h6">{selectedSettlement.transactions}</Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Gateway Fees</Typography>
                  <Typography variant="body1" color="error.main">- ₹{selectedSettlement.gatewayFees.toLocaleString()}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Platform Fees</Typography>
                  <Typography variant="body1" color="error.main">- ₹{selectedSettlement.platformFees.toLocaleString()}</Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">Settlement Amount</Typography>
                <Typography variant="h5" fontWeight="bold" color="success.dark">
                  ₹{selectedSettlement.settlementAmount.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettlementDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="success"
            onClick={handleConfirmSettlement}
          >
            {selectedSettlement?.status === 'Pending' ? 'Approve & Process' : 'Process Now'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Automation Settings Dialog */}
      <Dialog open={automationDialogOpen} onClose={() => setAutomationDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Settlement Automation Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              Configure automatic settlement processing rules. Settlements can be fully automated or require manual approval based on your preferences.
            </Alert>
            
            <FormControlLabel
              control={
                <Switch
                  checked={automationSettings.autoSettlement}
                  onChange={(e) => setAutomationSettings({ ...automationSettings, autoSettlement: e.target.checked })}
                />
              }
              label="Enable Automatic Settlement"
              sx={{ mb: 3 }}
            />
            
            {automationSettings.autoSettlement && (
              <Box>
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Settlement Frequency</InputLabel>
                  <Select
                    value={automationSettings.settlementFrequency}
                    label="Settlement Frequency"
                    onChange={(e) => setAutomationSettings({ ...automationSettings, settlementFrequency: e.target.value })}
                  >
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                  </Select>
                </FormControl>
                
                {automationSettings.settlementFrequency === 'weekly' && (
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Settlement Day</InputLabel>
                    <Select
                      value={automationSettings.settlementDay}
                      label="Settlement Day"
                      onChange={(e) => setAutomationSettings({ ...automationSettings, settlementDay: e.target.value })}
                    >
                      <MenuItem value="monday">Monday</MenuItem>
                      <MenuItem value="tuesday">Tuesday</MenuItem>
                      <MenuItem value="wednesday">Wednesday</MenuItem>
                      <MenuItem value="thursday">Thursday</MenuItem>
                      <MenuItem value="friday">Friday</MenuItem>
                    </Select>
                  </FormControl>
                )}
                
                <TextField
                  label="Minimum Amount for Auto-Settlement"
                  fullWidth
                  type="number"
                  value={automationSettings.minimumAmount}
                  onChange={(e) => setAutomationSettings({ ...automationSettings, minimumAmount: parseFloat(e.target.value) })}
                  InputProps={{ startAdornment: '₹' }}
                  helperText="Settlements below this amount will require manual approval"
                  sx={{ mb: 3 }}
                />
                
                <Divider sx={{ my: 3 }} />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={automationSettings.approvalRequired}
                      onChange={(e) => setAutomationSettings({ ...automationSettings, approvalRequired: e.target.checked })}
                    />
                  }
                  label="Require Approval for Large Settlements"
                  sx={{ mb: 2 }}
                />
                
                {automationSettings.approvalRequired && (
                  <TextField
                    label="Approval Threshold"
                    fullWidth
                    type="number"
                    value={automationSettings.approvalThreshold}
                    onChange={(e) => setAutomationSettings({ ...automationSettings, approvalThreshold: parseFloat(e.target.value) })}
                    InputProps={{ startAdornment: '₹' }}
                    helperText="Settlements above this amount will require manual approval"
                  />
                )}
              </Box>
            )}
            
            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Current Configuration
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • Auto Settlement: {automationSettings.autoSettlement ? 'Enabled' : 'Disabled'}
              </Typography>
              {automationSettings.autoSettlement && (
                <>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    • Frequency: {automationSettings.settlementFrequency}
                    {automationSettings.settlementFrequency === 'weekly' && ` (${automationSettings.settlementDay})`}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    • Minimum Amount: ₹{automationSettings.minimumAmount.toLocaleString()}
                  </Typography>
                  {automationSettings.approvalRequired && (
                    <Typography variant="body2">
                      • Approval Required Above: ₹{automationSettings.approvalThreshold.toLocaleString()}
                    </Typography>
                  )}
                </>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAutomationDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveAutomation}>Save Settings</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentManagementPage;

