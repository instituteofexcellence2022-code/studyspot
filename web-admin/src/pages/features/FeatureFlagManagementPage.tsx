/**
 * Feature Flag Management Page
 * 
 * Features:
 * - Feature flag creation and configuration
 * - Gradual rollout and canary deployment
 * - A/B testing and experimentation
 * - Flag targeting and segmentation
 * - Performance monitoring and analytics
 * - Safety guardrails and rollback
 */

import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import {
  Slider,
  RadioGroup,
  Radio,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Chip,
  Divider,
  Alert,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  AdminPanelSettings as AdminIcon,
  Analytics as AnalyticsIcon,
  Assessment as AssessmentIcon,
  Assignment as AuditIcon,
  Backup as BackupIcon,
  BarChart as BarChartIcon,
  Business as BusinessIcon,
  CheckCircle as CheckIcon,
  ChevronRight as ChevronRightIcon,
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
  Key as KeyIcon,
  Notifications as NotificationsIcon,
  Pause as PauseIcon,
  Person as PersonIcon,
  PieChart as PieChartIcon,
  PlayArrow as PlayIcon,
  PrivacyTip as PrivacyIcon,
  QrCode as QrCodeIcon,
  Refresh as RefreshIcon,
  RestartAlt as RestartIcon,
  Science as ExperimentIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  ShowChart as ShowChartIcon,
  Smartphone as SmartphoneIcon,
  Sms as SmsIcon,
  Stop as StopIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  Upload as UploadIcon,
  Visibility as ViewIcon,
  VpnKey as VpnKeyIcon,
  Warning as WarningIcon

  } from '@mui/icons-material';

interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  description: string;
  status: 'active' | 'inactive' | 'archived';
  type: 'boolean' | 'string' | 'number' | 'json';
  defaultValue: any;
  currentValue: any;
  rolloutPercentage: number;
  targeting: {
    enabled: boolean;
    rules: TargetingRule[];
  };
  experiments: Experiment[];
  createdAt: string;
  updatedAt: string;
  lastModifiedBy: string;
  tags: string[];
  environment: 'development' | 'staging' | 'production';
}

interface TargetingRule {
  id: string;
  name: string;
  condition: string;
  value: any;
  percentage: number;
  enabled: boolean;
}

interface Experiment {
  id: string;
  name: string;
  type: 'a_b' | 'multivariate' | 'gradual_rollout';
  status: 'draft' | 'running' | 'completed' | 'paused';
  variants: ExperimentVariant[];
  metrics: ExperimentMetric[];
  startDate: string;
  endDate?: string;
  trafficAllocation: number;
}

interface ExperimentVariant {
  id: string;
  name: string;
  description: string;
  value: any;
  trafficPercentage: number;
  isControl: boolean;
}

interface ExperimentMetric {
  id: string;
  name: string;
  type: 'conversion' | 'revenue' | 'engagement' | 'custom';
  value: number;
  change: number;
  significance: number;
}

const FeatureFlagManagementPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterEnvironment, setFilterEnvironment] = useState('all');

  // Mock data
  useEffect(() => {
    setFeatureFlags([
      {
        id: '1',
        name: 'New Dashboard UI',
        key: 'new-dashboard-ui',
        description: 'Enable the new dashboard interface with improved UX',
        status: 'active',
        type: 'boolean',
        defaultValue: false,
        currentValue: true,
        rolloutPercentage: 75,
        targeting: {
          enabled: true,
          rules: [
            {
              id: '1',
              name: 'Beta Users',
              condition: 'user.tags contains "beta"',
              value: true,
              percentage: 100,
              enabled: true
            },
            {
              id: '2',
              name: 'Premium Tenants',
              condition: 'tenant.plan == "premium"',
              value: true,
              percentage: 50,
              enabled: true
            }
          ]
        },
        experiments: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        lastModifiedBy: 'admin@company.com',
        tags: ['ui', 'dashboard', 'beta'],
        environment: 'production'
      },
      {
        id: '2',
        name: 'AI Recommendations',
        key: 'ai-recommendations',
        description: 'Enable AI-powered seat recommendations',
        status: 'active',
        type: 'boolean',
        defaultValue: false,
        currentValue: true,
        rolloutPercentage: 25,
        targeting: {
          enabled: true,
          rules: [
            {
              id: '3',
              name: 'High-Usage Tenants',
              condition: 'tenant.monthlyBookings > 1000',
              value: true,
              percentage: 100,
              enabled: true
            }
          ]
        },
        experiments: [
          {
            id: '1',
            name: 'AI Recommendation A/B Test',
            type: 'a_b',
            status: 'running',
            variants: [
              {
                id: '1',
                name: 'Control',
                description: 'Current recommendation system',
                value: false,
                trafficPercentage: 50,
                isControl: true
              },
              {
                id: '2',
                name: 'AI Enhanced',
                description: 'AI-powered recommendations',
                value: true,
                trafficPercentage: 50,
                isControl: false
              }
            ],
            metrics: [
              {
                id: '1',
                name: 'Booking Conversion',
                type: 'conversion',
                value: 12.5,
                change: 15.2,
                significance: 0.95
              },
              {
                id: '2',
                name: 'User Engagement',
                type: 'engagement',
                value: 8.3,
                change: 22.1,
                significance: 0.88
              }
            ],
            startDate: '2024-01-10T00:00:00Z',
            trafficAllocation: 25
          }
        ],
        createdAt: '2024-01-05T00:00:00Z',
        updatedAt: '2024-01-15T09:15:00Z',
        lastModifiedBy: 'product@company.com',
        tags: ['ai', 'recommendations', 'ml'],
        environment: 'production'
      },
      {
        id: '3',
        name: 'Payment Gateway',
        key: 'payment-gateway-v2',
        description: 'Switch to new payment gateway provider',
        status: 'inactive',
        type: 'string',
        defaultValue: 'stripe',
        currentValue: 'stripe',
        rolloutPercentage: 0,
        targeting: {
          enabled: false,
          rules: []
        },
        experiments: [],
        createdAt: '2024-01-08T00:00:00Z',
        updatedAt: '2024-01-14T16:20:00Z',
        lastModifiedBy: 'dev@company.com',
        tags: ['payment', 'integration'],
        environment: 'staging'
      }
    ]);
  }, []);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'archived': return 'error';
      case 'running': return 'success';
      case 'paused': return 'warning';
      case 'completed': return 'info';
      case 'draft': return 'default';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'boolean': return <FlagIcon />;
      case 'string': return <KeyIcon />;
      case 'number': return <AssessmentIcon />;
      case 'json': return <DataIcon />;
      default: return <FlagIcon />;
    }
  };

  const getEnvironmentColor = (env: string) => {
    switch (env) {
      case 'production': return 'error';
      case 'staging': return 'warning';
      case 'development': return 'info';
      default: return 'default';
    }
  };

  const filteredFlags = featureFlags.filter((flag: any) => {
    const matchesSearch = flag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         flag.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         flag.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || flag.status === filterStatus;
    const matchesEnvironment = filterEnvironment === 'all' || flag.environment === filterEnvironment;
    return matchesSearch && matchesStatus && matchesEnvironment;
  });

  const flagMetrics = {
    totalFlags: featureFlags.length,
    activeFlags: featureFlags.filter((f: any) => f.status === 'active').length,
    experimentsRunning: featureFlags.reduce((sum, f) => sum + f.experiments.filter((e: any) => e.status === 'running').length, 0),
    averageRollout: featureFlags.reduce((sum, f) => sum + f.rolloutPercentage, 0) / featureFlags.length,
    flagsByEnvironment: {
      production: featureFlags.filter((f: any) => f.environment === 'production').length,
      staging: featureFlags.filter((f: any) => f.environment === 'staging').length,
      development: featureFlags.filter((f: any) => f.environment === 'development').length
    }
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
            Feature Flag Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage feature flags, experiments, and gradual rollouts
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
            Create Flag
          </Button>
        </Box>
      </Box>

      {/* Feature Flag Metrics Cards */}
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
                <FlagIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Total Flags</Typography>
                <Typography variant="h4">{flagMetrics.totalFlags}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {flagMetrics.activeFlags} active
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                <ExperimentIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Experiments</Typography>
                <Typography variant="h4">{flagMetrics.experimentsRunning}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Currently running
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
                <Typography variant="h6">Avg Rollout</Typography>
                <Typography variant="h4">{flagMetrics.averageRollout.toFixed(0)}%</Typography>
                <Typography variant="body2" color="text.secondary">
                  Across all flags
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                <BusinessIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Production</Typography>
                <Typography variant="h4">{flagMetrics.flagsByEnvironment.production}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Live flags
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Feature Flags" />
          <Tab label="Experiments" />
          <Tab label="Rollouts" />
          <Tab label="Analytics" />
          <Tab label="Settings" />
        </Tabs>

        {/* Feature Flags Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Feature Flags</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search flags..."
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
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Environment</InputLabel>
                <Select
                  value={filterEnvironment}
                  onChange={(e) => setFilterEnvironment(e.target.value)}
                >
                  <MenuItem value="all">All Environments</MenuItem>
                  <MenuItem value="production">Production</MenuItem>
                  <MenuItem value="staging">Staging</MenuItem>
                  <MenuItem value="development">Development</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Flag</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Rollout</TableCell>
                  <TableCell>Environment</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredFlags.map((flag) => (
                  <TableRow key={flag.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {getTypeIcon(flag.type)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{flag.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {flag.key}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={flag.type}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', mr: 1 }}>
                          {JSON.stringify(flag.currentValue)}
                        </Typography>
                        {flag.currentValue !== flag.defaultValue && (
                          <Chip
                            label="Modified"
                            size="small"
                            color="warning"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          {flag.rolloutPercentage}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={flag.rolloutPercentage}
                          color={flag.rolloutPercentage === 100 ? 'success' : 'primary'}
                          sx={{ width: 60, height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={flag.environment}
                        color={getEnvironmentColor(flag.environment) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={flag.status}
                        color={getStatusColor(flag.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => setSelectedFlag(flag)}>
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small">
                          <SettingsIcon />
                        </IconButton>
                        <IconButton size="small">
                          {flag.status === 'active' ? <PauseIcon /> : <PlayIcon />}
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Experiments Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">A/B Tests & Experiments</Typography>
            <Button variant="contained" startIcon={<AddIcon />}>
              Create Experiment
            </Button>
          </Box>

          <Box sx={{ display: 'grid', gap: 3 }}>
            {featureFlags
              .filter((flag: any) => flag.experiments.length > 0)
              .map((flag: any) => 
                flag.experiments.map((experiment: any) => (
                  <Card key={experiment.id}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6">{experiment.name}</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Flag: {flag.name} ({flag.key})
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip
                              label={experiment.type.replace('_', ' ').toUpperCase()}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                            <Chip
                              label={`${experiment.trafficAllocation}% traffic`}
                              size="small"
                              variant="outlined"
                            />
                            <Chip
                              label={`${experiment.variants.length} variants`}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={experiment.status}
                            color={getStatusColor(experiment.status) as any}
                            size="small"
                          />
                          <IconButton size="small">
                            <EditIcon />
                          </IconButton>
                        </Box>
                      </Box>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>Variants</Typography>
                          {experiment.variants.map((variant: any) => (
                            <Box key={variant.id} sx={{ 
                              p: 1, 
                              border: '1px solid', 
                              borderColor: 'divider', 
                              borderRadius: 1,
                              mb: 1,
                              bgcolor: variant.isControl ? 'primary.light' : 'background.paper',
                              opacity: variant.isControl ? 0.1 : 1
                            }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                  {variant.name}
                                </Typography>
                                <Typography variant="body2">
                                  {variant.trafficPercentage}%
                                </Typography>
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                {variant.description}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>Metrics</Typography>
                          {experiment.metrics.map((metric: any) => (
                            <Box key={metric.id} sx={{ mb: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2">{metric.name}</Typography>
                                <Typography variant="body2" color={metric.change > 0 ? 'success.main' : 'error.main'}>
                                  {metric.change > 0 ? '+' : ''}{metric.change}%
                                </Typography>
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                Value: {metric.value} | Significance: {(metric.significance * 100).toFixed(0)}%
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                      
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button size="small" startIcon={<PlayIcon />}>
                          {experiment.status === 'running' ? 'Pause' : 'Start'}
                        </Button>
                        <Button size="small" startIcon={<StopIcon />}>
                          Stop
                        </Button>
                        <Button size="small" startIcon={<AnalyticsIcon />}>
                          View Results
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                ))
              )}
          </Box>
        </TabPanel>

        {/* Rollouts Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>Gradual Rollouts & Canary Deployments</Typography>
          
          <Box sx={{ display: 'grid', gap: 3 }}>
            {filteredFlags
              .filter((flag: any) => flag.rolloutPercentage > 0 && flag.rolloutPercentage < 100)
              .map((flag) => (
                <Card key={flag.id}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6">{flag.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {flag.description}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${flag.rolloutPercentage}%`}
                        color="primary"
                        size="small"
                      />
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Rollout Progress
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={flag.rolloutPercentage}
                        color="primary"
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>Targeting Rules</Typography>
                        {flag.targeting.rules.map((rule) => (
                          <Box key={rule.id} sx={{ mb: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {rule.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {rule.condition} - {rule.percentage}%
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>Rollout Controls</Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Button size="small" startIcon={<PlayIcon />}>
                            Increase
                          </Button>
                          <Button size="small" startIcon={<PauseIcon />}>
                            Pause
                          </Button>
                          <Button size="small" startIcon={<StopIcon />}>
                            Rollback
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
          </Box>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>Feature Flag Analytics</Typography>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 3,
            mb: 3 
          }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Flag Usage Trends</Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">Chart placeholder</Typography>
                </Box>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Experiment Results</Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">Chart placeholder</Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Recent Flag Events</Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Flag enabled"
                    secondary="Flag: new-dashboard-ui - User: admin@company.com - Time: 2024-01-15 10:30:00"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <WarningIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Rollout increased"
                    secondary="Flag: ai-recommendations - From 25% to 50% - Time: 2024-01-15 09:15:00"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ErrorIcon color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Flag disabled due to error"
                    secondary="Flag: payment-gateway-v2 - Error: Payment timeout - Time: 2024-01-14 16:20:00"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Settings Tab */}
        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom>Feature Flag Configuration</Typography>
          
          <Box sx={{ display: 'grid', gap: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Global Settings</Typography>
                <Box sx={{ display: 'grid', gap: 2 }}>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Enable feature flags globally"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Auto-rollback on errors"
                  />
                  <FormControlLabel
                    control={<Switch />}
                    label="Require approval for production flags"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Enable analytics tracking"
                  />
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Safety Guardrails</Typography>
                <Box sx={{ display: 'grid', gap: 2 }}>
                  <TextField
                    label="Max rollout percentage per day"
                    type="number"
                    defaultValue={25}
                    size="small"
                  />
                  <TextField
                    label="Error threshold for auto-rollback"
                    type="number"
                    defaultValue={5}
                    size="small"
                  />
                  <TextField
                    label="Minimum experiment duration (hours)"
                    type="number"
                    defaultValue={24}
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Notifications</Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Configure notifications for flag changes and experiment results
                </Alert>
                <Box sx={{ display: 'grid', gap: 2 }}>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Notify on flag status changes"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Notify on experiment completion"
                  />
                  <FormControlLabel
                    control={<Switch />}
                    label="Notify on rollback events"
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>
      </Card>

      {/* Flag Details Dialog */}
      <Dialog open={!!selectedFlag} onClose={() => setSelectedFlag(null)} maxWidth="md" fullWidth>
        <DialogTitle>Flag Details</DialogTitle>
        <DialogContent>
          {selectedFlag && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedFlag.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedFlag.description}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Configuration</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Box>
                      <Typography variant="body2">Key: {selectedFlag.key}</Typography>
                      <Typography variant="body2">Type: {selectedFlag.type}</Typography>
                      <Typography variant="body2">Environment: {selectedFlag.environment}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2">Default: {JSON.stringify(selectedFlag.defaultValue)}</Typography>
                      <Typography variant="body2">Current: {JSON.stringify(selectedFlag.currentValue)}</Typography>
                      <Typography variant="body2">Rollout: {selectedFlag.rolloutPercentage}%</Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Targeting Rules</Typography>
                  {selectedFlag.targeting.rules.map((rule) => (
                    <Box key={rule.id} sx={{ 
                      p: 2, 
                      border: '1px solid', 
                      borderColor: 'divider', 
                      borderRadius: 1,
                      mb: 1
                    }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {rule.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {rule.condition} - {rule.percentage}%
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedFlag(null)}>Close</Button>
          <Button variant="contained">Edit Flag</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeatureFlagManagementPage;
