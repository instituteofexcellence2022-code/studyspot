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
} from '@mui/icons-material';

interface LayoutProps {
  children: React.ReactNode;
  setIsAuthenticated: (value: boolean) => void;
}

export default function Layout({ children, setIsAuthenticated }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Libraries', icon: <LibraryIcon />, path: '/libraries' },
    { text: 'My Bookings', icon: <BookingIcon />, path: '/bookings' },
    { text: 'Manage Bookings', icon: <ManageIcon />, path: '/manage-bookings' },
    { text: 'Favorites', icon: <FavoriteIcon />, path: '/favorites' },
    { text: 'My Reviews', icon: <ReviewIcon />, path: '/reviews' },
    { text: 'Payments', icon: <PaymentIcon />, path: '/payments' },
    { text: 'Resources', icon: <ResourceIcon />, path: '/resources' },
    { text: 'Announcements', icon: <AnnouncementIcon />, path: '/announcements', badge: 3 },
    { text: 'QR Scanner', icon: <QRIcon />, path: '/qr-scanner' },
    { text: 'Attendance', icon: <AttendanceIcon />, path: '/attendance' },
    { text: 'Study Timer', icon: <TimerIcon />, path: '/study-timer' },
    { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
    { text: 'Tasks & Goals', icon: <TaskIcon />, path: '/tasks-goals' },
    { text: 'Community', icon: <CommunityIcon />, path: '/community' },
    { text: 'Rewards', icon: <RewardsIcon />, path: '/rewards' },
    { text: 'Refer & Earn', icon: <ReferralIcon />, path: '/referral', badge: '₹500' },
    { text: 'Report Issue', icon: <IssueIcon />, path: '/issues' },
    { text: 'Help & Support', icon: <SupportIcon />, path: '/support' },
    { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top AppBar */}
      <AppBar position="sticky">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            StudySpot
          </Typography>
          <Avatar sx={{ bgcolor: 'secondary.main' }}>
            {user.firstName?.[0]}{user.lastName?.[0]}
          </Avatar>
        </Toolbar>
      </AppBar>

      {/* Side Drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 250, pt: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 2, px: 2 }}>
            <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 1, bgcolor: 'primary.main' }}>
              {user.firstName?.[0]}{user.lastName?.[0]}
            </Avatar>
            <Typography variant="subtitle1" fontWeight="bold">
              {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
          </Box>

          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => {
                    navigate(item.path);
                    setDrawerOpen(false);
                  }}
                >
                  <ListItemIcon>
                    {(item as any).badge ? (
                      <Badge badgeContent={(item as any).badge} color="error">
                        {item.icon}
                      </Badge>
                    ) : item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}

            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, bgcolor: '#f5f5f5', p: 2 }}>
        {children}
      </Box>
    </Box>
  );
}

