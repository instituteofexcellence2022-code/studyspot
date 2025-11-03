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
 * Integration Registry Page
 * 
 * Features:
 * - Integration provider management
 * - Available integrations catalog
 * - Integration configuration and setup
 * - Integration health monitoring
 * - API documentation and testing
 * - Integration marketplace
 */

import React, { useState, useEffect } from 'react';
import { Add as AddIcon,
  AdminPanelSettings as AdminIcon,
  Analytics as AnalyticsIcon,
  Api as ApiIcon,
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
  IntegrationInstructions as IntegrationIcon,
  Key as KeyIcon,
  Lock as LockIcon,
  Notifications as NotificationsIcon,
  Pause as PauseIcon,
  Payment as PaymentIcon,
  Person as PersonIcon,
  PieChart as PieChartIcon,
  PlayArrow as PlayIcon,
  PrivacyTip as PrivacyIcon,
  QrCode as QrCodeIcon,
  Refresh as RefreshIcon,
  Report as ReportIcon,
  RestartAlt as RestartIcon,
  Schedule as ScheduleIcon,
  School as SchoolIcon,
  Science as ScienceIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Shield as ShieldIcon,
  ShowChart as ShowChartIcon,
  Smartphone as SmartphoneIcon,
  Sms as SmsIcon,
  Stop as StopIcon,
  Storage as StorageIcon,
  Store as StoreIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  Upload as UploadIcon,
  VerifiedUser as VerifiedUserIcon,
  Visibility as ViewIcon,
  VpnKey as VpnKeyIcon,
  Warning as WarningIcon } from '@mui/icons-material';
;
interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'payment' | 'communication' | 'storage' | 'analytics' | 'education' | 'security' | 'other';
  provider: string;
  status: 'available' | 'installed' | 'configured' | 'active' | 'error' | 'deprecated';
  version: string;
  icon: string;
  features: string[];
  pricing: {
    type: 'free' | 'freemium' | 'paid' | 'enterprise';
    cost?: number;
    currency?: string;
  };
  configuration: {
    required: boolean;
    fields: {
      name: string;
      type: string;
      required: boolean;
      description: string;
    }[];
  };
  health: {
    status: 'healthy' | 'degraded' | 'down' | 'unknown';
    lastCheck: string;
    uptime: number;
    responseTime: number;
  };
  usage: {
    tenants: number;
    requests: number;
    lastUsed: string;
  };
  documentation: {
    apiDocs: string;
    setupGuide: string;
    supportUrl: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface IntegrationInstance {
  id: string;
  integrationId: string;
  tenantId: string;
  tenantName: string;
  status: 'active' | 'inactive' | 'error' | 'pending';
  configuration: any;
  lastSync: string;
  errorCount: number;
  createdAt: string;
  updatedAt: string;
}

const IntegrationRegistryPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [instances, setInstances] = useState<IntegrationInstance[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data
  useEffect(() => {
    setIntegrations([
      {
        id: '1',
        name: 'Stripe Payment Gateway',
        description: 'Accept payments online with Stripe\'s secure payment processing',
        category: 'payment',
        provider: 'Stripe Inc.',
        status: 'active',
        version: '2.1.0',
        icon: 'stripe',
        features: ['Credit Cards', 'Digital Wallets', 'International Payments', 'Recurring Billing'],
        pricing: {
          type: 'paid',
          cost: 0.029,
          currency: 'USD'
        },
        configuration: {
          required: true,
          fields: [
            { name: 'api_key', type: 'text', required: true, description: 'Stripe API Key' },
            { name: 'webhook_secret', type: 'text', required: true, description: 'Webhook Secret' },
            { name: 'test_mode', type: 'boolean', required: false, description: 'Enable Test Mode' }
          ]
        },
        health: {
          status: 'healthy',
          lastCheck: '2024-01-15T10:30:00Z',
          uptime: 99.9,
          responseTime: 120
        },
        usage: {
          tenants: 45,
          requests: 125000,
          lastUsed: '2024-01-15T10:30:00Z'
        },
        documentation: {
          apiDocs: 'https://stripe.com/docs/api',
          setupGuide: 'https://docs.studyspot.com/integrations/stripe',
          supportUrl: 'https://support.stripe.com'
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        name: 'SendGrid Email Service',
        description: 'Reliable email delivery and marketing automation platform',
        category: 'communication',
        provider: 'Twilio SendGrid',
        status: 'active',
        version: '1.8.2',
        icon: 'sendgrid',
        features: ['Email Delivery', 'Templates', 'Analytics', 'A/B Testing'],
        pricing: {
          type: 'freemium',
          cost: 0,
          currency: 'USD'
        },
        configuration: {
          required: true,
          fields: [
            { name: 'api_key', type: 'text', required: true, description: 'SendGrid API Key' },
            { name: 'from_email', type: 'email', required: true, description: 'From Email Address' },
            { name: 'from_name', type: 'text', required: false, description: 'From Name' }
          ]
        },
        health: {
          status: 'healthy',
          lastCheck: '2024-01-15T10:25:00Z',
          uptime: 99.8,
          responseTime: 85
        },
        usage: {
          tenants: 38,
          requests: 89000,
          lastUsed: '2024-01-15T09:45:00Z'
        },
        documentation: {
          apiDocs: 'https://docs.sendgrid.com/api-reference',
          setupGuide: 'https://docs.studyspot.com/integrations/sendgrid',
          supportUrl: 'https://support.sendgrid.com'
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-14T16:20:00Z'
      },
      {
        id: '3',
        name: 'AWS S3 Storage',
        description: 'Scalable cloud storage for files and documents',
        category: 'storage',
        provider: 'Amazon Web Services',
        status: 'active',
        version: '3.2.1',
        icon: 'aws',
        features: ['File Storage', 'CDN', 'Backup', 'Versioning'],
        pricing: {
          type: 'paid',
          cost: 0.023,
          currency: 'USD'
        },
        configuration: {
          required: true,
          fields: [
            { name: 'access_key', type: 'text', required: true, description: 'AWS Access Key' },
            { name: 'secret_key', type: 'text', required: true, description: 'AWS Secret Key' },
            { name: 'bucket_name', type: 'text', required: true, description: 'S3 Bucket Name' },
            { name: 'region', type: 'text', required: true, description: 'AWS Region' }
          ]
        },
        health: {
          status: 'healthy',
          lastCheck: '2024-01-15T10:20:00Z',
          uptime: 99.95,
          responseTime: 200
        },
        usage: {
          tenants: 52,
          requests: 45000,
          lastUsed: '2024-01-15T08:30:00Z'
        },
        documentation: {
          apiDocs: 'https://docs.aws.amazon.com/s3/',
          setupGuide: 'https://docs.studyspot.com/integrations/aws-s3',
          supportUrl: 'https://aws.amazon.com/support'
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-13T14:15:00Z'
      },
      {
        id: '4',
        name: 'Google Analytics',
        description: 'Website and app analytics and reporting',
        category: 'analytics',
        provider: 'Google LLC',
        status: 'available',
        version: '4.0.0',
        icon: 'google',
        features: ['Analytics', 'Reporting', 'Custom Events', 'Real-time Data'],
        pricing: {
          type: 'free',
          cost: 0,
          currency: 'USD'
        },
        configuration: {
          required: true,
          fields: [
            { name: 'tracking_id', type: 'text', required: true, description: 'Google Analytics Tracking ID' },
            { name: 'measurement_id', type: 'text', required: false, description: 'GA4 Measurement ID' }
          ]
        },
        health: {
          status: 'unknown',
          lastCheck: 'Never',
          uptime: 0,
          responseTime: 0
        },
        usage: {
          tenants: 0,
          requests: 0,
          lastUsed: 'Never'
        },
        documentation: {
          apiDocs: 'https://developers.google.com/analytics',
          setupGuide: 'https://docs.studyspot.com/integrations/google-analytics',
          supportUrl: 'https://support.google.com/analytics'
        },
        createdAt: '2024-01-10T00:00:00Z',
        updatedAt: '2024-01-10T00:00:00Z'
      }
    ]);

    setInstances([
      {
        id: '1',
        integrationId: '1',
        tenantId: 'tenant-1',
        tenantName: 'University of California',
        status: 'active',
        configuration: { api_key: 'sk_live_...', test_mode: false },
        lastSync: '2024-01-15T10:30:00Z',
        errorCount: 0,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        integrationId: '2',
        tenantId: 'tenant-1',
        tenantName: 'University of California',
        status: 'active',
        configuration: { api_key: 'SG...', from_email: 'noreply@uc.edu' },
        lastSync: '2024-01-15T09:45:00Z',
        errorCount: 2,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T09:45:00Z'
      },
      {
        id: '3',
        integrationId: '3',
        tenantId: 'tenant-2',
        tenantName: 'MIT Libraries',
        status: 'error',
        configuration: { access_key: 'AKIA...', bucket_name: 'mit-studyspot' },
        lastSync: '2024-01-14T16:20:00Z',
        errorCount: 15,
        createdAt: '2024-01-05T00:00:00Z',
        updatedAt: '2024-01-14T16:20:00Z'
      }
    ]);
  }, []);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'available': return 'info';
      case 'installed': return 'warning';
      case 'configured': return 'primary';
      case 'error': return 'error';
      case 'deprecated': return 'default';
      case 'healthy': return 'success';
      case 'degraded': return 'warning';
      case 'down': return 'error';
      case 'unknown': return 'default';
      default: return 'default';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'payment': return <PaymentIcon />;
      case 'communication': return <EmailIcon />;
      case 'storage': return <StorageIcon />;
      case 'analytics': return <AnalyticsIcon />;
      case 'education': return <SchoolIcon />;
      case 'security': return <SecurityIcon />;
      default: return <IntegrationIcon />;
    }
  };

  const getPricingColor = (type: string) => {
    switch (type) {
      case 'free': return 'success';
      case 'freemium': return 'info';
      case 'paid': return 'warning';
      case 'enterprise': return 'primary';
      default: return 'default';
    }
  };

  const filteredIntegrations = integrations.filter((integration: any) => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || integration.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || integration.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const integrationMetrics = {
    totalIntegrations: integrations.length,
    activeIntegrations: integrations.filter((i: any) => i.status === 'active').length,
    availableIntegrations: integrations.filter((i: any) => i.status === 'available').length,
    totalInstances: instances.length,
    activeInstances: instances.filter((i: any) => i.status === 'active').length,
    errorInstances: instances.filter((i: any) => i.status === 'error').length,
    totalTenants: new Set(instances.map((i: any) => i.tenantId)).size
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
            Integration Registry
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Discover, configure, and manage third-party integrations
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
            Add Integration
          </Button>
        </Box>
      </Box>

      {/* Integration Metrics Cards */}
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
                <IntegrationIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Total Integrations</Typography>
                <Typography variant="h4">{integrationMetrics.totalIntegrations}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {integrationMetrics.activeIntegrations} active
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                <StoreIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Available</Typography>
                <Typography variant="h4">{integrationMetrics.availableIntegrations}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Ready to install
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                <BusinessIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Instances</Typography>
                <Typography variant="h4">{integrationMetrics.totalInstances}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {integrationMetrics.activeInstances} active
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
                <Typography variant="h6">Errors</Typography>
                <Typography variant="h4">{integrationMetrics.errorInstances}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Need attention
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Integrations" />
          <Tab label="Instances" />
          <Tab label="Marketplace" />
          <Tab label="Analytics" />
        </Tabs>

        {/* Integrations Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Available Integrations</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search integrations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  <MenuItem value="payment">Payment</MenuItem>
                  <MenuItem value="communication">Communication</MenuItem>
                  <MenuItem value="storage">Storage</MenuItem>
                  <MenuItem value="analytics">Analytics</MenuItem>
                  <MenuItem value="education">Education</MenuItem>
                  <MenuItem value="security">Security</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="available">Available</MenuItem>
                  <MenuItem value="installed">Installed</MenuItem>
                  <MenuItem value="configured">Configured</MenuItem>
                  <MenuItem value="error">Error</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 3 }}>
            {filteredIntegrations.map((integration) => (
              <Card key={integration.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {getCategoryIcon(integration.category)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{integration.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {integration.provider}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip
                        label={integration.status}
                        color={getStatusColor(integration.status) as any}
                        size="small"
                      />
                      <IconButton size="small" onClick={() => setSelectedIntegration(integration)}>
                        <ViewIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {integration.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    <Chip
                      label={integration.category}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                    <Chip
                      label={integration.pricing.type}
                      color={getPricingColor(integration.pricing.type) as any}
                      size="small"
                    />
                    <Chip
                      label={`v${integration.version}`}
                      color="default"
                      size="small"
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Health: {integration.health.status}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Uptime: {integration.health.uptime}%
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {integration.usage.tenants} tenants
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {integration.usage.requests.toLocaleString()} requests
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" startIcon={<AddIcon />}>
                      Install
                    </Button>
                    <Button size="small" startIcon={<ViewIcon />}>
                      Details
                    </Button>
                    <Button size="small" startIcon={<CodeIcon />}>
                      Docs
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </TabPanel>

        {/* Instances Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>Integration Instances</Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Integration</TableCell>
                  <TableCell>Tenant</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Sync</TableCell>
                  <TableCell>Errors</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {instances.map((instance) => {
                  const integration = integrations.find(i => i.id === instance.integrationId);
                  return (
                    <TableRow key={instance.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            {integration ? getCategoryIcon(integration.category) : <IntegrationIcon />}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">
                              {integration?.name || 'Unknown Integration'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {integration?.provider || 'Unknown Provider'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{instance.tenantName}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {instance.tenantId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={instance.status}
                          color={getStatusColor(instance.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(instance.lastSync).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(instance.lastSync).toLocaleTimeString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color={instance.errorCount > 0 ? 'error.main' : 'text.secondary'}>
                          {instance.errorCount}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton size="small">
                            <ViewIcon />
                          </IconButton>
                          <IconButton size="small">
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small">
                            <SettingsIcon />
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

        {/* Marketplace Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>Integration Marketplace</Typography>
          
          <Box sx={{ display: 'grid', gap: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Featured Integrations</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
                  {integrations.filter((i: any) => i.status === 'active').slice(0, 4).map((integration) => (
                    <Card key={integration.id} variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>
                            {getCategoryIcon(integration.category)}
                          </Avatar>
                          <Typography variant="subtitle2">{integration.name}</Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {integration.description}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Chip
                            label={integration.pricing.type}
                            color={getPricingColor(integration.pricing.type) as any}
                            size="small"
                          />
                          <Button size="small">Install</Button>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Integration Categories</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                  {['payment', 'communication', 'storage', 'analytics', 'education', 'security'].map((category) => {
                    const count = integrations.filter((i: any) => i.category === category).length;
                    return (
                      <Card key={category} variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>
                              {getCategoryIcon(category)}
                            </Avatar>
                            <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
                              {category}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {count} integrations available
                          </Typography>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>Integration Analytics</Typography>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 3,
            mb: 3 
          }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Usage by Integration</Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">Chart placeholder</Typography>
                </Box>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Health Status</Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">Chart placeholder</Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Recent Integration Activity</Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Integration installed successfully"
                    secondary="Stripe Payment Gateway - University of California - Time: 2024-01-15 10:30:00"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ErrorIcon color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Integration error detected"
                    secondary="AWS S3 Storage - MIT Libraries - Error: Invalid credentials - Time: 2024-01-14 16:20:00"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <WarningIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Integration health degraded"
                    secondary="SendGrid Email Service - University of California - Response time increased - Time: 2024-01-15 09:45:00"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </TabPanel>
      </Card>

      {/* Integration Details Dialog */}
      <Dialog open={!!selectedIntegration} onClose={() => setSelectedIntegration(null)} maxWidth="md" fullWidth>
        <DialogTitle>Integration Details</DialogTitle>
        <DialogContent>
          {selectedIntegration && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedIntegration.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedIntegration.description}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Integration Information</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Box>
                      <Typography variant="body2">Provider: {selectedIntegration.provider}</Typography>
                      <Typography variant="body2">Category: {selectedIntegration.category}</Typography>
                      <Typography variant="body2">Version: {selectedIntegration.version}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2">Status: {selectedIntegration.status}</Typography>
                      <Typography variant="body2">Pricing: {selectedIntegration.pricing.type}</Typography>
                      <Typography variant="body2">Health: {selectedIntegration.health.status}</Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Features</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {selectedIntegration.features.map((feature) => (
                      <Chip
                        key={feature}
                        label={feature}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Usage Statistics</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Box>
                      <Typography variant="body2">Tenants: {selectedIntegration.usage.tenants}</Typography>
                      <Typography variant="body2">Requests: {selectedIntegration.usage.requests.toLocaleString()}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2">Uptime: {selectedIntegration.health.uptime}%</Typography>
                      <Typography variant="body2">Response Time: {selectedIntegration.health.responseTime}ms</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedIntegration(null)}>Close</Button>
          <Button variant="contained">Install Integration</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IntegrationRegistryPage;






