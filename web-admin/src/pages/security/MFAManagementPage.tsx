/**
 * MFA Management Page
 * 
 * Features:
 * - MFA configuration and enforcement policies
 * - TOTP, SMS, Email, Push notification methods
 * - Backup codes and recovery options
 * - MFA analytics and compliance reporting
 * - User MFA status management
 * - Emergency access procedures
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
  Switch,
  FormControlLabel,
  Alert,
  Paper
} from '@mui/material';
import { Add as AddIcon,
  AdminPanelSettings as AdminIcon,
  Assessment as AssessmentIcon,
  Assignment as AuditIcon,
  Backup as BackupIcon,
  CheckCircle as CheckIcon,
  DataUsage as DataIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Error as ErrorIcon,
  Fingerprint as FingerprintIcon,
  Key as KeyIcon,
  Lock as LockIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  PrivacyTip as PrivacyIcon,
  QrCode as QrCodeIcon,
  Refresh as RefreshIcon,
  Report as ReportIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Shield as ShieldIcon,
  Smartphone as SmartphoneIcon,
  Sms as SmsIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  Upload as UploadIcon,
  VerifiedUser as VerifiedUserIcon,
  Visibility as ViewIcon,
  VpnKey as VpnKeyIcon,
  Warning as WarningIcon } from '@mui/icons-material';
;
interface MFAMethod {
  id: string;
  name: string;
  type: 'totp' | 'sms' | 'email' | 'push' | 'backup';
  enabled: boolean;
  users: number;
  successRate: number;
  lastUsed: string;
  status: 'active' | 'inactive' | 'deprecated';
}

interface MFAUser {
  id: string;
  name: string;
  email: string;
  methods: string[];
  lastMFA: string;
  status: 'enrolled' | 'pending' | 'locked' | 'exempt';
  riskScore: number;
  tenant: string;
}

interface MFAPolicy {
  id: string;
  name: string;
  description: string;
  enforcement: 'mandatory' | 'optional' | 'conditional';
  methods: string[];
  gracePeriod: number;
  riskThreshold: number;
  exemptRoles: string[];
  enabled: boolean;
}

const MFAManagementPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [mfaMethods, setMfaMethods] = useState<MFAMethod[]>([]);
  const [mfaUsers, setMfaUsers] = useState<MFAUser[]>([]);
  const [mfaPolicies, setMfaPolicies] = useState<MFAPolicy[]>([]);
  const [selectedUser, setSelectedUser] = useState<MFAUser | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');

  // Mock data
  useEffect(() => {
    setMfaMethods([
      {
        id: '1',
        name: 'TOTP (Google Authenticator)',
        type: 'totp',
        enabled: true,
        users: 1250,
        successRate: 98.5,
        lastUsed: '2024-01-15T10:30:00Z',
        status: 'active'
      },
      {
        id: '2',
        name: 'SMS Verification',
        type: 'sms',
        enabled: true,
        users: 890,
        successRate: 95.2,
        lastUsed: '2024-01-15T09:15:00Z',
        status: 'active'
      },
      {
        id: '3',
        name: 'Email Verification',
        type: 'email',
        enabled: true,
        users: 2100,
        successRate: 97.8,
        lastUsed: '2024-01-15T11:45:00Z',
        status: 'active'
      },
      {
        id: '4',
        name: 'Push Notifications',
        type: 'push',
        enabled: false,
        users: 0,
        successRate: 0,
        lastUsed: 'Never',
        status: 'inactive'
      },
      {
        id: '5',
        name: 'Backup Codes',
        type: 'backup',
        enabled: true,
        users: 1250,
        successRate: 100,
        lastUsed: '2024-01-14T16:20:00Z',
        status: 'active'
      }
    ]);

    setMfaUsers([
      {
        id: '1',
        name: 'John Smith',
        email: 'john.smith@company.com',
        methods: ['totp', 'sms', 'backup'],
        lastMFA: '2024-01-15T10:30:00Z',
        status: 'enrolled',
        riskScore: 15,
        tenant: 'Acme Corp'
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah.j@company.com',
        methods: ['email', 'backup'],
        lastMFA: '2024-01-15T09:15:00Z',
        status: 'enrolled',
        riskScore: 8,
        tenant: 'Tech Solutions'
      },
      {
        id: '3',
        name: 'Mike Wilson',
        email: 'mike.w@company.com',
        methods: [],
        lastMFA: 'Never',
        status: 'pending',
        riskScore: 45,
        tenant: 'Global Inc'
      },
      {
        id: '4',
        name: 'Lisa Brown',
        email: 'lisa.b@company.com',
        methods: ['totp'],
        lastMFA: '2024-01-14T16:20:00Z',
        status: 'locked',
        riskScore: 85,
        tenant: 'StartupXYZ'
      }
    ]);

    setMfaPolicies([
      {
        id: '1',
        name: 'Standard MFA Policy',
        description: 'Requires MFA for all admin users',
        enforcement: 'mandatory',
        methods: ['totp', 'sms', 'email'],
        gracePeriod: 7,
        riskThreshold: 30,
        exemptRoles: [],
        enabled: true
      },
      {
        id: '2',
        name: 'High Security Policy',
        description: 'Strict MFA requirements for sensitive operations',
        enforcement: 'mandatory',
        methods: ['totp', 'push'],
        gracePeriod: 0,
        riskThreshold: 20,
        exemptRoles: [],
        enabled: true
      },
      {
        id: '3',
        name: 'Flexible Policy',
        description: 'Optional MFA with risk-based enforcement',
        enforcement: 'conditional',
        methods: ['totp', 'sms', 'email', 'backup'],
        gracePeriod: 14,
        riskThreshold: 50,
        exemptRoles: ['guest', 'viewer'],
        enabled: true
      }
    ]);
  }, []);

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'totp': return <SmartphoneIcon />;
      case 'sms': return <SmsIcon />;
      case 'email': return <EmailIcon />;
      case 'push': return <NotificationsIcon />;
      case 'backup': return <BackupIcon />;
      default: return <KeyIcon />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'deprecated': return 'error';
      case 'enrolled': return 'success';
      case 'pending': return 'warning';
      case 'locked': return 'error';
      case 'exempt': return 'info';
      default: return 'default';
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 20) return 'success';
    if (score < 50) return 'warning';
    return 'error';
  };

  const filteredUsers = mfaUsers.filter((user: any) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const mfaMetrics = {
    totalUsers: mfaUsers.length,
    enrolledUsers: mfaUsers.filter((u: any) => u.status === 'enrolled').length,
    pendingUsers: mfaUsers.filter((u: any) => u.status === 'pending').length,
    lockedUsers: mfaUsers.filter((u: any) => u.status === 'locked').length,
    averageRiskScore: mfaUsers.reduce((sum, u) => sum + u.riskScore, 0) / mfaUsers.length,
    complianceRate: (mfaUsers.filter((u: any) => u.status === 'enrolled').length / mfaUsers.length) * 100
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
            MFA Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage multi-factor authentication methods, policies, and user enrollment
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
            Add MFA Method
          </Button>
        </Box>
      </Box>

      {/* MFA Metrics Cards */}
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
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Total Users</Typography>
                <Typography variant="h4">{mfaMetrics.totalUsers}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Platform users
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
                <Typography variant="h6">Enrolled</Typography>
                <Typography variant="h4">{mfaMetrics.enrolledUsers}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {mfaMetrics.complianceRate.toFixed(1)}% compliance
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
                <Typography variant="h6">Pending</Typography>
                <Typography variant="h4">{mfaMetrics.pendingUsers}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Need enrollment
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                <LockIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Locked</Typography>
                <Typography variant="h4">{mfaMetrics.lockedUsers}</Typography>
                <Typography variant="body2" color="text.secondary">
                  High risk users
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="MFA Methods" />
          <Tab label="User Management" />
          <Tab label="Policies" />
          <Tab label="Analytics" />
          <Tab label="Settings" />
        </Tabs>

        {/* MFA Methods Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Available MFA Methods</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search methods..."
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
                  <MenuItem value="deprecated">Deprecated</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Method</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Users</TableCell>
                  <TableCell>Success Rate</TableCell>
                  <TableCell>Last Used</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mfaMethods.map((method) => (
                  <TableRow key={method.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {getMethodIcon(method.type)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{method.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {method.type.toUpperCase()}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={method.type.toUpperCase()}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {method.users.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          {method.successRate}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={method.successRate}
                          color={method.successRate >= 95 ? 'success' : method.successRate >= 80 ? 'warning' : 'error'}
                          sx={{ width: 60, height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(method.lastUsed).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={method.status}
                        color={getStatusColor(method.status) as any}
                        size="small"
                      />
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
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* User Management Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">User MFA Status</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search users..."
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
                  <MenuItem value="enrolled">Enrolled</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="locked">Locked</MenuItem>
                  <MenuItem value="exempt">Exempt</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Methods</TableCell>
                  <TableCell>Last MFA</TableCell>
                  <TableCell>Risk Score</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Tenant</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {user.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{user.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {user.methods.map((method) => (
                          <Chip
                            key={method}
                            label={method.toUpperCase()}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                        {user.methods.length === 0 && (
                          <Typography variant="body2" color="text.secondary">
                            No methods
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {user.lastMFA === 'Never' ? 'Never' : new Date(user.lastMFA).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          {user.riskScore}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={user.riskScore}
                          color={getRiskColor(user.riskScore) as any}
                          sx={{ width: 60, height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status}
                        color={getStatusColor(user.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{user.tenant}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => setSelectedUser(user)}>
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
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Policies Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">MFA Policies</Typography>
            <Button variant="contained" startIcon={<AddIcon />}>
              Create Policy
            </Button>
          </Box>

          <Box sx={{ display: 'grid', gap: 3 }}>
            {mfaPolicies.map((policy) => (
              <Card key={policy.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">{policy.name}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {policy.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          label={policy.enforcement}
                          color={policy.enforcement === 'mandatory' ? 'error' : policy.enforcement === 'optional' ? 'success' : 'warning'}
                          size="small"
                        />
                        <Chip
                          label={`${policy.gracePeriod} days grace`}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={`Risk threshold: ${policy.riskThreshold}`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Switch
                        checked={policy.enabled}
                        onChange={() => {}}
                        color="primary"
                      />
                      <IconButton size="small">
                        <EditIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>Required Methods</Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {policy.methods.map((method) => (
                          <Chip
                            key={method}
                            label={method.toUpperCase()}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>Exempt Roles</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {policy.exemptRoles.length > 0 ? policy.exemptRoles.join(', ') : 'None'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>MFA Analytics & Reporting</Typography>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 3,
            mb: 3 
          }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Enrollment Trends</Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">Chart placeholder</Typography>
                </Box>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Method Usage</Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">Chart placeholder</Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Security Events</Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <WarningIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Failed MFA attempt detected"
                    secondary="User: john.smith@company.com - Method: TOTP - Time: 2024-01-15 10:30:00"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="MFA enrollment completed"
                    secondary="User: sarah.j@company.com - Method: SMS - Time: 2024-01-15 09:15:00"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ErrorIcon color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Account locked due to multiple failed attempts"
                    secondary="User: mike.w@company.com - Time: 2024-01-14 16:20:00"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Settings Tab */}
        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom>MFA Configuration</Typography>
          
          <Box sx={{ display: 'grid', gap: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Global Settings</Typography>
                <Box sx={{ display: 'grid', gap: 2 }}>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Enable MFA for all users"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Require MFA for admin operations"
                  />
                  <FormControlLabel
                    control={<Switch />}
                    label="Allow backup codes"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Send MFA reminders"
                  />
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Security Settings</Typography>
                <Box sx={{ display: 'grid', gap: 2 }}>
                  <TextField
                    label="Session timeout (minutes)"
                    type="number"
                    defaultValue={30}
                    size="small"
                  />
                  <TextField
                    label="Max failed attempts"
                    type="number"
                    defaultValue={5}
                    size="small"
                  />
                  <TextField
                    label="Lockout duration (minutes)"
                    type="number"
                    defaultValue={15}
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Emergency Access</Typography>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Emergency access bypasses MFA requirements. Use with extreme caution.
                </Alert>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button variant="outlined" startIcon={<KeyIcon />}>
                    Generate Emergency Code
                  </Button>
                  <Button variant="outlined" startIcon={<DownloadIcon />}>
                    Download Recovery Keys
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser} onClose={() => setSelectedUser(null)} maxWidth="md" fullWidth>
        <DialogTitle>User MFA Details</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedUser.name} ({selectedUser.email})
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Tenant: {selectedUser.tenant}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>MFA Methods</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {selectedUser.methods.map((method) => (
                      <Chip
                        key={method}
                        label={method.toUpperCase()}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                    {selectedUser.methods.length === 0 && (
                      <Typography variant="body2" color="text.secondary">
                        No MFA methods enrolled
                      </Typography>
                    )}
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Risk Assessment</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ mr: 2 }}>
                      Risk Score: {selectedUser.riskScore}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={selectedUser.riskScore}
                      color={getRiskColor(selectedUser.riskScore) as any}
                      sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                    />
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Last MFA Activity</Typography>
                  <Typography variant="body2">
                    {selectedUser.lastMFA === 'Never' ? 'Never' : new Date(selectedUser.lastMFA).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedUser(null)}>Close</Button>
          <Button variant="contained">Manage MFA</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MFAManagementPage;






