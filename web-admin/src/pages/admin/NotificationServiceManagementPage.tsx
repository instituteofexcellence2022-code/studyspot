/**
 * Notification Service Management Page
 * Comprehensive notification service monitoring and configuration
 * 
 * Features:
 * - Multi-channel Notifications
 * - Real-time Notifications
 * - Scheduled Notifications
 * - Notification Templates
 * - Delivery Tracking
 * - Analytics & Metrics
 * - User Preferences
 * - Campaign Management
 */

import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Avatar, Chip, LinearProgress, Button, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemIcon, ListItemText, Divider, Paper, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Tooltip, Alert, TextField, Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel } from '@mui/material';
import {
  Add as AddIcon,
  Analytics as AnalyticsIcon,
  Campaign as CampaignIcon,
  CheckCircle as CheckIcon,
  Delete as DeleteIcon,
  Description as TemplateIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Error as ErrorIcon,
  Group as GroupIcon,
  Memory as MemoryIcon,
  Notifications as NotificationsIcon,
  Pause as PauseIcon,
  Person as PersonIcon,
  PlayArrow as PlayIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
  Send as SendIcon,
  Settings as SettingsIcon,
  Sms as SmsIcon,
  Speed as SpeedIcon,
  Stop as StopIcon,
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
  Upload as UploadIcon,
  Visibility as ViewIcon,
  Warning as WarningIcon,
  WhatsApp as WhatsAppIcon
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
  Legend,
  ResponsiveContainer

  } from 'recharts';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'email' | 'sms' | 'push' | 'whatsapp' | 'in_app';
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
  recipient: string;
  recipientType: 'user' | 'group' | 'broadcast';
  scheduledAt?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  templateId?: string;
  metadata: any;
  createdAt: string;
}

interface NotificationTemplate {
  id: string;
  name: string;
  description: string;
  type: 'email' | 'sms' | 'push' | 'whatsapp' | 'in_app';
  subject?: string;
  content: string;
  variables: string[];
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

interface NotificationCampaign {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'paused' | 'cancelled';
  templateId: string;
  templateName: string;
  targetAudience: string;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  failedCount: number;
  createdAt: string;
}

interface NotificationMetrics {
  id: string;
  period: string;
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  totalFailed: number;
  deliveryRate: number;
  readRate: number;
  failureRate: number;
  avgDeliveryTime: number;
  channelBreakdown: ChannelMetrics[];
}

interface ChannelMetrics {
  channel: string;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  deliveryRate: number;
  readRate: number;
}

const NotificationServiceManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'n1',
      title: 'Booking Confirmation',
      message: 'Your seat booking has been confirmed for tomorrow at 2:00 PM',
      type: 'email',
      status: 'delivered',
      recipient: 'john.smith@email.com',
      recipientType: 'user',
      scheduledAt: '2025-10-27 10:00:00',
      sentAt: '2025-10-27 10:00:05',
      deliveredAt: '2025-10-27 10:00:12',
      readAt: '2025-10-27 10:15:30',
      priority: 'medium',
      templateId: 't1',
      metadata: { bookingId: 'b123', seatNumber: 'A5' },
      createdAt: '2025-10-27 09:45:00'},
    {
      id: 'n2',
      title: 'Library Reminder',
      message: 'Your library session will end in 15 minutes',
      type: 'push',
      status: 'sent',
      recipient: 'user_456',
      recipientType: 'user',
      scheduledAt: '2025-10-27 14:45:00',
      sentAt: '2025-10-27 14:45:02',
      priority: 'high',
      templateId: 't2',
      metadata: { sessionId: 's789', remainingTime: 15 },
      createdAt: '2025-10-27 14:30:00'},
    {
      id: 'n3',
      title: 'Payment Failed',
      message: 'Your payment could not be processed. Please update your payment method.',
      type: 'sms',
      status: 'failed',
      recipient: '+1-555-0123',
      recipientType: 'user',
      scheduledAt: '2025-10-27 11:00:00',
      priority: 'urgent',
      templateId: 't3',
      metadata: { paymentId: 'p456', amount: 25.00 },
      createdAt: '2025-10-27 10:55:00'},
    {
      id: 'n4',
      title: 'Maintenance Notice',
      message: 'Library will be under maintenance tomorrow from 2-4 PM',
      type: 'whatsapp',
      status: 'pending',
      recipient: 'broadcast',
      recipientType: 'broadcast',
      scheduledAt: '2025-10-28 08:00:00',
      priority: 'medium',
      templateId: 't4',
      metadata: { maintenanceType: 'scheduled', duration: 2 },
      createdAt: '2025-10-27 16:00:00'},
  ]);

  const [templates, setTemplates] = useState<NotificationTemplate[]>([
    {
      id: 't1',
      name: 'Booking Confirmation',
      description: 'Email template for booking confirmations',
      type: 'email',
      subject: 'Booking Confirmed - {{libraryName}}',
      content: 'Dear {{userName}}, your booking for seat {{seatNumber}} on {{date}} at {{time}} has been confirmed.',
      variables: ['userName', 'libraryName', 'seatNumber', 'date', 'time'],
      isActive: true,
      usageCount: 1250,
      createdAt: '2025-10-01',
      updatedAt: '2025-10-15'},
    {
      id: 't2',
      name: 'Session Reminder',
      description: 'Push notification for session reminders',
      type: 'push',
      content: 'Your {{sessionType}} session will end in {{remainingTime}} minutes',
      variables: ['sessionType', 'remainingTime'],
      isActive: true,
      usageCount: 3420,
      createdAt: '2025-10-05',
      updatedAt: '2025-10-20'},
    {
      id: 't3',
      name: 'Payment Alert',
      description: 'SMS template for payment notifications',
      type: 'sms',
      content: 'Payment {{status}} for ${{amount}}. {{message}}',
      variables: ['status', 'amount', 'message'],
      isActive: true,
      usageCount: 890,
      createdAt: '2025-10-10',
      updatedAt: '2025-10-18'},
    {
      id: 't4',
      name: 'Maintenance Notice',
      description: 'WhatsApp template for maintenance notifications',
      type: 'whatsapp',
      content: '🔧 Maintenance Alert: {{facility}} will be under maintenance on {{date}} from {{startTime}} to {{endTime}}.',
      variables: ['facility', 'date', 'startTime', 'endTime'],
      isActive: false,
      usageCount: 45,
      createdAt: '2025-10-12',
      updatedAt: '2025-10-25'},
  ]);

  const [campaigns, setCampaigns] = useState<NotificationCampaign[]>([
    {
      id: 'c1',
      name: 'Welcome New Users',
      description: 'Welcome campaign for new user registrations',
      status: 'running',
      templateId: 't1',
      templateName: 'Booking Confirmation',
      targetAudience: 'new_users',
      scheduledAt: '2025-10-27 09:00:00',
      startedAt: '2025-10-27 09:00:00',
      totalRecipients: 150,
      sentCount: 120,
      deliveredCount: 115,
      readCount: 98,
      failedCount: 5,
      createdAt: '2025-10-26'},
    {
      id: 'c2',
      name: 'Monthly Newsletter',
      description: 'Monthly newsletter with library updates',
      status: 'scheduled',
      templateId: 't4',
      templateName: 'Maintenance Notice',
      targetAudience: 'all_users',
      scheduledAt: '2025-11-01 10:00:00',
      totalRecipients: 2500,
      sentCount: 0,
      deliveredCount: 0,
      readCount: 0,
      failedCount: 0,
      createdAt: '2025-10-25'},
    {
      id: 'c3',
      name: 'Payment Reminders',
      description: 'Reminder campaign for pending payments',
      status: 'completed',
      templateId: 't3',
      templateName: 'Payment Alert',
      targetAudience: 'pending_payments',
      scheduledAt: '2025-10-25 14:00:00',
      startedAt: '2025-10-25 14:00:00',
      completedAt: '2025-10-25 14:30:00',
      totalRecipients: 75,
      sentCount: 75,
      deliveredCount: 72,
      readCount: 68,
      failedCount: 3,
      createdAt: '2025-10-24'},
  ]);

  const [metrics, setMetrics] = useState<NotificationMetrics[]>([
    {
      id: 'm1',
      period: '2025-10-27',
      totalSent: 1250,
      totalDelivered: 1180,
      totalRead: 945,
      totalFailed: 70,
      deliveryRate: 94.4,
      readRate: 80.1,
      failureRate: 5.6,
      avgDeliveryTime: 2.3,
      channelBreakdown: [
        { channel: 'email', sent: 800, delivered: 760, read: 608, failed: 40, deliveryRate: 95.0, readRate: 80.0 },
        { channel: 'sms', sent: 300, delivered: 285, read: 228, failed: 15, deliveryRate: 95.0, readRate: 80.0 },
        { channel: 'push', sent: 150, delivered: 135, read: 109, failed: 15, deliveryRate: 90.0, readRate: 80.7 },
      ]},
  ]);

  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<NotificationCampaign | null>(null);
  const [notificationDetailsOpen, setNotificationDetailsOpen] = useState(false);
  const [templateDetailsOpen, setTemplateDetailsOpen] = useState(false);
  const [campaignDetailsOpen, setCampaignDetailsOpen] = useState(false);
  const [createNotificationOpen, setCreateNotificationOpen] = useState(false);
  const [createTemplateOpen, setCreateTemplateOpen] = useState(false);

  // Mock data for charts
  const notificationVolumeData = [
    { time: '00:00', sent: 50, delivered: 48, read: 40 },
    { time: '04:00', sent: 30, delivered: 28, read: 22 },
    { time: '08:00', sent: 200, delivered: 190, read: 152 },
    { time: '12:00', sent: 350, delivered: 330, read: 264 },
    { time: '16:00', sent: 400, delivered: 380, read: 304 },
    { time: '20:00', sent: 220, delivered: 210, read: 168 },
  ];

  const channelPerformanceData = [
    { channel: 'Email', deliveryRate: 95.0, readRate: 80.0, color: '#6366f1' },
    { channel: 'SMS', deliveryRate: 95.0, readRate: 80.0, color: '#16a34a' },
    { channel: 'Push', deliveryRate: 90.0, readRate: 80.7, color: '#d97706' },
    { channel: 'WhatsApp', deliveryRate: 98.0, readRate: 85.0, color: '#25d366' },
    { channel: 'In-App', deliveryRate: 99.0, readRate: 90.0, color: '#8b5cf6' },
  ];

  const campaignPerformanceData = [
    { campaign: 'Welcome New Users', sent: 120, delivered: 115, read: 98 },
    { campaign: 'Monthly Newsletter', sent: 0, delivered: 0, read: 0 },
    { campaign: 'Payment Reminders', sent: 75, delivered: 72, read: 68 },
  ];

  const deliveryTrendData = [
    { day: 'Mon', deliveryRate: 94.2, readRate: 78.5 },
    { day: 'Tue', deliveryRate: 95.1, readRate: 80.2 },
    { day: 'Wed', deliveryRate: 93.8, readRate: 79.1 },
    { day: 'Thu', deliveryRate: 96.0, readRate: 82.3 },
    { day: 'Fri', deliveryRate: 94.5, readRate: 80.8 },
    { day: 'Sat', deliveryRate: 92.1, readRate: 76.9 },
    { day: 'Sun', deliveryRate: 90.8, readRate: 74.2 },
  ];

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'sent': return '#16a34a';
      case 'delivered': return '#16a34a';
      case 'read': return '#16a34a';
      case 'pending': return '#d97706';
      case 'scheduled': return '#6366f1';
      case 'running': return '#d97706';
      case 'completed': return '#16a34a';
      case 'failed': return '#dc2626';
      case 'cancelled': return '#6b7280';
      case 'paused': return '#6b7280';
      case 'draft': return '#6b7280';
      case 'active': return '#16a34a';
      case 'inactive': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'sent': return <SendIcon />;
      case 'delivered': return <CheckIcon />;
      case 'read': return <CheckIcon />;
      case 'pending': return <ScheduleIcon />;
      case 'scheduled': return <ScheduleIcon />;
      case 'running': return <PlayIcon />;
      case 'completed': return <CheckIcon />;
      case 'failed': return <ErrorIcon />;
      case 'cancelled': return <StopIcon />;
      case 'paused': return <PauseIcon />;
      case 'draft': return <EditIcon />;
      case 'active': return <CheckIcon />;
      case 'inactive': return <ErrorIcon />;
      default: return <ErrorIcon />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <EmailIcon />;
      case 'sms': return <SmsIcon />;
      case 'push': return <NotificationsIcon />;
      case 'whatsapp': return <WhatsAppIcon />;
      case 'in_app': return <NotificationsIcon />;
      default: return <NotificationsIcon />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#dc2626';
      case 'high': return '#d97706';
      case 'medium': return '#6366f1';
      case 'low': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setNotificationDetailsOpen(true);
  };

  const handleTemplateClick = (template: NotificationTemplate) => {
    setSelectedTemplate(template);
    setTemplateDetailsOpen(true);
  };

  const handleCampaignClick = (campaign: NotificationCampaign) => {
    setSelectedCampaign(campaign);
    setCampaignDetailsOpen(true);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const refreshData = () => {
    console.log('Refreshing notification service data...');
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Notification Service Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Monitor notifications, templates, campaigns, and delivery metrics
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={refreshData}
          >
            Refresh Data
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateNotificationOpen(true)}
          >
            Send Notification
          </Button>
        </Box>
      </Box>

      {/* Key Metrics */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#6366f1', mr: 2 }}>
                  <SendIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Total Sent</Typography>
                  <Typography variant="h4" color="primary">
                    {notifications.length}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Last 24 hours
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#16a34a', mr: 2 }}>
                  <CheckIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Delivery Rate</Typography>
                  <Typography variant="h4" color="success.main">
                    {Math.round(notifications.filter((n: any) => n.status === 'delivered' || n.status === 'read').length / notifications.length * 100)}%
                  </Typography>
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.round(notifications.filter((n: any) => n.status === 'delivered' || n.status === 'read').length / notifications.length * 100)}
                sx={{ mt: 1 }}
                color="success"
              />
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#d97706', mr: 2 }}>
                  <TemplateIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Active Templates</Typography>
                  <Typography variant="h4" color="warning.main">
                    {templates.filter((t: any) => t.isActive).length}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total: {templates.length} templates
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#dc2626', mr: 2 }}>
                  <CampaignIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Active Campaigns</Typography>
                  <Typography variant="h4" color="error.main">
                    {campaigns.filter((c: any) => c.status === 'running').length}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total: {campaigns.length} campaigns
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Notifications" />
          <Tab label="Templates" />
          <Tab label="Campaigns" />
          <Tab label="Analytics" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Notifications
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Recipient</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Scheduled</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {notifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 1, width: 24, height: 24, bgcolor: getStatusColor(notification.type) }}>
                            {getTypeIcon(notification.type)}
                          </Avatar>
                          <Typography variant="body2">
                            {notification.type.toUpperCase()}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {notification.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {notification.message.substring(0, 50)}...
                        </Typography>
                      </TableCell>
                      <TableCell>{notification.recipient}</TableCell>
                      <TableCell>
                        <Chip
                          label={notification.status}
                          size="small"
                          sx={{
                            bgcolor: getStatusColor(notification.status),
                            color: 'white'}}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={notification.priority}
                          size="small"
                          sx={{
                            bgcolor: getPriorityColor(notification.priority),
                            color: 'white'}}
                        />
                      </TableCell>
                      <TableCell>{notification.scheduledAt || 'Immediate'}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton size="small" onClick={() => handleNotificationClick(notification)}>
                            <ViewIcon />
                          </IconButton>
                          <IconButton size="small">
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {activeTab === 1 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {templates.map((template) => (
            <Box sx={{ flex: '1 1 350px', minWidth: 350 }} key={template.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4}}}
                onClick={() => handleTemplateClick(template)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: getStatusColor(template.type), mr: 2 }}>
                      {getTypeIcon(template.type)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6">{template.name}</Typography>
                      <Chip
                        label={template.type.toUpperCase()}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {template.description}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Usage: {template.usageCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Status: {template.isActive ? 'Active' : 'Inactive'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Variables: {template.variables.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Updated: {template.updatedAt}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton size="small" color="primary">
                      <ViewIcon />
                    </IconButton>
                    <IconButton size="small" color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="primary">
                      <SendIcon />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      )}

      {activeTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Notification Campaigns
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Campaign</TableCell>
                    <TableCell>Template</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Recipients</TableCell>
                    <TableCell>Sent</TableCell>
                    <TableCell>Delivered</TableCell>
                    <TableCell>Read</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {campaign.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {campaign.description}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{campaign.templateName}</TableCell>
                      <TableCell>
                        <Chip
                          label={campaign.status}
                          size="small"
                          sx={{
                            bgcolor: getStatusColor(campaign.status),
                            color: 'white'}}
                        />
                      </TableCell>
                      <TableCell>{campaign.totalRecipients}</TableCell>
                      <TableCell>{campaign.sentCount}</TableCell>
                      <TableCell>{campaign.deliveredCount}</TableCell>
                      <TableCell>{campaign.readCount}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton size="small" onClick={() => handleCampaignClick(campaign)}>
                            <ViewIcon />
                          </IconButton>
                          <IconButton size="small">
                            <EditIcon />
                          </IconButton>
                          {campaign.status === 'running' && (
                            <IconButton size="small" color="error">
                              <PauseIcon />
                            </IconButton>
                          )}
                          {campaign.status === 'paused' && (
                            <IconButton size="small" color="primary">
                              <PlayIcon />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {activeTab === 3 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: '2 1 600px', minWidth: 400 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Notification Volume (24h)
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={notificationVolumeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="sent"
                      stackId="1"
                      stroke="#6366f1"
                      fill="#6366f1"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="delivered"
                      stackId="2"
                      stroke="#16a34a"
                      fill="#16a34a"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="read"
                      stackId="3"
                      stroke="#d97706"
                      fill="#d97706"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Channel Performance
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={channelPerformanceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="deliveryRate"
                    >
                      {channelPerformanceData.map((entry, index) => (
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

          <Box sx={{ flex: '2 1 600px', minWidth: 400 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Campaign Performance
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={campaignPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="campaign" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="sent" fill="#6366f1" name="Sent" />
                    <Bar dataKey="delivered" fill="#16a34a" name="Delivered" />
                    <Bar dataKey="read" fill="#d97706" name="Read" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Delivery Trend (7 Days)
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={deliveryTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="deliveryRate" stroke="#16a34a" strokeWidth={2} />
                    <Line type="monotone" dataKey="readRate" stroke="#d97706" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      {/* Notification Details Dialog */}
      <Dialog
        open={notificationDetailsOpen}
        onClose={() => setNotificationDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedNotification?.title} - Notification Details
        </DialogTitle>
        <DialogContent>
          {selectedNotification && (
            <Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={selectedNotification.status}
                    sx={{
                      bgcolor: getStatusColor(selectedNotification.status),
                      color: 'white'}}
                  />
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Type
                  </Typography>
                  <Typography variant="h6">
                    {selectedNotification.type.toUpperCase()}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Priority
                  </Typography>
                  <Chip
                    label={selectedNotification.priority}
                    sx={{
                      bgcolor: getPriorityColor(selectedNotification.priority),
                      color: 'white'}}
                  />
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Recipient Type
                  </Typography>
                  <Typography variant="h6">
                    {selectedNotification.recipientType}
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Message Content
              </Typography>
              <Paper sx={{ p: 2, bgcolor: '#f5f5f5', mb: 2 }}>
                <Typography variant="body2">
                  {selectedNotification.message}
                </Typography>
              </Paper>
              
              <Typography variant="h6" gutterBottom>
                Delivery Timeline
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Scheduled
                  </Typography>
                  <Typography variant="body2">
                    {selectedNotification.scheduledAt || 'Immediate'}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Sent
                  </Typography>
                  <Typography variant="body2">
                    {selectedNotification.sentAt || 'Not sent'}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Delivered
                  </Typography>
                  <Typography variant="body2">
                    {selectedNotification.deliveredAt || 'Not delivered'}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Read
                  </Typography>
                  <Typography variant="body2">
                    {selectedNotification.readAt || 'Not read'}
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Metadata
              </Typography>
              <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                <Typography variant="body2" fontFamily="monospace">
                  {JSON.stringify(selectedNotification.metadata, null, 2)}
                </Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotificationDetailsOpen(false)}>
            Close
          </Button>
          <Button variant="contained">
            Resend
          </Button>
        </DialogActions>
      </Dialog>

      {/* Template Details Dialog */}
      <Dialog
        open={templateDetailsOpen}
        onClose={() => setTemplateDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedTemplate?.name} - Template Details
        </DialogTitle>
        <DialogContent>
          {selectedTemplate && (
            <Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Type
                  </Typography>
                  <Typography variant="h6">
                    {selectedTemplate.type.toUpperCase()}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Typography variant="h6">
                    {selectedTemplate.isActive ? 'Active' : 'Inactive'}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Usage Count
                  </Typography>
                  <Typography variant="h6">
                    {selectedTemplate.usageCount}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Variables
                  </Typography>
                  <Typography variant="h6">
                    {selectedTemplate.variables.length}
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {selectedTemplate.description}
              </Typography>
              
              {selectedTemplate.subject && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Subject
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: '#f5f5f5', mb: 2 }}>
                    <Typography variant="body2">
                      {selectedTemplate.subject}
                    </Typography>
                  </Paper>
                </>
              )}
              
              <Typography variant="h6" gutterBottom>
                Content
              </Typography>
              <Paper sx={{ p: 2, bgcolor: '#f5f5f5', mb: 2 }}>
                <Typography variant="body2">
                  {selectedTemplate.content}
                </Typography>
              </Paper>
              
              <Typography variant="h6" gutterBottom>
                Variables
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedTemplate.variables.map((variable) => (
                  <Chip key={variable} label={`{{${variable}}}`} variant="outlined" />
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateDetailsOpen(false)}>
            Close
          </Button>
          <Button variant="contained">
            Edit Template
          </Button>
        </DialogActions>
      </Dialog>

      {/* Campaign Details Dialog */}
      <Dialog
        open={campaignDetailsOpen}
        onClose={() => setCampaignDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedCampaign?.name} - Campaign Details
        </DialogTitle>
        <DialogContent>
          {selectedCampaign && (
            <Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={selectedCampaign.status}
                    sx={{
                      bgcolor: getStatusColor(selectedCampaign.status),
                      color: 'white'}}
                  />
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Template
                  </Typography>
                  <Typography variant="h6">
                    {selectedCampaign.templateName}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Target Audience
                  </Typography>
                  <Typography variant="h6">
                    {selectedCampaign.targetAudience}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Recipients
                  </Typography>
                  <Typography variant="h6">
                    {selectedCampaign.totalRecipients}
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {selectedCampaign.description}
              </Typography>
              
              <Typography variant="h6" gutterBottom>
                Campaign Timeline
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Scheduled
                  </Typography>
                  <Typography variant="body2">
                    {selectedCampaign.scheduledAt || 'Not scheduled'}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Started
                  </Typography>
                  <Typography variant="body2">
                    {selectedCampaign.startedAt || 'Not started'}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Completed
                  </Typography>
                  <Typography variant="body2">
                    {selectedCampaign.completedAt || 'Not completed'}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body2">
                    {selectedCampaign.createdAt}
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Performance Metrics
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Sent
                  </Typography>
                  <Typography variant="h6">
                    {selectedCampaign.sentCount}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Delivered
                  </Typography>
                  <Typography variant="h6">
                    {selectedCampaign.deliveredCount}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Read
                  </Typography>
                  <Typography variant="h6">
                    {selectedCampaign.readCount}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Failed
                  </Typography>
                  <Typography variant="h6">
                    {selectedCampaign.failedCount}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCampaignDetailsOpen(false)}>
            Close
          </Button>
          <Button variant="contained">
            Edit Campaign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Notification Dialog */}
      <Dialog
        open={createNotificationOpen}
        onClose={() => setCreateNotificationOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Send New Notification
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Title"
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Message"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select label="Type">
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="sms">SMS</MenuItem>
                <MenuItem value="push">Push Notification</MenuItem>
                <MenuItem value="whatsapp">WhatsApp</MenuItem>
                <MenuItem value="in_app">In-App</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Recipient"
              fullWidth
              variant="outlined"
            />
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select label="Priority">
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Schedule (Optional)"
              fullWidth
              variant="outlined"
              type="datetime-local"
            />
            <FormControlLabel
              control={<Switch />}
              label="Use template"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateNotificationOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained">
            Send Notification
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotificationServiceManagement;
