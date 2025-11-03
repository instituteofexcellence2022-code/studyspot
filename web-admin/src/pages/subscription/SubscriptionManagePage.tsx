/**
 * Subscription Management Page
 * Manage current subscription, upgrade/downgrade, view invoices
 * @author Agent 1 - Senior Full Stack Developer
 * 
 * Features:
 * - Current plan overview
 * - Usage statistics
 * - Upgrade/Downgrade options
 * - Cancellation
 * - Invoice history
 * - Customer portal access
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import {
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Box,
  Container,
  Typography,
  Paper
} from '@mui/material';
import {
  Cancel as CancelIcon,
  CheckCircle as CheckIcon,
  OpenInNew as OpenIcon,
  Receipt as ReceiptIcon,
  Settings as SettingsIcon,
  TrendingDown as DowngradeIcon,
  TrendingUp as UpgradeIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { 
  fetchSubscription,
  fetchPlans,
  fetchInvoices,
  upgradeSubscription,
  downgradeSubscription,
  cancelSubscription
} from '../../store/slices/subscriptionSlice';
import { showSnackbar } from '../../store/slices/uiSlice';
import { ROUTES } from '../../constants';
import { SubscriptionPlan } from '../../types';

const SubscriptionManagePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { user } = useAppSelector((state: any) => state.auth);
  const { 
    currentSubscription, 
    subscriptionLoading,
    plans,
    invoices} = useAppSelector((state: any) => state.subscription);
  
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [downgradeDialogOpen, setDowngradeDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (user?.tenantId) {
      dispatch(fetchSubscription(user.tenantId));
      dispatch(fetchPlans());
      dispatch(fetchInvoices({ tenantId: user.tenantId, limit: 5 }));
    }
  }, [dispatch, user]);

  const handleUpgrade = useCallback(async (plan: SubscriptionPlan) => {
    if (!currentSubscription) return;
    
    setProcessing(true);
    try {
      await dispatch(upgradeSubscription({
        subscriptionId: currentSubscription.id,
        newPlanId: plan.id})).unwrap();
      
      dispatch(showSnackbar({
        message: 'Subscription upgraded successfully!',
        severity: 'success'}));
      setUpgradeDialogOpen(false);
    } catch (error: any) {
      dispatch(showSnackbar({
        message: error || 'Failed to upgrade subscription',
        severity: 'error'}));
    } finally {
      setProcessing(false);
    }
  }, [currentSubscription, dispatch]);

  const handleDowngrade = useCallback(async (plan: SubscriptionPlan) => {
    if (!currentSubscription) return;
    
    setProcessing(true);
    try {
      await dispatch(downgradeSubscription({
        subscriptionId: currentSubscription.id,
        newPlanId: plan.id})).unwrap();
      
      dispatch(showSnackbar({
        message: 'Subscription will be downgraded at the end of the current period',
        severity: 'info'}));
      setDowngradeDialogOpen(false);
    } catch (error: any) {
      dispatch(showSnackbar({
        message: error || 'Failed to downgrade subscription',
        severity: 'error'}));
    } finally {
      setProcessing(false);
    }
  }, [currentSubscription, dispatch]);

  const handleCancel = useCallback(async (immediate: boolean = false) => {
    if (!currentSubscription) return;
    
    setProcessing(true);
    try {
      await dispatch(cancelSubscription({
        subscriptionId: currentSubscription.id,
        immediate})).unwrap();
      
      dispatch(showSnackbar({
        message: immediate 
          ? 'Subscription cancelled immediately' 
          : 'Subscription will be cancelled at the end of the current period',
        severity: 'info'}));
      setCancelDialogOpen(false);
    } catch (error: any) {
      dispatch(showSnackbar({
        message: error || 'Failed to cancel subscription',
        severity: 'error'}));
    } finally {
      setProcessing(false);
    }
  }, [currentSubscription, dispatch]);

  const handleOpenPortal = useCallback(() => {
    if (currentSubscription) {
      dispatch(showSnackbar({
        message: 'Customer portal integration coming soon',
        severity: 'info'
      } as any));
    }
  }, [currentSubscription, dispatch]);

  const getUsagePercentage = useCallback((metric: string, value?: number) => {
    if (!currentSubscription?.limits || value === undefined) return 0;
    const limit = currentSubscription.limits[`max_${metric}`];
    if (!limit) return 0;
    return Math.min((value / limit) * 100, 100);
  }, [currentSubscription]);

  const getAvailablePlans = useCallback((type: 'upgrade' | 'downgrade') => {
    if (!currentSubscription) return [];
    const currentPrice = currentSubscription.billing_cycle === 'monthly'
      ? currentSubscription.limits?.price_monthly || 0
      : currentSubscription.limits?.price_yearly || 0;

    return plans.filter((plan: any) => {
      const planPrice = currentSubscription.billing_cycle === 'monthly'
        ? plan.price_monthly
        : plan.price_yearly;
      
      return type === 'upgrade' 
        ? planPrice > currentPrice
        : planPrice < currentPrice;
    });
  }, [currentSubscription, plans]);

  if (!currentSubscription) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {subscriptionLoading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Loading subscription...
            </Typography>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h5" gutterBottom>
              No Active Subscription
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Choose a plan to get started
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(ROUTES.SUBSCRIPTION_PLANS)}
              sx={{ mt: 2 }}
            >
              View Plans
            </Button>
          </Box>
        )}
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Manage Subscription
      </Typography>

      <Grid container spacing={3}>
        {/* Current Plan */}
        <Grid xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
              <Box>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  {currentSubscription.plan_display_name || currentSubscription.plan_name}
                </Typography>
                <Chip 
                  label={currentSubscription.status.toUpperCase()}
                  color={currentSubscription.status === 'active' ? 'success' : 'default'}
                  size="small"
                />
              </Box>
              <Button
                variant="outlined"
                startIcon={<OpenIcon />}
                onClick={handleOpenPortal}
              >
                Customer Portal
              </Button>
            </Box>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              Billing: {currentSubscription.billing_cycle === 'monthly' ? 'Monthly' : 'Yearly'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Current Period: {new Date(currentSubscription.current_period_start).toLocaleDateString()} - {new Date(currentSubscription.current_period_end).toLocaleDateString()}
            </Typography>

            {currentSubscription.cancel_at_period_end && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Your subscription will be cancelled at the end of the current period
              </Alert>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Features */}
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              Included Features
            </Typography>
            <List dense>
              {currentSubscription.features?.map((feature: any, index: number) => (
                <ListItem key={index} disablePadding>
                  <CheckIcon color="success" fontSize="small" sx={{ mr: 1 }} />
                  <ListItemText primary={feature} primaryTypographyProps={{ variant: 'body2' }} />
                </ListItem>
              ))}
            </List>
          </Paper>

          {/* Usage Statistics */}
          {currentSubscription.usage && (
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Usage Statistics
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {Object.entries(currentSubscription.usage).map(([key, value]) => {
                if (value === undefined) return null;
                const limit = currentSubscription.limits?.[`max_${key}`];
                const percentage = getUsagePercentage(key, value);
                
                return (
                  <Box key={key} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" textTransform="capitalize">
                        {key.replace('_', ' ')}
                      </Typography>
                      <Typography variant="body2">
                        {value} {limit ? `/ ${limit}` : ''}
                      </Typography>
                    </Box>
                    {limit && (
                      <LinearProgress 
                        variant="determinate" 
                        value={percentage}
                        color={percentage > 90 ? 'error' : percentage > 75 ? 'warning' : 'primary'}
                      />
                    )}
                  </Box>
                );
              })}
            </Paper>
          )}

          {/* Recent Invoices */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Recent Invoices
              </Typography>
              <Button
                size="small"
                onClick={() => navigate(ROUTES.SUBSCRIPTION_INVOICES)}
              >
                View All
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {invoices.length > 0 ? (
              <List>
                {invoices.map((invoice: any) => (
                  <ListItem key={invoice.id} sx={{ px: 0 }}>
                    <ListItemText
                      primary={`Invoice #${invoice.id.substring(0, 8)}`}
                      secondary={new Date(invoice.created_at).toLocaleDateString()}
                    />
                    <Chip 
                      label={invoice.status.toUpperCase()}
                      color={invoice.status === 'paid' ? 'success' : 'warning'}
                      size="small"
                    />
                    <Typography variant="body1" sx={{ ml: 2 }}>
                      ${invoice.amount}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No invoices yet
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Actions */}
        <Grid xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Actions
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={<UpgradeIcon />}
                  onClick={() => setUpgradeDialogOpen(true)}
                  disabled={getAvailablePlans('upgrade').length === 0}
                >
                  Upgrade Plan
                </Button>

                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  startIcon={<DowngradeIcon />}
                  onClick={() => setDowngradeDialogOpen(true)}
                  disabled={getAvailablePlans('downgrade').length === 0}
                >
                  Downgrade Plan
                </Button>

                <Button
                  variant="outlined"
                  color="secondary"
                  fullWidth
                  startIcon={<ReceiptIcon />}
                  onClick={() => navigate(ROUTES.SUBSCRIPTION_INVOICES)}
                >
                  View Invoices
                </Button>

                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  startIcon={<CancelIcon />}
                  onClick={() => setCancelDialogOpen(true)}
                  disabled={currentSubscription.cancel_at_period_end}
                >
                  Cancel Subscription
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Upgrade Dialog */}
      <Dialog open={upgradeDialogOpen} onClose={() => setUpgradeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upgrade Your Plan</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Choose a higher tier plan to unlock more features
          </Typography>
          <List>
            {getAvailablePlans('upgrade').map((plan: any) => (
              <ListItem 
                key={plan.id}
                component="div"
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                onClick={() => setSelectedPlan(plan)}
              >
                <ListItemText
                  primary={plan.display_name}
                  secondary={`$${currentSubscription.billing_cycle === 'monthly' ? plan.price_monthly : plan.price_yearly} / ${currentSubscription.billing_cycle === 'monthly' ? 'month' : 'year'}`}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpgradeDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => selectedPlan && handleUpgrade(selectedPlan)}
            variant="contained"
            disabled={!selectedPlan || processing}
          >
            {processing ? 'Processing...' : 'Upgrade Now'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Downgrade Dialog */}
      <Dialog open={downgradeDialogOpen} onClose={() => setDowngradeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Downgrade Your Plan</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Downgrade will take effect at the end of your current billing period
          </Alert>
          <List>
            {getAvailablePlans('downgrade').map((plan: any) => (
              <ListItem 
                key={plan.id}
                component="div"
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                onClick={() => setSelectedPlan(plan)}
              >
                <ListItemText
                  primary={plan.display_name}
                  secondary={`$${currentSubscription.billing_cycle === 'monthly' ? plan.price_monthly : plan.price_yearly} / ${currentSubscription.billing_cycle === 'monthly' ? 'month' : 'year'}`}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDowngradeDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => selectedPlan && handleDowngrade(selectedPlan)}
            variant="contained"
            disabled={!selectedPlan || processing}
          >
            {processing ? 'Processing...' : 'Downgrade'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cancel Subscription</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Are you sure you want to cancel your subscription?
          </Alert>
          <Typography variant="body2" gutterBottom>
            Your subscription will remain active until the end of the current billing period.
            You will not be charged again.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Keep Subscription</Button>
          <Button 
            onClick={() => handleCancel(false)}
            variant="contained"
            color="error"
            disabled={processing}
          >
            {processing ? 'Processing...' : 'Cancel Subscription'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default React.memo(SubscriptionManagePage);


