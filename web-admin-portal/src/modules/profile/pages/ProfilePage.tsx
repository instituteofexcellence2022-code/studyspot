// ============================================
// USER PROFILE PAGE
// ============================================

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Stack,
  Divider,
  Tab,
  Tabs,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
} from '@mui/material';
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Lock as LockIcon,
  Notifications as NotificationsIcon,
  History as HistoryIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  PhotoCamera as PhotoCameraIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAppSelector } from '../../../hooks/redux';

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
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ProfilePage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [currentTab, setCurrentTab] = useState(0);

  // Profile form state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);

  // Activity log (mock data)
  const activityLog = [
    { action: 'Updated user profile', timestamp: '2024-10-30 09:15:00', ip: '192.168.1.1' },
    { action: 'Changed password', timestamp: '2024-10-28 14:30:00', ip: '192.168.1.1' },
    { action: 'Logged in', timestamp: '2024-10-30 08:00:00', ip: '192.168.1.1' },
    { action: 'Created new tenant', timestamp: '2024-10-29 16:45:00', ip: '192.168.1.1' },
    { action: 'Updated user permissions', timestamp: '2024-10-27 11:20:00', ip: '192.168.1.1' },
  ];

  const handleSaveProfile = () => {
    toast.success('Profile updated successfully!');
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters!');
      return;
    }
    toast.success('Password changed successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSaveNotifications = () => {
    toast.success('Notification preferences saved!');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          My Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account settings and preferences
        </Typography>
      </Box>

      {/* Profile Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: 'primary.main',
                  fontSize: '2.5rem',
                }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <IconButton
                size="small"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: 'background.paper',
                  '&:hover': { bgcolor: 'background.paper' },
                }}
              >
                <PhotoCameraIcon fontSize="small" />
              </IconButton>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {user?.name}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                <Chip
                  label={user?.role.replace('_', ' ')}
                  size="small"
                  color="primary"
                  sx={{ textTransform: 'capitalize' }}
                />
                <Chip
                  label={user?.status}
                  size="small"
                  color="success"
                  sx={{ textTransform: 'capitalize' }}
                />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                <EmailIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                {user?.email}
              </Typography>
              {user?.tenantName && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  <BusinessIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                  {user.tenantName}
                </Typography>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
            <Tab label="Profile" icon={<PersonIcon />} iconPosition="start" />
            <Tab label="Security" icon={<LockIcon />} iconPosition="start" />
            <Tab label="Notifications" icon={<NotificationsIcon />} iconPosition="start" />
            <Tab label="Activity" icon={<HistoryIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Profile Tab */}
        <TabPanel value={currentTab} index={0}>
          <Stack spacing={3}>
            <Typography variant="h6" fontWeight="bold">
              Personal Information
            </Typography>
            <Divider />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <TextField
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
              />
              <TextField
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
              />
              <TextField
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                fullWidth
                placeholder="+1 (555) 123-4567"
              />
              <TextField
                label="Role"
                value={user?.role.replace('_', ' ')}
                fullWidth
                disabled
                sx={{ textTransform: 'capitalize' }}
              />
            </Box>

            <TextField
              label="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              fullWidth
              multiline
              rows={4}
              placeholder="Tell us about yourself..."
            />

            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <CalendarIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                <strong>Member since:</strong> {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                <CalendarIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                <strong>Last updated:</strong> {user?.updatedAt ? formatDate(user.updatedAt) : 'N/A'}
              </Typography>
            </Box>

            <Box>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveProfile}
              >
                Save Changes
              </Button>
            </Box>
          </Stack>
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={currentTab} index={1}>
          <Stack spacing={3}>
            <Typography variant="h6" fontWeight="bold">
              Change Password
            </Typography>
            <Divider />

            <TextField
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              fullWidth
            />
            <TextField
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              helperText="Must be at least 8 characters"
            />
            <TextField
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
            />

            <Alert severity="info">
              <strong>Password Requirements:</strong>
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                <li>At least 8 characters</li>
                <li>Include uppercase and lowercase letters</li>
                <li>Include at least one number</li>
                <li>Include at least one special character</li>
              </ul>
            </Alert>

            <Box>
              <Button
                variant="contained"
                startIcon={<LockIcon />}
                onClick={handleChangePassword}
              >
                Change Password
              </Button>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" fontWeight="bold">
              Two-Factor Authentication
            </Typography>
            <Alert severity="success">
              <strong>Enabled</strong> - Your account is protected with two-factor authentication.
            </Alert>
            <Button variant="outlined" color="error">
              Disable Two-Factor Authentication
            </Button>
          </Stack>
        </TabPanel>

        {/* Notifications Tab */}
        <TabPanel value={currentTab} index={2}>
          <Stack spacing={3}>
            <Typography variant="h6" fontWeight="bold">
              Notification Preferences
            </Typography>
            <Divider />

            <Box>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      Email Notifications
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Receive email notifications for important updates
                    </Typography>
                  </Box>
                  <Button
                    variant={emailNotifications ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setEmailNotifications(!emailNotifications)}
                  >
                    {emailNotifications ? 'Enabled' : 'Disabled'}
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      Push Notifications
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Receive browser push notifications
                    </Typography>
                  </Box>
                  <Button
                    variant={pushNotifications ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setPushNotifications(!pushNotifications)}
                  >
                    {pushNotifications ? 'Enabled' : 'Disabled'}
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      Weekly Reports
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Receive weekly summary reports via email
                    </Typography>
                  </Box>
                  <Button
                    variant={weeklyReport ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setWeeklyReport(!weeklyReport)}
                  >
                    {weeklyReport ? 'Enabled' : 'Disabled'}
                  </Button>
                </Box>
              </Stack>
            </Box>

            <Box>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveNotifications}
              >
                Save Preferences
              </Button>
            </Box>
          </Stack>
        </TabPanel>

        {/* Activity Tab */}
        <TabPanel value={currentTab} index={3}>
          <Stack spacing={3}>
            <Typography variant="h6" fontWeight="bold">
              Recent Activity
            </Typography>
            <Divider />

            <List>
              {activityLog.map((activity, index) => (
                <ListItem
                  key={index}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <ListItemIcon>
                    <HistoryIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={activity.action}
                    secondary={
                      <>
                        <Typography variant="body2" component="span" color="text.secondary">
                          {formatDate(activity.timestamp)}
                        </Typography>
                        <Typography variant="body2" component="span" color="text.secondary" sx={{ ml: 2 }}>
                          IP: {activity.ip}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>

            <Alert severity="info">
              <strong>Privacy Notice:</strong> Your activity is logged for security purposes. This data is kept for 90 days.
            </Alert>
          </Stack>
        </TabPanel>
      </Card>
    </Box>
  );
};

export default ProfilePage;

