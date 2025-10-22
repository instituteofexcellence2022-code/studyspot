/**
 * Subscription Checkout Page
 * Handles subscription creation and payment processing
 * @author Agent 1 - Senior Full Stack Developer
 * 
 * Flow: Review → Create Subscription → Redirect to Stripe (if needed)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  GridLegacy as Grid,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  createSubscription,
  clearCheckoutError,
} from '../../store/slices/subscriptionSlice';
import { showSnackbar } from '../../store/slices/uiSlice';
import { ROUTES } from '../../constants';

const SubscriptionCheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { selectedPlan, selectedBillingCycle, checkoutLoading, checkoutError } = useAppSelector(
    (state) => state.subscription
  );
  const { user } = useAppSelector((state) => state.auth);
  
  const [processing, setProcessing] = useState(false);

  // Redirect if no plan selected
  useEffect(() => {
    if (!selectedPlan) {
      navigate(ROUTES.SUBSCRIPTION_PLANS);
    }
  }, [selectedPlan, navigate]);

  const getPrice = useCallback(() => {
    if (!selectedPlan) return 0;
    return selectedBillingCycle === 'monthly' 
      ? selectedPlan.price_monthly 
      : selectedPlan.price_yearly;
  }, [selectedPlan, selectedBillingCycle]);

  const handleConfirmSubscription = useCallback(async () => {
    if (!selectedPlan) return;

    setProcessing(true);
    dispatch(clearCheckoutError());

    try {
      const result = await dispatch(createSubscription({
        planId: selectedPlan.id,
        billingCycle: selectedBillingCycle,
      })).unwrap();

      // Success
      dispatch(showSnackbar({
        message: 'Subscription created successfully!',
        severity: 'success',
      }));

      // Navigate to success page
      navigate(ROUTES.SUBSCRIPTION_SUCCESS);
    } catch (error: any) {
      dispatch(showSnackbar({
        message: error || 'Failed to create subscription',
        severity: 'error',
      }));
      setProcessing(false);
    }
  }, [selectedPlan, selectedBillingCycle, dispatch, navigate]);

  const handleBack = useCallback(() => {
    navigate(ROUTES.SUBSCRIPTION_PLANS);
  }, [navigate]);

  if (!selectedPlan) {
    return null;
  }

  const price = getPrice();
  const total = price;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        startIcon={<BackIcon />}
        onClick={handleBack}
        sx={{ mb: 3 }}
      >
        Back to Plans
      </Button>

      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Review Your Subscription
      </Typography>

      <Grid container spacing={3}>
        {/* Plan Summary */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Plan Details
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {selectedPlan.display_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedPlan.description}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Billing: <strong>{selectedBillingCycle === 'monthly' ? 'Monthly' : 'Yearly'}</strong>
              </Typography>
              <Typography variant="h5" color="primary.main" fontWeight="bold">
                ${price} / {selectedBillingCycle === 'monthly' ? 'month' : 'year'}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              Included Features:
            </Typography>
            <List dense>
              {selectedPlan.features.map((feature, index) => (
                <ListItem key={index} disablePadding>
                  <CheckIcon color="success" fontSize="small" sx={{ mr: 1 }} />
                  <ListItemText 
                    primary={feature}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>

          {/* Billing Information */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Billing Information
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body2" gutterBottom>
              Email: {user?.email}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              Invoices will be sent to this email address
            </Typography>
          </Paper>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Order Summary
              </Typography>
              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Subtotal</Typography>
                  <Typography variant="body2">${price}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Tax</Typography>
                  <Typography variant="body2">$0.00</Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">Total</Typography>
                <Typography variant="h6" fontWeight="bold" color="primary.main">
                  ${total}
                </Typography>
              </Box>

              {checkoutError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {checkoutError}
                </Alert>
              )}

              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                onClick={handleConfirmSubscription}
                disabled={checkoutLoading || processing}
                sx={{ mb: 2 }}
              >
                {checkoutLoading || processing ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Processing...
                  </>
                ) : (
                  'Confirm Subscription'
                )}
              </Button>

              <Typography variant="caption" color="text.secondary" align="center" display="block">
                By confirming, you agree to our Terms of Service and Privacy Policy
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Additional Info */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          🔒 Secure payment processing by Stripe
        </Typography>
      </Box>
    </Container>
  );
};

export default React.memo(SubscriptionCheckoutPage);


