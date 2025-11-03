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
  Divider,
  List,
  ListItem,
  ListItemIcon,
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
  CardContent,
  Paper
} from '@mui/material';
/**
 * Incident Management Page
 * 
 * Features:
 * - Incident creation and management
 * - Incident response workflows
 * - Escalation and notification
 * - Post-incident reviews
 * - Incident analytics and reporting
 * - On-call management
 */

import React, { useState, useEffect } from 'react';
import { AccessTime as AccessTimeIcon,
  Add as AddIcon,
  AdminPanelSettings as AdminIcon,
  Analytics as AnalyticsIcon,
  Assessment as AssessmentIcon,
  Assignment as AuditIcon,
  Backup as BackupIcon,
  BarChart as BarChartIcon,
  BugReport as BugReportIcon,
  Business as BusinessIcon,
  CheckCircle as CheckIcon,
  ChevronRight as ChevronRightIcon,
  Cloud as CloudIcon,
  Code as CodeIcon,
  CrisisAlert as IncidentIcon,
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
  History as HistoryIcon,
  Key as KeyIcon,
  Lock as LockIcon,
  Memory as MemoryIcon,
  Message as MessageIcon,
  NetworkCheck as NetworkIcon,
  Notifications as NotificationsIcon,
  Pause as PauseIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  PieChart as PieChartIcon,
  PlayArrow as PlayIcon,
  PriorityHigh as PriorityHighIcon,
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
  Storage as DatabaseIcon,
  Storage as StorageIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  Upload as UploadIcon,
  VerifiedUser as VerifiedUserIcon,
  Visibility as ViewIcon,
  VpnKey as VpnKeyIcon,
  Warning as WarningIcon } from '@mui/icons-material';
;
interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'investigating' | 'identified' | 'monitoring' | 'resolved' | 'closed';
  priority: 'p1' | 'p2' | 'p3' | 'p4';
  type: 'outage' | 'performance' | 'security' | 'data' | 'feature' | 'other';
  affectedServices: string[];
  impact: {
    users: number;
    revenue: number;
    duration: number; // in minutes
  };
  timeline: IncidentEvent[];
  assignee?: string;
  reporter: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  tags: string[];
  postMortemId?: string;
}

interface IncidentEvent {
  id: string;
  type: 'created' | 'assigned' | 'status_changed' | 'comment' | 'escalated' | 'resolved' | 'closed';
  description: string;
  author: string;
  timestamp: string;
  metadata?: any;
}

interface OnCallSchedule {
  id: string;
  name: string;
  team: string;
  startTime: string;
  endTime: string;
  status: 'active' | 'inactive' | 'on_break';
  contactInfo: {
    email: string;
    phone: string;
    slack: string;
  };
  escalationPolicy: {
    level1: string;
    level2: string;
    level3: string;
  };
}

const IncidentManagementPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [onCallSchedule, setOnCallSchedule] = useState<OnCallSchedule[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');

  // Mock data
  useEffect(() => {
    setIncidents([
      {
        id: 'INC-001',
        title: 'Database Connection Pool Exhaustion',
        description: 'PostgreSQL connection pool has been exhausted, causing service degradation',
        severity: 'critical',
        status: 'resolved',
        priority: 'p1',
        type: 'outage',
        affectedServices: ['api-gateway', 'user-service', 'booking-service'],
        impact: {
          users: 5000,
          revenue: 15000,
          duration: 45
        },
        timeline: [
          {
            id: '1',
            type: 'created',
            description: 'Incident created by monitoring system',
            author: 'system@company.com',
            timestamp: '2024-01-15T10:00:00Z'
          },
          {
            id: '2',
            type: 'assigned',
            description: 'Assigned to John Doe (Database Team)',
            author: 'admin@company.com',
            timestamp: '2024-01-15T10:05:00Z'
          },
          {
            id: '3',
            type: 'status_changed',
            description: 'Status changed to investigating',
            author: 'john.doe@company.com',
            timestamp: '2024-01-15T10:10:00Z'
          },
          {
            id: '4',
            type: 'comment',
            description: 'Identified root cause: connection pool configuration issue',
            author: 'john.doe@company.com',
            timestamp: '2024-01-15T10:25:00Z'
          },
          {
            id: '5',
            type: 'resolved',
            description: 'Incident resolved by increasing connection pool size',
            author: 'john.doe@company.com',
            timestamp: '2024-01-15T10:45:00Z'
          }
        ],
        assignee: 'john.doe@company.com',
        reporter: 'system@company.com',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:45:00Z',
        resolvedAt: '2024-01-15T10:45:00Z',
        tags: ['database', 'postgresql', 'connection-pool']
      },
      {
        id: 'INC-002',
        title: 'High API Response Times',
        description: 'API response times have increased significantly across all endpoints',
        severity: 'high',
        status: 'investigating',
        priority: 'p2',
        type: 'performance',
        affectedServices: ['api-gateway', 'booking-service'],
        impact: {
          users: 2000,
          revenue: 5000,
          duration: 30
        },
        timeline: [
          {
            id: '6',
            type: 'created',
            description: 'Incident created by monitoring system',
            author: 'system@company.com',
            timestamp: '2024-01-15T11:00:00Z'
          },
          {
            id: '7',
            type: 'assigned',
            description: 'Assigned to Jane Smith (Platform Team)',
            author: 'admin@company.com',
            timestamp: '2024-01-15T11:05:00Z'
          },
          {
            id: '8',
            type: 'status_changed',
            description: 'Status changed to investigating',
            author: 'jane.smith@company.com',
            timestamp: '2024-01-15T11:10:00Z'
          }
        ],
        assignee: 'jane.smith@company.com',
        reporter: 'system@company.com',
        createdAt: '2024-01-15T11:00:00Z',
        updatedAt: '2024-01-15T11:10:00Z',
        tags: ['api', 'performance', 'latency']
      },
      {
        id: 'INC-003',
        title: 'Suspicious Login Attempts',
        description: 'Multiple failed login attempts detected from suspicious IP addresses',
        severity: 'medium',
        status: 'monitoring',
        priority: 'p3',
        type: 'security',
        affectedServices: ['auth-service'],
        impact: {
          users: 0,
          revenue: 0,
          duration: 0
        },
        timeline: [
          {
            id: '9',
            type: 'created',
            description: 'Incident created by security monitoring',
            author: 'security@company.com',
            timestamp: '2024-01-15T09:30:00Z'
          },
          {
            id: '10',
            type: 'assigned',
            description: 'Assigned to Security Team',
            author: 'admin@company.com',
            timestamp: '2024-01-15T09:35:00Z'
          },
          {
            id: '11',
            type: 'status_changed',
            description: 'Status changed to monitoring',
            author: 'security@company.com',
            timestamp: '2024-01-15T09:40:00Z'
          }
        ],
        assignee: 'security@company.com',
        reporter: 'security@company.com',
        createdAt: '2024-01-15T09:30:00Z',
        updatedAt: '2024-01-15T09:40:00Z',
        tags: ['security', 'auth', 'brute-force']
      }
    ]);

    setOnCallSchedule([
      {
        id: '1',
        name: 'John Doe',
        team: 'Database Team',
        startTime: '2024-01-15T00:00:00Z',
        endTime: '2024-01-16T00:00:00Z',
        status: 'active',
        contactInfo: {
          email: 'john.doe@company.com',
          phone: '+1-555-0123',
          slack: '@john.doe'
        },
        escalationPolicy: {
          level1: 'jane.smith@company.com',
          level2: 'mike.wilson@company.com',
          level3: 'admin@company.com'
        }
      },
      {
        id: '2',
        name: 'Jane Smith',
        team: 'Platform Team',
        startTime: '2024-01-15T00:00:00Z',
        endTime: '2024-01-16T00:00:00Z',
        status: 'active',
        contactInfo: {
          email: 'jane.smith@company.com',
          phone: '+1-555-0124',
          slack: '@jane.smith'
        },
        escalationPolicy: {
          level1: 'john.doe@company.com',
          level2: 'mike.wilson@company.com',
          level3: 'admin@company.com'
        }
      }
    ]);
  }, []);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'open': return 'error';
      case 'investigating': return 'warning';
      case 'identified': return 'info';
      case 'monitoring': return 'primary';
      case 'resolved': return 'success';
      case 'closed': return 'default';
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      case 'p1': return 'error';
      case 'p2': return 'warning';
      case 'p3': return 'info';
      case 'p4': return 'success';
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'on_break': return 'warning';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <ErrorIcon />;
      case 'high': return <WarningIcon />;
      case 'medium': return <PriorityHighIcon />;
      case 'low': return <CheckIcon />;
      default: return <IncidentIcon />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'outage': return <ErrorIcon />;
      case 'performance': return <SpeedIcon />;
      case 'security': return <SecurityIcon />;
      case 'data': return <DatabaseIcon />;
      case 'feature': return <FlagIcon />;
      default: return <IncidentIcon />;
    }
  };

  const filteredIncidents = incidents.filter((incident: any) => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || incident.status === filterStatus;
    const matchesSeverity = filterSeverity === 'all' || incident.severity === filterSeverity;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const incidentMetrics = {
    totalIncidents: incidents.length,
    openIncidents: incidents.filter((i: any) => ['open', 'investigating', 'identified', 'monitoring'].includes(i.status)).length,
    resolvedIncidents: incidents.filter((i: any) => i.status === 'resolved').length,
    criticalIncidents: incidents.filter((i: any) => i.severity === 'critical').length,
    averageResolutionTime: incidents.filter((i: any) => i.resolvedAt).reduce((sum, i) => {
      const created = new Date(i.createdAt).getTime();
      const resolved = new Date(i.resolvedAt!).getTime();
      return sum + (resolved - created) / (1000 * 60); // minutes
    }, 0) / incidents.filter((i: any) => i.resolvedAt).length,
    totalUsersAffected: incidents.reduce((sum, i) => sum + i.impact.users, 0),
    totalRevenueImpact: incidents.reduce((sum, i) => sum + i.impact.revenue, 0)
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
            Incident Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage incidents, response workflows, and post-incident reviews
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
            Create Incident
          </Button>
        </Box>
      </Box>

      {/* Incident Metrics Cards */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 3,
        mb: 3 
      }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                <IncidentIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Open Incidents</Typography>
                <Typography variant="h4">{incidentMetrics.openIncidents}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {incidentMetrics.criticalIncidents} critical
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
                <Typography variant="h6">Resolved</Typography>
                <Typography variant="h4">{incidentMetrics.resolvedIncidents}</Typography>
                <Typography variant="body2" color="text.secondary">
                  This month
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                <AccessTimeIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Avg Resolution</Typography>
                <Typography variant="h4">{incidentMetrics.averageResolutionTime.toFixed(0)}m</Typography>
                <Typography variant="body2" color="text.secondary">
                  Time to resolve
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                <PeopleIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Users Affected</Typography>
                <Typography variant="h4">{incidentMetrics.totalUsersAffected.toLocaleString()}</Typography>
                <Typography variant="body2" color="text.secondary">
                  ${incidentMetrics.totalRevenueImpact.toLocaleString()} impact
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Incidents" />
          <Tab label="On-Call" />
          <Tab label="Timeline" />
          <Tab label="Analytics" />
        </Tabs>

        {/* Incidents Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Active Incidents</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search incidents..."
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
                  <MenuItem value="open">Open</MenuItem>
                  <MenuItem value="investigating">Investigating</MenuItem>
                  <MenuItem value="identified">Identified</MenuItem>
                  <MenuItem value="monitoring">Monitoring</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Severity</InputLabel>
                <Select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                >
                  <MenuItem value="all">All Severity</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Incident</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Assignee</TableCell>
                  <TableCell>Affected Services</TableCell>
                  <TableCell>Impact</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredIncidents.map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {getTypeIcon(incident.type)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{incident.title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {incident.id} • {incident.type}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={incident.severity}
                        color={getStatusColor(incident.severity) as any}
                        size="small"
                        icon={getSeverityIcon(incident.severity)}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={incident.status}
                        color={getStatusColor(incident.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {incident.assignee || 'Unassigned'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {incident.affectedServices.slice(0, 2).map((service) => (
                          <Chip
                            key={service}
                            label={service}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                        {incident.affectedServices.length > 2 && (
                          <Chip
                            label={`+${incident.affectedServices.length - 2}`}
                            size="small"
                            color="default"
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {incident.impact.users.toLocaleString()} users
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ${incident.impact.revenue.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {incident.impact.duration}m
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => setSelectedIncident(incident)}>
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small">
                          <MessageIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* On-Call Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>On-Call Schedule</Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
            {onCallSchedule.map((schedule) => (
              <Card key={schedule.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">{schedule.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {schedule.team}
                      </Typography>
                    </Box>
                    <Chip
                      label={schedule.status}
                      color={getStatusColor(schedule.status) as any}
                      size="small"
                    />
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'grid', gap: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>Contact Information</Typography>
                    <Typography variant="body2">Email: {schedule.contactInfo.email}</Typography>
                    <Typography variant="body2">Phone: {schedule.contactInfo.phone}</Typography>
                    <Typography variant="body2">Slack: {schedule.contactInfo.slack}</Typography>
                  </Box>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Escalation Policy</Typography>
                    <List dense>
                      <ListItem sx={{ py: 0 }}>
                        <ListItemText primary="Level 1" secondary={schedule.escalationPolicy.level1} />
                      </ListItem>
                      <ListItem sx={{ py: 0 }}>
                        <ListItemText primary="Level 2" secondary={schedule.escalationPolicy.level2} />
                      </ListItem>
                      <ListItem sx={{ py: 0 }}>
                        <ListItemText primary="Level 3" secondary={schedule.escalationPolicy.level3} />
                      </ListItem>
                    </List>
                  </Box>
                  
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button size="small" startIcon={<MessageIcon />}>
                      Contact
                    </Button>
                    <Button size="small" startIcon={<EditIcon />}>
                      Edit
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </TabPanel>

        {/* Timeline Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>Incident Timeline</Typography>
          
          <Box sx={{ display: 'grid', gap: 2 }}>
            {incidents.map((incident) => (
              <Card key={incident.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">{incident.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {incident.id} • {incident.severity} • {incident.status}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip
                        label={incident.severity}
                        color={getStatusColor(incident.severity) as any}
                        size="small"
                      />
                      <Chip
                        label={incident.status}
                        color={getStatusColor(incident.status) as any}
                        size="small"
                      />
                    </Box>
                  </Box>
                  
                  <Stepper orientation="vertical">
                    {incident.timeline.map((event, index) => (
                      <Step key={event.id} active>
                        <StepLabel>
                          <Typography variant="subtitle2">{event.description}</Typography>
                        </StepLabel>
                        <StepContent>
                          <Typography variant="body2" color="text.secondary">
                            {event.author} • {new Date(event.timestamp).toLocaleString()}
                          </Typography>
                        </StepContent>
                      </Step>
                    ))}
                  </Stepper>
                </CardContent>
              </Card>
            ))}
          </Box>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>Incident Analytics</Typography>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 3,
            mb: 3 
          }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Incidents by Severity</Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">Chart placeholder</Typography>
                </Box>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Resolution Time Trends</Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">Chart placeholder</Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Recent Incident Activity</Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Incident resolved"
                    secondary="INC-001 - Database Connection Pool Exhaustion - Resolved by John Doe - Time: 2024-01-15 10:45:00"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <WarningIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Incident escalated"
                    secondary="INC-002 - High API Response Times - Escalated to Platform Team - Time: 2024-01-15 11:10:00"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ErrorIcon color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary="New incident created"
                    secondary="INC-003 - Suspicious Login Attempts - Created by Security Team - Time: 2024-01-15 09:30:00"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </TabPanel>
      </Card>

      {/* Incident Details Dialog */}
      <Dialog open={!!selectedIncident} onClose={() => setSelectedIncident(null)} maxWidth="lg" fullWidth>
        <DialogTitle>Incident Details</DialogTitle>
        <DialogContent>
          {selectedIncident && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedIncident.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedIncident.description}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Incident Information</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Box>
                      <Typography variant="body2">ID: {selectedIncident.id}</Typography>
                      <Typography variant="body2">Severity: {selectedIncident.severity}</Typography>
                      <Typography variant="body2">Status: {selectedIncident.status}</Typography>
                      <Typography variant="body2">Priority: {selectedIncident.priority}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2">Type: {selectedIncident.type}</Typography>
                      <Typography variant="body2">Assignee: {selectedIncident.assignee || 'Unassigned'}</Typography>
                      <Typography variant="body2">Reporter: {selectedIncident.reporter}</Typography>
                      <Typography variant="body2">Created: {new Date(selectedIncident.createdAt).toLocaleString()}</Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Impact Assessment</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                    <Box>
                      <Typography variant="body2">Users Affected: {selectedIncident.impact.users.toLocaleString()}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2">Revenue Impact: ${selectedIncident.impact.revenue.toLocaleString()}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2">Duration: {selectedIncident.impact.duration} minutes</Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Affected Services</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {selectedIncident.affectedServices.map((service) => (
                      <Chip
                        key={service}
                        label={service}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Tags</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {selectedIncident.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        color="secondary"
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedIncident(null)}>Close</Button>
          <Button variant="contained">Update Incident</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IncidentManagementPage;
