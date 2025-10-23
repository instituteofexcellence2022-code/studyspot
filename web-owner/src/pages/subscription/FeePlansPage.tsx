import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  AttachMoney as MoneyIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';

// Mock fee plans data
const MOCK_PLANS = [
  {
    id: 1,
    name: 'Hourly Plan',
    type: 'hourly',
    price: 50,
    duration: '1 hour',
    features: ['WiFi', 'AC', 'Power outlet'],
    status: 'active',
  },
  {
    id: 2,
    name: 'Daily Plan',
    type: 'daily',
    price: 300,
    duration: '1 day (8 hours)',
    features: ['WiFi', 'AC', 'Power outlet', 'Locker'],
    status: 'active',
  },
  {
    id: 3,
    name: 'Weekly Plan',
    type: 'weekly',
    price: 1500,
    duration: '7 days',
    features: ['WiFi', 'AC', 'Power outlet', 'Locker', 'Parking'],
    status: 'active',
  },
  {
    id: 4,
    name: 'Monthly Premium',
    type: 'monthly',
    price: 5000,
    duration: '30 days',
    features: ['WiFi', 'AC', 'Power outlet', 'Locker', 'Parking', '24/7 Access'],
    status: 'active',
  },
];

interface FeePlan {
  id: number;
  name: string;
  type: string;
  price: number;
  duration: string;
  features: string[];
  status: string;
}

const FeePlansPage: React.FC = () => {
  const [plans, setPlans] = useState<FeePlan[]>(MOCK_PLANS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: '',
    type: 'hourly',
    price: 0,
    duration: '',
    features: '',
    status: 'active',
  });

  const handleAddPlan = () => {
    const plan: FeePlan = {
      id: plans.length + 1,
      name: newPlan.name,
      type: newPlan.type,
      price: newPlan.price,
      duration: newPlan.duration,
      features: newPlan.features.split(',').map(f => f.trim()),
      status: newPlan.status,
    };
    setPlans([...plans, plan]);
    setDialogOpen(false);
    setNewPlan({
      name: '',
      type: 'hourly',
      price: 0,
      duration: '',
      features: '',
      status: 'active',
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'hourly':
        return 'info';
      case 'daily':
        return 'success';
      case 'weekly':
        return 'warning';
      case 'monthly':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Fee Plans
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Create Plan
        </Button>
      </Box>

      {/* Plans Grid */}
      <Grid container spacing={3}>
        {plans.map((plan) => (
          <Grid item xs={12} sm={6} md={4} key={plan.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: plan.type === 'monthly' ? '2px solid #1976d2' : '1px solid #e0e0e0',
                position: 'relative',
              }}
            >
              {plan.type === 'monthly' && (
                <Chip
                  label="Popular"
                  color="primary"
                  size="small"
                  sx={{ position: 'absolute', top: 10, right: 10 }}
                />
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                  {plan.name}
                </Typography>
                <Chip
                  label={plan.type}
                  size="small"
                  color={getTypeColor(plan.type) as any}
                  sx={{ mb: 2 }}
                />
                
                <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2 }}>
                  <MoneyIcon sx={{ color: 'success.main', mr: 1 }} />
                  <Typography variant="h4" component="span" color="success.main">
                    ₹{plan.price}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    / {plan.type}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TimeIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {plan.duration}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Includes:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {plan.features.map((feature, index) => (
                    <Chip
                      key={index}
                      label={feature}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>

                <Chip
                  label={plan.status}
                  size="small"
                  color={plan.status === 'active' ? 'success' : 'default'}
                  sx={{ mt: 2 }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Create Plan Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Fee Plan</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Plan Name"
              value={newPlan.name}
              onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
              placeholder="e.g., Monthly Premium"
              fullWidth
              required
            />
            
            <FormControl fullWidth>
              <InputLabel>Plan Type</InputLabel>
              <Select
                value={newPlan.type}
                onChange={(e) => setNewPlan({ ...newPlan, type: e.target.value })}
                label="Plan Type"
              >
                <MenuItem value="hourly">Hourly</MenuItem>
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Price (₹)"
              type="number"
              value={newPlan.price}
              onChange={(e) => setNewPlan({ ...newPlan, price: Number(e.target.value) })}
              fullWidth
              required
            />

            <TextField
              label="Duration"
              value={newPlan.duration}
              onChange={(e) => setNewPlan({ ...newPlan, duration: e.target.value })}
              placeholder="e.g., 30 days"
              fullWidth
              required
            />

            <TextField
              label="Features (comma separated)"
              value={newPlan.features}
              onChange={(e) => setNewPlan({ ...newPlan, features: e.target.value })}
              placeholder="e.g., WiFi, AC, Power outlet"
              fullWidth
              multiline
              rows={2}
            />

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={newPlan.status}
                onChange={(e) => setNewPlan({ ...newPlan, status: e.target.value })}
                label="Status"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddPlan}
            variant="contained"
            disabled={!newPlan.name || !newPlan.price || !newPlan.duration}
          >
            Create Plan
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeePlansPage;

