import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Tabs,
  Tab,
  Alert,
  AlertTitle,
  LinearProgress,
  Divider
} from '@mui/material';
import { 
  Add as AddIcon, 
  Refresh as RefreshIcon, 
  Settings as SettingsIcon, 
  Warning as WarningIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchCreditBalance,
  fetchCreditUsageStats,
  fetchCreditAlerts,
  markAlertAsRead
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

  const { balance, usage } = useAppSelector((state) => state.credit);
  const alerts = { items: [] }; // Placeholder for alerts

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    dispatch(fetchCreditBalance() as any);
    dispatch(fetchCreditUsageStats({}) as any);
    dispatch(fetchCreditAlerts(false) as any);
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMarkAlertRead = (id: string) => {
    dispatch(markAlertAsRead(id) as any);
  };

  const criticalAlerts = alerts?.items?.filter((a: any) => a.severity === 'critical' && !a.isRead) || [];
  const warningAlerts = alerts?.items?.filter((a: any) => a.severity === 'warning' && !a.isRead) || [];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Credit Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your SMS and WhatsApp credits
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={balance.loading || usage.loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Alerts */}
      {criticalAlerts.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Critical Alerts</AlertTitle>
          {criticalAlerts.map((alert: any) => (
            <Box key={alert.id} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2">{alert.message}</Typography>
              <Button
                size="small"
                onClick={() => handleMarkAlertRead(alert.id)}
              >
                Mark as Read
              </Button>
            </Box>
          ))}
        </Alert>
      )}

      {warningAlerts.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>Warning Alerts</AlertTitle>
          {warningAlerts.map((alert: any) => (
            <Box key={alert.id} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2">{alert.message}</Typography>
              <Button
                size="small"
                onClick={() => handleMarkAlertRead(alert.id)}
              >
                Mark as Read
              </Button>
            </Box>
          ))}
        </Alert>
      )}

      {/* Balance Cards */}
      <Box display="flex" flexWrap="wrap" gap={3} mb={4}>
        <Box flex="1 1 300px">
          <CreditBalanceCard
            type="sms"
            balance={balance.data?.smsCredits || 0}
            reserved={balance.data?.smsReserved || 0}
            available={balance.data?.smsAvailable || 0}
            threshold={500}
            loading={balance.loading}
            onRefresh={handleRefresh}
          />
        </Box>
        <Box flex="1 1 300px">
          <CreditBalanceCard
            type="whatsapp"
            balance={balance.data?.whatsappCredits || 0}
            reserved={balance.data?.whatsappReserved || 0}
            available={balance.data?.whatsappAvailable || 0}
            threshold={500}
            loading={balance.loading}
            onRefresh={handleRefresh}
          />
        </Box>
      </Box>

      {/* Quick Actions */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Quick Actions
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={2} mt={1}>
            <Box flex="1 1 200px">
              <Button
                fullWidth
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => navigate('/credits/purchase')}
              >
                Buy Credits
              </Button>
            </Box>
            <Box flex="1 1 200px">
              <Button
                fullWidth
                variant="outlined"
                startIcon={<SettingsIcon />}
                onClick={() => navigate('/credits/auto-topup')}
              >
                Auto Top-up
              </Button>
            </Box>
            <Box flex="1 1 200px">
              <Button
                fullWidth
                variant="outlined"
                startIcon={<TrendingUpIcon />}
                onClick={() => navigate('/credits/analytics')}
              >
                Analytics
              </Button>
            </Box>
            <Box flex="1 1 200px">
              <Button
                fullWidth
                variant="outlined"
                startIcon={<HistoryIcon />}
                onClick={() => navigate('/credits/transactions')}
              >
                Transaction History
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Usage Overview */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Usage Overview
          </Typography>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Current Month" />
            <Tab label="Usage Stats" />
            <Tab label="Expiring Credits" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            {usage.loading ? (
              <LinearProgress />
            ) : usage.data ? (
              <Box display="flex" flexWrap="wrap" gap={3}>
                <Box flex="1 1 300px">
                  <Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      📱 SMS Usage
                    </Typography>
                    <Box mb={2}>
                      <Typography variant="h4" color="primary.main">
                        {usage.data?.byType?.sms?.toLocaleString() || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Credits Used
                      </Typography>
                    </Box>
                    <Box display="flex" gap={2}>
                      <Box flex="1">
                        <Typography variant="body2" color="text.secondary">
                          Messages Sent
                        </Typography>
                        <Typography variant="h6">{usage.data?.byType?.sms?.toLocaleString() || 0}</Typography>
                      </Box>
                      <Box flex="1">
                        <Typography variant="body2" color="text.secondary">
                          Avg Cost/SMS
                        </Typography>
                        <Typography variant="h6">
                          ₹{((usage.data?.byType?.sms || 0) * 0.1).toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                <Box flex="1 1 300px">
                  <Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      💬 WhatsApp Usage
                    </Typography>
                    <Box mb={2}>
                      <Typography variant="h4" color="primary.main">
                        {usage.data?.byType?.whatsapp?.toLocaleString() || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Credits Used
                      </Typography>
                    </Box>
                    <Box display="flex" gap={2}>
                      <Box flex="1">
                        <Typography variant="body2" color="text.secondary">
                          Messages Sent
                        </Typography>
                        <Typography variant="h6">{usage.data?.byType?.whatsapp?.toLocaleString() || 0}</Typography>
                      </Box>
                      <Box flex="1">
                        <Typography variant="body2" color="text.secondary">
                          Avg Cost/Msg
                        </Typography>
                        <Typography variant="h6">
                          ₹{((usage.data?.byType?.whatsapp || 0) * 0.15).toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                <Box flex="1 1 300px">
                  <Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      📊 Total Usage
                    </Typography>
                    <Box mb={2}>
                      <Typography variant="h4" color="primary.main">
                        {usage.data?.totalUsed?.toLocaleString() || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Credits Used
                      </Typography>
                    </Box>
                    <Box display="flex" gap={2}>
                      <Box flex="1">
                        <Typography variant="body2" color="text.secondary">
                          Total Transactions
                        </Typography>
                        <Typography variant="h6">{usage.data?.totalUsed?.toLocaleString() || 0}</Typography>
                      </Box>
                      <Box flex="1">
                        <Typography variant="body2" color="text.secondary">
                          Avg Cost/Transaction
                        </Typography>
                        <Typography variant="h6">
                          ₹{((usage.data?.totalUsed || 0) * 0.12).toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            ) : (
              <Typography color="text.secondary">No usage data available</Typography>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography color="text.secondary">Usage statistics coming soon...</Typography>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Typography color="text.secondary">Expiring credits information coming soon...</Typography>
          </TabPanel>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CreditDashboardPage;