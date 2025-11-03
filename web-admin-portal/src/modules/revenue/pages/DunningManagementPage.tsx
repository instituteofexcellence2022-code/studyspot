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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Add,
  Edit,
  Delete,
  Close,
  Warning,
  CheckCircle,
  Block,
  Email,
  Refresh,
  TrendingUp,
  TrendingDown,
  Visibility,
} from '@mui/icons-material';
import { FailedPayment, DunningCampaign } from '../types';
import { useAppDispatch } from '../../../hooks/redux';
import { showError, showSuccess } from '../../../store/slices/uiSlice';

// Mock data for failed payments
const MOCK_FAILED_PAYMENTS: FailedPayment[] = [
  {
    id: '1',
    tenantId: '4',
    tenantName: 'Pune Knowledge Center',
    invoiceId: 'inv-004',
    invoiceNumber: 'INV-2024-004',
    amount: 2999,
    currency: '₹',
    failureReason: 'Insufficient funds',
    retryAttempts: 2,
    maxRetries: 3,
    status: 'recovering',
    nextRetryDate: '2024-11-01',
    dunningCampaignId: 'camp-1',
    lastAttemptDate: '2024-10-28',
    createdAt: '2024-10-25T00:00:00Z',
    updatedAt: '2024-10-28T00:00:00Z',
  },
  {
    id: '2',
    tenantId: '5',
    tenantName: 'Hyderabad Study Space',
    invoiceId: 'inv-005',
    invoiceNumber: 'INV-2024-005',
    amount: 9999,
    currency: '₹',
    failureReason: 'Card expired',
    retryAttempts: 1,
    maxRetries: 3,
    status: 'recovering',
    nextRetryDate: '2024-10-31',
    dunningCampaignId: 'camp-1',
    lastAttemptDate: '2024-10-27',
    createdAt: '2024-10-27T00:00:00Z',
    updatedAt: '2024-10-27T14:10:00Z',
  },
  {
    id: '3',
    tenantId: '7',
    tenantName: 'Kolkata Library Hub',
    invoiceId: 'inv-007',
    invoiceNumber: 'INV-2024-007',
    amount: 2999,
    currency: '₹',
    failureReason: 'Bank declined',
    retryAttempts: 3,
    maxRetries: 3,
    status: 'lost',
    lastAttemptDate: '2024-10-20',
    createdAt: '2024-10-15T00:00:00Z',
    updatedAt: '2024-10-20T00:00:00Z',
  },
];

// Mock data for dunning campaigns
const MOCK_CAMPAIGNS: DunningCampaign[] = [
  {
    id: 'camp-1',
    name: 'Standard Recovery Flow',
    description: 'Default campaign for failed subscription payments',
    trigger: 'payment_failed',
    emailSequence: [
      { day: 1, subject: 'Payment Failed - Action Required', template: 'payment_failed_day1' },
      { day: 3, subject: 'Reminder: Update Payment Method', template: 'payment_failed_day3' },
      { day: 7, subject: 'Final Notice: Account Suspension', template: 'payment_failed_day7' },
    ],
    retrySchedule: [1, 3, 7],
    maxRetries: 3,
    gracePeriod: 7,
    suspensionRule: 'after_grace',
    successRate: 65.5,
    activeCount: 2,
    resolvedCount: 45,
    lostCount: 8,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-10-30T00:00:00Z',
  },
  {
    id: 'camp-2',
    name: 'Trial Expiration',
    description: 'Campaign for trial period ending',
    trigger: 'trial_ended',
    emailSequence: [
      { day: 0, subject: 'Your Trial Has Ended', template: 'trial_ended' },
      { day: 2, subject: 'Special Offer: 20% Off First Month', template: 'trial_offer' },
    ],
    retrySchedule: [0, 2],
    maxRetries: 2,
    gracePeriod: 3,
    suspensionRule: 'immediate',
    successRate: 42.0,
    activeCount: 0,
    resolvedCount: 28,
    lostCount: 15,
    status: 'paused',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-09-15T00:00:00Z',
  },
];

const DunningManagementPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [failedPayments, setFailedPayments] = useState<FailedPayment[]>([]);
  const [campaigns, setCampaigns] = useState<DunningCampaign[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openCampaignDialog, setOpenCampaignDialog] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<DunningCampaign | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<FailedPayment | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setFailedPayments(MOCK_FAILED_PAYMENTS);
      setCampaigns(MOCK_CAMPAIGNS);
    } catch (err: any) {
      const errorMsg = err.message || 'An unexpected error occurred.';
      setError(errorMsg);
      dispatch(showError(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  const handleRetryPayment = (paymentId: string) => {
    dispatch(showSuccess('Retry initiated successfully!'));
    fetchData();
  };

  const handleViewDetails = (payment: FailedPayment) => {
    setSelectedPayment(payment);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedPayment(null);
  };

  const handleCreateCampaign = () => {
    setEditingCampaign(null);
    setOpenCampaignDialog(true);
  };

  const handleEditCampaign = (campaign: DunningCampaign) => {
    setEditingCampaign(campaign);
    setOpenCampaignDialog(true);
  };

  const handleCloseCampaignDialog = () => {
    setOpenCampaignDialog(false);
    setEditingCampaign(null);
  };

  const handleSaveCampaign = () => {
    dispatch(
      showSuccess(editingCampaign ? 'Campaign updated!' : 'Campaign created!')
    );
    handleCloseCampaignDialog();
    fetchData();
  };

  const handleDeleteCampaign = (campaignId: string) => {
    dispatch(showSuccess('Campaign deleted successfully!'));
    fetchData();
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
  ): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'resolved':
        return 'success';
      case 'recovering':
        return 'warning';
      case 'lost':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle sx={{ fontSize: 16 }} />;
      case 'recovering':
        return <Warning sx={{ fontSize: 16 }} />;
      case 'lost':
        return <Block sx={{ fontSize: 16 }} />;
      default:
        return undefined;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading Dunning Management...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        <Typography variant="h6">Error Loading Data</Typography>
        <Typography>{error}</Typography>
      </Alert>
    );
  }

  const recoveringPayments = failedPayments.filter((p) => p.status === 'recovering');
  const lostPayments = failedPayments.filter((p) => p.status === 'lost');
  const totalAtRisk = failedPayments.reduce((sum, p) => sum + p.amount, 0);
  const avgSuccessRate =
    campaigns.reduce((sum, c) => sum + c.successRate, 0) / campaigns.length || 0;

  const paginatedPayments = failedPayments.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Dunning Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage failed payments and recovery campaigns
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={handleCreateCampaign}>
          Create Campaign
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
            Total Failed
          </Typography>
          <Typography variant="h4" fontWeight={600} color="error.main">
            {failedPayments.length}
          </Typography>
        </Paper>
        <Paper elevation={1} sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Recovering
          </Typography>
          <Typography variant="h4" fontWeight={600} color="warning.main">
            {recoveringPayments.length}
          </Typography>
        </Paper>
        <Paper elevation={1} sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Amount at Risk
          </Typography>
          <Typography variant="h4" fontWeight={600}>
            {formatCurrency(totalAtRisk)}
          </Typography>
        </Paper>
        <Paper elevation={1} sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Avg Success Rate
          </Typography>
          <Typography variant="h4" fontWeight={600}>
            {avgSuccessRate.toFixed(1)}%
          </Typography>
          <Box display="flex" alignItems="center" mt={0.5}>
            {avgSuccessRate >= 50 ? (
              <TrendingUp sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
            ) : (
              <TrendingDown sx={{ fontSize: 16, color: 'error.main', mr: 0.5 }} />
            )}
            <Typography
              variant="caption"
              color={avgSuccessRate >= 50 ? 'success.main' : 'error.main'}
            >
              {avgSuccessRate >= 50 ? 'Good' : 'Needs improvement'}
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* Dunning Campaigns */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Dunning Campaigns
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          gap: 3,
          mb: 4,
        }}
      >
        {campaigns.map((campaign) => (
          <Card key={campaign.id} elevation={2}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {campaign.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {campaign.description}
                  </Typography>
                </Box>
                <Chip
                  label={campaign.status}
                  color={campaign.status === 'active' ? 'success' : 'default'}
                  size="small"
                />
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mt: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Emails Sent
                  </Typography>
                  <Typography variant="h6">{campaign.emailsSent}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Success Rate
                  </Typography>
                  <Typography variant="h6">{campaign.successRate}%</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Amount Recovered
                  </Typography>
                  <Typography variant="h6">{formatCurrency(campaign.amountRecovered || 0)}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Failed Payments Table */}
      <Paper elevation={2} sx={{ mt: 3 }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" fontWeight={600}>
            Failed Payments Requiring Action
          </Typography>
        </Box>
        <DataGrid
          rows={failedPayments}
          columns={[
            { field: 'id', headerName: 'Payment ID', width: 130 },
            { field: 'tenantName', headerName: 'Tenant', width: 200 },
            { field: 'amount', headerName: 'Amount', width: 150, valueFormatter: (params: any) => formatCurrency(params.value as number) },
            { field: 'failedDate', headerName: 'Failed Date', width: 180 },
            { field: 'reason', headerName: 'Reason', width: 200 },
            { field: 'attempts', headerName: 'Retry Attempts', width: 150 },
          ]}
          autoHeight
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10, 25, 50]}
        />
      </Paper>
    </Box>
  );
};

export default DunningManagementPage;
