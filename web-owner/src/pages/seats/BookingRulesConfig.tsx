import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  Chip,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  AccessTime,
  Payment,
  Block,
  Rule,
} from '@mui/icons-material';

const BookingRulesConfig: React.FC = () => {
  const rules = [
    {
      category: 'Timing',
      icon: <AccessTime color="primary" />,
      rules: [
        { name: 'Advance Booking Window', description: 'Students can book 30 days in advance, minimum 2 hours notice' },
        { name: 'Holiday Restrictions', description: 'Special rules for holidays and weekends' },
      ],
    },
    {
      category: 'Payment',
      icon: <Payment color="success" />,
      rules: [
        { name: 'Payment Deadline', description: 'Payment must be completed within 24 hours of booking' },
        { name: 'Auto-Cancellation', description: 'Unpaid bookings automatically cancelled after deadline' },
      ],
    },
    {
      category: 'Cancellation',
      icon: <Block color="warning" />,
      rules: [
        { name: 'Refund Policy', description: '100% refund if cancelled 24+ hours before' },
        { name: 'Late Cancellation', description: '50% refund for 6-24 hours, 0% for less than 6 hours' },
      ],
    },
    {
      category: 'Restrictions',
      icon: <Rule color="error" />,
      rules: [
        { name: 'Maximum Bookings', description: 'Students limited to 1 concurrent active booking' },
        { name: 'No-Show Policy', description: 'Penalties after 2 no-shows: 7-day suspension' },
      ],
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Booking Rules & Policies</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          Add New Rule
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Configure booking rules to automate your library operations and ensure fair usage policies.
        Changes take effect immediately for new bookings.
      </Alert>

      <Stack spacing={3}>
        {rules.map((category, index) => (
          <Paper key={index} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              {category.icon}
              <Typography variant="h6">{category.category} Rules</Typography>
            </Box>

            <Stack spacing={1}>
              {category.rules.map((rule, ruleIndex) => (
                <Card key={ruleIndex} variant="outlined">
                  <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle1">{rule.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {rule.description}
                      </Typography>
                    </Box>
                    <Chip label="Active" color="success" size="small" />
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Paper>
        ))}
      </Stack>

      {/* Refund Schedule */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Cancellation Refund Schedule
        </Typography>
        <Stack direction="row" spacing={2}>
          <Box sx={{ flex: 1, textAlign: 'center', p: 2, bgcolor: 'success.lighter', borderRadius: 1 }}>
            <Typography variant="h5" color="success.main">100%</Typography>
            <Typography variant="caption">24+ hours before</Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: 'center', p: 2, bgcolor: 'warning.lighter', borderRadius: 1 }}>
            <Typography variant="h5" color="warning.main">75%</Typography>
            <Typography variant="caption">12-24 hours</Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: 'center', p: 2, bgcolor: 'warning.lighter', borderRadius: 1 }}>
            <Typography variant="h5" color="warning.main">50%</Typography>
            <Typography variant="caption">6-12 hours</Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: 'center', p: 2, bgcolor: 'error.lighter', borderRadius: 1 }}>
            <Typography variant="h5" color="error.main">25%</Typography>
            <Typography variant="caption">2-6 hours</Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: 'center', p: 2, bgcolor: 'error.lighter', borderRadius: 1 }}>
            <Typography variant="h5" color="error.main">0%</Typography>
            <Typography variant="caption">&lt; 2 hours</Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default BookingRulesConfig;















