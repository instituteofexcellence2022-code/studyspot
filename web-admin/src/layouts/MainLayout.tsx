import React, { useState, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery

  } from '@mui/material';
import { Logout, Notifications as NotificationsIcon, AccountCircle, Settings, Menu as MenuIcon } from '@mui/icons-material';

const Sidebar = React.lazy(() => import('../components/common/Sidebar'));
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { logout } from '../store/slices/authSlice';
import { toggleSidebar } from '../store/slices/uiSlice';
import { usePerformance } from '../hooks/usePerformance';
const PerformanceDashboard = React.lazy(() => import('../components/common/PerformanceDashboard'));
import { FEATURE_FLAGS } from '../config/environment';

const MainLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useAppDispatch();
  const { trackInteraction } = usePerformance();
  
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { sidebarOpen } = useAppSelector((state) => state.ui);
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const [isPerformanceOpen, setIsPerformanceOpen] = useState(true);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleProfileMenuClose();
  };

  const handleToggleSidebar = () => {
    trackInteraction('sidebar_toggle');
    dispatch(toggleSidebar());
  };

  // Render layout even if not authenticated (dev preview)

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Suspense fallback={<Box sx={{ width: 240 }} />}> 
        <Sidebar open={sidebarOpen} onClose={handleToggleSidebar} />
      </Suspense>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen}),
          ...(sidebarOpen && !isMobile && {
            marginLeft: '240px',
            width: 'calc(100% - 240px)'})}}
      >
        {/* Top App Bar */}
        <AppBar
          position="fixed"
          sx={{
            zIndex: theme.zIndex.drawer + 1,
            ...(sidebarOpen && !isMobile && {
              width: 'calc(100% - 240px)',
              marginLeft: '240px'})}}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="toggle sidebar"
              onClick={handleToggleSidebar}
              edge="start"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>

            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              🎓 STUDYSPOT
            </Typography>

            {/* Notifications */}
            <IconButton
              color="inherit"
              aria-label="notifications"
              onClick={handleNotificationMenuOpen}
            >
              <NotificationsIcon />
            </IconButton>

            {/* Profile Menu */}
            <IconButton
              color="inherit"
              aria-label="profile"
              onClick={handleProfileMenuOpen}
              edge="end"
            >
              <Avatar
                sx={{ width: 32, height: 32 }}
                alt={user?.firstName}
              >
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Avatar>
            </IconButton>

            {/* Profile Menu Dropdown */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
              onClick={handleProfileMenuClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                  mt: 1.5,
                  '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1},
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0}}}}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleProfileMenuClose}>
                <Avatar sx={{ width: 32, height: 32 }} />
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    {user?.firstName} {user?.lastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user?.email}
                  </Typography>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleProfileMenuClose}>
                <AccountCircle sx={{ mr: 1 }} />
                Profile
              </MenuItem>
              <MenuItem onClick={handleProfileMenuClose}>
                <Settings sx={{ mr: 1 }} />
                Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>

            {/* Notifications Menu */}
            <Menu
              anchorEl={notificationAnchorEl}
              open={Boolean(notificationAnchorEl)}
              onClose={handleNotificationMenuClose}
              PaperProps={{
                sx: {
                  width: 320,
                  maxHeight: 400}}}
            >
              <MenuItem>
                <Typography variant="h6" sx={{ p: 1 }}>
                  Notifications
                </Typography>
              </MenuItem>
              <Divider />
              <MenuItem>
                <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                  No new notifications
                </Typography>
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            mt: 8, // Account for AppBar height
          }}
        >
          <Outlet />
        </Box>
      </Box>
      
              {/* Performance Dashboard - Development Only */}
              {FEATURE_FLAGS.ENABLE_PERFORMANCE_MONITORING && (
                <Suspense fallback={null}>
                  <PerformanceDashboard 
                    isOpen={isPerformanceOpen}
                    onClose={() => setIsPerformanceOpen(false)}
                  />
                </Suspense>
              )}
    </Box>
  );
};

export default MainLayout;

