// ============================================
// SYSTEM HEALTH & MONITORING PAGE
// ============================================

import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Stack,
  Chip,
  LinearProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  CloudDone as CloudIcon,
  Storage as StorageIcon,
  Memory as MemoryIcon,
  Speed as SpeedIcon,
  Dns as DnsIcon,
  Security as SecurityIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Router as RouterIcon,
} from '@mui/icons-material';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { toast } from 'react-toastify';

interface Service {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  responseTime: number;
  lastCheck: string;
}

interface SystemMetric {
  name: string;
  value: number;
  max: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const SystemHealthPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Mock services data
  const services: Service[] = [
    { name: 'API Gateway', status: 'healthy', uptime: 99.98, responseTime: 45, lastCheck: '2024-10-30T10:30:00Z' },
    { name: 'Database', status: 'healthy', uptime: 99.95, responseTime: 12, lastCheck: '2024-10-30T10:30:00Z' },
    { name: 'Cache (Redis)', status: 'healthy', uptime: 99.99, responseTime: 3, lastCheck: '2024-10-30T10:30:00Z' },
    { name: 'Storage (S3)', status: 'healthy', uptime: 100, responseTime: 89, lastCheck: '2024-10-30T10:30:00Z' },
    { name: 'Email Service', status: 'healthy', uptime: 99.92, responseTime: 234, lastCheck: '2024-10-30T10:30:00Z' },
    { name: 'Authentication', status: 'healthy', uptime: 99.97, responseTime: 56, lastCheck: '2024-10-30T10:30:00Z' },
    { name: 'Queue (RabbitMQ)', status: 'degraded', uptime: 98.5, responseTime: 145, lastCheck: '2024-10-30T10:30:00Z' },
    { name: 'Search (Algolia)', status: 'healthy', uptime: 99.99, responseTime: 78, lastCheck: '2024-10-30T10:30:00Z' },
  ];

  // Mock system metrics
  const metrics: SystemMetric[] = [
    { name: 'CPU Usage', value: 45, max: 100, unit: '%', status: 'good' },
    { name: 'Memory Usage', value: 68, max: 100, unit: '%', status: 'warning' },
    { name: 'Disk Usage', value: 52, max: 100, unit: '%', status: 'good' },
    { name: 'Network I/O', value: 234, max: 1000, unit: 'Mbps', status: 'good' },
    { name: 'Active Connections', value: 1247, max: 5000, unit: '', status: 'good' },
    { name: 'Request Rate', value: 3421, max: 10000, unit: '/min', status: 'good' },
  ];

  // Mock performance data for charts
  const performanceData = [
    { time: '00:00', cpu: 35, memory: 62, requests: 2100 },
    { time: '04:00', cpu: 28, memory: 58, requests: 1800 },
    { time: '08:00', cpu: 52, memory: 72, requests: 4200 },
    { time: '12:00', cpu: 65, memory: 78, requests: 5800 },
    { time: '16:00', cpu: 58, memory: 75, requests: 5200 },
    { time: '20:00', cpu: 45, memory: 68, requests: 3400 },
    { time: 'Now', cpu: 45, memory: 68, requests: 3421 },
  ];

  const responseTimeData = [
    { service: 'Cache', time: 3 },
    { service: 'DB', time: 12 },
    { service: 'API', time: 45 },
    { service: 'Auth', time: 56 },
    { service: 'Search', time: 78 },
    { service: 'Storage', time: 89 },
    { service: 'Queue', time: 145 },
    { service: 'Email', time: 234 },
  ];

  const handleRefresh = () => {
    setLastRefresh(new Date());
    toast.success('System health data refreshed');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'good':
        return 'success';
      case 'degraded':
      case 'warning':
        return 'warning';
      case 'down':
      case 'critical':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'good':
        return <CheckCircleIcon color="success" />;
      case 'degraded':
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'down':
      case 'critical':
        return <ErrorIcon color="error" />;
      default:
        return <CheckCircleIcon />;
    }
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const healthyServices = services.filter(s => s.status === 'healthy').length;
  const degradedServices = services.filter(s => s.status === 'degraded').length;
  const downServices = services.filter(s => s.status === 'down').length;
  const avgResponseTime = Math.round(services.reduce((sum, s) => sum + s.responseTime, 0) / services.length);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            System Health & Monitoring
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Real-time system performance and service status
          </Typography>
        </Box>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="caption" color="text.secondary">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        </Stack>
      </Box>

      {/* Overall Status Alert */}
      {degradedServices > 0 || downServices > 0 ? (
        <Alert severity={downServices > 0 ? 'error' : 'warning'} sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight="medium">
            {downServices > 0
              ? `⚠️ System Alert: ${downServices} service(s) are down`
              : `⚡ Performance Notice: ${degradedServices} service(s) are experiencing degraded performance`}
          </Typography>
        </Alert>
      ) : (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight="medium">
            ✅ All Systems Operational - No issues detected
          </Typography>
        </Alert>
      )}

      {/* Key Metrics Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
          <Box sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <CheckCircleIcon />
              <Typography variant="body2">Healthy Services</Typography>
            </Stack>
            <Typography variant="h3" fontWeight="bold">
              {healthyServices}/{services.length}
            </Typography>
            <Typography variant="caption">
              {((healthyServices / services.length) * 100).toFixed(1)}% uptime
            </Typography>
          </Box>
        </Card>

        <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
          <Box sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <SpeedIcon />
              <Typography variant="body2">Avg Response Time</Typography>
            </Stack>
            <Typography variant="h3" fontWeight="bold">
              {avgResponseTime}ms
            </Typography>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <TrendingDownIcon fontSize="small" />
              <Typography variant="caption">12% improvement</Typography>
            </Stack>
          </Box>
        </Card>

        <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
          <Box sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <MemoryIcon />
              <Typography variant="body2">Memory Usage</Typography>
            </Stack>
            <Typography variant="h3" fontWeight="bold">
              68%
            </Typography>
            <Typography variant="caption">6.8 GB / 10 GB</Typography>
          </Box>
        </Card>

        <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <Box sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <RouterIcon />
              <Typography variant="body2">Request Rate</Typography>
            </Stack>
            <Typography variant="h3" fontWeight="bold">
              3.4K
            </Typography>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <TrendingUpIcon fontSize="small" />
              <Typography variant="caption">per minute</Typography>
            </Stack>
          </Box>
        </Card>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs
          value={activeTab}
          onChange={(_e, v) => setActiveTab(v)}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab label="Services Status" />
          <Tab label="System Metrics" />
          <Tab label="Performance Charts" />
        </Tabs>

        {/* Tab 1: Services Status */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ px: 3, pb: 3 }}>
            <List>
              {services.map((service, index) => (
                <React.Fragment key={service.name}>
                  <ListItem
                    sx={{
                      bgcolor: service.status !== 'healthy' ? 'action.hover' : 'transparent',
                      borderRadius: 1,
                      mb: 1,
                    }}
                    secondaryAction={
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ textAlign: 'right', minWidth: 100 }}>
                          <Typography variant="body2" fontWeight="medium">
                            {service.responseTime}ms
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            response time
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right', minWidth: 80 }}>
                          <Typography variant="body2" fontWeight="medium">
                            {service.uptime}%
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            uptime
                          </Typography>
                        </Box>
                        <Chip
                          label={service.status}
                          color={getStatusColor(service.status) as any}
                          size="small"
                          sx={{ minWidth: 90, textTransform: 'capitalize' }}
                        />
                      </Stack>
                    }
                  >
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mr: 35 }}>
                      {getStatusIcon(service.status)}
                      <ListItemText
                        primary={service.name}
                        secondary={`Last checked: ${formatTimestamp(service.lastCheck)}`}
                      />
                    </Stack>
                  </ListItem>
                  {index < services.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Box>
        </TabPanel>

        {/* Tab 2: System Metrics */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ px: 3, pb: 3 }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                gap: 3,
              }}
            >
              {metrics.map((metric) => (
                <Card variant="outlined" key={metric.name}>
                  <Box sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="body1" fontWeight="medium">
                        {metric.name}
                      </Typography>
                      <Chip
                        label={metric.status}
                        size="small"
                        color={getStatusColor(metric.status) as any}
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </Stack>
                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                      {metric.value.toLocaleString()}{metric.unit}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(metric.value / metric.max) * 100}
                      sx={{ mb: 1, height: 8, borderRadius: 4 }}
                      color={getStatusColor(metric.status) as any}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {metric.value.toLocaleString()} / {metric.max.toLocaleString()}{metric.unit}
                    </Typography>
                  </Box>
                </Card>
              ))}
            </Box>
          </Box>
        </TabPanel>

        {/* Tab 3: Performance Charts */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ px: 3, pb: 3 }}>
            <Stack spacing={3}>
              {/* CPU & Memory Chart */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
                  gap: 3,
                }}
              >
                <Card variant="outlined">
                  <Box sx={{ p: 2 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      CPU & Memory Usage (24h)
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Line type="monotone" dataKey="cpu" stroke="#8884d8" name="CPU %" />
                        <Line type="monotone" dataKey="memory" stroke="#82ca9d" name="Memory %" />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Card>

                {/* Request Rate Chart */}
                <Card variant="outlined">
                  <Box sx={{ p: 2 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Request Rate (24h)
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <RechartsTooltip />
                        <Line type="monotone" dataKey="requests" stroke="#ff7300" name="Requests/min" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Card>
              </Box>

              {/* Response Time Chart */}
              <Card variant="outlined">
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Service Response Times
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={responseTimeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="service" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="time" fill="#8884d8" name="Response Time (ms)" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Card>
            </Stack>
          </Box>
        </TabPanel>
      </Card>
    </Box>
  );
};

export default SystemHealthPage;

