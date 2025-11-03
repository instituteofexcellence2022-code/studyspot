import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  GridLegacy as Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { showInfo, showError } from '../../utils/toast';
import {
  Download as DownloadIcon,
  CreditCard as CreditCardIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchInvoices,
} from '../../store/slices/subscriptionSlice';
import { InvoiceStatus, PaymentMethod } from '../../types';
import { format } from 'date-fns';

/**
 * Billing Page Component
 * View payment history, manage payment methods, download invoices
 */
const BillingPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Redux state
  const {
    invoices,
    invoicesLoading,
    invoicesError,
  } = useAppSelector((state) => state.subscription);
  const { user } = useAppSelector((state) => state.auth);
  
  // Mock payment methods until implemented
  const paymentMethods: PaymentMethod[] = [];
  const paymentMethodsLoading = false;
  const paymentMethodsError = null;

  // Local state
  const [addPaymentMethodOpen, setAddPaymentMethodOpen] = useState(false);

  // Load data on mount
  useEffect(() => {
    if (user?.tenantId) {
      dispatch(fetchInvoices({ tenantId: user.tenantId, limit: 10 }));
    }
    // dispatch(fetchPaymentMethods()); // TODO: Implement when slice is ready
  }, [dispatch]);

  // Handle download invoice
  const handleDownloadInvoice = async (id: string) => {
    try {
      // await dispatch(downloadInvoicePdf(id)).unwrap();
      // TODO: Implement when downloadInvoicePdf is added to slice
      showInfo('Invoice download will be available after backend integration');
    } catch (error) {
      showError('Failed to download invoice');
    }
  };

  // Handle delete payment method
  const handleDeletePaymentMethod = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this payment method?')) {
      try {
        // await dispatch(deletePaymentMethod(id)).unwrap();
        // TODO: Implement when deletePaymentMethod is added to slice
        showInfo('Payment method deletion will be available after backend integration');
      } catch (error) {
        showError('Failed to delete payment method');
      }
    }
  };

  // Handle set default payment method
  const handleSetDefaultPaymentMethod = async (id: string) => {
    try {
      // await dispatch(setDefaultPaymentMethod(id)).unwrap();
      // TODO: Implement when setDefaultPaymentMethod is added to slice
      showInfo('Set default payment method will be available after backend integration');
    } catch (error) {
      showError('Failed to set default payment method');
    }
  };

  // Get invoice status color
  const getInvoiceStatusColor = (status: InvoiceStatus) => {
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

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  // Get card brand icon
  const getCardBrandIcon = (brand: string) => {
    // You could replace this with actual card brand icons
    return brand.toUpperCase();
  };

  // Render payment method card
  const renderPaymentMethodCard = (method: PaymentMethod) => {
    const isCard = method.type === 'card' && method.card;
    const isBankAccount = method.type === 'bank_account' && method.bankAccount;

    return (
      <Card
        key={method.id}
        sx={{
          border: method.isDefault ? 2 : 1,
          borderColor: method.isDefault ? 'primary.main' : 'divider',
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CreditCardIcon fontSize="large" color="primary" />
              <Box>
                {isCard && (
                  <>
                    <Typography variant="body1" fontWeight="medium">
                      {getCardBrandIcon(method.card!.brand)} •••• {method.card!.last4}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Expires {method.card!.expMonth}/{method.card!.expYear}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {method.card!.holderName}
                    </Typography>
                  </>
                )}
                {isBankAccount && (
                  <>
                    <Typography variant="body1" fontWeight="medium">
                      {method.bankAccount!.bankName} •••• {method.bankAccount!.last4}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {method.bankAccount!.accountType}
                    </Typography>
                  </>
                )}
              </Box>
            </Box>
            <Box>
              {method.isDefault ? (
                <Chip
                  icon={<StarIcon />}
                  label="Default"
                  color="primary"
                  size="small"
                  sx={{ mb: 1 }}
                />
              ) : (
                <Button
                  size="small"
                  onClick={() => handleSetDefaultPaymentMethod(method.id)}
                >
                  Set as Default
                </Button>
              )}
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDeletePaymentMethod(method.id)}
                disabled={method.isDefault}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Billing & Payments
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage payment methods and view billing history
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Payment Methods Section */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                  Payment Methods
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setAddPaymentMethodOpen(true)}
                >
                  Add Payment Method
                </Button>
              </Box>

              {paymentMethodsLoading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : paymentMethodsError ? (
                <Alert severity="error">{paymentMethodsError}</Alert>
              ) : paymentMethods.length === 0 ? (
                <Alert severity="info">No payment methods added yet.</Alert>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {paymentMethods.map((method) => renderPaymentMethodCard(method))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Payment History Section */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Payment History
              </Typography>

              {invoicesLoading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : invoicesError ? (
                <Alert severity="error">{invoicesError}</Alert>
              ) : invoices.length === 0 ? (
                <Alert severity="info">No invoices yet.</Alert>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Invoice #</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {invoice.id}
                            </Typography>
                          </TableCell>
                          <TableCell>{formatDate((invoice as any).created_at || new Date().toISOString())}</TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              ${((invoice as any).amount_due || 0).toFixed(2)} {((invoice as any).currency || 'USD').toUpperCase()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={invoice.status}
                              color={getInvoiceStatusColor(invoice.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => handleDownloadInvoice(invoice.id)}
                              title="Download PDF"
                            >
                              <DownloadIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Payment Method Dialog */}
      <Dialog
        open={addPaymentMethodOpen}
        onClose={() => setAddPaymentMethodOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Payment Method</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            In production, this would integrate with Stripe or another payment processor
            for secure card entry.
          </Alert>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Payment method integration coming soon...
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddPaymentMethodOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setAddPaymentMethodOpen(false)}>
            Add Method
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BillingPage;

