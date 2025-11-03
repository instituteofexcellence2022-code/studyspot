/**
 * Plan Selection Step Component
 * Third step of tenant onboarding wizard
 */

import React from 'react';
import Grid from '@mui/material/Grid';
import {
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Box,
  Typography,
  Card,
  CardContent
} from '@mui/material';
import { Check as CheckIcon } from '@mui/icons-material';
;

const PlanSelectionStep: React.FC = () => {
  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 999,
      features: ['Up to 50 seats', 'Basic analytics', 'Email support', '1 location'],
      popular: false},
    {
      id: 'professional',
      name: 'Professional',
      price: 2999,
      features: ['Up to 200 seats', 'Advanced analytics', 'Priority support', '5 locations', 'Custom branding'],
      popular: true},
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 9999,
      features: ['Unlimited seats', 'Full analytics suite', '24/7 support', 'Unlimited locations', 'White label', 'API access'],
      popular: false},
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Choose Your Plan
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Select the plan that best fits your needs
      </Typography>

      <Grid container spacing={3}>
        {plans.map((plan) => (
          <Grid xs={12} md={4} key={plan.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                border: plan.popular ? 2 : 1,
                borderColor: plan.popular ? 'primary.main' : 'divider'}}
            >
              {plan.popular && (
                <Chip
                  label="Most Popular"
                  color="primary"
                  size="small"
                  sx={{ position: 'absolute', top: 16, right: 16 }}
                />
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="h3" gutterBottom>
                  {plan.name}
                </Typography>
                <Typography variant="h3" color="primary" gutterBottom>
                  ₹{plan.price}
                  <Typography variant="body2" component="span" color="text.secondary">
                    /month
                  </Typography>
                </Typography>
                <List dense>
                  {plan.features.map((feature, index) => (
                    <ListItem key={index} disableGutters>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={feature} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
              <Box sx={{ p: 2 }}>
                <Button
                  fullWidth
                  variant={plan.popular ? 'contained' : 'outlined'}
                  color="primary"
                >
                  Select Plan
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PlanSelectionStep;
