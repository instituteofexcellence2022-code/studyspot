/**
 * Invoices Page
 * View and manage billing invoices
 * @author Agent 1 - Senior Full Stack Developer
 */

import React, { useEffect, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Download as DownloadIcon,
  OpenInNew as OpenIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchInvoices } from '../../store/slices/subscriptionSlice';
import { Invoice } from '../../types/subscription';

const InvoicesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { invoices, invoicesLoading, invoicesError } = useAppSelector(
    (state) => state.subscription
  );

  useEffect(() => {
    if (user?.tenantId) {
      dispatch(fetchInvoices({ tenantId: user.tenantId, limit: 100 }));
    }
  }, [dispatch, user]);

  const sortedInvoices = useMemo(() => {
    return [...invoices].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [invoices]);

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'open':
        return 'warning';
      case 'void':
      case 'uncollectible':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleDownload = (invoice: Invoice) => {
    if (invoice.invoice_pdf) {
      window.open(invoice.invoice_pdf, '_blank');
    }
  };

  const handleView = (invoice: Invoice) => {
    if (invoice.hosted_invoice_url) {
      window.open(invoice.hosted_invoice_url, '_blank');
    }
  };

  if (invoicesLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading invoices...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (invoicesError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{invoicesError}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Invoices
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and download your billing history
        </Typography>
      </Box>

      {invoices.length === 0 ? (
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No Invoices Yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your invoices will appear here once you have an active subscription
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Invoice ID</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Period</strong></TableCell>
                <TableCell><strong>Amount</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedInvoices.map((invoice) => (
                <TableRow key={invoice.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      #{invoice.id.substring(0, 12)}...
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {new Date(invoice.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" display="block">
                      {new Date(invoice.period_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {' - '}
                      {new Date(invoice.period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      ${invoice.amount.toFixed(2)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {invoice.currency.toUpperCase()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={invoice.status.toUpperCase()}
                      color={getStatusColor(invoice.status)}
                      size="small"
                    />
                    {invoice.paid_at && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        Paid: {new Date(invoice.paid_at).toLocaleDateString()}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      {invoice.hosted_invoice_url && (
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleView(invoice)}
                          title="View Invoice"
                        >
                          <OpenIcon fontSize="small" />
                        </IconButton>
                      )}
                      {invoice.invoice_pdf && (
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleDownload(invoice)}
                          title="Download PDF"
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Summary */}
      {invoices.length > 0 && (
        <Box sx={{ mt: 3, textAlign: 'right' }}>
          <Typography variant="body2" color="text.secondary">
            Total Invoices: {invoices.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Paid: ${invoices
              .filter(inv => inv.status === 'paid')
              .reduce((sum, inv) => sum + inv.amount, 0)
              .toFixed(2)}
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default React.memo(InvoicesPage);

