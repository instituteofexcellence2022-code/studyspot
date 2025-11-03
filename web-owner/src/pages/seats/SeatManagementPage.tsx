import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  EditLocationAlt,
} from '@mui/icons-material';

import UserFriendlyDesigner from './UserFriendlyDesigner';
import LibrarySeatBooking from './LibrarySeatBooking';
import ZoneManagement from './ZoneManagement';
import CapacityPlanning from './CapacityPlanning';
import BookingRulesConfig from './BookingRulesConfig';

const SeatManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { label: '📚 Easy Designer', icon: <EditLocationAlt />, component: <UserFriendlyDesigner /> },
    { label: '📚 Seat Booking View', icon: <EditLocationAlt />, component: <LibrarySeatBooking /> },
    { label: '📍 Zone Management', icon: <EditLocationAlt />, component: <ZoneManagement /> },
    { label: '📊 Capacity Planning', icon: <EditLocationAlt />, component: <CapacityPlanning /> },
    { label: '📜 Booking Rules', icon: <EditLocationAlt />, component: <BookingRulesConfig /> },
  ];

  return (
    <Box>
      {/* Breadcrumbs */}
      <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Breadcrumbs>
          <Link underline="hover" color="inherit" href="/">
            Dashboard
          </Link>
          <Typography color="text.primary">Seat & Space Management</Typography>
        </Breadcrumbs>
      </Box>

      {/* Main Content */}
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 112px)' }}>
        {/* Tabs */}
        <Paper sx={{ borderRadius: 0 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                label={tab.label}
                icon={tab.icon}
                iconPosition="start"
                sx={{ minHeight: 64 }}
              />
            ))}
          </Tabs>
        </Paper>

        {/* Tab Content */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', bgcolor: 'grey.50' }}>
          {tabs[activeTab].component}
        </Box>
      </Box>
    </Box>
  );
};

export default SeatManagementPage;

