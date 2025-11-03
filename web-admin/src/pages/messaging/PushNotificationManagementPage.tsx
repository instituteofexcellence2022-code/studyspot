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
  Alert,
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
 * Push Notification Management Page
 * 
 * Features:
 * - Push notification creation and targeting
 * - Device management and segmentation
 * - Notification scheduling and automation
 * - Delivery tracking and analytics
 * - A/B testing for notifications
 * - Platform-specific optimization (iOS/Android)
 */

import React, { useState, useEffect } from 'react';
import { Add as AddIcon,
  AdminPanelSettings as AdminIcon,
  Analytics as AnalyticsIcon,
  Android as AndroidIcon,
  Apple as AppleIcon,
  Assessment as AssessmentIcon,
  Assignment as AuditIcon,
  Backup as BackupIcon,
  BarChart as BarChartIcon,
  Business as BusinessIcon,
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
interface PushNotification {
  id: string;
  title: string;
  body: string;
  type: 'booking' | 'marketing' | 'system' | 'promotional';
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled';
  platforms: ('ios' | 'android' | 'web')[];
  targetAudience: {
    type: 'all' | 'segment' | 'custom';
    criteria: string[];
  };
  scheduledAt?: string;
  sentAt?: string;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  uninstallRate: number;
  recipients: number;
  delivered: number;
  opened: number;
  clicked: number;
  createdAt: string;
  createdBy: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  deepLink?: string;
  imageUrl?: string;
  actionButtons?: {
    label: string;
    action: string;
  }[];
}

interface DeviceSegment {
  id: string;
  name: string;
  description: string;
  criteria: {
    platform: string[];
    lastActive: string;
    appVersion: string;
    location?: string;
    userType: string[];
  };
  deviceCount: number;
  createdAt: string;
}

const PushNotificationManagementPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [segments, setSegments] = useState<DeviceSegment[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<PushNotification | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Mock data
  useEffect(() => {
    setNotifications([
      {
        id: '1',
        title: 'Your seat is ready!',
        body: 'Seat A-12 is now available for your booking',
        type: 'booking',
        status: 'sent',
        platforms: ['ios', 'android'],
        targetAudience: {
          type: 'segment',
          criteria: ['active_users', 'has_bookings']
        },
        scheduledAt: '2024-01-15T10:00:00Z',
        sentAt: '2024-01-15T10:00:00Z',
        deliveryRate: 98.5,
        openRate: 45.2,
        clickRate: 12.8,
        uninstallRate: 0.1,
        recipients: 1250,
        delivered: 1231,
        opened: 557,
        clicked: 158,
        createdAt: '2024-01-15T09:30:00Z',
        createdBy: 'admin@company.com',
        priority: 'high',
        deepLink: 'studyspot://booking/confirm',
        actionButtons: [
          { label: 'View Booking', action: 'view_booking' },
          { label: 'Cancel', action: 'cancel_booking' }
        ]
      },
      {
        id: '2',
        title: 'New StudySpot Features!',
        body: 'Check out our latest AI-powered recommendations',
        type: 'marketing',
        status: 'scheduled',
        platforms: ['ios', 'android', 'web'],
        targetAudience: {
          type: 'all',
          criteria: []
        },
        scheduledAt: '2024-01-20T14:00:00Z',
        deliveryRate: 0,
        openRate: 0,
        clickRate: 0,
        uninstallRate: 0,
        recipients: 5000,
        delivered: 0,
        opened: 0,
        clicked: 0,
        createdAt: '2024-01-15T11:00:00Z',
        createdBy: 'marketing@company.com',
        priority: 'normal',
        deepLink: 'studyspot://features/new',
        imageUrl: 'https://example.com/feature-image.jpg'
      },
      {
        id: '3',
        title: 'Payment Due',
        body: 'Your subscription payment is due in 3 days',
        type: 'system',
        status: 'failed',
        platforms: ['ios', 'android'],
        targetAudience: {
          type: 'custom',
          criteria: ['payment_due', 'premium_users']
        },
        scheduledAt: '2024-01-14T09:00:00Z',
        deliveryRate: 0,
        openRate: 0,
        clickRate: 0,
        uninstallRate: 0,
        recipients: 150,
        delivered: 0,
        opened: 0,
        clicked: 0,
        createdAt: '2024-01-14T08:30:00Z',
        createdBy: 'billing@company.com',
        priority: 'urgent'
      }
    ]);

    setSegments([
      {
        id: '1',
        name: 'Active Users',
        description: 'Users who have been active in the last 7 days',
        criteria: {
          platform: ['ios', 'android'],
          lastActive: '7d',
          appVersion: '>=2.0.0',
          userType: ['student', 'staff']
        },
        deviceCount: 2840,
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        name: 'Premium Subscribers',
        description: 'Users with active premium subscriptions',
        criteria: {
          platform: ['ios', 'android', 'web'],
          lastActive: '30d',
          appVersion: '>=1.5.0',
          userType: ['student'],
          location: 'US'
        },
        deviceCount: 1200,
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: '3',
        name: 'New Users',
        description: 'Users who joined in the last 30 days',
        criteria: {
          platform: ['ios', 'android'],
          lastActive: '30d',
          appVersion: '>=2.1.0',
          userType: ['student']
        },
        deviceCount: 450,
        createdAt: '2024-01-01T00:00:00Z'
      }
    ]);
  }, []);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'sent': return 'success';
      case 'scheduled': return 'info';
      case 'sending': return 'warning';
      case 'draft': return 'default';
      case 'failed': return 'error';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'booking': return 'primary';
      case 'marketing': return 'success';
      case 'system': return 'warning';
      case 'promotional': return 'info';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'normal': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'ios': return <AppleIcon />;
      case 'android': return <AndroidIcon />;
      case 'web': return <NotificationIcon />;
      default: return <SmartphoneIcon />;
    }
  };

  const filteredNotifications = notifications.filter((notification: any) => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.body.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || notification.status === filterStatus;
    const matchesType = filterType === 'all' || notification.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const notificationMetrics = {
    totalNotifications: notifications.length,
    sentNotifications: notifications.filter((n: any) => n.status === 'sent').length,
    scheduledNotifications: notifications.filter((n: any) => n.status === 'scheduled').length,
    totalRecipients: notifications.reduce((sum, n) => sum + n.recipients, 0),
    averageDeliveryRate: notifications.reduce((sum, n) => sum + n.deliveryRate, 0) / notifications.length,
    averageOpenRate: notifications.reduce((sum, n) => sum + n.openRate, 0) / notifications.length
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
            Push Notification Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create, schedule, and manage push notifications across all platforms
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
            Create Notification
          </Button>
        </Box>
      </Box>

      {/* Notification Metrics Cards */}
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
                <NotificationIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Total Notifications</Typography>
                <Typography variant="h4">{notificationMetrics.totalNotifications}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {notificationMetrics.sentNotifications} sent
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
                <Typography variant="h4">{notificationMetrics.scheduledNotifications}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending delivery
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
                <Typography variant="h6">Avg Delivery Rate</Typography>
                <Typography variant="h4">{notificationMetrics.averageDeliveryRate.toFixed(1)}%</Typography>
                <Typography variant="body2" color="text.secondary">
                  Across all notifications
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
                <Typography variant="h6">Avg Open Rate</Typography>
                <Typography variant="h4">{notificationMetrics.averageOpenRate.toFixed(1)}%</Typography>
                <Typography variant="body2" color="text.secondary">
                  User engagement
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Notifications" />
          <Tab label="Segments" />
          <Tab label="Analytics" />
          <Tab label="Settings" />
        </Tabs>

        {/* Notifications Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Push Notifications</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search notifications..."
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
                  <MenuItem value="sent">Sent</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="sending">Sending</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="booking">Booking</MenuItem>
                  <MenuItem value="marketing">Marketing</MenuItem>
                  <MenuItem value="system">System</MenuItem>
                  <MenuItem value="promotional">Promotional</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Notification</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Platforms</TableCell>
                  <TableCell>Recipients</TableCell>
                  <TableCell>Performance</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredNotifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          <NotificationIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{notification.title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {notification.body}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={notification.type}
                        color={getTypeColor(notification.type) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={notification.status}
                        color={getStatusColor(notification.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {notification.platforms.map((platform) => (
                          <Tooltip key={platform} title={platform.toUpperCase()}>
                            <Avatar sx={{ width: 24, height: 24, bgcolor: 'grey.300' }}>
                              {getPlatformIcon(platform)}
                            </Avatar>
                          </Tooltip>
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {notification.recipients.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="body2">
                          Delivered: {notification.deliveryRate.toFixed(1)}%
                        </Typography>
                        <Typography variant="body2">
                          Opened: {notification.openRate.toFixed(1)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={notification.priority}
                        color={getPriorityColor(notification.priority) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => setSelectedNotification(notification)}>
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

        {/* Segments Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Device Segments</Typography>
            <Button variant="contained" startIcon={<AddIcon />}>
              Create Segment
            </Button>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
            {segments.map((segment) => (
              <Card key={segment.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">{segment.name}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {segment.description}
                      </Typography>
                      <Chip
                        label={`${segment.deviceCount.toLocaleString()} devices`}
                        color="primary"
                        size="small"
                      />
                    </Box>
                    <IconButton size="small">
                      <EditIcon />
                    </IconButton>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'grid', gap: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>Criteria</Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {segment.criteria.platform.map((platform) => (
                        <Chip
                          key={platform}
                          label={platform}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Last Active: {segment.criteria.lastActive}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      App Version: {segment.criteria.appVersion}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button size="small" startIcon={<ViewIcon />}>
                      View Devices
                    </Button>
                    <Button size="small" startIcon={<SendIcon />}>
                      Send Notification
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>Notification Analytics</Typography>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 3,
            mb: 3 
          }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Delivery Trends</Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">Chart placeholder</Typography>
                </Box>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Engagement by Platform</Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">Chart placeholder</Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Recent Notification Events</Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Notification sent successfully"
                    secondary="Your seat is ready! - 1,250 recipients - 98.5% delivery rate - Time: 2024-01-15 10:00:00"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ScheduleIcon color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Notification scheduled"
                    secondary="New StudySpot Features! - 5,000 recipients - Scheduled for: 2024-01-20 14:00:00"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ErrorIcon color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Notification failed"
                    secondary="Payment Due - 150 recipients - Error: Invalid device tokens - Time: 2024-01-14 09:00:00"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Settings Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>Push Notification Settings</Typography>
          
          <Box sx={{ display: 'grid', gap: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Platform Configuration</Typography>
                <Box sx={{ display: 'grid', gap: 2 }}>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Enable iOS push notifications"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Enable Android push notifications"
                  />
                  <FormControlLabel
                    control={<Switch />}
                    label="Enable Web push notifications"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Enable notification analytics"
                  />
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Delivery Settings</Typography>
                <Box sx={{ display: 'grid', gap: 2 }}>
                  <TextField
                    label="Max notifications per user per day"
                    type="number"
                    defaultValue={10}
                    size="small"
                  />
                  <TextField
                    label="Retry attempts for failed deliveries"
                    type="number"
                    defaultValue={3}
                    size="small"
                  />
                  <TextField
                    label="Notification expiry time (hours)"
                    type="number"
                    defaultValue={24}
                    size="small"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Respect user timezone for scheduling"
                  />
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Content Guidelines</Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Configure content policies and approval workflows
                </Alert>
                <Box sx={{ display: 'grid', gap: 2 }}>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Require approval for marketing notifications"
                  />
                  <FormControlLabel
                    control={<Switch />}
                    label="Require approval for all notifications"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Enable profanity filtering"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Validate deep links before sending"
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>
      </Card>

      {/* Notification Details Dialog */}
      <Dialog open={!!selectedNotification} onClose={() => setSelectedNotification(null)} maxWidth="md" fullWidth>
        <DialogTitle>Notification Details</DialogTitle>
        <DialogContent>
          {selectedNotification && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedNotification.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedNotification.body}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Notification Information</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Box>
                      <Typography variant="body2">Type: {selectedNotification.type}</Typography>
                      <Typography variant="body2">Status: {selectedNotification.status}</Typography>
                      <Typography variant="body2">Priority: {selectedNotification.priority}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2">Recipients: {selectedNotification.recipients.toLocaleString()}</Typography>
                      <Typography variant="body2">Created: {new Date(selectedNotification.createdAt).toLocaleDateString()}</Typography>
                      {selectedNotification.sentAt && (
                        <Typography variant="body2">Sent: {new Date(selectedNotification.sentAt).toLocaleDateString()}</Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Performance Metrics</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Box>
                      <Typography variant="body2">Delivery Rate: {selectedNotification.deliveryRate.toFixed(1)}%</Typography>
                      <Typography variant="body2">Open Rate: {selectedNotification.openRate.toFixed(1)}%</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2">Click Rate: {selectedNotification.clickRate.toFixed(1)}%</Typography>
                      <Typography variant="body2">Uninstall Rate: {selectedNotification.uninstallRate.toFixed(1)}%</Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Platforms</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {selectedNotification.platforms.map((platform) => (
                      <Chip
                        key={platform}
                        label={platform.toUpperCase()}
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
          <Button onClick={() => setSelectedNotification(null)}>Close</Button>
          <Button variant="contained">Edit Notification</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PushNotificationManagementPage;






