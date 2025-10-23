import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, TextField, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Chip, IconButton, TablePagination, InputAdornment, Tabs, Tab, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert, Snackbar,
  FormControl, InputLabel, Select, OutlinedInput, CircularProgress,
  Tooltip, Badge, Menu, ListItemIcon, ListItemText, Switch, FormControlLabel,
  Stepper, Step, StepLabel, alpha, LinearProgress,
} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Add as AddIcon, Search as SearchIcon, FilterList as FilterIcon,
  Payment as PaymentIcon, Receipt as ReceiptIcon, QrCode2 as QrCodeIcon,
  AttachMoney as MoneyIcon, AccountBalance as BankIcon, Money as CashIcon,
  CreditCard as CardIcon, CheckCircle, Pending, Error as ErrorIcon,
  Refresh, MoreVert, Download, Email, WhatsApp, Visibility,
  TrendingUp, TrendingDown, Analytics, CalendarToday, Notifications,
} from '@mui/icons-material';
import InvoiceDialog from '../../components/invoices/InvoiceDialog';
import OfflinePaymentDialog from '../../components/payments/OfflinePaymentDialog';
import PaymentVerificationDialog from '../../components/payments/PaymentVerificationDialog';
import { generatePaymentInvoice, generateReceipt, InvoiceData } from '../../utils/invoiceGenerator';

interface Payment {
  id: string;
  studentName: string;
  studentId: string;
  studentEmail: string;
  studentPhone: string;
  amount: number;
  paymentMethod: 'razorpay' | 'stripe' | 'paypal' | 'cashfree' | 'cash' | 'cheque' | 'bank_transfer' | 'qr_code';
  paymentType: 'online' | 'offline';
  status: 'completed' | 'pending' | 'failed' | 'refunded' | 'verification_pending';
  transactionId?: string;
  referenceNumber?: string;
  chequeNumber?: string;
  chequeDate?: string;
  bankName?: string;
  clearanceStatus?: 'pending' | 'cleared' | 'bounced';
  description: string;
  date: string;
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
}

const MOCK_PAYMENTS: Payment[] = [
  {
    id: '1',
    studentName: 'Rajesh Kumar',
    studentId: 'STU-001',
    studentEmail: 'rajesh@example.com',
    studentPhone: '+91 9876543210',
    amount: 5000,
    paymentMethod: 'razorpay',
    paymentType: 'online',
    status: 'completed',
    transactionId: 'RZP_20251023_001',
    description: 'Monthly Fee - October 2025',
    date: '2025-10-23T10:30:00',
  },
  {
    id: '2',
    studentName: 'Priya Sharma',
    studentId: 'STU-002',
    studentEmail: 'priya@example.com',
    studentPhone: '+91 9876543211',
    amount: 3000,
    paymentMethod: 'cash',
    paymentType: 'offline',
    status: 'verification_pending',
    description: 'Registration Fee',
    date: '2025-10-23T09:15:00',
  },
  {
    id: '3',
    studentName: 'Amit Patel',
    studentId: 'STU-003',
    studentEmail: 'amit@example.com',
    studentPhone: '+91 9876543212',
    amount: 4500,
    paymentMethod: 'cheque',
    paymentType: 'offline',
    status: 'pending',
    chequeNumber: 'CHQ123456',
    chequeDate: '2025-10-25',
    bankName: 'HDFC Bank',
    clearanceStatus: 'pending',
    description: 'Monthly Fee - October 2025',
    date: '2025-10-23T11:00:00',
  },
  {
    id: '4',
    studentName: 'Sneha Reddy',
    studentId: 'STU-004',
    studentEmail: 'sneha@example.com',
    studentPhone: '+91 9876543213',
    amount: 2500,
    paymentMethod: 'qr_code',
    paymentType: 'online',
    status: 'completed',
    transactionId: 'UPI_20251023_002',
    description: 'Late Fee Payment',
    date: '2025-10-23T08:45:00',
  },
  {
    id: '5',
    studentName: 'Vikas Singh',
    studentId: 'STU-005',
    studentEmail: 'vikas@example.com',
    studentPhone: '+91 9876543214',
    amount: 6000,
    paymentMethod: 'stripe',
    paymentType: 'online',
    status: 'failed',
    transactionId: 'STR_20251023_003',
    description: 'Premium Plan - 3 Months',
    date: '2025-10-23T07:30:00',
  },
];

const PaymentsPageComprehensive: React.FC = () => {
  const theme = useTheme();
  const [payments, setPayments] = useState<Payment[]>(MOCK_PAYMENTS);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>(MOCK_PAYMENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tabValue, setTabValue] = useState(0);
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [offlinePaymentOpen, setOfflinePaymentOpen] = useState(false);
  const [verificationPayment, setVerificationPayment] = useState<Payment | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'warning' | 'info' }>({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

  // Filter payments
  useEffect(() => {
    let filtered = payments;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    // Method filter
    if (methodFilter !== 'all') {
      filtered = filtered.filter((p) => p.paymentMethod === methodFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((p) => p.paymentType === typeFilter);
    }

    setFilteredPayments(filtered);
    setPage(0);
  }, [searchTerm, statusFilter, methodFilter, typeFilter, payments]);

  // Calculate analytics
  const analytics = {
    totalRevenue: payments.filter((p) => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
    pendingAmount: payments.filter((p) => p.status === 'pending' || p.status === 'verification_pending').reduce((sum, p) => sum + p.amount, 0),
    failedAmount: payments.filter((p) => p.status === 'failed').reduce((sum, p) => sum + p.amount, 0),
    totalTransactions: payments.length,
    successRate: (payments.filter((p) => p.status === 'completed').length / payments.length) * 100,
    onlinePayments: payments.filter((p) => p.paymentType === 'online').length,
    offlinePayments: payments.filter((p) => p.paymentType === 'offline').length,
  };

  const handleGenerateInvoice = (payment: Payment) => {
    const student = {
      id: payment.studentId,
      firstName: payment.studentName.split(' ')[0],
      lastName: payment.studentName.split(' ').slice(1).join(' '),
      email: payment.studentEmail,
      phone: payment.studentPhone,
    };

    // Map payment status to invoice status
    const mapStatus = (status: Payment['status']): InvoiceData['paymentStatus'] => {
      switch (status) {
        case 'completed':
          return 'paid';
        case 'verification_pending':
          return 'pending';
        case 'failed':
          return 'failed';
        case 'refunded':
          return 'refunded';
        default:
          return status; // 'pending'
      }
    };

    const invoice = payment.status === 'completed'
      ? generateReceipt(
          student,
          [{ description: payment.description, quantity: 1, rate: payment.amount, amount: payment.amount }],
          payment.paymentMethod.toUpperCase()
        )
      : generatePaymentInvoice(student, payment.description, payment.amount, mapStatus(payment.status), payment.paymentMethod.toUpperCase());

    setInvoiceData(invoice);
    setInvoiceOpen(true);
  };

  const handleVerifyPayment = (payment: Payment) => {
    setVerificationPayment(payment);
  };

  const handleApprovePayment = (data: { notes: string; generateReceipt: boolean; sendEmail: boolean }) => {
    if (verificationPayment) {
      setPayments((prev) =>
        prev.map((p) =>
          p.id === verificationPayment.id
            ? { ...p, status: 'completed', verifiedBy: 'Admin', verifiedAt: new Date().toISOString() }
            : p
        )
      );
      setSnackbar({
        open: true,
        message: `✅ Payment verified successfully! ${data.generateReceipt ? 'Receipt generated.' : ''} ${data.sendEmail ? 'Email sent.' : ''}`,
        severity: 'success',
      });
      setVerificationPayment(null);
    }
  };

  const handleRejectPayment = (reason: string) => {
    if (verificationPayment) {
      setPayments((prev) =>
        prev.map((p) =>
          p.id === verificationPayment.id
            ? { ...p, status: 'failed', notes: `Rejected: ${reason}` }
            : p
        )
      );
      setSnackbar({
        open: true,
        message: `❌ Payment rejected: ${reason}`,
        severity: 'error',
      });
      setVerificationPayment(null);
    }
  };

  const handleAddOfflinePayment = (data: any) => {
    const newPayment: Payment = {
      id: `${payments.length + 1}`,
      studentName: data.studentName,
      studentId: data.studentId,
      studentEmail: data.studentEmail,
      studentPhone: data.studentPhone,
      amount: parseFloat(data.amount),
      paymentMethod: data.paymentMethod,
      paymentType: 'offline',
      status: data.requiresVerification ? 'verification_pending' : 'completed',
      description: data.description,
      date: data.transactionDate,
      chequeNumber: data.chequeNumber,
      chequeDate: data.chequeDate,
      bankName: data.bankName,
      referenceNumber: data.referenceNumber,
      notes: data.notes,
    };

    setPayments((prev) => [newPayment, ...prev]);
    setSnackbar({
      open: true,
      message: `✅ Offline payment recorded successfully! ${data.requiresVerification ? 'Pending verification.' : ''}`,
      severity: 'success',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
      case 'verification_pending':
        return 'warning';
      case 'failed':
        return 'error';
      case 'refunded':
        return 'info';
      default:
        return 'default';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <CashIcon />;
      case 'cheque':
        return <BankIcon />;
      case 'bank_transfer':
        return <BankIcon />;
      case 'qr_code':
        return <QrCodeIcon />;
      default:
        return <CardIcon />;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            💰 Payment Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Comprehensive payment tracking and analytics
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<QrCodeIcon />}
            onClick={() => setQrDialogOpen(true)}
          >
            Show QR Code
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOfflinePaymentOpen(true)}>
            Add Offline Payment
          </Button>
        </Box>
      </Box>

      {/* Analytics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), border: `1px solid ${theme.palette.success.main}` }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Revenue
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="success.main">
                    ₹{analytics.totalRevenue.toLocaleString()}
                  </Typography>
                </Box>
                <MoneyIcon sx={{ fontSize: 40, color: 'success.main', opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), border: `1px solid ${theme.palette.warning.main}` }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Pending Amount
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="warning.main">
                    ₹{analytics.pendingAmount.toLocaleString()}
                  </Typography>
                </Box>
                <Pending sx={{ fontSize: 40, color: 'warning.main', opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), border: `1px solid ${theme.palette.info.main}` }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Success Rate
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="info.main">
                    {analytics.successRate.toFixed(1)}%
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, color: 'info.main', opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), border: `1px solid ${theme.palette.primary.main}` }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Transactions
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="primary.main">
                    {analytics.totalTransactions}
                  </Typography>
                </Box>
                <PaymentIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="All Payments" />
          <Tab label={`Online (${analytics.onlinePayments})`} />
          <Tab label={`Offline (${analytics.offlinePayments})`} />
          <Tab label="Verification Queue" />
          <Tab label="Analytics" />
        </Tabs>
      </Card>

      {/* Filters */}
      {tabValue < 4 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by student, ID, transaction..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="verification_pending">Verification Pending</MenuItem>
                    <MenuItem value="failed">Failed</MenuItem>
                    <MenuItem value="refunded">Refunded</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Method</InputLabel>
                  <Select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)} label="Method">
                    <MenuItem value="all">All Methods</MenuItem>
                    <MenuItem value="razorpay">Razorpay</MenuItem>
                    <MenuItem value="stripe">Stripe</MenuItem>
                    <MenuItem value="paypal">PayPal</MenuItem>
                    <MenuItem value="cashfree">Cashfree</MenuItem>
                    <MenuItem value="qr_code">QR Code</MenuItem>
                    <MenuItem value="cash">Cash</MenuItem>
                    <MenuItem value="cheque">Cheque</MenuItem>
                    <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} label="Type">
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value="online">Online</MenuItem>
                    <MenuItem value="offline">Offline</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button fullWidth variant="outlined" startIcon={<FilterIcon />}>
                  More Filters
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Payments Table */}
      {tabValue < 4 && (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                  <TableCell><strong>Student</strong></TableCell>
                  <TableCell><strong>Amount</strong></TableCell>
                  <TableCell><strong>Method</strong></TableCell>
                  <TableCell><strong>Type</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Transaction ID</strong></TableCell>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPayments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((payment) => (
                  <TableRow key={payment.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {payment.studentName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {payment.studentId}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        ₹{payment.amount.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getPaymentMethodIcon(payment.paymentMethod)}
                        <Typography variant="body2">
                          {payment.paymentMethod.replace('_', ' ').toUpperCase()}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={payment.paymentType} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={payment.status.replace('_', ' ')}
                        size="small"
                        color={getStatusColor(payment.status) as any}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {payment.transactionId || payment.chequeNumber || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(payment.date).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Receipt/Invoice">
                        <IconButton size="small" onClick={() => handleGenerateInvoice(payment)}>
                          <ReceiptIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {payment.status === 'verification_pending' && (
                        <Tooltip title="Verify Payment">
                          <IconButton size="small" color="success" onClick={() => handleVerifyPayment(payment)}>
                            <CheckCircle fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPayments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                        No payments found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredPayments.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Card>
      )}

      {/* Analytics Tab */}
      {tabValue === 4 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📊 Payment Analytics Dashboard
                </Typography>
                <Alert severity="info" sx={{ mt: 2 }}>
                  Advanced analytics charts coming soon! This will include revenue trends, payment method breakdown,
                  collection efficiency, and forecasting.
                </Alert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Invoice Dialog */}
      <InvoiceDialog open={invoiceOpen} onClose={() => setInvoiceOpen(false)} invoice={invoiceData} />

      {/* Offline Payment Dialog */}
      <OfflinePaymentDialog
        open={offlinePaymentOpen}
        onClose={() => setOfflinePaymentOpen(false)}
        onSubmit={handleAddOfflinePayment}
      />

      {/* Payment Verification Dialog */}
      <PaymentVerificationDialog
        open={!!verificationPayment}
        onClose={() => setVerificationPayment(null)}
        payment={verificationPayment}
        onApprove={handleApprovePayment}
        onReject={handleRejectPayment}
      />

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onClose={() => setQrDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>QR Code Payment</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <QrCodeIcon sx={{ fontSize: 200, color: 'primary.main' }} />
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Scan to Pay
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Use any UPI app to scan and pay
            </Typography>
            <Alert severity="info" sx={{ mt: 3 }}>
              This is a demo QR code. In production, integrate with your payment gateway to generate dynamic QR codes.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrDialogOpen(false)}>Close</Button>
          <Button variant="contained" startIcon={<Download />}>
            Download QR
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false})}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PaymentsPageComprehensive;

