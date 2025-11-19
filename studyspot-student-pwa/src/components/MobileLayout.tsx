import { useState, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Avatar,
  Badge,
  Divider,
  alpha,
  useTheme,
  SwipeableDrawer,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  LibraryBooks as LibraryIcon,
  BookOnline as BookingIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  QrCodeScanner as QRIcon,
  Schedule as AttendanceIcon,
  Timer as TimerIcon,
  EmojiEvents as RewardsIcon,
  Payment as PaymentIcon,
  MenuBook as ResourceIcon,
  BugReport as IssueIcon,
  Help as SupportIcon,
  Campaign as AnnouncementIcon,
  Share as ReferralIcon,
  Analytics as AnalyticsIcon,
  Task as TaskIcon,
  Groups as CommunityIcon,
  FavoriteBorder as FavoriteIcon,
  EditCalendar as ManageIcon,
  StarBorder as ReviewIcon,
  ChevronRight,
  Notifications,
  Message,
} from '@mui/icons-material';
import MobileBottomNav from './MobileBottomNav';
import { gradients } from '../theme/mobileTheme';
import { authService } from '../services/auth.service';
import { useLanguage } from '../contexts/LanguageContext';

interface MobileLayoutProps {
  children: ReactNode;
  setIsAuthenticated: (value: boolean) => void;
}

export default function MobileLayout({ children, setIsAuthenticated }: MobileLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const user = authService.getUser() ?? {};
  const { t } = useLanguage();

  const menuSections = [
    {
      title: t('nav.main'),
      items: [
        { text: t('nav.dashboard'), icon: <DashboardIcon />, path: '/dashboard', color: '#6366f1' },
        { text: t('nav.libraries'), icon: <LibraryIcon />, path: '/libraries', color: '#8b5cf6' },
        { text: t('nav.myBookings'), icon: <BookingIcon />, path: '/bookings', color: '#ec4899' },
        { text: t('nav.favorites'), icon: <FavoriteIcon />, path: '/favorites', color: '#f43f5e' },
      ],
    },
    {
      title: t('nav.studyTools'),
      items: [
        { text: t('nav.attendance'), icon: <AttendanceIcon />, path: '/attendance', color: '#14b8a6' },
        { text: t('nav.studyTimer'), icon: <TimerIcon />, path: '/study-timer', color: '#3b82f6' },
        { text: t('nav.tasksGoals'), icon: <TaskIcon />, path: '/tasks-goals', color: '#06b6d4' },
        { text: t('nav.analytics'), icon: <AnalyticsIcon />, path: '/analytics', color: '#8b5cf6' },
      ],
    },
    {
      title: t('nav.communityRewards'),
      items: [
        { text: t('nav.community'), icon: <CommunityIcon />, path: '/community', color: '#a855f7' },
        { text: t('nav.rewards'), icon: <RewardsIcon />, path: '/rewards', color: '#f59e0b' },
        { text: t('nav.referEarn'), icon: <ReferralIcon />, path: '/referral', badge: '₹500', color: '#10b981' },
      ],
    },
    {
      title: t('nav.account'),
      items: [
        { text: t('nav.profile'), icon: <PersonIcon />, path: '/profile', color: '#6366f1' },
        { text: t('nav.payments'), icon: <PaymentIcon />, path: '/payments', color: '#10b981' },
        { text: t('nav.myReviews'), icon: <ReviewIcon />, path: '/reviews', color: '#f59e0b' },
        { text: t('nav.manageBookings'), icon: <ManageIcon />, path: '/manage-bookings', color: '#ec4899' },
      ],
    },
    {
      title: t('nav.more'),
      items: [
        { text: t('nav.announcements'), icon: <AnnouncementIcon />, path: '/announcements', badge: 3, color: '#ef4444' },
        { text: t('nav.resources'), icon: <ResourceIcon />, path: '/resources', color: '#3b82f6' },
        { text: t('nav.support'), icon: <SupportIcon />, path: '/support', color: '#8b5cf6' },
        { text: t('nav.issues'), icon: <IssueIcon />, path: '/issues', color: '#f43f5e' },
      ],
    },
  ];

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.warn('Logout failed, clearing local state anyway', error);
    } finally {
      setIsAuthenticated(false);
      navigate('/login');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Modern Top AppBar */}
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{
          background: gradients.primary,
          backdropFilter: 'blur(10px)',
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56 }, px: 1, gap: 1 }}>
          {/* Menu Button with Badge */}
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setDrawerOpen(true)}
            sx={{ 
              bgcolor: alpha('#ffffff', 0.15),
              '&:hover': { bgcolor: alpha('#ffffff', 0.25) },
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <Badge badgeContent={5} color="error" variant="dot">
              <MenuIcon />
            </Badge>
          </IconButton>
          
          {/* Premium Logo + Brand */}
          <Box 
            onClick={() => navigate('/dashboard')}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.75,
              flex: 1,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:active': { opacity: 0.8 }
            }}
          >
            <Box 
              sx={{ 
                width: 36, 
                height: 36, 
                borderRadius: 1.5, 
                background: 'linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.15))',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1.25rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              📚
            </Box>
            <Box>
              <Typography 
                variant="body1" 
                sx={{ 
                  fontWeight: 900, 
                  letterSpacing: '-0.5px', 
                  lineHeight: 1.1, 
                  fontSize: '1rem',
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}
              >
                StudySpot
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  opacity: 0.9, 
                  fontSize: '0.625rem', 
                  lineHeight: 1,
                  fontWeight: 600,
                }}
              >
                {user.firstName || 'Student'} • {location.pathname.split('/')[1] || 'Home'}
              </Typography>
            </Box>
          </Box>

          {/* Compact Action Icons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {/* QR Scanner Icon */}
            <IconButton 
              color="inherit" 
              size="small"
              onClick={() => navigate('/qr-scanner')}
              sx={{ 
                width: 36,
                height: 36,
                bgcolor: alpha('#ffffff', 0.15),
                border: '1px solid rgba(255,255,255,0.2)',
                '&:hover': { bgcolor: alpha('#ffffff', 0.25) }
              }}
              title="QR Scanner"
            >
              <QRIcon sx={{ fontSize: 20 }} />
            </IconButton>

            <IconButton 
              color="inherit" 
              size="small"
              onClick={() => navigate('/announcements')}
              sx={{ 
                width: 36,
                height: 36,
                bgcolor: alpha('#ffffff', 0.15),
                border: '1px solid rgba(255,255,255,0.2)',
                '&:hover': { bgcolor: alpha('#ffffff', 0.25) }
              }}
            >
              <Badge 
                badgeContent={3} 
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.625rem',
                    height: 16,
                    minWidth: 16,
                    fontWeight: 700,
                  }
                }}
              >
                <Notifications sx={{ fontSize: 18 }} />
              </Badge>
            </IconButton>

            <IconButton 
              color="inherit" 
              size="small"
              onClick={() => navigate('/messages')}
              sx={{ 
                width: 36,
                height: 36,
                bgcolor: alpha('#ffffff', 0.15),
                border: '1px solid rgba(255,255,255,0.2)',
                '&:hover': { bgcolor: alpha('#ffffff', 0.25) }
              }}
            >
              <Badge 
                badgeContent={2} 
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.625rem',
                    height: 16,
                    minWidth: 16,
                    fontWeight: 700,
                  }
                }}
              >
                <Message sx={{ fontSize: 18 }} />
              </Badge>
            </IconButton>

            <Box
              onClick={() => navigate('/profile')}
              sx={{
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'scale(1.08)',
                },
                '&:active': {
                  transform: 'scale(0.92)',
                }
              }}
            >
              <Avatar 
                sx={{ 
                  width: 36, 
                  height: 36,
                  bgcolor: alpha('#ffffff', 0.25),
                  border: '2px solid rgba(255,255,255,0.4)',
                  fontWeight: 900,
                  fontSize: '0.875rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
              >
                {user.firstName?.[0]}{user.lastName?.[0]}
              </Avatar>
              {/* Online status indicator */}
              <Box 
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: '#10b981',
                  border: '2px solid white',
                  boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.3)',
                }}
              />
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Modern Side Drawer with Sections */}
      <SwipeableDrawer 
        anchor="left" 
        open={drawerOpen} 
        onClose={() => setDrawerOpen(false)}
        onOpen={() => setDrawerOpen(true)}
        disableBackdropTransition
        disableDiscovery
        transitionDuration={300}
        sx={{
          '& .MuiDrawer-paper': {
            width: 240,
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
          }
        }}
        SlideProps={{
          timeout: {
            enter: 300,
            exit: 250,
          }
        }}
      >
        {/* Compact User Profile Header */}
        <Box 
          sx={{ 
            p: 2,
            background: gradients.primary,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar 
              sx={{ 
                width: 48, 
                height: 48,
                bgcolor: alpha('#ffffff', 0.2),
                border: '2px solid rgba(255,255,255,0.3)',
                fontSize: '1.125rem',
                fontWeight: 700,
              }}
            >
              {user.firstName?.[0]}{user.lastName?.[0]}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body1" fontWeight={700} sx={{ fontSize: '0.938rem' }} className="truncate">
                {user.firstName} {user.lastName}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.85, fontSize: '0.75rem' }} className="truncate">
                {user.email}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Compact Menu Sections */}
        <Box sx={{ overflowY: 'auto', flex: 1, py: 0.5 }}>
          {menuSections.map((section, sectionIndex) => (
            <Box key={section.title}>
              <Typography 
                variant="caption" 
                sx={{ 
                  px: 2, 
                  py: 1, 
                  fontWeight: 700, 
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontSize: '0.625rem',
                  display: 'block'
                }}
              >
                {section.title}
              </Typography>
              
              <List sx={{ py: 0 }}>
                {section.items.map((item) => (
                  <ListItem key={item.text} disablePadding sx={{ px: 1 }}>
                    <ListItemButton
                      selected={location.pathname === item.path}
                      onClick={() => {
                        navigate(item.path);
                        setDrawerOpen(false);
                      }}
                      sx={{
                        borderRadius: 1.5,
                        mb: 0.5,
                        py: 1,
                        minHeight: 40,
                        '&.Mui-selected': {
                          background: alpha(item.color, 0.12),
                          color: item.color,
                          '&:hover': {
                            background: alpha(item.color, 0.15),
                          },
                        },
                        '&:hover': {
                          background: alpha(item.color, 0.08),
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                        {(item as any).badge ? (
                          <Badge 
                            badgeContent={(item as any).badge} 
                            color="error"
                            sx={{
                              '& .MuiBadge-badge': {
                                fontSize: '0.563rem',
                                height: 16,
                                minWidth: 16,
                                fontWeight: 700,
                              }
                            }}
                          >
                            {item.icon}
                          </Badge>
                        ) : item.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.text}
                        primaryTypographyProps={{
                          fontWeight: location.pathname === item.path ? 700 : 600,
                          fontSize: '0.875rem',
                        }}
                      />
                      {location.pathname === item.path && (
                        <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: item.color }} />
                      )}
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
              
              {sectionIndex < menuSections.length - 1 && (
                <Divider sx={{ my: 0.5, mx: 1.5 }} />
              )}
            </Box>
          ))}
        </Box>

        {/* Compact Logout Button */}
        <Box sx={{ p: 1.5, borderTop: 1, borderColor: 'divider' }}>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 1.5,
              py: 1,
              bgcolor: alpha('#ef4444', 0.1),
              color: '#ef4444',
              minHeight: 40,
              '&:hover': {
                bgcolor: alpha('#ef4444', 0.15),
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary={t('nav.logout')}
              primaryTypographyProps={{
                fontWeight: 700,
                fontSize: '0.875rem',
              }}
            />
          </ListItemButton>
        </Box>
      </SwipeableDrawer>

      {/* Main Content with safe padding */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          pb: 9, // Space for bottom nav
          pt: 1.5,
          px: { xs: 2, sm: 3 },
          minHeight: 'calc(100vh - 56px - 64px)', // viewport - topbar - bottomnav
        }}
      >
        {children}
      </Box>

      {/* Modern Bottom Navigation */}
      <MobileBottomNav />
    </Box>
  );
}

