import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  IconButton,
  Divider,
  Switch,
  FormControlLabel,
  Alert,
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SaveIcon from '@mui/icons-material/Save';
import { useAppSelector } from '../../hooks/redux';
import { showSuccess, showError } from '../../utils/toast';

const ProfileSettings: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: '',
  });

  const [notifications, setNotifications] = useState({
    emailBookings: true,
    emailPromotions: false,
    smsReminders: true,
    pushNotifications: true,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNotifications({
      ...notifications,
      [e.target.name]: e.target.checked,
    });
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // TODO: Call API to update profile
      // await userService.updateProfile(formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showSuccess('Profile updated successfully');
    } catch (error: any) {
      showError(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      // TODO: Call API to update notification preferences
      // await userService.updateNotificationPreferences(notifications);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showSuccess('Notification preferences updated');
    } catch (error: any) {
      showError(error.message || 'Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Profile Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Profile Information
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar
              src={profilePicture || undefined}
              sx={{ width: 100, height: 100, mr: 2 }}
            >
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </Avatar>
            <Box>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="profile-picture-upload"
                type="file"
                onChange={handleProfilePictureChange}
              />
              <label htmlFor="profile-picture-upload">
                <IconButton color="primary" component="span">
                  <PhotoCameraIcon />
                </IconButton>
              </label>
              <Typography variant="body2" color="text.secondary">
                Upload profile picture
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 200px' }}>
                <TextField
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Box>
              <Box sx={{ flex: '1 1 200px' }}>
                <TextField
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Box>
            </Box>
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={3}
            />
          </Box>

          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveProfile}
            disabled={loading}
            sx={{ mt: 2 }}
          >
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Notification Preferences
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <FormControlLabel
            control={
              <Switch
                checked={notifications.emailBookings}
                onChange={handleNotificationChange}
                name="emailBookings"
              />
            }
            label="Email notifications for bookings"
          />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
            Receive booking confirmations and updates via email
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={notifications.smsReminders}
                onChange={handleNotificationChange}
                name="smsReminders"
              />
            }
            label="SMS reminders"
          />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
            Get SMS reminders before your booking starts
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={notifications.pushNotifications}
                onChange={handleNotificationChange}
                name="pushNotifications"
              />
            }
            label="Push notifications"
          />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
            Receive real-time notifications in your browser
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={notifications.emailPromotions}
                onChange={handleNotificationChange}
                name="emailPromotions"
              />
            }
            label="Promotional emails"
          />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
            Receive updates about new features and special offers
          </Typography>

          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveNotifications}
            disabled={loading}
            sx={{ mt: 2 }}
          >
            Save Preferences
          </Button>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Security
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Alert severity="info" sx={{ mb: 3 }}>
            For security reasons, changing your password requires verification of your current password.
          </Alert>

          <Button variant="outlined" fullWidth>
            Change Password
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProfileSettings;


