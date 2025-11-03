// ============================================
// MAIN LAYOUT
// ============================================

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Toolbar, useTheme, useMediaQuery } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';

const MainLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Header */}
      <Header onMenuClick={handleDrawerToggle} />

      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={handleDrawerToggle}
        variant={isMobile ? 'temporary' : 'permanent'}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: 'background.default',
          minHeight: '100vh',
        }}
      >
        <Toolbar /> {/* Spacer for AppBar */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
