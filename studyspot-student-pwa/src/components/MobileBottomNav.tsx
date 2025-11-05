import { useNavigate, useLocation } from 'react-router-dom';
import { Paper, Box, alpha, Badge } from '@mui/material';
import {
  Dashboard,
  LibraryBooks,
  BookOnline,
  EmojiEvents,
  Person,
} from '@mui/icons-material';
import { gradients } from '../theme/mobileTheme';

interface NavItem {
  label: string;
  icon: any;
  path: string;
  badge?: number;
  color: string;
}

export default function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems: NavItem[] = [
    { 
      label: 'Home', 
      icon: Dashboard, 
      path: '/dashboard', 
      color: '#6366f1' 
    },
    { 
      label: 'Libraries', 
      icon: LibraryBooks, 
      path: '/libraries', 
      color: '#8b5cf6' 
    },
    { 
      label: 'Bookings', 
      icon: BookOnline, 
      path: '/bookings', 
      color: '#ec4899' 
    },
    { 
      label: 'Rewards', 
      icon: EmojiEvents, 
      path: '/rewards', 
      color: '#f59e0b' 
    },
    { 
      label: 'Profile', 
      icon: Person, 
      path: '/profile', 
      color: '#10b981' 
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <Paper 
      elevation={8}
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1100,
        display: { xs: 'block', md: 'none' },
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        boxShadow: '0 -2px 12px rgba(0,0,0,0.08)',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(0,0,0,0.05)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          height: 64,
          px: 1,
          position: 'relative',
        }}
      >
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          
          return (
            <Box
              key={item.path}
              onClick={() => navigate(item.path)}
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                py: 1,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:active': {
                  transform: 'scale(0.9)',
                },
              }}
            >
              {/* Active indicator background */}
              {active && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 52,
                    height: 52,
                    borderRadius: '12px',
                    background: alpha(item.color, 0.12),
                    animation: 'scaleIn 0.2s ease-out',
                  }}
                />
              )}

              {/* Icon with badge */}
              <Box
                sx={{
                  position: 'relative',
                  mb: 0.5,
                  transition: 'transform 0.3s ease',
                  transform: active ? 'translateY(-2px)' : 'none',
                }}
              >
                {item.badge ? (
                  <Badge 
                    badgeContent={item.badge} 
                    color="error"
                    sx={{
                      '& .MuiBadge-badge': {
                        fontSize: '0.625rem',
                        height: 16,
                        minWidth: 16,
                        fontWeight: 700,
                        top: -2,
                        right: -2,
                      }
                    }}
                  >
                    <Icon 
                      sx={{ 
                        fontSize: 26,
                        color: active ? item.color : 'text.secondary',
                        transition: 'all 0.3s ease',
                      }} 
                    />
                  </Badge>
                ) : (
                  <Icon 
                    sx={{ 
                      fontSize: 26,
                      color: active ? item.color : 'text.secondary',
                      transition: 'all 0.3s ease',
                    }} 
                  />
                )}
              </Box>

              {/* Label */}
              <Box
                component="span"
                sx={{
                  fontSize: '0.688rem',
                  fontWeight: active ? 700 : 500,
                  color: active ? item.color : 'text.secondary',
                  transition: 'all 0.3s ease',
                  letterSpacing: '-0.2px',
                }}
              >
                {item.label}
              </Box>

              {/* Active indicator dot */}
              {active && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 6,
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    bgcolor: item.color,
                    animation: 'scaleIn 0.2s ease-out',
                  }}
                />
              )}
            </Box>
          );
        })}
      </Box>

      {/* Gesture indicator for iOS */}
      <Box
        sx={{
          display: { xs: 'block', sm: 'none' },
          height: 'env(safe-area-inset-bottom, 0)',
          minHeight: 0,
        }}
      />
    </Paper>
  );
}

