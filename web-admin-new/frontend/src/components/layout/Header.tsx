// ============================================
// HEADER COMPONENT
// ============================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Box,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Card,
  CardContent,
  Stack,
  Chip,
  Paper,
  LinearProgress,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Checkbox,
  TextareaAutosize,
  FormControl,
  InputLabel,
  Select,
  Alert,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications,
  AccountCircle,
  Settings,
  Logout,
  AdminPanelSettings,
  Email,
  Phone,
  LocationOn,
  Work,
  Security,
  Verified,
  Edit,
  Close,
  DarkMode,
  Language,
  NotificationsActive,
  Shield,
  Key,
  History,
  TrendingUp,
  Group,
  CheckCircle,
  CalendarToday,
  Assignment,
  Announcement,
  Note,
  Add,
  Delete,
  Person,
  AccessTime,
  EventAvailable,
  QrCodeScanner,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { logout } from '../../store/slices/authSlice';
import { ROUTES } from '../../config/constants';

interface HeaderProps {
  onMenuClick: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      {...other}
      sx={{ p: 3, height: '100%', overflow: 'auto' }}
    >
      {value === index && children}
    </Box>
  );
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null);
  const [notificationMenuAnchor, setNotificationMenuAnchor] = useState<null | HTMLElement>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profileTab, setProfileTab] = useState(0);
  const [newNote, setNewNote] = useState('');
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    task: '',
    priority: 'medium',
    dueDate: '',
    category: 'General'
  });
  
  // Messages state
  const [messageType, setMessageType] = useState<'group' | 'individual'>('group');
  const [messageFilter, setMessageFilter] = useState('all');
  const [newMessageOpen, setNewMessageOpen] = useState(false);
  const [newMessage, setNewMessage] = useState({
    to: '',
    subject: '',
    message: '',
    priority: 'medium',
    type: 'group' as 'group' | 'individual'
  });
  const [todos, setTodos] = useState([
    { id: 1, task: 'Review and approve 12 new tenant registrations', priority: 'high', dueDate: 'Today', completed: false, category: 'Tenants' },
    { id: 2, task: 'Update subscription pricing for Premium plan', priority: 'high', dueDate: 'Nov 3', completed: false, category: 'Finance' },
    { id: 3, task: 'Check student feedback from last week', priority: 'medium', dueDate: 'Nov 4', completed: false, category: 'Students' },
    { id: 4, task: 'Configure 2FA for security compliance', priority: 'high', dueDate: 'Nov 5', completed: false, category: 'Security' },
    { id: 5, task: 'Review revenue analytics report', priority: 'medium', dueDate: 'Nov 6', completed: true, category: 'Revenue' },
    { id: 6, task: 'Update admin user permissions', priority: 'low', dueDate: 'Nov 7', completed: true, category: 'Users' },
  ]);

  // Handlers
  const handleSaveProfile = () => {
    console.log('Saving profile changes...');
    setEditMode(false);
    alert('Profile updated successfully!');
  };

  const handleToggleTodo = (id: number) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const handleDeleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      console.log('Adding note:', newNote);
      alert('Note saved successfully!');
      setNewNote('');
    }
  };

  const handleChangePassword = () => {
    console.log('Opening change password dialog...');
    alert('Change Password feature - Would open password change dialog');
  };

  const handleEnable2FA = () => {
    console.log('Opening 2FA setup...');
    alert('Two-Factor Authentication setup - Would open 2FA configuration wizard');
  };

  const handleManageSessions = () => {
    console.log('Opening session management...');
    alert('Session Management - Would show all 12 active sessions with logout options');
  };

  const handleAddTask = () => {
    if (newTask.task.trim()) {
      const newTodo = {
        id: todos.length + 1,
        task: newTask.task,
        priority: newTask.priority,
        dueDate: newTask.dueDate || 'No due date',
        completed: false,
        category: newTask.category
      };
      setTodos([newTodo, ...todos]);
      setNewTask({ task: '', priority: 'medium', dueDate: '', category: 'General' });
      setAddTaskOpen(false);
      alert('Task added successfully!');
    }
  };

  const handleSendMessage = () => {
    if (newMessage.subject.trim() && newMessage.message.trim()) {
      console.log('Sending message:', newMessage);
      alert(`Message sent to ${newMessage.type === 'group' ? 'All Departments' : newMessage.to}!`);
      setNewMessage({ to: '', subject: '', message: '', priority: 'medium', type: 'group' });
      setNewMessageOpen(false);
    }
  };

  // Mock messages data
  const groupMessages = [
    {
      id: 1,
      from: 'Rajesh Kumar',
      department: 'Engineering',
      subject: 'QR Scanner Integration Update',
      preview: 'The QR code scanner module is ready for deployment. Can we schedule a review meeting this week?',
      message: 'The QR code scanner module is ready for deployment. Can we schedule a review meeting this week? We have completed testing and documentation.',
      time: '2 hours ago',
      unread: true,
      priority: 'high',
      avatar: 'R',
      type: 'group' as const
    },
    {
      id: 2,
      from: 'System Admin',
      department: 'All Departments',
      subject: 'Platform Maintenance Window',
      preview: 'Scheduled maintenance on Nov 5, 2025 from 2:00 AM to 4:00 AM IST.',
      message: 'Scheduled maintenance on Nov 5, 2025 from 2:00 AM to 4:00 AM IST. All services will be temporarily unavailable. Please plan accordingly.',
      time: '1 day ago',
      unread: true,
      priority: 'high',
      avatar: 'S',
      type: 'group' as const
    },
    {
      id: 3,
      from: 'Anjali Desai',
      department: 'Operations',
      subject: 'Weekly Team Sync',
      preview: 'Our weekly sync is scheduled for Friday at 3 PM. Please confirm attendance.',
      message: 'Our weekly sync is scheduled for Friday at 3 PM in Conference Room B. Please confirm attendance and prepare your updates.',
      time: '2 days ago',
      unread: false,
      priority: 'medium',
      avatar: 'A',
      type: 'group' as const
    },
  ];

  const individualMessages = [
    {
      id: 4,
      from: 'Priya Sharma',
      department: 'Finance',
      subject: 'Q4 Revenue Projections - Need Approval',
      preview: 'Please review the attached revenue projections for Q4. We need your approval by tomorrow.',
      message: 'Please review the attached revenue projections for Q4. We need your approval by tomorrow to proceed with budget allocation.',
      time: '5 hours ago',
      unread: true,
      priority: 'high',
      avatar: 'P',
      type: 'individual' as const,
      toMe: true
    },
    {
      id: 5,
      from: 'Vikram Patel',
      department: 'Customer Support',
      subject: 'Tenant Feedback Summary',
      preview: 'Compiled feedback from 45 tenants this month. Overall satisfaction is at 92%.',
      message: 'Compiled feedback from 45 tenants this month. Overall satisfaction is at 92%. Great work team! Detailed report attached.',
      time: '2 days ago',
      unread: false,
      priority: 'low',
      avatar: 'V',
      type: 'individual' as const,
      toMe: true
    },
    {
      id: 6,
      from: 'Sneha Reddy',
      department: 'Product',
      subject: 'Feature Request Discussion',
      preview: 'Can we discuss the bulk credit purchase feature? Several tenants have requested this.',
      message: 'Can we discuss the bulk credit purchase feature? Several tenants have requested this. Let me know your availability for a quick call.',
      time: '3 days ago',
      unread: false,
      priority: 'medium',
      avatar: 'S',
      type: 'individual' as const,
      toMe: true
    },
  ];

  const allMessages: any[] = messageType === 'group' ? groupMessages : individualMessages;

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleOpenProfileDialog = () => {
    setProfileMenuAnchor(null);
    setProfileDialogOpen(true);
  };

  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationMenuAnchor(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationMenuAnchor(null);
  };

  const handleLogout = async () => {
    handleProfileMenuClose();
    await dispatch(logout());
    navigate(ROUTES.LOGIN);
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: '#FFFFFF',
        color: 'text.primary',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <Toolbar>
        {/* Menu Icon */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        {/* Logo & Title */}
        <AdminPanelSettings sx={{ mr: 1, color: 'primary.main', fontSize: 28 }} />
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          STUDYSPOT
        </Typography>
        <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
          Admin Portal
        </Typography>

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Notifications */}
        <IconButton
          color="inherit"
          onClick={handleNotificationMenuOpen}
          sx={{ mr: 1 }}
        >
          <Badge badgeContent={3} color="error">
            <Notifications />
          </Badge>
        </IconButton>

        {/* QR Scanner Button */}
        <IconButton
          color="inherit"
          onClick={() => navigate('/staff-attendance')}
          sx={{ 
            mr: 1,
            '&:hover': {
              bgcolor: 'action.hover',
              color: 'success.main'
            }
          }}
          title="QR Scanner (Staff Attendance)"
        >
          <Badge badgeContent="QR" sx={{ '& .MuiBadge-badge': { fontSize: 9, height: 16, minWidth: 16, bgcolor: 'success.main' } }}>
            <QrCodeScanner />
          </Badge>
        </IconButton>

        {/* Settings Button */}
        <IconButton
          color="inherit"
          onClick={() => {
            console.log('Navigating to settings:', ROUTES.SETTINGS);
            navigate(ROUTES.SETTINGS);
          }}
          sx={{ 
            mr: 1,
            '&:hover': {
              bgcolor: 'action.hover',
              color: 'primary.main'
            }
          }}
          title="Settings"
        >
          <Settings />
        </IconButton>

        {/* Profile Menu */}
        <IconButton
          onClick={handleProfileMenuOpen}
          size="small"
          sx={{ ml: 1 }}
        >
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              width: 36,
              height: 36,
            }}
          >
            {user?.name?.charAt(0) || 'A'}
          </Avatar>
        </IconButton>

        {/* Notification Menu */}
        <Menu
          anchorEl={notificationMenuAnchor}
          open={Boolean(notificationMenuAnchor)}
          onClose={handleNotificationMenuClose}
        >
          <MenuItem>
            <Typography variant="body2">New tenant registered</Typography>
          </MenuItem>
          <MenuItem>
            <Typography variant="body2">Payment received</Typography>
          </MenuItem>
          <MenuItem>
            <Typography variant="body2">System update available</Typography>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleNotificationMenuClose}>
            <Typography variant="body2" color="primary">View All</Typography>
          </MenuItem>
        </Menu>

        {/* Profile Menu */}
        <Menu
          anchorEl={profileMenuAnchor}
          open={Boolean(profileMenuAnchor)}
          onClose={handleProfileMenuClose}
          PaperProps={{
            sx: { width: 280, mt: 1 }
          }}
        >
          <Box sx={{ px: 2, py: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  width: 56,
                  height: 56,
                  fontSize: '1.5rem',
                }}
              >
                {user?.name?.charAt(0) || 'A'}
              </Avatar>
              <Box>
                <Typography variant="body1" fontWeight="bold">
                  {user?.name || 'Admin User'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email || 'admin@studyspot.com'}
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip label="Super Admin" size="small" color="primary" icon={<Shield />} />
                </Box>
              </Box>
            </Stack>
          </Box>
          <Divider />
          <MenuItem onClick={handleOpenProfileDialog}>
            <AccountCircle sx={{ mr: 1 }} fontSize="small" />
            View Full Profile
          </MenuItem>
          <MenuItem onClick={() => { handleProfileMenuClose(); navigate(ROUTES.SETTINGS); }}>
            <Settings sx={{ mr: 1 }} fontSize="small" />
            Settings
          </MenuItem>
          <MenuItem onClick={() => { handleProfileMenuClose(); }}>
            <History sx={{ mr: 1 }} fontSize="small" />
            Activity Log
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <Logout sx={{ mr: 1 }} fontSize="small" />
            Logout
          </MenuItem>
        </Menu>

        {/* Comprehensive Professional Profile Dialog */}
        <Dialog 
          open={profileDialogOpen} 
          onClose={() => { setProfileDialogOpen(false); setEditMode(false); setProfileTab(0); }} 
          maxWidth="lg" 
          fullWidth
          PaperProps={{
            sx: { height: '90vh' }
          }}
        >
          <DialogTitle sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', pb: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <Box sx={{ width: 20, height: 20, bgcolor: 'success.main', borderRadius: '50%', border: 2, borderColor: 'white' }} />
                  }
                >
                  <Avatar
                    sx={{
                      bgcolor: 'white',
                      color: 'primary.main',
                      width: 72,
                      height: 72,
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      border: 3,
                      borderColor: 'rgba(255,255,255,0.5)',
                    }}
                  >
                    {user?.name?.charAt(0) || 'A'}
                  </Avatar>
                </Badge>
                <Box>
                  <Typography variant="h5" fontWeight="bold" sx={{ color: 'white' }}>
                    {user?.name || 'Admin User'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 1 }}>
                    {user?.email || 'admin@studyspot.com'}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip 
                      label="Super Admin" 
                      size="small" 
                      sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }} 
                      icon={<Shield sx={{ color: 'white !important' }} />} 
                    />
                    <Chip 
                      label="Verified" 
                      size="small" 
                      sx={{ bgcolor: 'rgba(76, 175, 80, 0.3)', color: 'white', fontWeight: 'bold' }} 
                      icon={<Verified sx={{ color: 'white !important' }} />} 
                    />
                    <Chip 
                      label="Online" 
                      size="small" 
                      sx={{ bgcolor: 'rgba(76, 175, 80, 0.3)', color: 'white', fontWeight: 'bold' }} 
                    />
                  </Stack>
                </Box>
              </Box>
              <IconButton onClick={() => { setProfileDialogOpen(false); setEditMode(false); setProfileTab(0); }} sx={{ color: 'white' }}>
                <Close />
              </IconButton>
            </Stack>
          </DialogTitle>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
            <Tabs 
              value={profileTab} 
              onChange={(_, newValue) => setProfileTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Overview" icon={<Person />} iconPosition="start" />
              <Tab label="Attendance" icon={<EventAvailable />} iconPosition="start" />
              <Tab label="Messages" icon={<Email />} iconPosition="start" />
              <Tab label="Notices" icon={<Announcement />} iconPosition="start" />
              <Tab label="To-Do" icon={<Assignment />} iconPosition="start" />
              <Tab label="Notes" icon={<Note />} iconPosition="start" />
              <Tab label="Settings" icon={<Settings />} iconPosition="start" />
            </Tabs>
          </Box>
          
          <DialogContent dividers sx={{ p: 0, bgcolor: 'grey.50', height: '100%' }}>
            {/* Tab 0: Overview */}
            <TabPanel value={profileTab} index={0}>
              {/* Quick Stats */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
                <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight="bold">156</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>Days Active</Typography>
                  </CardContent>
                </Card>
                <Card sx={{ background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)', color: 'white' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight="bold">1,234</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>Actions Taken</Typography>
                  </CardContent>
                </Card>
                <Card sx={{ background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)', color: 'white' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight="bold">89%</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>Login Rate</Typography>
                  </CardContent>
                </Card>
                <Card sx={{ background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)', color: 'white' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight="bold">12</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>Active Sessions</Typography>
                  </CardContent>
                </Card>
              </Box>

              {/* Personal Information */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">Personal Information</Typography>
                    <Button
                      size="small"
                      variant={editMode ? 'outlined' : 'contained'}
                      startIcon={editMode ? <Close /> : <Edit />}
                      onClick={() => setEditMode(!editMode)}
                    >
                      {editMode ? 'Cancel' : 'Edit Profile'}
                    </Button>
                  </Stack>

                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <Email fontSize="small" /> Email Address
                      </Typography>
                      {editMode ? (
                        <TextField size="small" fullWidth defaultValue={user?.email || 'admin@studyspot.com'} />
                      ) : (
                        <Typography variant="body1" fontWeight="bold">{user?.email || 'admin@studyspot.com'}</Typography>
                      )}
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <Phone fontSize="small" /> Phone Number
                      </Typography>
                      {editMode ? (
                        <TextField size="small" fullWidth defaultValue="+91 98765 43210" />
                      ) : (
                        <Typography variant="body1" fontWeight="bold">+91 98765 43210</Typography>
                      )}
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <Work fontSize="small" /> Role
                      </Typography>
                      <Chip label="Super Administrator" color="primary" size="small" />
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <LocationOn fontSize="small" /> Location
                      </Typography>
                      {editMode ? (
                        <TextField size="small" fullWidth defaultValue="Bangalore, India" />
                      ) : (
                        <Typography variant="body1" fontWeight="bold">Bangalore, India</Typography>
                      )}
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <CalendarToday fontSize="small" /> Joined Date
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">June 15, 2025</Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <CheckCircle fontSize="small" /> Status
                      </Typography>
                      <Chip label="Active" color="success" size="small" icon={<CheckCircle />} />
                    </Box>
                  </Box>

                  {editMode && (
                    <Box sx={{ mt: 3 }}>
                      <Button 
                        variant="contained" 
                        fullWidth 
                        size="large"
                        onClick={handleSaveProfile}
                      >
                        💾 Save Changes
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* Permissions & Access */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Security /> Permissions & Access Level
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
                    <Paper sx={{ p: 2.5, textAlign: 'center', border: 2, borderColor: 'success.main', bgcolor: 'success.50' }}>
                      <CheckCircle sx={{ color: 'success.main', fontSize: 48 }} />
                      <Typography variant="h6" fontWeight="bold" sx={{ mt: 1 }}>Full Access</Typography>
                      <Typography variant="caption" color="text.secondary">All Modules Enabled</Typography>
                    </Paper>
                    <Paper sx={{ p: 2.5, textAlign: 'center', border: 2, borderColor: 'info.main', bgcolor: 'info.50' }}>
                      <Group sx={{ color: 'info.main', fontSize: 48 }} />
                      <Typography variant="h6" fontWeight="bold" sx={{ mt: 1 }}>28,456</Typography>
                      <Typography variant="caption" color="text.secondary">Students Managed</Typography>
                    </Paper>
                    <Paper sx={{ p: 2.5, textAlign: 'center', border: 2, borderColor: 'warning.main', bgcolor: 'warning.50' }}>
                      <TrendingUp sx={{ color: 'warning.main', fontSize: 48 }} />
                      <Typography variant="h6" fontWeight="bold" sx={{ mt: 1 }}>4,567</Typography>
                      <Typography variant="caption" color="text.secondary">Actions This Month</Typography>
                    </Paper>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    📋 Module Access Rights
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                    {[
                      'Tenant Management',
                      'Student Management',
                      'Revenue & Billing',
                      'Credit Management',
                      'Analytics & Reports',
                      'System Administration',
                      'User Management',
                      'Settings & Config',
                      'Messaging & Templates',
                    ].map((module, idx) => (
                      <Paper key={idx} sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle fontSize="small" sx={{ color: 'success.main' }} />
                        <Typography variant="caption">{module}</Typography>
                      </Paper>
                    ))}
                  </Box>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <History /> Recent Activity Log
                  </Typography>
                  <List dense>
                    {[
                      { action: 'Created new subscription plan "Premium Plus"', time: '2 hours ago', icon: <CheckCircle />, color: 'success.main', module: 'Subscriptions' },
                      { action: 'Updated tenant settings for "Tech Academy"', time: '5 hours ago', icon: <Edit />, color: 'info.main', module: 'Tenants' },
                      { action: 'Exported revenue report (Oct 2025)', time: 'Yesterday', icon: <TrendingUp />, color: 'primary.main', module: 'Revenue' },
                      { action: 'Modified user permissions for 3 admins', time: '2 days ago', icon: <Security />, color: 'warning.main', module: 'Users' },
                      { action: 'System health check completed', time: '3 days ago', icon: <Shield />, color: 'success.main', module: 'System' },
                      { action: 'Generated 45 QR codes for libraries', time: '4 days ago', icon: <CheckCircle />, color: 'info.main', module: 'Operations' },
                      { action: 'Added 234 new students to platform', time: '5 days ago', icon: <Group />, color: 'success.main', module: 'Students' },
                    ].map((activity, idx) => (
                      <ListItem key={idx} sx={{ px: 0, py: 1 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: activity.color }}>
                            {activity.icon}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={activity.action}
                          secondary={
                            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                              <Chip label={activity.time} size="small" variant="outlined" />
                              <Chip label={activity.module} size="small" color="primary" variant="outlined" />
                            </Stack>
                          }
                          primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </TabPanel>

            {/* Tab 1: Attendance */}
            <TabPanel value={profileTab} index={1}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    📅 My Attendance Record
                  </Typography>
                  
                  {/* Attendance Summary */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50', border: 1, borderColor: 'success.main' }}>
                      <Typography variant="h4" fontWeight="bold" color="success.main">95.2%</Typography>
                      <Typography variant="caption">Attendance Rate</Typography>
                    </Paper>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.50', border: 1, borderColor: 'info.main' }}>
                      <Typography variant="h4" fontWeight="bold" color="info.main">23/24</Typography>
                      <Typography variant="caption">Days Present</Typography>
                    </Paper>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.50', border: 1, borderColor: 'warning.main' }}>
                      <Typography variant="h4" fontWeight="bold" color="warning.main">2</Typography>
                      <Typography variant="caption">Late Arrivals</Typography>
                    </Paper>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.50', border: 1, borderColor: 'primary.main' }}>
                      <Typography variant="h4" fontWeight="bold" color="primary.main">9.2h</Typography>
                      <Typography variant="caption">Avg Work Hours</Typography>
                    </Paper>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* This Week */}
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    📊 This Week (Oct 28 - Nov 2)
                  </Typography>
                  <Stack spacing={1.5}>
                    {[
                      { date: 'Nov 2 (Sat)', checkIn: '09:00 AM', checkOut: '06:15 PM', duration: '9h 15m', status: 'present' },
                      { date: 'Nov 1 (Fri)', checkIn: '08:45 AM', checkOut: '06:00 PM', duration: '9h 15m', status: 'present' },
                      { date: 'Oct 31 (Thu)', checkIn: '09:30 AM', checkOut: '06:00 PM', duration: '8h 30m', status: 'late' },
                      { date: 'Oct 30 (Wed)', checkIn: '09:00 AM', checkOut: '06:30 PM', duration: '9h 30m', status: 'present' },
                      { date: 'Oct 29 (Tue)', checkIn: '08:50 AM', checkOut: '06:10 PM', duration: '9h 20m', status: 'present' },
                      { date: 'Oct 28 (Mon)', checkIn: '09:10 AM', checkOut: '06:00 PM', duration: '8h 50m', status: 'late' },
                    ].map((day, idx) => (
                      <Paper key={idx} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Chip 
                            label={day.status === 'present' ? '✅ Present' : '⏰ Late'} 
                            size="small" 
                            color={day.status === 'present' ? 'success' : 'warning'}
                          />
                          <Typography variant="body2" fontWeight="bold">{day.date}</Typography>
                        </Stack>
                        <Stack direction="row" spacing={2}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary">Check-In</Typography>
                            <Typography variant="body2" fontWeight="bold">{day.checkIn}</Typography>
                          </Box>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary">Check-Out</Typography>
                            <Typography variant="body2" fontWeight="bold">{day.checkOut}</Typography>
                          </Box>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary">Duration</Typography>
                            <Typography variant="body2" fontWeight="bold" color="info.main">{day.duration}</Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </TabPanel>

            {/* Tab 2: Messages */}
            <TabPanel value={profileTab} index={2}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        💬 Interdepartment Messages
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Communicate with team members across departments
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Chip 
                        label={`${allMessages.filter((m: any) => m.unread).length} Unread`} 
                        size="small" 
                        color="error" 
                      />
                      <Button 
                        variant="contained" 
                        size="small" 
                        startIcon={<Add />}
                        onClick={() => setNewMessageOpen(true)}
                      >
                        New Message
                      </Button>
                    </Stack>
                  </Stack>

                  {/* Message Type Toggle */}
                  <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <Button
                      variant={messageType === 'group' ? 'contained' : 'outlined'}
                      onClick={() => setMessageType('group')}
                      startIcon={<Group />}
                      fullWidth
                    >
                      Group Messages ({groupMessages.length})
                    </Button>
                    <Button
                      variant={messageType === 'individual' ? 'contained' : 'outlined'}
                      onClick={() => setMessageType('individual')}
                      startIcon={<Person />}
                      fullWidth
                    >
                      Individual Messages ({individualMessages.length})
                    </Button>
                  </Stack>

                  {/* Quick Filters */}
                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Chip 
                      label="All" 
                      size="small" 
                      variant={messageFilter === 'all' ? 'filled' : 'outlined'}
                      color={messageFilter === 'all' ? 'primary' : 'default'}
                      onClick={() => setMessageFilter('all')}
                      sx={{ cursor: 'pointer' }}
                    />
                    <Chip 
                      label="Unread" 
                      size="small" 
                      variant={messageFilter === 'unread' ? 'filled' : 'outlined'}
                      color={messageFilter === 'unread' ? 'primary' : 'default'}
                      onClick={() => setMessageFilter('unread')}
                      sx={{ cursor: 'pointer' }}
                    />
                    <Chip 
                      label="Important" 
                      size="small" 
                      variant={messageFilter === 'important' ? 'filled' : 'outlined'}
                      color={messageFilter === 'important' ? 'primary' : 'default'}
                      onClick={() => setMessageFilter('important')}
                      sx={{ cursor: 'pointer' }}
                    />
                  </Stack>

                  {/* Message Type Indicator */}
                  <Alert severity={messageType === 'group' ? 'info' : 'success'} sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      {messageType === 'group' 
                        ? '👥 Viewing messages sent to all departments. Everyone can see these messages.'
                        : '👤 Viewing messages sent only to you. These are private messages.'}
                    </Typography>
                  </Alert>

                  <Divider sx={{ my: 2 }} />

                  {/* New Message Form */}
                  {newMessageOpen && (
                    <Card sx={{ mb: 3, border: 2, borderColor: 'primary.main', bgcolor: 'primary.50' }}>
                      <CardContent>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                          ✉️ Compose New Message
                        </Typography>
                        <Stack spacing={2}>
                          <Stack direction="row" spacing={2}>
                            <Button
                              variant={newMessage.type === 'group' ? 'contained' : 'outlined'}
                              onClick={() => setNewMessage({ ...newMessage, type: 'group' })}
                              startIcon={<Group />}
                              size="small"
                            >
                              Group (All Depts)
                            </Button>
                            <Button
                              variant={newMessage.type === 'individual' ? 'contained' : 'outlined'}
                              onClick={() => setNewMessage({ ...newMessage, type: 'individual' })}
                              startIcon={<Person />}
                              size="small"
                            >
                              Individual
                            </Button>
                          </Stack>

                          {newMessage.type === 'individual' && (
                            <FormControl fullWidth size="small">
                              <InputLabel>Send To (Department/Person)</InputLabel>
                              <Select 
                                value={newMessage.to}
                                onChange={(e) => setNewMessage({ ...newMessage, to: e.target.value })}
                                label="Send To (Department/Person)"
                              >
                                <MenuItem value="Engineering">Engineering Department</MenuItem>
                                <MenuItem value="Finance">Finance Department</MenuItem>
                                <MenuItem value="Operations">Operations Department</MenuItem>
                                <MenuItem value="Product">Product Department</MenuItem>
                                <MenuItem value="Customer Support">Customer Support</MenuItem>
                                <MenuItem value="HR">HR Department</MenuItem>
                                <MenuItem value="Sales">Sales & Marketing</MenuItem>
                              </Select>
                            </FormControl>
                          )}

                          <TextField
                            fullWidth
                            size="small"
                            label="Subject"
                            placeholder="Enter message subject..."
                            value={newMessage.subject}
                            onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                          />

                          <FormControl fullWidth size="small">
                            <InputLabel>Priority</InputLabel>
                            <Select 
                              value={newMessage.priority}
                              onChange={(e) => setNewMessage({ ...newMessage, priority: e.target.value })}
                              label="Priority"
                            >
                              <MenuItem value="high">🔴 High</MenuItem>
                              <MenuItem value="medium">🟡 Medium</MenuItem>
                              <MenuItem value="low">🟢 Low</MenuItem>
                            </Select>
                          </FormControl>

                          <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Message"
                            placeholder="Type your message here..."
                            value={newMessage.message}
                            onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
                          />

                          <Stack direction="row" spacing={1}>
                            <Button 
                              variant="contained" 
                              fullWidth 
                              startIcon={<Email />}
                              onClick={handleSendMessage}
                              disabled={!newMessage.subject.trim() || !newMessage.message.trim() || (newMessage.type === 'individual' && !newMessage.to)}
                            >
                              Send Message
                            </Button>
                            <Button 
                              variant="outlined" 
                              onClick={() => {
                                setNewMessageOpen(false);
                                setNewMessage({ to: '', subject: '', message: '', priority: 'medium', type: 'group' });
                              }}
                            >
                              Cancel
                            </Button>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  )}

                  {/* Message List */}
                  <Stack spacing={2}>
                    {allMessages
                      .filter((m: any) => {
                        if (messageFilter === 'unread') return m.unread;
                        if (messageFilter === 'important') return m.priority === 'high';
                        return true;
                      })
                      .map((message: any, idx: number) => (
                      <Paper 
                        key={idx} 
                        sx={{ 
                          p: 2, 
                          border: 1, 
                          borderColor: message.unread ? 'primary.main' : 'grey.300',
                          bgcolor: message.unread ? 'primary.50' : 'white',
                          cursor: 'pointer',
                          '&:hover': {
                            boxShadow: 3,
                            transform: 'translateY(-2px)',
                            transition: 'all 0.2s'
                          }
                        }}
                      >
                        <Stack direction="row" spacing={2}>
                          {/* Avatar */}
                          <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                            badgeContent={
                              message.unread ? (
                                <Box sx={{ width: 12, height: 12, bgcolor: 'error.main', borderRadius: '50%', border: 2, borderColor: 'white' }} />
                              ) : null
                            }
                          >
                            <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48, fontSize: '1.2rem' }}>
                              {message.avatar}
                            </Avatar>
                          </Badge>

                          {/* Message Content */}
                          <Box sx={{ flex: 1 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 0.5 }}>
                              <Box>
                                <Typography variant="body1" fontWeight={message.unread ? 'bold' : 'normal'}>
                                  {message.from}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {message.department} Department
                                </Typography>
                              </Box>
                              <Stack direction="row" spacing={1} alignItems="center">
                                {message.priority === 'high' && (
                                  <Chip label="HIGH" size="small" color="error" />
                                )}
                                <Typography variant="caption" color="text.secondary">
                                  {message.time}
                                </Typography>
                              </Stack>
                            </Stack>
                            
                            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5 }}>
                              {message.subject}
                            </Typography>
                            
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ 
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                              }}
                            >
                              {message.preview}
                            </Typography>

                            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                              <Button size="small" variant="outlined" startIcon={<Email />}>
                                Reply
                              </Button>
                              <Button size="small" variant="text">
                                Archive
                              </Button>
                            </Stack>
                          </Box>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </TabPanel>

            {/* Tab 3: Notices */}
            <TabPanel value={profileTab} index={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Announcement /> Notices Received
                  </Typography>
                  
                  <Stack spacing={2}>
                    {[
                      { 
                        title: 'Platform Maintenance Scheduled', 
                        from: 'System Admin', 
                        date: 'Nov 1, 2025', 
                        priority: 'high',
                        message: 'Scheduled maintenance on Nov 5, 2025 from 2:00 AM to 4:00 AM IST. Platform will be temporarily unavailable.',
                        read: false
                      },
                      { 
                        title: 'New Feature: QR Code Scanner Released', 
                        from: 'Product Team', 
                        date: 'Oct 30, 2025', 
                        priority: 'medium',
                        message: 'Staff attendance QR code scanner is now live. Check the documentation for implementation details.',
                        read: true
                      },
                      { 
                        title: 'Security Policy Update', 
                        from: 'Security Team', 
                        date: 'Oct 28, 2025', 
                        priority: 'high',
                        message: 'Mandatory 2FA will be enforced from Nov 10, 2025. Please configure it in your profile settings.',
                        read: false
                      },
                      { 
                        title: 'Monthly Performance Review Meeting', 
                        from: 'HR Department', 
                        date: 'Oct 25, 2025', 
                        priority: 'low',
                        message: 'Performance review meeting scheduled for Nov 8, 2025 at 3:00 PM in Conference Room A.',
                        read: true
                      },
                    ].map((notice, idx) => (
                      <Card 
                        key={idx} 
                        sx={{ 
                          border: 2, 
                          borderColor: !notice.read ? 'primary.main' : 'grey.300',
                          bgcolor: !notice.read ? 'primary.50' : 'white'
                        }}
                      >
                        <CardContent>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                            <Box sx={{ flex: 1 }}>
                              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                <Typography variant="body1" fontWeight="bold">{notice.title}</Typography>
                                {!notice.read && <Chip label="NEW" size="small" color="error" />}
                              </Stack>
                              <Typography variant="caption" color="text.secondary">
                                From: {notice.from} • {notice.date}
                              </Typography>
                            </Box>
                            <Chip 
                              label={notice.priority.toUpperCase()} 
                              size="small" 
                              color={notice.priority === 'high' ? 'error' : notice.priority === 'medium' ? 'warning' : 'default'}
                            />
                          </Stack>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {notice.message}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </TabPanel>

            {/* Tab 4: To-Do */}
            <TabPanel value={profileTab} index={4}>
              <Card>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Assignment /> My To-Do List
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {todos.filter(t => !t.completed).length} pending • {todos.filter(t => t.completed).length} completed
                      </Typography>
                    </Box>
                    <Button 
                      variant="contained" 
                      size="small" 
                      startIcon={<Add />}
                      onClick={() => setAddTaskOpen(true)}
                    >
                      Add Task
                    </Button>
                  </Stack>

                  {/* Add Task Form */}
                  {addTaskOpen && (
                    <Card sx={{ mb: 3, border: 2, borderColor: 'primary.main', bgcolor: 'primary.50' }}>
                      <CardContent>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                          ➕ Create New Task
                        </Typography>
                        <Stack spacing={2}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Task Description"
                            placeholder="Enter task details..."
                            value={newTask.task}
                            onChange={(e) => setNewTask({ ...newTask, task: e.target.value })}
                          />
                          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Priority</InputLabel>
                              <Select 
                                value={newTask.priority}
                                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                label="Priority"
                              >
                                <MenuItem value="high">🔴 High</MenuItem>
                                <MenuItem value="medium">🟡 Medium</MenuItem>
                                <MenuItem value="low">🟢 Low</MenuItem>
                              </Select>
                            </FormControl>
                            <FormControl fullWidth size="small">
                              <InputLabel>Category</InputLabel>
                              <Select 
                                value={newTask.category}
                                onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                                label="Category"
                              >
                                <MenuItem value="Tenants">Tenants</MenuItem>
                                <MenuItem value="Students">Students</MenuItem>
                                <MenuItem value="Finance">Finance</MenuItem>
                                <MenuItem value="Security">Security</MenuItem>
                                <MenuItem value="Revenue">Revenue</MenuItem>
                                <MenuItem value="Users">Users</MenuItem>
                                <MenuItem value="General">General</MenuItem>
                              </Select>
                            </FormControl>
                            <TextField
                              fullWidth
                              size="small"
                              label="Due Date"
                              type="date"
                              value={newTask.dueDate}
                              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                              InputLabelProps={{ shrink: true }}
                            />
                          </Box>
                          <Stack direction="row" spacing={1}>
                            <Button 
                              variant="contained" 
                              fullWidth 
                              startIcon={<Add />}
                              onClick={handleAddTask}
                              disabled={!newTask.task.trim()}
                            >
                              Create Task
                            </Button>
                            <Button 
                              variant="outlined" 
                              onClick={() => {
                                setAddTaskOpen(false);
                                setNewTask({ task: '', priority: 'medium', dueDate: '', category: 'General' });
                              }}
                            >
                              Cancel
                            </Button>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  )}

                  <Stack spacing={2}>
                    {todos.map((todo) => (
                      <Paper 
                        key={todo.id} 
                        sx={{ 
                          p: 2, 
                          border: 1, 
                          borderColor: todo.completed ? 'grey.300' : todo.priority === 'high' ? 'error.main' : 'primary.main',
                          opacity: todo.completed ? 0.6 : 1
                        }}
                      >
                        <Stack direction="row" spacing={2} alignItems="flex-start">
                          <Checkbox 
                            checked={todo.completed} 
                            onChange={() => handleToggleTodo(todo.id)}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography 
                              variant="body1" 
                              fontWeight="bold"
                              sx={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
                            >
                              {todo.task}
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                              <Chip 
                                label={todo.priority.toUpperCase()} 
                                size="small" 
                                color={todo.priority === 'high' ? 'error' : todo.priority === 'medium' ? 'warning' : 'default'}
                              />
                              <Chip label={todo.category} size="small" variant="outlined" />
                              <Chip 
                                label={`📅 ${todo.dueDate}`} 
                                size="small" 
                                color={todo.dueDate === 'Today' ? 'error' : 'default'}
                                variant="outlined"
                              />
                            </Stack>
                          </Box>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDeleteTodo(todo.id)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </TabPanel>

            {/* Tab 5: Notes */}
            <TabPanel value={profileTab} index={5}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    📝 My Notes
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      placeholder="Add a new note..."
                      variant="outlined"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                    />
                    <Button 
                      variant="contained" 
                      sx={{ mt: 1 }} 
                      startIcon={<Add />}
                      onClick={handleAddNote}
                      disabled={!newNote.trim()}
                    >
                      Save Note
                    </Button>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Recent Notes
                  </Typography>
                  <Stack spacing={2}>
                    {[
                      { note: 'Need to discuss new pricing strategy with finance team. Current Premium plan conversion is at 23% which is below target.', date: 'Nov 1, 2025 - 3:45 PM', tags: ['Finance', 'Strategy'] },
                      { note: 'Follow up with Tech Academy regarding their bulk subscription request for 500 students. They want custom pricing.', date: 'Oct 30, 2025 - 11:20 AM', tags: ['Sales', 'Tenants'] },
                      { note: 'Check with engineering team about QR code scanner integration timeline. Expected completion: Nov 15.', date: 'Oct 28, 2025 - 2:15 PM', tags: ['Engineering', 'Features'] },
                    ].map((item, idx) => (
                      <Paper key={idx} sx={{ p: 2, border: 1, borderColor: 'grey.300' }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>{item.note}</Typography>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Stack direction="row" spacing={1}>
                            {item.tags.map((tag, tagIdx) => (
                              <Chip key={tagIdx} label={tag} size="small" variant="outlined" />
                            ))}
                          </Stack>
                          <Stack direction="row" spacing={1}>
                            <Typography variant="caption" color="text.secondary">
                              <AccessTime fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                              {item.date}
                            </Typography>
                            <IconButton size="small" color="error">
                              <Delete fontSize="small" />
                            </IconButton>
                          </Stack>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    👔 Notes from Senior/Manager
                  </Typography>
                  
                  <Stack spacing={2}>
                    {[
                      { 
                        from: 'Priya Sharma (CEO)', 
                        note: 'Great job on the Q3 subscription growth! The 45% increase is impressive. Keep up the excellent work on tenant onboarding automation.',
                        date: 'Oct 29, 2025',
                        type: 'appreciation'
                      },
                      { 
                        from: 'Rajesh Kumar (CTO)', 
                        note: 'Please prioritize the QR code scanner deployment. We have 5 libraries waiting for this feature. Target completion: Nov 10.',
                        date: 'Oct 26, 2025',
                        type: 'task'
                      },
                      { 
                        from: 'Anjali Desai (COO)', 
                        note: 'The new credit management system is working perfectly. Revenue tracking improved by 30%. Consider adding bulk purchase features.',
                        date: 'Oct 20, 2025',
                        type: 'feedback'
                      },
                    ].map((seniorNote, idx) => (
                      <Paper 
                        key={idx} 
                        sx={{ 
                          p: 2.5, 
                          border: 2, 
                          borderColor: seniorNote.type === 'appreciation' ? 'success.main' : seniorNote.type === 'task' ? 'error.main' : 'info.main',
                          bgcolor: seniorNote.type === 'appreciation' ? 'success.50' : seniorNote.type === 'task' ? 'error.50' : 'info.50'
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                            {seniorNote.from.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">{seniorNote.from}</Typography>
                            <Typography variant="caption" color="text.secondary">{seniorNote.date}</Typography>
                          </Box>
                          <Chip 
                            label={seniorNote.type.toUpperCase()} 
                            size="small" 
                            color={seniorNote.type === 'appreciation' ? 'success' : seniorNote.type === 'task' ? 'error' : 'info'}
                          />
                        </Stack>
                        <Typography variant="body2" sx={{ fontStyle: 'italic', pl: 5 }}>
                          "{seniorNote.note}"
                        </Typography>
                      </Paper>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </TabPanel>

            {/* Tab 6: Settings */}
            <TabPanel value={profileTab} index={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Settings /> Quick Settings & Preferences
                  </Typography>
                  
                  <Stack spacing={2}>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DarkMode fontSize="small" />
                          <Typography variant="body2" fontWeight={500}>Dark Mode</Typography>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <NotificationsActive fontSize="small" />
                          <Typography variant="body2" fontWeight={500}>Email Notifications</Typography>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      control={<Switch />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Language fontSize="small" />
                          <Typography variant="body2" fontWeight={500}>Auto-translate Content</Typography>
                        </Box>
                      }
                    />
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      🔒 Security Actions
                    </Typography>
                    <Stack spacing={1}>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<Key />}
                        sx={{ justifyContent: 'flex-start' }}
                        onClick={handleChangePassword}
                      >
                        Change Password
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<Security />}
                        color="warning"
                        sx={{ justifyContent: 'flex-start' }}
                        onClick={handleEnable2FA}
                      >
                        Enable Two-Factor Authentication
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<Shield />}
                        sx={{ justifyContent: 'flex-start' }}
                        onClick={handleManageSessions}
                      >
                        Manage Active Sessions (12)
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </TabPanel>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2, bgcolor: 'grey.100' }}>
            <Button onClick={() => { setProfileDialogOpen(false); setEditMode(false); setProfileTab(0); }} size="large">
              Close
            </Button>
            <Button 
              variant="contained" 
              onClick={() => { setProfileDialogOpen(false); navigate(ROUTES.SETTINGS); }}
              startIcon={<Settings />}
              size="large"
            >
              Full Settings
            </Button>
          </DialogActions>
        </Dialog>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
