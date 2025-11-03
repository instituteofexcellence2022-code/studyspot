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
  CardContent,
  Paper
} from '@mui/material';
/**
 * Webhook Management Page
 * 
 * Features:
 * - Webhook creation and configuration
 * - Inbound and outbound webhook management
 * - Webhook testing and validation
 * - Retry mechanisms and failure handling
 * - Webhook monitoring and analytics
 * - Security and authentication management
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
  Http as HttpIcon,
  Key as KeyIcon,
  Lock as LockIcon,
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
  Schedule as ScheduleIcon,
  Science as ScienceIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Shield as ShieldIcon,
  ShowChart as ShowChartIcon,
  Smartphone as SmartphoneIcon,
  Sms as SmsIcon,
  Stop as StopIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  Upload as UploadIcon,
  VerifiedUser as VerifiedUserIcon,
  Visibility as ViewIcon,
  VpnKey as VpnKeyIcon,
  Warning as WarningIcon,
  Webhook as WebhookIcon } from '@mui/icons-material';
;
interface Webhook {
  id: string;
  name: string;
  description: string;
  type: 'inbound' | 'outbound';
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  status: 'active' | 'inactive' | 'error' | 'testing';
  events: string[];
  authentication: {
    type: 'none' | 'basic' | 'bearer' | 'api_key' | 'hmac';
    credentials?: {
      username?: string;
      password?: string;
      token?: string;
      apiKey?: string;
      secret?: string;
    };
  };
  retryPolicy: {
    enabled: boolean;
    maxRetries: number;
    backoffStrategy: 'linear' | 'exponential' | 'fixed';
    initialDelay: number;
    maxDelay: number;
  };
  security: {
    verifySignature: boolean;
    allowedIPs: string[];
    rateLimit: {
      enabled: boolean;
      requestsPerMinute: number;
    };
  };
  statistics: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    lastTriggered: string;
    successRate: number;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  tenantId?: string;
}

interface WebhookEvent {
  id: string;
  webhookId: string;
  eventType: string;
  payload: any;
  status: 'pending' | 'processing' | 'delivered' | 'failed' | 'retrying';
  attempts: number;
  maxAttempts: number;
  nextRetryAt?: string;
  createdAt: string;
  processedAt?: string;
  errorMessage?: string;
  responseCode?: number;
  responseTime?: number;
}

const WebhookManagementPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Mock data
  useEffect(() => {
    setWebhooks([
      {
        id: '1',
        name: 'User Registration Webhook',
        description: 'Triggers when a new user registers in the system',
        type: 'outbound',
        url: 'https://api.example.com/webhooks/user-registration',
        method: 'POST',
        status: 'active',
        events: ['user.created', 'user.verified'],
        authentication: {
          type: 'bearer',
          credentials: {
            token: 'sk_live_...'
          }
        },
        retryPolicy: {
          enabled: true,
          maxRetries: 3,
          backoffStrategy: 'exponential',
          initialDelay: 1000,
          maxDelay: 30000
        },
        security: {
          verifySignature: true,
          allowedIPs: ['192.168.1.0/24', '10.0.0.0/8'],
          rateLimit: {
            enabled: true,
            requestsPerMinute: 100
          }
        },
        statistics: {
          totalRequests: 1250,
          successfulRequests: 1187,
          failedRequests: 63,
          averageResponseTime: 245,
          lastTriggered: '2024-01-15T10:30:00Z',
          successRate: 95.0
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        createdBy: 'admin@company.com',
        tenantId: 'tenant-1'
      },
      {
        id: '2',
        name: 'Payment Notification Webhook',
        description: 'Receives payment notifications from Stripe',
        type: 'inbound',
        url: 'https://api.studyspot.com/webhooks/stripe-payments',
        method: 'POST',
        status: 'active',
        events: ['payment.succeeded', 'payment.failed', 'payment.refunded'],
        authentication: {
          type: 'hmac',
          credentials: {
            secret: 'whsec_...'
          }
        },
        retryPolicy: {
          enabled: false,
          maxRetries: 0,
          backoffStrategy: 'linear',
          initialDelay: 0,
          maxDelay: 0
        },
        security: {
          verifySignature: true,
          allowedIPs: ['54.187.174.169', '54.187.205.235'],
          rateLimit: {
            enabled: true,
            requestsPerMinute: 200
          }
        },
        statistics: {
          totalRequests: 3420,
          successfulRequests: 3398,
          failedRequests: 22,
          averageResponseTime: 89,
          lastTriggered: '2024-01-15T09:45:00Z',
          successRate: 99.4
        },
        createdAt: '2024-01-05T00:00:00Z',
        updatedAt: '2024-01-14T16:20:00Z',
        createdBy: 'billing@company.com'
      },
      {
        id: '3',
        name: 'Booking Status Webhook',
        description: 'Notifies external systems about booking status changes',
        type: 'outbound',
        url: 'https://api.library.edu/webhooks/booking-updates',
        method: 'POST',
        status: 'error',
        events: ['booking.created', 'booking.confirmed', 'booking.cancelled'],
        authentication: {
          type: 'api_key',
          credentials: {
            apiKey: 'ak_live_...'
          }
        },
        retryPolicy: {
          enabled: true,
          maxRetries: 5,
          backoffStrategy: 'exponential',
          initialDelay: 2000,
          maxDelay: 60000
        },
        security: {
          verifySignature: false,
          allowedIPs: [],
          rateLimit: {
            enabled: false,
            requestsPerMinute: 0
          }
        },
        statistics: {
          totalRequests: 890,
          successfulRequests: 756,
          failedRequests: 134,
          averageResponseTime: 1200,
          lastTriggered: '2024-01-14T16:20:00Z',
          successRate: 85.0
        },
        createdAt: '2024-01-08T00:00:00Z',
        updatedAt: '2024-01-14T16:20:00Z',
        createdBy: 'integration@company.com',
        tenantId: 'tenant-2'
      }
    ]);

    setEvents([
      {
        id: '1',
        webhookId: '1',
        eventType: 'user.created',
        payload: { userId: '123', email: 'user@example.com' },
        status: 'delivered',
        attempts: 1,
        maxAttempts: 3,
        createdAt: '2024-01-15T10:30:00Z',
        processedAt: '2024-01-15T10:30:05Z',
        responseCode: 200,
        responseTime: 245
      },
      {
        id: '2',
        webhookId: '2',
        eventType: 'payment.succeeded',
        payload: { paymentId: 'pi_123', amount: 29.99 },
        status: 'delivered',
        attempts: 1,
        maxAttempts: 1,
        createdAt: '2024-01-15T09:45:00Z',
        processedAt: '2024-01-15T09:45:02Z',
        responseCode: 200,
        responseTime: 89
      },
      {
        id: '3',
        webhookId: '3',
        eventType: 'booking.cancelled',
        payload: { bookingId: '456', reason: 'user_cancelled' },
        status: 'retrying',
        attempts: 3,
        maxAttempts: 5,
        nextRetryAt: '2024-01-15T11:00:00Z',
        createdAt: '2024-01-15T10:15:00Z',
        errorMessage: 'Connection timeout',
        responseCode: 0,
        responseTime: 30000
      }
    ]);
  }, []);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'error': return 'error';
      case 'testing': return 'warning';
      case 'delivered': return 'success';
      case 'failed': return 'error';
      case 'retrying': return 'warning';
      case 'pending': return 'info';
      case 'processing': return 'warning';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'inbound': return <HttpIcon />;
      case 'outbound': return <WebhookIcon />;
      default: return <WebhookIcon />;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'success';
      case 'POST': return 'primary';
      case 'PUT': return 'warning';
      case 'DELETE': return 'error';
      case 'PATCH': return 'info';
      default: return 'default';
    }
  };

  const filteredWebhooks = webhooks.filter((webhook: any) => {
    const matchesSearch = webhook.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         webhook.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         webhook.url.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || webhook.status === filterStatus;
    const matchesType = filterType === 'all' || webhook.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const webhookMetrics = {
    totalWebhooks: webhooks.length,
    activeWebhooks: webhooks.filter((w: any) => w.status === 'active').length,
    errorWebhooks: webhooks.filter((w: any) => w.status === 'error').length,
    totalRequests: webhooks.reduce((sum, w) => sum + w.statistics.totalRequests, 0),
    averageSuccessRate: webhooks.reduce((sum, w) => sum + w.statistics.successRate, 0) / webhooks.length,
    totalEvents: events.length,
    pendingEvents: events.filter((e: any) => e.status === 'pending' || e.status === 'retrying').length
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
            Webhook Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage inbound and outbound webhooks for system integrations
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
            Create Webhook
          </Button>
        </Box>
      </Box>

      {/* Webhook Metrics Cards */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 3,
        mb: 3 
      }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <WebhookIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Total Webhooks</Typography>
                <Typography variant="h4">{webhookMetrics.totalWebhooks}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {webhookMetrics.activeWebhooks} active
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                <CheckIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Success Rate</Typography>
                <Typography variant="h4">{webhookMetrics.averageSuccessRate.toFixed(1)}%</Typography>
                <Typography variant="body2" color="text.secondary">
                  Average across all webhooks
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                <TimelineIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Total Requests</Typography>
                <Typography variant="h4">{webhookMetrics.totalRequests.toLocaleString()}</Typography>
                <Typography variant="body2" color="text.secondary">
                  All time requests
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                <ErrorIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Pending Events</Typography>
                <Typography variant="h4">{webhookMetrics.pendingEvents}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Awaiting processing
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Webhooks" />
          <Tab label="Events" />
          <Tab label="Testing" />
          <Tab label="Analytics" />
        </Tabs>

        {/* Webhooks Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Webhook Configuration</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search webhooks..."
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
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="error">Error</MenuItem>
                  <MenuItem value="testing">Testing</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="inbound">Inbound</MenuItem>
                  <MenuItem value="outbound">Outbound</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Webhook</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Success Rate</TableCell>
                  <TableCell>Last Triggered</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredWebhooks.map((webhook) => (
                  <TableRow key={webhook.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {getTypeIcon(webhook.type)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{webhook.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {webhook.url}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={webhook.type}
                        color={webhook.type === 'inbound' ? 'primary' : 'secondary'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={webhook.method}
                        color={getMethodColor(webhook.method) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={webhook.status}
                        color={getStatusColor(webhook.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          {webhook.statistics.successRate.toFixed(1)}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={webhook.statistics.successRate}
                          color={webhook.statistics.successRate >= 95 ? 'success' : webhook.statistics.successRate >= 80 ? 'warning' : 'error'}
                          sx={{ width: 60, height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(webhook.statistics.lastTriggered).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(webhook.statistics.lastTriggered).toLocaleTimeString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => setSelectedWebhook(webhook)}>
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small">
                          <PlayIcon />
                        </IconButton>
                        <IconButton size="small">
                          <SettingsIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Events Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>Webhook Events</Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Event</TableCell>
                  <TableCell>Webhook</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Attempts</TableCell>
                  <TableCell>Response</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">{event.eventType}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {event.webhookId}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {webhooks.find(w => w.id === event.webhookId)?.name || 'Unknown'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={event.status}
                        color={getStatusColor(event.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {event.attempts}/{event.maxAttempts}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {event.responseCode || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {event.responseTime ? `${event.responseTime}ms` : 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(event.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(event.createdAt).toLocaleTimeString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small">
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small">
                          <PlayIcon />
                        </IconButton>
                        <IconButton size="small">
                          <HistoryIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Testing Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>Webhook Testing</Typography>
          
          <Box sx={{ display: 'grid', gap: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Test Webhook</Typography>
                <Box sx={{ display: 'grid', gap: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Select Webhook</InputLabel>
                    <Select>
                      {webhooks.map((webhook) => (
                        <MenuItem key={webhook.id} value={webhook.id}>
                          {webhook.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label="Test Payload (JSON)"
                    multiline
                    rows={4}
                    defaultValue='{"test": "data", "timestamp": "2024-01-15T10:30:00Z"}'
                  />
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="contained" startIcon={<PlayIcon />}>
                      Send Test
                    </Button>
                    <Button variant="outlined" startIcon={<CodeIcon />}>
                      Generate Payload
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Webhook Validator</Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Validate webhook URLs and test connectivity
                </Alert>
                <Box sx={{ display: 'grid', gap: 2 }}>
                  <TextField
                    label="Webhook URL"
                    placeholder="https://api.example.com/webhook"
                    fullWidth
                  />
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="contained" startIcon={<CheckIcon />}>
                      Validate URL
                    </Button>
                    <Button variant="outlined" startIcon={<BugReportIcon />}>
                      Test Connection
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>Webhook Analytics</Typography>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 3,
            mb: 3 
          }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Request Volume</Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">Chart placeholder</Typography>
                </Box>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Success Rate Trends</Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">Chart placeholder</Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Recent Webhook Activity</Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Webhook delivered successfully"
                    secondary="User Registration Webhook - Event: user.created - Response: 200 - Time: 2024-01-15 10:30:05"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ErrorIcon color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Webhook delivery failed"
                    secondary="Booking Status Webhook - Event: booking.cancelled - Error: Connection timeout - Time: 2024-01-15 10:15:00"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <WarningIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Webhook retrying"
                    secondary="Booking Status Webhook - Attempt 3/5 - Next retry: 2024-01-15 11:00:00"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </TabPanel>
      </Card>

      {/* Webhook Details Dialog */}
      <Dialog open={!!selectedWebhook} onClose={() => setSelectedWebhook(null)} maxWidth="md" fullWidth>
        <DialogTitle>Webhook Details</DialogTitle>
        <DialogContent>
          {selectedWebhook && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedWebhook.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedWebhook.description}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Configuration</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Box>
                      <Typography variant="body2">Type: {selectedWebhook.type}</Typography>
                      <Typography variant="body2">Method: {selectedWebhook.method}</Typography>
                      <Typography variant="body2">Status: {selectedWebhook.status}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2">URL: {selectedWebhook.url}</Typography>
                      <Typography variant="body2">Auth: {selectedWebhook.authentication.type}</Typography>
                      <Typography variant="body2">Created: {new Date(selectedWebhook.createdAt).toLocaleDateString()}</Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Events</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {selectedWebhook.events.map((event) => (
                      <Chip
                        key={event}
                        label={event}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Statistics</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Box>
                      <Typography variant="body2">Total Requests: {selectedWebhook.statistics.totalRequests.toLocaleString()}</Typography>
                      <Typography variant="body2">Successful: {selectedWebhook.statistics.successfulRequests.toLocaleString()}</Typography>
                      <Typography variant="body2">Failed: {selectedWebhook.statistics.failedRequests.toLocaleString()}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2">Success Rate: {selectedWebhook.statistics.successRate.toFixed(1)}%</Typography>
                      <Typography variant="body2">Avg Response Time: {selectedWebhook.statistics.averageResponseTime}ms</Typography>
                      <Typography variant="body2">Last Triggered: {new Date(selectedWebhook.statistics.lastTriggered).toLocaleString()}</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedWebhook(null)}>Close</Button>
          <Button variant="contained">Edit Webhook</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WebhookManagementPage;






