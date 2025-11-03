import React, { useState, useMemo } from 'react';
import {
  Box, Button, Card, CardContent, Typography, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, FormControl, InputLabel, Select, Checkbox,
  ListItemText, OutlinedInput, CircularProgress, Alert, Snackbar, Tooltip,
  IconButton, InputAdornment, TablePagination, TableSortLabel, Divider,
} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import {
  Add as AddIcon, Payment as PaymentIcon, AccountBalance as BankIcon,
  Money as CashIcon, Edit as EditIcon, Delete as DeleteIcon,
  Search as SearchIcon, FileDownload as ExportIcon,
} from '@mui/icons-material';

const INITIAL_PAYMENTS = [
  { id: 1, studentName: 'Rajesh Kumar', amount: 5000, method: 'cash', plan: 'Monthly Premium', status: 'completed', date: '2025-10-23', receipt: 'RCP001' },
  { id: 2, studentName: 'Priya Sharma', amount: 1500, method: 'online', plan: 'Weekly Plan', status: 'completed', date: '2025-10-23', receipt: 'RCP002' },
  { id: 3, studentName: 'Amit Patel', amount: 300, method: 'cash', plan: 'Daily Plan', status: 'pending', date: '2025-10-22', receipt: '-' },
  { id: 4, studentName: 'Sneha Reddy', amount: 5000, method: 'online', plan: 'Monthly Premium', status: 'completed', date: '2025-10-22', receipt: 'RCP003' },
  { id: 5, studentName: 'Vikram Singh', amount: 1500, method: 'bank', plan: 'Weekly Plan', status: 'completed', date: '2025-10-21', receipt: 'RCP004' },
  { id: 6, studentName: 'Anita Desai', amount: 50, method: 'cash', plan: 'Hourly Plan', status: 'completed', date: '2025-10-21', receipt: 'RCP005' },
];

interface Payment {
  id: number; studentName: string; amount: number; method: string;
  plan: string; status: string; date: string; receipt: string;
}

type SortField = keyof Payment;
type SortOrder = 'asc' | 'desc';

const SubscriptionPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);
  const [currentPayment, setCurrentPayment] = useState<Partial<Payment>>({
    studentName: '', amount: 0, method: 'cash', plan: '', status: 'completed', date: new Date().toISOString().split('T')[0]
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [errors, setErrors] = useState<Partial<Record<keyof Payment, string>>>({});

  const validatePayment = (payment: Partial<Payment>): boolean => {
    const newErrors: Partial<Record<keyof Payment, string>> = {};
    if (!payment.studentName || payment.studentName.trim().length < 2) newErrors.studentName = 'Student name required';
    if (!payment.amount || payment.amount <= 0) newErrors.amount = 'Amount must be greater than 0';
    if (!payment.plan || payment.plan.trim().length < 2) newErrors.plan = 'Plan is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const filteredPayments = useMemo(() => {
    let filtered = payments.filter(payment => {
      const matchesSearch = searchTerm === '' || payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || payment.receipt.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMethod = methodFilter.length === 0 || methodFilter.includes(payment.method);
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(payment.status);
      return matchesSearch && matchesMethod && matchesStatus;
    });
    
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filtered;
  }, [payments, searchTerm, methodFilter, statusFilter, sortField, sortOrder]);

  const paginatedPayments = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredPayments.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredPayments, page, rowsPerPage]);

  const handleOpenDialog = (payment?: Payment) => {
    if (payment) {
      setEditMode(true);
      setCurrentPayment(payment);
    } else {
      setEditMode(false);
      setCurrentPayment({ studentName: '', amount: 0, method: 'cash', plan: '', status: 'completed', date: new Date().toISOString().split('T')[0], receipt: `RCP${String(payments.length + 1).padStart(3, '0')}` });
    }
    setErrors({});
    setDialogOpen(true);
  };

  const handleSavePayment = () => {
    if (!validatePayment(currentPayment)) {
      setSnackbar({ open: true, message: 'Please fix validation errors', severity: 'error' });
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      if (editMode && currentPayment.id) {
        setPayments(payments.map(p => p.id === currentPayment.id ? currentPayment as Payment : p));
        setSnackbar({ open: true, message: 'Payment updated!', severity: 'success' });
      } else {
        const newPayment: Payment = { id: Math.max(...payments.map(p => p.id), 0) + 1, ...currentPayment as Omit<Payment, 'id'> };
        setPayments([...payments, newPayment]);
        setSnackbar({ open: true, message: 'Payment recorded!', severity: 'success' });
      }
      setDialogOpen(false);
      setLoading(false);
    }, 500);
  };

  const handleDeleteClick = (payment: Payment) => {
    setPaymentToDelete(payment);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (paymentToDelete) {
      setLoading(true);
      setTimeout(() => {
        setPayments(payments.filter(p => p.id !== paymentToDelete.id));
        setSnackbar({ open: true, message: 'Revenue deleted!', severity: 'success' });
        setDeleteDialogOpen(false);
        setPaymentToDelete(null);
        setLoading(false);
      }, 500);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Student', 'Plan', 'Amount', 'Method', 'Status', 'Date', 'Receipt'];
    const csvContent = [headers.join(','), ...filteredPayments.map(p => [p.id, p.studentName, p.plan, p.amount, p.method, p.status, p.date, p.receipt].join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    setSnackbar({ open: true, message: 'Payments exported!', severity: 'success' });
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'cash': return 'success';
      case 'online': return 'info';
      case 'bank': return 'warning';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => status === 'completed' ? 'success' : 'warning';
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const todayRevenue = payments.filter(p => p.date === new Date().toISOString().split('T')[0]).reduce((sum, p) => sum + p.amount, 0);
  const cashPayments = payments.filter(p => p.method === 'cash').length;
  const onlinePayments = payments.filter(p => p.method === 'online').length;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Payments Management <Chip label="Enhanced @ 60%" color="primary" size="small" sx={{ ml: 2 }} /></Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<ExportIcon />} onClick={handleExportCSV} disabled={filteredPayments.length === 0}>Export CSV</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>Record Payment</Button>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}><PaymentIcon sx={{ color: 'primary.main', mr: 1 }} /><Typography variant="body2" color="text.secondary">Total Revenue</Typography></Box><Typography variant="h4" color="primary.main">₹{totalRevenue.toLocaleString()}</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}><CashIcon sx={{ color: 'success.main', mr: 1 }} /><Typography variant="body2" color="text.secondary">Today's Revenue</Typography></Box><Typography variant="h4" color="success.main">₹{todayRevenue.toLocaleString()}</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}><CashIcon sx={{ color: 'text.secondary', mr: 1 }} /><Typography variant="body2" color="text.secondary">Cash Payments</Typography></Box><Typography variant="h4">{cashPayments}</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}><BankIcon sx={{ color: 'text.secondary', mr: 1 }} /><Typography variant="body2" color="text.secondary">Online Payments</Typography></Box><Typography variant="h4">{onlinePayments}</Typography></CardContent></Card>
        </Grid>
      </Grid>

      <Card sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField fullWidth placeholder="Search by student name or receipt..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} />
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth>
              <InputLabel>Method</InputLabel>
              <Select multiple value={methodFilter} onChange={(e) => setMethodFilter(e.target.value as string[])} input={<OutlinedInput label="Method" />} renderValue={(selected) => selected.join(', ')}>
                {['cash', 'online', 'bank'].map((method) => (
                  <MenuItem key={method} value={method}>
                    <Checkbox checked={methodFilter.indexOf(method) > -1} />
                    <ListItemText primary={method} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select multiple value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as string[])} input={<OutlinedInput label="Status" />} renderValue={(selected) => selected.join(', ')}>
                {['completed', 'pending'].map((status) => (
                  <MenuItem key={status} value={status}>
                    <Checkbox checked={statusFilter.indexOf(status) > -1} />
                    <ListItemText primary={status} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <Button fullWidth variant="outlined" onClick={() => { setSearchTerm(''); setMethodFilter([]); setStatusFilter([]); }}>Clear Filters</Button>
          </Grid>
        </Grid>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Receipt</TableCell>
              <TableCell><TableSortLabel active={sortField === 'studentName'} direction={sortField === 'studentName' ? sortOrder : 'asc'} onClick={() => handleSort('studentName')}>Student</TableSortLabel></TableCell>
              <TableCell>Plan</TableCell>
              <TableCell><TableSortLabel active={sortField === 'amount'} direction={sortField === 'amount' ? sortOrder : 'asc'} onClick={() => handleSort('amount')}>Amount</TableSortLabel></TableCell>
              <TableCell>Method</TableCell>
              <TableCell>Status</TableCell>
              <TableCell><TableSortLabel active={sortField === 'date'} direction={sortField === 'date' ? sortOrder : 'asc'} onClick={() => handleSort('date')}>Date</TableSortLabel></TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedPayments.map((payment) => (
              <TableRow key={payment.id} hover>
                <TableCell><Chip label={payment.receipt} size="small" variant="outlined" /></TableCell>
                <TableCell>{payment.studentName}</TableCell>
                <TableCell>{payment.plan}</TableCell>
                <TableCell><Typography variant="body2" fontWeight="bold" color="success.main">₹{payment.amount.toLocaleString()}</Typography></TableCell>
                <TableCell><Chip label={payment.method} size="small" color={getMethodColor(payment.method) as any} /></TableCell>
                <TableCell><Chip label={payment.status} size="small" color={getStatusColor(payment.status) as any} /></TableCell>
                <TableCell>{payment.date}</TableCell>
                <TableCell>
                  <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => handleOpenDialog(payment)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDeleteClick(payment)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {paginatedPayments.length === 0 && (<TableRow><TableCell colSpan={8} align="center" sx={{ py: 4 }}><Typography variant="body2" color="text.secondary">No payments found.</Typography></TableCell></TableRow>)}
          </TableBody>
        </Table>
        <TablePagination component="div" count={filteredPayments.length} page={page} onPageChange={(_, newPage) => setPage(newPage)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[5, 10, 25, 50]} />
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Payment' : 'Record Cash Payment'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField label="Student Name" value={currentPayment.studentName} onChange={(e) => setCurrentPayment({ ...currentPayment, studentName: e.target.value })} fullWidth required error={!!errors.studentName} helperText={errors.studentName} />
            <TextField select label="Plan" value={currentPayment.plan} onChange={(e) => setCurrentPayment({ ...currentPayment, plan: e.target.value })} fullWidth required error={!!errors.plan} helperText={errors.plan}>
              <MenuItem value="Hourly Plan">Hourly Plan - ₹50</MenuItem>
              <MenuItem value="Daily Plan">Daily Plan - ₹300</MenuItem>
              <MenuItem value="Weekly Plan">Weekly Plan - ₹1500</MenuItem>
              <MenuItem value="Monthly Premium">Monthly Premium - ₹5000</MenuItem>
            </TextField>
            <TextField label="Amount (₹)" type="number" value={currentPayment.amount} onChange={(e) => setCurrentPayment({ ...currentPayment, amount: Number(e.target.value) })} fullWidth required error={!!errors.amount} helperText={errors.amount} />
            <TextField select label="Payment Method" value={currentPayment.method} onChange={(e) => setCurrentPayment({ ...currentPayment, method: e.target.value })} fullWidth>
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="online">Online</MenuItem>
              <MenuItem value="bank">Bank Transfer</MenuItem>
            </TextField>
            <Divider />
            <Typography variant="caption" color="text.secondary">Receipt: {currentPayment.receipt}</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSavePayment} variant="contained" disabled={loading || !currentPayment.studentName || !currentPayment.plan || !currentPayment.amount} startIcon={loading ? <CircularProgress size={20} /> : null}>
            {editMode ? 'Update' : 'Record'} Payment
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent><Typography>Delete payment <strong>{paymentToDelete?.receipt}</strong> for {paymentToDelete?.studentName}?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={loading} startIcon={loading ? <CircularProgress size={20} /> : null}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default SubscriptionPaymentsPage;

