import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Card,
  CardContent,
  Alert,
  Chip,
  Button,
} from '@mui/material';
import {
  TrendingUp,
  EventSeat,
  PeopleAlt,
  Speed,
  Psychology,
  CheckCircle,
  Warning,
} from '@mui/icons-material';

const CapacityPlanning: React.FC = () => {
  const stats = {
    totalCapacity: 220,
    currentOccupancy: 175,
    utilizationRate: 79.5,
    growth: 12,
  };

  const optimizationSuggestions = [
    {
      type: 'warning',
      title: 'Premium Zone Near Capacity',
      description: 'Premium zone is at 95% capacity. Consider adding 5-10 seats or opening a new premium section.',
      impact: 'High',
      estimatedRevenue: '+₹25,000/month',
    },
    {
      type: 'success',
      title: 'Morning Shift Underutilized',
      description: 'Morning shift (6-12 AM) shows only 45% occupancy. Launch early bird discount campaign.',
      impact: 'Medium',
      estimatedRevenue: '+₹15,000/month',
    },
    {
      type: 'info',
      title: 'Group Zone Optimization',
      description: 'Group study zone has low utilization (60%). Convert 10 seats to individual study seats.',
      impact: 'Medium',
      estimatedRevenue: '+₹8,000/month',
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Capacity Planning & Optimization
      </Typography>

      {/* Key Metrics */}
      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <EventSeat sx={{ fontSize: 40, color: 'primary.main' }} />
              <Box>
                <Typography variant="h4">{stats.totalCapacity}</Typography>
                <Typography variant="body2" color="text.secondary">Total Capacity</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PeopleAlt sx={{ fontSize: 40, color: 'success.main' }} />
              <Box>
                <Typography variant="h4">{stats.currentOccupancy}</Typography>
                <Typography variant="body2" color="text.secondary">Current Occupancy</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Speed sx={{ fontSize: 40, color: 'warning.main' }} />
              <Box>
                <Typography variant="h4">{stats.utilizationRate}%</Typography>
                <Typography variant="body2" color="text.secondary">Utilization Rate</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TrendingUp sx={{ fontSize: 40, color: 'info.main' }} />
              <Box>
                <Typography variant="h4">+{stats.growth}%</Typography>
                <Typography variant="body2" color="text.secondary">Growth</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Stack>

      {/* AI Optimization */}
      <Alert severity="info" icon={<Psychology />} sx={{ mb: 3 }}>
        <strong>AI-Powered Insights:</strong> Our optimization engine has identified 3 high-impact opportunities to increase revenue.
      </Alert>

      <Stack spacing={2}>
        {optimizationSuggestions.map((suggestion, index) => (
          <Card
            key={index}
            sx={{
              borderLeft: `4px solid`,
              borderLeftColor: suggestion.type === 'warning' ? 'warning.main' : suggestion.type === 'success' ? 'success.main' : 'info.main',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {suggestion.type === 'warning' && <Warning color="warning" />}
                    {suggestion.type === 'success' && <CheckCircle color="success" />}
                    <Typography variant="h6">{suggestion.title}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {suggestion.description}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip label={`Impact: ${suggestion.impact}`} size="small" color={suggestion.impact === 'High' ? 'error' : 'warning'} />
                    <Chip label={suggestion.estimatedRevenue} color="success" size="small" variant="outlined" />
                  </Stack>
                </Box>
                <Button variant="contained" size="small">
                  Implement
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Paper sx={{ p: 3, bgcolor: 'primary.main', color: 'white', mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Total Optimization Potential
        </Typography>
        <Typography variant="h3" gutterBottom>
          +₹48,000/month
        </Typography>
        <Typography variant="body2">
          By implementing all AI-powered suggestions, you can increase monthly revenue by approximately ₹48,000.
        </Typography>
      </Paper>
    </Box>
  );
};

export default CapacityPlanning;















