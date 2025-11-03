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
  Switch,
  FormControlLabel,
  Divider,
  Card,
  CardContent,
  CardActions,
  LinearProgress,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  CheckCircle,
  Error as ErrorIcon,
  Science,
  Close,
  CreditCard,
  AccountBalance as BankIcon,
  Payment,
  PhoneAndroid,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { PaymentGateway } from '../types';
import { useAppDispatch } from '../../../hooks/redux';
import { showError, showSuccess } from '../../../store/slices/uiSlice';

// Mock data for payment gateways
const MOCK_GATEWAYS: PaymentGateway[] = [
  {
    id: '1',
    name: 'Razorpay',
    type: 'credit_card',
    status: 'active',
    mode: 'production',
    apiKey: 'rzp_live_xxxxxxxxxxxx',
    webhookUrl: 'https://api.studyspot.com/webhooks/razorpay',
    currency: '₹',
    transactionFee: 2.0,
    successRate: 98.5,
    totalProcessed: 1250000,
    failedTransactions: 23,
    lastTransaction: '2024-10-30T10:30:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-10-30T10:30:00Z',
  },
  {
    id: '2',
    name: 'UPI Gateway',
    type: 'bank_transfer',
    status: 'active',
    mode: 'production',
    apiKey: 'upi_live_xxxxxxxxxxxx',
    webhookUrl: 'https://api.studyspot.com/webhooks/upi',
    currency: '₹',
    transactionFee: 0.5,
    successRate: 99.2,
    totalProcessed: 850000,
    failedTransactions: 8,
    lastTransaction: '2024-10-30T11:15:00Z',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-10-30T11:15:00Z',
  },
  {
    id: '3',
    name: 'PayPal India',
    type: 'paypal',
    status: 'inactive',
    mode: 'test',
    apiKey: 'paypal_test_xxxxxxxxxxxx',
    webhookUrl: 'https://api.studyspot.com/webhooks/paypal',
    currency: '₹',
    transactionFee: 3.5,
    successRate: 95.0,
    totalProcessed: 45000,
    failedTransactions: 12,
    lastTransaction: '2024-10-25T14:20:00Z',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-10-25T14:20:00Z',
  },
  {
    id: '4',
    name: 'Net Banking',
    type: 'bank_transfer',
    status: 'testing',
    mode: 'test',
    apiKey: 'netbank_test_xxxxxxxxxxxx',
    webhookUrl: 'https://api.studyspot.com/webhooks/netbanking',
    currency: '₹',
    transactionFee: 1.0,
    successRate: 0,
    totalProcessed: 0,
    failedTransactions: 0,
    createdAt: '2024-10-15T00:00:00Z',
    updatedAt: '2024-10-15T00:00:00Z',
  },
];

const PaymentMethodsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingGateway, setEditingGateway] = useState<PaymentGateway | null>(null);
  const [testingGateway, setTestingGateway] = useState<string | null>(null);

  useEffect(() => {
    fetchGateways();
  }, []);

  const fetchGateways = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setGateways(MOCK_GATEWAYS);
    } catch (err: any) {
      const errorMsg = err.message || 'An unexpected error occurred.';
      setError(errorMsg);
      dispatch(showError(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGateway = () => {
    setEditingGateway(null);
    setOpenDialog(true);
  };

  const handleEditGateway = (gateway: PaymentGateway) => {
    setEditingGateway(gateway);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingGateway(null);
  };

  const handleSaveGateway = () => {
    dispatch(
      showSuccess(editingGateway ? 'Gateway updated successfully!' : 'Gateway created successfully!')
    );
    handleCloseDialog();
    fetchGateways();
  };

  const handleDeleteGateway = (gatewayId: string) => {
    dispatch(showSuccess('Gateway deleted successfully!'));
    fetchGateways();
  };

  const handleTestConnection = async (gatewayId: string) => {
    setTestingGateway(gatewayId);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      dispatch(showSuccess('Connection test successful!'));
    } catch (err) {
      dispatch(showError('Connection test failed!'));
    } finally {
      setTestingGateway(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'active':
        return 'success';
      case 'testing':
        return 'warning';
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'credit_card':
        return <CreditCard />;
      case 'bank_transfer':
        return <BankIcon />;
      case 'paypal':
        return <Payment />;
      default:
        return <PhoneAndroid />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading Payment Gateways...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        <Typography variant="h6">Error Loading Payment Gateways</Typography>
        <Typography>{error}</Typography>
      </Alert>
    );
  }

  const activeGateways = gateways.filter((g) => g.status === 'active').length;
  const totalProcessed = gateways.reduce((sum, g) => sum + g.totalProcessed, 0);
  const avgSuccessRate =
    gateways.reduce((sum, g) => sum + g.successRate, 0) / gateways.length || 0;
  const totalFailed = gateways.reduce((sum, g) => sum + g.failedTransactions, 0);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Payment Methods
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage payment gateways and transaction processing
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={handleCreateGateway}>
          Add Gateway
        </Button>
      </Box>

      {/* Summary Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 4,
        }}
      >
        <Paper elevation={1} sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Total Gateways
          </Typography>
          <Typography variant="h4" fontWeight={600}>
            {gateways.length}
          </Typography>
        </Paper>
      </Box>

      {/* Payment Gateways Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 3, mt: 3 }}>
        {gateways.map((gateway) => (
          <Card key={gateway.id} elevation={2}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Typography variant="h6" fontWeight={600}>
                  {gateway.name}
                </Typography>
                <Chip
                  label={gateway.status}
                  color={gateway.status === 'active' ? 'success' : 'default'}
                  size="small"
                />
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Transactions
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {gateway.transactionCount}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Success Rate
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {gateway.successRate}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default PaymentMethodsPage;
