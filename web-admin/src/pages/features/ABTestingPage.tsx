/**
 * A/B Testing & Experimentation Page
 * 
 * Features:
 * - Experiment creation and management
 * - Statistical significance calculation
 * - Conversion tracking and analytics
 * - Multivariate testing support
 * - Experiment templates and presets
 * - Results visualization and reporting
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

interface Experiment {
  id: string;
  name: string;
  description: string;
  type: 'a_b' | 'multivariate' | 'split_url' | 'feature_flag';
  status: 'draft' | 'running' | 'paused' | 'completed' | 'cancelled';
  hypothesis: string;
  successMetric: string;
  variants: ExperimentVariant[];
  trafficAllocation: number;
  startDate: string;
  endDate?: string;
  duration: number; // in days
  participants: number;
  conversions: number;
  conversionRate: number;
  statisticalSignificance: number;
  confidenceLevel: number;
  pValue: number;
  winner?: string;
  tags: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface ExperimentVariant {
  id: string;
  name: string;
  description: string;
  isControl: boolean;
  trafficPercentage: number;
  participants: number;
  conversions: number;
  conversionRate: number;
  improvement: number; // percentage improvement over control
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  metrics: {
    [key: string]: number;
  };
}

interface ExperimentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  type: string;
  metrics: string[];
  duration: number;
  trafficAllocation: number;
}

const ABTestingPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [templates, setTemplates] = useState<ExperimentTemplate[]>([]);
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Mock data
  useEffect(() => {
    setExperiments([
      {
        id: '1',
        name: 'Dashboard UI Redesign',
        description: 'Test new dashboard layout vs current design',
        type: 'a_b',
        status: 'running',
        hypothesis: 'New dashboard design will increase user engagement by 15%',
        successMetric: 'time_on_page',
        variants: [
          {
            id: '1',
            name: 'Control',
            description: 'Current dashboard design',
            isControl: true,
            trafficPercentage: 50,
            participants: 1250,
            conversions: 312,
            conversionRate: 24.96,
            improvement: 0,
            confidenceInterval: { lower: 22.1, upper: 27.8 },
            metrics: {
              time_on_page: 180,
              click_through_rate: 12.5,
              bounce_rate: 35.2
            }
          },
          {
            id: '2',
            name: 'New Design',
            description: 'Redesigned dashboard with improved UX',
            isControl: false,
            trafficPercentage: 50,
            participants: 1248,
            conversions: 374,
            conversionRate: 29.97,
            improvement: 20.1,
            confidenceInterval: { lower: 27.2, upper: 32.7 },
            metrics: {
              time_on_page: 215,
              click_through_rate: 15.8,
              bounce_rate: 28.9
            }
          }
        ],
        trafficAllocation: 100,
        startDate: '2024-01-10T00:00:00Z',
        duration: 14,
        participants: 2498,
        conversions: 686,
        conversionRate: 27.46,
        statisticalSignificance: 95.2,
        confidenceLevel: 95,
        pValue: 0.023,
        winner: 'New Design',
        tags: ['ui', 'dashboard', 'ux'],
        createdBy: 'product@company.com',
        createdAt: '2024-01-08T00:00:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        name: 'Pricing Page Optimization',
        description: 'Test different pricing page layouts and CTAs',
        type: 'multivariate',
        status: 'completed',
        hypothesis: 'New pricing layout will increase conversion by 25%',
        successMetric: 'signup_conversion',
        variants: [
          {
            id: '3',
            name: 'Control',
            description: 'Current pricing page',
            isControl: true,
            trafficPercentage: 25,
            participants: 500,
            conversions: 45,
            conversionRate: 9.0,
            improvement: 0,
            confidenceInterval: { lower: 6.6, upper: 11.4 },
            metrics: {
              signup_conversion: 9.0,
              page_views: 500,
              time_on_page: 120
            }
          },
          {
            id: '4',
            name: 'Layout A',
            description: 'Three-column pricing layout',
            isControl: false,
            trafficPercentage: 25,
            participants: 498,
            conversions: 52,
            conversionRate: 10.44,
            improvement: 16.0,
            confidenceInterval: { lower: 7.8, upper: 13.1 },
            metrics: {
              signup_conversion: 10.44,
              page_views: 498,
              time_on_page: 135
            }
          },
          {
            id: '5',
            name: 'Layout B',
            description: 'Single-page pricing with comparison table',
            isControl: false,
            trafficPercentage: 25,
            participants: 502,
            conversions: 58,
            conversionRate: 11.55,
            improvement: 28.3,
            confidenceInterval: { lower: 8.8, upper: 14.3 },
            metrics: {
              signup_conversion: 11.55,
              page_views: 502,
              time_on_page: 155
            }
          },
          {
            id: '6',
            name: 'Layout C',
            description: 'Interactive pricing calculator',
            isControl: false,
            trafficPercentage: 25,
            participants: 500,
            conversions: 48,
            conversionRate: 9.6,
            improvement: 6.7,
            confidenceInterval: { lower: 7.1, upper: 12.1 },
            metrics: {
              signup_conversion: 9.6,
              page_views: 500,
              time_on_page: 180
            }
          }
        ],
        trafficAllocation: 100,
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-15T00:00:00Z',
        duration: 14,
        participants: 2000,
        conversions: 203,
        conversionRate: 10.15,
        statisticalSignificance: 98.7,
        confidenceLevel: 95,
        pValue: 0.008,
        winner: 'Layout B',
        tags: ['pricing', 'conversion', 'cta'],
        createdBy: 'marketing@company.com',
        createdAt: '2023-12-28T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z'
      },
      {
        id: '3',
        name: 'Email Subject Line Test',
        description: 'Test different email subject lines for newsletter',
        type: 'a_b',
        status: 'draft',
        hypothesis: 'Personalized subject lines will increase open rates by 20%',
        successMetric: 'email_open_rate',
        variants: [
          {
            id: '7',
            name: 'Control',
            description: 'Generic subject line',
            isControl: true,
            trafficPercentage: 50,
            participants: 0,
            conversions: 0,
            conversionRate: 0,
            improvement: 0,
            confidenceInterval: { lower: 0, upper: 0 },
            metrics: {
              email_open_rate: 0,
              click_rate: 0,
              unsubscribe_rate: 0
            }
          },
          {
            id: '8',
            name: 'Personalized',
            description: 'Subject line with user name',
            isControl: false,
            trafficPercentage: 50,
            participants: 0,
            conversions: 0,
            conversionRate: 0,
            improvement: 0,
            confidenceInterval: { lower: 0, upper: 0 },
            metrics: {
              email_open_rate: 0,
              click_rate: 0,
              unsubscribe_rate: 0
            }
          }
        ],
        trafficAllocation: 0,
        startDate: '2024-01-20T00:00:00Z',
        duration: 7,
        participants: 0,
        conversions: 0,
        conversionRate: 0,
        statisticalSignificance: 0,
        confidenceLevel: 95,
        pValue: 1,
        tags: ['email', 'marketing', 'newsletter'],
        createdBy: 'marketing@company.com',
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z'
      }
    ]);

    setTemplates([
      {
        id: '1',
        name: 'Landing Page Conversion',
        description: 'Template for testing landing page conversion rates',
        category: 'Conversion',
        type: 'a_b',
        metrics: ['conversion_rate', 'time_on_page', 'bounce_rate'],
        duration: 14,
        trafficAllocation: 50
      },
      {
        id: '2',
        name: 'Email Campaign',
        description: 'Template for testing email marketing campaigns',
        category: 'Email',
        type: 'a_b',
        metrics: ['open_rate', 'click_rate', 'unsubscribe_rate'],
        duration: 7,
        trafficAllocation: 50
      },
      {
        id: '3',
        name: 'Pricing Page',
        description: 'Template for testing pricing page layouts',
        category: 'Conversion',
        type: 'multivariate',
        metrics: ['signup_conversion', 'page_views', 'time_on_page'],
        duration: 21,
        trafficAllocation: 25
      },
      {
        id: '4',
        name: 'Feature Adoption',
        description: 'Template for testing new feature adoption',
        category: 'Product',
        type: 'feature_flag',
        metrics: ['feature_usage', 'retention', 'engagement'],
        duration: 30,
        trafficAllocation: 10
      }
    ]);
  }, []);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'running': return 'success';
      case 'completed': return 'info';
      case 'paused': return 'warning';
      case 'draft': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'a_b': return <BarChartIcon />;
      case 'multivariate': return <PieChartIcon />;
      case 'split_url': return <ShowChartIcon />;
      case 'feature_flag': return <FlagIcon />;
      default: return <ExperimentIcon />;
    }
  };

  const getSignificanceColor = (significance: number) => {
    if (significance >= 95) return 'success';
    if (significance >= 90) return 'warning';
    return 'error';
  };

  const filteredExperiments = experiments.filter((experiment: any) => {
    const matchesSearch = experiment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         experiment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         experiment.hypothesis.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || experiment.status === filterStatus;
    const matchesType = filterType === 'all' || experiment.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const experimentMetrics = {
    totalExperiments: experiments.length,
    runningExperiments: experiments.filter((e: any) => e.status === 'running').length,
    completedExperiments: experiments.filter((e: any) => e.status === 'completed').length,
    totalParticipants: experiments.reduce((sum, e) => sum + e.participants, 0),
    averageConversionRate: experiments.reduce((sum, e) => sum + e.conversionRate, 0) / experiments.length,
    significantResults: experiments.filter((e: any) => e.statisticalSignificance >= 95).length
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
            A/B Testing & Experiments
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create, manage, and analyze experiments to optimize user experience
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
            Create Experiment
          </Button>
        </Box>
      </Box>

      {/* Experiment Metrics Cards */}
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
                <ExperimentIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Total Experiments</Typography>
                <Typography variant="h4">{experimentMetrics.totalExperiments}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {experimentMetrics.runningExperiments} running
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
                <Typography variant="h6">Completed</Typography>
                <Typography variant="h4">{experimentMetrics.completedExperiments}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {experimentMetrics.significantResults} significant
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Participants</Typography>
                <Typography variant="h4">{experimentMetrics.totalParticipants.toLocaleString()}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total test users
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                <TrendingUpIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Avg Conversion</Typography>
                <Typography variant="h4">{experimentMetrics.averageConversionRate.toFixed(1)}%</Typography>
                <Typography variant="body2" color="text.secondary">
                  Across all experiments
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Experiments" />
          <Tab label="Templates" />
          <Tab label="Results" />
          <Tab label="Analytics" />
          <Tab label="Settings" />
        </Tabs>

        {/* Experiments Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Active Experiments</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search experiments..."
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
                  <MenuItem value="running">Running</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="paused">Paused</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="a_b">A/B Test</MenuItem>
                  <MenuItem value="multivariate">Multivariate</MenuItem>
                  <MenuItem value="split_url">Split URL</MenuItem>
                  <MenuItem value="feature_flag">Feature Flag</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Experiment</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Participants</TableCell>
                  <TableCell>Conversion Rate</TableCell>
                  <TableCell>Significance</TableCell>
                  <TableCell>Winner</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredExperiments.map((experiment) => (
                  <TableRow key={experiment.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {getTypeIcon(experiment.type)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{experiment.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {experiment.hypothesis}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={experiment.type.replace('_', ' ').toUpperCase()}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={experiment.status}
                        color={getStatusColor(experiment.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {experiment.participants.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {experiment.conversionRate.toFixed(1)}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          {experiment.statisticalSignificance.toFixed(1)}%
                        </Typography>
                        <Chip
                          label={experiment.statisticalSignificance >= 95 ? 'High' : experiment.statisticalSignificance >= 90 ? 'Medium' : 'Low'}
                          color={getSignificanceColor(experiment.statisticalSignificance) as any}
                          size="small"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      {experiment.winner ? (
                        <Chip
                          label={experiment.winner}
                          color="success"
                          size="small"
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          TBD
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => setSelectedExperiment(experiment)}>
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small">
                          {experiment.status === 'running' ? <PauseIcon /> : <PlayIcon />}
                        </IconButton>
                        <IconButton size="small">
                          <AnalyticsIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Templates Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Experiment Templates</Typography>
            <Button variant="contained" startIcon={<AddIcon />}>
              Create Template
            </Button>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
            {templates.map((template) => (
              <Card key={template.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">{template.name}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {template.description}
                      </Typography>
                      <Chip
                        label={template.category}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                    <IconButton size="small">
                      <EditIcon />
                    </IconButton>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'grid', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Type:</Typography>
                      <Typography variant="body2">{template.type.replace('_', ' ').toUpperCase()}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Duration:</Typography>
                      <Typography variant="body2">{template.duration} days</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Traffic:</Typography>
                      <Typography variant="body2">{template.trafficAllocation}%</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" gutterBottom>Metrics:</Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {template.metrics.map((metric) => (
                          <Chip
                            key={metric}
                            label={metric.replace('_', ' ')}
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button size="small" startIcon={<AddIcon />}>
                      Use Template
                    </Button>
                    <Button size="small" startIcon={<ViewIcon />}>
                      Preview
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </TabPanel>

        {/* Results Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>Experiment Results & Analysis</Typography>
          
          <Box sx={{ display: 'grid', gap: 3 }}>
            {experiments
              .filter((exp: any) => exp.status === 'completed' || exp.status === 'running')
              .map((experiment) => (
                <Card key={experiment.id}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6">{experiment.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {experiment.hypothesis}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={experiment.status}
                          color={getStatusColor(experiment.status) as any}
                          size="small"
                        />
                        {experiment.winner && (
                          <Chip
                            label={`Winner: ${experiment.winner}`}
                            color="success"
                            size="small"
                          />
                        )}
                      </Box>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>Variants Performance</Typography>
                        {experiment.variants.map((variant) => (
                          <Box key={variant.id} sx={{ 
                            p: 2, 
                            border: '1px solid', 
                            borderColor: variant.isControl ? 'primary.main' : 'divider', 
                            borderRadius: 1,
                            mb: 1,
                            bgcolor: variant.isControl ? 'primary.light' : 'background.paper',
                            opacity: variant.isControl ? 0.1 : 1
                          }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {variant.name}
                                {variant.isControl && ' (Control)'}
                              </Typography>
                              <Typography variant="body2" color={variant.improvement > 0 ? 'success.main' : 'text.secondary'}>
                                {variant.improvement > 0 ? `+${variant.improvement.toFixed(1)}%` : '0%'}
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {variant.conversionRate.toFixed(1)}% conversion ({variant.conversions}/{variant.participants})
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Confidence: {variant.confidenceInterval.lower.toFixed(1)}% - {variant.confidenceInterval.upper.toFixed(1)}%
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>Statistical Analysis</Typography>
                        <Box sx={{ display: 'grid', gap: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Significance:</Typography>
                            <Typography variant="body2" color={getSignificanceColor(experiment.statisticalSignificance) as any}>
                              {experiment.statisticalSignificance.toFixed(1)}%
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">P-value:</Typography>
                            <Typography variant="body2">{experiment.pValue.toFixed(3)}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Confidence Level:</Typography>
                            <Typography variant="body2">{experiment.confidenceLevel}%</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Duration:</Typography>
                            <Typography variant="body2">{experiment.duration} days</Typography>
                          </Box>
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
          <Typography variant="h6" gutterBottom>Experiment Analytics</Typography>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 3,
            mb: 3 
          }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Conversion Trends</Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">Chart placeholder</Typography>
                </Box>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Statistical Significance</Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">Chart placeholder</Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Recent Experiment Events</Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Experiment completed"
                    secondary="Dashboard UI Redesign - Winner: New Design - Improvement: 20.1% - Time: 2024-01-15 10:30:00"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <WarningIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Low statistical significance"
                    secondary="Email Subject Line Test - Significance: 78.5% - Time: 2024-01-15 09:15:00"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PlayIcon color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Experiment started"
                    secondary="Pricing Page Optimization - 4 variants - Time: 2024-01-01 00:00:00"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Settings Tab */}
        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom>Experiment Configuration</Typography>
          
          <Box sx={{ display: 'grid', gap: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Statistical Settings</Typography>
                <Box sx={{ display: 'grid', gap: 2 }}>
                  <TextField
                    label="Minimum statistical significance (%)"
                    type="number"
                    defaultValue={95}
                    size="small"
                  />
                  <TextField
                    label="Minimum sample size"
                    type="number"
                    defaultValue={1000}
                    size="small"
                  />
                  <TextField
                    label="Minimum experiment duration (days)"
                    type="number"
                    defaultValue={7}
                    size="small"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Auto-stop experiments when significance is reached"
                  />
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Traffic Allocation</Typography>
                <Box sx={{ display: 'grid', gap: 2 }}>
                  <TextField
                    label="Maximum traffic allocation (%)"
                    type="number"
                    defaultValue={50}
                    size="small"
                  />
                  <TextField
                    label="Minimum traffic per variant (%)"
                    type="number"
                    defaultValue={10}
                    size="small"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Require approval for high-traffic experiments"
                  />
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Notifications</Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Configure notifications for experiment events and results
                </Alert>
                <Box sx={{ display: 'grid', gap: 2 }}>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Notify when experiments reach significance"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Notify when experiments complete"
                  />
                  <FormControlLabel
                    control={<Switch />}
                    label="Notify on experiment errors"
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>
      </Card>

      {/* Experiment Details Dialog */}
      <Dialog open={!!selectedExperiment} onClose={() => setSelectedExperiment(null)} maxWidth="lg" fullWidth>
        <DialogTitle>Experiment Details</DialogTitle>
        <DialogContent>
          {selectedExperiment && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedExperiment.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedExperiment.description}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Hypothesis</Typography>
                  <Typography variant="body2">{selectedExperiment.hypothesis}</Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Variants</Typography>
                  <Box sx={{ display: 'grid', gap: 1 }}>
                    {selectedExperiment.variants.map((variant) => (
                      <Box key={variant.id} sx={{ 
                        p: 2, 
                        border: '1px solid', 
                        borderColor: variant.isControl ? 'primary.main' : 'divider', 
                        borderRadius: 1,
                        bgcolor: variant.isControl ? 'primary.light' : 'background.paper',
                        opacity: variant.isControl ? 0.1 : 1
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {variant.name} {variant.isControl && '(Control)'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {variant.description}
                        </Typography>
                        <Typography variant="body2">
                          Conversion: {variant.conversionRate.toFixed(1)}% | 
                          Improvement: {variant.improvement > 0 ? `+${variant.improvement.toFixed(1)}%` : '0%'} |
                          Participants: {variant.participants}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedExperiment(null)}>Close</Button>
          <Button variant="contained">Edit Experiment</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ABTestingPage;
