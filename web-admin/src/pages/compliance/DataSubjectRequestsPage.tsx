/**
 * Data Subject Requests (DSRs) Management Page
 * 
 * Features:
 * - Data Subject Request management
 * - GDPR/CCPA compliance
 * - Request processing workflows
 * - Data export and deletion
 * - Request tracking and status
 * - Compliance reporting
 */

import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import { Add as AddIcon,
  AdminPanelSettings as AdminIcon,
  Analytics as AnalyticsIcon,
  Article as ArticleIcon,
  Assessment as AssessmentIcon,
  Assignment as AuditIcon,
  Assignment as DSRIcon,
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
  FileDownload as FileDownloadIcon,
  FileUpload as FileUploadIcon,
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
  Security as SecurityIcon2,
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
  Visibility as VisibilityIcon,
  VpnKey as VpnKeyIcon,
  Warning as WarningIcon } from '@mui/icons-material';
;
interface DataSubjectRequest {
  id: string;
  requestId: string;
  userId: string;
  userEmail: string;
  requestType: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction' | 'objection';
  status: 'submitted' | 'verified' | 'processing' | 'completed' | 'rejected' | 'expired';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  submittedAt: string;
  dueDate: string;
  completedAt?: string;
  assignedTo?: string;
  verifiedBy?: string;
  verificationMethod: 'email' | 'phone' | 'id_document' | 'other';
  dataCategories: string[];
  legalBasis: string;
  responseData?: {
    fileUrl?: string;
    dataSize?: number;
    recordCount?: number;
  };
  notes: string[];
  auditTrail: DSREvent[];
  jurisdiction: 'GDPR' | 'CCPA' | 'PIPEDA' | 'LGPD' | 'other';
}

interface DSREvent {
  id: string;
  action: 'submitted' | 'verified' | 'assigned' | 'processing' | 'completed' | 'rejected' | 'expired';
  timestamp: string;
  actor: string;
  details: string;
  metadata?: any;
}

const DataSubjectRequestsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [requests, setRequests] = useState<DataSubjectRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<DataSubjectRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Mock data
  useEffect(() => {
    setRequests([
      {
        id: '1',
        requestId: 'DSR-2024-001',
        userId: 'user-123',
        userEmail: 'john.doe@example.com',
        requestType: 'access',
        status: 'completed',
        priority: 'medium',
        description: 'Request for access to all personal data',
        submittedAt: '2024-01-10T09:00:00Z',
        dueDate: '2024-01-24T09:00:00Z',
        completedAt: '2024-01-15T14:30:00Z',
        assignedTo: 'privacy@company.com',
        verifiedBy: 'admin@company.com',
        verificationMethod: 'email',
        dataCategories: ['profile', 'usage', 'preferences', 'communications'],
        legalBasis: 'GDPR Article 15 - Right of access',
        responseData: {
          fileUrl: 'https://storage.company.com/dsr/user-123-data.zip',
          dataSize: 2048576, // 2MB
          recordCount: 1250
        },
        notes: [
          'User verified via email confirmation',
          'Data exported successfully',
          'All requested data categories included'
        ],
        auditTrail: [
          {
            id: '1',
            action: 'submitted',
            timestamp: '2024-01-10T09:00:00Z',
            actor: 'system',
            details: 'Data subject request submitted via web form'
          },
          {
            id: '2',
            action: 'verified',
            timestamp: '2024-01-10T10:15:00Z',
            actor: 'admin@company.com',
            details: 'User identity verified via email confirmation'
          },
          {
            id: '3',
            action: 'assigned',
            timestamp: '2024-01-10T10:30:00Z',
            actor: 'admin@company.com',
            details: 'Request assigned to privacy team'
          },
          {
            id: '4',
            action: 'processing',
            timestamp: '2024-01-12T08:00:00Z',
            actor: 'privacy@company.com',
            details: 'Data collection and processing started'
          },
          {
            id: '5',
            action: 'completed',
            timestamp: '2024-01-15T14:30:00Z',
            actor: 'privacy@company.com',
            details: 'Data export completed and delivered to user'
          }
        ],
        jurisdiction: 'GDPR'
      },
      {
        id: '2',
        requestId: 'DSR-2024-002',
        userId: 'user-456',
        userEmail: 'jane.smith@example.com',
        requestType: 'erasure',
        status: 'processing',
        priority: 'high',
        description: 'Request for deletion of all personal data',
        submittedAt: '2024-01-12T14:20:00Z',
        dueDate: '2024-01-26T14:20:00Z',
        assignedTo: 'privacy@company.com',
        verifiedBy: 'admin@company.com',
        verificationMethod: 'id_document',
        dataCategories: ['profile', 'usage', 'preferences', 'communications', 'billing'],
        legalBasis: 'GDPR Article 17 - Right to erasure',
        notes: [
          'User provided government ID for verification',
          'Legal review required for billing data',
          'Processing in progress'
        ],
        auditTrail: [
          {
            id: '6',
            action: 'submitted',
            timestamp: '2024-01-12T14:20:00Z',
            actor: 'system',
            details: 'Data subject request submitted via mobile app'
          },
          {
            id: '7',
            action: 'verified',
            timestamp: '2024-01-12T15:45:00Z',
            actor: 'admin@company.com',
            details: 'User identity verified via government ID document'
          },
          {
            id: '8',
            action: 'assigned',
            timestamp: '2024-01-12T16:00:00Z',
            actor: 'admin@company.com',
            details: 'Request assigned to privacy team for processing'
          },
          {
            id: '9',
            action: 'processing',
            timestamp: '2024-01-13T09:00:00Z',
            actor: 'privacy@company.com',
            details: 'Data deletion process initiated'
          }
        ],
        jurisdiction: 'GDPR'
      },
      {
        id: '3',
        requestId: 'DSR-2024-003',
        userId: 'user-789',
        userEmail: 'mike.wilson@example.com',
        requestType: 'portability',
        status: 'submitted',
        priority: 'low',
        description: 'Request for data portability in machine-readable format',
        submittedAt: '2024-01-14T11:30:00Z',
        dueDate: '2024-01-28T11:30:00Z',
        verificationMethod: 'email',
        dataCategories: ['profile', 'usage', 'preferences'],
        legalBasis: 'GDPR Article 20 - Right to data portability',
        notes: [
          'Awaiting identity verification'
        ],
        auditTrail: [
          {
            id: '10',
            action: 'submitted',
            timestamp: '2024-01-14T11:30:00Z',
            actor: 'system',
            details: 'Data subject request submitted via web form'
          }
        ],
        jurisdiction: 'GDPR'
      }
    ]);
  }, []);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'submitted': return 'info';
      case 'verified': return 'primary';
      case 'processing': return 'warning';
      case 'completed': return 'success';
      case 'rejected': return 'error';
      case 'expired': return 'default';
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'urgent': return 'error';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'access': return <VisibilityIcon />;
      case 'rectification': return <EditIcon />;
      case 'erasure': return <DeleteIcon />;
      case 'portability': return <FileDownloadIcon />;
      case 'restriction': return <LockIcon />;
      case 'objection': return <CancelIcon />;
      default: return <DSRIcon />;
    }
  };

  const getJurisdictionColor = (jurisdiction: string) => {
    switch (jurisdiction) {
      case 'GDPR': return 'primary';
      case 'CCPA': return 'secondary';
      case 'PIPEDA': return 'success';
      case 'LGPD': return 'warning';
      default: return 'default';
    }
  };

  const filteredRequests = requests.filter((request: any) => {
    const matchesSearch = request.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesType = filterType === 'all' || request.requestType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const dsrMetrics = {
    totalRequests: requests.length,
    pendingRequests: requests.filter((r: any) => ['submitted', 'verified', 'processing'].includes(r.status)).length,
    completedRequests: requests.filter((r: any) => r.status === 'completed').length,
    overdueRequests: requests.filter((r: any) => {
      const dueDate = new Date(r.dueDate);
      const now = new Date();
      return dueDate < now && r.status !== 'completed';
    }).length,
    averageProcessingTime: requests.filter((r: any) => r.completedAt).reduce((sum, r) => {
      const submitted = new Date(r.submittedAt).getTime();
      const completed = new Date(r.completedAt!).getTime();
      return sum + (completed - submitted) / (1000 * 60 * 60 * 24); // days
    }, 0) / requests.filter((r: any) => r.completedAt).length,
    complianceRate: (requests.filter((r: any) => r.status === 'completed').length / requests.length) * 100
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
            Data Subject Requests
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage GDPR, CCPA, and other privacy regulation compliance requests
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
            Create Request
          </Button>
        </Box>
      </Box>

      {/* DSR Metrics Cards */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 3,
        mb: 3 
      }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                <DSRIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Total Requests</Typography>
                <Typography variant="h4">{dsrMetrics.totalRequests}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {dsrMetrics.pendingRequests} pending
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
                <Typography variant="h4">{dsrMetrics.completedRequests}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {dsrMetrics.complianceRate.toFixed(1)}% compliance
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
                <Typography variant="h6">Overdue</Typography>
                <Typography variant="h4">{dsrMetrics.overdueRequests}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Past due date
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
                <Typography variant="h6">Avg Processing</Typography>
                <Typography variant="h4">{dsrMetrics.averageProcessingTime.toFixed(0)}d</Typography>
                <Typography variant="body2" color="text.secondary">
                  Days to complete
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Requests" />
          <Tab label="Processing" />
          <Tab label="Analytics" />
          <Tab label="Compliance" />
        </Tabs>

        {/* Requests Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Data Subject Requests</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search requests..."
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
                  <MenuItem value="submitted">Submitted</MenuItem>
                  <MenuItem value="verified">Verified</MenuItem>
                  <MenuItem value="processing">Processing</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="expired">Expired</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="access">Access</MenuItem>
                  <MenuItem value="rectification">Rectification</MenuItem>
                  <MenuItem value="erasure">Erasure</MenuItem>
                  <MenuItem value="portability">Portability</MenuItem>
                  <MenuItem value="restriction">Restriction</MenuItem>
                  <MenuItem value="objection">Objection</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Request</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Jurisdiction</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {getTypeIcon(request.requestType)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{request.requestId}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {request.description.substring(0, 50)}...
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{request.userEmail}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {request.userId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={request.requestType}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={request.status}
                        color={getStatusColor(request.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={request.priority}
                        color={getStatusColor(request.priority) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={request.jurisdiction}
                        color={getJurisdictionColor(request.jurisdiction) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(request.dueDate).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(request.dueDate).toLocaleTimeString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => setSelectedRequest(request)}>
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small">
                          <FileDownloadIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Processing Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>Request Processing Workflow</Typography>
          
          <Box sx={{ display: 'grid', gap: 2 }}>
            {requests.map((request) => (
              <Card key={request.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">{request.requestId}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {request.userEmail} • {request.requestType} • {request.jurisdiction}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip
                        label={request.status}
                        color={getStatusColor(request.status) as any}
                        size="small"
                      />
                      <Chip
                        label={request.priority}
                        color={getStatusColor(request.priority) as any}
                        size="small"
                      />
                    </Box>
                  </Box>
                  
                  <Stepper orientation="vertical">
                    {request.auditTrail.map((event, index) => (
                      <Step key={event.id} active>
                        <StepLabel>
                          <Typography variant="subtitle2">{event.details}</Typography>
                        </StepLabel>
                        <StepContent>
                          <Typography variant="body2" color="text.secondary">
                            {event.actor} • {new Date(event.timestamp).toLocaleString()}
                          </Typography>
                        </StepContent>
                      </Step>
                    ))}
                  </Stepper>
                  
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button size="small" startIcon={<ViewIcon />}>
                      View Details
                    </Button>
                    <Button size="small" startIcon={<EditIcon />}>
                      Update Status
                    </Button>
                    <Button size="small" startIcon={<FileDownloadIcon />}>
                      Export Data
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>DSR Analytics</Typography>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 3,
            mb: 3 
          }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Requests by Type</Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">Chart placeholder</Typography>
                </Box>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Processing Time Trends</Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">Chart placeholder</Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Recent DSR Activity</Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="DSR completed"
                    secondary="DSR-2024-001 - Access request - john.doe@example.com - Time: 2024-01-15 14:30:00"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <WarningIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="DSR processing"
                    secondary="DSR-2024-002 - Erasure request - jane.smith@example.com - Status: Processing - Time: 2024-01-13 09:00:00"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <DSRIcon color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary="New DSR submitted"
                    secondary="DSR-2024-003 - Portability request - mike.wilson@example.com - Time: 2024-01-14 11:30:00"
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
                  <Typography variant="body2">Right of access (Article 15)</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="body2">Right to rectification (Article 16)</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="body2">Right to erasure (Article 17)</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="body2">Right to portability (Article 20)</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="body2">Right to object (Article 21)</Typography>
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>CCPA Compliance</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="body2">Right to know (Section 1798.105)</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="body2">Right to delete (Section 1798.105)</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="body2">Right to opt-out (Section 1798.120)</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="body2">Non-discrimination (Section 1798.125)</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="body2">Data portability</Typography>
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Processing Metrics</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Average Processing Time</Typography>
                  <Typography variant="body2">{dsrMetrics.averageProcessingTime.toFixed(1)} days</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Compliance Rate</Typography>
                  <Typography variant="body2">{dsrMetrics.complianceRate.toFixed(1)}%</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Overdue Requests</Typography>
                  <Typography variant="body2">{dsrMetrics.overdueRequests}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Total Requests</Typography>
                  <Typography variant="body2">{dsrMetrics.totalRequests}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>
      </Card>

      {/* Request Details Dialog */}
      <Dialog open={!!selectedRequest} onClose={() => setSelectedRequest(null)} maxWidth="lg" fullWidth>
        <DialogTitle>DSR Details</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedRequest.requestId}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedRequest.userEmail} • {selectedRequest.requestType} • {selectedRequest.jurisdiction}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Request Information</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Box>
                      <Typography variant="body2">Type: {selectedRequest.requestType}</Typography>
                      <Typography variant="body2">Status: {selectedRequest.status}</Typography>
                      <Typography variant="body2">Priority: {selectedRequest.priority}</Typography>
                      <Typography variant="body2">Jurisdiction: {selectedRequest.jurisdiction}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2">Submitted: {new Date(selectedRequest.submittedAt).toLocaleString()}</Typography>
                      <Typography variant="body2">Due: {new Date(selectedRequest.dueDate).toLocaleString()}</Typography>
                      {selectedRequest.completedAt && (
                        <Typography variant="body2">Completed: {new Date(selectedRequest.completedAt).toLocaleString()}</Typography>
                      )}
                      <Typography variant="body2">Assigned: {selectedRequest.assignedTo || 'Unassigned'}</Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Description</Typography>
                  <Typography variant="body2">{selectedRequest.description}</Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Data Categories</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {selectedRequest.dataCategories.map((category) => (
                      <Chip
                        key={category}
                        label={category}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Legal Basis</Typography>
                  <Typography variant="body2">{selectedRequest.legalBasis}</Typography>
                </Box>
                
                {selectedRequest.responseData && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Response Data</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                      <Box>
                        <Typography variant="body2">File Size: {(selectedRequest.responseData.dataSize! / 1024 / 1024).toFixed(2)} MB</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2">Records: {selectedRequest.responseData.recordCount}</Typography>
                      </Box>
                      <Box>
                        <Button size="small" startIcon={<FileDownloadIcon />}>
                          Download
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                )}
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Notes</Typography>
                  <List dense>
                    {selectedRequest.notes.map((note, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={note} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedRequest(null)}>Close</Button>
          <Button variant="contained">Update Request</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DataSubjectRequestsPage;
