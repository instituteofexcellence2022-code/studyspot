import React from 'react';
import { Card, CardContent, Typography, Button, Box, Chip, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { Plan, PlanFeature } from '../../types';

/**
 * Props for PricingCard Component
 */
interface PricingCardProps {
  plan: Plan;
  billingInterval: 'monthly' | 'yearly';
  isCurrent?: boolean;
  onSelect: (plan: Plan) => void;
}

/**
 * Pricing Card Component
 * Reusable component to display a subscription plan card
 */
const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  billingInterval,
  isCurrent = false,
  onSelect}) => {
  // Calculate price based on billing interval
  const getPrice = (): number => {
    return billingInterval === 'yearly' && plan.yearlyPrice
      ? plan.yearlyPrice
      : plan.price;
  };

  // Get display price
  const getDisplayPrice = (): string => {
    const price = getPrice();
    if (billingInterval === 'yearly') {
      return `$${(price / 12).toFixed(2)}`;
    }
    return `$${price}`;
  };

  // Calculate yearly savings
  const calculateSavings = (): number => {
    if (!plan.yearlyPrice) return 0;
    const monthlyTotal = plan.price * 12;
    const savings = monthlyTotal - plan.yearlyPrice;
    const percentage = (savings / monthlyTotal) * 100;
    return Math.round(percentage);
  };

  // Render tier badge
  const renderBadge = () => {
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

  const savings = calculateSavings();

  return (
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
      {renderBadge()}
      
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
              {getDisplayPrice()}
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
        <List dense>
          {Array.isArray(plan.features) && plan.features.map((feature: any, index: number) => (
            <ListItem key={index} disableGutters>
              <ListItemIcon sx={{ minWidth: 36 }}>
                {typeof feature === 'string' ? (
                  <CheckIcon color="success" fontSize="small" />
                ) : feature.included ? (
                  <CheckIcon color="success" fontSize="small" />
                ) : (
                  <CloseIcon color="disabled" fontSize="small" />
                )}
              </ListItemIcon>
              <ListItemText
                primary={typeof feature === 'string' ? feature : feature.name}
                secondary={typeof feature === 'string' ? undefined : (feature.value ? `${feature.value}` : undefined)}
                primaryTypographyProps={{
                  variant: 'body2',
                  color: typeof feature === 'string' ? 'text.primary' : (feature.included ? 'text.primary' : 'text.disabled')}}
              />
            </ListItem>
          ))}
        </List>

        {/* CTA Button */}
        <Button
          variant={plan.isRecommended || plan.isPopular ? 'contained' : 'outlined'}
          fullWidth
          size="large"
          disabled={isCurrent}
          onClick={() => onSelect(plan)}
          sx={{ mt: 2 }}
        >
          {isCurrent ? 'Current Plan' : 'Choose Plan'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PricingCard;


