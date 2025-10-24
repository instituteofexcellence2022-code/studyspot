import React, { useState } from 'react';
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
  Avatar,
  Chip,
  Badge,
  Collapse,
  IconButton,
  Tooltip,
  alpha,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  LibraryBooks as LibraryIcon,
  EventSeat as SeatIcon,
  People as StudentIcon,
  AttachMoney as PaymentIcon,
  CalendarToday as AttendanceIcon,
  Group as StaffIcon,
  Assessment as AnalyticsIcon,
  CreditCard,
  MonetizationOn as FeePlanIcon,
  Bookmarks as BookingIcon,
  SupervisorAccount as UserIcon,
  AdminPanelSettings as AdminIcon,
  Person as ProfileIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ExpandLess,
  ExpandMore,
  Notifications,
  TrendingUp,
  Assignment,
  MenuBook,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  EditLocationAlt,
} from '@mui/icons-material';

import { ROUTES } from '../../constants';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { logout } from '../../store/slices/authSlice';
import { toggleTheme } from '../../store/themeSlice';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

interface NavigationItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: string[];
  badge?: {
    count?: number;
    color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
    text?: string;
  };
  description?: string;
  section?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  
  const { user } = useAppSelector((state) => state.auth);
  
  const [expandedSections, setExpandedSections] = useState<string[]>(['main', 'management']);

  const drawerWidth = 260;

  const navigationItems: NavigationItem[] = [
    // Main Section
    {
      label: 'Dashboard',
      path: ROUTES.DASHBOARD,
      icon: <DashboardIcon />,
      roles: ['student', 'library_staff', 'library_owner', 'branch_manager', 'super_admin'],
      description: 'Overview & Analytics',
      section: 'main',
      badge: { text: 'Live', color: 'success' }
    },
    
    // Management Section
    {
      label: 'Libraries',
      path: ROUTES.LIBRARIES,
      icon: <LibraryIcon />,
      roles: ['library_staff', 'library_owner', 'branch_manager', 'super_admin'],
      description: 'Manage library branches',
      section: 'management',
      badge: { count: 12, color: 'primary' }
    },
    {
      label: 'Seats',
      path: ROUTES.SEATS,
      icon: <SeatIcon />,
      roles: ['library_staff', 'library_owner', 'branch_manager', 'super_admin'],
      description: 'Seat allocation & zones',
      section: 'management',
      badge: { count: 350, color: 'success' }
    },
    {
      label: 'Fee Plans',
      path: ROUTES.FEE_PLANS,
      icon: <FeePlanIcon />,
      roles: ['library_staff', 'library_owner', 'branch_manager', 'finance_manager', 'super_admin'],
      description: 'Pricing & subscriptions',
      section: 'management',
      badge: { count: 4, color: 'warning' }
    },
    
    // Users Section
    {
      label: 'Students',
      path: ROUTES.STUDENTS,
      icon: <StudentIcon />,
      roles: ['library_staff', 'library_owner', 'branch_manager', 'super_admin'],
      description: 'Student management',
      section: 'users',
      badge: { count: 234, color: 'info', text: 'API' }
    },
    {
      label: 'Staff',
      path: ROUTES.STAFF,
      icon: <StaffIcon />,
      roles: ['library_owner', 'branch_manager', 'super_admin'],
      description: 'Staff & roles',
      section: 'users',
      badge: { count: 15, color: 'secondary' }
    },
    
    // Operations Section
    {
      label: 'Attendance',
      path: ROUTES.ATTENDANCE,
      icon: <AttendanceIcon />,
      roles: ['library_staff', 'library_owner', 'branch_manager', 'front_desk_staff', 'super_admin'],
      description: 'Check-in & tracking',
      section: 'operations',
      badge: { count: 85, color: 'info', text: 'Today' }
    },
    {
      label: 'Payments',
      path: ROUTES.PAYMENTS,
      icon: <PaymentIcon />,
      roles: ['library_staff', 'library_owner', 'branch_manager', 'finance_manager', 'super_admin'],
      description: 'Transactions & billing',
      section: 'operations',
      badge: { text: '₹12K', color: 'success' }
    },
    {
      label: 'Payment Analytics',
      path: ROUTES.PAYMENT_ANALYTICS,
      icon: <AnalyticsIcon />,
      roles: ['library_owner', 'branch_manager', 'finance_manager', 'super_admin'],
      description: 'Revenue insights & forecasts',
      section: 'operations',
      badge: { text: '₹12K', color: 'success' }
    },
    {
      label: 'Subscription & Credits',
      path: ROUTES.SUBSCRIPTION_CREDITS,
      icon: <CreditCard />,
      roles: ['library_owner', 'super_admin'],
      description: 'Manage plans & communication credits',
      section: 'settings',
    },
    {
      label: 'Seat & Space Designer',
      path: ROUTES.SEAT_MANAGEMENT,
      icon: <EditLocationAlt />,
      roles: ['library_owner', 'branch_manager', 'facility_manager', 'super_admin'],
      description: 'Design layouts & manage zones',
      section: 'operations',
      badge: { text: 'NEW', color: 'success' }
    },
    {
      label: 'Bookings',
      path: ROUTES.BOOKINGS,
      icon: <BookingIcon />,
      roles: ['student', 'library_staff', 'library_owner', 'branch_manager', 'super_admin'],
      description: 'Seat reservations',
      section: 'operations',
    },
    
    // Admin Section
    {
      label: 'Users',
      path: ROUTES.USERS,
      icon: <UserIcon />,
      roles: ['library_owner', 'super_admin'],
      description: 'User accounts',
      section: 'admin',
    },
    {
      label: 'Admin',
      path: ROUTES.ADMIN,
      icon: <AdminIcon />,
      roles: ['super_admin'],
      description: 'System settings',
      section: 'admin',
    },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate(ROUTES.LOGIN);
    if (isMobile) {
      onClose();
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const filteredNavigationItems = navigationItems.filter(item =>
    item.roles.includes(user?.role || '')
  );

  // Group items by section
  const sections = {
    main: filteredNavigationItems.filter(item => item.section === 'main'),
    management: filteredNavigationItems.filter(item => item.section === 'management'),
    users: filteredNavigationItems.filter(item => item.section === 'users'),
    operations: filteredNavigationItems.filter(item => item.section === 'operations'),
    admin: filteredNavigationItems.filter(item => item.section === 'admin'),
  };

  const sectionTitles = {
    main: 'Overview',
    management: 'Management',
    users: 'Users',
    operations: 'Operations',
    admin: 'Administration',
  };

  const renderNavItem = (item: NavigationItem) => {
    const isActive = location.pathname === item.path;
    
    return (
      <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
        <Tooltip title={item.description || item.label} placement="right" arrow>
          <ListItemButton
            selected={isActive}
            onClick={() => handleNavigation(item.path)}
            sx={{
              borderRadius: 1,
              mx: 1,
              transition: 'all 0.2s',
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
                '& .MuiListItemIcon-root': {
                  color: 'white',
                },
              },
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                transform: 'translateX(4px)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {item.badge?.count ? (
                <Badge 
                  badgeContent={item.badge.count > 99 ? '99+' : item.badge.count} 
                  color={item.badge.color || 'default'}
                  max={999}
                >
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )}
            </ListItemIcon>
            <ListItemText 
              primary={item.label}
              primaryTypographyProps={{
                fontSize: '0.9rem',
                fontWeight: isActive ? 600 : 400,
              }}
            />
            {item.badge?.text && (
              <Chip
                label={item.badge.text}
                size="small"
                color={item.badge.color || 'default'}
                sx={{ 
                  height: 20, 
                  fontSize: '0.7rem',
                  fontWeight: 600,
                }}
              />
            )}
          </ListItemButton>
        </Tooltip>
      </ListItem>
    );
  };

  const renderSection = (sectionKey: string, items: NavigationItem[]) => {
    if (items.length === 0) return null;
    
    const isExpanded = expandedSections.includes(sectionKey);
    const title = sectionTitles[sectionKey as keyof typeof sectionTitles];
    
    if (sectionKey === 'main') {
      // Main section doesn't collapse
      return (
        <Box key={sectionKey} sx={{ mb: 1 }}>
          {items.map(renderNavItem)}
        </Box>
      );
    }
    
    return (
      <Box key={sectionKey} sx={{ mb: 1 }}>
        <ListItemButton
          onClick={() => toggleSection(sectionKey)}
          sx={{
            mx: 1,
            borderRadius: 1,
            py: 0.5,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
            },
          }}
        >
          <ListItemText
            primary={title}
            primaryTypographyProps={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          />
          {isExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
        </ListItemButton>
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <List disablePadding sx={{ mt: 0.5 }}>
            {items.map(renderNavItem)}
          </List>
        </Collapse>
      </Box>
    );
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {/* Header with Branding */}
      <Box 
        sx={{ 
          p: 2.5, 
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <Avatar 
            sx={{ 
              bgcolor: 'white', 
              color: theme.palette.primary.main,
              width: 40,
              height: 40,
              mr: 1.5,
              fontWeight: 700,
            }}
          >
            🎓
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
              STUDYSPOT
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Owner Portal
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* User Profile Card */}
      <Box 
        sx={{ 
          p: 2, 
          mx: 1.5, 
          mt: 2,
          mb: 1,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar 
            sx={{ 
              bgcolor: theme.palette.primary.main,
              width: 36,
              height: 36,
              mr: 1.5,
              fontSize: '1rem',
            }}
          >
            {user?.firstName?.charAt(0) || 'U'}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user?.role?.replace('_', ' ').toUpperCase()}
            </Typography>
          </Box>
          <Tooltip title="Notifications">
            <IconButton size="small">
              <Badge badgeContent={3} color="error">
                <Notifications fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Navigation Sections */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 1 }}>
        {renderSection('main', sections.main)}
        <Divider sx={{ my: 1 }} />
        {renderSection('management', sections.management)}
        {sections.users.length > 0 && (
          <>
            <Divider sx={{ my: 1 }} />
            {renderSection('users', sections.users)}
          </>
        )}
        {sections.operations.length > 0 && (
          <>
            <Divider sx={{ my: 1 }} />
            {renderSection('operations', sections.operations)}
          </>
        )}
        {sections.admin.length > 0 && (
          <>
            <Divider sx={{ my: 1 }} />
            {renderSection('admin', sections.admin)}
          </>
        )}
      </Box>

      {/* Footer Actions */}
      <Box 
        sx={{ 
          p: 1.5, 
          borderTop: 1, 
          borderColor: 'divider',
          bgcolor: alpha(theme.palette.background.default, 0.5),
        }}
      >
        <List disablePadding>
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <Tooltip title="View Profile" placement="right">
              <ListItemButton 
                onClick={() => handleNavigation(ROUTES.PROFILE)}
                sx={{ 
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <ProfileIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Profile" 
                  primaryTypographyProps={{ fontSize: '0.9rem' }}
                />
              </ListItemButton>
            </Tooltip>
          </ListItem>
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <Tooltip title="Settings" placement="right">
              <ListItemButton 
                onClick={() => handleNavigation(ROUTES.SETTINGS)}
                sx={{ 
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Settings" 
                  primaryTypographyProps={{ fontSize: '0.9rem' }}
                />
              </ListItemButton>
            </Tooltip>
          </ListItem>
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <Tooltip title={`Switch to ${theme.palette.mode === 'dark' ? 'Light' : 'Dark'} Mode`} placement="right">
              <ListItemButton 
                onClick={() => dispatch(toggleTheme())}
                sx={{ 
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {theme.palette.mode === 'dark' ? (
                    <LightModeIcon fontSize="small" />
                  ) : (
                    <DarkModeIcon fontSize="small" />
                  )}
                </ListItemIcon>
                <ListItemText 
                  primary={theme.palette.mode === 'dark' ? 'Light Mode' : 'Dark Mode'} 
                  primaryTypographyProps={{ fontSize: '0.9rem' }}
                />
                <Chip 
                  label={theme.palette.mode === 'dark' ? '🌙' : '☀️'} 
                  size="small"
                  sx={{ 
                    height: 20, 
                    fontSize: '0.7rem',
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                  }}
                />
              </ListItemButton>
            </Tooltip>
          </ListItem>
          <ListItem disablePadding>
            <Tooltip title="Logout" placement="right">
              <ListItemButton 
                onClick={handleLogout}
                sx={{ 
                  borderRadius: 1,
                  color: 'error.main',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.error.main, 0.08),
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Logout" 
                  primaryTypographyProps={{ fontSize: '0.9rem' }}
                />
              </ListItemButton>
            </Tooltip>
          </ListItem>
        </List>
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
          borderRight: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
