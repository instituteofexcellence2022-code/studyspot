// ============================================
// SIDEBAR COMPONENT - Enhanced with Sections
// ============================================

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import {
  Dashboard,
  Business,
  LocationOn,
  People,
  School,
  Insights,
  Send as SendIcon,
  SupervisorAccount,
  AccountBalance,
  CreditCard,
  Subscriptions,
  Payment as PaymentIcon,
  Assessment,
  Description,
  Settings,
  GroupWork,
  Message,
  SupportAgent,
  Security,
  Code,
  Notifications,
  HealthAndSafety,
  AdminPanelSettings,
  Campaign,
  Article,
  FilterList,
  EventAvailable,
  AttachMoney,
  CardGiftcard,
  Policy,
  QrCodeScanner,
} from '@mui/icons-material';
import { ROUTES } from '../../config/constants';

const DRAWER_WIDTH = 260;

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  variant?: 'permanent' | 'temporary';
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose, variant = 'permanent' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Organized navigation sections
  const navigationSections = [
    {
      title: 'MAIN',
      items: [
        { title: 'Dashboard', icon: <Dashboard />, path: ROUTES.DASHBOARD },
      ],
    },
    {
      title: 'MANAGEMENT',
      items: [
        { title: 'Tenants & Libraries', icon: <Business />, path: '/tenants' },
        { title: 'Tenant Onboarding', icon: <AdminPanelSettings />, path: '/tenants/onboarding' },
        { title: 'Platform Users', icon: <People />, path: '/users/platform' },
        { title: 'Students & Attendance', icon: <School />, path: '/students' },
        { title: 'User Segmentation', icon: <FilterList />, path: '/users/segmentation' },
      ],
    },
    {
      title: 'HUMAN RESOURCES',
      items: [
        { title: 'Admin Users & Permissions', icon: <SupervisorAccount />, path: '/users/admin' },
        { title: 'Sales & Teams', icon: <GroupWork />, path: '/sales-teams' },
        { title: 'Staff Attendance', icon: <QrCodeScanner />, path: '/staff-attendance' },
      ],
    },
    {
      title: 'FINANCE',
      items: [
        { title: 'Revenue Management', icon: <AccountBalance />, path: '/revenue/dashboard' },
        { title: 'Revenue Analytics', icon: <Assessment />, path: '/revenue/analytics' },
        { title: 'Payments', icon: <PaymentIcon />, path: '/payments' },
        { title: 'Communication Credits', icon: <CreditCard />, path: '/credits/dashboard' },
        { title: 'Subscriptions & Plans', icon: <Subscriptions />, path: '/fee-plans' },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        { title: 'CRM & Leads', icon: <Campaign />, path: '/crm/leads' },
        { title: 'Referrals & Loyalty', icon: <CardGiftcard />, path: '/referrals' },
        { title: 'Bulk Messaging', icon: <Message />, path: '/messaging' },
        { title: 'Message Templates', icon: <Article />, path: '/messaging/templates' },
        { title: 'Support Tickets', icon: <SupportAgent />, path: '/tickets' },
      ],
    },
    {
      title: 'INSIGHTS',
      items: [
        { title: 'Platform Analytics', icon: <Assessment />, path: '/analytics' },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { title: 'System Health', icon: <HealthAndSafety />, path: '/system/health' },
        { title: 'Compliance & Privacy', icon: <Policy />, path: '/compliance' },
        { title: 'Audit Logs', icon: <Security />, path: '/audit-logs' },
      ],
    },
    {
      title: 'PREFERENCES',
      items: [
        { title: 'System Notifications', icon: <Notifications />, path: '/notifications' },
        { title: 'System Settings', icon: <Settings />, path: ROUTES.SETTINGS },
      ],
    },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    if (variant === 'temporary') {
      onClose();
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const drawerContent = (
    <Box sx={{ backgroundColor: '#FAFAFA', height: '100%' }}>
      <Toolbar /> {/* Spacer for AppBar */}
      <Box sx={{ overflowY: 'auto', height: 'calc(100% - 64px)' }}>
        {navigationSections.map((section, sectionIndex) => (
          <Box key={section.title}>
            {/* Section Header */}
            <Typography
              variant="overline"
              sx={{
                px: 2,
                py: 1,
                display: 'block',
                color: 'text.secondary',
                fontWeight: 700,
                fontSize: '0.75rem',
                letterSpacing: '0.08em',
              }}
            >
              {section.title}
            </Typography>

            {/* Section Items */}
            <List sx={{ py: 0 }}>
              {section.items.map((item) => (
                <ListItem key={item.title} disablePadding>
                  <ListItemButton
                    onClick={() => handleNavigate(item.path)}
                    selected={isActive(item.path)}
                    sx={{
                      mx: 1,
                      borderRadius: 1,
                      mb: 0.5,
                      transition: 'all 0.2s ease',
                      '&.Mui-selected': {
                        backgroundColor: '#FCE4EC',
                        color: '#E91E63',
                        '&:hover': {
                          backgroundColor: '#FCE4EC',
                        },
                      },
                      '&:hover': {
                        backgroundColor: '#FFF0F5',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: isActive(item.path) ? '#E91E63' : 'text.secondary',
                        minWidth: 40,
                        transition: 'color 0.2s ease',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.title}
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                        fontWeight: isActive(item.path) ? 600 : 400,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>

            {/* Divider between sections (except last) */}
            {sectionIndex < navigationSections.length - 1 && (
              <Divider sx={{ my: 1, mx: 2 }} />
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
