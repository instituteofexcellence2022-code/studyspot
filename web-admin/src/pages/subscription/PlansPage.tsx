import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import {
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Alert,
  Divider,
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { 
  fetchPlans,
  fetchSubscription
} from '../../store/slices/subscriptionSlice';
import { Plan, BillingInterval } from '../../types';
import { ROUTES } from '../../constants';
import { showInfo } from '../../utils/toast';

/**
 * Plans Page Component
 * Displays subscription plan comparison with pricing cards
 */
const PlansPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux state
  const {
    plans,
    plansLoading,
    plansError,
    currentSubscription,
    billingInterval} = useAppSelector((state: any) => state.subscription);
  const { user } = useAppSelector((state: any) => state.auth);

  // Load plans and current subscription on mount
  useEffect(() => {
    dispatch(fetchPlans());
    if (user?.tenantId) {
      dispatch(fetchSubscription(user.tenantId));
    }
  }, [dispatch]);

  // Handle billing interval toggle
  const handleBillingIntervalChange = (
    _event: React.MouseEvent<HTMLElement>,
    newInterval: BillingInterval | null
  ) => {
    if (newInterval) {
      // Placeholder: slice action not wired yet
      showInfo(`Billing interval set to ${newInterval}. (Coming soon)`);
    }
  };

  // Handle plan selection
  const handleSelectPlan = (plan: Plan) => {
    // Convert Plan back to SubscriptionPlan format for Redux
    const subPlan: any = {
      id: plan.id,
      name: plan.name,
      display_name: plan.displayName,
      description: plan.description,
      price_monthly: plan.interval === 'monthly' ? plan.price : 0,
      price_yearly: plan.interval === 'yearly' ? plan.price : 0,
      features: plan.features,
      limits: plan.limits,
      is_active: true};
    // Placeholder: slice action not wired yet
    showInfo(`Selected plan: ${plan.displayName}. Proceeding to upgrade…`);
    navigate(ROUTES.SUBSCRIPTION_UPGRADE);
  };

  // Calculate savings for yearly billing
  const calculateYearlySavings = (plan: Plan): number => {
    if (!plan.yearlyPrice) return 0;
    const monthlyTotal = plan.price * 12;
    const savings = monthlyTotal - plan.yearlyPrice;
    const percentage = (savings / monthlyTotal) * 100;
    return Math.round(percentage);
  };

  // Get price based on billing interval
  const getPrice = (plan: Plan): number => {
    return billingInterval === 'yearly' && plan.yearlyPrice
      ? plan.yearlyPrice
      : plan.price;
  };

  // Get display price (yearly price shown monthly)
  const getDisplayPrice = (plan: Plan): string => {
    const price = getPrice(plan);
    if (billingInterval === 'yearly') {
      return `$${(price / 12).toFixed(2)}`;
    }
    return `$${price}`;
  };

  // Transform SubscriptionPlan to Plan format
  const transformPlan = (subPlan: any): Plan => ({
    id: subPlan.id,
    name: subPlan.name,
    displayName: subPlan.displayName || subPlan.display_name,
    price: billingInterval === 'monthly' ? subPlan.priceMonthly || subPlan.price_monthly : subPlan.priceYearly || subPlan.price_yearly,
    currency: 'USD',
    interval: billingInterval,
    features: Array.isArray(subPlan.features) ? subPlan.features : [],
    description: subPlan.description,
    isPopular: false,
    isRecommended: subPlan.name === 'premium',
    tier: subPlan.name || 'basic',
    limits: subPlan.limits || {},
    createdAt: subPlan.createdAt || subPlan.created_at || new Date().toISOString(),
    updatedAt: subPlan.updatedAt || subPlan.updated_at || new Date().toISOString()});

  // Check if plan is current
  const isCurrentPlan = (plan: Plan): boolean => {
    return currentSubscription?.plan_id === plan.id;
  };

  // Render plan tier badge
  const renderTierBadge = (plan: Plan) => {
    if (plan.tier === 'free') {
      return null;
    }

    if (plan.isRecommended) {
      return (
        <Chip
          icon={<StarIcon />}
          label="Recommended"
          color="secondary"
          size="small"
          sx={{ position: 'absolute', top: 16, right: 16 }}
        />
      );
    }

    if (plan.isPopular) {
      return (
        <Chip
          icon={<TrendingUpIcon />}
          label="Most Popular"
          color="primary"
          size="small"
          sx={{ position: 'absolute', top: 16, right: 16 }}
        />
      );
    }

    return null;
  };

  // Render feature list
  const renderFeatures = (plan: Plan) => {
    return (
      <List dense>
        {plan.features.map((feature, index) => (
          <ListItem key={index} disableGutters>
            <ListItemIcon sx={{ minWidth: 36 }}>
              {feature.included ? (
                <CheckIcon color="success" fontSize="small" />
              ) : (
                <CloseIcon color="disabled" fontSize="small" />
              )}
            </ListItemIcon>
            <ListItemText
              primary={feature.name}
              secondary={feature.value ? `${feature.value}` : undefined}
              primaryTypographyProps={{
                variant: 'body2',
                color: feature.included ? 'text.primary' : 'text.disabled'}}
            />
          </ListItem>
        ))}
      </List>
    );
  };

  // Render pricing card
  const renderPricingCard = (plan: Plan) => {
    const isCurrent = isCurrentPlan(plan);
    const savings = calculateYearlySavings(plan);

    return (
      <Grid xs={12} sm={6} md={3} key={plan.id}>
        <Card
          raised={plan.isRecommended || plan.isPopular}
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            border: isCurrent ? 3 : undefined,
            borderColor: isCurrent ? 'primary.main' : undefined,
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: 6}}}
        >
          {renderTierBadge(plan)}
          
          {isCurrent && (
            <Chip
              label="Current Plan"
              color="primary"
              size="small"
              sx={{ position: 'absolute', top: 16, left: 16 }}
            />
          )}

          <CardContent sx={{ flexGrow: 1, pt: 6 }}>
            {/* Plan Name */}
            <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
              {plan.displayName}
            </Typography>

            {/* Plan Description */}
            <Typography variant="body2" color="text.secondary" paragraph>
              {plan.description}
            </Typography>

            {/* Pricing */}
            <Box sx={{ my: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                <Typography variant="h3" component="span" fontWeight="bold">
                  {getDisplayPrice(plan)}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ ml: 1 }}>
                  /month
                </Typography>
              </Box>
              
              {billingInterval === 'yearly' && plan.yearlyPrice && (
                <Typography variant="body2" color="text.secondary">
                  Billed ${plan.yearlyPrice} annually
                </Typography>
              )}

              {billingInterval === 'yearly' && savings > 0 && (
                <Chip
                  label={`Save ${savings}%`}
                  color="success"
                  size="small"
                  sx={{ mt: 1 }}
                />
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Features */}
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              What's included:
            </Typography>
            {renderFeatures(plan)}

            {/* CTA Button */}
            <Button
              variant={plan.isRecommended || plan.isPopular ? 'contained' : 'outlined'}
              fullWidth
              size="large"
              disabled={isCurrent || plan.tier === 'free'}
              onClick={() => handleSelectPlan(plan)}
              sx={{ mt: 2 }}
            >
              {isCurrent ? 'Current Plan' : plan.tier === 'free' ? 'Free Forever' : 'Choose Plan'}
            </Button>

            {plan.tier === 'enterprise' && (
              <Typography
                variant="caption"
                color="text.secondary"
                align="center"
                display="block"
                sx={{ mt: 1 }}
              >
                Contact sales for custom pricing
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    );
  };

  // Loading state
  if (plansLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading plans...
        </Typography>
      </Container>
    );
  }

  // Error state
  if (plansError) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{plansError}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Choose Your Plan
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Flexible pricing for libraries of all sizes
        </Typography>

        {/* Billing Interval Toggle */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <ToggleButtonGroup
            value={billingInterval}
            exclusive
            onChange={handleBillingIntervalChange}
            aria-label="billing interval"
            size="large"
          >
            <ToggleButton value="monthly" aria-label="monthly billing">
              Monthly
            </ToggleButton>
            <ToggleButton value="yearly" aria-label="yearly billing">
              Yearly
              <Chip
                label="Save up to 20%"
                size="small"
                color="success"
                sx={{ ml: 1 }}
              />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Pricing Cards */}
      <Grid container spacing={4}>
        {plans.map((plan) => renderPricingCard(transformPlan(plan)))}
      </Grid>

      {/* Additional Info */}
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          All plans include:
        </Typography>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid xs={12} sm={6} md={3}>
            <Typography variant="body2">✓ 24/7 Customer Support</Typography>
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <Typography variant="body2">✓ SSL Security</Typography>
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <Typography variant="body2">✓ Regular Updates</Typography>
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <Typography variant="body2">✓ 99.9% Uptime SLA</Typography>
          </Grid>
        </Grid>
      </Box>

      {/* FAQ/Contact */}
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Need a custom plan?{' '}
          <Button color="primary" onClick={() => navigate(ROUTES.HELP)}>
            Contact Sales
          </Button>
        </Typography>
      </Box>
    </Container>
  );
};

export default PlansPage;

