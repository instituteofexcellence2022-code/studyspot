import React, { useState, useEffect } from 'react';
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
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  StepContent,
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
 * Automation Workflows Management Page
 * 
 * Features:
 * - Visual workflow builder
 * - Workflow execution monitoring
 * - Trigger management
 * - Step configuration
 * - Workflow analytics
 * - Template management
 */
import { AccessTime as AccessTimeIcon,
  AccountBalance as BillingIcon,
  AccountTree as FlowIcon,
  AccountTree as ParallelIcon,
  Add as AddIcon,
  AdminPanelSettings as AdminIcon,
  Analytics as AnalyticsIcon,
  Api as ApiIcon,
  ArrowForward as ArrowIcon,
  Article as ArticleIcon,
  Assessment as AssessmentIcon,
  Assignment as AuditIcon,
  AutoAwesome as AutomationIcon,
  Backup as BackupIcon,
  BarChart as BarChartIcon,
  BatteryFull as BatteryIcon,
  Biotech as BiotechIcon,
  Bluetooth as BluetoothIcon,
  BugReport as BugReportIcon,
  Build as BuildIcon,
  Business as BusinessIcon,
  CameraAlt as CameraIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckIcon,
  ChevronRight as ChevronRightIcon,
  Cloud as CloudIcon,
  Code as CodeIcon,
  DataUsage as DataIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  Description as DocumentIcon,
  DeveloperBoard as BoardIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Error as ErrorIcon,
  Event as EventIcon,
  ExpandMore as ExpandMoreIcon,
  FileDownload as FileDownloadIcon,
  FileUpload as FileUploadIcon,
  Fingerprint as FingerprintIcon,
  Flag as FlagIcon,
  Gavel as GavelIcon,
  Group as GroupIcon,
  Hardware as HardwareIcon,
  History as HistoryIcon,
  Key as KeyIcon,
  LocationOn as LocationIcon,
  Lock as LockIcon,
  Loop as LoopIcon,
  Memory as CpuIcon,
  Memory as MemoryIcon,
  Memory as MemoryIcon2,
  NetworkCheck as NetworkIcon,
  Notifications as NotificationsIcon,
  Pause as PauseIcon,
  PauseCircle as PauseCircleIcon,
  Person as PersonIcon,
  PieChart as PieChartIcon,
  PlayArrow as PlayIcon,
  PlayCircle as PlayCircleIcon,
  PlaylistAdd as AddStepIcon,
  PlaylistPlay as WorkflowIcon,
  PlaylistPlay as WorkflowIcon2,
  Power as PowerIcon,
  PrivacyTip as PrivacyIcon,
  Psychology as PsychologyIcon,
  QrCode as QrCodeIcon,
  Refresh as RefreshIcon,
  Remove as RemoveIcon,
  Report as ReportIcon,
  RestartAlt as RestartIcon,
  Router as RouterIcon,
  Rule as ConditionIcon,
  Rule as RuleIcon,
  Scanner as ScannerIcon,
  Schedule as DelayIcon,
  Schedule as ScheduleIcon,
  Schedule as ScheduleIcon2,
  Science as ScienceIcon,
  Security as SecurityIcon,
  Security as SecurityIcon2,
  Security as SecurityIcon3,
  Security as SecurityIcon4,
  Security as SecurityIcon5,
  Settings as SettingsIcon,
  Shield as ShieldIcon,
  ShowChart as ShowChartIcon,
  Smartphone as SmartphoneIcon,
  Sms as SmsIcon,
  Speed as SpeedIcon,
  Speed as SpeedIcon2,
  Stop as StopIcon,
  StopCircle as StopCircleIcon,
  Storage as StorageIcon,
  Storage as StorageIcon2,
  Thermostat as TemperatureIcon,
  Timeline as TimelineIcon,
  Timer as TimerIcon,
  TrendingUp as TrendingUpIcon,
  Update as UpdateIcon,
  Upload as UploadIcon,
  Usb as UsbIcon,
  VerifiedUser as VerifiedUserIcon,
  Visibility as ViewIcon,
  VpnKey as VpnKeyIcon,
  Warning as WarningIcon,
  Webhook as WebhookIcon,
  Wifi as WifiIcon } from '@mui/icons-material';
;
interface Workflow {
  id: string;
  name: string;
  description: string;
  category: 'billing' | 'security' | 'operations' | 'compliance' | 'attendance' | 'general';
  status: 'active' | 'inactive' | 'paused' | 'error' | 'draft';
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  tenantId?: string;
  tenantName?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastExecuted?: string;
  executionCount: number;
  successRate: number;
  errorCount: number;
  avgExecutionTime: number; // seconds
}

interface WorkflowStep {
  id: string;
  name: string;
  type: 'condition' | 'action' | 'delay' | 'parallel' | 'loop' | 'webhook' | 'api_call' | 'email' | 'notification';
  description: string;
  configuration: { [key: string]: any };
  order: number;
  enabled: boolean;
  timeout?: number;
  retryCount?: number;
  retryDelay?: number;
  onError?: 'continue' | 'stop' | 'retry';
  nextSteps?: string[];
  parallelSteps?: string[];
}

interface WorkflowTrigger {
  id: string;
  type: 'event' | 'schedule' | 'webhook' | 'api' | 'manual' | 'condition';
  name: string;
  description: string;
  configuration: { [key: string]: any };
  enabled: boolean;
  lastTriggered?: string;
  triggerCount: number;
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';
  startedAt: string;
  completedAt?: string;
  duration?: number; // seconds
  triggeredBy: string;
  triggerType: string;
  steps: ExecutionStep[];
  error?: string;
  tenantId?: string;
  tenantName?: string;
}

interface ExecutionStep {
  id: string;
  stepId: string;
  stepName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  error?: string;
  output?: any;
}

const AutomationWorkflowsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Mock data
  useEffect(() => {
    setWorkflows([
      {
        id: '1',
        name: 'New User Onboarding',
        description: 'Automated workflow for new user registration and setup',
        category: 'general',
        status: 'active',
        steps: [
          {
            id: '1',
            name: 'Validate user data',
            type: 'condition',
            description: 'Check if user email is valid',
            configuration: {
              field: 'email',
              operator: 'regex',
              value: '^[^@]+@[^@]+\\.[^@]+$'
            },
            order: 1,
            enabled: true,
            onError: 'stop',
            nextSteps: ['2']
          },
          {
            id: '2',
            name: 'Send welcome email',
            type: 'email',
            description: 'Send welcome email to new user',
            configuration: {
              template: 'welcome_email',
              to: '{{user.email}}',
              subject: 'Welcome to StudySpot!'
            },
            order: 2,
            enabled: true,
            onError: 'continue',
            nextSteps: ['3']
          },
          {
            id: '3',
            name: 'Create user profile',
            type: 'api_call',
            description: 'Create user profile in database',
            configuration: {
              endpoint: '/api/users/create',
              method: 'POST',
              body: '{{user}}'
            },
            order: 3,
            enabled: true,
            onError: 'retry',
            retryCount: 3,
            retryDelay: 5000,
            nextSteps: ['4']
          },
          {
            id: '4',
            name: 'Assign default role',
            type: 'api_call',
            description: 'Assign default user role',
            configuration: {
              endpoint: '/api/users/assign-role',
              method: 'POST',
              body: { userId: '{{user.id}}', role: 'student' }
            },
            order: 4,
            enabled: true,
            onError: 'continue'
          }
        ],
        triggers: [
          {
            id: '1',
            type: 'event',
            name: 'User registration event',
            description: 'Triggered when a new user registers',
            configuration: {
              event_type: 'user.registered',
              filters: { source: 'web' }
            },
            enabled: true,
            triggerCount: 156
          }
        ],
        tenantId: 'tenant-1',
        tenantName: 'University of California',
        createdBy: 'admin@company.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        lastExecuted: '2024-01-15T09:30:00Z',
        executionCount: 156,
        successRate: 96.8,
        errorCount: 5,
        avgExecutionTime: 2.3
      },
      {
        id: '2',
        name: 'Payment Processing',
        description: 'Automated payment processing and subscription management',
        category: 'billing',
        status: 'active',
        steps: [
          {
            id: '5',
            name: 'Validate payment',
            type: 'api_call',
            description: 'Validate payment with payment processor',
            configuration: {
              endpoint: '/api/payments/validate',
              method: 'POST'
            },
            order: 1,
            enabled: true,
            onError: 'stop',
            nextSteps: ['6']
          },
          {
            id: '6',
            name: 'Process payment',
            type: 'api_call',
            description: 'Process payment transaction',
            configuration: {
              endpoint: '/api/payments/process',
              method: 'POST'
            },
            order: 2,
            enabled: true,
            onError: 'retry',
            retryCount: 3,
            nextSteps: ['7', '8']
          },
          {
            id: '7',
            name: 'Update subscription',
            type: 'api_call',
            description: 'Update user subscription status',
            configuration: {
              endpoint: '/api/subscriptions/update',
              method: 'PUT'
            },
            order: 3,
            enabled: true,
            onError: 'continue',
            parallelSteps: ['8']
          },
          {
            id: '8',
            name: 'Send confirmation email',
            type: 'email',
            description: 'Send payment confirmation email',
            configuration: {
              template: 'payment_confirmation',
              to: '{{user.email}}'
            },
            order: 3,
            enabled: true,
            onError: 'continue'
          }
        ],
        triggers: [
          {
            id: '2',
            type: 'event',
            name: 'Payment initiated event',
            description: 'Triggered when payment is initiated',
            configuration: {
              event_type: 'payment.initiated'
            },
            enabled: true,
            triggerCount: 89
          }
        ],
        tenantId: 'tenant-1',
        tenantName: 'University of California',
        createdBy: 'billing@company.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-14T16:30:00Z',
        lastExecuted: '2024-01-15T08:45:00Z',
        executionCount: 89,
        successRate: 98.9,
        errorCount: 1,
        avgExecutionTime: 5.7
      },
      {
        id: '3',
        name: 'Security Incident Response',
        description: 'Automated response to security incidents',
        category: 'security',
        status: 'active',
        steps: [
          {
            id: '9',
            name: 'Assess threat level',
            type: 'condition',
            description: 'Determine threat level of security incident',
            configuration: {
              field: 'threat_level',
              operator: 'in',
              value: ['high', 'critical']
            },
            order: 1,
            enabled: true,
            onError: 'stop',
            nextSteps: ['10']
          },
          {
            id: '10',
            name: 'Block suspicious IP',
            type: 'api_call',
            description: 'Block IP address if threat is high',
            configuration: {
              endpoint: '/api/security/block-ip',
              method: 'POST'
            },
            order: 2,
            enabled: true,
            onError: 'continue',
            nextSteps: ['11', '12']
          },
          {
            id: '11',
            name: 'Alert security team',
            type: 'notification',
            description: 'Send immediate alert to security team',
            configuration: {
              channels: ['email', 'slack'],
              template: 'security_alert_urgent'
            },
            order: 3,
            enabled: true,
            onError: 'continue',
            parallelSteps: ['12']
          },
          {
            id: '12',
            name: 'Log incident',
            type: 'api_call',
            description: 'Log security incident details',
            configuration: {
              endpoint: '/api/security/log-incident',
              method: 'POST'
            },
            order: 3,
            enabled: true,
            onError: 'continue'
          }
        ],
        triggers: [
          {
            id: '3',
            type: 'event',
            name: 'Security incident event',
            description: 'Triggered when security incident is detected',
            configuration: {
              event_type: 'security.incident'
            },
            enabled: true,
            triggerCount: 12
          }
        ],
        createdBy: 'security@company.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-13T14:20:00Z',
        lastExecuted: '2024-01-15T10:15:00Z',
        executionCount: 12,
        successRate: 100,
        errorCount: 0,
        avgExecutionTime: 1.2
      }
    ]);

    setExecutions([
      {
        id: '1',
        workflowId: '1',
        workflowName: 'New User Onboarding',
        status: 'completed',
        startedAt: '2024-01-15T09:30:00Z',
        completedAt: '2024-01-15T09:30:02Z',
        duration: 2.3,
        triggeredBy: 'user.registered',
        triggerType: 'event',
        steps: [
          {
            id: '1',
            stepId: '1',
            stepName: 'Validate user data',
            status: 'completed',
            startedAt: '2024-01-15T09:30:00Z',
            completedAt: '2024-01-15T09:30:00.5Z',
            duration: 0.5
          },
          {
            id: '2',
            stepId: '2',
            stepName: 'Send welcome email',
            status: 'completed',
            startedAt: '2024-01-15T09:30:00.5Z',
            completedAt: '2024-01-15T09:30:01.2Z',
            duration: 0.7
          },
          {
            id: '3',
            stepId: '3',
            stepName: 'Create user profile',
            status: 'completed',
            startedAt: '2024-01-15T09:30:01.2Z',
            completedAt: '2024-01-15T09:30:01.8Z',
            duration: 0.6
          },
          {
            id: '4',
            stepId: '4',
            stepName: 'Assign default role',
            status: 'completed',
            startedAt: '2024-01-15T09:30:01.8Z',
            completedAt: '2024-01-15T09:30:02.3Z',
            duration: 0.5
          }
        ],
        tenantId: 'tenant-1',
        tenantName: 'University of California'
      }
    ]);
  }, []);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'paused': return 'warning';
      case 'error': return 'error';
      case 'draft': return 'info';
      case 'completed': return 'success';
      case 'running': return 'info';
      case 'failed': return 'error';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'billing': return <BillingIcon />;
      case 'security': return <SecurityIcon />;
      case 'operations': return <BuildIcon />;
      case 'compliance': return <RuleIcon />;
      case 'attendance': return <AccessTimeIcon />;
      case 'general': return <WorkflowIcon2 />;
      default: return <WorkflowIcon2 />;
    }
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'condition': return <ConditionIcon />;
      case 'action': return <PlayIcon />;
      case 'delay': return <DelayIcon />;
      case 'parallel': return <ParallelIcon />;
      case 'loop': return <LoopIcon />;
      case 'webhook': return <WebhookIcon />;
      case 'api_call': return <ApiIcon />;
      case 'email': return <EmailIcon />;
      case 'notification': return <NotificationsIcon />;
      default: return <PlayIcon />;
    }
  };

  const filteredWorkflows = workflows.filter((workflow: any) => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || workflow.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || workflow.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const workflowMetrics = {
    totalWorkflows: workflows.length,
    activeWorkflows: workflows.filter((w: any) => w.status === 'active').length,
    totalExecutions: workflows.reduce((sum, w) => sum + w.executionCount, 0),
    avgSuccessRate: workflows.reduce((sum, w) => sum + w.successRate, 0) / workflows.length,
    avgExecutionTime: workflows.reduce((sum, w) => sum + w.avgExecutionTime, 0) / workflows.length,
    errorCount: workflows.reduce((sum, w) => sum + w.errorCount, 0)
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
            Automation Workflows
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Design, manage, and monitor automated business processes
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
            Create Workflow
          </Button>
        </Box>
      </Box>

      {/* Workflow Metrics Cards */}
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
                <WorkflowIcon2 />
              </Avatar>
              <Box>
                <Typography variant="h6">Active Workflows</Typography>
                <Typography variant="h4">{workflowMetrics.activeWorkflows}</Typography>
                <Typography variant="body2" color="text.secondary">
                  of {workflowMetrics.totalWorkflows} total
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <PlayCircleIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Total Executions</Typography>
                <Typography variant="h4">{workflowMetrics.totalExecutions.toLocaleString()}</Typography>
                <Typography variant="body2" color="text.secondary">
                  All time
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
                <Typography variant="h6">Avg Execution Time</Typography>
                <Typography variant="h4">{workflowMetrics.avgExecutionTime.toFixed(1)}s</Typography>
                <Typography variant="body2" color="text.secondary">
                  Per workflow
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
                <Typography variant="h4">{workflowMetrics.errorCount}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {workflowMetrics.avgSuccessRate.toFixed(1)}% success rate
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Workflows" />
          <Tab label="Executions" />
          <Tab label="Builder" />
          <Tab label="Templates" />
        </Tabs>

        {/* Workflows Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Workflows</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search workflows..."
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
                  <MenuItem value="paused">Paused</MenuItem>
                  <MenuItem value="error">Error</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  <MenuItem value="billing">Billing</MenuItem>
                  <MenuItem value="security">Security</MenuItem>
                  <MenuItem value="operations">Operations</MenuItem>
                  <MenuItem value="compliance">Compliance</MenuItem>
                  <MenuItem value="attendance">Attendance</MenuItem>
                  <MenuItem value="general">General</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Workflow</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Steps</TableCell>
                  <TableCell>Executions</TableCell>
                  <TableCell>Success Rate</TableCell>
                  <TableCell>Avg Time</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredWorkflows.map((workflow) => (
                  <TableRow key={workflow.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {getCategoryIcon(workflow.category)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{workflow.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {workflow.description}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={workflow.category}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={workflow.status}
                        color={getStatusColor(workflow.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {workflow.steps.length} steps
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {workflow.executionCount.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          {workflow.successRate.toFixed(1)}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={workflow.successRate}
                          color={workflow.successRate >= 95 ? 'success' : workflow.successRate >= 80 ? 'warning' : 'error'}
                          sx={{ width: 60, height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {workflow.avgExecutionTime.toFixed(1)}s
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => setSelectedWorkflow(workflow)}>
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

        {/* Executions Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>Recent Executions</Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Workflow</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Triggered By</TableCell>
                  <TableCell>Started</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Steps</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {executions.map((execution) => (
                  <TableRow key={execution.id}>
                    <TableCell>
                      <Typography variant="subtitle2">{execution.workflowName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {execution.tenantName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={execution.status}
                        color={getStatusColor(execution.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{execution.triggeredBy}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {execution.triggerType}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(execution.startedAt).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {execution.duration ? `${execution.duration.toFixed(1)}s` : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {execution.steps.filter((s: any) => s.status === 'completed').length} / {execution.steps.length}
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
                          <StopIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Builder Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>Visual Workflow Builder</Typography>
          
          <Card>
            <CardContent>
              <Box sx={{ 
                height: 400, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '2px dashed #ccc',
                borderRadius: 2
              }}>
                <Box sx={{ textAlign: 'center' }}>
                  <FlowIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Visual Workflow Builder
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Drag and drop steps to build your workflow
                  </Typography>
                  <Button variant="contained" startIcon={<AddIcon />}>
                    Start Building
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Templates Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>Workflow Templates</Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>User Management</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="New User Onboarding" secondary="Complete user registration workflow" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="User Deactivation" secondary="Deactivate and cleanup user data" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Password Reset" secondary="Automated password reset process" />
                  </ListItem>
                </List>
                <Button size="small" startIcon={<AddIcon />}>
                  Use Template
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Billing & Payments</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Payment Processing" secondary="Complete payment workflow" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Subscription Renewal" secondary="Automated renewal process" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Invoice Generation" secondary="Generate and send invoices" />
                  </ListItem>
                </List>
                <Button size="small" startIcon={<AddIcon />}>
                  Use Template
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Security & Compliance</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Security Incident Response" secondary="Automated threat response" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Data Backup" secondary="Automated backup process" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Compliance Reporting" secondary="Generate compliance reports" />
                  </ListItem>
                </List>
                <Button size="small" startIcon={<AddIcon />}>
                  Use Template
                </Button>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>
      </Card>

      {/* Workflow Details Dialog */}
      <Dialog open={!!selectedWorkflow} onClose={() => setSelectedWorkflow(null)} maxWidth="lg" fullWidth>
        <DialogTitle>Workflow Details</DialogTitle>
        <DialogContent>
          {selectedWorkflow && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedWorkflow.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedWorkflow.description}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Workflow Information</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Box>
                      <Typography variant="body2">Category: {selectedWorkflow.category}</Typography>
                      <Typography variant="body2">Status: {selectedWorkflow.status}</Typography>
                      <Typography variant="body2">Steps: {selectedWorkflow.steps.length}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2">Executions: {selectedWorkflow.executionCount.toLocaleString()}</Typography>
                      <Typography variant="body2">Success Rate: {selectedWorkflow.successRate.toFixed(1)}%</Typography>
                      <Typography variant="body2">Avg Time: {selectedWorkflow.avgExecutionTime.toFixed(1)}s</Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Workflow Steps</Typography>
                  <Stepper orientation="vertical">
                    {selectedWorkflow.steps.map((step, index) => (
                      <Step key={step.id} active={true}>
                        <StepLabel>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>
                              {getStepIcon(step.type)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2">{step.name}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {step.description}
                              </Typography>
                            </Box>
                          </Box>
                        </StepLabel>
                        <StepContent>
                          <Typography variant="body2" color="text.secondary">
                            Type: {step.type} • Order: {step.order} • {step.enabled ? 'Enabled' : 'Disabled'}
                          </Typography>
                        </StepContent>
                      </Step>
                    ))}
                  </Stepper>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Triggers</Typography>
                  <List dense>
                    {selectedWorkflow.triggers.map((trigger) => (
                      <ListItem key={trigger.id}>
                        <ListItemText
                          primary={trigger.name}
                          secondary={`${trigger.type} - ${trigger.enabled ? 'Enabled' : 'Disabled'} - ${trigger.triggerCount} triggers`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedWorkflow(null)}>Close</Button>
          <Button variant="contained">Edit Workflow</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AutomationWorkflowsPage;
