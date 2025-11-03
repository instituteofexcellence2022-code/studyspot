/**
 * Consent Management Page
 * 
 * Features:
 * - Consent collection and management
 * - Privacy policy management
 * - Consent withdrawal and updates
 * - Consent analytics and reporting
 * - GDPR/CCPA compliance
 * - Consent audit trails
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
  Divider
} from '@mui/material';
import { Add as AddIcon,
  AdminPanelSettings as AdminIcon,
  Analytics as AnalyticsIcon,
  Article as ArticleIcon,
  Assessment as AssessmentIcon,
  Assignment as AuditIcon,
  Backup as BackupIcon,
  BarChart as BarChartIcon,
  BugReport as BugReportIcon,
  Business as BusinessIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckIcon,
  ChevronRight as ChevronRightIcon,
  Cloud as CloudIcon,
  Code as CodeIcon,
  DataUsage as DataIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  Description as DocumentIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  Fingerprint as FingerprintIcon,
  Flag as FlagIcon,
  Gavel as GavelIcon,
  Group as GroupIcon,
  History as HistoryIcon,
  Key as KeyIcon,
  Lock as LockIcon,
  Memory as MemoryIcon,
  NetworkCheck as NetworkIcon,
  Notifications as NotificationsIcon,
  Pause as PauseIcon,
  Person as PersonIcon,
  PieChart as PieChartIcon,
  PlayArrow as PlayIcon,
  Policy as PolicyIcon,
  PrivacyTip as PrivacyIcon,
  QrCode as QrCodeIcon,
  Refresh as RefreshIcon,
  Report as ReportIcon,
  RestartAlt as RestartIcon,
  Router as RouterIcon,
  Schedule as ScheduleIcon,
  Science as ScienceIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Shield as ShieldIcon,
  ShowChart as ShowChartIcon,
  Smartphone as SmartphoneIcon,
  Sms as SmsIcon,
  Speed as SpeedIcon,
  Stop as StopIcon,
  Storage as StorageIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  Upload as UploadIcon,
  VerifiedUser as VerifiedUserIcon,
  Visibility as ViewIcon,
  VpnKey as VpnKeyIcon,
  Warning as WarningIcon } from '@mui/icons-material';
;
interface Consent {
  id: string;
  userId: string;
  userEmail: string;
  consentType: 'marketing' | 'analytics' | 'functional' | 'necessary' | 'preferences';
  status: 'granted' | 'denied' | 'withdrawn' | 'expired' | 'pending';
  purpose: string;
  description: string;
  legalBasis: 'consent' | 'legitimate_interest' | 'contract' | 'legal_obligation' | 'vital_interest' | 'public_task';
  grantedAt: string;
  expiresAt?: string;
  withdrawnAt?: string;
  version: string;
  source: 'web' | 'mobile' | 'api' | 'import' | 'admin';
  ipAddress: string;
  userAgent: string;
  metadata: {
    campaign?: string;
    referrer?: string;
    location?: string;
    device?: string;
  };
  auditTrail: ConsentEvent[];
}

interface ConsentEvent {
  id: string;
  action: 'granted' | 'denied' | 'withdrawn' | 'updated' | 'expired' | 'renewed';
  timestamp: string;
  source: string;
  ipAddress: string;
  userAgent: string;
  details: string;
}

interface PrivacyPolicy {
  id: string;
  title: string;
  version: string;
  status: 'draft' | 'active' | 'archived';
  effectiveDate: string;
  lastUpdated: string;
  content: string;
  language: string;
  jurisdiction: string;
  consentTypes: string[];
  createdBy: string;
  approvedBy?: string;
  approvalDate?: string;
}

const ConsentManagementPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [consents, setConsents] = useState<Consent[]>([]);
  const [privacyPolicies, setPrivacyPolicies] = useState<PrivacyPolicy[]>([]);
  const [selectedConsent, setSelectedConsent] = useState<Consent | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Mock data
  useEffect(() => {
    setConsents([
      {
        id: '1',
        userId: 'user-123',
        userEmail: 'john.doe@example.com',
        consentType: 'marketing',
        status: 'granted',
        purpose: 'Email marketing and promotional communications',
        description: 'Receive marketing emails about new features and promotions',
        legalBasis: 'consent',
        grantedAt: '2024-01-15T10:30:00Z',
        expiresAt: '2025-01-15T10:30:00Z',
        version: '2.1.0',
        source: 'web',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        metadata: {
          campaign: 'winter-2024',
          referrer: 'google.com',
          location: 'US',
          device: 'desktop'
        },
        auditTrail: [
          {
            id: '1',
            action: 'granted',
            timestamp: '2024-01-15T10:30:00Z',
            source: 'web',
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            details: 'User granted marketing consent via website signup form'
          }
        ]
      },
      {
        id: '2',
        userId: 'user-456',
        userEmail: 'jane.smith@example.com',
        consentType: 'analytics',
        status: 'granted',
        purpose: 'Website analytics and performance monitoring',
        description: 'Collect anonymous usage data to improve our services',
        legalBasis: 'consent',
        grantedAt: '2024-01-14T14:20:00Z',
        expiresAt: '2025-01-14T14:20:00Z',
        version: '2.1.0',
        source: 'mobile',
        ipAddress: '10.0.0.50',
        userAgent: 'StudySpot/1.0.0 (iOS 17.2)',
        metadata: {
          campaign: 'app-launch',
          referrer: 'app-store',
          location: 'CA',
          device: 'mobile'
        },
        auditTrail: [
          {
            id: '2',
            action: 'granted',
            timestamp: '2024-01-14T14:20:00Z',
            source: 'mobile',
            ipAddress: '10.0.0.50',
            userAgent: 'StudySpot/1.0.0 (iOS 17.2)',
            details: 'User granted analytics consent via mobile app onboarding'
          }
        ]
      },
      {
        id: '3',
        userId: 'user-789',
        userEmail: 'mike.wilson@example.com',
        consentType: 'marketing',
        status: 'withdrawn',
        purpose: 'Email marketing and promotional communications',
        description: 'Receive marketing emails about new features and promotions',
        legalBasis: 'consent',
        grantedAt: '2024-01-10T09:15:00Z',
        withdrawnAt: '2024-01-12T16:45:00Z',
        version: '2.0.0',
        source: 'web',
        ipAddress: '203.0.113.42',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        metadata: {
          campaign: 'january-2024',
          referrer: 'facebook.com',
          location: 'UK',
          device: 'desktop'
        },
        auditTrail: [
          {
            id: '3',
            action: 'granted',
            timestamp: '2024-01-10T09:15:00Z',
            source: 'web',
            ipAddress: '203.0.113.42',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            details: 'User granted marketing consent via website signup form'
          },
          {
            id: '4',
            action: 'withdrawn',
            timestamp: '2024-01-12T16:45:00Z',
            source: 'web',
            ipAddress: '203.0.113.42',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            details: 'User withdrew marketing consent via email unsubscribe link'
          }
        ]
      }
    ]);

    setPrivacyPolicies([
      {
        id: '1',
        title: 'StudySpot Privacy Policy',
        version: '2.1.0',
        status: 'active',
        effectiveDate: '2024-01-01T00:00:00Z',
        lastUpdated: '2024-01-01T00:00:00Z',
        content: 'This privacy policy describes how StudySpot collects, uses, and protects your personal information...',
        language: 'en',
        jurisdiction: 'US',
        consentTypes: ['marketing', 'analytics', 'functional', 'necessary'],
        createdBy: 'legal@company.com',
        approvedBy: 'cpo@company.com',
        approvalDate: '2023-12-15T00:00:00Z'
      },
      {
        id: '2',
        title: 'StudySpot Privacy Policy (GDPR)',
        version: '2.1.0',
        status: 'active',
        effectiveDate: '2024-01-01T00:00:00Z',
        lastUpdated: '2024-01-01T00:00:00Z',
        content: 'This privacy policy describes how StudySpot collects, uses, and protects your personal information in compliance with GDPR...',
        language: 'en',
        jurisdiction: 'EU',
        consentTypes: ['marketing', 'analytics', 'functional', 'necessary'],
        createdBy: 'legal@company.com',
        approvedBy: 'dpo@company.com',
        approvalDate: '2023-12-15T00:00:00Z'
      }
    ]);
  }, []);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'granted': return 'success';
      case 'denied': return 'error';
      case 'withdrawn': return 'warning';
      case 'expired': return 'default';
      case 'pending': return 'info';
      case 'active': return 'success';
      case 'draft': return 'warning';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'marketing': return <EmailIcon />;
      case 'analytics': return <AnalyticsIcon />;
      case 'functional': return <SettingsIcon />;
      case 'necessary': return <LockIcon />;
      case 'preferences': return <PersonIcon />;
      default: return <PrivacyIcon />;
    }
  };

  const getLegalBasisColor = (basis: string) => {
    switch (basis) {
      case 'consent': return 'primary';
      case 'legitimate_interest': return 'secondary';
      case 'contract': return 'success';
      case 'legal_obligation': return 'warning';
      case 'vital_interest': return 'error';
      case 'public_task': return 'info';
      default: return 'default';
    }
  };

  const filteredConsents = consents.filter((consent: any) => {
    const matchesSearch = consent.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consent.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consent.consentType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || consent.status === filterStatus;
    const matchesType = filterType === 'all' || consent.consentType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const consentMetrics = {
    totalConsents: consents.length,
    grantedConsents: consents.filter((c: any) => c.status === 'granted').length,
    withdrawnConsents: consents.filter((c: any) => c.status === 'withdrawn').length,
    expiredConsents: consents.filter((c: any) => c.status === 'expired').length,
    activePolicies: privacyPolicies.filter((p: any) => p.status === 'active').length,
    consentRate: (consents.filter((c: any) => c.status === 'granted').length / consents.length) * 100,
    averageConsentAge: consents.reduce((sum, c) => {
      const granted = new Date(c.grantedAt).getTime();
      const now = new Date().getTime();
      return sum + (now - granted) / (1000 * 60 * 60 * 24); // days
    }, 0) / consents.length
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
            Consent Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage user consents, privacy policies, and compliance requirements
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
            Create Consent
          </Button>
        </Box>
      </Box>

      {/* Consent Metrics Cards */}
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
                <CheckIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Granted Consents</Typography>
                <Typography variant="h4">{consentMetrics.grantedConsents}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {consentMetrics.consentRate.toFixed(1)}% of total
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                <CancelIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Withdrawn</Typography>
                <Typography variant="h4">{consentMetrics.withdrawnConsents}</Typography>
                <Typography variant="body2" color="text.secondary">
                  User withdrawals
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                <PolicyIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Active Policies</Typography>
                <Typography variant="h4">{consentMetrics.activePolicies}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Privacy policies
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <TimelineIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Avg Age</Typography>
                <Typography variant="h4">{consentMetrics.averageConsentAge.toFixed(0)}d</Typography>
                <Typography variant="body2" color="text.secondary">
                  Days since granted
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Consents" />
          <Tab label="Privacy Policies" />
          <Tab label="Analytics" />
          <Tab label="Compliance" />
        </Tabs>

        {/* Consents Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">User Consents</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search consents..."
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
                  <MenuItem value="granted">Granted</MenuItem>
                  <MenuItem value="denied">Denied</MenuItem>
                  <MenuItem value="withdrawn">Withdrawn</MenuItem>
                  <MenuItem value="expired">Expired</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="marketing">Marketing</MenuItem>
                  <MenuItem value="analytics">Analytics</MenuItem>
                  <MenuItem value="functional">Functional</MenuItem>
                  <MenuItem value="necessary">Necessary</MenuItem>
                  <MenuItem value="preferences">Preferences</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Consent Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Purpose</TableCell>
                  <TableCell>Legal Basis</TableCell>
                  <TableCell>Granted</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredConsents.map((consent) => (
                  <TableRow key={consent.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{consent.userEmail}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {consent.userId}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>
                          {getTypeIcon(consent.consentType)}
                        </Avatar>
                        <Typography variant="body2">
                          {consent.consentType}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={consent.status}
                        color={getStatusColor(consent.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {consent.purpose}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={consent.legalBasis.replace('_', ' ')}
                        color={getLegalBasisColor(consent.legalBasis) as any}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(consent.grantedAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(consent.grantedAt).toLocaleTimeString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={consent.source}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => setSelectedConsent(consent)}>
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small">
                          <EditIcon />
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

        {/* Privacy Policies Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>Privacy Policies</Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 3 }}>
            {privacyPolicies.map((policy) => (
              <Card key={policy.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">{policy.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Version {policy.version} • {policy.jurisdiction}
                      </Typography>
                    </Box>
                    <Chip
                      label={policy.status}
                      color={getStatusColor(policy.status) as any}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {policy.content.substring(0, 150)}...
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
                    {policy.consentTypes.map((type) => (
                      <Chip
                        key={type}
                        label={type}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, mb: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Effective Date
                      </Typography>
                      <Typography variant="body2">
                        {new Date(policy.effectiveDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Last Updated
                      </Typography>
                      <Typography variant="body2">
                        {new Date(policy.lastUpdated).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" startIcon={<ViewIcon />}>
                      View
                    </Button>
                    <Button size="small" startIcon={<EditIcon />}>
                      Edit
                    </Button>
                    <Button size="small" startIcon={<DownloadIcon />}>
                      Export
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>Consent Analytics</Typography>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 3,
            mb: 3 
          }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Consent Trends</Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">Chart placeholder</Typography>
                </Box>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Consent by Type</Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">Chart placeholder</Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Recent Consent Activity</Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Consent granted"
                    secondary="john.doe@example.com - Marketing consent - Web - Time: 2024-01-15 10:30:00"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CancelIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Consent withdrawn"
                    secondary="mike.wilson@example.com - Marketing consent - Web - Time: 2024-01-12 16:45:00"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Consent granted"
                    secondary="jane.smith@example.com - Analytics consent - Mobile - Time: 2024-01-14 14:20:00"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Compliance Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>Compliance Dashboard</Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>GDPR Compliance</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="body2">Consent management implemented</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="body2">Data subject rights enabled</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="body2">Privacy by design</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <WarningIcon color="warning" sx={{ mr: 1 }} />
                  <Typography variant="body2">Data retention policies pending</Typography>
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>CCPA Compliance</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="body2">Opt-out mechanisms</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="body2">Data disclosure rights</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="body2">Non-discrimination</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="body2">Privacy notices</Typography>
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Audit Trail</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="body2">Consent events logged</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="body2">Policy changes tracked</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="body2">User actions recorded</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="body2">Compliance reports generated</Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>
      </Card>

      {/* Consent Details Dialog */}
      <Dialog open={!!selectedConsent} onClose={() => setSelectedConsent(null)} maxWidth="md" fullWidth>
        <DialogTitle>Consent Details</DialogTitle>
        <DialogContent>
          {selectedConsent && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedConsent.userEmail}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedConsent.consentType} • {selectedConsent.status}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Consent Information</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Box>
                      <Typography variant="body2">Purpose: {selectedConsent.purpose}</Typography>
                      <Typography variant="body2">Legal Basis: {selectedConsent.legalBasis.replace('_', ' ')}</Typography>
                      <Typography variant="body2">Version: {selectedConsent.version}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2">Source: {selectedConsent.source}</Typography>
                      <Typography variant="body2">IP Address: {selectedConsent.ipAddress}</Typography>
                      <Typography variant="body2">Location: {selectedConsent.metadata.location}</Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Timeline</Typography>
                  <Typography variant="body2">Granted: {new Date(selectedConsent.grantedAt).toLocaleString()}</Typography>
                  {selectedConsent.expiresAt && (
                    <Typography variant="body2">Expires: {new Date(selectedConsent.expiresAt).toLocaleString()}</Typography>
                  )}
                  {selectedConsent.withdrawnAt && (
                    <Typography variant="body2">Withdrawn: {new Date(selectedConsent.withdrawnAt).toLocaleString()}</Typography>
                  )}
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Audit Trail</Typography>
                  <List dense>
                    {selectedConsent.auditTrail.map((event) => (
                      <ListItem key={event.id}>
                        <ListItemIcon>
                          {event.action === 'granted' && <CheckIcon color="success" />}
                          {event.action === 'withdrawn' && <CancelIcon color="warning" />}
                          {event.action === 'denied' && <ErrorIcon color="error" />}
                        </ListItemIcon>
                        <ListItemText
                          primary={event.details}
                          secondary={`${new Date(event.timestamp).toLocaleString()} • ${event.source}`}
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
          <Button onClick={() => setSelectedConsent(null)}>Close</Button>
          <Button variant="contained">Update Consent</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConsentManagementPage;






