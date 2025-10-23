import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Chip,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  alpha,
  Tab,
  Tabs,
  IconButton,
  Tooltip,
} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import {
  Notifications,
  Security,
  Language,
  Palette,
  Save,
  RestartAlt,
  Email,
  Sms,
  PhoneIphone,
  DarkMode,
  LightMode,
  Code,
  Lock,
  Public,
  Business,
  Payment,
  Receipt,
  Archive,
  Info,
} from '@mui/icons-material';
import { useAppSelector } from '../../hooks/redux';

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
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const SettingsPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    paymentAlerts: true,
    attendanceAlerts: true,
    newBookings: true,
    marketingEmails: false,
  });

  // Appearance Settings
  const [appearance, setAppearance] = useState({
    theme: 'light',
    language: 'en',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    currency: 'INR',
  });

  // Security Settings
  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: 30,
    apiAccess: false,
  });

  // Business Settings
  const [business, setBusiness] = useState({
    autoBackup: true,
    dataRetention: 90,
    invoicePrefix: 'INV',
    receiptFormat: 'PDF',
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSnackbar({ open: true, message: '✅ Settings saved successfully!', severity: 'success' });
      setLoading(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSnackbar({ open: true, message: '❌ Failed to save settings', severity: 'error' });
      setLoading(false);
    }
  };

  const handleResetSettings = () => {
    // Reset to defaults
    setNotifications({
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      paymentAlerts: true,
      attendanceAlerts: true,
      newBookings: true,
      marketingEmails: false,
    });
    setAppearance({
      theme: 'light',
      language: 'en',
      timezone: 'Asia/Kolkata',
      dateFormat: 'DD/MM/YYYY',
      currency: 'INR',
    });
    setSnackbar({ open: true, message: '✅ Settings reset to defaults', severity: 'success' });
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
          <Chip label="Configure" color="primary" size="small" sx={{ ml: 2 }} />
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your application preferences and configurations
        </Typography>
      </Box>

      {/* Settings Card */}
      <Card>
        <CardContent>
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
              <Tab icon={<Notifications />} label="Notifications" iconPosition="start" />
              <Tab icon={<Palette />} label="Appearance" iconPosition="start" />
              <Tab icon={<Security />} label="Security" iconPosition="start" />
              <Tab icon={<Business />} label="Business" iconPosition="start" />
            </Tabs>
          </Box>

          {/* Tab Panel 0 - Notifications */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert severity="info" icon={<Info />}>
                  Control how you receive notifications and updates
                </Alert>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, bgcolor: alpha('#1976d2', 0.05) }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Email sx={{ mr: 1 }} /> Email Notifications
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="Email Notifications" secondary="Receive email updates" />
                      <Switch
                        checked={notifications.emailNotifications}
                        onChange={(e) => setNotifications({ ...notifications, emailNotifications: e.target.checked })}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Payment Alerts" secondary="Get notified of payments" />
                      <Switch
                        checked={notifications.paymentAlerts}
                        onChange={(e) => setNotifications({ ...notifications, paymentAlerts: e.target.checked })}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Attendance Alerts" secondary="Daily attendance summary" />
                      <Switch
                        checked={notifications.attendanceAlerts}
                        onChange={(e) => setNotifications({ ...notifications, attendanceAlerts: e.target.checked })}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="New Bookings" secondary="Get notified of new bookings" />
                      <Switch
                        checked={notifications.newBookings}
                        onChange={(e) => setNotifications({ ...notifications, newBookings: e.target.checked })}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, bgcolor: alpha('#2e7d32', 0.05) }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <PhoneIphone sx={{ mr: 1 }} /> Mobile Notifications
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="Push Notifications" secondary="Mobile app notifications" />
                      <Switch
                        checked={notifications.pushNotifications}
                        onChange={(e) => setNotifications({ ...notifications, pushNotifications: e.target.checked })}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="SMS Notifications" secondary="Receive SMS alerts" />
                      <Switch
                        checked={notifications.smsNotifications}
                        onChange={(e) => setNotifications({ ...notifications, smsNotifications: e.target.checked })}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Marketing Emails" secondary="Promotional content" />
                      <Switch
                        checked={notifications.marketingEmails}
                        onChange={(e) => setNotifications({ ...notifications, marketingEmails: e.target.checked })}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Tab Panel 1 - Appearance */}
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert severity="info" icon={<Palette />}>
                  Customize the look and feel of your dashboard
                </Alert>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Theme</InputLabel>
                  <Select
                    value={appearance.theme}
                    label="Theme"
                    onChange={(e) => setAppearance({ ...appearance, theme: e.target.value })}
                    startAdornment={appearance.theme === 'light' ? <LightMode sx={{ ml: 1, mr: -0.5 }} /> : <DarkMode sx={{ ml: 1, mr: -0.5 }} />}
                  >
                    <MenuItem value="light">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LightMode sx={{ mr: 1 }} /> Light Theme
                      </Box>
                    </MenuItem>
                    <MenuItem value="dark">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DarkMode sx={{ mr: 1 }} /> Dark Theme
                      </Box>
                    </MenuItem>
                    <MenuItem value="auto">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Palette sx={{ mr: 1 }} /> Auto (System)
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={appearance.language}
                    label="Language"
                    onChange={(e) => setAppearance({ ...appearance, language: e.target.value })}
                    startAdornment={<Language sx={{ ml: 1, mr: -0.5 }} />}
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="hi">हिन्दी (Hindi)</MenuItem>
                    <MenuItem value="mr">मराठी (Marathi)</MenuItem>
                    <MenuItem value="ta">தமிழ் (Tamil)</MenuItem>
                    <MenuItem value="te">తెలుగు (Telugu)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    value={appearance.timezone}
                    label="Timezone"
                    onChange={(e) => setAppearance({ ...appearance, timezone: e.target.value })}
                    startAdornment={<Public sx={{ ml: 1, mr: -0.5 }} />}
                  >
                    <MenuItem value="Asia/Kolkata">India (IST)</MenuItem>
                    <MenuItem value="Asia/Dubai">Dubai (GST)</MenuItem>
                    <MenuItem value="America/New_York">New York (EST)</MenuItem>
                    <MenuItem value="Europe/London">London (GMT)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Date Format</InputLabel>
                  <Select
                    value={appearance.dateFormat}
                    label="Date Format"
                    onChange={(e) => setAppearance({ ...appearance, dateFormat: e.target.value })}
                  >
                    <MenuItem value="DD/MM/YYYY">DD/MM/YYYY (23/10/2025)</MenuItem>
                    <MenuItem value="MM/DD/YYYY">MM/DD/YYYY (10/23/2025)</MenuItem>
                    <MenuItem value="YYYY-MM-DD">YYYY-MM-DD (2025-10-23)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={appearance.currency}
                    label="Currency"
                    onChange={(e) => setAppearance({ ...appearance, currency: e.target.value })}
                  >
                    <MenuItem value="INR">₹ INR (Indian Rupee)</MenuItem>
                    <MenuItem value="USD">$ USD (US Dollar)</MenuItem>
                    <MenuItem value="EUR">€ EUR (Euro)</MenuItem>
                    <MenuItem value="GBP">£ GBP (Pound Sterling)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Tab Panel 2 - Security */}
          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert severity="warning" icon={<Security />}>
                  Protect your account with advanced security features
                </Alert>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 3, bgcolor: alpha('#2e7d32', 0.05), border: '1px solid', borderColor: alpha('#2e7d32', 0.2) }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <Lock sx={{ mr: 1 }} /> Two-Factor Authentication
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Add an extra layer of security with 2FA
                      </Typography>
                    </Box>
                    <Switch
                      checked={security.twoFactorAuth}
                      onChange={(e) => setSecurity({ ...security, twoFactorAuth: e.target.checked })}
                    />
                  </Box>
                  {security.twoFactorAuth && (
                    <Button variant="outlined" color="success" size="small">
                      Configure 2FA
                    </Button>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Login Alerts
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={security.loginAlerts}
                        onChange={(e) => setSecurity({ ...security, loginAlerts: e.target.checked })}
                      />
                    }
                    label="Email me when someone logs into my account"
                  />
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Session Timeout
                  </Typography>
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>Timeout Duration</InputLabel>
                    <Select
                      value={security.sessionTimeout}
                      label="Timeout Duration"
                      onChange={(e) => setSecurity({ ...security, sessionTimeout: e.target.value as number })}
                    >
                      <MenuItem value={15}>15 minutes</MenuItem>
                      <MenuItem value={30}>30 minutes</MenuItem>
                      <MenuItem value={60}>1 hour</MenuItem>
                      <MenuItem value={120}>2 hours</MenuItem>
                    </Select>
                  </FormControl>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 3, bgcolor: alpha('#1976d2', 0.05) }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <Code sx={{ mr: 1 }} /> API Access
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Enable programmatic access to your data
                      </Typography>
                    </Box>
                    <Switch
                      checked={security.apiAccess}
                      onChange={(e) => setSecurity({ ...security, apiAccess: e.target.checked })}
                    />
                  </Box>
                  {security.apiAccess && (
                    <Box sx={{ mt: 2 }}>
                      <TextField
                        fullWidth
                        label="API Key"
                        value="sk_live_xxxxxxxxxxxxxxxxxx"
                        InputProps={{
                          readOnly: true,
                          endAdornment: (
                            <Tooltip title="Copy">
                              <IconButton size="small">
                                <Archive />
                              </IconButton>
                            </Tooltip>
                          ),
                        }}
                      />
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Tab Panel 3 - Business */}
          <TabPanel value={tabValue} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert severity="info" icon={<Business />}>
                  Configure business and operational settings
                </Alert>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Archive sx={{ mr: 1 }} /> Auto Backup
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={business.autoBackup}
                        onChange={(e) => setBusiness({ ...business, autoBackup: e.target.checked })}
                      />
                    }
                    label="Enable automatic daily backups"
                  />
                  {business.autoBackup && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      Next backup: Tomorrow at 2:00 AM
                    </Typography>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Data Retention
                  </Typography>
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>Retention Period</InputLabel>
                    <Select
                      value={business.dataRetention}
                      label="Retention Period"
                      onChange={(e) => setBusiness({ ...business, dataRetention: e.target.value as number })}
                    >
                      <MenuItem value={30}>30 days</MenuItem>
                      <MenuItem value={90}>90 days</MenuItem>
                      <MenuItem value={180}>180 days</MenuItem>
                      <MenuItem value={365}>1 year</MenuItem>
                    </Select>
                  </FormControl>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Payment sx={{ mr: 1 }} /> Invoice Settings
                  </Typography>
                  <TextField
                    fullWidth
                    label="Invoice Prefix"
                    value={business.invoicePrefix}
                    onChange={(e) => setBusiness({ ...business, invoicePrefix: e.target.value })}
                    helperText="Example: INV-2025-001"
                    sx={{ mt: 2 }}
                  />
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Receipt sx={{ mr: 1 }} /> Receipt Format
                  </Typography>
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>Format</InputLabel>
                    <Select
                      value={business.receiptFormat}
                      label="Format"
                      onChange={(e) => setBusiness({ ...business, receiptFormat: e.target.value })}
                    >
                      <MenuItem value="PDF">PDF</MenuItem>
                      <MenuItem value="HTML">HTML</MenuItem>
                      <MenuItem value="BOTH">Both (PDF + HTML)</MenuItem>
                    </Select>
                  </FormControl>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Action Buttons */}
          <Divider sx={{ my: 3 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              startIcon={<RestartAlt />}
              onClick={handleResetSettings}
              disabled={loading}
            >
              Reset to Defaults
            </Button>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSaveSettings}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </Box>
        </CardContent>
      </Card>

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

export default SettingsPage;

