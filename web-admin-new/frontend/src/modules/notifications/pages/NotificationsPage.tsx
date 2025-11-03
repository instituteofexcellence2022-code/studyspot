// ============================================
// SYSTEM NOTIFICATIONS CENTER - ENHANCED
// ============================================

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Switch,
  FormControlLabel,
  GridLegacy as Grid,
  Stack,
  Paper,
  Divider,
  Alert,
  Badge,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip as MuiTooltip,
} from '@mui/material';
import {
  Notifications,
  NotificationsActive,
  Error,
  Warning,
  Info,
  CheckCircle,
  Delete,
  MarkEmailRead,
  AttachMoney,
  Business,
  School,
  TrendingUp,
  Security,
  CreditCard,
  Refresh,
  Download,
  Close,
  Visibility,
  SettingsApplications,
  NotificationsOff,
  Email,
  Sms,
  PhoneAndroid,
} from '@mui/icons-material';

// Tab Panel Component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const NotificationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [filter, setFilter] = useState({
    category: 'all',
    type: 'all',
    status: 'all',
    search: '',
  });
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [preferences, setPreferences] = useState({
    email: true,
    sms: true,
    inApp: true,
    desktop: false,
    payment: true,
    system: true,
    tenant: true,
    student: true,
    subscription: true,
    credit: true,
    security: true,
    marketing: false,
  });

  // Enhanced Notifications Data
  const notifications = [
    { 
      id: 1, 
      title: 'Payment Received', 
      message: '₹3,000 payment received from Central Library for monthly subscription', 
      type: 'success', 
      category: 'payment',
      read: false, 
      time: '5 minutes ago',
      timestamp: '2025-11-02 14:25',
      priority: 'medium',
      actionRequired: false,
      details: {
        tenant: 'Central Library',
        amount: 3000,
        paymentMethod: 'UPI',
        transactionId: 'TXN_ABC123',
      },
    },
    { 
      id: 2, 
      title: 'New Tenant Registered', 
      message: 'Premium Study Center has completed onboarding with 2 libraries', 
      type: 'info', 
      category: 'tenant',
      read: false, 
      time: '30 minutes ago',
      timestamp: '2025-11-02 14:00',
      priority: 'low',
      actionRequired: true,
      details: {
        tenantName: 'Premium Study Center',
        libraries: 2,
        plan: 'Professional',
        city: 'Mumbai',
      },
    },
    { 
      id: 3, 
      title: 'System Performance Alert', 
      message: 'API response time exceeding threshold (avg: 250ms, target: 200ms)', 
      type: 'warning', 
      category: 'system',
      read: true, 
      time: '1 hour ago',
      timestamp: '2025-11-02 13:30',
      priority: 'high',
      actionRequired: true,
      details: {
        metric: 'API Response Time',
        current: '250ms',
        target: '200ms',
        affectedServices: ['Payment Gateway', 'User Management'],
      },
    },
    { 
      id: 4, 
      title: 'Subscription Expired', 
      message: 'Tech Library subscription expired today - tenant downgraded to free plan', 
      type: 'error', 
      category: 'subscription',
      read: false, 
      time: '2 hours ago',
      timestamp: '2025-11-02 12:30',
      priority: 'high',
      actionRequired: true,
      details: {
        tenant: 'Tech Library',
        previousPlan: 'Professional',
        currentPlan: 'Free',
        expiryDate: '2025-11-02',
      },
    },
    { 
      id: 5, 
      title: 'New Student Registrations', 
      message: '15 new students registered across 5 libraries today', 
      type: 'info', 
      category: 'student',
      read: true, 
      time: '3 hours ago',
      timestamp: '2025-11-02 11:30',
      priority: 'low',
      actionRequired: false,
      details: {
        count: 15,
        libraries: ['Central Library', 'StudyHub', 'Smart Study', 'Elite Library', 'Knowledge Hub'],
        timeframe: 'Today',
      },
    },
    { 
      id: 6, 
      title: 'Monthly Revenue Report Ready', 
      message: 'October 2025 revenue report generated - ₹15.6L total revenue (+28% MoM)', 
      type: 'success', 
      category: 'report',
      read: true, 
      time: '5 hours ago',
      timestamp: '2025-11-02 09:30',
      priority: 'medium',
      actionRequired: false,
      details: {
        reportMonth: 'October 2025',
        totalRevenue: 1560000,
        growth: 28,
        topTenant: 'Central Library Network',
      },
    },
    { 
      id: 7, 
      title: 'Low Credit Balance Alert', 
      message: 'Wisdom Library has only 500 credits remaining (threshold: 1000)', 
      type: 'warning', 
      category: 'credit',
      read: false, 
      time: '1 day ago',
      timestamp: '2025-11-01 14:30',
      priority: 'high',
      actionRequired: true,
      details: {
        tenant: 'Wisdom Library',
        currentBalance: 500,
        threshold: 1000,
        creditTypes: 'SMS: 200, WhatsApp: 200, Email: 100',
      },
    },
    { 
      id: 8, 
      title: 'Scheduled System Maintenance', 
      message: 'Database optimization scheduled for 2:00 AM - 4:00 AM tomorrow (estimated 2 hours)', 
      type: 'info', 
      category: 'system',
      read: true, 
      time: '2 days ago',
      timestamp: '2025-10-31 10:00',
      priority: 'medium',
      actionRequired: false,
      details: {
        maintenanceType: 'Database Optimization',
        startTime: '2:00 AM',
        endTime: '4:00 AM',
        expectedDowntime: '2 hours',
        affectedServices: 'All services',
      },
    },
    {
      id: 9,
      title: 'Security: Failed Login Attempts',
      message: '5 failed login attempts detected for admin account from IP: 203.45.67.100',
      type: 'error',
      category: 'security',
      read: false,
      time: '10 minutes ago',
      timestamp: '2025-11-02 14:20',
      priority: 'critical',
      actionRequired: true,
      details: {
        account: 'admin@studyspot.com',
        attempts: 5,
        ipAddress: '203.45.67.100',
        location: 'Unknown',
        action: 'Account temporarily locked',
      },
    },
    {
      id: 10,
      title: 'Bulk Student Import Completed',
      message: '250 students imported successfully for Central Library Network',
      type: 'success',
      category: 'student',
      read: false,
      time: '45 minutes ago',
      timestamp: '2025-11-02 13:45',
      priority: 'low',
      actionRequired: false,
      details: {
        tenant: 'Central Library Network',
        totalImported: 250,
        successful: 248,
        failed: 2,
        failureReasons: 'Duplicate email addresses',
      },
    },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle sx={{ color: '#4caf50' }} />;
      case 'error': return <Error sx={{ color: '#f44336' }} />;
      case 'warning': return <Warning sx={{ color: '#ff9800' }} />;
      case 'info': return <Info sx={{ color: '#2196f3' }} />;
      default: return <Info />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'payment': return <AttachMoney />;
      case 'tenant': return <Business />;
      case 'student': return <School />;
      case 'subscription': return <CreditCard />;
      case 'credit': return <CreditCard />;
      case 'system': return <SettingsApplications />;
      case 'security': return <Security />;
      case 'report': return <TrendingUp />;
      default: return <Notifications />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return '#e8f5e9';
      case 'error': return '#ffebee';
      case 'warning': return '#fff3e0';
      case 'info': return '#e3f2fd';
      default: return '#f5f5f5';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'primary';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  // Filtered notifications
  const filteredNotifications = notifications.filter(notif => {
    const categoryMatch = filter.category === 'all' || notif.category === filter.category;
    const typeMatch = filter.type === 'all' || notif.type === filter.type;
    const statusMatch = filter.status === 'all' || 
      (filter.status === 'unread' && !notif.read) ||
      (filter.status === 'read' && notif.read) ||
      (filter.status === 'action' && notif.actionRequired);
    const searchMatch = !filter.search || 
      notif.title.toLowerCase().includes(filter.search.toLowerCase()) ||
      notif.message.toLowerCase().includes(filter.search.toLowerCase());
    return categoryMatch && typeMatch && statusMatch && searchMatch;
  });

  // Category counts
  const categoryCounts = {
    payment: notifications.filter(n => n.category === 'payment').length,
    tenant: notifications.filter(n => n.category === 'tenant').length,
    student: notifications.filter(n => n.category === 'student').length,
    subscription: notifications.filter(n => n.category === 'subscription').length,
    credit: notifications.filter(n => n.category === 'credit').length,
    system: notifications.filter(n => n.category === 'system').length,
    security: notifications.filter(n => n.category === 'security').length,
    report: notifications.filter(n => n.category === 'report').length,
  };

  // Handlers
  const handleMarkAllRead = () => {
    console.log('Marking all as read...');
    alert('All notifications marked as read!');
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      alert('All notifications cleared!');
    }
  };

  const handleMarkAsRead = (id: number) => {
    console.log('Marking notification', id, 'as read');
    alert('Notification marked as read!');
  };

  const handleDeleteNotification = (id: number) => {
    console.log('Deleting notification', id);
    alert('Notification deleted!');
  };

  const handleSavePreferences = () => {
    console.log('Saving notification preferences:', preferences);
    alert('Notification preferences saved successfully!');
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            🔔 System Notifications Center
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor all platform events, alerts, and system updates
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<Refresh />}>
            Refresh
          </Button>
          <Button variant="outlined" startIcon={<MarkEmailRead />} onClick={handleMarkAllRead}>
            Mark All Read
          </Button>
          <Button variant="outlined" color="error" startIcon={<Delete />} onClick={handleClearAll}>
            Clear All
          </Button>
        </Stack>
      </Box>

      {/* Critical Alerts Banner */}
      {notifications.filter(n => n.priority === 'critical' && !n.read).length > 0 && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small">
              View All
            </Button>
          }
        >
          <Typography variant="body2" fontWeight="bold">
            🚨 {notifications.filter(n => n.priority === 'critical' && !n.read).length} Critical Alert(s) Require Immediate Attention
          </Typography>
        </Alert>
      )}

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                  <Notifications />
                </Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total Notifications
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {notifications.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Last 7 days
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'error.main', width: 48, height: 48 }}>
                  <NotificationsActive />
                </Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Unread
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="error.main">
                    {notifications.filter(n => !n.read).length}
                  </Typography>
                  <Typography variant="caption" color="error.main">
                    Need attention
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'warning.main', width: 48, height: 48 }}>
                  <Warning />
                </Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Action Required
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {notifications.filter(n => n.actionRequired && !n.read).length}
                  </Typography>
                  <Typography variant="caption" color="warning.main">
                    Pending tasks
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'success.main', width: 48, height: 48 }}>
                  <CheckCircle />
                </Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Today
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {notifications.filter(n => n.time.includes('minutes') || n.time.includes('hour')).length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    New notifications
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center">
            <TextField
              size="small"
              placeholder="Search notifications..."
              value={filter.search}
              onChange={(e) => setFilter({...filter, search: e.target.value})}
              sx={{ minWidth: 250 }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={filter.category}
                label="Category"
                onChange={(e) => setFilter({...filter, category: e.target.value})}
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="payment">Payment</MenuItem>
                <MenuItem value="tenant">Tenant</MenuItem>
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="subscription">Subscription</MenuItem>
                <MenuItem value="credit">Credit</MenuItem>
                <MenuItem value="system">System</MenuItem>
                <MenuItem value="security">Security</MenuItem>
                <MenuItem value="report">Report</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={filter.type}
                label="Type"
                onChange={(e) => setFilter({...filter, type: e.target.value})}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="success">Success</MenuItem>
                <MenuItem value="info">Info</MenuItem>
                <MenuItem value="warning">Warning</MenuItem>
                <MenuItem value="error">Error</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filter.status}
                label="Status"
                onChange={(e) => setFilter({...filter, status: e.target.value})}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="unread">Unread Only</MenuItem>
                <MenuItem value="read">Read Only</MenuItem>
                <MenuItem value="action">Action Required</MenuItem>
              </Select>
            </FormControl>
            <Button 
              variant="outlined" 
              startIcon={<Refresh />}
              onClick={() => setFilter({ category: 'all', type: 'all', status: 'all', search: '' })}
            >
              Reset
            </Button>
            <Button variant="outlined" startIcon={<Download />}>
              Export
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab 
            label={
              <Badge badgeContent={notifications.length} color="primary">
                All Notifications
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={notifications.filter(n => !n.read).length} color="error">
                Unread
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={notifications.filter(n => n.actionRequired && !n.read).length} color="warning">
                Action Required
              </Badge>
            } 
          />
          <Tab label="By Category" />
          <Tab label="Settings" />
        </Tabs>
      </Box>

      {/* Tab 1: All Notifications */}
      <TabPanel value={activeTab} index={0}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Showing {filteredNotifications.length} of {notifications.length} notifications
        </Typography>
        <Card>
          <CardContent>
            <List>
              {filteredNotifications.map((notif) => (
                <ListItem 
                  key={notif.id}
                  sx={{ 
                    bgcolor: notif.read ? 'transparent' : getNotificationColor(notif.type),
                    mb: 1.5,
                    borderRadius: 2,
                    border: 2,
                    borderColor: notif.priority === 'critical' ? 'error.main' : 'divider',
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 3 },
                  }}
                  onClick={() => {
                    setSelectedNotification(notif);
                    setDetailsOpen(true);
                  }}
                  secondaryAction={
                    <Stack direction="row" spacing={0.5}>
                      <MuiTooltip title="Mark as Read">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notif.id);
                          }}
                        >
                          <MarkEmailRead fontSize="small" />
                        </IconButton>
                      </MuiTooltip>
                      <MuiTooltip title="Delete">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(notif.id);
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </MuiTooltip>
                    </Stack>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: getNotificationColor(notif.type) }}>
                      {getNotificationIcon(notif.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Typography variant="subtitle1" fontWeight={notif.read ? 'normal' : 'bold'}>
                          {notif.title}
                        </Typography>
                        {!notif.read && <Chip label="NEW" color="primary" size="small" />}
                        {notif.actionRequired && <Chip label="ACTION REQUIRED" color="warning" size="small" />}
                        {notif.priority === 'critical' && <Chip label="CRITICAL" color="error" size="small" />}
                        <Chip 
                          label={notif.category.toUpperCase()} 
                          size="small" 
                          variant="outlined"
                          icon={getCategoryIcon(notif.category)}
                        />
                      </Stack>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">{notif.message}</Typography>
                        <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            🕐 {notif.time}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            📅 {notif.timestamp}
                          </Typography>
                        </Stack>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
            {filteredNotifications.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <NotificationsOff sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  No notifications match the selected filters
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Tab 2: Unread */}
      <TabPanel value={activeTab} index={1}>
        <Card>
          <CardContent>
            <List>
              {notifications.filter(n => !n.read).map((notif) => (
                <ListItem 
                  key={notif.id}
                  sx={{ 
                    bgcolor: getNotificationColor(notif.type),
                    mb: 1.5,
                    borderRadius: 2,
                    border: 2,
                    borderColor: notif.priority === 'critical' ? 'error.main' : 'divider',
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 3 },
                  }}
                  onClick={() => {
                    setSelectedNotification(notif);
                    setDetailsOpen(true);
                  }}
                  secondaryAction={
                    <Stack direction="row" spacing={0.5}>
                      <MuiTooltip title="Mark as Read">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notif.id);
                          }}
                        >
                          <MarkEmailRead fontSize="small" />
                        </IconButton>
                      </MuiTooltip>
                      <MuiTooltip title="Delete">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(notif.id);
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </MuiTooltip>
                    </Stack>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: getNotificationColor(notif.type) }}>
                      {getNotificationIcon(notif.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Typography variant="subtitle1" fontWeight="bold">
                          {notif.title}
                        </Typography>
                        <Chip label="NEW" color="primary" size="small" />
                        {notif.actionRequired && <Chip label="ACTION REQUIRED" color="warning" size="small" />}
                        <Chip 
                          label={notif.priority.toUpperCase()} 
                          size="small"
                          color={getPriorityColor(notif.priority) as any}
                        />
                      </Stack>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">{notif.message}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          🕐 {notif.time}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Tab 3: Action Required */}
      <TabPanel value={activeTab} index={2}>
        <Card>
          <CardContent>
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body2">
                These notifications require your attention or action. Review and resolve them promptly.
              </Typography>
            </Alert>
            <List>
              {notifications.filter(n => n.actionRequired).map((notif) => (
                <ListItem 
                  key={notif.id}
                  sx={{ 
                    bgcolor: notif.read ? 'transparent' : getNotificationColor(notif.type),
                    mb: 1.5,
                    borderRadius: 2,
                    border: 2,
                    borderColor: 'warning.main',
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 3 },
                  }}
                  onClick={() => {
                    setSelectedNotification(notif);
                    setDetailsOpen(true);
                  }}
                  secondaryAction={
                    <Stack direction="row" spacing={0.5}>
                      <MuiTooltip title="View Details">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedNotification(notif);
                            setDetailsOpen(true);
                          }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </MuiTooltip>
                      <MuiTooltip title="Mark as Read">
                        <IconButton 
                          size="small" 
                          color="success"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notif.id);
                          }}
                        >
                          <MarkEmailRead fontSize="small" />
                        </IconButton>
                      </MuiTooltip>
                    </Stack>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'warning.light' }}>
                      {getCategoryIcon(notif.category)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Typography variant="subtitle1" fontWeight={notif.read ? 'normal' : 'bold'}>
                          {notif.title}
                        </Typography>
                        <Chip label="ACTION REQUIRED" color="warning" size="small" />
                        {!notif.read && <Chip label="UNREAD" color="error" size="small" />}
                      </Stack>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">{notif.message}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          🕐 {notif.time}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Tab 4: By Category */}
      <TabPanel value={activeTab} index={3}>
        <Grid container spacing={3}>
          {Object.entries(categoryCounts).map(([category, count]) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={category}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { boxShadow: 6 },
                  transition: 'all 0.3s',
                }}
                onClick={() => setFilter({...filter, category})}
              >
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {getCategoryIcon(category)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight="bold" sx={{ textTransform: 'capitalize' }}>
                        {category}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {count} notification{count !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Chip 
                      label={`${notifications.filter(n => n.category === category && !n.read).length} unread`} 
                      size="small" 
                      color="error"
                      variant={notifications.filter(n => n.category === category && !n.read).length > 0 ? 'filled' : 'outlined'}
                    />
                    <Chip 
                      label={`${notifications.filter(n => n.category === category && n.actionRequired).length} action`} 
                      size="small" 
                      color="warning"
                      variant={notifications.filter(n => n.category === category && n.actionRequired).length > 0 ? 'filled' : 'outlined'}
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Tab 5: Settings */}
      <TabPanel value={activeTab} index={4}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  📧 Notification Channels
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Choose how you want to receive notifications
                </Typography>
                <Stack spacing={2}>
                  <Paper sx={{ p: 2, bgcolor: preferences.email ? 'primary.50' : 'grey.50' }}>
                    <FormControlLabel 
                      control={
                        <Switch 
                          checked={preferences.email}
                          onChange={(e) => setPreferences({...preferences, email: e.target.checked})}
                        />
                      } 
                      label={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Email fontSize="small" />
                          <Typography>Email Notifications</Typography>
                        </Stack>
                      }
                    />
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: preferences.sms ? 'primary.50' : 'grey.50' }}>
                    <FormControlLabel 
                      control={
                        <Switch 
                          checked={preferences.sms}
                          onChange={(e) => setPreferences({...preferences, sms: e.target.checked})}
                        />
                      } 
                      label={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Sms fontSize="small" />
                          <Typography>SMS Notifications</Typography>
                        </Stack>
                      }
                    />
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: preferences.inApp ? 'primary.50' : 'grey.50' }}>
                    <FormControlLabel 
                      control={
                        <Switch 
                          checked={preferences.inApp}
                          onChange={(e) => setPreferences({...preferences, inApp: e.target.checked})}
                        />
                      } 
                      label={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Notifications fontSize="small" />
                          <Typography>In-App Notifications</Typography>
                        </Stack>
                      }
                    />
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: preferences.desktop ? 'primary.50' : 'grey.50' }}>
                    <FormControlLabel 
                      control={
                        <Switch 
                          checked={preferences.desktop}
                          onChange={(e) => setPreferences({...preferences, desktop: e.target.checked})}
                        />
                      } 
                      label={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <PhoneAndroid fontSize="small" />
                          <Typography>Desktop Push Notifications</Typography>
                        </Stack>
                      }
                    />
                  </Paper>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  🎯 Notification Categories
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Enable or disable specific types of notifications
                </Typography>
                <Stack spacing={2}>
                  <Paper sx={{ p: 2, bgcolor: preferences.payment ? 'success.50' : 'grey.50' }}>
                    <FormControlLabel 
                      control={
                        <Switch 
                          checked={preferences.payment}
                          onChange={(e) => setPreferences({...preferences, payment: e.target.checked})}
                        />
                      } 
                      label="💰 Payment & Transaction Alerts"
                    />
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: preferences.tenant ? 'info.50' : 'grey.50' }}>
                    <FormControlLabel 
                      control={
                        <Switch 
                          checked={preferences.tenant}
                          onChange={(e) => setPreferences({...preferences, tenant: e.target.checked})}
                        />
                      } 
                      label="🏢 Tenant & Library Updates"
                    />
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: preferences.student ? 'primary.50' : 'grey.50' }}>
                    <FormControlLabel 
                      control={
                        <Switch 
                          checked={preferences.student}
                          onChange={(e) => setPreferences({...preferences, student: e.target.checked})}
                        />
                      } 
                      label="🎓 Student Activities"
                    />
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: preferences.subscription ? 'warning.50' : 'grey.50' }}>
                    <FormControlLabel 
                      control={
                        <Switch 
                          checked={preferences.subscription}
                          onChange={(e) => setPreferences({...preferences, subscription: e.target.checked})}
                        />
                      } 
                      label="📋 Subscription & Renewals"
                    />
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: preferences.credit ? 'error.50' : 'grey.50' }}>
                    <FormControlLabel 
                      control={
                        <Switch 
                          checked={preferences.credit}
                          onChange={(e) => setPreferences({...preferences, credit: e.target.checked})}
                        />
                      } 
                      label="💳 Credit Balance Alerts"
                    />
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: preferences.system ? 'info.50' : 'grey.50' }}>
                    <FormControlLabel 
                      control={
                        <Switch 
                          checked={preferences.system}
                          onChange={(e) => setPreferences({...preferences, system: e.target.checked})}
                        />
                      } 
                      label="⚙️ System & Performance Alerts"
                    />
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: preferences.security ? 'error.50' : 'grey.50' }}>
                    <FormControlLabel 
                      control={
                        <Switch 
                          checked={preferences.security}
                          onChange={(e) => setPreferences({...preferences, security: e.target.checked})}
                        />
                      } 
                      label="🔒 Security & Login Alerts"
                    />
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: preferences.marketing ? 'grey.50' : 'grey.50' }}>
                    <FormControlLabel 
                      control={
                        <Switch 
                          checked={preferences.marketing}
                          onChange={(e) => setPreferences({...preferences, marketing: e.target.checked})}
                        />
                      } 
                      label="📢 Marketing & Product Updates"
                    />
                  </Paper>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button 
                variant="contained" 
                size="large" 
                startIcon={<CheckCircle />}
                onClick={handleSavePreferences}
              >
                Save Preferences
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                onClick={() => {
                  setPreferences({
                    email: true,
                    sms: true,
                    inApp: true,
                    desktop: false,
                    payment: true,
                    system: true,
                    tenant: true,
                    student: true,
                    subscription: true,
                    credit: true,
                    security: true,
                    marketing: false,
                  });
                }}
              >
                Reset to Default
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Notification Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold">📋 Notification Details</Typography>
            <IconButton size="small" onClick={() => setDetailsOpen(false)}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {selectedNotification && (
            <Stack spacing={3}>
              {/* Header */}
              <Paper sx={{ p: 2, bgcolor: getNotificationColor(selectedNotification.type), border: 2, borderColor: selectedNotification.type === 'error' ? 'error.main' : 'divider' }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ width: 56, height: 56, bgcolor: 'white' }}>
                    {getNotificationIcon(selectedNotification.type)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight="bold">
                      {selectedNotification.title}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
                      <Chip label={selectedNotification.type.toUpperCase()} size="small" color={selectedNotification.type as any} />
                      <Chip label={selectedNotification.category.toUpperCase()} size="small" variant="outlined" />
                      <Chip 
                        label={selectedNotification.priority.toUpperCase()} 
                        size="small"
                        color={getPriorityColor(selectedNotification.priority) as any}
                      />
                    </Stack>
                  </Box>
                </Stack>
              </Paper>

              {/* Message */}
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Message
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedNotification.message}
                </Typography>
              </Box>

              {/* Metadata */}
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Time</Typography>
                  <Typography variant="body2" fontWeight="medium">{selectedNotification.time}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Timestamp</Typography>
                  <Typography variant="body2" fontWeight="medium">{selectedNotification.timestamp}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Chip label={selectedNotification.read ? 'Read' : 'Unread'} size="small" color={selectedNotification.read ? 'default' : 'error'} />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Action Required</Typography>
                  <Chip label={selectedNotification.actionRequired ? 'Yes' : 'No'} size="small" color={selectedNotification.actionRequired ? 'warning' : 'success'} />
                </Grid>
              </Grid>

              <Divider />

              {/* Detailed Information */}
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  📊 Detailed Information
                </Typography>
                <Stack spacing={1.5}>
                  {Object.entries(selectedNotification.details).map(([key, value]: [string, any]) => (
                    <Paper key={key} sx={{ p: 1.5, bgcolor: 'grey.50' }}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {typeof value === 'number' && key.includes('amount') 
                            ? `₹${value.toLocaleString()}` 
                            : Array.isArray(value) 
                            ? value.join(', ') 
                            : value}
                        </Typography>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Box>

              {selectedNotification.actionRequired && (
                <Alert severity="warning">
                  <Typography variant="body2" fontWeight="bold">
                    Action Required
                  </Typography>
                  <Typography variant="body2">
                    This notification requires your attention. Please review and take necessary action.
                  </Typography>
                </Alert>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          {selectedNotification && !selectedNotification.read && (
            <Button 
              variant="outlined" 
              startIcon={<MarkEmailRead />}
              onClick={() => {
                handleMarkAsRead(selectedNotification.id);
                setDetailsOpen(false);
              }}
            >
              Mark as Read
            </Button>
          )}
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={<Delete />}
            onClick={() => {
              handleDeleteNotification(selectedNotification.id);
              setDetailsOpen(false);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotificationsPage;
