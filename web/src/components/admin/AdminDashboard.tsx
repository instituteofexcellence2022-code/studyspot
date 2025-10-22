import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Button,
} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import {
  Business,
  People,
  TrendingUp,
  AttachMoney,
  Warning,
  CheckCircle,
  Schedule,
  AdminPanelSettings,
} from '@mui/icons-material';

const AdminDashboard: React.FC = () => {
  const stats = [
    {
      title: 'Total Tenants',
      value: '24',
      icon: <Business />,
      color: '#1976d2',
      change: '+12%',
      changeColor: 'success',
    },
    {
      title: 'Active Users',
      value: '1,234',
      icon: <People />,
      color: '#2e7d32',
      change: '+8%',
      changeColor: 'success',
    },
    {
      title: 'Monthly Revenue',
      value: '$45,678',
      icon: <AttachMoney />,
      color: '#ed6c02',
      change: '+15%',
      changeColor: 'success',
    },
    {
      title: 'System Health',
      value: '99.9%',
      icon: <TrendingUp />,
      color: '#d32f2f',
      change: '+0.1%',
      changeColor: 'success',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'tenant_created',
      message: 'New tenant "University Library" registered',
      timestamp: '2 hours ago',
      status: 'success',
    },
    {
      id: 2,
      type: 'payment_received',
      message: 'Payment received from "City Library" - $299/month',
      timestamp: '4 hours ago',
      status: 'success',
    },
    {
      id: 3,
      type: 'system_alert',
      message: 'High CPU usage detected on server-02',
      timestamp: '6 hours ago',
      status: 'warning',
    },
    {
      id: 4,
      type: 'user_signup',
      message: '150 new user registrations today',
      timestamp: '8 hours ago',
      status: 'info',
    },
  ];

  const systemAlerts = [
    {
      id: 1,
      type: 'warning',
      title: 'Database Connection Pool',
      message: 'Connection pool usage at 85%',
      timestamp: '1 hour ago',
    },
    {
      id: 2,
      type: 'info',
      title: 'Scheduled Maintenance',
      message: 'System maintenance scheduled for tonight 2 AM',
      timestamp: '3 hours ago',
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'tenant_created':
        return <Business />;
      case 'payment_received':
        return <AttachMoney />;
      case 'system_alert':
        return <Warning />;
      case 'user_signup':
        return <People />;
      default:
        return <AdminPanelSettings />;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'success.main';
      case 'warning':
        return 'warning.main';
      case 'info':
        return 'info.main';
      default:
        return 'text.secondary';
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Platform overview and system management
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={`stat-${index}`}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      backgroundColor: stat.color,
                      mr: 2,
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="div">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                  <Chip
                    label={stat.change}
                    color={stat.changeColor as any}
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Activity */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <List>
              {recentActivities.map((activity) => (
                <ListItem key={activity.id} sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Avatar sx={{ backgroundColor: getActivityColor(activity.status), width: 32, height: 32 }}>
                      {getActivityIcon(activity.type)}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={activity.message}
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Schedule sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {activity.timestamp}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
            <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
              View All Activity
            </Button>
          </Paper>
        </Grid>

        {/* System Alerts */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Alerts
            </Typography>
            <List>
              {systemAlerts.map((alert) => (
                <ListItem key={alert.id} sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Avatar 
                      sx={{ 
                        backgroundColor: alert.type === 'warning' ? 'warning.main' : 'info.main',
                        width: 32, 
                        height: 32 
                      }}
                    >
                      {alert.type === 'warning' ? <Warning /> : <CheckCircle />}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={alert.title}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {alert.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {alert.timestamp}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
            <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
              View All Alerts
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;

