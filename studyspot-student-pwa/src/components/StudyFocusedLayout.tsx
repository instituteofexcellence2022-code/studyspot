import { useState } from 'react';
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
  Paper,
  Chip,
  Divider,
  BottomNavigation,
  BottomNavigationAction,
  useMediaQuery,
  useTheme,
  Menu,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  LibraryBooks,
  MenuBook,
  EventSeat,
  Schedule,
  Timer,
  Assignment,
  TrendingUp,
  EmojiEvents,
  LocalFireDepartment,
  School,
  Psychology,
  Groups,
  Bookmarks,
  Brightness4,
  Brightness7,
  Logout,
  QrCodeScanner,
  Campaign,
  Notifications,
  Person,
  Star,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  darkMode?: boolean;
  setDarkMode?: (value: boolean) => void;
}

export default function StudyFocusedLayout({ children, darkMode, setDarkMode }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);
  
  const { user, logout } = useAuth();
  const streak = 12;
  const unreadNotifications = 3;
  
  const recentNotifications = [
    { id: '1', title: 'Booking Confirmed', message: 'Your seat A-12 is confirmed for today', time: '5 min ago', read: false },
    { id: '2', title: 'Study Streak 🔥', message: 'Congrats! 7-day study streak achieved', time: '1 hour ago', read: false },
    { id: '3', title: 'Payment Success', message: 'Payment of ₹300 completed', time: '2 hours ago', read: false },
  ];

  // STUDY-FOCUSED NAVIGATION
  const studyMenuItems = [
    { 
      category: '📚 Study',
      items: [
        { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard', badge: null },
        { text: 'Find Libraries', icon: <LibraryBooks />, path: '/libraries', badge: null },
        { text: 'My Bookings', icon: <MenuBook />, path: '/bookings', badge: null },
        { text: 'Study Timer', icon: <Timer />, path: '/study-timer', badge: 'Start' },
        { text: 'QR Check-in', icon: <QrCodeScanner />, path: '/qr-scanner', badge: null },
      ]
    },
    {
      category: '🎯 Progress',
      items: [
        { text: 'Attendance', icon: <Schedule />, path: '/attendance', badge: `${95}%` },
        { text: 'Analytics', icon: <TrendingUp />, path: '/analytics', badge: null },
        { text: 'Tasks & Goals', icon: <Assignment />, path: '/tasks-goals', badge: 5 },
      ]
    },
    {
      category: '📖 Resources',
      items: [
        { text: 'E-Books & PDFs', icon: <Bookmarks />, path: '/resources', badge: 'New' },
        { text: 'Study Groups', icon: <Groups />, path: '/community', badge: 3 },
        { text: 'Announcements', icon: <Campaign />, path: '/announcements', badge: 3 },
      ]
    },
    {
      category: '🎁 Rewards',
      items: [
        { text: 'Achievements', icon: <EmojiEvents />, path: '/rewards', badge: null },
        { text: 'Refer & Earn', icon: <LocalFireDepartment />, path: '/referral', badge: '₹500' },
      ]
    },
    {
      category: '⚙️ More',
      items: [
        { text: 'Membership', icon: <Star />, path: '/membership', badge: null },
        { text: 'Payments', icon: <School />, path: '/payments', badge: null },
        { text: 'Favorites', icon: <Bookmarks />, path: '/favorites', badge: null },
        { text: 'My Reviews', icon: <Psychology />, path: '/reviews', badge: null },
        { text: 'Profile', icon: <Person />, path: '/profile', badge: null },
      ]
    },
  ];

  // BOTTOM NAV - STUDY ESSENTIALS ONLY
  const bottomNavItems = [
    { label: 'Study', icon: <Dashboard />, path: '/dashboard' },
    { label: 'Libraries', icon: <LibraryBooks />, path: '/libraries' },
    { label: 'Timer', icon: <Timer />, path: '/study-timer' },
    { label: 'Progress', icon: <TrendingUp />, path: '/analytics' },
    { label: 'Profile', icon: <School />, path: '/profile' },
  ];

  const currentBottomNav = bottomNavItems.findIndex(item => location.pathname.startsWith(item.path));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top AppBar - Study Focused */}
      <AppBar 
        position="sticky" 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: 3,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setDrawerOpen(true)}
            >
              <MenuIcon />
            </IconButton>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                StudySpot
              </Typography>
              <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'block' } }}>
                Your Study Companion
              </Typography>
            </Box>
          </Box>

          {/* Streak Display */}
          <Chip
            icon={<LocalFireDepartment />}
            label={`${streak} Day Streak`}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              color: 'white',
              fontWeight: 'bold',
              display: { xs: 'none', sm: 'flex' }
            }}
          />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton 
              color="inherit" 
              onClick={(e) => setNotifAnchor(e.currentTarget)}
            >
              <Badge badgeContent={unreadNotifications} color="error">
                <Notifications />
              </Badge>
            </IconButton>
            
            {setDarkMode && (
              <IconButton color="inherit" onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            )}
            <Avatar 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)',
                cursor: 'pointer',
                border: '2px solid white',
              }}
              onClick={() => navigate('/profile')}
            >
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Side Drawer - Organized by Category */}
      <Drawer 
        anchor="left" 
        open={drawerOpen} 
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { width: 280 }
        }}
      >
        <Box sx={{ p: 2 }}>
          {/* User Profile Section */}
          <Paper sx={{ p: 2, mb: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ width: 56, height: 56, bgcolor: 'rgba(255,255,255,0.2)', border: '2px solid white' }}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Chip 
                  label="Student" 
                  size="small" 
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', height: 20 }}
                />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip 
                icon={<LocalFireDepartment />}
                label={`${streak} days`} 
                size="small" 
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
              <Chip 
                icon={<EmojiEvents />}
                label="Top 12%" 
                size="small" 
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            </Box>
          </Paper>

          {/* Categorized Menu */}
          {studyMenuItems.map((section, sectionIndex) => (
            <Box key={sectionIndex} sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ px: 2, display: 'block', mb: 1 }}>
                {section.category}
              </Typography>
              <List dense>
                {section.items.map((item) => (
                  <ListItem key={item.text} disablePadding>
                    <ListItemButton
                      selected={location.pathname === item.path}
                      onClick={() => {
                        navigate(item.path);
                        setDrawerOpen(false);
                      }}
                      sx={{
                        borderRadius: 2,
                        mx: 1,
                        '&.Mui-selected': {
                          bgcolor: 'primary.light',
                          color: 'primary.main',
                          '&:hover': { bgcolor: 'primary.light' },
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {item.badge ? (
                          <Badge badgeContent={item.badge} color="error">
                            {item.icon}
                          </Badge>
                        ) : item.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.text}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: location.pathname === item.path ? 600 : 400 }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
              {sectionIndex < studyMenuItems.length - 1 && <Divider sx={{ my: 1 }} />}
            </Box>
          ))}

          {/* Logout */}
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2, mx: 1, color: 'error.main' }}>
              <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
                <Logout />
              </ListItemIcon>
              <ListItemText primary="Logout" primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }} />
            </ListItemButton>
          </ListItem>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, pb: isMobile ? 8 : 2 }}>
        {children}
      </Box>

      {/* Bottom Navigation (Mobile Only) - Study Focused */}
      {isMobile && (
        <Paper 
          sx={{ 
            position: 'fixed', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            zIndex: 1100,
          }} 
          elevation={8}
        >
          <BottomNavigation
            value={currentBottomNav}
            onChange={(event, newValue) => {
              navigate(bottomNavItems[newValue].path);
            }}
            showLabels
            sx={{
              height: 65,
              '& .MuiBottomNavigationAction-root': {
                minWidth: 'auto',
              },
              '& .Mui-selected': {
                color: 'primary.main',
              },
            }}
          >
            {bottomNavItems.map((item) => (
              <BottomNavigationAction
                key={item.path}
                label={item.label}
                icon={item.icon}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}

      <Menu
        anchorEl={notifAnchor}
        open={Boolean(notifAnchor)}
        onClose={() => setNotifAnchor(null)}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 500,
            mt: 1,
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">
              Notifications
            </Typography>
            {unreadNotifications > 0 && (
              <Chip label={`${unreadNotifications} new`} size="small" color="primary" />
            )}
          </Box>
        </Box>

        <List sx={{ p: 0 }}>
          {recentNotifications.map((notif, index) => (
            <Box key={notif.id}>
              <ListItemButton
                onClick={() => {
                  setNotifAnchor(null);
                  navigate('/announcements');
                }}
                sx={{
                  bgcolor: notif.read ? 'transparent' : 'action.hover',
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight={notif.read ? 'normal' : 'bold'}>
                      {notif.title}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {notif.message}
                      </Typography>
                      <Typography variant="caption" color="primary.main" sx={{ mt: 0.5 }}>
                        {notif.time}
                      </Typography>
                    </>
                  }
                />
              </ListItemButton>
              {index < recentNotifications.length - 1 && <Divider />}
            </Box>
          ))}
        </List>

        <Divider />
        <Box sx={{ p: 1.5, textAlign: 'center' }}>
          <Button
            fullWidth
            size="small"
            onClick={() => {
              setNotifAnchor(null);
              navigate('/announcements');
            }}
          >
            View All Notifications
          </Button>
        </Box>
      </Menu>
    </Box>
  );
}

