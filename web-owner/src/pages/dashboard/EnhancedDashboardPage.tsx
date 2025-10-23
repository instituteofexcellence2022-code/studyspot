import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Paper,
  Chip
} from '@mui/material';
import {
  TrendingUp,
  People,
  AttachMoney,
  EventSeat,
  Refresh,
  Add,
  CalendarToday
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const EnhancedDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const metrics = [
    { title: 'Total Students', value: '342', icon: <People />, color: '#1976d2' },
    { title: 'Active Students', value: '287', icon: <People />, color: '#2e7d32' },
    { title: 'Current Occupancy', value: '145/200', icon: <EventSeat />, color: '#ed6c02' },
    { title: "Today's Revenue", value: '$1,250', icon: <AttachMoney />, color: '#9c27b0' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Library Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome back! Here's what's happening with your library today.
          </Typography>
        </Box>
        <Button
          startIcon={<Refresh />}
          variant="outlined"
        >
          Refresh
        </Button>
      </Box>

      {/* Metrics Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        {metrics.map((metric, index) => (
          <Card key={index} sx={{ minHeight: 140 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  bgcolor: `${metric.color}20`, 
                  color: metric.color, 
                  p: 1, 
                  borderRadius: 2,
                  display: 'flex'
                }}>
                  {metric.icon}
                </Box>
              </Box>
              <Typography variant="h4" sx={{ mb: 1 }}>
                {metric.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {metric.title}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={() => navigate('/owner/students/new')}
          >
            Add Student
          </Button>
          <Button 
            variant="contained"
            startIcon={<CalendarToday />}
            onClick={() => navigate('/owner/bookings/new')}
          >
            New Booking
          </Button>
          <Button 
            variant="contained"
            onClick={() => navigate('/owner/attendance')}
          >
            Mark Attendance
          </Button>
          <Button 
            variant="outlined"
            onClick={() => navigate('/owner/students')}
          >
            View Students
          </Button>
        </Stack>
      </Paper>

      {/* Recent Activity */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Recent Activity
        </Typography>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Box>
              <Typography variant="body1">New student registered</Typography>
              <Typography variant="caption" color="text.secondary">John Doe - 5 minutes ago</Typography>
            </Box>
            <Chip label="New" color="success" size="small" />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Box>
              <Typography variant="body1">Booking created</Typography>
              <Typography variant="caption" color="text.secondary">Seat A-15 - 1 hour ago</Typography>
            </Box>
            <Chip label="Booking" color="primary" size="small" />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Box>
              <Typography variant="body1">Payment received</Typography>
              <Typography variant="caption" color="text.secondary">$50.00 - 2 hours ago</Typography>
            </Box>
            <Chip label="Payment" color="success" size="small" />
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default EnhancedDashboardPage;
