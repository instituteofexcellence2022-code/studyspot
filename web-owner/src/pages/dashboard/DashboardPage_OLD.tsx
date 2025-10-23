import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Paper,
} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import {
  LibraryBooks,
  EventSeat,
  People,
  TrendingUp,
  AttachMoney,
  CheckCircle,
  Group,
  Assessment,
} from '@mui/icons-material';

import { useAppSelector } from '../../hooks/redux';

const DashboardPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  // Enhanced stats from all 8 modules @ 20% level
  const stats = [
    {
      title: 'Total Libraries',
      value: '1',
      subtitle: 'Active branch',
      icon: <LibraryBooks />,
      color: '#1976d2',
    },
    {
      title: 'Total Seats',
      value: '6',
      subtitle: '3 available',
      icon: <EventSeat />,
      color: '#2e7d32',
    },
    {
      title: 'Students',
      value: '3',
      subtitle: '2 active today',
      icon: <People />,
      color: '#ed6c02',
    },
    {
      title: 'Staff Members',
      value: '3',
      subtitle: '2 active',
      icon: <Group />,
      color: '#9c27b0',
    },
    {
      title: 'Today Revenue',
      value: '₹6,800',
      subtitle: '2 payments',
      icon: <AttachMoney />,
      color: '#d32f2f',
    },
    {
      title: 'Attendance',
      value: '3',
      subtitle: '2 checked-in',
      icon: <CheckCircle />,
      color: '#0288d1',
    },
    {
      title: 'Fee Plans',
      value: '4',
      subtitle: 'Active plans',
      icon: <Assessment />,
      color: '#f57c00',
    },
    {
      title: 'Occupancy Rate',
      value: '50%',
      subtitle: '3/6 seats',
      icon: <TrendingUp />,
      color: '#388e3c',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome back, {user?.firstName}!
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Here's what's happening with your libraries today.
      </Typography>

      <Grid container spacing={3}>
        {/* Stats Cards - Enhanced to show all 8 modules */}
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={`dashboard-stat-${index}`}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    sx={{
                      backgroundColor: stat.color,
                      mr: 2,
                      width: 56,
                      height: 56,
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" component="div" fontWeight="bold">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {stat.subtitle}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Recent Activity */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No recent activity to display.
            </Typography>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Quick actions will be available here.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
