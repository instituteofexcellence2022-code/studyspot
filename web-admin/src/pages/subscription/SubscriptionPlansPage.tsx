/**
 * Subscription Plans Page
 * Professional subscription plans comparison and selection
 * @author Agent 1 - Senior Full Stack Developer
 * 
 * UX Pattern: Clear pricing comparison with toggle for billing cycle
 * Features:
 * - Visual comparison of plans
 * - Monthly/Yearly toggle
 * - Feature comparison
 * - Clear CTAs
 * - Highlight recommended plan
 * - Responsive design
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  GridLegacy as Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Switch,
  FormControlLabel,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Skeleton,
  Paper,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchPlans,
  selectPlan,
  selectBillingCycle,
} from '../../store/slices/subscriptionSlice';
import { SubscriptionPlan, BillingCycle } from '../../types/subscription';
import { ROUTES } from '../../constants';

const SubscriptionPlansPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { plans, plansLoading, plansError, selectedBillingCycle } = useAppSelector(
    (state) => state.subscription
  );
  const { user } = useAppSelector((state) => state.auth);
  
  const [isYearly, setIsYearly] = useState(selectedBillingCycle === 'yearly');

  useEffect(() => {
    dispatch(fetchPlans());
  }, [dispatch]);

  const handleBillingCycleToggle = useCallback(() => {
    const newCycle: BillingCycle = isYearly ? 'monthly' : 'yearly';
    setIsYearly(!isYearly);
    dispatch(selectBillingCycle(newCycle));
  }, [isYearly, dispatch]);

  const handleSelectPlan = useCallback((plan: SubscriptionPlan) => {
    dispatch(selectPlan(plan));
    // Navigate to checkout/subscription creation
    navigate(ROUTES.SUBSCRIPTION_CHECKOUT);
  }, [dispatch, navigate]);

  const calculateYearlySavings = useCallback((plan: SubscriptionPlan) => {
    const monthlyTotal = plan.price_monthly * 12;
    const yearlySavings = monthlyTotal - plan.price_yearly;
    const savingsPercent = Math.round((yearlySavings / monthlyTotal) * 100);
    return { amount: yearlySavings, percent: savingsPercent };
  }, []);

  const getPrice = useCallback((plan: SubscriptionPlan) => {
    return isYearly ? plan.price_yearly : plan.price_monthly;
  }, [isYearly]);

  const getPriceLabel = useCallback(() => {
    return isYearly ? 'per year' : 'per month';
  }, [isYearly]);

  // Determine recommended plan (usually middle-tier)
  const getRecommendedPlan = useCallback(() => {
    if (plans.length === 3) return plans[1]?.id; // Middle plan
    return null;
  }, [plans]);

  if (plansLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Skeleton variant="text" width="60%" sx={{ mx: 'auto', mb: 2 }} height={60} />
          <Skeleton variant="text" width="40%" sx={{ mx: 'auto' }} height={30} />
        </Box>
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} md={4} key={i}>
              <Skeleton variant="rectangular" height={500} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (plansError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{plansError}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Choose Your Plan
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Select the perfect plan for your library management needs
        </Typography>
        
        {/* Billing Cycle Toggle */}
        <Box sx={{ mt: 3, mb: 2 }}>
          <Paper
            elevation={0}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              p: 1,
              bgcolor: 'action.hover',
              borderRadius: 2,
            }}
          >
            <Typography
              variant="body1"
              sx={{ 
                mr: 2,
                fontWeight: !isYearly ? 'bold' : 'normal',
                color: !isYearly ? 'primary.main' : 'text.secondary',
              }}
            >
              Monthly
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={isYearly}
                  onChange={handleBillingCycleToggle}
                  color="primary"
                />
              }
              label=""
              sx={{ m: 0 }}
            />
            <Typography
              variant="body1"
              sx={{
                ml: 2,
                fontWeight: isYearly ? 'bold' : 'normal',
                color: isYearly ? 'primary.main' : 'text.secondary',
              }}
            >
              Yearly
            </Typography>
            {isYearly && (
              <Chip
                label="Save up to 20%"
                color="success"
                size="small"
                sx={{ ml: 2 }}
              />
            )}
          </Paper>
        </Box>
      </Box>

      {/* Plans Grid */}
      <Grid container spacing={3} alignItems="stretch">
        {plans.map((plan) => {
          const price = getPrice(plan);
          const priceLabel = getPriceLabel();
          const isRecommended = plan.id === getRecommendedPlan();
          const savings = isYearly ? calculateYearlySavings(plan) : null;

          return (
            <Grid item xs={12} md={4} key={plan.id}>
              <Card
                elevation={isRecommended ? 8 : 2}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  border: isRecommended ? 2 : 0,
                  borderColor: isRecommended ? 'primary.main' : 'transparent',
                  transform: isRecommended ? 'scale(1.05)' : 'scale(1)',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              >
                {/* Recommended Badge */}
                {isRecommended && (
                  <Chip
                    icon={<StarIcon />}
                    label="Recommended"
                    color="primary"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      fontWeight: 'bold',
                    }}
                  />
                )}

                <CardContent sx={{ flexGrow: 1, pt: isRecommended ? 6 : 3 }}>
                  {/* Plan Name */}
                  <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                    {plan.display_name}
                  </Typography>
                  
                  {/* Plan Description */}
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {plan.description}
                  </Typography>

                  {/* Price */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h3" component="div" fontWeight="bold" color="primary.main">
                      ${price}
                      <Typography variant="h6" component="span" color="text.secondary">
                        /{isYearly ? 'year' : 'month'}
                      </Typography>
                    </Typography>
                    {savings && savings.amount > 0 && (
                      <Typography variant="caption" color="success.main">
                        Save ${savings.amount.toFixed(0)} ({savings.percent}%) with yearly billing
                      </Typography>
                    )}
                  </Box>

                  {/* Features List */}
                  <List dense disablePadding>
                    {plan.features.map((feature, index) => (
                      <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckIcon color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={feature}
                          primaryTypographyProps={{
                            variant: 'body2',
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  {/* Limits Info */}
                  {plan.limits && (
                    <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        Plan Limits:
                      </Typography>
                      {plan.limits.max_libraries && (
                        <Typography variant="caption" display="block">
                          • Up to {plan.limits.max_libraries} {plan.limits.max_libraries === 1 ? 'library' : 'libraries'}
                        </Typography>
                      )}
                      {plan.limits.max_users && (
                        <Typography variant="caption" display="block">
                          • Up to {plan.limits.max_users} users
                        </Typography>
                      )}
                      {plan.limits.max_seats && (
                        <Typography variant="caption" display="block">
                          • Up to {plan.limits.max_seats} seats
                        </Typography>
                      )}
                    </Box>
                  )}
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    variant={isRecommended ? 'contained' : 'outlined'}
                    color="primary"
                    fullWidth
                    size="large"
                    onClick={() => handleSelectPlan(plan)}
                    sx={{
                      py: 1.5,
                      fontWeight: 'bold',
                    }}
                  >
                    Get Started
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Additional Info */}
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          All plans include 24/7 customer support and a 14-day money-back guarantee
        </Typography>
      </Box>
    </Container>
  );
};

export default React.memo(SubscriptionPlansPage);


