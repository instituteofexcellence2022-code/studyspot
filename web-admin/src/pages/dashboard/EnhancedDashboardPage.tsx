/**
 * Enhanced Enterprise Dashboard
 * Comprehensive platform overview with all microservices integration
 * 
 * Features:
 * - AI Service Analytics
 * - Advanced Analytics Dashboard
 * - Automation Workflows
 * - Communication Metrics
 * - CRM Insights
 * - Data Pipeline Status
 * - Face Recognition Analytics
 * - ML Model Performance
 * - Notification Statistics
 * - Payment Analytics
 * - Multi-language Support
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  AutoAwesome as AutomationIcon,
  CreditCard as CreditIcon,
  EventSeat as BookingIcon,
  Face as FaceIcon,
  Language as LanguageIcon,
  LibraryBooks as LibraryIcon,
  Message as CommunicationIcon,
  Notifications as NotificationIcon,
  Payment as PaymentIcon,
  Psychology as AIIcon,
  SmartToy as MLIcon,
  Storage as DataIcon,
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  People as CRMIcon,
  Person as UserIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface MicroserviceStatus {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  uptime: number;
  requests: number;
  responseTime: number;
  lastUpdate: string;
}

interface ServiceMetrics {
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  errorRate: number;
  activeUsers: number;
  revenue: number;
  growthRate: number;
}

const EnhancedDashboard: React.FC = () => {
  const [serviceStatuses, setServiceStatuses] = useState<MicroserviceStatus[]>([
    {
      name: 'AI Service',
      status: 'healthy',
      uptime: 99.9,
      requests: 15420,
      responseTime: 245,
      lastUpdate: '2 minutes ago'
    },
    {
      name: 'Analytics Service',
      status: 'healthy',
      uptime: 99.8,
      requests: 8930,
      responseTime: 180,
      lastUpdate: '1 minute ago'
    },
    {
      name: 'Automation Service',
      status: 'warning',
      uptime: 98.5,
      requests: 5670,
      responseTime: 320,
      lastUpdate: '3 minutes ago'
    },
    {
      name: 'Communication Service',
      status: 'healthy',
      uptime: 99.7,
      requests: 12340,
      responseTime: 195,
      lastUpdate: '1 minute ago'
    },
    {
      name: 'CRM Service',
      status: 'healthy',
      uptime: 99.6,
      requests: 7890,
      responseTime: 210,
      lastUpdate: '2 minutes ago'
    },
    {
      name: 'Data Pipeline',
      status: 'healthy',
      uptime: 99.4,
      requests: 4560,
      responseTime: 450,
      lastUpdate: '4 minutes ago'
    },
    {
      name: 'Face Recognition',
      status: 'healthy',
      uptime: 99.2,
      requests: 3240,
      responseTime: 1200,
      lastUpdate: '5 minutes ago'
    },
    {
      name: 'ML Service',
      status: 'healthy',
      uptime: 99.1,
      requests: 6780,
      responseTime: 890,
      lastUpdate: '3 minutes ago'
    },
    {
      name: 'Notification Service',
      status: 'warning',
      uptime: 98.8,
      requests: 25680,
      responseTime: 450,
      lastUpdate: '2 minutes ago'
    },
    {
      name: 'Payment Service',
      status: 'healthy',
      uptime: 99.95,
      requests: 12340,
      responseTime: 320,
      lastUpdate: '1 minute ago'
    },
    {
      name: 'i18n Service',
      status: 'healthy',
      uptime: 99.3,
      requests: 2100,
      responseTime: 380,
      lastUpdate: '2 minutes ago'
    }
  ]);

  const [metrics, setMetrics] = useState<ServiceMetrics>({
    totalRequests: 125420,
    successRate: 98.7,
    averageResponseTime: 285,
    errorRate: 1.3,
    activeUsers: 2840,
    revenue: 125000,
    growthRate: 15.2
  });

  const [selectedService, setSelectedService] = useState<MicroserviceStatus | null>(null);
  const [serviceDetailsOpen, setServiceDetailsOpen] = useState(false);

  // Enhanced platform metrics data
  const performanceData = [
    { time: '00:00', requests: 3200, errors: 15, responseTime: 250, activeUsers: 1200 },
    { time: '04:00', requests: 1800, errors: 8, responseTime: 200, activeUsers: 800 },
    { time: '08:00', requests: 8500, errors: 25, responseTime: 300, activeUsers: 2400 },
    { time: '12:00', requests: 12000, errors: 35, responseTime: 280, activeUsers: 3200 },
    { time: '16:00', requests: 9800, errors: 20, responseTime: 260, activeUsers: 2800 },
    { time: '20:00', requests: 6500, errors: 18, responseTime: 240, activeUsers: 1800 }
  ];

  const serviceDistribution = [
    { name: 'AI Service', value: 18, color: '#6366f1' },
    { name: 'Analytics', value: 15, color: '#8b5cf6' },
    { name: 'Communication', value: 22, color: '#059669' },
    { name: 'Payment', value: 12, color: '#dc2626' },
    { name: 'Notification', value: 20, color: '#ea580c' },
    { name: 'ML Service', value: 8, color: '#7c3aed' },
    { name: 'Face Recognition', value: 5, color: '#0891b2' }
  ];

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'healthy': return '#16a34a';
      case 'warning': return '#d97706';
      case 'error': return '#dc2626';
      default: return '#6b7280';
    }
  };

  // Platform-wide analytics data
  const platformMetrics = {
    totalTenants: 45,
    activeTenants: 42,
    totalUsers: 2840,
    monthlyRevenue: 125000,
    growthRate: 15.2,
    systemUptime: 99.7,
    averageResponseTime: 285,
    totalBookings: 15680,
    successRate: 98.7
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'healthy': return <CheckIcon />;
      case 'warning': return <WarningIcon />;
      case 'error': return <ErrorIcon />;
      default: return <ErrorIcon />;
    }
  };

  const handleServiceClick = (service: MicroserviceStatus) => {
    setSelectedService(service);
    setServiceDetailsOpen(true);
  };

  const refreshData = () => {
    // Simulate data refresh
    console.log('Refreshing dashboard data...');
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Enterprise Platform Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Comprehensive microservices monitoring and analytics
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={refreshData}
          >
            Refresh Data
          </Button>
          <Button
            variant="contained"
            startIcon={<SettingsIcon />}
          >
            Settings
        </Button>
        </Box>
      </Box>

      {/* Quick Actions */}
      <Typography variant="h5" gutterBottom sx={{ mt: 3, mb: 2 }}>
        Quick Actions
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<LibraryIcon />}
          sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
          onClick={() => window.location.href = '/admin/tenants'}
        >
          Manage Tenants
        </Button>
        <Button
          variant="contained"
          startIcon={<SecurityIcon />}
          sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#c62828' } }}
          onClick={() => window.location.href = '/admin/security'}
        >
          Security Settings
        </Button>
        <Button
          variant="contained"
          startIcon={<AnalyticsIcon />}
          sx={{ bgcolor: '#7b1fa2', '&:hover': { bgcolor: '#6a1b9a' } }}
          onClick={() => window.location.href = '/admin/analytics'}
        >
          Platform Analytics
        </Button>
        <Button
          variant="contained"
          startIcon={<CreditIcon />}
          sx={{ bgcolor: '#f57c00', '&:hover': { bgcolor: '#ef6c00' } }}
          onClick={() => window.location.href = '/credits/management'}
        >
          Credit Management
        </Button>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => window.location.reload()}
        >
          Refresh Data
        </Button>
      </Box>

      {/* Platform Overview Metrics */}
      <Typography variant="h5" gutterBottom sx={{ mt: 3, mb: 2 }}>
        Platform Overview
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#1976d2', mr: 2 }}>
                  <LibraryIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Total Tenants</Typography>
                  <Typography variant="h4" color="primary">
                    {platformMetrics.totalTenants}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {platformMetrics.activeTenants} active
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#2e7d32', mr: 2 }}>
                  <UserIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Total Users</Typography>
                  <Typography variant="h4" color="success.main">
                    {platformMetrics.totalUsers.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ color: '#16a34a', mr: 1, fontSize: 16 }} />
                <Typography variant="body2" color="success.main">
                  +{platformMetrics.growthRate}% growth
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#ed6c02', mr: 2 }}>
                  <CreditIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Monthly Revenue</Typography>
                  <Typography variant="h4" color="warning.main">
                    ${platformMetrics.monthlyRevenue.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Platform-wide
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#9c27b0', mr: 2 }}>
                  <BookingIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Total Bookings</Typography>
                  <Typography variant="h4" color="secondary.main">
                    {platformMetrics.totalBookings.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                This month
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* System Performance Metrics */}
      <Typography variant="h5" gutterBottom sx={{ mt: 3, mb: 2 }}>
        System Performance
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#6366f1', mr: 2 }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Total Requests</Typography>
                  <Typography variant="h4" color="primary">
                    {metrics.totalRequests.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ color: '#16a34a', mr: 1, fontSize: 16 }} />
                <Typography variant="body2" color="success.main">
                  +{metrics.growthRate}% from last month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#16a34a', mr: 2 }}>
                  <CheckIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Success Rate</Typography>
                  <Typography variant="h4" color="success.main">
                    {metrics.successRate}%
                  </Typography>
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={metrics.successRate}
                sx={{ mt: 1 }}
                color="success"
              />
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#d97706', mr: 2 }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Avg Response Time</Typography>
                  <Typography variant="h4" color="warning.main">
                    {metrics.averageResponseTime}ms
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Target: &lt;300ms
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#dc2626', mr: 2 }}>
                  <ErrorIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Error Rate</Typography>
                  <Typography variant="h4" color="error.main">
                    {metrics.errorRate}%
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Target: &lt;1%
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Service Status Grid */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Microservices Status
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {serviceStatuses.map((service, index) => (
            <Box sx={{ flex: '1 1 250px', minWidth: 250 }} key={index}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4}}}
              onClick={() => handleServiceClick(service)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: getStatusColor(service.status), mr: 2 }}>
                    {getStatusIcon(service.status)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">{service.name}</Typography>
                    <Chip
                      label={service.status}
                      size="small"
                      sx={{
                        bgcolor: getStatusColor(service.status),
                        color: 'white',
                        fontSize: '0.75rem'}}
                    />
                  </Box>
                </Box>
                
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Uptime: {service.uptime}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={service.uptime}
                    sx={{ mt: 0.5 }}
                    color={service.status === 'healthy' ? 'success' : 'warning'}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Requests: {service.requests.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {service.responseTime}ms
                  </Typography>
                </Box>

                <Typography variant="caption" color="text.secondary">
                  Updated {service.lastUpdate}
                </Typography>
              </CardContent>
            </Card>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Performance Charts */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ flex: '2 1 600px', minWidth: 400 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance Overview (24h)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="requests"
                    stackId="1"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="errors"
                    stackId="2"
                    stroke="#dc2626"
                    fill="#dc2626"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Service Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={serviceDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {serviceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Service Details Dialog */}
      <Dialog
        open={serviceDetailsOpen}
        onClose={() => setServiceDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedService?.name} - Service Details
        </DialogTitle>
        <DialogContent>
          {selectedService && (
            <Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={selectedService.status}
                    sx={{
                      bgcolor: getStatusColor(selectedService.status),
                      color: 'white'}}
                  />
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Uptime
                  </Typography>
                  <Typography variant="h6">
                    {selectedService.uptime}%
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Requests
                  </Typography>
                  <Typography variant="h6">
                    {selectedService.requests.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Avg Response Time
                  </Typography>
                  <Typography variant="h6">
                    {selectedService.responseTime}ms
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
        <Typography variant="h6" gutterBottom>
          Recent Activity
        </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Service started successfully"
                    secondary="2 minutes ago"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <TrendingUpIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Performance optimization applied"
                    secondary="5 minutes ago"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <RefreshIcon color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Configuration updated"
                    secondary="10 minutes ago"
                  />
                </ListItem>
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setServiceDetailsOpen(false)}>
            Close
          </Button>
          <Button variant="contained">
            View Full Logs
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EnhancedDashboard;