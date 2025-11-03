// ============================================
// MAIN LAYOUT
// ============================================

import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Notifications,
  NotificationsActive,
  Settings,
  Logout,
  Dashboard,
  Business,
  People,
  Assessment,
  AdminPanelSettings,
  Description,
  History,
  Contacts,
  Email,
  Speed,
  AccountBalance,
  ExpandLess,
  ExpandMore,
  CreditCard,
  Subscriptions,
  Payment as PaymentIcon,
} from '@mui/icons-material';

import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { logout } from '../store/slices/authSlice';
import { ROUTES } from '../config/constants';

const DRAWER_WIDTH = 260;

const MainLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  
  const { user } = useAppSelector((state) => state.auth);
  
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null);
  const [notificationMenuAnchor, setNotificationMenuAnchor] = useState<null | HTMLElement>(null);
  const [openSubmenus, setOpenSubmenus] = useState<{ [key: string]: boolean }>({});

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationMenuAnchor(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationMenuAnchor(null);
  };

  const handleLogout = async () => {
    handleProfileMenuClose();
    await dispatch(logout());
    navigate(ROUTES.LOGIN);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const handleSubmenuToggle = (title: string) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  // Navigation items
  const navigationItems = [
    { title: 'Dashboard', icon: <Dashboard />, path: ROUTES.DASHBOARD },
    { title: 'Tenants', icon: <Business />, path: '/tenants' },
    { title: 'Users', icon: <People />, path: '/users' },
    { 
      title: 'Revenue & Billing', 
      icon: <AccountBalance />, 
      path: '/revenue/dashboard',
      subItems: [
        { title: 'Dashboard', path: '/revenue/dashboard' },
        { title: 'Invoices', path: '/revenue/invoices' },
        { title: 'Payment Methods', path: '/revenue/payment-methods' },
        { title: 'Dunning', path: '/revenue/dunning' },
        { title: 'Analytics', path: '/revenue/analytics' },
      ]
    },
    { title: 'Payments', icon: <PaymentIcon />, path: '/payments' },
    { title: 'Credit Management', icon: <CreditCard />, path: '/credits/dashboard' },
    { title: 'Subscriptions', icon: <Subscriptions />, path: '/subscriptions' },
    
    // Operations Section
    { title: 'CRM', icon: <Contacts />, path: '/crm' },
    { title: 'Messaging', icon: <Email />, path: '/messaging' },
    { title: 'Notifications', icon: <Badge badgeContent={3} color="error"><NotificationsActive /></Badge>, path: '/notifications' },
    { title: 'System Health', icon: <Speed />, path: '/system-health' },
    { title: 'API Docs', icon: <Description />, path: '/api-docs' },
    
    // Settings & Admin
    { title: 'Analytics', icon: <Assessment />, path: '/analytics' },
    { title: 'Reports', icon: <Description />, path: '/reports' },
    { title: 'Roles & Permissions', icon: <AdminPanelSettings />, path: '/rbac/roles' },
    { title: 'Settings', icon: <Settings />, path: '/settings' },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(!isMobile && {
            marginLeft: DRAWER_WIDTH,
            width: `calc(100% - ${DRAWER_WIDTH}px)`,
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <AdminPanelSettings sx={{ mr: 1 }} />
            <Typography variant="h6" noWrap component="div">
              STUDYSPOT Admin
            </Typography>
          </Box>

          {/* Notifications */}
          <IconButton
            color="inherit"
            onClick={handleNotificationMenuOpen}
            sx={{ mr: 1 }}
          >
            <Badge badgeContent={3} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          {/* Profile Menu */}
          <IconButton
            color="inherit"
            onClick={handleProfileMenuOpen}
            edge="end"
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: theme.palette.secondary.main,
              }}
            >
              {user?.name?.charAt(0) || 'A'}
            </Avatar>
          </IconButton>

          {/* Profile Dropdown Menu */}
          <Menu
            anchorEl={profileMenuAnchor}
            open={Boolean(profileMenuAnchor)}
            onClose={handleProfileMenuClose}
            onClick={handleProfileMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={() => navigate('/profile')}>
              <AccountCircle sx={{ mr: 2 }} /> Profile
            </MenuItem>
            <MenuItem onClick={() => navigate('/settings')}>
              <Settings sx={{ mr: 2 }} /> Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 2 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? drawerOpen : true}
        onClose={handleDrawerToggle}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', py: 2 }}>
          <List>
            {navigationItems.map((item, index) => (
              <React.Fragment key={item.title}>
                {item.subItems ? (
                  <>
                    <ListItem disablePadding>
                      <ListItemButton onClick={() => handleSubmenuToggle(item.title)}>
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.title} />
                        {openSubmenus[item.title] ? <ExpandLess /> : <ExpandMore />}
                      </ListItemButton>
                    </ListItem>
                    {openSubmenus[item.title] && item.subItems.map((subItem) => (
                      <ListItem key={subItem.title} disablePadding sx={{ pl: 4 }}>
                        <ListItemButton
                          selected={location.pathname === subItem.path}
                          onClick={() => handleNavigate(subItem.path)}
                        >
                          <ListItemText primary={subItem.title} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </>
                ) : (
                  <ListItem disablePadding>
                    <ListItemButton
                      selected={location.pathname === item.path}
                      onClick={() => handleNavigate(item.path)}
                    >
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.title} />
                    </ListItemButton>
                  </ListItem>
                )}
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
