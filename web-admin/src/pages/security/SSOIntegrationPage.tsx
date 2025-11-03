/**
 * SSO Integration Management Page
 * 
 * Features:
 * - SAML, OAuth2, OpenID Connect providers
 * - Identity provider configuration
 * - User provisioning and deprovisioning
 * - SSO analytics and monitoring
 * - Security policies and compliance
 * - Integration testing and validation
 */

import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import {
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  LinearProgress,
  CircularProgress,
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
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Avatar
} from '@mui/material';
import { Add as AddIcon,
  AdminPanelSettings as AdminIcon,
  Assessment as AssessmentIcon,
  Assignment as AuditIcon,
  Backup as BackupIcon,
  Business as BusinessIcon,
  CheckCircle as CheckIcon,
  Cloud as CloudIcon,
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
  PrivacyTip as PrivacyIcon,
  QrCode as QrCodeIcon,
  Refresh as RefreshIcon,
  Report as ReportIcon,
  Science as TestIcon,
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
interface SSOProvider {
  id: string;
  name: string;
  type: 'saml' | 'oauth2' | 'oidc' | 'ldap' | 'ad';
  status: 'active' | 'inactive' | 'error' | 'testing';
  users: number;
  lastSync: string;
  successRate: number;
  configuration: {
    enabled: boolean;
    autoProvision: boolean;
    updateProfile: boolean;
    syncGroups: boolean;
  };
}

interface SSOUser {
  id: string;
  name: string;
  email: string;
  provider: string;
  lastLogin: string;
  status: 'active' | 'suspended' | 'pending' | 'error';
  groups: string[];
  attributes: Record<string, string>;
}

interface SSOConfiguration {
  id: string;
  name: string;
  provider: string;
  type: string;
  endpoint: string;
  clientId: string;
  status: 'configured' | 'testing' | 'active' | 'error';
  lastTested: string;
  testResults: {
    connection: boolean;
    authentication: boolean;
    userProvisioning: boolean;
    groupSync: boolean;
  };
}

const SSOIntegrationPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [ssoProviders, setSsoProviders] = useState<SSOProvider[]>([]);
  const [ssoUsers, setSsoUsers] = useState<SSOUser[]>([]);
  const [ssoConfigurations, setSsoConfigurations] = useState<SSOConfiguration[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<SSOProvider | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProvider, setFilterProvider] = useState('all');

  // Mock data
  useEffect(() => {
    setSsoProviders([
      {
        id: '1',
        name: 'Azure Active Directory',
        type: 'saml',
        status: 'active',
        users: 1250,
        lastSync: '2024-01-15T10:30:00Z',
        successRate: 98.5,
        configuration: {
          enabled: true,
          autoProvision: true,
          updateProfile: true,
          syncGroups: true
        }
      },
      {
        id: '2',
        name: 'Google Workspace',
        type: 'oidc',
        status: 'active',
        users: 890,
        lastSync: '2024-01-15T09:15:00Z',
        successRate: 97.2,
        configuration: {
          enabled: true,
          autoProvision: true,
          updateProfile: false,
          syncGroups: true
        }
      },
      {
        id: '3',
        name: 'Okta',
        type: 'saml',
        status: 'testing',
        users: 0,
        lastSync: 'Never',
        successRate: 0,
        configuration: {
          enabled: false,
          autoProvision: false,
          updateProfile: false,
          syncGroups: false
        }
      },
      {
        id: '4',
        name: 'Active Directory',
        type: 'ldap',
        status: 'error',
        users: 2100,
        lastSync: '2024-01-14T16:20:00Z',
        successRate: 85.3,
        configuration: {
          enabled: true,
          autoProvision: false,
          updateProfile: true,
          syncGroups: true
        }
      }
    ]);

    setSsoUsers([
      {
        id: '1',
        name: 'John Smith',
        email: 'john.smith@company.com',
        provider: 'Azure Active Directory',
        lastLogin: '2024-01-15T10:30:00Z',
        status: 'active',
        groups: ['admin', 'users'],
        attributes: {
          'department': 'Engineering',
          'title': 'Senior Developer',
          'office': 'New York'
        }
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah.j@company.com',
        provider: 'Google Workspace',
        lastLogin: '2024-01-15T09:15:00Z',
        status: 'active',
        groups: ['users', 'marketing'],
        attributes: {
          'department': 'Marketing',
          'title': 'Marketing Manager',
          'office': 'San Francisco'
        }
      },
      {
        id: '3',
        name: 'Mike Wilson',
        email: 'mike.w@company.com',
        provider: 'Active Directory',
        lastLogin: '2024-01-14T16:20:00Z',
        status: 'suspended',
        groups: ['users'],
        attributes: {
          'department': 'Sales',
          'title': 'Sales Representative',
          'office': 'Chicago'
        }
      }
    ]);

    setSsoConfigurations([
      {
        id: '1',
        name: 'Azure AD SAML',
        provider: 'Azure Active Directory',
        type: 'SAML 2.0',
        endpoint: 'https://login.microsoftonline.com/tenant-id/saml2',
        clientId: 'azure-client-id',
        status: 'active',
        lastTested: '2024-01-15T10:30:00Z',
        testResults: {
          connection: true,
          authentication: true,
          userProvisioning: true,
          groupSync: true
        }
      },
      {
        id: '2',
        name: 'Google OIDC',
        provider: 'Google Workspace',
        type: 'OpenID Connect',
        endpoint: 'https://accounts.google.com/.well-known/openid_configuration',
        clientId: 'google-client-id',
        status: 'active',
        lastTested: '2024-01-15T09:15:00Z',
        testResults: {
          connection: true,
          authentication: true,
          userProvisioning: true,
          groupSync: false
        }
      },
      {
        id: '3',
        name: 'Okta SAML',
        provider: 'Okta',
        type: 'SAML 2.0',
        endpoint: 'https://company.okta.com/app/tenant-id/sso/saml',
        clientId: 'okta-client-id',
        status: 'testing',
        lastTested: '2024-01-15T08:00:00Z',
        testResults: {
          connection: true,
          authentication: false,
          userProvisioning: false,
          groupSync: false
        }
      }
    ]);
  }, []);

  const getProviderIcon = (type: string) => {
    switch (type) {
      case 'saml': return <ShieldIcon />;
      case 'oauth2': return <VpnKeyIcon />;
      case 'oidc': return <CloudIcon />;
      case 'ldap': return <BusinessIcon />;
      case 'ad': return <BusinessIcon />;
      default: return <SecurityIcon />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'error': return 'error';
      case 'testing': return 'warning';
      case 'suspended': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getTestResultIcon = (result: boolean) => {
    return result ? <CheckIcon color="success" /> : <ErrorIcon color="error" />;
  };

  const filteredUsers = ssoUsers.filter((user: any) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    const matchesProvider = filterProvider === 'all' || user.provider === filterProvider;
    return matchesSearch && matchesStatus && matchesProvider;
  });

  const ssoMetrics = {
    totalProviders: ssoProviders.length,
    activeProviders: ssoProviders.filter((p: any) => p.status === 'active').length,
    totalUsers: ssoUsers.length,
    activeUsers: ssoUsers.filter((u: any) => u.status === 'active').length,
    averageSuccessRate: ssoProviders.reduce((sum, p) => sum + p.successRate, 0) / ssoProviders.length,
    lastSyncTime: ssoProviders.reduce((latest, p) => 
      new Date(p.lastSync) > new Date(latest) ? p.lastSync : latest, '2024-01-01T00:00:00Z')
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
            SSO Integration Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Configure and manage Single Sign-On integrations with identity providers
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
            Add SSO Provider
          </Button>
        </Box>
      </Box>

      {/* SSO Metrics Cards */}
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
                <CloudIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Providers</Typography>
                <Typography variant="h4">{ssoMetrics.totalProviders}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {ssoMetrics.activeProviders} active
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">SSO Users</Typography>
                <Typography variant="h4">{ssoMetrics.totalUsers}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {ssoMetrics.activeUsers} active
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
                <Typography variant="h6">Success Rate</Typography>
                <Typography variant="h4">{ssoMetrics.averageSuccessRate.toFixed(1)}%</Typography>
                <Typography variant="body2" color="text.secondary">
                  Average across providers
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                <TimelineIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Last Sync</Typography>
                <Typography variant="h4">
                  {new Date(ssoMetrics.lastSyncTime).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Most recent sync
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Providers" />
          <Tab label="Users" />
          <Tab label="Configurations" />
          <Tab label="Analytics" />
          <Tab label="Settings" />
        </Tabs>

        {/* Providers Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">SSO Providers</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search providers..."
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
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Provider</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Users</TableCell>
                  <TableCell>Success Rate</TableCell>
                  <TableCell>Last Sync</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ssoProviders.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {getProviderIcon(provider.type)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{provider.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {provider.type.toUpperCase()}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={provider.type.toUpperCase()}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {provider.users.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          {provider.successRate}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={provider.successRate}
                          color={provider.successRate >= 95 ? 'success' : provider.successRate >= 80 ? 'warning' : 'error'}
                          sx={{ width: 60, height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {provider.lastSync === 'Never' ? 'Never' : new Date(provider.lastSync).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={provider.status}
                        color={getStatusColor(provider.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => setSelectedProvider(provider)}>
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small">
                          <TestIcon />
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

        {/* Users Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">SSO Users</Typography>
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
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="error">Error</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Provider</InputLabel>
                <Select
                  value={filterProvider}
                  onChange={(e) => setFilterProvider(e.target.value)}
                >
                  <MenuItem value="all">All Providers</MenuItem>
                  {ssoProviders.map((provider) => (
                    <MenuItem key={provider.id} value={provider.name}>
                      {provider.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Provider</TableCell>
                  <TableCell>Groups</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell>Status</TableCell>
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
                      <Typography variant="body2">{user.provider}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {user.groups.map((group) => (
                          <Chip
                            key={group}
                            label={group}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(user.lastLogin).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status}
                        color={getStatusColor(user.status) as any}
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

        {/* Configurations Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">SSO Configurations</Typography>
            <Button variant="contained" startIcon={<AddIcon />}>
              New Configuration
            </Button>
          </Box>

          <Box sx={{ display: 'grid', gap: 3 }}>
            {ssoConfigurations.map((config) => (
              <Card key={config.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">{config.name}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {config.provider} - {config.type}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Endpoint: {config.endpoint}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={config.status}
                        color={getStatusColor(config.status) as any}
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
                      <Typography variant="subtitle2" gutterBottom>Test Results</Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getTestResultIcon(config.testResults.connection)}
                          <Typography variant="body2">Connection</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getTestResultIcon(config.testResults.authentication)}
                          <Typography variant="body2">Authentication</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getTestResultIcon(config.testResults.userProvisioning)}
                          <Typography variant="body2">User Provisioning</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getTestResultIcon(config.testResults.groupSync)}
                          <Typography variant="body2">Group Sync</Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>Last Tested</Typography>
                      <Typography variant="body2">
                        {new Date(config.lastTested).toLocaleString()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>Client ID</Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {config.clientId}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button size="small" startIcon={<TestIcon />}>
                      Test Connection
                    </Button>
                    <Button size="small" startIcon={<RefreshIcon />}>
                      Sync Now
                    </Button>
                    <Button size="small" startIcon={<DownloadIcon />}>
                      Export Config
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>SSO Analytics & Monitoring</Typography>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 3,
            mb: 3 
          }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Login Trends</Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">Chart placeholder</Typography>
                </Box>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Provider Usage</Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">Chart placeholder</Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Recent SSO Events</Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Successful SSO login"
                    secondary="User: john.smith@company.com - Provider: Azure AD - Time: 2024-01-15 10:30:00"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ErrorIcon color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary="SSO authentication failed"
                    secondary="User: mike.w@company.com - Provider: Active Directory - Time: 2024-01-15 09:15:00"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <WarningIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="User provisioning error"
                    secondary="User: sarah.j@company.com - Provider: Google Workspace - Time: 2024-01-14 16:20:00"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Settings Tab */}
        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom>SSO Configuration Settings</Typography>
          
          <Box sx={{ display: 'grid', gap: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Global SSO Settings</Typography>
                <Box sx={{ display: 'grid', gap: 2 }}>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Enable SSO for all users"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Auto-provision users from SSO"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Update user profiles from SSO"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Sync groups from SSO"
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
                    defaultValue={480}
                    size="small"
                  />
                  <TextField
                    label="Token refresh interval (minutes)"
                    type="number"
                    defaultValue={60}
                    size="small"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Require re-authentication for sensitive operations"
                  />
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>User Provisioning</Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Configure how users are created and updated from SSO providers
                </Alert>
                <Box sx={{ display: 'grid', gap: 2 }}>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Create users automatically"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Update existing user attributes"
                  />
                  <FormControlLabel
                    control={<Switch />}
                    label="Deactivate users when removed from SSO"
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>
      </Card>

      {/* Provider Details Dialog */}
      <Dialog open={!!selectedProvider} onClose={() => setSelectedProvider(null)} maxWidth="md" fullWidth>
        <DialogTitle>Provider Details</DialogTitle>
        <DialogContent>
          {selectedProvider && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedProvider.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Type: {selectedProvider.type.toUpperCase()}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Configuration</Typography>
                  <Box sx={{ display: 'grid', gap: 1 }}>
                    <FormControlLabel
                      control={<Switch checked={selectedProvider.configuration.enabled} disabled />}
                      label="Enabled"
                    />
                    <FormControlLabel
                      control={<Switch checked={selectedProvider.configuration.autoProvision} disabled />}
                      label="Auto-provision users"
                    />
                    <FormControlLabel
                      control={<Switch checked={selectedProvider.configuration.updateProfile} disabled />}
                      label="Update user profiles"
                    />
                    <FormControlLabel
                      control={<Switch checked={selectedProvider.configuration.syncGroups} disabled />}
                      label="Sync groups"
                    />
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Statistics</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Box>
                      <Typography variant="body2">Total Users: {selectedProvider.users}</Typography>
                      <Typography variant="body2">Success Rate: {selectedProvider.successRate}%</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2">Last Sync: {new Date(selectedProvider.lastSync).toLocaleString()}</Typography>
                      <Typography variant="body2">Status: {selectedProvider.status}</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedProvider(null)}>Close</Button>
          <Button variant="contained">Configure</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SSOIntegrationPage;
