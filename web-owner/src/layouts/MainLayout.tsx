import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
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
  useMediaQuery,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Settings,
  Logout,
  Message as MessageIcon,
} from '@mui/icons-material';

import Sidebar from '../components/common/Sidebar';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { logout } from '../store/slices/authSlice';
import { toggleSidebar } from '../store/slices/uiSlice';
import { ROUTES } from '../constants';

const MainLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { sidebarOpen } = useAppSelector((state) => state.ui);
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const unreadMessages = 2; // TODO: Fetch from API

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

  const handleNavigateToProfile = () => {
    navigate(ROUTES.PROFILE);
    handleProfileMenuClose();
  };

  const handleNavigateToSettings = () => {
    navigate(ROUTES.SETTINGS);
    handleProfileMenuClose();
  };

  const handleLogout = () => {
    dispatch(logout());
    handleProfileMenuClose();
    navigate(ROUTES.LOGIN);
  };

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  // Remove role-based access check - show layout for all authenticated users

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={handleToggleSidebar} />

      {/* Top App Bar - Fixed at top, stays above sidebar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: '#FFFFFF',
          color: 'text.primary',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
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

            {/* Messages */}
            <IconButton
              color="inherit"
              aria-label="messages"
              onClick={() => navigate('/messages')}
            >
              <Badge badgeContent={unreadMessages} color="error">
                <MessageIcon />
              </Badge>
            </IconButton>

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
                src={(user as any)?.profileImage || (user as any)?.avatar || (user as any)?.metadata?.profileImage}
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
                    mr: 1,
                  },
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
                    zIndex: 0,
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleNavigateToProfile}>
                <Avatar 
                  sx={{ width: 32, height: 32 }}
                  src={(user as any)?.profileImage || (user as any)?.avatar || (user as any)?.metadata?.profileImage}
                >
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </Avatar>
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
              <MenuItem onClick={handleNavigateToProfile}>
                <AccountCircle sx={{ mr: 1 }} />
                Profile
              </MenuItem>
              <MenuItem onClick={handleNavigateToSettings}>
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
                  maxHeight: 400,
                },
              }}
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

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: theme.palette.mode === 'dark' ? '#121212' : '#f5f5f5',
          minHeight: '100vh',
        }}
      >
        <Toolbar /> {/* Spacer for AppBar */}
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;

