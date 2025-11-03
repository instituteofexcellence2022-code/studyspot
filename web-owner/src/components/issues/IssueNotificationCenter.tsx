import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Badge,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Stack,
  Divider,
  Tooltip,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  Close as CloseIcon,
  MarkEmailRead as MarkEmailReadIcon,
  MarkEmailUnread as MarkEmailUnreadIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  BugReport as BugReportIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  PushPin as PushPinIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

interface Notification {
  id: string;
  type: 'issue_created' | 'issue_assigned' | 'issue_updated' | 'issue_resolved' | 'sla_breach' | 'escalation';
  title: string;
  message: string;
  issueId?: string;
  issueTitle?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  isPinned: boolean;
  createdAt: string;
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  actions?: NotificationAction[];
  metadata?: Record<string, any>;
}

interface NotificationAction {
  id: string;
  label: string;
  action: string;
  variant: 'contained' | 'outlined' | 'text';
  color: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
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
      id={`notification-tabpanel-${index}`}
      aria-labelledby={`notification-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

const IssueNotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Mock notifications for demonstration
  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'issue_created',
      title: 'New Issue Reported',
      message: 'A new technical issue has been reported by John Doe',
      issueId: 'issue-123',
      issueTitle: 'Login system not working',
      priority: 'high',
      isRead: false,
      isPinned: false,
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      senderId: 'user-456',
      senderName: 'John Doe',
      senderAvatar: '/avatars/john.jpg',
      actions: [
        { id: 'view', label: 'View Issue', action: 'view_issue', variant: 'contained', color: 'primary' },
        { id: 'assign', label: 'Assign', action: 'assign_issue', variant: 'outlined', color: 'secondary' },
      ],
    },
    {
      id: '2',
      type: 'sla_breach',
      title: 'SLA Breach Alert',
      message: 'Issue #1234 is approaching its SLA deadline',
      issueId: 'issue-1234',
      issueTitle: 'Air conditioning not working',
      priority: 'urgent',
      isRead: false,
      isPinned: true,
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      senderId: 'system',
      senderName: 'System',
      actions: [
        { id: 'escalate', label: 'Escalate', action: 'escalate_issue', variant: 'contained', color: 'error' },
        { id: 'view', label: 'View Issue', action: 'view_issue', variant: 'outlined', color: 'primary' },
      ],
    },
    {
      id: '3',
      type: 'issue_assigned',
      title: 'Issue Assigned to You',
      message: 'Issue #5678 has been assigned to you',
      issueId: 'issue-5678',
      issueTitle: 'WiFi connectivity issues',
      priority: 'medium',
      isRead: true,
      isPinned: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      senderId: 'manager-789',
      senderName: 'Sarah Manager',
      senderAvatar: '/avatars/sarah.jpg',
      actions: [
        { id: 'view', label: 'View Issue', action: 'view_issue', variant: 'contained', color: 'primary' },
      ],
    },
    {
      id: '4',
      type: 'issue_resolved',
      title: 'Issue Resolved',
      message: 'Issue #9012 has been resolved by Mike Johnson',
      issueId: 'issue-9012',
      issueTitle: 'Printer not working',
      priority: 'low',
      isRead: true,
      isPinned: false,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      senderId: 'mike-345',
      senderName: 'Mike Johnson',
      senderAvatar: '/avatars/mike.jpg',
      actions: [
        { id: 'view', label: 'View Issue', action: 'view_issue', variant: 'outlined', color: 'primary' },
        { id: 'feedback', label: 'Rate Resolution', action: 'rate_resolution', variant: 'outlined', color: 'success' },
      ],
    },
  ];

  useEffect(() => {
    // Initialize with mock data
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.isRead).length);

    // Simulate WebSocket connection for real-time notifications
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    // Mock WebSocket connection - replace with actual WebSocket URL
    setIsConnected(true);
    
    // Simulate receiving new notifications
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance of new notification
        const newNotification: Notification = {
          id: `notification-${Date.now()}`,
          type: 'issue_created',
          title: 'New Issue Reported',
          message: 'A new issue has been reported',
          priority: 'medium',
          isRead: false,
          isPinned: false,
          createdAt: new Date().toISOString(),
          senderId: 'system',
          senderName: 'System',
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
        setSnackbarMessage('New notification received!');
        setSnackbarOpen(true);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    toast.success('Notification marked as read');
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    setUnreadCount(0);
    toast.success('All notifications marked as read');
  };

  const handleDeleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    toast.success('Notification deleted');
  };

  const handleTogglePin = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isPinned: !notification.isPinned }
          : notification
      )
    );
  };

  const handleNotificationAction = (action: string, notification: Notification) => {
    switch (action) {
      case 'view_issue':
        toast.info(`Opening issue: ${notification.issueTitle}`);
        break;
      case 'assign_issue':
        toast.info('Opening assignment dialog');
        break;
      case 'escalate_issue':
        toast.warning('Escalating issue');
        break;
      case 'rate_resolution':
        toast.info('Opening rating dialog');
        break;
      default:
        toast.info(`Action: ${action}`);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'issue_created':
        return <BugReportIcon color="primary" />;
      case 'issue_assigned':
        return <AssignmentIcon color="info" />;
      case 'issue_updated':
        return <ScheduleIcon color="warning" />;
      case 'issue_resolved':
        return <CheckCircleIcon color="success" />;
      case 'sla_breach':
        return <WarningIcon color="error" />;
      case 'escalation':
        return <PersonIcon color="secondary" />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (activeTab) {
      case 0: // All
        return true;
      case 1: // Unread
        return !notification.isRead;
      case 2: // Pinned
        return notification.isPinned;
      case 3: // High Priority
        return notification.priority === 'high' || notification.priority === 'urgent';
      default:
        return true;
    }
  });

  return (
    <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon color="primary" />
              </Badge>
              <Typography variant="h6" fontWeight="bold">
                Issue Notifications
              </Typography>
              <Chip
                label={isConnected ? 'Connected' : 'Disconnected'}
                color={isConnected ? 'success' : 'error'}
                size="small"
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Mark all as read">
                <IconButton onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
                  <MarkEmailReadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Settings">
                <IconButton onClick={() => setSettingsOpen(true)}>
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Tabs value={activeTab} onChange={handleTabChange} aria-label="notification tabs">
            <Tab label={`All (${notifications.length})`} />
            <Tab label={`Unread (${unreadCount})`} />
            <Tab label={`Pinned (${notifications.filter(n => n.isPinned).length})`} />
            <Tab label="High Priority" />
          </Tabs>

          <TabPanel value={activeTab} index={0}>
            <List>
              {filteredNotifications.map((notification) => (
                <ListItem
                  key={notification.id}
                  sx={{
                    bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                    borderLeft: notification.isPinned ? 4 : 0,
                    borderLeftColor: 'primary.main',
                    mb: 1,
                    borderRadius: 1,
                  }}
                >
                  <ListItemIcon>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight={notification.isRead ? 'normal' : 'bold'}
                        >
                          {notification.title}
                        </Typography>
                        <Chip
                          label={notification.priority}
                          size="small"
                          color={getPriorityColor(notification.priority) as any}
                        />
                        {notification.isPinned && (
                          <PushPinIcon fontSize="small" color="primary" />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(notification.createdAt).toLocaleString()}
                        </Typography>
                        {notification.actions && notification.actions.length > 0 && (
                          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                            {notification.actions.map((action) => (
                              <Button
                                key={action.id}
                                size="small"
                                variant={action.variant}
                                color={action.color}
                                onClick={() => handleNotificationAction(action.action, notification)}
                              >
                                {action.label}
                              </Button>
                            ))}
                          </Stack>
                        )}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title={notification.isRead ? 'Mark as unread' : 'Mark as read'}>
                        <IconButton
                          size="small"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          {notification.isRead ? <MarkEmailUnreadIcon /> : <MarkEmailReadIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={notification.isPinned ? 'Unpin' : 'Pin'}>
                        <IconButton
                          size="small"
                          onClick={() => handleTogglePin(notification.id)}
                        >
                          <PushPinIcon color={notification.isPinned ? 'primary' : 'disabled'} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteNotification(notification.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
              {filteredNotifications.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No notifications found
                  </Typography>
                </Box>
              )}
            </List>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <List>
              {filteredNotifications.map((notification) => (
                <ListItem key={notification.id}>
                  <ListItemIcon>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={notification.title}
                    secondary={notification.message}
                  />
                </ListItem>
              ))}
            </List>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <List>
              {filteredNotifications.map((notification) => (
                <ListItem key={notification.id}>
                  <ListItemIcon>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={notification.title}
                    secondary={notification.message}
                  />
                </ListItem>
              ))}
            </List>
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <List>
              {filteredNotifications.map((notification) => (
                <ListItem key={notification.id}>
                  <ListItemIcon>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={notification.title}
                    secondary={notification.message}
                  />
                </ListItem>
              ))}
            </List>
          </TabPanel>
        </CardContent>
      </Card>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Notification Settings</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Configure your notification preferences for issue management.
          </Typography>
          {/* Add notification settings here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for new notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default IssueNotificationCenter;















