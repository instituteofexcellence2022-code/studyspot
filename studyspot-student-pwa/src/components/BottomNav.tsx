import { useNavigate, useLocation } from 'react-router-dom';
import { Paper, BottomNavigation, BottomNavigationAction, Badge } from '@mui/material';
import {
  Dashboard,
  LibraryBooks,
  Campaign,
  Person,
  EmojiEvents,
} from '@mui/icons-material';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Home', icon: <Dashboard />, path: '/dashboard' },
    { label: 'Libraries', icon: <LibraryBooks />, path: '/libraries' },
    { label: 'News', icon: <Badge badgeContent={3} color="error"><Campaign /></Badge>, path: '/announcements' },
    { label: 'Rewards', icon: <EmojiEvents />, path: '/rewards' },
    { label: 'Profile', icon: <Person />, path: '/profile' },
  ];

  const currentIndex = navItems.findIndex(item => location.pathname.startsWith(item.path));

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1100,
        display: { xs: 'block', md: 'none' }, // Show only on mobile
      }} 
      elevation={3}
    >
      <BottomNavigation
        value={currentIndex}
        onChange={(event, newValue) => {
          navigate(navItems[newValue].path);
        }}
        showLabels
      >
        {navItems.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={item.label}
            icon={item.icon}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}

