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
  Lightbulb,
  Event,
  Psychology,
  EditLocationAlt,
  Star,
  Receipt,
  SmartToy as SmartIcon,
  Face as FaceIcon,
  Videocam as CameraIcon,
  Business as BusinessIcon,
  Tune as TuneIcon,
  QrCode as QrCodeIcon,
  QrCodeScanner as QrCodeScannerIcon,
  PersonAdd as PersonAddIcon,
  ViewList as TemplateIcon,
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
  
  const [expandedSections, setExpandedSections] = useState<string[]>(['quick', 'management', 'users', 'operations', 'ai', 'smart_integrations', 'student_revenue', 'platform_billing', 'marketing', 'admin']); // All sections expanded by default

  const drawerWidth = 280;

  const navigationItems: NavigationItem[] = [
    
    // Library Management
    {
      label: 'Organization Onboarding',
      path: '/onboarding',
      icon: <BusinessIcon />,
      roles: ['library_owner', 'super_admin'],
      description: 'Complete organization setup wizard',
      section: 'management',
      badge: { text: 'NEW', color: 'success' }
    },
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
      label: 'Seat Management',
      path: ROUTES.SEAT_MANAGEMENT,
      icon: <SeatIcon />,
      roles: ['library_staff', 'library_owner', 'branch_manager', 'facility_manager', 'super_admin'],
      description: 'Design layouts, zones & seat allocation',
      section: 'management',
      badge: { count: 350, color: 'success' }
    },
    {
      label: 'Fee Plans',
      path: ROUTES.FEE_PLANS,
      icon: <FeePlanIcon />,
      roles: ['library_staff', 'library_owner', 'branch_manager', 'finance_manager', 'super_admin'],
      description: 'Student fee plans & pricing',
      section: 'management',
      badge: { count: 4, color: 'warning' }
    },
    
    // User Management
    {
      label: 'Students',
      path: ROUTES.STUDENTS,
      icon: <StudentIcon />,
      roles: ['library_staff', 'library_owner', 'branch_manager', 'super_admin'],
      description: 'Student management',
      section: 'users',
      badge: { count: 234, color: 'info' }
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
    
    // Daily Operations
    {
      label: 'Bookings',
      path: ROUTES.BOOKINGS,
      icon: <BookingIcon />,
      roles: ['student', 'library_staff', 'library_owner', 'branch_manager', 'super_admin'],
      description: 'Seat reservations',
      section: 'operations',
    },
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
      label: 'QR Code & Barcode',
      path: ROUTES.BARCODE_QR,
      icon: <QrCodeIcon />,
      roles: ['library_staff', 'library_owner', 'branch_manager', 'super_admin'],
      description: 'Generate library QR codes for attendance',
      section: 'operations',
      badge: { text: 'NEW', color: 'success' }
    },
    {
      label: 'Lead Capture',
      path: ROUTES.LEAD_CAPTURE,
      icon: <PersonAddIcon />,
      roles: ['library_staff', 'library_owner', 'branch_manager', 'super_admin'],
      description: 'AI-powered lead tracking and demo class management',
      section: 'operations',
      badge: { text: 'AI', color: 'primary' }
    },
    {
      label: 'Issue Management',
      path: '/issues',
      icon: <Assignment />,
      roles: ['library_staff', 'library_owner', 'branch_manager', 'super_admin'],
      description: 'Track and resolve student issues',
      section: 'operations',
      badge: { count: 5, color: 'warning' }
    },
    
    // Student Revenue (Library → Student)
    {
      label: 'Payments',
      path: ROUTES.REVENUE_MANAGEMENT,
      icon: <PaymentIcon />,
      roles: ['library_staff', 'library_owner', 'branch_manager', 'finance_manager', 'super_admin'],
      description: 'Student payments & transactions',
      section: 'student_revenue',
      badge: { text: '₹12K', color: 'success' }
    },
    {
      label: 'Revenue Analytics',
      path: ROUTES.REVENUE_ANALYTICS,
      icon: <AnalyticsIcon />,
      roles: ['library_owner', 'branch_manager', 'finance_manager', 'super_admin'],
      description: 'Revenue trends, insights & forecasts',
      section: 'student_revenue',
    },
    {
      label: 'Pending Payments',
      path: ROUTES.INVOICE_MANAGEMENT,
      icon: <Receipt />,
      roles: ['library_staff', 'library_owner', 'branch_manager', 'finance_manager', 'super_admin'],
      description: 'Track and manage outstanding student payments',
      section: 'student_revenue',
      badge: { text: 'NEW', color: 'success' }
    },
    
    // Platform Billing (Platform → Library)
    {
      label: 'Subscription & Credits',
      path: ROUTES.SUBSCRIPTION_CREDITS,
      icon: <CreditCard />,
      roles: ['library_owner', 'super_admin'],
      description: 'Platform plans & communication credits',
      section: 'platform_billing',
      badge: { text: 'NEW', color: 'success' }
    },
    {
      label: 'Billing & Invoices',
      path: ROUTES.SUBSCRIPTION_BILLING,
      icon: <Receipt />,
      roles: ['library_owner', 'super_admin'],
      description: 'Platform invoice management',
      section: 'platform_billing',
    },
    
    // IoT & Smart Integrations
    {
      label: 'Smart IoT Control',
      path: '/iot-dashboard',
      icon: <SmartIcon />,
      roles: ['library_owner', 'super_admin'],
      description: 'WiFi-controlled electrical appliance management',
      section: 'smart_integrations',
      badge: { text: 'NEW', color: 'success' }
    },
    {
      label: 'Face Recognition',
      path: '/face-recognition',
      icon: <FaceIcon />,
      roles: ['library_owner', 'super_admin'],
      description: 'Biometric attendance with face recognition',
      section: 'smart_integrations',
      badge: { text: 'AI', color: 'info' }
    },
    {
      label: 'External Cameras',
      path: '/external-cameras',
      icon: <CameraIcon />,
      roles: ['library_owner', 'super_admin'],
      description: 'Manage CP Plus, Hikvision, and other IP cameras',
      section: 'smart_integrations',
      badge: { text: 'NEW', color: 'success' }
    },
    
    // AI Features
    {
      label: 'AI Assistant',
      path: '/ai/assistant',
      icon: <Psychology />,
      roles: ['library_owner', 'super_admin'],
      description: 'AI-powered assistant for library management',
      section: 'ai',
      badge: { text: 'NEW', color: 'info' }
    },
    {
      label: 'AI Recommendations',
      path: '/ai/recommendations',
      icon: <Lightbulb />,
      roles: ['library_owner', 'super_admin'],
      description: 'Smart recommendations for operations',
      section: 'ai',
    },
    {
      label: 'AI Analytics',
      path: '/ai/analytics',
      icon: <AnalyticsIcon />,
      roles: ['library_owner', 'super_admin'],
      description: 'Predictive analytics and insights',
      section: 'ai',
    },
    {
      label: 'AI Scheduler',
      path: '/ai/scheduler',
      icon: <Event />,
      roles: ['library_owner', 'super_admin'],
      description: 'Smart scheduling recommendations',
      section: 'ai',
    },
    
    // Marketing & Growth
    {
      label: 'Referral Program',
      path: '/referral-discounts',
      icon: <TrendingUp />,
      roles: ['library_owner', 'branch_manager', 'super_admin'],
      description: 'Manage referral programs and discount coupons',
      section: 'marketing',
      badge: { text: 'NEW', color: 'success' }
    },
    
    
    // System Administration
    {
      label: 'User Accounts',
      path: ROUTES.USERS,
      icon: <UserIcon />,
      roles: ['library_owner', 'super_admin'],
      description: 'User accounts',
      section: 'admin',
    },
    {
      label: 'System Settings',
      path: ROUTES.SETTINGS,
      icon: <AdminIcon />,
      roles: ['super_admin'],
      description: 'System settings',
      section: 'admin',
    },
    
    
    // Feature Control
    {
      label: 'Feature Control',
      path: ROUTES.FEATURE_CONTROL,
      icon: <TuneIcon />,
      roles: ['library_owner', 'super_admin'],
      description: 'Enable/disable features and manage dependencies',
      section: 'admin',
      badge: { text: 'NEW', color: 'info' }
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

  // Remove role-based filtering - show all navigation items
  const filteredNavigationItems = navigationItems;

  // Group items by section - Professional workflow order
  const sections = {
    quick: filteredNavigationItems.filter(item => !item.section),
    management: filteredNavigationItems.filter(item => item.section === 'management'),
    users: filteredNavigationItems.filter(item => item.section === 'users'),
    operations: filteredNavigationItems.filter(item => item.section === 'operations'),
    ai: filteredNavigationItems.filter(item => item.section === 'ai'),
    smart_integrations: filteredNavigationItems.filter(item => item.section === 'smart_integrations'),
    student_revenue: filteredNavigationItems.filter(item => item.section === 'student_revenue'),
    platform_billing: filteredNavigationItems.filter(item => item.section === 'platform_billing'),
    marketing: filteredNavigationItems.filter(item => item.section === 'marketing'),
    admin: filteredNavigationItems.filter(item => item.section === 'admin'),
  };

  const sectionTitles = {
    quick: 'Quick Access',
    management: 'Library',
    users: 'Users',
    operations: 'Operations',
    ai: 'AI Features',
    smart_integrations: 'Smart Integrations',
    student_revenue: 'Student Revenue',
    platform_billing: 'Platform Billing',
    marketing: 'Marketing',
    admin: 'Administration',
  };

  const renderNavItem = (item: NavigationItem) => {
    const isActive = location.pathname === item.path;
    
    return (
      <ListItem key={item.path} disablePadding sx={{ mb: 0.3 }}>
        <Tooltip title={item.description || item.label} placement="right" arrow sx={{ zIndex: theme.zIndex.drawer + 10 }}>
          <ListItemButton
            selected={isActive}
            onClick={() => handleNavigation(item.path)}
            sx={{
              borderRadius: 1.5,
              mx: 1.5,
              py: 0.8,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              '&.Mui-selected': {
                backgroundColor: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: 'white',
                boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
                transform: 'translateX(6px) scale(1.02)',
                '&:hover': {
                  backgroundColor: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                  transform: 'translateX(6px) scale(1.02)',
                },
                '& .MuiListItemIcon-root': {
                  color: 'white',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: '4px',
                  background: 'white',
                  borderRadius: '0 2px 2px 0',
                },
              },
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                transform: 'translateX(4px)',
                boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.2)}`,
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
                fontSize: '0.85rem',
                fontWeight: isActive ? 600 : 500,
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
    
    return (
      <Box key={sectionKey} sx={{ mb: 1 }}>
        <ListItemButton
          onClick={() => toggleSection(sectionKey)}
          sx={{
            mx: 1.5,
            borderRadius: 1.5,
            py: 0.8,
            mb: 0.5,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              transform: 'translateX(1px)',
              boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.15)}`,
            },
          }}
        >
          <ListItemText
            primary={title}
            primaryTypographyProps={{
              fontSize: '0.7rem',
              fontWeight: 600,
              color: theme.palette.primary.main,
              textTransform: 'uppercase',
              letterSpacing: 0.3,
            }}
          />
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            borderRadius: 0.8,
            px: 0.8,
            py: 0.3,
            transition: 'all 0.2s ease',
          }}>
            {isExpanded ? <ExpandLess sx={{ fontSize: '1rem' }} /> : <ExpandMore sx={{ fontSize: '1rem' }} />}
          </Box>
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
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      bgcolor: 'background.default',
      background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${theme.palette.background.default} 100%)`,
    }}>
      {/* Enhanced Header with Branding */}
      <Box 
        sx={{ 
          p: 3, 
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: `linear-gradient(90deg, transparent 0%, ${alpha('#fff', 0.3)} 50%, transparent 100%)`,
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar 
            sx={{ 
              bgcolor: 'white', 
              color: theme.palette.primary.main,
              width: 48,
              height: 48,
              mr: 2,
              fontWeight: 700,
              fontSize: '1.5rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            🎓
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={800} sx={{ lineHeight: 1.2, mb: 0.5 }}>
              STUDYSPOT
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
              Library Owner Portal
            </Typography>
          </Box>
        </Box>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          bgcolor: alpha('#fff', 0.1),
          borderRadius: 2,
          p: 1.5,
          backdropFilter: 'blur(10px)',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              bgcolor: '#4caf50', 
              mr: 1,
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': { opacity: 1 },
                '50%': { opacity: 0.5 },
                '100%': { opacity: 1 },
              }
            }} />
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              System Online
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip 
              label="v1.0.0" 
              size="small" 
              sx={{ 
                bgcolor: alpha('#fff', 0.2), 
                color: 'white',
                fontWeight: 600,
                fontSize: '0.7rem',
              }} 
            />
            <Tooltip title={`Switch to ${theme.palette.mode === 'dark' ? 'Light' : 'Dark'} Mode`} sx={{ zIndex: theme.zIndex.drawer + 10 }}>
              <IconButton
                size="small"
                onClick={() => dispatch(toggleTheme())}
                sx={{
                  bgcolor: alpha('#fff', 0.1),
                  color: 'white',
                  '&:hover': {
                    bgcolor: alpha('#fff', 0.2),
                  },
                }}
              >
                {theme.palette.mode === 'dark' ? (
                  <LightModeIcon fontSize="small" />
                ) : (
                  <DarkModeIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Compact User Profile & Dashboard */}
      <Box 
        sx={{ 
          p: 1.5, 
          mx: 2, 
          mt: 2,
          mb: 1,
          borderRadius: 2,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.03)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
          boxShadow: `0 2px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
          <Avatar 
            sx={{ 
                bgcolor: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              width: 36,
              height: 36,
              mr: 1.5,
                fontSize: '0.9rem',
                fontWeight: 700,
                boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
            }}
          >
            {user?.firstName?.charAt(0) || 'U'}
          </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={600} noWrap sx={{ mb: 0.2, fontSize: '0.8rem' }}>
              {user?.firstName} {user?.lastName}
            </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Chip 
                  label={user?.role?.replace('_', ' ').toUpperCase() || 'USER'} 
                  size="small" 
                  sx={{ 
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    fontSize: '0.6rem',
                    height: 16,
                  }} 
                />
                <Chip 
                  label="ACTIVE" 
                  size="small" 
                  sx={{ 
                    bgcolor: alpha('#4caf50', 0.1),
                    color: '#4caf50',
                    fontWeight: 600,
                    fontSize: '0.6rem',
                    height: 16,
                  }} 
                />
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title="Notifications" sx={{ zIndex: theme.zIndex.drawer + 10 }}>
              <IconButton 
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  width: 28,
                  height: 28,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                  }
                }}
              >
                <Badge badgeContent={3} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', height: 16, minWidth: 16 } }}>
                  <Notifications sx={{ fontSize: '0.9rem' }} />
              </Badge>
            </IconButton>
          </Tooltip>
            <Tooltip title="Dashboard" sx={{ zIndex: theme.zIndex.drawer + 10 }}>
              <IconButton 
                size="small"
                onClick={() => handleNavigation(ROUTES.DASHBOARD)}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  width: 28,
                  height: 28,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                  }
                }}
              >
                <DashboardIcon sx={{ fontSize: '0.9rem' }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Enhanced Navigation Sections */}
      <Box sx={{ 
        flexGrow: 1, 
        overflowY: 'auto', 
        py: 1,
        minHeight: 0, // Important: allows flex child to shrink
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          background: alpha(theme.palette.primary.main, 0.05),
          borderRadius: '2px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: alpha(theme.palette.primary.main, 0.2),
          borderRadius: '2px',
          '&:hover': {
            background: alpha(theme.palette.primary.main, 0.3),
          },
        },
      }}>
            {sections.quick.length > 0 && (
              <>
                {renderSection('quick', sections.quick)}
                <Divider sx={{ 
                  my: 1.5, 
                  mx: 2,
                  borderColor: alpha(theme.palette.primary.main, 0.1),
                }} />
              </>
            )}
        {renderSection('management', sections.management)}
        {sections.users.length > 0 && (
          <>
                <Divider sx={{ 
                  my: 1.5, 
                  mx: 2,
                  borderColor: alpha(theme.palette.primary.main, 0.1),
                }} />
            {renderSection('users', sections.users)}
          </>
        )}
        {sections.operations.length > 0 && (
          <>
                <Divider sx={{ 
                  my: 1.5, 
                  mx: 2,
                  borderColor: alpha(theme.palette.primary.main, 0.1),
                }} />
            {renderSection('operations', sections.operations)}
          </>
        )}
        {sections.ai.length > 0 && (
          <>
            <Divider sx={{ 
              my: 1.5, 
              mx: 2,
              borderColor: alpha(theme.palette.primary.main, 0.1),
            }} />
            {renderSection('ai', sections.ai)}
          </>
        )}
        {sections.smart_integrations.length > 0 && (
          <>
            <Divider sx={{ 
              my: 1.5, 
              mx: 2,
              borderColor: alpha(theme.palette.primary.main, 0.1),
            }} />
            {renderSection('smart_integrations', sections.smart_integrations)}
          </>
        )}
        {sections.student_revenue.length > 0 && (
          <>
            <Divider sx={{ 
              my: 1.5, 
              mx: 2,
              borderColor: alpha(theme.palette.primary.main, 0.1),
            }} />
            {renderSection('student_revenue', sections.student_revenue)}
          </>
        )}
        {sections.platform_billing.length > 0 && (
          <>
            <Divider sx={{ 
              my: 1.5, 
              mx: 2,
              borderColor: alpha(theme.palette.primary.main, 0.1),
            }} />
            {renderSection('platform_billing', sections.platform_billing)}
          </>
        )}
            {sections.marketing.length > 0 && (
              <>
                <Divider sx={{ 
                  my: 1.5, 
                  mx: 2,
                  borderColor: alpha(theme.palette.primary.main, 0.1),
                }} />
                {renderSection('marketing', sections.marketing)}
          </>
        )}
        {sections.admin.length > 0 && (
          <>
                <Divider sx={{ 
                  my: 1.5, 
                  mx: 2,
                  borderColor: alpha(theme.palette.primary.main, 0.1),
                }} />
            {renderSection('admin', sections.admin)}
          </>
        )}
      </Box>

      {/* Compact Footer Actions */}
      <Box 
        sx={{ 
          p: 2, // Increased from 1.5 to 2
          pb: 2.5, // Extra bottom padding
          borderTop: 1, 
          borderColor: alpha(theme.palette.primary.main, 0.1),
          background: `linear-gradient(180deg, ${alpha(theme.palette.background.default, 0.8)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
          backdropFilter: 'blur(10px)',
          flexShrink: 0, // Prevent shrinking
          position: 'relative', // Ensure proper positioning
          zIndex: 1, // Ensure it stays above other content
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="View Profile" placement="right" sx={{ zIndex: theme.zIndex.drawer + 10 }}>
              <IconButton 
                size="small"
                onClick={() => handleNavigation(ROUTES.PROFILE)}
                sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                  },
                }}
              >
                  <ProfileIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Settings" placement="right" sx={{ zIndex: theme.zIndex.drawer + 10 }}>
              <IconButton 
                size="small"
                onClick={() => handleNavigation(ROUTES.SETTINGS)}
                sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                  },
                }}
              >
                  <SettingsIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Tooltip title="Logout" placement="right" sx={{ zIndex: theme.zIndex.drawer + 10 }}>
            <IconButton 
                  size="small"
                onClick={handleLogout}
                sx={{ 
                bgcolor: alpha(theme.palette.error.main, 0.1),
                  color: 'error.main',
                  '&:hover': {
                  bgcolor: alpha(theme.palette.error.main, 0.2),
                  },
                }}
              >
                  <LogoutIcon fontSize="small" />
            </IconButton>
            </Tooltip>
        </Box>
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
        zIndex: theme.zIndex.drawer,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: `1px solid ${theme.palette.divider}`,
          position: 'fixed',
          height: '100vh',
          zIndex: theme.zIndex.drawer,
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          background: theme.palette.background.paper,
          top: 0,
          left: 0,
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
