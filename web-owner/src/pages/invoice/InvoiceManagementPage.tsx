import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, TextField, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Chip, IconButton, TablePagination, InputAdornment, Tabs, Tab, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert, Snackbar,
  FormControl, InputLabel, Select, OutlinedInput, CircularProgress,
  Tooltip, Badge, Menu, ListItemIcon, ListItemText, Switch, FormControlLabel,
  Stepper, Step, StepLabel, alpha, LinearProgress, Avatar,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Add as AddIcon, Search as SearchIcon, FilterList as FilterIcon,
  Receipt as ReceiptIcon, Download as DownloadIcon, Email as EmailIcon,
  Print as PrintIcon, Edit as EditIcon, Delete as DeleteIcon,
  Visibility as ViewIcon, Send as SendIcon, PictureAsPdf as PdfIcon,
  AttachMoney as MoneyIcon, CheckCircle, Pending, Error as ErrorIcon,
  Refresh, MoreVert, TrendingUp, TrendingDown, Analytics, CalendarToday,
  Business as BusinessIcon, Person as PersonIcon, Description as DescriptionIcon,
  Palette as PaletteIcon, ViewModule as TemplateIcon, Settings as SettingsIcon,
  Warning, Notifications, Phone, Message,
} from '@mui/icons-material';

interface Invoice {
  id: string;
  invoiceNumber: string;
  studentName: string;
  studentId: string;
  studentEmail: string;
  studentPhone: string;
  amount: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  issueDate: string;
  description: string;
  items: InvoiceItem[];
  template: string;
  notes?: string;
  paymentMethod?: string;
  paidDate?: string;
  createdBy: string;
  createdAt: string;
  // Enhanced fields for pending payments tracking
  daysOverdue?: number;
  lastReminderSent?: string;
  reminderCount?: number;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  category: string;
}

interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  isDefault: boolean;
  category: 'library' | 'tuition' | 'membership' | 'custom';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  layout: 'modern' | 'classic' | 'minimal' | 'professional';
}

const MOCK_INVOICES: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    studentName: 'Rajesh Kumar',
    studentId: 'STU-001',
    studentEmail: 'rajesh@example.com',
    studentPhone: '+91 9876543210',
    amount: 5000,
    tax: 500,
    total: 5500,
    status: 'paid',
    dueDate: '2024-12-31',
    issueDate: '2024-12-01',
    description: 'Monthly Library Fee - December 2024',
    items: [
      { id: '1', description: 'Monthly Library Access', quantity: 1, rate: 5000, amount: 5000, category: 'Library Fee' }
    ],
    template: 'modern-library',
    notes: 'Thank you for your payment!',
    paymentMethod: 'Cash',
    paidDate: '2024-12-15',
    createdBy: 'Admin',
    createdAt: '2024-12-01T10:00:00',
    daysOverdue: 0,
    reminderCount: 0,
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-002',
    studentName: 'Priya Sharma',
    studentId: 'STU-002',
    studentEmail: 'priya@example.com',
    studentPhone: '+91 9876543211',
    amount: 3000,
    tax: 300,
    total: 3300,
    status: 'sent',
    dueDate: '2024-12-25',
    issueDate: '2024-12-10',
    description: 'Registration Fee',
    items: [
      { id: '1', description: 'Library Registration', quantity: 1, rate: 3000, amount: 3000, category: 'Registration' }
    ],
    template: 'classic-tuition',
    createdBy: 'Admin',
    createdAt: '2024-12-10T14:30:00',
    daysOverdue: 0,
    lastReminderSent: '2024-12-20',
    reminderCount: 1,
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-003',
    studentName: 'Amit Patel',
    studentId: 'STU-003',
    studentEmail: 'amit@example.com',
    studentPhone: '+91 9876543212',
    amount: 1500,
    tax: 150,
    total: 1650,
    status: 'overdue',
    dueDate: '2024-11-30',
    issueDate: '2024-11-15',
    description: 'Late Fee Payment',
    items: [
      { id: '1', description: 'Late Fee Penalty', quantity: 1, rate: 1500, amount: 1500, category: 'Penalty' }
    ],
    template: 'minimal-membership',
    createdBy: 'Admin',
    createdAt: '2024-11-15T09:15:00',
    daysOverdue: 8,
    lastReminderSent: '2024-12-15',
    reminderCount: 3,
  },
  {
    id: '4',
    invoiceNumber: 'INV-2024-004',
    studentName: 'Sneha Gupta',
    studentId: 'STU-004',
    studentEmail: 'sneha@example.com',
    studentPhone: '+91 9876543213',
    amount: 4000,
    tax: 400,
    total: 4400,
    status: 'sent',
    dueDate: '2024-12-20',
    issueDate: '2024-12-05',
    description: 'Monthly Library Fee - December 2024',
    items: [
      { id: '1', description: 'Monthly Library Access', quantity: 1, rate: 4000, amount: 4000, category: 'Library Fee' }
    ],
    template: 'modern-library',
    createdBy: 'Admin',
    createdAt: '2024-12-05T11:00:00',
    daysOverdue: 0,
    reminderCount: 0,
  },
  {
    id: '5',
    invoiceNumber: 'INV-2024-005',
    studentName: 'Vikram Singh',
    studentId: 'STU-005',
    studentEmail: 'vikram@example.com',
    studentPhone: '+91 9876543214',
    amount: 6000,
    tax: 600,
    total: 6600,
    status: 'overdue',
    dueDate: '2024-11-25',
    issueDate: '2024-11-10',
    description: 'Quarterly Fee - Q4 2024',
    items: [
      { id: '1', description: 'Quarterly Library Access', quantity: 1, rate: 6000, amount: 6000, category: 'Library Fee' }
    ],
    template: 'classic-tuition',
    createdBy: 'Admin',
    createdAt: '2024-11-10T16:30:00',
    daysOverdue: 12,
    lastReminderSent: '2024-12-10',
    reminderCount: 2,
  },
];

const INVOICE_TEMPLATES: InvoiceTemplate[] = [
  {
    id: 'modern-library',
    name: 'Modern Library',
    description: 'Clean, modern design perfect for library services',
    preview: 'Modern layout with library branding',
    isDefault: true,
    category: 'library',
    colors: { primary: '#1976d2', secondary: '#42a5f5', accent: '#90caf9' },
    layout: 'modern',
  },
  {
    id: 'classic-tuition',
    name: 'Classic Tuition',
    description: 'Traditional design for educational institutions',
    preview: 'Classic layout with formal styling',
    isDefault: false,
    category: 'tuition',
    colors: { primary: '#2e7d32', secondary: '#4caf50', accent: '#81c784' },
    layout: 'classic',
  },
  {
    id: 'minimal-membership',
    name: 'Minimal Membership',
    description: 'Simple, clean design for membership fees',
    preview: 'Minimal layout with essential information',
    isDefault: false,
    category: 'membership',
    colors: { primary: '#424242', secondary: '#757575', accent: '#bdbdbd' },
    layout: 'minimal',
  },
  {
    id: 'professional-custom',
    name: 'Professional Custom',
    description: 'Professional design for custom services',
    preview: 'Professional layout with custom branding',
    isDefault: false,
    category: 'custom',
    colors: { primary: '#d32f2f', secondary: '#f44336', accent: '#ef5350' },
    layout: 'professional',
  },
];

const InvoiceManagementPage: React.FC = () => {
  const theme = useTheme();
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [templateFilter, setTemplateFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tabValue, setTabValue] = useState(0);
  const [createInvoiceOpen, setCreateInvoiceOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'warning' | 'info' }>({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

  // Filter invoices
  useEffect(() => {
    let filtered = invoices;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inv.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inv.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inv.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((inv) => inv.status === statusFilter);
    }

    // Template filter
    if (templateFilter !== 'all') {
      filtered = filtered.filter((inv) => inv.template === templateFilter);
    }

    setFilteredInvoices(filtered);
    setPage(0);
  }, [searchTerm, statusFilter, templateFilter, invoices]);

  // Calculate analytics
  const analytics = {
    totalInvoices: invoices.length,
    totalAmount: invoices.reduce((sum, inv) => sum + inv.total, 0),
    paidAmount: invoices.filter((inv) => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0),
    pendingAmount: invoices.filter((inv) => inv.status === 'sent').reduce((sum, inv) => sum + inv.total, 0),
    overdueAmount: invoices.filter((inv) => inv.status === 'overdue').reduce((sum, inv) => sum + inv.total, 0),
    collectionRate: (invoices.filter((inv) => inv.status === 'paid').length / invoices.length) * 100,
    avgPaymentValue: invoices.length > 0 ? invoices.reduce((sum, inv) => sum + inv.total, 0) / invoices.length : 0,
    growthRate: 15.3, // Mock growth rate
  };

  const handleCreateInvoice = () => {
    setCreateInvoiceOpen(true);
  };

  const handlePreviewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPreviewDialogOpen(true);
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    // Simulate download
    setSnackbar({
      open: true,
      message: `Invoice ${invoice.invoiceNumber} downloaded successfully!`,
      severity: 'success',
    });
  };

  const handleSendInvoice = (invoice: Invoice) => {
    // Simulate sending
    setInvoices(prev => prev.map(inv => 
      inv.id === invoice.id ? { ...inv, status: 'sent' as const } : inv
    ));
    setSnackbar({
      open: true,
      message: `Invoice ${invoice.invoiceNumber} sent successfully!`,
      severity: 'success',
    });
  };

  const handleDeleteInvoice = (invoice: Invoice) => {
    if (window.confirm(`Are you sure you want to delete invoice ${invoice.invoiceNumber}?`)) {
      setInvoices(prev => prev.filter(inv => inv.id !== invoice.id));
      setSnackbar({
        open: true,
        message: `Invoice ${invoice.invoiceNumber} deleted successfully!`,
        severity: 'success',
      });
    }
  };

  // Send reminder functionality
  const handleSendReminder = (invoice: Invoice, method: 'email' | 'sms' | 'whatsapp' | 'phone') => {
    console.log(`Sending ${method} reminder to ${invoice.studentName}`);
    // Simulate sending reminder
    const updatedInvoices = invoices.map(inv =>
      inv.id === invoice.id
        ? { 
            ...inv, 
            lastReminderSent: new Date().toISOString(), 
            reminderCount: (inv.reminderCount || 0) + 1 
          }
        : inv
    );
    setInvoices(updatedInvoices);
    setSnackbar({
      open: true,
      message: `${method.toUpperCase()} reminder sent to ${invoice.studentName}!`,
      severity: 'success',
    });
  };

  // Calculate days overdue
  const calculateDaysOverdue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'sent':
        return 'info';
      case 'overdue':
        return 'error';
      case 'draft':
        return 'warning';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle />;
      case 'sent':
        return <SendIcon />;
      case 'overdue':
        return <ErrorIcon />;
      case 'draft':
        return <EditIcon />;
      case 'cancelled':
        return <DeleteIcon />;
      default:
        return <Pending />;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            💰 Pending Payments Tracking
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track payments, send reminders, and manage outstanding dues
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<EmailIcon />}
            onClick={() => setTemplateDialogOpen(true)}
          >
            Send Reminders
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateInvoice}>
            Record Payment
          </Button>
        </Box>
      </Box>

      {/* Analytics Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
          <Card sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), border: `1px solid ${theme.palette.primary.main}` }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Transactions
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="primary.main">
                    {analytics.totalInvoices}
                  </Typography>
                </Box>
                <ReceiptIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
          <Card sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), border: `1px solid ${theme.palette.success.main}` }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Amount
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="success.main">
                    ₹{analytics.totalAmount.toLocaleString()}
                  </Typography>
                </Box>
                <MoneyIcon sx={{ fontSize: 40, color: 'success.main', opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
          <Card sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), border: `1px solid ${theme.palette.info.main}` }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Collection Rate
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="info.main">
                    {analytics.collectionRate.toFixed(1)}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Avg: ₹{analytics.avgPaymentValue.toLocaleString()}
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, color: 'info.main', opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
          <Card sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), border: `1px solid ${theme.palette.warning.main}` }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Outstanding Dues
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="warning.main">
                    ₹{analytics.overdueAmount.toLocaleString()}
                  </Typography>
                </Box>
                <ErrorIcon sx={{ fontSize: 40, color: 'warning.main', opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="All Payments" />
          <Tab label={`Paid (${invoices.filter(inv => inv.status === 'paid').length})`} />
          <Tab label={`Pending (${invoices.filter(inv => inv.status === 'sent').length})`} />
          <Tab label={`Overdue (${invoices.filter(inv => inv.status === 'overdue').length})`} />
          <Tab label="Reminders" />
        </Tabs>
      </Card>

      {/* Filters */}
      {tabValue < 4 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by payment ID, student, amount..."
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
              </Box>
              <Box sx={{ flex: '1 1 150px', minWidth: '150px' }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="sent">Sent</MenuItem>
                    <MenuItem value="paid">Paid</MenuItem>
                    <MenuItem value="overdue">Overdue</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: '1 1 150px', minWidth: '150px' }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Payment Method</InputLabel>
                  <Select value={templateFilter} onChange={(e) => setTemplateFilter(e.target.value)} label="Payment Method">
                    <MenuItem value="all">All Methods</MenuItem>
                    <MenuItem value="cash">Cash</MenuItem>
                    <MenuItem value="online">Online</MenuItem>
                    <MenuItem value="cheque">Cheque</MenuItem>
                    <MenuItem value="upi">UPI</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: '1 1 150px', minWidth: '150px' }}>
                <Button fullWidth variant="outlined" startIcon={<FilterIcon />}>
                  More Filters
                </Button>
              </Box>
            </Box>
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
                  <TableCell><strong>Payment #</strong></TableCell>
                  <TableCell><strong>Student</strong></TableCell>
                  <TableCell><strong>Amount</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Due Date</strong></TableCell>
                  <TableCell><strong>Overdue</strong></TableCell>
                  <TableCell><strong>Reminders</strong></TableCell>
                  <TableCell><strong>Method</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredInvoices.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((invoice) => {
                  const daysOverdue = calculateDaysOverdue(invoice.dueDate);
                  return (
                    <TableRow 
                      key={invoice.id} 
                      hover
                      sx={{
                        bgcolor: daysOverdue > 7
                          ? alpha(theme.palette.error.main, 0.05)
                          : daysOverdue > 0
                          ? alpha(theme.palette.warning.main, 0.05)
                          : 'inherit'
                      }}
                    >
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {invoice.invoiceNumber}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(invoice.issueDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {invoice.studentName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {invoice.studentId}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>
                          ₹{invoice.total.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Tax: ₹{invoice.tax.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(invoice.status)}
                          label={invoice.status.toUpperCase()}
                          size="small"
                          color={getStatusColor(invoice.status) as any}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(invoice.dueDate).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {daysOverdue > 0 ? (
                          <Chip
                            label={`${daysOverdue} days`}
                            size="small"
                            color={daysOverdue > 7 ? 'error' : 'warning'}
                          />
                        ) : (
                          <Chip
                            label="On time"
                            size="small"
                            color="success"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Badge badgeContent={invoice.reminderCount || 0} color="primary">
                            <Notifications fontSize="small" />
                          </Badge>
                          {invoice.lastReminderSent && (
                            <Typography variant="caption" color="text.secondary">
                              {new Date(invoice.lastReminderSent).toLocaleDateString()}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={invoice.paymentMethod || 'Cash'}
                          size="small"
                          variant="outlined"
                          color={invoice.paymentMethod === 'online' ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => handlePreviewInvoice(invoice)}>
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download Receipt">
                            <IconButton size="small" onClick={() => handleDownloadInvoice(invoice)}>
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                            <>
                              <Tooltip title="Send Email Reminder">
                                <IconButton 
                                  size="small" 
                                  color="primary" 
                                  onClick={() => handleSendReminder(invoice, 'email')}
                                >
                                  <EmailIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Send SMS">
                                <IconButton 
                                  size="small" 
                                  color="primary" 
                                  onClick={() => handleSendReminder(invoice, 'sms')}
                                >
                                  <Message fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Call Student">
                                <IconButton 
                                  size="small" 
                                  color="primary" 
                                  onClick={() => handleSendReminder(invoice, 'phone')}
                                >
                                  <Phone fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => handleDeleteInvoice(invoice)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredInvoices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
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
            count={filteredInvoices.length}
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

      {/* Reminders Tab */}
      {tabValue === 4 && (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              📧 Payment Reminders
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Send automated reminders for pending and overdue payments
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
              <Button
                variant="contained"
                startIcon={<EmailIcon />}
                color="primary"
                onClick={() => {
                  // Send email reminders to all pending payments
                  const pendingPayments = invoices.filter(inv => inv.status === 'sent');
                  pendingPayments.forEach(payment => {
                    handleSendReminder(payment, 'email');
                  });
                  setSnackbar({
                    open: true,
                    message: `Email reminders sent to ${pendingPayments.length} pending payments!`,
                    severity: 'success',
                  });
                }}
              >
                Send Email to All Pending
              </Button>
              <Button
                variant="contained"
                startIcon={<Message />}
                color="info"
                onClick={() => {
                  // Send SMS reminders to all pending payments
                  const pendingPayments = invoices.filter(inv => inv.status === 'sent');
                  pendingPayments.forEach(payment => {
                    handleSendReminder(payment, 'sms');
                  });
                  setSnackbar({
                    open: true,
                    message: `SMS reminders sent to ${pendingPayments.length} pending payments!`,
                    severity: 'success',
                  });
                }}
              >
                Send SMS to All Pending
              </Button>
              <Button
                variant="contained"
                startIcon={<SendIcon />}
                color="error"
                onClick={() => {
                  // Send urgent reminders to overdue payments
                  const overduePayments = invoices.filter(inv => inv.status === 'overdue');
                  overduePayments.forEach(payment => {
                    handleSendReminder(payment, 'email');
                  });
                  setSnackbar({
                    open: true,
                    message: `Urgent reminders sent to ${overduePayments.length} overdue payments!`,
                    severity: 'warning',
                  });
                }}
              >
                Send to All Overdue
              </Button>
              <Button
                variant="outlined"
                startIcon={<SettingsIcon />}
                onClick={() => setTemplateDialogOpen(true)}
              >
                Configure Reminders
              </Button>
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Reminder Settings:</strong> Configure automatic reminder schedules, 
                email templates, and escalation rules for better payment collection.
              </Typography>
            </Alert>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Card variant="outlined" sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Pending Reminders
                  </Typography>
                  <Typography variant="h4" color="info.main" fontWeight={700}>
                    {invoices.filter(inv => inv.status === 'sent').length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Payments awaiting reminders
                  </Typography>
                </CardContent>
              </Card>
              
              <Card variant="outlined" sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Overdue Reminders
                  </Typography>
                  <Typography variant="h4" color="error.main" fontWeight={700}>
                    {invoices.filter(inv => inv.status === 'overdue').length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Payments requiring urgent action
                  </Typography>
                </CardContent>
              </Card>
              
              <Card variant="outlined" sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Reminder Success Rate
                  </Typography>
                  <Typography variant="h4" color="success.main" fontWeight={700}>
                    85%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Payments collected after reminders
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Record Payment Dialog */}
      <Dialog open={createInvoiceOpen} onClose={() => setCreateInvoiceOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Record New Payment</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Payment recording form will be implemented here with student selection, amount entry, and payment method selection.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            This will include:
            <br />• Student selection and details
            <br />• Payment amount and description
            <br />• Payment method selection (Cash, Online, UPI, Cheque)
            <br />• Due date and reminder settings
            <br />• Receipt generation
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateInvoiceOpen(false)}>Cancel</Button>
          <Button variant="contained">Record Payment</Button>
        </DialogActions>
      </Dialog>

      {/* Reminder Configuration Dialog */}
      <Dialog open={templateDialogOpen} onClose={() => setTemplateDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Reminder Configuration</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Reminder configuration interface will be implemented here with automated scheduling and template management.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            This will include:
            <br />• Automated reminder schedules
            <br />• Email and SMS templates
            <br />• Escalation rules for overdue payments
            <br />• Reminder frequency settings
            <br />• Success tracking and analytics
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Payment Details Dialog */}
      <Dialog open={previewDialogOpen} onClose={() => setPreviewDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Payment Details - {selectedInvoice?.invoiceNumber}</DialogTitle>
        <DialogContent>
          {selectedInvoice && (
            <Box sx={{ p: 3, border: '1px solid #ddd', borderRadius: 2, bgcolor: 'white' }}>
              <Typography variant="h6" gutterBottom>
                Payment Details - {selectedInvoice.invoiceNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Student: {selectedInvoice.studentName} ({selectedInvoice.studentId})
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Amount: ₹{selectedInvoice.total.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Status: {selectedInvoice.status.toUpperCase()}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Due Date: {new Date(selectedInvoice.dueDate).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This is a detailed view of the payment record with all relevant information.
                Full payment details with proper formatting will be implemented here.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
          <Button variant="contained" startIcon={<DownloadIcon />}>Download Receipt</Button>
          {selectedInvoice?.status === 'sent' && (
            <Button variant="contained" startIcon={<EmailIcon />}>Send Reminder</Button>
          )}
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

export default InvoiceManagementPage;
