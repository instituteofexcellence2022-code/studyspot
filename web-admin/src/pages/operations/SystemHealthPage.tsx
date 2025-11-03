import {
  Box,
  Card,
  Typography,
  Button,
  TextField,
  Select,
  Tabs,
  Tab,
  Avatar,
  Alert,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  MenuItem,
  Chip,
  CardContent
} from '@mui/material';
/**
 * System Health Monitoring Page
 * 
 * Features:
 * - Real-time system health monitoring
 * - Service status and performance metrics
 * - Alert management and notification
 * - Infrastructure monitoring
 * - Performance dashboards
 * - SLA/SLO tracking
 */

import React, { useState, useEffect } from 'react';
import { Add as AddIcon,
  AdminPanelSettings as AdminIcon,
  Analytics as AnalyticsIcon,
  Assessment as AssessmentIcon,
  Assignment as AuditIcon,
  Backup as BackupIcon,
  BarChart as BarChartIcon,
  BugReport as BugReportIcon,
  Business as BusinessIcon,
  CheckCircle as CheckIcon,
  ChevronRight as ChevronRightIcon,
  Cloud as CloudIcon,
  Code as CodeIcon,
  DataUsage as DataIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  Fingerprint as FingerprintIcon,
  Flag as FlagIcon,
  Group as GroupIcon,
  History as HistoryIcon,
  Key as KeyIcon,
  Lock as LockIcon,
  Memory as MemoryIcon,
  MonitorHeart as HealthIcon,
  NetworkCheck as NetworkIcon,
  Notifications as NotificationsIcon,
  Pause as PauseIcon,
  Person as PersonIcon,
  PieChart as PieChartIcon,
  PlayArrow as PlayIcon,
  PrivacyTip as PrivacyIcon,
  QrCode as QrCodeIcon,
  Refresh as RefreshIcon,
  Report as ReportIcon,
  RestartAlt as RestartIcon,
  Router as RouterIcon,
  Schedule as ScheduleIcon,
  Science as ScienceIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Shield as ShieldIcon,
  ShowChart as ShowChartIcon,
  Smartphone as SmartphoneIcon,
  Sms as SmsIcon,
  Speed as SpeedIcon,
  Stop as StopIcon,
  Storage as DatabaseIcon,
  Storage as StorageIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  Upload as UploadIcon,
  VerifiedUser as VerifiedUserIcon,
  Visibility as ViewIcon,
  VpnKey as VpnKeyIcon,
  Warning as WarningIcon } from '@mui/icons-material';
;
interface ServiceHealth {
  id: string;
  name: string;
  type: 'api' | 'database' | 'cache' | 'storage' | 'queue' | 'external';
  status: 'healthy' | 'degraded' | 'down' | 'maintenance';
  uptime: number;
  responseTime: number;
  errorRate: number;
  throughput: number;
  lastCheck: string;
  dependencies: string[];
  alerts: number;
  sla: number;
  region: string;
  version: string;
}

interface Alert {
  id: string;
  serviceId: string;
  severity: 'critical' | 'warning' | 'info';
  type: 'performance' | 'availability' | 'error' | 'security';
  title: string;
  description: string;
  status: 'active' | 'acknowledged' | 'resolved';
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  acknowledgedBy?: string;
  resolvedBy?: string;
  metrics: {
    threshold: number;
    current: number;
    unit: string;
  };
}

interface SLAMetric {
  id: string;
  name: string;
  target: number;
  current: number;
  unit: string;
  status: 'meeting' | 'at_risk' | 'breach';
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
}

const SystemHealthPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [slaMetrics, setSlaMetrics] = useState<SLAMetric[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceHealth | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Mock data
  useEffect(() => {
    setServices([
      {
        id: '1',
        name: 'API Gateway',
        type: 'api',
        status: 'healthy',
        uptime: 99.9,
        responseTime: 120,
        errorRate: 0.1,
        throughput: 1250,
        lastCheck: '2024-01-15T10:30:00Z',
        dependencies: ['load_balancer', 'auth_service'],
        alerts: 0,
        sla: 99.5,
        region: 'us-east-1',
        version: '2.1.0'
      },
      {
        id: '2',
        name: 'PostgreSQL Database',
        type: 'database',
        status: 'degraded',
        uptime: 99.2,
        responseTime: 450,
        errorRate: 2.1,
        throughput: 890,
        lastCheck: '2024-01-15T10:29:00Z',
        dependencies: ['backup_service'],
        alerts: 2,
        sla: 99.9,
        region: 'us-east-1',
        version: '14.5'
      },
      {
        id: '3',
        name: 'Redis Cache',
        type: 'cache',
        status: 'healthy',
        uptime: 99.8,
        responseTime: 15,
        errorRate: 0.05,
        throughput: 5000,
        lastCheck: '2024-01-15T10:30:00Z',
        dependencies: [],
        alerts: 0,
        sla: 99.0,
        region: 'us-east-1',
        version: '6.2'
      },
      {
        id: '4',
        name: 'AWS S3 Storage',
        type: 'storage',
        status: 'healthy',
        uptime: 99.95,
        responseTime: 200,
        errorRate: 0.01,
        throughput: 300,
        lastCheck: '2024-01-15T10:28:00Z',
        dependencies: ['aws_iam'],
        alerts: 0,
        sla: 99.9,
        region: 'us-east-1',
        version: 'latest'
      },
      {
        id: '5',
        name: 'RabbitMQ Queue',
        type: 'queue',
        status: 'down',
        uptime: 0,
        responseTime: 0,
        errorRate: 100,
        throughput: 0,
        lastCheck: '2024-01-15T10:25:00Z',
        dependencies: ['database'],
        alerts: 5,
        sla: 99.0,
        region: 'us-east-1',
        version: '3.9'
      },
      {
        id: '6',
        name: 'Stripe Payment API',
        type: 'external',
        status: 'healthy',
        uptime: 99.9,
        responseTime: 180,
        errorRate: 0.2,
        throughput: 150,
        lastCheck: '2024-01-15T10:30:00Z',
        dependencies: [],
        alerts: 0,
        sla: 99.9,
        region: 'global',
        version: '2020-08-27'
      }
    ]);

    setAlerts([
      {
        id: '1',
        serviceId: '2',
        severity: 'warning',
        type: 'performance',
        title: 'High Database Response Time',
        description: 'PostgreSQL response time is above threshold',
        status: 'active',
        createdAt: '2024-01-15T10:15:00Z',
        metrics: {
          threshold: 300,
          current: 450,
          unit: 'ms'
        }
      },
      {
        id: '2',
        serviceId: '2',
        severity: 'warning',
        type: 'error',
        title: 'Database Error Rate Increased',
        description: 'Error rate has increased to 2.1%',
        status: 'acknowledged',
        createdAt: '2024-01-15T09:45:00Z',
        acknowledgedAt: '2024-01-15T09:50:00Z',
        acknowledgedBy: 'admin@company.com',
        metrics: {
          threshold: 1.0,
          current: 2.1,
          unit: '%'
        }
      },
      {
        id: '3',
        serviceId: '5',
        severity: 'critical',
        type: 'availability',
        title: 'RabbitMQ Service Down',
        description: 'RabbitMQ service is completely unavailable',
        status: 'active',
        createdAt: '2024-01-15T10:25:00Z',
        metrics: {
          threshold: 99.0,
          current: 0,
          unit: '%'
        }
      }
    ]);

    setSlaMetrics([
      {
        id: '1',
        name: 'API Availability',
        target: 99.9,
        current: 99.95,
        unit: '%',
        status: 'meeting',
        trend: 'up',
        lastUpdated: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        name: 'Response Time',
        target: 200,
        current: 185,
        unit: 'ms',
        status: 'meeting',
        trend: 'stable',
        lastUpdated: '2024-01-15T10:30:00Z'
      },
      {
        id: '3',
        name: 'Error Rate',
        target: 0.1,
        current: 0.08,
        unit: '%',
        status: 'meeting',
        trend: 'down',
        lastUpdated: '2024-01-15T10:30:00Z'
      },
      {
        id: '4',
        name: 'Database Uptime',
        target: 99.9,
        current: 99.2,
        unit: '%',
        status: 'at_risk',
        trend: 'down',
        lastUpdated: '2024-01-15T10:29:00Z'
      }
    ]);
  }, []);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'degraded': return 'warning';
      case 'down': return 'error';
      case 'maintenance': return 'info';
      case 'meeting': return 'success';
      case 'at_risk': return 'warning';
      case 'breach': return 'error';
      case 'critical': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      case 'active': return 'error';
      case 'acknowledged': return 'warning';
      case 'resolved': return 'success';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'api': return <CloudIcon />;
      case 'database': return <DatabaseIcon />;
      case 'cache': return <MemoryIcon />;
      case 'storage': return <StorageIcon />;
      case 'queue': return <RouterIcon />;
      case 'external': return <NetworkIcon />;
      default: return <HealthIcon />;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <ErrorIcon />;
      case 'warning': return <WarningIcon />;
      case 'info': return <CheckIcon />;
      default: return <HealthIcon />;
    }
  };

  const filteredServices = services.filter((service: any) => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || service.status === filterStatus;
    const matchesType = filterType === 'all' || service.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const healthMetrics = {
    totalServices: services.length,
    healthyServices: services.filter((s: any) => s.status === 'healthy').length,
    degradedServices: services.filter((s: any) => s.status === 'degraded').length,
    downServices: services.filter((s: any) => s.status === 'down').length,
    totalAlerts: alerts.length,
    activeAlerts: alerts.filter((a: any) => a.status === 'active').length,
    criticalAlerts: alerts.filter((a: any) => a.severity === 'critical').length,
    averageUptime: services.reduce((sum, s) => sum + s.uptime, 0) / services.length
  };

  const TabPanel = ({ children, value, index }: { children: React.ReactNode; value: number; index: number }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            System Health Monitoring
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor system health, performance, and availability across all services
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => setLoading(true)}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
          >
            Add Monitor
          </Button>
        </Box>
      </Box>

      {/* Health Metrics Cards */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 3,
        mb: 3 
      }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                <CheckIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Healthy Services</Typography>
                <Typography variant="h4">{healthMetrics.healthyServices}</Typography>
                <Typography variant="body2" color="text.secondary">
                  of {healthMetrics.totalServices} total
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                <WarningIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Active Alerts</Typography>
                <Typography variant="h4">{healthMetrics.activeAlerts}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {healthMetrics.criticalAlerts} critical
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                <ErrorIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Down Services</Typography>
                <Typography variant="h4">{healthMetrics.downServices}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {healthMetrics.degradedServices} degraded
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                <TrendingUpIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Avg Uptime</Typography>
                <Typography variant="h4">{healthMetrics.averageUptime.toFixed(1)}%</Typography>
                <Typography variant="body2" color="text.secondary">
                  Across all services
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Services" />
          <Tab label="Alerts" />
          <Tab label="SLA/SLO" />
          <Tab label="Analytics" />
        </Tabs>

        {/* Services Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Service Health Status</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="healthy">Healthy</MenuItem>
                  <MenuItem value="degraded">Degraded</MenuItem>
                  <MenuItem value="down">Down</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="api">API</MenuItem>
                  <MenuItem value="database">Database</MenuItem>
                  <MenuItem value="cache">Cache</MenuItem>
                  <MenuItem value="storage">Storage</MenuItem>
                  <MenuItem value="queue">Queue</MenuItem>
                  <MenuItem value="external">External</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Service</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Uptime</TableCell>
                  <TableCell>Response Time</TableCell>
                  <TableCell>Error Rate</TableCell>
                  <TableCell>Alerts</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {getTypeIcon(service.type)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{service.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {service.region} • v{service.version}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={service.type}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={service.status}
                        color={getStatusColor(service.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          {service.uptime}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={service.uptime}
                          color={service.uptime >= 99 ? 'success' : service.uptime >= 95 ? 'warning' : 'error'}
                          sx={{ width: 60, height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {service.responseTime}ms
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color={service.errorRate > 1 ? 'error.main' : 'text.primary'}>
                        {service.errorRate}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Badge badgeContent={service.alerts} color="error">
                        <NotificationsIcon />
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => setSelectedService(service)}>
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small">
                          <SettingsIcon />
                        </IconButton>
                        <IconButton size="small">
                          <RestartIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Alerts Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>Active Alerts</Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Alert</TableCell>
                  <TableCell>Service</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Metrics</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {alerts.map((alert) => {
                  const service = services.find(s => s.id === alert.serviceId);
                  return (
                    <TableRow key={alert.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2">{alert.title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {alert.description}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {service?.name || 'Unknown Service'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={alert.severity}
                          color={getStatusColor(alert.severity) as any}
                          size="small"
                          icon={getSeverityIcon(alert.severity)}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={alert.status}
                          color={getStatusColor(alert.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {alert.metrics.current} {alert.metrics.unit}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          (threshold: {alert.metrics.threshold})
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(alert.createdAt).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(alert.createdAt).toLocaleTimeString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton size="small">
                            <CheckIcon />
                          </IconButton>
                          <IconButton size="small">
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small">
                            <ViewIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* SLA/SLO Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>SLA/SLO Metrics</Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
            {slaMetrics.map((metric) => (
              <Card key={metric.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">{metric.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Target: {metric.target} {metric.unit}
                      </Typography>
                    </Box>
                    <Chip
                      label={metric.status.replace('_', ' ')}
                      color={getStatusColor(metric.status) as any}
                      size="small"
                    />
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h4">
                        {metric.current} {metric.unit}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {metric.trend === 'up' && <TrendingUpIcon color="success" />}
                        {metric.trend === 'down' && <TrendingUpIcon sx={{ transform: 'rotate(180deg)' }} color="error" />}
                        {metric.trend === 'stable' && <TrendingUpIcon color="disabled" />}
                      </Box>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(metric.current / metric.target) * 100}
                      color={metric.status === 'meeting' ? 'success' : metric.status === 'at_risk' ? 'warning' : 'error'}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary">
                    Last updated: {new Date(metric.lastUpdated).toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>Health Analytics</Typography>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 3,
            mb: 3 
          }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Uptime Trends</Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">Chart placeholder</Typography>
                </Box>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Response Time Distribution</Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">Chart placeholder</Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Recent Health Events</Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <ErrorIcon color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Service outage detected"
                    secondary="RabbitMQ Queue - Status: Down - Duration: 5 minutes - Time: 2024-01-15 10:25:00"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <WarningIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Performance degradation"
                    secondary="PostgreSQL Database - Response time: 450ms - Threshold: 300ms - Time: 2024-01-15 10:15:00"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Service recovered"
                    secondary="API Gateway - Status: Healthy - Uptime: 99.9% - Time: 2024-01-15 09:30:00"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </TabPanel>
      </Card>

      {/* Service Details Dialog */}
      <Dialog open={!!selectedService} onClose={() => setSelectedService(null)} maxWidth="md" fullWidth>
        <DialogTitle>Service Details</DialogTitle>
        <DialogContent>
          {selectedService && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedService.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedService.type} • {selectedService.region} • v{selectedService.version}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Health Metrics</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Box>
                      <Typography variant="body2">Status: {selectedService.status}</Typography>
                      <Typography variant="body2">Uptime: {selectedService.uptime}%</Typography>
                      <Typography variant="body2">SLA: {selectedService.sla}%</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2">Response Time: {selectedService.responseTime}ms</Typography>
                      <Typography variant="body2">Error Rate: {selectedService.errorRate}%</Typography>
                      <Typography variant="body2">Throughput: {selectedService.throughput}/min</Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Dependencies</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {selectedService.dependencies.map((dep) => (
                      <Chip
                        key={dep}
                        label={dep}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Last Check</Typography>
                  <Typography variant="body2">
                    {new Date(selectedService.lastCheck).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedService(null)}>Close</Button>
          <Button variant="contained">Configure Monitoring</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SystemHealthPage;
