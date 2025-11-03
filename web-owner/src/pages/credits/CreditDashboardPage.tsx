/**
 * Credit Dashboard Page
 * 
 * Main overview page for credit management with balances, usage, and alerts
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
  Alert,
  AlertTitle,
  Tabs,
  Tab,
  LinearProgress,
  Chip,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchCreditBalance,
  fetchCreditUsageStats,
  fetchCreditAlerts,
  markAlertAsRead,
} from '../../store/slices/creditSlice';
import CreditBalanceCard from '../../components/credits/CreditBalanceCard';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const CreditDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [tabValue, setTabValue] = useState(0);

  const { balance, usage, alerts } = useAppSelector((state) => state.credit);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    dispatch(fetchCreditBalance());
    dispatch(fetchCreditUsageStats({}));
    dispatch(fetchCreditAlerts(false));
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMarkAlertRead = (id: string) => {
    dispatch(markAlertAsRead(id));
  };

  const criticalAlerts = alerts.items.filter((a) => a.severity === 'critical' && !a.isRead);
  const warningAlerts = alerts.items.filter((a) => a.severity === 'warning' && !a.isRead);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            💳 Credit Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your SMS and WhatsApp credits
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={balance.loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/credits/purchase')}
          >
            Buy Credits
          </Button>
        </Box>
      </Box>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Critical Alerts ({criticalAlerts.length})</AlertTitle>
          {criticalAlerts.slice(0, 2).map((alert) => (
            <Box key={alert.id} display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2">{alert.message}</Typography>
              <Button size="small" onClick={() => handleMarkAlertRead(alert.id)}>
                Dismiss
              </Button>
            </Box>
          ))}
        </Alert>
      )}

      {/* Warning Alerts */}
      {warningAlerts.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>Warnings ({warningAlerts.length})</AlertTitle>
          {warningAlerts.slice(0, 2).map((alert) => (
            <Box key={alert.id} display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2">{alert.message}</Typography>
              <Button size="small" onClick={() => handleMarkAlertRead(alert.id)}>
                Dismiss
              </Button>
            </Box>
          ))}
        </Alert>
      )}

      {/* Balance Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <CreditBalanceCard
            type="sms"
            balance={balance.data?.smsCredits || 0}
            reserved={balance.data?.smsReserved || 0}
            available={balance.data?.smsAvailable || 0}
            threshold={500}
            loading={balance.loading}
            onRefresh={handleRefresh}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CreditBalanceCard
            type="whatsapp"
            balance={balance.data?.whatsappCredits || 0}
            reserved={balance.data?.whatsappReserved || 0}
            available={balance.data?.whatsappAvailable || 0}
            threshold={500}
            loading={balance.loading}
            onRefresh={handleRefresh}
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => navigate('/credits/purchase')}
              >
                Buy Credits
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<SettingsIcon />}
                onClick={() => navigate('/credits/auto-topup')}
              >
                Auto Top-up
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<TrendingUpIcon />}
                onClick={() => navigate('/credits/analytics')}
              >
                View Analytics
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<HistoryIcon />}
                onClick={() => navigate('/credits/transactions')}
              >
                Transaction History
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Usage Overview */}
      <Card>
        <CardContent>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Current Month" />
            <Tab label="Usage Stats" />
            <Tab label="Expiring Credits" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            {usage.loading ? (
              <LinearProgress />
            ) : usage.stats ? (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      📱 SMS Usage
                    </Typography>
                    <Box mb={2}>
                      <Typography variant="h4" color="primary.main">
                        {usage.stats.sms.used.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Credits Used
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Messages Sent
                        </Typography>
                        <Typography variant="h6">{usage.stats.sms.count.toLocaleString()}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Avg Cost/SMS
                        </Typography>
                        <Typography variant="h6">
                          ₹{usage.stats.sms.avgCostPerSMS.toFixed(2)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      💬 WhatsApp Usage
                    </Typography>
                    <Box mb={2}>
                      <Typography variant="h4" color="primary.main">
                        {usage.stats.whatsapp.used.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Credits Used
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Messages Sent
                        </Typography>
                        <Typography variant="h6">
                          {usage.stats.whatsapp.count.toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Avg Cost/Msg
                        </Typography>
                        <Typography variant="h6">
                          ₹{usage.stats.whatsapp.avgCostPerMessage.toFixed(2)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Credits Used
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {usage.stats.total.credits.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Cost
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        ₹{usage.stats.total.cost.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Transactions
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {usage.stats.total.transactions.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            ) : (
              <Typography color="text.secondary">No usage data available</Typography>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
              Detailed usage statistics available in Analytics page
            </Typography>
            <Box textAlign="center">
              <Button
                variant="contained"
                onClick={() => navigate('/credits/analytics')}
              >
                View Analytics
              </Button>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {balance.data?.expiringCredits && balance.data.expiringCredits.length > 0 ? (
              <Grid container spacing={2}>
                {balance.data.expiringCredits.map((exp, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Alert severity="warning" icon={<WarningIcon />}>
                      <AlertTitle>
                        {exp.type === 'sms' ? 'SMS' : 'WhatsApp'} Credits Expiring
                      </AlertTitle>
                      <Typography variant="body2">
                        {exp.credits.toLocaleString()} credits will expire on{' '}
                        {new Date(exp.expiryDate).toLocaleDateString()}
                      </Typography>
                    </Alert>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography color="text.secondary" textAlign="center" py={4}>
                No credits expiring soon
              </Typography>
            )}
          </TabPanel>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CreditDashboardPage;

