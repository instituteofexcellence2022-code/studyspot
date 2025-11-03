/**
 * Security Management Page
 * Comprehensive security, compliance, and audit management
 * 
 * Features:
 * - Security dashboard and monitoring
 * - Compliance management (GDPR, DPDP, SOC2)
 * - Audit logs and trail
 * - Access control management
 * - Security policies and settings
 * - Threat detection and response
 * - Data privacy controls
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  LinearProgress,
  Tabs,
  Tab,
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  Alert
} from '@mui/material';
import { Add as AddIcon,
  AdminPanelSettings as AdminIcon,
  Analytics as AnalyticsIcon,
  Assessment as AssessmentIcon,
  Assignment as AuditIcon,
  CheckCircle as CheckIcon,
  DataUsage as DataIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Error as ErrorIcon,
  Fingerprint as FingerprintIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  PrivacyTip as PrivacyIcon,
  Refresh as RefreshIcon,
  Report as ReportIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Shield as ShieldIcon,
  Timeline as TimelineIcon,
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
  Upload as UploadIcon,
  VerifiedUser as ComplianceIcon,
  Visibility as ViewIcon,
  VpnKey as KeyIcon,
  Warning as WarningIcon } from '@mui/icons-material';
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
  ResponsiveContainer,
  Scatter,
  ScatterChart
} from 'recharts';

interface SecurityEvent {
  id: string;
  timestamp: string;
  type: 'login' | 'logout' | 'permission_change' | 'data_access' | 'security_alert' | 'system_change';
  severity: 'low' | 'medium' | 'high' | 'critical';
  user: string;
  action: string;
  resource: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failed' | 'blocked';
  details: string;
}

interface ComplianceCheck {
  id: string;
  name: string;
  framework: 'GDPR' | 'DPDP' | 'SOC2' | 'ISO27001' | 'HIPAA';
  status: 'compliant' | 'non_compliant' | 'in_progress' | 'not_applicable';
  lastChecked: string;
  nextCheck: string;
  issues: number;
  score: number;
  requirements: Array<{
    id: string;
    description: string;
    status: 'pass' | 'fail' | 'warning';
    evidence: string;
  }>;
}

interface SecurityPolicy {
  id: string;
  name: string;
  category: 'access_control' | 'data_protection' | 'incident_response' | 'audit' | 'privacy';
  status: 'active' | 'draft' | 'archived';
  lastUpdated: string;
  version: string;
  description: string;
  rules: Array<{
    id: string;
    condition: string;
    action: string;
    enabled: boolean;
  }>;
}

interface DataSubjectRequest {
  id: string;
  type: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction';
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  requester: string;
  email: string;
  submittedAt: string;
  dueDate: string;
  completedAt?: string;
  data: any;
}

const SecurityManagementPage: React.FC = () => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>([]);
  const [securityPolicies, setSecurityPolicies] = useState<SecurityPolicy[]>([]);
  const [dataSubjectRequests, setDataSubjectRequests] = useState<DataSubjectRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');

  // Mock data
  useEffect(() => {
    const mockSecurityEvents: SecurityEvent[] = [
      {
        id: '1',
        timestamp: '2024-10-28T10:30:00Z',
        type: 'login',
        severity: 'low',
        user: 'admin@studyspot.com',
        action: 'Successful login',
        resource: 'Admin Portal',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        status: 'success',
        details: 'Login from trusted IP address'
      },
      {
        id: '2',
        timestamp: '2024-10-28T09:15:00Z',
        type: 'security_alert',
        severity: 'high',
        user: 'unknown',
        action: 'Multiple failed login attempts',
        resource: 'API Gateway',
        ipAddress: '203.0.113.42',
        userAgent: 'curl/7.68.0',
        status: 'blocked',
        details: 'IP blocked after 5 failed attempts'
      },
      {
        id: '3',
        timestamp: '2024-10-28T08:45:00Z',
        type: 'data_access',
        severity: 'medium',
        user: 'user@tenant1.com',
        action: 'Accessed sensitive data',
        resource: 'User Database',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        status: 'success',
        details: 'Accessed user profile data'
      }
    ];

    const mockComplianceChecks: ComplianceCheck[] = [
      {
        id: '1',
        name: 'GDPR Compliance',
        framework: 'GDPR',
        status: 'compliant',
        lastChecked: '2024-10-27',
        nextCheck: '2024-11-27',
        issues: 0,
        score: 95,
        requirements: [
          { id: '1', description: 'Data minimization', status: 'pass', evidence: 'Only necessary data collected' },
          { id: '2', description: 'Consent management', status: 'pass', evidence: 'Explicit consent obtained' },
          { id: '3', description: 'Right to erasure', status: 'pass', evidence: 'Automated deletion process' }
        ]
      },
      {
        id: '2',
        name: 'DPDP Compliance',
        framework: 'DPDP',
        status: 'in_progress',
        lastChecked: '2024-10-20',
        nextCheck: '2024-11-20',
        issues: 2,
        score: 78,
        requirements: [
          { id: '1', description: 'Data localization', status: 'pass', evidence: 'Data stored in India' },
          { id: '2', description: 'Consent framework', status: 'warning', evidence: 'Needs update for DPDP' },
          { id: '3', description: 'Data breach notification', status: 'fail', evidence: 'Process not implemented' }
        ]
      }
    ];

    const mockSecurityPolicies: SecurityPolicy[] = [
      {
        id: '1',
        name: 'Password Policy',
        category: 'access_control',
        status: 'active',
        lastUpdated: '2024-10-15',
        version: '2.1',
        description: 'Password requirements and management',
        rules: [
          { id: '1', condition: 'Password length >= 8', action: 'Enforce', enabled: true },
          { id: '2', condition: 'Password complexity', action: 'Require special chars', enabled: true },
          { id: '3', condition: 'Password age > 90 days', action: 'Force reset', enabled: true }
        ]
      },
      {
        id: '2',
        name: 'Data Encryption Policy',
        category: 'data_protection',
        status: 'active',
        lastUpdated: '2024-10-10',
        version: '1.3',
        description: 'Data encryption requirements',
        rules: [
          { id: '1', condition: 'Data at rest', action: 'AES-256 encryption', enabled: true },
          { id: '2', condition: 'Data in transit', action: 'TLS 1.3', enabled: true },
          { id: '3', condition: 'PII data', action: 'Field-level encryption', enabled: true }
        ]
      }
    ];

    const mockDataSubjectRequests: DataSubjectRequest[] = [
      {
        id: '1',
        type: 'access',
        status: 'completed',
        requester: 'John Doe',
        email: 'john@example.com',
        submittedAt: '2024-10-25',
        dueDate: '2024-11-24',
        completedAt: '2024-10-26',
        data: { userId: 'user123', dataType: 'profile' }
      },
      {
        id: '2',
        type: 'erasure',
        status: 'in_progress',
        requester: 'Jane Smith',
        email: 'jane@example.com',
        submittedAt: '2024-10-27',
        dueDate: '2024-11-26',
        data: { userId: 'user456', dataType: 'all' }
      }
    ];

    setTimeout(() => {
      setSecurityEvents(mockSecurityEvents);
      setComplianceChecks(mockComplianceChecks);
      setSecurityPolicies(mockSecurityPolicies);
      setDataSubjectRequests(mockDataSubjectRequests);
      setLoading(false);
    }, 1000);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getComplianceStatusColor = (status?: string) => {
    switch (status) {
      case 'compliant': return 'success';
      case 'non_compliant': return 'error';
      case 'in_progress': return 'warning';
      case 'not_applicable': return 'default';
      default: return 'default';
    }
  };

  const getRequestStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      case 'pending': return 'info';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'login': return <PersonIcon />;
      case 'logout': return <PersonIcon />;
      case 'permission_change': return <KeyIcon />;
      case 'data_access': return <DataIcon />;
      case 'security_alert': return <WarningIcon />;
      case 'system_change': return <SettingsIcon />;
      default: return <SecurityIcon />;
    }
  };

  // Security metrics
  const securityMetrics = {
    totalEvents: securityEvents.length,
    criticalAlerts: securityEvents.filter((e: any) => e.severity === 'critical').length,
    complianceScore: Math.round(complianceChecks.reduce((sum, check) => sum + check.score, 0) / complianceChecks.length),
    activePolicies: securityPolicies.filter((p: any) => p.status === 'active').length,
    pendingRequests: dataSubjectRequests.filter((r: any) => r.status === 'pending' || r.status === 'in_progress').length
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Security Management</Typography>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>Loading security data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Security Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Comprehensive security monitoring, compliance, and audit management
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={selectedTimeRange}
              label="Time Range"
              onChange={(e) => setSelectedTimeRange(e.target.value)}
            >
              <MenuItem value="1h">Last hour</MenuItem>
              <MenuItem value="24h">Last 24 hours</MenuItem>
              <MenuItem value="7d">Last 7 days</MenuItem>
              <MenuItem value="30d">Last 30 days</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => console.log('Export security data')}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={() => console.log('Refresh data')}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Security Metrics Cards */}
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
                <SecurityIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Security Events</Typography>
                <Typography variant="h4">{securityMetrics.totalEvents}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Last {selectedTimeRange}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                <WarningIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Critical Alerts</Typography>
                <Typography variant="h4">{securityMetrics.criticalAlerts}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Require attention
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                <ComplianceIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Compliance Score</Typography>
                <Typography variant="h4">{securityMetrics.complianceScore}%</Typography>
                <Typography variant="body2" color="text.secondary">
                  Average across frameworks
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                <PrivacyIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Pending Requests</Typography>
                <Typography variant="h4">{securityMetrics.pendingRequests}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Data subject requests
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Security Events" />
          <Tab label="Compliance" />
          <Tab label="Policies" />
          <Tab label="Data Privacy" />
          <Tab label="Analytics" />
        </Tabs>

        {/* Security Events Tab */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Resource</TableCell>
                    <TableCell>IP Address</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {securityEvents.map((event) => (
                    <TableRow key={event.id} hover>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(event.timestamp).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getTypeIcon(event.type)}
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {event.type.replace('_', ' ').toUpperCase()}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={event.severity}
                          color={getSeverityColor(event.severity) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{event.user}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{event.action}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{event.resource}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{event.ipAddress}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={event.status}
                          color={event.status === 'success' ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton size="small">
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Investigate">
                            <IconButton size="small">
                              <AnalyticsIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Compliance Tab */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 3 
            }}>
              {complianceChecks.map((check) => (
                <Card key={check.id}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">{check.name}</Typography>
                      <Chip
                        label={check.status.replace('_', ' ').toUpperCase()}
                        color={getComplianceStatusColor(check.status) as any}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2">Score: {check.score}%</Typography>
                      <Typography variant="body2">Issues: {check.issues}</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={check.score}
                      color={check.score >= 90 ? 'success' : check.score >= 70 ? 'warning' : 'error'}
                      sx={{ mb: 2 }}
                    />
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Last checked: {check.lastChecked}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Next check: {check.nextCheck}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Button size="small" startIcon={<ViewIcon />}>
                        View Details
                      </Button>
                      <Button size="small" startIcon={<RefreshIcon />} sx={{ ml: 1 }}>
                        Run Check
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        )}

        {/* Policies Tab */}
        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Security Policies</Typography>
              <Button variant="contained" startIcon={<AddIcon />}>
                Create Policy
              </Button>
            </Box>
            {securityPolicies.map((policy) => (
              <Accordion key={policy.id} sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ViewIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <ShieldIcon />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6">{policy.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {policy.description}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip label={policy.status} size="small" />
                      <Typography variant="body2" color="text.secondary">
                        v{policy.version}
                      </Typography>
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Last updated: {policy.lastUpdated}
                  </Typography>
                  <Typography variant="subtitle2" gutterBottom>
                    Rules:
                  </Typography>
                  <List dense>
                    {policy.rules.map((rule) => (
                      <ListItem key={rule.id}>
                        <ListItemIcon>
                          {rule.enabled ? <CheckIcon color="success" /> : <ErrorIcon color="error" />}
                        </ListItemIcon>
                        <ListItemText
                          primary={rule.condition}
                          secondary={rule.action}
                        />
                      </ListItem>
                    ))}
                  </List>
                  <Box sx={{ mt: 2 }}>
                    <Button size="small" startIcon={<EditIcon />}>
                      Edit
                    </Button>
                    <Button size="small" startIcon={<ViewIcon />} sx={{ ml: 1 }}>
                      View Details
                    </Button>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}

        {/* Data Privacy Tab */}
        {tabValue === 3 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Data Subject Requests
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Request ID</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Requester</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Submitted</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataSubjectRequests.map((request) => (
                    <TableRow key={request.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">{request.id}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={request.type} size="small" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{request.requester}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{request.email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={request.status}
                          color={getRequestStatusColor(request.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{request.submittedAt}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{request.dueDate}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Request">
                            <IconButton size="small">
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Process Request">
                            <IconButton size="small">
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Analytics Tab */}
        {tabValue === 4 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 3 
            }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Security Events Over Time
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={[
                      { time: '00:00', events: 5, alerts: 1 },
                      { time: '04:00', events: 2, alerts: 0 },
                      { time: '08:00', events: 12, alerts: 2 },
                      { time: '12:00', events: 18, alerts: 3 },
                      { time: '16:00', events: 15, alerts: 1 },
                      { time: '20:00', events: 8, alerts: 0 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Area type="monotone" dataKey="events" stackId="1" stroke="#1976d2" fill="#1976d2" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="alerts" stackId="2" stroke="#d32f2f" fill="#d32f2f" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Compliance Status
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Compliant', value: 3, color: '#4caf50' },
                          { name: 'In Progress', value: 1, color: '#ff9800' },
                          { name: 'Non-Compliant', value: 0, color: '#f44336' }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {[
                          { name: 'Compliant', value: 3, color: '#4caf50' },
                          { name: 'In Progress', value: 1, color: '#ff9800' },
                          { name: 'Non-Compliant', value: 0, color: '#f44336' }
                        ].map((entry, index) => (
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
        )}
      </Card>
    </Box>
  );
};

export default SecurityManagementPage;
