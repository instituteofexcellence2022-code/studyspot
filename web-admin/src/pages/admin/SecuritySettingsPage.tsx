/**
 * Security Settings Page
 * Comprehensive security configuration interface
 * 
 * @author Agent 2 - Senior Frontend Developer (20+ years)
 * @date October 21, 2025
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Grid from '@mui/material/Grid';
import {
  Card,
  CardContent,
  LinearProgress,
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Chip,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
  Slider
} from '@mui/material';
import { Check as CheckIcon, Error as ErrorIcon, Save as SaveIcon, Security as SecurityIcon, Warning as WarningIcon } from '@mui/icons-material';
import { AppDispatch, RootState } from '../../store';
import {
  fetchSecuritySettings,
  updateSecuritySettings,
  fetchSecurityAuditSummary
} from '../../store/slices/rbacSlice';
import { SecuritySettingsUpdateRequest, PasswordPolicy } from '../../types';

const SecuritySettingsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { securitySettings, securityAudit } = useSelector((state: RootState) => state.rbac);
  const { user } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState<SecuritySettingsUpdateRequest>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [ipWhitelistInput, setIpWhitelistInput] = useState('');

  useEffect(() => {
    if (user?.tenantId) {
      dispatch(fetchSecuritySettings(user.tenantId as any));
      dispatch(fetchSecurityAuditSummary(user.tenantId as any));
    }
  }, [dispatch, user?.tenantId]);

  useEffect(() => {
    if (securitySettings.data) {
      setFormData({
        mfaEnabled: securitySettings.data.mfaEnabled,
        mfaEnforced: securitySettings.data.mfaEnforced,
        sessionTimeout: securitySettings.data.sessionTimeout,
        passwordPolicy: { ...securitySettings.data.passwordPolicy },
        ipWhitelist: [...securitySettings.data.ipWhitelist],
        maxLoginAttempts: securitySettings.data.maxLoginAttempts,
        lockoutDuration: securitySettings.data.lockoutDuration,
        requireEmailVerification: securitySettings.data.requireEmailVerification,
        allowApiAccess: securitySettings.data.allowApiAccess});
    }
  }, [securitySettings.data]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handlePasswordPolicyChange = (field: keyof PasswordPolicy, value: any) => {
    setFormData((prev) => ({
      ...prev,
      passwordPolicy: {
        ...prev.passwordPolicy,
        [field]: value}}));
    setHasChanges(true);
  };

  const handleAddIpToWhitelist = () => {
    if (ipWhitelistInput && !formData.ipWhitelist?.includes(ipWhitelistInput)) {
      setFormData((prev) => ({
        ...prev,
        ipWhitelist: [...(prev.ipWhitelist || []), ipWhitelistInput]}));
      setIpWhitelistInput('');
      setHasChanges(true);
    }
  };

  const handleRemoveIpFromWhitelist = (ip: string) => {
    setFormData((prev) => ({
      ...prev,
      ipWhitelist: prev.ipWhitelist?.filter((i) => i !== ip) || []}));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!user?.tenantId) return;

    try {
      await dispatch(updateSecuritySettings({
        tenantId: user.tenantId,
        data: formData} as any)).unwrap();
      setHasChanges(false);
      dispatch(fetchSecurityAuditSummary(user.tenantId as any));
    } catch (error) {
      console.error('Failed to update security settings:', error);
    }
  };

  const getSecurityScoreColor = (score: number): string => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#ff9800';
    return '#f44336';
  };

  const getSecurityScoreLabel = (score: number): string => {
    if (score >= 80) return 'Strong';
    if (score >= 60) return 'Moderate';
    return 'Weak';
  };

  if (securitySettings.loading && !securitySettings.data) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" fontWeight="bold">
            Security Settings
          </Typography>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={!hasChanges || securitySettings.loading}
          >
            Save Changes
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Configure security policies and authentication settings
        </Typography>
      </Box>

      {/* Security Audit Summary */}
      {securityAudit.data && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Security Overview
          </Typography>
          <Grid container spacing={3}>
            <Grid xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h2" fontWeight="bold" color={getSecurityScoreColor(securityAudit.data.securityScore)}>
                  {securityAudit.data.securityScore}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Security Score ({getSecurityScoreLabel(securityAudit.data.securityScore)})
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={securityAudit.data.securityScore}
                  sx={{
                    mt: 1,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#f0f0f0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getSecurityScoreColor(securityAudit.data.securityScore)}}}
                />
              </Box>
            </Grid>
            <Grid xs={12} md={9}>
              <Grid container spacing={2}>
                <Grid xs={6} sm={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h4" fontWeight="bold">{securityAudit.data.totalUsers}</Typography>
                      <Typography variant="caption" color="text.secondary">Total Users</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid xs={6} sm={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h4" fontWeight="bold" color="success.main">{securityAudit.data.mfaEnabledUsers}</Typography>
                      <Typography variant="caption" color="text.secondary">MFA Enabled</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid xs={6} sm={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h4" fontWeight="bold" color="warning.main">{securityAudit.data.failedLogins24h}</Typography>
                      <Typography variant="caption" color="text.secondary">Failed Logins (24h)</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid xs={6} sm={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h4" fontWeight="bold" color="error.main">{securityAudit.data.suspiciousActivities24h}</Typography>
                      <Typography variant="caption" color="text.secondary">Suspicious (24h)</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Error Alert */}
      {securitySettings.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {securitySettings.error}
        </Alert>
      )}

      {/* Multi-Factor Authentication */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Multi-Factor Authentication (MFA)
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={formData.mfaEnabled || false}
                onChange={(e) => handleChange('mfaEnabled', e.target.checked)}
              />
            }
            label="Enable MFA for all users"
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.mfaEnforced || false}
                onChange={(e) => handleChange('mfaEnforced', e.target.checked)}
                disabled={!formData.mfaEnabled}
              />
            }
            label="Enforce MFA (users must enable MFA)"
          />
        </FormGroup>
      </Paper>

      {/* Session Management */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Session Management
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            Session Timeout: {formData.sessionTimeout || 30} minutes
          </Typography>
          <Slider
            value={formData.sessionTimeout || 30}
            onChange={(_, value) => handleChange('sessionTimeout', value)}
            min={15}
            max={480}
            step={15}
            marks={[
              { value: 15, label: '15m' },
              { value: 60, label: '1h' },
              { value: 240, label: '4h' },
              { value: 480, label: '8h' },
            ]}
            valueLabelDisplay="auto"
          />
        </Box>
      </Paper>

      {/* Password Policy */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Password Policy
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid xs={12} sm={6}>
            <TextField
              fullWidth
              label="Minimum Length"
              type="number"
              value={formData.passwordPolicy?.minLength || 8}
              onChange={(e) => handlePasswordPolicyChange('minLength', parseInt(e.target.value))}
              InputProps={{ inputProps: { min: 6, max: 32 } }}
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <TextField
              fullWidth
              label="Password Expiry (days)"
              type="number"
              value={formData.passwordPolicy?.expiryDays || 0}
              onChange={(e) => handlePasswordPolicyChange('expiryDays', parseInt(e.target.value))}
              helperText="0 = never expires"
              InputProps={{ inputProps: { min: 0, max: 365 } }}
            />
          </Grid>
          <Grid xs={12}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.passwordPolicy?.requireUppercase || false}
                    onChange={(e) => handlePasswordPolicyChange('requireUppercase', e.target.checked)}
                  />
                }
                label="Require uppercase letters"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.passwordPolicy?.requireLowercase || false}
                    onChange={(e) => handlePasswordPolicyChange('requireLowercase', e.target.checked)}
                  />
                }
                label="Require lowercase letters"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.passwordPolicy?.requireNumbers || false}
                    onChange={(e) => handlePasswordPolicyChange('requireNumbers', e.target.checked)}
                  />
                }
                label="Require numbers"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.passwordPolicy?.requireSpecialChars || false}
                    onChange={(e) => handlePasswordPolicyChange('requireSpecialChars', e.target.checked)}
                  />
                }
                label="Require special characters"
              />
            </FormGroup>
          </Grid>
        </Grid>
      </Paper>

      {/* Login Security */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Login Security
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid xs={12} sm={6}>
            <TextField
              fullWidth
              label="Max Login Attempts"
              type="number"
              value={formData.maxLoginAttempts || 5}
              onChange={(e) => handleChange('maxLoginAttempts', parseInt(e.target.value))}
              InputProps={{ inputProps: { min: 3, max: 10 } }}
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <TextField
              fullWidth
              label="Lockout Duration (minutes)"
              type="number"
              value={formData.lockoutDuration || 15}
              onChange={(e) => handleChange('lockoutDuration', parseInt(e.target.value))}
              InputProps={{ inputProps: { min: 5, max: 60 } }}
            />
          </Grid>
          <Grid xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.requireEmailVerification || false}
                  onChange={(e) => handleChange('requireEmailVerification', e.target.checked)}
                />
              }
              label="Require email verification for new accounts"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* IP Whitelist */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          IP Whitelist
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            fullWidth
            label="IP Address"
            placeholder="e.g., 192.168.1.1"
            value={ipWhitelistInput}
            onChange={(e) => setIpWhitelistInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddIpToWhitelist()}
          />
          <Button variant="contained" onClick={handleAddIpToWhitelist}>
            Add
          </Button>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {formData.ipWhitelist && formData.ipWhitelist.length > 0 ? (
            formData.ipWhitelist.map((ip) => (
              <Chip
                key={ip}
                label={ip}
                onDelete={() => handleRemoveIpFromWhitelist(ip)}
                color="primary"
                variant="outlined"
              />
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No IP addresses in whitelist
            </Typography>
          )}
        </Box>
      </Paper>

      {/* API Access */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          API Access
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <FormControlLabel
          control={
            <Switch
              checked={formData.allowApiAccess || false}
              onChange={(e) => handleChange('allowApiAccess', e.target.checked)}
            />
          }
          label="Allow API access for this tenant"
        />
      </Paper>
    </Container>
  );
};

export default SecuritySettingsPage;

