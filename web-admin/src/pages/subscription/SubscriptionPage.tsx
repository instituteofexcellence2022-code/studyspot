import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import {
  Chip,
  LinearProgress,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button
} from '@mui/material';
import {
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  History as HistoryIcon,
  Upgrade as UpgradeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchSubscription,
  cancelSubscription
} from '../../store/slices/subscriptionSlice';
import { ROUTES } from '../../constants';
import { format } from 'date-fns';

/**
 * Subscription Management Page Component
 * Manage current subscription, view usage, change plan, cancel
 */
const SubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux state
  const {
    currentSubscription,
    subscriptionLoading,
    subscriptionError} = useAppSelector((state: any) => state.subscription);
  const { user } = useAppSelector((state: any) => state.auth);
  
  // Mock usage stats until implemented
  const usageStats: any = null;
  const usageStatsLoading = false;

  // Local state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Load data on mount
  useEffect(() => {
    if (user?.tenantId) {
      dispatch(fetchSubscription(user.tenantId as any));
    }
    // dispatch(fetchUsageStats( as any)); // TODO: Implement when slice is ready
  }, [dispatch]);

  // Handle cancel subscription
  const handleCancelSubscription = async () => {
    if (!currentSubscription) return;

    setCancelling(true);
    try {
      await dispatch(
        cancelSubscription({
          subscriptionId: currentSubscription.id,
          immediate: false} as any)
      ).unwrap();
      setCancelDialogOpen(false);
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    } finally {
      setCancelling(false);
    }
  };

  // Get subscription status color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'trialing':
        return 'info';
      case 'past_due':
      case 'unpaid':
        return 'warning';
      case 'canceled':
      case 'incomplete_expired':
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

  // Calculate usage percentage
  const calculateUsagePercentage = (used: number, limit?: number): number => {
    if (limit === 0) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  // Get usage color
  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'error';
    if (percentage >= 75) return 'warning';
    return 'success';
  };

  // Loading state
  if (subscriptionLoading && !currentSubscription) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading subscription...
        </Typography>
      </Container>
    );
  }

  // No subscription state
  if (!currentSubscription && !subscriptionLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          You don't have an active subscription.
        </Alert>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate(ROUTES.SUBSCRIPTION_PLANS)}
        >
          View Plans
        </Button>
      </Container>
    );
  }

  // Error state
  if (subscriptionError) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{subscriptionError}</Alert>
      </Container>
    );
  }

  const plan = (currentSubscription as any)?.plan || null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Subscription Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your subscription, view usage, and billing information
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Current Plan Card */}
        <Grid xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Current Plan
                </Typography>
                <Chip
                  label={currentSubscription?.status}
                  color={getStatusColor(currentSubscription?.status || '')}
                  size="small"
                />
              </Box>

              <Typography variant="h4" gutterBottom fontWeight="bold">
                {plan?.displayName || 'Unknown Plan'}
              </Typography>

              <Typography variant="body2" color="text.secondary" paragraph>
                {plan?.description}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <List dense>
                <ListItem disableGutters>
                  <ListItemText
                    primary="Billing Interval"
                    secondary={
                      currentSubscription?.billing_cycle === 'yearly'
                        ? 'Yearly'
                        : 'Monthly'
                    }
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText
                    primary="Amount"
                    secondary={`$${(currentSubscription as any)?.amount || 0} ${((currentSubscription as any)?.currency || 'USD').toUpperCase()}`}
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText
                    primary="Current Period Start"
                    secondary={formatDate(currentSubscription?.current_period_start || '')}
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText
                    primary="Current Period End"
                    secondary={formatDate(currentSubscription?.current_period_end || '')}
                  />
                </ListItem>
                {currentSubscription?.cancel_at_period_end && (
                  <ListItem disableGutters>
                    <ListItemText
                      primary={
                        <Typography color="error" fontWeight="bold">
                          Cancellation Scheduled
                        </Typography>
                      }
                      secondary={`Your subscription will end on ${formatDate(
                        currentSubscription.current_period_end
                      )}`}
                    />
                  </ListItem>
                )}
              </List>

              <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<UpgradeIcon />}
                  onClick={() => navigate(ROUTES.SUBSCRIPTION_PLANS)}
                >
                  Change Plan
                </Button>
                {!currentSubscription?.cancel_at_period_end && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={() => setCancelDialogOpen(true)}
                  >
                    Cancel Subscription
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Usage Statistics Card */}
        <Grid xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Usage Statistics
                </Typography>
                {usageStatsLoading && <CircularProgress size={20} />}
              </Box>

              {usageStats ? (
                <Box>
                  {/* Libraries Usage */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        Libraries
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {usageStats.librariesUsed} / {usageStats.librariesLimit}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={calculateUsagePercentage(
                        usageStats.librariesUsed,
                        usageStats.librariesLimit
                      )}
                      color={getUsageColor(
                        calculateUsagePercentage(
                          usageStats.librariesUsed,
                          usageStats.librariesLimit
                        )
                      )}
                    />
                  </Box>

                  {/* Users Usage */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        Active Users
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {usageStats.usersActive} / {usageStats.usersLimit}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={calculateUsagePercentage(
                        usageStats.usersActive,
                        usageStats.usersLimit
                      )}
                      color={getUsageColor(
                        calculateUsagePercentage(
                          usageStats.usersActive,
                          usageStats.usersLimit
                        )
                      )}
                    />
                  </Box>

                  {/* Bookings Usage */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        Bookings This Month
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {usageStats.bookingsThisMonth} / {usageStats.bookingsLimit}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={calculateUsagePercentage(
                        usageStats.bookingsThisMonth,
                        usageStats.bookingsLimit
                      )}
                      color={getUsageColor(
                        calculateUsagePercentage(
                          usageStats.bookingsThisMonth,
                          usageStats.bookingsLimit
                        )
                      )}
                    />
                  </Box>

                  {/* Storage Usage */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        Storage
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {usageStats.storageUsedGB.toFixed(2)} GB /{' '}
                        {usageStats.storageLimitGB} GB
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={calculateUsagePercentage(
                        usageStats.storageUsedGB,
                        usageStats.storageLimitGB
                      )}
                      color={getUsageColor(
                        calculateUsagePercentage(
                          usageStats.storageUsedGB,
                          usageStats.storageLimitGB
                        )
                      )}
                    />
                  </Box>

                  {/* API Calls Usage */}
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        API Calls Today
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {usageStats.apiCallsToday.toLocaleString()} /{' '}
                        {usageStats.apiCallsLimit.toLocaleString()}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={calculateUsagePercentage(
                        usageStats.apiCallsToday,
                        usageStats.apiCallsLimit
                      )}
                      color={getUsageColor(
                        calculateUsagePercentage(
                          usageStats.apiCallsToday,
                          usageStats.apiCallsLimit
                        )
                      )}
                    />
                  </Box>
                </Box>
              ) : (
                <Alert severity="info">No usage data available</Alert>
              )}

              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 3 }}
                startIcon={<HistoryIcon />}
                onClick={() => navigate(ROUTES.SUBSCRIPTION_BILLING)}
              >
                View Billing History
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Plan Features Card */}
        <Grid xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Plan Features
              </Typography>
              <Grid container spacing={2}>
                {plan?.features?.map((feature: any, index: number) => (
                  <Grid xs={12} sm={6} md={4} key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {feature.included ? (
                        <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                      ) : (
                        <CancelIcon color="disabled" sx={{ mr: 1 }} />
                      )}
                      <Typography variant="body2">{feature.name}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Cancel Subscription Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => !cancelling && setCancelDialogOpen(false)}
      >
        <DialogTitle>Cancel Subscription?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel your subscription? Your subscription will
            remain active until the end of the current billing period (
            {formatDate(currentSubscription?.current_period_end || '')}).
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)} disabled={cancelling}>
            Keep Subscription
          </Button>
          <Button
            onClick={handleCancelSubscription}
            color="error"
            variant="contained"
            disabled={cancelling}
          >
            {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SubscriptionPage;

