// ============================================
// SETTINGS & CONFIGURATION PAGE
// ============================================

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  GridLegacy as Grid,
  Chip,
  IconButton,
  Divider,
  Alert,
} from '@mui/material';
import {
  Save,
  RestartAlt,
  Security,
  Email,
  Notifications,
  IntegrationInstructions,
  Settings as SettingsIcon,
  Delete,
  Add,
} from '@mui/icons-material';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [saved, setSaved] = useState(false);

  // General Settings State
  const [generalSettings, setGeneralSettings] = useState({
    companyName: 'StudySpot Platform',
    contactEmail: 'admin@studyspot.com',
    supportEmail: 'support@studyspot.com',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    currency: 'INR',
    language: 'en',
    defaultPageSize: 25,
  });

  // Security Settings State
  const [securitySettings, setSecuritySettings] = useState({
    enable2FA: true,
    sessionTimeout: 30,
    minPasswordLength: 8,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxFailedAttempts: 5,
    lockoutDuration: 15,
  });

  // Email Settings State
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: 'noreply@studyspot.com',
    fromEmail: 'noreply@studyspot.com',
    fromName: 'StudySpot Platform',
    useTLS: true,
  });

  // Integration Settings State
  const [integrations, setIntegrations] = useState({
    razorpayEnabled: true,
    stripeEnabled: false,
    twilioEnabled: true,
    awsEnabled: true,
  });

  // Notification Settings State
  const [notifications, setNotifications] = useState({
    emailEnabled: true,
    smsEnabled: true,
    whatsappEnabled: true,
    inAppEnabled: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Render General Settings Tab
  const renderGeneralTab = () => (
    <Box>
      {saved && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Settings saved successfully!
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Company Name"
            value={generalSettings.companyName}
            onChange={(e) => setGeneralSettings({ ...generalSettings, companyName: e.target.value })}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Contact Email"
            type="email"
            value={generalSettings.contactEmail}
            onChange={(e) => setGeneralSettings({ ...generalSettings, contactEmail: e.target.value })}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Support Email"
            type="email"
            value={generalSettings.supportEmail}
            onChange={(e) => setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Timezone</InputLabel>
            <Select
              value={generalSettings.timezone}
              label="Timezone"
              onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
            >
              <MenuItem value="Asia/Kolkata">Asia/Kolkata (IST)</MenuItem>
              <MenuItem value="America/New_York">America/New_York (EST)</MenuItem>
              <MenuItem value="Europe/London">Europe/London (GMT)</MenuItem>
              <MenuItem value="Asia/Dubai">Asia/Dubai (GST)</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Date Format</InputLabel>
            <Select
              value={generalSettings.dateFormat}
              label="Date Format"
              onChange={(e) => setGeneralSettings({ ...generalSettings, dateFormat: e.target.value })}
            >
              <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
              <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
              <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Currency</InputLabel>
            <Select
              value={generalSettings.currency}
              label="Currency"
              onChange={(e) => setGeneralSettings({ ...generalSettings, currency: e.target.value })}
            >
              <MenuItem value="INR">INR (₹)</MenuItem>
              <MenuItem value="USD">USD ($)</MenuItem>
              <MenuItem value="EUR">EUR (€)</MenuItem>
              <MenuItem value="GBP">GBP (£)</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Language</InputLabel>
            <Select
              value={generalSettings.language}
              label="Language"
              onChange={(e) => setGeneralSettings({ ...generalSettings, language: e.target.value })}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="hi">Hindi</MenuItem>
              <MenuItem value="mr">Marathi</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Default Page Size</InputLabel>
            <Select
              value={generalSettings.defaultPageSize}
              label="Default Page Size"
              onChange={(e) => setGeneralSettings({ ...generalSettings, defaultPageSize: Number(e.target.value) })}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button variant="contained" startIcon={<Save />} onClick={handleSave}>
          Save Changes
        </Button>
        <Button variant="outlined" startIcon={<RestartAlt />}>
          Reset to Defaults
        </Button>
      </Box>
    </Box>
  );

  // Render Security Settings Tab
  const renderSecurityTab = () => (
    <Box>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Authentication & Access Control
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={securitySettings.enable2FA}
                onChange={(e) => setSecuritySettings({ ...securitySettings, enable2FA: e.target.checked })}
              />
            }
            label="Enable Two-Factor Authentication (2FA)"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Session Timeout (minutes)"
            type="number"
            value={securitySettings.sessionTimeout}
            onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: Number(e.target.value) })}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Max Failed Login Attempts"
            type="number"
            value={securitySettings.maxFailedAttempts}
            onChange={(e) => setSecuritySettings({ ...securitySettings, maxFailedAttempts: Number(e.target.value) })}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Password Policy
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Minimum Password Length"
            type="number"
            value={securitySettings.minPasswordLength}
            onChange={(e) => setSecuritySettings({ ...securitySettings, minPasswordLength: Number(e.target.value) })}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Account Lockout Duration (minutes)"
            type="number"
            value={securitySettings.lockoutDuration}
            onChange={(e) => setSecuritySettings({ ...securitySettings, lockoutDuration: Number(e.target.value) })}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={securitySettings.requireUppercase}
                onChange={(e) => setSecuritySettings({ ...securitySettings, requireUppercase: e.target.checked })}
              />
            }
            label="Require Uppercase Letters"
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={securitySettings.requireNumbers}
                onChange={(e) => setSecuritySettings({ ...securitySettings, requireNumbers: e.target.checked })}
              />
            }
            label="Require Numbers"
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={securitySettings.requireSpecialChars}
                onChange={(e) => setSecuritySettings({ ...securitySettings, requireSpecialChars: e.target.checked })}
              />
            }
            label="Require Special Characters"
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button variant="contained" startIcon={<Save />} onClick={handleSave}>
          Save Security Settings
        </Button>
      </Box>
    </Box>
  );

  // Render Email Settings Tab
  const renderEmailTab = () => (
    <Box>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        SMTP Configuration
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="SMTP Host"
            value={emailSettings.smtpHost}
            onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="SMTP Port"
            type="number"
            value={emailSettings.smtpPort}
            onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: Number(e.target.value) })}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="SMTP Username"
            value={emailSettings.smtpUser}
            onChange={(e) => setEmailSettings({ ...emailSettings, smtpUser: e.target.value })}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="From Email"
            type="email"
            value={emailSettings.fromEmail}
            onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="From Name"
            value={emailSettings.fromName}
            onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={emailSettings.useTLS}
                onChange={(e) => setEmailSettings({ ...emailSettings, useTLS: e.target.checked })}
              />
            }
            label="Use TLS/SSL"
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button variant="contained" startIcon={<Save />} onClick={handleSave}>
          Save Email Settings
        </Button>
        <Button variant="outlined">
          Send Test Email
        </Button>
      </Box>
    </Box>
  );

  // Render Integrations Tab
  const renderIntegrationsTab = () => (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Razorpay
                </Typography>
                <Switch
                  checked={integrations.razorpayEnabled}
                  onChange={(e) => setIntegrations({ ...integrations, razorpayEnabled: e.target.checked })}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Payment gateway for Indian market
              </Typography>
              {integrations.razorpayEnabled && (
                <Box>
                  <TextField fullWidth size="small" label="Key ID" sx={{ mb: 2 }} />
                  <TextField fullWidth size="small" label="Key Secret" type="password" sx={{ mb: 2 }} />
                  <Chip label="Connected" color="success" size="small" />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Stripe
                </Typography>
                <Switch
                  checked={integrations.stripeEnabled}
                  onChange={(e) => setIntegrations({ ...integrations, stripeEnabled: e.target.checked })}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                International payment processing
              </Typography>
              {integrations.stripeEnabled && (
                <Box>
                  <TextField fullWidth size="small" label="Publishable Key" sx={{ mb: 2 }} />
                  <TextField fullWidth size="small" label="Secret Key" type="password" sx={{ mb: 2 }} />
                  <Chip label="Not Connected" color="default" size="small" />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Twilio
                </Typography>
                <Switch
                  checked={integrations.twilioEnabled}
                  onChange={(e) => setIntegrations({ ...integrations, twilioEnabled: e.target.checked })}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                SMS and WhatsApp messaging
              </Typography>
              {integrations.twilioEnabled && (
                <Box>
                  <TextField fullWidth size="small" label="Account SID" sx={{ mb: 2 }} />
                  <TextField fullWidth size="small" label="Auth Token" type="password" sx={{ mb: 2 }} />
                  <Chip label="Connected" color="success" size="small" />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  AWS S3
                </Typography>
                <Switch
                  checked={integrations.awsEnabled}
                  onChange={(e) => setIntegrations({ ...integrations, awsEnabled: e.target.checked })}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Cloud storage for files
              </Typography>
              {integrations.awsEnabled && (
                <Box>
                  <TextField fullWidth size="small" label="Access Key ID" sx={{ mb: 2 }} />
                  <TextField fullWidth size="small" label="Secret Key" type="password" sx={{ mb: 2 }} />
                  <Chip label="Connected" color="success" size="small" />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Button variant="contained" startIcon={<Save />} onClick={handleSave}>
          Save Integration Settings
        </Button>
      </Box>
    </Box>
  );

  // Render Notifications Tab
  const renderNotificationsTab = () => (
    <Box>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Notification Channels
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6">Email Notifications</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Send notifications via email
                  </Typography>
                </Box>
                <Switch
                  checked={notifications.emailEnabled}
                  onChange={(e) => setNotifications({ ...notifications, emailEnabled: e.target.checked })}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6">SMS Notifications</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Send notifications via SMS
                  </Typography>
                </Box>
                <Switch
                  checked={notifications.smsEnabled}
                  onChange={(e) => setNotifications({ ...notifications, smsEnabled: e.target.checked })}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6">WhatsApp Notifications</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Send notifications via WhatsApp
                  </Typography>
                </Box>
                <Switch
                  checked={notifications.whatsappEnabled}
                  onChange={(e) => setNotifications({ ...notifications, whatsappEnabled: e.target.checked })}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6">In-App Notifications</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Show notifications in the application
                  </Typography>
                </Box>
                <Switch
                  checked={notifications.inAppEnabled}
                  onChange={(e) => setNotifications({ ...notifications, inAppEnabled: e.target.checked })}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Button variant="contained" startIcon={<Save />} onClick={handleSave}>
          Save Notification Settings
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Settings & Configuration
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage platform settings, integrations, and preferences
        </Typography>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab icon={<SettingsIcon />} label="General" iconPosition="start" />
        <Tab icon={<Security />} label="Security" iconPosition="start" />
        <Tab icon={<Email />} label="Email" iconPosition="start" />
        <Tab icon={<IntegrationInstructions />} label="Integrations" iconPosition="start" />
        <Tab icon={<Notifications />} label="Notifications" iconPosition="start" />
      </Tabs>

      {/* Tab Content */}
      <Card>
        <CardContent>
          {activeTab === 0 && renderGeneralTab()}
          {activeTab === 1 && renderSecurityTab()}
          {activeTab === 2 && renderEmailTab()}
          {activeTab === 3 && renderIntegrationsTab()}
          {activeTab === 4 && renderNotificationsTab()}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SettingsPage;

