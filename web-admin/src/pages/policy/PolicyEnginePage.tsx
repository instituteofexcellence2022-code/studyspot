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
  CardContent
} from '@mui/material';
/**
 * Policy Engine Management Page
 * 
 * Features:
 * - Policy rules engine and management
 * - Automation workflows and triggers
 * - Billing automation and enforcement
 * - Security automation and threat response
 * - Operations automation and incident response
 * - Policy analytics and reporting
 */
import { AccessTime as AccessTimeIcon,
  AccountBalance as BillingIcon,
  Add as AddIcon,
  AdminPanelSettings as AdminIcon,
  Analytics as AnalyticsIcon,
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
  PlayArrow as TriggerIcon,
  PlayCircle as PlayCircleIcon,
  PlaylistPlay as WorkflowIcon,
  Policy as PolicyIcon,
  Power as PowerIcon,
  PrivacyTip as PrivacyIcon,
  Psychology as PsychologyIcon,
  QrCode as QrCodeIcon,
  Refresh as RefreshIcon,
  Report as ReportIcon,
  RestartAlt as RestartIcon,
  Router as RouterIcon,
  Rule as RuleIcon,
  Scanner as ScannerIcon,
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
  Wifi as WifiIcon } from '@mui/icons-material';
;
interface PolicyRule {
  id: string;
  name: string;
  description: string;
  category: 'billing' | 'security' | 'operations' | 'compliance' | 'attendance' | 'general';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'inactive' | 'draft' | 'testing';
  conditions: PolicyCondition[];
  actions: PolicyAction[];
  triggers: PolicyTrigger[];
  tenantId?: string;
  tenantName?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastExecuted?: string;
  executionCount: number;
  successRate: number;
  errorCount: number;
}

interface PolicyCondition {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains' | 'in' | 'not_in' | 'regex' | 'exists' | 'not_exists';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

interface PolicyAction {
  id: string;
  type: 'notification' | 'webhook' | 'email' | 'sms' | 'api_call' | 'database_update' | 'file_action' | 'user_action' | 'system_action';
  name: string;
  parameters: { [key: string]: any };
  order: number;
  enabled: boolean;
}

interface PolicyTrigger {
  id: string;
  type: 'event' | 'schedule' | 'webhook' | 'api' | 'manual' | 'condition';
  name: string;
  configuration: { [key: string]: any };
  enabled: boolean;
}

interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  category: 'billing' | 'security' | 'operations' | 'compliance' | 'attendance' | 'general';
  status: 'active' | 'inactive' | 'paused' | 'error';
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
}

interface WorkflowStep {
  id: string;
  name: string;
  type: 'condition' | 'action' | 'delay' | 'parallel' | 'loop' | 'webhook' | 'api_call';
  configuration: { [key: string]: any };
  order: number;
  enabled: boolean;
  timeout?: number;
  retryCount?: number;
}

interface WorkflowTrigger {
  id: string;
  type: 'event' | 'schedule' | 'webhook' | 'api' | 'manual';
  name: string;
  configuration: { [key: string]: any };
  enabled: boolean;
}

const PolicyEnginePage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [policyRules, setPolicyRules] = useState<PolicyRule[]>([]);
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>([]);
  const [selectedRule, setSelectedRule] = useState<PolicyRule | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Mock data
  useEffect(() => {
    setPolicyRules([
      {
        id: '1',
        name: 'Auto-suspend overdue accounts',
        description: 'Automatically suspend accounts with overdue payments',
        category: 'billing',
        priority: 'high',
        status: 'active',
        conditions: [
          {
            id: '1',
            field: 'payment_status',
            operator: 'equals',
            value: 'overdue',
            logicalOperator: 'AND'
          },
          {
            id: '2',
            field: 'days_overdue',
            operator: 'greater_than',
            value: 7
          }
        ],
        actions: [
          {
            id: '1',
            type: 'notification',
            name: 'Send suspension notification',
            parameters: {
              template: 'account_suspension',
              channels: ['email', 'sms']
            },
            order: 1,
            enabled: true
          },
          {
            id: '2',
            type: 'api_call',
            name: 'Suspend account',
            parameters: {
              endpoint: '/api/accounts/suspend',
              method: 'POST'
            },
            order: 2,
            enabled: true
          }
        ],
        triggers: [
          {
            id: '1',
            type: 'schedule',
            name: 'Daily billing check',
            configuration: {
              schedule: '0 9 * * *',
              timezone: 'UTC'
            },
            enabled: true
          }
        ],
        tenantId: 'tenant-1',
        tenantName: 'University of California',
        createdBy: 'admin@company.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        lastExecuted: '2024-01-15T09:00:00Z',
        executionCount: 45,
        successRate: 98.2,
        errorCount: 1
      },
      {
        id: '2',
        name: 'Block suspicious login attempts',
        description: 'Block IP addresses with multiple failed login attempts',
        category: 'security',
        priority: 'critical',
        status: 'active',
        conditions: [
          {
            id: '3',
            field: 'failed_login_attempts',
            operator: 'greater_than',
            value: 5,
            logicalOperator: 'AND'
          },
          {
            id: '4',
            field: 'time_window_minutes',
            operator: 'less_than',
            value: 15
          }
        ],
        actions: [
          {
            id: '3',
            type: 'api_call',
            name: 'Block IP address',
            parameters: {
              endpoint: '/api/security/block-ip',
              method: 'POST'
            },
            order: 1,
            enabled: true
          },
          {
            id: '4',
            type: 'notification',
            name: 'Alert security team',
            parameters: {
              template: 'security_alert',
              channels: ['email', 'slack']
            },
            order: 2,
            enabled: true
          }
        ],
        triggers: [
          {
            id: '2',
            type: 'event',
            name: 'Failed login event',
            configuration: {
              event_type: 'auth.failed_login'
            },
            enabled: true
          }
        ],
        createdBy: 'security@company.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-14T16:30:00Z',
        lastExecuted: '2024-01-15T08:45:00Z',
        executionCount: 12,
        successRate: 100,
        errorCount: 0
      },
      {
        id: '3',
        name: 'Auto-scale resources on high load',
        description: 'Automatically scale resources when system load is high',
        category: 'operations',
        priority: 'high',
        status: 'active',
        conditions: [
          {
            id: '5',
            field: 'cpu_usage',
            operator: 'greater_than',
            value: 80,
            logicalOperator: 'AND'
          },
          {
            id: '6',
            field: 'memory_usage',
            operator: 'greater_than',
            value: 85
          }
        ],
        actions: [
          {
            id: '5',
            type: 'api_call',
            name: 'Scale up resources',
            parameters: {
              endpoint: '/api/infrastructure/scale',
              method: 'POST'
            },
            order: 1,
            enabled: true
          },
          {
            id: '6',
            type: 'notification',
            name: 'Notify operations team',
            parameters: {
              template: 'auto_scale_alert',
              channels: ['email']
            },
            order: 2,
            enabled: true
          }
        ],
        triggers: [
          {
            id: '3',
            type: 'schedule',
            name: 'System monitoring',
            configuration: {
              schedule: '*/5 * * * *',
              timezone: 'UTC'
            },
            enabled: true
          }
        ],
        createdBy: 'ops@company.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-13T14:20:00Z',
        lastExecuted: '2024-01-15T10:15:00Z',
        executionCount: 8,
        successRate: 87.5,
        errorCount: 1
      }
    ]);

    setWorkflows([
      {
        id: '1',
        name: 'New user onboarding workflow',
        description: 'Automated workflow for new user registration and setup',
        category: 'general',
        status: 'active',
        steps: [
          {
            id: '1',
            name: 'Validate user data',
            type: 'condition',
            configuration: {
              field: 'email',
              operator: 'regex',
              value: '^[^@]+@[^@]+\\.[^@]+$'
            },
            order: 1,
            enabled: true
          },
          {
            id: '2',
            name: 'Send welcome email',
            type: 'action',
            configuration: {
              template: 'welcome_email',
              channel: 'email'
            },
            order: 2,
            enabled: true
          },
          {
            id: '3',
            name: 'Create user profile',
            type: 'api_call',
            configuration: {
              endpoint: '/api/users/create',
              method: 'POST'
            },
            order: 3,
            enabled: true
          },
          {
            id: '4',
            name: 'Assign default role',
            type: 'api_call',
            configuration: {
              endpoint: '/api/users/assign-role',
              method: 'POST'
            },
            order: 4,
            enabled: true
          }
        ],
        triggers: [
          {
            id: '1',
            type: 'event',
            name: 'User registration event',
            configuration: {
              event_type: 'user.registered'
            },
            enabled: true
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
        errorCount: 5
      }
    ]);
  }, []);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'draft': return 'warning';
      case 'testing': return 'info';
      case 'paused': return 'warning';
      case 'error': return 'error';
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'billing': return <BillingIcon />;
      case 'security': return <SecurityIcon />;
      case 'operations': return <BuildIcon />;
      case 'compliance': return <PolicyIcon />;
      case 'attendance': return <AccessTimeIcon />;
      case 'general': return <RuleIcon />;
      default: return <PolicyIcon />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const filteredRules = policyRules.filter((rule: any) => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || rule.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || rule.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const policyMetrics = {
    totalRules: policyRules.length,
    activeRules: policyRules.filter((r: any) => r.status === 'active').length,
    totalWorkflows: workflows.length,
    activeWorkflows: workflows.filter((w: any) => w.status === 'active').length,
    totalExecutions: policyRules.reduce((sum, r) => sum + r.executionCount, 0) + workflows.reduce((sum, w) => sum + w.executionCount, 0),
    averageSuccessRate: (policyRules.reduce((sum, r) => sum + r.successRate, 0) + workflows.reduce((sum, w) => sum + w.successRate, 0)) / (policyRules.length + workflows.length),
    errorCount: policyRules.reduce((sum, r) => sum + r.errorCount, 0) + workflows.reduce((sum, w) => sum + w.errorCount, 0)
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
            Policy Engine
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage policy rules, automation workflows, and business logic
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
            Create Rule
          </Button>
        </Box>
      </Box>

      {/* Policy Metrics Cards */}
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
                <RuleIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Active Rules</Typography>
                <Typography variant="h4">{policyMetrics.activeRules}</Typography>
                <Typography variant="body2" color="text.secondary">
                  of {policyMetrics.totalRules} total
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                <WorkflowIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Active Workflows</Typography>
                <Typography variant="h4">{policyMetrics.activeWorkflows}</Typography>
                <Typography variant="body2" color="text.secondary">
                  of {policyMetrics.totalWorkflows} total
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
                <Typography variant="h4">{policyMetrics.totalExecutions.toLocaleString()}</Typography>
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
              <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                <ErrorIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Errors</Typography>
                <Typography variant="h4">{policyMetrics.errorCount}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {policyMetrics.averageSuccessRate.toFixed(1)}% success rate
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Policy Rules" />
          <Tab label="Workflows" />
          <Tab label="Analytics" />
          <Tab label="Templates" />
        </Tabs>

        {/* Policy Rules Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Policy Rules</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search rules..."
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
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="testing">Testing</MenuItem>
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
                  <TableCell>Rule</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Executions</TableCell>
                  <TableCell>Success Rate</TableCell>
                  <TableCell>Last Executed</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {getCategoryIcon(rule.category)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{rule.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {rule.description}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={rule.category}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={rule.priority}
                        color={getPriorityColor(rule.priority) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={rule.status}
                        color={getStatusColor(rule.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {rule.executionCount.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          {rule.successRate.toFixed(1)}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={rule.successRate}
                          color={rule.successRate >= 95 ? 'success' : rule.successRate >= 80 ? 'warning' : 'error'}
                          sx={{ width: 60, height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      {rule.lastExecuted ? (
                        <Typography variant="body2">
                          {new Date(rule.lastExecuted).toLocaleString()}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Never
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => setSelectedRule(rule)}>
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

        {/* Workflows Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>Automation Workflows</Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 3 }}>
            {workflows.map((workflow) => (
              <Card key={workflow.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">{workflow.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {workflow.description}
                      </Typography>
                    </Box>
                    <Chip
                      label={workflow.status}
                      color={getStatusColor(workflow.status) as any}
                      size="small"
                    />
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'grid', gap: 1, mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Steps:</Typography>
                      <Typography variant="body2">{workflow.steps.length}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Executions:</Typography>
                      <Typography variant="body2">{workflow.executionCount.toLocaleString()}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Success Rate:</Typography>
                      <Typography variant="body2">{workflow.successRate.toFixed(1)}%</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Errors:</Typography>
                      <Typography variant="body2">{workflow.errorCount}</Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" startIcon={<ViewIcon />}>
                      View
                    </Button>
                    <Button size="small" startIcon={<EditIcon />}>
                      Edit
                    </Button>
                    <Button size="small" startIcon={<PlayIcon />}>
                      Run
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>Policy Analytics</Typography>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 3,
            mb: 3 
          }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Rule Execution Trends</Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">Chart placeholder</Typography>
                </Box>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Success Rate by Category</Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">Chart placeholder</Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Recent Policy Activity</Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Rule executed successfully"
                    secondary="Auto-suspend overdue accounts - 3 accounts suspended - Time: 2024-01-15 09:00:00"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <SecurityIcon color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Security rule triggered"
                    secondary="Block suspicious login attempts - IP 192.168.1.100 blocked - Time: 2024-01-15 08:45:00"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <BuildIcon color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Auto-scaling triggered"
                    secondary="Auto-scale resources on high load - 2 instances added - Time: 2024-01-15 10:15:00"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Templates Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>Policy Templates</Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Billing Templates</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Auto-suspend overdue accounts" secondary="Suspend accounts with overdue payments" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Send payment reminders" secondary="Automated payment reminder emails" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Upgrade subscription" secondary="Auto-upgrade based on usage" />
                  </ListItem>
                </List>
                <Button size="small" startIcon={<AddIcon />}>
                  Create from Template
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Security Templates</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Block suspicious IPs" secondary="Block IPs with multiple failed logins" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Force password reset" secondary="Reset passwords for compromised accounts" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Enable MFA" secondary="Force MFA for high-risk users" />
                  </ListItem>
                </List>
                <Button size="small" startIcon={<AddIcon />}>
                  Create from Template
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Operations Templates</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Auto-scale resources" secondary="Scale based on system load" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Backup automation" secondary="Automated backup scheduling" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Health monitoring" secondary="Monitor and alert on system health" />
                  </ListItem>
                </List>
                <Button size="small" startIcon={<AddIcon />}>
                  Create from Template
                </Button>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>
      </Card>

      {/* Rule Details Dialog */}
      <Dialog open={!!selectedRule} onClose={() => setSelectedRule(null)} maxWidth="lg" fullWidth>
        <DialogTitle>Policy Rule Details</DialogTitle>
        <DialogContent>
          {selectedRule && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedRule.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedRule.description}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Rule Information</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Box>
                      <Typography variant="body2">Category: {selectedRule.category}</Typography>
                      <Typography variant="body2">Priority: {selectedRule.priority}</Typography>
                      <Typography variant="body2">Status: {selectedRule.status}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2">Executions: {selectedRule.executionCount.toLocaleString()}</Typography>
                      <Typography variant="body2">Success Rate: {selectedRule.successRate.toFixed(1)}%</Typography>
                      <Typography variant="body2">Errors: {selectedRule.errorCount}</Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Conditions</Typography>
                  <List dense>
                    {selectedRule.conditions.map((condition, index) => (
                      <ListItem key={condition.id}>
                        <ListItemText
                          primary={`${condition.field} ${condition.operator} ${condition.value}`}
                          secondary={index > 0 ? ` ${condition.logicalOperator}` : ''}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Actions</Typography>
                  <List dense>
                    {selectedRule.actions.map((action) => (
                      <ListItem key={action.id}>
                        <ListItemText
                          primary={action.name}
                          secondary={`${action.type} - ${action.enabled ? 'Enabled' : 'Disabled'}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Triggers</Typography>
                  <List dense>
                    {selectedRule.triggers.map((trigger) => (
                      <ListItem key={trigger.id}>
                        <ListItemText
                          primary={trigger.name}
                          secondary={`${trigger.type} - ${trigger.enabled ? 'Enabled' : 'Disabled'}`}
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
          <Button onClick={() => setSelectedRule(null)}>Close</Button>
          <Button variant="contained">Edit Rule</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PolicyEnginePage;
