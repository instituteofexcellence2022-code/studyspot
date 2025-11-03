import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  CheckCircle,
  Star,
  TrendingUp,
  People,
  AttachMoney,
  Close,
} from '@mui/icons-material';
import { revenueService } from '../../../services/api/revenue';
import { SubscriptionPlan } from '../types';
import { useAppDispatch } from '../../../hooks/redux';
import { showError, showSuccess } from '../../../store/slices/uiSlice';

const SubscriptionPlansPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await revenueService.getSubscriptionPlans();
      if (response.success && response.data) {
        setPlans(response.data);
      } else {
        const errorMsg = response.error?.message || 'Failed to fetch subscription plans.';
        setError(errorMsg);
        dispatch(showError(errorMsg));
      }
    } catch (err: any) {
      const errorMsg = err.message || 'An unexpected error occurred.';
      setError(errorMsg);
      dispatch(showError(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = () => {
    setEditingPlan(null);
    setOpenDialog(true);
  };

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPlan(null);
  };

  const handleSavePlan = () => {
    // TODO: Implement save logic
    dispatch(showSuccess(editingPlan ? 'Plan updated successfully!' : 'Plan created successfully!'));
    handleCloseDialog();
    fetchPlans();
  };

  const handleDeletePlan = (planId: string) => {
    // TODO: Implement delete logic
    dispatch(showSuccess('Plan deleted successfully!'));
    fetchPlans();
  };

  const formatCurrency = (amount: number, currency: string = '₹') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading Subscription Plans...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        <Typography variant="h6">Error Loading Plans</Typography>
        <Typography>{error}</Typography>
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Subscription Plans
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your platform's subscription tiers and pricing
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreatePlan}
          sx={{ height: 'fit-content' }}
        >
          Create New Plan
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
            Total Plans
          </Typography>
          <Typography variant="h4" fontWeight={600}>
            {plans.length}
          </Typography>
        </Paper>
        <Paper elevation={1} sx={{ p: 2 }}>
          <Box display="flex" alignItems="center" mb={1}>
            <People sx={{ fontSize: 20, color: 'primary.main', mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Total Subscribers
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={600}>
            {plans.reduce((sum, p) => sum + p.subscribers, 0)}
          </Typography>
        </Paper>
        <Paper elevation={1} sx={{ p: 2 }}>
          <Box display="flex" alignItems="center" mb={1}>
            <AttachMoney sx={{ fontSize: 20, color: 'success.main', mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Total MRR
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={600}>
            {formatCurrency(plans.reduce((sum, p) => sum + p.mrr, 0))}
          </Typography>
        </Paper>
        <Paper elevation={1} sx={{ p: 2 }}>
          <Box display="flex" alignItems="center" mb={1}>
            <TrendingUp sx={{ fontSize: 20, color: 'info.main', mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Active Plans
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={600}>
            {plans.filter((p) => p.status === 'active').length}
          </Typography>
        </Paper>
      </Box>

      {/* Plan Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
          gap: 3,
        }}
      >
        {plans.map((plan) => (
          <Box key={plan.id}>
            <Card
              elevation={2}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                border: plan.popular ? '2px solid' : '1px solid',
                borderColor: plan.popular ? 'primary.main' : 'divider',
              }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <Chip
                  icon={<Star />}
                  label="Most Popular"
                  color="primary"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                  }}
                />
              )}

              <CardContent sx={{ flexGrow: 1, pt: 3 }}>
                {/* Plan Name & Description */}
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  {plan.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {plan.description}
                </Typography>

                <Divider sx={{ my: 2 }} />

                {/* Pricing */}
                <Box display="flex" alignItems="baseline" mb={2}>
                  <Typography variant="h3" fontWeight={700} color="primary.main">
                    {formatCurrency(plan.price)}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" ml={1}>
                    / {plan.billingCycle}
                  </Typography>
                </Box>

                {/* Subscribers & MRR */}
                <Box display="flex" gap={1} mb={2}>
                  <Chip
                    icon={<People />}
                    label={`${plan.subscribers} subscribers`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    icon={<AttachMoney />}
                    label={`${formatCurrency(plan.mrr)} MRR`}
                    size="small"
                    variant="outlined"
                    color="success"
                  />
                </Box>

                {/* Features List */}
                <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
                  Features:
                </Typography>
                <List dense sx={{ py: 0 }}>
                  {plan.features.slice(0, 5).map((feature, index) => (
                    <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircle sx={{ fontSize: 18, color: 'success.main' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={feature}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                  {plan.features.length > 5 && (
                    <ListItem sx={{ px: 0, py: 0.5 }}>
                      <ListItemText
                        primary={`+${plan.features.length - 5} more features`}
                        primaryTypographyProps={{ variant: 'body2', color: 'primary.main' }}
                      />
                    </ListItem>
                  )}
                </List>

                {/* Status */}
                <Box mt={2}>
                  <Chip
                    label={plan.status === 'active' ? 'Active' : 'Inactive'}
                    color={plan.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                  {plan.trialDays > 0 && (
                    <Chip
                      label={`${plan.trialDays} days trial`}
                      size="small"
                      sx={{ ml: 1 }}
                      variant="outlined"
                    />
                  )}
                </Box>
              </CardContent>

              {/* Actions */}
              <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
                <Tooltip title="Edit Plan">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleEditPlan(plan)}
                  >
                    <Edit />
                  </IconButton>
                </Tooltip>
                {plan.name !== 'Free' && (
                  <Tooltip title="Delete Plan">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeletePlan(plan.id)}
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                )}
              </CardActions>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {editingPlan ? 'Edit Plan' : 'Create New Plan'}
            </Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 2,
            }}
          >
            <TextField
              fullWidth
              label="Plan Name"
              defaultValue={editingPlan?.name || ''}
              variant="outlined"
              size="small"
            />
            <TextField
              fullWidth
              label="Price (INR)"
              type="number"
              defaultValue={editingPlan?.price || 0}
              variant="outlined"
              size="small"
            />
            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
              <TextField
                fullWidth
                label="Description"
                defaultValue={editingPlan?.description || ''}
                variant="outlined"
                size="small"
                multiline
                rows={2}
              />
            </Box>
            <TextField
              fullWidth
              label="Billing Cycle"
              defaultValue={editingPlan?.billingCycle || 'monthly'}
              variant="outlined"
              size="small"
              select
              SelectProps={{ native: true }}
            >
              <option value="monthly">Monthly</option>
              <option value="annual">Annual</option>
            </TextField>
            <TextField
              fullWidth
              label="Trial Days"
              type="number"
              defaultValue={editingPlan?.trialDays || 0}
              variant="outlined"
              size="small"
            />
            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
              <FormControlLabel
                control={<Switch defaultChecked={editingPlan?.popular || false} />}
                label="Mark as Popular"
              />
            </Box>
            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
              <FormControlLabel
                control={<Switch defaultChecked={editingPlan?.status === 'active'} />}
                label="Active"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSavePlan} variant="contained">
            {editingPlan ? 'Update Plan' : 'Create Plan'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubscriptionPlansPage;

