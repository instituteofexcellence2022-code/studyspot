// ============================================
// NOTIFICATIONS & ALERTS PAGE
// ============================================

import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  IconButton,
  Stack,
  TextField,
  MenuItem,
  InputAdornment,
  Divider,
  Badge,
  Switch,
  FormControlLabel,
  Paper,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsActive as ActiveIcon,
  NotificationsOff as OffIcon,
  Delete as DeleteIcon,
  Done as DoneIcon,
  DoneAll as DoneAllIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  Campaign as CampaignIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  category: string;
  read: boolean;
  important: boolean;
  timestamp: string;
  actionUrl?: string;
  sender?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`notifications-tabpanel-${index}`}
      aria-labelledby={`notifications-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const NotificationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'New tenant registered',
      message: 'TechCorp Solutions has completed registration and is awaiting approval.',
      type: 'info',
      category: 'Tenants',
      read: false,
      important: true,
      timestamp: '2024-10-30T10:30:00Z',
      actionUrl: '/tenants/new-123',
      sender: 'System',
    },
    {
      id: '2',
      title: 'Payment received',
      message: 'Payment of $500 received from CloudBase Networks for subscription renewal.',
      type: 'success',
      category: 'Billing',
      read: false,
      important: false,
      timestamp: '2024-10-30T09:15:00Z',
      sender: 'Payment System',
    },
    {
      id: '3',
      title: 'Server maintenance scheduled',
      message: 'Scheduled maintenance on Nov 5, 2024 from 2:00 AM to 4:00 AM EST.',
      type: 'warning',
      category: 'System',
      read: true,
      important: true,
      timestamp: '2024-10-29T16:45:00Z',
      sender: 'Admin Team',
    },
    {
      id: '4',
      title: 'Failed login attempts',
      message: 'Multiple failed login attempts detected from IP 192.168.1.100.',
      type: 'error',
      category: 'Security',
      read: false,
      important: true,
      timestamp: '2024-10-29T14:20:00Z',
      sender: 'Security System',
    },
    {
      id: '5',
      title: 'User role updated',
      message: 'John Anderson role changed from Viewer to Admin.',
      type: 'info',
      category: 'Users',
      read: true,
      important: false,
      timestamp: '2024-10-28T11:30:00Z',
      sender: 'Sarah Mitchell',
    },
    {
      id: '6',
      title: 'Database backup completed',
      message: 'Daily database backup completed successfully. Size: 2.4 GB.',
      type: 'success',
      category: 'System',
      read: true,
      important: false,
      timestamp: '2024-10-28T03:00:00Z',
      sender: 'System',
    },
    {
      id: '7',
      title: 'License expiring soon',
      message: 'Enterprise license for Innovate Inc expires in 15 days.',
      type: 'warning',
      category: 'Licensing',
      read: false,
      important: true,
      timestamp: '2024-10-27T09:00:00Z',
      sender: 'System',
    },
    {
      id: '8',
      title: 'API rate limit reached',
      message: 'Tenant DataTech Systems reached 90% of API rate limit.',
      type: 'warning',
      category: 'API',
      read: true,
      important: false,
      timestamp: '2024-10-26T15:20:00Z',
      sender: 'System',
    },
  ]);

  // Notification settings
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    systemAlerts: true,
    securityAlerts: true,
    billingAlerts: true,
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    toast.success('Notification marked as read');
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
    toast.success('Notification deleted');
  };

  const handleDeleteAll = () => {
    const filteredNotifications = getFilteredNotifications();
    const idsToDelete = filteredNotifications.map((n) => n.id);
    setNotifications(notifications.filter((n) => !idsToDelete.includes(n.id)));
    toast.success(`${idsToDelete.length} notifications deleted`);
  };

  const handleRefresh = () => {
    toast.success('Notifications refreshed');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <InfoIcon color="info" />;
      case 'success':
        return <SuccessIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'system':
        return <SettingsIcon color="action" />;
      default:
        return <InfoIcon />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'info':
        return 'info';
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'system':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getFilteredNotifications = () => {
    let filtered = notifications;

    // Filter by tab
    if (activeTab === 1) {
      filtered = filtered.filter((n) => !n.read);
    } else if (activeTab === 2) {
      filtered = filtered.filter((n) => n.important);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter((n) => n.type === typeFilter);
    }

    return filtered;
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const importantCount = notifications.filter((n) => n.important && !n.read).length;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Notifications & Alerts
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage system notifications and alerts
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<DoneAllIcon />}
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            Mark All Read
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteAll}
            disabled={filteredNotifications.length === 0}
          >
            Clear All
          </Button>
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        <Card>
          <Box sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <NotificationsIcon color="primary" />
              <Typography variant="body2" color="text.secondary">
                Total
              </Typography>
            </Stack>
            <Typography variant="h4" fontWeight="bold">
              {notifications.length}
            </Typography>
          </Box>
        </Card>
        <Card>
          <Box sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Badge badgeContent={unreadCount} color="error">
                <ActiveIcon color="warning" />
              </Badge>
              <Typography variant="body2" color="text.secondary">
                Unread
              </Typography>
            </Stack>
            <Typography variant="h4" fontWeight={700}>
              {unreadCount}
            </Typography>
          </Box>
        </Card>
      </Box>

      {/* Notifications List */}
      <Paper elevation={2}>
        <List>
          {notifications.map((notification) => (
            <React.Fragment key={notification.id}>
              <ListItem
                sx={{
                  bgcolor: notification.read ? 'inherit' : 'action.hover',
                  '&:hover': { bgcolor: 'action.selected' },
                }}
              >
                <ListItemText
                  primary={notification.title}
                  secondary={notification.message}
                />
                <Typography variant="caption" color="text.secondary">
                  {notification.timestamp}
                </Typography>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default NotificationsPage;
