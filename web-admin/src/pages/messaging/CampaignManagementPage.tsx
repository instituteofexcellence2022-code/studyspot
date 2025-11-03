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
  Tooltip,
  Switch,
  FormControlLabel,
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
  CardContent,
  Paper
} from '@mui/material';
/**
 * Campaign Management Page
 * 
 * Features:
 * - Marketing campaign creation and management
 * - Multi-channel campaign orchestration
 * - Campaign scheduling and automation
 * - A/B testing for campaigns
 * - Campaign performance analytics
 * - Audience segmentation and targeting
 */

import React, { useState, useEffect } from 'react';
import { Add as AddIcon,
  AdminPanelSettings as AdminIcon,
  Analytics as AnalyticsIcon,
  Assessment as AssessmentIcon,
  Assignment as AuditIcon,
  Backup as BackupIcon,
  BarChart as BarChartIcon,
  Business as BusinessIcon,
  Campaign as CampaignIcon,
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
  Lock as LockIcon,
  Notifications as NotificationIcon,
  Pause as PauseIcon,
  Person as PersonIcon,
  PieChart as PieChartIcon,
  PlayArrow as PlayIcon,
  PrivacyTip as PrivacyIcon,
  QrCode as QrCodeIcon,
  Refresh as RefreshIcon,
  Report as ReportIcon,
  RestartAlt as RestartIcon,
  Schedule as ScheduleIcon,
  Science as ScienceIcon,
  Security as SecurityIcon,
  Send as SendIcon,
  Settings as SettingsIcon,
  Shield as ShieldIcon,
  ShowChart as ShowChartIcon,
  Smartphone as SmartphoneIcon,
  Sms as SmsIcon,
  Stop as StopIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  Upload as UploadIcon,
  VerifiedUser as VerifiedUserIcon,
  Visibility as ViewIcon,
  VpnKey as VpnKeyIcon,
  Warning as WarningIcon } from '@mui/icons-material';
;
interface Campaign {
  id: string;
  name: string;
  description: string;
  type: 'email' | 'push' | 'sms' | 'multi_channel';
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled';
  channels: {
    email?: {
      templateId: string;
      subject: string;
    };
    push?: {
      title: string;
      body: string;
    };
    sms?: {
      message: string;
    };
  };
  targetAudience: {
    type: 'all' | 'segment' | 'custom';
    criteria: string[];
    estimatedSize: number;
  };
  schedule: {
    type: 'immediate' | 'scheduled' | 'recurring';
    startDate?: string;
    endDate?: string;
    timezone: string;
  };
  abTest?: {
    enabled: boolean;
    variants: CampaignVariant[];
    trafficSplit: number[];
  };
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
    unsubscribed: number;
    bounced: number;
  };
  createdAt: string;
  createdBy: string;
  lastModified: string;
  budget?: number;
  cost?: number;
}

interface CampaignVariant {
  id: string;
  name: string;
  description: string;
  content: any;
  trafficPercentage: number;
  isControl: boolean;
}

const CampaignManagementPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Mock data
  useEffect(() => {
    setCampaigns([
      {
        id: '1',
        name: 'Welcome Series',
        description: 'Onboarding email sequence for new users',
        type: 'email',
        status: 'running',
        channels: {
          email: {
            templateId: 'welcome-email',
            subject: 'Welcome to StudySpot!'
          }
        },
        targetAudience: {
          type: 'segment',
          criteria: ['new_users', 'not_activated'],
          estimatedSize: 450
        },
        schedule: {
          type: 'immediate',
          timezone: 'UTC'
        },
        metrics: {
          sent: 450,
          delivered: 441,
          opened: 342,
          clicked: 89,
          converted: 23,
          unsubscribed: 2,
          bounced: 9
        },
        createdAt: '2024-01-01T00:00:00Z',
        createdBy: 'marketing@company.com',
        lastModified: '2024-01-15T10:30:00Z',
        budget: 500,
        cost: 125
      },
      {
        id: '2',
        name: 'Feature Launch Announcement',
        description: 'Multi-channel campaign for new AI features',
        type: 'multi_channel',
        status: 'scheduled',
        channels: {
          email: {
            templateId: 'feature-announcement',
            subject: 'New AI Features Available!'
          },
          push: {
            title: 'New AI Features!',
            body: 'Check out our latest AI-powered recommendations'
          }
        },
        targetAudience: {
          type: 'all',
          criteria: [],
          estimatedSize: 5000
        },
        schedule: {
          type: 'scheduled',
          startDate: '2024-01-20T14:00:00Z',
          timezone: 'UTC'
        },
        abTest: {
          enabled: true,
          variants: [
            {
              id: '1',
              name: 'Control',
              description: 'Original announcement',
              content: {},
              trafficPercentage: 50,
              isControl: true
            },
            {
              id: '2',
              name: 'AI Focus',
              description: 'AI-focused messaging',
              content: {},
              trafficPercentage: 50,
              isControl: false
            }
          ],
          trafficSplit: [50, 50]
        },
        metrics: {
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          converted: 0,
          unsubscribed: 0,
          bounced: 0
        },
        createdAt: '2024-01-15T00:00:00Z',
        createdBy: 'product@company.com',
        lastModified: '2024-01-15T00:00:00Z',
        budget: 2000,
        cost: 0
      },
      {
        id: '3',
        name: 'Payment Reminder SMS',
        description: 'SMS reminders for overdue payments',
        type: 'sms',
        status: 'completed',
        channels: {
          sms: {
            message: 'Hi {{user.name}}, your StudySpot payment of ${{amount}} is due. Pay now: {{payment_link}}'
          }
        },
        targetAudience: {
          type: 'custom',
          criteria: ['payment_overdue', 'has_phone'],
          estimatedSize: 150
        },
        schedule: {
          type: 'immediate',
          timezone: 'UTC'
        },
        metrics: {
          sent: 150,
          delivered: 147,
          opened: 0,
          clicked: 23,
          converted: 18,
          unsubscribed: 0,
          bounced: 3
        },
        createdAt: '2024-01-10T00:00:00Z',
        createdBy: 'billing@company.com',
        lastModified: '2024-01-14T16:20:00Z',
        budget: 75,
        cost: 45
      }
    ]);
  }, []);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'running': return 'success';
      case 'completed': return 'info';
      case 'scheduled': return 'warning';
      case 'paused': return 'default';
      case 'draft': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email': return 'primary';
      case 'push': return 'success';
      case 'sms': return 'warning';
      case 'multi_channel': return 'info';
      default: return 'default';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <EmailIcon />;
      case 'push': return <NotificationIcon />;
      case 'sms': return <SmsIcon />;
      default: return <CampaignIcon />;
    }
  };

  const filteredCampaigns = campaigns.filter((campaign: any) => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
    const matchesType = filterType === 'all' || campaign.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const campaignMetrics = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter((c: any) => c.status === 'running').length,
    scheduledCampaigns: campaigns.filter((c: any) => c.status === 'scheduled').length,
    totalSent: campaigns.reduce((sum, c) => sum + c.metrics.sent, 0),
    averageOpenRate: campaigns.reduce((sum, c) => sum + (c.metrics.opened / c.metrics.delivered * 100), 0) / campaigns.length,
    averageClickRate: campaigns.reduce((sum, c) => sum + (c.metrics.clicked / c.metrics.delivered * 100), 0) / campaigns.length,
    totalCost: campaigns.reduce((sum, c) => sum + (c.cost || 0), 0),
    totalBudget: campaigns.reduce((sum, c) => sum + (c.budget || 0), 0)
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
            Campaign Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create, manage, and optimize multi-channel marketing campaigns
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
            Create Campaign
          </Button>
        </Box>
      </Box>

      {/* Campaign Metrics Cards */}
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
                <CampaignIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Total Campaigns</Typography>
                <Typography variant="h4">{campaignMetrics.totalCampaigns}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {campaignMetrics.activeCampaigns} active
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                <ScheduleIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Scheduled</Typography>
                <Typography variant="h4">{campaignMetrics.scheduledCampaigns}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending launch
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
                <Typography variant="h6">Avg Open Rate</Typography>
                <Typography variant="h4">{campaignMetrics.averageOpenRate.toFixed(1)}%</Typography>
                <Typography variant="body2" color="text.secondary">
                  Across all campaigns
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                <AssessmentIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Total Cost</Typography>
                <Typography variant="h4">${campaignMetrics.totalCost.toLocaleString()}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Of ${campaignMetrics.totalBudget.toLocaleString()} budget
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Campaigns" />
          <Tab label="Templates" />
          <Tab label="Analytics" />
          <Tab label="Settings" />
        </Tabs>

        {/* Campaigns Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Marketing Campaigns</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search campaigns..."
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
                  <MenuItem value="scheduled">Scheduled</MenuItem>
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
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="push">Push</MenuItem>
                  <MenuItem value="sms">SMS</MenuItem>
                  <MenuItem value="multi_channel">Multi-Channel</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Campaign</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Channels</TableCell>
                  <TableCell>Audience</TableCell>
                  <TableCell>Performance</TableCell>
                  <TableCell>Budget</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCampaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          <CampaignIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{campaign.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {campaign.description}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={campaign.type.replace('_', ' ')}
                        color={getTypeColor(campaign.type) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={campaign.status}
                        color={getStatusColor(campaign.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {Object.keys(campaign.channels).map((channel) => (
                          <Tooltip key={channel} title={channel.toUpperCase()}>
                            <Avatar sx={{ width: 24, height: 24, bgcolor: 'grey.300' }}>
                              {getChannelIcon(channel)}
                            </Avatar>
                          </Tooltip>
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {campaign.targetAudience.estimatedSize.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {campaign.targetAudience.type}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="body2">
                          Sent: {campaign.metrics.sent.toLocaleString()}
                        </Typography>
                        <Typography variant="body2">
                          Open: {campaign.metrics.delivered > 0 ? (campaign.metrics.opened / campaign.metrics.delivered * 100).toFixed(1) : 0}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        ${campaign.cost?.toLocaleString() || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        of ${campaign.budget?.toLocaleString() || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => setSelectedCampaign(campaign)}>
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small">
                          <SendIcon />
                        </IconButton>
                        <IconButton size="small">
                          <ScheduleIcon />
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
          <Typography variant="h6" gutterBottom>Campaign Templates</Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6">Welcome Series</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Onboarding email sequence for new users
                    </Typography>
                    <Chip label="Email" color="primary" size="small" />
                  </Box>
                  <IconButton size="small">
                    <EditIcon />
                  </IconButton>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'grid', gap: 1 }}>
                  <Typography variant="body2">Channels: Email</Typography>
                  <Typography variant="body2">Duration: 7 days</Typography>
                  <Typography variant="body2">Emails: 3</Typography>
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

            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6">Feature Launch</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Multi-channel announcement for new features
                    </Typography>
                    <Chip label="Multi-Channel" color="info" size="small" />
                  </Box>
                  <IconButton size="small">
                    <EditIcon />
                  </IconButton>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'grid', gap: 1 }}>
                  <Typography variant="body2">Channels: Email, Push</Typography>
                  <Typography variant="body2">Duration: 1 day</Typography>
                  <Typography variant="body2">A/B Test: Yes</Typography>
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

            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6">Payment Reminder</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      SMS reminders for overdue payments
                    </Typography>
                    <Chip label="SMS" color="warning" size="small" />
                  </Box>
                  <IconButton size="small">
                    <EditIcon />
                  </IconButton>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'grid', gap: 1 }}>
                  <Typography variant="body2">Channels: SMS</Typography>
                  <Typography variant="body2">Duration: Immediate</Typography>
                  <Typography variant="body2">Targeting: Custom</Typography>
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
          </Box>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>Campaign Analytics</Typography>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 3,
            mb: 3 
          }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Campaign Performance</Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">Chart placeholder</Typography>
                </Box>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Channel Comparison</Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">Chart placeholder</Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Recent Campaign Activity</Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Campaign completed successfully"
                    secondary="Welcome Series - 450 recipients - 77.6% open rate - Time: 2024-01-15 10:30:00"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ScheduleIcon color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Campaign scheduled"
                    secondary="Feature Launch Announcement - 5,000 recipients - Scheduled for: 2024-01-20 14:00:00"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <WarningIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Campaign paused"
                    secondary="Payment Reminder SMS - 150 recipients - Reason: High bounce rate - Time: 2024-01-14 16:20:00"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Settings Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>Campaign Settings</Typography>
          
          <Box sx={{ display: 'grid', gap: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Campaign Configuration</Typography>
                <Box sx={{ display: 'grid', gap: 2 }}>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Require approval for campaigns over 1000 recipients"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Enable A/B testing by default"
                  />
                  <FormControlLabel
                    control={<Switch />}
                    label="Allow cross-channel campaigns"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Enable campaign analytics"
                  />
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Budget & Cost Controls</Typography>
                <Box sx={{ display: 'grid', gap: 2 }}>
                  <TextField
                    label="Default campaign budget limit"
                    type="number"
                    defaultValue={1000}
                    size="small"
                  />
                  <TextField
                    label="SMS cost per message"
                    type="number"
                    defaultValue={0.05}
                    size="small"
                  />
                  <TextField
                    label="Email cost per message"
                    type="number"
                    defaultValue={0.01}
                    size="small"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Require budget approval for high-cost campaigns"
                  />
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Notifications</Typography>
                <Box sx={{ display: 'grid', gap: 2 }}>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Notify on campaign completion"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Notify on campaign performance alerts"
                  />
                  <FormControlLabel
                    control={<Switch />}
                    label="Notify on budget threshold reached"
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>
      </Card>

      {/* Campaign Details Dialog */}
      <Dialog open={!!selectedCampaign} onClose={() => setSelectedCampaign(null)} maxWidth="md" fullWidth>
        <DialogTitle>Campaign Details</DialogTitle>
        <DialogContent>
          {selectedCampaign && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedCampaign.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedCampaign.description}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Campaign Information</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Box>
                      <Typography variant="body2">Type: {selectedCampaign.type}</Typography>
                      <Typography variant="body2">Status: {selectedCampaign.status}</Typography>
                      <Typography variant="body2">Created: {new Date(selectedCampaign.createdAt).toLocaleDateString()}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2">Audience: {selectedCampaign.targetAudience.estimatedSize.toLocaleString()}</Typography>
                      <Typography variant="body2">Budget: ${selectedCampaign.budget?.toLocaleString() || 0}</Typography>
                      <Typography variant="body2">Cost: ${selectedCampaign.cost?.toLocaleString() || 0}</Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Performance Metrics</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Box>
                      <Typography variant="body2">Sent: {selectedCampaign.metrics.sent.toLocaleString()}</Typography>
                      <Typography variant="body2">Delivered: {selectedCampaign.metrics.delivered.toLocaleString()}</Typography>
                      <Typography variant="body2">Opened: {selectedCampaign.metrics.opened.toLocaleString()}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2">Clicked: {selectedCampaign.metrics.clicked.toLocaleString()}</Typography>
                      <Typography variant="body2">Converted: {selectedCampaign.metrics.converted.toLocaleString()}</Typography>
                      <Typography variant="body2">Unsubscribed: {selectedCampaign.metrics.unsubscribed.toLocaleString()}</Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Channels</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {Object.keys(selectedCampaign.channels).map((channel) => (
                      <Chip
                        key={channel}
                        label={channel.toUpperCase()}
                        color="primary"
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
          <Button onClick={() => setSelectedCampaign(null)}>Close</Button>
          <Button variant="contained">Edit Campaign</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CampaignManagementPage;






