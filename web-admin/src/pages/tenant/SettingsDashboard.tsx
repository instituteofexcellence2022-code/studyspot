import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Button,
  Alert,
  CircularProgress

  } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { 
  fetchTenant,
  updateTenant
} from '../../store/slices/tenantSlice';

// Tab panels (will create)
import GeneralSettingsTab from '../../components/tenant/GeneralSettingsTab';
import BrandingTab from '../../components/tenant/BrandingTab';
import NotificationsTab from '../../components/tenant/NotificationsTab';
import SecurityTab from '../../components/tenant/SecurityTab';

/**
 * Tenant Settings Dashboard
 * Comprehensive settings management with tabs
 * 
 * @author Agent 2 - Senior Full-Stack Developer (20+ years)
 */

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const SettingsDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentTenant, currentTenantLoading, currentTenantError } = useAppSelector(
    (state) => state.tenant
  );

  const [activeTab, setActiveTab] = useState(0);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    dispatch(fetchCurrentTenant(true as any)); // Pass true to fetch current tenant
  }, [dispatch]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSave = async (data: any) => {
    if (!currentTenant) return;

    try {
      await dispatch(updateSettings({ id: currentTenant.id, settings: data } as any)).unwrap();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  if (currentTenantLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  if (currentTenantError) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{currentTenantError}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Manage your library settings and preferences
      </Typography>

      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Settings saved successfully!
        </Alert>
      )}

      <Paper elevation={2}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="General" />
          <Tab label="Branding" />
          <Tab label="Notifications" />
          <Tab label="Security" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <GeneralSettingsTab tenant={currentTenant} onSave={handleSave} />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <BrandingTab tenant={currentTenant} onSave={handleSave} />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <NotificationsTab tenant={currentTenant} onSave={handleSave} />
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <SecurityTab tenant={currentTenant} onSave={handleSave} />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default SettingsDashboard;

