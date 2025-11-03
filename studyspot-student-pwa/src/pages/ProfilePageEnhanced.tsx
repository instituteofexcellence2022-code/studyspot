import { useState, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  TextField,
  Button,
  Grid,
  IconButton,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';
import {
  Edit,
  Save,
  CameraAlt,
  Notifications,
  Security,
  Description,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { QRCodeSVG } from 'qrcode.react';
import Layout from '../components/Layout';
import api from '../services/api';

interface ProfilePageEnhancedProps {
  setIsAuthenticated: (value: boolean) => void;
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
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ProfilePageEnhanced({ setIsAuthenticated }: ProfilePageEnhancedProps) {
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    phone: user.phone || '',
    dateOfBirth: user.dateOfBirth || '',
    address: user.address || '',
    city: user.city || '',
    state: user.state || '',
    pincode: user.pincode || '',
  });

  const [photoURL, setPhotoURL] = useState(user.photoURL || '');
  
  const [notifications, setNotifications] = useState({
    bookingReminders: true,
    promotionalEmails: false,
    smsAlerts: true,
    pushNotifications: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      await api.put('/users/profile', { ...formData, photoURL });
      localStorage.setItem('user', JSON.stringify({ ...user, ...formData, photoURL }));
      setEditMode(false);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile');
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    setUploading(true);
    const file = acceptedFiles[0];
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('photo', file);

      const response = await api.post('/users/upload-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setPhotoURL(response.data.photoURL);
      alert('Photo uploaded successfully!');
    } catch (error) {
      alert('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {'image/*': []},
    multiple: false,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  return (
    <Layout setIsAuthenticated={setIsAuthenticated}>
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom fontWeight="bold">
          My Profile
        </Typography>

        <Grid container spacing={3}>
          {/* Left Column - Profile Card */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box sx={{ position: 'relative', mb: 2 }}>
                    <Avatar
                      src={photoURL}
                      sx={{ width: 120, height: 120, fontSize: 48 }}
                    >
                      {!photoURL && `${formData.firstName[0]}${formData.lastName[0]}`}
                    </Avatar>
                    <Box
                      {...getRootProps()}
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        bgcolor: 'primary.main',
                        borderRadius: '50%',
                        p: 1,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'primary.dark' },
                      }}
                    >
                      <input {...getInputProps()} />
                      <CameraAlt sx={{ color: 'white', fontSize: 20 }} />
                    </Box>
                  </Box>

                  <Typography variant="h5" fontWeight="bold">
                    {formData.firstName} {formData.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Student ID: ST{user.id?.toString().padStart(6, '0')}
                  </Typography>

                  {/* Digital ID Card with QR */}
                  <Box
                    sx={{
                      width: '100%',
                      p: 2,
                      bgcolor: '#f5f5f5',
                      borderRadius: 2,
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="subtitle2" gutterBottom>
                      Digital ID Card
                    </Typography>
                    <QRCodeSVG
                      value={`STUDYSPOT-${user.id}-${formData.email}`}
                      size={150}
                      level="H"
                      includeMargin={true}
                    />
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Scan for quick check-in
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column - Tabs */}
          <Grid item xs={12} md={8}>
            <Card>
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                <Tab icon={<Edit />} label="Personal Info" />
                <Tab icon={<Notifications />} label="Notifications" />
                <Tab icon={<Security />} label="Privacy & Security" />
                <Tab icon={<Description />} label="Documents" />
              </Tabs>

              {/* Tab 1: Personal Info */}
              <TabPanel value={tabValue} index={0}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        disabled={!editMode}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        disabled={!editMode}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={!editMode}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!editMode}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Date of Birth"
                        name="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        disabled={!editMode}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        disabled={!editMode}
                        multiline
                        rows={2}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="City"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        disabled={!editMode}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="State"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        disabled={!editMode}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Pincode"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        disabled={!editMode}
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    {editMode ? (
                      <>
                        <Button
                          variant="contained"
                          startIcon={<Save />}
                          onClick={handleSave}
                          fullWidth
                        >
                          Save Changes
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => setEditMode(false)}
                          fullWidth
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="contained"
                        startIcon={<Edit />}
                        onClick={() => setEditMode(true)}
                        fullWidth
                      >
                        Edit Profile
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </TabPanel>

              {/* Tab 2: Notifications */}
              <TabPanel value={tabValue} index={1}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Notification Preferences
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notifications.bookingReminders}
                          onChange={(e) => setNotifications({ ...notifications, bookingReminders: e.target.checked })}
                        />
                      }
                      label="Booking Reminders"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notifications.promotionalEmails}
                          onChange={(e) => setNotifications({ ...notifications, promotionalEmails: e.target.checked })}
                        />
                      }
                      label="Promotional Emails"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notifications.smsAlerts}
                          onChange={(e) => setNotifications({ ...notifications, smsAlerts: e.target.checked })}
                        />
                      }
                      label="SMS Alerts"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notifications.pushNotifications}
                          onChange={(e) => setNotifications({ ...notifications, pushNotifications: e.target.checked })}
                        />
                      }
                      label="Push Notifications"
                    />
                  </Box>
                  <Button variant="contained" sx={{ mt: 3 }} fullWidth>
                    Save Preferences
                  </Button>
                </CardContent>
              </TabPanel>

              {/* Tab 3: Privacy & Security */}
              <TabPanel value={tabValue} index={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Privacy & Security
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    <Button variant="outlined" fullWidth>
                      Change Password
                    </Button>
                    <Button variant="outlined" fullWidth>
                      Two-Factor Authentication
                    </Button>
                    <Button variant="outlined" fullWidth>
                      Privacy Settings
                    </Button>
                    <Divider sx={{ my: 2 }} />
                    <Button variant="outlined" color="error" fullWidth>
                      Delete Account
                    </Button>
                  </Box>
                </CardContent>
              </TabPanel>

              {/* Tab 4: Documents */}
              <TabPanel value={tabValue} index={3}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Documents & KYC
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Upload your ID proof for verification
                  </Typography>
                  <Box
                    {...getRootProps()}
                    sx={{
                      border: '2px dashed #ccc',
                      borderRadius: 2,
                      p: 4,
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': { borderColor: 'primary.main', bgcolor: '#f5f5f5' },
                    }}
                  >
                    <input {...getInputProps()} />
                    <Description sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body1">
                      {isDragActive ? 'Drop the file here...' : 'Drag & drop documents, or click to select'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Supported: PDF, JPG, PNG (Max 5MB)
                    </Typography>
                  </Box>

                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Aadhaar KYC Verification
                    </Typography>
                    <Button variant="outlined" fullWidth sx={{ mt: 1 }}>
                      Verify with Aadhaar
                    </Button>
                  </Box>
                </CardContent>
              </TabPanel>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
}

