import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  GridLegacy as Grid,
  Button,
  IconButton,
  Chip,
  LinearProgress,
  Alert,
  Tooltip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Paper,
  useTheme,
  alpha,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Badge,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Shield as ShieldIcon,
  Lock as LockIcon,
  VpnKey as KeyIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  TrendingUp as TrendingIcon,
  TrendingDown as TrendingDownIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
  Assignment as AuditIcon,
  VerifiedUser as ComplianceIcon,
  Lock as EncryptionIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  Computer as ComputerIcon,
  NetworkCheck as NetworkIcon,
  DataUsage as DataIcon,
  Security as PolicyIcon,
  Report as ReportIcon,
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
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { toast } from 'react-toastify';
import { enterpriseSecurityService, SecurityAudit, ComplianceReport, SecurityPolicy } from '../../services/enterpriseSecurityService';

interface SecurityMetrics {
  overallSecurityScore: number;
  encryptionStatus: {
    atRest: number;
    inTransit: number;
    inUse: number;
  };
  accessControl: {
    totalUsers: number;
    activeSessions: number;
    failedAttempts: number;
    blockedIPs: number;
  };
  compliance: {
    gdpr: number;
    ccpa: number;
    hipaa: number;
    iso27001: number;
  };
  threats: {
    detected: number;
    blocked: number;
    resolved: number;
    pending: number;
  };
}

interface SecurityTrend {
  date: string;
  events: number;
  threats: number;
  compliance: number;
}

const AdvancedSecurityDashboard: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null);
  const [auditLogs, setAuditLogs] = useState<SecurityAudit[]>([]);
  const [complianceReports, setComplianceReports] = useState<ComplianceReport[]>([]);
  const [securityPolicies, setSecurityPolicies] = useState<SecurityPolicy[]>([]);
  const [securityTrends, setSecurityTrends] = useState<SecurityTrend[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showEncryptionDetails, setShowEncryptionDetails] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<SecurityPolicy | null>(null);
  const [policyDialogOpen, setPolicyDialogOpen] = useState(false);

  // Mock data generation
  const generateMockSecurityMetrics = (): SecurityMetrics => ({
    overallSecurityScore: 94.5,
    encryptionStatus: {
      atRest: 100,
      inTransit: 100,
      inUse: 95
    },
    accessControl: {
      totalUsers: 1250,
      activeSessions: 45,
      failedAttempts: 12,
      blockedIPs: 3
    },
    compliance: {
      gdpr: 98,
      ccpa: 95,
      hipaa: 92,
      iso27001: 96
    },
    threats: {
      detected: 25,
      blocked: 23,
      resolved: 20,
      pending: 5
    }
  });

  const generateMockAuditLogs = (): SecurityAudit[] => [
    {
      id: 'audit-001',
      timestamp: new Date().toISOString(),
      event: 'biometric_data_access',
      severity: 'medium',
      source: 'face-recognition-system',
      details: { userId: 'user123', dataType: 'face_encoding' },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0...',
      resolved: false
    },
    {
      id: 'audit-002',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      event: 'failed_login_attempt',
      severity: 'high',
      source: 'authentication-system',
      details: { userId: 'user456', attempts: 5 },
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0...',
      resolved: true
    },
    {
      id: 'audit-003',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      event: 'data_encryption',
      severity: 'low',
      source: 'encryption-service',
      details: { dataType: 'biometric_template', algorithm: 'AES-256-GCM' },
      ipAddress: '192.168.1.102',
      userAgent: 'System',
      resolved: true
    }
  ];

  const generateMockComplianceReports = (): ComplianceReport[] => [
    {
      standard: 'GDPR',
      status: 'compliant',
      score: 98,
      issues: [],
      lastAudit: new Date().toISOString()
    },
    {
      standard: 'CCPA',
      status: 'compliant',
      score: 95,
      issues: [],
      lastAudit: new Date().toISOString()
    },
    {
      standard: 'HIPAA',
      status: 'partial',
      score: 92,
      issues: [
        {
          id: 'hipaa-001',
          description: 'Missing audit trail for data access',
          severity: 'medium',
          remediation: 'Implement comprehensive audit logging'
        }
      ],
      lastAudit: new Date().toISOString()
    }
  ];

  const generateMockSecurityTrends = (): SecurityTrend[] => {
    return Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        date: date.toISOString().split('T')[0],
        events: Math.floor(Math.random() * 50) + 10,
        threats: Math.floor(Math.random() * 10) + 1,
        compliance: 90 + Math.random() * 10
      };
    }).reverse();
  };

  // Load security data
  const loadSecurityData = async () => {
    setIsLoading(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSecurityMetrics(generateMockSecurityMetrics());
      setAuditLogs(generateMockAuditLogs());
      setComplianceReports(generateMockComplianceReports());
      setSecurityTrends(generateMockSecurityTrends());
    } catch (error) {
      toast.error('Failed to load security data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSecurityData();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <ErrorIcon color="error" />;
      case 'high': return <WarningIcon color="warning" />;
      case 'medium': return <InfoIcon color="info" />;
      case 'low': return <CheckIcon color="success" />;
      default: return <InfoIcon />;
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'success';
      case 'partial': return 'warning';
      case 'non-compliant': return 'error';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!securityMetrics) {
    return (
      <Alert severity="error">
        Failed to load security data. Please try again.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            <ShieldIcon sx={{ mr: 1, fontSize: 'inherit' }} /> Enterprise Security Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Military-grade security monitoring and compliance management
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadSecurityData}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            sx={{
              background: 'linear-gradient(45deg, #f44336 30%, #d32f2f 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #d32f2f 30%, #b71c1c 90%)',
              }
            }}
          >
            Security Report
          </Button>
        </Box>
      </Box>

      {/* Security Score Banner */}
      <Alert 
        severity={securityMetrics.overallSecurityScore >= 95 ? 'success' : 'warning'}
        sx={{ mb: 3 }}
        icon={<ShieldIcon />}
      >
        <Typography variant="subtitle2" gutterBottom>
          🛡️ Overall Security Score: {securityMetrics.overallSecurityScore}%
        </Typography>
        <Typography variant="body2">
          {securityMetrics.overallSecurityScore >= 95 
            ? 'Excellent security posture - Enterprise grade protection active'
            : 'Good security posture - Minor improvements recommended'
          }
        </Typography>
      </Alert>

      {/* Key Security Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Encryption Status
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {Math.round((securityMetrics.encryptionStatus.atRest + 
                                securityMetrics.encryptionStatus.inTransit + 
                                securityMetrics.encryptionStatus.inUse) / 3)}%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                  <LockIcon />
                </Avatar>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Chip 
                  label="AES-256-GCM" 
                  color="success" 
                  size="small" 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Active Sessions
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {securityMetrics.accessControl.activeSessions}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                  <PersonIcon />
                </Avatar>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Chip 
                  label={`${securityMetrics.accessControl.totalUsers} Total Users`}
                  color="info" 
                  size="small" 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Threats Blocked
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {securityMetrics.threats.blocked}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
                  <SecurityIcon />
                </Avatar>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Chip 
                  label={`${securityMetrics.threats.detected} Detected`}
                  color="warning" 
                  size="small" 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Compliance Score
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {Math.round((securityMetrics.compliance.gdpr + 
                                securityMetrics.compliance.ccpa + 
                                securityMetrics.compliance.hipaa + 
                                securityMetrics.compliance.iso27001) / 4)}%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                  <ComplianceIcon />
                </Avatar>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Chip 
                  label="Multi-Standard" 
                  color="primary" 
                  size="small" 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Security Overview" icon={<ShieldIcon />} />
            <Tab label="Audit Logs" icon={<AuditIcon />} />
            <Tab label="Compliance" icon={<ComplianceIcon />} />
            <Tab label="Encryption" icon={<EncryptionIcon />} />
            <Tab label="Access Control" icon={<KeyIcon />} />
            <Tab label="Threats" icon={<WarningIcon />} />
          </Tabs>
        </Box>

        <CardContent>
          {/* Security Overview Tab */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Security Trends (30 Days)
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={securityTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="events" 
                          stroke={theme.palette.primary.main}
                          strokeWidth={2}
                          name="Security Events"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="threats" 
                          stroke={theme.palette.error.main}
                          strokeWidth={2}
                          name="Threats"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="compliance" 
                          stroke={theme.palette.success.main}
                          strokeWidth={2}
                          name="Compliance %"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Encryption Status
                    </Typography>
                    <List>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <LockIcon color="success" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Data at Rest"
                          secondary="AES-256-GCM"
                        />
                        <ListItemSecondaryAction>
                          <Chip 
                            label={`${securityMetrics.encryptionStatus.atRest}%`}
                            color="success"
                            size="small"
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <NetworkIcon color="success" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Data in Transit"
                          secondary="TLS 1.3"
                        />
                        <ListItemSecondaryAction>
                          <Chip 
                            label={`${securityMetrics.encryptionStatus.inTransit}%`}
                            color="success"
                            size="small"
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <DataIcon color="warning" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Data in Use"
                          secondary="Memory Encryption"
                        />
                        <ListItemSecondaryAction>
                          <Chip 
                            label={`${securityMetrics.encryptionStatus.inUse}%`}
                            color="warning"
                            size="small"
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Audit Logs Tab */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Security Audit Logs
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Event</TableCell>
                      <TableCell>Severity</TableCell>
                      <TableCell>Source</TableCell>
                      <TableCell>IP Address</TableCell>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {log.event.replace(/_/g, ' ').toUpperCase()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getSeverityIcon(log.severity)}
                            label={log.severity}
                            color={getSeverityColor(log.severity) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{log.source}</TableCell>
                        <TableCell>{log.ipAddress}</TableCell>
                        <TableCell>
                          {new Date(log.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={log.resolved ? 'Resolved' : 'Open'}
                            color={log.resolved ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Compliance Tab */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Compliance Status
              </Typography>
              <Grid container spacing={3}>
                {complianceReports.map((report) => (
                  <Grid item xs={12} md={6} key={report.standard}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6" sx={{ flexGrow: 1 }}>
                            {report.standard}
                          </Typography>
                          <Chip
                            label={report.status}
                            color={getComplianceColor(report.status) as any}
                            size="small"
                          />
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" gutterBottom>
                            Compliance Score: {report.score}%
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={report.score} 
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Last Audit: {new Date(report.lastAudit).toLocaleDateString()}
                        </Typography>
                        
                        {report.issues.length > 0 && (
                          <Alert severity="warning" sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Issues Found ({report.issues.length})
                            </Typography>
                            {report.issues.map((issue) => (
                              <Typography key={issue.id} variant="body2">
                                • {issue.description}
                              </Typography>
                            ))}
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Encryption Tab */}
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Data Encryption Management
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Biometric Data
                      </Typography>
                      <List>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon><LockIcon color="success" /></ListItemIcon>
                          <ListItemText 
                            primary="Face Encodings"
                            secondary="AES-256-GCM Encrypted"
                          />
                        </ListItem>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon><LockIcon color="success" /></ListItemIcon>
                          <ListItemText 
                            primary="Templates"
                            secondary="End-to-End Encrypted"
                          />
                        </ListItem>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon><LockIcon color="success" /></ListItemIcon>
                          <ListItemText 
                            primary="Metadata"
                            secondary="Field-Level Encryption"
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Communication
                      </Typography>
                      <List>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon><NetworkIcon color="success" /></ListItemIcon>
                          <ListItemText 
                            primary="API Calls"
                            secondary="TLS 1.3 + Certificate Pinning"
                          />
                        </ListItem>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon><NetworkIcon color="success" /></ListItemIcon>
                          <ListItemText 
                            primary="WebSocket"
                            secondary="WSS with Perfect Forward Secrecy"
                          />
                        </ListItem>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon><NetworkIcon color="success" /></ListItemIcon>
                          <ListItemText 
                            primary="File Transfer"
                            secondary="Encrypted File Upload/Download"
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Key Management
                      </Typography>
                      <List>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon><KeyIcon color="success" /></ListItemIcon>
                          <ListItemText 
                            primary="Key Rotation"
                            secondary="Automatic Every 90 Days"
                          />
                        </ListItem>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon><KeyIcon color="success" /></ListItemIcon>
                          <ListItemText 
                            primary="Key Storage"
                            secondary="Hardware Security Module"
                          />
                        </ListItem>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon><KeyIcon color="success" /></ListItemIcon>
                          <ListItemText 
                            primary="Access Control"
                            secondary="Multi-Factor Authentication"
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Access Control Tab */}
          {activeTab === 4 && (
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Access Control Management
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        User Access Summary
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2">Total Users</Typography>
                        <Typography variant="h6">{securityMetrics.accessControl.totalUsers}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2">Active Sessions</Typography>
                        <Typography variant="h6">{securityMetrics.accessControl.activeSessions}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2">Failed Attempts</Typography>
                        <Typography variant="h6" color="error.main">{securityMetrics.accessControl.failedAttempts}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2">Blocked IPs</Typography>
                        <Typography variant="h6" color="warning.main">{securityMetrics.accessControl.blockedIPs}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Security Policies
                      </Typography>
                      <List>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                          <ListItemText 
                            primary="Password Policy"
                            secondary="Strong passwords required"
                          />
                        </ListItem>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                          <ListItemText 
                            primary="Session Timeout"
                            secondary="30 minutes of inactivity"
                          />
                        </ListItem>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                          <ListItemText 
                            primary="IP Whitelisting"
                            secondary="Restricted network access"
                          />
                        </ListItem>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                          <ListItemText 
                            primary="Multi-Factor Auth"
                            secondary="Required for admin access"
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Threats Tab */}
          {activeTab === 5 && (
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Threat Detection & Response
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Threat Statistics
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={[
                          { name: 'Detected', value: securityMetrics.threats.detected, color: theme.palette.warning.main },
                          { name: 'Blocked', value: securityMetrics.threats.blocked, color: theme.palette.success.main },
                          { name: 'Resolved', value: securityMetrics.threats.resolved, color: theme.palette.info.main },
                          { name: 'Pending', value: securityMetrics.threats.pending, color: theme.palette.error.main }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar dataKey="value" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Active Protections
                      </Typography>
                      <List>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon><ShieldIcon color="success" /></ListItemIcon>
                          <ListItemText 
                            primary="Anti-Spoofing"
                            secondary="Active - 99.2% accuracy"
                          />
                        </ListItem>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon><ShieldIcon color="success" /></ListItemIcon>
                          <ListItemText 
                            primary="Intrusion Detection"
                            secondary="Active - Real-time monitoring"
                          />
                        </ListItem>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon><ShieldIcon color="success" /></ListItemIcon>
                          <ListItemText 
                            primary="Rate Limiting"
                            secondary="Active - 100 req/min limit"
                          />
                        </ListItem>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon><ShieldIcon color="success" /></ListItemIcon>
                          <ListItemText 
                            primary="DDoS Protection"
                            secondary="Active - Cloudflare integration"
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdvancedSecurityDashboard;
