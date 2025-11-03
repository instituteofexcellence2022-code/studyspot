import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Help as HelpIcon,
  LibraryBooks as LibraryIcon,
  Person as ProfileIcon,
} from '@mui/icons-material';

import { ROUTES } from '../../constants';

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

type NavigationItem = {
  label: string;
  path: string;
  icon: React.ReactElement;
};

const NAVIGATION_ITEMS: NavigationItem[] = [
  { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: <DashboardIcon /> },
  {
    label: 'Tenant Management',
    path: ROUTES.ADMIN_TENANTS,
    icon: <LibraryIcon />,
  },
  { label: 'Profile', path: ROUTES.PROFILE, icon: <ProfileIcon /> },
  { label: 'Help & Support', path: ROUTES.HELP, icon: <HelpIcon /> },
];

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);

    if (isMobile) {
      onClose();
    }
  };

  const renderNavItem = (item: NavigationItem) => {
    const isSelected = location.pathname === item.path;

    return (
      <ListItemButton
        key={item.path}
        selected={isSelected}
        aria-current={isSelected ? 'page' : undefined}
        onClick={() => handleNavigation(item.path)}
        sx={{
          mx: 1,
          mb: 0.5,
          borderRadius: 1,
          '&.Mui-selected': {
            backgroundColor: '#1e40af',
            color: theme.palette.common.white,
            '&:hover': {
              backgroundColor: '#1e3a8a',
            },
            '& .MuiListItemIcon-root': {
              color: theme.palette.common.white,
            },
          },
          '&:hover': {
            backgroundColor: '#f1f5f9',
          },
        }}
      >
        <ListItemIcon>{item.icon}</ListItemIcon>
        <ListItemText primary={item.label} />
      </ListItemButton>
    );
  };

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      open={open}
      onClose={onClose}
      ModalProps={{ 
        keepMounted: true,
        'aria-label': 'Navigation menu'
      }}
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
        },
      }}
      PaperProps={{
        component: 'nav',
        'aria-label': 'Main navigation',
        role: 'navigation'
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            background: '#1e40af',
            color: theme.palette.common.white,
          }}
        >
          <Typography variant='h6' component='div' fontWeight={600} noWrap>
            ⚙️ STUDYSPOT
          </Typography>
          <Typography variant='caption' sx={{ color: 'rgba(255,255,255,0.8)' }}>
            Platform Administrator
          </Typography>
        </Box>

        <List
          component='nav'
          aria-label='Main navigation'
          sx={{ flexGrow: 1, py: 1 }}
        >
          {NAVIGATION_ITEMS.map(renderNavItem)}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;

} from '@mui/material';
import { AccessTime as AttendanceIcon,
  AccountBalanceWallet as WalletIcon,
  AdminPanelSettings as AdminIcon,
  Analytics as AnalyticsIcon,
  Api as ApiIcon,
  Assessment as AssessmentIcon,
  Assignment as DSRIcon,
  AutoAwesome as AutomationIcon,
  Campaign as CampaignIcon,
  Code as CodeIcon,
  CreditCard as CreditIcon,
  CrisisAlert as IncidentIcon,
  Dashboard as DashboardIcon,
  Dataset as DatasetIcon,
  Devices as DeviceIcon,
  Email as EmailIcon,
  EventSeat as BookingIcon,
  Face as FaceIcon,
  Flag as FlagIcon,
  Folder as FolderIcon,
  Help as HelpIcon,
  IntegrationInstructions as IntegrationIcon,
  Language as LanguageIcon,
  LibraryBooks as LibraryIcon,
  Message as CommunicationIcon,
  ModelTraining as ModelTrainingIcon,
  MonitorHeart as HealthIcon,
  Notifications as NotificationIcon,
  Notifications as NotificationsIcon,
  People as UserIcon,
  Person as ProfileIcon,
  PlaylistPlay as WorkflowIcon,
  Policy as PolicyIcon,
  PrivacyTip as PrivacyIcon,
  Psychology as AIIcon,
  Psychology as PsychologyIcon,
  Scanner as ScannerIcon,
  Science as ScienceIcon,
  Search as SearchIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  SmartToy as MLIcon,
  Speed as SpeedIcon,
  Storage as DataIcon,
  TrendingUp as TrendingUpIcon,
  VpnKey as KeyIcon,
  Webhook as WebhookIcon
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
      icon: <DashboardIcon />},
    {
      label: 'AI Service Management',
      path: '/admin/ai-service',
      icon: <AIIcon />},
    {
      label: 'Analytics Service',
      path: '/admin/analytics-service',
      icon: <AnalyticsIcon />},
    {
      label: 'Automation Service',
      path: '/admin/automation-service',
      icon: <AutomationIcon />},
    {
      label: 'Communication Service',
      path: '/admin/communication-service',
      icon: <CommunicationIcon />},
    {
      label: 'CRM Service',
      path: '/admin/crm-service',
      icon: <UserIcon />},
    {
      label: 'Data Pipeline',
      path: '/admin/data-pipeline',
      icon: <DataIcon />},
    {
      label: 'Face Recognition',
      path: '/admin/face-recognition',
      icon: <FaceIcon />},
    {
      label: 'ML Service',
      path: '/admin/ml-service',
      icon: <MLIcon />},
    {
      label: 'Notification Service',
      path: '/admin/notification-service',
      icon: <NotificationIcon />},
    {
      label: 'Payment Service',
      path: '/admin/payment-service',
      icon: <CreditIcon />},
    {
      label: 'i18n Service',
      path: '/admin/i18n-service',
      icon: <LanguageIcon />},
    {
      label: 'Tenant Management',
      path: ROUTES.ADMIN_TENANTS,
      icon: <LibraryIcon />},
    {
      label: 'Advanced Tenant Management',
      path: '/admin/tenants/manage',
      icon: <LibraryIcon />},
    {
      label: 'Revenue Management',
      path: '/admin/revenue',
      icon: <CreditIcon />},
    {
      label: 'Security Management',
      path: '/admin/security',
      icon: <SecurityIcon />},
    {
      label: 'MFA Management',
      path: '/admin/security/mfa',
      icon: <SecurityIcon />},
    {
      label: 'SSO Integration',
      path: '/admin/security/sso',
      icon: <SecurityIcon />},
    {
      label: 'RBAC/ABAC',
      path: '/admin/security/rbac',
      icon: <AdminIcon />},
    {
      label: 'Feature Flags',
      path: '/admin/features/flags',
      icon: <FlagIcon />},
    {
      label: 'A/B Testing',
      path: '/admin/features/experiments',
      icon: <ScienceIcon />},
    {
      label: 'Email Templates',
      path: '/admin/messaging/email-templates',
      icon: <EmailIcon />},
    {
      label: 'Push Notifications',
      path: '/admin/messaging/push-notifications',
      icon: <NotificationsIcon />},
    {
      label: 'Campaigns',
      path: '/admin/messaging/campaigns',
      icon: <CampaignIcon />},
    {
      label: 'Credit Wallets',
      path: '/admin/messaging/credit-wallets',
      icon: <WalletIcon />},
    {
      label: 'Webhooks',
      path: '/admin/integrations/webhooks',
      icon: <WebhookIcon />},
    {
      label: 'Integration Registry',
      path: '/admin/integrations/registry',
      icon: <IntegrationIcon />},
    {
      label: 'System Health',
      path: '/admin/operations/health',
      icon: <HealthIcon />},
    {
      label: 'Incident Management',
      path: '/admin/operations/incidents',
      icon: <IncidentIcon />},
    {
      label: 'Consent Management',
      path: '/admin/compliance/consent',
      icon: <PrivacyIcon />},
    {
      label: 'Data Subject Requests',
      path: '/admin/compliance/dsr',
      icon: <DSRIcon />},
    {
      label: 'Attendance Management',
      path: '/admin/attendance/management',
      icon: <AttendanceIcon />},
    {
      label: 'IoT Device Management',
      path: '/admin/attendance/devices',
      icon: <DeviceIcon />},
    {
      label: 'Policy Engine',
      path: '/admin/policy/engine',
      icon: <PolicyIcon />},
    {
      label: 'Automation Workflows',
      path: '/admin/policy/workflows',
      icon: <WorkflowIcon />},
    {
      label: 'Business Intelligence',
      path: '/admin/analytics/bi',
      icon: <AnalyticsIcon />},
    {
      label: 'Advanced Analytics',
      path: '/admin/analytics/advanced',
      icon: <AssessmentIcon />},
    {
      label: 'ML Platform',
      path: '/admin/ml/platform',
      icon: <PsychologyIcon />},
    {
      label: 'Feature Store',
      path: '/admin/ml/features',
      icon: <DatasetIcon />},
    {
      label: 'Model Registry',
      path: '/admin/ml/models',
      icon: <ModelTrainingIcon />},
    {
      label: 'Search Engine',
      path: '/admin/search/engine',
      icon: <SearchIcon />},
    {
      label: 'File Management',
      path: '/admin/search/files',
      icon: <FolderIcon />},
    {
      label: 'Content Scanning',
      path: '/admin/search/scanning',
      icon: <ScannerIcon />},
    {
      label: 'Developer Portal',
      path: '/admin/developer/portal',
      icon: <CodeIcon />},
    {
      label: 'API Key Management',
      path: '/admin/developer/api-keys',
      icon: <KeyIcon />},
    {
      label: 'API Versioning',
      path: '/admin/developer/api-versioning',
      icon: <ApiIcon />},
    {
      label: 'Quota Management',
      path: '/admin/quotas/management',
      icon: <SpeedIcon />},
    {
      label: 'Abuse Monitoring',
      path: '/admin/quotas/abuse-monitoring',
      icon: <SecurityIcon />},
    {
      label: 'Self-Serve Upgrade',
      path: '/admin/quotas/self-serve-upgrade',
      icon: <TrendingUpIcon />},
    {
      label: 'Performance Monitoring',
      path: '/admin/quality/performance',
      icon: <SpeedIcon />},
    {
      label: 'SLO Management',
      path: '/admin/quality/slos',
      icon: <AssessmentIcon />},
    {
      label: 'Security Scanning',
      path: '/admin/quality/security-scanning',
      icon: <SecurityIcon />},
    {
      label: 'Role Management',
      path: ROUTES.ADMIN_ROLES,
      icon: <UserIcon />},
    {
      label: 'Security Settings',
      path: ROUTES.ADMIN_SECURITY,
      icon: <SecurityIcon />},
    {
      label: 'Audit Logs',
      path: ROUTES.ADMIN_AUDIT_LOGS,
      icon: <AssessmentIcon />},
    {
      label: 'Credit Management',
      path: '/credits/management',
      icon: <CreditIcon />},
    {
      label: 'Usage Analytics',
      path: '/credits/platform-analytics',
      icon: <AnalyticsIcon />},
    {
      label: 'Profile',
      path: ROUTES.PROFILE,
      icon: <ProfileIcon />},
    {
      label: 'Help & Support',
      path: ROUTES.HELP,
      icon: <HelpIcon />},
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const filteredNavigationItems = navigationItems; // Show all items - no role filtering

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider',
        background: '#1e40af',
        color: 'white'
      }}>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
          ⚙️ STUDYSPOT
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
          Platform Administrator
        </Typography>
      </Box>

      {/* Navigation Items */}
      <List
        role="navigation"
        aria-label="Primary"
        sx={{ flexGrow: 1, pt: 1, px: 1 }}
      >
        {/* Platform Management Section */}
        <Typography variant="caption" sx={{ px: 2, py: 1, color: 'text.secondary', fontWeight: 600 }}>
          PLATFORM MANAGEMENT
        </Typography>
        {filteredNavigationItems.filter((item) => 
          ['Dashboard', 'Tenant Management', 'Role Management'].includes(item.label)
        ).map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              aria-current={location.pathname === item.path ? 'page' : undefined}
              data-preload={item.path}
              sx={{
                mx: 1,
                borderRadius: 1,
                '&.Mui-selected': {
                  backgroundColor: '#1e40af',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#1e3a8a'},
                  '& .MuiListItemIcon-root': {
                    color: 'white'}},
                '&:hover': {
                  backgroundColor: '#f1f5f9'}}}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}

        <Divider sx={{ my: 1 }} />

        {/* Microservices Section */}
        <Typography variant="caption" sx={{ px: 2, py: 1, color: 'text.secondary', fontWeight: 600 }}>
          MICROSERVICES
        </Typography>
        {filteredNavigationItems.filter((item) => 
          item.label.includes('Service') || item.label.includes('Pipeline') || item.label.includes('Recognition')
        ).map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              aria-current={location.pathname === item.path ? 'page' : undefined}
              data-preload={item.path}
              sx={{
                mx: 1,
                borderRadius: 1,
                '&.Mui-selected': {
                  backgroundColor: '#1e40af',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#1e3a8a'},
                  '& .MuiListItemIcon-root': {
                    color: 'white'}},
                '&:hover': {
                  backgroundColor: '#f1f5f9'}}}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}

        <Divider sx={{ my: 1 }} />

        {/* Security & Compliance Section */}
        <Typography variant="caption" sx={{ px: 2, py: 1, color: 'text.secondary', fontWeight: 600 }}>
          SECURITY & COMPLIANCE
        </Typography>
        {filteredNavigationItems.filter((item) => 
          ['Security Settings', 'Audit Logs'].includes(item.label)
        ).map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              aria-current={location.pathname === item.path ? 'page' : undefined}
              data-preload={item.path}
              sx={{
                mx: 1,
                borderRadius: 1,
                '&.Mui-selected': {
                  backgroundColor: '#1e40af',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#1e3a8a'},
                  '& .MuiListItemIcon-root': {
                    color: 'white'}},
                '&:hover': {
                  backgroundColor: '#f1f5f9'}}}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}

        <Divider sx={{ my: 1 }} />

        {/* Business Operations Section */}
        <Typography variant="caption" sx={{ px: 2, py: 1, color: 'text.secondary', fontWeight: 600 }}>
          BUSINESS OPERATIONS
        </Typography>
        {filteredNavigationItems.filter((item) => 
          ['Credit Management', 'Usage Analytics'].includes(item.label)
        ).map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              aria-current={location.pathname === item.path ? 'page' : undefined}
              data-preload={item.path}
              sx={{
                mx: 1,
                borderRadius: 1,
                '&.Mui-selected': {
                  backgroundColor: '#1e40af',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#1e3a8a'},
                  '& .MuiListItemIcon-root': {
                    color: 'white'}},
                '&:hover': {
                  backgroundColor: '#f1f5f9'}}}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}

        <Divider sx={{ my: 1 }} />

        {/* Account Section */}
        <Typography variant="caption" sx={{ px: 2, py: 1, color: 'text.secondary', fontWeight: 600 }}>
          ACCOUNT
        </Typography>
        {filteredNavigationItems.filter((item) => 
          ['Profile', 'Help & Support'].includes(item.label)
        ).map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
      <ListItemButton
              selected={location.pathname === item.path}
        onClick={() => handleNavigation(item.path)}
              data-preload={item.path}
        sx={{
          mx: 1,
          borderRadius: 1,
          '&.Mui-selected': {
            backgroundColor: '#1e40af',
                  color: 'white',
            '&:hover': {
                    backgroundColor: '#1e3a8a'},
            '& .MuiListItemIcon-root': {
                    color: 'white'}},
          '&:hover': {
                  backgroundColor: '#f1f5f9'}}}
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
          <ListItemButton 
            onClick={() => handleNavigation(ROUTES.PROFILE)}
            sx={{
              mx: 1,
              borderRadius: 1,
              '&:hover': {
                backgroundColor: '#f1f5f9'}}}
          >
            <ListItemIcon>
              <ProfileIcon />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton 
            onClick={() => handleNavigation(ROUTES.ADMIN_SETTINGS)}
            sx={{
              mx: 1,
              borderRadius: 1,
              '&:hover': {
                backgroundColor: '#f1f5f9'}}}
          >
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
      ModalProps={{ keepMounted: true }}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          role: 'navigation',
          'aria-label': 'Sidebar',
          boxSizing: 'border-box'}}}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;

