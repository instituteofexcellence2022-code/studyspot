/**
 * Auto Top-up Configuration Page
 * 
 * Configure automatic credit recharge when balance falls below threshold
 * Phase 6 - Sprint 4: Credit Management
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  GridLegacy as Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Alert,
  Divider,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  PlayArrow as TestIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchAutoTopupConfigs,
  createAutoTopupConfig,
  updateAutoTopupConfig,
  deleteAutoTopupConfig,
  testAutoTopupConfig,
} from '../../store/slices/creditSlice';
import { AutoTopupCreateRequest, AutoTopupUpdateRequest } from '../../types';

const AutoTopupPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { autoTopup } = useAppSelector((state) => state.credit);

  // SMS Auto Top-up State
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [smsThreshold, setSmsThreshold] = useState(500);
  const [smsRechargeAmount, setSmsRechargeAmount] = useState(1000);
  const [smsMaxRecharges, setSmsMaxRecharges] = useState(5);
  const [smsNotifyOnTopup, setSmsNotifyOnTopup] = useState(true);
  const [smsEmail, setSmsEmail] = useState('');

  // WhatsApp Auto Top-up State
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [whatsappThreshold, setWhatsappThreshold] = useState(500);
  const [whatsappRechargeAmount, setWhatsappRechargeAmount] = useState(1000);
  const [whatsappMaxRecharges, setWhatsappMaxRecharges] = useState(5);
  const [whatsappNotifyOnTopup, setWhatsappNotifyOnTopup] = useState(true);
  const [whatsappEmail, setWhatsappEmail] = useState('');

  const [saveLoading, setSaveLoading] = useState(false);
  const [testLoading, setTestLoading] = useState<'sms' | 'whatsapp' | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchAutoTopupConfigs());
  }, [dispatch]);

  useEffect(() => {
    // Load SMS config
    if (autoTopup.sms) {
      setSmsEnabled(autoTopup.sms.enabled);
      setSmsThreshold(autoTopup.sms.threshold);
      setSmsRechargeAmount(autoTopup.sms.rechargeAmount);
      setSmsMaxRecharges(autoTopup.sms.maxAutoRecharges || 5);
      setSmsNotifyOnTopup(autoTopup.sms.notifyOnTopup);
      setSmsEmail(autoTopup.sms.notificationEmail || '');
    }

    // Load WhatsApp config
    if (autoTopup.whatsapp) {
      setWhatsappEnabled(autoTopup.whatsapp.enabled);
      setWhatsappThreshold(autoTopup.whatsapp.threshold);
      setWhatsappRechargeAmount(autoTopup.whatsapp.rechargeAmount);
      setWhatsappMaxRecharges(autoTopup.whatsapp.maxAutoRecharges || 5);
      setWhatsappNotifyOnTopup(autoTopup.whatsapp.notifyOnTopup);
      setWhatsappEmail(autoTopup.whatsapp.notificationEmail || '');
    }
  }, [autoTopup.sms, autoTopup.whatsapp]);

  const handleSaveSmsConfig = async () => {
    setSaveLoading(true);
    setSuccessMessage(null);
    
    try {
      const data: AutoTopupCreateRequest | AutoTopupUpdateRequest = {
        creditType: 'sms',
        enabled: smsEnabled,
        threshold: smsThreshold,
        rechargeAmount: smsRechargeAmount,
        maxAutoRecharges: smsMaxRecharges,
        notifyOnTopup: smsNotifyOnTopup,
        notificationEmail: smsEmail || undefined,
      };

      if (autoTopup.sms) {
        await dispatch(updateAutoTopupConfig({ type: 'sms', data })).unwrap();
      } else {
        await dispatch(createAutoTopupConfig(data as AutoTopupCreateRequest)).unwrap();
      }
      
      setSuccessMessage('SMS Auto Top-up configuration saved successfully');
    } catch (error) {
      console.error('Failed to save SMS config:', error);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveWhatsAppConfig = async () => {
    setSaveLoading(true);
    setSuccessMessage(null);
    
    try {
      const data: AutoTopupCreateRequest | AutoTopupUpdateRequest = {
        creditType: 'whatsapp',
        enabled: whatsappEnabled,
        threshold: whatsappThreshold,
        rechargeAmount: whatsappRechargeAmount,
        maxAutoRecharges: whatsappMaxRecharges,
        notifyOnTopup: whatsappNotifyOnTopup,
        notificationEmail: whatsappEmail || undefined,
      };

      if (autoTopup.whatsapp) {
        await dispatch(updateAutoTopupConfig({ type: 'whatsapp', data })).unwrap();
      } else {
        await dispatch(createAutoTopupConfig(data as AutoTopupCreateRequest)).unwrap();
      }
      
      setSuccessMessage('WhatsApp Auto Top-up configuration saved successfully');
    } catch (error) {
      console.error('Failed to save WhatsApp config:', error);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleTestConfig = async (type: 'sms' | 'whatsapp') => {
    setTestLoading(type);
    try {
      const result = await dispatch(testAutoTopupConfig(type)).unwrap();
      alert(result.message);
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setTestLoading(null);
    }
  };

  const handleDeleteConfig = async (type: 'sms' | 'whatsapp') => {
    if (window.confirm(`Are you sure you want to delete the ${type === 'sms' ? 'SMS' : 'WhatsApp'} Auto Top-up configuration?`)) {
      try {
        await dispatch(deleteAutoTopupConfig(type)).unwrap();
        setSuccessMessage(`${type === 'sms' ? 'SMS' : 'WhatsApp'} Auto Top-up configuration deleted`);
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/credits')} sx={{ mb: 2 }}>
          Back to Dashboard
        </Button>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          ⚙️ Auto Top-up Configuration
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Automatically recharge credits when balance falls below threshold
        </Typography>
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {autoTopup.loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* SMS Auto Top-up */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="bold">
                    📱 SMS Auto Top-up
                  </Typography>
                  {autoTopup.sms && (
                    <Chip
                      label={autoTopup.sms.enabled ? 'Active' : 'Inactive'}
                      color={autoTopup.sms.enabled ? 'success' : 'default'}
                      size="small"
                    />
                  )}
                </Box>

                <FormControlLabel
                  control={<Switch checked={smsEnabled} onChange={(e) => setSmsEnabled(e.target.checked)} />}
                  label="Enable Auto Top-up for SMS"
                />

                <Divider sx={{ my: 2 }} />

                <Box sx={{ opacity: smsEnabled ? 1 : 0.5, pointerEvents: smsEnabled ? 'auto' : 'none' }}>
                  <TextField
                    fullWidth
                    label="Threshold (credits)"
                    type="number"
                    value={smsThreshold}
                    onChange={(e) => setSmsThreshold(parseInt(e.target.value) || 0)}
                    helperText="Trigger auto top-up when balance falls below this amount"
                    margin="normal"
                    inputProps={{ min: 0 }}
                  />

                  <TextField
                    fullWidth
                    label="Recharge Amount (credits)"
                    type="number"
                    value={smsRechargeAmount}
                    onChange={(e) => setSmsRechargeAmount(parseInt(e.target.value) || 0)}
                    helperText="Number of credits to add during auto top-up"
                    margin="normal"
                    inputProps={{ min: 0 }}
                  />

                  <TextField
                    fullWidth
                    label="Max Auto Recharges"
                    type="number"
                    value={smsMaxRecharges}
                    onChange={(e) => setSmsMaxRecharges(parseInt(e.target.value) || 0)}
                    helperText="Maximum number of automatic recharges per month"
                    margin="normal"
                    inputProps={{ min: 1, max: 10 }}
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={smsNotifyOnTopup}
                        onChange={(e) => setSmsNotifyOnTopup(e.target.checked)}
                      />
                    }
                    label="Send notification on auto top-up"
                    sx={{ mt: 2 }}
                  />

                  {smsNotifyOnTopup && (
                    <TextField
                      fullWidth
                      label="Notification Email"
                      type="email"
                      value={smsEmail}
                      onChange={(e) => setSmsEmail(e.target.value)}
                      helperText="Email to receive notifications (optional)"
                      margin="normal"
                    />
                  )}

                  {autoTopup.sms && (
                    <Box mt={2} p={2} bgcolor="grey.100" borderRadius={1}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Last Triggered: {autoTopup.sms.lastTriggeredAt || 'Never'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Triggered Count: {autoTopup.sms.triggeredCount} times
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Box display="flex" gap={2} mt={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={saveLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                    onClick={handleSaveSmsConfig}
                    disabled={saveLoading}
                  >
                    Save
                  </Button>
                  {autoTopup.sms && (
                    <>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={testLoading === 'sms' ? <CircularProgress size={20} /> : <TestIcon />}
                        onClick={() => handleTestConfig('sms')}
                        disabled={testLoading === 'sms'}
                      >
                        Test
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteConfig('sms')}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* WhatsApp Auto Top-up */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="bold">
                    💬 WhatsApp Auto Top-up
                  </Typography>
                  {autoTopup.whatsapp && (
                    <Chip
                      label={autoTopup.whatsapp.enabled ? 'Active' : 'Inactive'}
                      color={autoTopup.whatsapp.enabled ? 'success' : 'default'}
                      size="small"
                    />
                  )}
                </Box>

                <FormControlLabel
                  control={
                    <Switch
                      checked={whatsappEnabled}
                      onChange={(e) => setWhatsappEnabled(e.target.checked)}
                    />
                  }
                  label="Enable Auto Top-up for WhatsApp"
                />

                <Divider sx={{ my: 2 }} />

                <Box sx={{ opacity: whatsappEnabled ? 1 : 0.5, pointerEvents: whatsappEnabled ? 'auto' : 'none' }}>
                  <TextField
                    fullWidth
                    label="Threshold (credits)"
                    type="number"
                    value={whatsappThreshold}
                    onChange={(e) => setWhatsappThreshold(parseInt(e.target.value) || 0)}
                    helperText="Trigger auto top-up when balance falls below this amount"
                    margin="normal"
                    inputProps={{ min: 0 }}
                  />

                  <TextField
                    fullWidth
                    label="Recharge Amount (credits)"
                    type="number"
                    value={whatsappRechargeAmount}
                    onChange={(e) => setWhatsappRechargeAmount(parseInt(e.target.value) || 0)}
                    helperText="Number of credits to add during auto top-up"
                    margin="normal"
                    inputProps={{ min: 0 }}
                  />

                  <TextField
                    fullWidth
                    label="Max Auto Recharges"
                    type="number"
                    value={whatsappMaxRecharges}
                    onChange={(e) => setWhatsappMaxRecharges(parseInt(e.target.value) || 0)}
                    helperText="Maximum number of automatic recharges per month"
                    margin="normal"
                    inputProps={{ min: 1, max: 10 }}
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={whatsappNotifyOnTopup}
                        onChange={(e) => setWhatsappNotifyOnTopup(e.target.checked)}
                      />
                    }
                    label="Send notification on auto top-up"
                    sx={{ mt: 2 }}
                  />

                  {whatsappNotifyOnTopup && (
                    <TextField
                      fullWidth
                      label="Notification Email"
                      type="email"
                      value={whatsappEmail}
                      onChange={(e) => setWhatsappEmail(e.target.value)}
                      helperText="Email to receive notifications (optional)"
                      margin="normal"
                    />
                  )}

                  {autoTopup.whatsapp && (
                    <Box mt={2} p={2} bgcolor="grey.100" borderRadius={1}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Last Triggered: {autoTopup.whatsapp.lastTriggeredAt || 'Never'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Triggered Count: {autoTopup.whatsapp.triggeredCount} times
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Box display="flex" gap={2} mt={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={saveLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                    onClick={handleSaveWhatsAppConfig}
                    disabled={saveLoading}
                  >
                    Save
                  </Button>
                  {autoTopup.whatsapp && (
                    <>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={testLoading === 'whatsapp' ? <CircularProgress size={20} /> : <TestIcon />}
                        onClick={() => handleTestConfig('whatsapp')}
                        disabled={testLoading === 'whatsapp'}
                      >
                        Test
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteConfig('whatsapp')}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Info Card */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            ℹ️ How Auto Top-up Works
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Auto Top-up automatically adds credits to your account when your balance falls below the set threshold.
          </Typography>
          <Typography variant="body2" color="text.secondary" component="ul">
            <li>Your balance is checked automatically every hour</li>
            <li>When balance falls below threshold, credits are added automatically</li>
            <li>Payment is charged to your default payment method</li>
            <li>You receive a notification email after each auto top-up</li>
            <li>Auto top-ups are limited to the maximum number you set per month</li>
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AutoTopupPage;

