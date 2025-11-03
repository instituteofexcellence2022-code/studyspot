import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Paper

  } from '@mui/material';
import Grid from '@mui/material/Grid';
import { EventSeat, LibraryBooks, TrendingUp } from '@mui/icons-material';
import { People } from '@mui/icons-material';

import { useAppSelector } from '../../hooks/redux';

const DashboardPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  const stats = [
    {
      title: 'Total Libraries',
      value: '12',
      icon: <LibraryBooks />,
      color: '#1976d2'},
    {
      title: 'Active Bookings',
      value: '45',
      icon: <EventSeat />,
      color: '#2e7d32'},
    {
      title: 'Total Users',
      value: '234',
      icon: <People />,
      color: '#ed6c02'},
    {
      title: 'Revenue',
      value: '$12,450',
      icon: <TrendingUp />,
      color: '#d32f2f'},
  ];

  return (
    <Box>
      {/* Portal Hero Section */}
      <Typography variant="h3" component="h1" gutterBottom>
        STUDYSPOT Admin Portal
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Platform Administration Dashboard
      </Typography>

      <Typography variant="h4" component="h1" gutterBottom>
        Welcome back, {user?.firstName}!
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Here's what's happening with your libraries today.
      </Typography>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        {stats.map((stat, index) => (
          <Grid xs={12} sm={6} md={3} key={`dashboard-stat-${index}`}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      backgroundColor: stat.color,
                      mr: 2}}
                  >
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" component="div">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Recent Activity */}
        <Grid xs={12} md={8}>
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
        <Grid xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Quick actions will be available here.
            </Typography>
          </Paper>
        </Grid>

        {/* Informational Sections from user content */}
        <Grid xs={12}>
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              Tenant Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage library tenants and their settings
            </Typography>
          </Paper>
        </Grid>

        <Grid xs={12} md={6}>
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              Analytics
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View platform analytics and reports
            </Typography>
          </Paper>
        </Grid>

        <Grid xs={12} md={6}>
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              User Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage users and permissions
            </Typography>
          </Paper>
        </Grid>

        <Grid xs={12}>
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              System Health
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Monitor system performance and health
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;

