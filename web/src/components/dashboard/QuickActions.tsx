import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
} from '@mui/material';
import BookIcon from '@mui/icons-material/Book';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import HistoryIcon from '@mui/icons-material/History';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import AnalyticsIcon from '@mui/icons-material/Analytics';

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: <BookIcon sx={{ fontSize: 40 }} />,
      title: 'Quick Book',
      description: 'Find and book a seat',
      color: '#1976d2',
      route: '/libraries',
    },
    {
      icon: <LibraryBooksIcon sx={{ fontSize: 40 }} />,
      title: 'View Libraries',
      description: 'Browse all libraries',
      color: '#2e7d32',
      route: '/libraries',
    },
    {
      icon: <HistoryIcon sx={{ fontSize: 40 }} />,
      title: 'My Bookings',
      description: 'View your bookings',
      color: '#ed6c02',
      route: '/bookings',
    },
    {
      icon: <PersonIcon sx={{ fontSize: 40 }} />,
      title: 'Profile',
      description: 'Manage your account',
      color: '#9c27b0',
      route: '/profile',
    },
    {
      icon: <AddIcon sx={{ fontSize: 40 }} />,
      title: 'Add Library',
      description: 'List your library',
      color: '#d32f2f',
      route: '/libraries/create',
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 40 }} />,
      title: 'Analytics',
      description: 'View insights',
      color: '#0288d1',
      route: '/admin/analytics',
    },
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
          {actions.map((action, index) => (
            <Box key={index} sx={{ flex: '1 1 150px', minWidth: 150 }}>
              <Button
                fullWidth
                onClick={() => navigate(action.route)}
                sx={{
                  height: '100px',
                  flexDirection: 'column',
                  gap: 1,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    transition: 'transform 0.2s',
                  },
                }}
                aria-label={action.title}
              >
                <Box sx={{ color: action.color }}>
                  {action.icon}
                </Box>
                <Typography variant="caption" sx={{ color: 'text.primary' }}>
                  {action.title}
                </Typography>
              </Button>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default QuickActions;


