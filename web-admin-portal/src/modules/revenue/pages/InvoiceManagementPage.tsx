import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Divider,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Visibility,
  GetApp,
  FilterList,
  Close,
  Receipt,
  CheckCircle,
  Schedule,
  Error as ErrorIcon,
  Cancel,
} from '@mui/icons-material';
import { revenueService } from '../../../services/api/revenue';
import { Invoice } from '../types';
import { useAppDispatch } from '../../../hooks/redux';
import { showError, showSuccess } from '../../../store/slices/uiSlice';

type InvoiceStatus = 'all' | 'paid' | 'pending' | 'overdue' | 'failed' | 'void';

const InvoiceManagementPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [invoices, statusFilter, searchTerm]);

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await revenueService.getInvoices();
      if (response.success && response.data) {
        setInvoices(response.data);
      } else {
        const errorMsg = response.error?.message || 'Failed to fetch invoices.';
        setError(errorMsg);
        dispatch(showError(errorMsg));
      }
    } catch (err: any) {
      const errorMsg = err.message || 'An unexpected error occurred.';
      setError(errorMsg);
      dispatch(showError(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  const filterInvoices = () => {
    let filtered = [...invoices];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((inv) => inv.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(term) ||
          inv.tenantName.toLowerCase().includes(term)
      );
    }

    setFilteredInvoices(filtered);
    setPage(0); // Reset to first page when filters change
  };

  const handleViewDetails = async (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedInvoice(null);
  };

  const handleDownloadPDF = (invoice: Invoice) => {
    // TODO: Implement PDF download
    dispatch(showSuccess(`Downloading invoice ${invoice.invoiceNumber}...`));
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (
    status: string
  ): 'success' | 'warning' | 'error' | 'default' | 'info' => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
      case 'failed':
        return 'error';
      case 'void':
        return 'default';
      default:
        return 'info';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle sx={{ fontSize: 16 }} />;
      case 'pending':
        return <Schedule sx={{ fontSize: 16 }} />;
      case 'overdue':
      case 'failed':
        return <ErrorIcon sx={{ fontSize: 16 }} />;
      case 'void':
        return <Cancel sx={{ fontSize: 16 }} />;
      default:
        return <Receipt sx={{ fontSize: 16 }} />;
    }
  };

  const getStatusCounts = () => {
    return {
      all: invoices.length,
      paid: invoices.filter((inv) => inv.status === 'paid').length,
      pending: invoices.filter((inv) => inv.status === 'pending').length,
      overdue: invoices.filter((inv) => inv.status === 'overdue').length,
      failed: invoices.filter((inv) => inv.status === 'failed').length,
      void: invoices.filter((inv) => inv.status === 'void').length,
    };
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading Invoices...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        <Typography variant="h6">Error Loading Invoices</Typography>
        <Typography>{error}</Typography>
      </Alert>
    );
  }

  const statusCounts = getStatusCounts();
  const paginatedInvoices = filteredInvoices.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Invoice Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and track all invoices for your libraries
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Receipt />} disabled>
          Generate Invoice
        </Button>
      </Box>

      {/* Summary Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        <Paper
          elevation={statusFilter === 'all' ? 3 : 1}
          sx={{
            p: 2,
            cursor: 'pointer',
            border: statusFilter === 'all' ? '2px solid' : '1px solid transparent',
            borderColor: 'primary.main',
          }}
          onClick={() => setStatusFilter('all')}
        >
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Total
          </Typography>
          <Typography variant="h5" fontWeight={600}>
            {statusCounts.all}
          </Typography>
        </Paper>
        <Paper
          elevation={statusFilter === 'paid' ? 3 : 1}
          sx={{
            p: 2,
            cursor: 'pointer',
            border: statusFilter === 'paid' ? '2px solid' : '1px solid transparent',
            borderColor: 'success.main',
          }}
          onClick={() => setStatusFilter('paid')}
        >
          <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
            <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
            <Typography variant="body2" color="text.secondary">
              Paid
            </Typography>
          </Box>
          <Typography variant="h5" fontWeight={600} color="success.main">
            {statusCounts.paid}
          </Typography>
        </Paper>
        <Paper
          elevation={statusFilter === 'pending' ? 3 : 1}
          sx={{
            p: 2,
            cursor: 'pointer',
            border: statusFilter === 'pending' ? '2px solid' : '1px solid transparent',
            borderColor: 'warning.main',
          }}
          onClick={() => setStatusFilter('pending')}
        >
          <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
            <Schedule sx={{ fontSize: 16, color: 'warning.main' }} />
            <Typography variant="body2" color="text.secondary">
              Pending
            </Typography>
          </Box>
          <Typography variant="h5" fontWeight={600} color="warning.main">
            {statusCounts.pending}
          </Typography>
        </Paper>
        <Paper
          elevation={statusFilter === 'overdue' ? 3 : 1}
          sx={{
            p: 2,
            cursor: 'pointer',
            border: statusFilter === 'overdue' ? '2px solid' : '1px solid transparent',
            borderColor: 'error.main',
          }}
          onClick={() => setStatusFilter('overdue')}
        >
          <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
            <ErrorIcon sx={{ fontSize: 16, color: 'error.main' }} />
            <Typography variant="body2" color="text.secondary">
              Overdue
            </Typography>
          </Box>
          <Typography variant="h5" fontWeight={600} color="error.main">
            {statusCounts.overdue}
          </Typography>
        </Paper>
        <Paper
          elevation={statusFilter === 'failed' ? 3 : 1}
          sx={{
            p: 2,
            cursor: 'pointer',
            border: statusFilter === 'failed' ? '2px solid' : '1px solid transparent',
            borderColor: 'error.main',
          }}
          onClick={() => setStatusFilter('failed')}
        >
          <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
            <ErrorIcon sx={{ fontSize: 16, color: 'error.main' }} />
            <Typography variant="body2" color="text.secondary">
              Failed
            </Typography>
          </Box>
          <Typography variant="h5" fontWeight={600} color="error.main">
            {statusCounts.failed}
          </Typography>
        </Paper>
      </Box>

      {/* Invoices Table */}
      <Paper elevation={2}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={600}>
            All Invoices
          </Typography>
          <TextField
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ minWidth: 300 }}
          />
        </Box>
        <DataGrid
          rows={filteredInvoices}
          columns={[
            { field: 'id', headerName: 'Invoice ID', width: 130 },
            { field: 'tenantName', headerName: 'Tenant', width: 200 },
            { field: 'amount', headerName: 'Amount', width: 150, valueFormatter: (params: any) => formatCurrency(params.value as number) },
            { field: 'dueDate', headerName: 'Due Date', width: 150 },
            { 
              field: 'status', 
              headerName: 'Status', 
              width: 130,
              renderCell: (params) => (
                <Chip
                  label={params.value}
                  color={
                    params.value === 'paid' ? 'success' :
                    params.value === 'overdue' ? 'error' :
                    params.value === 'pending' ? 'warning' : 'default'
                  }
                  size="small"
                />
              )
            },
          ]}
          autoHeight
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10, 25, 50]}
          onRowClick={(params) => setSelectedInvoice(params.row)}
        />
      </Paper>
    </Box>
  );
};

export default InvoiceManagementPage;
