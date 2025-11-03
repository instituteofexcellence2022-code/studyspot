// ============================================
// CRM - UNIFIED DASHBOARD
// ============================================

import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Tabs,
  Tab,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

// Import the existing lead and contact list components (we'll reuse their logic)
import LeadsListPage from './LeadsListPage';
import ContactsListPage from './ContactsListPage';

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
      id={`crm-tabpanel-${index}`}
      aria-labelledby={`crm-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const CRMDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Mock stats for the overview
  const stats = {
    totalLeads: 8,
    totalContacts: 10,
    pipelineValue: 205000,
    activeCustomers: 4,
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            CRM - Customer Relationship Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage leads, contacts, and customer relationships
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            if (activeTab === 0) {
              toast.info('Overview - Select Leads or Contacts tab to add');
            } else if (activeTab === 1) {
              toast.info('Add new lead form coming soon!');
            } else if (activeTab === 2) {
              toast.info('Add new contact form coming soon!');
            }
          }}
        >
          {activeTab === 0 ? 'Quick Add' : activeTab === 1 ? 'Add Lead' : 'Add Contact'}
        </Button>
      </Box>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab label="Overview" />
          <Tab label="Leads (Sales Pipeline)" />
          <Tab label="Contacts (All Relationships)" />
        </Tabs>

        {/* Tab 0: Overview */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ p: 3 }}>
            {/* Stats Cards */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                gap: 3,
                mb: 4,
              }}
            >
              <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
                <Box sx={{ p: 3 }}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <TrendingUpIcon sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.totalLeads}
                      </Typography>
                      <Typography variant="body2">Total Leads</Typography>
                    </Box>
                  </Stack>
                  <Typography variant="caption">Active sales pipeline</Typography>
                </Box>
              </Card>

              <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
                <Box sx={{ p: 3 }}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <PeopleIcon sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.totalContacts}
                      </Typography>
                      <Typography variant="body2">Total Contacts</Typography>
                    </Box>
                  </Stack>
                  <Typography variant="caption">All relationships</Typography>
                </Box>
              </Card>

              <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
                <Box sx={{ p: 3 }}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <AttachMoneyIcon sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {formatCurrency(stats.pipelineValue)}
                      </Typography>
                      <Typography variant="body2">Pipeline Value</Typography>
                    </Box>
                  </Stack>
                  <Typography variant="caption">Total opportunity value</Typography>
                </Box>
              </Card>

              <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
                <Box sx={{ p: 3 }}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <BusinessIcon sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.activeCustomers}
                      </Typography>
                      <Typography variant="body2">Active Customers</Typography>
                    </Box>
                  </Stack>
                  <Typography variant="caption">Paying customers</Typography>
                </Box>
              </Card>
            </Box>

            {/* Quick Info */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                gap: 3,
              }}
            >
              <Card>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    📊 Leads (Sales Pipeline)
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Track potential customers through your sales process. Monitor lead status,
                    pipeline value, and conversion rates.
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    Use for:
                  </Typography>
                  <Typography variant="body2" color="text.secondary" component="ul" sx={{ pl: 2 }}>
                    <li>New prospects</li>
                    <li>Sales opportunities</li>
                    <li>Deal tracking</li>
                    <li>Conversion monitoring</li>
                  </Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => setActiveTab(1)}
                  >
                    Go to Leads
                  </Button>
                </Box>
              </Card>

              <Card>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    👥 Contacts (All Relationships)
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Manage all business relationships including customers, partners, and vendors.
                    Track communication history and relationship health.
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    Use for:
                  </Typography>
                  <Typography variant="body2" color="text.secondary" component="ul" sx={{ pl: 2 }}>
                    <li>Existing customers</li>
                    <li>Business partners</li>
                    <li>Vendors & suppliers</li>
                    <li>Long-term relationships</li>
                  </Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => setActiveTab(2)}
                  >
                    Go to Contacts
                  </Button>
                </Box>
              </Card>
            </Box>

            {/* Info Box */}
            <Card sx={{ mt: 3, bgcolor: 'info.light', borderLeft: 4, borderColor: 'info.main' }}>
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" fontWeight="medium" gutterBottom>
                  💡 <strong>Tip:</strong> Leads vs Contacts
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Leads</strong> are in your sales pipeline (not yet customers). Once converted,
                  they become <strong>Contacts</strong> (customers). Use Contacts for all ongoing
                  relationships including partners and vendors.
                </Typography>
              </Box>
            </Card>
          </Box>
        </TabPanel>

        {/* Tab 1: Leads */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ px: 3, pb: 3 }}>
            <LeadsListPage />
          </Box>
        </TabPanel>

        {/* Tab 2: Contacts */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ px: 3, pb: 3 }}>
            <ContactsListPage />
          </Box>
        </TabPanel>
      </Card>
    </Box>
  );
};

export default CRMDashboard;

