// ============================================
// SYSTEM SETTINGS PAGE
// ============================================

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Stack,
  Tab,
  Tabs,
  Alert,
  Chip,
} from '@mui/material';
import {
  Save as SaveIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Code as CodeIcon,
  Email as EmailIcon,
  Storage as StorageIcon,
  VpnKey as KeyIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

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
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const SettingsPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  
  // General Settings
  const [siteName, setSiteName] = useState('StudySpot Admin Portal');
  const [siteUrl, setSiteUrl] = useState('https://admin.studyspot.com');
  const [supportEmail, setSupportEmail] = useState('support@studyspot.com');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Security Settings
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [passwordExpiry, setPasswordExpiry] = useState('90');
  const [ipWhitelist, setIpWhitelist] = useState('');

  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [slackNotifications, setSlackNotifications] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [alertEmails, setAlertEmails] = useState('admin@studyspot.com');

  // API Settings
  const [apiRateLimit, setApiRateLimit] = useState('1000');
  const [apiTimeout, setApiTimeout] = useState('30');
  const [apiKey, setApiKey] = useState('sk_live_xxxxxxxxxxxxxxxxxxxx');

  // Storage Settings
  const [storageLimit, setStorageLimit] = useState('100');
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState('daily');

  const handleSaveGeneral = () => {
    toast.success('General settings saved successfully!');
  };

  const handleSaveSecurity = () => {
    toast.success('Security settings saved successfully!');
  };

  const handleSaveNotifications = () => {
    toast.success('Notification settings saved successfully!');
  };

  const handleSaveAPI = () => {
    toast.success('API settings saved successfully!');
  };

  const handleSaveStorage = () => {
    toast.success('Storage settings saved successfully!');
  };

  const handleGenerateNewAPIKey = () => {
    const newKey = 'sk_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setApiKey(newKey);
    toast.success('New API key generated!');
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          System Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure and manage platform settings
        </Typography>
      </Box>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
            <Tab label="General" icon={<StorageIcon />} iconPosition="start" />
            <Tab label="Security" icon={<SecurityIcon />} iconPosition="start" />
            <Tab label="Notifications" icon={<NotificationsIcon />} iconPosition="start" />
            <Tab label="API" icon={<CodeIcon />} iconPosition="start" />
            <Tab label="Storage" icon={<StorageIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* General Tab */}
        <TabPanel value={currentTab} index={0}>
          <Stack spacing={3}>
            <Typography variant="h6" fontWeight="bold">
              General Settings
            </Typography>
            <Divider />
            
            <TextField
              label="Site Name"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              fullWidth
              helperText="The name displayed in the portal header"
            />

            <TextField
              label="Site URL"
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              fullWidth
              helperText="The public URL of the admin portal"
            />

            <TextField
              label="Support Email"
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              fullWidth
              helperText="Email address for support inquiries"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                />
              }
              label="Maintenance Mode"
            />
            {maintenanceMode && (
              <Alert severity="warning">
                Maintenance mode is <strong>ENABLED</strong>. Only admins can access the portal.
              </Alert>
            )}

            <Box>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveGeneral}
              >
                Save General Settings
              </Button>
            </Box>
          </Stack>
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={currentTab} index={1}>
          <Stack spacing={3}>
            <Typography variant="h6" fontWeight="bold">
              Security Settings
            </Typography>
            <Divider />

            <FormControlLabel
              control={
                <Switch
                  checked={twoFactorEnabled}
                  onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                />
              }
              label="Require Two-Factor Authentication"
            />

            <TextField
              label="Session Timeout (minutes)"
              type="number"
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
              fullWidth
              helperText="Auto-logout after this period of inactivity"
            />

            <TextField
              label="Password Expiry (days)"
              type="number"
              value={passwordExpiry}
              onChange={(e) => setPasswordExpiry(e.target.value)}
              fullWidth
              helperText="Force password change after this many days"
            />

            <TextField
              label="IP Whitelist"
              value={ipWhitelist}
              onChange={(e) => setIpWhitelist(e.target.value)}
              fullWidth
              multiline
              rows={3}
              helperText="Comma-separated list of allowed IP addresses (leave empty to allow all)"
              placeholder="192.168.1.1, 10.0.0.1"
            />

            <Alert severity="info">
              <strong>Security Status:</strong> <Chip label="Strong" color="success" size="small" sx={{ ml: 1 }} />
            </Alert>

            <Box>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveSecurity}
              >
                Save Security Settings
              </Button>
            </Box>
          </Stack>
        </TabPanel>

        {/* Notifications Tab */}
        <TabPanel value={currentTab} index={2}>
          <Stack spacing={3}>
            <Typography variant="h6" fontWeight="bold">
              Notification Settings
            </Typography>
            <Divider />

            <FormControlLabel
              control={
                <Switch
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                />
              }
              label="Enable Email Notifications"
            />

            <TextField
              label="Alert Emails"
              value={alertEmails}
              onChange={(e) => setAlertEmails(e.target.value)}
              fullWidth
              helperText="Comma-separated list of emails for system alerts"
              placeholder="admin@example.com, ops@example.com"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={slackNotifications}
                  onChange={(e) => setSlackNotifications(e.target.checked)}
                />
              }
              label="Enable Slack Notifications"
            />

            {slackNotifications && (
              <TextField
                label="Slack Webhook URL"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                fullWidth
                helperText="Webhook URL for Slack integration"
                placeholder="https://hooks.slack.com/services/..."
              />
            )}

            <Box>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveNotifications}
              >
                Save Notification Settings
              </Button>
            </Box>
          </Stack>
        </TabPanel>

        {/* API Tab */}
        <TabPanel value={currentTab} index={3}>
          <Stack spacing={3}>
            <Typography variant="h6" fontWeight="bold">
              API Settings
            </Typography>
            <Divider />

            <TextField
              label="API Rate Limit (requests/hour)"
              type="number"
              value={apiRateLimit}
              onChange={(e) => setApiRateLimit(e.target.value)}
              fullWidth
              helperText="Maximum API requests per hour per tenant"
            />

            <TextField
              label="API Timeout (seconds)"
              type="number"
              value={apiTimeout}
              onChange={(e) => setApiTimeout(e.target.value)}
              fullWidth
              helperText="Maximum time to wait for API response"
            />

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                API Key
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  value={apiKey}
                  fullWidth
                  disabled
                  InputProps={{
                    startAdornment: <KeyIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
                <Button variant="outlined" onClick={handleGenerateNewAPIKey}>
                  Regenerate
                </Button>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Keep this key secure. It provides full access to the API.
              </Typography>
            </Box>

            <Alert severity="warning">
              <strong>Warning:</strong> Regenerating the API key will invalidate the old key immediately.
            </Alert>

            <Box>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveAPI}
              >
                Save API Settings
              </Button>
            </Box>
          </Stack>
        </TabPanel>

        {/* Storage Tab */}
        <TabPanel value={currentTab} index={4}>
          <Stack spacing={3}>
            <Typography variant="h6" fontWeight="bold">
              Storage & Backup Settings
            </Typography>
            <Divider />

            <TextField
              label="Storage Limit (GB)"
              type="number"
              value={storageLimit}
              onChange={(e) => setStorageLimit(e.target.value)}
              fullWidth
              helperText="Maximum storage per tenant"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={autoBackup}
                  onChange={(e) => setAutoBackup(e.target.checked)}
                />
              }
              label="Enable Automatic Backups"
            />

            {autoBackup && (
              <TextField
                select
                label="Backup Frequency"
                value={backupFrequency}
                onChange={(e) => setBackupFrequency(e.target.value)}
                fullWidth
                SelectProps={{ native: true }}
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </TextField>
            )}

            <Alert severity="info">
              <strong>Storage Usage:</strong> 45 GB / 100 GB (45% used)
            </Alert>

            <Box>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveStorage}
              >
                Save Storage Settings
              </Button>
            </Box>
          </Stack>
        </TabPanel>
      </Card>
    </Box>
  );
};

export default SettingsPage;

