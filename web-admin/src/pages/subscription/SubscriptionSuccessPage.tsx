/**
 * Subscription Success Page
 * Confirmation page after successful subscription creation
 * @author Agent 1 - Senior Full Stack Developer
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Dashboard as DashboardIcon,
  Receipt as ReceiptIcon,
  Settings as SettingsIcon

  } from '@mui/icons-material';
import { useAppSelector } from '../../hooks/redux';
import { ROUTES } from '../../constants';

const SubscriptionSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentSubscription } = useAppSelector((state: any) => state.subscription);

  useEffect(() => {
    // If no subscription, redirect to plans
    if (!currentSubscription) {
      const timer = setTimeout(() => {
        navigate(ROUTES.SUBSCRIPTION_PLANS);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentSubscription, navigate]);

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        {/* Success Icon */}
        <Box sx={{ mb: 3 }}>
          <CheckIcon 
            sx={{ 
              fontSize: 80, 
              color: 'success.main',
              animation: 'pulse 1.5s ease-in-out infinite',
              '@keyframes pulse': {
                '0%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.1)' },
                '100%': { transform: 'scale(1)' }}}} 
          />
        </Box>

        {/* Success Message */}
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold" color="success.main">
          Success!
        </Typography>
        <Typography variant="h5" gutterBottom color="text.secondary">
          Your subscription is now active
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Welcome to StudySpot! You now have access to all premium features.
        </Typography>

        {/* Subscription Details */}
        {currentSubscription && (
          <Box sx={{ mb: 4, p: 3, bgcolor: 'action.hover', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Subscription Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Plan: <strong>{currentSubscription.plan_display_name || currentSubscription.plan_name}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Billing: <strong>{currentSubscription.billing_cycle === 'monthly' ? 'Monthly' : 'Yearly'}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Status: <strong style={{ color: 'green' }}>{currentSubscription.status.toUpperCase()}</strong>
            </Typography>
          </Box>
        )}

        {/* Next Steps */}
        <Box sx={{ textAlign: 'left', mb: 4 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            What's Next?
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <DashboardIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Explore your dashboard"
                secondary="View analytics, manage bookings, and more"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <ReceiptIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="View invoices"
                secondary="Access and download your billing history"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <SettingsIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Manage subscription"
                secondary="Update your plan, billing info, and preferences"
              />
            </ListItem>
          </List>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate(ROUTES.DASHBOARD)}
          >
            Go to Dashboard
          </Button>
          <Button
            variant="outlined"
            color="primary"
            size="large"
            onClick={() => navigate(ROUTES.SUBSCRIPTION_MANAGE)}
          >
            Manage Subscription
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default React.memo(SubscriptionSuccessPage);



