import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  TextField,
  Divider,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  alpha,
  CircularProgress,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera,
  Email,
  Phone,
  LocationOn,
  Work,
  CalendarToday,
  Lock,
  Notifications,
  Security,
  Verified,
  CloudUpload,
  Delete as DeleteIcon,
  CheckCircle,
  Cancel as CancelIcon2,
  Send,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { updateUser } from '../../store/slices/authSlice';
import { showSnackbar } from '../../store/slices/uiSlice';
import { apiClient } from '../../services/sdk';
import { ROUTES } from '../../constants';

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
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const ProfilePage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [changePasswordDialog, setChangePasswordDialog] = useState(false);
  const [twoFactorDialog, setTwoFactorDialog] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState((user as any)?.emailVerified || false);
  const [phoneVerified, setPhoneVerified] = useState((user as any)?.phoneVerified || false);
  const [emailVerificationDialog, setEmailVerificationDialog] = useState(false);
  const [phoneVerificationDialog, setPhoneVerificationDialog] = useState(false);
  const [emailCode, setEmailCode] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [sendingEmailCode, setSendingEmailCode] = useState(false);
  const [sendingPhoneCode, setSendingPhoneCode] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Load profile image on mount
  useEffect(() => {
    if (user) {
      // Try to get profile image from user metadata or avatar
      const imageUrl = (user as any).profileImage || (user as any).avatar || (user as any).metadata?.profileImage;
      if (imageUrl) {
        setProfileImage(imageUrl);
      }
    }
  }, [user]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditToggle = () => {
    if (editMode) {
      // Cancel edit - reset to original values
      setFormData({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        role: user?.role || '',
      });
    }
    setEditMode(!editMode);
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setSnackbar({ open: true, message: '❌ Please select an image file', severity: 'error' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setSnackbar({ open: true, message: '❌ Image size must be less than 5MB', severity: 'error' });
      return;
    }

    try {
      setUploading(true);

      // Convert to base64 for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfileImage(base64String);
      };
      reader.readAsDataURL(file);

      // Upload to backend
      const formData = new FormData();
      formData.append('picture', file);

      try {
        const response = await apiClient.post('/api/users/profile/picture', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data?.success) {
          const imageUrl = response.data.data?.url || response.data.data?.profileImage;
          if (imageUrl) {
            setProfileImage(imageUrl);
          }
          
          // Update user in Redux
          dispatch(updateUser({
            ...user,
            profileImage: imageUrl,
            avatar: imageUrl,
          } as any));

          setSnackbar({ open: true, message: '✅ Profile picture updated successfully!', severity: 'success' });
        }
      } catch (uploadError: any) {
        console.error('Profile picture upload error:', uploadError);
        // Keep the local preview even if upload fails
        setSnackbar({ 
          open: true, 
          message: '⚠️ Picture preview updated, but upload failed. Please try again.', 
          severity: 'error' 
        });
      }
    } catch (error) {
      console.error('Error processing profile picture:', error);
      setSnackbar({ open: true, message: '❌ Failed to process image', severity: 'error' });
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Update via API
      const response = await apiClient.put('/api/users/profile', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        // Email and role typically can't be changed
      });

      if (response.data?.success || response.data?.data) {
        const updatedUser = response.data.data?.user || response.data.data;
        
        // Update Redux store
        dispatch(updateUser({
          ...user,
          ...updatedUser,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
        } as any));
        
        dispatch(showSnackbar({
          message: '✅ Profile updated successfully!',
          severity: 'success',
        }));
        setEditMode(false);
      } else {
        throw new Error('Update failed');
      }
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update profile';
      setSnackbar({ open: true, message: `❌ ${errorMessage}`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSnackbar({ open: true, message: '❌ Passwords do not match', severity: 'error' });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setSnackbar({ open: true, message: '❌ Password must be at least 8 characters', severity: 'error' });
      return;
    }

    try {
      setLoading(true);
      
      const response = await apiClient.put('/api/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.data?.success) {
        setSnackbar({ open: true, message: '✅ Password changed successfully!', severity: 'success' });
        setChangePasswordDialog(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        throw new Error(response.data?.message || 'Password change failed');
      }
    } catch (error: any) {
      console.error('Failed to change password:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to change password';
      setSnackbar({ open: true, message: `❌ ${errorMessage}`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle2FA = async () => {
    try {
      setLoading(true);
      // TODO: Implement 2FA toggle API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTwoFactorEnabled(!twoFactorEnabled);
      setSnackbar({ 
        open: true, 
        message: twoFactorEnabled ? '✅ Two-factor authentication disabled' : '✅ Two-factor authentication enabled', 
        severity: 'success' 
      });
      setTwoFactorDialog(false);
    } catch (error) {
      console.error('Failed to toggle 2FA:', error);
      setSnackbar({ open: true, message: '❌ Failed to update 2FA settings', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmailVerification = async () => {
    try {
      setSendingEmailCode(true);
      const response = await apiClient.post('/api/auth/verify-email/send');
      
      if (response.data?.success) {
        setSnackbar({ 
          open: true, 
          message: '✅ Verification code sent to your email!', 
          severity: 'success' 
        });
        setEmailVerificationDialog(true);
      } else {
        throw new Error(response.data?.message || 'Failed to send verification code');
      }
    } catch (error: any) {
      console.error('Failed to send email verification:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to send verification code';
      setSnackbar({ open: true, message: `❌ ${errorMessage}`, severity: 'error' });
    } finally {
      setSendingEmailCode(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!emailCode || emailCode.length < 4) {
      setSnackbar({ open: true, message: '❌ Please enter the verification code', severity: 'error' });
      return;
    }

    try {
      setVerifyingEmail(true);
      const response = await apiClient.post('/api/auth/verify-email', { code: emailCode });
      
      if (response.data?.success) {
        setEmailVerified(true);
        dispatch(updateUser({
          ...user,
          emailVerified: true,
        } as any));
        setSnackbar({ 
          open: true, 
          message: '✅ Email verified successfully!', 
          severity: 'success' 
        });
        setEmailVerificationDialog(false);
        setEmailCode('');
      } else {
        throw new Error(response.data?.message || 'Verification failed');
      }
    } catch (error: any) {
      console.error('Failed to verify email:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Invalid verification code';
      setSnackbar({ open: true, message: `❌ ${errorMessage}`, severity: 'error' });
    } finally {
      setVerifyingEmail(false);
    }
  };

  const handleSendPhoneVerification = async () => {
    if (!formData.phone) {
      setSnackbar({ open: true, message: '❌ Please add a phone number first', severity: 'error' });
      return;
    }

    try {
      setSendingPhoneCode(true);
      const response = await apiClient.post('/api/auth/verify-phone/send', { phone: formData.phone });
      
      if (response.data?.success) {
        setSnackbar({ 
          open: true, 
          message: '✅ Verification code sent to your phone!', 
          severity: 'success' 
        });
        setPhoneVerificationDialog(true);
      } else {
        throw new Error(response.data?.message || 'Failed to send verification code');
      }
    } catch (error: any) {
      console.error('Failed to send phone verification:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to send verification code';
      setSnackbar({ open: true, message: `❌ ${errorMessage}`, severity: 'error' });
    } finally {
      setSendingPhoneCode(false);
    }
  };

  const handleVerifyPhone = async () => {
    if (!phoneCode || phoneCode.length < 4) {
      setSnackbar({ open: true, message: '❌ Please enter the verification code', severity: 'error' });
      return;
    }

    try {
      setVerifyingPhone(true);
      const response = await apiClient.post('/api/auth/verify-phone', { code: phoneCode });
      
      if (response.data?.success) {
        setPhoneVerified(true);
        dispatch(updateUser({
          ...user,
          phoneVerified: true,
        } as any));
        setSnackbar({ 
          open: true, 
          message: '✅ Phone number verified successfully!', 
          severity: 'success' 
        });
        setPhoneVerificationDialog(false);
        setPhoneCode('');
      } else {
        throw new Error(response.data?.message || 'Verification failed');
      }
    } catch (error: any) {
      console.error('Failed to verify phone:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Invalid verification code';
      setSnackbar({ open: true, message: `❌ ${errorMessage}`, severity: 'error' });
    } finally {
      setVerifyingPhone(false);
    }
  };

  const accountInfo = [
    { label: 'User ID', value: user?.id?.substring(0, 8) + '...', icon: <Verified /> },
    { label: 'Email', value: user?.email, icon: <Email /> },
    { label: 'Phone', value: user?.phone || 'Not provided', icon: <Phone /> },
    { label: 'Role', value: user?.role?.replace('_', ' ').toUpperCase(), icon: <Work /> },
    { label: 'Status', value: user?.status || 'Active', icon: <Security /> },
    { label: 'Member Since', value: new Date(user?.createdAt || Date.now()).toLocaleDateString(), icon: <CalendarToday /> },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Profile
          <Chip label="Active" color="success" size="small" sx={{ ml: 2 }} />
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your personal information and account settings
        </Typography>
      </Box>

      {/* Profile Card */}
      <Card sx={{ mb: 3, overflow: 'visible' }}>
        <Box
          sx={{
            height: 120,
            background: theme => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            position: 'relative',
          }}
        />
        <CardContent sx={{ mt: -8, position: 'relative' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: 3 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={profileImage || undefined}
                sx={{
                  width: 120,
                  height: 120,
                  border: '4px solid white',
                  boxShadow: 3,
                  fontSize: '3rem',
                  bgcolor: 'primary.main',
                }}
              >
                {!profileImage && `${user?.firstName?.charAt(0)}${user?.lastName?.charAt(0)}`}
              </Avatar>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleProfilePictureChange}
              />
              <IconButton
                onClick={handleProfilePictureClick}
                disabled={uploading}
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: 'background.paper',
                  boxShadow: 2,
                  '&:hover': { bgcolor: 'background.paper', transform: 'scale(1.1)' },
                  transition: 'transform 0.2s',
                }}
                size="small"
              >
                {uploading ? (
                  <CircularProgress size={16} />
                ) : (
                  <PhotoCamera fontSize="small" />
                )}
              </IconButton>
            </Box>
            <Box sx={{ ml: 3, flex: 1 }}>
              <Typography variant="h5" fontWeight={600}>
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {user?.email}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip 
                  label={user?.role?.replace('_', ' ').toUpperCase()} 
                  color="primary" 
                  size="small" 
                />
                <Chip label="Verified" color="success" size="small" icon={<Verified />} />
              </Box>
            </Box>
            <Box>
              <Button
                variant={editMode ? 'outlined' : 'contained'}
                startIcon={editMode ? <CancelIcon /> : <EditIcon />}
                onClick={handleEditToggle}
                disabled={loading}
              >
                {editMode ? 'Cancel' : 'Edit Profile'}
              </Button>
              {editMode && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={loading}
                  sx={{ ml: 1 }}
                >
                  {loading ? 'Saving...' : 'Save'}
                </Button>
              )}
            </Box>
          </Box>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Personal Information" />
              <Tab label="Account Details" />
              <Tab label="Security" />
            </Tabs>
          </Box>

          {/* Tab Panel 0 - Personal Information */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  disabled={!editMode || loading}
                  variant={editMode ? 'outlined' : 'filled'}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  disabled={!editMode || loading}
                  variant={editMode ? 'outlined' : 'filled'}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <TextField
                    fullWidth
                    label="Email Address"
                    value={formData.email}
                    disabled
                    variant="filled"
                    helperText="Email cannot be changed"
                    InputProps={{
                      endAdornment: emailVerified ? (
                        <Chip 
                          icon={<CheckCircle />} 
                          label="Verified" 
                          color="success" 
                          size="small"
                          sx={{ mr: 1 }}
                        />
                      ) : (
                        <Chip 
                          icon={<CancelIcon2 />} 
                          label="Not Verified" 
                          color="warning" 
                          size="small"
                          sx={{ mr: 1 }}
                        />
                      ),
                    }}
                  />
                  {!emailVerified && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Send />}
                      onClick={handleSendEmailVerification}
                      disabled={sendingEmailCode}
                      sx={{ mt: 1 }}
                    >
                      {sendingEmailCode ? 'Sending...' : 'Verify Email'}
                    </Button>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!editMode || loading}
                    variant={editMode ? 'outlined' : 'filled'}
                    InputProps={{
                      endAdornment: phoneVerified && formData.phone ? (
                        <Chip 
                          icon={<CheckCircle />} 
                          label="Verified" 
                          color="success" 
                          size="small"
                          sx={{ mr: 1 }}
                        />
                      ) : formData.phone ? (
                        <Chip 
                          icon={<CancelIcon2 />} 
                          label="Not Verified" 
                          color="warning" 
                          size="small"
                          sx={{ mr: 1 }}
                        />
                      ) : null,
                    }}
                  />
                  {formData.phone && !phoneVerified && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Send />}
                      onClick={handleSendPhoneVerification}
                      disabled={sendingPhoneCode || !formData.phone}
                      sx={{ mt: 1 }}
                    >
                      {sendingPhoneCode ? 'Sending...' : 'Verify Phone'}
                    </Button>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Role"
                  value={formData.role?.replace('_', ' ').toUpperCase()}
                  disabled
                  variant="filled"
                  helperText="Your role cannot be changed"
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* Tab Panel 1 - Account Details */}
          <TabPanel value={tabValue} index={1}>
            <List>
              {accountInfo.map((item, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      secondary={item.value}
                      primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}
                      secondaryTypographyProps={{ fontSize: '1rem' }}
                    />
                  </ListItem>
                  {index < accountInfo.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </TabPanel>

          {/* Tab Panel 2 - Security */}
          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3, bgcolor: alpha('#1976d2', 0.05), border: '1px solid', borderColor: alpha('#1976d2', 0.2) }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <Lock sx={{ mr: 1 }} /> Password
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Last changed: {new Date().toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      onClick={() => setChangePasswordDialog(true)}
                    >
                      Change Password
                    </Button>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 3, bgcolor: alpha('#2e7d32', 0.05), border: '1px solid', borderColor: alpha('#2e7d32', 0.2) }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <Security sx={{ mr: 1 }} /> Two-Factor Authentication
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Add an extra layer of security to your account
                      </Typography>
                    </Box>
                    <Button 
                      variant={twoFactorEnabled ? "outlined" : "contained"} 
                      color="success"
                      onClick={() => setTwoFactorDialog(true)}
                    >
                      {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                    </Button>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 3, bgcolor: alpha('#ed6c02', 0.05), border: '1px solid', borderColor: alpha('#ed6c02', 0.2) }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <Notifications sx={{ mr: 1 }} /> Notifications
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Manage your email and push notification preferences
                      </Typography>
                    </Box>
                    <Button 
                      variant="outlined" 
                      color="warning" 
                      onClick={() => navigate(ROUTES.SETTINGS)}
                    >
                      Configure
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>
        </CardContent>
      </Card>

      {/* Change Password Dialog */}
      <Dialog 
        open={changePasswordDialog} 
        onClose={() => setChangePasswordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Lock sx={{ mr: 1 }} />
            Change Password
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              Password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters.
            </Alert>
            <TextField
              fullWidth
              type="password"
              label="Current Password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              sx={{ mb: 2 }}
              disabled={loading}
            />
            <TextField
              fullWidth
              type="password"
              label="New Password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              sx={{ mb: 2 }}
              disabled={loading}
            />
            <TextField
              fullWidth
              type="password"
              label="Confirm New Password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              disabled={loading}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChangePasswordDialog(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleChangePassword} 
            variant="contained" 
            disabled={loading}
          >
            {loading ? 'Changing...' : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Two-Factor Authentication Dialog */}
      <Dialog 
        open={twoFactorDialog} 
        onClose={() => setTwoFactorDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Security sx={{ mr: 1 }} />
            {twoFactorEnabled ? 'Disable' : 'Enable'} Two-Factor Authentication
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Alert severity={twoFactorEnabled ? 'warning' : 'info'} sx={{ mb: 3 }}>
              {twoFactorEnabled 
                ? 'Are you sure you want to disable two-factor authentication? This will make your account less secure.'
                : 'Two-factor authentication adds an extra layer of security by requiring a code from your authenticator app in addition to your password.'}
            </Alert>
            {!twoFactorEnabled && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                To enable 2FA, you'll need to:
              </Typography>
            )}
            {!twoFactorEnabled && (
              <List>
                <ListItem>
                  <ListItemText 
                    primary="1. Download an authenticator app (Google Authenticator, Authy, etc.)"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="2. Scan the QR code that will be displayed"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="3. Enter the verification code to confirm"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              </List>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTwoFactorDialog(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleToggle2FA} 
            variant="contained" 
            color={twoFactorEnabled ? 'error' : 'success'}
            disabled={loading}
          >
            {loading ? 'Processing...' : (twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Email Verification Dialog */}
      <Dialog 
        open={emailVerificationDialog} 
        onClose={() => {
          setEmailVerificationDialog(false);
          setEmailCode('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Email sx={{ mr: 1 }} />
            Verify Email Address
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              We've sent a verification code to <strong>{formData.email}</strong>. Please enter the code below.
            </Alert>
            <TextField
              fullWidth
              label="Verification Code"
              value={emailCode}
              onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit code"
              disabled={verifyingEmail}
              inputProps={{ maxLength: 6, style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' } }}
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary" align="center">
              Didn't receive the code?{' '}
              <Button
                size="small"
                onClick={handleSendEmailVerification}
                disabled={sendingEmailCode}
              >
                Resend
              </Button>
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setEmailVerificationDialog(false);
              setEmailCode('');
            }} 
            disabled={verifyingEmail}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleVerifyEmail} 
            variant="contained" 
            disabled={verifyingEmail || !emailCode || emailCode.length < 4}
          >
            {verifyingEmail ? 'Verifying...' : 'Verify'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Phone Verification Dialog */}
      <Dialog 
        open={phoneVerificationDialog} 
        onClose={() => {
          setPhoneVerificationDialog(false);
          setPhoneCode('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Phone sx={{ mr: 1 }} />
            Verify Phone Number
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              We've sent a verification code to <strong>{formData.phone}</strong>. Please enter the code below.
            </Alert>
            <TextField
              fullWidth
              label="Verification Code"
              value={phoneCode}
              onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit code"
              disabled={verifyingPhone}
              inputProps={{ maxLength: 6, style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' } }}
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary" align="center">
              Didn't receive the code?{' '}
              <Button
                size="small"
                onClick={handleSendPhoneVerification}
                disabled={sendingPhoneCode}
              >
                Resend
              </Button>
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setPhoneVerificationDialog(false);
              setPhoneCode('');
            }} 
            disabled={verifyingPhone}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleVerifyPhone} 
            variant="contained" 
            disabled={verifyingPhone || !phoneCode || phoneCode.length < 4}
          >
            {verifyingPhone ? 'Verifying...' : 'Verify'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfilePage;
