import Grid from '@mui/material/Grid';
import {
  CardContent,
  Container,
  MenuItem,
  TablePagination,
  Box,
  Typography,
  Card,
  Button,
  TextField,
  Chip,
  LinearProgress,
  Tooltip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
/**
 * Transaction History Page
 * 
 * View and manage credit transaction history
 * Phase 6 - Sprint 4: Credit Management
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { FilterList as FilterIcon,
  ArrowBack as BackIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon } from '@mui/icons-material';
type CreditType = 'usage' | 'refund' | 'bonus' | 'auto_topup';
type CreditTransactionType = 'usage' | 'refund' | 'bonus' | 'auto_topup';
type CreditTransactionStatus = 'pending' | 'completed' | 'failed';

const TransactionHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { transactions } = useAppSelector((state) => state.credit);
  const { items, loading, total, filters } = transactions;

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, [filters]);

  const loadTransactions = () => {
    // dispatch(fetchCreditTransactions(filters));
  };

  const setTransactionFilters = (filters: any) => {
    // TODO: Implement setTransactionFilters
  };

  const clearTransactionFilters = () => {
    // TODO: Implement clearTransactionFilters
  };

  const exportCreditTransactions = () => {
    // TODO: Implement exportCreditTransactions
  };

  const handlePageChange = (_event: unknown, newPage: number) => {
    dispatch(setTransactionFilters({ page: newPage + 1 }));
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(
      setTransactionFilters({
        limit: parseInt(event.target.value, 10),
        page: 1})
    );
  };

  const handleFilterChange = (key: string, value: any) => {
    dispatch(setTransactionFilters({ [key]: value, page: 1 }));
  };

  const handleSearch = () => {
    dispatch(setTransactionFilters({ search: searchTerm, page: 1 }));
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    dispatch(clearTransactionFilters());
  };

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    setExporting(true);
    try {
      await dispatch(exportCreditTransactions({ filters, format })).unwrap();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const getTypeIcon = (type: CreditType) => {
    return type === 'sms' ? '📱' : '💬';
  };

  const getTransactionTypeColor = (type: CreditTransactionType): 'success' | 'error' | 'info' | 'warning' | 'default' => {
    switch (type) {
      case 'purchase':
      case 'auto_topup':
        return 'success';
      case 'usage':
        return 'info';
      case 'refund':
        return 'warning';
      case 'adjustment':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: CreditTransactionStatus): 'success' | 'error' | 'warning' | 'default' => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
      case 'refunded':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Button startIcon={<BackIcon />} onClick={() => navigate('/credits')} sx={{ mb: 2 }}>
            Back to Dashboard
          </Button>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            📜 Transaction History
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View all credit purchases and usage transactions
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Tooltip title="Refresh">
            <IconButton onClick={loadTransactions} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => handleExport('csv')}
            disabled={exporting || items.length === 0}
          >
            {exporting ? 'Exporting...' : 'Export'}
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      {showFilters && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by description, reference..."
                  InputProps={{
                    endAdornment: (
                      <IconButton onClick={handleSearch} size="small">
                        <SearchIcon />
                      </IconButton>
                    )}}
                />
              </Grid>

              <Grid xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={filters.type || 'all'}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    label="Type"
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value="purchase">Purchase</MenuItem>
                    <MenuItem value="usage">Usage</MenuItem>
                    <MenuItem value="refund">Refund</MenuItem>
                    <MenuItem value="adjustment">Adjustment</MenuItem>
                    <MenuItem value="auto_topup">Auto Top-up</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Credit Type</InputLabel>
                  <Select
                    value={filters.creditType || filters.type || 'all'}
                    onChange={(e) => handleFilterChange('creditType', e.target.value)}
                    label="Credit Type"
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="sms">SMS</MenuItem>
                    <MenuItem value="whatsapp">WhatsApp</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status || 'all'}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="failed">Failed</MenuItem>
                    <MenuItem value="refunded">Refunded</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid xs={12} md={2}>
                <Button fullWidth variant="outlined" onClick={handleClearFilters} sx={{ height: 56 }}>
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Transactions Table */}
      <Card>
        {loading && <LinearProgress />}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Credit Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Credits</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="right">Balance After</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">No transactions found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((transaction) => (
                  <TableRow key={transaction.id} hover>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(transaction.createdAt).toLocaleTimeString()}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={(transaction.type || transaction.creditType || 'unknown').replace('_', ' ').toUpperCase()}
                        color={getTransactionTypeColor(transaction.type || transaction.creditType || 'usage')}
                        size="small"
                      />
                    </TableCell>

                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <span>{getTypeIcon(transaction.creditType)}</span>
                        <Typography variant="body2">
                          {transaction.creditType === 'sms' ? 'SMS' : 'WhatsApp'}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">{transaction.description}</Typography>
                      {transaction.reference && (
                        <Typography variant="caption" color="text.secondary">
                          Ref: {transaction.reference}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color={
                          (transaction.type || transaction.creditType) === 'purchase' || (transaction.type || transaction.creditType) === 'auto_topup'
                            ? 'success.main'
                            : 'error.main'
                        }
                      >
                        {(transaction.type || transaction.creditType) === 'purchase' || (transaction.type || transaction.creditType) === 'auto_topup'
                          ? '+'
                          : '-'}
                        {(transaction.credits || transaction.amount || 0).toLocaleString()}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Typography variant="body2">
                        {transaction.amount > 0 ? `₹${transaction.amount.toLocaleString()}` : '-'}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium">
                        {transaction.balanceAfter.toLocaleString()}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={(transaction.status || 'pending').toUpperCase()}
                        color={getStatusColor(transaction.status || 'pending')}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={total}
          page={(filters.page || 1) - 1}
          onPageChange={handlePageChange}
          rowsPerPage={filters.limit || 20}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[10, 20, 50, 100]}
        />
      </Card>

      {/* Summary Card */}
      {items.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Page Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Total Transactions
                </Typography>
                <Typography variant="h6">{items.length}</Typography>
              </Grid>
              <Grid xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Total Credits
                </Typography>
                <Typography variant="h6">
                  {items.reduce((sum, t) => sum + t.credits, 0).toLocaleString()}
                </Typography>
              </Grid>
              <Grid xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Total Amount
                </Typography>
                <Typography variant="h6">
                  ₹{items.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default TransactionHistoryPage;

