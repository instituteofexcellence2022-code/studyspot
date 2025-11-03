import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  LibraryBooks as LibraryIcon,
  EventSeat as BookingIcon,
  People as UserIcon,
  AdminPanelSettings as AdminIcon,
  Person as ProfileIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

import { ROUTES } from '../../constants';
import { useAppSelector } from '../../hooks/redux';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  
  const { user } = useAppSelector((state) => state.auth);

  const drawerWidth = 240;

  const navigationItems = [
    {
      label: 'Dashboard',
      path: ROUTES.DASHBOARD,
      icon: <DashboardIcon />,
      roles: ['student', 'library_staff', 'library_admin', 'super_admin'],
    },
    {
      label: 'Libraries',
      path: ROUTES.LIBRARIES,
      icon: <LibraryIcon />,
      roles: ['library_staff', 'library_admin', 'super_admin'],
    },
    {
      label: 'Bookings',
      path: ROUTES.BOOKINGS,
      icon: <BookingIcon />,
      roles: ['student', 'library_staff', 'library_admin', 'super_admin'],
    },
    {
      label: 'Users',
      path: ROUTES.USERS,
      icon: <UserIcon />,
      roles: ['library_admin', 'super_admin'],
    },
    {
      label: 'Admin',
      path: ROUTES.ADMIN,
      icon: <AdminIcon />,
      roles: ['super_admin'],
    },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const filteredNavigationItems = navigationItems.filter(item =>
    item.roles.includes(user?.role || '')
  );

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" noWrap component="div">
          🎓 STUDYSPOT
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Library Booking Platform
        </Typography>
      </Box>

      {/* Navigation Items */}
      <List sx={{ flexGrow: 1, pt: 1 }}>
        {filteredNavigationItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleNavigation(ROUTES.PROFILE)}>
            <ListItemIcon>
              <ProfileIcon />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;

